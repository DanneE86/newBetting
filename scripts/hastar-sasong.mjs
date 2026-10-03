// Säsongsdata + bakkörning av systembyggaren för fliken "Hästar".
//
//   node scripts/hastar-sasong.mjs --hamta                      hämta alla avgjorda V-spel 2026 (återupptar, hoppar över sparade)
//   node scripts/hastar-sasong.mjs --hamta --fran 2026-03-01 --till 2026-03-31 --spel V86,V85,V75,GS75,V64,V65
//   node scripts/hastar-sasong.mjs --bakkor                     spela varje budgetknapp på varje sparad omgång
//   node scripts/hastar-sasong.mjs --bakkor --ar 2026 --modell rullande   (gammal | inlard | rullande, se modelOpts)
//   node scripts/hastar-sasong.mjs --bakkor --alpha 0                         välj hästar efter ren vinstchans (standard 0,5)
//   node scripts/hastar-sasong.mjs --bakkor --topp 1000000                    högsta rad minst 1 milj (alltid minst 50 000)
//   node scripts/hastar-sasong.mjs --bakkor --spel V86,V85,V75,GS75        spelformer som bakkörs (standard)
//
// Alla lopp sparas i EN fil: data/hastar/historik/<år>.jsonl.gz – en rad per omgång (normalizeGame: alla starter,
// historik före loppdagen, slutstreck, slutodds, resultat och ATG:s utdelning per antal rätt).
// Resultat: data/hastar/historik/bakkorning-<år>.json.
//
// Obs: strecken och oddsen är SLUTLIGA, alltså bättre än vad man ser när man lämnar in. Struken häst syns redan
// som struken. Bakkörningen är därför något för snäll mot systemet.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { normalizeGame, analyzeGame } from "./lib/trav-model.mjs";
import { listGames, fetchGame } from "./fetch-hastar.mjs";
import { BUDGETS, ROW_PRICE, TOP_SHARE, MIN_TOP, buildSystem, reduceSystem } from "../gui/public/hast-engine.js";
import { legWinners, isSettled, rowsByCorrect, rowsByCorrectList, settle, summarize } from "./lib/hast-sasong.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "hastar");
const HIST = path.join(DIR, "historik");
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
const addDays = (d, n) => new Date(Date.parse(`${d}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const log = (...a) => console.log(...a);

export const seasonFile = (year) => path.join(HIST, `${year}.jsonl.gz`);

/** Läser säsongsfilen: Map id → normaliserad omgång. */
export function readSeason(year) {
  const f = seasonFile(year);
  const out = new Map();
  if (!fs.existsSync(f)) return out;
  for (const line of zlib.gunzipSync(fs.readFileSync(f)).toString("utf8").split("\n")) {
    if (!line.trim()) continue;
    const g = JSON.parse(line);
    out.set(g.id, g);
  }
  return out;
}

function writeSeason(year, games) {
  fs.mkdirSync(HIST, { recursive: true });
  const sorted = [...games.values()].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const tmp = `${seasonFile(year)}.tmp`;
  fs.writeFileSync(tmp, zlib.gzipSync(sorted.map((g) => JSON.stringify(g)).join("\n") + "\n"));
  // Windows låser filen om den läses samtidigt: försök igen en stund innan vi ger upp
  for (let i = 1; ; i++) {
    try {
      fs.renameSync(tmp, seasonFile(year));
      return;
    } catch (e) {
      if (i >= 20) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250 * i);
    }
  }
}

async function fetchSeason() {
  const year = String(arg("ar") && arg("ar") !== true ? arg("ar") : today().slice(0, 4));
  const from = typeof arg("fran") === "string" ? arg("fran") : `${year}-01-01`;
  const yesterday = addDays(today(), -1);
  const to = typeof arg("till") === "string" ? arg("till") : yesterday < `${year}-12-31` ? yesterday : `${year}-12-31`;
  const types = (typeof arg("spel") === "string" ? arg("spel") : "V86,V85,V75,GS75").split(",").map((s) => s.trim().toUpperCase());
  const games = readSeason(year);
  log(`Säsong ${year}: ${games.size} omgångar sparade sedan tidigare. Hämtar ${types.join("/")} ${from} – ${to} …`);
  let added = 0;
  let unsaved = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const list = await listGames(d).catch((e) => (log(`  ${d}: kalender saknas (${e.message})`), null));
    for (const g of list?.games || []) {
      if (!types.includes(g.type) || g.status !== "results" || games.has(g.id)) continue;
      try {
        const rawFile = path.join(DIR, "raw", `${g.id}.json`);
        const raw = fs.existsSync(rawFile) ? JSON.parse(fs.readFileSync(rawFile, "utf8")).main : null;
        const src = raw && raw.game?.status === "results" ? raw : await fetchGame(g.id);
        const norm = normalizeGame(src.game, src.details);
        if (!isSettled(norm)) {
          log(`  ${g.id}: saknar resultat eller utdelning – hoppar över`);
          continue;
        }
        games.set(g.id, norm);
        added++;
        unsaved++;
        log(`  ${g.id} (${g.track}) sparad`);
        if (unsaved >= 5) {
          writeSeason(year, games);
          unsaved = 0;
        }
      } catch (e) {
        log(`  ${g.id}: fel – ${e.message}`);
      }
    }
  }
  writeSeason(year, games);
  log(`Klart: ${added} nya, ${games.size} omgångar i data/hastar/historik/${year}.jsonl.gz`);
}

/** Spelar varje budget på varje omgång. Varianter: rakt (som knapparna), reducerat (utgång 4×, inga villkor), streck (folkets system). */
export function runBacktest(games, { budgets = BUDGETS, alpha = 0.5, minTop = MIN_TOP, optsFor = () => ({}) } = {}) {
  const variants = ["rakt", "reducerat", "streck"];
  const perGame = [];
  for (const game of games) {
    const a = analyzeGame(game, null, optsFor(game));
    const price = ROW_PRICE[game.type] ?? 1;
    const legs = a.races.map((r) => ({ leg: r.leg, number: r.number, horses: r.horses }));
    const mktLegs = a.races.map((r) => ({ leg: r.leg, number: r.number, horses: r.horses.map((h) => ({ ...h, p: h.marketPct })) }));
    const winners = legWinners(game);
    const row = { id: game.id, type: game.type, date: game.date, track: game.track, turnover: game.turnover, legs: winners.length, winners, payouts: game.payouts, by: {} };
    for (const budget of budgets) {
      const topShare = TOP_SHARE[game.type] ?? 0.25;
      const s = buildSystem(legs, { budget, price, alpha, minTop, topShare });
      const sysLegs = s.legs.map((l) => l.horses);
      const rakt = { ...settle(rowsByCorrect(sysLegs, winners), game.payouts, price), system: sysLegs };
      const r = reduceSystem(legs, {}, { budget, price, alpha, expand: 4, minTop, topShare });
      const red = settle(rowsByCorrectList(r.rows, winners), game.payouts, price);
      const m = buildSystem(mktLegs, { budget, price, alpha: 0, minTop, topShare });
      const mk = settle(rowsByCorrect(m.legs.map((l) => l.horses), winners), game.payouts, price);
      row.by[budget] = { rakt, reducerat: red, streck: mk };
    }
    perGame.push(row);
  }
  const summary = {};
  for (const v of variants) {
    summary[v] = {};
    for (const b of budgets) {
      const res = perGame.map((g) => ({ id: g.id, legs: g.legs, ...g.by[b][v] }));
      summary[v][b] = { all: summarize(res) };
      for (const t of [...new Set(perGame.map((g) => g.type))]) summary[v][b][t] = summarize(res.filter((x) => perGame.find((g) => g.id === x.id).type === t));
    }
  }
  return { variants, budgets, summary, games: perGame };
}

/**
 * Modellval för bakkörningen: "gammal" (handsatta vikter), "inlard" (trav-weights.mjs – tränad på hela datan, alltså
 * facit med i träningen) eller "rullande" (för varje månad tränas vikterna bara på lopp FÖRE månaden – den ärliga).
 */
async function modelOpts(kind, year) {
  if (kind === "gammal") return () => ({ learned: false });
  if (kind !== "rullande") return () => ({});
  const { loadSeasons } = await import("./hastar-lar.mjs");
  const { buildRows, fitLogit, FEATURE_KEYS } = await import("./lib/trav-features.mjs");
  const { postTable } = await import("./lib/trav-model.mjs");
  const rap = path.join(HIST, "lararapport.json");
  const lambda = fs.existsSync(rap) ? JSON.parse(fs.readFileSync(rap, "utf8")).lambda : 128;
  const rows = buildRows(loadSeasons(), { postTable });
  const cache = new Map();
  return (game) => {
    const m = game.date.slice(0, 7);
    if (!cache.has(m)) {
      const train = rows.filter((r) => r.date < m);
      if (train.length < 1500) cache.set(m, { learned: false });
      else {
        const b = fitLogit(train, FEATURE_KEYS, { lambda, iters: 300 });
        cache.set(m, { learned: { market: b.market, weights: Object.fromEntries(FEATURE_KEYS.map((k) => [k, b[k]])) } });
        log(`  vikter för ${m}: tränade på ${train.length} lopp före månaden`);
      }
    }
    return cache.get(m);
  };
}

async function backtestSeason() {
  const year = String(arg("ar") && arg("ar") !== true ? arg("ar") : today().slice(0, 4));
  const types = (typeof arg("spel") === "string" ? arg("spel") : "V86,V85,V75,GS75").split(",").map((s) => s.trim().toUpperCase());
  const kind = typeof arg("modell") === "string" ? arg("modell") : "inlard";
  // alpha: hur mycket spelvärde väger när hästar väljs (0 = ren vinstchans/högst träff, 0,5 = knapparnas standard)
  const alpha = typeof arg("alpha") === "string" ? Number(arg("alpha")) : 0.5;
  // Högsta rad-spärr (kr vid alla rätt), aldrig under MIN_TOP
  const minTop = Math.max(MIN_TOP, typeof arg("topp") === "string" ? Number(arg("topp")) : MIN_TOP);
  const games = [...readSeason(year).values()].filter((g) => isSettled(g) && types.includes(g.type));
  if (!games.length) throw new Error(`Ingen säsongsdata för ${year} – kör --hamta först`);
  log(`Bakkör ${games.length} omgångar (${year}, ${types.join("/")}) × ${BUDGETS.length} budgetar, modell: ${kind} …`);
  const optsFor = await modelOpts(kind, year);
  const out = { updatedAt: new Date().toISOString(), year: Number(year), model: kind, note: "Slutstreck och slutodds används – något för snällt mot systemet.", alpha, minTop, ...runBacktest(games, { optsFor, alpha, minTop }) };
  const f = path.join(HIST, `bakkorning-${year}${kind === "inlard" ? "" : `-${kind}`}${alpha === 0.5 ? "" : `-alpha${alpha}`}${minTop === MIN_TOP ? "" : `-topp${minTop}`}.json`);
  fs.writeFileSync(f, JSON.stringify(out, null, 1));
  const kr = (x) => `${Math.round(x).toLocaleString("sv-SE")} kr`;
  for (const v of out.variants) {
    log(`\n${v.toUpperCase()}`);
    log("Budget   | Insats      | Vinst       | Netto        | ROI     | Omg m vinst | Alla rätt | Största vinst");
    for (const b of out.budgets) {
      const s = out.summary[v][b].all;
      log(
        `${String(b).padStart(5)} kr | ${kr(s.cost).padStart(11)} | ${kr(s.win).padStart(11)} | ${kr(s.net).padStart(12)} | ${((s.roi ?? 0) * 100).toFixed(1).padStart(6)} % | ${String(s.hitGames).padStart(4)}/${s.games}    | ${String(s.allRight).padStart(9)} | ${s.biggest ? `${kr(s.biggest.win)} (${s.biggest.id})` : "—"}`,
      );
    }
  }
  log(`\nSparat: ${path.relative(ROOT, f)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  (arg("hamta") ? fetchSeason() : arg("bakkor") ? backtestSeason() : Promise.reject(new Error("Ange --hamta eller --bakkor")))
    .catch((e) => {
      console.error(e.message || e);
      process.exit(1);
    });
