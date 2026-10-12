import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Stryktipset/Europatipset: reglerna räknade om oberoende av scripts/fetch-stryktipset.mjs.
// Läser bara data/stryktipset.json och data/stryktips-history/ (inget nät), så testet är deterministiskt.
// Reglerna (se .cursor/skills/stryktipset/reference.md): filkupongerna A, B och C à 500 rader som Egna rader-fil, 2 starka
// spikar, minst 30 000 kr för 13 rätt per rad (sedan 2026-10-11, inga Gambling Cabin-regler). Varje odds har ett
// Värde/Ej värde-omdöme, varje match har avsparkstid.

const root = path.resolve(__dirname, '..');
const file = process.env.STRYK_DATA_FILE || path.join(root, 'data', 'stryktipset.json'); // STRYK_DATA_FILE: kontroll mot ändrad kopia
const histDir = path.join(root, 'data', 'stryktips-history');

const SIGNS = ['1', 'X', '2'];
const PAYOUT_13 = 0.65 * 0.4;
const VALUE_LEVELS = { low: 0.26, high: 0.4 };
const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
const products: any[] = data?.products ?? [];

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
      // Procentens kalla: odds + modell, eller utan odds modell 50 % + folk 50 % (basis '<modell>+folk'); utan lagmodell bara oddsen ('market')
      expect(e.basis, at).toMatch(/^(club|elo|clubelo)(\+folk)?$|^(market|folk|none|oddset)$/);
      if (e.basis === 'oddset') {
        // Icke-spikbar match tipsad som Oddset: Oddsets 1X2 (normerad), inte vår odds+modell-blandning
        expect(e.tipBasis, at).toBe('oddset');
        expect(e.oddsetTip, at).toBeTruthy();
        expect(e.spik?.used && e.spik.spikbar, `${at}: spikbar match tipsas aldrig som Oddset`).toBeFalsy();
        expect(e.final.reduce((s: number, x: number) => s + x, 0), at).toBeCloseTo(1, 2);
      } else if (e.market && e.model) {
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
      }
      // Grundradens tecken och typ
      for (const pick of [e.systemPick, e.systemPickB].filter(Boolean)) {
        expect(pick.signs, at).toMatch(/^(1|X|2|1X|12|X2|1X2)$/);
        expect(pick.type, at).toBe(['Spik', 'Halvgardering', 'Helgardering'][pick.signs.length - 1]);
      }
    }
  }
});

// Filkuponger (användaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att göra, ta bort alla regler, vill bara
// köra på fil"): A, B och C är Egna rader-filer à 500 rader. Inga färg-, tecken- eller GC-regler.
test('filkuponger: 500 rader, minst 30 000 kr per rad, 2 starka spikar, B utan A:s rader, filen = raderna', async () => {
  const { FILE_RULES } = await import(pathToFileURL(path.join(root, 'gui', 'public', 'stryk-engine.js')).href);
  expect(FILE_RULES).toMatchObject({ rows: 500, payoutMin: 30000, spikes: 2 });
  for (const p of data.products) {
    // Systemets procent som motorn (sysEv): tips som Oddset använder Oddsets procent, annars spikbedömningens
    const sysOf = (e: any) => (e.tipBasis !== 'oddset' && e.spik?.used ? e.spik.sysP : e.final);
    const strength = p.events.map((e: any, i: number) => ({ i, v: Math.max(...sysOf(e)) })).sort((x: any, y: any) => y.v - x.v);
    const list = systems(p);
    expect(list.map((x) => x.name), `${p.product}`).toEqual(['A', 'B', 'C']);
    for (const { name, red, picks } of list) {
      const at = `${p.product} ${p.drawNumber} ${name}`;
      expect(red.gamblingCabinUrl, `${at}: ingen Gambling Cabin-länk`).toBeUndefined();
      expect(red.rules.file, at).toBe(true);
      expect(red.rows, at).toBe(FILE_RULES.rows);
      expect(red.cost, at).toBe(FILE_RULES.rows * (red.rowPrice || 1));
      expect(red.rules.payoutMin, at).toBe(FILE_RULES.payoutMin);
      expect(new Set(red.rowList).size, `${at}: unika rader`).toBe(red.rows);
      for (const row of red.rowList) row.split('').forEach((c: string, i: number) => expect(picks[i], `${at} rad ${row}`).toContain(c));
      // 13 rätt ger minst 30 000 kr på varje rad (motorns formel; strecken är avrundade i filen, därav 2 % marginal)
      const T = red.rules.realTurnover, J = red.rules.jackpot || 0;
      for (const row of red.rowList) {
        const fr = row.split('').reduce((x: number, c: string, i: number) => x * (p.events[i].folk?.[SIGNS.indexOf(c)] ?? p.events[i].final[SIGNS.indexOf(c)]), 1);
        expect((PAYOUT_13 * T + J) / (1 + T * fr), `${at} rad ${row}`).toBeGreaterThanOrEqual(FILE_RULES.payoutMin * 0.98);
      }
      // Filen till Egna rader = exakt raderna
      const lines = red.egnaRader.trim().split('\n');
      expect(lines[0], at).toBe(p.product === 'europatipset' ? 'Europatipset' : 'Stryktipset');
      expect(lines.slice(1).map((l: string) => l.replace(/^E,/, '').split(',').join('')), at).toEqual(red.rowList);
      // 2 starka spikar: omgångens starkaste favoriter, spikade på favoriten (lika styrka som trean: hoppas över)
      for (const { i, v } of strength.slice(0, FILE_RULES.spikes)) {
        if (Math.abs(v - strength[FILE_RULES.spikes].v) < 1e-3) continue;
        const sp = sysOf(p.events[i]);
        expect(picks[i], `${at} match ${i + 1}: stark spik`).toBe(SIGNS[sp.indexOf(Math.max(...sp))]);
      }
    }
    const setA = new Set(p.reduced.rowList);
    expect(p.reducedB.rowList.filter((r: string) => setA.has(r)), `${p.product}: B har inga rader från A`).toEqual([]);
    expect(p.reduced.hitAll, `${p.product}: A är de troligaste raderna`).toBeGreaterThanOrEqual(p.reducedB.hitAll);
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
  // Läses om här: stryktips.spec.ts kan hämta om sidan och historiken parallellt efter att filen lästes in överst
  const current: any[] = JSON.parse(fs.readFileSync(file, 'utf8')).products ?? [];
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
      // Äldre sparade kuponger har Gambling Cabin-länk; filkupongerna (2026-10-11) har ingen
      if (s.gamblingCabinUrl) expect(s.gamblingCabinUrl, at).toContain(`omg=${h.drawNumber}`);
    }
    if (h.saved && h.latest) expect(Date.parse(h.latest.at), f).toBeGreaterThanOrEqual(Date.parse(h.saved.at));
    // Senaste versionen for en oppen omgang ska vara exakt det som visas pa sidan
    const p = current.find((x) => x.product === h.product && x.drawNumber === h.drawNumber && x.open);
    if (p) {
      expect(h.latest.rowList, `${f}: latest = sidans system A`).toEqual(p.reduced.rowList);
      expect(h.latest.picks, f).toEqual(p.events.map((e: any) => e.systemPick.signs));
      if (p.reducedB) expect(h.latestB?.rowList, `${f}: latestB = sidans system B`).toEqual(p.reducedB.rowList);
    }
  }
});
