// 1X2-tipset: tecknet med hogst chans - utom nar krysset ligger nara toppen, da blir tipset X.
// Backtest 2026-10-11 (84 000 matcher, stangningsodds): i matcherna dar X ligger inom 6 %-enheter fran
// favoriten slar X lika ofta som favoriten (33 % mot 34 %) men betalar battre:
// ROI X +5,2 % / +1,9 % mot favorit -5,0 % / -8,8 % (fore 2023 / fran 2023). Traffprocenten totalt oforandrad (50,1 %).
// Genomgang av alla kryssmatcher (2026-10-11, scratch kryss-signal*.mjs): oddsen prissatter kryss nastan exakt.
// Enda tillagget som holl i bada perioderna: Serie B kryssar mer an oddsen (+2,5 / +2,3 enheter) ->
// X i Serie B nar oddsens kryss >= 29 % (X ROI +7 % / +15 % mot favorit -2 % / +3 % i de matcherna).
// Provat och avvisat: saongsfas, tabellage, inbordes, malsnitt, xG, domare, "inget att spela for",
// lagens kryss forra saongen, J-League/League One undantag (vande eller forsamrade i kontrollen).
export const DRAW_MARGIN = 0.06;
export const DRAW_LEAGUES = { SB: 0.29 };

/** probs = { home, draw, away }, league = ligakod -> { pick: '1'|'X'|'2', confidence, drawRule: null|'nara'|'liga' } */
export function pick1x2(probs, league = null, margin = DRAW_MARGIN) {
  const list = [['1', probs.home], ['X', probs.draw], ['2', probs.away]];
  const [top, conf] = [...list].sort((a, b) => b[1] - a[1])[0];
  if (top === 'X' || probs.draw == null) return { pick: top, confidence: conf, drawRule: null };
  if (conf - probs.draw < margin) return { pick: 'X', confidence: probs.draw, drawRule: 'nara' };
  const min = DRAW_LEAGUES[league];
  if (min != null && probs.draw >= min) return { pick: 'X', confidence: probs.draw, drawRule: 'liga' };
  return { pick: top, confidence: conf, drawRule: null };
}
