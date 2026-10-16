// Signaltest: säger Sportinfo-datan något som marknaden (ATG:s vinnarodds) inte redan vet?
//
// Varje start i Sportinfo-hästfilerna (data/hastar/travsport) som också finns i ATG-historiken
// (databas/hastar.sqlite, tabellerna starter + lopp) med odds blir ett testfall. Egenskaperna
// räknas bara ur hästens starter FÖRE det datumet. Marknadens chans = 1/odds normerat per lopp.
// Mått: faktiska segrar / väntade segrar (A/E). Över 1 = hästarna vinner oftare än oddsen säger.
// Lärperiod före 2025, kontrollperiod 2025–. En signal räknas bara om den håller åt samma håll i båda.
//
//   npm run databas -- hastar        (först, så att travsport_* och sportinfo_* finns)
//   node scripts/sportinfo-signaltest.mjs
//
// Skriver data/hastar/sportinfo/signaltest.json (gitignorerad, som all Sportinfo-data).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { ae, egenskaper, sammanstall, KONTROLL_FRAN } from "./lib/sportinfo-signal.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB = path.join(ROOT, "databas", "hastar.sqlite");
const UT = path.join(ROOT, "data", "hastar", "sportinfo", "signaltest.json");

const db = new DatabaseSync(DB, { readOnly: true });
const harTabell = (t) => !!db.prepare("SELECT 1 FROM sqlite_master WHERE name = ?").get(t);
if (!harTabell("travsport_starter")) throw new Error("travsport_starter saknas – kör npm run databas -- hastar först");

// Marknaden per lopp: alla ej strukna med odds
const marknad = new Map();
for (const r of db.prepare("SELECT s.lopp_id, s.hast_id, s.startnummer, s.odds, s.placering, s.ordning_i_mal, l.datum FROM starter s JOIN lopp l USING (lopp_id) WHERE s.odds > 0 AND (s.struken IS NULL OR s.struken = 0)").iterate()) {
  let m = marknad.get(r.lopp_id);
  if (!m) marknad.set(r.lopp_id, (m = { datum: r.datum, rader: [] }));
  m.rader.push(r);
}
const atg = new Map(); // `${hast_id}|${datum}` → { p, vann, startnummer, lopp_id }
for (const [lopp_id, m] of marknad) {
  const sum = m.rader.reduce((a, r) => a + 1 / r.odds, 0);
  for (const r of m.rader) atg.set(`${r.hast_id}|${m.datum}`, { lopp_id, p: 1 / r.odds / sum, vann: r.placering === 1 || r.ordning_i_mal === 1 ? 1 : 0, startnummer: r.startnummer });
}

const hastar = new Map(db.prepare("SELECT * FROM travsport_hastar").all().map((h) => [h.hast_id, h]));
const perHast = new Map();
for (const s of db.prepare("SELECT * FROM travsport_starter ORDER BY hast_id, datum").iterate()) {
  if (!perHast.has(s.hast_id)) perHast.set(s.hast_id, []);
  perHast.get(s.hast_id).push(s);
}
const loppInfo = new Map();
if (harTabell("sportinfo_lopp")) {
  for (const l of db.prepare("SELECT * FROM sportinfo_lopp").iterate()) loppInfo.set(`${l.raceday_id}|${l.lopp}`, { ...l, tempo: [] });
  for (const t of db.prepare("SELECT * FROM sportinfo_tempo").iterate()) loppInfo.get(`${t.raceday_id}|${t.lopp}`)?.tempo.push(t);
}

const fall = [];
for (const [hast_id, starter] of perHast) {
  for (let i = 0; i < starter.length; i++) {
    const s = starter[i];
    const m = s.datum && atg.get(`${hast_id}|${s.datum}`);
    if (!m) continue;
    const forut = starter.slice(0, i).filter((x) => x.datum && x.datum < s.datum);
    fall.push({
      datum: s.datum,
      p: m.p,
      vann: m.vann,
      f: egenskaper({ start: s, forut, hast: hastar.get(hast_id), loppInfo, atgNr: (d) => atg.get(`${hast_id}|${d}`)?.startnummer ?? null }),
    });
  }
}

const res = sammanstall(fall);
fs.mkdirSync(path.dirname(UT), { recursive: true });
fs.writeFileSync(UT, JSON.stringify({ skapad: new Date().toISOString(), kontroll_fran: KONTROLL_FRAN, fall: fall.length, hastar: perHast.size, signaler: res }, null, 2) + "\n");

const pct = (x) => (x == null ? "  –  " : x.toFixed(2));
const bas = ae(fall);
console.log(`${fall.length} starter med odds (${perHast.size} hästar). A/E = segrar / väntade enligt oddsen; alla starter ${pct(bas.ae)}.`);
console.log(`Kvot = A/E med signalen delat med A/E utan den, bland samma hästar. Kontroll från ${KONTROLL_FRAN}.\n`);
console.log("signal".padEnd(44), "n".padStart(6), "A/E".padStart(6), "kvot".padStart(6), "95 %".padStart(12), "lär".padStart(6), "kontr".padStart(6), "  bedömning");
for (const r of res) {
  console.log(
    r.signal.padEnd(44), String(r.alla.n).padStart(6), pct(r.alla.ae).padStart(6), pct(r.alla.kvot).padStart(6),
    `${pct(r.alla.lag)}–${pct(r.alla.hog)}`.padStart(12), pct(r.lar.kvot).padStart(6), pct(r.kontroll.kvot).padStart(6), "  " + r.bedomning,
  );
}
console.log(`\nSparat: ${path.relative(ROOT, UT)}`);
