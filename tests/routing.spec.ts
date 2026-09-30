import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Sidadresser i webben: /tips, /stryktipset, /europatipset. Kor mot gui/server.mjs lokalt.
const root = path.resolve(__dirname, '..');
const port = 4100 + Math.floor(Math.random() * 80);
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

const activeTab = (page: any) => page.locator('.view-tab.active').getAttribute('data-view');

test('flikarna ger /tips och /stryktipset, bakåt fungerar', async ({ page }) => {
  await page.goto(base + '/');
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '/');
  await expect(page).toHaveURL(base + '/tips');
  await page.click('.view-tab[data-view="stryktipset"]');
  await expect(page).toHaveURL(base + '/stryktipset');
  expect(await activeTab(page)).toBe('stryktipset');
  await expect(page.locator('#stryktips-view')).toBeVisible();
  await page.click('.view-tab[data-view="tips"]');
  await expect(page).toHaveURL(base + '/tips');
  await expect(page.locator('#stryktips-view')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(base + '/stryktipset');
  await expect(page.locator('#stryktips-view')).toBeVisible();
});

test('Europatipset finns i menyn och nås via /europatipset', async ({ page }) => {
  await page.goto(base + '/tips');
  await expect(page.locator('.view-tab')).toHaveCount(3);
  await page.click('.view-tab[data-view="europatipset"]');
  await expect(page).toHaveURL(base + '/europatipset');
  await expect(page.locator('#stryktips-view h2')).toContainText('Europatipset', { timeout: 30_000 });
  await page.goto(base + '/stryktipset');
  await expect(page.locator('#stryktips-view')).not.toContainText('Europatipset omgång');
  await page.goto(base + '/europatipset');
  await expect(page.locator('#stryktips-view')).toBeVisible();
  await expect(page.locator('#stryktips-view h2')).toContainText('Europatipset', { timeout: 30_000 });
});

test('gamla #stryktips-länkar skickas till de nya adresserna', async ({ page }) => {
  await page.goto(base + '/#stryktips/backtest');
  await expect(page).toHaveURL(base + '/stryktipset/backtest');
  await expect(page.locator('#stryktips-view')).toBeVisible();
  await page.goto(base + '/#stryktips/europatipset/reducera');
  await expect(page).toHaveURL(base + '/europatipset');
});

test('Stryktipset: en sida, egna krav genererar kupong A och B', async ({ page }) => {
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.click('.view-tab[data-view="stryktipset"]');
  await expect(page).toHaveURL(base + '/stryktipset');
  await expect(page.locator('#stryktips-view h2')).toContainText('Stryktipset', { timeout: 30_000 });
  const rows = page.locator('.sb-row');
  await expect(rows).toHaveCount(13);
  // Kupongen genereras direkt, utan krav
  await expect(page.locator('.sb-table tbody tr')).toHaveCount(13);
  // A och B skiljer sig: högst 2 identiska spikar, aldrig samma halvgardering
  const pairs = await page.locator('.sb-table tbody tr').evaluateAll((trs) => trs.map((tr) => [tr.children[2].textContent!.trim(), tr.children[3].textContent!.trim()]));
  expect(pairs.filter(([a, b]) => a === b && a.split('+').length === 1).length).toBeLessThanOrEqual(2);
  expect(pairs.filter(([a, b]) => a === b && a.split('+').length === 2).length).toBe(0);
  // Klick på turmatch fäller ut en förklaring i enkla ord
  const turBtn = page.locator('.sb-list .tur-btn').first();
  if (await turBtn.count()) {
    await turBtn.click();
    await expect(page.locator('.sb-list .tur-explain')).toContainText('Varför är det en turmatch?');
    await expect(page.locator('.sb-list .tur-explain .tur-dots span')).toHaveCount(10);
    await page.locator('.sb-list .tur-btn').first().click();
    await expect(page.locator('.sb-list .tur-explain')).toHaveCount(0);
  }
  await expect(page.locator('.st-backtest').first()).toBeAttached();
  // Spik X på match 1 (båda), spik 1 på match 4 bara i kupong B
  await rows.nth(0).locator('.sb-sign[data-sign="X"]').click();
  await rows.nth(3).locator('.sb-sign[data-sign="1"]').click();
  await rows.nth(3).locator('.sb-scope button[data-scope="B"]').click();
  // Halvgardering 1X på match 2 (båda), helgardering 1X2 på match 6 bara i A
  await rows.nth(1).locator('.sb-sign[data-sign="1"]').click();
  await rows.nth(1).locator('.sb-sign[data-sign="X"]').click();
  for (const s of ['1', 'X', '2']) await rows.nth(5).locator(`.sb-sign[data-sign="${s}"]`).click();
  await rows.nth(5).locator('.sb-scope button[data-scope="A"]').click();
  await expect(rows.nth(1).locator('.sb-krav-lbl')).toHaveText('1X');
  await page.click('#sb-generate');
  const table = page.locator('.sb-table tbody tr');
  await expect(table).toHaveCount(13);
  await expect(table.nth(0).locator('td').nth(1)).toHaveText('🔒 X');
  await expect(table.nth(0).locator('td').nth(2)).toHaveText('🔒 X');
  await expect(table.nth(3).locator('td').nth(2)).toHaveText('🔒 1');
  await expect(table.nth(3).locator('td').nth(1)).not.toContainText('🔒');
  await expect(table.nth(1).locator('td').nth(1)).toHaveText('🔒 1 + X');
  await expect(table.nth(1).locator('td').nth(2)).toHaveText('🔒 1 + X');
  await expect(table.nth(5).locator('td').nth(1)).toHaveText('🔒 1 + X + 2');
  await expect(table.nth(5).locator('td').nth(2)).not.toContainText('🔒');
  await expect(page.locator('.sb-coupon h3').first()).toContainText(/Kupong A \d+ rader/);
  await expect(page.locator('.sb-coupon h3').nth(1)).toContainText(/Kupong B \d+ rader/);
  await expect(page.locator('.sb-coupon').nth(1)).toContainText('minst 30 000 kr, inget tak');
  // Kupong C: eget system 700-850 kr, kraven gäller inte där (inga lås i C-kolumnen)
  const cHead = await page.locator('.sb-coupon h3').nth(2).textContent();
  const cCost = Number(cHead!.match(/(\d[\d\s]*) kr/)![1].replace(/\s/g, ''));
  expect(cCost).toBeGreaterThanOrEqual(700);
  expect(cCost).toBeLessThanOrEqual(850);
  await expect(page.locator('.sb-coupon').nth(2)).toContainText('minst 30 000 kr');
  await expect(page.locator('.sb-coupon').nth(2)).toContainText('gäller inte C');
  await expect(table.nth(0).locator('td').nth(3)).not.toContainText('🔒');
  // Turmatcher och vanliga missar visas
  await expect(page.locator('.st-miss')).toContainText('Vanliga missar');
  await expect(page.locator('.st-miss-table tbody tr').first()).toBeVisible();
  // Matchkorten visar B-kupongens tecken (även när hämtningens system är delat)
  await expect(page.locator('.st-match .st-tip.sysb').first()).toBeVisible();
  // Turknapparna skriver aldrig över ett krav som gäller A
  const turAdd = page.locator('.sb-tur-add');
  if (await turAdd.count()) {
    const nr = await turAdd.first().getAttribute('data-ev');
    const row = page.locator(`.sb-row[data-ev="${nr}"]`);
    await row.locator('.sb-sign[data-sign="X"]').click();
    await expect(page.locator(`.sb-tur-add[data-ev="${nr}"]`)).toHaveCount(0);
    await page.locator('.sb-tur-all').click().catch(() => {});
    await expect(row.locator('.sb-scope button[data-scope="both"]')).toHaveAttribute('aria-pressed', 'true');
    await row.locator('.sb-sign[data-sign="X"]').click();
  }
  // Spikarna ligger kvar efter omladdning
  await page.reload();
  await expect(page.locator('.sb-row').nth(0).locator('.sb-sign.on')).toHaveText(/X/, { timeout: 30_000 });
  // Gamla adressen /stryktipset/b går till samma sida
  await page.goto(base + '/stryktipset/b');
  await expect(page).toHaveURL(base + '/stryktipset');
});

test('Europatipset har samma sida via /europatipset', async ({ page }) => {
  await page.goto(base + '/europatipset/b');
  await expect(page).toHaveURL(base + '/europatipset');
  await expect(page.locator('#stryktips-view h2')).toContainText('Europatipset', { timeout: 30_000 });
  await expect(page.locator('.sb-row')).toHaveCount(13);
  await expect(page.locator('.sb-coupon')).toHaveCount(3); // A, B och C
  await expect(page.locator('.view-tab.active')).toHaveAttribute('data-view', 'europatipset');
  // Krav bara i A (1X på sista matchen): B väljer aldrig exakt samma tecken där
  await page.evaluate(() => localStorage.clear());
  const last = page.locator('.sb-row').nth(12);
  await last.locator('.sb-sign[data-sign="1"]').click();
  await last.locator('.sb-sign[data-sign="X"]').click();
  await last.locator('.sb-scope button[data-scope="A"]').click();
  await page.click('#sb-generate');
  const row = page.locator('.sb-table tbody tr').nth(12);
  await expect(row.locator('td').nth(1)).toHaveText('🔒 1 + X');
  await expect(row.locator('td').nth(2)).not.toHaveText('1 + X');
  await page.evaluate(() => localStorage.clear());
});
