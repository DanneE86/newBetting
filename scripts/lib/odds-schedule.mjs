// Oddsschema (anvandaren 2026-10-20): bara matcher inom 24 h. Alla ligor hamtas en gang per dag (fran 08:00 svensk tid,
// forsta korningen efter 08 om molnet ar sent), europeiska ligor och UEFA-cuperna dessutom 55 min fore avspark
// nar startelvan ar slappt (anvandaren 2026-10-20: "var saker pa att startelvan ar slappt").
// Rena funktioner - scripts/odds-schema.mjs gor hamtningen, .github/workflows/odds-schema.yml kor den var 10:e minut.

export const EUROPE_COUNTRIES = new Set([
  'England', 'Scotland', 'Wales', 'Spain', 'Italy', 'Germany', 'France', 'Netherlands', 'Belgium', 'Portugal', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Poland', 'Greece', 'Croatia', 'Czechia', 'Austria', 'Switzerland', 'Turkey', 'Ukraine',
]);
export const EUROPE_CUPS = new Set(['CL', 'EL', 'ECL']);
export const DAILY_HOUR = 8;
export const HORIZON_H = 24;
// Fonstret borjar 55 min fore avspark (elvorna slapps normalt 60-75 min fore). Ar elvan inte officiell an vantar
// hamtningen till nasta korning (cron var 10:e minut), men senast PREKICK_FALLBACK_MIN fore avspark hamtas oddsen anda.
export const PREKICK_WINDOW_MIN = 55;
export const PREKICK_FALLBACK_MIN = 20;

export const isEuropeLeague = (code, cfg) => (cfg?.cup ? EUROPE_CUPS.has(code) : EUROPE_COUNTRIES.has(cfg?.country));

/** Datum och timme i Stockholm (sommartid/vintertid via Intl). */
export function stockholmClock(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(now)).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

/**
 * Vad ska hamtas nu? matches: [{ key, league, kickoffUtc }], state: { dailyDate, prekick: { key: at } }.
 * daily = dagens hamtning ar inte gjord och klockan ar minst 08 -> alla ligor med match inom 24 h.
 * prekick = europeiska matcher 0-55 min fran avspark som inte har hamtats fore avspark an (elvan kollas i splitByLineup).
 */
export function planOdds({ matches, state = {}, leagues = {}, now = Date.now() }) {
  const t = new Date(now).getTime();
  const soon = matches.filter((m) => {
    const k = Date.parse(m.kickoffUtc ?? '');
    return Number.isFinite(k) && k > t && k <= t + HORIZON_H * 36e5;
  });
  const clock = stockholmClock(t);
  const daily = clock.hour >= DAILY_HOUR && state.dailyDate !== clock.date;
  const prekick = soon.filter((m) => {
    const min = (Date.parse(m.kickoffUtc) - t) / 6e4;
    return min <= PREKICK_WINDOW_MIN && isEuropeLeague(m.league, leagues[m.league]) && !state.prekick?.[m.key];
  });
  const uniq = (xs) => [...new Set(xs)].sort();
  const dailyLeagues = daily ? uniq(soon.map((m) => m.league)) : [];
  const prekickLeagues = uniq(prekick.map((m) => m.league));
  return {
    date: clock.date, daily, dailyLeagues, prekick, prekickLeagues, prekickKeys: prekick.map((m) => m.key),
    leagues: uniq([...dailyLeagues, ...prekickLeagues]),
  };
}

/**
 * Krediter for The Odds API i denna korning (2 per liga). Kvoten (gratis 500/manad) fordelas jamnt over resten av
 * manaden fran dagens startsaldo; halften till 08-hamtningen, resten till hamtningarna fore avspark.
 */
export function apiBudget({ startLeft, leftNow, now = Date.now(), daily }) {
  if (!(startLeft > 0) || !(leftNow > 0)) return 0;
  const d = new Date(now);
  const daysLeft = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() - d.getUTCDate() + 1;
  const perDay = Math.floor(startLeft / daysLeft);
  const remaining = Math.min(leftNow, perDay - Math.max(0, startLeft - leftNow));
  const credits = daily ? Math.min(remaining, Math.floor(perDay / 2)) : remaining;
  return Math.max(0, credits - (credits % 2));
}

/** Uppdaterat tillstand efter en lyckad korning: dagens hamtning, gjorda fore-avspark-hamtningar (rensas efter 2 dygn). */
export function nextState(state = {}, plan, { now = Date.now(), leftNow = null } = {}) {
  const at = new Date(now).toISOString();
  const keep = new Date(now - 2 * 86400e3).toISOString();
  const prekick = Object.fromEntries(Object.entries(state.prekick ?? {}).filter(([, v]) => v > keep));
  for (const k of plan.prekickKeys) prekick[k] = at;
  const credits = state.credits?.date === plan.date ? state.credits : { date: plan.date, startLeft: leftNow };
  return { ...state, dailyDate: plan.daily ? plan.date : state.dailyDate ?? null, prekick, credits, lastRun: at };
}

/**
 * Fore-avspark-matcherna delade pa startelvan: ready = officiell elva (eller senast PREKICK_FALLBACK_MIN fore avspark,
 * da hamtas oddsen utan elva), wait = elvan inte slappt an -> nasta korning. lineups: Map(nyckel -> { confirmed }) med
 * nyckeln datum|liga|hemma|borta som i tipsen.
 */
export function splitByLineup(matches, lineups, now = Date.now()) {
  const ready = [];
  const wait = [];
  for (const m of matches) {
    const min = (Date.parse(m.kickoffUtc) - now) / 6e4;
    const confirmed = !!lineups.get(m.key)?.confirmed;
    if (confirmed || min <= PREKICK_FALLBACK_MIN) ready.push({ ...m, lineupConfirmed: confirmed });
    else wait.push(m);
  }
  return { ready, wait };
}

/** data/startelvor.json -> Map(datum|liga|hemma|borta -> { confirmed }). Startelvornas nycklar ar liga|datum|hemma|borta. */
export function lineupsByKey(store) {
  const out = new Map();
  for (const m of store?.matches ?? []) {
    for (const k of m.keys ?? []) {
      const [league, date, home, away] = k.split('|');
      out.set(`${date}|${league}|${home}|${away}`, { confirmed: !!m.lineup?.confirmed });
    }
  }
  return out;
}
