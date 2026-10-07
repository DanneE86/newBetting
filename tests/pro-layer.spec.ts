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

test('risk vs reward: vinst, break-even och EV i kr', async () => {
  const lib = await import(libUrl);
  // 500 kr pa odds 2.30 med 46 % chans: vinst 650, kravs 43.5 %, EV = 500 * (0.46 * 2.3 - 1) = +29
  const rr = lib.riskReward(2.3, 0.46, 500);
  expect(rr.win).toBe(650);
  expect(rr.ratio).toBeCloseTo(1.3, 6);
  expect(rr.breakEven).toBeCloseTo(1 / 2.3, 4);
  expect(rr.evSek).toBe(29);
  expect(lib.riskReward(2.0, 0.4, 500).evSek).toBe(-100);
  expect(lib.riskReward(1, 0.5)).toBeNull();
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

test('vardesparr: oddstak och misstankt EV, samma live och i utvarderingen', async () => {
  const lib = await import(libUrl);
  const cap = { maxOdds: 5, maxEv: 0.25 };
  expect(lib.betBlock(4.8, 0.1, cap)).toBeNull();
  expect(lib.betBlock(5, 0.1, cap)).toBeNull();
  expect(lib.betBlock(5.2, 0.1, cap)).toBe('tooLong');
  expect(lib.betBlock(2.1, 0.3, cap)).toBe('suspect');
  // Snitt-facit: tak 3.5
  expect(lib.betBlock(4, 0.06, { maxOdds: 3.5, maxEv: 0.25 })).toBe('tooLong');
  expect(lib.betBlock(3.5, 0.06, { maxOdds: 3.5, maxEv: 0.25 })).toBeNull();
});

test('utvarderingen raknar bara spel som klarar livesparren', async () => {
  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  expect(tips.proMeta.config.maxOddsAverage).toBeLessThan(tips.proMeta.config.maxOdds);
  // Utan sparren gav konsensus over 390 spel (2026-10-07); med sparren farre an halften
  const n = Object.values<any>(evaluation.summary).reduce((s, x) => s + (x.strategies?.consensusAtBestPrice?.n ?? 0), 0);
  expect(n).toBeGreaterThan(50);
  expect(n).toBeLessThan(300);
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

test('ligamodell: nedflyttat lag far ovre prior, uppflyttat nedre', async () => {
  const lm = await import(pathToFileURL(path.join(root, 'scripts', 'pro', 'league-models.mjs')).href);
  const lib = await import(libUrl);
  const league2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const strength: Record<string, number> = { A: 3, B: 2, C: 2, D: 1, E: 1, F: 1, G: 0, H: 0, UP: 3 };
  const byLeague: Record<string, any[]> = { L1: [], L2: [] };
  let day = 0;
  const play = (lg: string, teams: string[], rounds: number) => {
    for (let r = 0; r < rounds; r++) for (const h of teams) for (const a of teams) {
      if (h === a) continue;
      day++;
      const d = new Date(Date.UTC(2025, 0, 1) + (day / 4) * 86_400_000).toISOString().slice(0, 10);
      byLeague[lg].push({ date: d, home: h, away: a, hg: strength[h], ag: strength[a] });
    }
  };
  play('L2', league2, 2);
  play('L1', ['DOWN', 'X', 'Y', 'Z'], 2); // DOWN spelade hogre niva, nu i L2
  const tiers = lm.buildTiers({ groups: [{ id: 'land', leagues: ['L1', 'L2'] }] });
  const params = { ...lm.DEFAULT_PARAMS, prior: true };
  const model = lm.fitLeagueModel(byLeague.L2, '2025-12-31', params, {
    league: 'L2', byLeague, tiers, teams: ['DOWN', 'NEW', 'A'],
  });
  expect(model.priors.DOWN.type).toBe('nedflyttat');
  expect(model.priors.NEW.type).toBe('nytt/uppflyttat');
  expect(model.priors.A).toBeUndefined();
  expect(model.att.get('DOWN')).toBeGreaterThan(model.att.get('NEW'));
  const p = lib.predictDixonColes(model, 'DOWN', 'NEW');
  expect(p.home).toBeGreaterThan(p.away);
  // Utan prior: bada nya lag far ligasnitt
  const plain = lm.fitLeagueModel(byLeague.L2, '2025-12-31', lm.DEFAULT_PARAMS, { league: 'L2', byLeague, tiers, teams: ['DOWN', 'NEW'] });
  expect(plain.att.has('DOWN')).toBeFalsy();
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
      // Snitt av bolagen som facit (inte Pinnacle/Betfair): lagre oddstak
      const sharp = /pinnacle|betfair/i.test(x.fairSource ?? '');
      if (x.value && !sharp) expect(x.odds).toBeLessThanOrEqual(tips.proMeta.config.maxOddsAverage);
    }
  }

  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  expect(evaluation.summary.PL.n).toBeGreaterThan(100);
  expect(evaluation.summary.PL.rpsPinnacleClose).toBeLessThan(0.25);

  const refs = readJson(path.join(root, 'data', 'open', 'referees.json'));
  expect(refs.count).toBeGreaterThan(5);
});

test('traffrutan visar tipsmotorns traff (odds dar de styr), inte grundmodellens', async () => {
  const evaluation = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'));
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  const acc = evaluation.tipAccuracy;
  test.skip(!acc, 'Pro-lagret har inte korts med tipAccuracy an');
  for (const [lg, bySeason] of Object.entries<any>(acc)) {
    for (const a of Object.values<any>(bySeason)) {
      expect(a.correct).toBeLessThanOrEqual(a.n);
      expect(a.missDraw + a.missUpset + a.correct).toBe(a.n);
      expect(a.expectedRate).toBeGreaterThan(0.3);
      expect(a.bySource.odds.tested + a.bySource.modell.tested).toBe(a.n);
    }
    // Ligor med marknadstest styrs av oddsen i backtesten (som live)
    const mt = evaluation.marketTest?.[lg];
    const cur = Object.values<any>(bySeason).at(-1);
    if ((mt?.vsOpening?.n ?? 0) >= 60 || (mt?.vsClosing?.n ?? 0) >= 60) expect(cur.bySource.odds.tested).toBeGreaterThan(0);
  }
  const pl = tips.accuracyByLeague?.PL?.['1X2'];
  expect(pl.source).toBe('tipsmotor');
  expect(pl.expectedRate).toBeGreaterThan(0);
  expect(tips.accuracy['1X2'].source).toBe('tipsmotor');
  const rows = readJson(path.join(root, 'data', 'reports', 'tips-backtest.json')).matches;
  expect(rows.length).toBeGreaterThan(1000);
  expect(rows[0].p.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 2);
});

test('vader: anvands inte i tipsen, bara den historiska analysen finns kvar', async () => {
  // Vader paverkar inte utfallet utover vad marknaden prisar in (weatherEffect) och ar borttaget ur logiken
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  for (const t of tips.allCandidates ?? []) expect(t.pro?.weather, t.match).toBeUndefined();
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

test('kommande match: bara spelare i aktuell trupp raknas (salda faller bort)', async () => {
  const players = await import(pathToFileURL(path.join(root, 'scripts', 'pro', 'players.mjs')).href);
  const shares = [
    { name: 'Martin Odegaard', share: 0.2, lastApp: '2026-05-01' },   // stavning: Ødegaard i truppen
    { name: 'Lee Kang-In', share: 0.1, lastApp: '2026-05-01' },       // omvand ordning
    { name: 'Ferdi Kadioglu', share: 0.1, lastApp: '2026-05-01' },    // dotless i: Kadıoğlu
    { name: 'Cala', share: 0.1, lastApp: '2026-09-20' },              // smeknamn men spelade nyss -> kvar
    { name: 'Mohamed Salah', share: 0.3, lastApp: '2026-05-24' },     // sald, inte i truppen
  ];
  const squad = [{ name: 'Martin Ødegaard' }, { name: 'Kang-In Lee' }, { name: 'Ferdi Kadıoğlu' }, { name: 'Álex Calatrava' }];
  const kept = players.inCurrentSquad(shares, squad, '2026-09-29').map((p: any) => p.name);
  expect(kept).toEqual(['Martin Odegaard', 'Lee Kang-In', 'Ferdi Kadioglu', 'Cala']);
  // Ingen trupp sparad -> oforandrat
  expect(players.inCurrentSquad(shares, null, '2026-09-29')).toHaveLength(5);
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
    expect(['fd-main', 'fd-new', 'espn', 'tsdb', 'fotmob', 'none']).toContain(lg.history);
  }
  expect(new Set(grouped).size).toBe(grouped.length); // ingen liga i tva grupper
  const europa = reg.groups.find((g: any) => g.id === 'europa');
  expect(europa.leagues).toEqual(['CL', 'EL', 'ECL']);
  expect(reg.groups.find((g: any) => g.id === 'england').leagues).toEqual(['PL', 'CH', 'EL1']);
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
  // Valladolid-Cordoba 2026-09-27: borsen langt over bolagen -> avvisas. 10 pp (1.12) gick forut igenom (max 12 pp),
  // nu max 8 pp for Betfair. Pinnacle med samma priser godtas (12 pp).
  const bf10 = { key: 'betfair_ex_eu', home: 1.12, draw: 12, away: 25 };
  const fav = [
    { key: 'a', home: 1.2, draw: 6.5, away: 13 },
    { key: 'b', home: 1.22, draw: 6.2, away: 12 },
    { key: 'c', home: 1.21, draw: 6.4, away: 12.5 },
  ];
  expect(findSharpBook([{ key: 'betfair_ex_eu', home: 1.06, draw: 21, away: 40 }, ...fav])).toBeNull();
  expect(findSharpBook([bf10, ...fav])).toBeNull();
  const pin10 = { ...bf10, key: 'pinnacle' };
  expect(findSharpBook([pin10, ...fav])).toBe(pin10);
  const bfOk = { key: 'betfair_ex_eu', home: 1.22, draw: 6.6, away: 13.5 };
  expect(findSharpBook([bfOk, ...fav])).toBe(bfOk);
  // Betfair utan minst 3 bolag att jamfora med: inget skarpt facit. Pinnacle godtas anda.
  expect(findSharpBook([bfOk, fav[0]])).toBeNull();
  const pin = { key: 'pinnacle', home: 1.22, draw: 6.6, away: 13.5 };
  expect(findSharpBook([pin, fav[0]])).toBe(pin);
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

test('antal kort: tipsen har Ö/U på en Oddset-linje med rimlig prognos', async () => {
  const tips = readJson(path.join(root, 'data', 'tips-latest.json'));
  const withCards = (tips.allCandidates ?? []).filter((t: any) => t.tips?.CARDS);
  expect(withCards.length).toBeGreaterThan((tips.allCandidates ?? []).length / 2);
  const bad: string[] = [];
  for (const t of withCards) {
    const c = t.tips.CARDS;
    const po = c.pOver?.[String(c.line)];
    if (![3.5, 4.5, 5.5].includes(c.line)) bad.push(`${t.match} linje ${c.line}`);
    if (c.pick !== `${po >= 0.5 ? 'OVER' : 'UNDER'} ${c.line}`) bad.push(`${t.match} pick ${c.pick}`);
    // Nollor från trasig FotMob-data gav förut snitt under 1,5 kort; ingen riktig liga ligger där
    if (!(c.expCards > 1.5 && c.expCards < 9) || !(c.leagueAvg > 2)) bad.push(`${t.match} ${c.expCards}/${c.leagueAvg}`);
    if (!(c.pOver['3.5'] >= c.pOver['4.5'] && c.pOver['4.5'] >= c.pOver['5.5'])) bad.push(`${t.match} pOver ej fallande`);
    // Båda lagen får kort finns med samma prognos; Ja om chansen >= 50 %
    const b = t.tips.BOTH_CARDS;
    if (!b || b.pYes !== c.pBoth || b.pick !== (b.pYes >= 0.5 ? 'JA' : 'NEJ') || !(b.pYes > 0.2 && b.pYes < 0.99)) bad.push(`${t.match} båda kort ${JSON.stringify(b)}`);
  }
  expect(bad).toEqual([]);
});
