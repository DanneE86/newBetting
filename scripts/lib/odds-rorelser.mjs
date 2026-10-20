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

// Logg over sena oddsrorelser (anvandaren 2026-10-20: "spara alla andringar pa odds du ser tatt inpa matchstart sa vi
// kan se hur det skulle ga att betta pa det"). En post per match, skrivs over vid varje hamtning sa sista posten ar den
// narmast avspark. data/oddsrorelser/<YYYY-MM>.json, utvarderas av scripts/odds-rorelser-analys.mjs.
export function logRecord(t, now = Date.now()) {
  const m = t.oddsMove;
  if (!m || !t.kickoffUtc) return null;
  return {
    key: `${t.date}|${t.league}|${t.home}|${t.away}`, league: t.league, date: t.date, home: t.home, away: t.away,
    kickoffUtc: t.kickoffUtc, src: m.src, firstAt: m.firstAt, lastAt: m.lastAt,
    minBeforeKick: Math.round((Date.parse(t.kickoffUtc) - Date.parse(m.lastAt)) / 6e4),
    moves: m.moves, flagged: m.flagged, savedAt: new Date(now).toISOString(),
  };
}

const OUTCOME = { home: (g) => g.hg > g.ag, draw: (g) => g.hg === g.ag, away: (g) => g.hg < g.ag, over25: (g) => g.hg + g.ag > 2.5, under25: (g) => g.hg + g.ag < 2.5 };
const GROUPS = { '1X2': ['home', 'draw', 'away'], 'Ö/U 2,5': ['over25', 'under25'] };

/**
 * Hade det lont sig att spela pa sena rorelser? Per troskel (procentenheter) och marknad: "folj" = utfallet vars chans
 * steg mest (pengar pa det), "mot" = utfallet vars chans foll mest, spelat till senaste oddset (det som gick att ta
 * nar rorelsen syntes). resultOf(rec) -> { hg, ag } eller null (inte spelad / inget resultat). Enhet = en insats.
 */
export function evaluateMoves(records, resultOf, thresholds = [2, 4, 6]) {
  const rows = [];
  const graded = records.map((r) => ({ r, g: resultOf(r) })).filter((x) => x.g);
  for (const T of thresholds) {
    for (const [market, keys] of Object.entries(GROUPS)) {
      for (const strategy of ['folj', 'mot']) {
        let n = 0, wins = 0, profit = 0, oddsSum = 0;
        for (const { r, g } of graded) {
          const cands = keys.filter((k) => r.moves[k]?.to > 1 && Number.isFinite(r.moves[k].pp));
          if (!cands.length) continue;
          const k = cands.reduce((a, b) => (strategy === 'folj' ? (r.moves[b].pp > r.moves[a].pp ? b : a) : (r.moves[b].pp < r.moves[a].pp ? b : a)));
          const pp = r.moves[k].pp;
          if (strategy === 'folj' ? pp < T : pp > -T) continue;
          const won = OUTCOME[k](g);
          n++;
          oddsSum += r.moves[k].to;
          if (won) { wins++; profit += r.moves[k].to - 1; } else profit -= 1;
        }
        rows.push({ threshold: T, market, strategy, n, wins, hitRate: n ? Math.round((wins / n) * 1000) / 10 : null,
          avgOdds: n ? Math.round((oddsSum / n) * 100) / 100 : null, profit: Math.round(profit * 100) / 100, roi: n ? Math.round((profit / n) * 1000) / 10 : null });
      }
    }
  }
  return { graded: graded.length, total: records.length, rows };
}
