import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = path.resolve(__dirname, '..');
const libUrl = pathToFileURL(path.join(root, 'scripts', 'pro', 'lib.mjs')).href;

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^﻿/, ''));
}

test('devig: multiplicative och power summerar till 1 och tar bort marginal', async () => {
  const lib = await import(libUrl);
  const odds = [1.9, 3.6, 4.2];
  expect(lib.overround(odds)) .toBeGreaterThan(0);
  for (const f of [lib.devigMultiplicative, lib.devigPower]) {
    const p = f(odds);
    expect(p.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 6);
    p.forEach((x: number, i: number) => expect(x).toBeLessThan(1 / odds[i]));
  }
  // Power lagger mer av marginalen pa longshots -> hogre favorit-p
  expect(lib.devigPower(odds)[0]).toBeGreaterThan(lib.devigMultiplicative(odds)[0]);
  expect(lib.devigMultiplicative([1.9, 0.5])).toBeNull();
});

test('kelly, rps och clv', async () => {
  const lib = await import(libUrl);
  expect(lib.kellyStake(0.5, 1.9)).toBe(0);                 // negativ EV
  expect(lib.kellyStake(0.55, 2.0, 1, 1)).toBeCloseTo(0.1, 6); // full Kelly
  expect(lib.kellyStake(0.9, 2.0)).toBe(0.02);              // tak
  expect(lib.rps1x2([1, 0, 0], 'H')).toBe(0);
  expect(lib.rps1x2([0, 0, 1], 'H')).toBe(1);
  expect(lib.clv(2.5, 0.5)).toBeCloseTo(0.25, 6);
  expect(lib.clv(null, 0.5)).toBeNull();
});

test('Dixon-Coles hittar starkare lag pa syntetisk data', async () => {
  const lib = await import(libUrl);
  const teams = ['A', 'B', 'C', 'D'];
  const goals: Record<string, number> = { A: 3, B: 1, C: 1, D: 0 };
  const matches = [];
  let day = 0;
  for (let r = 0; r < 10; r++) {
    for (const h of teams) for (const a of teams) {
      if (h === a) continue;
      day++;
      const d = new Date(Date.UTC(2025, 0, 1) + day * 86_400_000).toISOString().slice(0, 10);
      matches.push({ date: d, home: h, away: a, hg: goals[h], ag: goals[a] });
    }
  }
  const model = lib.fitDixonColes(matches, '2025-12-31');
  expect(model).not.toBeNull();
  const p = lib.predictDixonColes(model, 'A', 'D');
  expect(p.home + p.draw + p.away).toBeCloseTo(1, 6);
  expect(p.home).toBeGreaterThan(0.7);
  expect(p.lambdaHome).toBeGreaterThan(p.lambdaAway);
});

test('store har closing odds och domardata', async () => {
  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  // Closing odds finns bara i football-data-ligorna (ESPN/TheSportsDB-ligor saknar dem) -> mat PL
  const pl = store.matches.filter((m: any) => m.league === 'PL');
  const plCovered = pl.filter((m: any) => m.closing?.pinnacle_home || m.closing?.avg_home).length;
  expect(plCovered / pl.length).toBeGreaterThan(0.8);
  const withClose = store.matches.find((m: any) => m.closing?.pinnacle_home);
  expect(withClose).toBeDefined();
  expect(withClose.odds.pinnacle_home).toBeGreaterThan(1);
  expect(store.matches.some((m: any) => m.referee)).toBeTruthy();
});

test('tips har pro-lager, utvardering och domarfil', async () => {
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  expect(tips.proMeta).toBeDefined();
  expect(Array.isArray(tips.valueBets)).toBeTruthy();
  const withPro = (tips.allCandidates ?? []).filter((t: any) => t.pro);
  test.skip(withPro.length === 0, 'Inga kommande matcher');
  const pro = withPro[0].pro;
  expect(pro.dc.home + pro.dc.draw + pro.dc.away).toBeCloseTo(1, 2);
  expect(pro.rest.home).toHaveProperty('restDays');
  for (const v of tips.valueBets) {
    expect(v.ev).toBeGreaterThanOrEqual(tips.proMeta.config.minEv);
    expect(v.stakeSek).toBe(tips.proMeta.config.stakeSek);
  }
  // Omdome per utfall: varde <=> odds >= minOdds
  for (const t of withPro) {
    for (const x of Object.values<any>(t.pro.verdicts ?? {})) {
      // Utan facit (varken Pinnacle/Betfair eller tillrackligt manga bolag for snittet): inget omdome
      if (x.p == null) {
        expect(x.value).toBeNull();
        continue;
      }
      expect(x.value).toBe(!x.reason && x.odds >= x.minOdds - 0.005);
      if (x.value) expect(x.odds).toBeLessThanOrEqual(tips.proMeta.config.maxOdds);
    }
  }

  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  expect(evaluation.summary.PL.n).toBeGreaterThan(100);
  expect(evaluation.summary.PL.rpsPinnacleClose).toBeLessThan(0.25);

  const refs = readJson(path.join(root, 'data', 'open', 'referees.json'));
  expect(refs.count).toBeGreaterThan(5);
});

test('arenor har koordinater for alla lag i kommande matcher', async () => {
  const venues = readJson(path.join(root, 'data', 'open', 'venues.json'));
  const { canonicalTeam } = await import(pathToFileURL(path.join(root, 'scripts', 'weather', 'teams.mjs')).href);
  const fixtures = readJson(path.join(root, 'data', 'upcoming-fixtures.json'));
  const missing = new Set<string>();
  for (const f of fixtures) {
    for (const team of [f.home, f.away]) {
      const v = venues.teams[canonicalTeam(team)];
      if (!v || typeof v.lat !== 'number' || typeof v.lon !== 'number') missing.add(team);
    }
  }
  expect([...missing]).toEqual([]);
  // Rimlighetskoll: alla arenor i Europa (inkl. Kanarieoarna) eller Brasilien
  for (const v of Object.values<any>(venues.teams)) {
    // UEFA-området inkl. Nordnorge, Kanarieöarna, Azorerna och Kazakstan (cupmotstånd, t.ex. Kairat Almaty)
    const europe = v.lat > 27 && v.lat < 72 && v.lon > -32 && v.lon < 80;
    // Amerika (Brasilien, Argentina, Chile, Colombia, Mexiko, USA/Kanada) och Östasien (Japan, Sydkorea)
    const americas = v.lat > -56 && v.lat < 62 && v.lon > -170 && v.lon < -34;
    const eastAsia = v.lat > 24 && v.lat < 46 && v.lon > 122 && v.lon < 146;
    expect(europe || americas || eastAsia, `${v.team}: ${v.lat},${v.lon}`).toBeTruthy();
  }
});

test('vaderprognos och vaderhistorik', async () => {
  const forecast = readJson(path.join(root, 'data', 'open', 'weather_forecast.json'));
  expect(forecast.missingVenues).toEqual([]);
  const withWeather = forecast.matches.filter((m: any) => m.weather);
  test.skip(forecast.matches.length === 0, 'Inga matcher inom prognosfonstret');
  expect(withWeather.length).toBeGreaterThan(0);
  for (const m of withWeather) {
    expect(m.weather.tempC).toBeGreaterThan(-30);
    expect(m.weather.tempC).toBeLessThan(45);
    expect(m.weather.windKmh).toBeGreaterThanOrEqual(0);
  }
  const history = readJson(path.join(root, 'data', 'open', 'weather_history.json'));
  expect(history.count).toBeGreaterThan(1000);
  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  expect(evaluation.weatherEffect.n).toBeGreaterThan(1000);
});

test('spelarandel och historisk franvaro (syntetisk data)', async () => {
  const players = await import(pathToFileURL(path.join(root, 'scripts', 'pro', 'players.mjs')).href);
  // Lag X: 10 matcher, xG 2.0 per match. Stjarna S star for 1.0 xG + 0.6 xA per match -> andel 0.4
  const teamMatches = new Map([['PL|X', Array.from({ length: 10 }, (_, i) => ({
    id: `m${i}`, date: `2026-01-${String(i * 2 + 1).padStart(2, '0')}`, xg: 2.0,
  }))]]);
  // Stjarnan vilar i m3 (enstaka = rotation) och ar skadad i m7+m8 (svit), spelar ovriga
  const apps = new Map();
  for (let i = 0; i < 10; i++) {
    if ([3, 7, 8].includes(i)) continue;
    apps.set(`m${i}`, { date: `2026-01-${String(i * 2 + 1).padStart(2, '0')}`, time: 90, xG: 1.0, xA: 0.6 });
  }
  const model = { teamMatches, playersByTeam: new Map([['PL|X', [{ id: 's', name: 'Star Player', apps }]]]), matchById: new Map() };

  // Fore m3: 3 lagmatcher, spelat alla -> andel 1.6*3 / (2*2.0*3) = 0.4
  expect(players.teamShares(model, 'PL', 'X', '2026-01-07')[0].share).toBeCloseTo(0.4, 2);
  // m3: enstaka missad match -> rotation, raknas inte
  expect(players.historicalMissing(model, 'PL', 'X', '2026-01-07', 'm3').missingShare).toBe(0);
  // m8: del av svit m7+m8 -> saknad. Andel fore m8: 6 matcher a 1.6 / (2*2.0*8) = 0.3
  const miss = players.historicalMissing(model, 'PL', 'X', '2026-01-17', 'm8');
  expect(miss.players.map((p: any) => p.name)).toEqual(['Star Player']);
  expect(miss.missingShare).toBeCloseTo(0.3, 2);
  // m9: spelade -> ingen franvaro
  expect(players.historicalMissing(model, 'PL', 'X', '2026-01-19', 'm9').missingShare).toBe(0);
});

test('spelarviktad franvaro i tips och utvardering', async () => {
  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  test.skip(!evaluation.playerEffect, 'Kor npm run players:impact');
  const pe = evaluation.playerEffect;
  expect(pe.n).toBeGreaterThan(1000);
  expect(pe.byAlpha['0'].rps).toBeGreaterThan(0.15);
  expect(pe.chosenAlpha).toBeGreaterThanOrEqual(0);
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  const pl = (tips.allCandidates ?? []).find((t: any) => t.league === 'PL' && t.pro?.availability);
  test.skip(!pl, 'Inga PL-matcher');
  expect(pl.pro.availability.home.topPlayers.length).toBeGreaterThan(0);
  expect(pl.pro.availability.home.attackFactor).toBeGreaterThan(0.4);
});

test('teckenkodning: inga felavkodade namn (UTF-8 last som latin-1)', async () => {
  const { fixString } = await import(pathToFileURL(path.join(root, 'scripts', 'repair-mojibake.mjs')).href);
  expect(fixString('MilenkoviÄ\u0087')).toBe('Milenković');
  expect(fixString('Málaga')).toBe('Málaga');
  const mojibake = /[Â-ô][\u0080-¿]/;
  for (const f of ['data/tips-latest.json', 'data/open/fpl_availability.json', 'data/open/espn_lineups.json', 'data/open/upcoming_odds.json']) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    const m = text.match(mojibake);
    expect(m ? `${f}: ...${text.slice(Math.max(0, m.index! - 20), m.index! + 20)}...` : null).toBeNull();
  }
});

test('ligaregister: alla ligor har grupp, namn och kalla', async () => {
  const reg = readJson(path.join(root, 'config', 'leagues.json'));
  const grouped = reg.groups.flatMap((g: any) => g.leagues);
  for (const [code, lg] of Object.entries<any>(reg.leagues)) {
    expect(grouped, `${code} saknar grupp`).toContain(code);
    expect(lg.name).toBeTruthy();
    expect(['fd-main', 'fd-new', 'espn', 'tsdb', 'none']).toContain(lg.history);
  }
  expect(new Set(grouped).size).toBe(grouped.length); // ingen liga i tva grupper
  const europa = reg.groups.find((g: any) => g.id === 'europa');
  expect(europa.leagues).toEqual(['CL', 'EL', 'ECL']);
  expect(reg.groups.find((g: any) => g.id === 'england').leagues).toEqual(['PL', 'CH']);
});

test('nya ligor finns i store och kommande matcher', async () => {
  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const leagues = new Set(store.matches.map((m: any) => m.league));
  for (const lg of ['BL2', 'SB', 'PT', 'GR', 'AS', 'NO', 'DK', 'HR', 'BR', 'BR2']) expect(leagues, lg).toContain(lg);
  const fixtures = readJson(path.join(root, 'data', 'upcoming-fixtures.json'));
  const fxLeagues = new Set(fixtures.map((f: any) => f.league));
  for (const lg of ['CL', 'EL', 'ECL', 'AS', 'BR']) expect(fxLeagues, lg).toContain(lg);
});

test('ledger har CLV-sammanfattning', async () => {
  const ledger = readJson(path.join(root, 'data', 'tips-ledger.json'));
  expect(ledger.liveClv).toBeDefined();
  expect(ledger.liveClv).toHaveProperty('meanClv');
});

test('skarpt facit: illikvid Betfair-marknad avvisas', async () => {
  const { findSharpBook } = await import(libUrl);
  const books = [
    { key: 'betfair_ex_eu', home: 1.13, draw: 1.18, away: 1.15 },
    { key: 'a', home: 3.5, draw: 4, away: 1.85 },
    { key: 'b', home: 3.3, draw: 3.9, away: 1.8 },
    { key: 'c', home: 3.4, draw: 3.8, away: 1.85 },
  ];
  expect(findSharpBook(books)).toBeNull();
  const ok = { key: 'pinnacle', home: 3.45, draw: 3.95, away: 1.9 };
  expect(findSharpBook([...books, ok])).toBe(ok);
});

test('varje visat odds har ett vardeomdome och varje tips har avsparkstid', async () => {
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  const missingVerdict: string[] = [];
  const missingKick: string[] = [];
  for (const t of tips.allCandidates) {
    if (!t.kickoffUtc) missingKick.push(t.match);
    for (const [k, o] of Object.entries(t.pro?.odds ?? {})) {
      if (!((o as number) > 1)) continue;
      const v = t.pro.verdicts?.[k];
      if (!v || typeof v.value !== 'boolean') missingVerdict.push(`${t.match} ${k}`);
    }
  }
  expect(missingVerdict).toEqual([]);
  expect(missingKick).toEqual([]);
});

test('inga xG-proxy med nollor i store', async () => {
  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const zero = store.teams.filter((t: any) => t.xg && !(t.xg.homeXGpg > 0)).map((t: any) => t.key);
  expect(zero).toEqual([]);
});

test('daily scanner foljer agentreglerna', async () => {
  const scan = readJson(path.join(root, 'data', 'daily-scan.json'));
  expect(scan.matches.length).toBeGreaterThan(0);
  for (const m of scan.matches) {
    // Agent 6: Devil's Advocate Dead eller LOW confidence -> aldrig BET
    if (m.devil.residual === 'Dead' || m.quant.confidence === 'LOW') expect(m.head.verdict).not.toBe('BET');
    if (m.head.verdict !== 'NO BET') expect(m.head.best?.ev).toBeGreaterThanOrEqual(0.03);
  }
});

test('OddsPortal: ligasidans text tolkas till matcher med 1X2 och UTC-avspark', async () => {
  const { parseListText } = await import(pathToFileURL(path.join(root, 'scripts', 'fetch-oddsportal.mjs')).href);
  const text = 'Football\n/\nEngland\n10 Oct 2026\n1\nX\n2\n13:30\nArsenal\n-\nLeeds\n1.38\n4.66\n8.05\n16:00\nAston Villa\n-\nBrentford\n2.59\n3.49\n2.57';
  const rows = parseListText(text, [{ name: 'Arsenal - Leeds', startDate: '2026-10-10T11:30:00.000Z' }], new Date('2026-09-27T10:00:00Z'));
  expect(rows).toHaveLength(2);
  expect(rows[0]).toMatchObject({ home: 'Arsenal', away: 'Leeds', odds: [1.38, 4.66, 8.05], startDate: '2026-10-10T11:30:00.000Z' });
  // Utan ld+json: samma tidszonsforskjutning som Arsenal-matchen (+2 h)
  expect(rows[1].startDate).toBe('2026-10-10T14:00:00.000Z');
});
