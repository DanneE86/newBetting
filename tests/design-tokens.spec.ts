import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Designsystemet (svenskaspel.design): tokens först, inga hårdkodade färger i komponent-CSS.
const pub = path.join(__dirname, '..', 'gui', 'public');
const read = (f: string) => fs.readFileSync(path.join(pub, f), 'utf8');

// Filer som är migrerade till tokens. Hex/rgb får bara stå i custom properties (--namn: #...).
const MIGRATED_CSS: string[] = [];

test('tokens.css har Svenska Spels färger och laddas före övriga stilmallar', () => {
  const tokens = read('tokens.css').toLowerCase();
  for (const hex of ['#ed0000', '#a20020', '#62001d', '#faf6f3', '#e5dfda', '#1b1918', '#0071db', '#00823d']) {
    expect(tokens, hex).toContain(hex);
  }
  const html = read('index.html');
  const links = [...html.matchAll(/<link rel="stylesheet" href="\/([^"]+)"/g)].map((m) => m[1]);
  expect(links[0]).toBe('tokens.css');
  expect(links).toEqual(expect.arrayContaining(['styles.css', 'stryktips.css', 'startelva.css', 'spelarkort.css']));
});

test('spikar behåller Gambling Cabins rosa', () => {
  expect(read('tokens.css').toLowerCase()).toMatch(/--color-spik:\s*#f07ab8/);
});

test('tokens.css har synlig fokusmarkering och respekterar reducerad rörelse', () => {
  const tokens = read('tokens.css');
  expect(tokens).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/);
  expect(tokens).toContain('prefers-reduced-motion');
});

for (const file of MIGRATED_CSS) {
  test(`${file}: inga hårdkodade färger utanför custom properties`, () => {
    const offenders = read(file)
      .split(/\r?\n/)
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => !line.startsWith('--') && !line.startsWith('/*') && !line.startsWith('*'))
      .filter(({ line }) => /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/.test(line.replace(/--[\w-]+:\s*[^;]+;/g, '')));
    expect(offenders.map((o) => `${o.n}: ${o.line}`)).toEqual([]);
  });
}
