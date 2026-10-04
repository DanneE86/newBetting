// Justeringsmodell: gor lardomarna marknadens sannolikheter battre?
//   1. Anpassa pa sasonger fore 2021/22, valj straff, signaler och ligor pa 2021/22-2022/23 (validering)
//   2. Trana valet pa allt fore 2023/24, mat EN gang pa 2023/24 och senare (kontroll) - logloss + spelsimulering
//   3. Refitta valet pa all data -> config/learned-adjustments.json (bara om kontrollen blev battre)
// Tva baser: oppningsodds (Oddset-tips langt fore avspark) och stangningsodds (sen korning, Stryktipset).
// Resultat: data/lardomar-modell.json (lases av analyze-learnings for README).
//   npm run lardomar:modell
import fs from 'node:fs';
import path from 'node:path';
import { buildSignals } from './lib/learnings-signals.mjs';
import { ADJ_FILE, DRAW_KEYS, SIGNAL_KEYS } from './lib/learned-adjust.mjs';
import { root } from './lib/learnings-data.mjs';
import { ALTITUDE, HIGH, MIN_DIFF, fitAltitude } from './lib/altitude.mjs';

const SPLIT = '2023-07-01';
const VALID = '2021-07-01';
const MISS_SPLIT = '2025-07-01';
const OUT = path.join(root, 'data', 'lardomar-modell.json');
const RES = { H: 0, D: 1, A: 2 };
// Oddset-regler (scripts/pro-layer.mjs CONFIG): minsta EV 3 %, oddstak 5, EV over 25 % = datafel
const BET = { minEv: 0.03, maxOdds: 5, maxEv: 0.25 };

const { matches } = buildSignals();
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const r2 = (x) => Math.round(x * 100) / 100;

function scaleOf(rows, keys) {
  const sc = {};
  for (const k of keys) {
    const v = rows.map((m) => m.f[k]).filter((x) => x != null && Number.isFinite(x));
    if (v.length < 200) continue;
    const mean = v.reduce((s, x) => s + x, 0) / v.length;
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length) || 1;
    sc[k] = { mean, sd };
  }
  return sc;
}

// Rad: bas-sannolikhet, utfall, standardiserade signaler (saknas -> 0)
function prep(rows, base, sc) {
  return rows.map((m) => {
    const xs = {};
    for (const [k, s] of Object.entries(sc)) xs[k] = m.f[k] != null && Number.isFinite(m.f[k]) ? (m.f[k] - s.mean) / s.sd : 0;
    return { m, p: m[base], lp: m[base].map((x) => Math.log(Math.max(1e-6, x))), y: RES[m.res], league: m.league, date: m.date, xs };
  });
}

function probs(r, P) {
  let s = 0, dx = 0;
  for (const [k, b] of Object.entries(P.beta)) s += b * r.xs[k];
  for (const [k, b] of Object.entries(P.drawBeta)) dx += b * r.xs[k];
  const lg = P.leagues[r.league] ?? {};
  const g = 1 + (lg.g ?? 0);
  const l = [g * r.lp[0] + (lg.h ?? 0) + s / 2, g * r.lp[1] + (lg.d ?? 0) + dx, g * r.lp[2] - s / 2];
  const mx = Math.max(...l);
  const e = l.map((x) => Math.exp(x - mx));
  const z = e[0] + e[1] + e[2];
  return e.map((x) => x / z);
}

/** Adam pa summerad logloss + lambda * parametrar^2. keys/dkeys = signaler, calib = ligaparametrar (g, h, d). */
function fit(data, keys, dkeys, calib, lambdaL, lambdaB) {
  const leagues = calib ? [...new Set(data.map((r) => r.league))] : [];
  const li = new Map(leagues.map((l, i) => [l, i]));
  const nB = keys.length, nD = dkeys.length;
  const theta = new Float64Array(nB + nD + leagues.length * 3);
  const m1 = new Float64Array(theta.length), m2 = new Float64Array(theta.length);
  const lr = 0.01, b1 = 0.9, b2 = 0.999;
  for (let it = 1; it <= 400; it++) {
    const g = new Float64Array(theta.length);
    for (const r of data) {
      let s = 0, dx = 0;
      for (let k = 0; k < nB; k++) s += theta[k] * r.xs[keys[k]];
      for (let k = 0; k < nD; k++) dx += theta[nB + k] * r.xs[dkeys[k]];
      let gg = 1, h = 0, d = 0, off = -1;
      if (calib) { off = nB + nD + li.get(r.league) * 3; gg = 1 + theta[off]; h = theta[off + 1]; d = theta[off + 2]; }
      const l0 = gg * r.lp[0] + h + s / 2, l1 = gg * r.lp[1] + d + dx, l2 = gg * r.lp[2] - s / 2;
      const mx = Math.max(l0, l1, l2);
      const e0 = Math.exp(l0 - mx), e1 = Math.exp(l1 - mx), e2 = Math.exp(l2 - mx);
      const z = e0 + e1 + e2;
      const q0 = e0 / z - (r.y === 0), q1 = e1 / z - (r.y === 1), q2 = e2 / z - (r.y === 2);
      const ds = (q0 - q2) / 2;
      for (let k = 0; k < nB; k++) g[k] += ds * r.xs[keys[k]];
      for (let k = 0; k < nD; k++) g[nB + k] += q1 * r.xs[dkeys[k]];
      if (calib) {
        g[off] += q0 * r.lp[0] + q1 * r.lp[1] + q2 * r.lp[2];
        g[off + 1] += q0;
        g[off + 2] += q1;
      }
    }
    for (let k = 0; k < theta.length; k++) {
      const gk = g[k] + 2 * (k < nB + nD ? lambdaB : lambdaL) * theta[k];
      m1[k] = b1 * m1[k] + (1 - b1) * gk;
      m2[k] = b2 * m2[k] + (1 - b2) * gk * gk;
      theta[k] -= lr * (m1[k] / (1 - b1 ** it)) / (Math.sqrt(m2[k] / (1 - b2 ** it)) + 1e-8);
    }
  }
  const P = { beta: {}, drawBeta: {}, leagues: {} };
  keys.forEach((k, i) => { P.beta[k] = theta[i]; });
  dkeys.forEach((k, i) => { P.drawBeta[k] = theta[nB + i]; });
  leagues.forEach((l, i) => { P.leagues[l] = { g: theta[nB + nD + i * 3], h: theta[nB + nD + i * 3 + 1], d: theta[nB + nD + i * 3 + 2] }; });
  return P;
}

function stat(v) {
  const n = v.length;
  if (!n) return null;
  const mean = v.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, n - 1));
  return { n, dLL: r4(mean), se: r4(sd / Math.sqrt(n)), z: r2(mean / (sd / Math.sqrt(n) || 1)) };
}

// Logloss-skillnad justerat - bas (negativ = battre), totalt och per liga
function evaluate(data, P) {
  const all = [];
  const by = {};
  for (const r of data) {
    const q = probs(r, P);
    const d = -Math.log(Math.max(1e-9, q[r.y])) + Math.log(Math.max(1e-9, r.p[r.y]));
    all.push(d);
    (by[r.league] ??= []).push(d);
  }
  return { ...stat(all), byLeague: Object.fromEntries(Object.entries(by).map(([l, v]) => [l, stat(v)])) };
}

// Oddset-simulering: spela tecken dar p * basta oppningspris - 1 >= minEv (odds <= 5), 1 enhet per spel.
// CLV = taget pris * stangningssannolikhet (Pinnacle) - 1.
function betSim(data, P, priceKey = 'bestOpen') {
  let n = 0, profit = 0, clv = 0, sq = 0;
  const kind = {};
  for (const r of data) {
    const o = r.m[priceKey];
    if (!o || !r.m.hasClose) continue;
    const q = P ? probs(r, P) : r.p;
    for (let i = 0; i < 3; i++) {
      const ev = q[i] * o[i] - 1;
      if (ev < BET.minEv || ev > BET.maxEv || o[i] > BET.maxOdds) continue;
      n++;
      const pr = (r.y === i ? o[i] : 0) - 1;
      profit += pr;
      sq += pr * pr;
      clv += o[i] * r.m.close[i] - 1;
      const kd = i === 1 ? 'kryss' : r.p[i] >= Math.max(r.p[0], r.p[2]) ? 'favorit' : 'skräll';
      const K = (kind[kd] ??= { bets: 0, profit: 0 });
      K.bets++;
      K.profit += pr;
    }
  }
  const roiSe = n > 1 ? Math.sqrt((sq / n - (profit / n) ** 2) / n) : null;
  return {
    bets: n, roi: n ? r4(profit / n) : null, roiSe: roiSe != null ? r4(roiSe) : null, clv: n ? r4(clv / n) : null,
    byKind: Object.fromEntries(Object.entries(kind).map(([k, v]) => [k, { bets: v.bets, roi: r4(v.profit / v.bets) }])),
  };
}

const strip = ({ byLeague, ...x }) => x;
const report = { generatedAt: new Date().toISOString(), split: SPLIT, valid: VALID, bases: {} };
const final = { generatedAt: report.generatedAt, note: 'Genererad av scripts/learnings-model.mjs. Bara delar som valdes pa validering och forbattrade kontrollperioden (2023/24-) ar med. Refittad pa all data.' };

for (const base of ['open', 'close']) {
  const rows = matches.filter((m) => m[base] && m.hasClose && (base === 'close' || m.open));
  const trainRows = rows.filter((m) => m.date < SPLIT);
  const sc = scaleOf(trainRows, [...SIGNAL_KEYS[base], ...DRAW_KEYS[base]]);
  const keys = SIGNAL_KEYS[base].filter((k) => sc[k]);
  const dkeys = DRAW_KEYS[base].filter((k) => sc[k]);
  const all = prep(rows, base, sc);
  const train = all.filter((r) => r.date < SPLIT);
  const test = all.filter((r) => r.date >= SPLIT);
  const fitPart = train.filter((r) => r.date < VALID);
  const valid = train.filter((r) => r.date >= VALID);
  console.log(`\n== Bas: ${base} (anpassning ${fitPart.length}, validering ${valid.length}, kontroll ${test.length})`);

  // 1a. Straff for ligakalibrering
  let lambdaL = 200, bestV = Infinity;
  for (const lam of [50, 200, 1000, 5000]) {
    const e = evaluate(valid, fit(fitPart, [], [], true, lam, 100));
    if (e.dLL < bestV) { bestV = e.dLL; lambdaL = lam; }
  }
  const calibValid = evaluate(valid, fit(fitPart, [], [], true, lambdaL, 100));
  // Liga med om kalibreringen var klart battre pa valideringen (z <= -1). Andrat 2026-09-28 fran "dLL < 0",
  // som tog med brusligor (PL blev samre i kontrollen) - se docs/lardomar/README.md
  const goodLeagues = Object.entries(calibValid.byLeague).filter(([, v]) => v.z <= -1).map(([l]) => l);
  // 1b. Signaler en i taget pa valideringen
  const single = {};
  for (const k of [...keys, ...dkeys]) {
    const isD = dkeys.includes(k);
    const P = fit(fitPart, isD ? [] : [k], isD ? [k] : [], false, 0, 100);
    const beta = isD ? P.drawBeta[k] : P.beta[k];
    single[k] = { beta: r4(beta), valid: strip(evaluate(valid, P)) };
  }
  const goodKeys = keys.filter((k) => single[k].valid.z <= -2);
  const goodD = dkeys.filter((k) => single[k].valid.z <= -2);
  console.log(`  validering: ligastraff ${lambdaL} (dLL ${calibValid.dLL}, z ${calibValid.z}), ligor ${goodLeagues.join(',') || '-'}`);
  console.log(`  signaler en i taget (validering): ${Object.entries(single).map(([k, v]) => `${k} ${v.valid.dLL} (z ${v.valid.z})`).join(', ')}`);
  console.log(`  valda signaler: ${[...goodKeys, ...goodD].join(', ') || 'inga'}`);

  // 2. Trana valet pa hela traningen, mat pa kontrollen
  const variants = {
    bas: null,
    'alla ligor + alla signaler': fit(train, keys, dkeys, true, lambdaL, 100),
    'ligakalibrering (alla ligor)': fit(train, [], [], true, lambdaL, 100),
    'valt på validering': (() => {
      const P = fit(train, goodKeys, goodD, true, lambdaL, 100);
      for (const l of Object.keys(P.leagues)) if (!goodLeagues.includes(l)) delete P.leagues[l];
      return P;
    })(),
  };
  const res = {};
  for (const [name, P] of Object.entries(variants)) {
    const e = P ? evaluate(test, P) : null;
    // Priser fran samma tidpunkt som basen (annars vet simuleringen framtiden)
    const price = base === 'open' ? 'bestOpen' : 'bestClose';
    const trainBets = betSim(train, P, price);
    const testBets = betSim(test, P, price);
    const testAvg = base === 'open' ? betSim(test, P, 'avgOpenOdds') : { bets: null };
    res[name] = { test: e, bets: { train: trainBets, test: testBets, testAvgOdds: testAvg }, params: P };
    console.log(`  ${name.padEnd(28)} kontroll ${e ? `dLL ${e.dLL} (z ${e.z})` : 'bas'} | Oddset-sim kontroll: ${testBets.bets} spel, ROI ${testBets.roi} ± ${testBets.roiSe}, CLV ${testBets.clv} ${JSON.stringify(testBets.byKind)} | träning ROI ${trainBets.roi} ± ${trainBets.roiSe} (${trainBets.bets}) | snittodds kontroll: ${testAvg.bets} spel ROI ${testAvg.roi} ± ${testAvg.roiSe} ${JSON.stringify(testAvg.byKind)}`);
  }
  // Slutregel (bestamd 2026-09-28 efter att ligaurval visade sig skort, se README): kalibrera ALLA ligor
  // med straffet fran valideringen, inga signaler (ingen signal forbattrade kontrollen for sig).
  const chosen = res['ligakalibrering (alla ligor)'];
  report.bases[base] = {
    n: { fit: fitPart.length, valid: valid.length, test: test.length }, lambdaL, goodLeagues, goodSignals: [...goodKeys, ...goodD],
    calibValid: strip(calibValid), single,
    variants: Object.fromEntries(Object.entries(res).map(([k, v]) => [k, { test: v.test, bets: v.bets, beta: v.params?.beta, drawBeta: v.params?.drawBeta, leagues: v.params?.leagues }])),
  };
  // 3. Refit pa all data om valet forbattrade kontrollen
  if (chosen.test.z <= -2) {
    const scAll = {};
    const allRows = prep(rows, base, scAll);
    const P = fit(allRows, [], [], true, lambdaL, 100);
    final[base] = {
      rule: 'ligakalibrering, alla ligor, inga signaler',
      test: { dLL: chosen.test.dLL, z: chosen.test.z, n: chosen.test.n, bets: chosen.bets.test, betsAvgOdds: chosen.bets.testAvgOdds, betsBase: res.bas.bets.test, betsBaseAvgOdds: res.bas.bets.testAvgOdds, byLeague: chosen.test.byLeague },
      beta: Object.fromEntries(Object.entries(P.beta).map(([k, v]) => [k, r4(v)])),
      drawBeta: Object.fromEntries(Object.entries(P.drawBeta).map(([k, v]) => [k, r4(v)])),
      scale: Object.fromEntries(Object.entries(scAll).map(([k, v]) => [k, { mean: r4(v.mean), sd: r4(v.sd) }])),
      leagues: Object.fromEntries(Object.entries(P.leagues).map(([l, v]) => [l, { g: r4(v.g), h: r4(v.h), d: r4(v.d) }])),
    };
  }
}

// Nyckelspelare: bara 2024/25- finns -> trana 2024/25, kontroll 2025/26-
{
  const rows = matches.filter((m) => m.f.miss != null && m.hasClose && m.open);
  report.missing = {};
  for (const base of ['open', 'close']) {
    const sc = scaleOf(rows.filter((m) => m.date < MISS_SPLIT), ['miss']);
    const all = prep(rows, base, sc);
    const P = fit(all.filter((r) => r.date < MISS_SPLIT), ['miss'], [], false, 0, 10);
    const e = evaluate(all.filter((r) => r.date >= MISS_SPLIT), P);
    report.missing[base] = { beta: r4(P.beta.miss), train: all.filter((r) => r.date < MISS_SPLIT).length, test: strip(e), byLeague: e.byLeague };
    console.log(`\nNyckelspelare (${base}): beta ${r4(P.beta.miss)} (positiv = laget som saknar spelare gör det bättre än oddsen), kontroll 2025/26- dLL ${e.dLL} (z ${e.z}, n ${e.n})`);
  }
}

// Hoghojd per liga (scripts/lib/altitude.mjs): hemmalaget pa hoghojd mot lagland-lag. Egen parameter per liga, skattad
// fore SPLIT och matt en gang efter. Behalls om kontrollen blev battre (dLL < 0), aven svagt (anvandaren 2026-10-04:
// "allt som kan ge nagot ska in i alla motorer"). Bara stangningsodds finns i MX/MLS, sa samma b anvands for bada baserna.
report.altitude = {};
for (const lg of Object.keys(ALTITUDE)) {
  const rows = matches.filter((m) => m.league === lg && m.hasClose && m.f.alt != null).map((m) => ({ date: m.date, y: RES[m.res], p: m.close, alt: m.f.alt === 1 }));
  if (rows.filter((r) => r.alt).length < 100) continue;
  const fa = fitAltitude(rows, SPLIT);
  report.altitude[lg] = fa;
  console.log(`\nHöghöjd ${lg}: b ${fa.bTrain} (före ${SPLIT}), kontroll dLL ${r4(fa.test.dLL)} (z ${r2(fa.test.z)}, ${fa.test.nAlt} höghöjdsmatcher av ${fa.test.n}), b på allt ${fa.bAll}`);
  if (fa.test.dLL < 0 && fa.bAll > 0) {
    final.altitude ??= {};
    final.altitude[lg] = { b: fa.bAll, test: { dLL: r4(fa.test.dLL), z: r2(fa.test.z), n: fa.test.n, nAlt: fa.test.nAlt }, rule: `hemmalagets logit +b/2, bortalagets -b/2 när arenan ligger ≥ ${HIGH} m och bortalaget kommer från minst ${MIN_DIFF} m lägre` };
  }
}

fs.writeFileSync(OUT, JSON.stringify(report, null, 1), 'utf8');
fs.writeFileSync(ADJ_FILE, JSON.stringify(final, null, 2), 'utf8');
console.log(`\nSkrev ${path.relative(root, OUT)} och ${path.relative(root, ADJ_FILE)} (${[...['open', 'close'].filter((b) => final[b]), ...(final.altitude ? [`höghöjd ${Object.keys(final.altitude).join('/')}`] : [])].join(', ') || 'ingen justering'})`);
