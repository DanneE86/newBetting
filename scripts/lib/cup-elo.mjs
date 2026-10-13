// Eget lag-Elo för AFC-cuperna (ACL, ACL2): Klubb-Elo (clubelo.com) täcker bara Europa, så rankingen räknas ur de
// asiatiska ligorna i store (team-elo.mjs). Ligorna möts nästan aldrig, så nivån mellan dem kommer från startvärdena
// (ungefär Opta/IFFHS-ordningen: J1 och Saudi starkast, A-League svagast). Lag från ligor utan data (Iran, Qatar, Kina ...)
// får inget Elo. Laget söks bara i sin hemmaliga (FotMob primaryLeagueId i data/trupper/ACL.json), aldrig över länder:
// Shabab Al-Ahli (Förenade Arabemiraten) blir aldrig saudiska Al Ahli. Bara visning, påverkar inga tips.
//   const eloOf = asiaEloLookup(store.matches, '2026-10-13')
//   eloOf('Kawasaki Frontale', 'JP1') -> { elo: 1612, rank: 3, league: 'JP1', source: 'own' } | null
import { teamElo } from './team-elo.mjs';
import { nameScore } from './match-context.mjs';
import { sameTeamName, TEAM_ALIASES } from './team-aliases.mjs';
import { FOTMOB_LEAGUES } from './fotmob-leagues.mjs';

export const ASIA_CUPS = new Set(['ACL', 'ACL2']);
export const ASIA_ELO_START = { JP1: 1560, SAU: 1560, KR: 1540, AUS: 1430 };
const MIN_SCORE = 0.8;

export function asiaEloLookup(matches, cutoff, start = ASIA_ELO_START) {
  const ms = matches.filter((m) => start[m.league] != null && m.date < cutoff).sort((a, b) => a.date.localeCompare(b.date));
  const elo = teamElo(ms, cutoff, { start });
  // Bara lag som spelat i ligan senaste året (nedflyttade lag med gammalt Elo ska inte rankas)
  const since = new Date(Date.parse(`${cutoff}T00:00:00Z`) - 365 * 86400e3).toISOString().slice(0, 10);
  const leagueOf = new Map();
  for (const m of ms) if (m.date >= since) for (const t of [m.home, m.away]) leagueOf.set(t, m.league);
  const rankOf = new Map();
  for (const lg of Object.keys(start)) {
    [...leagueOf].filter(([, l]) => l === lg).map(([t]) => t).sort((a, b) => elo.get(b) - elo.get(a))
      .forEach((t, i) => rankOf.set(t, i + 1));
  }
  const cache = new Map();
  const find = (name, league) => {
    const names = [...leagueOf].filter(([, l]) => l === league).map(([t]) => t);
    const alias = TEAM_ALIASES[name];
    const exact = names.find((t) => t === name || t === alias || sameTeamName(t, name));
    if (exact) return exact;
    // Bästa namnlikhet i ligan, bara om den är ensam bäst
    const scored = names.map((t) => [t, nameScore(name, null, t)]).filter(([, s]) => s >= MIN_SCORE).sort((a, b) => b[1] - a[1]);
    return scored.length && (scored.length === 1 || scored[0][1] > scored[1][1]) ? scored[0][0] : null;
  };
  return (name, league) => {
    const key = `${league}|${name}`;
    if (!cache.has(key)) {
      const t = name && start[league] != null ? find(name, league) : null;
      cache.set(key, t ? { elo: Math.round(elo.get(t)), rank: rankOf.get(t), league, source: 'own' } : null);
    }
    return cache.get(key);
  };
}

// Cuplagens hemmaliga (vår kod) ur trupperna: { ACL: { teams: { 'Al Ahli': { primaryLeagueId: 536 } } } } -> Map('ACL|Al Ahli' -> 'SAU')
export function cupHomeLeagues(squadsByCup) {
  const code = new Map(Object.entries(FOTMOB_LEAGUES).map(([c, v]) => [Array.isArray(v) ? v[0] : v, c]));
  const out = new Map();
  for (const [cup, doc] of Object.entries(squadsByCup)) {
    for (const [team, t] of Object.entries(doc?.teams ?? {})) if (code.has(t.primaryLeagueId)) out.set(`${cup}|${team}`, code.get(t.primaryLeagueId));
  }
  return out;
}
