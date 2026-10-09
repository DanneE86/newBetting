// Bakkörning av kupong E (komplement till D) mot kupongarkivet.
//   node scripts/backtest-stryk-e.mjs [stryktipset|europatipset] [--rows 500] [--utd 30000] [--from 4806]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { buildCouponD, buildCouponE } = await import(pathToFileURL(path.join(root, 'gui', 'public', 'stryk-engine.js')).href);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const product = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a)) || 'stryktipset';
const rows = Number(opt('--rows', 500)), utd = Number(opt('--utd', 30000)), from = Number(opt('--from', 0));
const dir = path.join(root, 'data', 'tips-archive', 'systems');
const num = (s) => Number(String(s ?? '').replace(/\s/g, '').replace(',', '.')) || 0;

const tot = {
  draws: 0, costD: 0, costE: 0, winD: 0, winE: 0, winDE: 0,
  chanceD: 0, chanceE: 0, chanceDE: 0,
  c13D: [], c13E: [], c13DE: [],
  classesD: { 13: 0, 12: 0, 11: 0, 10: 0 },
  classesE: { 13: 0, 12: 0, 11: 0, 10: 0 },
  savedByE: 0, // E hade 13 när D missade
};

const score = (rowList, o, pay, classes, c13, draw) => {
  let win = 0, hit13 = false;
  for (const row of rowList) {
    let c = 0;
    for (let i = 0; i < 13; i++) if (row[i] === o[i]) c++;
    if (c >= 10) { classes[c]++; win += pay[c] || 0; }
    if (c === 13) { hit13 = true; c13.push(`${draw} (${Math.round(pay[13]).toLocaleString('sv-SE')} kr)`); }
  }
  return { win, hit13 };
};

for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(`${product}-`) && /^\D+-\d+\.json$/.test(x)).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const o = j.outcomes;
  if (!o || o.length !== 13 || !j.A?.rules || j.drawNumber < from) continue;
  const r = j.A.rules;
  const events = j.matches.map((m) => ({ final: m.final, folk: m.folk }));
  const base = { realTurnover: r.realTurnover || r.turnover, turnover: r.turnover, jackpot: r.jackpot || 0 };
  const forced = events.map(() => null);
  const D = buildCouponD({ product }, events, forced, base, { rows, payoutMin: utd });
  const E = buildCouponE({ product }, events, forced, base, D, { rows, payoutMin: utd });
  if (!D || !E) continue;
  const pay = Object.fromEntries((j.distribution || []).map((d) => [parseInt(d.name, 10), num(d.amount)]));
  const dS = score(D.rowList, o, pay, tot.classesD, tot.c13D, j.drawNumber);
  const eS = score(E.rowList, o, pay, tot.classesE, tot.c13E, j.drawNumber);
  tot.draws++;
  tot.costD += D.cost; tot.costE += E.cost;
  tot.winD += dS.win; tot.winE += eS.win;
  tot.winDE += dS.win + eS.win;
  tot.chanceD += D.hitAll; tot.chanceE += E.hitAll; tot.chanceDE += D.hitAll + E.hitAll;
  if (dS.hit13 || eS.hit13) tot.c13DE.push(`${j.drawNumber}${dS.hit13 && eS.hit13 ? ' (D+E)' : dS.hit13 ? ' (D)' : ' (E)'}`);
  if (eS.hit13 && !dS.hit13) tot.savedByE++;
}

const kr = (x) => Math.round(x).toLocaleString('sv-SE');
const oneIn = (ch) => Math.round(tot.draws / ch);
console.log(`${product}: ${tot.draws} omgångar, D/E ${rows} rader, utdelning minst ${kr(utd)} kr`);
console.log(`D:  chans 1 på ${oneIn(tot.chanceD)}, insats ${kr(tot.costD)}, vinst ${kr(tot.winD)}, netto ${kr(tot.winD - tot.costD)} (${Math.round((100 * tot.winD) / tot.costD)} %), 13/12/11/10 ${tot.classesD[13]}/${tot.classesD[12]}/${tot.classesD[11]}/${tot.classesD[10]}; 13 rätt i ${tot.c13D.join(', ') || '–'}`);
console.log(`E:  chans 1 på ${oneIn(tot.chanceE)}, insats ${kr(tot.costE)}, vinst ${kr(tot.winE)}, netto ${kr(tot.winE - tot.costE)} (${Math.round((100 * tot.winE) / tot.costE)} %), 13/12/11/10 ${tot.classesE[13]}/${tot.classesE[12]}/${tot.classesE[11]}/${tot.classesE[10]}; 13 rätt i ${tot.c13E.join(', ') || '–'}`);
console.log(`D+E: chans 1 på ${oneIn(tot.chanceDE)}, insats ${kr(tot.costD + tot.costE)}, vinst ${kr(tot.winDE)}, netto ${kr(tot.winDE - tot.costD - tot.costE)} (${Math.round((100 * tot.winDE) / (tot.costD + tot.costE))} %); 13 rätt i ${tot.c13DE.join(', ') || '–'}; E räddade ${tot.savedByE} omgångar där D missade`);
