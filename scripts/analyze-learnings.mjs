// Lardomar per liga och lag: vilka signaler slar marknaden (stangningsodds) och vilka ar redan inprisade?
// Signaler (bara data fore matchen): xG-tur (poang - xP), xG-form mot malform, form mot marknaden,
// inbordes moten, nyckelspelare borta (Understat, topp 5), vila, sasongsfas, uppflyttade lag.
// Varje signal testas mot resultatet minus marknadens forvantan. Tranas pa sasonger fore 2023/24 och
// kontrolleras pa 2023/24 och senare. Dessutom Stryktipsets/Europatipsets streck och utfall per liga och lag.
// Utdata: data/lardomar.json + docs/lardomar/ (README, ligor/<liga>.md, lag/<liga>/<lag>.md)
//   npm run history   (en gang: aldre sasonger + xG)
//   npm run lardomar
import fs from 'node:fs';
import path from 'node:path';
import {
  LEAGUE_NAMES, MAIN, NEW, UNDERSTAT, attachXg, loadMatches, loadPoolMatches, root,
} from './lib/learnings-data.mjs';
import { nameScore } from './lib/match-context.mjs';
import { ownStyleLabels, styleSummary } from './lib/team-style.mjs';
import { ALTITUDE, HIGH, MIN_DIFF, altitudeOf, altitudeStats, hardestAtAltitude } from './lib/altitude.mjs';
import { teamShares } from './pro/players.mjs';
import { FORM_N, H2H_YEARS, afterBreakKeys, avg, buildSignals, expPts, hardOpponents, pairKey, pts, teamKey, xPts } from './lib/learnings-signals.mjs';

const SPLIT = '2023-07-01'; // trana fore, kontrollera efter
const OUT_JSON = path.join(root, 'data', 'lardomar.json');
const DOCS = path.join(root, 'docs', 'lardomar');
const today = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- statistik
function ols(pairs) {
  const n = pairs.length;
  if (n < 30) return null;
  let sx = 0, sy = 0;
  for (const [x, y] of pairs) { sx += x; sy += y; }
  const mx = sx / n, my = sy / n;
  let sxx = 0, sxy = 0;
  for (const [x, y] of pairs) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); }
  if (sxx <= 0) return null;
  const slope = sxy / sxx;
  let sse = 0;
  for (const [x, y] of pairs) sse += (y - my - slope * (x - mx)) ** 2;
  const se = Math.sqrt(sse / (n - 2) / sxx);
  const xs = pairs.map((p) => p[0]).sort((a, b) => a - b);
  const spread = xs[Math.floor(0.9 * (n - 1))] - xs[Math.floor(0.1 * (n - 1))];
  // effekt = skillnad i forvantade poang (hemmalaget) mellan en stark (p90) och svag (p10) signal
  return { n, slope: r4(slope), se: r4(se), z: r2(slope / se), effect: r3(slope * spread) };
}

function meanTest(values) {
  const n = values.length;
  if (n < 20) return null;
  const m = values.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(values.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1));
  return { n, mean: r4(m), se: r4(sd / Math.sqrt(n)), z: r2(m / (sd / Math.sqrt(n))) };
}

const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const r4 = (x) => Math.round(x * 10000) / 10000;
const pct = (x, d = 1) => `${(x * 100).toFixed(d).replace('.', ',')} %`;
const fmt = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : x.toFixed(d).replace('.', ',').replace(/^-/, '−'));
const signed = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : `${x > 0 ? '+' : ''}${fmt(x, d)}`);
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');


// ---------------------------------------------------------------- data + signaler
const { matches, teamState, h2hState, seasonTeams, seasonsByLeague, proxy, xgStats, playerModel } = buildSignals();
console.log(`  ${matches.length} matcher, xG-proxy ${fmt(proxy.off, 3)}/skott utanför + ${fmt(proxy.on, 3)}/skott på mål (n=${proxy.n})`);


// ---------------------------------------------------------------- tester
const SIGNALS = {
  luck: { name: 'xG-tur (poäng − xP, senaste 8)', target: 'y', expect: 'Negativ = lag med tur överskattas' },
  gap: { name: 'xG-form mot målform (xGD − GD, senaste 8)', target: 'y', expect: 'Positiv = underliggande form undervärderas' },
  mres: { name: 'Form mot marknaden (poäng − förväntat, senaste 8)', target: 'y', expect: 'Positiv = marknaden hänger efter' },
  h2hRes: { name: 'Inbördes möten mot marknaden (≥ 3 möten, 8 år)', target: 'y', expect: 'Positiv = matchup-fördel som marknaden missar' },
  h2hPts: { name: 'Inbördes möten, poängskillnad', target: 'y', expect: 'Positiv = marknaden underskattar historiken' },
  h2hDraw: { name: 'Inbördes möten, kryss mot förväntat', target: 'yD', expect: 'Positiv = kryss-par' },
  rest: { name: 'Vilodagar (hemma − borta, ligamatcher)', target: 'y', expect: 'Positiv = vila undervärderas' },
  miss: { name: 'Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–)', target: 'y', expect: 'Negativ = frånvaro inte fullt inprisad', split: '2025-07-01' },
  steam: { name: 'Oddsrörelse öppning → stängning (förväntade poäng)', target: 'y', expect: 'Positiv = marknaden underreagerar på rörelser' },
  book: { name: 'Bolagssnitt mot Pinnacle vid stängning', target: 'y', expect: 'Positiv = de mjuka bolagen vet något' },
  under: { name: 'Under 2,5 mål (O/U-marknaden) mot kryss', target: 'yD', expect: 'Positiv = kryss underprisat i lågmålsmatcher' },
};

function testSignal(list, key, target, split = SPLIT) {
  const rows = list.filter((m) => m.f[key] != null && Number.isFinite(m[target]));
  const pair = (ms, t = target) => ms.filter((m) => Number.isFinite(m[t])).map((m) => [m.f[key], m[t]]);
  const train = rows.filter((m) => m.date < split);
  const test = rows.filter((m) => m.date >= split);
  const out = { all: ols(pair(rows)), train: ols(pair(train)), test: ols(pair(test)), split };
  if (target === 'y' && !['steam', 'book'].includes(key)) {
    out.open = ols(pair(rows, 'yo'));
    out.move = ols(pair(rows, 'mv'));
  }
  out.verdict = verdict(out);
  return out;
}

function verdict(t) {
  const a = t.all;
  if (!a) return 'för lite data';
  if (t.train && t.test && Math.abs(t.train.z) >= 2.5 && Math.abs(t.test.z) >= 2 && Math.sign(t.train.slope) === Math.sign(t.test.slope)) return 'bekräftad';
  if (!t.train && t.test && Math.abs(t.test.z) >= 3) return 'bekräftad (bara ny data)';
  if (Math.abs(a.z) >= 2.5) return 'svag signal';
  if (t.open && Math.abs(t.open.z) >= 3 && Math.abs(a.z) < 2) return 'bara mot öppningsodds';
  return 'ingen effekt';
}

// Situationer: medelresidual i en delmangd
// flip: tal eller funktion (m) => tecken, sa att vardet raknas fran ratt lags perspektiv
function situation(list, pred, target = 'y', flip = false) {
  const sign = (m) => (typeof flip === 'function' ? flip(m) : flip ? -1 : 1);
  const rows = list.filter(pred).filter((m) => Number.isFinite(m[target]));
  const vals = (ms) => ms.map((m) => sign(m) * m[target]);
  return { all: meanTest(vals(rows)), train: meanTest(vals(rows.filter((m) => m.date < SPLIT))), test: meanTest(vals(rows.filter((m) => m.date >= SPLIT))) };
}

function sitVerdict(s) {
  if (!s.all) return 'för lite data';
  if (s.train && s.test && Math.abs(s.train.z) >= 2.5 && Math.abs(s.test.z) >= 2 && Math.sign(s.train.mean) === Math.sign(s.test.mean)) return 'bekräftad';
  if (Math.abs(s.all.z) >= 2.5) return 'svag signal';
  return 'ingen effekt';
}

function calibration(list) {
  const res = {};
  const ll = (p, r) => -Math.log(p[r === 'H' ? 0 : r === 'D' ? 1 : 2]);
  res.n = list.length;
  res.seasons = [...new Set(list.map((m) => m.season))].sort();
  res.home = avg(list.map((m) => (m.res === 'H' ? 1 : 0)));
  res.draw = avg(list.map((m) => (m.res === 'D' ? 1 : 0)));
  res.away = avg(list.map((m) => (m.res === 'A' ? 1 : 0)));
  res.impHome = avg(list.map((m) => m.close[0]));
  res.impDraw = avg(list.map((m) => m.close[1]));
  res.impAway = avg(list.map((m) => m.close[2]));
  res.goals = avg(list.map((m) => m.hg + m.ag));
  res.over25 = avg(list.map((m) => (m.hg + m.ag > 2 ? 1 : 0)));
  res.btts = avg(list.map((m) => (m.hg > 0 && m.ag > 0 ? 1 : 0)));
  const both = list.filter((m) => m.open && m.hasClose);
  res.llClose = both.length ? avg(both.map((m) => ll(m.close, m.res))) : avg(list.map((m) => ll(m.close, m.res)));
  res.llOpen = both.length ? avg(both.map((m) => ll(m.open, m.res))) : null;
  res.nOpenClose = both.length;
  res.homeRes = situation(list, () => true);
  res.drawRes = situation(list, () => true, 'yD');
  // Kryss efter jamnhet
  res.drawBuckets = [[0, 0.15, 'jämn (|P1−P2| < 15 %)'], [0.15, 0.35, 'mellan'], [0.35, 1, 'klar favorit (> 35 %)']].map(([lo, hi, label]) => {
    const rows = list.filter((m) => Math.abs(m.close[0] - m.close[2]) >= lo && Math.abs(m.close[0] - m.close[2]) < hi);
    const s = situation(rows, () => true, 'yD');
    return { label, n: rows.length, actual: avg(rows.map((m) => (m.res === 'D' ? 1 : 0))), implied: avg(rows.map((m) => m.close[1])), ...s, verdict: sitVerdict(s) };
  });
  // Favorit-longshot: favoritens vinstandel mot implicerad
  res.favBuckets = [[0.33, 0.45], [0.45, 0.55], [0.55, 0.65], [0.65, 0.75], [0.75, 1]].map(([lo, hi]) => {
    const rows = list.filter((m) => { const f = Math.max(m.close[0], m.close[2]); return f >= lo && f < hi; });
    rows.forEach((m) => { const hf = m.close[0] >= m.close[2]; m._fav = (hf ? m.res === 'H' : m.res === 'A') ? 1 : 0; m._favP = hf ? m.close[0] : m.close[2]; m._favRes = m._fav - m._favP; });
    const s = situation(rows, () => true, '_favRes');
    return { label: `${Math.round(lo * 100)}–${Math.round(hi * 100)} %`, n: rows.length, actual: avg(rows.map((m) => m._fav)), implied: avg(rows.map((m) => m._favP)), ...s, verdict: sitVerdict(s) };
  });
  return res;
}

function situations(list) {
  const defs = {
    early: ['Omgång 1–5 (hemmalagets poäng mot marknaden)', (m) => m.f.early, 'y'],
    late: ['Sista 4 omgångarna (hemmalagets poäng)', (m) => m.f.late, 'y'],
    lateDraw: ['Sista 4 omgångarna (kryss mot förväntat)', (m) => m.f.late, 'yD'],
    promoted: ['Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden)', (m) => m.f.promo !== 0, 'y', (m) => m.f.promo],
    relegated: ['Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden)', (m) => m.f.releg !== 0, 'y', (m) => m.f.releg],
    shortRest: ['Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6', (m) => m.f.rest != null && m.f.rest <= -3, 'y'],
    keyOutHome: ['Hemmalaget saknar ≥ 25 % av anfallet (xG+xA)', (m) => m.f.missH >= 0.25 && m.f.missA < 0.1, 'y'],
    keyOutAway: ['Bortalaget saknar ≥ 25 % av anfallet (hemmalagets poäng)', (m) => m.f.missA >= 0.25 && m.f.missH < 0.1, 'y'],
  };
  const out = {};
  for (const [k, [name, pred, target, flip]] of Object.entries(defs)) {
    const s = situation(list, pred, target, flip);
    if (s.all) out[k] = { name, ...s, verdict: sitVerdict(s) };
  }
  // Nyckelspelare: mot oppning och rorelse (marknaden lar sig av elvan)
  const ko = list.filter((m) => m.f.missH >= 0.25 && m.f.missA < 0.1);
  if (ko.length >= 20) {
    out.keyOutHome.open = meanTest(ko.filter((m) => Number.isFinite(m.yo)).map((m) => m.yo));
    out.keyOutHome.move = meanTest(ko.filter((m) => Number.isFinite(m.mv)).map((m) => m.mv));
  }
  return out;
}

// Persistens: lagets residual mot marknaden en sasong -> nasta (finns det lag som marknaden systematiskt felvarderar?)
function persistence(list) {
  const byTeamSeason = new Map();
  for (const m of list) {
    for (const [t, r, home] of [[m.home, m.y, true], [m.away, -m.y, false]]) {
      const k = `${t}|${m.season}`;
      const e = byTeamSeason.get(k) ?? byTeamSeason.set(k, { all: [], home: [], away: [] }).get(k);
      e.all.push(r);
      (home ? e.home : e.away).push(r);
    }
  }
  const seasons = [...new Set(list.map((m) => m.season))].sort();
  const pairsAll = [], pairsHa = [];
  for (const [k, v] of byTeamSeason) {
    const [t, s] = k.split('|');
    const next = byTeamSeason.get(`${t}|${seasons[seasons.indexOf(s) + 1]}`);
    if (!next || v.all.length < 15 || next.all.length < 15) continue;
    pairsAll.push([avg(v.all), avg(next.all)]);
    if (v.home.length >= 8 && v.away.length >= 8 && next.home.length >= 8 && next.away.length >= 8) pairsHa.push([avg(v.home) - avg(v.away), avg(next.home) - avg(next.away)]);
  }
  return { team: ols(pairsAll), homeEdge: ols(pairsHa) };
}

// ---------------------------------------------------------------- Stryktipset / Europatipset
const pool = loadPoolMatches();
const SIGN = { 1: 0, X: 1, 2: 2 };
function poolStats(list) {
  if (list.length < 5) return null;
  const ll = (p, o) => -Math.log(Math.max(1e-6, p[SIGN[o]]));
  const favFolk = [], draws = [];
  for (const m of list) {
    const fi = m.final[0] >= m.final[2] ? 0 : 2;
    favFolk.push(m.folk[fi] / m.final[fi]);
    draws.push({ a: m.outcome === 'X' ? 1 : 0, p: m.final[1], f: m.folk[1] });
  }
  // Vardet per tecken: utfallsandel / folkets andel (over 1 = tecknet betalar mer an det streckas)
  const signValue = ['1', 'X', '2'].map((s, i) => {
    const hit = list.filter((m) => m.outcome === s).length;
    return { sign: s, actual: hit / list.length, final: avg(list.map((m) => m.final[i])), folk: avg(list.map((m) => m.folk[i])) };
  });
  const upsets = list.filter((m) => Math.max(m.final[0], m.final[2]) >= 0.55);
  return {
    n: list.length,
    products: [...new Set(list.map((m) => m.product))],
    llFinal: avg(list.map((m) => ll(m.final, m.outcome))),
    llMarket: avg(list.filter((m) => m.market).map((m) => ll(m.market, m.outcome))),
    llFolk: avg(list.map((m) => ll(m.folk, m.outcome))),
    llModel: avg(list.filter((m) => m.model).map((m) => ll(m.model, m.outcome))),
    favFolkRatio: avg(favFolk),
    drawActual: avg(draws.map((d) => d.a)), drawFinal: avg(draws.map((d) => d.p)), drawFolk: avg(draws.map((d) => d.f)),
    signValue,
    bigFav: upsets.length ? { n: upsets.length, held: upsets.filter((m) => m.outcome === (m.final[0] >= m.final[2] ? '1' : '2')).length / upsets.length, expected: avg(upsets.map((m) => Math.max(m.final[0], m.final[2]))) } : null,
  };
}

// Poolens lagnamn -> football-data-namn i samma liga
function poolTeam(code, name, teams) {
  let best = null;
  for (const t of teams) {
    const s = nameScore(name, null, t);
    if (s >= 0.5 && (!best || s > best.s)) best = { s, t };
  }
  return best?.t ?? null;
}

// ---------------------------------------------------------------- per liga
console.log('Analyserar ligor ...');
const leagues = {};
const breakKeys = {}; // liga -> Set("lag|datum") for forsta matchen efter landslagsuppehall
const pooledRows = matches;
const global = { signals: {}, situations: situations(pooledRows) };
for (const [k, s] of Object.entries(SIGNALS)) global.signals[k] = { ...s, ...testSignal(pooledRows, k, s.target, s.split) };

for (const league of [...MAIN, ...NEW]) {
  const list = matches.filter((m) => m.league === league);
  if (list.length < 300) continue;
  const L = { code: league, name: LEAGUE_NAMES[league], n: list.length };
  L.calibration = calibration(list);
  L.signals = {};
  for (const [k, s] of Object.entries(SIGNALS)) {
    const t = testSignal(list, k, s.target, s.split);
    if (t.all) L.signals[k] = { ...s, ...t };
  }
  L.situations = situations(list);
  L.persistence = persistence(list);
  breakKeys[league] = afterBreakKeys(list);
  const brk = list.flatMap((m) => [[m.home, m.y], [m.away, -m.y]].filter(([t]) => breakKeys[league].has(`${t}|${m.date}`)).map(([, y]) => y));
  L.afterBreak = { n: brk.length, res: avg(brk) };
  L.xg = { source: UNDERSTAT.includes(league) ? 'Understat' : list.some((m) => m.xgSrc === 'football-data') ? 'football-data (äldre säsonger skott-proxy)' : list.some((m) => m.xgSrc === 'skott') ? 'skott-proxy' : 'saknas', stats: xgStats[league] ?? null, coverage: list.filter((m) => m.xg).length / list.length };
  const poolList = pool.filter((m) => m.code === league);
  L.pool = { all: poolStats(poolList), stryktipset: poolStats(poolList.filter((m) => m.product === 'stryktipset')), europatipset: poolStats(poolList.filter((m) => m.product === 'europatipset')) };
  leagues[league] = L;
}
// Poolligor utan egen historik (cuper, Allsvenskan via marknad m.m.)
const poolOther = {};
for (const lg of [...new Set(pool.filter((m) => !m.code || !leagues[m.code]).map((m) => m.league))]) {
  const s = poolStats(pool.filter((m) => m.league === lg));
  if (s) poolOther[lg] = s;
}
const poolAll = { all: poolStats(pool), stryktipset: poolStats(pool.filter((m) => m.product === 'stryktipset')), europatipset: poolStats(pool.filter((m) => m.product === 'europatipset')) };

// ---------------------------------------------------------------- per lag
console.log('Analyserar lag ...');
const currentSeasonOf = (league) => seasonsByLeague[league].at(-1);
const teams = {};
for (const league of Object.keys(leagues)) {
  const seasons = seasonsByLeague[league];
  const cur = seasons.at(-1);
  const prev = seasons.at(-2);
  const active = new Set([...(seasonTeams.get(`${league}|${cur}`) ?? []), ...(seasonTeams.get(`${league}|${prev}`) ?? [])]);
  // Lag som spelat i ligan senaste sasongen (inte bara forra)
  const curTeams = seasonTeams.get(`${league}|${cur}`) ?? new Set();
  const lgPool = pool.filter((m) => m.code === league);
  for (const team of active) {
    const key = teamKey(league, team);
    const own = matches.filter((m) => teamKey(m.league, m.home) === key || teamKey(m.league, m.away) === key);
    const T = { league, team, current: curTeams.has(team), n: own.length };
    // Per sasong: poang/match, mot marknaden, xG
    T.seasons = [...new Set(own.map((m) => m.season))].sort().map((s) => {
      const rows = own.filter((m) => m.season === s);
      const r = rows.map((m) => (m.home === team ? m.y : -m.y));
      const home = rows.filter((m) => m.home === team);
      const away = rows.filter((m) => m.away === team);
      const xgRows = rows.filter((m) => m.xg);
      return {
        season: s, league: rows[0].league, n: rows.length,
        ppg: avg(rows.map((m) => (m.home === team ? pts(m.hg, m.ag) : pts(m.ag, m.hg)))),
        res: avg(r), resHome: avg(home.map((m) => m.y)), resAway: avg(away.map((m) => -m.y)),
        draws: avg(rows.map((m) => (m.res === 'D' ? 1 : 0))), impDraws: avg(rows.map((m) => m.close[1])),
        xgf: xgRows.length ? avg(xgRows.map((m) => (m.home === team ? m.xg[0] : m.xg[1]))) : null,
        xga: xgRows.length ? avg(xgRows.map((m) => (m.home === team ? m.xg[1] : m.xg[0]))) : null,
        gf: avg(rows.map((m) => (m.home === team ? m.hg : m.ag))), ga: avg(rows.map((m) => (m.home === team ? m.ag : m.hg))),
        xpts: xgRows.length ? avg(xgRows.map((m) => (m.home === team ? xPts(m.xg[0], m.xg[1]) : xPts(m.xg[1], m.xg[0])))) : null,
        xgSrc: xgRows[0]?.xgSrc ?? null,
      };
    });
    // Nulage: senaste 8 (tur, xG-gap, form mot marknad)
    const st = teamState.get(key);
    const recent = (st?.hist ?? []).slice(-FORM_N);
    const xr = recent.filter((r) => r.xpts != null);
    T.now = {
      last: st?.last ?? null,
      luck: xr.length >= 5 ? avg(xr.map((r) => r.pts - r.xpts)) : null,
      gap: xr.length >= 5 ? avg(xr.map((r) => (r.xgf - r.xga) - (r.gf - r.ga))) : null,
      mres: recent.length >= 5 ? avg(recent.map((r) => r.res)) : null,
      form: recent.map((r) => (r.pts === 3 ? 'V' : r.pts === 1 ? 'O' : 'F')).join(''),
    };
    // Inbordes mot lag i ligan nu
    T.h2h = [];
    for (const opp of curTeams.size ? curTeams : active) {
      if (opp === team) continue;
      const okey = teamKey(league, opp);
      const pk = [key, okey].sort().join('#');
      const meet = (h2hState.get(pk) ?? []).filter((x) => Date.parse(today) - Date.parse(x.date) < H2H_YEARS * 365.25 * 864e5);
      if (!meet.length) continue;
      let w = 0, d = 0, l = 0, gf = 0, ga = 0;
      const res = [], dr = [];
      for (const x of meet) {
        const isHome = x.hk === key;
        const g1 = isHome ? x.hg : x.ag, g2 = isHome ? x.ag : x.hg;
        const p = isHome ? x.close : [x.close[2], x.close[1], x.close[0]];
        if (g1 > g2) w++; else if (g1 === g2) d++; else l++;
        gf += g1; ga += g2;
        res.push(pts(g1, g2) - expPts(p));
        dr.push((g1 === g2 ? 1 : 0) - p[1]);
      }
      T.h2h.push({ opp, n: meet.length, w, d, l, gf, ga, res: avg(res), drawRes: avg(dr), last: meet.at(-1).date, lastScore: `${meet.at(-1).hk === key ? `${meet.at(-1).hg}-${meet.at(-1).ag} (h)` : `${meet.at(-1).ag}-${meet.at(-1).hg} (b)`}` });
    }
    T.h2h.sort((a, b) => b.n - a.n || a.opp.localeCompare(b.opp));
    T.hard = hardOpponents(T.h2h);
    // Forsta ligamatchen efter landslagsuppehall mot ovriga matcher
    {
      const persp = (m) => {
        const h = m.home === team;
        const gf = h ? m.hg : m.ag, ga = h ? m.ag : m.hg;
        return { date: m.date, opp: h ? m.away : m.home, h, gf, ga, p: pts(gf, ga), res: h ? m.y : -m.y };
      };
      const isBreak = (m) => breakKeys[m.league]?.has(`${team}|${m.date}`);
      const sum = (xs) => (xs.length ? { n: xs.length, w: xs.filter((x) => x.p === 3).length, d: xs.filter((x) => x.p === 1).length, l: xs.filter((x) => x.p === 0).length, ppg: avg(xs.map((x) => x.p)), res: avg(xs.map((x) => x.res)) } : null);
      const after = own.filter(isBreak).map(persp);
      const recentFrom = `${Number(cur.slice(0, 4)) - 3}-07-01`; // senaste tre sasongerna + innevarande
      T.afterBreak = after.length ? { all: sum(after), other: sum(own.filter((m) => !isBreak(m)).map(persp)), recent: sum(after.filter((x) => x.date >= recentFrom)), recentFrom, list: after } : null;
    }
    // Nyckelspelare (Understat)
    if (playerModel && UNDERSTAT.includes(league) && T.current) {
      const shares = teamShares(playerModel, league, team, today).filter((p) => Date.parse(today) - Date.parse(p.lastApp) < 200 * 864e5).slice(0, 6);
      const tms = own.filter((m) => m.missing && m.date >= '2024-08-01');
      T.keyPlayers = shares.map((p) => {
        const missed = tms.filter((m) => (m.home === team ? m.missing.home : m.missing.away).some((x) => x.name === p.name));
        const played = tms.filter((m) => !missed.includes(m));
        const r = (ms) => avg(ms.map((m) => (m.home === team ? m.y : -m.y)));
        const ppg = (ms) => avg(ms.map((m) => (m.home === team ? pts(m.hg, m.ag) : pts(m.ag, m.hg))));
        return { name: p.name, share: p.share, missed: missed.length, played: played.length, resMissed: missed.length ? r(missed) : null, resPlayed: played.length ? r(played) : null, ppgMissed: missed.length ? ppg(missed) : null, ppgPlayed: played.length ? ppg(played) : null };
      });
    }
    // Stryktipset/Europatipset
    const pm = lgPool.map((m) => ({ m, h: poolTeam(league, m.home, active), a: poolTeam(league, m.away, active) })).filter((x) => x.h === team || x.a === team);
    if (pm.length) {
      T.pool = pm.map(({ m, h }) => {
        const i = h === team ? 0 : 2;
        return { product: m.product, draw: m.draw, date: m.date, match: m.match, outcome: m.outcome, folk: m.folk[i], final: m.final[i], won: m.outcome === (i === 0 ? '1' : '2') };
      });
    }
    teams[`${league}|${team}`] = T;
  }
}

// ---------------------------------------------------------------- JSON
const compactTeam = (T) => ({ league: T.league, team: T.team, current: T.current, n: T.n, now: T.now, lastSeason: T.seasons.at(-1), keyPlayers: T.keyPlayers, h2h: T.h2h.slice(0, 30), pool: T.pool });
fs.writeFileSync(OUT_JSON, JSON.stringify({
  generatedAt: new Date().toISOString(),
  method: `Punkt-i-tid-signaler mot stängningsodds (devig). Träning < ${SPLIT}, kontroll >= ${SPLIT}. Bekräftad = |z| >= 2,5 i träning och >= 2 i kontroll med samma tecken.`,
  matches: matches.length, xgProxy: proxy, global, pool: { all: poolAll, other: poolOther },
  leagues, teams: Object.fromEntries(Object.entries(teams).map(([k, T]) => [k, compactTeam(T)])),
}), 'utf8');

// ---------------------------------------------------------------- Markdown
fs.rmSync(path.join(DOCS, 'ligor'), { recursive: true, force: true });
fs.rmSync(path.join(DOCS, 'lag'), { recursive: true, force: true });
fs.mkdirSync(path.join(DOCS, 'ligor'), { recursive: true });

const VERDICT_TXT = {
  bekräftad: '**bekräftad**', 'bekräftad (bara ny data)': '**bekräftad (bara ny data)**', 'svag signal': 'svag signal (inte bekräftad)',
  'ingen effekt': 'ingen effekt', 'bara mot öppningsodds': 'bara mot öppningsodds', 'för lite data': 'för lite data',
};
const zTxt = (t) => (t ? `${signed(t.slope ?? t.mean, 3)} (z ${fmt(t.z, 1)}, n ${t.n})` : '–');

function signalTable(sigs) {
  const rows = ['| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |', '|---|---|---|---|---|---|---|---|'];
  for (const s of Object.values(sigs)) {
    rows.push(`| ${s.name} | ${zTxt(s.all)} | ${zTxt(s.train)} | ${zTxt(s.test)} | ${zTxt(s.open)} | ${zTxt(s.move)} | ${s.all ? `${signed(s.all.effect, 3)} p` : '–'} | ${VERDICT_TXT[s.verdict]} |`);
  }
  return rows.join('\n');
}

function situationTable(sits) {
  const rows = ['| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |', '|---|---|---|---|---|'];
  for (const s of Object.values(sits)) rows.push(`| ${s.name} | ${zTxt(s.all)} | ${zTxt(s.train)} | ${zTxt(s.test)} | ${VERDICT_TXT[s.verdict]} |`);
  return rows.join('\n');
}

function poolSection(P, title = 'Stryktipset och Europatipset') {
  if (!P?.all) return `## ${title}\n\nInga matcher från ligan i de sparade backtesten ännu.\n`;
  const a = P.all;
  const lines = [`## ${title}`, '', `Källa: backtesten i \`data/stryktips-backtest-2526-steg3.json\`, \`data/stryktips-backtest.json\` och \`data/europatips-backtest-2526.json\` (${a.n} matcher: ${['stryktipset', 'europatipset'].filter((p) => P[p]).map((p) => `${P[p].n} ${p === 'stryktipset' ? 'Stryktipset' : 'Europatipset'}`).join(', ')}).`, '',
    '| Mått | Värde |', '|---|---|',
    `| Logloss slutprocent / marknad / folket / lagmodell | ${fmt(a.llFinal, 3)} / ${fmt(a.llMarket, 3)} / ${fmt(a.llFolk, 3)} / ${fmt(a.llModel, 3)} |`,
    `| Folket streckar favoriten | ×${fmt(a.favFolkRatio, 2)} av vår sannolikhet |`,
    `| Kryss: utfall / vår procent / folket | ${pct(a.drawActual)} / ${pct(a.drawFinal)} / ${pct(a.drawFolk)} |`,
    ...(a.bigFav ? [`| Favoriter ≥ 55 %: höll / väntat | ${pct(a.bigFav.held)} / ${pct(a.bigFav.expected)} (n ${a.bigFav.n}) |`] : []),
    '', '| Tecken | Utfall | Vår procent | Folket | Utfall / folket |', '|---|---|---|---|---|',
    ...a.signValue.map((s) => `| ${s.sign} | ${pct(s.actual)} | ${pct(s.final)} | ${pct(s.folk)} | ${fmt(s.actual / s.folk, 2)} |`), '',
  ];
  const notes = [];
  if (a.favFolkRatio > 1.12) notes.push(`Folket överstreckar favoriter (×${fmt(a.favFolkRatio, 2)}). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.`);
  if (a.drawFolk < a.drawFinal - 0.015) notes.push(`Folket streckar kryss ${fmt((a.drawFinal - a.drawFolk) * 100, 1)} procentenheter under vår procent. Kryss ger streckvärde.`);
  if (a.llFolk < a.llFinal - 0.01 && a.n >= 40) notes.push('Folket slog vår slutprocent i ligan. Kontrollera oddskällan (gamla odds?).');
  if (a.n < 40) notes.push(`Bara ${a.n} matcher: se det som indikation, inte regel.`);
  if (notes.length) lines.push(...notes.map((x) => `- ${x}`), '');
  return lines.join('\n');
}

function learningsFor(L) {
  const out = [];
  const c = L.calibration;
  for (const [k, s] of Object.entries(L.signals)) {
    if (s.verdict.startsWith('bekräftad')) out.push(`**${s.name}:** ${s.expect.split(' = ')[1] ?? ''} Effekt ${signed(s.all.effect, 3)} poäng för hemmalaget mellan stark och svag signal (z ${fmt(s.all.z, 1)}). Använd som justering.`);
    else if (s.verdict === 'svag signal') out.push(`${s.name}: svag signal (z ${fmt(s.all.z, 1)}) som inte håller i både träning och kontroll. Använd inte.`);
    else if (s.verdict === 'bara mot öppningsodds') out.push(`${s.name}: slår öppningsoddsen men inte stängningen. Marknaden prisar in det före avspark, så värdet finns bara om man spelar tidigt.`);
  }
  for (const b of c.drawBuckets) if (b.verdict.startsWith('bekräftad')) out.push(`Kryss i ${b.label}: utfall ${pct(b.actual)} mot oddsens ${pct(b.implied)}. Justera kryss ${signed((b.actual - b.implied) * 100, 1)} procentenheter.`);
  for (const b of c.favBuckets) if (b.verdict.startsWith('bekräftad')) out.push(`Favoriter ${b.label}: vann ${pct(b.actual)} mot oddsens ${pct(b.implied)}.`);
  if (c.homeRes.all && sitVerdict(c.homeRes) === 'bekräftad') out.push(`Hemmalagen tar ${signed(c.homeRes.all.mean, 3)} poäng per match mot marknadens förväntan. Marknaden ${c.homeRes.all.mean > 0 ? 'underskattar' : 'överskattar'} hemmaplan.`);
  for (const s of Object.values(L.situations)) if (s.verdict === 'bekräftad') out.push(`${s.name}: ${signed(s.all.mean, 3)} mot marknaden (z ${fmt(s.all.z, 1)}).`);
  if (L.persistence.team && Math.abs(L.persistence.team.z) >= 2.5) out.push(`Lag som slog marknaden en säsong gör det ${L.persistence.team.slope > 0 ? 'delvis igen' : 'mindre'} nästa (lutning ${fmt(L.persistence.team.slope, 2)}, z ${fmt(L.persistence.team.z, 1)}).`);
  return out;
}

function leagueMd(L) {
  const c = L.calibration;
  const lines = [
    `# ${L.name} (${L.code}) – lärdomar`, '',
    `Genererad ${today} av \`node scripts/analyze-learnings.mjs\`. Skriv inte för hand här: egna anteckningar läggs i \`docs/lardomar/anteckningar/${L.code}.md\`.`, '',
    `Underlag: ${c.n} matcher, säsong ${c.seasons[0]} – ${c.seasons.at(-1)}. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen)${c.nOpenClose ? `, öppningsodds finns för ${c.nOpenClose} matcher` : ', öppningsodds saknas'}. xG: ${L.xg.source} (${pct(L.xg.coverage, 0)} av matcherna).`, '',
    '## Lärdomar i korthet', '',
  ];
  const learn = learningsFor(L);
  lines.push(...(learn.length ? learn.map((x) => `- ${x}`) : ['- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).']), '');
  lines.push('## Ligans profil', '', '| | Utfall | Oddsens förväntan |', '|---|---|---|',
    `| Hemmavinst | ${pct(c.home)} | ${pct(c.impHome)} |`, `| Kryss | ${pct(c.draw)} | ${pct(c.impDraw)} |`, `| Bortavinst | ${pct(c.away)} | ${pct(c.impAway)} |`,
    `| Mål per match | ${fmt(c.goals)} | |`, `| Över 2,5 mål | ${pct(c.over25)} | |`, `| Båda lagen gör mål | ${pct(c.btts)} | |`,
    `| Logloss stängning${c.llOpen ? ' / öppning' : ''} | ${fmt(c.llClose, 4)}${c.llOpen ? ` / ${fmt(c.llOpen, 4)}` : ''} | |`, '');
  lines.push('### Kryss efter jämnhet (stängningsodds)', '', '| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |', '|---|---|---|---|---|---|',
    ...c.drawBuckets.map((b) => `| ${b.label} | ${b.n} | ${pct(b.actual)} | ${pct(b.implied)} | ${b.all ? `${signed(b.all.mean * 100, 1)} pe (${fmt(b.all.z, 1)})` : '–'} | ${VERDICT_TXT[b.verdict]} |`), '');
  lines.push('### Favoriter (favorit–skräll-bias)', '', '| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |', '|---|---|---|---|---|---|',
    ...c.favBuckets.map((b) => `| ${b.label} | ${b.n} | ${pct(b.actual)} | ${pct(b.implied)} | ${b.all ? `${signed(b.all.mean * 100, 1)} pe (${fmt(b.all.z, 1)})` : '–'} | ${VERDICT_TXT[b.verdict]} |`), '');
  lines.push(...leagueModelLines(L.code));
  lines.push('## Signaler mot marknaden', '', 'Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.', '', signalTable(L.signals), '');
  lines.push('## Situationer', '', situationTable(L.situations), '');
  const p = L.persistence;
  lines.push('## Lag som marknaden felvärderar?', '',
    `- Lagets poäng mot marknaden en säsong → nästa: ${p.team ? `lutning ${fmt(p.team.slope, 2)} (z ${fmt(p.team.z, 1)}, n ${p.team.n})` : '–'}. ${p.team && Math.abs(p.team.z) < 2 ? 'Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.' : ''}`,
    `- Lagets extra hemmafördel → nästa säsong: ${p.homeEdge ? `lutning ${fmt(p.homeEdge.slope, 2)} (z ${fmt(p.homeEdge.z, 1)}, n ${p.homeEdge.n})` : '–'}. ${p.homeEdge && Math.abs(p.homeEdge.z) < 2 ? 'Lagspecifik hemmafördel utöver marknaden är brus.' : ''}`, '');
  lines.push(...altitudeLeagueLines(L.code));
  lines.push(poolSection(L.pool));
  const cur = Object.values(teams).filter((T) => T.league === L.code && T.current).sort((a, b) => a.team.localeCompare(b.team));
  lines.push(...tableLines(L.code));
  lines.push('## Lagfiler', '', ...cur.map((T) => `- [${T.team}](../lag/${L.code}/${slug(T.team)}.md)`), '');
  return lines.join('\n');
}

function teamMd(T, L) {
  const lines = [`# ${T.team} (${L.name}) – lärdomar`, '', `Genererad ${today}. Ligans lärdomar: [${L.code}](../../ligor/${L.code}.md). "Mot marknaden" = poäng per match minus stängningsoddsens förväntan.`, ''];
  const notes = [];
  const n = T.now;
  if (n.luck != null && Math.abs(n.luck) >= 0.5) notes.push(`Senaste 8: ${n.luck > 0 ? 'tur' : 'otur'} med ${signed(n.luck, 2)} poäng per match mot xP. ${L.signals.luck?.verdict?.startsWith('bekräftad') ? 'Ligan visar att det slår tillbaka.' : 'Marknaden prisar redan in det i ligan (ingen bekräftad effekt), så det är inget spel i sig.'}`);
  if (n.gap != null && Math.abs(n.gap) >= 0.5) notes.push(`Senaste 8: xG-målskillnaden är ${signed(n.gap, 2)} per match ${n.gap > 0 ? 'bättre' : 'sämre'} än målskillnaden.`);
  const ls = T.seasons.at(-1);
  const prevS = T.seasons.at(-2);
  if (prevS && prevS.n >= 20 && Math.abs(prevS.res) >= 0.25) notes.push(`${prevS.season}: ${signed(prevS.res, 2)} poäng per match mot marknaden. Ligan visar ${L.persistence.team && Math.abs(L.persistence.team.z) >= 2.5 ? 'viss' : 'ingen'} persistens, så räkna inte med att det fortsätter.`);
  const strongH2h = T.h2h.filter((h) => h.n >= 6 && Math.abs(h.res) >= 0.5);
  if (strongH2h.length) notes.push(`Stark historik mot ${strongH2h.map((h) => `${h.opp} (${signed(h.res, 2)} p/match mot marknaden, ${h.n} möten)`).join(', ')}. ${L.signals.h2hRes?.verdict?.startsWith('bekräftad') ? 'Inbördes möten är en bekräftad signal i ligan.' : 'Men inbördes möten slår inte marknaden i ligan, så det är troligen slump.'}`);
  const ab = T.afterBreak;
  if (ab?.all.n >= 8) {
    const diff = ab.all.res - ab.other.res;
    notes.push(`Efter landslagsuppehåll: ${fmt(ab.all.ppg)} poäng per match mot ${fmt(ab.other.ppg)} annars (${ab.all.w}-${ab.all.d}-${ab.all.l} på ${ab.all.n} matcher), mot marknaden ${signed(ab.all.res)} mot ${signed(ab.other.res)}${ab.recent ? `. Sedan ${ab.recentFrom.slice(0, 4)}: ${ab.recent.w}-${ab.recent.d}-${ab.recent.l}` : ''}. ${Math.abs(diff) < 0.25 ? 'Ingen skillnad värd att spela på.' : `${diff > 0 ? 'Bättre' : 'Sämre'} än vanligt, men få matcher: ${L.afterBreak?.n ? `i hela ligan är effekten ${signed(L.afterBreak.res)} mot marknaden` : 'inte testat i ligan'}.`}`);
  }
  const sty = styleOf(T.league, T.team);
  if (sty) {
    const S = styleSummary(sty);
    const st = (r) => `${r.type} (${signed(r.rel)}, ${r.stab === 'stabil' ? 'stabilt' : r.stab === 'samma håll' ? 'samma håll i båda halvorna men svagt' : 'svagt'})`;
    const own = ownStyleLabels(sty.own);
    if (own.length) notes.push(`Spelstil${sty.ownSeason ? ` ${sty.ownSeason}` : ''}: ${own.join(', ')}.${S.best.length ? ` Bäst mot ${S.best.map(st).join(', ')}.` : ''}${S.worst.length ? ` Svårast mot ${S.worst.map(st).join(', ')}.` : ''} Tal = poäng per match mot marknaden jämfört med lagets eget snitt.`);
    const sp = sty.sp?.find((s) => s.m >= 10) ?? sty.sp?.[0];
    if (sp) notes.push(`Fasta situationer ${sp.season}: ${fmt(sp.spFor)} mål för per match (xG ${fmt(sp.spXgFor)}), ${fmt(sp.spAgainst)} emot (xG ${fmt(sp.spXgAgainst)}), ${fmt(sp.corners, 1)} hörnor.`);
  }
  const altNote = altitudeNote(T.league, T.team);
  if (altNote) notes.push(altNote);
  if (T.hard?.length) notes.push(`Svårt för: ${T.hard.map((h) => `${h.opp} (${h.w}-${h.d}-${h.l}, ${fmt(h.ppg)} p/match, mot marknaden ${signed(h.res)})`).join(', ')}.${T.hard.some((h) => h.res > -0.3) ? ' Där marknaden ligger nära noll är laget bara sämre i de mötena än annars, och oddsen vet redan om det.' : ''}`);
  const kp = (T.keyPlayers ?? []).filter((p) => p.missed >= 3 && p.share >= 0.1);
  for (const p of kp) notes.push(`Utan ${p.name} (${pct(p.share, 0)} av anfallet): ${fmt(p.ppgMissed)} poäng per match mot ${fmt(p.ppgPlayed)} med (${p.missed} mot ${p.played} matcher), mot marknaden ${signed(p.resMissed)} mot ${signed(p.resPlayed)}.`);
  if (T.pool?.length >= 3) {
    const r = avg(T.pool.map((x) => x.folk / x.final));
    if (Math.abs(r - 1) >= 0.12) notes.push(`På Stryktipset/Europatipset streckas lagets vinst ×${fmt(r, 2)} av vår sannolikhet (${T.pool.length} matcher). ${r > 1 ? 'Folket överspelar laget: garderingar mot det ger mer i utdelning.' : 'Folket underspelar laget: dess vinst ger streckvärde.'}`);
  }
  lines.push('## I korthet', '', ...(notes.length ? notes.map((x) => `- ${x}`) : ['- Inget som avviker från marknaden. Följ oddsen.']), '');
  lines.push('## Nuläge (senaste 8 ligamatcher)', '', `Form (äldst → senast): ${n.form || '–'} · senaste match ${n.last ?? '–'}`, '',
    '| Mått | Värde |', '|---|---|', `| Tur (poäng − xP per match) | ${signed(n.luck)} |`, `| xG-målskillnad − målskillnad | ${signed(n.gap)} |`, `| Poäng mot marknaden per match | ${signed(n.mres)} |`, '');
  lines.push('## Säsonger', '', '| Säsong | Liga | M | P/M | Mot marknaden (hemma / borta) | Kryss (odds) | Mål för–emot | xG för–emot | xP/M |', '|---|---|---|---|---|---|---|---|---|',
    ...T.seasons.map((s) => `| ${s.season} | ${s.league} | ${s.n} | ${fmt(s.ppg)} | ${signed(s.res)} (${signed(s.resHome)} / ${signed(s.resAway)}) | ${pct(s.draws, 0)} (${pct(s.impDraws, 0)}) | ${fmt(s.gf)}–${fmt(s.ga)} | ${s.xgf != null ? `${fmt(s.xgf)}–${fmt(s.xga)}${s.xgSrc === 'skott' ? '*' : ''}` : '–'} | ${fmt(s.xpts)} |`), '');
  if (T.seasons.some((s) => s.xgSrc === 'skott')) lines.push('\\* xG uppskattat från skott och skott på mål (Understat saknas för ligan).', '');
  if (sty) {
    const S = styleSummary(sty, { minN: 1 });
    lines.push('## Spelstil och fasta situationer', '',
      `Källa: [stilmatchningen](../../../analys/stil/${T.league}.md#${slug(T.team)}) (FotMob, motståndarens stil förra säsongen, justerad för styrka). Egen stil${sty.ownSeason ? ` ${sty.ownSeason}` : ''}: **${ownStyleLabels(sty.own).join(', ') || 'okänd'}**.`, '');
    if (sty.sp?.length) {
      lines.push('| Säsong | M | Fasta mål för | xG fasta för | Fasta mål emot | xG fasta emot | Hörnor |', '|---|---|---|---|---|---|---|',
        ...sty.sp.map((s) => `| ${s.season} | ${s.m} | ${fmt(s.spFor)} | ${fmt(s.spXgFor)} | ${fmt(s.spAgainst)} | ${fmt(s.spXgAgainst)} | ${fmt(s.corners, 1)} |`), '');
    }
    lines.push('| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Stabilitet |', '|---|---|---|---|---|---|---|---|',
      ...S.rows.map((r) => `| ${r.type} | ${r.n} | ${fmt(r.gf)}–${fmt(r.ga)} | ${signed(r.vsMkt)} | ${signed(r.rel)} (${fmt(r.zRel, 1)}) | ${signed(r.draw * 100, 0)} pe | ${r.over == null ? '–' : `${signed(r.over * 100, 0)} pe`} | ${r.stab === 'stabil' ? '⚑ stabil' : r.stab === 'samma håll' ? '✔ samma håll' : 'svag'} |`), '',
      'Lagmönster mot spelstilar håller sällan över tid (se stabilitetstestet i [stilmatchningen](../../../analys/stilmatchning.md)). Visas även när de är svaga: använd som ledtråd, inte som regel.', '');
  }
  if (ab) {
    const row = (lbl, s) => (s ? `| ${lbl} | ${s.n} | ${s.w}-${s.d}-${s.l} | ${fmt(s.ppg)} | ${signed(s.res)} |` : `| ${lbl} | 0 | – | – | – |`);
    lines.push('## Efter landslagsuppehåll', '',
      'Första ligamatchen efter ett uppehåll då hela ligan vilat 12–50 dagar (landslagsfönstren sep–nov och mars, VM-uppehållet 2022).', '',
      '| Matcher | M | V-O-F | P/M | Mot marknaden |', '|---|---|---|---|---|',
      row('Efter uppehåll', ab.all), row(`Efter uppehåll sedan ${ab.recentFrom.slice(0, 4)}`, ab.recent), row('Övriga matcher', ab.other), '',
      `Hela ligan efter uppehåll: ${signed(L.afterBreak?.res)} mot marknaden (n ${L.afterBreak?.n ?? 0}). Nära noll betyder att oddsen redan tar hänsyn till uppehållet.`, '',
      '| Datum | Match | Resultat | Mot marknaden |', '|---|---|---|---|',
      ...ab.list.slice().reverse().map((x) => `| ${x.date} | ${x.h ? `${T.team} - ${x.opp}` : `${x.opp} - ${T.team}`} | ${x.h ? `${x.gf}-${x.ga}` : `${x.ga}-${x.gf}`} ${x.p === 3 ? 'V' : x.p === 1 ? 'O' : 'F'} | ${signed(x.res)} |`), '');
  }
  if (T.keyPlayers?.length) {
    lines.push('## Nyckelspelare (Understat, 2024/25–)', '', 'Andel = spelarens del av lagets xG + xA senaste året. Borta = missade minst 2 ligamatcher i rad (skada/avstängning, inte rotation).', '',
      '| Spelare | Andel | Borta / med | P/M borta / med | Mot marknaden borta / med |', '|---|---|---|---|---|',
      ...T.keyPlayers.map((p) => `| ${p.name} | ${pct(p.share, 0)} | ${p.missed} / ${p.played} | ${fmt(p.ppgMissed)} / ${fmt(p.ppgPlayed)} | ${signed(p.resMissed)} / ${signed(p.resPlayed)} |`), '',
      `Ligans test av frånvaro mot marknaden: ${VERDICT_TXT[L.signals.miss?.verdict ?? 'för lite data']}. Få matcher per spelare: siffrorna ovan är beskrivande, inte bevis.`, '');
  }
  if (T.h2h.length) {
    lines.push(`## Inbördes möten (senaste ${H2H_YEARS} åren, lag i ligan nu)`, '', '| Motståndare | M | V-O-F | Mål | Mot marknaden | Kryss mot odds | Senast |', '|---|---|---|---|---|---|---|',
      ...T.h2h.map((h) => `| ${h.opp} | ${h.n} | ${h.w}-${h.d}-${h.l} | ${h.gf}–${h.ga} | ${signed(h.res)} | ${signed(h.drawRes * 100, 0)} pe | ${h.last} ${h.lastScore} |`), '',
      `Ligans test av inbördes möten mot marknaden: ${VERDICT_TXT[L.signals.h2hRes?.verdict ?? 'för lite data']}.`, '');
    if (T.hard?.length) lines.push(`**Svårt för** (minst 6 möten och högst 1,2 poäng per match eller högst −0,30 mot marknaden): ${T.hard.map((h) => `${h.opp} ${fmt(h.ppg)} p/match (${signed(h.res)})`).join(', ')}.`, '');
  }
  if (T.pool?.length) {
    lines.push('## Stryktipset / Europatipset', '', '| Datum | Spel | Match | Utfall | Folket på laget | Vår procent |', '|---|---|---|---|---|---|',
      ...T.pool.map((x) => `| ${x.date} | ${x.product === 'stryktipset' ? 'Stryk' : 'Europa'} ${x.draw} | ${x.match} | ${x.outcome}${x.won ? ' ✓' : ''} | ${pct(x.folk, 0)} | ${pct(x.final, 0)} |`), '');
  }
  lines.push(...altitudeTeamLines(T.league, T.team));
  lines.push(...squadLines(T.league, T.team));
  return lines.join('\n');
}

// ---------------------------------------------------------------- trupper och tabeller (npm run trupper)
// Funktionsdeklarationer med cache pa funktionen: anropas fran filgenereringen ovan innan en const hade initierats
function squadDoc(code) {
  const c = (squadDoc.cache ??= new Map());
  if (!c.has(code)) c.set(code, readJsonOpt(path.join(root, 'data', 'trupper', `${code}.json`)));
  return c.get(code);
}
function leagueDoc(code) {
  const c = (leagueDoc.cache ??= new Map());
  if (!c.has(code)) c.set(code, readJsonOpt(path.join(root, 'data', 'ligor', `${code}.json`)));
  return c.get(code);
}
// Hoghojd (scripts/lib/altitude.mjs): ligor med arenor pa hoghojd, matcher ur data/matcher/<liga>.csv
function altitudeDoc(code) {
  const c = (altitudeDoc.cache ??= new Map());
  if (c.has(code)) return c.get(code);
  let doc = null;
  const file = path.join(root, 'data', 'matcher', `${code}.csv`);
  if (ALTITUDE[code] && fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
    const head = lines[0].split(',');
    const ms = lines.slice(1).map((l) => Object.fromEntries(l.split(',').map((x, i) => [head[i], x]))).filter((r) => r.status === 'spelad' && r.hg !== '').map((r) => {
      const o = [+r.close_h, +r.close_d, +r.close_a], s = o[0] + o[1] + o[2];
      return { date: r.date, home: r.home, away: r.away, hg: +r.hg, ag: +r.ag, ...(r.close_h && s > 0 ? { pH: o[0] / s, pD: o[1] / s, pA: o[2] / s } : {}) };
    });
    const split = '2019-07-01';
    doc = { all: altitudeStats(code, ms), early: altitudeStats(code, ms.filter((m) => m.date < split)), late: altitudeStats(code, ms.filter((m) => m.date >= split)), split, n: ms.length };
  }
  c.set(code, doc);
  return doc;
}
const altZ = (L) => (L.alt?.res != null && L.other?.res != null ? (L.alt.res - L.other.res) / (1.2 * Math.sqrt(1 / L.alt.nRes + 1 / L.other.nRes)) : null);
function altitudeLeagueLines(code) {
  const d = altitudeDoc(code);
  if (!d?.all.league.alt) return [];
  const L = d.all.league, odds = L.alt.res != null;
  const row = (lbl, s) => (s ? `| ${lbl} | ${s.n} | ${s.w}-${s.d}-${s.l} | ${fmt(s.ppg)} | ${odds ? signed(s.res) : '–'} |` : `| ${lbl} | 0 | – | – | – |`);
  const out = ['## Höghöjd', '',
    `Hemmalag på arena ≥ ${HIGH} m mot bortalag från minst ${MIN_DIFF} m lägre (arenahöjder i \`scripts/lib/altitude.mjs\`).`, '',
    '| Hemmamatcher | M | V-O-F | P/M | Mot marknaden |', '|---|---|---|---|---|', row('På höghöjd mot låglandslag', L.alt), row('Övriga', L.other), ''];
  if (odds) {
    const z = altZ(L), ze = altZ(d.early.league), zl = altZ(d.late.league);
    const sure = ze != null && zl != null && Math.sign(ze) === Math.sign(zl) && Math.abs(ze) >= 2 && Math.abs(zl) >= 1.5;
    out.push(`Skillnad mot marknaden: ${signed(L.alt.res - L.other.res)} poäng per match för hemmalaget (z ${fmt(z, 1)}). Före ${d.split.slice(0, 4)}: z ${fmt(ze, 1)}, efter: z ${fmt(zl, 1)}. ${sure ? '**Håller i båda perioderna: marknaden underskattar höghöjden.**' : Math.abs(z ?? 0) >= 2 ? 'Svag signal, håller inte säkert i båda perioderna.' : 'Ingen effekt mot marknaden: oddsen prisar redan in höjden.'}`, '');
  } else out.push('Ligan saknar odds, så höjden kan bara jämföras i poäng (marknaden kan redan ta hänsyn till den).', '');
  const hard = hardestAtAltitude(d.all);
  if (hard.length) {
    out.push('### Bortalag på höghöjd', '', '| Lag | M på höghöjd | P/M höghöjd | P/M övriga borta | Skillnad | Mot marknaden höghöjd / övriga |', '|---|---|---|---|---|---|',
      ...hard.map((h) => `| ${h.team} | ${h.alt.n} | ${fmt(h.alt.ppg)} | ${fmt(h.other.ppg)} | ${signed(h.diff)} | ${odds ? `${signed(h.alt.res)} / ${signed(h.other.res)}` : '–'} |`), '');
  }
  return out;
}
function altitudeTeamLines(code, team) {
  const d = altitudeDoc(code);
  if (!d) return [];
  const a = d.all.away[team], h = d.all.home[team];
  const odds = d.all.league.alt?.res != null;
  const out = [];
  if (!a?.alt && !h?.alt) return out;
  const row = (lbl, s) => (s ? `| ${lbl} | ${s.n} | ${s.w}-${s.d}-${s.l} | ${fmt(s.ppg)} | ${odds ? signed(s.res) : '–'} |` : `| ${lbl} | 0 | – | – | – |`);
  out.push('## Höghöjd', '', `Arenans höjd: ca ${altitudeOf(code, team)} m. Höghöjdsmatch = arena ≥ ${HIGH} m och bortalaget från minst ${MIN_DIFF} m lägre.`, '',
    '| Matcher | M | V-O-F | P/M | Mot marknaden |', '|---|---|---|---|---|');
  if (h?.alt) out.push(row('Hemma mot låglandslag', h.alt), row('Hemma mot övriga', h.other));
  if (a?.alt) out.push(row('Borta på höghöjd', a.alt), row('Borta övriga', a.other));
  out.push('', `Ligan: se [${code}](../../ligor/${code}.md#höghöjd).`, '');
  return out;
}
function altitudeNote(code, team) {
  const d = altitudeDoc(code);
  const a = d?.all.away[team], h = d?.all.home[team];
  const odds = d?.all.league.alt?.res != null;
  const parts = [];
  if (a?.alt?.n >= 5) parts.push(`borta på höghöjd ${fmt(a.alt.ppg)} poäng per match mot ${fmt(a.other.ppg)} i övriga bortamatcher (${a.alt.n} matcher${odds ? `, mot marknaden ${signed(a.alt.res)} mot ${signed(a.other.res)}` : ''})${a.alt.ppg < a.other.ppg - 0.2 ? ': **svårare på höghöjd**' : ''}`);
  if (h?.alt?.n >= 5) parts.push(`hemma på ${altitudeOf(code, team)} m mot låglandslag ${fmt(h.alt.ppg)} poäng per match mot ${fmt(h.other.ppg)} mot övriga (${h.alt.n} matcher${odds ? `, mot marknaden ${signed(h.alt.res)} mot ${signed(h.other.res)}` : ''})`);
  return parts.length ? `Höghöjd: ${parts.join('; ')}.` : null;
}

// Lagets stil och fasta situationer ur data/stilmatchning.json (node scripts/analyze-style-matchups.mjs)
function styleOf(code, team) {
  styleOf.doc ??= readJsonOpt(path.join(root, 'data', 'stilmatchning.json')) ?? {};
  return styleOf.doc.leagues?.[code]?.teams?.[team] ?? null;
}
function readJsonOpt(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
const ROLE_TXT = { keepers: 'Målvakter', defenders: 'Backar', midfielders: 'Mittfältare', attackers: 'Anfallare' };
function money(v) {
  if (!v) return '–';
  return v >= 1e6 ? `${fmt(v / 1e6, 1)} M€` : `${Math.round(v / 1e3)} k€`;
}

// FotMob: 'Doubtful' = osaker, annars vantad aterkomst
function injuryTxt(i) {
  const r = i?.expectedReturn;
  if (!r) return 'skadad';
  return /doubtful/i.test(r) ? 'osäker' : `skadad, åter ${r}`;
}

function squadLines(code, team) {
  const sq = squadDoc(code)?.teams?.[team];
  if (!sq) return [];
  const lines = [`## Trupp (${sq.source ?? 'FotMob'}, hämtad ${sq.fetchedAt?.slice(0, 10) ?? '–'})`, '', `Tränare: ${sq.coach ?? '–'}${sq.coachHistory?.length > 1 ? ` (tidigare: ${sq.coachHistory.slice(0, -1).map((c) => `${c.name} till ${c.firstSeen}`).join(', ')})` : ''}. Betyg, mål och assist gäller innevarande säsong enligt FotMob.`, ''];
  const injured = sq.players.filter((p) => p.injury);
  if (injured.length) lines.push(`**Skadade/borta nu:** ${injured.map((p) => `${p.name} (${injuryTxt(p.injury)})`).join(', ')}`, '');
  lines.push('| # | Spelare | Pos | Ålder | Land | Värde | Betyg | Mål | Ass | Gula/röda | Status |', '|---|---|---|---|---|---|---|---|---|---|---|');
  for (const role of ['keepers', 'defenders', 'midfielders', 'attackers']) {
    const ps = sq.players.filter((p) => p.role === role);
    if (!ps.length) continue;
    lines.push(`| | **${ROLE_TXT[role]}** | | | | | | | | | |`);
    for (const p of ps) lines.push(`| ${p.number ?? ''} | ${p.name} | ${p.position ?? ''} | ${p.age ?? ''} | ${p.country ?? ''} | ${money(p.value)} | ${p.rating != null ? fmt(p.rating, 2) : '–'} | ${p.goals ?? '–'} | ${p.assists ?? '–'} | ${p.yellow ?? 0}/${p.red ?? 0} | ${p.injury ? injuryTxt(p.injury) : ''} |`);
  }
  lines.push('');
  if (sq.left?.length) lines.push(`Har lämnat truppen sedan vi började spara (${sq.left.length}): ${sq.left.map((p) => `${p.name} (senast ${p.lastSeen})`).join(', ')}.`, '');
  return lines;
}

function tableLines(code) {
  const lg = leagueDoc(code);
  if (!lg?.table?.length) return [];
  const groups = [...new Set(lg.table.map((t) => t.group))];
  const out = [`## Tabell nu (FotMob, ${lg.updatedAt.slice(0, 10)})`, ''];
  for (const g of groups) {
    if (g) out.push(`**${g}**`, '');
    out.push('| # | Lag | M | V | O | F | Mål | +/− | P |', '|---|---|---|---|---|---|---|---|---|',
      ...lg.table.filter((t) => t.group === g).map((t) => `| ${t.rank} | ${t.team} | ${t.played} | ${t.won} | ${t.drawn} | ${t.lost} | ${t.goals} | ${t.gd} | ${t.pts} |`), '');
  }
  out.push(`Tabellhistorik (en rad per lag och dag sedan ${Object.keys(lg.tableHistory ?? {}).sort()[0] ?? '–'}): \`data/ligor/${code}.json\`.`, '');
  return out;
}

// ---------------------------------------------------------------- justeringsmodellen (npm run lardomar:modell)
const readOpt = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const modelReport = readOpt(path.join(root, 'data', 'lardomar-modell.json'));
const adjustments = readOpt(path.join(root, 'config', 'learned-adjustments.json'));
const BASE_TXT = { open: 'öppningsodds (Oddset, långt före avspark)', close: 'stängningsodds (sen körning, Stryktipset/Europatipset)' };

function modelSection() {
  if (!modelReport) return ['## Justeringsmodell', '', 'Inte körd än: `npm run lardomar:modell`.', ''];
  const lines = ['## Justeringsmodell: blir sannolikheterna bättre?', '',
    `Alla signaler och en kalibrering per liga (favorit-/skrällbias, hemmabias, kryss) läggs på marknadens sannolikheter. Anpassning före 2021/22, val på 2021/22–2022/23, en enda mätning på 2023/24 och senare. Mått: logloss-skillnad per match (negativ = bättre). Grovt räknat ändras chansen till 13 rätt med faktorn e^(−13 × skillnaden), så −0,001 ≈ +1,3 %. Genererad av \`scripts/learnings-model.mjs\` ${modelReport.generatedAt.slice(0, 10)}.`, '',
    'Oddset-simuleringen spelar tecken med EV ≥ 3 % och odds ≤ 5. "Bästa pris" = högsta odds bland alla bolag i football-data. Det är för optimistiskt (gamla och begränsade priser), så jämför varianterna med varandra, inte med noll. CLV mäts mot ojusterad stängning och blir därför lägre för justerade varianter.', ''];
  for (const [base, b] of Object.entries(modelReport.bases)) {
    lines.push(`### Mot ${BASE_TXT[base]}`, '', '| Variant | Logloss-skillnad (z) | Bästa pris: spel / ROI ± SE / CLV | Snittodds: spel / ROI ± SE |', '|---|---|---|---|');
    for (const [name, v] of Object.entries(b.variants)) {
      const t = v.bets.test, a = v.bets.testAvgOdds;
      const roi = (x) => (x?.roi != null ? `${pct(x.roi)} ± ${pct(x.roiSe)}` : '–');
      lines.push(`| ${name} | ${v.test ? `${signed(v.test.dLL, 4)} (${fmt(v.test.z, 1)})` : '–'} | ${t.bets} / ${roi(t)} / ${t.clv != null ? pct(t.clv) : '–'} | ${a?.bets ?? '–'} / ${roi(a)} |`);
    }
    lines.push('', `Signaler en i taget (validering, negativ = bättre): ${Object.entries(b.single).map(([k, v]) => `${k} ${signed(v.valid.dLL, 4)} (z ${fmt(v.valid.z, 1)})`).join(', ')}.`, '');
    const a = adjustments?.[base];
    lines.push(a ? `**Används live:** ${a.rule} (kontroll ${signed(a.test.dLL, 4)}, z ${fmt(a.test.z, 1)}).` : '**Används inte:** ingen variant blev bättre med z ≤ −2 i kontrollen.', '');
  }
  if (modelReport.missing) {
    const m = modelReport.missing;
    lines.push('### Nyckelspelare borta (träning 2024/25, kontroll 2025/26–)', '',
      `Vikt ${fmt(m.open.beta, 3)} mot öppning och ${fmt(m.close.beta, 3)} mot stängning. Positiv vikt betyder att laget som saknar spelare gör det *bättre* än oddsen, alltså att marknaden överreagerar. Kontroll: ${signed(m.open.test.dLL, 4)} (z ${fmt(m.open.test.z, 1)}) och ${signed(m.close.test.dLL, 4)} (z ${fmt(m.close.test.z, 1)}). Inte bekräftat, så det används inte.`, '');
  }
  return lines;
}

function leagueModelLines(code) {
  if (!modelReport) return [];
  const out = [];
  for (const base of ['open', 'close']) {
    const v = modelReport.bases[base]?.variants?.['ligakalibrering (alla ligor)'];
    const t = v?.test?.byLeague?.[code];
    const p = v?.leagues?.[code];
    if (!t || !p) continue;
    const live = adjustments?.[base]?.leagues?.[code];
    out.push(`| ${BASE_TXT[base]} | ${signed(p.g, 3)} | ${signed(p.h, 3)} | ${signed(p.d, 3)} | ${signed(t.dLL, 4)} (z ${fmt(t.z, 1)}, n ${t.n}) | ${live ? 'ja' : 'nej'} |`);
  }
  if (!out.length) return [];
  return ['## Kalibrering av oddsen (justeringsmodellen)', '',
    'g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.', '',
    '| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |', '|---|---|---|---|---|---|', ...out, ''];
}

for (const L of Object.values(leagues)) {
  fs.writeFileSync(path.join(DOCS, 'ligor', `${L.code}.md`), leagueMd(L), 'utf8');
  fs.mkdirSync(path.join(DOCS, 'lag', L.code), { recursive: true });
}
for (const T of Object.values(teams)) {
  if (!T.current) continue;
  fs.writeFileSync(path.join(DOCS, 'lag', T.league, `${slug(T.team)}.md`), teamMd(T, leagues[T.league]), 'utf8');
}

// README / index
function readme() {
  const g = global;
  const lines = [
    '# Lärdomar per liga och lag', '',
    `Genererad ${today} av \`node scripts/analyze-learnings.mjs\` (${matches.length} matcher, ${Object.keys(leagues).length} ligor, ${Object.values(teams).filter((t) => t.current).length} lag). Agenten \`.claude/agents/lardomar.md\` kör och tolkar analysen.`, '',
    'Frågan i varje test: **ger signalen något utöver stängningsoddsen?** Allt som oddsen redan prisar in har inget värde för våra spel. Träning på säsonger före 2023/24, kontroll på 2023/24 och senare. En signal räknas som bekräftad först när den håller i båda.', '',
    'Slutsatser och beslut (handskrivet, levande): [slutsatser.md](slutsatser.md). Alla matcher per liga för träning: `data/matcher/<liga>.csv`.', '',
    '## Alla ligor tillsammans', '', signalTable(g.signals), '', situationTable(g.situations), '',
    ...modelSection(),
    '## Ligor', '', '| Liga | Matcher | Säsonger | xG | Bekräftade lärdomar |', '|---|---|---|---|---|',
    ...Object.values(leagues).map((L) => `| [${L.name}](ligor/${L.code}.md) | ${L.n} | ${L.calibration.seasons[0]}–${L.calibration.seasons.at(-1)} | ${L.xg.source} | ${learningsFor(L).filter((x) => x.startsWith('**') || x.startsWith('Kryss') || x.startsWith('Favoriter') || x.startsWith('Hemmalagen') || x.includes('mot marknaden (z')).length} |`), '',
    '### Ligor utan oddshistorik och cuper', '', 'Här kan inget mätas mot marknaden. Filerna visar profil, säsonger, modellens träff, form, inbördes möten, tabell och trupper.', '',
    '| Liga | Matcher | Lagfiler |', '|---|---|---|',
    ...basicLeagues.map((b) => `| [${b.name}](ligor/${b.code}.md)${b.cup ? ' (cup)' : ''} | ${b.n} | ${b.teams} |`), '',
    poolSection(poolAll, 'Stryktipset och Europatipset, alla ligor'),
    '### Ligor och cuper utan egen historik (bara pool-data)', '', '| Liga | n | Kryss utfall / vår / folket | Folket på favoriten | Logloss vår / folket |', '|---|---|---|---|---|',
    ...Object.entries(poolOther).sort((a, b) => b[1].n - a[1].n).map(([lg, s]) => `| ${lg} | ${s.n} | ${pct(s.drawActual, 0)} / ${pct(s.drawFinal, 0)} / ${pct(s.drawFolk, 0)} | ×${fmt(s.favFolkRatio)} | ${fmt(s.llFinal, 3)} / ${fmt(s.llFolk, 3)} |`), '',
    '## Data som saknas', '',
    '| Data | Läge | Påverkan |', '|---|---|---|',
    '| xG utanför topp 5 | Bara skott-proxy (skott och skott på mål) för övriga fd-ligor. Inget alls för Allsvenskan, Eliteserien, MLS, J1, Liga MX, Brasilien, Argentina, Danmark och Polen | Tur/form-signaler kan inte testas där |',
    '| Spelarnas matcher (vilka som spelade) | Bara Understat topp 5 från 2024/25 | Frånvarotest bara i topp 5 och kort period |',
    '| Skador och avstängningar i förväg | Bara live (FPL för PL, FotMob). Ingen historik | Kan inte testa vad marknaden visste före elvan |',
    '| Cup- och Europamatcher | Saknas i historiken | Vilodagar räknas bara mellan ligamatcher, trötthet efter Europa missas |',
    '| Tränarbyten | Saknas | "Ny tränare-effekt" kan inte testas |',
    '| Öppningsodds | fd-new-ligorna har bara stängning. Före 2019/20 saknas stängning i fd-main | Test mot öppningsodds bara i huvudligorna |',
    '| Stryktipset/Europatipset | Streck och odds bara från 2025/26 (backtest) | Folkets bias per lag bygger på få matcher |',
    '| Trupper | FotMob saknar trupper för J2, J3 och Ettan Norra/Södra (ESPN har inte heller ligorna). Truppernas historik börjar 2026-09-28 | Skador och truppändringar kan inte följas där |',
    '| Derbyn, motivation, väder | Väder testat separat i pro-lagret (inget värde). Derby och motivation saknas | – |', '',
    '## Köra om', '', '```', 'npm run history    # äldre säsonger + Understat-xG (en gång, cachas)', 'npm run lardomar   # analys + alla filer', '```', '',
  ];
  return lines.join('\n');
}
// ---------------------------------------------------------------- ligor utan oddshistorik + cuper
// Resultat fran betting-store (ESPN, TheSportsDB, FotMob). Ingen marknad att mata mot: profil, lag, form, H2H, trupp.
const storeDoc = readJsonOpt(path.join(root, 'data', 'betting-store.json')) ?? { matches: [], accuracyByLeague: {} };
const leaguesCfg = readJsonOpt(path.join(root, 'config', 'leagues.json'))?.leagues ?? {};
const basicLeagues = [];
const extraTeamFiles = [];
const rate = (a, f) => (a.length ? a.filter(f).length / a.length : NaN);
function basicTeamMd(code, name, team, list, noOdds = true) {
  const own = list.filter((m) => m.home === team || m.away === team);
  const persp = (m) => (m.home === team ? [m.hg, m.ag] : [m.ag, m.hg]);
  const lines = [`# ${team} (${name}) – lärdomar`, '', `Genererad ${today}. Ligans fil: [${code}](../../ligor/${code}.md). ${noOdds ? 'Ligan saknar oddshistorik, så inget kan mätas mot marknaden: siffrorna är beskrivande.' : 'Laget saknar historik i ligan i våra källor (ny i ligan).'}`, ''];
  if (own.length) {
    const last = own.slice(-8);
    lines.push('## Nuläge', '', `Form senaste ${last.length} (äldst → senast): ${last.map((m) => { const [a, b] = persp(m); return a > b ? 'V' : a === b ? 'O' : 'F'; }).join('')} · senaste match ${own.at(-1).date}`, '');
    lines.push('## Säsonger', '', '| Säsong | M | P/M | Hemma P/M | Borta P/M | Kryss | Mål för–emot | Över 2,5 |', '|---|---|---|---|---|---|---|---|');
    for (const s of [...new Set(own.map((m) => m.season))].sort()) {
      const r = own.filter((m) => m.season === s);
      const ppg = (ms) => (ms.length ? fmt(avg(ms.map((m) => { const [a, b] = persp(m); return pts(a, b); }))) : '–');
      lines.push(`| ${s} | ${r.length} | ${ppg(r)} | ${ppg(r.filter((m) => m.home === team))} | ${ppg(r.filter((m) => m.away === team))} | ${pct(rate(r, (m) => m.hg === m.ag), 0)} | ${fmt(avg(r.map((m) => persp(m)[0])))}–${fmt(avg(r.map((m) => persp(m)[1])))} | ${pct(rate(r, (m) => m.hg + m.ag > 2), 0)} |`);
    }
    lines.push('');
    const opps = [...new Set(own.map((m) => (m.home === team ? m.away : m.home)))].sort();
    const h2h = opps.map((o) => {
      const ms = own.filter((m) => m.home === o || m.away === o);
      let w = 0, d = 0, l = 0, gf = 0, ga = 0;
      for (const m of ms) { const [a, b] = persp(m); if (a > b) w++; else if (a === b) d++; else l++; gf += a; ga += b; }
      return { o, n: ms.length, w, d, l, gf, ga, last: ms.at(-1) };
    }).filter((h) => h.n >= 2).sort((a, b) => b.n - a.n);
    if (h2h.length) {
      lines.push('## Inbördes möten', '', '| Motståndare | M | V-O-F | Mål | Senast |', '|---|---|---|---|---|',
        ...h2h.map((h) => `| ${h.o} | ${h.n} | ${h.w}-${h.d}-${h.l} | ${h.gf}–${h.ga} | ${h.last.date} ${persp(h.last).join('-')} (${h.last.home === team ? 'h' : 'b'}) |`), '',
        'Inbördes möten slår inte oddsen i någon av de 23 ligorna där det gick att testa (se [README](../../README.md)). Använd dem inte för att flytta procent.', '');
    }
  }
  lines.push(...altitudeTeamLines(code, team));
  lines.push(...squadLines(code, team));
  return lines.join('\n');
}
for (const code of Object.keys(leaguesCfg)) {
  if (leagues[code]) continue;
  const cfg = leaguesCfg[code];
  const list = storeDoc.matches.filter((m) => m.league === code && Number.isFinite(m.hg)).sort((a, b) => a.date.localeCompare(b.date));
  const sq = squadDoc(code);
  const lg = leagueDoc(code);
  if (!list.length && !sq) continue;
  const acc = storeDoc.accuracyByLeague?.[code];
  const poolLg = Object.entries(poolOther).find(([n]) => nameScore(n, null, cfg.name) >= 0.6 || n === cfg.name);
  const lines = [`# ${cfg.name} (${code}) – lärdomar`, '',
    `Genererad ${today} av \`node scripts/analyze-learnings.mjs\`. ${cfg.cup ? 'Cup: lagen hör till sina ligor, se deras lagfiler.' : 'Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här.'} Alla matcher: \`data/matcher/${code}.csv\`.`, ''];
  lines.push('## Lärdomar i korthet', '');
  const notes = [];
  if (list.length) {
    const home = rate(list, (m) => m.hg > m.ag), draw = rate(list, (m) => m.hg === m.ag), away = rate(list, (m) => m.hg < m.ag);
    notes.push(`${list.length} matcher (${list[0].date} – ${list.at(-1).date}): hemmavinst ${pct(home)}, kryss ${pct(draw)}, bortavinst ${pct(away)}, ${fmt(avg(list.map((m) => m.hg + m.ag)))} mål per match.`);
    if (acc?.['1X2']?.tested) {
      const a1 = acc['1X2'];
      notes.push(`Modellens 1X2-tips träffade ${pct(a1.rate)} (${a1.correct}/${a1.tested}). ${a1.rate < Math.max(home, away) ? `Det är sämre än att alltid tippa ${home >= away ? 'hemmavinst' : 'bortavinst'} (${pct(Math.max(home, away))}), så modellen behöver granskas i ligan.` : ''}`);
    }
    if (acc?.OU25?.tested) notes.push(`Över/under 2,5: träff ${pct(acc.OU25.rate)} (${acc.OU25.tested}). BTTS: ${pct(acc.BTTS?.rate ?? NaN)}.`);
  }
  notes.push('Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.');
  lines.push(...notes.map((x) => `- ${x}`), '');
  lines.push(...altitudeLeagueLines(code));
  if (list.length) {
    lines.push('## Säsonger', '', '| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |', '|---|---|---|---|---|---|---|---|');
    for (const s of [...new Set(list.map((m) => m.season))].sort()) {
      const r = list.filter((m) => m.season === s);
      lines.push(`| ${s} | ${r.length} | ${pct(rate(r, (m) => m.hg > m.ag), 0)} | ${pct(rate(r, (m) => m.hg === m.ag), 0)} | ${pct(rate(r, (m) => m.hg < m.ag), 0)} | ${fmt(avg(r.map((m) => m.hg + m.ag)))} | ${pct(rate(r, (m) => m.hg + m.ag > 2), 0)} | ${pct(rate(r, (m) => m.hg > 0 && m.ag > 0), 0)} |`);
    }
    lines.push('');
  }
  if (poolLg) {
    const s = poolLg[1];
    lines.push('## Stryktipset och Europatipset', '', `${s.n} matcher (${poolLg[0]}). Kryss: utfall ${pct(s.drawActual)}, vår procent ${pct(s.drawFinal)}, folket ${pct(s.drawFolk)}. Folket streckar favoriten ×${fmt(s.favFolkRatio)}. Logloss vår/folket ${fmt(s.llFinal, 3)}/${fmt(s.llFolk, 3)}.`, '');
  }
  lines.push(...tableLines(code));
  // Lag: tabellens lag (trupper) + lag i senaste sasongen
  const lastSeason = list.at(-1)?.season;
  const teamNames = [...new Set([...(lg?.table ?? []).map((t) => t.team), ...(cfg.cup ? [] : list.filter((m) => m.season === lastSeason).flatMap((m) => [m.home, m.away]))])].sort();
  if (!cfg.cup) {
    fs.mkdirSync(path.join(DOCS, 'lag', code), { recursive: true });
    for (const t of teamNames) fs.writeFileSync(path.join(DOCS, 'lag', code, `${slug(t)}.md`), basicTeamMd(code, cfg.name, t, list), 'utf8');
    lines.push('## Lagfiler', '', ...teamNames.map((t) => `- [${t}](../lag/${code}/${slug(t)}.md)`), '');
  } else if (sq) {
    lines.push('## Trupper', '', 'Trupperna för cuplagen finns i `data/trupper/' + code + '.json` och i lagens egna ligafiler.', '');
  }
  fs.writeFileSync(path.join(DOCS, 'ligor', `${code}.md`), lines.join('\n'), 'utf8');
  basicLeagues.push({ code, name: cfg.name, n: list.length, teams: cfg.cup ? 0 : teamNames.length, cup: !!cfg.cup });
}
// Lag i en odds-liga som finns i tabellen men saknar lagfil (t.ex. nyuppflyttade utan historik i ligan)
for (const code of Object.keys(leagues)) {
  for (const t of Object.keys(squadDoc(code)?.teams ?? {})) {
    const f = path.join(DOCS, 'lag', code, `${slug(t)}.md`);
    if (fs.existsSync(f)) continue;
    const list = matches.filter((m) => m.league === code).map((m) => ({ ...m }));
    fs.writeFileSync(f, basicTeamMd(code, LEAGUE_NAMES[code], t, list, false), 'utf8');
    extraTeamFiles.push(`${code}/${t}`);
  }
}
fs.writeFileSync(path.join(DOCS, 'README.md'), readme(), 'utf8');
console.log(`Skrev ${path.relative(root, OUT_JSON)} och docs/lardomar/ (${Object.keys(leagues).length} ligor med odds + ${basicLeagues.length} utan/cuper, ${Object.values(teams).filter((t) => t.current).length + basicLeagues.reduce((x, b) => x + b.teams, 0) + extraTeamFiles.length} lagfiler)`);
for (const [k, s] of Object.entries(global.signals)) console.log(`  ${k.padEnd(8)} ${s.verdict.padEnd(22)} alla ${zTxt(s.all)} | träning ${zTxt(s.train)} | kontroll ${zTxt(s.test)} | öppning ${zTxt(s.open)} | rörelse ${zTxt(s.move)}`);
for (const [k, s] of Object.entries(global.situations)) console.log(`  ${k.padEnd(10)} ${s.verdict.padEnd(14)} ${zTxt(s.all)} | träning ${zTxt(s.train)} | kontroll ${zTxt(s.test)}`);
