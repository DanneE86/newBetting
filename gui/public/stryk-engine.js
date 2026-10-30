// Kupongmotor för Stryktipset och Europatipset: filkupong A (Egna rader hos Svenska Spel) med krav som
// användaren låser själv (1, X, 2, 1X, X2, 12 eller 1X2). Samma funktion bygger kupongerna i servern
// (scripts/fetch-stryktipset.mjs), så sidan och servern ger exakt samma rader. Inga Gambling Cabin-regler sedan 2026-10-11.
// Dessutom: "kan falla"-favoriter och skrällspikar/skrällkryss att läsa om (ligger inte i kupongerna).
import { SIGNS } from "./stryk-rules.js";
const PAYOUT_13 = 0.65 * 0.4; // 65 % återbetalning, 40 % av potten till 13 rätt
// Typisk omsättning per spel när datan saknar en (samma som servern)
const TYPICAL_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
const favIdx = (e) => e.final.indexOf(Math.max(...e.final));
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
// varför"). Bara data sedan 2026-10-25 (användaren: "Data ska alltid används bortse helt från vad folket tycker"): ett tecken
// som inte är favorit i vår procent, rangordnat på datachansen (e.model, vår modell utan odds), minst SKRALL_TIP.min.
// Folkets streck används inte. Kupongens skrällspik är förstavalet (strongSpikeForced). reasons = klartext till sidan.
// Två att välja på (användaren 2026-10-04: "ta med en till skrällspik så man alltid har två att välja på"): högst en per
// match. Räcker de inte fylls det på med reserver (weak: true): minst SKRALL_TIP.weakMin på data. skrallTip = den första.
// Kontroll 2026-10-25 (bakkörningarna, 162 omg, 1 007 skrällar 25–45 % hos oddsen): där datan låg minst 8 enh. över oddsen
// gick skrällen in 30,9 % mot oddsens 29,8 % – datan hittar inte fler skrällar än oddsen, men väljer inte sämre.
export const SKRALL_TIP = { min: 0.3, count: 2, weakMin: 0.25 };
export function skrallTip(events) {
  const t = skrallTips(events, 1)[0];
  return t && !t.weak ? t : null;
}
export function skrallTips(events, n = SKRALL_TIP.count) {
  const cands = [];
  (events || []).forEach((e, i) => {
    if (!e?.final || !e.model?.length) return;
    const fav = favIdx(e);
    for (const k of [0, 1, 2]) {
      const p = e.model[k];
      if (k === fav || p < SKRALL_TIP.weakMin) continue;
      cands.push({ i, k, p, odds: e.final[k], weak: p < SKRALL_TIP.min });
    }
  });
  cands.sort((a, b) => a.weak - b.weak || b.p - a.p);
  const used = new Set();
  return cands.filter((c) => !used.has(c.i) && used.add(c.i)).slice(0, n).map((c) => describeSkrall(events[c.i], c));
}
// Skrällkryss att läsa om (användaren 2026-10-04: "rekommendera också 2 st skrällkryss, skriv om dem på samma sätt"). Bara data
// sedan 2026-10-25: X där krysset inte är favorit, minst SKRALL_X.min på data. Andra matcher än skrällspikarna, högst en per
// match. Högst datachans först, sedan jämnast match på data (1 och 2 närmast varandra). Räcker de inte: reserver (weak: true)
// med minst SKRALL_X.weakMin. Påverkar inte kupongerna.
export const SKRALL_X = { min: 0.26, count: 2, weakMin: 0.22 };
export function skrallKryss(events, n = SKRALL_X.count) {
  const taken = new Set(skrallTips(events).map((t) => t.i));
  const cands = [];
  (events || []).forEach((e, i) => {
    if (!e?.final || !e.model?.length || taken.has(i)) return;
    const p = e.model[1];
    if (favIdx(e) === 1 || p < SKRALL_X.weakMin) return;
    cands.push({ i, k: 1, p, odds: e.final[1], weak: p < SKRALL_X.min, gap: Math.abs(e.model[0] - e.model[2]) });
  });
  cands.sort((a, b) => a.weak - b.weak || b.p - a.p || a.gap - b.gap);
  return cands.slice(0, n).map((c) => {
    const t = describeSkrall(events[c.i], c);
    if (c.gap <= 0.15) t.reasons.splice(1, 0, `Jämn match: datan ger 1 ${Math.round(events[c.i].model[0] * 100)} % och 2 ${Math.round(events[c.i].model[2] * 100)} % – ju jämnare, desto oftare blir det kryss.`);
    return t;
  });
}
function describeSkrall(e, c) {
  const names = [`${e.home} vinner`, "oavgjort", `${e.away} vinner`];
  const fav = favIdx(e);
  const favSide = fav === 0 ? "home" : fav === 2 ? "away" : null;
  const favTeam = favSide ? e[favSide] : null;
  const P = (x) => `${Math.round(x * 100)} %`;
  const reasons = [`Datan (vår modell utan odds) ger ${SIGNS[c.k]} (${names[c.k]}) ${P(c.p)}${c.p > c.odds + 0.02 ? ` – mer än oddsens ${P(c.odds)}` : `, oddsen ${P(c.odds)}`}.`];
  if (e.odds?.[c.k]) reasons.push(`Svenska Spels odds på ${SIGNS[c.k]} är ${e.odds[c.k].toFixed(2).replace(".", ",")}${e.startOdds?.[c.k] && e.startOdds[c.k] - e.odds[c.k] >= 0.05 ? `, ned från ${e.startOdds[c.k].toFixed(2).replace(".", ",")} – pengar har gått in på tecknet` : ""}.`);
  const miss = favSide ? e.context?.[favSide] : null;
  if (miss?.unavailable?.length && miss.missingValueShare >= 0.1) reasons.push(`${favTeam} saknar ${miss.unavailable.slice(0, 3).map((x) => x.name).join(", ")} (${P(miss.missingValueShare)} av lagets värde).`);
  const exp = (e.experts || []).filter((x) => x.signs.includes(SIGNS[c.k]));
  if (exp.length) reasons.push(`${exp.length} av ${e.experts.length} av Svenska Spels experter har med ${SIGNS[c.k]}.`);
  reasons.push(`Den går in ungefär ${Math.max(1, Math.round(c.p * 10))} av 10 gånger enligt datan – en chansning.`);
  return { ...c, eventNumber: e.eventNumber, sign: SIGNS[c.k], home: e.home, away: e.away, league: e.league, kickoff: e.kickoff, outcome: names[c.k], hit: e.result?.outcome ? e.result.outcome === SIGNS[c.k] : null, score: e.result?.score || null, reasons };
}

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
/** Genererar filkupong A med dina krav. krav: { [eventNumber]: { signs, scope } } (bara A finns sedan 2026-10-25, alla krav
 *  gäller A). rows: summa i kr (1 kr/rad), t.ex. { A: 500 } – saknas den gäller FILE_RULES.rows. */
export function generateCoupons(p, krav, { rows = null } = {}) {
  // Systemen byggs på matchens justerade procent (spikbedömningen) när den används, annars på modellens
  const events = p.events.map((e) => ({ ...e, final: sysFinal(e) }));
  const forcedFor = (sys) => events.map((e) => {
    const k = krav[e.eventNumber];
    const on = Boolean(k); // bara A finns – alla krav gäller A
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
  // bara köra på fil"): A som Egna rader-fil. B och C borttagna 2026-10-25 (användaren: "Vi ska bara ha A kvar så ta bort b och c").
  const { A } = buildFileCoupons(p, events, forcedFor, base, rows ? { ...FILE_RULES, rowsBy: rows } : FILE_RULES);
  return { A };
}

// ---------- Filkupong A (användaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att göra, ta bort
// alla regler, vill bara köra på fil"). Spelas som Egna rader-fil hos Svenska Spel. Inga färg-, tecken- eller GC-regler:
//   spikar: 4 st (användaren 2026-10-20: "föreslå alltid 4 spikar där en ska vara lite mer skrällig") – omgångens 3
//      starkaste favoriter (vår procent) + omgångens bästa skrällspik (skrallTips förstaval, på en annan match) – har du
//      egna spikar spikas inga andra matcher
//   A: de 500 troligaste raderna med minst 30 000 kr för 13 rätt – på Stryktipset sedan 2026-10-30 vägda med √utdelning
//      (FILE_RULES.utdVikt), så underspelade tecken får plats och överstreckade favoriter straffas
// Bakkört 2026-10-11 (kupongarkivet, ST 169 / ET 183 omg, scripts/backtest-stryk-fil.mjs): A chans 1 på 170 / 162 med 2 spikar
// (0 spikar 1 på 168 / 159, 4 spikar 1 på 181 / 174); A+B bäst med 2 (1 på 96 / 92). Båda spikarna satt i 80 / 90 omg.
// C: bonus 1,3 gav 1 på 177 / 167 (2: 1 på 220 / 195). 4 spikar varav 1 skräll sedan 2026-10-20 (användarens val).
// Starka spikar bedöms match för match på data (användaren 2026-10-25 efter Chelsea–Tottenham 0–2: "spik baserat på data
// inte på streck i första hand ... alla matcher enskilt först bedöms på data"): favoriten måste ha minst spikDataMin enligt
// vår oddsfria modell (e.model) och vara samma tecken som favoriten i vår procent. Färre matcher klarar det -> färre spikar.
// utdVikt: raderna väljs på chans × utdelning^utdVikt (utdelning för 13 rätt enligt folkets streck) i stället för bara chans.
// Underspelade tecken går inte in oftare än oddsen säger men betalar 1,35–1,6× mer än folket prissätter (158 omg, 2026-10-30).
// Bakkörning 171 ST-omg: 0,5 ger väntad utdelning per 13 rätt 38 000 → 73 000 kr mot chans 1 på 168 → 200; 1,0 dödar chansen
// (1 på 1 900). Europatipset: för svagt underlag (189 omg, sämre utfall) – bara chans där. Användaren 2026-10-30: "vinna mycket
// så måste vara skrällar samt hitta något som är underspelat".
export const FILE_RULES = { rows: 500, payoutMin: 30000, spikes: 4, skrallSpikes: 1, spikDataMin: 0.55, utdVikt: { stryktipset: 0.5, europatipset: 0 } };
/** Utdelningsvikten för ett spel: ett tal i reglerna gäller alla spel (bakkörning), annars per spel. */
export function utdViktFor(r, product) {
  return typeof r.utdVikt === "number" ? r.utdVikt : (r.utdVikt?.[product] ?? 0);
}
/** Datachansen för favoriten om matchen duger som stark spik på data, annars null (ingen modell, under spikDataMin eller
 *  datan har en annan favorit än vår procent). */
export function dataSpikP(e, r = FILE_RULES) {
  if (!e.model?.length) return null;
  const p = Math.max(...e.model);
  return p >= r.spikDataMin && e.model.indexOf(p) === favIdx(e) ? p : null;
}
// Egen summa per kupong (användaren 2026-10-12: "jag ska kunna bestämma summa fortfarande"), 1 kr per rad
export const FILE_BUDGET = { min: 1, max: 10000 };
export function clampFileRows(n, fallback = FILE_RULES.rows) {
  const x = Math.round(Number(n));
  if (n == null || String(n).trim() === "" || !Number.isFinite(x)) return fallback;
  return Math.max(FILE_BUDGET.min, Math.min(FILE_BUDGET.max, x));
}
/** Spikar för filkupongerna: n spikar, varav skrall st på omgångens bästa skrällspik (skrallTips: inte favoriten, på en
 *  annan match än de starka) och resten på favoriten i de matcher som är starkast på data (dataSpikP – bara de som klarar
 *  datakravet var för sig). Finns ingen skräll blir det ännu en stark favorit om någon match klarar kravet. Har du egna
 *  spikar spikas inga andra matcher (användaren 2026-10-12: "har jag hittat egna spikar så ska du göra om de icke låsta
 *  matcherna om det är spik i någon av dom"). */
export function strongSpikeForced(events, forced, n = FILE_RULES.spikes, skrall = FILE_RULES.skrallSpikes) {
  const own = forced.filter((f) => f?.length === 1).length;
  if (own) return forced.slice();
  const free = events.map((e, i) => ({ i, p: dataSpikP(e) })).filter((x) => forced[x.i] == null && x.p != null).sort((a, b) => b.p - a.p);
  const out = forced.slice();
  const nSkrall = Math.min(skrall, n);
  for (const { i } of free.slice(0, n - nSkrall)) out[i] = [favIdx(events[i])];
  const tips = nSkrall ? skrallTips(events, events.length).filter((t) => out[t.i] == null).slice(0, nSkrall) : [];
  for (const t of tips) out[t.i] = [t.k];
  // Ingen skräll att spika: nästa starka favorit i stället
  for (const { i } of free.filter((x) => out[x.i] == null).slice(0, nSkrall - tips.length)) out[i] = [favIdx(events[i])];
  return out;
}
export function buildFileCoupons(p, events, forcedFor, base, r = FILE_RULES) {
  const make = (sys, extra = {}) => {
    // Egen fördelning på en match: den spikas aldrig automatiskt, raderna fördelas efter dina andelar
    const plan = buildFallSharePlan(p, events, forcedFor(sys), sys);
    const nPlan = plan.filter(Boolean).length;
    // En egen fördelning med bara ett tecken (t.ex. 100/0/0, kopierad från en spik när % slogs På) är en spik och räknas
    // in i de 4 – annars blev det 5 spikar (användaren 2026-10-21: "vill ha 4 spikar om jag inte valt 5 av egen vilja")
    const planSpikes = plan.filter((s) => s && s.filter((x) => x > 0).length === 1).length;
    const forced = strongSpikeForced(events, forcedFor(sys).map((f, i) => f ?? (plan[i] ? [0, 1, 2] : null)), Math.max(0, r.spikes - planSpikes));
    const utdVikt = utdViktFor(r, p.product);
    const select = () => selectEgnaRows(events, forced, base, { rows: clampFileRows(r.rowsBy?.[sys], r.rows), payoutMin: r.payoutMin, fallPlan: plan, utdVikt, ...extra });
    let picked = select();
    if (!picked) return null;
    // Egna spikar: en fri match där alla rader ändå fick samma tecken (stark favorit) görs om med vår chans som fördelning,
    // så att bara dina matcher är spikar (användaren 2026-10-12)
    // (upprepas: en omgjord match kan flytta spiken till en annan)
    // Utan egna spikar (bara starka spikar på data, 2026-10-25) går utdelningsgolvet före omgörningen: hellre en spik av sig
    // själv än rader under 30 000 kr
    const own = forcedFor(sys).some((f) => f?.length === 1);
    const redo = [];
    for (let guard = 0; forced.some((f) => f?.length === 1) && guard < events.length; guard++) {
      const spiked = events.map((_, i) => i).filter((i) => forced[i] == null && !plan[i] && new Set(picked.rowList.map((row) => row[i])).size === 1);
      if (!spiked.length) break;
      for (const i of spiked) plan[i] = events[i].final.map((x) => x * 100);
      const next = select();
      if (!next) return null;
      if (!own && next.payoutShort && !picked.payoutShort) {
        for (const i of spiked) plan[i] = null;
        break;
      }
      redo.push(...spiked);
      picked = next;
    }
    redo.sort((a, b) => a - b);
    // turnover = typisk omsättning: sidan räknar live med max(live-omsättning, typisk), annars blir omsättningen tidigt i veckan
    // så låg att inga rader når 30 000 kr (Europatipset 2026-10-11)
    const c = finishEgnaRader(p, events, forcedFor(sys), base, picked, sys, { file: true, spikes: forced.filter((f) => f?.length === 1).length, turnover: base.turnover || base.realTurnover, utdVikt });
    c.picks = c.picks.map((x, i) => ({ ...x, spikStrong: forced[i]?.length === 1 && forcedFor(sys)[i] == null, spikSkrall: forced[i]?.length === 1 && forcedFor(sys)[i] == null && forced[i][0] !== favIdx(events[i]), shares: plan[i] || null }));
    if (redo.length) c.relaxed = [...c.relaxed, `match ${redo.map((i) => events[i].eventNumber).join(", ")} blev spik av sig själv och är omgjord efter vår chans – ${own ? "bara dina spikar är spikar" : "bara datastarka favoriter och skrällspiken spikas"}`];
    if (nPlan) c.relaxed = [...c.relaxed, `${nPlan} ${nPlan === 1 ? "match" : "matcher"} med din egen fördelning (${sys} %)`];
    if (picked.payoutShort) c.relaxed = [...c.relaxed, `några rader ger under ${r.payoutMin.toLocaleString("sv-SE")} kr – fördelningen gick före utdelningsgolvet`];
    return c;
  };
  return { A: make("A") };
}

const decodeRow = (code, n) => {
  const s = new Array(n);
  for (let i = n - 1; i >= 0; i--) { s[i] = SIGNS[code % 3]; code = Math.floor(code / 3); }
  return s.join("");
};

/**
 * Topp-N rader med utdelning ≥ payoutMin.
 * exclude = Set av radkoder att hoppa över.
 * utdVikt = w: raderna rangordnas på chans × utdelning^w (0 = bara chans). Grenkapningen använder högsta möjliga chans
 * (pRest) och lägsta möjliga streck (fRest = högsta utdelning) i resten av raden, så urvalet är exakt även med vikt.
 */
function selectTopRows(events, forced, base, { rows: N, payoutMin, exclude = null, utdVikt = 0 } = {}) {
  const n = events.length;
  const RT = base.realTurnover || base.turnover, J = base.jackpot || 0;
  const pot = PAYOUT_13 * RT + J;
  const fMax = (pot / payoutMin - 1) / RT;
  const sc = utdVikt ? (pr, f) => pr * Math.pow(pot / (1 + RT * f), utdVikt) : (pr) => pr;
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
    if (size === N && sc(pr * pRest[i], f * fRest[i]) <= hs[0]) return;
    if (i === n) {
      if (hasEx && exclude.has(code)) return;
      push(sc(pr, f), pr, f, code);
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

// ---------- Egen fördelning per match (användaren 2026-10-12: "jag ska kunna bestämma fördelningen själv som förut").
// Samma metod som gamla D/E/F %: p.fileShares = { A: { nr: [a,b,c] }, B: { … }, C: { … } } – andel rader per tecken.
/** Andelar → antal rader per tecken som summerar till N (bara allowed-tecken får > 0). */
export function fallShareTargets(N, shares, allowed = [0, 1, 2]) {
  const w = [0, 1, 2].map((k) => (allowed.includes(k) ? Math.max(0, Number(shares?.[k]) || 0) : 0));
  const sum = w.reduce((a, b) => a + b, 0);
  if (!sum || !N) return [0, 0, 0];
  const raw = w.map((x) => (x / sum) * N);
  const out = raw.map((x) => Math.floor(x));
  let left = N - out.reduce((a, b) => a + b, 0);
  const order = [0, 1, 2].filter((k) => w[k] > 0).sort((a, b) => (raw[b] - out[b]) - (raw[a] - out[a]));
  for (let i = 0; left > 0 && order.length; i++, left--) out[order[i % order.length]]++;
  return out;
}


/** Plan per match för kupong sys: null = fri, annars [andel 1, X, 2]. forced = dina teckenkrav (spik = rör inte). */
export function buildFallSharePlan(p, events, forced, sys = "A") {
  const custom = p?.fileShares?.[sys] || {};
  return events.map((e, i) => {
    const allowed = forced[i] || [0, 1, 2];
    if (allowed.length <= 1) return null;
    const own = custom[e.eventNumber] ?? custom[String(e.eventNumber)];
    if (own?.length === 3 && own.some((x) => Number(x) > 0)) return [0, 1, 2].map((k) => (allowed.includes(k) ? Number(own[k]) || 0 : 0));
    return null;
  });
}

/** Exakt N rader med given andel på match mi (tvingar tecknet per delmängd). */
function selectStratifiedOnMatch(events, forced, base, { N, payoutMin, exclude, utdVikt, mi, shares }) {
  const allowed = forced[mi] || [0, 1, 2];
  const targets = fallShareTargets(N, shares, allowed);
  const used = new Set(exclude || []);
  const parts = [];
  let pot, RT, J;
  for (const k of [0, 1, 2]) {
    const need = targets[k];
    if (need <= 0) continue;
    const f2 = events.map((_, i) => (i === mi ? [k] : (forced[i] || [0, 1, 2])));
    const sel = selectTopRows(events, f2, base, { rows: need, payoutMin, exclude: used, utdVikt });
    if (!sel?.size) continue;
    pot = sel.pot; RT = sel.RT; J = sel.J;
    for (let j = 0; j < sel.size; j++) {
      used.add(sel.codes[j]);
      parts.push({ code: sel.codes[j], p: sel.rowP[j], real: sel.rowReal[j], row: sel.rowList[j] });
    }
  }
  // Fyll om något tecken saknade rader (utdelningsgolvet) – utan att förstöra kvoterna mer än nödvändigt
  if (parts.length < N) {
    const fill = selectTopRows(events, forced, base, { rows: N - parts.length, payoutMin, exclude: used, utdVikt });
    if (fill) {
      pot = pot ?? fill.pot; RT = RT ?? fill.RT; J = J ?? fill.J;
      for (let j = 0; j < fill.size; j++) {
        used.add(fill.codes[j]);
        parts.push({ code: fill.codes[j], p: fill.rowP[j], real: fill.rowReal[j], row: fill.rowList[j] });
      }
    }
  }
  if (!parts.length) return null;
  parts.sort((a, b) => b.p - a.p);
  return {
    pot, RT, J, size: parts.length, N, payoutMin,
    rowList: parts.map((r) => r.row),
    rowP: parts.map((r) => r.p),
    rowReal: parts.map((r) => r.real),
    codes: parts.map((r) => r.code),
    fallApplied: true,
  };
}


/**
 * N rader där varje match med fallPlan får exakt de andelarna (byte mellan två rader behåller kvoterna).
 * En gemensam pool räckte inte: senare matcher kom aldrig ner i filen.
 */
function selectByQuotas(events, forced, base, { rows: N, payoutMin, exclude = null, utdVikt = 0, fallPlan }) {
  const n = events.length;
  const P = events.map((e) => e.final);
  const Folk = events.map((e) => [0, 1, 2].map((k) => e.folk?.[k] ?? e.final[k]));
  const RT = base.realTurnover || base.turnover || 1e7;
  const J = base.jackpot || 0;
  const pot = PAYOUT_13 * RT + J;
  const fMax = payoutMin > 0 ? (pot / payoutMin - 1) / RT : Infinity;
  const allowed = events.map((_, i) => {
    const baseA = forced[i]?.length ? forced[i] : [0, 1, 2];
    const sh = fallPlan?.[i];
    if (!sh) return baseA.slice();
    const pos = baseA.filter((k) => Number(sh[k]) > 0);
    return pos.length ? pos : baseA.slice();
  });
  const quota = events.map((_, i) => (fallPlan?.[i] ? fallShareTargets(N, fallPlan[i], allowed[i]) : null));
  const sign = Array.from({ length: N }, () => new Array(n));
  const rnd0 = mulberry32((N * 17 + n * 13) >>> 0);
  const freeIdx = [];
  for (let i = 0; i < n; i++) {
    if (!quota[i]) { freeIdx.push(i); continue; }
    const col = [];
    for (let k = 0; k < 3; k++) for (let t = 0; t < quota[i][k]; t++) col.push(k);
    for (let j = col.length - 1; j > 0; j--) {
      const s = Math.floor(rnd0() * (j + 1));
      [col[j], col[s]] = [col[s], col[j]];
    }
    for (let j = 0; j < N; j++) sign[j][i] = col[j];
  }
  const fAt = (j) => {
    let f = 1;
    for (let i = 0; i < n; i++) f *= Folk[i][sign[j][i]];
    return f;
  };
  const codeAt = (j) => {
    let c = 0;
    for (let i = 0; i < n; i++) c = c * 3 + sign[j][i];
    return c;
  };
  const pAt = (j) => {
    let pr = 1;
    for (let i = 0; i < n; i++) pr *= P[i][sign[j][i]];
    return pr;
  };
  // Radens vikt vid bytena nedan: chans × utdelning^utdVikt, samma som selectTopRows
  const scAt = (j) => (utdVikt ? pAt(j) * Math.pow(pot / (1 + RT * fAt(j)), utdVikt) : pAt(j));
  for (let j = 0; j < N; j++) {
    let f = 1;
    for (let i = 0; i < n; i++) if (quota[i]) f *= Folk[i][sign[j][i]];
    for (let t = 0; t < freeIdx.length; t++) {
      const i = freeIdx[t];
      const last = t === freeIdx.length - 1;
      let best = allowed[i][0], bestS = -Infinity;
      for (const k of allowed[i]) {
        const nf = f * Folk[i][k];
        const fits = !last || nf <= fMax;
        const s = (fits ? 1e6 : 0) + P[i][k] * 100 - Folk[i][k];
        if (s > bestS) { bestS = s; best = k; }
      }
      sign[j][i] = best;
      f *= Folk[i][best];
    }
  }
  const used = new Set(exclude || []);
  for (let j = 0; j < N; j++) {
    let guard = 0;
    while (guard < 40 && used.has(codeAt(j))) {
      guard++;
      if (freeIdx.length) {
        const i = freeIdx[guard % freeIdx.length];
        const opts = allowed[i];
        sign[j][i] = opts[(opts.indexOf(sign[j][i]) + guard) % opts.length];
      } else if (N > 1) {
        const i = guard % n;
        const o = (j + guard) % N;
        if (o !== j) { const tmp = sign[j][i]; sign[j][i] = sign[o][i]; sign[o][i] = tmp; }
      } else break;
    }
    used.add(codeAt(j));
  }
  const swapOk = (j, o) => {
    const cj = codeAt(j), co = codeAt(o);
    if (cj === co || used.has(cj) || used.has(co)) return false;
    return fAt(j) <= fMax && fAt(o) <= fMax;
  };
  for (let pass = 0; pass < 3; pass++) {
    let progress = false;
    for (let j = 0; j < N; j++) {
      if (fAt(j) <= fMax) continue;
      let fixed = false;
      for (const i of freeIdx) {
        for (const k of allowed[i].slice().sort((a, b) => Folk[i][a] - Folk[i][b])) {
          if (k === sign[j][i]) continue;
          const prev = sign[j][i], old = codeAt(j);
          used.delete(old);
          sign[j][i] = k;
          if (fAt(j) <= fMax && !used.has(codeAt(j))) { used.add(codeAt(j)); fixed = true; progress = true; break; }
          sign[j][i] = prev;
          used.add(old);
        }
        if (fixed) break;
      }
      if (fixed) continue;
      const step = Math.max(1, Math.floor(N / 20));
      for (let i = 0; i < n && !fixed; i++) {
        for (let t = 0, o = (j + step) % N; t < 20 && !fixed; t++, o = (o + step) % N) {
          if (o === j || sign[o][i] === sign[j][i]) continue;
          if (Folk[i][sign[o][i]] >= Folk[i][sign[j][i]]) continue;
          const a = sign[j][i], b = sign[o][i];
          const cj0 = codeAt(j), co0 = codeAt(o);
          used.delete(cj0); used.delete(co0);
          sign[j][i] = b; sign[o][i] = a;
          if (swapOk(j, o)) { used.add(codeAt(j)); used.add(codeAt(o)); fixed = true; progress = true; }
          else { sign[j][i] = a; sign[o][i] = b; used.add(cj0); used.add(co0); }
        }
      }
    }
    if (!progress) break;
  }
  const rnd = mulberry32((N * 91 + 7) >>> 0);
  for (let t = 0; t < 2000; t++) {
    const j = Math.floor(rnd() * N), o = Math.floor(rnd() * N);
    if (j === o) continue;
    const i = Math.floor(rnd() * n);
    if (sign[j][i] === sign[o][i]) continue;
    const before = scAt(j) + scAt(o);
    const fj = fAt(j), fo = fAt(o);
    const a = sign[j][i], b = sign[o][i];
    const cj0 = codeAt(j), co0 = codeAt(o);
    used.delete(cj0); used.delete(co0);
    sign[j][i] = b; sign[o][i] = a;
    const after = scAt(j) + scAt(o);
    const payOk = fAt(j) <= fMax && fAt(o) <= fMax;
    const wasBad = fj > fMax || fo > fMax;
    if (payOk && !used.has(codeAt(j)) && !used.has(codeAt(o)) && (after > before || wasBad)) {
      used.add(codeAt(j)); used.add(codeAt(o));
    } else {
      sign[j][i] = a; sign[o][i] = b;
      used.add(cj0); used.add(co0);
    }
  }
  {
    // Fria matcher som alla får samma tecken ger dubbletter. Byt dem till en unik kombination.
    const seen = new Set(exclude || []);
    const vary = freeIdx.filter((i) => allowed[i].length > 1);
    for (let j = 0; j < N; j++) {
      let guard = 0;
      while (seen.has(codeAt(j)) && vary.length && guard++ < 64) {
        let x = (j + 1) * 997 + guard * 131;
        for (const i of vary) {
          const opts = allowed[i];
          sign[j][i] = opts[x % opts.length];
          x = Math.floor(x / opts.length);
        }
      }
      seen.add(codeAt(j));
    }
  }
  const order = [...Array(N).keys()].sort((a, b) => pAt(b) - pAt(a) || codeAt(a) - codeAt(b));
  const rowReal = order.map((j) => pot / (1 + RT * fAt(j)));
  return {
    pot, RT, J, size: N, N, payoutMin,
    rowList: order.map((j) => sign[j].map((k) => SIGNS[k]).join("")),
    rowP: order.map((j) => pAt(j)),
    rowReal,
    codes: order.map((j) => codeAt(j)),
    fallApplied: true,
    payoutShort: rowReal.some((x) => x + 1e-6 < payoutMin),
  };
}

/**
 * Välj N rader. Utan egna andelar: de troligaste med utdelningsgolv.
 * En match med andelar: exakt stratifiering. Flera matcher: kvoter så varje matchs procent finns i filen.
 */
function selectEgnaRows(events, forced, base, { rows: N, payoutMin, exclude = null, utdVikt = 0, fallPlan = null } = {}) {
  const fallIdx = (fallPlan || []).map((s, i) => (s ? i : -1)).filter((i) => i >= 0);
  if (!fallIdx.length) return selectTopRows(events, forced, base, { rows: N, payoutMin, exclude, utdVikt });
  if (fallIdx.length === 1) {
    const primary = fallIdx[0];
    return selectStratifiedOnMatch(events, forced, base, {
      N, payoutMin, exclude, utdVikt, mi: primary, shares: fallPlan[primary],
    }) || selectTopRows(events, forced, base, { rows: N, payoutMin, exclude, utdVikt });
  }
  return selectByQuotas(events, forced, base, { rows: N, payoutMin, exclude, utdVikt, fallPlan });
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
