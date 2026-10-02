import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

// GUI: sök land/liga i ligaraden och Startelva-panelen (plan, jämförelse, spindeldiagram). Kör mot gui/server.mjs lokalt.
const root = path.resolve(__dirname, '..');
const port = 4200 + Math.floor(Math.random() * 80);
const base = `http://127.0.0.1:${port}`;
let server: ChildProcess;

test.beforeAll(async () => {
  server = spawn(process.execPath, [path.join(root, 'gui', 'server.mjs')], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    try { await fetch(base + '/'); return; } catch { await new Promise((r) => setTimeout(r, 200)); }
  }
  throw new Error('GUI-servern startade inte');
});
test.afterAll(() => server?.kill());

const tips = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tips-latest.json'), 'utf8'));
const leaguesWithMatches = new Set([...(tips.bestUpcoming || []), ...(tips.allCandidates || [])].map((t: any) => t.league));

test.describe('sök land eller liga', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(base + '/tips');
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + '/tips');
    await page.waitForSelector('#league-filters .filter-pill[data-group]');
  });

  test('land och liga hittas, ligaraden döljs under sökningen och kommer tillbaka med Escape', async ({ page }) => {
    test.skip(!leaguesWithMatches.has('LL'), 'La Liga saknar matcher just nu');
    const s = page.locator('#league-search');
    await s.fill('spa');
    await expect(page.locator('#league-results .is-country', { hasText: 'Spanien' })).toBeVisible();
    await expect(page.locator('#league-results [data-search-league="LL"]')).toBeVisible();
    await expect(page.locator('#league-filters')).toBeHidden();
    await s.press('Escape');
    await expect(s).toHaveValue('');
    await expect(page.locator('#league-filters')).toBeVisible();
    await expect(page.locator('#league-results')).toBeHidden();
  });

  test('flera ord måste alla träffa, versaler och accenter spelar ingen roll', async ({ page }) => {
    test.skip(!leaguesWithMatches.has('PL') || !leaguesWithMatches.has('CH'), 'engelska ligor saknar matcher');
    const s = page.locator('#league-search');
    await s.fill('ENGLAND premier');
    await expect(page.locator('#league-results [data-search-league="PL"]')).toBeVisible();
    await expect(page.locator('#league-results [data-search-league="CH"]')).toHaveCount(0);
    if (leaguesWithMatches.has('ED')) {
      await s.fill('nederlanderna');
      await expect(page.locator('#league-results .is-country', { hasText: 'Nederländerna' })).toBeVisible();
    }
  });

  test('ingen träff ger ett meddelande', async ({ page }) => {
    await page.locator('#league-search').fill('qqqzz');
    await expect(page.locator('#league-results')).toContainText('Inget land eller liga med matcher');
  });

  test('Enter väljer första träffen, klick på liga väljer ligan och fäller ut landet', async ({ page }) => {
    test.skip(!leaguesWithMatches.has('LL') || !leaguesWithMatches.has('EL1'), 'ligorna saknar matcher');
    const s = page.locator('#league-search');
    await s.fill('spanien');
    await s.press('Enter');
    await expect(s).toHaveValue('');
    await expect(page.locator('#league-sub .filter-pill.active')).toHaveAttribute('data-league', 'LL');
    expect(await page.evaluate(() => localStorage.getItem('betting.leagueFilter'))).toBe('LL');
    await s.fill('league one');
    await page.locator('#league-results [data-search-league="EL1"]').click();
    await expect(page.locator('#league-sub .filter-pill.active')).toHaveAttribute('data-league', 'EL1');
    await expect(page.locator('#league-filters .filter-pill.active')).toHaveAttribute('data-group', 'england');
  });
});

test.describe('favoritligor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(base + '/tips');
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + '/tips');
    await page.waitForSelector('#league-filters .filter-pill[data-group]');
  });

  test('stjärnan favoritmarkerar utan att välja, favoriten hamnar först och sparas', async ({ page }) => {
    const row = page.locator('#league-filters');
    const last = row.locator('.filter-pill').last();
    const key = await last.locator('.fav-star').getAttribute('data-fav');
    await last.locator('.fav-star').click();
    // Inte vald, bara favorit: andra knappen (efter Alla) är favoriten, sedan ett skiljestreck
    await expect(row.locator('.filter-pill.active')).toHaveAttribute('data-league', 'ALL');
    const second = row.locator('.filter-pill').nth(1);
    await expect(second).toHaveClass(/is-fav/);
    await expect(second.locator('.fav-star')).toHaveAttribute('data-fav', key!);
    await expect(second.locator('.fav-star')).toHaveAttribute('aria-pressed', 'true');
    await expect(row.locator('.fav-sep')).toHaveCount(1);
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('betting.favLeagues')))!)).toEqual([key]);
    // Finns kvar efter omladdning och går att ta bort
    await page.reload();
    await page.waitForSelector('#league-filters .filter-pill.is-fav');
    await row.locator('.filter-pill.is-fav .fav-star').click();
    await expect(row.locator('.filter-pill.is-fav')).toHaveCount(0);
    await expect(row.locator('.fav-sep')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('betting.favLeagues'))).toBe('[]');
  });

  test('en turnering inom ett land kan favoritmarkeras och får en egen knapp först', async ({ page }) => {
    test.skip(!leaguesWithMatches.has('PL') || !leaguesWithMatches.has('CH'), 'engelska ligor saknar matcher');
    await page.click('.filter-pill[data-group="england"]');
    await page.locator('#league-sub .filter-pill[data-league="CH"] .fav-star').click();
    const fav = page.locator('#league-filters .filter-pill').nth(1);
    await expect(fav).toHaveAttribute('data-league', 'CH');
    // Landet finns kvar bland övriga, underradens Championship är markerad
    await expect(page.locator('#league-filters .filter-pill[data-group="england"]')).toHaveCount(1);
    await expect(page.locator('#league-sub .filter-pill[data-league="CH"]')).toHaveClass(/is-fav/);
    await fav.click({ position: { x: (await fav.boundingBox())!.width - 12, y: 12 } });
    await expect(page.locator('#league-filters .filter-pill.active[data-league="CH"]')).toHaveCount(1);
  });
});

// Startelva: kräver hämtade elvor (npm run elvor)
const store = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'data', 'startelvor.json'), 'utf8')); } catch { return null; }
})();
const svsWithXi = (store?.matches || []).find((m: any) => m.lineup && m.keys.some((k: string) => k.startsWith('svs|')));

test.describe('startelva', () => {
  test('API: vy med 22 spelare, motståndare och jämförelser; okänd nyckel ger 404', async () => {
    test.skip(!svsWithXi, 'inga hämtade elvor');
    const key = svsWithXi.keys.find((k: string) => k.startsWith('svs|'));
    const v = await (await fetch(`${base}/api/startelva?${new URLSearchParams({ key })}`)).json();
    expect(v.ok).toBe(true);
    expect(Object.keys(v.players)).toHaveLength(22);
    expect(v.keyDuels.length).toBeGreaterThan(0);
    for (const k of v.keyDuels) expect(v.comparisons[k]).toBeTruthy();
    const miss = await fetch(`${base}/api/startelva?key=finns-inte`);
    expect(miss.status).toBe(404);
  });

  test('kupongkortet: plan, klick på spelare ger jämförelse med klartext och spindel, två valfria spelare', async ({ page }) => {
    test.skip(!svsWithXi, 'inga hämtade elvor');
    const key = svsWithXi.keys.find((k: string) => k.startsWith('svs|'));
    const [, product, , nr] = key.split('|');
    await page.goto(`${base}/${product}`);
    const card = page.locator('.st-match').nth(Number(nr) - 1);
    await card.locator('.btn-startelva').click();
    await expect(card.locator('.se-pitch .se-p')).toHaveCount(22);
    await expect(card.locator('.se-compare')).toBeVisible(); // första nyckelduellen visas direkt
    await card.locator('.se-p.se-home').first().click();
    await expect(card.locator('.se-summary').first()).toContainText('Kort sagt');
    await expect(card.locator('.se-compare .pc-radar .pc-area')).toHaveCount(2);
    // Omritning av kupongvyn stänger inte panelen
    await card.locator('.st-analyze').click();
    await expect(page.locator('.st-match').nth(Number(nr) - 1).locator('.se-pitch')).toBeVisible();
    // Fri jämförelse: två spelare i samma lag
    const c2 = page.locator('.st-match').nth(Number(nr) - 1);
    await c2.locator('.se-mode').click();
    await c2.locator('.se-p.se-home').nth(9).click();
    await c2.locator('.se-p.se-home').nth(10).click();
    await expect(c2.locator('.se-compare .se-summary')).toContainText('områden');
    await expect(c2.locator('.pc-radar polygon.pc-c-alt').first()).toBeVisible(); // samma lag: andra spelaren gul
  });
});

// Spelarkortet: klick på namn i Duellanalysen (Oddset) och i Startelva
const asTip = (tips.allCandidates || []).find((t: any) => t.league === 'AS' && Date.parse(t.kickoffUtc || t.date) > Date.now());

test.describe('spelarkort', () => {
  test('API: duellanalysen skickar alla stats per spelare och svenska namn på nyckeltalen', async () => {
    test.skip(!asTip, 'ingen kommande Allsvenskan-match');
    const qs = new URLSearchParams({ league: asTip.league, date: asTip.date, home: asTip.home, away: asTip.away });
    const m = await (await fetch(`${base}/api/matchup?${qs}`)).json();
    test.skip(!m.ok, 'ingen duellanalys för matchen');
    expect(m.statLabels.save_percentage).toBe('Räddningsprocent');
    const withStats = m.teams.home.xi.filter((p: any) => Object.keys(p.stats || {}).length > 10);
    expect(withStats.length).toBeGreaterThan(5);
    for (const p of withStats) expect(p.statsFrom).toBeTruthy();
  });

  test('Duellanalysen: målvakten mot ligan, mot motståndarens målvakt, valfri spelare och stäng', async ({ page }) => {
    test.skip(!asTip, 'ingen kommande Allsvenskan-match');
    await page.goto(base + '/tips');
    await page.waitForSelector('#league-filters .filter-pill[data-group]');
    await page.locator('#league-search').fill('allsvenskan');
    await page.locator('#league-results .filter-pill').first().click();
    // Listan fälls ut automatiskt när man väljer en liga; öppna bara om den är stängd
    if (!(await page.locator('#cand-wrap').evaluate((d) => (d as HTMLDetailsElement).open))) await page.locator('#cand-wrap > summary').click();
    const row = page.locator('.cand-row', { hasText: `${asTip.home} – ${asTip.away}` }).first();
    await row.locator('summary').click();
    const body = row.locator('.cand-body');
    await body.locator('.btn-matchup').click();
    await expect(body.locator('.mx-legend')).toContainText('mål+assist');
    const gk = body.locator('.mx-away .mx-line').first().locator('.mx-pl');
    test.skip(!(await gk.count()), 'bortalagets målvakt saknar statistik');
    await gk.click();
    const card = body.locator('.pc-card');
    await expect(card).toBeVisible();
    await expect(card.locator('.pc-summary')).toContainText('Jämfört med andra målvakter');
    await expect(card.locator('.pc-area')).toHaveCount(1);
    await expect(card.locator('.pc-ring-league')).toHaveCount(1);
    await expect(card.locator('.pc-cat', { hasText: 'Målvakt' })).toBeVisible();
    // Förslaget överst är hemmalagets målvakt
    await card.locator('.pc-chip').first().click();
    await expect(card.locator('.pc-area')).toHaveCount(2);
    await expect(card.locator('.pc-summary')).toContainText('områden i spindeln');
    await expect(card.locator('.pc-table thead th')).toHaveCount(3);
    // Valfri spelare från listan, sedan tillbaka till bara ligan och stäng
    const sel = card.locator('select[data-pc-vs-select]');
    await sel.selectOption((await sel.locator('option').nth(2).getAttribute('value'))!);
    await expect(card.locator('.pc-area')).toHaveCount(2);
    await card.locator('[data-pc-solo]').click();
    await expect(card.locator('.pc-area')).toHaveCount(1);
    await card.locator('.pc-close').click();
    await expect(body.locator('.pc-card')).toHaveCount(0);
  });

  test('Startelva: knappen öppnar spelarkortet med alla stats', async ({ page }) => {
    test.skip(!svsWithXi, 'inga hämtade elvor');
    const key = svsWithXi.keys.find((k: string) => k.startsWith('svs|'));
    const [, product, , nr] = key.split('|');
    await page.goto(`${base}/${product}`);
    const card = page.locator('.st-match').nth(Number(nr) - 1);
    await card.locator('.btn-startelva').click();
    await card.locator('.se-card-btn').first().click();
    await expect(card.locator('.pc-card')).toBeVisible();
    expect(await card.locator('.pc-table tbody tr:not(.pc-cat)').count()).toBeGreaterThan(10);
  });
});
