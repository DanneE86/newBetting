// Utvärdering av modelltävlingen. Modellerna ser aldrig den här filen: den läser deras sparade rader och facit efteråt.
// Bäst på att tippa = lägst RPS på matcher alla tippat. Bäst på att tjäna = högst ROI på Bet365:s pris, bevisad först
// om hela 95 %-intervallet ligger över noll. Reglerna bestämdes före första körningen.
export const RES = { H: 0, D: 1, A: 2 };

export function rps(p, y) {
  const a = p[0] - (y === 0 ? 1 : 0), b = p[0] + p[1] - (y <= 1 ? 1 : 0);
  return 0.5 * (a * a + b * b);
}

export function logLoss(p, y) { return -Math.log(Math.max(1e-9, p[y])); }

/** Upprepbar slump: samma frö ger samma intervall varje körning. */
export function slump(seed = 20261101) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 95 %-intervall för snittet genom att dra om värdena 2000 gånger. */
export function intervall(varden, ant = 2000, seed = 20261101) {
  if (!varden.length) return [null, null];
  const r = slump(seed), snitt = [];
  for (let b = 0; b < ant; b++) {
    let s = 0;
    for (let i = 0; i < varden.length; i++) s += varden[Math.floor(r() * varden.length)];
    snitt.push(s / varden.length);
  }
  snitt.sort((x, y) => x - y);
  return [snitt[Math.floor(ant * 0.025)], snitt[Math.floor(ant * 0.975)]];
}

/** Stängningspriset utan marginal: Pinnacle, annars Betfair-börsen, annars bolagens snitt. */
export function stangning(m) {
  const c = m.closing ?? {};
  for (const k of ['pinnacle', 'bfe', 'avg']) {
    const o = [c[`${k}_home`], c[`${k}_draw`], c[`${k}_away`]];
    if (o.every((x) => x > 1)) {
      const inv = o.map((x) => 1 / x), t = inv[0] + inv[1] + inv[2];
      return inv.map((x) => x / t);
    }
  }
  return null;
}

export function spelFacit(bets, tillMatch) {
  const utfall = [], clv = [];
  let vunna = 0, maxFall = 0, topp = 0, saldo = 0;
  for (const b of bets) {
    const m = tillMatch(b.id);
    const y = RES[m.result];
    const vinst = b.i === y ? b.odds - 1 : -1;
    if (vinst > 0) vunna++;
    utfall.push(vinst);
    saldo += vinst;
    topp = Math.max(topp, saldo);
    maxFall = Math.max(maxFall, topp - saldo);
    const f = stangning(m);
    if (f) clv.push(b.odds * f[b.i] - 1);
  }
  const n = utfall.length;
  const [lag, hog] = intervall(utfall);
  const snitt = (x) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : null);
  return {
    n, vunna, traff: n ? vunna / n : null, roi: snitt(utfall), roiLag: lag, roiHog: hog, enheter: saldo, maxFall,
    clv: snitt(clv), clvPos: clv.length ? clv.filter((x) => x > 0).length / clv.length : null,
    snittOdds: n ? bets.reduce((a, b) => a + b.odds, 0) / n : null,
  };
}

export function tipsFacit(rader, tillMatch) {
  let tr = 0, r = 0, l = 0;
  const per = [];
  for (const x of rader) {
    const y = RES[tillMatch(x.id).result];
    if (x.pick === y) tr++;
    const q = rps(x.p, y);
    r += q; l += logLoss(x.p, y);
    per.push(q);
  }
  const n = rader.length;
  return { n, traff: n ? tr / n : null, rps: n ? r / n : null, logLoss: n ? l / n : null, per };
}

/** Parvis jämförelse av RPS: z under -2 = a är säkert bättre än b. */
export function parZ(perA, perB) {
  const d = perA.map((x, i) => x - perB[i]);
  const n = d.length, m = d.reduce((a, b) => a + b, 0) / n;
  const s2 = d.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1);
  return m / Math.sqrt(s2 / n);
}
