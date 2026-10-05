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
import { buildMissProfile, buildSystemMissProfiles, STRYK_LEAGUES } from './lib/stryk-miss-profile.mjs';
import { colorBands } from './lib/stryk-color-bands.mjs';
import { calibrationTable, assessMatch, assessmentText } from './lib/stryk-calibration.mjs';
import { buildRefIndex, loadRefereeMatches, refereeFlags, refereeNotes, buildRefHomeIndex, refereeHomeBias, applyRefereeAway, refereeAwayNotes, resolveTeam } from './lib/referee-streaks.mjs';
import { coachMatches, buildCoachIndex, coachTenure, applyNewCoach, newCoachNotes } from './lib/coaches.mjs';
import { streckFlopFlags, streckFlopNotes, streckFlopSeasonList } from './lib/streck-flop.mjs';
import { logTips, settleTips, strykRecords } from './lib/tipslogg.mjs';
import { adjustProbs } from './lib/learned-adjust.mjs';
import { extraSignals, seasonOf } from './lib/extra-signals.mjs';
import { request } from './lib/http.mjs';
import { svsSchemas } from './lib/api-schemas.mjs';

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
const SIGN_MIN = { A: signEnv(process.env.STRYK_SIGN_A) || [4, 2, 2], B: signEnv(process.env.STRYK_SIGN_B) || [3, 2, 2] }; // B 3-2-2 som webben (2026-10-03: 3-3-3 uteslot ratt rad i 51 av 107 omg, chans 13 ratt 0,087 -> 0,099 %)
// Kupong C: Europatipset 3-2-2 (backtest 55 omg: -10 042 kr och 105 rader med 11+ mot -12 651 och 94 med 4-2-2),
// Stryktipset samma som A (3-2-2 gav ingen skillnad dar).
const SIGN_MIN_C = { stryktipset: signEnv(process.env.STRYK_SIGN_C) || SIGN_MIN.A, europatipset: signEnv(process.env.STRYK_SIGN_C) || [3, 2, 2] };
const BUDGET = { min: 350, max: 400 }; // kr per omgang (rader x radpris)
// Kupong C (anvandaren 2026-09-30): ett eget system pa 700-850 kr, oberoende av A och B, minst 30 000 kr for 13 ratt och
// samma regler som A. Byggs aven i webben (gui/public/stryk-engine.js, med krav som galler C). Env for backtest:
// STRYK_C=0 stanger av, STRYK_C_BUDGET="700,850", STRYK_C_UTD=30000, STRYK_SIGN_C=4-2-2, STRYK_C_COLOR=dyn|free.
const BUDGET_C = (() => { const [min, max] = (process.env.STRYK_C_BUDGET || '700,850').split(',').map(Number); return { min, max }; })();
// C ar ocksa ett risksystem (anvandaren 2026-10-02 kvall: "gor om C, mer likt B, 50-75k som grans dar ocksa")
const UTD_MIN_C = Number(process.env.STRYK_C_UTD ?? 50000);
// Kupong C ar skrallsystemet (anvandaren 2026-10-02 kvall: "C ar inte skrall, max vinst ar 300k typ"): hogsta raden ska ge
// minst 1 miljon. Rod 2-6 och rott pa allt fler matcher (6, 7 ... 10) tills hogsta raden nar 1 miljon - 50 000-75 000 kr
// galler fortfarande forst. Stryktipset 4973: rott pa 8 matcher gav hogsta rad 1,4 milj (14 rader over 1 milj), gransen
// 73 800 kr, chans 13 ratt 1 pa 599 (mot 1 pa 261 med rott pa 6). Gar 1 miljon inte: den med hogst hogsta rad.
const RISK_C = { redRules: [[2, 6]], minReds: [6, 7, 8, 9, 10], maxRowMin: 1e6 };
// Kryss i C (anvandaren 2026-10-04: "for fa kryss, jag maste fa in 50 % av kryssen"): C:s halvor blev favorit + skrall
// (1-2), sa Europatipset 2613 hade X pa bara 4 matcher - omgangar med 5+ kryss (18 av 55) kunde aldrig ge 13 ratt.
// Grundraden maste tacka minst X_SHARE_C av omgangens vantade kryss (summan av var X-chans, hela procent). Gar det inte
// (dina krav) sa mycket som gar (rules.xShareShort). Samma som X_SHARE_C i gui/public/stryk-engine.js. STRYK_C_XSHARE=0 = av.
export const X_SHARE_C = Number(process.env.STRYK_C_XSHARE ?? 0.5);
// Lutning mot understreckade tecken i C (som GRUND_TILT_B). STRYK_C_TILT=b = B:s lutning.
const C_TILT = process.env.STRYK_C_TILT === 'b';
let cTiltOn = false;
// Kryssen raknas inte som en egen nyckel i DP:n (det gav manga ganger fler tillstand - en bakkorning tog timmar):
// i stallet far X en bonus xLam x X-chansen i valet av tecken, och bonusen hojs steg for steg (X_LAMS) tills grundraden
// tacker X_SHARE_C. Valet bland kandidaterna gors anda pa kupongens chans efter reduceringen. Samma i stryk-engine.js.
let xShareOn = false; // satts i bestWithSpikes (C)
let xLam = 0;
const X_LAMS = [0, 0.25, 0.5, 1, 1.5, 2.5, 4];
const xUnits = (e) => Math.round(e.final[1] * 100);
export function xShareOf(events, sets) {
  const tot = events.reduce((s, e) => s + xUnits(e), 0);
  return tot ? events.reduce((s, e, i) => s + (sets[i].includes(1) ? xUnits(e) : 0), 0) / tot : 1;
}
const C_COLOR = process.env.STRYK_C_COLOR || 'dyn';
const COLOR = { green: 0.45, red: 0.25 }; // folkets streck: gron >= 45 %, rod 25 % eller lagre (anvandaren 2026-10-02, hela procent), annars gul
// Skrall (rott tecken) i en gardering far finnas pa hogst 85 % av kupongens rader (anvandarens regel 2026-09-29).
// GC saknar regeln, sa den anvands vid valet av system (lanken ger samma rader). Samma som i gui/public/stryk-engine.js.
const RED_MAX_SHARE = 0.85;
// Favoriten i en gardering far aldrig ligga pa under 10 % av raderna, t.ex. X pa 90 % (anvandarens regel 2026-09-30).
// Ocksa en regel GC saknar: anvands vid valet av system, lanken ger samma rader.
const FAV_MIN_SHARE = Number(process.env.STRYK_FAV_MIN ?? 0.1);
// Minst 2 och hogst 4 spikar per kupong (anvandarens regler 2026-09-30 och 2026-10-02)
const MIN_SPIKES = Number(process.env.STRYK_MIN_SPIKES ?? 2);
const MAX_SPIKES = Number(process.env.STRYK_MAX_SPIKES ?? 4);
// Minst 3 helgarderingar per kupong (anvandarens regel 2026-10-02: plats for skrallar). Samma som gui/public/stryk-engine.js.
const MIN_HELG = Number(process.env.STRYK_MIN_HELG ?? 3);
// Minst 5 matcher med rott tecken (folket 25 % eller lagre) i garderingarna (anvandaren 2026-10-02: "ha med minst 5 roda om det ar
// mojligt", tidigare 2). Gar det inte blir det sa manga som gar. Rod max i fargregeln minst RED_REACH nar reglerna
// optimeras fritt (sista reserv). Samma som gui/public/stryk-engine.js.
const MIN_RED = Number(process.env.STRYK_MIN_RED ?? 5);
// Kupong B (risksystemet): rott pa minst 6 matcher om det gar (anvandaren 2026-10-02 kvall: "forsok ha 6 roda tecken men behall
// 2-4" - fargregeln for rott ar kvar). Samma som stryk-engine.js.
const MIN_RED_B = 6;
let minRed = MIN_RED; // for systemet som byggs just nu (satts i bestWithSpikes)
const RED_REACH = 2;
// Tva halvgarderingar bla (GC:s grundfarg, id 1) och fria fran fargreglerna (anvandaren 2026-10-02). De sakraste
// halvgarderingarna utan rott tecken forst, sa att skrallarna ligger kvar i de fargade. Samma som stryk-engine.js.
// 2026-10-02 (senare): "2 halvor bla alltid" - exakt 2 bla halvgarderingar, och varje system har minst 2 halvgarderingar.
const BLUE_HALVES = Number(process.env.STRYK_BLUE_HALVES ?? 2);
// Skrallspik (anvandaren 2026-10-02: "hitta en skrallspik, nagon som ligger pa runt 40 %"): hogst en spik per kupong pa ett
// tecken dar var chans ar 35-47 % och minst 3 procentenheter over folkets streck. Raknas som en vanlig spik (2-4 per kupong).
// STRYK_SKRALL_SPIK=0 stanger av (backtest). Samma som gui/public/stryk-engine.js.
const SKRALL_SPIK = { min: 0.35, max: 0.47, edge: 0.03, count: Number(process.env.STRYK_SKRALL_SPIK ?? 1) };
// Kupong B (risksystemet) har minst SKRALL_MIN_B skrallspik (anvandaren 2026-10-02 kvall: "ha minst en skrall spik som ar
// pa runt 40 %"). Gar det inte (ingen match har en, eller A har den) eller haller B inte 50 000-75 000 kr med den: utan.
const SKRALL_MIN_B = 1;
let skrallMin = 0; // for systemet som byggs just nu (satts i bestWithSpikes)
// "Saknas aldrig, ta en som ar nast pa tur" (anvandaren 2026-10-02 kvall): finns ingen skrallspik pa 35-47 % for B (A har
// den, eller ingen finns) raknas nasta kandidat ur skrallQueue ocksa som skrallspik ("i:k", satts i bestWithSpikes)
let extraSkrall = new Set();
const isSkrall = (e, i, k) => skrallOk(e, k) || extraSkrall.has(`${i}:${k}`);
// Kandidaterna nar ingen skrallOk gar: tecken som inte ar matchens favorit, inte A:s spik och inte redan skrallOk,
// narmast 35-47 % och med mest varde mot folket (avstand till fonstret + det som saknas till 3 procentenheter)
export function skrallQueue(events, setsA = null) {
  const out = [];
  events.forEach((e, i) => {
    const fav = e.final.indexOf(Math.max(...e.final));
    for (const k of [0, 1, 2]) {
      if (k === fav || e.folk?.[k] == null || skrallOk(e, k) || (setsA?.[i]?.length === 1 && setsA[i][0] === k)) continue;
      const p = e.final[k];
      const dist = p < SKRALL_SPIK.min ? SKRALL_SPIK.min - p : p > SKRALL_SPIK.max ? p - SKRALL_SPIK.max : 0;
      out.push({ i, k, p, folk: e.folk[k], score: dist + Math.max(0, SKRALL_SPIK.edge - (p - e.folk[k])) });
    }
  });
  return out.sort((a, b) => a.score - b.score || b.p - a.p);
}
// Sa manga kandidater i tur provas innan B far ga utan skrallspik
const SKRALL_NEXT_TRIES = 5;
// Kryss oftare i A och B (anvandaren 2026-10-03: "kryss missas mest"), aldrig i C. Backtest-reglage, av som standard:
//   STRYK_X_HALF=d  halvgardering med X far bonus d i valet av tecken (1X/X2 fore 12 nar krysset ligger inom d)
//   STRYK_X_SPIK=t  ingen favoritspik nar krysset ar >= t (skrallspik ej paverkad; gar det inte slapps regeln)
//   STRYK_X_W=w     krysset vags upp med w nar tecknen valjs (inte i reduceringen eller utdelningen)
//   STRYK_X_FOR=A   bara A (standard AB)
export const X_TILT = { half: Number(process.env.STRYK_X_HALF ?? 0), spik: Number(process.env.STRYK_X_SPIK ?? 1), w: Number(process.env.STRYK_X_W ?? 1), for: process.env.STRYK_X_FOR || 'AB' };
let xTiltOn = false; // satts i bestWithSpikes (opts.xTilt: A och B)
let xSpikMax = 1; // aktivt kryss-tak for favoritspik (slapps i grundCandidates om ingen kupong gar)
// Tackning for valet av tecken: kryss uppviktat (w) och halvgardering med kryss + bonus (half). Bara nar xTiltOn.
export function xCover(e, sub, tilt = X_TILT) {
  const base = sub.reduce((s, k) => s + e.final[k] * (k === 1 ? tilt.w : 1), 0);
  return sub.length === 2 && sub.includes(1) ? base + tilt.half : base;
}
const skrallOk = (e, k) => e.folk?.[k] != null && e.final[k] >= SKRALL_SPIK.min && e.final[k] <= SKRALL_SPIK.max && e.final[k] - e.folk[k] >= SKRALL_SPIK.edge;
// Fargregler (antal grona/gula/roda tecken per rad i garderingarna, spikar ar bla) ar aldrig 0-13 (anvandarens regel
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
// Stryktipset A 15 000 kr (gransfonster 15 000-25 000) sedan 2026-10-04 (anvandaren: "kor 15k pa A"). Backtest
// 107 omg (C av, data/stryktips-backtest-*-{tB2,utd15}.json): A chans 13 ratt 27,5 -> 39,9 % (summa), 11+ 12 -> 16, 10+ 32 -> 40,
// netto +13 088 -> +23 824 kr. B och C har kvar 50 000-75 000 kr, D 30 000-50 000 kr.
const UTD_MIN_BY_PRODUCT = { stryktipset: 15000, europatipset: 20000 };
// Kupong B (risksystemet): 50 000-75 000 kr pa bada spelen (anvandaren 2026-10-02 kvall: "oka B till 50k-75k", tidigare 30-50k)
const UTD_MIN_B = 50000, PAYOUT_BAND_B = 75 / 50;
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
// System A: troligaste tecknen per match. Motsystem B (setsA satt): valfria tecken, men aldrig exakt samma tecken som A
// pa nagon match - varken spik, halv- eller helgardering (anvandarens regel 2026-10-02, skarpt fran hogst 1 gemensam spik).
// Samma som webbens kupong B (2026-09-30: servern bygger A och B var for sig nar gransen ar exakt).
// loose = spik far laggas pa favoriten aven nar matchen inte bedomts som spikbar (reserv nar MIN_SPIKES annars inte gar).
// Spik bara nar favoriten har minst SPIK_MIN (0 = alltid tillatet). Backtest 2026-09-30 (38 ST / 55 ET omg): spikar pa
// favoriter 50-65 % sprack 40-49 %, pa >= 65 % 16-28 %. Stryktipset med 0,65: A+B -4 738 kr mot -22 557 (11+ 48 mot 23),
// C -6 341 mot -25 112 (11+ 51 mot 12). Europatipset blev samre (A+B -29 035 mot -24 797), dar ingen grans.
// Modellen ar for saker pa engelska favoriter. STRYK_SPIK_MIN overstyr (backtest).
// 2026-09-30 (sent): den fasta 65 %-gransen ar borttagen (anvandaren) - i stallet bedoms varje match (SPIK_CAL_MIN nedan).
const SPIK_MIN_BY_PRODUCT = { stryktipset: 0, europatipset: 0 };
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
const spikMinFor = (productId) => Number(process.env.STRYK_SPIK_MIN ?? SPIK_MIN_BY_PRODUCT[productId] ?? 0);
// Grundrad mot utdelningsgransen (2026-10-04): DP:n valjer grundrad efter chansen att ratt rad finns i grundraden, men
// gransen 30 000-50 000 kr stryker sedan favoritraderna. Extra kandidater fran DP:n med tecknens vikt
// p x folk^-beta (tecken folket understreckar vager tyngre) - valet gors anda efter kupongens chans efter alla regler.
// STRYK_GRUND_TILT = beta-varden (0 = vanlig chans). Backtest 107 omg (C av, data/stryktips-backtest-*-g-*.json):
// A chans 26,75 -> 27,46 % (hogre i alla tre perioderna), B 15,67 -> 16,66 %; '0,0.5' 27,20 %. Med A rod 1-3 eller
// 1-4 samre (26,53 / 25,22 %), rod 1-2 kvar. Samma i gui/public/stryk-engine.js (GRUND_TILT).
export const GRUND_TILT = (process.env.STRYK_GRUND_TILT ?? '0,0.3,0.5').split(',').map(Number).filter(Number.isFinite);
// B (byggs mot A, setsA) har egen, starkare lutning (2026-10-04, 107 omg, C av, data/stryktips-backtest-*-tB{1,2,3}.json):
// 0,0.3,0.5 (som A) chans 16,67 %, vantad aterbetalning 0,48 kr/kr; 0.5,0.8,1 16,35 % och 0,66 (12 ratt 3 -> 4);
// 1,1.5 9,33 % och 0,85. Infort 0.5,0.8,1: nastan samma chans men en tredjedel hogre utdelning nar B sitter.
// Samma i gui/public/stryk-engine.js (GRUND_TILT_B). STRYK_GRUND_TILT_B = egna beta-varden.
export const GRUND_TILT_B = (process.env.STRYK_GRUND_TILT_B ?? '0.5,0.8,1').split(',').map(Number).filter(Number.isFinite);
let grundTilt = 0;
// Andel av matchens vikt som garderingen sub tacker, med vikten p x folk^-beta (beta 0 = vanlig chans)
export function tiltShare(e, sub, beta) {
  if (!beta) return sub.reduce((sum, k) => sum + e.final[k], 0);
  const w = [0, 1, 2].map((k) => e.final[k] * (e.folk?.[k] || e.final[k]) ** -beta);
  return sub.reduce((sum, k) => sum + w[k], 0) / (w[0] + w[1] + w[2]);
}
// Kryss i C: bonusen hojs tills nagon grundrad tacker X_SHARE_C; gar det inte de som tacker mest
function xCands(events, run) {
  if (!xShareOn) return run();
  let best = [], top = -1;
  for (const lam of X_LAMS) {
    xLam = lam;
    try {
      const c = run().map((x) => ({ x, s: xShareOf(events, x.sets) }));
      const ok = c.filter((y) => y.s >= X_SHARE_C - 1e-9);
      if (ok.length) return ok.map((y) => y.x);
      const m = Math.max(-1, ...c.map((y) => y.s));
      if (m > top) { top = m; best = c.filter((y) => y.s === m).map((y) => y.x); }
    } finally { xLam = 0; }
  }
  return best;
}
function grundCandidates(events, maxRows, spikMin = 0, setsA = null, loose = false) {
  const seen = new Set(), out = [];
  const prev = grundTilt;
  try {
    const tilts = setsA || cTiltOn ? GRUND_TILT_B : GRUND_TILT;
    for (const t of tilts.length ? tilts : [0]) {
      grundTilt = t;
      for (const c of xCands(events, () => grundCandidates1(events, maxRows, spikMin, setsA, loose))) {
        const k = c.sets.map((x) => x.join('')).join('|');
        if (!seen.has(k)) { seen.add(k); out.push(c); }
      }
    }
  } finally { grundTilt = prev; }
  return out;
}
function grundCandidates1(events, maxRows, spikMin = 0, setsA = null, loose = false) {
  const SUBSETS = [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  const fav = (e) => e.final.indexOf(Math.max(...e.final));
  // Spik: matchens egen bedomning (e.spik) om den finns, annars favoritchansen mot spikMin; loose = aven favoriten
  const strictOk = (e, k) => (e.spik ? e.spik.fav === SIGNS[k] && e.spik.spikbar : e.final[k] >= spikMin);
  // Reservspik (loose) bara nar krysset ar under SPIK_X_MAX (backtest); gar det inte provas utan taket
  // Reservspik bara pa omgangens spikTop starkaste favoriter (A och C, se SPIK_TOP) och, som backtest-reglage, nar
  // krysset ar under spikXMax
  const topP = spikTop ? events.map((e) => Math.max(...e.final)).sort((x, y) => y - x)[spikTop - 1] ?? 0 : 0;
  const spikOk1 = (e, k) => strictOk(e, k) || (loose && k === fav(e) && e.final[1] < spikXMax && e.final[k] >= topP);
  const spikOk0 = (e, k) => spikOk1(e, k) && !(FALL_SPIK && !setsA && canFall(e, k)) && !(!setsA && overStreck(e, k));
  // Kryss-tak for favoritspik i A och B (STRYK_X_SPIK): spik pa 1/2 bara nar krysset ar under xSpikMax
  const spikOk = (e, k) => spikOk0(e, k) && (!xTiltOn || k === 1 || e.final[1] < xSpikMax);
  const sameA = (x, i) => setsA?.[i]?.length === x.length && x.every((k, j) => k === setsA[i][j]);
  // B arver A:s spik (anvandaren 2026-10-03: "A och B far inte ha samma garderingar men max 1 spik skilja")
  const inheritA = (x, i) => B_INHERIT && x.length === 1 && setsA?.[i]?.length === 1 && setsA[i][0] === x[0];
  // Matcher dar A och B skiljer sig pa spik: nagon av dem spikar och de har inte samma spik (hogst AB_SPIK_DIFF)
  const spikDiff = (x, i) => (B_INHERIT && setsA && (x.length === 1 || setsA[i].length === 1) && !inheritA(x, i) ? 1 : 0);
  // Ingen helgardering dar alla tecken ar gula (anvandaren 2026-10-02: "3 gula helor ar exakt samma sak som bla helor")
  // Kryss dar folket missar det (X_FOLK, A och B): ingen 1-2 - favorit + X i stallet (laggs till i options0)
  const xFolkHere = (e) => xFolkOn && e.final.indexOf(Math.max(...e.final)) !== 1 && xFolk(e);
  const options = (e, i) => options0(e, i).filter((x) => (x.length < 3 || !allYellowMatch(e)) && !(xFolkHere(e) && x.length === 2 && !x.includes(1)));
  const options0 = (e, i) => {
    if (setsA) return SUBSETS.filter((x) => inheritA(x, i) || ((x.length > 1 || spikOk(e, x[0]) || (skrallCount > 0 && isSkrall(e, i, x[0]))) && !sameA(x, i)));
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    const subs = [1, 2, 3].filter((n) => n > 1 || spikOk(e, order[0])).map((n) => order.slice(0, n).sort());
    // Kryss oftare (A): halvgardering favorit + X som alternativ, valet gors av xCover i DP:n
    if (xTiltOn && order[0] !== 1 && !subs.some((x) => x.length === 2 && x.includes(1))) subs.push([order[0], 1].sort());
    // Kryss dar folket missar det (X_FOLK): favorit + X i stallet for 1-2 nar folket ger krysset under X_FOLK.folk och
    // vi minst X_FOLK.p. Folket streckar da krysset for lagt (historiken 2023-2026: X foll 18-22 % mot folkets 10-17 %).
    if (xFolkHere(e) && !subs.some((x) => x.length === 2 && x.includes(1))) subs.push([order[0], 1].sort());
    // Halvgardering favorit + skrall (rott tecken) sa att grundraden kan fa med roda
    for (const k of [0, 1, 2]) if (k !== order[0] && isRed(e, k) && !subs.some((x) => x.length === 2 && x.includes(order[0]) && x.includes(k))) subs.push([order[0], k].sort());
    // Skrallspik (runt 40 %, varde mot folket)
    if (skrallCount > 0) for (const k of [0, 1, 2]) if (isSkrall(e, i, k) && !subs.some((x) => x.length === 1 && x[0] === k)) subs.push([k]);
    return subs;
  };
  // Nyckel: halv, hel, reservspikar (spik pa favorit som inte bedomts som spikbar), roda tecken i garderingarna (hogst MIN_RED),
  // skrallspikar (hogst skrallCount) och, i B, matcher dar spiken skiljer sig fran A (hogst AB_SPIK_DIFF)
  let dp = new Map([['0,0,0,0,0,0,0', { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f, l, rc, sk, ay, sd] = key.split(',').map(Number);
      for (const sub of options(e, i)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        const nd = sd + spikDiff(sub, i);
        if (nd > AB_SPIK_DIFF) continue;
        // A:s spik i B raknas inte som reservspik (A har redan bedomt den)
        const free = sub.length === 1 && !strictOk(e, sub[0]) && !inheritA(sub, i);
        const skr = free && skrallCount > 0 && isSkrall(e, i, sub[0]);
        const ns = sk + (skr ? 1 : 0), nl = l + (free && !skr ? 1 : 0);
        if (ns > skrallCount || 2 ** nh * 3 ** nf > maxRows) continue;
        const lp = st.lp + Math.log(xTiltOn ? xCover(e, sub) : tiltShare(e, sub, grundTilt)) + (xLam && sub.includes(1) ? xLam * e.final[1] : 0);
        // Räknas per match (två röda tecken på samma match kan aldrig båda gå in – användaren 2026-10-02)
        const nr = Math.min(minRed, rc + (sub.length > 1 && sub.some((x) => isRed(e, x)) ? 1 : 0));
        // Helgula garderingar bara som de bla halvorna (hogst BLUE_HALVES) - fler ger anda alltid en gul per rad (2026-10-02)
        const nay = ay + (sub.length > 1 && allYellowMatch(e) ? 1 : 0);
        if (nay > ayLimit) continue;
        const k = `${nh},${nf},${nl},${nr},${ns},${nay},${nd}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub], nl, nr, ns });
      }
    }
    dp = next;
  });
  // Antal spikar = 13 - halv - hel, sa gransen kan tas efter DP:n utan att basta grundrad per nyckel tappas.
  // Reservspikar bara for att na MIN_SPIKES: med reservspik blir det exakt MIN_SPIKES spikar.
  // B: helgardering bara dar A inte helgarderar - pa A:s halvor och hogst en av A:s spikar (AB_SPIK_DIFF). Har A sa manga
  // helor att MIN_HELG inte gar i B blir det sa manga som gar (A/B-regeln gar fore, 2026-10-03). Samma som stryk-engine.js.
  // (inte pa matcher dar alla tecken ligger pa 26-44 % - dar blir det aldrig helgardering)
  const helgOk = (i) => !allYellowMatch(events[i]);
  const minHelg = setsA && B_INHERIT ? Math.min(MIN_HELG, setsA.filter((x, i) => x.length === 2 && helgOk(i)).length + Math.min(AB_SPIK_DIFF, setsA.filter((x, i) => x.length === 1 && helgOk(i)).length)) : MIN_HELG;
  const spikesOk = (st) => { const n = st.sets.filter((x) => x.length === 1).length; return n >= MIN_SPIKES && n <= MAX_SPIKES && (st.nl === 0 || n === MIN_SPIKES || loose === 'max') && st.sets.filter((x) => x.length === 3).length >= minHelg && st.sets.filter((x) => x.length === 2).length >= BLUE_HALVES && (st.ns || 0) >= skrallMin; };
  const okList = [...dp.values()].filter(spikesOk);
  // Gar det inte med hogst BLUE_HALVES helgula garderingar (for fa spikbara matcher) slapps den gransen
  // Kryss-taket for favoritspik slapps forst om ingen kupong gar (for fa matcher med lagt kryss)
  if (!okList.length && loose && xTiltOn && xSpikMax < 1) {
    const prev = xSpikMax; xSpikMax = 1;
    try { return grundCandidates1(...arguments); } finally { xSpikMax = prev; }
  }
  if (!okList.length && loose && (spikXMax < 1 || spikTop)) {
    const prev = [spikXMax, spikTop]; spikXMax = 1; spikTop = 0;
    try { return grundCandidates1(...arguments); } finally { [spikXMax, spikTop] = prev; }
  }
  if (!okList.length && ayLimit < 13 && loose) {
    ayLimit++;
    try { return grundCandidates1(...arguments); } finally { ayLimit--; }
  }
  // Minst MIN_RED roda i garderingarna; gar det inte sa manga som gar
  const most = okList.reduce((m, st) => Math.max(m, st.nr), 0);
  return okList.filter((st) => st.nr >= most).map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: st.sets.reduce((h, x, i) => h * x.reduce((sum, k) => sum + events[i].final[k], 0), 1), sets: st.sets, ayMax: ayLimit,
    picks: st.sets.map((x) => ({ signs: x.map((k) => SIGNS[k]).join(''), type: x.length === 1 ? 'Spik' : x.length === 2 ? 'Halvgardering' : 'Helgardering' })),
  }));
}

// Basta system med MIN_SPIKES-MAX_SPIKES spikar. Finns for fa spikbara matcher provas spik pa favoriten (rules.spikLoose).
// Utdelningsgransen gar fore spikbedomningen (2026-10-02): 30 000-50 000 kr provas med bada spikvarianterna innan
// lagsta grans som gar, sist hojd grans. Samma ordning som buildWithLadder i stryk-engine.js.
const SIGN_STEPS = [[3, 2, 2], [3, 1, 1], [2, 1, 1]];
// opts.redRules = rodreglerna for systemet (B: RED_RULES_B), annars RED_RULE
function bestWithSpikes(events, spikMin, setsA, opts, exclude = null) {
  const prev = [redRules, skrallMin, extraSkrall, minRed, spikTop, xTiltOn, xSpikMax, blueXOn, skrallCount, xFolkOn, overSpikOn, xShareOn, cTiltOn];
  // Kryss i C (X_SHARE_C) och C:s lutning (C_TILT)
  xShareOn = opts.sys === 'C' && X_SHARE_C > 0;
  cTiltOn = opts.sys === 'C' && C_TILT;
  // A (opts.sys 'A') utan skrallspik om SKRALL_A ar av; kryss dar folket missar det (X_FOLK) i A och B;
  // ingen spik pa overstreckad favorit (OVER_SPIK) i A och C
  skrallCount = opts.sys === 'A' && !SKRALL_A ? 0 : SKRALL_SPIK.count;
  xFolkOn = Boolean(opts.xTilt) && X_FOLK.on;
  overSpikOn = !setsA && OVER_SPIK > 0;
  blueXOn = Boolean(opts.blueX);
  spikTop = setsA ? SPIK_TOP_B : SPIK_TOP;
  minRed = opts.minRed || MIN_RED;
  redRules = opts.redRules || [RED_RULE];
  skrallMin = opts.skrallMin || 0;
  extraSkrall = opts.extraSkrall || new Set();
  xTiltOn = Boolean(opts.xTilt) && (X_TILT.half > 0 || X_TILT.spik < 1 || X_TILT.w !== 1);
  xSpikMax = xTiltOn ? X_TILT.spik : 1;
  try {
    const best = bestWithSpikesRules(events, spikMin, setsA, opts, exclude);
    // Kryss-taket for spik far aldrig kosta utdelningsgransen: haller den inte provas utan taket
    if (xTiltOn && xSpikMax < 1 && best?.reduced?.rules?.payoutExact !== true) {
      xSpikMax = 1;
      const alt = bestWithSpikesRules(events, spikMin, setsA, opts, exclude);
      if (alt?.reduced?.rules?.payoutExact === true || !best) return alt;
    }
    return best;
  } finally { [redRules, skrallMin, extraSkrall, minRed, spikTop, xTiltOn, xSpikMax, blueXOn, skrallCount, xFolkOn, overSpikOn, xShareOn, cTiltOn] = prev; }
}
// Bla X far inte kosta andra regler (anvandaren 2026-10-03): kupongen byggs forst med en bla halva med X. Slapper den
// nagon regel byggs den aven utan, och den som slapper farre regler vinner (lika: bla X). Samma som withBlueX i stryk-engine.js.
// Stryktipset 4973 B: med bla X foll rod 1-5/2-5 till 1-3 och "3 roda + grona" fick stoppas; utan holl bada.
const relaxScore = (b) => {
  if (!b) return Infinity;
  const r = b.reduced.rules;
  return [r.payoutExact !== true, r.redFallback, r.skrallMissing, r.redGreenFree, r.redGreenSignsFree, r.colorsFree, r.yellowFull === false,
    r.signMinRule && r.signMin.join() !== r.signMinRule.join()].filter(Boolean).length;
};
// Kupongen med bla X valjs bara om den har en bla halva med X: annars kunde motorn valja en samre grundrad helt utan
// X-halvor sa att regeln aldrig gallde (backtest Stryktipset 4834: A utan X-halvor, sedan gick B inte att bygga).
const hasBlueX = (b) => Boolean(b?.reduced.rules.blueHalves?.some((i) => b.system.sets[i].includes(1)));
function withBlueX(build) {
  if (!BLUE_X) return build(false);
  const b = build(true);
  if (hasBlueX(b) && relaxScore(b) === 0) return b;
  const b0 = build(false);
  if (!b0 || (hasBlueX(b) && relaxScore(b) <= relaxScore(b0))) return b;
  if (b0.system.sets.some((x) => x.length === 2 && x.includes(1))) b0.reduced.rules = { ...b0.reduced.rules, blueXOff: true };
  return b0;
}
// Risksystemen B och C (anvandaren 2026-10-02 kvall): rod 1-4/2-4, rott pa minst MIN_RED_B matcher, utdelning
// opts.payoutMin x PAYOUT_BAND_B (50 000-75 000 kr) och alltid en skrallspik. Gransen gar fore risken (gransen "far inte
// roras"): rod 1-4/2-4 gav for manga rader over taket i 21 av 107 omgangar. Ordning: skrallspik pa 35-47 % (risk, sedan
// rod 1-3), sedan nasta skrallkandidat i tur (skrallQueue, "saknas aldrig") pa samma satt, sist utan skrallspik - forsta som
// haller gransen. rules.redFallback = rod 1-3, rules.skrallNext = kandidaten i tur, rules.skrallMissing = ingen skrallspik.
// Haller inget gransen blir det det forsta som gick. setsA = A:s grundrad som B inte far upprepa (C: null).
// riskC = RISK_C (kupong C): rod 2-6 och rott pa allt fler matcher tills hogsta raden nar maxRowMin (rules.maxRowPayout)
function bestRisk(events, spikMin, setsA, opts, exclude = null, riskC = null) {
  if (riskC) {
    let top = null;
    for (const mr of riskC.minReds) {
      const r = bestRiskOnce(events, spikMin, setsA, { ...opts, minRed: mr }, exclude, riskC.redRules);
      if (!r) continue;
      const maxRow = Math.max(...r.reduced.rowReal);
      r.reduced = { ...r.reduced, rules: { ...r.reduced.rules, maxRowPayout: Math.round(maxRow), minRedMatches: mr, ...(maxRow >= riskC.maxRowMin ? {} : { maxRowShort: true }) } };
      const holds = r.reduced.rules.payoutExact === true;
      if (holds && maxRow >= riskC.maxRowMin) return r;
      if (!top || (holds && top.reduced.rules.payoutExact !== true) || (holds === (top.reduced.rules.payoutExact === true) && maxRow > top.reduced.rules.maxRowPayout)) top = r;
    }
    return top;
  }
  return bestRiskOnce(events, spikMin, setsA, opts, exclude, RED_RULES_B);
}
function bestRiskOnce(events, spikMin, setsA, opts, exclude, riskRed) {
  const queue = skrallQueue(events, setsA).slice(0, SKRALL_NEXT_TRIES);
  const fb = (setsA ? RED_FALLBACK.B : RED_FALLBACK.C).map((x) => [x]);
  const steps = [null, ...queue].flatMap((c) => [[riskRed, SKRALL_MIN_B, c], ...fb.map((x) => [x, SKRALL_MIN_B, c])]).concat([[riskRed, 0, null], ...fb.map((x) => [x, 0, null])]);
  // Forsta som haller gransen med fasta farger vinner; annars den forsta som haller gransen, annars den forsta
  let best = null, exact = null;
  for (const [redRulesX, sk, c] of steps) {
    const r = bestWithSpikes(events, spikMin, setsA, { minRed: MIN_RED_B, ...opts, payoutBand: PAYOUT_BAND_B, redRules: redRulesX, skrallMin: sk, extraSkrall: c ? new Set([`${c.i}:${c.k}`]) : null }, exclude);
    if (!r) continue;
    r.reduced = { ...r.reduced, rules: { ...r.reduced.rules, payoutBand: PAYOUT_BAND_B, ...(redRulesX === riskRed ? {} : { redFallback: true }), ...(sk ? {} : { skrallMissing: true }),
      ...(c ? { skrallNext: { match: c.i + 1, sign: SIGNS[c.k], p: r3(c.p), folk: r3(c.folk) } } : {}) } };
    if (!best) best = r;
    if (r.reduced.rules.payoutExact === true) {
      if (!r.reduced.rules.colorsFree) return r;
      if (!exact) exact = r;
    }
  }
  return exact || best;
}
function bestWithSpikesRules(events, spikMin, setsA, opts, exclude = null) {
  // 'max' (anvandaren 2026-10-02: "om du inte far in systemet far du minska strecken pa annat hall"): gar gransen
  // 30 000-50 000 kr inte att halla far fler favoriter spikas, upp till MAX_SPIKES - bara med fast grans
  const cands = new Map([false, true, 'max'].map((loose) => [loose, grundCandidates(events, GRUND_MAX_ROWS, spikMin, setsA, loose)]));
  // Gransen 30 000-50 000 kr gar aven fore teckenreglerna (anvandaren 2026-10-02: "30-50k ar minsta utdelningen"): med fast
  // grans provas lagre teckenregler (aldrig under 2-1-1) innan gransen far bli hogre. rules.signMinRule = spelets regel.
  const signMin = opts.signMin || SIGN_MIN.A;
  const lower = SIGN_STEPS.filter((x) => x.join() !== signMin.join() && x.every((v, k) => v <= signMin[k]));
  // Rod max + resten grona (redGreenRows) gar fore utdelningsgrans och allt annat - hellre ett mindre system
  // (anvandaren 2026-10-02: "minska systemet om du maste"). Slapps bara om ingen kupong alls gar att bygga.
  for (const rg of ['signs', 'colors', false]) {
  redGreenFull = rg;
  for (const mode of (opts.exactFloor ?? EXACT_FLOOR) ? [true, 'near', false] : [false]) {
    // Gult skar aldrig (anvandaren 2026-10-03: bara tre farger i Gambling Cabin - bla, gron, rod; gult ar bla utan regel)
    for (const yf of [true]) {
    yellowFull = yf;
    for (const sm of mode === true ? [signMin, ...lower] : [signMin]) {
      for (const loose of mode === true ? [false, 'max'] : [false, true]) {
        const best = bestReduced(events, cands.get(loose), { ...opts, signMin: sm, exactModes: [mode] }, exclude);
        if (!best) continue;
        yellowFull = true;
        redGreenFull = 'signs';
        for (const r of [best.reduced, ...(best.pair || [])]) r.rules = { ...r.rules, ...(rg ? {} : { redGreenFree: true }), ...(rg === 'colors' ? { redGreenSignsFree: true } : {}), spikLoose: loose, signMinRule: signMin, yellowFull: yf, ...(best.system.ayMax > BLUE_HALVES ? { allYellowMax: best.system.ayMax } : {}) };
        return best;
      }
    }
    }
    yellowFull = true;
  }
  }
  redGreenFull = 'signs';
  // Sista reserv: ingen kupong alls med gron 3-6 och rodregeln (A 1-3, B 1-4/2-4) - fargerna optimeras fritt (rules.colorsFree)
  if (fixedColors) {
    fixedColors = false;
    try {
      const best = bestWithSpikes(events, spikMin, setsA, opts, exclude);
      if (best) for (const r of [best.reduced, ...(best.pair || [])]) r.rules = { ...r.rules, colorsFree: true };
      return best;
    } finally { fixedColors = true; }
  }
  return null;
}

const isRed = (e, k) => signColor(e.folk?.[k]) === 'red';
let ayLimit = BLUE_HALVES;
let spikXMax = Number(process.env.STRYK_SPIK_X_MAX ?? 1); // kryss-tak for reservspikar (1 = av)
// Reservspik (favorit som inte bedomts spikbar) bara pa omgangens SPIK_TOP starkaste favoriter, i A och C (anvandaren
// 2026-10-03: "kanske kan fa en annan spik istallet"). Backtest 107 omg: svaga reservspikar satt 34-43 % medan en
// starkare garderad favorit hade suttit 68-79 %. Med top 4: spiktraff A 53 -> 56 %, C 41 -> 47 %, chans C 0,21 -> 0,27 %,
// 11+ ratt C 12 -> 15 omg. B blev samre (44,5 mot 46,5 %, B far inte valja A:s tecken) och har kvar gamla regeln.
// Gar det inte provas utan regeln. data/stryktips-backtest-*-spiktop4.json, docs/lardomar/slutsatser.md
const SPIK_TOP = Number(process.env.STRYK_SPIK_TOP ?? 4); // A och C (0 = av)
// A och B (anvandaren 2026-10-03): aldrig samma gardering pa samma match, men hogst 1 spik far skilja - B arver A:s spikar
// utom pa hogst en match (B:s skrallspik, eller en av A:s spikar som B garderar). Ersatter "inte ens samma spik".
export const AB_SPIK_DIFF = Number(process.env.STRYK_AB_SPIK_DIFF ?? 1);
// B arver A:s spikar (B_INHERIT). Motsystem (aldrig samma tecken, inte ens spiken) provat 2026-10-04, 107 omg med samma
// regler for ovrigt: B chans 13 ratt 16,7 -> 12,7 % (summa), A+B 43,8 -> 39,3 %, 12 ratt 3 -> 1, B gick inte att bygga i
// 4 omg (A med 8-9 helor) och gransen holl 103/107. Arvet behalls (anvandaren 2026-10-04). B:s nettoras samma dag kom fran
// ovriga regelandringar, inte arvet. data/stryktips-backtest-*-{arvB,motB}.json. STRYK_B_INHERIT=0 = motsystem.
export const B_INHERIT = process.env.STRYK_B_INHERIT !== '0';
// Skrallspik i A (35-47 %). Historiken 2023-2026: A:s spikar under 50 % holl bara ca 38 %, och i omgangar over 50 000 kr
// sprack halften av A:s spikar. Men backtest 2026-10-03 (107 omg) utan skrallspik i A: samma chans (23,87 mot 23,98 %),
// spikar sprack 45 mot 46 % och A:s enda 13:a forsvann - kvar som standard. STRYK_SKRALL_A=0 tar bort den ur A.
const SKRALL_A = process.env.STRYK_SKRALL_A !== '0';
let skrallCount = SKRALL_SPIK.count; // for systemet som byggs just nu (satts i bestWithSpikes)
// Ingen spik pa en favorit (1 eller 2) som folket streckar minst OVER_SPIK over var chans (A och C). Historiken 2023-2026:
// overstreckad favorit (folket minst 10 %-enheter over oddsen) vann 54 % mot folkets 64 %. Av som standard: backtest
// 2026-10-03 (107 omg) med 0,1 gav A chans 23,98 -> 21,22 % och fler spruckna spikar (48 mot 46 %) - marknaden
// prissatter redan favoriten ratt, folket ar det som overstreckar. STRYK_OVER_SPIK=0.1 slar pa (backtest).
export const OVER_SPIK = Number(process.env.STRYK_OVER_SPIK ?? 0);
let overSpikOn = false;
const overStreck = (e, k) => overSpikOn && k !== 1 && k === e.final.indexOf(Math.max(e.final[0], e.final[2])) && (e.folk?.[k] ?? 0) - e.final[k] >= OVER_SPIK;
// Kryss dar folket missar det (A och B): favorit + X i stallet for 1-2 nar folket ger krysset under folk och var chans ar
// minst p. Historiken 2023-2026: folket under 15 % -> X foll 18 %, 15-19 % -> 22 %. Pa som standard sedan 2026-10-03:
// backtest 107 omg (tre farger + A/B-regeln) A oforandrad (traffar ca 0,7 matcher per omgang), B chans 14,22 -> 14,39 %,
// netto -34 238 -> -33 899 kr. STRYK_X_FOLK="0.2,0.22" (standard), "off" = av.
export const X_FOLK = (() => { const v = (process.env.STRYK_X_FOLK ?? '0.2,0.22').split(',').map(Number); return { on: v.length === 2 && v.every(Number.isFinite), folk: v[0], p: v[1] }; })();
let xFolkOn = false;
const xFolk = (e) => (e.folk?.[1] ?? 1) < X_FOLK.folk && e.final[1] >= X_FOLK.p;
const SPIK_TOP_B = Number(process.env.STRYK_SPIK_TOP_B ?? 0); // B
let spikTop = SPIK_TOP; // regeln for systemet som byggs just nu (satts i bestWithSpikes)
// "Kan falla" (2026-10-03): favorit (1 eller 2) som folket streckar minst 50 % men som har under 55 % chans hos oss.
// 107 omg PL/CH/L1: 4,4 per omgang, foll 57 % (vantat 52). A:s spikar pa dem foll 27 av 34 (vantat 16,4, z 3,6, alla tre
// perioderna), B:s 65 av 123 (vantat 62). STRYK_FALL_SPIK=1: A och C spikar inte sadana favoriter (backtest-reglage).
const FALL = { folk: 0.5, p: 0.55 };
const canFall = (e, k) => k !== 1 && k === e.final.indexOf(Math.max(e.final[0], e.final[2])) && (e.folk?.[k] ?? 0) >= FALL.folk && e.final[k] < FALL.p;
const FALL_SPIK = process.env.STRYK_FALL_SPIK === '1';
const allYellowMatch = (e) => [0, 1, 2].every((k) => signColor(e.folk?.[k]) === 'yellow');
// Bla garderingar (index): bla i lanken och fria fran fargreglerna. Samma som stryk-engine.js.
// Exakt BLUE_HALVES halvgarderingar bla ("2 halvor bla alltid"): helgula forst, sedan de sakraste utan rott tecken.
// Kryss i annan farg an rott (anvandaren 2026-10-03): folket streckar X 17-30 % (median 24 %, aldrig 45 %), sa X ar rott
// i 60 % av matcherna och maste dela A:s 1-3 roda platser med skrallarna. En bla halva har alltid X i A och B (STRYK_BLUE_X=0 stanger av).
const BLUE_X = process.env.STRYK_BLUE_X !== '0';
let blueXOn = false; // satts i bestWithSpikes (opts.blueX: A och B, aldrig C)
function blueHalves(events, sets) {
  const allYellow = (set, i) => set.length > 1 && set.every((k) => signColor(events[i].folk?.[k]) === 'yellow');
  // Inga bla helgarderingar (anvandaren 2026-10-02: "helor behover vi inte ha nagon som ar bla")
  const blue = new Set();
  const cover = ({ i, set }) => set.reduce((s, k) => s + events[i].final[k], 0);
  const red = ({ i, set }) => (set.some((k) => isRed(events[i], k)) ? 1 : 0);
  const yel = ({ i, set }) => (allYellow(set, i) ? 0 : 1);
  sets.map((set, i) => ({ i, set })).filter(({ set }) => set.length === 2)
    .sort((a, b) => yel(a) - yel(b) || red(a) - red(b) || cover(b) - cover(a) || a.i - b.i)
    .slice(0, BLUE_HALVES).forEach(({ i }) => blue.add(i));
  // Minst en bla halva med kryss i A och B (blueXOn): saknas den tar en halva med X den sista bla platsen - helst utan
  // rott tecken (roda behovs i rod-regeln, B rod 1-5/2-5), sedan storst kryss
  if (blueXOn && blue.size && ![...blue].some((i) => sets[i].includes(1))) {
    const xi = sets.map((set, i) => ({ i, set })).filter(({ set }) => set.length === 2 && set.includes(1))
      .sort((a, b) => red(a) - red(b) || events[b.i].final[1] - events[a.i].final[1] || a.i - b.i)[0]?.i;
    if (xi != null) { blue.delete([...blue].at(-1)); blue.add(xi); }
  }
  return blue;
}
function signColor(folkP) {
  if (folkP == null) return 'yellow';
  return folkP >= COLOR.green ? 'green' : Math.round(folkP * 100) <= COLOR.red * 100 ? 'red' : 'yellow';
}

// Fargregler. all = rader sorterade pa utdelning (hogst forst), r.c = [grona, gula, roda] over alla 13 matcher.
// Med band (scripts/lib/stryk-color-bands.mjs, ratt rad senaste aret, bara Stryktipset): 'outer' = min/max aldrig utanfor
// det som hant, optimeras fritt dar; 'core' (bara backtest) = min <= p10 och max >= p90. Roda: max RED_MAX_OPTIONS
// (anvandaren 2026-09-30: snittet ar 1,9, men 3-4 roda ger de stora vinsterna). Utan band: hogst COLOR_TRIM steg in.
// Kombinationerna rangordnas efter chansen i de `target` forsta raderna som klarar reglerna; vid lika vinner snavast.
const COLOR_KEYS = ['green', 'yellow', 'red'];
// Rorliga fargfonster per omgang (anvandaren 2026-09-30: inte fasta, inte snava). Vantat antal grona/gula/roda i ratt
// rad = summan av vara procent for tecknen med den fargen (alla 13 matcher). Fonstret for hela raden har bredd DYN_WIDTHS
// (4 = t.ex. 5-9, fem mojliga antal) och innehaller alltid det vantade antalet. Spikar ar bla i GC och raknas inte dar,
// sa spikarnas farger dras av (3 grona spikar: 5-9 -> 2-6 i garderingarna). Fonstren rangordnas
// efter chansen som ovan. Gar inget fonster att halla optimeras fargerna fritt (colorTarget: false).
// STRYK_COLOR_TARGET=0 stanger av, STRYK_DYN_W="3,4" styr bredderna (backtest).
const COLOR_TARGET = process.env.STRYK_COLOR_TARGET !== '0';
const DYN_WIDTHS = (process.env.STRYK_DYN_W || '3,4').split(',').map(Number);
function colorExpected(events, colors) {
  const exp = [0, 0, 0];
  events.forEach((e, i) => [0, 1, 2].forEach((k) => { exp[COLOR_KEYS.indexOf(colors[i][k])] += e.final[k]; }));
  return exp;
}
function dynamicRanges(events, grund, colors, blue = new Set()) {
  const spik = [0, 0, 0];
  grund.sets.forEach((set, i) => { if (set.length === 1) spik[COLOR_KEYS.indexOf(colors[i][set[0]])]++; });
  // Bla halvgarderingar raknas inte i fargreglerna, sa deras matcher ingar inte i det vantade antalet
  const exp = colorExpected(events.filter((_, i) => !blue.has(i)), colors.filter((_, i) => !blue.has(i)));
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
function colorRuleOptions(all, minRows, target, bands = null, fixed = null, triples = null, redAtLeast = 0) {
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
  for (const [g, y, rd] of fittedRules(ranges, triples, redAtLeast)) {
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
const fitsColors = (c, r) => c[0] >= r[0][0] && c[0] <= r[0][1] && c[1] >= r[1][0] && c[1] <= r[1][1] && c[2] >= r[2][0] && c[2] <= r[2][1];
// Fargtripletter [grona, gula, roda] som en rad i grundraden kan fa (spikar ar bla och raknas inte).
// colorIdx[i][k] = fargindex for tecken k i match i.
function colorTriples(sets, colorIdx, blue = new Set()) {
  let out = new Set(['0,0,0']);
  sets.forEach((set, i) => {
    if (set.length < 2 || blue.has(i)) return;
    const next = new Set();
    for (const key of out) {
      const c = key.split(',').map(Number);
      for (const ci of new Set(set.map((k) => colorIdx[i][k]))) { const d = c.slice(); d[ci]++; next.add(d.join(',')); }
    }
    out = next;
  });
  return [...out].map((k) => k.split(',').map(Number));
}
// Fargreglerna ska hanga ihop (anvandaren 2026-10-02: 13 garderingar med gula 8-11 och grona 4-7 lamnar bara 1 tecken
// till rott, sa "roda 0-2" kunde aldrig nas). Rod max gar fore - skrallarna ger de stora vinsterna: racker raden inte till
// sanks min for gult eller gront (den med hogst min forst) ett steg i taget tills rod max gar att na. Sedan dras varje
// min/max in till det som faktiskt gar att na i grundraden, sa att Gambling Cabin-lanken aldrig har doda granser.
// null = ingen rad klarar reglerna. Samma som gui/public/stryk-engine.js.
function fitColorRule(rule, triples, redAtLeast = 0) {
  const r = rule.map((x) => x.slice());
  r[2][1] = Math.max(r[2][1], redAtLeast);
  const inside = () => triples.filter((t) => fitsColors(t, r));
  const redTop = () => inside().reduce((m, t) => Math.max(m, t[2]), -1);
  const want = Math.min(r[2][1], triples.reduce((m, t) => Math.max(m, t[2]), 0));
  while (redTop() < want) {
    const c = r[0][0] >= r[1][0] ? 0 : 1;
    if (r[c][0] > 0) r[c][0]--; else if (r[1 - c][0] > 0) r[1 - c][0]--; else break;
  }
  const f = inside();
  if (!f.length) return null;
  return [0, 1, 2].map((c) => [Math.min(...f.map((t) => t[c])), Math.max(...f.map((t) => t[c]))]);
}
// Farger som finns i garderingarna (nagon rad kan fa minst ett sadant tecken). Ovriga ar av i lanken.
// Gult finns aldrig (anvandaren 2026-10-03: bara bla, gron och rod i Gambling Cabin - gula tecken ar bla utan regel)
const colorsPresent = (triples) => [0, 1, 2].map((c) => c !== 1 && (!triples || triples.some((t) => t[c] > 0)));
// Fargreglerna ar aldrig ett exakt antal (min = max) och tva farger har aldrig samma fonster (anvandaren 2026-10-02:
// "farger ska aldrig vara samma antal, 2-2 t.ex."). Farger som inte finns i garderingarna raknas inte. Samma som stryk-engine.js.
function colorRuleOk(rule, present = [true, true, true]) {
  const on = [0, 1, 2].filter((c) => present[c]);
  return on.every((c) => rule[c][1] > rule[c][0]) && on.every((c, j) => on.slice(j + 1).every((d) => rule[d].join() !== rule[c].join()));
}
// Kandidaterna efter fitColorRule, utan dubbletter. Bara regler som klarar colorRuleOk - finns ingen far de andra vara med.
// Fasta fargregler for A, B och C (anvandaren 2026-10-02): rod alltid 1-3 (folket 25 % eller lagre), gron alltid 4-6.
// Gult valjs fritt men aldrig exakt och aldrig samma fonster som gront eller rott. Rod/gron star kvar aven om gransen inte
// gar att na. fixedColors stangs av bara som sista reserv nar ingen kupong alls gar att bygga (star i kupongen).
const redEnv = (k) => process.env[k]?.split(';').map((r) => r.split(',').map(Number));
// 2026-10-03 (natt): A röd 1-2 (förut 1-3). 30 iterationer, 107 omg: A chans 13 ratt 23,98 -> 25,49 % (med CUT_AIM 0,9:
// 26,71 %), 12 ratt 4 -> 5, 11 ratt 5 -> 8, grundrad 9,94 -> 10,34 ratt, 30 000-50 000 kr holl i 105 av 107 omg (89).
// Farre roda per rad tar bort osannolika rader sa att utdelningsgransen kan ligga lagt. Rod 1-4 och 2-5 var samre.
const RED_RULE = redEnv('STRYK_RED_A')?.[0] || [1, 2];
// Reserv nar risk-rodregeln inte haller utdelningsgransen (rules.redFallback): B 1-2 som A (backtest 107 omg: B chans
// 10,62 % med 1-3 mot 12,27 % med 1-2), C kvar pa 1-3 (C chans 28,93 -> 31,02 % i slutkorningen med 1-3)
// B provar 1-2 och sedan 1-3 innan fargerna far optimeras fritt (Stryktipset 4973: med bara 1-2 fick B fria farger).
const RED_FALLBACK = { B: redEnv('STRYK_RED_FALLBACK') || [[1, 2], [1, 3]], C: [[1, 3]] };
// Kupong B ar risksystemet (anvandaren 2026-10-02 kvall: "kor 1-4 eller 2-4 roda ... inte mer an 2 roda som minst",
// "behall A som det ar"): rod 1-4 eller 2-4, den som ger hogst chans valjs. Backtest 107 omg (2023/24-2026/27): ratt rad i
// omgangar over 500 000 kr hade i snitt 5,2 roda och 34 av 37 fler an 3. A och C har kvar 1-3. Samma som stryk-engine.js.
// 2026-10-03: röd max 5 (1-5/2-5). Backtest 107 omg: B netto -1 807 -> +4 033 kr, 12 ratt 4 -> 5, samma chans, gransen
// holl lika ofta (106/107). Med 1-4 stoppades B 4847 (247 257 kr, 5 roda). data/stryktips-backtest-*-redB5.json
const RED_RULES_B = redEnv('STRYK_RED_B') || [[1, 5], [2, 5]];
let redRules = [RED_RULE]; // rodreglerna for systemet som byggs just nu (satts i bestWithSpikes)
// Skyddet "3 roda + resten grona" (redGreenRows) galler med 3 roda aven i B. Med B:s rod max 4 fick B slappa reglerna
// (Stryktipset 4973) och gransen hamnade pa 111 000 kr (Europatipset 2613); raderna med 3 roda ryms anda i 1-4/2-4.
// "3 roda + resten grona" for B och C (rod max 5-6), "2 roda + resten grona" for A (rod max 2): hogst 3, aldrig over rod max
const RG_TOP = Number(process.env.STRYK_RG_TOP ?? 3);
const redGreenTop = () => Math.min(RG_TOP, Math.max(...redRules.map((r) => r[1])));
// 3-6 sedan 2026-10-02 (anvandaren: "begransa sa gron blir 3-6"), tidigare 4-6. STRYK_GREEN="2,6" eller "off" (0-13) i backtest.
const GREEN_RULE = process.env.STRYK_GREEN === 'off' ? [0, 13] : redEnv('STRYK_GREEN')?.[0] || [3, 6];
let fixedColors = true;
let yellowFull = true; // false = gult far skara (reserv for att halla 30 000-50 000 kr)
// 'signs' = varken farg- eller teckenregler far stoppa raderna i redGreenRows, 'colors' = bara fargreglerna (teckenreglerna
// skulle behova ga under 2-1-1, t.ex. Europatipset dar 3 roda bortavinster + grona hemmavinster ger rader utan X),
// false = inget krav (sista reserv)
let redGreenFull = 'signs';
// Anvandaren 2026-10-02: "far jag in 3 roda sa kan jag fa in alla grona ocksa". Raderna med rod max (3, eller sa manga
// roda garderingar som finns) dar varje annan fargad gardering gar gront (gult dar gront saknas, bla halvor och spikar
// valfria) far aldrig stoppas av fargreglerna - annars minskas systemet. Utdelnings- och teckenreglerna galler som vanligt.
// colorIdx[i][k] = fargindex (0 gron, 1 gul, 2 rod). Samma som stryk-engine.js.
// Tillägg 2026-10-02: "om 3 röda går in och en gul då kan jag inte få 13 rätt" – även raderna där högst YELLOW_EXTRA av de
// andra garderingarna går gult i stället för grönt ska med, och de ska klara teckenreglerna (inte bara färgreglerna).
const YELLOW_EXTRA = 1;
export function redGreenRows(sets, colorIdx, blue = new Set(), redTop = 3, yellowExtra = YELLOW_EXTRA) {
  const colored = (i) => sets[i].length > 1 && !blue.has(i);
  const redCap = (i) => colored(i) && sets[i].some((k) => colorIdx[i][k] === 2);
  const top = Math.min(redTop, sets.filter((_, i) => redCap(i)).length);
  if (top < 1) return [];
  const out = [], row = [];
  const walk = (i, reds, extra) => {
    if (reds + sets.slice(i).filter((_, j) => redCap(i + j)).length < top) return;
    if (i === sets.length) { if (reds === top) out.push(row.join('')); return; }
    const set = sets[i];
    // [tecken, röd, gul i stället för grön]
    let opts = set.map((k) => [k, 0, 0]);
    if (colored(i)) {
      const green = set.filter((k) => colorIdx[i][k] === 0), other = set.filter((k) => colorIdx[i][k] === 1);
      opts = [...set.filter((k) => colorIdx[i][k] === 2 && reds < top).map((k) => [k, 1, 0]), ...green.map((k) => [k, 0, 0]),
        ...other.map((k) => [k, 0, green.length ? 1 : 0]).filter((o) => extra + o[2] <= yellowExtra)];
    }
    for (const [k, r, y] of opts) { row.push(SIGNS[k]); walk(i + 1, reds + r, extra + y); row.pop(); }
  };
  walk(0, 0, 0);
  return out;
}
// Fargtripletterna [grona, gula, roda] for redGreenRows (spikar och bla halvor raknas inte)
const redGreenCache = new WeakMap();
export function redGreenColors(sets, colorIdx, blue = new Set(), rows = redGreenRows(sets, colorIdx, blue)) {
  const out = new Map();
  for (const row of rows) {
    const c = [0, 0, 0];
    [...row].forEach((x, i) => { if (sets[i].length > 1 && !blue.has(i)) c[colorIdx[i][SIGNS.indexOf(x)]]++; });
    out.set(c.join(), c);
  }
  return [...out.values()];
}
function fittedRules(ranges, triples, redAtLeast = 0) {
  const present = colorsPresent(triples);
  if (fixedColors) {
    const out = new Map();
    // En regel per rodregel (A: 1-3, B: 1-4 och 2-4); rangordningen sker dar reglerna anvands
    for (const RR of redRules) {
    const G = present[0] ? GREEN_RULE : [0, 0], R = present[2] ? RR : [0, 0];
    // Gult skar aldrig bort rader (anvandaren 2026-10-02: "far jag in mina roda vill jag kunna fa in alla grona och
    // gula"): gulregeln ar hela spannet som gar att na med gron 3-6 och rodregeln. Full tackning aven for gront gick inte
    // ihop med gron 4-6, 350-400 kr och 30 000-50 000 kr (Stryktipset 4973: ingen grundrad klarade det).
    if (triples && yellowFull) {
      const ins = triples.filter((tr) => fitsColors(tr, [G, [0, 13], R]));
      if (!ins.length) continue;
      let yy = [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))];
      if (yy[0] === yy[1] && present[1]) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      if (colorRuleOk(rule, present)) out.set(rule.join(';'), rule);
      continue;
    }
    for (const y of [...ranges[1], [0, 13]]) {
      const ins = triples ? triples.filter((tr) => fitsColors(tr, [G, y, R])) : null;
      if (ins && !ins.length) continue;
      let yy = ins ? [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))] : y.slice();
      // Bara ett antal gula gar att na: max +1 ar en dod grans (samma rader) sa att gult inte blir ett exakt antal
      if (yy[0] === yy[1] && present[1] && !(triples || []).some((tr) => tr[1] === yy[1] + 1 && fitsColors(tr, [G, [0, 13], R]))) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      if (colorRuleOk(rule, present)) out.set(rule.join(';'), rule);
    }
    }
    return [...out.values()];
  }
  const out = new Map();
  for (const g of ranges[0]) for (const y of [[0, 13]]) for (const rd of ranges[2]) {
    const rule = triples ? fitColorRule([g, y, rd], triples, redAtLeast) : [g, y, rd];
    if (rule) out.set(rule.join(';'), rule);
  }
  const all = [...out.values()];
  const good = all.filter((r) => colorRuleOk(r, present));
  return good.length ? good : all;
}
// Högst så många färgkombinationer provas per grundrad (bästa först); resten ger sällan något när skrällregeln fallerar
const MAX_COLOR_OPTIONS = 60;
// Exakt utdelningsgrans (anvandaren 2026-09-30: "30k, inte mindre, inte mer"): gransen i Gambling Cabin-lanken ar alltid
// spelets regel (A 30 000 / Europatipset 20 000, B och C 30 000) och budgeten nas med grundrad och fargregler i stallet for
// att hoja gransen. Gar det inte hojs gransen som reserv (payoutExact: false). STRYK_EXACT=0 stanger av (backtest).
// Raderna grupperas per fargtriplett sa att manga fargkombinationer kan provas snabbt; hela poolen maste rymmas i budgeten.
// 2026-09-30 (sent): av som standard efter backtest - exakt gräns gav samre resultat (ET C -26 366 mot -10 024, ST A+B
// -20 572 mot -10 194), anvandaren valde rekommendationen: regeln ar en LAGSTA grans som far hojas. STRYK_EXACT=1 slar pa.
// 2026-10-02 pa igen (anvandaren: "minsta utdelning ska vara 30k, kan diffa lite for stryktipset"): gransen i lanken
// ligger mellan regeln och PAYOUT_BAND x regeln, annars regeln med tak, sist hojd. STRYK_EXACT=0 stanger av (backtest).
const EXACT_FLOOR = process.env.STRYK_EXACT !== '0';
// 2026-10-02 (senare): "30-50k ar minsta utdelningen, inget max" - gransen i lanken 30 000-50 000 kr.
const PAYOUT_BAND = 50 / 30;
const COLOR_TRIM_EXACT = 3;
// Var i budgeten gransen laggs (antal rader). Standard mitten (375 av 350-400): GC raknar med aktuella streck och ett streck
// som andras efter hamtningen flyttar rader over gransen. Raderna narmast gransen ar de troligaste (lagst utdelning), sa
// fler rader ger hogre chans. STRYK_CUT_AIM=0.9 = 90 % av vagen fran min till max (backtest).
// 0,9 sedan 2026-10-03 (natt): A chans 23,98 -> 24,99 %, B 14,39 -> 14,95 % ensam; ca 395 av 350-400 rader, marginal 5 rader.
const CUT_AIM = Number(process.env.STRYK_CUT_AIM ?? 0.9);
const cutAim = (minRows, maxRows) => Math.round(minRows + CUT_AIM * (maxRows - minRows));
// cap = hogsta grans i lanken: en regel duger nar raderna over cap ryms i budgeten och alla rader (over regeln) racker
// Raderna grupperade per fargtriplett, en gang per radlista och grans (radlistorna ateranvands). Forut grupperades
// de om vid varje anrop: 12 600 anrop och 115 miljoner rader pa Stryktipset 4974 (~40 s).
const colorGroupCache = new WeakMap();
function colorGroups(all, cap) {
  let byCap = colorGroupCache.get(all);
  if (!byCap) { byCap = new Map(); colorGroupCache.set(all, byCap); }
  let gl = byCap.get(cap);
  if (gl) return gl;
  const groups = new Map();
  for (const r of all) {
    const k = r.c[0] * 196 + r.c[1] * 14 + r.c[2];
    let g = groups.get(k);
    if (!g) { g = { c: r.c, n: 0, p: 0, nHi: 0, pHi: 0 }; groups.set(k, g); }
    g.n++; g.p += r.p;
    if (r.payout >= cap) { g.nHi++; g.pHi += r.p; }
  }
  gl = [...groups.values()];
  byCap.set(cap, gl);
  return gl;
}
function exactColorOptions(all, minRows, maxRows, fixed = null, triples = null, cap = Infinity, redAtLeast = 0) {
  const gl = colorGroups(all, cap);
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const g of gl) for (let c = 0; c < 3; c++) { if (g.c[c] < lo[c]) lo[c] = g.c[c]; if (g.c[c] > hi[c]) hi[c] = g.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    // Gransen 30 000-50 000 kr gar fore fargbredden (2026-10-02): alla fonster med min < max provas, aven bredd 1
    for (let a = lo[c]; a <= hi[c]; a++) for (let b = a + Math.min(1, hi[c] - lo[c]); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  const mid = cutAim(minRows, maxRows);
  for (const rule of fittedRules(ranges, triples, redAtLeast)) {
    const [g, y, rd] = rule;
    let n = 0, p = 0, nHi = 0, pHi = 0;
    for (const x of gl) if (fitsColors(x.c, rule)) { n += x.n; p += x.p; nHi += x.nHi; pHi += x.pHi; }
    // Chansen i ungefar de rader som behalls: allt over cap plus en andel av raderna mellan regeln och cap
    const part = n > nHi ? Math.min(1, Math.max(0, (mid - nHi) / (n - nHi))) : 0;
    if (n >= minRows && nHi <= maxRows) opts.push({ rule, score: pHi + (p - pHi) * part, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => b.score - a.score || a.width - b.width);
}
// Skrall (rott tecken) i en gardering pa hogst redMax och favoriten pa minst favMin av kupongens rader
function keptSharesOk(kept, grund, colors, events, redMax, favMin) {
  if (redMax < 1 && !grund.sets.every((set, i) => set.length < 2 || set.every((k) => colors[i][k] !== 'red' || kept.filter((r) => r.row[i] === k).length <= redMax * kept.length))) return false;
  if (favMin > 0 && !grund.sets.every((set, i) => { if (set.length < 2) return true; const fav = set.reduce((b, k) => (events[i].final[k] > events[i].final[b] ? k : b)); return kept.filter((r) => r.row[i] === fav).length >= favMin * kept.length; })) return false;
  return true;
}

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

function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin = 30000, budget = BUDGET, redMax = RED_MAX_SHARE, favMin = FAV_MIN_SHARE, colorBands = null, colorTarget = true, exactFloor = EXACT_FLOOR, payoutBand = PAYOUT_BAND }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const colors = events.map((e) => [0, 1, 2].map((k) => signColor(e.folk?.[k])));
  const T = turnover;
  // Exakt: gransen i GC:s formel ar regeln sjalv. Reserv: verklig utdelning >= regeln, gransen hojs till budgeten.
  const floor = exactFloor ? payoutMin : gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  // exactFloor: true = grans 30 000-50 000 kr, 'near' = lagsta grans som gar (narmast regeln), false = hojd. Aldrig tak.
  const near = exactFloor === 'near';
  const cap = exactFloor === true ? payoutMin * payoutBand : Infinity;
  const blue = blueHalves(events, grund.sets);
  // Rod max + resten grona (redGreenRows): fargreglerna far aldrig stoppa de raderna. Gron 3-6 ar fast, sa faller deras
  // grona utanfor provas nasta grundrad (farre grona garderingar = mindre system).
  // Räknas en gång per grundrad (samma grundrad provas i många steg i reservordningen)
  let rg = redGreenCache.get(grund);
  if (!rg) {
    const rows = redGreenRows(grund.sets, colors.map((c) => c.map((x) => COLOR_KEYS.indexOf(x))), blue, redGreenTop());
    rg = { colors: redGreenColors(grund.sets, colors.map((c) => c.map((x) => COLOR_KEYS.indexOf(x))), blue, rows), signs: [0, 1, 2].map((k) => Math.min(13, ...rows.map((row) => [...row].filter((x) => x === SIGNS[k]).length))) };
    redGreenCache.set(grund, rg);
  }
  const must = fixedColors && redGreenFull ? rg.colors : [];
  if (must.some((t) => t[0] < GREEN_RULE[0] || t[0] > GREEN_RULE[1])) return null;
  // ... och teckenreglerna (minst så många 1/X/2) får inte heller stoppa dem
  if (must.length && redGreenFull === 'signs' && rg.signs.some((n, k) => n < signMin[k])) return null;
  const all = [];
  const cc = [0, 0, 0]; // grona/gula/roda tecken i garderingarna (spikar ar bla i GC)
  const walk = (i, row, p, f) => {
    if (i === events.length) {
      const payout = (PAYOUT_13 * T + jackpot) / (1 + T * f); // GC:s formel
      const real = (PAYOUT_13 * realTurnover + jackpot) / (1 + realTurnover * f);
      if (payout >= floor && [0, 1, 2].every((k) => row.filter((x) => x === k).length >= signMin[k])) all.push({ row: [...row], p, payout, real, c: cc.slice() });
      return;
    }
    for (const k of grund.sets[i]) {
      const ci = grund.sets[i].length > 1 && !blue.has(i) ? COLOR_KEYS.indexOf(colors[i][k]) : -1; // spikar och bla halvor raknas inte
      row.push(k); if (ci >= 0) cc[ci]++;
      walk(i + 1, row, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]));
      row.pop(); if (ci >= 0) cc[ci]--;
    }
  };
  walk(0, [], 1, 1);
  if (all.length < minRows) return null;
  all.sort((a, b) => b.payout - a.payout);
  // Fargreglerna: basta kombinationen dar utdelningsgransen gar att lagga, annars nasta
  const target = colorTarget && COLOR_TARGET ? dynamicRanges(events, grund, colors, blue) : null;
  if (target && target.some((x) => !x.length)) return null;
  // Reserv utan mal: fri optimering (banden raknar hela raden och passar inte nar spikarna ar bla)
  const triples = colorTriples(grund.sets, colors.map((c) => c.map((x) => COLOR_KEYS.indexOf(x))), blue);
  const midN = Math.round((minRows + maxRows) / 2);
  const options = near ? nearColorOptions(all, minRows, maxRows, target, triples, RED_REACH)
    : exactFloor ? exactColorOptions(all, minRows, maxRows, target, triples, cap, RED_REACH) : colorRuleOptions(all, minRows, midN, null, target, triples, RED_REACH);
  for (const opt of options.filter((o) => must.every((t) => fitsColors(t, o.rule))).slice(0, MAX_COLOR_OPTIONS)) {
    const pool = all.filter((r) => fitsColors(r.c, opt.rule));
    // Narmast regeln: sikta pa ovre delen av budgeten sa att gransen blir sa lag som mojligt
    const res = cutSystem(pool, floor, minRows, maxRows, grund, colors, redMax, events, favMin, cap, near ? maxRows - Math.round((maxRows - minRows) / 5) : null);
    if (!res) continue;
    const { cut, kept } = res;
    const hit = kept.reduce((sum, r) => sum + r.p, 0);
    const ev = kept.reduce((sum, r) => sum + r.p * r.real, 0);
    kept.sort((a, b) => b.p - a.p);
    return {
      grundRows: grund.rows, afterPayout: all.length, rows: kept.length, cost: kept.length * rowPrice, rowPrice,
      hitAll: hit, grundHit: grund.hitAll, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: {
        payoutMin: cut.t, payoutMinReal: payoutMin, payoutExact: exactFloor, jackpot, realTurnover, signMin, colorGreen: COLOR.green, colorRed: COLOR.red, turnover: T,
        colorRules: { green: opt.rule[0], yellow: opt.rule[1], red: opt.rule[2] }, colorTarget: Boolean(target), colorsOff: COLOR_KEYS.filter((_, c) => !colorsPresent(triples)[c]), blueHalves: [...blue].sort((a, b) => a - b), redGreenFull: must.length ? redGreenFull : false,
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
function cutSystem(all, floor, minRows, maxRows, grund, colors, redMax, events, favMin = FAV_MIN_SHARE, cap = Infinity, aim = null) {
  if (all.length < minRows) return null;
  // Radantalet laggs sa nara mitten av budgeten som mojligt (2026-09-29): GC raknar med aktuella streck, och ett streck
  // som andrades fran 27 till 26 % efter hamtningen gav 394 -> 404 rader. Mitten ger marginal at bada hallen.
  let cut = null;
  if (all.length >= minRows && all.length <= maxRows && all[all.length - 1].payout >= floor * 1.02) cut = { n: all.length, t: Math.ceil(floor) };
  const midN = aim ?? cutAim(minRows, maxRows);
  for (const win of [Math.round((maxRows - minRows) / 5), Math.max(maxRows - midN, midN - minRows)]) {
    for (const gap of [1.02, 1.01, 1.003, 1]) {
      for (let d = 0; d <= win && !cut; d++) {
        for (const n of d ? [midN - d, midN + d] : [midN]) {
          if (cut || n < minRows || n > maxRows || n >= all.length) continue;
          const above = all[n - 1].payout, below = all[n].payout;
          if (above < below * gap) continue;
          const mid = Math.sqrt(above * below);
          for (const step of [5000, 1000, 500, 100, 10, 1]) {
            const t = Math.round(mid / step) * step;
            if (t <= above / Math.sqrt(gap) && t >= below * Math.sqrt(gap) && t >= floor && t <= cap) { cut = { n, t }; break; }
          }
        }
      }
      if (cut) break;
    }
    if (cut) break;
  }
  if (!cut) return null;
  const kept = all.slice(0, cut.n);
  // Skrall- och favoritregeln, annars valjs ett annat system
  return keptSharesOk(kept, grund, colors, events, redMax, favMin) ? { cut, kept } : null;
}

// Lagsta mojliga grans (anvandaren 2026-10-02: 'max utdelning ska vara obegransad'): nar 30 000–50 000 kr ger for manga
// rader valjs den fargregel dar gransen kan ligga narmast regeln, utan tak. needed = utdelningen pa forsta raden som inte
// ryms i budgeten (gransen maste ligga over den). all ar sorterad pa utdelning, hogst forst.
function nearColorOptions(all, minRows, maxRows, fixed = null, triples = null, redAtLeast = 0) {
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const r of all) for (let c = 0; c < 3; c++) { if (r.c[c] < lo[c]) lo[c] = r.c[c]; if (r.c[c] > hi[c]) hi[c] = r.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    const w = Math.min(COLOR_WIDTH, hi[c] - lo[c]);
    for (let a = lo[c]; a <= Math.min(lo[c] + COLOR_TRIM_EXACT, hi[c]); a++) for (let b = Math.max(hi[c] - COLOR_TRIM_EXACT, a + w); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  for (const rule of fittedRules(ranges, triples, redAtLeast)) {
    const [g, y, rd] = rule;
    let n = 0, p = 0, needed = 0;
    for (const r of all) {
      if (!fitsColors(r.c, rule)) continue;
      if (n === maxRows) { needed = r.payout; break; }
      n++; p += r.p;
    }
    if (n >= minRows) opts.push({ rule, needed, score: p, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => a.needed - b.needed || b.score - a.score || a.width - b.width);
}

// Basta reducerade system over alla grundradskandidater (hogst chans till 13 ratt)
// Mal for valet av grundrad/grans: 'hit' = hogst chans till 13 ratt, 'ev' = hogst forvantad aterbetalning (chans x utdelning)
const OBJECTIVE = process.env.STRYK_OBJECTIVE || 'hit';
// B byggs tillsammans med A: B valjs sa att paret tacker mest (rader som redan finns i A raknas inte) - STRYK_B_JOINT=0 stanger av
const B_JOINT = process.env.STRYK_B_JOINT !== '0';
// Ordning: fargfonstren slapps forst, sedan skrallgransen och allra sist favoritregeln (favoriten ska aldrig under 10 %,
// anvandarens regel - slapps bara om ingen kupong alls gar att bygga). keepShares: varken skrall- eller favoritregeln far
// slappas (delat system - gar det inte byggs A och B var for sig).
// Exakt utdelningsgrans ar viktigare an fargfonster och skrallgrans: den hojs forst nar de har slappts, men fore
// favoritregeln.
function bestReduced(events, candidates, opts, exclude = null) {
  const target = opts.colorTarget !== false && COLOR_TARGET;
  const redMax = opts.redMax ?? RED_MAX_SHARE, favMin = opts.favMin ?? FAV_MIN_SHARE;
  const exact = opts.exactFloor ?? EXACT_FLOOR;
  const favs = opts.keepShares ? [favMin] : [favMin, 0];
  const reds = opts.keepShares ? [redMax] : [redMax, 1];
  const seen = new Set();
  for (const f of favs) {
    // 30 000-50 000 kr, sedan lagsta grans som gar, sist hojd grans - aldrig tak (anvandaren 2026-10-02)
    for (const x of opts.exactModes ?? (exact ? [true, 'near', false] : [false])) {
      for (const r of reds) {
        for (const t of [target, false]) {
          const key = `${r}|${f}|${Boolean(t)}|${x}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const best = bestReducedOnce(events, candidates, { ...opts, colorTarget: Boolean(t), redMax: r, favMin: f, exactFloor: x }, exclude);
          // Vilka andelsregler som holl (2026-10-02: med minst 3 helgarderingar far favoritregeln slappas, kupongen visar det)
          if (best) for (const red of [best.reduced, ...(best.pair || [])]) red.rules = { ...red.rules, redMaxShare: r, favMinShare: f };
          if (best) return best;
        }
      }
    }
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
    const redMax = opts.redMax ?? RED_MAX_SHARE, favMin = opts.favMin ?? FAV_MIN_SHARE;
    const pair = opts.split ? splitReduced(red, redMax < 1 || favMin > 0 ? (rows) => sharesOk(events, g.sets, rows, redMax, favMin) : null) : null;
    if (opts.split && !pair) continue;
    const sc = score(red);
    // Lagsta grans som gar (exactFloor near): grundraden med lagst grans vinner, vid lika hogst chans
    const lower = opts.exactFloor === 'near' && best && red.rules.payoutMin !== best.reduced.rules.payoutMin;
    if (!best || (lower ? red.rules.payoutMin < best.reduced.rules.payoutMin : sc > best.score)) best = { system: g, reduced: red, score: sc, pair };
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
// aterskapa i Gambling Cabin (samma grundrad, utdelningsintervall). 'counter' = motsystemet (aldrig samma gardering som A, hogst 1 spik skiljer).
// Expertgranskning 2026-09-28: B som motsystem gav farre vantade 13 ratt an A:s nasta rader.
// 2026-09-30: 'counter' som standard - med exakt utdelningsgrans kan det delade systemet inte ge A regelns grans (A fick
// alltid en hogre grans an B). Servern bygger nu A och B var for sig, som webben.
const B_MODE = process.env.STRYK_B_MODE || 'counter';
// Skrall (rott tecken) pa hogst redMax och favoriten pa minst FAV_MIN_SHARE av raderna, per gardering
function sharesOk(events, sets, rowList, redMax, favMin = FAV_MIN_SHARE) {
  return sets.every((set, i) => {
    if (set.length < 2) return true;
    const share = (k) => rowList.filter((r) => r[i] === SIGNS[k]).length / rowList.length;
    const fav = set.reduce((b, k) => (events[i].final[k] > events[i].final[b] ? k : b));
    return share(fav) >= favMin && set.every((k) => signColor(events[i].folk?.[k]) !== 'red' || share(k) <= redMax);
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
// Tecken: 0 = spelas inte, 1 = bla (spik), 2 = gul, 3 = rod, 4 = gron (5 = rosa anvands inte). Regler: [aktiv, min, max].
function gamblingCabinUrl(productId, drawNumber, closeDate, events, sets, reduced) {
  // Bara tre farger (anvandaren 2026-10-03): bla, gron och rod. Gula tecken (26-44 %) ar bla och har ingen regel.
  const colorId = { yellow: 1, red: 3, green: 4 };
  // Spikar (ett tecken) bla (1, Gambling Cabins grundfarg - anvandaren 2026-10-02), annars farg efter folkets streck.
  // Blatt har ingen fargregel i GC (den bla knappen ar teckenreglerna), sa fargreglerna raknar bara garderingarna.
  // Bla halvgarderingar (rules.blueHalves) ocksa bla: fria fran fargreglerna.
  const blue = new Set(reduced.rules.blueHalves || []);
  const col = (k) => events.map((e, i) => (!sets[i].includes(k) ? 0 : sets[i].length === 1 || blue.has(i) ? 1 : colorId[e.colors[k]])).join(',');
  const r = reduced.rules;
  // Farger som inte finns i garderingarna ar av (annars "0-0", ett exakt antal)
  const cr = (c) => (r.colorRules?.[c] && !r.colorsOff?.includes(c) ? `1,${r.colorRules[c][0]},${r.colorRules[c][1]}` : '0,0,13');
  const q = [
    `spel=${productId}`, `omg=${drawNumber}`, `datum=${closeDate}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${r.signMin[0]},13,${r.signMin[1]},13,${r.signMin[2]},13`,
    'yellow=0,0,13', `red=${cr('red')}`, `green=${cr('green')}`, 'pink=0,0,13',
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
  // Fargband: ratt rad senaste aret i kupongarkivet, bara omgangar fore den har (ingen framtidsdata i backtest)
  // Bara Stryktipset: pa Europatipset gav banden samre resultat (+10 557 mot +24 712 kr, 55 omg), dar optimeras fritt
  const bands = BANDS_FOR.has(product.id) ? colorBands(product.id, draw.regCloseTime || new Date().toISOString()) : null;
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
  });
  const sysEv = out.map((a) => (a.spik?.used ? { ...a, final: a.spik.sysP } : { ...a, spik: undefined }));
  // xTilt: kryss-reglagen (X_TILT) galler A och B, aldrig C
  const baseOpts = { rowPrice, turnover, realTurnover, jackpot, payoutMin: utdMin(product.id), signMin: SIGN_MIN.A, colorBands: bands, xTilt: X_TILT.for.includes('A'), blueX: BLUE_X };
  let bestA = null, splitPair = null;
  if (out.length && B_MODE === 'split') {
    const dbl = bestWithSpikes(sysEv, spikMinFor(product.id), null, { ...baseOpts, budget: { min: 2 * BUDGET.min, max: 2 * BUDGET.max }, split: true, keepShares: true });
    splitPair = dbl?.pair || null;
    if (splitPair) bestA = { system: dbl.system, reduced: splitPair[0] };
  }
  if (!bestA && out.length) bestA = withBlueX((blueX) => bestWithSpikes(sysEv, spikMinFor(product.id), null, { ...baseOpts, blueX, sys: 'A' }));
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
    // B som i webben (risksystemet): 50 000-75 000 kr (aven Europatipset), 3-2-2, rod 1-4 eller 2-4, minst en skrallspik,
    // aldrig samma gardering som A och hogst 1 spik som skiljer (AB_SPIK_DIFF, B_INHERIT)
    const optsB = { rowPrice, turnover, realTurnover, jackpot, payoutMin: Math.max(UTD_MIN_B, utdMin(product.id)), signMin: SIGN_MIN.B, colorBands: bands, xTilt: X_TILT.for.includes('B'), blueX: BLUE_X };
    const bestB = withBlueX((blueX) => bestRisk(sysEv, spikMinFor(product.id), system.sets, { ...optsB, blueX }, B_JOINT ? new Set(reduced.rowList) : null));
    systemB = bestB?.system || null; reducedB = bestB?.reduced || null;
    if (systemB) out.forEach((a, i) => { a.systemPickB = systemB.picks[i]; });
    if (reducedB) reducedB.gamblingCabinUrl = gamblingCabinUrl(product.id, draw.drawNumber, closeDate, out, systemB.sets, reducedB);
  }
  // Kupong C: skrallsystemet (rod 2-6, rott pa 6-10 matcher tills hogsta rad >= 1 milj, 50 000-75 000 kr, skrallspik),
  // oberoende av A och B, 700-850 kr
  let systemC = null, reducedC = null;
  if (out.length && process.env.STRYK_C !== '0') {
    const bestC = bestRisk(sysEv, spikMinFor(product.id), null, { ...baseOpts, payoutMin: Math.max(UTD_MIN_C, utdMin(product.id)), signMin: SIGN_MIN_C[product.id] || SIGN_MIN.A, budget: BUDGET_C, colorTarget: C_COLOR !== 'free', xTilt: false, blueX: false, sys: 'C' }, null, RISK_C);
    systemC = bestC?.system || null; reducedC = bestC?.reduced || null;
    if (reducedC) {
      // Andel av omgangens vantade kryss som C tacker (X_SHARE_C)
      const xs = xShareOf(sysEv, systemC.sets);
      reducedC.rules = { ...reducedC.rules, xShare: r3(xs), ...(X_SHARE_C > 0 && xs < X_SHARE_C ? { xShareShort: true } : {}) };
      reducedC.picks = systemC.picks.map((x) => x.signs);
      reducedC.gamblingCabinUrl = gamblingCabinUrl(product.id, draw.drawNumber, closeDate, out, systemC.sets, reducedC);
    }
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
    rules: a.reduced.rules, gamblingCabinUrl: a.reduced.gamblingCabinUrl, rowList: a.reduced.rowList,
    picks: a.events.map((e) => e.systemPick?.signs || ''),
    // Odds och streck som de sag ut nar systemet sparades (for rattvisa backtest senare)
    matches: a.events.map((e) => ({ n: e.eventNumber, match: `${e.home} - ${e.away}`, kickoff: e.kickoff, final: e.final, market: e.market, marketSource: e.marketSource, svsOdds: e.odds, sharpOdds: e.sharpOdds || null, folk: e.folk, lineupStatus: e.lineup?.status || null, context: ctxSummary(e.context, e.refereeStreak), refereeAway: e.refereeAway?.flag ? { matches: e.refereeAway.matches, homeRate: e.refereeAway.homeRate } : null, newCoach: e.newCoach || null, finalBase: e.finalBase || null })),
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
      if (a.reducedB) log(`  system B: grundrad ${a.reducedB.grundRows} -> ${a.reducedB.rows} rader (${a.reducedB.cost} kr), minst ${a.reducedB.rules.signMin.join('-')}, gemensamma spikar ${a.reducedB.sameSingles}, chans 13 rätt 1 på ${Math.round(1 / a.reducedB.hitAll)}`);
      if (a.value) log(`  värde: ${a.value.level} (${Math.round(a.value.ratio * 100)} %)`);
      if (a.reduced) log(`  reducerat: grundrad ${a.reduced.grundRows} -> ${a.reduced.rows} rader (${a.reduced.cost} kr), utdelning ≥ ${a.reduced.rules.payoutMin} kr, minst ${a.reduced.rules.signMin.join('-')} (1-X-2), chans 13 rätt 1 på ${Math.round(1 / a.reduced.hitAll)}`);
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
      value: 'Värde = Svenska Spels odds på tipset ≥ 1,03 / vår sannolikhet. Streckvärde = vår sannolikhet / Svenska folkets andel.',
    },
    lastDrawNumber,
    products,
    history,
    backtest: loadBacktests(),
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
  return { signMin: SIGN_MIN.A, signMinB: SIGN_MIN.B, bMode: B_MODE, payoutMin: utdMin(productId), budget: BUDGET, modelW: MODEL_W, modelWThin: MODEL_W_THIN, market: MARKET_MODE, grundMax: GRUND_MAX_ROWS };
}

export { colorTriples, fitColorRule, colorRuleOk, colorsPresent, analyzeDraw, oddsetAvailability, evaluateSnapshot, loadBacktests, loadNationalElo, loadGroup, fitModel, get, API, SIGN_MIN, SIGN_MIN_C, SPIK_MIN_BY_PRODUCT, MIN_SPIKES, MAX_SPIKES, MIN_HELG, SKRALL_SPIK, RED_RULES_B, SPIK_TOP, SPIK_TOP_B, currentRules, PRODUCTS, FALL, canFall };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    log(`Fel: ${e.stack || e.message}`);
    process.exit(1);
  });
}
