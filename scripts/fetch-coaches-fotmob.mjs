// Tranare per spelad match fran FotMob (matchDetails content.lineup.*.coach). Sparas i data/open/coach_fotmob.json.
// Anvandaren 2026-10-02 kvall: "borja hamta tranare" - for att testa om tranare har lattare/svarare mot visst motstand.
// Standard: engelska ligorna (PL, CH, EL1, EL2), 5 sasonger (2022/23 ->), samma som domartestet.
// Inkrementellt: redan hamtade matcher hoppas over. Sparar efter var 50:e match, sa ett avbrott inte tappar nagot.
//   node scripts/fetch-coaches-fotmob.mjs                      England, 5 sasonger
//   node scripts/fetch-coaches-fotmob.mjs --leagues PL,LL      bara dessa
//   node scripts/fetch-coaches-fotmob.mjs --seasons 8          fler sasonger bakat
//   node scripts/fetch-coaches-fotmob.mjs --current            bara aktuell sasong (daglig korning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';
import { coachRowFromFotmob } from './lib/coaches.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'coach_fotmob.json');
const FM = 'https://www.fotmob.com/api/data';
const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'application/json',
};
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const onlyCurrent = process.argv.includes('--current');
const SEASONS = onlyCurrent ? 1 : Number(arg('--seasons') || 5);
const CONCURRENCY = Number(arg('--concurrency') || 4);
const LEAGUES = (arg('--leagues') || 'PL,CH,EL1,EL2').split(',').map((x) => x.trim().toUpperCase());
const log = (s) => process.stdout.write(`${s}\n`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let backoff = 0;
async function getJson(url) {
  for (let i = 0; i < 5; i++) {
    if (backoff) await sleep(backoff);
    try {
      const res = await fetch(url, { headers: UA });
      if (res.ok) { backoff = Math.max(0, backoff - 250); return await res.json(); }
      if (res.status === 404) return null;
      if (res.status === 429 || res.status === 403) { backoff = Math.min(30000, (backoff || 2000) * 2); log(`  strypt (${res.status}), vantar ${backoff / 1000} s`); }
    } catch { /* forsok igen */ }
    await sleep(1000 * (i + 1));
  }
  return null;
}

const doc = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return { leagues: {} }; } })();
doc.leagues ??= {};
const save = () => {
  doc.updatedAt = new Date().toISOString();
  doc.source = 'FotMob matchDetails (content.lineup.homeTeam.coach / awayTeam.coach)';
  doc.matches = Object.values(doc.leagues).reduce((s, l) => s + Object.keys(l.matches || {}).length, 0);
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};

async function runLeague(key) {
  const v = FOTMOB_LEAGUES[key];
  const id = Array.isArray(v) ? v[0] : v;
  if (!id) { log(`${key}: okand liga`); return; }
  const lg = (doc.leagues[key] ??= { fotmobId: id, seasons: {}, matches: {} });
  const first = await getJson(`${FM}/leagues?id=${id}`);
  const seasons = (first?.allAvailableSeasons || []).slice(0, SEASONS);
  if (!seasons.length) { log(`${key}: inga sasonger fran FotMob`); return; }
  for (const season of seasons) {
    if (lg.seasons[season]?.complete && !onlyCurrent) continue;
    const data = season === seasons[0] && first?.details?.selectedSeason === season ? first : await getJson(`${FM}/leagues?id=${id}&season=${encodeURIComponent(season)}`);
    const all = data?.fixtures?.allMatches || [];
    const done = all.filter((m) => m.status?.finished && !m.status?.cancelled && !m.status?.awarded);
    const todo = done.filter((m) => !lg.matches[String(m.id)]);
    let n = 0, withCoach = 0;
    for (let i = 0; i < todo.length; i += CONCURRENCY) {
      await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (fx) => {
        const md = await getJson(`${FM}/matchDetails?matchId=${fx.id}`);
        if (!md) return;
        const row = coachRowFromFotmob(md, fx, key);
        if (!row) return;
        lg.matches[row.id] = row;
        n++;
        if (row.hc && row.ac) withCoach++;
      }));
      if (n && n % 50 < CONCURRENCY) save();
    }
    const stored = done.filter((m) => lg.matches[String(m.id)]).length;
    const complete = all.length > 0 && all.every((m) => m.status?.finished || m.status?.cancelled) && stored === done.length;
    lg.seasons[season] = { complete, matches: all.length, finished: done.length, stored };
    save();
    log(`${key} ${season}: ${n} nya (${withCoach} med bada tranarna), ${stored}/${done.length} spelade sparade${complete ? ', klar' : ''}`);
  }
}

const t0 = Date.now();
for (const key of LEAGUES) await runLeague(key);
save();
log(`Tranare FotMob: ${doc.matches} matcher i ${Object.keys(doc.leagues).length} ligor (${Math.round((Date.now() - t0) / 1000)} s)`);
