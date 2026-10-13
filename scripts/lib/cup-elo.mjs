// Eget lag-Elo för cuper utanför Europa: Klubb-Elo (clubelo.com) täcker bara Europa, så rankingen räknas ur ligorna
// i store (team-elo.mjs). Ligorna möts nästan aldrig, så nivån mellan dem kommer från startvärdena.
//  - Asien (ACL, ACL2): J1, Saudi, K League, A-League (ungefär Opta/IFFHS-ordningen: J1 och Saudi starkast).
//  - Sydamerika (LIB, SUD): Brasileirão A/B, Argentina, Colombia (Brasilien starkast: brasilianska lag har vunnit
//    Libertadores varje år 2019–2025 och har 3–5 gånger så högt truppvärde som argentinska).
// Lag från ligor utan data (Iran, Qatar, Uruguay, Chile, Ecuador ...) får inget Elo. Laget söks bara i sin hemmaliga
// (FotMob primaryLeagueId i data/trupper/<cup>.json), aldrig över länder: Shabab Al-Ahli (Förenade Arabemiraten) blir
// aldrig saudiska Al Ahli.
//   const eloOf = cupEloLookup(store.matches, '2026-10-13', CUP_ELO_REGIONS.sydamerika.start)
//   eloOf('Palmeiras', 'BR') -> { elo: 1702, rank: 2, league: 'BR', source: 'own' } | null
//   CUP_ELO.LIB -> 'sydamerika', CUP_ELO_REGIONS.sydamerika.source -> 'saelo'
import { teamElo } from './team-elo.mjs';
import { nameScore } from './match-context.mjs';
import { sameTeamName, TEAM_ALIASES } from './team-aliases.mjs';
import { FOTMOB_LEAGUES } from './fotmob-leagues.mjs';

export const ASIA_ELO_START = { JP1: 1560, SAU: 1560, KR: 1540, AUS: 1430 };
export const SA_ELO_START = { BR: 1600, AR: 1540, BR2: 1470, COL: 1450 };
export const CUP_ELO_REGIONS = {
  asia: { start: ASIA_ELO_START, source: 'asiaelo' },
  sydamerika: { start: SA_ELO_START, source: 'saelo' },
};
export const CUP_ELO = { ACL: 'asia', ACL2: 'asia', LIB: 'sydamerika', SUD: 'sydamerika' };
export const ASIA_CUPS = new Set(Object.keys(CUP_ELO).filter((c) => CUP_ELO[c] === 'asia'));
const MIN_SCORE = 0.8;

export function cupEloLookup(matches, cutoff, start) {
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

export const asiaEloLookup = (matches, cutoff, start = ASIA_ELO_START) => cupEloLookup(matches, cutoff, start);

/**
 * Lagets hemmaliga för en cupmatch: exakt namn i cupens trupp, annars i regionens andra cuper (lag som gått från
 * Libertadores till Sudamericana), annars ensam bästa namnlikhet ≥ 0,8 (ESPN "Estudiantes de La Plata" ~ FotMob "Estudiantes").
 *   homeLeagueOf(home, 'SUD', 'Boca Juniors') -> 'AR'
 */
export function homeLeagueOf(homeMap, cup, name) {
  const cups = [cup, ...Object.keys(CUP_ELO).filter((c) => c !== cup && CUP_ELO[c] === CUP_ELO[cup])];
  for (const c of cups) if (homeMap.has(`${c}|${name}`)) return homeMap.get(`${c}|${name}`);
  const scored = [...homeMap].filter(([k]) => cups.includes(k.split('|')[0]))
    .map(([k, lg]) => [lg, Math.max(sameTeamName(k.split('|')[1], name) ? 1 : 0, nameScore(name, null, k.split('|')[1]))])
    .filter(([, s]) => s >= MIN_SCORE).sort((a, b) => b[1] - a[1]);
  if (!scored.length) return undefined;
  const top = scored.filter(([, s]) => s === scored[0][1]);
  return new Set(top.map(([lg]) => lg)).size === 1 ? top[0][0] : undefined;
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
