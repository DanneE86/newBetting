// Kör de låsta modellerna.
//   node scripts/slabolagen/slutprov.mjs              bara utvecklingsdata (t.o.m. 2024-10-31)
//   node scripts/slabolagen/slutprov.mjs --slutprov   slutprovet 2024-11-01 till 2026-10-31, skriver docs/analys/sla-bolagen.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UTVECKLING_TILL, laddaAlla } from './data.mjs';
import { MODELLER, facit, korModeller, portfolj } from './modeller.mjs';
import { intervall } from '../modeller/utvardering.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const slut = process.argv.includes('--slutprov');
const matcher = laddaAlla(root, { slutprov: slut });
const byId = new Map(matcher.map((m) => [m.id, m]));
const alla = korModeller(matcher);
const provFran = slut ? '2024-11-01' : '2019-01-01';
const provTill = slut ? '2026-10-31' : UTVECKLING_TILL;
const delning = slut ? '2025-10-31' : '2021-06-30';
const iProv = alla.filter((b) => b.date >= provFran && b.date <= provTill);
const bets = [...iProv, ...portfolj(iProv)];

function sammanfatta(rader) {
  const f = rader.map((b) => facit(b, byId.get(b.id)));
  const n = f.length;
  if (!n) return { n: 0 };
  const v = f.map((x) => x.v), c = f.filter((x) => x.clv != null);
  const [l95, h95] = intervall(v);
  const [l99] = intervallSkarp(v);
  return {
    n, roi: v.reduce((a, b) => a + b, 0) / n, l95, h95, l99, enheter: v.reduce((a, b) => a + b, 0),
    traff: v.filter((x) => x > 0).length / n, snittOdds: rader.reduce((a, b) => a + b.odds, 0) / n,
    clv: c.length ? c.reduce((a, b) => a + b.clv, 0) / c.length : null, clvN: c.length,
    clvPos: c.length ? c.filter((x) => x.clv > 0).length / c.length : null,
  };
}
function intervallSkarp(v, ant = 2000) {
  // 99 %-gräns: fem modeller prövas samtidigt
  let seed = 7;
  const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const s = [];
  for (let b = 0; b < ant; b++) {
    let t = 0;
    for (let i = 0; i < v.length; i++) t += v[Math.floor(r() * v.length)];
    s.push(t / v.length);
  }
  s.sort((a, b) => a - b);
  return [s[Math.floor(ant * 0.005)], s[Math.floor(ant * 0.995)]];
}

const NAMN = { ...Object.fromEntries(Object.entries(MODELLER).map(([k, c]) => [k, c.namn])), J5: 'J5 Portföljen' };
const pct = (x, d = 1) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${(x * 100).toFixed(d).replace('.', ',')} %`);
const ut = { skapad: new Date().toISOString(), slutprov: slut, fran: provFran, till: provTill, modeller: {} };
const rad = [];
for (const kod of Object.keys(NAMN)) {
  ut.modeller[kod] = {};
  for (const niva of ['max', 'svenskt', 'b365']) {
    const r = bets.filter((b) => b.kod === kod && b.niva === niva);
    const a = sammanfatta(r);
    const y1 = sammanfatta(r.filter((b) => b.date <= delning));
    const y2 = sammanfatta(r.filter((b) => b.date > delning));
    ut.modeller[kod][niva] = { allt: a, y1, y2 };
    rad.push(`| ${NAMN[kod]} | ${{ max: 'Högsta pris', svenskt: 'Svenskt (−3 %)', b365: 'Bet365' }[niva]} | ${a.n} | ${a.n ? (a.traff * 100).toFixed(1).replace('.', ',') : '–'} % | ${a.n ? a.snittOdds.toFixed(2).replace('.', ',') : '–'} | **${pct(a.roi)}** | ${pct(a.l95, 0)} till ${pct(a.h95, 0)} | ${pct(a.clv)} | ${y1.n ?? 0}: ${pct(y1.roi)} | ${y2.n ?? 0}: ${pct(y2.roi)} |`);
  }
}
const klarar = [];
for (const kod of Object.keys(NAMN)) {
  const s = ut.modeller[kod].svenskt;
  if (s.allt.n >= 100 && s.allt.l95 > 0 && s.y1.roi > 0 && s.y2.roi > 0) klarar.push(NAMN[kod]);
}
ut.slarBolagen = klarar;
const tabell = ['| Modell | Pris | Spel | Träff | Snittodds | ROI | 95 %-intervall | CLV | Del 1 | Del 2 |', '|---|---|---:|---:|---:|---:|---|---:|---:|---:|', ...rad].join('\n');
console.log(`${slut ? 'SLUTPROV' : 'UTVECKLING'} ${provFran} till ${provTill}, ${matcher.length} matcher totalt\n${tabell}\nKlarar regeln: ${klarar.join(', ') || 'ingen'}`);
if (slut) {
  fs.writeFileSync(path.join(root, 'data', 'reports', 'sla-bolagen.json'), JSON.stringify(ut, null, 1));
  fs.writeFileSync(path.join(root, 'docs', 'analys', 'sla-bolagen.md'), `# Slå bolagen: slutprov\n\nGenererad av scripts/slabolagen/slutprov.mjs --slutprov, ${ut.skapad.slice(0, 10)}. Modellerna låstes på data t.o.m. ${UTVECKLING_TILL}. Prov ${provFran} till ${provTill}. Del 1 = t.o.m. ${delning}.\n\nRegel: hela 95 %-intervallet över noll på svenskt pris (minst 100 spel) och plus i båda delarna.\n\n${tabell}\n\nKlarar regeln: ${klarar.join(', ') || '**ingen**'}.\n`);
}
