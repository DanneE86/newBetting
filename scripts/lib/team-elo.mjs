// Eget lag-Elo ur ligaresultaten (football-data), match for match fram till cutoff - ingen framtidsdata, sa samma tal
// i backtest som live. clubelo.com:s historik-API gick inte att na (502, 2026-10-12), darfor egen berakning.
// Malskillnad vager in som hos clubelo/eloratings (2 mal 1,5x, 3+ (11+N)/8). Nya lag startar efter division.
//   teamElo(matches, '2026-10-10') -> Map(lag -> elo)   (matches sorterade pa datum, { league, date, home, away, hg, ag })
export const TEAM_ELO_K = 20;
export const TEAM_ELO_HOME_ADV = 65;
// Startvarde per liga (ungefar clubelo:s nivaer); okand liga -> 1600
export const TEAM_ELO_START = { PL: 1700, CH: 1550, EL1: 1430, EL2: 1330, LL2: 1500, SB: 1500, BL2: 1500 };
const DEFAULT_START = 1600;

export function goalDiffMult(gd) {
  const n = Math.abs(gd);
  return n <= 1 ? 1 : n === 2 ? 1.5 : (11 + n) / 8;
}

export function teamElo(matches, cutoff, { K = TEAM_ELO_K, homeAdv = TEAM_ELO_HOME_ADV, start = TEAM_ELO_START } = {}) {
  const r = new Map();
  for (const m of matches) {
    if (m.date >= cutoff) break;
    if (m.hg == null || m.ag == null) continue;
    for (const t of [m.home, m.away]) if (!r.has(t)) r.set(t, start[m.league] ?? DEFAULT_START);
    const eh = r.get(m.home), ea = r.get(m.away);
    const we = 1 / (10 ** (-(eh + homeAdv - ea) / 400) + 1);
    const res = m.hg > m.ag ? 1 : m.hg === m.ag ? 0.5 : 0;
    const d = K * goalDiffMult(m.hg - m.ag) * (res - we);
    r.set(m.home, eh + d);
    r.set(m.away, ea - d);
  }
  return r;
}
