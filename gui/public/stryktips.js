// Flik "Stryktipset": kupong fran Svenska Spel + analys per match (data fran /api/stryktips).
const view = document.getElementById("stryktips-view");
const tabs = [...document.querySelectorAll(".view-tab")];
const SIGNS = ["1", "X", "2"];

let data = null;
let product = null;
// Direktlänk: #stryktips/<produkt>/reducera öppnar kupongen med det reducerade systemet utfällt
const deep = location.hash.match(/^#stryktips(?:\/(\w+))?(\/reducera)?/);
if (deep?.[1]) product = deep[1];
let showReduced = Boolean(deep?.[2]);
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
const COLOR_LABEL = { green: "Grön · favorit", yellow: "Gul", red: "Röd · skräll" };
function probRow(e) {
  const names = [e.home, "Oavgjort", e.away];
  return `<div class="st-probs">${SIGNS.map((s, i) => {
    const inSys = e.systemPick ? e.systemPick.signs.includes(s) : e.tip === s;
    const hit = e.result?.outcome === s;
    const sv = e.streckvarde?.[i];
    const col = inSys && e.colors ? e.colors[i] : null;
    return `<div class="st-prob${inSys ? " tip" : " out"}${col ? ` c-${col}` : ""}${hit ? " hit" : ""}">
      <div class="st-prob-top"><span class="st-sign">${s}</span><span class="st-team">${esc(names[i])}</span>${inSys ? `<span class="st-in${col ? ` c-${col}` : ""}" title="Tecknet spelas · färg efter folkets streck">${col ? COLOR_LABEL[col] : "✓ spelas"}</span>` : ""}<strong>${pct(e.final[i])}</strong></div>
      <div class="st-bar"><span style="width:${Math.round(e.final[i] * 100)}%"></span></div>
      <div class="st-prob-sub">
        <span title="Svenska Spels odds">odds ${dec(e.odds?.[i])}</span>
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

function expertTexts(e) {
  if (!e.experts?.length) return "";
  return `<div class="st-experts"><h4>Svenska Spels expertanalyser</h4>${e.experts.map((x) => `<div class="st-expert"><p class="st-expert-head"><strong>${esc(x.author)}</strong> tippar <b>${esc(x.signs.split("").join(" + ") || "–")}</b></p><p>${esc(x.text)}</p></div>`).join("")}</div>`;
}

function verdictChip(e) {
  const v = e.verdict;
  if (!v) return "";
  if (v.odds == null) return `<span class="st-chip bad">Ej värde · från ${dec(v.minOdds)} (odds saknas)</span>`;
  return `<span class="st-chip ${v.value ? "good" : "bad"}" title="Värde om Svenska Spels odds på ${v.sign} (${dec(v.odds)}) är minst ${dec(v.minOdds)}">${v.value ? "Värde" : "Ej värde"} · från ${dec(v.minOdds)}</span>`;
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
    ${expertTexts(e)}
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
        ${sys ? `<span class="st-tip ${sys.signs.length === 1 ? "spik" : sys.signs.length === 2 ? "halv" : "hel"}" title="Grundrad (reduceras sedan)">${esc(sys.type)} ${esc(sys.signs.split("").join(" + "))}</span>` : `<span class="st-tip">Tips ${esc(e.tip)}</span>`}
        ${verdictChip(e)}
        ${resultChip(e)}
      </div>
    </header>
    ${probRow(e)}
    ${svsRow(e)}
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
    view.innerHTML = `${head}<p class="st-empty">${loading ? "Hämtar kupong och räknar…" : esc(data?.error || data?.fetchError || "Ingen kupong hämtad än – tryck “Hämta från Svenska Spel”.")}</p>`;
    return;
  }

  const s = p.system;
  const r = p.reduced;
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  const gcLink = r?.gamblingCabinUrl
    ? (p.open
      ? `<a class="st-gc" href="${esc(r.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna i Gambling Cabin – förifyllt, tryck Reducera → ${krFmt(r.cost)} kr</a>`
      : `<p class="st-gc-off">Länken till Gambling Cabin fungerar när kupongen är öppen – den här omgången är avgjord.</p>`)
    : "";
  const reducedBox = r ? `<details class="st-method st-reduced"${showReduced ? " open" : ""}><summary>Reducerat system – ${r.rows} rader (${krFmt(r.cost)} kr) · visa regler och rader</summary>
      <ol class="st-steps">
        <li><b>Grundrad</b> ${s.rows} rader: spikar, halv- och helgarderingar där de höjer träffchansen mest (se chippen på varje match).</li>
        <li><b>Färgreducering</b> efter Svenska folkets streck: <span class="st-dot green"></span>grön ≥ ${Math.round(r.rules.colorGreen * 100)} %, <span class="st-dot yellow"></span>gul, <span class="st-dot red"></span>röd ≤ ${Math.round(r.rules.colorRed * 100)} %. Regel: högst ${r.rules.greenMax} gröna och ${r.rules.redMin}–${r.rules.redMax} röda per rad.</li>
        <li><b>Teckenreducering</b>: ${r.rules.xMin}–${r.rules.xMax} kryss per rad.</li>
        <li><b>Budget</b> 350–400 kr: av alla regelkombinationer som ger 350–400 rader är den vald som ger högst förväntad återbetalning (vår chans × beräknad utdelning från folkets streck).</li>
      </ol>
      <p>Chans 13 rätt: ${oneIn(r.hitAll)} (grundraden ${oneIn(r.grundHit)}). Beräknad utdelning om systemet tar 13 rätt: ca ${krFmt(r.expectedPayout || 0)} kr. Utdelningen är en uppskattning från streckprocenten och kan skilja sig från den verkliga.</p>
      ${gcLink}
      <pre class="st-rows">${r.rowList.map((row, i) => `${String(i + 1).padStart(3, " ")}  ${row}`).join("\n")}</pre>
    </details>` : "";
  const summary = `<div class="st-summary">
    ${p.note ? `<p class="st-note">${esc(p.note)}</p>` : ""}
    ${data.error ? `<p class="st-note bad">Kunde inte uppdatera: ${esc(data.error)}</p>` : ""}
    <div class="st-stats">
      ${r ? `<div><span class="k">Reducerat system</span><strong>${r.rows} rader · ${krFmt(r.cost)} kr</strong><small>grundrad ${s.rows} → ${r.rows} · chans 13 rätt ${oneIn(r.hitAll)}</small>${r.gamblingCabinUrl && p.open ? `<a class="st-gc small" href="${esc(r.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna i Gambling Cabin →</a>` : ""}</div>` : s ? `<div><span class="k">Systemförslag</span><strong>${s.rows} rader</strong><small>chans 13 rätt ${oneIn(s.hitAll)}</small></div>` : ""}
      ${p.result ? `<div><span class="k">Facit – systemet fick</span><strong>${p.result.reducedCorrect ?? p.result.systemCorrect} av ${p.result.total} rätt</strong><small>rätt rad ${p.events.map((e) => e.result?.outcome || "–").join("")}</small></div>` : ""}
      ${p.result?.experts?.length ? `<div><span class="k">Svenska Spels experter</span><strong>${p.result.experts.map((x) => `${x.correct}/${x.tipped}`).join(" · ")} rätt</strong><small>${p.result.experts.map((x) => esc(x.author)).join(" · ")}</small></div>` : ""}
      ${p.result?.distribution?.[0] ? `<div><span class="k">Utdelning 13 rätt</span><strong>${esc(p.result.distribution[0].amount)} kr</strong><small>${p.result.distribution[0].winners} vinnare</small></div>` : ""}
    </div>
    ${reducedBox}
    <details class="st-method"><summary>Hur räknas procenten?</summary>
      <ul>${Object.values(data.method || {}).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </details>
  </div>`;

  view.innerHTML = `${head}${summary}${r ? `<p class="st-legend"><b>Färger</b> (efter Svenska folkets streck, samma som i Gambling Cabin): <span class="st-in c-green">Grön · favorit</span> folket ≥ ${Math.round(r.rules.colorGreen * 100)} % <span class="st-in c-yellow">Gul</span> mellan <span class="st-in c-red">Röd · skräll</span> folket ≤ ${Math.round(r.rules.colorRed * 100)} % · gråa tecken spelas inte</p>` : ""}<div class="st-list">${p.events.map((e) => matchCard(p, e)).join("")}</div>`;
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
if (deep) saved = "stryktips";
setView(saved === "stryktips" ? "stryktips" : "tips");
