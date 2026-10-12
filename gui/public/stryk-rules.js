// Gemensamt för Stryktipset/Europatipset i webben (stryk-engine.js) och pipelinen (scripts/fetch-stryktipset.mjs):
// tecknen, folkets färger (visning av strecken) och skrällfickan. Gambling Cabin-reglerna togs bort 2026-10-11.
// Testreglage i Node: STRYK_POCKET_LIFT=0 stänger av skrällfickans höjning (backtest).
const env = globalThis.process?.env || {};
const envNum = (k, def) => Number(env[k] ?? def);

export const SIGNS = ["1", "X", "2"];

// Folkets streck: grön >= 45 %, röd 25 % eller lägre (användaren 2026-10-02, avrundat till hela procent), annars gul
export const COLOR = { green: 0.45, red: 0.25 };
export function signColor(folkP) {
  if (folkP == null) return "yellow";
  return folkP >= COLOR.green ? "green" : Math.round(folkP * 100) <= COLOR.red * 100 ? "red" : "yellow";
}

// Skrällficka (användaren 2026-10-11: "hitta skrällar som folk missar där data säger det"). Kupongarkivet, 4 582 matcher
// 2023-07 – 2026-10: skrällar i PL och Championship där oddsen ger 20–30 % och minst 1,3 × folkets streck gick in 109 gånger
// mot oddsens 96 och folkets 65 (1,7 × folket, över oddsen i båda perioderna). Europatipset och andra ligor: nej.
// lift = höjning av fickans tecken i slutprocenten (pipelinen, fetch-stryktipset.mjs). Skattad på 2023-07 – 2025-06 (211 matcher,
// bästa +12 %), kontroll 2025-07 – 2026-10 (149 matcher): logloss −0,83 (z −1,3) – svagt men bättre än oddsen, så in i motorn
// (användarens regel 2026-10-04). STRYK_POCKET_LIFT=0 stänger av (backtest).
export const POCKET = { leagues: ["Premier League", "Championship"], pMin: 0.2, pMax: 0.3, ratioMin: 1.3, folkMax: 0.3, lift: envNum("STRYK_POCKET_LIFT", 0.12) };
/** Tecknet k är en skräll folket missar (fickan): inte oddsfavorit, oddsen 20–30 % och minst 1,3 × folkets streck. */
export function pocketSign(e, k) {
  const m = e.market || e.final;
  const f = e.folk?.[k];
  if (!m || f == null || f <= 0 || !POCKET.leagues.includes(e.league) || k === m.indexOf(Math.max(...m))) return false;
  return f <= POCKET.folkMax && m[k] >= POCKET.pMin && m[k] < POCKET.pMax && m[k] / f >= POCKET.ratioMin;
}
/** Fickans tecken (index) och procenten med fickans tecken höjda med lift (normerad till 1). Fickan avgörs på oddsen före höjningen. */
export function applyPocket(e, lift = POCKET.lift) {
  const signs = [0, 1, 2].filter((k) => pocketSign(e, k));
  if (!signs.length || !(lift > 0)) return { signs, p: e.final };
  const w = e.final.map((p, k) => (signs.includes(k) ? p * (1 + lift) : p));
  const s = w[0] + w[1] + w[2];
  return { signs, p: w.map((x) => x / s) };
}
