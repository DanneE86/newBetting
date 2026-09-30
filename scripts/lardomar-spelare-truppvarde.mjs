// Lärdomar ur spelardatan: tillför truppens marknadsvärde (de 14 med flest ligaminuter, värde vid matchdatum)
// något utöver tipsens sannolikheter (data/reports/tips-backtest.json) och stängningsodds? Per liga, och ett
// halvtest för ligor utan odds (vikt k väljs på första halvan: p' ∝ p · exp(k·x·[1, 0, −1]), x = ln(värde hemma / borta)).
// Kör: node scripts/lardomar-spelare-truppvarde.mjs
import fs from 'node:fs';
import { root as ROOT } from './lib/learnings-data.mjs';
const rd = (p) => JSON.parse(fs.readFileSync(`${ROOT}/${p}`, 'utf8'));
const tb = rd('data/reports/tips-backtest.json').matches;
const csv = (c) => { const L = fs.readFileSync(`${ROOT}/data/matcher/${c}.csv`, 'utf8').trim().split('\n'); const h = L[0].split(','); return L.slice(1).map((l) => { const v = l.split(','); return Object.fromEntries(h.map((k, i) => [k, v[i]])); }); };
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
function reg1(xs, ys) { const n = xs.length; if (n < 20) return null; const mx = mean(xs), my = mean(ys); let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); } const b = sxy / sxx; let sse = 0;
  for (let i = 0; i < n; i++) sse += (ys[i] - my - b * (xs[i] - mx)) ** 2; return { n, b, z: b / Math.sqrt(sse / (n - 2) / sxx) }; }
const valAt = (p, d) => { let v = null; for (const [dt, x] of p.marketValueHistory ?? []) if (dt <= d) v = x; return v ?? p.info?.marketValue ?? 0; };
const codes = fs.readdirSync(`${ROOT}/data/spelare`).filter((f) => !f.startsWith('_')).map((f) => f.slice(0, -5)).filter((c) => !['CL', 'EL', 'ECL'].includes(c));
const all = [];
for (const c of codes) {
  const sp = rd(`data/spelare/${c}.json`);
  // truppvärde = de 14 med flest ligaminuter i år (nuvarande trupp), värde vid matchdatum
  const sq = Object.fromEntries(Object.entries(sp.teams).map(([t, T]) => [t, T.players.filter((p) => (p.league?.minutes_played ?? 0) > 0)
    .sort((a, b) => b.league.minutes_played - a.league.minutes_played).slice(0, 14)]));
  const sv = (t, d) => (sq[t] ?? []).reduce((s, p) => s + valAt(p, d), 0);
  const odds = Object.fromEntries(csv(c).filter((r) => r.status === 'spelad').map((r) => [`${r.date}|${r.home}|${r.away}`, r]));
  const from = ['AS', 'NO', 'NO2', 'SE2', 'BR', 'BR2', 'AR', 'JP1', 'MLS', 'COL', 'MX'].includes(c) ? '2026-03-01' : '2026-07-15';
  const R = [];
  for (const m of tb.filter((m) => m.league === c && m.date >= from && m.p)) {
    const vh = sv(m.home, m.date), va = sv(m.away, m.date); if (!vh || !va || !sq[m.home]?.length || !sq[m.away]?.length) continue;
    const x = Math.log(vh / va);
    const pts = m.result === 'H' ? 3 : m.result === 'D' ? 1 : 0;
    const o = odds[`${m.date}|${m.home}|${m.away}`];
    R.push({ c, date: m.date, p: m.p, res: m.result, x, resM: pts - (3 * m.p[0] + m.p[1]), resO: o?.close_h ? pts - (3 * +o.close_h + +o.close_d) : null, pts });
  }
  const s = reg1(R.map((r) => r.x), R.map((r) => r.resM)); const RO = R.filter((r) => r.resO != null);
  const so = reg1(RO.map((r) => r.x), RO.map((r) => r.resO));
  console.log(`${c.padEnd(4)} n ${String(R.length).padStart(3)} | mot modellen b ${s ? s.b.toFixed(3) : '–'} z ${s ? s.z.toFixed(1) : '–'} | mot stängningsodds (n ${RO.length}) z ${so ? so.z.toFixed(1) : '–'}`);
  all.push(...R);
}
const noOdds = all.filter((r) => ['BR2', 'COL', 'CZ', 'HR', 'NO2', 'SE2'].includes(r.c));
for (const [k, R] of [['Alla', all], ['Ligor utan odds', noOdds], ['Ligor med odds', all.filter((r) => r.resO != null)]]) {
  const s = reg1(R.map((r) => r.x), R.map((r) => r.resM)); const RO = R.filter((r) => r.resO != null); const so = reg1(RO.map((r) => r.x), RO.map((r) => r.resO));
  console.log(`${k.padEnd(16)} n ${R.length} | mot modellen b ${s?.b.toFixed(3)} z ${s?.z.toFixed(1)} | mot stängningsodds z ${so ? so.z.toFixed(1) : '–'}`);
}

// Halvor: vikt k väljs på första halvan (per datum), logloss på andra. p' ∝ p * exp(k*x*[1,0,-1])
const adj = (p, x, k) => { const q = [p[0] * Math.exp(k * x), p[1], p[2] * Math.exp(-k * x)]; const z = q[0] + q[1] + q[2]; return q.map((v) => v / z); };
const ll = (R, k) => mean(R.map((r) => -Math.log(adj(r.p, r.x, k)['HDA'.indexOf(r.res)])));
const hit = (R, k) => mean(R.map((r) => { const q = adj(r.p, r.x, k); return q.indexOf(Math.max(...q)) === 'HDA'.indexOf(r.res) ? 1 : 0; }));
const ds = noOdds.map((r) => r.date).sort(); const mid = ds[Math.floor(ds.length / 2)];
const A = noOdds.filter((r) => r.date < mid), B = noOdds.filter((r) => r.date >= mid);
let best = 0; for (let k = 0; k <= 1.0001; k += 0.02) if (ll(A, k) < ll(A, best)) best = k;
const d = B.map((r) => -Math.log(adj(r.p, r.x, best)['HDA'.indexOf(r.res)]) + Math.log(r.p['HDA'.indexOf(r.res)]));
const sd = Math.sqrt(mean(d.map((v) => (v - mean(d)) ** 2)));
console.log('mitt', mid, 'k (träning)', best.toFixed(2), '| kontroll n', B.length, 'logloss', ll(B, 0).toFixed(4), '->', ll(B, best).toFixed(4), 'z', (mean(d) / (sd / Math.sqrt(d.length))).toFixed(1), '| träff', (hit(B, 0) * 100).toFixed(1), '->', (hit(B, best) * 100).toFixed(1));
for (const c of ['BR2','COL','CZ','HR','NO2','SE2']) { const Q = B.filter((r) => r.c === c); console.log(' ', c, 'n', Q.length, 'll', ll(Q, 0).toFixed(4), '->', ll(Q, best).toFixed(4), 'träff', (hit(Q,0)*100).toFixed(1), '->', (hit(Q,best)*100).toFixed(1)); }
// omvänt: träna på B, testa på A
let best2 = 0; for (let k = 0; k <= 1.0001; k += 0.02) if (ll(B, k) < ll(B, best2)) best2 = k;
console.log('omvänt: k', best2.toFixed(2), 'A logloss', ll(A, 0).toFixed(4), '->', ll(A, best2).toFixed(4), 'träff', (hit(A,0)*100).toFixed(1), '->', (hit(A,best2)*100).toFixed(1));
console.log('Första halvan med k 0.12:', ll(A,0).toFixed(4),'->',ll(A,0.12).toFixed(4), '| k 0.06 kontroll', ll(B,0.06).toFixed(4));
