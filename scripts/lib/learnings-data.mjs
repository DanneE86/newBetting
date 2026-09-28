// Laddar all matchhistorik med odds for lardomsanalysen (scripts/analyze-learnings.mjs).
// Kallor: data/raw/hist (2017/18-2023/24, npm run history), data/raw/<liga>_<sasong>.csv (fd-main),
// data/raw/<liga>_all.csv (fd-new: bara slutodds), Understat-xG (topp 5), Stryktipsets/Europatipsets backtest.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nameScore } from './match-context.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAW = path.join(root, 'data', 'raw');
const OPEN = path.join(root, 'data', 'open');
export const MAIN = ['PL', 'CH', 'EL1', 'EL2', 'BL', 'BL2', 'LL', 'LL2', 'SA', 'SB', 'L1', 'ED', 'PT', 'GR'];
export const NEW = ['AS', 'NO', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'BR', 'AR'];
export const UNDERSTAT = ['PL', 'LL', 'SA', 'BL', 'L1'];
export const LEAGUE_NAMES = {
  PL: 'Premier League', CH: 'Championship', EL1: 'League One', EL2: 'League Two', BL: 'Bundesliga', BL2: '2. Bundesliga',
  LL: 'La Liga', LL2: 'LaLiga 2', SA: 'Serie A', SB: 'Serie B', L1: 'Ligue 1', ED: 'Eredivisie', PT: 'Primeira Liga',
  GR: 'Super League (Grekland)', AS: 'Allsvenskan', NO: 'Eliteserien', DK: 'Superligaen', EK: 'Ekstraklasa', JP1: 'J1 League',
  MLS: 'MLS', MX: 'Liga MX', BR: 'Brasileirão Série A', AR: 'Liga Profesional',
};
// Svenska Spels liganamn -> vara koder (klubbligor med historik)
export const POOL_LEAGUES = {
  'Premier League': 'PL', Championship: 'CH', 'League One': 'EL1', 'League Two': 'EL2', Bundesliga: 'BL', '2. Bundesliga': 'BL2',
  'La Liga': 'LL', 'La Liga 2': 'LL2', 'Serie A': 'SA', 'Serie B': 'SB', 'Ligue 1': 'L1', Eredivisie: 'ED', 'Primeira Liga': 'PT',
  'Super League 1': 'GR', Allsvenskan: 'AS', Eliteserien: 'NO', Superligan: 'DK',
};

function parseCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const head = lines[0].split(',');
  return lines.slice(1).map((l) => {
    const c = l.split(',');
    return Object.fromEntries(head.map((h, i) => [h, c[i] ?? '']));
  });
}

function isoDate(d) {
  const [dd, mm, yy] = d.split('/');
  if (!yy) return null;
  const y = yy.length === 2 ? `20${yy}` : yy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

const num = (x) => (x === '' || x == null ? NaN : Number(x));
function devig(h, d, a) {
  const o = [num(h), num(d), num(a)];
  if (!o.every((x) => Number.isFinite(x) && x > 1)) return null;
  const inv = o.map((x) => 1 / x);
  const s = inv[0] + inv[1] + inv[2];
  if (s < 0.95 || s > 1.35) return null;
  return inv.map((x) => x / s);
}

function devig2(a, b) {
  const o = [num(a), num(b)];
  if (!o.every((x) => Number.isFinite(x) && x > 1)) return null;
  const s = 1 / o[0] + 1 / o[1];
  return s < 0.97 || s > 1.25 ? null : [1 / o[0] / s, 1 / o[1] / s];
}

function seasonLabel(code) {
  return `20${code.slice(0, 2)}/${code.slice(2)}`;
}

function normSeason(s) {
  const m = String(s).match(/^(\d{4})\/(\d{4})$/);
  return m ? `${m[1]}/${m[2].slice(2)}` : String(s);
}

function row(league, season, r, date, home, away, hg, ag) {
  const res = hg > ag ? 'H' : hg < ag ? 'A' : 'D';
  // Oppning: Pinnacle, annars snitt, annars Bet365. Slut: Pinnacle closing, annars snitt closing.
  const open = devig(r.PSH, r.PSD, r.PSA) ?? devig(r.AvgH, r.AvgD, r.AvgA) ?? devig(r.BbAvH, r.BbAvD, r.BbAvA) ?? devig(r.B365H, r.B365D, r.B365A);
  const pinClose = devig(r.PSCH, r.PSCD, r.PSCA);
  const avgClose = devig(r.AvgCH, r.AvgCD, r.AvgCA);
  const closeTrue = pinClose ?? avgClose;
  const odds3 = (h, d, a) => { const o = [num(h), num(d), num(a)]; return o.every((x) => Number.isFinite(x) && x > 1) ? o : null; };
  const ou = (o, u) => { const p = devig2(o, u); return p ? p[0] : null; };
  return {
    league, season, date, home, away, hg, ag, res,
    hs: num(r.HS), as: num(r.AS), hst: num(r.HST), ast: num(r.AST),
    open, close: closeTrue ?? open, hasClose: !!closeTrue,
    // Pinnacle mot bolagssnitt vid stangning (oenighet), basta pris, over 2,5 mal (sannolikhet)
    pinClose, avgClose,
    bestOpen: odds3(r.MaxH, r.MaxD, r.MaxA) ?? odds3(r.BbMxH, r.BbMxD, r.BbMxA),
    bestClose: odds3(r.MaxCH, r.MaxCD, r.MaxCA),
    avgOpenOdds: odds3(r.AvgH, r.AvgD, r.AvgA) ?? odds3(r.BbAvH, r.BbAvD, r.BbAvA),
    overOpen: ou(r['P>2.5'], r['P<2.5']) ?? ou(r['Avg>2.5'], r['Avg<2.5']) ?? ou(r['BbAv>2.5'], r['BbAv<2.5']),
    overClose: ou(r['PC>2.5'], r['PC<2.5']) ?? ou(r['AvgC>2.5'], r['AvgC<2.5']),
  };
}

/** Alla ligamatcher med odds, sorterade pa datum. */
export function loadMatches() {
  const out = [];
  const seen = new Set();
  const add = (m) => {
    if (!m.date || !m.home || !m.away || !Number.isFinite(m.hg) || !Number.isFinite(m.ag)) return;
    const k = `${m.league}|${m.date}|${m.home}|${m.away}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(m);
  };
  const files = [
    ...fs.readdirSync(path.join(RAW, 'hist')).map((f) => path.join(RAW, 'hist', f)),
    ...fs.readdirSync(RAW).filter((f) => /^[A-Z0-9]+_\d{4}\.csv$/.test(f)).map((f) => path.join(RAW, f)),
  ];
  for (const file of files) {
    const [league, code] = path.basename(file, '.csv').split('_');
    if (!MAIN.includes(league)) continue;
    for (const r of parseCsv(file)) {
      add(row(league, seasonLabel(code), r, isoDate(r.Date ?? ''), r.HomeTeam, r.AwayTeam, num(r.FTHG), num(r.FTAG)));
    }
  }
  for (const league of NEW) {
    const file = path.join(RAW, `${league}_all.csv`);
    if (!fs.existsSync(file)) continue;
    for (const r of parseCsv(file)) {
      add(row(league, normSeason(r.Season), r, isoDate(r.Date ?? ''), r.Home, r.Away, num(r.HG), num(r.AG)));
    }
  }
  return out.filter((m) => m.close).sort((a, b) => a.date.localeCompare(b.date) || a.home.localeCompare(b.home));
}

let usDoc;
function leagueMatchesDoc() {
  if (usDoc === undefined) {
    try { usDoc = JSON.parse(fs.readFileSync(path.join(OPEN, 'understat_league_matches.json'), 'utf8')); } catch { usDoc = null; }
  }
  return usDoc;
}

/** Understat-xG (topp 5) pa matcherna: m.hxg/m.axg. Lagnamn mappas med rostning over sasongerna. */
export function attachXg(matches) {
  const stats = {};
  for (const league of UNDERSTAT) {
    const lm = matches.filter((m) => m.league === league);
    const byDate = new Map();
    for (const m of lm) (byDate.get(m.date) ?? byDate.set(m.date, []).get(m.date)).push(m);
    const us = [];
    for (const f of fs.readdirSync(OPEN).filter((x) => x.startsWith(`understat_xg_${league}_`) && /_\d{4}\.json$/.test(x))) {
      us.push(...JSON.parse(fs.readFileSync(path.join(OPEN, f), 'utf8')));
    }
    // Pagaende sasong (cachas inte som fil forran den ar klar): pro-lagrets Understat-hamtning
    for (const s of Object.values(leagueMatchesDoc()?.seasons ?? {})) {
      if (s.league !== league) continue;
      for (const m of s.matches ?? []) if (Number.isFinite(m.hxG)) us.push({ date: m.date, home: m.home, away: m.away, hxg: m.hxG, axg: m.axG });
    }
    const near = (u) => [-1, 0, 1].flatMap((o) => byDate.get(new Date(Date.parse(u.date) + o * 864e5).toISOString().slice(0, 10)) ?? []);
    // Pass 1: roster pa namnpar fran tydliga traffar
    const votes = new Map();
    for (const u of us) {
      let best = null;
      for (const m of near(u)) {
        const s = nameScore(m.home, null, u.home) + nameScore(m.away, null, u.away);
        if (s >= 1 && (!best || s > best.s)) best = { s, m };
      }
      if (!best) continue;
      for (const [a, b] of [[u.home, best.m.home], [u.away, best.m.away]]) {
        const v = votes.get(a) ?? votes.set(a, new Map()).get(a);
        v.set(b, (v.get(b) ?? 0) + 1);
      }
    }
    const map = new Map([...votes].map(([a, v]) => [a, [...v].sort((x, y) => y[1] - x[1])[0]]).filter(([, [, n]]) => n >= 3).map(([a, [b]]) => [a, b]));
    // Pass 2: exakt via namnkartan
    let hit = 0;
    for (const u of us) {
      const h = map.get(u.home);
      const a = map.get(u.away);
      const m = near(u).find((x) => x.home === h && x.away === a);
      if (m && m.hxg == null) { m.hxg = u.hxg; m.axg = u.axg; hit++; }
    }
    stats[league] = { understat: us.length, matched: hit, matches: lm.length };
  }
  return stats;
}

/** Skott-proxy for xG dar Understat saknas: mal ~ a*(skott utanfor mal) + b*(skott pa mal), anpassat per liga. */
export function attachShotXg(matches) {
  const coef = {};
  const byLeague = new Map();
  for (const m of matches) if (Number.isFinite(m.hst) && Number.isFinite(m.hs) && m.hs >= m.hst) (byLeague.get(m.league) ?? byLeague.set(m.league, []).get(m.league)).push(m);
  for (const [league, list] of byLeague) {
    if (list.length < 500) continue;
    // Minsta kvadrat utan intercept pa bada lagens rader
    let sxx = 0, sxy = 0, syy = 0, sx1 = 0, sy1 = 0;
    for (const m of list) {
      for (const [sh, sot, g] of [[m.hs, m.hst, m.hg], [m.as, m.ast, m.ag]]) {
        const x = sh - sot;
        sxx += x * x; sxy += x * sot; syy += sot * sot; sx1 += x * g; sy1 += sot * g;
      }
    }
    const det = sxx * syy - sxy * sxy;
    const a = (sx1 * syy - sy1 * sxy) / det;
    const b = (sy1 * sxx - sx1 * sxy) / det;
    coef[league] = { off: a, on: b, n: list.length };
    for (const m of list) {
      if (m.hxg != null) continue;
      m.sxg = [a * (m.hs - m.hst) + b * m.hst, a * (m.as - m.ast) + b * m.ast];
    }
  }
  return coef;
}

/** Stryktipsets och Europatipsets backtestmatcher (unika per datum och match). */
export function loadPoolMatches() {
  const files = [
    ['stryktipset', 'data/stryktips-backtest-2526-steg3.json'],
    ['stryktipset', 'data/stryktips-backtest.json'],
    ['europatipset', 'data/europatips-backtest-2526.json'],
  ];
  const out = [];
  const seen = new Set();
  for (const [product, f] of files) {
    const file = path.join(root, f);
    if (!fs.existsSync(file)) continue;
    for (const d of JSON.parse(fs.readFileSync(file, 'utf8')).draws ?? []) {
      for (const m of d.matches ?? []) {
        const k = `${product}|${d.drawNumber}|${m.n}`;
        if (seen.has(k) || !m.final || !m.folk || !m.outcome) continue;
        seen.add(k);
        const [home, away] = m.match.split(' - ');
        out.push({ product, draw: d.drawNumber, date: d.date, ...m, home, away, code: POOL_LEAGUES[m.league] ?? null });
      }
    }
  }
  return out;
}
