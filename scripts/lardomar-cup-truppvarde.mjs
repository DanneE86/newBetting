// Lärdom: när truppvärdet skiljer mycket i internationella cuper (CL, EL, ECL, Libertadores, Sudamericana),
// hur ofta vinner det billigare laget? Truppvärde vid tillfället (Transfermarkt, klubbens trupp samma säsong).
// Matcher avgjorda på straffar eller efter förlängning räknas inte (90-minutersresultatet syns inte).
// Modell: P(1X2) ur x = ln(värde hemma / värde borta), multinomial logit tränad på äldre säsonger och prövad på de
// senaste (kontroll), mot en modell med bara hemmafördel. Kör: node scripts/fetch-cup-history-tm.mjs först.
//   node scripts/lardomar-cup-truppvarde.mjs [--json data/reports/cup-truppvarde.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUP_HISTORY_COMPS } from './lib/tm-cup-history.mjs';
import { blendMarket, cupValueRows, fitValueModel, joinMarket, valueModelProbs, RATIO_BUCKETS } from './lib/cup-value-model.mjs';
import { nameScore } from './lib/match-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = JSON.parse(fs.readFileSync(path.join(root, 'data', 'open', 'cup-history-tm.json'), 'utf8'));
const rows = cupValueRows(doc);
const pct = (a, n) => (n ? `${((100 * a) / n).toFixed(1)} %` : '–');
const out = { updatedAt: new Date().toISOString(), matches: rows.length, groups: {} };

function table(label, R) {
  console.log(`\n${label} (n ${R.length})`);
  console.log('  kvot dyr/billig   n     dyra vinner  oavgjort   billiga vinner   (billiga hemma: vinner / n)');
  const res = [];
  for (const [lo, hi] of RATIO_BUCKETS) {
    const B = R.filter((r) => r.ratio >= lo && r.ratio < hi);
    if (!B.length) continue;
    const rich = B.filter((r) => r.richRes === 'W').length, draw = B.filter((r) => r.richRes === 'D').length, poor = B.filter((r) => r.richRes === 'L').length;
    const ph = B.filter((r) => !r.richHome);
    const phW = ph.filter((r) => r.richRes === 'L').length;
    console.log(`  ${`${lo}–${hi === Infinity ? '' : hi}`.padEnd(14)} ${String(B.length).padStart(5)}   ${pct(rich, B.length).padStart(9)}   ${pct(draw, B.length).padStart(8)}   ${pct(poor, B.length).padStart(12)}      ${pct(phW, ph.length)} / ${ph.length}`);
    res.push({ lo, hi: hi === Infinity ? null : hi, n: B.length, richWin: rich / B.length, draw: draw / B.length, poorWin: poor / B.length, poorHomeN: ph.length, poorHomeWin: ph.length ? phW / ph.length : null });
  }
  return res;
}

for (const [k, R] of [
  ['Alla cuper', rows],
  ['Europa (CL, EL, ECL)', rows.filter((r) => CUP_HISTORY_COMPS[r.league].region === 'Europa')],
  ['Sydamerika (Libertadores, Sudamericana)', rows.filter((r) => CUP_HISTORY_COMPS[r.league].region === 'Sydamerika')],
  ...Object.keys(CUP_HISTORY_COMPS).map((c) => [c, rows.filter((r) => r.league === c)]),
]) out.groups[k] = table(k, R);

// Modell: träna på allt utom de två senaste säsongerna, pröva på dem (per region)
const ll = (R, f) => R.reduce((s, r) => s - Math.log(f(r)['HDA'.indexOf(r.res)]), 0) / R.length;
const hit = (R, f) => R.filter((r) => { const p = f(r); return p.indexOf(Math.max(...p)) === 'HDA'.indexOf(r.res); }).length / R.length;
out.model = {};
for (const region of ['Europa', 'Sydamerika']) {
  const R = rows.filter((r) => CUP_HISTORY_COMPS[r.league].region === region);
  const last = Math.max(...R.map((r) => r.season));
  const A = R.filter((r) => r.season < last - 1), B = R.filter((r) => r.season >= last - 1);
  const base = fitValueModel(A, { useValue: false });
  const m = fitValueModel(A);
  const fB = (mod) => (r) => valueModelProbs(mod, r.x);
  console.log(`\n${region}: träning ${A.length} matcher (t.o.m. säsong ${last - 2}), kontroll ${B.length} (säsong ${last - 1}–${last})`);
  console.log(`  bara hemmafördel: logloss ${ll(B, fB(base)).toFixed(4)}, träff ${(100 * hit(B, fB(base))).toFixed(1)} %`);
  console.log(`  + truppvärde:     logloss ${ll(B, fB(m)).toFixed(4)}, träff ${(100 * hit(B, fB(m))).toFixed(1)} %  (b ${m.b.toFixed(3)} per ln-enhet)`);
  for (const x of [Math.log(2), Math.log(5), Math.log(10)]) {
    const [h, d, a] = valueModelProbs(m, x).map((p) => (100 * p).toFixed(0));
    const [h2, d2, a2] = valueModelProbs(m, -x).map((p) => (100 * p).toFixed(0));
    console.log(`    hemma ${Math.exp(x).toFixed(0)}x dyrare: 1 ${h} / X ${d} / 2 ${a} %   borta ${Math.exp(x).toFixed(0)}x dyrare: 1 ${h2} / X ${d2} / 2 ${a2} %`);
  }
  out.model[region] = { ...fitValueModel(R), train: A.length, test: B.length, testLogloss: { base: ll(B, fB(base)), value: ll(B, fB(m)) }, testHit: { base: hit(B, fB(base)), value: hit(B, fB(m)) } };
}

// Mot marknaden (OddsPortal-snitt): prisar oddsen redan in truppvärdet?
const oddsArg = process.argv.indexOf('--odds');
const oddsFile = oddsArg > 0 ? path.resolve(process.argv[oddsArg + 1]) : path.join(root, 'data', 'open', 'cup-odds-history.json');
if (fs.existsSync(oddsFile)) {
  const joined = joinMarket(rows, JSON.parse(fs.readFileSync(oddsFile, 'utf8')), (a, b) => nameScore(a, null, b));
  console.log(`\nMot oddsen: ${joined} av ${rows.length} matcher kopplade till OddsPortal-odds`);
  out.market = {};
  for (const region of ['Europa', 'Sydamerika']) {
    const R = rows.filter((r) => r.market && CUP_HISTORY_COMPS[r.league].region === region);
    if (R.length < 50) continue;
    console.log(`\n${region} (n ${R.length}): billiga lagets vinstchans enligt oddsen mot utfallet`);
    console.log('  kvot dyr/billig   n     oddsen säger   billiga vann   skillnad   ROI spel på billiga (snittodds)');
    const buckets = [];
    for (const [lo, hi] of RATIO_BUCKETS) {
      const B = R.filter((r) => r.ratio >= lo && r.ratio < hi);
      if (B.length < 10) continue;
      const poorIdx = (r) => (r.richHome ? 2 : 0);
      const exp = B.reduce((s, r) => s + r.market[poorIdx(r)], 0) / B.length;
      const act = B.filter((r) => r.richRes === 'L').length / B.length;
      const roi = B.reduce((s, r) => s + (r.richRes === 'L' ? r.odds[poorIdx(r)] - 1 : -1), 0) / B.length;
      console.log(`  ${`${lo}–${hi === Infinity ? '' : hi}`.padEnd(14)} ${String(B.length).padStart(5)}   ${pct(exp * B.length, B.length).padStart(11)}   ${pct(act * B.length, B.length).padStart(11)}   ${((act - exp) * 100).toFixed(1).padStart(6)} enh   ${(roi * 100).toFixed(1).padStart(6)} %`);
      buckets.push({ lo, hi: hi === Infinity ? null : hi, n: B.length, market: exp, actual: act, roi });
    }
    // Oddsen + truppvärdet: vikt k vald på äldre säsonger, prövad på de två senaste
    const last = Math.max(...R.map((r) => r.season));
    const A = R.filter((r) => r.season < last - 1), T = R.filter((r) => r.season >= last - 1);
    const llk = (S, k) => S.reduce((s, r) => s - Math.log(blendMarket(r.market, r.x, k)['HDA'.indexOf(r.res)]), 0) / S.length;
    let k = 0;
    for (let v = -0.3; v <= 0.30001; v += 0.01) if (llk(A, v) < llk(A, k)) k = v;
    const d = T.map((r) => -Math.log(blendMarket(r.market, r.x, k)['HDA'.indexOf(r.res)]) + Math.log(r.market['HDA'.indexOf(r.res)]));
    const md = d.reduce((s, v) => s + v, 0) / d.length, sd = Math.sqrt(d.reduce((s, v) => s + (v - md) ** 2, 0) / d.length);
    console.log(`  Oddsen + truppvärde: k ${k.toFixed(2)} (träning ${A.length}), kontroll ${T.length}: logloss ${llk(T, 0).toFixed(4)} -> ${llk(T, k).toFixed(4)} (z ${(md / (sd / Math.sqrt(d.length))).toFixed(1)}, negativt = bättre)`);
    out.market[region] = { n: R.length, buckets, k, train: A.length, test: T.length, testLogloss: { market: llk(T, 0), blend: llk(T, k) } };
  }
}

const j = process.argv.indexOf('--json');
if (j > 0) fs.writeFileSync(path.join(root, process.argv[j + 1]), JSON.stringify(out, null, 1));
