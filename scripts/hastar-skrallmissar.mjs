// Skrällmissar för hästarna: varför missar systemet vinnarna, var låg de i modellen och var det för många hästar?
//
//   node scripts/hastar-skrallmissar.mjs --cache        ärliga chanser per häst (tränat bara på åren FÖRE teståret)
//                                                        för V85/V75/V86/GS75 2023–2026 → historik/skrallmissar-cache.json.gz
//   node scripts/hastar-skrallmissar.mjs --analys       bygger systemen (storvinst + träff, 500/1000/2000 kr) på cachen,
//                                                        sparar varje avdelning och varje missad vinnare → historik/skrallmissar.json
//
// Två modeller i cachen: "ren" = ren data (inga streck/odds, som GUI:t sedan 2026-10-13) och "mkt" = streck + faktorer
// (gamla läget). Båda tränade per år på åren före (λ från lararapport.json), alltså inget facit i chansen.
// Strecket är slutstrecket – något för snällt mot systemet (samma som hastar-sasong.mjs --bakkor).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HIST = path.join(ROOT, "data", "hastar", "historik");
const CACHE = path.join(HIST, "skrallmissar-cache.json.gz");
const args = process.argv.slice(2);
const has = (k) => args.includes(`--${k}`);
const log = (...a) => console.log(...a);
export const TYPES = ["V85", "V75", "V86", "GS75"];
export const YEARS = ["2023", "2024", "2025", "2026"];

const r4 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10000) / 10000);

async function buildCache() {
  const { loadSeasons } = await import("./hastar-lar.mjs");
  const { withLopp } = await import("./hastar-lopp.mjs");
  const { buildRows, fitLogit, probs, FEATURE_KEYS } = await import("./lib/trav-features.mjs");
  const { postTable } = await import("./lib/trav-model.mjs");
  const { isSettled, legWinners } = await import("./lib/hast-sasong.mjs");
  const MARKET_KEYS = ["mktKvadrat", "ibScore", "oddsHist", "favLev"];
  const DATA_KEYS = FEATURE_KEYS.filter((k) => !MARKET_KEYS.includes(k));
  const t0 = Date.now();
  const games = withLopp(loadSeasons());
  log(`${games.length} omgångar inlästa (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  const rows = buildRows(games, { postTable, withMarketOnly: false });
  const byId = new Map(rows.map((r) => [r.id, r]));
  log(`${rows.length} lopp`);
  const rap = path.join(HIST, "lararapport.json");
  const lambda = fs.existsSync(rap) ? JSON.parse(fs.readFileSync(rap, "utf8")).lambda : 128;
  const pr = new Map(); // lopp-id → { ren: [p], mkt: [p] }
  const betas = {};
  for (const y of YEARS) {
    const train = rows.filter((r) => r.date < y);
    const test = rows.filter((r) => r.date.startsWith(y));
    const t1 = Date.now();
    const bRen = fitLogit(train, DATA_KEYS, { lambda, iters: 300, market: "none" });
    const bMkt = fitLogit(train.filter((r) => r.hasMarket), FEATURE_KEYS, { lambda, iters: 300, market: "lq" });
    betas[y] = { ren: bRen, mkt: bMkt };
    for (const r of test) pr.set(r.id, { ren: probs(r, bRen, DATA_KEYS, "none"), mkt: r.hasMarket ? probs(r, bMkt, FEATURE_KEYS, "lq") : null });
    log(`${y}: tränat på ${train.length} lopp, ${test.length} testlopp (${((Date.now() - t1) / 1000).toFixed(0)} s)`);
  }
  const out = [];
  for (const g of games) {
    if (!TYPES.includes(g.type) || !YEARS.includes(g.date.slice(0, 4)) || !isSettled(g)) continue;
    const winners = legWinners(g);
    const legs = g.races.map((race, i) => {
      const row = byId.get(race.id);
      const p = pr.get(race.id);
      if (!row || !p) return null;
      const live = race.starts.filter((s) => !s.scratched);
      const sSum = live.reduce((a, s) => a + (s.streck || 0), 0);
      const horses = row.nrs.map((nr, j) => {
        const s = live.find((x) => x.nr === nr);
        const z = Object.fromEntries(DATA_KEYS.map((k) => [k, r4(row.X[k][j])]));
        return {
          nr, horse: s.horse, post: s.post, distance: s.distance, driver: s.driver, trainer: s.trainer, father: s.father ?? null,
          pRen: r4(p.ren[j]), pMkt: p.mkt ? r4(p.mkt[j]) : null, streck: sSum > 0 ? r4((s.streck || 0) / sSum) : null,
          odds: s.result?.finalOdds ?? s.odds ?? null, avgOdds5: s.avgOdds5 ?? null,
          place: s.result?.place ?? null, finishOrder: s.result?.finishOrder ?? null, z,
        };
      });
      return { leg: race.leg ?? i + 1, raceId: race.id, startMethod: race.startMethod, distance: race.distance, n: horses.length, winners: winners[i], horses };
    });
    if (legs.some((l) => !l)) continue;
    out.push({ id: g.id, type: g.type, date: g.date, track: g.track, turnover: g.turnover, payouts: g.payouts, legs });
  }
  fs.writeFileSync(CACHE, zlib.gzipSync(JSON.stringify({ createdAt: new Date().toISOString(), lambda, keys: DATA_KEYS, betas, games: out })));
  log(`Sparat ${out.length} omgångar → ${path.relative(ROOT, CACHE)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}

export const readCache = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(CACHE)).toString("utf8"));

/** Rang (1 = högst) per häst efter fältet key, inom avdelningen. null-värden sist. */
export function ranks(horses, key) {
  const order = [...horses].sort((a, b) => (b[key] ?? -1) - (a[key] ?? -1));
  return new Map(order.map((h, i) => [h.nr, i + 1]));
}

/**
 * Klassar en avdelning i ett system. sysNrs: startnummer i systemet, winners: vinnande nr, rank: Map nr → modellrang.
 * miss_typ: null (träff), "spik föll" (en häst), "precis utanför" (vinnaren 1–2 platser under sista med),
 * "mittfält" (rang ≤ 6) eller "långt ner".
 */
export function classifyLeg(sysNrs, winners, rank) {
  const med = winners.some((w) => sysNrs.includes(w));
  const wRank = Math.min(...winners.map((w) => rank.get(w) ?? 99));
  const last = Math.max(...sysNrs.map((nr) => rank.get(nr) ?? 99));
  // Hästar i systemet rankade under vinnaren: de behövdes inte för att ta vinnaren (när den togs)
  const overflodiga = med ? sysNrs.filter((nr) => (rank.get(nr) ?? 99) > wRank).length : null;
  let typ = null;
  if (!med) typ = sysNrs.length === 1 ? "spik föll" : wRank <= last + 2 ? "precis utanför" : wRank <= 6 ? "mittfält" : "långt ner";
  return { med, wRank, last, overflodiga, typ };
}

const pct = (x) => (x == null ? "–" : `${(x * 100).toFixed(1)} %`);
const kr = (x) => `${Math.round(x).toLocaleString("sv-SE")} kr`;

/**
 * Bygger systemen för en omgång. pOf(h, leg, game) → chans som används (standard: ren data). Returnerar
 * { [system]: { [budget]: { sysLegs, res } } }.
 */
export async function playGame(game, { pOf = (h) => h.pRen, budgets = [500, 1000, 2000], systems = ["storvinst", "traff"], buildOpts = {} } = {}) {
  const E = await import("../gui/public/hast-engine.js");
  const S = await import("./lib/hast-sasong.mjs");
  const price = E.rowPrice(game.type, game.date);
  const topShare = E.TOP_SHARE[game.type] ?? 0.25;
  const legs = game.legs.map((l) => ({ leg: l.leg, number: l.leg, horses: l.horses.map((h) => ({ nr: h.nr, p: pOf(h, l, game), marketPct: h.streck, scratched: false })) }));
  // Normalisera chansen inom avdelningen (varianter kan ge osummerade vikter)
  for (const l of legs) {
    const s = l.horses.reduce((a, h) => a + (h.p || 0), 0);
    if (s > 0) for (const h of l.horses) h.p = (h.p || 0) / s;
  }
  const winners = game.legs.map((l) => l.winners);
  const out = {};
  for (const sys of systems) {
    out[sys] = {};
    for (const budget of budgets) {
      const o = { budget, price, minTop: E.MIN_TOP, topShare, ...buildOpts };
      const s = sys === "storvinst" ? E.buildBigSystem(legs, o) : E.buildSystem(legs, { ...o, alpha: 0 });
      const sysLegs = s.legs.map((l) => l.horses);
      out[sys][budget] = { sysLegs, res: S.settle(S.rowsByCorrect(sysLegs, winners), game.payouts, price) };
    }
  }
  return out;
}

/** Spelar omgångarna parallellt (en arbetstråd per kärna). Returnerar Map id → playGame-resultat. */
async function playAll(games, opts) {
  const N = Math.max(1, Math.min(games.length, os.cpus().length - 2));
  const chunks = Array.from({ length: N }, (_, i) => games.filter((_, j) => j % N === i));
  const parts = await Promise.all(
    chunks.map((ch) => new Promise((res, rej) => {
      const w = new Worker(fileURLToPath(import.meta.url), { workerData: { skrallmissar: true, games: ch, opts } });
      w.on("message", res);
      w.on("error", rej);
    })),
  );
  return new Map(parts.flat());
}

async function analys() {
  const cache = readCache();
  const t0 = Date.now();
  const S = await import("./lib/hast-sasong.mjs");
  const budgets = [500, 1000, 2000];
  const systems = ["storvinst", "traff"];
  const avd = [];
  const missade = new Map();
  const perGame = [];
  const all = await playAll(cache.games, { budgets, systems });
  log(`${cache.games.length} omgångar spelade (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  for (const g of cache.games) {
    const played = all.get(g.id);
    perGame.push({ id: g.id, type: g.type, date: g.date, legs: g.legs.length, by: Object.fromEntries(systems.map((s) => [s, Object.fromEntries(budgets.map((b) => [b, { ...played[s][b].res, system: played[s][b].sysLegs }]))])) });
    g.legs.forEach((l, i) => {
      const rRen = ranks(l.horses, "pRen");
      const rMkt = ranks(l.horses, "pMkt");
      const rStr = ranks(l.horses, "streck");
      const w = l.horses.find((h) => l.winners.includes(h.nr));
      if (!w) return;
      for (const sys of systems) {
        for (const b of budgets) {
          const nrs = played[sys][b].sysLegs[i];
          const c = classifyLeg(nrs, l.winners, rRen);
          avd.push({
            spel_id: g.id, spelform: g.type, datum: g.date, bana: g.track, avdelning: l.leg, system: sys, budget_kr: b,
            hastar_i_lopp: l.n, hastar_i_systemet: nrs.length, spik: nrs.length === 1 ? 1 : 0,
            vinnare_nr: w.nr, vinnare_hast: w.horse, vinnare_streck: w.streck, vinnare_odds: w.odds,
            vinnare_chans_ren: w.pRen, vinnare_rank_ren: rRen.get(w.nr), vinnare_rank_streck: rStr.get(w.nr),
            vinnare_chans_mkt: w.pMkt, vinnare_rank_mkt: w.pMkt == null ? null : rMkt.get(w.nr),
            med_i_systemet: c.med ? 1 : 0, miss_typ: c.typ, sista_med_rank_ren: c.last, overflodiga_hastar: c.overflodiga,
          });
          if (!c.med && sys === "storvinst" && b === 1000) {
            const key = `${g.id}|${l.leg}`;
            missade.set(key, {
              spel_id: g.id, spelform: g.type, datum: g.date, avdelning: l.leg, startnummer: w.nr, hast: w.horse, kusk: w.driver, tranare: w.trainer, far: w.father,
              spar: w.post, distans: w.distance, startmetod: l.startMethod, hastar_i_lopp: l.n, streck: w.streck, odds: w.odds,
              chans_ren: w.pRen, rank_ren: rRen.get(w.nr), chans_mkt: w.pMkt, rank_mkt: w.pMkt == null ? null : rMkt.get(w.nr), rank_streck: rStr.get(w.nr),
              hastar_i_systemet: nrs.length, sista_med_rank_ren: c.last, borde_rank: c.last, miss_typ: c.typ,
              system_hastar: nrs.join(","),
              skal: [
                nrs.length === 1 ? `spiken (${nrs[0]}) föll` : `${nrs.length} hästar med, vinnaren var ren datas ${rRen.get(w.nr)}:a (sista med var ${c.last}:a)`,
                `streck ${pct(w.streck)} (folkets ${rStr.get(w.nr)}:a)`,
                w.pMkt != null ? `marknadsmodellen hade den ${rMkt.get(w.nr)}:a (${pct(w.pMkt)})` : null,
              ].filter(Boolean).join(" · "),
              z: w.z,
            });
          }
        }
      }
    });
  }
  const summary = {};
  for (const sys of systems) for (const b of budgets) {
    const res = perGame.map((x) => ({ id: x.id, legs: x.legs, ...x.by[sys][b] }));
    summary[`${sys}-${b}`] = { alla: S.summarize(res), ...Object.fromEntries(TYPES.map((t) => [t, S.summarize(res.filter((r, i) => perGame[i].type === t))])) };
  }
  const f = path.join(HIST, "skrallmissar.json");
  fs.writeFileSync(f, JSON.stringify({ updatedAt: new Date().toISOString(), note: "Ärlig ren data-modell (tränad per år på åren före), slutstreck. Systemen: storvinst (förval) och träff (alpha 0), spärr 50 000 kr, 2 spikar.", summary, avdelningar: avd, missade_hastar: [...missade.values()] }));
  log(`Sparat ${avd.length} avdelningsrader och ${missade.size} missade vinnare → ${path.relative(ROOT, f)}`);
  // Kort sammanfattning
  for (const [k, v] of Object.entries(summary)) log(`${k.padEnd(15)} ROI ${pct(v.alla.roi)}  vinst i ${v.alla.hitGames}/${v.alla.games}  alla rätt ${v.alla.allRight}  största ${v.alla.biggest ? kr(v.alla.biggest.win) : "–"}  V85 ROI ${pct(v.V85.roi)} (${v.V85.games} omg)`);
}

if (!isMainThread && workerData?.skrallmissar) {
  const out = [];
  for (const g of workerData.games) out.push([g.id, await playGame(g, workerData.opts)]);
  parentPort.postMessage(out);
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const run = has("cache") ? buildCache() : has("analys") ? analys() : Promise.reject(new Error("Ange --cache eller --analys"));
  run.catch((e) => {
    console.error(e.stack || e);
    process.exit(1);
  });
}
