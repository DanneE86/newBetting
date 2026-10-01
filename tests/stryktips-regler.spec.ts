import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Stryktipset/Europatipset: fasta regler raknade om oberoende av scripts/fetch-stryktipset.mjs.
// Laser bara data/stryktipset.json och data/stryktips-history/ (inget nat), sa testet ar deterministiskt.
// Reglerna (se .cursor/skills/stryktipset/reference.md, andrade 2026-09-28):
//   budget 350-400 kr per kupong, teckenminimum SIGN_MIN.A (4-2-2) fran skriptet, max 13,
//   utdelning 13 ratt >= 30 000 kr (Europatipset 20 000 kr) enligt Gambling Cabins formel,
//   delat lage (reducedB.split): ett system pa 700-800 rader delas efter utdelning, A = hogst utdelning, B = resten,
//   samma grundrad och inga gemensamma rader. Motsystem (STRYK_B_MODE=counter): B SIGN_MIN.B, hogst 1 gemensam spik.
//   Varje odds har ett Varde/Ej varde-omdome, varje match har avsparkstid.

const root = path.resolve(__dirname, '..');
const file = process.env.STRYK_DATA_FILE || path.join(root, 'data', 'stryktipset.json'); // STRYK_DATA_FILE: kontroll mot andrad kopia
const histDir = path.join(root, 'data', 'stryktips-history');
const script = pathToFileURL(path.join(root, 'scripts', 'fetch-stryktipset.mjs')).href;

const SIGNS = ['1', 'X', '2'];
const BUDGET = { min: 350, max: 400 };
// Kupong C (2026-09-30): eget system 700-850 kr, minst 30 000 kr for 13 ratt, samma regler som A
const BUDGET_C = { min: 700, max: 850 };
const budgetOf = (name: string) => (name === 'C' ? BUDGET_C : BUDGET);
// Teckenreglerna ar anvandarens beslut och lases fran skriptet (se beforeAll)
let SIGN_MIN: { A: number[]; B: number[] };
let SIGN_MIN_C: Record<string, number[]>, SPIK_MIN_BY_PRODUCT: Record<string, number>;
test.beforeAll(async () => { ({ SIGN_MIN, SIGN_MIN_C, SPIK_MIN_BY_PRODUCT } = await import(script)); });
const signMinOf = (name: 'A' | 'B' | 'C', red: any, product = 'stryktipset') => (name === 'C' ? SIGN_MIN_C[product] : name === 'A' || red.split ? SIGN_MIN.A : SIGN_MIN.B);
const UTD_MIN = { stryktipset: 30000, europatipset: 20000 } as Record<string, number>;
const PAYOUT_13 = 0.65 * 0.4;
const COLOR = { green: 0.45, red: 0.2 };
const VALUE_LEVELS = { low: 0.26, high: 0.4 };
const GRUND_MAX_ROWS = 30000;

const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
const products: any[] = data?.products ?? [];

const signColor = (p: number | null | undefined) => (p == null ? 'yellow' : p >= COLOR.green ? 'green' : p <= COLOR.red ? 'red' : 'yellow');
const idx = (s: string) => SIGNS.indexOf(s);
// Folkets streck for raden (reduceringen faller tillbaka pa var sannolikhet nar streck saknas)
const folkProduct = (events: any[], row: string) => row.split('').reduce((f, c, i) => f * (events[i].folk?.[idx(c)] ?? events[i].final[idx(c)]), 1);
const gcPayout = (rules: any, f: number) => (PAYOUT_13 * rules.turnover + (rules.jackpot || 0)) / (1 + rules.turnover * f);
const realPayout = (rules: any, f: number) => (PAYOUT_13 * rules.realTurnover + (rules.jackpot || 0)) / (1 + rules.realTurnover * f);
// Utdelningsintervall i Gambling Cabin: utd=1,min,max (max saknas = ingen ovre grans)
const inPayoutRange = (r: any, payout: number) => payout >= r.payoutMin && (r.payoutMax == null || payout <= r.payoutMax);
const signCount = (row: string) => SIGNS.map((s) => row.split('').filter((c) => c === s).length);
// Fargregler (2026-09-30): antal grona/gula/roda tecken i garderingarna ligger inom min/max, spikar ar rosa.
// Rorliga fonster: for hela raden minst 3 bred (4 mojliga antal) och innehaller vantat antal; spikarnas farger dras av.
const MAX_SPIKES = 4;
const colorCount = (events: any[], picks: string[], row: string, color: string) =>
  row.split('').filter((c, i) => picks[i].length > 1 && signColor(events[i].folk?.[idx(c)]) === color).length;
const inColorRules = (events: any[], picks: string[], r: any, row: string) =>
  ['green', 'yellow', 'red'].every((c) => { const n = colorCount(events, picks, row, c); return n >= r.colorRules[c][0] && n <= r.colorRules[c][1]; });

// Alla rader i grundraden (kartesisk produkt av tecknen per match)
function grundRows(picks: string[]): string[] {
  let rows = [''];
  for (const p of picks) rows = rows.flatMap((r) => p.split('').map((c) => r + c));
  return rows;
}

function systems(p: any) {
  const out: { name: 'A' | 'B' | 'C'; red: any; picks: string[] }[] = [];
  if (p.reduced) out.push({ name: 'A', red: p.reduced, picks: p.events.map((e: any) => e.systemPick?.signs) });
  if (p.reducedB) out.push({ name: 'B', red: p.reducedB, picks: p.events.map((e: any) => e.systemPickB?.signs) });
  if (p.reducedC) out.push({ name: 'C', red: p.reducedC, picks: p.reducedC.picks });
  return out;
}

test.skip(!data, 'data/stryktipset.json saknas - kor npm run stryktips');

test('matcher: avsparkstid, tips = troligaste tecknet, Värde/Ej värde räknat rätt', () => {
  expect(products.length).toBeGreaterThan(0);
  for (const p of products) {
    expect(p.events, p.product).toHaveLength(13);
    expect(new Set(p.events.map((e: any) => e.eventNumber)).size).toBe(13);
    for (const e of p.events) {
      const at = `${p.product} ${p.drawNumber} #${e.eventNumber} ${e.home} - ${e.away}`;
      // Avsparkstid med klockslag och tidszon som gar att tolka
      expect(e.kickoff, at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
      expect(Number.isNaN(Date.parse(e.kickoff)), at).toBe(false);
      // Sannolikheter
      expect(e.final.every((x: number) => x > 0 && x < 1), at).toBe(true);
      const top = e.final.indexOf(Math.max(...e.final));
      expect(e.tip, at).toBe(SIGNS[top]);
      expect(e.tipP, at).toBeCloseTo(e.final[top], 3);
      // Procentens kalla: odds + modell, eller utan odds modell 50 % + folk 50 % (basis '<modell>+folk')
      expect(e.basis, at).toMatch(/^(club|elo|clubelo)(\+folk)?$|^(folk|none)$/);
      if (e.market && e.model) {
        e.final.forEach((x: number, i: number) => expect(x, `${at} odds+modell`).toBeCloseTo((1 - e.modelWeight) * e.market[i] + e.modelWeight * e.model[i], 2));
      } else if (/\+folk$/.test(e.basis)) {
        expect(e.market, at).toBeNull();
        e.final.forEach((x: number, i: number) => expect(x, `${at} modell+folk`).toBeCloseTo(0.5 * e.model[i] + 0.5 * e.folk[i], 2));
      }
      if (/^clubelo/.test(e.basis)) expect(e.clubElo?.home > 0 && e.clubElo?.away > 0, at).toBe(true);
      if (e.neutralVenue != null) expect(typeof e.neutralVenue, at).toBe('boolean');
      // Varde: odds >= 1,03 / var sannolikhet (EV >= 3 %)
      expect(e.verdict.sign, at).toBe(e.tip);
      expect(e.verdict.minOdds, at).toBeCloseTo(1.03 / e.tipP, 2);
      if (e.odds) {
        expect(e.odds, at).toHaveLength(3);
        expect(e.verdict.odds, at).toBe(e.odds[top]);
        expect(e.verdict.value, at).toBe(e.odds[top] >= 1.03 / e.tipP);
      } else {
        expect(e.verdict.value, `${at}: utan odds kan det inte vara värde`).toBe(false);
      }
      // Marknaden ar devigad (summerar till 1) och matchar oddsen
      if (e.market && e.odds) {
        expect(e.market.reduce((s: number, x: number) => s + x, 0), at).toBeCloseTo(1, 2);
        const inv = e.odds.map((o: number) => 1 / o);
        const s = inv.reduce((a: number, b: number) => a + b, 0);
        // Skarpa odds (sharpOdds) kan ersatta Svenska Spels i marknaden - jamfor bara nar kallan ar Svenska Spel
        if (/^Svenska Spel/.test(e.marketSource || '')) inv.forEach((x: number, i: number) => expect(e.market[i], at).toBeCloseTo(x / s, 2));
      }
      // Folkets streck och farger (gron >= 45 %, rod <= 20 %)
      if (e.folk) {
        expect(e.folk.reduce((s: number, x: number) => s + x, 0), at).toBeCloseTo(1, 2);
        if (e.colors) expect(e.colors, at).toEqual(e.folk.map(signColor));
      }
      // Grundradens tecken och typ
      for (const pick of [e.systemPick, e.systemPickB].filter(Boolean)) {
        expect(pick.signs, at).toMatch(/^(1|X|2|1X|12|X2|1X2)$/);
        expect(pick.type, at).toBe(['Spik', 'Halvgardering', 'Helgardering'][pick.signs.length - 1]);
      }
    }
  }
});

test('reducerade system: budget, teckenregler, rader inom grundraden', () => {
  for (const p of products) {
    expect(p.reduced, `${p.product}: system A saknas`).toBeTruthy();
    for (const { name, red, picks } of systems(p)) {
      const at = `${p.product} ${p.drawNumber} system ${name}`;
      expect(red.rules.signMin, at).toEqual(signMinOf(name, red, p.product));
      expect(red.rules.payoutMinReal, at).toBe(name === 'A' ? UTD_MIN[p.product] ?? 30000 : Math.max(30000, UTD_MIN[p.product] ?? 30000));
      // Exakt gräns (2026-09-30: "30k, inte mindre, inte mer"): länkens gräns är regeln, om den inte fick höjas som reserv
      // Standard sedan 2026-09-30 (sent): regeln är en lägsta gräns (verklig utdelning, se nästa test); exakt bara med STRYK_EXACT=1
      if (red.rules.payoutExact) expect(red.rules.payoutMin, `${at}: exakt utdelningsgräns`).toBe(red.rules.payoutMinReal);
      // Budget
      expect(red.rows, at).toBe(red.rowList.length);
      expect(red.cost, at).toBe(red.rows * red.rowPrice);
      expect(red.cost, at).toBeGreaterThanOrEqual(budgetOf(name).min);
      expect(red.cost, at).toBeLessThanOrEqual(budgetOf(name).max);
      expect(new Set(red.rowList).size, at).toBe(red.rows);
      // Grundraden
      expect(picks.every((x) => typeof x === 'string' && x.length > 0), at).toBe(true);
      const grundSize = picks.reduce((n, x) => n * x.length, 1);
      expect(red.grundRows, at).toBe(grundSize);
      expect(grundSize, at).toBeLessThanOrEqual(GRUND_MAX_ROWS);
      expect(red.afterPayout, at).toBeGreaterThanOrEqual(red.rows);
      for (const row of red.rowList) {
        expect(row, at).toMatch(/^[1X2]{13}$/);
        row.split('').forEach((c: string, i: number) => expect(picks[i], `${at} rad ${row} match ${i + 1}`).toContain(c));
        const n = signCount(row);
        signMinOf(name, red, p.product).forEach((m, k) => expect(n[k], `${at} rad ${row}: minst ${m} st ${SIGNS[k]}`).toBeGreaterThanOrEqual(m));
        expect(inColorRules(p.events, picks, red.rules, row), `${at} rad ${row}: färgreglerna`).toBe(true);
      }
      // Högst 4 spikar, och spik bara på favoriter med minst spelets gräns (Stryktipset 65 %)
      const spikes = picks.filter((x) => x.length === 1).length;
      picks.forEach((pk, i) => {
        if (pk.length !== 1) return;
        const sp = p.events[i].spik;
        // Spikbedömning match för match (Stryktipset): spik bara på favoriten och bara om matchen bedömts som spikbar
        if (sp?.used) {
          expect(pk, `${at} match ${i + 1}: spik på favoriten`).toBe(sp.fav);
          expect(sp.spikbar, `${at} match ${i + 1}: spikbar (justerad chans ${sp.calibrated} >= ${sp.spikMin})`).toBe(true);
          expect(sp.calibrated, `${at} match ${i + 1}`).toBeGreaterThanOrEqual(sp.spikMin - 1e-9);
        } else expect(p.events[i].final[idx(pk)], `${at} match ${i + 1}: spik ${pk} på favorit`).toBeGreaterThanOrEqual((SPIK_MIN_BY_PRODUCT[p.product] ?? 0) - 1e-9);
      });
      expect(spikes, `${at}: högst ${MAX_SPIKES} spikar`).toBeLessThanOrEqual(MAX_SPIKES);
      // Rörliga färgfönster (hela raden = regeln + spikarnas färger): minst 3 breda och runt väntat antal; rosa = antal spikar
      expect(red.rules.colorRules.pink, at).toEqual([spikes, spikes]);
      if (red.rules.colorTarget) {
        ['green', 'yellow', 'red'].forEach((c) => {
          const spikC = picks.filter((pk, i) => pk.length === 1 && signColor(p.events[i].folk?.[idx(pk)]) === c).length;
          const exp = p.events.reduce((sum: number, e: any) => sum + [0, 1, 2].reduce((q, k) => q + (signColor(e.folk?.[k]) === c ? e.final[k] : 0), 0), 0);
          const [lo, hi] = red.rules.colorRules[c];
          const wLo = lo + spikC, wHi = hi + spikC;
          expect(wHi, `${at} ${c}: max minst väntat ${exp.toFixed(1)}`).toBeGreaterThanOrEqual(exp - 1e-9);
          if (lo > 0) {
            expect(wLo, `${at} ${c}: min högst väntat`).toBeLessThanOrEqual(exp + 1e-9);
            expect(wHi - wLo, `${at} ${c}: inte snävt`).toBeGreaterThanOrEqual(3);
          }
        });
      }
      // Favoriten (troligaste tecknet) i varje gardering på minst 10 % av kupongens rader (2026-09-30)
      picks.forEach((pk, i) => {
        if (pk.length < 2) return;
        const fav = pk.split('').reduce((b, c) => (p.events[i].final[idx(c)] > p.events[i].final[idx(b)] ? c : b));
        const share = red.rowList.filter((r: string) => r[i] === fav).length / red.rows;
        expect(share, `${at} match ${i + 1}: favoriten ${fav} på minst 10 %`).toBeGreaterThanOrEqual(0.1);
      });
      // Utan mål: färgreglerna är minst 2 breda där spannet tillåter (t.ex. 1-3, inte ett exakt antal)
      if (!red.rules.colorTarget) for (const c of ['green', 'yellow', 'red']) {
        const [lo, hi] = red.rules.colorRules[c];
        const counts = red.rowList.map((r: string) => colorCount(p.events, picks, r, c));
        expect(hi - lo, `${at} ${c}: minst 3 olika antal där raderna tillåter`).toBeGreaterThanOrEqual(Math.min(2, Math.max(...counts) - Math.min(...counts)));
      }
      // Chanser: reducerat <= grundrad <= 1, och grundradens chans = produkt av valda tecknens sannolikhet
      expect(red.hitAll, at).toBeLessThanOrEqual(red.grundHit + 1e-9);
      expect(red.grundHit, at).toBeLessThanOrEqual(1);
      // Systemen byggs på matchens justerade procent (spikbedömningen) när den används
      const sysP = (e: any) => (e.spik?.used ? e.spik.sysP : e.final);
      const grundHit = p.events.reduce((h: number, e: any, i: number) => h * picks[i].split('').reduce((s, c) => s + sysP(e)[idx(c)], 0), 1);
      expect(red.grundHit / grundHit, at).toBeCloseTo(1, 1);
      const hit = red.rowList.reduce((s: number, row: string) => s + row.split('').reduce((q, c, i) => q * sysP(p.events[i])[idx(c)], 1), 0);
      expect(red.hitAll / hit, at).toBeCloseTo(1, 1);
    }
  }
});

test('reducerade system: utdelningsgränsen ger exakt samma rader som Gambling Cabin', () => {
  for (const p of products) {
    for (const { name, red, picks } of systems(p)) {
      const at = `${p.product} ${p.drawNumber} system ${name}`;
      const r = red.rules;
      expect(r.turnover, at).toBeGreaterThan(0);
      // Varje rad klarar gransen i lanken (GC:s formel) och den verkliga gransen (30 000 / 20 000 kr)
      for (const row of red.rowList) {
        const f = folkProduct(p.events, row);
        expect(gcPayout(r, f), `${at} rad ${row}`).toBeGreaterThanOrEqual(r.payoutMin - 1);
        if (r.payoutMax != null) expect(gcPayout(r, f), `${at} rad ${row}`).toBeLessThanOrEqual(r.payoutMax);
        if (!r.payoutExact) expect(realPayout(r, f), `${at} rad ${row}`).toBeGreaterThanOrEqual(r.payoutMinReal - 1);
      }
      // Omvant: ingen rad i grundraden som klarar tecken + utdelning saknas (annars skiljer GC och vi)
      const expected = grundRows(picks).filter((row) => {
        const n = signCount(row);
        return signMinOf(name, red, p.product).every((m, k) => n[k] >= m) && inColorRules(p.events, picks, r, row) && inPayoutRange(r, gcPayout(r, folkProduct(p.events, row)));
      });
      expect(expected.length, at).toBe(red.rows);
      expect(new Set(expected), at).toEqual(new Set(red.rowList));
    }
  }
});

test('Gambling Cabin-länk: samma grundrad, färger och regler som systemet', () => {
  for (const p of products) {
    for (const { name, red, picks } of systems(p)) {
      const at = `${p.product} ${p.drawNumber} system ${name}`;
      const url = new URL(red.gamblingCabinUrl);
      expect(url.origin, at).toBe('https://reducera.gamblingcabin.se');
      const q = url.searchParams;
      expect(q.get('spel'), at).toBe(p.product);
      expect(q.get('omg'), at).toBe(String(p.drawNumber));
      expect(q.get('datum'), at).toBe((p.regCloseTime || '').slice(0, 10));
      const colorId: Record<string, number> = { yellow: 2, red: 3, green: 4 };
      ['v1', 'vX', 'v2'].forEach((key, k) => {
        const expected = p.events.map((e: any, i: number) => (!picks[i].includes(SIGNS[k]) ? 0 : picks[i].length === 1 ? 5 : colorId[e.colors[k]])).join(',');
        expect(q.get(key), `${at} ${key}`).toBe(expected);
      });
      const [m1, mx, m2] = signMinOf(name, red, p.product);
      expect(q.get('antT'), at).toBe(`1,${m1},13,${mx},13,${m2},13`);
      expect(q.get('utd'), at).toBe(`1,${red.rules.payoutMin},${red.rules.payoutMax ?? 100000000}`);
      // Färgreglerna är aktiva med systemets min/max, aldrig 0-13; rosa = antal spikar
      for (const c of ['yellow', 'red', 'green', 'pink']) {
        const [lo, hi] = red.rules.colorRules[c];
        expect(q.get(c), `${at} ${c}`).toBe(`1,${lo},${hi}`);
        expect(lo > 0 || hi < 13, `${at} ${c}: inte 0-13`).toBe(true);
      }
    }
  }
});

test('kupong B: eget system (högst 1 spik som A, ingen samma halv- eller helgardering) eller delat system', () => {
  for (const p of products.filter((x) => x.reduced && x.reducedB)) {
    const at = `${p.product} ${p.drawNumber}`;
    const A = p.reduced, B = p.reducedB;
    const same = p.events.filter((e: any) => e.systemPick.signs.length === 1 && e.systemPickB.signs === e.systemPick.signs).length;
    expect(B.sameSingles, at).toBe(same);
    const setA = new Set(A.rowList);
    const overlap = B.rowList.filter((r: string) => setA.has(r)).length;
    expect(B.overlapRows, at).toBe(overlap);
    if (B.split) {
      // Samma grundrad och regler, utdelningsintervallen ligger kant i kant utan glapp eller overlapp
      expect(A.split, at).toBe(true);
      expect(p.events.map((e: any) => e.systemPickB.signs), at).toEqual(p.events.map((e: any) => e.systemPick.signs));
      expect(B.rules.signMin, at).toEqual(A.rules.signMin);
      expect(A.rules.payoutMax ?? null, `${at}: A har ingen övre gräns`).toBeNull();
      expect(B.rules.payoutMax, at).toBe(A.rules.payoutMin - 1);
      expect(B.rules.payoutMin, at).toBeLessThan(A.rules.payoutMin);
      expect(overlap, `${at}: inga gemensamma rader`).toBe(0);
      // Tillsammans ett system pa 700-800 rader
      expect(A.cost + B.cost, at).toBeGreaterThanOrEqual(2 * BUDGET.min);
      expect(A.cost + B.cost, at).toBeLessThanOrEqual(2 * BUDGET.max);
      expect(B.unionHit, at).toBeCloseTo(A.hitAll + B.hitAll, 9);
    } else {
      // Eget B-system (standard sedan 2026-09-30): högst 1 spik som i A (2026-10-01) och aldrig exakt samma halv- eller helgardering
      expect(same, `${at}: motsystem högst 1 gemensam spik`).toBeLessThanOrEqual(1);
      p.events.forEach((e: any, i: number) => {
        if (e.systemPick.signs.length > 1) expect(e.systemPickB.signs, `${at} match ${i + 1}: inte samma gardering som A`).not.toBe(e.systemPick.signs);
      });
    }
    // A+B-chansen ar minst A:s och hogst summan av bada
    expect(p.reducedB.unionHit, at).toBeGreaterThanOrEqual(p.reduced.hitAll - 1e-9);
    expect(p.reducedB.unionHit, at).toBeLessThanOrEqual(p.reduced.hitAll + p.reducedB.hitAll + 1e-9);
  }
});

test('värde per omgång: kvot, nivå och text stämmer, inga insatsbelopp', () => {
  for (const p of products.filter((x) => x.reduced)) {
    const at = `${p.product} ${p.drawNumber}`;
    const ratio = p.reduced.expectedReturn / p.reduced.cost;
    expect(p.value.ratio, at).toBeCloseTo(ratio, 3);
    const level = ratio <= VALUE_LEVELS.low ? 'low' : ratio >= VALUE_LEVELS.high ? 'high' : 'normal';
    expect(p.value.level, at).toBe(level);
    expect(p.value.text, at).toContain(`${Math.round(ratio * 100)} %`);
    if (level === 'low') expect(p.value.text, at).toMatch(/saknar värde.*Raderna är ändå skapade/);
    if (level === 'high') expect(p.value.text, at).toMatch(/högt värde/);
    // Flat insats: texten visar inga kronbelopp
    expect(p.value.text, at).not.toMatch(/\d\s*kr\b/);
    // Forvantad utdelning vid 13 ratt ar forvantad aterbetalning / chans
    if (p.reduced.hitAll > 0) expect(p.reduced.expectedPayout / (p.reduced.expectedReturn / p.reduced.hitAll), at).toBeCloseTo(1, 3);
  }
});

test('avgjord omgång: facit räknat rätt', () => {
  for (const p of products.filter((x) => x.result)) {
    const at = `${p.product} ${p.drawNumber}`;
    const done = p.events.filter((e: any) => e.result?.outcome);
    expect(p.result.total, at).toBe(done.length);
    expect(p.result.correct, at).toBe(done.filter((e: any) => e.result.outcome === e.tip).length);
    expect(p.result.systemCorrect, at).toBe(done.filter((e: any) => e.systemPick.signs.includes(e.result.outcome)).length);
    const best = (red: any) => Math.max(...red.rowList.map((row: string) => p.events.filter((e: any, i: number) => e.result && row[i] === e.result.outcome).length));
    if (p.reduced) expect(p.result.reducedCorrect, at).toBe(best(p.reduced));
    if (p.reducedB) expect(p.result.reducedCorrectB, at).toBe(best(p.reducedB));
    for (const e of done) {
      expect(e.result.outcome, at).toMatch(/^[1X2]$/);
      if (e.result.score) {
        const [h, a] = e.result.score.split('-').map(Number);
        expect(e.result.outcome, `${at} #${e.eventNumber} ${e.result.score}`).toBe(h > a ? '1' : h < a ? '2' : 'X');
      }
    }
  }
});

test('matchkontext (FotMob): bara för öppna omgångar, raderna ligger sist i analysen', async () => {
  const withCx = products.flatMap((p) => p.events.filter((e: any) => e.context).map((e: any) => ({ p, e })));
  test.skip(withCx.length === 0, 'ingen matchkontext i datan än');
  const { contextNotes } = await import(pathToFileURL(path.join(root, 'scripts', 'lib', 'match-context.mjs')).href);
  for (const { p, e } of withCx) {
    const at = `${p.product} ${p.drawNumber} #${e.eventNumber} ${e.home} - ${e.away}`;
    expect(p.open, `${at}: kontext hämtas bara för öppna omgångar`).toBe(true);
    expect(e.context.fotmobMatchId, at).toBeTruthy();
    const notes = contextNotes(e.context, e.home, e.away);
    expect(e.analysis.slice(e.analysis.length - notes.length), at).toEqual(notes);
    expect(e.analysis.length, `${at}: modellens analys finns kvar`).toBeGreaterThan(notes.length);
    if (e.context.home) expect(typeof e.context.lineupConfirmed, at).toBe('boolean');
  }
});

test('sparade kuponger: senaste versionen följer reglerna och öppen omgång stämmer med sidan', () => {
  const files = fs.existsSync(histDir) ? fs.readdirSync(histDir).filter((f) => f.endsWith('.json')) : [];
  test.skip(files.length === 0, 'inga sparade kuponger');
  for (const f of files) {
    const h = JSON.parse(fs.readFileSync(path.join(histDir, f), 'utf8'));
    expect(f, 'filnamn = spel-omgang').toBe(`${h.product}-${h.drawNumber}.json`);
    expect(h.matches, f).toHaveLength(13);
    // "saved"/"savedB"/"pairA" ar lasta med reglerna som gallde da - bara struktur kontrolleras
    for (const key of ['saved', 'latest', 'savedB', 'latestB', 'pairA']) {
      const s = h[key];
      if (!s) continue;
      const at = `${f} ${key}`;
      expect(s.rows, at).toBe(s.rowList.length);
      expect(new Set(s.rowList).size, at).toBe(s.rows);
      expect(s.picks, at).toHaveLength(13);
      for (const row of s.rowList) row.split('').forEach((c: string, i: number) => expect(s.picks[i], `${at} rad ${row}`).toContain(c));
      expect(s.gamblingCabinUrl, at).toContain(`omg=${h.drawNumber}`);
    }
    if (h.saved && h.latest) expect(Date.parse(h.latest.at), f).toBeGreaterThanOrEqual(Date.parse(h.saved.at));
    // Senaste versionen for en oppen omgang ska vara exakt det som visas pa sidan
    const p = products.find((x) => x.product === h.product && x.drawNumber === h.drawNumber && x.open);
    if (p) {
      expect(h.latest.rowList, `${f}: latest = sidans system A`).toEqual(p.reduced.rowList);
      expect(h.latest.picks, f).toEqual(p.events.map((e: any) => e.systemPick.signs));
      if (p.reducedB) expect(h.latestB?.rowList, `${f}: latestB = sidans system B`).toEqual(p.reducedB.rowList);
    }
  }
});
