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
// Matt i marginalfri chans (skarpt facit), inte i bolagets pris - bolagen rattar sina odds efter Pinnacle.
export const ODDS_MOVE_FLAG_PP = 4;
const MOVE_KEYS = ['home', 'draw', 'away', 'over25', 'under25'];

/**
 * Rorelse fran forsta till senaste snapshot i oddshistoriken. Varje utfall: odds fran/till och chansens
 * forandring i procentenheter (+ = marknaden tror mer pa utfallet). flagged = utfall som flyttat minst flagPp.
 * null nar det bara finns en notering eller inget facit.
 */
export function oddsMovement(entry, flagPp = ODDS_MOVE_FLAG_PP) {
  const f = entry?.first, l = entry?.last;
  if (!f?.fair || !l?.fair || (f.oddsAt ?? f.at) === (l.oddsAt ?? l.at)) return null;
  const moves = {};
  for (const k of MOVE_KEYS) {
    if (!(f.fair[k] > 0) || !(l.fair[k] > 0)) continue;
    moves[k] = { from: f.odds?.[k] ?? null, to: l.odds?.[k] ?? null, pp: Math.round((l.fair[k] - f.fair[k]) * 1000) / 10 };
  }
  if (!Object.keys(moves).length) return null;
  return {
    firstAt: f.oddsAt ?? f.at, lastAt: l.oddsAt ?? l.at, moves,
    flagged: Object.keys(moves).filter((k) => Math.abs(moves[k].pp) >= flagPp),
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
