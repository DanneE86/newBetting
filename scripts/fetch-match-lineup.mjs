/**
 * Hämta startelva för EN match (Fotmob primärt, ESPN fallback).
 *
 * CLI:
 *   node scripts/fetch-match-lineup.mjs --league SE3S --date 2026-09-27 --home Trelleborg --away Ängelholm
 *
 * Export:
 *   fetchMatchLineup({ league, date, home, away })
 *   upsertLineupCache(fixture)
 *   patchTipsWithLineup(fixture)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fotmobGet } from "./lib/api-schemas.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LINEUPS_PATH = path.join(ROOT, "data", "open", "espn_lineups.json");
const TIPS_PATH = path.join(ROOT, "data", "tips-latest.json");
const LEAGUES_PATH = path.join(ROOT, "config", "leagues.json");

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "application/json",
};

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

/** Normalisera lagnamn för fuzzy-match (Trelleborg ≈ Trelleborgs FF). */
export function normName(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\b(ff|if|ifc|fc|bk|fk|sk|ac|sc|cf|afc|united|city|town|hotspur|wanderers)\b/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function namesMatch(a, b) {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
}

function ymdToFotmob(date) {
  return String(date || "").replace(/-/g, "");
}

function dateShift(ymd, days) {
  const d = new Date(`${ymd}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const getJson = (url, headers = UA) => fotmobGet(url, { headers, orNull: false, retries: 2 });

function startersFromFotmob(side) {
  return (side?.starters || []).map((p) => ({
    name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
    jersey: p.shirtNumber != null ? String(p.shirtNumber) : null,
    position: p.usualPlayingPositionId != null ? String(p.usualPlayingPositionId) : null,
  }));
}

async function findFotmobMatch({ date, home, away }) {
  const days = [date, dateShift(date, -1), dateShift(date, 1)].filter(Boolean);
  const seen = new Set();
  for (const day of days) {
    const key = ymdToFotmob(day);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    let data;
    try {
      data = await getJson(`https://www.fotmob.com/api/data/matches?date=${key}`);
    } catch {
      continue;
    }
    for (const lg of data.leagues || []) {
      for (const m of lg.matches || []) {
        const h = m.home?.name || m.home?.longName || "";
        const a = m.away?.name || m.away?.longName || "";
        if (namesMatch(h, home) && namesMatch(a, away)) {
          return {
            matchId: String(m.id),
            fotmobHome: h,
            fotmobAway: a,
            leagueName: lg.name || null,
            kickoffUtc: m.status?.utcTime || null,
          };
        }
      }
    }
  }
  return null;
}

async function fetchFotmobLineup(hit, meta) {
  const d = await getJson(`https://www.fotmob.com/api/data/matchDetails?matchId=${hit.matchId}`);
  const lu = d.content?.lineup;
  if (!lu?.homeTeam || !lu?.awayTeam) {
    return {
      ...baseFixture(meta, hit),
      lineupStatus: "pending",
      source: "fotmob",
      note: "Match hittad men elvor ej publicerade ännu",
      homeStarters: [],
      awayStarters: [],
      homeStarterCount: 0,
      awayStarterCount: 0,
      fotmobMatchId: hit.matchId,
    };
  }
  const homeXi = startersFromFotmob(lu.homeTeam);
  const awayXi = startersFromFotmob(lu.awayTeam);
  // FotMob visar förväntad elva (predicted) och senaste elvan (lastStarting11) innan den officiella släpps
  const confirmed = homeXi.length >= 11 && awayXi.length >= 11 && !/last|predict/i.test(lu.lineupType || "");
  return {
    ...baseFixture(meta, hit),
    lineupStatus: confirmed ? "confirmed" : "pending",
    homeFormation: lu.homeTeam.formation || null,
    awayFormation: lu.awayTeam.formation || null,
    homeStarters: homeXi,
    awayStarters: awayXi,
    homeStarterCount: homeXi.length,
    awayStarterCount: awayXi.length,
    source: "fotmob",
    fotmobMatchId: hit.matchId,
    fotmobLeague: hit.leagueName,
    lineupType: lu.lineupType || null,
  };
}

function baseFixture(meta, hit = {}) {
  return {
    date: meta.date,
    kickoffUtc: hit.kickoffUtc || meta.kickoffUtc || null,
    league: meta.league,
    home: meta.home,
    away: meta.away,
    matchStatus: null,
    homeFormation: null,
    awayFormation: null,
  };
}

function espnCodeForLeague(league) {
  const reg = readJson(LEAGUES_PATH);
  const lg = reg?.leagues?.[league];
  if (lg?.espn) return lg.espn;
  // Saknas i registret men finns hos ESPN
  if (league === "SE2") return "swe.2";
  if (league === "PL") return "eng.1";
  if (league === "CH") return "eng.2";
  return null;
}

async function fetchEspnLineup(meta) {
  const code = espnCodeForLeague(meta.league);
  if (!code) return null;
  const days = [meta.date, dateShift(meta.date, -1), dateShift(meta.date, 1)];
  let eventId = null;
  let kickoffUtc = null;
  let status = null;
  for (const day of days) {
    const key = ymdToFotmob(day);
    if (!key) continue;
    let sb;
    try {
      sb = await getJson(
        `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${code}/scoreboard?dates=${key}`,
        { ...UA, Referer: "https://www.espn.com/" }
      );
    } catch {
      continue;
    }
    for (const ev of sb.events || []) {
      const comps = ev.competitions?.[0]?.competitors || [];
      const home = comps.find((c) => c.homeAway === "home")?.team?.displayName;
      const away = comps.find((c) => c.homeAway === "away")?.team?.displayName;
      if (namesMatch(home, meta.home) && namesMatch(away, meta.away)) {
        eventId = String(ev.id);
        kickoffUtc = ev.date || null;
        status = ev.status?.type?.name || null;
        break;
      }
    }
    if (eventId) break;
  }
  if (!eventId) return null;

  const sum = await getJson(
    `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${code}/summary?event=${eventId}`,
    { ...UA, Referer: "https://www.espn.com/" }
  );
  let homeXi = [];
  let awayXi = [];
  let homeForm = null;
  let awayForm = null;
  for (const r of sum.rosters || []) {
    const starters = (r.roster || [])
      .filter((p) => p.starter)
      .map((p) => ({
        name: p.athlete?.displayName || null,
        jersey: p.jersey != null ? String(p.jersey) : null,
        position: p.position?.abbreviation || null,
      }));
    if (r.homeAway === "home") {
      homeXi = starters;
      homeForm = r.formation || null;
    } else {
      awayXi = starters;
      awayForm = r.formation || null;
    }
  }
  const confirmed = homeXi.length >= 11 && awayXi.length >= 11;
  return {
    ...baseFixture(meta, { kickoffUtc }),
    matchStatus: status,
    lineupStatus: confirmed ? "confirmed" : "pending",
    homeFormation: homeForm,
    awayFormation: awayForm,
    homeStarters: homeXi,
    awayStarters: awayXi,
    homeStarterCount: homeXi.length,
    awayStarterCount: awayXi.length,
    source: "espn-site-web-api",
    espnEventId: eventId,
    espnLeague: code,
  };
}

/**
 * Hämta elva för en match. Försöker Fotmob först (bred täckning inkl. Ettan),
 * sedan ESPN om ligan har kod.
 */
export async function fetchMatchLineup({ league, date, home, away, kickoffUtc = null }) {
  const meta = { league, date, home, away, kickoffUtc };
  if (!league || !date || !home || !away) {
    throw new Error("Saknar league/date/home/away");
  }

  const errors = [];

  try {
    const hit = await findFotmobMatch(meta);
    if (hit) {
      const fx = await fetchFotmobLineup(hit, meta);
      return { ok: true, fixture: fx, tried: ["fotmob"] };
    }
    errors.push("fotmob: ingen match hittades");
  } catch (e) {
    errors.push(`fotmob: ${e.message || e}`);
  }

  try {
    const espn = await fetchEspnLineup(meta);
    if (espn) return { ok: true, fixture: espn, tried: ["fotmob", "espn"] };
    errors.push("espn: ingen match hittades");
  } catch (e) {
    errors.push(`espn: ${e.message || e}`);
  }

  return {
    ok: false,
    fixture: {
      ...baseFixture(meta),
      lineupStatus: "none",
      homeStarters: [],
      awayStarters: [],
      homeStarterCount: 0,
      awayStarterCount: 0,
      source: null,
      note: errors.join(" · ") || "Ingen elvakälla svarade",
    },
    tried: ["fotmob", "espn"],
    error: errors.join(" · "),
  };
}

/** Skriv/uppdatera matchen i data/open/espn_lineups.json. */
export function upsertLineupCache(fixture) {
  const doc = readJson(LINEUPS_PATH) || {
    updatedAt: null,
    source: "mixed",
    note: "Elvor per match (Fotmob/ESPN). Bekräftas när källan publicerar starters.",
    fixtureCount: 0,
    confirmedCount: 0,
    pendingCount: 0,
    fixtures: [],
  };
  const key = `${fixture.league}|${fixture.date}|${fixture.home}|${fixture.away}`;
  const list = [...(doc.fixtures || [])];
  const idx = list.findIndex(
    (f) => `${f.league}|${f.date}|${f.home}|${f.away}` === key || (f.league === fixture.league && namesMatch(f.home, fixture.home) && namesMatch(f.away, fixture.away) && f.date === fixture.date)
  );
  const row = {
    ...fixture,
    fetchedAt: new Date().toISOString(),
  };
  if (idx >= 0) list[idx] = { ...list[idx], ...row };
  else list.push(row);

  doc.fixtures = list.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.home).localeCompare(String(b.home)));
  doc.fixtureCount = doc.fixtures.length;
  doc.confirmedCount = doc.fixtures.filter((f) => f.lineupStatus === "confirmed").length;
  doc.pendingCount = doc.fixtures.filter((f) => f.lineupStatus === "pending").length;
  doc.updatedAt = new Date().toISOString();
  doc.source = "fotmob+espn (per-match + bulk)";
  writeJson(LINEUPS_PATH, doc);
  return doc;
}

function applyLineupToTip(t, fixture) {
  const notes = [];
  if (fixture.lineupStatus === "confirmed") {
    notes.push(
      `XI bekräftad (${fixture.source || "okänd"})${fixture.homeFormation || fixture.awayFormation ? ` ${fixture.homeFormation || "?"} vs ${fixture.awayFormation || "?"}` : ""}`
    );
  } else if (fixture.lineupStatus === "pending") {
    notes.push("Elvor ej släppta än");
  } else if (fixture.note) {
    notes.push(fixture.note);
  }
  return {
    ...t,
    lineupStatus: fixture.lineupStatus || "none",
    lineupNotes: notes,
    homeFormation: fixture.homeFormation || null,
    awayFormation: fixture.awayFormation || null,
    homeStarters: fixture.homeStarters || [],
    awayStarters: fixture.awayStarters || [],
    lineupSource: fixture.source || null,
    fotmobMatchId: fixture.fotmobMatchId || null,
    espnEventId: fixture.espnEventId || null,
  };
}

/** Patcha tips-latest.json så analys/GUI ser elvan direkt. */
export function patchTipsWithLineup(fixture) {
  const tips = readJson(TIPS_PATH);
  if (!tips) return { patched: 0 };
  let n = 0;
  const patchList = (list) =>
    (list || []).map((t) => {
      if (t.league !== fixture.league || t.date !== fixture.date) return t;
      if (!namesMatch(t.home, fixture.home) || !namesMatch(t.away, fixture.away)) return t;
      n++;
      return applyLineupToTip(t, fixture);
    });
  tips.bestUpcoming = patchList(tips.bestUpcoming);
  tips.allCandidates = patchList(tips.allCandidates);
  if (n) writeJson(TIPS_PATH, tips);
  return { patched: n };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--") && i + 1 < argv.length) out[a.slice(2)] = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.league || !args.date || !args.home || !args.away) {
    console.error("Användning: node scripts/fetch-match-lineup.mjs --league SE3S --date 2026-09-27 --home Trelleborg --away Ängelholm");
    process.exit(1);
  }
  const result = await fetchMatchLineup(args);
  if (result.ok && result.fixture) {
    upsertLineupCache(result.fixture);
    const p = patchTipsWithLineup(result.fixture);
    console.log(
      JSON.stringify(
        {
          ok: true,
          status: result.fixture.lineupStatus,
          source: result.fixture.source,
          home: result.fixture.homeStarterCount,
          away: result.fixture.awayStarterCount,
          patchedTips: p.patched,
          homeStarters: (result.fixture.homeStarters || []).map((x) => x.name),
          awayStarters: (result.fixture.awayStarters || []).map((x) => x.name),
        },
        null,
        2
      )
    );
  } else {
    console.log(JSON.stringify({ ok: false, error: result.error, fixture: result.fixture }, null, 2));
    process.exitCode = 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
