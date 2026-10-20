// Hade det lont sig att spela pa sena oddsrorelser? Loggen data/oddsrorelser/*.json (oddsschemat) mot resultaten:
// ligamatcher ur data/betting-store.json, cuper ur data/open/referee_fotmob.json. Strategier i scripts/lib/odds-rorelser.mjs.
//   npm run oddsrorelser:analys
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateMoves } from './lib/odds-rorelser.mjs';
import { sameTeamName } from './lib/team-aliases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p, fb) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')) : fb);
const logDir = path.join(root, 'data', 'oddsrorelser');
const records = (fs.existsSync(logDir) ? fs.readdirSync(logDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)) : [])
  .flatMap((f) => Object.values(readJson(path.join(logDir, f), {}).matches ?? {}));

// Resultat per liga och datum (avsparksdatum i UTC kan vara dagen efter tipsets datum - +-1 dag)
const results = new Map();
const add = (league, date, home, away, hg, ag) => {
  if (!Number.isFinite(hg) || !Number.isFinite(ag)) return;
  (results.get(league) ?? results.set(league, []).get(league)).push({ date, home, away, hg, ag });
};
for (const m of readJson(path.join(root, 'data', 'betting-store.json'), {}).matches ?? []) add(m.league, m.date, m.home, m.away, m.hg, m.ag);
for (const m of Object.values(readJson(path.join(root, 'data', 'open', 'referee_fotmob.json'), {}).matches ?? {})) add(m.lg, m.d, m.h, m.a, m.hg, m.ag);
const near = (a, b) => Math.abs(Date.parse(a) - Date.parse(b)) <= 86400e3;
const resultOf = (r) => (results.get(r.league) ?? []).find((m) => near(m.date, r.date) && sameTeamName(m.home, r.home) && sameTeamName(m.away, r.away)) ?? null;

const { graded, total, rows } = evaluateMoves(records, resultOf);
console.log(`Sena oddsrörelser: ${total} matcher loggade, ${graded} med resultat`);
console.log('"Följ" = spela utfallet som pengarna gick på, "Mot" = utfallet som drev ut, till senaste oddset. ROI per insats.');
console.log('Tröskel  Marknad   Strategi   Spel  Träff    Snittodds  Resultat  ROI');
for (const r of rows.filter((x) => x.n)) {
  console.log(`${`≥${r.threshold}`.padEnd(8)} ${r.market.padEnd(9)} ${(r.strategy === 'folj' ? 'Följ' : 'Mot').padEnd(10)} ${String(r.n).padStart(4)}  ${`${r.hitRate} %`.padStart(7)}  ${String(r.avgOdds).padStart(9)}  ${(r.profit > 0 ? '+' : '') + r.profit}`.padEnd(68) + `${r.roi > 0 ? '+' : ''}${r.roi} %`);
}
if (!rows.some((x) => x.n)) console.log('Inga avgjorda matcher med sen rörelse än - loggen fylls på av oddsschemat.');
