// Backtest av Stryktipset-systemen (A 5-3-2, B 4-3-3) pa avgjorda omgangar efter sommaren med minst en PL-match.
// Samma analys som fetch-stryktipset.mjs (klubbmodell med cutoff = omgangens forsta match, sa ingen framtidsdata),
// odds/streck = Svenska Spels slutliga varden for omgangen. Facit och verklig utdelning fran Svenska Spel.
// Utdata: data/stryktips-backtest.json (eller --out)
//   node scripts/backtest-stryktipset.mjs                         (omgangar fran 2026-08-01)
//   node scripts/backtest-stryktipset.mjs --to 2026-06-30 --count 12 --out data/stryktips-backtest-2526.json
//   STRYK_SEASONS=2627,2526,2425 node scripts/backtest-stryktipset.mjs --from 2025-08-01 --to 2026-06-30 --product europatipset --out ...
//   (STRYK_MODEL_W styr modellvikten, for jamforelse mot aldre installningar)
//     (de 12 sista omgangarna med PL-match fore 2026-06-30, dvs slutet av sasongen 2025/26)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeDraw, evaluateSnapshot, loadNationalElo, loadGroup, fitModel } from './fetch-stryktipset.mjs';
import { loadDraw } from './lib/tips-archive.mjs'; // arkivet forst (data/tips-archive), annars API:t (och sparas)

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const OUT = path.resolve(root, arg('out', 'data/stryktips-backtest.json'));
const FROM = arg('from', process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '2026-08-01');
const TO = arg('to', '9999');
const COUNT = Number(arg('count', 999));
const TO_FROM = arg('to') && !arg('from') ? '0000' : FROM; // bara --to: antal omgangar bakat; --from + --to: intervall
// --product stryktipset | europatipset (samma regler for bada)
const PRODUCTS = { stryktipset: { id: 'stryktipset', name: 'Stryktipset', start: 4972 }, europatipset: { id: 'europatipset', name: 'Europatipset', start: 2611 } };
const PRODUCT = PRODUCTS[arg('product', 'stryktipset')];
const START_DRAW = Number(arg('start', PRODUCT.start));
// Urval: Stryktipset = minst 1 PL-match. Europatipset = minst 3 matcher fran topp 4-ligorna (PL, La Liga, Serie A, Bundesliga).
// --all tar alla omgangar.
const TOP4 = new Set(['Premier League', 'La Liga', 'Serie A', 'Bundesliga']);
const ALL = process.argv.includes('--all');
const SIGNS = ['1', 'X', '2'];
const log = (s) => process.stdout.write(`${s}\n`);
const r3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);

const groupCache = new Map();
const ctx = {
  elo: await loadNationalElo(),
  async group(group, cutoff) {
    const key = `${group}|${cutoff}`;
    if (!groupCache.has(key)) {
      if (!groupCache.has(group)) groupCache.set(group, await loadGroup(group));
      const all = groupCache.get(group);
      groupCache.set(key, { all, model: fitModel(all, cutoff) });
    }
    return groupCache.get(key);
  },
};

const logLoss = (p, k) => (p ? -Math.log(Math.max(p[k], 1e-6)) : null);
const draws = [];
for (let n = START_DRAW; n > START_DRAW - 200 && draws.length < COUNT; n--) {
  const entry = await loadDraw(PRODUCT.id, n).catch(() => null);
  const d = entry?.draw || null;
  if (!d) continue;
  if ((d.regCloseTime || '') > TO) continue;
  if ((d.regCloseTime || '') < TO_FROM) break;
  const pl = (d.drawEvents || []).filter((e) => e.match?.league?.name === 'Premier League').length;
  const top4 = (d.drawEvents || []).filter((e) => TOP4.has(e.match?.league?.name)).length;
  const ok = ALL || (PRODUCT.id === 'europatipset' ? top4 >= 3 : pl > 0);
  if (!ok) { log(`omgång ${n} (${d.regCloseTime.slice(0, 10)}): PL ${pl}, topp 4 ${top4} – hoppar över`); continue; }
  const result = entry?.result || null;
  if (!result?.events?.length || !result.distribution?.length) { log(`omgång ${n}: facit saknas`); continue; }
  const a = await analyzeDraw(PRODUCT, d, ctx, result);
  const outcomes = a.events.map((e) => e.result?.outcome);
  if (outcomes.some((o) => !o)) { log(`omgång ${n}: ofullständigt facit`); continue; }
  const snap = (red, key) => red && { rowList: red.rowList, cost: red.cost, picks: a.events.map((e) => e[key]?.signs || '') };
  const evalA = a.reduced ? evaluateSnapshot(snap(a.reduced, 'systemPick'), outcomes, result.distribution) : null;
  const evalB = a.reducedB ? evaluateSnapshot(snap(a.reducedB, 'systemPickB'), outcomes, result.distribution) : null;
  const matches = a.events.map((e) => {
    const k = SIGNS.indexOf(e.result.outcome);
    return {
      n: e.eventNumber, match: `${e.home} - ${e.away}`, league: e.league, basis: e.basis, outcome: e.result.outcome, score: e.result.score,
      final: e.final, market: e.market, model: e.model, folk: e.folk,
      pOutcome: r3(e.final[k]), folkOutcome: r3(e.folk?.[k]),
      pickA: e.systemPick?.signs, pickB: e.systemPickB?.signs,
      inA: e.systemPick?.signs.includes(e.result.outcome) ?? null, inB: e.systemPickB?.signs.includes(e.result.outcome) ?? null,
      ll: { final: r3(logLoss(e.final, k)), market: r3(logLoss(e.market, k)), model: r3(logLoss(e.model, k)), folk: r3(logLoss(e.folk, k)) },
    };
  });
  draws.push({
    drawNumber: n, date: d.regCloseTime.slice(0, 10), plMatches: pl, top4Matches: top4, outcomes: outcomes.join(''),
    draws13: outcomes.filter((o) => o === 'X').length,
    prize13: result.distribution[0] ? { amount: result.distribution[0].amount, winners: result.distribution[0].winners } : null,
    A: a.reduced && { rows: a.reduced.rows, cost: a.reduced.cost, grund: a.reduced.grundRows, payoutMin: a.reduced.rules.payoutMin, hit: a.reduced.hitAll, er: a.reduced.expectedReturn, ...evalA },
    B: a.reducedB && { rows: a.reducedB.rows, cost: a.reducedB.cost, grund: a.reducedB.grundRows, payoutMin: a.reducedB.rules.payoutMin, hit: a.reducedB.hitAll, er: a.reducedB.expectedReturn, union: a.reducedB.unionHit, overlap: a.reducedB.overlapRows, ...evalB },
    pairBest: Math.max(evalA?.best ?? 0, evalB?.best ?? 0),
    grundA: evalA?.groundCorrect, grundB: evalB?.groundCorrect,
    matches,
  });
  log(`omgång ${n} ${d.regCloseTime.slice(0, 10)} (PL ${pl}): facit ${outcomes.join('')} · A bästa ${evalA?.best ?? '-'} (${evalA?.net ?? '-'} kr) · B bästa ${evalB?.best ?? '-'} (${evalB?.net ?? '-'} kr) · grundrad A ${evalA?.groundCorrect}/13`);
}

// Sammanfattning
const all = draws.flatMap((d) => d.matches);
const mean = (xs) => { const v = xs.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const byKey = (key) => mean(all.map((m) => m.ll[key]));
const spik = (sys) => {
  const s = all.filter((m) => m[`pick${sys}`]?.length === 1);
  return { n: s.length, lost: s.filter((m) => !m[`in${sys}`]).length };
};
const rowQuality = (sys) => {
  const c = {};
  for (const d of draws) for (const [k, v] of Object.entries(d[sys]?.perClass || {})) c[k] = (c[k] || 0) + v;
  const ge = (n) => Object.entries(c).filter(([k]) => +k >= n).reduce((a, [, v]) => a + v, 0);
  const rows = draws.reduce((a, d) => a + (d[sys]?.rows || 0), 0);
  return { rows, ge9: ge(9), ge10: ge(10), ge11: ge(11), meanCorrect: r3(Object.entries(c).reduce((a, [k, v]) => a + k * v, 0) / rows),
    xCovered: all.filter((m) => m.outcome === 'X' && m[`in${sys}`]).length, xTotal: all.filter((m) => m.outcome === 'X').length };
};
const summary = {
  product: PRODUCT.id, from: draws.at(-1)?.date, to: draws[0]?.date, draws: draws.length, matches: all.length,
  modelWeight: Number(process.env.STRYK_MODEL_W ?? 0.1), seasons: process.env.STRYK_SEASONS || '2627,2526',
  A: { cost: draws.reduce((s, d) => s + (d.A?.cost || 0), 0), winnings: draws.reduce((s, d) => s + (d.A?.winnings || 0), 0), best: draws.map((d) => d.A?.best), spik: spik('A') },
  B: { cost: draws.reduce((s, d) => s + (d.B?.cost || 0), 0), winnings: draws.reduce((s, d) => s + (d.B?.winnings || 0), 0), best: draws.map((d) => d.B?.best), spik: spik('B') },
  drawRate: { actual: r3(all.filter((m) => m.outcome === 'X').length / all.length), predicted: r3(mean(all.map((m) => m.final[1]))), folk: r3(mean(all.map((m) => m.folk?.[1]))) },
  favouriteWinRate: r3(mean(all.map((m) => (m.final.indexOf(Math.max(...m.final)) === SIGNS.indexOf(m.outcome) ? 1 : 0)))),
  logLoss: { final: r3(byKey('final')), market: r3(byKey('market')), model: r3(byKey('model')), folk: r3(byKey('folk')) },
  byLeague: Object.fromEntries([...new Set(all.map((m) => m.league))].map((lg) => {
    const ms = all.filter((m) => m.league === lg);
    return [lg, { n: ms.length, draws: ms.filter((m) => m.outcome === 'X').length, favWin: ms.filter((m) => m.final.indexOf(Math.max(...m.final)) === SIGNS.indexOf(m.outcome)).length, llFinal: r3(mean(ms.map((m) => m.ll.final))), llMarket: r3(mean(ms.map((m) => m.ll.market))) }];
  })),
};
summary.A.net = summary.A.winnings - summary.A.cost;
summary.B.net = summary.B.winnings - summary.B.cost;
summary.A.quality = rowQuality('A');
summary.B.quality = rowQuality('B');
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, draws }, null, 2), 'utf8');
log(`\nKlart: ${draws.length} omgångar -> ${path.relative(root, OUT)}`);
log(JSON.stringify({ ...summary, byLeague: undefined }, null, 1));
