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

// Sidan startar i läget Skrällar: testerna här gäller läget Alla (om testet inte själv valt annat)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (localStorage.getItem('betting.upsetOnly') == null) localStorage.setItem('betting.upsetOnly', '0'); });
});
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

/** Stryktipset: lås alla 13 matcher med hänglåset. */
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

for (const vy of ['stryktipset', 'europatipset'] as const) {
  test(`${vy}: Elo bredvid lagnamnen, starkare laget grönt med +skillnad`, async ({ page }) => {
    const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8'));
    const p = data.products.find((x: any) => x.product === vy);
    const medElo = (p?.events ?? []).filter((e: any) => (e.teamElo || e.clubElo)?.home);
    test.skip(!medElo.length, 'ingen match med Elo i omgången');
    const fel = await oppna(page, vy);
    const view = page.locator('#stryktips-view');
    await expect(view.locator('.st-match')).toHaveCount(13, { timeout: 30_000 });
    const e = medElo[0];
    const x = e.teamElo || e.clubElo;
    const kort = view.locator(`.st-match .st-num:text-is("${e.eventNumber}")`).locator('xpath=ancestor::article');
    const taggar = kort.locator('.st-title h3 .team-elo');
    await expect(taggar).toHaveCount(2);
    await expect(taggar.nth(0)).toHaveText(new RegExp(`^Elo ${Math.round(x.home)}( \\+\\d+)?$`));
    await expect(taggar.nth(1)).toHaveText(new RegExp(`^Elo ${Math.round(x.away)}( \\+\\d+)?$`));
    await expect(taggar.nth(0)).toHaveAttribute('title', /Elo ger 1 \d+ % · X \d+ % · 2 \d+ %/);
    const diff = Math.round(x.home) - Math.round(x.away);
    if (diff !== 0) {
      await expect(kort.locator('.st-title .team-elo.is-stronger')).toHaveCount(1);
      await expect(taggar.nth(diff > 0 ? 0 : 1)).toHaveClass(/is-stronger/);
      await expect(kort.locator('.st-title .team-elo.is-stronger .elo-diff')).toHaveText(`+${Math.abs(diff)}`);
    }
    expect(await view.locator('.st-match .team-elo').count()).toBe(2 * medElo.length);
    expect(fel, fel.join('\n')).toEqual([]);
  });
}

// Kupongerna räknas i en bakgrundstråd (stryk-worker.js, 2026-10-05): sidan visas direkt och går att använda medan
// motorn räknar, och räkningen görs en gång (förut två gånger på huvudtråden, ~80 s med låst sida).
test('Stryktipset: matcherna syns direkt, kupongerna räknas i bakgrunden, sedan kupong A', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', (w: any) => workers.push(w.url()));
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.st-match')).toHaveCount(13, { timeout: 10_000 });
  // Filkupongerna (2026-10-11) räknas på under en sekund – statusraden "Räknar fram kupongerna" hinner ofta försvinna
  // Huvudtråden är fri: ett anrop i sidan svarar direkt fast motorn räknar
  const t = Date.now();
  await page.evaluate(() => 1);
  expect(Date.now() - t).toBeLessThan(1_000);
  await expect(view.locator('.sb-coupons .sb-coupon, .sb-coupons > *').first()).toBeVisible({ timeout: 120_000 });
  await expect(view.locator('.sb-result [role=status]')).toHaveCount(0);
  await expect(page.locator('#sb-generate')).toBeEnabled();
  expect(workers.filter((u) => u.includes('/stryk-worker.js')), 'en räkning vid laddning').toHaveLength(1);
  await expect(view.locator('.sb-coupon'), 'bara kupong A (2026-10-24)').toHaveCount(1);
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: kupongtabellen markerar tecken som A brukar ha fel på (⚠), inga JS-fel', async ({ page }) => {
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
  // Risklag (2026-10-03, i A sedan 2026-10-24): markering när kupongen tippat risklagets seger utan helgardering
  const p = data.products.find((x: any) => x.product === 'stryktipset');
  const rows = table.locator('tbody tr');
  for (let i = 0; i < p.events.length; i++) {
    const e = p.events[i];
    const td = rows.nth(i).locator('td').nth(1);
    const signs = ((await td.locator('.st-tip').textContent()) || '').replace(/[^1X2]/g, '');
    const want = !!e.streckFlop?.flagged && signs.length < 3 && ((e.streckFlop.home && signs.includes('1')) || (e.streckFlop.away && signs.includes('2')));
    await expect(td.locator('.sb-risk'), `match ${i + 1} A ${signs}`).toHaveCount(want ? 1 : 0);
  }
  await table.screenshot({ path: path.join(root, 'test-results', 'stryktips-sysmiss.png') });
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: krav på risklagets seger ger markeringen ⚠ risklag i kupong A', async ({ page }) => {
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
  await lasAlla(page);
  await page.locator('#sb-generate').click();
  const tr = view.locator('table.sb-table tbody tr').nth(p.events.indexOf(e));
  await expect(tr.locator('td').nth(1).locator('.st-tip'), 'A har kravet').toContainText(sign, { timeout: 60_000 });
  const mark = tr.locator('td').nth(1).locator('.sb-risk');
  await expect(mark).toHaveCount(1);
  await expect(mark).toHaveAttribute('title', new RegExp(`Kupong A har tippat ${sign} på risklaget`));
  await expect(view.locator('.sb-risk-legend')).toContainText('risklag');
  await view.locator('table.sb-table').screenshot({ path: path.join(root, 'test-results', 'stryktips-risk.png') });
  expect(fel, fel.join('\n')).toEqual([]);
});

// Mobil (användaren 2026-10-24: "nu kan man inte läsa texten"): inget i kravlistan, kupongen eller åtgärdsraden sticker
// ut utanför skärmen, lagnamnen klipps inte och 1/X/2 + Lås ryms på 390 px
test('Stryktipset i mobil: inget sticker ut, lagnamn och Lås syns hela', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  await expect(view.locator('.sb-row')).toHaveCount(13, { timeout: 30_000 });
  await expect(view.locator('.sb-coupon')).toHaveCount(1, { timeout: 180_000 });
  const ut = await page.evaluate(() => [...document.querySelectorAll('.sb-row, .sb-row *, .sb-actionbar, .sb-actionbar *, .sb-coupon, .sb-coupon > *')]
    .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('.st-bt-wrap, pre'))
    .map((el) => `${el.tagName}.${el.className}`));
  expect(ut, ut.join('\n')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const namn = view.locator('.sb-match b').first();
  expect(await namn.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'lagnamnen klipps inte').toBe(true);
  await view.locator('.sb-seal').first().scrollIntoViewIfNeeded();
  await expect(view.locator('.sb-seal').first()).toBeInViewport({ ratio: 1 });
  expect(fel, fel.join('\n')).toEqual([]);
});

test('Stryktipset: hänglås per match – låst går inte att ändra, Generera kräver inte alla låsta', async ({ page }) => {
  test.setTimeout(300_000);
  const fel = await oppna(page, 'stryktipset');
  const view = page.locator('#stryktips-view');
  const rows = view.locator('.sb-row');
  await expect(rows).toHaveCount(13, { timeout: 30_000 });
  await expect(view.locator('.sb-seal')).toHaveCount(13);
  await expect(page.locator('#sb-generate')).toBeEnabled({ timeout: 120_000 });

  // Allt låst: raden spärras
  const r3 = rows.nth(2);
  await lasAlla(page);
  await expect(r3).toHaveClass(/is-sealed/);
  for (const s of ['1', 'X', '2']) await expect(r3.locator(`.sb-sign[data-sign="${s}"]`)).toBeDisabled();
  await expect(view.locator('.sb-seal-count')).toContainText('13/13');
  await expect(r3.locator('[data-defall-toggle]')).toBeDisabled();

  // Låsa upp: går att ändra igen
  await r3.locator('.sb-seal').click();
  await expect(r3).not.toHaveClass(/is-sealed/);
  await expect(r3.locator('.sb-sign[data-sign="1"]')).toBeEnabled();
  // Fördelning % som inte blir 100 % stoppar låset (2026-10-12)
  await r3.locator('[data-defall-toggle]').click();
  await r3.locator('input[data-defall-sys="A"][data-defall="1"]').fill('90');
  await r3.locator('input[data-defall-sys="A"][data-defall="1"]').dispatchEvent('change');
  await r3.locator('.sb-seal').click();
  await expect(r3.locator('.sb-row-err')).toContainText('Kan inte låsa: fördelningen');
  await expect(r3).not.toHaveClass(/is-sealed/);
  await r3.locator('[data-defall-model]').click();
  await r3.locator('.sb-seal').click();
  await expect(r3).toHaveClass(/is-sealed/);

  // Bara några låsta: Generera kör ändå (2026-10-12: "jag ska inte behöva låsa alla matcher")
  await rows.nth(0).locator('.sb-seal').click();
  await expect(view.locator('.sb-seal-count')).toContainText('12/13');
  // Genereringen kan vara klar på några millisekunder: fånga att knappen blev upptagen i stället för att hinna se den
  await page.evaluate(() => {
    (window as any).__sbBusy = false;
    new MutationObserver(() => { if ((document.querySelector('#sb-generate') as HTMLButtonElement | null)?.disabled) (window as any).__sbBusy = true; })
      .observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
  });
  await page.locator('#sb-generate').click();
  await expect(view.locator('.sb-gen-err')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__sbBusy)).toBe(true);
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

test('Tips: startar i läget Skrällar, Alla sparas som eget val', async ({ page }) => {
  // Utan sparat val (beforeEach sätter Alla – ta bort det igen)
  await page.addInitScript(() => { localStorage.removeItem('betting.upsetOnly'); localStorage.removeItem('betting.valueOnly'); });
  const fel = await oppna(page, 'tips');
  await expect(page.locator('#value-filter [data-vf="upset"]')).toHaveAttribute('aria-pressed', 'true', { timeout: 30_000 });
  await expect(page.locator('#upset-help')).toBeVisible();
  await page.locator('#value-filter [data-vf="all"]').click();
  await expect(page.locator('#upset-help')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('betting.upsetOnly'))).toBe('0');
  expect(fel).toEqual([]);
});

test('Tips: Klubb-Elo bredvid lagen och ⓘ Vad är Elo? förklarar enkelt', async ({ page }) => {
  const fel = await oppna(page, 'tips');
  await page.locator('#value-filter [data-vf="all"]').click();
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tips-latest.json'), 'utf8'));
  const medElo = (data.allCandidates ?? []).filter((t: any) => t.teamElo?.home || t.teamElo?.away);
  expect(medElo.length).toBeGreaterThan(0);
  for (const t of medElo) for (const e of [t.teamElo.home, t.teamElo.away].filter(Boolean)) {
    expect(e.elo).toBeGreaterThan(1000);
    expect(e.rank).toBeGreaterThan(0);
  }
  await page.locator('#cand-wrap > summary').click();
  const tag = page.locator('.tip .match .team-elo').first();
  await expect(tag).toBeVisible({ timeout: 30_000 });
  await expect(tag).toHaveText(/^Elo \d{4}( \+\d+)?$/);
  await expect(tag).toHaveAttribute('title', /plats \d+ i /);
  // båda lagen med Elo: precis ett är grönt (starkare) med +skillnad, om de inte är exakt lika
  const parKort = page.locator('.tip .match').filter({ has: page.locator('.team-elo + .team-link + .team-elo') });
  if (await parKort.count()) {
    const [h, a] = (await parKort.first().locator('.elo-n').allTextContents()).map(Number);
    if (h !== a) {
      await expect(parKort.first().locator('.team-elo.is-stronger')).toHaveCount(1);
      await expect(parKort.first().locator('.team-elo.is-stronger .elo-diff')).toHaveText(`+${Math.abs(h - a)}`);
      await expect(parKort.first().locator('.team-elo').nth(h > a ? 0 : 1)).toHaveClass(/is-stronger/);
    }
  }
  // truppvärde under lagnamnen: båda värdena, stapeln delas 100 %, dyrare trupp grön och nämns i klartext
  const medVarde = (data.allCandidates ?? []).filter((t: any) => t.squadValue?.home?.value && t.squadValue?.away?.value);
  expect(medVarde.length).toBeGreaterThan(0);
  const bar = page.locator('.tip .squad-bar').first();
  await expect(bar).toBeVisible();
  await expect(bar.locator('.sq-v')).toHaveCount(2);
  for (const v of await bar.locator('.sq-v').allTextContents()) expect(v).toMatch(/^[\d ,]+ (milj\.|mdr) €$/);
  const bredd = await bar.locator('.sq-fill').evaluateAll((els) => els.map((e) => parseFloat((e as HTMLElement).style.width)));
  expect(bredd[0] + bredd[1]).toBe(100);
  await expect(bar.locator('.sq-say')).toHaveText(/ungefär lika dyra trupper|s trupp är värd [\d,]+ gånger så mycket/);
  if (bredd[0] !== bredd[1] && !(await bar.locator('.sq-say').innerText()).includes('lika')) {
    await expect(bar.locator('.sq-v.is-rich')).toHaveCount(1);
    await expect(bar.locator('.sq-v').nth(bredd[0] > bredd[1] ? 0 : 1)).toHaveClass(/is-rich/);
  }
  await expect(page.locator('#help-elo')).toBeHidden();
  await page.locator('#help-elo-btn').click();
  await expect(page.locator('#help-elo')).toBeVisible();
  await expect(page.locator('#help-elo')).toContainText('Som om du vore 5');
  await page.locator('#help-elo-btn').click();
  await expect(page.locator('#help-elo')).toBeHidden();
  expect(fel).toEqual([]);
});

test('Tips: dagens bästa och skrällar är hopfällbara rader, öppna från start', async ({ page }) => {
  const fel = await oppna(page, 'tips');
  await expect(page.locator('#tips .tip-group-head').first()).toBeAttached({ timeout: 30_000 });
  const rows = page.locator('#tips details.fold-row');
  test.skip((await rows.count()) === 0, 'inga bästa tips eller skrällar just nu');
  const first = rows.first();
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('.cand-body .tip')).toBeVisible();
  await first.locator(':scope > summary').click();
  await expect(first.locator('.cand-body .tip')).toBeHidden();
  // Skrällraden visar skrälltecknet (★ 1/2), inte favoriten
  const ups = page.locator('#tips details.upset-row');
  if (await ups.count()) {
    const row = ups.first();
    await expect(row.locator('.cr-tip')).toContainText(/★ [12]/);
    // Kortet markerar skrälltecknet som 1X2-tips, inte favoriten
    const sign = ((await row.locator('.cr-tip').innerText()).match(/★ ([12])/) || [])[1];
    await expect(row.locator('tr[data-mkt="1X2"] .odd-pill.is-tip em')).toHaveText(sign!);
  }
  expect(fel).toEqual([]);
});
