// Hamtar hemmaarena + koordinater per lag: Wikipedia-artikel -> Wikidata-klubb -> P115 (hemmaarena) -> P625.
// Manuella rattelser i data/open/venue-overrides.json ({ "Lag": { venue, lat, lon } }).
// Kor: npm run venues
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEAM_WIKI, TEAM_ALIASES, CITY_HINT } from './weather/teams.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'venues.json');
const OVERRIDES = path.join(root, 'data', 'open', 'venue-overrides.json');
const UA = 'betting-ny/1.0 (local research script)';
const FOOTBALL_CLUB = 'Q476028';

async function getJson(url, init = {}) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, Accept: 'application/json', ...(init.headers ?? {}) } });
    if (res.ok) return res.json();
    if (attempt === 6 || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${url.slice(0, 120)}`);
    // 429: respektera Retry-After (Wikimedia), annars okande vantan
    const retry = Number(res.headers.get('retry-after'));
    const wait = Number.isFinite(retry) && retry > 0 ? retry * 1000 : 5000 * attempt;
    console.log(`  ${res.status} - vantar ${Math.round(wait / 1000)} s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

// 1) Wikipedia-titel -> Wikidata QID (foljer redirects)
async function resolveQids(titles) {
  const out = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(batch.join('|'))}`;
    const j = await getJson(url);
    const rename = new Map();
    for (const n of j.query.normalized ?? []) rename.set(n.from, n.to);
    for (const r of j.query.redirects ?? []) rename.set(r.from, r.to);
    const byTitle = new Map(Object.values(j.query.pages).map((p) => [p.title, p.pageprops?.wikibase_item]));
    for (const t of batch) {
      let cur = t;
      for (let k = 0; k < 3 && rename.has(cur); k++) cur = rename.get(cur);
      out.set(t, byTitle.get(cur) ?? null);
    }
  }
  return out;
}

// 2) QID -> nuvarande hemmaarena med koordinater (ingen sluttid, foredragen rank forst)
async function venuesFor(qids) {
  const values = qids.map((q) => `wd:${q}`).join(' ');
  const query = `
SELECT ?club ?isClub ?venue ?venueLabel ?coord ?rank ?start WHERE {
  VALUES ?club { ${values} }
  BIND(EXISTS { ?club wdt:P31/wdt:P279* wd:${FOOTBALL_CLUB} } AS ?isClub)
  OPTIONAL {
    ?club p:P115 ?st . ?st ps:P115 ?venue ; wikibase:rank ?rank .
    FILTER NOT EXISTS { ?st pq:P582 ?end }
    FILTER(?rank != wikibase:DeprecatedRank)
    OPTIONAL { ?st pq:P580 ?start }
    ?venue wdt:P625 ?coord .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
  const j = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);
  const best = new Map();
  for (const b of j.results.bindings) {
    const q = b.club.value.split('/').pop();
    const cand = {
      isClub: b.isClub?.value === 'true',
      venue: b.venueLabel?.value ?? null,
      venueQid: b.venue?.value.split('/').pop() ?? null,
      ...parsePoint(b.coord?.value),
      preferred: b.rank?.value.endsWith('PreferredRank') ?? false,
      start: b.start?.value ?? '',
    };
    const prev = best.get(q);
    // Foredragen rank > senaste starttid > forsta
    if (!prev || (!prev.lat && cand.lat) || (cand.lat && (cand.preferred && !prev.preferred || (cand.preferred === prev.preferred && cand.start > prev.start)))) {
      best.set(q, cand);
    }
  }
  return best;
}

function parsePoint(wkt) {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt ?? '');
  return m ? { lon: Number(m[1]), lat: Number(m[2]) } : { lat: null, lon: null };
}

const teams = Object.keys(TEAM_WIKI);
const qidByTitle = await resolveQids(teams.map((t) => TEAM_WIKI[t]));
const qids = [...new Set([...qidByTitle.values()].filter(Boolean))];
const venueByQid = new Map();
for (let i = 0; i < qids.length; i += 60) {
  for (const [k, v] of await venuesFor(qids.slice(i, i + 60))) venueByQid.set(k, v);
}

const overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {};
const result = {};
const problems = [];
for (const team of teams) {
  const title = TEAM_WIKI[team];
  const qid = qidByTitle.get(title);
  const v = qid ? venueByQid.get(qid) : null;
  const row = { team, wiki: title, qid, venue: v?.venue ?? null, venueQid: v?.venueQid ?? null, lat: v?.lat ?? null, lon: v?.lon ?? null, source: 'wikidata' };
  if (overrides[team]) Object.assign(row, overrides[team], { source: 'override' });
  if (!qid) problems.push(`${team}: ingen Wikidata-post for "${title}"`);
  else if (v && !v.isClub && !overrides[team]) problems.push(`${team}: ${qid} ar inte en fotbollsklubb`);
  if (row.lat == null) problems.push(`${team}: saknar arena-koordinater`);
  result[team] = row;
}

// ---------- Automatisk uppslagning for lag som saknas i TEAM_WIKI (nya ligor, cuper) ----------
// Wikipedia-sok "<lag> football club <land>" -> kandidater -> Wikidata: maste vara fotbollsklubb (och i ligans land).
const REG = JSON.parse(fs.readFileSync(path.join(root, 'config', 'leagues.json'), 'utf8'));
const COUNTRY_QID = {
  England: ['Q145', 'Q21'], Spain: ['Q29'], Italy: ['Q38'], Germany: ['Q183'], France: ['Q142'], Netherlands: ['Q55'],
  Portugal: ['Q45'], Greece: ['Q41'], Croatia: ['Q224'], Sweden: ['Q34'], Norway: ['Q20'], Denmark: ['Q35'], Brazil: ['Q155'],
  Japan: ['Q17'], 'South Korea': ['Q884'], Mexico: ['Q96'], USA: ['Q30', 'Q16'], Czechia: ['Q213'], Chile: ['Q298'],
  Colombia: ['Q739'], Argentina: ['Q414'], Poland: ['Q36'],
};
const AUTO = path.join(root, 'data', 'open', 'venue-auto.json');
const autoCache = fs.existsSync(AUTO) ? JSON.parse(fs.readFileSync(AUTO, 'utf8')) : {};

const wanted = new Map(); // team -> country (null for cuper)
const addWanted = (team, league) => {
  if (!team || result[team] || TEAM_WIKI[TEAM_ALIASES[team] ?? team]) return;
  const country = REG.leagues[league]?.country ?? null;
  if (!wanted.has(team) || (wanted.get(team) == null && country)) wanted.set(team, country);
};
const storePath = path.join(root, 'data', 'betting-store.json');
if (fs.existsSync(storePath)) {
  for (const m of JSON.parse(fs.readFileSync(storePath, 'utf8')).matches ?? []) { addWanted(m.home, m.league); addWanted(m.away, m.league); }
}
const fixturesPath = path.join(root, 'data', 'upcoming-fixtures.json');
if (fs.existsSync(fixturesPath)) {
  for (const f of JSON.parse(fs.readFileSync(fixturesPath, 'utf8').replace(/^﻿/, ''))) { addWanted(f.home, f.league); addWanted(f.away, f.league); }
}

const todo = [...wanted].filter(([team]) => !autoCache[team]);
console.log(`Auto-uppslagning: ${wanted.size} lag utanfor TEAM_WIKI, ${todo.length} nya att soka`);
// Sokresultat cachas direkt (fil) sa att ett avbrott inte kostar om alla sokningar
const SEARCH = path.join(root, 'data', 'open', 'venue-search-cache.json');
const searchCache = fs.existsSync(SEARCH) ? JSON.parse(fs.readFileSync(SEARCH, 'utf8')) : {};
const candidates = new Map(); // team -> [titlar]
let searched = 0;
for (const [team, country] of todo) {
  const q = `${team} football club${country ? ` ${country}` : ''}`;
  if (!searchCache[q]) {
    try {
      const j = await getJson(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=5&srsearch=${encodeURIComponent(q)}`);
      searchCache[q] = (j.query?.search ?? []).map((s) => s.title);
    } catch (e) {
      console.log(`  sokning misslyckades for ${team}: ${e.message}`);
      continue;
    }
    if (++searched % 25 === 0) {
      fs.writeFileSync(SEARCH, JSON.stringify(searchCache), 'utf8');
      console.log(`  ${searched} sokningar...`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  candidates.set(team, searchCache[q]);
}
fs.writeFileSync(SEARCH, JSON.stringify(searchCache), 'utf8');
const allTitles = [...new Set([...candidates.values()].flat())];
const qidOf = allTitles.length ? await resolveQids(allTitles) : new Map();
const candQids = [...new Set([...qidOf.values()].filter(Boolean))];
const info = new Map();
for (let i = 0; i < candQids.length; i += 60) {
  const batch = candQids.slice(i, i + 60);
  const query = `
SELECT ?club ?isClub ?country ?venueLabel ?coord WHERE {
  VALUES ?club { ${batch.map((q) => `wd:${q}`).join(' ')} }
  BIND(EXISTS { ?club wdt:P31/wdt:P279* wd:${FOOTBALL_CLUB} } AS ?isClub)
  OPTIONAL { ?club wdt:P17 ?country }
  OPTIONAL {
    ?club p:P115 ?st . ?st ps:P115 ?venue . FILTER NOT EXISTS { ?st pq:P582 ?end }
    ?venue wdt:P625 ?coord .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
  const j = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);
  for (const b of j.results.bindings) {
    const q = b.club.value.split('/').pop();
    const row = info.get(q) ?? { isClub: b.isClub?.value === 'true', countries: new Set(), venue: null, lat: null, lon: null };
    if (b.country) row.countries.add(b.country.value.split('/').pop());
    if (b.coord && row.lat == null) Object.assign(row, { venue: b.venueLabel?.value ?? null, ...parsePoint(b.coord.value) });
    info.set(q, row);
  }
}
for (const [team, titles] of candidates) {
  const country = wanted.get(team);
  const okCountries = country ? COUNTRY_QID[country] ?? [] : null;
  let pick = null;
  for (const t of titles) {
    const q = qidOf.get(t);
    const inf = q && info.get(q);
    if (!inf?.isClub || inf.lat == null) continue;
    if (okCountries && ![...inf.countries].some((c) => okCountries.includes(c))) continue;
    pick = { team, wiki: t, qid: q, venue: inf.venue, lat: inf.lat, lon: inf.lon, source: 'wikidata-auto' };
    break;
  }
  autoCache[team] = pick ?? { team, source: 'wikidata-auto', notFound: true, searched: titles };
}
fs.writeFileSync(AUTO, JSON.stringify(autoCache, null, 2), 'utf8');
// Sista utvag: stadens koordinater (Open-Meteo geokodning, gratis) - vader pa stadsniva racker
const ISO = {
  England: 'GB', Spain: 'ES', Italy: 'IT', Germany: 'DE', France: 'FR', Netherlands: 'NL', Portugal: 'PT', Greece: 'GR', Croatia: 'HR',
  Sweden: 'SE', Norway: 'NO', Denmark: 'DK', Brazil: 'BR', Japan: 'JP', 'South Korea': 'KR', Mexico: 'MX', USA: 'US', Czechia: 'CZ',
  Chile: 'CL', Colombia: 'CO', Argentina: 'AR', Poland: 'PL',
};
async function geocodeCity(team, country) {
  const name = CITY_HINT[team] ?? team;
  const cc = country ? `&countryCode=${ISO[country]}` : '';
  const j = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1${cc}`);
  const r = j.results?.[0];
  return r ? { team, venue: `${r.name} (stad)`, lat: r.latitude, lon: r.longitude, source: 'geocode-city' } : null;
}

for (const [team, country] of wanted) {
  const a = autoCache[team];
  let row = a && !a.notFound ? { ...a } : null;
  if (!row) row = (await geocodeCity(team, country)) ?? { team, venue: null, lat: null, lon: null, source: 'wikidata-auto' };
  if (overrides[team]) Object.assign(row, overrides[team], { source: 'override' });
  if (row.lat == null) problems.push(`${team}: hittade varken klubb eller stad`);
  result[team] = row;
}

fs.writeFileSync(OUT, JSON.stringify({
  updatedAt: new Date().toISOString(),
  source: 'en.wikipedia -> wikidata P115/P625 (+ venue-overrides.json)',
  count: Object.values(result).filter((r) => r.lat != null).length,
  aliases: TEAM_ALIASES,
  problems,
  teams: result,
}, null, 2), 'utf8');

console.log(`Venues: ${Object.values(result).filter((r) => r.lat != null).length}/${Object.keys(result).length} lag med koordinater -> ${OUT}`);
for (const p of problems) console.log('  PROBLEM ' + p);
