// Tipslogg: sparar vad som tippats och analyserar utfallet i efterhand.
//
//   node scripts/tipslogg.mjs                     Oddset: logga dagens tips (tips-latest.json) + facit (betting-store.json)
//   node scripts/tipslogg.mjs --analys            sammanställning för allt
//   node scripts/tipslogg.mjs --analys --produkt stryktipset --per liga
//   node scripts/tipslogg.mjs --analys --lag Arsenal              allt tippat på ett lag
//   node scripts/tipslogg.mjs --analys --liga PL --marknad 1X2 --fran 2026-10-01
//   node scripts/tipslogg.mjs --analys --senaste                  senaste versionen före start i stället för första
//
// Stryktipset/Europatipset loggas av scripts/fetch-stryktipset.mjs och Hästar av scripts/fetch-hastar.mjs.
// Analysen skrivs även till data/tipslogg/analys.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cardsOf, usableCardRows } from './lib/cards-model.mjs';
import { loadRefereeMatches, resolveTeam } from './lib/referee-streaks.mjs';
import { LOG_DIR, logTips, settleTips, oddsetRecord, oddsetResult, readAll, flatten, summarize, groupRows } from './lib/tipslogg.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const log = (s) => process.stdout.write(`${s}\n`);

export async function logOddset(now = new Date()) {
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  // Uppskjuten utan nytt datum loggas inte (loggas när den fått nytt datum)
  const recs = (tips.allCandidates || []).filter((t) => t.date && t.home && t.away && !t.postponed).map(oddsetRecord);
  const c = logTips('oddset', recs, now);
  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const byKey = new Map(store.matches.map((m) => [`${m.date}|${m.league}|${m.home}|${m.away}`, m]));
  // Kort i ligor utan football-data: FotMob-raden (domardatan) för samma liga, dag och hemmalag
  const rd = (rel) => { const f = path.join(root, rel); return fs.existsSync(f) ? readJson(f) : null; };
  const cardDay = new Map();
  for (const r of usableCardRows(loadRefereeMatches(rd, store.matches))) {
    const k = `${r.lg}|${r.d}`;
    if (!cardDay.has(k)) cardDay.set(k, []);
    cardDay.get(k).push(r);
  }
  const fotmobCards = (rec) => {
    const r = (cardDay.get(`${rec.league}|${rec.date}`) || []).find((x) => resolveTeam(rec.home, [x.h]) && resolveTeam(rec.away, [x.a]));
    return r ? { home: cardsOf(r, 'h'), away: cardsOf(r, 'a') } : null;
  };
  const settled = await settleTips('oddset', (rec) => oddsetResult(byKey.get(rec.id), fotmobCards(rec)), now);
  log(`Tipslogg Oddset: ${c.ny} nya, ${c.andrad} ändrade före start, ${settled} fick facit`);
  return { ...c, settled };
}

function pct(x) { return x == null ? '–' : `${Math.round(x * 1000) / 10} %`; }

export function analyse(opts) {
  const which = opts.senaste ? 'latest' : 'first';
  const rows = flatten(readAll(), { product: opts.produkt, league: opts.liga, team: opts.lag, from: opts.fran, to: opts.till, market: opts.marknad, which });
  const per = opts.per || (opts.lag ? 'market' : opts.produkt ? 'market' : 'product');
  const out = {
    updatedAt: new Date().toISOString(), version: which, filter: { produkt: opts.produkt || null, liga: opts.liga || null, lag: opts.lag || null, marknad: opts.marknad || null, fran: opts.fran || null, till: opts.till || null },
    total: summarize(rows),
    per, groups: groupRows(rows, per),
    perMarket: groupRows(rows, 'market'),
    perBand: groupRows(rows, 'pband'),
    perValue: groupRows(rows.filter((r) => r.product === 'oddset'), 'value'),
  };
  return out;
}

function printTable(title, groups) {
  log(`\n${title}`);
  log('  grupp                          antal  träff   väntat  spel  resultat (500 kr/spel)');
  for (const g of groups.slice(0, 40)) {
    const res = g.bets ? `${g.profit >= 0 ? '+' : ''}${g.profit} kr (${pct(g.roi)})` : '';
    log(`  ${String(g.key).slice(0, 30).padEnd(30)} ${String(g.n).padStart(5)}  ${pct(g.rate).padStart(6)}  ${pct(g.expected).padStart(6)}  ${String(g.bets || '').padStart(4)}  ${res}`);
  }
}

async function main() {
  if (arg('analys')) {
    const opts = Object.fromEntries(['produkt', 'liga', 'lag', 'fran', 'till', 'marknad', 'per'].map((k) => [k, typeof arg(k) === 'string' ? arg(k) : null]));
    opts.senaste = Boolean(arg('senaste'));
    const a = analyse(opts);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(path.join(LOG_DIR, 'analys.json'), JSON.stringify(a, null, 1), 'utf8');
    const f = Object.entries(a.filter).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || 'allt';
    log(`Tipslogg (${a.version === 'first' ? 'första tipset' : 'senaste före start'}), filter: ${f}`);
    log(`Totalt ${a.total.n} avgjorda val, träff ${pct(a.total.rate)} (modellen väntade ${pct(a.total.expected)})`);
    if (!a.total.n) { log('Inga avgjorda tips ännu – loggen fylls på vid varje hämtning.'); return; }
    printTable(`Per ${a.per}`, a.groups);
    if (a.per !== 'market') printTable('Per marknad', a.perMarket);
    printTable('Per sannolikhet (är modellen rätt kalibrerad?)', a.perBand);
    if (a.perValue.length) printTable('Oddset: Värde mot Ej värde', a.perValue);
    return;
  }
  await logOddset();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
