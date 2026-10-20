// Sammanstallning av oddsrorelser (tip.oddsMove) for matcher inom horisonten, storst rorelse forst.
// En rad per match (samma match kan finnas i bade bestUpcoming och allCandidates).
export function summarizeMoves(tips, { now = Date.now(), horizonH = 24 } = {}) {
  const seen = new Map();
  for (const t of tips) {
    const k = Date.parse(t.kickoffUtc ?? '');
    if (!t.oddsMove || !Number.isFinite(k) || k <= now || k > now + horizonH * 36e5) continue;
    const key = `${t.date}|${t.league}|${t.home}|${t.away}`;
    if (seen.has(key)) continue;
    const m = t.oddsMove;
    const size = Math.max(0, ...Object.values(m.moves).map((x) => Math.abs(x.pp)));
    seen.set(key, { league: t.league, match: t.match, kickoffUtc: t.kickoffUtc, src: m.src, firstAt: m.firstAt, lastAt: m.lastAt, moves: m.moves, flagged: m.flagged, size });
  }
  return [...seen.values()].sort((a, b) => (b.flagged.length > 0) - (a.flagged.length > 0) || b.size - a.size);
}
