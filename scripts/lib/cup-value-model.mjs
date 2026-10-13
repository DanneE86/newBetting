// Truppvärdesmodell för cupmatcher: 1X2 ur x = ln(truppvärde hemma / borta) med ordnad logit
// (z = b·x, gränser c1 < c2 bär hemmafördelen): P(2) = σ(c1 − z), P(X) = σ(c2 − z) − σ(c1 − z), P(1) = 1 − σ(c2 − z).
//   const rows = cupValueRows(doc)                     // doc = data/open/cup-history-tm.json
//   const m = fitValueModel(rows)                      // { c1, c2, b, n }
//   valueModelProbs(m, Math.log(3)) -> [0.55, 0.25, 0.20]   (hemmalaget 3 gånger dyrare)
export const RATIO_BUCKETS = [[1, 1.5], [1.5, 2], [2, 3], [3, 5], [5, 10], [10, Infinity]];

const sig = (v) => 1 / (1 + Math.exp(-v));

/** Spelade cupmatcher med båda truppvärdena, utan straff- och förlängningsmatcher. */
export function cupValueRows(doc) {
  const out = [];
  for (const s of Object.values(doc?.seasons ?? {})) {
    for (const m of s.matches ?? []) {
      if (m.extra) continue;
      const vh = doc.clubs?.[`${m.homeId}|${s.season}`]?.value, va = doc.clubs?.[`${m.awayId}|${s.season}`]?.value;
      if (!vh || !va) continue;
      const x = Math.log(vh / va);
      const res = m.hg > m.ag ? 'H' : m.hg === m.ag ? 'D' : 'A';
      const richHome = x > 0;
      const richRes = res === 'D' ? 'D' : (res === 'H') === richHome ? 'W' : 'L';
      out.push({ league: s.league, season: s.season, date: m.date, stage: m.stage, home: m.home, away: m.away, hg: m.hg, ag: m.ag, res, x, ratio: Math.exp(Math.abs(x)), richHome, richRes, valueHome: vh, valueAway: va });
    }
  }
  return out;
}

export function valueModelProbs(m, x) {
  const z = m.b * x;
  const pA = sig(m.c1 - z), pHD = sig(m.c2 - z);
  return [1 - pHD, pHD - pA, pA];
}

/** Maximum likelihood med gradientsteg. useValue: false = bara hemmafördel (b = 0). */
export function fitValueModel(rows, { useValue = true, iters = 3000, lr = 0.5 } = {}) {
  let m = { c1: -0.6, c2: 0.5, b: 0 };
  const n = rows.length;
  if (!n) return { ...m, n };
  const nll = (q) => rows.reduce((s, r) => s - Math.log(Math.max(1e-12, valueModelProbs(q, r.x)['HDA'.indexOf(r.res)])), 0) / n;
  const keys = useValue ? ['c1', 'c2', 'b'] : ['c1', 'c2'];
  let cur = nll(m);
  for (let i = 0; i < iters; i++) {
    const g = {};
    for (const k of keys) { const e = 1e-5; g[k] = (nll({ ...m, [k]: m[k] + e }) - cur) / e; }
    let step = lr, next, val;
    do {
      next = { ...m };
      for (const k of keys) next[k] -= step * g[k];
      if (next.c2 <= next.c1) next.c2 = next.c1 + 1e-3;
      val = nll(next);
      step /= 2;
    } while (val > cur && step > 1e-8);
    if (cur - val < 1e-10) break;
    m = next; cur = val;
  }
  return { ...m, n, nll: cur };
}

/**
 * Kopplar OddsPortal-odds (data/open/cup-odds-history.json) till raderna: samma cup och säsong, datum ±1 dag,
 * samma resultat och bäst namnlikhet för båda lagen (minst 0,25 var). Lägger till r.market = [p1, pX, p2] utan marginal.
 * nameScore = (a, b) -> 0..1 (match-context.mjs).
 */
export function joinMarket(rows, oddsDoc, nameScore) {
  const day = (d) => Date.parse(`${d}T00:00:00Z`) / 86400e3;
  const bySeason = new Map(Object.values(oddsDoc?.seasons ?? {}).map((s) => [`${s.league}|${s.season}`, s.matches]));
  let n = 0;
  for (const r of rows) {
    const cands = (bySeason.get(`${r.league}|${r.season}`) ?? [])
      .filter((m) => m.odds && m.hg === r.hg && m.ag === r.ag && Math.abs(day(m.date) - day(r.date)) <= 1);
    let best = null;
    for (const m of cands) {
      const sh = nameScore(r.home, m.home), sa = nameScore(r.away, m.away);
      if (Math.min(sh, sa) < 0.25) continue;
      if (!best || sh + sa > best.s) best = { s: sh + sa, m };
    }
    if (!best) continue;
    const inv = best.m.odds.map((o) => 1 / o);
    const z = inv[0] + inv[1] + inv[2];
    r.market = inv.map((v) => v / z);
    r.odds = best.m.odds;
    n++;
  }
  return n;
}

/** Marknaden justerad med truppvärdet: p' ∝ p · exp(k·x·[1, 0, −1]). */
export function blendMarket(p, x, k) {
  const q = [p[0] * Math.exp(k * x), p[1], p[2] * Math.exp(-k * x)];
  const z = q[0] + q[1] + q[2];
  return q.map((v) => v / z);
}
