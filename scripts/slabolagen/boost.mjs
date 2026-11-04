// Maskininlärning: lär sig vad marknaden missar. Målet är matchens utfall minus marknadens chans (öppning, utan marginal), så
// modellen bara kan bidra med det oddsen inte redan vet. Gradient boosting på små beslutsträd, tränas dag för dag, två gånger om året.
// Spelar när rättad chans x pris ger fördel. Bara utvecklingsdata utan --slutprov.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fairAv, JAKT_TILL, laddaTopp, lagLage } from './jakt-data.mjs';
import { lagstyrka, logit, poisson } from './data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUT = process.argv.includes('--slutprov');
const RONDER = 120, LR = 0.03, BINS = 16, MIN_LEAF = 400, MAX_TRAN = 70000, MIN_TRAN = 25000, MAX_ODDS = 5;
const TAU = [0.01, 0.02, 0.03, 0.05];

/** Gradient boosting med stubbar (ett beslutsträd på en nivå per rond). Returnerar en prediktionsfunktion. */
export function trana(X, y) {
  const n = X.length, d = X[0].length;
  const kant = [];
  for (let j = 0; j < d; j++) {
    const v = X.map((r) => r[j]).sort((a, b) => a - b);
    kant.push(Array.from({ length: BINS - 1 }, (_, b) => v[Math.floor((b + 1) * n / BINS)]));
  }
  const bin = X.map((r) => Int8Array.from(r.map((x, j) => { let b = 0; while (b < BINS - 1 && x > kant[j][b]) b++; return b; })));
  const res = Float64Array.from(y);
  const trad = [];
  for (let t = 0; t < RONDER; t++) {
    let best = null, bv = 0;
    for (let j = 0; j < d; j++) {
      const s = new Float64Array(BINS), c = new Int32Array(BINS);
      for (let i = 0; i < n; i++) { s[bin[i][j]] += res[i]; c[bin[i][j]]++; }
      let tot = 0;
      for (let b = 0; b < BINS; b++) tot += s[b];
      let ls = 0, lc = 0;
      for (let b = 0; b < BINS - 1; b++) {
        ls += s[b]; lc += c[b];
        const rc = n - lc;
        if (lc < MIN_LEAF || rc < MIN_LEAF) continue;
        const g = ls * ls / lc + (tot - ls) * (tot - ls) / rc;
        if (g > bv) { bv = g; best = { j, b, lv: ls / lc, rv: (tot - ls) / rc, kant: kant[j][b] }; }
      }
    }
    if (!best) break;
    trad.push(best);
    for (let i = 0; i < n; i++) res[i] -= LR * (bin[i][best.j] <= best.b ? best.lv : best.rv);
  }
  return (x) => trad.reduce((s, q) => s + LR * (x[q.j] <= q.kant ? q.lv : q.rv), 0);
}

function kor() {
  const matcher = laddaTopp(root, { slutprov: SLUT });
  const styrka = lagstyrka(), lage = lagLage();
  const tran = [];
  let pred = null, halvar = null;
  const res = {};
  const not = (k, v) => { const r = (res[k] ??= { n: 0, s: 0, s2: 0 }); r.n++; r.s += v; r.s2 += v * v; };
  for (let a = 0; a < matcher.length;) {
    let b = a;
    while (b < matcher.length && matcher[b].date === matcher[a].date) b++;
    const dag = matcher.slice(a, b);
    const sen = [];
    for (const m of dag) {
      const h = `${m.date.slice(0, 4)}${m.date.slice(5, 7) < '07' ? 'a' : 'b'}`;
      if (h !== halvar) {
        halvar = h;
        if (tran.length >= MIN_TRAN) { const t = tran.slice(-MAX_TRAN); pred = trana(t.map((r) => r.x), t.map((r) => r.y)); }
      }
      const ms = { league: m.league, season: m.season, date: m.date, home: m.home, away: m.away, hg: m.hg, ag: m.ag, shots: { home: m.skott.h, away: m.skott.a, homeSot: m.skott.hm, awaySot: m.skott.am } };
      const s = styrka.info(ms), l = lage.info(m);
      const f = fairAv(m.o.avg);
      sen.push({ m, ms, f });
      if (!f) continue;
      const fo = fairAv(m.ou.avg), pin = fairAv(m.o.pin);
      const ps = poisson(...s.skott), pg = poisson(...s.mal);
      const xs = [0, 1, 2].map((i) => {
        const egen = i === 0 ? l.h : i === 2 ? l.a : null, mot = i === 0 ? l.a : i === 2 ? l.h : null;
        const d = (k, fb = 0) => (egen ? (egen[k] ?? fb) - (mot[k] ?? fb) : 0);
        return [
          i, f[i], logit(f[i]),
          s.ok ? logit(ps.x[i]) - logit(f[i]) : 0, s.ok ? logit(pg.x[i]) - logit(f[i]) : 0,
          pin ? logit(pin[i]) - logit(f[i]) : 0, m.o.max ? Math.log(m.o.max[i] / m.o.avg[i]) : 0, m.o.b365 ? Math.log(m.o.b365[i] / m.o.avg[i]) : 0,
          (i === 0 ? 1 : i === 2 ? -1 : 0) * s.vila, d('rank'), d('gdForm'), d('tur'), d('senastGd'), l.h.g, l.h.kvar,
          egen?.sanHot ? 1 : 0, mot?.sanHot ? 1 : 0, egen?.dod ? 1 : 0, mot?.dod ? 1 : 0,
          egen?.rakT === 'V' ? egen.rak : 0, egen?.rakT === 'F' ? egen.rak : 0, mot?.rakT === 'V' ? mot.rak : 0, mot?.rakT === 'F' ? mot.rak : 0,
          fo ? fo[0] : 0.5, new Date(m.date).getUTCDay(), Number(m.date.slice(5, 7)), m.o.avg.reduce((q, o) => q + 1 / o, 0) - 1,
        ];
      });
      sen.at(-1).xs = xs;
      if (!pred) continue;
      if (SLUT && m.date <= JAKT_TILL) continue;
      const raw = f.map((p, i) => Math.max(0.01, p + pred(xs[i])));
      const t = raw.reduce((u, v) => u + v, 0);
      const p = raw.map((x) => x / t);
      const tagg = SLUT ? 'prov' : m.date < '2021-07-01' ? 't1' : 'v';
      for (const [niva, q] of [['b365', m.o.b365], ['sv', m.o.max?.map((x) => x * 0.97)]]) {
        if (!q) continue;
        for (const tau of TAU) {
          let bi = null, be = tau;
          for (let i = 0; i < 3; i++) { const ev = p[i] * q[i] - 1; if (ev >= be && ev < 0.25 && q[i] <= MAX_ODDS) { bi = i; be = ev; } }
          if (bi != null) not(`${niva}|${tau}|${tagg}`, bi === m.y ? q[bi] - 1 : -1);
        }
      }
    }
    for (const { m, ms, f, xs } of sen) {
      if (f && xs) for (let i = 0; i < 3; i++) tran.push({ x: xs[i], y: (m.y === i ? 1 : 0) - f[i] });
      styrka.lar(ms); lage.lar(m);
    }
    a = b;
  }
  const st = (r) => { if (!r) return 'n 0'; const m = r.s / r.n; const sd = Math.sqrt(Math.max(1e-9, r.s2 / r.n - m * m)); return `n ${String(r.n).padStart(5)} ROI ${(m * 100).toFixed(1).padStart(6)}% z ${(m / (sd / Math.sqrt(r.n))).toFixed(2).padStart(5)}`; };
  console.log('Boost: pris tröskel | period 1 | period 2');
  for (const n of ['b365', 'sv']) for (const t of TAU) console.log(`${n.padEnd(5)} ${String(t).padEnd(5)} ${st(res[`${n}|${t}|t1`] ?? res[`${n}|${t}|prov`])} | ${st(res[`${n}|${t}|v`])}`);
}
const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) kor();
