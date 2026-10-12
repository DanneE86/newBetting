// Elo -> 1X2 utan odds: Elo-skillnad -> forvantat resultat -> malskillnad (Poisson med ~2,5 mal/match, Dixon-Coles-korrektion).
// Anvands av Stryktipset/Europatipset (landslag + Klubb-Elo) och av Oddset-tipsen for matcher utan egen lagmodell (cuper).
//   eloProbs(1850, 1700, 65) -> { home, draw, away, over25, btts, lh, la }
//   findClubElo('Malmö FF', cache) -> { elo, clubEloName } | null   (cache = data/open/clubelo_all.json)
import { nameScore } from './match-context.mjs';

export const RHO = -0.08; // Dixon-Coles-korrektion for 0-0/1-1/1-0/0-1
export const CLUB_HOME_ADV = 65; // clubelo:s ungefarliga hemmafordel

const poisson = (k, l) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return (Math.exp(-l) * l ** k) / f; };

export function goalProbs(lh, la, N = 9) {
  const tau = (i, j) => (i === 0 && j === 0 ? 1 - lh * la * RHO : i === 0 && j === 1 ? 1 + lh * RHO
    : i === 1 && j === 0 ? 1 + la * RHO : i === 1 && j === 1 ? 1 - RHO : 1);
  let home = 0, draw = 0, away = 0, over25 = 0, btts = 0, tot = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = poisson(i, lh) * poisson(j, la) * tau(i, j);
      tot += p;
      if (i > j) home += p; else if (i === j) draw += p; else away += p;
      if (i + j >= 3) over25 += p;
      if (i > 0 && j > 0) btts += p;
    }
  }
  return { home: home / tot, draw: draw / tot, away: away / tot, over25: over25 / tot, btts: btts / tot };
}

export function eloToLambdas(eloH, eloA, homeAdv = 100) {
  const we = 1 / (10 ** (-(eloH + homeAdv - eloA) / 400) + 1);
  const T = 2.5;
  let lo = -2.4, hi = 2.4;
  for (let i = 0; i < 40; i++) {
    const s = (lo + hi) / 2;
    const m = goalProbs((T + s) / 2, (T - s) / 2);
    if (m.home + 0.5 * m.draw < we) lo = s; else hi = s;
  }
  const s = (lo + hi) / 2;
  return { lh: (T + s) / 2, la: (T - s) / 2, we };
}

export function eloProbs(eloH, eloA, homeAdv = CLUB_HOME_ADV) {
  const { lh, la } = eloToLambdas(eloH, eloA, homeAdv);
  return { ...goalProbs(lh, la), lh, la };
}

// Engelska namn pa stader/klubbar -> clubelo:s stavning ("Sparta Prague" blev annars Sparta Rotterdam, "Red Star" Paris-klubben)
const EXONYMS = [[/\bprague\b/i, 'Praha'], [/\bred star\b/i, 'Crvena Zvezda'], [/\bbelgrade\b/i, 'Beograd']];
const exactKey = (s) => String(s || '').replace(/ø/gi, 'o').replace(/æ/gi, 'ae').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Basta namntraff i Klubb-Elo-cachen over alla lander (cuper har lag fran olika lander). Minst 0.75 i likhet.
 * Exakt samma namn (utan accenter) gar fore: "Lillestrom" ska bli Lillestrøm, inte Lille (prefixtraff 1.0).
 */
export function findClubElo(name, cache, min = 0.75) {
  const q = EXONYMS.reduce((s, [re, to]) => s.replace(re, to), String(name || ''));
  let best = null;
  for (const c of Object.values(cache?.countries ?? {})) {
    for (const club of c.clubs ?? []) {
      const s = exactKey(q) === exactKey(club.name) ? 2 : nameScore(q, null, club.name);
      if (s >= min && (!best || s > best.s)) best = { s, club };
    }
  }
  return best ? { elo: best.club.elo, clubEloName: best.club.name } : null;
}
