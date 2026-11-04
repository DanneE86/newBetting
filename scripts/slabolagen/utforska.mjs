// Utforskning på utvecklingsdata (t.o.m. 2024-10-31). Slutprovet kan inte läsas härifrån.
// Mäter varje idé dag för dag: tränar bara på det som redan spelats. Skriver ROI och CLV per tröskel, per delperiod.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expit, fair, lagstyrka, laddaAlla, logit, poisson, pris, ridge, stangFair } from './data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const matcher = laddaAlla(root);
const SPLIT = '2021-07-01';
console.log(`Utvecklingsdata: ${matcher.length} matcher, ${matcher[0].date} till ${matcher.at(-1).date}`);

const Y = { H: 0, D: 1, A: 2 };
const kv = (m) => `${m.date.slice(0, 4)}Q${Math.ceil(Number(m.date.slice(5, 7)) / 3)}`;

// Egenskaper per utfall. mh = marknadens chans (snitt utan marginal).
function egenskaper(mk, info, i) {
  const g = (b) => (b ? Math.log(b[i] / mk.avg[i]) : 0);
  const pinGap = mk.pinFair ? logit(mk.pinFair[i]) - logit(mk.fair[i]) : 0;
  const ms = info.ok ? logit(mk.modellSkott[i]) - logit(mk.fair[i]) : 0;
  const mg = info.ok ? logit(mk.modellMal[i]) - logit(mk.fair[i]) : 0;
  return [1, g(mk.max), g(mk.b365), logit(mk.fair[i]), ms, mg, mk.vilaTecken[i] * info.vila / 7, mk.marginal, pinGap];
}

const bets = {}; // namn -> rader
const notera = (namn, r) => { (bets[namn] ??= []).push(r); };
const TROSKLAR = [0, 0.01, 0.02, 0.03, 0.05, 0.08];

function kor(marknad) {
  const styrka = lagstyrka();
  const trans = { med: [], utan: [] };
  let modeller = null, kvartal = null;
  const antal = marknad === '1x2' ? 3 : 2;
  for (let a = 0; a < matcher.length;) {
    let b = a;
    while (b < matcher.length && matcher[b].date === matcher[a].date) b++;
    const dag = matcher.slice(a, b);
    for (const m of dag) {
      const q = kv(m);
      if (q !== kvartal) {
        kvartal = q;
        if (trans.utan.length > 6000) {
          const fit = (t, cols) => {
            const rec = t.slice(-90000);
            return ridge(rec.map((r) => cols.map((c) => r.x[c])), rec.map((r) => r.y), 5);
          };
          modeller = { utan: fit(trans.utan, [0, 1, 2, 3, 4, 5, 6, 7]), med: trans.med.length > 6000 ? fit(trans.med, [0, 1, 2, 3, 4, 5, 6, 7, 8]) : null };
        }
      }
      const info = styrka.info(m);
      const avg = pris(m, 'avg', marknad);
      const f = fair(avg);
      if (!f) continue;
      const ps = poisson(...info.skott), pg = poisson(...info.mal);
      const mk = {
        avg, fair: f, max: pris(m, 'max', marknad), b365: pris(m, 'b365', marknad), pinFair: fair(pris(m, 'pinnacle', marknad)),
        modellSkott: marknad === '1x2' ? ps.x : [ps.over, 1 - ps.over], modellMal: marknad === '1x2' ? pg.x : [pg.over, 1 - pg.over],
        vilaTecken: marknad === '1x2' ? [1, 0, -1] : [0, 0], marginal: avg.reduce((s, x) => s + 1 / x, 0) - 1,
      };
      const close = stangFair(m, marknad);
      const y = marknad === '1x2' ? Y[m.result] : (m.hg + m.ag > 2.5 ? 0 : 1);
      const xs = [];
      for (let i = 0; i < antal; i++) xs.push(egenskaper(mk, info, i));
      m._x = xs; m._mk = mk; m._close = close; m._y = y;

      const tagg = m.date < SPLIT ? 'd1' : 'd2';
      const spela = (namn, chanser, bok, kapOdds = 1e9) => {
        const p = bok === 'b365' ? mk.b365 : mk.max;
        if (!p || !chanser) return;
        for (const t of TROSKLAR) {
          let bi = null, be = t;
          for (let i = 0; i < antal; i++) {
            const ev = chanser[i] * p[i] - 1;
            if (ev >= be && ev < 0.25 && p[i] <= kapOdds) { bi = i; be = ev; }
          }
          if (bi == null) continue;
          notera(`${namn}|${bok}|${t}|${tagg}`, { v: bi === y ? p[bi] - 1 : -1, c: close ? p[bi] * close.f[bi] - 1 : null, o: p[bi], l: m.league, i: bi, id: m.id });
        }
      };
      // A: Pinnacles öppning som facit
      if (mk.pinFair) for (const bk of ['b365', 'max']) spela('A pinnacle', mk.pinFair, bk, 5);
      // B: snittet som facit (fungerar även utan Pinnacle)
      for (const bk of ['b365', 'max']) spela('B snitt', f, bk, 5);
      // C: stängningsjägaren
      if (modeller) {
        const rakna = (kolumner, koef) => {
          const raw = xs.map((x, i) => expit(logit(f[i]) + kolumner.reduce((s, c, k) => s + koef[k] * x[c], 0)));
          const t = raw.reduce((u, v) => u + v, 0);
          return raw.map((v) => v / t);
        };
        const ut = rakna([0, 1, 2, 3, 4, 5, 6, 7], modeller.utan);
        for (const bk of ['b365', 'max']) spela('C jagare utan pin', ut, bk, 5);
        if (modeller.med && mk.pinFair) for (const bk of ['b365', 'max']) spela('D jagare med pin', rakna([0, 1, 2, 3, 4, 5, 6, 7, 8], modeller.med), bk, 5);
      }
    }
    for (const m of dag) {
      if (m._x && m._close) {
        for (let i = 0; i < m._x.length; i++) {
          const y = logit(m._close.f[i]) - logit(m._mk.fair[i]);
          trans.utan.push({ x: m._x[i], y });
          if (m._mk.pinFair) trans.med.push({ x: m._x[i], y });
        }
      }
      styrka.lar(m);
      delete m._x; delete m._mk; delete m._close; delete m._y;
    }
    a = b;
  }
  return modeller;
}

const rapport = (etikett) => {
  const namn = [...new Set(Object.keys(bets).map((k) => k.split('|').slice(0, 2).join('|')))].sort();
  console.log(`\n=== ${etikett} ===\nStrategi | bok | tröskel | d1: spel ROI CLV | d2: spel ROI CLV`);
  const st = (r) => {
    if (!r?.length) return '   0     -      -   ';
    const roi = r.reduce((s, x) => s + x.v, 0) / r.length;
    const c = r.filter((x) => x.c != null);
    const clv = c.length ? c.reduce((s, x) => s + x.c, 0) / c.length : null;
    return `${String(r.length).padStart(5)} ${(roi * 100).toFixed(1).padStart(6)}% ${clv == null ? '   -  ' : `${(clv * 100).toFixed(1).padStart(5)}%`}`;
  };
  for (const n of namn) for (const t of TROSKLAR) console.log(`${n.padEnd(26)} ${String(t).padEnd(5)} ${st(bets[`${n}|${t}|d1`])} | ${st(bets[`${n}|${t}|d2`])}`);
};

const mod1 = kor('1x2');
console.log('Koefficienter 1X2 (utan pin): konstant, max-gap, b365-gap, logit, skott, mål, vila, marginal', mod1?.utan?.map((x) => x.toFixed(3)).join(' '));
console.log('Med pin: ... + pin-gap', mod1?.med?.map((x) => x.toFixed(3)).join(' '));
rapport('1X2');
for (const k of Object.keys(bets)) delete bets[k];
const mod2 = kor('ou');
console.log('Koefficienter O/U (utan pin)', mod2?.utan?.map((x) => x.toFixed(3)).join(' '));
console.log('Med pin', mod2?.med?.map((x) => x.toFixed(3)).join(' '));
rapport('Över/under 2,5');
