// Flik "Stryktipset": kupong fran Svenska Spel + analys per match (data fran /api/stryktips).
// En sida per spel: användaren låser krav (1, X, 2, 1X, X2, 12, 1X2) för kupong A, B eller båda, och resten av
// kupongerna genereras i webbläsaren (stryk-engine.js).
import { generateCoupons, kravSigns, canFall, skrallTips, skrallKryss, clampFileRows, FILE_BUDGET, FILE_RULES } from "/stryk-engine.js";
import { startelvaButton, startelvaPanel } from "/startelva.js";

// Startelvan per match (gui/public/startelva.js), samma nyckel som scripts/lib/startelva.mjs svsKey
const seKey = (p, e) => ["svs", p.product, p.drawNumber, e.eventNumber].join("|");

const view = document.getElementById("stryktips-view");
const tabs = [...document.querySelectorAll(".view-tab")];
const SIGNS = ["1", "X", "2"];
 // kupong A, samma som fetch-stryktipset.mjs (Stryktipset 15k sedan 2026-10-04)

let data = null;
let product = null;
// Adresser: /tips, /stryktipset, /europatipset.
// Undersidor: /stryktipset/backtest öppnar backtestet. Gamla adresser (/<spel>/b, /<spel>/reducera, #stryktips,
// #stryktips/backtest, #stryktips/<spel>/reducera) skickas vidare till spelets sida.
const POOLS = ["stryktipset", "europatipset"];
function parseRoute() {
  const legacy = location.hash.match(/^#stryktips(?:\/(\w+))?(\/reducera)?/);
  if (legacy) {
    const game = legacy[1] && legacy[1] !== "backtest" ? legacy[1] : "stryktipset";
    const sub = legacy[1] === "backtest" ? "/backtest" : legacy[2] ? "/reducera" : "";
    history.replaceState(null, "", `/${game}${sub}`);
  }
  const [first, sub] = location.pathname.split("/").filter(Boolean);
  if (POOLS.includes(first) && sub && sub !== "backtest") history.replaceState(null, "", `/${first}`);
  const v = POOLS.includes(first) ? first : first === "tips" || first === "hastar" ? first : null;
  return { view: v, sub: sub === "backtest" ? sub : null };
}
const route = parseRoute();
let showBacktest = route.sub === "backtest";
let loading = false;
const open = new Set(); // expanderade analyser (produkt|matchnr)
// Utfällda <details> överlever omritningen (render() byter hela vyns HTML vid varje klick)
const keepOpen = new Set();
const keep = (k, def = false) => ` data-keep="${k}"${keepOpen.has(k) || def ? " open" : ""}`;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (p) => (p == null ? "—" : `${Math.round(p * 100)} %`);
const dec = (x) => (x == null ? "—" : Number(x).toFixed(2).replace(".", ","));
/** Decimalodds under tecknet. Titeln har källan och oddsets procent. */
function oddsUnder(e, i) {
  const o = e.odds?.[i];
  if (o == null) return "";
  const p = e.market?.[i];
  const src = e.marketSource || "odds";
  const tip = `${src}${p != null ? ` · ${pct(p)}` : ""}`;
  return `<small class="sb-odd" title="${esc(tip)}">${dec(o)}</small>`;
}

function kickoff(iso) {
  if (!iso) return "tid saknas";
  const d = new Date(iso);
  const day = d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "numeric" });
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

// ---------- Flikbyte ----------
// v = "tips" | "stryktipset" | "europatipset" | "hastar". push = lägg adressen i historiken.
// Hästar ritas av hastar.js, som lyssnar på händelsen "betting:view".
const viewPath = (v) => `/${v}`;
function setView(v, push = false) {
  const pool = v;
  const st = POOLS.includes(pool);
  if (st) product = pool;
  document.body.classList.toggle("view-stryktips", st);
  document.body.classList.toggle("view-hastar", v === "hastar");
  window.__bettingView = v;
  window.dispatchEvent(new CustomEvent("betting:view", { detail: v }));
  view.hidden = !st;
  for (const t of tabs) {
    const on = t.dataset.view === v;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
  }
  if (push && location.pathname !== viewPath(v)) history.pushState(null, "", viewPath(v));
  else if (!push && location.pathname === "/") history.replaceState(null, "", viewPath(v));
  try {
    localStorage.setItem("betting.view", v);
  } catch {
    /* privat lage */
  }
  if (st) {
    if (!data && !loading) load();
    else render();
  }
}

tabs.forEach((t) => t.addEventListener("click", () => {
  showBacktest = false;
  setView(t.dataset.view, true);
}));
window.addEventListener("popstate", () => {
  const r = parseRoute();
  showBacktest = r.sub === "backtest";
  setView(r.view || "tips");
});

// ---------- Data ----------
async function load(force = false) {
  loading = true;
  render();
  try {
    const res = await fetch(force ? "/api/stryktips/fetch" : "/api/stryktips", { method: force ? "POST" : "GET" });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
    data = body;
    // Spelet styrs av adressen (/stryktipset eller /europatipset), se setView
  } catch (e) {
    data = { ...(data || {}), error: e.message };
  } finally {
    loading = false;
    render();
  }
}

// ---------- Rendering ----------
const COLOR_LABEL = { green: "Grön · favorit", yellow: "Blå · fri", red: "Röd · skräll", spik: "Blå · spik", blue: "Blå · fri" };
const COLOR_TITLE = {
  green: "Spelas i kupong A · grön = favorit, folket har streckat tecknet minst 45 %",
  yellow: "Spelas i kupong A · blå = mellan, folket har streckat tecknet 26–44 %. Ingen färgregel",
  red: "Spelas i kupong A · röd = skräll, folket har streckat tecknet 25 % eller lägre",
  spik: "Spik i kupong A · blå = bara ett tecken i matchen",
  blue: "Med i kupong A · folket har streckat tecknet 26–44 %",
};
// Förklaring en gång ovanför matchkorten
const legend = () => `<p class="st-legend" aria-label="Förklaring">
  <b>Förklaring:</b>
  <span class="st-in c-green" title="${esc(COLOR_TITLE.green)}">Grön</span> folket ≥ 45 %
  <span class="st-in c-red" title="${esc(COLOR_TITLE.red)}">Röd</span> 25 % eller lägre (skräll)
  <span class="st-in c-spik" title="${esc(COLOR_TITLE.spik)}">Blå</span> spik, och tecken på 26–44 % (ingen färgregel)
  <span class="st-b" title="Tecknet spelas också i kupong B">B</span> spelas även i kupong B
  <span>🍀 = turmatch</span>
  <span class="st-legend-note">Ifylld ruta med färgad ram = tecknet är med i kupong A (ramens färg = folkets streck, blå = spik eller blå halvgardering). Dämpad ruta = inte med i A.</span>
</p>`;
function probRow(e) {
  const names = [e.home, "Oavgjort", e.away];
  return `<div class="st-probs">${SIGNS.map((s, i) => {
    const inSys = e.systemPick ? e.systemPick.signs.includes(s) : e.tip === s;
    const hit = e.result?.outcome === s;
    const sv = e.streckvarde?.[i];
    // Spik (ett tecken i kupong A) blå, annars färg efter folkets streck: grön minst 45 %, röd högst 25 %, blå däremellan
    const f = e.folk?.[i];
    const col = !inSys ? null : e.systemPick?.signs.length === 1 ? "spik" : f == null ? null : f >= 0.45 ? "green" : Math.round(f * 100) <= 25 ? "red" : "blue";
    return `<div class="st-prob${inSys ? " tip" : " out"}${col ? ` c-${col}` : ""}${hit ? " hit" : ""}">
      <div class="st-prob-top"><span class="st-sign">${s}</span><span class="st-team">${esc(names[i])}</span>${inSys ? `<span class="st-in${col ? ` c-${col}` : ""}" title="${esc(col ? COLOR_TITLE[col] : "Tecknet spelas i kupong A")}">${col ? COLOR_LABEL[col] : "✓ spelas"}</span>` : ""}${e.systemPickB?.signs.includes(s) ? `<span class="st-b" title="Tecknet spelas också i kupong B">B</span>` : ""}<strong>${pct(e.final[i])}</strong></div>
      <div class="st-bar"><span style="width:${Math.round(e.final[i] * 100)}%"></span></div>
      <div class="st-prob-sub">
        <span title="${esc(e.marketSource || "Odds")}">oddset ${dec(e.odds?.[i])}${e.market?.[i] != null ? ` · ${pct(e.market[i])}` : ""}</span>
        <span title="Svenska folkets streckning">folket ${pct(e.folk?.[i])}</span>
        ${sv != null && sv >= 1.2 && e.final[i] >= 0.15 ? `<span class="st-sv" title="Vår sannolikhet / folkets andel">streckvärde ${dec(sv)}</span>` : ""}
      </div>
    </div>`;
  }).join("")}</div>`;
}

// Svenska Spels egen info: experternas tips, Tio tidningars tips, oddsrörelse sedan start
function svsRow(e) {
  const parts = [];
  if (e.experts?.length) {
    parts.push(`<span class="st-svs-k">Svenska Spels experter</span>${e.experts.map((x) => {
      const ok = e.result ? x.signs.includes(e.result.outcome) : null;
      return `<span class="st-exp${ok === true ? " good" : ok === false ? " bad" : ""}" title="${esc(x.author)}">${esc(x.author.split(" ")[0])} <b>${esc(x.signs.split("").join("+") || "–")}</b></span>`;
    }).join("")}`);
  }
  if (e.tioTidningar) parts.push(`<span class="st-svs-k">Tio tidningar</span><span class="st-exp">1: <b>${e.tioTidningar[0]}</b> · X: <b>${e.tioTidningar[1]}</b> · 2: <b>${e.tioTidningar[2]}</b></span>`);
  if (e.startOdds && e.odds) {
    const moves = SIGNS.map((s, i) => ({ s, d: e.odds[i] - e.startOdds[i], from: e.startOdds[i], to: e.odds[i] })).filter((m) => Math.abs(m.d) >= 0.05);
    if (moves.length) parts.push(`<span class="st-svs-k">Oddsrörelse</span>${moves.map((m) => `<span class="st-exp ${m.d < 0 ? "good" : "bad"}" title="${m.d < 0 ? "Oddset har sjunkit – pengar på tecknet" : "Oddset har stigit"}">${m.s} ${dec(m.from)} → <b>${dec(m.to)}</b></span>`).join("")}`);
  }
  return parts.length ? `<div class="st-svs">${parts.join("")}</div>` : "";
}

// Vad färgerna betyder: folkets streck på de spelade tecknen (blått = spik)
function colorBox() {
  const row = (badge, text) => `<tr><th>${badge}</th><td>${text}</td></tr>`;
  return `<details class="st-method st-colors"><summary>Vad betyder färgerna?</summary>
    <p>Färgen på ett spelat tecken visar hur mycket <b>svenska folket</b> har streckat det. Blått visar att matchen är en <b>spik</b> (bara ett tecken).</p>
    <div class="st-bt-wrap"><table class="st-bt ds-table">
      <thead><tr><th>Färg</th><th>Betyder</th></tr></thead>
      <tbody>
        ${row(`<span class="st-in c-green">Grön</span>`, "Favorit – folket har streckat tecknet minst 45 %")}
        ${row(`<span class="st-tip spik">Blå</span>`, "Mellan – folket 26–44 %")}
        ${row(`<span class="st-in c-red">Röd</span>`, "Skräll – folket 25 % eller lägre. Ger hög utdelning om den går in")}
        ${row(`<span class="st-tip spik">Blå</span>`, "Spik – vi spelar bara ett tecken i matchen")}
      </tbody></table></div>
  </details>`;
}

// Startelvor/frånvaro – samma data som Oddset (ESPN-elva för PL/Championship, annars FPL-skador för PL)
function lineupRow(e) {
  const l = e.lineup;
  if (!l) return "";
  const pctShare = (x) => `${Math.round((x || 0) * 100)} %`;
  const status = l.status === "confirmed"
    ? `<span class="st-lu ok">Startelvor bekräftade (ESPN)</span>`
    : l.status === "pending" ? `<span class="st-lu-muted">Elvor ej släppta än</span>` : "";
  const side = (team, x) => {
    if (!x?.players?.length) return x?.source && x.source !== "ingen spelardata" ? `<span class="st-lu-side"><b>${esc(team)}</b>: ingen nyckelspelare saknas${x.source === "FPL" ? " (FPL)" : ""}</span>` : "";
    return `<span class="st-lu-side"><b>${esc(team)}</b> saknar: ${x.players.map((pl) => `${esc(pl.name)} <small>(${pctShare(pl.share)} av anfallet${pl.reason ? ` · ${esc(pl.reason)}` : ""})</small>`).join(", ")}</span>`;
  };
  const sides = [side(e.home, l.home), side(e.away, l.away)].filter(Boolean).join("");
  if (!status && !sides) return "";
  const effect = l.alpha
    ? `Lagmodellens anfall justerat: ${e.home} ×${dec(l.home?.attackFactor ?? 1)}, ${e.away} ×${dec(l.away?.attackFactor ?? 1)}.`
    : "Påverkar inte procenten direkt (Oddsets backtest valde vikt 0) – oddsen tar hänsyn till elvorna när de hämtas sent.";
  return `<div class="st-lineup"><span class="st-svs-k">Startelvor</span>${status}${sides}<small class="st-lu-note">${effect}</small></div>`;
}

// FotMob-kontext (alla lag: landslag, Europacup, topp 5, Allsvenskan): elva, frånvaro, vila/rotation, domare
function contextRow(e) {
  const c = e.context;
  if (!c?.home) return "";
  const status = c.lineupConfirmed
    ? `<span class="st-lu ok">Elvor bekräftade (FotMob)</span>`
    : `<span class="st-lu-muted">senaste elvan, ej bekräftad</span>`;
  const side = (team, x) => {
    if (!x) return "";
    const miss = x.unavailable?.length
      ? `saknar ${x.unavailable.map((p) => `${esc(p.name)}${p.type ? ` <small>(${p.type === "injury" ? "skada" : p.type === "suspension" ? "avstängd" : esc(p.type)})</small>` : ""}`).join(", ")}${x.missingValueShare >= 0.1 ? ` <small>· ${Math.round(x.missingValueShare * 100)} % av värdet</small>` : ""}`
      : "inga kända frånvarande";
    const rest = [x.restDays != null ? `vila ${Math.round(x.restDays)} d` : "", x.daysToNext != null && x.nextMatch?.tournament ? `nästa: ${esc(x.nextMatch.tournament)} om ${Math.round(x.daysToNext)} d` : ""].filter(Boolean).join(" · ");
    return `<span class="st-lu-side" title="${esc((x.starters || []).join(", "))}"><b>${esc(team)}</b>${x.formation ? ` (${esc(x.formation)})` : ""}: ${miss}${rest ? ` <small>· ${rest}</small>` : ""}</span>`;
  };
  // Domarens facit mot lagen (V-O-F i ligamatcher) när domaren är tillsatt
  const rs = e.refereeStreak;
  const rec = (x, name) => (x?.matches ? ` · ${esc(name)} ${x.record.w}-${x.record.d}-${x.record.l} (${Math.round((x.record.w / x.matches) * 100)} % V)` : "");
  const extra = c.referee ? `Domare: ${esc(c.referee)}${rs ? `${rec(rs.home, e.home)}${rec(rs.away, e.away)}` : ""}` : "";
  return `<div class="st-lineup"><span class="st-svs-k">Trupp</span>${status}${side(e.home, c.home)}${side(e.away, c.away)}${extra ? `<small class="st-lu-note">${extra}</small>` : ""}</div>`;
}

function expertTexts(e) {
  if (!e.experts?.length) return "";
  return `<div class="st-experts"><h4>Svenska Spels expertanalyser</h4>${e.experts.map((x) => `<div class="st-expert"><p class="st-expert-head"><strong>${esc(x.author)}</strong> tippar <b>${esc(x.signs.split("").join(" + ") || "–")}</b></p><p>${esc(x.text)}</p></div>`).join("")}</div>`;
}

function verdictChip(e) {
  const v = e.verdict;
  if (!v) return "";
  if (v.odds == null) return `<span class="st-chip nv">${esc(v.sign)} · Ej värde · från ${dec(v.minOdds)} (odds saknas)</span>`;
  return `<span class="st-chip ${v.value ? "good" : "nv"}" title="Värde om Svenska Spels odds på ${v.sign} (${dec(v.odds)}) är minst ${dec(v.minOdds)}">${esc(v.sign)} · ${v.value ? "Värde" : "Ej värde"} · från ${dec(v.minOdds)}</span>`;
}

function resultChip(e) {
  if (!e.result) return "";
  const ok = e.systemPick ? e.systemPick.signs.includes(e.result.outcome) : e.result.outcome === e.tip;
  return `<span class="st-chip ${ok ? "good" : "bad"}">${ok ? "Rätt" : "Fel"} · ${esc(e.result.outcome)} (${esc(e.result.score || "")})</span>`;
}

const BASIS = {
  club: "Odds + lagmodell (form, mål, xG)",
  elo: "Odds + landslags-Elo",
  market: "Endast Svenska Spels odds",
  folk: "Endast Svenska folket (inga odds)",
  oddset: "Som Oddset (marknadsstyrt tips)",
  none: "Inget underlag",
};

function teamCard(p, side) {
  if (!p) return "";
  const rec = side === "home" ? p.homeRecord : p.awayRecord;
  const recLbl = side === "home" ? "Hemma" : "Borta";
  return `<div class="st-team-card ds-card">
    <h4>${esc(p.team)} <small>${esc(p.leagueName)}${p.position ? ` · ${p.position}:a av ${p.of}` : ""}</small></h4>
    <dl>
      <div><dt>Poäng</dt><dd>${p.points} på ${p.played} (${dec(p.ppg)}/match)</dd></div>
      <div><dt>Mål</dt><dd>${p.gf}–${p.ga}</dd></div>
      <div><dt>${recLbl}</dt><dd>${rec.w}V ${rec.d}O ${rec.l}F · ${rec.gf}–${rec.ga}</dd></div>
      ${p.xgfPg != null ? `<div><dt>xG/match</dt><dd>${dec(p.xgfPg)} skapat · ${dec(p.xgaPg)} insläppt</dd></div>` : ""}
      ${p.xp != null ? `<div><dt>xP</dt><dd>${String(p.xp.toFixed(1)).replace(".", ",")} förväntade poäng mot ${p.points} verkliga${p.xpPosition ? ` · förväntad plats ${p.xpPosition}` : ""} <small>(poäng om matcherna avgjorts av xG)</small></dd></div>` : ""}
      <div><dt>Styrka</dt><dd>anfall ${dec(p.attack)} · försvar ${dec(p.defence)} <small>(1,00 = snitt, lägre försvar = bättre)</small></dd></div>
    </dl>
    <div class="st-form">${(p.last || []).map((m) => `<span class="f-${m.r}" title="${esc(m.date)} ${m.venue === "H" ? "hemma" : "borta"} mot ${esc(m.opp)}">${m.r}</span>`).join("")}</div>
    <ul class="st-last">${(p.last || []).map((m) => `<li><span>${esc(m.date.slice(5))}</span> ${m.venue === "H" ? "vs" : "@"} ${esc(m.opp)} <b class="f-${m.r}">${esc(m.score)}</b></li>`).join("")}</ul>
  </div>`;
}

function analysisPanel(e) {
  const row = (lbl, arr, f = pct) => `<tr><th>${lbl}</th>${SIGNS.map((_, i) => `<td>${arr ? f(arr[i]) : "—"}</td>`).join("")}</tr>`;
  return `<div class="st-analysis">
    <ul class="st-bullets">${(e.analysis || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    ${expertTexts(e)}
    <div class="st-grid">
      <table class="st-cmp ds-table">
        <thead><tr><th></th><th>1</th><th>X</th><th>2</th></tr></thead>
        <tbody>
          ${row("Odds", e.odds, dec)}
          ${row("Marknad", e.market)}
          ${row("Modell", e.model)}
          ${row("Svenska folket", e.folk)}
          <tr class="final">${`<th>Vår procent</th>${SIGNS.map((_, i) => `<td>${pct(e.final[i])}</td>`).join("")}`}</tr>
          ${row("Streckvärde", e.streckvarde, dec)}
        </tbody>
      </table>
      <div class="st-goals">
        ${e.lambdas ? `<p><span>Förväntade mål</span><strong>${dec(e.lambdas.home)} – ${dec(e.lambdas.away)}</strong></p>` : ""}
        ${e.over25 != null ? `<p><span>Över 2,5 mål</span><strong>${pct(e.over25)}</strong></p>` : ""}
        ${e.btts != null ? `<p><span>Båda lagen gör mål</span><strong>${pct(e.btts)}</strong></p>` : ""}
        ${e.topScores?.length ? `<p><span>Troligaste resultat</span><strong>${e.topScores.slice(0, 4).map((s) => `${esc(s.score)} (${pct(s.p)})`).join(" · ")}</strong></p>` : ""}
        <p><span>Underlag</span><strong>${esc(BASIS[e.basis] || e.basis)}${e.tipBasis === "oddset" && e.oddsetTip?.source ? ` · ${esc(e.oddsetTip.source)}` : ""}${e.modelWeight ? ` · modellvikt ${Math.round(e.modelWeight * 100)} %` : ""}</strong></p>
      </div>
    </div>
    ${e.homeProfile || e.awayProfile ? `<div class="st-teams">${teamCard(e.homeProfile, "home")}${teamCard(e.awayProfile, "away")}</div>` : ""}
    ${e.h2h?.length ? `<div class="st-h2h"><h4>Inbördes möten</h4><ul>${e.h2h.map((m) => `<li><span>${esc(m.date)}</span> ${esc(m.home)} <b>${esc(m.score)}</b> ${esc(m.away)}</li>`).join("")}</ul></div>` : ""}
  </div>`;
}

// ---------- Turmatcher och vanliga missar (data.missProfile, scripts/lib/stryk-miss-profile.mjs) ----------
// Turmatch = matchtypen (spik/halvgardering x tecken x favoritens chans) har historiskt missat minst 30 % av gångerna,
// dvs 13 rätt krävde att utfallet låg utanför grundraden. rescue = tecknet som oftast kom i stället.
const TUR_RATE = 0.3;
// Stryktipset: profil med bara de engelska ligorna (PL, Championship, League One), annars hela arkivet
const missProf = () => (product === "stryktipset" && data?.missProfileStryk) || data?.missProfile;
function turInfo(e, signs) {
  const prof = missProf();
  if (!prof || !signs || signs.length === 3 || !e.final) return null;
  const fav = Math.max(...e.final);
  const band = prof.bandEdges.filter((x) => fav >= x).length;
  const type = signs.length === 1 ? "spik" : "halv";
  const favSign = SIGNS[e.final.indexOf(fav)];
  const onFav = signs.includes(favSign);
  const g = onFav ? prof.groups[`${type}|${signs}|${band}`] : null;
  const expected = 1 - [...signs].reduce((s, c) => s + e.final[SIGNS.indexOf(c)], 0);
  const hist = !!g && g.n >= prof.minN;
  const rate = hist ? g.rate : expected;
  const missing = SIGNS.filter((s) => !signs.includes(s));
  // Tecknet som oftast kom i stället (historiken), annars det som vi ger högst chans
  const rescue = missing.slice().sort((a, b) => (hist ? (g.by[b] || 0) - (g.by[a] || 0) : 0) || e.final[SIGNS.indexOf(b)] - e.final[SIGNS.indexOf(a)])[0];
  const lg = type === "spik" ? prof.leagues?.[e.league] : null;
  return {
    tur: rate >= TUR_RATE, rate, expected, hist, g, rescue, signs, favSign, onFav, fav,
    kravSigns: SIGNS.filter((s) => signs.includes(s) || s === rescue).join(""),
    league: lg && lg.rate >= 0.4 ? { name: e.league, ...lg } : null,
  };
}

function turText(t) {
  const hist = t.hist
    ? `${esc(t.g.label)}: ${t.g.miss} av ${t.g.n} missade (${pct(t.rate)}, väntat ${pct(t.g.exp)}). I stället kom ${SIGNS.filter((s) => t.g.by[s]).map((s) => `${s} ${t.g.by[s]} ggr`).join(", ")}.`
    : `För få liknande matcher i historiken – vår chans att ${t.signs.split("").join("")} missar är ${pct(t.rate)}.`;
  const lg = t.league ? ` Spikar i ${esc(t.league.name)} spricker ${pct(t.league.rate)} (${t.league.miss} av ${t.league.n}).` : "";
  return `${hist}${lg} För 13 rätt: lägg till <b>${esc(t.rescue)}</b> → <b>${esc(t.kravSigns.split("").join(""))}</b>.`;
}

// Öppna förklaringar (spel|matchnr), fälls ut när man klickar på turmatch
const turOpen = new Set();
const turKey = (e) => `${product}|${e.eventNumber}`;
function turChip(t, e) {
  if (!t?.tur) return "";
  return `<button type="button" class="st-chip tur tur-btn" data-ev="${e.eventNumber}" aria-expanded="${turOpen.has(turKey(e))}">🍀 Turmatch · missar ${pct(t.rate)} <small>${turOpen.has(turKey(e)) ? "▲" : "Varför? ▼"}</small></button>`;
}

// Förklaring i enkla ord: vad kupongen spelar, hur det gått förut (10 prickar), och vad man kan göra
function turExplain(e, t, { actions = false, krav = null } = {}) {
  const names = { 1: `${e.home} vinner (1)`, X: "oavgjort (X)", 2: `${e.away} vinner (2)` };
  const playTxt = t.signs.length === 1
    ? `Kupong A har bara <b>ett</b> tecken här: <b>${esc(t.signs)}</b>, alltså att ${esc(names[t.signs])}. Det finns tre sätt en match kan sluta på, och A gissar bara på ett av dem.`
    : `Kupong A har två tecken här: <b>${esc(t.signs)}</b>. Då blir det bara fel om det blir <b>${esc(SIGNS.find((x) => !t.signs.includes(x)))}</b>.`;
  const tenth = Math.max(1, Math.min(10, Math.round(t.rate * 10)));
  const dots = `<span class="tur-dots" aria-label="${tenth} av 10 gånger fel">${Array.from({ length: 10 }, (_, i) => `<span class="${i < tenth ? "miss" : "ok"}"></span>`).join("")}</span>`;
  const coin = t.rate >= 0.55 ? " Det blir alltså oftare fel än rätt." : t.rate >= 0.45 ? " Det är nästan som att singla slant 🪙." : " Det är ungefär var tredje gång.";
  const past = t.hist
    ? `Vi har tittat på <b>${t.g.n}</b> gamla matcher som liknar den här (${esc(t.g.label.toLowerCase())}). I <b>${t.g.miss}</b> av dem blev det fel.
       Om vi tänker oss 10 sådana matcher blir ungefär <b>${tenth} av 10</b> fel:`
    : !t.onFav
      ? `Här har kupong A inte valt favoriten (favoriten är <b>${esc(t.favSign)}</b> med ${pct(t.fav)}). Då finns inga liknande matcher att jämföra med, så vi använder vår egen chans: ${esc(t.signs)} händer bara i ${pct(1 - t.expected)} av gångerna. Om vi tänker oss 10 sådana matcher blir ungefär <b>${tenth} av 10</b> fel:`
      : `Det finns för få liknande matcher sparade, så vi använder vår egen chans. Om vi tänker oss 10 sådana matcher blir ungefär <b>${tenth} av 10</b> fel:`;
  const instead = t.hist
    ? `När det blev fel blev det ${SIGNS.filter((x) => t.g.by[x]).sort((a, b) => t.g.by[b] - t.g.by[a]).map((x) => `<b>${x}</b> ${t.g.by[x]} gånger`).join(" och ")}.`
    : "";
  const saved = t.hist && t.g.miss ? ` Det hade räddat ${t.g.by[t.rescue]} av de ${t.g.miss} felen.` : "";
  const lg = t.league ? `<li>Extra: spikar i ${esc(t.league.name)} går sönder ofta, ${pct(t.league.rate)} av gångerna.</li>` : "";
  const lockedA = ["both", "A", "all"].includes(krav?.scope);
  const btn = actions
    ? (lockedA
      ? `<p class="tur-hint">Du har själv låst den här matchen i kupong A. Vill du ändra, klicka på tecknen i listan.</p>`
      : `<button type="button" class="btn-ghost sb-tur-add ds-btn ds-btn--secondary ds-btn--sm" data-ev="${e.eventNumber}" data-signs="${esc(t.kravSigns)}">Lägg ${esc(t.kravSigns)} som krav i kupong B</button>`)
    : "";
  return `<div class="tur-explain ds-notice ds-notice--success">
    <h4>🍀 Varför är det en turmatch?</h4>
    <ol>
      <li>${playTxt}</li>
      <li>${past} ${dots}${coin} ${instead}</li>
      <li>Om det blir fel här kan kupong A <b>inte</b> få 13 rätt, hur bra de andra 12 matcherna än går. Därför behövs tur.</li>
      ${lg}
      <li><b>Vad kan du göra?</b> Lägg till <b>${esc(t.rescue)}</b>, det som oftast kom i stället, och spela <b>${esc(t.kravSigns)}</b>.${saved} Det kostar fler rader i kupongen. Vill du inte ändra A kan du lägga ${esc(t.kravSigns)} i kupong B, så täcker B det A missar.</li>
    </ol>
    ${btn}
  </div>`;
}

// Panel: turmatcherna i omgången (efter kupong A:s tecken) + historikens vanligaste missar
// kravFor(nr) = användarens krav på matchen (B-sidan); krav som gäller A skrivs aldrig över av turknapparna
function missPanel(p, events, { bCoupon = null, actions = false, kravFor = () => null } = {}) {
  const prof = missProf();
  if (!prof) return { tur: "", stats: "" };
  const turs = events.map((e, i) => ({ e, i, t: turInfo(e, e.systemPick?.signs) })).filter((x) => x.t?.tur).sort((a, b) => b.t.rate - a.t.rate);
  const pOk = turs.reduce((s, x) => s * (1 - x.t.rate), 1);
  const list = turs.length
    ? `<ol class="st-tur-list">${turs.map(({ e, i, t }) => {
        const bPick = bCoupon?.picks[i]?.signs;
        const bCovers = bPick && bPick.includes(t.rescue);
        return `<li>
          <div class="st-tur-head"><span class="st-num">${e.eventNumber}</span><b>${esc(e.home)} – ${esc(e.away)}</b>
            <span class="st-tip ${t.signs.length === 1 ? "spik" : "halv"}">${esc(t.signs.split("").join(" + "))}</span>
            <span class="st-chip tur">missar ${pct(t.rate)}</span>
            ${bCoupon ? `<span class="st-chip ${bCovers ? "good" : "bad"}">${bCovers ? `B täcker ${esc(t.rescue)}` : `B saknar ${esc(t.rescue)}`}</span>` : ""}
            ${actions ? (["both", "A", "all"].includes(kravFor(e.eventNumber)?.scope)
              ? `<span class="st-sub" title="Ändra kravet i listan ovan om B ska spelas annorlunda">Ditt krav gäller A</span>`
              : `<button type="button" class="btn-ghost sb-tur-add ds-btn ds-btn--secondary ds-btn--sm" data-ev="${e.eventNumber}" data-signs="${esc(t.kravSigns)}">Krav ${esc(t.kravSigns)} i B</button>`) : ""}
          </div>
          <p>${turText(t)}</p>
        </li>`;
      }).join("")}</ol>`
    : `<p class="st-sub">Inga turmatcher: alla spikar och halvgarderingar i kupong A har historiskt missat under ${Math.round(TUR_RATE * 100)} %.</p>`;
  const rows = Object.values(prof.groups).filter((g) => g.n >= prof.minN).sort((a, b) => b.miss - a.miss).slice(0, 8);
  const over = (g) => g.rate - g.exp > 2 * Math.sqrt((g.exp * (1 - g.exp)) / g.n);
  const table = `<div class="st-bt-wrap"><table class="st-bt st-miss-table ds-table">
      <thead><tr><th>Matchtyp</th><th>Matcher</th><th>Missade</th><th>Väntat</th><th>Kom i stället</th></tr></thead>
      <tbody>${rows.map((g) => `<tr${over(g) ? ` class="down"` : ""}><th>${esc(g.label)}${over(g) ? ` <small>· missar oftare än väntat</small>` : ""}</th><td data-l="Matcher">${g.n}</td><td data-l="Missade">${pct(g.rate)}</td><td data-l="Väntat">${pct(g.exp)}</td><td data-l="Kom i stället">${SIGNS.filter((s) => g.by[s]).map((s) => `${s}: ${g.by[s]}`).join(" · ")}</td></tr>`).join("")}</tbody>
    </table></div>`;
  const leagues = Object.entries(prof.leagues || {}).sort((a, b) => b[1].rate - a[1].rate).slice(0, 6);
  const d = prof.outsideDist;
  // Stryktipset: varje tips (1, X, 2, 1X, X2, 12) per engelsk liga – hur ofta det satt och vad det blev när det inte satt
  const ORDER = ["1", "X", "2", "1X", "X2", "12"];
  const tipName = { 1: "1 (hemmaseger)", X: "X (oavgjort)", 2: "2 (bortaseger)", "1X": "1X (inte borta)", X2: "X2 (inte hemma)", 12: "12 (inte oavgjort)" };
  const lp = prof.leaguesOnly && prof.leaguePicks ? prof.leaguesOnly.filter((l) => prof.leaguePicks[l]) : [];
  const lgRow = (l) => {
    const sp = prof.leagues?.[l];
    const tips = ORDER.filter((k) => prof.leaguePicks[l][k]).map((k) => {
      const g = prof.leaguePicks[l][k];
      const worse = g.rate > g.exp + 0.05, better = g.rate < g.exp - 0.05;
      return `<tr><th>${esc(tipName[k])}</th><td data-l="Tippat">${g.n}</td><td data-l="Rätt">${g.n - g.miss} (${pct(1 - g.rate)})</td><td data-l="Fel"${worse ? " class=\"down\"" : better ? " class=\"up\"" : ""}>${g.miss} (${pct(g.rate)})</td><td data-l="Väntat fel">${pct(g.exp)}</td><td data-l="Blev i stället">${SIGNS.filter((x) => g.by[x]).map((x) => `${x}: ${g.by[x]}`).join(" · ") || "–"}</td></tr>`;
    }).join("");
    return `<tr class="st-bt-lg"><th colspan="6">${esc(l)}${sp ? ` <small>· alla spikar: fel ${pct(sp.rate)}, väntat ${pct(sp.exp)}</small>` : ""}</th></tr>${tips}`;
  };
  const lgTable = lp.length ? `<h3>Tipsen per liga</h3>
        <p class="st-sub"><b>Fel</b> = hur många gånger resultatet inte fanns bland tecknen vi tippade. <b>Väntat fel</b> = hur ofta våra procent sa att det skulle bli fel. Är Fel klart högre än Väntat (rött) har vi varit för säkra på det tipset; lägre (grönt) = bättre än väntat. <b>Blev i stället</b> = vad matchen slutade när tipset var fel.</p>
        <div class="st-bt-wrap"><table class="st-bt st-miss-table ds-table">
          <thead><tr><th>Tips</th><th>Tippat</th><th>Rätt</th><th>Fel</th><th>Väntat fel</th><th>Blev i stället</th></tr></thead>
          <tbody>${lp.map(lgRow).join("")}</tbody>
        </table></div>` : "";
  // Två delar: turmatcherna (hopfällda, hör till kupongen) och historiken (hopfälld under Statistik & historik)
  const tur = `<details class="sb-panel st-tur st-fold ds-card"${keep("tur")}>
        <summary><h3>🍀 Turmatcher i omgången</h3><small>${turs.length} st · kupong A</small></summary>
        <p class="st-sub">Matchtyper som historiskt har missat minst ${Math.round(TUR_RATE * 100)} % av gångerna – här krävs tur för 13 rätt${turs.length ? `. Chans att alla håller: ${pct(pOk)}` : ""}.${actions ? " Lägg in tecknet som oftast kom i stället som krav i kupong B, så täcker B det A missar." : ""}</p>
        ${actions && turs.some(({ e }) => !["both", "A", "all"].includes(kravFor(e.eventNumber)?.scope)) ? `<button type="button" class="btn-ghost sb-tur-all ds-btn ds-btn--secondary ds-btn--sm">Lägg turmatcherna som krav i B</button>` : ""}
        ${list}
      </details>`;
  const stats = `<div class="st-miss">
        <h3>Vanliga missar <small>${prof.draws} omgångar · ${prof.matches} matcher</small></h3>
        <p class="st-sub">Från kupongarkivet (${esc(prof.from)} – ${esc(prof.to)}), grundraden i kupong A${prof.leaguesOnly ? `, bara ${esc(prof.leaguesOnly.join(", "))}` : ""}. Helgarderingar missar aldrig – alla missar är spikar och halvgarderingar. Rätt rad låg i snitt <b>${String(prof.avgOutside).replace(".", ",")}</b> ${prof.leaguesOnly ? "av de här matcherna" : "matcher"} utanför grundraden (0: ${d[0]}, 1: ${d[1]}, 2: ${d[2]}, 3+: ${d[3]} omgångar).</p>
        ${prof.leaguesOnly ? `<p class="st-sub"><b>Missade</b> = hur ofta den typen av tips blev fel. <b>Väntat</b> = hur ofta våra procent sa att det skulle bli fel.</p>` : ""}
        ${table}
        ${lgTable}
        ${!lp.length && leagues.length ? `<p class="st-sub"><b>Spikar per liga</b> (minst ${prof.minN}): ${leagues.map(([n, g]) => `${esc(n)} ${pct(g.rate)} <small>(väntat ${pct(g.exp)})</small>`).join(" · ")}</p>` : ""}
      </div>`;
  return { tur, stats };
}

// Domarsvit (minst 5 raka segrar/förluster för ett lag med matchens domare), engelska ligor
function refereeAlert(e) {
  const r = e.refereeStreak;
  if (!r?.flagged) return "";
  const flagged = [[r.home, e.home], [r.away, e.away]].filter(([s]) => s?.flag);
  const kind = flagged.every(([s]) => s.flag === "wins") ? "win" : flagged.every(([s]) => s.flag === "losses") ? "loss" : "mixed";
  const last = (s) => (s.last || []).map((m) => `${m.date} ${m.home ? "hemma" : "borta"} mot ${m.opp} ${m.score}`).join("\n");
  const rows = flagged.map(([s, name]) => `<li class="${s.flag === "wins" ? "win" : "loss"}" title="${esc(last(s))}"><b>${esc(name)}</b>: ${s.streak.n} ${s.flag === "wins" ? "raka segrar" : "raka förluster"} med domaren <small>(${s.record.w}-${s.record.d}-${s.record.l} på ${s.matches} ligamatcher)</small></li>`).join("");
  return `<div class="ref-alert ${kind}" role="note"><span class="ref-alert-k">⚑ Domarsvit</span> <b>${esc(r.referee)}</b> dömer<ul>${rows}</ul></div>`;
}
// Streckfavorit utan seger: laget streckas ofta som favorit (≥ 50 %) men har inte vunnit minst hälften denna säsong
function streckFlopAlert(e) {
  const f = e.streckFlop;
  if (!f?.flagged) return "";
  const pc = (x) => `${Math.round(x * 100)} %`;
  const res = { V: "vinst", O: "kryss", F: "förlust" };
  const last = (s) => s.last.map((m) => `${m.date} ${m.home ? "hemma" : "borta"} mot ${m.opp} ${m.score} (streck ${m.folk} %, ${res[m.res]})`).join("\n");
  const rows = [[f.home, e.home], [f.away, e.away]].filter(([t]) => t).map(([t, name]) => {
    const s = t.season;
    const prev = t.prev ? ` · förra säsongen ${t.prev.noWin} av ${t.prev.games} (${pc(t.prev.rate)})` : "";
    return `<li class="loss" title="${esc(last(s))}"><b>${esc(name)}</b>: ingen seger i ${s.noWin} av ${s.games} matcher som streckfavorit (${pc(s.rate)}) <small>– ${s.draws} kryss, ${s.losses} förluster, streckat i snitt ${s.avgFolk} %${prev}</small></li>`;
  }).join("");
  return `<div class="ref-alert loss streck-flop" role="note"><span class="ref-alert-k">▼ Streckfavorit utan seger</span> Kort sagt: folket tror ofta på laget, men det vinner sällan denna säsong. Fundera på att gardera.<ul>${rows}</ul></div>`;
}
// Skräll folket missar (skrällfickan, 2026-10-11): PL/Championship, oddsen 20–30 % och minst 1,3 × folkets streck. e.pocket från servern.
function pocketAlert(e) {
  if (!e.pocket?.length || !e.market || !e.folk) return "";
  const pc = (x) => `${Math.round(x * 100)} %`;
  const who = { "1": e.home, X: "kryss", "2": e.away };
  const rows = e.pocket.map((s) => {
    const k = "1X2".indexOf(s);
    const inA = e.systemPick?.signs?.includes(s), inB = e.systemPickB?.signs?.includes(s);
    const cov = inA || inB ? `med i ${[inA && "A", inB && "B"].filter(Boolean).join(" och ")}` : "inte med i A eller B";
    return `<li class="win"><b>${esc(s)}</b> (${esc(who[s])}): oddsen ${pc(e.market[k])}, folket ${pc(e.folk[k])} – ${(e.market[k] / e.folk[k]).toFixed(1).replace(".", ",")} × strecken <small>(${cov})</small></li>`;
  }).join("");
  return `<div class="ref-alert win pocket-alert" role="note"><span class="ref-alert-k">★ Skräll folket missar</span> Kort sagt: oddsen tror mer på tecknet än folket. Sådana skrällar i PL och Championship gick in 1,7 gånger så ofta som folket trodde (4 582 matcher 2023–2026), och betalar bra när de sitter. Vår procent är höjd 12 % för dem.<ul>${rows}</ul></div>`;
}
// Etikett vid lagnamnet: laget är ett risklag (streckfavorit som sällan vinner denna säsong)
function teamName(e, side) {
  const t = e.streckFlop?.[side];
  const f = fallOf(e);
  const name = esc(e[side]) + (f?.side === side ? fallTag(f) : "");
  if (!t) return name;
  const s = t.season;
  return `${name}<span class="risk-tag" title="Risklag: ingen seger i ${s.noWin} av ${s.games} matcher som streckfavorit denna säsong (${Math.round(s.rate * 100)} %)">⚠ risklag</span>`;
}

// "Kan falla" (2026-10-03): favorit som folket tror på (minst 50 %) men som har under 55 % chans hos oss, se canFall.
// Bara Stryktipset: testat på PL/Championship/League One.
const fallOf = (e) => (product === "stryktipset" ? canFall(e) : null);
const fallTag = (f) => `<span class="fall-tag" title="Kan falla: folket streckar ${pct(f.folk)} men vår chans är ${pct(f.p)} (kryss ${pct(f.x)}). Sådana favoriter föll 57 % av gångerna i bakkörningen.">⚠ kan falla</span>`;
// Kupongen spikar en favorit som kan falla (A–C: tecken = bara favoriten; D/E: nästan alla rader på favoriten)
const fallMark = (e, signs, sys) => {
  const f = fallOf(e);
  if (!f) return "";
  const spiked = signs === f.sign;
  return spiked
    ? ` <span class="sb-fall" title="Kupong ${sys} spikar ${f.sign} på en favorit som kan falla: folket ${pct(f.folk)}, vår chans ${pct(f.p)}. Lås gärna en gardering som krav.">⚠ kan falla</span>`
    : "";
};

// Panel: alla lag som streckats som favorit minst 2 gånger denna säsong, risklagen överst
const RES_TXT = { V: "vinst", O: "kryss", F: "förlust" };
function riskPanel(p) {
  const list = data?.streckFlopSeason || [];
  if (!list.length) return "";
  const inCoupon = new Set(p.events.flatMap((e) => [e.home, e.away]));
  const risk = list.filter((r) => r.risk);
  const rest = list.filter((r) => !r.risk);
  const pc = (x) => `${Math.round(x * 100)} %`;
  const row = (r) => {
    const s = r.season;
    const dots = [...s.last].reverse().map((m) => `<span class="rk-dot ${m.res}" title="${esc(`${m.date} ${m.home ? "hemma" : "borta"} mot ${m.opp} ${m.score} – streck ${m.folk} %, ${RES_TXT[m.res]}`)}">${m.res === "V" ? "✓" : m.res === "O" ? "X" : "✕"}</span>`).join("");
    const prev = r.prev ? `förra säsongen ${r.prev.noWin} av ${r.prev.games} (${pc(r.prev.rate)})` : "ingen favoritmatch förra säsongen";
    const here = inCoupon.has(r.team);
    return `<li class="rk-row${r.risk ? " is-risk" : ""}${here ? " in-coupon" : ""}">
      <div class="rk-team"><b>${esc(r.team)}</b>${here ? `<span class="rk-here">i kupongen</span>` : ""}<small>${esc(r.league || "")}</small></div>
      <div class="rk-dots" aria-label="Matcher som streckfavorit, äldst först">${dots}</div>
      <div class="rk-rate"><span class="rk-pct">${pc(s.rate)}</span><span class="rk-bar"><i style="width:${Math.round(s.rate * 100)}%"></i></span><small>utan seger</small></div>
      <div class="rk-meta">${s.noWin} av ${s.games} · ${s.draws} kryss, ${s.losses} förl. · streck ${s.avgFolk} %<br><small>${esc(prev)}</small></div>
    </li>`;
  };
  const couponRisk = risk.filter((r) => inCoupon.has(r.team)).map((r) => r.team);
  return `<details class="sb-panel rk-panel st-fold ds-card"${keep("risklag")}>
    <summary><h3>⚠ Risklag denna säsong</h3><small>${risk.length} risklag${couponRisk.length ? ` · ${couponRisk.length} i kupongen: ${esc(couponRisk.join(", "))}` : " · inget i kupongen"}</small></summary>
    <p class="rk-short"><b>Kort sagt:</b> de här lagen har folket trott på (minst 50 % streck på seger), men de har ofta kryssat eller förlorat. Är ett risklag med i kupongen – tänk på att gardera.</p>
    <details class="sb-howto"><summary>Så läser du det här</summary>
      <ul>
        <li>Varje ruta är en match där laget var streckfavorit denna säsong, äldst till vänster: <span class="rk-dot V">✓</span> vinst, <span class="rk-dot O">X</span> kryss, <span class="rk-dot F">✕</span> förlust. Håll musen över en ruta för motståndare, resultat och streck.</li>
        <li><b>Risklag</b> = minst 2 matcher som streckfavorit och ingen seger i minst hälften. De får etiketten <span class="risk-tag">⚠ risklag</span> i matchlistan.</li>
        <li>Bara engelska lag är med. Säsongen räknas från juli, och förra säsongen visas bara som jämförelse.</li>
      </ul>
    </details>
    ${risk.length ? `<ol class="rk-list">${risk.map(row).join("")}</ol>` : `<p class="st-sub">Inga risklag än denna säsong.</p>`}
    ${rest.length ? `<details class="rk-more"><summary>Övriga streckfavoriter (${rest.length}) – vinner oftast</summary><ol class="rk-list">${rest.map(row).join("")}</ol></details>` : ""}
  </details>`;
}

function refereeBadge(e) {
  const r = e.refereeStreak;
  if (!r?.flagged) return "";
  const kinds = [r.home?.flag, r.away?.flag].filter(Boolean);
  const kind = kinds.every((k) => k === "wins") ? "win" : kinds.every((k) => k === "losses") ? "loss" : "mixed";
  const txt = [[r.home, e.home], [r.away, e.away]].filter(([s]) => s?.flag).map(([s, n]) => `${n} ${s.streak.n} raka ${s.flag === "wins" ? "segrar" : "förluster"}`).join(", ");
  return ` · <span class="ref-badge ${kind}" title="Domare ${esc(r.referee)}: ${esc(txt)}">⚑ domarsvit</span>`;
}

function matchCard(p, e) {
  const key = `${p.product}|${e.eventNumber}`;
  const isOpen = open.has(key);
  const sys = e.systemPick;
  const tur = turInfo(e, sys?.signs);
  return `<article class="st-match ds-card${isOpen ? " open" : ""}${e.refereeStreak?.flagged ? " ref-flagged" : ""}${e.streckFlop?.flagged ? " flop-flagged" : ""}" data-key="${esc(key)}">
    <header class="st-match-head">
      <span class="st-num">${e.eventNumber}</span>
      <div class="st-title">
        <h3>${teamName(e, "home")} <span>–</span> ${teamName(e, "away")}</h3>
        <p><span class="st-kick">${esc(kickoff(e.kickoff))}</span> · ${esc(e.league || "")}</p>
      </div>
      <div class="st-verdict">
        ${sys ? `<span class="st-tip ${sys.signs.length === 1 ? "spik" : sys.signs.length === 2 ? "halv" : "hel"}" title="System A – grundrad (reduceras sedan)">${e.systemPickB ? "A: " : ""}${esc(sys.type)} ${esc(sys.signs.split("").join(" + "))}</span>` : `<span class="st-tip">Tips ${esc(e.tip)}</span>`}
        ${e.systemPickB && !p.reducedB?.split ? `<span class="st-tip sysb${e.systemPickB.signs.length === 1 ? " spik" : ""}" title="System B – eget system">B: ${esc(e.systemPickB.type)} ${esc(e.systemPickB.signs.split("").join(" + "))}</span>` : ""}
        ${turChip(tur, e)}
        ${verdictChip(e)}
        ${resultChip(e)}
      </div>
    </header>
    ${refereeAlert(e)}
    ${streckFlopAlert(e)}
    ${pocketAlert(e)}
    ${tur?.tur && turOpen.has(turKey(e)) ? turExplain(e, tur) : ""}
    ${probRow(e)}
    ${svsRow(e)}
    ${lineupRow(e)}
    ${contextRow(e)}
    <button type="button" class="st-analyze ds-btn ds-btn--secondary" aria-expanded="${isOpen}">${isOpen ? "Dölj analys" : `Analysera ${esc(e.home)} – ${esc(e.away)}`}</button>
    ${isOpen ? analysisPanel(e) : ""}
    ${startelvaButton(seKey(p, e), { cls: "st-se" })}
    ${startelvaPanel(seKey(p, e))}
  </article>`;
}

function render() {
  if (view.hidden) return;
  const products = data?.products || [];
  const p = products.find((x) => x.product === product);
  const head = `<div class="st-head">
    <div>
      <p class="eyebrow">Svenska Spel · 13 matcher</p>
      <h2>${esc(p?.productName || (product === "europatipset" ? "Europatipset" : "Stryktipset"))}${p ? ` <small>omgång ${p.drawNumber}</small>` : ""}</h2>
      <p class="st-sub">${p ? `${p.open ? "Öppen" : "Avgjord"} · ${esc(p.closeDescription || "")}` : "Hämtar kupong…"}${data?.updatedAt ? ` · hämtad ${esc(new Date(data.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }))}` : ""}</p>
    </div>
    <div class="st-actions">
      <button type="button" class="btn-ghost ds-btn ds-btn--secondary" id="st-fetch" ${loading ? "disabled" : ""}>${loading ? "Hämtar…" : "Hämta från Svenska Spel"}</button>
    </div>
  </div>`;

  if (!p) {
    view.innerHTML = `${head}<p class="st-empty">${loading ? "Hämtar kupong och räknar…" : esc(data?.error || data?.fetchError || "Ingen kupong hämtad än – tryck “Hämta från Svenska Spel”.")}</p>`;
    return;
  }
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  // Omgångens notis/värde visas överst, all historik och metod längst ner (hopfälld)
  const top = p.note || p.value ? `<div class="st-summary">
    ${p.note ? `<p class="st-note ds-notice ds-notice--warning">${esc(p.note)}</p>` : ""}
    ${p.value ? `<p class="st-value ds-notice ${esc(p.value.level)}">${esc(p.value.text)}</p>` : ""}
  </div>` : "";
  const extras = `${colorBox()}
    <details class="st-method"><summary>Hur räknas procenten?</summary>
      <ul>${Object.values(data.method || {}).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </details>`;
  renderB(p, head, top, extras);
}

view.addEventListener("toggle", (ev) => {
  const k = ev.target?.dataset?.keep;
  if (!k) return;
  if (ev.target.open) keepOpen.add(k);
  else keepOpen.delete(k);
}, true);

// ---------- Stryktipset B: egna krav ----------
// Krav sparas per spel och omgång i webbläsaren: { signs: "1X", scope }. scope: "both" = A och B, "A"/"B" = bara den
// kupongen, "C" = bara C, "all" = A, B och C.
// Äldre sparade spikar ({ sign: "1" }) läses som krav med ett tecken. Sparad scope D/E visas som "all".
// Sparad scope C (kupongen är dold) släpps: den gällde bara C och ska inte låsa A eller B.
const SCOPES = [["both", "A+B"], ["A", "A"], ["B", "B"], ["C", "C"], ["all", "Alla"]];
const SCOPE_TITLE = {
  both: "Kravet gäller kupong A och B (rekommenderat)",
  A: "Kravet gäller bara kupong A",
  B: "Kravet gäller bara kupong B",
  C: "Kravet gäller bara kupong C",
  all: "Kravet gäller alla kupongerna",
};
// Summa per filkupong (användaren 2026-10-12: "jag ska kunna bestämma summa fortfarande"). 1 kr per rad, sparas i
// webbläsaren och gäller båda spelen.
const FILE_BUDGET_KEY = "betting.fileBudget";
const BUDGET_SYS = ["A", "B", "C"];
let fileBudget = { A: FILE_RULES.rows, B: FILE_RULES.rows, C: FILE_RULES.rows };
try {
  const s = JSON.parse(localStorage.getItem(FILE_BUDGET_KEY) || "{}");
  for (const sys of BUDGET_SYS) fileBudget[sys] = clampFileRows(s[sys], FILE_RULES.rows);
} catch { /* privat läge */ }
function saveFileBudget() {
  try { localStorage.setItem(FILE_BUDGET_KEY, JSON.stringify(fileBudget)); } catch { /* privat läge */ }
}
const budgetChanged = (st) => !!st.genRows && BUDGET_SYS.some((sys) => fileBudget[sys] !== st.genRows[sys]);
const bStates = new Map();
const bKey = (p) => `betting.spikes.${p.product}.${p.drawNumber}`;
// Egen fördelning per match (användaren 2026-10-12: "jag ska kunna bestämma fördelningen själv som förut"), som gamla
// D/E/F %: { [eventNumber]: { A: [a,b,c], B: […], C: […] } } – andel rader per tecken i varje kupong. Av = kupongen väljer fritt.
const SHARE_SYS = ["A", "B", "C"];
const SHARE_DEFAULT = [33, 33, 34];
const sharesKey = (p) => `betting.fileShares.${p.product}.${p.drawNumber}`;
const sharesPrevKey = (p) => `betting.fileSharesPrev.${p.product}.${p.drawNumber}`; // senaste På-värden (återställs vid På igen)
const sealKey = (p) => `betting.sealed.${p.product}.${p.drawNumber}`;
// Hänglås per match: bara Stryktipset. Låst match går inte att ändra, och Generera kräver att alla 13 är låsta.
const usesSeal = (p) => p?.product === "stryktipset";
const kravTxt = (k) => (kravSigns(k) || []).map((i) => SIGNS[i]).join("");
function bState(p) {
  const k = bKey(p);
  if (!bStates.has(k)) {
    let krav = {};
    try {
      krav = JSON.parse(localStorage.getItem(k) || "{}") || {};
    } catch {
      /* privat lage */
    }
    for (const [nr, x] of Object.entries(krav)) {
      const signs = kravTxt(x);
      if (signs) krav[nr] = { signs, scope: x.scope || "both" };
      else delete krav[nr];
    }
    let sealed = [];
    try {
      sealed = JSON.parse(localStorage.getItem(sealKey(p)) || "[]") || [];
    } catch {
      /* privat lage */
    }
    bStates.set(k, {
      krav, shares: loadShareMap(p, sharesKey), sharesPrev: loadShareMap(p, sharesPrevKey), result: null, dirty: false, busy: false,
      sealed: new Set(Array.isArray(sealed) ? sealed.map(Number) : []), rowError: {}, genError: null,
    });
  }
  return bStates.get(k);
}
function saveSealed(p, st) {
  try {
    localStorage.setItem(sealKey(p), JSON.stringify([...st.sealed]));
  } catch {
    /* privat lage */
  }
}
/** Varför matchen inte går att låsa (A/B/C % som inte blir 100 %), annars null. */
function rowProblem(st, nr) {
  const pair = normalizeSharePair(st.shares?.[nr]);
  if (!pair) return null;
  const bad = SHARE_SYS.find((sys) => !shareSumMsg(pair[sys]).ok);
  return bad ? `${bad}-raden: ${shareSumMsg(pair[bad]).text}` : null;
}
/** Första matchen som stoppar Generera: fel i A/B/C % eller inte låst. */
function firstSealProblem(p, st) {
  const open = p.events.filter((e) => !st.sealed.has(e.eventNumber)).length;
  for (const e of p.events) {
    const nr = e.eventNumber;
    const why = rowProblem(st, nr);
    if (why) return { nr, text: `Match ${nr} stämmer inte (${why}). Rätta till 100 % och lås matchen.` };
    if (!st.sealed.has(nr)) return { nr, text: `Match ${nr} är inte låst${open > 1 ? ` (${open} matcher olåsta)` : ""}. Klicka på hänglåset när du är klar med matchen.` };
  }
  return null;
}
function saveKrav(p, st) {
  st.dirty = !!st.result;
  try {
    localStorage.setItem(bKey(p), JSON.stringify(st.krav));
    localStorage.setItem(sharesKey(p), JSON.stringify(st.shares || {}));
    localStorage.setItem(sharesPrevKey(p), JSON.stringify(st.sharesPrev || {}));
  } catch {
    /* privat lage */
  }
}

// ---------- Egen fördelning A/B/C % per match ----------
const clampShare = (x) => Math.max(0, Math.min(100, Math.round(Number(x) || 0)));
/** Heltal % som summerar till 100 (största rest får det som fattas). */
function roundTo100(raw) {
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum <= 0) return [...SHARE_DEFAULT];
  const scaled = raw.map((x) => (x / sum) * 100);
  const out = scaled.map((x) => Math.floor(x));
  let left = 100 - out.reduce((a, b) => a + b, 0);
  const order = [0, 1, 2].sort((a, b) => (scaled[b] - out[b]) - (scaled[a] - out[a]));
  for (let i = 0; left > 0; i++, left--) out[order[i % 3]]++;
  return out;
}
const sharesFromProbs = (probs) => (probs?.length ? roundTo100([0, 1, 2].map((i) => Math.max(0, Number(probs[i]) || 0))) : [...SHARE_DEFAULT]);
function normalizeSharePair(s) {
  if (!s || typeof s !== "object") return null;
  const A = (Array.isArray(s.A) ? s.A : SHARE_DEFAULT).map(clampShare);
  return { A, B: Array.isArray(s.B) ? s.B.map(clampShare) : [...A], C: Array.isArray(s.C) ? s.C.map(clampShare) : [...A] };
}
/** A, B och C ≈ modellens 1/X/2. */
function modelSharePair(e) {
  const s = sharesFromProbs(e?.final);
  return { A: [...s], B: [...s], C: [...s] };
}
function loadShareMap(p, keyFn) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(keyFn(p)) || "{}") || {}; } catch { /* privat */ }
  const out = {};
  for (const e of p.events || []) {
    const pair = normalizeSharePair(saved[e.eventNumber]);
    if (pair) out[e.eventNumber] = pair;
  }
  return out;
}
/** Antal + andel 1/X/2 för en match i en kupong. */
function egnaDistForMatch(c, i) {
  const rows = c?.rowList;
  if (!rows?.length) return null;
  const cnt = [0, 0, 0];
  for (const row of rows) cnt[SIGNS.indexOf(row[i])]++;
  return { cnt, pct: roundTo100(cnt), n: rows.length };
}
/** Startvärden när man slår På: så kupongerna spelat matchen just nu. */
function sharePairFromResult(res, i) {
  const d = SHARE_SYS.map((sys) => egnaDistForMatch(res?.[sys], i));
  if (!d.some(Boolean)) return null;
  const A = d[0]?.pct || [...SHARE_DEFAULT];
  return { A, B: d[1]?.pct || [...A], C: d[2]?.pct || [...A] };
}
function shareSumMsg(s) {
  const sum = (s || []).reduce((a, b) => a + (Number(b) || 0), 0);
  if (sum > 100) return { ok: false, text: `${sum - 100} % för mycket (summa ${sum} %)` };
  if (sum < 100) return { ok: false, text: `${100 - sum} % saknas (summa ${sum} %)` };
  return { ok: true, text: "100 %" };
}
/** Andelar till motorn: { A: { nr: […] }, B: {…}, C: {…} }. Bara rader som summerar till 100 %. */
function sharesForEngine(st) {
  const out = { A: {}, B: {}, C: {} };
  for (const [nr, raw] of Object.entries(st.shares || {})) {
    const pair = normalizeSharePair(raw);
    if (!pair) continue;
    for (const sys of SHARE_SYS) if (shareSumMsg(pair[sys]).ok) out[sys][nr] = pair[sys];
  }
  return out;
}
function shareCouponLine(sys, dist, busy) {
  if (!dist) {
    const wait = busy ? `<span class="sb-defall-miss" role="status"><span class="sb-spin" aria-hidden="true"></span>räknar…</span>` : `<span class="sb-defall-miss">–</span>`;
    return `<div class="sb-defall-line is-empty"><span class="sb-defall-lab">${sys}</span>${wait}</div>`;
  }
  const cells = SIGNS.map((sign, i) => `<div class="sb-defall-cell" title="${dist.cnt[i]} av ${dist.n} rader (${dist.pct[i]} %)">
      <span class="sb-defall-sign">${sign}</span>
      <span class="sb-defall-bar" aria-hidden="true"><i style="width:${dist.pct[i]}%"></i></span>
      <span class="sb-defall-num"><b>${dist.pct[i]}%</b> <small>${dist.cnt[i]}</small></span>
    </div>`).join("");
  return `<div class="sb-defall-line"><span class="sb-defall-lab" title="Kupong ${sys}: så den spelat matchen">${sys}</span>${cells}</div>`;
}
function shareEditLine(sys, shares, sealed) {
  const chk = shareSumMsg(shares);
  return `<div class="sb-defall-edit is-on${chk.ok ? "" : " is-bad"}" data-defall-sys="${sys}">
    <span class="sb-defall-lab" title="Kupong ${sys}: din andel rader på 1/X/2 (ska bli 100 %)">${sys}</span>
    ${SIGNS.map((sign, i) => `<label class="sb-defall-i">${sign}<input type="number" min="0" max="100" step="1" inputmode="numeric" data-defall="${i}" data-defall-sys="${sys}" value="${shares[i]}" aria-label="${sys} ${sign} %"${sealed ? " disabled" : ""}></label>`).join("")}
    <span class="sb-defall-sum${chk.ok ? "" : " is-bad"}" data-defall-sum role="status">${esc(chk.text)}</span>
  </div>`;
}
function shareRow(e, raw, i, res, busy, sealed) {
  const on = !!raw;
  const pair = normalizeSharePair(raw) || modelSharePair(e);
  const allOk = SHARE_SYS.every((sys) => shareSumMsg(pair[sys]).ok);
  const dists = SHARE_SYS.map((sys) => egnaDistForMatch(res?.[sys], i));
  const status = busy ? `<span class="sb-defall-status" role="status"><span class="sb-spin" aria-hidden="true"></span>${dists.some(Boolean) ? "uppdaterar…" : "räknar…"}</span>` : "";
  return `<div class="sb-defall${busy ? " is-busy" : ""}${on ? " is-on" : ""}" data-ev="${e.eventNumber}">
    <div class="sb-defall-head">
      <span class="sb-defall-k" title="Av: så A, B och C spelat matchen. På: du bestämmer andelen rader på 1, X och 2 i varje kupong. Modell: ≈ vår chans.">A/B/C %${status}</span>
      <span class="sb-defall-actions">
        ${on ? `<button type="button" class="ds-toggle" data-defall-model title="Sätt A, B och C från vår chans"${sealed ? " disabled" : ""}>Modell</button>` : ""}
        <button type="button" class="ds-toggle sb-defall-on${on ? " active" : ""}" data-defall-toggle aria-pressed="${on}" title="${on ? "Stäng av – kupongerna väljer fritt igen" : "Slå på med samma % som visas nu"}"${sealed ? " disabled" : ""}>${on ? "På" : "Av"}</button>
      </span>
    </div>
    ${on
      ? `${SHARE_SYS.map((sys) => shareEditLine(sys, pair[sys], sealed)).join("")}
    <small class="sb-defall-hint${allOk ? "" : " is-bad"}">${allOk ? "Tryck Generera kupong så byggs filerna med din fördelning" : "Rätta varje rad (A, B och C) till 100 % innan du genererar"}</small>`
      : `${SHARE_SYS.map((sys, k) => shareCouponLine(sys, dists[k], busy)).join("")}
    <small class="sb-defall-hint">Slå På för att bestämma fördelningen själv – startar med % som visas ovan</small>`}
  </div>`;
}

const kravType = (signs) => (signs.length === 1 ? "spik" : signs.length === 2 ? "halv" : "hel");
function sealButton(e, sealed) {
  const nr = e.eventNumber;
  return `<button type="button" class="sb-seal${sealed ? " on" : ""}" data-seal="${nr}" aria-pressed="${sealed}" aria-label="${sealed ? `Lås upp match ${nr}` : `Lås match ${nr}`}" title="${sealed ? "Låst – klicka för att låsa upp och ändra" : "Lås matchen när du är klar"}"><span aria-hidden="true">${sealed ? "🔒" : "🔓"}</span><span class="sb-seal-txt">${sealed ? "Låst" : "Lås"}</span></button>`;
}
function kravRow(e, krav, pick, seal = null, share = null) {
  const sealed = !!seal?.sealed;
  // Äldre sparade D/E-scope → Alla (D/E styrs via fördelning i stället)
  const scope = (krav?.scope === "D" || krav?.scope === "E") ? "all" : (krav?.scope || "both");
  const signs = krav?.signs || "";
  const tur = turInfo(e, pick?.signs);
  // Modellens mest sannolika tecken markeras så man ser förslaget innan man sätter krav
  const best = e.final ? e.final.indexOf(Math.max(...e.final)) : -1;
  const dis = sealed ? " disabled" : "";
  return `<div class="sb-row${krav ? " locked" : ""}${share?.raw ? " has-defall" : ""}${sealed ? " is-sealed" : ""}${seal?.error ? " is-error" : ""}" data-ev="${e.eventNumber}">
    <span class="st-num">${e.eventNumber}</span>
    <div class="sb-match">${sealed ? `<span class="sb-sealed-tag">🔒 Låst</span>` : ""}<b>${teamName(e, "home")} – ${teamName(e, "away")}</b><small><span class="st-kick">${esc(kickoff(e.kickoff))}</span> · ${esc(e.league || "")}${refereeBadge(e)}${tur?.tur ? ` · <button type="button" class="sb-tur tur-btn" data-ev="${e.eventNumber}" aria-expanded="${turOpen.has(turKey(e))}">🍀 turmatch (${esc(pick.signs)} missar ${pct(tur.rate)}) ${turOpen.has(turKey(e)) ? "▲" : "– varför? ▼"}</button>` : ""}</small></div>
    <div class="sb-krav">
      <div class="sb-signs${signs.length === 1 ? " spik" : ""}" role="group" aria-label="Krav match ${e.eventNumber}">${SIGNS.map((s, i) => `<button type="button" class="sb-sign${signs.includes(s) ? " on" : ""}${i === best ? " best" : ""}" data-sign="${s}" aria-pressed="${signs.includes(s)}" title="${i === best ? "Modellens mest sannolika tecken · " : ""}Folket ${pct(e.folk?.[i])}"${dis}>${s}<small>${pct(e.final[i])}</small>${oddsUnder(e, i)}</button>`).join("")}</div>
      <span class="sb-krav-lbl" title="${krav ? "Ditt krav på matchen" : "Inget krav – kupongen väljer själv"}">${krav ? `<span class="st-tip ${kravType(signs)}">${esc(signs)}</span>` : "inget krav"}</span>
      ${seal ? sealButton(e, sealed) : ""}
    </div>
    ${krav
      ? `<div class="sb-scope" role="group" aria-label="Kravet gäller"><span class="sb-scope-k">Gäller</span>${SCOPES.map(([k, lbl]) => `<button type="button" class="ds-toggle" data-scope="${k}" aria-pressed="${scope === k}" title="${esc(SCOPE_TITLE[k])}"${dis}>${lbl}</button>`).join("")}</div>`
      : `<div class="sb-scope is-empty" aria-hidden="true"></div>`}
    ${share ? shareRow(e, share.raw, share.i, share.res, share.busy, sealed) : ""}
    ${seal?.error ? `<p class="sb-row-err" role="alert">${esc(seal.error)}</p>` : ""}
    ${tur?.tur && turOpen.has(turKey(e)) ? turExplain(e, tur, { actions: !sealed, krav }) : ""}
  </div>`;
}

// Antal rader per tecken (1/X/2) och match i en egna-rader-kupong (D/E)
function egnaSignCounts(c, p) {
  const n = c.rowList?.length || 0;
  return (p.events || []).map((e, i) => {
    const cnt = { 1: 0, X: 0, 2: 0 };
    for (const row of c.rowList || []) cnt[row[i]]++;
    return { n: e.eventNumber, home: e.home, away: e.away, cnt, rows: n };
  });
}
function egnaSignTable(c, p) {
  const rows = egnaSignCounts(c, p);
  if (!rows.length) return "";
  const cell = (n, tot) => {
    if (!n) return `<td class="sb-sign-n is-zero">0</td>`;
    const pct = tot ? Math.round((100 * n) / tot) : 0;
    return `<td class="sb-sign-n" title="${n} av ${tot} rader (${pct} %)"><b>${n}</b><small>${pct}%</small></td>`;
  };
  return `<details class="sb-sign-dist"${keep("sign-dist-" + (c.system || "D"))}><summary>Rader per tecken (1 / X / 2)</summary>
    <p class="st-sub">Hur många av de ${c.rows} raderna som har varje tecken per match.</p>
    <div class="st-bt-wrap"><table class="sb-sign-table ds-table">
      <thead><tr><th>#</th><th>Match</th><th>1</th><th>X</th><th>2</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td>${r.n}</td>
        <th>${esc(r.home)} – ${esc(r.away)}</th>
        ${cell(r.cnt["1"], r.rows)}${cell(r.cnt.X, r.rows)}${cell(r.cnt["2"], r.rows)}
      </tr>`).join("")}</tbody>
    </table></div>
  </details>`;
}

// Kupong A, B och C: egna rader, laddas ner som fil till Svenska Spels "Egna rader" (2026-10-11). Kortet visar inte
// chansen till 13 rätt (användaren 2026-10-02: ointressant).
function couponCard(c, label, p) {
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  const tag = label === "C" ? `<span class="sb-coupon-tag extra">Skräll · egna rader</span>` : `<span class="sb-coupon-tag">Egna rader</span>`;
  if (!c) return `<div class="sb-coupon is-extra ds-card">${tag}<h3>Kupong ${label}</h3><p class="st-note bad ds-notice ds-notice--danger">Gick inte att bygga kupong ${label}: inga rader ger minst 30 000 kr med dina krav.</p></div>`;
  const file = `${p.product}-${p.drawNumber}-${label}.txt`;
  const rules = {
    A: `2 spikar på omgångens starkaste favoriter, sedan de ${c.rules.rowsTarget} troligaste raderna med minst ${krFmt(c.rules.payoutMin)} kr för 13 rätt`,
    B: `samma 2 spikar, de ${c.rules.rowsTarget} nästa raderna (≥ ${krFmt(c.rules.payoutMin)} kr) som inte finns i A, med vikt på tecken A saknar`,
    C: `samma 2 spikar, ${c.rules.rowsTarget} rader (≥ ${krFmt(c.rules.payoutMin)} kr) där underspelade tecken – vår chans minst 1,3 × folkets streck – väger mer`,
  }[label];
  return `<div class="sb-coupon ${label === "C" ? "is-extra" : "is-main"} ds-card">
    ${tag}
    <h3>Kupong ${label} <small>${c.rows} rader · ${krFmt(c.cost)} kr</small></h3>
    <dl class="sb-facts">
      <div><dt>Utdelning 13 rätt</dt><dd>minst ${krFmt(c.minPayout)} kr, ca ${krFmt(c.expectedPayout || 0)} kr</dd></div>
      <div><dt>Regler</dt><dd class="sb-rule">${rules}</dd></div>
      <div><dt>Dina krav</dt><dd>${c.picks.filter((x) => x.locked).length}</dd></div>
    </dl>
    ${c.relaxed?.length ? `<p class="st-note ds-notice ds-notice--warning">${esc(c.relaxed.join("; "))}.</p>` : ""}
    ${p.open
      ? `<div class="st-gc-wrap"><a class="st-gc ds-btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(c.egnaRader)}" download="${esc(file)}" title="Kupong ${label} som fil för Svenska Spels Egna rader">Ladda ner rader (.txt)</a>
        <small class="st-gc-help">Svenska Spel → ${p.product === "europatipset" ? "Europatipset" : "Stryktipset"} → Egna rader → ladda upp filen → ${krFmt(c.cost)} kr</small></div>`
      : `<p class="st-gc-off">Filen går att ladda ner när kupongen är öppen – den här omgången är avgjord.</p>`}
    ${egnaSignTable(c, p)}
    <details class="sb-rows"><summary>Visa alla ${c.rows} rader</summary><pre class="st-rows">${c.rowList.map((row, i) => `${String(i + 1).padStart(3, " ")}  ${row}`).join("\n")}</pre></details>
  </div>`;
}

// ---------- Missar per system (data.missProfileSystems, buildSystemMissProfiles i scripts/lib/stryk-miss-profile.mjs) ----------
// Användaren 2026-10-03: "markera dom matcher i dessa system du brukar ha fel på". Varje kupong (A, B, C) har en egen profil ur
// bakkörningen av de nuvarande systemen. ⚠ = sådana tecken (spik/halvgardering x tecken x favoritens chans, eller skräll) har
// missat minst SYS_MISS_RATE av gångerna; röd = oftare än vår egen chans säger (mer än 2 standardavvikelser).
const SYS_MISS_RATE = 0.3;
const sysGroupKey = (signs, final) => {
  const fav = Math.max(...final);
  const favSign = SIGNS[final.indexOf(fav)];
  const type = signs.length === 1 ? "spik" : "halv";
  if (!signs.includes(favSign)) return `skrall|${type}`;
  const prof = data?.missProfileSystems;
  return `${type}|${signs}|${(prof?.bandEdges || [0.45, 0.55, 0.65, 0.75]).filter((x) => fav >= x).length}`;
};
function sysMiss(e, signs, sys) {
  const prof = data?.missProfileSystems;
  if (!prof || product !== "stryktipset" || !signs || signs.length === 3 || !e.final) return null;
  // Profilen bygger på PL, Championship och League One – landskamper och andra ligor markeras inte
  if (prof.leaguesOnly && !prof.leaguesOnly.includes(e.league)) return null;
  const g = prof.systems?.[sys]?.[sysGroupKey(signs, e.final)];
  if (!g || g.n < prof.minN) return null;
  const over = g.rate - g.exp > 2 * Math.sqrt((g.exp * (1 - g.exp)) / g.n);
  return { ...g, over, mark: g.rate >= SYS_MISS_RATE };
}
const sysMissMark = (m, sys) => m?.mark
  ? ` <span class="st-sysmiss${m.over ? " over" : ""}" title="Kupong ${sys}: ${esc(m.label)} missade ${m.miss} av ${m.n} gånger i bakkörningen (${pct(m.rate)}, vår chans sa ${pct(m.exp)})${m.over ? " – oftare än väntat" : ""}">⚠ ${pct(m.rate)}</span>`
  : "";

// Risklag i B och C (användaren 2026-10-03: "markera risk matcher i b och c om du tippat dom"): kupongen har tippat på att ett
// risklag (streckfavorit som sällan vinner denna säsong, e.streckFlop) vinner utan att helgardera matchen
function riskTipped(e, signs) {
  if (!e?.streckFlop?.flagged || !signs || signs.length === 3) return null;
  const hit = [["home", "1"], ["away", "2"]].find(([side, s]) => e.streckFlop[side] && signs.includes(s));
  if (!hit) return null;
  const s = e.streckFlop[hit[0]].season;
  return { team: e[hit[0]], sign: hit[1], spik: signs.length === 1, ...s };
}
const riskMark = (r, sys) => r
  ? ` <span class="sb-risk${r.spik ? " spik" : ""}" title="Kupong ${sys} har tippat ${r.sign} på risklaget ${esc(r.team)}${r.spik ? " som spik" : ""}: ingen seger i ${r.noWin} av ${r.games} matcher som streckfavorit denna säsong (${pct(r.rate)}). Fundera på att gardera.">⚠ risklag</span>`
  : "";

function couponTable(p, res) {
  const cell = (c, i, sys) => {
    const x = c?.picks[i];
    if (!x) return "<td>—</td>";
    const cls = x.signs.length === 1 ? "spik" : x.signs.length === 2 ? "halv" : "hel";
    return `<td><span class="st-tip ${cls}${x.locked ? " mine" : ""}" title="${x.locked ? "Ditt krav" : esc(x.type)}">${x.locked ? "🔒 " : ""}${esc(x.signs.split("").join(" + "))}</span>${sysMissMark(sysMiss(p.events[i], x.signs, sys), sys)}${sys === "A" ? "" : riskMark(riskTipped(p.events[i], x.signs), sys)}${fallMark(p.events[i], x.signs, sys)}</td>`;
  };
  const turCell = (e, i) => {
    const t = turInfo(e, res.A?.picks[i]?.signs);
    return t?.tur ? `<td><button type="button" class="st-chip tur tur-btn" data-ev="${e.eventNumber}" data-scroll="1">🍀 ${pct(t.rate)} · varför?</button></td>` : "<td></td>";
  };
  const prof = data?.missProfileSystems;
  const marks = ["A", "B", "C"].reduce((n, s) => n + p.events.filter((e, i) => sysMiss(e, res[s]?.picks[i]?.signs, s)?.mark).length, 0);
  const risks = ["B"].reduce((n, s) => n + p.events.filter((e, i) => riskTipped(e, res[s]?.picks[i]?.signs)).length, 0);
  const legend = prof && product === "stryktipset"
    ? `<p class="st-sub sb-miss-legend"><b>Kort sagt:</b> ⚠ visar tecken som systemet brukar ha fel på – ${marks} st i omgången.
       <b>Så läser du det här:</b> procenten är hur ofta just den kupongen missade sådana tecken i bakkörningen (${prof.draws} omgångar,
       ${esc(prof.from)} – ${esc(prof.to)}, PL/Championship/League One). <span class="st-sysmiss over">röd</span> = oftare än vår egen chans sa.
       Håll musen över för detaljer.</p>`
    : "";
  const riskLegend = risks
    ? `<p class="st-sub sb-risk-legend"><span class="sb-risk">⚠ risklag</span> = B har tippat att ett risklag vinner (${risks} st) – laget streckas ofta som favorit men vinner sällan denna säsong. Fundera på att gardera.</p>`
    : "";
  const falls = p.events.filter((e) => fallOf(e)).length;
  const fallSpikes = ["A", "B", "C"].reduce((n, s) => n + p.events.filter((e, i) => fallMark(e, res[s]?.picks[i]?.signs, s)).length, 0);
  const fallLegend = falls
    ? `<p class="st-sub sb-fall-legend"><b>Kort sagt:</b> <span class="fall-tag">⚠ kan falla</span> = favoriter som folket tror på men som vinner mer sällan än strecken säger – ${falls} st i omgången${fallSpikes ? `, ${fallSpikes} spikade i kupongerna (<span class="sb-fall">⚠ kan falla</span>)` : ""}.
       Lås gärna en gardering på dem som krav.</p>`
    : "";
  return `${legend}${riskLegend}${fallLegend}<div class="st-bt-wrap"><table class="sb-table ds-table">
    <thead><tr><th>#</th><th>Match</th><th>Kupong A</th><th>Kupong B</th><th>Kupong C</th><th>Tur (A)</th></tr></thead>
    <tbody>${p.events.map((e, i) => `<tr><td>${e.eventNumber}</td><th>${esc(e.home)} – ${esc(e.away)}</th>${cell(res.A, i, "A")}${cell(res.B, i, "B")}${cell(res.C, i, "C")}${turCell(e, i)}</tr>`).join("")}</tbody>
  </table></div>`;
}

// Live-streck via Cloudflare-funktionen /live/svs (Svenska Spels API tillåter inte anrop direkt från sidan).
// Strecken styr utdelningen per rad (golvet 30 000 kr), så filerna byggs på strecken just nu.
async function refreshLive(p) {
  const r = await fetch(`/live/svs?product=${encodeURIComponent(p.product)}`, { cache: "no-store" });
  const d = (r.headers.get("content-type") || "").includes("json") ? await r.json() : null;
  if (!r.ok || !d) throw new Error(d?.error || (r.status === 404 ? "live-hämtning finns bara på webben" : `svar ${r.status}`));
  if (d.drawNumber !== p.drawNumber) throw new Error(`Svenska Spel visar omgång ${d.drawNumber}, sidan ${p.drawNumber} – hämta ny kupong`);
  for (const e of p.events) {
    const f = d.events.find((x) => x.eventNumber === e.eventNumber)?.folk;
    if (!f || f.some((x) => x == null)) continue;
    const s = f.reduce((a, b) => a + b, 0) || 100; // samma normering som folkProbs i fetch-stryktipset.mjs
    e.folk = f.map((x) => x / s);
    e.streckvarde = SIGNS.map((_, i) => Math.round((e.final[i] / Math.max(e.folk[i], 0.01)) * 100) / 100);
  }
  // Verklig omsättning: minst den typiska (växer till spelstopp), som i fetch-stryktipset.mjs
  const rules = p.reduced?.rules;
  if (rules && d.turnover) rules.realTurnover = Math.max(d.turnover, rules.turnover || 0);
  p.live = { at: d.fetchedAt, turnover: d.turnover };
}

// Kupongerna räknas i en bakgrundstråd (stryk-worker.js), en per spel. En ny generering avbryter den som pågår.
const workers = new Map();
const engineJob = new Map();
const kravCacheKey = (krav) => JSON.stringify(krav || {});
function runEngine(p, krav, rows) {
  if (typeof Worker === "undefined") {
    return Promise.resolve().then(() => generateCoupons(p, krav, { rows }));
  }
  engineJob.get(p.product)?.(new Error("avbruten"));
  workers.get(p.product)?.terminate();
  const w = new Worker(`/stryk-worker.js${location.search}`, { type: "module" });
  workers.set(p.product, w);
  let rejectJob;
  const done = new Promise((resolve, reject) => {
    rejectJob = reject;
    engineJob.set(p.product, reject);
    w.onmessage = ({ data: d }) => (d.error ? reject(new Error(d.error)) : resolve(d.result));
    w.onerror = (e) => { e.preventDefault?.(); reject(new Error(e.message || "bakgrundstråden stannade")); };
    w.postMessage({ p, krav, rows });
  });
  return done.finally(() => {
    if (engineJob.get(p.product) === rejectJob) engineJob.delete(p.product);
    w.terminate();
    if (workers.get(p.product) === w) workers.delete(p.product);
  });
}

/** Bygger filkupongerna A, B och C med kraven (i bakgrundstråden). */
async function generateInto(p, st) {
  const run = (st.run = (st.run || 0) + 1);
  try {
    const key = kravCacheKey(st.krav);
    const rows = { ...fileBudget };
    st.genRows = rows;
    p.fileShares = sharesForEngine(st);
    const result = await runEngine(p, st.krav, rows);
    if (run !== st.run) return;
    st.result = result;
    st.cacheKravKey = key;
  } catch (e) {
    if (run !== st.run) return;
    st.result = null;
    st.cacheKravKey = null;
    data.error = `kupongen kunde inte genereras: ${e.message}`;
  }
}

// Hämtar live-streck (öppen kupong) och genererar sedan. Misslyckas hämtningen används strecken från senaste hämtningen.
async function liveGenerate(p, st) {
  if (p.open) {
    try {
      await refreshLive(p);
      st.liveError = null;
    } catch (e) {
      st.liveError = e.message;
    }
  }
  // Live-streck påverkar A–C → alltid full omräkning
  await generateInto(p, st, { forceFull: true });
}

function streckNote(p, st) {
  const t = (iso) => new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  if (!p.open) return "";
  const at = p.live?.at || data?.updatedAt;
  const head = p.live
    ? `Live-streck kl. ${t(p.live.at)}`
    : `Streck från ${at ? t(at) : "hämtningen"}`;
  const more = p.live
    ? `Streck hämtade live kl. ${new Date(p.live.at).toLocaleTimeString("sv-SE")}${p.live.turnover ? ` (omsättning ${Math.round(p.live.turnover).toLocaleString("sv-SE")} kr)` : ""}. Strecken styr vilka rader som ger minst 30 000 kr. Nära spelstopp rör sig strecken snabbt – tryck Generera igen precis innan du laddar upp filerna.${st.liveError ? ` Senaste försöket misslyckades: ${esc(st.liveError)}.` : ""}`
    : `Strecken kommer från hämtningen${data?.updatedAt ? ` ${esc(new Date(data.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }))}` : ""}${st.liveError ? `; live-streck kunde inte hämtas (${esc(st.liveError)})` : ""}. Tryck Generera för live-streck innan du laddar upp filerna.`;
  return `<details class="st-streck ds-notice${st.liveError ? " is-warn" : ""}"${keep("streck")}><summary>${head}</summary><p>${more}</p></details>`;
}

// Skrällspikar och skrällkryss att läsa om (stryk-engine.js skrallTips/skrallKryss): två av varje att välja på, överst
// på sidan, ligger inte i kupongerna. Kryssen är på andra matcher än spikarna. Säger om A–C ändå spikar dem.
// Hela rutan är uppfälld vid sidladdning; klick visar innehållet (användaren 2026-10-07).
function skrallTipBox(p, res) {
  const tips = skrallTips(p.events);
  const kryss = skrallKryss(p.events);
  const n = tips.length + kryss.length;
  const pick = (kind) => (t, i) => {
    const inC = ["A", "B", "C"].filter((k) => res?.[k]?.picks?.[t.i]?.signs === t.sign);
    const facit = t.hit == null ? "" : ` <span class="st-chip ${t.hit ? "good" : "bad"}">${t.hit ? "Gick in" : "Gick inte in"}${t.score ? ` · ${esc(t.score)}` : ""}</span>`;
    const label = i === 0 ? "Förstaval" : t.weak ? "Reserv (svagare)" : "Andraval";
    const weakTxt = kind === "x" ? "Klarar inte hela kravet (minst 26 % och 2 procentenheter över folket) men är det bästa krysset som finns kvar." : "Klarar inte hela skrällkravet (minst 30 % och 3 procentenheter över folket) men är den bästa som finns kvar.";
    const what = kind === "x" ? ["Omgångens bästa skrällkryss.", "Näst bästa krysset, på en annan match."] : ["Omgångens bästa skräll.", "Näst bästa skrällen, på en annan match."];
    return `<div class="st-skrall-item">
      <p class="st-skrall-pick"><small class="st-skrall-rank">${label}</small><br><span class="st-num">${t.eventNumber}</span> <b>${esc(t.home)} – ${esc(t.away)}</b>: spika <b class="st-skrall-sign">${esc(t.sign)}</b> (${esc(t.outcome)})${facit}<br><small>${esc(kickoff(t.kickoff))} · ${esc(t.league || "")} · vår chans ${pct(t.p)}, folket ${pct(t.folk)}</small></p>
      <p>${t.weak ? weakTxt : what[i === 0 ? 0 : 1]}${inC.length ? ` Kupong ${inC.join(" och ")} spikar redan ${esc(t.sign)} här.` : " Kupongerna spikar den inte – lägg den som krav själv om du vill."}</p>
      <details class="sb-howto"${keep(`skrall-${kind}-why-${i}`)}><summary>Varför?</summary><ul>${t.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></details>
    </div>`;
  };
  const spikPart = tips.length
    ? `<p class="st-skrall-h">Skrällspikar <small>ligger inte i kupongen</small></p>
    <p><b>Kort sagt:</b> folket tror för lite på de här tecknen. Vill du chansa på en skräll – välj ${tips.length > 1 ? "en av de två" : "den här"}.</p>
    ${tips.map(pick("spik")).join("")}`
    : `<p class="st-skrall-h">Skrällspikar</p><p>Ingen skräll denna omgång: inget tecken utanför favoriten har minst 25 % hos oss och är understreckat av folket.</p>`;
  const xPart = kryss.length
    ? `<p class="st-skrall-h">Skrällkryss <small>ligger inte i kupongen</small></p>
    <p><b>Kort sagt:</b> folket tror för lite på oavgjort i de här matcherna. Vill du chansa på ett kryss – välj ${kryss.length > 1 ? "ett av de två" : "det här"}.</p>
    ${kryss.map(pick("x")).join("")}`
    : `<p class="st-skrall-h">Skrällkryss</p><p>Inget skrällkryss denna omgång: inget kryss har minst 22 % hos oss och är understreckat av folket.</p>`;
  const count = n ? `${n} tips` : "inga denna omgång";
  return `<details class="st-skrall ds-notice" role="note"${keep("skrall")}>
    <summary><span class="st-skrall-title">Skrälltips</span> <small>${esc(count)} · ligger inte i kupongen</small></summary>
    <div class="st-skrall-body">
      ${spikPart}
      ${xPart}
    </div>
  </details>`;
}

let backtestOpened = false;
function renderB(p, head, top = "", extras = "") {
  const st = bState(p);
  if (!st.result && !st.tried) {
    st.tried = true;
    // En enda räkning i bakgrunden: med live-streck när kupongen är öppen (annars, eller om live inte går, hämtningens
    // streck). Förut räknades kupongerna först med hämtningens streck och sedan om med live – två gånger och sidan låst.
    st.busy = true;
    liveGenerate(p, st).finally(() => {
      st.busy = false;
      render();
    });
  }
  // /stryktipset/backtest: öppna statistiken en gång (därefter styr användaren)
  if (showBacktest && !backtestOpened) {
    backtestOpened = true;
    keepOpen.add("stats");
  }
  const n = Object.keys(st.krav).length;
  const seal = usesSeal(p);
  const nSealed = seal ? p.events.filter((e) => st.sealed.has(e.eventNumber)).length : 0;
  const nClear = Object.keys(st.krav).filter((nr) => !(seal && st.sealed.has(Number(nr)))).length;
  const res = st.result;
  // Turmatcher utgår från kupong A: den genererade om den finns, annars hämtningens kupong A
  const picksA = p.events.map((e, i) => res?.A?.picks[i] || e.systemPick || null);
  const picker = `<section class="sb-panel ds-card">
    <div class="sb-panel-head">
      <div>
        <h3>1. Välj dina krav <small>valfritt</small></h3>
        <p class="st-sub">Klicka på tecknen i en match för att låsa dem, välj sedan vilken kupong kravet gäller. Procenten är vår sannolikhet, ● = mest sannolika tecknet.</p>
        <details class="sb-howto"${keep("howto-krav")}><summary>Hur funkar det?</summary>
          <ul>
            <li>Ett tecken (1, X eller 2) är en <b>spik</b>, två tecken (1X, X2, 12) en <b>halvgardering</b> och alla tre en <b>helgardering</b>. Klicka igen för att ta bort ett tecken.</li>
            <li><b>Gäller</b>: A+B, bara A, bara B, bara C eller Alla.</li>
            <li><b>A/B/C %</b> under varje match: <b>Av</b> visar hur kupongerna spelat matchen. Slå <b>På</b> och skriv själv hur stor andel av raderna som ska ha 1, X och 2 i A, B och C (varje rad 100 %). <b>Modell</b> = vår chans. En match med egen fördelning spikas aldrig automatiskt.</li>
            <li>Matcher utan krav väljer kupongen själv. Tryck <b>Generera kupong</b> i raden längst ner när du är klar.</li>
            ${seal ? "<li>Klicka på <b>hänglåset</b> när du är klar med en match. En låst match går inte att ändra – klicka på låset igen för att låsa upp. <b>Generera kupong</b> kräver att alla 13 matcher är låsta.</li>" : ""}
          </ul>
        </details>
      </div>
    </div>
    <div class="sb-list">${p.events.map((e, i) => kravRow(e, st.krav[e.eventNumber], picksA[i], seal ? {
      sealed: st.sealed.has(e.eventNumber),
      error: st.rowError[e.eventNumber] || (st.genError?.nr === e.eventNumber ? st.genError.text : ""),
    } : null, { raw: st.shares[e.eventNumber], i, res, busy: st.busy })).join("")}</div>
  </section>`;
  const kr = (c) => (c?.rows ?? 0).toLocaleString("sv-SE");
  const result = res
    ? `<section class="sb-panel sb-result ds-card">
        <h3>2. Din kupong</h3>
        ${st.dirty ? `<p class="st-note ds-notice ds-notice--warning">Du har ändrat kraven – tryck Generera kupong igen för att uppdatera.</p>` : ""}
        <p class="st-sub"><b>Kort sagt:</b> tre filer (A ${kr(res.A)}, B ${kr(res.B)}, C ${kr(res.C)} kr – summan sätter du längst ner) som du laddar upp under Egna rader hos Svenska Spel. A är de troligaste raderna, B de nästa (inga rader gemensamt med A), C väger upp skrällarna folket missar.</p>
        <details class="sb-howto"${keep("howto-kupong")}><summary>Hur funkar det?</summary>
          <ul>
            <li>Inga Gambling Cabin-regler (färger, teckenregler, utdelningsband). Varje kupong är en <b>fil</b> med 1 rad per krona – summan för A, B och C sätter du längst ner (500 kr som standard) som du laddar upp under <b>Egna rader</b> hos Svenska Spel.</li>
            <li><b>Spikar:</b> omgångens 2 starkaste favoriter (vår procent) spikas i alla tre kupongerna. Folkets streck spelar ingen roll för spikarna. I bakkörningen satt båda spikarna i ungefär varannan omgång. Dina egna låsta spikar räknas in.</li>
            <li><b>A:</b> de troligaste raderna där 13 rätt ger minst 30 000 kr. Golvet finns för att en 13:a ska vara värd något – utan det blev 13-rättarna 500–5 000 kr i bakkörningen.</li>
            <li><b>B:</b> de nästa raderna som inte finns i A, med extra vikt på tecken A saknar. A och B har inga rader gemensamt, så A+B är ett system på ${kr(res.A)} + ${kr(res.B)} rader.</li>
            <li><b>C:</b> rader där underspelade tecken – vår chans minst 20 % och minst 1,3 gånger folkets streck – väger mer. Det är skrällarna folket missar. C är fristående från A och B.</li>
            <li>Skrällspikarna överst på sidan ligger inte i kupongerna – lägg en som krav om du vill chansa.</li>
            <li>⚠ i tabellen = tecken som just den kupongen brukar ha fel på (minst 30 % missar i bakkörningen), röd = oftare än vår egen chans sa.</li>
          </ul>
        </details>
        ${streckNote(p, st)}
        <p class="st-note ds-notice"><b>Rekommendation:</b> spela kupong A, och B om du vill täcka mer. I bakkörningen (kupongarkivet) gav A ${p.product === "stryktipset" ? "ca 120 % tillbaka per krona (169 omgångar)" : "ca 117 % tillbaka (183 omgångar)"} – men det bygger på en eller två 13-rättare. Svenska Spel betalar tillbaka 65 %, så räkna med att förlora över tid – spela för en summa du klarar att förlora.</p>
        ${couponTable(p, res)}
        <div class="sb-coupons">${couponCard(res.A, "A", p, res)}${couponCard(res.B, "B", p, res)}${couponCard(res.C, "C", p, res)}</div>
      </section>`
    : st.busy
      ? `<section class="sb-panel sb-result ds-card">
        <h3>2. Din kupong</h3>
        <p class="st-sub" role="status" aria-live="polite">Räknar fram kupongerna med ${p.open ? "live-streck" : "hämtningens streck"} – det tar en stund (upp till en halv minut). Du kan läsa matcherna under tiden.</p>
      </section>`
      : "";
  // Matchkorten visar den genererade kupongen (eller hämtningens kupong A innan något genererats)
  const events = p.events.map((e, i) => ({ ...e, systemPick: picksA[i], systemPickB: res?.B?.picks[i] || null }));
  const pv = { ...p, reducedB: { split: false } }; // B är alltid ett eget system här, visa B-chippen
  const miss = missPanel(p, events, { bCoupon: res?.B || null, actions: true, kravFor: (nr) => st.krav[nr] });
  const matches = `<details class="sb-panel st-matches st-fold ds-card"${keep("matches")}>
    <summary><h3>3. Matcherna</h3><small>analys per match</small></summary>
    ${legend()}
    <div class="st-list">${events.map((e) => matchCard(pv, e)).join("")}</div>
  </details>`;
  const stats = `<details class="sb-panel st-history st-fold ds-card"${keep("stats")}>
    <summary><h3>Statistik &amp; historik</h3><small>Vanliga missar, tipsen per liga, färgerna, backtest och metod</small></summary>
    <div class="st-history-body">${miss.stats}${extras}</div>
  </details>`;
  // Sticky åtgärdsrad: alltid nåbar, oavsett var på sidan man är
  const bar = `<div class="sb-actionbar${st.dirty ? " is-dirty" : ""}" role="region" aria-label="Kupongåtgärder">
    <span class="sb-budgets">${BUDGET_SYS.map((sys) => `<label class="sb-budget" title="Summa för kupong ${sys}. 1 kr per rad, ${FILE_BUDGET.min}–${FILE_BUDGET.max.toLocaleString("sv-SE")} kr. Tryck Generera kupong efteråt.">${sys}<input type="number" min="${FILE_BUDGET.min}" max="${FILE_BUDGET.max}" step="1" inputmode="numeric" data-file-budget="${sys}" value="${fileBudget[sys]}" aria-label="Summa kupong ${sys} i kronor"${st.busy ? " disabled" : ""}><span>kr</span></label>`).join("")}</span>
    <span class="sb-actionbar-txt">${n ? `<b>${n}</b> krav ${n === 1 ? "valt" : "valda"}` : "Inga krav valda"}${seal ? ` · <span class="sb-seal-count${nSealed === p.events.length ? " is-done" : ""}">🔒 <b>${nSealed}</b>/${p.events.length} låsta</span>` : ""}${st.dirty ? `<span class="sb-dirty"> · ändrat<span class="sb-dirty-long"> – generera igen</span></span>` : ""}${st.genError ? `<span class="sb-gen-err" role="alert">${esc(st.genError.text)}</span>` : ""}</span>
    <button type="button" class="btn-ghost ds-btn ds-btn--secondary" id="sb-clear"${nClear ? "" : " disabled"} title="${seal ? "Tar bort kraven på olåsta matcher" : "Tar bort alla krav"}">Rensa</button>
    <button type="button" class="btn-fetch sb-generate ds-btn ds-btn--primary" id="sb-generate"${st.busy ? " disabled" : ""}><span class="btn-label">${st.busy ? "Genererar…" : "Generera kupong"}</span></button>
  </div>`;
  view.innerHTML = `${head}${data.error ? `<p class="st-note bad ds-notice ds-notice--danger">Kunde inte uppdatera: ${esc(data.error)}</p>` : ""}${skrallTipBox(p, res)}${top}${picker}${result}${miss.tur}${riskPanel(p)}${matches}${stats}${bar}`;
}

function handleB(ev) {
  const p = data?.products?.find((x) => x.product === product);
  if (!p) return false;
  const st = bState(p);
  const row = ev.target.closest(".sb-row");
  const signBtn = ev.target.closest(".sb-sign");
  const scopeBtn = ev.target.closest(".sb-scope button");
  const seal = usesSeal(p);
  const sealBtn = ev.target.closest("[data-seal]");
  if (seal && sealBtn) {
    const nr = Number(sealBtn.dataset.seal);
    if (st.sealed.has(nr)) {
      st.sealed.delete(nr);
      delete st.rowError[nr];
    } else {
      const why = rowProblem(st, nr);
      if (why) {
        st.rowError[nr] = `Kan inte låsa: ${why}. Rätta till 100 % först.`;
      } else {
        st.sealed.add(nr);
        delete st.rowError[nr];
        if (st.genError?.nr === nr) st.genError = null;
      }
    }
    saveSealed(p, st);
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    return true;
  }
  // Låst match: inget i raden går att ändra (bara låset och turförklaringen)
  if (seal && row && st.sealed.has(Number(row.dataset.ev)) && ev.target.closest(".sb-sign, .sb-scope button, [data-defall-toggle], [data-defall-model], .sb-tur-add")) return true;
  if (row) delete st.rowError[row.dataset.ev];
  if (row && signBtn) {
    const nr = row.dataset.ev, s = signBtn.dataset.sign;
    const cur = st.krav[nr]?.signs || "";
    const next = SIGNS.filter((x) => (x === s ? !cur.includes(x) : cur.includes(x))).join("");
    if (next) st.krav[nr] = { signs: next, scope: st.krav[nr]?.scope || "both" };
    else delete st.krav[nr];
    saveKrav(p, st);
    render();
    return true;
  }
  if (row && scopeBtn && st.krav[row.dataset.ev]) {
    st.krav[row.dataset.ev].scope = scopeBtn.dataset.scope;
    saveKrav(p, st);
    render();
    return true;
  }
  // A/B/C %: På = egna andelar per kupong, Av = kupongen väljer fritt. På tar samma % som Av visade (så kupongerna
  // spelat), annars senaste På-värden, annars modellen.
  const shareToggle = ev.target.closest("[data-defall-toggle]");
  const shareModel = ev.target.closest("[data-defall-model]");
  if (row && (shareToggle || shareModel)) {
    const nr = Number(row.dataset.ev);
    const i = p.events.findIndex((e) => e.eventNumber === nr);
    if (shareModel) st.shares[nr] = modelSharePair(p.events[i]);
    else if (st.shares[nr]) {
      st.sharesPrev[nr] = st.shares[nr];
      delete st.shares[nr];
    } else st.shares[nr] = sharePairFromResult(st.result, i) || normalizeSharePair(st.sharesPrev[nr]) || modelSharePair(p.events[i]);
    saveKrav(p, st);
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    return true;
  }
  // Turmatcher: lägg tecknet som oftast kom i stället som krav i kupong B
  const turBtn = ev.target.closest(".sb-tur-add");
  if (turBtn || ev.target.closest(".sb-tur-all")) {
    const btns = turBtn ? [turBtn] : [...view.querySelectorAll(".sb-tur-add")];
    for (const b of btns) {
      if (["both", "A", "all"].includes(st.krav[b.dataset.ev]?.scope)) continue; // kupong A:s krav ligger kvar
      if (seal && st.sealed.has(Number(b.dataset.ev))) continue;
      st.krav[b.dataset.ev] = { signs: b.dataset.signs, scope: "B" };
    }
    saveKrav(p, st);
    render();
    return true;
  }
  if (ev.target.closest("#sb-clear")) {
    if (seal) {
      for (const nr of Object.keys(st.krav)) if (!st.sealed.has(Number(nr))) delete st.krav[nr];
    } else st.krav = {};
    saveKrav(p, st);
    render();
    return true;
  }
  if (ev.target.closest("#sb-generate")) {
    if (!seal) {
      const bad = p.events.find((e) => rowProblem(st, e.eventNumber));
      st.genError = bad ? { nr: bad.eventNumber, text: `Match ${bad.eventNumber}: ${rowProblem(st, bad.eventNumber)}. Rätta till 100 % först.` } : null;
      if (st.genError) {
        render();
        view.querySelector(`.sb-row[data-ev="${bad.eventNumber}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
        return true;
      }
    }
    if (seal) {
      st.genError = firstSealProblem(p, st);
      if (st.genError) {
        render();
        const bad = view.querySelector(`.sb-row[data-ev="${st.genError.nr}"]`);
        bad?.scrollIntoView({ block: "center", behavior: "smooth" });
        bad?.querySelector(".sb-defall-edit.is-bad input, [data-seal]")?.focus({ preventScroll: true });
        return true;
      }
    }
    syncFileBudgetFromDom();
    st.busy = true;
    render();
    // Hämtar live-streck och genererar sedan i bakgrunden (stryk-worker.js)
    liveGenerate(p, st).then(() => {
      st.busy = false;
      st.dirty = budgetChanged(st);
      render();
      view.querySelector(".sb-result")?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return true;
  }
  return false;
}

function syncFileBudgetFromDom() {
  for (const sys of BUDGET_SYS) {
    const inp = view.querySelector(`input[data-file-budget="${sys}"]`);
    if (inp) fileBudget[sys] = clampFileRows(inp.value, fileBudget[sys]);
  }
  saveFileBudget();
}
// Ändrad summa: markera "ändrat – generera igen" utan att rita om (fokus i fältet behålls); vid change sparas den
function applyFileBudgetInput(inp, { save }) {
  const sys = inp.dataset.fileBudget;
  if (!BUDGET_SYS.includes(sys)) return;
  const v = clampFileRows(inp.value, fileBudget[sys]);
  fileBudget[sys] = v;
  if (save) {
    inp.value = v;
    saveFileBudget();
  }
  const p = data?.products?.find((x) => x.product === product);
  const st = p ? bState(p) : null;
  if (!st?.result || st.dirty || !budgetChanged(st)) return;
  st.dirty = true;
  view.querySelector(".sb-actionbar")?.classList.add("is-dirty");
  const txt = view.querySelector(".sb-actionbar-txt");
  if (txt && !txt.querySelector(".sb-dirty")) txt.insertAdjacentHTML("beforeend", `<span class="sb-dirty"> · ändrat<span class="sb-dirty-long"> – generera igen</span></span>`);
}
// A/B/C %: live-summa per rad (rött om inte 100 %) utan att rita om, spara vid change
function applyShareInput(inp, { save }) {
  const p = data?.products?.find((x) => x.product === product);
  if (!p) return;
  const st = bState(p);
  const box = inp.closest(".sb-defall");
  const nr = Number(box?.dataset.ev);
  const sys = inp.dataset.defallSys;
  if (!nr || !SHARE_SYS.includes(sys) || (usesSeal(p) && st.sealed.has(nr))) return;
  if (st.rowError[nr] || st.genError?.nr === nr) {
    delete st.rowError[nr];
    if (st.genError?.nr === nr) st.genError = null;
    box.closest(".sb-row")?.classList.remove("is-error");
    box.closest(".sb-row")?.querySelector(".sb-row-err")?.remove();
    view.querySelector(".sb-gen-err")?.remove();
  }
  const pair = normalizeSharePair(st.shares[nr]) || modelSharePair(p.events.find((e) => e.eventNumber === nr));
  const cur = [...pair[sys]];
  const i = Number(inp.dataset.defall);
  cur[i] = clampShare(inp.value);
  if (save && Number(inp.value) !== cur[i]) inp.value = String(cur[i]);
  pair[sys] = cur;
  st.shares[nr] = pair;
  const chk = shareSumMsg(cur);
  const edit = box.querySelector(`.sb-defall-edit[data-defall-sys="${sys}"]`);
  edit?.classList.toggle("is-bad", !chk.ok);
  const sumEl = edit?.querySelector("[data-defall-sum]");
  if (sumEl) {
    sumEl.textContent = chk.text;
    sumEl.classList.toggle("is-bad", !chk.ok);
  }
  const allOk = SHARE_SYS.every((s) => shareSumMsg(pair[s]).ok);
  const hint = box.querySelector(".sb-defall-hint");
  if (hint) {
    hint.textContent = allOk ? "Tryck Generera kupong så byggs filerna med din fördelning" : "Rätta varje rad (A, B och C) till 100 % innan du genererar";
    hint.classList.toggle("is-bad", !allOk);
  }
  if (st.result && !st.dirty) {
    st.dirty = true;
    view.querySelector(".sb-actionbar")?.classList.add("is-dirty");
    const txt = view.querySelector(".sb-actionbar-txt");
    if (txt && !txt.querySelector(".sb-dirty")) txt.insertAdjacentHTML("beforeend", `<span class="sb-dirty"> · ändrat<span class="sb-dirty-long"> – generera igen</span></span>`);
  }
  if (save) saveKrav(p, st);
}
view.addEventListener("input", (ev) => {
  const bud = ev.target.closest("input[data-file-budget]");
  if (bud) applyFileBudgetInput(bud, { save: false });
  const sh = ev.target.closest("input[data-defall]");
  if (sh) applyShareInput(sh, { save: false });
});
view.addEventListener("change", (ev) => {
  const bud = ev.target.closest("input[data-file-budget]");
  if (bud) applyFileBudgetInput(bud, { save: true });
  const sh = ev.target.closest("input[data-defall]");
  if (sh) applyShareInput(sh, { save: true });
});

view.addEventListener("click", (ev) => {
  if (ev.target.closest("#st-fetch")) {
    load(true);
    return;
  }
  const tb = ev.target.closest(".tur-btn");
  if (tb) {
    const key = `${product}|${tb.dataset.ev}`;
    if (turOpen.has(key)) turOpen.delete(key);
    else turOpen.add(key);
    render();
    if (tb.dataset.scroll && turOpen.has(key)) view.querySelector(`.sb-row[data-ev="${tb.dataset.ev}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }
  if (handleB(ev)) return;
  const btn = ev.target.closest(".st-analyze");
  if (btn) {
    const key = btn.closest(".st-match").dataset.key;
    if (open.has(key)) open.delete(key);
    else open.add(key);
    render();
    if (open.has(key)) view.querySelector(`.st-match[data-key="${CSS.escape(key)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
});

// Starta i senast valda flik
let saved = "tips";
try {
  saved = localStorage.getItem("betting.view") || "tips";
} catch {
  /* privat lage */
}
// Adressen går först, annars senast valda flik (äldre sparat värde "stryktips" = Stryktipset)
if (saved === "stryktips" || saved === "stryktipset-b") saved = "stryktipset";
setView(route.view || (POOLS.includes(saved) || saved === "hastar" ? saved : "tips"));
