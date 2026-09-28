// Skarpa odds for matcher utanfor klubbmodellen (landskamper, Europacup, nordiska ligor, cuper) fran The Odds API.
// Bara 1X2 (h2h), region eu = 1 kredit per turnering. Cache i data/open/stryk_extra_odds.json (max 3 h gammal),
// och inga anrop om krediterna ar farre an MIN_CREDITS (Oddsets hamtning delar kvoten).
//   const odds = await extraOdds(leagueNames)          // hamtar/cachar de turneringar som behovs
//   const m = matchExtraOdds(odds, { kickoff, home, away, homeCountry, awayCountry })  // -> { p, odds, source } | null
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findSharpBook, devigMultiplicative } from '../pro/lib.mjs';
import { nameScore } from './match-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = path.join(root, 'data', 'open', 'stryk_extra_odds.json');
// Cache-alder: 3 h normalt, kortare nara spelstopp (STRYK_ODDS_MAX_AGE_MIN, t.ex. 20 i den sena korningen)
const MAX_AGE_H = Number(process.env.STRYK_ODDS_MAX_AGE_MIN ?? 180) / 60;
const MIN_CREDITS = 40;

// Svenska Spels liganamn -> The Odds API sport key
const SPORT_KEYS = [
  [/nations league/i, 'soccer_uefa_nations_league'],
  [/champions league/i, 'soccer_uefa_champs_league'],
  [/europa league/i, 'soccer_uefa_europa_league'],
  [/conference league/i, 'soccer_uefa_europa_conference_league'],
  [/vm-kval.*europa|världsmästerskapskval.*europa/i, 'soccer_fifa_world_cup_qualifiers_europe'],
  [/^vm$|fotbolls-vm/i, 'soccer_fifa_world_cup'],
  [/^em$|em-kval/i, 'soccer_uefa_european_championship'],
  [/^allsvenskan$/i, 'soccer_sweden_allsvenskan'],
  [/^superettan$/i, 'soccer_sweden_superettan'],
  [/eliteserien/i, 'soccer_norway_eliteserien'],
  [/superligan/i, 'soccer_denmark_superliga'],
  [/veikkausliiga/i, 'soccer_finland_veikkausliiga'],
  [/^premiership$/i, 'soccer_spl'],
  [/efl cup|ligacupen/i, 'soccer_england_efl_cup'],
  [/fa cup/i, 'soccer_fa_cup'],
  // Engelska klubbligor (Stryktipset) - hamtas bara nar STRYK_FRESH_ODDS=1 (sen korning nara spelstopp)
  [/^premier league$/i, 'soccer_epl'],
  [/^championship$/i, 'soccer_efl_champ'],
  [/^league one$/i, 'soccer_england_league1'],
  [/^league two$/i, 'soccer_england_league2'],
];
export const sportKeyFor = (league) => SPORT_KEYS.find(([re]) => re.test(String(league || '')))?.[1] || null;

function apiKey() {
  if (process.env.THE_ODDS_API_KEY || process.env.ODDS_API_KEY) return process.env.THE_ODDS_API_KEY || process.env.ODDS_API_KEY;
  try {
    const env = fs.readFileSync(path.join(root, '.env'), 'utf8');
    const m = /^(?:THE_ODDS_API_KEY|ODDS_API_KEY)\s*=\s*(.+)$/m.exec(env);
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch { return null; }
}

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { return { sports: {} }; }
}

export async function extraOdds(leagueNames, log = () => {}) {
  const cache = readCache();
  const keys = [...new Set(leagueNames.map(sportKeyFor).filter(Boolean))];
  const stale = keys.filter((k) => !cache.sports[k] || Date.now() - Date.parse(cache.sports[k].fetchedAt) > MAX_AGE_H * 3600e3);
  const key = stale.length ? apiKey() : null;
  if (stale.length && !key) log('  Extra odds: ingen THE_ODDS_API_KEY – använder cache/Svenska Spels odds');
  for (const k of key ? stale : []) {
    if (cache.creditsRemaining != null && cache.creditsRemaining < MIN_CREDITS) { log(`  Extra odds: bara ${cache.creditsRemaining} krediter kvar – hoppar över ${k}`); continue; }
    try {
      const res = await fetch(`https://api.the-odds-api.com/v4/sports/${k}/odds/?apiKey=${key}&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`);
      const left = Number(res.headers.get('x-requests-remaining'));
      if (Number.isFinite(left)) cache.creditsRemaining = left;
      if (!res.ok) { log(`  Extra odds ${k}: HTTP ${res.status}`); if (res.status === 404 || res.status === 422) cache.sports[k] = { fetchedAt: new Date().toISOString(), events: [] }; continue; }
      const data = await res.json();
      // outcomes ar sorterade alfabetiskt -> matcha pa lagnamn, inte position
      const events = data.map((e) => ({
        commence: e.commence_time, home: e.home_team, away: e.away_team,
        books: (e.bookmakers || []).map((b) => {
          const o = b.markets?.find((m) => m.key === 'h2h')?.outcomes || [];
          const price = (name) => o.find((x) => x.name === name)?.price;
          return { key: b.key, bookmaker: b.title, home: price(e.home_team), draw: price('Draw'), away: price(e.away_team) };
        }).filter((b) => b.home && b.draw && b.away),
      }));
      cache.sports[k] = { fetchedAt: new Date().toISOString(), events };
      log(`  Extra odds ${k}: ${events.length} matcher (krediter kvar ${cache.creditsRemaining ?? '?'})`);
    } catch (e) { log(`  Extra odds ${k}: ${e.message}`); }
  }
  if (key && stale.length) {
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1), 'utf8');
  }
  return cache;
}

export function matchExtraOdds(cache, { league, kickoff, home, away, homeCountry, awayCountry }) {
  const k = sportKeyFor(league);
  const events = k ? cache?.sports?.[k]?.events || [] : [];
  const t = Date.parse(kickoff);
  let best = null;
  for (const e of events) {
    if (!Number.isFinite(t) || Math.abs(Date.parse(e.commence) - t) > 3 * 3600e3) continue;
    const sh = nameScore(home, homeCountry, e.home), sa = nameScore(away, awayCountry, e.away);
    if (sh >= 0.6 && sa >= 0.6 && (!best || sh + sa > best.s)) best = { s: sh + sa, e };
  }
  if (!best) return null;
  const books = best.e.books;
  const sharp = findSharpBook(books);
  if (sharp) return { p: devigMultiplicative([sharp.home, sharp.draw, sharp.away]), odds: [sharp.home, sharp.draw, sharp.away], source: sharp.bookmaker || sharp.key };
  const ps = books.map((b) => devigMultiplicative([b.home, b.draw, b.away])).filter(Boolean);
  if (ps.length < 3) return null;
  return { p: [0, 1, 2].map((i) => ps.reduce((sum, x) => sum + x[i], 0) / ps.length), odds: null, source: `snitt ${ps.length} bolag` };
}
