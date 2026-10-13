// Tillsatta domare för kommande Europacupmatcher (CL, EL, ECL) direkt från UEFA (match.uefa.com v5), som reserv när
// FotMob ännu inte visar domaren. UEFA tillsätter normalt 1-2 dagar före matchen.
//   const list = await uefaUpcoming('2026-10-13', '2026-10-21')   -> [{ league, date, home, away, referee }]
//   uefaRefereeFor(list, { league: 'CL', date: '2026-10-14', home: 'AS Roma', away: 'Real Madrid' }) -> 'François Letexier' | null
import { getJson } from './http.mjs';
import { nameScore } from './match-context.mjs';

export const UEFA_COMP = { CL: 1, EL: 14, ECL: 2019 };

const refName = (m) => {
  const t = (m.referees || []).find((x) => x.role === 'REFEREE')?.person?.translations;
  return t?.name?.EN || [t?.firstName?.EN, t?.lastName?.EN].filter(Boolean).join(' ') || null;
};

export async function uefaUpcoming(from, to) {
  // seasonYear = slutåret (2027 = 2026/27)
  const season = Number(from.slice(5, 7)) >= 7 ? Number(from.slice(0, 4)) + 1 : Number(from.slice(0, 4));
  const out = [];
  for (const [league, comp] of Object.entries(UEFA_COMP)) {
    const list = await getJson(`https://match.uefa.com/v5/matches?competitionId=${comp}&seasonYear=${season}&fromDate=${from}&toDate=${to}&limit=100&offset=0&order=ASC`, { orNull: true }).catch(() => null);
    for (const m of Array.isArray(list) ? list : []) {
      const referee = refName(m);
      if (referee && m.status !== 'FINISHED') out.push({ league, date: m.kickOffTime?.date, home: m.homeTeam?.internationalName, away: m.awayTeam?.internationalName, referee });
    }
  }
  return out;
}

/**
 * Domaren för vår match: samma tävling, datum ±1 dag och båda lagnamnen lika (minst 0,5 var).
 * Annars räcker ett säkert lag (minst 0,8) om det är den enda sådana matchen samma dag (Internazionale = Inter).
 */
export function uefaRefereeFor(list, f) {
  const day = (d) => Date.parse(`${d}T00:00:00Z`) / 86400e3;
  let best = null;
  const oneSide = [];
  for (const m of list) {
    if (m.league !== f.league || !m.date || Math.abs(day(m.date) - day(f.date)) > 1) continue;
    const sh = nameScore(f.home, null, m.home), sa = nameScore(f.away, null, m.away);
    if (sh >= 0.5 && sa >= 0.5) { if (!best || sh + sa > best.s) best = { s: sh + sa, referee: m.referee }; }
    else if (m.date === f.date && Math.max(sh, sa) >= 0.8) oneSide.push(m.referee);
  }
  return best?.referee ?? (oneSide.length === 1 ? oneSide[0] : null);
}
