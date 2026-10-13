// OddsPortals resultatarkiv (snittodds 1X2 + slutresultat) för cuperna, för att jämföra truppvärdet mot marknaden.
//   cupResultsSlugs('LIB', 2023, 2026) -> ['south-america/copa-libertadores-2024']   (TM-säsong 2023 = 2024 års upplaga)
//   cupResultsSlugs('LIB', 2025, 2026) -> ['south-america/copa-libertadores-2026', 'south-america/copa-libertadores']
//   cupResultsSlugs('CL', 2026, 2026)  -> ['europe/champions-league']                 (innevarande säsong utan år)
//   parseResultsText(text) -> [{ date, status, home, away, country: { home, away }, hg, ag, odds: [h, d, a] | null }]
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const ODD_RE = /^\d{1,3}\.\d{1,2}$/;
const STATUS_RE = /^(Finished|After Pen\.|After ET|Awarded|Canceled|Cancelled|Postponed|Abandoned|Interrupted)$/;

const BASES = {
  CL: ['europe/champions-league'],
  EL: ['europe/europa-league'],
  ECL: ['europe/conference-league', 'europe/europa-conference-league'],
  LIB: ['south-america/copa-libertadores'],
  SUD: ['south-america/copa-sudamericana'],
};
const CALENDAR = new Set(['LIB', 'SUD']);

/** Sökvägar att pröva i ordning (första som ger resultat gäller). nowSeason = innevarande TM-säsong för Europa. */
export function cupResultsSlugs(code, season, nowSeason) {
  const bases = BASES[code] ?? [];
  if (CALENDAR.has(code)) {
    const year = season + 1;
    // Innevarande upplaga kan sakna år i sökvägen
    return bases.flatMap((b) => (year >= nowSeason ? [`${b}-${year}`, b] : [`${b}-${year}`]));
  }
  return season >= nowSeason ? bases : bases.map((b) => `${b}-${season}-${season + 1}`);
}

const splitTeam = (s) => {
  const m = String(s).match(/^(.*?)\s*\(([A-Z][a-z]{2})\)$/);
  return m ? { name: m[1], country: m[2] } : { name: String(s).trim(), country: null };
};

/** Resultatlistans text: datumrubrik "30 Nov 2024 - Play Offs", sedan per match status, mål, hemma, -, borta, mål, 1, X, 2. */
export function parseResultsText(text) {
  const L = String(text).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  let date = null;
  for (let i = 0; i < L.length; i++) {
    const dm = L[i].match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})/);
    if (dm && MONTHS[dm[2]]) { date = `${dm[3]}-${String(MONTHS[dm[2]]).padStart(2, '0')}-${dm[1].padStart(2, '0')}`; continue; }
    if (!STATUS_RE.test(L[i]) || !date) continue;
    const [hg, home, dash, away, ag] = L.slice(i + 1, i + 6);
    if (!/^\d+$/.test(hg ?? '') || dash !== '-' || !/^\d+$/.test(ag ?? '')) continue;
    const odds = [];
    let j = i + 6;
    while (j < L.length && odds.length < 3 && !STATUS_RE.test(L[j]) && ODD_RE.test(L[j])) { odds.push(Number(L[j])); j++; }
    const h = splitTeam(home), a = splitTeam(away);
    out.push({
      date, status: L[i], home: h.name, away: a.name, country: { home: h.country, away: a.country },
      hg: Number(hg), ag: Number(ag), odds: odds.length === 3 ? odds : null,
    });
    i = j - 1;
  }
  return out;
}
