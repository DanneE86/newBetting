// Opta-livescore (optaplayerstats.statsperform.com) -> data/opta/<LIGA>.json, matcher som spelats i dag.
// Ger halvtid, slutresultat och kort med orsak (Foul, Dissent …) och minut. API:t visar bara dagens matcher,
// så filen byggs på för varje körning; kör på kvällen efter matcherna. Akamai stoppar headless, därför öppnas
// ett synligt webbläsarfönster en kort stund (går inte i GitHub Actions). Kör: npm run opta
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { optaLeague, parseOpta } from './lib/opta.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'opta');
const B = 'https://optaplayerstats.statsperform.com';

const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
let raw;
try {
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' });
  await page.goto(`${B}/en_GB/soccer`, { waitUntil: 'networkidle', timeout: 90_000 });
  if (/access denied/i.test(await page.locator('body').innerText())) throw new Error('Opta: Access Denied (Akamai)');
  raw = await page.evaluate(async (u) => { const r = await fetch(u, { credentials: 'include' }); if (!r.ok) throw new Error(`Opta ${r.status}`); return r.json(); },
    `${B}/api/en_GB/soccer/livescores?offset=0`);
} finally {
  await browser.close();
}

fs.mkdirSync(OUT, { recursive: true });
const byLeague = new Map();
const unknown = new Set();
for (const m of raw?.matches ?? []) {
  const lg = optaLeague(m);
  const x = parseOpta(m);
  if (!x) continue;
  if (!lg) { unknown.add(`${m.comp?.country?.name}|${m.comp?.name}`); continue; }
  (byLeague.get(lg) ?? byLeague.set(lg, []).get(lg)).push(x);
}
let n = 0;
for (const [lg, list] of byLeague) {
  const file = path.join(OUT, `${lg}.json`);
  const doc = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { league: lg, matches: {} };
  for (const x of list) { doc.matches[x.id] = x; n++; }
  doc.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(doc), 'utf8');
}
console.log(`Opta: ${n} spelade matcher sparade i ${byLeague.size} ligor (data/opta)`);
if (unknown.size) console.log(`Ej mappade tävlingar (lib/opta.mjs OPTA_LEAGUES): ${[...unknown].join(', ')}`);
