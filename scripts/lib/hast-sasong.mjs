// Säsongsbakkörning för fliken "Hästar": systembyggarens system (gui/public/hast-engine.js) spelas på varje
// avgjord omgång och rättas mot ATG:s riktiga utdelning. Ren logik – hämtning och filer i scripts/hastar-sasong.mjs.
//
// Säsongsfilen data/hastar/historik/<år>.jsonl.gz: en rad per omgång = normalizeGame(...) (trav-model.mjs),
// alltså alla lopp, alla starter med historik, slutstreck, slutodds, resultat och utdelning (payouts).
import { parsePrize } from "./trav-model.mjs";

/** Lägger loppets förstapris (race.firstPrize) på sparade lopp som saknar det (undefined/null). game: ATG:s spel-svar. */
export function addPrizes(norm, game) {
  const byId = new Map((game?.races || []).map((r) => [r.id, parsePrize(r.prize)]));
  for (const r of norm.races) if (r.firstPrize == null && byId.has(r.id)) r.firstPrize = byId.get(r.id);
  return norm;
}


/** Vinnande startnummer per avdelning (dött lopp ger flera). [[nr, ...], ...] i avdelningsordning. */
export const legWinners = (game) =>
  game.races.map((r) => r.starts.filter((s) => s.result && Number(s.result.place) === 1).map((s) => s.nr));

/** Omgången är avgjord om alla avdelningar har vinnare och utdelningen finns. */
export const isSettled = (game) => !!game.payouts && game.races.length > 0 && legWinners(game).every((w) => w.length > 0);

/**
 * Rakt system: antal rader per antal rätt. sysLegs: [[nr, ...] per avdelning]. Returnerar counts[k] = rader med k rätt.
 * Räknas med genererande funktion: varje avdelning bidrar (fel + rätt·x).
 */
export function rowsByCorrect(sysLegs, winners) {
  let poly = [1];
  sysLegs.forEach((horses, i) => {
    const right = horses.filter((nr) => winners[i]?.includes(nr)).length;
    const wrong = horses.length - right;
    const next = new Array(poly.length + 1).fill(0);
    poly.forEach((c, k) => {
      next[k] += c * wrong;
      next[k + 1] += c * right;
    });
    poly = next;
  });
  return poly;
}

/** Reducerat system (lista av rader): antal rader per antal rätt. */
export function rowsByCorrectList(rows, winners) {
  const counts = new Array(winners.length + 1).fill(0);
  for (const r of rows) counts[r.reduce((a, nr, i) => a + (winners[i]?.includes(nr) ? 1 : 0), 0)]++;
  return counts;
}

/**
 * Rättar ett system mot ATG:s utdelning. payouts: { "8": { payout: öre per rad } | { jackpot: true } ... }.
 * Jackpott/flyttad utdelning = 0 kr. Returnerar { cost, win, net, best (högsta antal rätt), wins: { k: { rows, kr } } }.
 */
export function settle(counts, payouts, price) {
  const rows = counts.reduce((a, b) => a + b, 0);
  const cost = Math.round(rows * price * 100) / 100;
  let win = 0;
  const wins = {};
  for (const [k, v] of Object.entries(payouts || {})) {
    const n = counts[Number(k)] || 0;
    const perRow = v?.payout ? v.payout / 100 : 0;
    if (n && perRow) {
      wins[k] = { rows: n, kr: Math.round(n * perRow * 100) / 100 };
      win += n * perRow;
    }
  }
  let best = 0;
  counts.forEach((c, k) => {
    if (c > 0) best = k;
  });
  win = Math.round(win * 100) / 100;
  return { cost, win, net: Math.round((win - cost) * 100) / 100, best, wins };
}

/** Summering över många omgångar för en budget/variant. results: [{ cost, win, best, legs }]. */
export function summarize(results) {
  const cost = results.reduce((a, r) => a + r.cost, 0);
  const win = results.reduce((a, r) => a + r.win, 0);
  const hits = results.filter((r) => r.win > 0).length;
  const allRight = results.filter((r) => r.best === r.legs).length;
  const biggest = results.reduce((m, r) => (r.win > (m?.win ?? 0) ? r : m), null);
  let run = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const r of results) {
    run += r.win - r.cost;
    peak = Math.max(peak, run);
    maxDrawdown = Math.max(maxDrawdown, peak - run);
  }
  return {
    games: results.length,
    cost: Math.round(cost),
    win: Math.round(win),
    net: Math.round(win - cost),
    roi: cost > 0 ? Math.round(((win - cost) / cost) * 1000) / 1000 : null,
    hitGames: hits,
    allRight,
    biggest: biggest ? { id: biggest.id, win: Math.round(biggest.win) } : null,
    maxDrawdown: Math.round(maxDrawdown),
  };
}
