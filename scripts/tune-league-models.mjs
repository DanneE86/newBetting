// Valjer Dixon-Coles-parametrar per liga (glomska xi, shrink, prior for nya lag) i point-in-time-backtest.
// Samma upplagg som pro-layer: veckovis refit, sasong 2025/26 + 2026/27, matt i RPS 1X2.
// Standardparametrarna behalls om ingen kandidat ar minst MIN_GAIN battre (skydd mot brus).
// Kors: npm run tune  -> config/league-models.json (lases av pro-layer.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { devigMultiplicative, predictDixonColes, rps1x2, round } from './pro/lib.mjs';
import { DEFAULT_PARAMS, EARLY_ROUNDS, buildTiers, fitLeagueModel } from './pro/league-models.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const store = readJson(path.join(root, 'data', 'betting-store.json'));
const tiers = buildTiers(readJson(path.join(root, 'config', 'leagues.json')));
const OUT = path.join(root, 'config', 'league-models.json');
const SEASONS = new Set(['2025/26', '2026/27']);
const MIN_GAIN = 0.0005;
const MIN_EVAL = 150;
const DRAW_KS = [1, 1.05, 1.1];
// Marknaden styr tidiga tips bara om den ar klart battre an (tunad) modell i omgang 1-EARLY_ROUNDS
const EARLY_MARKET_GAP = 0.01;
const EARLY_MIN_N = 60;

const byLeague = {};
for (const m of store.matches.filter((x) => Number.isFinite(x.hg) && Number.isFinite(x.ag)).sort((a, b) => a.date.localeCompare(b.date))) {
  (byLeague[m.league] ??= []).push(m);
}

const grid = [];
for (const xi of [0.0015, 0.0025, 0.004]) {
  for (const shrink of [2, 5]) {
    for (const prior of [false, true]) grid.push({ ...DEFAULT_PARAMS, xi, shrink, prior });
  }
}

function weekStart(date) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// RPS for varje drawK (samma fit) + tidiga omgangar: modell vs marknadens oppningsodds (snitt, devig)
function score(league, params) {
  const list = byLeague[league];
  const byWeek = new Map();
  for (const m of list) if (SEASONS.has(m.season)) byWeek.set(weekStart(m.date), [...(byWeek.get(weekStart(m.date)) ?? []), m]);
  const played = new Map(); // lag|sasong -> ligamatcher hittills
  const sums = DRAW_KS.map(() => 0);
  const early = { model: DRAW_KS.map(() => 0), market: 0, n: 0 };
  let n = 0;
  for (const [week, wm] of [...byWeek].sort()) {
    const teams = wm.flatMap((m) => [m.home, m.away]);
    const model = fitLeagueModel(list, week, { ...params, drawK: 1 }, { league, byLeague, tiers, teams });
    if (!model) continue;
    for (const m of wm) {
      const p = predictDixonColes(model, m.home, m.away);
      const mkt = devigMultiplicative([m.odds?.home, m.odds?.draw, m.odds?.away]);
      const isEarly = Math.min(played.get(`${m.home}|${m.season}`) ?? 0, played.get(`${m.away}|${m.season}`) ?? 0) < EARLY_ROUNDS;
      DRAW_KS.forEach((k, i) => {
        const t = p.home + k * p.draw + p.away;
        const r = rps1x2([p.home / t, (k * p.draw) / t, p.away / t], m.result);
        sums[i] += r;
        if (isEarly && mkt) early.model[i] += r;
      });
      if (isEarly && mkt) {
        early.market += rps1x2(mkt, m.result);
        early.n++;
      }
      n++;
    }
    for (const m of wm) for (const t of [m.home, m.away]) played.set(`${t}|${m.season}`, (played.get(`${t}|${m.season}`) ?? 0) + 1);
  }
  if (!n) return null;
  return DRAW_KS.map((drawK, i) => ({
    params: { ...params, drawK }, rps: sums[i] / n, n,
    early: early.n ? { n: early.n, rpsModel: early.model[i] / early.n, rpsMarket: early.market / early.n } : null,
  }));
}

const only = process.argv.slice(2);
const previous = fs.existsSync(OUT) ? readJson(OUT).leagues ?? {} : {};
const leagues = {};
for (const league of Object.keys(byLeague).sort()) {
  if (only.length && !only.includes(league)) {
    if (previous[league]) leagues[league] = previous[league];
    continue;
  }
  const base = score(league, DEFAULT_PARAMS)?.[0];
  if (!base || base.n < MIN_EVAL) continue;
  let best = base;
  for (const params of grid) {
    for (const s of score(league, params) ?? []) if (s.rps < best.rps) best = s;
  }
  const chosen = base.rps - best.rps >= MIN_GAIN ? best : base;
  const e = chosen.early;
  const earlyMarket = !!e && e.n >= EARLY_MIN_N && e.rpsModel - e.rpsMarket >= EARLY_MARKET_GAP;
  leagues[league] = {
    params: { xi: chosen.params.xi, shrink: chosen.params.shrink, prior: chosen.params.prior, drawK: chosen.params.drawK, earlyMarket },
    rpsDefault: round(base.rps),
    rpsTuned: round(chosen.rps),
    n: base.n,
    early: e ? { n: e.n, rpsModel: round(e.rpsModel), rpsMarket: round(e.rpsMarket) } : null,
  };
  console.log(`${league.padEnd(5)} n=${base.n} RPS ${round(base.rps)} -> ${round(chosen.rps)}  ${JSON.stringify(leagues[league].params)}  tidigt ${JSON.stringify(leagues[league].early)}`);
}

fs.writeFileSync(OUT, JSON.stringify({
  updatedAt: new Date().toISOString(),
  method: `Point-in-time veckorefit, sasong ${[...SEASONS].join(' + ')}, RPS 1X2. Grid xi x shrink x prior x drawK; byter fran standard bara vid >= ${MIN_GAIN} battre RPS. earlyMarket nar marknaden (snitt oppningsodds) ar >= ${EARLY_MARKET_GAP} battre i omgang 1-${EARLY_ROUNDS} (minst ${EARLY_MIN_N} matcher).`,
  defaults: DEFAULT_PARAMS,
  leagues,
}, null, 2), 'utf8');
console.log(`Skrev ${path.relative(root, OUT)} (${Object.keys(leagues).length} ligor)`);
