// Aktuella trupper och tabeller for alla ligor fran FotMob (oppet API, samma som scripts/lib/match-context.mjs).
//   data/trupper/<liga>.json  lag -> tranare + spelare (position, alder, nummer, land, marknadsvarde, skada,
//                             FotMob-betyg, mal, assist, kort) + historik: nar spelaren forst/senast sags i laget
//   data/ligor/<liga>.json    tabell nu + tabellhistorik per dag (en rad per lag och dag)
// Lagnamn mappas till vara (football-data/store) via data/matcher/<liga>.csv. Lag hamtade senaste 20 h ateranvands.
// Befintlig fil skrivs aldrig over med tom data. Kors: npm run trupper [-- PL SA ...] [-- --force]
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { nameScore } from './lib/match-context.mjs';

const FM = 'https://www.fotmob.com/api/data';
// FotMob-liga per kod (grupp = tabellnamn i ligor med flera tabeller, t.ex. Ettan Norra/Sodra)
export const FOTMOB = {
  PL: 47, CH: 48, EL1: 108, EL2: 109, BL: 54, BL2: 146, LL: 87, LL2: 140, SA: 55, SB: 86, L1: 53, ED: 57, PT: 61, GR: 135,
  AS: 67, SE2: 168, SE3N: [169, 'Norra'], SE3S: [169, 'Soedra'], NO: 59, NO2: 203, DK: 46, DK2: 85, EK: 196,
  JP1: 223, MLS: 130, MX: 230, BR: 268, BR2: 8814, AR: 112, COL: 274,
  CZ: 122, HR: 252, CL: 42, EL: 73, ECL: 10216,
};
const TEAM_MAX_AGE_H = 20;
const PARALLEL = 3;
const DIR_SQ = path.join(root, 'data', 'trupper');
const DIR_LG = path.join(root, 'data', 'ligor');
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch { /* forsok igen */ }
    await sleep(1000 * (i + 1));
  }
  return null;
}

// Alla tabellrader (ligor med grupper/konferenser har flera tabeller)
function tableRows(doc, group) {
  const rows = [];
  for (const t of doc?.table ?? []) {
    const d = t.data ?? {};
    const tables = d.tables?.length ? d.tables : [{ leagueName: d.leagueName, table: d.table }];
    for (const x of tables) {
      if (group && !String(x.leagueName ?? '').includes(group)) continue;
      for (const r of x.table?.all ?? []) rows.push({ ...r, group: tables.length > 1 ? x.leagueName : null });
    }
  }
  return rows;
}

// Vara lagnamn i ligan (senaste sasongerna) for mappning
function ourTeams(code) {
  const file = path.join(root, 'data', 'matcher', `${code}.csv`);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).slice(-900);
  const set = new Set();
  for (const l of lines) { const c = l.split(','); if (c[5]) set.add(c[5]); if (c[6]) set.add(c[6]); }
  set.delete('home');
  return [...set];
}
// FotMob-namn som inte liknar football-datas (football-data -> vart namn)
const ALIASES = {
  'Sporting CP': 'Sp Lisbon', 'Sporting Braga': 'Sp Braga', 'Olympiacos': 'Olympiakos', 'Levadiakos': 'Levadeiakos',
  'FC København': 'FC Copenhagen', OB: 'Odense', AGF: 'Aarhus', AB: 'AB Gladsaxe', 'Urawa Red Diamonds': 'Urawa Reds',
  'Deportivo A Coruña': 'La Coruna', 'Celta Fortuna': 'Celta B', 'Real Sociedad B': 'Sociedad B', 'Wisła Kraków': 'Wisla',
  'Zagłębie Lubin': 'Zaglebie', 'Athletic Club': 'Ath Bilbao', 'Atletico Madrid': 'Ath Madrid', 'Atlético Madrid': 'Ath Madrid',
};
const fold = (x) => String(x).replace(/ø/g, 'o').replace(/Ø/g, 'O').replace(/æ/g, 'ae').replace(/Æ/g, 'Ae').replace(/ł/g, 'l').replace(/Ł/g, 'L')
  .replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
function mapTeam(names, fm, short) {
  if (ALIASES[fm] && names.includes(ALIASES[fm])) return ALIASES[fm];
  const exact = names.find((n) => fold(n).toLowerCase() === fold(fm).toLowerCase() || (short && fold(n).toLowerCase() === fold(short).toLowerCase()));
  if (exact) return exact;
  let best = null;
  for (const n of names) {
    const a = fold(n), b = fold(fm), c = short ? fold(short) : null;
    const s = Math.max(nameScore(a, null, b), c ? nameScore(a, null, c) : 0, nameScore(b, null, a));
    if (s >= 0.5 && (!best || s > best.s)) best = { s, n };
  }
  return best?.n ?? fm;
}

function player(m, role) {
  return {
    id: m.id, name: m.name, role, position: m.positionIdsDesc ?? m.role?.fallback ?? null, number: m.shirtNumber ?? null,
    age: m.age ?? null, born: m.dateOfBirth ?? null, country: m.cname ?? null, height: m.height ?? null,
    value: m.transferValue ?? null, rating: m.rating ?? null, goals: m.goals ?? null, assists: m.assists ?? null,
    penalties: m.penalties ?? null, yellow: m.ycards ?? null, red: m.rcards ?? null,
    // FotMob ger bara skadetypens id och vantad aterkomst ("Doubtful", "Mid October 2026", ...)
    injury: m.injury ? { typeId: m.injury.id ?? null, expectedReturn: m.injury.expectedReturn ?? null } : null,
  };
}

const only = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const FORCE = process.argv.includes('--force'); // hamta alla trupper igen trots cache
fs.mkdirSync(DIR_SQ, { recursive: true });
fs.mkdirSync(DIR_LG, { recursive: true });
const now = new Date().toISOString();
const today = now.slice(0, 10);
let okLeagues = 0, teamsFetched = 0;
for (const [code, spec] of Object.entries(FOTMOB)) {
  if (only.length && !only.includes(code)) continue;
  const [id, group] = Array.isArray(spec) ? spec : [spec, null];
  const lgDoc = await getJson(`${FM}/leagues?id=${id}`);
  const rows = tableRows(lgDoc, group);
  if (!rows.length) { console.warn(`${code}: ingen tabell från FotMob (behåller befintliga filer)`); continue; }
  const names = ourTeams(code);
  const sqFile = path.join(DIR_SQ, `${code}.json`);
  const lgFile = path.join(DIR_LG, `${code}.json`);
  const prevSq = readJson(sqFile, { teams: {} });
  const prevLg = readJson(lgFile, { tableHistory: {} });

  // Tabell + historik (en snapshot per dag)
  const table = rows.map((r) => ({
    rank: r.idx, team: mapTeam(names, r.name, r.shortName), fotmobName: r.name, fotmobId: r.id, group: r.group,
    played: r.played, won: r.wins, drawn: r.draws, lost: r.losses, goals: r.scoresStr, gd: r.goalConDiff, pts: r.pts,
  }));
  const tableHistory = { ...(prevLg.tableHistory ?? {}), [today]: table.map((t) => [t.team, t.rank, t.played, t.pts, t.gd]) };

  // Trupper
  const teams = {};
  const isFresh = (prev) => !FORCE && prev?.fetchedAt && (Date.parse(now) - Date.parse(prev.fetchedAt)) / 36e5 < TEAM_MAX_AGE_H;
  // Hamta lagens sidor parallellt (PARALLEL at gangen)
  const docs = new Map();
  const queue = table.filter((t) => !isFresh(prevSq.teams?.[t.team]));
  await Promise.all(Array.from({ length: PARALLEL }, async () => {
    for (let t = queue.shift(); t; t = queue.shift()) { docs.set(t.fotmobId, await getJson(`${FM}/teams?id=${t.fotmobId}`)); await sleep(150); }
  }));
  // Misslyckade (troligen strypta) lag: en gang till, ett i taget och langsammare
  for (const [id, doc] of docs) {
    if (doc?.squad?.squad?.length) continue;
    await sleep(1500);
    docs.set(id, await getJson(`${FM}/teams?id=${id}`));
  }
  for (const t of table) {
    const prev = prevSq.teams?.[t.team];
    const fresh = isFresh(prev);
    let squad = fresh ? { coach: prev.coach, players: prev.players, fetchedAt: prev.fetchedAt } : null;
    if (!squad) {
      const doc = docs.get(t.fotmobId);
      const groups = doc?.squad?.squad ?? [];
      if (groups.length) {
        teamsFetched++;
        const coach = groups.find((g) => g.title === 'coach')?.members?.[0]?.name ?? null;
        const players = groups.filter((g) => g.title !== 'coach').flatMap((g) => (g.members ?? []).map((m) => player(m, g.title)));
        squad = { coach, players, fetchedAt: now };
      } else if (prev) {
        squad = { coach: prev.coach, players: prev.players, fetchedAt: prev.fetchedAt }; // behall gammal trupp
      }
    }
    if (!squad) continue;
    // Historik: forsta/senaste gang spelaren sags i laget (spelare som lamnat ligger kvar med lastSeen)
    const history = { ...(prev?.history ?? {}) };
    for (const p of squad.players) history[p.id] = { name: p.name, firstSeen: history[p.id]?.firstSeen ?? today, lastSeen: today };
    const current = new Set(squad.players.map((p) => String(p.id)));
    const left = Object.entries(history).filter(([pid]) => !current.has(String(pid))).map(([pid, h]) => ({ id: pid, ...h }));
    const coachHistory = [...(prev?.coachHistory ?? [])];
    if (squad.coach && coachHistory.at(-1)?.name !== squad.coach) coachHistory.push({ name: squad.coach, firstSeen: today });
    teams[t.team] = { fotmobName: t.fotmobName, fotmobId: t.fotmobId, ...squad, coachHistory, history, left };
  }
  // Tabellen sparas alltid. Trupper saknas hos FotMob for vissa lagre ligor (J2, J3, Ettan): behall befintlig truppfil
  if (Object.keys(teams).length) fs.writeFileSync(sqFile, JSON.stringify({ updatedAt: now, league: code, fotmobId: id, source: 'FotMob', teams }, null, 1), 'utf8');
  else console.warn(`${code}: inga trupper hos FotMob (tabellen sparas)`);
  fs.writeFileSync(lgFile, JSON.stringify({ updatedAt: now, league: code, fotmobId: id, name: lgDoc?.details?.name ?? null, country: lgDoc?.details?.country ?? null, table, tableHistory }, null, 1), 'utf8');
  okLeagues++;
  const unmapped = table.filter((t) => t.team === t.fotmobName && !names.includes(t.team)).map((t) => t.team);
  console.log(`${code.padEnd(5)} ${Object.keys(teams).length} lag, ${Object.values(teams).reduce((s, x) => s + x.players.length, 0)} spelare${unmapped.length ? ` (FotMob-namn, ej i vår historik: ${unmapped.join(', ')})` : ''}`);
}
console.log(`Klart: ${okLeagues} ligor, ${teamsFetched} trupper hämtade nu. Filer: data/trupper/, data/ligor/`);
