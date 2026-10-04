// Skript: node scripts/lardomar-lagmonster.mjs (2026-10-04, se docs/lardomar/slutsatser.md)
// Lagmönstren i docs/lardomar/lag/* mot stängningsodds: förutsäger lagets mått i en period utfallet mot marknaden i nästa?
// Mått: x = lagets avvikelse mot marknaden (per match) i period 1, y = samma i period 2. Lutning b (vägd), z.
// Träning: y-period före 2023/24, kontroll: 2023/24 och senare. Krav |z| ≥ 2,5 träning och ≥ 2 kontroll, samma håll.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leagues = fs.readdirSync(`${ROOT}/data/matcher`).filter((f) => f.endsWith('.csv')).map((f) => f.slice(0, -4));
const STRYK = new Set(['PL', 'CH', 'EL1']);
const ms = [];
for (const lg of leagues) {
  const [head, ...lines] = fs.readFileSync(`${ROOT}/data/matcher/${lg}.csv`, 'utf8').trim().split('\n');
  const H = head.split(','); const ix = Object.fromEntries(H.map((h, i) => [h, i]));
  for (const l of lines) {
    const c = l.split(',');
    if (c[ix.status] !== 'spelad') continue;
    const ph = +c[ix.close_h], pd = +c[ix.close_d], pa = +c[ix.close_a];
    if (!(ph > 0 && pd > 0 && pa > 0)) continue;
    const res = c[ix.res];
    ms.push({ lg, season: c[ix.season], date: c[ix.date], home: c[ix.home], away: c[ix.away], ph, pd, pa, res });
  }
}
ms.sort((a, b) => (a.date < b.date ? -1 : 1));
// lag-matcher: poäng − förväntade poäng, kryss − pd, som favorit/underdog
const tm = [];
for (const m of ms) {
  for (const side of ['h', 'a']) {
    const team = side === 'h' ? m.home : m.away;
    const pw = side === 'h' ? m.ph : m.pa, pl = side === 'h' ? m.pa : m.ph;
    const won = (m.res === 'H' && side === 'h') || (m.res === 'A' && side === 'a');
    const pts = won ? 3 : m.res === 'D' ? 1 : 0;
    tm.push({ lg: m.lg, season: m.season, date: m.date, team, side, r: pts - (3 * pw + m.pd), dx: (m.res === 'D') - m.pd, fav: pw >= 0.6, dog: pw <= 0.25, win: won - pw });
  }
}
const groupBy = (xs, f) => { const g = new Map(); for (const x of xs) { const k = f(x); if (!g.has(k)) g.set(k, []); g.get(k).push(x); } return g; };
const seasons = [...new Set(tm.map((x) => x.season))].sort();
const lgSeasons = {}; for (const x of tm) (lgSeasons[x.lg] ||= new Set()).add(x.season);
for (const k in lgSeasons) lgSeasons[k] = [...lgSeasons[k]].sort();
const nextSeason = (s, lg) => lgSeasons[lg][lgSeasons[lg].indexOf(s) + 1];
const isCtrl = (s) => (s.length === 4 ? s >= '2024' : s >= '2023/24');
const mean = (xs, f) => xs.reduce((s, x) => s + f(x), 0) / xs.length;

function slope(pairs) { // pairs: {x, y, w}
  const W = pairs.reduce((s, p) => s + p.w, 0);
  if (pairs.length < 20) return null;
  const mx = pairs.reduce((s, p) => s + p.w * p.x, 0) / W, my = pairs.reduce((s, p) => s + p.w * p.y, 0) / W;
  let sxy = 0, sxx = 0;
  for (const p of pairs) { sxy += p.w * (p.x - mx) * (p.y - my); sxx += p.w * (p.x - mx) ** 2; }
  const b = sxy / sxx;
  let rss = 0; for (const p of pairs) rss += p.w * (p.y - my - b * (p.x - mx)) ** 2;
  const se = Math.sqrt(rss / (pairs.length - 2) / sxx);
  return { b, z: b / se, n: pairs.length };
}
// Bygg par: x = mått över lagets matcher i period A (minst minA), y = mått i period B, w = antal i B
function test(name, periodPairs, f, filt = () => true, minA = 8, minB = 4) {
  const out = { tr: [], ko: [], trS: [], koS: [] };
  for (const { a, b, ySeason, lg } of periodPairs) {
    const A = a.filter(filt), B = b.filter(filt);
    if (A.length < minA || B.length < minB) continue;
    const p = { x: mean(A, f), y: mean(B, f), w: B.length };
    const k = isCtrl(ySeason) ? 'ko' : 'tr';
    out[k].push(p); if (STRYK.has(lg)) out[k + 'S'].push(p);
  }
  const r = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, slope(v)]));
  const ok = r.tr && r.ko && Math.abs(r.tr.z) >= 2.5 && Math.abs(r.ko.z) >= 2 && Math.sign(r.tr.b) === Math.sign(r.ko.b);
  const fmt = (s) => (s ? `b ${s.b.toFixed(3)} z ${s.z.toFixed(1)} (n ${s.n})` : '–');
  console.log(`${ok ? 'HÅLLER ' : '       '}${name.padEnd(46)} träning ${fmt(r.tr)} | kontroll ${fmt(r.ko)} | Stryk-ligor tr ${fmt(r.trS)} ko ${fmt(r.koS)}`);
}
const byTS = groupBy(tm, (x) => `${x.lg}|${x.team}|${x.season}`);
// säsong → nästa
const seasonPairs = [];
for (const [k, a] of byTS) {
  const [lg, team, s] = k.split('|');
  const ns = nextSeason(s, lg); const b = byTS.get(`${lg}|${team}|${ns}`);
  if (b) seasonPairs.push({ a, b, ySeason: ns, lg });
}
// halva → halva inom säsong
const halfPairs = [];
for (const [k, xs] of byTS) {
  if (xs.length < 16) continue;
  const h = xs.length >> 1;
  halfPairs.push({ a: xs.slice(0, h), b: xs.slice(h), ySeason: k.split('|')[2], lg: k.split('|')[0] });
}
// senaste 10 → nästa 10 (rullande, utan överlapp)
const rollPairs = [];
for (const [, xs] of groupBy(tm, (x) => `${x.lg}|${x.team}`)) {
  for (let i = 0; i + 20 <= xs.length; i += 10) rollPairs.push({ a: xs.slice(i, i + 10), b: xs.slice(i + 10, i + 20), ySeason: xs[i + 10].season, lg: xs[0].lg });
}
console.log(`Lag-matcher: ${tm.length}, ligor ${leagues.length}`);
test('Mot marknaden, säsong → nästa', seasonPairs, (x) => x.r);
test('Mot marknaden, första halvan → andra', halfPairs, (x) => x.r);
test('Mot marknaden, 10 matcher → nästa 10', rollPairs, (x) => x.r, () => true, 10, 10);
test('Hemma mot marknaden, säsong → nästa', seasonPairs, (x) => x.r, (x) => x.side === 'h', 6, 4);
test('Borta mot marknaden, säsong → nästa', seasonPairs, (x) => x.r, (x) => x.side === 'a', 6, 4);
// hemma−borta-skillnad som eget mått
{
  const pairs = { tr: [], ko: [] };
  for (const { a, b, ySeason } of seasonPairs) {
    const d = (xs) => { const h = xs.filter((x) => x.side === 'h'), w = xs.filter((x) => x.side === 'a'); return h.length >= 6 && w.length >= 6 ? mean(h, (x) => x.r) - mean(w, (x) => x.r) : null; };
    const x = d(a), y = d(b);
    if (x != null && y != null) pairs[isCtrl(ySeason) ? 'ko' : 'tr'].push({ x, y, w: b.length });
  }
  const t = slope(pairs.tr), k = slope(pairs.ko);
  console.log(`       ${'Egen hemmafördel (hemma − borta), säsong → nästa'.padEnd(46)} träning b ${t.b.toFixed(3)} z ${t.z.toFixed(1)} (n ${t.n}) | kontroll b ${k.b.toFixed(3)} z ${k.z.toFixed(1)} (n ${k.n})`);
}
test('Kryss mot oddsen, säsong → nästa', seasonPairs, (x) => x.dx);
test('Kryss mot oddsen, första halvan → andra', halfPairs, (x) => x.dx);
test('Kryss mot oddsen, 10 → nästa 10', rollPairs, (x) => x.dx, () => true, 10, 10);
test('Som storfavorit (≥ 60 %), säsong → nästa', seasonPairs, (x) => x.win, (x) => x.fav, 5, 3);
test('Som skräll (≤ 25 %), säsong → nästa', seasonPairs, (x) => x.win, (x) => x.dog, 5, 3);
test('Som storfavorit, halva → halva', halfPairs, (x) => x.win, (x) => x.fav, 4, 3);
test('Som skräll, halva → halva', halfPairs, (x) => x.win, (x) => x.dog, 4, 3);
