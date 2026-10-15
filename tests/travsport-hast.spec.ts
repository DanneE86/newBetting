import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

// Sportinfo-tolken. Inget nät: ett litet rutnät i Playwrights egen sida.
const ROOT = path.resolve(__dirname, '..');
const lib = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'travsport-hast.mjs')).href);

const SIDA = `<!doctype html><html><body><main>
<h1>Zätamustangen</h1>
<h2>19-1850UELN: 75200211S191850</h2>
<h2>Färg</h2><div>mörkbrun</div>
<h2>Kön</h2><div>hingst</div>
<h2>Född</h2><div>2019-05-23</div>
<h2>Ras</h2><div>varmblodig travare</div>
<h2>Avelsindex</h2><div>106 0,77</div>
<h2>Inavelskoeff.</h2><div>13,51</div>
<h2>Ägarpseudonym</h2><div>Stall Z-A Olsims</div>
<h2>Uppfödare</h2><div>Andersson Leif &amp; Zetterberg Agneta</div>
<h2>Tränare</h2><div>Persson Jan-Olov, a-tränare, Hagmyren</div>
<p>Segerprocent: 24 %</p>
<p>Platsprocent: 50 %</p>
<p>Startpoäng: 1 450</p>
<div role="row">
  <div role="columnheader">År</div><div role="columnheader">Starter</div>
  <div role="columnheader">Placeringar</div><div role="columnheader">Startprissumma</div>
  <div role="columnheader">Rekord</div>
</div>
<div role="row">
  <div role="gridcell" aria-colindex="1">Livs</div>
  <div role="gridcell" aria-colindex="2">82</div>
  <div role="gridcell" aria-colindex="3">20-12-9</div>
  <div role="gridcell" aria-colindex="4">1 402 400 kr</div>
  <div role="gridcell" aria-colindex="5">10,7ak</div>
</div>
<div role="row">
  <div role="columnheader" aria-colindex="1">Bana</div>
  <div role="columnheader" aria-colindex="2">Datum</div>
  <div role="columnheader" aria-colindex="3">Kat.</div>
  <div role="columnheader" aria-colindex="4">Spår</div>
  <div role="columnheader" aria-colindex="5">Dist.</div>
  <div role="columnheader" aria-colindex="6">Res.</div>
  <div role="columnheader" aria-colindex="7">Tid</div>
  <div role="columnheader" aria-colindex="8">Skor</div>
  <div role="columnheader" aria-colindex="9">Vagn</div>
  <div role="columnheader" aria-colindex="10">Kusk</div>
  <div role="columnheader" aria-colindex="11">Tränare</div>
  <div role="columnheader" aria-colindex="12">Vinstsumma</div>
</div>
<div role="row">
  <div role="gridcell" aria-colindex="1">Ös</div>
  <div role="gridcell" aria-colindex="2"><a href="/race/raceday/ts616703/results/10">261008-10</a></div>
  <div role="gridcell" aria-colindex="3"></div>
  <div role="gridcell" aria-colindex="4">6</div>
  <div role="gridcell" aria-colindex="5">1640</div>
  <div role="gridcell" aria-colindex="6">1</div>
  <div role="gridcell" aria-colindex="7">12,0a</div>
  <div role="gridcell" aria-colindex="8"><span title="Barfota bak"></span></div>
  <div role="gridcell" aria-colindex="9"><span title="Amerikansk sulky"></span></div>
  <div role="gridcell" aria-colindex="10">Djuse Mats E</div>
  <div role="gridcell" aria-colindex="11">Persson Jan-Olov</div>
  <div role="gridcell" aria-colindex="12">35 000</div>
</div>
<div role="row">
  <div role="gridcell" aria-colindex="1">G</div>
  <div role="gridcell" aria-colindex="2"><a href="/race/raceday/ts1/startlist/5">261017-5</a></div>
  <div role="gridcell" aria-colindex="3">r</div>
  <div role="gridcell" aria-colindex="4">1</div>
  <div role="gridcell" aria-colindex="5">1640</div>
  <div role="gridcell" aria-colindex="6"></div>
  <div role="gridcell" aria-colindex="7">a</div>
  <div role="gridcell" aria-colindex="10">Djuse Mats E</div>
  <div role="gridcell" aria-colindex="11">Persson Jan-Olov</div>
  <div role="gridcell" aria-colindex="12">0</div>
</div>
<div role="row">
  <div role="gridcell" aria-colindex="1">Ro</div>
  <div role="gridcell" aria-colindex="2">250611-10</div>
  <div role="gridcell" aria-colindex="5">1640</div>
  <div role="gridcell" aria-colindex="6">str, infektion</div>
  <div role="gridcell" aria-colindex="10">Djuse Mats E</div>
  <div role="gridcell" aria-colindex="11">Persson Jan-Olov</div>
  <div role="gridcell" aria-colindex="12">0</div>
</div>
</main></body></html>`;

test('Sportinfo-rutnätet blir häst, säsong och starter', async ({ page }) => {
  const { extractSportinfo, normalizeHorse, isRobotText, horseIdFrom } = await lib();
  expect(isRobotText('Verifying...', "Please verify you're not a robot")).toBe(true);
  expect(isRobotText('Tävlingsresultat - Zätamustangen', 'Segerprocent: 24 %')).toBe(false);
  expect(horseIdFrom('https://sportapp.travsport.se/sportinfo/horse/ts772022/results')).toBe('ts772022');

  await page.setContent(SIDA);
  const raw = await page.evaluate(extractSportinfo);
  const out = normalizeHorse(raw, { id: 'ts772022', hamtad: '2026-10-15' });

  expect(out.hast).toMatchObject({
    namn: 'Zätamustangen',
    id: 'ts772022',
    registreringsnummer: '19-1850',
    ueln: '75200211S191850',
    farg: 'mörkbrun',
    kon: 'hingst',
    fodd: '2019-05-23',
    avelsindex: '106',
    avelsindex_sakerhet: '0,77',
    tranare: 'Persson Jan-Olov',
    tranare_licens: 'a-tränare',
    tranare_bana: 'Hagmyren',
    segerprocent: 24,
    platsprocent: 50,
    startpoang: 1450,
  });
  expect(out.sasong[0]).toMatchObject({ ar: 'Livs', starter: 82, vinster: 20, startprissumma_kr: 1402400 });

  const senaste = out.starter[0];
  expect(senaste).toMatchObject({
    datum: '2026-10-08',
    lopp: 10,
    bana_kod: 'Ös',
    bana: 'Östersund',
    spar: 6,
    distans: '1640',
    resultat: '1',
    tid: '12,0a',
    km_tid: '1.12,0',
    autostart: true,
    galopp: false,
    skor: 'Barfota bak',
    vagn: 'Amerikansk sulky',
    kusk: 'Djuse Mats E',
    vinst_kr: 35000,
    lopp_url: 'https://sportapp.travsport.se/race/raceday/ts616703/results/10',
  });

  const kommande = out.starter[1];
  expect(kommande.bana).toBe('Gävle');
  expect(kommande.resultat).toBeNull();
  expect(kommande.autostart).toBe(true);
  expect(kommande.km_tid).toBeNull();
  expect(kommande.skor).toBeNull();
  expect(kommande.vagn).toBeNull();
  expect(kommande.kusk).toBe('Djuse Mats E');

  const struken = out.starter[2];
  expect(struken.bana).toBe('Romme');
  expect(struken.resultat).toBe('str, infektion');
  expect(struken.kusk).toBe('Djuse Mats E');
  expect(struken.vagn).toBeNull();
});
