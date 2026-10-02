import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', 'stryktipset.json');

// Teckenregler (anvandarens beslut) lases fran skriptet: A 4-2-2; B samma i delat lage, annars SIGN_MIN.B
let SIGN_MIN: { A: number[]; B: number[] };
const antT = (m: number[]) => `antT=1,${m[0]},13,${m[1]},13,${m[2]},13`;

test.beforeAll(async () => {
  ({ SIGN_MIN } = await import(pathToFileURL(path.join(root, 'scripts', 'fetch-stryktipset.mjs')).href));
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
      expect(e.colors).toHaveLength(3);
      // Svenska Spels expertanalyser (kan vara tomma innan de publicerats)
      expect(Array.isArray(e.experts)).toBe(true);
      for (const x of e.experts) expect(x.signs).toMatch(/^[1X2]+$/);
    }
    expect(p.system.rows).toBeLessThanOrEqual(p.system.maxRows);
    // Reducerat system inom budget 350–400 kr, unika rader
    expect(p.reduced.cost).toBeGreaterThanOrEqual(350);
    expect(p.reduced.cost).toBeLessThanOrEqual(400);
    expect(new Set(p.reduced.rowList).size).toBe(p.reduced.rows);
    expect(p.reduced.gamblingCabinUrl).toContain(`omg=${p.drawNumber}`);
    // Utdelning minst 30 000 kr (Europatipset 20 000); teckenregler fran SIGN_MIN, max alltid 13
    // Minsta verkliga utdelning per spel (Stryktipset 30 000, Europatipset 20 000 enligt UTD_MIN_BY_PRODUCT)
    expect(p.reduced.rules.payoutMinReal).toBeGreaterThanOrEqual(p.product === "stryktipset" ? 30000 : 20000);
    expect(p.value?.level).toMatch(/^(low|normal|high)$/);
    // Teckenregeln får sänkas (aldrig under 2-1-1) för 30 000–50 000 kr eller så att 3 röda + högst 1 gul går in (2026-10-02)
    expect(p.reduced.rules.signMinRule ?? p.reduced.rules.signMin).toEqual(SIGN_MIN.A);
    p.reduced.rules.signMin.forEach((v: number, k: number) => expect(v).toBeGreaterThanOrEqual([2, 1, 1][k]));
    expect(p.reduced.gamblingCabinUrl).toContain(antT(p.reduced.rules.signMin));
    if (p.reducedB) {
      // Teckenregeln får sänkas bara för att hålla gränsen 30 000–50 000 kr (rules.signMinRule = spelets regel, 2026-10-02)
      expect(p.reducedB.rules.signMinRule ?? p.reducedB.rules.signMin).toEqual(p.reducedB.split ? SIGN_MIN.A : SIGN_MIN.B);
      expect(p.reducedB.gamblingCabinUrl).toContain(antT(p.reducedB.rules.signMin));
      expect(p.reducedB.cost).toBeGreaterThanOrEqual(350);
      expect(p.reducedB.cost).toBeLessThanOrEqual(400);
      // Motsystemet har aldrig samma tecken som A (inte ens spiken); delat system har samma grundrad men inga gemensamma rader
      if (p.reducedB.split) expect(p.reducedB.overlapRows).toBe(0);
      else expect(p.reducedB.sameSingles).toBe(0); // eget B-system: ingen spik som A (2026-10-02)
    }
  }
});

test('stryktipset: engelska klubblag (PL–League Two) matchas mot lagmodellen', () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const english = data.products.flatMap((p: any) => p.events).filter((e: any) => e.country === 'England' && /League|Championship/.test(e.league));
  for (const e of english) {
    expect(e.basis, `${e.home} - ${e.away}`).toBe('club');
    expect(e.homeProfile.played).toBeGreaterThan(0);
  }
});

test('kupongkortet visar inte chansen till 13 rätt (användaren 2026-10-02: ointressant)', () => {
  const src = fs.readFileSync(path.join(root, 'gui', 'public', 'stryktips.js'), 'utf8');
  expect(src).not.toContain('<dt>Chans 13 rätt</dt>');
  expect(src).not.toMatch(/A\+B tillsammans: chans till 13 rätt/);
});
