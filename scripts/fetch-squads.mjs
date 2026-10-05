// Aktuella trupper och tabeller for alla ligor fran FotMob (oppet API, samma som scripts/lib/match-context.mjs).
//   data/trupper/<liga>.json  lag -> tranare + spelare (position, alder, nummer, land, marknadsvarde, skada,
//                             FotMob-betyg, mal, assist, kort) + historik: nar spelaren forst/senast sags i laget
//   data/ligor/<liga>.json    tabell nu + tabellhistorik per dag (en rad per lag och dag)
// Saknar FotMob trupp (Ettan, vissa CL-lag) hamtas den fran Transfermarkt (scripts/lib/transfermarkt.mjs), source anges per lag.
// Skador i PL/CH/EL1/EL2 kompletteras med Transfermarkts skadelista (injury.source = 'Transfermarkt').
// Lagnamn mappas till vara (football-data/store) via data/matcher/<liga>.csv. Lag hamtade senaste 20 h ateranvands.
// Befintlig fil skrivs aldrig over med tom data. Kors: npm run trupper [-- PL SA ...] [-- --force]
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { nameScore } from './lib/match-context.mjs';
import { fold, mapTable } from './lib/fotmob-names.mjs';
import { FOTMOB_LEAGUES as FOTMOB } from './lib/fotmob-leagues.mjs';
import { TM_COMP, TM_INJURY_LEAGUES, TM_TEAM_ID, mergeTmInjuries, tmClubs, tmInjuries, tmSquad } from './lib/transfermarkt.mjs';
import { fotmobGet as getJson } from './lib/api-schemas.mjs';

const FM = 'https://www.fotmob.com/api/data';
const TEAM_MAX_AGE_H = 20;
const PARALLEL = 3;
const DIR_SQ = path.join(root, 'data', 'trupper');
const DIR_LG = path.join(root, 'data', 'ligor');
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

// Vara lagnamn i ligan (senaste sasongerna) for mappning. Kallorna byter ibland namnform mellan sasonger
// (Kolding IF -> Kolding, NK Varazdin -> Varazdin), sa innevarande sasongs namn (cur) gar fore aldre.
function ourTeams(code) {
  const file = path.join(root, 'data', 'matcher', `${code}.csv`);
  if (!fs.existsSync(file)) return { cur: [], all: [] };
  const rows = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).slice(1).slice(-900).map((l) => l.split(','));
  const season = rows.findLast((c) => c[2])?.[2];
  const cur = new Set(), all = new Set();
  for (const c of rows) for (const n of [c[5], c[6]]) if (n) { all.add(n); if (!c[2] || c[2] === season) cur.add(n); }
  return { cur: [...cur], all: [...all] };
}
// FotMob listar ibland hela akademin (brasilianska lag 50-60 spelare, U20 med egna trojnummer). I uppblasta trupper
// tas spelare 21 ar eller yngre utan en enda insats i ar bort (Transfermarkt har dem inte i A-truppen).
const MAX_SQUAD = 40;
function dropAcademy(players) {
  if (players.length <= MAX_SQUAD) return players;
  return players.filter((p) => p.rating != null || p.goals || p.assists || (p.age ?? 99) > 21);
}

// PL: FPL (officiell) markerar spelare som lamnat, ar utlanade eller inte registrerade med status 'u'
async function fplUnavailable() {
  const d = await getJson('https://fantasy.premierleague.com/api/bootstrap-static/');
  if (!d?.elements) return null;
  const key = (s) => fold(s).toLowerCase().replace(/[^a-z ]/g, '').trim();
  const FPL_TEAM = { 'Man Utd': 'Man United', Spurs: 'Tottenham' };
  const team = new Map(d.teams.map((t) => [t.id, FPL_TEAM[t.name] ?? t.name]));
  const set = new Set();
  for (const e of d.elements) {
    if (e.status !== 'u') continue;
    const t = team.get(e.team);
    for (const k of [key(`${e.first_name} ${e.second_name}`), key(e.web_name)]) set.add(`${t}|${k}`);
  }
  // vart lag (Hull) mot FPL:s (Hull City): FPL-namnet borjar med vart
  const fplTeams = [...new Set(team.values())];
  return (ours, name) => fplTeams.some((t) => key(t).startsWith(key(ours)) && set.has(`${t}|${key(name)}`));
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
// Spelare som Transfermarkt-kontrollen (verify-squads-tm.mjs) visat har lamnat klubben
const excluded = readJson(path.join(DIR_SQ, '_uteslutna.json'), { players: {} }).players;
const fplOut = !only.length || only.includes('PL') ? await fplUnavailable() : null;
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
  const ourName = mapTable(names, rows);
  const table = rows.map((r) => ({
    rank: r.idx, team: ourName.get(r.id), fotmobName: r.name, fotmobId: r.id, group: r.group,
    played: r.played, won: r.wins, drawn: r.draws, lost: r.losses, goals: r.scoresStr, gd: r.goalConDiff, pts: r.pts,
  }));
  const tableHistory = { ...(prevLg.tableHistory ?? {}), [today]: table.map((t) => [t.team, t.rank, t.played, t.pts, t.gd]) };

  // Trupper
  const teams = {};
  let tmList = null;
  const tmUsed = new Set(); // en Transfermarkt-klubb per lag (FBK Karlstad / IF Karlstad)
  // Tidigare trupp bara om den hor till samma FotMob-lag (en gammal felkoppling ska inte leva kvar)
  const prevOf = (t) => (prevSq.teams?.[t.team]?.fotmobId === t.fotmobId ? prevSq.teams[t.team] : null);
  const isFresh = (prev) => !FORCE && prev?.fetchedAt && (Date.parse(now) - Date.parse(prev.fetchedAt)) / 36e5 < TEAM_MAX_AGE_H;
  // Hamta lagens sidor parallellt (PARALLEL at gangen)
  const docs = new Map();
  const queue = table.filter((t, i) => !isFresh(prevOf(t)) && table.findIndex((x) => x.fotmobId === t.fotmobId) === i);
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
    if (teams[t.team]) continue; // samma lag i flera tabeller (grupper/konferenser)
    const prev = prevOf(t);
    const fresh = isFresh(prev);
    let squad = fresh ? { coach: prev.coach, players: prev.players, fetchedAt: prev.fetchedAt, source: prev.source, tmId: prev.tmId } : null;
    if (!squad) {
      const doc = docs.get(t.fotmobId);
      const groups = doc?.squad?.squad ?? [];
      if (groups.length) {
        teamsFetched++;
        const coach = groups.find((g) => g.title === 'coach')?.members?.[0]?.name ?? null;
        const players = groups.filter((g) => g.title !== 'coach').flatMap((g) => (g.members ?? []).map((m) => player(m, g.title)));
        squad = { coach, players, fetchedAt: now };
      } else if (TM_COMP[code] && (tmList ??= await tmClubs(code)).length) {
        // FotMob saknar trupp: Transfermarkt
        const fixed = TM_TEAM_ID[`${code}|${t.team}`]; // galler aven utanfor Transfermarkts ligalista
        const tm = fixed ? { c: tmList.find((c) => c.id === fixed) ?? { id: fixed, name: t.team }, s: 2 } : tmList.filter((c) => !tmUsed.has(c.id)).map((c) => ({ c, s: Math.max(nameScore(fold(t.fotmobName), null, fold(c.name)), nameScore(fold(t.team), null, fold(c.name))) }))
          .sort((a, b) => b.s - a.s)[0];
        const sq = tm?.s >= 0.5 ? await tmSquad(tm.c.id) : null;
        if (sq) { tmUsed.add(tm.c.id); teamsFetched++; squad = { ...sq, fetchedAt: now, source: 'Transfermarkt', tmId: tm.c.id }; console.log(`  ${t.team}: Transfermarkt (${tm.c.name}, ${sq.players.length} spelare)`); }
        else if (prev) squad = { coach: prev.coach, players: prev.players, fetchedAt: prev.fetchedAt, source: prev.source, tmId: prev.tmId };
        else console.warn(`  ${t.team}: ingen trupp hos FotMob eller Transfermarkt`);
      } else if (prev) {
        squad = { coach: prev.coach, players: prev.players, fetchedAt: prev.fetchedAt }; // behall gammal trupp
      }
    }
    if (!squad) continue;
    squad.players = dropAcademy(squad.players).filter((p) => !excluded[`${code}|${t.team}|${p.id}`]);
    if (code === 'PL' && fplOut) {
      const out = squad.players.filter((p) => fplOut(t.team, p.name));
      if (out.length) console.log(`  ${t.team}: ${out.map((p) => p.name).join(', ')} borttagen (FPL: ej i truppen/utlånad)`);
      squad.players = squad.players.filter((p) => !out.includes(p));
    }
    // Historik: forsta/senaste gang spelaren sags i laget (spelare som lamnat ligger kvar med lastSeen)
    const history = { ...(prev?.history ?? {}) };
    for (const p of squad.players) history[p.id] = { name: p.name, firstSeen: history[p.id]?.firstSeen ?? today, lastSeen: today };
    const current = new Set(squad.players.map((p) => String(p.id)));
    const left = Object.entries(history).filter(([pid]) => !current.has(String(pid))).map(([pid, h]) => ({ id: pid, ...h }));
    const coachHistory = [...(prev?.coachHistory ?? [])];
    if (squad.coach && coachHistory.at(-1)?.name !== squad.coach) coachHistory.push({ name: squad.coach, firstSeen: today });
    teams[t.team] = { fotmobName: t.fotmobName, fotmobId: t.fotmobId, ...squad, coachHistory, history, left };
  }
  // Skador: FotMob saknar manga i lagre engelska ligor, Transfermarkts skadelista fyller pa (spelaren markeras med source)
  if (TM_INJURY_LEAGUES.includes(code) && Object.keys(teams).length) {
    const inj = await tmInjuries(code);
    if (inj.length) console.log(`  skador fran Transfermarkt: ${mergeTmInjuries(teams, inj)} av ${inj.length} tillagda (ovriga redan markerade av FotMob eller ej i truppen)`);
  }
  // Tabellen sparas alltid. Trupper saknas hos FotMob for vissa lagre ligor (J2, J3, Ettan): behall befintlig truppfil
  if (Object.keys(teams).length) fs.writeFileSync(sqFile, JSON.stringify({ updatedAt: now, league: code, fotmobId: id, source: 'FotMob', teams }, null, 1), 'utf8');
  else console.warn(`${code}: inga trupper hos FotMob (tabellen sparas)`);
  fs.writeFileSync(lgFile, JSON.stringify({ updatedAt: now, league: code, fotmobId: id, name: lgDoc?.details?.name ?? null, country: lgDoc?.details?.country ?? null, table, tableHistory }, null, 1), 'utf8');
  okLeagues++;
  const unmapped = table.filter((t) => t.team === t.fotmobName && !names.all.includes(t.team)).map((t) => t.team);
  console.log(`${code.padEnd(5)} ${Object.keys(teams).length} lag, ${Object.values(teams).reduce((s, x) => s + x.players.length, 0)} spelare${unmapped.length ? ` (FotMob-namn, ej i vår historik: ${unmapped.join(', ')})` : ''}`);
}
console.log(`Klart: ${okLeagues} ligor, ${teamsFetched} trupper hämtade nu. Filer: data/trupper/, data/ligor/`);
