// Startelva per match från FotMob (officiell, förväntad eller senaste elvan) och spelare mot spelare:
// varje spelare paras med sin direkta motståndare (ytter mot ytterback, anfallare mot mittback, mittfält mot
// mittfält, målvakt mot målvakt) och jämförs på FotMob-statistik. Gäller Oddset, Stryktipset och Europatipset.
//
// Roll och sida kommer från FotMobs positions-id i elvan: tiotalet är ledet (1 målvakt, 3 backlinje, 5 wingback,
// 6 defensivt mittfält, 7 mittfält, 8 offensivt mittfält, 9-11 anfall), entalet sidan (1-2 höger, 8-9 vänster).
// Motståndaren hittas genom att spegla motståndarlagets planposition (x = djup, y = sida): hemmalagets högerytter
// står då närmast bortalagets vänsterback.
//
// Statistiken är spelarens klubbsäsong (data/spelare/<liga>.json, annars hämtad från FotMob och sparad i
// data/startelvor.json). Percentilerna är FotMobs, per 90 och mot spelare på samma position i spelarens egen liga,
// och högre = bättre även för negativa tal (dribblad förbi, tappade bollar).
//
// Startelvorna ändrar inte tipsmotorn.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  statSource, score, edgeText, highlights, ATTACK_WIDE, DEFEND_WIDE, ATTACK_CENTRAL, DEFEND_CENTRAL, MID_CONTROL, MID_CREATE, KEEPER,
} from './matchup.mjs';
import { statMap, form, matchRows } from './fotmob-player.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const STORE = path.join(ROOT, 'data', 'startelvor.json');
const DIR_PLAYERS = path.join(ROOT, 'data', 'spelare');
const FM = 'https://www.fotmob.com/api/data';

// ---------- Roller ----------

export const ROLE_LABEL = {
  gk: 'Målvakt', cb: 'Mittback', fb: 'Ytterback', wb: 'Wingback', dm: 'Defensiv mittfältare', cm: 'Central mittfältare',
  am: 'Offensiv mittfältare', wing: 'Ytter', st: 'Anfallare',
};
const ROLE_GROUP = {
  gk: 'malvakt', cb: 'mittback', fb: 'ytterback', wb: 'ytterback', dm: 'defensiv_mittfaltare', cm: 'central_mittfaltare',
  am: 'offensiv_mittfaltare', wing: 'ytter', st: 'anfallare',
};
const SIDE_TXT = { R: 'Höger', L: 'Vänster' };

/** "Höger ytterback", "Mittback", "Vänster ytter". */
export function roleLabel(role, side) {
  const base = ROLE_LABEL[role] || 'Spelare';
  if (!side || !['fb', 'wb', 'wing'].includes(role)) return base;
  return `${SIDE_TXT[side]} ${base.toLowerCase()}`;
}

/**
 * Roll och sida från FotMobs positions-id. team = { backLine, forwards }: antal spelare i backlinjen (3x) och i
 * anfallsledet (9x-11x). Breda mittfältare blir wingbacks bakom en trebackslinje, annars yttrar; i en anfallstrio är
 * de yttre anfallarna yttrar. Utan positions-id används planpositionen (x = djup, y = sida, högt y = höger).
 */
export function roleOf(positionId, layout = null, team = {}) {
  const pid = Number(positionId);
  const y = layout?.y;
  if (!Number.isFinite(pid) || pid <= 0) {
    const x = layout?.x;
    if (x == null) return { role: 'cm', side: null };
    const side = y > 0.65 ? 'R' : y < 0.35 ? 'L' : null;
    if (x < 0.2) return { role: 'gk', side: null };
    if (x < 0.4) return side ? { role: 'fb', side } : { role: 'cb', side: null };
    if (x < 0.6) return side ? { role: 'wing', side } : { role: 'cm', side: null };
    if (x < 0.8) return side ? { role: 'wing', side } : { role: 'am', side: null };
    return { role: 'st', side: null };
  }
  if (pid === 11 || pid < 20) return { role: 'gk', side: null };
  const line = Math.floor(pid / 10), unit = pid % 10;
  const wideR = unit <= 2, wideL = unit >= 8;
  const side = wideR ? 'R' : wideL ? 'L' : null;
  if (line <= 4) return side ? { role: 'fb', side } : { role: 'cb', side: null };
  if (line === 5) return side ? { role: 'wb', side } : { role: 'dm', side: null };
  if (line === 6 || line === 7) {
    if (side) return { role: (team.backLine ?? 4) <= 3 ? 'wb' : 'wing', side };
    return { role: line === 6 ? 'dm' : 'cm', side: null };
  }
  if (line === 8) {
    const s = unit <= 3 ? 'R' : unit >= 7 ? 'L' : null;
    return s ? { role: 'wing', side: s } : { role: 'am', side: null };
  }
  if ((team.forwards ?? 1) >= 3) {
    const s = unit <= 3 ? 'R' : unit >= 7 ? 'L' : null;
    if (s) return { role: 'wing', side: s };
  }
  return { role: 'st', side: null };
}

/** Roller för en hel elva (räknar backlinje och anfallsled först). */
export function assignRoles(starters) {
  const lineOf = (p) => Math.floor(Number(p.pid) / 10);
  const team = {
    backLine: starters.filter((p) => lineOf(p) === 3).length,
    forwards: starters.filter((p) => lineOf(p) >= 9).length,
  };
  // Wingbacks i 5x-ledet betyder att 3x-ledet är en trebackslinje
  if (starters.some((p) => lineOf(p) === 5)) team.backLine = Math.min(team.backLine, 3);
  return starters.map((p) => ({ ...p, ...roleOf(p.pid, { x: p.x, y: p.y }, team) }));
}

// ---------- Direkt motståndare ----------

// Vilka roller en spelare möter, i första hand och som reserv
const FACES = {
  wing: [['fb', 'wb'], ['cb']],
  wb: [['wing', 'wb', 'fb'], ['am', 'st']],
  fb: [['wing', 'wb'], ['am', 'st']],
  st: [['cb'], ['fb', 'wb']],
  cb: [['st'], ['am', 'wing']],
  dm: [['am', 'cm', 'dm'], ['st']],
  cm: [['cm', 'dm', 'am'], []],
  am: [['dm', 'cm', 'am'], ['cb']],
  gk: [['gk'], []],
};

/** Avstånd mellan en spelare och en motståndare speglad till samma planhalva (sidled väger 1,5). */
export function mirrorDist(a, b) {
  const dx = (a.x ?? 0.5) - (1 - (b.x ?? 0.5));
  const dy = (a.y ?? 0.5) - (1 - (b.y ?? 0.5));
  return Math.hypot(dx, dy * 1.5);
}

/** Motståndare för varje spelare (närmast först, högst n), id -> [id]. */
export function pairOpponents(home, away, n = 3) {
  const out = {};
  const run = (mine, theirs) => {
    for (const p of mine) {
      const [first, reserve] = FACES[p.role] || [[], []];
      let cands = theirs.filter((o) => first.includes(o.role));
      if (!cands.length) cands = theirs.filter((o) => reserve.includes(o.role));
      if (!cands.length) cands = theirs.filter((o) => o.role !== 'gk');
      out[p.id] = cands.map((o) => ({ o, d: mirrorDist(p, o) })).sort((a, b) => a.d - b.d).slice(0, n).map((x) => x.o.id);
    }
  };
  run(home, away);
  run(away, home);
  return out;
}

// ---------- Jämförelse ----------

// Ytterbacken framåt och yttern hemåt, mittbackens uppspel och anfallarens press, målvaktens fotspel
const FB_ATTACK = [['chances_created', 1.5], ['expected_assists', 1.5], ['crosses_succeeeded', 1], ['touches_opp_box', 1], ['dribbles_succeeded', 0.5]];
const WIDE_DEFEND = [['matchstats.headers.tackles', 1], ['interceptions', 1], ['recoveries', 1], ['duel_won_percent', 1.5], ['defensive_actions', 1]];
const BUILD_UP = [['successful_passes_accuracy', 1.5], ['successful_passes', 1], ['line_breaking_passes', 1.5], ['long_balls_accurate', 1]];
const PRESS = [['poss_won_att_3rd_team_title', 2], ['recoveries', 1], ['defensive_actions', 1], ['duel_won_percent', 1]];
const GK_FEET = [['successful_passes_accuracy', 1], ['long_ball_succeeeded_accuracy', 1], ['keeper_sweeper', 1], ['keeper_high_claim', 1]];

// Rader i jämförelsetabellen per typ av duell
const TABLE = {
  kant: ['dribbles_succeeded', 'won_contest_subtitle', 'chances_created', 'expected_assists', 'crosses_succeeeded', 'touches_opp_box',
    'dribbled_past', 'duel_won_percent', 'matchstats.headers.tackles', 'interceptions', 'recoveries', 'aerials_won_percent'],
  centralt: ['expected_goals', 'goals', 'shots', 'touches_opp_box', 'aerials_won_percent', 'duel_won_percent', 'dribbled_past',
    'interceptions', 'clearances', 'successful_passes_accuracy', 'line_breaking_passes', 'poss_won_att_3rd_team_title'],
  mittfalt: ['successful_passes', 'successful_passes_accuracy', 'line_breaking_passes', 'chances_created', 'expected_assists',
    'dribbles_succeeded', 'duel_won_percent', 'matchstats.headers.tackles', 'interceptions', 'recoveries', 'dribbled_past', 'dispossessed'],
  malvakt: ['save_percentage', 'saves', 'goals_prevented', 'clean_sheet_team_title', 'error_led_to_goal', 'keeper_high_claim',
    'keeper_sweeper', 'successful_passes_accuracy', 'long_ball_succeeeded_accuracy'],
  allman: ['rating', 'expected_goals', 'expected_assists', 'chances_created', 'dribbles_succeeded', 'successful_passes_accuracy',
    'duel_won_percent', 'aerials_won_percent', 'matchstats.headers.tackles', 'interceptions', 'recoveries', 'dribbled_past'],
};

// Lyckade prestationer: [rubrik, antal lyckade, andel lyckade (%)]
export const SUCCESS = [
  ['Lyckade dribblingar', 'dribbles_succeeded', 'won_contest_subtitle'],
  ['Lyckade passningar', 'successful_passes', 'successful_passes_accuracy'],
  ['Linjebrytande passningar', 'line_breaking_passes', null],
  ['Lyckade långbollar', 'long_balls_accurate', 'long_ball_succeeeded_accuracy'],
  ['Lyckade inlägg', 'crosses_succeeeded', 'crosses_succeeeded_accuracy'],
  ['Skapade chanser', 'chances_created', null],
  ['Skapade stora chanser', 'big_chance_created_team_title', null],
  ['Skott på mål', 'ShotsOnTarget', null],
  ['Mål', 'goals', null],
  ['Assist', 'assists', null],
  ['Vunna dueller', 'duel_won', 'duel_won_percent'],
  ['Vunna luftdueller', 'aerials_won', 'aerials_won_percent'],
  ['Tacklingar', 'matchstats.headers.tackles', null],
  ['Brutna passningar', 'interceptions', null],
  ['Återerövringar', 'recoveries', null],
  ['Bollvinster högt upp', 'poss_won_att_3rd_team_title', null],
  ['Rensningar', 'clearances', null],
  ['Vunna frisparkar', 'fouls_won', null],
];
export const SUCCESS_GK = [
  ['Räddningar', 'saves', 'save_percentage'],
  ['Förhindrade mål', 'goals_prevented', null],
  ['Hållna nollor', 'clean_sheet_team_title', null],
  ['Höga ingripanden', 'keeper_high_claim', null],
  ['Utrusningar', 'keeper_sweeper', null],
  ['Lyckade passningar', 'successful_passes', 'successful_passes_accuracy'],
  ['Lyckade långbollar', 'long_balls_accurate', 'long_ball_succeeeded_accuracy'],
];

export const STAT_NAME = {
  dribbles_succeeded: 'Lyckade dribblingar', won_contest_subtitle: 'Dribblingar som lyckas', chances_created: 'Skapade chanser',
  expected_assists: 'xA (förväntade assist)', crosses_succeeeded: 'Lyckade inlägg', touches_opp_box: 'Bollkontakter i motståndarnas straffområde',
  dribbled_past: 'Dribblad förbi (färre = bättre)', duel_won_percent: 'Vunna dueller', 'matchstats.headers.tackles': 'Tacklingar',
  interceptions: 'Brutna passningar', recoveries: 'Återerövringar', aerials_won_percent: 'Vunna luftdueller', expected_goals: 'xG (förväntade mål)',
  goals: 'Mål', shots: 'Skott', clearances: 'Rensningar', successful_passes_accuracy: 'Passningsträff', line_breaking_passes: 'Linjebrytande passningar',
  poss_won_att_3rd_team_title: 'Bollvinster högt upp', successful_passes: 'Lyckade passningar', dispossessed: 'Tappade bollar (färre = bättre)',
  save_percentage: 'Räddningsprocent', saves: 'Räddningar', goals_prevented: 'Förhindrade mål', clean_sheet_team_title: 'Hållna nollor',
  error_led_to_goal: 'Misstag som ledde till mål (färre = bättre)', keeper_high_claim: 'Höga ingripanden', keeper_sweeper: 'Utrusningar',
  long_ball_succeeeded_accuracy: 'Långbollar som når fram', rating: 'FotMob-betyg', assists: 'Assist', duel_won: 'Vunna dueller',
  aerials_won: 'Vunna luftdueller', long_balls_accurate: 'Lyckade långbollar', crosses_succeeeded_accuracy: 'Inlägg som når fram',
  big_chance_created_team_title: 'Skapade stora chanser', ShotsOnTarget: 'Skott på mål', fouls_won: 'Vunna frisparkar', defensive_actions: 'Defensiva aktioner',
};
// Nyckeltal där värdet är en andel i procent (visas "x %", inte per 90)
export const RATE_KEYS = new Set(['won_contest_subtitle', 'duel_won_percent', 'aerials_won_percent', 'successful_passes_accuracy', 'save_percentage',
  'crosses_succeeeded_accuracy', 'long_ball_succeeeded_accuracy', 'rating']);

const ATT_RANK = { st: 5, wing: 4, am: 3, wb: 2.5, cm: 2, fb: 1.5, dm: 1, cb: 0, gk: -1 };
const MIDS = new Set(['dm', 'cm', 'am']);
const WIDE = new Set(['wing', 'wb', 'fb']);

/** Typ av duell för två roller. */
export function duelKind(ra, rb) {
  if (ra === 'gk' || rb === 'gk') return ra === rb ? 'malvakt' : 'allman';
  if (WIDE.has(ra) && WIDE.has(rb)) return 'kant';
  if ((ra === 'cb' && ['st', 'am', 'wing'].includes(rb)) || (rb === 'cb' && ['st', 'am', 'wing'].includes(ra))) return 'centralt';
  if (MIDS.has(ra) && MIDS.has(rb)) return 'mittfalt';
  return 'allman';
}
export const KIND_LABEL = { kant: 'Ytter mot ytterback', centralt: 'Anfall mot mittback', mittfalt: 'Mittfält mot mittfält', malvakt: 'Målvakt mot målvakt', allman: 'Spelare mot spelare' };

const ATTACK_BY_ROLE = { st: ATTACK_CENTRAL, wing: ATTACK_WIDE, am: MID_CREATE, wb: FB_ATTACK, fb: FB_ATTACK, cm: MID_CREATE, dm: MID_CONTROL, cb: BUILD_UP, gk: GK_FEET };
const DEFEND_BY_ROLE = { cb: DEFEND_CENTRAL, fb: DEFEND_WIDE, wb: DEFEND_WIDE, dm: MID_CONTROL, cm: MID_CONTROL, am: PRESS, wing: WIDE_DEFEND, st: PRESS, gk: KEEPER };

/**
 * Aspekter för en duell: [rubrik, metrics för a, metrics för b]. Anfallaren (högst ATT_RANK) är a i första aspekten.
 */
function aspects(kind, A, B) {
  const [att, def] = (ATT_RANK[A.role] ?? 0) >= (ATT_RANK[B.role] ?? 0) ? [A, B] : [B, A];
  const n = (p) => p.short || p.name;
  const dir = (x, y, mx, my, title) => (x === A ? { title, a: mx, b: my } : { title, a: my, b: mx });
  if (kind === 'malvakt') return [{ title: 'Räddningar', a: KEEPER, b: KEEPER }, { title: 'Spelet med fötterna och i luften', a: GK_FEET, b: GK_FEET }];
  if (kind === 'mittfalt') return [{ title: 'Bollkontroll och duellspel', a: MID_CONTROL, b: MID_CONTROL }, { title: 'Kreativitet', a: MID_CREATE, b: MID_CREATE }];
  if (kind === 'kant') {
    return [
      dir(att, def, ATTACK_WIDE, DEFEND_WIDE, `${n(att)} anfaller – ${n(def)} försvarar`),
      dir(def, att, FB_ATTACK, WIDE_DEFEND, `${n(def)} går framåt – ${n(att)} jobbar hem`),
    ];
  }
  if (kind === 'centralt') {
    return [
      dir(att, def, ATTACK_CENTRAL, DEFEND_CENTRAL, `${n(att)} anfaller – ${n(def)} försvarar`),
      dir(def, att, BUILD_UP, PRESS, `${n(def)}s uppspel – ${n(att)}s press`),
    ];
  }
  return [
    dir(att, def, ATTACK_BY_ROLE[att.role] || MID_CREATE, DEFEND_BY_ROLE[def.role] || MID_CONTROL, `${n(att)} anfaller – ${n(def)} försvarar`),
    dir(def, att, ATTACK_BY_ROLE[def.role] || MID_CREATE, DEFEND_BY_ROLE[att.role] || MID_CONTROL, `${n(def)} anfaller – ${n(att)} försvarar`),
  ];
}

const round = (x) => (x == null ? null : Math.round(x));

/** Jämförelse mellan två spelare (a och b = { id, name, short, role, side, rec }). rec = spelarpost eller null. */
export function compare(A, B) {
  const kind = duelKind(A.role, B.role);
  const srcA = A.rec ? statSource(A.rec) : { stats: {}, minutes: 0 };
  const srcB = B.rec ? statSource(B.rec) : { stats: {}, minutes: 0 };
  const list = aspects(kind, A, B).map((x) => {
    const sa = score(srcA, x.a), sb = score(srcB, x.b);
    const diff = sa != null && sb != null ? sa - sb : null;
    const e = edgeText(diff, 'a', 'b');
    const why = [
      ...highlights(srcA, x.a).map((t) => `${A.short || A.name}: ${t}`),
      ...highlights(srcB, x.b).map((t) => `${B.short || B.name}: ${t}`),
      ...highlights(srcA, x.a, { strong: false, n: 1 }).map((t) => `${A.short || A.name}: ${t}`),
      ...highlights(srcB, x.b, { strong: false, n: 1 }).map((t) => `${B.short || B.name}: ${t}`),
    ].slice(0, 4);
    return { title: x.title, a: round(sa), b: round(sb), diff: round(diff), who: e.who, level: e.level, why };
  });
  const known = list.filter((x) => x.diff != null);
  // Första aspekten (anfall mot försvar) väger dubbelt
  const total = known.length ? known.reduce((s, x, i) => s + x.diff * (i === 0 ? 2 : 1), 0) / known.reduce((s, _, i) => s + (i === 0 ? 2 : 1), 0) : null;
  const e = edgeText(total, 'a', 'b');
  return {
    kind, kindLabel: KIND_LABEL[kind], aspects: list, edge: round(total), who: e.who, level: e.level,
    rows: TABLE[kind],
    note: (srcA.minutes || 0) < 300 || (srcB.minutes || 0) < 300 ? 'Lite speltid i underlaget – percentilerna är dragna mot mitten.' : null,
  };
}

// ---------- Spelardata ----------

const ALL_KEYS = new Set([...Object.values(TABLE).flat(), ...SUCCESS.flatMap(([, a, b]) => [a, b]), ...SUCCESS_GK.flatMap(([, a, b]) => [a, b]),
  ...[ATTACK_WIDE, DEFEND_WIDE, ATTACK_CENTRAL, DEFEND_CENTRAL, MID_CONTROL, MID_CREATE, KEEPER, FB_ATTACK, WIDE_DEFEND, BUILD_UP, PRESS, GK_FEET]
    .flat().map(([k]) => k), 'minutes_played', 'matches_uppercase', 'player_started_matches', 'rating', 'goals', 'assists'].filter(Boolean));

const pickStats = (s) => (s ? Object.fromEntries(Object.entries(s).filter(([k]) => ALL_KEYS.has(k))) : {});

/** Spelarpost i data/spelare-format, bantad till det startelvan behöver. */
export function slimRecord(p) {
  const L = p.league || null;
  return {
    id: p.id, name: p.name, fotmobTeam: p.fotmobTeam ?? null,
    position: { fotmob: p.position?.fotmob ?? null, group: p.position?.group ?? null },
    info: { age: p.info?.age ?? null, shirt: p.info?.shirt ?? null, injury: p.info?.injury ?? null, country: p.info?.country ?? null, marketValue: p.info?.marketValue ?? null },
    league: L ? { name: L.name ?? null, season: L.season ?? null, minutes_played: L.minutes_played ?? null, rating: L.rating ?? null, goals: L.goals ?? null, assists: L.assists ?? null } : null,
    season: p.season ? { season: p.season.season, tournament: p.season.tournament, stats: pickStats(p.season.stats) } : null,
    prevSeason: p.prevSeason ? { season: p.prevSeason.season, tournament: p.prevSeason.tournament, stats: pickStats(p.prevSeason.stats) } : null,
    form: p.form ?? null,
    matches: (p.matches || []).slice(0, 5),
    fetchedAt: p.fetchedAt ?? null,
  };
}

/** Spelarpost från FotMobs playerData (för spelare utanför data/spelare). */
export function recordFromPlayerData(d) {
  const info = (key) => d.playerInformation?.find((x) => x.translationKey === key)?.value;
  const main = d.positionDescription?.positions?.find((x) => x.isMainPosition) ?? d.positionDescription?.positions?.[0];
  const t0 = d.statSeasons?.[0]?.tournaments?.[0];
  const recent = d.recentMatches ?? [];
  return slimRecord({
    id: d.id, name: d.name, fotmobTeam: d.primaryTeam?.teamName ?? null,
    position: { fotmob: main?.strPosShort?.label ?? null },
    info: {
      age: info('age_sentencecase')?.numberValue ?? null, shirt: info('shirt')?.numberValue ?? null, country: info('country_sentencecase')?.fallback ?? null,
      marketValue: info('transfer_value')?.numberValue ?? null,
      injury: d.injuryInformation ? { name: d.injuryInformation.name ?? null, expectedReturn: d.injuryInformation.expectedReturn ?? null } : null,
    },
    league: d.mainLeague ? { name: d.mainLeague.leagueName, season: d.mainLeague.season, ...Object.fromEntries((d.mainLeague.stats ?? []).map((s) => [s.localizedTitleId, s.value])) } : null,
    season: d.firstSeasonStats && t0 ? { season: d.statSeasons[0].seasonName, tournament: t0.name, stats: statMap(d.firstSeasonStats) } : null,
    prevSeason: null,
    form: form(recent),
    matches: matchRows(recent, 5),
    fetchedAt: new Date().toISOString(),
  });
}

const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return d; } };

// Alla spelare i data/spelare som id -> bantad post. Byggs om när någon fil ändras. Cupfilerna (CL, EL, ECL) sist,
// så att ligafilen vinner när samma spelare finns i båda.
let INDEX = null;
const CUPS = new Set(['CL', 'EL', 'ECL']);
export function playerIndex() {
  let files = [];
  try {
    files = fs.readdirSync(DIR_PLAYERS).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  } catch { /* ingen spelardata */ }
  files.sort((a, b) => Number(CUPS.has(a.slice(0, -5))) - Number(CUPS.has(b.slice(0, -5))) || a.localeCompare(b));
  const stamp = files.map((f) => `${f}:${fs.statSync(path.join(DIR_PLAYERS, f)).mtimeMs}`).join('|');
  if (INDEX?.stamp === stamp) return INDEX.map;
  const map = new Map();
  for (const f of files) {
    const doc = readJson(path.join(DIR_PLAYERS, f));
    for (const t of Object.values(doc?.teams || {})) {
      for (const p of t.players || []) {
        if (typeof p.id !== 'number' || map.has(String(p.id))) continue;
        map.set(String(p.id), { ...slimRecord(p), file: f.slice(0, -5) });
      }
    }
  }
  INDEX = { stamp, map };
  return map;
}

// ---------- Elvan från FotMob ----------

/** Elvan ur FotMobs matchDetails. null om ingen elva finns. */
export function parseLineup(md) {
  const lu = md?.content?.lineup;
  if (!lu?.homeTeam?.starters?.length || !lu?.awayTeam?.starters?.length) return null;
  const side = (t) => ({
    name: t.name ?? null,
    formation: t.formation ?? null,
    coach: t.coach?.name ?? null,
    starters: t.starters.map((p) => ({
      id: p.id, name: p.name, pid: p.positionId ?? null, shirt: p.shirtNumber != null ? String(p.shirtNumber) : null,
      x: p.horizontalLayout?.x ?? null, y: p.horizontalLayout?.y ?? null, club: p.primaryTeamName ?? null, age: p.age ?? null,
      captain: !!p.isCaptain,
    })),
    unavailable: (t.unavailable || []).map((p) => ({ name: p.name, type: p.unavailability?.type ?? null, expectedReturn: p.unavailability?.expectedReturn ?? null })),
  });
  return {
    lineupType: lu.lineupType ?? null,
    confirmed: !!lu.lineupType && !/last|predict/i.test(lu.lineupType),
    home: side(lu.homeTeam),
    away: side(lu.awayTeam),
  };
}

export function lineupStatusText(lu) {
  if (!lu) return 'Ingen elva än';
  if (lu.confirmed) return 'Officiell startelva';
  if (/predict/i.test(lu.lineupType || '')) return 'Förväntad elva (FotMob)';
  return 'Senaste elvan – ny elva ej släppt';
}

// ---------- Nycklar och matcher ----------

/** Nyckel för en Oddset-match och för en Stryktips-/Europatipsmatch. */
export const tipKey = (t) => [t.league, t.date, t.home, t.away].join('|');
export const svsKey = (product, draw, eventNumber) => ['svs', product, draw, eventNumber].join('|');
/** Grupp (fil i webbversionen) för en nyckel: ligakoden, eller svs-<spel>. */
export const keyGroup = (key) => {
  const parts = String(key).split('|');
  return parts[0] === 'svs' ? `svs-${parts[1]}` : parts[0];
};

export function readStore() {
  const s = readJson(STORE, null);
  return { updatedAt: s?.updatedAt ?? null, matches: s?.matches ?? [], players: s?.players ?? {} };
}

export function findEntry(store, key) {
  return store.matches.find((m) => m.keys?.includes(key)) || null;
}

// ---------- Vy för GUI:t ----------

const shortName = (name) => {
  const parts = String(name || '').trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
};

/** Visningsdata för en match: elvorna på planen, spelarnas statistik, motståndare och jämförelser. */
export function buildView(entry, { index = playerIndex(), extra = {} } = {}) {
  if (!entry) return { ok: false, reason: 'Ingen startelva hämtad för matchen än' };
  const base = {
    key: entry.keys?.[0] ?? null, fotmobMatchId: entry.fotmobMatchId ?? null, league: entry.league ?? null, kickoff: entry.kickoff ?? null,
    home: entry.home, away: entry.away, fetchedAt: entry.fetchedAt ?? null,
  };
  const lu = entry.lineup;
  if (!lu) return { ok: false, ...base, reason: 'FotMob har ingen elva för matchen än – den brukar komma ett par dagar före (förväntad) och en timme före avspark (officiell).' };

  const players = {};
  const team = (t, side) => {
    const xi = assignRoles(t.starters).map((p) => {
      const rec = index.get(String(p.id)) || extra[String(p.id)] || null;
      const src = rec ? statSource(rec) : null;
      const stats = src?.stats || {};
      const tour = rec?.season?.tournament && !src?.label ? `${rec.season.tournament} ${rec.season.season ?? ''}`.trim() : src?.label || null;
      const short = shortName(p.name);
      players[p.id] = {
        id: p.id, name: p.name, short, team: side, role: p.role, side: p.side, roleLabel: roleLabel(p.role, p.side),
        shirt: p.shirt, age: p.age ?? rec?.info?.age ?? null, club: rec?.fotmobTeam || p.club || null, captain: p.captain || false,
        x: p.x, y: p.y,
        statsFrom: tour, minutes: src?.minutes ?? 0,
        rating: stats.rating?.[0] ?? rec?.league?.rating ?? null,
        goals: stats.goals?.[0] ?? null, assists: stats.assists?.[0] ?? null,
        matches: stats.matches_uppercase?.[0] ?? null,
        stats,
        form: rec?.form?.last5 ?? null,
        recent: (rec?.matches || []).slice(0, 5).map((m) => ({ date: m[0], opp: m[2], min: m[4], rating: m[5], goals: m[6], assists: m[7], home: !!m[3] })),
        injury: rec?.info?.injury?.name ?? null,
        noData: !rec,
        _rec: rec,
      };
      return p;
    });
    return {
      name: t.name, formation: t.formation, coach: t.coach, unavailable: t.unavailable || [],
      xi: xi.map((p) => p.id),
    };
  };
  const home = team(lu.home, 'home');
  const away = team(lu.away, 'away');
  const H = home.xi.map((id) => players[id]), A = away.xi.map((id) => players[id]);
  const opponents = pairOpponents(H, A);

  // Jämförelser för alla par som går att klicka fram (huvudmotståndare och alternativ)
  const comparisons = {};
  const pairKey = (a, b) => (players[a].team === 'home' ? `${a}-${b}` : `${b}-${a}`);
  for (const [id, opp] of Object.entries(opponents)) {
    for (const o of opp) {
      const k = pairKey(id, o);
      if (comparisons[k]) continue;
      const [ha, aw] = k.split('-');
      const a = players[ha], b = players[aw];
      comparisons[k] = compare({ ...a, rec: a._rec }, { ...b, rec: b._rec });
    }
  }
  // Nyckeldueller: hemmalagets spelare mot sin första motståndare, sorterade på typ
  const ORDER = ['kant', 'centralt', 'mittfalt', 'malvakt', 'allman'];
  const key = [];
  for (const p of [...H, ...A]) {
    const o = opponents[p.id]?.[0];
    if (!o) continue;
    const k = pairKey(p.id, o);
    if (!key.includes(k)) key.push(k);
  }
  // Varje spelare med i högst en nyckelduell per typ (mittfältarna kan annars dyka upp tre gånger)
  const seen = new Set();
  const keyDuels = key.sort((x, y) => ORDER.indexOf(comparisons[x].kind) - ORDER.indexOf(comparisons[y].kind)).filter((k) => {
    const [a, b] = k.split('-');
    const kind = comparisons[k].kind;
    if (kind === 'allman') return false;
    if (seen.has(`${kind}:${a}`) && seen.has(`${kind}:${b}`)) return false;
    if (kind !== 'centralt' && (seen.has(`${kind}:${a}`) || seen.has(`${kind}:${b}`))) return false;
    seen.add(`${kind}:${a}`);
    seen.add(`${kind}:${b}`);
    return true;
  });
  for (const p of Object.values(players)) delete p._rec;

  return {
    ok: true, ...base,
    lineupType: lu.lineupType, confirmed: lu.confirmed, status: lineupStatusText(lu),
    teams: { home, away },
    players, opponents, comparisons, keyDuels,
    success: SUCCESS, successGk: SUCCESS_GK, statName: STAT_NAME, rateKeys: [...RATE_KEYS],
  };
}

// ---------- Hämtning (nätverk) ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
      if (res.status === 429) await sleep(10000 * (i + 1));
    } catch { /* försök igen */ }
    await sleep(800 * (i + 1));
  }
  return null;
}

/** Hämtar elvan för en match (FotMob-id) och returnerar ett lagringsbart objekt. */
export async function fetchLineup(fotmobMatchId) {
  const md = await getJson(`${FM}/matchDetails?matchId=${fotmobMatchId}`);
  if (!md) return { ok: false, lineup: null };
  return { ok: true, lineup: parseLineup(md), leagueName: md.general?.leagueName ?? null, kickoff: md.general?.matchTimeUTCDate ?? null };
}

/** Hämtar spelare som saknas i data/spelare (eller är äldre än maxAgeD i lagret). Returnerar antal hämtade. */
export async function fetchMissingPlayers(store, ids, { index = playerIndex(), maxAgeD = 3, parallel = 4 } = {}) {
  const age = (iso) => (iso ? (Date.now() - Date.parse(iso)) / 864e5 : Infinity);
  const need = [...new Set(ids.map(String))].filter((id) => !index.has(id) && age(store.players[id]?.fetchedAt) > maxAgeD);
  let n = 0;
  const queue = need.slice();
  await Promise.all(Array.from({ length: parallel }, async () => {
    for (let id = queue.shift(); id; id = queue.shift()) {
      const d = await getJson(`${FM}/playerData?id=${id}`);
      await sleep(120);
      if (d?.id) {
        store.players[id] = recordFromPlayerData(d);
        n++;
      }
    }
  }));
  return n;
}

// ---------- Uppdatering av lagret ----------

const HOUR = 3600e3;

/**
 * Kommande matcher: Oddset-tipsen inom `days` dagar och alla matcher i Stryktipsets/Europatipsets aktuella kuponger.
 * [{ key, league, kickoff, home, away, homeCountry, awayCountry, fotmobMatchId }]
 */
export function collectMatches({ days = 4, now = Date.now() } = {}) {
  const out = [];
  const tips = readJson(path.join(ROOT, 'data', 'tips-latest.json'), {});
  const until = now + days * 864e5;
  // FotMob-namnet från ligatabellen (Atl. Tucuman -> Atlético Tucumán) gör sökningen säkrare
  const tables = new Map();
  const fmName = (league, team) => {
    if (!tables.has(league)) tables.set(league, readJson(path.join(ROOT, 'data', 'ligor', `${league}.json`), {})?.table || []);
    return tables.get(league).find((r) => r.team === team)?.fotmobName || null;
  };
  for (const t of tips.allCandidates || []) {
    const ko = t.kickoffUtc ? Date.parse(t.kickoffUtc) : Date.parse(`${t.date}T12:00:00Z`);
    if (!Number.isFinite(ko) || ko < now - 3 * HOUR || ko > until) continue;
    if (/finish|ft|played/i.test(String(t.matchStatus || ''))) continue;
    out.push({ key: tipKey(t), league: t.league, kickoff: t.kickoffUtc || null, date: t.date, home: t.home, away: t.away,
      searchHome: fmName(t.league, t.home), searchAway: fmName(t.league, t.away) });
  }
  const st = readJson(path.join(ROOT, 'data', 'stryktipset.json'), {});
  for (const p of st.products || []) {
    for (const e of p.events || []) {
      const ko = Date.parse(e.kickoff);
      if (Number.isFinite(ko) && ko < now - 3 * HOUR) continue;
      out.push({
        key: svsKey(p.product, p.drawNumber, e.eventNumber), league: e.league, kickoff: e.kickoff, home: e.home, away: e.away,
        homeCountry: e.country || null, awayCountry: e.country || null, fotmobMatchId: e.context?.fotmobMatchId ?? null,
      });
    }
  }
  return out;
}

/**
 * Hämtar elvor för matcherna (FotMob) och spelare som saknas. Bekräftade elvor hämtas inte om; övriga om de är
 * äldre än `refreshMin` minuter. Matcher som spelats för mer än ett dygn sedan tas bort.
 */
export async function updateStore(matches, { store = readStore(), refreshMin = 30, force = false, log = () => {}, findMatch } = {}) {
  const now = Date.now();
  store.matches = store.matches.filter((m) => !m.kickoff || Date.parse(m.kickoff) > now - 24 * HOUR);
  let found = 0, lineups = 0, missing = 0;
  for (const m of matches) {
    let entry = findEntry(store, m.key);
    let id = m.fotmobMatchId ?? entry?.fotmobMatchId ?? null;
    if (!id && findMatch) {
      const at = { kickoff: m.kickoff || `${m.date}T12:00:00Z`, homeCountry: m.homeCountry, awayCountry: m.awayCountry };
      const tol = m.kickoff ? 2 : 14;
      let hit = m.searchHome && m.searchAway ? await findMatch({ ...at, home: m.searchHome, away: m.searchAway }, tol) : null;
      if (!hit) hit = await findMatch({ ...at, home: m.home, away: m.away }, tol);
      id = hit?.id ?? null;
    }
    if (!id) {
      missing++;
      log(`  saknas på FotMob: ${m.home} – ${m.away} (${m.league})`);
      continue;
    }
    found++;
    // Samma FotMob-match kan finnas både som Oddset-tips och på en kupong
    const same = store.matches.find((x) => String(x.fotmobMatchId) === String(id));
    if (same && same !== entry) {
      if (entry) store.matches = store.matches.filter((x) => x !== entry);
      entry = same;
    }
    if (!entry) {
      entry = { fotmobMatchId: id, keys: [], league: m.league, kickoff: m.kickoff, home: m.home, away: m.away, lineup: null, fetchedAt: null };
      store.matches.push(entry);
    }
    entry.fotmobMatchId = id;
    if (!entry.keys.includes(m.key)) entry.keys.push(m.key);
    const fresh = entry.fetchedAt && now - Date.parse(entry.fetchedAt) < refreshMin * 60e3;
    if (!force && (entry.lineup?.confirmed || fresh)) continue;
    const r = await fetchLineup(id);
    if (!r.ok) continue;
    entry.lineup = r.lineup;
    entry.kickoff = entry.kickoff || r.kickoff;
    entry.fotmobLeague = r.leagueName;
    entry.fetchedAt = new Date().toISOString();
    if (r.lineup) lineups++;
    await sleep(150);
  }
  const ids = store.matches.flatMap(lineupIds);
  const fetchedPlayers = await fetchMissingPlayers(store, ids);
  return { store, found, lineups, missing, fetchedPlayers };
}

/** Lineup-id:n i lagret som används (spelare i elvorna). */
export const lineupIds = (m) => (m.lineup ? [...m.lineup.home.starters, ...m.lineup.away.starters].map((p) => p.id) : []);

export function writeStore(store) {
  // Spelare som inte längre står i någon elva tas bort
  const used = new Set(store.matches.flatMap(lineupIds).map(String));
  const players = Object.fromEntries(Object.entries(store.players).filter(([id]) => used.has(id)));
  fs.writeFileSync(STORE, JSON.stringify({ updatedAt: new Date().toISOString(), matches: store.matches, players }), 'utf8');
}
