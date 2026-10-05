// Historik fran Svenska Spels resultatsidor (spela.svenskaspel.se/stryktipset/resultat/<datum>/statistik) till EN fil
// for traning. Sidan bygger pa samma oppna API: datepicker (omgangar per manad), draws/<nr> (kupong, startodds,
// Svenska folket, halvtid), draws/<nr>/result (ratt rad, utdelning, vinnare) och jackpot.
// Inkrementell: avgjorda omgangar som redan finns i filen hamtas inte igen.
//   node scripts/fetch-stryktips-statistik.mjs                 (stryktipset fran 2025-01)
//   node scripts/fetch-stryktips-statistik.mjs europatipset 2025-01
// Utdata: data/<produkt>-statistik.json  { draws: [...en rad per omgang], matches: [...en platt rad per match] }
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getJson } from './lib/http.mjs';
import { svsSchemas } from './lib/api-schemas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCT = process.argv[2] || 'stryktipset';
const FROM = process.argv[3] || '2025-01';
const OUT = path.join(root, 'data', `${PRODUCT}-statistik.json`);
const API = 'https://api.spela.svenskaspel.se';

const log = (s) => process.stdout.write(`${s}\n`);
const num = (s) => {
  if (s == null || s === '') return null;
  const n = Number(String(s).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const r4 = (x) => (x == null ? null : Math.round(x * 1e4) / 1e4);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const get = (url) => getJson(url, { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny lokal analys)' }, retries: 2, schema: /\/draws\/\d+$/.test(url) ? svsSchemas.draw : undefined, label: 'Svenska Spel' });

// ---------- Vilka omgangar finns (samma datumvaljare som sidan) ----------
async function listDraws() {
  const [fy, fm] = FROM.split('-').map(Number);
  const now = new Date();
  const out = [];
  for (let y = fy, m = fm; y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1); m === 12 ? (y++, m = 1) : m++) {
    const d = await get(`${API}/draw/1/results/datepicker/?product=${PRODUCT}&year=${y}&month=${m}`);
    for (const r of d.resultDates || []) out.push({ drawNumber: r.drawNumber, date: r.date.slice(0, 10), state: r.drawState });
  }
  return [...new Map(out.map((d) => [d.drawNumber, d])).values()].sort((a, b) => a.drawNumber - b.drawNumber);
}

// ---------- En omgang ----------
const SIGN = { one: '1', x: 'X', two: '2' };
const score = (res, type) => {
  const r = (res || []).find((x) => x.sportEventResultType === type);
  return r ? [num(r.home), num(r.away)] : [null, null];
};
const outcomeOf = (h, a) => (h == null || a == null ? null : h > a ? '1' : h === a ? 'X' : '2');

async function fetchDraw(n) {
  const [{ draw }, resultRes, jp] = await Promise.all([
    get(`${API}/draw/1/${PRODUCT}/draws/${n}`),
    get(`${API}/draw/1/${PRODUCT}/draws/${n}/result`).catch(() => null),
    get(`${API}/multifetch?urls=${encodeURIComponent(`/draw/1/jackpot/draws?product=${PRODUCT}&drawNumber=${n}`)}`).catch(() => null),
  ]);
  const result = resultRes?.result;
  const resEv = new Map((result?.events || []).map((e) => [e.eventNumber, e]));
  const jack = jp?.responses?.[0]?.jackpot;

  const matches = draw.drawEvents.map((e) => {
    const m = e.match || {};
    const home = m.participants?.find((p) => p.type === 'home');
    const away = m.participants?.find((p) => p.type === 'away');
    const re = resEv.get(e.eventNumber);
    const cancelled = !!(e.cancelled || re?.cancelled);
    const [ftH, ftA] = cancelled ? [null, null] : re?.outcomeScore ? [num(re.outcomeScore.home), num(re.outcomeScore.away)] : score(m.result, 'Fulltime');
    const [htH, htA] = score(m.result, 'Halftime');
    const odds = [e.startOdds?.one, e.startOdds?.x, e.startOdds?.two].map(num);
    const inv = odds.every((o) => o > 1) ? odds.map((o) => 1 / o) : null;
    const overround = inv ? inv.reduce((a, b) => a + b, 0) : null;
    const folk = [e.svenskaFolket?.one, e.svenskaFolket?.x, e.svenskaFolket?.two].map(num);
    const tio = e.tioTidningarsTips ? [e.tioTidningarsTips.one, e.tioTidningarsTips.x, e.tioTidningarsTips.two].map(num) : [null, null, null];
    const outcome = cancelled ? null : (re?.outcome ?? outcomeOf(ftH, ftA));
    const oi = ['1', 'X', '2'].indexOf(outcome);
    const prob = inv ? inv.map((p) => r4(p / overround)) : [null, null, null];
    const argmax = (a) => (a.some((x) => x == null) ? null : ['1', 'X', '2'][a.indexOf(Math.max(...a))]);
    return {
      drawNumber: n,
      date: draw.regCloseTime?.slice(0, 10),
      eventNumber: e.eventNumber,
      matchId: m.matchId ?? re?.matchId ?? null,
      betradarId: e.providerIds?.find((p) => p.provider === 'BetRadar')?.id ?? null,
      kickoff: m.matchStart ?? null,
      country: m.league?.country?.name ?? home?.countryName ?? null,
      league: m.league?.name ?? null,
      home: home?.name ?? e.eventDescription?.split(' - ')[0],
      away: away?.name ?? e.eventDescription?.split(' - ')[1],
      cancelled,
      // Tecknet som galler pa kupongen (lottat tecken om matchen struks)
      couponSign: re?.outcome ?? outcome,
      comment: re?.eventComment || e.eventComment || null,
      ftHome: ftH, ftAway: ftA, htHome: htH, htAway: htA,
      outcome,
      odds1: odds[0], oddsX: odds[1], odds2: odds[2],
      overround: r4(overround),
      prob1: prob[0], probX: prob[1], prob2: prob[2],
      folk1: folk[0], folkX: folk[1], folk2: folk[2],
      tio1: tio[0], tioX: tio[1], tio2: tio[2],
      oddsFavourite: argmax(odds.map((o) => (o ? -o : null))),
      folkFavourite: argmax(folk),
      oddsOfOutcome: oi >= 0 ? odds[oi] : null,
      probOfOutcome: oi >= 0 ? prob[oi] : null,
      folkOfOutcome: oi >= 0 ? folk[oi] : null,
      // Streckvarde: odds-sannolikhet / folkets andel (>1 = understreckat)
      value1: prob[0] && folk[0] ? r4(prob[0] / (folk[0] / 100)) : null,
      valueX: prob[1] && folk[1] ? r4(prob[1] / (folk[1] / 100)) : null,
      value2: prob[2] && folk[2] ? r4(prob[2] / (folk[2] / 100)) : null,
    };
  });

  const payouts = Object.fromEntries((result?.distribution || []).map((d) => [
    d.name.replace(/\s*rätt/, ''), { amount: num(d.amount), winners: d.winners },
  ]));
  const played = matches.filter((m) => m.outcome);
  return {
    draw: {
      drawNumber: n,
      date: draw.regCloseTime?.slice(0, 10),
      regCloseTime: draw.regCloseTime,
      comment: draw.drawComment || null,
      state: draw.drawState,
      turnover: num(result?.currentNetSale ?? draw.currentNetSale),
      rowPrice: num(draw.rowPrice),
      fund: draw.fund ?? null,
      correctRow: matches.map((m) => m.couponSign ?? '-').join(''),
      cancelledMatches: matches.filter((m) => m.cancelled).length,
      n1: played.filter((m) => m.outcome === '1').length,
      nX: played.filter((m) => m.outcome === 'X').length,
      n2: played.filter((m) => m.outcome === '2').length,
      oddsFavouritesWon: played.filter((m) => m.oddsFavourite === m.outcome).length,
      folkFavouritesWon: played.filter((m) => m.folkFavourite === m.outcome).length,
      // Sannolikhet for ratt rad enligt folket resp. oddsen (lagt = skrallomgang)
      folkRowProb: played.length ? played.reduce((p, m) => p * (m.folkOfOutcome / 100), 1) : null,
      oddsRowProb: played.length ? played.reduce((p, m) => p * m.probOfOutcome, 1) : null,
      payouts,
      jackpots: jack?.jackpots?.map((j) => ({ type: j.jackpotType ?? j.description, amount: num(j.jackpotAmountSek ?? j.jackpotAmount) })) ?? [],
      guaranteedJackpots: jack?.guaranteedJackpots?.map((j) => ({ type: j.guaranteedJackpotType, amount: num(j.jackpotAmountSek) })) ?? [],
      leagues: [...new Set(matches.map((m) => m.league))],
    },
    matches,
  };
}

// ---------- Main ----------
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { draws: [], matches: [] };
const done = new Set(prev.draws.filter((d) => d.state === 'Finalized' && d.payouts?.['13']).map((d) => d.drawNumber));
const list = await listDraws();
const todo = list.filter((d) => !done.has(d.drawNumber));
log(`${PRODUCT}: ${list.length} omgangar fran ${FROM}, ${done.size} redan sparade, hamtar ${todo.length}`);

const draws = new Map(prev.draws.map((d) => [d.drawNumber, d]));
const matches = new Map(prev.matches.map((m) => [`${m.drawNumber}:${m.eventNumber}`, m]));
for (const d of todo) {
  try {
    const r = await fetchDraw(d.drawNumber);
    draws.set(d.drawNumber, r.draw);
    for (const m of r.matches) matches.set(`${m.drawNumber}:${m.eventNumber}`, m);
    log(`  ${d.drawNumber} ${r.draw.date} ${r.draw.correctRow} oms ${r.draw.turnover} 13r ${r.draw.payouts['13']?.amount ?? '-'}`);
  } catch (e) {
    log(`  ${d.drawNumber} misslyckades: ${e.message}`);
  }
  await sleep(250);
}

const allDraws = [...draws.values()].sort((a, b) => a.drawNumber - b.drawNumber);
const allMatches = [...matches.values()].sort((a, b) => a.drawNumber - b.drawNumber || a.eventNumber - b.eventNumber);
fs.writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: `api.spela.svenskaspel.se (${PRODUCT}, resultat/statistik)`,
  product: PRODUCT,
  from: allDraws[0]?.date, to: allDraws.at(-1)?.date,
  counts: { draws: allDraws.length, matches: allMatches.length },
  fields: {
    outcome: '1/X/2 fulltid (null = struken, anvand inte for traning)',
    couponSign: 'tecken som gallde pa kupongen (lottat om struken)',
    'odds1/X/2': 'Svenska Spels startodds', 'prob1/X/2': 'startodds utan marginal',
    'folk1/X/2': 'Svenska folkets streck (%) vid spelstopp', 'tio1/X/2': 'Tio tidningars tips (antal), om det finns',
    'value1/X/2': 'prob / folkandel (>1 = understreckat)',
    payouts: 'utdelning per antal ratt: amount (kr per rad), winners (antal rader)',
  },
  draws: allDraws,
  matches: allMatches,
}), 'utf8');
log(`Klart: ${allDraws.length} omgangar, ${allMatches.length} matcher -> ${path.relative(root, OUT)}`);
