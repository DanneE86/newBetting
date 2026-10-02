import { test, expect } from '@playwright/test';
import { spawn, spawnSync, ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Röktest: Tips, Stryktipset och Europatipset ska ladda utan JS-fel och visa sitt innehåll.
// Fångar t.ex. en trasig kommentar ("/ text" i stället för "// text") som stoppar hela app.js.
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'gui', 'public');
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

test('alla GUI-skript går att tolka som ES-moduler', () => {
  // Kopieras till .mjs: "node --check x.js" kan släppa igenom fel som webbläsaren stoppar på
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gui-syntax-'));
  const files = fs.readdirSync(pub).filter((f) => f.endsWith('.js'));
  expect(files).toContain('app.js');
  const fel: string[] = [];
  for (const f of files) {
    const kopia = path.join(tmp, f.replace(/\.js$/, '.mjs'));
    fs.copyFileSync(path.join(pub, f), kopia);
    const r = spawnSync(process.execPath, ['--check', kopia], { encoding: 'utf8' });
    if (r.status !== 0) fel.push(`${f}: ${r.stderr.split('\n').slice(0, 3).join(' ')}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  expect(fel, fel.join('\n')).toEqual([]);
});

/** Öppnar en vy och samlar JS-fel och misslyckade anrop mot den egna servern. */
async function oppna(page: any, vy: string) {
  const fel: string[] = [];
  page.on('pageerror', (e: Error) => fel.push(`JS-fel: ${e.message}`));
  page.on('response', (r: any) => { if (r.url().startsWith(base) && r.status() >= 400) fel.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(`${base}/${vy}`);
  return fel;
}

test('Tips: tipskort med avsparkstid, inga JS-fel', async ({ page }) => {
  const fel = await oppna(page, 'tips');
  const tips = page.locator('#tips .tip');
  await expect(tips.first()).toBeVisible({ timeout: 30_000 });
  // Laddningsskelettet ska vara borta (statusraden har en dold "Hämtar tips…" som inte räknas)
  await expect(page.locator('#tips')).not.toContainText('Hämtar tips');
  expect(await page.locator('#status-bar').innerText()).not.toContain('Hämtar tips');
  expect(await tips.count()).toBeGreaterThan(0);
  // Varje tips har match, liga och avsparkstid
  const forsta = tips.first();
  await expect(forsta.locator('.match')).not.toBeEmpty();
  await expect(forsta.locator('.league')).not.toBeEmpty();
  await expect(forsta.locator('.date')).not.toBeEmpty();
  await expect(page.locator('#league-search')).toBeVisible();
  await expect(page.locator('#value-filter')).toBeVisible();
  await expect(page.locator('#cand-wrap')).toBeVisible();
  expect(fel, fel.join('\n')).toEqual([]);
});

for (const [vy, namn] of [['stryktipset', 'Stryktipset'], ['europatipset', 'Europatipset']] as const) {
  test(`${namn}: 13 matcher med sannolikheter och kupongbyggare, inga JS-fel`, async ({ page }) => {
    const fel = await oppna(page, vy);
    const view = page.locator('#stryktips-view');
    await expect(view).toBeVisible();
    await expect(view.locator('h2').first()).toContainText(namn, { timeout: 30_000 });
    await expect(view.locator('.st-match')).toHaveCount(13, { timeout: 30_000 });
    await expect(view.locator('.st-match').first().locator('.st-team').first()).not.toBeEmpty();
    expect(await view.locator('.st-prob').count()).toBeGreaterThanOrEqual(39);
    await expect(view.locator('.sb-row')).toHaveCount(13);
    await expect(page.locator('#sb-generate')).toBeVisible();
    await expect(view).not.toContainText('Hämtar');
    expect(fel, fel.join('\n')).toEqual([]);
  });
}
