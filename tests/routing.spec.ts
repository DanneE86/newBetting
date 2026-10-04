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
  await expect(page.locator('.view-tab')).toHaveCount(4);
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
  // Kupongerna (A, B, C, D) räknas i webbläsaren och tar upp till en minut per generering
  test.setTimeout(900_000);
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.click('.view-tab[data-view="stryktipset"]');
  await expect(page).toHaveURL(base + '/stryktipset');
  await expect(page.locator('#stryktips-view h2')).toContainText('Stryktipset', { timeout: 30_000 });
  const rows = page.locator('.sb-row');
  await expect(rows).toHaveCount(13, { timeout: 240_000 });
  // Kupongen genereras direkt, utan krav
  await expect(page.locator('.sb-table tbody tr')).toHaveCount(13, { timeout: 240_000 });
  // A och B (2026-10-03): aldrig samma halv- eller helgardering, B ärver A:s spikar – högst 1 match skiljer på spik
  const pairs = await page.locator('.sb-table tbody tr').evaluateAll((trs) => trs.map((tr) => [tr.children[2].textContent!.trim(), tr.children[3].textContent!.trim()]));
  expect(pairs.filter(([a, b]) => (a.split('+').length === 1 || b.split('+').length === 1) && a !== b).length).toBeLessThanOrEqual(1);
  expect(pairs.filter(([a, b]) => a === b && a.split('+').length > 1).length).toBe(0);
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
  await expect(table.nth(0).locator('td').nth(1)).toHaveText(/^🔒 X(?: ⚠.*)?$/, { timeout: 240_000 });
  // Tabellen ligger först, kupongkorten (med Gambling Cabin-länkarna) under den
  const order = await page.locator('.sb-result').evaluate((el) => {
    const t = el.querySelector('.sb-table')!, c = el.querySelector('.sb-coupons')!;
    return !!(t.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  await expect(table.nth(0).locator('td').nth(1)).toHaveText(/^🔒 X(?: ⚠.*)?$/);
  await expect(table.nth(0).locator('td').nth(2)).toHaveText(/^🔒 X(?: ⚠.*)?$/);
  await expect(table.nth(3).locator('td').nth(2)).toHaveText(/^🔒 1(?: ⚠.*)?$/);
  await expect(table.nth(3).locator('td').nth(1)).not.toContainText('🔒');
  await expect(table.nth(1).locator('td').nth(1)).toHaveText(/^🔒 1 \+ X(?: ⚠.*)?$/);
  await expect(table.nth(1).locator('td').nth(2)).toHaveText(/^🔒 1 \+ X(?: ⚠.*)?$/);
  await expect(table.nth(5).locator('td').nth(1)).toHaveText(/^🔒 1 \+ X \+ 2(?: ⚠.*)?$/);
  await expect(table.nth(5).locator('td').nth(2)).not.toContainText('🔒');
  await expect(page.locator('.sb-coupon h3').first()).toContainText(/Kupong A \d+ rader/);
  await expect(page.locator('.sb-coupon h3').nth(1)).toContainText(/Kupong B \d+ rader/);
  // B och C: 50 000–75 000 kr sedan 2026-10-02
  await expect(page.locator('.sb-coupon').nth(1)).toContainText('minst 50 000 kr, inget tak');
  // Kupong C: eget system 700-850 kr, kraven gäller inte där (inga lås i C-kolumnen)
  const cHead = await page.locator('.sb-coupon h3').nth(2).textContent();
  const cCost = Number(cHead!.match(/(\d[\d\s]*) kr/)![1].replace(/\s/g, ''));
  expect(cCost).toBeGreaterThanOrEqual(700);
  expect(cCost).toBeLessThanOrEqual(850);
  await expect(page.locator('.sb-coupon').nth(2)).toContainText('minst 50 000 kr');
  // Krav på A+B låses inte i C
  await expect(table.nth(0).locator('td').nth(3)).not.toContainText('🔒');
  // Kupong D: fritt reducerat system för vinster över 20 000 kr, krav på A+B låses inte där
  const dCard = page.locator('.sb-coupon').nth(3);
  await expect(dCard.locator('h3')).toContainText(/Kupong D \d+ rader/);
  await expect(dCard).toContainText(/Fritt reducerat · [\d\s]+ → \d+ rader · 1 \d/);
  await expect(table.nth(0).locator('td').nth(4)).not.toContainText('🔒');
  const dSigns = await table.evaluateAll((trs) => trs.map((tr) => tr.querySelectorAll('td')[4].textContent!.trim()));
  expect(dSigns).toHaveLength(13);
  // Fritt system: 1–3 olika tecken per match (cellen kan också ha varningar som "⚠ kan falla")
  for (const t of dSigns) {
    const signs = t.match(/[1X2]/g) || [];
    expect(signs.length >= 1 && signs.length <= 3 && new Set(signs).size === signs.length, t).toBe(true);
  }
  // Eget krav på C: spik 2 på match 8 bara i C
  await rows.nth(7).locator('.sb-sign[data-sign="2"]').click();
  await rows.nth(7).locator('.sb-scope button[data-scope="C"]').click();
  await page.click('#sb-generate');
  await expect(table.nth(7).locator('td').nth(3)).toHaveText(/^🔒 2(?: ⚠.*)?$/, { timeout: 240_000 });
  await expect(table.nth(7).locator('td').nth(1)).not.toContainText('🔒');
  await expect(table.nth(7).locator('td').nth(2)).not.toContainText('🔒');
  await expect(table.nth(7).locator('td').nth(4)).not.toContainText('🔒');
  await rows.nth(7).locator('.sb-sign[data-sign="2"]').click();
  // Turmatcher och vanliga missar visas (historiken ligger i den hopfällda sektionen "Statistik & historik")
  await page.locator('.st-history > summary').click();
  await expect(page.locator('.st-miss')).toContainText('Vanliga missar');
  await expect(page.locator('.st-miss-table tbody tr').first()).toBeVisible();
  // Matchkorten visar B-kupongens tecken (även när hämtningens system är delat)
  await expect(page.locator('.st-match .st-tip.sysb').first()).toBeVisible();
  // Turknapparna skriver aldrig över ett krav som gäller A
  const turAdd = page.locator('.sb-tur-add');
  // En turmatch utan eget krav (testet har redan lagt krav på några matcher)
  const freeNrs: string[] = [];
  // Match 8 (rad 7) har nyss haft ett krav bara i C – dess omfattning ligger kvar, så den räknas inte som fri
  const used = await rows.nth(7).getAttribute('data-ev');
  for (const nr of await turAdd.evaluateAll((els) => els.map((x) => x.getAttribute('data-ev') || ''))) {
    if (nr !== used && !(await page.locator(`.sb-row[data-ev="${nr}"] .sb-sign.on`).count())) freeNrs.push(nr);
  }
  if (freeNrs.length) {
    const nr = freeNrs[0];
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
  test.setTimeout(900_000);
  await page.goto(base + '/europatipset/b');
  await expect(page).toHaveURL(base + '/europatipset');
  await expect(page.locator('#stryktips-view h2')).toContainText('Europatipset', { timeout: 30_000 });
  await expect(page.locator('.sb-row')).toHaveCount(13, { timeout: 300_000 });
  await expect(page.locator('.sb-coupon')).toHaveCount(4, { timeout: 300_000 }); // A, B, C och D
  await expect(page.locator('.view-tab.active')).toHaveAttribute('data-view', 'europatipset');
  // Krav bara i A (1X på sista matchen): B väljer aldrig exakt samma tecken där
  await page.evaluate(() => localStorage.clear());
  const last = page.locator('.sb-row').nth(12);
  await last.locator('.sb-sign[data-sign="1"]').click();
  await last.locator('.sb-sign[data-sign="X"]').click();
  await last.locator('.sb-scope button[data-scope="A"]').click();
  await page.click('#sb-generate');
  const row = page.locator('.sb-table tbody tr').nth(12);
  await expect(row.locator('td').nth(1)).toHaveText(/^🔒 1 \+ X(?: ⚠.*)?$/, { timeout: 300_000 });
  await expect(row.locator('td').nth(2)).not.toHaveText('1 + X');
  await page.evaluate(() => localStorage.clear());
});

// Domarsvit (minst 5 raka segrar/förluster med matchens domare) markeras tydligt på Oddset-tipsen och Stryktipset
const refFlag = (home: string, away: string) => ({
  referee: 'Anthony Taylor', flagged: true,
  home: { team: home, matches: 7, record: { w: 6, d: 0, l: 1 }, streak: { res: 'W', n: 6 }, flag: 'wins', last: [{ date: '2026-01-01', opp: away, home: true, score: '2-0', res: 'W' }] },
  away: { team: away, matches: 7, record: { w: 1, d: 1, l: 5 }, streak: { res: 'L', n: 5 }, flag: 'losses', last: [] },
});

test('Oddset: domarsvit markeras på tipskorten', async ({ page }) => {
  await page.route('**/api/dashboard*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    for (const k of ['bestUpcoming', 'allCandidates']) for (const t of body[k] || []) t.referee = refFlag(t.home, t.away);
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/tips');
  const alert = page.locator('.ref-alert').first();
  const badge = page.locator('.ref-badge').first();
  await expect(alert.or(badge)).toBeVisible({ timeout: 30_000 });
  if (await alert.count()) {
    await expect(alert).toContainText('Anthony Taylor');
    await expect(alert).toContainText('6 raka segrar');
    await expect(alert).toContainText('5 raka förluster');
    await expect(alert).toHaveClass(/mixed/);
  }
});

test('Stryktipset: domarsvit markeras på matcherna', async ({ page }) => {
  await page.route('**/api/stryktips', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    for (const p of body.products || []) for (const e of p.events || []) e.refereeStreak = refFlag(e.home, e.away);
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/stryktipset');
  const badge = page.locator('#stryktips-view .ref-badge').first();
  await expect(badge).toBeVisible({ timeout: 30_000 });
  await expect(badge).toContainText('domarsvit');
  await expect(badge).toHaveAttribute('title', /Anthony Taylor.*6 raka segrar.*5 raka förluster/);
});

test('Oddset: knappen Domare bredvid Duellanalys visar domarstatistik för engelska matcher', async ({ page }) => {
  // API: ligasnitt och alla ligans domare för en riktig engelsk match
  const dash = await (await fetch(base + '/api/dashboard')).json();
  const eng = [...(dash.allCandidates || [])].find((t: any) => ['PL', 'CH', 'EL1'].includes(t.league));
  test.skip(!eng, 'inga engelska matcher i tipsen just nu');
  const qs = new URLSearchParams({ league: eng.league, date: eng.date, home: eng.home, away: eng.away });
  const api = await (await fetch(`${base}/api/referees?${qs}`)).json();
  expect(api.leagueAvg.yellowPg).toBeGreaterThan(1);
  expect(api.leagueAvg.foulsPg).toBeGreaterThan(10);
  expect(api.referees.length).toBeGreaterThan(5);
  expect(api.referees[0]).toHaveProperty('yellowVsAvg');
  expect((await fetch(`${base}/api/referees?league=XX&date=2026-10-10&home=A&away=B`)).status).toBe(404);

  // GUI: bara den engelska matchen som kort, knappen ligger direkt efter Duellanalys
  await page.route('**/api/dashboard*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    body.bestUpcoming = [eng];
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/tips');
  // Bästa tipsen överst hämtas även ur alla kandidater: välj just den engelska matchens kort
  const card = page.locator(`.tip[data-tip-id="${eng.league}|${eng.date}|${eng.home}|${eng.away}"]:has(.btn-referee)`).first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  const order = await card.locator('.tip-actions button').evaluateAll((els) => els.map((e) => e.className));
  expect(order[order.indexOf('btn-matchup') + 1]).toBe('btn-referee');
  await card.locator('.btn-referee').click();
  await expect(card.locator('.rf-wrap')).toBeVisible({ timeout: 30_000 });
  await expect(card.locator('.rf-all summary')).toContainText('Alla domare i');
  await expect(card.locator('.rf-table tfoot')).toContainText('Ligasnitt');
  await expect(card.locator('.rf-stats')).toContainText(/ligasnitt|ligan/i);
  // Tabellen i matchpanelen har samma säsongsval (årets som standard) och klickbara domare
  await expect(card.locator('.rf-all [data-rf-season] option:checked')).toContainText('(i år)');
  expect(api.teamRecs).toBeTruthy();
});

test('Matchens domarpanel: domarens alla matcher med vardera laget, inbördes möten markeras', async ({ page }) => {
  const dash = await (await fetch(base + '/api/dashboard')).json();
  const eng = [...(dash.allCandidates || [])].find((t: any) => ['PL', 'CH', 'EL1'].includes(t.league));
  test.skip(!eng, 'inga engelska matcher i tipsen just nu');
  const games = (opp: string) => [
    { date: '2026-09-01', league: eng.league, opp, home: true, score: '2-1', res: 'W', yc: 2 },
    { date: '2026-03-01', league: eng.league, opp: 'Annat lag', home: false, score: '0-0', res: 'D', yc: null },
    { date: '2025-11-01', league: eng.league, opp: 'Tredje laget', home: true, score: '0-1', res: 'L', yc: 1 },
  ];
  const side = (team: string, opp: string) => ({ team, matches: 3, record: { w: 1, d: 1, l: 1 }, streak: { res: 'W', n: 1 }, flag: null, yellowPg: 1.5, last: [], games: games(opp) });
  await page.route('**/api/dashboard*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    body.bestUpcoming = [eng];
    await route.fulfill({ response: res, json: body });
  });
  await page.route('**/api/referees?*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    body.teams = { home: 'Hemma', away: 'Borta' };
    body.referee = { referee: 'Test Domare', key: 't domare', matches: 30, yellowPg: 3.5, otherLeagues: false, home: side('Hemma', 'Borta'), away: side('Borta', 'Hemma') };
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/tips');
  const card = page.locator('.tip:has(.btn-referee)').first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.locator('.btn-referee').click();
  const teams = card.locator('.rf-teams .rf-team');
  await expect(teams).toHaveCount(2, { timeout: 30_000 });
  await expect(teams.first().locator('.rf-teamgames summary')).toContainText('Alla 3 matcher med domaren');
  await expect(teams.first().locator('.rf-teamgames tbody tr')).toHaveCount(3);
  // Inbördes mötet (mot det andra laget) markeras och listas ovanför
  await expect(teams.first().locator('tr.rf-involved')).toHaveCount(1);
  await expect(teams.first().locator('tr.rf-involved')).toContainText('2-1');
  await expect(card.locator('.rf-h2h')).toContainText('Inbördes med domaren');
});

test('Ligaraden: Domare sist i raden visar ligans domare, sortering och filter på gula/röda/straffar', async ({ page }) => {
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '/tips');
  await page.click('.filter-pill[data-group="england"]');
  const sub = page.locator('#league-sub .filter-pill');
  await expect(sub.last()).toHaveAttribute('data-refleague', '');
  await sub.last().click();
  const view = page.locator('#ref-league');
  await expect(view.locator('.rf-table')).toBeVisible({ timeout: 30_000 });
  await expect(view).toContainText('Ligasnitt');
  await expect(view.locator('.rf-stats')).toContainText('Straffar per match');
  // 1 / X / 2 ska stå på en rad (ingen radbrytning i värdet)
  const x12 = view.locator('.rf-stat-1x2 .rf-v');
  const lh = await x12.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) || 24);
  expect((await x12.boundingBox())!.height).toBeLessThan(lh * 1.5);
  await expect(view.locator('thead')).toContainText('Straffar');
  // Röda/m och Straffar/m är borttagna (ointressanta)
  await expect(view.locator('thead')).not.toContainText('Röda/m');
  await expect(view.locator('thead')).not.toContainText('Straffar/m');
  // Sortera på straffar: fallande, sedan stigande vid nytt klick
  await view.locator('.rf-chip[data-rf-sort="pen"]').click();
  await expect(view.locator('.rf-chip[data-rf-sort="pen"]')).toContainText('▼');
  await view.locator('.rf-chip[data-rf-sort="pen"]').click();
  await expect(view.locator('.rf-chip[data-rf-sort="pen"]')).toContainText('▲');
  // Filter: bara domare med fler gula än snittet
  const before = await view.locator('tbody tr').count();
  await view.locator('.rf-chip[data-rf-filter="yellow"]').click();
  await expect(view.locator('.rf-chip[data-rf-filter="yellow"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await view.locator('tbody tr').count()).toBeLessThanOrEqual(before);
  for (const txt of await view.locator('tbody tr td:nth-child(4) .rf-diff').allTextContents()) expect(txt.startsWith('+')).toBeTruthy();
  await view.locator('.rf-chip[data-rf-filter="yellow"]').click();

  // Säsong: årets som standard, äldre valbara – rubrik, ligasnitt och tabell följer valet
  const season = view.locator('[data-rf-season]');
  await expect(season.locator('option:checked')).toContainText('(i år)');
  await expect(view.locator('.rf-league-sub')).toContainText('säsongen');
  const nowAvg = await view.locator('tfoot td').nth(1).textContent();
  const prevId = await season.locator('option').nth(1).getAttribute('value');
  await season.selectOption(prevId!);
  await expect(view.locator('.rf-league-sub')).toContainText(await season.locator('option:checked').textContent() as string);
  expect(Number(await view.locator('tfoot td').nth(1).textContent())).toBeGreaterThan(Number(nowAvg));
  // Sorteringen ligger kvar när säsongen byts
  await expect(view.locator('.rf-chip[data-rf-sort="pen"]')).toContainText('▲');
  await season.selectOption('all');
  await expect(view.locator('.rf-league-sub')).toContainText('senaste 3 säsongerna');
  await season.selectOption(prevId!);

  // Klick på domaren: alla matcher hen dömt den säsongen, med resultat
  const ref = view.locator('.rf-ref').first();
  const n = Number(await view.locator('tbody tr:has(.rf-ref) td:nth-child(2)').first().textContent());
  await ref.click();
  await expect(ref).toHaveAttribute('aria-expanded', 'true');
  const games = view.locator('.rf-games-row .rf-games-table tbody tr');
  await expect(games).toHaveCount(n);
  await expect(games.first().locator('td:nth-child(3)')).toHaveText(/^\d+–\d+$/);
  await expect(view.locator('.rf-games-sum')).toContainText(`${n} matcher`);
  // Hemmasegrar markeras: lika många markerade rader som siffran i sammanfattningen
  const homeWins = Number((await view.locator('.rf-homewin-key').textContent())!.match(/\d+/)![0]);
  await expect(view.locator('.rf-games-row tr.rf-homewin')).toHaveCount(homeWins);
  await ref.click();
  await expect(view.locator('.rf-games-row')).toHaveCount(0);
  // Byt liga i vyn och stäng
  await view.locator('[data-ref-tab="CH"]').click();
  await expect(view.locator('.rf-name')).toContainText('Championship', { timeout: 30_000 });
  await view.locator('[data-ref-close]').click();
  await expect(view).toBeHidden();
});

test('Ligans domarvy kraschar inte om servern skickar gamla svaret (seasons som tal)', async ({ page }) => {
  // En gammal, ej omstartad server gav seasons: 3 och inga reports -> "(d.seasons || []).find is not a function"
  await page.route('**/api/refleague?*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    await route.fulfill({ response: res, json: { ...body, seasons: 3, reports: undefined } });
  });
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '/tips');
  await page.click('.filter-pill[data-group="england"]');
  await page.locator('#league-sub .filter-pill').last().click();
  const view = page.locator('#ref-league');
  await expect(view.locator('.rf-table')).toBeVisible({ timeout: 30_000 });
  await expect(view).not.toContainText('is not a function');
  await expect(view.locator('[data-rf-season]')).toHaveCount(0);
});

test('Alla kandidater fälls ut när man går in i en liga', async ({ page }) => {
  await page.goto(base + '/tips');
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '/tips');
  await page.waitForSelector('#league-filters .filter-pill[data-group], #league-filters .filter-pill[data-league]:not([data-league="ALL"])', { timeout: 30_000 });
  await expect(page.locator('#cand-wrap')).not.toHaveAttribute('open', '');
  await page.click('.filter-pill[data-group="england"]');
  await expect(page.locator('#cand-wrap')).toHaveAttribute('open', '');
  await expect(page.locator('#candidates .cand-row').first()).toBeVisible({ timeout: 30_000 });
  // Även efter omladdning med sparad liga
  await page.reload();
  await expect(page.locator('#cand-wrap')).toHaveAttribute('open', '', { timeout: 30_000 });
});

test('Oddset: tipskortet har raden Kort Ö/U med domare och spela från för 3.5/4.5/5.5', async ({ page }) => {
  const cards = {
    line: 4.5, pick: 'OVER 4.5', confidence: 0.56, expCards: 4.9, leagueAvg: 4.1, dataTo: new Date().toISOString().slice(0, 10),
    pOver: { '3.5': 0.75, '4.5': 0.56, '5.5': 0.36 }, referee: { name: 'Anthony Taylor', matches: 40, cardsPg: 5.2, factor: 1.15 },
  };
  await page.route('**/api/dashboard*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    for (const k of ['bestUpcoming', 'allCandidates']) for (const t of body[k] || []) t.tips = { ...t.tips, CARDS: cards, BOTH_CARDS: { pick: 'JA', pYes: 0.8, confidence: 0.8 } };
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/tips');
  const row = page.locator('tr[data-mkt="CARDS"]').first();
  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(row.locator('td.mkt')).toHaveText('Kort 4.5');
  await expect(row.locator('.odd-pill.is-tip')).toContainText('Ö');
  await expect(row).toContainText('Proj. 4,9 kort');
  await expect(row).toContainText('Anthony Taylor 5,2/match');
  // Spela från = (1 + 8 %) / chans: 4.5 Ö 1.08/0.56 = 1.93, 3.5 U 1.08/0.25 = 4.32, 5.5 Ö 1.08/0.36 = 3
  await expect(row).toContainText('4.5: Ö 1.93');
  await expect(row).toContainText('3.5: Ö 1.44 / U 4.32');
  await expect(row).toContainText('5.5: Ö 3 /');
  await expect(row.locator('td.val')).toContainText('spela från 1.93');
  // Klick på U visar under-linjens värde: 1.08/0.44 = 2.45
  await row.locator('.odd-pill[data-key="under"]').click();
  await expect(row.locator('td.val')).toContainText('spela från 2.45');
  // Båda lagen får kort: Ja 1.08/0.8 = 1.35, Nej 1.08/0.2 = 5.4
  const both = page.locator('tr[data-mkt="BOTH_CARDS"]').first();
  await expect(both.locator('td.mkt')).toHaveText('Båda kort');
  await expect(both.locator('.odd-pill.is-tip')).toContainText('JA');
  await expect(both).toContainText('Spela från – Ja 1.35 / Nej 5.4');
  await expect(both.locator('td.val')).toContainText('spela från 1.35');
  await both.locator('.odd-pill[data-key="bc-no"]').click();
  await expect(both.locator('td.val')).toContainText('spela från 5.4');
});

test('Oddset: bästa tipsen överst kommer från kommande omgång, även utan värdetips', async ({ page }) => {
  // Allsvenskan: inget värdetips i omgången 9–12 okt, ett värdetips 24 okt. Överst ska omgångens bästa kandidater stå.
  const day = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
  await page.route('**/api/dashboard*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    const src = [...(body.allCandidates || []), ...(body.bestUpcoming || [])][0];
    const mk = (home: string, away: string, date: string, tipScore: number) => ({
      ...src, league: 'AS', home, away, match: `${home} vs ${away}`, date, kickoffUtc: `${date}T13:00:00Z`, tipScore,
    });
    body.allCandidates = [mk('Goteborg', 'Vasteras SK', day(5), 0.4), mk('Hammarby', 'Djurgarden', day(7), 0.9), mk('Malmo FF', 'Kalmar', day(8), 0.7)];
    body.bestUpcoming = [mk('Sirius', 'AIK', day(20), 0.5)];
    await route.fulfill({ response: res, json: body });
  });
  await page.goto(base + '/tips');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('betting.valueOnly', '0'); });
  await page.goto(base + '/tips');
  const head = page.locator('#tips .tip-group-head').first();
  await expect(head).toContainText('Omgången', { timeout: 30_000 });
  await expect(head).toContainText('3 matcher');
  await expect(page.locator('#tips .tip').first()).toContainText('Hammarby');
});
