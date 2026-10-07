// Spikbedomning match for match (anvandaren 2026-09-30: "bedom match till match och bygg systemet efter det").
// Hur ofta favoriter av samma slag faktiskt vann i kupongarkivet (data/tips-archive/systems), bara omgangar fore den
// aktuella: samma spel, samma chansniva (5-procentsband) och hemma-/bortafavorit, samt ligan. Det ger en justerad
// favoritchans per match; systemet byggs pa de justerade procenten och en match far spikas om den justerade chansen
// ar minst spikMin (valt i backtest).
//   node scripts/lib/stryk-calibration.mjs [stryktipset|europatipset] [fore-datum]   (skriver ut tabellen)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(root, 'data', 'tips-archive', 'systems');
const SIGNS = ['1', 'X', '2'];
const K = 40; // krympning: sa manga "vantade vinster" som vager mot modellen (fa matcher -> nara modellen)
const MIN_MATCHES = 300;

let cache = null;
function archive() {
  if (cache) return cache;
  cache = [];
  if (!fs.existsSync(DIR)) return cache;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
      const product = d.product || f.split('-')[0];
      const day = (d.closeTime || '').slice(0, 10);
      for (const m of d.matches || []) {
        if (!m.final || !SIGNS.includes(m.outcome)) continue;
        const k = m.final.indexOf(Math.max(...m.final));
        cache.push({ product, day, league: m.league || '', fav: k, p: m.final[k], won: SIGNS[k] === m.outcome });
      }
    } catch { /* trasig fil hoppas over */ }
  }
  return cache;
}

const band = (p) => Math.min(0.85, Math.max(0.3, Math.floor(p * 20) / 20)).toFixed(2);
const favKind = (k) => (k === 0 ? 'hemma' : k === 2 ? 'borta' : 'kryss');

// Tabell for ett spel, byggd pa matcher fore `before`
const tables = new Map();
export function calibrationTable(product, before = new Date().toISOString().slice(0, 10)) {
  const end = String(before).slice(0, 10);
  const key = `${product}|${end}`;
  if (tables.has(key)) return tables.get(key);
  const rows = archive().filter((m) => m.product === product && m.day && m.day < end);
  let t = null;
  if (rows.length >= MIN_MATCHES) {
    const add = (o, k, m) => { const x = (o[k] ||= { n: 0, w: 0, e: 0 }); x.n++; x.e += m.p; if (m.won) x.w++; };
    const bs = {}, lg = {};
    for (const m of rows) { add(bs, `${favKind(m.fav)}|${band(m.p)}`, m); add(lg, m.league, m); }
    t = { product, before: end, matches: rows.length, bs, lg };
  }
  tables.set(key, t);
  return t;
}

// Faktor (vunna + K) / (vantade + K): 1 = modellen stammer, < 1 = favoriterna vann mer sallan an modellen sa
const factor = (x) => (x ? (x.w + K) / (x.e + K) : 1);

// Bedomning av en match: justerad favoritchans och justerade procent for systemet (favoriten skalas, ovriga fyller ut)
export function assessMatch(final, league, table, spikMin) {
  if (!final || !table) return null;
  const k = final.indexOf(Math.max(...final));
  const p = final[k];
  const g = table.bs[`${favKind(k)}|${band(p)}`], l = table.lg[league || ''];
  const rest = 1 - p;
  // Favoriten far aldrig byta sida (anvandaren 2026-10-06: "tippa alltid samma som pa Oddset"). Justeringen sanker
  // favoriten hogst till strax over tvaan efter omfordelningen: cal >= m / (rest + m), m = tvaans modellchans.
  const m = Math.max(...final.filter((_, i) => i !== k));
  const floor = rest > 0 ? m / (rest + m) + 0.001 : 0.05;
  const cal = Math.min(0.95, Math.max(0.05, floor, p * factor(g) * factor(l)));
  const sysP = final.map((x, i) => (i === k ? cal : rest > 0 ? (x * (1 - cal)) / rest : (1 - cal) / 2));
  return {
    fav: SIGNS[k], model: Math.round(p * 1000) / 1000, calibrated: Math.round(cal * 1000) / 1000,
    group: g ? { n: g.n, won: Math.round((g.w / g.n) * 1000) / 1000, expected: Math.round((g.e / g.n) * 1000) / 1000 } : null,
    league: l ? { n: l.n, won: Math.round((l.w / l.n) * 1000) / 1000, expected: Math.round((l.e / l.n) * 1000) / 1000 } : null,
    spikbar: cal >= spikMin, spikMin,
    sysP: sysP.map((x) => Math.round(x * 10000) / 10000),
  };
}

// Text till matchanalysen
export function assessmentText(a, home, away) {
  if (!a) return null;
  const who = a.fav === '1' ? home : a.fav === '2' ? away : 'kryss';
  const pct = (x) => `${Math.round(x * 100)} %`;
  const g = a.group ? ` Favoriter av samma slag vann ${pct(a.group.won)} (väntat ${pct(a.group.expected)}, ${a.group.n} matcher)` : '';
  const l = a.league && a.league.n >= 40 ? `, i ligan ${pct(a.league.won)} mot väntat ${pct(a.league.expected)}` : '';
  return `Spikbedömning: ${who} (${a.fav}) har ${pct(a.model)} enligt modellen, justerat efter historiken ${pct(a.calibrated)}.${g}${l}${g || l ? '.' : ''} ${a.used === false ? 'På Europatipset byggs systemet på modellens procent (justeringen gjorde det sämre i baktestet).' : a.spikMin <= 0 ? 'Systemet väljer spik eller gardering efter den justerade chansen.' : a.spikbar ? `Kan spikas (minst ${pct(a.spikMin)}).` : `Spikas inte – under ${pct(a.spikMin)}, garderas i stället.`}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const t = calibrationTable(process.argv[2] || 'stryktipset', process.argv[3]);
  if (!t) { console.log('för lite data'); process.exit(0); }
  console.log(`${t.product}: ${t.matches} matcher före ${t.before}`);
  for (const [k, x] of Object.entries(t.bs).sort()) if (x.n >= 20) console.log(`  ${k.padEnd(12)} n ${String(x.n).padStart(4)}  vann ${Math.round((100 * x.w) / x.n)} %  väntat ${Math.round((100 * x.e) / x.n)} %  faktor ${factor(x).toFixed(3)}`);
  for (const [k, x] of Object.entries(t.lg).sort((a, b) => b[1].n - a[1].n)) if (x.n >= 60) console.log(`  liga ${k.padEnd(22)} n ${String(x.n).padStart(4)}  vann ${Math.round((100 * x.w) / x.n)} %  väntat ${Math.round((100 * x.e) / x.n)} %  faktor ${factor(x).toFixed(3)}`);
}
