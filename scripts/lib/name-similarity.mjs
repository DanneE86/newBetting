// Lagnamnslikhet mellan odds, spelschema och tips (pro-layer.mjs).
//   nameSimilarity('Nott\'m Forest', 'Nottingham Forest') -> 1, nameSimilarity('Hapoel Be\'er Sheva', 'Benfica') -> 0
import { TEAM_ALIASES } from './team-aliases.mjs';

// Korta delar runt apostrof slas ihop ("Be'er" -> "beer"), annars blev det "be" + "er" och "be" prefixmatchade "Benfica"
// (Omonoia-Benfica kopplades till Union SG-Hapoel Be'er i schemat och forsvann ur tipsen 22/10 2026).
// Langre delar delas som forut: "Nott'm" -> "nott" ~ "nottingham".
export function normName(s) {
  return String(TEAM_ALIASES[s] ?? s).replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/å/gi, 'a').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\b([a-z]{1,2})['’`]([a-z]{1,2})\b/g, '$1$2')
    .replace(/\b(fc|afc|cf|sc|ac|ss|as|us|ssc|rc|rcd|cd|ud|sd|sv|vfb|vfl|tsg|bv|fk|1\.|club|de|calcio|hotspur)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
}

/**
 * 0..1: andel ord som matchar (prefix racker, t.ex. "nott" ~ "nottingham"), matt at bada hallen
 * sa att "U. Catolica" ~ "Universidad Catolica (CHI)" ger samma poang oavsett ordning.
 */
export function nameSimilarity(a, b) {
  const A = normName(a);
  const B = normName(b);
  if (!A.length || !B.length) return 0;
  const share = (X, Y) => X.filter((w) => Y.some((v) => v.startsWith(w) || w.startsWith(v))).length / X.length;
  return Math.max(share(A, B), share(B, A));
}
