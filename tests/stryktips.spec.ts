import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'data', 'stryktipset.json');

test.beforeAll(() => {
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
      expect(e.systemPick.signs).toContain(e.tip);
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
