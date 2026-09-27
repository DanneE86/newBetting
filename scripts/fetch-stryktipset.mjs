// Stryktipset + Europatipset fran Svenska Spels oppna API + egen analys per match.
//   Kupong: api.spela.svenskaspel.se/draw/1/<produkt>/draws (oppen) eller /draws/<nr> (senaste avgjorda, med facit)
//   Klubbmodell: viktad Poisson (anfall/forsvar + hemmafordel) per land fran football-data-CSV:er i data/raw.
//     England skattas gemensamt over PL/CH/League One/League Two sa uppflyttade lag far ratt niva.
//   Landslag: World Football Elo (eloratings.net) -> malskillnad -> Poisson.
//   Slutsannolikhet = blandning av Svenska Spels odds (marginal borttagen) och modellen.
// Utdata: data/stryktipset.json (GUI-fliken "Stryktipset").
//   node scripts/fetch-stryktipset.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(root, 'data', 'raw');
const OUT = path.join(root, 'data', 'stryktipset.json');
const API = 'https://api.spela.svenskaspel.se/draw/1';
const PRODUCTS = [
  { id: 'stryktipset', name: 'Stryktipset' },
  { id: 'europatipset', name: 'Europatipset' },
];
// Senast kanda omgangsnummer (for att hitta senaste avgjorda kupong nar ingen ar oppen)
const SEED_DRAW = { stryktipset: 4972, europatipset: 2611 };
// Hur mycket modellen vager mot Svenska Spels odds (marknaden ar skarpast; modellen fangar form/xG)
const MODEL_W = 0.35;
const MODEL_W_THIN = 0.2; // lite data (fa viktade matcher) eller landslag
const SYSTEM_MAX_ROWS = 296; // forslag pa system: max rader
const HALF_LIFE_DAYS = 150;
const RHO = -0.08; // Dixon-Coles-korrektion for 0-0/1-1/1-0/0-1

const log = (s) => process.stdout.write(`${s}\n`);
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const r2 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 100) / 100);
const num = (s) => {
  if (s == null || s === '') return null;
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

async function get(url, type = 'json') {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny lokal analys)' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return type === 'json' ? res.json() : res.text();
}

// ---------- football-data CSV ----------
const FD = {
  england: { PL: 'E0', CH: 'E1', EL1: 'E2', EL2: 'E3' },
  spain: { LL: 'SP1', LL2: 'SP2' },
  italy: { SA: 'I1', SB: 'I2' },
  germany: { BL: 'D1', BL2: 'D2' },
  france: { L1: 'F1' },
  netherlands: { ED: 'N1' },
  portugal: { PT: 'P1' },
  greece: { GR: 'G1' },
};
const SEASONS = ['2627', '2526'];
const COUNTRY_GROUP = {
  England: 'england', Spanien: 'spain', Italien: 'italy', Tyskland: 'germany', Frankrike: 'france',
  Nederländerna: 'netherlands', Holland: 'netherlands', Portugal: 'portugal', Grekland: 'greece',
};
// Svenska Spels liganamn -> var ligakod (England har fyra nivaer med egna namn)
const LEAGUE_CODE = {
  england: { 'Premier League': 'PL', Championship: 'CH', 'League One': 'EL1', 'League Two': 'EL2' },
};
const LEAGUE_NAME = {
  PL: 'Premier League', CH: 'Championship', EL1: 'League One', EL2: 'League Two', LL: 'La Liga', LL2: 'LaLiga 2',
  SA: 'Serie A', SB: 'Serie B', BL: 'Bundesliga', BL2: '2. Bundesliga', L1: 'Ligue 1', ED: 'Eredivisie',
  PT: 'Primeira Liga', GR: 'Super League',
};

async function ensureCsv(code, fdCode, season) {
  const file = path.join(RAW, `${code}_${season}.csv`);
  const current = season === SEASONS[0];
  const fresh = fs.existsSync(file) && (!current || Date.now() - fs.statSync(file).mtimeMs < 6 * 3600e3);
  if (fresh) return file;
  try {
    const csv = await get(`https://www.football-data.co.uk/mmz4281/${season}/${fdCode}.csv`, 'text');
    if (csv.includes('HomeTeam')) fs.writeFileSync(file, csv, 'utf8');
  } catch (e) {
    log(`  CSV ${code}_${season} kunde inte hamtas (${e.message}) – anvander befintlig fil`);
  }
  return fs.existsSync(file) ? file : null;
}

function parseDate(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s || '');
  if (!m) return null;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function readCsvMatches(file, league, season) {
  const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const head = lines[0].split(',');
  const ix = (k) => head.indexOf(k);
  const I = { d: ix('Date'), h: ix('HomeTeam'), a: ix('AwayTeam'), hg: ix('FTHG'), ag: ix('FTAG'), hx: ix('HxG'), ax: ix('AxG') };
  const out = [];
  for (const l of lines.slice(1)) {
    const c = l.split(',');
    const hg = num(c[I.hg]);
    const ag = num(c[I.ag]);
    const date = parseDate(c[I.d]);
    if (!date || hg == null || ag == null || !c[I.h]) continue;
    out.push({
      league, season, date, home: c[I.h], away: c[I.a], hg, ag,
      hxg: I.hx >= 0 ? num(c[I.hx]) : null, axg: I.ax >= 0 ? num(c[I.ax]) : null,
    });
  }
  return out;
}

async function loadGroup(group) {
  const all = [];
  for (const [code, fdCode] of Object.entries(FD[group])) {
    for (const season of SEASONS) {
      const f = await ensureCsv(code, fdCode, season);
      if (f) all.push(...readCsvMatches(f, code, season));
    }
  }
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Viktad Poisson-modell (Maher) ----------
// E[hemmamal] = h * att_hemma * def_borta, E[bortamal] = att_borta * def_hemma
function fitModel(matches, cutoff) {
  const ms = matches.filter((m) => m.date < cutoff);
  const cut = new Date(`${cutoff}T00:00:00Z`).getTime();
  const w = ms.map((m) => 0.5 ** ((cut - new Date(`${m.date}T00:00:00Z`).getTime()) / 86400e3 / HALF_LIFE_DAYS));
  const teams = new Set(ms.flatMap((m) => [m.home, m.away]));
  // Lagets aktuella liga = senaste matchens liga
  const leagueOf = new Map();
  for (const m of ms) { leagueOf.set(m.home, m.league); leagueOf.set(m.away, m.league); }
  const att = new Map([...teams].map((t) => [t, 1]));
  const def = new Map([...teams].map((t) => [t, 1]));
  const wSum = new Map([...teams].map((t) => [t, 0]));
  ms.forEach((m, i) => { wSum.set(m.home, wSum.get(m.home) + w[i]); wSum.set(m.away, wSum.get(m.away) + w[i]); });
  // xG (om det finns) blandas in i "mal" – mindre brus an faktiska mal
  const g = (goals, xg) => (xg != null ? 0.5 * goals + 0.5 * xg : goals);
  let h = 1.25;
  const K = 2.5; // prior i matchvikter mot ligasnittet
  for (let it = 0; it < 60; it++) {
    const leagueMean = (map) => {
      const s = new Map();
      for (const t of teams) {
        const L = leagueOf.get(t);
        const cur = s.get(L) || [0, 0];
        s.set(L, [cur[0] + Math.log(map.get(t)), cur[1] + 1]);
      }
      return new Map([...s].map(([L, [a, n]]) => [L, Math.exp(a / n)]));
    };
    const attL = leagueMean(att);
    const defL = leagueMean(def);
    const aNum = new Map(), aDen = new Map(), dNum = new Map(), dDen = new Map();
    const add = (map, k, v) => map.set(k, (map.get(k) || 0) + v);
    ms.forEach((m, i) => {
      const hg = g(m.hg, m.hxg);
      const ag = g(m.ag, m.axg);
      add(aNum, m.home, w[i] * hg); add(aDen, m.home, w[i] * h * def.get(m.away));
      add(aNum, m.away, w[i] * ag); add(aDen, m.away, w[i] * def.get(m.home));
      add(dNum, m.away, w[i] * hg); add(dDen, m.away, w[i] * h * att.get(m.home));
      add(dNum, m.home, w[i] * ag); add(dDen, m.home, w[i] * att.get(m.away));
    });
    for (const t of teams) {
      const L = leagueOf.get(t);
      const base = 1.3;
      att.set(t, ((aNum.get(t) || 0) + K * attL.get(L) * base) / ((aDen.get(t) || 0) + K * base));
      def.set(t, ((dNum.get(t) || 0) + K * defL.get(L) * base) / ((dDen.get(t) || 0) + K * base));
    }
    let hn = 0, hd = 0;
    ms.forEach((m, i) => { hn += w[i] * g(m.hg, m.hxg); hd += w[i] * att.get(m.home) * def.get(m.away); });
    h = hn / hd;
    // Normalisera (modellen ar invariant for att*c, def/c)
    const gm = Math.exp([...att.values()].reduce((s, v) => s + Math.log(v), 0) / att.size);
    for (const t of teams) { att.set(t, att.get(t) / gm); def.set(t, def.get(t) * gm); }
  }
  return { att, def, h, wSum, leagueOf, matches: ms };
}

function poisson(k, l) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-l) * l ** k) / f;
}

function scoreMatrix(lh, la) {
  const N = 9;
  const tau = (i, j) => {
    if (i === 0 && j === 0) return 1 - lh * la * RHO;
    if (i === 0 && j === 1) return 1 + lh * RHO;
    if (i === 1 && j === 0) return 1 + la * RHO;
    if (i === 1 && j === 1) return 1 - RHO;
    return 1;
  };
  let home = 0, draw = 0, away = 0, over25 = 0, btts = 0, tot = 0;
  const scores = [];
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = poisson(i, lh) * poisson(j, la) * tau(i, j);
      tot += p;
      if (i > j) home += p; else if (i === j) draw += p; else away += p;
      if (i + j >= 3) over25 += p;
      if (i > 0 && j > 0) btts += p;
      scores.push({ score: `${i}-${j}`, p });
    }
  }
  return {
    home: home / tot, draw: draw / tot, away: away / tot, over25: over25 / tot, btts: btts / tot,
    topScores: scores.sort((a, b) => b.p - a.p).slice(0, 5).map((s) => ({ score: s.score, p: r3(s.p / tot) })),
  };
}

// ---------- Lagnamn Svenska Spel -> football-data ----------
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, 'and').replace(/\b(fc|afc|cf|sc|ac|ssc|as|us|1\.)\b/g, '').replace(/[^a-z0-9]/g, '');
const ALIAS = {
  nottingham: "Nott'm Forest", nottinghamforest: "Nott'm Forest", nottmforest: "Nott'm Forest",
  queensparkrangers: 'QPR', sheffieldw: 'Sheffield Weds', sheffieldwednesday: 'Sheffield Weds', sheffw: 'Sheffield Weds',
  sheffieldu: 'Sheffield United', sheffieldutd: 'Sheffield United', sheffu: 'Sheffield United',
  wimbledon: 'AFC Wimbledon', mkdons: 'Milton Keynes Dons', miltonkeynes: 'Milton Keynes Dons',
  manchesterunited: 'Man United', manchesterutd: 'Man United', manutd: 'Man United', manchesteru: 'Man United',
  manchestercity: 'Man City', manchesterc: 'Man City', wolverhampton: 'Wolves', westbromwich: 'West Brom',
  bristolr: 'Bristol Rvs', bristolrovers: 'Bristol Rvs', bristolc: 'Bristol City', tottenhamhotspur: 'Tottenham',
  brightonhovealbion: 'Brighton', westhamunited: 'West Ham', leedsunited: 'Leeds', newcastleunited: 'Newcastle',
  atleticomadrid: 'Ath Madrid', athleticbilbao: 'Ath Bilbao', realsociedad: 'Sociedad', celtavigo: 'Celta',
  realbetis: 'Betis', rayovallecano: 'Vallecano', espanyol: 'Espanol',
  intermilan: 'Inter', internazionale: 'Inter', milan: 'Milan', acmilan: 'Milan', asroma: 'Roma',
  bayernmunchen: 'Bayern Munich', bayerleverkusen: 'Leverkusen', borussiadortmund: 'Dortmund',
  borussiamonchengladbach: "M'gladbach", monchengladbach: "M'gladbach", eintrachtfrankfurt: 'Ein Frankfurt',
  koln: 'FC Koln', fckoln: 'FC Koln', mainz: 'Mainz', unionberlin: 'Union Berlin', stpauli: 'St Pauli',
  parissaintgermain: 'Paris SG', psg: 'Paris SG', parissg: 'Paris SG', olympiquemarseille: 'Marseille',
  olympiquelyon: 'Lyon', saintetienne: 'St Etienne',
  psveindhoven: 'PSV Eindhoven', feyenoord: 'Feyenoord', ajax: 'Ajax', azalkmaar: 'AZ Alkmaar', az: 'AZ Alkmaar',
  sportinglissabon: 'Sp Lisbon', sporting: 'Sp Lisbon', sportingcp: 'Sp Lisbon', benfica: 'Benfica', porto: 'Porto',
  sportingbraga: 'Sp Braga', braga: 'Sp Braga',
};

function matchTeam(svsNames, pool, preferLeague, leagueOf) {
  const cands = [...pool];
  const byNorm = new Map(cands.map((t) => [norm(t), t]));
  for (const raw of svsNames) {
    const n = norm(raw);
    if (!n) continue;
    if (byNorm.has(n)) return byNorm.get(n);
    if (ALIAS[n] && pool.has(ALIAS[n])) return ALIAS[n];
  }
  // Prefix at bada hall ("Fleetwood" ~ "Fleetwood Town", "Peterborough" ~ "Peterboro")
  const hits = new Set();
  for (const raw of svsNames) {
    const n = norm(raw);
    if (n.length < 4) continue;
    for (const t of cands) {
      const tn = norm(t);
      if (tn.length >= 4 && (tn.startsWith(n) || n.startsWith(tn))) hits.add(t);
    }
  }
  const ranked = [...hits].sort((a, b) => Number(leagueOf.get(b) === preferLeague) - Number(leagueOf.get(a) === preferLeague));
  if (ranked.length === 1 || (ranked.length > 1 && leagueOf.get(ranked[0]) === preferLeague && leagueOf.get(ranked[1]) !== preferLeague)) return ranked[0];
  // Forsta ordet ("Bayern Munchen" ~ "Bayern Munich")
  const first = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length >= 4)[0];
  const f = svsNames.map(first).find(Boolean);
  if (f) {
    const fh = cands.filter((t) => first(t) === f);
    if (fh.length === 1) return fh[0];
  }
  return null;
}

// ---------- Landslag: World Football Elo ----------
const ISO_TO_ELO = {
  ENG: 'EN', WAL: 'WA', SCO: 'SQ', NIR: 'EI', IRL: 'IE', DNK: 'DK', SWE: 'SE', NOR: 'NO', FIN: 'FI', ISL: 'IS',
  FRO: 'FO', DEU: 'DE', GER: 'DE', NLD: 'NL', BEL: 'BE', LUX: 'LU', FRA: 'FR', ESP: 'ES', PRT: 'PT', POR: 'PT',
  ITA: 'IT', AUT: 'AT', CHE: 'CH', SUI: 'CH', POL: 'PL', CZE: 'CZ', SVK: 'SK', HUN: 'HU', ROU: 'RO', BGR: 'BG',
  GRC: 'GR', GRE: 'GR', TUR: 'TR', SRB: 'RS', HRV: 'HR', CRO: 'HR', SVN: 'SI', BIH: 'BA', MNE: 'ME', MKD: 'NM',
  ALB: 'AL', XKX: 'KO', XXK: 'KO', KOS: 'KO', UKR: 'UA', BLR: 'BY', RUS: 'RU', MDA: 'MD', GEO: 'GE', ARM: 'AM', AZE: 'AZ',
  KAZ: 'KZ', ISR: 'IL', CYP: 'CY', MLT: 'MT', GIB: 'GI', AND: 'AD', SMR: 'SM', LIE: 'LI', EST: 'EE', LVA: 'LV',
  LTU: 'LT', BRA: 'BR', ARG: 'AR', URY: 'UY', COL: 'CO', CHL: 'CL', ECU: 'EC', PER: 'PE', PRY: 'PY', MEX: 'MX',
  USA: 'US', CAN: 'CA', JPN: 'JP', KOR: 'KR', AUS: 'AU', MAR: 'MA', SEN: 'SN', EGY: 'EG', NGA: 'NG', TUN: 'TN',
};

async function loadNationalElo() {
  try {
    const tsv = await get('https://www.eloratings.net/World.tsv', 'text');
    const map = new Map();
    for (const l of tsv.split(/\r?\n/)) {
      const c = l.split('\t');
      if (c[2] && c[3]) map.set(c[2], { rank: Number(c[0]), elo: Number(c[3]) });
    }
    return map;
  } catch (e) {
    log(`  Elo for landslag kunde inte hamtas: ${e.message}`);
    return new Map();
  }
}

// Elo-skillnad -> forvantat resultat -> malskillnad (Poisson med ~2,5 mal/match)
function eloToLambdas(eloH, eloA, homeAdv = 100) {
  const we = 1 / (10 ** (-(eloH + homeAdv - eloA) / 400) + 1);
  const T = 2.5;
  let lo = -2.4, hi = 2.4;
  for (let i = 0; i < 40; i++) {
    const s = (lo + hi) / 2;
    const m = scoreMatrix((T + s) / 2, (T - s) / 2);
    if (m.home + 0.5 * m.draw < we) lo = s; else hi = s;
  }
  const s = (lo + hi) / 2;
  return { lh: (T + s) / 2, la: (T - s) / 2, we };
}

// ---------- Lagprofil for analysknappen ----------
function teamProfile(team, model, all, cutoff) {
  const ms = all.filter((m) => m.date < cutoff && (m.home === team || m.away === team));
  const league = model.leagueOf.get(team);
  const season = ms.length ? ms[ms.length - 1].season : null;
  const cur = ms.filter((m) => m.season === season);
  const res = (m) => {
    const home = m.home === team;
    const gf = home ? m.hg : m.ag;
    const ga = home ? m.ag : m.hg;
    return { r: gf > ga ? 'V' : gf === ga ? 'O' : 'F', gf, ga, home, opp: home ? m.away : m.home, date: m.date,
      xgf: home ? m.hxg : m.axg, xga: home ? m.axg : m.hxg };
  };
  const last = ms.slice(-6).map(res);
  const rs = cur.map(res);
  const sum = (arr, f) => arr.reduce((s, x) => s + (f(x) ?? 0), 0);
  const split = (h) => {
    const a = rs.filter((x) => x.home === h);
    return { played: a.length, w: a.filter((x) => x.r === 'V').length, d: a.filter((x) => x.r === 'O').length,
      l: a.filter((x) => x.r === 'F').length, gf: sum(a, (x) => x.gf), ga: sum(a, (x) => x.ga) };
  };
  const withXg = rs.filter((x) => x.xgf != null);
  // Tabellplacering i aktuell liga/sasong
  const table = new Map();
  for (const m of all.filter((x) => x.date < cutoff && x.league === league && x.season === season)) {
    for (const [t, gf, ga] of [[m.home, m.hg, m.ag], [m.away, m.ag, m.hg]]) {
      const e = table.get(t) || { t, p: 0, pts: 0, gd: 0, gf: 0 };
      e.p++; e.gf += gf; e.gd += gf - ga; e.pts += gf > ga ? 3 : gf === ga ? 1 : 0;
      table.set(t, e);
    }
  }
  const sorted = [...table.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const pos = sorted.findIndex((e) => e.t === team) + 1;
  return {
    team, league, leagueName: LEAGUE_NAME[league] || league, season,
    position: pos || null, of: sorted.length || null,
    played: rs.length, points: sum(rs, (x) => (x.r === 'V' ? 3 : x.r === 'O' ? 1 : 0)),
    ppg: rs.length ? r2(sum(rs, (x) => (x.r === 'V' ? 3 : x.r === 'O' ? 1 : 0)) / rs.length) : null,
    gf: sum(rs, (x) => x.gf), ga: sum(rs, (x) => x.ga),
    xgfPg: withXg.length ? r2(sum(withXg, (x) => x.xgf) / withXg.length) : null,
    xgaPg: withXg.length ? r2(sum(withXg, (x) => x.xga) / withXg.length) : null,
    homeRecord: split(true), awayRecord: split(false),
    form: [...last].reverse().map((x) => x.r).join(''), // senaste forst
    last: [...last].reverse().map((x) => ({ date: x.date, opp: x.opp, venue: x.home ? 'H' : 'B', score: `${x.gf}-${x.ga}`, r: x.r })),
    attack: r2(model.att.get(team)), defence: r2(model.def.get(team)),
    sample: r2(model.wSum.get(team)),
  };
}

function h2h(home, away, all, cutoff) {
  return all.filter((m) => m.date < cutoff && ((m.home === home && m.away === away) || (m.home === away && m.away === home)))
    .slice(-5).reverse().map((m) => ({ date: m.date, home: m.home, away: m.away, score: `${m.hg}-${m.ag}` }));
}

// ---------- Analys per match ----------
const SIGNS = ['1', 'X', '2'];
const pctTxt = (p) => `${Math.round(p * 100)} %`;
const decTxt = (x) => Number(x).toFixed(2).replace('.', ',');

function marketProbs(ev) {
  const o = ev.odds || ev.startOdds;
  const v = o ? [num(o.one), num(o.x), num(o.two)] : [];
  if (v.length !== 3 || v.some((x) => !(x > 1))) return null;
  const inv = v.map((x) => 1 / x);
  const s = inv.reduce((a, b) => a + b, 0);
  return { p: inv.map((x) => x / s), odds: v, margin: r3(s - 1), source: ev.odds ? 'Svenska Spel' : 'Svenska Spel (startodds)' };
}

// Svenska Spels expertanalyser (CMS-innehall cnt:gameAnalysis) per omgang -> Map(eventNumber -> [{ author, signs, text }])
async function fetchExpertAnalyses(productId, drawNumber) {
  const url = `https://api.spela.svenskaspel.se/content/2/basicfilter?routesDomain=partner&contentType=cnt:gameAnalysis&count=100&channel=web`
    + `&matchAllDomainCategories=true&domainCategories=svs-domain-sport-draws/${drawNumber},svs-domain-products/${productId}`;
  const res = await get(url).catch(() => null);
  const byEvent = new Map();
  for (const r of res?.result || []) {
    const n = r.properties?.cnt_eventNumber;
    if (!n) continue;
    let signs = '';
    try {
      signs = (JSON.parse(r.properties.cnt_gamePrediction || '{}').prediction || [])
        .flatMap((p) => p.outcomes.map((o) => o.description)).join('');
    } catch { /* tips saknas */ }
    const text = String(r.body || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!byEvent.has(n)) byEvent.set(n, []);
    byEvent.get(n).push({ author: r.authorProfile?.authorLongName || r.authorProfile?.authorShortName || 'Svenska Spel', signs, text, published: r.published });
  }
  return byEvent;
}

function folkProbs(ev) {
  const f = ev.svenskaFolket;
  const v = f ? [num(f.one), num(f.x), num(f.two)] : [];
  if (v.length !== 3 || v.some((x) => x == null)) return null;
  const s = v.reduce((a, b) => a + b, 0) || 100;
  return v.map((x) => x / s);
}

function narrative(a) {
  const out = [];
  const [ph, pd, pa] = a.final;
  const H = a.home, A = a.away;
  const fav = ph >= pa ? H : A;
  const favP = Math.max(ph, pa);
  if (favP >= 0.6) out.push(`${fav} är klar favorit (${pctTxt(favP)}).`);
  else if (Math.abs(ph - pa) < 0.08) out.push(`Jämnt mellan lagen – ${H} ${pctTxt(ph)} mot ${A} ${pctTxt(pa)}.`);
  else out.push(`${fav} har ett övertag (${pctTxt(favP)}), men det är långt ifrån säkert.`);
  if (pd >= 0.29) out.push(`Krysset ligger högt (${pctTxt(pd)}) – oavgjort är ett rimligt utfall.`);
  const hp = a.homeProfile, ap = a.awayProfile;
  if (hp && ap) {
    if (hp.position && ap.position && hp.league === ap.league) {
      out.push(`Tabell: ${H} ${hp.position}:a, ${A} ${ap.position}:a i ${hp.leagueName} (${hp.points} mot ${ap.points} poäng).`);
    } else if (hp.league !== ap.league) {
      out.push(`Lagen spelade förra matcherna i olika serier (${hp.leagueName} / ${ap.leagueName}) – modellen jämför dem via uppflyttade/nedflyttade lag.`);
    }
    if (hp.form && ap.form) out.push(`Form senaste 6 (nyast först): ${H} ${hp.form.split('').join(' ')} · ${A} ${ap.form.split('').join(' ')}.`);
    const hr = hp.homeRecord, ar = ap.awayRecord;
    if (hr.played >= 2) out.push(`${H} hemma i år: ${hr.w}V ${hr.d}O ${hr.l}F, mål ${hr.gf}-${hr.ga}.`);
    if (ar.played >= 2) out.push(`${A} borta i år: ${ar.w}V ${ar.d}O ${ar.l}F, mål ${ar.gf}-${ar.ga}.`);
    if (hp.xgfPg != null && ap.xgfPg != null) {
      out.push(`xG per match: ${H} ${decTxt(hp.xgfPg)} skapat / ${decTxt(hp.xgaPg)} insläppt · ${A} ${decTxt(ap.xgfPg)} / ${decTxt(ap.xgaPg)}.`);
    }
  }
  if (a.elo) {
    out.push(`Landslags-Elo: ${H} ${a.elo.home} (#${a.elo.homeRank}) mot ${A} ${a.elo.away} (#${a.elo.awayRank}).`);
  }
  if (a.lambdas) out.push(`Förväntade mål ${decTxt(a.lambdas.home)} – ${decTxt(a.lambdas.away)}; troligast ${a.topScores.slice(0, 3).map((s) => s.score).join(', ')}.`);
  if (a.model && a.market) {
    const diffs = SIGNS.map((s, i) => ({ s, d: a.model[i] - a.market[i] })).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    if (Math.abs(diffs[0].d) >= 0.07) {
      out.push(`Modellen ${diffs[0].d > 0 ? 'tror mer' : 'tror mindre'} på ${diffs[0].s} än oddsen (${pctTxt(a.model[SIGNS.indexOf(diffs[0].s)])} mot ${pctTxt(a.market[SIGNS.indexOf(diffs[0].s)])}).`);
    }
  }
  if (a.folk) {
    const over = SIGNS.map((s, i) => ({ s, d: a.folk[i] - a.final[i] })).sort((x, y) => y.d - x.d)[0];
    const under = SIGNS.map((s, i) => ({ s, v: a.final[i] / Math.max(a.folk[i], 0.01) })).sort((x, y) => y.v - x.v)[0];
    if (over.d >= 0.08) out.push(`Svenska folket överstreckar ${over.s} (${pctTxt(a.folk[SIGNS.indexOf(over.s)])} mot vår ${pctTxt(a.final[SIGNS.indexOf(over.s)])}).`);
    if (under.v >= 1.2 && a.final[SIGNS.indexOf(under.s)] >= 0.15) out.push(`Streckvärde på ${under.s}: vi ${pctTxt(a.final[SIGNS.indexOf(under.s)])}, folket bara ${pctTxt(a.folk[SIGNS.indexOf(under.s)])}.`);
  }
  if (a.h2h?.length) out.push(`Inbördes (senaste ${a.h2h.length}): ${a.h2h.map((m) => `${m.home} ${m.score} ${m.away}`).join(' · ')}.`);
  if (a.basis === 'market') out.push('Ingen egen lagmodell för matchen – procenten bygger på Svenska Spels odds.');
  return out;
}

// Systemforslag: exakt optimering (DP over antal halv-/helgarderingar) av chansen till 13 ratt inom SYSTEM_MAX_ROWS
function buildSystem(events) {
  const picks = events.map((e) => {
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    return { order, n: 1 };
  });
  const cover = (i, n) => picks[i].order.slice(0, n).reduce((s, k) => s + events[i].final[k], 0);
  // dp: nyckel "h,f" -> { lp: summa log(tackning), ns: antal tecken per match }
  let dp = new Map([['0,0', { lp: 0, ns: [] }]]);
  picks.forEach((_, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f] = key.split(',').map(Number);
      for (const n of [1, 2, 3]) {
        const nh = h + (n === 2), nf = f + (n === 3);
        if (2 ** nh * 3 ** nf > SYSTEM_MAX_ROWS) continue;
        const lp = st.lp + Math.log(cover(i, n));
        const k = `${nh},${nf}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, ns: [...st.ns, n] });
      }
    }
    dp = next;
  });
  const bestState = [...dp.values()].reduce((a, b) => (b.lp > a.lp ? b : a));
  bestState.ns.forEach((n, i) => { picks[i].n = n; });
  const rows = () => picks.reduce((s, p) => s * p.n, 1);
  const hit = picks.reduce((s, p, i) => s * p.order.slice(0, p.n).reduce((a, k) => a + events[i].final[k], 0), 1);
  const single = events.reduce((s, e) => s * Math.max(...e.final), 1);
  return {
    maxRows: SYSTEM_MAX_ROWS, rows: rows(), hitAll: hit, hitSingle: single,
    picks: picks.map((p) => ({ signs: p.order.slice(0, p.n).sort().map((k) => SIGNS[k]).join(''), type: p.n === 1 ? 'Spik' : p.n === 2 ? 'Halvgardering' : 'Helgardering' })),
  };
}

async function analyzeDraw(product, draw, ctx, result) {
  const events = (draw.drawEvents || []).filter((e) => !e.cancelled);
  const cutoff = events.map((e) => e.match?.matchStart?.slice(0, 10)).filter(Boolean).sort()[0] || new Date().toISOString().slice(0, 10);
  const out = [];
  const experts = await fetchExpertAnalyses(draw.productId, draw.drawNumber);
  for (const ev of events) {
    const m = ev.match || {};
    const [hp, ap] = [m.participants?.find((p) => p.type === 'home'), m.participants?.find((p) => p.type === 'away')];
    const home = hp?.name?.trim() || ev.eventDescription.split(' - ')[0];
    const away = ap?.name?.trim() || ev.eventDescription.split(' - ')[1];
    const country = m.league?.country?.name;
    const group = COUNTRY_GROUP[country];
    const market = marketProbs(ev);
    const folk = folkProbs(ev);
    const a = {
      eventNumber: ev.eventNumber, home, away, league: m.league?.name || null, country,
      kickoff: m.matchStart || null, odds: market?.odds || null, marketSource: market?.source || null,
      market: market?.p || null, folk, model: null, basis: 'market', lambdas: null, topScores: [],
      over25: null, btts: null, homeProfile: null, awayProfile: null, h2h: [], elo: null, matched: null,
    };
    // Klubbmodell
    if (group) {
      const g = await ctx.group(group, cutoff);
      const prefer = LEAGUE_CODE[group]?.[m.league?.name] || null;
      const pool = new Set(g.model.att.keys());
      const fh = matchTeam([hp?.name, hp?.mediumName], pool, prefer, g.model.leagueOf);
      const fa = matchTeam([ap?.name, ap?.mediumName], pool, prefer, g.model.leagueOf);
      a.matched = { home: fh, away: fa };
      if (fh && fa) {
        const lh = g.model.h * g.model.att.get(fh) * g.model.def.get(fa);
        const la = g.model.att.get(fa) * g.model.def.get(fh);
        const sm = scoreMatrix(lh, la);
        a.model = [sm.home, sm.draw, sm.away];
        a.lambdas = { home: r2(lh), away: r2(la) };
        a.topScores = sm.topScores;
        a.over25 = r3(sm.over25);
        a.btts = r3(sm.btts);
        a.homeProfile = teamProfile(fh, g.model, g.all, cutoff);
        a.awayProfile = teamProfile(fa, g.model, g.all, cutoff);
        a.h2h = h2h(fh, fa, g.all, cutoff);
        a.thin = Math.min(g.model.wSum.get(fh), g.model.wSum.get(fa)) < 8;
        a.basis = 'club';
      }
    } else if (hp?.isoCode && ap?.isoCode && ctx.elo.size) {
      const eh = ctx.elo.get(ISO_TO_ELO[hp.isoCode] || hp.isoCode.slice(0, 2));
      const ea = ctx.elo.get(ISO_TO_ELO[ap.isoCode] || ap.isoCode.slice(0, 2));
      // Landskamp: hp.countryName = lagets land (klubblag har samma land som ligan)
      if (eh && ea && hp.countryName === home) {
        const { lh, la } = eloToLambdas(eh.elo, ea.elo);
        const sm = scoreMatrix(lh, la);
        a.model = [sm.home, sm.draw, sm.away];
        a.lambdas = { home: r2(lh), away: r2(la) };
        a.topScores = sm.topScores;
        a.over25 = r3(sm.over25);
        a.btts = r3(sm.btts);
        a.elo = { home: eh.elo, away: ea.elo, homeRank: eh.rank, awayRank: ea.rank };
        a.thin = true;
        a.basis = 'elo';
      }
    }
    // Blandning
    const wm = a.model ? (a.thin ? MODEL_W_THIN : MODEL_W) : 0;
    if (a.market && a.model) a.final = a.market.map((p, i) => (1 - wm) * p + wm * a.model[i]);
    else a.final = a.market || a.model || folk || [1 / 3, 1 / 3, 1 / 3];
    if (!a.market && !a.model) a.basis = folk ? 'folk' : 'none';
    a.modelWeight = wm;
    const order = [0, 1, 2].sort((x, y) => a.final[y] - a.final[x]);
    a.tip = SIGNS[order[0]];
    a.tipP = a.final[order[0]];
    // Varde: Svenska Spels odds pa vart tecken mot minsta odds for EV >= 3 %
    const minOdds = 1.03 / a.tipP;
    const book = a.odds ? a.odds[order[0]] : null;
    a.verdict = { sign: a.tip, minOdds: r2(minOdds), odds: book, value: book != null ? book >= minOdds : false };
    // Streckvarde per tecken = var sannolikhet / folkets andel
    a.streckvarde = folk ? SIGNS.map((s, i) => r2(a.final[i] / Math.max(folk[i], 0.01))) : null;
    a.final = a.final.map(r3);
    a.market = a.market?.map(r3) || null;
    a.model = a.model?.map(r3) || null;
    a.folk = a.folk?.map(r3) || null;
    // Mer fran Svenska Spel: expertanalyser, Tio tidningars tips, startodds (oddsrorelse)
    a.experts = experts.get(ev.eventNumber) || [];
    const tt = ev.tioTidningarsTips;
    a.tioTidningar = tt ? [tt.one, tt.x, tt.two].map((x) => Number(x) || 0) : null;
    const so = ev.startOdds ? [num(ev.startOdds.one), num(ev.startOdds.x), num(ev.startOdds.two)] : null;
    a.startOdds = so?.every((x) => x > 1) ? so : null;
    a.analysis = narrative({ ...a, final: a.final });
    // Facit (avgjord kupong)
    const r = result?.events?.find((x) => x.eventNumber === ev.eventNumber);
    if (r?.outcome) a.result = { outcome: r.outcome, score: r.outcomeScore ? `${r.outcomeScore.home}-${r.outcomeScore.away}` : null };
    out.push(a);
  }
  const system = out.length ? buildSystem(out) : null;
  if (system) out.forEach((a, i) => { a.systemPick = system.picks[i]; });
  return {
    product: product.id, productName: product.name, drawNumber: draw.drawNumber, state: draw.drawState,
    open: draw.drawState === 'Open', closeDescription: draw.regCloseDescription, regCloseTime: draw.regCloseTime,
    turnover: draw.currentNetSale, comment: draw.drawComment, modelCutoff: cutoff, events: out,
    system: system && { maxRows: system.maxRows, rows: system.rows, hitAll: system.hitAll, hitSingle: system.hitSingle },
    result: result ? {
      correct: out.filter((a) => a.result && a.result.outcome === a.tip).length,
      systemCorrect: out.filter((a) => a.result && a.systemPick?.signs.includes(a.result.outcome)).length,
      total: out.filter((a) => a.result).length,
      experts: [...new Set(out.flatMap((a) => a.experts.map((x) => x.author)))].map((author) => ({
        author,
        correct: out.filter((a) => a.result && a.experts.some((x) => x.author === author && x.signs.includes(a.result.outcome))).length,
        tipped: out.filter((a) => a.result && a.experts.some((x) => x.author === author)).length,
      })),
      distribution: (result.distribution || []).map((d) => ({ name: d.name, winners: d.winners, amount: d.amount })),
    } : null,
  };
}

async function latestDraw(product, prev) {
  // Oppen kupong forst
  const open = await get(`${API}/${product.id}/draws`).catch(() => null);
  if (open?.draws?.length) return { draw: open.draws[0], result: null };
  // Annars senaste avgjorda: gå uppåt fran senast kanda nummer
  let n = prev?.lastDrawNumber?.[product.id] || SEED_DRAW[product.id];
  let last = null;
  for (let tries = 0; tries < 30; tries++) {
    const d = await get(`${API}/${product.id}/draws/${n}`).catch(() => null);
    if (!d?.draw) break;
    last = d.draw;
    n++;
  }
  if (!last) {
    // Seed ligger efter verkligheten? Ga nedat
    n = (prev?.lastDrawNumber?.[product.id] || SEED_DRAW[product.id]) - 1;
    for (let tries = 0; tries < 10 && !last; tries++, n--) {
      const d = await get(`${API}/${product.id}/draws/${n}`).catch(() => null);
      if (d?.draw) last = d.draw;
    }
  }
  if (!last) return null;
  const result = await get(`${API}/${product.id}/draws/${last.drawNumber}/result`).then((r) => r.result || r).catch(() => null);
  return { draw: last, result: result?.events ? result : null };
}

async function main() {
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const groupCache = new Map();
  const ctx = {
    elo: await loadNationalElo(),
    async group(group, cutoff) {
      const key = `${group}|${cutoff}`;
      if (!groupCache.has(key)) {
        if (!groupCache.has(group)) groupCache.set(group, await loadGroup(group));
        const all = groupCache.get(group);
        groupCache.set(key, { all, model: fitModel(all, cutoff) });
      }
      return groupCache.get(key);
    },
  };
  const products = [];
  const lastDrawNumber = { ...(prev?.lastDrawNumber || {}) };
  for (const p of PRODUCTS) {
    log(`=== ${p.name} ===`);
    try {
      const got = await latestDraw(p, prev);
      if (!got) { log('  ingen kupong hittad'); continue; }
      lastDrawNumber[p.id] = got.draw.drawNumber;
      const a = await analyzeDraw(p, got.draw, ctx, got.result);
      if (!a.open) a.note = `Ingen öppen ${p.name}-kupong just nu – visar senaste omgången (${a.closeDescription}) med facit. Nästa kupong dyker upp här när Svenska Spel öppnar den.`;
      products.push(a);
      const club = a.events.filter((e) => e.basis === 'club').length;
      const elo = a.events.filter((e) => e.basis === 'elo').length;
      log(`  omgång ${a.drawNumber} (${a.state}): ${a.events.length} matcher, klubbmodell ${club}, landslags-Elo ${elo}`);
      for (const e of a.events.filter((x) => x.basis === 'market' && COUNTRY_GROUP[x.country])) {
        log(`  OBS lagnamn ej matchade: ${e.home} (${e.matched?.home ?? '?'}) - ${e.away} (${e.matched?.away ?? '?'})`);
      }
      log(`  expertanalyser: ${a.events.reduce((s, e) => s + e.experts.length, 0)}, tio tidningar: ${a.events.filter((e) => e.tioTidningar).length} matcher`);
      if (a.result) log(`  facit: ${a.result.correct}/${a.result.total} rätt på enkelrad, system ${a.result.systemCorrect}/${a.result.total}`);
      for (const x of a.result?.experts || []) log(`  expert ${x.author}: ${x.correct}/${x.tipped} rätt`);
    } catch (e) {
      log(`Fel ${p.name}: ${e.message}`);
    }
  }
  const out = {
    updatedAt: new Date().toISOString(),
    source: 'api.spela.svenskaspel.se + football-data.co.uk + eloratings.net',
    method: {
      blend: `Slutprocent = ${Math.round((1 - MODEL_W) * 100)} % Svenska Spels odds (utan marginal) + ${Math.round(MODEL_W * 100)} % egen modell (${Math.round(MODEL_W_THIN * 100)} % vid tunt underlag/landslag).`,
      club: 'Klubblag: viktad Poisson (anfall/försvar, hemmafördel, halveringstid 150 dagar, xG inblandat) per land; England skattas gemensamt över PL, Championship, League One och League Two.',
      national: 'Landslag: World Football Elo (eloratings.net) omräknat till förväntade mål.',
      value: 'Värde = Svenska Spels odds på tipset ≥ 1,03 / vår sannolikhet. Streckvärde = vår sannolikhet / Svenska folkets andel.',
    },
    lastDrawNumber,
    products,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  log(`Klart -> ${path.relative(root, OUT)}`);
}

main().catch((e) => {
  log(`Fel: ${e.stack || e.message}`);
  process.exit(1);
});
