// Datagranskning per liga: vad finns, vad saknas, var modellen ar svag.
//   node scripts/audit-leagues.mjs            -> data/open/league-audit.json + docs/analys/liga-datagranskning.md
//   node scripts/audit-leagues.mjs --quiet    (bara filer, ingen tabell i terminalen)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '')) : null;
};

const REG = readJson('config/leagues.json');
const store = readJson('data/betting-store.json');
const tips = readJson('data/tips-latest.json');
const fixtures = (() => {
  const u = readJson('data/upcoming-fixtures.json');
  return Array.isArray(u) ? u : u?.fixtures ?? [];
})();
const extra = readJson('data/open/extra_leagues.json');
const lineups = readJson('data/open/espn_lineups.json');
const venues = readJson('data/open/venues.json');

const today = new Date().toISOString().slice(0, 10);
const pct = (a, b) => (b ? a / b : null);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// Samma sasongslogik som store: senaste sasongen per liga
const matchesBy = new Map();
for (const m of store?.matches ?? []) {
  if (!matchesBy.has(m.league)) matchesBy.set(m.league, []);
  matchesBy.get(m.league).push(m);
}
const teamsBy = new Map();
for (const t of store?.teams ?? []) {
  if (!teamsBy.has(t.league)) teamsBy.set(t.league, []);
  teamsBy.get(t.league).push(t);
}
const tipsBy = new Map();
for (const t of tips?.allCandidates ?? []) {
  if (!t.date || t.date < today) continue;
  if (!tipsBy.has(t.league)) tipsBy.set(t.league, []);
  tipsBy.get(t.league).push(t);
}
const fxBy = new Map();
for (const f of fixtures) {
  if (!f.date || f.date < today) continue;
  if (!fxBy.has(f.league)) fxBy.set(f.league, []);
  fxBy.get(f.league).push(f);
}
const lineupBy = new Map();
for (const f of lineups?.fixtures ?? []) lineupBy.set(f.league, (lineupBy.get(f.league) ?? 0) + 1);

const venueTeams = new Set();
for (const v of Array.isArray(venues) ? venues : Object.values(venues?.teams ?? venues ?? {})) {
  if (v && typeof v === 'object' && v.league && v.team) venueTeams.add(`${v.league}|${v.team}`);
}

function hasCorners(m) {
  const c = m.corners ?? m.shots?.corners;
  if (c && (c.home != null || c.away != null)) return true;
  return m.hc != null || m.homeCorners != null;
}

function auditLeague(code, lg) {
  const ms = matchesBy.get(code) ?? [];
  const seasons = [...new Set(ms.map((m) => m.season))].sort();
  const cur = seasons.at(-1);
  const curMs = ms.filter((m) => m.season === cur);
  const lastDate = ms.map((m) => m.date).sort().at(-1) ?? null;
  const teams = teamsBy.get(code) ?? [];
  const up = tipsBy.get(code) ?? [];
  // Bolagen prissatter sallan mer an ~7 dagar fram: odds-tackning mats bara dar det gar att ha odds
  const soonLimit = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const soon = up.filter((t) => t.date <= soonLimit);
  const fx = fxBy.get(code) ?? [];
  const acc = tips?.accuracyByLeague?.[code] ?? store?.accuracyByLeague?.[code] ?? null;
  const accN = ['1X2', 'OU25', 'BTTS'].reduce((s, k) => s + (acc?.[k]?.tested ?? 0), 0);
  const accC = ['1X2', 'OU25', 'BTTS'].reduce((s, k) => s + (acc?.[k]?.correct ?? 0), 0);

  const r = {
    code,
    name: lg.name,
    history: lg.history,
    cup: Boolean(lg.cup),
    matches: ms.length,
    seasons: seasons.length,
    currentSeason: cur ?? null,
    currentSeasonMatches: curMs.length,
    lastResult: lastDate,
    staleDays: lastDate ? daysBetween(lastDate, today) : null,
    shotsShare: pct(ms.filter((m) => m.shots?.home != null).length, ms.length),
    cornersShare: pct(ms.filter(hasCorners).length, ms.length),
    closingOddsShare: pct(ms.filter((m) => m.closing && (m.closing.pinnacle_home || m.closing.avg_home || m.closing.b365_home)).length, ms.length),
    ouOddsShare: pct(ms.filter((m) => m.odds && (m.odds.over25 || m.odds.avg_over25 || m.odds.b365_over25 || m.odds.pinnacle_over25)).length, ms.length),
    refereeShare: pct(ms.filter((m) => m.referee).length, ms.length),
    teams: teams.length,
    clubEloShare: pct(teams.filter((t) => t.eloSource === 'clubelo').length, teams.length),
    xgShare: pct(teams.filter((t) => t.xg).length, teams.length),
    teamCornersShare: pct(teams.filter((t) => (t.corners?.played ?? 0) >= 2).length, teams.length),
    venueShare: pct(teams.filter((t) => venueTeams.has(`${code}|${t.name}`)).length, teams.length),
    upcomingFixtures: fx.length,
    upcomingTips: up.length,
    tipsSoon: soon.length,
    tipsWithOdds: pct(soon.filter((t) => t.pro?.odds?.home > 1).length, soon.length),
    tipsWithOuOdds: pct(soon.filter((t) => t.pro?.odds?.over25 > 1).length, soon.length),
    tipsWithOddsAll: pct(up.filter((t) => t.pro?.odds?.home > 1).length, up.length),
    tipsMarketOnly: pct(up.filter((t) => t.marketOnly).length, up.length),
    tipsDcKnown: pct(up.filter((t) => t.pro?.dc?.knownTeams).length, up.length),
    tipsCorners: pct(up.filter((t) => t.tips?.CORNERS).length, up.length),
    lineupRows: lineupBy.get(code) ?? 0,
    hitrate: accN ? accC / accN : null,
    hitrateN: accN,
    unmapped: extra?.leagues?.[code]?.unmapped ?? [],
    fetchError: extra?.leagues?.[code]?.error ?? extra?.leagues?.[code]?.upcomingError ?? null,
    oddsKey: lg.odds ?? null,
    oddsportal: lg.oddsportal ?? null,
  };
  r.gaps = gapsFor(r);
  r.score = coverageScore(r);
  return r;
}

/** Konkreta luckor, sorterade efter hur mycket de paverkar tipsen. */
function gapsFor(r) {
  const g = [];
  const add = (sev, text, fix) => g.push({ sev, text, fix });
  if (!r.cup && r.matches === 0) add(3, 'Ingen historik i store', 'kontrollera history-kalla i config/leagues.json');
  if (!r.cup && r.matches > 0 && r.staleDays != null && r.staleDays > 21 && r.upcomingFixtures > 0) add(3, `Senaste resultat ${r.staleDays} dagar gammalt men matcher spelas`, 'resultatkallan uppdateras inte');
  if (r.fetchError) add(3, `Hamtfel: ${r.fetchError}`, 'se data/open/extra_leagues.json');
  if (r.unmapped.length) add(3, `Omappade lagnamn: ${r.unmapped.join(', ')}`, 'lagg alias i fetch-extra-leagues.mjs');
  if (!r.cup && r.upcomingFixtures === 0 && r.upcomingTips === 0) add(2, 'Inga kommande matcher', 'spelschema saknas (sasongsuppehall?)');
  if (!r.cup && r.upcomingFixtures > 0 && r.upcomingTips === 0) add(3, 'Matcher finns men inga tips', 'lagnamn matchar inte store');
  if (r.tipsSoon && r.tipsWithOdds != null && r.tipsWithOdds < 0.5) add(2, `Odds saknas pa ${Math.round((1 - r.tipsWithOdds) * 100)} % av tipsen inom 7 dagar`, r.oddsKey || r.oddsportal ? 'kor odds/oddsportal' : 'lagg odds- eller oddsportal-nyckel');
  if (r.tipsSoon && r.tipsWithOuOdds != null && r.tipsWithOuOdds < 0.3) add(1, 'Inga O/U-odds inom 7 dagar', 'bara 1X2 fran reservkallan');
  if (!r.oddsKey && !r.oddsportal) add(2, 'Ingen oddskalla konfigurerad', 'lagg oddsportal-slug');
  if (!r.cup && r.matches > 0 && (r.closingOddsShare ?? 0) < 0.3) add(2, 'Historiska closing-odds saknas (ingen CLV/facit)', 'begransat av kallan');
  if (!r.cup && r.matches > 0 && (r.shotsShare ?? 0) < 0.3) add(1, 'Skottdata saknas (ingen xG-proxy)', 'begransat av kallan');
  if (!r.cup && r.upcomingTips && (r.tipsCorners ?? 0) < 0.3) add(1, 'Horntips saknas (ingen hornhistorik)', 'kallan saknar HC/AC');
  if (!r.cup && r.upcomingTips && r.tipsDcKnown != null && r.tipsDcKnown < 0.7) add(2, `Dixon-Coles kanner bara ${Math.round(r.tipsDcKnown * 100)} % av lagen`, 'namnmatchning/nyuppflyttade lag');
  if (r.hitrateN >= 60 && r.hitrate < 0.47) add(2, `Svag traffsakerhet ${(r.hitrate * 100).toFixed(0)} % (n=${r.hitrateN})`, 'sank vikt/krav hogre edge i ligan');
  return g.sort((a, b) => b.sev - a.sev);
}

/** 0-100: hur komplett underlaget ar for tips i ligan. */
function coverageScore(r) {
  if (r.cup) return null;
  const parts = [
    [25, Math.min(1, r.currentSeasonMatches / Math.max(1, r.teams * 3))],
    // Inga matcher inom 7 dagar -> oddskallan bedoms pa om den ar konfigurerad
    [20, r.tipsSoon ? r.tipsWithOdds ?? 0 : r.oddsKey || r.oddsportal ? 0.8 : 0],
    [15, r.closingOddsShare ?? 0],
    [10, r.shotsShare ?? 0],
    [10, r.upcomingTips ? r.tipsCorners ?? 0 : r.teamCornersShare ?? 0],
    [10, r.upcomingTips ? r.tipsDcKnown ?? 0 : 0],
    [10, Math.max(r.clubEloShare ?? 0, r.xgShare ?? 0)], // vader borttaget ur tipsen, dess 5 p hit
  ];
  return Math.round(parts.reduce((s, [w, v]) => s + w * v, 0));
}

const rows = Object.entries(REG.leagues).map(([c, lg]) => auditLeague(c, lg));
rows.sort((a, b) => (a.score ?? 101) - (b.score ?? 101));

const out = { updatedAt: new Date().toISOString(), leagues: rows };
fs.writeFileSync(path.join(root, 'data', 'open', 'league-audit.json'), JSON.stringify(out, null, 2), 'utf8');

const f = (v) => (v == null ? '—' : `${Math.round(v * 100)} %`);
const md = [
  '# Datagranskning per liga',
  '',
  `Genererad ${new Date().toLocaleString('sv-SE')} av \`node scripts/audit-leagues.mjs\`. Sorterad med sämst täckning först.`,
  '',
  '"Odds ≤7 d" = andel tips inom 7 dagar som har odds (bolagen prissätter sällan längre fram).',
  '',
  '| Liga | Täckning | Matcher (säsong) | Senaste res. | Tips (≤7 d) | Odds ≤7 d | Closing-odds hist. | Skott | Hörn-tips | DC känner | Hitrate |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.code} ${r.name} | ${r.score ?? 'cup'} | ${r.matches} (${r.currentSeasonMatches}) | ${r.lastResult ?? '—'} | ${r.upcomingTips} (${r.tipsSoon}) | ${f(r.tipsWithOdds)} | ${f(r.closingOddsShare)} | ${f(r.shotsShare)} | ${f(r.tipsCorners)} | ${f(r.tipsDcKnown)} | ${r.hitrate == null ? '—' : `${Math.round(r.hitrate * 100)} % (n=${r.hitrateN})`} |`),
  '',
  '## Luckor per liga',
  '',
  ...rows.filter((r) => r.gaps.length).flatMap((r) => [
    `### ${r.code} — ${r.name}`,
    ...r.gaps.map((g) => `- ${'!'.repeat(g.sev)} ${g.text} → ${g.fix}`),
    '',
  ]),
];
fs.mkdirSync(path.join(root, 'docs', 'analys'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'analys', 'liga-datagranskning.md'), md.join('\n'), 'utf8');

if (!process.argv.includes('--quiet')) {
  for (const r of rows) {
    const top = r.gaps.filter((g) => g.sev >= 2).map((g) => g.text).join(' | ');
    console.log(`${r.code.padEnd(5)} ${String(r.score ?? 'cup').padStart(3)}  ${top}`);
  }
  const sev3 = rows.reduce((s, r) => s + r.gaps.filter((g) => g.sev === 3).length, 0);
  const sev2 = rows.reduce((s, r) => s + r.gaps.filter((g) => g.sev === 2).length, 0);
  const avg = Math.round(rows.filter((r) => r.score != null).reduce((s, r) => s + r.score, 0) / rows.filter((r) => r.score != null).length);
  console.log(`\nSnitt-tackning ${avg} · kritiska luckor ${sev3} · viktiga ${sev2}`);
}
