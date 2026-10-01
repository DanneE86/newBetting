// Duellanalys per match: förväntad (eller officiell) elva för båda lagen, ytter mot ytterback, anfallare mot
// mittbackar, mittfält mot mittfält och målvakt mot målvakt. Bygger på FotMob-statistiken i data/spelare/<liga>.json
// (scripts/fetch-player-stats-fotmob.mjs). Percentilerna är FotMobs, per 90 och mot spelare på samma position,
// och "högre = bättre" även för negativa tal (dribblad förbi, regelbrott, insläppta mål).
//
// Förväntad elva: minuter i lagets senaste 5 matcher (alla turneringar), säsongsminuter som utslagsfråga.
// Skadade spelare och spelare utan klubb tas bort. Officiell elva (data/open/espn_lineups.json, lineupStatus
// "confirmed") används så snart den finns.
//
// Duellerna ändrar inte tipsmotorn. Tipset här är marknadens/modellens sannolikheter (pro.blended), lätt
// justerade med duellernas sammanlagda fördel, och värdeomdömet är pro-lagrets (pro.verdicts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAT_LABELS } from './player-positions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const fileCache = new Map();
function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  const mtime = fs.statSync(p).mtimeMs;
  const hit = fileCache.get(rel);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
  fileCache.set(rel, { mtime, value });
  return value;
}

export const normName = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/gi, 'o').replace(/æ/gi, 'ae').replace(/ß/g, 'ss')
    .replace(/ł/gi, 'l').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();

// ---------- Statistik ----------

/** Säsongen med flest minuter av innevarande och förra (nyförvärv och spelare med lite speltid i år). */
function statSource(p) {
  const cur = p.season?.stats, prev = p.prevSeason?.stats;
  // Målvakter saknar minutes_played i säsongsstatistiken: ligans minuter eller matcher × 90
  const mins = (s, isCur) => s?.minutes_played?.[0]
    ?? (isCur && p.league?.season === p.season?.season ? p.league?.minutes_played : null)
    ?? (s?.player_started_matches?.[0] ?? s?.matches_uppercase?.[0] ?? 0) * 90;
  const curMin = mins(cur, true), prevMin = mins(prev, false);
  if (cur && (curMin >= 450 || curMin >= prevMin)) return { stats: cur, minutes: curMin, label: null };
  if (prev && prevMin > 0) return { stats: prev, minutes: prevMin, label: `${p.prevSeason.tournament ?? ''} ${p.prevSeason.season ?? ''}`.trim() };
  return { stats: cur || {}, minutes: curMin, label: null };
}

/** Percentil krympt mot 50 vid lite speltid (900 min = full vikt). */
function pct(src, key) {
  const v = src.stats?.[key];
  if (!v || v[2] == null) return null;
  const w = Math.min(1, (src.minutes || 0) / 900);
  return 50 + (v[2] - 50) * w;
}

/** Viktat snitt av percentiler; null om inget av nyckeltalen finns. */
function score(src, metrics) {
  let s = 0, w = 0;
  for (const [k, wt] of metrics) {
    const x = pct(src, k);
    if (x == null) continue;
    s += x * wt;
    w += wt;
  }
  return w ? s / w : null;
}

const ATTACK_WIDE = [['dribbles_succeeded', 1.5], ['won_contest_subtitle', 1], ['chances_created', 1.5], ['expected_assists', 1],
  ['expected_goals', 1], ['touches_opp_box', 1], ['crosses_succeeeded', 0.5]];
const DEFEND_WIDE = [['dribbled_past', 2], ['duel_won_percent', 2], ['matchstats.headers.tackles', 1], ['interceptions', 1],
  ['recoveries', 0.5], ['expected_goals_against_while_on_pitch', 0.5]];
const ATTACK_CENTRAL = [['expected_goals', 3], ['goals', 1], ['shots', 1], ['touches_opp_box', 1],
  ['aerials_won_percent', 0.5], ['chances_created', 0.5]];
const DEFEND_CENTRAL = [['duel_won_percent', 2], ['aerials_won_percent', 1.5], ['interceptions', 1], ['clearances', 0.5],
  ['dribbled_past', 1], ['expected_goals_against_while_on_pitch', 1.5]];
const MID_CONTROL = [['successful_passes_accuracy', 1], ['successful_passes', 1], ['recoveries', 1], ['interceptions', 1],
  ['matchstats.headers.tackles', 1], ['duel_won_percent', 1.5]];
const MID_CREATE = [['chances_created', 1.5], ['expected_assists', 1.5], ['big_chance_created_team_title', 1], ['expected_goals', 1]];
const KEEPER = [['goals_prevented', 2], ['save_percentage', 2], ['error_led_to_goal', 0.5]];

// Tal som visas som "x %" och tal där percentilen är bra trots högt värde ska läsas omvänt i texten
const PERCENT_KEYS = new Set(['won_contest_subtitle', 'duel_won_percent', 'aerials_won_percent', 'successful_passes_accuracy',
  'save_percentage', 'crosses_succeeeded_accuracy', 'long_ball_succeeeded_accuracy']);
const NEGATIVE_KEYS = new Set(['dribbled_past', 'goals_conceded_while_on_pitch', 'expected_goals_against_while_on_pitch',
  'error_led_to_goal', 'fouls', 'dispossessed']);
const SHORT_LABEL = {
  dribbles_succeeded: 'lyckade dribblingar', won_contest_subtitle: 'vunna dribblingar', chances_created: 'skapade chanser',
  expected_assists: 'xA', expected_goals: 'xG', non_penalty_xg: 'xG utan straff', goals: 'mål', shots: 'skott',
  touches_opp_box: 'bollkontakter i straffområdet', crosses_succeeeded: 'lyckade inlägg', dribbled_past: 'dribblad förbi',
  duel_won_percent: 'vunna dueller', aerials_won_percent: 'vunna luftdueller', 'matchstats.headers.tackles': 'tacklingar',
  interceptions: 'brutna passningar', recoveries: 'återerövringar', clearances: 'rensningar',
  expected_goals_against_while_on_pitch: 'xG emot på planen', successful_passes_accuracy: 'passningsträff',
  successful_passes: 'lyckade passningar', big_chance_created_team_title: 'skapade stora chanser', goals_prevented: 'förhindrade mål',
  save_percentage: 'räddningsprocent', error_led_to_goal: 'misstag som ledde till mål',
  defensive_actions: 'defensiva aktioner', poss_won_att_3rd_team_title: 'bollvinster högt upp', line_breaking_passes: 'linjebrytande passningar',
  long_balls_accurate: 'lyckade långbollar', long_ball_succeeeded_accuracy: 'långbollar som når fram', keeper_sweeper: 'utrusningar',
  keeper_high_claim: 'höga ingripanden',
};

export const ordinal = (n) => {
  const r = Math.round(n);
  const last = r % 10, last2 = r % 100;
  return `${r}:${(last === 1 || last === 2) && last2 !== 11 && last2 !== 12 ? 'a' : 'e'}`;
};

function fmtVal(key, v) {
  if (v == null) return '';
  if (PERCENT_KEYS.has(key)) return `${String(Math.round(v * 10) / 10).replace('.', ',')} %`;
  if (key === 'goals_prevented') return `${v > 0 ? '+' : ''}${String(Math.round(v * 100) / 100).replace('.', ',')}`;
  if (!Number.isInteger(v)) return String(Math.round(v * 100) / 100).replace('.', ',');
  return String(v);
}

/** Text för ett nyckeltal: "51 lyckade dribblingar (62:a perc.)" / "dribblad förbi 20 ggr (4:e perc.)". */
function statText(src, key) {
  const v = src.stats?.[key];
  if (!v || v[2] == null) return null;
  const label = SHORT_LABEL[key] || STAT_LABELS[key] || key;
  const val = fmtVal(key, v[0]);
  const body = key === 'dribbled_past' ? `dribblad förbi ${val} ggr`
    : PERCENT_KEYS.has(key) ? `${val} ${label}`
      : key === 'goals_prevented' ? `${val} förhindrade mål`
        : key === 'expected_goals_against_while_on_pitch' ? `${val} xG emot på planen`
          : `${val} ${label}`;
  return { key, text: `${body} (${ordinal(v[2])} perc.)`, pct: v[2] };
}

/** De tydligaste styrkorna (perc >= 70) eller svagheterna (perc <= 30) bland nyckeltalen. */
function highlights(src, metrics, { strong = true, n = 2 } = {}) {
  if ((src.minutes || 0) < 300) return [];
  const list = metrics.map(([k]) => statText(src, k)).filter(Boolean);
  const picked = strong
    ? list.filter((x) => x.pct >= 70).sort((a, b) => b.pct - a.pct)
    : list.filter((x) => x.pct <= 30).sort((a, b) => a.pct - b.pct);
  return picked.slice(0, n).map((x) => x.text);
}

// ---------- Positioner och sidor ----------

const SIDE_OF = { RB: 'R', RWB: 'R', RW: 'R', RM: 'R', LB: 'L', LWB: 'L', LW: 'L', LM: 'L' };

/** Spelarens sida (L/R) från FotMobs huvudposition, annars den mest spelade sidopositionen. */
function sideOf(p) {
  const main = String(p.position?.fotmob || '').toUpperCase();
  if (SIDE_OF[main]) return SIDE_OF[main];
  let best = null, bestN = 0;
  for (const o of p.position?.fotmobOther || []) {
    const [pos, n] = String(o).split(':');
    const s = SIDE_OF[String(pos).toUpperCase()];
    if (s && Number(n) > bestN) { best = s; bestN = Number(n); }
  }
  return best;
}

/** Position från elvans källa (ESPN: LB, CD-L, AM, F …). Allmänna D/M/F ger bara grov grupp. */
function lineupPosition(abbr) {
  const a = String(abbr || '').toUpperCase();
  if (!a || /^\d+$/.test(a)) return null;
  const side = /(^L|-L$)/.test(a) ? 'L' : /(^R|-R$)/.test(a) ? 'R' : null;
  if (/^G/.test(a)) return { group: 'malvakt', side: null, exact: true };
  if (/WB|^LB|^RB/.test(a)) return { group: 'ytterback', side, exact: true };
  if (/^CD(?!M)|^CB|^SW/.test(a)) return { group: 'mittback', side: null, exact: true };
  if (/^DM|^CDM/.test(a)) return { group: 'defensiv_mittfaltare', side: null, exact: true };
  if (/^AM|^CAM/.test(a)) return { group: side ? 'ytter' : 'offensiv_mittfaltare', side, exact: true };
  if (/^LW|^RW|^LM|^RM/.test(a)) return { group: 'ytter', side, exact: true };
  if (/^CM/.test(a)) return { group: 'central_mittfaltare', side: null, exact: true };
  if (/^CF|^ST|^SS/.test(a)) return { group: 'anfallare', side: null, exact: true };
  if (a === 'D') return { group: 'mittback', side: null, exact: false };
  if (a === 'M') return { group: 'central_mittfaltare', side: null, exact: false };
  if (a === 'F') return { group: 'anfallare', side: null, exact: false };
  return null;
}

// ---------- Elvor ----------

/** Lagets senaste matchdatum (alla turneringar) från spelarnas matchlistor. */
function teamRecentDates(players, n = 5) {
  const names = new Map();
  for (const p of players) if (p.fotmobTeam) names.set(p.fotmobTeam, (names.get(p.fotmobTeam) || 0) + 1);
  const teamName = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const dates = new Set();
  for (const p of players) for (const m of p.matches || []) if (m[1] === teamName && m[4] > 0) dates.add(m[0]);
  return { teamName, dates: [...dates].sort().reverse().slice(0, n) };
}

function availability(p, matchDate) {
  const inj = p.info?.injury;
  if (p.info?.status === 'unattached') return { out: true, why: 'utan klubb' };
  if (inj) {
    const ret = inj.expectedReturn?.expectedReturnFallback || inj.expectedReturn?.expectedReturnDateParam || 'okänd återkomst';
    return { out: true, why: `${inj.name || 'skada'} (${ret})` };
  }
  return { out: false };
}

/** Lätt spelarobjekt för analysen. */
function slim(p, extra = {}) {
  const src = statSource(p);
  const L = p.league || {};
  return {
    id: p.id ?? null,
    name: p.name,
    group: p.position?.group ?? null,
    pos: p.position?.fotmob ?? null,
    side: sideOf(p),
    age: p.info?.age ?? null,
    shirt: p.info?.shirt ?? null,
    club: p.fotmobTeam ?? null,
    seasonLabel: p.season?.tournament ? `${p.season.tournament} ${p.season.season ?? ''}`.trim() : null,
    rating: L.rating ?? src.stats?.rating?.[0] ?? null,
    goals: L.goals ?? src.stats?.goals?.[0] ?? null,
    assists: L.assists ?? src.stats?.assists?.[0] ?? null,
    minutes: src.minutes,
    statsFrom: src.label,
    _src: src,
    ...extra,
  };
}

/** Förväntad elva: GK med mest minuter + de tio utespelarna med mest minuter i de senaste fem matcherna. */
function predictedXI(team, matchDate) {
  const players = team.players || [];
  const { teamName, dates } = teamRecentDates(players);
  const dateSet = new Set(dates);
  const lastDate = dates[0];
  const out = [], notes = [];
  const cands = [];
  for (const p of players) {
    if (!p.position?.group) continue;
    const av = availability(p, matchDate);
    const recent = (p.matches || []).filter((m) => m[1] === teamName && dateSet.has(m[0]));
    const recentMin = recent.reduce((a, m) => a + (m[4] || 0), 0);
    const seasonMin = p.league?.minutes_played ?? p.season?.stats?.minutes_played?.[0] ?? 0;
    if (av.out) {
      if (recentMin > 0 || seasonMin >= 450) out.push({ name: p.name, group: p.position.group, why: av.why });
      continue;
    }
    const redLast = (p.matches || []).find((m) => m[1] === teamName && m[0] === lastDate && m[9] > 0);
    if (redLast) notes.push(`${p.name} fick rött kort i senaste matchen (${lastDate}) – kan vara avstängd`);
    cands.push({ p, rank: recentMin + seasonMin * 0.05 });
  }
  cands.sort((a, b) => b.rank - a.rank);
  const gk = cands.find((c) => c.p.position.group === 'malvakt');
  const outfield = cands.filter((c) => c.p.position.group !== 'malvakt');
  if (!gk || !outfield.some((c) => c.rank > 0)) return { xi: [], out, notes, bench: [], recentDates: dates, noMinutes: true };

  // Platser per position: snittet av hur många som spelade minst 46 min per match (alla spelare, även nu skadade),
  // fördelat på exakt tio platser (största rest). Rotation på en position ger då inte tre mittbackar i en fyrbackslinje.
  const perDate = dates.map((d) => {
    const n = {};
    for (const p of players) {
      if (!p.position?.group || p.position.group === 'malvakt') continue;
      if ((p.matches || []).some((m) => m[1] === teamName && m[0] === d && m[4] >= 46)) n[p.position.group] = (n[p.position.group] || 0) + 1;
    }
    return n;
  }).filter((n) => Object.values(n).reduce((a, b) => a + b, 0) >= 7);
  const groups = GROUP_ORDER.slice(1);
  const mean = Object.fromEntries(groups.map((g) => [g, perDate.length ? perDate.reduce((a, n) => a + (n[g] || 0), 0) / perDate.length : 0]));
  const total = Object.values(mean).reduce((a, b) => a + b, 0);
  // Utan matchdata: 4-2-3-1 som mall
  const target = total > 0
    ? Object.fromEntries(groups.map((g) => [g, (mean[g] * 10) / total]))
    : { mittback: 2, ytterback: 2, defensiv_mittfaltare: 1, central_mittfaltare: 1, offensiv_mittfaltare: 1, ytter: 2, anfallare: 1 };
  const caps = Object.fromEntries(groups.map((g) => [g, Math.floor(target[g] || 0)]));
  const byRest = groups.slice().sort((a, b) => ((target[b] || 0) % 1) - ((target[a] || 0) % 1));
  for (let i = 0, left = 10 - Object.values(caps).reduce((a, b) => a + b, 0); left > 0 && i < byRest.length; i++, left--) caps[byRest[i]]++;
  // Minst tre och högst fem försvarare
  const nDef = () => caps.mittback + caps.ytterback;
  while (nDef() < 3) {
    caps.mittback++;
    const from = ['central_mittfaltare', 'offensiv_mittfaltare', 'anfallare', 'ytter', 'defensiv_mittfaltare'].find((g) => caps[g] > 0);
    if (!from) break;
    caps[from]--;
  }
  while (nDef() > 5) {
    caps[caps.ytterback > 2 ? 'ytterback' : 'mittback']--;
    caps.central_mittfaltare++;
  }

  let field = [];
  for (const g of groups) field.push(...outfield.filter((c) => c.p.position.group === g).slice(0, caps[g]));
  // Platser som inte kunde fyllas (för få spelare på positionen): bästa övriga utespelare
  for (const c of outfield) if (field.length < 10 && !field.includes(c)) field.push(c);
  field = field.slice(0, 10);
  const xi = [gk, ...field].filter(Boolean).map((c) => slim(c.p, { recentMin: Math.round(c.rank) }));
  // Nästa på tur (bänk): de fem utespelarna efter elvan
  const bench = cands.filter((c) => c !== gk && !field.includes(c) && c.p.position.group !== 'malvakt').slice(0, 5).map((c) => c.p.name);
  return { xi, out, notes, bench, recentDates: dates };
}

function findPlayer(players, name) {
  const n = normName(name);
  if (!n) return null;
  const exact = players.find((p) => normName(p.name) === n);
  if (exact) return exact;
  const parts = n.split(' ');
  const last = parts[parts.length - 1];
  const sameLast = players.filter((p) => normName(p.name).split(' ').pop() === last);
  if (sameLast.length === 1) return sameLast[0];
  const withInitial = sameLast.filter((p) => normName(p.name)[0] === n[0]);
  if (withInitial.length === 1) return withInitial[0];
  return players.find((p) => normName(p.name).includes(n) || n.includes(normName(p.name))) || null;
}

/** Officiell elva från elv-cachen, matchad mot spelardatan. */
function officialXI(team, starters) {
  const xi = [], unknown = [];
  for (const s of starters) {
    const p = findPlayer(team.players || [], s.name);
    const lp = lineupPosition(s.position);
    if (p) {
      const x = slim(p);
      if (lp?.exact) {
        x.group = lp.group;
        if (lp.side) x.side = lp.side;
      }
      x.lineupPos = s.position || null;
      xi.push(x);
    } else {
      unknown.push(s.name);
      xi.push({ name: s.name, group: lp?.group ?? null, side: lp?.side ?? null, pos: s.position ?? null, minutes: 0,
        _src: { stats: {}, minutes: 0 }, notInData: true });
    }
  }
  return { xi, unknown };
}

function lineupFor(league, date, home, away) {
  const doc = readJson('data/open/espn_lineups.json');
  const day = (d) => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00Z`).getTime() : NaN);
  const want = day(date);
  return (doc?.fixtures || []).find((f) => f.league === league && f.home === home && f.away === away
    && (!date || Math.abs(day(f.date) - want) <= 2 * 864e5)) || null;
}

// ---------- Uppställning i roller ----------

const GROUP_ORDER = ['malvakt', 'mittback', 'ytterback', 'defensiv_mittfaltare', 'central_mittfaltare', 'offensiv_mittfaltare', 'ytter', 'anfallare'];

/** Fördelar elvan på roller: målvakt, mittbackar, vänster/höger ytterback, mittfält, vänster/höger kant, anfall. */
function shape(xi) {
  const by = (g) => xi.filter((p) => p.group === g);
  const gk = by('malvakt')[0] || null;
  const cbs = by('mittback');
  const fbs = by('ytterback');
  const wings = by('ytter');
  const strikers = by('anfallare');
  const mids = [...by('defensiv_mittfaltare'), ...by('central_mittfaltare'), ...by('offensiv_mittfaltare')];

  const pickSide = (list, side) => {
    const own = list.filter((p) => p.side === side);
    if (own.length) return own[0];
    const free = list.filter((p) => !p.side);
    return free[0] || null;
  };
  let rb = pickSide(fbs, 'R');
  let lb = pickSide(fbs.filter((p) => p !== rb), 'L');
  if (!lb && fbs.length > 1) lb = fbs.find((p) => p !== rb) || null;

  let rw = pickSide(wings, 'R');
  let lw = pickSide(wings.filter((p) => p !== rw), 'L');
  if (!lw && wings.length > 1) lw = wings.find((p) => p !== rw) || null;
  const extraWings = wings.filter((p) => p !== rw && p !== lw);

  // Utan ytter på en kant: en ytterback/wingback (vid tre mittbackar) eller en offensiv mittfältare tar kanten
  const usedMid = new Set();
  const fillWide = (side) => {
    if (cbs.length >= 3) {
      const fb = side === 'R' ? rb : lb;
      if (fb) return { ...fb, wingback: true };
    }
    const am = mids.find((p) => !usedMid.has(p) && p.group === 'offensiv_mittfaltare' && (p.side === side || !p.side))
      || mids.find((p) => !usedMid.has(p) && p.side === side);
    if (am) { usedMid.add(am); return am; }
    return null;
  };
  if (!rw) rw = fillWide('R');
  if (!lw) lw = fillWide('L');

  // Utan ytterback på en kant: mittbacken längst ut (eller kantspelaren vid trebackslinje)
  const rbDef = rb || (cbs.length >= 3 ? cbs[cbs.length - 1] : null) || cbs[0] || null;
  const lbDef = lb || (cbs.length >= 3 ? cbs[0] : null) || cbs[1] || cbs[0] || null;

  let attack = strikers.slice();
  if (!attack.length) {
    const am = mids.find((p) => !usedMid.has(p) && p.group === 'offensiv_mittfaltare') || extraWings[0];
    if (am) { attack = [am]; usedMid.add(am); }
  }
  // Ytterbackar utöver två (utan trebackslinje) spelar i praktiken högre upp
  const extraFbs = cbs.length >= 3 ? [] : fbs.filter((p) => p !== rb && p !== lb);
  const midfield = [...mids.filter((p) => !usedMid.has(p) && !attack.includes(p)), ...extraWings.filter((p) => !attack.includes(p)), ...extraFbs];

  // Formation i fyra led: backlinje – centrala mittfältare (+ wingbacks) – offensiva mittfältare/kanter – anfall
  const n = (g) => xi.filter((p) => p.group === g).length;
  const back = cbs.length >= 3 ? cbs.length : cbs.length + Math.min(fbs.length, 2);
  const midLine = n('defensiv_mittfaltare') + n('central_mittfaltare') + (cbs.length >= 3 ? fbs.length : 0);
  const attMid = n('offensiv_mittfaltare') + n('ytter') + extraFbs.length;
  const formation = xi.length === 11 ? [back, midLine, attMid, n('anfallare')].filter((x, i) => i === 0 || x > 0).join('-') : null;

  return { gk, cbs, rb: rbDef, lb: lbDef, rbIsFullback: !!rb, lbIsFullback: !!lb, rw, lw, attack, midfield, formation };
}

// ---------- Dueller ----------

const pub = (p) => (p ? Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith('_'))) : null);

function avgScore(players, metrics) {
  const s = players.map((p) => score(p._src, metrics)).filter((x) => x != null);
  return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
}

/** Fördel i en duell: positiv = första sidan. */
function edgeText(diff, aTeam, bTeam) {
  if (diff == null) return { who: null, level: 'okänt', text: 'För lite data' };
  const a = Math.abs(diff);
  const who = diff > 0 ? aTeam : bTeam;
  if (a < 7) return { who: null, level: 'jämnt', text: 'Jämnt' };
  if (a < 15) return { who, level: 'lite', text: `${who}, lite` };
  if (a < 25) return { who, level: 'tydlig', text: who };
  return { who, level: 'klart', text: `${who}, klart` };
}

function nameList(players) {
  return players.map((p) => p.name).join(' / ');
}

function wideDuel(att, def, attTeam, defTeam, sideTxt, defIsFullback) {
  if (!att || !def) return null;
  const a = score(att._src, ATTACK_WIDE), d = score(def._src, DEFEND_WIDE);
  const diff = a != null && d != null ? a - d : null;
  const e = edgeText(diff, attTeam, defTeam);
  const why = [
    ...highlights(att._src, ATTACK_WIDE).map((t) => `${att.name}: ${t}`),
    ...highlights(def._src, DEFEND_WIDE, { strong: false }).map((t) => `${def.name}: ${t}`),
    ...highlights(def._src, DEFEND_WIDE).map((t) => `${def.name}: ${t}`),
    ...highlights(att._src, ATTACK_WIDE, { strong: false, n: 1 }).map((t) => `${att.name}: ${t}`),
  ].slice(0, 4);
  // Ytterbacken framåt: farlig offensiv ytterback mot kantspelare som inte jobbar hem
  const fbAtt = score(def._src, [['chances_created', 1], ['expected_assists', 1], ['touches_opp_box', 1], ['crosses_succeeeded', 1]]);
  if (defIsFullback && fbAtt != null && fbAtt >= 75 && (def._src.minutes || 0) >= 450) why.push(`${def.name} är farlig framåt – ytan bakom hen kan öppnas`);
  return {
    kind: 'kant', label: `${attTeam} ${sideTxt} kant`, attack: { team: attTeam, players: [pub(att)], score: a }, defend: { team: defTeam, players: [pub(def)], score: d },
    title: `${att.name} – ${def.name}${defIsFullback ? '' : ' (mittback täcker kanten)'}`, diff, edge: e, why,
  };
}

function centralDuel(atts, defs, attTeam, defTeam) {
  if (!atts.length || !defs.length) return null;
  const a = avgScore(atts, ATTACK_CENTRAL), d = avgScore(defs, DEFEND_CENTRAL);
  const diff = a != null && d != null ? a - d : null;
  const why = [
    ...atts.flatMap((p) => highlights(p._src, ATTACK_CENTRAL).map((t) => `${p.name}: ${t}`)).slice(0, 2),
    ...defs.flatMap((p) => highlights(p._src, DEFEND_CENTRAL).map((t) => `${p.name}: ${t}`)).slice(0, 2),
    ...defs.flatMap((p) => highlights(p._src, DEFEND_CENTRAL, { strong: false, n: 1 }).map((t) => `${p.name}: ${t}`)).slice(0, 1),
  ];
  const air = avgScore(atts, [['aerials_won_percent', 1]]), defAir = avgScore(defs, [['aerials_won_percent', 1]]);
  if (air != null && defAir != null && defAir - air >= 35) why.push(`Luftspelet är ${defTeam}s – ${attTeam} behöver bollar längs marken`);
  return {
    kind: 'centralt', label: `${attTeam} anfall`, attack: { team: attTeam, players: atts.map(pub), score: a }, defend: { team: defTeam, players: defs.map(pub), score: d },
    title: `${nameList(atts)} – ${nameList(defs)}`, diff, edge: edgeText(diff, attTeam, defTeam), why,
  };
}

function midfieldDuel(hm, am, home, away) {
  if (!hm.length || !am.length) return null;
  const hc = avgScore(hm, MID_CONTROL), ac = avgScore(am, MID_CONTROL);
  const hk = avgScore(hm, MID_CREATE), ak = avgScore(am, MID_CREATE);
  const hs = hc != null && hk != null ? (hc + hk) / 2 : hc ?? hk;
  const as = ac != null && ak != null ? (ac + ak) / 2 : ac ?? ak;
  const diff = hs != null && as != null ? hs - as : null;
  // Bästa enskilda mittfältare per lag
  const best = (list) => list.map((p) => ({ p, s: ((score(p._src, MID_CONTROL) ?? 50) + (score(p._src, MID_CREATE) ?? 50)) / 2 }))
    .filter((x) => (x.p._src.minutes || 0) >= 450).sort((a, b) => b.s - a.s)[0];
  const why = [];
  const bh = best(hm), ba = best(am);
  for (const [b, team] of [[bh, home], [ba, away]]) {
    if (!b) continue;
    const hl = highlights(b.p._src, [...MID_CREATE, ...MID_CONTROL]);
    if (hl.length) why.push(`${b.p.name} (${team}): ${hl.join(', ')}`);
  }
  if (hc != null && ac != null && Math.abs(hc - ac) >= 10) why.push(`Bollkontroll/duellspel: ${hc > ac ? home : away} starkare`);
  if (hk != null && ak != null && Math.abs(hk - ak) >= 10) why.push(`Kreativitet: ${hk > ak ? home : away} skapar mer`);
  for (const [list, team] of [[hm, home], [am, away]]) {
    for (const p of list) {
      const weak = highlights(p._src, [['dribbled_past', 1]], { strong: false, n: 1 });
      if (weak.length && (p._src.minutes || 0) >= 600) why.push(`${p.name} (${team}): ${weak[0]} – går att pressa`);
    }
  }
  return {
    kind: 'mittfalt', label: 'Mittfält', attack: { team: home, players: hm.map(pub), score: hs }, defend: { team: away, players: am.map(pub), score: as },
    title: `${nameList(hm)} – ${nameList(am)}`, diff, edge: edgeText(diff, home, away), why: why.slice(0, 5),
  };
}

function keeperDuel(hg, ag, home, away) {
  if (!hg || !ag) return null;
  const h = score(hg._src, KEEPER), a = score(ag._src, KEEPER);
  const diff = h != null && a != null ? h - a : null;
  const line = (p) => ['save_percentage', 'goals_prevented'].map((k) => statText(p._src, k)?.text).filter(Boolean).join(', ');
  return {
    kind: 'malvakt', label: 'Målvakt', attack: { team: home, players: [pub(hg)], score: h }, defend: { team: away, players: [pub(ag)], score: a },
    title: `${hg.name} – ${ag.name}`, diff, edge: edgeText(diff, home, away),
    why: [hg, ag].map((p) => (line(p) ? `${p.name}: ${line(p)}` : null)).filter(Boolean),
  };
}

// ---------- Tips ----------

function poisson(k, l) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-l) * l ** k) / f;
}

function scoreMatrix(lh, la, max = 7) {
  const m = [];
  for (let h = 0; h <= max; h++) for (let a = 0; a <= max; a++) m.push({ h, a, p: poisson(h, lh) * poisson(a, la) });
  return m;
}

const outcome = (h, a) => (h > a ? 'home' : h < a ? 'away' : 'draw');

function oneXtwo(m) {
  const r = { home: 0, draw: 0, away: 0 };
  for (const c of m) r[outcome(c.h, c.a)] += c.p;
  return r;
}

/**
 * Tips: modellens/marknadens sannolikheter (pro.blended) justerade med duellernas sammanlagda fördel.
 * Fördelen (-100..100) flyttar målförväntan högst ±12 %. Resultat = vanligaste resultatet som stämmer med tipset.
 */
function verdictFor(tip, edge) {
  const base = tip.pro?.blended || tip.tips?.['1X2']?.probs || null;
  let lh = tip.pro?.dc?.lambdaHome, la = tip.pro?.dc?.lambdaAway;
  if (!(lh > 0 && la > 0)) {
    const total = tip.tips?.OU25?.expGoals || 2.6;
    const ph = base?.home ?? 0.45, pa = base?.away ?? 0.3;
    lh = total * (0.5 + (ph - pa) / 2);
    la = total - lh;
  }
  const k = Math.max(-0.12, Math.min(0.12, (edge / 100) * 0.4));
  const adjH = lh * Math.exp(k), adjA = la * Math.exp(-k);
  const before = oneXtwo(scoreMatrix(lh, la)), mAdj = scoreMatrix(adjH, adjA), after = oneXtwo(mAdj);
  let probs = after;
  if (base?.home != null) {
    const raw = Object.fromEntries(['home', 'draw', 'away'].map((x) => [x, base[x] * (after[x] / before[x])]));
    const s = raw.home + raw.draw + raw.away;
    probs = Object.fromEntries(Object.entries(raw).map(([x, v]) => [x, v / s]));
  }
  const pick = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
  const pYes = mAdj.filter((c) => c.h > 0 && c.a > 0).reduce((a, c) => a + c.p, 0);
  // Resultatet ska stämma med både 1X2-tipset och båda-gör-mål
  const sc = mAdj.filter((c) => outcome(c.h, c.a) === pick && (c.h > 0 && c.a > 0) === (pYes >= 0.5)).sort((a, b) => b.p - a.p)[0]
    || mAdj.filter((c) => outcome(c.h, c.a) === pick).sort((a, b) => b.p - a.p)[0];
  const pOver = mAdj.filter((c) => c.h + c.a > 2).reduce((a, c) => a + c.p, 0);
  const v = tip.pro?.verdicts?.[pick] || null;
  return {
    pick: { home: '1', draw: 'X', away: '2' }[pick],
    pickKey: pick,
    probs: Object.fromEntries(Object.entries(probs).map(([x, p]) => [x, Math.round(p * 1000) / 1000])),
    baseProbs: base ? { home: base.home, draw: base.draw, away: base.away } : null,
    score: sc ? `${sc.h}–${sc.a}` : null,
    btts: pYes >= 0.5 ? 'JA' : 'NEJ',
    pBtts: Math.round(pYes * 1000) / 1000,
    over25: pOver >= 0.5 ? 'ÖVER' : 'UNDER',
    pOver25: Math.round(pOver * 1000) / 1000,
    expGoals: { home: Math.round(adjH * 100) / 100, away: Math.round(adjA * 100) / 100 },
    value: v ? { odds: v.odds, bookmaker: v.bookmaker, minOdds: v.minOdds, value: v.value, ev: v.ev } : null,
    otherValue: Object.entries(tip.pro?.verdicts || {}).filter(([kk, x]) => kk !== pick && x?.value)
      .map(([kk, x]) => ({ market: kk, pick: x.pick, odds: x.odds, bookmaker: x.bookmaker })),
  };
}

// ---------- Huvudfunktion ----------

function lineupInfo(tip, team, side, fixture) {
  const starters = fixture?.[`${side}Starters`] || [];
  if (fixture?.lineupStatus === 'confirmed' && starters.length >= 11) {
    const { xi, unknown } = officialXI(team, starters);
    const pred = predictedXI(team, tip.date);
    return { status: 'officiell', source: fixture.source || null, formationSource: fixture[`${side}Formation`] || null, xi, unknown, out: pred.out, notes: [], bench: [] };
  }
  const pred = predictedXI(team, tip.date);
  return { status: 'förväntad', source: 'minuter i de senaste 5 matcherna', formationSource: null, xi: pred.xi, unknown: [], out: pred.out, notes: pred.notes, bench: pred.bench, recentDates: pred.recentDates };
}

/** Duellanalys för en match i tips-latest. Returnerar { ok:false, reason } om spelardata saknas. */
export function buildMatchup(tip) {
  const { league, home, away } = tip;
  const doc = readJson(`data/spelare/${league}.json`);
  if (!doc) return { ok: false, reason: `Ingen spelardata för ligan (${league})` };
  const H = doc.teams?.[home], A = doc.teams?.[away];
  const missing = [!H && home, !A && away].filter(Boolean);
  if (missing.length) return { ok: false, reason: `Ingen spelardata för ${missing.join(' och ')}` };

  const fixture = lineupFor(league, tip.date, home, away);
  const hl = lineupInfo(tip, H, 'home', fixture);
  const al = lineupInfo(tip, A, 'away', fixture);
  if (hl.xi.length < 11 || al.xi.length < 11) {
    const short = [hl.xi.length < 11 && home, al.xi.length < 11 && away].filter(Boolean);
    return { ok: false, reason: `För lite speldata för att sätta en elva (${short.join(', ')})` };
  }
  const hs = shape(hl.xi), as = shape(al.xi);

  const duels = {
    flanks: [
      wideDuel(hs.rw, as.lb, home, away, 'höger', as.lbIsFullback),
      wideDuel(hs.lw, as.rb, home, away, 'vänster', as.rbIsFullback),
      wideDuel(as.rw, hs.lb, away, home, 'höger', hs.lbIsFullback),
      wideDuel(as.lw, hs.rb, away, home, 'vänster', hs.rbIsFullback),
    ].filter(Boolean),
    // Hemmalagets anfall möter bortalagets mittbackar och tvärtom
    central: [centralDuel(hs.attack, as.cbs, home, away), centralDuel(as.attack, hs.cbs, away, home)].filter(Boolean),
    midfield: midfieldDuel(hs.midfield, as.midfield, home, away),
    keeper: keeperDuel(hs.gk, as.gk, home, away),
  };

  // Sammanlagd fördel för hemmalaget (-100..100): kanter 1, centralt 1,2, mittfält 1,5, målvakt 1
  let sum = 0, w = 0;
  const add = (d, weight, sign) => {
    if (d?.diff == null) return;
    sum += d.diff * weight * sign;
    w += weight;
  };
  for (const d of duels.flanks) add(d, 1, d.attack.team === home ? 1 : -1);
  for (const d of duels.central) add(d, 1.2, d.attack.team === home ? 1 : -1);
  add(duels.midfield, 1.5, 1);
  add(duels.keeper, 1, 1);
  const edge = w ? Math.round((sum / w) * 10) / 10 : 0;

  const all = [...duels.flanks, ...duels.central, duels.midfield, duels.keeper].filter(Boolean);
  const strengths = (team) => all.filter((d) => d.edge.who === team && d.edge.level !== 'lite').map((d) => `${d.label === 'Mittfält' || d.label === 'Målvakt' ? d.label.toLowerCase() : d.title}`);
  const verdict = verdictFor(tip, edge);

  const sideTeam = (l, s) => ({
    status: l.status, source: l.source, formation: l.formationSource || s.formation,
    // stats = hela säsongens statistik [total, per 90, percentil] för spelarkortet (spindel och alla stats i GUI:t)
    xi: l.xi.map((p) => ({ name: p.name, group: p.group, side: p.side ?? null, minutes: p.minutes ?? 0, goals: p.goals ?? null, assists: p.assists ?? null,
      rating: p.rating ?? null, age: p.age ?? null, club: p.club ?? null, statsFrom: p.statsFrom ?? p.seasonLabel ?? null, stats: p._src?.stats || {},
      ...(p.notInData ? { notInData: true } : {}) })),
    unknown: l.unknown, out: l.out, notes: l.notes, bench: l.bench,
    roles: {
      gk: s.gk?.name ?? null, cbs: s.cbs.map((p) => p.name), rb: s.rb?.name ?? null, lb: s.lb?.name ?? null,
      mid: s.midfield.map((p) => p.name), rw: s.rw?.name ?? null, lw: s.lw?.name ?? null, attack: s.attack.map((p) => p.name),
    },
  });

  // Tabellplacering och lagnamn som FotMob skriver dem (Djurgården i stället för Djurgarden)
  const table = readJson(`data/ligor/${league}.json`)?.table || [];
  const row = (team) => {
    const r = table.find((x) => x.team === team);
    return r ? { rank: r.rank, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost, goals: r.goals, pts: r.pts, group: r.group || null } : null;
  };
  const display = (team) => table.find((x) => x.team === team)?.fotmobName || team;

  const names = { home: display(home), away: display(away) };
  const swap = (str, from, to) => (from === to ? str : str.split(from).join(to));
  const rename = (str) => swap(swap(str, home, names.home), away, names.away);

  return {
    ok: true,
    league, date: tip.date, kickoffUtc: tip.kickoffUtc || null, home, away,
    playerDataAt: doc.updatedAt || null,
    statLabels: STAT_LABELS,
    lineupsUpdatedAt: readJson('data/open/espn_lineups.json')?.updatedAt || null,
    names,
    table: { home: row(home), away: row(away), size: table.length || null },
    teams: { home: sideTeam(hl, hs), away: sideTeam(al, as) },
    // Texterna med FotMobs lagnamn (Djurgården), lagnycklarna (edge.who, attack.team) behålls
    duels: {
      flanks: duels.flanks.map((d) => strip(d, rename)), central: duels.central.map((d) => strip(d, rename)),
      midfield: strip(duels.midfield, rename), keeper: strip(duels.keeper, rename),
    },
    edge,
    edgeTeam: Math.abs(edge) < 4 ? null : edge > 0 ? home : away,
    strengths: { home: strengths(home), away: strengths(away) },
    verdict,
  };
}

function strip(d, rename = (s) => s) {
  if (!d) return null;
  const r = (x) => (x == null ? null : Math.round(x));
  return { ...d, label: rename(d.label), why: d.why.map(rename), diff: r(d.diff),
    attack: { team: d.attack.team, score: r(d.attack.score) }, defend: { team: d.defend.team, score: r(d.defend.score) } };
}

// Interna delar för enhetstesterna (tests/lib-units.spec.ts)
// Används av scripts/lib/startelva.mjs (spelare mot spelare i startelvan)
export { statSource, score, edgeText, statText, highlights, fmtVal, PERCENT_KEYS, SHORT_LABEL,
  ATTACK_WIDE, DEFEND_WIDE, ATTACK_CENTRAL, DEFEND_CENTRAL, MID_CONTROL, MID_CREATE, KEEPER };
export const _internal = { statSource, pct, score, sideOf, lineupPosition, predictedXI, findPlayer, officialXI, shape, edgeText, verdictFor, fmtVal };
