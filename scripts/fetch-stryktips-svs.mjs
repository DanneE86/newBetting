// Allt Svenska Spel visar om matcherna på Stryktipset/Europatipset, per öppen omgång.
//   JSON (utan webbläsare):
//     api.spela.svenskaspel.se/draw/1/<produkt>/draws            kupong: odds, startodds, favoritprocent, Svenska folket, tio tidningar
//     api.spela.svenskaspel.se/sport/1/sportevent/<matchId>      arena, säsong, Sportradar-/Kambi-id
//     api.spela.svenskaspel.se/sport/2/sportevent/<matchId>/odds Över/Under 2,5 och andra spels streck (Topptipset, Challenge ...)
//     api.spela.svenskaspel.se/content/2/basicfilter              expertanalyser (cnt:gameAnalysis), omgångsanalys (cnt:drawAnalysis), nyheter
//     widget.playmaker.ai/x-stats-<sportradarId>.json            xStats: xP, xG, xGC, förväntad tabellplats (säsong + 5 senaste)
//     widget.playmaker.ai/ts-<sportradarId>.json                 lagprofil (percentiler: fasta situationer, kontringar, bollinnehav ...)
//     eu.offering-api.kambicdn.com/.../betoffer/event/<kambiId>  Oddset-spelen som fliken Oddset visar (type=2,6,18: hörnor, kort, skott, halvtid ...)
//   Webbläsare (Playwright), Enetpulse-widgetarna vars data är krypterad – läses som texten sidan visar:
//     /<produkt>/statistik?event=N        form (alla, hemma, borta), inbördes, vinstchans
//     /<produkt>/tabell?event=N           tabell totalt, hemma, borta
//     /<produkt>/laguppstallning?event=N  trolig/bekräftad elva, spelsystem, otillgängliga, tränare
//
//   node scripts/fetch-stryktips-svs.mjs                       (stryktipset + europatipset)
//   node scripts/fetch-stryktips-svs.mjs stryktipset
//   node scripts/fetch-stryktips-svs.mjs stryktipset --utan-webblasare
// Utdata: data/stryktips-svs/<produkt>.json (visas i matchkortens analys) + arkiv/<produkt>-<omgång>.json
// Nyheterna är tredjepartstext (Everysport/TT): bara rubrik och kort ingress sparas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getJson, pool, BROWSER_UA } from './lib/http.mjs';
import { svsSchemas } from './lib/api-schemas.mjs';
import {
  parseStatistik, parseTabell, compactXStats, compactTeamStyle, compactKambi, compactNews, compactSporteventOdds, cleanHtml,
} from './lib/svs-matchinfo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(root, 'data', 'stryktips-svs');
const API = 'https://api.spela.svenskaspel.se';
const args = process.argv.slice(2);
const NO_BROWSER = args.includes('--utan-webblasare');
const PRODUCTS = args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : ['stryktipset', 'europatipset'];
const PRODUCT_ID = { stryktipset: 1, europatipset: 2 };

const log = (s) => process.stdout.write(`${s}\n`);
const num = (s) => {
  if (s == null || s === '') return null;
  const n = Number(String(s).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const trio = (o) => (o ? [o.one, o.x, o.two].map(num) : null);
const svs = (url, o = {}) => getJson(url, { headers: { 'User-Agent': BROWSER_UA }, retries: 2, label: 'Svenska Spel', ...o });
const opt = (p) => p.catch((e) => { log(`  (hoppar över: ${e.message})`); return null; });
const providerId = (ids, name) => (ids || []).find((x) => x.provider === name)?.id || null;

async function cms(params) {
  const q = new URLSearchParams({ routesDomain: 'partner', count: '100', ...params });
  return (await opt(svs(`${API}/content/2/basicfilter?${q}`)))?.result || [];
}

// Expertanalyser per match (samma källa som fetch-stryktipset.mjs, här med hela texten och tipset)
async function gameAnalyses(productId, drawNumber) {
  const res = await cms({ contentType: 'cnt:gameAnalysis', channel: 'web', matchAllDomainCategories: 'true', domainCategories: `svs-domain-sport-draws/${drawNumber},svs-domain-products/${productId}` });
  const byEvent = new Map();
  for (const r of res) {
    const n = r.properties?.cnt_eventNumber;
    if (!n) continue;
    let signs = '';
    try { signs = (JSON.parse(r.properties.cnt_gamePrediction || '{}').prediction || []).flatMap((p) => p.outcomes.map((o) => o.description)).join(''); } catch { /* inget tips */ }
    if (!byEvent.has(Number(n))) byEvent.set(Number(n), []);
    byEvent.get(Number(n)).push({ author: r.authorProfile?.authorLongName || r.authorProfile?.authorShortName || 'Svenska Spel', signs, text: cleanHtml(r.body), published: r.published || null });
  }
  return byEvent;
}

// Omgångsanalysen (fliken Analys): ingress, spikar, skrällar och "kort om alla matcher"
async function drawAnalyses(productId, drawNumber) {
  const res = await cms({ contentType: 'cnt:drawAnalysis', channel: 'web-desktop', matchAllDomainCategories: 'true', count: '20', domainCategories: `svs-domain-sport-draws/${drawNumber},svs-domain-products/${productId}` });
  return res.filter((r) => cleanHtml(r.body)).map((r) => ({ title: r.title || '', author: r.authorProfile?.authorLongName || r.authorProfile?.authorShortName || null, published: r.published || null, text: cleanHtml(r.body) }));
}

async function apiPart(product, productId, ev) {
  const m = ev.match || {};
  const [se, odds, news] = await Promise.all([
    opt(svs(`${API}/sport/1/sportevent/${m.matchId}`)),
    opt(svs(`${API}/sport/2/sportevent/${m.matchId}/odds`)),
    cms({ parentId: 'svs-workarea-articles-news', domainCategories: `svs-domain-sport-events/${m.matchId}`, sort: 'published:desc' }),
  ]);
  const sport = se?.sportEvent;
  const ids = sport?.providerIds || ev.providerIds;
  const sportradarId = providerId(ids, 'SportRadar') || providerId(ids, 'BetRadar');
  const kambiId = providerId(ids, 'Kambi');
  const pm = (kind) => (sportradarId ? opt(getJson(`https://widget.playmaker.ai/${kind}-${sportradarId}.json`, { headers: { 'User-Agent': BROWSER_UA, Referer: 'https://spela.svenskaspel.se/' }, retries: 1, orNull: true, label: 'PlayMaker' })) : null);
  const [xs, ts, kambi] = await Promise.all([
    pm('x-stats'), pm('ts'),
    kambiId ? opt(getJson(`https://eu.offering-api.kambicdn.com/offering/v2018/svenskaspel/betoffer/event/${kambiId}?lang=sv_SE&type=2,6,18`, { retries: 1, orNull: true, label: 'Kambi' })) : null,
  ]);
  const home = m.participants?.find((p) => p.type === 'home');
  const away = m.participants?.find((p) => p.type === 'away');
  return {
    eventNumber: ev.eventNumber,
    matchId: m.matchId,
    sportradarId,
    kambiId,
    home: home?.name || null,
    away: away?.name || null,
    league: m.league?.name || null,
    country: m.league?.country?.name || null,
    kickoff: m.matchStart || null,
    status: m.status || null,
    venue: sport?.venue?.name || null,
    season: sport?.seasonInfo || null,
    cancelled: !!ev.cancelled,
    comment: ev.eventComment || null,
    odds: trio(ev.odds),
    startOdds: trio(ev.startOdds),
    favouriteOdds: trio(ev.favouriteOdds), // oddsen omräknade till procent (utan marginal)
    svenskaFolket: trio(ev.svenskaFolket),
    svenskaFolketDate: ev.svenskaFolket?.date || null,
    tioTidningar: trio(ev.tioTidningarsTips),
    ...compactSporteventOdds(odds, productId),
    xStats: compactXStats(xs),
    teamStyle: compactTeamStyle(ts),
    kambi: compactKambi(kambi),
    news: news.map((r) => compactNews(r)),
  };
}

// ---------- Enetpulse via webbläsare ----------
async function openBrowser() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 }, locale: 'sv-SE', userAgent: BROWSER_UA });
  return { browser, ctx };
}

async function gotoTab(page, product, tab, n) {
  await page.goto(`https://spela.svenskaspel.se/${product}/${tab}?event=${n}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.click('button:has-text("Acceptera")', { timeout: 2500 }); } catch { /* redan godkänt */ }
  await page.waitForSelector('.wff_widget', { timeout: 30000 });
  // Widgeten ritas när krypterad data kommit; vänta tills texten slutat växa
  let prev = -1;
  for (let k = 0; k < 20; k++) {
    await page.waitForTimeout(500);
    const len = await page.evaluate(() => [...document.querySelectorAll('.wff_widget')].reduce((s, e) => s + e.innerText.length, 0));
    if (len > 50 && len === prev) break;
    prev = len;
  }
}
const widgetText = (page) => page.evaluate(() => [...document.querySelectorAll('.wff_widget')].filter((e) => !e.parentElement.closest('.wff_widget')).map((e) => e.innerText).join('\n'));
const noData = (t) => /Ingen Data Tillgänglig/i.test(t) && t.length < 200;

// Filterknappar i en widget ("Hemma", "Borta"), klickar och läser om texten
async function clickFilter(page, re) {
  const btns = page.locator('.wff_widget button, .wff_widget [role="tab"]');
  const n = await btns.count();
  for (let i = 0; i < n; i++) {
    const t = (await btns.nth(i).innerText().catch(() => '')).trim();
    if (re.test(t)) {
      await btns.nth(i).click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

async function statistik(page, product, n) {
  await gotoTab(page, product, 'statistik', n);
  const all = await widgetText(page);
  if (noData(all)) return null;
  const res = parseStatistik(all);
  // Hemma-/bortafilter: hemmalagets hemmamatcher och bortalagets bortamatcher
  if (await clickFilter(page, /Hemma$/)) {
    const h = parseStatistik(await widgetText(page));
    res.formHome = h.form[0] || null;
    res.h2hHome = h.h2h; // inbördes på hemmalagets plan
  }
  if (await clickFilter(page, /Borta$/)) {
    const a = parseStatistik(await widgetText(page));
    res.formAway = a.form[1] || a.form[0] || null;
    res.h2hAway = a.h2h;
  }
  return res;
}

async function tabell(page, product, n) {
  await gotoTab(page, product, 'tabell', n);
  const txt = await widgetText(page);
  if (noData(txt)) return null;
  const out = { total: parseTabell(txt) };
  if (!out.total.rows.length) return null;
  if (await clickFilter(page, /^Hemma$/)) out.home = parseTabell(await widgetText(page)).rows;
  if (await clickFilter(page, /^Borta$/)) out.away = parseTabell(await widgetText(page)).rows;
  return { rows: out.total.rows, legend: out.total.legend, home: out.home || null, away: out.away || null };
}

// Laguppställning: en flik per lag (button.wff_team_tab), läses ur DOM
async function lineupSide(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.wff_formation_generic_root') || document;
    const txt = (sel, el = w) => el.querySelector(sel)?.innerText.trim() || null;
    const team = txt('.wff_team_tab:not(.wff_not_selected) .wff_participant_name')?.split('\n').pop() || null;
    const starters = [...w.querySelectorAll('.wff_grid_participant')].map((p) => {
      const shirt = p.parentElement?.querySelector('.wff_participant_shirt_number')?.innerText.trim() || null;
      return { name: p.innerText.trim(), shirt, gk: p.classList.contains('wff_goalkeeper') };
    });
    const groups = [...w.querySelectorAll('.wff_formation_lineup_type_container')].map((g) => ({
      label: txt('.wff_formation_lineup_type_label', g),
      players: [...g.querySelectorAll('.wff_formation_lineup_type_participant')].map((p) => ({
        name: p.querySelector('.wff_formation_lineup_type_participant_name')?.innerText.trim() || p.innerText.trim().split('\n').pop(),
        reason: [...p.querySelectorAll('[class*="wff_icon_"]')].map((i) => [...i.classList].find((c) => c.startsWith('wff_icon_') && c !== 'wff_icon_container')).filter(Boolean).map((c) => c.replace('wff_icon_', ''))[0] || null,
      })),
    }));
    const unavailable = groups.find((g) => /otillgängliga/i.test(g.label || ''))?.players || [];
    const bench = groups.find((g) => /avbytare|ersättare|bänk/i.test(g.label || ''))?.players || [];
    const coach = w.querySelector('.wff_lineup_coach')?.innerText.trim().split('\n').pop() || null;
    return {
      team,
      confirmed: txt('.wff_lineup_confirmation_label'),
      formation: txt('.wff_team_formation')?.replace(/^Spelsystem\s*/i, '').split('\n').pop() || null,
      starters,
      bench,
      unavailable,
      coach,
    };
  });
}

async function laguppstallning(page, product, n) {
  await gotoTab(page, product, 'laguppstallning', n);
  if (noData(await widgetText(page))) return null;
  const home = await lineupSide(page);
  let away = null;
  const other = page.locator('.wff_team_tab.wff_not_selected').first();
  if (await other.count()) {
    await other.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1500);
    away = await lineupSide(page);
  }
  return { home, away };
}

async function enetPart(ctx, product, n) {
  const page = await ctx.newPage();
  const res = {};
  for (const [k, fn] of [['statistik', statistik], ['tabell', tabell], ['laguppstallning', laguppstallning]]) {
    for (let attempt = 1; attempt <= 2; attempt++) { // sidan tappar ibland laddningen, ett omförsök
      try { res[k] = await fn(page, product, n); break; } catch (e) { res[k] = null; log(`  match ${n} ${k} (försök ${attempt}): ${e.message.split('\n')[0]}`); }
    }
  }
  await page.close();
  return res;
}

// ---------- En produkt ----------
async function fetchProduct(product, ctx) {
  const productId = PRODUCT_ID[product];
  const res = await opt(svs(`${API}/draw/1/${product}/draws`, { schema: svsSchemas.draws }));
  const draw = (res?.draws || []).find((d) => d.drawEvents?.length);
  if (!draw) { log(`${product}: ingen öppen omgång`); return null; }
  log(`${product}: omgång ${draw.drawNumber}, ${draw.drawEvents.length} matcher`);
  const [experts, analyses] = await Promise.all([gameAnalyses(productId, draw.drawNumber), drawAnalyses(productId, draw.drawNumber)]);
  const events = await pool(draw.drawEvents, 4, (ev) => apiPart(product, productId, ev));
  for (const e of events) e.experts = experts.get(e.eventNumber) || [];
  if (ctx) {
    const enet = await pool(events, 3, (e) => (e.cancelled ? null : enetPart(ctx, product, e.eventNumber)));
    events.forEach((e, i) => {
      const x = enet[i] || {};
      e.form = x.statistik?.form || null;
      e.formHome = x.statistik?.formHome || null;
      e.formAway = x.statistik?.formAway || null;
      e.h2h = x.statistik?.h2h || null;
      e.h2hHome = x.statistik?.h2hHome || null;
      e.h2hAway = x.statistik?.h2hAway || null;
      e.winProbability = x.statistik?.winProbability || null;
      e.table = x.tabell || null;
      e.lineups = x.laguppstallning || null;
    });
  }
  const out = {
    updatedAt: new Date().toISOString(),
    product,
    productName: draw.productName,
    drawNumber: draw.drawNumber,
    regCloseTime: draw.regCloseTime,
    turnover: num(draw.currentNetSale),
    fund: draw.fund || null,
    drawComment: draw.drawComment || null,
    browser: !!ctx,
    drawAnalyses: analyses,
    events: events.sort((a, b) => a.eventNumber - b.eventNumber),
  };
  fs.mkdirSync(path.join(OUT_DIR, 'arkiv'), { recursive: true });
  const json = JSON.stringify(out);
  fs.writeFileSync(path.join(OUT_DIR, `${product}.json`), json, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'arkiv', `${product}-${draw.drawNumber}.json`), json, 'utf8');
  const cnt = (f) => events.filter(f).length;
  log(`  xStats ${cnt((e) => e.xStats)}, Kambi-spel ${cnt((e) => e.kambi.length)}, nyheter ${events.reduce((s, e) => s + e.news.length, 0)}, experter ${events.reduce((s, e) => s + e.experts.length, 0)}, omgångsanalyser ${analyses.length}`);
  if (ctx) log(`  form ${cnt((e) => e.form?.length)}, inbördes ${cnt((e) => e.h2h?.matches.length)}, vinstchans ${cnt((e) => e.winProbability)}, tabell ${cnt((e) => e.table)}, laguppställning ${cnt((e) => e.lineups?.home?.starters.length)}`);
  log(`  -> ${path.relative(root, path.join(OUT_DIR, `${product}.json`))}`);
  return out;
}

let b = null;
try {
  if (!NO_BROWSER) {
    try { b = await openBrowser(); } catch (e) { log(`Webbläsaren startade inte (${e.message.split('\n')[0]}) – hämtar utan statistik/tabell/laguppställning`); }
  }
  for (const p of PRODUCTS) {
    if (!PRODUCT_ID[p]) { log(`Okänd produkt: ${p}`); continue; }
    await fetchProduct(p, b?.ctx || null);
  }
} finally {
  await b?.browser.close();
}
