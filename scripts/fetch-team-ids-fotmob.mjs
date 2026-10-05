// Slar upp FotMob-ID for lag som bara har eget ID i config/team-ids.json (oftast lag som lamnat ligan).
// FotMob-sok ger lag och matcher; en kandidat godtas bara om namnet stammer och lagets liga/cup ligger
// i samma land som var liga (sa "Boavista" i Portugal aldrig blir Boavista RJ i Brasilien), och bara om
// exakt ett ID passar. Svaren sparas i data/open/fotmob-team-search.json, "LIGA|namn" -> ID (null = hittades inte).
// Kor sedan build-team-ids. Manuellt: npm run team-ids:sok
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILE, isOwnId } from './lib/team-ids.mjs';
import { sameTeamName } from './lib/team-aliases.mjs';
import { fotmobGet as get } from './lib/api-schemas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(root, 'data', 'open', 'fotmob-team-search.json');
const FM = 'https://www.fotmob.com/api/data';
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// FotMob-liga -> landskod (POR, ENG ...), men bara for herrligor som inte ar ungdom/reserv (damlag och
// U19-lag heter ofta som klubben: Lillestrom har bade 8476 och 8477)
const YOUTH = /\b(u\s?\d{2}|youth|junior|primavera|reserve|women|femin|frauen|dam)/i;
const leagueLand = new Map();
async function landOf(leagueId) {
  if (!leagueId) return null;
  if (!leagueLand.has(leagueId)) {
    const d = (await get(`${FM}/leagues?id=${leagueId}`))?.details;
    leagueLand.set(leagueId, d && d.gender === 'male' && !YOUTH.test(d.name ?? '') ? d.country ?? null : null);
    await sleep(150);
  }
  return leagueLand.get(leagueId);
}

/** Kandidater { id, name, leagueId } ur FotMob:s sokforslag (lag och matcher). */
function candidates(suggest) {
  // (leagueName filtreras ocksa, sa ungdomscuper inte behover slas upp)
  const out = [];
  for (const g of suggest ?? []) for (const s of g.suggestions ?? []) {
    if (s.type === 'team') out.push({ id: Number(s.id), name: s.name, leagueId: s.leagueId, leagueName: s.leagueName });
    if (s.type === 'match') {
      out.push({ id: Number(s.homeTeamId), name: s.homeTeamName, leagueId: s.leagueId, leagueName: s.leagueName });
      out.push({ id: Number(s.awayTeamId), name: s.awayTeamName, leagueId: s.leagueId, leagueName: s.leagueName });
    }
  }
  return out.filter((c) => c.id && c.name && !YOUTH.test(c.leagueName ?? ''));
}

const normName = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const reg = readJson(FILE, {}).leagues ?? {};
const cache = readJson(CACHE, {});
// Landskod per var liga fran truppfilernas FotMob-liga
const ourLand = {};
for (const f of fs.readdirSync(path.join(root, 'data', 'trupper')).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
  const d = readJson(path.join(root, 'data', 'trupper', f), {});
  if (d.league && d.fotmobId) ourLand[d.league] = await landOf(d.fotmobId);
}

let found = 0, missing = 0;
for (const [lg, m] of Object.entries(reg)) {
  const land = ourLand[lg];
  if (!land || land === 'INT') continue;
  for (const [name, id] of Object.entries(m)) {
    if (!isOwnId(id)) continue;
    const key = `${lg}|${name}`;
    if (key in cache) continue;
    const sug = await get(`${FM}/search/suggest?term=${encodeURIComponent(name)}`);
    await sleep(200);
    // Exakt samma namn gar fore langre namn ("Fortuna Dusseldorf" fore "Fortuna Dusseldorf II")
    const ids = new Set(), exact = new Set();
    for (const c of candidates(sug)) {
      if (!sameTeamName(name, c.name)) continue;
      if ((await landOf(c.leagueId)) !== land) continue;
      ids.add(c.id);
      if (normName(c.name) === normName(name)) exact.add(c.id);
    }
    cache[key] = exact.size === 1 ? [...exact][0] : ids.size === 1 ? [...ids][0] : null;
    cache[key] ? found++ : missing++;
    console.log(`  ${lg} ${name}: ${cache[key] ?? (ids.size > 1 ? `tvetydigt (${[...ids].join(', ')})` : 'saknas')}`);
  }
}
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2) + '\n', 'utf8');
console.log(`FotMob-sok: ${found} hittade, ${missing} utan ID -> ${path.relative(root, CACHE)}`);
