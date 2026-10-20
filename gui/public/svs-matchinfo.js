// Svenska Spels matchinfo i matchkortets analys (data: p.svsInfo från scripts/fetch-stryktips-svs.mjs).
// Allt som Svenska Spel visar på Stryktipset/Europatipset: vinstchans, form, inbördes, tabell, xStats,
// lagprofil, laguppställning, nyheter, expertanalyser, andra spels streck och alla Oddset-spel på matchen.
// Upplagt som hos Svenska Spel (användaren 2026-10-20: "presentera det på liknande sätt"): flikar per match
// (Översikt, Statistik, xStats, Tabell, Laguppställning, Nyheter, Analys, Oddset), hemmalaget rött och bortalaget
// blått, form som V/O/F-bollar, xStats med radardiagram och jämförelserader. Flikar utan data visas inte.
const SIGNS = ["1", "X", "2"];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (p) => (p == null ? "—" : `${Math.round(p * 100)} %`);
const dec = (x) => (x == null ? "—" : Number(x).toFixed(2).replace(".", ","));
const one = (x) => (x == null ? "—" : Number(x).toFixed(1).replace(".", ","));
const svDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(2, 4)}` : "");
const abbr = (t) => esc(String(t || "").replace(/[^A-Za-zÅÄÖåäöÉéÜü]/g, "").slice(0, 3).toUpperCase());

export const svsEvent = (p, e) => p?.svsInfo?.events?.find((x) => x.eventNumber === e.eventNumber) || null;

// ---------- Flikar och växlare ----------
// Valt läge per grupp överlever omritningen av sidan; klicken byter bara synlighet i DOM:en.
const chosen = new Map();
if (typeof document !== "undefined" && !globalThis.__svsTabs) {
  globalThis.__svsTabs = true;
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest?.("[data-svs-group]");
    if (!btn) return;
    const g = btn.dataset.svsGroup, v = btn.dataset.svsVal;
    chosen.set(g, v);
    const root = btn.closest(".svs-info") || document;
    root.querySelectorAll(`[data-svs-group="${g}"]`).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.svsVal === v)));
    root.querySelectorAll(`[data-svs-pane="${g}"]`).forEach((p) => { p.hidden = p.dataset.svsVal !== v; });
  });
}
/** Växlare: items = [[värde, etikett, html]]. kind "tabs" = huvudflikarna, "seg" = små knappar inne i en flik. */
function switcher(group, items, kind = "seg") {
  const list = items.filter(([, , html]) => html);
  if (!list.length) return "";
  const cur = list.some(([v]) => v === chosen.get(group)) ? chosen.get(group) : list[0][0];
  const bar = list.length > 1 || kind === "tabs"
    ? `<div class="${kind === "tabs" ? "svs-tabs" : "svs-seg"}" role="tablist">${list.map(([v, lbl]) => `<button type="button" role="tab" data-svs-group="${esc(group)}" data-svs-val="${esc(v)}" aria-selected="${v === cur}">${lbl}</button>`).join("")}</div>`
    : "";
  return `${bar}${list.map(([v, , html]) => `<div class="svs-pane" role="tabpanel" data-svs-pane="${esc(group)}" data-svs-val="${esc(v)}"${v === cur ? "" : " hidden"}>${html}</div>`).join("")}`;
}

// ---------- Översikt: spelstatistik inför match ----------
const trioRow = (label, vals, fmt, title = "") => `<tr><th${title ? ` title="${esc(title)}"` : ""}>${label}</th>${[0, 1, 2].map((i) => `<td>${vals?.[i] == null ? "—" : fmt(vals[i])}</td>`).join("")}</tr>`;
function overview(s) {
  const rows = [];
  if (s.svenskaFolket) rows.push(trioRow("Svenska folket", s.svenskaFolket, (x) => `${x} %`));
  if (s.odds) rows.push(trioRow("Odds", s.odds, dec));
  if (s.startOdds) rows.push(trioRow("Startodds", s.startOdds, dec));
  if (s.favouriteOdds) rows.push(trioRow("Favoritskap", s.favouriteOdds, (x) => `${Math.round(x)} %`, "Oddset omräknat till procent utan marginal"));
  if (s.winProbability) rows.push(trioRow("Vinstchans", [s.winProbability.home, s.winProbability.draw, s.winProbability.away], pct, "Enetpulses vinstchans som Svenska Spel visar under Statistik"));
  if (s.tioTidningar) rows.push(trioRow("Tio tidningar", s.tioTidningar, (x) => x));
  for (const d of s.otherDraws || []) rows.push(trioRow(esc(d.product), d.distribution, (x) => `${x} %`));
  const facts = [];
  if (s.kickoff) facts.push(`<p><span>Avspark</span><strong>${esc(new Date(s.kickoff).toLocaleString("sv-SE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</strong></p>`);
  if (s.venue || s.season) facts.push(`<p><span>Arena</span><strong>${esc(s.venue || "—")}${s.season ? ` · ${esc(s.season)}` : ""}</strong></p>`);
  if (s.ou25) facts.push(`<p><span>Över/Under 2,5 mål</span><strong>över ${dec(s.ou25.over)} · under ${dec(s.ou25.under)}</strong></p>`);
  if (s.comment) facts.push(`<p><span>Kommentar</span><strong>${esc(s.comment)}</strong></p>`);
  if (!rows.length && !facts.length) return "";
  return `${rows.length ? `<table class="ds-table svs-table svs-trio"><thead><tr><th></th><th>1</th><th>X</th><th>2</th></tr></thead><tbody>${rows.join("")}</tbody></table>` : ""}
    ${facts.length ? `<div class="svs-overview">${facts.join("")}</div>` : ""}`;
}

// ---------- Statistik: form, inbördes, sannolikt resultat ----------
const balls = (letters) => `<span class="svs-balls">${letters.map((r) => `<span class="f-${r}">${r}</span>`).join("")}</span>`;
function matchRow(m) {
  const won = m.hg != null && m.ag != null ? (m.hg > m.ag ? "h" : m.ag > m.hg ? "a" : "") : "";
  const team = (t, g, side) => `<span class="${won === side ? "is-win" : ""}"><b>${g ?? "–"}</b> ${esc(t)}</span>`;
  return `<li><span class="svs-ft">${esc(m.status || "FT")}</span><span class="svs-teams">${team(m.home, m.hg, "h")}${team(m.away, m.ag, "a")}${m.pens ? `<small>str ${m.pens[0]}–${m.pens[1]}</small>` : ""}</span><span class="svs-when">${svDate(m.date)}<small>${esc(m.league || "")}</small></span></li>`;
}
function formBlock(f, label) {
  if (!f?.matches?.length) return "";
  const letters = f.letters?.length ? f.letters : f.matches.map((m) => m.result).filter(Boolean);
  return `<div class="svs-list"><h6>Senast ${esc(label || f.team)} ${balls(letters)}</h6><ul>${f.matches.map(matchRow).join("")}</ul></div>`;
}
function h2hBlock(x, label) {
  if (!x?.matches?.length) return "";
  return `<div class="svs-list"><h6>${label}${x.summary ? ` <b class="svs-sum">${esc(x.summary.replace(/-/g, " - "))}</b>` : ""}</h6><ul>${x.matches.map(matchRow).join("")}</ul></div>`;
}
function probBars(s) {
  const w = s.winProbability;
  if (!w) return "";
  const bar = (lbl, v, cls) => `<div class="svs-prob ${cls}"><span class="svs-prob-bar"><i style="height:${Math.round((v || 0) * 100)}%"></i></span><b>${pct(v)}</b><small>${lbl}</small></div>`;
  return `<div class="svs-probs"><h6>Sannolikt resultat <small>Enetpulse</small></h6><div class="svs-prob-row">${bar(esc(s.home), w.home, "is-home")}${bar("Oavgjort", w.draw, "is-draw")}${bar(esc(s.away), w.away, "is-away")}</div></div>`;
}
function stats(s, key) {
  const [h, a] = s.form || [];
  const all = h || a ? `<h5>Form <small>senaste matcherna, alla turneringar</small></h5>${formBlock(h, s.home)}${formBlock(a, s.away)}` : "";
  const home = s.formHome?.matches?.length || s.formAway?.matches?.length ? `<h5>Form <small>${esc(s.home)} hemma, ${esc(s.away)} borta</small></h5>${formBlock(s.formHome, `${s.home} hemma`)}${formBlock(s.formAway, `${s.away} borta`)}` : "";
  const forms = switcher(`${key}-form`, [["alla", "Alla matcher", all], ["hb", `${abbr(s.home)} hemma · ${abbr(s.away)} borta`, home]]);
  const h2h = s.h2h?.matches?.length
    ? `<h5>Inbördes${s.h2h.summary ? ` <small>${esc(s.home)} ${esc(s.h2h.summary.split("-")[0])} vinster · ${esc(s.h2h.summary.split("-")[1] ?? "")} oavgjorda · ${esc(s.away)} ${esc(s.h2h.summary.split("-")[2] ?? "")} vinster</small>` : ""}</h5>
      ${h2hBlock(s.h2h, "Head 2 Head")}${h2hBlock(s.h2hHome, `På ${esc(s.home)}s hemmaplan`)}`
    : "";
  const html = `${forms}${h2h}${probBars(s)}`;
  return forms || h2h || s.winProbability ? html : "";
}

// ---------- xStats: radar (lagprofil) och jämförelserader ----------
const RADAR = [["setPiecesOff", "Fasta sit. (off.)"], ["chancesCreated", "Chanser för"], ["counterAttacks", "Kontringar"], ["setPiecesDef", "Fasta sit. (def.)"], ["chancesConceded", "Chanser emot"], ["possession", "Bollinnehav"]];
function radar(s) {
  const t = s.teamStyle;
  if (!t?.home && !t?.away) return "";
  const R = 90, C = 130;
  const pt = (i, v) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / RADAR.length;
    return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v];
  };
  const poly = (v) => RADAR.map((_, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const team = (o, cls) => (o ? `<polygon class="${cls}" points="${RADAR.map(([k], i) => pt(i, Math.max(0, Math.min(1, o[k] ?? 0))).map((n) => n.toFixed(1)).join(",")).join(" ")}"/>` : "");
  const labels = RADAR.map(([, lbl], i) => {
    const [x, y] = pt(i, 1.2);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${Math.abs(x - C) < 5 ? "middle" : x > C ? "start" : "end"}" dominant-baseline="middle">${lbl}</text>`;
  }).join("");
  return `<h5>Fördjupad lagstatistik <small>percentil i ligan, ytterkanten = högst i ligan</small></h5>
    <svg class="svs-radar" viewBox="-40 0 340 260" role="img" aria-label="Lagprofil ${esc(s.home)} mot ${esc(s.away)}">
      ${[1, 0.66, 0.33].map((v) => `<polygon class="svs-radar-grid" points="${poly(v)}"/>`).join("")}
      ${RADAR.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="svs-radar-grid" x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("")}
      ${team(t.home, "is-home")}${team(t.away, "is-away")}${labels}
    </svg>
    <p class="svs-legend"><span class="is-home">${esc(s.home)}</span><span class="is-away">${esc(s.away)}</span></p>`;
}
// [nyckel, etikett, format, högre är bättre]
const XP = [
  ["xp", "Förväntade poäng (xP)", one, true],
  ["points", "Poäng", (x) => x, true],
  ["xpPointsDiff", "Skillnad i xP/poäng", (x) => (x > 0 ? `+${one(x)}` : one(x)), true],
  ["expectedTablePosition", "Förväntad tabellplacering", (x) => x, false],
  ["tablePosition", "Tabellplacering", (x) => x, false],
];
const XG = [
  ["xG", "Förväntade mål (xG)", dec, true],
  ["xGC", "Förväntade insläppta mål (xGC)", dec, false],
  ["averageScored", "Snitt gjorda mål", dec, true],
  ["averageConceded", "Snitt insläppta mål", dec, false],
  ["averageScoredBetween", "Snitt gjorda mål inbördes (5 senaste)", dec, true],
  ["averageScoredHomeAndAway", `Snitt gjorda mål hemma resp. borta`, dec, true],
];
function compare(o, list, title, s) {
  const rows = list.filter(([k]) => o?.[k]).map(([k, lbl, f, up]) => {
    const { home: h, away: a } = o[k];
    const best = h == null || a == null || h === a ? "" : (h > a) === up ? "h" : "a";
    return `<tr><td class="${best === "h" ? "is-home" : ""}">${f(h)}</td><th>${lbl}</th><td class="${best === "a" ? "is-away" : ""}">${f(a)}</td></tr>`;
  });
  return rows.length ? `<h5>${title}</h5><table class="svs-cmp"><thead><tr><th>${esc(s.home)}</th><th></th><th>${esc(s.away)}</th></tr></thead><tbody>${rows.join("")}</tbody></table>` : "";
}
const STYLE = {
  "Goals PG": "Mål/match", "Shots PG": "Skott/match", "xShots PG": "xSkott/match", "xCorners PG": "xHörnor/match",
  "Yellow Cards PG": "Gula kort/match", "Red Cards PG": "Röda kort/match",
};
function styleBars(s) {
  const t = s.teamStyle;
  const keys = Object.keys(STYLE).filter((k) => t?.home?.[k] != null || t?.away?.[k] != null);
  if (!keys.length) return "";
  const bar = (v, cls) => (v == null ? "<td>—</td>" : `<td><span class="svs-bar ${cls}" style="--v:${Math.round(v * 100)}%"></span><small>${Math.round(v * 100)}</small></td>`);
  return `<h5>Lagprofil <small>percentil i ligan, 100 = högst</small></h5>
    <table class="ds-table svs-table svs-style"><thead><tr><th></th><th>${esc(s.home)}</th><th>${esc(s.away)}</th></tr></thead>
    <tbody>${keys.map((k) => `<tr><th>${STYLE[k]}</th>${bar(t.home?.[k], "is-home")}${bar(t.away?.[k], "is-away")}</tr>`).join("")}</tbody></table>`;
}
function xstats(s, key) {
  const x = s.xStats;
  const part = (o) => (o ? `${compare(o, XP, "Förväntade poäng (xP)", s)}${compare(o, XG, "Målstatistik (xG)", s)}` : "");
  const body = x ? switcher(`${key}-x`, [["season", "Hela säsongen", part(x.season)], ["last5", "5 senaste", part(x.last5)]]) : "";
  const html = `${radar(s)}${body ? `<div class="svs-xs"><p class="svs-note">xStats från PlayMaker, samma som Svenska Spels flik xStats. Bästa värdet är färgat.</p>${body}</div>` : ""}${styleBars(s)}`;
  return body || radar(s) || styleBars(s) ? html : "";
}

// ---------- Tabell ----------
function tableRows(rows, teams) {
  return rows.map((r) => `<tr class="${r.team === teams[0] ? "is-team is-home" : r.team === teams[1] ? "is-team is-away" : ""}"><td>${r.pos}</td><th>${esc(r.team)}</th><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td><b>${r.pts}</b></td></tr>`).join("");
}
function table(s, key) {
  const t = s.table;
  if (!t?.rows?.length) return "";
  const teams = [s.home, s.away];
  const head = `<thead><tr><th>#</th><th>Lag</th><th>M</th><th>V</th><th>O</th><th>F</th><th>+/-</th><th>P</th></tr></thead>`;
  const tab = (rows) => (rows?.length ? `<table class="ds-table svs-table svs-league">${head}<tbody>${tableRows(rows, teams)}</tbody></table>` : "");
  return `<h5>Tabell <small>${esc(s.league || "")}</small></h5>
    ${switcher(`${key}-tabell`, [["tot", "Totalt", tab(t.rows)], ["hemma", "Hemma", tab(t.home)], ["borta", "Borta", tab(t.away)]])}
    ${t.legend?.length ? `<p class="svs-note">${t.legend.map(esc).join(" · ")}</p>` : ""}`;
}

// ---------- Laguppställning ----------
const REASON = { injured: "skadad", suspended: "avstängd", red_card: "avstängd", doubtful: "osäker" };
function lineupSide(x, cls) {
  if (!x?.starters?.length && !x?.unavailable?.length) return "";
  return `<div class="svs-lineup-side ${cls}"><h6>${esc(x.team || "")}${x.formation ? ` <small>${esc(x.formation)}</small>` : ""}</h6>
    ${x.starters?.length ? `<ol class="svs-xi">${x.starters.map((p) => `<li><span>${esc(p.shirt || "")}</span>${esc(p.name)}${p.gk ? " <small>(mv)</small>" : ""}</li>`).join("")}</ol>` : ""}
    ${x.unavailable?.length ? `<p class="svs-out"><b>Otillgängliga:</b> ${x.unavailable.map((p) => `${esc(p.name)}${p.reason ? ` <small>(${esc(REASON[p.reason] || p.reason)})</small>` : ""}`).join(", ")}</p>` : ""}
    ${x.bench?.length ? `<p><b>Avbytare:</b> ${x.bench.map((p) => esc(p.name)).join(", ")}</p>` : ""}
    ${x.coach ? `<p><b>Tränare:</b> ${esc(x.coach)}</p>` : ""}</div>`;
}
function lineups(s) {
  const l = s.lineups;
  const html = `${lineupSide(l?.home, "is-home")}${lineupSide(l?.away, "is-away")}`;
  return html ? `<h5>Laguppställning <small>${esc(l.home?.confirmed || l.away?.confirmed || "")}</small></h5><div class="svs-cols">${html}</div>` : "";
}

// ---------- Nyheter, Analys, Oddset ----------
function news(s) {
  if (!s.news?.length) return "";
  return `<ul class="svs-news">${s.news.map((n) => `<li><p class="svs-news-head"><b>${esc(n.title)}</b> <small>${n.published ? esc(n.published.slice(0, 16).replace("T", " ")) : ""}${n.source ? ` · ${esc(n.source)}` : ""}</small></p><p>${esc(n.excerpt)}</p></li>`).join("")}</ul>`;
}
function experts(s) {
  if (!s.experts?.length) return "";
  return s.experts.map((x) => `<div class="svs-expert"><p><b>${esc(x.author)}</b> tippar <b class="svs-sign">${esc((x.signs || "").split("").join(" + ") || "–")}</b></p>${String(x.text || "").split("\n").filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("")}</div>`).join("");
}
const ODDSET_MAIN = ["Fulltid", "Antal mål", "Halvtid", "Båda lagen gör mål", "Antal mål - Första halvlek", "Pengarna tillbaka vid oavgjort", "Antal hörnor"];
function oddset(s) {
  if (!s.kambi?.length && !s.odds) return "";
  const groups = new Map();
  if (s.odds) groups.set("Fulltid", [{ outcomes: s.odds.map((o, i) => ({ label: SIGNS[i], line: null, odds: o })) }]);
  for (const b of s.kambi || []) {
    if (!groups.has(b.market)) groups.set(b.market, []);
    groups.get(b.market).push(b);
  }
  const cell = (o) => `<span class="svs-odd"><small>${esc(o.label)}${o.line != null ? ` ${String(o.line).replace(".", ",")}` : ""}</small><b>${dec(o.odds)}</b></span>`;
  // Huvudspelen öppna som hos Svenska Spel, övriga marknader hopfällda
  const market = ([m, list]) => `<div class="svs-market"><h6>${esc(m)}</h6>${list.map((b) => `<div class="svs-odds">${b.outcomes.map(cell).join("")}</div>`).join("")}</div>`;
  const all = [...groups];
  const main = all.filter(([m]) => ODDSET_MAIN.includes(m));
  const rest = all.filter(([m]) => !ODDSET_MAIN.includes(m));
  return `<h5>Alla Oddset-spel på matchen (${s.kambi?.length || 0})</h5>
    ${main.map(market).join("")}
    ${rest.length ? `<details class="svs-more-odds"><summary>Fler spel (${rest.length} marknader: hörnor, kort, skott, lagens mål …)</summary>${rest.map(market).join("")}</details>` : ""}`;
}

/** Hela panelen för en match. keep(k) ger data-keep/open så att utfällda delar överlever omritningen. */
export function svsInfoPanel(p, e, keep) {
  const s = svsEvent(p, e);
  if (!s) return "";
  const key = `svs-${p.product}-${e.eventNumber}`;
  const when = p.svsInfo.updatedAt ? new Date(p.svsInfo.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }) : "";
  const tabs = switcher(key, [
    ["oversikt", "Översikt", overview(s)],
    ["statistik", "Statistik", stats(s, key)],
    ["xstats", "xStats", xstats(s, key)],
    ["tabell", "Tabell", table(s, key)],
    ["lag", "Laguppställning", lineups(s)],
    ["nyheter", `Nyheter (${s.news?.length || 0})`, news(s)],
    ["analys", "Analys", experts(s)],
    ["oddset", "Oddset", oddset(s)],
  ], "tabs");
  return `<details class="svs-info"${keep(key)}>
    <summary><h4>Svenska Spels matchinfo</h4><small>hämtad ${esc(when)}</small></summary>
    <p class="svs-kort"><b>Kort sagt:</b> allt Svenska Spel visar om matchen, i samma flikar som hos dem. <span class="svs-legend"><span class="is-home">${esc(s.home)}</span><span class="is-away">${esc(s.away)}</span></span></p>
    <details class="sb-howto"${keep(`${key}-howto`)}><summary>Så läser du det här</summary><ul>
      <li>Rött = ${esc(s.home)} (hemma), blått = ${esc(s.away)} (borta), som hos Svenska Spel.</li>
      <li><b>Vinstchans</b> är Enetpulses siffra (det Svenska Spel visar), <b>favoritskap</b> är oddset utan marginal. Vår egen procent står längre upp.</li>
      <li><b>Form</b>: V = vinst, O = oavgjort, F = förlust, senaste matchen först.</li>
      <li><b>xP</b> = poäng laget borde ha om matcherna avgjorts av chanserna (xG). Fler poäng än xP = haft tur.</li>
      <li><b>Lagprofil</b>: 100 = högst i ligan, 0 = lägst.</li>
    </ul></details>
    <div class="svs-card">${tabs}</div>
  </details>`;
}

/** Svenska Spels omgångsanalys (fliken Analys) ovanför matchkorten. */
export function svsDrawAnalysis(p, keep) {
  const a = p?.svsInfo?.drawAnalyses || [];
  if (!a.length) return "";
  return `<details class="svs-draw ds-notice"${keep(`svs-draw-${p.product}`)}><summary>Svenska Spels omgångsanalys${a[0].author ? ` · ${esc(a[0].author)}` : ""}</summary>
    ${a.map((x) => `<h5>${esc(x.title)}</h5>${x.text.split("\n").map((t) => `<p>${esc(t)}</p>`).join("")}`).join("")}
  </details>`;
}
