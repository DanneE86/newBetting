// Reservodds fran OddsPortal (oddsportal.com) for matcher som saknar odds i The Odds API.
// Ligasidan (t.ex. /football/south-korea/k-league-1/) listar kommande matcher med 1X2-snittodds.
// Matchsidorna (per bolag) renderas inte i headless-lage, sa bara snittet anvands.
// Sidan ar JS-renderad -> Playwright. En sida i taget med paus, bara ligor dar odds saknas.
//   node scripts/fetch-oddsportal.mjs          (ligor med kommande tips utan odds)
//   node scripts/fetch-oddsportal.mjs --all    (alla ligor med "oddsportal" i config/leagues.json)
//   node scripts/fetch-oddsportal.mjs KR LL2   (bara dessa)
// Utdata: data/open/oddsportal_odds.json (lases av pro-layer.mjs nar The Odds API saknar matchen)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  registry: path.join(root, 'config', 'leagues.json'),
  tips: path.join(root, 'data', 'tips-latest.json'),
  out: path.join(root, 'data', 'open', 'oddsportal_odds.json'),
};
const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')) : null);
const HORIZON_DAYS = 10;
const PAUSE_MS = 2500;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const ODD_RE = /^\d{1,3}\.\d{1,2}$/;
const DAY_RE = /^(?:(?:Today|Tomorrow|Yesterday),\s*)?(\d{1,2}) ([A-Z][a-z]{2})(?: (\d{4}))?/;

function leaguesToFetch(registry) {
  const withSlug = Object.entries(registry.leagues).filter(([, l]) => l.oddsportal).map(([c]) => c);
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (args.length) return withSlug.filter((c) => args.includes(c));
  if (process.argv.includes('--all')) return withSlug;
  // Bara ligor dar kommande tips saknar odds (inom horisonten) eller bara har OddsPortal-odds
  const tips = readJson(P.tips);
  const limit = new Date(Date.now() + HORIZON_DAYS * 86400e3).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const missing = new Set();
  for (const t of tips?.allCandidates ?? []) {
    if (t.date < today || t.date > limit) continue;
    const onlyOp = Object.values(t.pro?.oddsBooks ?? {}).every((b) => !b || /OddsPortal/.test(b));
    if (!(t.pro?.odds?.home > 1) || onlyOp) missing.add(t.league);
  }
  // Cuper har ingen modell: utan odds finns inga tips alls, sa de syns bara i spelschemat (horisont 21 d som tipsen)
  const fixtures = readJson(path.join(root, 'data', 'upcoming-fixtures.json')) ?? [];
  const cupLimit = new Date(Date.now() + 21 * 86400e3).toISOString().slice(0, 10);
  const hasTip = new Set((tips?.allCandidates ?? []).map((t) => t.league));
  for (const f of Array.isArray(fixtures) ? fixtures : []) {
    if (registry.leagues[f.league]?.cup && !hasTip.has(f.league) && f.date >= today && f.date <= cupLimit) missing.add(f.league);
  }
  return withSlug.filter((c) => missing.has(c));
}

/**
 * Tolkar ligasidans text. Ordningen ar:
 *   datumrubrik ("10 Oct 2026" / "Today, 27 Sep"), sedan per match: "13:30", hemma, "-", borta, 1, X, 2.
 * Klockslaget visas i sajtens tidszon; UTC-forskjutningen tas fran ld+json (startDate i UTC) nar den finns.
 */
export function parseListText(text, ld = [], now = new Date()) {
  const lines = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const rows = [];
  let day = null;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const dm = TIME_RE.test(L) ? null : L.match(DAY_RE);
    if (dm && MONTHS[dm[2]] != null) {
      let y = dm[3] ? Number(dm[3]) : now.getUTCFullYear();
      if (!dm[3] && MONTHS[dm[2]] < now.getUTCMonth() - 6) y++; // dec -> jan
      day = { y, mo: MONTHS[dm[2]], d: Number(dm[1]) };
      continue;
    }
    const tm = L.match(TIME_RE);
    if (!tm || !day) continue;
    const home = lines[i + 1];
    const dashAt = lines.slice(i + 2, i + 4).findIndex((x) => x === '-' || x === '–');
    if (!home || dashAt < 0) continue;
    const away = lines[i + 3 + dashAt];
    const odds = [];
    let j = i + 4 + dashAt;
    while (j < lines.length && odds.length < 3 && j < i + 12) {
      if (ODD_RE.test(lines[j])) odds.push(Number(lines[j]));
      else if (TIME_RE.test(lines[j])) break;
      j++;
    }
    if (odds.length < 3) continue;
    const local = Date.UTC(day.y, day.mo, day.d, Number(tm[1]), Number(tm[2]));
    const ldStart = ld.find((e) => e.name === `${home} - ${away}`)?.startDate ?? null;
    rows.push({ home, away, odds, local, ldStart });
    i = j - 1;
  }
  // Sajtens tidszon: visad tid minus ld+json (UTC). Utan ld+json: +2 h (svensk sommartid)
  const withLd = rows.find((r) => r.ldStart);
  const offsetMs = withLd ? withLd.local - new Date(withLd.ldStart).getTime() : 2 * 3600e3;
  return rows.map((r) => ({
    home: r.home, away: r.away, odds: r.odds,
    startDate: r.ldStart ?? new Date(r.local - offsetMs).toISOString(),
  }));
}

async function scrapeLeague(page, slug) {
  await page.goto(`https://www.oddsportal.com/football/${slug}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.click('#onetrust-reject-all-handler', { timeout: 4000 }).catch(() => {});
  await page.waitForSelector('a[href*="/h2h/"]', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const { text, ld } = await page.evaluate(() => {
    // Listcontainern: forsta forfader som innehaller alla matchlankar
    const all = document.querySelectorAll('a[href*="/h2h/"]').length;
    let box = document.querySelector('a[href*="/h2h/"]');
    while (box && box.querySelectorAll('a[href*="/h2h/"]').length < all) box = box.parentElement;
    const ld = [];
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const j = JSON.parse(s.textContent);
        if (j.name && j.startDate) ld.push({ name: j.name.trim(), startDate: j.startDate });
      } catch {
        /* ignore */
      }
    }
    return { text: box ? box.innerText : '', ld };
  });
  return parseListText(text, ld);
}

async function main() {
  const { chromium } = await import('@playwright/test');
  const registry = readJson(P.registry);
  const codes = leaguesToFetch(registry);
  const nowIso = new Date().toISOString();
  const prev = readJson(P.out);
  const events = (prev?.events ?? []).filter((e) => !codes.includes(e.league) && e.commence > nowIso);
  if (!codes.length) {
    console.log('OddsPortal: inga ligor saknar odds');
    return;
  }
  console.log(`OddsPortal: ${codes.join(', ')}`);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36',
    locale: 'en-GB', timezoneId: 'UTC',
  });
  const report = { ...(prev?.report ?? {}) };
  for (const code of codes) {
    const slug = registry.leagues[code].oddsportal;
    try {
      const rows = await scrapeLeague(page, slug);
      let n = 0;
      for (const r of rows) {
        const [h, d, a] = r.odds;
        // Rimlighet: 1X2-marginal mellan -2 % och +15 %, och bara kommande matcher
        const or = 1 / h + 1 / d + 1 / a - 1;
        if (!(h > 1 && d > 1 && a > 1) || or < -0.02 || or > 0.15 || r.startDate <= nowIso) continue;
        events.push({
          league: code, commence: r.startDate, home: r.home, away: r.away,
          homeRaw: r.home, awayRaw: r.away, bookmaker: 'OddsPortal (snitt)',
          odds: { home: h, draw: d, away: a, over25: null, under25: null },
          books: [{ key: 'oddsportal', bookmaker: 'OddsPortal (snitt)', home: h, draw: d, away: a, over25: null, under25: null }],
          source: 'oddsportal', url: `https://www.oddsportal.com/football/${slug}/`,
        });
        n++;
      }
      report[code] = n;
      console.log(`  ${code.padEnd(5)} ${n} matcher med odds (${slug})`);
    } catch (e) {
      report[code] = `fel: ${e.message.split('\n')[0]}`;
      console.log(`  ${code.padEnd(5)} fel: ${e.message.split('\n')[0]}`);
    }
    await page.waitForTimeout(PAUSE_MS);
  }
  await browser.close();
  fs.writeFileSync(P.out, JSON.stringify({
    updatedAt: new Date().toISOString(), source: 'oddsportal.com (1X2-snitt)', report, eventCount: events.length, events,
  }, null, 2));
  console.log(`OddsPortal: ${events.length} matcher -> data/open/oddsportal_odds.json`);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((e) => {
    console.error(`OddsPortal fel: ${e.message}`);
    process.exit(1);
  });
}
