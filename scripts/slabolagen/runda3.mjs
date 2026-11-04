// Oberoende prov av hemmaregeln, en gång var, med oförändrad regel (fördel minst 2 %, odds högst 5):
//  A. toppligorna, där regeln inte hittades. B. Betfair-börsen i stället för Pinnacle som facit, täcker 2026.
//  C. Bet365:s riktiga stängningsodds. D. riktiga svenska priser i oddshistoriken, alla ligor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fairAv, hemmaregel, JAKT_TILL, laddaStang, laddaTopp } from './jakt-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const topp = laddaTopp(root, { slutprov: true }), stang = laddaStang(root, { slutprov: true });
const st = (v) => {
  const n = v.length;
  if (!n) return 'n     0';
  const m = v.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  return `n ${String(n).padStart(5)} ROI ${(m * 100).toFixed(1).padStart(6)}% z ${(m / (sd / Math.sqrt(n))).toFixed(2).padStart(5)}`;
};
const sv = (m) => m.c.max?.map((x) => x * 0.97);
const spel = (urval, facit, pris, sida = 0) => urval.filter((m) => hemmaregel(fairAv(facit(m)), pris(m), 0.02, sida)).map((m) => (m.y === sida ? pris(m)[sida] - 1 : -1));
const fore = (x) => x.filter((m) => m.date <= JAKT_TILL), efter = (x) => x.filter((m) => m.date > JAKT_TILL);
const pin = (m) => m.c.pin, bfe = (m) => m.c.bfe, b3 = (m) => m.c.b365;
const SIDOR = [['hemma', 0], ['kryss', 1], ['borta', 2]];

console.log('A. Toppligorna, Pinnacle-stängning, högsta pris -3 %');
for (const [n, s] of SIDOR) console.log(`  ${n.padEnd(6)} utveckling ${st(spel(fore(topp), pin, sv, s))} | nya matcher ${st(spel(efter(topp), pin, sv, s))}`);
console.log('A2. Toppligorna, Pinnacle-stängning, Bet365 vid stängning (riktigt bolag)');
for (const [n, s] of SIDOR) console.log(`  ${n.padEnd(6)} utveckling ${st(spel(fore(topp), pin, b3, s))} | nya matcher ${st(spel(efter(topp), pin, b3, s))}`);

console.log('\nB. Betfair-börsen som facit, matcher från 2024-11 (tidigare oprövat)');
for (const [namn, lista] of [['nio ligorna', efter(stang)], ['toppligorna', efter(topp)]]) {
  console.log(`  ${namn}, matcher med Betfair: ${lista.filter(bfe).length}`);
  for (const [n, s] of SIDOR) console.log(`    ${n.padEnd(6)} högsta -3 % ${st(spel(lista, bfe, sv, s))} | Bet365 ${st(spel(lista, bfe, b3, s))}`);
  for (const y of ['2024', '2025', '2026']) {
    const u = lista.filter((m) => m.date.startsWith(y));
    console.log(`    hemma ${y}: högsta -3 % ${st(spel(u, bfe, sv))} | Bet365 ${st(spel(u, bfe, b3))}`);
  }
}

console.log('\nD. Riktiga svenska priser (oddshistoriken), Pinnacle-facit, senaste avläsningen, alla ligor');
const R = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8').replace(/^﻿/, ''));
const hist = R('data/open/odds-history.json').matches;
const res = new Map(R('data/betting-store.json').matches.filter((m) => Number.isFinite(m.hg)).map((m) => [`${m.date}|${m.league}|${m.home}|${m.away}`, m.result]));
const K = ['home', 'draw', 'away'];
for (const lage of ['first', 'last']) {
  const v = [];
  let tot = 0;
  for (const [key, e] of Object.entries(hist)) {
    const s = e[lage], r = res.get(key);
    if (!r || !s?.fair || !/pinnacle/i.test(s.fairSource ?? '')) continue;
    const f = K.map((k) => s.fair[k]), o = K.map((k) => s.odds?.[k]);
    if (!f.every((x) => x > 0) || !o.every((x) => x > 1)) continue;
    tot++;
    if (hemmaregel(f, o, 0.02)) v.push(r === 'H' ? o[0] - 1 : -1);
  }
  console.log(`  ${lage}: ${tot} matcher, ${st(v)}`);
}
