// Pro-lager ovanpa betting-store: Dixon-Coles, devig, varde vid dagens odds, vilodagar,
// domarstatistik och utvardering (RPS/Brier/CLV mot Pinnacle closing).
// Kors efter Update-BettingStore.ps1 (som anropar detta) eller: npm run pro
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brier, clv, daysBetween, devigMultiplicative, findSharpBook,
  overround, predictDixonColes, riskReward, round, rps1x2, toDate,
} from './pro/lib.mjs';
import { EARLY_ROUNDS, buildTiers, fitLeagueModel, loadLeagueModels, paramsFor } from './pro/league-models.mjs';
import { historicalMissing, findUsMatch, inCurrentSquad, loadPlayerModel, summarise as summariseMissing, teamShares } from './pro/players.mjs';
import { TEAM_ALIASES } from './weather/teams.mjs';
import { adjustProbs, loadAdjustments } from './lib/learned-adjust.mjs';
import { extraSignals } from './lib/extra-signals.mjs';
import { mergeCaseDuplicates, mergeNameVariants } from './lib/odds-history.mjs';
import { sameTeamName } from './lib/team-aliases.mjs';
import { buildRefIndex, loadRefereeMatches, refereeFlags, refKey, REF_LEAGUES, resolveTeam } from './lib/referee-streaks.mjs';
import { buildCardIndex, CARD_CFG, pickCardLine, predictCards } from './lib/cards-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  store: path.join(root, 'data', 'betting-store.json'),
  tips: path.join(root, 'data', 'tips-latest.json'),
  tipsMd: path.join(root, 'data', 'tips-latest.md'),
  fixtures: path.join(root, 'data', 'upcoming-fixtures.json'),
  odds: path.join(root, 'data', 'open', 'upcoming_odds.json'),
  oddsportal: path.join(root, 'data', 'open', 'oddsportal_odds.json'),
  weatherHistory: path.join(root, 'data', 'open', 'weather_history.json'),
  referees: path.join(root, 'data', 'open', 'referees.json'),
  refHistory: path.join(root, 'data', 'open', 'referee_history.json'),
  refUpcoming: path.join(root, 'data', 'open', 'referees_upcoming.json'),
  usLeague: path.join(root, 'data', 'open', 'understat_league_matches.json'),
  usPlayers: path.join(root, 'data', 'open', 'understat_player_matches.json'),
  squads: path.join(root, 'data', 'trupper'),
  playerStats: path.join(root, 'data', 'open', 'player_stats.json'),
  fpl: path.join(root, 'data', 'open', 'fpl_availability.json'),
  lineups: path.join(root, 'data', 'open', 'espn_lineups.json'),
  evaluation: path.join(root, 'data', 'reports', 'pro-evaluation.json'),
  oddsHistory: path.join(root, 'data', 'open', 'odds-history.json'),
  leaguesCfg: path.join(root, 'config', 'leagues.json'),
  leagueModels: path.join(root, 'config', 'league-models.json'),
};

export const CONFIG = {
  dcWeight: 0.5,        // andel Dixon-Coles i blandad sannolikhet (resten = befintlig modell)
  minEv: 0.03,          // minsta forvantade avkastning for value-bet (skarpt facit: Pinnacle/Betfair)
  minEvConsensus: 0.05, // hogre troskel nar facit ar snittet av bolagen (svagare facit, backtest)
  minEvThin: 0.08,      // facit fran bara 1-3 bolag: svagast, hogst troskel (ger anda alltid ett omdome)
  consensusMinBooks: 4, // minst sa manga bolag for att snittet ska raknas som facit
  // Tak for odds: utan tak -19 % ROI (skrallar overskattas), med tak 5: +13 % ROI, 83 % slog closing (backtest 95 spel)
  maxOdds: 5,
  // EV over 25 % mot ett skarpt facit ar i praktiken alltid datafel (fel match, illikvid bors) - aldrig varde
  maxEv: 0.25,
  stakeSek: 500,        // fast insats per spel (valt av anvandaren i st f Kelly)
  evalThresholds: [0.02, 0.03, 0.05, 0.1],
  marketAnchor: 0.7,    // bara for utvardering (marketAnchoredAtBestPrice); live anvands inte
  // Bolag med svensk licens i The Odds API (region eu). Basta pris tas bara har.
  userBooks: ['unibet_se', 'leovegas_se', 'betsson', 'nordicbet', 'coolbet'],
  liveStrategy: 'consensusAtBestPrice',
  // Franvaro: lagets forvantade mal x (1 - alpha * saknad andel av xG+xA). alpha valjs i backtest.
  playerAlphaGrid: [0, 0.25, 0.5, 0.75, 1],
  playerAlpha: 0,
  // Lardomar (config/learned-adjustments.json, npm run lardomar:modell): liga-kalibrering av facit mot
  // oppningsodds (kontroll 2023/24-: logloss -0.0007, z -2.5, framst Serie A/B). Nara avspark ar effekten
  // inte bekraftad, sa den anvands bara nar avsparken ar minst sa har manga timmar bort.
  learnedMinHours: 24,
  // Oddsen styr 1X2-tipset (och O/U dar marknaden var battre) hela sasongen i ligor med marknadstest, se buildPro
  marketLedTips: true,
};

// Strategier: sannolikhet [H,D,A,Over] + vilken bok vi "tar" priset hos (oppningsodds).
// consensus = Kaunitz m.fl.: skarp marknad (Pinnacle devig) som sannolikhet, basta pris (Max) som odds.
export const STRATEGIES = {
  dcAtPinnacle: { book: 'pinnacle_', probs: (r) => dcProbs(r.dc) },
  dcAtBestPrice: { book: 'max_', probs: (r) => dcProbs(r.dc) },
  consensusAtBestPrice: { book: 'max_', probs: (r) => pinOpen(r.m) },
  // Som live nar Pinnacle saknas (fran 2025/26): facit = snitt av bolagens oppningsodds utan marginal
  averageConsensusAtBestPrice: { book: 'max_', probs: (r) => avgOpen(r.m) },
  marketAnchoredAtBestPrice: {
    book: 'max_',
    probs: (r) => {
      const mk = pinOpen(r.m);
      if (!mk) return null;
      const dc = dcProbs(r.dc);
      return mk.map((x, i) => CONFIG.marketAnchor * x + (1 - CONFIG.marketAnchor) * dc[i]);
    },
  },
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const writeJson = (p, obj) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
};

const store = readJson(P.store);
const matches = store.matches
  .filter((m) => Number.isFinite(m.hg) && Number.isFinite(m.ag))
  .sort((a, b) => a.date.localeCompare(b.date));
const byLeague = groupBy(matches, (m) => m.league);

// ---------- Dixon-Coles per liga (full data -> kommande matcher) ----------
// Parametrar per liga ur config/league-models.json (npm run tune), prior for nya lag i ligan
const leagueModels = loadLeagueModels(P.leagueModels);
const tiers = buildTiers(readJson(P.leaguesCfg));
const today = new Date().toISOString().slice(0, 10);
const upcomingTeams = {};
for (const f of fs.existsSync(P.fixtures) ? readJson(P.fixtures) : []) {
  (upcomingTeams[f.league] ??= new Set()).add(f.home).add(f.away);
}
const models = {};
for (const [league, list] of Object.entries(byLeague)) {
  const model = fitLeagueModel(list, today, paramsFor(leagueModels, league), {
    league, byLeague, tiers, teams: upcomingTeams[league],
  });
  if (model) models[league] = model;
}

// ---------- Spelarmodell (Understat) ----------
const playerModel = loadPlayerModel(P.usLeague, P.usPlayers, matches);

// ---------- Utvardering: veckovis refit, point-in-time ----------
const weatherHistory = fs.existsSync(P.weatherHistory) ? readJson(P.weatherHistory).matches : {};
const evaluation = evaluate();
evaluation.drawCalibrationBlend = drawCalibrationBlend(evaluation.rowsByLeague);
evaluation.marketTest = marketTest(evaluation.rowsByLeague);
evaluation.tipAccuracy = tipAccuracy(evaluation.rowsByLeague, evaluation.marketTest);
evaluation.weatherEffect = weatherEffect();
evaluation.playerEffect = playerEffect(evaluation.rowsByLeague);
delete evaluation.rowsByLeague;
if (evaluation.playerEffect?.chosenAlpha != null) CONFIG.playerAlpha = evaluation.playerEffect.chosenAlpha;
writeJson(P.evaluation, evaluation);

// ---------- Domare ----------
const referees = buildReferees();
writeJson(P.referees, referees);

// ---------- Berika tips ----------
const tips = readJson(P.tips);
applyTipAccuracy(tips, evaluation.tipAccuracy);
const fixtures = fs.existsSync(P.fixtures) ? readJson(P.fixtures) : [];
const apiOddsList = fs.existsSync(P.odds) ? readJson(P.odds).events ?? [] : [];
// Reserv: OddsPortal (1X2-snitt) for matcher som The Odds API saknar - se scripts/fetch-oddsportal.mjs
const apiHasOdds = (e) => apiOddsList.some((x) => x.league === e.league && x.commence
  && Math.abs(daysBetween(x.commence.slice(0, 10), e.commence.slice(0, 10))) <= 1
  && nameSimilarity(x.homeRaw ?? x.home, e.home) + nameSimilarity(x.awayRaw ?? x.away, e.away) >= 1
  && (x.books ?? []).some((b) => b.home > 1));
const oddsportalList = (fs.existsSync(P.oddsportal) ? readJson(P.oddsportal).events ?? [] : [])
  .filter((e) => e.commence > new Date().toISOString() && !apiHasOdds(e));
const liveOddsList = [...apiOddsList, ...oddsportalList];
const liveOdds = new Map(liveOddsList.map((e) => [`${e.league}|${e.home}|${e.away}`, e]));
// Idempotent: ta bort marknadstips fran en tidigare korning (npm run pro kan koras flera ganger)
tips.allCandidates = (tips.allCandidates ?? []).filter((t) => !t.marketOnly);
tips.bestUpcoming = (tips.bestUpcoming ?? []).filter((t) => !t.marketOnly);
const usedEvents = new Set();
const enriched = new Map();
// Avsparkstid: spelschemat (ESPN/TheSportsDB) eller oddsens commence - GUI ska alltid kunna visa klockslag
const fixtureKick = new Map(fixtures.filter((f) => f.kickoffUtc).map((f) => [`${f.date}|${f.league}|${f.home}|${f.away}`, f.kickoffUtc]));
for (const t of [...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])]) {
  const key = `${t.date}|${t.league}|${t.home}|${t.away}`;
  if (!enriched.has(key)) enriched.set(key, buildPro(t));
  t.pro = enriched.get(key);
  applyMarketLed(t);
  t.kickoffUtc ??= fixtureKick.get(key) ?? t.pro.kickoffUtc ?? null;
}
// Matcher med skarpa odds men utan modelltips (cuper, Superettan, lag utan historik) -> marknadstips
const marketOnly = marketOnlyCandidates();
for (const t of marketOnly) {
  const key = `${t.date}|${t.league}|${t.home}|${t.away}`;
  enriched.set(key, (t.pro = buildPro(t)));
  tips.allCandidates.push(t);
  if (Object.values(t.pro.verdicts).some((v) => v.value)) tips.bestUpcoming.push(t);
}
// Domarsviter per lag (minst 5 raka segrar/forluster med matchens domare), engelska ligor - npm run domare
const refRows = loadRefereeMatches((rel) => { const f = path.join(root, rel); return fs.existsSync(f) ? readJson(f) : null; }, store.matches);
const refOf = upcomingReferees();
applyRefereeStreaks([...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])]);
// Antal kort Ö/U 3.5/4.5/5.5 (gula + roda): lagens kort + domarens niva, se scripts/lib/cards-model.mjs
applyCards([...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])]);
tips.proMeta = {
  updatedAt: new Date().toISOString(),
  config: CONFIG,
  models: Object.fromEntries(Object.entries(models).map(([lg, m]) => [lg, {
    trainMatches: m.trainCount, homeAdvantage: round(m.gamma, 3), rho: m.rho,
    params: paramsFor(leagueModels, lg), newTeamPriors: m.priors ?? {},
  }])),
  evaluationSummary: evaluation.summary,
  marketTest: evaluation.marketTest,
  note: 'pro = Dixon-Coles + devig (multiplicative) + spelarviktad franvaro + vilodagar (vader borttaget: paverkar inte utfallet, se weatherEffect). Fast insats stakeSek per spel. Se docs/krav/01-proffs-research.md',
};
tips.valueBets = [...enriched.values()]
  .flatMap((p) => p.valueBets.map((v) => ({ match: p.match, date: p.date, league: p.league, ...v })))
  .sort((a, b) => b.ev - a.ev);
writeJson(P.tips, tips);
appendMarkdown(tips, evaluation);
recordOddsHistory(enriched);

console.log(`Pro-lager: models=${Object.keys(models).join(',')} tips=${enriched.size} valueBets=${tips.valueBets.length}`);
for (const [lg, s] of Object.entries(evaluation.summary)) {
  const dc = s.strategies.dcAtPinnacle;
  const cons = s.strategies.consensusAtBestPrice;
  console.log(`  ${lg}: n=${s.n} RPS dc=${s.rpsDc} pinClose=${s.rpsPinnacleClose} | CLV dc=${dc.meanClv} (n=${dc.n}) konsensus=${cons.meanClv} (n=${cons.n})`);
}

// ======================================================================

function upcomingReferees() {
  const upcoming = fs.existsSync(P.refUpcoming) ? readJson(P.refUpcoming).matches ?? [] : [];
  return new Map(upcoming.filter((m) => m.referee).map((m) => [`${m.league}|${m.date}|${m.home}|${m.away}`, m.referee]));
}

function applyCards(list) {
  const index = buildCardIndex(refRows, today, CARD_CFG, { refKey });
  for (const t of list ?? []) {
    if (!t.tips) continue;
    const referee = refOf.get(`${t.league}|${t.date}|${t.home}|${t.away}`) ?? null;
    const pred = predictCards(index, { league: t.league, home: t.home, away: t.away, referee }, { resolveName: resolveTeam });
    const pick = pickCardLine(pred);
    // tips-latest kan redan ha CARDS från en tidigare körning: utan prognos ska raden bort
    if (pick) t.tips.CARDS = { ...pick, ...pred };
    else delete t.tips.CARDS;
    // Båda lagen får kort (Ja/Nej), samma prognos
    if (pred) t.tips.BOTH_CARDS = { pick: pred.pBoth >= 0.5 ? 'JA' : 'NEJ', pYes: pred.pBoth, confidence: Math.round(Math.max(pred.pBoth, 1 - pred.pBoth) * 1000) / 1000 };
    else delete t.tips.BOTH_CARDS;
  }
}

function applyRefereeStreaks(list) {
  if (!refOf.size) return;
  const index = buildRefIndex(refRows);
  for (const t of list ?? []) {
    if (!REF_LEAGUES.has(t.league)) continue;
    const referee = refOf.get(`${t.league}|${t.date}|${t.home}|${t.away}`);
    t.referee = referee ? refereeFlags(index, { referee, home: t.home, away: t.away }) : null;
  }
}

function buildPro(t) {
  const model = models[t.league];
  const availability = availabilityInfo(t);
  const dc = model ? predictDixonColes(model, t.home, t.away, 10, {
    home: availability?.home.attackFactor ?? 1, away: availability?.away.attackFactor ?? 1,
  }) : null;
  // Grundmodellen FORE dess platta franvaroavdrag - franvaro hanteras spelarviktat i DC ovan
  const pre = t.probsBeforeAvailability;
  const own = t.modelTips ?? t.tips; // modellens egna tips, aldrig ett tidigare marknadsstyrt
  const base = {
    home: pre?.home ?? own?.['1X2']?.probs?.home,
    draw: pre?.draw ?? own?.['1X2']?.probs?.draw,
    away: pre?.away ?? own?.['1X2']?.probs?.away,
    over25: pre?.over25 ?? own?.OU25?.pOver,
    btts: pre?.btts ?? own?.BTTS?.pYes,
  };
  const w = dc ? CONFIG.dcWeight : 0;
  const blend = (k) => (dc && base[k] != null ? w * dc[k] + (1 - w) * base[k] : dc ? dc[k] : base[k]);
  const blended = { home: blend('home'), draw: blend('draw'), away: blend('away'), over25: blend('over25'), btts: blend('btts') };
  const s = blended.home + blended.draw + blended.away;
  blended.home /= s; blended.draw /= s; blended.away /= s;

  const ev = findLiveOdds(t);
  if (ev) usedEvents.add(ev);
  const books = ev?.books ?? [];
  // Facit: Pinnacle, annars Betfair Exchange (borsodds - reservkallan har inte Pinnacle)
  const sharp = findSharpBook(books);
  const pinnacle = sharp;
  // Pris: dina bolag. Reservkallan saknar dem -> marknadens basta pris (kontrollera hos ditt bolag).
  let myBooks = books.filter((b) => CONFIG.userBooks.includes(b.key));
  if (!myBooks.length) myBooks = books.filter((b) => b.key === 'market_max' || b.key === 'oddsportal');
  let market = null;
  const valueBets = [];
  const verdicts = {};
  // Basta pris hos bolag anvandaren kan spela hos (line shopping). Utan bolagslista: det enda odds vi har.
  const best = (k) => {
    let top = { price: null, bookmaker: null };
    for (const b of myBooks) if (b[k] > (top.price ?? 0)) top = { price: b[k], bookmaker: b.bookmaker };
    if (top.price == null && !books.length) {
      const single = t.value?.odds ?? ev?.odds;
      if (single?.[k] > 1) top = { price: single[k], bookmaker: t.value?.bookmaker ?? ev?.bookmaker ?? null };
    }
    return top;
  };
  const outcomes = [
    ['1X2', '1', 'home', blended.home],
    ['1X2', 'X', 'draw', blended.draw],
    ['1X2', '2', 'away', blended.away],
    ['OU25', 'OVER 2.5', 'over25', blended.over25],
    ['OU25', 'UNDER 2.5', 'under25', 1 - blended.over25],
  ];
  const prices = Object.fromEntries(outcomes.map(([, , k]) => [k, best(k)]));

  // Facit (marginalfri sannolikhet), i prioritetsordning:
  //  1. Pinnacle / Betfair Exchange: skarpt, EV-troskel minEv (backtest +6.5 %, 76 % slog closing)
  //  2. Snitt av minst consensusMinBooks bolag: svagare, hogre troskel minEvConsensus (backtest EV>=5 %: +1.8 %, 67 % slog closing)
  //  3. Annars inget omdome. Modellen paverkar INTE vardet - ett bolags odds + modell gav -20 % i backtest.
  // Facit per marknad (1X2 resp. O/U), i prioritetsordning - alltid ett omdome nar odds visas:
  //  1. Pinnacle / Betfair Exchange (rimlighetskontrollerat): minEv (backtest +6.5 %, 76 % slog closing)
  //  2. Snitt av minst consensusMinBooks bolag: minEvConsensus (backtest EV>=5 %: +1.8 %, 67 % slog closing)
  //  3. Snitt av 1-3 bolag: minEvThin - svagt facit, darfor hog troskel
  //  4. Inget facit (bara ett utfall prissatt): Ej varde - inget belagt varde
  // Modellen paverkar INTE vardet - ett bolags odds + modell gav -20 % i backtest.
  const sharpName = sharp ? (/pinnacle/i.test(sharp.key) ? 'pinnacle' : 'betfair-exchange') : null;
  const fairFrom = (keys) => {
    if (sharp) {
      const f = devigMultiplicative(keys.map((k) => sharp[k]));
      if (f) return { p: f, source: sharpName, minEv: CONFIG.minEv };
    }
    let ps = books.map((b) => devigMultiplicative(keys.map((k) => b[k]))).filter(Boolean);
    if (!ps.length) {
      const single = t.value?.odds ?? ev?.odds;
      const f = single ? devigMultiplicative(keys.map((k) => single[k])) : null;
      ps = f ? [f] : [];
    }
    if (!ps.length) return null;
    const avg = keys.map((_, i) => ps.reduce((sum, x) => sum + x[i], 0) / ps.length);
    const strong = ps.length >= CONFIG.consensusMinBooks;
    return {
      p: avg,
      source: ps.length === 1 ? (books[0]?.key === 'oddsportal' ? 'OddsPortal-snitt' : 'ett bolag') : `snitt av ${ps.length} bolag`,
      minEv: strong ? CONFIG.minEvConsensus : CONFIG.minEvThin,
    };
  };
  const useSharp = !!sharp;
  const f1x2 = fairFrom(['home', 'draw', 'away']);
  const learned = learnedAdjust(t, f1x2, ev);
  const fOu = fairFrom(['over25', 'under25']);
  // Tidig sasong i ligor dar marknaden ar klart battre an modellen (earlyMarket, npm run tune):
  // marknadens chans styr tipset tills bada lagen spelat EARLY_ROUNDS ligamatcher
  const early = paramsFor(leagueModels, t.league).earlyMarket && !t.marketOnly
    ? { home: seasonMatchesSoFar(t.league, t.home, t.date), away: seasonMatchesSoFar(t.league, t.away, t.date) } : null;
  let marketLed = early && f1x2 && Math.min(early.home, early.away) < EARLY_ROUNDS
    ? { kind: 'early', source: f1x2.source, sourceOu: fOu?.source ?? null, leagueMatches: early, rounds: EARLY_ROUNDS } : null;
  if (marketLed) {
    [blended.home, blended.draw, blended.away] = f1x2.p;
    if (fOu) blended.over25 = fOu.p[0];
  } else if (CONFIG.marketLedTips && f1x2 && !t.marketOnly) {
    // Hela sasongen: marknadstestet (marketTest, halva perioden tranar vikten, andra halvan kontrollerar) visade
    // att oddsen slar modellen i 21 av 22 ligor. Oddsen styr tipset, modellen vags in bara med testad vikt.
    const mt = evaluation.marketTest?.[t.league];
    const test = mt?.vsOpening?.n >= 60 ? mt.vsOpening : mt?.vsClosing?.n >= 60 ? mt.vsClosing : null;
    if (test) {
      const modelW = test.modelAddsInfo ? test.bestW : 0;
      // Vikten testades mot Dixon-Coles ensam (marketTest), sa det ar DC som vags in - inte blandningen med grundmodellen
      const own = dc ? [dc.home, dc.draw, dc.away] : [blended.home, blended.draw, blended.away];
      [blended.home, blended.draw, blended.away] = f1x2.p.map((x, i) => (1 - modelW) * x + modelW * own[i]);
      // O/U: bara dar Pinnacle var battre an modellen (Brier) i utvarderingen
      const s = evaluation.summary?.[t.league];
      const ouMarket = fOu && s?.brierOuPinnacleClose != null && s.brierOuPinnacleClose < s.brierOuDc;
      if (ouMarket) blended.over25 = fOu.p[0];
      marketLed = { kind: 'backtest', source: f1x2.source, sourceOu: ouMarket ? fOu.source : null, modelW, n: test.n };
    }
  }
  const groupOf = (k) => (['home', 'draw', 'away'].includes(k) ? f1x2 : fOu);
  const fair = { home: f1x2?.p[0], draw: f1x2?.p[1], away: f1x2?.p[2], over25: fOu?.p[0], under25: fOu?.p[1] };
  const fairSource = f1x2?.source ?? fOu?.source ?? null;
  if (f1x2 || fOu) {
    market = {
      fairSource,
      fairSourceOu: fOu?.source ?? null,
      minEv: f1x2?.minEv ?? fOu?.minEv,
      booksCount: books.length,
      myBooks: myBooks.map((b) => b.bookmaker),
      overround1x2: useSharp && f1x2?.source === sharpName ? round(overround([sharp.home, sharp.draw, sharp.away])) : null,
      fair: Object.fromEntries(Object.entries(fair).map(([k, v]) => [k, round(v)])),
      learned,
    };
  }
  for (const [mkt, pick, k, modelP] of outcomes) {
    const { price, bookmaker } = prices[k];
    if (!(price > 1)) continue;
    const g = groupOf(k);
    const p = fair[k];
    if (!g || p == null) {
      verdicts[k] = { market: mkt, pick, odds: price, bookmaker, value: false, reason: 'för lite oddsdata för facit' };
      continue;
    }
    const evVal = p * price - 1;
    // Skrallar over maxOdds: devig overskattar deras chans (favorit-longshot-bias) -> aldrig varde
    const tooLong = price > CONFIG.maxOdds;
    const suspect = evVal > CONFIG.maxEv;
    // Omdome: vart att spela till dagens basta odds? minOdds = lagsta odds med EV >= troskeln
    // (avrundas uppat: 3.7036 -> 3.71, annars visas "minsta odds 3.70" pa ett odds 3.70 som ar Ej varde)
    verdicts[k] = {
      market: mkt, pick, odds: price, bookmaker, p: round(p), ev: round(evVal), fairSource: g.source,
      minOdds: Math.ceil(((1 + g.minEv) / p) * 100 - 1e-9) / 100, value: !tooLong && !suspect && evVal >= g.minEv,
      riskReward: riskReward(price, p, CONFIG.stakeSek),
      ...(tooLong ? { reason: `odds över ${CONFIG.maxOdds} (skräll)` } : suspect ? { reason: `misstänkt EV ${Math.round(evVal * 100)} % – kontrollera oddsen` } : {}),
    };
    if (tooLong || suspect || evVal < g.minEv) continue;
    valueBets.push({
      market: mkt, pick, odds: price, bookmaker, strategy: g.source === sharpName ? 'consensusAtBestPrice' : 'averageConsensusAtBestPrice',
      fairSource: g.source, p: round(p), modelP: round(modelP), ev: round(evVal), stakeSek: CONFIG.stakeSek,
    });
  }
  valueBets.sort((a, b) => b.ev - a.ev);

  return {
    match: t.match, date: t.date, league: t.league, kickoffUtc: ev?.commence ?? null,
    dc: dc && {
      home: round(dc.home), draw: round(dc.draw), away: round(dc.away), over25: round(dc.over25),
      btts: round(dc.btts), lambdaHome: round(dc.lambdaHome, 2), lambdaAway: round(dc.lambdaAway, 2),
      knownTeams: dc.knownTeams,
    },
    blended: Object.fromEntries(Object.entries(blended).map(([k, v]) => [k, round(v)])),
    marketLed,
    market,
    valueBets,
    verdicts,
    odds: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v.price])),
    oddsBooks: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v.bookmaker])),
    rest: { home: restInfo(t.league, t.home, t.date), away: restInfo(t.league, t.away, t.date) },
    availability,
  };
}

// Lardomsjustering av 1X2-facit (andrar f1x2.p pa plats). Signaler for matchen ur data/matcher/<liga>.csv.
// (cache pa funktionen: buildPro kors pa toppniva innan en const har skulle hinna initieras)
function signalsFor(t) {
  const matchSignals = (signalsFor.cache ??= new Map());
  if (!matchSignals.has(t.league)) {
    const m = new Map();
    const file = path.join(root, 'data', 'matcher', `${t.league}.csv`);
    if (fs.existsSync(file)) {
      const [head, ...lines] = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
      const cols = head.split(',');
      const iH2h = cols.indexOf('h2h_pts');
      for (const l of lines) {
        if (!l.startsWith('kommande')) continue;
        const c = l.split(',');
        m.set(`${c[3]}|${c[5]}|${c[6]}`, { h2hPts: c[iH2h] === '' ? null : Number(c[iH2h]), ...extraSignals(t.league, c[2], c[5], c[6]) });
      }
    }
    matchSignals.set(t.league, m);
  }
  return matchSignals.get(t.league).get(`${t.date}|${t.home}|${t.away}`) ?? {};
}
function learnedAdjust(t, f1x2, ev) {
  if (!f1x2 || process.env.LEARNED_OFF) return null;
  const kick = ev?.commence ?? t.kickoffUtc;
  const hours = kick ? (Date.parse(kick) - Date.now()) / 36e5 : null;
  if (hours == null) return null;
  // Nara avspark: bara hoghojd (skattad mot stangningsodds), inte ligakalibreringen (bara bekraftad mot oppningsodds)
  const doc = loadAdjustments();
  const late = hours < CONFIG.learnedMinHours;
  const { p, applied } = adjustProbs(f1x2.p, t.league, signalsFor(t), 'open', late ? { altitude: doc?.altitude } : doc);
  if (!applied.length) return null;
  const before = f1x2.p.map((x) => round(x));
  f1x2.p = p;
  return { applied, before, after: p.map((x) => round(x)) };
}

// Ligamatcher laget spelat hittills i sasongen (ingen ligamatch pa 60 dagar = ny sasong, 0)
function seasonMatchesSoFar(league, team, date) {
  const list = byLeague[league] ?? [];
  const last = list.filter((m) => m.date < date && daysBetween(m.date, date) <= 60).at(-1);
  if (!last) return 0;
  return list.filter((m) => m.season === last.season && m.date < date && (m.home === team || m.away === team)).length;
}

// Marknadsstyrt tips: 1X2 (och O/U om facit finns) fran marknaden, modellens tips sparas i modelTips
function applyMarketLed(t) {
  const ml = t.pro?.marketLed;
  if (!ml) {
    // Lagen har passerat de tidiga omgangarna (eller ligan tunats om): tillbaka till modellens tips
    if (t.modelTips) t.tips = t.modelTips;
    delete t.modelTips;
    delete t.marketLed;
    delete t.marketLedNote;
    return;
  }
  t.modelTips ??= structuredClone(t.tips);
  const b = t.pro.blended;
  const probs = { home: b.home, draw: b.draw, away: b.away };
  const [pick, conf] = [['1', probs.home], ['X', probs.draw], ['2', probs.away]].sort((x, y) => y[1] - x[1])[0];
  t.tips['1X2'] = { ...t.tips['1X2'], pick, confidence: round(conf, 3), probs: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 3)])) };
  if (ml.sourceOu) {
    t.tips.OU25 = { ...t.tips.OU25, pick: b.over25 >= 0.5 ? 'OVER 2.5' : 'UNDER 2.5', confidence: round(Math.max(b.over25, 1 - b.over25), 3), pOver: round(b.over25, 3) };
  }
  t.marketLed = true;
  t.marketLedNote = ml.kind === 'backtest'
    ? `Oddsen (${String(ml.source).replace(/^./, (c) => c.toUpperCase())}) styr tipset – de var bättre än modellen i backtest (${ml.n} matcher)${ml.modelW ? `, modellen väger ${Math.round(ml.modelW * 100)} %` : ''}`
    : `Tidig säsong – marknadens chans (${ml.source}) styr tipset tills lagen spelat ${ml.rounds} ligamatcher`;
}

// ---------- Franvaro live: FPL (PL) + bekraftade elvor (ESPN) ----------
// Laddas lat (anropas fran toppnivan innan denna del av filen evaluerats)
var liveAvailCache; // eslint-disable-line no-var
function liveAvailData() {
  if (liveAvailCache) return liveAvailCache;
  const fplById = new Map();
  if (fs.existsSync(P.fpl)) {
    for (const team of readJson(P.fpl).teams ?? []) for (const p of team.players ?? []) fplById.set(p.id, p);
  }
  // Understat-id -> FPL-spelare (id-koppling i player_stats.json, inga namn behover matchas)
  const fplByUnderstat = new Map();
  if (fs.existsSync(P.playerStats)) {
    for (const p of readJson(P.playerStats).premierLeague ?? []) {
      if (p.understatId && p.fpl?.fplId != null && fplById.has(p.fpl.fplId)) fplByUnderstat.set(String(p.understatId), fplById.get(p.fpl.fplId));
    }
  }
  const lineupByMatch = new Map(
    (fs.existsSync(P.lineups) ? readJson(P.lineups).fixtures ?? [] : []).map((f) => [`${f.league}|${f.home}|${f.away}`, f]),
  );
  return (liveAvailCache = { fplByUnderstat, lineupByMatch });
}

/** Sannolikhet att spelaren saknas: FPL-status + chans att spela nasta omgang. */
function fplAbsence(p) {
  if (!p) return 0;
  if (['i', 's', 'u', 'n'].includes(p.status)) return 1;
  const c = p.chanceNext;
  if (c == null) return p.status === 'd' ? 0.5 : 0;
  return Math.max(0, Math.min(1, 1 - c / 100));
}

function availabilityInfo(t) {
  if (!playerModel) return null;
  const { fplByUnderstat, lineupByMatch } = liveAvailData();
  const lineup = lineupByMatch.get(`${t.league}|${t.home}|${t.away}`);
  const confirmed = lineup?.lineupStatus === 'confirmed';
  const squadFile = path.join(P.squads, `${t.league}.json`);
  const squads = fs.existsSync(squadFile) ? readJson(squadFile).teams : null;
  const side = (team, starters) => {
    // Salda/utlanade spelare har kvar sin Understat-andel ett ar: rakna bara dem som finns i truppen nu
    const shares = inCurrentSquad(teamShares(playerModel, t.league, team, t.date), squads?.[team]?.players, t.date);
    if (!shares.length) return { source: 'ingen spelardata', attackFactor: 1, missingShare: 0, players: [] };
    const missing = [];
    if (confirmed) {
      const names = (starters ?? []).map((s) => String(s.name ?? s).toLowerCase());
      for (const p of shares) {
        const last = p.name.toLowerCase().split(/\s+/).at(-1);
        if (!names.some((n) => n.includes(last))) missing.push({ name: p.name, share: p.share, weight: 0.8, reason: 'ej i startelvan' });
      }
    } else if (t.league === 'PL') {
      for (const p of shares) {
        const f = fplByUnderstat.get(p.id);
        const w = fplAbsence(f);
        if (w > 0) missing.push({ name: p.name, share: p.share, weight: w, reason: f.news || `FPL status ${f.status}` });
      }
    }
    const s = summariseMissing(missing);
    const hasSource = confirmed || t.league === 'PL';
    // Ingen franvarokalla -> anta normal franvaro (faktor 1)
    const typical = typicalMissing(t.league, team);
    // Elva: faktisk franvaro (inkl. rotation) mot normal. FPL: skador/avstangningar ar extra utover normal rotation.
    const effective = confirmed ? s.missingShare : Math.min(0.6, typical + s.missingShare);
    return {
      source: confirmed ? 'ESPN startelva' : t.league === 'PL' ? 'FPL' : 'ingen franvarokalla',
      missingShare: round(s.missingShare, 3),
      typicalMissing: round(typical, 3),
      attackFactor: hasSource ? round(attackFactor(CONFIG.playerAlpha, effective, typical), 3) : 1,
      players: missing.map((m) => ({ name: m.name, share: round(m.share, 3), weight: m.weight, reason: m.reason })),
      topPlayers: shares.slice(0, 3).map((p) => ({ name: p.name, share: round(p.share, 3) })),
    };
  };
  return {
    alpha: CONFIG.playerAlpha,
    home: side(t.home, lineup?.homeStarters),
    away: side(t.away, lineup?.awayStarters),
  };
}

/**
 * Tipsrader for oddsmatcher som saknar modelltips (cuper, Superettan, lag utan historik).
 * Sannolikheten ar Pinnacles/Betfairs marginalfria odds - samma facit som vardeomdomet.
 */
function marketOnlyCandidates() {
  const limit = new Date(Date.now() + 21 * 86_400_000).toISOString(); // samma horisont som modelltipsen
  const now = new Date().toISOString();
  const rows = [];
  // Samma match kan finnas i bade Odds API och OddsPortal: har modelltipset redan odds -> inget dubblett-marknadstips
  const sameMatch = (a, b) => a.league === b.league && Math.abs(daysBetween(a.commence.slice(0, 10), b.commence.slice(0, 10))) <= 1
    && nameSimilarity(a.homeRaw ?? a.home, b.homeRaw ?? b.home) + nameSimilarity(a.awayRaw ?? a.away, b.awayRaw ?? b.away) >= 1.5;
  const used = [...usedEvents];
  for (const e of liveOddsList) {
    if (usedEvents.has(e) || !e.commence || e.commence < now || e.commence > limit) continue;
    if (used.some((u) => u.commence && sameMatch(u, e))) continue;
    if (rows.some((r) => r._ev && sameMatch(r._ev, e))) continue;
    const books = e.books ?? [];
    const sharp = findSharpBook(books);
    // Utan skarpt facit (t.ex. Superettan): snitt av alla bolags marginalfria odds - bara som tips, inget vardeomdome
    const avgOf = (keys) => {
      const ps = books.map((b) => devigMultiplicative(keys.map((k) => b[k]))).filter(Boolean);
      return ps.length ? keys.map((_, i) => ps.reduce((s, p) => s + p[i], 0) / ps.length) : null;
    };
    const f1 = sharp ? devigMultiplicative([sharp.home, sharp.draw, sharp.away]) : avgOf(['home', 'draw', 'away']);
    if (!f1) continue;
    const fOu = sharp ? devigMultiplicative([sharp.over25, sharp.under25]) : avgOf(['over25', 'under25']);
    const probs = { home: f1[0], draw: f1[1], away: f1[2] };
    const [pick, conf] = [['1', probs.home], ['X', probs.draw], ['2', probs.away]].sort((a, b) => b[1] - a[1])[0];
    const pOver = fOu?.[0] ?? null;
    const ouConf = pOver == null ? null : Math.max(pOver, 1 - pOver);
    // Samma match i spelschemat -> omgang + schemats lagnamn (GUI visar bara nasta omgang per liga)
    const fx = fixtures.find((f) => f.league === e.league && Math.abs(daysBetween(f.date, e.commence.slice(0, 10))) <= 1
      && nameSimilarity(f.home, e.homeRaw ?? e.home) + nameSimilarity(f.away, e.awayRaw ?? e.away) >= 1);
    const home = fx?.home ?? e.homeRaw ?? e.home;
    const away = fx?.away ?? e.awayRaw ?? e.away;
    const date = fx?.date ?? e.commence.slice(0, 10);
    // Matchen har redan ett modelltips under schemats namn (oddshandelsen matchades inte dar) -> inget dubblett-marknadstips
    const sameTip = (t) => t.league === e.league && Math.abs(daysBetween(t.date, date)) <= 1 && sameTeamName(t.home, home) && sameTeamName(t.away, away);
    if ((tips.allCandidates ?? []).some((t) => !t.marketOnly && sameTip(t))) continue;
    // Tva oddskallor for samma match (olika stavning/datum): behall den vars avspark stammer med spelschemat
    const twin = rows.findIndex((r) => sameTip(r));
    if (twin >= 0) {
      const fits = (ev) => (fx ? ev.commence.slice(0, 10) === fx.date : false);
      if (fits(rows[twin]._ev) || !fits(e)) continue;
      rows.splice(twin, 1);
    }
    rows.push({
      date, kickoffUtc: e.commence, league: e.league, round: fx?.round ?? null,
      home, away, match: `${home} vs ${away}`,
      tips: {
        '1X2': { pick, confidence: round(conf, 3), probs: Object.fromEntries(Object.entries(probs).map(([k, v]) => [k, round(v, 3)])) },
        BTTS: { pick: null, confidence: null, pYes: null },
        OU25: { pick: pOver == null ? null : pOver >= 0.5 ? 'OVER 2.5' : 'UNDER 2.5', confidence: ouConf == null ? null : round(ouConf, 3), pOver: pOver == null ? null : round(pOver, 3) },
      },
      tipScore: round(ouConf == null ? conf : (conf + ouConf) / 2, 3),
      marketOnly: true,
      marketSource: sharp ? (/pinnacle/i.test(sharp.key) ? 'Pinnacle' : 'Betfair Exchange') : `snitt av ${books.length} bolag`,
      note: `Marknadstips (${sharp ? (/pinnacle/i.test(sharp.key) ? 'Pinnacle' : 'Betfair Exchange') : `snitt av ${books.length} bolag`} utan marginal) - ingen modell for denna liga/match`,
      _ev: e,
    });
  }
  for (const r of rows) delete r._ev;
  return rows;
}

/**
 * Odds for en match: exakt namn, annars samma liga, datum +-1 dag och bast namnlikhet.
 * Odds API anvander fulla klubbnamn ("Borussia Dortmund"), tipsen football-data/openfootball-namn.
 */
function findLiveOdds(t) {
  const exact = liveOdds.get(`${t.league}|${t.home}|${t.away}`);
  if (exact) return exact;
  let best = null;
  let bestScore = 0;
  let wide = null;
  let wideScore = 0;
  for (const e of liveOddsList) {
    if (e.league !== t.league || !e.commence) continue;
    const dd = Math.abs(daysBetween(e.commence.slice(0, 10), t.date));
    if (dd > 4) continue;
    const score = nameSimilarity(t.home, e.homeRaw ?? e.home) + nameSimilarity(t.away, e.awayRaw ?? e.away);
    if (dd <= 1 && score > bestScore) { bestScore = score; best = e; }
    if (score > wideScore) { wideScore = score; wide = e; }
  }
  if (bestScore >= 1) return best; // kraver rimlig likhet for bada lagen tillsammans
  // Flyttad match (schema och odds skiljer 2-4 dagar): bara vid nastan sakra namn
  return wideScore >= 1.6 ? wide : null;
}

function normName(s) {
  return String(TEAM_ALIASES[s] ?? s).replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/å/gi, 'a').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\b(fc|afc|cf|sc|ac|ss|as|us|ssc|rc|rcd|cd|ud|sd|sv|vfb|vfl|tsg|bv|fk|1\.|club|de|calcio|hotspur)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
}

/**
 * 0..1: andel ord som matchar (prefix racker, t.ex. "nott" ~ "nottingham"), matt at bada hallen
 * sa att "U. Catolica" ~ "Universidad Catolica (CHI)" ger samma poang oavsett ordning.
 */
function nameSimilarity(a, b) {
  const A = normName(a);
  const B = normName(b);
  if (!A.length || !B.length) return 0;
  const share = (X, Y) => X.filter((w) => Y.some((v) => v.startsWith(w) || w.startsWith(v))).length / X.length;
  return Math.max(share(A, B), share(B, A));
}

/**
 * Paverkar vader O/U 2.5 utover vad Pinnacle closing redan prisar in?
 * residual = faktisk over-andel - marknadens fair over-p. |z| > 2 = varde att titta pa.
 */
function weatherEffect() {
  const rows = [];
  for (const m of matches) {
    const w = weatherHistory[m.id];
    const fair = devigMultiplicative([m.closing?.pinnacle_over25, m.closing?.pinnacle_under25])
      ?? devigMultiplicative([m.closing?.avg_over25, m.closing?.avg_under25]);
    if (!w || !fair) continue;
    rows.push({ w, pOver: fair[0], over: m.over25 ? 1 : 0, goals: m.hg + m.ag });
  }
  const bucket = (name, fn, edges) => {
    const out = [];
    for (let i = 0; i < edges.length; i++) {
      const lo = edges[i];
      const hi = edges[i + 1] ?? Infinity;
      const sel = rows.filter((r) => fn(r.w) != null && fn(r.w) >= lo && fn(r.w) < hi);
      if (!sel.length) continue;
      const n = sel.length;
      const overRate = sel.reduce((s, r) => s + r.over, 0) / n;
      const fairOver = sel.reduce((s, r) => s + r.pOver, 0) / n;
      const variance = sel.reduce((s, r) => s + r.pOver * (1 - r.pOver), 0) / (n * n);
      out.push({
        bucket: hi === Infinity ? `>= ${lo}` : `${lo}-${hi}`, n,
        goalsPg: round(sel.reduce((s, r) => s + r.goals, 0) / n, 2),
        overRate: round(overRate, 3), marketFairOver: round(fairOver, 3),
        residual: round(overRate - fairOver, 3), z: round((overRate - fairOver) / Math.sqrt(variance), 2),
      });
    }
    return { variable: name, buckets: out };
  };
  return {
    n: rows.length,
    method: 'Pinnacle closing O/U 2.5 (devig) som forvantan; residual = faktisk over-andel - forvantan. |z| > 2 ~ signifikant.',
    wind: bucket('windKmh', (w) => w.windKmh, [0, 15, 25, 35]),
    gust: bucket('gustKmh', (w) => w.gustKmh, [0, 30, 50, 70]),
    precip: bucket('precipMm', (w) => w.precipMm, [0, 0.1, 1, 3]),
    temp: bucket('tempC', (w) => w.tempC, [-30, 5, 15, 25]),
  };
}

/** Vilodagar/matchtathet fran ligamatcher (spelade i store + schemalagda i fixtures). Cup/Europa saknas. */
function restInfo(league, team, date) {
  const dates = [
    ...matches.filter((m) => m.league === league && (m.home === team || m.away === team)).map((m) => m.date),
    ...fixtures.filter((f) => f.league === league && (f.home === team || f.away === team)).map((f) => f.date),
  ].filter((d) => d < date).sort();
  const last = dates.at(-1);
  const within = (n) => dates.filter((d) => daysBetween(d, date) <= n).length;
  const restDays = last ? daysBetween(last, date) : null;
  return {
    lastMatch: last ?? null,
    restDays,
    matches7d: within(7),
    matches14d: within(14),
    congested: restDays != null && restDays <= 3,
  };
}

function buildReferees() {
  const recent = matches.filter((m) => m.referee && daysBetween(m.date, today) <= 800);
  const refs = {};
  for (const m of recent) {
    const k = `${m.league}|${m.referee}`;
    const r = (refs[k] ??= { league: m.league, referee: m.referee, n: 0, yellow: 0, red: 0, fouls: 0, goals: 0, homeWins: 0, foulsN: 0 });
    const d = m.discipline ?? {};
    r.n++;
    r.yellow += (d.homeYellow ?? 0) + (d.awayYellow ?? 0);
    r.red += (d.homeRed ?? 0) + (d.awayRed ?? 0);
    if (d.homeFouls != null && d.awayFouls != null) {
      r.fouls += d.homeFouls + d.awayFouls;
      r.foulsN++;
    }
    r.goals += m.hg + m.ag;
    if (m.result === 'H') r.homeWins++;
  }
  const list = Object.values(refs)
    .filter((r) => r.n >= 5)
    .map((r) => ({
      league: r.league, referee: r.referee, matches: r.n,
      yellowPg: round(r.yellow / r.n, 2), redPg: round(r.red / r.n, 3),
      bookingPointsPg: round((10 * r.yellow + 25 * r.red) / r.n, 1),
      foulsPg: r.foulsN ? round(r.fouls / r.foulsN, 1) : null,
      goalsPg: round(r.goals / r.n, 2), homeWinRate: round(r.homeWins / r.n, 3),
    }))
    .sort((a, b) => b.yellowPg - a.yellowPg);
  return { updatedAt: new Date().toISOString(), source: 'football-data.co.uk Referee/HY/AY/HR/AR/HF/AF', count: list.length, referees: list };
}

// Lagets normala franvaro (senaste 20 matcherna, bara tidigare matcher) - DC:s styrka inkluderar den redan
var missingHistory; // eslint-disable-line no-var
function recordMissing(league, team, share) {
  missingHistory ??= new Map();
  const k = `${league}|${team}`;
  const list = missingHistory.get(k) ?? [];
  list.push(share);
  if (list.length > 20) list.shift();
  missingHistory.set(k, list);
}
function typicalMissing(league, team) {
  const list = missingHistory?.get(`${league}|${team}`);
  if (!list || list.length < 5) return 0.05; // standard innan laget har egen historik
  return list.reduce((s, x) => s + x, 0) / list.length;
}
function attackFactor(alpha, missing, typical) {
  return (1 - alpha * missing) / (1 - alpha * typical);
}

/** Saknad andel av anfallet for hemma/borta i en spelad match (null om ingen Understat-data). */
function matchMissing(m) {
  if (!playerModel) return null;
  const us = findUsMatch(playerModel, m.league, m.home, m.away, m.date);
  if (!us) return null;
  return {
    home: historicalMissing(playerModel, m.league, m.home, m.date, us.id),
    away: historicalMissing(playerModel, m.league, m.away, m.date, us.id),
  };
}

/**
 * Hjalper spelarviktad franvaro Dixon-Coles? RPS/Brier per alpha, bara matcher med spelardata.
 * Plus: prisar marknaden in franvaron (residual mot Pinnacle oppning resp. closing)?
 */
function playerEffect(rowsByLeague) {
  if (!playerModel) return null;
  const perLeague = {};
  const pooled = Object.fromEntries(CONFIG.playerAlphaGrid.map((a) => [a, { rps: 0, brierOu: 0 }]));
  let pooledN = 0;
  const marketRows = [];
  for (const [lg, rows] of Object.entries(rowsByLeague)) {
    const withData = rows.filter((r) => r.miss);
    if (!withData.length) continue;
    const res = Object.fromEntries(CONFIG.playerAlphaGrid.map((a) => [a, { rps: 0, brierOu: 0 }]));
    for (const r of withData) {
      for (const a of CONFIG.playerAlphaGrid) {
        const p = r.dcAlpha?.[a] ?? r.dc;
        const rp = rps1x2([p.home, p.draw, p.away], r.m.result);
        const bo = brier(p.over25, r.m.over25);
        res[a].rps += rp; res[a].brierOu += bo;
        pooled[a].rps += rp; pooled[a].brierOu += bo;
      }
      pooledN++;
      const pinOpen1 = devigMultiplicative([r.m.odds?.pinnacle_home, r.m.odds?.pinnacle_draw, r.m.odds?.pinnacle_away]);
      if (pinOpen1 && r.pinClose) {
        marketRows.push({
          diff: r.miss.away.missingShare - r.miss.home.missingShare, // positivt = bortalaget saknar mer
          homeWin: r.m.result === 'H' ? 1 : 0, pOpen: pinOpen1[0], pClose: r.pinClose[0],
        });
      }
    }
    const n = withData.length;
    perLeague[lg] = {
      n,
      withMissing: withData.filter((r) => r.miss.home.missingShare > 0 || r.miss.away.missingShare > 0).length,
      avgMissingShare: round(withData.reduce((s, r) => s + r.miss.home.missingShare + r.miss.away.missingShare, 0) / (2 * n), 3),
      byAlpha: Object.fromEntries(CONFIG.playerAlphaGrid.map((a) => [a, { rps: round(res[a].rps / n, 5), brierOu: round(res[a].brierOu / n, 5) }])),
    };
  }
  if (!pooledN) return null;
  const byAlpha = Object.fromEntries(CONFIG.playerAlphaGrid.map((a) => [a, {
    rps: round(pooled[a].rps / pooledN, 5), brierOu: round(pooled[a].brierOu / pooledN, 5),
  }]));
  // Valj alpha med lagst RPS; kraver forbattring mot alpha=0, annars ingen justering
  const best = CONFIG.playerAlphaGrid.reduce((b, a) => (byAlpha[a].rps < byAlpha[b].rps ? a : b), 0);

  const buckets = [[-1, -0.1], [-0.1, -0.02], [-0.02, 0.02], [0.02, 0.1], [0.1, 1.01]].map(([lo, hi]) => {
    const sel = marketRows.filter((r) => r.diff >= lo && r.diff < hi);
    const n = sel.length;
    if (!n) return null;
    const mean = (f) => sel.reduce((s, r) => s + f(r), 0) / n;
    const se = Math.sqrt(mean((r) => r.pClose * (1 - r.pClose)) / n);
    return {
      bucket: `${lo} till ${hi > 1 ? 1 : hi}`, n,
      homeWinRate: round(mean((r) => r.homeWin), 3),
      pinnacleOpen: round(mean((r) => r.pOpen), 3),
      pinnacleClose: round(mean((r) => r.pClose), 3),
      moveOpenToClose: round(mean((r) => r.pClose - r.pOpen), 4),
      residualVsOpen: round(mean((r) => r.homeWin - r.pOpen), 3),
      residualVsClose: round(mean((r) => r.homeWin - r.pClose), 3),
      zVsClose: round(mean((r) => r.homeWin - r.pClose) / se, 2),
    };
  }).filter(Boolean);

  return {
    method: 'Franvarande = viktig spelare (>= 3 % av lagets xG+xA senaste aret) som spelat for laget inom 60 dagar men inte i matchen. '
      + 'DC-attack x (1 - alpha * saknad andel). Matt pa samma point-in-time-DC som ovan. Bara anfall (xG+xA) - forsvar/malvakt fangas inte.',
    n: pooledN,
    byAlpha,
    chosenAlpha: best,
    improvementRps: round(byAlpha[0].rps - byAlpha[best].rps, 5),
    perLeague,
    market: {
      note: 'diff = bortalagets saknade andel - hemmalagets. Om marknaden prisar in franvaro flyttas oddset fran oppning till closing och residualVsClose ~ 0.',
      buckets,
    },
  };
}

function evaluate() {
  const perLeague = {};
  const rowsByLeague = {};
  const seasons = new Set(['2026/27', '2025/26']);
  for (const [league, list] of Object.entries(byLeague)) {
    const evalMatches = list.filter((m) => seasons.has(m.season));
    const byWeek = groupBy(evalMatches, (m) => weekStart(m.date));
    const rows = [];
    for (const [week, wm] of Object.entries(byWeek).sort()) {
      const model = fitLeagueModel(list, week, paramsFor(leagueModels, league), {
        league, byLeague, tiers, teams: wm.flatMap((m) => [m.home, m.away]),
      });
      if (!model) continue;
      for (const m of wm) {
        const dc = predictDixonColes(model, m.home, m.away);
        const pinClose = devigMultiplicative([m.closing?.pinnacle_home, m.closing?.pinnacle_draw, m.closing?.pinnacle_away]);
        const pinCloseOu = devigMultiplicative([m.closing?.pinnacle_over25, m.closing?.pinnacle_under25]);
        // Skarpt closing-facit: Pinnacle, annars Betfair Exchange (Pinnacle saknas i football-data fran 2025/26)
        const bfeClose = devigMultiplicative([m.closing?.bfe_home, m.closing?.bfe_draw, m.closing?.bfe_away]);
        const sharpClose = pinClose ?? bfeClose;
        const sharpSource = pinClose ? 'pinnacle' : bfeClose ? 'betfair' : null;
        const miss = matchMissing(m);
        let dcAlpha = null;
        if (miss) {
          // DC ar tranad pa matcher dar laget redan ibland saknat spelare -> jamfor mot lagets normala franvaro
          const avgH = typicalMissing(m.league, m.home);
          const avgA = typicalMissing(m.league, m.away);
          dcAlpha = Object.fromEntries(CONFIG.playerAlphaGrid.map((a) => [a, predictDixonColes(model, m.home, m.away, 10, {
            home: attackFactor(a, miss.home.missingShare, avgH), away: attackFactor(a, miss.away.missingShare, avgA),
          })]));
          recordMissing(m.league, m.home, miss.home.missingShare);
          recordMissing(m.league, m.away, miss.away.missingShare);
        }
        rows.push({ m, dc, pinClose, pinCloseOu, sharpClose, sharpSource, miss, dcAlpha });
      }
    }
    perLeague[league] = summarise(rows);
    rowsByLeague[league] = rows;
  }
  return {
    rowsByLeague,
    updatedAt: new Date().toISOString(),
    method: 'Dixon-Coles (parametrar per liga, prior for nya lag) refit per vecka (endast data fore veckan), sasong 2025/26 + 2026/27. Spel = flat 1 enhet pa Pinnacle oppningsodds nar dc-EV >= troskel. CLV mot devig:ad Pinnacle closing, annars Betfair Exchange closing.',
    thresholds: CONFIG.evalThresholds,
    summary: Object.fromEntries(Object.entries(perLeague).map(([lg, s]) => [lg, s.headline])),
    detail: perLeague,
  };
}

/**
 * Oddshistorik per match: forsta och senaste pris fore avspark (bast pris + marginalfritt facit).
 * Senaste snapshot = "stangning" i ligor dar football-data saknar closing (Div 1, HR, CZ ...),
 * forsta = "oppning". Ledgern raknar CLV mot den och marketTest provar modellen mot den nar matchen spelats.
 */
function recordOddsHistory(proByKey) {
  const doc = fs.existsSync(P.oddsHistory) ? readJson(P.oddsHistory) : { matches: {} };
  const now = new Date().toISOString();
  let added = 0;
  for (const [key, p] of proByKey) {
    const kick = p.kickoffUtc;
    if (!p.market?.fair || (kick && kick <= now)) continue; // bara fore avspark
    const snap = {
      at: now,
      odds: p.odds,
      books: p.oddsBooks,
      fair: p.market.fair,
      fairSource: p.market.fairSource,
      fairSourceOu: p.market.fairSourceOu,
    };
    const e = (doc.matches[key] ??= { league: p.league, date: p.date, match: p.match, kickoffUtc: kick ?? null, first: snap, last: snap, snapshots: 0 });
    e.kickoffUtc = kick ?? e.kickoffUtc;
    e.last = snap;
    e.snapshots++;
    added++;
  }
  // Matcher aldre an 400 dagar behovs inte for utvardering
  const cutoff = new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10);
  for (const [k, e] of Object.entries(doc.matches)) if (e.date < cutoff) delete doc.matches[k];
  // Samma match med olika versaler (OddsPortal "ARARAT-ARMENIA" mot "Ararat-Armenia") -> en post
  // och samma match under olika lagnamn ("Inter" mot "Internazionale")
  // Tva namn som bada ar egna lag i ligans historik (Wisla / Wisla Plock) slas aldrig ihop
  const histTeams = new Map();
  for (const m of store.matches) (histTeams.get(m.league) ?? histTeams.set(m.league, new Set()).get(m.league)).add(m.home).add(m.away);
  const distinct = (lg, a, b) => !!histTeams.get(lg)?.has(a) && !!histTeams.get(lg)?.has(b);
  const merged = mergeCaseDuplicates(doc.matches) + mergeNameVariants(doc.matches, sameTeamName, distinct);
  if (merged) console.log(`Oddshistorik: ${merged} dubbletter (versaler eller namnvarianter) sammanslagna`);
  doc.updatedAt = now;
  doc.note = 'first = forsta sedda odds, last = senaste fore avspark (proxy for stangning dar closing saknas). Nyckel: datum|liga|hemma|borta.';
  writeJson(P.oddsHistory, doc);
  console.log(`Oddshistorik: ${added} matcher uppdaterade (${Object.keys(doc.matches).length} totalt)`);
}

/**
 * Slar modellen marknaden? Per liga: Dixon-Coles mot oppningsodds (tidig marknad) och skarp stangning,
 * samt blandning marknad + modell (vikt vald pa forsta halvan, provad pa andra). w > 0 som slar
 * marknaden ensam pa andra halvan = modellen har egen information. Ligor utan historiska odds far
 * rader fran oddshistoriken (egna snapshots) nar deras matcher har spelats.
 */
function marketTest(rowsByLeague) {
  const hist = fs.existsSync(P.oddsHistory) ? readJson(P.oddsHistory).matches ?? {} : {};
  const idx = { H: 0, D: 1, A: 2 };
  const ll = (p, r) => -Math.log(Math.max(1e-6, p[idx[r]]));
  const dv = (o) => devigMultiplicative(o);
  const W = [0, 0.1, 0.2, 0.3, 0.5];
  const out = {};
  for (const [league, rows] of Object.entries(rowsByLeague)) {
    const list = [];
    for (const { m, dc, sharpClose } of rows) {
      if (!idx.hasOwnProperty(m.result)) continue;
      const h = hist[`${m.date}|${m.league}|${m.home}|${m.away}`];
      const hf = (s) => (s?.fair?.home != null ? [s.fair.home, s.fair.draw, s.fair.away] : null);
      const open = dv([m.odds?.pinnacle_home, m.odds?.pinnacle_draw, m.odds?.pinnacle_away])
        ?? dv([m.odds?.home, m.odds?.draw, m.odds?.away]) ?? hf(h?.first);
      const close = sharpClose ?? dv([m.closing?.avg_home, m.closing?.avg_draw, m.closing?.avg_away]) ?? hf(h?.last);
      list.push({ date: m.date, res: m.result, dc: [dc.home, dc.draw, dc.away], open, close, fromHistory: !!h && !sharpClose });
    }
    list.sort((a, b) => a.date.localeCompare(b.date));
    const test = (key) => {
      const L = list.filter((x) => x[key]);
      if (L.length < 60) return { n: L.length };
      const half = Math.floor(L.length / 2);
      const tr = L.slice(0, half), te = L.slice(half);
      const mix = (x, w) => x[key].map((v, i) => (1 - w) * v + w * x.dc[i]);
      const loss = (set, w) => set.reduce((s, x) => s + ll(mix(x, w), x.res), 0) / set.length;
      let bestW = 0, best = Infinity;
      for (const w of W) { const l = loss(tr, w); if (l < best) { best = l; bestW = w; } }
      const mk = loss(te, 0), bl = loss(te, bestW);
      return {
        n: L.length,
        logLossDc: round(L.reduce((s, x) => s + ll(x.dc, x.res), 0) / L.length, 4),
        logLossMarket: round(L.reduce((s, x) => s + ll(x[key], x.res), 0) / L.length, 4),
        bestW,
        testMarket: round(mk, 4),
        testBlend: round(bl, 4),
        modelAddsInfo: bestW > 0 && bl < mk - 0.0005,
      };
    };
    out[league] = { vsOpening: test('open'), vsClosing: test('close'), fromOddsHistory: list.filter((x) => x.fromHistory).length };
  }
  const beats = Object.entries(out).filter(([, v]) => v.vsOpening.modelAddsInfo || v.vsClosing.modelAddsInfo).map(([k]) => k);
  console.log(`Marknadstest: modellen tillfor information i ${beats.length ? beats.join(', ') : 'ingen liga'} (${Object.keys(out).length} testade)`);
  return out;
}

/**
 * Kryss-kalibreringen i grundmodellen (Update-BettingStore.ps1) provad i den blandning som faktiskt anvands:
 * dcWeight x Dixon-Coles + resten grundmodell, okalibrerad mot kalibrerad. Log-loss for 1X2, lagre = battre.
 */
function drawCalibrationBlend(rowsByLeague) {
  const file = path.join(root, 'data', 'reports', 'base-backtest.json');
  if (!fs.existsSync(file)) return null;
  const base = readJson(file);
  const byKey = new Map((base.rows ?? []).map((r) => [`${r.league}|${r.date}|${r.home}|${r.away}`, r]));
  const idx = { H: 0, D: 1, A: 2 };
  const ll = (p, res) => -Math.log(Math.max(1e-6, p[idx[res]]));
  const mix = (dc, b) => {
    const w = CONFIG.dcWeight;
    const p = [w * dc.home + (1 - w) * b[0], w * dc.draw + (1 - w) * b[1], w * dc.away + (1 - w) * b[2]];
    const s = p[0] + p[1] + p[2];
    return p.map((x) => x / s);
  };
  let n = 0, dcL = 0, rawL = 0, calL = 0;
  for (const rows of Object.values(rowsByLeague)) {
    for (const { m, dc } of rows) {
      const b = byKey.get(`${m.league}|${m.date}|${m.home}|${m.away}`);
      if (!b || !idx.hasOwnProperty(m.result)) continue;
      n++;
      dcL += ll([dc.home, dc.draw, dc.away], m.result);
      rawL += ll(mix(dc, b.raw), m.result);
      calL += ll(mix(dc, b.cal), m.result);
    }
  }
  if (!n) return null;
  const out = { matches: n, w: base.w, logLossDc: round(dcL / n, 4), logLossBlendRaw: round(rawL / n, 4), logLossBlendCal: round(calL / n, 4) };
  console.log(`Kryss-kalibrering i blandningen: n=${n} DC ${out.logLossDc} | blandning okalibrerad ${out.logLossBlendRaw} -> kalibrerad ${out.logLossBlendCal}`);
  return out;
}

function summarise(rows) {
  let rpsDc = 0, rpsPin = 0, nPin = 0, brierDc = 0, brierPin = 0, nOu = 0, brierBttsDc = 0;
  let rpsSharp = 0, rpsDcSharp = 0;
  const sharpSources = { pinnacle: 0, betfair: 0 };
  for (const { m, dc, pinClose, pinCloseOu, sharpClose, sharpSource } of rows) {
    if (sharpClose) {
      rpsSharp += rps1x2(sharpClose, m.result);
      rpsDcSharp += rps1x2([dc.home, dc.draw, dc.away], m.result);
      sharpSources[sharpSource]++;
    }
    rpsDc += rps1x2([dc.home, dc.draw, dc.away], m.result);
    brierBttsDc += brier(dc.btts, m.btts);
    if (pinClose) {
      rpsPin += rps1x2(pinClose, m.result);
      nPin++;
    }
    if (pinCloseOu) {
      brierDc += brier(dc.over25, m.over25);
      brierPin += brier(pinCloseOu[0], m.over25);
      nOu++;
    }
  }
  const betsByThreshold = {};
  for (const th of CONFIG.evalThresholds) {
    betsByThreshold[`ev${th}`] = Object.fromEntries(
      Object.entries(STRATEGIES).map(([name, s]) => [name, simulateBets(rows, th, s)]),
    );
  }
  const n = rows.length;
  const nSharp = sharpSources.pinnacle + sharpSources.betfair;
  const headline = {
    n,
    rpsDc: n ? round(rpsDc / n) : null,
    rpsPinnacleClose: nPin ? round(rpsPin / nPin) : null,
    // Samma matcher for modell och facit (Pinnacle, annars Betfair Exchange) -> rattvis jamforelse
    rpsSharpClose: nSharp ? round(rpsSharp / nSharp) : null,
    rpsDcOnSharp: nSharp ? round(rpsDcSharp / nSharp) : null,
    sharpCloseSources: sharpSources,
    brierOuDc: nOu ? round(brierDc / nOu) : null,
    brierOuPinnacleClose: nOu ? round(brierPin / nOu) : null,
    brierBttsDc: n ? round(brierBttsDc / n) : null,
    bets: betsByThreshold[`ev${CONFIG.minEv}`]?.[CONFIG.liveStrategy]
      ?? simulateBets(rows, CONFIG.minEv, STRATEGIES[CONFIG.liveStrategy]),
    strategies: Object.fromEntries(
      Object.keys(STRATEGIES).map((k) => [k, betsByThreshold[`ev${CONFIG.minEv}`]?.[k]]),
    ),
  };
  return { headline, betsByThreshold };
}

function dcProbs(dc) {
  return [dc.home, dc.draw, dc.away, dc.over25];
}

function avgOpen(m) {
  const o = m.odds ?? {};
  const f1 = devigMultiplicative([o.home, o.draw, o.away]);
  const fOu = devigMultiplicative([o.over25, o.under25]);
  if (!f1 || !fOu) return null;
  return [...f1, fOu[0]];
}

function pinOpen(m) {
  const o = m.odds ?? {};
  const f1 = devigMultiplicative([o.pinnacle_home, o.pinnacle_draw, o.pinnacle_away]);
  const fOu = devigMultiplicative([o.pinnacle_over25, o.pinnacle_under25]);
  if (!f1 || !fOu) return null;
  return [...f1, fOu[0]];
}

function simulateBets(rows, threshold, strategy) {
  let n = 0, profit = 0, clvSum = 0, clvN = 0, clvPos = 0;
  for (const r of rows) {
    const { m, sharpClose, pinCloseOu } = r;
    const p = strategy.probs(r);
    if (!p) continue;
    const o = m.odds ?? {};
    const px = strategy.book;
    const cands = [
      [p[0], o[`${px}home`], m.result === 'H', sharpClose?.[0]],
      [p[1], o[`${px}draw`], m.result === 'D', sharpClose?.[1]],
      [p[2], o[`${px}away`], m.result === 'A', sharpClose?.[2]],
      [p[3], o[`${px}over25`], m.over25, pinCloseOu?.[0]],
      [1 - p[3], o[`${px}under25`], !m.over25, pinCloseOu?.[1]],
    ];
    for (const [p, odds, won, closeP] of cands) {
      if (!(odds > 1) || p * odds - 1 < threshold) continue;
      n++;
      profit += won ? odds - 1 : -1;
      const c = clv(odds, closeP);
      if (c != null) {
        clvSum += c;
        clvN++;
        if (c > 0) clvPos++;
      }
    }
  }
  return {
    n,
    profit: round(profit, 2),
    roi: n ? round(profit / n) : null,
    meanClv: clvN ? round(clvSum / clvN) : null,
    clvPositiveRate: clvN ? round(clvPos / clvN, 3) : null,
  };
}

function appendMarkdown(tips, evaluation) {
  let md = fs.readFileSync(P.tipsMd, 'utf8');
  md = md.split('\n## Pro-lager')[0].trimEnd();
  const lines = ['', '', '## Pro-lager (Dixon-Coles + devig + spelarviktad franvaro)', ''];
  lines.push('### Varde vid dagens odds', '');
  lines.push('| Match | Marknad | Tips | Odds | Varde? | Vart fran odds | Risk / vinst (EV) | Chans / kravs | Annat utfall med varde |', '|---|---|---|---|---|---|---|---|---|');
  const seen = new Set();
  for (const t of tips.allCandidates ?? []) {
    if (seen.has(t.match) || !t.pro) continue;
    seen.add(t.match);
    const v = t.pro.verdicts ?? {};
    const rows = [
      ['1X2', t.tips?.['1X2']?.pick, { 1: 'home', X: 'draw', 2: 'away' }[t.tips?.['1X2']?.pick], ['home', 'draw', 'away']],
      ['O/U 2.5', t.tips?.OU25?.pick, /OVER/i.test(t.tips?.OU25?.pick ?? '') ? 'over25' : 'under25', ['over25', 'under25']],
    ];
    for (const [label, pick, key, keys] of rows) {
      const x = v[key];
      const other = keys.filter((k) => k !== key && v[k]?.value).map((k) => `${v[k].pick} @ ${v[k].odds}`).join(', ');
      const rr = x?.riskReward;
      const rrTxt = rr ? `${rr.stake} kr -> +${rr.win} kr (1:${rr.ratio}, EV ${rr.evSek >= 0 ? '+' : ''}${rr.evSek} kr)` : '-';
      const probTxt = rr ? `${pct(x.p)} / ${pct(rr.breakEven)}` : '-';
      lines.push(`| ${t.date} ${t.match} (${t.league}) | ${label} | ${pick ?? '-'} | ${x?.odds ?? '-'} | ${!x ? 'Inga odds' : x.value == null ? 'Kraver skarpa odds' : x.value ? '**VARDE**' : 'Ej varde'} | ${x?.minOdds ?? '-'} | ${rrTxt} | ${probTxt} | ${other || '-'} |`);
    }
  }
  lines.push('', `Varde = forvantad avkastning >= ${100 * CONFIG.minEv} % till dagens odds. BTTS saknar odds.`);
  lines.push('', `Risk / vinst: insats ${CONFIG.stakeSek} kr mot vinst = insats x (odds - 1). Kravs = 1/odds (break-even-chans). EV = insats x (chans x odds - 1).`);
  lines.push('', `Facit = Pinnacles odds utan marginal. Pris = basta odds hos ${CONFIG.userBooks.join(', ')}. Utan Pinnacle: "Kraver skarpa odds" (inget omdome).`);
  lines.push('', '### Modell vs skarp closing (Pinnacle, annars Betfair Exchange; 2025/26 + 2026/27, point-in-time)', '');
  lines.push(`| Liga | Matcher | RPS DC | RPS skarp close | Brier O/U DC | Brier O/U Pinnacle | CLV DC-spel | CLV konsensus-spel (n) |`, '|---|---|---|---|---|---|---|---|');
  for (const [lg, s] of Object.entries(evaluation.summary)) {
    const dc = s.strategies.dcAtPinnacle;
    const cons = s.strategies.consensusAtBestPrice;
    lines.push(`| ${lg} | ${s.n} | ${s.rpsDcOnSharp ?? s.rpsDc} | ${s.rpsSharpClose ?? '-'} | ${s.brierOuDc ?? '-'} | ${s.brierOuPinnacleClose ?? '-'} | ${pct(dc.meanClv)} | ${pct(cons.meanClv)} (${cons.n}) |`);
  }
  lines.push('', `Spel = EV >= ${CONFIG.minEv}. Lagre RPS/Brier = battre. Positiv CLV = slog stangningsoddset. Detaljer: data/reports/pro-evaluation.json`);

  // Vader anvands inte i tipsen (paverkar inte utfallet), bara den historiska analysen visas
  const we = evaluation.weatherEffect;
  if (we?.n) {
    lines.push('', '### Vader (anvands inte i tipsen)', '', `Vadereffekt pa O/U 2.5 utover Pinnacle closing (${we.n} matcher):`, '');
    lines.push('| Variabel | Intervall | Matcher | Mal/match | Over-andel | Marknadens over-p | Residual | z |', '|---|---|---|---|---|---|---|---|');
    for (const v of [we.wind, we.gust, we.precip, we.temp]) {
      for (const b of v.buckets) lines.push(`| ${v.variable} | ${b.bucket} | ${b.n} | ${b.goalsPg} | ${b.overRate} | ${b.marketFairOver} | ${b.residual} | ${b.z} |`);
    }
    lines.push('', '|z| > 2 = vadret sager nagot som marknaden inte prisat in.');
  }

  const pe = evaluation.playerEffect;
  lines.push('', '### Franvaro viktad per spelare (xG+xA-andel)', '');
  const withAbs = [...new Map((tips.allCandidates ?? [])
    .filter((t) => t.pro?.availability && (t.pro.availability.home.players.length || t.pro.availability.away.players.length))
    .map((t) => [t.match, t])).values()];
  for (const t of withAbs) {
    const a = t.pro.availability;
    const fmt = (s) => s.players.map((p) => `${p.name} ${(100 * p.share).toFixed(0)}%${p.weight < 1 ? ` (x${p.weight})` : ''}`).join(', ') || '-';
    lines.push(`- ${t.date} ${t.match}: HEMMA ${fmt(a.home)} -> attack x${a.home.attackFactor} | BORTA ${fmt(a.away)} -> attack x${a.away.attackFactor}`);
  }
  if (!withAbs.length) lines.push('Inga viktiga spelare saknas enligt FPL/elvor.');
  if (pe) {
    lines.push('', `Backtest (${pe.n} matcher med spelardata): RPS per alpha ${CONFIG.playerAlphaGrid.map((a) => `${a}: ${pe.byAlpha[a].rps}`).join(' | ')}. `
      + `Vald alpha = ${pe.chosenAlpha} (RPS-forbattring ${pe.improvementRps}).`);
  }
  fs.writeFileSync(P.tipsMd, md + lines.join('\n') + '\n', 'utf8');
}

function pct(x) {
  return x == null ? '-' : `${(100 * x).toFixed(1)}%`;
}

/**
 * Tipsens verkliga 1X2-traff per liga och sasong: samma motor som live, point-in-time.
 * Oddsstyrda ligor (marknadstest): senaste oddsen fore matchen (egen snapshot, annars stangning, annars oppning)
 * med testad DC-vikt. Ovriga: DC 50 % + grundmodellen (base-backtest.json, bara 2026/27), annars DC ensam.
 * Webben visade tidigare bara grundmodellens traff, som inte ar det som tippas. Per match: data/reports/tips-backtest.json.
 */
function tipAccuracy(rowsByLeague, mTest) {
  const hist = fs.existsSync(P.oddsHistory) ? readJson(P.oddsHistory).matches ?? {} : {};
  const baseFile = path.join(root, 'data', 'reports', 'base-backtest.json');
  const base = new Map((fs.existsSync(baseFile) ? readJson(baseFile).rows ?? [] : [])
    .map((r) => [`${r.date}|${r.league}|${r.home}|${r.away}`, r.cal]));
  const idx = { H: 0, D: 1, A: 2 };
  const picks = ['1', 'X', '2'];
  const hf = (s) => (s?.fair?.home != null ? [s.fair.home, s.fair.draw, s.fair.away] : null);
  const newAgg = () => ({
    n: 0, correct: 0, expected: 0, variance: 0, homeWins: 0, draws: 0, missDraw: 0, missUpset: 0,
    byPick: { 1: [0, 0], X: [0, 0], 2: [0, 0] }, bySource: { odds: [0, 0], modell: [0, 0] },
    bands: { ge70: [0, 0], b60_69: [0, 0], b50_59: [0, 0], under50: [0, 0] },
  });
  const perMatch = [];
  const out = {};
  for (const [league, rows] of Object.entries(rowsByLeague)) {
    const mt = mTest[league];
    const test = mt?.vsOpening?.n >= 60 ? mt.vsOpening : mt?.vsClosing?.n >= 60 ? mt.vsClosing : null;
    const modelW = test?.modelAddsInfo ? test.bestW : 0;
    const bySeason = {};
    for (const { m, dc, sharpClose } of rows) {
      if (!idx.hasOwnProperty(m.result)) continue;
      const key = `${m.date}|${m.league}|${m.home}|${m.away}`;
      const d = [dc.home, dc.draw, dc.away];
      const market = hf(hist[key]?.last) ?? sharpClose
        ?? devigMultiplicative([m.closing?.avg_home, m.closing?.avg_draw, m.closing?.avg_away])
        ?? devigMultiplicative([m.odds?.pinnacle_home, m.odds?.pinnacle_draw, m.odds?.pinnacle_away])
        ?? devigMultiplicative([m.odds?.home, m.odds?.draw, m.odds?.away]) ?? hf(hist[key]?.first);
      const st = base.get(key) ?? null;
      const src = test && market ? 'odds' : 'modell';
      const p = src === 'odds' ? market.map((x, i) => (1 - modelW) * x + modelW * d[i])
        : st ? d.map((x, i) => CONFIG.dcWeight * x + (1 - CONFIG.dcWeight) * st[i]) : d;
      const pick = p.indexOf(Math.max(...p));
      const act = idx[m.result];
      const hit = pick === act;
      const a = (bySeason[m.season] ??= newAgg());
      a.n++; a.expected += p[pick]; a.variance += p[pick] * (1 - p[pick]);
      if (hit) a.correct++; else if (act === 1) a.missDraw++; else a.missUpset++;
      if (act === 0) a.homeWins++;
      if (act === 1) a.draws++;
      a.byPick[picks[pick]][0]++; if (hit) a.byPick[picks[pick]][1]++;
      a.bySource[src][0]++; if (hit) a.bySource[src][1]++;
      const band = p[pick] >= 0.7 ? 'ge70' : p[pick] >= 0.6 ? 'b60_69' : p[pick] >= 0.5 ? 'b50_59' : 'under50';
      a.bands[band][0]++; if (hit) a.bands[band][1]++;
      perMatch.push({
        league, season: m.season, date: m.date, home: m.home, away: m.away, result: m.result, source: src,
        pick: picks[pick], hit, p: p.map((x) => round(x, 4)), dc: d.map((x) => round(x, 4)),
        base: st, market: market ? market.map((x) => round(x, 4)) : null,
      });
    }
    out[league] = Object.fromEntries(Object.entries(bySeason).sort().map(([s, a]) => [s, {
      n: a.n, correct: a.correct, rate: round(a.correct / a.n, 4), expectedRate: round(a.expected / a.n, 4),
      // z < -2: samre an tipsens egna procent lovade (systematiskt), annars inom slumpen
      zVsExpected: round((a.correct - a.expected) / Math.sqrt(Math.max(1e-9, a.variance)), 2),
      homeRate: round(a.homeWins / a.n, 4), drawRate: round(a.draws / a.n, 4),
      missDraw: a.missDraw, missUpset: a.missUpset, modelW,
      byPick: Object.fromEntries(Object.entries(a.byPick).map(([k, [n, c]]) => [k, { tested: n, correct: c, rate: n ? round(c / n, 4) : 0 }])),
      bySource: Object.fromEntries(Object.entries(a.bySource).map(([k, [n, c]]) => [k, { tested: n, correct: c, rate: n ? round(c / n, 4) : null }])),
      bands: Object.fromEntries(Object.entries(a.bands).map(([k, [n, c]]) => [k, { tested: n, correct: c, rate: n ? round(c / n, 4) : 0 }])),
    }]));
  }
  writeJson(path.join(root, 'data', 'reports', 'tips-backtest.json'), {
    updatedAt: new Date().toISOString(),
    note: 'Tipsmotorns 1X2 per spelad match (point-in-time). source = odds (oddsstyrd liga) eller modell. p = motorns chans, dc = Dixon-Coles, base = grundmodellen, market = oddsen utan marginal.',
    matches: perMatch,
  });
  return out;
}

// Webbens traffruta (1X2) = tipsmotorns traff i aktuell sasong, grundmodellens siffror sparas i modelOnly
function applyTipAccuracy(tips, acc) {
  const season = Object.values(acc).flatMap((s) => Object.keys(s)).sort().at(-1);
  if (!season) return;
  const labels = { ge70: '70%+', b60_69: '60-69.9%', b50_59: '50-59.9%', under50: 'Under 50%' };
  const total = { tested: 0, correct: 0, expected: 0, byPick: { 1: [0, 0], X: [0, 0], 2: [0, 0] }, bands: {} };
  const toOut = (a) => ({
    tested: a.n, correct: a.correct, rate: a.rate, expectedRate: a.expectedRate, zVsExpected: a.zVsExpected,
    byPick: a.byPick, source: 'tipsmotor', season,
  });
  const bandsOut = (b) => {
    const o = Object.fromEntries(Object.entries(b).map(([k, v]) => [k, { label: labels[k], ...v }]));
    const u = ['b60_69', 'b50_59', 'under50'].reduce((s, k) => [s[0] + b[k].tested, s[1] + b[k].correct], [0, 0]);
    o.under70 = { label: 'Under 70%', tested: u[0], correct: u[1], rate: u[0] ? round(u[1] / u[0], 4) : 0 };
    return o;
  };
  tips.accuracyByLeague ??= {};
  tips.accuracyByConfidenceByLeague ??= {};
  for (const [lg, bySeason] of Object.entries(acc)) {
    const a = bySeason[season];
    if (!a) continue;
    const prev = tips.accuracyByLeague[lg]?.['1X2'];
    tips.accuracyByLeague[lg] ??= {};
    tips.accuracyByLeague[lg]['1X2'] = { ...toOut(a), modelOnly: prev?.source === 'tipsmotor' ? prev.modelOnly : prev ?? null };
    (tips.accuracyByConfidenceByLeague[lg] ??= {})['1X2'] = bandsOut(a.bands);
    total.tested += a.n; total.correct += a.correct; total.expected += a.expectedRate * a.n;
    for (const k of ['1', 'X', '2']) { total.byPick[k][0] += a.byPick[k].tested; total.byPick[k][1] += a.byPick[k].correct; }
    for (const [k, v] of Object.entries(a.bands)) {
      const t = (total.bands[k] ??= { tested: 0, correct: 0 });
      t.tested += v.tested; t.correct += v.correct;
    }
  }
  if (!total.tested) return;
  const prev = tips.accuracy?.['1X2'];
  tips.accuracy ??= {};
  tips.accuracy['1X2'] = {
    tested: total.tested, correct: total.correct, rate: round(total.correct / total.tested, 4),
    expectedRate: round(total.expected / total.tested, 4),
    byPick: Object.fromEntries(Object.entries(total.byPick).map(([k, [n, c]]) => [k, { tested: n, correct: c, rate: n ? round(c / n, 4) : 0 }])),
    source: 'tipsmotor', season, modelOnly: prev?.source === 'tipsmotor' ? prev.modelOnly : prev ?? null,
  };
  tips.accuracyByConfidence ??= {};
  tips.accuracyByConfidence['1X2'] = bandsOut(Object.fromEntries(Object.entries(total.bands)
    .map(([k, v]) => [k, { ...v, rate: v.tested ? round(v.correct / v.tested, 4) : 0 }])));
}

function weekStart(date) {
  const d = toDate(date);
  const dow = (d.getUTCDay() + 6) % 7; // mandag = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

function groupBy(list, fn) {
  const out = {};
  for (const x of list) (out[fn(x)] ??= []).push(x);
  return out;
}
