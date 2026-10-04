// Övergångsanalys: liga A -> liga B och hur det gick. Rådata från scripts/fetch-player-careers-fotmob.mjs
// (data/spelare/_karriar.json). Används av scripts/lardomar-overgangar.mjs.

const num = (x) => (x == null || x === '' || !Number.isFinite(Number(x)) ? null : Number(x));

/** FotMobs seasonEntries -> [[säsong, lagId, lag, övergång, [[ligaId, liga, matcher, mål, assist, betyg], ...]], ...] */
export function careerSeasons(entries) {
  return (entries ?? []).map((e) => [e.seasonName ?? null, e.teamId ?? null, e.team ?? null, e.transferType?.text ?? null,
    (e.tournamentStats ?? []).filter((t) => !t.isFriendly)
      .map((t) => [t.leagueId ?? null, t.leagueName ?? null, num(t.appearances), num(t.goals), num(t.assists), num(t.rating?.rating)])]);
}

/** Säsongens slutår: "2025/2026" -> 2026, "2025" -> 2025. */
export const seasonEnd = (s) => { const m = String(s ?? '').match(/(\d{4})(?:\/(\d{2,4}))?/); return m ? Number(m[2] ? (m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : m[1]) : null; };

/**
 * Spelarens ligasäsong per klubb: den liga där spelaren hade flest matcher den säsongen (cuper och Europa räknas
 * inte som liga om en serie finns). LEAGUE_IDS = mängd ligaId som är serier (annars: flest matcher).
 */
// Cuper, Europa- och kontinentalturneringar, kval och landslag räknas inte som liga
export const CUP_RE = /cup|copa|coppa|coupe|pokal|ta[cç]a|beker|trophy|champions league|champions cup|europa|conference|libertadores|sudamericana|concacaf|leagues cup|super ?cup|supercopa|supercoppa|qualif|play-?off|friendl|club world|nations league|world cup|euro\b|olympic|asian games|afc |caf |shield|charity|community|knockout|u-?1\d|u-?2[0-3]|youth|reserve|premier league 2|primavera|paulista|carioca|mineiro|ga[uú]cho|baiano|pernambucano|cearense|paranaense|goiano|catarinense|capixaba|paraense|potiguar|alagoano|sergipano|maranhense|amazonense|brasiliense|state league/i;
export const isLeagueName = (n) => !!n && !CUP_RE.test(n);

export function leagueStint(season, leagueIds = null) {
  const [name, teamId, team, transfer, list] = season;
  const cands = list.filter((t) => t[2] > 0 && (leagueIds ? leagueIds.has(t[0]) : isLeagueName(t[1])));
  const best = cands.sort((a, b) => b[2] - a[2])[0];
  if (!best) return null;
  return { season: name, end: seasonEnd(name), teamId, team, transfer, leagueId: best[0], league: best[1], apps: best[2], goals: best[3], assists: best[4], rating: best[5] };
}

/**
 * Ligabyten ur karriären: två på varandra följande klubbsäsonger (nyast först i FotMob) där ligan skiljer sig.
 * Lån tillbaka räknas inte. Bara byten där säsongen i nya ligan slutar >= minEnd.
 */
export function leagueMoves(seasons, { leagueIds = null, minEnd = 2024 } = {}) {
  const stints = seasons.map((s) => leagueStint(s, leagueIds)).filter(Boolean);
  const moves = [];
  for (let i = 0; i < stints.length - 1; i++) {
    const to = stints[i], from = stints[i + 1];
    if (to.teamId === from.teamId || to.leagueId === from.leagueId) continue;
    if (/back from loan/i.test(to.transfer ?? '')) continue;
    if ((to.end ?? 0) < minEnd) continue;
    // Säsongen efter i nya ligan (andra året), om spelaren stannade i samma liga
    const next = i > 0 && stints[i - 1].leagueId === to.leagueId ? stints[i - 1] : null;
    // Säsongen innan i gamla ligan (två säsonger ger ett stabilare betyg)
    const prev = stints[i + 2]?.leagueId === from.leagueId ? stints[i + 2] : null;
    moves.push({ from, to, next, prev, loan: /loan/i.test(to.transfer ?? ''), latest: i === 0 });
  }
  return moves;
}

/** Median. */
export function median(xs) {
  const v = xs.filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

/**
 * Ligornas nivå ur själva bytena: snittbetyg i en liga påverkas av hur bra ligan är, så samma spelare får lägre
 * betyg i en starkare liga. Minsta kvadrat på (betyg B - betyg A) = nivå A - nivå B (ridge mot 0, en liga = 0).
 * moves: [{ a, b, d }] där d = betyg i B minus betyg i A. Returnerar Map ligaId -> nivå (högre = starkare).
 */
export function fitLeagueLevels(moves, { iters = 400, ridge = 2, lr = 0.05 } = {}) {
  const lv = new Map();
  for (const m of moves) { lv.set(m.a, 0); lv.set(m.b, 0); }
  const cnt = new Map();
  for (const m of moves) { cnt.set(m.a, (cnt.get(m.a) ?? 0) + 1); cnt.set(m.b, (cnt.get(m.b) ?? 0) + 1); }
  for (let it = 0; it < iters; it++) {
    const g = new Map([...lv.keys()].map((k) => [k, 0]));
    for (const m of moves) {
      const err = (lv.get(m.a) - lv.get(m.b)) - m.d;
      g.set(m.a, g.get(m.a) + err);
      g.set(m.b, g.get(m.b) - err);
    }
    for (const [k, v] of lv) lv.set(k, v - lr * (g.get(k) + ridge * v) / (cnt.get(k) + ridge));
  }
  return lv;
}

/** Logistisk regression (gradient), x = [[...], ...], y = [0/1]. Standardiserar själv. Returnerar { predict, w, mu, sd }. */
export function logistic(x, y, { iters = 2000, lr = 0.1, l2 = 0.01 } = {}) {
  const k = x[0].length;
  const mu = Array.from({ length: k }, (_, j) => x.reduce((a, r) => a + r[j], 0) / x.length);
  const sd = Array.from({ length: k }, (_, j) => Math.sqrt(x.reduce((a, r) => a + (r[j] - mu[j]) ** 2, 0) / x.length) || 1);
  const z = x.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const w = new Array(k + 1).fill(0);
  const sig = (t) => 1 / (1 + Math.exp(-t));
  for (let it = 0; it < iters; it++) {
    const g = new Array(k + 1).fill(0);
    for (let i = 0; i < z.length; i++) {
      const p = sig(w[0] + z[i].reduce((a, v, j) => a + v * w[j + 1], 0));
      const e = p - y[i];
      g[0] += e;
      for (let j = 0; j < k; j++) g[j + 1] += e * z[i][j];
    }
    for (let j = 0; j <= k; j++) w[j] -= lr * (g[j] / z.length + (j ? l2 * w[j] : 0));
  }
  const predict = (r) => sig(w[0] + r.reduce((a, v, j) => a + ((v - mu[j]) / sd[j]) * w[j + 1], 0));
  return { predict, w, mu, sd };
}

/** AUC (hur väl en sannolikhet skiljer lyckade från misslyckade; 0,5 = slump, 1 = perfekt). */
export function auc(p, y) {
  const pos = [], neg = [];
  p.forEach((v, i) => (y[i] ? pos : neg).push(v));
  if (!pos.length || !neg.length) return null;
  let s = 0;
  for (const a of pos) for (const b of neg) s += a > b ? 1 : a === b ? 0.5 : 0;
  return s / (pos.length * neg.length);
}

/**
 * Ligasäsongernas nyckeltal: flest matcher (≈ antal omgångar) och medianbetyg (spelare med minst 10 matcher).
 * players = karriärerna; extra = [{ id, leagueId, season, apps, rating }] från hela trupperna (data/spelare), så att
 * medianen inte bara bygger på spelare som bytt klubb. Samma spelare räknas en gång per ligasäsong.
 */
export function leagueSeasonStats(players, extra = []) {
  const acc = new Map(), seen = new Set();
  const add = (id, leagueId, season, apps, rating) => {
    const k = `${leagueId}|${season}`;
    if (id != null) { if (seen.has(`${id}|${k}`)) return; seen.add(`${id}|${k}`); }
    if (!acc.has(k)) acc.set(k, { maxApps: 0, ratings: [] });
    const a = acc.get(k);
    a.maxApps = Math.max(a.maxApps, apps ?? 0);
    if (rating && apps >= 10) a.ratings.push(rating);
  };
  for (const p of players) for (const s of p.seasons ?? []) {
    const st = leagueStint(s);
    if (st) add(p.id ?? null, st.leagueId, st.season, st.apps, st.rating);
  }
  for (const e of extra) if (e.leagueId != null && e.season) add(e.id ?? null, e.leagueId, e.season, e.apps, e.rating);
  const out = new Map();
  for (const [k, a] of acc) out.set(k, { rounds: a.maxApps, median: a.ratings.length >= 8 ? median(a.ratings) : null, n: a.ratings.length });
  return out;
}

/** Lagsäsongernas spelarbetyg (minst 5 matcher): Map "lagId|säsong" -> [[spelarId, betyg], ...]. */
export function teamSeasonStats(players) {
  const out = new Map();
  for (const p of players) for (const s of p.seasons ?? []) {
    const st = leagueStint(s);
    if (!st || !st.rating || st.apps < 5) continue;
    const k = `${st.teamId}|${st.season}`;
    if (!out.has(k)) out.set(k, []);
    out.get(k).push([p.id, st.rating]);
  }
  return out;
}

/** Lagkamraternas medianbetyg (spelaren själv borträknad), minst 5 lagkamrater. */
export function teamMedian(ts, teamId, season, playerId) {
  const list = (ts.get(`${teamId}|${season}`) ?? []).filter(([id]) => id !== playerId).map(([, r]) => r);
  return list.length >= 5 ? median(list) : null;
}

/** Alla ligabyten med andel speltid, ligans medianbetyg och lagets styrka (lagkamraternas median mot ligans). */
export function buildMoves(players, ls, { minEnd = 2024, ts = null } = {}) {
  const out = [];
  for (const p of players) for (const m of leagueMoves(p.seasons ?? [], { minEnd })) {
    for (const side of ['from', 'to', 'next', 'prev']) {
      const st = m[side];
      if (!st) continue;
      const x = ls.get(`${st.leagueId}|${st.season}`) ?? {};
      st.roundsMax = x.rounds ?? null;
      st.median = x.median ?? null;
      st.share = x.rounds ? Math.min(1, st.apps / x.rounds) : null;
      const tm = ts ? teamMedian(ts, st.teamId, st.season, p.id) : null;
      st.teamRel = tm != null && st.median != null ? tm - st.median : null;
    }
    out.push({ id: p.id, name: p.name, born: p.born ?? null, pos: p.pos ?? null, value: p.valueAt?.(m.to.season) ?? null, ...m });
  }
  return out;
}

/** Lyckad i nya ligan: ordinarie (≥ hälften av omgångarna) och betyg ≥ ligans median. null = går inte att avgöra. */
export function isSuccess(st) {
  if (!st || st.share == null || st.median == null) return null;
  if (st.share < 0.5) return false;
  if (st.rating == null) return null;
  return st.rating >= st.median;
}

export const FEATURE_NAMES = ['förväntat betyg i nya ligan mot median', 'betyg mot median i gamla ligan', 'nivåskillnad', 'speltid i gamla ligan',
  'ålder', 'ålder²', 'lån', 'mål+assist per match', 'målvakt', 'anfallare/ytter',
  'gamla lagets styrka', 'nya lagets styrka', 'två säsonger: betyg mot median', 'marknadsvärde (log)', 'marknadsvärde saknas'];

/** Säsongens startår (2025/2026 -> 2025). */
const startYear = (s) => { const m = String(s ?? '').match(/(\d{4})/); return m ? Number(m[1]) : null; };

/** Prediktorer för ett byte (x = null om betyg eller median saknas i gamla ligan). */
export function features(m, levels) {
  const lvA = levels.get(m.from.leagueId), lvB = levels.get(m.to.leagueId);
  const born = m.born ? Number(m.born.slice(0, 4)) + (Number(m.born.slice(5, 7)) - 1) / 12 : null;
  const sy = startYear(m.to.season);
  const age = born && sy ? sy + (String(m.to.season).includes('/') ? 0.6 : 0.1) - born : null;
  const gap = lvA != null && lvB != null ? lvB - lvA : null;
  const relA = m.from.rating && m.from.median ? m.from.rating - m.from.median : null;
  const expRel = relA != null && gap != null && m.to.median != null && m.from.median != null
    ? (m.from.rating - gap) - m.to.median : null;
  const success = isSuccess(m.to);
  const ok = relA != null && expRel != null && age != null && m.from.share != null && success != null;
  const ga = m.from.apps ? ((m.from.goals ?? 0) + (m.from.assists ?? 0)) / m.from.apps : 0;
  // Två säsonger i gamla ligan, viktat med matcher; lagets styrka 0 (ligasnitt) när den saknas
  const relPrev = m.prev?.rating && m.prev?.median ? m.prev.rating - m.prev.median : null;
  const rel2 = relA != null && relPrev != null ? (relA * m.from.apps + relPrev * m.prev.apps) / (m.from.apps + m.prev.apps) : relA;
  const logValue = m.value > 0 ? Math.log10(m.value) : null;
  const x = ok ? [expRel, relA, gap, m.from.share, age, (age - 25) ** 2, m.loan ? 1 : 0, ga, m.pos === 'malvakt' ? 1 : 0, /anfallare|ytter$/.test(m.pos ?? '') ? 1 : 0,
    m.from.teamRel ?? 0, m.to.teamRel ?? 0, rel2, logValue ?? 6, logValue == null ? 1 : 0] : null;
  return { age, gap, relA, rel2, expRel, success, logValue, x };
}
