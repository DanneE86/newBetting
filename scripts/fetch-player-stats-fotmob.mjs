// All statistik per spelare fran FotMob (playerData + playerStats, samma som fotmob.com/sv/players/<id>) for alla
// spelare i data/trupper/<liga>.json, med position mappad mot Transfermarkt.
//   data/spelare/<liga>.json        lag -> spelare: position (grupp + kallor), info, innevarande och forra sasongens
//                                   statistik (total, per 90, percentil mot samma position), skottsammanfattning,
//                                   FotMobs egenskapsjamforelse, form, senaste matcher, karriar, marknadsvarde,
//                                   nyckeltal for spelarens positionsgrupp (scripts/lib/player-positions.mjs)
//   data/spelare/_transfermarkt.json  Transfermarkts trupper (position per spelare), hamtas om efter 7 dagar
// Statistik per stat: [total, per 90, percentil (per 90) mot spelare pa samma position i ligan].
// Spelare hamtade senaste 3 dagarna ateranvands. Forra sasongen hamtas bara en gang.
// Kors: npm run spelare [-- AS PL ...] [-- --force] [-- --no-tm]   (alla ligor: ca 2 h forsta gangen)
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { TM_COMP, tmClubs, tmSquad, pairClubs, sameName } from './lib/transfermarkt.mjs';
import { GROUPS, KEY_STATS, positionGroup, tmGroup } from './lib/player-positions.mjs';
import { day, r, statMap, form, matchRows } from './lib/fotmob-player.mjs';
import { fotmobGet as getJson } from './lib/api-schemas.mjs';

const FM = 'https://www.fotmob.com/api/data';
const PLAYER_MAX_AGE_D = 3;
const TM_MAX_AGE_D = 7;
const PARALLEL = 4;
const RECENT_MATCHES = 10;
const DIR_SQ = path.join(root, 'data', 'trupper');
const DIR_OUT = path.join(root, 'data', 'spelare');
const TM_FILE = path.join(DIR_OUT, '_transfermarkt.json');
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ageDays = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 864e5 : Infinity);

// Skottkartan sammanfattad (hela kartan ar for stor att spara for alla spelare)
function shotSummary(shots) {
  if (!shots?.length) return null;
  const s = { shots: shots.length, goals: 0, xG: 0, xGOT: 0, onTarget: 0, blocked: 0, insideBox: 0, headers: 0, bySituation: {}, byType: {} };
  for (const x of shots) {
    if (x.eventType === 'Goal') s.goals++;
    s.xG += x.expectedGoals ?? 0;
    s.xGOT += x.expectedGoalsOnTarget ?? 0;
    if (x.isOnTarget) s.onTarget++;
    if (x.isBlocked) s.blocked++;
    if (x.isFromInsideBox) s.insideBox++;
    if (x.shotType === 'Header') s.headers++;
    s.bySituation[x.situation] = (s.bySituation[x.situation] ?? 0) + 1;
    s.byType[x.shotType] = (s.byType[x.shotType] ?? 0) + 1;
  }
  s.xG = r(s.xG); s.xGOT = r(s.xGOT);
  s.xgPerShot = r(s.xG / s.shots, 3);
  return s;
}

const season = (doc, meta) => (doc?.statsSection || doc?.topStatCard
  ? { season: meta.seasonName, tournament: meta.name, tournamentId: meta.tournamentId, stats: statMap(doc), shots: shotSummary(doc.shotmap) }
  : null);

// Forra sasongen: forst samma liga som nu, annars forsta tavlingen med fullstandig statistik
function prevSeasonEntry(d) {
  const cur = d.statSeasons?.[0]?.seasonName;
  const cand = (d.statSeasons ?? []).slice(1).filter((s) => s.seasonName !== cur)
    .flatMap((s) => s.tournaments.filter((t) => t.hasDeepStats).map((t) => ({ ...t, seasonName: s.seasonName })));
  return cand.find((t) => t.tournamentId === d.mainLeague?.leagueId) ?? cand[0] ?? null;
}

const info = (d, key) => d.playerInformation?.find((x) => x.translationKey === key)?.value;

function record(p, team, d, prevRec, prevDoc, prevMeta, tmPos) {
  const main = d.positionDescription?.positions?.find((x) => x.isMainPosition) ?? d.positionDescription?.positions?.[0];
  const fotmobMain = main?.strPosShort?.label ?? null;
  const pos = positionGroup({ fotmobMain, fotmobMatches: main?.occurences, tm: tmPos, squadPosition: p.position, role: p.role });
  const tmG = tmGroup(tmPos), fmG = fotmobMain ? positionGroup({ fotmobMain, fotmobMatches: 99 }).group : null;
  const cur = season(d.firstSeasonStats, { ...d.statSeasons?.[0]?.tournaments?.[0], seasonName: d.statSeasons?.[0]?.seasonName });
  const prev = prevDoc ? season(prevDoc, prevMeta) : (prevRec?.prevSeason ?? null);
  const nyckeltal = {};
  for (const k of KEY_STATS[pos.group] ?? []) if (cur?.stats[k]) nyckeltal[k] = cur.stats[k];
  const recent = d.recentMatches ?? [];
  return {
    id: p.id, name: d.name ?? p.name, team, fotmobTeam: d.primaryTeam?.teamName ?? null, onLoan: d.primaryTeam?.onLoan ?? false,
    position: {
      group: pos.group, label: GROUPS[pos.group] ?? null, source: pos.source,
      fotmob: fotmobMain, fotmobMatches: main?.occurences ?? null,
      fotmobOther: (d.positionDescription?.positions ?? []).filter((x) => x !== main).map((x) => `${x.strPosShort?.label}:${x.occurences}`),
      transfermarkt: tmPos ?? null, squad: p.position ?? null,
      // FotMob (spelat i ar) och Transfermarkt (klubbens angivna) ger olika grupp
      differs: !!(tmG && fmG && tmG !== fmG),
    },
    info: {
      age: info(d, 'age_sentencecase')?.numberValue ?? p.age ?? null, born: day(d.birthDate) ?? p.born ?? null,
      height: info(d, 'height_sentencecase')?.numberValue ?? p.height ?? null, foot: info(d, 'preferred_foot')?.key ?? null,
      country: info(d, 'country_sentencecase')?.fallback ?? p.country ?? null, shirt: info(d, 'shirt')?.numberValue ?? p.number ?? null,
      marketValue: info(d, 'transfer_value')?.numberValue ?? p.value ?? null, contractEnd: day(d.contractEnd),
      captain: d.isCaptain ?? false, status: d.status ?? null,
      injury: d.injuryInformation ? { name: d.injuryInformation.name ?? null, expectedReturn: d.injuryInformation.expectedReturn ?? null } : p.injury ?? null,
      internationalDuty: d.internationalDuty ?? null,
    },
    league: d.mainLeague ? {
      name: d.mainLeague.leagueName, season: d.mainLeague.season,
      ...Object.fromEntries((d.mainLeague.stats ?? []).map((s) => [s.localizedTitleId, s.value])),
    } : null,
    season: cur,
    prevSeason: prev,
    nyckeltal,
    traits: d.traits ? { comparedTo: d.traits.key?.replace('stats_comparison_', ''), ...Object.fromEntries((d.traits.items ?? []).map((t) => [t.key, t.value])) } : null,
    form: form(recent),
    // [datum, lag, motstandare, hemma, minuter, betyg, mal, assist, gula, roda, bank, liga]
    matches: matchRows(recent, RECENT_MATCHES),
    // [lag, fran, till, matcher, mal, assist, overgang]
    career: (d.careerHistory?.careerItems?.senior?.teamEntries ?? []).map((c) => [c.team, day(c.startDate), day(c.endDate),
      c.appearances != null ? Number(c.appearances) : null, c.goals != null ? Number(c.goals) : null, c.assists != null ? Number(c.assists) : null,
      c.transferType?.text ?? null]),
    marketValueHistory: (d.marketValues?.values ?? []).map((v) => [day(v.date), v.value]),
    nextMatch: d.nextMatch ? { date: day(d.nextMatch.matchDate), home: d.nextMatch.homeName, away: d.nextMatch.awayName, league: d.nextMatch.leagueName } : null,
    fetchedAt: new Date().toISOString(),
  };
}

// Spelare utan FotMob-id (trupper fran Transfermarkt): bara position och truppens uppgifter
function tmOnlyRecord(p, team) {
  const pos = positionGroup({ tm: p.position, role: p.role });
  return {
    id: p.id, name: p.name, team,
    position: { group: pos.group, label: GROUPS[pos.group] ?? null, source: pos.source, fotmob: null, transfermarkt: p.position ?? null, squad: p.position ?? null, differs: false },
    info: { age: p.age, born: p.born, height: p.height, country: p.country, shirt: p.number, marketValue: p.value, injury: p.injury },
    season: null, prevSeason: null, nyckeltal: {}, fetchedAt: new Date().toISOString(),
  };
}

// Transfermarkts position per spelare i ligans lag (cache 7 dagar)
async function tmPositions(code, teams, cache) {
  const need = teams.filter(([team, x]) => x.source !== 'Transfermarkt' && ageDays(cache[`${code}|${team}`]?.fetchedAt) > TM_MAX_AGE_D);
  if (need.length && TM_COMP[code]) {
    const clubs = await tmClubs(code);
    const pair = clubs.length ? pairClubs(code, teams, clubs) : new Map();
    for (const [team] of need) {
      const club = pair.get(team);
      if (!club) { console.warn(`  ${team}: ingen Transfermarkt-klubb`); continue; }
      await sleep(1000);
      const sq = await tmSquad(club.id, { coach: false });
      if (!sq) { console.warn(`  ${team}: tom trupp hos Transfermarkt (${club.name})`); continue; }
      cache[`${code}|${team}`] = { clubId: club.id, club: club.name, fetchedAt: new Date().toISOString(), players: sq.players.map((t) => [t.name, t.born, t.position]) };
    }
    fs.writeFileSync(TM_FILE, JSON.stringify(cache), 'utf8');
  }
  // Samma fodelsedag eller samma namn = samma spelare
  return (team, p) => {
    const list = cache[`${code}|${team}`]?.players ?? [];
    return (list.find(([, born]) => p.born && born === p.born) ?? list.find(([name]) => sameName(p.name, name)))?.[2] ?? null;
  };
}

const args = process.argv.slice(2);
const only = args.filter((x) => !x.startsWith('--'));
const FORCE = args.includes('--force');
const NO_TM = args.includes('--no-tm');
fs.mkdirSync(DIR_OUT, { recursive: true });
const tmCache = readJson(TM_FILE, {});
// Ettan Norra/Sodra hoppas over (trupperna kommer fran Transfermarkt, FotMob har ingen statistik)
const SKIP = new Set(['SE3N', 'SE3S']);
const leagues = fs.readdirSync(DIR_SQ).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.slice(0, -5))
  .filter((c) => !SKIP.has(c) || only.includes(c));
let fetched = 0, reused = 0, failed = 0;
for (const code of leagues) {
  if (only.length && !only.includes(code)) continue;
  const sq = readJson(path.join(DIR_SQ, `${code}.json`));
  if (!sq?.teams) continue;
  const outFile = path.join(DIR_OUT, `${code}.json`);
  const prevOut = readJson(outFile, { teams: {} });
  const prevById = new Map(Object.values(prevOut.teams ?? {}).flatMap((t) => t.players.map((p) => [String(p.id), p])));
  const teams = Object.entries(sq.teams);
  const tmPos = NO_TM ? null : await tmPositions(code, teams, tmCache);
  const out = { updatedAt: new Date().toISOString(), league: code, source: 'FotMob + Transfermarkt (position)', groups: GROUPS, teams: {} };
  let n0 = fetched;
  for (const [team, x] of teams) {
    const players = new Array(x.players.length);
    const queue = x.players.map((p, i) => [p, i]);
    await Promise.all(Array.from({ length: PARALLEL }, async () => {
      for (let q = queue.shift(); q; q = queue.shift()) {
        const [p, i] = q;
        const tm = x.source === 'Transfermarkt' ? p.position : (NO_TM ? prevById.get(String(p.id))?.position?.transfermarkt ?? null : tmPos(team, p));
        if (typeof p.id !== 'number') { players[i] = tmOnlyRecord(p, team); continue; }
        const prev = prevById.get(String(p.id));
        if (!FORCE && prev?.season !== undefined && ageDays(prev.fetchedAt) < PLAYER_MAX_AGE_D) {
          players[i] = { ...prev, team, position: { ...prev.position, transfermarkt: tm ?? prev.position?.transfermarkt ?? null } };
          reused++; continue;
        }
        const d = await getJson(`${FM}/playerData?id=${p.id}`);
        await sleep(120);
        if (!d?.id) { failed++; if (prev) players[i] = prev; continue; }
        // Forra sasongen hamtas bara om den inte redan finns for samma tavling och sasong
        const meta = prevSeasonEntry(d);
        let prevDoc = null;
        if (meta && !(prev?.prevSeason?.season === meta.seasonName && prev?.prevSeason?.tournamentId === meta.tournamentId)) {
          prevDoc = await getJson(`${FM}/playerStats?playerId=${p.id}&seasonId=${meta.entryId}&isFirstSeason=false`);
          await sleep(120);
        }
        players[i] = record(p, team, d, prev, prevDoc, meta, tm);
        fetched++;
      }
    }));
    out.teams[team] = { fotmobId: x.fotmobId ?? null, players: players.filter(Boolean) };
    fs.writeFileSync(outFile, JSON.stringify(out), 'utf8'); // efter varje lag, sa ett avbrott inte kastar allt
  }
  const all = Object.values(out.teams).flatMap((t) => t.players);
  const byGroup = Object.fromEntries(Object.keys(GROUPS).map((g) => [g, all.filter((p) => p.position?.group === g).length]));
  console.log(`${code.padEnd(5)} ${all.length} spelare (${fetched - n0} hämtade), ${all.filter((p) => p.position?.differs).length} med olika position FotMob/TM | ${Object.entries(byGroup).map(([g, c]) => `${g} ${c}`).join(', ')}`);
}
console.log(`Klart: ${fetched} hämtade, ${reused} återanvända, ${failed} misslyckade`);
