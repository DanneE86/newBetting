// Cuphistorik med truppvärde vid matchtillfället (Transfermarkt) för lärdomen "hur ofta vinner det billigare laget":
// CL, EL, ECL, Copa Libertadores och Copa Sudamericana sedan 2016. Resultat ur TM:s spelschema per säsong, truppvärdet
// ur klubbens truppsida samma säsong. Sparas i data/open/cup-history-tm.json; redan hämtade säsonger och klubbar hoppas
// över (avslutade säsonger ändras inte), innevarande säsong hämtas om.
// Kör: node scripts/fetch-cup-history-tm.mjs [--comp LIB,SUD]   Analys: node scripts/lardomar-cup-truppvarde.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getText, pool, sleep } from './lib/http.mjs';
import { CUP_HISTORY_COMPS, parseTmFixtures, parseTmSquadValue } from './lib/tm-cup-history.mjs';
import { seasonStartYear } from './lib/seasons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'cup-history-tm.json');
const BASE = 'https://www.transfermarkt.com';
const arg = process.argv.indexOf('--comp');
const only = arg > 0 ? new Set(process.argv[arg + 1].split(',')) : null;

const html = (url) => getText(url, { headers: { 'Accept-Language': 'en' }, orNull: true, retries: 3, retryDelayMs: 3000, throttleStatus: [429, 403] });
const doc = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { seasons: {}, clubs: {} };
const save = () => fs.writeFileSync(OUT, JSON.stringify({ ...doc, updatedAt: new Date().toISOString() }));

const nowSeason = seasonStartYear();
for (const [code, c] of Object.entries(CUP_HISTORY_COMPS)) {
  if (only && !only.has(code)) continue;
  for (let y = c.from; y <= nowSeason; y++) {
    const key = `${code}|${y}`;
    if (doc.seasons[key]?.matches?.length && y < nowSeason - 1) continue;
    const page = await html(`${BASE}/${c.slug}/gesamtspielplan/pokalwettbewerb/${c.comp}/saison_id/${y}`);
    const matches = parseTmFixtures(page).filter((m) => m.season == null || m.season === y);
    if (matches.length) doc.seasons[key] = { league: code, season: y, matches };
    console.log(`${key}: ${matches.length} matcher`);
    await sleep(800);
  }
  save();
}

// Truppvärde per klubb och säsong (bara spelade matcher behövs)
const need = new Set();
for (const s of Object.values(doc.seasons)) for (const m of s.matches) for (const id of [m.homeId, m.awayId]) need.add(`${id}|${s.season}`);
const todo = [...need].filter((k) => !(k in doc.clubs));
console.log(`Truppvärden: ${need.size - todo.length} finns, ${todo.length} hämtas`);
let n = 0;
await pool(todo, 4, async (k) => {
  const [id, y] = k.split('|');
  doc.clubs[k] = parseTmSquadValue(await html(`${BASE}/x/kader/verein/${id}/saison_id/${y}`));
  if (++n % 50 === 0) { console.log(`  ${n}/${todo.length}`); save(); }
  await sleep(700);
});
save();
console.log(`Klart: ${Object.values(doc.seasons).reduce((s, x) => s + x.matches.length, 0)} matcher, ${Object.values(doc.clubs).filter(Boolean).length} truppvärden`);
