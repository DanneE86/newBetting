// Fliken "Hästar": hämtar V75/V85/V86/V64/V65/GS75/Dagens Dubbel från ATG:s öppna racinginfo-API och analyserar.
//
//   node scripts/fetch-hastar.mjs                         dagens största V-spel (+ DD samma bana)
//   node scripts/fetch-hastar.mjs --datum 2026-10-03 --spel V85
//   node scripts/fetch-hastar.mjs --id V85_2026-10-03_11_5
//   node scripts/fetch-hastar.mjs --lista --datum 2026-10-03   lista dagens spel (JSON)
//   node scripts/fetch-hastar.mjs --analys --id <spel-id>      analysera om sparad rådata, ingen hämtning
//   node scripts/fetch-hastar.mjs --resultat                   hämta resultat för sparade analyser + backtest
//   node scripts/fetch-hastar.mjs --backtest 8                 analysera de senaste 8 veckornas avgjorda V-spel
//
// Allt som hämtas sparas i EN fil per omgång: data/hastar/raw/<spel-id>.json (kalender, spel, DD, alla starter).
// Analys: data/hastar/analys/<spel-id>.json. Senaste + lista: data/hastar/index.json. Backtest: data/hastar/backtest.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeGame, analyzeGame, backtest, resultsOf } from "./lib/trav-model.mjs";
import { logTips, settleTips, hastRecords } from "./lib/tipslogg.mjs";

/** Tipslogg (data/tipslogg/hastar): loppen före start sparas, facit ur analysens resultat. */
async function tipslogg(a) {
  const c = logTips("hastar", hastRecords(a));
  const n = a.results
    ? await settleTips("hastar", (rec) => (rec.game === a.id && a.results[rec.race]?.length ? { winners: a.results[rec.race] } : null))
    : 0;
  if (c.ny || c.andrad || n) log(`Tipslogg: ${c.ny} nya lopp, ${c.andrad} ändrade, facit för ${n}`);
}


const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "hastar");
const API = "https://www.atg.se/services/racinginfo/v1/api";
export const GAME_TYPES = ["V86", "V85", "V75", "GS75", "V65", "V64", "dd"];

const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
const log = (...a) => console.log(...a);
const readJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);
const writeJson = (f, o) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(o, null, 1));
};

async function get(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 betting-ny" } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= tries) throw new Error(`${url}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 800 * i));
    }
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

/** Dagens spel: [{ id, type, track, status, startTime }]. */
export async function listGames(date) {
  const cal = await get(`${API}/calendar/day/${date}`);
  const tracks = Object.fromEntries((cal?.tracks || []).map((t) => [t.id, t.name]));
  const out = [];
  for (const type of GAME_TYPES)
    for (const g of cal?.games?.[type] || []) {
      const trackId = Number(String(g.id).split("_")[2]);
      out.push({ id: g.id, type, track: tracks[trackId] || null, status: g.status, startTime: g.startTime || null });
    }
  return { date, games: out, calendar: cal };
}

export async function fetchGame(id) {
  const game = await get(`${API}/games/${id}`);
  if (!game) throw new Error(`Spelet ${id} finns inte`);
  const jobs = game.races.flatMap((r) => r.starts.map((s) => ({ raceId: r.id, nr: s.number })));
  const details = {};
  await pool(jobs, 6, async (j) => {
    details[`${j.raceId}_${j.nr}`] = await get(`${API}/races/${j.raceId}/start/${j.nr}`).catch((e) => ({ error: e.message }));
  });
  return { game, details };
}

/** Hämtar spelet (+ DD samma dag och bana) och sparar ALLT i en rådatafil. */
async function fetchAll(id, calendarEntry) {
  log(`Hämtar ${id} …`);
  const main = await fetchGame(id);
  let dd = null;
  const [type, date, trackId] = id.split("_");
  if (type !== "dd") {
    const list = calendarEntry || (await listGames(date));
    const ddId = list.games.find((g) => g.type === "dd" && g.id.split("_")[2] === trackId)?.id;
    if (ddId) {
      log(`Hämtar ${ddId} …`);
      dd = await fetchGame(ddId);
    }
  }
  const raw = { fetchedAt: new Date().toISOString(), source: API, id, main, dd };
  writeJson(path.join(DIR, "raw", `${id}.json`), raw);
  log(`Rådata sparad: data/hastar/raw/${id}.json`);
  return raw;
}

async function analyzeRaw(raw) {
  const game = normalizeGame(raw.main.game, raw.main.details);
  const ddGame = raw.dd ? normalizeGame(raw.dd.game, raw.dd.details) : null;
  const analysis = { ...analyzeGame(game, ddGame), fetchedAt: raw.fetchedAt, analyzedAt: new Date().toISOString() };
  const results = resultsOf(raw.main.game);
  if (raw.dd) Object.assign(results, resultsOf(raw.dd.game));
  if (Object.keys(results).length) analysis.results = results;
  writeJson(path.join(DIR, "analys", `${raw.id}.json`), analysis);
  updateIndex(analysis);
  await tipslogg(analysis);
  log(`Analys sparad: data/hastar/analys/${raw.id}.json (${analysis.races.length} lopp)`);
  return analysis;
}

function updateIndex(a) {
  const f = path.join(DIR, "index.json");
  const idx = readJson(f) || { latest: null, analyses: [] };
  idx.analyses = [{ id: a.id, type: a.type, date: a.date, track: a.track, analyzedAt: a.analyzedAt }, ...idx.analyses.filter((x) => x.id !== a.id)]
    .sort((x, y) => (y.date || "").localeCompare(x.date || "") || (x.type || "").localeCompare(y.type || ""));
  if (!a.backtestOnly) idx.latest = a.id;
  writeJson(f, idx);
}

/** Resultat för sparade analyser vars spel är avgjorda, sedan backtest över allt. */
async function updateResults() {
  const dir = path.join(DIR, "analys");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
  const entries = [];
  for (const f of files) {
    const a = readJson(path.join(dir, f));
    if (!a.results && a.date < today()) {
      const g = await get(`${API}/games/${a.id}`).catch(() => null);
      const res = g ? resultsOf(g) : {};
      if (a.dd && a.type !== "dd") {
        const [, date, trackId] = a.id.split("_");
        const list = await listGames(date).catch(() => ({ games: [] }));
        const ddId = list.games.find((x) => x.type === "dd" && x.id.split("_")[2] === trackId)?.id;
        if (ddId) Object.assign(res, resultsOf((await get(`${API}/games/${ddId}`).catch(() => null)) || {}));
      }
      if (Object.keys(res).length) {
        a.results = res;
        writeJson(path.join(dir, f), a);
        await tipslogg(a);
        log(`Resultat: ${a.id}`);
      }
    }
    if (a.results) entries.push({ analysis: a, results: a.results });
  }
  const bt = { updatedAt: new Date().toISOString(), ...backtest(entries) };
  writeJson(path.join(DIR, "backtest.json"), bt);
  log(`Backtest: ${bt.games} omgångar, ${bt.races} lopp. Modellens logloss ${bt.logLoss} mot marknadens ${bt.marketLogLoss}.`);
  return bt;
}

/** Historisk backtest: avgjorda V-spel de senaste N veckorna (odds/streck = slutliga, historik före loppdagen). */
async function historicBacktest(weeks) {
  const days = [];
  for (let i = 1; i <= weeks * 7; i++) days.push(new Date(Date.now() - i * 86400000).toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" }));
  for (const d of days) {
    const list = await listGames(d).catch(() => null);
    const g = list?.games.find((x) => ["V86", "V85", "V75", "GS75"].includes(x.type) && x.status === "results");
    if (!g) continue;
    if (fs.existsSync(path.join(DIR, "analys", `${g.id}.json`))) continue;
    const raw = await fetchAll(g.id, list);
    const a = await analyzeRaw(raw);
    a.backtestOnly = true;
    writeJson(path.join(DIR, "analys", `${g.id}.json`), a);
  }
  return updateResults();
}

async function main() {
  const date = arg("datum") && arg("datum") !== true ? arg("datum") : today();
  if (arg("lista")) {
    const { games } = await listGames(date);
    console.log(JSON.stringify({ date, games }));
    return;
  }
  if (arg("resultat")) return updateResults();
  if (arg("backtest")) return historicBacktest(Number(arg("backtest")) || 8);
  let id = typeof arg("id") === "string" ? arg("id") : null;
  if (arg("analys")) {
    id ||= readJson(path.join(DIR, "index.json"))?.latest;
    const raw = id && readJson(path.join(DIR, "raw", `${id}.json`));
    if (!raw) throw new Error(`Ingen sparad rådata för ${id || "senaste"} – tryck Hämta data först`);
    await analyzeRaw(raw);
    return;
  }
  let list = null;
  if (!id) {
    list = await listGames(date);
    const want = typeof arg("spel") === "string" ? arg("spel").toLowerCase() : null;
    const g = want ? list.games.find((x) => x.type.toLowerCase() === want) : GAME_TYPES.map((t) => list.games.find((x) => x.type === t)).find(Boolean);
    if (!g) throw new Error(`Inget ${want ? arg("spel") : "V75/V85/V86/V64/V65/DD"}-spel ${date}`);
    id = g.id;
  }
  await analyzeRaw(await fetchAll(id, list));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
