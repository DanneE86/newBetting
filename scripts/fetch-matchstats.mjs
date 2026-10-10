// Matchstatistik per match (lag + spelare) -> data/matchstats/<LIGA>/<år>.json, läses av export-league-matches.
//  - ESPN (config "espn" eller "espnStats"): matchsammanfattningen per match. Lagstatistik (bollinnehav, passningar,
//    skott, hörnor, frisparkar, kort, offside, räddningar, tacklingar …) finns från ungefär 2024 i Norden/Japan och
//    längre bak i de flesta andra ligor; äldre matcher har bara händelserna (mål per halvlek, kort).
//  - 365scores (config "s365" = tävlings-id): ligor ESPN saknar (Superettan, Ekstraklasa, HNL, Chance Liga, OBOS,
//    K League, Kanada). Källan ger bara ungefär ett år bakåt, så filen byggs på för varje körning.
// Spelare per match sparas från PLAYERS_FROM (förra året och framåt), äldre matcher bara lagstatistik.
// Färdiga matcher hämtas aldrig om. Kör: npm run matchstats  [-- --league=AS,PL] [--from=2018] [--recent]
//   --recent = innevarande och förra året, bara nya matcher (daglig körning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getJson, pool, sleep } from './lib/http.mjs';
import { parseEspnSummary, parse365, seasonPlayers, PLAYER_COLS } from './lib/matchstats.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REG = JSON.parse(fs.readFileSync(path.join(root, 'config', 'leagues.json'), 'utf8'));
const OUT = path.join(root, 'data', 'matchstats');
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const S365 = 'https://webws.365scores.com/web';
const H365 = { Referer: 'https://www.365scores.com/', Accept: 'application/json' };

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const YEAR = new Date().getUTCFullYear();
const RECENT = process.argv.includes('--recent');
const FROM = RECENT ? YEAR - 1 : Number(arg('from') ?? 2018);
const ONLY = arg('league')?.split(',');
const SRC = arg('only'); // espn | 365
const PLAYERS_FROM = YEAR - 1;
const today = new Date().toISOString().slice(0, 10);

const fileOf = (lg, y) => path.join(OUT, lg, `${y}.json`);
const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
function load(lg, y) {
  return readJson(fileOf(lg, y), { league: lg, year: y, updatedAt: null, complete: false, playerCols: PLAYER_COLS, matches: {} });
}
function save(doc) {
  fs.mkdirSync(path.join(OUT, doc.league), { recursive: true });
  doc.updatedAt = new Date().toISOString();
  // Matcherna sorterade på datum så att diffarna blir små
  doc.matches = Object.fromEntries(Object.entries(doc.matches).sort(([, a], [, b]) => (a.d + a.h).localeCompare(b.d + b.h)));
  fs.writeFileSync(fileOf(doc.league, doc.year), JSON.stringify(doc), 'utf8');
}
const slim = (m, y) => {
  if (y < PLAYERS_FROM) delete m.p;
  return m;
};

// ---------- ESPN ----------
async function espnLeague(code, slug) {
  const stats = { listed: 0, fetched: 0, withTeam: 0 };
  for (let y = FROM; y <= YEAR; y++) {
    const doc = load(code, y);
    if (doc.complete && y < YEAR - 1) continue; // avslutat år, allt hämtat
    const sb = await getJson(`${ESPN}/${slug}/scoreboard?dates=${y}&limit=1000`, { orNull: true, retries: 4, label: 'ESPN scoreboard' });
    const evs = (sb?.events ?? []).filter((e) => e.status?.type?.completed);
    stats.listed += evs.length;
    const todo = evs.filter((e) => !doc.matches[e.id]);
    let n = 0;
    await pool(todo, 10, async (e) => {
      const j = await getJson(`${ESPN}/${slug}/summary?event=${e.id}`, { orNull: true, retries: 4, label: 'ESPN summary' });
      const m = parseEspnSummary(j);
      if (!m) return;
      doc.matches[e.id] = slim(m, y);
      stats.fetched++;
      if (m.t.h) stats.withTeam++;
      if (++n % 150 === 0) save(doc);
    });
    // Året är klart när det har passerat och allt listat finns
    doc.complete = y < YEAR && evs.every((e) => doc.matches[e.id]);
    if (evs.length || Object.keys(doc.matches).length) save(doc);
    if (todo.length) console.log(`  ${code} ${y}: ${todo.length} nya (${Object.keys(doc.matches).length} totalt)`);
  }
  return stats;
}

// ---------- 365scores ----------
async function get365(p) {
  const url = `${S365}${p}${p.includes('?') ? '&' : '?'}appTypeId=5&langId=1`;
  const r = await getJson(url, { orNull: true, headers: H365, retries: 4, retryDelayMs: 3000, throttleStatus: [429, 403], label: '365scores' });
  await sleep(700); // snällt mot 365scores (blockerar vid för många anrop)
  return r;
}
async function league365(code, comp) {
  const stats = { listed: 0, fetched: 0, withTeam: 0 };
  // Resultatlistan bläddras bakåt (previousPage) tills den tar slut eller passerar FROM
  const games = [];
  let p = `/games/results/?competitions=${comp}`;
  for (let i = 0; i < 60 && p; i++) {
    const j = await get365(p.replace(/^\/web/, ''));
    const g = (j?.games ?? []).filter((x) => x.competitionId === comp && x.statusGroup === 4);
    if (!j?.games?.length) break;
    games.push(...g);
    if (Number(String(j.games[0].startTime).slice(0, 4)) < FROM) break;
    p = j.paging?.previousPage;
  }
  stats.listed = games.length;
  const docs = new Map();
  const docOf = (y) => docs.get(y) ?? docs.set(y, load(code, y)).get(y);
  const todo = games.filter((g) => {
    const y = Number(g.startTime.slice(0, 4));
    return y >= FROM && !docOf(y).matches[`365-${g.id}`];
  });
  let n = 0;
  for (const g of todo) {
    const y = Number(g.startTime.slice(0, 4));
    const det = await get365(`/game/?gameId=${g.id}`);
    const st = det?.game?.hasStats ? await get365(`/game/stats/?games=${g.id}`) : null;
    const m = parse365(det?.game, st);
    if (!m) continue;
    docOf(y).matches[`365-${g.id}`] = slim(m, y);
    stats.fetched++;
    if (m.t.h) stats.withTeam++;
    if (++n % 50 === 0) for (const d of docs.values()) save(d);
  }
  for (const d of docs.values()) if (Object.keys(d.matches).length) save(d);
  if (todo.length) console.log(`  ${code}: ${todo.length} nya från 365scores`);
  return stats;
}

// ---------- Säsongssummor per spelare ----------
function writePlayerSeasons(code) {
  const dir = path.join(OUT, code);
  if (!fs.existsSync(dir)) return;
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => /^\d{4}\.json$/.test(x))) {
    const y = Number(f.slice(0, 4));
    if (y < PLAYERS_FROM) continue;
    const ms = Object.values(readJson(path.join(dir, f), { matches: {} }).matches).filter((m) => m.p?.length);
    if (ms.length) out[y] = seasonPlayers(ms);
  }
  if (Object.keys(out).length) {
    fs.writeFileSync(path.join(dir, 'spelare.json'), JSON.stringify({ league: code, updatedAt: new Date().toISOString(), note: 'Summa per spelare och kalenderår (matcherna i <år>.json)', years: out }), 'utf8');
  }
}

const report = readJson(path.join(OUT, 'rapport.json'), { leagues: {} });
for (const [code, lg] of Object.entries(REG.leagues)) {
  if (ONLY && !ONLY.includes(code)) continue;
  const slug = lg.espn ?? lg.espnStats;
  const r = { updatedAt: today };
  try {
    if (slug && SRC !== '365') { console.log(`${code} (ESPN ${slug})`); Object.assign(r, { src: 'espn' }, await espnLeague(code, slug)); }
    else if (lg.s365 && SRC !== 'espn') { console.log(`${code} (365scores ${lg.s365})`); Object.assign(r, { src: '365' }, await league365(code, lg.s365)); }
    else continue;
    writePlayerSeasons(code);
  } catch (e) {
    r.error = e.message;
    console.warn(`${code}: ${e.message}`);
  }
  report.leagues[code] = { ...report.leagues[code], ...r };
}
fs.mkdirSync(OUT, { recursive: true });
report.updatedAt = new Date().toISOString();
fs.writeFileSync(path.join(OUT, 'rapport.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log('Klart: data/matchstats');
