// Officiella domare for Allsvenskan fran allsvenskan.se (deras GraphQL-API gql.sportomedia.se; sajten sjalv
// blockerar skript via Cloudflare men API:t svarar direkt). Huvuddomaren = forsta namnet i "referees".
// Sparas i data/open/referee_allsvenskan.json och ersatter FotMobs domare i loadRefereeMatches
// (applyOfficialReferees), eftersom FotMob saknar eller har fel domare i en del matcher.
// Inkrementellt: matcher som redan har domare hoppas over.
//   node scripts/fetch-referees-allsvenskan.mjs               aktuell + 4 sasonger bakat
//   node scripts/fetch-referees-allsvenskan.mjs --current     bara aktuell sasong (daglig korning)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'referee_allsvenskan.json');
const API = 'https://gql.sportomedia.se/graphql';
const LEAGUE = 'allsvenskan';
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
  doc.source = 'allsvenskan.se (gql.sportomedia.se, match.referees[0] = huvuddomare)';
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};

const year = new Date().getUTCFullYear();
let added = 0;
for (let y = year; y > year - SEASONS; y--) {
  const list = await gql('query($y:Int!){ matchesForLeague(configLeagueName:"allsvenskan", configSeasonStartYear:$y){ matches { id startDate homeTeamName visitingTeamName status } } }', { y });
  const done = (list?.matchesForLeague?.matches || []).filter((m) => m.status === 'FINISHED');
  const todo = done.filter((m) => !doc.matches[m.id]?.r);
  let n = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(todo.slice(i, i + CONCURRENCY).map(async (m) => {
      const d = await gql('query($id:Int!,$y:Int!){ match(id:$id, configLeagueName:"allsvenskan", configSeasonStartYear:$y){ match { referees } } }', { id: m.id, y });
      const r = String(d?.match?.match?.referees?.[0] || '').trim();
      if (!r) return;
      doc.matches[m.id] = { id: String(m.id), d: m.startDate.slice(0, 10), lg: 'AS', h: m.homeTeamName, a: m.visitingTeamName, r };
      n++;
    }));
  }
  added += n;
  log(`${LEAGUE} ${y}: ${done.length} spelade, ${n} nya domare`);
  save();
}
log(`Domare allsvenskan.se: ${Object.keys(doc.matches).length} matcher (${added} nya)`);
