// Hela fältets resultat i hästarnas tidigare lopp (ATG /races/<id>) – ren logik, inget nät.
//
// Ur loppet räknas per häst: meter efter vinnaren (vinnaren: minus meter före tvåan), antal startande, km-tid mot
// fältets median och om hästen galopperade/diskades. Positioner i loppet (ledning, utvändigt, satt fast) finns inte
// i ATG:s öppna API – avståndet till vinnaren är det närmaste.

const kmSec = (t) => (t && t.minutes != null && t.seconds != null ? t.minutes * 60 + t.seconds + (t.tenths || 0) / 10 : null);
const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const normName = (s) => String(s || "").toLowerCase().replace(/\s*\([a-z]{2,3}\)\s*$/, "").replace(/[^a-z0-9åäöæøéü]/g, "");

/** Kompakt lopp: { id, date, track, dist, method, starts: [[horseId, namn, place, finishOrder, km, galopp, disk, odds]] }. Strukna utanför. */
export function compactRace(race, trackName) {
  const starts = [];
  for (const s of race?.starts || []) {
    const r = s.result || {};
    if (s.scratched || (r.finishOrder >= 50 && !r.kmTime)) continue;
    starts.push([s.horse?.id ?? null, s.horse?.name || null, r.place ?? null, r.finishOrder ?? null, kmSec(r.kmTime), r.galloped ? 1 : 0, r.disqualified ? 1 : 0, r.finalOdds || null]);
  }
  return { id: race.id, date: String(race.date || race.id).slice(0, 10), track: trackName || race.track?.name || null, dist: race.distance ?? null, method: race.startMethod || null, starts };
}

/**
 * Hästens rad i loppet → { efter, falt, motFalt, galopp }. efter = meter efter vinnaren (km-tidsskillnad × distans ×
 * vinnarens fart); vinnaren får minus avståndet till tvåan. Utan km-tid (diskad, bröt) blir efter/motFalt null.
 */
export function fieldInfo(race, horseId, name) {
  const nn = normName(name);
  const me = race.starts.find((s) => (horseId != null && s[0] === horseId) || (nn && normName(s[1]) === nn));
  if (!me) return null;
  const dist = race.dist || 2140;
  const timed = race.starts.filter((s) => s[4] != null && !s[6]);
  const byOrder = [...timed].sort((a, b) => (a[3] ?? 99) - (b[3] ?? 99));
  const winner = byOrder.find((s) => s[2] === 1) || byOrder[0];
  const toM = (dKm, base) => (dKm * dist) / base;
  let efter = null;
  if (me[4] != null && !me[6] && winner) {
    if (me === winner) {
      const second = byOrder.find((s) => s !== winner);
      efter = second ? -toM(Math.max(0, second[4] - winner[4]), winner[4]) : 0;
    } else efter = toM(Math.max(0, me[4] - winner[4]), winner[4]);
  }
  const med = median(timed.map((s) => s[4]));
  return {
    efter: efter == null ? null : Math.round(efter * 10) / 10,
    falt: race.starts.length,
    motFalt: me[4] != null && !me[6] && med != null ? Math.round((me[4] - med) * 10) / 10 : null,
    galopp: me[5] || me[6] ? 1 : 0,
  };
}

/** Index för uppslag: "datum|bana" → [lopp]. */
export function indexRaces(races) {
  const idx = new Map();
  for (const r of races) {
    const k = `${r.date}|${r.track}`;
    if (!idx.has(k)) idx.set(k, []);
    idx.get(k).push(r);
  }
  return idx;
}

/** Lägger fältinfo på hästarnas tidigare starter (bara de första maxRecs). Returnerar antal träffar. */
export function attachFieldInfo(games, idx, { maxRecs = 5, byId = null } = {}) {
  let hit = 0;
  for (const g of games)
    for (const race of g.races)
      for (const s of race.starts) {
        const recs = (s.records || []).filter((r) => !r.scratched).slice(0, maxRecs);
        for (const r of recs) {
          if (r.efter !== undefined) continue;
          const cands = (r.raceId && byId?.get(r.raceId) ? [byId.get(r.raceId)] : idx.get(`${r.date}|${r.track}`)) || [];
          let info = null;
          for (const c of cands) if ((info = fieldInfo(c, s.horseId, s.horse))) break;
          if (info) {
            Object.assign(r, info);
            hit++;
          }
        }
      }
  return hit;
}
