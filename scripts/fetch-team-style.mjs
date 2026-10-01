// Spelstil per lag och sasong fran FotMobs lagstatistik (samma som fotmob.com/leagues/<id>/stats).
//   data/stil/<liga>.json   sasong -> lag -> { poss, pass, longBalls, possWonAtt3rd, clearances, tackles, interceptions, m }
// Lagnamn mappas till vara via data/matcher/<liga>.csv (scripts/lib/fotmob-names.mjs). Avslutade sasonger hamtas
// en gang, innevarande sasong hamtas om varje korning. Anvands av scripts/analyze-style-matchups.mjs.
// Kors: node scripts/fetch-team-style.mjs [PL CH ...] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { mapTable } from './lib/fotmob-names.mjs';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';

const FM = 'https://www.fotmob.com/api/data';
const DIR_OUT = path.join(root, 'data', 'stil');
// FotMob-statistik -> vart falt
const STATS = {
  possession_percentage_team: 'poss',
  accurate_pass_team: 'pass',
  accurate_long_balls_team: 'longBalls',
  poss_won_att_3rd_team: 'possWonAtt3rd',
  effective_clearance_team: 'clearances',
  total_tackle_team: 'tackles',
  interception_team: 'interceptions',
};
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
      if (res.status === 429) await sleep(15000 * (i + 1)); // strypt
    } catch { /* forsok igen */ }
    await sleep(1000 * (i + 1));
  }
  return null;
}

// Vara sasonger och lagnamn per sasong ur data/matcher/<liga>.csv
function ourSeasons(code) {
  const file = path.join(root, 'data', 'matcher', `${code}.csv`);
  if (!fs.existsSync(file)) return new Map();
  const out = new Map();
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(1)) {
    const c = l.split(',');
    if (!c[2] || c[2] === 'season') continue;
    if (!out.has(c[2])) out.set(c[2], new Set());
    for (const n of [c[5], c[6]]) if (n) out.get(c[2]).add(n);
  }
  return out;
}
// 2017/18 -> 2017/2018, 2024 -> 2024
const fmSeason = (s) => (/^\d{4}\/\d{2}$/.test(s) ? `${s.slice(0, 5)}${s.slice(0, 2)}${s.slice(5)}` : s);

const only = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const FORCE = process.argv.includes('--force');
fs.mkdirSync(DIR_OUT, { recursive: true });
for (const [code, spec] of Object.entries(FOTMOB_LEAGUES)) {
  if (only.length && !only.includes(code)) continue;
  const [id] = Array.isArray(spec) ? spec : [spec];
  const seasons = ourSeasons(code);
  if (!seasons.size) continue;
  const outFile = path.join(DIR_OUT, `${code}.json`);
  const prev = readJson(outFile, { seasons: {} });
  const lgNow = await getJson(`${FM}/leagues?id=${id}`);
  const available = new Set(lgNow?.allAvailableSeasons ?? []);
  const current = lgNow?.allAvailableSeasons?.[0];
  const allNames = [...new Set([...seasons.values()].flatMap((s) => [...s]))];
  const out = { updatedAt: new Date().toISOString(), league: code, fotmobId: id, source: 'FotMob', seasons: { ...prev.seasons } };
  let fetched = 0;
  for (const [season, names] of seasons) {
    const fs_ = fmSeason(season);
    // Liga MX: FotMob delar sasongen i Apertura och Clausura, de slas ihop (viktat med matcher)
    const parts = available.has(fs_) ? [fs_] : [...available].filter((x) => x.startsWith(`${fs_} - `));
    if (!parts.length) continue;
    if (!FORCE && out.seasons[season] && !parts.includes(current)) continue;
    const teams = new Map(); // FotMob-id -> { name, m, stats }
    for (const part of parts) {
      const doc = part === current ? lgNow : await getJson(`${FM}/leagues?id=${id}&season=${encodeURIComponent(part)}`);
      const urls = Object.fromEntries((doc?.stats?.teams ?? []).filter((t) => STATS[t.name]).map((t) => [t.name, t.fetchAllUrl]));
      if (!urls.possession_percentage_team) continue;
      const partTeams = new Map();
      for (const [stat, field] of Object.entries(STATS)) {
        if (!urls[stat]) continue;
        const d = await getJson(urls[stat]);
        for (const x of d?.TopLists?.[0]?.StatList ?? []) {
          if (!partTeams.has(x.TeamId)) partTeams.set(x.TeamId, { name: x.ParticipantName, m: x.MatchesPlayed ?? null });
          partTeams.get(x.TeamId)[field] = x.StatValue;
        }
        await sleep(120);
      }
      for (const [tid, t] of partTeams) {
        const prevT = teams.get(tid);
        if (!prevT) { teams.set(tid, t); continue; }
        const w0 = prevT.m ?? 1, w1 = t.m ?? 1;
        for (const field of Object.values(STATS)) {
          if (t[field] == null) continue;
          prevT[field] = prevT[field] == null ? t[field] : Math.round(((prevT[field] * w0 + t[field] * w1) / (w0 + w1)) * 100) / 100;
        }
        prevT.m = w0 + w1;
      }
    }
    if (!teams.size) continue;
    const map = mapTable({ cur: [...names], all: allNames }, [...teams].map(([tid, t]) => ({ id: tid, name: t.name })));
    const rows = {};
    for (const [tid, t] of teams) {
      const ours = map.get(tid);
      if (!names.has(ours)) continue; // lag utan matcher i var data (t.ex. annan grupp i Ettan)
      const { name, ...rest } = t;
      rows[ours] = { fotmobName: name, ...rest };
    }
    const missing = [...names].filter((n) => !rows[n]);
    if (missing.length) console.warn(`  ${code} ${season}: saknar stil for ${missing.join(', ')}`);
    out.seasons[season] = rows;
    fetched++;
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1), 'utf8');
  console.log(`${code}: ${fetched} sasonger hamtade, ${Object.keys(out.seasons).length} totalt`);
}
