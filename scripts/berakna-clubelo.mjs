// npm run elo:berakna - räknar fram dagens Klubb-Elo själv när clubelo.com är blockerat (se lib/clubelo-berakna.mjs).
// Utgår alltid från clubelos riktiga tal (eloClubelo) och skriver över elo i data/open/clubelo_all.json och clubelo_ratings.json.
// Hämtas riktiga tal igen skrivs filerna om av de vanliga skripten och beräkningen försvinner.
//   --torr  skriv inget, visa bara resultatet
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollElo } from './lib/clubelo-berakna.mjs';
import { clubEloLookup, COUNTRY_TO_CLUBELO, findClubElo } from './lib/elo-1x2.mjs';
import { FM } from './lib/api-schemas.mjs';
import { getJson } from './lib/http.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P_ALL = path.join(root, 'data/open/clubelo_all.json');
const P_ENG = path.join(root, 'data/open/clubelo_ratings.json');
const LEAGUES = { PL: 'ENG', CH: 'ENG', EL1: 'ENG', EL2: 'ENG', LL: 'ESP', LL2: 'ESP', SA: 'ITA', SB: 'ITA', BL: 'GER', BL2: 'GER', L1: 'FRA',
  ED: 'NED', PT: 'POR', BE: 'BEL', SC: 'SCO', AS: 'SWE', SE2: 'SWE', NO: 'NOR', NO2: 'NOR', DK: 'DEN', GR: 'GRE', EK: 'POL', CZ: 'CZE', HR: 'CRO' };
const EUROCUPS = ['CL', 'EL', 'ECL'];
// Inhemska cuper (FotMob-id): saknas i data/matcher men räknas av clubelo
const CUPS = { 133: 'ENG', 132: 'ENG', 138: 'ESP', 141: 'ITA', 209: 'GER', 134: 'FRA' };
const HISTORY_FROM = '2025-07-01'; // hemmafördelen får ställa in sig på en hel säsong innan startvärdena gäller
const dry = process.argv.includes('--torr');

function readLeagueCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...rows] = fs.readFileSync(file, 'utf8').trim().split('\n');
  const h = head.split(',');
  const [s, d, ho, aw, hg, ag] = ['status', 'date', 'home', 'away', 'hg', 'ag'].map((n) => h.indexOf(n));
  return rows.map((l) => l.split(',')).filter((c) => c[s] === 'spelad' && c[hg] !== '' && c[ag] !== '')
    .map((c) => ({ date: c[d], home: c[ho], away: c[aw], hg: +c[hg], ag: +c[ag] }));
}

async function fetchCup(id) {
  const out = [];
  try {
    // getJson, inte fotmobGet: cuper har ingen tabell och stoppas av liga-schemat
    const data = await getJson(`${FM}/leagues?id=${id}`, { orNull: true });
    for (const m of data?.fixtures?.allMatches ?? []) {
      const score = /^(\d+) - (\d+)$/.exec(m.status?.scoreStr ?? '');
      if (!m.status?.finished || !score) continue;
      out.push({ date: String(m.status.utcTime).slice(0, 10), homeId: Number(m.home.id), awayId: Number(m.away.id), hg: +score[1], ag: +score[2] });
    }
  } catch (e) { console.log(`  cup ${id}: kunde inte hämtas (${e.message})`); }
  return out;
}

const all = JSON.parse(fs.readFileSync(P_ALL, 'utf8'));
const eng = JSON.parse(fs.readFileSync(P_ENG, 'utf8'));

// Startvärden: alltid riktiga clubelo-tal, aldrig en tidigare beräkning
const ratings = new Map();
const seedOf = (name, elo, seedDate, country, level = null) => ratings.set(`${country}|${name}`, { elo, seedDate, country, name, level });
const engSeed = (eng.seedAt ?? eng.updatedAt).slice(0, 10);
for (const t of eng.teams) seedOf(t.clubEloName ?? t.name, t.eloClubelo ?? t.elo, engSeed, 'ENG', t.level);
for (const [code, c] of Object.entries(all.countries)) {
  for (const club of c.clubs) seedOf(club.name, club.eloClubelo ?? club.elo, c.fetchedAt.slice(0, 10), code, club.level);
}

// Lagnamn -> Elo-klubb. Olika klubbar får aldrig slås ihop (Bromley != West Brom, Juve Stabia != Juventus):
// ligor går genom clubEloLookup (en klubb har bara ett lagnamn, aldrig vid lika), cuper genom FotMob-ID (config/team-ids.json).
const seedCache = { countries: {} };
for (const v of ratings.values()) (seedCache.countries[v.country] ??= { clubs: [] }).clubs.push({ name: v.name, elo: v.elo, level: v.level ?? null });
const leagueRows = {};
for (const lg of [...Object.keys(LEAGUES), ...EUROCUPS]) leagueRows[lg] = readLeagueCsv(path.join(root, 'data/matcher', `${lg}.csv`));
const COUNTRY_NAME = Object.fromEntries(Object.entries(COUNTRY_TO_CLUBELO).map(([n, c]) => [c, n]));
const tierOf = {};
const domestic = [];
for (const [lg, code] of Object.entries(LEAGUES)) {
  tierOf[code] = (tierOf[code] ?? 0) + 1;
  const names = new Set(leagueRows[lg].filter((m) => m.date >= HISTORY_FROM).flatMap((m) => [m.home, m.away]));
  for (const name of names) domestic.push({ name, country: COUNTRY_NAME[code], tier: tierOf[code] });
}
const lookup = clubEloLookup(seedCache, domestic, { withName: true });
const unmatched = new Set();
const leagueId = (team, code) => {
  const hit = lookup(team, COUNTRY_NAME[code]);
  if (!hit) { unmatched.add(`${code}: ${team}`); return null; }
  return `${hit.country}|${hit.clubEloName}`;
};
// FotMob-lag-ID -> [lagnamn i våra ligor, land]. Samma ID = samma klubb, oavsett stavning.
const teamIds = JSON.parse(fs.readFileSync(path.join(root, 'config/team-ids.json'), 'utf8')).leagues;
const byFotmobId = new Map();
for (const [lg, code] of Object.entries(LEAGUES)) for (const [name, id] of Object.entries(teamIds[lg] ?? {})) byFotmobId.set(id, [name, code]);
const idFromFotmob = (id) => {
  const hit = byFotmobId.get(id);
  return hit && domestic.some((t) => t.name === hit[0]) ? leagueId(hit[0], hit[1]) : null;
};
// Europacup: FotMob-ID via ligan om klubben finns där, annars bara exakt/nära namn i Elo-listan
const euroId = (team, lg) => {
  const id = teamIds[lg]?.[team];
  const viaId = id != null ? idFromFotmob(id) : null;
  if (viaId) return viaId;
  const hit = findClubElo(team, seedCache, 1);
  if (!hit) { unmatched.add(`cup: ${team}`); return null; }
  const cc = Object.keys(seedCache.countries).find((c) => seedCache.countries[c].clubs.some((x) => x.name === hit.clubEloName));
  return `${cc}|${hit.clubEloName}`;
};

const matches = [];
for (const [lg, code] of Object.entries(LEAGUES)) {
  for (const m of leagueRows[lg]) matches.push({ ...m, key: code, home: leagueId(m.home, code), away: leagueId(m.away, code) });
}
for (const lg of EUROCUPS) {
  for (const m of leagueRows[lg]) matches.push({ ...m, key: null, home: euroId(m.home, lg), away: euroId(m.away, lg) });
}
for (const [id, code] of Object.entries(CUPS)) {
  const rows = await fetchCup(id);
  console.log(`  cup ${id} (${code}): ${rows.length} spelade`);
  for (const m of rows) matches.push({ ...m, key: code, home: idFromFotmob(m.homeId), away: idFromFotmob(m.awayId) });
}
matches.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

// Okänd motståndare (lägre division utanför listan): landets lägsta kända Elo minus 50
const floor = {};
for (const v of ratings.values()) floor[v.country] = Math.min(floor[v.country] ?? Infinity, v.elo);
const opponentElo = (c) => (floor[c] != null ? floor[c] - 50 : null);

// 1) Hemmafördelen per land ställer in sig på historiken, 2) startvärdena rullas framåt med den
const hist = new Map([...ratings].map(([k, v]) => [k, { ...v, seedDate: HISTORY_FROM }]));
const { hfa } = rollElo(matches.filter((m) => m.date >= HISTORY_FROM && m.key), hist, { opponentElo });
const { ratings: rolled, used } = rollElo(matches, ratings, { hfa, opponentElo });

console.log(`Matcher använda: ${used}. Hemmafördel: ${Object.entries(hfa).map(([c, h]) => `${c} ${h.toFixed(0)}`).join(', ')}`);
if (unmatched.size) console.log(`Utan Elo-namn (${unmatched.size}), räknas som okänd motståndare: ${[...unmatched].slice(0, 40).join('; ')}`);

const now = new Date().toISOString();
const newElo = (country, name) => Math.round(rolled.get(`${country}|${name}`).elo * 10) / 10;
for (const [code, c] of Object.entries(all.countries)) {
  for (const club of c.clubs) { club.eloClubelo = club.eloClubelo ?? club.elo; club.elo = newElo(code, club.name); }
  c.beraknadAt = now; // fetchedAt behålls: riktiga tal hämtas så fort sidan går att nå
}
eng.seedAt = eng.seedAt ?? eng.updatedAt;
for (const t of eng.teams) { t.eloClubelo = t.eloClubelo ?? t.elo; t.elo = newElo('ENG', t.clubEloName ?? t.name); }
eng.teams.sort((a, b) => b.elo - a.elo);
eng.updatedAt = now;
eng.source = `egen beräkning (clubelo-formeln) från clubelo ${eng.seedAt.slice(0, 10)}`;
const moves = [...rolled.values()].map((v) => [v.name, ratings.get(`${v.country}|${v.name}`).elo, v.elo]).sort((x, y) => Math.abs(y[2] - y[1]) - Math.abs(x[2] - x[1]));
console.log(`Störst förändring: ${moves.slice(0, 12).map(([n, f, t]) => `${n} ${(t - f).toFixed(0)}`).join(', ')}`);
for (const n of ['Newcastle', 'Everton', 'Arsenal', 'Man City']) {
  const t = eng.teams.find((x) => x.name === n);
  if (t) console.log(`  ${n}: ${t.eloClubelo} -> ${t.elo}`);
}
if (!dry) {
  fs.writeFileSync(P_ALL, JSON.stringify(all, null, 1), 'utf8');
  fs.writeFileSync(P_ENG, JSON.stringify(eng, null, 1), 'utf8');
  console.log('Skrev clubelo_all.json och clubelo_ratings.json');
}
