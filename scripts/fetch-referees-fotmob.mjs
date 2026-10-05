// Domarhistorik fran FotMob: domare, mal, gula, roda, frisparkar och straffar per spelad match, alla ligor.
// England: football-data ar kalla for resultat/kort, FotMob ger straffarna. Sparas i data/open/referee_fotmob.json
// och laggs ihop med football-data i scripts/lib/referee-streaks.mjs (loadRefereeMatches).
// Inkrementellt: redan hamtade matcher hoppas over, sa forsta korningen ar stor och sedan gar det fort.
// Sparar efter var 50:e match, sa ett avbrott (strypning) inte tappar nagot - kor bara igen.
//   node scripts/fetch-referees-fotmob.mjs                     alla ligor, 4 sasonger
//   node scripts/fetch-referees-fotmob.mjs --leagues AS,SE2    bara dessa
//   node scripts/fetch-referees-fotmob.mjs --seasons 6         fler sasonger bakat
//   node scripts/fetch-referees-fotmob.mjs --current           bara aktuell sasong (daglig korning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';
import { refLeagueKey, rowFromFotmob } from './lib/referee-streaks.mjs';
import { fotmobGet as getJson } from './lib/api-schemas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'referee_fotmob.json');
const FM = 'https://www.fotmob.com/api/data';
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
// England: football-data har domare och kort men inte straffar -> FotMob-raderna ger straffarna (attachPenalties)
const DATA_VERSION = 2; // 2 = med straffar (hp/ap); aldre rader hamtas om
const onlyCurrent = process.argv.includes('--current');
const SEASONS = onlyCurrent ? 1 : Number(arg('--seasons') || 4);
const CONCURRENCY = Number(arg('--concurrency') || 4);
const log = (s) => process.stdout.write(`${s}\n`);

// Liga-nycklar i hamtningsordning (Allsvenskan forst), en per FotMob-id (Ettan Norra/Sodra = samma id -> SE3)
const order = ['AS', ...Object.keys(FOTMOB_LEAGUES).filter((c) => !['SE2', 'SE3N', 'SE3S', 'PL', 'CH', 'EL1', 'EL2'].includes(c)), 'PL', 'CH', 'EL1', 'EL2'];
const wanted = arg('--leagues')?.split(',').map((x) => x.trim().toUpperCase());
const jobs = [];
const seenIds = new Set();
for (const code of order) {
  if ((wanted && !wanted.includes(code) && !wanted.includes(refLeagueKey(code)))) continue;
  const v = FOTMOB_LEAGUES[code];
  const id = Array.isArray(v) ? v[0] : v;
  if (!id || seenIds.has(id)) continue;
  seenIds.add(id);
  jobs.push({ key: refLeagueKey(code), id });
}

const readDoc = () => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return { leagues: {} }; } };
const doc = readDoc();
doc.leagues ??= {};
if (doc.version !== DATA_VERSION) { doc.leagues = {}; doc.version = DATA_VERSION; }
const save = () => {
  doc.updatedAt = new Date().toISOString();
  doc.source = 'FotMob matchDetails (infoBox.Referee, stats yellow_cards/red_cards/fouls)';
  doc.matches = Object.values(doc.leagues).reduce((s, l) => s + Object.keys(l.matches || {}).length, 0);
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};

async function runLeague({ key, id }) {
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
    let n = 0, refs = 0;
    for (let i = 0; i < todo.length; i += CONCURRENCY) {
      await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (fx) => {
        const md = await getJson(`${FM}/matchDetails?matchId=${fx.id}`);
        if (!md) return;
        const row = rowFromFotmob(md, fx, key);
        if (!row) return;
        lg.matches[row.id] = row;
        n++;
        if (row.r) refs++;
      }));
      if (n && n % 50 < CONCURRENCY) save();
    }
    const stored = done.filter((m) => lg.matches[String(m.id)]).length;
    // Avslutad sasong: alla matcher spelade och hamtade -> hoppas over nasta gang
    const complete = all.length > 0 && all.every((m) => m.status?.finished || m.status?.cancelled) && stored === done.length;
    lg.seasons[season] = { complete, matches: all.length, finished: done.length, stored };
    save();
    log(`${key} ${season}: ${n} nya (${refs} med domare), ${stored}/${done.length} spelade sparade${complete ? ', klar' : ''}`);
  }
}

const t0 = Date.now();
for (const job of jobs) await runLeague(job);
save();
log(`Domare FotMob: ${doc.matches} matcher i ${Object.keys(doc.leagues).length} ligor (${Math.round((Date.now() - t0) / 1000)} s)`);
