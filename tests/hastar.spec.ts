import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

// Fliken "Hästar": travmodellen (scripts/lib/trav-model.mjs), systembyggaren (gui/public/hast-engine.js) och GUI:t.
// Enhetstesterna använder påhittade ATG-svar och går utan nät.
const ROOT = path.resolve(__dirname, '..');
const model = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'trav-model.mjs')).href);
const engine = () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'hast-engine.js')).href);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ---------- Påhittade ATG-svar ----------
const rec = (date: string, place: string, o: any = {}) => ({
  date, place, kmTime: { minutes: 1, seconds: o.sec ?? 14, tenths: 0 }, odds: 500, galloped: !!o.g,
  race: { id: `${date}_1_1`, startMethod: o.method ?? 'auto', firstPrize: 5000000 },
  track: { id: 1, name: 'Solvalla' },
  start: { distance: o.dist ?? 2140, postPosition: o.post ?? 1, driver: { id: o.driver ?? 1, firstName: 'K', lastName: 'Kusk' } },
});
function start(nr: number, o: any = {}) {
  return {
    number: nr, postPosition: o.post ?? nr, distance: o.distance ?? 2140, scratched: !!o.scratched,
    horse: {
      name: `Häst ${nr}`, money: 100000, shoes: { reported: true, front: { hasShoe: o.barfota ? false : true, changed: !!o.barfota }, back: { hasShoe: o.barfota ? false : true, changed: false } },
      statistics: { life: { starts: 20, placement: { '1': o.wins ?? 2 }, earningsPerStart: o.eps ?? 500000 } },
      trainer: { firstName: 'T', lastName: `Tränare ${nr}`, statistics: { years: { '2026': { starts: 50, placement: { '1': 5 } } } } },
      results: { records: o.records ?? [rec('2026-09-20', '2'), rec('2026-09-01', '3')] },
    },
    driver: { id: o.driver ?? nr, firstName: 'K', lastName: `Kusk ${nr}`, statistics: { years: { '2026': { starts: 100, placement: { '1': o.dw ?? 10 } } } } },
    pools: { vinnare: o.odds ? { odds: o.odds } : undefined, V85: o.streck != null ? { betDistribution: o.streck } : undefined },
    result: o.place != null ? { place: o.place } : undefined,
  };
}
function race(number: number, starts: any[], o: any = {}) {
  return { id: `2026-10-03_5_${number}`, number, date: '2026-10-03', distance: 2140, startMethod: o.method ?? 'auto', startTime: `2026-10-03T${String(14 + number).padStart(2, '0')}:00:00`,
    track: { id: 5, name: 'Solvalla' }, pools: { vinnare: { turnover: o.turnover ?? 100000000 } }, starts };
}

// ---------- Faktorer ----------

test.describe('trav-model: faktorer', () => {
  test('normRecord sparar skor, banunderlag och loppform per tidigare start', async () => {
    const { normRecord } = await model();
    const raw: any = rec('2026-09-01', '1');
    raw.start.horse = { shoes: { front: false, back: true } };
    raw.track.condition = 'heavy';
    raw.race.sport = 'monté';
    expect(normRecord(raw)).toMatchObject({ shoes: { front: false, back: true }, trackCondition: 'heavy', sport: 'monté' });
    // saknas uppgiften blir det null, inte fel
    expect(normRecord(rec('2026-09-01', '1'))).toMatchObject({ shoes: null, trackCondition: null, sport: null });
  });

  test('formScore: placeringspoäng med nyast tyngst, galopp = 0', async () => {
    const { formScore, normRecord } = await model();
    const r = (p: string, g = false) => normRecord(rec('2026-09-01', p, { g }));
    expect(formScore([r('1'), r('1'), r('1'), r('1'), r('1')])).toBe(100);
    expect(formScore([r('0'), r('0'), r('0')])).toBe(0);
    expect(formScore([r('1', true)])).toBe(0);
    // seger senast väger mer än seger för fem starter sedan
    expect(formScore([r('1'), r('0'), r('0'), r('0'), r('0')])).toBeGreaterThan(formScore([r('0'), r('0'), r('0'), r('0'), r('1')]));
    expect(formScore([])).toBeNull();
  });

  test('gallopRisk krymps mot 10 % och speedSeconds föredrar samma startmetod', async () => {
    const { gallopRisk, speedSeconds, normRecord } = await model();
    expect(gallopRisk([])).toBeCloseTo(0.1, 5);
    const g = [1, 2, 3, 4, 5].map(() => normRecord(rec('2026-09-01', '0', { g: true })));
    expect(gallopRisk(g)).toBeCloseTo((5 + 0.5) / 10, 5);
    const rs = [rec('2026-09-03', '1', { sec: 12, method: 'volte' }), rec('2026-09-02', '1', { sec: 13, method: 'volte' }), rec('2026-09-01', '1', { sec: 20, method: 'auto' })].map(normRecord);
    expect(speedSeconds(rs, 'volte')).toBeCloseTo(72.5, 5);
    expect(speedSeconds(rs, 'auto')).toBeCloseTo(73, 5); // bara 1 autostart -> alla starter
  });

  test('earlyPositionEdge: innerspår i autostart bäst, tillägg sämst', async () => {
    const { earlyPositionEdge } = await model();
    expect(earlyPositionEdge(1, 'auto', 0)).toBeGreaterThan(earlyPositionEdge(5, 'auto', 0));
    expect(earlyPositionEdge(5, 'auto', 0)).toBeGreaterThan(earlyPositionEdge(10, 'auto', 0));
    expect(earlyPositionEdge(1, 'volte', 20)).toBeLessThan(earlyPositionEdge(8, 'volte', 0));
  });
});

// ---------- Normalisering ----------

test.describe('trav-model: normalizeGame', () => {
  test('streck /10000, odds /100 och ingen historik från tävlingsdagen (inget läckage i backtest)', async () => {
    const { normalizeGame } = await model();
    const leak = rec('2026-10-03', '1');
    const g = normalizeGame({ id: 'V85_2026-10-03_5_1', type: 'V85', races: [race(1, [start(1, { odds: 250, streck: 4520, records: [leak, rec('2026-09-01', '2')] })])] });
    const s = g.races[0].starts[0];
    expect(s.streck).toBeCloseTo(0.452, 5);
    expect(s.odds).toBeCloseTo(2.5, 5);
    expect(s.records.map((r: any) => r.date)).toEqual(['2026-09-01']);
    expect(g.races[0].winTurnover).toBe(1000000);
    expect(g.type).toBe('V85');
  });

  test('resultsOf: vinnare per lopp, dött lopp ger två', async () => {
    const { resultsOf } = await model();
    const g = { races: [race(1, [start(1, { place: 1 }), start(2, { place: 2 })]), race(2, [start(1, { place: 1 }), start(2, { place: 1 })]), race(3, [start(1)])] };
    expect(resultsOf(g)).toEqual({ 1: [1], 2: [1, 2] });
  });
});

// ---------- Analys ----------

function game(o: any = {}) {
  const starts = [
    start(1, { odds: 200, streck: 6000, dw: 25 }),
    start(2, { odds: 400, streck: 2000 }),
    start(3, { odds: 600, streck: 1500 }),
    start(4, { odds: 3000, streck: 500, records: [rec('2026-09-20', '1'), rec('2026-09-10', '1'), rec('2026-09-01', '1')] }),
    start(5, { scratched: true, streck: 0 }),
  ];
  return { id: 'V85_2026-10-03_5_1', type: 'V85', races: [race(1, starts, o), race(2, starts.map((s) => ({ ...s })), o)] };
}

test.describe('trav-model: analyzeRace och analyzeGame', () => {
  test('chanserna summerar till 1, strukna utanför, A–D och spelvärde = chans / streck', async () => {
    const { normalizeGame, analyzeGame, VALUE_MIN, RANK_LIMITS } = await model();
    const a = analyzeGame(normalizeGame(game()));
    for (const r of a.races) {
      const live = r.horses.filter((h: any) => !h.scratched);
      expect(sum(live.map((h: any) => h.p))).toBeCloseTo(1, 2);
      expect(r.horses.at(-1).scratched).toBe(true);
      for (const h of live) {
        // value räknas på oavrundade värden, p och marketPct sparas avrundade till 3 decimaler
        expect(Math.abs(h.value - h.p / h.marketPct) / (h.p / h.marketPct)).toBeLessThan(0.02);
        expect(h.isValue).toBe(h.value >= VALUE_MIN && h.p >= 0.03);
        const want = h.p >= RANK_LIMITS.A || (h === live[0] && h.p >= 0.12) ? 'A' : h.p >= RANK_LIMITS.B ? 'B' : h.p >= RANK_LIMITS.C ? 'C' : 'D';
        expect(h.rank).toBe(want);
        for (const k of ['form', 'kusk', 'spar', 'total', 'tempo']) expect(h.scores[k]).toBeGreaterThanOrEqual(0);
        expect(h.position).toBeTruthy();
      }
      expect(r.favorite.nr).toBe(1);
      expect(['STARK FAVORIT', 'NORMAL FAVORIT', 'SÅRBAR FAVORIT']).toContain(r.favorite.status);
      expect(r.tempo.scenarios.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('oddsvikten följer vinnarpotten: liten pott -> strecket styr, stor pott -> oddsen styr', async () => {
    const { normalizeGame, analyzeGame } = await model();
    const small = analyzeGame(normalizeGame(game({ turnover: 2000000 }))).races[0]; // 20 000 kr
    const big = analyzeGame(normalizeGame(game({ turnover: 1000000000 }))).races[0]; // 10 milj kr
    expect(small.oddsWeight).toBeLessThan(0.1);
    expect(big.oddsWeight).toBeGreaterThan(0.9);
  });

  test('utan odds och streck: lika marknadsbas, fundamenta avgör', async () => {
    const { normalizeGame, analyzeGame } = await model();
    const g = game();
    for (const r of g.races) for (const s of r.starts) s.pools = {} as any;
    const r = analyzeGame(normalizeGame(g)).races[0];
    expect(r.hasOdds).toBe(false);
    expect(r.horses[0].marketSource).toBe('odds');
    expect(sum(r.horses.filter((h: any) => !h.scratched).map((h: any) => h.p))).toBeCloseTo(1, 2);
  });

  test('kommentarer bygger bara på data: kuskbyte, barfota, tillägg, lång vila', async () => {
    const { normalizeGame, analyzeGame } = await model();
    const g = game();
    g.races[0].starts[1] = start(2, { odds: 400, streck: 2000, driver: 99, barfota: true, distance: 2160, records: [rec('2026-06-01', '4', { driver: 7 })] });
    const h = analyzeGame(normalizeGame(g)).races[0].horses.find((x: any) => x.nr === 2);
    const c = h.comments.join(' | ');
    expect(c).toContain('Kuskbyte');
    expect(c).toContain('Barfota runt om (ändrat)');
    expect(c).toContain('Tillägg 20 m');
    expect(c).toMatch(/Lång vila \(\d+ dagar\)/);
  });

  test('skrällar kräver ett belagt skäl utöver låg spelprocent', async () => {
    const { pickUpsets } = await model();
    const h = (nr: number, o: any) => ({ nr, horse: `H${nr}`, scratched: false, p: 0.1, marketPct: 0.05, value: 2, marketP: 0.2, marketSource: 'streck', position: 'Bakom', driver: 'K', scores: { form: 10, kusk: 10, fart: 10 }, ...o });
    const races = [{ leg: 1, number: 1, horses: [h(1, { scores: { form: 90, kusk: 10, fart: 10 } }), h(2, {}), h(3, {}), h(4, {}), h(5, {}), h(6, { p: 0.5, marketPct: 0.75, value: 0.66 })] }];
    // nr 2–5 har samma poäng: topp 3 tar de första, men nr 1 har klart bäst form
    const ups = pickUpsets(races);
    expect(ups.map((u: any) => u.nr)).toContain(1);
    expect(ups.every((u: any) => u.why.some((w: string) => !w.startsWith('vinnaroddsen')))).toBe(true);
    // utan några skäl alls: ingen skräll
    const none = pickUpsets([{ leg: 1, number: 1, horses: [h(1, { marketP: null })].map((x) => ({ ...x, scores: { form: 0, kusk: 0, fart: 0 } })) }]);
    expect(none.length).toBe(1); // ensam häst är topp 3 i allt -> har skäl
  });

  test('Dagens Dubbel: sannolikhet = p1 × p2, fair = 1/p, EV = p × odds − 1', async () => {
    const { analyzeDD } = await model();
    const r1 = { number: 7, horses: [{ nr: 1, horse: 'A', p: 0.5 }, { nr: 2, horse: 'B', p: 0.5 }] };
    const r2 = { number: 8, horses: [{ nr: 1, horse: 'C', p: 0.4 }, { nr: 2, horse: 'D', p: 0.6 }] };
    const combo = [[400, 1000], [600, 300]]; // öre: 1-1 4,00 · 1-2 10,00 · 2-1 6,00 · 2-2 3,00
    const dd = analyzeDD(r1, r2, combo);
    const c12 = dd.byP.find((c: any) => c.combo === '1-2');
    expect(c12.p).toBeCloseTo(0.3, 5);
    expect(c12.fair).toBeCloseTo(3.333, 2);
    expect(c12.odds).toBe(10);
    expect(c12.ev).toBeCloseTo(2, 5);
    expect(dd.byEv[0].combo).toBe('1-2');
    expect(dd.races).toEqual([7, 8]);
  });
});

// ---------- Backtest ----------

test('backtest: kalibrering, ranking, spikar och logloss', async () => {
  const { backtest } = await model();
  const h = (nr: number, p: number, rank: string) => ({ nr, p, rank, marketPct: p, marketP: p, odds: 1 / p, isValue: false, scratched: false });
  const analysis = {
    races: [
      { number: 1, distance: 2140, startMethod: 'auto', track: 'Solvalla', horses: [h(1, 0.6, 'A'), h(2, 0.3, 'A'), h(3, 0.1, 'B')] },
      { number: 2, distance: 1640, startMethod: 'volte', track: 'Solvalla', horses: [h(1, 0.5, 'A'), h(2, 0.5, 'A')] },
    ],
    spikes: { sakerhet: { raceNr: 1, nr: 1 } },
    upsets: [{ raceNr: 1, nr: 3 }],
  };
  const bt = backtest([{ analysis, results: { 1: [1], 2: [2] } }]);
  expect(bt.races).toBe(2);
  expect(bt.topHitRate).toBe(0.5);
  expect(bt.spikes.sakerhet).toMatchObject({ n: 1, wins: 1 });
  expect(bt.upsets).toMatchObject({ n: 1, wins: 0 });
  expect(bt.rank.A.n).toBe(4);
  expect(bt.rank.A.wins).toBe(2);
  expect(bt.logLoss).toBeCloseTo((-Math.log(0.6) - Math.log(0.5)) / 2, 3);
  expect(sum(bt.calibration.map((c: any) => c.n))).toBe(5);
});

// ---------- Systembyggare ----------

const legsFixture = () =>
  [1, 2, 3, 4].map((leg) => ({
    leg, number: leg + 4,
    horses: [
      { nr: 1, p: 0.45, marketPct: 0.6, rank: 'A' },
      { nr: 2, p: 0.25, marketPct: 0.15, rank: 'A' },
      { nr: 3, p: 0.15, marketPct: 0.12, rank: 'B' },
      { nr: 4, p: 0.1, marketPct: 0.08, rank: 'B' },
      { nr: 5, p: 0.05, marketPct: 0.05, rank: 'C' },
      { nr: 6, p: 0.0, marketPct: 0.0, rank: 'D', scratched: true },
    ],
  }));

test.describe('hast-engine: systembyggaren', () => {
  test('rakt system håller budgeten, rader = produkten, strukna spelas aldrig', async () => {
    const { buildSystem, rowCount } = await engine();
    for (const budget of [10, 50, 100, 200]) {
      const s = buildSystem(legsFixture(), { budget, price: 0.5 });
      expect(s.cost).toBeLessThanOrEqual(budget);
      expect(s.rows).toBe(rowCount(s));
      expect(s.cost).toBeCloseTo(s.rows * 0.5, 5);
      expect(s.legs.flatMap((l: any) => l.horses)).not.toContain(6);
      expect(s.hit).toBeGreaterThan(0);
    }
    // större budget ger aldrig lägre träffchans
    const a = buildSystem(legsFixture(), { budget: 20, price: 0.5 });
    const b = buildSystem(legsFixture(), { budget: 200, price: 0.5 });
    expect(b.hit).toBeGreaterThanOrEqual(a.hit);
  });

  test('spelvärde väger in: underspelad häst går före överspelad med samma chans', async () => {
    const { buildSystem, weight } = await engine();
    const legs = [{ leg: 1, number: 1, horses: [{ nr: 1, p: 0.3, marketPct: 0.6 }, { nr: 2, p: 0.3, marketPct: 0.15 }, { nr: 3, p: 0.4, marketPct: 0.25 }] }];
    expect(weight(legs[0].horses[1])).toBeGreaterThan(weight(legs[0].horses[0]));
    const s = buildSystem(legs, { budget: 1, price: 0.5 }); // 2 rader
    expect(s.legs[0].horses.sort()).toEqual([2, 3]);
  });

  test('låst spik respekteras', async () => {
    const { buildSystem } = await engine();
    const s = buildSystem(legsFixture(), { budget: 100, price: 0.5, locked: { 2: [3] } });
    expect(s.legs[1].horses).toEqual([3]);
  });

  test('reducerat system: villkoren håller på varje rad och budgeten håller', async () => {
    const { reduceSystem, rowsToText, SKRALL_MAX } = await engine();
    const legs = legsFixture();
    const conds = { maxA: 3, minA: 1, maxSkrall: 1, minStreck: 60, maxStreck: 200 };
    const r = reduceSystem(legs, conds, { budget: 20, price: 0.5, expand: 8 });
    expect(r.count).toBeLessThanOrEqual(40);
    expect(r.cost).toBeLessThanOrEqual(20);
    expect(r.passed).toBeLessThanOrEqual(r.total);
    const byNr = (leg: number, nr: number) => legs[leg].horses.find((h) => h.nr === nr)!;
    for (const row of r.rows) {
      const hs = row.map((nr: number, i: number) => byNr(i, nr));
      const a = hs.filter((h) => h.rank === 'A').length;
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(3);
      expect(hs.filter((h) => h.marketPct < SKRALL_MAX).length).toBeLessThanOrEqual(1);
      const st = sum(hs.map((h) => h.marketPct * 100));
      expect(st).toBeGreaterThanOrEqual(60);
    }
    expect(rowsToText([[1, 2], [3, 4]])).toBe('1,2\n3,4');
  });

  test('ATG-länk till omgången och kupongmall per avdelning', async () => {
    const { atgGameUrl, atgReducedUrl, couponText } = await engine();
    expect(atgGameUrl('V85_2026-10-03_11_5')).toBe('https://www.atg.se/spel/V85_2026-10-03_11_5');
    expect(atgReducedUrl('V85')).toBe('https://www.atg.se/spel/reducerat/V85');
    expect(couponText([{ leg: 1, horses: [12, 8, 7] }, { leg: 2, horses: [6] }])).toBe('Avd 1: 7 8 12\nAvd 2: 6 (spik)');
  });

  test('ATG-fil: rader slås ihop till färre kuponger utan att raderna ändras', async () => {
    const { compressRows, couponRows, reduceSystem } = await engine();
    const expand = (cs: number[][][]) => cs.flatMap((c) => c.reduce<number[][]>((acc, s) => acc.flatMap((r) => s.map((nr) => [...r, nr])), [[]]));
    const key = (rows: number[][]) => rows.map((r) => r.join(',')).sort();
    const r = reduceSystem(legsFixture(), { maxSkrall: 1 }, { budget: 20, price: 0.5, expand: 8 });
    const c = compressRows(r.rows);
    expect(c.length).toBeLessThan(r.rows.length);
    expect(couponRows(c)).toBe(r.rows.length);
    expect(key(expand(c))).toEqual(key(r.rows));
    // ett helt rakt system blir en enda kupong
    expect(compressRows([[1, 2], [1, 4], [3, 2], [3, 4]])).toEqual([[[1, 3], [2, 4]]]);
  });

  test('ATG-fil: XML enligt ATG:s filinlämningsschema (v85Coupon, 15 tecken per avdelning, banans kod)', async () => {
    const { atgFileXml, parseGameId, ATG_FILE_TYPES } = await engine();
    expect(parseGameId('V85_2026-10-03_11_5')).toEqual({ date: '2026-10-03', trackcode: 11 });
    expect(parseGameId('trasigt')).toBeNull();
    const legs8 = [[7, 8], [6], [2, 6, 8], [5], [2, 6], [4], [3, 5], [4, 8, 12, 14]];
    const xml = atgFileXml({ type: 'V85', gameId: 'V85_2026-10-03_11_5', coupons: [legs8, legs8], now: new Date('2026-10-03T10:00:00Z') });
    expect(xml).toContain('schemaversion="ATG File Betting XSD ver 1.8"');
    expect(xml.match(/<v85Coupon /g)).toHaveLength(2);
    expect(xml).toContain('<v85Coupon couponid="2" date="2026-10-03" trackcode="11" betmultiplier="1">');
    expect(xml).toContain('<leg legno="1" marks="000000110000000"/>');
    expect(xml).toContain('<leg legno="8" marks="000100010001010"/>');
    for (const m of xml.matchAll(/marks="([01]+)"/g)) expect(m[1]).toHaveLength(15);
    expect(xml.match(/<leg /g)).toHaveLength(16);
    // fel spelform, fel antal avdelningar, ogiltigt startnummer och för många kuponger stoppas
    expect(() => atgFileXml({ type: 'dd', gameId: 'V85_2026-10-03_11_5', coupons: [legs8] })).toThrow();
    expect(() => atgFileXml({ type: 'V85', gameId: 'V85_2026-10-03_11_5', coupons: [legs8.slice(1)] })).toThrow(/avdelningar/);
    expect(() => atgFileXml({ type: 'V85', gameId: 'V85_2026-10-03_11_5', coupons: [[[16], ...legs8.slice(1)]] })).toThrow(/ogiltiga/);
    expect(() => atgFileXml({ type: 'V85', gameId: 'V85_2026-10-03_11_5', coupons: Array(ATG_FILE_TYPES.V85.max + 1).fill(legs8) })).toThrow(/högst 5000/);
  });

  test('ATG-fil: checksumma CRC16/ARC, fyra hex-tecken sist i filnamnet', async () => {
    const { crc16, atgFileName } = await engine();
    expect(crc16('123456789')).toBe('bb3d'); // kontrollvärde för CRC-16/ARC (samma som Princetons CRC16.java)
    expect(crc16('')).toBe('0000');
    expect(crc16('a')).toHaveLength(4);
    expect(atgFileName('V85_2026-10-03_11_5-960-rader', '123456789')).toBe('V85_2026-10-03_11_5-960-rader-bb3d.xml');
  });

  test('radpris: V85 och V75 0,50 kr, V86 0,25 kr, nya V75 0,60 kr från 2026-11-28', async () => {
    const { ROW_PRICE } = await engine();
    expect(ROW_PRICE.V85).toBe(0.5);
    expect(ROW_PRICE.V75).toBe(0.5);
    expect(ROW_PRICE.V86).toBe(0.25);
    // nya V75 från 2026-11-28: 60 öre; äldre omgångar (bakkörning) räknas med 50 öre
    const { rowPrice } = await engine();
    expect(rowPrice('V75', '2025-06-07')).toBe(0.5);
    expect(rowPrice('V75', '2026-11-27')).toBe(0.5);
    expect(rowPrice('V75', '2026-11-28')).toBe(0.6);
    expect(rowPrice('V85', '2026-11-28')).toBe(0.5);
    expect(rowPrice('V86', '2027-01-01')).toBe(0.25);
    expect(rowPrice('okänd', '2026-01-01')).toBe(1);
  });
});

// ---------- GUI ----------

test.describe('GUI: fliken Hästar', () => {
  const port = 4300 + Math.floor(Math.random() * 80);
  const base = `http://127.0.0.1:${port}`;
  let server: ChildProcess;
  test.beforeAll(async () => {
    server = spawn(process.execPath, [path.join(ROOT, 'gui', 'server.mjs')], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
    for (let i = 0; i < 100; i++) {
      try { await fetch(base + '/'); return; } catch { await new Promise((r) => setTimeout(r, 200)); }
    }
    throw new Error('GUI-servern startade inte');
  });
  test.afterAll(() => server?.kill());

  test('/hastar visar fliken, Kort sagt och dolda tipsdelar', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + '/tips');
    await page.click('.view-tab[data-view="hastar"]');
    await expect(page).toHaveURL(base + '/hastar');
    await expect(page.locator('#hastar-view')).toBeVisible();
    await expect(page.locator('#hastar-view h2')).toContainText('Hästar');
    await expect(page.locator('.hs-kort h3')).toHaveText('Kort sagt');
    await expect(page.locator('main')).toBeHidden();
    await expect(page.locator('#stryktips-view')).toBeHidden();
    await page.click('.view-tab[data-view="tips"]');
    await expect(page.locator('#hastar-view')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('sparad analys: lopptabeller, värdebedömning, starttid och systembyggare inom budget', async ({ page }) => {
    const state = await (await page.request.get(base + '/api/hastar')).json();
    test.skip(!state.analysis || state.analysis.type === 'dd', 'Ingen sparad V-spelsanalys i data/hastar');
    await page.goto(base + '/hastar');
    await expect(page.locator('.hs-race').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.hs-race')).toHaveCount(state.analysis.races.length);
    // varje häst med streck har en Värde/Ej värde-bedömning, varje lopp en starttid
    const live = state.analysis.races[0].horses.filter((h: any) => !h.scratched).length;
    await expect(page.locator('.hs-race').first().locator('.hs-verdict')).toHaveCount(live);
    await expect(page.locator('.hs-race-head small').first()).toContainText('start');
    for (const b of [100, 1000]) {
      await page.click(`[data-budget="${b}"]`);
      const txt = await page.locator('.hs-sys-sum:not(.hs-sys-top)').innerText();
      const cost = Number(txt.match(/([\d\s]+)\s*kr/)![1].replace(/\s/g, ''));
      expect(cost).toBeLessThanOrEqual(b);
      // högsta rad visas och klarar 50 000 kr-golvet (eller så visas varning om att budgeten inte räcker)
      const top = await page.locator('.hs-sys-top').innerText();
      const topKr = Number(top.match(/ca ([\d\s]+)\s*kr/)![1].replace(/\s/g, ''));
      if (!(await page.locator('.hs-system .hs-msg.is-error').count())) expect(topKr).toBeGreaterThanOrEqual(50000);
    }
    // spärrvalet: 50 000 (alltid) som standard, 1 miljon går att välja
    await expect(page.locator('#hs-top')).toHaveValue('50000');
    await page.selectOption('#hs-top', '1000000');
    await expect(page.locator('.hs-sys-top')).toBeVisible();
    // värde förklaras i klartext, värdefokus beskrivs och värdehästar märks
    await expect(page.locator('.hs-value-explain')).toContainText('vinner oftare än folket tror');
    // värdefokus: Standard (spelformens bakkörda val) är förvalt och förklaras
    await expect(page.locator('#hs-focus')).toHaveValue('standard');
    await expect(page.locator('.hs-focus-text')).toContainText('Standard:');
    await page.selectOption('#hs-focus', 'hog');
    await expect(page.locator('.hs-focus-text')).toContainText('Hög:');
    const valuePicks = await page.locator('.hs-sys-legs .hs-pick.is-value').count();
    expect(valuePicks).toBe(await page.locator('.hs-sys-legs .hs-pick-value').count());
    // ATG: länken går till omgången, kupongmallen har en rad per avdelning
    await expect(page.locator('.hs-atg-actions a')).toHaveAttribute('href', 'https://www.atg.se/spel/' + state.analysis.id);
    const coupon = ((await page.locator('.hs-coupon').textContent()) || '').trim().split('\n');
    expect(coupon).toHaveLength(state.analysis.races.length);
    expect(coupon[0]).toMatch(/^Avd 1: \d+/);
    // ATG-fil för raka systemet: en kupong, en avdelning per lopp
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="atg-file"]')]);
    expect(dl.suggestedFilename()).toMatch(new RegExp('^' + state.analysis.id + '-\\d+-rader-[0-9a-f]{4}\\.xml$'));
    const xml = fs.readFileSync((await dl.path())!, 'utf8');
    // checksumman i filnamnet stämmer med filens innehåll (annars varnar ATG för checksummefel)
    const { crc16 } = await engine();
    expect(dl.suggestedFilename().slice(-8, -4)).toBe(crc16(xml));
    expect(xml.match(/Coupon couponid=/g)).toHaveLength(1);
    expect(xml.match(/<leg /g)).toHaveLength(state.analysis.races.length);
    // reducerat: filen innehåller exakt de rader som spelas
    await page.click('[data-mode="reducerat"]');
    await expect(page.locator('.hs-conds')).toBeVisible();
    await expect(page.locator('.hs-sys-sum:not(.hs-sys-top)')).toContainText('klarar villkoren');
    await expect(page.locator('.hs-atg-steps')).toContainText('Välj fil');
    const played = Number((await page.locator('.hs-sys-sum:not(.hs-sys-top) b').innerText()).match(/^([\d\s]+) rader/)![1].replace(/\s/g, ''));
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="atg-file"]')]);
    expect(dl2.suggestedFilename()).toContain('-' + played + '-rader-');
    expect(dl2.suggestedFilename().slice(-8, -4)).toBe(crc16(fs.readFileSync((await dl2.path())!, 'utf8')));
  });

  test('mobil: ingen sidscroll i sidled', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/hastar');
    await expect(page.locator('#hastar-view h2')).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

// ---------- Säsongsbakkörning (scripts/lib/hast-sasong.mjs) ----------
const sasong = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'hast-sasong.mjs')).href);

test.describe('hast-sasong: rättning mot ATG:s utdelning', () => {
  test('rakt system: rader per antal rätt = uppräkning rad för rad', async () => {
    const { rowsByCorrect, rowsByCorrectList } = await sasong();
    const sys = [[1, 2], [3], [4, 5, 6]];
    const winners = [[2], [7], [4, 5]]; // dött lopp i avd 3
    const rows: number[][] = [];
    for (const a of sys[0]) for (const b of sys[1]) for (const c of sys[2]) rows.push([a, b, c]);
    expect(rowsByCorrect(sys, winners)).toEqual(rowsByCorrectList(rows, winners));
    expect(rowsByCorrect(sys, winners)).toEqual([1, 3, 2, 0]);
    expect(sum(rowsByCorrect(sys, winners))).toBe(6);
  });

  test('utdelning i öre per rad, jackpott ger 0 kr, insats = rader × radpris', async () => {
    const { settle } = await sasong();
    const payouts = { '6': { systems: 1, jackpot: true }, '7': { systems: 10, payout: 2100 }, '8': { systems: 2, payout: 96400 } };
    const counts = [0, 0, 0, 0, 0, 0, 5, 3, 1]; // 9 rader
    const s = settle(counts, payouts, 0.25);
    expect(s.cost).toBe(2.25);
    expect(s.win).toBe(3 * 21 + 964);
    expect(s.net).toBeCloseTo(s.win - 2.25, 5);
    expect(s.best).toBe(8);
    expect(s.wins['6']).toBeUndefined();
    expect(s.wins['8']).toEqual({ rows: 1, kr: 964 });
  });

  test('vinnare per avdelning och avgjord omgång', async () => {
    const { legWinners, isSettled } = await sasong();
    const g = { payouts: { '2': { payout: 100 } }, races: [
      { starts: [{ nr: 1, result: { place: 1 } }, { nr: 2, result: { place: 1 } }, { nr: 3, result: { place: 3 } }] },
      { starts: [{ nr: 4, result: { place: 2 } }, { nr: 5, result: { place: '1' } }] },
    ] };
    expect(legWinners(g)).toEqual([[1, 2], [5]]);
    expect(isSettled(g)).toBe(true);
    expect(isSettled({ ...g, payouts: null })).toBe(false);
    expect(isSettled({ ...g, races: [{ starts: [{ nr: 1, result: null }] }] })).toBe(false);
  });

  test('summering: ROI, största vinst och största nedgång', async () => {
    const { summarize } = await sasong();
    const s = summarize([
      { id: 'a', legs: 8, cost: 100, win: 0, best: 5 },
      { id: 'b', legs: 8, cost: 100, win: 0, best: 6 },
      { id: 'c', legs: 8, cost: 100, win: 500, best: 8 },
    ]);
    expect(s).toMatchObject({ games: 3, cost: 300, win: 500, net: 200, hitGames: 1, allRight: 1, maxDrawdown: 200 });
    expect(s.roi).toBeCloseTo(0.667, 3);
    expect(s.biggest).toEqual({ id: 'c', win: 500 });
  });
});

// ---------- Inlärd modell (scripts/lib/trav-features.mjs) ----------
const features = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'trav-features.mjs')).href);

// Påhittat normaliserat lopp: n hästar, vinnare = winner, streck/odds per häst
function normRace(id: string, date: string, n: number, winner: number, o: any = {}) {
  return {
    id, number: 1, distance: 2140, startMethod: 'auto', startTime: `${date}T18:00:00`, track: 'Solvalla', winTurnover: 1000000,
    starts: Array.from({ length: n }, (_, i) => ({
      nr: i + 1, post: i + 1, distance: 2140, scratched: false, horse: `H${id}-${i + 1}`, age: 5, sex: 'gelding',
      driverId: 100 + i, driverYear: { starts: 50, wins: 5 }, trainerYear: { starts: 50, wins: 5 },
      shoes: { front: !(o.barfota?.includes(i + 1)), back: !(o.barfota?.includes(i + 1)), changed: false },
      sulky: { text: 'Vanlig', changed: false }, odds: o.odds?.[i] ?? 10, streck: o.streck?.[i] ?? 1 / n,
      result: { place: i + 1 === winner ? 1 : 5 },
      records: [{ date: '2026-01-01', place: 3, km: 75, odds: 8, track: 'Solvalla', startMethod: 'auto', distance: 2140, post: 2, driverId: 100 + i }],
    })),
  };
}

test.describe('loppets förstapris', () => {
  test('parsePrize läser förstapriset ur ATG:s pristext', async () => {
    const { parsePrize } = await model();
    expect(parsePrize('Pris: 150.000-75.000-40.000 kr (8 prisplacerade). Lägst 2.500 kr')).toBe(150000);
    expect(parsePrize('Pris: 1.000.000-500.000 kr')).toBe(1000000);
    // utländska lopp: ingen "Pris:", valuta sist (räknas om till ungefär kr)
    expect(parsePrize('18.000-9.000-6.000-4.500-3.500-(3.000) NOK')).toBe(18000);
    expect(parsePrize('7500-5000-3500-2500-2000 DKK')).toBe(11250);
    expect(parsePrize('10.000-5.000 EUR')).toBe(115000);
    for (const t of [null, '', 'Inget pris', 'Pris: -']) expect(parsePrize(t)).toBeNull();
  });

  test('normalizeGame sparar förstapriset; komplettering fyller bara i lopp som saknar det', async () => {
    const { normalizeGame } = await model();
    const { addPrizes } = await sasong();
    const g = normalizeGame({ id: 'V85_2026-01-03_1_5', type: 'V85', races: [{ id: 'R1', date: '2026-01-03', number: 1, prize: 'Pris: 200.000-100.000 kr', starts: [] }] }, {});
    expect(g.races[0].firstPrize).toBe(200000);
    const old = { races: [{ id: 'R1' }, { id: 'R2', firstPrize: 5 }, { id: 'R3' }] };
    addPrizes(old, { races: [{ id: 'R1', prize: 'Pris: 80.000-40.000 kr' }, { id: 'R2', prize: 'Pris: 1.000 kr' }, { id: 'R3', prize: 'okänd' }] });
    expect(old.races.map((r: any) => r.firstPrize)).toEqual([80000, 5, null]);
  });

});

test.describe('trav-features: inlärning', () => {
  test('z inom loppet: snitt 0, saknat = 0, konstant = 0', async () => {
    const { zScores } = await features();
    const z = zScores([1, 2, 3, null]);
    expect(z[3]).toBe(0);
    expect(z[0] + z[1] + z[2]).toBeCloseTo(0, 9);
    expect(zScores([4, 4, 4])).toEqual([0, 0, 0]);
  });

  test('kuskform räknar bara starter före loppdagen (inget facit)', async () => {
    const { driverIndex } = await features();
    const g = { races: [{ starts: [{ horse: 'A', records: [
      { date: '2026-03-01', place: 1, driverId: 7 }, { date: '2026-02-01', place: 4, driverId: 7 }, { date: '2026-04-01', place: 1, driverId: 7 },
    ] }] }] };
    const f = driverIndex([g]);
    expect(f(7, '2026-03-15')).toEqual({ starts: 2, wins: 1 });
    expect(f(7, '2026-03-01')).toEqual({ starts: 1, wins: 0 });
    expect(f(8, '2026-03-01')).toBeNull();
  });

  test('fitLogit hittar en verklig effekt: barfota vinner oftare än marknaden tror', async () => {
    const { buildRows, fitLogit, evaluate } = await features();
    const { postTable } = await model();
    // 400 lopp, 8 hästar, lika marknad; barfota (nr 1–2) vinner varannan gång
    const games = Array.from({ length: 400 }, (_, k) => ({ id: `G${k}`, type: 'V64', races: [
      normRace(`R${k}`, '2026-05-01', 8, k % 2 === 0 ? 1 + (k % 4 === 0 ? 0 : 1) : 3 + (k % 6), { barfota: [1, 2] }),
    ] }));
    const rows = buildRows(games, { postTable });
    expect(rows).toHaveLength(400);
    const b = fitLogit(rows, ['barfota'], { lambda: 1, iters: 300 });
    expect(b.barfota).toBeGreaterThan(0.3);
    const m = fitLogit(rows, [], {});
    expect(evaluate(rows, b, ['barfota']).logLoss).toBeLessThan(evaluate(rows, m, []).logLoss);
  });

  test('samma lopp i två spel (V86 + V64) räknas en gång', async () => {
    const { buildRows } = await features();
    const { postTable } = await model();
    const r = normRace('X', '2026-05-01', 6, 2);
    const rows = buildRows([{ id: 'A', type: 'V86', races: [r] }, { id: 'B', type: 'V64', races: [r] }], { postTable });
    expect(rows).toHaveLength(1);
  });

  test('analyzeRace med inlärda vikter: chanser summerar till 1, marknad 1 + 0 vikter = marknaden', async () => {
    const { analyzeRace } = await model();
    const { FEATURE_KEYS } = await features();
    const race = normRace('Y', '2026-05-01', 4, 1, { odds: [2, 4, 8, 16], streck: [0.5, 0.25, 0.15, 0.1] });
    const zero = { market: 1, weights: Object.fromEntries(FEATURE_KEYS.map((k: string) => [k, 0])) };
    const a = analyzeRace(race, {}, { learned: zero });
    const ps = a.horses.map((h: any) => h.p);
    expect(sum(ps)).toBeCloseTo(1, 2);
    // ren marknad: favoriten (nr 1) högst, ordningen följer oddsen
    expect(a.horses.map((h: any) => h.nr)).toEqual([1, 2, 3, 4]);
    // positiv barfotavikt flyttar chans till barfotahästen
    const bf = normRace('Z', '2026-05-01', 4, 1, { odds: [4, 4, 4, 4], streck: [0.25, 0.25, 0.25, 0.25], barfota: [3] });
    const w = { market: 1, weights: { ...zero.weights, barfota: 0.5 } };
    const b = analyzeRace(bf, {}, { learned: w });
    expect(b.horses[0].nr).toBe(3);
    // learned: false = gamla handsatta vikter
    expect(analyzeRace(bf, {}, { learned: false }).horses.find((h: any) => h.nr === 3).p).toBeCloseTo(0.25, 1);
  });
});

test('inlärd modell: marknaden = streck när det finns, inga faktorer från slutodds', async () => {
  const { raceRow, FEATURE_KEYS } = await features();
  expect(FEATURE_KEYS).not.toContain('oddsMotStreck');
  // Odds säger nr 4 favorit, strecket säger nr 1 – lq ska följa strecket
  const race = normRace('S', '2026-05-01', 4, 1, { odds: [16, 8, 4, 1.5], streck: [0.5, 0.25, 0.15, 0.1] });
  const row = raceRow(race, {});
  expect(row.lq[0]).toBeCloseTo(Math.log(0.5), 5);
  expect(row.lq[3]).toBeCloseTo(Math.log(0.1), 5);
  // Utan streck (t.ex. Dagens Dubbel): vinnaroddsen
  const dd = normRace('D', '2026-05-01', 3, 1, { odds: [2, 4, 4], streck: [0, 0, 0] });
  const r2 = raceRow(dd, {});
  expect(r2.lq[0]).toBeGreaterThan(r2.lq[1]);
  // Sparade vikter använder bara kända faktorer
  const { LEARNED } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'trav-weights.mjs')).href);
  if (LEARNED) for (const k of Object.keys(LEARNED.weights)) expect(FEATURE_KEYS).toContain(k);
});

// ---------- Högsta rad-spärr (hast-engine) ----------
const topLegs = () => Array.from({ length: 8 }, (_, i) => ({
  leg: i + 1, number: i + 1,
  horses: [0.4, 0.25, 0.15, 0.1, 0.06, 0.04].map((s, j) => ({ nr: j + 1, p: s * (j === 4 ? 1.5 : 1) / 1.03, marketPct: s, rank: j === 0 ? 'A' : 'B' })),
}));
const streckProd = (legs: any[], sysLegs: any[]) => sysLegs.reduce((a: number, l: any, i: number) =>
  a * Math.min(...l.horses.map((nr: number) => legs[i].horses.find((h: any) => h.nr === nr).marketPct)), 1);

test.describe('hast-engine: standard per spelform', () => {
  test('V85 spelas med Normal (alpha 0,5), övriga med Träff (alpha 0)', async () => {
    const { defaultAlpha, DEFAULT_ALPHA, buildSystem, TOP_SHARE } = await engine();
    expect(DEFAULT_ALPHA).toEqual({ V85: 0.5 });
    expect(defaultAlpha('V85')).toBe(0.5);
    for (const t of ['V86', 'V75', 'GS75', 'V64', 'V65', 'dd', undefined]) expect(defaultAlpha(t)).toBe(0);
    // standardvalet ger exakt samma system som Normal
    const legs = topLegs();
    const a = buildSystem(legs, { budget: 500, price: 0.5, alpha: defaultAlpha('V85'), minTop: 50000, topShare: TOP_SHARE.V85 });
    const b = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0.5, minTop: 50000, topShare: TOP_SHARE.V85 });
    expect(a.legs).toEqual(b.legs);
  });
});

test.describe('hast-engine: högsta rad minst X kr vid alla rätt', () => {
  test('utdelning = potandel × radpris / streckprodukt; alla system har minst 50 000 kr som golv', async () => {
    const { rowPayout, MIN_TOP, TOP_LEVELS, TOP_SHARE } = await engine();
    expect(rowPayout(1e-6, 0.5, 0.195)).toBeCloseTo(97500, 0);
    expect(MIN_TOP).toBe(50000);
    expect(Math.min(...TOP_LEVELS)).toBe(MIN_TOP);
    expect(TOP_LEVELS).toContain(1000000);
    expect(TOP_SHARE.V85).toBe(0.195);
  });

  test('rakt system: högsta raden når spärren, budgeten håller, topRow = lägst streck per avdelning', async () => {
    const { buildSystem, TOP_SHARE } = await engine();
    const legs = topLegs();
    for (const minTop of [50000, 250000, 1000000]) {
      const s = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0, minTop, topShare: TOP_SHARE.V85 });
      expect(s.topOk).toBe(true);
      expect(s.cost).toBeLessThanOrEqual(500);
      expect(s.topPayout).toBeGreaterThanOrEqual(minTop);
      expect(s.topPayout).toBeCloseTo((0.195 * 0.5) / streckProd(legs, s.legs), 0);
      s.legs.forEach((l: any, i: number) => {
        const low = l.horses.reduce((m: number, nr: number) => Math.min(m, legs[i].horses.find((h: any) => h.nr === nr).marketPct), 1);
        expect(legs[i].horses.find((h: any) => h.nr === s.topRow[i]).marketPct).toBe(low);
      });
    }
    // högre spärr kostar träffchans, aldrig tvärtom
    const a = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0, minTop: 50000, topShare: 0.195 });
    const b = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0, minTop: 1000000, topShare: 0.195 });
    expect(b.hit).toBeLessThanOrEqual(a.hit + 1e-12);
  });

  test('spärren som optimering: minst lika hög träffchans som att bara lägga till skrällar', async () => {
    const { buildSystem } = await engine();
    const legs = topLegs();
    const s = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0, minTop: 1000000, topShare: 0.195 });
    // jämför med ett handbyggt system som klarar spärren: favorit + 5:an i varje avd (2^8 = 256 rader)
    const hand = legs.reduce((a, l) => a * (l.horses[0].p + l.horses[4].p), 1);
    const handTop = (0.195 * 0.5) / Math.pow(0.06, 8);
    expect(handTop).toBeGreaterThan(1000000);
    expect(s.hit).toBeGreaterThanOrEqual(hand);
  });

  test('omöjlig spärr inom budget: vanligt system och topOk = false', async () => {
    const { buildSystem } = await engine();
    const s = buildSystem(topLegs(), { budget: 1, price: 0.5, alpha: 0, minTop: 1e12, topShare: 0.195 });
    expect(s.topOk).toBe(false);
    expect(s.cost).toBeLessThanOrEqual(1);
  });

  test('reducerat system: minst en spelad rad når spärren', async () => {
    const { reduceSystem } = await engine();
    const legs = topLegs();
    const r = reduceSystem(legs, {}, { budget: 100, price: 0.5, alpha: 0, expand: 4, minTop: 1000000, topShare: 0.195 });
    expect(r.topOk).toBe(true);
    expect(r.count).toBeLessThanOrEqual(200);
    const best = Math.max(...r.rows.map((row: number[]) => (0.195 * 0.5) / row.reduce((a, nr, i) => a * legs[i].horses.find((h: any) => h.nr === nr).marketPct, 1)));
    expect(best).toBeGreaterThanOrEqual(1000000);
  });
});
