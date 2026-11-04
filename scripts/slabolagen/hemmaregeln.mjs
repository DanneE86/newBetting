// Hemmaregeln på riktiga svenska odds. Skarp bevakning utan insats: varje körning läser senaste oddsen, säger Värde/Ej värde
// per match och sparar det i data/hemmaregeln/logg.json, så att vi ser hur ofta bolagen har priset och hur spelen går.
//   node scripts/slabolagen/hemmaregeln.mjs   (npm run hemmaregeln)
// Regeln hittades på stängningsodds, så bara omdömen nära avspark (NARA_TIMMAR) räknas som skarpa.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hemmaregel } from './jakt-data.mjs';

export const LIGOR = ['AR', 'AS', 'BR', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'NO'];
export const SVENSKA = ['unibet_se', 'leovegas_se', 'betsson', 'nordicbet', 'coolbet'];
export const NARA_TIMMAR = 2;
export const TAU = 0.02;
const K = ['home', 'draw', 'away'];

/** Ett odds-event -> bedömning, eller null om Pinnacle eller svenska bolag saknas. */
export function bedom(e, nu = Date.now()) {
  const pin = e.books?.find((b) => b.key === 'pinnacle');
  if (!pin || !K.every((k) => pin[k] > 1)) return null;
  const inv = K.map((k) => 1 / pin[k]);
  const t = inv.reduce((a, b) => a + b, 0);
  if (t < 0.98 || t > 1.3) return null;
  const fair = inv.map((x) => x / t);
  const sv = (e.books ?? []).filter((b) => SVENSKA.includes(b.key));
  const pris = K.map((k) => Math.max(0, ...sv.map((b) => (b[k] > 1 ? b[k] : 0))));
  if (!pris.every((x) => x > 1)) return null;
  const bok = sv.find((b) => b.home === pris[0])?.bookmaker ?? null;
  return {
    varde: hemmaregel(fair, pris, TAU), odds: pris[0], bok, fran: Math.round(((1 + TAU) / fair[0]) * 100) / 100,
    ev: fair[0] * pris[0] - 1, pinChans: fair[0], timmar: (Date.parse(e.commence) - nu) / 36e5,
  };
}

/** Lägger in dagens bedömningar i loggen och rättar avgjorda. Första skarpa Värde-priset är spelet. */
export function uppdatera(logg, events, resultat, nu = Date.now()) {
  const ut = { matcher: { ...logg.matcher } };
  const nuIso = new Date(nu).toISOString();
  for (const e of events) {
    if (!LIGOR.includes(e.league) || Date.parse(e.commence) <= nu) continue;
    const b = bedom(e, nu);
    if (!b) continue;
    const key = `${e.commence.slice(0, 10)}|${e.league}|${e.home}|${e.away}`;
    const g = ut.matcher[key] ?? { league: e.league, match: `${e.home} vs ${e.away}`, avspark: e.commence, kollad: 0, nara: 0, spel: null };
    const m = { ...g, kollad: g.kollad + 1, senast: { at: nuIso, odds: b.odds, bok: b.bok, fran: b.fran, ev: Math.round(b.ev * 1e4) / 1e4, varde: b.varde, timmar: Math.round(b.timmar * 10) / 10 } };
    if (b.timmar <= NARA_TIMMAR) {
      m.nara = g.nara + 1;
      if (b.varde && !g.spel) m.spel = { at: nuIso, odds: b.odds, bok: b.bok, ev: m.senast.ev, pinChans: Math.round(b.pinChans * 1e4) / 1e4 };
    }
    ut.matcher[key] = m;
  }
  for (const [key, m] of Object.entries(ut.matcher)) {
    if (m.utfall != null) continue;
    const r = resultat.get(key);
    if (r && ['H', 'D', 'A'].includes(r)) ut.matcher[key] = { ...m, utfall: r, ...(m.spel ? { vinst: r === 'H' ? Math.round((m.spel.odds - 1) * 100) / 100 : -1 } : {}) };
  }
  return ut;
}

export function sammanfatta(logg) {
  const ms = Object.values(logg.matcher);
  const nara = ms.filter((m) => m.nara > 0);
  const spel = ms.filter((m) => m.spel);
  const klara = spel.filter((m) => m.vinst != null);
  const v = klara.reduce((s, m) => s + m.vinst, 0);
  return { matcher: ms.length, naraKollade: nara.length, spel: spel.length, avgjorda: klara.length, enheter: Math.round(v * 100) / 100, roi: klara.length ? v / klara.length : null };
}

/** Loggens nycklar -> resultat. Oddskällornas lagnamn skiljer sig från store, så båda lagen ska stämma och datumet högst en dag fel. */
export function kopplaResultat(logg, spelade, samma) {
  const ut = new Map();
  for (const [key, m] of Object.entries(logg.matcher)) {
    if (m.utfall != null) continue;
    const [datum, liga, hemma, borta] = key.split('|');
    const t = Date.parse(datum);
    const hit = spelade.filter((s) => s.league === liga && Math.abs(Date.parse(s.date) - t) <= 864e5 && samma(s.home, hemma) && samma(s.away, borta));
    if (hit.length === 1) ut.set(key, hit[0].result);
  }
  return ut;
}

/** Vilka ligor behöver färska odds? Alla om det gått 12 timmar, annars bara ligor med match inom 2,5 timmar. */
export function ligorAttHamta(doc, nu = Date.now()) {
  if (!doc?.updatedAt || nu - Date.parse(doc.updatedAt) > 12 * 36e5) return LIGOR;
  const snart = doc.events.filter((e) => { const t = Date.parse(e.commence) - nu; return t > 0 && t <= 2.5 * 36e5; }).map((e) => e.league);
  return LIGOR.filter((l) => snart.includes(l));
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const R = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8').replace(/^﻿/, ''));
  const dir = path.join(root, 'data', 'hemmaregeln');
  const fil = path.join(dir, 'logg.json'), oddsFil = path.join(dir, 'odds.json');
  fs.mkdirSync(dir, { recursive: true });
  const gammal = fs.existsSync(oddsFil) ? JSON.parse(fs.readFileSync(oddsFil, 'utf8')) : null;
  const auto = process.argv.includes('--auto');
  const ligor = process.argv.includes('--hamta') ? LIGOR : auto ? ligorAttHamta(gammal) : [];
  let doc = gammal;
  if (ligor.length) {
    const { hamta } = await import('./oppna-odds.mjs');
    const ny = await hamta(ligor, auto ? () => {} : console.log);
    // Ligor som inte hämtades behåller sina odds och sin ålder
    const kvar = (gammal?.events ?? []).filter((e) => !ligor.includes(e.league) && Date.parse(e.commence) > Date.now());
    const hel = ligor.length === LIGOR.length;
    doc = { ...ny, updatedAt: hel ? ny.updatedAt : gammal.updatedAt, senastHamtat: ny.updatedAt, events: [...kvar, ...ny.events] };
    fs.writeFileSync(oddsFil, `${JSON.stringify(doc)}\n`);
  }
  if (!doc) { console.log('Inga odds: kör med --hamta'); process.exit(0); }
  const u = doc;
  const start = fs.existsSync(fil) ? JSON.parse(fs.readFileSync(fil, 'utf8')) : { matcher: {} };
  const { sameTeamName } = await import('../lib/team-aliases.mjs');
  const spelade = R('data/betting-store.json').matches.filter((m) => Number.isFinite(m.hg) && LIGOR.includes(m.league));
  const logg = uppdatera(start, ligor.length || !auto ? u.events : [], kopplaResultat(start, spelade, sameTeamName));
  fs.writeFileSync(fil, `${JSON.stringify(logg, null, 1)}\n`);
  const nu = Date.now();
  if (auto) {
    const s = sammanfatta(logg);
    const nya = Object.values(logg.matcher).filter((m) => m.spel && !Object.values(start.matcher).some((g) => g.match === m.match && g.spel));
    const rad = `${new Date().toISOString().slice(0, 16)} ligor ${ligor.join(',') || '-'} | spel ${s.spel}, avgjorda ${s.avgjorda}, enheter ${s.enheter}${nya.length ? ` | NYTT: ${nya.map((m) => `${m.match} ${m.spel.odds} (${m.spel.bok})`).join('; ')}` : ''}`;
    if (ligor.length || nya.length) fs.appendFileSync(path.join(dir, 'auto-logg.txt'), `${rad}\n`);
    process.exit(0);
  }
  const tid = (d) => new Date(d).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  const rad = u.events.filter((e) => LIGOR.includes(e.league) && Date.parse(e.commence) > nu).map((e) => ({ e, b: bedom(e, nu) })).filter((x) => x.b).sort((x, y) => x.e.commence.localeCompare(y.e.commence));
  console.log(`Odds hämtade ${u.updatedAt}. ${rad.length} kommande matcher har Pinnacle och svenska bolag.`);
  for (const { e, b } of rad) console.log(`${b.varde ? 'VÄRDE   ' : 'Ej värde'} ${tid(e.commence).padEnd(18)} ${e.league.padEnd(4)} ${`${e.home} - ${e.away}`.padEnd(46)} 1: ${b.odds.toFixed(2)} från ${b.fran.toFixed(2)} (${b.bok ?? '?'}) ${b.timmar <= NARA_TIMMAR ? 'nära avspark' : `${Math.round(b.timmar)} h kvar`}`);
  console.log(JSON.stringify(sammanfatta(logg)));
}
