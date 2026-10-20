// Oddsrorelser i alla ligor for matcher inom 24 h (tip.oddsMove fran pro-lagret, scripts/lib/odds-history.mjs).
// Kors efter varje hamtning i oddsschemat. Utdata: data/reports/oddsrorelser.json + docs/analys/oddsrorelser.md,
// och loggen data/oddsrorelser/<YYYY-MM>.json (alla sena rorelser, utvarderas med npm run oddsrorelser:analys).
//   node scripts/odds-rorelser.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeMoves, logRecord } from './lib/odds-rorelser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tips = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tips-latest.json'), 'utf8').replace(/^﻿/, ''));
const allTips = [...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])];
const rows = summarizeMoves(allTips);

// Logg: alla matcher inom 24 h med rorelse, en post per match (senaste hamtningen narmast avspark vinner)
const logDir = path.join(root, 'data', 'oddsrorelser');
fs.mkdirSync(logDir, { recursive: true });
const byMonth = {};
const inRows = new Set(rows.map((r) => `${r.league}|${r.match}|${r.kickoffUtc}`));
for (const t of allTips) {
  if (!inRows.has(`${t.league}|${t.match}|${t.kickoffUtc}`)) continue;
  const rec = logRecord(t);
  if (rec) (byMonth[rec.kickoffUtc.slice(0, 7)] ??= {})[rec.key] = rec;
}
for (const [month, recs] of Object.entries(byMonth)) {
  const file = path.join(logDir, `${month}.json`);
  const doc = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { matches: {} };
  Object.assign(doc.matches, recs);
  doc.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, `${JSON.stringify(doc, null, 1)}\n`);
}
const flagged = rows.filter((r) => r.flagged.length);

const fmt = (x) => (x == null ? '–' : String(x).replace('.', ','));
const pp = (x) => `${x > 0 ? '+' : ''}${fmt(x)}`;
const when = (iso) => new Date(iso).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const LABEL = { home: '1', draw: 'X', away: '2', over25: 'Över 2,5', under25: 'Under 2,5' };
const line = (r) => `| ${when(r.kickoffUtc)} | ${r.league} | ${r.match} | ${r.flagged.map((k) => `${LABEL[k]} ${fmt(r.moves[k].from)} → **${fmt(r.moves[k].to)}** (${pp(r.moves[k].pp)}${r.moves[k].step != null ? `, senast ${pp(r.moves[k].step)}` : ''})`).join('<br>')} | ${r.src === 'op' ? 'OddsPortal' : 'Pinnacle'} |`;
const md = [
  '# Oddsrörelser – matcher inom 24 h',
  '',
  `Uppdaterad ${when(new Date().toISOString())}. ${rows.length} matcher med minst två oddsnoteringar, ${flagged.length} sticker ut.`,
  '',
  '**Så läser du det här:** rörelsen är marknadens chans i procentenheter sedan första noteringen (+ = mer pengar på utfallet).',
  'Den flaggas från 4 enheter totalt eller 3 enheter sedan förra hämtningen. Gränsen för Värde flyttar med marknaden.',
  '',
  '| Avspark | Liga | Match | Rörelse | Källa |',
  '|---|---|---|---|---|',
  ...(flagged.length ? flagged.map(line) : ['| – | – | Inga rörelser som sticker ut | – | – |']),
  '',
].join('\n');

fs.mkdirSync(path.join(root, 'data', 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'reports', 'oddsrorelser.json'), `${JSON.stringify({ updatedAt: new Date().toISOString(), rows }, null, 1)}\n`);
fs.writeFileSync(path.join(root, 'docs', 'analys', 'oddsrorelser.md'), md);
console.log(`Oddsrörelser: ${rows.length} matcher inom 24 h med rörelse, ${flagged.length} sticker ut`);
for (const r of flagged.slice(0, 15)) console.log(`  ${r.league.padEnd(4)} ${r.match}: ${r.flagged.map((k) => `${LABEL[k]} ${fmt(r.moves[k].from)}→${fmt(r.moves[k].to)} (${pp(r.moves[k].pp)})`).join(', ')}`);
