// Vader per match fran Open-Meteo (gratis, ingen nyckel), vid arenans koordinater (data/open/venues.json).
//  - Prognos: BARA matcher som spelas idag (prognoser flera dagar fram ar for osakra) -> data/open/weather_forecast.json
//  - Historik: spelade matcher vid avspark (cache, bara nya matcher hamtas) -> data/open/weather_history.json
// Kor: npm run weather            -> bara dagens prognos (standard)
//     npm run weather:history    -> aven historik for spelade matcher (utvardering, tar lang tid)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalTeam } from './weather/teams.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  venues: path.join(root, 'data', 'open', 'venues.json'),
  store: path.join(root, 'data', 'betting-store.json'),
  fixtures: path.join(root, 'data', 'upcoming-fixtures.json'),
  odds: path.join(root, 'data', 'open', 'upcoming_odds.json'),
  lineups: path.join(root, 'data', 'open', 'espn_lineups.json'),
  forecast: path.join(root, 'data', 'open', 'weather_forecast.json'),
  history: path.join(root, 'data', 'open', 'weather_history.json'),
};
// Idag + imorgon hamtas fran Open-Meteo sa att sena avsparkar (efter midnatt UTC) far timvarden,
// men bara matcher med dagens datum tas med.
const FORECAST_DAYS = 2;
const DEFAULT_KICKOFF_UTC = 14; // ~15:00 lokal tid om avsparkstid saknas

const readJson = (p, fallback = null) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')) : fallback);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'betting-ny/1.0' } });
    if (res.ok) return res.json();
    const body = await res.text();
    if (attempt === 5 || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${body.slice(0, 200)}`);
    const wait = res.status === 429 ? 65_000 : 3_000 * attempt;
    console.log(`  ${res.status} - vantar ${wait / 1000}s`);
    await sleep(wait);
  }
}

const venues = readJson(P.venues);
if (!venues) throw new Error('Saknar data/open/venues.json - kor npm run venues forst');
const venueOf = (team) => {
  const v = venues.teams[canonicalTeam(team)];
  return v && v.lat != null ? v : null;
};
// Gruppera arenor som ligger nara varandra (Open-Meteo-rutnat ~10 km): ett anrop per grupp.
const CLUSTER_RADIUS_KM = 10;
function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
const clusters = [];
const clusterByTeam = new Map();
for (const [team, v] of Object.entries(venues.teams).sort(([a], [b]) => a.localeCompare(b))) {
  if (v.lat == null) continue;
  // Alla medlemmar maste ligga inom radien (ingen kedjning over en hel stad)
  let c = clusters.find((cl) => cl.members.every((m) => distanceKm(m, v) <= CLUSTER_RADIUS_KM));
  if (!c) clusters.push((c = { id: `c${clusters.length + 1}`, members: [] }));
  c.members.push({ team, venue: v.venue, lat: v.lat, lon: v.lon });
  clusterByTeam.set(team, c);
}
for (const c of clusters) {
  c.lat = Math.round((c.members.reduce((s, m) => s + m.lat, 0) / c.members.length) * 1e4) / 1e4;
  c.lon = Math.round((c.members.reduce((s, m) => s + m.lon, 0) / c.members.length) * 1e4) / 1e4;
}
const clusterOf = (team) => clusterByTeam.get(canonicalTeam(team));
const locKey = (c) => c.id;
const multi = clusters.filter((c) => c.members.length > 1);
console.log(`Arenor: ${clusterByTeam.size} lag -> ${clusters.length} vaderpunkter (${multi.length} grupper, radie ${CLUSTER_RADIUS_KM} km)`);
if (process.argv.includes('--verbose')) for (const c of multi) console.log(`  ${c.id}: ${[...new Set(c.members.map((m) => m.venue))].join(' / ')}`);

// Summerar timvarden over avsparkstimmen + nasta timme (matchen ~2 h)
function atKickoff(hourly, idx) {
  if (idx < 0) return null;
  const pick = (k) => [hourly[k]?.[idx], hourly[k]?.[idx + 1]].filter((x) => x != null);
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  const sum = (a) => (a.length ? a.reduce((s, x) => s + x, 0) : null);
  const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
  const max = (a) => (a.length ? Math.max(...a) : null);
  if (!pick('temperature_2m').length) return null; // utanfor prognosens/arkivets data
  return {
    tempC: r1(mean(pick('temperature_2m'))),
    precipMm: r1(sum(pick('precipitation'))),
    windKmh: r1(mean(pick('wind_speed_10m'))),
    gustKmh: r1(max(pick('wind_gusts_10m'))),
    precipProb: max(pick('precipitation_probability')),
  };
}

// ---------- Prognos ----------
async function forecast() {
  // Dagens datum i svensk tid (anvandarens matchdag)
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const last = today;
  const fixtures = (readJson(P.fixtures, [])).filter((f) => f.date === today);

  // Avsparkstid (UTC) fran odds/ESPN om den finns
  const kick = new Map();
  for (const e of readJson(P.odds, {}).events ?? []) if (e.commence) kick.set(`${e.league}|${e.home}|${e.away}`, e.commence);
  for (const f of readJson(P.lineups, {}).fixtures ?? []) if (f.kickoffUtc) kick.set(`${f.league}|${f.home}|${f.away}`, f.kickoffUtc);

  const locs = new Map();
  const rows = [];
  const missing = new Set();
  for (const f of fixtures) {
    const v = venueOf(f.home);
    if (!v) { missing.add(f.home); continue; }
    const c = clusterOf(f.home);
    locs.set(locKey(c), c);
    const k = kick.get(`${f.league}|${f.home}|${f.away}`);
    const kickoffUtc = k ? new Date(k).toISOString() : `${f.date}T${String(DEFAULT_KICKOFF_UTC).padStart(2, '0')}:00:00.000Z`;
    rows.push({ f, v, c, kickoffUtc, kickoffAssumed: !k });
  }

  const hourlyByLoc = new Map();
  const keys = [...locs.keys()];
  for (let i = 0; i < keys.length; i += 50) {
    const batch = keys.slice(i, i + 50).map((k) => locs.get(k));
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${batch.map((v) => v.lat).join(',')}&longitude=${batch.map((v) => v.lon).join(',')}`
      + '&hourly=temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m'
      + `&timezone=UTC&forecast_days=${FORECAST_DAYS}`;
    const res = await getJson(url);
    [res].flat().forEach((r, j) => hourlyByLoc.set(locKey(batch[j]), r.hourly));
  }

  const out = rows.map(({ f, v, c, kickoffUtc, kickoffAssumed }) => {
    const h = hourlyByLoc.get(locKey(c));
    const idx = h ? h.time.indexOf(kickoffUtc.slice(0, 13) + ':00') : -1;
    return {
      date: f.date, league: f.league, home: f.home, away: f.away,
      venue: v.venue, lat: v.lat, lon: v.lon, weatherPoint: c.id, kickoffUtc, kickoffAssumed,
      weather: h ? atKickoff(h, idx) : null,
    };
  });
  fs.writeFileSync(P.forecast, JSON.stringify({
    updatedAt: new Date().toISOString(), source: 'open-meteo forecast', horizon: [today, last],
    count: out.length, missingVenues: [...missing], matches: out,
  }, null, 2), 'utf8');
  console.log(`Prognos: ${out.length} matcher ${today}..${last} (${locs.size} vaderpunkter)${missing.size ? ' saknar arena: ' + [...missing].join(', ') : ''}`);
}

// ---------- Historik ----------
async function history() {
  const store = readJson(P.store);
  const cache = readJson(P.history, { matches: {} });
  const lastArchive = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10); // arkivet ligger nagra dagar efter

  const byLoc = new Map();
  const missing = new Set();
  for (const m of store.matches) {
    if (cache.matches[m.id] || m.date > lastArchive) continue;
    const v = venueOf(m.home);
    if (!v) { missing.add(m.home); continue; }
    const c = clusterOf(m.home);
    if (!byLoc.has(c.id)) byLoc.set(c.id, { c, list: [] });
    byLoc.get(c.id).list.push({ m, venue: v.venue });
  }

  let done = 0;
  for (const { c, list: items } of byLoc.values()) {
    const list = items.map((x) => x.m);
    const venueById = new Map(items.map((x) => [x.m.id, x.venue]));
    const v = c;
    const dates = list.map((m) => m.date).sort();
    const url = 'https://archive-api.open-meteo.com/v1/archive'
      + `?latitude=${v.lat}&longitude=${v.lon}&start_date=${dates[0]}&end_date=${dates.at(-1)}`
      + '&hourly=temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m&timezone=Europe%2FLondon';
    const res = await getJson(url);
    const index = new Map(res.hourly.time.map((t, i) => [t, i]));
    for (const m of list) {
      // football-data anger avspark i brittisk tid
      const hh = /^(\d{1,2}):/.exec(m.kickoff ?? '')?.[1] ?? '15';
      const idx = index.get(`${m.date}T${hh.padStart(2, '0')}:00`) ?? -1;
      const w = atKickoff(res.hourly, idx);
      if (w) cache.matches[m.id] = { venue: venueById.get(m.id), weatherPoint: c.id, ...w, precipProb: undefined };
    }
    done++;
    if (done % 20 === 0) {
      console.log(`  historik ${done}/${byLoc.size} vaderpunkter`);
      save(cache);
    }
    await sleep(400);
  }
  save(cache);
  console.log(`Historik: ${Object.keys(cache.matches).length} matcher med vader (${byLoc.size} vaderpunkter hamtade nu)${missing.size ? ' saknar arena: ' + [...missing].join(', ') : ''}`);

  function save(c) {
    fs.writeFileSync(P.history, JSON.stringify({
      updatedAt: new Date().toISOString(),
      source: 'open-meteo archive (ERA5), avsparkstimme + 1 h, brittisk tid',
      count: Object.keys(c.matches).length,
      matches: c.matches,
    }), 'utf8');
  }
}

await forecast();
// Historik bara pa begaran: vadret gav ingen saker effekt utover oddsen och hamtningen tar lang tid
if (process.argv.includes('--history')) await history();
