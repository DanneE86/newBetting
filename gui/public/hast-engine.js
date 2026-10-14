// Systembyggare för fliken "Hästar" (V75/V85/V86/V64/V65/GS75). Ren logik: körs i webbläsaren (hastar.js)
// och i testerna (tests/hastar.spec.ts).
//
// Rakt system: girig utbyggnad. Varje avdelning startar med hästen som har högst värdevikt
//   w = chans · clamp(chans / streck, 0,3, 3)^alpha   (alpha 0,5: spelvärde väger in, men chansen styr mest)
// och sedan läggs den häst till som ger mest ökad täckning per ökad kostnad (Δlog Σw / Δlog rader),
// så länge systemet ryms i budgeten. Favoriter tas alltså inte automatiskt – överstreckade hästar får lägre vikt.
// Högsta rad (minTop): systemets mest ospelade rad ska kunna ge minst minTop kr vid alla rätt. Utdelning för en rad
//   ≈ potandel · radpris / folkets sannolikhet för raden (produkten av strecken), oberoende av omsättningen.
//   Optimeras exakt (optimizeWithTop): per avdelning provas de k bästa hästarna (k = 1–8), med eller utan en skräll
//   (lägre streck, chans ≥ 2 %); dynamisk programmering väljer kombinationen med högst Σlog(täckning) inom budget
//   och spärr. Klaras inte spärren inom budgeten byggs ett vanligt system och topOk = false.
// Reducerat system: ett större utgångssystem (budget × utgång) skrivs ut rad för rad, villkoren filtrerar,
// och om det fortfarande är för många rader behålls raderna med högst värdeviktad sannolikhet.

export const ROW_PRICE = { V85: 0.5, V75: 0.5, V86: 0.25, GS75: 1, V65: 1, V64: 1 };
// Radpriset ändras från ett datum (nya V75 från 2026-11-28: 60 öre, 65 % återbetalning, 40 % av potten till 7 rätt –
// travsport.se 2026-09-17). Äldre omgångar räknas med det gamla priset, så bakkörningen rättas mot rätt insats.
export const ROW_PRICE_FROM = { V75: [["2026-11-28", 0.6]] };
/** Radpris för spelformen en viss dag (ISO-datum). Utan datum: dagens pris. */
export function rowPrice(type, date = new Date().toISOString().slice(0, 10)) {
  let price = ROW_PRICE[type] ?? 1;
  for (const [from, p] of ROW_PRICE_FROM[type] || []) if (String(date) >= from) price = p;
  return price;
}
export const BUDGETS = [100, 200, 500, 1000, 2000, 5000];
// Skrällsystemet (≥ 3 skrällar/rad) bakkört 2024–2026 (2026-10-07): 200 kr minus alla tre år (−28/−50/−81 %),
// 500 kr ojämnt, 1 000 kr plus alla tre. Knappen väljer därför minst 1 000 kr och varnar under det.
export const SKRALL_MIN_BUDGET = 1000;
// Högsta vinstnivåns andel av omsättningen utan jackpott (ATG-data 2025–2026, 10:e percentilen/vanligaste värdet)
export const TOP_SHARE = { V85: 0.195, V86: 0.26, V75: 0.26, GS75: 0.285, V64: 0.34, V65: 0.355 };
// Alla system ska alltid kunna ge minst MIN_TOP kr vid alla rätt (användarens krav 2026-10-03); högre spärr kan väljas
export const MIN_TOP = 50000;
export const TOP_LEVELS = [50000, 250000, 1000000];
// 50 000-systemet: reducerat, utgång 16 ×, varje rad ska kunna ge minst RAD_TOP kr vid alla rätt. Bakkört 2026-10-10
// (365 omg V85/V75 2022–2026, rullande modell), spärrar 30k/50k/75k/100k/200k per rad provade: 50 000 på 2000 kr bäst –
// +129 % (utan största +87 %, utan 3 största +39 %, 8 vinster ≥ 50 000 kr, plus 4 av 5 år, 2024 −81 %). 200 000 gav
// +740 % men utan 3 största −64 %. 1000 kr +91 % (utan 3 −44 %), 500 kr +127 % (utan 3 −54 %). Därför minst RAD_TOP_MIN_BUDGET.
export const RAD_TOP = 50000;
export const RAD_TOP_MIN_BUDGET = 2000;
export const SKRALL_MAX = 0.1; // häst med streck under 10 % räknas som skräll i systemvillkoren
// Standard per spelform (bakkörning 2026-10-04: V75 2021–2025 370 omg + V85 74 omg, riktig utdelning, spärr 50 000 kr):
// Värdefokus Hög (alpha 1) slog Normal (0,5) i 3 av 4 perioder på 1000 och 2000 kr och 2 av 4 på 200 och 500 kr,
// ROI utan största vinsten 500/1000/2000 kr −26/−12/−12 % mot −30/−25/−37 %, lika många alla rätt. Den fångar fler
// vinnare under 10 % streck (17–28 % mot 14–26 %). V75 följer med eftersom V75 ersätter V85 från 2026-11-28.
// Avvisat samma dag: tvinga in en häst under 10 % i 1–4 avdelningar (grundsystemet har redan oftast 2; 3–4 gav
// färre alla rätt och sämre ROI), skrällkalibrering (chans × 1,1–1,4 under 10 % streck: modellen tar redan det
// mesta, ojämnt mellan perioderna). Kvar från tidigare: V85 Normal slog Träff 2026; V86 och GS75 Träff (ej testat nu).
// Ren data (2026-10-13/14: chans utan streck/odds, alpha 0 överallt) togs bort 2026-10-14 efter skrällmissanalysen
// (658 omg: ren data huvudorsak till missarna). Marknadsmodellen och värdefokus är tillbaka.
export const DEFAULT_ALPHA = { V85: 1, V75: 1 };
// Testat och avvisat 2026-10-03: spikspärr (spik bara vid streck ≥ 50/60 %) – färre spikar föll, men de extra
// hästarna kostade mer än de gav på 4 av 5 budgetar.
export const defaultAlpha = (type) => DEFAULT_ALPHA[type] ?? 0;

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/** Värdevikt för en häst. */
export function weight(h, alpha = 0.5) {
  const v = h.marketPct > 0 ? h.p / h.marketPct : 1;
  return (h.p || 0) * Math.pow(clamp(v, 0.3, 3), alpha);
}

/** Hästar som kan spelas i en avdelning (ej strukna, med chans). */
const playable = (leg) => leg.horses.filter((h) => !h.scratched && h.p != null);

/** Uppskattad utdelning för en rad med alla rätt: potandel · radpris / produkten av strecken. */
export const rowPayout = (streckProduct, price, share = 0.25) => (streckProduct > 0 ? (share * price) / streckProduct : null);

const minStreck = (s) => Math.max(1e-4, Math.min(...s.map((h) => h.marketPct || 1e-4)));

const summarize = (legs, sel, price, share) => {
  const rows = sel.reduce((a, s) => a * s.length, 1);
  const topP = sel.reduce((a, s) => a * minStreck(s), 1);
  const topRow = sel.map((s) => s.reduce((m, h) => ((h.marketPct || 1e-4) < (m.marketPct || 1e-4) ? h : m)).nr);
  const hit = sel.reduce((a, s) => a * s.reduce((x, h) => x + h.p, 0), 1);
  const mkt = sel.reduce((a, s) => a * s.reduce((x, h) => x + (h.marketPct || 0), 0), 1);
  return {
    legs: legs.map((l, i) => ({ leg: l.leg, raceNr: l.number, horses: [...sel[i]].sort((a, b) => b.p - a.p).map((h) => h.nr) })),
    rows,
    cost: Math.round(rows * price * 100) / 100,
    hit,
    marketHit: mkt,
    valueIndex: mkt > 0 ? hit / mkt : null,
    topRow,
    topPayout: rowPayout(topP, price, share),
    // Avdelningar med minst en häst under SKRALL_MAX streck (en fjärdedel av alla avdelningar vinns av en sådan)
    skrallLegs: sel.filter((s) => s.some((h) => (h.marketPct ?? 1) < SKRALL_MAX)).length,
  };
};

// Spikar (användarens krav 2026-10-12: "ha alltid två spikar"): varje system har exakt SPIKES avdelningar med en häst.
// Spiken är avdelningens häst med högst chans; alla par av avdelningar provas och det par som ger systemets bästa
// mått (träff: chans för alla rätt, storvinst: väntad andel av målet) väljs. Övriga avdelningar får minst två hästar.
// Egna låsta enhästavdelningar räknas som spikar. spikes: null = fritt som förut.
export const SPIKES = 2;

const topHorse = (l) => playable(l).filter((h) => h.p > 0).sort((a, b) => b.p - a.p)[0];

function* combos(arr, k, start = 0, acc = []) {
  if (acc.length === k) yield acc;
  else for (let i = start; i < arr.length; i++) yield* combos(arr, k, i + 1, [...acc, arr[i]]);
}

/** Bygger systemet med exakt `spikes` spikar. build(locked, wide) → system, score(system) → tal (högst bäst). */
function withSpikes(legs, { locked = {}, spikes, budget, price }, build, score) {
  if (spikes == null) return build(locked, null);
  const free = legs.filter((l) => !locked[l.leg]?.length && playable(l).filter((h) => h.p > 0).length >= 2);
  const need = Math.max(0, spikes - legs.filter((l) => locked[l.leg]?.length === 1).length);
  if (need > free.length) return build(locked, null);
  const maxRows = Math.floor(budget / price + 1e-9);
  const lockedRows = legs.reduce((a, l) => a * (locked[l.leg]?.length || 1), 1);
  let best = null;
  for (const combo of combos(free, need)) {
    const lk = { ...locked };
    for (const l of combo) lk[l.leg] = [topHorse(l).nr];
    const wideLegs = free.filter((l) => !combo.includes(l)).map((l) => l.leg);
    // Räcker budgeten inte till två hästar i övriga avdelningar läggs bara spikarna fast
    const wide = lockedRows * 2 ** wideLegs.length <= maxRows ? new Set(wideLegs) : null;
    const s = build(lk, wide);
    if (!best || (s.topOk && !best.topOk) || (s.topOk === best.topOk && score(s) > score(best))) best = s;
  }
  return best;
}

/**
 * Rakt system inom budget. legs: [{ leg, number, horses: [{ nr, p, marketPct, scratched }] }].
 * locked: { [leg]: [nr, ...] } tvingar in hästar (t.ex. egen spik). spikes: antal spikar (SPIKES), null = fritt.
 */
export function buildSystem(legs, opts = {}) {
  const { budget, price = 0.5, locked = {}, spikes = SPIKES } = opts;
  return withSpikes(legs, { locked, spikes, budget, price }, (lk, wide) => buildSystemCore(legs, { ...opts, locked: lk, wide }), (s) => s.hit);
}

function buildSystemCore(legs, { budget, price = 0.5, alpha = 0.5, locked = {}, minTop = 0, topShare = 0.25, wide = null } = {}) {
  const pools = legs.map((l) => playable(l).map((h) => ({ ...h, w: weight(h, alpha) })).sort((a, b) => b.w - a.w));
  const sel = pools.map((pl, i) => {
    const lock = locked[legs[i].leg];
    return lock?.length ? pl.filter((h) => lock.includes(h.nr)) : pl.slice(0, wide?.has(legs[i].leg) ? 2 : 1);
  });
  const maxRows = Math.floor(budget / price + 1e-9);
  let rows = sel.reduce((a, s) => a * s.length, 1);
  if (minTop > 0) {
    const opt = optimizeWithTop(pools, legs, locked, maxRows, Math.log((topShare * price) / minTop), wide);
    if (opt) {
      const out = summarize(legs, opt, price, topShare);
      out.topOk = true;
      return out;
    }
  }
  for (;;) {
    let best = null;
    pools.forEach((pl, i) => {
      if (locked[legs[i].leg]?.length) return;
      const next = pl.find((h) => !sel[i].includes(h));
      if (!next) return;
      const n = sel[i].length;
      if ((rows / n) * (n + 1) > maxRows) return;
      const W = sel[i].reduce((a, h) => a + h.w, 0);
      const gain = Math.log((W + next.w) / W) / Math.log((n + 1) / n);
      if (!best || gain > best.gain) best = { i, h: next, gain };
    });
    if (!best) break;
    rows = (rows / sel[best.i].length) * (sel[best.i].length + 1);
    sel[best.i].push(best.h);
  }
  const out = summarize(legs, sel, price, topShare);
  out.topOk = !minTop || (out.topPayout ?? 0) >= minTop;
  return out;
}

/**
 * Bästa system med högsta rad-spärr. pools: hästar per avdelning sorterade efter vikt w. targetLogS: log av största
 * tillåtna produkt av strecken på högsta raden. Returnerar valda hästar per avdelning eller null om omöjligt.
 */
function optimizeWithTop(pools, legs, locked, maxRows, targetLogS, wide = null) {
  const options = pools.map((pl, i) => {
    const lock = locked[legs[i].leg];
    const sets = [];
    if (lock?.length) sets.push(pl.filter((h) => lock.includes(h.nr)));
    else
      // Avdelningar som ska ha minst två hästar (wide) får också favorit + skräll (k = 1 plus en häst med lägre streck)
      for (let k = 1; k <= Math.min(8, pl.length); k++) {
        const base = pl.slice(0, k);
        sets.push(base);
        const low = minStreck(base);
        pl.slice(k)
          .filter((h) => h.p >= 0.02 && h.marketPct > 0 && h.marketPct < low)
          .sort((x, y) => y.p - x.p)
          .slice(0, 5)
          .forEach((h) => sets.push([...base, h]));
      }
    const minLen = !lock?.length && wide?.has(legs[i].leg) ? 2 : 1;
    return sets
      .filter((set) => set.length >= minLen && set.length <= maxRows)
      .map((set) => ({ set, n: set.length, logS: Math.log(minStreck(set)), logW: Math.log(set.reduce((a, h) => a + h.w, 0) || 1e-9) }));
  });
  // Pareto-tillstånd: nyckel rader|streckhink → bästa täckning
  let states = new Map([["1|0", { rows: 1, logS: 0, logW: 0, pick: [] }]]);
  for (const opts of options) {
    const next = new Map();
    for (const st of states.values())
      for (const o of opts) {
        const rows = st.rows * o.n;
        if (rows > maxRows) continue;
        const logS = st.logS + o.logS;
        const key = `${rows}|${Math.round(logS * 20)}`;
        const logW = st.logW + o.logW;
        const cur = next.get(key);
        if (!cur || logW > cur.logW) next.set(key, { rows, logS, logW, pick: [...st.pick, o.set] });
      }
    // Gallra: inom samma streckhink är fler rader med sämre täckning onödigt
    const byBucket = new Map();
    for (const st of next.values()) {
      const b = Math.round(st.logS * 20);
      if (!byBucket.has(b)) byBucket.set(b, []);
      byBucket.get(b).push(st);
    }
    states = new Map();
    for (const list of byBucket.values()) {
      list.sort((x, y) => x.rows - y.rows);
      let bestW = -Infinity;
      for (const st of list)
        if (st.logW > bestW) {
          bestW = st.logW;
          states.set(`${st.rows}|${Math.round(st.logS * 20)}`, st);
        }
    }
  }
  let best = null;
  for (const st of states.values()) if (st.logS <= targetLogS && (!best || st.logW > best.logW)) best = st;
  return best ? best.pick : null;
}

// Storvinstsystemet (standard sedan 2026-10-11, användaren vill kunna vinna de stora utdelningarna, bara raka system):
// rakt system som maximerar E[min(utdelning, mål)] / mål vid alla rätt i stället för träffchansen. En rad som ger
// 10 000 kr räknas som 0,2 av målet 50 000, allt över målet som 1 – systemet jagar storvinstrader men inte lotterirader.
// Bakkört 488 omg V86/V85/V75/GS75 2024–2026 (rullande modell, mål 100 000): 1 000 kr +27 % mot träffsystemets −3 %,
// 2 vinster ≥ 50 000 mot 1, men utan 3 största −47 % mot −25 % och vinst i 249 mot 351 omgångar. Plusset bygger på
// enstaka storvinster. Mål 50 000/250 000 och chans krympt mot strecket gav inget bättre.
export const BIG_TARGET = 100000;
const BIG_STEP = 0.1; // hink i log(streckprodukt)
const BIG_CANDS = 10; // hästar per avdelning som prövas (högst chans först)

/** Andel av målet systemet väntas ge vid alla rätt. sel: [[{ p, lb }]], lb = hink för −log(streck), logT = log(andel·radpris/mål). */
function bigScore(sel, logT) {
  const nb = Math.ceil(-logT / BIG_STEP) + 1;
  let d = new Float64Array(nb);
  d[0] = 1;
  for (const hs of sel) {
    const nd = new Float64Array(nb);
    for (let b = 0; b < nb; b++) {
      if (!d[b]) continue;
      for (const h of hs) nd[Math.min(nb - 1, b + h.lb)] += d[b] * h.p;
    }
    d = nd;
  }
  let f = 0;
  for (let b = 0; b < nb; b++) f += d[b] * Math.min(1, Math.exp(logT + b * BIG_STEP));
  return f;
}

/**
 * Rakt storvinstsystem inom budget. Girig utbyggnad: varje avdelning startar med högst chans, sedan läggs den häst
 * till (bland avdelningens BIG_CANDS mest troliga) som höjer bigScore mest per ökad kostnad (Δlog f / Δlog rader).
 * target: målet i kr vid alla rätt (minst minTop). Klarar systemet inte högsta rad-spärren byggs träffsystemet
 * (buildSystem, alpha 1) i stället. bigShare = väntad andel av målet. spikes: som i buildSystem.
 */
export function buildBigSystem(legs, opts = {}) {
  const { budget, price = 0.5, locked = {}, spikes = SPIKES } = opts;
  return withSpikes(legs, { locked, spikes, budget, price }, (lk, wide) => buildBigCore(legs, { ...opts, locked: lk, wide }), (s) => (s.big ? s.bigShare : -1) + s.hit * 1e-9);
}

function buildBigCore(legs, { budget, price = 0.5, locked = {}, minTop = MIN_TOP, topShare = 0.25, target = BIG_TARGET, wide = null } = {}) {
  const goal = Math.max(target, minTop);
  const logT = Math.log((topShare * price) / goal);
  const maxRows = Math.floor(budget / price + 1e-9);
  const pools = legs.map((l) => {
    const pl = playable(l)
      .filter((h) => h.p > 0)
      .map((h) => ({ ...h, lb: Math.round(-Math.log(Math.max(1e-4, h.marketPct || 1e-4)) / BIG_STEP) }))
      .sort((a, b) => b.p - a.p);
    const lock = locked[l.leg];
    return lock?.length ? pl.filter((h) => lock.includes(h.nr)) : pl.slice(0, BIG_CANDS);
  });
  const sel = pools.map((pl, i) => (locked[legs[i].leg]?.length ? [...pl] : pl.slice(0, wide?.has(legs[i].leg) ? 2 : 1)));
  let rows = sel.reduce((a, s) => a * s.length, 1);
  let cur = bigScore(sel, logT);
  for (;;) {
    let best = null;
    pools.forEach((pl, i) => {
      if (locked[legs[i].leg]?.length) return;
      const n = sel[i].length;
      if ((rows / n) * (n + 1) > maxRows) return;
      for (const h of pl) {
        if (sel[i].includes(h)) continue;
        sel[i].push(h);
        const f = bigScore(sel, logT);
        sel[i].pop();
        const gain = cur > 0 ? Math.log(f / cur) / Math.log((n + 1) / n) : f;
        if (!best || gain > best.gain) best = { i, h, f, gain };
      }
    });
    if (!best || best.gain <= 0) break;
    rows = (rows / sel[best.i].length) * (sel[best.i].length + 1);
    sel[best.i].push(best.h);
    cur = best.f;
  }
  const out = summarize(legs, sel, price, topShare);
  if (minTop > 0 && (out.topPayout ?? 0) < minTop) return { ...buildSystemCore(legs, { budget, price, alpha: 1, locked, minTop, topShare, wide }), big: false, bigShare: null };
  return { ...out, topOk: true, big: true, bigShare: cur, target: goal };
}

/** Antal rader i ett system (produkten av antal hästar per avdelning). */
export const rowCount = (sys) => sys.legs.reduce((a, l) => a * l.horses.length, 1);

/**
 * Reducerat system. conds: { minA, maxA, minSkrall, maxSkrall, minStreck, maxStreck, minRowTop } (streck i procent, summa över raden;
 * minRowTop = varje rad ska kunna ge minst så många kr vid alla rätt).
 * expand: utgångssystemet får kosta budget × expand. Returnerar raderna (startnummer per avdelning).
 */
export function reduceSystem(legs, conds = {}, { budget, price = 0.5, alpha = 0.5, expand = 4, maxEnum = 300000, locked = {}, minTop = 0, topShare = 0.25 } = {}) {
  let base = buildSystem(legs, { budget: budget * expand, price, alpha, locked, minTop, topShare });
  while (base.rows > maxEnum && expand > 1) {
    expand /= 2;
    base = buildSystem(legs, { budget: budget * expand, price, alpha, locked, minTop, topShare });
  }
  const byNr = legs.map((l) => Object.fromEntries(playable(l).map((h) => [h.nr, h])));
  const choice = base.legs.map((l, i) => l.horses.map((nr) => byNr[i][nr]));
  const n = choice.length;
  const idx = new Array(n).fill(0);
  const kept = [];
  let total = 0;
  const has = (k) => conds[k] != null && conds[k] !== "" && Number.isFinite(Number(conds[k]));
  for (;;) {
    total++;
    let a = 0;
    let sk = 0;
    let st = 0;
    let p = 1;
    let w = 1;
    let sp = 1;
    for (let i = 0; i < n; i++) {
      const h = choice[i][idx[i]];
      sp *= Math.max(1e-4, h.marketPct || 1e-4);
      if (h.rank === "A") a++;
      if ((h.marketPct || 0) < SKRALL_MAX) sk++;
      st += (h.marketPct || 0) * 100;
      p *= h.p;
      w *= weight(h, alpha);
    }
    const ok =
      (!has("minA") || a >= +conds.minA) &&
      (!has("maxA") || a <= +conds.maxA) &&
      (!has("minSkrall") || sk >= +conds.minSkrall) &&
      (!has("maxSkrall") || sk <= +conds.maxSkrall) &&
      (!has("minStreck") || st >= +conds.minStreck) &&
      (!has("maxStreck") || st <= +conds.maxStreck);
    const top = rowPayout(sp, price, topShare);
    if (ok && (!has("minRowTop") || top >= +conds.minRowTop)) kept.push({ nrs: idx.map((j, i) => choice[i][j].nr), p, w, top });
    let k = n - 1;
    while (k >= 0 && ++idx[k] >= choice[k].length) idx[k--] = 0;
    if (k < 0) break;
  }
  const maxRows = Math.floor(budget / price + 1e-9);
  const passed = kept.length;
  kept.sort((x, y) => y.w - x.w);
  const rows = kept.slice(0, maxRows);
  // Spärren: minst en spelad rad ska kunna ge minTop kr – annars byts den sämsta raden mot bästa raden som klarar det
  if (minTop > 0 && rows.length && !rows.some((r) => r.top >= minTop)) {
    const big = kept.slice(maxRows).find((r) => r.top >= minTop);
    if (big) rows[rows.length - 1] = big;
  }
  const topPayout = rows.reduce((m, r) => Math.max(m, r.top || 0), 0) || null;
  return {
    topPayout,
    topOk: !minTop || (topPayout ?? 0) >= minTop,
    base,
    expand,
    total,
    passed,
    rows: rows.map((r) => r.nrs),
    count: rows.length,
    cost: Math.round(rows.length * price * 100) / 100,
    hit: rows.reduce((a, r) => a + r.p, 0),
  };
}

/** Rader som text, en rad per system-rad: "1,4,7,2,..." (startnummer per avdelning). */
export const rowsToText = (rows) => rows.map((r) => r.join(",")).join("\n");

/**
 * Länk till omgången på atg.se. Spel-id (t.ex. "V85_2026-10-03_11_5") är samma id som ATG:s API använder;
 * atg.se/spel/<id> öppnar omgångens kupong (testat 2026-10-03). Förifyllda hästar går inte via adressen –
 * ATG sparar kuponger på kontot – så hästarna listas i kupongmallen (couponText) i stället.
 */
export const atgGameUrl = (id) => `https://www.atg.se/spel/${encodeURIComponent(id)}`;
export const atgReducedUrl = (type) => `https://www.atg.se/spel/reducerat/${encodeURIComponent(type)}`;

/** Kupongmall: en avdelning per rad, startnummer i nummerordning. "Avd 1: 7 8 12" */
export const couponText = (legs) =>
  legs.map((l) => `Avd ${l.leg}: ${[...l.horses].sort((a, b) => a - b).join(" ")}${l.horses.length === 1 ? " (spik)" : ""}`).join("\n");

// ---------- Filinlämning till ATG ----------
// ATG:s officiella schema: https://static-content.prod.c1.atg.cloud/filebet-schema/latest/atg_filebetting.xsd
// (version 1.8.6, läst 2026-10-03). Fil laddas upp på atg.se/spel/reducerat → "Välj fil"; ATG visar belopp och
// antal kuponger innan man trycker Spela. Varje kupong är ett eget litet system: en markeringssträng per avdelning,
// 15 tecken "0"/"1" (V3–V5 20 tecken). Max kuponger per fil: V85/V86/GS75 5 000, V64/V65 2 000, V5/V4/V3 500.
export const ATG_FILE_TYPES = {
  V85: { tag: "v85Coupon", legs: 8, width: 15, max: 5000 },
  V86: { tag: "v86Coupon", legs: 8, width: 15, max: 5000 },
  V75: { tag: "v75Coupon", legs: 7, width: 15, max: 5000 },
  GS75: { tag: "gs75Coupon", legs: 7, width: 15, max: 5000 },
  V65: { tag: "v65Coupon", legs: 6, width: 15, max: 2000 },
  V64: { tag: "v64Coupon", legs: 6, width: 15, max: 2000 },
  V5: { tag: "v5Coupon", legs: 5, width: 20, max: 500 },
  V4: { tag: "v4Coupon", legs: 4, width: 20, max: 500 },
  V3: { tag: "v3Coupon", legs: 3, width: 20, max: 500 },
};

/** Banans kod i ATG:s spel-id: "V85_2026-10-03_11_5" → { date: "2026-10-03", trackcode: 11 }. */
export function parseGameId(id) {
  const m = /^[A-Za-z0-9]+_(\d{4}-\d{2}-\d{2})_(\d+)_\d+$/.exec(String(id));
  return m ? { date: m[1], trackcode: Number(m[2]) } : null;
}

/**
 * Slår ihop rader till så få kuponger som möjligt utan att ändra vilka rader som spelas:
 * två kuponger som är lika i alla avdelningar utom en blir en kupong med hästarna i den avdelningen förenade.
 * rows: [[nr per avdelning], ...] → kuponger: [[[nr, ...] per avdelning], ...]
 */
export function compressRows(rows) {
  let coupons = rows.map((r) => r.map((nr) => [nr]));
  const key = (c, skip) => c.map((s, i) => (i === skip ? "*" : s.join("."))).join("|");
  for (let changed = true; changed; ) {
    changed = false;
    const n = coupons[0]?.length || 0;
    for (let leg = 0; leg < n; leg++) {
      const groups = new Map();
      for (const c of coupons) {
        const k = key(c, leg);
        const g = groups.get(k);
        if (g) {
          g[leg] = [...new Set([...g[leg], ...c[leg]])].sort((a, b) => a - b);
          changed = true;
        } else groups.set(k, c.map((s) => [...s]));
      }
      coupons = [...groups.values()];
    }
  }
  return coupons;
}

/** Antal rader i kupongerna (för kontroll mot ATG:s förhandsvisning). */
export const couponRows = (coupons) => coupons.reduce((a, c) => a + c.reduce((x, s) => x * s.length, 1), 0);

/**
 * XML-fil för ATG:s filinlämning. coupons: [[[nr, ...] per avdelning], ...] (ett rakt system = en kupong).
 * Kastar fel om spelformen saknas, id:t inte går att tolka, antal avdelningar är fel eller kupongerna är för många.
 */
export function atgFileXml({ type, gameId, coupons, now = new Date() }) {
  const t = ATG_FILE_TYPES[type];
  if (!t) throw new Error(`${type} kan inte lämnas in som fil`);
  const g = parseGameId(gameId);
  if (!g) throw new Error(`Okänt spel-id: ${gameId}`);
  if (!coupons.length) throw new Error("Inga rader att lämna in");
  if (coupons.length > t.max) throw new Error(`${coupons.length} kuponger – ATG tar högst ${t.max} för ${type}`);
  const marks = (nrs) => Array.from({ length: t.width }, (_, i) => (nrs.includes(i + 1) ? "1" : "0")).join("");
  const body = coupons
    .map((c, i) => {
      if (c.length !== t.legs) throw new Error(`Kupong ${i + 1} har ${c.length} avdelningar, ${type} har ${t.legs}`);
      if (c.some((s) => !s.length || s.some((nr) => nr < 1 || nr > t.width))) throw new Error(`Kupong ${i + 1} har ogiltiga startnummer`);
      return `    <${t.tag} couponid="${i + 1}" date="${g.date}" trackcode="${g.trackcode}" betmultiplier="1">\n${c
        .map((s, j) => `      <leg legno="${j + 1}" marks="${marks(s)}"/>`)
        .join("\n")}\n    </${t.tag}>`;
    })
    .join("\n");
  const d = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
  const tm = now.toLocaleTimeString("sv-SE", { timeZone: "Europe/Stockholm", hour12: false });
  return `<?xml version="1.0" encoding="UTF-8"?>
<issuer company="Betting ny" product="Hastar systembyggare" version="1" createddate="${d}" createdtime="${tm}" schemaversion="ATG File Betting XSD ver 1.8">
  <betcoupons>
${body}
  </betcoupons>
</issuer>
`;
}

/**
 * Checksumma för ATG-filen: CRC16 (ARC – polynom 0xA001 reflekterat, start 0) över filens bytes, fyra hex-tecken
 * sist i filnamnet före .xml: "<filnamn><checksumma>.xml". Utan den varnar ATG för "checksummefel".
 * Källa: ATG via sharps.se/forums (2026-10-03), referens-implementation introcs.cs.princeton.edu/java/61data/CRC16.java.
 */
export function crc16(text) {
  let crc = 0;
  for (const b of new TextEncoder().encode(text)) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
  }
  return crc.toString(16).padStart(4, "0");
}

/** Filnamn med checksumma: "V85_2026-10-03_11_5-960-rader-1a2b.xml" */
export const atgFileName = (base, xml) => `${base}-${crc16(xml)}.xml`;

// ---------- Förväntad utdelning (läget "Utdelning") ----------
// Varje vinstnivås andel av omsättningen utan jackpott (ATG-data 2023–2026: utdelning × vinnande rader / omsättning,
// 10:e percentilen = utan inslag av jackpott). Utdelning per rad för k rätt ≈ andel_k · radpris / P_folket(k rätt),
// där P_folket(k) räknas ur strecken på avdelningarnas vinnare (en rad "har" varje häst med sannolikheten strecket).
// Under ATG:s lägsta utdelning (TIER_MIN, lägsta som setts) blir nivån jackpott = 0 kr.
export const TIER_SHARE = {
  V85: { 8: 0.194, 7: 0.097, 6: 0.094, 5: 0.204 },
  V86: { 8: 0.256, 7: 0.128, 6: 0.253 },
  V75: { 7: 0.257, 6: 0.128, 5: 0.252 },
  GS75: { 7: 0.276, 6: 0.116, 5: 0.234 },
  V64: { 6: 0.335, 5: 0.078, 4: 0.156 },
  V65: { 6: 0.351, 5: 0.228 },
};
export const TIER_MIN = { V85: 5, V86: 15, V75: 15, GS75: 15, V64: 7, V65: 3 };

/** Enkel deterministisk slump (mulberry32), så att samma omgång alltid ger samma siffror. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulerade utfall: sims × avdelningar, vinnarens nr och streck, samt utdelning per rad för varje vinstnivå.
 * legs som i buildSystem. Vinnare dras ur modellens chans p. Högsta nivån (alla rätt) räknas exakt i expectedReturn
 * (outcomes.exact), eftersom simuleringen där domineras av ett fåtal miljonrader: E = andel · radpris · Π Σ chans/streck.
 */
export function simulateOutcomes(legs, { type = "V85", price = 0.5, sims = 2000, seed = 1 } = {}) {
  const shares = TIER_SHARE[type] || { [legs.length]: TOP_SHARE[type] ?? 0.25 };
  const minPay = TIER_MIN[type] ?? 0;
  const pools = legs.map((l) => {
    const hs = playable(l);
    const tot = hs.reduce((a, h) => a + h.p, 0) || 1;
    let c = 0;
    return hs.map((h) => ({ nr: h.nr, s: Math.max(1e-4, h.marketPct || 1e-4), cum: (c += h.p / tot) }));
  });
  const rand = rng(seed);
  const out = [];
  for (let k = 0; k < sims; k++) {
    const win = [];
    let pop = [1];
    for (const pl of pools) {
      const u = rand();
      const h = pl.find((x) => u <= x.cum) || pl[pl.length - 1];
      win.push(h.nr);
      const next = new Array(pop.length + 1).fill(0);
      pop.forEach((c, j) => {
        next[j] += c * (1 - h.s);
        next[j + 1] += c * h.s;
      });
      pop = next;
    }
    const pay = {};
    for (const [t, sh] of Object.entries(shares)) {
      const kr = pop[Number(t)] > 0 ? (sh * price) / pop[Number(t)] : 0;
      pay[t] = kr >= minPay ? kr : 0;
    }
    out.push({ win, pay });
  }
  const top = String(legs.length);
  if (shares[top] != null)
    out.exact = {
      tier: top,
      share: shares[top],
      ratio: pools.map((pl, i) => {
        const tot = playable(legs[i]).reduce((a, h) => a + h.p, 0) || 1;
        return new Map(playable(legs[i]).map((h) => [h.nr, h.p / tot / Math.max(1e-4, h.marketPct || 1e-4)]));
      }),
    };
  return out;
}

/**
 * Förväntad utdelning för ett rakt system (sysLegs: [[nr, ...] per avdelning]) över simulerade utfall.
 * Returnerar { ev (kr), roi (ev / insats − 1), hit (andel utfall med vinst), byTier: { k: kr } }.
 */
export function expectedReturn(sysLegs, outcomes, price = 0.5) {
  const rows = sysLegs.reduce((a, s) => a * s.length, 1);
  const sets = sysLegs.map((s) => new Set(s));
  let ev = 0;
  let hits = 0;
  const byTier = {};
  for (const o of outcomes) {
    let poly = [1];
    o.win.forEach((nr, i) => {
      const right = sets[i].has(nr) ? 1 : 0;
      const wrong = sets[i].size - right;
      const next = new Array(poly.length + 1).fill(0);
      poly.forEach((c, k) => {
        next[k] += c * wrong;
        next[k + 1] += c * right;
      });
      poly = next;
    });
    let w = 0;
    for (const [t, kr] of Object.entries(o.pay)) {
      if (outcomes.exact && t === outcomes.exact.tier) continue;
      const v = (poly[Number(t)] || 0) * kr;
      w += v;
      byTier[t] = (byTier[t] || 0) + v / outcomes.length;
    }
    ev += w;
    if (w > 0) hits++;
  }
  ev /= outcomes.length;
  if (outcomes.exact) {
    const x = outcomes.exact;
    const top = x.share * price * sysLegs.reduce((a, s, i) => a * s.reduce((b, nr) => b + (x.ratio[i].get(nr) || 0), 0), 1);
    byTier[x.tier] = top;
    ev += top;
  }
  const cost = rows * price;
  return { ev, roi: cost > 0 ? ev / cost - 1 : null, hit: hits / outcomes.length, byTier };
}

// Kandidater i läget "Utdelning": värdefokus × högsta rad-nivå
export const EV_ALPHAS = [0, 0.5, 1, 1.5, 2, 3];

/**
 * Läget "Utdelning": bygger raka system med olika värdefokus och högsta rad-nivåer (alla minst minTop) och väljer
 * det med högst förväntad utdelning enligt modellen. Returnerar buildSystem-svaret + { ev, evRoi, evHit, alpha, candidates }.
 */
export function buildValueSystem(legs, { budget, price = 0.5, minTop = MIN_TOP, topShare = 0.25, type = "V85", sims = 2000, seed = 1, locked = {} } = {}) {
  const outcomes = simulateOutcomes(legs, { type, price, sims, seed });
  const tops = [...new Set([minTop, ...TOP_LEVELS.filter((t) => t > minTop)])];
  const candidates = [];
  const seen = new Set();
  for (const alpha of EV_ALPHAS)
    for (const top of tops) {
      const s = buildSystem(legs, { budget, price, alpha, minTop: top, topShare, locked });
      if (minTop && !s.topOk) continue;
      const key = s.legs.map((l) => [...l.horses].sort((a, b) => a - b).join(",")).join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const e = expectedReturn(s.legs.map((l) => l.horses), outcomes, price);
      candidates.push({ alpha, minTop: top, sys: s, ...e });
    }
  if (!candidates.length) return { ...buildSystem(legs, { budget, price, alpha: 0, minTop, topShare, locked }), ev: null };
  // Högst förväntad återbetalning per insatt krona (systemen kostar olika när budgeten inte går jämnt ut)
  const best = candidates.reduce((m, c) => (c.roi > m.roi ? c : m));
  return {
    ...best.sys,
    ev: best.ev,
    evRoi: best.roi,
    evHit: best.hit,
    evByTier: best.byTier,
    alpha: best.alpha,
    chosenTop: best.minTop,
    candidates: candidates.map((c) => ({ alpha: c.alpha, minTop: c.minTop, rows: c.sys.rows, ev: c.ev, roi: c.roi, hit: c.hit })),
  };
}
