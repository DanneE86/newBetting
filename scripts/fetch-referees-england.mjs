// Officiella domare for engelska ligor, som kontroll av football-data (scripts/lib/referee-streaks.mjs):
//  - Premier League: premierleague.com (sdp-prem-prod...pulselive.com). Domare + VAR. Ersatter football-data.
//  - Championship, League One, League Two: efl.com (multi-club-matches.webapi.gc.eflservices.co.uk).
//    Anvands bara nar FotMob haller med (majoritet av tre kallor), efl.com har sjalvt fel ibland.
// Kontroll 2026-10-02 (2025/26 + 2026/27): PL 429/430 lika football-data, Championship 641/647.
// Sparas i data/open/referee_england.json. Inkrementellt: matcher som redan har domare hoppas over.
//   node scripts/fetch-referees-england.mjs              aktuell + 4 sasonger bakat
//   node scripts/fetch-referees-england.mjs --current    bara aktuell sasong (daglig korning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'referee_england.json');
const PL = 'https://sdp-prem-prod.premier-league-prod.pulselive.com/api';
const EFL = 'https://multi-club-matches.webapi.gc.eflservices.co.uk/v2/matches';
const EFL_COMPS = { CH: 10, EL1: 11, EL2: 12 };
const H = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' };
const onlyCurrent = process.argv.includes('--current');
const SEASONS = onlyCurrent ? 1 : 5;
const CONCURRENCY = 4;
const log = (s) => process.stdout.write(`${s}\n`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(url, { headers: H });
      if (res.ok) { const t = await res.text(); if (t) return JSON.parse(t); }
      else if (res.status === 404) return null;
    } catch { /* forsok igen (tomma svar vid strypning) */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}

async function pool(items, fn) {
  for (let i = 0; i < items.length; i += CONCURRENCY) await Promise.all(items.slice(i, i + CONCURRENCY).map(fn));
}

const doc = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return { matches: {} }; } })();
doc.matches ??= {};
const save = () => {
  doc.updatedAt = new Date().toISOString();
  doc.source = 'premierleague.com (PL, domare + VAR) och efl.com (CH, EL1, EL2, matchDetails.refereeName)';
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};

// Sasong = startar; fran juli raknas innevarande ar
const now = new Date();
const curSeason = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

async function premierLeague(season) {
  const done = [];
  for (let mw = 1; mw <= 38; mw++) {
    const j = await getJson(`${PL}/v2/matches?competition=8&season=${season}&matchweek=${mw}&_limit=20`);
    done.push(...(j?.data || []).filter((m) => m.period === 'FullTime'));
  }
  const todo = done.filter((m) => !doc.matches[`pl${m.matchId}`]?.r);
  let n = 0;
  await pool(todo, async (m) => {
    const o = (await getJson(`${PL}/v1/matches/${m.matchId}/officials`))?.matchOfficials || [];
    const name = (type) => o.find((x) => x.type === type)?.official?.name || null;
    const r = name('Referee');
    if (!r) return;
    const row = { id: `pl${m.matchId}`, src: 'pl', d: m.kickoff.slice(0, 10), lg: 'PL', h: m.homeTeam.name, a: m.awayTeam.name, r };
    const v = name('Video Assistant Referee');
    if (v) row.var = v;
    doc.matches[row.id] = row;
    n++;
  });
  log(`PL ${season}/${String((season + 1) % 100).padStart(2, '0')}: ${done.length} spelade, ${n} nya domare`);
}

async function efl(lg, season) {
  const list = [];
  for (let p = 1; p < 20; p++) {
    const j = await getJson(`${EFL}?competitionID=${EFL_COMPS[lg]}&seasonID=${season}&page.size=100&page.number=${p}`);
    list.push(...(j?.data || []));
    if (!j?.links?.next) break;
  }
  const done = list.filter((m) => m.attributes.matchPeriod === 'FullTime');
  const todo = done.filter((m) => !doc.matches[`efl${m.id}`]?.r);
  let n = 0;
  await pool(todo, async (m) => {
    const a = (await getJson(`${EFL}/${m.id}`))?.data?.attributes;
    const r = String(a?.matchDetails?.refereeName || a?.refereeName || '').trim();
    if (!r) return;
    doc.matches[`efl${m.id}`] = { id: `efl${m.id}`, src: 'efl', d: a.kickOffUTC.slice(0, 10), lg, h: m.attributes.homeTeam.name, a: m.attributes.awayTeam.name, r };
    n++;
  });
  log(`${lg} ${season}/${String((season + 1) % 100).padStart(2, '0')}: ${done.length} spelade, ${n} nya domare`);
}

for (let s = curSeason; s > curSeason - SEASONS; s--) {
  await premierLeague(s);
  save();
  for (const lg of Object.keys(EFL_COMPS)) { await efl(lg, s); save(); }
}
log(`Domare England (officiella): ${Object.keys(doc.matches).length} matcher`);
