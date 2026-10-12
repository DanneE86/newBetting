// Skräll med värde: 1 eller 2 som inte är oddsfavorit, där ett svenskt bolag betalar minst UPSET_MIN_EV över
// skarpt rätt pris (Pinnacle/Betfair utan marginal). Odds-taket och misstänkt-EV-spärren kommer från omdömet (value).
// Backtest 2026-10-12 (data/matcher 2017-, 54 000 matcher, öppningsodds, bästa pris, odds <= 5, EV 6–25 %):
// 507 skrällar vann 26 %, ROI +5,4 %, slog stängningsoddsen med +5,7 % i snitt och i alla år och ligor.
// EV 3–6 % gav −1,9 / −1,8 % (före / från 2023), skrällar över odds 5 −0,1 / −26,8 %, X med värde ±0 (kryssregeln tar X).
// Alla skrällar utan värde vinner färre än oddsen säger (z −3 / −4). Modellens eget tecken mot oddsen: förkastat.
export const UPSET_MIN_EV = 0.06;
const SHARP = new Set(['pinnacle', 'betfair-exchange']);

/** fair = { home, draw, away } utan marginal, verdicts = pro.verdicts -> { pick, odds, bookmaker, p, ev } | null */
export function findUpset(fair, verdicts, minEv = UPSET_MIN_EV) {
  if (fair?.home == null || fair.draw == null || fair.away == null || !verdicts) return null;
  const fav = ['home', 'draw', 'away'].reduce((a, b) => (fair[b] > fair[a] ? b : a));
  let best = null;
  for (const k of ['home', 'away']) {
    const v = verdicts[k];
    if (k === fav || !v?.value || !SHARP.has(v.fairSource) || !(v.ev >= minEv)) continue;
    if (!best || v.ev > best.ev) best = { pick: v.pick, odds: v.odds, bookmaker: v.bookmaker, p: v.p, ev: v.ev };
  }
  return best;
}
