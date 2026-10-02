// Tranare per match fran FotMob (content.lineup.homeTeam.coach / awayTeam.coach). Underlag for att testa om tranare har
// lattare eller svarare mot visst motstand (anvandaren 2026-10-02 kvall: "borja hamta tranare").
// Hamtas av scripts/fetch-coaches-fotmob.mjs till data/open/coach_fotmob.json.

const coachOf = (team) => {
  const c = team?.coach;
  if (!c?.name) return null;
  return { id: c.id ?? null, name: String(c.name).trim() };
};

// Spelad match -> { id, d, lg, h, a, hg, ag, hc, ac } (hc/ac = { id, name } eller null om FotMob saknar tranaren)
export function coachRowFromFotmob(md, fx, league) {
  const sc = String(fx?.status?.scoreStr || '').match(/(\d+)\s*-\s*(\d+)/);
  if (!sc) return null;
  const lineup = md?.content?.lineup || {};
  return {
    id: String(fx.id),
    d: String(fx.status.utcTime).slice(0, 10),
    lg: league,
    h: fx.home?.name,
    a: fx.away?.name,
    hg: Number(sc[1]),
    ag: Number(sc[2]),
    hc: coachOf(lineup.homeTeam),
    ac: coachOf(lineup.awayTeam),
  };
}

// Alla matcher med tranare ur dokumentet (data/open/coach_fotmob.json), aldst forst
export function coachMatches(doc) {
  return Object.values(doc?.leagues || {}).flatMap((l) => Object.values(l.matches || {}))
    .filter((m) => m.hc || m.ac)
    .sort((x, y) => x.d.localeCompare(y.d));
}

// ---------- Ny tranare: laget vinner mindre an oddsen sager de forsta matcherna ----------
// Anvandaren 2026-10-02 kvall ("ga pa det du sager"). Test England PL/CH/EL1/EL2 2022/23 -> (8 528 matcher, stangningsodds,
// bara data fore matchen): lag med ny tranare, matcher 1-5 -> vinst 32 % mot oddsens 35 % (n 2 359, z -2,7, minus i alla fem
// sasonger), kryss 28 % mot 26 %, forlust 40 % mot 39 %. Matcher 6-10 som vanligt. Justering ur lagets perspektiv
// [vinst, kryss, forlust] = -2/+1/+1 procentenheter (ungefar 2/3 av det uppmatta). Bara engelska ligor (dar det ar testat).
export const NEW_COACH = { matches: 5, shift: [-0.02, 0.01, 0.01] };

// Lag (FotMobs namn) -> [{ d, coach }] aldst forst (en rad per ligamatch med kand tranare)
export function buildCoachIndex(rows) {
  const idx = new Map();
  const add = (team, d, c) => {
    if (!team || !c) return;
    if (!idx.has(team)) idx.set(team, []);
    idx.get(team).push({ d, coach: c.id ?? c.name, name: c.name });
  };
  for (const m of rows || []) { add(m.h, m.d, m.hc); add(m.a, m.d, m.ac); }
  for (const list of idx.values()) list.sort((x, y) => x.d.localeCompare(y.d));
  return idx;
}

// Lagets tranare fore `date`: hur manga matcher i rad den senaste tranaren har haft (n) och om det var ett byte
// (en tidigare match med annan tranare finns, korta vikariat raknas inte). isNew = byte och kommande match ar nummer n+1 <= NEW_COACH.matches.
export function coachTenure(index, team, date) {
  const list = (index?.get(team) || []).filter((m) => m.d < date);
  if (!list.length) return null;
  const cur = list[list.length - 1];
  let n = 0, i = list.length - 1;
  for (;;) {
    while (i >= 0 && list[i].coach === cur.coach) { n++; i--; }
    if (i < 0) break;
    // Kort vikariat (hogst 2 matcher med annan tranare, sedan samma tranare igen) ar inget byte - Swindon 2026: Holloway,
    // 1 match Bignot, Holloway igen
    const k = [1, 2].find((g) => i - g >= 0 && list[i - g].coach === cur.coach && list.slice(i - g + 1, i + 1).every((x) => x.coach !== cur.coach));
    if (!k) break;
    i -= k;
  }
  const changed = i >= 0;
  return { team, coach: cur.name, matches: n, changed, isNew: changed && n < NEW_COACH.matches };
}

// [hemma, kryss, borta] med ny tranare-justeringen for hemma- och/eller bortalaget, normerat till 1
export function applyNewCoach(p, home, away) {
  if (!p || (!home?.isNew && !away?.isNew)) return p;
  const [w, d, l] = NEW_COACH.shift;
  const q = p.slice();
  if (home?.isNew) { q[0] += w; q[1] += d; q[2] += l; }
  if (away?.isNew) { q[2] += w; q[1] += d; q[0] += l; }
  const c = q.map((x) => Math.max(0.01, x));
  const s = c.reduce((a, b) => a + b, 0);
  return c.map((x) => x / s);
}

// Analysrad i klartext per lag med ny tranare
export function newCoachNotes(home, away, homeName, awayName) {
  return [[home, homeName], [away, awayName]].filter(([t]) => t?.isNew).map(([t, name]) =>
    `Ny tränare: ${name} spelar match ${t.matches + 1} under ${t.coach}. Lag med ny tränare har vunnit mindre än oddsen sagt de fem första matcherna – ${name} −2 procentenheter, krysset +1.`);
}
