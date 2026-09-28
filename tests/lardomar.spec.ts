import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Lardomar: justering av marknadens sannolikheter (scripts/lib/learned-adjust.mjs), signaler och filerna per liga.
const lib = (f: string) => import(pathToFileURL(path.resolve(__dirname, '..', 'scripts', 'lib', f)).href);
const root = path.resolve(__dirname, '..');

test('justering: utan parametrar oforandrat, med parametrar summa 1 och ratt riktning', async () => {
  const { adjustProbs, applyParams } = await lib('learned-adjust.mjs');
  const p = [0.5, 0.27, 0.23];
  const none = adjustProbs(p, 'SA', {}, 'open', null);
  expect(none.p).toEqual(p);
  expect(none.applied).toEqual([]);

  const doc = { open: { beta: {}, drawBeta: {}, scale: {}, leagues: { SA: { g: 0.15, h: -0.1, d: 0.05 } } } };
  const r = adjustProbs(p, 'SA', {}, 'open', doc);
  expect(r.applied).toEqual(['liga-kalibrering']);
  expect(r.p.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 10);
  // h < 0 -> lagre hemmachans, d > 0 -> hogre kryss
  expect(r.p[0]).toBeLessThan(p[0]);
  expect(r.p[1]).toBeGreaterThan(p[1]);
  // Liga utan parametrar och bas utan parametrar: oforandrat
  expect(adjustProbs(p, 'PL', {}, 'open', doc).p).toEqual(p);
  expect(adjustProbs(p, 'SA', {}, 'close', doc).p).toEqual(p);

  // g > 0 skarper favoriten (favorit-skrallbias)
  const sharp = applyParams([0.6, 0.25, 0.15], { league: { g: 0.2 } });
  expect(sharp[0]).toBeGreaterThan(0.6);
  expect(sharp[2]).toBeLessThan(0.15);
  // Signal: positiv beta och positiv (standardiserad) signal -> hemmalaget upp
  const sig = applyParams(p, { beta: { h2hPts: 0.1 }, scale: { h2hPts: { mean: 0, sd: 1 } } }, { h2hPts: 2 });
  expect(sig[0]).toBeGreaterThan(p[0]);
  expect(sig[2]).toBeLessThan(p[2]);
});

test('config/learned-adjustments.json: bara godkanda delar (kontroll z <= -2) och rimliga parametrar', async () => {
  const file = path.join(root, 'config', 'learned-adjustments.json');
  test.skip(!fs.existsSync(file), 'npm run lardomar:modell inte kord');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const base of ['open', 'close']) {
    const b = doc[base];
    if (!b) continue;
    expect(b.test.z).toBeLessThanOrEqual(-2);
    for (const v of Object.values<any>(b.leagues)) {
      for (const k of ['g', 'h', 'd']) expect(Math.abs(v[k])).toBeLessThan(0.5);
    }
  }
});

test('inbordes moten och lagets nulage raknas bara pa tidigare matcher', async () => {
  const { h2hFeatures, sideState } = await lib('learnings-signals.mjs');
  const close = [0.4, 0.3, 0.3];
  const meet = [
    { date: '2024-01-01', hk: 'A', hg: 2, ag: 0, close },
    { date: '2024-06-01', hk: 'B', hg: 0, ag: 1, close },
    { date: '2025-01-01', hk: 'A', hg: 1, ag: 1, close },
  ];
  const f = h2hFeatures(meet, 'A', '2025-06-01');
  expect(f.h2hN).toBe(3);
  // A: vinst, vinst (borta), oavgjort -> 7 poang mot 1 = +2 per match
  expect(f.h2hPts).toBeCloseTo(2, 10);
  expect(h2hFeatures(meet.slice(0, 2), 'A', '2025-06-01')).toBeNull();
  // Moten aldre an 8 ar raknas inte
  expect(h2hFeatures(meet, 'A', '2033-01-02')).toBeNull();

  const st = { hist: Array.from({ length: 6 }, (_, i) => ({ date: `2025-0${i + 1}-01`, pts: 3, xpts: 2, gf: 2, ga: 0, xgf: 1, xga: 1, res: 0.5 })), last: '2025-06-01' };
  const s = sideState(st, '2025-06-08');
  expect(s.rest).toBe(7);
  expect(s.luck).toBeCloseTo(1, 10);
  expect(s.gap).toBeCloseTo(-2, 10);
  expect(s.mres).toBeCloseTo(0.5, 10);
});

test('matcher per liga: CSV med spelade och kommande, oddsen fore matchen foljer med', async () => {
  const file = path.join(root, 'data', 'matcher', 'PL.csv');
  test.skip(!fs.existsSync(file), 'npm run matcher inte kord');
  const [head, ...rows] = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const cols = head.split(',');
  for (const c of ['status', 'date', 'home', 'away', 'hg', 'ag', 'close_h', 'close_d', 'close_a', 'xg_h', 'luck', 'h2h_pts', 'pre_first_at', 'pre_last_h']) expect(cols).toContain(c);
  const played = rows.filter((r) => r.startsWith('spelad'));
  expect(played.length).toBeGreaterThan(3000);
  // Sannolikheter utan marginal summerar till 1
  const i = cols.indexOf('close_h');
  const sample = played.slice(-50).map((r) => r.split(',')).filter((c) => c[i]);
  for (const c of sample) expect(Number(c[i]) + Number(c[i + 1]) + Number(c[i + 2])).toBeCloseTo(1, 2);
  const dates = played.map((r) => r.split(',')[3]);
  expect([...dates].sort()).toEqual(dates);
});


test('trupper och tabeller: lagnamn matchar var historik, spelare har position och historik', async () => {
  const sqFile = path.join(root, 'data', 'trupper', 'PL.json');
  const lgFile = path.join(root, 'data', 'ligor', 'PL.json');
  test.skip(!fs.existsSync(sqFile) || !fs.existsSync(lgFile), 'npm run trupper inte kord');
  const sq = JSON.parse(fs.readFileSync(sqFile, 'utf8'));
  const lg = JSON.parse(fs.readFileSync(lgFile, 'utf8'));
  const ours = new Set(fs.readFileSync(path.join(root, 'data', 'matcher', 'PL.csv'), 'utf8').split(/\r?\n/).slice(-900).flatMap((l) => l.split(',').slice(5, 7)));
  expect(lg.table.length).toBe(20);
  for (const t of lg.table) expect(ours.has(t.team)).toBeTruthy();
  expect(Object.keys(lg.tableHistory).length).toBeGreaterThan(0);
  for (const [name, team] of Object.entries<any>(sq.teams)) {
    expect(ours.has(name)).toBeTruthy();
    expect(team.players.length).toBeGreaterThan(15);
    for (const p of team.players) {
      expect(['keepers', 'defenders', 'midfielders', 'attackers']).toContain(p.role);
      expect(team.history[p.id]?.lastSeen).toBeTruthy();
    }
  }
});
