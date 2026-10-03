// Vanliga missar: vilka matchtyper systemets grundrad (kupong A) missar i kupongarkivet (data/tips-archive/systems).
// En miss = utfallet låg utanför tecknen i grundraden, alltså en match där 13 rätt krävde tur.
// Grupper: spik/halvgardering x tecken x favoritens chans (vår procent), samt spikar per liga.
// Resultatet läggs i data/stryktipset.json (missProfile) och visas på Stryktipset/Europatipset A och B.
//   node scripts/lib/stryk-miss-profile.mjs   (bygger om profilen och uppdaterar data/stryktipset.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SIGNS = ['1', 'X', '2'];
// Favoritens chans delas i band. Samma gränser används i webben (stryktips.js) för att slå upp en match.
export const BAND_EDGES = [0.45, 0.55, 0.65, 0.75];
const BAND_LABELS = ['under 45 %', '45–55 %', '55–65 %', '65–75 %', 'minst 75 %'];
export const bandOf = (fav) => BAND_EDGES.filter((x) => fav >= x).length;
export const pickType = (signs) => (signs.length === 1 ? 'spik' : signs.length === 2 ? 'halv' : 'hel');
export const groupKey = (signs, fav) => `${pickType(signs)}|${signs}|${bandOf(fav)}`;

function groupLabel(signs, band) {
  const favTxt = signs === '1' ? 'hemmafavorit' : signs === '2' ? 'bortafavorit' : 'favorit';
  const type = signs.length === 1 ? `Spik ${signs}` : `Halvgardering ${signs.split('').join('')}`;
  return `${type} · ${favTxt} ${BAND_LABELS[band]}`;
}

const empty = () => ({ n: 0, miss: 0, exp: 0, by: { 1: 0, X: 0, 2: 0 } });
const r3 = (x) => Math.round(x * 1000) / 1000;

// Stryktipset: bara de engelska ligorna (användarens val 2026-09-30), bara Stryktipsets egna omgångar
export const STRYK_LEAGUES = ['Premier League', 'Championship', 'League One'];

// opts.product = filprefix i arkivet (t.ex. 'stryktipset'), opts.leagues = bara matcher från dessa ligor
export function buildMissProfile(dir = path.join(root, 'data', 'tips-archive', 'systems'), opts = {}) {
  const only = opts.leagues ? new Set(opts.leagues) : null;
  if (!fs.existsSync(dir)) return null;
  const groups = {}, leagues = {}, leaguePicks = {}; // leaguePicks: liga -> tipset (1, X, 2, 1X, X2, 12)
  const perDraw = [];
  let from = null, to = null, matches = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json') && (!opts.product || x.startsWith(`${opts.product}-`)))) {
    let d;
    try {
      d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    } catch {
      continue;
    }
    const picks = d.A?.picks;
    if (!picks || !d.matches?.length || !d.outcomes) continue;
    const day = (d.closeTime || '').slice(0, 10);
    if (day && (!from || day < from)) from = day;
    if (day && (!to || day > to)) to = day;
    let outside = 0;
    d.matches.forEach((m, i) => {
      const pick = picks[i];
      if (!pick || !m.outcome || !m.final) return;
      if (only && !only.has(m.league)) return;
      matches++;
      const fav = Math.max(...m.final);
      const exp = 1 - [...pick].reduce((s, c) => s + m.final[SIGNS.indexOf(c)], 0);
      const miss = !pick.includes(m.outcome);
      if (miss) outside++;
      const add = (bucket, key) => {
        const g = (bucket[key] ||= empty());
        g.n++;
        g.exp += exp;
        if (miss) { g.miss++; g.by[m.outcome]++; }
      };
      if (pick.length < 3) add(groups, groupKey(pick, fav));
      if (pick.length === 1 && m.league) add(leagues, m.league);
      if (pick.length < 3 && m.league) add((leaguePicks[m.league] ||= {}), [...pick].sort((a, b) => SIGNS.indexOf(a) - SIGNS.indexOf(b)).join(''));
    });
    perDraw.push(outside);
  }
  if (!perDraw.length) return null;
  const finish = (g) => ({ ...g, rate: r3(g.miss / g.n), exp: r3(g.exp / g.n) });
  const out = {};
  for (const [k, g] of Object.entries(groups)) {
    const [, signs, band] = k.split('|');
    out[k] = { ...finish(g), label: groupLabel(signs, Number(band)) };
  }
  const lg = {};
  for (const [k, g] of Object.entries(leagues)) if (g.n >= 25) lg[k] = finish(g);
  const dist = [0, 0, 0, 0];
  for (const x of perDraw) dist[Math.min(3, x)]++;
  return {
    builtAt: new Date().toISOString(),
    from, to, draws: perDraw.length, matches, leaguesOnly: opts.leagues || null,
    bandEdges: BAND_EDGES, minN: 25,
    avgOutside: r3(perDraw.reduce((s, x) => s + x, 0) / perDraw.length),
    outsideDist: dist, // antal omgångar med 0, 1, 2 och minst 3 utfall utanför grundraden
    groups: out,
    leaguePicks: Object.fromEntries(Object.entries(leaguePicks).map(([l, ps]) => [l, Object.fromEntries(Object.entries(ps).map(([k, g]) => [k, finish(g)]))])),
    leagues: lg,
  };
}

// ---------- Missar per system (A, B, C) ur bakkörningen ----------
// Användaren 2026-10-03: "markera dom matcher i dessa system du brukar ha fel på". B och C är nya (risk/skräll) och har ingen
// sparad historik, så profilen byggs ur bakkörningen av de nuvarande systemen (scripts/backtest-stryktipset.mjs, samma kod som
// kupongerna). Grupper som ovan (spik/halvgardering x tecken x favoritens chans); spik eller halvgardering utan favoriten är
// en skräll och samlas i 'skrall|spik' / 'skrall|halv' (B och C har alltid en skrällspik).
export const SYSTEM_BACKTESTS = ['stryktips-backtest-2324-riskC.json', 'stryktips-backtest-2425-riskC.json', 'stryktips-backtest-budget-riskC.json'];
export const sysGroupKey = (signs, final) => {
  const fav = Math.max(...final);
  const favSign = SIGNS[final.indexOf(fav)];
  return signs.includes(favSign) ? groupKey(signs, fav) : `skrall|${pickType(signs)}`;
};
export function buildSystemMissProfiles(files = SYSTEM_BACKTESTS, { dir = path.join(root, 'data'), leagues = STRYK_LEAGUES } = {}) {
  const only = leagues ? new Set(leagues) : null;
  const acc = { A: {}, B: {}, C: {} };
  let draws = 0, from = null, to = null;
  for (const f of files) {
    const file = path.join(dir, f);
    if (!fs.existsSync(file)) continue;
    let doc;
    try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    for (const d of doc.draws || []) {
      draws++;
      if (!from || d.date < from) from = d.date;
      if (!to || d.date > to) to = d.date;
      d.matches.forEach((m, i) => {
        if (!m.outcome || !m.final || (only && !only.has(m.league))) return;
        const picks = { A: m.pickA, B: m.pickB, C: d.C?.picks?.[i] };
        for (const [sys, pick] of Object.entries(picks)) {
          if (!pick || pick.length === 3) continue;
          const g = (acc[sys][sysGroupKey(pick, m.final)] ||= empty());
          g.n++;
          g.exp += 1 - [...pick].reduce((t, c) => t + m.final[SIGNS.indexOf(c)], 0);
          if (!pick.includes(m.outcome)) { g.miss++; g.by[m.outcome]++; }
        }
      });
    }
  }
  if (!draws) return null;
  const label = (k) => {
    const [type, signs, band] = k.split('|');
    return type === 'skrall' ? (signs === 'spik' ? 'Skrällspik (inte favoriten)' : 'Halvgardering utan favoriten') : groupLabel(signs, Number(band));
  };
  const systems = {};
  for (const [sys, groups] of Object.entries(acc)) {
    systems[sys] = Object.fromEntries(Object.entries(groups).map(([k, g]) => [k, { ...g, rate: r3(g.miss / g.n), exp: r3(g.exp / g.n), label: label(k) }]));
  }
  return { builtAt: new Date().toISOString(), source: files, from, to, draws, leaguesOnly: leagues || null, bandEdges: BAND_EDGES, minN: 15, systems };
}

// Kör direkt: bygg om profilen och lägg in den i data/stryktipset.json
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prof = buildMissProfile();
  const file = path.join(root, 'data', 'stryktipset.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  data.missProfile = prof;
  data.missProfileStryk = buildMissProfile(undefined, { product: 'stryktipset', leagues: STRYK_LEAGUES });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Vanliga missar: ${prof.draws} omgångar, ${prof.matches} matcher, snitt ${prof.avgOutside} utfall utanför grundraden -> data/stryktipset.json`);
}
