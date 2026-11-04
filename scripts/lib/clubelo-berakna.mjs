// Egen beräkning av Klubb-Elo när clubelo.com inte går att nå. Samma formel som clubelo.com/System:
//   E = 1 / (10^(-dr/400) + 1), dr = Elo-skillnad + hemmafördel (HFA, en per land), k = 20
//   ΔElo = (R - E) * k, vid vinst skalad med roten ur målskillnaden så att snittet per utfall blir oförändrat
//   Varje dag, per land: HFA += sum(hemmalagens ΔElo) * 0.075
// Startvärden = clubelos senaste riktiga tal, rullas framåt match för match. Sådant clubelo inte publicerat (ligajusteringar,
// startvärden, deras resultathistogram) går inte att efterlikna: målskillnadens fördelning tas i stället ur Poisson.
import { eloToLambdas } from './elo-1x2.mjs';

export const CLUBELO_K = 20;
export const HFA_STEP = 0.075;
const poisson = (k, l) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return (Math.exp(-l) * l ** k) / f; };

export function expectedScore(dr) {
  return 1 / (10 ** (-dr / 400) + 1);
}

/** sum(sqrt(m) * p_m / p_utfall) över alla målskillnader för en vinst hemma (win = 'home') eller borta. Alltid >= 1. */
export function marginNorm(lh, la, win, N = 12) {
  let pWin = 0, sum = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const m = win === 'home' ? i - j : j - i;
      if (m <= 0) continue;
      const p = poisson(i, lh) * poisson(j, la);
      pWin += p;
      sum += Math.sqrt(m) * p;
    }
  }
  return pWin > 0 ? sum / pWin : 1;
}

/** Hemmalagets poängförändring (bortalaget får samma med omvänt tecken). */
export function eloExchange(eloH, eloA, hg, ag, hfa = 65, k = CLUBELO_K) {
  const E = expectedScore(eloH + hfa - eloA);
  const R = hg > ag ? 1 : hg === ag ? 0.5 : 0;
  const base = (R - E) * k;
  if (hg === ag) return base;
  const { lh, la } = eloToLambdas(eloH, eloA, hfa, 1);
  return (base / marginNorm(lh, la, hg > ag ? 'home' : 'away')) * Math.sqrt(Math.abs(hg - ag));
}

/**
 * Rullar Elo framåt. matches: [{ date, home, away, hg, ag, key }] sorterade på datum, home/away = nyckel i ratings eller null,
 * key = land för HFA (null = europacup, hemmalagets land används). ratings: Map(nyckel -> { elo, seedDate, country }).
 * Matcher före lagets seedDate räknas inte för det laget. Okänd motståndare får opponentElo(land).
 * Muterar inte ratings. Returnerar { ratings, hfa, used }.
 */
export function rollElo(matches, ratings, { hfa = {}, defaultHfa = 65, opponentElo = () => null } = {}) {
  const r = new Map([...ratings].map(([n, v]) => [n, { ...v }]));
  const h = { ...hfa };
  let used = 0, day = null, dayDelta = {};
  const flush = () => {
    for (const [c, d] of Object.entries(dayDelta)) h[c] = (h[c] ?? defaultHfa) + d * HFA_STEP;
    dayDelta = {};
  };
  for (const m of matches) {
    if (m.date !== day) { flush(); day = m.date; }
    const a = r.get(m.home), b = r.get(m.away);
    const liveA = a && m.date >= a.seedDate, liveB = b && m.date >= b.seedDate;
    if (!liveA && !liveB) continue;
    const country = m.key ?? a?.country ?? b?.country;
    const eh = a ? a.elo : opponentElo(country), ea = b ? b.elo : opponentElo(country);
    if (eh == null || ea == null) continue;
    const d = eloExchange(eh, ea, m.hg, m.ag, h[country] ?? defaultHfa);
    if (liveA) a.elo += d;
    if (liveB) b.elo -= d;
    if (m.key) dayDelta[m.key] = (dayDelta[m.key] ?? 0) + d;
    used++;
  }
  flush();
  return { ratings: r, hfa: h, used };
}
