// Kupongmotor för "Stryktipset B": samma logik som scripts/fetch-stryktipset.mjs (grundrad via DP, Gambling Cabins
// utdelningsreducering, teckenregler, budget 350–400 kr) men med krav som användaren låser själv (1, X, 2, 1X, X2, 12 eller 1X2).
// Körs i webbläsaren eftersom webben är statisk. Ändras reglerna i fetch-stryktipset.mjs ska de ändras här också.
const SIGNS = ["1", "X", "2"];
const PAYOUT_13 = 0.65 * 0.4; // 65 % återbetalning, 40 % av potten till 13 rätt
const BUDGET = { min: 350, max: 400 };
const GRUND_MAX_ROWS = 30000;
const SIGN_MIN = [4, 2, 2];
// Kupong B: minst 3 ettor, 2 kryss och 2 tvåor per rad. 2026-10-03: 3-3-3 uteslöt rätt rad i 51 av 107 omgångar (för få
// kryss eller tvåor, bl.a. 4847 på 247 000 kr). Bakkörning 107 omg: chans 13 rätt 0,087 -> 0,099 %, högre i alla tre perioderna.
export const SIGN_MIN_B = [3, 2, 2];
// Folkets streck: grön >= 45 %, röd 25 % eller lägre (användaren 2026-10-02, avrundat till hela procent), annars gul
const COLOR = { green: 0.45, red: 0.25 };
const UTD_MIN_BY_PRODUCT = { stryktipset: 30000, europatipset: 20000 };
// Kupong B (risksystemet): 50 000–75 000 kr för 13 rätt på båda spelen (användaren 2026-10-02 kväll: "öka B till 50k-75k",
// tidigare 30 000–50 000)
const UTD_MIN_B = 50000, PAYOUT_BAND_B = 75 / 50;
// Kupong C (användaren 2026-09-30): ett helt eget system på 700–850 kr, oberoende av A och B. Bara krav som gäller C
// (scope "C" eller "all") låses där; "both" = A och B.
// Samma regler som A (4-2-2, färgfönster, högst 4 spikar, skräll- och favoritregeln) och minst 30 000 kr för 13 rätt.
const BUDGET_C = { min: 700, max: 850 };
// C är också ett risksystem (användaren 2026-10-02 kväll: "gör om C, mer likt B, 50-75k som gräns där också")
const UTD_MIN_C = 50000;
// Kupong C är skrällsystemet (användaren 2026-10-02 kväll: "C är inte skräll, max vinst är 300k typ"): högsta raden ska ge
// minst 1 miljon. Röd 2–6 och rött på allt fler matcher (6, 7 … 10) tills högsta raden når 1 miljon – 50 000–75 000 kr
// gäller fortfarande först. Stryktipset 4973: rött på 8 matcher gav högsta rad 1,4 milj (14 rader över 1 milj), gränsen
// 73 800 kr, chans 13 rätt 1 på 599 (mot 1 på 261 med rött på 6). Går 1 miljon inte: den med högst högsta rad.
const RISK_C = { redRules: [[2, 6]], minReds: [6, 7, 8, 9, 10], maxRowMin: 1e6 };
// Kupong B mot A (användarens regel 2026-10-02, A är huvudsystemet): aldrig exakt samma tecken på samma match – varken spik,
// halv- eller helgardering. Släpps aldrig. Bara B:s egna krav får ge samma tecken som A.
const GC_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
// Går det inte att bygga ett system med spikarna släpps teckenreglerna först, sedan utdelningsgränsen
const SIGN_LADDER = [SIGN_MIN, [3, 2, 2], [3, 1, 1], [2, 1, 1], [0, 0, 0]];
// Spik bara när favoriten har minst så här mycket (dina egna krav gäller alltid). Backtest 2026-09-30: på Stryktipset
// sprack spikar på favoriter 50–65 % i 40–49 % av fallen; med 0,65 gick A+B från -22 557 till -4 738 kr och C från
// -25 112 till -6 341. På Europatipset blev det sämre, där ingen gräns. Samma som fetch-stryktipset.mjs.
// 2026-09-30 (sent): den fasta 65 %-gränsen är borttagen – varje match bedöms i stället (e.spik från servern, se
// scripts/lib/stryk-calibration.mjs): Stryktipset bygger på den justerade chansen och spikar bara när den är minst 55 %.
const SPIK_MIN_BY_PRODUCT = { stryktipset: 0, europatipset: 0 };
// Spik tillåten: matchens bedömning om den används, annars favoritchansen mot spikMin
// Testvarianter via adressen (2026-10-03, samma som STRYK_SPIK_X_MAX / STRYK_RED_A / STRYK_RED_B i fetch-stryktipset.mjs),
// t.ex. /stryktipset?spikx=0.27&reda=1,4&redb=1,5;2,5. Utan parametrar gäller vanliga regler (och alltid i tester/Node).
const qs = (() => { try { return new URLSearchParams(globalThis.location?.search || ""); } catch { return new URLSearchParams(); } })();
const redQ = (k) => qs.get(k)?.split(";").map((r) => r.split(",").map(Number)).filter((r) => r.length === 2 && r.every(Number.isFinite));
export const VARIANT = { spikX: Number(qs.get("spikx")) || null, redA: redQ("reda")?.[0] || null, redB: redQ("redb")?.length ? redQ("redb") : null };
const spikOk = (e, k, spikMin) => (e.spik?.used ? e.spik.fav === SIGNS[k] && e.spik.spikbar : e.final[k] >= spikMin);
// Kupong C: Europatipset 3-2-2 (backtest: bättre än 4-2-2), Stryktipset samma som A
const SIGN_MIN_C_BY_PRODUCT = { stryktipset: SIGN_MIN, europatipset: [3, 2, 2] };
const SIGN_LADDER_B = [SIGN_MIN_B, [3, 1, 1], [2, 1, 1], [0, 0, 0]];
const PAYOUT_LADDER = [1, 2 / 3, 1 / 3, 0];
// Skräll (rött tecken, folket 25 % eller lägre) i en gardering får finnas på högst 85 % av kupongens rader, så att favoriten
// alltid har minst 15 % (användarens regel 2026-09-29; utdelningsgränsen drev annars skrällen till 91–93 %).
// Gambling Cabin har ingen sådan regel, så den används vid valet av system: länken ger fortfarande samma rader.
const RED_MAX_SHARE = 0.85;
// Favoriten i en gardering får aldrig ligga på under 10 % av raderna, t.ex. X på 90 % (användarens regel 2026-09-30).
// Gäller tillsammans med skrällgränsen och släpps samtidigt som den.
const FAV_MIN_SHARE = 0.1;
// Minsta bredd max - min per färg (2 = t.ex. 1–3 eller 5–7; användaren 2026-09-30: bredd 1 var för snäv).
const COLOR_WIDTH = 2;
// Minst 2 och högst 4 spikar per kupong (användarens regler 2026-09-30 och 2026-10-02). Låser användaren fler spikar,
// eller så många garderingar att 2 spikar inte går, gäller deras krav. Samma som fetch-stryktipset.mjs.
const MIN_SPIKES = 2;
const MAX_SPIKES = 4;
// Minst 3 helgarderingar per kupong (användarens regel 2026-10-02: plats för skrällar). Låser användaren så många matcher
// att 3 inte går gäller deras krav. Samma som fetch-stryktipset.mjs.
const MIN_HELG = 3;
// Minst 5 matcher med rött tecken (folket 25 % eller lägre) i garderingarna (användaren 2026-10-02: "ha med minst 5 röda om det är
// möjligt", tidigare 2). Går det inte (för få röda tecken i omgången, dina krav) blir det så många som går.
// Röd max i färgregeln minst RED_REACH när reglerna optimeras fritt (sista reserv). Samma som fetch-stryktipset.mjs.
const MIN_RED = 5;
// Kupong B (risksystemet): rött på minst 6 matcher om det går (användaren 2026-10-02 kväll: "försök ha 6 röda tecken men behåll
// 2-4" – färgregeln för rött är kvar). Samma som fetch-stryktipset.mjs.
const MIN_RED_B = 6;
let minRed = MIN_RED; // för systemet som byggs just nu (sätts i buildWithLadder)
const RED_REACH = 2;
// Två halvgarderingar blå (Gambling Cabins grundfärg, id 1) och fria från färgreglerna (användaren 2026-10-02). Motorn
// väljer de två säkraste halvgarderingarna utan rött tecken – skrällarna ligger kvar i de färgade. Samma som fetch.
// 2026-10-02 (senare): "2 halvor blå alltid" – exakt 2 blå halvgarderingar, och varje system har minst 2 halvgarderingar.
const BLUE_HALVES = 2;
// Skrällspik (användaren 2026-10-02: "hitta en skrällspik, någon som ligger på runt 40 %"): högst en spik per kupong på ett
// tecken där vår chans är 35–47 % och minst 3 procentenheter över folkets streck (värde – hög utdelning om den går in).
// Räknas som en vanlig spik (2–4 per kupong). Stryktipset 4973: Burton–Huddersfield 2 (46 % mot folkets 38 %) gav lägre
// utdelningsgräns (133 000 -> 104 900 kr) och högre chans (1 på 1 065 -> 1 på 815). Samma som fetch-stryktipset.mjs.
const SKRALL_SPIK = { min: 0.35, max: 0.47, edge: 0.03, count: 1 };
// Kupong B (risksystemet) har minst SKRALL_MIN_B skrällspik (användaren 2026-10-02 kväll: "ha minst en skräll spik som är
// på runt 40 %"). Går det inte (ingen match har en, eller A har den) eller håller B inte 50 000–75 000 kr med den: utan.
const SKRALL_MIN_B = 1;
let skrallMin = 0; // för systemet som byggs just nu (sätts i buildWithLadder)
// "Saknas aldrig, ta en som är näst på tur" (användaren 2026-10-02 kväll): finns ingen skrällspik på 35–47 % för B (A har
// den, eller ingen finns) räknas nästa kandidat ur skrallQueue också som skrällspik ("i:k", sätts i buildWithLadder)
let extraSkrall = new Set();
const isSkrall = (e, i, k) => skrallOk(e, k) || extraSkrall.has(`${i}:${k}`);
// Kandidaterna när ingen skrallOk går: tecken som inte är matchens favorit, inte A:s spik, inte låsta och inte redan
// skrallOk, närmast 35–47 % och med mest värde mot folket (avstånd till fönstret + det som saknas till 3 procentenheter)
export function skrallQueue(events, setsA = null, forced = []) {
  const out = [];
  events.forEach((e, i) => {
    if (forced[i] != null) return;
    const fav = e.final.indexOf(Math.max(...e.final));
    for (const k of [0, 1, 2]) {
      if (k === fav || e.folk?.[k] == null || skrallOk(e, k) || (setsA?.[i]?.length === 1 && setsA[i][0] === k)) continue;
      const p = e.final[k];
      const dist = p < SKRALL_SPIK.min ? SKRALL_SPIK.min - p : p > SKRALL_SPIK.max ? p - SKRALL_SPIK.max : 0;
      out.push({ i, k, p, folk: e.folk[k], score: dist + Math.max(0, SKRALL_SPIK.edge - (p - e.folk[k])) });
    }
  });
  return out.sort((a, b) => a.score - b.score || b.p - a.p);
}
// Så många kandidater i tur provas innan B får gå utan skrällspik
const SKRALL_NEXT_TRIES = 5;
// Kryss oftare i A och B (användaren 2026-10-03: "kryss missas mest"), aldrig i C eller D. Samma som X_TILT i
// fetch-stryktipset.mjs (STRYK_X_HALF/STRYK_X_SPIK/STRYK_X_W/STRYK_X_FOR): half = bonus för halvgardering med X när tecknen
// väljs (1X/X2 före 12 när krysset ligger nära), spik = ingen favoritspik när krysset är minst så här stort, w = krysset
// viktas upp när tecknen väljs. Påverkar bara valet av tecken, inte reduceringen eller utdelningen. Neutralt = { half: 0, spik: 1, w: 1 }.
export const X_TILT = { half: 0, spik: 1, w: 1 };
export const X_TILT_FOR = "AB";
let xTiltOn = false; // sätts i buildWithLadder (base.xTilt)
let xSpikMax = 1; // aktivt kryss-tak för favoritspik (släpps om utdelningsgränsen eller kupongen inte går)
// Täckning vid valet av tecken: kryss uppviktat (w) och halvgardering med kryss + bonus (half)
export function xCover(e, sub, tilt = X_TILT) {
  const base = sub.reduce((s, k) => s + e.final[k] * (k === 1 ? tilt.w : 1), 0);
  return sub.length === 2 && sub.includes(1) ? base + tilt.half : base;
}
// "Kan falla" (användaren 2026-10-03: "ett system som hittar oj denna favorit kan falla"): favoriten (1 eller 2) streckas av
// minst 50 % av folket men har under 55 % chans hos oss. 107 omg PL/CH/L1: 4,4 per omgång, föll 57 % (väntat 52 %). A:s spikar
// på dem föll 27 av 34 (väntat 16, alla tre perioderna). Inget annat (form, svit, tabell, vila, xG m.m., 13 431 favoriter
// 2017–2026) förutsåg fall bättre än oddsen. Samma gränser som FALL i fetch-stryktipset.mjs.
export const FALL = { folk: 0.5, p: 0.55 };
export function canFall(e) {
  if (!e?.final || !e.folk) return null;
  const k = e.final[0] >= e.final[2] ? 0 : 2;
  if ((e.folk[k] ?? 0) < FALL.folk || e.final[k] >= FALL.p) return null;
  return { k, sign: SIGNS[k], side: k === 0 ? "home" : "away", p: e.final[k], folk: e.folk[k], x: e.final[1] };
}
export const skrallOk = (e, k) => e.folk?.[k] != null && e.final[k] >= SKRALL_SPIK.min && e.final[k] <= SKRALL_SPIK.max && e.final[k] - e.folk[k] >= SKRALL_SPIK.edge;
// Färgregler (antal gröna/gula/röda tecken per rad, alla 13 matcher) är aldrig 0–13 (användarens regel 2026-09-30).
// Stryktipset: p.colorBands (rätt rad senaste året, scripts/lib/stryk-color-bands.mjs) är yttre gräns – min/max aldrig
// utanför det som hänt – och röda har max 4 (användaren: snittet är 1,9 men 3–4 röda ger stora vinster; backtest
// 2026-09-30, 38 omg: -8 771 kr mot -19 356 med max 3). Europatipset har inga band (sämre där). Inom gränsen och utan
// band provas min/max upp till COLOR_TRIM steg in från spannet. Samma som i fetch-stryktipset.mjs.
const COLOR_TRIM = 2;
const RED_MAX_OPTIONS = [4];
const COLOR_KEYS = ["green", "yellow", "red"];
// Rörliga färgfönster per omgång (användaren 2026-09-30: inte fasta, inte snäva). Väntat antal gröna/gula/röda i rätt
// rad = summan av våra procent för tecknen med den färgen (alla 13 matcher). Fönstret för hela raden har bredd 3 eller 4
// (t.ex. 5–9) och innehåller alltid det väntade antalet. Spikar är blå i Gambling Cabin och räknas inte där, så
// spikarnas färger dras av (3 gröna spikar: 5–9 -> 2–6 i garderingarna). Samma som fetch-stryktipset.mjs.
const DYN_WIDTHS = [3, 4];
function dynamicRanges(events, grund, colorIdx, blue = new Set()) {
  const spik = [0, 0, 0], exp = [0, 0, 0];
  grund.sets.forEach((set, i) => { if (set.length === 1) spik[colorIdx[i][set[0]]]++; });
  // Blå halvgarderingar räknas inte i färgreglerna, så deras matcher ingår inte i det väntade antalet
  events.forEach((e, i) => { if (!blue.has(i)) [0, 1, 2].forEach((k) => { exp[colorIdx[i][k]] += e.final[k]; }); });
  return [0, 1, 2].map((c) => {
    const out = new Map();
    for (const w of DYN_WIDTHS) {
      for (let a = Math.max(0, Math.ceil(exp[c] - w)); a <= Math.floor(exp[c]); a++) {
        const ga = Math.max(0, a - spik[c]), gb = a + w - spik[c];
        if (gb >= 0) out.set(`${ga},${gb}`, [ga, gb]);
      }
    }
    return [...out.values()];
  });
}

const pickOf = (x) => ({
  signs: x.map((k) => SIGNS[k]).join(""),
  type: x.length === 1 ? "Spik" : x.length === 2 ? "Halvgardering" : "Helgardering",
});

// forced[i] = låsta tecken (t.ex. [0, 1] för 1X) eller null. Övriga matcher: de 1–3 troligaste tecknen.
// avoid = A:s grundrad (kupong B): B får aldrig samma gardering som A på någon match, men ärver A:s spikar – högst
// AB_SPIK_DIFF match får skilja på spik (användaren 2026-10-03: "A och B får inte ha samma garderingar men max 1 spik
// skilja"). Krav i B räknas inte. loose = spik får läggas på favoriten även när matchen inte bedömts som spikbar
// (reserv när minst MIN_SPIKES spikar annars inte går).
// Grundrad mot utdelningsgränsen (2026-10-04): DP:n väljer grundrad efter chansen att rätt rad finns i grundraden, men
// gränsen 30 000–50 000 kr stryker sedan favoritraderna. Extra kandidater från DP:n med tecknens vikt p × folk^−beta
// (tecken folket understreckar väger tyngre) – valet görs ändå efter kupongens chans efter alla regler. Backtest 107 omg:
// A chans 26,75 → 27,46 %, B 15,67 → 16,66 %. Samma som fetch-stryktipset.mjs (GRUND_TILT).
export const GRUND_TILT = [0, 0.3, 0.5];
let grundTilt = 0;
// Andel av matchens vikt som garderingen sub tacker, med vikten p x folk^-beta (beta 0 = vanlig chans)
export function tiltShare(e, sub, beta) {
  if (!beta) return sub.reduce((sum, k) => sum + e.final[k], 0);
  const w = [0, 1, 2].map((k) => e.final[k] * (e.folk?.[k] || e.final[k]) ** -beta);
  return sub.reduce((sum, k) => sum + w[k], 0) / (w[0] + w[1] + w[2]);
}
function grundCandidates(events, maxRows, forced, avoid = null, spikMin = 0, loose = false) {
  const seen = new Set(), out = [];
  const prev = grundTilt;
  try {
    for (const t of GRUND_TILT) {
      grundTilt = t;
      for (const c of grundCandidates1(events, maxRows, forced, avoid, spikMin, loose)) {
        const k = c.sets.map((x) => x.join("")).join("|");
        if (!seen.has(k)) { seen.add(k); out.push(c); }
      }
    }
  } finally { grundTilt = prev; }
  return out;
}
function grundCandidates1(events, maxRows, forced, avoid = null, spikMin = 0, loose = false) {
  const same = (a, b) => a.length === b.length && a.every((x, j) => x === b[j]);
  const fav = (e) => e.final.indexOf(Math.max(...e.final));
  // Reservspik (loose) bara på omgångens SPIK_TOP starkaste favoriter (A och C, inte B) och, som testvariant, när krysset
  // är under spikXMax. Går det inte provas utan reglerna
  const top = spikTopOn && !avoid ? events.map((e) => Math.max(...e.final)).sort((x, y) => y - x)[SPIK_TOP - 1] ?? 0 : 0;
  const canSpik0 = (e, k) => spikOk(e, k, spikMin) || (loose && k === fav(e) && e.final[1] < spikXMax && e.final[k] >= top);
  // Kryss-tak för favoritspik i A och B (X_TILT.spik): spik på 1/2 bara när krysset är under xSpikMax
  const canSpik1 = (e, k) => canSpik0(e, k) && (!xTiltOn || k === 1 || e.final[1] < xSpikMax);
  // Ingen spik på överstreckad favorit (OVER_SPIK) i A och C
  const canSpik = (e, k) => canSpik1(e, k) && !(!avoid && overStreck(e, k));
  // B ärver A:s spik; matcher där någon av dem spikar utan att spikarna är lika räknas (högst AB_SPIK_DIFF)
  const inheritA = (x, i) => x.length === 1 && avoid?.[i]?.length === 1 && avoid[i][0] === x[0];
  const xFolkHere = (e) => xFolkOn && e.final.indexOf(Math.max(...e.final)) !== 1 && xFolk(e);
  const spikDiff = (x, i) => (avoid && forced[i] == null && (x.length === 1 || avoid[i].length === 1) && !inheritA(x, i) ? 1 : 0);
  const options = (e, i) => {
    if (forced[i] != null) return [forced[i]];
    // Ingen helgardering där alla tecken är gula (användaren 2026-10-02: "3 gula helor är exakt samma sak som blå helor")
    // Kryss där folket missar det (X_FOLK, A och B): ingen 1-2 – favorit + X i stället (läggs till i options0)
    const noX12 = (x) => !(xFolkHere(e) && x.length === 2 && !x.includes(1));
    if (allYellowMatch(e)) return options0(e, i).filter((x) => x.length < 3 && noX12(x));
    return options0(e, i).filter(noX12);
  };
  const options0 = (e, i) => {
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    const subs = [1, 2, 3].map((n) => order.slice(0, n).sort());
    // Kryss oftare: halvgardering favorit + X som alternativ, valet görs av xCover i DP:n
    if (xTiltOn && order[0] !== 1 && !subs.some((x) => x.length === 2 && x.includes(1))) subs.push([order[0], 1].sort());
    // Kryss där folket missar det (X_FOLK, A och B): favorit + X i stället för 1-2. Samma som fetch-stryktipset.mjs.
    if (xFolkHere(e) && !subs.some((x) => x.length === 2 && x.includes(1))) subs.push([order[0], 1].sort());
    // Halvgardering favorit + skräll (rött tecken) så att grundraden kan få med röda
    for (const k of [0, 1, 2]) if (k !== order[0] && isRed(e, k) && !subs.some((x) => same(x, [order[0], k].sort()))) subs.push([order[0], k].sort());
    // Skrällspik (runt 40 %, värde mot folket)
    if (skrallCount > 0) for (const k of [0, 1, 2]) if (isSkrall(e, i, k) && !subs.some((x) => same(x, [k]))) subs.push([k]);
    // Andra spikar och halvgarderingar än A: alla tecken och par, inte bara de troligaste
    if (avoid) {
      for (const k of [0, 1, 2]) if (!subs.some((x) => same(x, [k]))) subs.push([k]);
      for (const x of [[0, 1], [0, 2], [1, 2]]) if (!subs.some((y) => same(y, x))) subs.push(x);
      return subs.filter((x) => inheritA(x, i) || (!same(x, avoid[i]) && (x.length > 1 || canSpik(e, x[0]) || (skrallCount > 0 && isSkrall(e, i, x[0])))));
    }
    return subs.filter((x) => x.length > 1 || canSpik(e, x[0]) || (skrallCount > 0 && isSkrall(e, i, x[0])));
  };
  // Nyckel: halv, hel, reservspikar (spik på favorit som inte bedömts som spikbar, aldrig dina krav) och röda tecken i
  // garderingarna (högst MIN_RED räknas), skrällspikar (högst skrallCount) och, i B, matcher där spiken skiljer sig från A
  let dp = new Map([["0,0,0,0,0,0,0", { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f, l, rc, sk, ay, sd] = key.split(",").map(Number);
      for (const sub of options(e, i)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        const nd = sd + spikDiff(sub, i);
        if (nd > AB_SPIK_DIFF) continue;
        // A:s spik i B räknas inte som reservspik (A har redan bedömt den)
        const free = forced[i] == null && sub.length === 1 && !spikOk(e, sub[0], spikMin) && !inheritA(sub, i);
        const skr = free && skrallCount > 0 && isSkrall(e, i, sub[0]);
        const ns = sk + (skr ? 1 : 0), nl = l + (free && !skr ? 1 : 0);
        if (ns > skrallCount || 2 ** nh * 3 ** nf > maxRows) continue;
        const lp = st.lp + Math.log(Math.max(1e-9, xTiltOn ? xCover(e, sub) : tiltShare(e, sub, grundTilt)));
        // Räknas per match (två röda tecken på samma match kan aldrig båda gå in – användaren 2026-10-02)
        const nr = Math.min(minRed, rc + (sub.length > 1 && sub.some((x) => isRed(e, x)) ? 1 : 0));
        // Helgula garderingar bara som de blå halvorna (högst BLUE_HALVES) – fler ger ändå alltid en gul per rad (2026-10-02)
        const nay = ay + (sub.length > 1 && !(forced?.[i] != null) && allYellowMatch(e) ? 1 : 0);
        if (nay > ayLimit) continue;
        const k = `${nh},${nf},${nl},${nr},${ns},${nay},${nd}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub], nl, nr, ns });
      }
    }
    dp = next;
  });
  const maxSpikes = Math.max(MAX_SPIKES, forced.filter((f) => f?.length === 1).length);
  const minSpikes = Math.min(MIN_SPIKES, forced.filter((f) => !(f?.length > 1)).length);
  const spikes = (st) => st.sets.filter((x) => x.length === 1).length;
  // Reservspikar bara för att nå minst MIN_SPIKES: med reservspik blir det exakt så många spikar
  // B: helgardering bara där A inte helgarderar (aldrig samma gardering) – på A:s halvor och högst en av A:s spikar
  // (AB_SPIK_DIFF). Har A så många helor att 3 inte går i B blir det så många som går (A/B-regeln går före, 2026-10-03)
  // Inte på matcher där alla tecken ligger på 26–44 % (där blir det aldrig helgardering)
  const helgOk = (i) => forced[i]?.length === 3 || (forced[i] == null && !allYellowMatch(events[i]));
  const bHelgMax = avoid ? avoid.filter((x, i) => x.length === 2 && helgOk(i)).length + Math.min(AB_SPIK_DIFF, avoid.filter((x, i) => x.length === 1 && helgOk(i)).length) : 13;
  const minHelg = Math.min(MIN_HELG, bHelgMax, forced.filter((f) => f == null || f.length === 3).length);
  // Minst BLUE_HALVES halvgarderingar (de blir blå); låser användaren så mycket att det inte går gäller deras krav
  const minHalf = Math.min(BLUE_HALVES, forced.filter((f) => f == null || f.length === 2).length);
  const ok = (st) => spikes(st) >= minSpikes && spikes(st) <= maxSpikes && (st.nl === 0 || spikes(st) === minSpikes || loose === "max") && st.sets.filter((x) => x.length === 3).length >= minHelg && st.sets.filter((x) => x.length === 2).length >= minHalf && (st.ns || 0) >= skrallMin;
  const okList = [...dp.values()].filter(ok);
  // Kryss-taket för favoritspik släpps först om ingen kupong går (för få matcher med lågt kryss)
  if (!okList.length && loose && xTiltOn && xSpikMax < 1) {
    const prev = xSpikMax; xSpikMax = 1;
    try { return grundCandidates1(...arguments); } finally { xSpikMax = prev; }
  }
  // Går det inte med högst BLUE_HALVES helgula garderingar (för få spikbara matcher) släpps den gränsen
  if (!okList.length && loose && (spikXMax < 1 || (spikTopOn && !avoid))) {
    const prev = [spikXMax, spikTopOn]; spikXMax = 1; spikTopOn = false;
    try { return grundCandidates1(...arguments); } finally { [spikXMax, spikTopOn] = prev; }
  }
  if (!okList.length && ayLimit < 13 && loose) {
    ayLimit++;
    try { return grundCandidates1(...arguments); } finally { ayLimit--; }
  }
  // Minst MIN_RED röda i garderingarna; går det inte (dina krav) så många som går
  const most = okList.reduce((m, st) => Math.max(m, st.nr), 0);
  return okList.filter((st) => st.nr >= most).map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: st.sets.reduce((h, x, i) => h * x.reduce((sum, k) => sum + events[i].final[k], 0), 1), sets: st.sets, picks: st.sets.map(pickOf), ayMax: ayLimit,
  }));
}

const isRed = (e, k) => signColor(e.folk?.[k]) === "red";
let ayLimit = BLUE_HALVES;
let spikXMax = VARIANT.spikX || 1; // kryss-tak för reservspikar (1 = av)
// Reservspik (favorit som inte bedomts spikbar) bara pa omgangens SPIK_TOP starkaste favoriter, i A och C (anvandaren
// 2026-10-03: "kanske kan fa en annan spik istallet"). Backtest 107 omg: svaga reservspikar satt 34-43 % medan en
// starkare garderad favorit hade suttit 68-79 %. Med top 4: spiktraff A 53 -> 56 %, C 41 -> 47 %, chans C 0,21 -> 0,27 %,
// 11+ ratt C 12 -> 15 omg. B blev samre (44,5 mot 46,5 %, B far inte valja A:s tecken) och har kvar gamla regeln.
// Gar det inte provas utan regeln. data/stryktips-backtest-*-spiktop4.json, docs/lardomar/slutsatser.md
export const SPIK_TOP = 4; // A och C; B (avoid satt) har kvar gamla regeln. Samma som fetch-stryktipset.mjs
let spikTopOn = true; // false = reserv när regeln gör kupongen omöjlig
// A och B (användaren 2026-10-03): aldrig samma gardering, högst 1 spik får skilja – B ärver A:s spikar. Samma som fetch.
export const AB_SPIK_DIFF = 1;
// Skrällspik i A (35–47 %). Samma som SKRALL_A i fetch-stryktipset.mjs. B och C har alltid sin.
export const SKRALL_A = true;
let skrallCount = SKRALL_SPIK.count; // för systemet som byggs just nu (sätts i buildWithLadder)
// Ingen spik på favorit som folket streckar minst OVER_SPIK över vår chans (A och C, 0 = av). Samma som fetch.
export const OVER_SPIK = 0;
let overSpikOn = false;
export const overStreck = (e, k) => OVER_SPIK > 0 && k !== 1 && k === e.final.indexOf(Math.max(e.final[0], e.final[2])) && (e.folk?.[k] ?? 0) - e.final[k] >= OVER_SPIK && overSpikOn;
// Kryss där folket missar det (A och B): favorit + X i stället för 1-2 när folket ger krysset under folk och vi minst p.
// På sedan 2026-10-03 (backtest 107 omg: A oförändrad, B chans 14,22 -> 14,39 %), samma som STRYK_X_FOLK i fetch.
export const X_FOLK = { on: true, folk: 0.2, p: 0.22 };
let xFolkOn = false;
export const xFolk = (e) => (e.folk?.[1] ?? 1) < X_FOLK.folk && e.final[1] >= X_FOLK.p;
const allYellowMatch = (e) => [0, 1, 2].every((k) => signColor(e.folk?.[k]) === "yellow");
// Blå garderingar (index): blå i länken och fria från färgreglerna.
// Exakt BLUE_HALVES halvgarderingar blå ("2 halvor blå alltid", 2026-10-02): helgula först, sedan de säkraste utan rött
//    tecken så att skrällarna ligger kvar i de färgade. Fler helgula halvor blir gula (en gul per rad, styr ingenting).
// Kryss i annan färg än rött (användaren 2026-10-03: "en av de två blå halvorna har alltid X"). Folket streckar X 17–30 %
// (median 24 %, aldrig 45 %), så X är rött i 60 % av matcherna och delar A:s 1–3 röda platser med skrällarna. Backtest
// 107 omg: X saknades i grundraden 43 % av gångerna (1: 9 %, 2: 29 %). Gäller A och B, aldrig C och D. Samma som fetch.
export const BLUE_X = true;
let blueXOn = false; // sätts i buildWithLadder (base.blueX)
// blueX = true tvingar regeln (tester), annars gäller systemet som byggs just nu
export function blueHalves(events, sets, blueX = blueXOn) {
  const allYellow = (set, i) => set.length > 1 && set.every((k) => signColor(events[i].folk?.[k]) === "yellow");
  // Inga blå helgarderingar (användaren 2026-10-02: "helor behöver vi inte ha någon som är blå")
  const blue = new Set();
  const cover = ({ i, set }) => set.reduce((s, k) => s + events[i].final[k], 0);
  const red = ({ i, set }) => (set.some((k) => isRed(events[i], k)) ? 1 : 0);
  const yel = ({ i, set }) => (allYellow(set, i) ? 0 : 1);
  sets.map((set, i) => ({ i, set })).filter(({ set }) => set.length === 2)
    .sort((a, b) => yel(a) - yel(b) || red(a) - red(b) || cover(b) - cover(a) || a.i - b.i)
    .slice(0, BLUE_HALVES).forEach(({ i }) => blue.add(i));
  // Minst en blå halva med kryss i A och B (blueXOn): saknas den tar en halva med X den sista blå platsen – helst utan
  // rött tecken (röda behövs i röd-regeln, B röd 1–5/2–5), sedan störst kryss
  if (blueX && blue.size && ![...blue].some((i) => sets[i].includes(1))) {
    const xi = sets.map((set, i) => ({ i, set })).filter(({ set }) => set.length === 2 && set.includes(1))
      .sort((a, b) => red(a) - red(b) || events[b.i].final[1] - events[a.i].final[1] || a.i - b.i)[0]?.i;
    if (xi != null) { blue.delete([...blue].at(-1)); blue.add(xi); }
  }
  return blue;
}
function signColor(folkP) {
  if (folkP == null) return "yellow";
  return folkP >= COLOR.green ? "green" : Math.round(folkP * 100) <= COLOR.red * 100 ? "red" : "yellow";
}

// Färgregler. all = rader sorterade på utdelning (högst först), r.c = [gröna, gula, röda] över alla 13 matcher.
// Kombinationerna rangordnas efter chansen i de `target` första raderna som klarar reglerna; vid lika vinner snävast.
function colorRuleOptions(all, minRows, target, bands = null, fixed = null, triples = null, redAtLeast = 0) {
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const r of all) for (let c = 0; c < 3; c++) { if (r.c[c] < lo[c]) lo[c] = r.c[c]; if (r.c[c] > hi[c]) hi[c] = r.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    const w = Math.min(COLOR_WIDTH, hi[c] - lo[c]);
    const band = bands?.[COLOR_KEYS[c]];
    if (band) {
      const l = Math.min(Math.max(band.range[0], lo[c]), hi[c]), h = Math.max(Math.min(band.range[1], hi[c]), l);
      const his = COLOR_KEYS[c] === "red" ? [...new Set(RED_MAX_OPTIONS.map((m) => Math.min(Math.max(m, l), h)))] : null;
      for (let a = l; a <= Math.min(l + COLOR_TRIM, h); a++) {
        for (const b of his || Array.from({ length: Math.min(COLOR_TRIM, h - l) + 1 }, (_, j) => h - j)) if (b - a >= Math.min(w, h - l)) out.push([a, b]);
      }
      if (out.length) return out;
    }
    for (let a = lo[c]; a <= Math.min(lo[c] + COLOR_TRIM, hi[c]); a++) for (let b = Math.max(hi[c] - COLOR_TRIM, a + w); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  for (const [g, y, rd] of fittedRules(ranges, triples, redAtLeast)) {
    let n = 0, sum = 0;
    for (const r of all) {
      if (r.c[0] < g[0] || r.c[0] > g[1] || r.c[1] < y[0] || r.c[1] > y[1] || r.c[2] < rd[0] || r.c[2] > rd[1]) continue;
      sum += r.p;
      if (++n >= target) break;
    }
    if (n >= minRows) opts.push({ rule: [g, y, rd], score: sum, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => b.score - a.score || a.width - b.width);
}
const fitsColors = (c, r) => c[0] >= r[0][0] && c[0] <= r[0][1] && c[1] >= r[1][0] && c[1] <= r[1][1] && c[2] >= r[2][0] && c[2] <= r[2][1];
// Färgtripletter [gröna, gula, röda] som en rad i grundraden kan få (spikar är blå och räknas inte).
// colorIdx[i][k] = färgindex för tecken k i match i.
export function colorTriples(sets, colorIdx, blue = new Set()) {
  let out = new Set(["0,0,0"]);
  sets.forEach((set, i) => {
    if (set.length < 2 || blue.has(i)) return;
    const next = new Set();
    for (const key of out) {
      const c = key.split(",").map(Number);
      for (const ci of new Set(set.map((k) => colorIdx[i][k]))) { const d = c.slice(); d[ci]++; next.add(d.join(",")); }
    }
    out = next;
  });
  return [...out].map((k) => k.split(",").map(Number));
}
// Färgreglerna ska hänga ihop (användaren 2026-10-02: 13 garderingar med gula 8–11 och gröna 4–7 lämnar bara 1 tecken
// till rött, så "röda 0–2" kunde aldrig nås). Röd max går före – skrällarna ger de stora vinsterna: räcker raden inte till
// sänks min för gult eller grönt (den med högst min först) ett steg i taget tills röd max går att nå. Sedan dras varje
// min/max in till det som faktiskt går att nå i grundraden, så att Gambling Cabin-länken aldrig har döda gränser.
// null = ingen rad klarar reglerna. Samma som fetch-stryktipset.mjs.
export function fitColorRule(rule, triples, redAtLeast = 0) {
  const r = rule.map((x) => x.slice());
  r[2][1] = Math.max(r[2][1], redAtLeast);
  const inside = () => triples.filter((t) => fitsColors(t, r));
  const redTop = () => inside().reduce((m, t) => Math.max(m, t[2]), -1);
  const want = Math.min(r[2][1], triples.reduce((m, t) => Math.max(m, t[2]), 0));
  while (redTop() < want) {
    const c = r[0][0] >= r[1][0] ? 0 : 1;
    if (r[c][0] > 0) r[c][0]--; else if (r[1 - c][0] > 0) r[1 - c][0]--; else break;
  }
  const f = inside();
  if (!f.length) return null;
  return [0, 1, 2].map((c) => [Math.min(...f.map((t) => t[c])), Math.max(...f.map((t) => t[c]))]);
}
// Färger som finns i garderingarna (någon rad kan få minst ett sådant tecken). Övriga är av i länken.
// Gult finns aldrig (användaren 2026-10-03: bara blå, grön och röd i Gambling Cabin – gula tecken är blå utan regel)
export const colorsPresent = (triples) => [0, 1, 2].map((c) => c !== 1 && (!triples || triples.some((t) => t[c] > 0)));
// Färgreglerna är aldrig ett exakt antal (min = max) och två färger har aldrig samma fönster (användaren 2026-10-02:
// "färger ska aldrig vara samma antal, 2-2 t.ex." – gul 2–2, röd 2–2, grön 3–3 i Gambling Cabin). Färger som inte finns
// i garderingarna räknas inte.
export function colorRuleOk(rule, present = [true, true, true]) {
  const on = [0, 1, 2].filter((c) => present[c]);
  return on.every((c) => rule[c][1] > rule[c][0]) && on.every((c, j) => on.slice(j + 1).every((d) => rule[d].join() !== rule[c].join()));
}
// Kandidaterna efter fitColorRule, utan dubbletter (flera fönster kan bli samma regel). Bara regler som klarar
// colorRuleOk – finns ingen sådan (t.ex. en enda färgad gardering) får de andra vara med.
// Fasta färgregler för A, B och C (användaren 2026-10-02): röd alltid 1–3 (folket 25 % eller lägre), grön alltid 4–6.
// Gult väljs fritt men aldrig exakt och aldrig samma fönster som grönt eller rött. Röd/grön står kvar även om gränsen inte
// går att nå. fixedColors stängs av bara som sista reserv när ingen kupong alls går att bygga (står i kupongen).
// 2026-10-03 (natt): A röd 1–2 (förut 1–3), samma som fetch-stryktipset.mjs (30 iterationer: A chans 23,98 -> 26,71 % med CUT_AIM)
const RED_RULE = VARIANT.redA || [1, 2];
// Reserv när risk-rödregeln inte håller utdelningsgränsen (rules.redFallback): B 1–2 som A, C kvar på 1–3. Samma som fetch.
// B provar 1–2 och sedan 1–3 innan färgerna får optimeras fritt (Stryktipset 4973: med bara 1–2 fick B fria färger)
export const RED_FALLBACK = { B: [[1, 2], [1, 3]], C: [[1, 3]] };
// Kupong B är risksystemet (användaren 2026-10-02 kväll: "kör 1-4 eller 2-4 röda ... inte mer än 2 röda som minst",
// "behåll A som det är"): röd 1–4 eller 2–4, den som ger högst chans väljs. Backtest 107 omg (2023/24–2026/27): rätt rad i
// omgångar över 500 000 kr hade i snitt 5,2 röda och 34 av 37 fler än 3. A och C har kvar 1–3. Samma som fetch-stryktipset.mjs.
// 2026-10-03: röd max 5 (1-5/2-5). Backtest 107 omg: B netto -1 807 -> +4 033 kr, 12 rätt 4 -> 5, samma chans, gränsen
// höll lika ofta (106/107). Med 1-4 stoppades B 4847 (247 257 kr, 5 roda). data/stryktips-backtest-*-redB5.json
export const RED_RULES_B = VARIANT.redB || [[1, 5], [2, 5]];
let redRules = [RED_RULE]; // rödreglerna för systemet som byggs just nu (sätts i buildWithLadder)
// Skyddet "3 röda + resten gröna" (redGreenRows) gäller med 3 röda även i B. Med B:s röd max 4 fick B släppa reglerna
// (Stryktipset 4973) och gränsen hamnade på 111 000 kr (Europatipset 2613); raderna med 3 röda ryms ändå i 1–4/2–4.
// "3 röda + resten gröna" i B och C, "2 röda + resten gröna" i A (röd max 2): högst 3, aldrig över röd max
const redGreenTop = () => Math.min(3, Math.max(...redRules.map((r) => r[1])));
const redRuleText = () => redRules.map((r) => r.join("–")).join(" eller ");
const GREEN_RULE = [3, 6]; // 3–6 sedan 2026-10-02 (användaren: "begränsa så grön blir 3-6"), tidigare 4–6
let fixedColors = true;
let yellowFull = true; // false = gult får skära (reserv för att hålla 30 000–50 000 kr)
// "signs" = varken färg- eller teckenregler får stoppa raderna i redGreenRows, "colors" = bara färgreglerna (teckenreglerna
// skulle behöva gå under 2-1-1, t.ex. Europatipset där 3 röda bortavinster + gröna hemmavinster ger rader utan X),
// false = inget krav (sista reserv)
let redGreenFull = "signs";
// Användaren 2026-10-02: "får jag in 3 röda så kan jag få in alla gröna också". Raderna med röd max (3, eller så många
// röda garderingar som finns) där varje annan färgad gardering går grönt (gult/valfritt där grönt saknas, blå halvor och
// spikar valfria) måste alla vara med i kupongen. Grön max får alltså aldrig stoppa dem – annars minskas systemet.
// colorIdx[i][k] = färgindex (0 grön, 1 gul, 2 röd). Raderna som teckensträngar. Samma som fetch-stryktipset.mjs.
// Tillägg 2026-10-02: "om 3 röda går in och en gul då kan jag inte få 13 rätt" – även raderna där högst YELLOW_EXTRA av de
// andra garderingarna går gult i stället för grönt ska med, och de ska klara teckenreglerna (inte bara färgreglerna).
const YELLOW_EXTRA = 1;
export function redGreenRows(sets, colorIdx, blue = new Set(), redTop = 3, yellowExtra = YELLOW_EXTRA) {
  const colored = (i) => sets[i].length > 1 && !blue.has(i);
  const top = Math.min(redTop, sets.filter((set, i) => colored(i) && set.some((k) => colorIdx[i][k] === 2)).length);
  if (top < 1) return [];
  const out = [], row = [];
  const walk = (i, reds, extra) => {
    if (reds + sets.slice(i).filter((set, j) => colored(i + j) && set.some((k) => colorIdx[i + j][k] === 2)).length < top) return;
    if (i === sets.length) { if (reds === top) out.push(row.join("")); return; }
    const set = sets[i];
    // [tecken, röd, gul i stället för grön]
    let opts = set.map((k) => [k, 0, 0]);
    if (colored(i)) {
      const green = set.filter((k) => colorIdx[i][k] === 0), other = set.filter((k) => colorIdx[i][k] === 1);
      opts = [...set.filter((k) => colorIdx[i][k] === 2 && reds < top).map((k) => [k, 1, 0]), ...green.map((k) => [k, 0, 0]),
        ...other.map((k) => [k, 0, green.length ? 1 : 0]).filter((o) => extra + o[2] <= yellowExtra)];
    }
    for (const [k, r, y] of opts) { row.push(SIGNS[k]); walk(i + 1, reds + r, extra + y); row.pop(); }
  };
  walk(0, 0, 0);
  return out;
}
// Färgtripletterna [gröna, gula, röda] för redGreenRows (spikar och blå halvor räknas inte)
const redGreenCache = new WeakMap();
export function redGreenColors(sets, colorIdx, blue = new Set(), rows = redGreenRows(sets, colorIdx, blue)) {
  const out = new Map();
  for (const row of rows) {
    const c = [0, 0, 0];
    [...row].forEach((x, i) => { if (sets[i].length > 1 && !blue.has(i)) c[colorIdx[i][SIGNS.indexOf(x)]]++; });
    out.set(c.join(), c);
  }
  return [...out.values()];
}
function fittedRules(ranges, triples, redAtLeast = 0) {
  const present = colorsPresent(triples);
  if (fixedColors) {
    const out = new Map();
    // En regel per rödregel (A: 1–3, B: 1–4 och 2–4); rangordningen sker där reglerna används
    for (const RR of redRules) {
    const G = present[0] ? GREEN_RULE : [0, 0], R = present[2] ? RR : [0, 0];
    // Gult skär aldrig bort rader (användaren 2026-10-02: "får jag in mina röda vill jag kunna få in alla gröna och
    // gula"): gulregeln är hela spannet som går att nå med grön 3–6 och röd 1–3. Full täckning även för grönt gick inte
    // ihop med grön 4–6, 350–400 kr och 30 000–50 000 kr (Stryktipset 4973: ingen grundrad klarade det).
    if (triples && yellowFull) {
      const ins = triples.filter((tr) => fitsColors(tr, [G, [0, 13], R]));
      if (!ins.length) continue;
      let yy = [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))];
      if (yy[0] === yy[1] && present[1]) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      if (colorRuleOk(rule, present)) out.set(rule.join(";"), rule);
      continue;
    }
    for (const y of [...ranges[1], [0, 13]]) {
      const ins = triples ? triples.filter((tr) => fitsColors(tr, [G, y, R])) : null;
      if (ins && !ins.length) continue;
      let yy = ins ? [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))] : y.slice();
      // Bara ett antal gula går att nå: max +1 är en död gräns (samma rader) så att gult inte blir ett exakt antal
      if (yy[0] === yy[1] && present[1] && !(triples || []).some((tr) => tr[1] === yy[1] + 1 && fitsColors(tr, [G, [0, 13], R]))) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      if (colorRuleOk(rule, present)) out.set(rule.join(";"), rule);
    }
    }
    return [...out.values()];
  }
  const out = new Map();
  for (const g of ranges[0]) for (const y of [[0, 13]]) for (const rd of ranges[2]) {
    const rule = triples ? fitColorRule([g, y, rd], triples, redAtLeast) : [g, y, rd];
    if (rule) out.set(rule.join(";"), rule);
  }
  const all = [...out.values()];
  const good = all.filter((r) => colorRuleOk(r, present));
  return good.length ? good : all;
}
// Högst så många färgkombinationer provas per grundrad (bästa först); resten ger sällan något när skrällregeln fallerar
const MAX_COLOR_OPTIONS = 60;
// Exakt utdelningsgräns (användaren 2026-09-30: "30k, inte mindre, inte mer"): gränsen i Gambling Cabin-länken är alltid
// spelets regel och budgeten nås med grundrad och färgregler i stället för att höja gränsen. Går det inte höjs gränsen
// som reserv, och kupongen säger det. Raderna grupperas per färgtriplett så att många kombinationer kan provas snabbt.
// Samma som fetch-stryktipset.mjs.
// 2026-09-30 (sent) av efter backtest; 2026-10-02 på igen (användaren: "minsta utdelning ska vara 30k, kan diffa lite"):
// gränsen i länken ligger mellan regeln och PAYOUT_BAND x regeln (30 000–50 000 kr). Går det inte höjs den som reserv.
const EXACT_FLOOR = true;
// 2026-10-02 (senare): "30–50k är minsta utdelningen, inget max" – gränsen i länken 30 000–50 000 kr.
const PAYOUT_BAND = 50 / 30;
const COLOR_TRIM_EXACT = 3;
// Var i budgeten gränsen läggs (andel av vägen från min till max rader). Raderna närmast gränsen är de troligaste (lägst
// utdelning), så fler rader ger högre chans; marginalen behövs för att Gambling Cabin räknar med aktuella streck.
// Samma som CUT_AIM i fetch-stryktipset.mjs.
export const CUT_AIM = 0.9; // sedan 2026-10-03 (natt), ca 395 av 350–400 rader
const cutAim = (minRows, maxRows) => Math.round(minRows + CUT_AIM * (maxRows - minRows));
// cap = högsta gräns i länken: en regel duger när raderna över cap ryms i budgeten och alla rader (över regeln) räcker
function exactColorOptions(all, minRows, maxRows, fixed = null, triples = null, cap = Infinity, redAtLeast = 0) {
  const groups = new Map();
  for (const r of all) {
    const k = r.c.join(",");
    const g = groups.get(k) || { c: r.c, n: 0, p: 0, nHi: 0, pHi: 0 };
    g.n++; g.p += r.p;
    if (r.payout >= cap) { g.nHi++; g.pHi += r.p; }
    groups.set(k, g);
  }
  const gl = [...groups.values()];
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const g of gl) for (let c = 0; c < 3; c++) { if (g.c[c] < lo[c]) lo[c] = g.c[c]; if (g.c[c] > hi[c]) hi[c] = g.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    // Gränsen 30 000–50 000 kr går före färgbredden (2026-10-02): alla fönster med min < max provas, även bredd 1
    for (let a = lo[c]; a <= hi[c]; a++) for (let b = a + Math.min(1, hi[c] - lo[c]); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  const mid = cutAim(minRows, maxRows);
  for (const rule of fittedRules(ranges, triples, redAtLeast)) {
    const [g, y, rd] = rule;
    let n = 0, p = 0, nHi = 0, pHi = 0;
    for (const x of gl) if (fitsColors(x.c, rule)) { n += x.n; p += x.p; nHi += x.nHi; pHi += x.pHi; }
    // Chansen i ungefär de rader som behålls: allt över cap plus en andel av raderna mellan regeln och cap
    const part = n > nHi ? Math.min(1, Math.max(0, (mid - nHi) / (n - nHi))) : 0;
    if (n >= minRows && nHi <= maxRows) opts.push({ rule, score: pHi + (p - pHi) * part, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => b.score - a.score || a.width - b.width);
}

function gcPayoutFloor(gcTurnover, realTurnover, jackpot, payoutMin) {
  if (payoutMin <= 0) return 0;
  const fStar = ((PAYOUT_13 * realTurnover + (jackpot || 0)) / payoutMin - 1) / realTurnover;
  return fStar > 0 ? (PAYOUT_13 * gcTurnover + (jackpot || 0)) / (1 + gcTurnover * fStar) : Infinity;
}

// Andel av raderna med ett rött tecken i en gardering som är högst (1 = ingen gräns)
function redShareOk(events, grund, kept, redMax, favMin = FAV_MIN_SHARE) {
  if (redMax >= 1 && favMin <= 0) return true;
  return events.every((e, i) => {
    const set = grund.sets[i];
    if (set.length < 2) return true;
    const share = (k) => kept.filter((r) => r.row[i] === k).length / kept.length;
    // Favoriten (troligaste tecknet) i garderingen minst FAV_MIN_SHARE av raderna
    const fav = set.reduce((b, k) => (e.final[k] > e.final[b] ? k : b));
    return share(fav) >= favMin && (redMax >= 1 || set.every((k) => signColor(e.folk?.[k]) !== "red" || share(k) <= redMax));
  });
}

// Raderna i en grundrad (efter tecken- och utdelningsregler) räknas en gång per grundrad och regeluppsättning och
// återanvänds när reservordningen provar färg- och skrällregler igen (annars upp till 40 omräkningar).
const walkCache = new WeakMap();
function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin, budget, redMax = 1, favMin = FAV_MIN_SHARE, colorTarget = true, exactFloor = EXACT_FLOOR, payoutBand = PAYOUT_BAND }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const T = turnover;
  // Exakt: gränsen i Gambling Cabins formel är regeln själv. Reserv: verklig utdelning >= regeln, gränsen höjs till budgeten.
  const floor = exactFloor ? payoutMin : gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  // exactFloor: true = gräns 30 000–50 000 kr, "near" = lägsta gräns som går (närmast regeln), false = höjd. Aldrig tak.
  const near = exactFloor === "near";
  const cap = exactFloor === true ? payoutMin * payoutBand : Infinity;
  const colorIdx = events.map((e) => [0, 1, 2].map((k) => COLOR_KEYS.indexOf(signColor(e.folk?.[k]))));
  const blue = blueHalves(events, grund.sets);
  // Röd max + resten gröna (redGreenRows): färgreglerna får aldrig stoppa de raderna. Grön 3–6 är fast, så faller deras
  // gröna utanför provas nästa grundrad (färre gröna garderingar = mindre system). Utdelnings- och teckenreglerna gäller.
  // Räknas en gång per grundrad (samma grundrad provas i många steg i reservordningen)
  let rg = redGreenCache.get(grund);
  if (!rg) {
    const rows = redGreenRows(grund.sets, colorIdx, blue, redGreenTop());
    rg = { colors: redGreenColors(grund.sets, colorIdx, blue, rows), signs: [0, 1, 2].map((k) => Math.min(13, ...rows.map((row) => [...row].filter((x) => x === SIGNS[k]).length))) };
    redGreenCache.set(grund, rg);
  }
  const must = fixedColors && redGreenFull ? rg.colors : [];
  if (must.some((t) => t[0] < GREEN_RULE[0] || t[0] > GREEN_RULE[1])) return null;
  // ... och teckenreglerna (minst så många 1/X/2) får inte heller stoppa dem
  if (must.length && redGreenFull === "signs" && rg.signs.some((n, k) => n < signMin[k])) return null;
  const cacheKey = `${signMin.join()}|${floor}|${T}|${realTurnover}|${jackpot}`;
  const byGrund = walkCache.get(grund) || new Map();
  walkCache.set(grund, byGrund);
  let all = byGrund.get(cacheKey);
  if (!all) {
  all = [];
  const row = [], cnt = [0, 0, 0], cc = [0, 0, 0];
  const walk = (i, p, f) => {
    if (i === events.length) {
      const payout = (PAYOUT_13 * T + jackpot) / (1 + T * f);
      if (payout >= floor && cnt[0] >= signMin[0] && cnt[1] >= signMin[1] && cnt[2] >= signMin[2]) {
        all.push({ row: row.slice(), p, payout, real: (PAYOUT_13 * realTurnover + jackpot) / (1 + realTurnover * f), c: cc.slice() });
      }
      return;
    }
    for (const k of grund.sets[i]) {
      const ci = grund.sets[i].length > 1 && !blue.has(i) ? colorIdx[i][k] : -1; // spikar och blå halvor räknas inte
      row.push(k); cnt[k]++; if (ci >= 0) cc[ci]++;
      walk(i + 1, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]));
      row.pop(); cnt[k]--; if (ci >= 0) cc[ci]--;
    }
  };
  walk(0, 1, 1);
  all.sort((a, b) => b.payout - a.payout);
  byGrund.set(cacheKey, all);
  }
  if (all.length < minRows) return null;
  // Färgreglerna: bästa rörliga fönstret, annars bästa fria kombinationen där utdelningsgränsen går att lägga
  const target = colorTarget ? dynamicRanges(events, grund, colorIdx, blue) : null;
  if (target && target.some((x) => !x.length)) return null;
  const triples = colorTriples(grund.sets, colorIdx, blue);
  const mid = Math.round((minRows + maxRows) / 2);
  const options = near ? nearColorOptions(all, minRows, maxRows, target, triples, RED_REACH)
    : exactFloor ? exactColorOptions(all, minRows, maxRows, target, triples, cap, RED_REACH) : colorRuleOptions(all, minRows, Math.round((minRows + maxRows) / 2), null, target, triples, RED_REACH);
  for (const opt of options.filter((o) => must.every((t) => fitsColors(t, o.rule))).slice(0, MAX_COLOR_OPTIONS)) {
    const pool = all.filter((r) => fitsColors(r.c, opt.rule));
    // Närmast regeln: sikta på övre delen av budgeten så att gränsen blir så låg som möjligt
    const cut = cutRows(pool, floor, minRows, maxRows, cap, near ? maxRows - Math.round((maxRows - minRows) / 5) : null);
    if (!cut) continue;
    const kept = cut.kept;
    if (!redShareOk(events, grund, kept, redMax, favMin)) continue;
    const hit = kept.reduce((sum, r) => sum + r.p, 0);
    const ev = kept.reduce((sum, r) => sum + r.p * r.real, 0);
    kept.sort((a, b) => b.p - a.p);
    return {
      grundRows: grund.rows, afterPayout: all.length, rows: kept.length, cost: kept.length * rowPrice, rowPrice,
      hitAll: hit, grundHit: grund.hitAll, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: {
        payoutMin: Math.max(0, cut.t), payoutMinReal: payoutMin, payoutExact: exactFloor, jackpot, realTurnover, signMin, turnover: T,
        colorRules: { green: opt.rule[0], yellow: opt.rule[1], red: opt.rule[2] }, colorTarget: Boolean(target), colorsOff: COLOR_KEYS.filter((_, c) => !colorsPresent(triples)[c]), blueHalves: [...blue].sort((a, b) => a - b),
        redGreenFull: must.length ? redGreenFull : false,
      },
      rowList: kept.map((r) => r.row.map((k) => SIGNS[k]).join("")),
      rowP: kept.map((r) => r.p), rowReal: kept.map((r) => r.real), rowPayout: kept.map((r) => r.payout),
    };
  }
  return null;
}

// Utdelningsgränsen på raderna som klarar tecken- och färgreglerna (all sorterad på utdelning, högst först)
function cutRows(all, floor, minRows, maxRows, cap = Infinity, aim = null) {
  if (all.length < minRows) return null;
  // Gränsen läggs i ett glapp mellan två rader (jämnt belopp) så nära mitten av budgeten som möjligt. Gambling Cabin
  // räknar med de aktuella strecken, och ändras de efter hämtningen flyttas rader över gränsen (ett streck från 27 till
  // 26 % gav 394 -> 404 rader). Mitten ger marginal åt båda hållen. Samma val som i fetch-stryktipset.mjs.
  let cut = null;
  if (all.length >= minRows && all.length <= maxRows && all[all.length - 1].payout >= floor * 1.02) cut = { n: all.length, t: Math.ceil(floor) };
  const mid = aim ?? cutAim(minRows, maxRows);
  // Med tak (exakt gräns): ett jämnt belopp mellan regeln och taket, gärna i ett glapp mellan två rader
  for (const win of [Math.round((maxRows - minRows) / 5), Math.max(maxRows - mid, mid - minRows)]) {
    for (const gap of [1.02, 1.01, 1.003, 1]) {
      for (let d = 0; d <= win && !cut; d++) {
        for (const n of d ? [mid - d, mid + d] : [mid]) {
          if (cut || n < minRows || n > maxRows || n >= all.length) continue;
          const above = all[n - 1].payout, below = all[n].payout;
          if (above < below * gap) continue;
          const m = Math.sqrt(above * below);
          for (const step of [5000, 1000, 500, 100, 10, 1]) {
            const t = Math.round(m / step) * step;
            if (t <= above / Math.sqrt(gap) && t >= below * Math.sqrt(gap) && t >= floor && t <= cap) { cut = { n, t }; break; }
          }
        }
      }
      if (cut) break;
    }
    if (cut) break;
  }
  if (!cut) return null;
  return { t: cut.t, kept: all.slice(0, cut.n) };
}

// Lägsta möjliga gräns (användaren 2026-10-02: "max utdelning ska vara obegränsad"): när 30 000–50 000 kr ger för många
// rader väljs den färgregel där gränsen kan ligga närmast regeln, utan tak. needed = utdelningen på första raden som inte
// ryms i budgeten (gränsen måste ligga över den). all är sorterad på utdelning, högst först.
function nearColorOptions(all, minRows, maxRows, fixed = null, triples = null, redAtLeast = 0) {
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const r of all) for (let c = 0; c < 3; c++) { if (r.c[c] < lo[c]) lo[c] = r.c[c]; if (r.c[c] > hi[c]) hi[c] = r.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    const w = Math.min(COLOR_WIDTH, hi[c] - lo[c]);
    for (let a = lo[c]; a <= Math.min(lo[c] + COLOR_TRIM_EXACT, hi[c]); a++) for (let b = Math.max(hi[c] - COLOR_TRIM_EXACT, a + w); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  for (const rule of fittedRules(ranges, triples, redAtLeast)) {
    const [g, y, rd] = rule;
    let n = 0, p = 0, needed = 0;
    for (const r of all) {
      if (!fitsColors(r.c, rule)) continue;
      if (n === maxRows) { needed = r.payout; break; }
      n++; p += r.p;
    }
    if (n >= minRows) opts.push({ rule, needed, score: p, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
  }
  return opts.sort((a, b) => a.needed - b.needed || b.score - a.score || a.width - b.width);
}

// exclude = rader som redan spelas (räknas inte i poängen), avoid = grundrad som inte får väljas igen
function bestReduced(events, candidates, opts, exclude = null, avoid = null) {
  const score = (red) => red.rowList.reduce((sum, row, i) => (exclude?.has(row) ? sum : sum + red.rowP[i]), 0);
  const avoidKey = avoid && avoid.map((x) => x.join("")).join("|");
  let best = null;
  for (const g of candidates) {
    if (g.rows < opts.budget.min) continue;
    if (avoidKey && g.sets.map((x) => x.join("")).join("|") === avoidKey) continue;
    const red = reduceSystem(events, g, opts);
    if (!red) continue;
    const sc = score(red);
    // Lägsta gräns som går (exactFloor "near"): grundraden med lägst gräns vinner, vid lika högst chans
    const lower = opts.exactFloor === "near" && best && red.rules.payoutMin !== best.reduced.rules.payoutMin;
    if (!best || (lower ? red.rules.payoutMin < best.reduced.rules.payoutMin : sc > best.score)) best = { system: g, reduced: red, score: sc };
  }
  return best;
}

function gamblingCabinUrl(p, events, sets, reduced) {
  // Bara tre färger (användaren 2026-10-03): blå, grön och röd. Gula tecken (26–44 %) är blå och har ingen regel.
  const colorId = { yellow: 1, red: 3, green: 4 };
  // Spikar (ett tecken) blå (1, Gambling Cabins grundfärg – användaren 2026-10-02), annars färg efter folkets streck.
  // Blått har ingen färgregel i GC (den blå knappen är teckenreglerna), så färgreglerna räknar bara garderingarna.
  // Blå halvgarderingar (rules.blueHalves) också blå: fria från färgreglerna.
  const r = reduced.rules;
  const blue = new Set(r.blueHalves || []);
  const col = (k) => events.map((e, i) => (!sets[i].includes(k) ? 0 : sets[i].length === 1 || blue.has(i) ? 1 : colorId[signColor(e.folk?.[k])])).join(",");
  // Färger som inte finns i garderingarna är av (annars "0–0", ett exakt antal)
  const cr = (c) => (r.colorRules?.[c] && !r.colorsOff?.includes(c) ? `1,${r.colorRules[c][0]},${r.colorRules[c][1]}` : "0,0,13");
  const q = [
    `spel=${p.product}`, `omg=${p.drawNumber}`, `datum=${(p.regCloseTime || "").slice(0, 10)}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${r.signMin[0]},13,${r.signMin[1]},13,${r.signMin[2]},13`,
    "yellow=0,0,13", `red=${cr("red")}`, `green=${cr("green")}`, "pink=0,0,13",
    `utd=1,${r.payoutMin},${r.payoutMax ?? 100000000}`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join("&")}`;
}

// Ordningen mellan regeln om 3 röda + resten gröna (redGreenFull) och utdelningsgränsen (exactFloor). Utan egna krav går
// röd + grön först; med egna krav går gränsen 30 000–50 000 kr först. Med egna krav provas lägsta gräns som går och höjd
// gräns först när inte heller fria färger (utan grön 3–6 och röd 1–3, sista reserven) håller 30 000–50 000 kr.
export function floorOrder(locked) {
  const rgs = ["signs", "colors", false];
  const floors = EXACT_FLOOR ? [true, "near", false] : [false];
  if (!locked) return rgs.flatMap((rg) => floors.map((f) => [rg, f]));
  return (fixedColors ? [true] : floors).flatMap((f) => rgs.map((rg) => [rg, f]));
}

// Prova reglerna i ordning tills ett system går att bygga. relaxed = vilka regler som fick släppas.
// payoutLadder = [1] håller utdelningsgränsen fast (kupong B).
// base.redRules = rödreglerna för systemet (B: RED_RULES_B), annars RED_RULE
function buildWithLadder(events, forced, base, budget, exclude, opts = {}) {
  const prev = [redRules, skrallMin, extraSkrall, minRed, xTiltOn, xSpikMax, blueXOn, skrallCount, xFolkOn, overSpikOn];
  // A (base.sys "A") utan skrällspik om SKRALL_A är av; X_FOLK i A och B (xTilt); OVER_SPIK i A och C (inte B)
  skrallCount = base.sys === "A" && !SKRALL_A ? 0 : SKRALL_SPIK.count;
  xFolkOn = Boolean(base.xTilt) && X_FOLK.on;
  overSpikOn = !opts.avoid;
  blueXOn = Boolean(base.blueX);
  minRed = base.minRed || MIN_RED;
  redRules = base.redRules || [RED_RULE];
  skrallMin = base.skrallMin || 0;
  extraSkrall = base.extraSkrall || new Set();
  xTiltOn = Boolean(base.xTilt) && (X_TILT.half > 0 || X_TILT.spik < 1 || X_TILT.w !== 1);
  xSpikMax = xTiltOn ? X_TILT.spik : 1;
  try {
    const best = buildWithLadderRules(events, forced, base, budget, exclude, opts);
    // Kryss-taket för spik får aldrig kosta utdelningsgränsen: håller den inte provas utan taket
    if (xTiltOn && xSpikMax < 1 && best?.reduced?.rules?.payoutExact !== true) {
      xSpikMax = 1;
      const alt = buildWithLadderRules(events, forced, base, budget, exclude, opts);
      if (alt?.reduced?.rules?.payoutExact === true || !best) return alt;
    }
    return best;
  } finally { [redRules, skrallMin, extraSkrall, minRed, xTiltOn, xSpikMax, blueXOn, skrallCount, xFolkOn, overSpikOn] = prev; }
}
function buildWithLadderRules(events, forced, base, budget, exclude, { avoid = null, payoutLadder = PAYOUT_LADDER, signLadder = SIGN_LADDER } = {}) {
  const free = forced.reduce((n, f) => n * (f == null ? 3 : f.length), 1);
  const b = { min: Math.min(budget.min, free * base.rowPrice), max: budget.max };
  const candCache = new Map(); // samma grundradskandidater (och deras rader i walkCache) för alla steg i reservordningen
  // Ordning (2026-09-30): färgfönstren släpps först, sedan skräll- och favoritregeln, sedan spikbedömningen (spik på
  // favoriten för att nå minst 2 spikar, 2026-10-02) och sist
  // tecken- och utdelningsreglerna (de släpps bara när dina krav gör kupongen omöjlig). Tidigare provades alla tecken- och
  // utdelningssteg innan skrällregeln släpptes – upp till 40 omräkningar och 17 sekunder på Stryktipset.
  // Favoritregeln (minst 10 %) släpps aldrig i första varvet – bara om ingen kupong alls går att bygga (andra varvet)
  const band = base.payoutBand || PAYOUT_BAND;
  const bandTxt = `${Math.round(base.payoutMin).toLocaleString("sv-SE")}–${Math.round(base.payoutMin * band).toLocaleString("sv-SE")} kr`;
  for (const shareLevels of [[[RED_MAX_SHARE, FAV_MIN_SHARE], [1, FAV_MIN_SHARE]], [[1, 0]]]) {
  // Utdelningsgränsen 30 000–50 000 kr är viktigare än färgfönster, skrällgräns, spikbedömning och teckenregler (användaren
  // 2026-10-02: "30–50k är minsta utdelningen"): sedan lägsta gräns som går, sist höjd gräns – aldrig tak
  // Röd max + resten gröna (redGreenRows) går före utdelningsgräns och allt annat – hellre ett mindre system
  // (användaren 2026-10-02: "minska systemet om du måste"). Släpps bara om ingen kupong alls går att bygga.
  // Egna krav (användaren 2026-10-02: "även om jag väljer själv vill jag ha min utdelning mellan 30–50k"): med låsta
  // matcher går gränsen 30 000–50 000 kr före regeln om 3 röda + resten gröna – egna skrällspikar gör annars alla rader
  // dyra och gränsen hamnade på 200 000 kr och mer. Utan krav gäller ordningen ovan.
  for (const [rg, exactFloor] of floorOrder(forced.some((f) => f != null))) {
  redGreenFull = rg;
  for (const pf of payoutLadder) {
  // Gult skär aldrig (användaren 2026-10-03: bara tre färger i Gambling Cabin – blå, grön och röd; gult är blått utan regel)
  for (const yf of [true]) {
  yellowFull = yf;
  for (const sm of signLadder) {
  // Teckenreglerna sänks aldrig under 2-1-1 för att få med raderna (då hellre bara färgkravet)
  if (rg === "signs" && sm.some((v, k) => v < [2, 1, 1][k]) && !signLadder[0].some((v, k) => v < [2, 1, 1][k])) continue;
  // Med fast gräns 30 000–50 000 kr provas teckenreglerna ned till 2-1-1, aldrig helt utan (då hellre lägsta gräns som går)
  if (exactFloor === true && sm.every((v) => v === 0) && signLadder.length > 1) continue;
  // "max" (användaren 2026-10-02: "om du inte får in systemet får du minska strecken på annat håll"): går gränsen
  // 30 000–50 000 kr inte att hålla får fler favoriter spikas, upp till MAX_SPIKES – bara med fast gräns
  for (const loose of exactFloor === true ? [false, "max"] : [false, true]) {
  if (!candCache.has(loose)) candCache.set(loose, grundCandidates(events, GRUND_MAX_ROWS, forced, avoid, base.spikMin || 0, loose));
  const cands = candCache.get(loose);
  for (const [redMax, favMin] of shareLevels) {
    for (const colorTarget of [true, false]) {
      const best = bestReduced(events, cands, { ...base, signMin: sm, payoutMin: base.payoutMin * pf, budget: b, redMax, favMin, colorTarget, exactFloor }, exclude, avoid);
      if (best) {
        const relaxed = [];
        if (EXACT_FLOOR && !exactFloor && pf === 1) relaxed.push(`utdelningsgränsen ${bandTxt} gav inte ${budget.min}–${budget.max} kr – den höjdes till ${Math.round(best.reduced.rules.payoutMin).toLocaleString("sv-SE")} kr i länken`);
        if (exactFloor === "near") relaxed.push(`utdelningsgränsen ${bandTxt} gav för många rader – lägsta gräns som går är ${Math.round(best.reduced.rules.payoutMin).toLocaleString("sv-SE")} kr (inget tak)`);
        if (!colorTarget) relaxed.push("färgfönstren runt det väntade antalet gick inte att hålla – färgerna optimerades fritt");
        if (redMax === 1) relaxed.push(`skrällgränsen (rött tecken på högst ${Math.round(RED_MAX_SHARE * 100)} % av raderna) gick inte att hålla`);
        if (favMin === 0) relaxed.push(`favoriten på minst ${Math.round(FAV_MIN_SHARE * 100)} % av raderna gick inte att hålla`);
        if (sm !== signLadder[0]) relaxed.push(`teckenreglerna sänktes till ${sm.join("-")}`);
        if (pf !== 1) relaxed.push(pf === 0 ? "utdelningsgränsen togs bort" : `utdelningsgränsen sänktes till ${Math.round(base.payoutMin * pf).toLocaleString("sv-SE")} kr`);
        if (b.min < budget.min) relaxed.push(`kraven lämnar bara ${free} möjliga rader`);
        // yf är alltid true sedan 2026-10-03 (bara tre färger – gult skär aldrig)
        if (loose === "max") relaxed.push(`för att hålla reglerna (${bandTxt}, högst 2 helgula garderingar) minskades strecken med spik på favoriter (högst ${MAX_SPIKES} spikar)`);
        else if (loose) relaxed.push(`för få matcher bedömdes som spikbara – spik på favoriten för att få minst ${MIN_SPIKES} spikar`);
        if (!rg) relaxed.push(`färgreglerna stoppar några rader med ${redGreenTop()} röda + resten gröna – det gick inte att undvika`);
        else if (rg === "colors") relaxed.push(`teckenreglerna stoppar några rader med ${redGreenTop()} röda + högst 1 gul (t.ex. rader utan X) – att släppa dem hade krävt teckenregler under 2-1-1`);
        yellowFull = true;
        redGreenFull = "signs";
        best.reduced.rules.yellowFull = yf;
        return { ...best, relaxed };
      }
    }
  }
  }
  }
  yellowFull = true;
  }
  }
  }
  redGreenFull = "signs";
  }
  // Sista reserv: ingen kupong alls med grön 3–6 och rödregeln (A 1–3, B 1–5/2–5) – färgerna optimeras fritt och kupongen säger det
  if (fixedColors) {
    fixedColors = false;
    try {
      const r = buildWithLadder(events, forced, base, budget, exclude, { avoid, payoutLadder, signLadder });
      if (r) r.relaxed.push(`grön 3–6 och röd ${redRuleText()} gick inte att hålla – färgerna optimerades fritt`);
      return r;
    } finally { fixedColors = true; }
  }
  return null;
}

// Risksystemen B och C (användaren 2026-10-02 kväll): röd 1–4/2–4, rött på minst MIN_RED_B matcher, utdelning
// base.payoutMin x PAYOUT_BAND_B (50 000–75 000 kr) och alltid en skrällspik. Gränsen går före risken (gränsen "får inte
// röras"): röd 1–4/2–4 gav för många rader över taket i 21 av 107 omgångar. Ordning: skrällspik på 35–47 % (risk, sedan
// röd 1–3), sedan nästa skrällkandidat i tur (skrallQueue, "saknas aldrig") på samma sätt, sist utan skrällspik – första som
// håller gränsen. rules.redFallback = röd 1–3, rules.skrallNext = kandidaten i tur, rules.skrallMissing = ingen skrällspik.
// Håller inget gränsen blir det det första som gick. avoidSets = A:s grundrad som B inte får upprepa (C: null).
// riskC = RISK_C (kupong C): röd 2–6 och rött på allt fler matcher tills högsta raden når maxRowMin (rules.maxRowPayout)
function buildRisk(name, events, forced, base, budget, exclude, opts, avoidSets, riskC = null) {
  if (riskC) {
    let top = null;
    for (const mr of riskC.minReds) {
      const r = buildRiskOnce(name, events, forced, { ...base, minRed: mr }, budget, exclude, opts, avoidSets, riskC.redRules);
      if (!r) continue;
      const maxRow = Math.max(...r.reduced.rowReal);
      r.reduced = { ...r.reduced, rules: { ...r.reduced.rules, maxRowPayout: Math.round(maxRow), minRedMatches: mr, ...(maxRow >= riskC.maxRowMin ? {} : { maxRowShort: true }) } };
      const holds = r.reduced.rules.payoutExact === true;
      if (holds && maxRow >= riskC.maxRowMin) return r;
      if (!top || (holds && top.reduced.rules.payoutExact !== true) || (holds === (top.reduced.rules.payoutExact === true) && maxRow > top.reduced.rules.maxRowPayout)) top = r;
    }
    if (top?.reduced.rules.maxRowShort) top.relaxed.push(`högsta raden blev ${top.reduced.rules.maxRowPayout.toLocaleString("sv-SE")} kr – 1 miljon gick inte att nå med 50 000–75 000 kr`);
    return top;
  }
  return buildRiskOnce(name, events, forced, base, budget, exclude, opts, avoidSets, RED_RULES_B);
}
function buildRiskOnce(name, events, forced, base, budget, exclude, opts, avoidSets, riskRed) {
  const b0 = { minRed: MIN_RED_B, ...base, payoutBand: PAYOUT_BAND_B };
  const txt = `${Math.round(b0.payoutMin).toLocaleString("sv-SE")}–${Math.round(b0.payoutMin * PAYOUT_BAND_B).toLocaleString("sv-SE")} kr`;
  const pc = (x) => `${Math.round(x * 100)} %`;
  const queue = skrallQueue(events, avoidSets, forced).slice(0, SKRALL_NEXT_TRIES);
  const fb = (RED_FALLBACK[name] || RED_FALLBACK.C).map((x) => [x]);
  const steps = [null, ...queue].flatMap((c) => [[riskRed, SKRALL_MIN_B, c], ...fb.map((x) => [x, SKRALL_MIN_B, c])]).concat([[riskRed, 0, null], ...fb.map((x) => [x, 0, null])]);
  // Första som håller gränsen med fasta färger vinner; annars den första som håller gränsen, annars den första
  let best = null, exact = null;
  for (const [redRulesX, sk, c] of steps) {
    const r = buildWithLadder(events, forced, { ...b0, redRules: redRulesX, skrallMin: sk, extraSkrall: c ? new Set([`${c.i}:${c.k}`]) : null }, budget, exclude, opts);
    if (!r) continue;
    r.reduced = { ...r.reduced, rules: { ...r.reduced.rules, payoutBand: PAYOUT_BAND_B, ...(redRulesX === riskRed ? {} : { redFallback: true }), ...(sk ? {} : { skrallMissing: true }),
      ...(c ? { skrallNext: { match: c.i + 1, sign: SIGNS[c.k], p: Math.round(c.p * 1000) / 1000, folk: Math.round(c.folk * 1000) / 1000 } } : {}) } };
    if (redRulesX !== riskRed) r.relaxed.push(`${txt} gick inte med röd ${riskRed.map((x) => x.join("–")).join(" eller ")} – ${name} fick röd ${redRulesX[0].join("–")}`);
    if (c) r.relaxed.push(`ingen skrällspik på 35–47 % gick i ${name} – ${name} tog nästa på tur: match ${c.i + 1} ${SIGNS[c.k]} (${pc(c.p)}, folket ${pc(c.folk)})`);
    if (!sk) r.relaxed.push(`ingen skrällspik (runt 40 %) gick att få in i ${name}`);
    if (!best) best = r;
    if (r.reduced.rules.payoutExact === true) {
      if (!r.relaxed.some((t) => t.includes("färgerna optimerades fritt"))) return r;
      if (!exact) exact = r;
    }
  }
  return exact || best;
}

// Blått X får inte kosta andra regler (användaren 2026-10-03): kupongen byggs först med en blå halva med X. Släpper den
// några regler byggs den också utan, och den släpper färre regler (utdelningsgränsen räknas som en) vinner – lika: blått X.
// Exempel Stryktipset 4973 B: med blått X föll röd 1–5/2–5 till 1–3 och "3 röda + gröna" fick stoppas; utan höll båda.
const relaxScore = (r) => (r ? r.relaxed.length + (r.reduced.rules.payoutExact === true ? 0 : 1) : Infinity);
// Kupongen med blått X väljs bara om den har en blå halva med X: annars kunde motorn välja en sämre grundrad helt utan
// X-halvor så att regeln aldrig gällde (backtest Stryktipset 4834: A utan X-halvor, sedan gick B inte att bygga).
const hasBlueX = (r) => Boolean(r?.reduced.rules.blueHalves?.some((i) => r.system.sets[i].includes(1)));
const hasXHalf = (r) => Boolean(r?.system.sets.some((x) => x.length === 2 && x.includes(1)));
function withBlueX(name, build) {
  if (!BLUE_X) return build(false);
  const r = build(true);
  if (hasBlueX(r) && relaxScore(r) === 0) return r;
  const r0 = build(false);
  if (!r0 || (hasBlueX(r) && relaxScore(r) <= relaxScore(r0))) return r;
  if (hasXHalf(r0)) {
    r0.reduced = { ...r0.reduced, rules: { ...r0.reduced.rules, blueXOff: true } };
    r0.relaxed.push(`ingen blå halva med X i ${name} – med den hade fler regler fått släppas`);
  }
  return r0;
}

// Krav från webben: { signs: "1X", scope } (äldre sparade spikar: { sign: "1", scope }) -> sorterade teckenindex
export function kravSigns(k) {
  const txt = k?.signs ?? k?.sign ?? "";
  const idx = SIGNS.map((s, i) => (txt.includes(s) ? i : -1)).filter((i) => i >= 0);
  return idx.length ? idx : null;
}

/**
 * Genererar kupong A och B för en omgång.
 * krav: { [eventNumber]: { signs: "1" | "1X" | "X2" | "12" | "1X2" | ..., scope: "both" | "A" | "B" | "C" | "D" | "all" } }
 * "both" = A och B, "all" = alla fyra.
 * D = användarens fasta system (4 spikar, 4 halvor, 5 helor, röd 1–3, grön 1–3 (26–35 %), 4-3-3, 30 000–50 000 kr), fritt från A, B och C.
 * A = bästa systemet med A:s krav (350–400 kr, spelets utdelningsgräns).
 * C = skrällsystemet (700–850 kr, 50 000–75 000 kr, röd 2–6, högsta rad minst 1 miljon), fritt från A och B.
 * B = risksystemet med B:s krav: röd 1–5 eller 2–5, minst 30 000 kr för 13 rätt utan tak, teckenregler 3-2-2, aldrig samma gardering som A och högst 1 spik
 *     som skiljer (B ärver A:s spikar), valt så att det täcker så mycket som möjligt av det A saknar. Alla kuponger har 2–4 spikar.
 */
export function generateCoupons(p, krav) {
  // Systemen byggs på matchens justerade procent (spikbedömningen) när den används, annars på modellens
  const events = p.events.map((e) => (e.spik?.used && e.spik.sysP ? { ...e, final: e.spik.sysP } : e));
  const forcedFor = (sys) => events.map((e) => {
    const k = krav[e.eventNumber];
    const on = k && (k.scope === sys || k.scope === "all" || (k.scope === "both" && (sys === "A" || sys === "B")));
    return on ? kravSigns(k) : null;
  });
  const fA = forcedFor("A"), fB = forcedFor("B");
  const rules = p.reduced?.rules || {};
  const base = {
    rowPrice: p.reduced?.rowPrice || 1,
    turnover: rules.turnover || GC_TURNOVER[p.product] || 1e7,
    realTurnover: rules.realTurnover || rules.turnover || GC_TURNOVER[p.product] || 1e7,
    jackpot: rules.jackpot || 0,
    payoutMin: rules.payoutMinReal || UTD_MIN_BY_PRODUCT[p.product] || 30000,
    colorBands: p.colorBands || null,
    spikMin: SPIK_MIN_BY_PRODUCT[p.product] ?? 0,
  };
  const finish = (best, sys, forced) => ({
    ...best.reduced,
    rules: { ...best.reduced.rules, ...(best.system.ayMax > BLUE_HALVES ? { allYellowMax: best.system.ayMax } : {}) },
    picks: best.system.picks.map((x, i) => ({ ...x, locked: forced[i] != null })),
    relaxed: best.relaxed,
    gamblingCabinUrl: gamblingCabinUrl(p, events, best.system.sets, best.reduced),
    system: sys,
  });
  // Kryss-reglagen (X_TILT) gäller A och B, aldrig C och D
  // Blått X (BLUE_X) gäller A och B, aldrig C och D
  const a = withBlueX("A", (blueX) => buildWithLadder(events, fA, { ...base, xTilt: X_TILT_FOR.includes("A"), blueX, sys: "A" }, BUDGET, null));
  const b = withBlueX("B", (blueX) => buildRisk("B", events, fB, { ...base, xTilt: X_TILT_FOR.includes("B"), blueX, payoutMin: Math.max(UTD_MIN_B, base.payoutMin) }, BUDGET, a ? new Set(a.reduced.rowList) : null,
    { avoid: a?.system.sets ?? null, payoutLadder: [1], signLadder: SIGN_LADDER_B }, a?.system.sets ?? null));
  const A = a && finish(a, "A", fA), B = b && finish(b, "B", fB);
  // A+B tillsammans: gemensamma rader och chansen att någon av kupongerna tar 13 rätt
  let overlap = 0, unionHit = A ? A.hitAll : 0;
  if (B) {
    const setA = new Set(A?.rowList || []);
    B.rowList.forEach((row, i) => { if (setA.has(row)) overlap++; else unionHit += B.rowP[i]; });
  }
  // Kupong C: skrällsystemet (röd 2–6, rött på 6–10 matcher tills högsta rad >= 1 milj, 50 000–75 000 kr, skrällspik),
  // fri från A och B, bara C:s egna krav
  const fC = forcedFor("C");
  const signC = SIGN_MIN_C_BY_PRODUCT[p.product] || SIGN_MIN;
  const c = buildRisk("C", events, fC, { ...base, payoutMin: Math.max(UTD_MIN_C, base.payoutMin) }, BUDGET_C, null,
    { payoutLadder: [1], signLadder: [signC, ...SIGN_LADDER.filter((x) => x.join() !== signC.join() && x.every((v, k) => v <= signC[k]))] }, null, RISK_C);
  const C = c && finish(c, "C", fC);
  // Kupong D: användarens eget fasta system, fritt från A, B och C (bara D:s egna krav)
  const D = buildCouponD(p, events, forcedFor("D"), base);
  return { A, B, C, D, overlap, unionHit };
}

// ---------- Kupong D (användaren 2026-10-03, från egen Gambling Cabin-bild) ----------
// Fast form: exakt 4 spikar, 4 halvgarderingar och 5 helgarderingar (3 888 rader oreducerat). Färger efter folkets streck:
// röd = 25 % eller lägre, grön = 26–35 %, över 35 % blå (ingen regel). Spikar alltid blå. Per rad röd 1–3 och grön 1–3.
// 2026-10-03: bandet 26–35 % var gult; användaren vill bara ha blått, grönt och rött i Gambling Cabin – samma rader.
// Teckenregel minst 4-3-3. Lägsta utdelning för 13 rätt 30 000–50 000 kr (inget tak), budget 350–400 kr.
// Formen väljs bland alla fördelningar av 4/4/5 (spik = favoriten, halv = två troligaste) efter chansen till 13 rätt efter
// reduceringen. Inga andra regler (grön, skräll- och favoritregler, A/B-spärrar) gäller D.
export const D_RULES = {
  shape: { spik: 4, halv: 4, hel: 5 },
  red: [1, 3], green: [1, 3], redMax: 25, greenMax: 35,
  signMin: [4, 3, 3], payout: [30000, 50000], budget: { min: 350, max: 400 },
};
// Antal former (efter chans före reducering) som reduceras och jämförs. 1 500 av 90 090 räcker: Stryktipset 4973 fick
// samma system som med alla former, Europatipset 2613 1 på 394 mot 392 (ca 3 s i stället för flera minuter).
const D_TOP = 1500;
export function colorD(folkP) {
  const pc = Math.round((folkP ?? 0.5) * 100);
  return pc <= D_RULES.redMax ? "red" : pc <= D_RULES.greenMax ? "green" : "blue";
}

// Raderna för en form som klarar färg- och teckenreglerna, sorterade på utdelning i Gambling Cabins formel (högst först)
function rowsD(events, sets, { turnover: T, realTurnover: RT, jackpot: J }) {
  const out = [], row = [], cnt = [0, 0, 0];
  const { red, green, signMin } = D_RULES;
  const col = events.map((e, i) => [0, 1, 2].map((k) => (sets[i].length === 1 ? "blue" : colorD(e.folk?.[k]))));
  const walk = (i, p, f, r, y) => {
    if (r > red[1] || y > green[1]) return;
    if (i === events.length) {
      if (r < red[0] || y < green[0] || cnt[0] < signMin[0] || cnt[1] < signMin[1] || cnt[2] < signMin[2]) return;
      out.push({ row: row.join(""), p, payout: (PAYOUT_13 * T + J) / (1 + T * f), real: (PAYOUT_13 * RT + J) / (1 + RT * f) });
      return;
    }
    for (const k of sets[i]) {
      row.push(SIGNS[k]); cnt[k]++;
      walk(i + 1, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]), r + (col[i][k] === "red"), y + (col[i][k] === "green"));
      row.pop(); cnt[k]--;
    }
  };
  walk(0, 1, 1, 0, 0);
  return out.sort((a, b) => b.payout - a.payout);
}

// Lägsta utdelning (jämna hundralappar) i ett glapp mellan två rader så att antalet rader hamnar i budgeten. Flest rader
// (högst chans) inom 30 000–50 000 kr vinner. Går budgeten inte: 30 000 kr om det blir för få rader, 50 000 om för många.
export function floorD(all) {
  const [lo, hi] = D_RULES.payout, { min, max } = D_RULES.budget;
  for (let k = Math.min(max, all.length); k >= min; k--) {
    if (all[k - 1].payout < lo) continue;
    const below = k < all.length ? all[k].payout : 0, top = Math.min(hi, all[k - 1].payout);
    // Jämn hundralapp över raden under, annars precis över den om glappet är smalare
    let f = Math.max(lo, Math.ceil((below + 1) / 100) * 100);
    if (f > top) f = Math.max(lo, Math.floor(below) + 1);
    if (f <= top) return { floor: f, n: k, budget: "ok" };
  }
  const n30 = all.filter((r) => r.payout >= lo).length;
  if (n30 < min) return { floor: lo, n: n30, budget: "under" };
  return { floor: hi, n: all.filter((r) => r.payout >= hi).length, budget: "over" };
}

export function buildCouponD(p, events, forced, base) {
  const { spik, halv, hel } = D_RULES.shape;
  const order = (e) => [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
  const opts = events.map((e, i) => {
    if (forced[i]) return [{ t: ["", "S", "H", "F"][forced[i].length], set: [...forced[i]].sort() }];
    const o = order(e);
    return [{ t: "S", set: [o[0]] }, { t: "H", set: o.slice(0, 2).sort() }, { t: "F", set: [0, 1, 2] }];
  });
  const cover = (e, set) => set.reduce((s, k) => s + e.final[k], 0);
  const shapes = [];
  const pick = [];
  const rec = (i, s, h, f, c) => {
    if (s < 0 || h < 0 || f < 0) return;
    if (i === events.length) { if (!s && !h && !f) shapes.push({ sets: pick.map((x) => x.set), c }); return; }
    for (const o of opts[i]) {
      pick.push(o);
      rec(i + 1, s - (o.t === "S"), h - (o.t === "H"), f - (o.t === "F"), c * cover(events[i], o.set));
      pick.pop();
    }
  };
  rec(0, spik, halv, hel, 1);
  if (!shapes.length) return null; // egna krav som inte går ihop med 4/4/5
  shapes.sort((a, b) => b.c - a.c);
  const rank = { ok: 0, under: 1, over: 2 };
  let best = null;
  for (const sh of shapes.slice(0, D_TOP)) {
    const all = rowsD(events, sh.sets, base);
    if (!all.length) continue;
    const cut = floorD(all);
    if (!cut.n) continue;
    const kept = all.slice(0, cut.n);
    const hit = kept.reduce((s, r) => s + r.p, 0);
    const better = !best || rank[cut.budget] < rank[best.cut.budget]
      || (rank[cut.budget] === rank[best.cut.budget] && (cut.budget === "over" ? cut.n < best.cut.n : hit > best.hit));
    if (better) best = { sets: sh.sets, kept, hit, cut };
  }
  if (!best) return null;
  const { sets, kept, hit, cut } = best;
  const ev = kept.reduce((s, r) => s + r.p * r.real, 0);
  const relaxed = cut.budget === "under" ? [`bara ${cut.n} rader med 30 000 kr som gräns (under 350 kr)`]
    : cut.budget === "over" ? [`${cut.n} rader även med 50 000 kr som gräns (över 400 kr)`] : [];
  const rows = kept.slice().sort((a, b) => b.p - a.p);
  const reduced = {
    rows: kept.length, cost: kept.length * (base.rowPrice || 1), rowPrice: base.rowPrice || 1,
    hitAll: hit, grundHit: sets.reduce((a, set, i) => a * cover(events[i], set), 1), expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
    rules: {
      payoutMin: cut.floor, signMin: D_RULES.signMin, turnover: base.turnover, realTurnover: base.realTurnover, jackpot: base.jackpot,
      colorRules: { red: D_RULES.red, green: D_RULES.green }, budget: cut.budget, blueHalves: [],
    },
    rowList: rows.map((r) => r.row), rowP: rows.map((r) => r.p), rowReal: rows.map((r) => r.real), rowPayout: rows.map((r) => r.payout),
  };
  return {
    ...reduced,
    picks: sets.map((set, i) => ({ ...pickOf(set), locked: forced[i] != null })),
    relaxed,
    gamblingCabinUrl: gamblingCabinUrlD(p, events, sets, reduced),
    system: "D",
  };
}

// Gambling Cabin-länk för D: spikar och tecken över 35 % blå (1), grön 26–35 % (4), röd 25 % eller lägre (3).
// Grön 1–3, röd 1–3, gul och rosa av (bara tre färger, användaren 2026-10-03), tecken minst 4-3-3, lägsta utdelning utan tak.
export function gamblingCabinUrlD(p, events, sets, reduced) {
  const id = { blue: 1, green: 4, red: 3 };
  const col = (k) => events.map((e, i) => (!sets[i].includes(k) ? 0 : sets[i].length === 1 ? 1 : id[colorD(e.folk?.[k])])).join(",");
  const [m1, mX, m2] = D_RULES.signMin;
  const q = [
    `spel=${p.product}`, `omg=${p.drawNumber}`, `datum=${(p.regCloseTime || "").slice(0, 10)}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${m1},13,${mX},13,${m2},13`,
    "yellow=0,0,13", `red=1,${D_RULES.red.join(",")}`, `green=1,${D_RULES.green.join(",")}`, "pink=0,0,13",
    `utd=1,${reduced.rules.payoutMin},100000000`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join("&")}`;
}
