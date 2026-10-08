// Jämför andelsystem för Stryktipset/Europatipset (1000 kr/omg, matematiska andelar).
//   node scripts/backtest-andel-modeller.mjs
//   node scripts/backtest-andel-modeller.mjs --product europatipset
//
// Modeller:
//   flat4030     – 40/30/30, högst streck = 40 (bas)
//   spikN-folk   – N spikar på starkaste streckfavoriter, resten 40/30/30 (streck)
//   spikN-odds   – N spikar på starkaste oddsfavoriter, resten 40/30/30 (oddsfavorit = 40)
//   market       – andelar = oddsens implied (startodds)
//   marketX      – oddsens implied med X × 1,15 (streckvärde), omnormerat
//   value        – p_odds × folk^−0,5, omnormerat (mer på understreckade)
//   softSpik     – topp 2 oddsfavoriter 70/15/15, resten marketX
//   hybrid       – spik om oddsfavorit ≥ 55 %, annars marketX; max 3 spikar
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
const kr = (x) => `${Math.round(x).toLocaleString('sv-SE')} kr`;

function folkVec(ev) {
  const f = ev.svenskaFolket;
  if (!f) return null;
  const raw = [num(f.one), num(f.x), num(f.two)];
  const s = raw.reduce((a, b) => a + b, 0);
  if (!(s > 0)) return null;
  return raw.map((v) => v / s);
}

function oddsVec(ev) {
  const o = ev.odds?.one ? ev.odds : ev.startOdds;
  if (!o?.one) return null;
  const inv = [num(o.one), num(o.x), num(o.two)].map((x) => (x > 1 ? 1 / x : 0));
  const s = inv.reduce((a, b) => a + b, 0);
  if (!(s > 0)) return null;
  return inv.map((v) => v / s);
}

const argmax = (v) => v.reduce((b, x, i) => (x > v[b] ? i : b), 0);
const norm = (v) => {
  const s = v.reduce((a, b) => a + b, 0);
  return s > 0 ? v.map((x) => x / s) : null;
};
const soft4030 = (favIdx) => SIGNS.map((_, i) => (i === favIdx ? 0.4 : 0.3));
const hardSpike = (favIdx) => SIGNS.map((_, i) => (i === favIdx ? 1 : 0));
const softSpike = (favIdx, top = 0.7) => {
  const rest = (1 - top) / 2;
  return SIGNS.map((_, i) => (i === favIdx ? top : rest));
};

/** Vinst för andelsystem. Spikfel → 0. */
function payoutWeighted(weights, outcomes, prize, budget) {
  const n = outcomes.length;
  const c = outcomes.map((o, i) => weights[i][SIGNS.indexOf(o)]);
  if (c.some((x) => !(x > 0))) {
    return { winnings: 0, stake13: 0, spiked: weights.filter((w) => w.filter((x) => x > 0).length === 1).length, spikeOk: false, byLevel: { 10: 0, 11: 0, 12: 0, 13: 0 } };
  }
  const prodC = c.reduce((a, b) => a * b, 1);
  const byLevel = { 13: 0, 12: 0, 11: 0, 10: 0 };
  byLevel[13] = budget * prodC * (prize[13] || 0);
  const wrongSum = (i) => weights[i].reduce((s, w, j) => s + (SIGNS[j] === outcomes[i] ? 0 : w), 0);

  for (let k = 1; k <= 3; k++) {
    const level = 13 - k;
    const pay = prize[level] || 0;
    if (!pay) continue;
    const choose = (start, left, picked) => {
      if (left === 0) {
        let factor = 1;
        for (const i of picked) {
          const sw = wrongSum(i);
          if (!(sw > 0) || !(c[i] > 0)) return;
          factor *= sw / c[i];
        }
        byLevel[level] += budget * prodC * factor * pay;
        return;
      }
      for (let j = start; j <= n - left; j++) choose(j + 1, left - 1, [...picked, j]);
    };
    choose(0, k, []);
  }
  const spiked = weights.filter((w) => w.filter((x) => x > 0).length === 1).length;
  return {
    winnings: byLevel[13] + byLevel[12] + byLevel[11] + byLevel[10],
    stake13: budget * prodC,
    spiked,
    spikeOk: true,
    byLevel,
  };
}

function applySpikes(matchFavIdx, matchStrength, nSpikes, restWeights, hard = true) {
  const ranked = matchStrength.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s);
  const w = restWeights.map((row) => [...row]);
  for (let k = 0; k < nSpikes; k++) {
    const i = ranked[k].i;
    w[i] = hard ? hardSpike(matchFavIdx[i]) : softSpike(matchFavIdx[i], 0.7);
  }
  return w;
}

function buildModels(events) {
  const folk = events.map(folkVec);
  const odds = events.map(oddsVec);
  if (folk.some((v) => !v) || odds.some((v) => !v)) return null;

  const folkFav = folk.map(argmax);
  const oddsFav = odds.map(argmax);
  const folkStr = folk.map((v) => Math.max(...v));
  const oddsStr = odds.map((v) => Math.max(...v));

  const wFolk4030 = folkFav.map(soft4030);
  const wOdds4030 = oddsFav.map(soft4030);
  const wMarket = odds.map((v) => [...v]);
  const wMarketX = odds.map((v) => norm([v[0], v[1] * 1.15, v[2]]));
  const wValue = odds.map((o, i) => {
    const f = folk[i];
    return norm(o.map((p, j) => p / Math.sqrt(Math.max(f[j], 0.01))));
  });

  const models = {
    'flat-streck-4030': wFolk4030,
    'flat-odds-4030': wOdds4030,
    'spik1-streck': applySpikes(folkFav, folkStr, 1, wFolk4030),
    'spik2-streck': applySpikes(folkFav, folkStr, 2, wFolk4030),
    'spik3-streck': applySpikes(folkFav, folkStr, 3, wFolk4030),
    'spik1-odds': applySpikes(oddsFav, oddsStr, 1, wOdds4030),
    'spik2-odds': applySpikes(oddsFav, oddsStr, 2, wOdds4030),
    'spik3-odds': applySpikes(oddsFav, oddsStr, 3, wOdds4030),
    market: wMarket,
    'market-X15': wMarketX,
    'value-p/sqrt(folk)': wValue,
    'softSpik2+marketX': (() => {
      const w = wMarketX.map((row) => [...row]);
      const ranked = oddsStr.map((s, i) => ({ i, s })).sort((a, b) => b.s - a.s);
      for (let k = 0; k < 2; k++) w[ranked[k].i] = softSpike(oddsFav[ranked[k].i], 0.7);
      return w;
    })(),
    'hybrid-spik55+marketX': (() => {
      const ranked = oddsStr.map((s, i) => ({ i, s, fav: oddsFav[i] })).sort((a, b) => b.s - a.s);
      const w = wMarketX.map((row) => [...row]);
      let n = 0;
      for (const { i, s, fav } of ranked) {
        if (n >= 3) break;
        if (s >= 0.55) {
          w[i] = hardSpike(fav);
          n++;
        }
      }
      return w;
    })(),
  };
  return models;
}

const rows = [];
for (const n of listArchived(PRODUCT)) {
  const entry = readRaw(PRODUCT, n);
  const d = entry?.draw;
  const r = entry?.result;
  if (!d?.drawEvents?.length || !r?.events?.length || !r.distribution?.length) continue;
  const events = [...d.drawEvents].sort((a, b) => a.eventNumber - b.eventNumber);
  const outcomes = [...r.events].sort((a, b) => a.eventNumber - b.eventNumber).map((e) => e.outcome);
  if (events.length !== 13 || outcomes.some((o) => !SIGNS.includes(o))) continue;
  const models = buildModels(events);
  if (!models) continue;
  const prize = Object.fromEntries(r.distribution.map((x) => [parseInt(x.name, 10), num(x.amount)]));
  const date = (d.regCloseTime || '').slice(0, 10);
  const per = {};
  for (const [name, weights] of Object.entries(models)) {
    const ev = payoutWeighted(weights, outcomes, prize, BUDGET);
    const spikes = weights.map((w, i) => (w.filter((x) => x > 0).length === 1 ? `${i + 1}${SIGNS[argmax(w)]}` : null)).filter(Boolean);
    per[name] = {
      winnings: ev.winnings,
      net: ev.winnings - BUDGET,
      stake13: ev.stake13,
      spikeOk: ev.spikeOk,
      spikes,
      byLevel: ev.byLevel,
    };
  }
  rows.push({ drawNumber: n, date, outcomes: outcomes.join(''), models: per });
}

rows.sort((a, b) => a.drawNumber - b.drawNumber);
const names = Object.keys(rows[0]?.models || {});
const summaries = {};
for (const name of names) {
  const nets = rows.map((r) => r.models[name].net);
  const wins = rows.map((r) => r.models[name].winnings);
  const cost = rows.length * BUDGET;
  const winnings = wins.reduce((a, b) => a + b, 0);
  const plus = nets.filter((x) => x > 0).length;
  const spikeFail = rows.filter((r) => r.models[name].spikeOk === false).length;
  const bySeason = {};
  for (const r of rows) {
    const y = Number(r.date.slice(0, 4));
    const m = Number(r.date.slice(5, 7));
    const season = m >= 7 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
    if (!bySeason[season]) bySeason[season] = { n: 0, net: 0 };
    bySeason[season].n++;
    bySeason[season].net += r.models[name].net;
  }
  // Holdout: sista 40 omgångarna vs resten
  const cut = Math.max(0, rows.length - 40);
  const trainNet = rows.slice(0, cut).reduce((s, r) => s + r.models[name].net, 0);
  const testNet = rows.slice(cut).reduce((s, r) => s + r.models[name].net, 0);
  const trainCost = cut * BUDGET;
  const testCost = (rows.length - cut) * BUDGET;
  summaries[name] = {
    draws: rows.length,
    cost: r2(cost),
    winnings: r2(winnings),
    net: r2(winnings - cost),
    roi: r2((winnings / cost - 1) * 100),
    plus,
    spikeFail,
    avgStake13: r2(rows.reduce((s, r) => s + r.models[name].stake13, 0) / rows.length),
    bySeason: Object.fromEntries(Object.entries(bySeason).map(([k, v]) => [k, { n: v.n, net: r2(v.net), roi: r2((v.net / (v.n * BUDGET)) * 100) }])),
    holdout: {
      train: { n: cut, net: r2(trainNet), roi: trainCost ? r2((trainNet / trainCost) * 100) : null },
      test: { n: rows.length - cut, net: r2(testNet), roi: testCost ? r2((testNet / testCost) * 100) : null },
    },
    top: [...rows].sort((a, b) => b.models[name].net - a.models[name].net).slice(0, 5).map((r) => ({
      date: r.date, n: r.drawNumber, net: r2(r.models[name].net), spikes: r.models[name].spikes, spikeOk: r.models[name].spikeOk,
    })),
  };
}

const ranked = Object.entries(summaries).sort((a, b) => b[1].net - a[1].net);
const out = path.join(root, `data/stryktips-backtest-andel-modeller-${PRODUCT}.json`);
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  product: PRODUCT,
  budget: BUDGET,
  from: rows[0]?.date,
  to: rows.at(-1)?.date,
  draws: rows.length,
  ranking: ranked.map(([name, s]) => ({ name, net: s.net, roi: s.roi, plus: s.plus, spikeFail: s.spikeFail, holdoutTestRoi: s.holdout.test.roi })),
  summaries,
}, null, 2), 'utf8');

console.log(`\n${PRODUCT} · andelsystem ${BUDGET} kr/omg · ${rows.length} omgångar (${rows[0]?.date} – ${rows.at(-1)?.date})\n`);
console.log('Modell'.padEnd(28) + 'Netto'.padStart(12) + 'ROI'.padStart(9) + 'Plus'.padStart(8) + 'Spikfel'.padStart(9) + 'TestROI'.padStart(10));
console.log('-'.repeat(76));
for (const [name, s] of ranked) {
  console.log(
    name.padEnd(28)
    + kr(s.net).padStart(12)
    + `${s.roi}%`.padStart(9)
    + `${s.plus}/${rows.length}`.padStart(8)
    + String(s.spikeFail).padStart(9)
    + `${s.holdout.test.roi}%`.padStart(10),
  );
}
console.log(`\nHoldout = sista ${summaries[names[0]].holdout.test.n} omgångarna (ej använda för att välja modell i tabellen ovan – se ROI där).`);
console.log(`Sparade ${out}`);
