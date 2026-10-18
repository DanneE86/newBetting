// Analyserar sparade bet365-odds (data/bet365/odds/*.json) med tacklingsmodellen.
// Skriver data/bet365/analys/<samma namn>.json och .md. Två listor per match: mest troligt (chans) och spelvärde.
//   node scripts/bet365-analys.mjs              (alla oddsfiler)
//   node scripts/bet365-analys.mjs 2026-10-18   (filer som börjar så)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildContext, analyzeMatch, residualPool, LIKELY, VALUE_EDGE } from './lib/tackling-model.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ODDS = path.join(ROOT, 'data', 'bet365', 'odds');
const OUT = path.join(ROOT, 'data', 'bet365', 'analys');
const pct = (p) => `${Math.round(p * 100)} %`;
const evs = (e) => `${e >= 0 ? '+' : ''}${Math.round(e * 100)} %`;
const vj = (b) => (b ? 'JA' : 'Nej');

// Alla spelbara alternativ i en platt lista
export function flatten(a) {
  const rows = [];
  for (const p of a.players) for (const l of p.lines || [])
    rows.push({ what: `${p.name} ${l.line} tacklingar`, team: p.team, odds: l.odds, p: l.p, ev: l.ev, value: l.value,
      start: l.pStart != null ? { p: l.pStart, ev: l.evStart, value: l.valueStart } : null, avgMin: p.avgMin });
  for (const r of [...a.total, ...a.team]) for (const side of ['over', 'under']) {
    const s = r[side];
    rows.push({ what: `${r.market} ${side === 'over' ? 'över' : 'under'} ${r.line}`, team: r.market, odds: s.odds, p: s.p, ev: s.ev, value: s.value });
  }
  return rows;
}

export function report(a) {
  const rows = flatten(a);
  const L = [`## ${a.league ? a.league + ': ' : ''}${a.match} (${a.when})`, ''];
  if (!rows.length) return [...L, 'Inga tacklingsmarknader öppna på bet365 ännu.', ''].join('\n');
  if (a.expected) L.push(`Väntade tacklingar: ${Object.entries(a.expected).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`, '');
  // lag/match där modellen och bet365 är oense (chanserna utgår ändå från bet365:s nivå)
  const seen = new Set();
  for (const r of [...a.total, ...a.team]) {
    if (seen.has(r.market) || r.agree !== false) continue; seen.add(r.market);
    L.push(`${r.market}: modellen ${r.mu.toFixed(1)}, bet365 ${r.mid}: oense med ${Math.abs(r.gap).toFixed(1)} tacklingar. Chanserna räknas från bet365:s nivå, eftersom oddsen haft rätt vid oenighet.`);
  }
  if (seen.size) L.push('');
  const likely = rows.filter((r) => r.p >= LIKELY).sort((x, y) => y.p - x.p);
  L.push(`### Mest troligt (minst ${pct(LIKELY)} chans)`, '| Spel | Odds | Chans | Mot oddset | Värde |', '|---|---|---|---|---|');
  for (const r of likely) L.push(`| ${r.what} | ${r.odds} | ${pct(r.p)} | ${evs(r.ev)} | ${vj(r.value)} |`);
  const val = rows.filter((r) => r.value).sort((x, y) => y.ev - x.ev);
  L.push('', `### Spelvärde (minst +${Math.round(VALUE_EDGE * 100)} %)`);
  if (!val.length) L.push('Inget.');
  else { L.push('| Spel | Odds | Chans | Mot oddset |', '|---|---|---|---|'); for (const r of val) L.push(`| ${r.what} | ${r.odds} | ${pct(r.p)} | ${evs(r.ev)} |`); }
  const st = rows.filter((r) => r.start?.value && !r.value).sort((x, y) => y.start.ev - x.start.ev);
  if (st.length) {
    L.push('', '### Värde bara om spelaren startar', '| Spel | Odds | Chans om start | Mot oddset | Snittminuter senaste 6 |', '|---|---|---|---|---|');
    for (const r of st) L.push(`| ${r.what} | ${r.odds} | ${pct(r.start.p)} | ${evs(r.start.ev)} | ${Math.round(r.avgMin)} |`);
  }
  L.push('', '### Alla spel', '| Spel | Odds | Chans | Mot oddset | Värde |', '|---|---|---|---|---|');
  for (const r of rows) L.push(`| ${r.what} | ${r.odds} | ${pct(r.p)} | ${evs(r.ev)} | ${vj(r.value)} |`);
  const thin = a.players.filter((p) => p.note).map((p) => p.name);
  if (thin.length) L.push('', `För lite PL-data (ingen bedömning): ${thin.join(', ')}`);
  return L.join('\n') + '\n';
}

async function main() {
  const pre = process.argv[2] || '';
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(ODDS).filter((f) => f.endsWith('.json') && f.startsWith(pre)).sort();
  const ctxs = {}; // en modell per liga
  let pool = null; // lag/match-avvikelser ur fem ligor
  const ctxFor = (lg) => (ctxs[lg] ??= (() => { const c = { ...buildContext(path.join(ROOT, 'data'), lg), ...(pool ??= residualPool(path.join(ROOT, 'data'))) }; console.log(`Modell ${lg}: ${c.nMatches} matcher, spridning 1/k ${c.invK.toFixed(3)}`); return c; })());
  for (const f of files) {
    const odds = JSON.parse(fs.readFileSync(path.join(ODDS, f), 'utf8'));
    const a = analyzeMatch(odds, ctxFor(odds.league || 'PL'));
    a.league = odds.league || 'PL';
    a.oddsFetchedAt = odds.fetchedAt; a.analysedAt = new Date().toISOString();
    fs.writeFileSync(path.join(OUT, f), JSON.stringify(a, null, 1));
    const md = report(a);
    fs.writeFileSync(path.join(OUT, f.replace(/\.json$/, '.md')), md);
    console.log(md);
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
