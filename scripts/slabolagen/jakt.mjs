// Jakten: alla idéer prövas samtidigt på utvecklingsdata, räknas, och kravet skärps med antalet (Bonferroni).
// En idé är en regel som ser matchen före avspark och väljer ett spel. Pris: Bet365 eller högsta pris -3 % ("svenskt").
// Idéer med stängning spelas på stängningspriset, övriga på öppningen.
//   node scripts/slabolagen/jakt.mjs                       utvecklingsdata
//   node scripts/slabolagen/jakt.mjs --slutprov id1,id2    bara de namngivna idéerna på matcher efter 2024-10-31
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ahVinst, fairAv, JAKT_TILL, laddaStang, laddaTopp, lagLage } from './jakt-data.mjs';
import { lagstyrka, logit, poisson } from './data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPLIT = '2021-07-01';
const AVDRAG = 0.03;
const slutArg = process.argv.indexOf('--slutprov');
const slutIds = slutArg > 0 ? new Set(process.argv[slutArg + 1].split(',')) : null;

// ---------- Idéerna ----------
const IDEER = [];
const ny = (id, marknad, tid, f, ligor = 'topp') => IDEER.push({ id, marknad, tid, f, ligor });
const SIDOR = [['H', 0], ['X', 1], ['B', 2]];
// A: oddsband per tecken
for (const [s, i] of SIDOR) {
  for (const [lo, hi] of [[1, 1.5], [1.5, 2], [2, 3], [3, 5], [5, 10]]) {
    ny(`A band ${s} ${lo}-${hi}`, '1x2', 'o', (m, c, p) => (p[i] >= lo && p[i] < hi ? i : null));
  }
}
// B: kalender
const KAL = {
  'runda 1-5': (m, c) => c.l.h.g < 5, 'runda 6-10': (m, c) => c.l.h.g >= 5 && c.l.h.g < 10, 'sista 5': (m, c) => c.l.h.kvar <= 5 && c.l.h.kvar > 0,
  'fredag': (m) => new Date(m.date).getUTCDay() === 5, 'måndag': (m) => new Date(m.date).getUTCDay() === 1, 'midvecka': (m) => [2, 3, 4].includes(new Date(m.date).getUTCDay()),
  'dec-jan': (m) => ['12', '01'].includes(m.date.slice(5, 7)),
};
for (const [n, t] of Object.entries(KAL)) for (const [s, i] of SIDOR) ny(`B ${n} ${s}`, '1x2', 'o', (m, c) => (t(m, c) ? i : null));
// C: reaktion på senaste resultaten (hemma=h, borta=b)
const LAGET = [['h', 0, 2], ['a', 2, 0]];
for (const [k, egen, mot] of LAGET) {
  const n = k === 'h' ? 'hemmalag' : 'bortalag';
  ny(`C ${n} förlorade stort, spela på`, '1x2', 'o', (m, c) => (c.l[k].f && c.l[k].senastGd <= -3 ? egen : null));
  ny(`C ${n} förlorade stort, spela mot`, '1x2', 'o', (m, c) => (c.l[k].f && c.l[k].senastGd <= -3 ? mot : null));
  ny(`C ${n} vann stort, spela mot`, '1x2', 'o', (m, c) => (c.l[k].f && c.l[k].senastGd >= 3 ? mot : null));
  ny(`C ${n} vann stort, spela på`, '1x2', 'o', (m, c) => (c.l[k].f && c.l[k].senastGd >= 3 ? egen : null));
  ny(`C ${n} 4+ raka segrar, spela mot`, '1x2', 'o', (m, c) => (c.l[k].rakT === 'V' && c.l[k].rak >= 4 ? mot : null));
  ny(`C ${n} 4+ raka segrar, spela på`, '1x2', 'o', (m, c) => (c.l[k].rakT === 'V' && c.l[k].rak >= 4 ? egen : null));
  ny(`C ${n} 4+ raka förluster, spela på`, '1x2', 'o', (m, c) => (c.l[k].rakT === 'F' && c.l[k].rak >= 4 ? egen : null));
  ny(`C ${n} 4+ raka förluster, spela mot`, '1x2', 'o', (m, c) => (c.l[k].rakT === 'F' && c.l[k].rak >= 4 ? mot : null));
  // D: tur = målskillnad minus skottvärde
  for (const t of [0.5, 1]) {
    ny(`D ${n} otur>${t}, spela på`, '1x2', 'o', (m, c) => (c.l[k].tur != null && c.l[k].tur <= -t ? egen : null));
    ny(`D ${n} tur>${t}, spela mot`, '1x2', 'o', (m, c) => (c.l[k].tur != null && c.l[k].tur >= t ? mot : null));
  }
  // F: motivation
  ny(`F ${n} hotad, motståndet dött, spela på`, '1x2', 'o', (m, c) => { const o = k === 'h' ? 'a' : 'h'; return c.l[k].sanHot && c.l[k].kvar <= 7 && c.l[o].dod ? egen : null; });
  ny(`F ${n} dött läge, spela mot`, '1x2', 'o', (m, c) => (c.l[k].dod ? mot : null));
  ny(`F ${n} tidigt uppflyttat/nytt, spela på`, '1x2', 'o', (m, c) => (c.l[k].g < 6 && !c.gamla.has(`${m.league}|${k === 'h' ? m.home : m.away}|${m.season}`) ? egen : null));
}
// E: vila
for (const t of [3, 5]) {
  ny(`E vila hemma +${t}d, spela hemma`, '1x2', 'o', (m, c) => (c.vila >= t ? 0 : null));
  ny(`E vila borta +${t}d, spela borta`, '1x2', 'o', (m, c) => (c.vila <= -t ? 2 : null));
}
// H: lagstyrka från skott/mål mot marknaden
for (const g of [0.2, 0.4, 0.6]) {
  for (const [s, i] of SIDOR) {
    ny(`H skottmodell ${s} +${g}`, '1x2', 'o', (m, c) => (c.ok && c.gapS[i] >= g ? i : null));
    ny(`H målmodell ${s} +${g}`, '1x2', 'o', (m, c) => (c.ok && c.gapM[i] >= g ? i : null));
    ny(`H båda modeller ${s} +${g}`, '1x2', 'o', (m, c) => (c.ok && c.gapS[i] >= g && c.gapM[i] >= g ? i : null));
  }
  ny(`H skottmodell över +${g}`, 'ou', 'o', (m, c) => (c.ok && c.gapOuS >= g ? 0 : null));
  ny(`H skottmodell under +${g}`, 'ou', 'o', (m, c) => (c.ok && c.gapOuS <= -g ? 1 : null));
}
// G: målmarknaden
for (const [lo, hi] of [[1, 1.6], [1.6, 2], [2, 2.5], [2.5, 4]]) {
  ny(`G över odds ${lo}-${hi}`, 'ou', 'o', (m, c, p) => (p[0] >= lo && p[0] < hi ? 0 : null));
  ny(`G under odds ${lo}-${hi}`, 'ou', 'o', (m, c, p) => (p[1] >= lo && p[1] < hi ? 1 : null));
}
ny('G över runda 1-5', 'ou', 'o', (m, c) => (c.l.h.g < 5 ? 0 : null));
ny('G under runda 1-5', 'ou', 'o', (m, c) => (c.l.h.g < 5 ? 1 : null));
ny('G under sista 5', 'ou', 'o', (m, c) => (c.l.h.kvar <= 5 && c.l.h.kvar > 0 ? 1 : null));
ny('G över sista 5', 'ou', 'o', (m, c) => (c.l.h.kvar <= 5 && c.l.h.kvar > 0 ? 0 : null));
// I: motsägelser mellan marknaderna
ny('I kryss när under är stort favorit', '1x2', 'o', (m) => { const f = fairAv(m.ou.avg); return f && f[1] >= 0.6 ? 1 : null; });
ny('I över när jämn match och låg kryss', 'ou', 'o', (m) => { const f = fairAv(m.o.avg); return f && f[1] <= 0.22 && f[0] > 0.3 && f[2] > 0.3 ? 0 : null; });
// J: rörelse öppning -> stängning, spelas på stängningen
for (const t of [0.03, 0.06, 0.1]) {
  for (const [s, i] of SIDOR) {
    ny(`J följ ${s} kortnat ${t}`, '1x2', 'c', (m) => { const a = m.o.avg, b = m.c.avg; return a && b && Math.log(a[i] / b[i]) >= t ? i : null; });
    ny(`J mot: ${s} förlängt ${t}, spela ${s}`, '1x2', 'c', (m) => { const a = m.o.avg, b = m.c.avg; return a && b && Math.log(b[i] / a[i]) >= t ? i : null; });
  }
  ny(`J följ över kortnat ${t}`, 'ou', 'c', (m) => { const a = m.ou.avg, b = m.ouc.avg; return a && b && Math.log(a[0] / b[0]) >= t ? 0 : null; });
  ny(`J följ under kortnat ${t}`, 'ou', 'c', (m) => { const a = m.ou.avg, b = m.ouc.avg; return a && b && Math.log(a[1] / b[1]) >= t ? 1 : null; });
}
// K: skarpt pris mot priset man får. Öppning, stängning, 1X2, mål, handikapp.
const evVal = (f, p, t, kap = 5) => {
  if (!f || !p) return null;
  let b = null, be = t;
  for (let i = 0; i < f.length; i++) { const ev = f[i] * p[i] - 1; if (ev >= be && ev < 0.25 && p[i] <= kap) { b = i; be = ev; } }
  return b;
};
for (const t of [0.01, 0.02, 0.03, 0.05]) {
  ny(`K Pinnacle öppning 1X2 ${t}`, '1x2', 'o', (m, c, p) => evVal(fairAv(m.o.pin), p, t));
  ny(`K Pinnacle öppning mål ${t}`, 'ou', 'o', (m, c, p) => evVal(fairAv(m.ou.pin), p, t));
  ny(`K Pinnacle öppning handikapp ${t}`, 'ah', 'o', (m, c, p) => evVal(fairAv(m.ah.pin), p, t));
  ny(`K Pinnacle stängning 1X2 ${t}`, '1x2', 'c', (m, c, p) => evVal(fairAv(m.c.pin), p, t));
  ny(`K Pinnacle stängning mål ${t}`, 'ou', 'c', (m, c, p) => evVal(fairAv(m.ouc.pin), p, t));
  ny(`K stängning 1X2 andra ligor ${t}`, '1x2', 'c', (m, c, p) => evVal(fairAv(m.c.pin), p, t), 'stang');
  ny(`K Pinnacle öppning 1X2 band 1,5-3 ${t}`, '1x2', 'o', (m, c, p) => { const i = evVal(fairAv(m.o.pin), p, t); return i != null && p[i] >= 1.5 && p[i] < 3 ? i : null; });
  ny(`K Pinnacle öppning kryss ${t}`, '1x2', 'o', (m, c, p) => { const i = evVal(fairAv(m.o.pin), p, t); return i === 1 ? 1 : null; });
}
// L: ligor i stängningsgruppen
for (const lig of ['AR', 'AS', 'BR', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'NO']) {
  for (const [s, i] of SIDOR) ny(`L ${lig} stängning ${s}`, '1x2', 'c', (m, c, p) => (m.league === lig ? i : null), 'stang');
}
// Runda 2: djupare i K-familjen, som var den enda som levde i runda 1
const DRILL = [
  ['öppning 1X2', '1x2', 'o', (m) => fairAv(m.o.pin), 'topp', [['H', 0], ['X', 1], ['B', 2]]],
  ['öppning mål', 'ou', 'o', (m) => fairAv(m.ou.pin), 'topp', [['över', 0], ['under', 1]]],
  ['stängning 1X2', '1x2', 'c', (m) => fairAv(m.c.pin), 'topp', [['H', 0], ['X', 1], ['B', 2]]],
  ['stängning andra', '1x2', 'c', (m) => fairAv(m.c.pin), 'stang', [['H', 0], ['X', 1], ['B', 2]]],
];
for (const [namn, mk, tid, fr, lig, sidor] of DRILL) {
  for (const t of [0.02, 0.03, 0.05]) {
    for (const [s, i] of sidor) ny(`R2 ${namn} ${t} ${s}`, mk, tid, (m, c, p) => (evVal(fr(m), p, t) === i ? i : null), lig);
    for (const [lo, hi] of [[1, 2], [2, 3], [3, 5]]) ny(`R2 ${namn} ${t} odds ${lo}-${hi}`, mk, tid, (m, c, p) => { const i = evVal(fr(m), p, t); return i != null && p[i] >= lo && p[i] < hi ? i : null; }, lig);
    for (const l of (lig === 'topp' ? ['PL', 'CH', 'EL1', 'BL', 'BL2', 'LL', 'LL2', 'SA', 'SB', 'L1', 'ED', 'BE', 'PT', 'GR', 'SC'] : ['AR', 'AS', 'BR', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'NO'])) {
      ny(`R2 ${namn} ${t} liga ${l}`, mk, tid, (m, c, p) => (m.league === l ? evVal(fr(m), p, t) : null), lig);
    }
    if (lig === 'topp' && tid === 'o') {
      ny(`R2 ${namn} ${t} modellen håller med`, mk, tid, (m, c, p) => { const i = evVal(fr(m), p, t); if (i == null || !c.ok) return null; return mk === '1x2' ? (c.gapS[i] > 0 ? i : null) : ((i === 0 ? c.gapOuS : -c.gapOuS) > 0 ? i : null); }, lig);
      ny(`R2 ${namn} ${t} modellen emot`, mk, tid, (m, c, p) => { const i = evVal(fr(m), p, t); if (i == null || !c.ok) return null; return mk === '1x2' ? (c.gapS[i] < 0 ? i : null) : ((i === 0 ? c.gapOuS : -c.gapOuS) < 0 ? i : null); }, lig);
    }
  }
}
// Runda 3: handikapp och mål per sida, stängning. Hemmaregeln delad på situation. Bara utvecklingsdata.
for (const t of [0.01, 0.02, 0.03, 0.05]) {
  for (const [s, i] of [['över', 0], ['under', 1]]) ny(`R3 stängning mål ${t} ${s}`, 'ou', 'c', (m, c, p) => (evVal(fairAv(m.ouc.pin), p, t) === i ? i : null));
  for (const [s, i] of [['hemma', 0], ['borta', 1]]) {
    ny(`R3 handikapp öppning ${t} ${s}`, 'ah', 'o', (m, c, p) => (evVal(fairAv(m.ah.pin), p, t) === i ? i : null));
    ny(`R3 handikapp stängning ${t} ${s}`, 'ah', 'c', (m, c, p) => (evVal(fairAv(m.ahc.pin), p, t) === i ? i : null));
  }
  ny(`R3 handikapp stängning ${t}`, 'ah', 'c', (m, c, p) => evVal(fairAv(m.ahc.pin), p, t));
}
const hemma = (m, p, t = 0.02) => evVal(fairAv(m.c.pin), p, t) === 0;
const SITUATION = {
  'målmodellen håller med': (m, c) => c.ok && c.gapM[0] > 0, 'målmodellen emot': (m, c) => c.ok && c.gapM[0] < 0,
  'hemma underdog': (m) => m.c.pin && m.c.pin[0] > m.c.pin[2], 'hemma favorit': (m) => m.c.pin && m.c.pin[0] <= m.c.pin[2],
  'runda 1-8': (m, c) => c.l.h.g < 8, 'sista 8': (m, c) => c.l.h.kvar <= 8, 'hemmalag i form': (m, c) => c.l.h.gdForm > 0.5, 'hemmalag ur form': (m, c) => c.l.h.gdForm < -0.5,
  'hemma överlägset i tabellen': (m, c) => c.l.h.rank + 5 <= c.l.a.rank, 'hemma under i tabellen': (m, c) => c.l.a.rank + 5 <= c.l.h.rank,
};
for (const [n, f] of Object.entries(SITUATION)) {
  for (const lig of ['topp', 'stang']) ny(`R3 hemmaregel ${lig} ${n}`, '1x2', 'c', (m, c, p) => (hemma(m, p) && f(m, c) ? 0 : null), lig);
}
const SKYDD_ODDS = 12;

// ---------- Körning ----------
function kor(matcher, ligor, urval) {
  const styrka = lagstyrka(), lage = lagLage(), rad = new Map();
  const gamla = new Set();
  const iPeriod = (d) => (slutIds ? d > JAKT_TILL : true);
  const lista = IDEER.filter((x) => x.ligor === ligor && (!urval || urval.has(x.id)));
  for (let a = 0; a < matcher.length;) {
    let b = a;
    while (b < matcher.length && matcher[b].date === matcher[a].date) b++;
    const dag = matcher.slice(a, b);
    for (const m of dag) {
      const strong = styrka.info(mStyrka(m));
      const l = lage.info(m);
      const f = fairAv(m.o.avg);
      const fo = fairAv(m.ou.avg);
      const ps = poisson(...strong.skott), pg = poisson(...strong.mal);
      const c = {
        l, gamla, ok: strong.ok && f, vila: strong.vila,
        gapS: f ? ps.x.map((x, i) => logit(x) - logit(f[i])) : null, gapM: f ? pg.x.map((x, i) => logit(x) - logit(f[i])) : null,
        gapOuS: fo ? logit(ps.over) - logit(fo[0]) : null,
      };
      if (!iPeriod(m.date)) continue;
      const tagg = m.date < SPLIT ? 't1' : 'v';
      for (const h of lista) {
        for (const niva of ['b365', 'sv']) {
          const kalla = h.marknad === '1x2' ? (h.tid === 'o' ? m.o : m.c) : h.marknad === 'ou' ? (h.tid === 'o' ? m.ou : m.ouc) : (h.tid === 'o' ? m.ah : m.ahc);
          const raw = niva === 'b365' ? kalla.b365 : kalla.max?.map((x) => x * (1 - AVDRAG));
          if (!raw) continue;
          if (h.marknad === 'ah' && kalla.linje == null) continue;
          let val = null;
          try { val = h.f(m, c, raw); } catch { val = null; }
          if (val == null || raw[val] > SKYDD_ODDS || raw[val] < 1.02) continue;
          const y = h.marknad === '1x2' ? m.y : h.marknad === 'ou' ? (m.hg + m.ag > 2.5 ? 0 : 1) : null;
          const v = h.marknad === 'ah' ? ahVinst(m.hg, m.ag, kalla.linje, val, raw[val]) : (val === y ? raw[val] - 1 : -1);
          const k = `${h.id}|${niva}|${tagg}`;
          const r = rad.get(k) ?? { n: 0, s: 0, s2: 0 };
          r.n++; r.s += v; r.s2 += v * v;
          rad.set(k, r);
        }
      }
    }
    for (const m of dag) { styrka.lar(mStyrka(m)); lage.lar(m); gamla.add(`${m.league}|${m.home}|${nasta(m.season)}`); gamla.add(`${m.league}|${m.away}|${nasta(m.season)}`); }
    a = b;
  }
  return rad;
}
const mStyrka = (m) => ({ league: m.league, season: m.season, date: m.date, home: m.home, away: m.away, hg: m.hg, ag: m.ag, shots: { home: m.skott.h, away: m.skott.a, homeSot: m.skott.hm, awaySot: m.skott.am } });
const nasta = (s) => {
  if (/^\d{4}$/.test(s) && Number(s.slice(0, 2)) < 30 && Number(s.slice(2, 4)) === Number(s.slice(0, 2)) + 1) {
    const x = Number(s.slice(0, 2)) + 1;
    return `${String(x).padStart(2, '0')}${String(x + 1).padStart(2, '0')}`;
  }
  return s;
};

const st = (r) => { if (!r || !r.n) return { n: 0, roi: null, z: 0 }; const m = r.s / r.n; const sd = Math.sqrt(Math.max(1e-9, r.s2 / r.n - m * m)); return { n: r.n, roi: m, z: m / (sd / Math.sqrt(r.n)) }; };
const slag = (a, b) => (a && b ? { n: a.n + b.n, s: a.s + b.s, s2: a.s2 + b.s2 } : (a ?? b));

const topp = laddaTopp(root, { slutprov: Boolean(slutIds) }), stang = laddaStang(root, { slutprov: Boolean(slutIds) });
console.log(`Topp ${topp.length} (t.o.m. ${topp.at(-1).date}), andra ligor ${stang.length}, idéer ${IDEER.length} x 2 pris = ${IDEER.length * 2} prov`);
const rad = new Map([...kor(topp, 'topp', slutIds), ...kor(stang, 'stang', slutIds)]);
const pct = (x) => (x == null ? '   -  ' : `${(x * 100).toFixed(1).padStart(5)}%`);

if (slutIds) {
  console.log('\nSLUTPROV (matcher efter 2024-10-31)\nIdé | pris | spel | ROI | z');
  for (const id of slutIds) for (const n of ['b365', 'sv']) { const s = st(slag(rad.get(`${id}|${n}|t1`), rad.get(`${id}|${n}|v`))); console.log(`${id.padEnd(48)} ${n.padEnd(5)} ${String(s.n).padStart(5)} ${pct(s.roi)} z ${s.z.toFixed(2)}`); }
} else {
  const res = [];
  for (const h of IDEER) for (const n of ['b365', 'sv']) {
    const t = rad.get(`${h.id}|${n}|t1`), v = rad.get(`${h.id}|${n}|v`);
    res.push({ id: h.id, n, t1: st(t), v: st(v), all: st(slag(t, v)) });
  }
  const prov = res.filter((x) => x.all.n >= 150);
  const k = prov.length;
  // Bonferroni, ensidigt 5 % över alla prov
  const zKrav = k > 2000 ? 3.9 : k > 1000 ? 3.7 : k > 500 ? 3.5 : 3.3; // Bonferroni, ensidigt 5 %
  console.log(`\nProv med minst 150 spel: ${k}. Krav efter korrigering: z >= ${zKrav}. Väntat av ren slump med z >= 2: ${(k * 0.023).toFixed(0)}, faktiskt: ${prov.filter((x) => x.all.z >= 2).length}.`);
  const bast = prov.filter((x) => x.all.roi > 0 && x.t1.roi > 0 && x.v.roi > 0).sort((a, b) => b.all.z - a.all.z).slice(0, 30);
  console.log('\nBäst med plus i båda perioderna\nIdé | pris | spel | ROI | z | t1 | v');
  for (const x of bast) console.log(`${x.id.padEnd(48)} ${x.n.padEnd(5)} ${String(x.all.n).padStart(6)} ${pct(x.all.roi)} z ${x.all.z.toFixed(2)} | ${String(x.t1.n).padStart(5)} ${pct(x.t1.roi)} | ${String(x.v.n).padStart(5)} ${pct(x.v.roi)}`);
  fs.writeFileSync(path.join(root, 'data', 'reports', 'jakt-utveckling.json'), JSON.stringify({ k, zKrav, res }, null, 0));
  console.log(`\nKlarar kravet: ${prov.filter((x) => x.all.z >= zKrav && x.t1.roi > 0 && x.v.roi > 0).map((x) => `${x.id} (${x.n})`).join(', ') || 'ingen'}`);
}
