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
import { eloToLambdas, eloProbs, CLUB_ELO_SCALE } from './lib/elo-1x2.mjs';
import { teamElo, TEAM_ELO_HOME_ADV } from './lib/team-elo.mjs';
import { fillXg } from './lib/understat-xg.mjs';
import { buildMissProfile, buildSystemMissProfiles, STRYK_LEAGUES } from './lib/stryk-miss-profile.mjs';
import { calibrationTable, assessMatch, assessmentText } from './lib/stryk-calibration.mjs';
import { buildRefIndex, loadRefereeMatches, refereeFlags, refereeNotes, buildRefHomeIndex, refereeHomeBias, applyRefereeAway, refereeAwayNotes, resolveTeam } from './lib/referee-streaks.mjs';
import { coachMatches, buildCoachIndex, coachTenure, applyNewCoach, newCoachNotes } from './lib/coaches.mjs';
import { streckFlopFlags, streckFlopNotes, streckFlopSeasonList } from './lib/streck-flop.mjs';
import { logTips, settleTips, strykRecords } from './lib/tipslogg.mjs';
import { adjustProbs } from './lib/learned-adjust.mjs';
import { buildFileCoupons, FILE_RULES } from '../gui/public/stryk-engine.js';
import { extraSignals, seasonOf } from './lib/extra-signals.mjs';
import { request } from './lib/http.mjs';
import { xpTable, xpNotes } from './lib/xp-table.mjs';
import { svsSchemas } from './lib/api-schemas.mjs';
// Delat med webben: tecknen, folkets färger (visning) och skrällfickan
import { SIGNS, applyPocket } from '../gui/public/stryk-rules.js';

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
// Andel av modelldelen som ar eget lag-Elo (scripts/lib/team-elo.mjs) i stallet for klubbmodellen. 0 = av.
// Elo raknas pa langre historik (ELO_SEASONS) an klubbmodellen, sa att uppflyttade lag hunnit fa ratt niva.
const ELO_W = Number(process.env.STRYK_ELO_W ?? 0);
const ELO_SEASONS = ['2627', '2526', '2425', '2324', '2223'];
const MODEL_W_THIN = Number(process.env.STRYK_MODEL_W_THIN ?? process.env.STRYK_MODEL_W ?? 0.1); // lite data (fa viktade matcher) eller landslag
const PAYOUT_13 = 0.65 * 0.4; // 65 % aterbetalning, 40 % av potten till 13 ratt
// Typisk omsattning per spel (minsta omsattning som utdelningen raknas med)
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

// Svenska Spels kuponger far formatkontroll (fel loggas aven nar anroparen fangar dem)
const svsSchema = (url) => (!url.startsWith(API) ? undefined : /\/draws$/.test(url) ? svsSchemas.draws : /\/draws\/\d+$/.test(url) ? svsSchemas.draw : undefined);
const get = (url, type = 'json') => request(url, { as: type, headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny lokal analys)' }, retries: 2, schema: svsSchema(url), label: 'Svenska Spel' });

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
  // Pinnacles slutodds (annars Betfair-borsen, annars snitt av slutodds) - anvands bara for spelade matcher, dvs i backtest.
  // football-data slutade med Pinnacle 2026/27; Betfair traffade lika bra 2025/26 (logloss 0,9963 mot Pinnacle 0,9974).
  const oddsCols = [['PSCH', 'PSCD', 'PSCA', 'Pinnacle slutodds'], ['BFECH', 'BFECD', 'BFECA', 'Betfair slutodds'], ['AvgCH', 'AvgCD', 'AvgCA', 'snitt slutodds']].map(([h, d, a, src]) => ({ ix: [ix(h), ix(d), ix(a)], src }));
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

async function loadGroup(group, seasons = SEASONS) {
  const all = [];
  for (const [code, fdCode] of Object.entries(FD[group])) {
    for (const season of seasons) {
      const f = await ensureCsv(code, fdCode, season);
      if (f) all.push(...readCsvMatches(f, code, season));
    }
  }
  await fillXg(all, log); // xG fran Understat dar CSV:n saknar det (2025/26 och aldre, topp 5)
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

// Lag-Elo per land och cutoff (historiken laddas en gang)
const eloHist = new Map();
const eloAt = new Map();
async function groupElo(group, cutoff) {
  const key = `${group}|${cutoff}`;
  if (!eloAt.has(key)) {
    if (!eloHist.has(group)) eloHist.set(group, await loadGroup(group, [...new Set([...ELO_SEASONS, ...SEASONS])]));
    eloAt.set(key, teamElo(eloHist.get(group), cutoff));
  }
  return eloAt.get(key);
}

// Lag-Elo for ligor utanfor klubbmodellen med football-data-historik (data/raw/<KOD>_all.csv), bara visning.
// Svenska Spels liganamn -> kod. Allsvenskan/Eliteserien/Superligan har Klubb-Elo (clubelo.com) som gar fore.
const EXTRA_ELO_LEAGUE = { MLS: 'MLS', 'Brasileiro Serie A': 'BR', 'Liga MX': 'MX', 'J1 League': 'JP1', Ekstraklasa: 'EK', 'Liga Profesional': 'AR' };
const extraHist = new Map();
function extraLeagueElo(code, cutoff) {
  const key = `${code}|${cutoff}`;
  if (eloAt.has(key)) return eloAt.get(key);
  if (!extraHist.has(code)) {
    const file = path.join(RAW, `${code}_all.csv`);
    const ms = [];
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
      const head = lines[0].split(',');
      const I = { d: head.indexOf('Date'), h: head.indexOf('Home'), a: head.indexOf('Away'), hg: head.indexOf('HG'), ag: head.indexOf('AG') };
      for (const l of lines.slice(1)) {
        const c = l.split(',');
        const date = parseDate(c[I.d]), hg = num(c[I.hg]), ag = num(c[I.ag]);
        if (date && hg != null && ag != null && c[I.h]) ms.push({ league: code, date, home: c[I.h].trim(), away: c[I.a].trim(), hg, ag });
      }
    }
    extraHist.set(code, ms.sort((a, b) => a.date.localeCompare(b.date)));
  }
  const ms = extraHist.get(code);
  const out = { elo: teamElo(ms, cutoff), leagueOf: new Map(ms.flatMap((m) => [[m.home, code], [m.away, code]])) };
  eloAt.set(key, out);
  return out;
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
  deportivoacoruna: 'La Coruna', deportivolacoruna: 'La Coruna', deportivo: 'La Coruna',
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
  // Tabellplacering, xP och forvantad tabellplats i aktuell liga/sasong
  const tbl = xpTable(all.filter((x) => x.date < cutoff && x.league === league && x.season === season));
  const me = tbl.byTeam.get(team);
  return {
    team, league, leagueName: LEAGUE_NAME[league] || league, season,
    position: me?.pos || null, of: tbl.rows.length || null,
    xp: me?.xp ?? null, xpGames: me?.xgGames ?? 0, xpPosition: me?.xpPos ?? null,
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
// Domarsviter per lag (football-data England + FotMob ovriga ligor + store), laddas en gang.
let refIdx, refHomeIdx;
function refereeIndex() {
  if (refIdx !== undefined) return refIdx;
  try {
    const rd = (rel) => { const f = path.join(root, rel); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')) : null; };
    const matches = loadRefereeMatches(rd, rd('data/betting-store.json')?.matches || []);
    refIdx = buildRefIndex(matches);
    refHomeIdx = buildRefHomeIndex(matches);
  } catch { refIdx = null; refHomeIdx = null; }
  return refIdx;
}
// Domarnyckel -> hemmavinster i engelska ligamatcher (domare med lag hemmavinst, refereeHomeBias)
function refereeHomeIndex() { refereeIndex(); return refHomeIdx || null; }
// Tranare per lag (data/open/coach_fotmob.json, scripts/fetch-coaches-fotmob.mjs), laddas en gang
let coachIdx;
function coachIndex() {
  if (coachIdx !== undefined) return coachIdx;
  try {
    const idx = buildCoachIndex(coachMatches(JSON.parse(fs.readFileSync(path.join(root, 'data', 'open', 'coach_fotmob.json'), 'utf8'))));
    coachIdx = { idx, teams: [...idx.keys()] };
  } catch { coachIdx = null; }
  return coachIdx;
}

// Svenska Spels resultatsidor (streck + utfall) for streckfavoriter som inte vinner, laddas en gang
let statMatches;
function streckStats() {
  if (statMatches) return statMatches;
  statMatches = [];
  for (const f of ['stryktipset', 'europatipset']) {
    try { statMatches.push(...JSON.parse(fs.readFileSync(path.join(root, 'data', `${f}-statistik.json`), 'utf8').replace(/^﻿/, '')).matches); } catch { /* saknas */ }
  }
  return statMatches;
}

function ctxSummary(cx, rf) {
  if (!cx?.home) return null;
  const sd = (x) => x && { missing: x.unavailable.length, missingValueShare: x.missingValueShare, restDays: x.restDays, daysToNext: x.daysToNext, nextTournament: x.nextMatch?.tournament || null };
  return { lineupConfirmed: cx.lineupConfirmed, home: sd(cx.home), away: sd(cx.away), referee: cx.referee, refereeFlag: rf?.flagged ? { home: rf.home?.flag || null, away: rf.away?.flag || null } : null };
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
    if (hp.league === ap.league) out.push(...xpNotes(hp, ap, H, A));
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

// Spikbedomning match for match (scripts/lib/stryk-calibration.mjs): favoritchansen justeras efter hur ofta favoriter av
// samma slag (chansniva, hemma/borta, liga) vunnit i kupongarkivet fore omgangen, systemet byggs pa de justerade procenten
// och en match far spikas om den justerade chansen ar minst SPIK_CAL_MIN. STRYK_CALIB=0 stanger av, STRYK_SPIK_CAL styr.
// Backtest 2026-09-30 (38 ST omg), aterbetalning A+B / C: fast 65 %-grans 29 % / 70 %; match for match med spik fran
// 55 % 78 % / 69 % (A+B+C -15 401 kr mot -29 312), 60 % 79 % / 65 %, 65 % 41 % / 59 %, ingen niva 70 % / 73 %.
// Europatipset (55 omg) blev samre av justeringen (A+B 19 % mot 39 %, C 55 % mot 76 %): dar byggs systemet pa modellens
// procent och bedomningen visas bara.
const CALIB = process.env.STRYK_CALIB !== '0';
// Anvandarens regel 2026-09-30: alla matcher bedoms ALLTID match for match, pa bada spelen.
const CALIB_FOR = new Set((process.env.STRYK_CALIB_FOR || 'stryktipset,europatipset').split(','));
// Europatipset (55 omg) med bedomning: spik fran 55 % A+B+C -44 457 kr, ingen niva -52 175, 60 % -62 498, 65 % -66 663.
const SPIK_CAL_MIN_BY_PRODUCT = { stryktipset: 0.55, europatipset: 0.55 };
const spikCalMinFor = (productId) => Number(process.env.STRYK_SPIK_CAL ?? SPIK_CAL_MIN_BY_PRODUCT[productId] ?? 0);

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

// A+B tillsammans: chans att nagot av systemen tar 13 ratt, och hur manga rader som finns i bada
function pairStats(a, b) {
  if (!a || !b) return {};
  const setA = new Set(a.rowList);
  let extra = 0, overlap = 0;
  b.rowList.forEach((row, i) => { if (setA.has(row)) overlap++; else extra += b.rowP[i]; });
  return { unionHit: a.hitAll + extra, overlapRows: overlap };
}

// ---------- Startelvor/franvaro + tip-bas: samma data som Oddset ----------
// Oddset (scripts/pro-layer.mjs) raknar per match: bekraftad ESPN-elva (PL/Championship, ~1 h fore avspark) eller
// FPL-skador (PL), saknad andel av lagets anfall (xG+xA) och en anfallsfaktor med vikten alpha som Oddsets backtest
// valjer (data/reports/pro-evaluation.json). Stryktipset laser samma rader ur data/tips-latest.json och anvander
// samma faktor pa lagmodellens mal - alpha 0 betyder att elvan visas men inte flyttar procenten (oddsen gor det).
// Icke-spikbara matcher: tipset (final/tip) baseras pa Oddsets marknadsstyrda blandning nar matchen finns i tips-latest.
const TIPS_FILE = path.join(root, 'data', 'tips-latest.json');
let oddsetAll = null;
let oddsetLineupRows = null;
const oddsetNorm = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const oddsetSame = (a, b) => { const x = oddsetNorm(a), y = oddsetNorm(b); return x.length > 2 && y.length > 2 && (x === y || x.includes(y) || y.includes(x)); };
const oddsetDay = (d) => Date.parse(String(d || '').slice(0, 10));
function loadOddsetAll() {
  if (oddsetAll !== null) return oddsetAll;
  try {
    const t = JSON.parse(fs.readFileSync(TIPS_FILE, 'utf8'));
    oddsetAll = [...(t.allCandidates || []), ...(t.bestUpcoming || [])];
  } catch { oddsetAll = []; }
  return oddsetAll;
}
/** Hitta Oddset-rad (tips-latest) for samma lag/datum/liga. */
function findOddsetRow(leagueCode, date, ...namePairs) {
  const rows = loadOddsetAll();
  if (!date || !rows.length) return null;
  const t0 = oddsetDay(date);
  if (!Number.isFinite(t0)) return null;
  const pairs = namePairs.filter((p) => p?.[0] && p?.[1]);
  if (!pairs.length) return null;
  const hit = (x) => pairs.some(([h, a]) => oddsetSame(x.home, h) && oddsetSame(x.away, a));
  const near = rows.filter((x) => Math.abs(oddsetDay(x.date) - t0) <= 86400e3 && hit(x));
  if (!near.length) return null;
  if (leagueCode) {
    const exact = near.find((x) => x.league === leagueCode);
    if (exact) return exact;
  }
  return near[0];
}
function oddsetAvailability(leagueCode, date, homeFd, awayFd) {
  if (oddsetLineupRows === null) {
    oddsetLineupRows = loadOddsetAll().filter((x) => x.pro?.availability || x.lineupStatus);
  }
  if (!leagueCode || !date || !homeFd || !awayFd) return null;
  const row = oddsetLineupRows.find((x) => x.league === leagueCode && Math.abs(oddsetDay(x.date) - oddsetDay(date)) <= 86400e3
    && oddsetSame(x.home, homeFd) && oddsetSame(x.away, awayFd))
    || findOddsetRow(leagueCode, date, [homeFd, awayFd]);
  if (!row || !(row.pro?.availability || row.lineupStatus)) return null;
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
/** Icke-spikbar match: byt tip/final till Oddsets marknadsstyrda 1X2 (samma som tips-sidan). */
function applyOddsetTipBasis(a) {
  const row = findOddsetRow(
    a.leagueCode,
    a.kickoff,
    a.matched?.home && a.matched?.away ? [a.matched.home, a.matched.away] : null,
    [a.home, a.away],
  );
  const b = row?.pro?.blended;
  if (!b || !(b.home > 0) || !(b.draw > 0) || !(b.away > 0)) return false;
  const raw = [b.home, b.draw, b.away];
  const s = raw[0] + raw[1] + raw[2];
  a.final = raw.map((x) => r3(x / s));
  const order = [0, 1, 2].sort((x, y) => a.final[y] - a.final[x]);
  a.tip = SIGNS[order[0]];
  a.tipP = a.final[order[0]];
  a.basis = 'oddset';
  a.tipBasis = 'oddset';
  const ml = row.pro?.marketLed || row.marketLed || null;
  a.modelWeight = ml?.modelW ?? a.modelWeight ?? 0;
  a.oddsetTip = {
    pick: row.tips?.['1X2']?.pick || a.tip,
    source: ml?.source || row.pro?.market?.fairSource || 'oddset',
    modelW: ml?.modelW ?? null,
    kind: ml?.kind || null,
  };
  const minOdds = 1.03 / a.tipP;
  const book = a.odds ? a.odds[order[0]] : null;
  a.verdict = { sign: a.tip, minOdds: r2(minOdds), odds: book, value: book != null ? book >= minOdds : false };
  a.streckvarde = a.folk ? SIGNS.map((_, i) => r2(a.final[i] / Math.max(a.folk[i], 0.01))) : a.streckvarde;
  return true;
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
      a.leagueCode = prefer || g.model.leagueOf?.get?.(fh) || null;
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
        // Eget lag-Elo (ligaresultaten fram till omgangen): visas bredvid lagnamnen, blandas in bara med STRYK_ELO_W > 0
        const el = await groupElo(group, cutoff);
        const eh = el.get(fh), ea = el.get(fa);
        if (eh != null && ea != null) {
          const e = eloProbs(eh, ea, TEAM_ELO_HOME_ADV);
          const ep = [e.home, e.draw, e.away];
          a.teamElo = { home: Math.round(eh), away: Math.round(ea), probs: ep.map(r3), clubModel: a.model.map(r3) };
          if (ELO_W > 0) a.model = a.model.map((p, i) => (1 - ELO_W) * p + ELO_W * ep[i]);
        }
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
      const { lh, la } = eloToLambdas(ch.elo, ca.elo, 65, CLUB_ELO_SCALE);
      const sm = scoreMatrix(lh, la);
      a.model = [sm.home, sm.draw, sm.away];
      a.lambdas = { home: r2(lh), away: r2(la) };
      a.topScores = sm.topScores;
      a.over25 = r3(sm.over25);
      a.btts = r3(sm.btts);
      a.clubElo = { home: ch.elo, away: ca.elo, homeName: ch.clubEloName, awayName: ca.clubEloName, probs: a.model.map(r3) };
      a.thin = true;
      a.basis = 'clubelo';
    }
    // Lag-Elo ur football-data for ligor utan klubbmodell och utan Klubb-Elo (MLS, Brasilien m.fl.) - bara visning
    if (!a.clubElo && !a.teamElo && EXTRA_ELO_LEAGUE[m.league?.name]) {
      const code = EXTRA_ELO_LEAGUE[m.league.name];
      const x = extraLeagueElo(code, cutoff);
      const fh = matchTeam([hp?.name, hp?.mediumName], new Set(x.elo.keys()), code, x.leagueOf);
      const fa = matchTeam([ap?.name, ap?.mediumName], new Set(x.elo.keys()), code, x.leagueOf);
      if (fh && fa && fh !== fa) {
        const eh = x.elo.get(fh), ea = x.elo.get(fa);
        const e = eloProbs(eh, ea, TEAM_ELO_HOME_ADV);
        a.teamElo = { home: Math.round(eh), away: Math.round(ea), probs: [e.home, e.draw, e.away].map(r3) };
      }
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
    // Domare med lag hemmavinst historiskt (hogst 38 % pa minst 40 engelska ligamatcher): bortalaget vinner oftare an oddsen
    // sager (anvandaren 2026-10-02 kvall: "fixa detta", test i scripts/lib/referee-streaks.mjs AWAY_REF). Bara engelska ligor
    // och bara nar FotMob har domaren (oppna omgangar). Flyttar procenten fore tips, spikbedomning och system.
    const ctx0 = matchCtx.get(ev.eventNumber);
    const matchDay = (m.matchStart || new Date().toISOString()).slice(0, 10);
    const finalBase = a.final;
    a.refereeAway = ctx0?.referee && country === 'England' && refereeHomeIndex()
      ? refereeHomeBias(refereeHomeIndex(), ctx0.referee, matchDay)
      : null;
    if (a.refereeAway?.flag) a.final = applyRefereeAway(a.final, a.refereeAway);
    // Ny tranare (lagets 5 forsta ligamatcher efter ett byte): laget vinner mindre an oddsen sager (anvandaren 2026-10-02
    // kvall, test i scripts/lib/coaches.mjs NEW_COACH). Bara engelska ligor, tranarna fran FotMob (npm run tranare).
    const ci = country === 'England' ? coachIndex() : null;
    if (ci) {
      const tenure = (name) => { const t = resolveTeam(name, ci.teams); return t ? coachTenure(ci.idx, t, matchDay) : null; };
      const ht = tenure(home), at = tenure(away);
      a.newCoach = ht?.isNew || at?.isNew ? { home: ht?.isNew ? ht : null, away: at?.isNew ? at : null } : null;
      if (a.newCoach) a.final = applyNewCoach(a.final, a.newCoach.home, a.newCoach.away);
    }
    // Lardomar (config/learned-adjustments.json, bas 'close' = odds nara avspark, npm run lardomar:modell). Anvands bara
    // nar modellen hittat nagot som slog kontrollperioden (2023/24-) vid stangningsodds; annars ingen andring.
    if (a.leagueCode && a.matched?.home && a.matched?.away) {
      const sig = extraSignals(a.leagueCode, seasonOf(a.leagueCode, matchDay), a.matched.home, a.matched.away);
      const adj = adjustProbs(a.final, a.leagueCode, sig, 'close');
      if (adj.applied.length) { a.learned = { applied: adj.applied, before: a.final.map(r3) }; a.final = adj.p; }
    }
    // Skrallficka (2026-10-11): skrall i PL/Championship dar oddsen ger 20-30 % och minst 1,3 x folkets streck gick in oftare
    // an oddsen sa (kupongarkivet, kontroll 2025/26-). Tecknet hojs med POCKET.lift i stryk-rules.js och markeras (a.pocket).
    if (folk) {
      const pk = applyPocket({ league: a.league, market: a.market, final: a.final, folk });
      if (pk.signs.length) { a.pocket = pk.signs.map((k) => SIGNS[k]); a.final = pk.p; }
    }
    // Procenten fore domar- och tranarjusteringen (odds + modell)
    if (a.final !== finalBase) a.finalBase = finalBase.map(r3);
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
    // Domarsvit: minst 5 raka segrar/forluster for nagot av lagen med matchens domare (engelska ligor)
    // Alla matcher med känd domare; landslag finns inte i domarhistoriken och får ingen träff
    a.refereeStreak = a.context?.referee && refereeIndex()
      ? refereeFlags(refereeIndex(), { referee: a.context.referee, home: a.matched?.home || home, away: a.matched?.away || away })
      : null;
    // Streckfavorit utan seger: minst 2 ggr streckat >= 50 % denna sasong och minst halften utan seger
    a.streckFlop = streckFlopFlags(streckStats(), { home, away, date: (a.kickoff || new Date().toISOString()).slice(0, 10), country });
    // Matchkontexten (FotMob) ligger sist i analysen
    a.analysis = [...narrative({ ...a, final: a.final }), ...streckFlopNotes(a.streckFlop, home, away), ...refereeAwayNotes(a.refereeAway, home, away), ...newCoachNotes(a.newCoach?.home, a.newCoach?.away, home, away), ...contextNotes(a.context, home, away), ...refereeNotes(a.refereeStreak, home, away)];
    // Facit (avgjord kupong)
    const r = result?.events?.find((x) => x.eventNumber === ev.eventNumber);
    if (r?.outcome) a.result = { outcome: r.outcome, score: r.outcomeScore ? `${r.outcomeScore.home}-${r.outcomeScore.away}` : null };
    out.push(a);
  }
  // System A och motsystem B (aldrig samma gardering som A, hogst 1 spik skiljer), 2-4 spikar per kupong
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
  // Spikbedomning match for match; systemen byggs pa de justerade procenten (sysEv), matchkorten visar modellens
  const calib = CALIB ? calibrationTable(product.id, draw.regCloseTime || new Date().toISOString()) : null;
  const used = CALIB_FOR.has(product.id);
  out.forEach((a) => {
    a.spik = assessMatch(a.final, a.league, calib, used ? spikCalMinFor(product.id) : 0);
    if (a.spik) {
      a.spik.used = used; // Europatipset: bara visning
      // Forst i analysen: FotMob-kontexten ska ligga sist
      a.analysis = [assessmentText(a.spik, a.home, a.away), ...(a.analysis || [])];
    }
    // Icke-spikbara (eller ET dar spik bara visas): tipsa som Oddset nar matchen finns i tips-latest
    const spiked = a.spik?.used && a.spik.spikbar;
    if (!spiked && applyOddsetTipBasis(a)) {
      const src = a.oddsetTip?.source ? String(a.oddsetTip.source) : 'marknad';
      a.analysis = [`Tips som Oddset (${src}${a.oddsetTip?.modelW ? `, modell ${Math.round(a.oddsetTip.modelW * 100)} %` : ''}).`, ...(a.analysis || [])];
    }
  });
  // Spikbara: kalibrerad sysP. Ovriga med Oddset-bas: Oddsets final. Ovriga: sysP om kalibrering anvands.
  const sysEv = out.map((a) => {
    if (a.tipBasis === 'oddset') return a.spik?.used ? { ...a } : { ...a, spik: undefined };
    if (a.spik?.used) return { ...a, final: a.spik.sysP };
    return { ...a, spik: undefined };
  });
  // Filkuponger A, B och C (anvandaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att gora, ta bort alla
  // regler, vill bara kora pa fil"). Samma motor som webben (gui/public/stryk-engine.js buildFileCoupons): 2 starka spikar,
  // A = 500 troligaste raderna >= 30 000 kr, B = nasta 500 utanfor A, C = underspelade tecken uppviktade. Spelas som
  // Egna rader-fil (reduced.egnaRader).
  let system = null, reduced = null, systemB = null, reducedB = null, systemC = null, reducedC = null;
  if (out.length) {
    const fc = buildFileCoupons({ product: product.id }, sysEv, () => sysEv.map(() => null), { rowPrice, turnover, realTurnover, jackpot });
    const asSystem = (c) => c && { rows: c.grundRows, hitAll: c.hitAll, picks: c.picks, sets: c.picks.map((x) => [...x.signs].map((t) => SIGNS.indexOf(t))) };
    system = asSystem(fc.A); reduced = fc.A; systemB = asSystem(fc.B); reducedB = fc.B; systemC = asSystem(fc.C); reducedC = fc.C;
    if (system) out.forEach((a, i) => { a.systemPick = system.picks[i]; });
    if (systemB) out.forEach((a, i) => { a.systemPickB = systemB.picks[i]; });
    if (reducedC) reducedC.picks = systemC.picks.map((x) => x.signs);
  }
  const bestRowOf = (red) => red && Math.max(...red.rowList.map((row) => out.filter((a, i) => a.result && row[i] === a.result.outcome).length));
  const bestRow = () => bestRowOf(reduced);
  return {
    product: product.id, productName: product.name, drawNumber: draw.drawNumber, state: draw.drawState,
    open: draw.drawState === 'Open', closeDescription: draw.regCloseDescription, regCloseTime: draw.regCloseTime,
    turnover: draw.currentNetSale, comment: draw.drawComment, modelCutoff: cutoff, events: out,
    system: system && { rows: system.rows, hitAll: system.hitAll, hitSingle: out.reduce((s, e) => s * Math.max(...e.final), 1) },
    value: drawValue(reduced, jackpot),
    reduced: reduced && { ...reduced, colors: undefined, rowP: undefined, rowReal: undefined, rowPayout: undefined },
    reducedC: reducedC && { ...reducedC, colors: undefined, rowP: undefined, rowReal: undefined, rowPayout: undefined },
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
    rules: a.reduced.rules, rowList: a.reduced.rowList,
    picks: a.events.map((e) => e.systemPick?.signs || ''),
    // Odds och streck som de sag ut nar systemet sparades (for rattvisa backtest senare)
    matches: a.events.map((e) => ({ n: e.eventNumber, match: `${e.home} - ${e.away}`, kickoff: e.kickoff, final: e.final, market: e.market, marketSource: e.marketSource, svsOdds: e.odds, sharpOdds: e.sharpOdds || null, folk: e.folk, lineupStatus: e.lineup?.status || null, context: ctxSummary(e.context, e.refereeStreak), refereeAway: e.refereeAway?.flag ? { matches: e.refereeAway.matches, homeRate: e.refereeAway.homeRate } : null, newCoach: e.newCoach || null, finalBase: e.finalBase || null })),
  };
  const snapB = a.reducedB && {
    at: snap.at, rows: a.reducedB.rows, cost: a.reducedB.cost, hitAll: a.reducedB.hitAll,
    rules: a.reducedB.rules, rowList: a.reducedB.rowList,
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
      // Tipslogg (data/tipslogg): varje match med enkelrad och kupong A/B/C, forsta versionen last
      if (a.open) {
        const c = logTips(a.product, strykRecords(a));
        log(`  tipslogg: ${c.ny} nya, ${c.andrad} ändrade`);
      }
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
      if (a.reducedB) log(`  fil B: ${a.reducedB.rows} rader (${a.reducedB.cost} kr), utdelning ≥ ${a.reducedB.rules.payoutMin} kr, chans 13 rätt 1 på ${Math.round(1 / a.reducedB.hitAll)}, A+B 1 på ${Math.round(1 / (a.reducedB.unionHit || a.reducedB.hitAll))}`);
      if (a.value) log(`  värde: ${a.value.level} (${Math.round(a.value.ratio * 100)} %)`);
      if (a.reduced) log(`  fil A: ${a.reduced.rows} rader (${a.reduced.cost} kr), utdelning ≥ ${a.reduced.rules.payoutMin} kr, ${a.reduced.rules.spikes} spikar, chans 13 rätt 1 på ${Math.round(1 / a.reduced.hitAll)}`);
      if (a.reducedC) log(`  fil C: ${a.reducedC.rows} rader (${a.reducedC.cost} kr), chans 13 rätt 1 på ${Math.round(1 / a.reducedC.hitAll)}`);
      if (a.result) log(`  facit: ${a.result.correct}/${a.result.total} rätt på enkelrad, grundrad ${a.result.systemCorrect}/${a.result.total}, reducerat bästa rad ${a.result.reducedCorrect}/${a.result.total}`);
      for (const x of a.result?.experts || []) log(`  expert ${x.author}: ${x.correct}/${x.tipped} rätt`);
    } catch (e) {
      log(`Fel ${p.name}: ${e.message}`);
    }
  }
  // Facit till tipsloggen: aktuell omgang om den ar avgjord, annars arkivet (data/tips-archive/raw)
  try {
    const { readRaw } = await import('./lib/tips-archive.mjs');
    const current = new Map(products.flatMap((a) => a.events.map((e) => [`${a.product}-${a.drawNumber}-${e.eventNumber}`, e.result])));
    for (const p of PRODUCTS) {
      const n = await settleTips(p.id, (rec) => {
        const cur = current.get(rec.id);
        if (cur?.outcome) return { outcome: cur.outcome, score: cur.score || null };
        const ev = readRaw(p.id, rec.draw)?.result?.events?.find((x) => x.eventNumber === rec.event);
        if (!ev?.outcome) return null;
        return { outcome: ev.outcome, score: ev.outcomeScore ? `${ev.outcomeScore.home}-${ev.outcomeScore.away}` : null };
      });
      if (n) log(`  tipslogg ${p.name}: facit för ${n} matcher`);
    }
  } catch (e) { log(`  tipslogg facit: ${e.message}`); }
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
      elo: 'Elo bredvid lagnamnen: eget lag-Elo ur ligaresultaten (England, Spanien, Italien m.fl., MLS, Brasilien) eller Klubb-Elo (clubelo.com, Europacup och nordiska ligor). Elo-skillnaden krymps till 75 % eftersom Elo annars är för säker på favoriten. Lag-Elo är bara visning; Klubb-Elo används som egen modell när lagmodell saknas.',
      value: 'Värde = Svenska Spels odds på tipset ≥ 1,03 / vår sannolikhet. Streckvärde = vår sannolikhet / Svenska folkets andel.',
    },
    lastDrawNumber,
    products,
    history,
    missProfile: buildMissProfile(), // vanliga missar i kupongarkivet (turmatcher i webben)
    missProfileStryk: buildMissProfile(undefined, { product: 'stryktipset', leagues: STRYK_LEAGUES }), // Stryktipset: bara PL, Championship, League One
    missProfileSystems: buildSystemMissProfiles(), // missar per kupong A/B/C ur bakkorningen (markeringen i kupongtabellen)
    // Lag som streckats som favorit denna sasong och hur ofta de inte vunnit (panelen Risklag)
    streckFlopSeason: streckFlopSeasonList(streckStats(), new Date().toISOString().slice(0, 10)),
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  log(`Klart -> ${path.relative(root, OUT)}`);
}

// Moduler (t.ex. scripts/backtest-stryktipset.mjs) kan importera analysen utan att kora main
// Reglerna som galler just nu (sparas med varje arkiverad kupong)
function currentRules(productId) {
  // Filkupongerna (2026-10-11): ändras reglerna byggs arkivet om (build-tips-archive.mjs jämför detta objekt)
  return { file: { ...FILE_RULES }, modelW: MODEL_W, modelWThin: MODEL_W_THIN, market: MARKET_MODE, product: productId };
}

export { analyzeDraw, findOddsetRow, applyOddsetTipBasis, evaluateSnapshot, loadNationalElo, loadGroup, fitModel, currentRules, PRODUCTS };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    log(`Fel: ${e.stack || e.message}`);
    process.exit(1);
  });
}
