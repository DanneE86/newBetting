// Säsong för säsong per klubb och liga från FotMob (careerHistory.seasonEntries i playerData) för alla spelare i
// data/spelare/<liga>.json som bytt klubb sedan FROM. Underlag för övergångsanalysen (scripts/lardomar-overgangar.mjs).
//   data/spelare/_karriar.json   id -> { name, born, pos, fetchedAt, seasons: [[säsong, lagId, lag, övergång,
//                                 [[ligaId, liga, matcher, mål, assist, betyg], ...]], ...] }   (nyast först)
// Spelare hämtade senaste 30 dagarna återanvänds (karriären ändras bara vid nya matcher).
// Körs: node scripts/fetch-player-careers-fotmob.mjs [--from 2024-01-01] [--force] [--limit N] [--parallel 2] [--sleep 400]
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { careerSeasons } from './lib/transfer-study.mjs';
import { fotmobGet } from './lib/api-schemas.mjs';

const FM = 'https://www.fotmob.com/api/data';
const MAX_AGE_D = 30;
const DIR = path.join(root, 'data', 'spelare');
const OUT = path.join(DIR, '_karriar.json');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FROM = opt('--from', '2024-01-01');
const LIMIT = Number(opt('--limit', Infinity));
const FORCE = args.includes('--force');
const PARALLEL = Number(opt('--parallel', 2));
const PAUSE_MS = Number(opt('--sleep', 400));
let throttled = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return d; } };
const ageDays = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 864e5 : Infinity);

const getJson = (url) => fotmobGet(url, { onResponse: (r) => { if (r.status === 429) throttled++; } });

// Spelare som bytt klubb sedan FROM (karriärens startdatum), en gång per id
const want = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => /^[A-Z0-9]+\.json$/.test(x))) {
  const d = readJson(path.join(DIR, f), {});
  for (const t of Object.values(d.teams ?? {})) for (const p of t.players ?? []) {
    if (typeof p.id !== 'number' || want.has(p.id)) continue;
    if ((p.career ?? []).some((c, i) => i < p.career.length - 1 && c[1] && c[1] >= FROM)) want.set(p.id, p);
  }
}
const out = readJson(OUT, {});
const todo = [...want.values()].filter((p) => FORCE || ageDays(out[p.id]?.fetchedAt) > MAX_AGE_D)
  // Slumpad ordning: ett avbrott ger ändå alla ligor, inte bara de första i bokstavsordning
  .map((p) => [Math.random(), p]).sort((a, b) => a[0] - b[0]).map(([, p]) => p).slice(0, LIMIT);
console.log(`${want.size} spelare med klubbyte sedan ${FROM}, ${todo.length} att hämta`);

let done = 0, failed = 0;
// Skriv till en tillfällig fil och byt namn, så att ett avbrott mitt i skrivningen aldrig lämnar en trasig fil
const save = () => { fs.writeFileSync(`${OUT}.tmp`, JSON.stringify(out), 'utf8'); fs.renameSync(`${OUT}.tmp`, OUT); };
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  for (let p = todo.shift(); p; p = todo.shift()) {
    const d = await getJson(`${FM}/playerData?id=${p.id}`);
    await sleep(PAUSE_MS);
    if (!d?.id) { failed++; continue; }
    out[p.id] = { name: d.name ?? p.name, born: p.info?.born ?? null, pos: p.position?.group ?? null, fetchedAt: new Date().toISOString(),
      seasons: careerSeasons(d.careerHistory?.careerItems?.senior?.seasonEntries) };
    if (++done % 250 === 0) { save(); console.log(`  ${done} hämtade (${failed} misslyckade, ${throttled} strypningar)`); }
  }
}));
save();
console.log(`Klart: ${done} hämtade, ${failed} misslyckade, ${Object.keys(out).length} i filen`);
