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
  await expect(page.locator('.view-tab')).toHaveCount(2);
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
