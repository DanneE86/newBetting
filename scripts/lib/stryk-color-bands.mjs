// Fargband for ratt rad: hur manga grona/gula/roda tecken (folkets streck: gron >= 45 %, rod <= 20 %, annars gul)
// ratt rad hade per omgang i kupongarkivet (data/tips-archive/systems). Kupongernas fargregler byggs pa banden
// (anvandarens beslut 2026-09-30): reglerna maste slappa igenom karnan (p10-p90) och far aldrig ga utanfor det som
// hant (min-max). Urval som i backtestet: Stryktipset = minst 1 PL-match, Europatipset = minst 3 topp 4-matcher.
// Fonster: 365 dagar fore `before`, sa backtestet aldrig ser framtiden.
//   node scripts/lib/stryk-color-bands.mjs [stryktipset|europatipset]   (skriver ut banden)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(root, 'data', 'tips-archive', 'systems');
const SIGNS = ['1', 'X', '2'];
const COLOR = { green: 0.45, red: 0.2 }; // samma som fetch-stryktipset.mjs
export const BAND_COLORS = ['green', 'yellow', 'red'];
const TOP4 = new Set(['Premier League', 'La Liga', 'Serie A', 'Bundesliga']);
const WINDOW_DAYS = 365;
const MIN_DRAWS = 10; // farre omgangar i fonstret -> inga band (fargreglerna optimeras fritt)
const CORE = [0.1, 0.9];

const colorOf = (f) => (f == null ? 'yellow' : f >= COLOR.green ? 'green' : f <= COLOR.red ? 'red' : 'yellow');

let cache = null;
function archive() {
  if (cache) return cache;
  cache = [];
  if (!fs.existsSync(DIR)) return cache;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
      if (!d.matches?.length || !d.outcomes || !d.closeTime) continue;
      const counts = { green: 0, yellow: 0, red: 0 };
      let ok = true;
      d.matches.forEach((m) => {
        const k = SIGNS.indexOf(m.outcome);
        if (k < 0) { ok = false; return; }
        counts[colorOf(m.folk?.[k])]++;
      });
      if (!ok) continue;
      const pl = d.matches.filter((m) => m.league === 'Premier League').length;
      const top4 = d.matches.filter((m) => TOP4.has(m.league)).length;
      cache.push({ product: d.product || f.split('-')[0], drawNumber: d.drawNumber, day: d.closeTime.slice(0, 10), pl, top4, counts });
    } catch { /* trasig fil hoppas over */ }
  }
  return cache;
}

const quantile = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))];
};

// Band per farg: { core: [p10, p90], range: [min, max], mean } eller null om for fa omgangar
export function colorBands(product, before = new Date().toISOString().slice(0, 10)) {
  const end = String(before).slice(0, 10);
  const start = new Date(Date.parse(end) - WINDOW_DAYS * 86400e3).toISOString().slice(0, 10);
  const draws = archive().filter((d) => d.product === product && d.day < end && d.day >= start
    && (product === 'europatipset' ? d.top4 >= 3 : d.pl >= 1));
  if (draws.length < MIN_DRAWS) return null;
  const out = { draws: draws.length, from: draws.reduce((a, d) => (d.day < a ? d.day : a), end), to: draws.reduce((a, d) => (d.day > a ? d.day : a), start) };
  for (const c of BAND_COLORS) {
    const xs = draws.map((d) => d.counts[c]);
    out[c] = {
      core: [quantile(xs, CORE[0]), quantile(xs, CORE[1])], range: [Math.min(...xs), Math.max(...xs)],
      mean: Math.round((xs.reduce((a, x) => a + x, 0) / xs.length) * 10) / 10,
    };
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(colorBands(process.argv[2] || 'stryktipset', process.argv[3]), null, 1));
}
