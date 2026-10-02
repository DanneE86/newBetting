// Officiella domare for Allsvenskan och Superettan fran allsvenskan.se/superettan.se (GraphQL-API:t
// gql.sportomedia.se; sajterna sjalva blockerar skript via Cloudflare men API:t svarar direkt).
// Huvuddomaren = forsta namnet i "referees". Resultat, gula (WARNING), roda (PENALTY = utvisning) och
// straffar (PENALTY_KICK) raknas fran matchhandelserna.
//  - Allsvenskan: domaren ersatter FotMobs (FotMob saknar/har fel domare i en del matcher), kort fran FotMob.
//  - Superettan: FotMob har inga domare alls -> raderna har anvands direkt.
// Sparas i data/open/referee_allsvenskan.json (loadRefereeMatches i scripts/lib/referee-streaks.mjs).
// Inkrementellt: matcher som redan ar hamtade (med aktuell DATA_VERSION) hoppas over.
//   node scripts/fetch-referees-allsvenskan.mjs               aktuell + 4 sasonger bakat
//   node scripts/fetch-referees-allsvenskan.mjs --current     bara aktuell sasong (daglig korning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { disciplineFromEvents } from './lib/referee-streaks.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'referee_allsvenskan.json');
const API = 'https://gql.sportomedia.se/graphql';
const LEAGUES = { allsvenskan: 'AS', superettan: 'SE2' };
const DATA_VERSION = 2; // 2 = med resultat, kort och straffar
const onlyCurrent = process.argv.includes('--current');
const SEASONS = onlyCurrent ? 1 : 5;
const CONCURRENCY = 6;
const log = (s) => process.stdout.write(`${s}\n`);

async function gql(query, variables) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', referer: 'https://allsvenskan.se/' }, body: JSON.stringify({ query, variables }) });
      if (res.ok) { const j = await res.json(); if (j.data) return j.data; }
    } catch { /* forsok igen */ }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

const doc = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return { matches: {} }; } })();
doc.matches ??= {};
const save = () => {
  doc.updatedAt = new Date().toISOString();
  doc.source = 'allsvenskan.se/superettan.se (gql.sportomedia.se, referees[0] = huvuddomare, kort/straffar ur matchEvents)';
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};

const year = new Date().getUTCFullYear();
let added = 0;
for (const [league, lg] of Object.entries(LEAGUES)) {
  for (let y = year; y > year - SEASONS; y--) {
    const list = await gql('query($l:String!,$y:Int!){ matchesForLeague(configLeagueName:$l, configSeasonStartYear:$y){ matches { id startDate homeTeamName visitingTeamName status } } }', { l: league, y });
    const done = (list?.matchesForLeague?.matches || []).filter((m) => m.status === 'FINISHED');
    const todo = done.filter((m) => !doc.matches[m.id]?.r || doc.matches[m.id].v !== DATA_VERSION);
    let n = 0;
    for (let i = 0; i < todo.length; i += CONCURRENCY) {
      await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (m) => {
        const d = await gql('query($id:Int!,$l:String!,$y:Int!){ match(id:$id, configLeagueName:$l, configSeasonStartYear:$y){ match { homeTeamScore visitingTeamScore referees matchEvents { type byHomeTeam } } } }', { id: m.id, l: league, y });
        const x = d?.match?.match;
        const r = String(x?.referees?.[0] || '').trim();
        if (!r || !Number.isFinite(x.homeTeamScore) || !Number.isFinite(x.visitingTeamScore)) return;
        doc.matches[m.id] = {
          id: String(m.id), v: DATA_VERSION, d: m.startDate.slice(0, 10), lg, h: m.homeTeamName, a: m.visitingTeamName,
          hg: x.homeTeamScore, ag: x.visitingTeamScore, r, ...disciplineFromEvents(x.matchEvents),
        };
        n++;
      }));
    }
    added += n;
    log(`${league} ${y}: ${done.length} spelade, ${n} nya/uppdaterade`);
    save();
  }
}
log(`Domare allsvenskan.se/superettan.se: ${Object.keys(doc.matches).length} matcher (${added} nya)`);
