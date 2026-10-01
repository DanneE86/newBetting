// API for GUI-fliken "Stryktipset" (scripts/fetch-stryktipset.mjs -> data/stryktipset.json).
//   GET  /api/stryktips        -> senast hamtade analys (hamtar aldrig sjalv)
//   POST /api/stryktips/fetch  -> hamta kupong + kor analysen nu (knappen i GUI)
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

let job = null; // Promise medan skriptet kor

function run(root) {
  if (job) return job;
  job = new Promise((resolve) => {
    const logs = [];
    const child = spawn(process.execPath, [path.join(root, "scripts", "fetch-stryktipset.mjs")], {
      cwd: root,
      env: process.env,
      windowsHide: true,
    });
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

function read(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")) : null;
}

/** Returnerar true om requesten hanterades. */
export function handleStryktips(req, res, url, root) {
  // Live-streck: samma Cloudflare-funktion som på webben, så kupongen byggs på aktuella streck även lokalt
  if (req.method === "GET" && url.pathname === "/live/svs") {
    import("../functions/live/svs.js")
      .then((m) => m.onRequestGet({ request: new Request(url.href) }))
      .then(async (r) => send(res, r.status, await r.json()))
      .catch((e) => send(res, 502, { error: String(e.message || e) }));
    return true;
  }
  if (!url.pathname.startsWith("/api/stryktips")) return false;
  const file = path.join(root, "data", "stryktipset.json");

  if (req.method === "GET" && url.pathname === "/api/stryktips") {
    try {
      send(res, 200, read(file) || { products: [] });
    } catch (e) {
      send(res, 500, { error: String(e.message || e) });
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/stryktips/fetch") {
    run(root).then((r) => {
      if (!r.ok) return send(res, 500, { ok: false, error: r.log.slice(-600) });
      send(res, 200, { ok: true, log: r.log, ...read(file) });
    });
    return true;
  }

  return false;
}
