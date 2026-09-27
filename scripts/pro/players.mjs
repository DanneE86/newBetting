// Spelarviktad franvaro: hur stor del av lagets anfall (xG + xA) saknas i en match.
// Underlag: scripts/fetch-player-impact.mjs (Understat). Anvands av pro-layer.mjs.
import fs from 'node:fs';
import { daysBetween } from './lib.mjs';

const WINDOW_DAYS = 365;     // historik for spelarens andel
const HALF_LIFE_DAYS = 180;  // nyare matcher vager mer
const MIN_SHARE = 0.03;      // spelare under detta raknas inte
const AROUND_DAYS = 60;      // "tillhor laget": spelat for laget inom sa manga dagar fore (och efter) matchen
const MAX_MISSING = 0.6;

/**
 * Bygger modellen. storeMatches anvands for att oversatta Understat-lagnamn -> football-data-namn
 * (samma datum +-1 dag och samma resultat).
 */
export function loadPlayerModel(leaguePath, playerPath, storeMatches) {
  if (!fs.existsSync(leaguePath) || !fs.existsSync(playerPath)) return null;
  const leagueDoc = JSON.parse(fs.readFileSync(leaguePath, 'utf8'));
  const playerDoc = JSON.parse(fs.readFileSync(playerPath, 'utf8'));

  const usMatches = Object.values(leagueDoc.seasons).flatMap((s) => s.matches.map((m) => ({ ...m, league: s.league })));
  const nameMap = mapTeamNames(usMatches, storeMatches);

  // Lagets matcher (football-data-namn) med xG
  const teamMatches = new Map();
  const matchById = new Map();
  for (const m of usMatches) {
    const home = nameMap.get(`${m.league}|${m.home}`);
    const away = nameMap.get(`${m.league}|${m.away}`);
    if (!home || !away) continue;
    const row = { ...m, home, away, usHome: m.home, usAway: m.away };
    matchById.set(m.id, row);
    push(teamMatches, `${m.league}|${home}`, { id: m.id, date: m.date, xg: m.hxG });
    push(teamMatches, `${m.league}|${away}`, { id: m.id, date: m.date, xg: m.axG });
  }
  for (const list of teamMatches.values()) list.sort((a, b) => a.date.localeCompare(b.date));

  // Spelarens framtradanden per lag: matchId -> {time, xG, xA}
  const playersByTeam = new Map(); // "PL|Arsenal" -> [{id, name, apps: Map}]
  for (const [id, p] of Object.entries(playerDoc.players)) {
    const byTeam = new Map();
    for (const a of p.matches) {
      const m = matchById.get(a.id);
      if (!m) continue;
      const seasonTeams = new Set(p.teams.filter((t) => t.season === a.season).map((t) => t.team));
      const side = seasonTeams.has(m.usHome) ? 'home' : seasonTeams.has(m.usAway) ? 'away' : null;
      if (!side) continue;
      const key = `${m.league}|${m[side]}`;
      if (!byTeam.has(key)) byTeam.set(key, new Map());
      byTeam.get(key).set(a.id, { date: a.date, time: a.time, xG: a.xG, xA: a.xA });
    }
    for (const [key, apps] of byTeam) push(playersByTeam, key, { id, name: p.name, apps });
  }

  return { nameMap, teamMatches, playersByTeam, matchById, playerCount: Object.keys(playerDoc.players).length };
}

/**
 * Spelarnas andel av lagets anfall fore `date` (endast data fore datumet).
 * share = viktad (xG + xA) / (2 * viktad lag-xG) fran spelarens forsta match i fonstret.
 */
export function teamShares(model, league, team, date) {
  const key = `${league}|${team}`;
  const tm = (model.teamMatches.get(key) ?? []).filter((m) => m.date < date && daysBetween(m.date, date) <= WINDOW_DAYS);
  if (tm.length < 3) return [];
  const w = (d) => 0.5 ** (daysBetween(d, date) / HALF_LIFE_DAYS);
  const out = [];
  for (const p of model.playersByTeam.get(key) ?? []) {
    let first = null;
    let num = 0;
    let lastApp = null;
    for (const m of tm) {
      const a = p.apps.get(m.id);
      if (!a) continue;
      first ??= m.date;
      num += w(m.date) * (a.xG + a.xA);
      lastApp = m.date;
    }
    if (!first) continue;
    const den = tm.filter((m) => m.date >= first).reduce((s, m) => s + w(m.date) * 2 * m.xg, 0);
    if (den <= 0) continue;
    const share = num / den;
    if (share >= MIN_SHARE) out.push({ id: p.id, name: p.name, share, lastApp, apps: p.apps });
  }
  return out.sort((a, b) => b.share - a.share);
}

/**
 * Historisk franvaro i en spelad match: viktiga spelare som tillhor laget men inte spelade.
 * Enstaka missade matcher ar oftast rotation (tranaren vilar stjarnor nar laget anda vantas vinna),
 * sa franvaron maste ingå i en svit om minst MIN_RUN lagmatcher i rad - liknar skada/avstangning.
 */
const MIN_RUN = 2;
export function historicalMissing(model, league, team, date, usMatchId) {
  const shares = teamShares(model, league, team, date);
  const tm = model.teamMatches.get(`${league}|${team}`) ?? [];
  const idx = tm.findIndex((m) => m.id === usMatchId);
  const missing = [];
  for (const p of shares) {
    if (p.apps.has(usMatchId)) continue;
    if (idx >= 0 && MIN_RUN > 1) {
      // Langsta svit av missade lagmatcher som innehaller denna match
      let run = 1;
      for (let i = idx - 1; i >= 0 && !p.apps.has(tm[i].id); i--) run++;
      for (let i = idx + 1; i < tm.length && !p.apps.has(tm[i].id); i++) run++;
      if (run < MIN_RUN) continue;
    }
    if (!p.lastApp || daysBetween(p.lastApp, date) > AROUND_DAYS) continue; // inte langre i laget
    const after = [...p.apps.values()].some((a) => a.date > date && daysBetween(date, a.date) <= AROUND_DAYS);
    const teamPlaysAfter = (model.teamMatches.get(`${league}|${team}`) ?? []).some((m) => m.date > date && daysBetween(date, m.date) <= 21);
    if (!after && teamPlaysAfter) continue; // har troligen lamnat klubben
    missing.push({ name: p.name, share: p.share });
  }
  return summarise(missing);
}

export function summarise(missing) {
  const total = Math.min(MAX_MISSING, missing.reduce((s, m) => s + m.share * (m.weight ?? 1), 0));
  return { missingShare: total, players: missing };
}

/** Understat-match-id for en store-match (samma lag + datum +-1). */
export function findUsMatch(model, league, home, away, date) {
  for (const m of model.teamMatches.get(`${league}|${home}`) ?? []) {
    if (Math.abs(daysBetween(m.date, date)) > 1) continue;
    const row = model.matchById.get(m.id);
    if (row.home === home && row.away === away) return row;
  }
  return null;
}

function mapTeamNames(usMatches, storeMatches) {
  const byDay = new Map();
  for (const m of storeMatches) push(byDay, `${m.league}|${m.hg}-${m.ag}`, m);
  const votes = new Map();
  for (const u of usMatches) {
    for (const s of byDay.get(`${u.league}|${u.hg}-${u.ag}`) ?? []) {
      if (Math.abs(daysBetween(s.date, u.date)) > 1) continue;
      vote(votes, `${u.league}|${u.home}`, s.home);
      vote(votes, `${u.league}|${u.away}`, s.away);
    }
  }
  const map = new Map();
  for (const [k, counts] of votes) {
    const [best, n] = [...counts].sort((a, b) => b[1] - a[1])[0];
    if (n >= 3) map.set(k, best);
  }
  return map;
}

function vote(votes, k, name) {
  if (!votes.has(k)) votes.set(k, new Map());
  const c = votes.get(k);
  c.set(name, (c.get(name) ?? 0) + 1);
}

function push(map, k, v) {
  if (!map.has(k)) map.set(k, []);
  map.get(k).push(v);
}
