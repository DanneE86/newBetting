// Kontroll av FotMob-trupperna mot Transfermarkt. Spelare som finns i var trupp men inte i Transfermarkts
// soks upp: ar de klubblosa, har slutat eller finns i en annan klubb hamnar de i data/trupper/_uteslutna.json,
// som fetch-squads.mjs tillampar vid varje hamtning (sa en inaktuell FotMob-trupp inte tar tillbaka dem).
// Juniorer/B-lag i samma klubb (Malmo FF U21) raknas som kvar. Ingen traff i soket = kvar (okant).
// Kors: npm run trupper:kontroll [-- PL AS ...]   (utan ligor: alla i TM_LEAGUE, ca 1 h)
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { nameScore } from './lib/match-context.mjs';
import { TM_LEAGUE, tmClubs, tmSquad, tmSearchPlayer } from './lib/transfermarkt.mjs';

const DIR_SQ = path.join(root, 'data', 'trupper');
const EXCL = path.join(DIR_SQ, '_uteslutna.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fold = (x) => String(x).replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').replace(/[æÆ]/g, 'ae').replace(/ß/g, 'ss').replace(/[đĐ]/g, 'd')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
// FotMob skriver ibland o som oe (Bjoerklund), Transfermarkt som o
const loose = (x) => fold(x).replace(/oe/g, 'o').replace(/ae/g, 'a').replace(/ue/g, 'u').replace(/aa/g, 'a');
function sameName(a, b) {
  const x = loose(a), y = loose(b);
  if (x === y || ` ${y} `.includes(` ${x} `) || ` ${x} `.includes(` ${y} `)) return true;
  const xs = x.split(' '), ys = y.split(' ');
  return xs.length > 1 && ys.length > 1 && xs.at(-1) === ys.at(-1) && xs[0][0] === ys[0][0];
}
const foldClub = (x) => String(x).replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const clubScore = (a, b) => Math.max(nameScore(foldClub(a), null, foldClub(b)), nameScore(foldClub(b), null, foldClub(a)));
// Samma klubb, aven dess U19/U21/B-lag
const YOUTH = /\b(u\s?\d\d|ii|b|b team|reserves|youth|academy|juniors?|sub \d\d|atletico|castilla|jong|primavera|promesas)\b/g;
// names = vart lagnamn, FotMobs och Transfermarkts (TM skriver "1.FC Nuremberg", vi "Nurnberg")
const sameClub = (tmClub, names) => names.some((n) => clubScore(foldClub(tmClub).replace(YOUTH, ' '), n) >= 0.5 || clubScore(tmClub, n) >= 0.5);
// Okand klubb i soket ("---", tomt) ar inget bevis for att spelaren lamnat
const unknownClub = (c) => !c || /^-+$/.test(c.trim());

// Vara lag -> Transfermarkt-klubbar: forst sakra namnlikheter, sedan de som blir over parvis efter basta likhet
function pairClubs(teams, clubs) {
  const out = new Map(), used = new Set();
  const cand = [];
  for (const [team, x] of teams) for (const c of clubs) cand.push({ team, c, s: Math.max(clubScore(team, c.name), clubScore(x.fotmobName, c.name)) });
  cand.sort((a, b) => b.s - a.s);
  for (const k of cand) {
    if (out.has(k.team) || used.has(k.c.id) || (k.s < 0.5 && teams.length - out.size > 1 && k.s < 0.2)) continue;
    out.set(k.team, k.c); used.add(k.c.id);
  }
  return out;
}

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
  const pair = pairClubs(teams, clubs);
  // Ligans tidigare uteslutningar ersatts av denna kontroll
  for (const k of Object.keys(excl.players)) if (k.startsWith(`${code}|`)) delete excl.players[k];
  let checked = 0, removed = 0;
  for (const [team, x] of teams) {
    const club = pair.get(team);
    if (!club) { console.warn(`  ${team}: ingen Transfermarkt-klubb`); continue; }
    await sleep(1000);
    const tm = await tmSquad(club.id, { coach: false });
    if (!tm) { console.warn(`  ${team}: tom trupp hos Transfermarkt (${club.name})`); continue; }
    checked++;
    const missing = x.players.filter((p) => !tm.players.some((t) => sameName(p.name, t.name)));
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
