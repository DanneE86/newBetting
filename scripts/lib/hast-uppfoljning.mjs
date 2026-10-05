// Uppföljning på riktigt för fliken "Hästar": systemen byggs på strecket från SISTA hämtningen före start (inte
// slutstrecket som bakkörningen använder) och rättas mot ATG:s utdelning när omgången är avgjord. Ren logik –
// hämtning och filer i scripts/hastar-auto.mjs.
//
// Tre system per budget:
//   standard   rakt system som webbens förval (defaultAlpha per spelform, högsta rad ≥ 50 000 kr)
//   utdelning  rakt system med högst förväntad utdelning (buildValueSystem)
//   skrall3    reducerat system, utgång 16 × budget, minst 3 hästar under 10 % streck per rad
import { MIN_TOP, TOP_SHARE, rowPrice, defaultAlpha, buildSystem, buildValueSystem, reduceSystem } from "../../gui/public/hast-engine.js";
import { rowsByCorrect, rowsByCorrectList, settle } from "./hast-sasong.mjs";

export const FOLLOW_BUDGETS = [200, 500, 1000];
export const FOLLOW_SYSTEMS = { standard: "Standard (webbens förval)", utdelning: "Utdelning", skrall3: "Skrällsystem ≥ 3 skrällar/rad" };

const legsOf = (a) => a.races.map((r) => ({ leg: r.leg, number: r.number, horses: r.horses }));

/** Bygger och fryser systemen för en analys. Returnerar { id, type, date, frozenAt, price, systems: { namn: { budget: {...} } } }. */
export function freezeSystems(a, { budgets = FOLLOW_BUDGETS, frozenAt = a.fetchedAt || new Date().toISOString(), sims = 2000 } = {}) {
  const legs = legsOf(a);
  const price = rowPrice(a.type, a.date);
  const topShare = TOP_SHARE[a.type] ?? 0.25;
  const alpha = defaultAlpha(a.type);
  const systems = { standard: {}, utdelning: {}, skrall3: {} };
  for (const budget of budgets) {
    const s = buildSystem(legs, { budget, price, alpha, minTop: MIN_TOP, topShare });
    systems.standard[budget] = { kind: "rakt", legs: s.legs.map((l) => l.horses), rows: s.rows, cost: s.cost, hit: s.hit };
    const v = buildValueSystem(legs, { budget, price, minTop: MIN_TOP, topShare, type: a.type, sims });
    systems.utdelning[budget] = { kind: "rakt", legs: v.legs.map((l) => l.horses), rows: v.rows, cost: v.cost, hit: v.hit, evRoi: v.evRoi, alpha: v.alpha, top: v.chosenTop };
    const r = reduceSystem(legs, { minSkrall: 3 }, { budget, price, alpha, expand: 16, minTop: MIN_TOP, topShare });
    systems.skrall3[budget] = { kind: "rader", rows: r.rows, count: r.count, cost: r.cost, hit: r.hit };
  }
  return { id: a.id, type: a.type, date: a.date, track: a.track, frozenAt, price, systems };
}

/** Rättar frysta system mot vinnare per avdelning och ATG:s utdelning. Lägger till .result per system/budget. */
export function settleFrozen(frozen, winners, payouts) {
  const out = structuredClone(frozen);
  for (const sys of Object.values(out.systems))
    for (const s of Object.values(sys)) {
      const counts = s.kind === "rakt" ? rowsByCorrect(s.legs, winners) : rowsByCorrectList(s.rows, winners);
      s.result = settle(counts, payouts, out.price);
    }
  out.winners = winners;
  out.settledAt = new Date().toISOString();
  return out;
}

/** Summering per system och budget över rättade omgångar: { system: { budget: { games, cost, win, roi, hitGames, allRight, biggest } } }. */
export function summarizeFollow(entries) {
  const out = {};
  for (const name of Object.keys(FOLLOW_SYSTEMS)) {
    out[name] = {};
    for (const e of entries) {
      for (const [b, s] of Object.entries(e.systems?.[name] || {})) {
        if (!s.result) continue;
        const t = (out[name][b] ??= { games: 0, cost: 0, win: 0, hitGames: 0, allRight: 0, biggest: null });
        t.games++;
        t.cost += s.result.cost;
        t.win += s.result.win;
        if (s.result.win > 0) t.hitGames++;
        if (s.result.best === e.winners.length) t.allRight++;
        if (!t.biggest || s.result.win > t.biggest.win) t.biggest = { id: e.id, win: s.result.win };
      }
    }
    for (const t of Object.values(out[name])) {
      t.cost = Math.round(t.cost * 100) / 100;
      t.win = Math.round(t.win * 100) / 100;
      t.roi = t.cost > 0 ? t.win / t.cost - 1 : null;
    }
  }
  return out;
}

/**
 * Hämtningstider före ett V-spel: kl. 10 samma dag, 2 h, 45 min och 15 min före första start (ms sedan 1970).
 * Tider som redan passerats före kl. 10-hämtningen tas bort. Används av hastar-auto.mjs.
 */
export function fetchSlots(startMs) {
  const d = new Date(startMs);
  const ten = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0, 0).getTime();
  const slots = [
    { key: "kl10", at: ten },
    { key: "t-120", at: startMs - 120 * 60000 },
    { key: "t-45", at: startMs - 45 * 60000 },
    { key: "t-15", at: startMs - 15 * 60000 },
  ];
  return slots.filter((s) => s.at < startMs && (s.key === "kl10" || s.at > ten));
}

/** Hämtningar som ska göras nu: passerade tider före start som inte redan gjorts. Flera missade tider = en hämtning. */
export function dueSlots(startMs, nowMs, done = []) {
  if (nowMs >= startMs) return [];
  return fetchSlots(startMs).filter((s) => s.at <= nowMs && !done.includes(s.key));
}
