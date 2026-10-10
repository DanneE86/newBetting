// Matchstatistik per match (lag + spelare) från ESPN:s matchsammanfattning och 365scores, i ett gemensamt format.
// Hämtas av scripts/fetch-matchstats.mjs till data/matchstats/<LIGA>/<år>.json och läses av export-league-matches
// (data/matcher/<liga>.csv). Ren logik utan nätverk, så att den kan testas.

// Lagstatistik: kort nyckel -> ESPN-namn / 365scores-namn
export const TEAM_STATS = {
  poss: ['possessionPct', 'Possession'],
  sh: ['totalShots', 'Total Shots'],
  sot: ['shotsOnTarget', 'Shots On Target'],
  blk: ['blockedShots', 'Shots Blocked'],
  cor: ['wonCorners', 'Corners'],
  fou: ['foulsCommitted', 'Fouls'],
  yc: ['yellowCards', 'Yellow Cards'],
  rc: ['redCards', 'Red Cards'],
  off: ['offsides', 'Offsides'],
  sav: ['saves', 'Goalkeeper Saves'],
  pas: ['totalPasses', null],
  pasok: ['accuratePasses', null],
  cro: ['totalCrosses', null],
  crook: ['accurateCrosses', null],
  lb: ['totalLongBalls', null],
  lbok: ['accurateLongBalls', null],
  tkl: ['totalTackles', null],
  tklok: ['effectiveTackles', null],
  int: ['interceptions', null],
  clr: ['totalClearance', null],
  pkg: ['penaltyKickGoals', null],
  pks: ['penaltyKickShots', null],
  att: [null, 'Attacks'],
  bigch: [null, 'Big Chances Created'],
  wood: [null, 'Hit Woodwork'],
  fk: [null, 'Free Kicks'],
  thr: [null, 'Throw-Ins'],
  gk: [null, 'Goal Kicks'],
};

// Spelare per match sparas som arrayer i den här ordningen (sparar plats): se README i data/matchstats
export const PLAYER_COLS = ['id', 'name', 'side', 'pos', 'start', 'in', 'out', 'min', 'g', 'a', 'og', 'sh', 'sot', 'sav', 'shf', 'gc', 'fc', 'fs', 'yc', 'rc', 'off'];

const num = (v) => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
// "90'+7'" -> 90, "45'" -> 45
const minute = (s) => { const n = parseInt(String(s ?? ''), 10); return Number.isFinite(n) ? Math.min(n, 90) : null; };

// Statistik är "tom" när ESPN bara har nollor (äldre säsonger i vissa ligor): då räknas den som saknad
function hasRealStats(t) {
  return t && ['sh', 'pas', 'poss', 'fou', 'cor'].some((k) => Number.isFinite(t[k]) && t[k] > 0);
}

/** ESPN-sammanfattning (…/summary?event=) -> gemensamt matchformat, eller null om matchen inte är färdigspelad. */
export function parseEspnSummary(j) {
  const comp = j?.header?.competitions?.[0];
  if (!comp?.status?.type?.completed) return null;
  const side = (ha) => comp.competitors.find((c) => c.homeAway === ha);
  const H = side('home'), A = side('away');
  if (!H || !A) return null;
  const teamId = { [H.id]: 'h', [A.id]: 'a' };
  const out = {
    src: 'espn', id: String(j.header.id ?? comp.id), d: String(comp.date ?? '').slice(0, 10), k: comp.date ?? null,
    h: H.team?.displayName, a: A.team?.displayName, hid: String(H.id), aid: String(A.id), hg: num(H.score), ag: num(A.score),
    ht: null, ref: null, venue: j.gameInfo?.venue?.fullName ?? null, att: num(j.gameInfo?.attendance) || null,
    form: [null, null], t: { h: null, a: null }, ev: null, p: [],
  };
  const l0 = [H.linescores?.[0]?.displayValue, A.linescores?.[0]?.displayValue].map(num);
  if (l0.every(Number.isFinite)) out.ht = l0;
  const ref = (j.gameInfo?.officials ?? []).find((o) => !o.position || /referee/i.test(o.position?.name ?? o.position?.displayName ?? ''));
  out.ref = ref?.displayName || ref?.fullName || null;

  // Lagstatistik
  for (const t of j.boxscore?.teams ?? []) {
    const s = teamId[String(t.team?.id)] ?? (t.homeAway === 'home' ? 'h' : t.homeAway === 'away' ? 'a' : null);
    if (!s) continue;
    const by = new Map((t.statistics ?? []).map((x) => [x.name, x.displayValue ?? x.value]));
    const row = {};
    for (const [k, [e]] of Object.entries(TEAM_STATS)) if (e && by.has(e)) row[k] = num(by.get(e));
    out.t[s] = hasRealStats(row) ? row : null;
  }

  // Händelser: mål och kort per halvlek (finns även för äldre säsonger utan lagstatistik)
  const ke = j.keyEvents ?? [];
  if (ke.length) {
    const ev = { yc: [0, 0], rc: [0, 0], g1: [0, 0] };
    const sideOf = (e) => (e.team?.id ? teamId[String(e.team.id)] : null) ?? (e.team?.displayName === out.h ? 'h' : e.team?.displayName === out.a ? 'a' : null);
    for (const e of ke) {
      const s = sideOf(e);
      if (!s) continue;
      const i = s === 'h' ? 0 : 1;
      const ty = e.type?.type;
      if (ty === 'yellow-card') ev.yc[i]++;
      else if (ty === 'red-card') ev.rc[i]++;
      else if ((ty === 'goal' || ty === 'own-goal' || e.scoringPlay) && e.period?.number === 1) {
        // Självmål räknas för laget ESPN anger (ESPN sätter laget som fick målet)
        ev.g1[i]++;
      }
    }
    out.ev = ev;
    if (!out.ht) out.ht = ev.g1;
  }

  // Spelare
  for (const r of j.rosters ?? []) {
    const s = r.homeAway === 'home' ? 'h' : r.homeAway === 'away' ? 'a' : teamId[String(r.team?.id)];
    if (!s) continue;
    out.form[s === 'h' ? 0 : 1] = r.formation ?? null;
    for (const p of r.roster ?? []) {
      const st = new Map((p.stats ?? []).map((x) => [x.name, num(x.value)]));
      const appeared = p.starter || p.subbedIn || (st.get('appearances') ?? 0) > 0;
      if (!appeared) continue; // oanvända avbytare
      const subMin = minute((p.plays ?? []).find((x) => x.substitution)?.clock?.displayValue);
      const redMin = minute((p.plays ?? []).find((x) => x.redCard)?.clock?.displayValue);
      let min = null;
      if (p.starter) min = p.subbedOut && subMin != null ? subMin : 90;
      else if (p.subbedIn && subMin != null) min = Math.max(1, 90 - subMin);
      if (min != null && redMin != null) min = Math.min(min, p.starter ? redMin : redMin - (subMin ?? 0));
      const v = (k) => (st.has(k) ? st.get(k) : null);
      out.p.push([
        String(p.athlete?.id ?? ''), p.athlete?.displayName ?? '', s, p.position?.abbreviation ?? null,
        p.starter ? 1 : 0, p.subbedIn ? 1 : 0, p.subbedOut ? 1 : 0, min,
        v('totalGoals'), v('goalAssists'), v('ownGoals'), v('totalShots'), v('shotsOnTarget'), v('saves'), v('shotsFaced'),
        v('goalsConceded'), v('foulsCommitted'), v('foulsSuffered'), v('yellowCards'), v('redCards'), v('offsides'),
      ]);
    }
  }
  return out;
}

/**
 * 365scores: matchdetalj (/web/game/) + statistik (/web/game/stats/) -> gemensamt matchformat.
 * Lagstatistiken har inte passningar; spelarna har minuter, mål, assist, räddningar och insläppta.
 */
export function parse365(game, stats) {
  if (!game || game.statusGroup !== 4) return null; // 4 = slutspelad
  const H = game.homeCompetitor, A = game.awayCompetitor;
  const sideOf = (cid) => (cid === H.id ? 'h' : cid === A.id ? 'a' : null);
  const out = {
    src: '365', id: String(game.id), d: String(game.startTime ?? '').slice(0, 10), k: game.startTime ?? null,
    h: H.name, a: A.name, hid: String(H.id), aid: String(A.id), hg: num(H.score), ag: num(A.score),
    ht: null, ref: game.officials?.[0]?.name ?? null, venue: game.venue?.name ?? null, att: num(game.venue?.attendance) || null,
    form: [H.lineups?.formation ?? null, A.lineups?.formation ?? null], t: { h: null, a: null }, ev: null, p: [],
  };
  const htStage = (game.stages ?? []).find((s) => s.id === 7 || s.shortName === 'HT');
  if (htStage && Number.isFinite(htStage.homeCompetitorScore)) out.ht = [htStage.homeCompetitorScore, htStage.awayCompetitorScore];

  if (stats?.statistics?.length) {
    const row = { h: {}, a: {} };
    const by365 = Object.fromEntries(Object.entries(TEAM_STATS).filter(([, [, n]]) => n).map(([k, [, n]]) => [n, k]));
    for (const s of stats.statistics) {
      const k = by365[s.name], sd = sideOf(s.competitorId);
      if (k && sd) row[sd][k] = num(s.value);
    }
    out.t.h = hasRealStats(row.h) ? row.h : null;
    out.t.a = hasRealStats(row.a) ? row.a : null;
  }

  const ev = { yc: [0, 0], rc: [0, 0], g1: [0, 0] };
  const goals = new Map(), assists = new Map(), yel = new Map(), red = new Map(), og = new Map();
  const inc = (m, k) => k != null && m.set(k, (m.get(k) ?? 0) + 1);
  for (const e of game.events ?? []) {
    const sd = sideOf(e.competitorId);
    if (!sd) continue;
    const i = sd === 'h' ? 0 : 1;
    const name = String(e.eventType?.name ?? '').toLowerCase();
    if (name.includes('red')) { ev.rc[i]++; inc(red, e.playerId); } else if (name.includes('yellow')) { ev.yc[i]++; inc(yel, e.playerId); } else if (e.eventType?.id === 1 || name === 'goal') {
      if ((e.gameTime ?? 99) <= 45 && e.stageId !== 8) ev.g1[i]++;
      if (/own/.test(name) || e.eventType?.subTypeId === 3) inc(og, e.playerId); else inc(goals, e.playerId);
      for (const x of e.extraPlayers ?? []) inc(assists, x);
    }
  }
  out.ev = ev;
  if (!out.ht) out.ht = ev.g1;

  const members = new Map((game.members ?? []).map((m) => [m.id, m]));
  for (const [s, C] of [['h', H], ['a', A]]) {
    for (const m of C.lineups?.members ?? []) {
      const info = members.get(m.id) ?? {};
      const started = m.status === 1;
      const subIn = m.status === 2 && !!m.substitution;
      if (!started && !subIn) continue;
      const st = new Map((m.stats ?? []).map((x) => [x.type, num(x.value)]));
      const pid = m.id;
      const outSub = started && (game.events ?? []).some((e) => e.eventType?.id === 1000 && e.extraPlayers?.includes(pid));
      out.p.push([
        String(info.athleteId > 0 ? info.athleteId : pid), info.name ?? '', s, m.position?.name ?? null,
        started ? 1 : 0, subIn ? 1 : 0, outSub ? 1 : 0, st.get(30) ?? null,
        st.get(27) ?? goals.get(pid) ?? 0, st.get(26) ?? assists.get(pid) ?? 0, og.get(pid) ?? 0, null, null,
        st.get(23) ?? null, null, st.get(35) ?? null, null, null, yel.get(pid) ?? 0, red.get(pid) ?? 0, null,
      ]);
    }
  }
  return out;
}

// ---------- Koppling till data/matcher-raderna ----------

/**
 * Hittar statistikmatchen för en rad (datum, hemma, borta, mål) bland kandidaterna.
 * Krav: datum ±1 dag, samma resultat när båda har det, och båda lagnamnen liknar (score(a, b) 0–1).
 * Tvetydigt (två lika bra) -> null.
 */
export function findStatMatch(row, cands, score, min = 0.5) {
  const t = Date.parse(row.date);
  let best = null, bestS = 0, tie = false;
  for (const c of cands) {
    if (Math.abs(Date.parse(c.d) - t) > 864e5) continue;
    const hg = Number(row.hg), ag = Number(row.ag);
    if (row.hg !== '' && row.hg != null && Number.isFinite(hg) && Number.isFinite(c.hg) && (hg !== c.hg || ag !== c.ag)) continue;
    const sh = score(row.home, c.h), sa = score(row.away, c.a);
    if (sh < min || sa < min) continue;
    const s = sh + sa + (c.d === row.date ? 0.01 : 0);
    if (s > bestS) { best = c; bestS = s; tie = false; } else if (s === bestS) tie = true;
  }
  return tie ? null : best;
}

// Nya kolumner i data/matcher/<liga>.csv från matchstatistiken
export const STAT_COLS = [
  'poss_h', 'poss_a', 'pas_h', 'pas_a', 'pasok_h', 'pasok_a', 'off_h', 'off_a', 'sav_h', 'sav_a',
  'blk_h', 'blk_a', 'tkl_h', 'tkl_a', 'int_h', 'int_a', 'cro_h', 'cro_a', 'att_h', 'att_a', 'bigch_h', 'bigch_a',
  'htg_h', 'htg_a', 'form_h', 'form_a', 'venue', 'att', 'stats_src',
];

const fin = (x) => (Number.isFinite(x) ? x : null);
const blank = (v) => v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v));

/**
 * Fyller raden (på plats) med statistik ur m: befintliga värden (football-data/betting-store) skrivs aldrig över,
 * nya kolumner (STAT_COLS) sätts. Kort från händelser används bara när lagstatistik saknas.
 */
export function applyStats(r, m) {
  if (!m) return r;
  const th = m.t?.h, ta = m.t?.a;
  const fill = (ch, ca, k) => {
    if (blank(r[ch]) && fin(th?.[k]) != null) r[ch] = th[k];
    if (blank(r[ca]) && fin(ta?.[k]) != null) r[ca] = ta[k];
  };
  fill('hs', 'as', 'sh');
  fill('hst', 'ast', 'sot');
  fill('hc', 'ac', 'cor');
  fill('hf', 'af', 'fou');
  fill('hy', 'ay', 'yc');
  fill('hr', 'ar', 'rc');
  // Kort ur händelserna när lagstatistiken saknas (äldre säsonger)
  if (m.ev && !th && !ta) {
    if (blank(r.hy) && blank(r.ay)) { r.hy = m.ev.yc[0]; r.ay = m.ev.yc[1]; }
    if (blank(r.hr) && blank(r.ar)) { r.hr = m.ev.rc[0]; r.ar = m.ev.rc[1]; }
  }
  if (blank(r.referee) && m.ref) r.referee = m.ref;
  if (blank(r.kickoff) && m.k) r.kickoff = m.k;
  for (const k of ['poss', 'pas', 'pasok', 'off', 'sav', 'blk', 'tkl', 'int', 'cro', 'att', 'bigch']) {
    r[`${k}_h`] = fin(th?.[k]); r[`${k}_a`] = fin(ta?.[k]);
  }
  if (m.ht) { r.htg_h = m.ht[0]; r.htg_a = m.ht[1]; }
  r.form_h = m.form?.[0] ?? null; r.form_a = m.form?.[1] ?? null;
  r.venue = m.venue ?? null; r.att = m.att ?? null;
  r.stats_src = m.src;
  return r;
}

/** Säsongssumma per spelare ur matcherna (spelare som spelat), sorterad på minuter. */
export function seasonPlayers(matches) {
  const by = new Map();
  for (const m of matches) {
    for (const p of m.p ?? []) {
      const o = Object.fromEntries(PLAYER_COLS.map((c, i) => [c, p[i]]));
      const team = o.side === 'h' ? m.h : m.a;
      const k = `${o.id || o.name}|${team}`;
      const s = by.get(k) ?? { id: o.id, name: o.name, team, pos: o.pos, apps: 0, starts: 0, subIns: 0, min: 0, g: 0, a: 0, og: 0, sh: 0, sot: 0, sav: 0, gc: 0, fc: 0, fs: 0, yc: 0, rc: 0, off: 0 };
      s.apps++; s.starts += o.start ? 1 : 0; s.subIns += o.in ? 1 : 0; s.min += o.min ?? 0;
      for (const c of ['g', 'a', 'og', 'sh', 'sot', 'sav', 'gc', 'fc', 'fs', 'yc', 'rc', 'off']) s[c] += o[c] ?? 0;
      if (o.pos) s.pos = o.pos;
      by.set(k, s);
    }
  }
  return [...by.values()].sort((x, y) => y.min - x.min || y.apps - x.apps);
}
