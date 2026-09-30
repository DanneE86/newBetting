// Flik "Stryktipset": kupong fran Svenska Spel + analys per match (data fran /api/stryktips).
// En sida per spel: användaren låser krav (1, X, 2, 1X, X2, 12, 1X2) för kupong A, B eller båda, och resten av
// kupongerna genereras i webbläsaren (stryk-engine.js).
import { generateCoupons, kravSigns } from "/stryk-engine.js";

const view = document.getElementById("stryktips-view");
const tabs = [...document.querySelectorAll(".view-tab")];
const SIGNS = ["1", "X", "2"];
const UTD_MIN = { stryktipset: 30000, europatipset: 20000 }; // kupong A, samma som fetch-stryktipset.mjs

let data = null;
let product = null;
// Adresser: /tips, /stryktipset, /europatipset (dold i menyn, nås bara via adressen).
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
  const v = POOLS.includes(first) ? first : first === "tips" ? "tips" : null;
  return { view: v, sub: sub === "backtest" ? sub : null };
}
const route = parseRoute();
let showBacktest = route.sub === "backtest";
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
// v = "tips" | "stryktipset" | "europatipset". push = lägg adressen i historiken.
const viewPath = (v) => `/${v}`;
function setView(v, push = false) {
  const pool = v;
  const st = POOLS.includes(pool);
  if (st) product = pool;
  document.body.classList.toggle("view-stryktips", st);
  view.hidden = !st;
  for (const t of tabs) {
    const on = t.dataset.view === v;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
  }
  if (push && location.pathname !== viewPath(v)) history.pushState(null, "", viewPath(v));
  else if (!push && location.pathname === "/") history.replaceState(null, "", viewPath(v));
  // Europatipset sparas inte som senaste flik: den ska bara nås via adressen
  if (pool !== "europatipset") {
    try {
      localStorage.setItem("betting.view", v);
    } catch {
      /* privat lage */
    }
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


// Backtest: gammal mot ny modellvikt + resultat per omgång (scripts/backtest-stryktipset.mjs)
function backtestBox(list, krFmt) {
  if (!list?.length) return "";
  const cols = list.filter((b) => b.col);
  const neu = list.find((b) => b.key === "new");
  const signed = (x) => `<b class="${x >= 0 ? "pos" : "neg"}">${x >= 0 ? "+" : ""}${krFmt(x)} kr</b>`;
  // Färg mot föregående kolumn: grönt = bättre, rött = sämre
  const cell = (vals, i, fmt, higher = true) => {
    const v = vals[i], prev = vals[i - 1];
    const cls = i === 0 || v == null || prev == null || v === prev ? "" : (higher ? v > prev : v < prev) ? " class=\"up\"" : " class=\"down\"";
    return `<td${cls}>${fmt(v, i)}</td>`;
  };
  const row = (label, get, fmt = (v) => v, higher = true) => {
    const vals = cols.map(get);
    return `<tr><th>${label}</th>${vals.map((_, i) => cell(vals, i, fmt, higher)).join("")}</tr>`;
  };
  const sys = (k) => [
    row(`${k} · Netto`, (c) => c[k].net, (v) => signed(v)),
    row(`${k} · Rader med 10+ rätt`, (c) => c[k].ge10),
    row(`${k} · Rader med 11+ rätt`, (c) => c[k].ge11),
    row(`${k} · Rader med 12+ rätt`, (c) => c[k].ge12),
    row(`${k} · Chans 13 rätt / omgång`, (c) => c[k].chance, (v) => `1 på ${v}`, false),
  ].join("");
  const cmp = cols.length >= 2 ? `<div class="st-bt-wrap"><table class="st-bt">
      <thead><tr><th>${cols[0].draws} omgångar ${esc(cols[0].from)} – ${esc(cols[0].to)} (${cols[0].matches} matcher)</th>${cols.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead>
      <tbody>${sys("A")}${sys("B")}
        ${row("A+B tillsammans · Chans 13 rätt / omgång", (c) => c.pairChance, (v) => `1 på ${v}`, false)}
        ${row("Träffsäkerhet per match (logloss, lägre = bättre)", (c) => c.logLoss?.final, (v) => v, false)}
        <tr><th>Kryss utfall / vår förväntan / folket</th><td colspan="${cols.length}">${Math.round(neu.drawRate.actual * 100)} % / ${Math.round(neu.drawRate.predicted * 100)} % / ${Math.round(neu.drawRate.folk * 100)} %</td></tr>
      </tbody></table></div>` : "";
  const perDraw = neu?.perDraw?.length ? `<details class="st-bt-draws"><summary>Resultat per omgång (${neu.perDraw.length}, nuvarande version)</summary><div class="st-bt-wrap"><table class="st-bt">
      <thead><tr><th>Omgång</th><th>Kryss</th><th>13 rätt gav</th><th>A bästa</th><th>A vinst</th><th>B bästa</th><th>B vinst</th></tr></thead>
      <tbody>${neu.perDraw.map((d) => `<tr><th>${d.n} · ${esc(d.date)}</th><td>${d.x}</td><td>${esc(String(d.prize13 || "").replace(",00", ""))} kr (${d.winners13})</td><td${d.aBest >= 11 ? " class=\"up\"" : ""}>${d.aBest}</td><td>${krFmt(d.aWin || 0)}</td><td${d.bBest >= 11 ? " class=\"up\"" : ""}>${d.bBest}</td><td>${krFmt(d.bWin || 0)}</td></tr>`).join("")}</tbody></table></div></details>` : "";
  const autumn = list.find((b) => b.key === "autumn");
  return `<details class="st-method st-backtest"${showBacktest ? " open" : ""}><summary>Backtest – vad som blivit bättre (säsong 2025/26, alla omgångar med PL-match)</summary>
    <p>350–400 kr per kupong, utdelning ≥ 30 000 kr, räknat mot facit och Svenska Spels verkliga utdelning. Varje kolumn är ett steg: <b>steg 1</b> lagmodellen väger 10 % i stället för 35 %; <b>steg 2</b> skarpa odds (Pinnacle/Betfair, annars snitt av bolag) i stället för Svenska Spels, och jackpot räknas in i utdelningen (A 5-3-2 + motsystem B 4-3-3); <b>steg 3</b> ett system på 700–800 rader med minst 4-2-2 som delas i kupong A (högst utdelning) och B (resten), och xG från Understat i lagmodellen. I steg 3 är A och B två halvor av samma system, så jämför raden <b>A+B tillsammans</b>. Grönt/rött = bättre/sämre än kolumnen till vänster.</p>
    ${cmp}
    <p>Steg 2 ger bättre sannolikheter (lägre logloss) men färre toppträffar just den här säsongen. Per omgång är systemen lika (bästa rad bättre i 9 mot 10 omgångar, rätt i grundraden 337 mot 340) – skillnaden i 10+ rätt kommer från två omgångar (43 mot 5 och 30 mot 4 rader).</p>
    <p><b>Teckenreglerna:</b> rätt rad hade minst 5-3-2 i bara 34 % av omgångarna – övriga veckor kunde systemet inte ta 13 rätt. 4-2-2 (nu) släpper igenom 82 %. Samlad chans till 13 rätt för A+B steg från 1 på 284 till 1 på 221 (Europatipset: 1 på 242 till 1 på 180).</p>
    ${perDraw}
    ${autumn ? `<p>Hösten 2026 (${autumn.draws} omgångar, nuvarande version): A ${signed(autumn.A.net)}, B ${signed(autumn.B.net)} – rader med 11+ rätt: A ${autumn.A.ge11}, B ${autumn.B.ge11}.</p>` : ""}
    <p class="st-note-small">Backtestets skarpa odds är slutodds (Pinnacle, annars snitt av bolag) från football-data; Svenska Spels odds är startodds. Nettot styrs av enstaka träffar – återbetalningen är 65 %, så förväntat utfall är negativt. Alla lärdomar: docs/analys/stryktips-lardomar.md.</p>
  </details>`;
}

// Budgettabell: varje omgång 2025/26 + 2026/27 med PL-match, nuvarande version, insats/vinst och antal rader per antal rätt
function budgetBox(list, krFmt) {
  const b = list?.find((x) => x.key === "budget");
  if (!b?.perDraw?.length) return "";
  const signed = (x) => `<b class="${x >= 0 ? "pos" : "neg"}">${x >= 0 ? "+" : ""}${krFmt(x)}</b>`;
  const draws = [...b.perDraw].sort((x, y) => x.date.localeCompare(y.date));
  const cls = (d, k) => (d.aClass?.[k] || 0) + (d.bClass?.[k] || 0);
  // Rätt-kolumner 13 ner till lägsta klass som förekommer
  const lowest = Math.min(...draws.flatMap((d) => [...Object.keys(d.aClass || {}), ...Object.keys(d.bClass || {})].map(Number)), 9);
  const ks = Array.from({ length: 14 - lowest }, (_, i) => 13 - i);
  const season = (d) => (d.date < "2026-07-01" ? "2025/26" : "2026/27");
  let acc = 0;
  const line = (d) => {
    const cost = (d.aCost || 0) + (d.bCost || 0), win = (d.aWin || 0) + (d.bWin || 0);
    acc += win - cost;
    return `<tr><th>${d.n} · ${esc(d.date)}</th><td>${d.aBest}/${d.bBest}</td><td>${krFmt(cost)}</td><td>${krFmt(win)}</td><td>${signed(win - cost)}</td><td>${signed(acc)}</td>${ks.map((k) => {
      const v = cls(d, k);
      return `<td${k >= 11 && v ? " class=\"up\"" : ""} title="A ${d.aClass?.[k] || 0} · B ${d.bClass?.[k] || 0}">${v || "·"}</td>`;
    }).join("")}</tr>`;
  };
  const total = (label, ds) => {
    const cost = ds.reduce((s, d) => s + (d.aCost || 0) + (d.bCost || 0), 0), win = ds.reduce((s, d) => s + (d.aWin || 0) + (d.bWin || 0), 0);
    const aNet = ds.reduce((s, d) => s + (d.aWin || 0) - (d.aCost || 0), 0);
    return `<tr class="st-bt-sum"><th>${label} (${ds.length} omg.)</th><td>A ${signed(aNet)}</td><td>${krFmt(cost)}</td><td>${krFmt(win)}</td><td>${signed(win - cost)}</td><td></td>${ks.map((k) => `<td>${ds.reduce((s, d) => s + cls(d, k), 0) || "·"}</td>`).join("")}</tr>`;
  };
  const seasons = [...new Set(draws.map(season))];
  const body = seasons.map((s) => draws.filter((d) => season(d) === s).map(line).join("") + total(`Summa ${s}`, draws.filter((d) => season(d) === s))).join("");
  return `<details class="st-method st-backtest"><summary>Baktest med budgeten – alla omgångar 2025/26 och 2026/27 med PL-match (${draws.length} st)</summary>
    <p>Så hade det gått om vi tippat varje omgång med nuvarande version: kupong A + kupong B à 350–400 kr (ett delat system på 700–800 rader), räknat mot facit och Svenska Spels verkliga utdelning. <b>Rätt</b>-kolumnerna visar hur många rader (A+B) som fick 13, 12, 11 … rätt – håll muspekaren över en siffra för att se A och B var för sig. Bästa = bästa rad i A/B. Summaraden visar också nettot för bara kupong A.</p>
    <div class="st-bt-wrap"><table class="st-bt">
      <thead><tr><th>Omgång</th><th>Bästa</th><th>Insats</th><th>Vinst</th><th>Netto</th><th>Totalt</th>${ks.map((k) => `<th>${k} r</th>`).join("")}</tr></thead>
      <tbody>${body}${seasons.length > 1 ? total("Summa alla", draws) : ""}</tbody></table></div>
    <p class="st-note-small">Samma motor som kupongen i dag (modell med data fram till omgångens första match, skarpa slutodds). Återbetalningen på Stryktipset är 65 %, så resultatet styrs av enstaka stora träffar.</p>
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

// FotMob-kontext (alla lag: landslag, Europacup, topp 5, Allsvenskan): elva, frånvaro, vila/rotation, domare
function contextRow(e) {
  const c = e.context;
  if (!c?.home) return "";
  const status = c.lineupConfirmed
    ? `<span class="st-lu ok">Elvor bekräftade (FotMob)</span>`
    : `<span class="st-lu wait">Senaste elvan (ej bekräftad)</span>`;
  const side = (team, x) => {
    if (!x) return "";
    const miss = x.unavailable?.length
      ? `saknar ${x.unavailable.map((p) => `${esc(p.name)}${p.type ? ` <small>(${p.type === "injury" ? "skada" : p.type === "suspension" ? "avstängd" : esc(p.type)})</small>` : ""}`).join(", ")}${x.missingValueShare >= 0.1 ? ` <small>· ${Math.round(x.missingValueShare * 100)} % av värdet</small>` : ""}`
      : "inga kända frånvarande";
    const rest = [x.restDays != null ? `vila ${dec(x.restDays)} d` : "", x.daysToNext != null && x.nextMatch?.tournament ? `nästa: ${esc(x.nextMatch.tournament)} om ${dec(x.daysToNext)} d` : ""].filter(Boolean).join(" · ");
    return `<span class="st-lu-side" title="${esc((x.starters || []).join(", "))}"><b>${esc(team)}</b>${x.formation ? ` (${esc(x.formation)})` : ""}: ${miss}${rest ? ` <small>· ${rest}</small>` : ""}</span>`;
  };
  const extra = c.referee ? `Domare: ${esc(c.referee)}` : "";
  return `<div class="st-lineup"><span class="st-svs-k">Trupp</span>${status}${side(e.home, c.home)}${side(e.away, c.away)}${extra ? `<small class="st-lu-note">${extra}</small>` : ""}</div>`;
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

// ---------- Turmatcher och vanliga missar (data.missProfile, scripts/lib/stryk-miss-profile.mjs) ----------
// Turmatch = matchtypen (spik/halvgardering x tecken x favoritens chans) har historiskt missat minst 30 % av gångerna,
// dvs 13 rätt krävde att utfallet låg utanför grundraden. rescue = tecknet som oftast kom i stället.
const TUR_RATE = 0.3;
function turInfo(e, signs) {
  const prof = data?.missProfile;
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
  const lockedA = ["both", "A"].includes(krav?.scope);
  const btn = actions
    ? (lockedA
      ? `<p class="tur-hint">Du har själv låst den här matchen i kupong A. Vill du ändra, klicka på tecknen i listan.</p>`
      : `<button type="button" class="btn-ghost sb-tur-add" data-ev="${e.eventNumber}" data-signs="${esc(t.kravSigns)}">Lägg ${esc(t.kravSigns)} som krav i kupong B</button>`)
    : "";
  return `<div class="tur-explain">
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
  const prof = data?.missProfile;
  if (!prof) return "";
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
            ${actions ? (["both", "A"].includes(kravFor(e.eventNumber)?.scope)
              ? `<span class="st-sub" title="Ändra kravet i listan ovan om B ska spelas annorlunda">Ditt krav gäller A</span>`
              : `<button type="button" class="btn-ghost sb-tur-add" data-ev="${e.eventNumber}" data-signs="${esc(t.kravSigns)}">Krav ${esc(t.kravSigns)} i B</button>`) : ""}
          </div>
          <p>${turText(t)}</p>
        </li>`;
      }).join("")}</ol>`
    : `<p class="st-sub">Inga turmatcher: alla spikar och halvgarderingar i kupong A har historiskt missat under ${Math.round(TUR_RATE * 100)} %.</p>`;
  const rows = Object.values(prof.groups).filter((g) => g.n >= prof.minN).sort((a, b) => b.miss - a.miss).slice(0, 8);
  const over = (g) => g.rate - g.exp > 2 * Math.sqrt((g.exp * (1 - g.exp)) / g.n);
  const table = `<div class="st-bt-wrap"><table class="st-bt st-miss-table">
      <thead><tr><th>Matchtyp</th><th>Matcher</th><th>Missade</th><th>Väntat</th><th>Kom i stället</th></tr></thead>
      <tbody>${rows.map((g) => `<tr${over(g) ? ` class="down"` : ""}><th>${esc(g.label)}${over(g) ? ` <small>· missar oftare än väntat</small>` : ""}</th><td>${g.n}</td><td>${pct(g.rate)}</td><td>${pct(g.exp)}</td><td>${SIGNS.filter((s) => g.by[s]).map((s) => `${s}: ${g.by[s]}`).join(" · ")}</td></tr>`).join("")}</tbody>
    </table></div>`;
  const leagues = Object.entries(prof.leagues || {}).sort((a, b) => b[1].rate - a[1].rate).slice(0, 6);
  const d = prof.outsideDist;
  return `<section class="sb-panel st-miss">
    <div class="st-miss-grid">
      <div>
        <h3>🍀 Turmatcher i omgången <small>${turs.length} st · kupong A</small></h3>
        <p class="st-sub">Matchtyper som historiskt har missat minst ${Math.round(TUR_RATE * 100)} % av gångerna – här krävs tur för 13 rätt${turs.length ? `. Chans att alla håller: ${pct(pOk)}` : ""}.${actions ? " Lägg in tecknet som oftast kom i stället som krav i kupong B, så täcker B det A missar." : ""}</p>
        ${actions && turs.some(({ e }) => !["both", "A"].includes(kravFor(e.eventNumber)?.scope)) ? `<button type="button" class="btn-ghost sb-tur-all">Lägg turmatcherna som krav i B</button>` : ""}
        ${list}
      </div>
      <div>
        <h3>Vanliga missar <small>${prof.draws} omgångar · ${prof.matches} matcher</small></h3>
        <p class="st-sub">Från kupongarkivet (${esc(prof.from)} – ${esc(prof.to)}), grundraden i kupong A. Helgarderingar missar aldrig – alla missar är spikar och halvgarderingar. Rätt rad låg i snitt <b>${String(prof.avgOutside).replace(".", ",")}</b> matcher utanför grundraden (0: ${d[0]}, 1: ${d[1]}, 2: ${d[2]}, 3+: ${d[3]} omgångar).</p>
        ${table}
        ${leagues.length ? `<p class="st-sub"><b>Spikar per liga</b> (minst ${prof.minN}): ${leagues.map(([n, g]) => `${esc(n)} ${pct(g.rate)} <small>(väntat ${pct(g.exp)})</small>`).join(" · ")}</p>` : ""}
      </div>
    </div>
  </section>`;
}

function matchCard(p, e) {
  const key = `${p.product}|${e.eventNumber}`;
  const isOpen = open.has(key);
  const sys = e.systemPick;
  const tur = turInfo(e, sys?.signs);
  return `<article class="st-match${isOpen ? " open" : ""}" data-key="${esc(key)}">
    <header class="st-match-head">
      <span class="st-num">${e.eventNumber}</span>
      <div class="st-title">
        <h3>${esc(e.home)} <span>–</span> ${esc(e.away)}</h3>
        <p><span class="st-kick">${esc(kickoff(e.kickoff))}</span> · ${esc(e.league || "")}</p>
      </div>
      <div class="st-verdict">
        ${sys ? `<span class="st-tip ${sys.signs.length === 1 ? "spik" : sys.signs.length === 2 ? "halv" : "hel"}" title="System A – grundrad (reduceras sedan)">${e.systemPickB ? "A: " : ""}${esc(sys.type)} ${esc(sys.signs.split("").join(" + "))}</span>` : `<span class="st-tip">Tips ${esc(e.tip)}</span>`}
        ${e.systemPickB && !p.reducedB?.split ? `<span class="st-tip sysb" title="System B – eget system">B: ${esc(e.systemPickB.type)} ${esc(e.systemPickB.signs.split("").join(" + "))}</span>` : ""}
        ${turChip(tur, e)}
        ${verdictChip(e)}
        ${resultChip(e)}
      </div>
    </header>
    ${tur?.tur && turOpen.has(turKey(e)) ? turExplain(e, tur) : ""}
    ${probRow(e)}
    ${svsRow(e)}
    ${lineupRow(e)}
    ${contextRow(e)}
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
      <h2>${esc(p?.productName || (product === "europatipset" ? "Europatipset" : "Stryktipset"))}${p ? ` <small>omgång ${p.drawNumber}</small>` : ""}</h2>
      <p class="st-sub">${p ? `${p.open ? "Öppen" : "Avgjord"} · ${esc(p.closeDescription || "")}` : "Hämtar kupong…"}${data?.updatedAt ? ` · hämtad ${esc(new Date(data.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }))}` : ""}</p>
    </div>
    <div class="st-actions">
      <button type="button" class="btn-ghost" id="st-fetch" ${loading ? "disabled" : ""}>${loading ? "Hämtar…" : "Hämta från Svenska Spel"}</button>
    </div>
  </div>`;

  if (!p) {
    view.innerHTML = `${head}<p class="st-empty">${loading ? "Hämtar kupong och räknar…" : esc(data?.error || data?.fetchError || "Ingen kupong hämtad än – tryck “Hämta från Svenska Spel”.")}</p>`;
    return;
  }
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  const info = `<div class="st-summary">
    ${p.note ? `<p class="st-note">${esc(p.note)}</p>` : ""}
    ${p.value ? `<p class="st-value ${esc(p.value.level)}">${esc(p.value.text)}</p>` : ""}
    ${backtestBox(data.backtest, krFmt)}
    ${product === "stryktipset" ? budgetBox(data.backtest, krFmt) : ""}
    <details class="st-method"><summary>Hur räknas procenten?</summary>
      <ul>${Object.values(data.method || {}).map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </details>
  </div>`;
  renderB(p, head, info);
}

// ---------- Stryktipset B: egna krav ----------
// Krav sparas per spel och omgång i webbläsaren: { signs: "1X", scope }. scope: "both" = båda kupongerna, "A"/"B" = bara den ena.
// Äldre sparade spikar ({ sign: "1" }) läses som krav med ett tecken.
const SCOPES = [["both", "Båda"], ["A", "A"], ["B", "B"]];
const bStates = new Map();
const bKey = (p) => `betting.spikes.${p.product}.${p.drawNumber}`;
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
    bStates.set(k, { krav, result: null, dirty: false, busy: false });
  }
  return bStates.get(k);
}
function saveKrav(p, st) {
  st.dirty = !!st.result;
  try {
    localStorage.setItem(bKey(p), JSON.stringify(st.krav));
  } catch {
    /* privat lage */
  }
}

const kravType = (signs) => (signs.length === 1 ? "spik" : signs.length === 2 ? "halv" : "hel");
function kravRow(e, krav, pick) {
  const scope = krav?.scope || "both";
  const signs = krav?.signs || "";
  const tur = turInfo(e, pick?.signs);
  return `<div class="sb-row${krav ? " locked" : ""}" data-ev="${e.eventNumber}">
    <span class="st-num">${e.eventNumber}</span>
    <div class="sb-match"><b>${esc(e.home)} – ${esc(e.away)}</b><small><span class="st-kick">${esc(kickoff(e.kickoff))}</span> · ${esc(e.league || "")}${tur?.tur ? ` · <button type="button" class="sb-tur tur-btn" data-ev="${e.eventNumber}" aria-expanded="${turOpen.has(turKey(e))}">🍀 turmatch (${esc(pick.signs)} missar ${pct(tur.rate)}) ${turOpen.has(turKey(e)) ? "▲" : "– varför? ▼"}</button>` : ""}</small></div>
    <div class="sb-krav">
      <div class="sb-signs" role="group" aria-label="Krav match ${e.eventNumber}">${SIGNS.map((s, i) => `<button type="button" class="sb-sign${signs.includes(s) ? " on" : ""}" data-sign="${s}" aria-pressed="${signs.includes(s)}" title="Folket ${pct(e.folk?.[i])}">${s}<small>${pct(e.final[i])}</small></button>`).join("")}</div>
      <span class="sb-krav-lbl">${krav ? `<span class="st-tip ${kravType(signs)}">${esc(signs)}</span>` : "fritt"}</span>
    </div>
    <div class="sb-scope" role="group" aria-label="Kravet gäller">${SCOPES.map(([k, lbl]) => `<button type="button" data-scope="${k}" aria-pressed="${!!krav && scope === k}"${krav ? "" : " disabled"}>${lbl}</button>`).join("")}</div>
    ${tur?.tur && turOpen.has(turKey(e)) ? turExplain(e, tur, { actions: true, krav }) : ""}
  </div>`;
}

function couponCard(c, label, p) {
  if (!c) return `<div class="sb-coupon"><h3>Kupong ${label}</h3><p class="st-note bad">Gick inte att bygga en kupong med de här kraven${label === "B" ? " (B kräver minst 30 000 kr för 13 rätt och en annan grundrad än A)" : ""}.</p></div>`;
  const krFmt = (x) => Math.round(x).toLocaleString("sv-SE");
  const r = c.rules;
  const locked = c.picks.filter((x) => x.locked).length;
  return `<div class="sb-coupon">
    <h3>Kupong ${label} <small>${c.rows} rader · ${krFmt(c.cost)} kr</small></h3>
    <dl class="sb-facts">
      <div><dt>Chans 13 rätt</dt><dd>${oneIn(c.hitAll)}</dd></div>
      <div><dt>Utdelning 13 rätt</dt><dd>ca ${krFmt(c.expectedPayout || 0)} kr</dd></div>
      <div><dt>Regler</dt><dd>${r.signMin.join("-")} · utdelning minst ${krFmt(r.payoutMinReal ?? r.payoutMin)} kr, inget tak</dd></div>
      <div><dt>Dina krav</dt><dd>${locked}</dd></div>
    </dl>
    ${c.relaxed?.length ? `<p class="st-note">Gick inte med alla regler: ${esc(c.relaxed.join(", "))}.</p>` : ""}
    ${p.open
      ? `<a class="st-gc" href="${esc(c.gamblingCabinUrl)}" target="_blank" rel="noopener">Öppna kupong ${label} i Gambling Cabin – förifyllt, tryck Reducera → ${krFmt(c.cost)} kr</a>`
      : `<p class="st-gc-off">Länken till Gambling Cabin fungerar när kupongen är öppen – den här omgången är avgjord.</p>`}
    <details class="sb-rows"><summary>Visa alla ${c.rows} rader</summary><pre class="st-rows">${c.rowList.map((row, i) => `${String(i + 1).padStart(3, " ")}  ${row}`).join("\n")}</pre></details>
  </div>`;
}

function couponTable(p, res) {
  const cell = (c, i) => {
    const x = c?.picks[i];
    if (!x) return "<td>—</td>";
    const cls = x.signs.length === 1 ? "spik" : x.signs.length === 2 ? "halv" : "hel";
    return `<td><span class="st-tip ${cls}${x.locked ? " mine" : ""}" title="${x.locked ? "Ditt krav" : esc(x.type)}">${x.locked ? "🔒 " : ""}${esc(x.signs.split("").join(" + "))}</span></td>`;
  };
  const turCell = (e, i) => {
    const t = turInfo(e, res.A?.picks[i]?.signs);
    return t?.tur ? `<td><button type="button" class="st-chip tur tur-btn" data-ev="${e.eventNumber}" data-scroll="1">🍀 ${pct(t.rate)} · varför?</button></td>` : "<td></td>";
  };
  return `<div class="st-bt-wrap"><table class="sb-table">
    <thead><tr><th>#</th><th>Match</th><th>Kupong A</th><th>Kupong B</th><th>Tur (A)</th></tr></thead>
    <tbody>${p.events.map((e, i) => `<tr><td>${e.eventNumber}</td><th>${esc(e.home)} – ${esc(e.away)}</th>${cell(res.A, i)}${cell(res.B, i)}${turCell(e, i)}</tr>`).join("")}</tbody>
  </table></div>`;
}

// Live-streck via Cloudflare-funktionen /live/svs (Svenska Spels API tillåter inte anrop direkt från sidan).
// Gambling Cabin räknar med strecken just nu, så kupongen byggs på samma streck och radantalet blir detsamma där.
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

function generateInto(p, st) {
  try {
    st.result = generateCoupons(p, st.krav);
  } catch (e) {
    st.result = null;
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
  generateInto(p, st);
}

function streckNote(p, st) {
  const t = (iso) => new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (!p.open) return "";
  if (p.live) {
    return `<p class="st-note">Streck hämtade live kl. <b>${t(p.live.at)}</b>${p.live.turnover ? ` (omsättning ${Math.round(p.live.turnover).toLocaleString("sv-SE")} kr)` : ""}. Öppna Gambling Cabin-länken direkt så räknar den med samma streck. Nära spelstopp rör sig strecken snabbt – tryck Generera igen precis innan du spelar.${st.liveError ? ` Senaste försöket misslyckades: ${esc(st.liveError)}.` : ""}</p>`;
  }
  return `<p class="st-note${st.liveError ? " bad" : ""}">Streck från hämtningen${data?.updatedAt ? ` ${esc(new Date(data.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }))}` : ""}${st.liveError ? ` – live-streck kunde inte hämtas (${esc(st.liveError)})` : ""}. Gambling Cabin räknar med strecken just nu, så radantalet där kan skilja.</p>`;
}

function renderB(p, head, info = "") {
  const st = bState(p);
  if (!st.result && !st.tried) {
    st.tried = true;
    generateInto(p, st);
    // Byt direkt till live-streck i bakgrunden
    if (p.open && !p.live) {
      st.busy = true;
      liveGenerate(p, st).finally(() => {
        st.busy = false;
        render();
      });
    }
  }
  const n = Object.keys(st.krav).length;
  const res = st.result;
  // Turmatcher utgår från kupong A: den genererade om den finns, annars hämtningens kupong A
  const picksA = p.events.map((e, i) => res?.A?.picks[i] || e.systemPick || null);
  const picker = `<section class="sb-panel">
    <div class="sb-panel-head">
      <div>
        <h3>1. Välj dina krav</h3>
        <p class="st-sub">Klicka på ett eller flera tecken per match: 1, X eller 2 är en spik, två tecken (1X, X2, 12) en halvgardering och alla tre en helgardering. Klicka igen för att ta bort ett tecken. Välj sedan om kravet gäller båda kupongerna eller bara A eller B. Procenten är vår sannolikhet.</p>
      </div>
      <div class="st-actions">
        <button type="button" class="btn-ghost" id="sb-clear"${n ? "" : " disabled"}>Rensa krav</button>
        <button type="button" class="btn-fetch sb-generate" id="sb-generate"${st.busy ? " disabled" : ""}><span class="btn-label">${st.busy ? "Hämtar streck och genererar…" : `2. Generera kupong${n ? ` (${n} krav)` : ""}`}</span></button>
      </div>
    </div>
    <div class="sb-list">${p.events.map((e, i) => kravRow(e, st.krav[e.eventNumber], picksA[i])).join("")}</div>
  </section>`;
  const result = res
    ? `<section class="sb-panel sb-result">
        <h3>Din kupong</h3>
        ${st.dirty ? `<p class="st-note">Du har ändrat kraven – tryck Generera kupong igen för att uppdatera.</p>` : ""}
        <p class="st-sub">A och B är två olika system, vardera 350–400 kr. A: högst chans till 13 rätt, teckenregler 4-2-2, utdelning minst ${(UTD_MIN[p.product] || 30000).toLocaleString("sv-SE")} kr. B: teckenregler 3-3-3, minst 30 000 kr utan tak, högst 2 spikar och ingen halvgardering exakt som i A, aldrig samma tecken som ett krav du låst bara i A, vald för att täcka rader som A saknar.${res.A && res.B ? ` Gemensamma rader: <b>${res.overlap}</b>. A+B tillsammans: chans till 13 rätt <b>${oneIn(res.unionHit)}</b>.` : ""}</p>
        ${streckNote(p, st)}
        ${couponTable(p, res)}
        <div class="sb-coupons">${couponCard(res.A, "A", p)}${couponCard(res.B, "B", p)}</div>
      </section>`
    : "";
  // Matchkorten visar den genererade kupongen (eller hämtningens kupong A innan något genererats)
  const events = p.events.map((e, i) => ({ ...e, systemPick: picksA[i], systemPickB: res?.B?.picks[i] || null }));
  const pv = { ...p, reducedB: { split: false } }; // B är alltid ett eget system här, visa B-chippen
  view.innerHTML = `${head}${data.error ? `<p class="st-note bad">Kunde inte uppdatera: ${esc(data.error)}</p>` : ""}${picker}${result}${missPanel(p, events, { bCoupon: res?.B || null, actions: true, kravFor: (nr) => st.krav[nr] })}<div class="st-list">${events.map((e) => matchCard(pv, e)).join("")}</div>${info}`;
}

function handleB(ev) {
  const p = data?.products?.find((x) => x.product === product);
  if (!p) return false;
  const st = bState(p);
  const row = ev.target.closest(".sb-row");
  const signBtn = ev.target.closest(".sb-sign");
  const scopeBtn = ev.target.closest(".sb-scope button");
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
  // Turmatcher: lägg tecknet som oftast kom i stället som krav i kupong B
  const turBtn = ev.target.closest(".sb-tur-add");
  if (turBtn || ev.target.closest(".sb-tur-all")) {
    const btns = turBtn ? [turBtn] : [...view.querySelectorAll(".sb-tur-add")];
    for (const b of btns) {
      if (["both", "A"].includes(st.krav[b.dataset.ev]?.scope)) continue; // kupong A:s krav ligger kvar
      st.krav[b.dataset.ev] = { signs: b.dataset.signs, scope: "B" };
    }
    saveKrav(p, st);
    render();
    return true;
  }
  if (ev.target.closest("#sb-clear")) {
    st.krav = {};
    saveKrav(p, st);
    render();
    return true;
  }
  if (ev.target.closest("#sb-generate")) {
    st.busy = true;
    render();
    // Hämtar live-streck och genererar sedan (räkningen tar vanligtvis under en sekund)
    liveGenerate(p, st).then(() => {
      st.busy = false;
      st.dirty = false;
      render();
      view.querySelector(".sb-result")?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return true;
  }
  return false;
}

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
setView(route.view || (saved === "stryktipset" ? saved : "tips"));
