// Kupongmotor för "Stryktipset B": samma logik som scripts/fetch-stryktipset.mjs (grundrad via DP, Gambling Cabins
// utdelningsreducering, teckenregler, budget 350–400 kr) men med krav som användaren låser själv (1, X, 2, 1X, X2, 12 eller 1X2).
// Körs i webbläsaren eftersom webben är statisk. Ändras reglerna i fetch-stryktipset.mjs ska de ändras här också.
const SIGNS = ["1", "X", "2"];
const PAYOUT_13 = 0.65 * 0.4; // 65 % återbetalning, 40 % av potten till 13 rätt
const BUDGET = { min: 350, max: 400 };
const GRUND_MAX_ROWS = 30000;
const SIGN_MIN = [4, 2, 2];
// Kupong B: minst 3 ettor, 3 kryss och 3 tvåor per rad (användarens regel 2026-09-29)
const SIGN_MIN_B = [3, 3, 3];
// Folkets streck: grön >= 45 %, röd 25 % eller lägre (användaren 2026-10-02, avrundat till hela procent), annars gul
const COLOR = { green: 0.45, red: 0.25 };
const UTD_MIN_BY_PRODUCT = { stryktipset: 30000, europatipset: 20000 };
// Kupong B: minst 30 000 kr för 13 rätt på båda spelen och inget tak (användarens regel 2026-09-29)
const UTD_MIN_B = 30000;
// Kupong C (användaren 2026-09-30): ett helt eget system på 700–850 kr, oberoende av A och B. Bara krav som gäller C
// (scope "C" eller "all") låses där; "both" = A och B.
// Samma regler som A (4-2-2, färgfönster, högst 4 spikar, skräll- och favoritregeln) och minst 30 000 kr för 13 rätt.
const BUDGET_C = { min: 700, max: 850 };
const UTD_MIN_C = 30000;
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
const spikOk = (e, k, spikMin) => (e.spik?.used ? e.spik.fav === SIGNS[k] && e.spik.spikbar : e.final[k] >= spikMin);
// Kupong C: Europatipset 3-2-2 (backtest: bättre än 4-2-2), Stryktipset samma som A
const SIGN_MIN_C_BY_PRODUCT = { stryktipset: SIGN_MIN, europatipset: [3, 2, 2] };
const SIGN_LADDER_B = [SIGN_MIN_B, [3, 2, 2], [3, 1, 1], [2, 1, 1], [0, 0, 0]];
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
// avoid = A:s grundrad (kupong B): B får aldrig exakt samma tecken som A på någon match, oavsett typ (spik, halv- eller
// helgardering). Krav i B räknas inte. loose = spik får läggas på favoriten även när matchen inte bedömts som spikbar
// (reserv när minst MIN_SPIKES spikar annars inte går).
function grundCandidates(events, maxRows, forced, avoid = null, spikMin = 0, loose = false) {
  const same = (a, b) => a.length === b.length && a.every((x, j) => x === b[j]);
  const fav = (e) => e.final.indexOf(Math.max(...e.final));
  const canSpik = (e, k) => spikOk(e, k, spikMin) || (loose && k === fav(e));
  const options = (e, i) => {
    if (forced[i] != null) return [forced[i]];
    // Ingen helgardering där alla tecken är gula (användaren 2026-10-02: "3 gula helor är exakt samma sak som blå helor")
    if (allYellowMatch(e)) return options0(e, i).filter((x) => x.length < 3);
    return options0(e, i);
  };
  const options0 = (e, i) => {
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    const subs = [1, 2, 3].map((n) => order.slice(0, n).sort());
    // Halvgardering favorit + skräll (rött tecken) så att grundraden kan få med röda
    for (const k of [0, 1, 2]) if (k !== order[0] && isRed(e, k) && !subs.some((x) => same(x, [order[0], k].sort()))) subs.push([order[0], k].sort());
    // Skrällspik (runt 40 %, värde mot folket)
    for (const k of [0, 1, 2]) if (skrallOk(e, k) && !subs.some((x) => same(x, [k]))) subs.push([k]);
    // Andra spikar och halvgarderingar än A: alla tecken och par, inte bara de troligaste
    if (avoid) {
      for (const k of [0, 1, 2]) if (!subs.some((x) => same(x, [k]))) subs.push([k]);
      for (const x of [[0, 1], [0, 2], [1, 2]]) if (!subs.some((y) => same(y, x))) subs.push(x);
      return subs.filter((x) => !same(x, avoid[i]) && (x.length > 1 || canSpik(e, x[0]) || skrallOk(e, x[0])));
    }
    return subs.filter((x) => x.length > 1 || canSpik(e, x[0]) || skrallOk(e, x[0]));
  };
  // Nyckel: halv, hel, reservspikar (spik på favorit som inte bedömts som spikbar, aldrig dina krav) och röda tecken i
  // garderingarna (högst MIN_RED räknas) och skrällspikar (högst SKRALL_SPIK.count)
  let dp = new Map([["0,0,0,0,0,0", { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f, l, rc, sk, ay] = key.split(",").map(Number);
      for (const sub of options(e, i)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        const free = forced[i] == null && sub.length === 1 && !spikOk(e, sub[0], spikMin);
        const skr = free && skrallOk(e, sub[0]);
        const ns = sk + (skr ? 1 : 0), nl = l + (free && !skr ? 1 : 0);
        if (ns > SKRALL_SPIK.count || 2 ** nh * 3 ** nf > maxRows) continue;
        const lp = st.lp + Math.log(Math.max(1e-9, sub.reduce((sum, k) => sum + e.final[k], 0)));
        // Räknas per match (två röda tecken på samma match kan aldrig båda gå in – användaren 2026-10-02)
        const nr = Math.min(MIN_RED, rc + (sub.length > 1 && sub.some((x) => isRed(e, x)) ? 1 : 0));
        // Helgula garderingar bara som de blå halvorna (högst BLUE_HALVES) – fler ger ändå alltid en gul per rad (2026-10-02)
        const nay = ay + (sub.length > 1 && !(forced?.[i] != null) && allYellowMatch(e) ? 1 : 0);
        if (nay > ayLimit) continue;
        const k = `${nh},${nf},${nl},${nr},${ns},${nay}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub], nl, nr });
      }
    }
    dp = next;
  });
  const maxSpikes = Math.max(MAX_SPIKES, forced.filter((f) => f?.length === 1).length);
  const minSpikes = Math.min(MIN_SPIKES, forced.filter((f) => !(f?.length > 1)).length);
  const spikes = (st) => st.sets.filter((x) => x.length === 1).length;
  // Reservspikar bara för att nå minst MIN_SPIKES: med reservspik blir det exakt så många spikar
  const minHelg = Math.min(MIN_HELG, forced.filter((f) => f == null || f.length === 3).length);
  // Minst BLUE_HALVES halvgarderingar (de blir blå); låser användaren så mycket att det inte går gäller deras krav
  const minHalf = Math.min(BLUE_HALVES, forced.filter((f) => f == null || f.length === 2).length);
  const ok = (st) => spikes(st) >= minSpikes && spikes(st) <= maxSpikes && (st.nl === 0 || spikes(st) === minSpikes || loose === "max") && st.sets.filter((x) => x.length === 3).length >= minHelg && st.sets.filter((x) => x.length === 2).length >= minHalf;
  const okList = [...dp.values()].filter(ok);
  // Går det inte med högst BLUE_HALVES helgula garderingar (för få spikbara matcher) släpps den gränsen
  if (!okList.length && ayLimit < 13 && loose) {
    ayLimit++;
    try { return grundCandidates(...arguments); } finally { ayLimit--; }
  }
  // Minst MIN_RED röda i garderingarna; går det inte (dina krav) så många som går
  const most = okList.reduce((m, st) => Math.max(m, st.nr), 0);
  return okList.filter((st) => st.nr >= most).map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: Math.exp(st.lp), sets: st.sets, picks: st.sets.map(pickOf), ayMax: ayLimit,
  }));
}

const isRed = (e, k) => signColor(e.folk?.[k]) === "red";
let ayLimit = BLUE_HALVES;
const allYellowMatch = (e) => [0, 1, 2].every((k) => signColor(e.folk?.[k]) === "yellow");
// Blå garderingar (index): blå i länken och fria från färgreglerna.
// Exakt BLUE_HALVES halvgarderingar blå ("2 halvor blå alltid", 2026-10-02): helgula först, sedan de säkraste utan rött
//    tecken så att skrällarna ligger kvar i de färgade. Fler helgula halvor blir gula (en gul per rad, styr ingenting).
export function blueHalves(events, sets) {
  const allYellow = (set, i) => set.length > 1 && set.every((k) => signColor(events[i].folk?.[k]) === "yellow");
  // Inga blå helgarderingar (användaren 2026-10-02: "helor behöver vi inte ha någon som är blå")
  const blue = new Set();
  const cover = ({ i, set }) => set.reduce((s, k) => s + events[i].final[k], 0);
  const red = ({ i, set }) => (set.some((k) => isRed(events[i], k)) ? 1 : 0);
  const yel = ({ i, set }) => (allYellow(set, i) ? 0 : 1);
  sets.map((set, i) => ({ i, set })).filter(({ set }) => set.length === 2)
    .sort((a, b) => yel(a) - yel(b) || red(a) - red(b) || cover(b) - cover(a) || a.i - b.i)
    .slice(0, BLUE_HALVES).forEach(({ i }) => blue.add(i));
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
export const colorsPresent = (triples) => [0, 1, 2].map((c) => !triples || triples.some((t) => t[c] > 0));
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
const RED_RULE = [1, 3];
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
export function redGreenRows(sets, colorIdx, blue = new Set(), redTop = RED_RULE[1], yellowExtra = YELLOW_EXTRA) {
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
    const G = present[0] ? GREEN_RULE : [0, 0], R = present[2] ? RED_RULE : [0, 0];
    // Gult skär aldrig bort rader (användaren 2026-10-02: "får jag in mina röda vill jag kunna få in alla gröna och
    // gula"): gulregeln är hela spannet som går att nå med grön 3–6 och röd 1–3. Full täckning även för grönt gick inte
    // ihop med grön 4–6, 350–400 kr och 30 000–50 000 kr (Stryktipset 4973: ingen grundrad klarade det).
    if (triples && yellowFull) {
      const ins = triples.filter((tr) => fitsColors(tr, [G, [0, 13], R]));
      if (!ins.length) return [];
      let yy = [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))];
      if (yy[0] === yy[1] && present[1]) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      return colorRuleOk(rule, present) ? [rule] : [];
    }
    const out = new Map();
    for (const y of [...ranges[1], [0, 13]]) {
      const ins = triples ? triples.filter((tr) => fitsColors(tr, [G, y, R])) : null;
      if (ins && !ins.length) continue;
      let yy = ins ? [Math.min(...ins.map((tr) => tr[1])), Math.max(...ins.map((tr) => tr[1]))] : y.slice();
      // Bara ett antal gula går att nå: max +1 är en död gräns (samma rader) så att gult inte blir ett exakt antal
      if (yy[0] === yy[1] && present[1] && !(triples || []).some((tr) => tr[1] === yy[1] + 1 && fitsColors(tr, [G, [0, 13], R]))) yy = [yy[0], yy[1] + 1];
      const rule = [G.slice(), yy, R.slice()];
      if (colorRuleOk(rule, present)) out.set(rule.join(";"), rule);
    }
    return [...out.values()];
  }
  const out = new Map();
  for (const g of ranges[0]) for (const y of ranges[1]) for (const rd of ranges[2]) {
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
  const mid = (minRows + maxRows) / 2;
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
function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin, budget, redMax = 1, favMin = FAV_MIN_SHARE, colorTarget = true, exactFloor = EXACT_FLOOR }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const T = turnover;
  // Exakt: gränsen i Gambling Cabins formel är regeln själv. Reserv: verklig utdelning >= regeln, gränsen höjs till budgeten.
  const floor = exactFloor ? payoutMin : gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  // exactFloor: true = gräns 30 000–50 000 kr, "near" = lägsta gräns som går (närmast regeln), false = höjd. Aldrig tak.
  const near = exactFloor === "near";
  const cap = exactFloor === true ? payoutMin * PAYOUT_BAND : Infinity;
  const colorIdx = events.map((e) => [0, 1, 2].map((k) => COLOR_KEYS.indexOf(signColor(e.folk?.[k]))));
  const blue = blueHalves(events, grund.sets);
  // Röd max + resten gröna (redGreenRows): färgreglerna får aldrig stoppa de raderna. Grön 3–6 är fast, så faller deras
  // gröna utanför provas nästa grundrad (färre gröna garderingar = mindre system). Utdelnings- och teckenreglerna gäller.
  // Räknas en gång per grundrad (samma grundrad provas i många steg i reservordningen)
  let rg = redGreenCache.get(grund);
  if (!rg) {
    const rows = redGreenRows(grund.sets, colorIdx, blue);
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
  const mid = aim ?? Math.round((minRows + maxRows) / 2);
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
  const colorId = { yellow: 2, red: 3, green: 4 };
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
    `yellow=${cr("yellow")}`, `red=${cr("red")}`, `green=${cr("green")}`, "pink=0,0,13",
    `utd=1,${r.payoutMin},${r.payoutMax ?? 100000000}`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join("&")}`;
}

// Prova reglerna i ordning tills ett system går att bygga. relaxed = vilka regler som fick släppas.
// payoutLadder = [1] håller utdelningsgränsen fast (kupong B).
function buildWithLadder(events, forced, base, budget, exclude, { avoid = null, payoutLadder = PAYOUT_LADDER, signLadder = SIGN_LADDER } = {}) {
  const free = forced.reduce((n, f) => n * (f == null ? 3 : f.length), 1);
  const b = { min: Math.min(budget.min, free * base.rowPrice), max: budget.max };
  const candCache = new Map(); // samma grundradskandidater (och deras rader i walkCache) för alla steg i reservordningen
  // Ordning (2026-09-30): färgfönstren släpps först, sedan skräll- och favoritregeln, sedan spikbedömningen (spik på
  // favoriten för att nå minst 2 spikar, 2026-10-02) och sist
  // tecken- och utdelningsreglerna (de släpps bara när dina krav gör kupongen omöjlig). Tidigare provades alla tecken- och
  // utdelningssteg innan skrällregeln släpptes – upp till 40 omräkningar och 17 sekunder på Stryktipset.
  // Favoritregeln (minst 10 %) släpps aldrig i första varvet – bara om ingen kupong alls går att bygga (andra varvet)
  for (const shareLevels of [[[RED_MAX_SHARE, FAV_MIN_SHARE], [1, FAV_MIN_SHARE]], [[1, 0]]]) {
  // Utdelningsgränsen 30 000–50 000 kr är viktigare än färgfönster, skrällgräns, spikbedömning och teckenregler (användaren
  // 2026-10-02: "30–50k är minsta utdelningen"): sedan lägsta gräns som går, sist höjd gräns – aldrig tak
  // Röd max + resten gröna (redGreenRows) går före utdelningsgräns och allt annat – hellre ett mindre system
  // (användaren 2026-10-02: "minska systemet om du måste"). Släpps bara om ingen kupong alls går att bygga.
  for (const rg of ["signs", "colors", false]) {
  redGreenFull = rg;
  for (const exactFloor of EXACT_FLOOR ? [true, "near", false] : [false]) {
  for (const pf of payoutLadder) {
  // Fritt gult (skär aldrig) går före teckenreglerna; först när inget annat håller 30 000–50 000 kr får gult skära
  for (const yf of exactFloor === true ? [true, false] : [true]) {
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
        if (EXACT_FLOOR && !exactFloor && pf === 1) relaxed.push(`utdelningsgränsen ${Math.round(base.payoutMin).toLocaleString("sv-SE")}–${Math.round(base.payoutMin * PAYOUT_BAND).toLocaleString("sv-SE")} kr gav inte ${budget.min}–${budget.max} kr – den höjdes till ${Math.round(best.reduced.rules.payoutMin).toLocaleString("sv-SE")} kr i länken`);
        if (exactFloor === "near") relaxed.push(`utdelningsgränsen ${Math.round(base.payoutMin).toLocaleString("sv-SE")}–${Math.round(base.payoutMin * PAYOUT_BAND).toLocaleString("sv-SE")} kr gav för många rader – lägsta gräns som går är ${Math.round(best.reduced.rules.payoutMin).toLocaleString("sv-SE")} kr (inget tak)`);
        if (!colorTarget) relaxed.push("färgfönstren runt det väntade antalet gick inte att hålla – färgerna optimerades fritt");
        if (redMax === 1) relaxed.push(`skrällgränsen (rött tecken på högst ${Math.round(RED_MAX_SHARE * 100)} % av raderna) gick inte att hålla`);
        if (favMin === 0) relaxed.push(`favoriten på minst ${Math.round(FAV_MIN_SHARE * 100)} % av raderna gick inte att hålla`);
        if (sm !== signLadder[0]) relaxed.push(`teckenreglerna sänktes till ${sm.join("-")}`);
        if (pf !== 1) relaxed.push(pf === 0 ? "utdelningsgränsen togs bort" : `utdelningsgränsen sänktes till ${Math.round(base.payoutMin * pf).toLocaleString("sv-SE")} kr`);
        if (b.min < budget.min) relaxed.push(`kraven lämnar bara ${free} möjliga rader`);
        if (!yf) relaxed.push("30 000–50 000 kr gick inte med fritt gult – gulregeln skär bort några rader");
        if (loose === "max") relaxed.push(`för att hålla reglerna (30 000–50 000 kr, högst 2 helgula garderingar) minskades strecken med spik på favoriter (högst ${MAX_SPIKES} spikar)`);
        else if (loose) relaxed.push(`för få matcher bedömdes som spikbara – spik på favoriten för att få minst ${MIN_SPIKES} spikar`);
        if (!rg) relaxed.push("färgreglerna stoppar några rader med 3 röda + resten gröna – det gick inte att undvika");
        else if (rg === "colors") relaxed.push("teckenreglerna stoppar några rader med 3 röda + högst 1 gul (t.ex. rader utan X) – att släppa dem hade krävt teckenregler under 2-1-1");
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
  }
  redGreenFull = "signs";
  }
  // Sista reserv: ingen kupong alls med grön 3–6 och röd 1–3 – färgerna optimeras fritt och kupongen säger det
  if (fixedColors) {
    fixedColors = false;
    try {
      const r = buildWithLadder(events, forced, base, budget, exclude, { avoid, payoutLadder, signLadder });
      if (r) r.relaxed.push("grön 3–6 och röd 1–3 gick inte att hålla – färgerna optimerades fritt");
      return r;
    } finally { fixedColors = true; }
  }
  return null;
}

// Krav från webben: { signs: "1X", scope } (äldre sparade spikar: { sign: "1", scope }) -> sorterade teckenindex
export function kravSigns(k) {
  const txt = k?.signs ?? k?.sign ?? "";
  const idx = SIGNS.map((s, i) => (txt.includes(s) ? i : -1)).filter((i) => i >= 0);
  return idx.length ? idx : null;
}

/**
 * Genererar kupong A och B för en omgång.
 * krav: { [eventNumber]: { signs: "1" | "1X" | "X2" | "12" | "1X2" | ..., scope: "both" | "A" | "B" | "C" | "all" } }
 * "both" = A och B, "all" = A, B och C.
 * A = bästa systemet med A:s krav (350–400 kr, spelets utdelningsgräns).
 * B = ett eget system med B:s krav: minst 30 000 kr för 13 rätt utan tak, teckenregler 3-3-3, aldrig samma tecken som A på någon match
 *     (inte ens spiken), valt så att det täcker så mycket som möjligt av det A saknar. Alla kuponger har 2–4 spikar.
 */
export function generateCoupons(p, krav) {
  // Systemen byggs på matchens justerade procent (spikbedömningen) när den används, annars på modellens
  const events = p.events.map((e) => (e.spik?.used && e.spik.sysP ? { ...e, final: e.spik.sysP } : e));
  const forcedFor = (sys) => events.map((e) => {
    const k = krav[e.eventNumber];
    const on = k && (k.scope === sys || k.scope === "all" || (k.scope === "both" && sys !== "C"));
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
  const a = buildWithLadder(events, fA, base, BUDGET, null);
  const b = buildWithLadder(events, fB, { ...base, payoutMin: Math.max(UTD_MIN_B, base.payoutMin) }, BUDGET,
    a ? new Set(a.reduced.rowList) : null, { avoid: a?.system.sets ?? null, payoutLadder: [1], signLadder: SIGN_LADDER_B });
  const A = a && finish(a, "A", fA), B = b && finish(b, "B", fB);
  // A+B tillsammans: gemensamma rader och chansen att någon av kupongerna tar 13 rätt
  let overlap = 0, unionHit = A ? A.hitAll : 0;
  if (B) {
    const setA = new Set(A?.rowList || []);
    B.rowList.forEach((row, i) => { if (setA.has(row)) overlap++; else unionHit += B.rowP[i]; });
  }
  // Kupong C: fri från A och B, bara C:s egna krav
  const fC = forcedFor("C");
  const signC = SIGN_MIN_C_BY_PRODUCT[p.product] || SIGN_MIN;
  const c = buildWithLadder(events, fC, { ...base, payoutMin: Math.max(UTD_MIN_C, base.payoutMin) }, BUDGET_C, null, { payoutLadder: [1], signLadder: [signC, ...SIGN_LADDER.filter((x) => x.join() !== signC.join() && x.every((v, k) => v <= signC[k]))] });
  const C = c && finish(c, "C", fC);
  return { A, B, C, overlap, unionHit };
}
