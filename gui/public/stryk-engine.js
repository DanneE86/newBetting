// Kupongmotor för "Stryktipset B": samma logik som scripts/fetch-stryktipset.mjs (grundrad via DP, Gambling Cabins
// utdelningsreducering, teckenregler, budget 350–400 kr) men med spikar som användaren låser själv.
// Körs i webbläsaren eftersom webben är statisk. Ändras reglerna i fetch-stryktipset.mjs ska de ändras här också.
const SIGNS = ["1", "X", "2"];
const PAYOUT_13 = 0.65 * 0.4; // 65 % återbetalning, 40 % av potten till 13 rätt
const BUDGET = { min: 350, max: 400 };
const GRUND_MAX_ROWS = 30000;
const SIGN_MIN = [4, 2, 2];
const COLOR = { green: 0.45, red: 0.2 };
const UTD_MIN_BY_PRODUCT = { stryktipset: 30000, europatipset: 20000 };
const GC_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
// Går det inte att bygga ett system med spikarna släpps teckenreglerna först, sedan utdelningsgränsen
const SIGN_LADDER = [SIGN_MIN, [3, 2, 2], [3, 1, 1], [2, 1, 1], [0, 0, 0]];
const PAYOUT_LADDER = [1, 2 / 3, 1 / 3, 0];

const pickOf = (x) => ({
  signs: x.map((k) => SIGNS[k]).join(""),
  type: x.length === 1 ? "Spik" : x.length === 2 ? "Halvgardering" : "Helgardering",
});

// forced[i] = låst tecken (0/1/2) eller null. Övriga matcher: de 1–3 troligaste tecknen.
function grundCandidates(events, maxRows, forced) {
  const options = (e, i) => {
    if (forced[i] != null) return [[forced[i]]];
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    return [1, 2, 3].map((n) => order.slice(0, n).sort());
  };
  let dp = new Map([["0,0", { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f] = key.split(",").map(Number);
      for (const sub of options(e, i)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        if (2 ** nh * 3 ** nf > maxRows) continue;
        const lp = st.lp + Math.log(Math.max(1e-9, sub.reduce((sum, k) => sum + e.final[k], 0)));
        const k = `${nh},${nf}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub] });
      }
    }
    dp = next;
  });
  return [...dp.values()].map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: Math.exp(st.lp), sets: st.sets, picks: st.sets.map(pickOf),
  }));
}

function signColor(folkP) {
  if (folkP == null) return "yellow";
  return folkP >= COLOR.green ? "green" : folkP <= COLOR.red ? "red" : "yellow";
}

function gcPayoutFloor(gcTurnover, realTurnover, jackpot, payoutMin) {
  if (payoutMin <= 0) return 0;
  const fStar = ((PAYOUT_13 * realTurnover + (jackpot || 0)) / payoutMin - 1) / realTurnover;
  return fStar > 0 ? (PAYOUT_13 * gcTurnover + (jackpot || 0)) / (1 + gcTurnover * fStar) : Infinity;
}

function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin, budget }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const T = turnover;
  const floor = gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  const all = [];
  const row = [], cnt = [0, 0, 0];
  const walk = (i, p, f) => {
    if (i === events.length) {
      const payout = (PAYOUT_13 * T + jackpot) / (1 + T * f);
      if (payout >= floor && cnt[0] >= signMin[0] && cnt[1] >= signMin[1] && cnt[2] >= signMin[2]) {
        all.push({ row: row.slice(), p, payout, real: (PAYOUT_13 * realTurnover + jackpot) / (1 + realTurnover * f) });
      }
      return;
    }
    for (const k of grund.sets[i]) {
      row.push(k); cnt[k]++;
      walk(i + 1, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]));
      row.pop(); cnt[k]--;
    }
  };
  walk(0, 1, 1);
  if (all.length < minRows) return null;
  all.sort((a, b) => b.payout - a.payout);
  // Gränsen läggs i ett glapp mellan två rader (jämnt belopp), som i fetch-stryktipset.mjs
  let cut = null;
  for (const gap of [1.02, 1.01, 1.003, 1]) {
    for (const [lo, hi] of [[minRows + 5, maxRows - 5], [minRows, maxRows]]) {
      if (all.length <= hi && all.length >= lo && all[all.length - 1].payout >= floor * gap) { cut = { n: all.length, t: Math.ceil(floor) }; break; }
      for (let n = Math.min(hi, all.length - 1); n >= lo && !cut; n--) {
        const above = all[n - 1].payout, below = all[n].payout;
        if (above < below * gap) continue;
        const mid = Math.sqrt(above * below);
        for (const step of [5000, 1000, 500, 100, 10, 1]) {
          const t = Math.round(mid / step) * step;
          if (t <= above / Math.sqrt(gap) && t >= below * Math.sqrt(gap) && t >= floor) { cut = { n, t }; break; }
        }
      }
      if (cut) break;
    }
    if (cut) break;
  }
  if (!cut) return null;
  const kept = all.slice(0, cut.n);
  const hit = kept.reduce((sum, r) => sum + r.p, 0);
  const ev = kept.reduce((sum, r) => sum + r.p * r.real, 0);
  kept.sort((a, b) => b.p - a.p);
  return {
    grundRows: grund.rows, afterPayout: all.length, rows: kept.length, cost: kept.length * rowPrice, rowPrice,
    hitAll: hit, grundHit: grund.hitAll, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
    rules: { payoutMin: Math.max(0, cut.t), payoutMinReal: payoutMin, jackpot, realTurnover, signMin, turnover: T },
    rowList: kept.map((r) => r.row.map((k) => SIGNS[k]).join("")),
    rowP: kept.map((r) => r.p), rowReal: kept.map((r) => r.real), rowPayout: kept.map((r) => r.payout),
  };
}

function bestReduced(events, candidates, opts, exclude = null) {
  const score = (red) => red.rowList.reduce((sum, row, i) => (exclude?.has(row) ? sum : sum + red.rowP[i]), 0);
  let best = null;
  for (const g of candidates) {
    if (g.rows < opts.budget.min) continue;
    const red = reduceSystem(events, g, opts);
    if (!red) continue;
    const sc = score(red);
    if (!best || sc > best.score) best = { system: g, reduced: red, score: sc };
  }
  return best;
}

// Ett system på 2 x budget delas efter utdelning: A = högst utdelning, B = resten (som på Stryktipset A)
function splitReduced(red) {
  const n = red.rows;
  const idx = red.rowList.map((_, i) => i).sort((a, b) => red.rowPayout[b] - red.rowPayout[a]);
  const minRows = Math.ceil(BUDGET.min / red.rowPrice), maxRows = Math.floor(BUDGET.max / red.rowPrice);
  const lo = Math.max(minRows, n - maxRows), hi = Math.min(maxRows, n - minRows);
  let cut = null;
  for (const gap of [1.02, 1.01, 1.003, 1]) {
    for (let k = Math.round(n / 2), d = 0; !cut && (k - d >= lo || k + d <= hi); d++) {
      for (const kk of d ? [k - d, k + d] : [k]) {
        if (cut || kk < lo || kk > hi) continue;
        const above = red.rowPayout[idx[kk - 1]], below = red.rowPayout[idx[kk]];
        if (above < below * gap) continue;
        const mid = Math.sqrt(above * below);
        for (const step of [5000, 1000, 500, 100, 10, 1]) {
          const t = Math.round(mid / step) * step;
          if (t <= above / Math.sqrt(gap) && t > below * Math.sqrt(gap)) { cut = { k: kk, t }; break; }
        }
      }
    }
    if (cut) break;
  }
  if (!cut) return null;
  const part = (ids, payoutMin, payoutMax) => {
    const sel = ids.slice().sort((a, b) => red.rowP[b] - red.rowP[a]);
    const hit = sel.reduce((sum, i) => sum + red.rowP[i], 0);
    const ev = sel.reduce((sum, i) => sum + red.rowP[i] * red.rowReal[i], 0);
    return {
      ...red, rows: sel.length, cost: sel.length * red.rowPrice, hitAll: hit, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: { ...red.rules, payoutMin, payoutMax }, split: true,
      rowList: sel.map((i) => red.rowList[i]), rowP: sel.map((i) => red.rowP[i]),
    };
  };
  return [part(idx.slice(0, cut.k), cut.t, null), part(idx.slice(cut.k), red.rules.payoutMin, cut.t - 1)];
}

function gamblingCabinUrl(p, events, sets, reduced) {
  const colorId = { yellow: 2, red: 3, green: 4 };
  const col = (k) => events.map((e, i) => (sets[i].includes(k) ? colorId[signColor(e.folk?.[k])] : 0)).join(",");
  const r = reduced.rules;
  const q = [
    `spel=${p.product}`, `omg=${p.drawNumber}`, `datum=${(p.regCloseTime || "").slice(0, 10)}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${r.signMin[0]},13,${r.signMin[1]},13,${r.signMin[2]},13`,
    "yellow=0,0,13", "red=0,0,13", "green=0,0,13", "pink=0,0,13",
    `utd=1,${r.payoutMin},${r.payoutMax ?? 100000000}`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join("&")}`;
}

// Prova reglerna i ordning tills ett system går att bygga. relaxed = vilka regler som fick släppas.
function buildWithLadder(events, forced, base, budget, exclude) {
  const free = forced.reduce((n, f) => n * (f == null ? 3 : 1), 1);
  const b = { min: Math.min(budget.min, free * base.rowPrice), max: budget.max };
  const cands = grundCandidates(events, GRUND_MAX_ROWS, forced);
  for (const pf of PAYOUT_LADDER) {
    for (const sm of SIGN_LADDER) {
      const best = bestReduced(events, cands, { ...base, signMin: sm, payoutMin: base.payoutMin * pf, budget: b }, exclude);
      if (best) {
        const relaxed = [];
        if (sm !== SIGN_MIN) relaxed.push(`teckenreglerna sänktes till ${sm.join("-")}`);
        if (pf !== 1) relaxed.push(pf === 0 ? "utdelningsgränsen togs bort" : `utdelningsgränsen sänktes till ${Math.round(base.payoutMin * pf).toLocaleString("sv-SE")} kr`);
        if (b.min < budget.min) relaxed.push(`spikarna lämnar bara ${free} möjliga rader`);
        return { ...best, relaxed };
      }
    }
  }
  return null;
}

/**
 * Genererar kupong A och B för en omgång.
 * spikes: { [eventNumber]: { sign: "1"|"X"|"2", scope: "both"|"A"|"B" } }
 * Samma spikar i båda -> ett system på 700–800 rader delas i A och B (som Stryktipset A).
 * Olika spikar -> A och B byggs var för sig, B väljs så att den täcker rader A saknar.
 */
export function generateCoupons(p, spikes) {
  const events = p.events;
  const forcedFor = (sys) => events.map((e) => {
    const s = spikes[e.eventNumber];
    return s && (s.scope === "both" || s.scope === sys) ? SIGNS.indexOf(s.sign) : null;
  });
  const fA = forcedFor("A"), fB = forcedFor("B");
  const rules = p.reduced?.rules || {};
  const base = {
    rowPrice: p.reduced?.rowPrice || 1,
    turnover: rules.turnover || GC_TURNOVER[p.product] || 1e7,
    realTurnover: rules.realTurnover || rules.turnover || GC_TURNOVER[p.product] || 1e7,
    jackpot: rules.jackpot || 0,
    payoutMin: rules.payoutMinReal || UTD_MIN_BY_PRODUCT[p.product] || 30000,
  };
  const finish = (best, sys, forced, red = best.reduced) => ({
    ...red,
    picks: best.system.picks.map((x, i) => ({ ...x, locked: forced[i] != null })),
    relaxed: best.relaxed,
    gamblingCabinUrl: gamblingCabinUrl(p, events, best.system.sets, red),
    system: sys,
  });

  if (fA.every((x, i) => x === fB[i])) {
    const dbl = buildWithLadder(events, fA, base, { min: 2 * BUDGET.min, max: 2 * BUDGET.max }, null);
    const pair = dbl && dbl.relaxed.length === 0 && splitReduced(dbl.reduced);
    if (pair) return { mode: "split", A: finish(dbl, "A", fA, pair[0]), B: finish(dbl, "B", fB, pair[1]) };
  }
  const a = buildWithLadder(events, fA, base, BUDGET, null);
  const b = buildWithLadder(events, fB, base, BUDGET, a ? new Set(a.reduced.rowList) : null);
  return { mode: "separate", A: a && finish(a, "A", fA), B: b && finish(b, "B", fB) };
}
