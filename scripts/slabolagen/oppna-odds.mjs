// Odds till hemmaregeln ur öppna källor, utan krediter: Pinnacles publika API och Kambi (Unibet, LeoVegas). Inga nycklar.
// Betsson, NordicBet och Coolbet nekar öppen åtkomst (403) och ingår inte.
//   node scripts/slabolagen/oppna-odds.mjs            alla nio ligorna
//   node scripts/slabolagen/oppna-odds.mjs AS MLS     bara dessa
// Utdata: data/hemmaregeln/odds.json (samma form som upcoming_odds).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getJson, sleep } from '../lib/http.mjs';
import { kambiSchemas, pinnacleSchemas } from '../lib/api-schemas.mjs';

export const KALLOR = {
  AS: { pin: 1728, kambi: 'sweden/allsvenskan' }, MLS: { pin: 2663, kambi: 'usa/mls' }, AR: { pin: 210697, kambi: 'argentina/liga_profesional_argentina' },
  BR: { pin: 1834, kambi: 'brazil/brasileirao_serie_a' }, DK: { pin: 1913, kambi: 'denmark/superligaen' }, EK: { pin: 2374, kambi: 'poland/ekstraklasa' },
  JP1: { pin: 2157, kambi: 'japan/j1-league' }, MX: { pin: 2242, kambi: 'mexico/liga_mx' }, NO: { pin: 2333, kambi: 'norway/eliteserien' },
};
export const OPERATORER = [['ubse', 'unibet_se', 'Unibet (SE)'], ['leose', 'leovegas_se', 'LeoVegas (SE)']];
const PIN = 'https://guest.api.arcadia.pinnacle.com/0.1';
const KAMBI = 'https://eu-offering-api.kambicdn.com/offering/v2018';
const SAMMA_AVSPARK_MS = 20 * 60e3;

/** Pinnacles amerikanska odds (+185, -128) till decimal. */
export function amerikanskt(p) {
  if (!Number.isFinite(p) || p === 0) return null;
  return Math.round((p > 0 ? 1 + p / 100 : 1 + 100 / -p) * 1000) / 1000;
}

/** Lagnamn till jämförbara ord: utan accenter, versaler och föreningsförkortningar. */
export function ord(namn) {
  return String(namn).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ł/g, 'l')
    .replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
    .filter((w) => w && !['fc', 'if', 'ik', 'aif', 'bk', 'ff', 'sk', 'fk', 'cf', 'sc', 'cd', 'ac', 'de', 'la', 'club', 'atletico', 'atl'].includes(w));
}
/** 0-1: hur väl två lagnamn stämmer. */
export function likhet(a, b) {
  const x = ord(a), y = ord(b);
  if (!x.length || !y.length) return 0;
  const t = x.filter((w) => y.some((v) => v === w || (Math.min(v.length, w.length) >= 4 && (v.startsWith(w) || w.startsWith(v)))));
  return t.length / Math.min(x.length, y.length);
}

/** Pinnacles svar -> matcher med 1X2 hela matchen. Hörn, livematcher och alternativa marknader tas bort. */
export function pinnacleMatcher(matchups, markets, league) {
  const pris = new Map();
  for (const k of markets) {
    if (k.type !== 'moneyline' || k.period !== 0 || k.isAlternate || k.status !== 'open') continue;
    const p = Object.fromEntries((k.prices ?? []).map((x) => [x.designation, amerikanskt(x.price)]));
    if (p.home && p.draw && p.away) pris.set(k.matchupId, p);
  }
  const ut = [];
  for (const m of matchups) {
    if (m.type !== 'matchup' || m.parentId != null || m.isLive || m.special) continue;
    const p = pris.get(m.id);
    const home = m.participants?.find((x) => x.alignment === 'home')?.name, away = m.participants?.find((x) => x.alignment === 'away')?.name;
    if (!p || !home || !away || /corners|bookings/i.test(`${home} ${away}`) || m.units === 'Corners') continue;
    ut.push({ league, commence: new Date(m.startTime).toISOString(), home, away, books: [{ key: 'pinnacle', bookmaker: 'Pinnacle', home: p.home, draw: p.draw, away: p.away }] });
  }
  return ut;
}

/** Kambis svar -> matcher med 1X2 (odds * 1000). */
export function kambiMatcher(json) {
  const ut = [];
  for (const e of json?.events ?? []) {
    const ev = e.event;
    if (!ev || ev.state !== 'NOT_STARTED') continue;
    const bo = (e.betOffers ?? []).find((b) => b.betOfferType?.id === 2 && (!b.criterion || /full ?time|^fulltid|^match/i.test(b.criterion.englishLabel ?? b.criterion.label ?? 'full time')));
    const o = bo?.outcomes ?? [];
    const pr = (typ) => { const x = o.find((y) => y.type === typ); return x?.status !== 'SUSPENDED' && x?.odds > 1000 ? x.odds / 1000 : null; };
    const h = pr('OT_ONE'), d = pr('OT_CROSS'), a = pr('OT_TWO');
    if (h && d && a) ut.push({ commence: ev.start, home: ev.homeName ?? ev.englishName?.split(' - ')[0], away: ev.awayName ?? ev.englishName?.split(' - ')[1], home_odds: h, draw_odds: d, away_odds: a });
  }
  return ut;
}

/** Lägger bolagens priser på Pinnacle-matcherna. Samma avspark krävs och båda lagen ska stämma. */
export function sammanfoga(pinMatcher, bolag) {
  const ut = pinMatcher.map((m) => ({ ...m, books: [...m.books] }));
  let okopplade = 0;
  for (const { key, namn, matcher } of bolag) {
    for (const k of matcher) {
      const t = Date.parse(k.commence);
      let best = null, bp = 0;
      for (const m of ut) {
        if (Math.abs(Date.parse(m.commence) - t) > SAMMA_AVSPARK_MS) continue;
        const s = Math.min(likhet(m.home, k.home), likhet(m.away, k.away));
        if (s > bp) { bp = s; best = m; }
      }
      if (!best || bp < 0.5) { okopplade++; continue; }
      if (!best.books.some((b) => b.key === key)) best.books.push({ key, bookmaker: namn, home: k.home_odds, draw: k.draw_odds, away: k.away_odds });
    }
  }
  return { events: ut, okopplade };
}

export async function hamta(ligor = Object.keys(KALLOR), log = console.log) {
  const events = [];
  const rapport = {};
  for (const l of ligor) {
    const c = KALLOR[l];
    const opt = { orNull: true, retries: 2, label: `odds ${l}` };
    const mu = await getJson(`${PIN}/leagues/${c.pin}/matchups`, { ...opt, schema: pinnacleSchemas.matchups });
    const ma = await getJson(`${PIN}/leagues/${c.pin}/markets/straight`, { ...opt, schema: pinnacleSchemas.markets });
    const pin = mu && ma ? pinnacleMatcher(mu, ma, l) : [];
    const bolag = [];
    for (const [op, key, namn] of OPERATORER) {
      const j = await getJson(`${KAMBI}/${op}/listView/football/${c.kambi}.json?lang=en_GB&market=SE&useCombined=true`, { ...opt, schema: kambiSchemas.listView });
      bolag.push({ key, namn, matcher: j ? kambiMatcher(j) : [] });
      await sleep(250);
    }
    const { events: ev, okopplade } = sammanfoga(pin, bolag);
    events.push(...ev);
    rapport[l] = { pinnacle: pin.length, medSvenskt: ev.filter((e) => e.books.length > 1).length, okopplade };
    log(`${l.padEnd(4)} Pinnacle ${pin.length}, med svenskt pris ${rapport[l].medSvenskt}, ej kopplade bolagsmatcher ${okopplade}`);
    await sleep(250);
  }
  return { updatedAt: new Date().toISOString(), kallor: 'Pinnacle (publik), Kambi: Unibet, LeoVegas', rapport, events };
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const a = process.argv.slice(2).filter((x) => KALLOR[x]);
  const doc = await hamta(a.length ? a : undefined);
  const fil = path.join(root, 'data', 'hemmaregeln', 'odds.json');
  fs.mkdirSync(path.dirname(fil), { recursive: true });
  fs.writeFileSync(fil, `${JSON.stringify(doc)}\n`);
  console.log(`${doc.events.length} matcher -> data/hemmaregeln/odds.json`);
}
