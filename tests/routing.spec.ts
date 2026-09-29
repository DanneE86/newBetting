import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Sidadresser i webben: /tips, /stryktipset, /europatipset (dold i menyn). Kor mot gui/server.mjs lokalt.
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

test('Europatipset finns inte i menyn men nås via /europatipset', async ({ page }) => {
  await page.goto(base + '/tips');
  await expect(page.locator('.view-tab')).toHaveCount(3);
  await expect(page.locator('.view-tabs')).not.toContainText('Europatipset');
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
  await expect(page).toHaveURL(base + '/europatipset/reducera');
});

test('Stryktipset B: egna spikar genererar kupong A och B', async ({ page }) => {
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.click('.view-tab[data-view="stryktipset-b"]');
  await expect(page).toHaveURL(base + '/stryktipset/b');
  await expect(page.locator('#stryktips-view h2')).toContainText('Stryktipset B', { timeout: 30_000 });
  const rows = page.locator('.sb-row');
  await expect(rows).toHaveCount(13);
  // Spik X på match 1 (båda), spik 1 på match 4 bara i kupong B
  await rows.nth(0).locator('.sb-sign[data-sign="X"]').click();
  await rows.nth(3).locator('.sb-sign[data-sign="1"]').click();
  await rows.nth(3).locator('.sb-scope button[data-scope="B"]').click();
  await page.click('#sb-generate');
  const table = page.locator('.sb-table tbody tr');
  await expect(table).toHaveCount(13);
  await expect(table.nth(0).locator('td').nth(1)).toHaveText('🔒 X');
  await expect(table.nth(0).locator('td').nth(2)).toHaveText('🔒 X');
  await expect(table.nth(3).locator('td').nth(2)).toHaveText('🔒 1');
  await expect(table.nth(3).locator('td').nth(1)).not.toContainText('🔒');
  await expect(page.locator('.sb-coupon h3').first()).toContainText(/Kupong A \d+ rader/);
  // Spikarna ligger kvar efter omladdning
  await page.reload();
  await expect(page.locator('.sb-row').nth(0).locator('.sb-sign.on')).toHaveText(/X/, { timeout: 30_000 });
  // Stryktipset A heter nu så
  await page.click('.view-tab[data-view="stryktipset"]');
  await expect(page.locator('#stryktips-view h2')).toContainText('Stryktipset A');
});

test('Europatipset B nås via /europatipset/b men finns inte i menyn', async ({ page }) => {
  await page.goto(base + '/europatipset/b');
  await expect(page.locator('#stryktips-view h2')).toContainText('Europatipset B', { timeout: 30_000 });
  await expect(page.locator('.sb-row')).toHaveCount(13);
  await expect(page.locator('.view-tab.active')).toHaveCount(0);
});
