// Hela fältets resultat i hästarnas tidigare lopp (ATG:s öppna racinginfo-API), för fliken "Hästar".
//
//   node scripts/hastar-lopp.mjs --hamta                 hämta loppen bakom de 3 senaste starterna för alla hästar i
//                                                        säsongsfilerna (återupptar, hoppar över klara tävlingsdagar)
//   node scripts/hastar-lopp.mjs --hamta --starter 5 --fran 2023-01-01 --samtidigt 3
//   node scripts/hastar-lopp.mjs --status                hur mycket som är hämtat
//
// Historiken saknar lopp-id för tidigare starter, så loppet hittas via dagens kalender (datum + bana → lopp-id) och
// loppen på banan hämtas i tur och ordning tills alla sökta hästar är hittade.
// Sparas lokalt (versioneras inte, se .gitignore): data/hastar/historik/lopp.jsonl (ett lopp per rad, compactRace)
// och data/hastar/historik/lopp-klara.txt (klara tävlingsdagar "datum|bana").
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request, sleep } from "./lib/http.mjs";
import { compactRace, indexRaces, normName, attachFieldInfo } from "./lib/hast-lopp.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HIST = path.join(ROOT, "data", "hastar", "historik");
export const LOPP_FILE = path.join(HIST, "lopp.jsonl");
const DONE_FILE = path.join(HIST, "lopp-klara.txt");
const API = "https://www.atg.se/services/racinginfo/v1/api";
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const log = (...a) => console.log(...a);
const PAUSE_MS = 150;

const get = (url) =>
  request(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 betting-ny" }, retries: 3, retryDelayMs: 2000, label: "ATG lopp" }).catch((e) => {
    if (e.status === 404 || e.status === 500) return null;
    throw e;
  });

/** Alla sparade lopp (compactRace). */
export function readRaces(file = LOPP_FILE) {
  if (!fs.existsSync(file)) return [];
  const out = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      /* avbruten rad vid krasch */
    }
  }
  return out;
}

/** Index "datum|bana" → [lopp] över allt som är hämtat (tomt om inget hämtats). */
export const loppIndex = (file = LOPP_FILE) => indexRaces(readRaces(file));

/** Lägger fältinfo (efter, falt, motFalt, galopp) på tidigare starter i omgångarna, om loppdata finns. */
export function withLopp(games, file = LOPP_FILE) {
  if (!fs.existsSync(file)) return games;
  const n = attachFieldInfo(games, loppIndex(file));
  log(`Loppdata: fältinfo på ${n} tidigare starter`);
  return games;
}

/** Hämtar ett lopp-id direkt (skarpt läge: tidigare starter har lopp-id). null om det saknas. */
export async function fetchRace(id, trackName) {
  const r = await get(`${API}/races/${id}`);
  return r?.starts ? compactRace(r, trackName || r.track?.name) : null;
}

/** Tävlingsdagar som behövs: "datum|bana" → Set(häst-id eller namn). */
function neededDays(games, maxRecs, from) {
  const need = new Map();
  for (const g of games)
    for (const race of g.races)
      for (const s of race.starts)
        for (const r of (s.records || []).filter((x) => !x.scratched).slice(0, maxRecs)) {
          if (!r.date || !r.track || r.date < from) continue;
          const k = `${r.date}|${r.track}`;
          if (!need.has(k)) need.set(k, new Set());
          need.get(k).add(s.horseId != null ? `id:${s.horseId}` : `n:${normName(s.horse)}`);
        }
  return need;
}

async function fetchAll() {
  const { loadSeasons } = await import("./hastar-lar.mjs");
  const maxRecs = Number(arg("starter")) || 3;
  const from = typeof arg("fran") === "string" ? arg("fran") : "2000-01-01";
  const workers = Number(arg("samtidigt")) || 3;
  const games = loadSeasons();
  const need = neededDays(games, maxRecs, from);
  const done = new Set(fs.existsSync(DONE_FILE) ? fs.readFileSync(DONE_FILE, "utf8").split("\n").filter(Boolean) : []);
  const byDate = new Map();
  for (const [k, horses] of need) {
    if (done.has(k)) continue;
    const [date, track] = k.split("|");
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push({ key: k, track, horses });
  }
  const dates = [...byDate.keys()].sort().reverse();
  const totalDays = [...byDate.values()].reduce((a, x) => a + x.length, 0);
  log(`${need.size} tävlingsdagar behövs, ${done.size} klara, ${totalDays} kvar på ${dates.length} datum (${workers} parallellt)`);
  fs.mkdirSync(HIST, { recursive: true });
  const out = fs.openSync(LOPP_FILE, "a");
  const doneOut = fs.openSync(DONE_FILE, "a");
  let races = 0;
  let days = 0;
  let calls = 0;
  const t0 = Date.now();
  let next = 0;
  const work = async () => {
    while (next < dates.length) {
      const date = dates[next++];
      const cal = await get(`${API}/calendar/day/${date}`);
      calls++;
      await sleep(PAUSE_MS);
      for (const day of byDate.get(date)) {
        const t = (cal?.tracks || []).find((x) => x.name === day.track) || (cal?.tracks || []).find((x) => normName(x.name) === normName(day.track));
        const left = new Set(day.horses);
        for (const rr of t?.races || []) {
          if (!left.size) break;
          const r = await get(`${API}/races/${rr.id}`);
          calls++;
          await sleep(PAUSE_MS);
          if (!r?.starts) continue;
          const c = compactRace(r, day.track);
          fs.writeSync(out, JSON.stringify(c) + "\n");
          races++;
          for (const s of c.starts) {
            left.delete(`id:${s[0]}`);
            left.delete(`n:${normName(s[1])}`);
          }
        }
        fs.writeSync(doneOut, day.key + "\n");
        days++;
        if (days % 200 === 0) {
          const min = (Date.now() - t0) / 60000;
          log(`${days}/${totalDays} dagar, ${races} lopp, ${calls} anrop, ${(calls / min / 60).toFixed(1)} anrop/s, ca ${Math.round(((totalDays - days) * min) / days)} min kvar`);
        }
      }
    }
  };
  await Promise.all(Array.from({ length: workers }, work));
  fs.closeSync(out);
  fs.closeSync(doneOut);
  log(`Klart: ${days} tävlingsdagar, ${races} lopp, ${calls} anrop.`);
}

function status() {
  const races = readRaces();
  const done = fs.existsSync(DONE_FILE) ? fs.readFileSync(DONE_FILE, "utf8").split("\n").filter(Boolean).length : 0;
  log(`${races.length} lopp, ${done} klara tävlingsdagar (${races[0]?.date ?? "–"} … ${races.at(-1)?.date ?? "–"})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  (arg("hamta") ? fetchAll() : arg("status") ? Promise.resolve(status()) : Promise.reject(new Error("Ange --hamta eller --status"))).catch((e) => {
    console.error(e.stack || e);
    process.exit(1);
  });
