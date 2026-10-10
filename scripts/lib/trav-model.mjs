// Travmodell för fliken "Hästar" (V75/V85/V86/V64/V65/GS75 + Dagens Dubbel). Ren logik, inget nät.
// Data kommer från ATG:s öppna racinginfo-API (scripts/fetch-hastar.mjs). Inga påhittade uppgifter:
// saknas ett värde blir det null och räknas som fältets snitt (z = 0).
//
// METOD (visas också i GUI:t under "Så räknar modellen")
// 1. Marknadsbas q: vinnaroddsen normaliseras till sannolikheter (1/odds delat med summan, tar bort ATG:s marginal).
//    Vinnarpotten är liten på morgonen och oddsen hoppar då mycket, så q blandas med V-spelets streck:
//    q = w·odds + (1 − w)·streck, w = vinnarpott / (vinnarpott + 300 000 kr). 23 000 kr ger w ≈ 0,07, 1 milj kr ≈ 0,77.
// 2. Fundamenta, varje faktor z-standardiseras inom loppet (snitt 0, std 1):
//      form     senaste 5 starterna, placeringspoäng 1:a 1,0 · 2:a 0,7 · 3:a 0,5 · 4:a 0,3 · 5:a 0,2 · 6–8 0,1 · oplacerad/galopp 0,
//               nyast väger 1,0 → 0,5
//      fart     median km-tid senaste 6 starterna utan galopp, helst samma startmetod (snabbare = bättre)
//      kusk     kuskens segerprocent i år, krympt mot 10 % med 20 fiktiva starter
//      tränare  tränarens segerprocent i år, krympt på samma sätt
//      klass    log(intjänat per start, livet)
//      spår     segerindex för startspåret och startmetoden, räknat på alla historiska starter i hämtad data,
//               krympt mot 1,0 med 40 fiktiva starter
//      galopp   andel galopper senaste 10 starterna, krympt mot 10 % (negativ vikt)
//      tillägg  meter tillägg (negativ vikt)
// 3. Modell: p ∝ q^0,85 · exp(Σ vikt·z). Exponenten 0,85 plattar ut marknaden (favoriter vinner mer sällan än oddsen
//    säger, långskott oftare). Vikterna (WEIGHTS) är startvikterna × 0,15: backtest 2026-08-22–2026-10-02 (24 V-spel,
//    187 lopp, första halvan träning, andra test) visade att ingen faktor ensam slår slutoddsen, så fundamenta får
//    bara flytta sannolikheten lite. Utan marknad används lika bas och 2,5× vikter.
// 3b. INLÄRD MODELL (används när scripts/lib/trav-weights.mjs har vikter, sedan 2026-10-03):
//    p ∝ streck^β₀ · exp(Σ β·z) över 35 faktorer (scripts/lib/trav-features.mjs), skattad med villkorad logit på
//    säsongsfilerna (node scripts/hastar-lar.mjs). Marknaden är strecket när det finns – slutodds syns inte när
//    V-spelet stänger. Rullande test (tränat före varje månad) avgör om vikterna skrivs. Formeln ovan är reserv.
// 4. Spelvärde = modellens chans / streck. Värde om kvoten ≥ 1,15 och chansen ≥ 3 %.
// 5. Hästpoäng 0–100 (horseScore): modellens chans på log-skala, 0,5 % = 0 och 60 % = 100. Samma skala i alla lopp.
//    Kontroll 2024 (43 124 hästar, utanför inlärningen): 90+ vann 49 %, 80–89 29 %, 70–79 17 %, 60–69 11 %, 50–59 7 %,
//    40–49 5 %, 30–39 3 %, under 10 0,4 % – i nivå med chansen. Delpoängen (groupScores) är jämförelser inom loppet.
// Vikterna är startvärden och ska bara ändras efter backtest (data/hastar/backtest.json), aldrig efter enstaka omgångar.

import { learnedProbs, driverIndex, shoeChange, raceRow, groupScores } from "./trav-features.mjs";
import { LEARNED } from "./trav-weights.mjs";

export const BASE_WEIGHTS = { form: 0.18, fart: 0.15, kusk: 0.12, tranare: 0.06, klass: 0.1, spar: 0.12, galopp: -0.1, tillagg: -0.08 };
export const WEIGHT_SCALE = 0.15;
export const WEIGHTS = Object.fromEntries(Object.entries(BASE_WEIGHTS).map(([k, w]) => [k, Math.round(w * WEIGHT_SCALE * 1e4) / 1e4]));
export const MARKET_EXP = 0.85;
export const VALUE_MIN = 1.15;
export const ODDS_POOL_HALF = 300000; // kr, vinnarpott där oddsen och strecket väger lika
export const RANK_LIMITS = { A: 0.2, B: 0.09, C: 0.035 };
const FORM_PTS = { 1: 1, 2: 0.7, 3: 0.5, 4: 0.3, 5: 0.2, 6: 0.1, 7: 0.1, 8: 0.1 };
const FORM_W = [1, 0.85, 0.7, 0.6, 0.5];
const SHRINK_DRIVER = 20;
const SHRINK_POST = 40;

const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const kmSeconds = (t) =>
  t && Number.isFinite(t.minutes) && Number.isFinite(t.seconds) ? t.minutes * 60 + t.seconds + (t.tenths || 0) / 10 : null;
// Ungefärlig växelkurs till SEK för utländska lopp (bara för klassnivå, inte exakt)
const PRIZE_FX = { NOK: 1, DKK: 1.5, EUR: 11.5 };
/**
 * Loppets förstapris i kr ur ATG:s pristext. Svenska: "Pris: 150.000-75.000-… kr" → 150000.
 * Utländska saknar "Pris:" och anger valuta sist: "18.000-9.000-(3.000) NOK", "7500-5000 DKK".
 */
export const parsePrize = (text) => {
  const t = String(text || "");
  const m = /^(?:\s*Pris:)?\s*(\d[\d.]*)\s*-/.exec(t) || /Pris:\s*(\d[\d.]*)/.exec(t);
  const cur = /\b(NOK|DKK|EUR)\b/.exec(t)?.[1];
  const kr = m ? Number(m[1].replace(/\./g, "")) * (cur ? PRIZE_FX[cur] : 1) : NaN;
  return Number.isFinite(kr) && kr > 0 ? Math.round(kr) : null;
};
const fullName = (p) => (p ? [p.firstName, p.lastName].filter(Boolean).join(" ") : null);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
export const START_METHOD = { auto: "Autostart", volte: "Voltstart" };

// ---------- Normalisering av ATG-svar ----------

/** En historisk start (horse.results.records) i platt form. */
export function normRecord(r) {
  const place = r.place == null || r.place === "" ? null : Number(r.place);
  return {
    date: r.date,
    raceId: r.race?.id || null,
    place: Number.isFinite(place) ? place : null,
    galloped: !!r.galloped,
    disqualified: !!r.disqualified,
    scratched: !!r.scratched,
    km: kmSeconds(r.kmTime),
    odds: r.odds ? r.odds / 100 : null,
    track: r.track?.name || null,
    startMethod: r.race?.startMethod || null,
    distance: r.start?.distance ?? null,
    post: r.start?.postPosition ?? null,
    driverId: r.start?.driver?.id ?? null,
    driver: fullName(r.start?.driver),
    firstPrize: r.race?.firstPrize ? r.race.firstPrize / 100 : null,
    // skor i den starten (true = sko), banans underlag ("light", "heavy" …) och loppform ("trot"/"monté")
    shoes: r.start?.horse?.shoes ? { front: r.start.horse.shoes.front ?? null, back: r.start.horse.shoes.back ?? null } : null,
    trackCondition: r.track?.condition || null,
    sport: r.race?.sport || null,
    raceType: r.race?.type || null,
  };
}

/**
 * Strecket och vinnaroddsen just nu (ATG:s spel-svar), för att kunna jämföra förmiddag mot spelstopp (sena pengar).
 * { at, turnover, races: { <lopp-id>: { <nr>: [streck 0–1, vinnarodds, lägsta platsodds] } } }. Strukna hästar tas
 * inte med. Platsodds sparas sedan 2026-10-09 (äldre bilder har två värden).
 */
export function streckSnapshot(game, at = new Date().toISOString()) {
  const type = game?.type || String(game?.id || "").split("_")[0];
  const races = {};
  for (const r of game?.races || []) {
    const row = {};
    for (const st of r.starts || []) {
      if (st.scratched) continue;
      const d = st.pools?.[type]?.betDistribution;
      const o = st.pools?.vinnare?.odds;
      const pl = st.pools?.plats?.minOdds;
      const tr = st.pools?.[type]?.trend;
      row[st.number] = [d != null ? d / 10000 : null, o ? o / 100 : null, pl ? pl / 100 : null, tr ?? null];
    }
    races[r.id] = row;
  }
  return { at, turnover: game?.pools?.[type]?.turnover != null ? game.pools[type].turnover / 100 : null, races };
}

/** Loppets resultat för en start: placering, km-tid, slutodds, prispengar (galopp/diskning om ATG anger det). */
export function resultOf(res) {
  if (!res) return null;
  return {
    place: res.place ?? null,
    finishOrder: res.finishOrder ?? null,
    km: kmSeconds(res.kmTime),
    finalOdds: res.finalOdds ?? null,
    prizeMoney: res.prizeMoney ?? null,
    ...(res.galloped != null ? { galloped: !!res.galloped } : {}),
    ...(res.disqualified != null ? { disqualified: !!res.disqualified } : {}),
  };
}

/** Loppfält som inte fanns i säsongsfilerna före 2026-10-04: banunderlag, segermarginal, propositionstext, loppform. */
export const raceExtras = (race) => ({
  condition: race?.track?.condition || null,
  margin: race?.result?.victoryMargin || null,
  terms: Array.isArray(race?.terms) ? race.terms.join(" ") : race?.terms || null,
  sport: race?.sport || null,
});

/** Avel, hemmabanor, id:n och rekord per startmetod/distans ur ATG:s start (spel-svaret räcker, sedan 2026-10-04). */
export function startExtras(s) {
  const h = s?.horse || {};
  const ped = h.pedigree || {};
  return {
    horseId: h.id ?? null,
    father: ped.father?.name || null,
    grandfather: ped.grandfather?.name || null, // morfar (ATG:s "grandfather" = moderns far)
    horseHome: h.homeTrack?.name || null,
    trainerId: h.trainer?.id ?? null,
    trainerHome: h.trainer?.homeTrack?.name || null,
    driverHome: s?.driver?.homeTrack?.name || null,
    avgOdds5: h.statistics?.lastFiveStarts?.averageOdds ? h.statistics.lastFiveStarts.averageOdds / 100 : null,
    lifeRecords: (h.statistics?.life?.records || [])
      .map((r) => ({ method: r.startMethod || null, dist: r.distance || null, km: kmSeconds(r.time), year: r.year ? Number(r.year) : null }))
      .filter((r) => r.km != null),
  };
}

const yearStats = (stats, year) => {
  const y = stats?.years?.[year] || stats?.years?.[year - 1];
  if (!y) return null;
  return { starts: y.starts || 0, wins: y.placement?.["1"] || 0, year: stats?.years?.[year] ? year : year - 1 };
};

/**
 * Plattar till ett ATG-spel. details: { "<raceId>_<startNr>": svar från /races/<id>/start/<nr> } (historik).
 * Historik från tävlingsdagen och framåt tas bort, så att backtest på gamla omgångar inte läcker resultat.
 */
export function normalizeGame(game, details = {}) {
  const type = game.type || String(game.id).split("_")[0];
  const races = (game.races || []).map((race, idx) => {
    const year = Number(String(race.date).slice(0, 4));
    const starts = (race.starts || []).map((s) => {
      const det = details[`${race.id}_${s.number}`];
      const records = (det?.horse?.results?.records || s.horse?.results?.records || [])
        .map(normRecord)
        .filter((r) => r.date && r.date < race.date);
      const life = s.horse?.statistics?.life || {};
      const dist = s.pools?.[type]?.betDistribution;
      const res = s.result;
      return {
        nr: s.number,
        post: s.postPosition,
        distance: s.distance || race.distance,
        scratched: !!s.scratched,
        horse: s.horse?.name || `Nr ${s.number}`,
        age: s.horse?.age ?? null,
        sex: s.horse?.sex || null,
        money: s.horse?.money ?? null,
        lifeStarts: life.starts ?? null,
        lifeWins: life.placement?.["1"] ?? null,
        earningsPerStart: life.earningsPerStart != null ? life.earningsPerStart / 100 : null,
        record: s.horse?.record?.time ? kmSeconds(s.horse.record.time) : null,
        driver: fullName(s.driver),
        driverId: s.driver?.id ?? null,
        driverYear: yearStats(s.driver?.statistics, year),
        trainer: fullName(s.horse?.trainer),
        trainerYear: yearStats(s.horse?.trainer?.statistics, year),
        shoes: s.horse?.shoes?.reported
          ? {
              front: s.horse.shoes.front?.hasShoe ?? null,
              back: s.horse.shoes.back?.hasShoe ?? null,
              changed: !!(s.horse.shoes.front?.changed || s.horse.shoes.back?.changed),
            }
          : null,
        sulky: s.horse?.sulky?.reported ? { text: s.horse.sulky.type?.text || null, changed: !!s.horse.sulky.type?.changed } : null,
        odds: s.pools?.vinnare?.odds ? s.pools.vinnare.odds / 100 : res?.finalOdds ?? null,
        streck: dist != null ? dist / 10000 : null,
        result: resultOf(res),
        ...startExtras(s),
        records,
      };
    });
    return {
      leg: idx + 1,
      number: race.number,
      id: race.id,
      name: race.name || null,
      distance: race.distance,
      startMethod: race.startMethod,
      startTime: race.startTime || race.scheduledStartTime || null,
      firstPrize: parsePrize(race.prize),
      winTurnover: race.pools?.vinnare?.turnover != null ? race.pools.vinnare.turnover / 100 : null,
      track: race.track?.name || null,
      status: race.status || null,
      ...raceExtras(race),
      starts,
    };
  });
  return {
    id: game.id,
    type,
    date: races[0]?.startTime?.slice(0, 10) || String(game.id).split("_")[1],
    track: races[0]?.track || null,
    status: game.status || null,
    turnover: game.pools?.[type]?.turnover != null ? game.pools[type].turnover / 100 : null,
    comboOdds: game.pools?.dd?.comboOdds || null,
    payouts: game.pools?.[type]?.result?.payouts || null,
    races,
  };
}

// ---------- Faktorer ----------

/** Formpoäng 0–100 av senaste 5 starterna (nyast först). */
export function formScore(records) {
  const last = records.filter((r) => !r.scratched).slice(0, 5);
  if (!last.length) return null;
  let s = 0;
  let w = 0;
  last.forEach((r, i) => {
    const pts = r.galloped || r.disqualified ? 0 : FORM_PTS[r.place] || 0;
    s += pts * FORM_W[i];
    w += FORM_W[i];
  });
  return Math.round((100 * s) / w);
}

/** Andel galopp senaste 10, krympt mot 10 % med 5 fiktiva starter. */
export function gallopRisk(records) {
  const last = records.filter((r) => !r.scratched).slice(0, 10);
  const g = last.filter((r) => r.galloped).length;
  return (g + 0.1 * 5) / (last.length + 5);
}

/** Median km-tid (sekunder) senaste 6 utan galopp, helst samma startmetod (minst 2 sådana). */
export function speedSeconds(records, method) {
  const ok = records.filter((r) => !r.scratched && !r.galloped && r.km != null).slice(0, 6);
  const same = ok.filter((r) => r.startMethod === method);
  return median((same.length >= 2 ? same : ok).map((r) => r.km));
}

/** Krympt segerprocent: (vinster + 0,1·k) / (starter + k). */
export const shrunkWin = (st, k = SHRINK_DRIVER, prior = 0.1) => (st ? (st.wins + prior * k) / (st.starts + k) : null);

/** Spårtabell: segerindex per startmetod och spår av alla historiska starter i spelet. 1,0 = snittet.
 *  table.byTrack = banspecifik tabell keyed "bana|metod|spår" för faktorn sparBana. */
export function postTable(games) {
  const agg = {};
  const aggTrack = {};
  for (const g of games)
    for (const race of g.races)
      for (const s of race.starts)
        for (const r of s.records) {
          if (r.scratched || !r.post || !r.startMethod || r.place == null) continue;
          const k = `${r.startMethod}|${r.post}`;
          (agg[k] ??= { starts: 0, wins: 0 }).starts++;
          if (r.place === 1) agg[k].wins++;
          if (r.track) {
            const kt = `${r.track}|${r.startMethod}|${r.post}`;
            (aggTrack[kt] ??= { starts: 0, wins: 0 }).starts++;
            if (r.place === 1) aggTrack[kt].wins++;
          }
        }
  const byMethod = {};
  for (const [k, a] of Object.entries(agg)) {
    const m = k.split("|")[0];
    const b = (byMethod[m] ??= { starts: 0, wins: 0 });
    b.starts += a.starts;
    b.wins += a.wins;
  }
  const table = {};
  for (const [k, a] of Object.entries(agg)) {
    const m = byMethod[k.split("|")[0]];
    const base = m.wins / m.starts || 0.1;
    table[k] = { starts: a.starts, wins: a.wins, index: r3((a.wins + base * SHRINK_POST) / (a.starts + base * SHRINK_POST)) };
  }
  const byMethodTrack = {};
  for (const [kt, a] of Object.entries(aggTrack)) {
    const [track, method] = kt.split("|");
    const tmk = `${track}|${method}`;
    (byMethodTrack[tmk] ??= { starts: 0, wins: 0 }).starts += a.starts;
    byMethodTrack[tmk].wins += a.wins;
  }
  const byTrack = {};
  for (const [kt, a] of Object.entries(aggTrack)) {
    const [track, method] = kt.split("|");
    const tm = byMethodTrack[`${track}|${method}`];
    const base = tm ? tm.wins / tm.starts || 0.1 : 0.1;
    byTrack[kt] = { starts: a.starts, wins: a.wins, index: r3((a.wins + base * SHRINK_POST) / (a.starts + base * SHRINK_POST)) };
  }
  table.byTrack = byTrack;
  return table;
}

const zScores = (vals) => {
  const xs = vals.filter((v) => v != null);
  const m = mean(xs);
  const sd = xs.length > 1 ? Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) : 0;
  return vals.map((v) => (v == null || !sd ? 0 : clamp((v - m) / sd, -2.5, 2.5)));
};
const toScore = (z) => Math.round(clamp(50 + 20 * z, 0, 100));

export const SCORE_P0 = 0.005;
export const SCORE_P1 = 0.6;
/** Hästpoäng 0–100 av vinstchansen (log-skala, 100 = bäst): 0,5 % → 0, 4 % → 43, 25 % → 82, 60 % → 100. */
export const horseScore = (p) =>
  p == null || !Number.isFinite(p) ? null : Math.round(clamp((100 * Math.log(Math.max(p, 1e-9) / SCORE_P0)) / Math.log(SCORE_P1 / SCORE_P0), 0, 100));

// ---------- Tempo / position (uppskattning, ATG:s öppna data har inga positioner i loppet) ----------

/** Positionsfördel i öppningen 0–1 av spår, startmetod och tillägg. */
export function earlyPositionEdge(post, method, handicap) {
  if (handicap > 0) return 0.1;
  if (method === "auto") return post <= 3 ? 1 - (post - 1) * 0.08 : post <= 6 ? 0.7 - (post - 4) * 0.1 : post <= 8 ? 0.35 : 0.15;
  return post <= 5 ? 0.85 - (post - 1) * 0.08 : post <= 8 ? 0.45 : 0.25;
}

const POS_LABEL = ["Ledning", "Utvändigt (dödens)", "Rygg ledaren", "I kön (inner)", "I kön (utvändigt)"];
const POS_SCORE = [80, 55, 75, 50, 45];

function tempo(race, horses) {
  const live = horses.filter((h) => !h.scratched);
  const zFart = zScores(live.map((h) => (h.speed != null ? -h.speed : null)));
  live.forEach((h, i) => {
    h._lead = earlyPositionEdge(h.post, race.startMethod, h.handicap) + 0.15 * zFart[i];
  });
  const order = [...live].sort((a, b) => b._lead - a._lead);
  order.forEach((h, i) => {
    h.position = POS_LABEL[i] || "Bakom";
    h.tempoScore = POS_SCORE[i] ?? Math.max(20, 40 - (i - 5) * 4);
  });
  const leader = order[0];
  const challengers = order.slice(1, 3).filter((h) => leader && leader._lead - h._lead < 0.15);
  const closers = [...live].filter((h) => !order.slice(0, 3).includes(h) && h.speed != null).sort((a, b) => a.speed - b.speed).slice(0, 2);
  const top = Math.max(...live.map((h) => h.p));
  const scenarios = [];
  if (leader)
    scenarios.push({
      name: "Normalt lopp",
      text: `${leader.horse} (spår ${leader.post}) bedöms leda${order[2] ? `, ${order[2].horse} får rygg ledaren` : ""}.`,
      gynnas: [leader.horse, order[2]?.horse].filter(Boolean),
    });
  if (challengers.length)
    scenarios.push({
      name: "Hårt öppningstempo",
      text: `${challengers.map((h) => h.horse).join(" och ")} kan utmana ${leader.horse} om ledningen. Då kan någon hamna i dödens och avslutare gynnas.`,
      gynnas: closers.map((h) => h.horse),
    });
  if (top < 0.4 || !challengers.length)
    scenarios.push({
      name: "Lugnt tempo",
      text: `Ingen pressar ${leader?.horse || "ledaren"}: spurtlopp där ledaren och hästarna närmast bakom gynnas, bakifrån blir det svårt.`,
      gynnas: order.slice(0, 3).map((h) => h.horse),
    });
  for (const h of live) delete h._lead;
  return {
    leader: leader?.horse || null,
    challengers: challengers.map((h) => h.horse),
    hardPace: challengers.length > 0,
    note: "Uppskattning av spår, startmetod, tillägg och fart. ATG:s öppna data har inga positioner från tidigare lopp.",
    scenarios,
  };
}

// ---------- Kommentarer (bara belagda fakta) ----------

function comments(h, race) {
  const out = [];
  const last = h.records[0];
  if (last) {
    if (last.place === 1 && !last.galloped) out.push("Vann senast");
    if (last.galloped) out.push("Galopp senast");
    else if (last.efter != null && !last.galopp && last.efter <= 15 && !(last.place >= 1 && last.place <= 3))
      out.push(`${last.place > 3 ? `${last.place}:a` : "Oplacerad"} senast, bara ${Math.max(0, Math.round(last.efter))} m efter vinnaren`);
    if (h.driverId && last.driverId && h.driverId !== last.driverId) out.push(`Kuskbyte: ${h.driver} (senast ${last.driver || "annan"})`);
    if (last.distance && Math.abs(last.distance - h.distance) >= 400) out.push(`Distansändring ${last.distance} → ${h.distance} m`);
    if (last.startMethod && last.startMethod !== race.startMethod) out.push(`Byter till ${START_METHOD[race.startMethod]?.toLowerCase() || race.startMethod}`);
    const days = daysBetween(last.date, race.startTime || race.date);
    if (days >= 60) out.push(`Lång vila (${days} dagar)`);
    else if (days <= 8) out.push(`Tät start (${days} dagar)`);
  } else out.push("Ingen startinfo i datat");
  const gl = h.records.slice(0, 5).filter((r) => r.galloped).length;
  if (gl >= 2) out.push(`Galopp i ${gl} av 5 senaste`);
  if (h.shoes && h.shoes.front === false && h.shoes.back === false) out.push(h.shoes.changed ? "Barfota runt om (ändrat)" : "Barfota runt om");
  else if (h.shoes?.changed) {
    const sc = shoeChange(h.shoes, last?.shoes);
    out.push(sc.pa ? "Skor på (ändrat)" : sc.av ? "Skor av (ändrat)" : "Skoändring");
  }
  if (h.sulky?.changed) out.push(`Vagnbyte: ${h.sulky.text}`);
  if (h.handicap > 0) out.push(`Tillägg ${h.handicap} m`);
  return out;
}

// ---------- Huvudanalys ----------

export const rankOf = (p, isTop) => (p >= RANK_LIMITS.A || (isTop && p >= 0.12) ? "A" : p >= RANK_LIMITS.B ? "B" : p >= RANK_LIMITS.C ? "C" : "D");

/** Analyserar ett lopp. posts = postTable(...). */
export function analyzeRace(race, posts = {}, opts = {}) {
  const weights = opts.weights || WEIGHTS;
  const marketExp = opts.marketExp ?? MARKET_EXP;
  const year = Number(String(race.startTime || "").slice(0, 4)) || new Date().getFullYear();
  const horses = race.starts.map((s) => ({
    ...s,
    handicap: Math.max(0, (s.distance || race.distance) - race.distance),
    formScore: formScore(s.records),
    gallopRisk: r3(gallopRisk(s.records)),
    speed: speedSeconds(s.records, race.startMethod),
    driverWin: r3(shrunkWin(s.driverYear)),
    trainerWin: r3(shrunkWin(s.trainerYear)),
    klass: s.earningsPerStart != null ? Math.log(1 + s.earningsPerStart) : null,
    postIndex: posts[`${race.startMethod}|${s.post}`]?.index ?? null,
  }));
  const live = horses.filter((h) => !h.scratched);
  const z = {
    form: zScores(live.map((h) => h.formScore)),
    fart: zScores(live.map((h) => (h.speed != null ? -h.speed : null))),
    kusk: zScores(live.map((h) => h.driverWin)),
    tranare: zScores(live.map((h) => h.trainerWin)),
    klass: zScores(live.map((h) => h.klass)),
    spar: zScores(live.map((h) => h.postIndex)),
    galopp: zScores(live.map((h) => h.gallopRisk)),
    tillagg: zScores(live.map((h) => h.handicap)),
  };
  const inv = live.map((h) => (h.odds > 1 ? 1 / h.odds : null));
  const hasOdds = inv.filter((x) => x != null).length >= Math.max(2, live.length - 1);
  const invSum = inv.reduce((a, b) => a + (b || 0), 0);
  const minInv = Math.min(...inv.filter((x) => x != null), 1);
  const qOdds = live.map((_, i) => (hasOdds ? (inv[i] ?? minInv / 2) / invSum : null));
  const streckSum = live.reduce((a, h) => a + (h.streck || 0), 0);
  const qStreck = live.map((h) => (streckSum > 0 ? (h.streck || 0.002) / streckSum : null));
  // Vikt för vinnaroddsen: okänd pott (t.ex. avgjort spel med slutodds) räknas som stor
  const wOdds = !hasOdds ? 0 : streckSum <= 0 ? 1 : race.winTurnover == null ? 0.8 : race.winTurnover / (race.winTurnover + ODDS_POOL_HALF);
  const q = live.map((_, i) => (hasOdds || streckSum > 0 ? wOdds * (qOdds[i] ?? 0) + (1 - wOdds) * (qStreck[i] ?? 0) : 1 / live.length));
  const hasMarket = hasOdds || streckSum > 0;
  const wMul = hasMarket ? 1 : 2.5;
  // Inlärd modell (trav-weights.mjs, se scripts/hastar-lar.mjs) om den finns, annars handsatta startvikter
  const learned = opts.learned === false ? null : opts.learned || LEARNED;
  const lp = learned ? learnedProbs(race, { posts, driverForm: opts.driverForm, trainerHist: opts.trainerHist }, learned) : null;
  let lin;
  let pOf;
  let linScale;
  if (lp) {
    const at = Object.fromEntries(lp.nrs.map((nr, i) => [nr, i]));
    lin = live.map((h) => lp.lin[at[h.nr]] ?? 0);
    pOf = (i) => lp.p[at[live[i].nr]] ?? 0;
    linScale = Object.values(learned.weights).reduce((a, w) => a + Math.abs(w), 0) * 0.385 || 1;
  } else {
    lin = live.map((_, i) => Object.entries(weights).reduce((a, [k, w]) => a + w * wMul * z[k][i], 0));
    const raw = live.map((_, i) => Math.pow(q[i], marketExp) * Math.exp(lin[i]));
    const rawSum = raw.reduce((a, b) => a + b, 0);
    pOf = (i) => raw[i] / rawSum;
    linScale = wMul * (Object.values(weights).reduce((a, w) => a + Math.abs(w), 0) || 1) * 0.385;
  }
  live.forEach((h, i) => {
    h.p = pOf(i);
    h.marketP = r3(qOdds[i]); // vinnaroddsens sannolikhet (utan streck)
    // Spelprocent: V-spelets streck om det finns, annars vinnaroddsens sannolikhet (t.ex. Dagens Dubbel)
    h.marketPct = streckSum > 0 ? (h.streck || 0) / streckSum : qOdds[i] ?? q[i];
    h.marketSource = streckSum > 0 ? "streck" : "odds";
    h.value = h.marketPct > 0 ? h.p / h.marketPct : null;
    h.isValue = h.value != null && h.value >= VALUE_MIN && h.p >= 0.03;
    h.scores = {
      form: toScore(z.form[i]),
      fart: toScore(z.fart[i]),
      kusk: toScore(z.kusk[i]),
      spar: toScore(z.spar[i]),
      value: h.value == null ? null : Math.round(clamp(50 * h.value, 0, 100)),
      // Totalpoäng: samma vägning som modellen, oberoende av skalan (50 = fältets snitt)
      total: toScore(lin[i] / linScale),
    };
  });
  const tp = tempo(race, horses);
  for (const h of live) h.scores.tempo = h.tempoScore;
  // Hästpoäng: total av chansen, delpoäng per område (jämfört med fältet)
  const row = raceRow(race, { posts, driverForm: opts.driverForm, trainerHist: opts.trainerHist });
  const gs = row ? groupScores(row) : null;
  const at = row ? Object.fromEntries(row.nrs.map((nr, i) => [nr, i])) : {};
  for (const h of live) {
    const i = at[h.nr];
    h.poang = { total: horseScore(h.p), tempo: h.tempoScore };
    if (gs && i != null) for (const g of Object.keys(gs)) h.poang[g] = gs[g][i];
  }
  const top = Math.max(...live.map((h) => h.p));
  for (const h of live) {
    h.rank = rankOf(h.p, h.p === top);
    h.comments = comments(h, race);
  }
  // Favorit = mest spelad
  const fav = [...live].sort((a, b) => (b.marketPct || 0) - (a.marketPct || 0))[0];
  let favorite = null;
  if (fav) {
    const why = [];
    if (fav.value != null && fav.value < 0.75) why.push(`modellen ger ${pctTxt(fav.p)} men folket ${pctTxt(fav.marketPct)}`);
    if (fav.gallopRisk >= 0.25) why.push(`galopprisk ${pctTxt(fav.gallopRisk)}`);
    if (fav.handicap > 0) why.push(`tillägg ${fav.handicap} m`);
    if (fav.scores.spar <= 35) why.push(`svagt spår (${fav.post})`);
    if (tp.challengers.length && fav.position === "Utvändigt (dödens)") why.push("riskerar dödens");
    const strong = fav.p >= 0.45 && (fav.value ?? 1) >= 0.9 && why.length === 0;
    const status = strong ? "STARK FAVORIT" : why.length && (fav.value ?? 1) < 0.85 ? "SÅRBAR FAVORIT" : why.length >= 2 ? "SÅRBAR FAVORIT" : "NORMAL FAVORIT";
    if (!why.length) why.push(`modellen ${pctTxt(fav.p)} mot folkets ${pctTxt(fav.marketPct)}`);
    favorite = { nr: fav.nr, horse: fav.horse, status, why };
  }
  const out = horses.map((h) => {
    const { records, _lead, ...rest } = h;
    return { ...rest, p: r3(h.p), value: r3(h.value), marketPct: r3(h.marketPct), last5: records.slice(0, 5) };
  });
  out.sort((a, b) => (a.scratched - b.scratched) || (b.p ?? 0) - (a.p ?? 0));
  return { ...race, starts: undefined, horses: out, favorite, tempo: tp, hasOdds, oddsWeight: r3(wOdds) };
}

const pctTxt = (x) => (x == null ? "—" : `${Math.round(x * 100)} %`);

// ---------- Spikar, skrällar, DD ----------

export function pickSpikes(races) {
  const all = races.flatMap((r) => r.horses.filter((h) => !h.scratched).map((h) => ({ ...h, leg: r.leg, raceNr: r.number })));
  const best = (xs, f) => xs.sort((a, b) => f(b) - f(a))[0] || null;
  const brief = (h, why) => h && { leg: h.leg, raceNr: h.raceNr, nr: h.nr, horse: h.horse, p: h.p, marketPct: h.marketPct, value: h.value, why };
  const sak = best(all.filter((h) => h.p >= 0.4), (h) => h.p);
  const varde = best(all.filter((h) => h.p >= 0.28 && h.value >= 1.1), (h) => h.value * h.p);
  const chans = best(all.filter((h) => h.p >= 0.2 && h.marketPct <= 0.2 && h.value >= 1.3), (h) => h.value * h.p);
  return {
    sakerhet: brief(sak, "Högst vinstchans i omgången"),
    varde: brief(varde, "Mindre spelad än chansen motiverar"),
    chans: brief(chans, "Lågt streckad men realistisk vinnare – stor systemeffekt om den går in"),
  };
}

/** Skrällar: lågt streckade med konkreta skäl. Kräver minst ett belagt skäl utöver låg spelprocent. */
export function pickUpsets(races, limit = 8) {
  const out = [];
  for (const r of races) {
    const live = r.horses.filter((h) => !h.scratched);
    const top3 = (k) => new Set([...live].sort((a, b) => (b.scores[k] ?? 0) - (a.scores[k] ?? 0)).slice(0, 3).map((h) => h.nr));
    const tf = top3("form");
    const tk = top3("kusk");
    const tfa = top3("fart");
    for (const h of live) {
      if (!(h.marketPct <= 0.08 && h.value >= 1.4 && h.p >= 0.03)) continue;
      const why = [];
      if (tf.has(h.nr)) why.push(`topp 3 form i loppet (${h.scores.form})`);
      if (tfa.has(h.nr)) why.push("topp 3 fart i loppet");
      if (tk.has(h.nr)) why.push(`stark kusk (${h.driver})`);
      if (h.position === "Ledning" || h.position === "Rygg ledaren") why.push(`trolig position: ${h.position.toLowerCase()}`);
      if (!why.length) continue; // låg spelprocent eller oddsglapp räcker inte ensamt
      if (h.marketSource === "streck" && h.marketP && h.marketP > h.marketPct * 1.3) why.push(`vinnaroddsen ger ${pctTxt(h.marketP)} mot streck ${pctTxt(h.marketPct)}`);
      out.push({ leg: r.leg, raceNr: r.number, nr: h.nr, horse: h.horse, p: h.p, marketPct: h.marketPct, value: h.value, why });
    }
  }
  return out.sort((a, b) => b.why.length - a.why.length || b.value * b.p - a.value * a.p).slice(0, limit);
}

/** Dagens Dubbel: kombinationer med sannolikhet (oberoende lopp), ATG-odds, fair odds och EV per krona. */
export function analyzeDD(race1, race2, comboOdds, { minP = 0.01, limit = 20 } = {}) {
  if (!race1 || !race2) return null;
  const a = race1.horses.filter((h) => !h.scratched);
  const b = race2.horses.filter((h) => !h.scratched);
  const combos = [];
  for (const h1 of a)
    for (const h2 of b) {
      const p = h1.p * h2.p;
      const raw = comboOdds?.[h1.nr - 1]?.[h2.nr - 1];
      const odds = raw ? raw / 100 : null;
      combos.push({ combo: `${h1.nr}-${h2.nr}`, h1: h1.horse, h2: h2.horse, p: r3(p), fair: r3(1 / p), odds, ev: odds ? r3(p * odds - 1) : null });
    }
  const valid = combos.filter((c) => c.p >= minP);
  return {
    races: [race1.number, race2.number],
    byEv: valid.filter((c) => c.ev != null).sort((x, y) => y.ev - x.ev).slice(0, limit),
    byP: [...valid].sort((x, y) => y.p - x.p).slice(0, limit),
    hasOdds: combos.some((c) => c.odds != null),
  };
}

/** Hela analysen av ett spel (+ ev. Dagens Dubbel-spel samma dag och bana). */
export function analyzeGame(game, ddGame = null, opts = {}) {
  const posts = postTable([game, ...(ddGame ? [ddGame] : [])]);
  opts = { driverForm: driverIndex([game, ...(ddGame ? [ddGame] : [])]), ...opts };
  const races = game.races.map((r) => analyzeRace(r, posts, opts));
  let dd = null;
  if (game.type === "dd") dd = analyzeDD(races[0], races[1], game.comboOdds);
  else if (ddGame) {
    const [n1, n2] = ddGame.races.map((r) => r.number);
    const ddRaces = ddGame.races.map((r) => races.find((x) => x.number === r.number) || analyzeRace(r, posts, opts));
    dd = analyzeDD(ddRaces[0], ddRaces[1], ddGame.comboOdds);
    if (dd) dd.races = [n1, n2];
    if (dd) dd.extraRaces = ddRaces.filter((r) => !races.some((x) => x.number === r.number));
  }
  const spikes = pickSpikes(races);
  const upsets = pickUpsets(races);
  const vulnerable = races.filter((r) => r.favorite?.status === "SÅRBAR FAVORIT").map((r) => ({ leg: r.leg, raceNr: r.number, ...r.favorite }));
  return {
    id: game.id,
    type: game.type,
    date: game.date,
    track: game.track,
    status: game.status,
    turnover: game.turnover,
    races,
    spikes,
    upsets,
    vulnerable,
    dd,
    postTable: posts,
    method: learnedMethod(opts) || { weights: WEIGHTS, marketExp: MARKET_EXP, valueMin: VALUE_MIN, rankLimits: RANK_LIMITS },
  };
}

/** Metodbeskrivning för GUI:t när den inlärda modellen används. */
function learnedMethod(opts) {
  const l = opts.learned === false ? null : opts.learned || LEARNED;
  if (!l) return null;
  return { learned: true, weights: l.weights, marketExp: l.market, valueMin: VALUE_MIN, rankLimits: RANK_LIMITS, trainedAt: l.trainedAt, period: l.period, races: l.races, lambda: l.lambda, eval: l.eval };
}

// ---------- Backtest ----------

/** Utvärderar sparade analyser mot resultat. analyses: [{analysis, results: {raceNr: [vinnar-nr]}}]. */
export function backtest(entries) {
  const bins = Array.from({ length: 10 }, (_, i) => ({ from: i / 10, to: (i + 1) / 10, n: 0, sumP: 0, wins: 0 }));
  const rank = {};
  const group = (o, k) => (o[k] ??= { n: 0, wins: 0, sumP: 0, stake: 0, ret: 0 });
  const byTrack = {};
  const byDist = {};
  const byMethod = {};
  const spikes = {};
  const upsets = { n: 0, wins: 0 };
  const dd = { n: 0, hits: 0, stake: 0, ret: 0 };
  let races = 0;
  let favHits = 0;
  let topHits = 0;
  let logLoss = 0;
  let mktLogLoss = 0;
  const valueBets = { n: 0, wins: 0, stake: 0, ret: 0 };
  for (const { analysis, results } of entries) {
    for (const r of analysis.races) {
      const winners = results?.[r.number];
      if (!winners?.length) continue;
      races++;
      const live = r.horses.filter((h) => !h.scratched && h.p != null);
      const won = (h) => winners.includes(h.nr);
      const top = live[0];
      if (top && won(top)) topHits++;
      const fav = [...live].sort((a, b) => b.marketPct - a.marketPct)[0];
      if (fav && won(fav)) favHits++;
      const w = live.find(won);
      if (w) {
        logLoss -= Math.log(Math.max(w.p, 1e-4));
        mktLogLoss -= Math.log(Math.max(w.marketP ?? w.marketPct ?? 1e-4, 1e-4));
      }
      const dk = r.distance <= 1700 ? "kort (≤1700)" : r.distance <= 2200 ? "medel (1701–2200)" : "lång (>2200)";
      for (const h of live) {
        const b = bins[Math.min(9, Math.floor(h.p * 10))];
        b.n++;
        b.sumP += h.p;
        if (won(h)) b.wins++;
        const g = group(rank, h.rank);
        g.n++;
        g.sumP += h.p;
        if (won(h)) g.wins++;
        if (h.isValue && h.odds) {
          valueBets.n++;
          valueBets.stake++;
          if (won(h)) {
            valueBets.wins++;
            valueBets.ret += h.odds;
          }
          for (const [o, k] of [[byTrack, r.track || "okänd"], [byDist, dk], [byMethod, START_METHOD[r.startMethod] || r.startMethod || "galopp/okänd"]]) {
            const x = group(o, k);
            x.n++;
            x.stake++;
            if (won(h)) {
              x.wins++;
              x.ret += h.odds;
            }
          }
        }
      }
    }
    for (const [k, s] of Object.entries(analysis.spikes || {})) {
      if (!s) continue;
      const winners = results?.[s.raceNr];
      if (!winners?.length) continue;
      const g = (spikes[k] ??= { n: 0, wins: 0 });
      g.n++;
      if (winners.includes(s.nr)) g.wins++;
    }
    for (const u of analysis.upsets || []) {
      const winners = results?.[u.raceNr];
      if (!winners?.length) continue;
      upsets.n++;
      if (winners.includes(u.nr)) upsets.wins++;
    }
    if (analysis.dd?.byEv?.length) {
      const [n1, n2] = analysis.dd.races;
      const w1 = results?.[n1];
      const w2 = results?.[n2];
      if (w1?.length && w2?.length) {
        for (const c of analysis.dd.byEv.filter((c) => c.ev > 0).slice(0, 3)) {
          const [a, b] = c.combo.split("-").map(Number);
          dd.n++;
          dd.stake++;
          if (w1.includes(a) && w2.includes(b)) {
            dd.hits++;
            dd.ret += c.odds;
          }
        }
      }
    }
  }
  const roi = (g) => (g.stake ? r3(g.ret / g.stake - 1) : null);
  const fin = (o) => Object.fromEntries(Object.entries(o).map(([k, g]) => [k, { ...g, hitRate: g.n ? r3(g.wins / g.n) : null, roi: roi(g), avgP: g.n && g.sumP ? r3(g.sumP / g.n) : undefined }]));
  return {
    games: entries.length,
    races,
    topHitRate: races ? r3(topHits / races) : null,
    favHitRate: races ? r3(favHits / races) : null,
    logLoss: races ? r3(logLoss / races) : null,
    marketLogLoss: races ? r3(mktLogLoss / races) : null,
    calibration: bins.filter((b) => b.n).map((b) => ({ from: b.from, to: b.to, n: b.n, avgP: r3(b.sumP / b.n), winRate: r3(b.wins / b.n) })),
    rank: fin(rank),
    valueBets: { ...valueBets, hitRate: valueBets.n ? r3(valueBets.wins / valueBets.n) : null, roi: roi(valueBets) },
    spikes: fin(spikes),
    upsets: { ...upsets, hitRate: upsets.n ? r3(upsets.wins / upsets.n) : null },
    dd: { ...dd, roi: roi(dd) },
    byTrack: fin(byTrack),
    byDistance: fin(byDist),
    byStartMethod: fin(byMethod),
  };
}

/** Vinnare per lopp ur ett avgjort ATG-spel ({ loppnr: [startnr] }, dött lopp ger flera). */
export function resultsOf(game) {
  const out = {};
  for (const r of game.races || []) {
    const w = (r.starts || []).filter((s) => s.result && Number(s.result.place) === 1).map((s) => s.number);
    if (w.length) out[r.number] = w;
  }
  return out;
}
