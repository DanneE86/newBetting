// GENERERAD av `node scripts/hastar-lar.mjs` – ändra inte för hand. Inlärda vikter för travmodellen.
// Tränad 2026-10-03 på 7127 lopp (2025-01-01 – 2026-10-02), λ = 512.
// Rullande test (tränat före varje månad, testat på månaden): se eval och data/hastar/historik/lararapport.json.
export const LEARNED = {
 "trainedAt": "2026-10-03T06:17:07.633Z",
 "period": {
  "from": "2025-01-01",
  "to": "2026-10-02"
 },
 "races": 7127,
 "lambda": 512,
 "market": 0.9048,
 "weights": {
  "form": -0.0624,
  "fart": 0.0528,
  "kusk": -0.0149,
  "tranare": 0.0563,
  "klass": 0.057,
  "spar": 0.0317,
  "galopp": -0.0299,
  "tillagg": -0.0971,
  "vila": -0.0777,
  "vilaLang": 0.0455,
  "barfota": 0.059,
  "skorAv": 0.0524,
  "skorPa": -0.06,
  "jankare": 0.0358,
  "vagnByte": -0.0111,
  "kuskByte": -0.0098,
  "oddsHist": -0.0129,
  "seger5": -0.0226,
  "plats5": 0.0044,
  "livSeger": 0.0256,
  "alder": -0.0422,
  "sto": -0.0433,
  "rekord": 0.0045,
  "bastKm3": -0.0012,
  "banvana": -0.03,
  "starter60": 0.0112,
  "kuskForm": 0.0091,
  "senast": 0.0212,
  "distByte": -0.0434,
  "metodByte": -0.0145,
  "kmSenast": 0.0066,
  "motstand": 0.011,
  "pengar": 0.0115,
  "sparNr": 0.0034,
  "mktKvadrat": 0.0718
 },
 "eval": {
  "rolling": {
   "months": [
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
    "2026-10"
   ],
   "gammal": {
    "races": 5505,
    "logLoss": 1.672,
    "hitRate": 0.3989,
    "top3Rate": 0.7475
   },
   "marknad": {
    "races": 5505,
    "logLoss": 1.6807,
    "hitRate": 0.3931,
    "top3Rate": 0.7408
   },
   "inlard": {
    "races": 5505,
    "logLoss": 1.6705,
    "hitRate": 0.3989,
    "top3Rate": 0.7448
   }
  }
 }
};
