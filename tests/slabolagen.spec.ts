import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

// "Slå bolagen" (scripts/slabolagen): slutprovet ska vara låst och modellerna får inte se framtiden.
const ROOT = path.resolve(__dirname, '..');
const lib = (f: string) => import(pathToFileURL(path.join(ROOT, 'scripts', 'slabolagen', f)).href);

function fejk() {
  let s = 99;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const ut: any[] = [];
  const d0 = Date.parse('2019-08-01T00:00:00Z');
  for (let v = 0; v < 700; v++) {
    const date = new Date(d0 + v * 3 * 864e5).toISOString().slice(0, 10);
    for (let i = 0; i < 10; i++) {
      const ph = 0.3 + r() * 0.3, pd = 0.26, pa = 1 - ph - pd;
      const o = (p: number, m: number) => Math.round((m / p) * 100) / 100;
      const hg = Math.floor(r() * 4), ag = Math.floor(r() * 3);
      const mx = 1 + r() * 0.15;
      ut.push({
        id: `F${v}_${i}`, league: 'PL', season: `s${Math.floor(v / 120)}`, date, home: `L${i * 2}`, away: `L${i * 2 + 1}`, hg, ag, result: hg > ag ? 'H' : hg < ag ? 'A' : 'D',
        shots: { home: 10, away: 10, homeSot: 4, awaySot: 3 },
        odds: {
          home: o(ph, 0.94), draw: o(pd, 0.94), away: o(pa, 0.94), max_home: o(ph, mx), max_draw: o(pd, mx), max_away: o(pa, mx),
          b365_home: o(ph, 0.95), b365_draw: o(pd, 0.95), b365_away: o(pa, 0.95), pinnacle_home: o(ph, 0.98), pinnacle_draw: o(pd, 0.98), pinnacle_away: o(pa, 0.98),
          over25: 1.85, under25: 1.95, max_over25: 1.85 * mx, max_under25: 1.95 * mx, b365_over25: 1.86, b365_under25: 1.96, pinnacle_over25: 2.1, pinnacle_under25: 1.8,
        },
        closing: { pinnacle_home: o(ph + 0.01, 0.98), pinnacle_draw: o(pd, 0.98), pinnacle_away: o(pa - 0.01, 0.98), pinnacle_over25: 1.9, pinnacle_under25: 1.95 },
      });
    }
  }
  return ut;
}

test('slutprovet går inte att läsa av misstag', async () => {
  const { laddaAlla, UTVECKLING_TILL } = await lib('data.mjs');
  const u = laddaAlla(ROOT);
  expect(u.at(-1).date <= UTVECKLING_TILL).toBe(true);
  expect(UTVECKLING_TILL).toBe('2024-10-31');
});

test('framtida resultat och stängningsodds ändrar inget spel före den dagen', async () => {
  test.setTimeout(120_000);
  const { korModeller } = await lib('modeller.mjs');
  const a = fejk();
  const brytdag = a[4500].date;
  const b = a.map((m) => (m.date >= brytdag
    ? { ...m, hg: 0, ag: 9, result: 'A', shots: { home: 1, away: 30, homeSot: 0, awaySot: 15 }, closing: { pinnacle_home: 9, pinnacle_draw: 9, pinnacle_away: 1.2, pinnacle_over25: 1.1, pinnacle_under25: 8 } }
    : m));
  const fore = (x: any[]) => x.filter((r) => r.date <= brytdag);
  const ra = fore(korModeller(a)), rb = fore(korModeller(b));
  expect(ra.length).toBeGreaterThan(50);
  expect(rb).toEqual(ra);
});

test('valj: tak, EV-spärr och tröskel', async () => {
  const { valj } = await lib('modeller.mjs');
  expect(valj([0.5, 0.3, 0.2], [2.2, 3, 4], 0.05)).toBe(0);
  expect(valj([0.5, 0.3, 0.2], [2.05, 3, 4], 0.05)).toBeNull();
  expect(valj([0.5, 0.3, 0.2], [3, 3, 4], 0.05)).toBeNull(); // EV 50 % = datafel
  expect(valj([0.2, 0.3, 0.5], [6, 3, 1.5], 0.05)).toBeNull(); // över oddstaket
  expect(valj(null, [2, 3, 4], 0)).toBeNull();
});

test('facit: 1X2 och mål, CLV mot stängningen', async () => {
  const { facit } = await lib('modeller.mjs');
  const m = { result: 'H', hg: 2, ag: 1, closing: { pinnacle_home: 2, pinnacle_draw: 4, pinnacle_away: 4, pinnacle_over25: 2, pinnacle_under25: 2 } };
  expect(facit({ marknad: '1x2', i: 0, odds: 2.5 }, m).v).toBeCloseTo(1.5);
  expect(facit({ marknad: '1x2', i: 1, odds: 3 }, m).v).toBe(-1);
  expect(facit({ marknad: '1x2', i: 0, odds: 2.5 }, m).clv).toBeCloseTo(0.25);
  expect(facit({ marknad: 'ou', i: 0, odds: 2 }, m).v).toBe(1);
  expect(facit({ marknad: 'ou', i: 1, odds: 2 }, m).v).toBe(-1);
});

test('portfolj: samma spel räknas en gång per prisnivå', async () => {
  const { portfolj } = await lib('modeller.mjs');
  const b = (kod: string, niva: string, i: number) => ({ kod, niva, id: 'x', marknad: '1x2', i, odds: 2 });
  expect(portfolj([b('J1', 'max', 0), b('J3', 'max', 0), b('J3', 'b365', 0), b('J1', 'max', 1)])).toHaveLength(3);
});

test('poisson: chanserna summerar till 1 och mer mål ger mer över', async () => {
  const { poisson } = await lib('data.mjs');
  const a = poisson(1.5, 1), b = poisson(2.5, 2);
  expect(a.x[0] + a.x[1] + a.x[2]).toBeCloseTo(1);
  expect(a.x[0]).toBeGreaterThan(a.x[2]);
  expect(b.over).toBeGreaterThan(a.over);
});

test('jakten: slutprovet är låst också för rådatan', async () => {
  const { laddaTopp, laddaStang, JAKT_TILL } = await lib('jakt-data.mjs');
  expect(JAKT_TILL).toBe('2024-10-31');
  expect(laddaTopp(ROOT).at(-1).date <= JAKT_TILL).toBe(true);
  expect(laddaStang(ROOT).at(-1).date <= JAKT_TILL).toBe(true);
});

test('hemmaregeln: spelar bara när hemma är tecknet med störst fördel', async () => {
  const { hemmaregel } = await lib('jakt-data.mjs');
  const f = [0.4, 0.3, 0.3];
  expect(hemmaregel(f, [2.7, 3, 3])).toBe(true); // hemma EV 8 %, övriga under noll
  expect(hemmaregel(f, [2.5, 3, 3])).toBe(false); // hemma EV 0 %
  expect(hemmaregel(f, [2.7, 3, 3.8])).toBe(false); // borta EV 14 % går före
  expect(hemmaregel(f, [3.3, 3, 3])).toBe(false); // EV 32 % = datafel
  expect(hemmaregel([0.15, 0.35, 0.5], [7.5, 2.5, 1.8])).toBe(false); // över oddstaket
  expect(hemmaregel(null, [2, 3, 4])).toBe(false);
  expect(hemmaregel(f, null)).toBe(false);
});

test('ahVinst: hel-, halv- och kvartslinje', async () => {
  const { ahVinst } = await lib('jakt-data.mjs');
  expect(ahVinst(2, 1, -0.5, 0, 2)).toBeCloseTo(1); // hemma -0,5 vinner
  expect(ahVinst(1, 1, -0.5, 0, 2)).toBeCloseTo(-1);
  expect(ahVinst(1, 1, 0, 0, 2)).toBeCloseTo(0); // pengarna tillbaka
  expect(ahVinst(1, 1, -0.25, 0, 2)).toBeCloseTo(-0.5); // halva förlorad
  expect(ahVinst(2, 1, -0.75, 0, 2)).toBeCloseTo(0.5); // halva vunnen
  expect(ahVinst(1, 2, -0.5, 1, 2)).toBeCloseTo(1); // borta får +0,5
});

test('normalisera: gamla Bb-kolumner och felaktiga rader', async () => {
  const { normalisera } = await lib('jakt-data.mjs');
  const m = normalisera({ Date: '11/08/17', HomeTeam: 'A', AwayTeam: 'B', FTHG: '2', FTAG: '1', FTR: 'H', BbAvH: '2', BbAvD: '3.5', BbAvA: '4', BbMxH: '2.1', BbMxD: '3.7', BbMxA: '4.2', PSCH: '2', PSCD: '3.4', PSCA: '4' }, 'PL', '1718');
  expect(m.date).toBe('2017-08-11');
  expect(m.y).toBe(0);
  expect(m.o.avg).toEqual([2, 3.5, 4]);
  expect(m.o.max).toEqual([2.1, 3.7, 4.2]);
  expect(m.c.pin).toEqual([2, 3.4, 4]);
  expect(normalisera({ Date: 'x', HomeTeam: 'A', AwayTeam: 'B', FTHG: '2', FTAG: '1', FTR: 'H' }, 'PL', '1718')).toBeNull();
  expect(normalisera({ Date: '11/08/17', HomeTeam: 'A', AwayTeam: 'B', FTHG: '', FTAG: '1', FTR: 'H' }, 'PL', '1718')).toBeNull();
});

test('lagLage: tabell och form ser bara spelade matcher', async () => {
  const { lagLage } = await lib('jakt-data.mjs');
  const l = lagLage();
  const m = (date: string, home: string, away: string, hg: number, ag: number) => ({ league: 'X', season: 's', date, home, away, hg, ag, y: hg > ag ? 0 : hg < ag ? 2 : 1, skott: {} });
  const a = m('2025-01-01', 'A', 'B', 3, 0);
  expect(l.info(a).h.g).toBe(0);
  l.lar(a);
  const i = l.info(m('2025-01-08', 'A', 'B', 0, 0));
  expect(i.h.p).toBe(3);
  expect(i.a.p).toBe(0);
  expect(i.h.senastGd).toBe(3);
  expect(i.a.rakT).toBe('F');
  expect(i.h.rank).toBe(1);
});

test('boost: trädet hittar ett inlagt mönster och inget i brus', async () => {
  const { trana } = await lib('boost.mjs');
  let s = 5;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const X = Array.from({ length: 6000 }, () => [r(), r()]);
  const p = trana(X, X.map((x) => (x[0] > 0.5 ? 0.2 : -0.2)));
  expect(p([0.9, 0.5])).toBeGreaterThan(0.1);
  expect(p([0.1, 0.5])).toBeLessThan(-0.1);
  const b = trana(X, X.map(() => r() - 0.5));
  expect(Math.abs(b([0.9, 0.5]))).toBeLessThan(0.05);
});

test.describe('hemmaregeln live', () => {
  const ev = (home: number, draw: number, away: number) => ({
    league: 'AS', commence: '2026-11-02T12:00:00Z', home: 'A', away: 'B',
    books: [
      { key: 'pinnacle', bookmaker: 'Pinnacle', home: 2.5, draw: 3.33, away: 3.33 },
      { key: 'betsson', bookmaker: 'Betsson', home, draw, away },
      { key: 'okant', bookmaker: 'Utländskt', home: 9, draw: 9, away: 9 },
    ],
  });
  const nu = Date.parse('2026-11-02T11:00:00Z');

  test('bedom: bara svenska bolag räknas och utan Pinnacle inget omdöme', async () => {
    const { bedom } = await lib('hemmaregeln.mjs');
    const v = bedom(ev(2.7, 3, 3), nu);
    expect(v.varde).toBe(true);
    expect(v.odds).toBe(2.7);
    expect(v.bok).toBe('Betsson');
    expect(v.timmar).toBeCloseTo(1);
    expect(bedom(ev(2.3, 3, 3), nu).varde).toBe(false);
    expect(bedom({ ...ev(2.7, 3, 3), books: ev(2.7, 3, 3).books.filter((b) => b.key !== 'pinnacle') }, nu)).toBeNull();
    expect(bedom({ ...ev(2.7, 3, 3), books: ev(2.7, 3, 3).books.filter((b) => b.key !== 'betsson') }, nu)).toBeNull();
  });

  test('uppdatera: spel bara nära avspark, första priset gäller, avgörs av resultatet', async () => {
    const { uppdatera, sammanfatta } = await lib('hemmaregeln.mjs');
    const tidigt = uppdatera({ matcher: {} }, [ev(2.7, 3, 3)], new Map(), Date.parse('2026-11-01T12:00:00Z'));
    const k = '2026-11-02|AS|A|B';
    expect(tidigt.matcher[k].spel).toBeNull();
    expect(tidigt.matcher[k].senast.varde).toBe(true);
    const nara = uppdatera(tidigt, [ev(2.7, 3, 3)], new Map(), nu);
    expect(nara.matcher[k].spel.odds).toBe(2.7);
    const igen = uppdatera(nara, [ev(2.9, 3, 3)], new Map(), nu + 60000);
    expect(igen.matcher[k].spel.odds).toBe(2.7);
    const klar = uppdatera(igen, [], new Map([[k, 'H']]), nu + 864e5);
    expect(klar.matcher[k].vinst).toBeCloseTo(1.7);
    expect(uppdatera(igen, [], new Map([[k, 'D']]), nu + 864e5).matcher[k].vinst).toBe(-1);
    const s = sammanfatta(klar);
    expect(s).toMatchObject({ spel: 1, avgjorda: 1 });
    expect(s.roi).toBeCloseTo(1.7);
  });

  test('uppdatera: andra ligor och startade matcher hoppas över', async () => {
    const { uppdatera } = await lib('hemmaregeln.mjs');
    expect(Object.keys(uppdatera({ matcher: {} }, [{ ...ev(2.7, 3, 3), league: 'PL' }], new Map(), nu).matcher)).toHaveLength(0);
    expect(Object.keys(uppdatera({ matcher: {} }, [ev(2.7, 3, 3)], new Map(), nu + 864e5).matcher)).toHaveLength(0);
  });
});

test.describe('öppna oddskällor', () => {
  test('amerikanskt: plus och minus till decimalodds', async () => {
    const { amerikanskt } = await lib('oppna-odds.mjs');
    expect(amerikanskt(185)).toBeCloseTo(2.85);
    expect(amerikanskt(-128)).toBeCloseTo(1.781, 2);
    expect(amerikanskt(100)).toBeCloseTo(2);
    expect(amerikanskt(0)).toBeNull();
    expect(amerikanskt(null)).toBeNull();
  });

  test('likhet: samma klubb stämmer, olika klubbar inte', async () => {
    const { likhet } = await lib('oppna-odds.mjs');
    expect(likhet('Mjällby AIF', 'Mjallby')).toBe(1);
    expect(likhet('Malmö FF', 'Malmo')).toBe(1);
    expect(likhet('IFK Göteborg', 'GAIS')).toBe(0);
    expect(likhet('Atlético Tucuman', 'Atlético Mineiro')).toBe(0);
  });

  test('pinnacleMatcher: bara 1X2 hela matchen, inga hörnor eller livematcher', async () => {
    const { pinnacleMatcher } = await lib('oppna-odds.mjs');
    const p = (n: string) => ({ alignment: n, name: n === 'home' ? 'A' : 'B' });
    const mu = [
      { id: 1, type: 'matchup', startTime: '2026-11-02T18:00:00Z', participants: [p('home'), p('away')] },
      { id: 2, type: 'matchup', isLive: true, startTime: '2026-11-02T18:00:00Z', participants: [p('home'), p('away')] },
      { id: 3, type: 'matchup', parentId: 1, startTime: '2026-11-02T18:00:00Z', participants: [p('home'), p('away')] },
      { id: 4, type: 'matchup', startTime: '2026-11-02T18:00:00Z', participants: [{ alignment: 'home', name: 'A (Corners)' }, p('away')] },
    ];
    const pr = [{ designation: 'home', price: 150 }, { designation: 'draw', price: 240 }, { designation: 'away', price: 200 }];
    const ma: any[] = [1, 2, 3, 4].map((matchupId) => ({ matchupId, type: 'moneyline', period: 0, status: 'open', prices: pr }));
    ma.push({ matchupId: 1, type: 'moneyline', period: 1, status: 'open', prices: [{ designation: 'home', price: 999 }, { designation: 'draw', price: 999 }, { designation: 'away', price: 999 }] });
    const ut = pinnacleMatcher(mu, ma, 'AS');
    expect(ut).toHaveLength(1);
    expect(ut[0].books[0]).toMatchObject({ key: 'pinnacle', home: 2.5, draw: 3.4, away: 3 });
  });

  test('kambiMatcher: odds delas med 1000, startade och avstängda matcher hoppas över', async () => {
    const { kambiMatcher } = await lib('oppna-odds.mjs');
    const oc = (status = 'OPEN') => [{ type: 'OT_ONE', odds: 2450, status }, { type: 'OT_CROSS', odds: 3450 }, { type: 'OT_TWO', odds: 2950 }];
    const ev = (state: string, name: string, o: any[]) => ({ event: { state, start: '2026-11-02T18:00:00Z', homeName: name, awayName: 'B' }, betOffers: [{ betOfferType: { id: 2 }, outcomes: o }] });
    const ut = kambiMatcher({ events: [ev('NOT_STARTED', 'A', oc()), ev('STARTED', 'C', oc()), ev('NOT_STARTED', 'D', oc('SUSPENDED'))] });
    expect(ut).toHaveLength(1);
    expect(ut[0]).toMatchObject({ home: 'A', home_odds: 2.45, draw_odds: 3.45, away_odds: 2.95 });
  });

  test('sammanfoga: kräver samma avspark och båda lagen', async () => {
    const { sammanfoga } = await lib('oppna-odds.mjs');
    const pin = [{ league: 'AS', commence: '2026-11-02T18:00:00.000Z', home: 'Mjallby', away: 'Kalmar', books: [{ key: 'pinnacle' }] }];
    const k = (commence: string, home: string, away: string) => ({ commence, home, away, home_odds: 2.45, draw_odds: 3.45, away_odds: 2.95 });
    const a = sammanfoga(pin, [{ key: 'unibet_se', namn: 'Unibet', matcher: [k('2026-11-02T18:00:00Z', 'Mjällby AIF', 'Kalmar FF')] }]);
    expect(a.events[0].books).toHaveLength(2);
    expect(sammanfoga(pin, [{ key: 'u', namn: 'U', matcher: [k('2026-11-02T20:00:00Z', 'Mjällby AIF', 'Kalmar FF')] }]).events[0].books).toHaveLength(1);
    const c = sammanfoga(pin, [{ key: 'u', namn: 'U', matcher: [k('2026-11-02T18:00:00Z', 'Mjällby AIF', 'GAIS')] }]);
    expect(c.events[0].books).toHaveLength(1);
    expect(c.okopplade).toBe(1);
  });

  test('kopplaResultat och ligorAttHamta', async () => {
    const { kopplaResultat, ligorAttHamta, LIGOR } = await lib('hemmaregeln.mjs');
    const logg = { matcher: { '2026-11-02|MLS|Inter Miami|Toronto FC': {}, '2026-11-02|AS|Malmo|AIK': { utfall: 'H' }, '2026-11-02|AS|GAIS|AIK': {} } };
    const sp = [
      { league: 'MLS', date: '2026-11-01', home: 'Inter Miami', away: 'Toronto', result: 'D' },
      { league: 'AS', date: '2026-11-08', home: 'GAIS', away: 'AIK', result: 'A' },
    ];
    const same = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
    const ut = kopplaResultat(logg, sp, same);
    expect(ut.get('2026-11-02|MLS|Inter Miami|Toronto FC')).toBe('D');
    expect(ut.size).toBe(1);
    const nu = Date.parse('2026-11-02T12:00:00Z');
    const doc = (u: string, h: number, l: string) => ({ updatedAt: u, events: [{ league: l, commence: new Date(nu + h * 36e5).toISOString() }] });
    expect(ligorAttHamta(null, nu)).toEqual(LIGOR);
    expect(ligorAttHamta(doc('2026-11-01T12:00:00Z', 1, 'AS'), nu)).toEqual(LIGOR);
    expect(ligorAttHamta(doc('2026-11-02T10:00:00Z', 1, 'AS'), nu)).toEqual(['AS']);
    expect(ligorAttHamta(doc('2026-11-02T10:00:00Z', 5, 'AS'), nu)).toEqual([]);
  });
});
