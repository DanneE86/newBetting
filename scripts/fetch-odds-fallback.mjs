// Reservkalla for odds nar The Odds API saknar nyckel eller kvoten ar slut.
// football-data.co.uk publicerar kommande matcher med odds (gratis):
//  - fixtures.csv: europeiska ligor (Div E0/E1/SP1/I1/D1/F1/N1), 1X2 + O/U 2.5
//  - new_league_fixtures.csv: ovriga ligor (bl.a. Brasilien), 1X2
// Pinnacle finns inte langre dar -> Betfair Exchange (borsodds, lag marginal) blir facit, "Max" blir basta pris.
// Samma format som Fetch-OddsApi.ps1 -> data/open/upcoming_odds.json. Kor: node scripts/fetch-odds-fallback.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getText } from './lib/http.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.ODDS_OUT ?? path.join(root, 'data', 'open', 'upcoming_odds.json');
const RAW = path.join(root, 'data', 'raw');
const REG = JSON.parse(fs.readFileSync(path.join(root, 'config', 'leagues.json'), 'utf8'));
const DIV = {
  E0: 'PL', E1: 'CH', E2: 'EL1', SP1: 'LL', SP2: 'LL2', I1: 'SA', I2: 'SB',
  D1: 'BL', D2: 'BL2', F1: 'L1', N1: 'ED', P1: 'PT', G1: 'GR',
};

/** "Land|Liga" -> ligakod, las fran historik-CSV:erna (fd-new) sa att nya ligor i registret kommer med automatiskt. */
function newLeagueMap() {
  const map = {};
  for (const [code, lg] of Object.entries(REG.leagues)) {
    if (lg.history !== 'fd-new') continue;
    const file = path.join(RAW, `${code}_all.csv`);
    if (!fs.existsSync(file)) continue;
    const row = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/, 2)[1];
    if (!row) continue;
    const [country, league] = row.split(',');
    map[`${country.trim()}|${league.trim()}`] = code;
  }
  return map;
}
const NEW_LEAGUES = newLeagueMap();

async function csv(url) {
  const text = (await getText(url, { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny)' }, retries: 2 })).replace(/^﻿/, '').trim();
  const lines = text.split(/\r?\n/);
  const sep = lines[0].includes('\t') ? '\t' : ',';
  const head = lines[0].split(sep).map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((l) => Object.fromEntries(l.split(sep).map((v, i) => [head[i], v.trim()])));
}

const num = (v) => (v && Number(v) > 1 ? Number(v) : null);
const isoDate = (d) => { const [dd, mm, yy] = d.split('/'); return `${yy.length === 2 ? `20${yy}` : yy}-${mm}-${dd}`; };

function book(key, bookmaker, r, p) {
  const b = {
    key, bookmaker,
    home: num(r[`${p}H`]), draw: num(r[`${p}D`]), away: num(r[`${p}A`]),
    over25: num(r[`${p}>2.5`]), under25: num(r[`${p}<2.5`]),
  };
  return b.home && b.draw && b.away ? b : null;
}

function event(league, date, time, home, away, r) {
  // Betfair Exchange = skarpt facit; Max = marknadens basta pris (kontrollera hos ditt bolag)
  const books = [
    r.PSH ? book('pinnacle', 'Pinnacle', r, 'PS') : null,
    book('betfair_ex_eu', 'Betfair Exchange', r, 'BFE'),
    book('market_max', 'Marknadens basta (football-data)', r, 'Max'),
    book('bet365', 'Bet365', r, 'B365'),
  ].filter(Boolean);
  const avg = book('market_avg', 'Snitt', r, 'Avg');
  if (!books.length && !avg) return null;
  return {
    league, commence: `${date}T${time || '15:00'}:00Z`, home, away, homeRaw: home, awayRaw: away,
    bookmaker: 'Snitt (football-data)',
    odds: avg ? { home: avg.home, draw: avg.draw, away: avg.away, over25: avg.over25, under25: avg.under25 } : null,
    books, source: 'football-data fixtures',
  };
}

const events = [];
for (const r of await csv('https://www.football-data.co.uk/fixtures.csv')) {
  const lg = DIV[r.Div];
  if (!lg) continue;
  const e = event(lg, isoDate(r.Date), r.Time, r.HomeTeam, r.AwayTeam, r);
  if (e) events.push(e);
}
for (const r of await csv('https://www.football-data.co.uk/new_league_fixtures.csv')) {
  const lg = NEW_LEAGUES[`${r.Country?.trim()}|${r.League?.trim()}`];
  if (!lg) continue;
  const e = event(lg, isoDate(r.Date), r.Time, r.Home, r.Away, r);
  if (e) events.push(e);
}

// Behall tidigare API-odds (t.ex. fran en lokal hamtning med nyckel) for matcher som inte startat,
// annars raderar en korning utan nyckel (CI) alla bolagsodds.
const nowIso = new Date().toISOString();
const matchKey = (e) => `${e.league}|${String(e.commence).slice(0, 10)}|${e.home}|${e.away}`;
let kept = 0;
if (fs.existsSync(OUT)) {
  try {
    const old = JSON.parse(fs.readFileSync(OUT, 'utf8').replace(/^﻿/, ''));
    const fresh = new Set(events.map(matchKey));
    for (const e of old.events ?? []) {
      if (e.source === 'football-data fixtures' || !e.commence || e.commence < nowIso) continue;
      if (fresh.has(matchKey(e))) {
        // API-oddsen har fler bolag (Pinnacle, Unibet) -> ersatt reservraden
        const i = events.findIndex((x) => matchKey(x) === matchKey(e));
        events[i] = e;
      } else {
        events.push(e);
      }
      kept++;
    }
  } catch {
    /* trasig fil -> bara reservodds */
  }
}

fs.writeFileSync(OUT, JSON.stringify({
  loaded: events.length > 0,
  source: kept ? 'the-odds-api.com v4 (sparad) + football-data fixtures (reserv)' : 'football-data fixtures (reserv)',
  note: 'Pinnacle saknas i football-data sedan 2025/26 -> Betfair Exchange ar facit. Basta pris = marknadens max, kontrollera hos ditt bolag.',
  updatedAt: new Date().toISOString(),
  eventCount: events.length,
  keptApiEvents: kept,
  events,
}, null, 2), 'utf8');
console.log(`OK reservodds -> ${OUT} (${events.length} matcher, varav ${kept} sparade API-odds: ${[...new Set(events.map((e) => e.league))].join(',') || 'inga'})`);
