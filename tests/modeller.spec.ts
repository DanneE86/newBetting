import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Modelltävlingen (scripts/modeller): ingen modell får se framtiden eller en annan modell, och facit ska räknas rätt.
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'scripts', 'modeller');
const lib = (f: string) => import(pathToFileURL(path.join(DIR, f)).href);
const FILER = ['m1-nuvarande.mjs', 'm2-oddslasaren.mjs', 'm3-skottmotorn.mjs', 'm4-tvillingar.mjs', 'm5-detektiven.mjs'];

// Påhittade matcher med fast slump: 20 lag, ~2600 matcher, odds som följer lagstyrkan
function fejkMatcher() {
  let s = 12345;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const styrka = Array.from({ length: 20 }, () => r() * 0.8);
  const ut: any[] = [];
  const d0 = Date.parse('2023-08-01T00:00:00Z');
  for (let v = 0; v < 260; v++) {
    const date = new Date(d0 + v * 3 * 864e5).toISOString().slice(0, 10);
    const lag = [...Array(20).keys()].sort(() => r() - 0.5);
    for (let i = 0; i < 20; i += 2) {
      const h = lag[i], a = lag[i + 1];
      const lh = 1.2 + styrka[h] - styrka[a] / 2, la = 1 + styrka[a] - styrka[h] / 2;
      const hg = Math.floor(r() * 2 * Math.max(0.2, lh)), ag = Math.floor(r() * 2 * Math.max(0.2, la));
      const ph = Math.min(0.8, Math.max(0.1, 0.45 + (styrka[h] - styrka[a]) / 2));
      const pa = Math.max(0.08, 0.75 - ph - 0.25);
      const pd = 1 - ph - pa;
      const o = (p: number, m: number) => Math.round((m / p) * 100) / 100;
      ut.push({
        id: `F${v}_${i}`, league: 'PL', season: v < 120 ? '2023/24' : '2024/25', date,
        home: `L${h}`, away: `L${a}`, hg, ag, result: hg > ag ? 'H' : hg < ag ? 'A' : 'D',
        shots: { home: 8 + hg * 3, away: 8 + ag * 3, homeSot: 2 + hg, awaySot: 2 + ag },
        odds: {
          home: o(ph, 0.95), draw: o(pd, 0.95), away: o(pa, 0.95), over25: 1.9, under25: 1.9,
          max_home: o(ph, 1.0), max_draw: o(pd, 1.0), max_away: o(pa, 1.0),
          b365_home: o(ph, 0.96), b365_draw: o(pd, 0.96), b365_away: o(pa, 0.96),
        },
        closing: { pinnacle_home: o(ph, 0.98), pinnacle_draw: o(pd, 0.98), pinnacle_away: o(pa, 0.98) },
      });
    }
  }
  return ut;
}

test.describe('modelltävlingen: inga läckor', () => {
  test('vyn saknar resultat, stängningsodds och matchstatistik', async () => {
    const { vy } = await lib('grund.mjs');
    const v = vy({ id: 'x', league: 'PL', season: 's', date: '2025-01-01', home: 'A', away: 'B', hg: 1, ag: 0, result: 'H', totalGoals: 1, over25: false, btts: false, closing: { avg_home: 2 }, shots: { home: 3 }, discipline: {}, xh: 1, xa: 0, odds: { home: 2 } });
    for (const k of ['hg', 'ag', 'result', 'totalGoals', 'over25', 'btts', 'closing', 'shots', 'discipline', 'xh', 'xa']) expect(v).not.toHaveProperty(k);
    expect(v.odds.home).toBe(2);
    expect(Object.isFrozen(v)).toBe(true);
  });

  test('facit kommer först när hela matchdagen är slut', async () => {
    const { bakkor } = await lib('grund.mjs');
    const logg: string[] = [];
    const matcher = [
      { id: 'a', date: '2025-01-01', result: 'H', odds: null }, { id: 'b', date: '2025-01-01', result: 'D', odds: null },
      { id: 'c', date: '2025-01-02', result: 'A', odds: null },
    ];
    bakkor({ predict: (v: any) => { logg.push(`p:${v.id}`); return null; }, bet: () => null, learn: (m: any) => logg.push(`l:${m.id}`) }, matcher, { from: '2020-01-01' });
    expect(logg).toEqual(['p:a', 'p:b', 'l:a', 'l:b', 'p:c', 'l:c']);
  });

  for (const fil of FILER) {
    test(`${fil}: framtida resultat ändrar inget tips eller spel före den dagen`, async () => {
      test.setTimeout(180_000);
      const { bakkor } = await lib('grund.mjs');
      const { skapa } = await lib(fil);
      const a = fejkMatcher();
      const brytdag = a[2000].date;
      const b = a.map((m) => (m.date >= brytdag
        ? { ...m, hg: m.ag, ag: m.hg + 3, result: 'A', shots: { home: 1, away: 30, homeSot: 0, awaySot: 15 } }
        : m));
      const fore = (x: any[]) => {
        const datum = new Map(a.map((m) => [m.id, m.date]));
        return x.filter((r) => (datum.get(r.id) as string) <= brytdag);
      };
      const ra = fore(bakkor(skapa(), a, { from: '2023-01-01' }));
      const rb = fore(bakkor(skapa(), b, { from: '2023-01-01' }));
      expect(ra.length).toBeGreaterThan(50);
      expect(rb).toEqual(ra);
    });
  }
});

test.describe('modelltävlingen: oberoende', () => {
  for (const fil of FILER) {
    test(`${fil} importerar ingen annan modell och inget facit`, () => {
      const kod = fs.readFileSync(path.join(DIR, fil), 'utf8');
      const importer = [...kod.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
      for (const i of importer) {
        expect(i).not.toMatch(/m[1-5]-|utvardering|kor\.mjs/);
      }
      expect(kod).not.toMatch(/closing|betting-store|data['"], *['"]reports['"], *['"]modeller/);
    });
  }

  test('varje modell ger chanser som summerar till 1 och ett giltigt tecken', async () => {
    test.setTimeout(180_000);
    const { bakkor } = await lib('grund.mjs');
    for (const fil of FILER) {
      const { skapa } = await lib(fil);
      const rader = bakkor(skapa(), fejkMatcher(), { from: '2024-06-01' });
      expect(rader.length, fil).toBeGreaterThan(100);
      for (const r of rader) {
        expect(Math.abs(r.p[0] + r.p[1] + r.p[2] - 1), fil).toBeLessThan(0.001);
        expect([0, 1, 2]).toContain(r.pick);
      }
    }
  });
});

test.describe('modelltävlingen: facit', () => {
  test('rps: rätt och fel säkert tips', async () => {
    const { rps } = await lib('utvardering.mjs');
    expect(rps([1, 0, 0], 0)).toBeCloseTo(0);
    expect(rps([1, 0, 0], 2)).toBeCloseTo(1);
    expect(rps([0.5, 0.3, 0.2], 1)).toBeCloseTo(0.5 * (0.25 + 0.04));
  });

  test('spelFacit: vinst, ROI och CLV mot stängningen', async () => {
    const { spelFacit } = await lib('utvardering.mjs');
    const m: any = { a: { result: 'H', closing: { pinnacle_home: 2, pinnacle_draw: 4, pinnacle_away: 4 } }, b: { result: 'D', closing: {} } };
    const f = spelFacit([{ id: 'a', i: 0, odds: 2.5 }, { id: 'b', i: 0, odds: 2 }], (id: string) => m[id]);
    expect(f.n).toBe(2);
    expect(f.vunna).toBe(1);
    expect(f.enheter).toBeCloseTo(0.5);
    expect(f.roi).toBeCloseTo(0.25);
    expect(f.clv).toBeCloseTo(2.5 * 0.5 - 1);
    expect(f.maxFall).toBeCloseTo(1);
  });

  test('stangning: Pinnacle före Betfair före snitt', async () => {
    const { stangning } = await lib('utvardering.mjs');
    expect(stangning({ closing: { pinnacle_home: 2, pinnacle_draw: 4, pinnacle_away: 4, avg_home: 9, avg_draw: 9, avg_away: 9 } })[0]).toBeCloseTo(0.5);
    expect(stangning({ closing: { avg_home: 3, avg_draw: 3, avg_away: 3 } })[0]).toBeCloseTo(1 / 3);
    expect(stangning({ closing: {} })).toBeNull();
  });

  test('intervall: upprepbart och omger snittet', async () => {
    const { intervall } = await lib('utvardering.mjs');
    const v = Array.from({ length: 500 }, (_, i) => (i % 2 ? 1 : -1));
    const a = intervall(v), b = intervall(v);
    expect(a).toEqual(b);
    expect(a[0]).toBeLessThan(0);
    expect(a[1]).toBeGreaterThan(0);
  });
});
