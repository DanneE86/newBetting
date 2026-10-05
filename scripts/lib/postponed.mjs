/**
 * Uppskjutna matcher: en match som skjuts upp utan nytt datum ska inte försvinna tyst ur listan.
 * Den ligger kvar i upcoming-fixtures med postponed: true (originaldatum) tills källan ger ett nytt
 * datum eller den är äldre än POSTPONE_LOOKBACK_DAYS. Sidan visar "Uppskjuten – nytt datum saknas".
 * Exempel: Sabadell–Andorra 3 okt 2026 sköts upp (skyfall) och spelades 4 okt 21:00.
 */

export const POSTPONE_LOOKBACK_DAYS = 7;
// Inte startad så här långt efter avspark = uppskjuten (källan hinner inte alltid sätta status)
export const POSTPONE_GRACE_HOURS = 4;

const POSTPONED_RE = /postpon|suspend|aplaz|uppskj|^pp$/i;

/**
 * 'postponed' | 'cancelled' | null för en match från ESPN eller FotMob.
 * ev: { completed, started, statusName, cancelled, reason, kickoffUtc }
 */
export function postponedState(ev, now = new Date()) {
  if (!ev || ev.completed) return null;
  const marked = POSTPONED_RE.test(String(ev.statusName || '')) || POSTPONED_RE.test(String(ev.reason || ''));
  if (marked) return 'postponed';
  if (ev.cancelled) return 'cancelled';
  if (ev.started) return null;
  const kick = new Date(ev.kickoffUtc || '').getTime();
  if (Number.isNaN(kick)) return null;
  return kick + POSTPONE_GRACE_HOURS * 3_600_000 < now.getTime() ? 'postponed' : null;
}

/** Ligger avsparken inom fönstret där en uppskjuten match fortfarande visas? */
export function withinLookback(kickoffUtc, now = new Date()) {
  const kick = new Date(kickoffUtc || '').getTime();
  return !Number.isNaN(kick) && kick >= now.getTime() - POSTPONE_LOOKBACK_DAYS * 86_400_000;
}

const pairKey = (f) => `${f.league}|${f.homeId ?? f.home}|${f.awayId ?? f.away}`;

/**
 * Lägger till uppskjutna matcher (postponed: true) som inte redan har ett nytt datum bland fixtures.
 * Samma lag hemma/borta i samma liga eller samma ESPN-/FotMob-id = matchen är omlagd -> den nya raden gäller.
 */
export function mergePostponed(fixtures, postponed) {
  const live = (fixtures || []).filter((f) => !f.postponed);
  const pairs = new Set(live.map(pairKey));
  const ids = new Set(live.flatMap((f) => [f.espnEventId, f.fotmobMatchId].filter(Boolean).map(String)));
  const out = [...(fixtures || [])];
  const seen = new Set();
  for (const p of postponed || []) {
    const k = pairKey(p);
    const id = p.espnEventId ?? p.fotmobMatchId;
    if (pairs.has(k) || (id != null && ids.has(String(id))) || seen.has(k)) continue;
    seen.add(k);
    out.push({ ...p, postponed: true });
  }
  return out;
}
