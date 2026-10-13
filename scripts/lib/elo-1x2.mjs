// Elo -> 1X2 utan odds: Elo-skillnad -> forvantat resultat -> malskillnad (Poisson med ~2,5 mal/match, Dixon-Coles-korrektion).
// Anvands av Stryktipset/Europatipset (landslag + Klubb-Elo) och av Oddset-tipsen for matcher utan egen lagmodell (cuper).
//   eloProbs(1850, 1700, 65) -> { home, draw, away, over25, btts, lh, la }   (klubb-Elo, kalibrerad med CLUB_ELO_SCALE)
//   findClubElo('Malmö FF', cache) -> { elo, clubEloName } | null   (cache = data/open/clubelo_all.json)
import { nameScore } from './match-context.mjs';

export const RHO = -0.08; // Dixon-Coles-korrektion for 0-0/1-1/1-0/0-1
export const CLUB_HOME_ADV = 65; // clubelo:s ungefarliga hemmafordel
// Klubb-Elo ar for saker pa favoriten (bakkorning 2026-10-12, 87 319 ligamatcher 2013-2026: Elo-favoriten fick 51,8 %,
// vann 48,6 %; Elo-favorit med 70 %+ fick 77 %, vann 73 %). Elo-skillnaden krymps darfor till 75 % fore omrakningen.
// Anpassad pa matcher fore 2023-07 (0,6-1,0 provat), kontroll 2023-07- : logloss 1,0284 -> 1,0218, favoriten 48,5 % mot 48,8 %.
// Snitt i kontrollen: 1 42,9 % (verkligt 43,8), X 27,2 % (26,3), 2 29,9 % (30,0). Ojamna matcher far mer kryss och underdog.
// Landslags-Elo (eloratings.net) ror vi inte.
export const CLUB_ELO_SCALE = 0.75;

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

export function eloToLambdas(eloH, eloA, homeAdv = 100, scale = 1) {
  const we = 1 / (10 ** (-(scale * (eloH + homeAdv - eloA)) / 400) + 1);
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

export function eloProbs(eloH, eloA, homeAdv = CLUB_HOME_ADV, scale = CLUB_ELO_SCALE) {
  const { lh, la } = eloToLambdas(eloH, eloA, homeAdv, scale);
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
  return best ? { elo: best.club.elo, clubEloName: best.club.name, score: best.s } : null;
}

// Ligans land (config/leagues.json "country") -> clubelo:s landskod. Ligor utanfor Europa finns inte pa clubelo.
export const COUNTRY_TO_CLUBELO = {
  England: 'ENG', Spain: 'ESP', Italy: 'ITA', Germany: 'GER', France: 'FRA', Netherlands: 'NED', Sweden: 'SWE',
  Norway: 'NOR', Poland: 'POL', Denmark: 'DEN', Portugal: 'POR', Greece: 'GRE', Croatia: 'CRO', Czechia: 'CZE',
  Belgium: 'BEL', Scotland: 'SCO',
};

/**
 * Klubb-Elo att visa bredvid lagnamnen: lookup(namn, land) -> { elo, rank, country } eller null.
 * land = ligans land (bara det landet soks, sa "Nacional" i Colombia aldrig blir ett portugisiskt lag),
 * null = europacup (alla lander). Land utan clubelo-sida -> null. rank = plats i landet pa clubelo.
 * domestic = alla lagnamn i landets ligor [{ name, country, tier }] (tier 1 = hogsta). En klubb gar bara till ett av dem:
 * hogst likhet, vid lika det vars liganiva = klubbens niva, annars inget (Skovde AIK blir aldrig AIK, Juve Stabia aldrig Juventus).
 */
export function clubEloLookup(cache, domestic = []) {
  const hitIn = (name, code) => {
    const countries = code ? { [code]: cache?.countries?.[code] } : cache?.countries ?? {};
    const hit = findClubElo(name, { countries });
    if (!hit) return null;
    const cc = Object.keys(countries).find((k) => countries[k]?.clubs?.some((c) => c.name === hit.clubEloName));
    const club = countries[cc].clubs.find((c) => c.name === hit.clubEloName);
    return { ...hit, cc, level: club.level ?? null };
  };
  const owner = new Map(); // `${land}|${klubb}` -> vinnande lagnamn (eller null vid oavgjort)
  const byClub = new Map();
  for (const t of domestic) {
    const code = COUNTRY_TO_CLUBELO[t.country];
    const h = code && hitIn(t.name, code);
    if (!h) continue;
    const k = `${h.cc}|${h.clubEloName}`;
    const list = byClub.get(k) ?? [];
    if (!list.some((x) => x.name === t.name)) list.push({ name: t.name, score: h.score, fits: h.level != null && h.level === t.tier });
    byClub.set(k, list);
  }
  for (const [k, list] of byClub) {
    const top = Math.max(...list.map((x) => x.score));
    let best = list.filter((x) => x.score === top);
    if (best.length > 1) best = best.filter((x) => x.fits);
    owner.set(k, best.length === 1 ? best[0].name : null);
  }
  return (name, country) => {
    const code = country == null ? null : COUNTRY_TO_CLUBELO[country];
    if (country != null && !code) return null;
    const h = hitIn(name, code);
    if (!h) return null;
    const k = `${h.cc}|${h.clubEloName}`;
    if (code && owner.has(k) && owner.get(k) !== name) return null;
    const rank = [...cache.countries[h.cc].clubs].sort((a, b) => b.elo - a.elo).findIndex((c) => c.name === h.clubEloName) + 1;
    return { elo: Math.round(h.elo), rank, country: h.cc };
  };
}
