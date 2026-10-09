// Bakkörning av kupong D (gui/public/stryk-engine.js buildCouponD) mot kupongarkivet data/tips-archive/systems.
// Samma procent, streck, omsättning och jackpot som arkivets kupong A, verkliga vinstklasser (10–13 rätt).
//   node scripts/backtest-stryk-d.mjs [stryktipset|europatipset] [--rows 500] [--utd 30000] [--from 4806]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { buildCouponD, buildCouponDGC } = await import(pathToFileURL(path.join(root, 'gui', 'public', 'stryk-engine.js')).href);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const product = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a)) || 'stryktipset';
const rows = Number(opt('--rows', 500)), utd = Number(opt('--utd', 30000)), from = Number(opt('--from', 0));
const dir = path.join(root, 'data', 'tips-archive', 'systems');
const num = (s) => Number(String(s ?? '').replace(/\s/g, '').replace(',', '.')) || 0;

const tot = { draws: 0, cost: 0, win: 0, chance: 0, chanceAB: 0, costAB: 0, winAB: 0, c13: [], big: 0 };
const classes = { 13: 0, 12: 0, 11: 0, 10: 0 };
const gc = { draws: 0, cost: 0, win: 0, chance: 0, c13: [], classes: { 13: 0, 12: 0, 11: 0, 10: 0 }, ms: 0 };
const score = (rowList, o, pay, acc, draw) => {
  let win = 0;
  for (const row of rowList) {
    let c = 0;
    for (let i = 0; i < 13; i++) if (row[i] === o[i]) c++;
    if (c >= 10) { acc.classes[c]++; win += pay[c] || 0; }
    if (c === 13) acc.c13.push(`${draw} (${Math.round(pay[13]).toLocaleString('sv-SE')} kr)`);
  }
  return win;
};
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(product + '-') && /^\D+-\d+\.json$/.test(x)).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const o = j.outcomes;
  if (!o || o.length !== 13 || !j.A?.rules || j.drawNumber < from) continue;
  const r = j.A.rules;
  const events = j.matches.map((m) => ({ final: m.final, folk: m.folk }));
  const t0 = Date.now();
  const base = { realTurnover: r.realTurnover || r.turnover, turnover: r.turnover, jackpot: r.jackpot || 0 };
  const D = buildCouponD({ product }, events, events.map(() => null), base, { rows, payoutMin: utd });
  if (!D) continue;
  D.gc = buildCouponDGC({ product }, events, D.picks.map((x) => [...x.signs].map((s) => '1X2'.indexOf(s))), base);
  gc.ms += Date.now() - t0;
  const pay = Object.fromEntries((j.distribution || []).map((d) => [parseInt(d.name, 10), num(d.amount)]));
  if (D.gc) { gc.draws++; gc.cost += D.gc.cost; gc.chance += D.gc.hitAll; gc.win += score(D.gc.rowList, o, pay, gc, j.drawNumber); }
  let win = 0;
  for (const row of D.rowList) {
    let c = 0;
    for (let i = 0; i < 13; i++) if (row[i] === o[i]) c++;
    if (c >= 10) { classes[c]++; win += pay[c] || 0; }
    if (c === 13) tot.c13.push(`${j.drawNumber} (${Math.round(pay[13]).toLocaleString('sv-SE')} kr)`);
  }
  if ((pay[13] || 0) >= utd || !(j.distribution || []).find((d) => d.name === '13 rätt')?.winners) tot.big++;
  tot.draws++; tot.cost += D.cost; tot.win += win; tot.chance += D.hitAll;
  for (const k of ['A', 'B']) if (j[k]?.evaluation) { tot.costAB += j[k].evaluation.cost; tot.winAB += j[k].evaluation.winnings; tot.chanceAB += j[k].hitAll || 0; }
}
const kr = (x) => Math.round(x).toLocaleString('sv-SE');
console.log(`${product}: ${tot.draws} omgångar, D ${rows} rader, utdelning minst ${kr(utd)} kr`);
console.log(`D: chans 13 rätt 1 på ${Math.round(tot.draws / tot.chance)} per omgång (väntat ${tot.chance.toFixed(2)} st), insats ${kr(tot.cost)}, vinst ${kr(tot.win)}, netto ${kr(tot.win - tot.cost)} (${Math.round((100 * tot.win) / tot.cost)} % tillbaka)`);
console.log(`D: rader med 13/12/11/10 rätt ${classes[13]}/${classes[12]}/${classes[11]}/${classes[10]}; 13 rätt i ${tot.c13.join(', ') || '–'}`);
console.log(`Arkivets A+B: chans 1 på ${Math.round(tot.draws / tot.chanceAB)}, insats ${kr(tot.costAB)}, vinst ${kr(tot.winAB)}, netto ${kr(tot.winAB - tot.costAB)} (${Math.round((100 * tot.winAB) / tot.costAB)} % tillbaka)`);
console.log(`D i Gambling Cabin: ${gc.draws} omg, chans 1 på ${Math.round(gc.draws / gc.chance)}, snitt ${Math.round(gc.cost / gc.draws)} rader, vinst ${kr(gc.win)}, netto ${kr(gc.win - gc.cost)} (${Math.round((100 * gc.win) / gc.cost)} % tillbaka), 13/12/11/10 ${gc.classes[13]}/${gc.classes[12]}/${gc.classes[11]}/${gc.classes[10]}; 13 rätt i ${gc.c13.join(', ') || '–'}; ${Math.round(gc.ms / tot.draws)} ms per omgång`);
console.log(`Omgångar där 13 rätt gav minst ${kr(utd)} kr eller saknade vinnare: ${tot.big}`);
