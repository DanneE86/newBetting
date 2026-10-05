import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

function readJson(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

test('betting-store finns och har matcher', async () => {
  const storePath = path.join(root, 'data', 'betting-store.json');
  expect(fs.existsSync(storePath)).toBeTruthy();
  const store = readJson(storePath);
  expect(store.meta.matchCount).toBeGreaterThan(500);
  expect(store.meta.markets).toEqual(expect.arrayContaining(['1X2', 'BTTS', 'OU25']));
  expect(Array.isArray(store.teams)).toBeTruthy();
  expect(store.teams.length).toBeGreaterThan(30);
});

test('tips-filer finns', async () => {
  const tipsJson = path.join(root, 'data', 'tips-latest.json');
  const tipsMd = path.join(root, 'data', 'tips-latest.md');
  expect(fs.existsSync(tipsJson)).toBeTruthy();
  expect(fs.existsSync(tipsMd)).toBeTruthy();
  const tips = readJson(tipsJson);
  expect(tips.accuracy['1X2']).toBeDefined();
  expect(tips.accuracy.BTTS).toBeDefined();
  expect(tips.accuracy.OU25).toBeDefined();
});

test('open sources fetch-report', async () => {
  const reportPath = path.join(root, 'data', 'open', 'fetch-report.json');
  test.skip(!fs.existsSync(reportPath), 'Kör npm run fetch först');
  const report = readJson(reportPath);
  const ok = (report.sources || []).filter((s: { ok: boolean }) => s.ok);
  expect(ok.length).toBeGreaterThan(3);
});

test('Understat xG via getLeagueData (AJAX) + PW fallback', async ({ page, request }) => {
  const outDir = path.join(root, 'data', 'open');
  fs.mkdirSync(outDir, { recursive: true });

  // Preferred path: AJAX endpoint used by Understat after 2025 redesign
  const season = '2026';
  await page.goto(`https://understat.com/league/EPL/${season}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  const ajax = await page.request.get(`https://understat.com/getLeagueData/EPL/${season}`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Referer: `https://understat.com/league/EPL/${season}`,
    },
  });

  expect(ajax.ok()).toBeTruthy();
  const data = await ajax.json();
  expect(data.teams).toBeTruthy();

  const teamIds = Object.keys(data.teams);
  expect(teamIds.length).toBeGreaterThanOrEqual(18);

  // Aggregate lightweight xG per team for assertion + file output
  const teams = teamIds.map((id) => {
    const t = data.teams[id];
    const hist = t.history || [];
    const n = hist.length || 1;
    const xG = hist.reduce((s: number, h: { xG: number }) => s + Number(h.xG || 0), 0);
    const xGA = hist.reduce((s: number, h: { xGA: number }) => s + Number(h.xGA || 0), 0);
    return {
      id,
      title: t.title,
      played: hist.length,
      xGpg: Number((xG / n).toFixed(3)),
      xGApg: Number((xGA / n).toFixed(3)),
    };
  });

  fs.writeFileSync(
    path.join(outDir, `understat_EPL_${season}_pw_verify.json`),
    JSON.stringify(
      {
        source: 'playwright getLeagueData',
        season,
        teamCount: teams.length,
        sample: teams.slice(0, 5),
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );

  expect(teams.some((t) => t.xGpg > 0)).toBeTruthy();
  console.log(`Understat AJAX OK: ${teams.length} teams, e.g. ${teams[0].title} xGpg=${teams[0].xGpg}`);
});

test('store har Understat xG pa PL-lag', async () => {
  const xgPath = path.join(root, 'data', 'open', 'understat_EPL_2026_xg.json');
  test.skip(!fs.existsSync(xgPath), 'Kör Fetch-UnderstatXg.ps1 först');
  const xg = readJson(xgPath);
  expect(xg.teamCount).toBeGreaterThanOrEqual(18);

  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const plWithXg = (store.teams || []).filter(
    (t: { league: string; xg?: unknown }) => t.league === 'PL' && t.xg
  );
  expect(plWithXg.length).toBeGreaterThanOrEqual(15);
  expect(store.meta.understatXg?.loaded).toBeTruthy();
});

test('FPL availability finns och ar mergad', async () => {
  const fplPath = path.join(root, 'data', 'open', 'fpl_availability.json');
  test.skip(!fs.existsSync(fplPath), 'Kör npm run fpl först');
  const fpl = readJson(fplPath);
  expect(fpl.teamCount).toBeGreaterThanOrEqual(18);
  expect(fpl.playerCount).toBeGreaterThan(400);

  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const plAvail = (store.teams || []).filter(
    (t: { league: string; availability?: unknown }) => t.league === 'PL' && t.availability
  );
  expect(plAvail.length).toBeGreaterThanOrEqual(15);
  expect(store.meta.fplAvailability?.loaded).toBeTruthy();
});

test('inga dubbletter: oddshistorik, tips och lagnamn i data/matcher', async () => {
  const { sameTeamName, loadAliases } = await import(require('url').pathToFileURL(path.join(root, 'scripts', 'lib', 'team-aliases.mjs')).href);
  // Oddshistoriken: inga nycklar som bara skiljer i versaler (Update-TipsLedger.ps1 kraschar) och ingen match tva ganger
  const oh = readJson(path.join(root, 'data', 'open', 'odds-history.json')).matches;
  const keys = Object.keys(oh);
  expect(new Set(keys.map((k) => k.toUpperCase())).size, 'versaldubbletter i odds-history').toBe(keys.length);
  const day = new Map<string, string[][]>();
  for (const k of keys) { const [d, lg, h, a] = k.split('|'); const g = `${d}|${lg}`; day.set(g, [...(day.get(g) ?? []), [h, a]]); }
  const twins: string[] = [];
  for (const [g, list] of day) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    if (sameTeamName(list[i][0], list[j][0]) && sameTeamName(list[i][1], list[j][1])) twins.push(`${g} ${list[i].join('-')} / ${list[j].join('-')}`);
  }
  expect(twins, 'samma match två gånger i odds-history').toEqual([]);
  // Tipsen: varje match en gang
  const tips = readJson(path.join(root, 'data', 'tips-latest.json')).allCandidates;
  const tk = tips.map((t: any) => `${t.date}|${t.league}|${t.home}|${t.away}`);
  expect(tk.filter((k: string, i: number) => tk.indexOf(k) !== i), 'samma match två gånger i tipsen').toEqual([]);
  // data/matcher: inga kanda varianter kvar
  const al = loadAliases();
  for (const [lg, map] of Object.entries(al) as [string, Record<string, string>][]) {
    const f = path.join(root, 'data', 'matcher', `${lg}.csv`);
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const from of Object.keys(map)) expect(txt.includes(`,${from},`), `${lg}: "${from}" ska heta "${map[from]}"`).toBe(false);
  }
});

// 2026-10-05: League One/Championship hade skott-proxy fast football-data har riktig xG, och nyss spelade matcher saknade domare
test('data/matcher: engelska ligorna har riktig xG, domare och frånvaro före matchen när källan har det', async () => {
  const csv = (lg: string) => {
    const [h, ...rows] = fs.readFileSync(path.join(root, 'data', 'matcher', `${lg}.csv`), 'utf8').trim().split(/\r?\n/);
    const head = h.split(',');
    return rows.map((l) => { const v = l.split(','); return Object.fromEntries(head.map((k, i) => [k, v[i] ?? ''])); });
  };
  const fdCsv = (lg: string, season: string) => {
    const f = path.join(root, 'data', 'raw', `${lg}_${season}.csv`);
    if (!fs.existsSync(f)) return [];
    const [h, ...rows] = fs.readFileSync(f, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
    const head = h.split(',');
    return rows.map((l) => { const v = l.split(','); return Object.fromEntries(head.map((k, i) => [k, v[i] ?? ''])); });
  };
  for (const lg of ['PL', 'CH', 'EL1']) {
    const rows = csv(lg);
    const cur = rows.filter((r) => r.status === 'spelad').map((r) => r.season).sort().at(-1)!;
    const played = rows.filter((r) => r.status === 'spelad' && r.season === cur);
    const raw = fdCsv(lg, `${cur.slice(2, 4)}${cur.slice(5, 7)}`);
    if (raw.some((r) => r.HxG !== '' && r.HxG != null)) {
      expect(played.filter((r) => r.xg_src === 'skott').length, `${lg}: skott-proxy fast football-data har xG`).toBe(0);
    }
    // Utan Pinnacle (2026/27) ska book och close_src fyllas via Betfair-borsen
    if (raw.length && raw.every((r) => !r.PSCH) && raw.some((r) => r.BFECH)) {
      expect(played.filter((r) => r.book !== '').length, `${lg}: book tom fast Betfair finns`).toBeGreaterThan(played.length * 0.9);
      expect(played.filter((r) => r.close_src === 'betfair').length, `${lg}: close_src betfair`).toBeGreaterThan(played.length * 0.9);
    }
    if (raw.every((r) => r.Referee)) {
      expect(played.filter((r) => !r.referee).map((r) => `${r.date} ${r.home}-${r.away}`), `${lg}: domare saknas`).toEqual([]);
    }
    const up = rows.filter((r) => r.status === 'kommande');
    expect(up.filter((r) => r.pre_inj_at).length, `${lg}: frånvaro före matchen sparas inte`).toBeGreaterThan(up.length * 0.8);
    // Väntande rader är aldrig äldre än 21 dagar
    const old = new Date(Date.now() - 22 * 864e5).toISOString().slice(0, 10);
    expect(rows.filter((r) => r.status === 'väntar' && r.date < old).length).toBe(0);
  }
});