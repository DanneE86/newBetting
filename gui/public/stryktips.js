// Flik "Stryktipset": kupong fran Svenska Spel + analys per match (data fran /api/stryktips).
const view = document.getElementById("stryktips-view");
const tabs = [...document.querySelectorAll(".view-tab")];
const SIGNS = ["1", "X", "2"];

let data = null;
let product = null;
let loading = false;
const open = new Set(); // expanderade analyser (produkt|matchnr)

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (p) => (p == null ? "—" : `${Math.round(p * 100)} %`);
const dec = (x) => (x == null ? "—" : Number(x).toFixed(2).replace(".", ","));

function kickoff(iso) {
  if (!iso) return "tid saknas";
  const d = new Date(iso);
  const day = d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "numeric" });
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

function oneIn(p) {
  if (!p) return "—";
  const n = 1 / p;
  return n < 1000 ? `1 på ${Math.round(n)}` : `1 på ${Math.round(n).toLocaleString("sv-SE")}`;
}

// ---------- Flikbyte ----------
function setView(v) {
  const st = v === "stryktips";
  document.body.classList.toggle("view-stryktips", st);
  view.hidden = !st;
  for (const t of tabs) {
    const on = t.dataset.view === v;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
  }
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

tabs.forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));

// ---------- Data ----------
async function load(force = false) {
  loading = true;
  render();
  try {
    const res = await fetch(force ? "/api/stryktips/fetch" : "/api/stryktips", { method: force ? "POST" : "GET" });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
    data = body;
    const ids = (data.products || []).map((p) => p.product);
    if (!product || !ids.includes(product)) {
      // Oppen Stryktipset-kupong forst, annars forsta oppna, annars Stryktipset
      product =
        data.products.find((p) => p.product === "stryktipset" && p.open)?.product ||
        data.products.find((p) => p.open)?.product ||
        ids[0] ||
        null;
    }
  } catch (e) {
    data = { ...(data || {}), error: e.message };
  } finally {
    loading = false;
    render();
  }
}

// ---------- Rendering ----------
function probRow(e) {
  const names = [e.home, "Oavgjort", e.away];
  return `<div class="st-probs">${SIGNS.map((s, i) => {
    const tip = e.tip === s;
    const inSys = e.systemPick?.signs.includes(s);
    const hit = e.result?.outcome === s;
    const sv = e.streckvarde?.[i];
    return `<div class="st-prob${tip ? " tip" : ""}${inSys ? " sys" : ""}${hit ? " hit" : ""}">
      <div class="st-prob-top"><span class="st-sign">${s}</span><span class="st-team">${esc(names[i])}</span><strong>${pct(e.final[i])}</strong></div>
      <div class="st-bar"><span style="width:${Math.round(e.final[i] * 100)}%"></span></div>
      <div class="st-prob-sub">
        <span title="Svenska Spels odds">odds ${dec(e.odds?.[i])}</span>
        <span title="Svenska folkets streckning">folket ${pct(e.folk?.[i])}</span>
        ${sv != null && sv >= 1.2 && e.final[i] >= 0.15 ? `<span class="st-sv" title="Vår sannolikhet / folkets andel">streckvärde ${dec(sv)}</span>` : ""}
      </div>
    </div>`;
  }).join("")}</div>`;
}

function verdictChip(e) {
  const v = e.verdict;
  if (!v) return "";
  if (v.odds == null) return `<span class="st-chip bad">Ej värde · från ${dec(v.minOdds)} (odds saknas)</span>`;
  return `<span class="st-chip ${v.value ? "good" : "bad"}" title="Värde om Svenska Spels odds på ${v.sign} (${dec(v.odds)}) är minst ${dec(v.minOdds)}">${v.value ? "Värde" : "Ej värde"} · från ${dec(v.minOdds)}</span>`;
}

function resultChip(e) {
  if (!e.result) return "";
  const ok = e.result.outcome === e.tip;
  const sysOk = e.systemPick?.signs.includes(e.result.outcome);
  return `<span class="st-chip ${ok ? "good" : sysOk ? "warn" : "bad"}">${ok ? "Rätt" : sysOk ? "Rätt i systemet" : "Fel"} · ${esc(e.result.outcome)} (${esc(e.result.score || "")})</span>`;
}

const BASIS = {
  club: "Odds + lagmodell (form, mål, xG)",
  elo: "Odds + landslags-Elo",
  market: "Endast Svenska Spels odds",
  folk: "Endast Svenska folket (inga odds)",
  none: "Inget underlag",
};

function teamCard(p, side) {
  if (!p) return "";
  const rec = side === "home" ? p.homeRecord : p.awayRecord;
  const recLbl = side === "home" ? "Hemma" : "Borta";
  return `<div class="st-team-card">
    <h4>${esc(p.team)} <small>${esc(p.leagueName)}${p.position ? ` · ${p.position}:a av ${p.of}` : ""}</small></h4>
    <dl>
      <div><dt>Poäng</dt><dd>${p.points} på ${p.played} (${dec(p.ppg)}/match)</dd></div>
      <div><dt>Mål</dt><dd>${p.gf}–${p.ga}</dd></div>
      <div><dt>${recLbl}</dt><dd>${rec.w}V ${rec.d}O ${rec.l}F · ${rec.gf}–${rec.ga}</dd></div>
      ${p.xgfPg != null ? `<div><dt>xG/match</dt><dd>${dec(p.xgfPg)} skapat · ${dec(p.xgaPg)} insläppt</dd></div>` : ""}
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
    <div class="st-grid">
      <table class="st-cmp">
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
        <p><span>Underlag</span><strong>${esc(BASIS[e.basis] || e.basis)}${e.modelWeight ? ` · modellvikt ${Math.round(e.modelWeight * 100)} %` : ""}</strong></p>
      </div>
    </div>
    ${e.homeProfile || e.awayProfile ? `<div class="st-teams">${teamCard(e.homeProfile, "home")}${teamCard(e.awayProfile, "away")}</div>` : ""}
    ${e.h2h?.length ? `<div class="st-h2h"><h4>Inbördes möten</h4><ul>${e.h2h.map((m) => `<li><span>${esc(m.date)}</span> ${esc(m.home)} <b>${esc(m.score)}</b> ${esc(m.away)}</li>`).join("")}</ul></div>` : ""}
  </div>`;
}

function matchCard(p, e) {
  const key = `${p.product}|${e.eventNumber}`;
  const isOpen = open.has(key);
  const sys = e.systemPick;
  return `<article class="st-match${isOpen ? " open" : ""}" data-key="${esc(key)}">
    <header class="st-match-head">
      <span class="st-num">${e.eventNumber}</span>
      <div class="st-title">
        <h3>${esc(e.home)} <span>–</span> ${esc(e.away)}</h3>
        <p><span class="st-kick">${esc(kickoff(e.kickoff))}</span> · ${esc(e.league || "")}</p>
      </div>
      <div class="st-verdict">
        <span class="st-tip" title="Enkelrad">Tips ${esc(e.tip)}</span>
        ${sys ? `<span class="st-chip sys" title="Systemförslag">${esc(sys.signs)} · ${esc(sys.type)}</span>` : ""}
        ${verdictChip(e)}
        ${resultChip(e)}
      </div>
    </header>
    ${probRow(e)}
    <button type="button" class="st-analyze" aria-expanded="${isOpen}">${isOpen ? "Dölj analys" : `Analysera ${esc(e.home)} vs ${esc(e.away)}`}</button>
    ${isOpen ? analysisPanel(e) : ""}
  </article>`;
}

function render() {
  if (view.hidden) return;
  const products = data?.products || [];
  const p = products.find((x) => x.product === product);
  const head = `<div class="st-head">
    <div>
      <p class="eyebrow">Svenska Spel · 13 matcher</p>
      <h2>${esc(p?.productName || "Stryktipset")}${p ? ` <small>omgång ${p.drawNumber}</small>` : ""}</h2>
      <p class="st-sub">${p ? `${p.open ? "Öppen" : "Avgjord"} · ${esc(p.closeDescription || "")}` : "Hämtar kupong…"}${data?.updatedAt ? ` · hämtad ${esc(new Date(data.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }))}` : ""}</p>
    </div>
    <div class="st-actions">
      <div class="filter-pills" role="group" aria-label="Spelform">
        ${products.map((x) => `<button type="button" class="filter-pill${x.product === product ? " active" : ""}" data-product="${esc(x.product)}">${esc(x.productName)}${x.open ? "" : " (avgjord)"}</button>`).join("")}
      </div>
      <button type="button" class="btn-ghost" id="st-fetch" ${loading ? "disabled" : ""}>${loading ? "Hämtar…" : "Hämta från Svenska Spel"}</button>
    </div>
  </div>`;

  if (!p) {
    view.innerHTML = `${head}<p class="st-empty">${loading ? "Hämtar kupong och räknar…" : esc(data?.error || data?.fetchError || "Ingen kupong hittades.")}</p>`;
    return;
  }

  const s = p.system;
  const summary = `<div class="st-summary">
    ${p.note ? `<p class="st-note">${esc(p.note)}</p>` : ""}
    ${data.error ? `<p class="st-note bad">Kunde inte uppdatera: ${esc(data.error)}</p>` : ""}
    <div class="st-stats">
      ${s ? `<div><span class="k">Systemförslag</span><strong>${s.rows} rader</strong><small>chans 13 rätt ${oneIn(s.hitAll)}</small></div>` : ""}
      ${s ? `<div><span class="k">Enkelrad</span><strong>${p.events.map((e) => e.tip).join("")}</strong><small>chans 13 rätt ${oneIn(s.hitSingle)}</small></div>` : ""}
      ${p.result ? `<div><span class="k">Facit</span><strong>${p.result.correct}/${p.result.total} rätt</strong><small>systemet ${p.result.systemCorrect}/${p.result.total}</small></div>` : ""}
      ${p.result?.distribution?.[0] ? `<div><span class="k">Utdelning 13 rätt</span><strong>${esc(p.result.distribution[0].amount)} kr</strong><small>${p.result.distribution[0].winners} vinnare</small></div>` : ""}
    </div>
    <details class="st-method"><summary>Hur räknas procenten?</summary>
      <ul>${Object.values(data.method || {}).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
      <p>Systemförslaget spikar det troligaste tecknet och lägger gardering där den höjer träffchansen mest per extra rad (max ${s?.maxRows ?? 144} rader).</p>
    </details>
  </div>`;

  view.innerHTML = `${head}${summary}<div class="st-list">${p.events.map((e) => matchCard(p, e)).join("")}</div>`;
}

view.addEventListener("click", (ev) => {
  const pill = ev.target.closest("[data-product]");
  if (pill) {
    product = pill.dataset.product;
    render();
    return;
  }
  if (ev.target.closest("#st-fetch")) {
    load(true);
    return;
  }
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
if (location.hash === "#stryktips") saved = "stryktips";
setView(saved === "stryktips" ? "stryktips" : "tips");
