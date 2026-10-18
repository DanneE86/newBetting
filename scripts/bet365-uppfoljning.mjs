// Uppföljning av bet365-analyserna: jämför varje bedömd rad med utfallet i FotMob/Opta-datan.
// Visar om chanserna stämde (per chansgrupp) och hur Värde ja-spelen gick (netto i insatser, platt insats).
//   node scripts/bet365-uppfoljning.mjs --hamta        (hämtar först PL/SA-matcherna från FotMob)
//   node scripts/bet365-uppfoljning.mjs 2026-10-18     (bara analyser som börjar så)
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { loadMatches, norm } from './lib/tackling-model.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AN = path.join(ROOT, 'data', 'bet365', 'analys');
const OUT = path.join(ROOT, 'data', 'bet365', 'uppfoljning');
const pct = (p) => `${Math.round(p * 100)} %`;
const season = (d) => { const y = +d.slice(0, 4), m = +d.slice(5, 7); return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };

// Utfall för en analys: FotMob-matchen samma dag med samma lag
export function findResult(a, matches) {
  const [t0, t1] = Object.keys(a.teams || {}), h = a.teams?.[t0], w = a.teams?.[t1];
  const m = matches.find((x) => x.d.slice(0, 10) === a.date && ((x.h === h && x.a === w) || (x.h === w && x.a === h)));
  if (!m) return null;
  const flip = m.h !== h;
  const teamTkl = { [t0]: m.tkl[flip ? 1 : 0], [t1]: m.tkl[flip ? 0 : 1] };
  const players = {};
  for (const p of m.players) players[norm(p.n)] = p;
  return { m, teamTkl, total: m.tkl[0] + m.tkl[1], players };
}

// Alla bedömda rader med utfall. Spelare som inte spelade = struken (bet365 betalar tillbaka)
export function settle(a, r) {
  const rows = [];
  for (const p of a.players) {
    if (!p.lines) continue;
    const k = norm(p.name);
    const pl = r.players[k] || Object.values(r.players).find((x) => norm(x.n).split(' ').pop() === k.split(' ').pop() && norm(x.n)[0] === k[0]);
    for (const l of p.lines) {
      if (!pl || !pl.min) { rows.push({ what: `${p.name} ${l.line}`, ...l, void: true }); continue; }
      rows.push({ what: `${p.name} ${l.line}`, odds: l.odds, p: l.p, value: l.value, hit: pl.tkl >= l.k, actual: pl.tkl });
    }
  }
  for (const t of [...a.total, ...a.team]) {
    const actual = t.market === 'Matchen totalt' ? r.total : r.teamTkl[t.market];
    if (actual == null) continue;
    for (const side of ['over', 'under']) {
      const s = t[side];
      rows.push({ what: `${t.market} ${side === 'over' ? 'över' : 'under'} ${t.line}`, odds: s.odds, p: s.p, value: s.value,
        hit: side === 'over' ? actual > t.line : actual < t.line, actual });
    }
  }
  return rows;
}

// Chansgrupper: väntat (snitt av chanserna) mot faktiskt
export function calibrationTable(rows, edges = [0, 0.3, 0.5, 0.7, 0.85, 1.01]) {
  const out = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const g = rows.filter((r) => !r.void && r.p >= edges[i] && r.p < edges[i + 1]);
    if (g.length) out.push({ from: edges[i], to: Math.min(1, edges[i + 1]), n: g.length, expected: g.reduce((s, r) => s + r.p, 0) / g.length, actual: g.filter((r) => r.hit).length / g.length });
  }
  return out;
}

export function valueResult(rows) {
  const v = rows.filter((r) => r.value && !r.void);
  return { n: v.length, hits: v.filter((r) => r.hit).length, net: v.reduce((s, r) => s + (r.hit ? r.odds - 1 : -1), 0), rows: v };
}

async function main() {
  if (process.argv.includes('--hamta'))
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'fetch-fotmob-matcher.mjs'), '--leagues', 'PL,SA', '--current'], { stdio: 'inherit' });
  const pre = process.argv.slice(2).find((x) => /^\d{4}/.test(x)) || '';
  const today = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(AN).filter((f) => f.endsWith('.json') && f.startsWith(pre) && f.slice(0, 10) < today).sort();
  const cache = {}, all = [], L = ['# Uppföljning bet365-tacklingar', ''];
  for (const f of files) {
    const a = JSON.parse(fs.readFileSync(path.join(AN, f), 'utf8'));
    const lg = a.league || 'PL', s = season(a.date);
    const ms = (cache[lg + s] ??= loadMatches(path.join(ROOT, 'data'), lg, [s]));
    const r = findResult(a, ms);
    if (!r) { L.push(`- ${a.league}: ${a.match}: inget utfall i FotMob-datan än (kör med --hamta)`); continue; }
    const rows = settle(a, r); all.push(...rows);
    const v = valueResult(rows);
    L.push(`## ${lg}: ${a.match} (${a.when})`, `Tacklingar: ${Object.entries(r.teamTkl).map(([k, x]) => `${k} ${x}`).join(', ')}, totalt ${r.total}`,
      `Värde ja: ${v.n} spel, ${v.hits} träffar, netto ${v.net >= 0 ? '+' : ''}${v.net.toFixed(2)} insatser`, '');
    if (v.n) { L.push('| Spel | Odds | Chans | Utfall | Träff |', '|---|---|---|---|---|'); for (const x of v.rows) L.push(`| ${x.what} | ${x.odds} | ${pct(x.p)} | ${x.actual} | ${x.hit ? 'Ja' : 'Nej'} |`); L.push(''); }
  }
  if (all.length) {
    L.push('## Stämde chanserna?', '| Chans | Antal | Väntat | Faktiskt |', '|---|---|---|---|');
    for (const c of calibrationTable(all)) L.push(`| ${pct(c.from)}–${pct(c.to)} | ${c.n} | ${pct(c.expected)} | ${pct(c.actual)} |`);
    const v = valueResult(all);
    L.push('', `**Alla Värde ja:** ${v.n} spel, ${v.hits} träffar, netto ${v.net >= 0 ? '+' : ''}${v.net.toFixed(2)} insatser (platt insats). Strukna spelare räknas inte.`);
  }
  const md = L.join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, `uppfoljning${pre ? '_' + pre : ''}.md`), md);
  console.log(md);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
