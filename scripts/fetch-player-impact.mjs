// Hamtar underlag for spelarviktad franvaro fran Understat:
//  - getLeagueData per liga/sasong: lagens matcher med xG + spelarnas sasongssummor
//  - getPlayerData for spelare med >= MIN_SHARE av lagets anfall: alla matcher (minuter, xG, xA)
// Cache: data/open/understat_league_matches.json + data/open/understat_player_matches.json
// Kor: npm run players:impact
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  leagues: path.join(root, 'data', 'open', 'understat_league_matches.json'),
  players: path.join(root, 'data', 'open', 'understat_player_matches.json'),
};
export const US_LEAGUES = { EPL: 'PL', La_liga: 'LL', Serie_A: 'SA', Bundesliga: 'BL', Ligue_1: 'L1' };
const SEASONS = [2024, 2025, 2026];
const CURRENT_SEASON = 2026;
const MIN_SHARE = 0.03;          // (xG+xA) / (2 * lagets xG) under sasongen
const REFRESH_DAYS = 3;          // spelare i aktuell sasong hamtas om efter sa har manga dagar
const DELAY_MS = 800;            // snallt tempo mot Understat

const HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'User-Agent': 'Mozilla/5.0 (betting-ny research)',
  Referer: 'https://understat.com/',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (p, fb) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fb);

async function getJson(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.json();
    if (attempt === 4 || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${url}`);
    await sleep(attempt * 10_000);
  }
}

// ---------- Ligor ----------
const leagueDoc = readJson(P.leagues, { seasons: {} });
const selected = new Map(); // understat player id -> {name, current}
for (const [code, league] of Object.entries(US_LEAGUES)) {
  for (const season of SEASONS) {
    const key = `${code}_${season}`;
    const cached = leagueDoc.seasons[key];
    const stale = season === CURRENT_SEASON || !cached;
    let data = cached;
    if (stale) {
      const j = await getJson(`https://understat.com/getLeagueData/${code}/${season}`);
      data = {
        league, season,
        matches: j.dates.filter((d) => d.isResult).map((d) => ({
          id: d.id, date: d.datetime.slice(0, 10),
          home: d.h.title, away: d.a.title, hg: +d.goals.h, ag: +d.goals.a, hxG: +d.xG.h, axG: +d.xG.a,
        })),
        players: j.players.map((p) => ({
          id: p.id, name: p.player_name, team: p.team_title, games: +p.games, time: +p.time, xG: +p.xG, xA: +p.xA,
        })),
      };
      leagueDoc.seasons[key] = data;
      await sleep(DELAY_MS);
    }
    // lagets xG under sasongen -> vilka spelare ar viktiga nog att hamta
    const teamXg = new Map();
    for (const m of data.matches) {
      teamXg.set(m.home, (teamXg.get(m.home) ?? 0) + m.hxG);
      teamXg.set(m.away, (teamXg.get(m.away) ?? 0) + m.axG);
    }
    for (const p of data.players) {
      // Spelare med flera klubbar under sasongen har team "A,B" - rakna mot storsta
      const txg = Math.max(...p.team.split(',').map((t) => teamXg.get(t) ?? 0));
      if (txg > 0 && (p.xG + p.xA) / (2 * txg) >= MIN_SHARE) {
        const prev = selected.get(p.id);
        selected.set(p.id, { name: p.name, current: (prev?.current ?? false) || season === CURRENT_SEASON });
      }
    }
    console.log(`  ${key}: ${data.matches.length} matcher, ${data.players.length} spelare`);
  }
}
leagueDoc.updatedAt = new Date().toISOString();
fs.writeFileSync(P.leagues, JSON.stringify(leagueDoc), 'utf8');

// ---------- Spelare ----------
const playerDoc = readJson(P.players, { players: {} });
const now = Date.now();
const todo = [...selected].filter(([id, s]) => {
  const c = playerDoc.players[id];
  if (!c) return true;
  return s.current && now - Date.parse(c.fetchedAt) > REFRESH_DAYS * 86_400_000;
});
console.log(`Spelare: ${selected.size} valda (andel >= ${MIN_SHARE}), ${todo.length} att hamta`);

let n = 0;
for (const [id, s] of todo) {
  try {
    const j = await getJson(`https://understat.com/getPlayerData/${id}`);
    playerDoc.players[id] = {
      name: s.name,
      fetchedAt: new Date().toISOString(),
      // team per sasong (flera rader om spelaren bytt klubb)
      teams: (j.groups?.season ?? []).map((g) => ({ season: +g.season, team: g.team })),
      matches: j.matches
        .filter((m) => +m.season >= SEASONS[0])
        .map((m) => ({ id: m.id, date: m.date, season: +m.season, home: m.h_team, away: m.a_team, time: +m.time, xG: +m.xG, xA: +m.xA, pos: m.position })),
    };
  } catch (e) {
    console.log(`  FAIL ${id} ${s.name}: ${e.message}`);
  }
  if (++n % 50 === 0) {
    console.log(`  ${n}/${todo.length}`);
    save();
  }
  await sleep(DELAY_MS);
}
save();
console.log(`Klar: ${Object.keys(playerDoc.players).length} spelare i cache -> ${P.players}`);

function save() {
  playerDoc.updatedAt = new Date().toISOString();
  playerDoc.minShare = MIN_SHARE;
  fs.writeFileSync(P.players, JSON.stringify(playerDoc), 'utf8');
}
