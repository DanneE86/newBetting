// Bakkörning av filkupongerna A, B och C (gui/public/stryk-engine.js buildFileCoupons) mot kupongarkivet
// data/tips-archive/systems. Samma procent, streck, omsättning och jackpot som arkivets kupong A, verkliga vinstklasser.
// Användaren 2026-10-11: inga Gambling Cabin-regler, bara fil.
//   node scripts/backtest-stryk-fil.mjs [stryktipset|europatipset] [--rows 500] [--utd 30000] [--spikes 4] [--bonus 2]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { buildFileCoupons, FILE_RULES } = await import(pathToFileURL(path.join(root, 'gui', 'public', 'stryk-engine.js')).href);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const product = args.find((a) => !a.startsWith('--') && !/^[\d.]+$/.test(a)) || 'stryktipset';
const R = { ...FILE_RULES, rows: opt('--rows', FILE_RULES.rows), payoutMin: opt('--utd', FILE_RULES.payoutMin), spikes: opt('--spikes', FILE_RULES.spikes), underBonus: opt('--bonus', FILE_RULES.underBonus) };
const dir = path.join(root, 'data', 'tips-archive', 'systems');
const num = (s) => Number(String(s ?? '').replace(/\s/g, '').replace(',', '.')) || 0;
const kr = (x) => Math.round(x).toLocaleString('sv-SE');

const acc = Object.fromEntries(['A', 'B', 'C', 'A+B'].map((k) => [k, { draws: 0, cost: 0, win: 0, chance: 0, classes: { 13: 0, 12: 0, 11: 0, 10: 0 }, c13: [] }]));
const spik = { n: 0, hit: 0, exp: 0, allHit: 0, draws: 0 };
const arch = { cost: 0, win: 0, chance: 0 };
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(product + '-') && /^\D+-\d+\.json$/.test(x)).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const o = j.outcomes;
  if (!o || o.length !== 13 || !j.A?.rules) continue;
  const r = j.A.rules;
  const events = j.matches.map((m) => ({ final: m.final, folk: m.folk, league: m.league }));
  const base = { realTurnover: r.realTurnover || r.turnover, turnover: r.turnover, jackpot: r.jackpot || 0 };
  const out = buildFileCoupons({ product }, events, () => events.map(() => null), base, R);
  if (!out.A) continue;
  const pay = Object.fromEntries((j.distribution || []).map((d) => [parseInt(d.name, 10), num(d.amount)]));
  const score = (rows, a) => {
    let win = 0;
    for (const row of rows) {
      let c = 0;
      for (let i = 0; i < 13; i++) if (row[i] === o[i]) c++;
      if (c >= 10) { a.classes[c]++; win += pay[c] || 0; }
      if (c === 13) a.c13.push(`${j.drawNumber} (${kr(pay[13])} kr)`);
    }
    return win;
  };
  for (const k of ['A', 'B', 'C']) {
    const c = out[k];
    if (!c) continue;
    const a = acc[k];
    a.draws++; a.cost += c.cost; a.chance += c.hitAll; a.win += score(c.rowList, a);
  }
  if (out.B) { const a = acc['A+B']; a.draws++; a.cost += out.A.cost + out.B.cost; a.chance += out.A.hitAll + out.B.hitAll; a.win += score([...out.A.rowList, ...out.B.rowList], a); }
  // Spikarna (A): hur ofta de satt
  let all = true;
  out.A.picks.forEach((x, i) => {
    if (x.signs.length !== 1) return;
    const k = '1X2'.indexOf(x.signs);
    spik.n++; spik.exp += events[i].final[k];
    if (o[i] === x.signs) spik.hit++; else all = false;
  });
  spik.draws++; spik.allHit += all;
  for (const k of ['A', 'B']) if (j[k]?.evaluation) { arch.cost += j[k].evaluation.cost; arch.win += j[k].evaluation.winnings; arch.chance += j[k].hitAll || 0; }
}
console.log(`${product}: ${acc.A.draws} omgångar · ${R.rows} rader · minst ${kr(R.payoutMin)} kr · ${R.spikes} spikar · C-bonus ${R.underBonus}`);
for (const [k, a] of Object.entries(acc)) {
  if (!a.draws) continue;
  console.log(`${k.padEnd(3)}: chans 13 rätt 1 på ${Math.round(a.draws / a.chance)} per omg (väntat ${a.chance.toFixed(2)} st), insats ${kr(a.cost)}, vinst ${kr(a.win)}, netto ${kr(a.win - a.cost)} (${Math.round((100 * a.win) / a.cost)} % tillbaka), 13/12/11/10 ${a.classes[13]}/${a.classes[12]}/${a.classes[11]}/${a.classes[10]}${a.c13.length ? ` – 13 rätt i ${a.c13.join(', ')}` : ''}`);
}
console.log(`Spikar (A): ${(spik.n / spik.draws).toFixed(1)} per omg, satt ${(100 * spik.hit / spik.n).toFixed(1)} % (väntat ${(100 * spik.exp / spik.n).toFixed(1)} %), alla satt ${spik.allHit} av ${spik.draws} omg`);
console.log(`Arkivets A+B (Gambling Cabin): chans 1 på ${Math.round(spik.draws / arch.chance)}, insats ${kr(arch.cost)}, vinst ${kr(arch.win)}, netto ${kr(arch.win - arch.cost)} (${Math.round((100 * arch.win) / arch.cost)} % tillbaka)`);
