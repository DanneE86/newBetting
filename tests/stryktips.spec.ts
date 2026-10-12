import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', 'stryktipset.json');


test.beforeAll(async () => {
  // Hamta om filen saknas eller ar aldre an 6 h (kraver natverk)
  if (!fs.existsSync(file) || Date.now() - fs.statSync(file).mtimeMs > 6 * 3600e3) {
    execFileSync(process.execPath, [path.join(root, 'scripts', 'fetch-stryktipset.mjs')], { cwd: root, stdio: 'inherit' });
  }
});

test('stryktipset: 13 matcher med avsparkstid, procent och Värde/Ej värde', () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(data.products.length).toBeGreaterThan(0);
  for (const p of data.products) {
    expect(p.events.length).toBe(13);
    for (const e of p.events) {
      // Avsparkstid (klockslag), inte bara datum
      expect(e.kickoff).toMatch(/T\d{2}:\d{2}/);
      // Procent per utfall summerar till 1
      expect(e.final.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 2);
      expect(['1', 'X', '2']).toContain(e.tip);
      // Alltid ett vardebesked med "fran X"
      expect(typeof e.verdict.value).toBe('boolean');
      expect(e.verdict.minOdds).toBeGreaterThan(1);
      expect(e.analysis.length).toBeGreaterThan(0);
      // Reservspik (2026-10-02: högst 2 helgula garderingar) ligger på favoriten i systemets justerade procent, som kan skilja från tipset
      const sysP = e.spik?.used ? e.spik.sysP : e.final;
      const reserveSpik = e.systemPick.signs.length === 1 && sysP['1X2'.indexOf(e.systemPick.signs)] === Math.max(...sysP);
      if (!reserveSpik) expect(e.systemPick.signs).toContain(e.tip);
      // Svenska Spels expertanalyser (kan vara tomma innan de publicerats)
      expect(Array.isArray(e.experts)).toBe(true);
      for (const x of e.experts) expect(x.signs).toMatch(/^[1X2]+$/);
    }
    // Filkuponger (2026-10-11): ingen grundradsgräns – raderna väljs en och en
    // Filkuponger (2026-10-11): A, B och C à 500 rader som Egna rader-fil, ingen Gambling Cabin-länk
    for (const red of [p.reduced, p.reducedB, p.reducedC]) {
      expect(red.cost).toBe(500 * (red.rowPrice || 1));
      expect(new Set(red.rowList).size).toBe(red.rows);
      expect(red.gamblingCabinUrl).toBeUndefined();
      expect(red.rules.payoutMin).toBe(30000);
      // Typisk omsättning sparas så att sidans live-streck inte räknar med veckans omsättning hittills
      expect(red.rules.turnover).toBeGreaterThanOrEqual(red.rules.realTurnover > 0 ? 1e6 : 0);
      expect(red.egnaRader.trim().split('\n')).toHaveLength(red.rows + 1);
    }
    expect(p.value?.level).toMatch(/^(low|normal|high)$/);
    const setA = new Set(p.reduced.rowList);
    expect(p.reducedB.rowList.some((r: string) => setA.has(r))).toBe(false);
  }
});

test('stryktipset: engelska klubblag (PL–League Two) matchas mot lagmodellen', () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const english = data.products.flatMap((p: any) => p.events).filter((e: any) => e.country === 'England' && /League|Championship/.test(e.league));
  for (const e of english) {
    // Lagmodellen används, men icke-spikbara matcher tipsas som Oddset (tipBasis 'oddset', 2026-10-09)
    expect(['club', 'oddset'], `${e.home} - ${e.away}`).toContain(e.basis);
    expect(e.homeProfile.played).toBeGreaterThan(0);
  }
});

test('kupongkortet visar inte chansen till 13 rätt (användaren 2026-10-02: ointressant)', () => {
  const src = fs.readFileSync(path.join(root, 'gui', 'public', 'stryktips.js'), 'utf8');
  // Gäller kupongkortet för A/B/C (couponCard); D/E/F (couponCardEgna, 2026-10-08) är troligaste-rader-kuponger där chansen är måttet
  const start = src.indexOf('function couponCard(');
  const card = src.slice(start, start + src.slice(start).search(/\r?\n\}\r?\n/));
  expect(card).toContain('function couponCard(');
  expect(card).not.toContain('Chans 13 rätt');
  expect(src).not.toMatch(/A\+B tillsammans: chans till 13 rätt/);
});
