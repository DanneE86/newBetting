// Domarsviter per lag: hur laget har gatt i sina senaste matcher med en viss domare.
// Flagga (anvandarens regel 2026-10-01): minst 5 raka segrar eller minst 5 raka forluster med domaren.
// Historik: football-data.co.uk (PL, Championship, League One, League Two, kolumnen Referee, ligamatcher).
// Domarnamn: football-data skriver "A Taylor", FotMob "Anthony Taylor" -> nyckel = initial + efternamn.
import { nameScore } from './match-context.mjs';

export const MIN_STREAK = 5;
// football-data-divisioner med domare (E3 = League Two: lag som flyttats upp har sin historik dar)
export const REF_DIVISIONS = { E0: 'PL', E1: 'CH', E2: 'EL1', E3: 'EL2' };
export const ENGLISH_LEAGUES = new Set(Object.values(REF_DIVISIONS));
// Alla ligor med domardata: England via football-data, ovriga via FotMob (scripts/fetch-referees-fotmob.mjs).
// Superettan: FotMob har ingen domare dar -> superettan.se (scripts/fetch-referees-allsvenskan.mjs). Div 1 saknas.
export const REF_LEAGUES = new Set([...ENGLISH_LEAGUES, 'BL', 'BL2', 'LL', 'LL2', 'SA', 'SB', 'L1', 'ED', 'PT', 'GR', 'AS', 'SE2',
  'NO', 'NO2', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'BR', 'BR2', 'AR', 'COL', 'CZ', 'HR', 'CL', 'EL', 'ECL']);
// Officiella domarkallor (se applyOfficialReferees)
const OFFICIAL_FILES = ['data/open/referee_allsvenskan.json', 'data/open/referee_official.json'];
// Ettan Norra och Sodra ar samma FotMob-liga och delar domare -> en nyckel
const LEAGUE_KEY = { SE3N: 'SE3', SE3S: 'SE3' };
export const refLeagueKey = (code) => LEAGUE_KEY[code] || code;
// Ligor som spelar over kalenderaret (sasong = ar i st f juli-juni)
export const CALENDAR_LEAGUES = new Set(['AS', 'SE2', 'SE3', 'NO', 'NO2', 'JP1', 'MLS', 'BR', 'BR2', 'AR', 'COL']);

// Bokstaver som NFD inte delar upp (ł, ø ...) -> latinska motsvarigheter
const SPECIAL = { 'ł': 'l', 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'đ': 'd', 'ı': 'i', 'þ': 'th' };
const plain = (s) => String(s || '').toLowerCase().replace(/[łøæœßđıþ]/g, (c) => SPECIAL[c])
  .normalize('NFD').replace(/\p{M}/gu, '');
// Translitterering: "Ladebaeck" = "Ladebäck", "Eskaas" = "Eskås", "Groetta" = "Grøtta", "Badstuebner" = "Badstübner"
const translit = (s) => s.replace(/ae|aa/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
// Titlar fore namnet ("Dr. Matthias Jöllenbeck") och partiklar som skrivs bade med och utan bindestreck ("Al-Hakim")
const TITLES = new Set(['dr', 'prof']);
const PARTICLES = new Set(['al', 'el']);
// Stavfel och namnvarianter i kallorna (nyckel -> nyckeln for samma domare), hittade 2026-10-02
const REF_ALIASES = {
  'k oldhfer': 'k oldhafer', 'k katoikos': 'k katikos', 'd huittron': 'd huitron',
  's zampalas': 's zabalas', 's zamplalas': 's zabalas', 'f fill': 'f fillho', 'l tisnei': 'l tisne',
  'l motorel': 'l matorel', 'a alhatam': 'a alhatem', 'u aslam': 'm aslam', 'a gariano': 'c gariano',
  'a muniz': 'a ruiz', 'o nielsen': 'o nilsen',
  // Allsvenskan (kontroll mot allsvenskan.se): stavfel hos allsvenskan.se, FotMobs fulla namn, namnbyte 2025
  'g maqedonki': 'g maqedonci', 'l ekberg': 'a ekberg', 'j ostling': 'j sars',
  // England: Sunny Sukhvir Singh Gill skrivs "S Singh", "S Gill", "Sunny Singh" eller "Sunny Sukhvir Gill"
  's singh': 's gill',
};

// "Anthony Taylor" / "A Taylor" / "A. Taylor" -> "a taylor"; "Jamie O'Connor" -> "j oconnor"; "J jBrooks" -> "j brooks"
// "Mohammed Al Hakim" / "Mohammed Al-Hakim" -> "m alhakim"; "Adam Ladebäck" / "Adam Ladebaeck" -> "a ladeback"
export function refKey(name) {
  const k = rawKey(name);
  return REF_ALIASES[k] || k;
}

// Nyckeln utan alias (avgor vilket namn som visas)
function rawKey(name) {
  // Utlandska domare i Superettan: "Juuso Vuorinen, Finland" / "Peiman Simani (Finland)" -> utan land
  name = String(name || '').replace(/\([^)]*\)/g, ' ').split(',')[0];
  let t = plain(String(name || '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')).replace(/['’.-]/g, '').split(/[^a-z]+/).filter(Boolean);
  while (t.length > 1 && TITLES.has(t[0])) t = t.slice(1);
  for (let i = t.length - 2; i >= 1; i--) if (PARTICLES.has(t[i])) t.splice(i, 2, t[i] + t[i + 1]);
  if (!t.length) return '';
  if (t.length === 1) return translit(t[0]);
  return `${t[0][0]} ${translit(t[t.length - 1])}`;
}

// Namnet som visas for en domarnyckel: vanligaste stavningen (vid lika: den senaste). Alias (stavfel, gamla
// namn som "Joakim Östling") visas bara om domaren saknar andra stavningar.
function displayName(list) {
  const real = list.filter((m) => !REF_ALIASES[rawKey(m.r)]);
  if (real.length) list = real;
  const n = new Map();
  for (const m of list) n.set(m.r, (n.get(m.r) || 0) + 1);
  let best = null;
  for (const m of list) if (!best || n.get(m.r) >= n.get(best)) best = m.r;
  return best;
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

// Forsta vardet per nyckel i matchstatistiken: [hemma, borta]
export function statPair(md, key) {
  for (const g of md?.content?.stats?.Periods?.All?.stats || []) {
    for (const s of g.stats || []) {
      if (s.key === key && Array.isArray(s.stats) && s.stats.length === 2) {
        const v = s.stats.map((x) => Number(x));
        if (v.every(Number.isFinite)) return v;
      }
    }
  }
  return null;
}

// Spelad match -> rad i samma format som football-data-historiken (r = null om domare saknas)
export function rowFromFotmob(md, fx, league) {
  const ref = String(md?.content?.matchFacts?.infoBox?.Referee?.text || '').trim();
  const sc = String(fx.status?.scoreStr || '').match(/(\d+)\s*-\s*(\d+)/);
  if (!sc) return null;
  const row = { id: String(fx.id), d: String(fx.status.utcTime).slice(0, 10), lg: league, h: fx.home.name, a: fx.away.name, hg: Number(sc[1]), ag: Number(sc[2]), r: ref || null };
  for (const [key, h, a] of [['yellow_cards', 'hy', 'ay'], ['red_cards', 'hr', 'ar'], ['fouls', 'hf', 'af']]) {
    const v = statPair(md, key);
    if (v) { row[h] = v[0]; row[a] = v[1]; }
  }
  const pens = penaltiesFromFotmob(md);
  if (pens) { row.hp = pens[0]; row.ap = pens[1]; }
  return row;
}

// Straffar per lag [hemma, borta] (dömda straffar = mål + missar, ej straffläggning). Skottkartan har alla
// straffar med lag-id; utan skottkarta: mål på straff och missade straffar i händelserna. null = okänt.
export function penaltiesFromFotmob(md) {
  const c = md?.content;
  const homeId = String(md?.general?.homeTeam?.id ?? '');
  const shots = c?.shotmap?.shots;
  if (Array.isArray(shots) && shots.length && homeId) {
    const p = [0, 0];
    for (const x of shots) {
      if (!/penalty/i.test(x.situation || '') || /shootout/i.test(x.period || '')) continue;
      p[String(x.teamId) === homeId ? 0 : 1]++;
    }
    return p;
  }
  const ev = c?.matchFacts?.events?.events;
  if (!Array.isArray(ev)) return null;
  const p = [0, 0];
  for (const e of ev) {
    if (e.isPenaltyShootoutEvent) continue;
    const pen = (e.type === 'Goal' && /penalty/i.test(e.goalDescriptionKey || e.goalDescription || '')) || e.type === 'MissedPenalty';
    if (pen) p[e.isHome ? 0 : 1]++;
  }
  return p;
}

// Sla ihop historik (aldre sasonger) och betting-store (aktuell sasong) utan dubbletter. Store-matcher har
// { date, league, home, away, hg, ag, referee }.
export function mergeRefereeMatches(history, storeMatches = []) {
  const map = new Map();
  const add = (m) => { if (m?.r && m.d) map.set(`${m.d}|${m.h}|${m.a}`, m); };
  for (const m of history || []) add(m);
  for (const m of storeMatches || []) {
    if (!ENGLISH_LEAGUES.has(m.league) || !m.referee || !Number.isFinite(m.hg) || !Number.isFinite(m.ag)) continue;
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
  let n = 0, goals = 0, hw = 0, dr = 0, y = 0, rc = 0, yn = 0, f = 0, fn = 0, pen = 0, pn = 0, rcn = 0;
  for (const m of list || []) {
    n++;
    goals += m.hg + m.ag;
    if (m.hg > m.ag) hw++; else if (m.hg === m.ag) dr++;
    if (m.hy != null && m.ay != null) { y += m.hy + m.ay; yn++; }
    if (m.hr != null || m.ar != null || (m.hy != null && m.ay != null)) { rc += (m.hr || 0) + (m.ar || 0); rcn++; }
    if (m.hp != null && m.ap != null) { pen += m.hp + m.ap; pn++; }
    if (m.hf != null && m.af != null) { f += m.hf + m.af; fn++; }
  }
  return {
    matches: n,
    yellowPg: yn ? round(y / yn, 2) : null,
    redPg: rcn ? round(rc / rcn, 3) : null,
    penaltyPg: pn ? round(pen / pn, 3) : null,
    // Totalt (for "antal straffar/gula/roda" i domarlistan) och hur manga matcher snitten bygger pa
    yellowTotal: yn ? y : null, redTotal: rcn ? rc : null, penaltyTotal: pn ? pen : null, penaltyMatches: pn,
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

const vsAll = (st, avg) => ({
  yellowVsAvg: vsAverage(st.yellowPg, avg.yellowPg), redVsAvg: vsAverage(st.redPg, avg.redPg),
  penaltyVsAvg: vsAverage(st.penaltyPg, avg.penaltyPg), foulsVsAvg: vsAverage(st.foulsPg, avg.foulsPg),
});

// Alla domare i ligan med kort/frisparkar mot ligasnittet. matches = mergeRefereeMatches(...) (alla ligor).
export function refereeLeagueReport(matches, league, { today = new Date().toISOString().slice(0, 10), seasons = REPORT_SEASONS } = {}) {
  const lgKey = refLeagueKey(league);
  const calendar = CALENDAR_LEAGUES.has(lgKey);
  const cur = calendar ? Number(today.slice(0, 4)) : seasonStartYear(today);
  const start = calendar ? '01-01' : '07-01';
  const since = `${cur - seasons + 1}-${start}`;
  const activeSince = `${cur - 1}-${start}`;
  const inLeague = (matches || []).filter((m) => m.lg === lgKey && m.d >= since && m.d <= today);
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
    referees.push({ key, referee: displayName(list), lastDate: last.d, ...st, ...vsAll(st, leagueAvg) });
  }
  referees.sort((a, b) => b.matches - a.matches || a.referee.localeCompare(b.referee));
  return { league, since, today, seasons, calendar, leagueAvg, referees };
}

// ---------- Sasongsfilter i domarvyn (anvandarens onskan 2026-10-02: arets sasong som standard, aldre valbara) ----------
export const HISTORY_SEASONS = 5;
const seasonLabel = (y, calendar) => (calendar ? String(y) : `${y}/${String((y + 1) % 100).padStart(2, '0')}`);

// Sasonger i domarvyn, nyast forst: [{ id: '2026', label, since, until }] + { id: 'all' } (senaste REPORT_SEASONS)
export function refereeSeasons(league, today = new Date().toISOString().slice(0, 10), n = HISTORY_SEASONS) {
  const calendar = CALENDAR_LEAGUES.has(refLeagueKey(league));
  const cur = calendar ? Number(today.slice(0, 4)) : seasonStartYear(today);
  const start = calendar ? '01-01' : '07-01';
  const end = calendar ? '12-31' : '06-30';
  const out = [];
  for (let y = cur; y > cur - n; y--) out.push({ id: String(y), label: seasonLabel(y, calendar), since: `${y}-${start}`, until: `${calendar ? y : y + 1}-${end}` });
  out.push({ id: 'all', label: `Senaste ${REPORT_SEASONS} säsongerna`, since: `${cur - REPORT_SEASONS + 1}-${start}`, until: today });
  return { calendar, current: String(cur), seasons: out };
}

// En sasong: ligasnitt och alla domare som domt i ligan den sasongen
function seasonReport(inLeague, s) {
  const list = inLeague.filter((m) => m.d >= s.since && m.d <= s.until);
  const leagueAvg = disciplineStats(list);
  const byRef = new Map();
  for (const m of list) {
    const k = refKey(m.r);
    if (!k) continue;
    if (!byRef.has(k)) byRef.set(k, []);
    byRef.get(k).push(m);
  }
  const referees = [...byRef].map(([key, l]) => {
    l.sort((a, b) => a.d.localeCompare(b.d));
    const st = disciplineStats(l);
    return { key, referee: displayName(l), lastDate: l[l.length - 1].d, ...st, ...vsAll(st, leagueAvg) };
  }).sort((a, b) => b.matches - a.matches || a.referee.localeCompare(b.referee));
  return { since: s.since, until: s.until, leagueAvg, referees };
}

// Ligans domarvy med sasongsfilter: rapport per sasong + alla matcher (for "domarens matcher" vid klick).
// Toppnivans leagueAvg/referees/since = innevarande sasong.
export function refereeLeagueSeasons(matches, league, { today = new Date().toISOString().slice(0, 10), n = HISTORY_SEASONS } = {}) {
  const lgKey = refLeagueKey(league);
  const { calendar, current, seasons } = refereeSeasons(league, today, n);
  const oldest = seasons[seasons.length - 2].since;
  const inLeague = (matches || []).filter((m) => m.lg === lgKey && m.d >= oldest && m.d <= today);
  const reports = {};
  for (const s of seasons) {
    reports[s.id] = s.id === 'all' ? (({ since, leagueAvg, referees }) => ({ since, until: today, leagueAvg, referees }))(refereeLeagueReport(matches, league, { today })) : seasonReport(inLeague, s);
  }
  // Tomma sasonger (ligan saknar data) visas inte i valet
  const withData = seasons.filter((s) => reports[s.id].leagueAvg.matches > 0);
  const games = inLeague.map((m) => {
    const g = { d: m.d, h: m.h, a: m.a, hg: m.hg, ag: m.ag, k: refKey(m.r) };
    for (const f of ['hy', 'ay', 'hr', 'ar', 'hp', 'ap']) if (m[f] != null) g[f] = m[f];
    return g;
  }).sort((a, b) => b.d.localeCompare(a.d));
  return { league, calendar, today, season: current, seasons: withData, reports, games, since: reports[current].since, leagueAvg: reports[current].leagueAvg, referees: reports[current].referees };
}

// Lagets alla matcher med domaren (nyast forst), for listan i matchens domarpanel
function teamGames(index, team, key) {
  if (!team) return [];
  return (index.byPair.get(`${team}|${key}`) || []).slice().reverse()
    .map((m) => ({ date: m.date, league: m.league, opp: m.opp, home: m.home, score: `${m.gf}-${m.ga}`, res: m.res, yc: m.yc }));
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
      ...vsAll(prof, report.leagueAvg),
      home: flags?.home ? { ...flags.home, games: teamGames(index, flags.home.team, rk) } : null,
      away: flags?.away ? { ...flags.away, games: teamGames(index, flags.away.team, rk) } : null,
      flagged: !!flags?.flagged,
    };
  }
  // Lagens facit mot alla domare som domt i ligan de senaste HISTORY_SEASONS sasongerna (tabellens sasongsfilter)
  const oldest = refereeSeasons(league, report.today).seasons.at(-2).since;
  const lgKey = refLeagueKey(league);
  const teamRecs = {};
  for (const m of matches || []) {
    if (m.lg !== lgKey || m.d < oldest) continue;
    const k = refKey(m.r);
    if (k && !teamRecs[k]) teamRecs[k] = { home: teamRecord(index, th, k), away: teamRecord(index, ta, k) };
  }
  return {
    league, since: report.since, seasons: report.seasons, calendar: report.calendar, leagueAvg: report.leagueAvg,
    teams: { home: th, away: ta }, referee: appointed, teamRecs,
    referees: report.referees.map((r) => ({ ...r, home: teamRecord(index, th, r.key), away: teamRecord(index, ta, r.key) })),
  };
}

// Laddar all domarhistorik: football-data (England) + FotMob (ovriga ligor) + store (aktuell engelsk sasong).
// readJson(relativ sokvag) -> objekt eller null. Rader utan domare tas bort.
export function loadRefereeMatches(readJson, storeMatches = []) {
  const fd = Object.values(readJson('data/open/referee_history.json')?.bySeason || {}).flat();
  const fmRaw = Object.values(readJson('data/open/referee_fotmob.json')?.leagues || {}).flatMap((l) => Object.values(l.matches || {}));
  const official = OFFICIAL_FILES.flatMap((f) => Object.values(readJson(f)?.matches || {}));
  const fm = applyOfficialReferees(fmRaw, official);
  // Ligor utan FotMob-rader (Superettan): de officiella raderna med resultat och kort anvands direkt
  const fmLeagues = new Set(fmRaw.map((m) => m.lg));
  const standalone = official.filter((o) => o.r && !fmLeagues.has(o.lg) && !ENGLISH_LEAGUES.has(o.lg) && Number.isFinite(o.hg) && Number.isFinite(o.ag))
    .map(({ id, v, src, ...m }) => m);
  const merged = mergeRefereeMatches([...fd, ...fm.filter((m) => m.r && !ENGLISH_LEAGUES.has(m.lg)), ...standalone], storeMatches);
  const fmEng = fm.filter((m) => m.r && ENGLISH_LEAGUES.has(m.lg));
  // Officiella engelska domare efter straffkopplingen (den gar pa football-datas domarnamn)
  return applyEnglishOfficials(attachPenalties(merged, fmEng), Object.values(readJson('data/open/referee_england.json')?.matches || {}), fmEng);
}

// England: football-data (rad) mot officiella kallor (scripts/fetch-referees-england.mjs). Kontroll 2026-10-02:
//  - PL: premierleague.com galler alltid (1 avvikelse pa 430, tillsatt domare bytt sent). Fullt namn + VAR.
//  - CH/EL1/EL2: efl.com hade fel i halften av sina 6 avvikelser -> rattar bara nar FotMob sager samma som efl.com.
const ENG_TEAM = {
  'man city': 'manchester city', 'man united': 'manchester united', "nott'm forest": 'nottingham forest',
  'nottm forest': 'nottingham forest', wolves: 'wolverhampton', spurs: 'tottenham', 'sheffield weds': 'sheffield wednesday',
  'west brom': 'west bromwich', qpr: 'queens park rangers', 'mk dons': 'milton keynes dons', 'bristol rvs': 'bristol rovers',
  'brighton and hove albion': 'brighton', 'brighton & hove albion': 'brighton', 'afc wimbledon': 'wimbledon',
};
const engStem = (s) => { const p = plain(s).trim(); return (ENG_TEAM[p] || p).replace(/\b(fc|afc|the)\b/g, '').replace(/[^a-z]/g, ''); };
const sameEngTeam = (a, b) => { const x = engStem(a), y = engStem(b); return x.length > 2 && y.length > 2 && (x.startsWith(y) || y.startsWith(x)); };
const findEng = (list, m) => list?.find((x) => dayDiff(x.d, m.d) <= 1 && sameEngTeam(x.h, m.h) && sameEngTeam(x.a, m.a));
export function applyEnglishOfficials(rows, official = [], fotmobRows = []) {
  if (!official?.length) return rows;
  const group = (list) => { const g = new Map(); for (const x of list || []) if (x?.r) { if (!g.has(x.lg)) g.set(x.lg, []); g.get(x.lg).push(x); } return g; };
  const off = group(official), fm = group(fotmobRows);
  return rows.map((m) => {
    if (!ENGLISH_LEAGUES.has(m.lg)) return m;
    const o = findEng(off.get(m.lg), m);
    if (!o) return m;
    if (o.src === 'pl') return { ...m, r: o.r, ...(o.var ? { var: o.var } : {}) };
    if (refKey(o.r) === refKey(m.r)) return m;
    const f = findEng(fm.get(m.lg), m);
    return f && refKey(f.r) === refKey(o.r) ? { ...m, r: o.r } : m;
  });
}

// Officiella domare (allsvenskan.se, cbf.com.br, chanceliga.cz, laliga.com, uefa.com, data.j-league.or.jp; se
// scripts/fetch-referees-allsvenskan.mjs och fetch-referees-official.mjs) fyller luckor och rattar FotMob.
// Kontroll Allsvenskan 2026-10-02: FotMob saknade domare i 12 av 176 matcher och hade fel domare i 2.
// official = [{ d, lg, h, a, r }]; kopplas pa liga, datum (+-1 dag) och lagnamnen. Kort/straffar behalls fran FotMob.
const teamStem = (s) => plain(s).replace(/\b(if|ff|aif|bk|fc|ik|ifk|is|sk|fk|ac|cf|cd|ud|sd|ec|sc|kf|nk|hnk|gnk|sv|afc|saf)\b/g, '').replace(/[^a-z]/g, '');
const sameTeam = (a, b) => { const x = teamStem(a), y = teamStem(b); return !!x && !!y && (x.startsWith(y.slice(0, 5)) || y.startsWith(x.slice(0, 5))); };
const dayDiff = (a, b) => Math.abs(Date.parse(a) - Date.parse(b)) / 864e5;

// Officiell match for en FotMob-rad: samma liga, datum +-1 dag och bada lagen, annars ett av lagen (ett lag spelar
// bara en ligamatch per dygn; lagnamnen skrivs olika mellan kallorna, t.ex. "Red Bull Bragantino"/"Bragantino")
// Ett-lag-reserven kraver hela namnet (inte bara 5 forsta bokstaverna: "Racing Santander" != "Racing Ferrol")
// och exakt en kandidat.
const strictTeam = (a, b) => { const x = teamStem(a), y = teamStem(b); return x.length > 2 && y.length > 2 && (x.startsWith(y) || y.startsWith(x)); };
function findOfficial(list, m) {
  const one = [];
  for (const x of list || []) {
    if (dayDiff(x.d, m.d) > 1) continue;
    if (sameTeam(x.h, m.h) && sameTeam(x.a, m.a)) return x;
    if (strictTeam(x.h, m.h) || strictTeam(x.a, m.a)) one.push(x);
  }
  return one.length === 1 ? one[0] : null;
}

// Samma domare enligt namnet: samma forsta bokstav i fornamnet och minst ett gemensamt efternamn som inte ar
// vanligt ("Iván Caparrós Hernández" = "Iván Caparrós", men "Paulo Cesar da Silva" != "Paulo Roberto Silva")
const COMMON_SURNAMES = new Set(['silva', 'santos', 'oliveira', 'souza', 'sousa', 'pereira', 'lima', 'junior', 'filho', 'neto',
  'costa', 'rodrigues', 'ferreira', 'alves', 'gomes', 'martins', 'carvalho', 'hernandez', 'garcia', 'fernandez', 'martinez',
  'lopez', 'gonzalez', 'rodriguez', 'sanchez', 'perez', 'gomez', 'diaz', 'ruiz', 'jimenez', 'moreno', 'munoz', 'alvarez',
  'romero', 'navarro', 'torres', 'dominguez', 'vazquez', 'ramos', 'gil', 'serrano', 'blanco', 'molina', 'morales', 'suarez']);
const nameTokens = (n) => plain(n).replace(/['’.-]/g, '').split(/[^a-z]+/).filter((t) => t.length > 1 && !['de', 'da', 'do', 'dos', 'das', 'del', 'la', 'van', 'von', 'der'].includes(t));
function sameRefName(a, b) {
  const x = nameTokens(a), y = nameTokens(b);
  // Samma nyckel racker bara nar efternamnet inte ar vanligt ("p silva" kan vara manga olika domare)
  if (refKey(a) === refKey(b) && !COMMON_SURNAMES.has(refKey(a).split(' ').pop())) return true;
  if (x.length < 2 || y.length < 2 || x[0][0] !== y[0][0]) return false;
  const sy = new Set(y.slice(1));
  return x.slice(1).some((t) => sy.has(t) && !COMMON_SURNAMES.has(t));
}
// sportomedia-matchhandelser (allsvenskan.se/superettan.se) -> kort och straffar per lag.
// WARNING = gult, PENALTY = utvisning (rott), PENALTY_KICK = dömd straff; byHomeTeam = laget handelsen galler.
export function disciplineFromEvents(events) {
  const row = { hy: 0, ay: 0, hr: 0, ar: 0, hp: 0, ap: 0 };
  for (const e of events || []) {
    const side = e.byHomeTeam ? 'h' : 'a';
    if (e.type === 'WARNING') row[`${side}y`]++;
    else if (e.type === 'PENALTY') row[`${side}r`]++;
    else if (e.type === 'PENALTY_KICK') row[`${side}p`]++;
  }
  return row;
}

// Officiella namn skrivs ofta annorlunda an FotMobs (fullstandiga namn, efternamn forst). Namnet oversatts till
// FotMobs stavning for samma domare, sa att domaren far en nyckel: 1) inlart fran matcher dar bada har domare
// (minst 2 ganger och 60 % av fallen), 2) namnlikhet mot ligans FotMob-namn, 3) annars det officiella namnet.
export function applyOfficialReferees(rows, official = []) {
  if (!official?.length) return rows;
  const byLg = new Map();
  for (const o of official) if (o?.r) { if (!byLg.has(o.lg)) byLg.set(o.lg, []); byLg.get(o.lg).push(o); }
  const pairs = rows.map((m) => [m, byLg.has(m.lg) ? findOfficial(byLg.get(m.lg), m) : null]);
  const learned = new Map(), fmNames = new Map();
  const bump = (map, k, v) => { if (!map.has(k)) map.set(k, new Map()); const c = map.get(k); c.set(v, (c.get(v) || 0) + 1); };
  for (const [m, o] of pairs) {
    if (!m.r) continue;
    bump(fmNames, m.lg, m.r);
    if (o) bump(learned, `${m.lg}|${o.r}`, m.r);
  }
  const top = (c) => [...c].sort((a, b) => b[1] - a[1])[0];
  const cache = new Map();
  const canon = (lg, name) => {
    const ck = `${lg}|${name}`;
    if (cache.has(ck)) return cache.get(ck);
    let out = null;
    const c = learned.get(ck);
    if (c) { const [n, k] = top(c); const total = [...c.values()].reduce((s, x) => s + x, 0); if (k >= 2 && k / total >= 0.6) out = n; }
    if (!out) {
      const cand = [...(fmNames.get(lg) || [])].filter(([n]) => sameRefName(n, name));
      if (cand.length && new Set(cand.map(([n]) => refKey(n))).size === 1) out = top(new Map(cand))[0];
    }
    if (!out && /[a-z]/i.test(name)) out = name;
    cache.set(ck, out);
    return out;
  };
  return pairs.map(([m, o]) => {
    if (!o) return m;
    const name = canon(m.lg, o.r);
    if (!name || (m.r && refKey(m.r) === refKey(name))) return m;
    return { ...m, r: name };
  });
}

// England: football-data saknar straffar. FotMob-raden for samma liga, dag och domare (en domare domer en match
// per dag) ger straffarna - lagnamnen skiljer sig mellan kallorna, sa de anvands inte for kopplingen.
export function attachPenalties(matches, fotmobRows) {
  const pen = new Map();
  for (const m of fotmobRows || []) if (m.hp != null) pen.set(`${m.lg}|${m.d}|${refKey(m.r)}`, m);
  if (!pen.size) return matches;
  return matches.map((m) => {
    if (m.hp != null) return m;
    const x = pen.get(`${m.lg}|${m.d}|${refKey(m.r)}`);
    return x ? { ...m, hp: x.hp, ap: x.ap } : m;
  });
}

// Finns domardata for ligan? (minst en match de senaste tva aren)
export function hasRefereeData(matches, league, today = new Date().toISOString().slice(0, 10)) {
  const k = refLeagueKey(league);
  const since = `${Number(today.slice(0, 4)) - 2}${today.slice(4)}`;
  return (matches || []).some((m) => m.lg === k && m.d >= since);
}

// Ligor som har domardata (for flikarna i ligans domarvy)
export function leaguesWithData(matches, today) {
  return [...REF_LEAGUES].filter((l) => hasRefereeData(matches, l, today));
}

// Kommande matcher i ligan dar domaren ar tillsatt: domarens facit mot vardera laget (5 raka = flagga) och
// domarens snitt i ligan. upcoming = data/open/referees_upcoming.json -> matches.
export function leagueAppointments(index, report, upcoming, league) {
  const k = refLeagueKey(league);
  const prof = new Map((report?.referees || []).map((r) => [r.key, r]));
  return (upcoming || [])
    .filter((m) => m.referee && refLeagueKey(m.league) === k)
    .sort((a, b) => `${a.date}${a.kickoffUtc || ''}`.localeCompare(`${b.date}${b.kickoffUtc || ''}`))
    .map((m) => {
      const f = refereeFlags(index, { referee: m.referee, home: m.home, away: m.away });
      const p = prof.get(refKey(m.referee));
      return {
        league: m.league, date: m.date, kickoffUtc: m.kickoffUtc || null, home: m.home, away: m.away,
        referee: m.referee, key: refKey(m.referee), flagged: !!f?.flagged, homeRec: f?.home || null, awayRec: f?.away || null,
        profile: p ? { matches: p.matches, yellowPg: p.yellowPg, redPg: p.redPg, penaltyPg: p.penaltyPg, foulsPg: p.foulsPg, yellowVsAvg: p.yellowVsAvg, redVsAvg: p.redVsAvg, penaltyVsAvg: p.penaltyVsAvg } : null,
      };
    });
}

// ---------- Domare med lag hemmavinst: bortalaget vinner oftare an oddsen sager ----------
// Anvandaren 2026-10-02 kvall ("fixa detta"). Test England PL/CH/EL1/EL2 2022/23 -> (16 870 lagmatcher, stangningsodds,
// bara data fore matchen): domare med hemmavinst <= 38 % pa minst 40 tidigare engelska ligamatcher -> bortalaget vann 37 %
// mot oddsens 32 % (n 622, z 2,9, samma hall alla fyra hela sasonger), hemmalaget 39 % mot 42 %, kryss 24 % mot 26 %.
// Justeringen ar ungefar 60 % av det uppmatta (krymps mot noll for att inte overskatta): hemma -2, kryss -1, borta +3
// procentenheter. Bara engelska ligor (dar det ar testat).
export const AWAY_REF = { minMatches: 40, maxHomeRate: 0.38, shift: [-0.02, -0.01, 0.03] };

// Domarnyckel -> [{ d, hw }] (engelska ligamatcher, aldst forst; hw = hemmavinst)
export function buildRefHomeIndex(matches) {
  const idx = new Map();
  for (const m of matches || []) {
    if (!ENGLISH_LEAGUES.has(m.lg) || !m.r || !Number.isFinite(m.hg) || !Number.isFinite(m.ag)) continue;
    const k = refKey(m.r);
    if (!k) continue;
    if (!idx.has(k)) idx.set(k, []);
    idx.get(k).push({ d: m.d, hw: m.hg > m.ag });
  }
  for (const list of idx.values()) list.sort((a, b) => a.d.localeCompare(b.d));
  return idx;
}

// Domarens hemmavinst i matcher fore `date` (YYYY-MM-DD). flag = minst AWAY_REF.minMatches och hogst maxHomeRate.
export function refereeHomeBias(index, referee, date) {
  const k = refKey(referee);
  const list = k && index?.get(k);
  if (!list?.length) return null;
  const before = list.filter((m) => m.d < date);
  if (!before.length) return null;
  const homeRate = before.filter((m) => m.hw).length / before.length;
  return { referee, matches: before.length, homeRate: Math.round(homeRate * 1000) / 1000, flag: before.length >= AWAY_REF.minMatches && homeRate <= AWAY_REF.maxHomeRate };
}

// [hemma, kryss, borta] flyttat mot bortalaget nar domaren flaggas, normerat till 1
export function applyRefereeAway(p, bias) {
  if (!bias?.flag || !p) return p;
  const q = p.map((x, k) => Math.max(0.01, x + AWAY_REF.shift[k]));
  const s = q.reduce((a, b) => a + b, 0);
  return q.map((x) => x / s);
}

// Analysrad i klartext
export function refereeAwayNotes(bias, home, away) {
  if (!bias?.flag) return [];
  return [`Domare ${bias.referee}: hemmalaget har vunnit bara ${Math.round(bias.homeRate * 100)} % av domarens ${bias.matches} engelska ligamatcher – i sådana matcher har bortalaget vunnit oftare än oddsen sagt. ${away} +3 procentenheter, ${home} −2.`];
}
