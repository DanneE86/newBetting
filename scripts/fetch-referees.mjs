// Domare: historik och kommande matcher, for domarsviter per lag (scripts/lib/referee-streaks.mjs).
//  - data/open/referee_history.json: football-data.co.uk E0-E3 (PL, Championship, League One, League Two) fran
//    2012/13, en post per sasong och division. Aldre sasonger hamtas en gang, aktuell och forra sasongen varje korning.
//  - data/open/referees_upcoming.json: tillsatt domare fran FotMob for engelska ligamatcher kommande 8 dagar
//    (data/upcoming-fixtures.json + tips-latest.json). Domare tillsatts normalt nagra dagar fore matchen.
// Kors av Fetch-OpenSources.ps1 fore pro-layer (som satter tip.referee). Manuellt: npm run domare (--full = allt om).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REF_DIVISIONS, REF_LEAGUES, parseRefereeCsv } from './lib/referee-streaks.mjs';
import { fetchReferee } from './lib/match-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HIST = path.join(root, 'data', 'open', 'referee_history.json');
const UPCOMING = path.join(root, 'data', 'open', 'referees_upcoming.json');
const FIXTURES = path.join(root, 'data', 'upcoming-fixtures.json');
const TIPS = path.join(root, 'data', 'tips-latest.json'); // League One m.fl. finns bara har
const FIRST_SEASON = 2012;
const HORIZON_DAYS = 8;
const full = process.argv.includes('--full');
const skipHistory = process.argv.includes('--upcoming');

const readJson = (p, fb) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return fb; } };
const writeJson = (p, o, indent = 1) => fs.writeFileSync(p, `${JSON.stringify(o, null, indent)}\n`, 'utf8');
const log = (s) => process.stdout.write(`${s}\n`);

// Sasongskod "2627" for sasongen som startar 2026 (juli-juni)
const now = new Date();
const curStart = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
const code = (y) => `${String(y % 100).padStart(2, '0')}${String((y + 1) % 100).padStart(2, '0')}`;

async function getText(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, redirect: 'follow' });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* forsok igen */ }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

async function updateHistory() {
  const doc = readJson(HIST, null) || {};
  const bySeason = full ? {} : doc.bySeason || {};
  let fetched = 0;
  for (let y = FIRST_SEASON; y <= curStart; y++) {
    for (const [div, league] of Object.entries(REF_DIVISIONS)) {
      const k = `${code(y)}|${div}`;
      if (bySeason[k] && y < curStart - 1) continue;
      const text = await getText(`https://www.football-data.co.uk/mmz4281/${code(y)}/${div}.csv`);
      if (text == null) continue;
      bySeason[k] = parseRefereeCsv(text, league);
      fetched++;
    }
  }
  const n = Object.values(bySeason).reduce((s, l) => s + l.length, 0);
  writeJson(HIST, { updatedAt: new Date().toISOString(), source: 'football-data.co.uk E0-E3 (Referee, ligamatcher)', matches: n, bySeason }, 0);
  log(`Domarhistorik: ${n} matcher (${fetched} filer hamtade)`);
}

async function updateUpcoming() {
  const today = now.toISOString().slice(0, 10);
  const until = new Date(now.getTime() + HORIZON_DAYS * 86400e3).toISOString().slice(0, 10);
  const key = (f) => `${f.league}|${f.date}|${f.home}|${f.away}`;
  const all = new Map();
  for (const f of [...(readJson(TIPS, {})?.allCandidates || []), ...(readJson(FIXTURES, []) || [])]) {
    if (!REF_LEAGUES.has(f.league) || !(f.date >= today && f.date <= until)) continue;
    const k = key(f);
    if (!all.get(k)?.kickoffUtc) all.set(k, { league: f.league, date: f.date, home: f.home, away: f.away, kickoffUtc: f.kickoffUtc || all.get(k)?.kickoffUtc || null });
  }
  const fixtures = [...all.values()];
  // Tidigare hittade domare behalls om FotMob inte svarar nu
  const old = new Map((readJson(UPCOMING, {})?.matches || []).filter((m) => m.date >= today).map((m) => [key(m), m]));
  const out = new Map(old);
  for (let i = 0; i < fixtures.length; i += 4) {
    await Promise.all(fixtures.slice(i, i + 4).map(async (f) => {
      const hit = await fetchReferee({ kickoff: f.kickoffUtc, date: f.date, home: f.home, away: f.away }).catch(() => null);
      if (!hit) return;
      const prev = old.get(key(f));
      out.set(key(f), { league: f.league, date: f.date, home: f.home, away: f.away, kickoffUtc: f.kickoffUtc || null, fotmobMatchId: hit.fotmobMatchId, referee: hit.referee || prev?.referee || null });
    }));
  }
  const matches = [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
  const withRef = matches.filter((m) => m.referee).length;
  writeJson(UPCOMING, { updatedAt: new Date().toISOString(), source: 'FotMob matchDetails infoBox.Referee', matches });
  log(`Kommande domare: ${withRef}/${fixtures.length} matcher har tillsatt domare`);
}

if (!skipHistory) await updateHistory();
await updateUpcoming();
