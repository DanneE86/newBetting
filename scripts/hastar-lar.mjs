// Lär travmodellens vikter av säsongsfilerna (data/hastar/historik/<år>.jsonl.gz).
//
//   node scripts/hastar-lar.mjs              rullande test + nya vikter i scripts/lib/trav-weights.mjs
//   node scripts/hastar-lar.mjs --torr       bara rullande test, skriver inga vikter
//
// Metod: villkorad logit (scripts/lib/trav-features.mjs). Varje testmånad tränas på allt FÖRE månaden och testas på
// månaden (inget facit läcker). Regulariseringen (λ) väljs på den rullande testens logloss. Vikterna skrivs bara om
// den inlärda modellen slår både marknaden och den gamla modellen på de rullande testmånaderna.
// Rapport: data/hastar/historik/lararapport.json.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { postTable, analyzeRace } from "./lib/trav-model.mjs";
import { buildRows, driverIndex, fitLogit, evaluate, FEATURE_KEYS } from "./lib/trav-features.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HIST = path.join(ROOT, "data", "hastar", "historik");
const args = process.argv.slice(2);
const has = (k) => args.includes(`--${k}`);
const log = (...a) => console.log(...a);
export const LAMBDAS = [8, 32, 128, 512];
const MIN_TRAIN = 1500;

export function loadSeasons(dir = HIST) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d{4}\.jsonl\.gz$/.test(f)).sort() : [];
  return files.flatMap((f) =>
    zlib
      .gunzipSync(fs.readFileSync(path.join(dir, f)))
      .toString("utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l)),
  );
}

/** Gamla modellens chanser (handsatta vikter) per lopp-id, för jämförelse. */
function oldModelProbs(games) {
  const out = new Map();
  for (const g of games) {
    const posts = postTable([g]);
    const driverForm = driverIndex([g]);
    for (const r of g.races) {
      if (out.has(r.id)) continue;
      const a = analyzeRace(r, posts, { learned: false, driverForm });
      out.set(r.id, Object.fromEntries(a.horses.map((h) => [h.nr, h.p])));
    }
  }
  return out;
}

function evalProbs(rows, pOf) {
  let ll = 0;
  let hit = 0;
  let top3 = 0;
  let n = 0;
  for (const r of rows) {
    if (!r.winners.length) continue;
    const p = pOf(r);
    ll -= Math.log(Math.max(r.winners.reduce((a, i) => a + p[i], 0), 1e-6));
    const order = p.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
    if (r.winners.includes(order[0])) hit++;
    if (order.slice(0, 3).some((i) => r.winners.includes(i))) top3++;
    n++;
  }
  return { races: n, logLoss: ll / n, hitRate: hit / n, top3Rate: top3 / n };
}

const addTo = (acc, e) => {
  acc.ll += e.logLoss * e.races;
  acc.hit += e.hitRate * e.races;
  acc.top3 += e.top3Rate * e.races;
  acc.n += e.races;
};
const total = (a) => ({ races: a.n, logLoss: +(a.ll / a.n).toFixed(4), hitRate: +(a.hit / a.n).toFixed(4), top3Rate: +(a.top3 / a.n).toFixed(4) });

/**
 * Rullande test. Returnerar { months, totals: { gammal, marknad, λ... }, betas: { λ: [{ month, beta }] } }.
 * fitFn/evalFn kan bytas i tester.
 */
export function rollingTest(rows, oldP, { lambdas = LAMBDAS, minTrain = MIN_TRAIN, keys = FEATURE_KEYS, iters = 300, onMonth } = {}) {
  const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))].filter((m) => rows.filter((r) => r.date < m).length >= minTrain);
  const acc = { gammal: { ll: 0, hit: 0, top3: 0, n: 0 }, marknad: { ll: 0, hit: 0, top3: 0, n: 0 } };
  for (const l of lambdas) acc[`λ${l}`] = { ll: 0, hit: 0, top3: 0, n: 0 };
  const betas = Object.fromEntries(lambdas.map((l) => [l, []]));
  const perMonth = [];
  for (const m of months) {
    const train = rows.filter((r) => r.date < m);
    const test = rows.filter((r) => r.date.startsWith(m));
    const line = { month: m, races: test.length };
    if (oldP) {
      const e = evalProbs(test, (r) => r.nrs.map((nr) => oldP.get(r.id)?.[nr] ?? 1e-4));
      addTo(acc.gammal, e);
      line.gammal = e;
    }
    const mk = fitLogit(train, [], { iters });
    const em = evaluate(test, mk, []);
    addTo(acc.marknad, em);
    line.marknad = em;
    let init = mk;
    for (const l of lambdas) {
      const b = fitLogit(train, keys, { lambda: l, iters, init });
      const e = evaluate(test, b, keys);
      addTo(acc[`λ${l}`], e);
      betas[l].push({ month: m, beta: b });
      line[`λ${l}`] = e;
    }
    perMonth.push(line);
    onMonth?.(line);
  }
  return { months, totals: Object.fromEntries(Object.entries(acc).filter(([, a]) => a.n).map(([k, a]) => [k, total(a)])), betas, perMonth };
}

function writeWeights(learned) {
  const f = path.join(ROOT, "scripts", "lib", "trav-weights.mjs");
  fs.writeFileSync(
    f,
    `// GENERERAD av \`node scripts/hastar-lar.mjs\` – ändra inte för hand. Inlärda vikter för travmodellen.
// Tränad ${learned.trainedAt.slice(0, 10)} på ${learned.races} lopp (${learned.period.from} – ${learned.period.to}), λ = ${learned.lambda}.
// Rullande test (tränat före varje månad, testat på månaden): se eval och data/hastar/historik/lararapport.json.
export const LEARNED = ${JSON.stringify(learned, null, 1)};
`,
  );
  log(`Vikter sparade: scripts/lib/trav-weights.mjs`);
}

async function main() {
  const { withLopp } = await import("./hastar-lopp.mjs");
  const games = withLopp(loadSeasons());
  if (!games.length) throw new Error("Inga säsongsfiler – kör node scripts/hastar-sasong.mjs --hamta först");
  const rows = buildRows(games, { postTable });
  log(`${games.length} omgångar, ${rows.length} lopp (${rows[0].date} – ${rows.at(-1).date}), ${FEATURE_KEYS.length} faktorer`);
  const oldP = oldModelProbs(games);
  const fmt = (e) => `${e.logLoss.toFixed(3)} / ${(e.hitRate * 100).toFixed(1)} %`;
  const rt = rollingTest(rows, oldP, {
    onMonth: (l) => log(`${l.month} (${l.races} lopp)  gammal ${fmt(l.gammal)}  marknad ${fmt(l.marknad)}  ${LAMBDAS.map((x) => `λ${x} ${fmt(l[`λ${x}`])}`).join("  ")}`),
  });
  log("\nRullande test totalt (logloss / modellens etta vinner / vinnaren bland topp 3):");
  for (const [k, t] of Object.entries(rt.totals)) log(`  ${k.padEnd(8)} ${t.logLoss.toFixed(4)}  ${(t.hitRate * 100).toFixed(2)} %  ${(t.top3Rate * 100).toFixed(2)} %  (${t.races} lopp)`);
  const bestL = LAMBDAS.reduce((b, l) => (rt.totals[`λ${l}`].logLoss < rt.totals[`λ${b}`].logLoss ? l : b), LAMBDAS[0]);
  const best = rt.totals[`λ${bestL}`];
  const beats = best.logLoss < rt.totals.marknad.logLoss && best.logLoss < (rt.totals.gammal?.logLoss ?? Infinity);
  log(`\nBästa λ = ${bestL}. ${beats ? "Slår marknaden och gamla modellen." : "Slår INTE både marknaden och gamla modellen – vikterna skrivs inte."}`);

  // Stabilitet: håller vikten samma tecken varje testmånad?
  const hist = rt.betas[bestL];
  const final = fitLogit(rows, FEATURE_KEYS, { lambda: bestL, iters: 500, init: hist.at(-1)?.beta });
  const factors = FEATURE_KEYS.map((k) => {
    const xs = hist.map((h) => h.beta[k]);
    return { key: k, weight: +final[k].toFixed(4), stable: xs.every((x) => Math.sign(x) === Math.sign(final[k])), monthly: xs.map((x) => +x.toFixed(3)) };
  }).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  log("\nSlutvikter (tränade på alla lopp):");
  log(`  marknad  ${final.market.toFixed(3)}  (exponent på marknadens sannolikhet)`);
  for (const f of factors) log(`  ${f.key.padEnd(13)} ${f.weight.toFixed(3).padStart(7)}  ${f.stable ? "stabil" : "byter tecken"}`);

  const learned = {
    trainedAt: new Date().toISOString(),
    period: { from: rows[0].date, to: rows.at(-1).date },
    races: rows.length,
    lambda: bestL,
    market: +final.market.toFixed(4),
    weights: Object.fromEntries(FEATURE_KEYS.map((k) => [k, +final[k].toFixed(4)])),
    eval: { rolling: { months: rt.months, gammal: rt.totals.gammal, marknad: rt.totals.marknad, inlard: best } },
  };
  fs.mkdirSync(HIST, { recursive: true });
  fs.writeFileSync(path.join(HIST, "lararapport.json"), JSON.stringify({ ...learned, beats, factors, totals: rt.totals, perMonth: rt.perMonth }, null, 1));
  log("Rapport: data/hastar/historik/lararapport.json");
  if (beats && !has("torr")) writeWeights(learned);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((e) => {
    console.error(e.stack || e);
    process.exit(1);
  });
