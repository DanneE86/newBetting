// Faktorer per start för travmodellen + inlärning (villkorad logit) för fliken "Hästar". Ren logik, inget nät.
//
// raceFeatures(race, ctx) ger för varje ej struken häst råvärden för alla kandidatfaktorer. Varje faktor
// z-standardiseras inom loppet (snitt 0, std 1, saknat värde = 0 = fältets snitt). Marknaden kommer som
// log-sannolikhet (lq: streck om det finns, annars vinnarodds) och lärs med en egen koefficient (= marknadsexponenten).
// Klassbyte (dagens förstapris mot snittet i senaste loppen) testades 2026-10-03: rullande logloss 1,6707 mot 1,6705
// utan, vikt −0,005 – borttaget (modellen har redan prisnivån i senaste loppen och pengar per start).
// Vinnarodds mot streck testades (2026-10-03) men bygger på slutodds som inte syns när V-spelet stänger – borttaget.
//
// fitLogit(races, keys) skattar vikterna så att P(häst vinner) = exp(Σ β·x) / Σ_fältet exp(Σ β·x) passar
// vinnarna bäst (maximal likelihood, L2-regularisering). Utvärdering: logloss och träffprocent (modellens etta vinner).

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const FORM_PTS = { 1: 1, 2: 0.7, 3: 0.5, 4: 0.3, 5: 0.2, 6: 0.1, 7: 0.1, 8: 0.1 };
const FORM_W = [1, 0.85, 0.7, 0.6, 0.5];
export const ODDS_POOL_HALF = 300000;

export const zScores = (vals) => {
  const xs = vals.filter((v) => v != null && Number.isFinite(v));
  const m = mean(xs);
  const sd = xs.length > 1 ? Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) : 0;
  return vals.map((v) => (v == null || !Number.isFinite(v) || !sd ? 0 : clamp((v - m) / sd, -2.5, 2.5)));
};

const runs = (records) => records.filter((r) => !r.scratched);
const pts = (r) => (r.galloped || r.disqualified ? 0 : FORM_PTS[r.place] || 0);

/**
 * Kuskform ur historiken: för varje kusk-id, starter och segrar i alla hästars tidigare starter i datan.
 * index(driverId, datum, dagar) räknar bara starter före datumet (inget läckage).
 */
export function driverIndex(games) {
  const seen = new Set();
  const by = new Map();
  for (const g of games)
    for (const race of g.races)
      for (const s of race.starts)
        for (const r of s.records) {
          if (r.scratched || !r.driverId || r.place == null) continue;
          const k = `${s.horse}|${r.date}`;
          if (seen.has(k)) continue;
          seen.add(k);
          if (!by.has(r.driverId)) by.set(r.driverId, []);
          by.get(r.driverId).push({ date: r.date, win: r.place === 1 ? 1 : 0 });
        }
  for (const xs of by.values()) xs.sort((a, b) => a.date.localeCompare(b.date));
  return (id, date, days = 365) => {
    const xs = by.get(id);
    if (!xs) return null;
    const from = new Date(Date.parse(date) - days * 86400000).toISOString().slice(0, 10);
    let n = 0;
    let w = 0;
    for (const x of xs) {
      if (x.date >= date) break;
      if (x.date < from) continue;
      n++;
      w += x.win;
    }
    return { starts: n, wins: w };
  };
}

/** Marknadssannolikheter i loppet: odds (utan marginal), streck och blandningen q (samma som trav-model). */
export function marketOf(race, live) {
  const inv = live.map((h) => (h.odds > 1 ? 1 / h.odds : null));
  const hasOdds = inv.filter((x) => x != null).length >= Math.max(2, live.length - 1);
  const invSum = inv.reduce((a, b) => a + (b || 0), 0);
  const minInv = Math.min(...inv.filter((x) => x != null), 1);
  const qOdds = live.map((_, i) => (hasOdds ? (inv[i] ?? minInv / 2) / invSum : null));
  const streckSum = live.reduce((a, h) => a + (h.streck || 0), 0);
  const qStreck = live.map((h) => (streckSum > 0 ? (h.streck || 0.002) / streckSum : null));
  const wOdds = !hasOdds ? 0 : streckSum <= 0 ? 1 : race.winTurnover == null ? 0.8 : race.winTurnover / (race.winTurnover + ODDS_POOL_HALF);
  const hasMarket = hasOdds || streckSum > 0;
  const q = live.map((_, i) => (hasMarket ? wOdds * (qOdds[i] ?? 0) + (1 - wOdds) * (qStreck[i] ?? 0) : 1 / live.length));
  return { q, qOdds, qStreck, wOdds, hasOdds, hasMarket, streckSum };
}

/**
 * Skobyte mot förra starten: { av, pa } (1/0). ATG:s "changed" säger bara ATT skorna ändrats, inte åt vilket håll.
 * Med förra startens skor: av = skor bara borttagna, pa = skor bara pålagda (båda håll = 0/0). Utan förra startens
 * skor: barfota runt om = av, skor runt om = pa, blandat = okänt (0/0). Före 2026-10-04 räknades varje byte där hästen
 * var barfota fram eller bak som "skor av" – även barfota runt om → skor bak (Readly Brodde, V85 Boden 2026-10-03).
 */
export function shoeChange(cur, prev) {
  if (!cur?.changed || cur.front == null || cur.back == null) return { av: 0, pa: 0 };
  if (prev && prev.front != null && prev.back != null) {
    const add = (cur.front && !prev.front ? 1 : 0) + (cur.back && !prev.back ? 1 : 0);
    const rem = (!cur.front && prev.front ? 1 : 0) + (!cur.back && prev.back ? 1 : 0);
    return { av: rem && !add ? 1 : 0, pa: add && !rem ? 1 : 0 };
  }
  return { av: !cur.front && !cur.back ? 1 : 0, pa: cur.front && cur.back ? 1 : 0 };
}

/**
 * Råvärden per ej struken häst. ctx: { posts (postTable), driverForm (driverIndex-funktion) }.
 * Högre värde = bättre är INTE garanterat – tecknet lärs av fitLogit.
 */
export function rawFeatures(race, h, ctx = {}) {
  const date = String(race.startTime || "").slice(0, 10);
  const rec = runs(h.records || []);
  const last = rec[0];
  const last5 = rec.slice(0, 5);
  const ok = rec.filter((r) => !r.galloped && r.km != null);
  const same = ok.filter((r) => r.startMethod === race.startMethod).slice(0, 6);
  const speed = median((same.length >= 2 ? same : ok.slice(0, 6)).map((r) => r.km));
  let form = null;
  if (last5.length) {
    let s = 0;
    let w = 0;
    last5.forEach((r, i) => {
      s += pts(r) * FORM_W[i];
      w += FORM_W[i];
    });
    form = s / w;
  }
  const g10 = rec.slice(0, 10);
  const shrunk = (st, k = 20, prior = 0.1) => (st && st.starts != null ? (st.wins + prior * k) / (st.starts + k) : null);
  const handicap = Math.max(0, (h.distance || race.distance) - race.distance);
  const days = last && date ? daysBetween(last.date, date) : null;
  const sh = h.shoes;
  const sc = sh ? shoeChange(sh, last?.shoes) : null;
  const df = ctx.driverForm && h.driverId ? ctx.driverForm(h.driverId, date) : null;
  const oddsHist = last5.filter((r) => r.odds > 1).map((r) => Math.log(r.odds));
  const prize = last5.filter((r) => r.firstPrize > 0).map((r) => Math.log(r.firstPrize));
  return {
    form,
    fart: speed != null ? -speed : null,
    kusk: shrunk(h.driverYear),
    tranare: shrunk(h.trainerYear),
    klass: h.earningsPerStart != null ? Math.log(1 + h.earningsPerStart) : null,
    spar: ctx.posts?.[`${race.startMethod}|${h.post}`]?.index ?? null,
    galopp: (g10.filter((r) => r.galloped).length + 0.5) / (g10.length + 5),
    tillagg: handicap,
    vila: days != null ? Math.log(1 + days) : null,
    vilaLang: days != null ? (days > 60 ? 1 : 0) : null,
    barfota: sh ? (!sh.front && !sh.back ? 1 : 0) : null,
    skorAv: sc ? sc.av : null,
    skorPa: sc ? sc.pa : null,
    jankare: h.sulky ? (/amerik/i.test(h.sulky.text || "") ? 1 : 0) : null,
    vagnByte: h.sulky ? (h.sulky.changed ? 1 : 0) : null,
    kuskByte: last && h.driverId ? (last.driverId && last.driverId !== h.driverId ? 1 : 0) : null,
    oddsHist: oddsHist.length ? -mean(oddsHist) : null,
    seger5: last5.length ? last5.filter((r) => r.place === 1).length / last5.length : null,
    plats5: last5.length ? last5.filter((r) => r.place >= 1 && r.place <= 3 && !r.disqualified).length / last5.length : null,
    livSeger: h.lifeStarts != null ? ((h.lifeWins || 0) + 1) / (h.lifeStarts + 10) : null,
    alder: h.age ?? null,
    sto: h.sex ? (h.sex === "mare" ? 1 : 0) : null,
    rekord: h.record != null ? -h.record : null,
    bastKm3: ok.length ? -Math.min(...ok.slice(0, 3).map((r) => r.km)) : null,
    banvana: date ? rec.filter((r) => r.track && r.track === race.track).length : null,
    starter60: date ? rec.filter((r) => daysBetween(r.date, date) <= 60).length : null,
    kuskForm: df ? (df.wins + 0.1 * 30) / (df.starts + 30) : null,
    senast: last ? pts(last) : null,
    distByte: last?.distance ? (h.distance || race.distance) - last.distance : null,
    metodByte: last?.startMethod ? (last.startMethod !== race.startMethod ? 1 : 0) : null,
    kmSenast: last?.km != null && !last.galloped ? -last.km : null,
    motstand: prize.length ? mean(prize) : null,
    pengar: h.money != null ? Math.log(1 + h.money) : null,
    sparNr: h.post ?? null,
  };
}

export const FEATURE_KEYS = [...Object.keys(rawFeatures({ startTime: "2026-01-01", distance: 2140 }, { records: [] })), "mktKvadrat"];

/**
 * Ett lopp som inlärningsrad: { id, date, n, winner (index), lq, lqOdds, lqStreck, X: { key: [z per häst] } }.
 * Lopp utan exakt en vinnare bland ej strukna hoppas över (null).
 */
export function raceRow(race, ctx = {}) {
  const live = race.starts.filter((s) => !s.scratched);
  if (live.length < 3) return null;
  const winners = live.map((s, i) => (s.result && Number(s.result.place) === 1 ? i : -1)).filter((i) => i >= 0);
  const m = marketOf(race, live);
  const raw = live.map((h) => rawFeatures(race, h, ctx));
  const X = {};
  for (const k of FEATURE_KEYS) X[k] = zScores(raw.map((r) => r[k]));
  // Marknaden modellen bygger på: V-spelets streck när det finns (i stort sett klart när spelet stänger), annars
  // vinnaroddsen. Slutoddsen för senare avdelningar syns inte när man lämnar in – bakkörning på dem vore facit.
  const hasStreck = m.qStreck.every((x) => x != null);
  const lq = (hasStreck ? m.qStreck : m.q).map((x) => Math.log(Math.max(x, 1e-4)));
  // Favorit/långskott-snedvridning
  X.mktKvadrat = zScores(lq.map((x) => x * x));
  return {
    id: race.id,
    date: String(race.startTime || "").slice(0, 10),
    n: live.length,
    nrs: live.map((h) => h.nr),
    winner: winners.length === 1 ? winners[0] : null,
    winners,
    lq,
    lqOdds: m.qOdds.map((x) => (x == null ? null : Math.log(Math.max(x, 1e-4)))),
    lqStreck: m.qStreck.map((x) => (x == null ? null : Math.log(Math.max(x, 1e-4)))),
    hasMarket: m.hasMarket,
    X,
  };
}

/** Linjär prediktor per häst: marketCoef·lq + Σ β_k · z_k. */
function scores(row, beta, keys, market = "lq") {
  const mk = row[market];
  return Array.from({ length: row.n }, (_, i) => {
    let s = (beta.market || 0) * (mk?.[i] ?? 0);
    for (const k of keys) s += (beta[k] || 0) * row.X[k][i];
    return s;
  });
}

export function probs(row, beta, keys, market = "lq") {
  const s = scores(row, beta, keys, market);
  const mx = Math.max(...s);
  const e = s.map((x) => Math.exp(x - mx));
  const t = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / t);
}

/**
 * Villkorad logit med L2 (lambda gäller faktorerna, inte marknaden). Gradientmetod (Adam).
 * Returnerar beta { market, ...keys }.
 */
export function fitLogit(rows, keys, { lambda = 2, iters = 400, lr = 0.05, market = "lq", init = {} } = {}) {
  const data = rows.filter((r) => r.winner != null && (market === "none" || r[market]?.every((x) => x != null)));
  const params = [...(market === "none" ? [] : ["market"]), ...keys];
  const beta = Object.fromEntries(params.map((k) => [k, init[k] ?? (k === "market" ? 1 : 0)]));
  const m = Object.fromEntries(params.map((k) => [k, 0]));
  const v = Object.fromEntries(params.map((k) => [k, 0]));
  const N = data.length || 1;
  for (let t = 1; t <= iters; t++) {
    const g = Object.fromEntries(params.map((k) => [k, 0]));
    for (const row of data) {
      const p = probs(row, beta, keys, market);
      const w = row.winner;
      for (const k of params) {
        const x = k === "market" ? row[market] : row.X[k];
        let ex = 0;
        for (let i = 0; i < row.n; i++) ex += p[i] * x[i];
        g[k] += x[w] - ex;
      }
    }
    for (const k of params) {
      let grad = -g[k] / N;
      if (k !== "market") grad += (lambda / N) * beta[k];
      m[k] = 0.9 * m[k] + 0.1 * grad;
      v[k] = 0.999 * v[k] + 0.001 * grad * grad;
      const mh = m[k] / (1 - 0.9 ** t);
      const vh = v[k] / (1 - 0.999 ** t);
      beta[k] -= (lr * mh) / (Math.sqrt(vh) + 1e-8);
    }
  }
  return beta;
}

/** Utvärdering: logloss per lopp, träffprocent för modellens etta, snittchans på vinnaren. */
export function evaluate(rows, beta, keys, market = "lq") {
  let ll = 0;
  let hit = 0;
  let n = 0;
  let top3 = 0;
  for (const row of rows) {
    if (!row.winners.length || (market !== "none" && !row[market]?.every((x) => x != null))) continue;
    const p = probs(row, beta, keys, market);
    const pw = row.winners.reduce((a, i) => a + p[i], 0);
    ll -= Math.log(Math.max(pw, 1e-6));
    const order = p.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
    if (row.winners.includes(order[0])) hit++;
    if (order.slice(0, 3).some((i) => row.winners.includes(i))) top3++;
    n++;
  }
  return { races: n, logLoss: n ? ll / n : null, hitRate: n ? hit / n : null, top3Rate: n ? top3 / n : null };
}

/**
 * Inlärningsrader för många omgångar. Spårtabell och kuskform räknas PER OMGÅNG – precis som i skarpt läge,
 * där modellen bara ser den aktuella omgångens historik. Samma lopp i flera spel (V86 + V64) tas bara en gång.
 * postTable skickas in (bor i trav-model.mjs) för att undvika cirkulär import.
 */
export function buildRows(games, { postTable, withMarketOnly = true } = {}) {
  const seen = new Set();
  const rows = [];
  for (const g of games) {
    const ctx = { posts: postTable ? postTable([g]) : {}, driverForm: driverIndex([g]) };
    for (const r of g.races) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      const row = raceRow(r, ctx);
      if (!row || (withMarketOnly && !row.hasMarket)) continue;
      row.type = g.type;
      row.gameId = g.id;
      rows.push(row);
    }
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

/** Vinnande sannolikheter för ett lopps ej strukna hästar med inlärda vikter: { nrs, p, lin }. */
export function learnedProbs(race, ctx, learned) {
  const row = raceRow(race, ctx);
  if (!row) return null;
  const keys = Object.keys(learned.weights);
  const beta = { market: row.hasMarket ? learned.market : 0, ...learned.weights };
  const lin = Array.from({ length: row.n }, (_, i) => keys.reduce((a, k) => a + beta[k] * row.X[k][i], 0));
  return { nrs: row.nrs, p: probs(row, beta, keys), lin, X: row.X };
}

/**
 * Delpoäng 0–100 per område för hästpoängen (fliken Hästar). Riktningen är satt efter vad som är bra för hästen
 * (bra form, snabb km-tid, få galopper …), inte efter den inlärda vikten – vikten kan vara negativ för att folket
 * redan överskattar faktorn (t.ex. form). Varje område = summan av faktorernas z-värden, z-standardiserad igen inom
 * loppet: 50 = loppets snitt, 70 = klart bättre än fältet, 100 = bäst med mycket stor marginal.
 */
export const SCORE_GROUPS = {
  form: { form: 1, seger5: 1, plats5: 1, senast: 1, galopp: -1 },
  fart: { fart: 1, bastKm3: 1, rekord: 1, kmSenast: 1 },
  klass: { klass: 1, motstand: 1, pengar: 1, livSeger: 1 },
  spar: { spar: 1, tillagg: -1 },
  kusk: { kusk: 1, kuskForm: 1 },
  tranare: { tranare: 1 },
  utrustning: { barfota: 1, skorAv: 1, skorPa: -1, jankare: 1 },
};

const toPoints = (z) => Math.round(clamp(50 + 20 * z, 0, 100));

/** { område: [poäng per häst i row-ordning] } + marknad (strecket/oddsen) ur raceRow-raden. */
export function groupScores(row) {
  const out = {};
  for (const [g, keys] of Object.entries(SCORE_GROUPS)) {
    const sum = Array.from({ length: row.n }, (_, i) => Object.entries(keys).reduce((a, [k, s]) => a + s * (row.X[k]?.[i] ?? 0), 0));
    out[g] = zScores(sum).map(toPoints);
  }
  out.marknad = row.hasMarket ? zScores(row.lq).map(toPoints) : row.lq.map(() => 50);
  return out;
}
