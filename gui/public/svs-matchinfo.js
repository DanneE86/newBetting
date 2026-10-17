// Svenska Spels matchinfo i matchkortets analys (data: p.svsInfo från scripts/fetch-stryktips-svs.mjs).
// Allt som Svenska Spel visar på Stryktipset/Europatipset: vinstchans, form, inbördes, tabell, xStats,
// lagprofil, laguppställning, nyheter, andra spels streck och alla Oddset-spel på matchen.
const SIGNS = ["1", "X", "2"];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pct = (p) => (p == null ? "—" : `${Math.round(p * 100)} %`);
const dec = (x) => (x == null ? "—" : Number(x).toFixed(2).replace(".", ","));
const one = (x) => (x == null ? "—" : Number(x).toFixed(1).replace(".", ","));
const shortDate = (d) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}${d.slice(2, 4) !== new Date().toISOString().slice(2, 4) ? ` -${d.slice(2, 4)}` : ""}` : "");

export const svsEvent = (p, e) => p?.svsInfo?.events?.find((x) => x.eventNumber === e.eventNumber) || null;

function overview(s) {
  const rows = [];
  if (s.venue || s.season) rows.push(`<p><span>Arena</span><strong>${esc(s.venue || "—")}${s.season ? ` · ${esc(s.season)}` : ""}</strong></p>`);
  if (s.winProbability) {
    const w = s.winProbability;
    rows.push(`<p><span title="Enetpulses vinstchans som Svenska Spel visar under Statistik">Vinstchans (Enetpulse)</span><strong>1 ${pct(w.home)} · X ${pct(w.draw)} · 2 ${pct(w.away)}</strong></p>`);
  }
  if (s.favouriteOdds) rows.push(`<p><span title="Oddset omräknat till procent utan marginal">Favoritskap utifrån odds</span><strong>${SIGNS.map((x, i) => `${x} ${Math.round(s.favouriteOdds[i])} %`).join(" · ")}</strong></p>`);
  if (s.startOdds && s.odds) rows.push(`<p><span>Odds start → nu</span><strong>${SIGNS.map((x, i) => `${x} ${dec(s.startOdds[i])}→${dec(s.odds[i])}`).join(" · ")}</strong></p>`);
  if (s.ou25) rows.push(`<p><span>Över/Under 2,5 mål</span><strong>över ${dec(s.ou25.over)} · under ${dec(s.ou25.under)}</strong></p>`);
  if (s.svenskaFolket) rows.push(`<p><span>Svenska folket</span><strong>${SIGNS.map((x, i) => `${x} ${s.svenskaFolket[i]} %`).join(" · ")}</strong></p>`);
  for (const d of s.otherDraws || []) rows.push(`<p><span>${esc(d.product)}</span><strong>${SIGNS.map((x, i) => `${x} ${d.distribution[i] ?? "—"} %`).join(" · ")}</strong></p>`);
  if (s.tioTidningar) rows.push(`<p><span>Tio tidningars tips</span><strong>${SIGNS.map((x, i) => `${x}: ${s.tioTidningar[i]}`).join(" · ")}</strong></p>`);
  if (s.comment) rows.push(`<p><span>Kommentar</span><strong>${esc(s.comment)}</strong></p>`);
  return rows.length ? `<div class="svs-box svs-overview"><h5>Spelstatistik inför match</h5>${rows.join("")}</div>` : "";
}

const matchLi = (m, team) => {
  const r = m.result || null;
  const score = `${m.hg ?? "–"}–${m.ag ?? "–"}${m.pens ? ` <small>(str ${m.pens[0]}–${m.pens[1]})</small>` : ""}`;
  const name = (t) => (t === team ? `<b>${esc(t)}</b>` : esc(t));
  return `<li><span>${shortDate(m.date)}</span>${name(m.home)} <b class="${r ? `f-${r}` : ""}">${score}</b> ${name(m.away)}${m.league ? ` <small>${esc(m.league)}</small>` : ""}</li>`;
};
function formBlock(f, label) {
  if (!f?.matches?.length) return "";
  const letters = f.letters?.length ? f.letters : f.matches.map((m) => m.result).filter(Boolean);
  return `<div class="svs-form-team"><h6>${esc(label || f.team)}</h6>
    <div class="st-form">${letters.map((r) => `<span class="f-${r}">${r}</span>`).join("")}</div>
    <ul class="st-last">${f.matches.map((m) => matchLi(m, f.team)).join("")}</ul></div>`;
}
function form(s) {
  if (!s.form?.length) return "";
  const [h, a] = s.form;
  const ha = s.formHome?.matches?.length || s.formAway?.matches?.length
    ? `<div class="svs-cols">${formBlock(s.formHome, `${s.formHome?.team || s.home} hemma`)}${formBlock(s.formAway, `${s.formAway?.team || s.away} borta`)}</div>` : "";
  return `<div class="svs-box"><h5>Form <small>senaste matcherna, alla turneringar</small></h5>
    <div class="svs-cols">${formBlock(h)}${formBlock(a)}</div>${ha}</div>`;
}

function h2h(s) {
  const x = s.h2h;
  if (!x?.matches?.length) return "";
  const [w, d, l] = (x.summary || "").split("-");
  const home = s.h2hHome?.matches?.length ? `<h6>På ${esc(s.home)}s hemmaplan${s.h2hHome.summary ? ` · ${esc(s.h2hHome.summary)}` : ""}</h6><ul class="st-last">${s.h2hHome.matches.map((m) => matchLi(m)).join("")}</ul>` : "";
  return `<div class="svs-box"><h5>Inbördes möten${x.summary ? ` <small>${esc(s.home)} ${w} vinster · ${d} oavgjorda · ${esc(s.away)} ${l} vinster</small>` : ""}</h5>
    <ul class="st-last">${x.matches.map((m) => matchLi(m)).join("")}</ul>${home}</div>`;
}

function tableRows(rows, teams) {
  return rows.map((r) => `<tr class="${teams.includes(r.team) ? "is-team" : ""}"><td>${r.pos}</td><th>${esc(r.team)}</th><td>${r.played}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td><b>${r.pts}</b></td></tr>`).join("");
}
function table(s, keep, key) {
  const t = s.table;
  if (!t?.rows?.length) return "";
  const teams = [s.home, s.away];
  const head = `<thead><tr><th>#</th><th>Lag</th><th>M</th><th>V</th><th>O</th><th>F</th><th>+/-</th><th>P</th></tr></thead>`;
  const idx = t.rows.map((r, i) => (teams.includes(r.team) ? i : -1)).filter((i) => i >= 0);
  const near = new Set(idx.flatMap((i) => [i - 2, i - 1, i, i + 1, i + 2]));
  const short = idx.length ? t.rows.filter((_, i) => near.has(i)) : t.rows.slice(0, 8);
  const sub = (rows, lbl) => (rows?.length ? `<h6>${lbl}</h6><table class="ds-table svs-table">${head}<tbody>${tableRows(rows, teams)}</tbody></table>` : "");
  return `<div class="svs-box"><h5>Tabell <small>lagen och deras grannar</small></h5>
    <table class="ds-table svs-table">${head}<tbody>${tableRows(short, teams)}</tbody></table>
    <details class="svs-more"${keep(`${key}-tabell`)}><summary>Hela tabellen${t.home ? ", hemma och borta" : ""}</summary>
      ${sub(t.rows, "Totalt")}${sub(t.home, "Hemma")}${sub(t.away, "Borta")}
      ${t.legend?.length ? `<p class="svs-note">${t.legend.map(esc).join(" · ")}</p>` : ""}
    </details></div>`;
}

const XSTAT = [
  ["points", "Poäng", (x) => x],
  ["xp", "xP (förväntade poäng)", one],
  ["xpPointsDiff", "Poäng mot xP", (x) => (x > 0 ? `+${one(x)}` : one(x))],
  ["tablePosition", "Tabellplats", (x) => x],
  ["expectedTablePosition", "Förväntad plats (xP)", (x) => x],
  ["xG", "xG per match", dec],
  ["xGC", "xG emot per match", dec],
  ["averageScored", "Mål per match", dec],
  ["averageConceded", "Insläppta per match", dec],
  ["averageScoredBetween", "Mål i inbördes", dec],
  ["averageScoredHomeAndAway", "Mål hemma resp. borta", dec],
];
function xstats(s) {
  const x = s.xStats;
  if (!x) return "";
  const part = (o) => (o ? XSTAT.filter(([k]) => o[k]).map(([k, lbl, f]) => `<tr><th>${lbl}</th><td>${f(o[k].home)}</td><td>${f(o[k].away)}</td></tr>`).join("") : "");
  const tab = (o, lbl) => (o ? `<table class="ds-table svs-table svs-x"><thead><tr><th>${lbl}</th><th>${esc(s.home)}</th><th>${esc(s.away)}</th></tr></thead><tbody>${part(o)}</tbody></table>` : "");
  return `<div class="svs-box"><h5>xStats <small>PlayMaker, samma som fliken xStats</small></h5><div class="svs-cols">${tab(x.season, "Hela säsongen")}${tab(x.last5, "5 senaste")}</div></div>`;
}

const STYLE = {
  possession: "Bollinnehav", chancesCreated: "Skapade chanser", chancesConceded: "Släppta chanser (lågt = bra)", counterAttacks: "Kontringar",
  setPiecesOff: "Fasta situationer anfall", setPiecesDef: "Fasta situationer försvar", "Goals PG": "Mål/match", "Shots PG": "Skott/match",
  "xShots PG": "xSkott/match", "xCorners PG": "xHörnor/match", "Yellow Cards PG": "Gula kort/match", "Red Cards PG": "Röda kort/match",
};
function teamStyle(s) {
  const t = s.teamStyle;
  if (!t?.home && !t?.away) return "";
  const keys = Object.keys(STYLE).filter((k) => t.home?.[k] != null || t.away?.[k] != null);
  const bar = (v) => (v == null ? "<td>—</td>" : `<td><span class="svs-bar" style="--v:${Math.round(v * 100)}%"></span><small>${Math.round(v * 100)}</small></td>`);
  return `<div class="svs-box"><h5>Lagprofil <small>percentil i ligan, 100 = högst</small></h5>
    <table class="ds-table svs-table svs-style"><thead><tr><th></th><th>${esc(s.home)}</th><th>${esc(s.away)}</th></tr></thead>
    <tbody>${keys.map((k) => `<tr><th>${STYLE[k]}</th>${bar(t.home?.[k])}${bar(t.away?.[k])}</tr>`).join("")}</tbody></table></div>`;
}

const REASON = { injured: "skadad", suspended: "avstängd", red_card: "avstängd", doubtful: "osäker" };
function lineupSide(x) {
  if (!x?.starters?.length) return "";
  return `<div class="svs-lineup-side"><h6>${esc(x.team || "")}${x.formation ? ` <small>${esc(x.formation)}</small>` : ""}</h6>
    <p>${x.starters.map((p) => `${p.shirt ? `<small>${esc(p.shirt)}</small> ` : ""}${esc(p.name)}`).join(", ")}</p>
    ${x.unavailable?.length ? `<p class="svs-out"><b>Otillgängliga:</b> ${x.unavailable.map((p) => `${esc(p.name)}${p.reason ? ` <small>(${esc(REASON[p.reason] || p.reason)})</small>` : ""}`).join(", ")}</p>` : ""}
    ${x.bench?.length ? `<p><b>Avbytare:</b> ${x.bench.map((p) => esc(p.name)).join(", ")}</p>` : ""}
    ${x.coach ? `<p><b>Tränare:</b> ${esc(x.coach)}</p>` : ""}</div>`;
}
function lineups(s) {
  const l = s.lineups;
  if (!l?.home?.starters?.length && !l?.away?.starters?.length) return "";
  return `<div class="svs-box"><h5>Laguppställning <small>${esc(l.home?.confirmed || l.away?.confirmed || "")}</small></h5><div class="svs-cols">${lineupSide(l.home)}${lineupSide(l.away)}</div></div>`;
}

function news(s, keep, key) {
  if (!s.news?.length) return "";
  const item = (n) => `<li><p class="svs-news-head"><b>${esc(n.title)}</b> <small>${n.published ? esc(n.published.slice(0, 16).replace("T", " ")) : ""}${n.source ? ` · ${esc(n.source)}` : ""}</small></p><p>${esc(n.excerpt)}</p></li>`;
  const [first, ...rest] = s.news.slice(0, 3);
  return `<div class="svs-box"><h5>Nyheter <small>${s.news.length} st</small></h5><ul class="svs-news">${[first, ...rest].map(item).join("")}</ul>
    ${s.news.length > 3 ? `<details class="svs-more"${keep(`${key}-news`)}><summary>Fler nyheter (${s.news.length - 3})</summary><ul class="svs-news">${s.news.slice(3).map(item).join("")}</ul></details>` : ""}</div>`;
}

function kambi(s, keep, key) {
  if (!s.kambi?.length) return "";
  const groups = new Map();
  for (const b of s.kambi) {
    if (!groups.has(b.market)) groups.set(b.market, []);
    groups.get(b.market).push(b);
  }
  const rows = [...groups].map(([m, list]) => `<tr><th>${esc(m)}</th><td>${list.map((b) => b.outcomes.map((o) => `${esc(o.label)}${o.line != null ? ` ${String(o.line).replace(".", ",")}` : ""} <b>${dec(o.odds)}</b>`).join(" · ")).join("<br>")}</td></tr>`).join("");
  return `<details class="svs-more svs-kambi"${keep(`${key}-kambi`)}><summary>Alla Oddset-spel på matchen (${s.kambi.length})</summary>
    <table class="ds-table svs-table"><tbody>${rows}</tbody></table></details>`;
}

/** Hela panelen för en match. keep(k) ger data-keep/open så att utfällda delar överlever omritningen. */
export function svsInfoPanel(p, e, keep) {
  const s = svsEvent(p, e);
  if (!s) return "";
  const key = `svs-${p.product}-${e.eventNumber}`;
  const when = p.svsInfo.updatedAt ? new Date(p.svsInfo.updatedAt).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }) : "";
  return `<details class="svs-info"${keep(key)}>
    <summary><h4>Svenska Spels matchinfo</h4><small>hämtad ${esc(when)}</small></summary>
    <p class="svs-kort"><b>Kort sagt:</b> allt Svenska Spel visar om matchen, samlat under vår egen analys ovan.</p>
    <details class="sb-howto"${keep(`${key}-howto`)}><summary>Så läser du det här</summary><ul>
      <li><b>Vinstchans</b> är Enetpulses siffra (det Svenska Spel visar), <b>favoritskap</b> är oddset utan marginal. Vår egen procent står längre upp.</li>
      <li><b>Form</b>: V = vinst, O = oavgjort, F = förlust, senaste matchen först.</li>
      <li><b>xP</b> = poäng laget borde ha om matcherna avgjorts av chanserna (xG). Fler poäng än xP = haft tur.</li>
      <li><b>Lagprofil</b>: 100 = högst i ligan, 0 = lägst.</li>
    </ul></details>
    <div class="svs-grid">${overview(s)}${form(s)}${h2h(s)}${table(s, keep, key)}${xstats(s)}${teamStyle(s)}${lineups(s)}${news(s, keep, key)}</div>
    ${kambi(s, keep, key)}
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
