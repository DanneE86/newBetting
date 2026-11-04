// De låsta modellerna för "slå bolagen". Inställningarna valdes på data t.o.m. 2024-10-31 och ändras inte efter slutprovet.
// Idé: stängningsoddset är det bästa facit som finns och har mycket mindre slump än matchresultat. Modellerna tränas på
// att förutse vart oddset går från öppning till stängning, och spelar när priset slår den förutsedda stängningen.
import { expit, fair, lagstyrka, logit, poisson, pris, ridge, stangFair } from './data.mjs';

export const MODELLER = {
  J1: { namn: 'J1 Stängningsjägaren 1X2', marknad: '1x2', typ: 'jagare', kol: [0, 1, 2, 3, 4, 5, 6, 7], tau: 0.05 },
  J2: { namn: 'J2 Stängningsjägaren mål', marknad: 'ou', typ: 'jagare', kol: [0, 1, 2, 3, 4, 5, 6, 7], tau: 0.02 },
  J3: { namn: 'J3 Pinnacle-jägaren 1X2', marknad: '1x2', typ: 'jagare', kol: [0, 1, 2, 3, 4, 5, 6, 7, 8], tau: 0.05, krav: 'pin' },
  J4: { namn: 'J4 Pinnacle-pilen mål', marknad: 'ou', typ: 'pin', tau: 0.05, krav: 'pin' },
};
export const SVENSKT_AVDRAG = 0.03; // mätt 2026-11-01: bästa svenska pris ca 3 % under högsta pris, en ögonblicksbild
export const TAU_BET365 = 0.02;
const MAX_ODDS = 5, MAX_EV = 0.25, MIN_TRAN = 6000, MAX_TRAN = 90000, LAMBDA = 5;
const Y = { H: 0, D: 1, A: 2 };
const kvartal = (d) => `${d.slice(0, 4)}Q${Math.ceil(Number(d.slice(5, 7)) / 3)}`;

function egenskaper(mk, info, i) {
  const g = (b) => (b ? Math.log(b[i] / mk.avg[i]) : 0);
  const pinGap = mk.pinFair ? logit(mk.pinFair[i]) - logit(mk.fair[i]) : 0;
  const ms = info.ok ? logit(mk.mSkott[i]) - logit(mk.fair[i]) : 0;
  const mg = info.ok ? logit(mk.mMal[i]) - logit(mk.fair[i]) : 0;
  return [1, g(mk.max), g(mk.b365), logit(mk.fair[i]), ms, mg, mk.vilaT[i] * info.vila / 7, mk.marginal, pinGap];
}

/** Väljer tecknet med störst förväntad fördel över tröskeln. Null om inget klarar tak och spärrar. */
export function valj(chanser, p, tau) {
  if (!chanser || !p) return null;
  let bi = null, be = tau;
  for (let i = 0; i < chanser.length; i++) {
    const ev = chanser[i] * p[i] - 1;
    if (ev >= be && ev < MAX_EV && p[i] <= MAX_ODDS) { bi = i; be = ev; }
  }
  return bi;
}

/** Kör alla låsta modeller dag för dag. Ser dagens stängning och resultat först när dagen är slut. */
export function korModeller(matcher) {
  const bets = [];
  for (const marknad of ['1x2', 'ou']) {
    const styrka = lagstyrka();
    const antal = marknad === '1x2' ? 3 : 2;
    const tran = { utan: [], med: [] };
    let koef = null, q = null;
    const fit = (t, kol) => {
      const rec = t.slice(-MAX_TRAN);
      return ridge(rec.map((r) => kol.map((c) => r.x[c])), rec.map((r) => r.y), LAMBDA);
    };
    for (let a = 0; a < matcher.length;) {
      let b = a;
      while (b < matcher.length && matcher[b].date === matcher[a].date) b++;
      const dag = matcher.slice(a, b);
      const sen = [];
      for (const m of dag) {
        const nu = kvartal(m.date);
        if (nu !== q) {
          q = nu;
          if (tran.utan.length > MIN_TRAN) {
            koef = { utan: fit(tran.utan, [0, 1, 2, 3, 4, 5, 6, 7]), med: tran.med.length > MIN_TRAN ? fit(tran.med, [0, 1, 2, 3, 4, 5, 6, 7, 8]) : null };
          }
        }
        const info = styrka.info(m);
        const avg = pris(m, 'avg', marknad);
        const f = fair(avg);
        if (!f) continue;
        const ps = poisson(...info.skott), pg = poisson(...info.mal);
        const mk = {
          avg, fair: f, max: pris(m, 'max', marknad), b365: pris(m, 'b365', marknad), pinFair: fair(pris(m, 'pinnacle', marknad)),
          mSkott: marknad === '1x2' ? ps.x : [ps.over, 1 - ps.over], mMal: marknad === '1x2' ? pg.x : [pg.over, 1 - pg.over],
          vilaT: marknad === '1x2' ? [1, 0, -1] : [0, 0], marginal: avg.reduce((s, x) => s + 1 / x, 0) - 1,
        };
        const xs = [];
        for (let i = 0; i < antal; i++) xs.push(egenskaper(mk, info, i));
        sen.push({ m, mk, xs });
        const prognos = (kol, c) => {
          const raw = xs.map((x, i) => expit(logit(f[i]) + kol.reduce((s, k, n) => s + c[n] * x[k], 0)));
          const t = raw.reduce((u, v) => u + v, 0);
          return raw.map((v) => v / t);
        };
        for (const [kod, cfg] of Object.entries(MODELLER)) {
          if (cfg.marknad !== marknad) continue;
          if (cfg.krav === 'pin' && !mk.pinFair) continue;
          let chanser = null;
          if (cfg.typ === 'pin') chanser = mk.pinFair;
          else if (koef) {
            const c = cfg.kol.length === 9 ? koef.med : koef.utan;
            if (c) chanser = prognos(cfg.kol, c);
          }
          if (!chanser) continue;
          const nivaer = {
            max: [mk.max, cfg.tau],
            svenskt: [mk.max?.map((x) => x * (1 - SVENSKT_AVDRAG)), cfg.tau],
            b365: [mk.b365, TAU_BET365],
          };
          for (const [niva, [p, tau]] of Object.entries(nivaer)) {
            const i = valj(chanser, p, tau);
            if (i != null) bets.push({ kod, niva, id: m.id, date: m.date, league: m.league, marknad, i, odds: p[i], ev: chanser[i] * p[i] - 1 });
          }
        }
      }
      // Dagen är slut: nu får modellen se stängning och resultat
      for (const { m, mk, xs } of sen) {
        const c = stangFair(m, marknad);
        if (!c) continue;
        for (let i = 0; i < antal; i++) {
          const y = logit(c.f[i]) - logit(mk.fair[i]);
          tran.utan.push({ x: xs[i], y });
          if (mk.pinFair) tran.med.push({ x: xs[i], y });
        }
      }
      for (const m of dag) styrka.lar(m);
      a = b;
    }
  }
  return bets;
}

/** Vinst och CLV för ett spel. */
export function facit(b, m) {
  const y = b.marknad === '1x2' ? Y[m.result] : (m.hg + m.ag > 2.5 ? 0 : 1);
  const c = stangFair(m, b.marknad);
  return { v: b.i === y ? b.odds - 1 : -1, clv: c ? b.odds * c.f[b.i] - 1 : null, closeKalla: c?.kalla ?? null };
}

/** Portföljen: alla spel utan dubbletter (samma match, marknad, nivå och tecken räknas en gång). */
export function portfolj(bets) {
  const seen = new Set();
  const ut = [];
  for (const b of bets) {
    const k = `${b.niva}|${b.id}|${b.marknad}|${b.i}`;
    if (seen.has(k)) continue;
    seen.add(k);
    ut.push({ ...b, kod: 'J5' });
  }
  return ut;
}
