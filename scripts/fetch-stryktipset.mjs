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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findSharpBook, devigMultiplicative } from './pro/lib.mjs';
import { fetchMatchContext, contextNotes } from './lib/match-context.mjs';
import { extraOdds, matchExtraOdds } from './lib/extra-odds.mjs';
import { clubEloFor } from './lib/club-elo.mjs';
import { fillXg } from './lib/understat-xg.mjs';
import { buildMissProfile, STRYK_LEAGUES } from './lib/stryk-miss-profile.mjs';
import { colorBands } from './lib/stryk-color-bands.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(root, 'data', 'raw');
const OUT = path.join(root, 'data', 'stryktipset.json');
const HIST_DIR = path.join(root, 'data', 'stryktips-history'); // sparade system per omgang + utfall
const API = 'https://api.spela.svenskaspel.se/draw/1';
const PRODUCTS = [
  { id: 'stryktipset', name: 'Stryktipset' },
  { id: 'europatipset', name: 'Europatipset' },
];
// Senast kanda omgangsnummer (for att hitta senaste avgjorda kupong nar ingen ar oppen)
const SEED_DRAW = { stryktipset: 4972, europatipset: 2611 };
// Hur mycket modellen vager mot Svenska Spels odds (marknaden ar skarpast; modellen fangar form/xG)
const MODEL_W = Number(process.env.STRYK_MODEL_W ?? 0.1); // backtest 17 omg (221 matcher): odds ensamma logloss 1,062 vs 1,065 med 35 % modell -> 10 %
const MODEL_W_THIN = Number(process.env.STRYK_MODEL_W_THIN ?? process.env.STRYK_MODEL_W ?? 0.1); // lite data (fa viktade matcher) eller landslag
// Reducerat system (Gambling Cabin-logik: grundrad -> farg-, teckenregler och utdelningsreducering)
const GRUND_MAX_ROWS = Number(process.env.STRYK_GRUND_MAX ?? 30000); // storsta grundrad som provas fore reducering
// Fasta teckenregler (minst antal 1-X-2 per rad, max alltid fullt): alltid minst 3 kryss
const signEnv = (v) => (v ? v.split('-').map(Number) : null); // STRYK_SIGN_A=4-3-2 m.m. for backtest
// A 4-2-2 (anvandarens beslut 2026-09-28 efter backtest: dubbelt system som delas, 4-2-2 gav hogst samlad chans till
// 13 ratt pa bada spelen: Europatipset 0,305 mot 0,227, Stryktipset 0,149 mot 0,116). B galler bara motsystemslaget.
const SIGN_MIN = { A: signEnv(process.env.STRYK_SIGN_A) || [4, 2, 2], B: signEnv(process.env.STRYK_SIGN_B) || [4, 3, 3] };
const BUDGET = { min: 350, max: 400 }; // kr per omgang (rader x radpris)
const COLOR = { green: 0.45, red: 0.2 }; // folkets streck: gron >= 45 %, rod <= 20 %, annars gul
// Skrall (rott tecken) i en gardering far finnas pa hogst 85 % av kupongens rader (anvandarens regel 2026-09-29).
// GC saknar regeln, sa den anvands vid valet av system (lanken ger samma rader). Samma som i gui/public/stryk-engine.js.
const RED_MAX_SHARE = 0.85;
// Favoriten i en gardering far aldrig ligga pa under 10 % av raderna, t.ex. X pa 90 % (anvandarens regel 2026-09-30).
// Ocksa en regel GC saknar: anvands vid valet av system, lanken ger samma rader.
const FAV_MIN_SHARE = Number(process.env.STRYK_FAV_MIN ?? 0.1);
// Hogst 4 spikar per kupong (anvandarens regel 2026-09-30)
const MAX_SPIKES = Number(process.env.STRYK_MAX_SPIKES ?? 4);
// Fargregler (antal grona/gula/roda tecken per rad i garderingarna, spikar ar rosa) ar aldrig 0-13 (anvandarens regel
// 2026-09-30): min/max provas upp till COLOR_TRIM steg in fran radernas spann och den kombination som ger hogst chans
// till 13 ratt inom budgeten valjs. Samma som i gui/public/stryk-engine.js.
const COLOR_TRIM = Number(process.env.STRYK_COLOR_TRIM ?? 2);
// Minsta bredd max - min per farg (2 = t.ex. 1-3, 5-7): anvandaren 2026-09-30 tyckte bredd 1 var for snav.
// Backtest (38 ST / 55 ET omg): ST bredd 2 -8 373 kr mot -8 771 med 1; ET +8 596 mot +24 712 med 1; bredd 3 samst i bada.
// Ar spannet smalare anvands hela spannet. STRYK_COLOR_WIDTH=99 = inga fargregler (hela spannet), for backtest.
const COLOR_WIDTH = Number(process.env.STRYK_COLOR_WIDTH ?? 2);
const PAYOUT_13 = 0.65 * 0.4; // 65 % aterbetalning, 40 % av potten till 13 ratt
// Minsta utdelning for 13 ratt (kr) per spel, anvandarens regel. Europatipset 20 000: backtest 55 omg (minst 3 topp 4-matcher)
// gav A +17 677 kr mot -14 134 vid 30 000 (bygger pa en enda 13-ratt, folj upp). STRYK_UTD_MIN overstyr i backtest.
const UTD_MIN_BY_PRODUCT = { stryktipset: 30000, europatipset: 20000 };
const utdMin = (productId) => Number(process.env.STRYK_UTD_MIN ?? UTD_MIN_BY_PRODUCT[productId] ?? 30000);
// Samma fasta omsattning som Gambling Cabin raknar utdelning med (sa radantalet blir identiskt dar)
const GC_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
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
// STRYK_SEASONS (t.ex. "2627,2526,2425") anvands av backtestet for aldre omgangar
const SEASONS = (process.env.STRYK_SEASONS || '2627,2526').split(',');
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
  // Pinnacles slutodds (annars snitt av slutodds) - anvands bara for spelade matcher, dvs i backtest
  const oddsCols = [['PSCH', 'PSCD', 'PSCA', 'Pinnacle slutodds'], ['AvgCH', 'AvgCD', 'AvgCA', 'snitt slutodds']].map(([h, d, a, src]) => ({ ix: [ix(h), ix(d), ix(a)], src }));
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
      closing: (() => { for (const o of oddsCols) { const v = o.ix.map((k) => (k >= 0 ? num(c[k]) : null)); if (v.every((x) => x > 1)) return { odds: v, src: o.src }; } return null; })(),
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
  await fillXg(all, log); // xG fran Understat dar CSV:n saknar det (2025/26 och aldre, topp 5)
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
    // Kommande landskamper med spelplatsens land (kolumn 7): skiljer den sig fran hemmalaget ar planen neutral
    map.venue = new Map();
    try {
      const fx = await get('https://www.eloratings.net/fixtures.tsv', 'text');
      for (const l of fx.split(/\r?\n/)) {
        const c = l.split('\t');
        if (c[3] && c[4] && c[6]) map.venue.set(`${c[3]}|${c[4]}`, c[6]);
      }
    } catch { /* bara vanlig hemmafordel */ }
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

// Kompakt kontext i sparade system (for senare backtest av franvaro/rotation)
function ctxSummary(cx) {
  if (!cx?.home) return null;
  const sd = (x) => x && { missing: x.unavailable.length, missingValueShare: x.missingValueShare, restDays: x.restDays, daysToNext: x.daysToNext, nextTournament: x.nextMatch?.tournament || null };
  return { lineupConfirmed: cx.lineupConfirmed, home: sd(cx.home), away: sd(cx.away), referee: cx.referee };
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

// Grundradskandidater: DP ger basta grundrad (hogst chans till 13 ratt) for varje antal halv-/helgarderingar.
// System A: troligaste tecknen per match. Motsystem B (singlesA satt): valfria tecken, men hogst MAX_SAME_SINGLES
// spikar med samma tecken som A; garderingar far overlappa.
const MAX_SAME_SINGLES = 1;
function grundCandidates(events, maxRows, singlesA = null) {
  const SUBSETS = [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  const options = (e) => {
    if (singlesA) return SUBSETS;
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    return [1, 2, 3].map((n) => order.slice(0, n).sort());
  };
  let dp = new Map([['0,0,0', { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f, same] = key.split(',').map(Number);
      for (const sub of options(e)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        const ns = same + (singlesA != null && sub.length === 1 && singlesA[i] === sub[0]);
        if (ns > MAX_SAME_SINGLES || 2 ** nh * 3 ** nf > maxRows) continue;
        const lp = st.lp + Math.log(sub.reduce((sum, k) => sum + e.final[k], 0));
        const k = `${nh},${nf},${singlesA ? ns : 0}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub] });
      }
    }
    dp = next;
  });
  // Antal spikar = 13 - halv - hel, sa gransen kan tas efter DP:n utan att basta grundrad per nyckel tappas
  return [...dp.values()].filter((st) => st.sets.filter((x) => x.length === 1).length <= MAX_SPIKES).map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: Math.exp(st.lp), sets: st.sets,
    picks: st.sets.map((x) => ({ signs: x.map((k) => SIGNS[k]).join(''), type: x.length === 1 ? 'Spik' : x.length === 2 ? 'Halvgardering' : 'Helgardering' })),
  }));
}

function signColor(folkP) {
  if (folkP == null) return 'yellow';
  return folkP >= COLOR.green ? 'green' : folkP <= COLOR.red ? 'red' : 'yellow';
}

// Fargregler. all = rader sorterade pa utdelning (hogst forst), r.c = [grona, gula, roda] over alla 13 matcher.
// Med band (scripts/lib/stryk-color-bands.mjs, ratt rad senaste aret, bara Stryktipset): 'outer' = min/max aldrig utanfor
// det som hant, optimeras fritt dar; 'core' (bara backtest) = min <= p10 och max >= p90. Roda: max RED_MAX_OPTIONS
// (anvandaren 2026-09-30: snittet ar 1,9, men 3-4 roda ger de stora vinsterna). Utan band: hogst COLOR_TRIM steg in.
// Kombinationerna rangordnas efter chansen i de `target` forsta raderna som klarar reglerna; vid lika vinner snavast.
const COLOR_KEYS = ['green', 'yellow', 'red'];
// Rorliga fargfonster per omgang (anvandaren 2026-09-30: inte fasta, inte snava). Vantat antal grona/gula/roda i ratt
// rad = summan av vara procent for tecknen med den fargen (alla 13 matcher). Fonstret for hela raden har bredd DYN_WIDTHS
// (4 = t.ex. 5-9, fem mojliga antal) och innehaller alltid det vantade antalet. Spikar ar rosa i GC och raknas inte dar,
// sa spikarnas farger dras av (3 grona spikar: 5-9 -> 2-6 i garderingarna); rosa = antal spikar. Fonstren rangordnas
// efter chansen som ovan. Gar inget fonster att halla optimeras fargerna fritt (colorTarget: false).
// STRYK_COLOR_TARGET=0 stanger av, STRYK_DYN_W="3,4" styr bredderna (backtest).
const COLOR_TARGET = process.env.STRYK_COLOR_TARGET !== '0';
const DYN_WIDTHS = (process.env.STRYK_DYN_W || '3,4').split(',').map(Number);
function colorExpected(events, colors) {
  const exp = [0, 0, 0];
  events.forEach((e, i) => [0, 1, 2].forEach((k) => { exp[COLOR_KEYS.indexOf(colors[i][k])] += e.final[k]; }));
  return exp;
}
function dynamicRanges(events, grund, colors) {
  const spik = [0, 0, 0];
  grund.sets.forEach((set, i) => { if (set.length === 1) spik[COLOR_KEYS.indexOf(colors[i][set[0]])]++; });
  const exp = colorExpected(events, colors);
  return [0, 1, 2].map((c) => {
    const out = new Map();
    for (const w of DYN_WIDTHS) {
      for (let a = Math.max(0, Math.ceil(exp[c] - w)); a <= Math.floor(exp[c]); a++) {
        const ga = Math.max(0, a - spik[c]), gb = a + w - spik[c];
        if (gb >= 0) out.set(`${ga},${gb}`, [ga, gb]);
      }
    }
    return [...out.values()];
  });
}
// Backtest 2026-09-30 (38 omg): max 4 roda gav -8 771 kr mot -19 356 med 3 (optimeraren valjer annars alltid 3).
const RED_MAX_OPTIONS = (process.env.STRYK_RED_MAX || '4').split(',').map(Number);
const USE_BANDS = process.env.STRYK_COLOR_BANDS !== '0';
const BANDS_FOR = new Set((process.env.STRYK_BANDS_FOR || 'stryktipset').split(','));
const BAND_MODE = process.env.STRYK_BAND_MODE || 'outer'; // 'core' = min <= p10 och max >= p90, 'outer' = bara inom min-max
function colorRuleOptions(all, minRows, target, bands = null, fixed = null) {
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const r of all) for (let c = 0; c < 3; c++) { if (r.c[c] < lo[c]) lo[c] = r.c[c]; if (r.c[c] > hi[c]) hi[c] = r.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    const w = Math.min(COLOR_WIDTH, hi[c] - lo[c]);
    const band = USE_BANDS ? bands?.[COLOR_KEYS[c]] : null;
    if (band && BAND_MODE === 'outer') {
      // Historiken som yttre grans: min/max inom det som hant, optimeras fritt dar (roda: max RED_MAX_OPTIONS)
      const l = Math.min(Math.max(band.range[0], lo[c]), hi[c]), h = Math.max(Math.min(band.range[1], hi[c]), l);
      const his = COLOR_KEYS[c] === 'red' ? [...new Set(RED_MAX_OPTIONS.map((m) => Math.min(Math.max(m, l), h)))] : null;
      for (let a = l; a <= Math.min(l + COLOR_TRIM, h); a++) {
        for (const b of his || Array.from({ length: Math.min(COLOR_TRIM, h - l) + 1 }, (_, j) => h - j)) if (b - a >= Math.min(w, h - l)) out.push([a, b]);
      }
      if (out.length) return out;
    }
    if (band && BAND_MODE === 'core') {
      const clamp = (x) => Math.min(Math.max(x, lo[c]), hi[c]);
      const los = [], his = new Set();
      for (let a = clamp(band.range[0]); a <= clamp(band.core[0]); a++) los.push(a);
      if (COLOR_KEYS[c] === 'red') for (const m of RED_MAX_OPTIONS) his.add(clamp(Math.max(m, band.core[1])));
      else for (let b = clamp(band.core[1]); b <= clamp(band.range[1]); b++) his.add(b);
      for (const a of los) for (const b of his) if (b - a >= w) out.push([a, b]);
      if (out.length) return out;
    }
    for (let a = lo[c]; a <= Math.min(lo[c] + COLOR_TRIM, hi[c]); a++) for (let b = Math.max(hi[c] - COLOR_TRIM, a + w); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  for (const g of ranges[0]) for (const y of ranges[1]) for (const rd of ranges[2]) {
    let n = 0, sum = 0;
    for (const r of all) {
      if (r.c[0] < g[0] || r.c[0] > g[1] || r.c[1] < y[0] || r.c[1] > y[1] || r.c[2] < rd[0] || r.c[2] > rd[1]) continue;
      sum += r.p;
      if (++n >= target) break;
    }
    if (n >= minRows) opts.push({ rule: [g, y, rd], score: sum, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => b.score - a.score || a.width - b.width);
}
const fitsColors = (c, rule) => rule.every(([a, b], k) => c[k] >= a && c[k] <= b);

// Reducera en grundrad till BUDGET med regler som gar att aterskapa exakt i Gambling Cabins verktyg:
//   tecken 1/X/2: fast minimum per system (A 5-3-2, B 4-3-3), max alltid fullt
//   farger gron/gul/rod: min/max per rad over alla 13 matcher, byggt pa fargbanden (colorRuleOptions)
//   utdelning 13 ratt >= payoutMin (per spel, se UTD_MIN_BY_PRODUCT; GC:s formel: 26 % x omsattning / (omsattning x radens streck + 1), fast omsattning per spel);
//   gransen hojs vid behov (jamnt belopp) tills radantalet ryms i budgeten.
// Utdelningsgransen payoutMin galler VERKLIG utdelning: (26 % x verklig omsattning + jackpot) / (omsattning x streck + 1).
// Kalibrerad mot facit 2025/26: vinnarformeln stammer (faktiska/forvantade vinnare median 1,06) men potten var
// > 26 % i halften av omgangarna (jackpot/overforda pengar). Gransen oversatts till GC:s formel (fast omsattning)
// sa att Gambling Cabin-lanken ger samma rader: bada ar avtagande i radens streckprodukt f.
// Antagande (verifiera forsta gangen en oppen omgang har jackpot): GC raknar in jackpotten i sin pott, eftersom verktyget
// skickar med den (jp) till sin berakning. Radurvalet paverkas inte av antagandet, bara gransens siffra i lanken.
function gcPayoutFloor(gcTurnover, realTurnover, jackpot, payoutMin) {
  const fStar = ((PAYOUT_13 * realTurnover + (jackpot || 0)) / payoutMin - 1) / realTurnover;
  return fStar > 0 ? (PAYOUT_13 * gcTurnover + (jackpot || 0)) / (1 + gcTurnover * fStar) : Infinity;
}

function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin = 30000, budget = BUDGET, redMax = RED_MAX_SHARE, colorBands = null, colorTarget = true }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const colors = events.map((e) => [0, 1, 2].map((k) => signColor(e.folk?.[k])));
  const T = turnover;
  const floor = gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  const all = [];
  const cc = [0, 0, 0]; // grona/gula/roda tecken i garderingarna (spikar ar rosa i GC)
  const walk = (i, row, p, f) => {
    if (i === events.length) {
      const payout = (PAYOUT_13 * T + jackpot) / (1 + T * f); // GC:s formel
      const real = (PAYOUT_13 * realTurnover + jackpot) / (1 + realTurnover * f);
      if (payout >= floor && [0, 1, 2].every((k) => row.filter((x) => x === k).length >= signMin[k])) all.push({ row: [...row], p, payout, real, c: cc.slice() });
      return;
    }
    for (const k of grund.sets[i]) {
      const ci = grund.sets[i].length > 1 ? COLOR_KEYS.indexOf(colors[i][k]) : -1;
      row.push(k); if (ci >= 0) cc[ci]++;
      walk(i + 1, row, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]));
      row.pop(); if (ci >= 0) cc[ci]--;
    }
  };
  walk(0, [], 1, 1);
  if (all.length < minRows) return null;
  all.sort((a, b) => b.payout - a.payout);
  // Fargreglerna: basta kombinationen dar utdelningsgransen gar att lagga, annars nasta
  const spikes = grund.sets.filter((x) => x.length === 1).length;
  const target = colorTarget && COLOR_TARGET ? dynamicRanges(events, grund, colors) : null;
  if (target && target.some((x) => !x.length)) return null;
  // Reserv utan mal: fri optimering (banden raknar hela raden och passar inte nar spikarna ar rosa)
  const options = colorRuleOptions(all, minRows, Math.round((minRows + maxRows) / 2), null, target);
  for (const opt of options) {
    const res = cutSystem(all.filter((r) => fitsColors(r.c, opt.rule)), floor, minRows, maxRows, grund, colors, redMax, events);
    if (!res) continue;
    const { cut, kept } = res;
    const hit = kept.reduce((sum, r) => sum + r.p, 0);
    const ev = kept.reduce((sum, r) => sum + r.p * r.real, 0);
    kept.sort((a, b) => b.p - a.p);
    return {
      grundRows: grund.rows, afterPayout: all.length, rows: kept.length, cost: kept.length * rowPrice, rowPrice,
      hitAll: hit, grundHit: grund.hitAll, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: {
        payoutMin: cut.t, payoutMinReal: payoutMin, jackpot, realTurnover, signMin, colorGreen: COLOR.green, colorRed: COLOR.red, turnover: T,
        colorRules: { green: opt.rule[0], yellow: opt.rule[1], red: opt.rule[2], pink: [spikes, spikes] }, colorTarget: Boolean(target),
        colorExpected: colorExpected(events, colors).map((x) => Math.round(x * 10) / 10), // vantat antal i ratt rad (hela raden)
      },
      colors: colors.map((c) => c.join(',')),
      rowList: kept.map((r) => r.row.map((k) => SIGNS[k]).join('')),
      rowP: kept.map((r) => r.p), rowReal: kept.map((r) => r.real), rowPayout: kept.map((r) => r.payout), // for A+B-optimering/delning (skrivs inte till JSON)
    };
  }
  return null;
}

// Utdelningsgransen pa raderna som klarar tecken- och fargreglerna (all sorterad pa utdelning, hogst forst)
function cutSystem(all, floor, minRows, maxRows, grund, colors, redMax, events) {
  if (all.length < minRows) return null;
  // Radantalet laggs sa nara mitten av budgeten som mojligt (2026-09-29): GC raknar med aktuella streck, och ett streck
  // som andrades fran 27 till 26 % efter hamtningen gav 394 -> 404 rader. Mitten ger marginal at bada hallen.
  let cut = null;
  if (all.length >= minRows && all.length <= maxRows && all[all.length - 1].payout >= floor * 1.02) cut = { n: all.length, t: Math.ceil(floor) };
  const midN = Math.round((minRows + maxRows) / 2);
  for (const win of [Math.round((maxRows - minRows) / 5), maxRows - midN]) {
    for (const gap of [1.02, 1.01, 1.003, 1]) {
      for (let d = 0; d <= win && !cut; d++) {
        for (const n of d ? [midN - d, midN + d] : [midN]) {
          if (cut || n < minRows || n > maxRows || n >= all.length) continue;
          const above = all[n - 1].payout, below = all[n].payout;
          if (above < below * gap) continue;
          const mid = Math.sqrt(above * below);
          for (const step of [5000, 1000, 500, 100, 10, 1]) {
            const t = Math.round(mid / step) * step;
            if (t <= above / Math.sqrt(gap) && t >= below * Math.sqrt(gap) && t >= floor) { cut = { n, t }; break; }
          }
        }
      }
      if (cut) break;
    }
    if (cut) break;
  }
  if (!cut) return null;
  const kept = all.slice(0, cut.n);
  // Skrall (rott tecken) i en gardering pa hogst RED_MAX_SHARE av raderna, annars valjs ett annat system
  if (redMax < 1 && !grund.sets.every((set, i) => set.length < 2 || set.every((k) => colors[i][k] !== 'red' || kept.filter((r) => r.row[i] === k).length <= redMax * kept.length))) return null;
  // Favoriten (troligaste tecknet) i en gardering pa minst FAV_MIN_SHARE av raderna (galler tillsammans med skrallgransen)
  if (redMax < 1 && !grund.sets.every((set, i) => { if (set.length < 2) return true; const fav = set.reduce((b, k) => (events[i].final[k] > events[i].final[b] ? k : b)); return kept.filter((r) => r.row[i] === fav).length >= FAV_MIN_SHARE * kept.length; })) return null;
  return { cut, kept };
}

// Basta reducerade system over alla grundradskandidater (hogst chans till 13 ratt)
// Mal for valet av grundrad/grans: 'hit' = hogst chans till 13 ratt, 'ev' = hogst forvantad aterbetalning (chans x utdelning)
const OBJECTIVE = process.env.STRYK_OBJECTIVE || 'hit';
// B byggs tillsammans med A: B valjs sa att paret tacker mest (rader som redan finns i A raknas inte) - STRYK_B_JOINT=0 stanger av
const B_JOINT = process.env.STRYK_B_JOINT !== '0';
// Fargmalen slapps forst, skrall- och favoritregeln sist (favoriten ska aldrig under 10 %, anvandarens regel)
function bestReduced(events, candidates, opts, exclude = null) {
  const target = opts.colorTarget !== false && COLOR_TARGET;
  const red = (opts.redMax ?? RED_MAX_SHARE) < 1;
  const ladder = [[target, red], [false, red], [target, false], [false, false]].filter(([t, r], i, a) => a.findIndex(([t2, r2]) => t2 === t && r2 === r) === i);
  for (const [t, r] of ladder) {
    const best = bestReducedOnce(events, candidates, { ...opts, colorTarget: Boolean(t), redMax: r ? (opts.redMax ?? RED_MAX_SHARE) : 1 }, exclude);
    if (best) return best;
  }
  return null;
}
function bestReducedOnce(events, candidates, opts, exclude = null) {
  const score = (red) => red.rowList.reduce((sum, row, i) => (exclude?.has(row) ? sum : sum + (OBJECTIVE === 'ev' ? red.rowP[i] * red.rowReal[i] : red.rowP[i])), 0);
  let best = null;
  for (const g of candidates) {
    if (g.rows < (opts.budget || BUDGET).min) continue;
    const red = reduceSystem(events, g, opts);
    if (!red) continue;
    // Delat system: bada halvorna maste klara skrall- och favoritregeln var for sig
    const redMax = opts.redMax ?? RED_MAX_SHARE;
    const pair = opts.split ? splitReduced(red, redMax < 1 ? (rows) => sharesOk(events, g.sets, rows, redMax) : null) : null;
    if (opts.split && !pair) continue;
    const sc = score(red);
    if (!best || sc > best.score) best = { system: g, reduced: red, score: sc, pair };
  }
  return best;
}

// Varde per omgang: forvantad aterbetalning fran 13 ratt / insats (system A). Nivaer fran backtest 2025/26
// (33 omg): p25 0,26, median 0,33, p75 0,40. Lagt varde -> skrivs ut, men raderna skapas anda (anvandarens val).
const VALUE_LEVELS = { low: 0.26, high: 0.40 };
function drawValue(red, jackpot) {
  if (!red?.cost) return null;
  const ratio = red.expectedReturn / red.cost;
  const level = ratio <= VALUE_LEVELS.low ? 'low' : ratio >= VALUE_LEVELS.high ? 'high' : 'normal';
  const pctTxt = `${Math.round(ratio * 100)} %`;
  const text = level === 'low'
    ? `Omgången saknar värde: förväntad återbetalning från 13 rätt ≈ ${pctTxt} av insatsen (normalt 26–40 %). Raderna är ändå skapade.`
    : level === 'high'
      ? `Omgången har högt värde: förväntad återbetalning från 13 rätt ≈ ${pctTxt} av insatsen (normalt 26–40 %)${jackpot > 0 ? ' – jackpot ingår' : ''}.`
      : `Normalt värde: förväntad återbetalning från 13 rätt ≈ ${pctTxt} av insatsen (normalt 26–40 %).`;
  return { ratio: r3(ratio), level, text };
}

// B-lage: 'split' = ett system pa 2 x budget (700-800 rader) som delas i tva kuponger efter utdelning:
// A = raderna med hogst utdelning (>= t_mid), B = resten (utdelning mellan A:s grans och t_mid). Bada gar att
// aterskapa i Gambling Cabin (samma grundrad, utdelningsintervall). 'counter' = gamla motsystemet (hogst 1 gemensam spik).
// Expertgranskning 2026-09-28: B som motsystem gav farre vantade 13 ratt an A:s nasta rader.
const B_MODE = process.env.STRYK_B_MODE || 'split';
// Skrall (rott tecken) pa hogst redMax och favoriten pa minst FAV_MIN_SHARE av raderna, per gardering
function sharesOk(events, sets, rowList, redMax) {
  return sets.every((set, i) => {
    if (set.length < 2) return true;
    const share = (k) => rowList.filter((r) => r[i] === SIGNS[k]).length / rowList.length;
    const fav = set.reduce((b, k) => (events[i].final[k] > events[i].final[b] ? k : b));
    return share(fav) >= FAV_MIN_SHARE && set.every((k) => signColor(events[i].folk?.[k]) !== 'red' || share(k) <= redMax);
  });
}
function splitReduced(red, ok = null) {
  const n = red.rows;
  const idx = red.rowList.map((_, i) => i).sort((a, b) => red.rowPayout[b] - red.rowPayout[a]);
  const minRows = Math.ceil(BUDGET.min / red.rowPrice), maxRows = Math.floor(BUDGET.max / red.rowPrice);
  const lo = Math.max(minRows, n - maxRows), hi = Math.min(maxRows, n - minRows);
  let cut = null;
  for (const gap of [1.02, 1.01, 1.003, 1]) {
    for (let k = Math.round(n / 2), d = 0; !cut && (k - d >= lo || k + d <= hi); d++) {
      for (const kk of d ? [k - d, k + d] : [k]) {
        if (cut || kk < lo || kk > hi) continue;
        const above = red.rowPayout[idx[kk - 1]], below = red.rowPayout[idx[kk]];
        if (above < below * gap) continue;
        const mid = Math.sqrt(above * below);
        for (const step of [5000, 1000, 500, 100, 10, 1]) {
          const t = Math.round(mid / step) * step;
          if (t <= above / Math.sqrt(gap) && t > below * Math.sqrt(gap)) {
            if (!ok || (ok(idx.slice(0, kk).map((i) => red.rowList[i])) && ok(idx.slice(kk).map((i) => red.rowList[i])))) cut = { k: kk, t };
            break;
          }
        }
      }
    }
    if (cut) break;
  }
  if (!cut) return null;
  const part = (ids, payoutMin, payoutMax) => {
    const sel = ids.slice().sort((a, b) => red.rowP[b] - red.rowP[a]);
    const hit = sel.reduce((sum, i) => sum + red.rowP[i], 0);
    const ev = sel.reduce((sum, i) => sum + red.rowP[i] * red.rowReal[i], 0);
    return {
      ...red, rows: sel.length, cost: sel.length * red.rowPrice, hitAll: hit, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: { ...red.rules, payoutMin, payoutMax }, split: true,
      rowList: sel.map((i) => red.rowList[i]), rowP: sel.map((i) => red.rowP[i]), rowReal: sel.map((i) => red.rowReal[i]), rowPayout: sel.map((i) => red.rowPayout[i]),
    };
  };
  return [part(idx.slice(0, cut.k), cut.t, null), part(idx.slice(cut.k), red.rules.payoutMin, cut.t - 1)];
}

// A+B tillsammans: chans att nagot av systemen tar 13 ratt, och hur manga rader som finns i bada
function pairStats(a, b) {
  if (!a || !b) return {};
  const setA = new Set(a.rowList);
  let extra = 0, overlap = 0;
  b.rowList.forEach((row, i) => { if (setA.has(row)) overlap++; else extra += b.rowP[i]; });
  return { unionHit: a.hitAll + extra, overlapRows: overlap };
}

// Forifylld lank till Gambling Cabins reduceringsverktyg (samma grundrad, farger och regler).
// Tecken: 0 = spelas inte, 2 = gul, 3 = rod, 4 = gron, 5 = rosa (spik) (bara visning). Regler: [aktiv, min, max].
function gamblingCabinUrl(productId, drawNumber, closeDate, events, sets, reduced) {
  const colorId = { yellow: 2, red: 3, green: 4 };
  // Spikar (ett tecken) rosa (5), annars farg efter folkets streck. Fargreglerna raknar garderingarna, rosa = antal spikar.
  const col = (k) => events.map((e, i) => (!sets[i].includes(k) ? 0 : sets[i].length === 1 ? 5 : colorId[e.colors[k]])).join(',');
  const r = reduced.rules;
  const cr = (c) => (r.colorRules?.[c] ? `1,${r.colorRules[c][0]},${r.colorRules[c][1]}` : '0,0,13');
  const q = [
    `spel=${productId}`, `omg=${drawNumber}`, `datum=${closeDate}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${r.signMin[0]},13,${r.signMin[1]},13,${r.signMin[2]},13`,
    `yellow=${cr('yellow')}`, `red=${cr('red')}`, `green=${cr('green')}`, `pink=${cr('pink')}`,
    `utd=1,${r.payoutMin},${r.payoutMax ?? 100000000}`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join('&')}`;
}

// ---------- Startelvor/franvaro: samma data och logik som Oddset ----------
// Oddset (scripts/pro-layer.mjs) raknar per match: bekraftad ESPN-elva (PL/Championship, ~1 h fore avspark) eller
// FPL-skador (PL), saknad andel av lagets anfall (xG+xA) och en anfallsfaktor med vikten alpha som Oddsets backtest
// valjer (data/reports/pro-evaluation.json). Stryktipset laser samma rader ur data/tips-latest.json och anvander
// samma faktor pa lagmodellens mal - alpha 0 betyder att elvan visas men inte flyttar procenten (oddsen gor det).
const TIPS_FILE = path.join(root, 'data', 'tips-latest.json');
let oddsetRows = null;
function oddsetAvailability(leagueCode, date, homeFd, awayFd) {
  if (oddsetRows === null) {
    try {
      const t = JSON.parse(fs.readFileSync(TIPS_FILE, 'utf8'));
      oddsetRows = [...(t.allCandidates || []), ...(t.bestUpcoming || [])].filter((x) => x.pro?.availability || x.lineupStatus);
    } catch { oddsetRows = []; }
  }
  if (!leagueCode || !date || !homeFd || !awayFd) return null;
  const norm = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const same = (a, b) => { const x = norm(a), y = norm(b); return x && y && (x === y || x.includes(y) || y.includes(x)); };
  const day = (d) => Date.parse(String(d).slice(0, 10));
  const row = oddsetRows.find((x) => x.league === leagueCode && Math.abs(day(x.date) - day(date)) <= 86400e3
    && same(x.home, homeFd) && same(x.away, awayFd));
  if (!row) return null;
  const av = row.pro?.availability;
  const side = (x) => x && {
    source: x.source, missingShare: x.missingShare ?? 0, typicalMissing: x.typicalMissing ?? null, attackFactor: x.attackFactor ?? 1,
    players: (x.players || []).map((pl) => ({ name: pl.name, share: pl.share, weight: pl.weight, reason: pl.reason })),
    topPlayers: x.topPlayers || [],
  };
  return {
    status: row.lineupStatus || null, alpha: av?.alpha ?? 0, home: side(av?.home), away: side(av?.away),
    notes: [...(row.lineupNotes || []), ...(row.availabilityNotes || [])],
  };
}

// ---------- Skarpa odds (samma kalla och kontroll som Oddset) ----------
// Backtest: Pinnacles slutodds ur football-data (finns bara for spelade matcher -> kan aldrig lacka in live).
// Live: Pinnacle/Betfair ur data/open/upcoming_odds.json via findSharpBook (Oddsets kvalitetskontroll),
// annars snitt av minst 3 bolag. Saknas allt anvands Svenska Spels odds. STRYK_MARKET=svs stanger av (jamforelse).
const MARKET_MODE = process.env.STRYK_MARKET || 'sharp';
const FRESH_ODDS = process.env.STRYK_FRESH_ODDS === '1';
let liveOdds = null;
function sharpMarket(g, leagueCode, date, fh, fa) {
  if (MARKET_MODE === 'svs' || !fh || !fa || !date) return null;
  const day = (d) => Date.parse(String(d).slice(0, 10));
  const played = g.all.find((x) => x.home === fh && x.away === fa && Math.abs(day(x.date) - day(date)) <= 2 * 86400e3 && x.closing);
  if (played) return { p: devigMultiplicative(played.closing.odds), odds: played.closing.odds, source: played.closing.src };
  if (liveOdds === null) {
    try { liveOdds = JSON.parse(fs.readFileSync(path.join(root, 'data', 'open', 'upcoming_odds.json'), 'utf8')).events || []; } catch { liveOdds = []; }
  }
  const norm = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(fc|afc|city|town|united|utd)/g, '').replace(/[^a-z0-9]/g, '');
  const same = (a, b) => { const x = norm(a), y = norm(b); return x.length > 2 && y.length > 2 && (x === y || x.includes(y) || y.includes(x)); };
  const ev = liveOdds.find((e) => (!leagueCode || e.league === leagueCode) && Math.abs(day(e.commence) - day(date)) <= 86400e3
    && (same(e.home, fh) || same(e.homeRaw, fh)) && (same(e.away, fa) || same(e.awayRaw, fa)));
  if (!ev) return null;
  const books = ev.books || [];
  const sharp = findSharpBook(books);
  if (sharp) return { p: devigMultiplicative([sharp.home, sharp.draw, sharp.away]), odds: [sharp.home, sharp.draw, sharp.away], source: sharp.bookmaker || sharp.key };
  const ps = books.map((b) => devigMultiplicative([b.home, b.draw, b.away])).filter(Boolean);
  if (ps.length < 3) return null;
  return { p: [0, 1, 2].map((i) => ps.reduce((sum, x) => sum + x[i], 0) / ps.length), odds: null, source: `snitt ${ps.length} bolag` };
}

let jackpotCache = null;
async function fetchJackpot(productId, drawNumber) {
  if (jackpotCache === null) jackpotCache = await get(`${API}/jackpots`).then((r) => r.jackpots || []).catch(() => []);
  const j = jackpotCache.find((x) => x.productId === productId && x.drawNumber === drawNumber);
  return (j?.jackpots || []).reduce((sum, x) => sum + (num(x.jackpotAmount) || 0), 0);
}

async function analyzeDraw(product, draw, ctx, result) {
  const events = (draw.drawEvents || []).filter((e) => !e.cancelled);
  const cutoff = events.map((e) => e.match?.matchStart?.slice(0, 10)).filter(Boolean).sort()[0] || new Date().toISOString().slice(0, 10);
  const out = [];
  const experts = await fetchExpertAnalyses(draw.productId, draw.drawNumber);
  // Matchkontext fran FotMob (elva, franvaro, vila/rotation, domare) for oppna omgangar, bade Stryktipset och
  // Europatipset. Visas och sparas; flyttar inte procenten (oddsen ar skarpare). STRYK_CONTEXT=0 stanger av.
  const matchCtx = new Map();
  // Klubb-Elo (clubelo.com) for klubbmatcher utan egen lagmodell (Europacup, nordiska ligor), bara oppna omgangar
  // (dagens Elo skulle lacka framtid i backtest)
  const sameCountryName = (a, b) => [a, b].map((x) => String(x || '').toLowerCase().replace(/&/g, 'och').replace(/[^a-zåäöéü]+/g, '')).reduce((x, y) => x === y);
  const clubTeams = draw.drawState === 'Open' ? events.filter((e) => !COUNTRY_GROUP[e.match?.league?.country?.name])
    .flatMap((e) => (e.match?.participants || []).filter((pt) => pt.isoCode && !sameCountryName(pt.countryName, pt.name)).map((pt) => ({ isoCode: pt.isoCode, name: pt.name.trim() }))) : [];
  const clubElo = clubTeams.length ? await clubEloFor(clubTeams, log).catch(() => new Map()) : new Map();
  // Skarpa odds for landskamper/Europacup/nordiska ligor/cuper (The Odds API), bara oppna omgangar
  const extraCache = draw.drawState === 'Open' && MARKET_MODE !== 'svs'
    ? await extraOdds(events.filter((e) => FRESH_ODDS || !COUNTRY_GROUP[e.match?.league?.country?.name]).map((e) => e.match?.league?.name), log).catch(() => null)
    : null;
  if (draw.drawState === 'Open' && process.env.STRYK_CONTEXT !== '0') {
    for (let i = 0; i < events.length; i += 4) {
      await Promise.all(events.slice(i, i + 4).map(async (ev) => {
        const m = ev.match || {};
        const [hp, ap] = [m.participants?.find((p) => p.type === 'home'), m.participants?.find((p) => p.type === 'away')];
        const cx = await fetchMatchContext({ kickoff: m.matchStart, home: hp?.name || ev.eventDescription.split(' - ')[0], away: ap?.name || ev.eventDescription.split(' - ')[1], homeCountry: hp?.countryName, awayCountry: ap?.countryName }).catch(() => null);
        if (cx) matchCtx.set(ev.eventNumber, cx);
      }));
    }
    log(`  FotMob-kontext: ${matchCtx.size}/${events.length} matcher`);
  }
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
      a.lineup = oddsetAvailability(prefer || g.model.leagueOf?.get?.(fh), m.matchStart, fh, fa);
      const sharp = sharpMarket(g, prefer || g.model.leagueOf?.get?.(fh), m.matchStart, fh, fa);
      if (sharp?.p) { a.market = sharp.p; a.marketSource = sharp.source; a.sharpOdds = sharp.odds; }
      if (fh && fa) {
        // Anfallsfaktor fran startelva/franvaro (samma som Oddset; 1 nar alpha = 0)
        const afH = a.lineup?.alpha ? a.lineup.home?.attackFactor ?? 1 : 1;
        const afA = a.lineup?.alpha ? a.lineup.away?.attackFactor ?? 1 : 1;
        const lh = g.model.h * g.model.att.get(fh) * g.model.def.get(fa) * afH;
        const la = g.model.att.get(fa) * g.model.def.get(fh) * afA;
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
      // Namnjamforelse tal "&"/"och" och skiljetecken (Bosnien & Hercegovina = Bosnien och Hercegovina)
      const sameName = (a, b) => [a, b].map((s) => String(s || '').toLowerCase().replace(/&/g, 'och').replace(/[^a-zåäöéü]+/g, '')).reduce((x, y) => x === y);
      if (eh && ea && sameName(hp.countryName, home)) {
        // Neutral plan (VM/slutspel) -> ingen hemmafordel; spelas matchen i bortalagets land -> omvand fordel
        const codeH = ISO_TO_ELO[hp.isoCode] || hp.isoCode.slice(0, 2), codeA = ISO_TO_ELO[ap.isoCode] || ap.isoCode.slice(0, 2);
        const venue = ctx.elo.venue?.get(`${codeH}|${codeA}`);
        const homeAdv = !venue || venue === codeH ? 100 : venue === codeA ? -100 : 0;
        const { lh, la } = eloToLambdas(eh.elo, ea.elo, homeAdv);
        a.neutralVenue = homeAdv !== 100;
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
    // Klubb-Elo nar lagmodell saknas (hemmafordel 65 Elo, clubelo:s ungefarliga niva)
    if (!a.model && clubElo.has(home) && clubElo.has(away)) {
      const ch = clubElo.get(home), ca = clubElo.get(away);
      const { lh, la } = eloToLambdas(ch.elo, ca.elo, 65);
      const sm = scoreMatrix(lh, la);
      a.model = [sm.home, sm.draw, sm.away];
      a.lambdas = { home: r2(lh), away: r2(la) };
      a.topScores = sm.topScores;
      a.over25 = r3(sm.over25);
      a.btts = r3(sm.btts);
      a.clubElo = { home: ch.elo, away: ca.elo, homeName: ch.clubEloName, awayName: ca.clubEloName };
      a.thin = true;
      a.basis = 'clubelo';
    }
    // Skarpa odds utanfor klubbmodellen (landskamp, Europacup, nordiska ligor)
    // Nara spelstopp (STRYK_FRESH_ODDS=1) gar de nyss hamtade oddsen fore aldre skarpa odds fran den dagliga hamtningen
    if (extraCache && (!a.sharpOdds || FRESH_ODDS)) {
      const x = matchExtraOdds(extraCache, { league: a.league, kickoff: m.matchStart, home, away, homeCountry: hp?.countryName, awayCountry: ap?.countryName });
      if (x?.p) { a.market = x.p; a.marketSource = x.source; a.sharpOdds = x.odds; }
    }
    // Blandning
    const wm = a.model ? (a.thin ? MODEL_W_THIN : MODEL_W) : 0;
    if (a.market && a.model) a.final = a.market.map((p, i) => (1 - wm) * p + wm * a.model[i]);
    // Inga odds alls (t.ex. innan oddsen slapps): modellen ensam ar for saker (Elo gav Frankrike-Italien 80 %),
    // folkets streck ar nastan lika traffsakert som oddsen (Europatipset logloss 0,990 mot 0,994) -> halva/halva
    else if (a.model && folk) { a.final = a.model.map((p, i) => 0.5 * p + 0.5 * folk[i]); a.basis = `${a.basis}+folk`; }
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
    a.context = matchCtx.get(ev.eventNumber) || null;
    a.analysis = [...narrative({ ...a, final: a.final }), ...contextNotes(a.context, home, away)];
    // Facit (avgjord kupong)
    const r = result?.events?.find((x) => x.eventNumber === ev.eventNumber);
    if (r?.outcome) a.result = { outcome: r.outcome, score: r.outcomeScore ? `${r.outcomeScore.home}-${r.outcomeScore.away}` : null };
    out.push(a);
  }
  // System A (5-3-2) och motsystem B (4-3-3, hogst en gemensam spik med A)
  const turnover = Number(process.env.STRYK_TURNOVER) || GC_TURNOVER[product.id] || 1e7;
  // Verklig omsattning: slutlig om omgangen ar avgjord, annars minst den typiska (omsattningen vaxer till spelstopp)
  const realTurnover = Math.max(num(draw.currentNetSale) || 0, draw.drawState === 'Open' ? turnover : 0) || turnover;
  // Jackpot: live fran Svenska Spels jackpot-API; avgjord omgang: overskottet i 13-ratts-potten (annonseras alltid i forvag)
  let jackpot = 0;
  const d13 = result?.distribution?.find((x) => parseInt(x.name, 10) === 13);
  if (d13 && d13.winners > 0) jackpot = Math.max(0, (num(d13.amount) || 0) * d13.winners - PAYOUT_13 * realTurnover);
  else if (draw.drawState === 'Open') jackpot = await fetchJackpot(draw.productId, draw.drawNumber);
  if (process.env.STRYK_JACKPOT === '0') jackpot = 0; // for jamforelse i backtest
  const rowPrice = num(draw.rowPrice) || 1;
  const closeDate = (draw.regCloseTime || '').slice(0, 10);
  // Fargband: ratt rad senaste aret i kupongarkivet, bara omgangar fore den har (ingen framtidsdata i backtest)
  // Bara Stryktipset: pa Europatipset gav banden samre resultat (+10 557 mot +24 712 kr, 55 omg), dar optimeras fritt
  const bands = BANDS_FOR.has(product.id) ? colorBands(product.id, draw.regCloseTime || new Date().toISOString()) : null;
  const baseOpts = { rowPrice, turnover, realTurnover, jackpot, payoutMin: utdMin(product.id), signMin: SIGN_MIN.A, colorBands: bands };
  let bestA = null, splitPair = null;
  if (out.length && B_MODE === 'split') {
    const dbl = bestReduced(out, grundCandidates(out, GRUND_MAX_ROWS), { ...baseOpts, budget: { min: 2 * BUDGET.min, max: 2 * BUDGET.max }, split: true });
    splitPair = dbl?.pair || null;
    if (splitPair) bestA = { system: dbl.system, reduced: splitPair[0] };
  }
  if (!bestA && out.length) bestA = bestReduced(out, grundCandidates(out, GRUND_MAX_ROWS), baseOpts);
  const system = bestA?.system || null, reduced = bestA?.reduced || null;
  if (system) out.forEach((a, i) => { a.systemPick = system.picks[i]; });
  if (reduced) {
    out.forEach((a, i) => { a.colors = reduced.colors[i].split(','); });
    reduced.gamblingCabinUrl = gamblingCabinUrl(product.id, draw.drawNumber, closeDate, out, system.sets, reduced);
  }
  let systemB = null, reducedB = null;
  if (splitPair) {
    systemB = system; reducedB = splitPair[1];
    out.forEach((a, i) => { a.systemPickB = system.picks[i]; });
    reducedB.gamblingCabinUrl = gamblingCabinUrl(product.id, draw.drawNumber, closeDate, out, system.sets, reducedB);
  } else if (system) {
    const singlesA = system.sets.map((x) => (x.length === 1 ? x[0] : -1));
    const bestB = bestReduced(out, grundCandidates(out, GRUND_MAX_ROWS, singlesA), { rowPrice, turnover, realTurnover, jackpot, payoutMin: utdMin(product.id), signMin: SIGN_MIN.B, colorBands: bands }, B_JOINT ? new Set(reduced.rowList) : null);
    systemB = bestB?.system || null; reducedB = bestB?.reduced || null;
    if (systemB) out.forEach((a, i) => { a.systemPickB = systemB.picks[i]; });
    if (reducedB) reducedB.gamblingCabinUrl = gamblingCabinUrl(product.id, draw.drawNumber, closeDate, out, systemB.sets, reducedB);
  }
  const bestRowOf = (red) => red && Math.max(...red.rowList.map((row) => out.filter((a, i) => a.result && row[i] === a.result.outcome).length));
  const bestRow = () => bestRowOf(reduced);
  return {
    product: product.id, productName: product.name, drawNumber: draw.drawNumber, state: draw.drawState,
    open: draw.drawState === 'Open', closeDescription: draw.regCloseDescription, regCloseTime: draw.regCloseTime,
    turnover: draw.currentNetSale, comment: draw.drawComment, modelCutoff: cutoff, events: out,
    system: system && { maxRows: GRUND_MAX_ROWS, rows: system.rows, hitAll: system.hitAll, hitSingle: out.reduce((s, e) => s * Math.max(...e.final), 1) },
    value: drawValue(reduced, jackpot),
    colorBands: bands, // fargband (ratt rad senaste aret) som webbens kupongmotor bygger fargreglerna pa
    reduced: reduced && { ...reduced, colors: undefined, rowP: undefined, rowReal: undefined, rowPayout: undefined },
    reducedB: reducedB && { ...reducedB, colors: undefined, rowP: undefined, rowReal: undefined, rowPayout: undefined, ...pairStats(reduced, reducedB), sameSingles: out.filter((a) => a.systemPick?.signs.length === 1 && a.systemPickB?.signs === a.systemPick.signs).length },
    result: result ? {
      correct: out.filter((a) => a.result && a.result.outcome === a.tip).length,
      systemCorrect: out.filter((a) => a.result && a.systemPick?.signs.includes(a.result.outcome)).length,
      reducedCorrect: bestRow(),
      reducedCorrectB: bestRowOf(reducedB),
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

// ---------- Sparade system och utfall ----------
// Oppen kupong: forsta versionen sparas som "saved" (lases), senaste fore spelstopp som "latest".
function saveSnapshot(a) {
  if (!a.open || !a.reduced) return;
  fs.mkdirSync(HIST_DIR, { recursive: true });
  const file = path.join(HIST_DIR, `${a.product}-${a.drawNumber}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const snap = {
    at: new Date().toISOString(), rows: a.reduced.rows, cost: a.reduced.cost, hitAll: a.reduced.hitAll,
    rules: a.reduced.rules, gamblingCabinUrl: a.reduced.gamblingCabinUrl, rowList: a.reduced.rowList,
    picks: a.events.map((e) => e.systemPick?.signs || ''),
    // Odds och streck som de sag ut nar systemet sparades (for rattvisa backtest senare)
    matches: a.events.map((e) => ({ n: e.eventNumber, match: `${e.home} - ${e.away}`, kickoff: e.kickoff, final: e.final, market: e.market, marketSource: e.marketSource, svsOdds: e.odds, sharpOdds: e.sharpOdds || null, folk: e.folk, lineupStatus: e.lineup?.status || null, context: ctxSummary(e.context) })),
  };
  const snapB = a.reducedB && {
    at: snap.at, rows: a.reducedB.rows, cost: a.reducedB.cost, hitAll: a.reducedB.hitAll,
    rules: a.reducedB.rules, gamblingCabinUrl: a.reducedB.gamblingCabinUrl, rowList: a.reducedB.rowList,
    picks: a.events.map((e) => e.systemPickB?.signs || ''),
  };
  const entry = prev || {
    product: a.product, productName: a.productName, drawNumber: a.drawNumber, closeTime: a.regCloseTime,
    closeDescription: a.closeDescription, matches: a.events.map((e) => `${e.home} - ${e.away}`), saved: snap,
  };
  entry.latest = snap;
  // Paret A+B lases forsta gangen B sparas (A som den sag ut da)
  if (snapB) { if (!entry.savedB) { entry.savedB = snapB; entry.pairA = snap; } entry.latestB = snapB; }
  fs.writeFileSync(file, JSON.stringify(entry, null, 2), 'utf8');
}

// Ratt per rad mot facit och verklig utdelning (Svenska Spels vinstklasser)
function evaluateSnapshot(snap, outcomes, distribution) {
  const perClass = {};
  const counts = snap.rowList.map((row) => row.split('').filter((c, i) => c === outcomes[i]).length);
  for (const c of counts) perClass[c] = (perClass[c] || 0) + 1;
  const prize = Object.fromEntries(distribution.map((d) => [parseInt(d.name, 10), num(d.amount) || 0]));
  const winnings = Object.entries(perClass).reduce((sum, [c, n]) => sum + n * (prize[c] || 0), 0);
  return {
    best: Math.max(...counts), perClass, winnings: r2(winnings), cost: snap.cost, net: r2(winnings - snap.cost),
    groundCorrect: snap.picks.filter((pk, i) => pk.includes(outcomes[i])).length,
  };
}

async function updateHistory() {
  if (!fs.existsSync(HIST_DIR)) return [];
  const out = [];
  for (const f of fs.readdirSync(HIST_DIR).filter((x) => x.endsWith('.json'))) {
    const file = path.join(HIST_DIR, f);
    const entry = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!entry.result && new Date(entry.closeTime) < new Date()) {
      const res = await get(`${API}/${entry.product}/draws/${entry.drawNumber}/result`).then((r) => r.result || r).catch(() => null);
      const outcomes = res?.events?.sort((x, y) => x.eventNumber - y.eventNumber).map((e) => e.outcome);
      if (outcomes?.length === entry.saved.rowList[0].length && outcomes.every(Boolean) && res.distribution?.length) {
        entry.result = {
          at: new Date().toISOString(), outcomes: outcomes.join(''),
          scores: res.events.map((e) => (e.outcomeScore ? `${e.outcomeScore.home}-${e.outcomeScore.away}` : null)),
          distribution: res.distribution.map((d) => ({ name: d.name, winners: d.winners, amount: d.amount })),
        };
        entry.evaluation = {
          saved: evaluateSnapshot(entry.saved, outcomes, res.distribution),
          latest: evaluateSnapshot(entry.latest, outcomes, res.distribution),
          ...(entry.pairA ? { pairA: evaluateSnapshot(entry.pairA, outcomes, res.distribution) } : {}),
          ...(entry.savedB ? { savedB: evaluateSnapshot(entry.savedB, outcomes, res.distribution), latestB: evaluateSnapshot(entry.latestB, outcomes, res.distribution) } : {}),
        };
        fs.writeFileSync(file, JSON.stringify(entry, null, 2), 'utf8');
        log(`  facit ${entry.productName} ${entry.drawNumber}: bästa rad ${entry.evaluation.saved.best} rätt, vinst ${entry.evaluation.saved.winnings} kr (netto ${entry.evaluation.saved.net})`);
      }
    }
    const { rowList: _a, ...savedLite } = entry.saved;
    const { rowList: _b, ...latestLite } = entry.latest;
    const lite = (x) => { if (!x) return undefined; const { rowList: _r, ...rest } = x; return rest; };
    out.push({
      ...entry, saved: savedLite, latest: latestLite, savedB: lite(entry.savedB), latestB: lite(entry.latestB), pairA: lite(entry.pairA),
      changed: entry.saved.rowList.join() !== entry.latest.rowList.join(),
      changedB: Boolean(entry.savedB && entry.savedB.rowList.join() !== entry.latestB.rowList.join()),
    });
  }
  return out.sort((a, b) => String(b.closeTime).localeCompare(String(a.closeTime)));
}

// ---------- Backtest-sammanfattning till webben (fran scripts/backtest-stryktipset.mjs) ----------
const BACKTESTS = [
  { file: 'stryktips-backtest-2526-hel-gammal.json', label: 'Start: Svenska Spels odds, modell 35 %', key: 'old', col: true },
  { file: 'stryktips-backtest-2526-hel-svsodds.json', label: 'Steg 1: modellvikt 10 %', key: 'mid', col: true },
  { file: 'stryktips-backtest-2526-hel.json', label: 'Steg 2: skarpa odds + jackpot', key: 'step2', col: true },
  { file: 'stryktips-backtest-2526-steg3.json', label: 'Steg 3: delat system 4-2-2 + xG (nu)', key: 'new', col: true },
  { file: 'stryktips-backtest.json', label: 'Hösten 2026 – nuvarande version', key: 'autumn' },
  // Budgettabellen: 2025/26 + 2026/27 hittills, nuvarande version
  // (STRYK_SEASONS=2627,2526,2425 node scripts/backtest-stryktipset.mjs --from 2025-08-01 --out data/stryktips-backtest-budget.json)
  { file: 'stryktips-backtest-budget.json', label: 'Budget 2025/26 + 2026/27', key: 'budget' },
];
// Farger i kupong A (grundraden): hur manga tecken per omgang och hur ofta tecknet inte blev utfallet (mot vantat = 1 - var sannolikhet).
// Bla = spik (ett tecken), raknas per match.
function colorStats(draws) {
  const st = {};
  const add = (k, miss, exp) => { const s = (st[k] ??= { n: 0, miss: 0, exp: 0 }); s.n++; s.miss += miss ? 1 : 0; s.exp += exp; };
  for (const d of draws) for (const m of d.matches || []) {
    if (!m.pickA || !m.outcome) continue;
    for (const s of m.pickA) {
      const k = SIGNS.indexOf(s);
      add(signColor(m.folk?.[k]), s !== m.outcome, 1 - (m.final?.[k] ?? 0));
    }
    if (m.pickA.length === 1) add('blue', m.pickA !== m.outcome, 1 - (m.final?.[SIGNS.indexOf(m.pickA)] ?? 0));
  }
  const n = draws.length || 1;
  return Object.fromEntries(Object.entries(st).map(([k, s]) => [k, { perDraw: r2(s.n / n), n: s.n, miss: s.miss, rate: r2(s.miss / s.n), exp: r2(s.exp / s.n) }]));
}
function loadBacktests() {
  const out = [];
  for (const b of BACKTESTS) {
    const file = path.join(root, 'data', b.file);
    if (!fs.existsSync(file)) continue;
    const x = JSON.parse(fs.readFileSync(file, 'utf8'));
    const draws = x.draws || [];
    const sys = (k) => {
      const c = {};
      for (const d of draws) for (const [n, v] of Object.entries(d[k]?.perClass || {})) c[n] = (c[n] || 0) + v;
      const ge = (n0) => Object.entries(c).filter(([n]) => +n >= n0).reduce((a, [, v]) => a + v, 0);
      const cost = draws.reduce((a, d) => a + (d[k]?.cost || 0), 0);
      const win = draws.reduce((a, d) => a + (d[k]?.winnings || 0), 0);
      const hit = draws.reduce((a, d) => a + (d[k]?.hit || 0), 0);
      return { cost, winnings: r2(win), net: r2(win - cost), ge10: ge(10), ge11: ge(11), ge12: ge(12), ge13: ge(13), chance: hit ? Math.round(draws.length / hit) : null };
    };
    out.push({
      key: b.key, label: b.label, col: Boolean(b.col), modelWeight: x.summary?.modelWeight ?? null, from: x.summary?.from, to: x.summary?.to,
      draws: draws.length, matches: x.summary?.matches, logLoss: x.summary?.logLoss, drawRate: x.summary?.drawRate,
      A: sys('A'), B: sys('B'),
      colorStats: b.key === 'budget' ? colorStats(draws) : undefined,
      pairChance: (() => { const h = draws.reduce((a, d) => a + (d.A?.hit || 0) + (d.B?.hit || 0), 0); return h ? Math.round(draws.length / h) : null; })(),
      perDraw: b.key !== 'new' && b.key !== 'budget' ? undefined : draws.map((d) => ({
        n: d.drawNumber, date: d.date, x: d.draws13, prize13: d.prize13?.amount, winners13: d.prize13?.winners,
        aBest: d.A?.best, aWin: d.A?.winnings, bBest: d.B?.best, bWin: d.B?.winnings,
        // Budgettabellen: insats och antal rader per antal ratt
        ...(b.key === 'budget' ? { aCost: d.A?.cost || 0, bCost: d.B?.cost || 0, aClass: d.A?.perClass || {}, bClass: d.B?.perClass || {} } : {}),
      })),
    });
  }
  return out;
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
      saveSnapshot(a);
      // Arkiv for backtest (data/tips-archive): oppen kupong som den ser ut nu + alla nya avgjorda omgangar
      try {
        const { saveOpenDraw } = await import('./lib/tips-archive.mjs');
        const { archiveNew } = await import('./build-tips-archive.mjs');
        if (a.open) saveOpenDraw(p.id, got.draw);
        const done = await archiveNew(p, a.open ? got.draw.drawNumber - 1 : got.draw.drawNumber, ctx);
        if (done.length) log(`  arkiverade avgjorda omgångar: ${done.join(', ')}`);
      } catch (e) { log(`  arkiv: ${e.message}`); }
      const club = a.events.filter((e) => e.basis === 'club').length;
      const elo = a.events.filter((e) => e.basis === 'elo').length;
      log(`  omgång ${a.drawNumber} (${a.state}): ${a.events.length} matcher, klubbmodell ${club}, landslags-Elo ${elo}`);
      for (const e of a.events.filter((x) => x.basis === 'market' && COUNTRY_GROUP[x.country])) {
        log(`  OBS lagnamn ej matchade: ${e.home} (${e.matched?.home ?? '?'}) - ${e.away} (${e.matched?.away ?? '?'})`);
      }
      log(`  expertanalyser: ${a.events.reduce((s, e) => s + e.experts.length, 0)}, tio tidningar: ${a.events.filter((e) => e.tioTidningar).length} matcher`);
      if (a.reducedB) log(`  system B: grundrad ${a.reducedB.grundRows} -> ${a.reducedB.rows} rader (${a.reducedB.cost} kr), minst ${a.reducedB.rules.signMin.join('-')}, gemensamma spikar ${a.reducedB.sameSingles}, chans 13 rätt 1 på ${Math.round(1 / a.reducedB.hitAll)}`);
      if (a.value) log(`  värde: ${a.value.level} (${Math.round(a.value.ratio * 100)} %)`);
      if (a.reduced) log(`  reducerat: grundrad ${a.reduced.grundRows} -> ${a.reduced.rows} rader (${a.reduced.cost} kr), utdelning ≥ ${a.reduced.rules.payoutMin} kr, minst ${a.reduced.rules.signMin.join('-')} (1-X-2), chans 13 rätt 1 på ${Math.round(1 / a.reduced.hitAll)}`);
      if (a.result) log(`  facit: ${a.result.correct}/${a.result.total} rätt på enkelrad, grundrad ${a.result.systemCorrect}/${a.result.total}, reducerat bästa rad ${a.result.reducedCorrect}/${a.result.total}`);
      for (const x of a.result?.experts || []) log(`  expert ${x.author}: ${x.correct}/${x.tipped} rätt`);
    } catch (e) {
      log(`Fel ${p.name}: ${e.message}`);
    }
  }
  log('=== Sparade system ===');
  const history = await updateHistory();
  log(`  ${history.length} sparade, ${history.filter((h) => h.evaluation).length} med facit`);
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
    history,
    backtest: loadBacktests(),
    missProfile: buildMissProfile(), // vanliga missar i kupongarkivet (turmatcher i webben)
    missProfileStryk: buildMissProfile(undefined, { product: 'stryktipset', leagues: STRYK_LEAGUES }), // Stryktipset: bara PL, Championship, League One
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  log(`Klart -> ${path.relative(root, OUT)}`);
}

// Moduler (t.ex. scripts/backtest-stryktipset.mjs) kan importera analysen utan att kora main
// Reglerna som galler just nu (sparas med varje arkiverad kupong)
function currentRules(productId) {
  return { signMin: SIGN_MIN.A, signMinB: SIGN_MIN.B, bMode: B_MODE, payoutMin: utdMin(productId), budget: BUDGET, modelW: MODEL_W, modelWThin: MODEL_W_THIN, market: MARKET_MODE, grundMax: GRUND_MAX_ROWS };
}

export { analyzeDraw, oddsetAvailability, evaluateSnapshot, loadBacktests, loadNationalElo, loadGroup, fitModel, get, API, SIGN_MIN, currentRules, PRODUCTS };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    log(`Fel: ${e.stack || e.message}`);
    process.exit(1);
  });
}
