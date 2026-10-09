// Automatisk hämtning för fliken "Hästar". Körs var 10:e minut av Windows schemaläggare (scripts/hastar-auto.vbs,
// uppgiften "Betting hastar auto"), eller för hand:
//
//   node scripts/hastar-auto.mjs                 gör det som ska göras just nu (hämta, frysa system, rätta)
//   node scripts/hastar-auto.mjs --spel V85,V86  vilka spelformer som hämtas (standard V85,V86)
//   node scripts/hastar-auto.mjs --status        visa dagens plan och uppföljningen
//   node scripts/hastar-auto.mjs --sparade       lägg in sparade analyser som gjordes FÖRE start i uppföljningen
//
// Per V-spel hämtas data kl. 10 samma dag, 2 h, 45 min och 15 min före första start (analys + tipslogg som vid
// "Hämta data"). Efter varje hämtning byggs uppföljningens tre system (scripts/lib/hast-uppfoljning.mjs) och sparas i
// data/hastar/uppfoljning/<spel-id>.json – den sista hämtningen före start är den som gäller. När omgången är avgjord
// rättas systemen mot ATG:s utdelning och data/hastar/uppfoljning.json summeras. Logg: data/hastar/auto-logg.txt.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listGames, fetchAll, analyzeRaw, updateResults, fetchGameInfo } from "./fetch-hastar.mjs";
import { normalizeGame } from "./lib/trav-model.mjs";
import { legWinners, isSettled } from "./lib/hast-sasong.mjs";
import { freezeSystems, settleFrozen, summarizeFollow, dueSlots, fetchSlots } from "./lib/hast-uppfoljning.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "hastar");
const FOLLOW = path.join(DIR, "uppfoljning");
const STATE = path.join(DIR, "auto.json");
const LOCK = path.join(DIR, "auto.lock");
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const TYPES = (typeof arg("spel") === "string" ? arg("spel") : "V85,V86").split(",").map((s) => s.trim().toUpperCase());
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
const readJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);
const writeJson = (f, o) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(o, null, 1));
};
const log = (msg) => {
  const line = `${new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })} ${msg}`;
  console.log(line);
  fs.mkdirSync(DIR, { recursive: true });
  fs.appendFileSync(path.join(DIR, "auto-logg.txt"), line + "\n");
};

/** ATG:s starttid ("2026-10-04T18:15:00", svensk tid utan zon) som ms. Datorn antas gå på svensk tid. */
const startMs = (t) => Date.parse(t);

async function fetchDue(state) {
  const { games } = await listGames(today());
  const now = Date.now();
  for (const g of games.filter((x) => TYPES.includes(x.type) && x.startTime && x.status !== "results")) {
    const done = state[g.id] || [];
    const due = dueSlots(startMs(g.startTime), now, done);
    if (!due.length) continue;
    log(`${g.id} (${g.track}): hämtar (${due.map((s) => s.key).join(", ")})`);
    const a = await analyzeRaw(await fetchAll(g.id));
    writeJson(path.join(FOLLOW, `${g.id}.json`), freezeSystems(a));
    state[g.id] = [...done, ...due.map((s) => s.key)];
    writeJson(STATE, state);
    log(`${g.id}: analys och uppföljningssystem sparade (streck ${a.fetchedAt})`);
  }
}

async function settleOpen() {
  if (!fs.existsSync(FOLLOW)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(FOLLOW).filter((x) => x.endsWith(".json"))) {
    const fr = readJson(path.join(FOLLOW, f));
    if (fr.settledAt) continue;
    const game = await fetchGameInfo(fr.id).catch(() => null);
    if (!game || game.status !== "results") continue;
    const norm = normalizeGame(game);
    if (!isSettled(norm)) continue;
    const s = settleFrozen(fr, legWinners(norm), norm.payouts);
    writeJson(path.join(FOLLOW, f), s);
    log(`${fr.id}: rättad – ${Object.entries(s.systems).map(([k, v]) => `${k} 500 kr: ${v[500]?.result?.win ?? 0} kr`).join(", ")}`);
    n++;
  }
  return n;
}

function writeSummary() {
  const entries = fs.existsSync(FOLLOW)
    ? fs.readdirSync(FOLLOW).filter((x) => x.endsWith(".json")).map((f) => readJson(path.join(FOLLOW, f))).filter((e) => e.settledAt)
    : [];
  const out = { updatedAt: new Date().toISOString(), games: entries.length, from: entries.map((e) => e.date).sort()[0] || null, summary: summarizeFollow(entries) };
  writeJson(path.join(DIR, "uppfoljning.json"), out);
  return out;
}

async function status() {
  const { games } = await listGames(today());
  const state = readJson(STATE) || {};
  for (const g of games.filter((x) => TYPES.includes(x.type) && x.startTime)) {
    const slots = fetchSlots(startMs(g.startTime)).map((s) => `${s.key} ${new Date(s.at).toLocaleTimeString("sv-SE").slice(0, 5)}${(state[g.id] || []).includes(s.key) ? " ✓" : ""}`);
    console.log(`${g.id} ${g.track} start ${g.startTime.slice(11, 16)} ${g.status}: ${slots.join(" · ")}`);
  }
  console.log(JSON.stringify(writeSummary().summary, null, 1));
}

/** Sparade analyser (data/hastar/analys) där datan hämtades före första start → frysta system i uppföljningen. */
function fromSaved() {
  const dir = path.join(DIR, "analys");
  let n = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const a = readJson(path.join(dir, f));
    if (!TYPES.includes(a.type) || a.backtestOnly || fs.existsSync(path.join(FOLLOW, f))) continue;
    const first = a.races[0]?.startTime;
    if (!first || !a.fetchedAt || Date.parse(a.fetchedAt) >= startMs(first)) continue;
    writeJson(path.join(FOLLOW, f), freezeSystems(a));
    log(`${a.id}: sparad analys från ${a.fetchedAt} (före start ${first}) inlagd i uppföljningen`);
    n++;
  }
  return n;
}

async function main() {
  if (arg("status")) return status();
  if (arg("sparade")) {
    fromSaved();
    await settleOpen();
    return console.log(JSON.stringify(writeSummary(), null, 1));
  }
  // Lås: två körningar samtidigt får inte hämta samma spel (gammalt lås > 30 min räknas som dött)
  if (fs.existsSync(LOCK) && Date.now() - fs.statSync(LOCK).mtimeMs < 30 * 60000) return;
  fs.writeFileSync(LOCK, String(process.pid));
  try {
    const state = readJson(STATE) || {};
    await fetchDue(state);
    if ((await settleOpen()) > 0) {
      await updateResults();
      writeSummary();
    }
  } finally {
    fs.rmSync(LOCK, { force: true });
  }
}

main().catch((e) => {
  log(`FEL: ${e.message || e}`);
  fs.rmSync(LOCK, { force: true });
  process.exit(1);
});
