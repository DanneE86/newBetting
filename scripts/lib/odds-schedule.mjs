// Oddsschema (anvandaren 2026-10-20): bara matcher inom 24 h. Alla ligor hamtas en gang per dag (fran 08:00 svensk tid,
// forsta korningen efter 08 om molnet ar sent), europeiska ligor och UEFA-cuperna dessutom 1 h fore avspark.
// Rena funktioner - scripts/odds-schema.mjs gor hamtningen, .github/workflows/odds-schema.yml kor den var 10:e minut.

export const EUROPE_COUNTRIES = new Set([
  'England', 'Scotland', 'Wales', 'Spain', 'Italy', 'Germany', 'France', 'Netherlands', 'Belgium', 'Portugal', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Poland', 'Greece', 'Croatia', 'Czechia', 'Austria', 'Switzerland', 'Turkey', 'Ukraine',
]);
export const EUROPE_CUPS = new Set(['CL', 'EL', 'ECL']);
export const DAILY_HOUR = 8;
export const HORIZON_H = 24;
// Cron var 10:e minut kan bli sen i GitHub Actions: fonstret borjar 75 min fore avspark sa en korning hamnar nara 1 h
export const PREKICK_WINDOW_MIN = 75;

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
 * prekick = europeiska matcher 0-75 min fran avspark som inte har hamtats fore avspark an.
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
    date: clock.date, daily, dailyLeagues, prekickLeagues, prekickKeys: prekick.map((m) => m.key),
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
