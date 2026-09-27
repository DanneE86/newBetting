// Extra ligor fran config/leagues.json (utover openfootball-ligorna i Fetch-OpenSources.ps1):
//  - history "fd-new": football-data.co.uk/new/<fdNew>.csv -> data/raw/<LIGA>_all.csv  (BR, AS)
//  - history "espn":   ESPN-resultat innevarande + foregaende sasong -> data/raw/ESPN_<LIGA>.json (BR2, cachad)
//  - alla med "espn":  kommande matcher 21 dagar -> mergas in i data/upcoming-fixtures.json
// Lagnamn oversatts till historikens namn (football-data) sa att modellen kanner igen lagen.
// Kors av Fetch-OpenSources.ps1 efter att openfootball skrivit upcoming-fixtures.json. Manuellt: npm run leagues
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEAM_ALIASES } from './weather/teams.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REG = JSON.parse(fs.readFileSync(path.join(root, 'config', 'leagues.json'), 'utf8'));
const RAW = path.join(root, 'data', 'raw');
const FIXTURES = path.join(root, 'data', 'upcoming-fixtures.json');
const REPORT = path.join(root, 'data', 'open', 'extra_leagues.json');
const HORIZON_DAYS = 21;
const UA = { 'User-Agent': 'Mozilla/5.0 (betting-ny)' };
const ESPN = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer';

// ESPN-namn -> historikens namn dar automatisk likhet inte racker
const ALIASES = {
  BR: {
    'Athletico Paranaense': 'Athletico-PR', 'Atlético-MG': 'Atletico-MG', 'Atlético Mineiro': 'Atletico-MG',
    'Atlético-GO': 'Atletico GO', 'Atlético Goianiense': 'Atletico GO', 'Botafogo': 'Botafogo RJ', 'Flamengo': 'Flamengo RJ',
    'Red Bull Bragantino': 'Bragantino', 'RB Bragantino': 'Bragantino', 'São Paulo': 'Sao Paulo', 'Grêmio': 'Gremio',
    'Vasco da Gama': 'Vasco', 'Sport': 'Sport Recife', 'Ceará': 'Ceara', 'Criciúma': 'Criciuma', 'Cuiabá': 'Cuiaba',
    'Vitória': 'Vitoria', 'Chapecoense': 'Chapecoense-SC',
  },
  NO: { 'Hamarkameratene': 'HamKam' },
  DK: { 'AGF': 'Aarhus' },
  MLS: { 'LAFC': 'Los Angeles FC', 'LA Galaxy': 'Los Angeles Galaxy' },
  GR: { 'Olympiacos': 'Olympiakos', 'Levadiakos': 'Levadeiakos' },
  EK: {
    'Legia Warszawa': 'Legia', 'Raków Częstochowa': 'Rakow', 'Rakow Czestochowa': 'Rakow',
    'Zagłębie Lubin': 'Zaglebie', 'Zaglebie Lubin': 'Zaglebie',
    'Wisła Płock': 'Wisla Plock', 'Wisla Plock': 'Wisla Plock',
    'Wisła Kraków': 'Wisla', 'Wisla Krakow': 'Wisla',
    'Śląsk Wrocław': 'Slask Wroclaw', 'Slask Wroclaw': 'Slask Wroclaw',
    'Górnik Zabrze': 'Gornik Zabrze', 'Jagiellonia Białystok': 'Jagiellonia',
    'Jagiellonia Bialystok': 'Jagiellonia', 'Widzew Łódź': 'Widzew Lodz', 'Widzew Lodz': 'Widzew Lodz',
    'Pogoń Szczecin': 'Pogon Szczecin', 'Lech Poznań': 'Lech Poznan',
    'Lechia Gdańsk': 'Lechia Gdansk', 'Wieczysta Kraków': 'Wieczysta Krakow',
    'Termalica Nieciecza': 'Termalica B-B.', 'Bruk-Bet Termalica Nieciecza': 'Termalica B-B.',
    'Puszcza Niepołomice': 'Puszcza',
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, as = 'json') {
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return as === 'json' ? res.json() : res.text();
    if (i === 6 || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${url}`);
    // 429 (t.ex. TheSportsDB gratisniva): vanta enligt Retry-After, annars en minut
    const retry = Number(res.headers.get('retry-after'));
    const wait = res.status === 429 ? (Number.isFinite(retry) && retry > 0 ? retry * 1000 : 60_000) : 1500 * i;
    console.log(`  ${res.status} - vantar ${Math.round(wait / 1000)} s`);
    await sleep(wait);
  }
}
const ymd = (d) => d.toISOString().slice(0, 10).replaceAll('-', '');
// æ/ø/å/ß delas inte upp av NFD -> skriv om forst ("Nordsjælland" ~ "Nordsjaelland")
const norm = (s) => String(s).replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/å/gi, 'a').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Historikens lagnamn: liga-alias, globala alias (TEAM_ALIASES), exakt, annars bast ordlikhet (>= 0.5). */
function mapName(league, espnName, known) {
  if (!known.size) return espnName;
  const alias = ALIASES[league]?.[espnName] ?? TEAM_ALIASES[espnName];
  if (alias && known.has(alias)) return alias;
  if (known.has(espnName)) return espnName;
  const b = norm(espnName).split(' ');
  let best = null;
  let bestScore = 0;
  for (const t of known) {
    const a = norm(t).split(' ');
    const score = a.filter((w) => b.some((v) => v.startsWith(w) || w.startsWith(v))).length / a.length;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= 0.5 ? best : null;
}

/** ESPN:s fas-slug -> svensk etikett ("league-phase" -> "Ligaspel"). */
function roundLabel(slug) {
  if (!slug) return null;
  const map = {
    'league-phase': 'Ligaspel', 'group-stage': 'Gruppspel', 'regular-season': 'Grundserie',
    'knockout-round-playoffs': 'Playoff', 'round-of-16': 'Åttondel', quarterfinals: 'Kvartsfinal',
    semifinals: 'Semifinal', final: 'Final',
  };
  return map[slug] ?? slug;
}

function parseEvent(ev) {
  const comp = ev.competitions?.[0];
  const side = (ha) => comp?.competitors?.find((c) => c.homeAway === ha);
  const h = side('home');
  const a = side('away');
  const stat = (c, name) => Number(c?.statistics?.find((s) => s.name === name)?.displayValue) || null;
  return {
    id: ev.id, date: ev.date.slice(0, 10), kickoffUtc: ev.date, completed: !!ev.status?.type?.completed,
    home: h?.team?.displayName, away: a?.team?.displayName, hg: Number(h?.score), ag: Number(a?.score),
    shotsHome: stat(h, 'totalShots'), shotsAway: stat(a, 'totalShots'), sotHome: stat(h, 'shotsOnTarget'), sotAway: stat(a, 'shotsOnTarget'),
    round: ev.week?.number ? `Omg ${ev.week.number}` : roundLabel(ev.season?.slug),
  };
}

const report = { updatedAt: new Date().toISOString(), leagues: {} };
const tsdbFixtures = [];
const teamNames = {}; // league -> Set av historikens namn

// ---------- Historik ----------
for (const [code, lg] of Object.entries(REG.leagues)) {
  const r = (report.leagues[code] = { name: lg.name, history: lg.history });
  try {
    if (lg.history === 'fd-new') {
      const csv = (await get(`https://www.football-data.co.uk/new/${lg.fdNew}.csv`, 'text')).replace(/^﻿/, '');
      fs.writeFileSync(path.join(RAW, `${code}_all.csv`), csv, 'utf8');
      const rows = csv.trim().split(/\r?\n/).slice(1).map((l) => l.split(','));
      // Sasong "2026" eller "2026/2027" -> startar
      teamNames[code] = new Set(rows.filter((x) => parseInt(x[2], 10) >= 2024).flatMap((x) => [x[5], x[6]]));
      r.historyMatches = rows.length;
    } else if (lg.history === 'fd-main') {
      // Lagnamn fran football-data-CSV:erna som Fetch-OpenSources laddat ner
      const files = fs.readdirSync(RAW).filter((f) => f.startsWith(`${code}_`) && f.endsWith('.csv'));
      teamNames[code] = new Set(files.flatMap((f) => fs.readFileSync(path.join(RAW, f), 'utf8').trim().split(/\r?\n/).slice(1)
        .map((l) => l.split(',')).flatMap((x) => [x[3], x[4]])).filter(Boolean));
    } else if (lg.history === 'espn') {
      await espnHistory(code, lg, r);
    } else if (lg.history === 'tsdb') {
      if (process.env.SKIP_TSDB === '1') tsdbFromCache(code, r);
      else await tsdbLeague(code, lg, r);
    } else if (lg.history === 'fotmob') {
      await fotmobHistory(code, lg, r);
    } else {
      teamNames[code] = new Set();
    }
  } catch (e) {
    r.error = e.message;
    console.log(`  ${code} historik FEL: ${e.message}`);
  }
  if (lg.history !== 'fd-main') console.log(`  ${code} historik klar (${r.historyMatches ?? 0} matcher)`);
}

async function espnHistory(code, lg, r) {
  const file = path.join(RAW, `ESPN_${code}.json`);
  const cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { league: code, matches: [], fetchedDays: {} };
  const year = new Date().getUTCFullYear();
  let fetched = 0;
  for (const season of [year - 1, year]) {
    // Kalendern for sasongen: scoreboard for ett datum mitt i sasongen
    const sb = await get(`${ESPN}/${lg.espn}/scoreboard?dates=${season}0701`);
    const days = (sb.leagues?.[0]?.calendar ?? []).map((c) => new Date(typeof c === 'string' ? c : c.startDate))
      .filter((d) => d < new Date()).map(ymd);
    for (const day of days) {
      if (cache.fetchedDays[day] && season < year) continue;           // tidigare sasong: hamta en gang
      if (cache.fetchedDays[day] && Date.now() - Date.parse(`${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}`) > 7 * 86_400_000) continue;
      const d = await get(`${ESPN}/${lg.espn}/scoreboard?dates=${day}`);
      for (const ev of (d.events ?? []).map(parseEvent)) {
        if (!ev.completed || !Number.isFinite(ev.hg)) continue;
        cache.matches = cache.matches.filter((m) => m.id !== ev.id);
        cache.matches.push({ ...ev, season });
      }
      cache.fetchedDays[day] = true;
      fetched++;
      await sleep(150);
    }
  }
  cache.matches.sort((a, b) => a.date.localeCompare(b.date));
  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(cache), 'utf8');
  teamNames[code] = new Set(cache.matches.map((m) => m.home).concat(cache.matches.map((m) => m.away)));
  r.historyMatches = cache.matches.length;
  r.daysFetchedNow = fetched;
}

/**
 * Fotmob: innevarande + foregaende sasong i tva anrop (ligasidan listar alla matcher med resultat).
 * Samma filformat som ESPN-historiken (data/raw/ESPN_<LIGA>.json) -> Update-BettingStore laser den utan andringar.
 */
async function fotmobHistory(code, lg, r) {
  const file = path.join(RAW, `ESPN_${code}.json`);
  const base = `https://www.fotmob.com/api/data/leagues?id=${lg.fotmobId}`;
  const first = await get(base);
  const seasons = (first.allAvailableSeasons ?? []).slice(0, 2); // t.ex. ["2026", "2025"] eller ["2026/2027", "2025/2026"]
  const matches = [];
  for (const [i, s] of seasons.entries()) {
    const d = i === 0 ? first : await get(`${base}&season=${encodeURIComponent(s)}`);
    const season = String(s).replace('/', '-'); // "2026/2027" -> "2026-2027" (Get-SeasonLabel)
    for (const m of d.fixtures?.allMatches ?? []) {
      if (!m.status?.finished || m.status?.cancelled || m.status?.awarded) continue;
      const sc = String(m.status.scoreStr ?? '').match(/(\d+)\s*-\s*(\d+)/);
      if (!sc) continue;
      matches.push({
        id: `fm${m.id}`, date: String(m.status.utcTime).slice(0, 10), season,
        home: m.home?.name, away: m.away?.name, hg: +sc[1], ag: +sc[2],
      });
    }
    await sleep(400);
  }
  matches.sort((a, b) => a.date.localeCompare(b.date));
  fs.writeFileSync(file, JSON.stringify({ league: code, source: 'fotmob', updatedAt: new Date().toISOString(), matches }), 'utf8');
  teamNames[code] = new Set(matches.flatMap((m) => [m.home, m.away]));
  r.historyMatches = matches.length;
}

/** SKIP_TSDB=1 (t.ex. nar TheSportsDB svarar 429): historik och spelschema fran cachen, inga anrop. */
function tsdbFromCache(code, r) {
  const file = path.join(RAW, `ESPN_${code}.json`);
  const cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  teamNames[code] = new Set();
  r.historyMatches = cache?.matches?.length ?? 0;
  r.fromCache = true;
  const today = new Date().toISOString().slice(0, 10);
  for (const f of cache?.upcoming ?? []) if (f.date >= today) tsdbFixtures.push(f);
}

/**
 * TheSportsDB (gratisnyckel 123): hela omgangar via eventsround. Historik + kommande matcher.
 * Foregaende sasong hamtas en gang; innevarande sasong: bara omgangar som inte ar fardigspelade.
 */
async function tsdbLeague(code, lg, r) {
  const TSDB = 'https://www.thesportsdb.com/api/v1/json/123';
  const file = path.join(RAW, `ESPN_${code}.json`); // samma format som ESPN-historiken
  const cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { league: code, source: 'thesportsdb', matches: [], doneRounds: {} };
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + HORIZON_DAYS * 86_400_000).toISOString().slice(0, 10);
  let calls = 0;
  // Sasongsformat varierar per liga och ar ("2026" kalenderar, "2026-2027" host-var; Japan bytte 2026).
  // Kandidater: fjolarets + arets i bada formaten; de som har omgang 1 anvands (cachas i filen).
  const y0 = now.getUTCFullYear();
  cache.seasons ??= {};
  const candidates = [`${y0 - 1}`, `${y0 - 1}-${y0}`, `${y0}`, `${y0}-${y0 + 1}`];
  // Spara cachen lopande och aven vid fel, sa att en avbruten korning inte tappar hamtade omgangar
  const upcoming = [];
  const save = () => {
    // Spelschemat sparas ocksa, sa att SKIP_TSDB=1 kan anvanda det nar TheSportsDB ar blockerad
    if (upcoming.length) cache.upcoming = upcoming;
    cache.matches.sort((a, b) => a.date.localeCompare(b.date));
    cache.updatedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(cache), 'utf8');
    r.historyMatches = cache.matches.length;
  };
  try {
  for (const s of candidates) {
    if (cache.seasons[s] !== undefined) continue;
    const j = await get(`${TSDB}/eventsround.php?id=${lg.tsdbId}&r=1&s=${s}`);
    calls++;
    await sleep(2100);
    cache.seasons[s] = (j.events ?? []).length > 0;
  }
  const seasons = candidates.filter((s) => cache.seasons[s]);
  for (const season of seasons) {
    const y = parseInt(season, 10);
    for (let round = 1; round <= (lg.tsdbRounds ?? 38); round++) {
      const key = `${season}|${round}`;
      if (cache.doneRounds[key]) continue;
      const j = await get(`${TSDB}/eventsround.php?id=${lg.tsdbId}&r=${round}&s=${season}`);
      calls++;
      if (calls % 10 === 0) save();
      await sleep(2500); // gratisnivan: ~30 anrop/minut, med marginal
      const evs = j.events ?? [];
      if (!evs.length) continue;
      let allDone = true;
      for (const e of evs) {
        const done = e.intHomeScore != null && e.intAwayScore != null && e.strStatus !== 'Not Started';
        if (done) {
          cache.matches = cache.matches.filter((m) => m.id !== e.idEvent);
          // season: "2026" eller "2026-2027" -> store gor "2026/27" (Get-SeasonLabel)
          cache.matches.push({ id: e.idEvent, date: e.dateEvent, season, home: e.strHomeTeam, away: e.strAwayTeam, hg: +e.intHomeScore, ag: +e.intAwayScore });
        } else {
          allDone = false;
          if (e.dateEvent >= today && e.dateEvent <= horizon) {
            const fx = { date: e.dateEvent, league: code, home: e.strHomeTeam, away: e.strAwayTeam, source: 'thesportsdb',
              kickoffUtc: e.strTimestamp ? `${e.strTimestamp}Z`.replace('ZZ', 'Z') : null, round: `Omg ${round}` };
            tsdbFixtures.push(fx);
            upcoming.push(fx);
          }
        }
      }
      if (allDone) cache.doneRounds[key] = true;
    }
  }
  } finally {
    save();
    teamNames[code] = new Set();
    r.callsNow = calls;
  }
}

// ---------- Kommande matcher (ESPN, dag for dag) ----------
const newFixtures = [...tsdbFixtures];
for (const f of tsdbFixtures) report.leagues[f.league].upcoming = (report.leagues[f.league].upcoming ?? 0) + 1;
for (const code of new Set(tsdbFixtures.map((f) => f.league))) console.log(`  ${code} ${REG.leagues[code].name}: ${report.leagues[code].upcoming} kommande, historik ${report.leagues[code].historyMatches}`);

/** Fotmob: hela ligans spelschema i ett anrop (t.ex. Ekstraklasa dar ESPN saknas). */
async function fotmobUpcoming(code, lg, r) {
  const d = await get(`https://www.fotmob.com/api/data/leagues?id=${lg.fotmobId}`);
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + HORIZON_DAYS * 86_400_000).toISOString().slice(0, 10);
  const known = teamNames[code] ?? new Set();
  const unmapped = new Set();
  let n = 0;
  for (const m of d.fixtures?.allMatches ?? []) {
    if (m.status?.finished || m.status?.cancelled) continue;
    const date = (m.status?.utcTime || '').slice(0, 10);
    if (!date || date < today || date > horizon) continue;
    const home = mapName(code, m.home?.name, known) ?? (known.size ? null : m.home?.name);
    const away = mapName(code, m.away?.name, known) ?? (known.size ? null : m.away?.name);
    if (!home) unmapped.add(m.home?.name);
    if (!away) unmapped.add(m.away?.name);
    if (!home || !away) continue;
    newFixtures.push({
      date, league: code, home, away, source: 'fotmob',
      kickoffUtc: m.status?.utcTime || null,
      round: m.round ? `Omg ${m.round}` : null,
      fotmobMatchId: m.id ? String(m.id) : null,
    });
    n++;
  }
  r.upcoming = n;
  if (unmapped.size) r.unmapped = [...unmapped];
  console.log(`  ${code} ${lg.name}: ${n} kommande (Fotmob)${unmapped.size ? ` (omappade: ${[...unmapped].join(', ')})` : ''}${r.historyMatches ? `, historik ${r.historyMatches}` : ''}`);
}

for (const [code, lg] of Object.entries(REG.leagues)) {
  if (!lg.fotmobId || lg.espn) continue; // ESPN-ligor hanteras nedan
  try {
    await fotmobUpcoming(code, lg, report.leagues[code]);
  } catch (e) {
    report.leagues[code].upcomingError = e.message;
    console.log(`  ${code} Fotmob FEL: ${e.message}`);
  }
}

const days = Array.from({ length: HORIZON_DAYS + 1 }, (_, i) => ymd(new Date(Date.now() + i * 86_400_000)));
for (const [code, lg] of Object.entries(REG.leagues)) {
  if (!lg.espn) continue;
  const r = report.leagues[code];
  const unmapped = new Set();
  let n = 0;
  for (const day of days) {
    let d;
    try { d = await get(`${ESPN}/${lg.espn}/scoreboard?dates=${day}`); } catch { continue; }
    for (const ev of (d.events ?? []).map(parseEvent)) {
      if (ev.completed || ev.date < new Date().toISOString().slice(0, 10)) continue;
      const known = teamNames[code] ?? new Set();
      const home = mapName(code, ev.home, known);
      const away = mapName(code, ev.away, known);
      if (!home) unmapped.add(ev.home);
      if (!away) unmapped.add(ev.away);
      if (!home || !away) continue;
      newFixtures.push({ date: ev.date, league: code, home, away, source: 'espn', kickoffUtc: ev.kickoffUtc, round: ev.round, espnEventId: ev.id });
      n++;
    }
    await sleep(120);
  }
  r.upcoming = n;
  if (unmapped.size) r.unmapped = [...unmapped];
  console.log(`  ${code} ${lg.name}: ${n} kommande${unmapped.size ? ` (omappade: ${[...unmapped].join(', ')})` : ''}${r.historyMatches ? `, historik ${r.historyMatches}` : ''}`);
}

// Merga: ersatt ligornas rader, behall openfootball-ligorna
const codes = new Set(Object.entries(REG.leagues).filter(([, l]) => l.espn || l.fotmobId || l.history === 'tsdb').map(([c]) => c));
const all = fs.existsSync(FIXTURES) ? JSON.parse(fs.readFileSync(FIXTURES, 'utf8').replace(/^﻿/, '')) : [];
// Oversatt ALLA lagnamn (aven openfootball-ligornas, t.ex. "FC Bayern München") till historikens namn,
// annars kanner modellen inte igen lagen och matchen far inget modelltips.
let renamed = 0;
const kept = all.filter((f) => !codes.has(f.league)).map((f) => {
  const known = teamNames[f.league];
  if (!known?.size) return f;
  const home = known.has(f.home) ? f.home : mapName(f.league, f.home, known) ?? f.home;
  const away = known.has(f.away) ? f.away : mapName(f.league, f.away, known) ?? f.away;
  if (home !== f.home || away !== f.away) renamed++;
  return { ...f, home, away };
});
if (renamed) console.log(`  Oversatte lagnamn i ${renamed} openfootball-matcher till historikens namn`);
const seen = new Set();
const merged = [...kept, ...newFixtures].filter((f) => {
  const k = `${f.league}|${f.date}|${f.home}|${f.away}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
fs.writeFileSync(FIXTURES, JSON.stringify(merged, null, 2), 'utf8');
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf8');
console.log(`Extra ligor: ${newFixtures.length} kommande matcher -> upcoming-fixtures.json`);
