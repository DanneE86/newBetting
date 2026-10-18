// Hämtar tacklings- och passningsodds (spelare, lag, match) från bet365 via Playwright (synlig Chrome).
// Sparas lokalt i data/bet365/odds/<datum>_<hemma>_<borta>.json (gitignorerat, publiceras aldrig).
// Användning:
//   node scripts/fetch-bet365-props.mjs --liga PL,SA --fran 2026-10-24 --till 2026-10-25   (alla matcher i intervallet)
//   node scripts/fetch-bet365-props.mjs --url "https://www.bet365.com/#/AC/B1/C1/D8/E201535817/F3/I1/"
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'bet365', 'odds');
const LEAGUE_URL = 'https://www.bet365.com/#/AC/B1/C1/D1002/E91422157/G40/';
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12 };

const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const slug = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Rader i ligalistan: "Lör 24 okt" följt av "13:30|Aston Villa|Man City|4.50|3.80|1.70"
export function parseFixtureList(text, year) {
  const L = text.split('\n').map((s) => s.trim()).filter(Boolean);
  const out = []; let date = null;
  for (let i = 0; i < L.length; i++) {
    const d = L[i].match(/^(Mån|Tis|Ons|Tors|Fre|Lör|Sön) (\d{1,2}) (\w{3})$/);
    if (d) { date = `${year}-${String(MONTHS[d[3]]).padStart(2, '0')}-${d[2].padStart(2, '0')}`; continue; }
    if (date && /^\d{2}:\d{2}$/.test(L[i]) && L[i + 1] && L[i + 2] && !/^[\d.]+$/.test(L[i + 1])) {
      out.push({ date, time: L[i], home: L[i + 1], away: L[i + 2] });
    }
  }
  return out;
}

async function settle(page, ms = 2500) { await page.waitForTimeout(ms); }

// Fäller ut en marknad med given rubrik och returnerar dess container-index (data-attribut sätts för att hitta den igen)
async function openMarket(page, title) {
  const ok = await page.evaluate((title) => {
    const head = [...document.querySelectorAll('span,div')].find((e) => e.childElementCount === 0 && e.textContent.trim() === title);
    if (!head) return false;
    let el = head; while (el && !(el.getAttribute('role') === 'button')) el = el.parentElement;
    const box = (el || head).parentElement; box.setAttribute('data-c365', title);
    const expanded = box.innerText.split('\n').length > 6;
    if (!expanded) (el || head).click();
    return true;
  }, title);
  if (!ok) return false;
  await settle(page);
  // "Visa mer" inne i marknaden
  for (let k = 0; k < 3; k++) {
    const n = await page.evaluate((title) => {
      const box = document.querySelector(`[data-c365="${title}"]`); if (!box) return 0;
      const vm = [...box.querySelectorAll('*')].filter((e) => e.childElementCount === 0 && e.textContent.trim() === 'Visa mer');
      vm.forEach((e) => e.click()); return vm.length;
    }, title);
    if (!n) break; await settle(page, 1200);
  }
  return true;
}

async function marketTabs(page, title) {
  return page.evaluate((title) => [...new Set([...document.querySelector(`[data-c365="${title}"]`)?.querySelectorAll('[data-content]') || []].map((e) => e.getAttribute('data-content')))], title);
}
async function clickTab(page, title, tab) {
  await page.evaluate(({ title, tab }) => { const e = document.querySelector(`[data-c365="${title}"] [data-content="${tab}"]`); e?.click(); }, { title, tab });
  await settle(page);
}

// Spelarmarknad: namn, senaste 5 och en kolumn per linje (1+, 2+, ...)
async function readPlayerMarket(page, title) {
  return page.evaluate((title) => {
    const box = document.querySelector(`[data-c365="${title}"]`); if (!box) return null;
    const rows = [...box.querySelectorAll('.brb-7d')].map((r) => ({
      name: r.querySelector('.brb-83')?.textContent.trim(),
      last5: [...r.querySelectorAll('.prs-6fcc69')].map((x) => +x.textContent),
    }));
    const cols = [...box.querySelectorAll('.brb-df')].map((c) => ({
      line: c.firstElementChild?.textContent.trim(),
      odds: [...c.children].slice(1).map((x) => parseFloat(x.innerText.trim()) || null),
    }));
    return rows.map((r, i) => ({ ...r, odds: Object.fromEntries(cols.filter((c) => c.odds[i]).map((c) => [c.line, c.odds[i]])) }));
  }, title);
}

// Över/under-marknad: "25.5|28.5|...|Över|1.11|...|Under|6.00|..."
export function parseOverUnder(text) {
  const L = text.split('\n').map((s) => s.trim()).filter(Boolean);
  const io = L.indexOf('Över'), iu = L.indexOf('Under');
  if (io < 0 || iu < 0) return [];
  const lines = L.slice(0, io).filter((s) => /^\d+(\.\d)?$/.test(s)).map(Number);
  const over = L.slice(io + 1, iu).map(Number), under = L.slice(iu + 1, iu + 1 + lines.length).map(Number);
  return lines.map((line, i) => ({ line, over: over[i], under: under[i] }));
}
async function readOverUnder(page, title) {
  const t = await page.evaluate((title) => document.querySelector(`[data-c365="${title}"]`)?.innerText || '', title);
  return parseOverUnder(t);
}

async function scrapeMatch(page, url, meta) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // vänta på matchrubriken ("…|Leeds|V|Man Utd")
  await page.waitForFunction(() => document.body.innerText.split('\n').some((x) => x.trim() === 'V'), null, { timeout: 40000 }).catch(() => {});
  await settle(page, 3000);
  await page.getByText('Bet Builder', { exact: true }).first().click({ timeout: 8000 }).catch(() => {});
  await settle(page, 4000);
  const res = { ...meta, url, fetchedAt: new Date().toISOString(), markets: {}, available: [] };
  const all = await page.evaluate(() => document.body.innerText);
  const wanted = [
    ['Tacklingar', 'player'], ['Totalt antal tacklingar', 'ou'],
    ['Passningar', 'player'], ['Spelare - Passningar', 'player'], ['Totalt antal passningar', 'ou'],
  ];
  for (const [title, kind] of wanted) {
    if (!all.split('\n').some((s) => s.trim() === title)) continue;
    if (!(await openMarket(page, title))) continue;
    const tabs = await marketTabs(page, title);
    const m = {};
    for (const tab of tabs.length ? tabs : ['alla']) {
      if (tabs.length) await clickTab(page, title, tab);
      m[tab] = kind === 'player' ? await readPlayerMarket(page, title) : await readOverUnder(page, title);
    }
    res.markets[title] = m; res.available.push(title);
  }
  return res;
}

// Ligor: direktlänk eller rubrik att klicka på under Fotboll
export const LEAGUES = {
  PL: { url: LEAGUE_URL },
  SA: { url: 'https://www.bet365.com/#/AC/B1/C1/D1002/E92269709/G40/H%5E1/' },
};

async function openLeague(page, key) {
  const L = LEAGUES[key]; if (!L) throw new Error('okänd liga ' + key);
  if (L.url) {
    // ladda om till listan syns (datumrad som "Sön 18 okt"), högst tre försök
    for (let i = 0; i < 3; i++) {
      await page.goto(L.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const ok = await page.waitForFunction(() => /\n(Mån|Tis|Ons|Tors|Fre|Lör|Sön) \d{1,2} \w{3}\n/.test(document.body.innerText), null, { timeout: 30000 }).then(() => true).catch(() => false);
      if (ok) { await settle(page, 2000); return; }
    }
    throw new Error('ligalistan laddades inte: ' + key);
  }
  await page.goto(LEAGUE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await settle(page, 10000);
  await page.getByText('Fotboll', { exact: true }).first().click(); await settle(page, 6000);
  await page.getByText(L.nav, { exact: true }).first().click(); await settle(page, 8000);
}

// "18 okt 15:00" -> { date: '2026-10-18', time: '15:00' }
export function parseWhen(when, year) {
  const m = String(when || '').match(/(\d{1,2}) (\w{3})\s+(\d{2}:\d{2})/);
  return m ? { date: `${year}-${String(MONTHS[m[2]]).padStart(2, '0')}-${m[1].padStart(2, '0')}`, time: m[3] } : {};
}

// Klickar på hemmalagets namn i raden där nästa namn är bortalaget (samma lag kan stå på flera rader)
async function clickFixture(page, home, away) {
  return page.evaluate(({ home, away }) => {
    const leaves = [...document.querySelectorAll('div,span')].filter((e) => e.childElementCount === 0 && e.textContent.trim() && e.getBoundingClientRect().height > 0);
    for (let i = 0; i < leaves.length - 1; i++)
      if (leaves[i].textContent.trim() === home && leaves.slice(i + 1, i + 4).some((e) => e.textContent.trim() === away)) { leaves[i].click(); return true; }
    return false;
  }, { home, away });
}

// Matchsidans rubrik: "18 okt 15:00|Leeds|V|Man Utd"
export function pageTeams(text) {
  const t = text.split('\n').map((s) => s.trim());
  const v = t.indexOf('V');
  return v > 0 ? { when: t[v - 2], home: t[v - 1], away: t[v + 1] } : null;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: false, channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({ locale: 'sv-SE', viewport: { width: 1400, height: 1000 } });
  // ny flik per sida: bet365 ritar inte om när bara #-delen av länken ändras
  const fresh = async (fn) => { const p = await ctx.newPage(); try { return await fn(p); } finally { await p.close(); } };
  const ligor = (arg('liga') || 'PL').split(',');
  const targets = [];
  if (arg('url')) targets.push({ url: arg('url'), meta: { league: ligor[0] } });
  else {
    const fran = arg('fran'), till = arg('till') || fran;
    for (const lg of ligor) {
      const list = await fresh(async (p) => { await openLeague(p, lg); return p.evaluate(() => document.body.innerText); });
      const fx = parseFixtureList(list, +fran.slice(0, 4)).filter((f) => f.date >= fran && f.date <= till);
      console.log(`${lg}:`, fx.map((f) => `${f.date} ${f.time} ${f.home}-${f.away}`).join(', ') || 'inga matcher');
      for (const f of fx) {
        const url = await fresh(async (p) => {
          await openLeague(p, lg);
          if (!(await clickFixture(p, f.home, f.away))) return null;
          await p.waitForFunction(() => /\/E\d+\/F/.test(location.hash), null, { timeout: 20000 }).catch(() => {});
          return p.url();
        });
        if (!url) { console.log('hittar inte raden', f.home, f.away); continue; }
        targets.push({ url, meta: { league: lg, ...f } });
      }
    }
  }
  for (const t of targets) {
    try {
      const { r, pt } = await fresh(async (page) => {
        const r = await scrapeMatch(page, t.url, t.meta);
        return { r, pt: pageTeams(await page.evaluate(() => document.body.innerText)) };
      });
      if (!pt) { console.log('ingen matchrubrik', t.url); continue; }
      if (r.home && (pt.home !== r.home || pt.away !== r.away)) { console.log(`fel match: väntade ${r.home}-${r.away}, sidan visar ${pt.home}-${pt.away}`); continue; }
      if (!r.home) Object.assign(r, pt, parseWhen(pt.when, new Date().getFullYear()));
      r.when ??= pt.when;
      const file = path.join(OUT, `${r.date || 'okand'}_${r.league}_${slug(r.home)}_${slug(r.away)}.json`);
      // en tom hämtning skriver aldrig över sparade odds
      const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
      if (old?.available?.length && !r.available.length) { console.log(`${r.home}-${r.away}: inga marknader nu, behåller sparade odds från ${old.fetchedAt}`); continue; }
      fs.writeFileSync(file, JSON.stringify(r, null, 1));
      console.log(`${r.league} ${r.home}-${r.away}: ${r.available.join(', ') || 'inga tacklings-/passningsmarknader ännu'} -> ${path.relative(ROOT, file)}`);
    } catch (e) { console.log('fel', t.meta.home, e.message); }
  }
  await browser.close();
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
