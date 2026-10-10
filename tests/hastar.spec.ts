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

test.describe('hästpoäng 0–100', () => {
  test('horseScore: fast log-skala, 0,5 % = 0, 60 % = 100, stigande med chansen', async () => {
    const { horseScore } = await model();
    expect(horseScore(0.005)).toBe(0);
    expect(horseScore(0.001)).toBe(0);
    expect(horseScore(0.6)).toBe(100);
    expect(horseScore(0.9)).toBe(100);
    expect(horseScore(0.04)).toBe(43);
    expect(horseScore(0.25)).toBe(82);
    expect(horseScore(null)).toBeNull();
    const ps = [0.01, 0.03, 0.08, 0.15, 0.3, 0.5];
    const xs = ps.map(horseScore);
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
  });

  test('analyzeRace: total följer chansen, delpoäng 0–100 per område, strukna utan poäng', async () => {
    const { normalizeGame, analyzeGame, horseScore } = await model();
    const a = analyzeGame(normalizeGame(game()));
    const r = a.races[0];
    const live = r.horses.filter((h: any) => !h.scratched);
    for (const h of live) {
      expect(h.poang.total).toBe(horseScore(h.p));
      for (const k of ['form', 'fart', 'klass', 'spar', 'kusk', 'tranare', 'utrustning', 'tempo', 'marknad']) {
        expect(h.poang[k]).toBeGreaterThanOrEqual(0);
        expect(h.poang[k]).toBeLessThanOrEqual(100);
      }
    }
    // sorterat på chans → poängen faller eller står still nedåt i tabellen
    for (let i = 1; i < live.length; i++) expect(live[i].poang.total).toBeLessThanOrEqual(live[i - 1].poang.total);
    expect(r.horses.find((h: any) => h.scratched).poang).toBeUndefined();
    // häst 4 vann sina tre senaste: bäst form i loppet. Häst 1 mest streckad: högst streckpoäng
    const by = (nr: number) => live.find((h: any) => h.nr === nr);
    expect(by(4).poang.form).toBe(Math.max(...live.map((h: any) => h.poang.form)));
    expect(by(1).poang.marknad).toBe(Math.max(...live.map((h: any) => h.poang.marknad)));
  });

  test('groupScores: riktning efter vad som är bra för hästen, lika fält = 50', async () => {
    const { groupScores } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'trav-features.mjs')).href);
    const zero = [0, 0, 0];
    const X: any = new Proxy({}, { get: () => zero });
    const flat = groupScores({ n: 3, X, lq: [-1, -1, -1], hasMarket: true });
    for (const g of Object.values(flat) as number[][]) expect(g).toEqual([50, 50, 50]);
    // galopp är emot: flest galopper ger lägst formpoäng; skor på är emot i utrustning
    const X2: any = new Proxy({ galopp: [2, 0, -2], skorPa: [1, 0, -1] }, { get: (t: any, k) => t[k] ?? zero });
    const g2 = groupScores({ n: 3, X: X2, lq: [-1, -2, -3], hasMarket: true });
    expect(g2.form[0]).toBeLessThan(g2.form[2]);
    expect(g2.utrustning[0]).toBeLessThan(g2.utrustning[2]);
    expect(g2.marknad[0]).toBeGreaterThan(g2.marknad[2]);
  });
});

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

  test('reduceSystem minRowTop: varje rad kan ge minst så många kr vid alla rätt', async () => {
    const { reduceSystem, rowPayout } = await engine();
    const legs = legsFixture();
    const free = reduceSystem(legs, {}, { budget: 50, price: 0.5, expand: 8, topShare: 0.2 });
    const top = (r: number[]) => rowPayout(r.reduce((p, nr, i) => p * Math.max(1e-4, legs[i].horses.find((h: any) => h.nr === nr).marketPct), 1), 0.5, 0.2)!;
    const tops = free.rows.map(top).sort((a, b) => a - b);
    const limit = tops[Math.floor(tops.length / 2)];
    const r = reduceSystem(legs, { minRowTop: limit }, { budget: 50, price: 0.5, expand: 8, topShare: 0.2 });
    expect(r.count).toBeGreaterThan(0);
    expect(r.passed).toBeLessThan(free.passed);
    for (const row of r.rows) expect(top(row)).toBeGreaterThanOrEqual(limit);
    // tomt fält = inget villkor
    expect(reduceSystem(legs, { minRowTop: '' }, { budget: 50, price: 0.5, expand: 8, topShare: 0.2 }).passed).toBe(free.passed);
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
    // hästpoäng 0–100 för varje ej struken häst, högst för den med störst chans
    const pts = (await page.locator('.hs-race').first().locator('.hs-score b').allInnerTexts()).map(Number);
    expect(pts).toHaveLength(live);
    for (const x of pts) expect(x).toBeGreaterThanOrEqual(0), expect(x).toBeLessThanOrEqual(100);
    expect(pts[0]).toBe(Math.max(...pts));
    // uppföljningen visas (tom eller med tabell)
    await expect(page.locator('.hs-follow h3')).toContainText('Uppföljning på riktigt');
    if (state.uppfoljning?.games) await expect(page.locator('.hs-follow tbody tr').first()).toBeVisible();
    for (const b of [100, 1000]) {
      await page.click(`[data-budget="${b}"]`);
      const txt = await page.locator('.hs-sys-sum:not(.hs-sys-top):not(.hs-sys-skrall)').innerText();
      const cost = Number(txt.match(/([\d\s]+)\s*kr/)![1].replace(/\s/g, ''));
      expect(cost).toBeLessThanOrEqual(b);
      // skrällraden: antal avdelningar med häst under 10 % streck, högst antalet avdelningar
      const sk = (await page.locator('.hs-sys-skrall').innerText()).match(/i (\d+) av (\d+) avdelningar/)!;
      expect(Number(sk[1])).toBeLessThanOrEqual(Number(sk[2]));
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
    await expect(page.locator('.hs-sys-sum:not(.hs-sys-top):not(.hs-sys-skrall)')).toContainText('klarar villkoren');
    await expect(page.locator('.hs-atg-steps')).toContainText('Välj fil');
    const played = Number((await page.locator('.hs-sys-sum:not(.hs-sys-top):not(.hs-sys-skrall) b').innerText()).match(/^([\d\s]+) rader/)![1].replace(/\s/g, ''));
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="atg-file"]')]);
    expect(dl2.suggestedFilename()).toContain('-' + played + '-rader-');
    expect(dl2.suggestedFilename().slice(-8, -4)).toBe(crc16(fs.readFileSync((await dl2.path())!, 'utf8')));
    // Skrällsystem-knappen: reducerat, utgång 16 ×, minst 3 skrällar; Reducerat system tar bort skrällkravet igen
    await page.click('[data-mode="skrall3"]');
    await expect(page.locator('[data-mode="skrall3"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#hs-expand')).toHaveValue('16');
    await expect(page.locator('[data-cond="minSkrall"]')).toHaveValue('3');
    // Skrällsystemet väljer minst 1 000 kr (200 kr gick minus alla bakkörda år) och varnar om man sänker
    await expect(page.locator('[data-budget="1000"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.hs-skrall-budget')).toHaveCount(0);
    await page.click('[data-budget="200"]');
    await expect(page.locator('.hs-skrall-budget')).toContainText('gått minus');
    await page.click('[data-budget="1000"]');
    await expect(page.locator('.hs-skrall-budget')).toHaveCount(0);
    await page.click('[data-mode="reducerat"]');
    await expect(page.locator('[data-mode="skrall3"]')).toHaveAttribute('aria-pressed', 'false');
    // 50 000-systemet: utgång 16 ×, varje rad minst 50 000 kr, minst 2 000 kr, varnar om man sänker
    await page.click('[data-mode="rad50k"]');
    await expect(page.locator('[data-mode="rad50k"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-mode="skrall3"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-mode="reducerat"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#hs-expand')).toHaveValue('16');
    await expect(page.locator('[data-cond="minRowTop"]')).toHaveValue('50000');
    await expect(page.locator('[data-cond="minSkrall"]')).toHaveValue('');
    await expect(page.locator('[data-budget="2000"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.hs-radtop-text')).toContainText('Kort sagt');
    await expect(page.locator('.hs-radtop-budget')).toHaveCount(0);
    await page.click('[data-budget="500"]');
    await expect(page.locator('.hs-radtop-budget')).toContainText('gick minus');
    await page.click('[data-mode="skrall3"]');
    await expect(page.locator('[data-cond="minRowTop"]')).toHaveValue('');
    await expect(page.locator('[data-mode="rad50k"]')).toHaveAttribute('aria-pressed', 'false');
    await page.click('[data-mode="rad50k"]');
    await page.click('[data-mode="reducerat"]');
    await expect(page.locator('[data-cond="minRowTop"]')).toHaveValue('');
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

  test('avel, hemmabanor, rekord per distans, banunderlag och resultat sparas; komplettering fyller i gamla omgångar', async () => {
    const { normalizeGame } = await model();
    const { addExtras, lacksExtras } = await sasong();
    const st: any = start(1, { place: 1 });
    st.horse.id = 77;
    st.horse.pedigree = { father: { name: 'Far' }, mother: { name: 'Mor' }, grandfather: { name: 'Morfar' } };
    st.horse.homeTrack = { name: 'Boden' };
    st.horse.trainer.id = 9;
    st.horse.trainer.homeTrack = { name: 'Umåker' };
    st.driver.homeTrack = { name: 'Solvalla' };
    st.horse.statistics.life.records = [{ startMethod: 'auto', distance: 'medium', time: { minutes: 1, seconds: 12, tenths: 5 }, year: '2026' }];
    st.horse.statistics.lastFiveStarts = { averageOdds: 930 };
    st.result = { place: 1, finishOrder: 1, kmTime: { minutes: 1, seconds: 13, tenths: 0 }, finalOdds: 2.25, prizeMoney: 125000 };
    const r: any = race(1, [st]);
    r.track.condition = 'light';
    r.result = { victoryMargin: 'nos' };
    r.terms = ['3-åriga ston', '2140 m'];
    const g = normalizeGame({ id: 'V85_2026-10-03_5_1', type: 'V85', races: [r] });
    const s = g.races[0].starts[0];
    expect(s).toMatchObject({ horseId: 77, father: 'Far', grandfather: 'Morfar', horseHome: 'Boden', trainerId: 9, trainerHome: 'Umåker', driverHome: 'Solvalla', avgOdds5: 9.3 });
    expect(s.lifeRecords).toEqual([{ method: 'auto', dist: 'medium', km: 72.5, year: 2026 }]);
    expect(s.result).toMatchObject({ place: 1, km: 73, finalOdds: 2.25, prizeMoney: 125000 });
    expect(g.races[0]).toMatchObject({ condition: 'light', margin: 'nos', terms: '3-åriga ston 2140 m' });
    expect(lacksExtras(g)).toBe(false);
    // gammal sparad omgång utan fälten: kompletteras från spel-svaret, placeringen behålls
    const old: any = { races: [{ id: r.id, starts: [{ nr: 1, result: { place: 1 } }] }] };
    expect(lacksExtras(old)).toBe(true);
    addExtras(old, { races: [r] });
    expect(old.races[0]).toMatchObject({ condition: 'light', margin: 'nos' });
    expect(old.races[0].starts[0]).toMatchObject({ father: 'Far', horseHome: 'Boden', result: { place: 1, km: 73 } });
    expect(lacksExtras(old)).toBe(false);
  });

  test('streckSnapshot: streck, vinnarodds och platsodds per lopp och häst, strukna utanför', async () => {
    const { streckSnapshot } = await model();
    const g: any = { id: 'V85_2026-10-03_5_1', type: 'V85', pools: { V85: { turnover: 500000000 } }, races: [race(1, [start(1, { streck: 4520, odds: 250 }), start(2, { streck: 300 }), start(3, { scratched: true, streck: 0 })])] };
    g.races[0].starts[0].pools.plats = { minOdds: 120, maxOdds: 140 };
    const snap = streckSnapshot(g, '2026-10-03T08:00:00Z');
    expect(snap.at).toBe('2026-10-03T08:00:00Z');
    expect(snap.turnover).toBe(5000000);
    expect(snap.races['2026-10-03_5_1']).toEqual({ 1: [0.452, 2.5, 1.2], 2: [0.03, null, null] });
  });

});

test.describe('hast-lopp: fältets resultat i tidigare lopp', () => {
  const lopp = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'hast-lopp.mjs')).href);
  const km = (s: number, t = 0) => ({ minutes: 1, seconds: s, tenths: t });
  const atgRace: any = {
    id: '2026-09-16_7_7', date: '2026-09-16', distance: 1640, startMethod: 'auto', track: { name: 'Jägersro' },
    starts: [
      { number: 1, horse: { id: 11, name: 'Etta' }, result: { place: 1, finishOrder: 1, kmTime: km(10, 9), finalOdds: 5.29 } },
      { number: 2, horse: { id: 12, name: 'Tvåa' }, result: { place: 2, finishOrder: 2, kmTime: km(11, 0), finalOdds: 3.09 } },
      { number: 3, horse: { id: 13, name: 'Galopp' }, result: { place: 0, finishOrder: 6, kmTime: km(14, 0), galloped: true, finalOdds: 9 } },
      { number: 4, horse: { id: 14, name: 'Diskad' }, result: { finishOrder: 41, kmTime: { code: 'u' }, galloped: true, disqualified: true, finalOdds: 20 } },
      { number: 5, horse: { id: 15, name: 'Struken' }, result: { finishOrder: 55, finalOdds: 0 } },
    ],
  };

  test('compactRace + fieldInfo: meter efter vinnaren, vinnaren minus avståndet till tvåan, strukna utanför', async () => {
    const { compactRace, fieldInfo } = await lopp();
    const c = compactRace(atgRace);
    expect(c.starts.length).toBe(4);
    // 0,1 s/km × 1 640 m / 70,9 s/km ≈ 2,3 m
    expect(fieldInfo(c, 12, null)).toMatchObject({ efter: 2.3, falt: 4, galopp: 0 });
    expect(fieldInfo(c, 11, null)!.efter).toBe(-2.3);
    expect(fieldInfo(c, 13, null)!.galopp).toBe(1);
    expect(fieldInfo(c, 14, null)).toMatchObject({ efter: null, motFalt: null, galopp: 1 });
    expect(fieldInfo(c, null, 'Tvåa (SE)')!.efter).toBe(2.3);
    expect(fieldInfo(c, 99, 'Okänd')).toBeNull();
  });

  test('attachFieldInfo: datum + bana hittar loppet utan lopp-id, lopp-id går före', async () => {
    const { compactRace, indexRaces, attachFieldInfo } = await lopp();
    const c = compactRace(atgRace);
    const game: any = { races: [{ starts: [{ horseId: 12, horse: 'Tvåa', records: [{ date: '2026-09-16', track: 'Jägersro' }, { date: '2026-08-01', track: 'Åby' }] }] }] };
    expect(attachFieldInfo([game], indexRaces([c]))).toBe(1);
    expect(game.races[0].starts[0].records[0]).toMatchObject({ efter: 2.3, falt: 4 });
    expect(game.races[0].starts[0].records[1].efter).toBeUndefined();
    const live: any = { races: [{ starts: [{ horseId: 11, horse: 'Etta', records: [{ date: '2026-09-16', track: 'Annan', raceId: c.id }] }] }] };
    expect(attachFieldInfo([live], new Map(), { byId: new Map([[c.id, c]]) })).toBe(1);
    expect(live.races[0].starts[0].records[0].efter).toBe(-2.3);
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

  test('skobyte räknas mot förra starten: barfota runt om → skor bak = skor PÅ, inte av', async () => {
    const { shoeChange, rawFeatures } = await features();
    const bare = { front: false, back: false };
    const shod = { front: true, back: true };
    // Readly Brodde, V85 Boden 2026-10-03: barfota runt om senast, skor bak i dag
    expect(shoeChange({ front: false, back: true, changed: true }, bare)).toEqual({ av: 0, pa: 1 });
    // skor runt om senast, barfota bak i dag = skor av
    expect(shoeChange({ front: true, back: false, changed: true }, shod)).toEqual({ av: 1, pa: 0 });
    expect(shoeChange({ front: false, back: false, changed: true }, shod)).toEqual({ av: 1, pa: 0 });
    // av fram och på bak samtidigt = varken eller
    expect(shoeChange({ front: false, back: true, changed: true }, { front: true, back: false })).toEqual({ av: 0, pa: 0 });
    // inget byte, eller okänd sko i dag
    expect(shoeChange({ front: false, back: true, changed: false }, bare)).toEqual({ av: 0, pa: 0 });
    expect(shoeChange({ front: null, back: true, changed: true }, bare)).toEqual({ av: 0, pa: 0 });
    // utan förra startens skor: bara säkra fall
    expect(shoeChange({ front: false, back: false, changed: true }, null)).toEqual({ av: 1, pa: 0 });
    expect(shoeChange({ front: true, back: true, changed: true }, { front: null, back: null })).toEqual({ av: 0, pa: 1 });
    expect(shoeChange({ front: false, back: true, changed: true }, null)).toEqual({ av: 0, pa: 0 });
    // rawFeatures använder senaste ej strukna starten
    const race = { startTime: '2026-10-03T15:00:00', distance: 2140, startMethod: 'auto' };
    const h = { shoes: { front: false, back: true, changed: true }, records: [
      { date: '2026-09-20', scratched: true, shoes: shod },
      { date: '2026-09-06', place: 1, km: 72.7, shoes: bare },
    ] };
    const f = rawFeatures(race, h, {});
    expect(f.skorPa).toBe(1);
    expect(f.skorAv).toBe(0);
  });

  test('kommentaren säger skor på/av när riktningen är känd', async () => {
    const { analyzeRace } = await model();
    const race = normRace('K', '2026-05-01', 3, 1);
    race.starts[0].shoes = { front: false, back: true, changed: true };
    (race.starts[0].records[0] as any).shoes = { front: false, back: false };
    race.starts[1].shoes = { front: true, back: false, changed: true };
    (race.starts[1].records[0] as any).shoes = { front: true, back: true };
    race.starts[2].shoes = { front: false, back: true, changed: true };
    const a = analyzeRace(race, {}, { learned: false });
    const c = (nr: number) => a.horses.find((h: any) => h.nr === nr).comments;
    expect(c(1)).toContain('Skor på (ändrat)');
    expect(c(2)).toContain('Skor av (ändrat)');
    expect(c(3)).toContain('Skoändring');
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

test('långdistansrekord (2600 m+): bara i långa lopp, samma startmetod, nytt rekord = i år eller förra året', async () => {
  const { rawFeatures, raceRow, FEATURE_KEYS } = await features();
  expect(FEATURE_KEYS).toEqual(expect.arrayContaining(['langRekord', 'langRekordNy']));
  const recs = [
    [{ method: 'volte', dist: 'long', km: 74.0, year: 2026 }, { method: 'auto', dist: 'long', km: 72.0, year: 2025 }],
    [{ method: 'volte', dist: 'long', km: 76.5, year: 2022 }],
    [{ method: 'auto', dist: 'medium', km: 71.0, year: 2026 }],
  ];
  const race = normRace('L', '2026-05-01', 3, 1);
  race.distance = 2640;
  race.startMethod = 'volte';
  race.starts.forEach((s: any, i: number) => { s.distance = 2640; s.lifeRecords = recs[i]; });
  const f = race.starts.map((s: any) => rawFeatures(race, s, {}));
  expect(f[0].langRekord).toBe(-74.0); // voltrekordet, inte autostartsrekordet
  expect(f[0].langRekordNy).toBe(1);
  expect(f[1].langRekordNy).toBe(0); // satt 2022
  expect(f[2].langRekord).toBeNull(); // bara medeldistansrekord
  const row = raceRow(race, {});
  expect(row.X.langRekord[0]).toBeGreaterThan(row.X.langRekord[1]);
  // Medeldistans: faktorn påverkar inte
  const kort = normRace('K', '2026-05-01', 3, 1);
  kort.starts.forEach((s: any, i: number) => { s.lifeRecords = recs[i]; });
  expect(rawFeatures(kort, kort.starts[0], {}).langRekord).toBeNull();
  expect(raceRow(kort, {}).X.langRekord).toEqual([0, 0, 0]);
});

test('favoritleverans: segrar som favorit (odds ≤ 2,5) krympt mot 0,45, null utan favoritstarter', async () => {
  const { rawFeatures, FEATURE_KEYS } = await features();
  expect(FEATURE_KEYS).toContain('favLev');
  const race = normRace('F', '2026-05-01', 3, 1);
  const rec = (odds: number, place: number) => ({ date: '2026-04-01', place, km: 75, odds, track: 'Solvalla', startMethod: 'auto', distance: 2140 });
  race.starts[0].records = [rec(1.5, 1), rec(2.0, 1), rec(2.5, 1)]; // 3 av 3 som favorit
  race.starts[1].records = [rec(1.8, 4), rec(2.2, 5), rec(9.0, 1)]; // 0 av 2 (odds 9 räknas inte)
  race.starts[2].records = [rec(12, 1)];
  const f = race.starts.map((s: any) => rawFeatures(race, s, {}));
  expect(f[0].favLev).toBeCloseTo((3 + 0.45 * 3) / 6, 6);
  expect(f[1].favLev).toBeCloseTo((0 + 0.45 * 3) / 5, 6);
  expect(f[2].favLev).toBeNull();
});

test('tränarbyte: historik ur V-spelsstarter, bara starter före datumet, ≤ 90 dagar = 1, null utan start inom ett år', async () => {
  const { trainerTimeline, trainerIndex, rawFeatures, buildRows, FEATURE_KEYS } = await features();
  expect(FEATURE_KEYS).toContain('tranareByte90');
  const g = (date: string, trainers: number[]) => {
    const r = normRace(`T${date}`, date, trainers.length, 1);
    r.starts.forEach((s: any, i: number) => { s.horseId = i + 1; s.trainerId = trainers[i]; });
    return { id: `V85_${date}`, type: 'V85', date, races: [r] };
  };
  const games = [g('2025-01-10', [7, 8, 9]), g('2026-03-01', [7, 5, 9]), g('2026-05-01', [6, 5, 9])];
  const tl = trainerTimeline(games);
  expect(tl[1]).toEqual([['2025-01-10', 7], ['2026-03-01', 7], ['2026-05-01', 6]]);
  const idx = trainerIndex(tl);
  expect(idx(1, 6, '2026-05-01')).toBe(0); // byter nu (inte facit: dagens start räknas inte)
  expect(idx(2, 5, '2026-05-01')).toBe(61); // bytte 2026-03-01
  expect(idx(3, 9, '2026-05-01')).toBe(Infinity); // samma tränare hela tiden
  expect(idx(2, 5, '2026-03-01')).toBeNull(); // förra starten 2025-01-10 är över ett år gammal
  expect(idx(99, 1, '2026-05-01')).toBeNull();
  // Faktorn: ≤ 90 dagar = 1, annars 0, saknas = null
  const race = games[2].races[0];
  const f = race.starts.map((s: any) => rawFeatures(race, s, { trainerHist: idx }));
  expect(f.map((x: any) => x.tranareByte90)).toEqual([1, 1, 0]);
  expect(rawFeatures(race, race.starts[0], {}).tranareByte90).toBeNull();
  // buildRows bygger historiken själv ur omgångarna
  const rows = buildRows(games, { withMarketOnly: false });
  const last = rows.find((r: any) => r.date === '2026-05-01');
  expect(last.X.tranareByte90[0]).toBeGreaterThan(last.X.tranareByte90[2]);
});

test('skarpt läge: tränarhistorik ur fil plus dagens omgång, null utan fil', async () => {
  const { loadTrainerHist } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'fetch-hastar.mjs')).href);
  const tmp = path.join((await import('os')).tmpdir(), `tranare-${process.pid}.json`);
  fs.writeFileSync(tmp, JSON.stringify({ 1: [['2026-04-01', 7]] }));
  try {
    const r = normRace('S', '2026-05-01', 1, 1);
    r.starts[0].horseId = 1;
    r.starts[0].trainerId = 6;
    const idx = loadTrainerHist([{ id: 'x', date: '2026-05-01', races: [r] }], tmp);
    expect(idx(1, 6, '2026-05-01')).toBe(0);
    expect(idx(1, 6, '2026-05-02')).toBe(1); // dagens omgång läggs till historiken
    expect(loadTrainerHist([], tmp + '.saknas')).toBeNull();
  } finally {
    fs.rmSync(tmp, { force: true });
  }
});

// ---------- Högsta rad-spärr (hast-engine) ----------
const topLegs = () => Array.from({ length: 8 }, (_, i) => ({
  leg: i + 1, number: i + 1,
  horses: [0.4, 0.25, 0.15, 0.1, 0.06, 0.04].map((s, j) => ({ nr: j + 1, p: s * (j === 4 ? 1.5 : 1) / 1.03, marketPct: s, rank: j === 0 ? 'A' : 'B' })),
}));
const streckProd = (legs: any[], sysLegs: any[]) => sysLegs.reduce((a: number, l: any, i: number) =>
  a * Math.min(...l.horses.map((nr: number) => legs[i].horses.find((h: any) => h.nr === nr).marketPct)), 1);

test.describe('hast-engine: standard per spelform', () => {
  test('V85 och V75 spelas med Hög (alpha 1), övriga med Träff (alpha 0)', async () => {
    const { defaultAlpha, DEFAULT_ALPHA, buildSystem, TOP_SHARE } = await engine();
    expect(DEFAULT_ALPHA).toEqual({ V85: 1, V75: 1 });
    expect(defaultAlpha('V85')).toBe(1);
    expect(defaultAlpha('V75')).toBe(1);
    for (const t of ['V86', 'GS75', 'V64', 'V65', 'dd', undefined]) expect(defaultAlpha(t)).toBe(0);
    // standardvalet ger exakt samma system som Hög
    const legs = topLegs();
    const a = buildSystem(legs, { budget: 500, price: 0.5, alpha: defaultAlpha('V85'), minTop: 50000, topShare: TOP_SHARE.V85 });
    const b = buildSystem(legs, { budget: 500, price: 0.5, alpha: 1, minTop: 50000, topShare: TOP_SHARE.V85 });
    expect(a.legs).toEqual(b.legs);
  });

  test('skrallLegs = avdelningar med minst en häst under 10 % streck, i rakt och reducerat system', async () => {
    const { buildSystem, reduceSystem, SKRALL_MAX } = await engine();
    const legs = topLegs();
    for (const alpha of [0, 1]) {
      const s = buildSystem(legs, { budget: 500, price: 0.5, alpha, minTop: 50000, topShare: 0.195 });
      const byLeg = legs.map((l) => Object.fromEntries(l.horses.map((h) => [h.nr, h])));
      const expected = s.legs.filter((l, i) => l.horses.some((nr) => byLeg[i][nr].marketPct < SKRALL_MAX)).length;
      expect(s.skrallLegs).toBe(expected);
      expect(s.skrallLegs).toBeGreaterThanOrEqual(0);
      expect(s.skrallLegs).toBeLessThanOrEqual(legs.length);
    }
    const r = reduceSystem(legs, {}, { budget: 200, price: 0.5, alpha: 1, minTop: 50000, topShare: 0.195 });
    expect(typeof r.base.skrallLegs).toBe('number');
    // Hög värdevikt tar minst lika många skrällavdelningar som ren vinstchans i testomgången
    const lo = buildSystem(legs, { budget: 500, price: 0.5, alpha: 0, minTop: 50000, topShare: 0.195 });
    const hi = buildSystem(legs, { budget: 500, price: 0.5, alpha: 1, minTop: 50000, topShare: 0.195 });
    expect(hi.skrallLegs).toBeGreaterThanOrEqual(lo.skrallLegs);
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

// ---------- Förväntad utdelning och uppföljning ----------

const uppf = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'hast-uppfoljning.mjs')).href);
const fakeLegs = (n: number, ps: number[][], ss?: number[][]) =>
  Array.from({ length: n }, (_, i) => ({ leg: i + 1, number: i + 1, horses: ps[i].map((p, j) => ({ nr: j + 1, p, marketPct: ss ? ss[i][j] : p, scratched: false })) }));

test.describe('hast-engine: förväntad utdelning', () => {
  test('högsta nivån räknas exakt: andel · radpris · Π Σ chans/streck', async () => {
    const { simulateOutcomes, expectedReturn } = await engine();
    // okänd spelform med 2 avdelningar: bara högsta nivån (andel 0,25)
    const legs = fakeLegs(2, [[0.5, 0.3, 0.2], [0.6, 0.4]], [[0.25, 0.5, 0.25], [0.5, 0.5]]);
    const o = simulateOutcomes(legs, { type: 'X', price: 1, sims: 50 });
    const e = expectedReturn([[1, 3], [2]], o, 1);
    expect(e.ev).toBeCloseTo(0.25 * 1 * (0.5 / 0.25 + 0.2 / 0.25) * (0.4 / 0.5), 6);
    // chans = streck: varje system får tillbaka potandelen, oavsett hästar
    const fair = fakeLegs(2, [[0.5, 0.3, 0.2], [0.6, 0.4]]);
    const of = simulateOutcomes(fair, { type: 'X', price: 1, sims: 50 });
    for (const sys of [[[1], [1]], [[1, 2, 3], [2]], [[3], [1, 2]]]) expect(expectedReturn(sys, of, 1).roi).toBeCloseTo(-0.75, 6);
  });

  test('V85 med chans = streck: återbetalning nära summan av nivåernas andelar (59 %), samma siffror vid samma frö', async () => {
    const { simulateOutcomes, expectedReturn, TIER_SHARE } = await engine();
    const ps = Array.from({ length: 8 }, () => [0.4, 0.25, 0.15, 0.1, 0.06, 0.04]);
    const legs = fakeLegs(8, ps);
    const o = simulateOutcomes(legs, { type: 'V85', price: 0.5, sims: 3000, seed: 7 });
    const sys = Array.from({ length: 8 }, (_, i) => (i < 4 ? [1, 2] : [1]));
    const e = expectedReturn(sys, o, 0.5);
    const total = Object.values(TIER_SHARE.V85).reduce((a: number, b: any) => a + b, 0) as number;
    expect(e.roi).toBeGreaterThan(total - 1 - 0.12);
    expect(e.roi).toBeLessThanOrEqual(total - 1 + 0.05);
    expect(expectedReturn(sys, simulateOutcomes(legs, { type: 'V85', price: 0.5, sims: 3000, seed: 7 }), 0.5).ev).toBe(e.ev);
  });

  test('buildValueSystem: väljer kandidaten med högst förväntad återbetalning, inom budget och högsta rad-spärren', async () => {
    const { buildValueSystem, MIN_TOP } = await engine();
    // avdelning 1: häst 3 är kraftigt understreckad
    const ps = Array.from({ length: 8 }, () => [0.45, 0.3, 0.15, 0.1]);
    const ss = Array.from({ length: 8 }, (_, i) => (i === 0 ? [0.55, 0.35, 0.03, 0.07] : [0.45, 0.3, 0.15, 0.1]));
    const v = buildValueSystem(fakeLegs(8, ps, ss), { budget: 100, price: 0.5, minTop: MIN_TOP, topShare: 0.195, type: 'V85', sims: 500 });
    expect(v.cost).toBeLessThanOrEqual(100);
    expect(v.topOk).toBe(true);
    expect(v.evRoi).toBe(Math.max(...v.candidates.map((c: any) => c.roi)));
    expect(v.legs[0].horses).toContain(3);
  });
});

test.describe('uppföljning: hämtningstider och frysta system', () => {
  test('fetchSlots: kl. 10, 2 h, 45 och 15 min före start; dueSlots tar bara passerade och ogjorda före start', async () => {
    const { fetchSlots, dueSlots } = await uppf();
    const start = new Date(2026, 9, 3, 15, 0).getTime();
    expect(fetchSlots(start).map((s: any) => [s.key, new Date(s.at).getHours(), new Date(s.at).getMinutes()])).toEqual([['kl10', 10, 0], ['t-120', 13, 0], ['t-45', 14, 15], ['t-15', 14, 45]]);
    // tidig start: 2 h före ligger före kl. 10 och tas bort
    expect(fetchSlots(new Date(2026, 9, 4, 11, 0).getTime()).map((s: any) => s.key)).toEqual(['kl10', 't-45', 't-15']);
    const at = (h: number, m: number) => new Date(2026, 9, 3, h, m).getTime();
    expect(dueSlots(start, at(9, 50))).toEqual([]);
    expect(dueSlots(start, at(14, 20)).map((s: any) => s.key)).toEqual(['kl10', 't-120', 't-45']);
    expect(dueSlots(start, at(14, 20), ['kl10', 't-120']).map((s: any) => s.key)).toEqual(['t-45']);
    expect(dueSlots(start, at(15, 1))).toEqual([]);
  });

  test('freezeSystems → settleFrozen → summarizeFollow: tre system per budget, rättade mot utdelningen', async () => {
    const { normalizeGame, analyzeGame } = await model();
    const { freezeSystems, settleFrozen, summarizeFollow, FOLLOW_BUDGETS } = await uppf();
    const a = { ...analyzeGame(normalizeGame(game())), fetchedAt: '2026-10-03T08:00:00Z' };
    const fr = freezeSystems(a, { sims: 200 });
    expect(Object.keys(fr.systems)).toEqual(['standard', 'utdelning', 'skrall3', 'rad50k']);
    // 50 000-systemet fryses bara på 2 000 kr och håller budgeten
    const { RAD_TOP_MIN_BUDGET } = await engine();
    expect(Object.keys(fr.systems.rad50k)).toEqual([String(RAD_TOP_MIN_BUDGET)]);
    expect(fr.systems.rad50k[RAD_TOP_MIN_BUDGET].cost).toBeLessThanOrEqual(RAD_TOP_MIN_BUDGET);
    for (const b of FOLLOW_BUDGETS) {
      expect(fr.systems.standard[b].cost).toBeLessThanOrEqual(b);
      expect(fr.systems.utdelning[b].cost).toBeLessThanOrEqual(b);
    }
    const s = settleFrozen(fr, [[1], [1]], { '2': { payout: 10000 } });
    const std = s.systems.standard[200];
    expect(std.result.win).toBe(std.legs[0].includes(1) && std.legs[1].includes(1) ? 100 : 0);
    const sum = summarizeFollow([s, { ...s, id: 'X' }]);
    expect(sum.standard[200].games).toBe(2);
    expect(sum.standard[200].cost).toBeCloseTo(2 * std.result.cost, 2);
    expect(Object.keys(summarizeFollow([fr]).standard)).toEqual([]); // orättade räknas inte
  });
});
