// Nyckelspelarnas speltid per ligamatch (FotMob/Opta) -> data/nyckelspelare/<LIGA>.json, kompakt och committad så att
// frånvarolagret (scripts/lib/key-absences.mjs, pro-lagret) fungerar i molnet där de stora spelarfilerna saknas
// (data/fotmob-matcher/*/spelare är gitignorerad). Lagets KEEP_PER_TEAM senaste ligamatcher sparas.
// Inkrementellt: en spelschemafråga per liga + matchDetails bara för nya matcher (lokala spelarfiler används först).
//   node scripts/fetch-nyckelspelare.mjs                  ligor med match inom 3 dagar i data/tips-latest.json
//   node scripts/fetch-nyckelspelare.mjs EL1 CH           bara dessa
//   node scripts/fetch-nyckelspelare.mjs --alla           alla FotMob-ligor
// Cuper hoppas över (8 ligamatcher behövs för att veta vem som är ordinarie).
//   node scripts/fetch-nyckelspelare.mjs --kalibrera      chans att starta nästa match per status ur hela den lokala
//                                                         FotMob-historiken -> config/nyckelspelare-chans.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOTMOB_LEAGUES } from './lib/fotmob-leagues.mjs';
import { fotmobGet } from './lib/api-schemas.mjs';
import { playersFromDetails, teamFromDetails } from './lib/fotmob-match.mjs';
import { KEEP_PER_TEAM, absenceRates, compactMatch, pruneStore } from './lib/key-absences.mjs';
import { isCup } from './lib/cups.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FM = 'https://www.fotmob.com/api/data';
const SRC = path.join(root, 'data', 'fotmob-matcher');
const OUT = path.join(root, 'data', 'nyckelspelare');
const RATES = path.join(root, 'config', 'nyckelspelare-chans.json');
const CONCURRENCY = 3;
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return d; } };
const args = process.argv.slice(2);

// Lokala säsonger (lagfil + spelarfil), nyast sist
function localSeasons(code, n) {
  const dir = path.join(SRC, code, 'spelare');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().slice(-n)
    .map((f) => ({ team: readJson(path.join(SRC, code, f))?.matches ?? {}, players: readJson(path.join(dir, f))?.matches ?? {} }));
}

if (args.includes('--kalibrera')) {
  const stores = [];
  let seasons = 0;
  for (const code of fs.readdirSync(SRC)) {
    for (const s of localSeasons(code, 4)) {
      const matches = {};
      for (const [id, m] of Object.entries(s.team)) if (s.players[id]?.length) matches[id] = compactMatch(m, s.players[id]);
      if (Object.keys(matches).length) { stores.push({ matches }); seasons++; }
    }
  }
  const rates = absenceRates(stores);
  const doc = {
    updatedAt: new Date().toISOString(),
    method: 'Ordinarie = startat minst 5 av lagets 8 senaste ligamatcher. Status efter senaste ligamatchen -> andel som startar '
      + '(start) och spelar (play) nästa. Spelare som inte spelar för laget igen inom 10 matcher (sålda) räknas inte.',
    seasons, rates,
  };
  fs.writeFileSync(RATES, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`Nyckelspelare: chans per status ur ${seasons} säsonger -> config/nyckelspelare-chans.json`);
  for (const [k, r] of Object.entries(rates)) console.log(`  ${k.padEnd(10)} n ${String(r.n).padStart(7)}  startar ${Math.round(r.start * 100)} %  spelar ${Math.round(r.play * 100)} %`);
  process.exit(0);
}

function upcomingLeagues(daysAhead = 3) {
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'), {});
  const now = Date.now(), limit = now + daysAhead * 864e5;
  const set = new Set();
  for (const t of [...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])]) {
    const k = Date.parse(t.kickoffUtc ?? `${t.date}T12:00:00Z`);
    if (k > now - 3 * 36e5 && k <= limit) set.add(t.league);
  }
  return [...set];
}

async function runLeague(code) {
  const v = FOTMOB_LEAGUES[code];
  if (!v) return console.log(`${code}: ingen FotMob-liga`);
  const file = path.join(OUT, `${code}.json`);
  const store = readJson(file, null) ?? { league: code, names: {}, matches: {} };
  store.names ??= {};
  const lg = await fotmobGet(`${FM}/leagues?id=${Array.isArray(v) ? v[0] : v}`);
  const done = (lg?.fixtures?.allMatches ?? []).filter((m) => m.status?.finished && !m.status?.cancelled && !m.status?.awarded);
  // Lokala säsonger fyller på och ger lagen historik från förra säsongen (lagets KEEP_PER_TEAM senaste)
  const local = localSeasons(code, 2);
  const localTeam = Object.assign({}, ...local.map((s) => s.team));
  const localPlayers = Object.assign({}, ...local.map((s) => s.players));
  const candidates = new Map(); // id -> { d, teams }
  for (const m of done) candidates.set(String(m.id), { d: String(m.status?.utcTime ?? '').slice(0, 10), teams: [Number(m.home?.id), Number(m.away?.id)] });
  for (const [id, m] of Object.entries(localTeam)) if (!candidates.has(id) && localPlayers[id]?.length) candidates.set(id, { d: m.d, teams: [Number(m.hid), Number(m.aid)] });
  // Behövs: lagets KEEP_PER_TEAM senaste
  const byTeam = new Map();
  for (const [id, c] of candidates) for (const t of c.teams) (byTeam.get(t) ?? byTeam.set(t, []).get(t)).push([id, c.d]);
  const need = new Set();
  for (const list of byTeam.values()) for (const [id] of list.sort((a, b) => (a[1] < b[1] ? 1 : -1)).slice(0, KEEP_PER_TEAM)) need.add(id);
  const todo = [...need].filter((id) => !store.matches[id]);
  let fromLocal = 0, fetched = 0;
  const addNames = (players) => { for (const p of players) if (p.id && p.n) store.names[String(p.id)] = p.n; };
  const remote = [];
  for (const id of todo) {
    if (localTeam[id] && localPlayers[id]?.length) {
      store.matches[id] = compactMatch(localTeam[id], localPlayers[id]);
      addNames(localPlayers[id]);
      fromLocal++;
    } else remote.push(id);
  }
  for (let i = 0; i < remote.length; i += CONCURRENCY) {
    await Promise.all(remote.slice(i, i + CONCURRENCY).map(async (id) => {
      const md = await fotmobGet(`${FM}/matchDetails?matchId=${id}`);
      const t = teamFromDetails(md);
      const p = playersFromDetails(md);
      if (!t || !p.length) return;
      store.matches[id] = compactMatch(t, p);
      addNames(p);
      fetched++;
    }));
  }
  pruneStore(store);
  if (!Object.keys(store.matches).length) return console.log(`${code}: ingen spelardata hos FotMob`);
  store.updatedAt = new Date().toISOString();
  store.source = 'FotMob matchDetails (Opta), lagets senaste ligamatcher';
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(store)}\n`);
  console.log(`${code}: ${Object.keys(store.matches).length} matcher (${fromLocal} ur lokala spelarfiler, ${fetched} hämtade nu)`);
}

const leagues = args.filter((a) => !a.startsWith('--')).map((a) => a.toUpperCase());
const list = (args.includes('--alla') ? Object.keys(FOTMOB_LEAGUES) : leagues.length ? leagues : upcomingLeagues())
  .filter((c) => FOTMOB_LEAGUES[c] && !isCup(c)).sort();
console.log(`Nyckelspelare: ${list.join(', ') || 'inga ligor'}`);
for (const code of list) {
  try { await runLeague(code); } catch (e) { console.log(`${code}: fel ${e.message}`); }
}
