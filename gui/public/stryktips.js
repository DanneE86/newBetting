// Flik "Stryktipset": kupong fran Svenska Spel + analys per match (data fran /api/stryktips).
const view = document.getElementById("stryktips-view");
const tabs = [...document.querySelectorAll(".view-tab")];
const SIGNS = ["1", "X", "2"];

let data = null;
let product = null;
// Direktlänk: #stryktips/<produkt>/reducera öppnar kupongen med det reducerade systemet utfällt,
// #stryktips/backtest öppnar backtestet (Stryktipset)
const deep = location.hash.match(/^#stryktips(?:\/(\w+))?(\/reducera)?/);
const showBacktest = deep?.[1] === "backtest";
if (deep?.[1] && !showBacktest) product = deep[1];
if (showBacktest) product = "stryktipset";
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
      <div class="st-prob-top"><span class="st-sign">${s}</span><span class="st-team">${esc(names[i])}</span>${inSys ? `<span class="st-in${col ? ` c-${col}` : ""}" title="Tecknet spelas · färg efter folkets streck">${col ? COLOR_LABEL[col] : "✓ spelas"}</span>` : ""}${e.systemPickB?.signs.includes(s) ? `<span class="st-b" title="Spelas i system B">B</span>` : ""}<strong>${pct(e.final[i])}</strong></div>
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

// Sparade system (sparas automatiskt när kupongen är öppen) och hur det gick
function historyBox(history, krFmt) {
  if (!history?.length) return "";
  const evalText = (ev) => {
    const classes = [13, 12, 11, 10].filter((c) => ev.perClass[c]).map((c) => `${ev.perClass[c]} × ${c} rätt`).join(", ");
    return `bästa rad <b>${ev.best} rätt</b>${classes ? ` (${classes})` : ""} · vinst <b>${krFmt(ev.winnings)} kr</b> · netto <b class="${ev.net >= 0 ? "pos" : "neg"}">${ev.net >= 0 ? "+" : ""}${krFmt(ev.net)} kr</b>`;
  };
  const rowsHtml = history.map((h) => {
    const head = `<strong>${esc(h.productName)} omgång ${h.drawNumber}</strong> · stänger ${esc((h.closeTime || "").slice(0, 16).replace("T", " "))}`;
    const snapText = (x) => `sparad ${esc(x.at.slice(0, 10))}: ${x.rows} rader · ${krFmt(x.cost)} kr · minst ${x.rules.signMin.join("-")} · utdelning ≥ ${krFmt(x.rules.payoutMin)} kr`;
    const saved = snapText(h.saved);
    const savedB = h.savedB ? snapText(h.savedB) : "";
    if (!h.evaluation) {
      return `<li>${head}<br><small>A ${saved}</small>${h.pairA ? `<br><small><b>Paret A+B</b> – A ${snapText(h.pairA)} · B ${savedB} · totalt ${krFmt(h.pairA.cost + h.savedB.cost)} kr</small>` : savedB ? `<br><small>B ${savedB}</small>` : ""}<br><span class="st-wait">Väntar på facit – räknas ut automatiskt när omgången är avgjord.</span></li>`;
    }
    return `<li>${head} · rätt rad <code>${esc(h.result.outcomes)}</code><br><small>${saved}</small><br>System A (först sparad): ${evalText(h.evaluation.saved)}${h.evaluation.pairA ? `<br><b>Paret A+B</b> (${krFmt(h.pairA.cost + h.savedB.cost)} kr): A ${evalText(h.evaluation.pairA)}<br>&nbsp;&nbsp;B ${evalText(h.evaluation.savedB)} · <b>paret netto ${krFmt(h.evaluation.pairA.net + h.evaluation.savedB.net)} kr</b>` : h.evaluation.savedB ? `<br>System B: ${evalText(h.evaluation.savedB)}` : ""}</li>`;
  }).join("");
  const done = history.filter((h) => h.evaluation);
  const total = done.reduce((s, h) => s + h.evaluation.saved.net, 0);
  return `<details class="st-method st-history" open><summary>Sparade system (${history.length})${done.length ? ` · system A totalt netto ${total >= 0 ? "+" : ""}${krFmt(total)} kr på ${done.length} omgångar` : ""}</summary><ul>${rowsHtml}</ul></details>`;
}

// Backtest: gammal mot ny modellvikt + resultat per omgång (scripts/backtest-stryktipset.mjs)
function backtestBox(list, krFmt) {
  if (!list?.length) return "";
  const old = list.find((b) => b.key === "old"), neu = list.find((b) => b.key === "new");
  const signed = (x) => `<b class="${x >= 0 ? "pos" : "neg"}">${x >= 0 ? "+" : ""}${krFmt(x)} kr</b>`;
  const better = (a, b, higher = true) => (a == null || b == null || a === b ? "" : (higher ? b > a : b < a) ? " class=\"up\"" : " class=\"down\"");
  const rows = (k) => old && neu ? [
    ["Netto", signed(old[k].net), signed(neu[k].net), better(old[k].net, neu[k].net)],
    ["Vinst / insats", `${krFmt(old[k].winnings)} / ${krFmt(old[k].cost)} kr`, `${krFmt(neu[k].winnings)} / ${krFmt(neu[k].cost)} kr`, better(old[k].winnings, neu[k].winnings)],
    ["Rader med 10+ rätt", old[k].ge10, neu[k].ge10, better(old[k].ge10, neu[k].ge10)],
    ["Rader med 11+ rätt", old[k].ge11, neu[k].ge11, better(old[k].ge11, neu[k].ge11)],
    ["Rader med 12+ rätt", old[k].ge12, neu[k].ge12, better(old[k].ge12, neu[k].ge12)],
    ["Chans 13 rätt / omgång", `1 på ${old[k].chance}`, `1 på ${neu[k].chance}`, better(old[k].chance, neu[k].chance, false)],
  ].map(([l, a, b, c]) => `<tr><th>${k} · ${l}</th><td>${a}</td><td${c}>${b}</td></tr>`).join("") : "";
  const cmp = old && neu ? `<table class="st-bt">
      <thead><tr><th>${old.draws} omgångar ${esc(old.from)} – ${esc(old.to)} (${old.matches} matcher)</th><th>Före: modell 35 %</th><th>Efter: modell 10 %</th></tr></thead>
      <tbody>${rows("A")}${rows("B")}
        <tr><th>Logloss (lägre = bättre)</th><td>${old.logLoss.final}</td><td${better(old.logLoss.final, neu.logLoss.final, false)}>${neu.logLoss.final}</td></tr>
        <tr><th>Kryss utfall / vår förväntan / folket</th><td colspan="2">${Math.round(neu.drawRate.actual * 100)} % / ${Math.round(neu.drawRate.predicted * 100)} % / ${Math.round(neu.drawRate.folk * 100)} %</td></tr>
      </tbody></table>` : "";
  const perDraw = neu?.perDraw?.length ? `<details class="st-bt-draws"><summary>Resultat per omgång (${neu.perDraw.length}, modell 10 %)</summary><table class="st-bt">
      <thead><tr><th>Omgång</th><th>Kryss</th><th>13 rätt gav</th><th>A bästa</th><th>A vinst</th><th>B bästa</th><th>B vinst</th></tr></thead>
      <tbody>${neu.perDraw.map((d) => `<tr><th>${d.n} · ${esc(d.date)}</th><td>${d.x}</td><td>${esc(String(d.prize13 || "").replace(",00", ""))} kr (${d.winners13})</td><td${d.aBest >= 11 ? " class=\"up\"" : ""}>${d.aBest}</td><td>${krFmt(d.aWin || 0)}</td><td${d.bBest >= 11 ? " class=\"up\"" : ""}>${d.bBest}</td><td>${krFmt(d.bWin || 0)}</td></tr>`).join("")}</tbody></table></details>` : "";
  const autumn = list.find((b) => b.key === "autumn");
  return `<details class="st-method st-backtest"${showBacktest ? " open" : ""}><summary>Backtest – vad som blivit bättre (säsong 2025/26, alla omgångar med PL-match)</summary>
    <p>Samma system A (5-3-2) och B (4-3-3) som i dag, 350–400 kr, utdelning ≥ 30 000 kr, räknat mot facit och Svenska Spels verkliga utdelning. Ändringen: vår lagmodell väger 10 % i stället för 35 % – oddsen var träffsäkrare. Grönt = bättre efter ändringen.</p>
    ${cmp}${perDraw}
    ${autumn ? `<p>Hösten 2026 (${autumn.draws} omgångar): A ${signed(autumn.A.net)}, B ${signed(autumn.B.net)} – rader med 11+ rätt: A ${autumn.A.ge11}, B ${autumn.B.ge11}.</p>` : ""}
    <p class="st-note-small">Obs: backtestet använder startodds (Svenska Spel sparar inte slutodds). Nettot styrs av enstaka träffar – återbetalningen är 65 %, så förväntat utfall är negativt. Alla lärdomar: docs/analys/stryktips-lardomar.md.</p>
  </details>`;
}

// Startelvor/frånvaro – samma data som Oddset (ESPN-elva för PL/Championship, annars FPL-skador för PL)
function lineupRow(e) {
  const l = e.lineup;
  if (!l) return "";
  const pctShare = (x) => `${Math.round((x || 0) * 100)} %`;
  const status = l.status === "confirmed"
    ? `<span class="st-lu ok">Startelvor bekräftade (ESPN)</span>`
    : l.status === "pending" ? `<span class="st-lu wait">Elvor ej släppta än</span>` : "";
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
        ${sys ? `<span class="st-tip ${sys.signs.length === 1 ? "spik" : sys.signs.length === 2 ? "halv" : "hel"}" title="System A – grundrad (reduceras sedan)">${e.systemPickB ? "A: " : ""}${esc(sys.type)} ${esc(sys.signs.split("").join(" + "))}</span>` : `<span class="st-tip">Tips ${esc(e.tip)}</span>`}
        ${e.systemPickB ? `<span class="st-tip sysb" title="System B – går emot A">B: ${esc(e.systemPickB.type)} ${esc(e.systemPickB.signs.split("").join(" + "))}</span>` : ""}
        ${verdictChip(e)}
        ${resultChip(e)}
      </div>
    </header>
    ${probRow(e)}
    ${svsRow(e)}
    ${lineupRow(e)}
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
  const rb = p.reducedB;
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  const gcLink = r?.gamblingCabinUrl
    ? (p.open
      ? `<a class="st-gc" href="${esc(r.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna i Gambling Cabin – förifyllt, tryck Reducera → ${krFmt(r.cost)} kr</a>`
      : `<p class="st-gc-off">Länken till Gambling Cabin fungerar när kupongen är öppen – den här omgången är avgjord.</p>`)
    : "";
  const reducedBox = r ? `<details class="st-method st-reduced"${showReduced ? " open" : ""}><summary>Reducerat system – ${r.rows} rader (${krFmt(r.cost)} kr) · visa regler och rader</summary>
      <ol class="st-steps">
        <li><b>Grundrad</b> ${s.rows} rader: spikar, halv- och helgarderingar där de höjer träffchansen mest (se chippen på varje match).</li>
        <li><b>Utdelningsreducering</b>: bara rader som beräknas ge minst ${krFmt(r.rules.payoutMin)} kr för 13 rätt (${r.afterPayout} rader kvar). Samma beräkning som Gambling Cabin: folkets streck och omsättning ${krFmt(r.rules.turnover / 1e6)} milj kr.</li>
        <li><b>Teckenreducering</b>: minst <b>${r.rules.signMin[0]}</b> ettor, <b>${r.rules.signMin[1]}</b> kryss och <b>${r.rules.signMin[2]}</b> tvåor per rad (${r.rules.signMin.join("-")}). Max är alltid fullt.</li>
        <li><b>Budget</b> 350–400 kr: grundrad och utdelningsgräns (aldrig under 30 000 kr) väljs så att det blir 350–400 rader med högst chans till 13 rätt. Fasta teckenregler: system A minst 5-3-2, system B minst 4-3-3 – alltid minst 3 kryss.</li>
      </ol>
      <p>Chans 13 rätt: ${oneIn(r.hitAll)} (grundraden ${oneIn(r.grundHit)}). Beräknad utdelning om systemet tar 13 rätt: ca ${krFmt(r.expectedPayout || 0)} kr. Utdelningen är en uppskattning från streckprocenten och kan skilja sig från den verkliga.</p>
      ${gcLink}
      <pre class="st-rows">${r.rowList.map((row, i) => `${String(i + 1).padStart(3, " ")}  ${row}`).join("\n")}</pre>
    </details>` : "";
  const summary = `<div class="st-summary">
    ${p.note ? `<p class="st-note">${esc(p.note)}</p>` : ""}
    ${data.error ? `<p class="st-note bad">Kunde inte uppdatera: ${esc(data.error)}</p>` : ""}
    <div class="st-stats">
      ${r ? `<div><span class="k">${rb ? "System A" : "Reducerat system"}</span><strong>${r.rows} rader · ${krFmt(r.cost)} kr</strong><small>grundrad ${s.rows} → ${r.rows} · utdelning ≥ ${krFmt(r.rules.payoutMin)} kr · minst ${r.rules.signMin.join("-")} · chans 13 rätt ${oneIn(r.hitAll)}</small>${r.gamblingCabinUrl && p.open ? `<a class="st-gc small" href="${esc(r.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna i Gambling Cabin →</a>` : ""}</div>` : s ? `<div><span class="k">Systemförslag</span><strong>${s.rows} rader</strong><small>chans 13 rätt ${oneIn(s.hitAll)}</small></div>` : ""}
      ${rb ? `<div class="sysb"><span class="k">System B – går emot A</span><strong>${rb.rows} rader · ${krFmt(rb.cost)} kr</strong><small>grundrad ${rb.grundRows} → ${rb.rows} · utdelning ≥ ${krFmt(rb.rules.payoutMin)} kr · minst ${rb.rules.signMin.join("-")} · ${rb.sameSingles} gemensam spik · chans 13 rätt ${oneIn(rb.hitAll)}</small>${rb.gamblingCabinUrl && p.open ? `<a class="st-gc small" href="${esc(rb.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna B i Gambling Cabin →</a>` : ""}</div>` : ""}
      ${p.result ? `<div><span class="k">Facit – systemet fick</span><strong>${rb && p.result.reducedCorrectB != null ? `A ${p.result.reducedCorrect} · B ${p.result.reducedCorrectB}` : p.result.reducedCorrect ?? p.result.systemCorrect} av ${p.result.total} rätt</strong><small>rätt rad ${p.events.map((e) => e.result?.outcome || "–").join("")}</small></div>` : ""}
      ${p.result?.experts?.length ? `<div><span class="k">Svenska Spels experter</span><strong>${p.result.experts.map((x) => `${x.correct}/${x.tipped}`).join(" · ")} rätt</strong><small>${p.result.experts.map((x) => esc(x.author)).join(" · ")}</small></div>` : ""}
      ${p.result?.distribution?.[0] ? `<div><span class="k">Utdelning 13 rätt</span><strong>${esc(p.result.distribution[0].amount)} kr</strong><small>${p.result.distribution[0].winners} vinnare</small></div>` : ""}
    </div>
    ${reducedBox}
    ${historyBox(data.history, krFmt)}
    ${backtestBox(data.backtest, krFmt)}
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
