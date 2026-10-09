// Sammanställning av omgångens Stryktipset-/Europatipset-kuponger (A, B, C) som PDF.
// Användning: node scripts/stryk-pdf.mjs [stryktipset|europatipset]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const productKey = process.argv[2] || 'stryktipset';
const data = JSON.parse(readFileSync('data/stryktipset.json', 'utf8'));
const p = data.products.find((x) => x.product === productKey);
if (!p) throw new Error(`Hittar inte ${productKey} i data/stryktipset.json`);

const SIGNS = ['1', 'X', '2'];
const pct = (v) => `${Math.round(v * 100)}`;
const kr = (v) => Math.round(v).toLocaleString('sv-SE').replace(/\u00a0/g, ' ');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tz = { timeZone: 'Europe/Stockholm' };
const dayTime = (iso) => new Date(iso).toLocaleString('sv-SE', { ...tz, weekday: 'short', hour: '2-digit', minute: '2-digit' });
const closeDate = new Date(p.regCloseTime);
const dateStr = closeDate.toLocaleDateString('sv-SE', tz);

function signsFromUrl(url) {
  const q = new URL(url).searchParams;
  const cols = ['v1', 'vX', 'v2'].map((k) => q.get(k).split(',').map(Number));
  return p.events.map((_, i) => SIGNS.filter((_, s) => cols[s][i] > 0).join(''));
}

function shares(rowList) {
  return p.events.map((_, i) => SIGNS.map((s) => rowList.filter((r) => r[i] === s).length / rowList.length));
}

const coupons = [
  { key: 'A', name: 'Kupong A', sys: p.reduced, color: '#1d6b3a', desc: 'Högst utdelning' },
  { key: 'B', name: 'Kupong B', sys: p.reducedB, color: '#1f4e8c', desc: 'Motsystem' },
  { key: 'C', name: 'Kupong C', sys: p.reducedC, color: '#8a4b0f', desc: 'Eget större system (rekommenderas)' },
].filter((c) => c.sys?.rowList?.length);
for (const c of coupons) {
  c.signs = signsFromUrl(c.sys.gamblingCabinUrl);
  c.shares = shares(c.sys.rowList);
  c.spikar = c.signs.filter((s) => s.length === 1).length;
  c.halv = c.signs.filter((s) => s.length === 2).length;
  c.hel = c.signs.filter((s) => s.length === 3).length;
}
const unionHit = p.reducedB?.unionHit;
const totalCost = coupons.reduce((a, c) => a + c.sys.cost, 0);
const oneIn = (h) => `1 på ${kr(1 / h)}`;

function probBar(probs, folk) {
  return `<div class="pb">${probs.map((v, s) => {
    const diff = folk ? v - folk[s] : 0;
    const cls = diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : '';
    return `<div class="pbc"><span class="pbl">${SIGNS[s]}</span><span class="pbv ${cls}">${pct(v)}</span><span class="pbf">${folk ? pct(folk[s]) : ''}</span></div>`;
  }).join('')}</div>`;
}

function boxes(c, i) {
  return `<div class="bx">${SIGNS.map((s, k) => {
    const on = c.signs[i].includes(s);
    const sh = c.shares[i][k];
    const style = on ? `background:${c.color};opacity:${(0.35 + 0.65 * sh).toFixed(2)}` : '';
    return `<span class="b ${on ? 'on' : ''}" style="${style}" title="${pct(sh)} % av raderna">${s}</span>`;
  }).join('')}</div>`;
}

function injuries(side) {
  const pl = side?.players || [];
  return pl.filter((x) => x.share >= 0.04).sort((a, b) => b.share - a.share).slice(0, 3).map((x) => x.name);
}

function comment(e, i) {
  const out = [];
  const fav = e.spik?.fav;
  if (e.spik?.spikbar) out.push(`Spikbar: ${fav} har ${pct(e.spik.calibrated)} % justerat efter historiken (gräns 55 %).`);
  else if (e.spik) {
    const spiked = coupons.filter((c) => c.signs[i].length === 1).map((c) => c.key);
    out.push(spiked.length
      ? `${fav} har ${pct(e.spik.calibrated)} % justerat – under spikgränsen 55 %, men spikas i ${spiked.join('/')} eftersom omgången har för få spikbara matcher för budgeten. Ingen säker match.`
      : `${fav} är favorit med ${pct(e.spik.calibrated)} % justerat – under spikgränsen 55 %, garderas.`);
  }
  const sv = e.streckvarde || [];
  const over = sv.map((v, s) => [v, s]).filter(([v]) => v < 0.85);
  const under = sv.map((v, s) => [v, s]).filter(([v]) => v >= 1.25);
  if (over.length) out.push(`Folket överspelar ${over.map(([, s]) => `${SIGNS[s]} (${pct(e.folk[s])} % streck mot ${pct(e.final[s])} % chans)`).join(', ')}.`);
  if (under.length) out.push(`Streckvärde på ${under.map(([v, s]) => `${SIGNS[s]} (×${v.toFixed(2).replace('.', ',')})`).join(', ')}.`);
  const tab = (e.analysis || []).find((a) => a.startsWith('Tabell:'));
  if (tab) out.push(tab.replace(/^Tabell:\s*/, ''));
  const form = (e.analysis || []).find((a) => a.startsWith('Form senaste'));
  if (form) out.push(form.replace(/\s*\(nyast först\)/, ''));
  const luck = (e.analysis || []).find((a) => /poäng (mindre|mer) än spelet/.test(a));
  if (luck) out.push(luck);
  const ih = injuries(e.lineup?.home), ia = injuries(e.lineup?.away);
  if (ih.length || ia.length) out.push(`Frånvaro: ${[ih.length ? `${e.home}: ${ih.join(', ')}` : '', ia.length ? `${e.away}: ${ia.join(', ')}` : ''].filter(Boolean).join(' · ')}.`);
  if (e.thin) out.push('DATA TUNN – sänkt säkerhet.');
  return out;
}

const rowsHtml = p.events.map((e, i) => `
  <tr>
    <td class="n">${e.eventNumber}</td>
    <td class="m"><div class="teams">${esc(e.home)} – ${esc(e.away)}</div><div class="meta">${esc(e.league)} · ${dayTime(e.kickoff)}${e.spik?.spikbar ? ' · <b class="sp">spikbar</b>' : ''}</div></td>
    <td>${probBar(e.final, e.folk)}</td>
    ${coupons.map((c) => `<td class="c">${boxes(c, i)}</td>`).join('')}
  </tr>`).join('');

const cardsHtml = coupons.map((c) => `
  <div class="card" style="border-top-color:${c.color}">
    <div class="ch"><span class="cn" style="color:${c.color}">${c.name}</span><span class="cd">${c.desc}</span></div>
    <div class="big">${c.sys.rows} rader <span>· ${kr(c.sys.cost)} kr</span></div>
    <table class="kv">
      <tr><td>Grundrad</td><td>${kr(c.sys.grundRows)} rader → ${c.sys.rows}</td></tr>
      <tr><td>Spik / halv / hel</td><td>${c.spikar} / ${c.halv} / ${c.hel}</td></tr>
      <tr><td>Utdelning 13 rätt</td><td>≥ ${kr(c.sys.rules.payoutMin)} kr</td></tr>
      <tr><td>Teckenkrav</td><td>minst ${c.sys.rules.signMin.join('-')} (1-X-2)</td></tr>
      <tr><td>Chans 13 rätt</td><td>${oneIn(c.sys.hitAll)}</td></tr>
      <tr><td>Snittutdelning vid 13</td><td>${kr(c.sys.expectedPayout)} kr</td></tr>
    </table>
    <a class="gc" style="background:${c.color}" href="${esc(c.sys.gamblingCabinUrl)}">Öppna i Gambling Cabin</a>
  </div>`).join('');

const svList = p.events.flatMap((e) => (e.streckvarde || []).map((v, s) => ({ e, s, v })))
  .filter((x) => x.v >= 1.3).sort((a, b) => b.v - a.v).slice(0, 6);
const overList = p.events.flatMap((e) => (e.streckvarde || []).map((v, s) => ({ e, s, v })))
  .filter((x) => x.v < 0.82).sort((a, b) => a.v - b.v).slice(0, 5);

const commentsHtml = p.events.map((e, i) => `
  <div class="mc">
    <div class="mch"><span class="mn">${e.eventNumber}</span> ${esc(e.home)} – ${esc(e.away)}
      <span class="tags">${coupons.map((c) => `<span class="tag" style="background:${c.color}">${c.key}: ${c.signs[i]}</span>`).join('')}</span></div>
    <ul>${comment(e, i).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  </div>`).join('');

const valueWarn = p.value?.level === 'low' ? `<div class="warn">${esc(p.value.text)}</div>` : '';

const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>${esc(p.productName)} ${dateStr}</title>
<style>
@page { size: A4; margin: 12mm 11mm; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI", Arial, sans-serif; color: #1c2430; font-size: 9.5pt; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hero { background: linear-gradient(120deg, #0f3d24, #1d6b3a); color: #fff; border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: flex-end; }
.hero h1 { margin: 0; font-size: 22pt; letter-spacing: .5px; }
.hero .sub { opacity: .85; margin-top: 3px; }
.hero .right { text-align: right; font-size: 9pt; opacity: .95; }
.hero .right b { font-size: 13pt; display: block; }
.warn { margin: 8px 0 0; background: #fff4e0; border: 1px solid #f0c27a; color: #7a4a00; border-radius: 6px; padding: 6px 10px; font-size: 8.5pt; }
.cards { display: flex; gap: 8px; margin: 10px 0; }
.card { flex: 1; border: 1px solid #dde3ea; border-top: 4px solid; border-radius: 8px; padding: 8px 10px; background: #fbfcfd; }
.ch { display: flex; justify-content: space-between; align-items: baseline; }
.cn { font-weight: 700; font-size: 12pt; } .cd { font-size: 7.5pt; color: #6b7685; }
.big { font-size: 14pt; font-weight: 700; margin: 2px 0 4px; } .big span { font-size: 10pt; font-weight: 400; color: #4b5563; }
.kv { width: 100%; border-collapse: collapse; font-size: 8pt; } .kv td { padding: 1.5px 0; } .kv td:last-child { text-align: right; font-weight: 600; }
.gc { display: block; text-align: center; color: #fff; text-decoration: none; border-radius: 5px; padding: 4px; margin-top: 6px; font-weight: 600; font-size: 8.5pt; }
h2 { font-size: 12pt; margin: 12px 0 6px; color: #0f3d24; border-bottom: 2px solid #e3e8ee; padding-bottom: 3px; }
table.cp { width: 100%; border-collapse: collapse; }
.cp th { font-size: 7.5pt; text-transform: uppercase; color: #6b7685; font-weight: 600; text-align: left; padding: 3px 4px; border-bottom: 1px solid #cfd6de; }
.cp th.c { text-align: center; }
.cp td { padding: 4px; border-bottom: 1px solid #edf0f3; vertical-align: middle; }
.cp tr:nth-child(even) td { background: #f7f9fb; }
.n { width: 22px; font-weight: 700; font-size: 11pt; color: #0f3d24; text-align: center; }
.teams { font-weight: 600; font-size: 9.5pt; } .meta { font-size: 7.5pt; color: #6b7685; } .sp { color: #1d6b3a; }
.pb { display: flex; gap: 3px; } .pbc { width: 34px; text-align: center; border: 1px solid #e3e8ee; border-radius: 4px; background: #fff; padding: 1px 0; }
.pbl { display: block; font-size: 6.5pt; color: #8a94a3; } .pbv { display: block; font-weight: 700; font-size: 9pt; } .pbv.up { color: #1d7a3e; } .pbv.down { color: #b42318; }
.pbf { display: block; font-size: 6.5pt; color: #6b7685; }
.c { text-align: center; width: 92px; }
.bx { display: inline-flex; gap: 3px; } .b { width: 22px; height: 22px; line-height: 20px; border: 1.5px solid #c5ccd5; border-radius: 4px; font-weight: 700; font-size: 9pt; color: #b8c0ca; background: #fff; }
.b.on { color: #fff; border-color: transparent; }
.legend { font-size: 7.5pt; color: #6b7685; margin-top: 5px; }
.two { display: flex; gap: 10px; } .two > div { flex: 1; }
.box { border: 1px solid #e3e8ee; border-radius: 8px; padding: 6px 10px; background: #fbfcfd; font-size: 8.5pt; }
.box ul { margin: 3px 0 0 14px; padding: 0; } .box li { margin: 1.5px 0; }
.page2 { break-before: page; }
.grid { columns: 2; column-gap: 10px; }
.mc { break-inside: avoid; border: 1px solid #e3e8ee; border-radius: 7px; padding: 5px 8px; margin-bottom: 7px; background: #fff; }
.mch { font-weight: 700; font-size: 9pt; } .mn { display: inline-block; width: 18px; height: 18px; line-height: 18px; text-align: center; border-radius: 50%; background: #0f3d24; color: #fff; font-size: 8pt; margin-right: 3px; }
.tags { float: right; } .tag { color: #fff; border-radius: 3px; padding: 0 4px; font-size: 7pt; margin-left: 2px; font-weight: 600; }
.mc ul { margin: 3px 0 0 13px; padding: 0; font-size: 7.6pt; color: #374151; } .mc li { margin: 1px 0; }
.foot { margin-top: 8px; font-size: 7pt; color: #8a94a3; }
</style></head><body>
<div class="hero">
  <div><h1>${esc(p.productName)}</h1><div class="sub">${esc(p.comment || '')} · omgång ${p.drawNumber}</div></div>
  <div class="right"><b>${kr(totalCost)} kr totalt</b>Spelstopp ${closeDate.toLocaleString('sv-SE', { ...tz, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}<br>Omsättning just nu ${kr(Number(String(p.turnover).replace(',', '.')))} kr</div>
</div>
${valueWarn}
<div class="cards">${cardsHtml}</div>
${unionHit ? `<div class="legend">A och B tillsammans: chans till 13 rätt ${oneIn(unionHit)} (${p.reducedB.overlapRows} gemensam rad, ${p.reducedB.sameSingles} gemensamma spikar).</div>` : ''}

<h2>Så är det tippat</h2>
<table class="cp">
  <tr><th></th><th>Match</th><th>Vår chans % / folket %</th>${coupons.map((c) => `<th class="c" style="color:${c.color}">${c.name}</th>`).join('')}</tr>
  ${rowsHtml}
</table>
<div class="legend">Ifyllda rutor = tecken med i kupongen. Mörkare färg = större andel av raderna. Grön siffra = vi tror mer än folket (streckvärde), röd = folket överspelar.</div>

<div class="two" style="margin-top:10px">
  <div class="box"><b>Streckvärde – vi tror mer än folket</b><ul>${svList.map((x) => `<li>${x.e.eventNumber}. ${esc(x.e.home)}–${esc(x.e.away)}: <b>${SIGNS[x.s]}</b> ${pct(x.e.final[x.s])} % mot ${pct(x.e.folk[x.s])} % streck</li>`).join('')}</ul></div>
  <div class="box"><b>Överstreckat – folket tror för mycket</b><ul>${overList.map((x) => `<li>${x.e.eventNumber}. ${esc(x.e.home)}–${esc(x.e.away)}: <b>${SIGNS[x.s]}</b> ${pct(x.e.folk[x.s])} % streck mot ${pct(x.e.final[x.s])} % chans</li>`).join('')}</ul></div>
</div>

<div class="page2">
<h2>Matcherna i korthet</h2>
<div class="grid">${commentsHtml}</div>
<div class="box" style="margin-top:4px"><b>Bra att veta</b><ul>
  <li>Chanserna är 90 % skarpa odds (Pinnacle) och 10 % egen modell. Spik bara när justerad favoritchans är minst 55 %.</li>
  <li>Bara 12–13 rätt brukar betala. Teckenkravet ${coupons[0]?.sys.rules.signMin.join('-')} släpper igenom rätt rad i ungefär 7–8 omgångar av 10.</li>
  <li>Startelvor och sena odds kan ändra kupongen – kör gärna sen körning strax före spelstopp.</li>
  <li>Inget här är en garanti. Spela för pengar du har råd att förlora.</li>
</ul></div>
<div class="foot">Data uppdaterad ${new Date(data.updatedAt).toLocaleString('sv-SE', tz)} · Källa: ${esc(data.source)}</div>
</div>
</body></html>`;

mkdirSync('docs/stryktipset', { recursive: true });
const base = `docs/stryktipset/${dateStr}-${productKey}`;
writeFileSync(`${base}.html`, html);

const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const browser = browsers.find(existsSync);
if (!browser) throw new Error('Hittar varken Edge eller Chrome för PDF-utskrift');
execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${resolve(`${base}.pdf`)}`, pathToFileURL(resolve(`${base}.html`)).href], { stdio: 'ignore' });
console.log(`Klart -> ${base}.pdf`);
