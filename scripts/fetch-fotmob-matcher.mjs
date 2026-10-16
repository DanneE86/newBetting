// Optas matchstatistik via FotMob matchDetails, alla FotMob-ligor och alla säsonger där den finns.
// Lag per match (xG, xG öppet spel/fasta, xGOT, stora chanser, skott, passningar, dueller …) -> data/fotmob-matcher/<LIGA>/<säsong>.json
// Spelare per match (betyg, minuter, xG, xA, passningar, tacklingar …) -> data/fotmob-matcher/<LIGA>/spelare/<säsong>.json (gitignorerad, stor)
// export-league-matches fyller tomma xg_h/xg_a (xg_src = fotmob) och nya kolumner ur lagfilerna.
// Inkrementellt: hämtade matcher hoppas över, avslutade säsonger markeras klara. Går bakåt i säsonger tills
// FotMob saknar statistik (xG finns från ungefär 2020–2023, spelarsiffror från ungefär 2017, olika per liga).
//   node scripts/fetch-fotmob-matcher.mjs                       alla ligor, alla säsonger med statistik
//   node scripts/fetch-fotmob-matcher.mjs --leagues AS,NO,BR    bara dessa
//   node scripts/fetch-fotmob-matcher.mjs --seasons 3           högst 3 säsonger bakåt
//   node scripts/fetch-fotmob-matcher.mjs --current             bara aktuell säsong (daglig körning)
//   node scripts/fetch-fotmob-matcher.mjs --utan-spelare        bara lagstatistik
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';
import { fotmobGet } from './lib/api-schemas.mjs';
import { hasStats, playersFromDetails, seasonFile, teamFromDetails } from './lib/fotmob-match.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'fotmob-matcher');
const FM = 'https://www.fotmob.com/api/data';
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const onlyCurrent = process.argv.includes('--current');
const withPlayers = !process.argv.includes('--utan-spelare');
const SEASONS = onlyCurrent ? 1 : Number(arg('--seasons') || 15);
const CONCURRENCY = Number(arg('--concurrency') || 3);
const log = (s) => process.stdout.write(`${s}\n`);
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };

// Ligor utan xG per match först (understat/football-data täcker England och topp 5)
const FIRST = ['AS', 'NO', 'DK', 'BR', 'JP1', 'MLS', 'AR', 'KR', 'MX', 'BE', 'SC', 'PT', 'ED', 'GR', 'EK', 'CZ', 'HR', 'SAU', 'AUS', 'COL', 'BR2', 'CAN', 'NO2', 'SE2'];
const wanted = arg('--leagues')?.split(',').map((x) => x.trim().toUpperCase());
const order = [...FIRST, ...Object.keys(FOTMOB_LEAGUES).filter((c) => !FIRST.includes(c))];
const jobs = [];
const seenIds = new Set();
for (const code of order) {
  const v = FOTMOB_LEAGUES[code];
  if (!v || (wanted && !wanted.includes(code))) continue;
  const id = Array.isArray(v) ? v[0] : v;
  if (seenIds.has(id)) continue; // Ettan Norra/Södra = samma FotMob-id
  seenIds.add(id);
  jobs.push({ code, id });
}

async function runSeason(code, id, season, data) {
  const dir = path.join(OUT, code);
  const file = path.join(dir, `${seasonFile(season)}.json`);
  const pfile = path.join(dir, 'spelare', `${seasonFile(season)}.json`);
  const doc = readJson(file, { league: code, fotmobId: id, season, matches: {} });
  const pdoc = withPlayers ? readJson(pfile, { league: code, season, matches: {} }) : null;
  if (doc.complete && (!withPlayers || doc.players)) return { skipped: true, stats: doc.withStats > 0 };
  const all = data?.fixtures?.allMatches || [];
  if (!all.length) { log(`${code} ${season}: inget spelschema från FotMob`); return {}; }
  const done = all.filter((m) => m.status?.finished && !m.status?.cancelled && !m.status?.awarded);
  const todo = done.filter((m) => !doc.matches[String(m.id)] || (withPlayers && !pdoc.matches[String(m.id)] && doc.matches[String(m.id)].np));
  const save = () => {
    fs.mkdirSync(path.join(dir, 'spelare'), { recursive: true });
    const rows = Object.values(doc.matches);
    doc.withStats = rows.filter((r) => Object.keys(r.s).length).length;
    doc.withXg = rows.filter((r) => r.s.xg).length;
    doc.updatedAt = new Date().toISOString();
    doc.source = 'FotMob matchDetails (Opta)';
    fs.writeFileSync(file, `${JSON.stringify(doc)}\n`, 'utf8');
    if (pdoc) { pdoc.updatedAt = doc.updatedAt; fs.writeFileSync(pfile, `${JSON.stringify(pdoc)}\n`, 'utf8'); }
  };
  // Stickprov: första spelade matchen. Saknar den all statistik är säsongen för gammal och vi slutar gå bakåt.
  if (!Object.keys(doc.matches).length && todo.length) {
    const md = await fotmobGet(`${FM}/matchDetails?matchId=${todo[Math.floor(todo.length / 2)].id}`);
    const t = teamFromDetails(md), p = playersFromDetails(md);
    if (!hasStats(t, p)) return { empty: true };
  }
  let n = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (fx) => {
      const md = await fotmobGet(`${FM}/matchDetails?matchId=${fx.id}`);
      const t = teamFromDetails(md);
      if (!t) return;
      const p = playersFromDetails(md);
      if (p.length) { t.np = p.length; if (pdoc) pdoc.matches[t.id] = p; }
      doc.matches[t.id] = t;
      n++;
    }));
    if (n && n % 60 < CONCURRENCY) save();
  }
  const stored = done.filter((m) => doc.matches[String(m.id)]).length;
  doc.complete = all.length > 0 && all.every((m) => m.status?.finished || m.status?.cancelled) && stored === done.length;
  doc.players = withPlayers;
  save();
  log(`${code} ${season}: ${n} nya, ${stored}/${done.length} sparade, ${doc.withXg} med xG${doc.complete ? ', klar' : ''}`);
  return { stats: doc.withStats > 0 };
}

async function runLeague({ code, id }) {
  const first = await fotmobGet(`${FM}/leagues?id=${id}`);
  const seasons = (first?.allAvailableSeasons || []).slice(0, SEASONS);
  if (!seasons.length) { log(`${code}: inga säsonger från FotMob`); return; }
  for (const season of seasons) {
    const data = season === seasons[0] && first?.details?.selectedSeason === season ? first : await fotmobGet(`${FM}/leagues?id=${id}&season=${encodeURIComponent(season)}`);
    const r = await runSeason(code, id, season, data);
    if (r.empty) { log(`${code} ${season}: ingen statistik hos FotMob, äldre säsonger hoppas över`); break; }
  }
}

const t0 = Date.now();
for (const job of jobs) {
  try { await runLeague(job); } catch (e) { log(`${job.code}: fel ${e.message}`); }
}
log(`FotMob-matcher klar (${Math.round((Date.now() - t0) / 1000)} s)`);
