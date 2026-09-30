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
const COLOR = { green: 0.45, red: 0.2 };
const UTD_MIN_BY_PRODUCT = { stryktipset: 30000, europatipset: 20000 };
// Kupong B: minst 30 000 kr för 13 rätt på båda spelen och inget tak (användarens regel 2026-09-29)
const UTD_MIN_B = 30000;
// Kupong B mot A (användarens regel 2026-09-29): högst 2 spikar med samma tecken på samma match och aldrig exakt samma
// halvgardering. Egna krav räknas inte. Går det inte att bygga släpps spikgränsen stegvis (B_SAME_LADDER).
const B_MAX_SAME_SPIK = 2;
const B_SAME_LADDER = [2, 3, 4];
const GC_TURNOVER = { stryktipset: 25e6, europatipset: 1e7 };
// Går det inte att bygga ett system med spikarna släpps teckenreglerna först, sedan utdelningsgränsen
const SIGN_LADDER = [SIGN_MIN, [3, 2, 2], [3, 1, 1], [2, 1, 1], [0, 0, 0]];
const SIGN_LADDER_B = [SIGN_MIN_B, [3, 2, 2], [3, 1, 1], [2, 1, 1], [0, 0, 0]];
const PAYOUT_LADDER = [1, 2 / 3, 1 / 3, 0];
// Skräll (rött tecken, folket ≤ 20 %) i en gardering får finnas på högst 85 % av kupongens rader, så att favoriten
// alltid har minst 15 % (användarens regel 2026-09-29; utdelningsgränsen drev annars skrällen till 91–93 %).
// Gambling Cabin har ingen sådan regel, så den används vid valet av system: länken ger fortfarande samma rader.
const RED_MAX_SHARE = 0.85;
// Favoriten i en gardering får aldrig ligga på under 10 % av raderna, t.ex. X på 90 % (användarens regel 2026-09-30).
// Gäller tillsammans med skrällgränsen och släpps samtidigt som den.
const FAV_MIN_SHARE = 0.1;
// Minsta bredd max - min per färg (2 = t.ex. 1–3 eller 5–7; användaren 2026-09-30: bredd 1 var för snäv).
const COLOR_WIDTH = 2;
// Högst 4 spikar per kupong (användarens regel 2026-09-30). Låser användaren fler spikar gäller deras krav.
const MAX_SPIKES = 4;
// Färgregler (antal gröna/gula/röda tecken per rad, alla 13 matcher) är aldrig 0–13 (användarens regel 2026-09-30).
// Stryktipset: p.colorBands (rätt rad senaste året, scripts/lib/stryk-color-bands.mjs) är yttre gräns – min/max aldrig
// utanför det som hänt – och röda har max 4 (användaren: snittet är 1,9 men 3–4 röda ger stora vinster; backtest
// 2026-09-30, 38 omg: -8 771 kr mot -19 356 med max 3). Europatipset har inga band (sämre där). Inom gränsen och utan
// band provas min/max upp till COLOR_TRIM steg in från spannet. Samma som i fetch-stryktipset.mjs.
const COLOR_TRIM = 2;
const RED_MAX_OPTIONS = [4];
const COLOR_KEYS = ["green", "yellow", "red"];
// Fasta färgmål för hela raden (13 matcher), användarens beslut 2026-09-30 utifrån rätt rad senaste året: gröna 3–7,
// gula 4–8, röda 1–3. Spikar är rosa i Gambling Cabin och räknas inte där, så spikarnas färger dras av från målen
// (3 gröna spikar -> grön 0–4 i garderingarna); rosa = antal spikar. Går målen inte att hålla optimeras färgerna fritt.
const COLOR_TARGET = { green: [3, 7], yellow: [4, 8], red: [1, 3] };
function targetRule(grund, colorIdx) {
  const spik = [0, 0, 0];
  grund.sets.forEach((set, i) => { if (set.length === 1) spik[colorIdx[i][set[0]]]++; });
  const rule = COLOR_KEYS.map((c, j) => [Math.max(0, COLOR_TARGET[c][0] - spik[j]), COLOR_TARGET[c][1] - spik[j]]);
  return rule.every(([, b]) => b >= 0) ? rule : null;
}

const pickOf = (x) => ({
  signs: x.map((k) => SIGNS[k]).join(""),
  type: x.length === 1 ? "Spik" : x.length === 2 ? "Halvgardering" : "Helgardering",
});

// forced[i] = låsta tecken (t.ex. [0, 1] för 1X) eller null. Övriga matcher: de 1–3 troligaste tecknen.
// other = { sets, maxSame, locked }: grundraden får högst maxSame spikar som är identiska med other.sets och ingen identisk
// halvgardering (kupong B mot A). Där användaren låst ett krav bara i A (locked[i]) får B aldrig ha exakt samma tecken,
// oavsett typ (spik, halv- eller helgardering). Krav i B räknas inte.
function grundCandidates(events, maxRows, forced, other = null) {
  const same = (a, b) => a.length === b.length && a.every((x, j) => x === b[j]);
  const options = (e, i) => {
    if (forced[i] != null) return [forced[i]];
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    const subs = [1, 2, 3].map((n) => order.slice(0, n).sort());
    // Andra spikar och halvgarderingar än A: alla tecken och par, inte bara de troligaste
    if (other) {
      for (const k of [0, 1, 2]) if (!subs.some((x) => same(x, [k]))) subs.push([k]);
      for (const x of [[0, 1], [0, 2], [1, 2]]) if (!subs.some((y) => same(y, x))) subs.push(x);
      return subs.filter((x) => !((x.length === 2 || other.locked?.[i]) && same(x, other.sets[i])));
    }
    return subs;
  };
  let dp = new Map([["0,0,0", { lp: 0, sets: [] }]]);
  events.forEach((e, i) => {
    const next = new Map();
    for (const [key, st] of dp) {
      const [h, f, sm] = key.split(",").map(Number);
      for (const sub of options(e, i)) {
        const nh = h + (sub.length === 2), nf = f + (sub.length === 3);
        if (2 ** nh * 3 ** nf > maxRows) continue;
        const ns = sm + (other && forced[i] == null && sub.length === 1 && same(sub, other.sets[i]) ? 1 : 0);
        if (other && ns > other.maxSame) continue;
        const lp = st.lp + Math.log(Math.max(1e-9, sub.reduce((sum, k) => sum + e.final[k], 0)));
        const k = `${nh},${nf},${ns}`;
        if (!next.has(k) || next.get(k).lp < lp) next.set(k, { lp, sets: [...st.sets, sub] });
      }
    }
    dp = next;
  });
  const maxSpikes = Math.max(MAX_SPIKES, forced.filter((f) => f?.length === 1).length);
  return [...dp.values()].filter((st) => st.sets.filter((x) => x.length === 1).length <= maxSpikes).map((st) => ({
    rows: st.sets.reduce((n, x) => n * x.length, 1), hitAll: Math.exp(st.lp), sets: st.sets, picks: st.sets.map(pickOf),
  }));
}

function signColor(folkP) {
  if (folkP == null) return "yellow";
  return folkP >= COLOR.green ? "green" : folkP <= COLOR.red ? "red" : "yellow";
}

// Färgregler. all = rader sorterade på utdelning (högst först), r.c = [gröna, gula, röda] över alla 13 matcher.
// Kombinationerna rangordnas efter chansen i de `target` första raderna som klarar reglerna; vid lika vinner snävast.
function colorRuleOptions(all, minRows, target, bands = null) {
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const r of all) for (let c = 0; c < 3; c++) { if (r.c[c] < lo[c]) lo[c] = r.c[c]; if (r.c[c] > hi[c]) hi[c] = r.c[c]; }
  const ranges = [0, 1, 2].map((c) => {
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
  for (const g of ranges[0]) for (const y of ranges[1]) for (const rd of ranges[2]) {
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
const fitsColors = (c, rule) => rule.every(([a, b], k) => c[k] >= a && c[k] <= b);

function gcPayoutFloor(gcTurnover, realTurnover, jackpot, payoutMin) {
  if (payoutMin <= 0) return 0;
  const fStar = ((PAYOUT_13 * realTurnover + (jackpot || 0)) / payoutMin - 1) / realTurnover;
  return fStar > 0 ? (PAYOUT_13 * gcTurnover + (jackpot || 0)) / (1 + gcTurnover * fStar) : Infinity;
}

// Andel av raderna med ett rött tecken i en gardering som är högst (1 = ingen gräns)
function redShareOk(events, grund, kept, redMax) {
  if (redMax >= 1) return true;
  return events.every((e, i) => {
    const set = grund.sets[i];
    if (set.length < 2) return true;
    const share = (k) => kept.filter((r) => r.row[i] === k).length / kept.length;
    // Favoriten (troligaste tecknet) i garderingen minst FAV_MIN_SHARE av raderna
    const fav = set.reduce((b, k) => (e.final[k] > e.final[b] ? k : b));
    return share(fav) >= FAV_MIN_SHARE && set.every((k) => signColor(e.folk?.[k]) !== "red" || share(k) <= redMax);
  });
}

function reduceSystem(events, grund, { rowPrice = 1, turnover, signMin, realTurnover = turnover, jackpot = 0, payoutMin, budget, redMax = 1, colorTarget = true }) {
  const minRows = Math.ceil(budget.min / rowPrice), maxRows = Math.floor(budget.max / rowPrice);
  const T = turnover;
  const floor = gcPayoutFloor(T, realTurnover, jackpot, payoutMin);
  const all = [];
  const row = [], cnt = [0, 0, 0], cc = [0, 0, 0];
  const colorIdx = events.map((e) => [0, 1, 2].map((k) => COLOR_KEYS.indexOf(signColor(e.folk?.[k]))));
  const walk = (i, p, f) => {
    if (i === events.length) {
      const payout = (PAYOUT_13 * T + jackpot) / (1 + T * f);
      if (payout >= floor && cnt[0] >= signMin[0] && cnt[1] >= signMin[1] && cnt[2] >= signMin[2]) {
        all.push({ row: row.slice(), p, payout, real: (PAYOUT_13 * realTurnover + jackpot) / (1 + realTurnover * f), c: cc.slice() });
      }
      return;
    }
    for (const k of grund.sets[i]) {
      const ci = grund.sets[i].length > 1 ? colorIdx[i][k] : -1; // spikar är rosa och räknas inte
      row.push(k); cnt[k]++; if (ci >= 0) cc[ci]++;
      walk(i + 1, p * events[i].final[k], f * (events[i].folk?.[k] ?? events[i].final[k]));
      row.pop(); cnt[k]--; if (ci >= 0) cc[ci]--;
    }
  };
  walk(0, 1, 1);
  if (all.length < minRows) return null;
  all.sort((a, b) => b.payout - a.payout);
  // Färgreglerna: målen (grön 3–7, gul 4–8, röd 1–3), annars bästa fria kombinationen där utdelningsgränsen går att lägga
  const spikes = grund.sets.filter((x) => x.length === 1).length;
  const target = colorTarget ? targetRule(grund, colorIdx) : null;
  if (colorTarget && !target) return null;
  for (const opt of target ? [{ rule: target }] : colorRuleOptions(all, minRows, Math.round((minRows + maxRows) / 2))) {
    const cut = cutRows(all.filter((r) => fitsColors(r.c, opt.rule)), floor, minRows, maxRows);
    if (!cut) continue;
    const kept = cut.kept;
    if (!redShareOk(events, grund, kept, redMax)) continue;
    const hit = kept.reduce((sum, r) => sum + r.p, 0);
    const ev = kept.reduce((sum, r) => sum + r.p * r.real, 0);
    kept.sort((a, b) => b.p - a.p);
    return {
      grundRows: grund.rows, afterPayout: all.length, rows: kept.length, cost: kept.length * rowPrice, rowPrice,
      hitAll: hit, grundHit: grund.hitAll, expectedPayout: hit ? ev / hit : null, expectedReturn: ev,
      rules: {
        payoutMin: Math.max(0, cut.t), payoutMinReal: payoutMin, jackpot, realTurnover, signMin, turnover: T,
        colorRules: { green: opt.rule[0], yellow: opt.rule[1], red: opt.rule[2], pink: [spikes, spikes] }, colorTarget: Boolean(target),
      },
      rowList: kept.map((r) => r.row.map((k) => SIGNS[k]).join("")),
      rowP: kept.map((r) => r.p), rowReal: kept.map((r) => r.real), rowPayout: kept.map((r) => r.payout),
    };
  }
  return null;
}

// Utdelningsgränsen på raderna som klarar tecken- och färgreglerna (all sorterad på utdelning, högst först)
function cutRows(all, floor, minRows, maxRows) {
  if (all.length < minRows) return null;
  // Gränsen läggs i ett glapp mellan två rader (jämnt belopp) så nära mitten av budgeten som möjligt. Gambling Cabin
  // räknar med de aktuella strecken, och ändras de efter hämtningen flyttas rader över gränsen (ett streck från 27 till
  // 26 % gav 394 -> 404 rader). Mitten ger marginal åt båda hållen. Samma val som i fetch-stryktipset.mjs.
  let cut = null;
  if (all.length >= minRows && all.length <= maxRows && all[all.length - 1].payout >= floor * 1.02) cut = { n: all.length, t: Math.ceil(floor) };
  const mid = Math.round((minRows + maxRows) / 2);
  for (const win of [Math.round((maxRows - minRows) / 5), maxRows - mid]) {
    for (const gap of [1.02, 1.01, 1.003, 1]) {
      for (let d = 0; d <= win && !cut; d++) {
        for (const n of d ? [mid - d, mid + d] : [mid]) {
          if (cut || n < minRows || n > maxRows || n >= all.length) continue;
          const above = all[n - 1].payout, below = all[n].payout;
          if (above < below * gap) continue;
          const m = Math.sqrt(above * below);
          for (const step of [5000, 1000, 500, 100, 10, 1]) {
            const t = Math.round(m / step) * step;
            if (t <= above / Math.sqrt(gap) && t >= below * Math.sqrt(gap) && t >= floor) { cut = { n, t }; break; }
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
    if (!best || sc > best.score) best = { system: g, reduced: red, score: sc };
  }
  return best;
}

function gamblingCabinUrl(p, events, sets, reduced) {
  const colorId = { yellow: 2, red: 3, green: 4 };
  // Spikar (ett tecken) rosa (5), annars färg efter folkets streck. Färgreglerna räknar garderingarna, rosa = antal spikar.
  const col = (k) => events.map((e, i) => (!sets[i].includes(k) ? 0 : sets[i].length === 1 ? 5 : colorId[signColor(e.folk?.[k])])).join(",");
  const r = reduced.rules;
  const cr = (c) => (r.colorRules?.[c] ? `1,${r.colorRules[c][0]},${r.colorRules[c][1]}` : "0,0,13");
  const q = [
    `spel=${p.product}`, `omg=${p.drawNumber}`, `datum=${(p.regCloseTime || "").slice(0, 10)}`,
    `v1=${col(0)}`, `vX=${col(1)}`, `v2=${col(2)}`,
    `antT=1,${r.signMin[0]},13,${r.signMin[1]},13,${r.signMin[2]},13`,
    `yellow=${cr("yellow")}`, `red=${cr("red")}`, `green=${cr("green")}`, `pink=${cr("pink")}`,
    `utd=1,${r.payoutMin},${r.payoutMax ?? 100000000}`,
  ];
  return `https://reducera.gamblingcabin.se/?${q.join("&")}`;
}

// Prova reglerna i ordning tills ett system går att bygga. relaxed = vilka regler som fick släppas.
// payoutLadder = [1] håller utdelningsgränsen fast (kupong B).
function buildWithLadder(events, forced, base, budget, exclude, { avoid = null, avoidLocked = null, payoutLadder = PAYOUT_LADDER, sameLadder = [null], signLadder = SIGN_LADDER } = {}) {
  const free = forced.reduce((n, f) => n * (f == null ? 3 : f.length), 1);
  const b = { min: Math.min(budget.min, free * base.rowPrice), max: budget.max };
  // Skrällgränsen och favoritregeln släpps sist av allt, färgmålen före dem
  for (const redMax of [RED_MAX_SHARE, 1]) {
  for (const colorTarget of [true, false]) {
  for (const maxSame of sameLadder) {
  const cands = grundCandidates(events, GRUND_MAX_ROWS, forced, maxSame == null ? null : { sets: avoid, maxSame, locked: avoidLocked });
  for (const pf of payoutLadder) {
    for (const sm of signLadder) {
      const best = bestReduced(events, cands, { ...base, signMin: sm, payoutMin: base.payoutMin * pf, budget: b, redMax, colorTarget }, exclude, avoid);
      if (best) {
        const relaxed = [];
        if (!colorTarget) relaxed.push("färgmålen (grön 3–7, gul 4–8, röd 1–3 på hela raden) gick inte att hålla – färgerna optimerades fritt");
        if (redMax === 1) relaxed.push(`skrällgränsen (rött tecken på högst ${Math.round(RED_MAX_SHARE * 100)} % av raderna, favoriten på minst ${Math.round(FAV_MIN_SHARE * 100)} %) gick inte att hålla`);
        if (sm !== signLadder[0]) relaxed.push(`teckenreglerna sänktes till ${sm.join("-")}`);
        if (pf !== 1) relaxed.push(pf === 0 ? "utdelningsgränsen togs bort" : `utdelningsgränsen sänktes till ${Math.round(base.payoutMin * pf).toLocaleString("sv-SE")} kr`);
        if (b.min < budget.min) relaxed.push(`kraven lämnar bara ${free} möjliga rader`);
        if (maxSame != null && maxSame > B_MAX_SAME_SPIK) relaxed.push(`${maxSame} spikar fick vara samma som i A`);
        return { ...best, relaxed };
      }
    }
  }
  }
  }
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
 * krav: { [eventNumber]: { signs: "1" | "1X" | "X2" | "12" | "1X2" | ..., scope: "both" | "A" | "B" } }
 * A = bästa systemet med A:s krav (350–400 kr, spelets utdelningsgräns).
 * B = ett eget system med B:s krav: minst 30 000 kr för 13 rätt utan tak, teckenregler 3-3-3, högst 2 spikar och ingen halvgardering
 *     identisk med A, valt så att det täcker så mycket som möjligt av det A saknar (några gemensamma rader är tillåtna).
 */
export function generateCoupons(p, krav) {
  const events = p.events;
  const forcedFor = (sys) => events.map((e) => {
    const k = krav[e.eventNumber];
    return k && (k.scope === "both" || k.scope === sys) ? kravSigns(k) : null;
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
  };
  const finish = (best, sys, forced) => ({
    ...best.reduced,
    picks: best.system.picks.map((x, i) => ({ ...x, locked: forced[i] != null })),
    relaxed: best.relaxed,
    gamblingCabinUrl: gamblingCabinUrl(p, events, best.system.sets, best.reduced),
    system: sys,
  });
  const a = buildWithLadder(events, fA, base, BUDGET, null);
  const b = buildWithLadder(events, fB, { ...base, payoutMin: Math.max(UTD_MIN_B, base.payoutMin) }, BUDGET,
    a ? new Set(a.reduced.rowList) : null, { avoid: a?.system.sets, avoidLocked: fA.map((x, i) => x != null && fB[i] == null), payoutLadder: [1], sameLadder: a ? B_SAME_LADDER : [null], signLadder: SIGN_LADDER_B });
  const A = a && finish(a, "A", fA), B = b && finish(b, "B", fB);
  // A+B tillsammans: gemensamma rader och chansen att någon av kupongerna tar 13 rätt
  let overlap = 0, unionHit = A ? A.hitAll : 0;
  if (B) {
    const setA = new Set(A?.rowList || []);
    B.rowList.forEach((row, i) => { if (setA.has(row)) overlap++; else unionHit += B.rowP[i]; });
  }
  return { A, B, overlap, unionHit };
}
