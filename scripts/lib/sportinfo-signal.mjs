// Egenskaper ur Sportinfo-datan per start och sammanställning mot marknaden (A/E).
// Ingen disk. Används av scripts/sportinfo-signaltest.mjs.

export const KONTROLL_FRAN = "2025-01-01";

const SJUK = /feber|förkyl|infektion|hosta|blodvärd|muskelinfl|munsår|sjukdom|virus|kolik/i;
const SKADA = /hälta|sårskada|kota|hovböld|skada|sena|bensk|ledinfl/i;
const DAG = 864e5;
const dagar = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAG);
const struken = (s) => /^str\b/i.test(s?.resultat || "");
const tal = (s) => {
  const n = Number(String(s ?? "").replace(",", ".").replace("%", ""));
  return Number.isFinite(n) && String(s ?? "").trim() !== "" ? n : null;
};

/** Tävlingsdagens ts-id ur en loppadress. */
const racedayAv = (url) => String(url || "").match(/raceday\/(ts\d+)/i)?.[1]?.toLowerCase() ?? null;

/**
 * Egenskaper för en start, bara ur det som hände före den.
 * start: raden i travsport_starter. forut: hästens tidigare rader (äldst först). hast: travsport_hastar-raden.
 * loppInfo: Map "raceday|lopp" → { domartexter, namnda_nr, bestraffningar, tempo: [{ meter, km_sek, ledare_nr }] }.
 * atgNr(datum): hästens startnummer den dagen enligt ATG (Sportinfos hästsida saknar startnummer).
 * Värde true/false, eller undefined när det inte går att avgöra (räknas då inte).
 */
export function egenskaper({ start, forut = [], hast = null, loppInfo = new Map(), atgNr = () => null }) {
  const f = {};
  const inom60 = forut.filter((x) => dagar(x.datum, start.datum) <= 60);
  const str60 = inom60.filter(struken);
  f["Sjukstruken senaste 60 d"] = str60.some((x) => SJUK.test(x.resultat));
  f["Skadestruken senaste 60 d"] = str60.some((x) => SKADA.test(x.resultat));
  f["Struken av annan orsak senaste 60 d"] = str60.some((x) => !SJUK.test(x.resultat) && !SKADA.test(x.resultat));
  const sistaRad = forut[forut.length - 1];
  f["Första start efter sjukstrykning"] = !!sistaRad && struken(sistaRad) && SJUK.test(sistaRad.resultat);
  f["Första start efter skadestrykning"] = !!sistaRad && struken(sistaRad) && SKADA.test(sistaRad.resultat);

  const riktiga = forut.filter((x) => !struken(x));
  const senast = riktiga[riktiga.length - 1];
  if (senast) {
    const res = String(senast.resultat || "").toLowerCase();
    f["Galopp senast"] = senast.galopp === 1 || senast.galopp === true;
    f["Diskad senast"] = res === "d" || res.startsWith("gdk") || res === "ejg" || res === "ejp";
    if (senast.tranare && start.tranare) f["Tränarbyte sedan förra starten"] = senast.tranare !== start.tranare;
    const gap = dagar(senast.datum, start.datum);
    f["Uppehåll 60–119 dagar"] = gap >= 60 && gap < 120;
    f["Uppehåll 120+ dagar"] = gap >= 120;
    f["Struken minst 2 gånger sedan förra starten"] = forut.slice(forut.indexOf(senast) + 1).filter(struken).length >= 2;

    const li = loppInfo.get(`${racedayAv(senast.lopp_url)}|${senast.lopp}`);
    const nr = atgNr(senast.datum);
    if (li && nr != null) {
      const vid = (m) => li.tempo.find((t) => t.meter === m);
      if (vid(500)) f["Ledde vid 500 m senast"] = vid(500).ledare_nr === nr;
      if (vid(1000)) f["Ledde vid 1000 m senast"] = vid(1000).ledare_nr === nr;
      const namnda = String(li.namnda_nr || "").split(",").filter(Boolean).map(Number);
      f["Nämnd av domarna senast"] = namnda.includes(nr);
      if (vid(500)) f["Senast i lopp med snabb öppning (≤ 1.09,5)"] = vid(500).km_sek <= 69.5;
    }
  }
  if (hast) {
    const ai = tal(hast.avelsindex);
    if (ai != null) {
      f["Avelsindex ≥ 120"] = ai >= 120;
      f["Avelsindex < 100"] = ai < 100;
    }
    const ik = tal(hast.inavelskoefficient);
    if (ik != null) f["Inavel ≥ 10 %"] = ik >= 10;
  }
  return f;
}

/** A/E med ungefärligt 95 %-intervall (Poisson på antalet segrar). */
export function ae(rader) {
  const n = rader.length;
  const a = rader.reduce((s, r) => s + r.vann, 0);
  const e = rader.reduce((s, r) => s + r.p, 0);
  if (!n || e <= 0) return { n, segrar: a, vantade: e, ae: null, lag: null, hog: null };
  const sd = Math.sqrt(Math.max(a, 1));
  return { n, segrar: a, vantade: Math.round(e * 10) / 10, ae: a / e, lag: Math.max(0, (a - 1.96 * sd) / e), hog: (a + 1.96 * sd) / e };
}

/**
 * Kvot mellan A/E med och utan signalen, bland samma hästar. Hästarna är valda för att de startar i
 * V85/V86 nu, så deras gamla starter slår oddsen överlag – därför jämförs mot hästarnas övriga starter, inte mot 1.
 * Intervall på log-skala: se = sqrt(1/segrar med + 1/segrar utan).
 */
export function kvot(med, utan) {
  if (!med.ae || !utan.ae || !med.segrar || !utan.segrar) return { kvot: null, lag: null, hog: null };
  const k = med.ae / utan.ae;
  const se = Math.sqrt(1 / med.segrar + 1 / utan.segrar);
  return { kvot: k, lag: k * Math.exp(-1.96 * se), hog: k * Math.exp(1.96 * se) };
}

/** Bedömning: håller signalen åt samma håll i lär- och kontrollperioden, och är skillnaden säker? */
export function bedom(alla, lar, kontroll, n, minN = 30) {
  if (n < minN || lar.kvot == null || kontroll.kvot == null) return "för få starter";
  if (alla.lag > 1 && lar.kvot > 1 && kontroll.kvot > 1) return "vinner oftare än oddsen säger";
  if (alla.hog < 1 && lar.kvot < 1 && kontroll.kvot < 1) return "vinner mer sällan än oddsen säger";
  return "ingen säker skillnad";
}

/** fall: [{ datum, p, vann, f: { signal: bool } }] → en rad per signal, sorterad efter antal. */
export function sammanstall(fall, { kontrollFran = KONTROLL_FRAN, minN = 30 } = {}) {
  const namn = [...new Set(fall.flatMap((x) => Object.keys(x.f)))];
  const del = (rader, i) => (i === "lar" ? rader.filter((x) => x.datum < kontrollFran) : i === "kontroll" ? rader.filter((x) => x.datum >= kontrollFran) : rader);
  return namn
    .map((signal) => {
      const med = fall.filter((x) => x.f[signal] === true);
      const utan = fall.filter((x) => x.f[signal] === false);
      const rad = { signal };
      for (const i of ["alla", "lar", "kontroll"]) {
        const m = ae(del(med, i));
        const u = ae(del(utan, i));
        rad[i] = { ...m, utan_ae: u.ae, ...kvot(m, u) };
      }
      rad.bedomning = bedom(rad.alla, rad.lar, rad.kontroll, med.length, minN);
      return rad;
    })
    .sort((a, b) => b.alla.n - a.alla.n);
}
