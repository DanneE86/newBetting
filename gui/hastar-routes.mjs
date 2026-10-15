// API för GUI-fliken "Hästar" (scripts/fetch-hastar.mjs -> data/hastar/).
//   GET  /api/hastar?id=<spel-id>      sparad analys (senaste om id saknas) + lista + backtest. Hämtar aldrig själv.
//   GET  /api/hastar/spel?datum=...    dagens spel hos ATG (V86/V85/V75/GS75/V65/V64/DD)
//   POST /api/hastar/fetch?id=...      hämta data (allt sparas i data/hastar/raw/<id>.json) + analysera
//   POST /api/hastar/analyze?id=...    analysera om sparad rådata, ingen hämtning
//   POST /api/hastar/resultat          hämta resultat för sparade analyser + uppdatera backtest
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { splitPrivate, mergePrivate } from "../scripts/lib/hast-privat.mjs";

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

/** Sparad analys + lista över sparade omgångar + backtest. */
export function hastarState(root, id, { publik = false } = {}) {
  const dir = path.join(root, "data", "hastar");
  const index = read(path.join(dir, "index.json")) || { latest: null, analyses: [] };
  const want = safeId(id) || index.latest;
  const saved = want ? read(path.join(dir, "analys", `${want}.json`)) : null;
  // Interbet-fälten är lokala (gitignorerade) och följer aldrig med till webbsidan
  const analysis = publik ? saved && splitPrivate(saved).analysis : mergePrivate(saved, want ? read(path.join(dir, "interbet", `${want}.json`)) : null);
  const raw = want ? path.join(dir, "raw", `${want}.json`) : null;
  return { analysis, index, backtest: read(path.join(dir, "backtest.json")), uppfoljning: read(path.join(dir, "uppfoljning.json")), hasRaw: !!(raw && fs.existsSync(raw)) };
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
