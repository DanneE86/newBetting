/**
 * Nästa omgång per liga (Oddset-fliken): bara kommande omgång visas, inte omgången efter.
 *
 * Fältet "round" är bara ett omgångsnummer i vissa ligor (Matchday 7, Omg 25). I andra är det en
 * säsongs- eller seriemärkning som är lika för alla matcher (2026-allsvenskan, Grundserie, Ligaspel,
 * torneo-clausura). Då säger det inget om omgången, och ligan avgränsas i stället på datum:
 * första kommande speldag + 3 dagar (t.ex. 9–12 okt).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
export const ROUND_WINDOW_DAYS = 3;

/** Ligor där round faktiskt skiljer omgångar åt: minst två olika värden bland kommande matcher. */
function realRoundLeagues(fixtures, today) {
  const values = new Map();
  for (const fx of fixtures || []) {
    if (!fx?.league || !fx?.date || !fx.round) continue;
    const day = new Date(`${fx.date}T00:00:00`);
    if (Number.isNaN(day.getTime()) || day < today) continue;
    if (!values.has(fx.league)) values.set(fx.league, new Set());
    values.get(fx.league).add(String(fx.round));
  }
  return new Set([...values].filter(([, v]) => v.size > 1).map(([lg]) => lg));
}

/** Nästa omgång per liga från upcoming-fixtures (källa till sanning). */
export function nextRoundsFromFixtures(fixtures, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const real = realRoundLeagues(fixtures, today);
  const byLeague = new Map(); // league -> { dateMs, round }
  for (const fx of fixtures || []) {
    if (!fx?.league || !fx?.date) continue;
    const day = new Date(`${fx.date}T00:00:00`);
    if (Number.isNaN(day.getTime()) || day < today) continue;
    const ms = day.getTime();
    const round = real.has(fx.league) ? fx.round || null : null;
    const cur = byLeague.get(fx.league);
    if (!cur || ms < cur.dateMs) {
      byLeague.set(fx.league, { dateMs: ms, round, date: fx.date });
    } else if (cur && ms === cur.dateMs && !cur.round && round) {
      cur.round = round;
    }
  }
  const out = new Map();
  for (const [lg, v] of byLeague) {
    out.set(lg, v.round ? { type: "round", value: String(v.round) } : { type: "date", value: v.date });
  }
  return out;
}

/** Behåll bara nästa omgång per liga (inte omgången efter). */
export function filterNextRoundOnly(list, nextByLeague) {
  if (!list?.length) return [];
  // Om fixtures saknas: fall tillbaka till tidigaste tips per liga (på datum, round kan vara en säsongsmärkning)
  const nextRound = nextByLeague?.size ? nextByLeague : new Map();

  // Ligor utan spelschema (t.ex. Superettan, bara odds): tidigaste datum bland ligans tips
  const earliest = new Map();
  for (const t of list) {
    if (!t.postponed && t.league && t.date && (!earliest.has(t.league) || t.date < earliest.get(t.league))) earliest.set(t.league, t.date);
  }
  return list.filter((t) => {
    // Uppskjuten utan nytt datum: visas alltid (märkt), annars försvinner den tyst (lib/postponed.mjs)
    if (t.postponed) return true;
    const nr = nextRound.get(t.league) ?? (earliest.has(t.league) ? { type: "date", value: earliest.get(t.league) } : null);
    if (!nr) return false;
    if (nr.type === "round") return String(t.round || "") === nr.value;
    if (!t.date || !nr.value) return false;
    const first = new Date(`${nr.value}T00:00:00`).getTime();
    const day = new Date(`${t.date}T00:00:00`).getTime();
    if (Number.isNaN(first) || Number.isNaN(day)) return false;
    const diffDays = (day - first) / DAY_MS;
    return diffDays >= 0 && diffDays <= ROUND_WINDOW_DAYS;
  });
}
