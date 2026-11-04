// Stresstest av fyndet i jakten: hemmaseger vid stängning i stängningsligorna när bästa pris slår Pinnacles pris utan marginal.
//   node scripts/slabolagen/granska.mjs             utvecklingsdata
//   node scripts/slabolagen/granska.mjs --slutprov  matcher efter 2024-10-31 (körs en gång, med låst regel)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fairAv, hemmaregel as regel, JAKT_TILL, laddaStang } from './jakt-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUT = process.argv.includes('--slutprov');
const alla = laddaStang(root, { slutprov: SLUT }).filter((m) => (SLUT ? m.date > JAKT_TILL : true));
const TAU = 0.02;

const st = (v) => {
  const n = v.length;
  if (!n) return 'n     0';
  const m = v.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  return `n ${String(n).padStart(5)} ROI ${(m * 100).toFixed(1).padStart(6)}% z ${(m / (sd / Math.sqrt(n))).toFixed(2).padStart(5)}`;
};
const kvot = (m, avdrag) => m.c.max?.map((x) => x * (1 - avdrag));
const spel = (urval, avdrag, sida = 0, tau = TAU) => urval.filter((m) => regel(fairAv(m.c.pin), kvot(m, avdrag), tau, sida)).map((m) => (m.y === sida ? kvot(m, avdrag)[sida] - 1 : -1));

console.log(`${SLUT ? 'SLUTPROV' : 'UTVECKLING'}: ${alla.length} matcher, ${alla[0]?.date} till ${alla.at(-1)?.date}, med Pinnacle-stängning ${alla.filter((m) => m.c.pin).length}`);
console.log('\n1. Tål regeln sämre priser? (hemma, EV >= 2 % efter avdraget)');
for (const a of [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.07]) console.log(`  avdrag ${(a * 100).toFixed(0)} %: ${st(spel(alla, a))}`);
console.log('\n2. Samma regel på andra tecken (avdrag 3 %)');
for (const [n, s] of [['hemma', 0], ['kryss', 1], ['borta', 2]]) console.log(`  ${n.padEnd(6)} ${st(spel(alla, 0.03, s))}`);
console.log('\n3. Alla hemmaspel utan regel (är det bara hemmafördel?)');
for (const a of [0, 0.03]) console.log(`  avdrag ${(a * 100).toFixed(0)} %: ${st(alla.filter((m) => m.c.max).map((m) => (m.y === 0 ? kvot(m, a)[0] - 1 : -1)))}`);
console.log('  Pinnacle-stängning själv: hemma', st(alla.filter((m) => m.c.pin).map((m) => (m.y === 0 ? m.c.pin[0] - 1 : -1))));
const kal = alla.filter((m) => m.c.pin);
const fh = kal.reduce((s, m) => s + fairAv(m.c.pin)[0], 0) / kal.length;
console.log(`  Pinnacles chans hemma i snitt ${(fh * 100).toFixed(1)} %, faktiskt ${(kal.filter((m) => m.y === 0).length / kal.length * 100).toFixed(1)} %`);
console.log('\n4. Vad sa Pinnacle om de valda spelen? (fördelen ska ligga kvar mot utfallet)');
const val = alla.filter((m) => regel(fairAv(m.c.pin), kvot(m, 0.03)));
if (val.length) {
  const pp = val.reduce((s, m) => s + fairAv(m.c.pin)[0], 0) / val.length, ut = val.filter((m) => m.y === 0).length / val.length;
  const oddsS = val.reduce((s, m) => s + kvot(m, 0.03)[0], 0) / val.length;
  const hop = val.reduce((s, m) => s + Math.log(m.c.max[0] / m.c.pin[0]), 0) / val.length;
  console.log(`  Pinnacle ${(pp * 100).toFixed(1)} %, faktiskt ${(ut * 100).toFixed(1)} %, snittodds ${oddsS.toFixed(2)}, högsta pris över Pinnacle i snitt ${(hop * 100).toFixed(1)} %`);
}
console.log('\n5. Per liga (avdrag 3 %)');
for (const l of [...new Set(alla.map((m) => m.league))]) console.log(`  ${l.padEnd(4)} ${st(spel(alla.filter((m) => m.league === l), 0.03))}`);
console.log('\n6. Per år (avdrag 3 %)');
for (const y of [...new Set(alla.map((m) => m.date.slice(0, 4)))]) console.log(`  ${y} ${st(spel(alla.filter((m) => m.date.startsWith(y)), 0.03))}`);
console.log('\n7. Riktigt bolag: Bet365 vid stängning (finns bara från 2025)');
const b3 = alla.filter((m) => m.c.b365 && m.c.pin);
console.log(`  matcher ${b3.length}`);
for (const t of [0, 0.01, 0.02]) {
  const r = b3.filter((m) => regel(fairAv(m.c.pin), m.c.b365, t));
  console.log(`  EV>=${t}: ${st(r.map((m) => (m.y === 0 ? m.c.b365[0] - 1 : -1)))}`);
}
