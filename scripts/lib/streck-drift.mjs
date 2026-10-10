// Streckkurvan – hur spelet rör sig från första hämtning till sista.
// "Sena pengar": hästar vars streck stiger kraftigt nära start tenderar att ha
// informerade vinnare bakom sig som marknaden ännu inte prisat in fullt ut.
//
// addStreckDrift(snapshots, analysis):
//   Lägger på .streckDrift (relativ förändring 0–∞, 1.0 = oförändrat) och
//   .streckFirst / .streckLast (absoluta streckvärden, 0–1) på varje ej struken
//   häst i analysis.races[].horses[]. Kräver minst 2 snapshots och minst MIN_SPAN_H
//   timmars tidsspann för att ge ett värde – annars null.

const MIN_SPAN_H = 1;   // minst 1 timme mellan första och sista snapshot
const MIN_STRECK = 0.001; // under detta räknas strecket som ogiltigt

/**
 * Bygger en Map<raceId, Map<nr, { first, last, firstAt, lastAt, trend }>> ur snapshot-serien.
 * first/last = streck (0–1). trend = ATG:s poolrörelse-koefficient från senaste snapshot (index [3]).
 */
function buildDriftMap(snapshots) {
  if (!snapshots?.length) return new Map();
  const byRace = new Map();
  for (const snap of snapshots) {
    const at = snap.at ? Date.parse(snap.at) : null;
    if (!at) continue;
    for (const [raceId, starters] of Object.entries(snap.races || {})) {
      if (!byRace.has(raceId)) byRace.set(raceId, new Map());
      const raceMap = byRace.get(raceId);
      for (const [nrStr, vals] of Object.entries(starters)) {
        const nr = Number(nrStr);
        const streck = vals?.[0];
        if (streck == null || streck < MIN_STRECK) continue;
        if (!raceMap.has(nr)) {
          raceMap.set(nr, { first: streck, firstAt: at, last: streck, lastAt: at, trend: vals[3] ?? null });
        } else {
          const e = raceMap.get(nr);
          if (at < e.firstAt) { e.first = streck; e.firstAt = at; }
          if (at > e.lastAt) { e.last = streck; e.lastAt = at; e.trend = vals[3] ?? e.trend; }
        }
      }
    }
  }
  return byRace;
}

/**
 * Lägger på streckDrift, streckFirst, streckLast och poolTrend på varje häst i analysen.
 * streckDrift = last / first (1.0 = oförändrat). poolTrend = ATG:s senaste flödesriktning.
 * streckDrift sätts bara om tidsspannet är >= MIN_SPAN_H.
 */
export function addStreckDrift(snapshots, analysis) {
  const driftMap = buildDriftMap(snapshots);
  for (const aRace of analysis.races) {
    const raceMap = driftMap.get(aRace.id);
    if (!raceMap) continue;
    for (const h of aRace.horses) {
      if (h.scratched) continue;
      const e = raceMap.get(h.nr);
      if (!e) continue;
      const spanH = (e.lastAt - e.firstAt) / 3600000;
      h.streckFirst = Math.round(e.first * 1000) / 1000;
      h.streckLast  = Math.round(e.last  * 1000) / 1000;
      h.streckDrift = spanH >= MIN_SPAN_H ? Math.round((e.last / e.first) * 100) / 100 : null;
      if (e.trend != null) h.poolTrend = Math.round(e.trend * 10000) / 10000;
    }
  }
  return analysis;
}
