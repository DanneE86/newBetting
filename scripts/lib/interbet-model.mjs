// Interbets 9-faktorsmodell (approximation) för ATG-data.
// Formel: p ∝ q^0.85 × exp(Σ w_k · z_k) — samma marknadsbas som trav-model.mjs men med Interbets 9 faktorer.
//   nyTid       (Ny tid,     w=60)  Senaste km-tid, negerad
//   plats       (Plats,      w=30)  Viktat placeringspoäng, nyast väger mest
//   ntft        (NTFT,       w=30)  Personbästa km / senaste km (konsistens, 1,0 = toppform)
//   vinst       (Vinst,      w=60)  Segerandel senaste N starter
//   total       (Total,      w=60)  Topp-3-andel senaste N starter
//   alltime     (Alltime,    w=20)  Livslång segerandel
//   kusk        (Kusk,       w= 6)  Kuskens segerandel i år
//   ll          (LL,         w=20)  Personbästa km-tid (livstaksklass), negerad
//   forbattring (Förbättring,w= 8)  Tidstrend: äldre snitt − nyare snitt (pos = förbättring)
//
// addInterbetScores(game, analysis): lägger på .ibP och .ibScore på varje häst i analysis.races[].horses[].
// game = normalizeGame-utdatan (med fullständiga records), analysis = analyzeGame-utdatan.

export const IB_WEIGHTS = { nyTid: 60, plats: 30, ntft: 30, vinst: 60, total: 60, alltime: 20, kusk: 6, ll: 20, forbattring: 8 };
const IB_W_TOTAL = Object.values(IB_WEIGHTS).reduce((a, b) => a + b, 0);
const IB_SCALE = 0.15 / IB_W_TOTAL;
const IB_N = 10;
const PLACE_PTS = { 1: 1.0, 2: 0.7, 3: 0.5, 4: 0.3, 5: 0.2 };
const MARKET_EXP = 0.85;

export function ibFactors(start) {
  const recs   = (start.records || []).filter(r => !r.scratched).slice(0, IB_N);
  const noGall = recs.filter(r => !r.galloped && r.km != null);

  const latestKm = noGall[0]?.km ?? null;
  const allKms   = noGall.map(r => r.km);
  const bestKm   = allKms.length ? Math.min(...allKms) : null;

  let plats = 0, platsW = 0;
  recs.forEach((r, i) => {
    const d = Math.pow(0.85, i);
    const pts = r.galloped ? 0 : (PLACE_PTS[r.place] ?? (r.place != null && r.place <= 8 ? 0.1 : 0));
    plats += pts * d;
    platsW += d;
  });

  const avgR = noGall.slice(0, 3).reduce((a, r) => a + r.km, 0) / (noGall.slice(0, 3).length || Infinity);
  const avgO = noGall.slice(3, 6).reduce((a, r) => a + r.km, 0) / (noGall.slice(3, 6).length || Infinity);

  const dy = start.driverYear;
  return {
    nyTid:       latestKm ? -latestKm : null,
    plats:       platsW > 0 ? plats / platsW : null,
    ntft:        latestKm && bestKm ? bestKm / latestKm : null,
    vinst:       recs.length > 0 ? recs.filter(r => !r.galloped && r.place === 1).length / recs.length : null,
    total:       recs.length > 0 ? recs.filter(r => !r.galloped && r.place != null && r.place <= 3).length / recs.length : null,
    alltime:     start.lifeStarts > 0 ? (start.lifeWins || 0) / start.lifeStarts : null,
    kusk:        dy && dy.starts > 5 ? dy.wins / dy.starts : null,
    ll:          bestKm ? -bestKm : null,
    forbattring: Number.isFinite(avgR) && Number.isFinite(avgO) ? avgO - avgR : null,
  };
}

export function ibZStd(vals) {
  const def = vals.filter(v => v != null);
  if (!def.length) return vals.map(() => 0);
  const mu = def.reduce((a, b) => a + b, 0) / def.length;
  const sd = Math.sqrt(def.reduce((a, b) => a + (b - mu) ** 2, 0) / def.length) || 1;
  return vals.map(v => v != null ? (v - mu) / sd : 0);
}

/**
 * Lägger på ibP (sannolikhet 0–1) och ibScore (linjär z-poäng, icke-normaliserad) på varje häst i analysis.races[].horses[].
 * game = normalizeGame-utdata med fullständiga .records per start.
 * analysis = analyzeGame-utdata.
 */
export function addInterbetScores(game, analysis) {
  for (const aRace of analysis.races) {
    // Matcha mot normaliserat lopp via leg-numret
    const gRace = game.races.find(r => r.leg === aRace.leg);
    if (!gRace) continue;

    const live = gRace.starts.filter(s => !s.scratched);
    if (!live.length) continue;

    const streckSum = gRace.starts.reduce((a, s) => a + (s.streck || 0), 0);
    const q = live.map(s => streckSum > 0 ? (s.streck || 0.002) / streckSum : 1 / live.length);

    const facs = live.map(s => ibFactors(s));
    const keys = Object.keys(IB_WEIGHTS);

    const zV = {};
    for (const k of keys) zV[k] = ibZStd(facs.map(f => f[k]));

    // Linjär poäng (råvärde, högre = bättre)
    const linScores = live.map((_, i) =>
      keys.reduce((sum, k) => sum + IB_WEIGHTS[k] * zV[k][i], 0)
    );

    // p ∝ q^0.85 × exp(Σ w_k · z_k)
    const raw = live.map((_, i) =>
      Math.pow(Math.max(q[i], 1e-6), MARKET_EXP) *
      Math.exp(keys.reduce((sum, k) => sum + IB_WEIGHTS[k] * IB_SCALE * zV[k][i], 0))
    );
    const rawSum = raw.reduce((a, b) => a + b, 0);

    const nrToIb = new Map(live.map((s, i) => [s.nr, {
      ibP: rawSum > 0 ? raw[i] / rawSum : 1 / live.length,
      ibScore: Math.round(linScores[i] * 10) / 10,
    }]));

    for (const h of aRace.horses) {
      const ib = nrToIb.get(h.nr);
      if (ib) {
        h.ibP = Math.round(ib.ibP * 1000) / 1000;
        h.ibScore = ib.ibScore;
      }
    }
  }
  return analysis;
}
