// Tolkar resultatfliken på Sportinfo (sportapp.travsport.se) till samma struktur som sparas per häst.
// Ingen nätåtkomst. Hämtningen sitter i scripts/fetch-travsport-hast.mjs.
//
// Sidan som lästes för Zätamustangen (ts772022):
// Vanligt HTTP-anrop får 403 och "Verifying...". En webbläsare som laddar om en gång når fliken.
// Resultaten är ett rutnät (role=row / role=gridcell), inte en <table>. Skor och vagn är ikoner
// med title, till exempel "Barfota bak" och "Amerikansk sulky", och saknas i innerText.
// Strukna starter kan sakna de cellerna. aria-colindex håller kusk och tränare på rätt plats.
// Tid "12,0a" är km-tid 1.12,0 med autostart. "g" i tiden är galopp. Datum skrivs ÅÅMMDD-lopp.
// Banans kod (Ös, G, Ro) slås mot BANOR. Okänd kod lämnas som kod, utan gissat namn.

export const SPORTINFO = "https://sportapp.travsport.se";

/** Sportinfos bankoder. Bara koder där bokstaven har ett känt banamn. */
export const BANOR = {
  Ax: "Axevalla",
  B: "Bergsåker",
  Bo: "Boden",
  Bs: "Bollnäs",
  D: "Dannero",
  E: "Eskilstuna",
  F: "Färjestad",
  G: "Gävle",
  H: "Hagmyren",
  Hd: "Halmstad",
  Hg: "Hoting",
  J: "Jägersro",
  Ka: "Kalmar",
  L: "Lindesberg",
  Ly: "Lycksele",
  Mp: "Mantorp",
  Ro: "Romme",
  Rä: "Rättvik",
  S: "Solvalla",
  Sk: "Skellefteå",
  Sä: "Solänget",
  U: "Umåker",
  Vi: "Visby",
  Vg: "Vaggeryd",
  Å: "Åby",
  Åm: "Åmål",
  År: "Årjäng",
  Ö: "Örebro",
  Ös: "Östersund",
};

/** true när sidan fortfarande är robotkontrollen, inte hästens resultat. */
export function isRobotText(title, body) {
  const t = `${title || ""}\n${body || ""}`.toLowerCase();
  return t.includes("verifying") || t.includes("not a robot") || t.includes("inte en robot");
}

/** ts772022 ur ett id eller en Sportinfo-url. */
export function horseIdFrom(input) {
  const m = String(input || "").match(/ts\d+/i);
  return m ? m[0].toLowerCase() : null;
}

export function parseKr(s) {
  if (s == null || String(s).trim() === "") return null;
  const t = String(s).replace(/\s/g, "").replace(/kr$/i, "");
  if (!/^-?\d+$/.test(t)) return null;
  return Number(t);
}

export function parseIntSv(s) {
  if (s == null || String(s).trim() === "") return null;
  const n = Number(String(s).replace(/\s/g, "").replace("%", ""));
  return Number.isFinite(n) ? n : null;
}

/** "12,0a" → km-tid 1.12,0, autostart. Bara "a" är en kommande autostart utan tid. */
export function parseTid(s) {
  const raw = String(s || "").trim();
  if (!raw) return { km_tid: null, autostart: null, galopp: null };
  if (/^a$/i.test(raw)) return { km_tid: null, autostart: true, galopp: false };
  const m = raw.match(/^(\d+),(\d)([a-z]*)$/i);
  if (!m) return { km_tid: null, autostart: null, galopp: null };
  const flags = m[3].toLowerCase();
  return { km_tid: `1.${m[1]},${m[2]}`, autostart: flags.includes("a"), galopp: flags.includes("g") };
}

/** "261008-10" → 2026-10-08, lopp 10. */
export function parseDatum(s) {
  const m = String(s || "").trim().match(/^(\d{2})(\d{2})(\d{2})-(\d+)$/);
  if (!m) return { datum: null, lopp: null };
  return { datum: `20${m[1]}-${m[2]}-${m[3]}`, lopp: Number(m[4]) };
}

export function parseIdLine(s) {
  const m = String(s || "").replace(/\s+/g, "").match(/(\d{2}-\d+)UELN:(\S+)/i);
  return { registreringsnummer: m?.[1] ?? null, ueln: m?.[2] ?? null };
}

/**
 * Läser det som finns i dokumentet just nu. Anropas i webbläsaren (page.evaluate).
 * Rutnätet kan vara virtuellt, så anroparen får scrolla och slå ihop starterna.
 * Hjälparna ligger inuti funktionen så att de följer med till sidan.
 */
export function extractSportinfo() {
  const txt = (el) => (el?.innerText || "").replace(/\s+/g, " ").trim();
  const titleIn = (el) => el?.querySelector?.("[title]")?.getAttribute("title")?.trim() || "";
  const hrefIn = (el) => el?.querySelector?.("a")?.getAttribute("href") || "";
  const cellsByIndex = (row) => {
    const out = [];
    for (const c of row.querySelectorAll("[role=gridcell], [role=columnheader]")) {
      const n = Number(c.getAttribute("aria-colindex"));
      const idx = Number.isFinite(n) && n > 0 ? n - 1 : out.length;
      out[idx] = c;
    }
    return out;
  };
  const falt = {};
  let idLine = "";
  for (const h of document.querySelectorAll("h2")) {
    const label = txt(h);
    if (/UELN/i.test(label)) {
      idLine = label;
      continue;
    }
    const val = txt(h.nextElementSibling);
    if (label && val && !falt[label]) falt[label] = val;
  }
  const body = txt(document.querySelector("main") || document.body);
  const pick = (re) => body.match(re)?.[1]?.replace(/\s/g, "") || "";
  const rows = [...document.querySelectorAll("[role=row]")];
  let mode = "";
  const statRows = [];
  const starts = [];
  for (const row of rows) {
    const headers = [...row.querySelectorAll("[role=columnheader]")].map(txt);
    if (headers[0] === "År") {
      mode = "stats";
      continue;
    }
    if (headers[0] === "Bana") {
      mode = "starts";
      continue;
    }
    const c = cellsByIndex(row);
    if (!c.some(Boolean)) continue;
    if (mode === "stats") {
      statRows.push({
        ar: txt(c[0]),
        starter: txt(c[1]),
        placeringar: txt(c[2]),
        startprissumma: txt(c[3]),
        rekord: txt(c[4]),
      });
    } else if (mode === "starts") {
      starts.push({
        bana: txt(c[0]),
        datum: txt(c[1]),
        lopp: hrefIn(c[1]),
        kat: txt(c[2]),
        spar: txt(c[3]),
        dist: txt(c[4]),
        res: txt(c[5]),
        tid: txt(c[6]),
        skor: titleIn(c[7]),
        vagn: titleIn(c[8]),
        kusk: txt(c[9]),
        tranare: txt(c[10]),
        vinst: txt(c[11]),
      });
    }
  }
  return {
    namn: txt(document.querySelector("h1")),
    idLine,
    falt,
    segerprocent: pick(/Segerprocent:\s*([\d\s]+)\s*%/),
    platsprocent: pick(/Platsprocent:\s*([\d\s]+)\s*%/),
    startpoang: pick(/Startpoäng:\s*([\d\s]+)/),
    statRows,
    starts,
  };
}

/** Scrollar resultatrutnätet ett stycke. false när det inte går att komma längre. */
export function scrollStarts() {
  const txt = (el) => (el?.innerText || "").replace(/\s+/g, " ").trim();
  const grids = [...document.querySelectorAll("[role=grid]")];
  const grid = grids.find((g) => [...g.querySelectorAll("[role=columnheader]")].some((h) => txt(h) === "Bana"));
  const scroller = grid?.querySelector(".MuiDataGrid-virtualScroller") || grid;
  const el = scroller || document.scrollingElement || document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  const step = Math.max(280, Math.round((el.clientHeight || 700) * 0.65));
  const next = Math.min(max, el.scrollTop + step);
  if (next <= el.scrollTop + 1) return false;
  el.scrollTop = next;
  return true;
}

const empty = (s) => {
  const t = String(s || "").trim();
  return t || null;
};

function season(row) {
  const parts = String(row.placeringar || "").split("-");
  const n = (i) => (/^\d+$/.test(parts[i] || "") ? Number(parts[i]) : null);
  return {
    ar: row.ar,
    starter: parseIntSv(row.starter),
    placeringar: row.placeringar || null,
    vinster: n(0),
    andraplatser: n(1),
    tredjeplatser: n(2),
    startprissumma_kr: parseKr(row.startprissumma),
    rekord: empty(row.rekord),
  };
}

function startRow(s) {
  const { datum, lopp } = parseDatum(s.datum);
  const tid = parseTid(s.tid);
  const href = s.lopp || "";
  const spar = /^\d+$/.test(s.spar || "") ? Number(s.spar) : empty(s.spar);
  return {
    datum,
    lopp,
    datum_kod: empty(s.datum),
    bana_kod: empty(s.bana),
    bana: BANOR[s.bana] || null,
    kategori: empty(s.kat),
    spar,
    distans: empty(s.dist),
    resultat: empty(s.res),
    tid: empty(s.tid),
    km_tid: tid.km_tid,
    autostart: tid.autostart,
    galopp: tid.galopp,
    skor: empty(s.skor),
    vagn: empty(s.vagn),
    kusk: empty(s.kusk),
    tranare: empty(s.tranare),
    vinst_kr: parseKr(s.vinst),
    lopp_url: href ? (href.startsWith("http") ? href : SPORTINFO + href) : null,
  };
}

function splitTrainer(s) {
  const parts = String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
  return { tranare: parts[0] || null, tranare_licens: parts[1] || null, tranare_bana: parts[2] || null };
}

function splitAvel(s) {
  const parts = String(s || "").trim().split(/\s+/).filter(Boolean);
  return { avelsindex: parts[0] || null, avelsindex_sakerhet: parts[1] || null };
}

/** Rårader från extractSportinfo → filformatet. */
export function normalizeHorse(raw, { id, hamtad } = {}) {
  const ident = parseIdLine(raw?.idLine);
  const avel = splitAvel(raw?.falt?.Avelsindex);
  const tranare = splitTrainer(raw?.falt?.Tränare);
  const seen = new Set();
  const starter = [];
  for (const s of raw?.starts || []) {
    const row = startRow(s);
    const key = `${row.datum_kod}|${row.bana_kod}|${row.lopp}`;
    if (!row.datum_kod || seen.has(key)) continue;
    seen.add(key);
    starter.push(row);
  }
  return {
    kalla: `${SPORTINFO}/sportinfo/horse/${id}/results`,
    hamtad: hamtad || null,
    hast: {
      namn: empty(raw?.namn),
      id: id || null,
      registreringsnummer: ident.registreringsnummer,
      ueln: ident.ueln,
      farg: empty(raw?.falt?.Färg),
      kon: empty(raw?.falt?.Kön),
      fodd: empty(raw?.falt?.Född),
      ras: empty(raw?.falt?.Ras),
      avelsindex: avel.avelsindex,
      avelsindex_sakerhet: avel.avelsindex_sakerhet,
      inavelskoefficient: empty(raw?.falt?.["Inavelskoeff."]),
      agare: empty(raw?.falt?.Ägarpseudonym),
      uppfodare: empty(raw?.falt?.Uppfödare),
      ...tranare,
      segerprocent: parseIntSv(raw?.segerprocent),
      platsprocent: parseIntSv(raw?.platsprocent),
      startpoang: parseIntSv(raw?.startpoang),
    },
    sasong: (raw?.statRows || []).filter((r) => r.ar).map(season),
    starter,
  };
}
