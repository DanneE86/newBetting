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
