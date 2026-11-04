// Modelltävlingen: fem modeller bakkörs var för sig, 2024-11-01 till 2026-10-31, och jämförs efteråt.
//   npm run modeller                 kör alla (en process per modell) och skriver resultatet
//   node scripts/modeller/kor.mjs --modell m3      en modell, sparar bara dess rader
//   node scripts/modeller/kor.mjs --jamfor         bara jämförelsen, av redan sparade rader
// Rader: data/reports/modeller/<modell>.json. Resultat: data/reports/modeller/resultat.json + docs/analys/modeller.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { TEST_FRAN, TEST_TILL, bakkor, laddaMatcher } from './grund.mjs';
import { parZ, spelFacit, stangning, tipsFacit } from './utvardering.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const UT = path.join(root, 'data', 'reports', 'modeller');
export const MODELLER = { m1: 'm1-nuvarande', m2: 'm2-oddslasaren', m3: 'm3-skottmotorn', m4: 'm4-tvillingar', m5: 'm5-detektiven' };
const AR1_SLUT = '2025-10-31';
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };

async function korEn(kod) {
  const { skapa } = await import(`./${MODELLER[kod]}.mjs`);
  const model = skapa({ root });
  const t0 = Date.now();
  const rader = bakkor(model, laddaMatcher(root));
  fs.mkdirSync(UT, { recursive: true });
  fs.writeFileSync(path.join(UT, `${kod}.json`), JSON.stringify({ kod, namn: model.namn, rader }));
  console.log(`${model.namn}: ${rader.length} matcher tippade på ${Math.round((Date.now() - t0) / 1000)} s`);
}

const korAlla = () => Promise.all(Object.keys(MODELLER).map((kod) => new Promise((res, rej) => {
  const c = spawn(process.execPath, ['--max-old-space-size=4096', fileURLToPath(import.meta.url), '--modell', kod], { stdio: 'inherit' });
  c.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${kod} avslutades med ${code}`))));
})));

function jamfor() {
  const matcher = laddaMatcher(root).filter((m) => m.date >= TEST_FRAN && m.date <= TEST_TILL);
  const byId = new Map(matcher.map((m) => [m.id, m]));
  const tillMatch = (id) => byId.get(id);
  const modeller = Object.keys(MODELLER).map((kod) => JSON.parse(fs.readFileSync(path.join(UT, `${kod}.json`), 'utf8')));
  const kartor = modeller.map((m) => new Map(m.rader.map((r) => [r.id, r])));
  const gemensamma = matcher.filter((m) => kartor.every((k) => k.has(m.id))).map((m) => m.id);
  const ut = { skapad: new Date().toISOString(), test: { fran: TEST_FRAN, till: TEST_TILL, matcher: matcher.length, gemensamma: gemensamma.length }, modeller: [] };

  // Jämförelsepunkter: oddsen vid samma tid (öppning) och stängningen (som ingen modell kan se)
  const oppning = gemensamma.map((id) => {
    const o = byId.get(id).odds, inv = [o.home, o.draw, o.away].map((x) => 1 / x), t = inv[0] + inv[1] + inv[2];
    return { id, p: inv.map((x) => x / t) };
  });
  const medPick = (rader) => rader.map((r) => ({ ...r, pick: r.p.indexOf(Math.max(...r.p)) }));
  const oppF = tipsFacit(medPick(oppning), tillMatch);
  const hemmaF = tipsFacit(gemensamma.map((id) => ({ id, p: [0.46, 0.26, 0.28], pick: 0 })), tillMatch);
  const medStang = gemensamma.filter((id) => stangning(byId.get(id)));
  const stangF = tipsFacit(medPick(medStang.map((id) => ({ id, p: stangning(byId.get(id)) }))), tillMatch);
  ut.jamforelse = { oppning: { ...oppF, per: undefined }, hemma: { ...hemmaF, per: undefined }, stangning: { ...stangF, per: undefined } };

  modeller.forEach((m, ix) => {
    const k = kartor[ix];
    const allaF = tipsFacit(m.rader, tillMatch);
    const gem = gemensamma.map((id) => k.get(id));
    const gemF = tipsFacit(gem, tillMatch);
    const spel = {};
    for (const bok of ['b365', 'max']) {
      const bets = m.rader.filter((r) => r.bets[bok]).map((r) => ({ id: r.id, ...r.bets[bok], date: byId.get(r.id).date }));
      spel[bok] = {
        allt: spelFacit(bets, tillMatch),
        ar1: spelFacit(bets.filter((b) => b.date <= AR1_SLUT), tillMatch),
        ar2: spelFacit(bets.filter((b) => b.date > AR1_SLUT), tillMatch),
      };
    }
    const zOpp = parZ(gemF.per, oppF.per);
    const ar = (fran, till) => tipsFacit(gem.filter((r) => { const d = byId.get(r.id).date; return d >= fran && d <= till; }), tillMatch);
    const a1 = ar(TEST_FRAN, AR1_SLUT), a2 = ar('2025-11-01', TEST_TILL);
    ut.modeller.push({
      kod: m.kod, namn: m.namn, tippade: allaF.n, traffAlla: allaF.traff,
      gemensamt: { traff: gemF.traff, rps: gemF.rps, logLoss: gemF.logLoss, zMotOppning: zOpp, rpsAr1: a1.rps, rpsAr2: a2.rps },
      spel, _per: gemF.per,
    });
  });
  const rangRps = [...ut.modeller].sort((a, b) => a.gemensamt.rps - b.gemensamt.rps);
  const rangRoi = [...ut.modeller].filter((m) => m.spel.b365.allt.n >= 200).sort((a, b) => b.spel.b365.allt.roi - a.spel.b365.allt.roi);
  ut.bastTippa = rangRps[0].namn;
  ut.bastTippaZ = parZ(rangRps[0]._per, rangRps[1]._per);
  ut.bastSpel = rangRoi[0]?.namn ?? null;
  ut.bevisadVinst = ut.modeller.filter((m) => m.spel.b365.allt.n >= 200 && m.spel.b365.allt.roiLag > 0 && m.spel.b365.ar2.roi > 0).map((m) => m.namn);
  // Parvis på varje pars gemensamma matcher (z under -2 = första modellen är säkert bättre)
  const par = (a, b) => {
    const id = [...kartor[a].keys()].filter((x) => kartor[b].has(x));
    const per = (K) => tipsFacit(id.map((x) => K.get(x)), tillMatch).per;
    const pa = per(kartor[a]), pb = per(kartor[b]);
    return { a: modeller[a].namn, b: modeller[b].namn, n: id.length, skillnad: pa.reduce((s, x, i) => s + x - pb[i], 0) / id.length, z: parZ(pa, pb) };
  };
  ut.parvis = [par(1, 4), par(2, 0), par(0, 3), par(1, 0)];
  for (const m of ut.modeller) delete m._per;
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(ut, null, 1));
  fs.writeFileSync(path.join(root, 'docs', 'analys', 'modeller.md'), rapport(ut));
  return ut;
}

const pct = (x, d = 1) => (x == null ? '–' : `${(x * 100).toFixed(d).replace('.', ',')} %`);
const tal = (x, d = 4) => (x == null ? '–' : x.toFixed(d).replace('.', ','));

/** Tabellerna i docs/analys/modeller.md. Skrivs om vid varje körning. */
function rapport(u) {
  const L = [];
  const J = u.jamforelse;
  L.push('# Modelltävlingen', '', `Genererad av npm run modeller, ${u.skapad.slice(0, 10)}. Bakkörning ${u.test.fran} till ${u.test.till}, ${u.test.matcher} spelade matcher. Upplärning från 2023-08. Bara 1X2.`, '');
  L.push('## Kort sagt', '');
  L.push(`- Bäst på att tippa: **${u.bastTippa}**. Skillnad mot tvåan: z ${tal(u.bastTippaZ, 2)} (säker först under -2).`);
  L.push(`- Bäst spelresultat på Bet365 enligt regeln (minst 200 spel): **${u.bastSpel}**.`);
  L.push(`- Bevisad vinst: ${u.bevisadVinst.length ? u.bevisadVinst.join(', ') : '**ingen modell**'}.`, '');
  L.push('## Så läser du det här', '');
  L.push('- **RPS** mäter hur bra procenten är. Lägre är bättre.');
  L.push('- **ROI** är vinst per insatt krona vid fast insats. Går intervallet över noll är vinsten inte bevisad.');
  L.push('- **CLV** är hur mycket priset slog stängningsoddset i snitt.');
  L.push('- **Bet365** är ett riktigt bolag och den försiktiga mätningen. **Bästa pris** är högsta oddset bland alla bolag, som ofta inte går att få.', '');
  L.push(`## Tips på samma ${u.test.gemensamma} matcher`, '', '| Modell | Träff | RPS | RPS år 1 | RPS år 2 | z mot öppningsoddsen |', '|---|---:|---:|---:|---:|---:|');
  for (const m of [...u.modeller].sort((a, b) => a.gemensamt.rps - b.gemensamt.rps)) {
    const g = m.gemensamt;
    L.push(`| ${m.namn} | ${pct(g.traff)} | ${tal(g.rps)} | ${tal(g.rpsAr1)} | ${tal(g.rpsAr2)} | ${tal(g.zMotOppning, 1)} |`);
  }
  L.push(`| *Öppningsodds* | ${pct(J.oppning.traff)} | ${tal(J.oppning.rps)} | | | |`);
  L.push(`| *Stängningsodds (${J.stangning.n} matcher)* | ${pct(J.stangning.traff)} | ${tal(J.stangning.rps)} | | | |`);
  L.push(`| *Alltid hemma* | ${pct(J.hemma.traff)} | ${tal(J.hemma.rps)} | | | |`, '');
  L.push('## Parvis jämförelse', '', '| Modell | Mot | Matcher | RPS-skillnad | z |', '|---|---|---:|---:|---:|');
  for (const p of u.parvis) L.push(`| ${p.a} | ${p.b} | ${p.n} | ${tal(p.skillnad, 5)} | ${tal(p.z, 1)} |`);
  L.push('', 'z under -2 = första modellen är säkert bättre. Mellan -2 och 2 går skillnaden inte att skilja från slump.', '');
  for (const [bok, rubrik] of [['b365', 'Spel på Bet365'], ['max', 'Spel på bästa pris']]) {
    L.push(`## ${rubrik}`, '', '| Modell | Spel | Träff | Snittodds | ROI | 95 %-intervall | CLV | År 1: spel, ROI | År 2: spel, ROI |', '|---|---:|---:|---:|---:|---|---:|---:|---:|');
    for (const m of [...u.modeller].sort((a, b) => b.spel[bok].allt.roi - a.spel[bok].allt.roi)) {
      const { allt: s, ar1, ar2 } = m.spel[bok];
      L.push(`| ${m.namn} | ${s.n} | ${pct(s.traff)} | ${tal(s.snittOdds, 2)} | **${pct(s.roi)}** | ${pct(s.roiLag, 0)} till ${pct(s.roiHog, 0)} | ${pct(s.clv)} | ${ar1.n}, ${pct(ar1.roi)} | ${ar2.n}, ${pct(ar2.roi)} |`);
    }
    L.push('');
  }
  return `${L.join('\n')}\n`;
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const kod = arg('--modell');
  if (kod) await korEn(kod);
  else {
    if (!process.argv.includes('--jamfor')) await korAlla();
    const u = jamfor();
    console.log(rapport(u));
  }
}
