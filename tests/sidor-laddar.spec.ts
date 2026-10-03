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

test('Stryktipset: kupongtabellen markerar tecken som A, B och C brukar ha fel på (⚠), inga JS-fel', async ({ page }) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
  test.skip(!data.missProfileSystems, 'ingen missprofil per system i data/stryktipset.json');
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.sb-row')).toHaveCount(13, { timeout: 30_000 });
  await page.locator('#sb-generate').click();
  const table = view.locator('table.sb-table');
  await expect(table).toBeVisible({ timeout: 60_000 });
  const legend = view.locator('.sb-miss-legend');
  await expect(legend).toContainText('brukar ha fel på');
  // Antalet i förklaringen = antalet markeringar i tabellen
  const n = Number((await legend.textContent())!.match(/(\d+) st i omgången/)![1]);
  await expect(table.locator('.st-sysmiss')).toHaveCount(n);
  if (n) await expect(table.locator('.st-sysmiss').first()).toHaveAttribute('title', /missade \d+ av \d+ gånger i bakkörningen/);
  // Risklag i B och C (2026-10-03): markering när kupongen tippat risklagets seger utan helgardering, aldrig i A
  const p = data.products.find((x: any) => x.product === 'stryktipset');
  const rows = table.locator('tbody tr');
  for (let i = 0; i < p.events.length; i++) {
    const e = p.events[i];
    const tds = rows.nth(i).locator('td');
    await expect(tds.nth(1).locator('.sb-risk'), `match ${i + 1} A`).toHaveCount(0);
    for (const [col, sys] of [[2, 'B'], [3, 'C']] as const) {
      const signs = ((await tds.nth(col).locator('.st-tip').textContent()) || '').replace(/[^1X2]/g, '');
      const want = !!e.streckFlop?.flagged && signs.length < 3 && ((e.streckFlop.home && signs.includes('1')) || (e.streckFlop.away && signs.includes('2')));
      await expect(tds.nth(col).locator('.sb-risk'), `match ${i + 1} ${sys} ${signs}`).toHaveCount(want ? 1 : 0);
    }
  }
  await table.screenshot({ path: path.join(root, 'test-results', 'stryktips-sysmiss.png') });
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: krav på risklagets seger i B ger markeringen ⚠ risklag i B men aldrig i A', async ({ page }) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
  const p = data.products.find((x: any) => x.product === 'stryktipset');
  const e = p?.events.find((x: any) => x.streckFlop?.flagged);
  test.skip(!e, 'inget risklag i omgången');
  const sign = e.streckFlop.home ? '1' : '2';
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  const row = view.locator(`.sb-row[data-ev="${e.eventNumber}"]`);
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.locator(`.sb-sign[data-sign="${sign}"]`).click();
  await row.locator('.sb-scope [data-scope="B"]').click();
  await page.locator('#sb-generate').click();
  const tr = view.locator('table.sb-table tbody tr').nth(p.events.indexOf(e));
  await expect(tr.locator('td').nth(2).locator('.st-tip'), 'B har kravet').toContainText(sign, { timeout: 60_000 });
  const mark = tr.locator('td').nth(2).locator('.sb-risk');
  await expect(mark).toHaveCount(1);
  await expect(mark).toHaveAttribute('title', new RegExp(`Kupong B har tippat ${sign} på risklaget`));
  await expect(tr.locator('td').nth(1).locator('.sb-risk'), 'aldrig i A').toHaveCount(0);
  await expect(view.locator('.sb-risk-legend')).toContainText('risklag');
  await view.locator('table.sb-table').screenshot({ path: path.join(root, 'test-results', 'stryktips-risk.png') });
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: panelen Risklag denna säsong och etiketten risklag på flaggade lag', async ({ page }) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
  const p = data.products.find((x: any) => x.product === 'stryktipset');
  const lista = data.streckFlopSeason || [];
  test.skip(!p || !lista.length, 'ingen kupong eller säsongslista i data/stryktipset.json');
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.st-match')).toHaveCount(13, { timeout: 30_000 });
  const panel = view.locator('.rk-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('open', '');
  await expect(panel).toContainText('Kort sagt');
  // En rad per risklag, med en ruta per match som streckfavorit
  const risk = lista.filter((r: any) => r.risk);
  await expect(panel.locator('.rk-list').first().locator('.rk-row.is-risk')).toHaveCount(risk.length);
  if (risk.length) await expect(panel.locator('.rk-row.is-risk').first().locator('.rk-dot')).toHaveCount(risk[0].season.last.length);
  // Flaggade lag i kupongen får etiketten i både kravlistan och matchkortet
  const flaggade = p.events.reduce((n: number, e: any) => n + (e.streckFlop?.home ? 1 : 0) + (e.streckFlop?.away ? 1 : 0), 0);
  await expect(view.locator('.sb-row .risk-tag')).toHaveCount(flaggade);
  await expect(view.locator('.st-match h3 .risk-tag')).toHaveCount(flaggade);
  expect(fel, fel.join('\n')).toEqual([]);
});
