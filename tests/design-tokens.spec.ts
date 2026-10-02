import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Designsystemet (svenskaspel.design): tokens först, inga hårdkodade färger i komponent-CSS.
const pub = path.join(__dirname, '..', 'gui', 'public');
const read = (f: string) => fs.readFileSync(path.join(pub, f), 'utf8');

// Filer som är migrerade till tokens. Hex/rgb får bara stå i custom properties (--namn: #...).
const MIGRATED_CSS: string[] = ['startelva.css', 'spelarkort.css', 'stryktips.css', 'styles.css'];

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

test('spikar har Gambling Cabins blå grundfärg (id 1)', () => {
  expect(read('tokens.css').toLowerCase()).toMatch(/--color-spik:\s*#1e90ff/);
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

test('huvudmenyn (Tips/Stryktipset/Europatipset) ligger på ett mörkt band och syns tydligt', () => {
  expect(read('tokens.css')).toMatch(/--color-nav-bg:\s*var\(--ss-black\)/);
  const styles = read('styles.css');
  const nav = styles.match(/nav\.view-tabs\s*\{[^}]*\}/)?.[0] ?? '';
  expect(nav).toMatch(/position:\s*sticky/);
  expect(nav).toMatch(/background:\s*var\(--color-nav-bg\)/);
  expect(nav).toMatch(/box-shadow:\s*0 0 0 100vmax var\(--color-nav-bg\)/);
  const st = read('stryktips.css');
  expect(st).toMatch(/\.view-tab\s*\{[^}]*color:\s*var\(--color-nav-text-muted\)/);
  // Aktiv flik måste slå .ds-tab[aria-selected] (annars svart text på svart band)
  expect(st).toMatch(/\.view-tab\[aria-selected="true"\][^{]*\{[^}]*color:\s*var\(--color-nav-text\)/);
});

// Färgläge: Ljust / Mörkt / Auto (tokens.css + theme.js)
test('mörkt läge byter samma semantiska roller, manuellt och via systemet', () => {
  const tokens = read('tokens.css');
  const manual = tokens.match(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/)?.[1] ?? '';
  const system = tokens.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\):not\(\[data-theme="dark"\]\)\s*\{([^}]*)\}/)?.[1] ?? '';
  const decls = (block: string) => [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => `${m[1]}=${m[2].trim()}`).sort();
  expect(decls(manual).length).toBeGreaterThan(10);
  expect(decls(system)).toEqual(decls(manual));
  for (const role of ['--color-bg', '--color-surface', '--color-text', '--color-text-muted', '--color-border', '--color-brand-text']) {
    expect(manual, role).toContain(role + ':');
  }
  expect(manual).toContain('color-scheme: dark');
  // Domänfärger får aldrig bytas i mörkt läge
  expect(manual).not.toMatch(/--color-spik|--color-gc-button|-solid:/);
});

test('heltäckande färgytor använder *-solid (vit text håller kontrast i båda teman)', () => {
  for (const file of MIGRATED_CSS) {
    const bad = read(file).split(/\r?\n/).filter((l) => /background(-color)?:\s*var\(--color-(success|info|danger|warning)\)/.test(l));
    expect(bad, file).toEqual([]);
  }
});

test('theme.js laddas i <head> före sidans skript och temaväljaren har tre lägen', () => {
  const html = read('index.html');
  const head = html.split('</head>')[0];
  expect(head).toMatch(/<script src="\/theme\.js"><\/script>/); // synkront: inget defer/module
  const choices = [...html.matchAll(/data-theme-choice="(\w+)"/g)].map((m) => m[1]);
  expect(choices).toEqual(['light', 'dark', 'auto']);
});

test.describe('temaväljaren i webbläsaren', () => {
  const { spawn } = require('child_process') as typeof import('child_process');
  const root = path.join(__dirname, '..');
  const port = 4200 + Math.floor(Math.random() * 80);
  const base = `http://127.0.0.1:${port}`;
  let server: import('child_process').ChildProcess;

  test.beforeAll(async () => {
    server = spawn(process.execPath, [path.join(root, 'gui', 'server.mjs')], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
    for (let i = 0; i < 100; i++) {
      try { await fetch(base + '/'); return; } catch { await new Promise((r) => setTimeout(r, 200)); }
    }
    throw new Error('GUI-servern startade inte');
  });
  test.afterAll(() => server?.kill());

  const bg = (page: any) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const LIGHT_BG = 'rgb(250, 246, 243)';
  const DARK_BG = 'rgb(20, 19, 18)';

  test('Mörkt sparas över omladdning, Ljust går tillbaka, Auto följer systemet', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(base + '/');
    await expect(page.locator('[data-theme-choice="auto"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await bg(page)).toBe(LIGHT_BG);

    await page.click('[data-theme-choice="dark"]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-choice="dark"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await bg(page)).toBe(DARK_BG);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await bg(page)).toBe(DARK_BG);

    await page.click('[data-theme-choice="light"]');
    expect(await bg(page)).toBe(LIGHT_BG);

    await page.click('[data-theme-choice="auto"]');
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await bg(page)).toBe(DARK_BG);
    await page.emulateMedia({ colorScheme: 'light' });
    expect(await bg(page)).toBe(LIGHT_BG);
  });

  test('Ljust vinner över mörkt system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(base + '/');
    expect(await bg(page)).toBe(DARK_BG);
    await page.click('[data-theme-choice="light"]');
    expect(await bg(page)).toBe(LIGHT_BG);
  });
});
