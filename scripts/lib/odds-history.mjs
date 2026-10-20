// Oddshistoriken (data/open/odds-history.json) nycklas datum|liga|hemma|borta. Oddskallor stavar ibland lag med
// versaler (OddsPortal: "ARARAT-ARMENIA") eller kortare/langre namn ("Inter" / "Internazionale"). Windows PowerShell
// (Update-TipsLedger.ps1) laser JSON skiftlagesokansligt och kraschar pa versalpar, och matchen far dessutom tva historiker.

// Sla ihop posterna i keys till en: nyckel och match-namn fran posten med senast last.at, first fran den med
// tidigast first.at, snapshots summeras.
function combine(matches, keys) {
  const es = keys.map((k) => ({ k, e: matches[k] }));
  const newest = es.reduce((a, b) => ((b.e.last?.at ?? '') > (a.e.last?.at ?? '') ? b : a));
  const oldest = es.reduce((a, b) => ((b.e.first?.at ?? '￿') < (a.e.first?.at ?? '￿') ? b : a));
  const out = { ...newest.e, first: oldest.e.first, snapshots: es.reduce((s, x) => s + (x.e.snapshots ?? 0), 0) };
  for (const x of es) delete matches[x.k];
  matches[newest.k] = out;
  return keys.length - 1;
}

/** Sla ihop poster vars nycklar bara skiljer i stora/sma bokstaver. Returnerar antal sammanslagna poster. */
export function mergeCaseDuplicates(matches) {
  const groups = new Map();
  for (const k of Object.keys(matches)) {
    const u = k.toUpperCase();
    (groups.get(u) ?? groups.set(u, []).get(u)).push(k);
  }
  let merged = 0;
  for (const keys of groups.values()) if (keys.length > 1) merged += combine(matches, keys);
  return merged;
}

/**
 * Sla ihop poster for samma match (samma datum och liga) dar bade hemma- och bortanamnet ar varianter av varandra
 * enligt same(a, b). Ett lag spelar en match per dag, sa sadana poster ar samma match. distinct(liga, a, b) = true nar
 * a och b ar tva olika lag i ligans historik (EK 2018: "Wisla - Zaglebie" och "Wisla Plock - Zaglebie Sosnowiec" samma dag).
 */
export function mergeNameVariants(matches, same, distinct = () => false) {
  const byDay = new Map();
  for (const k of Object.keys(matches)) {
    const [date, league, home, away] = k.split('|');
    const g = `${date}|${league}`;
    (byDay.get(g) ?? byDay.set(g, []).get(g)).push({ k, league, home, away });
  }
  let merged = 0;
  for (const list of byDay.values()) {
    const used = new Set();
    for (let i = 0; i < list.length; i++) {
      if (used.has(i)) continue;
      const grp = [list[i].k];
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (used.has(j) || !same(a.home, b.home) || !same(a.away, b.away)) continue;
        if ((a.home !== b.home && distinct(a.league, a.home, b.home)) || (a.away !== b.away && distinct(a.league, a.away, b.away))) continue;
        grp.push(b.k);
        used.add(j);
      }
      if (grp.length > 1) merged += combine(matches, grp);
    }
  }
  return merged;
}

// Oddsrorelse fore avspark (anvandaren 2026-10-20: "oddsforandringar ar viktiga att se tatt inpa nar nagot sticker ut").
// Matt i marginalfri chans, inte i bolagets pris - bolagen rattar sina odds efter marknaden.
// Tidsserie per match (entry.points): en punkt per hamtning och kalla, api = The Odds API (Pinnacle-facit),
// op = OddsPortal (snitt av bolagen). Rorelsen mats inom samma kalla - kallorna har olika marginal och facit.
export const ODDS_MOVE_FLAG_PP = 4; // total rorelse sedan forsta noteringen
export const ODDS_STEP_FLAG_PP = 3; // senaste steget (t.ex. 08:00 -> 1 h fore avspark)
export const ODDS_POINTS_MAX = 30;
const MOVE_KEYS = ['home', 'draw', 'away', 'over25', 'under25'];

/** Lagg till en punkt { at, src, odds, fair } om kallan inte redan har en punkt fran samma hamtning. true = ny punkt. */
export function addOddsPoint(entry, point, max = ODDS_POINTS_MAX) {
  if (!point?.at || !point.src || !point.fair) return false;
  const pts = (entry.points ??= []);
  if (pts.some((x) => x.src === point.src && x.at === point.at)) return false;
  pts.push(point);
  pts.sort((a, b) => (a.at < b.at ? -1 : 1));
  // Forsta noteringen per kalla sparas alltid (rorelsen mats fran den), sedan de senaste
  while (pts.length > max) {
    const firsts = new Set(['api', 'op'].map((src) => pts.find((x) => x.src === src)));
    pts.splice(pts.findIndex((x) => !firsts.has(x)), 1);
  }
  return true;
}

const ppOf = (a, b, k) => Math.round((b.fair[k] - a.fair[k]) * 1000) / 10;

/**
 * Rorelse fran forsta till senaste notering: varje utfall odds fran/till, chansens forandring i procentenheter
 * (+ = marknaden tror mer pa utfallet) och senaste steget. flagged = utfall med total rorelse >= flagPp eller
 * senaste steg >= stepPp. Serien (series) ar kallans noteringar for /tips. null utan tva noteringar fran samma kalla.
 * Utan tidsserie (aldre poster): forsta mot senaste snapshot.
 */
export function oddsMovement(entry, flagPp = ODDS_MOVE_FLAG_PP, stepPp = ODDS_STEP_FLAG_PP) {
  if (!entry) return null;
  let pts = null;
  let src = null;
  const bySrc = {};
  for (const p of entry.points ?? []) if (p.fair) (bySrc[p.src] ??= []).push(p);
  // Kallan med senaste noteringen bland dem med minst tva
  for (const [s, list] of Object.entries(bySrc)) {
    if (list.length >= 2 && (!pts || list.at(-1).at > pts.at(-1).at)) { pts = list; src = s; }
  }
  if (!pts) {
    const f = entry.first, l = entry.last;
    // Olika facit (snitt av bolag mot Pinnacle) ger skenrorelse - bara samma facit jamfors
    if (!f?.fair || !l?.fair || (f.oddsAt ?? f.at) === (l.oddsAt ?? l.at) || f.fairSource !== l.fairSource) return null;
    pts = [{ ...f, at: f.oddsAt ?? f.at }, { ...l, at: l.oddsAt ?? l.at }];
    src = 'api';
  }
  const first = pts[0], prev = pts.at(-2), last = pts.at(-1);
  const moves = {};
  for (const k of MOVE_KEYS) {
    if (!(first.fair[k] > 0) || !(last.fair[k] > 0)) continue;
    moves[k] = { from: first.odds?.[k] ?? null, to: last.odds?.[k] ?? null, pp: ppOf(first, last, k) };
    if (pts.length > 2 && prev.fair[k] > 0) moves[k].step = ppOf(prev, last, k);
  }
  if (!Object.keys(moves).length) return null;
  return {
    src, firstAt: first.at, lastAt: last.at, moves,
    flagged: Object.keys(moves).filter((k) => Math.abs(moves[k].pp) >= flagPp || Math.abs(moves[k].step ?? 0) >= stepPp),
    series: pts.slice(-6).map((p) => ({ at: p.at, home: p.odds?.home ?? null, draw: p.odds?.draw ?? null, away: p.odds?.away ?? null })),
  };
}

/** Timmar sedan oddsen hamtades, eller null utan tidsstampel. */
export function oddsAgeHours(oddsAt, now = Date.now()) {
  const t = Date.parse(oddsAt ?? '');
  return Number.isFinite(t) ? Math.round(((now - t) / 36e5) * 10) / 10 : null;
}

/** Gamla odds infor match: avspark inom withinH timmar och oddsen aldre an maxAgeH. */
export function isStaleOdds(oddsAt, kickoffUtc, now = Date.now(), { maxAgeH = 6, withinH = 24 } = {}) {
  const age = oddsAgeHours(oddsAt, now);
  const toKick = (Date.parse(kickoffUtc ?? '') - now) / 36e5;
  return age != null && Number.isFinite(toKick) && toKick > 0 && toKick <= withinH && age > maxAgeH;
}
