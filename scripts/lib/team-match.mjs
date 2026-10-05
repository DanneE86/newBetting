// Basta namntraff bland kanda lag. Lika poang mellan tva lag = tvetydigt -> null, sa att t.ex.
// "Argentinos Juniors" aldrig blir "Boca Juniors" bara for att Boca star forst i listan.
export function uniqueBest(name, candidates, score, min = 0.5) {
  let best = null, bestScore = 0, tie = false;
  for (const t of candidates) {
    const s = score(name, t);
    if (s > bestScore) { bestScore = s; best = t; tie = false; }
    else if (s === bestScore && s > 0) tie = true;
  }
  return bestScore >= min && !tie ? best : null;
}

/** Har nagot av lagen i raden en annan match i listan inom `days` dagar? (Ett lag spelar inte tva matcher sa tatt.) */
export function clashesWith(r, list, days = 2) {
  const t = Date.parse(r.date);
  return list.some((u) => u !== r && (u.home === r.home || u.away === r.away || u.home === r.away || u.away === r.home)
    && !(u.home === r.home && u.away === r.away && u.date === r.date)
    && Math.abs(Date.parse(u.date) - t) <= days * 864e5);
}
