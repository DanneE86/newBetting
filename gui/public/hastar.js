// Flik "Hästar": V75/V85/V86/V64/V65/GS75 + Dagens Dubbel från ATG (data från /api/hastar, se gui/hastar-routes.mjs).
// Modellen räknas i scripts/lib/trav-model.mjs när data hämtas; systembyggaren (hast-engine.js) körs här i webbläsaren.
import { rowPrice, TOP_SHARE, TOP_LEVELS, MIN_TOP, BIG_TARGET, RAD_TOP, RAD_TOP_MIN_BUDGET, RAD_TOP_SORT, SKRALL_MAX, SKRALL_MIN_BUDGET, ATG_FILE_TYPES, atgFileName, atgFileXml, atgGameUrl, buildBigSystem, buildSystem, compressRows, SPIKES, couponRows, couponText, defaultAlpha, reduceSystem } from "/hast-engine.js";

const view = document.getElementById("hastar-view");
const GAME_NAME = { dd: "Dagens Dubbel" };
const RANK_TEXT = { A: "A · stark vinstkandidat", B: "B · realistisk utmanare", C: "C · skräll/gardering", D: "D · låg vinstchans" };

let state = null; // { analysis, index, backtest, hasRaw }
let games = null; // { date, games }
let busy = null; // text medan något körs
let msg = null; // { kind: "error" | "ok", text }
let loaded = false;
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
let date = today();
const ALPHA = { traff: 0, lag: 0.25, normal: 0.5, hog: 1 };
// "standard" = spelformens bakkörda standard (defaultAlpha i hast-engine.js): V85 Normal, övriga Träff
const alphaFor = (type) => (sys.focus === "standard" ? defaultAlpha(type) : ALPHA[sys.focus]);
const sys = { budget: 500, mode: "stor", expand: 4, focus: "standard", minTop: MIN_TOP, ibWeight: 0, conds: { minA: "", maxA: "", minSkrall: "", maxSkrall: "", minStreck: "", maxStreck: "", minRowTop: "" } };
let lastRows = null;
let lastLegs = null; // utgångs-/raka systemets hästar per avdelning, för kupongmallen
// Egna val per omgång (id): { [avd]: [nr, ...] }. En häst = egen spik, flera = exakt de hästarna, inget = systemet väljer.
const own = {};
let ownOpen = false; // Bygg eget system öppen mellan omritningar
const ownBuilt = new Set(); // omgångar (id) där Skapa system tryckts
let ownLegs = null; // det skapade egna systemets hästar per avdelning, för ATG-filen
let ignoreToggleUntil = 0; // omritning får inte stänga panelen via toggle på det borttagna elementet
const openRaces = new Set(); // öppna avdelningar (id), så att de står kvar öppna när sidan ritas om
const FOCUS_TEXT = {
  standard: "Standard: V85 och V75 spelas med Hög, övriga spel med Träff. Bakkört V75 2021–2025 och V85 (444 omgångar): Hög gav mer tillbaka än Normal på 500–2000 kr, lika många alla rätt och fler skrällvinnare i systemet. Alla favoriter vinner nästan aldrig (0 av 74 V85-omgångar) – det vanliga är 2–4.",
  traff: "Träff: bara vinstchansen räknas – flest rätt. Bakkört 2026 (469 omgångar): alla rätt oftare än ett system efter strecket på varje budget.",
  lag: "Låg: nästan bara vinstchansen räknas – systemet tar mest favoriter.",
  normal: "Normal: chansen styr, men underspelade hästar går före överspelade när chansen är ungefär lika.",
  hog: "Hög: underspelade hästar prioriteras tydligt – färre träffar, men högre utdelning när det sitter.",
};
const isValueHorse = (h) => h.isValue ?? (h.value != null && h.value >= 1.15 && h.p >= 0.03);

/** Geometrisk blandning av modell-p och ibP (w=0→ren modell, w=1→ren Interbet), normaliserat per lopp. */
function blendLegs(legs, w) {
  if (!w) return legs;
  return legs.map((r) => {
    const raw = r.horses.map((h) => ({
      ...h,
      _b: h.scratched ? 0 : Math.pow(Math.max(h.p, 1e-6), 1 - w) * Math.pow(Math.max(h.ibP ?? h.p, 1e-6), w),
    }));
    const s = raw.reduce((a, h) => a + h._b, 0) || 1;
    return { ...r, horses: raw.map((h) => ({ ...h, p: h.scratched ? h.p : h._b / s, value: h.scratched ? h.value : (h._b / s) / Math.max(h.marketPct, 0.001) })) };
  });
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (p, d = 0) => (p == null ? "—" : `${(p * 100).toFixed(d).replace(".", ",")} %`);
const dec = (x, d = 2) => (x == null ? "—" : Number(x).toFixed(d).replace(".", ","));
const kr = (x) => `${Math.round(x).toLocaleString("sv-SE")} kr`;
const gameName = (t) => GAME_NAME[t] || t;
function startTime(iso) {
  if (!iso) return "tid saknas";
  const d = new Date(iso);
  return `${d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "numeric" })} ${d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}`;
}
const clock = (iso) => (iso ? new Date(iso).toLocaleString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

// ---------- Data ----------
async function api(path, method = "GET") {
  const res = await fetch(path, { method });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

async function load(id) {
  try {
    state = await api(`/api/hastar${id ? `?id=${encodeURIComponent(id)}` : ""}`);
    if (id && state.analysis?.date) {
      date = state.analysis.date;
      games = null;
    } else if (state.analysis?.date && !games) date = state.analysis.date;
  } catch (e) {
    msg = { kind: "error", text: `Kunde inte läsa sparad analys: ${e.message}` };
  }
  render();
  if (!games) loadGames(false);
}

/** Byt till den kommande omgångens analys om den redan är hämtad. */
async function alignAnalysis() {
  const id = games?.upcomingId || games?.games?.[0]?.id;
  if (!id || state?.analysis?.id === id) return;
  if (!state?.index?.analyses?.some((x) => x.id === id)) return;
  const st = await api(`/api/hastar?id=${encodeURIComponent(id)}`);
  if (st?.analysis?.id === id) state = st;
}

/** Första visningen: spellistan och datumet är den kommande omgången, inte den senaste sparade. */
async function boot() {
  render();
  try {
    state = await api("/api/hastar");
  } catch (e) {
    msg = { kind: "error", text: `Kunde inte läsa sparad analys: ${e.message}` };
  }
  try {
    const next = await api("/api/hastar/spel?kommande=1");
    if (next?.games?.length) {
      date = next.date;
      games = next;
      await alignAnalysis();
      render();
      return;
    }
  } catch { /* kalendern får vara nere – visa sparad omgång */ }
  if (state?.analysis?.date) date = state.analysis.date;
  await loadGames(true);
}

async function loadGames(snap) {
  try {
    const got = await api(`/api/hastar/spel?datum=${date}`);
    if (snap && !got.error && !(got.games || []).length) {
      const next = await api(`/api/hastar/spel?kommande=1&fran=${encodeURIComponent(date)}`);
      if (next?.games?.length) {
        date = next.date;
        games = next;
        await alignAnalysis();
        render();
        return;
      }
    }
    games = got;
    if (snap) await alignAnalysis();
  } catch {
    games = { date, games: [], error: true };
  }
  render();
}

async function action(kind, id) {
  const label = { fetch: "Hämtar data från ATG …", analyze: "Analyserar omgången …", resultat: "Hämtar resultat och räknar backtest …" }[kind];
  busy = label;
  msg = null;
  render();
  try {
    const q = id ? `?id=${encodeURIComponent(id)}` : kind === "fetch" ? `?datum=${date}` : "";
    state = await api(`/api/hastar/${kind}${q}`, "POST");
    msg = { kind: "ok", text: kind === "fetch" ? "Data hämtad och sparad. Analysen är klar." : kind === "analyze" ? "Omgången är analyserad om." : "Resultat och backtest uppdaterade." };
  } catch (e) {
    msg = { kind: "error", text: e.message };
  } finally {
    busy = null;
    render();
  }
}

// ---------- Delar ----------
function controls() {
  const a = state?.analysis;
  const list = games?.games || [];
  const vgames = list;
  const sel = a && list.some((g) => g.id === a.id) ? a.id : list[0]?.id;
  const opts = vgames.length
    ? vgames.map((g) => `<option value="${esc(g.id)}" ${g.id === sel ? "selected" : ""}>${esc(gameName(g.type))} – ${esc(g.track || "")}${g.status === "results" ? " (avgjord)" : ""}</option>`).join("")
    : `<option value="">${games ? (games.error ? "Kunde inte läsa ATG:s kalender" : games.saved ? "Ingen sparad omgång denna dag" : "Inga V-spel denna dag") : "Läser dagens spel …"}</option>`;
  const saved = (state?.index?.analyses || []).filter((x) => !x.backtestOnly).slice(0, 30);
  const pending = sel && a?.id && sel !== a.id;
  return `<div class="hs-controls" role="group" aria-label="Välj omgång">
    <label>Datum <input type="date" id="hs-date" class="ds-input" value="${esc(date)}" /></label>
    <label>Spel <select id="hs-game" class="ds-select">${opts}</select></label>
    <button type="button" class="ds-btn ds-btn--primary" data-act="fetch" ${busy || !sel ? "disabled" : ""}>Hämta data</button>
    <button type="button" class="ds-btn ds-btn--secondary" data-act="analyze" ${busy || !state?.hasRaw ? "disabled" : ""} title="Räknar om analysen på redan hämtad data">Analysera omgång</button>
    <button type="button" class="ds-btn ds-btn--secondary" data-act="resultat" ${busy ? "disabled" : ""} title="Hämtar resultat för sparade omgångar och uppdaterar backtesten">Uppdatera resultat</button>
    ${saved.length > 1 ? `<label>Sparade <select id="hs-saved" class="ds-select">${saved.map((x) => `<option value="${esc(x.id)}" ${x.id === a?.id ? "selected" : ""}>${esc(x.date)} ${esc(gameName(x.type))} ${esc(x.track || "")}</option>`).join("")}</select></label>` : ""}
  </div>
  ${pending ? `<p class="hs-msg">Den valda omgången är inte hämtad än. Tryck Hämta data för att bygga system på den.</p>` : ""}
  ${busy ? `<p class="hs-msg is-busy" role="status"><span class="hs-spin" aria-hidden="true"></span>${esc(busy)}</p>` : ""}
  ${msg ? `<p class="hs-msg is-${msg.kind}" role="${msg.kind === "error" ? "alert" : "status"}">${esc(msg.text)}</p>` : ""}`;
}

function kortSagt(a) {
  const live = a.races.flatMap((r) => r.horses.filter((h) => !h.scratched).map((h) => ({ ...h, leg: r.leg })));
  const safest = [...live].sort((x, y) => y.p - x.p)[0];
  const vulnerable = a.vulnerable?.length || 0;
  const w = a.races.map((r) => r.oddsWeight).filter((x) => x != null);
  const oddsW = w.length ? w.reduce((s, x) => s + x, 0) / w.length : null;
  const first = a.races[0]?.startTime;
  const isV = a.type !== "dd";
  const lines = [
    `${gameName(a.type)} på ${esc(a.track)}, första start ${esc(startTime(first))}. Data hämtad ${esc(clock(a.fetchedAt))}.`,
    safest ? `Säkraste hästen: <b>${esc(safest.horse)}</b> (avd ${safest.leg}) med ${pct(safest.p)} vinstchans enligt modellen, folket ${pct(safest.marketPct)}.` : "",
    a.spikes?.varde ? `Bästa värdet: <b>${esc(a.spikes.varde.horse)}</b> (avd ${a.spikes.varde.leg}) – ${pct(a.spikes.varde.p)} chans men bara ${pct(a.spikes.varde.marketPct)} spelat.` : "Ingen häst är tydligt underspelad bland de stora vinstkandidaterna.",
    isV ? `${vulnerable ? `${vulnerable} av ${a.races.length} favoriter ser sårbara ut.` : "Inga favoriter ser sårbara ut."}` : "",
    oddsW != null && oddsW < 0.3 && isV
      ? `Vinnarpotten är fortfarande liten, så modellen lutar sig mest på strecket. Hämta igen närmare start för skarpare värden.`
      : "",
  ].filter(Boolean);
  return `<details class="hs-kort hs-fold" aria-label="Kort sagt"><summary><h3>Kort sagt</h3></summary><p>${lines.join(" ")}</p></details>`;
}

const help = () => `<details class="hs-help"><summary>Så läser du det här</summary>
  <ul>
    <li><b>Chans</b> = modellens bedömning att hästen vinner. <b>Streck</b> = hur stor del av spelarna som har hästen (i Dagens Dubbel: vinnaroddsens procent).</li>
    <li><b>Värde</b> betyder att chansen är minst 15 % högre än strecket. Då betalar systemet mer än det borde när hästen vinner. <b>Ej värde</b> = folket har redan spelat hästen fullt ut eller mer.</li>
    <li><b>A–D</b>: A stark vinstkandidat (≥ 20 %), B realistisk utmanare (≥ 9 %), C skräll/gardering (≥ 3,5 %), D låg chans.</li>
    <li>Staplarna: <span class="hs-key is-p">modellens chans</span> mot <span class="hs-key is-m">folkets streck</span>. Längre mörk stapel än ljus = underspelad.</li>
    <li><b>Galopp</b>: de 10 senaste starterna, nyast till vänster och inringad. <b>G</b> (röd) = galopp, <b>D</b> = diskad, siffra = placering. Risk: låg under 15 %, medel 15–24 %, hög från 25 % (andelen galopp senaste 10, dragen mot 10 % när hästen har få starter). <b>Galopp senast</b> visas när hästen galopperade i senaste starten.</li>
    <li><b>Poäng 0–100</b> (100 bäst) = hästens vinstchans på en fast skala, samma i alla lopp. Prövat på 2024 (43 000 hästar modellen aldrig sett): 90+ vann ungefär varannan gång, 80–89 var tredje, 70–79 var sjätte, 50–59 var fjortonde, under 30 nästan aldrig.</li>
    <li><b>Delpoäng</b> jämför hästen med de andra i loppet (50 = loppets snitt, 70+ = klart bättre): ${Object.entries(PART_TEXT).map(([k, t]) => `${PART_SHORT[k]} ${t.toLowerCase()}`).join(", ")}. Hög formpoäng är inget fynd i sig – folket spelar redan formen. Utrustning (barfota, skor av) är oftare underspelad. <b>Trolig position</b> är en uppskattning – ATG:s öppna data har inga positioner från tidigare lopp.</li>
    <li>Modellen är prövad på ${state?.backtest?.races || "—"} avgjorda lopp: den är lika träffsäker som slutoddsen, inte bättre. Se Backtest längst ned.</li>
  </ul></details>`;

function highlight(title, h, extra = "") {
  if (!h) return `<details class="hs-card hs-fold is-empty"><summary><h4>${title}</h4></summary><p>Ingen häst uppfyller kraven i den här omgången.</p></details>`;
  return `<details class="hs-card hs-fold"><summary><h4>${title}</h4></summary>
    <p class="hs-card-horse"><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)}</p>
    <p class="hs-card-nums"><span>Chans <b>${pct(h.p)}</b></span><span>Streck <b>${pct(h.marketPct)}</b></span>${verdict(h)}</p>
    <p class="hs-card-why">${esc(Array.isArray(h.why) ? h.why.join(" · ") : h.why || "")}${extra}</p></details>`;
}

// Värde = chans minst 1,15 × strecket och chans minst 3 % (samma som isValue i trav-model.mjs)
function verdict(h) {
  if (h.value == null) return `<span class="hs-verdict is-none">Ej värde</span>`;
  const ok = h.isValue ?? (h.value >= 1.15 && h.p >= 0.03);
  const why = !ok && h.value >= 1.15 ? " (chans under 3 %)" : ` · ${dec(h.value)}`;
  return `<span class="hs-verdict ${ok ? "is-value" : "is-none"}" title="Chans delat med streck: ${dec(h.value)}">${ok ? "Värde" : "Ej värde"}${why}</span>`;
}

/** Hopfällbart listkort (stängt från start), rubriken visar antalet träffar. */
const foldCard = (title, sub, n, body, cls = "hs-card-wide") =>
  `<details class="hs-card hs-card-list ${cls} hs-fold"><summary><h4>${title} <span class="hs-fold-n">${n}</span>${sub ? ` <small>${sub}</small>` : ""}</h4></summary>${body}</details>`;

/** Hästar med kraftigt stigande streck – "sena pengar" indikerar att informerade spelare sett något. */
function poolTrendCard(a) {
  const hasTrend = a.races.some((r) => r.horses.some((h) => h.poolTrend != null));
  if (!hasTrend) return "";
  const cands = a.races
    .flatMap((r) => r.horses.filter((h) => !h.scratched && h.poolTrend != null && Math.abs(h.poolTrend) >= 0.01).map((h) => ({ ...h, leg: r.leg })))
    .sort((x, y) => Math.abs(y.poolTrend) - Math.abs(x.poolTrend))
    .slice(0, 8);
  return foldCard("Pool-trend", "ATG:s live-flöde i V-spelet – vart går pengarna just nu?", cands.length, cands.length
      ? `<ul>${cands.map((h) => {
          const t = h.poolTrend;
          const dir = t >= 0.02 ? "↑↑ in" : t >= 0.005 ? "↑ in" : t <= -0.02 ? "↓↓ ut" : "↓ ut";
          const cls = t >= 0 ? "is-drift-up" : "is-drift-dn";
          return `<li><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)} · <span class="hs-drift ${cls}"><b>${dir}</b> ${(Math.abs(t) * 100).toFixed(1)} %/enhet</span> · streck ${pct(h.marketPct)} · modell ${pct(h.p)}</li>`;
        }).join("")}</ul>`
      : "<p>Inga starka pool-rörelser just nu.</p>");
}

function senaPengarCard(a) {
  const hasDrift = a.races.some((r) => r.horses.some((h) => h.streckDrift != null));
  if (!hasDrift) return "";
  const cands = a.races
    .flatMap((r) => r.horses.filter((h) => !h.scratched && h.streckDrift != null && h.streckDrift >= 1.4 && (h.streckLast ?? h.marketPct) <= 0.35).map((h) => ({ ...h, leg: r.leg })))
    .sort((x, y) => y.streckDrift - x.streckDrift)
    .slice(0, 6);
  return foldCard("Sena pengar", "streck stigit ≥ 40 % sedan förmiddag – kan indikera informerade spelare", cands.length, cands.length
      ? `<ul>${cands.map((h) => {
          const rel = h.streckDrift >= 2 ? "↑↑" : h.streckDrift >= 1.5 ? "↑↑" : "↑";
          const pctChg = `+${Math.round((h.streckDrift - 1) * 100)} %`;
          return `<li><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)} · <b>${rel} ${pctChg}</b> (${pct(h.streckFirst)} → ${pct(h.streckLast ?? h.marketPct)}) · modell ${pct(h.p)} · ibP ${pct(h.ibP)}</li>`;
        }).join("")}</ul>`
      : "<p>Inga hästar med kraftigt stigande streck just nu.</p>");
}

/** Hästar som Interbet-modellen sätter minst 50 % högre chans på än marknaden (ibP/streck ≥ 1,5) och streck ≤ 12 %. */
function ibSkrallCard(a) {
  const hasIb = a.races.some((r) => r.horses.some((h) => h.ibP != null));
  if (!hasIb) return "";
  const cands = a.races
    .flatMap((r) => r.horses.filter((h) => !h.scratched && h.ibP != null && h.marketPct > 0 && h.marketPct <= 0.12 && h.ibP / h.marketPct >= 1.5).map((h) => ({ ...h, leg: r.leg, ibRatio: h.ibP / h.marketPct })))
    .sort((x, y) => y.ibRatio - x.ibRatio)
    .slice(0, 5);
  return foldCard("Interbet-skrällar", "streck ≤ 12 %, Interbet-chans ≥ 1,5 × strecket", cands.length, cands.length
      ? `<ul>${cands.map((h) => `<li><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)} · Interbet ${pct(h.ibP)} · modell ${pct(h.p)} · streck ${pct(h.marketPct)} · <b>${dec(h.ibRatio)}×</b> <small>ibScore ${h.ibScore ?? "—"}</small></li>`).join("")}</ul>`
      : "<p>Inga hästar med lågt streck som Interbet-modellen lyfter extra.</p>");
}

/** En rad i Vad folket missar: avdelning, häst, modellens chans mot strecket och kvoten. */
const fmRow = (h) =>
  `<li><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)} · modell <b>${pct(h.p)}</b> · folket ${pct(h.marketPct)} · <b>${dec(h.kvot)}×</b></li>`;

const oddsRow = (h) =>
  `<li><span class="hs-leg">Avd ${h.leg}</span> ${h.nr} ${esc(h.horse)} · vinnarodds <b>${pct(h.oddsP)}</b> · folket ${pct(h.marketPct)} · <b>${dec(h.oddsKvot)}×</b> · modell ${pct(h.p)}</li>`;

/** Vad folket missar (FOLKET_MISSAR i trav-model.mjs), bakkört ärligt 658 omgångar 2023–2026, plus alla fyra år. */
function folketMissarCard(a) {
  const fm = a.folketMissar;
  if (!fm) return "";
  const { missade = [], overspelade = [], odds = [] } = fm;
  return `<details class="hs-card hs-card-list hs-card-wide hs-folket hs-fold" aria-label="Vad folket missar">
    <summary><h4>Vad folket missar <span class="hs-fold-n">${missade.length + overspelade.length + odds.length}</span></h4></summary>
    <p class="hs-lead">Kort sagt: här tycker modellen något annat än folket. Bakkört på 658 omgångar 2023–2026 (modellen tränad bara på åren före):
      de underspelade vann <b>42 % oftare</b> än strecket sa, de överspelade favoriterna <b>19 % mer sällan</b>. Det höll alla fyra åren.</p>
    <div class="hs-folket-cols">
      <section><h5>Underspelade <small>streck 3–20 %, modellen ≥ 1,5 × strecket · ${missade.length} st</small></h5>
        ${missade.length ? `<ul>${missade.map(fmRow).join("")}</ul>` : "<p>Ingen häst i den här omgången.</p>"}</section>
      <section><h5>Överspelade favoriter <small>streck ≥ 20 %, modellen under 0,8 × strecket · ${overspelade.length} st</small></h5>
        ${overspelade.length ? `<ul>${overspelade.map(fmRow).join("")}</ul><p class="hs-note">De vinner ändå ungefär var fjärde gång – gardera hellre än spika.</p>` : "<p>Ingen favorit i den här omgången.</p>"}</section>
      <section class="hs-folket-odds"><h5>Vinnaroddsen tror mer <small>streck under 15 %, vinnaroddsen ger ≥ 1,6 × strecket · ${odds.length} st</small></h5>
        ${odds.length ? `<ul>${odds.map(oddsRow).join("")}</ul><p class="hs-note">Historiskt vann de 1,5 × oftare än strecket sa. Bara markering – kolla igen nära start, oddsen rör sig.</p>` : "<p>Ingen häst i den här omgången.</p>"}</section>
    </div></details>`;
}

function highlights(a) {
  const ups = a.upsets || [];
  const vul = a.vulnerable || [];
  return `<section class="hs-cards" aria-label="Spikar och skrällar">
    ${folketMissarCard(a)}
    ${highlight("Bästa spiken", a.spikes?.sakerhet)}
    ${highlight("Bästa värdespiken", a.spikes?.varde)}
    ${highlight("Chansspik", a.spikes?.chans)}
    ${foldCard("Sårbara favoriter", "", vul.length, vul.length
        ? `<ul>${vul.map((f) => `<li><span class="hs-leg">Avd ${f.leg}</span> ${f.nr} ${esc(f.horse)} <small>${esc(f.why.join(" · "))}</small></li>`).join("")}</ul>`
        : "<p>Inga favoriter ser sårbara ut.</p>", "")}
    ${foldCard("Skrällar", "streck ≤ 8 %, chans minst 1,4 × strecket och minst ett belagt skäl", ups.length, ups.length
        ? `<ul>${ups.map((u) => `<li><span class="hs-leg">Avd ${u.leg}</span> ${u.nr} ${esc(u.horse)} · chans ${pct(u.p)} mot streck ${pct(u.marketPct)} <small>${esc(u.why.join(" · "))}</small></li>`).join("")}</ul>`
        : "<p>Inga lågt streckade hästar har konkreta skäl som talar för dem.</p>")}
    ${ibSkrallCard(a)}
    ${senaPengarCard(a)}
    ${poolTrendCard(a)}
  </section>`;
}

// ---------- Systembyggare ----------
/** Rad om systemets högsta möjliga utdelning vid alla rätt (uppskattning ur strecken). */
const topLine = (s, a) => {
  if (s.topPayout == null) return "";
  const lvl = a.type && TOP_SHARE[a.type] ? `${Math.round(TOP_SHARE[a.type] * 100)} % av omsättningen` : "ca 25 % av omsättningen";
  return `<p class="hs-sys-sum hs-sys-top">Högsta rad vid alla rätt: <b>ca ${kr(s.topPayout)}</b>
    <small>(uppskattat: potten för alla rätt är ${lvl}, delat med hur många som har raden enligt strecket – jackpott tillkommer)</small></p>
    ${s.topOk === false ? `<p class="hs-msg is-error">Budgeten räcker inte för att högsta raden ska ge ${kr(sys.minTop)}. Höj budgeten eller sänk spärren.</p>` : ""}`;
};
/** Rad om skrällhästar i systemet. V75 2021–2025 + V85: var fjärde avdelning vinns av en häst under 10 % streck. */
const skrallLine = (s, legCount) =>
  s?.skrallLegs == null
    ? ""
    : `<p class="hs-sys-sum hs-sys-skrall">Skrällhästar (under ${SKRALL_MAX * 100} % streck) i <b>${s.skrallLegs} av ${legCount}</b> avdelningar
    <small>(historiskt vinns ungefär var fjärde avdelning av en sådan häst, oftast 2 per omgång – men de är många per lopp, så systemet tar bara dem modellen tror mest på)</small></p>`;
/** Egna val som motorns locked, strukna hästar bortplockade. */
function ownLocked(a) {
  const mine = own[a.id] || {};
  const out = {};
  for (const r of a.races) {
    const ok = new Set(r.horses.filter((h) => !h.scratched && h.p != null).map((h) => h.nr));
    const nrs = (mine[r.leg] || []).filter((nr) => ok.has(nr));
    if (nrs.length) out[r.leg] = nrs;
  }
  return out;
}

/** Budgetval: 500 kr eller egen summa. id skiljer panelerna åt, båda styr sys.budget. */
const budgetPicker = (id, label) => `<button type="button" class="ds-toggle" data-budget="500" aria-pressed="${sys.budget === 500}">500 kr</button>
      <label>${label} <input type="number" min="10" step="10" id="${id}" class="ds-input hs-budget-input" value="${sys.budget}" inputmode="numeric" /></label>`;

/** Bygg eget system: klicka i egna spikar/hästar per avdelning, resten väljer systemet. sysLegs = det byggda systemets hästar. */
function ownPanel(a, locked, sysLegs, cost, built, recLegs) {
  const n = Object.keys(locked).length;
  const spikar = Object.values(locked).filter((x) => x.length === 1).length;
  const auto = Object.fromEntries((sysLegs || []).map((l) => [l.leg, new Set(l.horses)]));
  // systemets förslag utan dina val – visas kvar i avdelningar där du valt själv
  const rec = Object.fromEntries((recLegs || sysLegs || []).map((l) => [l.leg, new Set(l.horses)]));
  const status = built && !built.error ? ["is-done", `Klart · ${built.rows.toLocaleString("sv-SE")} rader · ${kr(built.cost)}`]
    : n ? ["is-picked", `Du har valt i ${n} av ${a.races.length} avdelningar – tryck Skapa system`]
    : ["is-empty", "Inga egna val än"];
  return `<details class="hs-egna hs-fold"${ownOpen ? " open" : ""}>
    <summary class="hs-egna-head">
      <span class="hs-egna-title"><h4>Bygg eget system</h4>
        <span class="hs-egna-sub">Välj själv i de lopp du vill – systemet fyller resten inom din summa och ger dig en fil att lämna in på ATG.</span>
        <span class="hs-egna-status ${status[0]}" role="status">${status[1]}</span></span>
      <span class="hs-egna-cta" aria-hidden="true"><span class="when-closed">Öppna</span><span class="when-open">Stäng</span></span>
    </summary>
    <p class="hs-kort-inline"><b>Kort sagt:</b> välj hur mycket du vill spela, klicka sedan på hästar i de avdelningar du vill bestämma själv – resten fyller systemet i, inom summan.
      ${SPIKES === 1 ? "Systemet har alltid minst en spik – väljer du ingen lägger det till en" : `Systemet har alltid minst ${SPIKES} spikar – väljer du färre lägger det till de som fattas`}${spikar ? ` (du har ${spikar})` : ""}.</p>
    <ol class="hs-egna-steps">
      <li><b>Summa att spela</b><div class="hs-budget hs-egna-budget" role="group" aria-label="Summa att spela">${budgetPicker("hs-own-budget", "Egen summa (kr)")}</div></li>
      <li><b>Klicka i dina hästar</b> – en häst = din spik, flera i samma avdelning = exakt de hästarna. Klicka igen för att ta bort.</li>
      <li><b>Systemet fyller resten</b> – streckad ram = systemets förslag. Den står kvar även där du valt själv, så du ser vad modellen rekommenderar.</li>
    </ol>
    <div class="hs-egna-key" aria-hidden="true">
      <span><i class="hs-egna-swatch is-mine"></i>Ditt val</span>
      <span><i class="hs-egna-swatch is-auto"></i>Systemets förslag</span>
      <span><i class="hs-egna-swatch"></i>Inte med</span>
      <span>Siffran under numret = modellens chans · kant nedtill: <b class="k-a">grön</b> stark, <b class="k-b">blå</b> utmanare, <b class="k-c">gul</b> skräll</span>
    </div>
    <div class="hs-egna-legs">${a.races.map((r) => {
      const mine = locked[r.leg] || [];
      const sysSet = (mine.length ? rec[r.leg] : auto[r.leg]) || new Set();
      const recTxt = mine.length && sysSet.size ? `<small class="hs-egna-rec">Förslag: ${[...sysSet].sort((x, y) => x - y).join(", ")}</small>` : "";
      const hs = r.horses.filter((h) => !h.scratched && h.p != null).sort((x, y) => x.nr - y.nr);
      const state = mine.length === 1 ? "Din spik" : mine.length ? `Dina ${mine.length}` : sysSet.size === 1 ? "Auto · spik" : sysSet.size ? `Auto · ${sysSet.size} hästar` : "Auto";
      return `<div class="hs-egna-leg${mine.length ? " is-mine" : ""}" data-own-row="${r.leg}"><span class="hs-leg">Avd ${r.leg}</span>
        <span class="hs-egna-state">${state}${recTxt}</span>
        <div class="hs-egna-picks">${hs.map((h) => {
          const isMine = mine.includes(h.nr);
          const isAuto = sysSet.has(h.nr);
          return `<button type="button" class="hs-egna-pick rank-${h.rank}${isAuto ? " is-auto" : ""}" data-own-leg="${r.leg}" data-own-nr="${h.nr}" aria-pressed="${isMine}" title="${esc(`${h.nr} ${h.horse} · chans ${pct(h.p)} · streck ${pct(h.marketPct)}${isAuto ? (mine.length ? " · systemets förslag" : " · systemets val") : ""}`)}"><b>${h.nr}</b><small>${pct(h.p, 0)}</small></button>`;
        }).join("")}</div></div>`;
    }).join("")}</div>
    <div class="hs-egna-foot">
      ${cost ? `<p class="hs-egna-sum" role="status">Ditt system: <b>${cost.rows.toLocaleString("sv-SE")} rader · ${kr(cost.kr)}</b> av ${kr(sys.budget)}</p>` : ""}
      <span class="hs-egna-actions">
        ${n ? `<button type="button" class="ds-btn ds-btn--primary" data-act="own-build">${built ? "Skapa om systemet" : "Skapa system"}</button>` : `<small class="hs-lead">Välj minst en avdelning för att skapa systemet.</small>`}
        ${n ? `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="own-clear">Rensa egna val</button>` : ""}
      </span>
    </div>
    ${built ? ownResult(a, built) : ""}
  </details>`;
}

/** Det skapade egna systemet: alltid rakt (en kupong), med ATG-fil och länkar. */
function ownResult(a, b) {
  if (b.error) return `<div class="hs-egna-result"><p class="hs-msg is-error">${esc(b.error)}</p></div>`;
  const ft = ATG_FILE_TYPES[a.type];
  return `<div class="hs-egna-result" role="region" aria-label="Ditt system">
    <h4>Ditt system är klart</h4>
    <p class="hs-sys-sum"><b>${b.rows.toLocaleString("sv-SE")} rader · ${kr(b.cost)}</b> · ${b.kind} (rakt system, en kupong) · alla rätt: ${pct(b.hit, 2)} enligt modellen${b.topPayout != null ? ` · högsta rad ca ${kr(b.topPayout)}` : ""}</p>
    <pre class="hs-coupon hs-egna-coupon">${esc(couponText(b.legs))}</pre>
    ${ft ? `<ol class="hs-atg-steps">
      <li>Ladda ner ATG-filen (1 kupong, ${b.rows.toLocaleString("sv-SE")} rader).</li>
      <li>Öppna <a href="${FILE_PAGE}" target="_blank" rel="noopener">ATG filinlämning</a>, logga in och scrolla till <b>Filinlämning från externt verktyg</b>.</li>
      <li>Klicka <b>Välj fil</b> och välj filen.</li>
      <li>Kontrollera att ATG visar <b>${kr(b.cost)}</b> och 1 kupong – tryck sedan Spela.</li>
    </ol>` : `<p class="hs-lead">ATG tar inte emot fil för ${esc(gameName(a.type))} – fyll i raden för hand på omgången.</p>`}
    <div class="hs-atg-actions">
      ${ft ? `<button type="button" class="ds-btn ds-btn--primary ds-btn--sm" data-act="own-atg-file">Ladda ner ATG-fil (.xml)</button>
      <a class="ds-btn ds-btn--secondary ds-btn--sm" href="${FILE_PAGE}" target="_blank" rel="noopener">Öppna ATG filinlämning</a>` : ""}
      <a class="ds-btn ds-btn--secondary ds-btn--sm" href="${esc(atgGameUrl(a.id))}" target="_blank" rel="noopener">Öppna omgången på ATG</a>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="own-copy">Kopiera kupongen</button>
    </div>
  </div>`;
}

function systemBuilder(a) {
  if (a.type === "dd" || !a.races.length) return "";
  const price = rowPrice(a.type, a.date);
  const hasIb = a.races.some((r) => r.horses.some((h) => h.ibP != null));
  const ibW = hasIb ? sys.ibWeight / 100 : 0;
  const legs = blendLegs(a.races.map((r) => ({ leg: r.leg, number: r.number, horses: r.horses })), ibW);
  const topShare = TOP_SHARE[a.type] ?? 0.25;
  const byLeg = Object.fromEntries(a.races.map((r) => [r.leg, Object.fromEntries(r.horses.map((h) => [h.nr, h]))]));
  const locked = ownLocked(a);
  let body;
  let cost = null; // { rows, kr } för Bygg eget system
  // Skapat eget system: alltid rakt – Träffsystem om det är valt, annars storvinstsystemet (även när reducerat är valt)
  let built = null;
  ownLegs = null;
  // förslaget utan egna val, så det kan visas kvar i avdelningar du valt själv
  let recLegs = null;
  if (Object.keys(locked).length) {
    try {
      recLegs = (sys.mode === "rakt"
        ? buildSystem(legs, { budget: sys.budget, price, alpha: alphaFor(a.type), minTop: sys.minTop, topShare })
        : buildBigSystem(legs, { budget: sys.budget, price, minTop: sys.minTop, topShare, target: Math.max(BIG_TARGET, sys.minTop) })).legs;
    } catch { recLegs = null; }
  }
  if (ownBuilt.has(a.id) && Object.keys(locked).length) {
    try {
      const s = sys.mode === "rakt"
        ? buildSystem(legs, { budget: sys.budget, price, alpha: alphaFor(a.type), minTop: sys.minTop, topShare, locked })
        : buildBigSystem(legs, { budget: sys.budget, price, minTop: sys.minTop, topShare, target: Math.max(BIG_TARGET, sys.minTop), locked });
      built = { ...s, kind: sys.mode === "rakt" ? "Träffsystem" : s.big === false ? "Träffsystem (budgeten räcker inte för storvinst)" : "Storvinstsystem" };
      ownLegs = s.legs;
    } catch (e) {
      built = { error: e.message };
    }
  }
  lastRows = null;
  lastLegs = null;
  try {
    if (sys.mode === "stor") {
      const s = buildBigSystem(legs, { budget: sys.budget, price, minTop: sys.minTop, topShare, target: Math.max(BIG_TARGET, sys.minTop), locked });
      lastLegs = s.legs;
      cost = { rows: s.rows, kr: s.cost };
      body = systemTable(s.legs, byLeg, locked) + `<p class="hs-sys-sum"><b>${s.rows.toLocaleString("sv-SE")} rader · ${kr(s.cost)}</b> ·
        alla rätt: ${pct(s.hit, 2)} enligt modellen, ${pct(s.marketHit, 2)} enligt strecket${s.big ? ` ·
        <span title="Hur stor del av målet systemet väntas ge vid alla rätt, enligt modellen och strecket. Rader under målet räknas med sin andel, rader över målet som 1.">mål ${kr(s.target)}: <b>${pct(s.bigShare, 2)}</b></span>` : ""}</p>`
        + (s.big ? "" : `<p class="hs-msg">Budgeten räcker inte för ett storvinstsystem som klarar högsta rad-spärren – det här är träffsystemet.</p>`) + topLine(s, a) + skrallLine(s, legs.length);
    } else if (sys.mode === "rakt") {
      const s = buildSystem(legs, { budget: sys.budget, price, alpha: alphaFor(a.type), minTop: sys.minTop, topShare, locked });
      lastLegs = s.legs;
      cost = { rows: s.rows, kr: s.cost };
      body = systemTable(s.legs, byLeg, locked) + `<p class="hs-sys-sum"><b>${s.rows.toLocaleString("sv-SE")} rader · ${kr(s.cost)}</b> ·
        alla rätt: ${pct(s.hit, 2)} enligt modellen, ${pct(s.marketHit, 2)} enligt strecket ·
        <span title="Modellens träffchans delat med folkets. Över 1 = systemet träffar oftare än folket tror, alltså högre utdelning när det sitter.">värdeindex <b>${dec(s.valueIndex)}</b></span></p>` + topLine(s, a) + skrallLine(s, legs.length);
    } else {
      const r = reduceSystem(legs, sys.conds, { budget: sys.budget, price, expand: sys.expand, alpha: alphaFor(a.type), minTop: sys.minTop, topShare, sortBy: isRadTop() ? RAD_TOP_SORT : "w", locked });
      lastRows = r.rows;
      lastLegs = r.base.legs;
      cost = { rows: r.count, kr: r.cost };
      body = systemTable(r.base.legs, byLeg, locked) + `<p class="hs-sys-sum">Utgångssystem ${r.total.toLocaleString("sv-SE")} rader (${kr(r.total * price)}) ·
        ${r.passed.toLocaleString("sv-SE")} klarar villkoren · <b>${r.count.toLocaleString("sv-SE")} rader spelas · ${kr(r.cost)}</b> ·
        alla rätt: ${pct(r.hit, 2)} enligt modellen</p>
        ${r.count ? "" : `<p class="hs-msg is-error">Inga rader klarar villkoren – lätta på dem.</p>`}` + topLine(r, a) + skrallLine(r.base, legs.length);
    }
    const lockedRows = Object.values(locked).reduce((x, l) => x * l.length, 1);
    if (lockedRows * price > sys.budget) body = `<p class="hs-msg is-error hs-egna-over" role="status">Dina egna val ger ${lockedRows.toLocaleString("sv-SE")} rader (${kr(lockedRows * price)}) redan innan systemet fyller i resten – mer än budgeten. Ta bort hästar eller höj budgeten.</p>` + body;
    body += atgBlock(a);
  } catch (e) {
    body = `<p class="hs-msg is-error">${esc(e.message)}</p>`;
  }
  const c = sys.conds;
  const num = (k, label, title) => `<label title="${esc(title)}">${label} <input type="number" min="0" class="ds-input" data-cond="${k}" value="${esc(c[k])}" /></label>`;
  return `<section class="hs-system" aria-label="Systembyggare">
    <h3>Systembyggare <small>${esc(gameName(a.type))} · ${dec(price)} kr/rad</small></h3>
    ${ownPanel(a, locked, lastLegs, cost, built, recLegs)}
    <div class="hs-value-explain">
      <p><b>Vad betyder värde?</b> En häst har <b>värde</b> när den vinner oftare än folket tror – modellens chans är minst 15 % högre än strecket.
      Exempel: chans 20 %, streck 10 %. Vinner hästen delar du potten med färre, så utdelningen blir högre än risken motiverar.
      En favorit med streck 60 % och chans 40 % är <b>överstreckad</b>: den vinner ofta, men betalar dåligt.</p>
      <p>Systemet väger ihop chansen och värdet. Hur mycket värdet får väga styr du med <b>Värdefokus</b>.</p>
    </div>
    <div class="hs-budget" role="group" aria-label="Budget">
      ${budgetPicker("hs-budget", "Egen summa (kr)")}
    </div>
    <div class="hs-mode" role="group" aria-label="Systemtyp">
      <button type="button" class="ds-toggle" data-mode="stor" aria-pressed="${sys.mode === "stor"}" title="Standard: rakt system byggt för att kunna vinna de stora utdelningarna (mål ${kr(BIG_TARGET)} vid alla rätt)">Storvinstsystem</button>
      <button type="button" class="ds-toggle" data-mode="rakt" aria-pressed="${sys.mode === "rakt"}" title="Rakt system byggt för att träffa ofta (förvalet till 2026-10-11)">Träffsystem</button>
      <button type="button" class="ds-toggle" data-mode="reducerat" aria-pressed="${sys.mode === "reducerat" && !isSkrall3() && !isRadTop()}">Reducerat system</button>
      <button type="button" class="ds-toggle" data-mode="skrall3" aria-pressed="${isSkrall3()}" title="Reducerat system, utgång 16 × budget, minst 3 hästar under 10 % streck på varje rad. Bakkört 2023–2026: +56 % på 1 000 kr men det bygger på ett fåtal storvinster – spela 1 000 kr eller mer, under 500 kr blir det för få rader">Skrällsystem</button>
      <button type="button" class="ds-toggle" data-mode="rad50k" aria-pressed="${isRadTop()}" title="Reducerat system, utgång 16 × budget, varje rad ska kunna ge minst ${kr(RAD_TOP)} vid alla rätt. Bakkört 365 omgångar V85/V75 2022–2026: 2 000 kr +129 %, 8 vinster över 50 000 kr, plus även utan de 3 största (+39 %), men 2024 −81 %. Spela ${kr(RAD_TOP_MIN_BUDGET)} eller mer">50 000-system</button>
      ${sys.mode === "stor" ? "" : `<label title="Hur mycket spelvärdet väger mot ren vinstchans när hästar väljs">Värdefokus <select class="ds-select" id="hs-focus">${[["standard", "Standard"], ["traff", "Träff"], ["lag", "Låg"], ["normal", "Normal"], ["hog", "Hög"]].map(([k, t]) => `<option value="${k}" ${sys.focus === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>`}
      ${hasIb ? `<label title="Blanda in Interbet-modellens 9-faktorsanalys i sannolikheterna. 0 % = bara din modell, 100 % = bara Interbet.">Interbet-vikt <select class="ds-select" id="hs-ibweight">${[0,25,50,75,100].map((v) => `<option value="${v}" ${sys.ibWeight === v ? "selected" : ""}>${v} %${v === 0 ? " (din modell)" : v === 100 ? " (Interbet)" : ""}</option>`).join("")}</select></label>` : ""}
    </div>
    <div class="hs-mode" role="group" aria-label="Högsta rad">
      <label title="Systemets mest ospelade rad ska kunna ge minst så här mycket vid alla rätt. 50 000 kr gäller alltid.">Högsta rad minst <select class="ds-select" id="hs-top">${TOP_LEVELS.map((x) => `<option value="${x}" ${sys.minTop === x ? "selected" : ""}>${x.toLocaleString("sv-SE")} kr${x === MIN_TOP ? " (alltid)" : ""}</option>`).join("")}</select></label>
    </div>
    ${isSkrall3() && sys.budget < SKRALL_MIN_BUDGET ? `<p class="hs-msg is-error hs-skrall-budget" role="status">Skrällsystemet under ${kr(SKRALL_MIN_BUDGET)} har gått minus alla bakkörda år (200 kr: −28 %, −50 %, −81 % 2024–2026). Spela ${kr(SKRALL_MIN_BUDGET)} eller mer.</p>` : ""}
    ${isRadTop() && sys.budget < RAD_TOP_MIN_BUDGET ? `<p class="hs-msg is-error hs-radtop-budget" role="status">50 000-systemet under ${kr(RAD_TOP_MIN_BUDGET)} gick minus i bakkörningen utan de 3 största vinsterna (500 kr −54 %, 1 000 kr −44 %). Spela ${kr(RAD_TOP_MIN_BUDGET)} eller mer.</p>` : ""}
    ${isRadTop() ? `<p class="hs-kort-inline hs-radtop-text"><b>Kort sagt:</b> varje rad betalar minst ${kr(RAD_TOP)} om den sitter, men systemet träffar sällan – på 2 000 kr 8 gånger på 365 omgångar (ungefär var 45:e omgång). Räkna med många omgångar med små eller inga vinster.</p>` : ""}
    ${sys.mode === "stor" ? `<p class="hs-kort-inline hs-stor-text"><b>Kort sagt:</b> systemet väljer hästar så att raderna kan ge stora vinster (mål ${kr(BIG_TARGET)} vid alla rätt), inte så att det träffar ofta.
      Bakkört 488 omgångar 2024–2026 på 1 000 kr: +27 % mot träffsystemets −3 % och dubbelt så många vinster över 50 000 kr (2 mot 1),
      men vinst i bara ungefär varannan omgång och −47 % om de tre största vinsterna räknas bort. Räkna med många omgångar utan vinst.</p>` : `<p class="hs-lead hs-focus-text">${FOCUS_TEXT[sys.focus]}</p>`}
    ${
      sys.mode === "reducerat"
        ? `<div class="hs-conds">
        <label title="Utgångssystemet får kosta så här många gånger budgeten innan villkoren skär ned det">Utgång <select class="ds-select" id="hs-expand">${[2, 4, 8, 16].map((x) => `<option value="${x}" ${sys.expand === x ? "selected" : ""}>${x} × budget</option>`).join("")}</select></label>
        ${num("minA", "Min A", "Minst så många A-hästar per rad")}${num("maxA", "Max A", "Högst så många A-hästar per rad")}
        ${num("minSkrall", "Min skrällar", `Minst så många hästar med streck under ${SKRALL_MAX * 100} % per rad`)}${num("maxSkrall", "Max skrällar", `Högst så många hästar med streck under ${SKRALL_MAX * 100} % per rad`)}
        ${num("minStreck", "Min streck-summa %", "Summan av strecken på raden, minst")}${num("maxStreck", "Max streck-summa %", "Summan av strecken på raden, högst")}
        ${num("minRowTop", "Min kr per rad", "Varje rad ska kunna ge minst så många kr vid alla rätt (uppskattat från strecken)")}
      </div>
      <p class="hs-lead">Rader som klarar villkoren sorteras efter värdeviktad sannolikhet, de bästa behålls tills budgeten är slut.</p>`
        : ""
    }
    ${body}
  </section>`;
}

// ATG: hästar kan inte förifyllas via länk (kuponger sparas på kontot). I stället en fil enligt ATG:s
// filinlämningsschema – rakt system = en kupong, reducerat = raderna ihopslagna till så få kuponger som möjligt.
// Filen laddas upp på atg.se/spel/reducerat → "Välj fil"; ATG visar belopp och antal kuponger innan man spelar.
const FILE_PAGE = "https://www.atg.se/spel/reducerat";
function atgCoupons() {
  if (sys.mode === "reducerat") return lastRows?.length ? compressRows(lastRows) : null;
  return lastLegs ? [lastLegs.map((l) => [...l.horses].sort((x, y) => x - y))] : null;
}
function atgBlock(a) {
  if (!lastLegs) return "";
  const ft = ATG_FILE_TYPES[a.type];
  const coupons = atgCoupons();
  const price = rowPrice(a.type, a.date);
  const tooMany = ft && coupons && coupons.length > ft.max;
  const file = ft && coupons
    ? tooMany
      ? `<p class="hs-msg is-error">${coupons.length.toLocaleString("sv-SE")} kuponger – ATG tar högst ${ft.max.toLocaleString("sv-SE")} per fil för ${esc(a.type)}. Sänk budgeten eller skärp villkoren.</p>`
      : `<button type="button" class="ds-btn ds-btn--primary ds-btn--sm" data-act="atg-file">Ladda ner ATG-fil (.xml)</button>`
    : "";
  const rows = coupons ? couponRows(coupons) : 0;
  return `<div class="hs-atg">
    <h4>Spela på ATG</h4>
    ${ft && coupons && !tooMany ? `<ol class="hs-atg-steps">
      <li>Ladda ner ATG-filen (${coupons.length.toLocaleString("sv-SE")} ${coupons.length === 1 ? "kupong" : "kuponger"}, ${rows.toLocaleString("sv-SE")} rader).</li>
      <li>Öppna <a href="${FILE_PAGE}" target="_blank" rel="noopener">ATG Reducerat</a>, logga in och scrolla till <b>Filinlämning från externt verktyg</b>.</li>
      <li>Klicka <b>Välj fil</b> och välj filen.</li>
      <li>Kontrollera att ATG visar <b>${kr(rows * price)}</b> och ${coupons.length.toLocaleString("sv-SE")} ${coupons.length === 1 ? "kupong" : "kuponger"} – tryck sedan Spela.</li>
    </ol>` : ""}
    <div class="hs-atg-actions">
      ${file}
      <a class="ds-btn ds-btn--secondary ds-btn--sm" href="${esc(atgGameUrl(a.id))}" target="_blank" rel="noopener">Öppna omgången på ATG</a>
      <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="copy-coupon">Kopiera kupongen</button>
    </div>
    <details class="hs-atg-manual"><summary>Fylla i för hand i stället</summary>
      <pre class="hs-coupon">${esc(couponText(lastLegs))}</pre>
      <p class="hs-lead">${sys.mode === "reducerat"
        ? "Det här är utgångssystemet – för hand blir det ett rakt system och dyrare. Det reducerade systemet går bara att lämna in med filen."
        : "Öppna omgången och klicka i numren avdelning för avdelning. Radantal och pris hos ATG ska stämma med systemet här."}</p>
    </details>
  </div>`;
}

/** Är skrällsystemets förval inställt (reducerat, utgång 16 ×, minst 3 skrällar)? */
const isSkrall3 = () => sys.mode === "reducerat" && sys.expand === 16 && String(sys.conds.minSkrall) === "3" && !sys.conds.minRowTop;
/** Är 50 000-systemets förval inställt (reducerat, utgång 16 ×, varje rad minst RAD_TOP kr)? */
const isRadTop = () => sys.mode === "reducerat" && sys.expand === 16 && String(sys.conds.minRowTop) === String(RAD_TOP) && !sys.conds.minSkrall;

function systemTable(legs, byLeg, locked = {}) {
  return `<div class="hs-sys-legs">${legs
    .map((l) => {
      const hs = l.horses.map((nr) => byLeg[l.leg][nr]);
      return `<div class="hs-sys-leg${hs.length === 1 ? " is-spik" : ""}${locked[l.leg] ? " is-own" : ""}" id="hs-rad-${l.leg}">
        <div class="hs-sys-leg-head"><a class="hs-leg hs-leg-link" href="#hs-avd-${l.leg}" title="Visa avdelning ${l.leg}">Avd ${l.leg} ›</a>${hs.length === 1 ? `<span class="hs-spik">${locked[l.leg] ? "Din spik" : "Spik"}</span>` : `<span class="hs-sys-count">${hs.length} hästar</span>`}${locked[l.leg] && hs.length > 1 ? `<span class="hs-own-tag">dina val</span>` : ""}</div>
        <div class="hs-sys-picks">${hs.map((h) => {
          const v = isValueHorse(h);
          const streck = h.marketPct != null ? `<span class="hs-pick-streck">${pct(h.marketPct)}</span>` : "";
          return `<span class="hs-pick rank-${h.rank}${v ? " is-value" : ""}" title="${esc(`${h.horse} · rank ${h.rank} · chans ${pct(h.p)} · streck ${pct(h.marketPct)}${v ? " · värde" : ""}`)}"><span class="hs-pick-nr">${h.nr}</span><span class="hs-pick-name">${esc(h.horse)}</span>${streck}${v ? `<span class="hs-pick-value">värde</span>` : ""}</span>`;
        }).join("")}</div></div>`;
    })
    .join("")}</div>
    <p class="hs-sys-key"><span class="hs-key"><span class="hs-key-dot rank-A"></span>stark vinstkandidat</span>
      <span class="hs-key"><span class="hs-key-dot rank-B"></span>utmanare</span>
      <span class="hs-key"><span class="hs-key-dot rank-C"></span>skräll/gardering</span>
      <span class="hs-key"><span class="hs-pick-streck">40 %</span>andel av folket som streckat hästen</span>
      <span class="hs-key"><span class="hs-pick-value">värde</span>vinner oftare än strecket säger</span></p>`;
}

// ---------- Lopp ----------
function bars(h) {
  const max = 0.8;
  const w = (x) => `${Math.min(100, ((x || 0) / max) * 100).toFixed(1)}%`;
  return `<span class="hs-bars" aria-hidden="true"><span class="is-p" style="width:${w(h.p)}"></span><span class="is-m" style="width:${w(h.marketPct)}"></span></span>`;
}

// Hästpoäng (scripts/lib/trav-model.mjs horseScore): chansen på log-skala, 0,5 % = 0 och 60 % = 100
const PART_TEXT = { form: "Form", fart: "Fart", klass: "Klass", spar: "Spår", kusk: "Kusk", tranare: "Tränare", utrustning: "Utrustning", tempo: "Tempo", marknad: "Streck" };
const PART_SHORT = { form: "Fo", fart: "Fa", klass: "Kl", spar: "Sp", kusk: "Ku", tranare: "Tr", utrustning: "Ut", tempo: "Te", marknad: "St" };
const scoreOf = (h) => h.poang?.total ?? (h.p == null ? null : Math.round(Math.max(0, Math.min(100, (100 * Math.log(Math.max(h.p, 1e-9) / 0.005)) / Math.log(0.6 / 0.005)))));
const scoreLevel = (x) => (x >= 80 ? "is-top" : x >= 60 ? "is-good" : x >= 40 ? "is-mid" : "is-low");
function scoreCell(h) {
  const t = scoreOf(h);
  if (t == null) return "—";
  return `<span class="hs-score ${scoreLevel(t)}" title="Hästpoäng ${t} av 100 (chans ${pct(h.p, 1)})"><b>${t}</b><span class="hs-score-bar" aria-hidden="true"><span style="width:${t}%"></span></span></span>`;
}
function partsCell(h) {
  const pg = h.poang;
  if (!pg) return "—";
  return `<span class="hs-parts">${Object.keys(PART_TEXT)
    .filter((k) => pg[k] != null)
    .map((k) => `<span class="hs-part${pg[k] >= 70 ? " is-hi" : pg[k] <= 30 ? " is-lo" : ""}" title="${PART_TEXT[k]} ${pg[k]} (50 = loppets snitt)">${PART_SHORT[k]} <b>${pg[k]}</b></span>`)
    .join("")}</span>`;
}

// Galopp de 10 senaste starterna (nyast till vänster). Risknivå ur gallopRisk (andel galopp senaste 10, krympt mot 10 %).
const galoppList = (h) =>
  h.galopp10 ??
  (h.last5 || []).filter((x) => !x.scratched).map((x) => ({ date: x.date, track: x.track, dist: x.distance, method: x.startMethod, place: x.place, g: !!x.galloped, d: !!x.disqualified }));
const galoppLevel = (risk) => (risk == null ? null : risk >= 0.25 ? "hog" : risk >= 0.15 ? "medel" : "lag");
const GALOPP_LEVEL_TEXT = { hog: "Hög risk", medel: "Medelrisk", lag: "Låg risk" };
function galoppCell(h) {
  const list = galoppList(h);
  if (!list.length) return `<span class="hs-gal is-none">Inga starter</span>`;
  const n = list.filter((x) => x.g).length;
  const lvl = galoppLevel(h.gallopRisk) ?? (n / list.length >= 0.25 ? "hog" : n / list.length >= 0.15 ? "medel" : "lag");
  const last = list[0];
  const res = (x) => (x.g ? "galopp" : x.d ? "diskad" : x.place ? `${x.place}:a` : "oplacerad");
  const boxes = list
    .map((x, i) => {
      const cls = x.g ? "is-g" : x.d ? "is-d" : x.place >= 1 && x.place <= 3 ? "is-top" : "";
      const tip = `${i === 0 ? "Senaste starten: " : ""}${x.date || ""} ${x.track || ""}${x.dist ? ` ${x.dist} m` : ""}${x.method ? ` ${x.method === "volte" ? "volte" : "auto"}` : ""} – ${res(x)}`;
      return `<span class="hs-gal-box ${cls}${i === 0 ? " is-latest" : ""}" title="${esc(tip)}">${x.g ? "G" : x.d ? "D" : x.place || "–"}</span>`;
    })
    .join("");
  return `<span class="hs-gal is-${lvl}">
    <span class="hs-gal-head"><b>${n} av ${list.length}</b> galopp · <span class="hs-gal-lvl">${GALOPP_LEVEL_TEXT[lvl]}</span></span>
    <span class="hs-gal-row" aria-label="Senaste ${list.length} starterna, nyast först"><small>senast</small>${boxes}</span>
    ${last.g ? `<span class="hs-gal-flag">Galopp senast (${esc(last.date || "")})</span>` : ""}
  </span>`;
}

function driftCell(h) {
  if (h.streckDrift != null) {
    const chg = Math.round((h.streckDrift - 1) * 100);
    const arrow = h.streckDrift >= 2 ? "↑↑" : h.streckDrift >= 1.3 ? "↑" : h.streckDrift <= 0.5 ? "↓↓" : h.streckDrift <= 0.8 ? "↓" : "→";
    const cls = h.streckDrift >= 1.3 ? "is-drift-up" : h.streckDrift <= 0.8 ? "is-drift-dn" : "is-drift-flat";
    const title = `Förmiddag ${pct(h.streckFirst)} → nu ${pct(h.streckLast ?? h.marketPct)}`;
    return `<span class="hs-drift ${cls}" title="${esc(title)}">${arrow} ${chg > 0 ? "+" : ""}${chg} %</span>`;
  }
  if (h.poolTrend != null) {
    const t = h.poolTrend;
    const arrow = t >= 0.02 ? "↑↑" : t >= 0.005 ? "↑" : t <= -0.02 ? "↓↓" : t <= -0.005 ? "↓" : "→";
    const cls = t >= 0.005 ? "is-drift-up" : t <= -0.005 ? "is-drift-dn" : "is-drift-flat";
    return `<span class="hs-drift ${cls}" title="ATG pooltrend (live): ${t > 0 ? "+" : ""}${(t * 100).toFixed(1)} %/min">${arrow}</span>`;
  }
  return "—";
}

/** Systemets hästar i avdelningen, för sammanfattningen i den hopfällda avdelningen. */
function racePicks(leg) {
  const l = lastLegs?.find((x) => x.leg === leg);
  if (!l) return "";
  const nrs = [...l.horses].sort((x, y) => x - y);
  return `<span class="hs-race-picks">${nrs.length === 1 ? `<span class="hs-spik">Spik</span> ${nrs[0]}` : `Din rad: <b>${nrs.join(", ")}</b>`}</span>`;
}

/** Knappar under avdelningen (mobil): tillbaka till raden i systemet och vidare till nästa avdelning. */
const raceNav = (leg, next) =>
  `<nav class="hs-race-nav" aria-label="Avdelning ${leg}">
    <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="to-row" data-leg="${leg}">↑ Till raden</button>
    ${next != null ? `<button type="button" class="ds-btn ds-btn--primary ds-btn--sm" data-act="next-avd" data-leg="${leg}" data-next="${next}">Nästa: avd ${next} ↓</button>` : `<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="close-avd" data-leg="${leg}">Stäng</button>`}
  </nav>`;

function race(r, a, nav = null) {
  const live = r.horses.filter((h) => !h.scratched);
  const fav = r.favorite;
  const favCls = fav ? { "STARK FAVORIT": "is-strong", "NORMAL FAVORIT": "is-normal", "SÅRBAR FAVORIT": "is-weak" }[fav.status] : "";
  const srcLabel = live[0]?.marketSource === "odds" ? "Odds %" : "Streck";
  const id = `hs-avd-${r.leg}`;
  return `<details class="hs-race hs-fold" id="${id}"${openRaces.has(id) ? " open" : ""}>
    <summary class="hs-race-head">
      <h4>${a.type === "dd" ? `DD-lopp ${r.leg}` : `Avd ${r.leg}`} <small>lopp ${r.number} · ${r.distance} m ${r.startMethod === "auto" ? "autostart" : "voltstart"} · start ${esc(startTime(r.startTime))}</small></h4>${nav ? racePicks(r.leg) : ""}
    </summary>
      ${fav ? `<p class="hs-fav ${favCls}"><b>${esc(fav.status.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}:</b> ${fav.nr} ${esc(fav.horse)} – ${esc(fav.why.join(" · "))}</p>` : ""}
    <div class="hs-table-wrap"><table class="hs-table">
      <thead><tr><th scope="col">Rank</th><th scope="col">Nr</th><th scope="col">Häst / kusk</th><th scope="col" title="De 10 senaste starterna, nyast till vänster. G = galopp, D = diskad, siffra = placering">Galopp</th><th scope="col">Chans mot ${srcLabel.toLowerCase()}</th><th scope="col">Chans</th><th scope="col">${srcLabel}</th><th scope="col">Spelvärde</th>
        <th scope="col" title="0–100, 100 = bäst. Vinstchansen på fast skala, samma i alla lopp">Poäng</th><th scope="col" title="0–100 jämfört med loppet, 50 = snitt">Delpoäng</th>${live.some((h) => h.streckDrift != null || h.poolTrend != null) ? `<th scope="col" title="Strecket nu / strecket förmiddag (↑↑ = fördubblat) eller ATG:s pool-rörelseriktning live">Drift / trend</th>` : ""}<th scope="col">Trolig position</th><th scope="col">Kommentar</th></tr></thead>
      <tbody>${r.horses
        .map((h) =>
          h.scratched
            ? `<tr class="is-scratched"><td>—</td><td>${h.nr}</td><td colspan="10">${esc(h.horse)} · struken</td></tr>`
            : `<tr>
          <td><span class="hs-rank rank-${h.rank}" title="${esc(RANK_TEXT[h.rank])}">${h.rank}</span></td>
          <td>${h.nr}<small class="hs-post">spår ${h.post}</small></td>
          <td class="hs-name"><b>${esc(h.horse)}</b><small>${esc(h.driver || "")}${h.trainer ? ` · tr ${esc(h.trainer)}` : ""}${h.horseHome && h.horseHome !== a.track ? ` · borta fr ${esc(h.horseHome)}` : ""}</small></td>
          <td>${galoppCell(h)}</td>
          <td>${bars(h)}</td>
          <td class="num"><b>${pct(h.p)}</b></td>
          <td class="num">${pct(h.marketPct)}</td>
          <td>${verdict(h)}</td>
          <td>${scoreCell(h)}</td><td>${partsCell(h)}</td>
          ${live.some((x) => x.streckDrift != null || x.poolTrend != null) ? `<td>${driftCell(h)}</td>` : ""}
          <td>${esc(h.position || "—")}</td>
          <td class="hs-comment">${esc((h.comments || []).join(" · "))}${h.last5?.length ? `<small>Senaste: ${h.last5.map((x) => (x.galloped ? "g" : x.place ?? "–")).join(" ")}</small>` : ""}</td>
        </tr>`,
        )
        .join("")}</tbody>
    </table></div>
    ${tempoBlock(r.tempo)}
    ${nav ? raceNav(r.leg, nav.next) : ""}
  </details>`;
}

const tempoBlock = (t) =>
  t?.scenarios?.length
    ? `<details class="hs-tempo"><summary>Loppets tempo: ${esc(t.leader || "—")} trolig ledare${t.hardPace ? " · risk för hårt öppningstempo" : ""}</summary>
    <ul>${t.scenarios.map((s) => `<li><b>${esc(s.name)}:</b> ${esc(s.text)}${s.gynnas?.length ? ` <small>Gynnas: ${esc(s.gynnas.join(", "))}</small>` : ""}</li>`).join("")}</ul>
    <p class="hs-note">${esc(t.note)}</p></details>`
    : "";

// ---------- Dagens Dubbel ----------
function ddBlock(a) {
  const dd = a.dd;
  if (!dd) return "";
  const row = (c) => `<tr><td><b>${esc(c.combo)}</b><small>${esc(c.h1)} – ${esc(c.h2)}</small></td><td class="num">${pct(c.p, 1)}</td><td class="num">${dec(c.odds)}</td><td class="num">${dec(c.fair)}</td>
    <td class="num">${c.ev == null ? "—" : `${c.ev > 0 ? "+" : ""}${pct(c.ev)}`}</td><td>${c.ev != null && c.ev > 0.1 ? `<span class="hs-verdict is-value">Värde</span>` : `<span class="hs-verdict is-none">Ej värde</span>`}</td></tr>`;
  const table = (list) => `<div class="hs-table-wrap"><table class="hs-table hs-dd-table"><thead><tr><th scope="col">Kombination</th><th scope="col">Sannolikhet</th><th scope="col">Aktuellt odds</th><th scope="col">Fair odds</th><th scope="col">Beräknat EV</th><th scope="col">Värde</th></tr></thead>
    <tbody>${list.map(row).join("")}</tbody></table></div>`;
  return `<section class="hs-dd" aria-label="Dagens Dubbel">
    <h3>Dagens Dubbel <small>lopp ${dd.races.join(" + ")}</small></h3>
    <p class="hs-lead">Sannolikhet = modellens chans i lopp 1 × chans i lopp 2. Fair odds = 1 / sannolikhet. EV = sannolikhet × odds − 1 (per spelad krona). Värde = EV över +10 %.
    ${dd.hasOdds ? "" : "<b>Inga DD-odds ännu</b> – visar bara sannolikheter."}</p>
    <div class="hs-dd-grid"><div><h4>Bäst EV</h4>${dd.byEv.length ? table(dd.byEv.slice(0, 12)) : "<p>Inga odds att jämföra mot.</p>"}</div>
    <div><h4>Mest sannolika</h4>${table(dd.byP.slice(0, 12))}</div></div>
    ${dd.extraRaces?.length ? dd.extraRaces.map((r) => race({ ...r, leg: `DD ${r.number}` }, { type: "dd" })).join("") : ""}
  </section>`;
}

// ---------- Uppföljning (scripts/hastar-auto.mjs) ----------
const FOLLOW_NAMES = { storvinst: "Storvinst (förval)", standard: "Träffsystem", utdelning: "Utdelning", skrall3: "Skrällsystem (≥ 3 skrällar/rad)", rad50k: "50 000-system" };
function followBlock(u) {
  const games = u?.games || 0;
  const head = `<h3>Uppföljning på riktigt <small>${games} omgångar${u?.from ? ` sedan ${esc(u.from)}` : ""}</small></h3>`;
  if (!games)
    return `<section class="hs-bt hs-follow" aria-label="Uppföljning">${head}<p class="hs-lead">Inga rättade omgångar än. Datorn hämtar dagens V-spel automatiskt kl. 10 och 2 h, 45 min och 15 min före start, och rättar efteråt.</p></section>`;
  const budgets = [...new Set(Object.values(u.summary).flatMap((x) => Object.keys(x)))].sort((a, b) => a - b);
  const row = (name, b) => {
    const t = u.summary[name]?.[b];
    if (!t) return "";
    return `<tr><td>${esc(FOLLOW_NAMES[name] || name)}</td><td class="num">${b} kr</td><td class="num">${t.games}</td><td class="num">${kr(t.cost)}</td><td class="num">${kr(t.win)}</td>
      <td class="num ${t.roi > 0 ? "is-plus" : ""}">${t.roi == null ? "—" : `${t.roi > 0 ? "+" : ""}${pct(t.roi)}`}</td><td class="num">${t.hitGames}</td><td class="num">${t.allRight}</td><td class="num">${t.biggest ? kr(t.biggest.win) : "—"}</td></tr>`;
  };
  const best = Object.keys(FOLLOW_NAMES).map((n) => [n, u.summary[n]?.[500]]).filter(([, t]) => t).sort((x, y) => (y[1].roi ?? -9) - (x[1].roi ?? -9))[0];
  return `<section class="hs-bt hs-follow" aria-label="Uppföljning">${head}
    <p class="hs-kort-inline"><b>Kort sagt:</b> systemen byggs automatiskt på strecket från sista hämtningen före start och rättas mot ATG:s utdelning – alltså som om du hade spelat dem. ${best ? `Bäst hittills på 500 kr: <b>${esc(FOLLOW_NAMES[best[0]])}</b> (${best[1].roi > 0 ? "+" : ""}${pct(best[1].roi)}).` : ""} ${games < 20 ? "För få omgångar för att dra slutsatser – en enda storvinst avgör." : ""}</p>
    <div class="hs-table-wrap"><table class="hs-table hs-bt-table"><thead><tr><th scope="col">System</th><th scope="col">Budget</th><th scope="col">Omg</th><th scope="col">Insats</th><th scope="col">Vinst</th><th scope="col">ROI</th><th scope="col">Omg m vinst</th><th scope="col">Alla rätt</th><th scope="col">Största</th></tr></thead>
    <tbody>${budgets.flatMap((b) => Object.keys(FOLLOW_NAMES).map((n) => row(n, b))).join("")}</tbody></table></div>
  </section>`;
}

// ---------- Backtest ----------
function backtestBlock(bt) {
  if (!bt?.races) return `<section class="hs-bt"><h3>Backtest</h3><p>Ingen backtest ännu. Tryck <b>Uppdatera resultat</b> när en sparad omgång är avgjord.</p></section>`;
  const diff = bt.logLoss - bt.marketLogLoss;
  const cal = bt.calibration.filter((c) => c.n >= 5);
  const max = Math.max(...cal.map((c) => Math.max(c.avgP, c.winRate)), 0.01);
  const grp = (o, last) =>
    Object.entries(o || {})
      .map(([k, g]) => `<tr><td>${esc(k)}</td><td class="num">${g.n}</td><td class="num">${pct(g.hitRate)}</td>${last === "" ? "" : `<td class="num">${g.avgP != null ? pct(g.avgP) : g.roi != null ? `${g.roi > 0 ? "+" : ""}${pct(g.roi)}` : "—"}</td>`}</tr>`)
      .join("");
  const t = (title, o, last = "Snittchans") => `<table class="hs-table hs-bt-table"><caption>${title}</caption><thead><tr><th scope="col"></th><th scope="col">Antal</th><th scope="col">Vann</th>${last === "" ? "" : `<th scope="col">${last}</th>`}</tr></thead><tbody>${grp(o, last)}</tbody></table>`;
  const spikeNames = { sakerhet: "Säkerhetsspik", varde: "Värdespik", chans: "Chansspik" };
  return `<section class="hs-bt" aria-label="Backtest">
    <h3>Backtest <small>${bt.games} omgångar · ${bt.races} lopp · uppdaterad ${esc(clock(bt.updatedAt))}</small></h3>
    <p class="hs-kort-inline"><b>Kort sagt:</b> modellens etta vann ${pct(bt.topHitRate)} av loppen, folkets favorit ${pct(bt.favHitRate)}.
      Träffsäkerhet (logloss, lägre är bättre): modellen ${dec(bt.logLoss, 3)} mot vinnaroddsen ${dec(bt.marketLogLoss, 3)} –
      ${Math.abs(diff) < 0.01 ? "modellen ligger i nivå med marknaden, inte bättre." : diff < 0 ? "modellen är bättre än marknaden." : "modellen är sämre än marknaden."}
      Spelvärde mot strecket är det som ger högre utdelning i V-spelen, inte fler träffar.</p>
    <div class="hs-cal" role="img" aria-label="Kalibrering: förväntad mot faktisk vinstandel">
      ${cal.map((c) => `<div class="hs-cal-col"><div class="hs-cal-bars"><span class="is-p" style="height:${((c.avgP / max) * 100).toFixed(1)}%"></span><span class="is-w" style="height:${((c.winRate / max) * 100).toFixed(1)}%"></span></div>
        <small>${Math.round(c.from * 100)}–${Math.round(c.to * 100)} %</small><small>n ${c.n}</small></div>`).join("")}
    </div>
    <p class="hs-note"><span class="hs-key is-p">modellens chans</span> <span class="hs-key is-w">faktisk vinstandel</span> per chansband. Lika höga staplar = rätt kalibrerat.</p>
    <div class="hs-bt-grid">
      ${t("A/B/C/D-ranking", bt.rank)}
      ${t("Spikar", Object.fromEntries(Object.entries(bt.spikes || {}).map(([k, v]) => [spikeNames[k] || k, v])), "")}
      <table class="hs-table hs-bt-table"><caption>Skrällar och DD</caption><thead><tr><th scope="col"></th><th scope="col">Antal</th><th scope="col">Vann</th><th scope="col">ROI</th></tr></thead><tbody>
        <tr><td>Skrällar</td><td class="num">${bt.upsets.n}</td><td class="num">${pct(bt.upsets.hitRate)}</td><td class="num">—</td></tr>
        <tr><td>DD, 3 bästa EV</td><td class="num">${bt.dd.n}</td><td class="num">${bt.dd.n ? pct(bt.dd.hits / bt.dd.n) : "—"}</td><td class="num">${bt.dd.roi == null ? "—" : pct(bt.dd.roi)}</td></tr>
        <tr><td>Värdehästar som vinnarspel</td><td class="num">${bt.valueBets.n}</td><td class="num">${pct(bt.valueBets.hitRate)}</td><td class="num">${bt.valueBets.roi == null ? "—" : pct(bt.valueBets.roi)}</td></tr>
      </tbody></table>
      ${t("Värdehästar per startmetod", bt.byStartMethod, "ROI")}
      ${t("Värdehästar per distans", bt.byDistance, "ROI")}
      ${t("Värdehästar per bana", bt.byTrack, "ROI")}
    </div>
  </section>`;
}

// Klartext för den inlärda modellens faktorer (scripts/lib/trav-features.mjs)
const FACTOR_TEXT = {
  form: "form senaste 5", fart: "km-tid", kusk: "kuskens segerprocent i år", tranare: "tränarens segerprocent i år", klass: "intjänat per start",
  spar: "startspårets segerindex", galopp: "galopprisk", tillagg: "tillägg", vila: "dagar sedan senaste start", vilaLang: "vila över 60 dagar",
  barfota: "barfota runt", skorAv: "skor av sedan senast", skorPa: "skor på sedan senast", jankare: "amerikansk vagn", vagnByte: "vagnbyte",
  kuskByte: "kuskbyte", oddsHist: "låga odds i tidigare starter", seger5: "segrar senaste 5", plats5: "pallplatser senaste 5", livSeger: "segerprocent i livet",
  alder: "ålder", sto: "sto", rekord: "rekordtid", bastKm3: "bästa km-tid senaste 3", banvana: "starter på banan", starter60: "starter senaste 60 dagarna",
  kuskForm: "kuskens form senaste året", senast: "placering senast", distByte: "längre distans än senast", metodByte: "byte av startmetod",
  kmSenast: "km-tid senast", motstand: "prisnivå i tidigare lopp", pengar: "intjänat totalt", sparNr: "spårnummer",
  mktKvadrat: "favorit/långskott-justering", langRekord: "rekord på lång distans (2600 m+)", langRekordNy: "långrekord satt i år eller förra året",
};
const methodBlock = (a) => {
  const m = a.method || {};
  if (m.learned) {
    const top = Object.entries(m.weights || {}).filter(([, w]) => Math.abs(w) >= 0.02).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]));
    const ev = m.eval?.rolling;
    return `<details class="hs-help hs-method"><summary>Så räknar modellen</summary>
  <ol>
    <li><b>Marknaden:</b> vinnaroddsen görs om till sannolikheter och blandas med V-spelets streck. Vinnaroddsen väger mer ju större vinnarpotten är (just nu ${pct(
      a.races.reduce((s, r) => s + (r.oddsWeight || 0), 0) / Math.max(1, a.races.length),
    )} odds).</li>
    <li><b>Inlärd justering:</b> vikterna är skattade på ${(m.races || 0).toLocaleString("sv-SE")} lopp (${esc(m.period?.from || "")} – ${esc(m.period?.to || "")}). Modellen har lärt sig var folket och oddsen har fel.
      Talar <b>för</b> hästen: ${esc(top.filter(([, w]) => w > 0).slice(0, 6).map(([k]) => FACTOR_TEXT[k] || k).join(", ") || "—")}.
      Talar <b>emot</b>: ${esc(top.filter(([, w]) => w < 0).slice(0, 6).map(([k]) => FACTOR_TEXT[k] || k).join(", ") || "—")}.</li>
    <li><b>Chans</b> = marknaden^${dec(m.marketExp ?? 1)} × exp(vikter × faktorer), normerat till 100 % per lopp. Varje faktor jämförs mot de andra hästarna i loppet.</li>
    ${ev ? `<li><b>Testat ärligt:</b> varje månad tränad bara på lopp före månaden (${(ev.inlard?.races || 0).toLocaleString("sv-SE")} testlopp). Modellens etta vann ${pct(ev.inlard?.hitRate, 1)} mot marknadens ${pct(ev.marknad?.hitRate, 1)} och gamla modellens ${pct(ev.gammal?.hitRate, 1)}.</li>` : ""}
    <li><b>Spelvärde</b> = chans / streck. <b>Värde</b> när kvoten är minst ${dec(m.valueMin ?? 1.15)} och chansen minst 3 %.</li>
    <li>Allt som hämtas sparas i <code>data/hastar/raw/${esc(a.id)}.json</code>, analysen i <code>data/hastar/analys/</code>. Vikterna räknas om med <code>node scripts/hastar-lar.mjs</code>.</li>
  </ol></details>`;
  }
  return `<details class="hs-help hs-method"><summary>Så räknar modellen</summary>
  <ol>
    <li><b>Marknaden:</b> vinnaroddsen görs om till sannolikheter och blandas med V-spelets streck. Vinnaroddsen väger mer ju större vinnarpotten är (just nu ${pct(
      a.races.reduce((s, r) => s + (r.oddsWeight || 0), 0) / Math.max(1, a.races.length),
    )} odds).</li>
    <li><b>Fundamenta</b> från hästens senaste starter: form (placeringar senaste 5), fart (km-tid), kusk- och tränarprocent i år, klass (intjänat per start), startspår (vinstandel per spår i all hämtad historik), galopprisk och tillägg. Varje faktor jämförs mot de andra hästarna i loppet.</li>
    <li><b>Chans</b> = marknaden^${a.method?.marketExp ?? 0.85} × exp(vikter × faktorer), sedan normerat till 100 % per lopp. Exponenten plattar ut marknaden lite: favoriter vinner i praktiken något mer sällan än oddsen säger.</li>
    <li><b>Vikter:</b> ${esc(Object.entries(a.method?.weights || {}).map(([k, w]) => `${k} ${w}`).join(", "))}. De är små eftersom backtesten visade att ingen enskild faktor slår slutoddsen. Ändras bara efter ny backtest, aldrig efter en enskild omgång.</li>
    <li><b>Spelvärde</b> = chans / streck. <b>Värde</b> när kvoten är minst ${dec(a.method?.valueMin ?? 1.15)} och chansen minst 3 %.</li>
    <li>Allt som hämtas sparas i <code>data/hastar/raw/${esc(a.id)}.json</code>, analysen i <code>data/hastar/analys/</code>.</li>
  </ol></details>`;
};

// ---------- Rendering ----------
function render() {
  if (view.hidden) return;
  const y = window.scrollY;
  ignoreToggleUntil = Date.now() + 80;
  const a = state?.analysis;
  const head = `<header class="hs-head"><h2>Hästar${a ? ` <small>${esc(gameName(a.type))} · ${esc(a.track)} · ${esc(a.date)}</small>` : ""}</h2>${controls()}</header>`;
  if (!a) {
    view.innerHTML = `${head}<details class="hs-kort hs-fold"><summary><h3>Kort sagt</h3></summary><p>${
      state ? "Ingen omgång är hämtad än. Välj datum och spel och tryck <b>Hämta data</b>." : "Läser sparad analys …"
    }</p></details>${help()}`;
  } else {
    view.innerHTML = `${head}${kortSagt(a)}${help()}${a.type === "dd" ? "" : highlights(a)}${systemBuilder(a)}
    <nav class="hs-jump" aria-label="Avdelningar">${a.races.map((r) => `<a href="#hs-avd-${r.leg}">Avd ${r.leg}</a>`).join("")}${a.dd ? `<a href="#hs-dd">DD</a>` : ""}</nav>
    <section class="hs-races">${a.races.map((r, i) => race(r, a, { next: a.races[i + 1]?.leg ?? null })).join("")}</section>
    <div id="hs-dd">${ddBlock(a)}</div>${followBlock(state.uppfoljning)}${backtestBlock(state.backtest)}${methodBlock(a)}`;
  }
  const keep = () => window.scrollTo(0, y);
  keep();
  requestAnimationFrame(keep);
}

// ---------- Händelser ----------
view.addEventListener("click", (ev) => {
  const t = ev.target.closest("button, a");
  if (!t) return;
  if (t.matches(".hs-jump a, .hs-leg-link")) {
    ev.preventDefault();
    const el = view.querySelector(t.getAttribute("href"));
    if (el?.matches("details")) el.open = true;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (t.dataset.act === "to-row") {
    const row = view.querySelector(`#hs-rad-${t.dataset.leg}`) || view.querySelector(".hs-system");
    row?.scrollIntoView({ behavior: "smooth", block: "center" });
    row?.classList.remove("is-flash");
    void row?.offsetWidth; // starta om markeringen
    row?.classList.add("is-flash");
    return;
  }
  if (t.dataset.act === "next-avd" || t.dataset.act === "close-avd") {
    const cur = view.querySelector(`#hs-avd-${t.dataset.leg}`);
    if (cur) cur.open = false;
    const next = t.dataset.next != null ? view.querySelector(`#hs-avd-${t.dataset.next}`) : cur;
    if (next && t.dataset.act === "next-avd") next.open = true;
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (t.dataset.act === "fetch") return action("fetch", view.querySelector("#hs-game")?.value || null);
  if (t.dataset.act === "analyze") return action("analyze", state?.analysis?.id);
  if (t.dataset.act === "resultat") return action("resultat");
  if (t.dataset.act === "own-build" && state?.analysis) {
    ownBuilt.add(state.analysis.id);
    ownOpen = true;
    render();
    view.querySelector(".hs-egna-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  if (t.dataset.act === "own-copy" && ownLegs) {
    const done = () => { t.textContent = "Kopierat!"; setTimeout(() => (t.textContent = "Kopiera kupongen"), 1500); };
    navigator.clipboard?.writeText(couponText(ownLegs)).then(done, () => {});
    return;
  }
  if (t.dataset.act === "atg-file" || (t.dataset.act === "own-atg-file" && ownLegs)) {
    const a = state.analysis;
    try {
      const coupons = t.dataset.act === "own-atg-file" ? [ownLegs.map((l) => [...l.horses].sort((x, y) => x - y))] : atgCoupons();
      const xml = atgFileXml({ type: a.type, gameId: a.id, coupons });
      const blob = new Blob([xml], { type: "application/xml" });
      const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: atgFileName(`${a.id}-${couponRows(coupons)}-rader`, xml) });
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      msg = { kind: "error", text: e.message };
      render();
    }
    return;
  }
  if (t.dataset.act === "copy-coupon" && lastLegs) {
    const txt = couponText(lastLegs);
    const done = () => { t.textContent = "Kopierat!"; setTimeout(() => (t.textContent = "Kopiera kupongen"), 1500); };
    navigator.clipboard?.writeText(txt).then(done, () => {});
    return;
  }
  if (t.dataset.ownLeg) {
    ev.preventDefault();
    ownOpen = true;
    const id = state?.analysis?.id;
    if (!id) return;
    const leg = Number(t.dataset.ownLeg);
    const nr = Number(t.dataset.ownNr);
    const mine = (own[id] ||= {});
    const cur = mine[leg] || [];
    mine[leg] = cur.includes(nr) ? cur.filter((x) => x !== nr) : [...cur, nr];
    if (!mine[leg].length) delete mine[leg];
    return render();
  }
  if (t.dataset.act === "own-clear") {
    delete own[state.analysis.id];
    ownBuilt.delete(state.analysis.id);
    return render();
  }
  if (t.dataset.budget) {
    sys.budget = Number(t.dataset.budget);
    return render();
  }
  if (t.dataset.mode) {
    if (t.dataset.mode === "skrall3") {
      // Förval: reducerat, utgång 16 ×, minst 3 skrällar per rad (se docs/lardomar/anteckningar/V85.md 2026-10-04)
      sys.mode = "reducerat";
      sys.expand = 16;
      sys.conds = { ...sys.conds, minSkrall: "3", minRowTop: "" };
      if (sys.budget < SKRALL_MIN_BUDGET) sys.budget = SKRALL_MIN_BUDGET;
    } else if (t.dataset.mode === "rad50k") {
      // Förval: reducerat, utgång 16 ×, varje rad minst 50 000 kr (docs/lardomar/anteckningar/V85.md 2026-10-10)
      sys.mode = "reducerat";
      sys.expand = 16;
      sys.conds = { ...sys.conds, minSkrall: "", minRowTop: String(RAD_TOP) };
      if (sys.budget < RAD_TOP_MIN_BUDGET) sys.budget = RAD_TOP_MIN_BUDGET;
    } else {
      sys.mode = t.dataset.mode;
      if (t.dataset.mode === "reducerat" && isSkrall3()) sys.conds = { ...sys.conds, minSkrall: "" };
      if (t.dataset.mode === "reducerat" && isRadTop()) sys.conds = { ...sys.conds, minRowTop: "" };
    }
    return render();
  }
});

// toggle bubblar inte – fånga den för att komma ihåg öppna avdelningar mellan omritningar
view.addEventListener(
  "toggle",
  (ev) => {
    if (Date.now() < ignoreToggleUntil) return;
    const d = ev.target;
    if (d.matches?.("details.hs-egna")) ownOpen = d.open;
    if (!d.matches?.("details.hs-race[id]")) return;
    if (d.open) openRaces.add(d.id);
    else openRaces.delete(d.id);
  },
  true,
);

view.addEventListener("change", (ev) => {
  const t = ev.target;
  if (t.id === "hs-date") {
    date = t.value || today();
    games = null;
    render();
    loadGames(true);
  } else if (t.id === "hs-saved") load(t.value);
  else if (t.id === "hs-game" && games?.saved && t.value) load(t.value); // webbversionen: listan är sparade omgångar
  else if (t.id === "hs-budget" || t.id === "hs-own-budget") {
    sys.budget = Math.max(10, Number(t.value) || 500);
    render();
  } else if (t.id === "hs-focus") {
    sys.focus = t.value;
    render();
  } else if (t.id === "hs-top") {
    sys.minTop = Math.max(MIN_TOP, Number(t.value) || MIN_TOP);
    render();
  } else if (t.id === "hs-ibweight") {
    sys.ibWeight = Number(t.value) || 0;
    render();
  } else if (t.id === "hs-expand") {
    sys.expand = Number(t.value);
    render();
  } else if (t.dataset.cond) {
    sys.conds[t.dataset.cond] = t.value;
    render();
  }
});

function onView(v) {
  view.hidden = v !== "hastar";
  if (v !== "hastar") return;
  if (!loaded) {
    loaded = true;
    boot();
  } else render();
}
window.addEventListener("betting:view", (e) => onView(e.detail));
if (window.__bettingView) onView(window.__bettingView);
