// Baktest: helgardering med andelar 40/30/30 – högst streckade tecknet får 40, övriga 30/30.
// Budget 1000 kr per omgång (matematiskt andelsystem: insats på rad = budget × produkt av andelar).
//   node scripts/backtest-streck-403030.mjs
//   node scripts/backtest-streck-403030.mjs --product europatipset --budget 1000
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listArchived, readRaw } from './lib/tips-archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : def;
};
const PRODUCT = arg('product', 'stryktipset');
const BUDGET = Number(arg('budget', 1000));
const SIGNS = ['1', 'X', '2'];
const num = (x) => (typeof x === 'number' ? x : Number(String(x ?? '').replace(/\s/g, '').replace(',', '.')) || 0);
const r2 = (x) => Math.round(x * 100) / 100;

function folkWeights(ev) {
  const f = ev.svenskaFolket;
  if (!f) return null;
  const raw = [num(f.one), num(f.x), num(f.two)];
  if (raw.some((v) => !Number.isFinite(v)) || raw.reduce((a, b) => a + b, 0) <= 0) return null;
  let best = 0;
  for (let i = 1; i < 3; i++) if (raw[i] > raw[best]) best = i;
  return SIGNS.map((_, i) => (i === best ? 0.4 : 0.3));
}

/** Vinst för matematiskt andelsystem med andelar w[match][tecken]. */
function payoutWeighted(weights, outcomes, prize, budget) {
  const n = outcomes.length;
  const c = outcomes.map((o, i) => weights[i][SIGNS.indexOf(o)]);
  const prodC = c.reduce((a, b) => a * b, 1);
  if (!(prodC > 0)) return { winnings: 0, stake13: 0, favHits: 0, byLevel: {} };

  const favHits = weights.reduce((s, w, i) => s + (w[SIGNS.indexOf(outcomes[i])] === 0.4 ? 1 : 0), 0);
  const byLevel = { 13: 0, 12: 0, 11: 0, 10: 0 };

  // 13 rätt
  byLevel[13] = budget * prodC * (prize[13] || 0);

  // k fel (12/11/10 rätt): välj k matcher, byt till fel tecken
  const wrongAt = (i) => SIGNS.map((s, j) => (s === outcomes[i] ? 0 : weights[i][j])).filter((x) => x > 0);

  for (let k = 1; k <= 3; k++) {
    const level = 13 - k;
    const pay = prize[level] || 0;
    if (!pay) continue;
    const idx = [...Array(n).keys()];
    const choose = (start, left, picked) => {
      if (left === 0) {
        // produkt av (felandel/rättandel) över valda matcher, summerat över feltecken
        let factor = 1;
        for (const i of picked) {
          const sumWrong = wrongAt(i).reduce((a, b) => a + b, 0);
          factor *= sumWrong / c[i];
        }
        byLevel[level] += budget * prodC * factor * pay;
        return;
      }
      for (let j = start; j <= n - left; j++) choose(j + 1, left - 1, [...picked, idx[j]]);
    };
    choose(0, k, []);
  }

  const winnings = byLevel[13] + byLevel[12] + byLevel[11] + byLevel[10];
  return { winnings, stake13: budget * prodC, favHits, byLevel };
}

const draws = [];
for (const n of listArchived(PRODUCT)) {
  const entry = readRaw(PRODUCT, n);
  const d = entry?.draw;
  const r = entry?.result;
  if (!d?.drawEvents?.length || !r?.events?.length || !r.distribution?.length) continue;
  const events = [...d.drawEvents].sort((a, b) => a.eventNumber - b.eventNumber);
  const outcomes = [...r.events].sort((a, b) => a.eventNumber - b.eventNumber).map((e) => e.outcome);
  if (events.length !== 13 || outcomes.length !== 13 || outcomes.some((o) => !SIGNS.includes(o))) continue;
  const weights = events.map(folkWeights);
  if (weights.some((w) => !w)) continue;
  const prize = Object.fromEntries(r.distribution.map((x) => [parseInt(x.name, 10), num(x.amount)]));
  const ev = payoutWeighted(weights, outcomes, prize, BUDGET);
  draws.push({
    drawNumber: n,
    date: (d.regCloseTime || '').slice(0, 10),
    outcomes: outcomes.join(''),
    favHits: ev.favHits,
    stake13: r2(ev.stake13),
    winnings: r2(ev.winnings),
    cost: BUDGET,
    net: r2(ev.winnings - BUDGET),
    byLevel: Object.fromEntries(Object.entries(ev.byLevel).map(([k, v]) => [k, r2(v)])),
    prize13: prize[13] || 0,
  });
}

draws.sort((a, b) => a.drawNumber - b.drawNumber);
const cost = draws.length * BUDGET;
const winnings = draws.reduce((s, d) => s + d.winnings, 0);
const net = winnings - cost;
const wins = draws.filter((d) => d.winnings > 0).length;
const best = [...draws].sort((a, b) => b.winnings - a.winnings).slice(0, 10);
const bySeason = {};
for (const d of draws) {
  const y = Number(d.date.slice(0, 4));
  const m = Number(d.date.slice(5, 7));
  const season = m >= 7 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
  if (!bySeason[season]) bySeason[season] = { n: 0, cost: 0, winnings: 0 };
  bySeason[season].n++;
  bySeason[season].cost += BUDGET;
  bySeason[season].winnings += d.winnings;
}

const summary = {
  product: PRODUCT,
  strategy: 'helgardering 40/30/30 (högst streck = 40)',
  budgetPerDraw: BUDGET,
  draws: draws.length,
  from: draws[0]?.date,
  to: draws.at(-1)?.date,
  cost: r2(cost),
  winnings: r2(winnings),
  net: r2(net),
  roi: r2((winnings / cost - 1) * 100),
  drawsWithAnyPayout: wins,
  avgFavHits: r2(draws.reduce((s, d) => s + d.favHits, 0) / draws.length),
  avgStakeOn13: r2(draws.reduce((s, d) => s + d.stake13, 0) / draws.length),
  bySeason: Object.fromEntries(
    Object.entries(bySeason).map(([k, v]) => [k, { ...v, winnings: r2(v.winnings), net: r2(v.winnings - v.cost), roi: r2((v.winnings / v.cost - 1) * 100) }]),
  ),
  topWins: best.map((d) => ({
    drawNumber: d.drawNumber,
    date: d.date,
    favHits: d.favHits,
    stake13: d.stake13,
    winnings: d.winnings,
    net: d.net,
    byLevel: d.byLevel,
    prize13: d.prize13,
  })),
};

const out = path.join(root, `data/stryktips-backtest-streck-403030-${PRODUCT}.json`);
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), summary, draws }, null, 2), 'utf8');

const kr = (x) => `${Math.round(x).toLocaleString('sv-SE')} kr`;
console.log(`\n${PRODUCT} · 40/30/30 mot högst streck · ${BUDGET} kr/omg`);
console.log(`Omgångar: ${summary.draws} (${summary.from} – ${summary.to})`);
console.log(`Insats: ${kr(summary.cost)} · Vinst: ${kr(summary.winnings)} · Netto: ${kr(summary.net)} · ROI: ${summary.roi} %`);
console.log(`Omgångar med någon utdelning: ${wins}/${draws.length}`);
console.log(`Snitt streckfavoriter rätt: ${summary.avgFavHits}/13 · snittinsats på 13-rättsraden: ${summary.avgStakeOn13} kr`);
console.log('\nPer säsong:');
for (const [k, v] of Object.entries(summary.bySeason)) {
  console.log(`  ${k}: ${v.n} omg · netto ${kr(v.net)} · ROI ${v.roi} %`);
}
console.log('\nStörsta vinster:');
for (const d of summary.topWins.slice(0, 8)) {
  console.log(`  ${d.date} #${d.drawNumber}: +${kr(d.net)} (vinst ${kr(d.winnings)}, fav ${d.favHits}/13, insats@13 ${d.stake13} kr)`);
}
console.log(`\nSparade ${out}`);
