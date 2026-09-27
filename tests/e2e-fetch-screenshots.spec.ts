import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { writeTipsReport } from '../scripts/build-tips-report';

const root = path.resolve(__dirname, '..');
const shotDir = path.join(root, 'test-results', 'screenshots');

function ensureShotDir() {
  fs.mkdirSync(shotDir, { recursive: true });
}

test.describe('E2E data fetch + screenshots', () => {
  test.beforeAll(() => {
    ensureShotDir();
  });

  test('hämtar data (sync) och bygger tipsrapport', async () => {
    // Full sync kan ta tid; timeout redan 120s i config
    execFileSync('npm', ['run', 'sync'], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      timeout: 180_000,
    });

    expect(fs.existsSync(path.join(root, 'data', 'betting-store.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(root, 'data', 'tips-latest.json'))).toBeTruthy();

    const reportPath = writeTipsReport();
    expect(fs.existsSync(reportPath)).toBeTruthy();
  });

  test('screenshot: lokal tipsrapport', async ({ page }) => {
    // Om sync-steget skippas i isolerad körning: bygg från befintlig data
    if (!fs.existsSync(path.join(root, 'data', 'reports', 'tips-report.html'))) {
      writeTipsReport();
    }
    const reportPath = path.join(root, 'data', 'reports', 'tips-report.html');
    expect(fs.existsSync(reportPath)).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pathToFileURL(reportPath).href, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Betting tips');

    const full = path.join(shotDir, '01-tips-report-full.png');
    const table = path.join(shotDir, '02-tips-table.png');
    await page.screenshot({ path: full, fullPage: true });
    await page.locator('table').first().screenshot({ path: table });

    expect(fs.statSync(full).size).toBeGreaterThan(10_000);
    expect(fs.statSync(table).size).toBeGreaterThan(2_000);
  });

  test('screenshot: Understat EPL (datakälla xG)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('https://understat.com/league/EPL/2026', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.waitForTimeout(1500);
    const shot = path.join(shotDir, '03-understat-epl.png');
    await page.screenshot({ path: shot, fullPage: false });
    expect(fs.statSync(shot).size).toBeGreaterThan(5_000);
  });

  test('screenshot: openfootball PL fixtures raw exists + tip meta', async ({ page }) => {
    const ofPath = path.join(root, 'data', 'open', 'pl_2026-27.json');
    expect(fs.existsSync(ofPath)).toBeTruthy();

    // Mini HTML som visar att openfootball-filen finns (för screenshot-bevis)
    const metaHtml = path.join(root, 'data', 'reports', 'sources-meta.html');
    const store = JSON.parse(
      fs.readFileSync(path.join(root, 'data', 'betting-store.json'), 'utf8').replace(/^\uFEFF/, '')
    );
    const fplOk = fs.existsSync(path.join(root, 'data', 'open', 'fpl_availability.json'));
    const xgOk = fs.existsSync(path.join(root, 'data', 'open', 'understat_EPL_2026_xg.json'));
    fs.mkdirSync(path.dirname(metaHtml), { recursive: true });
    fs.writeFileSync(
      metaHtml,
      `<!doctype html><html><head><meta charset="utf-8"><title>Sources</title>
      <style>body{font-family:Segoe UI,sans-serif;background:#111;color:#eee;padding:40px}
      li{margin:8px 0} .ok{color:#3dd68c}</style></head><body>
      <h1>Datakällor — sync status</h1>
      <ul>
        <li class="ok">Store matcher: ${store.meta.matchCount}</li>
        <li class="${xgOk ? 'ok' : ''}">Understat xG: ${xgOk}</li>
        <li class="${fplOk ? 'ok' : ''}">FPL availability: ${fplOk}</li>
        <li class="ok">openfootball PL: ${fs.existsSync(ofPath)}</li>
        <li>Understat xG loaded meta: ${store.meta?.understatXg?.loaded}</li>
        <li>FPL loaded meta: ${store.meta?.fplAvailability?.loaded}</li>
      </ul></body></html>`,
      'utf8'
    );

    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto(pathToFileURL(metaHtml).href);
    const shot = path.join(shotDir, '04-sources-meta.png');
    await page.screenshot({ path: shot, fullPage: true });
    expect(fs.statSync(shot).size).toBeGreaterThan(2_000);
  });
});
