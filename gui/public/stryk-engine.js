// Kupongmotor för Stryktipset och Europatipset: filkupongerna A, B och C (Egna rader hos Svenska Spel) med krav som
// användaren låser själv (1, X, 2, 1X, X2, 12 eller 1X2). Samma funktion bygger kupongerna i servern
// (scripts/fetch-stryktipset.mjs), så sidan och servern ger exakt samma rader. Inga Gambling Cabin-regler sedan 2026-10-11.
// Dessutom: "kan falla"-favoriter och skrällspikar/skrällkryss att läsa om (ligger inte i kupongerna).
import { SIGNS } from "./stryk-rules.js";
const PAYOUT_13 = 0.65 * 0.4; // 65 % återbetalning, 40 % av potten till 13 rätt
// Typisk omsättning per spel när datan saknar en (samma som servern)
const TYPICAL_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
const favIdx = (e) => e.final.indexOf(Math.max(...e.final));
// Skrällfönstret (användaren 2026-10-02: "en skräll runt 40 %"): vår chans 35–47 % och minst 3 procentenheter över folket.
// Används när skrällspikarna att läsa om rangordnas (skrallTips).
const SKRALL_SPIK = { min: 0.35, max: 0.47, edge: 0.03 };
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
// Skrällspik att läsa om (användaren 2026-10-04: "rekommendera någon skräll spik inte på raden men skriv den högst upp och
// varför"): ett tecken som inte är favorit, minst SKRALL_TIP.min hos oss och minst SKRALL_SPIK.edge över folket. Påverkar inte
// kupongerna. 35–47 % (skrallOk) går först, sedan störst värde mot folket. reasons = klartext till sidan.
// Två att välja på (användaren 2026-10-04: "ta med en till skrällspik så man alltid har två att välja på"): skrallTips
// ger de SKRALL_TIP.count bästa, högst en per match. Räcker de inte fylls det på med reserver (weak: true): inte favorit,
// minst SKRALL_TIP.weakMin hos oss och understreckat (vår chans över folket). skrallTip = den första.
export const SKRALL_TIP = { min: 0.3, count: 2, weakMin: 0.25 };
export function skrallTip(events) {
  const t = skrallTips(events, 1)[0];
  return t && !t.weak ? t : null;
}
export function skrallTips(events, n = SKRALL_TIP.count) {
  const cands = [];
  (events || []).forEach((e, i) => {
    if (!e?.final || !e.folk) return;
    const fav = e.final.indexOf(Math.max(...e.final));
    for (const k of [0, 1, 2]) {
      const p = e.final[k];
      const folk = e.folk[k];
      if (k === fav || folk == null || p < SKRALL_TIP.weakMin || p <= folk) continue;
      const weak = p < SKRALL_TIP.min || p - folk < SKRALL_SPIK.edge;
      cands.push({ i, k, p, folk, edge: p - folk, weak, window: !weak && skrallWindow(e, k) });
    }
  });
  cands.sort((a, b) => a.weak - b.weak || b.window - a.window || b.edge - a.edge || b.p - a.p);
  const used = new Set();
  return cands.filter((c) => !used.has(c.i) && used.add(c.i)).slice(0, n).map((c) => describeSkrall(events[c.i], c));
}
// Skrällkryss att läsa om (användaren 2026-10-04: "rekommendera också 2 st skrällkryss, skriv om dem på samma sätt"):
// X där krysset inte är favorit, minst SKRALL_X.min hos oss och minst SKRALL_X.edge över folket. Andra matcher än
// skrällspikarna (skrallTips), högst en per match. Störst värde mot folket först, sedan jämnast match (1 och 2 närmast
// varandra). Räcker de inte: reserver (weak: true) med minst SKRALL_X.weakMin och understreckat. Påverkar inte kupongerna.
export const SKRALL_X = { min: 0.26, edge: 0.02, count: 2, weakMin: 0.22 };
export function skrallKryss(events, n = SKRALL_X.count) {
  const taken = new Set(skrallTips(events).map((t) => t.i));
  const cands = [];
  (events || []).forEach((e, i) => {
    if (!e?.final || !e.folk || e.folk[1] == null || taken.has(i)) return;
    const p = e.final[1], folk = e.folk[1];
    if (e.final.indexOf(Math.max(...e.final)) === 1 || p < SKRALL_X.weakMin || p <= folk) return;
    const weak = p < SKRALL_X.min || p - folk < SKRALL_X.edge;
    cands.push({ i, k: 1, p, folk, edge: p - folk, weak, gap: Math.abs(e.final[0] - e.final[2]) });
  });
  cands.sort((a, b) => a.weak - b.weak || b.edge - a.edge || a.gap - b.gap || b.p - a.p);
  return cands.slice(0, n).map((c) => {
    const t = describeSkrall(events[c.i], c);
    if (c.gap <= 0.15) t.reasons.splice(1, 0, `Jämn match: vi ger 1 ${Math.round(events[c.i].final[0] * 100)} % och 2 ${Math.round(events[c.i].final[2] * 100)} % – ju jämnare, desto oftare blir det kryss.`);
    return t;
  });
}
function describeSkrall(e, c) {
  const names = [`${e.home} vinner`, "oavgjort", `${e.away} vinner`];
  const fav = e.final.indexOf(Math.max(...e.final));
  const favSide = fav === 0 ? "home" : fav === 2 ? "away" : null;
  const favTeam = favSide ? e[favSide] : null;
  const P = (x) => `${Math.round(x * 100)} %`;
  const reasons = [`Vi ger ${SIGNS[c.k]} (${names[c.k]}) ${P(c.p)}, men folket har bara streckat ${P(c.folk)} – ${Math.round(c.edge * 100)} procentenheter för lite.`];
  if (e.odds?.[c.k]) reasons.push(`Svenska Spels odds på ${SIGNS[c.k]} är ${e.odds[c.k].toFixed(2).replace(".", ",")}${e.startOdds?.[c.k] && e.startOdds[c.k] - e.odds[c.k] >= 0.05 ? `, ned från ${e.startOdds[c.k].toFixed(2).replace(".", ",")} – pengar har gått in på tecknet` : ""}.`);
  const f = canFall(e);
  if (f && f.k !== c.k) reasons.push(`Favoriten ${f.sign} kan falla: folket streckar ${P(f.folk)} men vi ger bara ${P(f.p)}.`);
  if (favSide && e.streckFlop?.[favSide]) {
    const s = e.streckFlop[favSide].season;
    reasons.push(`${favTeam} är ett risklag: ingen seger i ${s.noWin} av ${s.games} matcher som streckfavorit denna säsong.`);
  }
  const miss = favSide ? e.context?.[favSide] : null;
  if (miss?.unavailable?.length && miss.missingValueShare >= 0.1) reasons.push(`${favTeam} saknar ${miss.unavailable.slice(0, 3).map((x) => x.name).join(", ")} (${P(miss.missingValueShare)} av lagets värde).`);
  const exp = (e.experts || []).filter((x) => x.signs.includes(SIGNS[c.k]));
  if (exp.length) reasons.push(`${exp.length} av ${e.experts.length} av Svenska Spels experter har med ${SIGNS[c.k]}.`);
  reasons.push(`Få har den på sin kupong, så går den in blir utdelningen hög. Men den går bara in ungefär ${Math.max(1, Math.round(c.p * 10))} av 10 gånger – en chansning.`);
  return { ...c, eventNumber: e.eventNumber, sign: SIGNS[c.k], home: e.home, away: e.away, league: e.league, kickoff: e.kickoff, outcome: names[c.k], hit: e.result?.outcome ? e.result.outcome === SIGNS[c.k] : null, score: e.result?.score || null, reasons };
}
const skrallWindow = (e, k) => e.folk?.[k] != null && e.final[k] >= SKRALL_SPIK.min && e.final[k] <= SKRALL_SPIK.max && e.final[k] - e.folk[k] >= SKRALL_SPIK.edge;

const pickOf = (x) => ({
  signs: x.map((k) => SIGNS[k]).join(""),
  type: x.length === 1 ? "Spik" : x.length === 2 ? "Halvgardering" : "Helgardering",
});

// Krav från webben: { signs: "1X", scope } (äldre sparade spikar: { sign: "1", scope }) -> sorterade teckenindex
export function kravSigns(k) {
  const txt = k?.signs ?? k?.sign ?? "";
  const idx = SIGNS.map((s, i) => (txt.includes(s) ? i : -1)).filter((i) => i >= 0);
  return idx.length ? idx : null;
}

// Procenten systemet byggs på: spikbedömningens (sysP) när den används, men aldrig om justeringen byter favorit – samma
// tecken som Oddset (användaren 2026-10-06; äldre sparad data kan ha en vänd sysP). Tips som Oddset (tipBasis "oddset"):
// alltid Oddsets procent, samma som servern (fetch-stryktipset.mjs sysEv)
const topOf = (x) => x.indexOf(Math.max(...x));
export const sysFinal = (e) => (e.tipBasis !== "oddset" && e.spik?.used && e.spik.sysP && topOf(e.spik.sysP) === topOf(e.final) ? e.spik.sysP : e.final);
/** Genererar filkupongerna A, B och C med dina krav. krav: { [eventNumber]: { signs, scope: "both" | "A" | "B" | "C" | "all" } } */
export function generateCoupons(p, krav) {
  // Systemen byggs på matchens justerade procent (spikbedömningen) när den används, annars på modellens
  const events = p.events.map((e) => ({ ...e, final: sysFinal(e) }));
  const forcedFor = (sys) => events.map((e) => {
    const k = krav[e.eventNumber];
    const on = k && (k.scope === sys || k.scope === "all" || (k.scope === "both" && (sys === "A" || sys === "B")));
    return on ? kravSigns(k) : null;
  });
  const rules = p.reduced?.rules || {};
  const base = {
    rowPrice: p.reduced?.rowPrice || 1,
    turnover: rules.turnover || TYPICAL_TURNOVER[p.product] || 1e7,
    realTurnover: rules.realTurnover || rules.turnover || TYPICAL_TURNOVER[p.product] || 1e7,
    jackpot: rules.jackpot || 0,
  };
  // Filkuponger (användaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att göra, ta bort alla regler, vill
  // bara köra på fil"): A, B och C som Egna rader-filer. B har inga rader från A, så A+B = summan.
  const { A, B, C } = buildFileCoupons(p, events, forcedFor, base);
  return { A, B, C, overlap: 0, unionHit: (A?.hitAll || 0) + (B?.hitAll || 0) };
}

// ---------- Filkuponger A, B och C (användaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att göra, ta bort
// alla regler, vill bara köra på fil"). Spelas som Egna rader-fil hos Svenska Spel. Inga färg-, tecken- eller GC-regler:
//   spikar: omgångens 2 starkaste favoriter (vår procent), dina låsta spikar räknas in
//   A: de 500 troligaste raderna med minst 30 000 kr för 13 rätt
//   B: de 500 nästa raderna som inte finns i A, med bonus för tecken A saknar (fyller A:s hål)
//   C: 500 rader där underspelade tecken (vår chans minst 20 % och minst 1,3 × folkets streck, inte favoriten) väger
//      1,3 × per tecken – skrällarna folket missar. Samma golv, oberoende av A och B.
// Bakkört 2026-10-11 (kupongarkivet, ST 169 / ET 183 omg, scripts/backtest-stryk-fil.mjs): A chans 1 på 170 / 162 med 2 spikar
// (0 spikar 1 på 168 / 159, 4 spikar 1 på 181 / 174); A+B bäst med 2 (1 på 96 / 92). Båda spikarna satt i 80 / 90 omg.
// C: bonus 1,3 gav 1 på 177 / 167 (2: 1 på 220 / 195).
export const FILE_RULES = { rows: 500, payoutMin: 30000, spikes: 2, underRatio: 1.3, underMin: 0.2, underBonus: 1.3, gapBonus: 2.5 };
/** Spikar för filkupongerna: dina krav, plus favoriten på de starkaste matcherna tills det finns FILE_RULES.spikes spikar. */
export function strongSpikeForced(events, forced, n = FILE_RULES.spikes) {
  const locked = forced.filter((f) => f?.length === 1).length;
  const free = events.map((e, i) => ({ i, p: Math.max(...e.final) })).filter((x) => forced[x.i] == null).sort((a, b) => b.p - a.p);
  const out = forced.slice();
  for (const { i } of free.slice(0, Math.max(0, n - locked))) out[i] = [favIdx(events[i])];
  return out;
}
/** Underspelat tecken: inte favoriten, vår chans minst underMin och minst underRatio × folkets streck. */
export const underplayed = (e, k, r = FILE_RULES) => k !== favIdx(e) && e.folk?.[k] > 0 && e.final[k] >= r.underMin && e.final[k] / e.folk[k] >= r.underRatio;
const rowSigns = (code, n) => { const out = new Array(n); for (let i = n - 1; i >= 0; i--) { out[i] = code % 3; code = Math.floor(code / 3); } return out; };
export function buildFileCoupons(p, events, forcedFor, base, r = FILE_RULES) {
  const opt = { rows: r.rows, payoutMin: r.payoutMin };
  const make = (sys, extra = {}) => {
    const forced = strongSpikeForced(events, forcedFor(sys), r.spikes);
    const picked = selectTopRows(events, forced, base, { ...opt, ...extra });
    if (!picked) return null;
    // turnover = typisk omsättning: sidan räknar live med max(live-omsättning, typisk), annars blir omsättningen tidigt i veckan
    // så låg att inga rader når 30 000 kr (Europatipset 2026-10-11)
    const c = finishEgnaRader(p, events, forcedFor(sys), base, picked, sys, { file: true, spikes: forced.filter((f) => f?.length === 1).length, turnover: base.turnover || base.realTurnover });
    c.picks = c.picks.map((x, i) => ({ ...x, spikStrong: forced[i]?.length === 1 && forcedFor(sys)[i] == null }));
    return c;
  };
  const A = make("A");
  // B: nästa rader utanför A, bonus för tecken A saknar på matchen
  let B = null;
  if (A) {
    const gaps = events.map((_, i) => [0, 1, 2].filter((k) => !A.picks[i].signs.includes(SIGNS[k])));
    const gapN = gaps.reduce((s, g) => s + g.length, 0);
    B = make("B", {
      exclude: new Set(A.rowList.map(encodeRow)),
      score: (pr, code) => { const s = rowSigns(code, events.length); let h = 0; s.forEach((k, i) => { if (gaps[i].includes(k)) h++; }); return pr * r.gapBonus ** h; },
      scoreMaxFactor: gapN ? r.gapBonus ** gapN : 1,
    });
  }
  // C: underspelade tecken väger underBonus per tecken
  const under = events.map((e) => [0, 1, 2].filter((k) => underplayed(e, k, r)));
  const uN = under.filter((u) => u.length).length;
  const C = make("C", {
    score: (pr, code) => { const s = rowSigns(code, events.length); let h = 0; s.forEach((k, i) => { if (under[i].includes(k)) h++; }); return pr * r.underBonus ** h; },
    scoreMaxFactor: uN ? r.underBonus ** uN : 1,
  });
  if (C) C.rules.underplayed = under.map((u) => u.map((k) => SIGNS[k]).join(""));
  return { A, B, C };
}

const decodeRow = (code, n) => {
  const s = new Array(n);
  for (let i = n - 1; i >= 0; i--) { s[i] = SIGNS[code % 3]; code = Math.floor(code / 3); }
  return s.join("");
};
const encodeRow = (row) => {
  let c = 0;
  for (let i = 0; i < row.length; i++) c = c * 3 + SIGNS.indexOf(row[i]);
  return c;
};

/**
 * Topp-N rader med utdelning ≥ payoutMin.
 * exclude = Set av radkoder att hoppa över.
 * score(pr, code) = sorteringsvikt (högre = bättre); scoreMaxFactor ≥ max score(pr,code)/pr (för grenkapning).
 */
function selectTopRows(events, forced, base, { rows: N, payoutMin, exclude = null, score = (pr) => pr, scoreMaxFactor = 1 } = {}) {
  const n = events.length;
  const RT = base.realTurnover || base.turnover, J = base.jackpot || 0;
  const pot = PAYOUT_13 * RT + J;
  const fMax = (pot / payoutMin - 1) / RT;
  const P = events.map((e) => e.final);
  const F = events.map((e) => [0, 1, 2].map((k) => e.folk?.[k] ?? e.final[k]));
  // Högst chans först → snabbare heap-kapning
  const opts = events.map((e, i) => {
    const o = forced[i] || [0, 1, 2];
    return o.length <= 1 ? o : o.slice().sort((a, b) => P[i][b] - P[i][a]);
  });
  const pRest = new Float64Array(n + 1), fRest = new Float64Array(n + 1);
  pRest[n] = 1; fRest[n] = 1;
  for (let i = n - 1; i >= 0; i--) {
    let pM = 0, fM = 1;
    for (const k of opts[i]) { if (P[i][k] > pM) pM = P[i][k]; if (F[i][k] < fM) fM = F[i][k]; }
    pRest[i] = pRest[i + 1] * pM;
    fRest[i] = fRest[i + 1] * fM;
  }
  const hs = new Float64Array(N), hp = new Float64Array(N), hf = new Float64Array(N), hr = new Int32Array(N);
  let size = 0;
  const swap = (a, b) => {
    [hs[a], hs[b]] = [hs[b], hs[a]]; [hp[a], hp[b]] = [hp[b], hp[a]];
    [hf[a], hf[b]] = [hf[b], hf[a]]; [hr[a], hr[b]] = [hr[b], hr[a]];
  };
  const push = (s0, p0, f0, r0) => {
    if (size < N) {
      let i = size++;
      hs[i] = s0; hp[i] = p0; hf[i] = f0; hr[i] = r0;
      while (i && hs[(i - 1) >> 1] > hs[i]) { swap(i, (i - 1) >> 1); i = (i - 1) >> 1; }
      return;
    }
    hs[0] = s0; hp[0] = p0; hf[0] = f0; hr[0] = r0;
    for (let i = 0; ;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < N && hs[l] < hs[m]) m = l;
      if (r < N && hs[r] < hs[m]) m = r;
      if (m === i) break;
      swap(i, m); i = m;
    }
  };
  const hasEx = exclude && exclude.size > 0;
  const walk = (i, pr, f, code) => {
    if (f * fRest[i] > fMax) return;
    if (size === N && pr * pRest[i] * scoreMaxFactor <= hs[0]) return;
    if (i === n) {
      if (hasEx && exclude.has(code)) return;
      push(score(pr, code), pr, f, code);
      return;
    }
    for (const k of opts[i]) walk(i + 1, pr * P[i][k], f * F[i][k], code * 3 + k);
  };
  walk(0, 1, 1, 0);
  if (!size) return null;
  const idx = [...Array(size).keys()].sort((a, b) => hs[b] - hs[a] || hp[b] - hp[a]);
  return {
    pot, RT, J, size, N, payoutMin,
    rowList: idx.map((j) => decodeRow(hr[j], n)),
    rowP: idx.map((j) => hp[j]),
    rowReal: idx.map((j) => pot / (1 + RT * hf[j])),
    codes: idx.map((j) => hr[j]),
  };
}

function finishEgnaRader(p, events, forced, base, picked, system, rulesExtra = {}) {
  const { size, N, payoutMin, RT, J, rowList, rowP, rowReal } = picked;
  const hit = rowP.reduce((s, x) => s + x, 0);
  const ev = rowP.reduce((s, x, j) => s + x * rowReal[j], 0);
  // Ett pass över raderna i stället för some() per tecken
  const used = events.map(() => []);
  const seen = events.map(() => [false, false, false]);
  for (const row of rowList) {
    for (let i = 0; i < events.length; i++) {
      const k = SIGNS.indexOf(row[i]);
      if (k >= 0 && !seen[i][k]) { seen[i][k] = true; used[i].push(k); }
    }
  }
  for (const s of used) s.sort((a, b) => a - b);
  const rowPrice = base.rowPrice || 1;
  // DGC byggs av generateCoupons / backtest – inte här (undvik dubbel, dyr sökning)
  return {
    gc: null,
    rows: size, cost: size * rowPrice, rowPrice,
    hitAll: hit, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
    minPayout: Math.min(...rowReal),
    grundRows: used.reduce((g, s) => g * s.length, 1),
    rules: { free: true, rowsTarget: N, payoutMin, payoutMinReal: payoutMin, realTurnover: RT, jackpot: J, blueHalves: [], ...rulesExtra },
    rowList, rowP, rowReal,
    picks: used.map((s, i) => ({ ...pickOf(s), locked: forced[i] != null })),
    relaxed: size < N ? [`bara ${size} rader ger minst ${payoutMin.toLocaleString("sv-SE")} kr med dina krav`] : [],
    egnaRader: egnaRaderFile(rowList, p.product === "europatipset" ? "Europatipset" : "Stryktipset"),
    system,
  };
}


// Svenska Spels "Egna rader": första raden spelet, sedan en rad per spelrad (E följt av 13 tecken)
export function egnaRaderFile(rowList, product = "Stryktipset") {
  return [product, ...rowList.map((r) => `E,${r.split("").join(",")}`)].join("\n") + "\n";
}
