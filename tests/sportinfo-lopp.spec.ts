import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

// Sportinfos tävlingsdagsresultat. Inget nät. Texten är påhittad (hästar, kuskar, domare) men har
// samma uppställning som sidan – riktig Sportinfo-text är upphovsrättsskyddad och ska inte in i repot.
const ROOT = path.resolve(__dirname, '..');
const lib = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'sportinfo-lopp.mjs')).href);

const SIDA = [
  'Tävlingsdagsresultat',
  'TESTBANAN LÖRDAG 26 SEPTEMBER 2026',
  'Lopp 1. Starttid 13:30:00',
  'Varmblodiga',
  'Testpokalen',
  'Mörk anmälan. 4-åriga och äldre.',
  '2140 m. Monté. Autostart. 3 startande.',
  'Plac.', 'Häst', 'Kusk/Ryttare', 'Tränare', 'Spår/Dist.', 'Tid', 'Skor', 'Vagn',
  '1', '5 ALFA TEST', 'Kusk Anna', 'Tränare Bo', '5/2140', '11,2a', ' A',
  '2', '1 BETA TEST', 'Anmäld Kusk', 'Kusk Cia', 'Tränare Dan', '1/2140', '11,4a', ' S',
  'd', '3 GAMMA TEST', 'Kusk Eva', 'Tränare Fia', '3/2140', '9ag', ' S',
  'Strukna:',
  '7 DELTA TEST (hälta, startförbud 260926-261006)',
  'Startförbud:',
  '-',
  'Tempo: första 500 1.11,2 (5 Alfa Test), 1000 1.11,5 (5 Alfa Test), 2000 1.12,0 (1 Beta Test) sista 500 1.13,8',
  'Segermarginal: 3.5 längd',
  'Banförhållande: Lätt bana',
  'Bestraffningar:',
  'Kusk Eva, 3000 kr, för att ha stört medtävlare.',
  'Dopningsprov:',
  '-',
  'Segrare:',
  'ALFA TEST 4 br. v e PAPPA - MAMMA',
  'Segrande hästs skötare: Skötare Test',
  ' ',
  'Nr 3 döms ej för dålig anslutning efter startbilen.',
  'Tjänstgörande funktionärer:',
  'Måldomare: Domare Test',
  'Väder: Svag vind, 17°C',
  'Visa målfoto',
  'Lopp 2. Starttid 13:52:00',
  'Varmblodiga',
  'Tilläggsloppet',
  '2140 m. Tillägg 20 m vid vunna 240.001 kr',
  'Tempo: första 500 1.14,0 (2 Epsilon Test), 1000 1.14,4 (2 Epsilon Test) sista 500 1.09,5',
  'Segermarginal: huvud',
  'Visa målfoto',
].join('\n');

test('tävlingsdagen: lopp, tempo, villkor, strukna, bestraffningar och domartexter', async () => {
  const { parseRaceday } = await lib();
  const d = parseRaceday(SIDA, { id: 'ts600001', hamtad: '2026-10-15' });
  expect(d).toMatchObject({ raceday_id: 'ts600001', bana: 'TESTBANAN', datum: '2026-09-26', hamtad: '2026-10-15' });
  expect(d.kalla).toBe('https://sportapp.travsport.se/race/raceday/ts600001/results/all');
  expect(d.lopp).toHaveLength(2);
  const [l1, l2] = d.lopp;
  expect(l1).toMatchObject({ lopp: 1, starttid: '13:30:00', rubrik: 'Testpokalen', distans: 2140, startmetod: 'auto', monte: true, startande: 3 });
  expect(l1.tempo).toEqual([
    { meter: 500, km_tid: '1.11,2', km_sek: 71.2, ledare_nr: 5, ledare: 'Alfa Test' },
    { meter: 1000, km_tid: '1.11,5', km_sek: 71.5, ledare_nr: 5, ledare: 'Alfa Test' },
    { meter: 2000, km_tid: '1.12,0', km_sek: 72, ledare_nr: 1, ledare: 'Beta Test' },
  ]);
  expect(l1).toMatchObject({ sista500: '1.13,8', sista500_sek: 73.8, segermarginal: '3.5 längd', banforhallande: 'Lätt bana' });
  expect(l1.strukna).toBe('7 DELTA TEST (hälta, startförbud 260926-261006)');
  expect(l1.startforbud).toBeNull();
  expect(l1.bestraffningar).toBe('Kusk Eva, 3000 kr, för att ha stört medtävlare.');
  expect(l1.domartexter).toEqual(['Nr 3 döms ej för dålig anslutning efter startbilen.']);
  expect(l1.namnda_nr).toEqual([3]);
  expect(l1.vader).toBe('Svag vind, 17°C');
  expect(l1.malordning.map((h: any) => [h.placering, h.startnummer, h.kusk, h.anmald_kusk, h.spar, h.tid])).toEqual([
    ['1', 5, 'Kusk Anna', null, 5, '11,2a'],
    ['2', 1, 'Kusk Cia', 'Anmäld Kusk', 1, '11,4a'],
    ['d', 3, 'Kusk Eva', null, 3, '9ag'],
  ]);
  expect(l2).toMatchObject({ lopp: 2, distans: 2140, startmetod: 'volte', startande: null, segermarginal: 'huvud', domartexter: [] });
});

test('hjälpare: km-tid, ts-id, numrerade texter och vilka tävlingsdagar som ska hämtas', async () => {
  const { kmSek, racedayIdFrom, numrerade, racedaysForHorses } = await lib();
  expect(kmSek('1.09,1')).toBe(69.1);
  expect(kmSek('x')).toBeNull();
  expect(racedayIdFrom('https://sportapp.travsport.se/race/raceday/ts616672/results/5')).toBe('ts616672');
  expect(racedayIdFrom('ts1')).toBeNull();
  expect(numrerade('Nr 8 döms ej. Stört häst nr 1 m.fl. och nr. 12.')).toEqual([8, 1, 12]);
  const url = (d: string) => `https://sportapp.travsport.se/race/raceday/${d}/results/3`;
  const filer = [
    { starter: [
      { datum: '2026-10-17', lopp_url: 'https://sportapp.travsport.se/race/raceday/ts9/startlist/5' },
      { datum: '2026-10-01', lopp_url: url('ts3') },
      { datum: '2026-09-20', lopp_url: url('ts2') },
      { datum: '2026-09-01', lopp_url: url('ts1') },
      { datum: '2026-08-01', lopp_url: null },
    ] },
    { starter: [{ datum: '2026-10-05', lopp_url: url('ts4') }, { datum: '2026-10-01', lopp_url: url('ts3') }] },
  ];
  expect(racedaysForHorses(filer, { antal: 2, fore: '2026-10-17' })).toEqual([
    { id: 'ts4', datum: '2026-10-05' }, { id: 'ts3', datum: '2026-10-01' }, { id: 'ts2', datum: '2026-09-20' },
  ]);
  expect(racedaysForHorses(filer, { antal: 5, fore: '2026-09-25' }).map((d: any) => d.id)).toEqual(['ts2', 'ts1']);
});

test('signaler: bara det som hände före starten, och jämförelse mot hästarnas övriga starter', async () => {
  const { egenskaper, ae, kvot, sammanstall } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'sportinfo-signal.mjs')).href);
  const url = 'https://sportapp.travsport.se/race/raceday/ts9/results/4';
  const forut = [
    { datum: '2026-08-01', resultat: '1', tranare: 'A', lopp: 4, lopp_url: url, galopp: 0 },
    { datum: '2026-08-20', resultat: 'str, feber' },
  ];
  const loppInfo = new Map([['ts9|4', { namnda_nr: '7', tempo: [{ meter: 500, km_sek: 69.1, ledare_nr: 7 }, { meter: 1000, km_sek: 70.5, ledare_nr: 2 }] }]]);
  const f = egenskaper({ start: { datum: '2026-09-01', tranare: 'B' }, forut, hast: { avelsindex: '124', inavelskoefficient: '6,99' }, loppInfo, atgNr: () => 7 });
  expect(f).toMatchObject({
    'Sjukstruken senaste 60 d': true, 'Skadestruken senaste 60 d': false, 'Första start efter sjukstrykning': true,
    'Galopp senast': false, 'Diskad senast': false, 'Tränarbyte sedan förra starten': true,
    'Uppehåll 60–119 dagar': false, 'Ledde vid 500 m senast': true, 'Ledde vid 1000 m senast': false,
    'Nämnd av domarna senast': true, 'Senast i lopp med snabb öppning (≤ 1.09,5)': true,
    'Avelsindex ≥ 120': true, 'Inavel ≥ 10 %': false,
  });
  // Utan tempo eller startnummer går det inte att avgöra – då saknas signalen i stället för att bli false
  expect(egenskaper({ start: { datum: '2026-09-01' }, forut, atgNr: () => null })['Ledde vid 500 m senast']).toBeUndefined();
  expect(egenskaper({ start: { datum: '2026-09-01' } })['Galopp senast']).toBeUndefined();

  expect(ae([{ p: 0.5, vann: 1 }, { p: 0.5, vann: 1 }])).toMatchObject({ n: 2, segrar: 2, ae: 2 });
  expect(kvot({ ae: 2, segrar: 4 }, { ae: 1, segrar: 4 }).kvot).toBe(2);
  expect(kvot({ ae: 0, segrar: 0 }, { ae: 1, segrar: 4 }).kvot).toBeNull();
  const fall = [
    ...Array.from({ length: 40 }, (_, i) => ({ datum: i < 20 ? '2024-01-01' : '2025-06-01', p: 0.1, vann: i % 4 === 0 ? 1 : 0, f: { X: true } })),
    ...Array.from({ length: 400 }, (_, i) => ({ datum: i < 200 ? '2024-01-01' : '2025-06-01', p: 0.1, vann: i % 10 === 0 ? 1 : 0, f: { X: false } })),
  ];
  const [x] = sammanstall(fall);
  expect(x.signal).toBe('X');
  expect(x.alla.n).toBe(40);
  expect(x.alla.kvot).toBeCloseTo(2.5, 5);
  expect(x.bedomning).toBe('vinner oftare än oddsen säger');
  expect(sammanstall(fall.slice(0, 5).concat(fall.slice(40)))[0].bedomning).toBe('för få starter');
});

test('tempo med punkt som decimal ("1.17.0"), som många banor skriver', async () => {
  const { kmSek, parseTempo } = await lib();
  expect(kmSek('1.17.0')).toBe(77);
  const t = parseTempo('första 500 1.10.2 (7 Test Ett), 1000 1.13.9 (7 Test Ett) 2000 1.13.6 (3 Test Tva), sista 500 1.14.3');
  expect(t.delar.map((d: any) => [d.meter, d.km_sek, d.ledare_nr])).toEqual([[500, 70.2, 7], [1000, 73.9, 7], [2000, 73.6, 3]]);
  expect(t).toMatchObject({ sista500: '1.14.3', sista500_sek: 74.3 });
});
