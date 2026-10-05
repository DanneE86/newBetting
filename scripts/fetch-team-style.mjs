// Spelstil per lag och sasong fran FotMobs lagstatistik (samma som fotmob.com/leagues/<id>/stats).
//   data/stil/<liga>.json   sasong -> lag -> { poss, pass, longBalls, possWonAtt3rd, clearances, tackles, interceptions,
//                           spFor, spXgFor, spAgainst, spXgAgainst, corners (fasta situationer och horn per match), m }
// Lagnamn mappas till vara via data/matcher/<liga>.csv (scripts/lib/fotmob-names.mjs). Avslutade sasonger hamtas
// en gang, innevarande sasong hamtas om varje korning. Anvands av scripts/analyze-style-matchups.mjs.
// Kors: node scripts/fetch-team-style.mjs [PL CH ...] [--force]
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { mapTable } from './lib/fotmob-names.mjs';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';
import { ALL_FIELDS, STATS, SUB, statFields } from './lib/team-style.mjs';
import { fotmobGet as getJson } from './lib/api-schemas.mjs';

const FM = 'https://www.fotmob.com/api/data';
const DIR_OUT = path.join(root, 'data', 'stil');
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  // sasonger sparade medan de pagick: hamtas om tills de sparats som avslutade
  const ongoing = new Set(prev.ongoing ?? []);
  let fetched = 0;
  for (const [season, names] of seasons) {
    const fs_ = fmSeason(season);
    // Liga MX: FotMob delar sasongen i Apertura och Clausura, de slas ihop (viktat med matcher)
    const parts = available.has(fs_) ? [fs_] : [...available].filter((x) => x.startsWith(`${fs_} - `));
    if (!parts.length) continue;
    const isCurrent = parts.includes(current);
    // Sparade avslutade sasonger: hamta bara statistik som saknas (t.ex. nya falt), annars hoppa over
    const saved = out.seasons[season];
    const full = FORCE || !saved || isCurrent || ongoing.has(season);
    const firstRow = saved ? Object.values(saved)[0] ?? {} : {};
    const need = Object.fromEntries(Object.entries(STATS).filter(([, field]) => full || !(field in firstRow)));
    if (!Object.keys(need).length) continue;
    const teams = new Map(); // FotMob-id -> { name, m, stats }
    for (const part of parts) {
      const doc = part === current ? lgNow : await getJson(`${FM}/leagues?id=${id}&season=${encodeURIComponent(part)}`);
      const urls = Object.fromEntries((doc?.stats?.teams ?? []).filter((t) => STATS[t.name]).map((t) => [t.name, t.fetchAllUrl]));
      if (!urls.possession_percentage_team) continue;
      const partTeams = new Map();
      for (const [stat, field] of Object.entries(need)) {
        if (!urls[stat]) continue;
        const d = await getJson(urls[stat]);
        for (const x of d?.TopLists?.[0]?.StatList ?? []) {
          if (!partTeams.has(x.TeamId)) partTeams.set(x.TeamId, { name: x.ParticipantName, m: x.MatchesPlayed ?? null });
          Object.assign(partTeams.get(x.TeamId), statFields(field, x));
        }
        await sleep(120);
      }
      for (const [tid, t] of partTeams) {
        const prevT = teams.get(tid);
        if (!prevT) { teams.set(tid, t); continue; }
        const w0 = prevT.m ?? 1, w1 = t.m ?? 1;
        for (const field of ALL_FIELDS) {
          if (t[field] == null) continue;
          prevT[field] = prevT[field] == null ? t[field] : Math.round(((prevT[field] * w0 + t[field] * w1) / (w0 + w1)) * 100) / 100;
        }
        prevT.m = w0 + w1;
      }
    }
    if (!teams.size) {
      // FotMob saknar de nya falten for sasongen: spara null sa sasongen inte hamtas om nasta korning
      if (!full) {
        const asked = Object.fromEntries(Object.values(need).flatMap((f) => [f, SUB[f]]).filter(Boolean).map((f) => [f, null]));
        out.seasons[season] = Object.fromEntries(Object.entries(saved).map(([t, r]) => [t, { ...asked, ...r }]));
      }
      continue;
    }
    const map = mapTable({ cur: [...names], all: allNames }, [...teams].map(([tid, t]) => ({ id: tid, name: t.name })));
    const rows = {};
    for (const [tid, t] of teams) {
      const ours = map.get(tid);
      if (!names.has(ours)) continue; // lag utan matcher i var data (t.ex. annan grupp i Ettan)
      const { name, ...rest } = t;
      // falt som efterfragades men saknas hos FotMob sparas som null, sa de inte hamtas om varje korning
      const asked = Object.fromEntries(Object.values(need).flatMap((f) => [f, SUB[f]]).filter(Boolean).map((f) => [f, null]));
      rows[ours] = { ...(full ? {} : saved?.[ours]), ...asked, fotmobName: name, ...rest };
    }
    const missing = [...names].filter((n) => !rows[n]);
    if (missing.length) console.warn(`  ${code} ${season}: saknar stil for ${missing.join(', ')}`);
    out.seasons[season] = rows;
    if (isCurrent) ongoing.add(season); else ongoing.delete(season);
    fetched++;
  }
  out.ongoing = [...ongoing];
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1), 'utf8');
  console.log(`${code}: ${fetched} sasonger hamtade, ${Object.keys(out.seasons).length} totalt`);
}
