// Bygger config/team-ids.json: ett ID per lag och liga. FotMob-ID fran data/trupper/<LIGA>.json,
// annars FotMob-sok (data/open/fotmob-team-search.json, npm run team-ids:sok), annars eget ID (behalls mellan korningar). Lagnamnen kommer fran trupperna och data/matcher/<LIGA>.csv.
// Manuellt: npm run team-ids
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILE, buildTeamIds, isOwnId } from './lib/team-ids.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return d; } };

const squads = {};
const dir = path.join(root, 'data', 'trupper');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
  const d = readJson(path.join(dir, f), {});
  const lg = d.league ?? path.basename(f, '.json');
  for (const [n, t] of Object.entries(d.teams ?? {})) if (t?.fotmobId) (squads[lg] ??= {})[n] = Number(t.fotmobId);
}

const names = {};
const mdir = path.join(root, 'data', 'matcher');
for (const f of fs.readdirSync(mdir).filter((x) => x.endsWith('.csv'))) {
  const lg = path.basename(f, '.csv');
  const rows = fs.readFileSync(path.join(mdir, f), 'utf8').trim().split(/\r?\n/).slice(1).map((l) => l.split(','));
  names[lg] = [...new Set(rows.flatMap((r) => [r[5], r[6]]).filter(Boolean))];
}

// Land per liga (EL2 m.fl. som inte star i leagues.json raknas till England)
const country = { EL2: 'England' };
for (const [lg, v] of Object.entries(readJson(path.join(root, 'config', 'leagues.json'), {}).leagues ?? {})) if (v.country) country[lg] = v.country;

const prev = readJson(FILE, {}).leagues ?? {};
const searched = readJson(path.join(root, 'data', 'open', 'fotmob-team-search.json'), {});
const leagues = buildTeamIds({ squads, names, prev, country, searched });
let fm = 0, own = 0;
for (const lg of Object.values(leagues)) for (const id of Object.values(lg)) isOwnId(id) ? own++ : fm++;
fs.writeFileSync(FILE, JSON.stringify({
  note: 'Ett ID per lag: FotMob-ID (fotmob.com/teams/<id>) eller eget ID fran 90000001 nar FotMob saknas. Samma klubb = samma ID i alla ligor. Byggs av scripts/build-team-ids.mjs.',
  updatedAt: new Date().toISOString(),
  leagues,
}, null, 2) + '\n', 'utf8');
console.log(`Lag-ID: ${fm} med FotMob-ID, ${own} med eget ID -> ${path.relative(root, FILE)}`);
