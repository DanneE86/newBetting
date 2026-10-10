// Jämför er modell mot Interbet-modellen (9 faktorer) och marknaden (streck) på säsongsdata.
//
//   node scripts/hastar-compare.mjs              → 2026, V85+V75+V86+GS75, 500 kr
//   node scripts/hastar-compare.mjs --ar 2025 --budget 500 --spel V85,V75
//
// Interbet-modellen: 9 viktade faktorer från hästens ATG-historik (km-tid, placering, kusk% m.m.),
// z-standardiseras inom loppet och kombineras med Interbets standardvikter (60/30/30/60/60/20/6/20/8).
// Samma systembyggare (buildSystem) används för båda – bara sannolikheterna skiljer.
// OBS: slutstreck och slutodds används, vilket gynnar båda modellerna lika.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { analyzeGame } from "./lib/trav-model.mjs";
import { buildSystem, rowPrice, TOP_SHARE, MIN_TOP, defaultAlpha } from "../gui/public/hast-engine.js";
import { legWinners, isSettled, rowsByCorrect, settle, summarize } from "./lib/hast-sasong.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HIST = path.join(ROOT, "data", "hastar", "historik");

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i < 0 ? null : args[i+1] && !args[i+1].startsWith("--") ? args[i+1] : true; };

const YEAR   = arg("ar")     || "2026";
const BUDGET = Number(arg("budget") || 500);
const TYPES  = new Set((arg("spel") || "V85,V75,V86,GS75").split(",").map(s => s.trim().toUpperCase()));

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────

function readSeason(year) {
  const f = path.join(HIST, `${year}.jsonl.gz`);
  if (!fs.existsSync(f)) throw new Error(`Säsongsfilen saknas: ${f} – kör hastar-sasong.mjs --hamta --ar ${year} först`);
  const out = [];
  for (const line of zlib.gunzipSync(fs.readFileSync(f)).toString("utf8").split("\n")) {
    if (line.trim()) out.push(JSON.parse(line));
  }
  return out;
}

// ── Interbet-modellen ────────────────────────────────────────────────────────
//
// Faktorer mappade mot ATG-data (Interbets originalfaktorer i parentes):
//   nyTid      (Ny tid,    w=60)  Senaste km-tid, negerad (lägre = bättre)
//   plats      (Plats,     w=30)  Viktat placeringspoäng senaste N starter
//   ntft       (NTFT,      w=30)  Personbästa km / senaste km (konsistens)
//   vinst      (Vinst,     w=60)  Segerandel senaste N starter
//   total      (Total,     w=60)  Topp-3-andel senaste N starter
//   alltime    (Alltime,   w=20)  Livslång segerandel (lifeWins/lifeStarts)
//   kusk       (Kusk,      w= 6)  Kuskens segerandel i år
//   ll         (LL,        w=20)  Personbästa km-tid (livstaksklass), negerad
//   forbattring(Förbättring,w=8)  Tidstrend: äldre snittid − nyare snittid (pos = förbättring)

const IB_W = { nyTid: 60, plats: 30, ntft: 30, vinst: 60, total: 60, alltime: 20, kusk: 6, ll: 20, forbattring: 8 };
const IB_N = 10;
const PLACE_PTS = { 1: 1.0, 2: 0.7, 3: 0.5, 4: 0.3, 5: 0.2 };

function ibFactors(start) {
  const recs   = (start.records || []).filter(r => !r.scratched).slice(0, IB_N);
  const noGall = recs.filter(r => !r.galloped && r.km != null);

  const latestKm = noGall[0]?.km ?? null;
  const allKms   = noGall.map(r => r.km);
  const bestKm   = allKms.length ? Math.min(...allKms) : null;

  // plats: viktat med exponentiellt förfall (nyast väger 1, fem lopp bak ~0,44)
  let plats = 0, platsW = 0;
  recs.forEach((r, i) => {
    const d = Math.pow(0.85, i);
    const pts = r.galloped ? 0 : (PLACE_PTS[r.place] ?? (r.place != null && r.place <= 8 ? 0.1 : 0));
    plats += pts * d; platsW += d;
  });

  // tidstrend: snitt 3 senaste vs 3 därinnan (positiv = snabbare senaste = förbättring)
  const avgR = noGall.slice(0, 3).length ? noGall.slice(0, 3).reduce((a,r)=>a+r.km,0) / noGall.slice(0, 3).length : null;
  const avgO = noGall.slice(3, 6).length ? noGall.slice(3, 6).reduce((a,r)=>a+r.km,0) / noGall.slice(3, 6).length : null;

  const dy = start.driverYear;
  return {
    nyTid:      latestKm ? -latestKm : null,
    plats:      platsW > 0 ? plats / platsW : null,
    ntft:       latestKm && bestKm ? bestKm / latestKm : null,
    vinst:      recs.length > 0 ? recs.filter(r => !r.galloped && r.place === 1).length / recs.length : null,
    total:      recs.length > 0 ? recs.filter(r => !r.galloped && r.place != null && r.place <= 3).length / recs.length : null,
    alltime:    start.lifeStarts > 0 ? (start.lifeWins || 0) / start.lifeStarts : null,
    kusk:       dy && dy.starts > 5 ? dy.wins / dy.starts : null,
    ll:         bestKm ? -bestKm : null,
    forbattring: avgR && avgO ? avgO - avgR : null,
  };
}

function zStd(vals) {
  const def = vals.filter(v => v != null);
  if (!def.length) return vals.map(() => 0);
  const mu = def.reduce((a,b) => a+b, 0) / def.length;
  const sd = Math.sqrt(def.reduce((a,b) => a+(b-mu)**2, 0) / def.length) || 1;
  return vals.map(v => v != null ? (v-mu)/sd : 0);
}

function softmax(scores) {
  const m = Math.max(...scores);
  const e = scores.map(s => Math.exp(s - m));
  const s = e.reduce((a,b) => a+b, 0);
  return e.map(v => v/s);
}

function interbetLegs(game) {
  return game.races.map(r => {
    const live = r.starts.filter(s => !s.scratched);
    const streckSum = r.starts.reduce((a,s) => a+(s.streck||0), 0);
    const facs = live.map(s => ibFactors(s));
    const keys = Object.keys(IB_W);
    const zV = {};
    for (const k of keys) zV[k] = zStd(facs.map(f => f[k]));
    const scores = live.map((_,i) => keys.reduce((sum,k) => sum + IB_W[k] * zV[k][i], 0));
    const probs  = softmax(scores);
    const ibP    = new Map(live.map((s,i) => [s.nr, probs[i]]));
    return {
      leg: r.leg,
      number: r.number,
      horses: r.starts.map(s => ({
        nr: s.nr,
        scratched: s.scratched || false,
        p: ibP.get(s.nr) ?? 0,
        marketPct: streckSum > 0 ? (s.streck||0)/streckSum : 1/Math.max(1, live.length),
      })),
    };
  });
}

// ── Per-omgång ───────────────────────────────────────────────────────────────

function runOne(game) {
  const price    = rowPrice(game.type, game.date);
  const topShare = TOP_SHARE[game.type] ?? 0.25;
  const winners  = legWinners(game);
  const al       = defaultAlpha(game.type);

  // Er modell (inlard, slutstreck/slutodds)
  const a    = analyzeGame(game, null, {});
  const legs = a.races.map(r => ({ leg: r.leg, number: r.number, horses: r.horses }));
  const sM   = buildSystem(legs, { budget: BUDGET, price, alpha: al, minTop: MIN_TOP, topShare });
  const resM = settle(rowsByCorrect(sM.legs.map(l => l.horses), winners), game.payouts, price);

  // Interbet-modell (alpha=0: rena sannolikheter, inget värdefilter)
  const ibL  = interbetLegs(game);
  const sIB  = buildSystem(ibL, { budget: BUDGET, price, alpha: 0, minTop: MIN_TOP, topShare });
  const resIB = settle(rowsByCorrect(sIB.legs.map(l => l.horses), winners), game.payouts, price);

  // Marknaden (streck, referens)
  const mktL  = legs.map(l => ({ ...l, horses: l.horses.map(h => ({ ...h, p: h.marketPct })) }));
  const sMkt  = buildSystem(mktL, { budget: BUDGET, price, alpha: 0, minTop: MIN_TOP, topShare });
  const resMkt = settle(rowsByCorrect(sMkt.legs.map(l => l.horses), winners), game.payouts, price);

  return {
    id: game.id, type: game.type, date: game.date, legs: winners.length,
    modell: { ...resM, rows: sM.rows, hit: sM.hit },
    interbet: { ...resIB, rows: sIB.rows, hit: sIB.hit },
    marknad: { ...resMkt, rows: sMkt.rows, hit: sMkt.hit },
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const allGames = readSeason(YEAR).filter(g => isSettled(g) && TYPES.has(g.type));
console.log(`${allGames.length} omgångar ${YEAR} (${[...TYPES].join("/")}) – ${BUDGET} kr`);

const perGame = [];
for (let i = 0; i < allGames.length; i++) {
  if ((i+1) % 50 === 0) process.stdout.write(`  ${i+1}/${allGames.length}…\r`);
  try { perGame.push(runOne(allGames[i])); }
  catch (e) { console.error(`\n  ${allGames[i].id}: ${e.message}`); }
}
console.log(`\n  ${perGame.length} omgångar körda.`);

function sum(key) {
  return summarize(perGame.map(g => ({ id: g.id, legs: g.legs, ...g[key] })));
}

// ── Sammanfattning per spelform ───────────────────────────────────────────────

const models = [["modell","Er modell"],["interbet","Interbet (9 faktorer)"],["marknad","Marknaden (streck)"]];
const types  = [...new Set(perGame.map(g => g.type))].sort();

console.log("\n── TOTALT ─────────────────────────────────────────────────────────────────────");
console.log(`${"Modell".padEnd(22)} | ${"Insats".padStart(10)} | ${"Vinst".padStart(10)} | ${"Netto".padStart(11)} | ${"ROI".padStart(7)} | ${"Träff".padStart(9)} | ${"Alla rätt".padStart(9)} | Största`);
const kr = x => `${Math.round(x).toLocaleString("sv-SE")} kr`;
const pct = x => x == null ? "     — " : `${(x*100).toFixed(1).padStart(6)} %`;

const totals = {};
for (const [key, label] of models) {
  const s = sum(key);
  totals[key] = s;
  console.log(
    `${label.padEnd(22)} | ${kr(s.cost).padStart(10)} | ${kr(s.win).padStart(10)} | ${kr(s.net).padStart(11)} | ${pct(s.roi)} | ${String(s.hitGames).padStart(4)}/${s.games} | ${String(s.allRight).padStart(9)} | ${s.biggest ? kr(s.biggest.win) : "—"}`
  );
}

for (const t of types) {
  const pg = perGame.filter(g => g.type === t);
  if (!pg.length) continue;
  console.log(`\n── ${t} (${pg.length} omgångar) ─────────────────────────────────────────────────────`);
  console.log(`${"Modell".padEnd(22)} | ${"Insats".padStart(10)} | ${"Vinst".padStart(10)} | ${"Netto".padStart(11)} | ${"ROI".padStart(7)} | ${"Träff".padStart(9)} | ${"Alla rätt".padStart(9)} | Största`);
  for (const [key, label] of models) {
    const s = summarize(pg.map(g => ({ id: g.id, legs: g.legs, ...g[key] })));
    console.log(
      `${label.padEnd(22)} | ${kr(s.cost).padStart(10)} | ${kr(s.win).padStart(10)} | ${kr(s.net).padStart(11)} | ${pct(s.roi)} | ${String(s.hitGames).padStart(4)}/${s.games} | ${String(s.allRight).padStart(9)} | ${s.biggest ? kr(s.biggest.win) : "—"}`
    );
  }
}

// ── Spara ────────────────────────────────────────────────────────────────────

const out = {
  updatedAt: new Date().toISOString(),
  year: Number(YEAR), budget: BUDGET,
  types: [...TYPES],
  note: "Slutstreck och slutodds – gynnar båda modellerna lika. Interbet alpha=0, er modell alpha=defaultAlpha.",
  totals: Object.fromEntries(models.map(([k]) => [k, totals[k]])),
  byType: Object.fromEntries(types.map(t => {
    const pg = perGame.filter(g => g.type === t);
    return [t, Object.fromEntries(models.map(([k]) => [k, summarize(pg.map(g => ({ id: g.id, legs: g.legs, ...g[k] })))]))];
  })),
  perGame,
};
const f = path.join(ROOT, "data", "hastar", `compare-interbet-vs-modell-${YEAR}.json`);
fs.writeFileSync(f, JSON.stringify(out, null, 1));
console.log(`\nSparat: data/hastar/compare-interbet-vs-modell-${YEAR}.json`);
