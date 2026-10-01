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
// Kupong C (användaren 2026-09-30): ett helt eget system på 700–850 kr, oberoende av A och B. Bara krav som gäller C
// (scope "C" eller "all") låses där; "both" = A och B.
// Samma regler som A (4-2-2, färgfönster, högst 4 spikar, skräll- och favoritregeln) och minst 30 000 kr för 13 rätt.
const BUDGET_C = { min: 700, max: 850 };
const UTD_MIN_C = 30000;
// Kupong B mot A (användarens regel 2026-10-01, A är huvudsystemet): högst 1 spik med samma tecken på samma match och aldrig exakt samma
// halv- eller helgardering (bara spiken får vara identisk). Egna krav räknas inte. Går det inte att bygga släpps spikgränsen stegvis (B_SAME_LADDER).
const B_MAX_SAME_SPIK = 1;
const B_SAME_LADDER = [1, 2, 3, 4];
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
// Rörliga färgfönster per omgång (användaren 2026-09-30: inte fasta, inte snäva). Väntat antal gröna/gula/röda i rätt
// rad = summan av våra procent för tecknen med den färgen (alla 13 matcher). Fönstret för hela raden har bredd 3 eller 4
// (t.ex. 5–9) och innehåller alltid det väntade antalet. Spikar är rosa i Gambling Cabin och räknas inte där, så
// spikarnas färger dras av (3 gröna spikar: 5–9 -> 2–6 i garderingarna); rosa = antal spikar. Samma som fetch-stryktipset.mjs.
const DYN_WIDTHS = [3, 4];
function dynamicRanges(events, grund, colorIdx) {
  const spik = [0, 0, 0], exp = [0, 0, 0];
  grund.sets.forEach((set, i) => { if (set.length === 1) spik[colorIdx[i][set[0]]]++; });
  events.forEach((e, i) => [0, 1, 2].forEach((k) => { exp[colorIdx[i][k]] += e.final[k]; }));
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
// other = { sets, maxSame, locked }: grundraden får högst maxSame spikar som är identiska med other.sets och ingen identisk
// halv- eller helgardering (kupong B mot A). Där användaren låst ett krav bara i A (locked[i]) får B aldrig ha exakt samma tecken,
// oavsett typ (spik, halv- eller helgardering). Krav i B räknas inte.
function grundCandidates(events, maxRows, forced, other = null, spikMin = 0) {
  const same = (a, b) => a.length === b.length && a.every((x, j) => x === b[j]);
  const options = (e, i) => {
    if (forced[i] != null) return [forced[i]];
    const order = [0, 1, 2].sort((a, b) => e.final[b] - e.final[a]);
    const subs = [1, 2, 3].map((n) => order.slice(0, n).sort());
    // Andra spikar och halvgarderingar än A: alla tecken och par, inte bara de troligaste
    if (other) {
      for (const k of [0, 1, 2]) if (!subs.some((x) => same(x, [k]))) subs.push([k]);
      for (const x of [[0, 1], [0, 2], [1, 2]]) if (!subs.some((y) => same(y, x))) subs.push(x);
      return subs.filter((x) => !((x.length > 1 || other.locked?.[i]) && same(x, other.sets[i])) && (x.length > 1 || spikOk(e, x[0], spikMin)));
    }
    return subs.filter((x) => x.length > 1 || spikOk(e, x[0], spikMin));
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
function colorRuleOptions(all, minRows, target, bands = null, fixed = null) {
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
const fitsColors = (c, r) => c[0] >= r[0][0] && c[0] <= r[0][1] && c[1] >= r[1][0] && c[1] <= r[1][1] && c[2] >= r[2][0] && c[2] <= r[2][1];
// Högst så många färgkombinationer provas per grundrad (bästa först); resten ger sällan något när skrällregeln fallerar
const MAX_COLOR_OPTIONS = 60;
// Exakt utdelningsgräns (användaren 2026-09-30: "30k, inte mindre, inte mer"): gränsen i Gambling Cabin-länken är alltid
// spelets regel och budgeten nås med grundrad och färgregler i stället för att höja gränsen. Går det inte höjs gränsen
// som reserv, och kupongen säger det. Raderna grupperas per färgtriplett så att många kombinationer kan provas snabbt.
// Samma som fetch-stryktipset.mjs.
// Av som standard (2026-09-30 sent): exakt gräns gav sämre resultat i backtest, regeln är en lägsta gräns som får höjas.
const EXACT_FLOOR = false;
const COLOR_TRIM_EXACT = 3;
function exactColorOptions(all, minRows, maxRows, fixed = null) {
  const groups = new Map();
  for (const r of all) {
    const k = r.c.join(",");
    const g = groups.get(k) || { c: r.c, n: 0, p: 0 };
    g.n++; g.p += r.p;
    groups.set(k, g);
  }
  const gl = [...groups.values()];
  const lo = [13, 13, 13], hi = [0, 0, 0];
  for (const g of gl) for (let c = 0; c < 3; c++) { if (g.c[c] < lo[c]) lo[c] = g.c[c]; if (g.c[c] > hi[c]) hi[c] = g.c[c]; }
  const ranges = fixed || [0, 1, 2].map((c) => {
    const out = [];
    const w = Math.min(COLOR_WIDTH, hi[c] - lo[c]);
    for (let a = lo[c]; a <= Math.min(lo[c] + COLOR_TRIM_EXACT, hi[c]); a++) for (let b = Math.max(hi[c] - COLOR_TRIM_EXACT, a + w); b <= hi[c]; b++) out.push([a, b]);
    return out.length ? out : [[lo[c], hi[c]]];
  });
  const opts = [];
  for (const g of ranges[0]) for (const y of ranges[1]) for (const rd of ranges[2]) {
    const rule = [g, y, rd];
    let n = 0, p = 0;
    for (const x of gl) if (fitsColors(x.c, rule)) { n += x.n; p += x.p; }
    if (n >= minRows && n <= maxRows) opts.push({ rule, score: p, width: g[1] - g[0] + y[1] - y[0] + rd[1] - rd[0] });
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
  const colorIdx = events.map((e) => [0, 1, 2].map((k) => COLOR_KEYS.indexOf(signColor(e.folk?.[k]))));
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
      const ci = grund.sets[i].length > 1 ? colorIdx[i][k] : -1; // spikar är rosa och räknas inte
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
  const spikes = grund.sets.filter((x) => x.length === 1).length;
  const target = colorTarget ? dynamicRanges(events, grund, colorIdx) : null;
  if (target && target.some((x) => !x.length)) return null;
  const options = exactFloor ? exactColorOptions(all, minRows, maxRows, target) : colorRuleOptions(all, minRows, Math.round((minRows + maxRows) / 2), null, target);
  for (const opt of options.slice(0, MAX_COLOR_OPTIONS)) {
    const pool = all.filter((r) => fitsColors(r.c, opt.rule));
    const cut = exactFloor ? { t: payoutMin, kept: pool } : cutRows(pool, floor, minRows, maxRows);
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
  const candCache = new Map(); // samma grundradskandidater (och deras rader i walkCache) för alla steg i reservordningen
  // Ordning (2026-09-30): färgfönstren släpps först, sedan skräll- och favoritregeln, sedan B:s spikgräns och sist
  // tecken- och utdelningsreglerna (de släpps bara när dina krav gör kupongen omöjlig). Tidigare provades alla tecken- och
  // utdelningssteg innan skrällregeln släpptes – upp till 40 omräkningar och 17 sekunder på Stryktipset.
  // Favoritregeln (minst 10 %) släpps aldrig i första varvet – bara om ingen kupong alls går att bygga (andra varvet)
  for (const shareLevels of [[[RED_MAX_SHARE, FAV_MIN_SHARE], [1, FAV_MIN_SHARE]], [[1, 0]]]) {
  for (const pf of payoutLadder) {
  for (const sm of signLadder) {
  for (const maxSame of sameLadder) {
  if (!candCache.has(maxSame)) candCache.set(maxSame, grundCandidates(events, GRUND_MAX_ROWS, forced, maxSame == null ? null : { sets: avoid, maxSame, locked: avoidLocked }, base.spikMin || 0));
  const cands = candCache.get(maxSame);
  // Exakt utdelningsgräns är viktigare än färgfönster och skrällgräns: den höjs först när de har släppts
  for (const exactFloor of EXACT_FLOOR ? [true, false] : [false]) {
  for (const [redMax, favMin] of shareLevels) {
    for (const colorTarget of [true, false]) {
      const best = bestReduced(events, cands, { ...base, signMin: sm, payoutMin: base.payoutMin * pf, budget: b, redMax, favMin, colorTarget, exactFloor }, exclude, avoid);
      if (best) {
        const relaxed = [];
        if (EXACT_FLOOR && !exactFloor && pf === 1) relaxed.push(`utdelningsgränsen ${Math.round(base.payoutMin).toLocaleString("sv-SE")} kr gav inte ${budget.min}–${budget.max} kr med exakt gräns – den höjdes till ${Math.round(best.reduced.rules.payoutMin).toLocaleString("sv-SE")} kr i länken`);
        if (!colorTarget) relaxed.push("färgfönstren runt det väntade antalet gick inte att hålla – färgerna optimerades fritt");
        if (redMax === 1) relaxed.push(`skrällgränsen (rött tecken på högst ${Math.round(RED_MAX_SHARE * 100)} % av raderna) gick inte att hålla`);
        if (favMin === 0) relaxed.push(`favoriten på minst ${Math.round(FAV_MIN_SHARE * 100)} % av raderna gick inte att hålla`);
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
 * krav: { [eventNumber]: { signs: "1" | "1X" | "X2" | "12" | "1X2" | ..., scope: "both" | "A" | "B" | "C" | "all" } }
 * "both" = A och B, "all" = A, B och C.
 * A = bästa systemet med A:s krav (350–400 kr, spelets utdelningsgräns).
 * B = ett eget system med B:s krav: minst 30 000 kr för 13 rätt utan tak, teckenregler 3-3-3, högst 1 spik samma som A och ingen halvgardering
 *     identisk med A, valt så att det täcker så mycket som möjligt av det A saknar (några gemensamma rader är tillåtna).
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
  // Kupong C: fri från A och B, bara C:s egna krav
  const fC = forcedFor("C");
  const signC = SIGN_MIN_C_BY_PRODUCT[p.product] || SIGN_MIN;
  const c = buildWithLadder(events, fC, { ...base, payoutMin: Math.max(UTD_MIN_C, base.payoutMin) }, BUDGET_C, null, { payoutLadder: [1], signLadder: [signC, ...SIGN_LADDER.filter((x) => x.join() !== signC.join() && x.every((v, k) => v <= signC[k]))] });
  const C = c && finish(c, "C", fC);
  return { A, B, C, overlap, unionHit };
}
