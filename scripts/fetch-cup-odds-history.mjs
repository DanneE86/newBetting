// Historiska cupodds från OddsPortals resultatarkiv (1X2-snitt + resultat) för CL, EL, ECL, Libertadores och
// Sudamericana, samma säsonger som data/open/cup-history-tm.json. Används av scripts/lardomar-cup-truppvarde.mjs för att se
// om marknaden redan prisar in truppvärdet. Sidan är JS-renderad -> Playwright, en sida i taget med paus.
// Avslutade säsonger hämtas en gång; innevarande och förra hämtas om.
// Kör: node scripts/fetch-cup-odds-history.mjs [--comp LIB,SUD] [--out fil]   Utdata: data/open/cup-odds-history.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUP_HISTORY_COMPS } from './lib/tm-cup-history.mjs';
import { cupResultsSlugs, parseResultsText } from './lib/oddsportal-results.mjs';
import { seasonStartYear } from './lib/seasons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out'); // egen fil för en parallell körning (slås ihop för hand)
const OUT = outArg > 0 ? path.resolve(process.argv[outArg + 1]) : path.join(root, 'data', 'open', 'cup-odds-history.json');
const arg = process.argv.indexOf('--comp');
const only = arg > 0 ? new Set(process.argv[arg + 1].split(',')) : null;
const doc = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { seasons: {} };
const save = () => fs.writeFileSync(OUT, JSON.stringify({ ...doc, updatedAt: new Date().toISOString(), source: 'oddsportal.com resultatarkiv (1X2-snitt)' }));
const nowSeason = seasonStartYear();
const calNow = Number(new Date().toISOString().slice(0, 4));

const { chromium } = await import('@playwright/test');
const browser = await chromium.launch();
const page = await browser.newPage({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
  locale: 'en-GB', timezoneId: 'UTC',
});

const firstLink = () => page.evaluate(() => document.querySelector('a[href*="/h2h/"]')?.getAttribute('href') ?? null);

// shown = första matchlänken på tidigare sidor: sida 2+ visar först en tidigare sida en stund, vänta tills listan bytts
async function readPage(url, shown = new Set()) {
  await page.goto('about:blank'); // hashbyte (#/page/2/) laddar annars inte om listan
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.click('#onetrust-reject-all-handler', { timeout: 3000 }).catch(() => {});
  await page.waitForSelector('a[href*="/h2h/"]', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 16 && shown.has(await firstLink()); i++) await page.waitForTimeout(500);
  return page.evaluate(() => {
    const all = document.querySelectorAll('a[href*="/h2h/"]').length;
    let box = document.querySelector('a[href*="/h2h/"]');
    while (box && box.querySelectorAll('a[href*="/h2h/"]').length < all) box = box.parentElement;
    return { title: document.title, text: box ? box.innerText : '', first: document.querySelector('a[href*="/h2h/"]')?.getAttribute('href') ?? null };
  });
}

for (const [code, c] of Object.entries(CUP_HISTORY_COMPS)) {
  if (only && !only.has(code)) continue;
  const last = c.region === 'Sydamerika' ? calNow - 1 : nowSeason;
  for (let y = Math.max(c.from, 2017); y <= last; y++) {
    const key = `${code}|${y}`;
    if (doc.seasons[key]?.matches?.length && y < last - 1) continue;
    let rows = [];
    let used = null;
    for (const slug of cupResultsSlugs(code, y, c.region === 'Sydamerika' ? calNow : nowSeason)) {
      const seen = new Set();
      const shown = new Set();
      for (let p = 1; p <= 10; p++) {
        const r = await readPage(`https://www.oddsportal.com/football/${slug}/results/${p > 1 ? `#/page/${p}/` : ''}`, shown);
        if (!/results/i.test(r.title)) break; // fel sökväg ger oddssidan för innevarande säsong
        shown.add(r.first);
        const got = parseResultsText(r.text).filter((m) => !seen.has(`${m.date}|${m.home}|${m.away}`));
        got.forEach((m) => seen.add(`${m.date}|${m.home}|${m.away}`));
        rows.push(...got);
        if (got.length < 40) break;
      }
      if (rows.length) { used = slug; break; }
    }
    if (rows.length) doc.seasons[key] = { league: code, season: y, slug: used, matches: rows };
    console.log(`${key}: ${rows.length} matcher (${used ?? 'ingen sökväg'}), ${rows.filter((m) => m.odds).length} med odds`);
    save();
  }
}
await browser.close();
