// Kontroll av FotMob-trupperna mot Transfermarkt. Spelare som finns i var trupp men inte i Transfermarkts
// soks upp: ar de klubblosa, har slutat eller finns i en annan klubb hamnar de i data/trupper/_uteslutna.json,
// som fetch-squads.mjs tillampar vid varje hamtning (sa en inaktuell FotMob-trupp inte tar tillbaka dem).
// Juniorer/B-lag i samma klubb (Malmo FF U21) raknas som kvar. Ingen traff i soket = kvar (okant).
// Kors: npm run trupper:kontroll [-- PL AS ...]   (utan ligor: alla i TM_LEAGUE, ca 1 h)
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { TM_LEAGUE, tmClubs, tmSquad, tmSearchPlayer, sameName, sameClub, unknownClub, pairClubs } from './lib/transfermarkt.mjs';

const DIR_SQ = path.join(root, 'data', 'trupper');
const EXCL = path.join(DIR_SQ, '_uteslutna.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const excl = fs.existsSync(EXCL) ? JSON.parse(fs.readFileSync(EXCL, 'utf8')) : { players: {} };
const today = new Date().toISOString().slice(0, 10);
for (const code of Object.keys(TM_LEAGUE)) {
  if (only.length && !only.includes(code)) continue;
  const file = path.join(DIR_SQ, `${code}.json`);
  if (!fs.existsSync(file)) continue;
  const sq = JSON.parse(fs.readFileSync(file, 'utf8'));
  const teams = Object.entries(sq.teams).filter(([, x]) => x.source !== 'Transfermarkt');
  const clubs = await tmClubs(code);
  if (!clubs.length) { console.warn(`${code}: ingen klubblista hos Transfermarkt`); continue; }
  const pair = pairClubs(code, teams, clubs);
  // Ligans tidigare uteslutningar ersatts av denna kontroll, utom for spelare som redan ar bortfiltrerade ur
  // truppfilen (de kontrolleras inte nu och skulle annars komma tillbaka vid nasta FotMob-hamtning)
  const present = new Set(teams.flatMap(([team, x]) => x.players.map((p) => `${code}|${team}|${p.id}`)));
  for (const k of Object.keys(excl.players)) if (present.has(k)) delete excl.players[k];
  let checked = 0, removed = 0;
  for (const [team, x] of teams) {
    const club = pair.get(team);
    if (!club) { console.warn(`  ${team}: ingen Transfermarkt-klubb`); continue; }
    await sleep(1000);
    const tm = await tmSquad(club.id, { coach: false });
    if (!tm) { console.warn(`  ${team}: tom trupp hos Transfermarkt (${club.name})`); continue; }
    checked++;
    // Samma fodelsedag = samma spelare trots annat namn (FotMob "Benjamin Hansen", TM "Benjamin Tiedemann")
    const missing = x.players.filter((p) => !tm.players.some((t) => sameName(p.name, t.name) || (p.born && p.born === t.born)));
    const out = [];
    for (const p of missing) {
      await sleep(900);
      // Samma namn och alder (+-1): vanliga namn (Simon Johansson) ger annars fel person
      const hits = (await tmSearchPlayer(p.name)).filter((h) => sameName(p.name, h.name) && (p.age == null || h.age == null || Math.abs(h.age - p.age) <= 1));
      if (!hits.length || hits.some((h) => unknownClub(h.club) || sameClub(h.club, [team, x.fotmobName, club.name]))) continue;
      // Flera med samma namn: bort bara om ingen av dem ar kvar i klubben
      out.push({ p, club: hits.map((h) => h.club).join(' / ') });
    }
    for (const { p, club: c } of out) {
      excl.players[`${code}|${team}|${p.id}`] = { name: p.name, tmClub: c, checkedAt: today };
      removed++;
    }
    console.log(`  ${team} (${club.name}): FotMob ${x.players.length}, TM ${tm.players.length}, ej i TM-truppen ${missing.length}, bort ${out.length}${out.length ? `: ${out.map((o) => `${o.p.name} → ${o.club}`).join(', ')}` : ''}`);
  }
  excl.updatedAt = new Date().toISOString();
  fs.writeFileSync(EXCL, JSON.stringify(excl, null, 1), 'utf8');
  // Ta bort direkt ur truppfilen ocksa (fetch-squads gor samma sak vid nasta hamtning)
  for (const [team, x] of Object.entries(sq.teams)) x.players = x.players.filter((p) => !excl.players[`${code}|${team}|${p.id}`]);
  fs.writeFileSync(file, JSON.stringify(sq, null, 1), 'utf8');
  console.log(`${code.padEnd(5)} ${checked} lag kontrollerade, ${removed} spelare borttagna`);
}
