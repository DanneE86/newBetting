// API för GUI-fliken "Hästar" (scripts/fetch-hastar.mjs -> data/hastar/).
//   GET  /api/hastar?id=<spel-id>      sparad analys (senaste om id saknas) + lista + backtest. Hämtar aldrig själv.
//   GET  /api/hastar/spel?datum=...    dagens spel hos ATG (V86/V85/V75/GS75/V65/V64/V4/DD/LD)
//   POST /api/hastar/fetch?id=...      hämta data (allt sparas i data/hastar/raw/<id>.json) + analysera
//   POST /api/hastar/analyze?id=...    analysera om sparad rådata, ingen hämtning
//   POST /api/hastar/resultat          hämta resultat för sparade analyser + uppdatera backtest
//   POST /api/hastar/time-source?source=travsport|atg   källa för tider och Fa/Fo-delpoäng (config/hastar-presentation.json)
//   POST /api/hastar/history-fetch?id=...&leg=N[&refresh=1]   läs Travsport-historik (fetch-travsport-hast.mjs) i bakgrunden
//   GET  /api/hastar/history-status    förloppet · POST /api/hastar/history-cancel   avbryt
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { splitPrivate, mergePrivate } from "../scripts/lib/hast-privat.mjs";
import { normalizeGame, analyzeGame } from "../scripts/lib/trav-model.mjs";
import { attachFieldInfo } from "../scripts/lib/hast-lopp.mjs";
import { loadTrainerHist } from "../scripts/fetch-hastar.mjs";
import { readHistory } from "../scripts/lib/travsport-history.mjs";
import { startHistoryJob, historyJob, cancelHistoryJob } from "../scripts/lib/travsport-history-job.mjs";

let job = null;

function run(root, args) {
  if (job) return job;
  job = new Promise((resolve) => {
    const logs = [];
    const child = spawn(process.execPath, [path.join(root, "scripts", "fetch-hastar.mjs"), ...args], { cwd: root, env: process.env, windowsHide: true });
    child.stdout.on("data", (b) => logs.push(String(b)));
    child.stderr.on("data", (b) => logs.push(String(b)));
    child.on("error", (e) => resolve({ ok: false, log: e.message }));
    child.on("close", (code) => resolve({ ok: code === 0, log: logs.join("") }));
  }).finally(() => {
    job = null;
  });
  return job;
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, "")) : null);
const safeId = (id) => (id && /^[A-Za-z0-9]+_\d{4}-\d{2}-\d{2}_\d+_\d+$/.test(id) ? id : null);
const safeDate = (d) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);

/** Hästarnas tidigare starter ur alla sparade analyser (ATG), för tiderna på fliken. Bara visning, aldrig till modellen. */
export function attachTimeHistory(dir, analysis) {
  if (!analysis) return analysis;
  const races = [...analysis.races, ...(analysis.dd?.extraRaces || [])];
  const histories = new Map(races.flatMap((r) => r.horses || []).filter((h) => h.horseId).map((h) => [h.horseId, new Map()]));
  const collect = (a) => {
    for (const r of [...(a?.races || []), ...(a?.dd?.extraRaces || [])])
      for (const h of r.horses || []) {
        const entries = histories.get(h.horseId);
        if (!entries) continue;
        for (const s of h.records || h.last5 || []) {
          if (!s.date || s.date.slice(0, 10) >= analysis.date) continue;
          const key = s.raceId || `${s.date}:${s.track}:${s.distance}:${s.startMethod}`;
          entries.set(key, { ...entries.get(key), ...s });
        }
      }
  };
  const folder = path.join(dir, "analys");
  if (fs.existsSync(folder))
    for (const file of fs.readdirSync(folder).filter((f) => f.endsWith(".json")).sort()) {
      try {
        collect(read(path.join(folder, file)));
      } catch {
        // en trasig gammal analys får inte dölja den valda omgången
      }
    }
  collect(analysis);
  for (const r of races) for (const h of r.horses || []) if (histories.has(h.horseId)) h.timeHistory = [...histories.get(h.horseId).values()];
  return analysis;
}

/**
 * Fa-referensen (h.faBaseline) för analyser sparade innan den fanns: räknas om ur rådatan med analysens egna vikter.
 * Bara om chans och poäng blir exakt desamma som i den sparade analysen, annars visas jämförelsen som saknad.
 */
export function attachFaBaseline(analysis, raw) {
  if (!analysis || !raw?.main?.game || analysis.races.every((r) => r.horses.filter((h) => !h.scratched).every((h) => h.faBaseline?.version === 3))) return analysis;
  try {
    const game = normalizeGame(raw.main.game, raw.main.details);
    const dd = raw.dd ? normalizeGame(raw.dd.game, raw.dd.details) : null;
    if (raw.lopp?.length) attachFieldInfo([game, dd].filter(Boolean), new Map(), { byId: new Map(raw.lopp.map((r) => [r.id, r])) });
    const m = analysis.method;
    const trainerHist = loadTrainerHist([game, dd].filter(Boolean));
    const opts = {
      ...(m?.learned ? { learned: { weights: m.weights, market: m.marketExp } } : { learned: false, weights: m?.weights, marketExp: m?.marketExp }),
      ...(trainerHist ? { trainerHist } : {}),
    };
    const reference = analyzeGame(game, dd, opts);
    for (const r of analysis.races) {
      const source = reference.races.find((s) => s.number === r.number);
      const live = r.horses.filter((h) => !h.scratched);
      if (!source || source.horses.filter((h) => !h.scratched).length !== live.length) continue;
      const match = (h) => source.horses.find((s) => s.nr === h.nr);
      if (live.some((h) => match(h)?.p !== h.p || match(h)?.poang?.total !== h.poang?.total)) continue;
      for (const h of live) h.faBaseline = match(h).faBaseline;
    }
  } catch {
    // saknas eller passar inte rådatan visas analysen ändå, utan Fa-jämförelse
  }
  return analysis;
}

const presentationFile = (root) => path.join(root, "config", "hastar-presentation.json");

/** Sparad analys + lista över sparade omgångar + backtest. */
export function hastarState(root, id, { publik = false } = {}) {
  const dir = path.join(root, "data", "hastar");
  const index = read(path.join(dir, "index.json")) || { latest: null, analyses: [] };
  const want = safeId(id) || index.latest;
  const saved = want ? read(path.join(dir, "analys", `${want}.json`)) : null;
  // Interbet-fälten är lokala (gitignorerade) och följer aldrig med till webbsidan
  const analysis = publik ? saved && splitPrivate(saved).analysis : mergePrivate(saved, want ? read(path.join(dir, "interbet", `${want}.json`)) : null);
  const raw = want ? path.join(dir, "raw", `${want}.json`) : null;
  attachTimeHistory(dir, analysis);
  if (analysis && raw && fs.existsSync(raw)) attachFaBaseline(analysis, read(raw));
  // Sportinfo-historiken är lokal (gitignorerad) och följer aldrig med till webbsidan
  if (analysis && !publik)
    for (const r of [...analysis.races, ...(analysis.dd?.extraRaces || [])])
      for (const h of r.horses) {
        const history = readHistory(root, h.horseId);
        if (history) h.travsportHistory = history;
      }
  const timeSource = !publik && read(presentationFile(root))?.timeSource !== "atg" ? "travsport" : "atg";
  return {
    analysis, index, backtest: read(path.join(dir, "backtest.json")), uppfoljning: read(path.join(dir, "uppfoljning.json")), hasRaw: !!(raw && fs.existsSync(raw)),
    local: !publik, timeSource, historyJob: publik ? null : historyJob(),
  };
}

/** Returnerar true om requesten hanterades. */
export function handleHastar(req, res, url, root) {
  if (!url.pathname.startsWith("/api/hastar")) return false;
  const id = safeId(url.searchParams.get("id"));

  if (req.method === "GET" && url.pathname === "/api/hastar") {
    try {
      send(res, 200, hastarState(root, id, { publik: url.searchParams.get("publik") === "1" }));
    } catch (e) {
      send(res, 500, { error: String(e.message || e) });
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/hastar/time-source") {
    const source = url.searchParams.get("source");
    if (!["atg", "travsport"].includes(source)) {
      send(res, 400, { error: "Ogiltig tidskälla." });
      return true;
    }
    try {
      const file = presentationFile(root);
      fs.writeFileSync(`${file}.tmp`, JSON.stringify({ timeSource: source }, null, 2));
      fs.renameSync(`${file}.tmp`, file);
      send(res, 200, { timeSource: source });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return true;
  }
  if (req.method === "GET" && url.pathname === "/api/hastar/history-status") {
    send(res, 200, { job: historyJob() });
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/hastar/history-cancel") {
    send(res, 200, { job: cancelHistoryJob() });
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/hastar/history-fetch") {
    try {
      const value = url.searchParams.get("leg");
      if (value != null && !/^[1-9]d?$/.test(value)) throw new Error("Ogiltig avdelning.");
      const { analysis } = hastarState(root, id);
      send(res, 202, { job: startHistoryJob(root, analysis, { leg: value == null ? null : Number(value), force: url.searchParams.get("refresh") === "1" }) });
    } catch (e) {
      send(res, 400, { error: e.message });
    }
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/hastar/spel") {
    const date = safeDate(url.searchParams.get("datum")) || new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
    const kommande = url.searchParams.get("kommande") === "1";
    const from = safeDate(url.searchParams.get("fran")) || date;
    import("../scripts/fetch-hastar.mjs")
      .then((m) => (kommande ? m.upcomingGames(from) : m.listGames(date).then(({ games }) => ({ date, games }))))
      .then((body) => send(res, 200, body))
      .catch((e) => send(res, 502, { error: String(e.message || e) }));
    return true;
  }

  const actions = {
    "/api/hastar/fetch": () => (id ? ["--id", id] : ["--datum", safeDate(url.searchParams.get("datum")) || ""].filter(Boolean)),
    "/api/hastar/analyze": () => ["--analys", ...(id ? ["--id", id] : [])],
    "/api/hastar/resultat": () => ["--resultat"],
  };
  if (req.method === "POST" && actions[url.pathname]) {
    const args = actions[url.pathname]();
    run(root, args).then((r) => {
      if (!r.ok) return send(res, 500, { ok: false, error: r.log.slice(-600) });
      send(res, 200, { ok: true, log: r.log, ...hastarState(root, id) });
    });
    return true;
  }
  return false;
}
