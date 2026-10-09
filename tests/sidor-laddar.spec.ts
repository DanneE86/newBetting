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

/** Stryktipset: Generera kräver att alla 13 matcher är låsta med hänglåset. */
async function lasAlla(page: any) {
  const seals = page.locator('#stryktips-view .sb-seal');
  const n = await seals.count();
  for (let i = 0; i < n; i++) if (!/\bon\b/.test((await seals.nth(i).getAttribute('class')) || '')) await seals.nth(i).click();
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

// Kupongerna räknas i en bakgrundstråd (stryk-worker.js, 2026-10-05): sidan visas direkt och går att använda medan
// motorn räknar, och räkningen görs en gång (förut två gånger på huvudtråden, ~80 s med låst sida).
test('Stryktipset: matcherna syns direkt medan kupongerna räknas i bakgrunden, sedan kupong A–F', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', (w: any) => workers.push(w.url()));
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.st-match')).toHaveCount(13, { timeout: 10_000 });
  await expect(view.locator('.sb-result [role=status]')).toContainText('Räknar fram kupongerna', { timeout: 5_000 });
  await expect(page.locator('#sb-generate')).toBeDisabled();
  // Huvudtråden är fri: ett anrop i sidan svarar direkt fast motorn räknar
  const t = Date.now();
  await page.evaluate(() => 1);
  expect(Date.now() - t).toBeLessThan(1_000);
  await expect(view.locator('.sb-coupons .sb-coupon, .sb-coupons > *').first()).toBeVisible({ timeout: 120_000 });
  await expect(view.locator('.sb-result [role=status]')).toHaveCount(0);
  await expect(page.locator('#sb-generate')).toBeEnabled();
  expect(workers.filter((u) => u.includes('/stryk-worker.js')), 'en räkning vid laddning').toHaveLength(1);
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: kupongtabellen markerar tecken som A, B och C brukar ha fel på (⚠), inga JS-fel', async ({ page }) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
  test.skip(!data.missProfileSystems, 'ingen missprofil per system i data/stryktipset.json');
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.sb-row')).toHaveCount(13, { timeout: 30_000 });
  await lasAlla(page);
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
  await lasAlla(page);
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

test('Stryktipset: hänglås per match – låses bara vid 100 %, låst går inte att ändra, Generera kräver alla låsta', async ({ page }) => {
  test.setTimeout(300_000);
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  const rows = view.locator('.sb-row');
  await expect(rows).toHaveCount(13, { timeout: 30_000 });
  await expect(view.locator('.sb-seal')).toHaveCount(13);
  await expect(page.locator('#sb-generate')).toBeEnabled({ timeout: 120_000 });
  const inViewport = (el: any) => el.evaluate((n: Element) => { const r = n.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });

  // Inget låst: Generera ger fel och scrollar till match 1
  await page.locator('#sb-generate').click();
  await expect(view.locator('.sb-gen-err')).toContainText('Match 1 är inte låst');
  await expect(rows.nth(0)).toHaveClass(/is-error/);
  await expect.poll(() => inViewport(rows.nth(0))).toBe(true);

  // D/E/F % som inte blir 100: låset vägrar
  const r3 = rows.nth(2);
  if (!(await r3.locator('.sb-defall.is-on').count())) await r3.locator('[data-defall-toggle]').click();
  const d = r3.locator('.sb-defall-edit[data-defall-sys="D"] input');
  for (let i = 0; i < 3; i++) { await d.nth(i).fill('50'); await d.nth(i).dispatchEvent('change'); }
  await r3.locator('.sb-seal').click();
  await expect(r3.locator('.sb-row-err')).toContainText('Kan inte låsa');
  await expect(r3.locator('.sb-seal')).not.toHaveClass(/\bon\b/);

  // Alla utom match 3 låsta: Generera säger att match 3 stämmer inte och scrollar dit
  await lasAlla(page);
  for (let i = 0; i < 13; i++) if (i !== 2) await expect(rows.nth(i).locator('.sb-seal')).toHaveClass(/\bon\b/);
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('#sb-generate').click();
  await expect(view.locator('.sb-gen-err')).toContainText('Match 3 stämmer inte');
  await expect.poll(() => inViewport(r3)).toBe(true);

  // Rätta till 100 % och lås: allt i raden spärras
  const vals = ['40', '30', '30'];
  for (let i = 0; i < 3; i++) { await d.nth(i).fill(vals[i]); await d.nth(i).dispatchEvent('change'); }
  for (const sys of ['E', 'F']) {
    const inp = r3.locator(`.sb-defall-edit[data-defall-sys="${sys}"] input`);
    for (let i = 0; i < 3; i++) { await inp.nth(i).fill(vals[i]); await inp.nth(i).dispatchEvent('change'); }
  }
  await r3.locator('.sb-seal').click();
  await expect(r3).toHaveClass(/is-sealed/);
  for (const s of ['1', 'X', '2']) await expect(r3.locator(`.sb-sign[data-sign="${s}"]`)).toBeDisabled();
  await expect(r3.locator('.sb-defall input').first()).toBeDisabled();
  await expect(r3.locator('[data-defall-toggle]')).toBeDisabled();
  await expect(view.locator('.sb-seal-count')).toContainText('13/13');

  // Låsa upp: går att ändra igen
  await r3.locator('.sb-seal').click();
  await expect(r3).not.toHaveClass(/is-sealed/);
  await expect(r3.locator('.sb-sign[data-sign="1"]')).toBeEnabled();
  await r3.locator('.sb-seal').click();

  // Allt låst: Generera kör
  await page.locator('#sb-generate').click();
  await expect(view.locator('.sb-gen-err')).toHaveCount(0);
  await expect(page.locator('#sb-generate')).toBeDisabled();
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Europatipset har inget hänglås', async ({ page }) => {
  await oppna(page, 'europatipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.sb-row')).toHaveCount(13, { timeout: 30_000 });
  await expect(view.locator('.sb-seal')).toHaveCount(0);
});

test('Stryktipset: panelen Risklag denna säsong och etiketten risklag på flaggade lag', async ({ page }) => {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
  const p = data.products.find((x: any) => x.product === 'stryktipset');
  const lista = data.streckFlopSeason || [];
  test.skip(!p || !lista.length, 'ingen kupong eller säsongslista i data/stryktipset.json');
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.st-matches')).toBeVisible({ timeout: 30_000 });
  const panel = view.locator('.rk-panel');
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('open');
  await panel.locator('> summary').click();
  await expect(panel).toHaveAttribute('open', '');
  await expect(panel).toContainText('Kort sagt');
  // En rad per risklag, med en ruta per match som streckfavorit
  const risk = lista.filter((r: any) => r.risk);
  await expect(panel.locator('.rk-list').first().locator('.rk-row.is-risk')).toHaveCount(risk.length);
  if (risk.length) await expect(panel.locator('.rk-row.is-risk').first().locator('.rk-dot')).toHaveCount(risk[0].season.last.length);
  // Flaggade lag i kupongen får etiketten i kravlistan; i matchkorten när sektionen är utfälld
  const flaggade = p.events.reduce((n: number, e: any) => n + (e.streckFlop?.home ? 1 : 0) + (e.streckFlop?.away ? 1 : 0), 0);
  await expect(view.locator('.sb-row .risk-tag')).toHaveCount(flaggade);
  await view.locator('.st-matches > summary').click();
  await expect(view.locator('.st-match h3 .risk-tag')).toHaveCount(flaggade);
  expect(fel, fel.join('\n')).toEqual([]);
});
