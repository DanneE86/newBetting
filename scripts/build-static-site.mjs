// Bygger en skrivskyddad webbversion av GUI:t i site/ (Cloudflare Pages: newbetting.pages.dev).
// Startar gui/server.mjs, sparar GET-svaren som JSON under site/api/ och kopierar gui/public.
// gui/static-mode.js styr om GUI:ts /api/*-anrop till filerna.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "site");
const port = 3900 + Math.floor(Math.random() * 90);
const base = `http://127.0.0.1:${port}`;

const log = (...a) => console.log("[site]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn(process.execPath, [path.join(root, "gui", "server.mjs")], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "inherit", "inherit"],
});

async function get(p) {
  const res = await fetch(base + p);
  const body = await res.json();
  if (!res.ok) throw new Error(`${p}: HTTP ${res.status} ${body.error || ""}`);
  return body;
}

function write(rel, obj) {
  const p = path.join(out, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj));
  log(rel, `${(fs.statSync(p).size / 1e6).toFixed(2)} MB`);
}

try {
  for (let i = 0; ; i++) {
    try {
      await fetch(base + "/");
      break;
    } catch {
      if (i > 100) throw new Error("GUI-servern startade inte");
      await sleep(200);
    }
  }

  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(root, "gui", "public"), out, { recursive: true });
  fs.copyFileSync(path.join(root, "gui", "static-mode.js"), path.join(out, "static-mode.js"));
  const indexPath = path.join(out, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  if (!html.includes('<script src="/app.js"')) throw new Error("Hittar inte app.js-taggen i index.html");
  fs.writeFileSync(indexPath, html.replace('<script src="/app.js"', '<script src="/static-mode.js"></script>\n  <script src="/app.js"'));
  // Cloudflare Pages: sidadresserna visar index.html (stryktips.js läser adressen). Europatipset finns bara via adressen.
  fs.writeFileSync(path.join(out, "_redirects"), ["/tips /index.html 200", "/stryktipset /index.html 200", "/stryktipset/* /index.html 200",
    "/europatipset /index.html 200", "/europatipset/* /index.html 200", ""].join("\n"));

  const dashboard = await get("/api/dashboard");
  write("api/dashboard.json", dashboard);
  write("api/scan.json", { ...(await get("/api/scan")), state: { running: false } });
  try {
    write("api/stryktips.json", await get("/api/stryktips"));
  } catch (e) {
    log("stryktips hoppades över:", e.message);
    write("api/stryktips.json", { products: [], fetchError: e.message });
  }

  // Analysknappen: förberäkna alla tips i listan (samma agentpipeline som /api/analyze)
  const seen = new Set();
  const tips = [...(dashboard.bestUpcoming || []), ...(dashboard.allCandidates || [])].filter((t) => {
    const k = [t.league, t.date, t.home, t.away].join("|");
    if (!t.league || !t.date || !t.home || !t.away || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const analyses = {};
  let failed = 0;
  for (const t of tips) {
    const qs = new URLSearchParams({ league: t.league, date: t.date, home: t.home, away: t.away });
    try {
      analyses[[t.league, t.date, t.home, t.away].join("|")] = await get(`/api/analyze?${qs}`);
    } catch {
      failed++;
    }
  }
  log(`analyser: ${Object.keys(analyses).length} ok, ${failed} saknas`);
  write("api/analyze.json", analyses);

  // Duellanalysen: förväntad (eller officiell) elva och spelare mot spelare för varje match
  const matchups = {};
  let matchupFailed = 0;
  for (const t of tips) {
    const qs = new URLSearchParams({ league: t.league, date: t.date, home: t.home, away: t.away });
    try {
      matchups[[t.league, t.date, t.home, t.away].join("|")] = await get(`/api/matchup?${qs}`);
    } catch {
      matchupFailed++;
    }
  }
  log(`dueller: ${Object.keys(matchups).length} ok, ${matchupFailed} saknas`);
  // En fil per liga (api/matchup/<liga>.json), så att ett klick bara laddar ligans matcher
  const byLeague = {};
  for (const [k, v] of Object.entries(matchups)) (byLeague[k.split("|")[0]] ??= {})[k] = v;
  for (const [lg, list] of Object.entries(byLeague)) write(`api/matchup/${lg}.json`, list);

  // Domarpanelen: domare mot ligasnittet och lagen, en fil per liga (ligor utan domardata ger 404 och hoppas over)
  const { REF_LEAGUES } = await import(new URL("./lib/referee-streaks.mjs", import.meta.url).href);
  const refs = {};
  for (const t of tips.filter((x) => REF_LEAGUES.has(x.league))) {
    const qs = new URLSearchParams({ league: t.league, date: t.date, home: t.home, away: t.away });
    try {
      (refs[t.league] ??= {})[[t.league, t.date, t.home, t.away].join("|")] = await get(`/api/referees?${qs}`);
    } catch { /* saknas */ }
  }
  log(`domare: ${Object.values(refs).reduce((a, g) => a + Object.keys(g).length, 0)} matcher`);
  for (const [lg, list] of Object.entries(refs)) write(`api/referees/${lg}.json`, list);
  // Ligans domarvy (knappen Domare i ligaraden): en fil per liga
  let refLeagues = 0;
  for (const lg of REF_LEAGUES) {
    try {
      write(`api/refleague/${lg}.json`, await get(`/api/refleague?league=${encodeURIComponent(lg)}`));
      refLeagues++;
    } catch { /* ingen domardata */ }
  }
  log(`domare per liga: ${refLeagues}`);
  write("api/refleagues.json", await get("/api/refleagues"));

  // Startelvan: elvorna på planen och spelare mot spelare (data/startelvor.json), en fil per liga eller kupong
  const { readStore, keyGroup } = await import(new URL("./lib/startelva.mjs", import.meta.url).href);
  const elvor = {};
  let elvaFailed = 0;
  for (const key of readStore().matches.flatMap((m) => m.keys || [])) {
    try {
      (elvor[keyGroup(key)] ??= {})[key] = await get(`/api/startelva?${new URLSearchParams({ key })}`);
    } catch {
      elvaFailed++;
    }
  }
  log(`startelvor: ${Object.values(elvor).reduce((a, g) => a + Object.keys(g).length, 0)} ok, ${elvaFailed} utan elva`);
  for (const [g, list] of Object.entries(elvor)) write(`api/startelva/${g}.json`, list);

  // Lagklicket: form, modellens träff och inbördes möten för båda lagen i varje match
  const teams = {};
  let teamFailed = 0;
  for (const t of tips) {
    for (const [team, opp, venue] of [[t.home, t.away, "home"], [t.away, t.home, "away"]]) {
      const key = [t.league, team, opp, venue].join("|");
      if (teams[key]) continue;
      try {
        teams[key] = await get(`/api/team?${new URLSearchParams({ league: t.league, team, opp, venue })}`);
      } catch {
        teamFailed++;
      }
    }
  }
  log(`lag: ${Object.keys(teams).length} ok, ${teamFailed} saknas`);
  write("api/team.json", teams);
} finally {
  server.kill();
}
