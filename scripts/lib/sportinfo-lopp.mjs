// Tolkar Sportinfos tävlingsdagsresultat (sportapp.travsport.se/race/raceday/<ts-id>/results/all).
// Ingen nätåtkomst. Hämtningen sitter i scripts/fetch-sportinfo-lopp.mjs.
//
// Sidan för Åby 2026-09-26 (ts616672) lästes som text (innerText). Varje lopp börjar med
// "Lopp 5. Starttid 15:00:00" och slutar med "Visa målfoto". I blocket finns målordningen
// (placering, "nr NAMN", kusk, tränare, "spår/distans", tid), sedan Strukna, Startförbud,
// "Tempo: första 500 1.09,1 (1 Daim Brodda), 1000 1.10,5 (1 Daim Brodda) sista 500 1.10,3",
// Segermarginal, Banförhållande, Bestraffningar och fria texter från domarna, t.ex.
// "Nr 8 döms ej för dålig anslutning efter startbilen." Datan är upphovsrättsskyddad av
// Svensk Travsport: den sparas bara lokalt (gitignorerad) och publiceras aldrig.

export const SPORTINFO = "https://sportapp.travsport.se";

/** ts616672 ur en Sportinfo-url för en tävlingsdag eller ett lopp. */
export function racedayIdFrom(input) {
  const m = String(input || "").match(/raceday\/(ts\d+)/i);
  return m ? m[1].toLowerCase() : null;
}

/** "1.09,1" (eller "1.09.1", som många banor skriver) → 69.1 sekunder per km (samma skala som ATG:s km-tid). */
export function kmSek(s) {
  const m = String(s || "").match(/(\d+)\.(\d{2})[,.](\d)/);
  return m ? Number(m[1]) * 60 + Number(m[2]) + Number(m[3]) / 10 : null;
}

/** "Tempo: första 500 1.09,1 (1 Daim Brodda), 1000 1.10,5 (1 Daim Brodda) sista 500 1.10,3" → delar och ledare.
 *  Decimalen kan vara komma eller punkt ("1.17.0"). */
export function parseTempo(line) {
  const t = String(line || "").replace(/^Tempo:\s*/i, "");
  const delar = [];
  const re = /(första 500|\d{3,4})\s+(\d\.\d{2}[,.]\d)\s*\((\d+)\s+([^)]+)\)/gi;
  let m;
  while ((m = re.exec(t))) {
    delar.push({ meter: /första/i.test(m[1]) ? 500 : Number(m[1]), km_tid: m[2], km_sek: kmSek(m[2]), ledare_nr: Number(m[3]), ledare: m[4].trim() });
  }
  const sista = t.match(/sista 500\s+(\d\.\d{2}[,.]\d)/i);
  return { delar, sista500: sista ? sista[1] : null, sista500_sek: sista ? kmSek(sista[1]) : null };
}

/** "2140 m. Monté. Autostart. 12 startande." → distans, startmetod, monté, antal. */
export function parseVillkor(line) {
  const s = String(line || "");
  const dist = s.match(/(\d{3,4})\s*m\./);
  const antal = s.match(/(\d+)\s+startande/);
  return {
    distans: dist ? Number(dist[1]) : null,
    startmetod: /autostart/i.test(s) ? "auto" : /voltstart|tillägg/i.test(s) ? "volte" : null, // tillägg utan autostart = voltstart
    monte: /monté/i.test(s),
    startande: antal ? Number(antal[1]) : null,
  };
}

/** Domarnas fria texter som nämner ett startnummer: "Nr 8 döms ej …", "… häst nr 1 Optimum Relight …". */
export function numrerade(text) {
  const nr = new Set();
  for (const m of String(text || "").matchAll(/\bnr\.?\s*(\d{1,2})\b/gi)) nr.add(Number(m[1]));
  return [...nr];
}

const FALT = ["Strukna:", "Startförbud:", "Bestraffningar:", "Dopningsprov:", "Segrare:", "Ägare:", "Uppfödare:"];
const SLUT_FRI = /^(Tjänstgörande funktionärer:|Måldomare|Måldomarnämnd|Bandomare|Bandomarnämnd|Huvudstarter|Ekipagekontrollant|Stallbackskontrollant|Banveterinär|Dopningsprovtagare|Riksdomare|Startdomare|Tävlingsledare)/i;

/** Målordningen ur blockets rader: placering, "nr NAMN", kusk, tränare, "spår/distans", tid.
 *  Vid kuskbyte står den anmälda kusken före den som körde ("Örjan Kihlström", "Goop Björn").
 *  Sidan visar inte alltid hela fältet; hästarnas egna placeringar finns i hästfilerna. */
function malordning(rows) {
  const ut = [];
  for (let i = 4; i < rows.length; i++) {
    const sd = rows[i].match(/^(\d+)\/(\d{3,4})$/);
    if (!sd) continue;
    let j = -1;
    for (const k of [i - 3, i - 4]) {
      if (k >= 1 && /^\d+\s+\S/.test(rows[k]) && /^(\d+|d|u|str|k|p)$/i.test(rows[k - 1])) { j = k; break; }
    }
    if (j < 0) continue;
    const hast = rows[j].match(/^(\d+)\s+(.+)$/);
    ut.push({
      placering: rows[j - 1],
      startnummer: Number(hast[1]),
      hast: hast[2].trim(),
      anmald_kusk: i - j === 4 ? rows[j + 1] : null,
      kusk: rows[i - 2],
      tranare: rows[i - 1],
      spar: Number(sd[1]),
      distans: Number(sd[2]),
      tid: rows[i + 1] && !/^\d+$/.test(rows[i + 1]) && !/:$/.test(rows[i + 1]) ? rows[i + 1] : null,
    });
  }
  return ut;
}

/** Ett loppblock (raderna från "Lopp N." till "Visa målfoto") → loppets data. */
export function parseLopp(rows) {
  const head = rows[0].match(/^Lopp\s+(\d+)\.\s*Starttid\s+([\d:]+)/i);
  const villkorRad = rows.find((r) => /^\d{3,4}\s*m\./.test(r)) || null;
  const val = (key) => {
    const i = rows.findIndex((r) => r.startsWith(key));
    if (i < 0) return null;
    const inline = rows[i].slice(key.length).trim();
    if (inline) return inline;
    const lista = [];
    for (let j = i + 1; j < rows.length && !FALT.some((f) => rows[j].startsWith(f)) && !/^(Tempo:|Segermarginal:|Banförhållande:)/.test(rows[j]); j++) lista.push(rows[j]);
    const t = lista.filter((x) => x !== "-").join("\n").trim();
    return t || null;
  };
  const rad = (prefix) => rows.find((r) => r.startsWith(prefix))?.slice(prefix.length).trim() || null;
  const tempoRad = rows.find((r) => r.startsWith("Tempo:"));
  // Fria texter: efter "Segrande hästs skötare" fram till slutet, utan funktionärer, väder och tomrader
  const fria = [];
  let vader = null;
  const sk = rows.findIndex((r) => r.startsWith("Segrande hästs skötare"));
  for (let j = sk < 0 ? rows.length : sk + 1; j < rows.length; j++) {
    const r = rows[j];
    if (/^Visa målfoto/i.test(r)) break;
    if (/^Väder:/i.test(r)) { vader = r.replace(/^Väder:\s*/i, ""); continue; }
    if (!r || SLUT_FRI.test(r)) continue;
    fria.push(r);
  }
  const tempo = parseTempo(tempoRad);
  return {
    lopp: head ? Number(head[1]) : null,
    starttid: head ? head[2] : null,
    rubrik: rows[2] || null,
    villkor: villkorRad,
    ...parseVillkor(villkorRad),
    tempo_text: tempoRad ? tempoRad.replace(/^Tempo:\s*/, "") : null,
    tempo: tempo.delar,
    sista500: tempo.sista500,
    sista500_sek: tempo.sista500_sek,
    segermarginal: rad("Segermarginal:"),
    banforhallande: rad("Banförhållande:"),
    strukna: val("Strukna:"),
    startforbud: val("Startförbud:"),
    bestraffningar: val("Bestraffningar:"),
    domartexter: fria,
    namnda_nr: numrerade(fria.join("\n")),
    vader,
    malordning: malordning(rows),
  };
}

/** Hela sidans text → tävlingsdagen med alla lopp. */
export function parseRaceday(text, { id = null, hamtad = null } = {}) {
  // Ikoner (privata tecken, t.ex. före "Visa målfoto") tas bort
  const rows = String(text || "").normalize("NFC").split(/\r?\n/).map((r) => r.replace(/[-]/g, "").trim());
  const rubrik = rows.find((r) => /^[A-ZÅÄÖÉ .\-]+ (MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG) \d{1,2} [A-ZÅÄÖ]+ \d{4}$/.test(r)) || null;
  const starts = rows.map((r, i) => (/^Lopp\s+\d+\.\s*Starttid/i.test(r) ? i : -1)).filter((i) => i >= 0);
  const lopp = starts.map((s, k) => parseLopp(rows.slice(s, k + 1 < starts.length ? starts[k + 1] : rows.length)));
  return {
    kalla: id ? `${SPORTINFO}/race/raceday/${id}/results/all` : null,
    hamtad,
    raceday_id: id,
    rubrik,
    bana: rubrik ? rubrik.replace(/\s+(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG).*$/, "") : null,
    datum: datumUr(rubrik),
    lopp,
  };
}

const MANAD = { JANUARI: 1, FEBRUARI: 2, MARS: 3, APRIL: 4, MAJ: 5, JUNI: 6, JULI: 7, AUGUSTI: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DECEMBER: 12 };
function datumUr(rubrik) {
  const m = String(rubrik || "").match(/(\d{1,2}) ([A-ZÅÄÖ]+) (\d{4})$/);
  if (!m || !MANAD[m[2]]) return null;
  return `${m[3]}-${String(MANAD[m[2]]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Tävlingsdagar att hämta: de senaste `antal` starterna (före `fore`) för varje häst, nyast först. filer: Sportinfo-hästfiler. */
export function racedaysForHorses(filer, { antal = 5, fore = null } = {}) {
  const ut = new Map();
  for (const doc of filer) {
    const starter = (doc?.starter || [])
      .filter((s) => s.lopp_url && /\/results\//.test(s.lopp_url) && s.datum && (!fore || s.datum < fore))
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, antal);
    for (const s of starter) {
      const id = racedayIdFrom(s.lopp_url);
      if (id && (!ut.has(id) || ut.get(id) < s.datum)) ut.set(id, s.datum);
    }
  }
  return [...ut].sort((a, b) => b[1].localeCompare(a[1])).map(([id, datum]) => ({ id, datum }));
}
