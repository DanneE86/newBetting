// En fil per liga med alla matcher (spelade + kommande) for traning: data/matcher/<LIGA>.csv
// Spelade: resultat, skott, xG, oppnings-/slutodds (sannolikhet utan marginal), basta pris, over 2,5, signalerna
// fran scripts/lib/learnings-signals.mjs (bara data fore matchen). Ligor utan oddshistorik tas fran betting-store.
// Kommande: fran data/upcoming-fixtures.json med dagens signaler och odds (data/open/upcoming_odds.json).
// Oddsen vi sag fore matchen sparas i pre_first_* / pre_last_* och foljer med nar matchen blir spelad,
// sa att filen byggs pa over tid (kors varje dag i pipelinen). Kors: npm run matcher
import fs from 'node:fs';
import path from 'node:path';
import { buildSignals, h2hFeatures, pairKey, sideState, teamKey } from './lib/learnings-signals.mjs';
import { root } from './lib/learnings-data.mjs';
import { nameScore } from './lib/match-context.mjs';
import { canonTeam } from './lib/team-aliases.mjs';

const DIR = path.join(root, 'data', 'matcher');
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return d; } };
const COLS = [
  'status', 'league', 'season', 'date', 'kickoff', 'home', 'away', 'hg', 'ag', 'res', 'hs', 'as', 'hst', 'ast', 'xg_h', 'xg_a', 'xg_src',
  'referee', 'hc', 'ac', 'hf', 'af', 'hy', 'ay', 'hr', 'ar',
  'open_h', 'open_d', 'open_a', 'close_h', 'close_d', 'close_a', 'pin_close', 'best_open_h', 'best_open_d', 'best_open_a',
  'best_close_h', 'best_close_d', 'best_close_a', 'over25_open', 'over25_close',
  'luck', 'gap', 'mres', 'rest', 'h2h_n', 'h2h_pts', 'h2h_res', 'h2h_draw', 'promo', 'releg', 'miss_h', 'miss_a', 'steam', 'book',
  'pre_first_at', 'pre_first_h', 'pre_first_d', 'pre_first_a', 'pre_last_at', 'pre_last_h', 'pre_last_d', 'pre_last_a', 'pre_best_h', 'pre_best_d', 'pre_best_a',
];
const PRE = COLS.filter((c) => c.startsWith('pre_'));
const r4 = (x) => (x == null || !Number.isFinite(x) ? '' : String(Math.round(x * 1e4) / 1e4));
const cell = (v) => {
  if (v == null) return '';
  const s = typeof v === 'number' ? r4(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const key = (r) => `${r.date}|${r.home}|${r.away}`;

function parseCsv(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines[0].split(',');
  return lines.slice(1).map((l) => {
    const c = [];
    let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { c.push(cur); cur = ''; } else cur += ch;
    }
    c.push(cur);
    return Object.fromEntries(head.map((h, i) => [h, c[i] ?? '']));
  });
}

const signalCols = (f) => ({
  luck: f.luck, gap: f.gap, mres: f.mres, rest: f.rest, h2h_n: f.h2hN, h2h_pts: f.h2hPts, h2h_res: f.h2hRes, h2h_draw: f.h2hDraw,
  promo: f.promo, releg: f.releg, miss_h: f.missH, miss_a: f.missA, steam: f.steam, book: f.book,
});

const { matches, teamState, h2hState, seasonTeams, seasonsByLeague } = buildSignals({ log: () => {} });
const store = readJson(path.join(root, 'data', 'betting-store.json'), { matches: [] });
// Samma lag med olika stavning -> ett namn (config/team-aliases.json)
store.matches = store.matches.map((m) => ({ ...m, home: canonTeam(m.league, m.home), away: canonTeam(m.league, m.away) }));
const storeByKey = new Map(store.matches.map((m) => [`${m.league}|${m.date}|${m.home}|${m.away}`, m]));
// Domare, horn, frisparkar, kort, avspark fran store (football-data, 2023/24-)
const extra = (m) => {
  const d = m?.discipline ?? {};
  return { kickoff: m?.kickoff ?? null, referee: m?.referee ?? null, hc: d.homeCorners, ac: d.awayCorners, hf: d.homeFouls, af: d.awayFouls, hy: d.homeYellow, ay: d.awayYellow, hr: d.homeRed, ar: d.awayRed };
};
const byLeague = new Map();
for (const m of matches) {
  (byLeague.get(m.league) ?? byLeague.set(m.league, []).get(m.league)).push({
    status: 'spelad', league: m.league, season: m.season, date: m.date, home: m.home, away: m.away, hg: m.hg, ag: m.ag, res: m.res,
    hs: m.hs, as: m.as, hst: m.hst, ast: m.ast, xg_h: m.xg?.[0], xg_a: m.xg?.[1], xg_src: m.xgSrc,
    open_h: m.open?.[0], open_d: m.open?.[1], open_a: m.open?.[2],
    close_h: m.hasClose ? m.close[0] : null, close_d: m.hasClose ? m.close[1] : null, close_a: m.hasClose ? m.close[2] : null,
    pin_close: m.pinClose ? 1 : 0,
    best_open_h: m.bestOpen?.[0], best_open_d: m.bestOpen?.[1], best_open_a: m.bestOpen?.[2],
    best_close_h: m.bestClose?.[0], best_close_d: m.bestClose?.[1], best_close_a: m.bestClose?.[2],
    over25_open: m.overOpen, over25_close: m.overClose, ...signalCols(m.f), ...extra(storeByKey.get(`${m.league}|${m.date}|${m.home}|${m.away}`)),
  });
}

// Ligor utan oddshistorik i fd-filerna: resultat fran betting-store (ESPN, TheSportsDB, FotMob)
for (const m of store.matches) {
  if (byLeague.has(m.league) && matches.some((x) => x.league === m.league)) continue;
  if (!Number.isFinite(m.hg)) continue;
  (byLeague.get(m.league) ?? byLeague.set(m.league, []).get(m.league)).push({
    status: 'spelad', league: m.league, season: m.season, date: m.date, kickoff: m.kickoff, home: m.home, away: m.away, hg: m.hg, ag: m.ag, res: m.result,
    hs: m.shots?.home, as: m.shots?.away, hst: m.shots?.homeSot, ast: m.shots?.awaySot, ...extra(m),
  });
}

// Kommande matcher: lagnamn -> historikens namn i samma liga
const fixtures = readJson(path.join(root, 'data', 'upcoming-fixtures.json'), []);
const oddsEvents = readJson(path.join(root, 'data', 'open', 'upcoming_odds.json'), { events: [] }).events ?? [];
const now = new Date().toISOString();
const today = now.slice(0, 10);
const known = new Map(); // liga -> lagnamn
for (const [lg, list] of byLeague) known.set(lg, [...new Set(list.slice(-800).flatMap((r) => [r.home, r.away]))]);
const mapName = (lg, name) => {
  const names = known.get(lg) ?? [];
  if (names.includes(name)) return name;
  let best = null;
  for (const t of names) { const s = nameScore(name, null, t); if (s >= 0.5 && (!best || s > best.s)) best = { s, t }; }
  return best?.t ?? name;
};
function liveOdds(f) {
  const e = oddsEvents.find((x) => x.league === f.league && x.commence && Math.abs(Date.parse(x.commence.slice(0, 10)) - Date.parse(f.date)) <= 864e5
    && nameScore(f.home, null, x.homeRaw ?? x.home) >= 0.5 && nameScore(f.away, null, x.awayRaw ?? x.away) >= 0.5);
  const books = (e?.books ?? []).filter((b) => b.home > 1 && b.draw > 1 && b.away > 1);
  if (!books.length) return null;
  const inv = books.map((b) => [1 / b.home, 1 / b.draw, 1 / b.away]);
  const avg = [0, 1, 2].map((i) => inv.reduce((s, x) => s + x[i] / (x[0] + x[1] + x[2]), 0) / inv.length);
  return { p: avg, best: [0, 1, 2].map((i) => Math.max(...books.map((b) => [b.home, b.draw, b.away][i]))), kickoff: e.commence };
}

fs.mkdirSync(DIR, { recursive: true });
let totalUp = 0;
const leagues = new Set([...byLeague.keys(), ...fixtures.map((f) => f.league)]);
for (const lg of [...leagues].sort()) {
  const file = path.join(DIR, `${lg}.csv`);
  const prev = parseCsv(file).map((r) => ({ ...r, home: canonTeam(lg, r.home), away: canonTeam(lg, r.away) }));
  const prevPre = new Map(prev.filter((r) => r.pre_first_at).map((r) => [key(r), r]));
  const rows = byLeague.get(lg) ?? [];
  const played = new Set(rows.map(key));
  const up = [];
  for (const f of fixtures.filter((x) => x.league === lg && x.date >= today)) {
    const home = canonTeam(lg, mapName(lg, canonTeam(lg, f.home))), away = canonTeam(lg, mapName(lg, canonTeam(lg, f.away)));
    const r = { status: 'kommande', league: lg, season: seasonsByLeague[lg]?.at(-1) ?? '', date: f.date, kickoff: f.kickoffUtc ?? '', home, away };
    if (played.has(key(r))) continue;
    const hk = teamKey(lg, home), ak = teamKey(lg, away);
    const H = sideState(teamState.get(hk), f.date), A = sideState(teamState.get(ak), f.date);
    const sig = {};
    if (H.luck != null && A.luck != null) sig.luck = H.luck - A.luck;
    if (H.gap != null && A.gap != null) sig.gap = H.gap - A.gap;
    if (H.mres != null && A.mres != null) sig.mres = H.mres - A.mres;
    if (H.rest != null && A.rest != null && H.rest <= 30 && A.rest <= 30) sig.rest = Math.max(-7, Math.min(7, H.rest - A.rest));
    Object.assign(sig, h2hFeatures(h2hState.get(pairKey(hk, ak)), hk, f.date) ?? {});
    Object.assign(r, signalCols(sig));
    const o = liveOdds(f);
    if (o) {
      r.kickoff ||= o.kickoff;
      Object.assign(r, { pre_last_at: now, pre_last_h: o.p[0], pre_last_d: o.p[1], pre_last_a: o.p[2], pre_best_h: o.best[0], pre_best_d: o.best[1], pre_best_a: o.best[2] });
    }
    up.push(r);
  }
  // Oddsen fore matchen foljer med: forsta avlasningen behalls, senaste uppdateras
  for (const r of [...rows, ...up]) {
    const p = prevPre.get(key(r));
    if (!p) {
      if (r.pre_last_at) Object.assign(r, { pre_first_at: r.pre_last_at, pre_first_h: r.pre_last_h, pre_first_d: r.pre_last_d, pre_first_a: r.pre_last_a });
      continue;
    }
    for (const c of ['pre_first_at', 'pre_first_h', 'pre_first_d', 'pre_first_a']) r[c] = p[c];
    if (!r.pre_last_at) for (const c of PRE.filter((x) => !x.startsWith('pre_first'))) r[c] = p[c];
  }
  // Kommande rader fran forra korningen som varken spelats eller finns i schemat (flyttade matcher) behalls
  const upKeys = new Set(up.map(key));
  const kept = prev.filter((r) => r.status === 'kommande' && r.date >= today && !played.has(key(r)) && !upKeys.has(key(r)));
  const out = [...rows, ...kept, ...up].sort((a, b) => a.date.localeCompare(b.date) || a.home.localeCompare(b.home));
  if (!out.length) continue;
  fs.writeFileSync(file, `${COLS.join(',')}\n${out.map((r) => COLS.map((c) => cell(r[c])).join(',')).join('\n')}\n`, 'utf8');
  totalUp += up.length + kept.length;
  console.log(`${lg.padEnd(5)} ${String(rows.length).padStart(6)} spelade, ${up.length + kept.length} kommande`);
}
fs.writeFileSync(path.join(DIR, 'README.md'), `# Matcher per liga

En CSV per liga med alla matcher vi har: \`status\` = spelad eller kommande. Genereras av \`npm run matcher\` (körs dagligen). Rör inte för hand.

- Sannolikheter (\`open_*\`, \`close_*\`, \`pre_*\`) är utan bolagsmarginal. \`pin_close\` = 1 när stängningen är Pinnacle (annars bolagssnitt).
- \`best_*\` = bästa odds bland bolagen. \`over25_*\` = sannolikhet för över 2,5 mål.
- Signalerna (\`luck\`, \`gap\`, \`mres\`, \`rest\`, \`h2h_*\`, \`promo\`, \`releg\`, \`miss_*\`, \`steam\`, \`book\`) använder bara data före matchen, hemmalaget minus bortalaget. Se \`docs/lardomar/README.md\`.
- \`pre_first_*\` / \`pre_last_*\` = oddsen vi såg innan matchen (första och senaste avläsning, bolagssnitt i Sverige). De följer med när matchen blir spelad, så filen byggs på över tid.
- xG: \`xg_src\` = understat (topp 5) eller skott (uppskattat från skott och skott på mål).
- \`referee\`, hörnor \`hc/ac\`, frisparkar \`hf/af\`, gula \`hy/ay\`, röda \`hr/ar\` (där källan har det, främst 2023/24 och senare).

Relaterat, också per liga och med historik: aktuella trupper (skador, betyg, mål, marknadsvärde, vilka som lämnat, tränarbyten) i \`data/trupper/<liga>.json\` och tabell med daglig tabellhistorik i \`data/ligor/<liga>.json\` (\`npm run trupper\`). Lärdomar per liga och lag: \`docs/lardomar/\`.
`, 'utf8');
console.log(`Skrev ${path.relative(root, DIR)} (${leagues.size} ligor, ${totalUp} kommande matcher)`);
