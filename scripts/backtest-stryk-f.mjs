// Bakkörning av kupong F (fristående från D/E) mot kupongarkivet.
//   node scripts/backtest-stryk-f.mjs
//   node scripts/backtest-stryk-f.mjs --model streck4030 --budget 1050,1500,2000,3000,5000,10000
//   node scripts/backtest-stryk-f.mjs --model value --budget 1050
//   node scripts/backtest-stryk-f.mjs europatipset --budget 1500,2000
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { listArchived, readRaw } from './lib/tips-archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : def;
};
const product = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'stryktipset';
const budgets = (arg('budget', '1050') || '1050').split(',').map(Number).filter((n) => n > 0);
const model = arg('model', 'streck4030'); // streck4030 | value
const { buildCouponF, F_RULES } = await import(pathToFileURL(path.join(root, 'gui', 'public', 'stryk-engine.js')).href);

const num = (x) => (typeof x === 'number' ? x : Number(String(x ?? '').replace(/\s/g, '').replace(',', '.')) || 0);
const SIGNS = ['1', 'X', '2'];
const r2 = (x) => Math.round(x * 100) / 100;
const kr = (x) => `${Math.round(x).toLocaleString('sv-SE')} kr`;

function oddsVec(ev) {
  const o = ev.odds?.one ? ev.odds : ev.startOdds;
  if (!o?.one) return null;
  const inv = [num(o.one), num(o.x), num(o.two)].map((x) => (x > 1 ? 1 / x : 0));
  const s = inv.reduce((a, b) => a + b, 0);
  return s > 0 ? inv.map((v) => v / s) : null;
}
function folkVec(ev) {
  const f = ev.svenskaFolket;
  if (!f) return null;
  const raw = [num(f.one), num(f.x), num(f.two)];
  const s = raw.reduce((a, b) => a + b, 0);
  return s > 0 ? raw.map((v) => v / s) : null;
}

const rounds = [];
for (const n of listArchived(product)) {
  const entry = readRaw(product, n);
  const d = entry?.draw;
  const r = entry?.result;
  if (!d?.drawEvents?.length || !r?.distribution?.length) continue;
  const eventsRaw = [...d.drawEvents].sort((a, b) => a.eventNumber - b.eventNumber);
  const outcomes = [...r.events].sort((a, b) => a.eventNumber - b.eventNumber).map((e) => e.outcome);
  if (eventsRaw.length !== 13 || outcomes.some((o) => !SIGNS.includes(o))) continue;
  const events = eventsRaw.map((ev) => {
    const market = oddsVec(ev);
    const folk = folkVec(ev);
    if (!market || !folk) return null;
    return { eventNumber: ev.eventNumber, final: market, market, folk };
  });
  if (events.some((e) => !e)) continue;
  const prize = Object.fromEntries(r.distribution.map((x) => [parseInt(x.name, 10), num(x.amount)]));
  const turnover = num(r.currentNetSale) || num(d.currentNetSale) || 25e6;
  rounds.push({
    drawNumber: n,
    date: (d.regCloseTime || '').slice(0, 10),
    events,
    outcomes,
    prize,
    turnover,
  });
}

function evalBudget(budget) {
  const draws = [];
  for (const round of rounds) {
    const F = buildCouponF(
      { product, drawNumber: round.drawNumber },
      round.events,
      round.events.map(() => null),
      { rowPrice: 1, realTurnover: round.turnover, turnover: round.turnover, jackpot: 0 },
      { rows: budget, model },
    );
    const counts = F.rowList.map((row) => row.split('').filter((c, i) => c === round.outcomes[i]).length);
    const perClass = {};
    for (const c of counts) perClass[c] = (perClass[c] || 0) + 1;
    const winnings = Object.entries(perClass).reduce((s, [c, n]) => s + n * (round.prize[c] || 0), 0);
    draws.push({
      drawNumber: round.drawNumber,
      date: round.date,
      cost: F.cost,
      winnings: r2(winnings),
      net: r2(winnings - F.cost),
      best: Math.max(...counts),
      unique: F.rules.uniqueRows,
      perClass,
    });
  }
  const cost = draws.reduce((s, d) => s + d.cost, 0);
  const winnings = draws.reduce((s, d) => s + d.winnings, 0);
  const plus = draws.filter((d) => d.net > 0).length;
  const n13 = draws.filter((d) => d.best === 13).length;
  const n12 = draws.filter((d) => d.best >= 12).length;
  const n11 = draws.filter((d) => d.best >= 11).length;
  return {
    budget,
    draws: draws.length,
    cost: r2(cost),
    winnings: r2(winnings),
    net: r2(winnings - cost),
    roi: r2((winnings / cost - 1) * 100),
    plus,
    best13: n13,
    best12plus: n12,
    best11plus: n11,
    avgUnique: r2(draws.reduce((s, d) => s + d.unique, 0) / draws.length),
    top: [...draws].sort((a, b) => b.net - a.net).slice(0, 3).map((d) => ({
      date: d.date, n: d.drawNumber, net: d.net, best: d.best,
    })),
    drawsDetail: draws,
  };
}

console.log(`\n${product} · kupong F (${model}) · default ${F_RULES.rows} kr · ${rounds.length} omgångar`);
console.log('Budget'.padStart(8) + 'Netto'.padStart(14) + 'ROI'.padStart(9) + 'Plus'.padStart(9) + '13'.padStart(5) + '12+'.padStart(5) + '11+'.padStart(5));
console.log('-'.repeat(55));

const summaries = [];
for (const b of budgets) {
  const s = evalBudget(b);
  summaries.push(s);
  console.log(
    String(b).padStart(8)
    + kr(s.net).padStart(14)
    + `${s.roi}%`.padStart(9)
    + `${s.plus}/${s.draws}`.padStart(9)
    + String(s.best13).padStart(5)
    + String(s.best12plus).padStart(5)
    + String(s.best11plus).padStart(5),
  );
}

const outName = model === 'streck4030'
  ? `data/stryktips-backtest-f-4030-${product}.json`
  : `data/stryktips-backtest-f-${product}.json`;
const out = path.join(root, outName);
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  product,
  model,
  defaultRows: F_RULES.rows,
  from: rounds[0]?.date,
  to: rounds.at(-1)?.date,
  budgets: summaries.map(({ drawsDetail, ...rest }) => rest),
  // Spara detaljer bara för default-/första budgeten (filstorlek)
  draws: summaries[0]?.drawsDetail || [],
}, null, 2));
console.log(`\nSparade ${out}`);
