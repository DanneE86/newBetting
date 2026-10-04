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
//   samma grundrad och inga gemensamma rader. Motsystem (STRYK_B_MODE=counter): B SIGN_MIN.B, aldrig samma gardering som A och hogst 1 spik som skiljer (2026-10-03). Alla kuponger 2-4 spikar.
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
let SIGN_MIN_C: Record<string, number[]>, SPIK_MIN_BY_PRODUCT: Record<string, number>, MIN_SPIKES: number, MAX_SPIKES: number, MIN_HELG: number, SKRALL_SPIK: any;
test.beforeAll(async () => {
  ({ SIGN_MIN, SIGN_MIN_C, SPIK_MIN_BY_PRODUCT, MIN_SPIKES, MAX_SPIKES, MIN_HELG, SKRALL_SPIK } = await import(script));
  // Användarens regel 2026-10-02: högst en skrällspik (runt 40 %, minst 3 procentenheter över folket)
  expect(SKRALL_SPIK).toMatchObject({ min: 0.35, max: 0.47, edge: 0.03, count: 1 });
  // Användarens regel 2026-10-02: alltid minst 2 och högst 4 spikar per kupong
  expect([MIN_SPIKES, MAX_SPIKES]).toEqual([2, 4]);
  // Användarens regel 2026-10-02: minst 3 helgarderingar per kupong
  expect(MIN_HELG).toBe(3);
});
const signMinOf = (name: 'A' | 'B' | 'C', red: any, product = 'stryktipset') => (name === 'C' ? SIGN_MIN_C[product] : name === 'A' || red.split ? SIGN_MIN.A : SIGN_MIN.B);
// Stryktipset A 15 000 sedan 2026-10-04 (tidigare 30 000)
const UTD_MIN = { stryktipset: 15000, europatipset: 20000 } as Record<string, number>;
const PAYOUT_13 = 0.65 * 0.4;
const COLOR = { green: 0.45, red: 0.25 };
const VALUE_LEVELS = { low: 0.26, high: 0.4 };
const GRUND_MAX_ROWS = 30000;

const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
const products: any[] = data?.products ?? [];

const signColor = (p: number | null | undefined) => (p == null ? 'yellow' : p >= COLOR.green ? 'green' : Math.round(p * 100) <= COLOR.red * 100 ? 'red' : 'yellow');
const idx = (s: string) => SIGNS.indexOf(s);
// Folkets streck for raden (reduceringen faller tillbaka pa var sannolikhet nar streck saknas)
const folkProduct = (events: any[], row: string) => row.split('').reduce((f, c, i) => f * (events[i].folk?.[idx(c)] ?? events[i].final[idx(c)]), 1);
const gcPayout = (rules: any, f: number) => (PAYOUT_13 * rules.turnover + (rules.jackpot || 0)) / (1 + rules.turnover * f);
const realPayout = (rules: any, f: number) => (PAYOUT_13 * rules.realTurnover + (rules.jackpot || 0)) / (1 + rules.realTurnover * f);
// Utdelningsintervall i Gambling Cabin: utd=1,min,max (max saknas = ingen ovre grans)
const inPayoutRange = (r: any, payout: number) => payout >= r.payoutMin && (r.payoutMax == null || payout <= r.payoutMax);
const signCount = (row: string) => SIGNS.map((s) => row.split('').filter((c) => c === s).length);
// Fargregler (2026-09-30): antal grona/gula/roda tecken i garderingarna ligger inom min/max, spikar ar bla (id 1).
// Rorliga fonster: for hela raden minst 3 bred (4 mojliga antal) och innehaller vantat antal; spikarnas farger dras av.
// Blå halvgarderingar (rules.blueHalves, 2026-10-02) räknas inte heller, som spikarna
const colorCount = (events: any[], picks: string[], row: string, color: string, blue: number[] = []) =>
  row.split('').filter((c, i) => picks[i].length > 1 && !blue.includes(i) && signColor(events[i].folk?.[idx(c)]) === color).length;
const inColorRules = (events: any[], picks: string[], r: any, row: string) =>
  ['green', 'yellow', 'red'].every((c) => { const n = colorCount(events, picks, row, c, r.blueHalves); return n >= r.colorRules[c][0] && n <= r.colorRules[c][1]; });
// "Får jag in 3 röda så kan jag få in alla gröna också" (användaren 2026-10-02): rader i grundraden med röd max (3, eller
// så många röda garderingar som finns) där varje annan färgad gardering med ett grönt tecken går grönt. Färgreglerna får
// aldrig stoppa dem (utdelnings- och teckenreglerna gäller som vanligt). Räknas över hela grundraden, oberoende av skriptet.
// Tillägg 2026-10-02 ("om 3 röda går in och en gul då kan jag inte få 13 rätt"): högst 1 av de andra garderingarna får gå gult
// i stället för grönt, och raderna ska klara teckenreglerna också (utom rules.redGreenSignsFree: skulle krävt under 2-1-1).
function redGreenViolations(events: any[], picks: string[], r: any, redTop = 3): string[] {
  const blue: number[] = r.blueHalves || [];
  const colored = (i: number) => picks[i].length > 1 && !blue.includes(i);
  const top = Math.min(redTop, picks.filter((pk, i) => colored(i) && pk.split('').some((c) => signColor(events[i].folk?.[idx(c)]) === 'red')).length);
  if (top < 1) return [];
  const bad: string[] = [];
  for (const row of grundRows(picks)) {
    let reds = 0, extra = 0;
    row.split('').forEach((c, i) => {
      if (!colored(i)) return;
      const col = signColor(events[i].folk?.[idx(c)]);
      if (col === 'red') reds++;
      else if (col !== 'green' && picks[i].split('').some((x) => signColor(events[i].folk?.[idx(x)]) === 'green')) extra++;
    });
    if (reds !== top || extra > 1) continue;
    const signsOk = r.redGreenSignsFree || signCount(row).every((n, k) => n >= r.signMin[k]);
    if (!inColorRules(events, picks, r, row) || !signsOk) bad.push(row);
  }
  return bad;
}
// Lägsta och högsta antal av färgen c i de färgade garderingarna när de andra två färgerna håller sina gränser
function reachableSpan(events: any[], picks: string[], r: any, c: string): number[] {
  const keys = ['green', 'yellow', 'red'];
  const rules = r.colorRules;
  let set = new Set(['0,0,0']);
  picks.forEach((pk, i) => {
    if (pk.length < 2 || r.blueHalves?.includes(i)) return;
    const cols = new Set(pk.split('').map((s) => keys.indexOf(signColor(events[i].folk?.['1X2'.indexOf(s)]))));
    const next = new Set<string>();
    for (const key of set) for (const ci of cols) { const t = key.split(',').map(Number); t[ci]++; next.add(t.join(',')); }
    set = next;
  });
  const ci = keys.indexOf(c);
  const ok = [...set].map((k) => k.split(',').map(Number)).filter((t) => keys.every((o, j) => j === ci || (t[j] >= rules[o][0] && t[j] <= rules[o][1])));
  return [Math.min(...ok.map((t) => t[ci])), Math.max(...ok.map((t) => t[ci]))];
}

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
        // Domare med låg hemmavinst och ny tränare flyttar procenten efteråt (finalBase = före)
        (e.finalBase || e.final).forEach((x: number, i: number) => expect(x, `${at} odds+modell`).toBeCloseTo((1 - e.modelWeight) * e.market[i] + e.modelWeight * e.model[i], 2));
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
      // Folkets streck och farger (gron >= 45 %, rod 25 % eller lagre)
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
      // Teckenregeln får sänkas (högst till 2-1-1) bara för att hålla gränsen 30 000–50 000 kr (2026-10-02)
      if (red.rules.signMinRule && red.rules.payoutExact === true) {
        expect(red.rules.signMinRule, at).toEqual(signMinOf(name, red, p.product));
        red.rules.signMin.forEach((v: number, k: number) => expect(v, at).toBeLessThanOrEqual(red.rules.signMinRule[k]));
        red.rules.signMin.forEach((v: number, k: number) => expect(v, at).toBeGreaterThanOrEqual([2, 1, 1][k]));
      } else expect(red.rules.signMin, at).toEqual(signMinOf(name, red, p.product));
      // B (risksystemet) 50 000–75 000 kr (användaren 2026-10-02 kväll: "öka B till 50k-75k"), C minst 30 000
      expect(red.rules.payoutMinReal, at).toBe(name === 'A' ? UTD_MIN[p.product] ?? 30000 : 50000);
      const band = ['B', 'C'].includes(name) ? 75 / 50 : 50 / 30;
      if (['B', 'C'].includes(name)) expect(red.rules.payoutBand, at).toBeCloseTo(1.5, 6);
      // Exakt gräns (2026-09-30: "30k, inte mindre, inte mer"): länkens gräns är regeln, om den inte fick höjas som reserv
      // Standard sedan 2026-09-30 (sent): regeln är en lägsta gräns (verklig utdelning, se nästa test); exakt bara med STRYK_EXACT=1
      // 2026-10-02 ("minsta utdelning 30k, kan diffa lite för Stryktipset"): utan tak 30 000–50 000 kr (regeln x 50/30, användaren 2026-10-02: "30–50k är minsta utdelningen"),
      // annars lägsta gräns som går (payoutExact 'near'), sist höjd gräns (false, står i kupongen). Aldrig tak (2026-10-02).
      if (red.rules.payoutExact === true) {
        expect(red.rules.payoutMin, `${at}: gräns minst regeln`).toBeGreaterThanOrEqual(red.rules.payoutMinReal);
        expect(red.rules.payoutMin, `${at}: gräns högst regeln x 50/30`).toBeLessThanOrEqual(red.rules.payoutMinReal * band + 1);
        expect(red.rules.payoutMax, at).toBeUndefined();
      }
      expect(red.rules.payoutMax, `${at}: ingen övre gräns`).toBeUndefined();
      if (red.rules.payoutExact === 'near') expect(red.rules.payoutMin, `${at}: lägsta gräns över regeln x 50/30`).toBeGreaterThan(red.rules.payoutMinReal * band - 1);
      // Blått (2026-10-02): varje gardering med bara gula tecken är alltid blå, och minst 2 halvgarderingar är blå
      // (påfyllda med de säkraste). Inget annat är blått än garderingar.
      const halves = picks.map((pk, i) => (pk.length === 2 ? i : -1)).filter((i) => i >= 0);
      const blue: number[] = red.rules.blueHalves;
      // Inga blå helgarderingar och ingen helgardering där alla tecken är gula ("3 gula helor är samma sak som blå helor"),
      // och högst 2 helgula garderingar (de blå halvorna) – användaren 2026-10-02
      const allYellow = (i: number) => [0, 1, 2].every((k) => signColor(p.events[i].folk?.[k]) === 'yellow');
      picks.forEach((pk, i) => { if (allYellow(i)) expect(pk.length, `${at} match ${i + 1}: helgul helgardering`).toBeLessThan(3); });
      expect(picks.filter((pk, i) => pk.length > 1 && allYellow(i)).length, `${at}: högst 2 helgula garderingar`).toBeLessThanOrEqual(red.rules.allYellowMax ?? 2);
      if (red.rules.allYellowMax != null) expect(red.rules.allYellowMax, at).toBeGreaterThan(2);
      for (const i of blue) expect(picks[i].length, `${at} match ${i + 1}: blå = halvgardering`).toBe(2);
      for (const i of blue) expect(picks[i].length, `${at} match ${i + 1}: blå = gardering`).toBeGreaterThan(1);
      // "2 halvor blå alltid" (2026-10-02): minst 2 halvgarderingar, exakt 2 av dem blå
      expect(halves.length, `${at}: minst 2 halvgarderingar`).toBeGreaterThanOrEqual(2);
      expect(blue.filter((i) => picks[i].length === 2).length, `${at}: exakt 2 blå halvor`).toBe(2);
      // Färgreglerna: aldrig exakt antal (2–2) och aldrig samma fönster för två färger; färger som inte finns är av
      const on = ['green', 'yellow', 'red'].filter((c) => !(red.rules.colorsOff || []).includes(c));
      // Röd 1–3 i A och C (användaren 2026-10-02: "rött ska alltid vara 1-3, 25 % eller lägre är röda"). B är risksystemet
      // (2026-10-02 kväll: "kör 1-4 eller 2-4 röda ... inte mer än 2 röda som minst", "behåll A som det är")
      // B får fria färger som sista reserv när A/B-regeln (samma spikar, aldrig samma gardering) och A:s form inte lämnar
      // någon B med fasta färger (Europatipset 2613, 2026-10-04) – flaggat i kupongen. A och C har alltid fasta färger.
      const freeB = name === 'B' && red.rules.colorsFree;
      if (on.includes('red') && !freeB) {
        // ... utom när 30 000–50 000 kr inte gick med röd max 5: då röd 1–3 och gränsen hålls (rules.redFallback)
        if (['B', 'C'].includes(name) && red.rules.redFallback) {
          // Reserv: B 1–2 som A, C 1–3 (2026-10-03 natt)
          expect(name === 'B' ? [[1, 2], [1, 3]] : [[1, 3]], `${at}: ${name} reserv`).toContainEqual(red.rules.colorRules.red);
          expect(red.rules.payoutExact, `${at}: ${name} reserv håller 50 000–75 000 kr`).toBe(true);
        } else if (name === 'B') expect([[1, 5], [2, 5]], `${at}: röd 1–5 eller 2–5 (max 5 sedan 2026-10-03)`).toContainEqual(red.rules.colorRules.red);
        // C är skrällsystemet (2026-10-02 kväll: "C är inte skräll, max vinst är 300k typ"): röd 2–6, högsta rad minst 1 miljon
        else if (name === 'C') {
          expect(red.rules.colorRules.red, `${at}: C röd 2–6`).toEqual([2, 6]);
          if (!red.rules.maxRowShort) expect(red.rules.maxRowPayout, `${at}: C högsta rad`).toBeGreaterThanOrEqual(1e6);
          expect(red.rules.minRedMatches, at).toBeGreaterThanOrEqual(6);
        }
        // A röd 1–2 sedan 2026-10-03 (natt): högst chans till 13 rätt i 30 iterationer
        else expect(red.rules.colorRules.red, `${at}: röd 1–2`).toEqual([1, 2]);
      }
      // Grön alltid 3–6 (användaren 2026-10-02, tidigare 4–6; A, B och C)
      if (on.includes('green') && !freeB) expect(red.rules.colorRules.green, `${at}: grön 3–6`).toEqual([3, 6]);
      if (!freeB) expect(red.rules.colorsFree, `${at}: fasta färgregler`).toBeFalsy();
      // Gult skär aldrig bort rader ("får jag in mina röda vill jag kunna få in alla gröna och gula", 2026-10-02): gulregeln
      // är hela spannet som går att nå med grön 3–6 och röd 1–3 – utom när 30 000–50 000 kr annars inte går (yellowFull false)
      if (on.includes('yellow') && red.rules.yellowFull !== false) {
        const span = reachableSpan(p.events, picks, red.rules, 'yellow');
        expect(red.rules.colorRules.yellow[0], `${at}: gul min = lägsta som går`).toBe(span[0]);
        expect(red.rules.colorRules.yellow[1], `${at}: gul max = högsta som går`).toBeGreaterThanOrEqual(span[1]);
      }
      // Skyddet gäller med 3 röda, aldrig över systemets röd max (A röd 1–2 sedan 2026-10-03 natt: 2 röda + resten gröna)
      if (!red.rules.redGreenFree && !freeB) expect(redGreenViolations(p.events, picks, red.rules, Math.min(3, red.rules.colorRules.red[1])).slice(0, 3), `${at}: 3 röda + resten gröna stoppas av färgreglerna (även B)`).toEqual([]);
      on.forEach((c, j) => {
        expect(red.rules.colorRules[c][1], `${at} ${c}: inte exakt ${red.rules.colorRules[c].join('–')}`).toBeGreaterThan(red.rules.colorRules[c][0]);
        on.slice(j + 1).forEach((o) => expect(red.rules.colorRules[o].join(), `${at}: ${c} och ${o} samma fönster`).not.toBe(red.rules.colorRules[c].join()));
      });
      // Röda (folket 25 % eller lägre): minst 5 i de färgade garderingarna när omgången har gott om dem (användaren 2026-10-02:
      // "minst 5 röda om det är möjligt", tidigare 2), minst 2 när det finns 4 matcher med rött, och röd max minst 2 när det går
      const redIn = picks.reduce((n, pk, i) => n + (pk.length > 1 && !red.rules.blueHalves.includes(i) ? pk.split('').filter((c) => signColor(p.events[i].folk?.[idx(c)]) === 'red').length : 0), 0);
      const redMatches = p.events.filter((e: any) => [0, 1, 2].some((k) => signColor(e.folk?.[k]) === 'red')).length;
      if (redMatches >= 4) expect(redIn, `${at}: minst 2 röda i garderingarna`).toBeGreaterThanOrEqual(2);
      const redSigns = p.events.reduce((n: number, e: any) => n + [0, 1, 2].filter((k) => signColor(e.folk?.[k]) === 'red').length, 0);
      // Räknas per match: två röda tecken på samma match kan aldrig båda gå in (användaren 2026-10-02, match 10 X och 2)
      const redMatchesIn = picks.filter((pk, i) => pk.length > 1 && !red.rules.blueHalves.includes(i) && pk.split('').some((c) => signColor(p.events[i].folk?.[idx(c)]) === 'red')).length;
      if (redMatches >= 6 && redSigns >= 8) expect(redMatchesIn, `${at}: rött på minst 5 matcher (${redMatches} matcher med rött i omgången)`).toBeGreaterThanOrEqual(5);
      // B (risksystemet): rött på minst 6 matcher om det går (användaren 2026-10-02 kväll: "försök ha 6 röda tecken men behåll 2-4")
      if (['B', 'C'].includes(name) && redMatches >= 8 && redSigns >= 10) expect(redMatchesIn, `${at}: ${name} rött på minst 6 matcher (${redMatches} matcher med rött)`).toBeGreaterThanOrEqual(6);
      const redPossible = picks.filter((pk, i) => pk.length > 1 && !red.rules.blueHalves.includes(i) && pk.split('').some((c) => signColor(p.events[i].folk?.[idx(c)]) === 'red')).length;
      expect(red.rules.colorRules.red[1], `${at}: röd max minst 2 när det går`).toBeGreaterThanOrEqual(Math.min(2, redPossible));
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
        red.rules.signMin.forEach((m: number, k: number) => expect(n[k], `${at} rad ${row}: minst ${m} st ${SIGNS[k]}`).toBeGreaterThanOrEqual(m));
        expect(inColorRules(p.events, picks, red.rules, row), `${at} rad ${row}: färgreglerna`).toBe(true);
      }
      // 2-4 spikar, och spik bara på spikbara favoriter
      const spikes = picks.filter((x) => x.length === 1).length;
      let reserve = 0, skrall = 0;
      picks.forEach((pk, i) => {
        if (pk.length !== 1) return;
        // B ärver A:s spikar (2026-10-03) – A har redan bedömt dem (även A:s reserv- och skrällspik)
        if (name === 'B' && p.events[i].systemPick?.signs === pk) return;
        const sp = p.events[i].spik;
        // Skrällspik: tecken med vår chans 35–47 % och minst 3 procentenheter över folket, högst en per kupong
        const sysK = (sp?.used ? sp.sysP : p.events[i].final)[idx(pk)], folkK = p.events[i].folk?.[idx(pk)];
        const strict = sp?.used ? sp.spikbar && pk === sp.fav : true;
        if (!strict && folkK != null && sysK >= SKRALL_SPIK.min - 1e-9 && sysK <= SKRALL_SPIK.max + 1e-9 && sysK - folkK >= SKRALL_SPIK.edge - 1e-9) { skrall++; return; }
        // B: skrällspik "näst på tur" (rules.skrallNext, användaren 2026-10-02 kväll: "saknas aldrig") – inte favoriten
        const nx = red.rules.skrallNext;
        if (['B', 'C'].includes(name) && nx && nx.match === i + 1 && nx.sign === pk) {
          expect(Math.max(...(sp?.used ? sp.sysP : p.events[i].final)), `${at} match ${i + 1}: skräll i tur är inte favoriten`).toBeGreaterThan(sysK);
          skrall++;
          return;
        }
        // Reserv (rules.spikLoose): för få spikbara matcher för minst 2 spikar – då spik på favoriten i systemets procent
        if (red.rules.spikLoose && !(sp?.used && sp.spikbar && pk === sp.fav)) {
          reserve++;
          const sysP = sp?.used ? sp.sysP : p.events[i].final;
          expect(sysP[idx(pk)], `${at} match ${i + 1}: reservspik på favoriten`).toBe(Math.max(...sysP));
        } else if (sp?.used) {
          // Spikbedömning match för match (Stryktipset): spik bara på favoriten och bara om matchen bedömts som spikbar
          expect(pk, `${at} match ${i + 1}: spik på favoriten`).toBe(sp.fav);
          expect(sp.spikbar, `${at} match ${i + 1}: spikbar (justerad chans ${sp.calibrated} >= ${sp.spikMin})`).toBe(true);
          expect(sp.calibrated, `${at} match ${i + 1}`).toBeGreaterThanOrEqual(sp.spikMin - 1e-9);
        } else expect(p.events[i].final[idx(pk)], `${at} match ${i + 1}: spik ${pk} på favorit`).toBeGreaterThanOrEqual((SPIK_MIN_BY_PRODUCT[p.product] ?? 0) - 1e-9);
      });
      expect(spikes, `${at}: minst ${MIN_SPIKES} spikar`).toBeGreaterThanOrEqual(MIN_SPIKES);
      // Reservspikar fyller bara upp till minimum, aldrig fler
      // Undantag (2026-10-02): spikLoose 'max' = systemet gick inte in på 30 000–50 000 kr, strecken minskades (högst 4 spikar)
      if (reserve > 0 && red.rules.spikLoose !== 'max') expect(spikes, `${at}: reservspikar bara upp till ${MIN_SPIKES}`).toBe(MIN_SPIKES);
      expect(spikes, `${at}: högst ${MAX_SPIKES} spikar`).toBeLessThanOrEqual(MAX_SPIKES);
      expect(skrall, `${at}: högst en skrällspik`).toBeLessThanOrEqual(1);
      // B (risksystemet): minst en skrällspik på runt 40 % (användaren 2026-10-02 kväll) om den inte fick släppas (rules.skrallMissing)
      if (['B', 'C'].includes(name) && !red.rules.skrallMissing) expect(skrall, `${at}: ${name} minst en skrällspik`).toBe(1);
      // B helgarderar bara där A inte gör det (A:s halvor utan helgula matcher + högst 1 spikskillnad) – A/B-regeln går före
      const allY = (i: number) => [0, 1, 2].every((k) => { const f = p.events[i].folk?.[k]; return f != null && f < 0.45 && Math.round(f * 100) > 25; });
      const pa = p.events.map((e: any) => e.systemPick?.signs || '');
      const helgCap = name === 'B' ? pa.filter((x: string, i: number) => x.length === 2 && !allY(i)).length + Math.min(1, pa.filter((x: string, i: number) => x.length === 1 && !allY(i)).length) : 13;
      expect(picks.filter((pk: string) => pk.length === 3).length, `${at}: minst ${MIN_HELG} helgarderingar`).toBeGreaterThanOrEqual(Math.min(MIN_HELG, helgCap));
      // Rörliga färgfönster (hela raden = regeln + spikarnas färger): minst 3 breda och runt väntat antal
      expect(red.rules.colorRules.pink, at).toBeUndefined();
      if (red.rules.colorTarget) {
        // Röd (1–3) och grön (3–6) är fasta (användaren 2026-10-02) och följer inte fönstret runt väntat antal
        // Gult är ingen färg i Gambling Cabin sedan 2026-10-03 (ingen regel att kontrollera)
        ['yellow'].filter((c) => !(red.rules.colorsOff || []).includes(c)).forEach((c) => {
          const spikC = picks.filter((pk, i) => pk.length === 1 && signColor(p.events[i].folk?.[idx(pk)]) === c).length;
          // Väntat antal räknas på systemets procent (spikbedömningens justerade när den används), som motorn gör
          const exp = p.events.reduce((sum: number, e: any, i: number) => (red.rules.blueHalves.includes(i) ? sum : sum + [0, 1, 2].reduce((q, k) => q + (signColor(e.folk?.[k]) === c ? (e.spik?.used ? e.spik.sysP : e.final)[k] : 0), 0)), 0);
          const [lo, hi] = red.rules.colorRules[c];
          const wLo = lo + spikC, wHi = hi + spikC;
          // Max minst väntat antal – eller det högsta som går att nå (döda gränser dras in, 2026-10-02)
          if (wHi < exp - 1e-9) expect(hi, `${at} ${c}: max ${wHi} under väntat ${exp.toFixed(1)} fast mer går att nå`).toBe(reachableSpan(p.events, picks, red.rules, c)[1]);
          if (lo > 0) {
            expect(wLo, `${at} ${c}: min högst väntat`).toBeLessThanOrEqual(exp + 1e-9);
            // Smalare än 3 bara när en gräns drogs in till det som går att nå med de andra färgernas gränser
            // (motorn drar in döda gränser, 2026-10-02 – samma rader, ärligare länk)
            if (wHi - wLo < 3) {
              const span = reachableSpan(p.events, picks, red.rules, c);
              // Max över det som går att nå = död gräns så att gult inte blir exakt (2026-10-02)
              expect(lo === span[0] || hi >= span[1], `${at} ${c}: inte snävt (${lo}–${hi}, går att nå ${span.join('–')})`).toBe(true);
            }
          }
        });
      }
      // Favoriten (troligaste tecknet) i varje gardering på minst 10 % av kupongens rader (2026-09-30). Med minst 3
      // helgarderingar får regeln släppas (användaren 2026-10-02) – då står det i kupongen (favMinShare 0).
      expect(red.rules.favMinShare, at).toBeDefined();
      if (red.rules.favMinShare > 0)
      picks.forEach((pk, i) => {
        if (pk.length < 2) return;
        const fav = pk.split('').reduce((b, c) => (p.events[i].final[idx(c)] > p.events[i].final[idx(b)] ? c : b));
        const share = red.rowList.filter((r: string) => r[i] === fav).length / red.rows;
        expect(share, `${at} match ${i + 1}: favoriten ${fav} på minst 10 %`).toBeGreaterThanOrEqual(0.1);
      });
      // Utan mål: färgreglerna är minst 2 breda där spannet tillåter (t.ex. 1-3, inte ett exakt antal)
      if (!red.rules.colorTarget) for (const c of ['green', 'yellow', 'red'].filter((x) => !(red.rules.colorsOff || []).includes(x))) {
        const [lo, hi] = red.rules.colorRules[c];
        const counts = red.rowList.map((r: string) => colorCount(p.events, picks, r, c, red.rules.blueHalves));
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
        return (red.rules.signMin as number[]).every((m, k) => n[k] >= m) && inColorRules(p.events, picks, r, row) && inPayoutRange(r, gcPayout(r, folkProduct(p.events, row)));
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
      // Bara tre färger (användaren 2026-10-03): tecken på 26–44 % (internt gula) är blå (1), aldrig gul cell (2)
      const colorId: Record<string, number> = { yellow: 1, red: 3, green: 4 };
      ['v1', 'vX', 'v2'].forEach((key, k) => {
        // Spikar och blå halvgarderingar blå (id 1)
        const expected = p.events.map((e: any, i: number) => (!picks[i].includes(SIGNS[k]) ? 0 : picks[i].length === 1 || red.rules.blueHalves.includes(i) ? 1 : colorId[e.colors[k]])).join(',');
        expect(q.get(key), `${at} ${key}`).toBe(expected);
      });
      const [m1, mx, m2] = red.rules.signMin;
      expect(q.get('antT'), at).toBe(`1,${m1},13,${mx},13,${m2},13`);
      expect(q.get('utd'), at).toBe(`1,${red.rules.payoutMin},${red.rules.payoutMax ?? 100000000}`);
      // Spikar är blå (id 1, 2026-10-02) och rosa används inte: rosa regeln av
      expect(q.get('pink'), at).toBe('0,0,13');
      // Färgreglerna är aktiva med systemets min/max, aldrig 0-13
      expect(q.get('yellow'), `${at}: ingen gul regel`).toBe('0,0,13');
      expect(red.rules.colorsOff, `${at}: gult är av`).toContain('yellow');
      for (const c of ['red', 'green'].filter((x) => !(red.rules.colorsOff || []).includes(x))) {
        const [lo, hi] = red.rules.colorRules[c];
        expect(q.get(c), `${at} ${c}`).toBe(`1,${lo},${hi}`);
        expect(lo > 0 || hi < 13, `${at} ${c}: inte 0-13`).toBe(true);
      }
    }
  }
});

test('kupong B: eget system (aldrig samma gardering som A, högst 1 spik skiljer) eller delat system', () => {
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
      // Eget B-system: aldrig samma gardering som A, men B ärver A:s spikar – högst 1 match skiljer på spik
      // (användaren 2026-10-03: "A och B får inte ha samma garderingar men max 1 spik skilja", ersätter "inte ens spiken")
      p.events.forEach((e: any, i: number) => {
        if (e.systemPick.signs.length > 1) expect(e.systemPickB.signs, `${at} match ${i + 1}: B har inte samma gardering som A`).not.toBe(e.systemPick.signs);
      });
      const diff = p.events.filter((e: any) => (e.systemPick.signs.length === 1 || e.systemPickB.signs.length === 1) && e.systemPickB.signs !== e.systemPick.signs).length;
      expect(diff, `${at}: högst 1 spik skiljer A och B`).toBeLessThanOrEqual(1);
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

// Domare med låg hemmavinst (användaren 2026-10-02 kväll): flaggad match flyttas mot bortalaget, bara engelska matcher
test('domare med låg hemmavinst: procenten flyttas mot bortalaget och står i analysen', () => {
  for (const p of products) for (const e of p.events) {
    const at = `${p.product} ${p.drawNumber} match ${e.eventNumber}`;
    if (!e.refereeAway) continue;
    expect(e.refereeAway.matches, at).toBeGreaterThan(0);
    if (!e.refereeAway.flag) continue;
    expect(e.refereeAway.matches, at).toBeGreaterThanOrEqual(40);
    expect(e.refereeAway.homeRate, at).toBeLessThanOrEqual(0.38);
    expect(e.finalBase, `${at}: procenten före justeringen sparas`).toBeTruthy();
    // Utan ny tränare: bara domaren flyttar (borta upp, hemma ned)
    if (!e.newCoach) {
      expect(e.final[2], `${at}: bortalaget upp`).toBeGreaterThan(e.finalBase[2]);
      expect(e.final[0], `${at}: hemmalaget ned`).toBeLessThan(e.finalBase[0]);
    }
    expect(e.analysis.some((t: string) => t.includes('bortalaget vunnit oftare')), at).toBe(true);
  }
});

// Ny tränare (användaren 2026-10-02 kväll): lagets 5 första ligamatcher efter ett byte, bara engelska matcher
test('ny tränare: laget med ny tränare får lägre vinstchans och det står i analysen', () => {
  for (const p of products) for (const e of p.events) {
    if (!e.newCoach) continue;
    const at = `${p.product} ${p.drawNumber} match ${e.eventNumber}`;
    expect(e.country, at).toBe('England');
    expect(e.finalBase, at).toBeTruthy();
    for (const [t, k] of [[e.newCoach.home, 0], [e.newCoach.away, 2]] as const) {
      if (!t) continue;
      expect(t.isNew && t.changed, at).toBe(true);
      expect(t.matches, at).toBeLessThan(5);
      if (!e.refereeAway?.flag && !(e.newCoach.home && e.newCoach.away)) expect(e.final[k], `${at}: lägre vinstchans`).toBeLessThan(e.finalBase[k]);
    }
    expect(e.analysis.some((t: string) => t.startsWith('Ny tränare:')), at).toBe(true);
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
