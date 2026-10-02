import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { handleStryktips } from "./stryktips-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 3847);

let fetchJob = null; // { running, startedAt, logs[], listeners:Set }
// Daily Scanner (scripts/daily-scanner.mjs): progress fran "@@progress {json}"-rader
let scanJob = null; // { running, startedAt, endedAt, ok, days, progress, logs[], listeners:Set }

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

/** readJson med cache pa filens mtime (betting-store.json ar ~60 MB). */
const jsonCache = new Map();
/** cacheKey skiljer råfilen från bearbetade versioner (t.ex. store -> lag-Map för analysen). */
function readJsonCached(rel, map = (x) => x, cacheKey = rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  const mtime = fs.statSync(p).mtimeMs;
  const hit = jsonCache.get(cacheKey);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = map(readJson(rel));
  jsonCache.set(cacheKey, { mtime, value });
  return value;
}

function findTip(tips, { league, date, home, away }) {
  const pool = [...(tips?.allCandidates || []), ...(tips?.bestUpcoming || [])];
  return (
    pool.find((x) => x.league === league && x.date === date && x.home === home && x.away === away) ||
    null
  );
}

/** Analys-knappen: samma agentpipeline som Daily Scanner, for en match. */
async function analyzeOne({ league, date, home, away }) {
  const { analyzeMatch, loadTeams } = await import(new URL("../scripts/daily-scanner.mjs", import.meta.url).href);
  // Ingen cache: elva-patch skriver tips-latest och maste synas direkt
  jsonCache.delete("data/tips-latest.json");
  const tips = readJson("data/tips-latest.json");
  const t = findTip(tips, { league, date, home, away });
  if (!t) return null;
  const teams = readJsonCached("data/betting-store.json", (s) => loadTeams(s), "store:teams");
  return analyzeMatch(t, teams);
}

/** Duellanalys: förväntad/officiell elva och spelare mot spelare (scripts/lib/matchup.mjs). */
async function matchupOne({ league, date, home, away }) {
  const { buildMatchup } = await import(new URL("../scripts/lib/matchup.mjs", import.meta.url).href);
  const t = findTip(readJsonCached("data/tips-latest.json"), { league, date, home, away });
  return t ? buildMatchup(t) : null;
}

/** All domarhistorik (football-data + FotMob + store), cache tills nagon av filerna andras. */
let refCache = null;
async function refereeData() {
  const rs = await import(new URL("../scripts/lib/referee-streaks.mjs", import.meta.url).href);
  const files = ["data/open/referee_history.json", "data/open/referee_fotmob.json", "data/betting-store.json"];
  const stamp = files.map((f) => (fs.existsSync(path.join(ROOT, f)) ? fs.statSync(path.join(ROOT, f)).mtimeMs : 0)).join("|");
  if (refCache?.stamp === stamp) return refCache;
  const storeRefs = readJsonCached("data/betting-store.json", (st) => (st?.matches || []).filter((m) => m.referee && rs.ENGLISH_LEAGUES.has(m.league)), "store:refs");
  const matches = rs.loadRefereeMatches((rel) => readJson(rel), storeRefs || []);
  refCache = { stamp, matches, index: rs.buildRefIndex(matches) };
  return refCache;
}

/** Ligans domare (knappen Domare i ligaraden): alla snitt, antal matcher, gula, röda, straffar. */
async function refereeLeague({ league }) {
  const rs = await import(new URL("../scripts/lib/referee-streaks.mjs", import.meta.url).href);
  const ref = await refereeData();
  if (!rs.hasRefereeData(ref.matches, league)) return null;
  // Arets sasong som standard, aldre sasonger valbara (reports per sasong + matcherna for domarens matchlista)
  const report = rs.refereeLeagueSeasons(ref.matches, league);
  const upcoming = readJson("data/open/referees_upcoming.json")?.matches || [];
  // Kommande matcher: domarens snitt over de senaste tre sasongerna (stabilare an bara i ar)
  return { ...report, appointments: rs.leagueAppointments(ref.index, report.reports.all, upcoming, league) };
}

/** Ligor med domardata (flikarna i ligans domarvy). */
async function refereeLeagues() {
  const rs = await import(new URL("../scripts/lib/referee-streaks.mjs", import.meta.url).href);
  const ref = await refereeData();
  if (!ref.leagues) ref.leagues = rs.leaguesWithData(ref.matches);
  return { leagues: ref.leagues };
}

/** Domarpanelen: tillsatt domare mot ligasnittet och lagen + alla ligans domare (scripts/lib/referee-streaks.mjs). */
async function refereeOne({ league, date, home, away }) {
  const rs = await import(new URL("../scripts/lib/referee-streaks.mjs", import.meta.url).href);
  const ref = await refereeData();
  if (!rs.hasRefereeData(ref.matches, league)) return null;
  const t = findTip(readJsonCached("data/tips-latest.json"), { league, date, home, away });
  const up = (readJson("data/open/referees_upcoming.json")?.matches || []).find((m) => m.league === league && m.date === date && m.home === home && m.away === away);
  const referee = t?.referee?.referee || up?.referee || null;
  return { date, home, away, ...rs.refereePanel({ matches: ref.matches, index: ref.index, league, home, away, referee }) };
}

/** Hämta elva for en enskild match (Fotmob/ESPN), spara cache + patcha tips, returnera analys. */
async function fetchLineupOne({ league, date, home, away }) {
  const mod = await import(new URL("../scripts/fetch-match-lineup.mjs", import.meta.url).href);
  const result = await mod.fetchMatchLineup({ league, date, home, away });
  if (result.ok && result.fixture) {
    mod.upsertLineupCache(result.fixture);
    mod.patchTipsWithLineup(result.fixture);
    jsonCache.delete("data/tips-latest.json");
  }
  let analysis = null;
  try {
    analysis = await analyzeOne({ league, date, home, away });
  } catch {
    analysis = null;
  }
  return {
    ok: Boolean(result.ok),
    error: result.error || null,
    tried: result.tried || [],
    lineup: result.fixture || null,
    analysis,
  };
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".svg": "image/svg+xml",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".ico": "image/x-icon",
    }[ext] || "application/octet-stream"
  );
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  // Sidadresser (/tips, /stryktipset, /europatipset och undersidor) visar samma sida, stryktips.js läser adressen
  if (urlPath === "/" || /^\/(tips|stryktipset|europatipset)(\/[\w-]*)?\/?$/.test(urlPath)) urlPath = "/index.html";
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC, safe);
  if (!filePath.startsWith(PUBLIC) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-cache" });
  fs.createReadStream(filePath).pipe(res);
}

function isFinished(tip, now = new Date()) {
  const status = String(tip.matchStatus || "");
  if (/FULL_TIME|FINAL|STATUS_FINAL|STATUS_FULL_TIME/i.test(status)) return true;

  if (tip.kickoffUtc) {
    const kick = new Date(tip.kickoffUtc);
    // Om kickoff var for mer an 3 timmar sedan och status inte ar live → klar
    if (!Number.isNaN(kick.getTime()) && kick.getTime() + 3 * 60 * 60 * 1000 < now.getTime()) {
      if (!status || /SCHEDULED|STATUS_SCHEDULED/i.test(status)) return true;
    }
  }

  if (!tip.date) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const matchDay = new Date(`${tip.date}T00:00:00`);
  if (Number.isNaN(matchDay.getTime())) return false;
  return matchDay < today;
}

function matchKey(tip) {
  if (tip.home && tip.away) return `${tip.league}|${tip.date}|${tip.home}|${tip.away}`;
  const parts = String(tip.match || "").split(/\s+vs\s+/i);
  if (parts.length === 2) return `${tip.league}|${tip.date}|${parts[0].trim()}|${parts[1].trim()}`;
  return `${tip.league}|${tip.date}|${tip.match}`;
}

function kickSortValue(tip) {
  if (tip.kickoffUtc) {
    const d = new Date(tip.kickoffUtc);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }
  const d = new Date(`${tip.date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? Number.MAX_SAFE_INTEGER : d.getTime();
}

function prepareTips(list, lineupMap, roundMap) {
  const now = new Date();
  return (list || [])
    .map((t) => {
      const lu = lineupMap.get(matchKey(t)) || lineupMap.get(`${t.league}|${t.home}|${t.away}`);
      const rk = `${t.league}|${t.home}|${t.away}`;
      const merged = {
        ...t,
        kickoffUtc: t.kickoffUtc || lu?.kickoffUtc || null,
        matchStatus: t.matchStatus || lu?.matchStatus || null,
        round: t.round || roundMap.get(rk) || roundMap.get(`${t.league}|${t.date}|${t.home}|${t.away}`) || null,
      };
      // Berika med elva fran cache om tipset saknar den
      if (lu && (!t.homeStarters?.length || t.lineupStatus === "none" || !t.lineupStatus)) {
        merged.lineupStatus = lu.lineupStatus || t.lineupStatus || "none";
        merged.homeStarters = lu.homeStarters || t.homeStarters || [];
        merged.awayStarters = lu.awayStarters || t.awayStarters || [];
        merged.homeFormation = lu.homeFormation || t.homeFormation || null;
        merged.awayFormation = lu.awayFormation || t.awayFormation || null;
        merged.lineupSource = lu.source || t.lineupSource || null;
        if (lu.lineupStatus === "confirmed" && !(t.lineupNotes || []).length) {
          merged.lineupNotes = [
            `XI bekräftad (${lu.source || "cache"})${lu.homeFormation || lu.awayFormation ? ` ${lu.homeFormation || "?"} vs ${lu.awayFormation || "?"}` : ""}`,
          ];
        }
      }
      return merged;
    })
    .filter((t) => !isFinished(t, now))
    .sort((a, b) => kickSortValue(a) - kickSortValue(b) || (b.tipScore || 0) - (a.tipScore || 0));
}

/** Nastaa omgang per liga fran upcoming-fixtures (kalla till sanning). */
function nextRoundsFromFixtures(fixtures, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const byLeague = new Map(); // league -> { dateMs, round }
  for (const fx of fixtures || []) {
    if (!fx?.league || !fx?.date) continue;
    const day = new Date(`${fx.date}T00:00:00`);
    if (Number.isNaN(day.getTime()) || day < today) continue;
    const ms = day.getTime();
    const cur = byLeague.get(fx.league);
    if (!cur || ms < cur.dateMs) {
      byLeague.set(fx.league, { dateMs: ms, round: fx.round || null, date: fx.date });
    } else if (cur && ms === cur.dateMs && !cur.round && fx.round) {
      cur.round = fx.round;
    }
  }
  const out = new Map();
  for (const [lg, v] of byLeague) {
    out.set(lg, v.round ? { type: "round", value: String(v.round) } : { type: "date", value: v.date });
  }
  return out;
}

/** Behall bara nasta omgang per liga (inte omgangen efter). */
function filterNextRoundOnly(list, nextByLeague) {
  if (!list?.length) return [];
  // Om fixtures saknas: fall tillbaka till tidigaste tip per liga
  const nextRound = nextByLeague?.size
    ? nextByLeague
    : (() => {
        const m = new Map();
        for (const t of list) {
          if (!t.league || m.has(t.league)) continue;
          if (t.round) m.set(t.league, { type: "round", value: String(t.round) });
          else m.set(t.league, { type: "date", value: t.date });
        }
        return m;
      })();

  // Ligor utan spelschema (t.ex. Superettan, bara odds): tidigaste datum bland ligans tips
  const earliest = new Map();
  for (const t of list) {
    if (t.league && t.date && (!earliest.has(t.league) || t.date < earliest.get(t.league))) earliest.set(t.league, t.date);
  }
  return list.filter((t) => {
    const nr = nextRound.get(t.league) ?? (earliest.has(t.league) ? { type: "date", value: earliest.get(t.league) } : null);
    if (!nr) return false;
    if (nr.type === "round") return String(t.round || "") === nr.value;
    if (!t.date || !nr.value) return false;
    const first = new Date(`${nr.value}T00:00:00`).getTime();
    const day = new Date(`${t.date}T00:00:00`).getTime();
    if (Number.isNaN(first) || Number.isNaN(day)) return false;
    const diffDays = (day - first) / (24 * 60 * 60 * 1000);
    return diffDays >= 0 && diffDays <= 3;
  });
}

function buildRoundMap(fixtures) {
  const map = new Map();
  for (const fx of fixtures || []) {
    if (!fx.round) continue;
    map.set(`${fx.league}|${fx.home}|${fx.away}`, fx.round);
    map.set(`${fx.league}|${fx.date}|${fx.home}|${fx.away}`, fx.round);
  }
  return map;
}

/** Aldre resultat fran football-data "new"-arkiven (data/raw/<LIGA>_all.csv, t.ex. Allsvenskan sedan 2012). */
function archiveMatches(league) {
  const rel = `data/raw/${league}_all.csv`;
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return [];
  const mtime = fs.statSync(p).mtimeMs;
  const hit = jsonCache.get(rel);
  if (hit && hit.mtime === mtime) return hit.value;
  const lines = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const head = lines[0].split(",");
  const col = (n) => head.indexOf(n);
  const [iD, iH, iA, iHG, iAG] = [col("Date"), col("Home"), col("Away"), col("HG"), col("AG")];
  const value = lines.slice(1).map((l) => {
    const x = l.split(",");
    const [dd, mm, yy] = (x[iD] || "").split("/");
    const hg = Number(x[iHG]), ag = Number(x[iAG]);
    if (!yy || !Number.isFinite(hg) || !Number.isFinite(ag) || x[iHG] === "") return null;
    return { date: `${yy.length === 2 ? `20${yy}` : yy}-${mm}-${dd}`, home: x[iH], away: x[iA], hg, ag };
  }).filter(Boolean);
  jsonCache.set(rel, { mtime, value });
  return value;
}

const foldName = (s) => String(s || "").replace(/[øØ]/g, "o").replace(/[łŁ]/g, "l").replace(/ß/g, "ss").normalize("NFD")
  .replace(/[̀-ͯ]/g, "").toLowerCase().replace(/oe/g, "o").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const samePlayer = (a, b) => {
  const x = foldName(a), y = foldName(b);
  if (x === y || ` ${y} `.includes(` ${x} `) || ` ${x} `.includes(` ${y} `)) return true;
  const xs = x.split(" "), ys = y.split(" ");
  return xs.length > 1 && ys.length > 1 && xs.at(-1) === ys.at(-1) && xs[0][0] === ys[0][0];
};

/**
 * Nyckelspelare för lagklicket, så att de kan granskas:
 * - topp 5-ligor: tipsmotorns Understat-andel (xG + xA, data/lardomar.json), kontrollerad mot aktuell trupp
 * - övriga: FotMob-säsongen (mål + assist, sedan betyg)
 * Plus truppens källa och spelare som Transfermarkt-kontrollen tagit bort.
 */
function keyPlayersInfo(league, team) {
  const sq = readJsonCached(`data/trupper/${league}.json`)?.teams?.[team];
  const players = sq?.players || [];
  const find = (name) => players.find((p) => samePlayer(p.name, name));
  const status = (p) => (!p ? "ej i truppen" : p.injury ? (/doubtful/i.test(p.injury.expectedReturn || "") ? "osäker" : `skadad${p.injury.expectedReturn ? `, åter ${p.injury.expectedReturn}` : ""}`) : "");
  const row = (p, extra) => ({ name: p.name, pos: p.position || null, number: p.number ?? null, age: p.age ?? null, goals: p.goals ?? null, assists: p.assists ?? null, rating: p.rating ?? null, status: status(p), ...extra });
  let source, list;
  const us = readJsonCached("data/lardomar.json")?.teams?.[`${league}|${team}`]?.keyPlayers;
  if (us?.length) {
    source = "Tipsmotorn (Understat, andel av lagets xG + xA senaste året)";
    list = us.slice(0, 6).map((k) => {
      const p = find(k.name);
      return p ? row(p, { share: k.share }) : { name: k.name, share: k.share, status: "ej i truppen" };
    });
  } else {
    source = "FotMob, innevarande säsong (mål + assist, sedan betyg)";
    list = players
      .filter((p) => p.rating != null || p.goals || p.assists)
      .sort((a, b) => ((b.goals || 0) + (b.assists || 0)) - ((a.goals || 0) + (a.assists || 0)) || (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
      .map((p) => row(p));
    // Ingen säsongsstatistik (Argentina, Ettan via Transfermarkt ...): högst marknadsvärde
    if (!list.length) {
      source = `${sq?.source || "FotMob"}, högst marknadsvärde (ingen säsongsstatistik)`;
      list = players.filter((p) => p.value).sort((a, b) => b.value - a.value).slice(0, 6).map((p) => row(p, { value: p.value }));
    }
  }
  const excl = readJsonCached("data/trupper/_uteslutna.json")?.players || {};
  const removed = Object.entries(excl)
    .filter(([k]) => k.startsWith(`${league}|${team}|`))
    .map(([, v]) => ({ name: v.name, club: v.tmClub, checkedAt: v.checkedAt }));
  return {
    source, list, removed,
    squad: sq ? { source: sq.source || "FotMob", fetchedAt: sq.fetchedAt?.slice(0, 10) || null, count: players.length, coach: sq.coach || null, injured: players.filter((p) => p.injury).length } : null,
  };
}

/**
 * Lagklick: form denna säsong (hemma eller borta), hur ofta modellen tippat laget och haft rätt,
 * och inbördes möten mot motståndaren (sviter, t.ex. "inte vunnit på 6 möten").
 */
function teamInfo({ league, team, opp, venue }) {
  const store = readJsonCached("data/betting-store.json");
  const all = (store?.matches || []).filter((m) => m.league === league && ["H", "D", "A"].includes(m.result));
  const season = all.reduce((s, m) => (m.season > s ? m.season : s), "");
  const cur = all.filter((m) => m.season === season).sort((a, b) => a.date.localeCompare(b.date));
  const res = (m, t) => {
    const gf = m.home === t ? m.hg : m.ag;
    const ga = m.home === t ? m.ag : m.hg;
    return { date: m.date, opp: m.home === t ? m.away : m.home, venue: m.home === t ? "H" : "B", gf, ga, r: gf > ga ? "V" : gf === ga ? "O" : "F" };
  };
  const formOf = (list) => {
    const w = list.filter((x) => x.r === "V").length, d = list.filter((x) => x.r === "O").length, l = list.length - w - d;
    return {
      played: list.length, w, d, l,
      gf: list.reduce((s, x) => s + x.gf, 0), ga: list.reduce((s, x) => s + x.ga, 0),
      ppg: list.length ? Math.round(((3 * w + d) / list.length) * 100) / 100 : null,
      last: list.slice(-5).map((x) => ({ r: x.r, opp: x.opp, score: `${x.gf}-${x.ga}`, date: x.date, venue: x.venue })),
    };
  };
  const mine = cur.filter((m) => m.home === team || m.away === team).map((m) => res(m, team));
  const atVenue = mine.filter((x) => (venue === "away" ? x.venue === "B" : x.venue === "H"));

  // Modellens tips denna säsong (walk-forward-backtesten, kalibrerade sannolikheter)
  const base = readJsonCached("data/reports/base-backtest.json");
  const byKey = new Map(cur.map((m) => [`${m.date}|${m.home}|${m.away}`, m]));
  const tips = { forTeam: { n: 0, hits: 0 }, againstTeam: { n: 0, hits: 0 }, list: [] };
  for (const r of base?.rows || []) {
    if (r.league !== league || (r.home !== team && r.away !== team)) continue;
    const m = byKey.get(`${r.date}|${r.home}|${r.away}`);
    if (!m) continue;
    const p = r.cal;
    const pick = p[0] >= p[1] && p[0] >= p[2] ? "H" : p[2] >= p[1] ? "A" : "D";
    const teamSide = r.home === team ? "H" : "A";
    const hit = pick === m.result;
    const bucket = pick === teamSide ? tips.forTeam : pick === "D" ? null : tips.againstTeam;
    if (bucket) { bucket.n++; if (hit) bucket.hits++; }
    tips.list.push({ date: r.date, opp: r.home === team ? r.away : r.home, venue: teamSide === "H" ? "H" : "B", pickTeam: pick === teamSide, hit });
  }
  tips.list = tips.list.slice(-6);

  // Inbördes: store + äldre arkiv (samma lagnamn i football-data), senaste först
  const seen = new Set();
  const h2hAll = [...all, ...archiveMatches(league)]
    .filter((m) => (m.home === team && m.away === opp) || (m.home === opp && m.away === team))
    .filter((m) => { const k = `${m.date}|${m.home}|${m.away}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((m) => res(m, team));
  const streak = (list, pred) => { let n = 0; for (const x of list) { if (pred(x)) n++; else break; } return n; };
  const lastWin = h2hAll.find((x) => x.r === "V");
  const lastLoss = h2hAll.find((x) => x.r === "F");
  const venueList = h2hAll.filter((x) => (venue === "away" ? x.venue === "B" : x.venue === "H"));
  const h2h = {
    total: h2hAll.length,
    since: h2hAll.at(-1)?.date ?? null,
    w: h2hAll.filter((x) => x.r === "V").length,
    d: h2hAll.filter((x) => x.r === "O").length,
    l: h2hAll.filter((x) => x.r === "F").length,
    noWin: streak(h2hAll, (x) => x.r !== "V"),
    unbeaten: streak(h2hAll, (x) => x.r !== "F"),
    noWinAtVenue: streak(venueList, (x) => x.r !== "V"),
    unbeatenAtVenue: streak(venueList, (x) => x.r !== "F"),
    lastWin: lastWin ? { date: lastWin.date, score: lastWin.score, venue: lastWin.venue } : null,
    lastLoss: lastLoss ? { date: lastLoss.date, score: lastLoss.score, venue: lastLoss.venue } : null,
    recent: h2hAll.slice(0, 6).map((x) => ({ date: x.date, venue: x.venue, score: `${x.gf}-${x.ga}`, r: x.r })),
  };
  // Kalenderårsligor (Allsvenskan, MLS ...) lagras som "2026/27" men spelas 2026
  const calendarYear = readJsonCached("config/leagues.json")?.leagues?.[league]?.calendarYear;
  const seasonLabel = calendarYear ? season.slice(0, 4) : season;
  return { league, team, opp, venue, season: seasonLabel, venueForm: formOf(atVenue), form: formOf(mine), tips, h2h, keyPlayers: keyPlayersInfo(league, team) };
}

/** Hur ofta 1 / X / 2 faktiskt hander per liga (alla spelade matcher i store), plus ALL. */
function outcomesByLeague(store) {
  const acc = { ALL: { n: 0, H: 0, D: 0, A: 0 } };
  for (const m of store?.matches || []) {
    if (!["H", "D", "A"].includes(m.result)) continue;
    const b = (acc[m.league] ??= { n: 0, H: 0, D: 0, A: 0 });
    b.n++; b[m.result]++;
    acc.ALL.n++; acc.ALL[m.result]++;
  }
  return Object.fromEntries(
    Object.entries(acc).map(([lg, b]) => [lg, { matches: b.n, home: b.H / b.n, draw: b.D / b.n, away: b.A / b.n }])
  );
}

function buildLineupMap(lineups) {
  const map = new Map();
  for (const fx of lineups?.fixtures || []) {
    map.set(`${fx.league}|${fx.date}|${fx.home}|${fx.away}`, fx);
    map.set(`${fx.league}|${fx.home}|${fx.away}`, fx);
  }
  return map;
}

function buildDashboard() {
  const tips = readJson("data/tips-latest.json");
  const store = readJson("data/betting-store.json");
  const clubelo = readJson("data/open/clubelo_ratings.json");
  const lineups = readJson("data/open/espn_lineups.json");
  const upcoming = readJson("data/upcoming-fixtures.json");
  const fetchReport = readJson("data/open/fetch-report.json");
  const meta = store?.meta || {};
  const lineupMap = buildLineupMap(lineups);
  const fixtureList = Array.isArray(upcoming) ? upcoming : upcoming?.fixtures || [];
  const roundMap = buildRoundMap(fixtureList);
  const nextByLeague = nextRoundsFromFixtures(fixtureList);

  const bestUpcoming = filterNextRoundOnly(
    prepareTips(tips?.bestUpcoming, lineupMap, roundMap),
    nextByLeague
  );
  const allCandidates = filterNextRoundOnly(
    prepareTips(tips?.allCandidates, lineupMap, roundMap),
    nextByLeague
  );
  const leagues = [...new Set([...bestUpcoming, ...allCandidates].map((t) => t.league).filter(Boolean))].sort();
  // Ligaregister: grupper (England, Europa, Sverige ...) och ligornas namn for filtret i GUI
  const registry = readJson("config/leagues.json");
  const leagueNames = Object.fromEntries(Object.entries(registry?.leagues || {}).map(([k, v]) => [k, v.name]));
  const leagueGroups = (registry?.groups || []).map((g) => ({ id: g.id, name: g.name, leagues: g.leagues }));
  const rounds = Object.fromEntries(
    [...nextByLeague.entries()].map(([lg, v]) => [lg, v.type === "round" ? v.value : null])
  );

  return {
    updatedAt: tips?.updatedAt || meta.updatedAt || null,
    status: tips?.status || null,
    message: tips?.message || null,
    accuracy: tips?.accuracy || null,
    accuracyByLeague: tips?.accuracyByLeague || store?.accuracyByLeague || null,
    accuracyByConfidence: tips?.accuracyByConfidence || store?.accuracyByConfidence || null,
    accuracyByConfidenceByLeague:
      tips?.accuracyByConfidenceByLeague || store?.accuracyByConfidenceByLeague || null,
    drawCalibration: tips?.drawCalibration || null,
    outcomesByLeague: outcomesByLeague(store),
    leagues,
    leagueNames,
    leagueGroups,
    rounds,
    bestUpcoming,
    allCandidates,
    sources: {
      matchCount: meta.matchCount ?? null,
      clubElo: clubelo
        ? { teams: clubelo.teamCount, updatedAt: clubelo.updatedAt }
        : null,
      lineups: lineups
        ? {
            fixtures: lineups.fixtureCount,
            confirmed: lineups.confirmedCount,
            pending: lineups.pendingCount,
            updatedAt: lineups.updatedAt,
          }
        : null,
      understat: meta.understatXg || null,
      fpl: meta.fplAvailability || null,
      players: (() => {
        const ps = readJson("data/open/player_stats.json");
        if (!ps) return null;
        return {
          updatedAt: ps.updatedAt,
          counts: ps.counts,
          understatOk: Boolean(ps.sources?.understat?.ok),
          fplOk: Boolean(ps.sources?.fpl?.ok),
          espnChOk: Boolean(ps.sources?.espnChampionship?.ok),
          limitations: ps.sources?.limitations || [],
        };
      })(),
      fetchReportAt: fetchReport?.updatedAt || null,
    },
    fetch: {
      running: Boolean(fetchJob?.running),
      startedAt: fetchJob?.startedAt || null,
    },
  };
}

// ---------- Daily Scanner ----------

function scanState() {
  return {
    running: Boolean(scanJob?.running),
    startedAt: scanJob?.startedAt || null,
    endedAt: scanJob?.endedAt || null,
    ok: scanJob?.ok ?? null,
    days: scanJob?.days ?? null,
    progress: scanJob?.progress || null,
    error: scanJob?.error || null,
  };
}

function scanEmit(payload) {
  if (!scanJob) return;
  for (const res of scanJob.listeners) {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      scanJob.listeners.delete(res);
    }
  }
}

function startScan(days = 7) {
  if (scanJob?.running) return { ok: false, error: "Scannern kör redan" };
  const d = Math.min(21, Math.max(1, Math.round(Number(days) || 7)));
  scanJob = {
    running: true, startedAt: new Date().toISOString(), endedAt: null, ok: null, days: d,
    progress: { step: 0, total: 1, text: "Startar Daily Scanner…" }, logs: [], listeners: new Set(),
  };
  const child = spawn(process.execPath, [path.join(ROOT, "scripts", "daily-scanner.mjs"), "--days", String(d)], {
    cwd: ROOT, env: process.env, windowsHide: true,
  });
  let buf = "";
  const onLine = (line) => {
    if (line.startsWith("@@progress ")) {
      try {
        scanJob.progress = JSON.parse(line.slice(11));
        scanEmit({ type: "progress", progress: scanJob.progress });
      } catch {
        /* ignore */
      }
      return;
    }
    scanJob.logs.push(line);
    if (scanJob.logs.length > 400) scanJob.logs.shift();
    scanEmit({ type: "log", line });
  };
  child.stdout.on("data", (b) => {
    buf += String(b);
    const lines = buf.split(/\r?\n/);
    buf = lines.pop();
    lines.filter(Boolean).forEach(onLine);
  });
  child.stderr.on("data", (b) => String(b).split(/\r?\n/).filter(Boolean).forEach((l) => onLine(`[err] ${l}`)));
  const finish = (ok, error) => {
    if (!scanJob.running) return;
    if (buf) onLine(buf);
    scanJob.running = false;
    scanJob.ok = ok;
    scanJob.error = error || null;
    scanJob.endedAt = new Date().toISOString();
    scanEmit({ type: "done", ...scanState() });
    for (const res of scanJob.listeners) {
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
    scanJob.listeners.clear();
  };
  child.on("error", (e) => finish(false, e.message));
  child.on("close", (code) =>
    finish(code === 0, code === 0 ? null : scanJob.logs.filter((l) => /^Fel|\[err\]/.test(l)).pop() || `exit ${code}`)
  );
  return { ok: true, ...scanState() };
}

function broadcast(line) {
  if (!fetchJob) return;
  fetchJob.logs.push(line);
  if (fetchJob.logs.length > 800) fetchJob.logs.shift();
  for (const res of fetchJob.listeners) {
    try {
      res.write(`data: ${JSON.stringify({ type: "log", line })}\n\n`);
    } catch {
      fetchJob.listeners.delete(res);
    }
  }
}

function finishFetch(ok, code) {
  if (!fetchJob) return;
  fetchJob.running = false;
  const payload = { type: "done", ok, code, endedAt: new Date().toISOString() };
  for (const res of fetchJob.listeners) {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      res.end();
    } catch {
      /* ignore */
    }
  }
  fetchJob.listeners.clear();
}

function startFetch(mode = "sync") {
  if (fetchJob?.running) {
    return { ok: false, error: "Hämtning pågår redan" };
  }

  const scripts = {
    sync: ["run", "sync"],
    clubelo: ["run", "clubelo"],
    lineups: ["run", "lineups"],
    full: null, // custom: fetch then store with clubelo/lineups already in fetch
  };

  fetchJob = {
    running: true,
    startedAt: new Date().toISOString(),
    logs: [],
    listeners: new Set(),
    mode,
  };

  const isWin = process.platform === "win32";
  let child;

  if (mode === "full") {
    // Full refresh: open sources (inkl. clubelo+lineups) + store + ledger
    const ps = path.join(ROOT, "scripts", "Fetch-OpenSources.ps1");
    const store = path.join(ROOT, "scripts", "Update-BettingStore.ps1");
    const ledger = path.join(ROOT, "scripts", "Update-TipsLedger.ps1");
    const cmd = [
      `Write-Host '=== Hämta öppna källor ==='`,
      `& powershell -NoProfile -ExecutionPolicy Bypass -File '${ps}'`,
      `if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) { Write-Host "Fetch exit $LASTEXITCODE" }`,
      `Write-Host '=== OddsPortal (reservodds dar odds saknas) ==='`,
      `& '${process.execPath}' '${path.join(ROOT, "scripts", "fetch-oddsportal.mjs")}'`,
      `Write-Host '=== Bygg tips / store ==='`,
      `& powershell -NoProfile -ExecutionPolicy Bypass -File '${store}' -SkipDownload`,
      `Write-Host '=== Ledger ==='`,
      `& powershell -NoProfile -ExecutionPolicy Bypass -File '${ledger}'`,
      `Write-Host '=== Daily Scanner ==='`,
      `& '${process.execPath}' '${path.join(ROOT, "scripts", "daily-scanner.mjs")}' | Where-Object { $_ -notlike '@@progress*' }`,
      `Write-Host '=== Klart ==='`,
    ].join("; ");
    child = spawn("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], {
      cwd: ROOT,
      // Odds API: flest matcher forst, krediterna fordelas over resten av manaden (500/man gratis)
      env: { ...process.env, ODDS_BUDGET: process.env.ODDS_BUDGET || "auto" },
      windowsHide: true,
    });
  } else {
    const args = scripts[mode] || scripts.sync;
    child = spawn(isWin ? "npm.cmd" : "npm", args, {
      cwd: ROOT,
      env: { ...process.env, ODDS_BUDGET: process.env.ODDS_BUDGET || "auto" },
      windowsHide: true,
      shell: isWin,
    });
  }

  broadcast(`Startar hämtning (${mode})…`);

  child.stdout.on("data", (buf) => {
    String(buf)
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => broadcast(line));
  });
  child.stderr.on("data", (buf) => {
    String(buf)
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => broadcast(`[err] ${line}`));
  });
  child.on("error", (err) => {
    broadcast(`Fel: ${err.message}`);
    finishFetch(false, 1);
  });
  child.on("close", (code) => {
    broadcast(`Process klar (exit ${code})`);
    finishFetch(code === 0, code ?? 1);
  });

  return { ok: true, mode, startedAt: fetchJob.startedAt };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (handleStryktips(req, res, url, ROOT)) return;

  if (req.method === "GET" && url.pathname === "/api/dashboard") {
    try {
      return sendJson(res, 200, buildDashboard());
    } catch (e) {
      return sendJson(res, 500, { error: String(e.message || e) });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/players") {
    try {
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const league = (url.searchParams.get("league") || "").trim().toUpperCase();
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 50)));
      const index = readJson("data/open/player_stats_index.json");
      const full = readJson("data/open/player_stats.json");
      if (!index && !full) {
        return sendJson(res, 404, {
          ok: false,
          error: "player_stats saknas — kör npm run players",
          sourcesBlocked: ["Opta", "FBref", "WhoScored"],
        });
      }
      let list = index?.players || [];
      const allowed = new Set(["PL", "LL", "SA", "BL", "L1", "ED", "CH"]);
      if (allowed.has(league)) {
        list = list.filter((p) => p.league === league);
      }
      if (q) {
        list = list.filter(
          (p) =>
            String(p.name || "").toLowerCase().includes(q) ||
            String(p.team || "").toLowerCase().includes(q)
        );
      }
      const slice = list.slice(0, limit);
      let detail = null;
      if (q && slice.length >= 1 && full) {
        const hit = slice[0];
        const pool =
          (full.leagues && full.leagues[hit.league]) ||
          (hit.league === "CH" ? full.championship : null) ||
          (hit.league === "PL" ? full.premierLeague : null) ||
          [];
        detail =
          (pool || []).find(
            (p) =>
              String(p.name).toLowerCase() === String(hit.name).toLowerCase() ||
              (hit.understatId && p.understatId === hit.understatId) ||
              (hit.fplId && p.fpl?.fplId === hit.fplId) ||
              (hit.espnId && p.espnId === hit.espnId)
          ) || null;
      }
      return sendJson(res, 200, {
        ok: true,
        updatedAt: index?.updatedAt || full?.updatedAt || null,
        counts: index?.counts || full?.counts || null,
        total: index?.total || full?.total || null,
        scope: full?.scope || ["PL", "LL", "SA", "BL", "L1", "ED"],
        limitations: full?.sources?.limitations || [],
        blocked: full?.sources?.blocked || [],
        totalMatched: list.length,
        players: slice,
        detail,
      });
    } catch (e) {
      return sendJson(res, 500, { error: String(e.message || e) });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/fetch") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1e5) req.destroy();
    });
    req.on("end", () => {
      let mode = "full";
      try {
        if (body) mode = JSON.parse(body).mode || "full";
      } catch {
        /* default */
      }
      const result = startFetch(mode);
      return sendJson(res, result.ok ? 202 : 409, result);
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/fetch/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ type: "hello", running: Boolean(fetchJob?.running) })}\n\n`);

    if (fetchJob) {
      for (const line of fetchJob.logs) {
        res.write(`data: ${JSON.stringify({ type: "log", line })}\n\n`);
      }
      if (fetchJob.running) {
        fetchJob.listeners.add(res);
        req.on("close", () => fetchJob?.listeners.delete(res));
      } else {
        res.write(
          `data: ${JSON.stringify({ type: "done", ok: true, replay: true })}\n\n`
        );
        res.end();
      }
    } else {
      res.end();
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/analyze") {
    const q = Object.fromEntries(["league", "date", "home", "away"].map((k) => [k, url.searchParams.get(k) || ""]));
    analyzeOne(q)
      .then((m) => (m ? sendJson(res, 200, m) : sendJson(res, 404, { error: "Matchen finns inte bland kommande tips" })))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/matchup") {
    const q = Object.fromEntries(["league", "date", "home", "away"].map((k) => [k, url.searchParams.get(k) || ""]));
    matchupOne(q)
      .then((m) => (m ? sendJson(res, 200, m) : sendJson(res, 404, { error: "Matchen finns inte bland kommande tips" })))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/refleagues") {
    refereeLeagues()
      .then((m) => sendJson(res, 200, m))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/refleague") {
    refereeLeague({ league: url.searchParams.get("league") || "" })
      .then((m) => (m ? sendJson(res, 200, m) : sendJson(res, 404, { error: "Ingen domardata för ligan än" })))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/referees") {
    const q = Object.fromEntries(["league", "date", "home", "away"].map((k) => [k, url.searchParams.get(k) || ""]));
    refereeOne(q)
      .then((m) => (m ? sendJson(res, 200, m) : sendJson(res, 404, { error: "Ingen domardata för ligan än" })))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  // Startelva och spelare mot spelare (scripts/lib/startelva.mjs). key = liga|datum|hemma|borta eller svs|spel|omgång|nr
  if (req.method === "GET" && url.pathname === "/api/startelva") {
    const key = url.searchParams.get("key") || "";
    import(new URL("../scripts/lib/startelva.mjs", import.meta.url).href)
      .then(({ readStore, findEntry, buildView }) => {
        const store = readStore();
        const entry = findEntry(store, key);
        const v = buildView(entry, { extra: store.players });
        sendJson(res, entry ? 200 : 404, entry ? v : { ...v, error: v.reason });
      })
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  // Hämta om elvan för en match nu (FotMob), t.ex. när den officiella elvan släppts
  if (req.method === "POST" && url.pathname === "/api/startelva/fetch") {
    const key = url.searchParams.get("key") || "";
    Promise.all([
      import(new URL("../scripts/lib/startelva.mjs", import.meta.url).href),
      import(new URL("../scripts/lib/match-context.mjs", import.meta.url).href),
    ])
      .then(async ([se, mc]) => {
        const store = se.readStore();
        const m = se.collectMatches({ days: 30 }).find((x) => x.key === key)
          || (() => {
            const e = se.findEntry(store, key);
            return e ? { key, league: e.league, kickoff: e.kickoff, home: e.home, away: e.away, fotmobMatchId: e.fotmobMatchId } : null;
          })();
        if (!m) return sendJson(res, 404, { error: "Matchen finns inte bland kommande matcher" });
        await se.updateStore([m], { store, force: true, findMatch: mc.findMatch });
        se.writeStore(store);
        const entry = se.findEntry(store, key);
        const v = se.buildView(entry, { extra: store.players });
        sendJson(res, entry ? 200 : 404, entry ? v : { ...v, error: "Matchen hittades inte på FotMob" });
      })
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/team") {
    const q = Object.fromEntries(["league", "team", "opp", "venue"].map((k) => [k, url.searchParams.get(k) || ""]));
    if (!q.league || !q.team) return sendJson(res, 400, { error: "Saknar league/team" });
    try {
      return sendJson(res, 200, teamInfo(q));
    } catch (e) {
      return sendJson(res, 500, { error: String(e.message || e) });
    }
  }

  // Per-match elva: Fotmob (bred) + ESPN fallback. Body eller query: league, date, home, away
  if (req.method === "POST" && url.pathname === "/api/lineup") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1e5) req.destroy();
    });
    req.on("end", () => {
      let q = Object.fromEntries(["league", "date", "home", "away"].map((k) => [k, url.searchParams.get(k) || ""]));
      try {
        if (body) q = { ...q, ...JSON.parse(body) };
      } catch {
        /* behåll query */
      }
      if (!q.league || !q.date || !q.home || !q.away) {
        return sendJson(res, 400, { error: "Saknar league/date/home/away" });
      }
      fetchLineupOne(q)
        .then((r) => sendJson(res, r.ok || r.lineup ? 200 : 502, r))
        .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/scan") {
    try {
      return sendJson(res, 200, { state: scanState(), result: readJson("data/daily-scan.json") });
    } catch (e) {
      return sendJson(res, 500, { error: String(e.message || e) });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/scan") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 1e4) req.destroy();
    });
    req.on("end", () => {
      let days = 7;
      try {
        if (body) days = JSON.parse(body).days ?? 7;
      } catch {
        /* default */
      }
      const result = startScan(days);
      return sendJson(res, result.ok ? 202 : 409, result);
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/scan/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ type: "hello", ...scanState() })}\n\n`);
    if (scanJob?.running) {
      scanJob.listeners.add(res);
      req.on("close", () => scanJob?.listeners.delete(res));
    } else {
      res.write(`data: ${JSON.stringify({ type: "done", replay: true, ...scanState() })}\n\n`);
      res.end();
    }
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return sendJson(res, 404, { error: "Okänd API-route" });
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Betting GUI: http://localhost:${PORT}`);
});
