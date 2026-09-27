// Reservkalla for odds nar The Odds API saknar nyckel eller kvoten ar slut.
// football-data.co.uk publicerar kommande matcher med odds (gratis):
//  - fixtures.csv: europeiska ligor (Div E0/E1/SP1/I1/D1/F1/N1), 1X2 + O/U 2.5
//  - new_league_fixtures.csv: ovriga ligor (bl.a. Brasilien), 1X2
// Pinnacle finns inte langre dar -> Betfair Exchange (borsodds, lag marginal) blir facit, "Max" blir basta pris.
// Samma format som Fetch-OddsApi.ps1 -> data/open/upcoming_odds.json. Kor: node scripts/fetch-odds-fallback.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.ODDS_OUT ?? path.join(root, 'data', 'open', 'upcoming_odds.json');
const DIV = { E0: 'PL', E1: 'CH', SP1: 'LL', SP2: 'LL2', I1: 'SA', D1: 'BL', F1: 'L1', N1: 'ED' };
const NEW_LEAGUES = { 'Brazil|Serie A': 'BR' };

async function csv(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny)' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = (await res.text()).replace(/^﻿/, '').trim();
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
  const lg = NEW_LEAGUES[`${r.Country}|${r.League}`];
  if (!lg) continue;
  const e = event(lg, isoDate(r.Date), r.Time, r.Home, r.Away, r);
  if (e) events.push(e);
}

fs.writeFileSync(OUT, JSON.stringify({
  loaded: events.length > 0,
  source: 'football-data fixtures (reserv)',
  note: 'Pinnacle saknas i football-data sedan 2025/26 -> Betfair Exchange ar facit. Basta pris = marknadens max, kontrollera hos ditt bolag.',
  updatedAt: new Date().toISOString(),
  eventCount: events.length,
  events,
}, null, 2), 'utf8');
console.log(`OK reservodds -> ${OUT} (${events.length} matcher: ${[...new Set(events.map((e) => e.league))].join(',') || 'inga i toppligorna just nu'})`);
