// Domarsviter per lag: hur laget har gatt i sina senaste matcher med en viss domare.
// Flagga (anvandarens regel 2026-10-01): minst 5 raka segrar eller minst 5 raka forluster med domaren.
// Historik: football-data.co.uk (PL, Championship, League One, League Two, kolumnen Referee, ligamatcher).
// Domarnamn: football-data skriver "A Taylor", FotMob "Anthony Taylor" -> nyckel = initial + efternamn.
import { nameScore } from './match-context.mjs';

export const MIN_STREAK = 5;
// football-data-divisioner med domare (E3 = League Two: lag som flyttats upp har sin historik dar)
export const REF_DIVISIONS = { E0: 'PL', E1: 'CH', E2: 'EL1', E3: 'EL2' };
export const REF_LEAGUES = new Set(Object.values(REF_DIVISIONS));

const plain = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// "Anthony Taylor" / "A Taylor" / "A. Taylor" -> "a taylor"; "Jamie O'Connor" -> "j oconnor"; "J jBrooks" -> "j brooks"
export function refKey(name) {
  const t = plain(String(name || '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')).replace(/['’.-]/g, '').split(/[^a-z]+/).filter(Boolean);
  if (!t.length) return '';
  if (t.length === 1) return t[0];
  return `${t[0][0]} ${t[t.length - 1]}`;
}

// dd/mm/yy eller dd/mm/yyyy -> yyyy-mm-dd
function fdDate(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const DISC_COLS = [['HY', 'hy'], ['AY', 'ay'], ['HR', 'hr'], ['AR', 'ar'], ['HF', 'hf'], ['AF', 'af']];

// football-data-CSV -> [{ d, lg, h, a, hg, ag, r, hy, ay, hr, ar, hf, af }] (bara spelade matcher med domare).
// Kort/frisparkar (HY/AY/HR/AR/HF/AF) tas med nar kolumnen finns och ar ifylld, annars saknas falten.
export function parseRefereeCsv(text, league) {
  const lines = String(text || '').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const head = lines[0].split(',').map((h) => h.trim());
  const ix = (n) => head.indexOf(n);
  const [iD, iH, iA, iHG, iAG, iR] = [ix('Date'), ix('HomeTeam'), ix('AwayTeam'), ix('FTHG'), ix('FTAG'), ix('Referee')];
  if ([iD, iH, iA, iHG, iAG, iR].some((i) => i < 0)) return [];
  const out = [];
  for (const line of lines.slice(1)) {
    const c = line.split(',');
    const d = fdDate(c[iD]);
    const hg = Number(c[iHG]), ag = Number(c[iAG]);
    const r = String(c[iR] || '').trim();
    if (!d || !r || c[iHG] === '' || c[iAG] === '' || !Number.isFinite(hg) || !Number.isFinite(ag)) continue;
    const row = { d, lg: league, h: c[iH].trim(), a: c[iA].trim(), hg, ag, r };
    for (const [col, k] of DISC_COLS) {
      const i = ix(col);
      const v = i >= 0 && c[i] !== '' ? Number(c[i]) : NaN;
      if (Number.isFinite(v)) row[k] = v;
    }
    out.push(row);
  }
  return out;
}

// Sla ihop historik (aldre sasonger) och betting-store (aktuell sasong) utan dubbletter. Store-matcher har
// { date, league, home, away, hg, ag, referee }.
export function mergeRefereeMatches(history, storeMatches = []) {
  const map = new Map();
  const add = (m) => { if (m?.r && m.d) map.set(`${m.d}|${m.h}|${m.a}`, m); };
  for (const m of history || []) add(m);
  for (const m of storeMatches || []) {
    if (!REF_LEAGUES.has(m.league) || !m.referee || !Number.isFinite(m.hg) || !Number.isFinite(m.ag)) continue;
    const x = m.discipline || {};
    const row = { d: m.date, lg: m.league, h: m.home, a: m.away, hg: m.hg, ag: m.ag, r: m.referee };
    for (const [k, v] of [['hy', x.homeYellow], ['ay', x.awayYellow], ['hr', x.homeRed], ['ar', x.awayRed], ['hf', x.homeFouls], ['af', x.awayFouls]]) {
      if (Number.isFinite(v)) row[k] = v;
    }
    add(row);
  }
  return [...map.values()].sort((x, y) => x.d.localeCompare(y.d));
}

// Index: "lag|domarnyckel" -> matcher (aldst forst) ur lagets perspektiv
export function buildRefIndex(matches) {
  const byPair = new Map();
  const teams = new Set();
  for (const m of matches || []) {
    const k = refKey(m.r);
    if (!k) continue;
    for (const [team, opp, gf, ga, home, yc] of [[m.h, m.a, m.hg, m.ag, true, m.hy], [m.a, m.h, m.ag, m.hg, false, m.ay]]) {
      teams.add(team);
      const key = `${team}|${k}`;
      if (!byPair.has(key)) byPair.set(key, []);
      byPair.get(key).push({ date: m.d, league: m.lg, opp, home, gf, ga, res: gf > ga ? 'W' : gf < ga ? 'L' : 'D', referee: m.r, yc: Number.isFinite(yc) ? yc : null });
    }
  }
  for (const list of byPair.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return { byPair, teams: [...teams] };
}

// Pagaende svit fran senaste matchen bakat: { res: 'W'|'L'|'D', n }
export function currentStreak(list) {
  if (!list?.length) return null;
  const res = list[list.length - 1].res;
  let n = 0;
  for (let i = list.length - 1; i >= 0 && list[i].res === res; i--) n++;
  return { res, n };
}

// Lagnamn fran Svenska Spel/FotMob -> namnet i historiken (exakt, annars basta nameScore >= 0,8)
export function resolveTeam(name, teams) {
  if (!name) return null;
  if (teams.includes(name)) return name;
  let best = null;
  for (const t of teams) {
    const s = nameScore(name, null, t);
    if (s >= 0.8 && (!best || s > best.s)) best = { t, s };
  }
  return best?.t || null;
}

function sideFlag(index, team, rk) {
  const list = index.byPair.get(`${team}|${rk}`) || [];
  const streak = currentStreak(list);
  const record = { w: 0, d: 0, l: 0 };
  for (const m of list) record[m.res === 'W' ? 'w' : m.res === 'D' ? 'd' : 'l']++;
  const yl = list.filter((m) => m.yc != null);
  const flag = streak && streak.n >= MIN_STREAK && streak.res !== 'D' ? (streak.res === 'W' ? 'wins' : 'losses') : null;
  return {
    team, matches: list.length, record, streak, flag,
    // Gula kort laget sjalvt har fatt per match med domaren
    yellowPg: yl.length ? round(yl.reduce((x, m) => x + m.yc, 0) / yl.length, 2) : null,
    last: list.slice(-Math.max(MIN_STREAK, streak?.n || 0)).reverse()
      .map((m) => ({ date: m.date, opp: m.opp, home: m.home, score: `${m.gf}-${m.ga}`, res: m.res })),
  };
}

// Domarens svit med vardera laget. referee = namnet fran FotMob (eller football-data).
// Returnerar null utan domare; flagged = nagot av lagen har minst MIN_STREAK raka segrar/forluster.
export function refereeFlags(index, { referee, home, away }) {
  const rk = refKey(referee);
  if (!rk || !index) return null;
  const th = resolveTeam(home, index.teams), ta = resolveTeam(away, index.teams);
  const h = th ? sideFlag(index, th, rk) : null;
  const a = ta ? sideFlag(index, ta, rk) : null;
  return { referee, home: h, away: a, flagged: !!(h?.flag || a?.flag) };
}

// Kort svensk rad per flaggat lag (for tipskort och analystext)
export function refereeNotes(rf, homeName, awayName) {
  if (!rf?.flagged) return [];
  const out = [];
  for (const [s, name] of [[rf.home, homeName], [rf.away, awayName]]) {
    if (!s?.flag) continue;
    const verb = s.flag === 'wins' ? 'vunnit' : 'förlorat';
    out.push(`Domare ${rf.referee}: ${name || s.team} har ${verb} ${s.streak.n} ligamatcher i rad med domaren (totalt ${s.record.w}-${s.record.d}-${s.record.l} i ${s.matches} matcher).`);
  }
  return out;
}

// ---------- Domarstatistik per liga och match (panelen "Domare" bredvid Duellanalys) ----------

// Statistik over de senaste REPORT_SEASONS sasongerna (fran 1 juli); "ligans domare" = har domt i ligan
// denna eller forra sasongen
export const REPORT_SEASONS = 3;
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const seasonStartYear = (ymd) => { const [y, m] = ymd.split('-').map(Number); return m >= 7 ? y : y - 1; };

// Snitt per match: gula, roda, frisparkar, mal och utfall (kort/frisparkar bara over matcher som har dem)
export function disciplineStats(list) {
  let n = 0, goals = 0, hw = 0, dr = 0, y = 0, rc = 0, yn = 0, f = 0, fn = 0;
  for (const m of list || []) {
    n++;
    goals += m.hg + m.ag;
    if (m.hg > m.ag) hw++; else if (m.hg === m.ag) dr++;
    if (m.hy != null && m.ay != null) { y += m.hy + m.ay; rc += (m.hr || 0) + (m.ar || 0); yn++; }
    if (m.hf != null && m.af != null) { f += m.hf + m.af; fn++; }
  }
  return {
    matches: n,
    yellowPg: yn ? round(y / yn, 2) : null,
    redPg: yn ? round(rc / yn, 3) : null,
    foulsPg: fn ? round(f / fn, 1) : null,
    goalsPg: n ? round(goals / n, 2) : null,
    homeWinRate: n ? round(hw / n, 3) : null,
    drawRate: n ? round(dr / n, 3) : null,
    awayWinRate: n ? round((n - hw - dr) / n, 3) : null,
  };
}

// Skillnad mot ligasnittet: absolut och i procent
export function vsAverage(value, avg) {
  if (value == null || avg == null || !avg) return null;
  return { diff: round(value - avg, 2), pct: Math.round((value / avg - 1) * 100) };
}

// Alla domare i ligan med kort/frisparkar mot ligasnittet. matches = mergeRefereeMatches(...) (alla ligor).
export function refereeLeagueReport(matches, league, { today = new Date().toISOString().slice(0, 10), seasons = REPORT_SEASONS } = {}) {
  const cur = seasonStartYear(today);
  const since = `${cur - seasons + 1}-07-01`;
  const activeSince = `${cur - 1}-07-01`;
  const inLeague = (matches || []).filter((m) => m.lg === league && m.d >= since && m.d <= today);
  const leagueAvg = disciplineStats(inLeague);
  const byRef = new Map();
  for (const m of inLeague) {
    const k = refKey(m.r);
    if (!k) continue;
    if (!byRef.has(k)) byRef.set(k, []);
    byRef.get(k).push(m);
  }
  const referees = [];
  for (const [key, list] of byRef) {
    list.sort((a, b) => a.d.localeCompare(b.d));
    const last = list[list.length - 1];
    if (last.d < activeSince) continue;
    const st = disciplineStats(list);
    referees.push({ key, referee: last.r, lastDate: last.d, ...st, yellowVsAvg: vsAverage(st.yellowPg, leagueAvg.yellowPg), foulsVsAvg: vsAverage(st.foulsPg, leagueAvg.foulsPg) });
  }
  referees.sort((a, b) => b.matches - a.matches || a.referee.localeCompare(b.referee));
  return { league, since, today, seasons, leagueAvg, referees };
}

// Lagets facit mot en domare (alla ligor, all historik), kompakt for tabellen
function teamRecord(index, team, key) {
  if (!team) return null;
  const list = index.byPair.get(`${team}|${key}`) || [];
  const r = { matches: list.length, w: 0, d: 0, l: 0 };
  for (const m of list) r[m.res === 'W' ? 'w' : m.res === 'D' ? 'd' : 'l']++;
  return r;
}

// Panelen for en match: tillsatt domare (om kand) mot ligasnittet och mot de tva lagen, plus alla ligans domare
// med lagens facit. referee = namnet fran FotMob eller null.
export function refereePanel({ matches, index, league, home, away, referee = null, today }) {
  const report = refereeLeagueReport(matches, league, { today });
  const th = resolveTeam(home, index.teams), ta = resolveTeam(away, index.teams);
  const rk = refKey(referee);
  let appointed = null;
  if (rk) {
    const inLg = report.referees.find((r) => r.key === rk);
    // Ny i ligan: profil fran alla ligor under samma period (markeras)
    const prof = inLg || disciplineStats((matches || []).filter((m) => refKey(m.r) === rk && m.d >= report.since && m.d <= report.today));
    const flags = refereeFlags(index, { referee, home: th || home, away: ta || away });
    appointed = {
      ...prof, referee, key: rk, otherLeagues: !inLg,
      yellowVsAvg: vsAverage(prof.yellowPg, report.leagueAvg.yellowPg),
      foulsVsAvg: vsAverage(prof.foulsPg, report.leagueAvg.foulsPg),
      home: flags?.home || null, away: flags?.away || null, flagged: !!flags?.flagged,
    };
  }
  return {
    league, since: report.since, seasons: report.seasons, leagueAvg: report.leagueAvg,
    teams: { home: th, away: ta }, referee: appointed,
    referees: report.referees.map((r) => ({ ...r, home: teamRecord(index, th, r.key), away: teamRecord(index, ta, r.key) })),
  };
}
