// Startelva per match: elvorna på en plan, klicka på en spelare för att jämföra mot den direkta motståndaren
// (ytter mot ytterback, anfallare mot mittback, mittfält mot mittfält, målvakt mot målvakt) och se spelarnas
// lyckade prestationer. Data från GET /api/startelva?key=… (scripts/lib/startelva.mjs). Används av Oddset-korten
// (app.js) och Stryktipsets/Europatipsets matchkort (stryktips.js).
//
// Värden: startelvaButton(key) och startelvaPanel(key) ger HTML som värdsidan lägger in. Modulen håller tillståndet
// per match och ritar om sin egen panel, så att en omritning av värdsidan inte stänger den.

import { setCardContext, cardHostHtml, radarSvg as pcRadar, radarTally as pcTally, axesFor } from "/spelarkort.js";

const state = new Map(); // key -> { open, loading, data, error, sel, focus }
const st = (key) => {
  if (!state.has(key)) state.set(key, { open: false, loading: false, data: null, error: null, sel: null, focus: null, mode: "duel", pick: [] });
  return state.get(key);
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = (x, d = 2) => (x == null || !Number.isFinite(Number(x)) ? "—" : Number(x).toFixed(d).replace(/\.?0+$/, "").replace(".", ","));
const ordinal = (n) => {
  const r = Math.round(n), l = r % 10, l2 = r % 100;
  return `${r}:${(l === 1 || l === 2) && l2 !== 11 && l2 !== 12 ? "a" : "e"}`;
};
const sel = (key) => `[data-se-key="${CSS.escape(key)}"]`;

/** Knappen "Startelva" (lägg i matchkortets knapprad). */
export function startelvaButton(key, { cls = "" } = {}) {
  const s = st(key);
  return `<button type="button" class="btn-startelva ${cls}" data-se-toggle data-se-key="${esc(key)}" aria-expanded="${s.open}"
    title="Startelvan på planen – klicka på en spelare för att jämföra mot motståndaren">${s.open ? "Dölj startelva" : "Startelva"}</button>`;
}

/** Panelen (tom när den är stängd). */
export function startelvaPanel(key) {
  const s = st(key);
  return `<div class="se-panel" data-se-key="${esc(key)}"${s.open ? "" : " hidden"}>${s.open ? panelBody(key, s) : ""}</div>`;
}

function rerender(key) {
  const s = st(key);
  for (const el of document.querySelectorAll(`.se-panel${sel(key)}`)) {
    el.hidden = !s.open;
    el.innerHTML = s.open ? panelBody(key, s) : "";
  }
  for (const b of document.querySelectorAll(`.btn-startelva${sel(key)}`)) {
    b.setAttribute("aria-expanded", String(s.open));
    b.textContent = s.open ? "Dölj startelva" : "Startelva";
  }
}

async function load(key, { refresh = false } = {}) {
  const s = st(key);
  s.loading = true;
  s.error = null;
  rerender(key);
  try {
    const qs = new URLSearchParams({ key });
    const res = await fetch(refresh ? `/api/startelva/fetch?${qs}` : `/api/startelva?${qs}`, { method: refresh ? "POST" : "GET", cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (body.error === "Okänd API-route") throw new Error("GUI-servern kör en äldre version – starta om den (npm run gui) och ladda om sidan.");
    if (!res.ok && !body.reason) throw new Error(body.error || `Servern svarade ${res.status}`);
    s.data = body;
    // Spelarkortet (spindel mot ligan, jämförelse, alla stats) för matchens 22 spelare
    if (body.ok) {
      const players = {};
      for (const p of Object.values(body.players)) {
        if (p.noData) continue;
        players[p.id] = { key: String(p.id), name: p.name, short: p.short, team: p.team, teamName: body.teams[p.team].name, group: p.group,
          posLabel: p.roleLabel, club: p.club, age: p.age, statsFrom: p.statsFrom, minutes: p.minutes, rating: p.rating,
          goals: p.goals, assists: p.assists, stats: p.stats };
      }
      setCardContext(`se|${key}`, { players, labels: body.statLabels });
    }
    // Första nyckelduellen visas direkt
    if (body.ok && (!s.sel || !body.comparisons?.[s.sel])) {
      s.sel = body.keyDuels?.[0] || Object.keys(body.comparisons || {})[0] || null;
      s.focus = null;
    }
  } catch (e) {
    s.error = e.message || String(e);
  } finally {
    s.loading = false;
    rerender(key);
  }
}

// ---------- Rendering ----------

function panelBody(key, s) {
  if (s.loading && !s.data) return `<p class="se-empty">Hämtar startelvan…</p>`;
  if (s.error) return `<p class="se-empty">${esc(s.error)}</p>`;
  const v = s.data;
  if (!v) return "";
  const refresh = `<button type="button" class="btn-ghost se-refresh" data-se-refresh data-se-key="${esc(key)}" ${s.loading ? "disabled" : ""}
    title="Hämta elvan från FotMob nu (den officiella släpps ungefär en timme före avspark)">${s.loading ? "Hämtar…" : v.ok ? "Hämta om elvan" : "Hämta startelva"}</button>`;
  if (!v.ok) return `<div class="se-head"><span class="se-chip">Ingen elva</span>${refresh}</div><p class="se-empty">${esc(v.reason || v.error || "Ingen startelva")}</p>`;

  const P = v.players;
  const H = v.teams.home, A = v.teams.away;
  const when = v.fetchedAt ? new Date(v.fetchedAt).toLocaleString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const free = s.mode === "free";
  const pair = free ? s.pick : s.sel ? s.sel.split("-") : [];
  const focus = free ? null : s.focus ?? null;
  const marked = new Set(pair.map(String));
  const modeBtn = `<button type="button" class="se-mode${free ? " is-on" : ""}" data-se-mode data-se-key="${esc(key)}" aria-pressed="${free}">${free ? "Tillbaka till dueller" : "Jämför två valfria spelare"}</button>`;
  const freeHint = free
    ? `<div class="se-pickbar">${s.pick.length === 2 ? "Jämför" : "Klicka på två spelare på planen (vilket lag som helst)"}${s.pick.map((id) => ` <b>${esc(P[id]?.short)}</b>`).join(" och")}${s.pick.length ? ` <button type="button" class="se-alt" data-se-clear data-se-key="${esc(key)}">Rensa val</button>` : ""}</div>`
    : "";

  const out = (t) => (t.unavailable?.length ? `<div class="se-note"><b>${esc(t.name)}</b> saknar: ${t.unavailable.map((u) => `${esc(u.name)}${u.type ? ` (${u.type === "injury" ? "skada" : u.type === "suspension" ? "avstängd" : esc(u.type)})` : ""}`).join(", ")}</div>` : "");

  return `<div class="se-wrap" data-pc-ctx="${esc(`se|${key}`)}">
    <div class="se-head">
      <span class="se-chip ${v.confirmed ? "se-chip-ok" : ""}">${esc(v.status)}</span>
      <span class="se-sub">FotMob${when ? ` · hämtad ${esc(when)}` : ""}</span>
      ${modeBtn}
      ${refresh}
    </div>
    ${helpHtml()}
    ${freeHint}
    <div class="se-grid">
      <div class="se-pitch" role="group" aria-label="Startelvorna – klicka på en spelare för att jämföra">
        <div class="se-team-label se-top"><span class="se-dot se-away"></span>${esc(A.name)} <small>${esc(A.formation || "")}</small></div>
        <div class="se-team-label se-bottom"><span class="se-dot se-home"></span>${esc(H.name)} <small>${esc(H.formation || "")}</small></div>
        <div class="se-line se-mid"></div><div class="se-circle"></div><div class="se-box se-box-top"></div><div class="se-box se-box-bottom"></div>
        ${H.xi.map((id) => marker(P[id], "home", marked, focus)).join("")}
        ${A.xi.map((id) => marker(P[id], "away", marked, focus)).join("")}
      </div>
      <div class="se-side">
        ${free ? radarFreeSide(v, s) : keyDuelList(v, s)}
      </div>
    </div>
    ${out(H)}${out(A)}
    ${free ? (s.pick.length === 2 ? freeHtml(v, s) : "") : s.sel && v.comparisons[s.sel] ? compareHtml(v, s) : ""}
    ${cardHostHtml(`se|${key}`)}
  </div>`;
}

function marker(p, side, marked, focus) {
  if (!p) return "";
  const top = side === "home" ? 97 - (p.x ?? 0.5) * 46 : 3 + (p.x ?? 0.5) * 46;
  const left = 7 + (side === "home" ? (p.y ?? 0.5) : 1 - (p.y ?? 0.5)) * 86;
  const cls = ["se-p", `se-${side}`, marked.has(String(p.id)) ? "is-sel" : "", String(focus) === String(p.id) ? "is-focus" : "", p.noData ? "no-data" : ""].join(" ");
  const rating = p.rating ? `<span class="se-r">${num(p.rating, 1)}</span>` : "";
  return `<button type="button" class="${cls}" style="top:${top.toFixed(1)}%;left:${left.toFixed(1)}%" data-se-player="${esc(p.id)}"
      aria-label="${esc(`${p.name}, ${p.roleLabel.toLowerCase()} – jämför med motståndaren`)}" title="${esc(`${p.name} · ${p.roleLabel}${p.club ? ` · ${p.club}` : ""}`)}">
      <span class="se-shirt">${esc(p.shirt ?? "")}${p.captain ? '<i class="se-c">C</i>' : ""}</span><span class="se-name">${esc(p.short)}</span>${rating}
    </button>`;
}

/** Fördel i en jämförelse: "a"/"b" -> spelarens lag och namn. */
function whoBadge(v, pairKey, who, level) {
  const [a, b] = pairKey.split("-");
  if (!who) return `<span class="se-badge se-even">Jämnt</span>`;
  const p = v.players[who === "a" ? a : b];
  const lvl = level === "lite" ? ", lite" : level === "klart" ? ", klart" : "";
  return `<span class="se-badge se-${p.team}">${esc(p.short)}${lvl}</span>`;
}

const KIND_ORDER = ["kant", "centralt", "mittfalt", "malvakt"];
const KIND_HEAD = { kant: "Ytter mot ytterback", centralt: "Anfall mot mittback", mittfalt: "Mittfält", malvakt: "Målvakt" };

function keyDuelList(v, s) {
  const groups = KIND_ORDER.map((k) => [k, v.keyDuels.filter((x) => v.comparisons[x]?.kind === k)]).filter(([, l]) => l.length);
  if (!groups.length) return "";
  return `<div class="se-duels"><h4>Nyckeldueller</h4>${groups.map(([k, list]) => `<div class="se-dgroup"><div class="se-k">${KIND_HEAD[k]}</div>
    ${list.map((pk) => {
      const [a, b] = pk.split("-");
      const c = v.comparisons[pk];
      return `<button type="button" class="se-duel${s.sel === pk ? " is-sel" : ""}" data-se-pair="${esc(pk)}" aria-pressed="${s.sel === pk}">
        <span class="se-duel-n"><span class="se-dot se-home"></span>${esc(v.players[a].short)} – <span class="se-dot se-away"></span>${esc(v.players[b].short)}</span>
        ${whoBadge(v, pk, c.who, c.level)}</button>`;
    }).join("")}</div>`).join("")}</div>`;
}

function statCell(p, key, rateKeys, other) {
  const x = p.stats?.[key];
  if (!x) return `<td class="se-v">—</td>`;
  const rate = rateKeys.has(key);
  const val = rate ? `${num(x[0], key === "rating" ? 2 : 1)}${key === "rating" ? "" : " %"}` : num(x[1]);
  const pct = x[2];
  const better = pct != null && other?.[2] != null && pct - other[2] >= 8;
  const tot = !rate && x[0] != null ? `<small>${num(x[0], 2)} tot</small>` : "";
  return `<td class="se-v${better ? " is-better" : ""}"><span class="se-val">${val}</span>${tot}
    ${pct != null ? `<span class="se-bar" title="${ordinal(pct)} percentilen"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></span><small class="se-pct">${ordinal(pct)} perc.</small>` : ""}</td>`;
}

function playerHead(p, team) {
  const bits = [p.roleLabel, p.club, p.age ? `${p.age} år` : null].filter(Boolean).join(" · ");
  const basis = p.noData ? "Ingen statistik hittad" : `${p.statsFrom || "Säsongen"}${p.minutes ? ` · ${p.minutes} min` : ""}${p.rating ? ` · betyg ${num(p.rating, 2)}` : ""}`;
  return `<div class="se-ph se-ph-${p.team}">
    <div class="se-ph-n"><span class="se-dot se-${p.team}"></span><b>${esc(p.name)}</b> <span class="se-sub">${esc(team)}</span></div>
    <div class="se-sub">${esc(bits)}</div>
    <div class="se-sub">${esc(basis)}${p.injury ? ` · <span class="se-warn">skadad: ${esc(p.injury)}</span>` : ""}</div>
    ${p.noData ? "" : `<button type="button" class="se-alt se-card-btn" data-pc-open="${esc(p.id)}">Spindel mot ligan och alla stats</button>`}
  </div>`;
}

function successList(v, p) {
  const list = p.role === "gk" ? v.successGk : v.success;
  const rows = list.map(([label, k, rk]) => {
    const x = p.stats?.[k];
    if (!x || x[0] == null) return "";
    const r = rk ? p.stats?.[rk] : null;
    const pct = x[2];
    return `<li><span class="se-s-l">${esc(label)}</span>
      <span class="se-s-v"><b>${num(x[0], 2)}</b>${x[1] != null && !["goals_prevented"].includes(k) ? ` <small>${num(x[1])}/90</small>` : ""}${r?.[0] != null ? ` <small>· ${num(r[0], 1)} % lyckas</small>` : ""}</span>
      ${pct != null ? `<span class="se-bar se-bar-s" title="${ordinal(pct)} percentilen"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></span>` : ""}</li>`;
  }).filter(Boolean);
  if (!rows.length) return `<p class="se-empty">Ingen statistik för ${esc(p.short)}.</p>`;
  return `<ul class="se-success">${rows.join("")}</ul>`;
}

function recentList(p) {
  if (!p.recent?.length) return "";
  return `<div class="se-recent">${p.recent.map((m) => {
    const r = m.rating ? Number(m.rating) : null;
    const cls = r == null ? "" : r >= 7.5 ? "r-hi" : r >= 6.5 ? "r-mid" : "r-lo";
    const ga = [m.goals ? `${m.goals} mål` : "", m.assists ? `${m.assists} ass` : ""].filter(Boolean).join(", ");
    return `<span class="se-m ${cls}" title="${esc(`${m.date} ${m.home ? "hemma" : "borta"} mot ${m.opp} · ${m.min} min${ga ? ` · ${ga}` : ""}`)}">${r ? num(r, 1) : m.min ? "–" : "bänk"}</span>`;
  }).join("")}</div>`;
}

function compareHtml(v, s) {
  const pk = s.sel;
  const c = v.comparisons[pk];
  const [ia, ib] = pk.split("-");
  const a = v.players[ia], b = v.players[ib];
  const rateKeys = new Set(v.rateKeys);
  const teamName = (p) => v.teams[p.team].name;
  // Andra motståndare för spelaren man klickade på
  const f = s.focus != null ? v.players[s.focus] : null;
  const alts = f ? (v.opponents[f.id] || []).filter((o) => String(o) !== String(f.id === a.id ? b.id : a.id)) : [];
  const altHtml = f && alts.length ? `<div class="se-alts">Jämför ${esc(f.short)} med: ${alts.map((o) => `<button type="button" class="se-alt" data-se-vs="${esc(f.id)}-${esc(o)}">${esc(v.players[o].short)} <small>${esc(v.players[o].roleLabel.toLowerCase())}</small></button>`).join("")}</div>` : "";

  const aspects = c.aspects.map((x) => `<div class="se-aspect">
      <div class="se-aspect-h"><span>${esc(x.title)}</span>${whoBadge(v, pk, x.who, x.level)}</div>
      ${x.a != null && x.b != null ? `<div class="se-vs"><span class="se-vs-n">${esc(a.short)} <b>${x.a}</b></span>
        <span class="se-vs-bar"><i class="se-home-bg" style="width:${(x.a / (x.a + x.b || 1)) * 100}%"></i><i class="se-away-bg" style="width:${(x.b / (x.a + x.b || 1)) * 100}%"></i></span>
        <span class="se-vs-n"><b>${x.b}</b> ${esc(b.short)}</span></div>` : `<div class="se-sub">För lite data</div>`}
      ${x.why.length ? `<ul class="se-why">${x.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}
    </div>`).join("");

  const rows = c.rows.map((k) => {
    const xa = a.stats?.[k], xb = b.stats?.[k];
    if (!xa && !xb) return "";
    return `<tr><th scope="row">${esc(v.statName[k] || k)}</th>${statCell(a, k, rateKeys, xb)}${statCell(b, k, rateKeys, xa)}</tr>`;
  }).join("");

  return `<section class="se-compare" aria-label="Jämförelse ${esc(a.name)} mot ${esc(b.name)}">
    <div class="se-compare-h">
      <h4>${esc(c.kindLabel)}: ${esc(a.short)} mot ${esc(b.short)}</h4>
      <div>Sammanvägt: ${whoBadge(v, pk, c.who, c.level)}</div>
    </div>
    ${altHtml}
    ${summaryHtml(c, a, b)}
    <div class="se-two">${playerHead(a, teamName(a))}${playerHead(b, teamName(b))}</div>
    ${radarSvg(a, b)}
    <div class="se-aspects">${aspects}</div>
    ${c.note ? `<p class="se-note se-warn">${esc(c.note)}</p>` : ""}
    ${rows ? `<div class="se-table-wrap"><table class="se-table ds-table">
      <thead><tr><th scope="col">Per 90 minuter</th><th scope="col"><span class="se-dot se-home"></span>${esc(a.short)}</th><th scope="col"><span class="se-dot se-away"></span>${esc(b.short)}</th></tr></thead>
      <tbody>${rows}</tbody></table></div>` : ""}
    <h4 class="se-h">Lyckade prestationer – säsongen</h4>
    <div class="se-two">
      <div><div class="se-ph-n"><span class="se-dot se-home"></span><b>${esc(a.short)}</b></div>${successList(v, a)}<div class="se-k">Senaste matcherna (betyg)</div>${recentList(a) || '<span class="se-sub">—</span>'}</div>
      <div><div class="se-ph-n"><span class="se-dot se-away"></span><b>${esc(b.short)}</b></div>${successList(v, b)}<div class="se-k">Senaste matcherna (betyg)</div>${recentList(b) || '<span class="se-sub">—</span>'}</div>
    </div>
  </section>`;
}

// ---------- Hjälp, sammanfattning och spindeldiagram ----------

function helpHtml() {
  return `<details class="se-help"><summary>Så läser du det här</summary>
    <ul>
      <li><b>Planen</b> visar elvorna som FotMob tror att lagen ställer upp med. "Förväntad elva" och "Senaste elvan" är gissningar; "Officiell startelva" kommer ungefär en timme före avspark (tryck då "Hämta om elvan").</li>
      <li><b>Nyckeldueller</b> är spelarna som möts på planen: yttern mot ytterbacken på samma kant, anfallaren mot mittbackarna, mittfältarna mot varandra och målvakterna. Märket till höger säger vem som har övertaget.</li>
      <li><b>Klicka på en spelare</b> för att se hen mot sin direkta motståndare. <b>Jämför två valfria spelare</b> låter dig välja vilka två som helst.</li>
      <li><b>Percentil</b>: "90:e perc." betyder bättre än 90 % av spelarna på samma position i spelarens egen liga, räknat per 90 minuter. Högre är alltid bättre – även på "dribblad förbi", där färre gånger ger högre percentil.</li>
      <li><b>Poängen 0–100</b> i duellerna är ett snitt av percentilerna i de nyckeltal som avgör just den situationen. 50 är genomsnittligt.</li>
      <li><b>Lyckade prestationer</b> är hur många gånger spelaren lyckats med något under säsongen (t.ex. 47 lyckade dribblingar), hur många per 90 minuter och hur stor andel av försöken som lyckas.</li>
      <li><b>Spindeldiagrammet</b>: ju längre ut, desto bättre percentil. Större yta = mer komplett spelare.</li>
      <li>Ligorna är olika starka: en hög percentil i League Two är inte värd lika mycket som i Premier League. Startelvan påverkar inte tipsen.</li>
    </ul></details>`;
}

const LEVEL_TXT = { lite: "lite bättre", tydlig: "bättre", klart: "klart bättre" };

/** Klartext: vem vinner duellen och i vilka situationer. */
function summaryHtml(c, a, b) {
  const name = (w) => (w === "a" ? a.short : b.short);
  const head = c.who ? `${name(c.who)} vinner duellen${c.level === "lite" ? " knappt" : c.level === "klart" ? " klart" : ""}.` : "Duellen är jämn.";
  const lines = c.aspects.map((x) => {
    if (x.a == null || x.b == null) return `${x.title}: för lite statistik.`;
    if (!x.who) return `${x.title}: jämnt (${x.a} mot ${x.b} av 100).`;
    const [w, l] = x.who === "a" ? [x.a, x.b] : [x.b, x.a];
    return `${x.title}: ${name(x.who)} är ${LEVEL_TXT[x.level] || "bättre"} (${w} mot ${l} av 100).`;
  });
  return `<div class="se-summary"><p><b>Kort sagt:</b> ${esc(head)}</p><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>`;
}

// Spindeln är spelarkortets (gui/public/spelarkort.js): axlarna följer första spelarens position, streckad ring = ligasnitt
const radarCls = (a, b) => [`pc-c-${a.team}`, a.team === b.team ? "pc-c-alt" : `pc-c-${b.team}`];
function radarSvg(a, b) {
  const [ca, cb] = radarCls(a, b);
  return pcRadar([{ p: a, cls: ca }, { p: b, cls: cb }], axesFor(a.group));
}
const radarTally = (a, b) => pcTally(a, b, axesFor(a.group));

// Fri jämförelse: vilka två spelare som helst
const FREE_ROWS = ["rating", "goals", "expected_goals", "shots", "chances_created", "expected_assists", "dribbles_succeeded",
  "successful_passes", "successful_passes_accuracy", "duel_won_percent", "aerials_won_percent", "matchstats.headers.tackles",
  "interceptions", "recoveries", "dribbled_past"];
const FREE_ROWS_GK = ["rating", "save_percentage", "saves", "goals_prevented", "clean_sheet_team_title", "error_led_to_goal",
  "keeper_high_claim", "keeper_sweeper", "successful_passes_accuracy", "long_ball_succeeeded_accuracy"];


function radarFreeSide(v, s) {
  if (s.pick.length < 2) return `<p class="se-empty">Välj två spelare så visas spindeldiagrammet här.</p>`;
  const [a, b] = s.pick.map((id) => v.players[id]);
  return radarSvg(a, b);
}

const leagueOf = (p) => String(p.statsFrom || "").replace(/\s*\d{4}.*$/, "");

function freeHtml(v, s) {
  const [a, b] = s.pick.map((id) => v.players[id]);
  const rateKeys = new Set(v.rateKeys);
  const t = radarTally(a, b);
  const total = t.wa + t.wb + t.even;
  const [best, other] = t.wa >= t.wb ? [a, b] : [b, a];
  const head = !total ? "För lite statistik för att jämföra."
    : t.wa === t.wb ? `Jämnt: båda är bättre på ${t.wa} av ${total} områden.`
      : `${best.short} är bättre på ${Math.max(t.wa, t.wb)} av ${total} områden, ${other.short} på ${Math.min(t.wa, t.wb)}${t.even ? `, jämnt på ${t.even}` : ""}.`;
  const leagueWarn = leagueOf(a) && leagueOf(b) && leagueOf(a) !== leagueOf(b)
    ? `<p class="se-note se-warn">Olika ligor (${esc(a.statsFrom)} / ${esc(b.statsFrom)}): percentilerna mäts mot respektive liga, så de är inte helt jämförbara.</p>` : "";
  const rows = (a.role === "gk" && b.role === "gk" ? FREE_ROWS_GK : FREE_ROWS).map((k) => {
    const xa = a.stats?.[k], xb = b.stats?.[k];
    if (!xa && !xb) return "";
    return `<tr><th scope="row">${esc(v.statName[k] || k)}</th>${statCell(a, k, rateKeys, xb)}${statCell(b, k, rateKeys, xa)}</tr>`;
  }).join("");
  const [ca, cb] = radarCls(a, b);
  const teamName = (p) => v.teams[p.team].name;
  const col = (p, c) => `<div><div class="se-ph-n"><span class="se-key ${c}"></span><b>${esc(p.short)}</b></div>${successList(v, p)}<div class="se-k">Senaste matcherna (betyg)</div>${recentList(p) || '<span class="se-sub">—</span>'}</div>`;
  return `<section class="se-compare" aria-label="Jämförelse ${esc(a.name)} mot ${esc(b.name)}">
    <div class="se-compare-h"><h4>${esc(a.short)} mot ${esc(b.short)}</h4></div>
    <div class="se-summary"><p><b>Kort sagt:</b> ${esc(head)}</p></div>
    ${leagueWarn}
    <div class="se-two">${playerHead(a, teamName(a))}${playerHead(b, teamName(b))}</div>
    ${rows ? `<div class="se-table-wrap"><table class="se-table ds-table">
      <thead><tr><th scope="col">Per 90 minuter</th><th scope="col"><span class="se-key ${ca}"></span>${esc(a.short)}</th><th scope="col"><span class="se-key ${cb}"></span>${esc(b.short)}</th></tr></thead>
      <tbody>${rows}</tbody></table></div>` : ""}
    <h4 class="se-h">Lyckade prestationer – säsongen</h4>
    <div class="se-two">${col(a, ca)}${col(b, cb)}</div>
  </section>`;
}

// ---------- Klick ----------

document.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-se-toggle], [data-se-refresh], [data-se-mode], [data-se-clear], [data-se-player], [data-se-pair], [data-se-vs]");
  if (!t) return;
  const key = t.dataset.seKey || t.closest(".se-panel")?.dataset.seKey;
  if (!key) return;
  const s = st(key);
  if (t.matches("[data-se-toggle]")) {
    s.open = !s.open;
    if (s.open && !s.data && !s.loading) load(key);
    else rerender(key);
    return;
  }
  if (t.matches("[data-se-refresh]")) {
    load(key, { refresh: true });
    return;
  }
  if (t.matches("[data-se-mode]")) {
    s.mode = s.mode === "free" ? "duel" : "free";
    s.pick = [];
    rerender(key);
    return;
  }
  if (t.matches("[data-se-clear]")) {
    s.pick = [];
    rerender(key);
    return;
  }
  const v = s.data;
  if (!v?.ok) return;
  // Fri jämförelse: första klicket väljer spelare 1, andra spelare 2, ett tredje byter ut spelare 2
  if (s.mode === "free" && t.matches("[data-se-player]")) {
    const id = t.dataset.sePlayer;
    if (s.pick.includes(id)) s.pick = s.pick.filter((x) => x !== id);
    else s.pick = s.pick.length < 2 ? [...s.pick, id] : [s.pick[0], id];
    rerender(key);
    if (s.pick.length === 2) document.querySelector(`.se-panel${sel(key)} .se-compare`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const pairOf = (x, y) => (v.players[x].team === "home" ? `${x}-${y}` : `${y}-${x}`);
  if (t.matches("[data-se-player]")) {
    const id = t.dataset.sePlayer;
    const opp = v.opponents[id]?.[0];
    if (!opp) return;
    s.focus = id;
    s.sel = pairOf(id, opp);
  } else if (t.matches("[data-se-pair]")) {
    s.sel = t.dataset.sePair;
    s.focus = null;
  } else if (t.matches("[data-se-vs]")) {
    const [x, y] = t.dataset.seVs.split("-");
    s.focus = x;
    s.sel = pairOf(x, y);
  }
  rerender(key);
  document.querySelector(`.se-panel${sel(key)} .se-compare`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
