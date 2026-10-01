// Spelarkort: klicka på en spelare (Duellanalysen eller Startelva) och se spelaren i ett spindeldiagram mot sin liga
// (50 = ligasnittet för positionen), jämför mot valfri annan spelare i matchen och se alla säsongsstats.
// Statistiken är FotMobs: [total, per 90, percentil per 90 mot samma position i spelarens egen liga].
//
// Värden: setCardContext(id, { players, labels }) registrerar matchens spelare, cardHostHtml(id) ger rutan där kortet
// visas, och element med data-pc-open="<spelarnyckel>" inuti ett element med data-pc-ctx="<id>" öppnar kortet.

const ctxs = new Map(); // id -> { players, labels, sel, vs }

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = (x, d = 2) => (x == null || !Number.isFinite(Number(x)) ? "—" : Number(x).toFixed(d).replace(/\.?0+$/, "").replace(".", ","));
const ordinal = (n) => {
  const r = Math.round(n), l = r % 10, l2 = r % 100;
  return `${r}:${(l === 1 || l === 2) && l2 !== 11 && l2 !== 12 ? "a" : "e"}`;
};
export const shortName = (name) => {
  const parts = String(name || "").trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : parts[0] || "";
};

// ---------- Nyckeltal ----------

export const GROUP_LABEL = {
  malvakt: "Målvakt", mittback: "Mittback", ytterback: "Ytterback", defensiv_mittfaltare: "Defensiv mittfältare",
  central_mittfaltare: "Central mittfältare", offensiv_mittfaltare: "Offensiv mittfältare", ytter: "Ytter", anfallare: "Anfallare",
};
const GROUP_PLURAL = {
  malvakt: "målvakter", mittback: "mittbackar", ytterback: "ytterbackar", defensiv_mittfaltare: "defensiva mittfältare",
  central_mittfaltare: "centrala mittfältare", offensiv_mittfaltare: "offensiva mittfältare", ytter: "yttrar", anfallare: "anfallare",
};

// Spindelns axlar per position: [nyckel, kort namn]
const AX = {
  xg: ["expected_goals", "xG"], goals: ["goals", "Mål"], shots: ["shots", "Skott"], sot: ["ShotsOnTarget", "Skott på mål"],
  box: ["touches_opp_box", "I straffområdet"], chances: ["chances_created", "Skapade chanser"], xa: ["expected_assists", "xA"],
  drib: ["dribbles_succeeded", "Dribblingar"], cross: ["crosses_succeeeded", "Inlägg"], pass: ["successful_passes", "Passningar"],
  passAcc: ["successful_passes_accuracy", "Passningsträff"], long: ["long_balls_accurate", "Långbollar"],
  duel: ["duel_won_percent", "Vunna dueller"], air: ["aerials_won_percent", "Luftdueller"], tackle: ["matchstats.headers.tackles", "Tacklingar"],
  int: ["interceptions", "Brytningar"], rec: ["recoveries", "Återerövringar"], clear: ["clearances", "Rensningar"],
  past: ["dribbled_past", "Sällan dribblad"], high: ["poss_won_att_3rd_team_title", "Bollvinst högt"],
  save: ["save_percentage", "Räddnings-%"], saves: ["saves", "Räddningar"], prev: ["goals_prevented", "Förhindrade mål"],
  cs: ["clean_sheet_team_title", "Hållna nollor"], claim: ["keeper_high_claim", "Höga bollar"], sweep: ["keeper_sweeper", "Utrusningar"],
  longAcc: ["long_ball_succeeeded_accuracy", "Långbolls-%"], err: ["error_led_to_goal", "Få misstag"],
};
const A = (...k) => k.map((x) => AX[x]);
export const RADAR_AXES = {
  malvakt: A("save", "saves", "prev", "cs", "claim", "sweep", "passAcc", "longAcc", "err"),
  mittback: A("air", "duel", "int", "clear", "tackle", "rec", "past", "passAcc", "long"),
  ytterback: A("tackle", "int", "duel", "past", "rec", "cross", "chances", "xa", "passAcc", "drib"),
  defensiv_mittfaltare: A("int", "tackle", "rec", "duel", "air", "past", "pass", "passAcc", "long", "chances"),
  central_mittfaltare: A("pass", "passAcc", "chances", "xa", "drib", "duel", "rec", "tackle", "int", "xg"),
  offensiv_mittfaltare: A("chances", "xa", "xg", "shots", "drib", "box", "pass", "passAcc", "high", "duel"),
  ytter: A("drib", "chances", "xa", "xg", "shots", "box", "cross", "duel", "rec", "high"),
  anfallare: A("goals", "xg", "shots", "sot", "box", "air", "chances", "xa", "drib", "high"),
};
export const axesFor = (group) => RADAR_AXES[group] || RADAR_AXES.central_mittfaltare;

// Alla stats i områden. Nycklar som inte står här hamnar under "Övrigt".
const CATEGORIES = [
  ["Målvakt", ["saves", "save_percentage", "goals_prevented", "goals_conceded", "clean_sheet_title", "clean_sheet_team_title", "penalty_saves",
    "penalty_save_percent", "penalty_goals_conceded", "error_led_to_goal", "keeper_sweeper", "keeper_high_claim"]],
  ["Avslut och mål", ["goals", "goals_subtitle", "expected_goals", "non_penalty_xg", "goals_minus_xg", "expected_goals_on_target", "xgot_minus_xg",
    "shots", "ShotsOnTarget", "headed_shots", "touches_opp_box", "penalty_won_title"]],
  ["Skapa chanser", ["assists", "expected_assists", "chances_created", "big_chance_created_team_title", "crosses_succeeeded", "crosses_succeeeded_accuracy"]],
  ["Passningar", ["successful_passes", "successful_passes_accuracy", "long_balls_accurate", "long_ball_succeeeded_accuracy", "line_breaking_passes", "touches"]],
  ["Dribblingar och dueller", ["dribbles_succeeded", "won_contest_subtitle", "duel_won", "duel_won_percent", "aerials_won", "aerials_won_percent",
    "fouls_won", "dispossessed"]],
  ["Försvar", ["defensive_actions", "matchstats.headers.tackles", "interceptions", "recoveries", "poss_won_att_3rd_team_title", "clearances",
    "blocked_shots", "dribbled_past", "goals_conceded_while_on_pitch", "expected_goals_against_while_on_pitch", "xga_minus_conceded"]],
  ["Löpning", ["physical_metrics_distance_covered", "physical_metrics_running", "physical_metrics_sprinting", "physical_metrics_number_of_sprints",
    "physical_metrics_topspeed"]],
  ["Speltid och disciplin", ["rating", "matches_uppercase", "player_started_matches", "minutes_played", "fouls", "penalty_conceded_title",
    "yellow_cards", "red_cards"]],
];
const EXTRA_LABELS = {
  rating: "Snittbetyg (FotMob)", matches_uppercase: "Matcher", player_started_matches: "Från start", minutes_played: "Minuter",
  line_breaking_passes: "Linjebrytande passningar", clean_sheet_title: "Hållna nollor", goals_subtitle: "Mål", blocked_shots: "Blockerade skott",
  penalty_conceded_title: "Orsakade straffar", physical_metrics_distance_covered: "Löpdistans", physical_metrics_running: "Löpning (snabbt)",
  physical_metrics_sprinting: "Sprintdistans", physical_metrics_number_of_sprints: "Antal sprinter", physical_metrics_topspeed: "Toppfart",
  goals_conceded: "Insläppta mål",
};
// Andelar (visas "x %", inget per 90-tal) och tal där färre är bättre
const RATE = new Set(["won_contest_subtitle", "duel_won_percent", "aerials_won_percent", "successful_passes_accuracy", "save_percentage",
  "crosses_succeeeded_accuracy", "long_ball_succeeeded_accuracy", "penalty_save_percent"]);
const FEWER = new Set(["dribbled_past", "dispossessed", "fouls", "error_led_to_goal", "goals_conceded", "goals_conceded_while_on_pitch",
  "expected_goals_against_while_on_pitch", "yellow_cards", "red_cards", "penalty_conceded_title", "penalty_goals_conceded"]);
const KM = new Set(["physical_metrics_distance_covered", "physical_metrics_running", "physical_metrics_sprinting"]);
const NO_PER90 = new Set(["rating", "matches_uppercase", "player_started_matches", "minutes_played", "physical_metrics_topspeed",
  "goals_minus_xg", "xgot_minus_xg", "xga_minus_conceded", "goals_prevented"]);

// Percentil visas inte där den är missvisande (få händelser eller speltid, t.ex. 0 röda kort = 0:e percentilen)
const NO_PCT = new Set(["red_cards", "penalty_saves", "penalty_save_percent", "penalty_goals_conceded", "matches_uppercase",
  "player_started_matches", "minutes_played"]);
// Dubbletter i FotMobs data (samma tal under två nycklar): visas inte
const DUPLICATE = { clean_sheet_title: "clean_sheet_team_title", goals_subtitle: "goals" };

const label = (ctx, k) => EXTRA_LABELS[k] || ctx.labels?.[k] || k;

/** Värdet som visas i tabellen: huvudtal och liten text. */
export function statValue(k, x) {
  if (!x || x[0] == null) return { main: "—", sub: "" };
  if (RATE.has(k)) return { main: `${num(x[0], 1)} %`, sub: "" };
  if (k === "rating") return { main: num(x[0], 2), sub: "" };
  if (k === "physical_metrics_topspeed") return { main: `${num(x[0], 1)} km/h`, sub: "" };
  if (KM.has(k)) return { main: x[1] != null ? `${num(x[1] / 1000, 1)} km` : `${num(x[0] / 1000, 1)} km`, sub: x[1] != null ? "per 90" : "totalt" };
  if (NO_PER90.has(k) || x[1] == null) return { main: num(x[0], 2), sub: "" };
  return { main: num(x[1], 2), sub: `${num(x[0], 2)} tot` };
}

// ---------- Spindeldiagram ----------

/**
 * Spindeldiagram över percentilerna. series = [{ p, cls }] (en eller två spelare). Den streckade ringen är 50 =
 * ligasnittet för positionen.
 */
export function radarSvg(series, axes, { leagueRing = true } = {}) {
  const n = axes.length, R = 100;
  const pt = (i, r) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [r * Math.cos(ang), r * Math.sin(ang)];
  };
  const xy = (p) => p.map((x) => x.toFixed(1)).join(",");
  const pc = (p, k) => p.stats?.[k]?.[2];
  const ring = (r, cls) => `<polygon class="${cls}" points="${axes.map((_, i) => xy(pt(i, r))).join(" ")}"/>`;
  const rings = [25, 75, 100].map((r) => ring(r, "pc-ring")).join("") + (leagueRing ? ring(50, "pc-ring pc-ring-league") : ring(50, "pc-ring"));
  const spokes = axes.map((_, i) => `<line class="pc-ring" x1="0" y1="0" x2="${pt(i, R)[0].toFixed(1)}" y2="${pt(i, R)[1].toFixed(1)}"/>`).join("");
  const areas = series.map(({ p, cls }) => `<polygon class="pc-area ${cls}" points="${axes.map(([k], i) => xy(pt(i, (Math.max(0, Math.min(100, pc(p, k) ?? 0)) * R) / 100))).join(" ")}"/>`).join("");
  const dots = series.map(({ p, cls }) => axes.map(([k, l], i) => {
    if (pc(p, k) == null) return "";
    const [x, y] = pt(i, (pc(p, k) * R) / 100);
    return `<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.8"><title>${esc(`${p.short || p.name}: ${l} – ${ordinal(pc(p, k))} percentilen`)}</title></circle>`;
  }).join("")).join("");
  const labels = axes.map(([k, l], i) => {
    const [x, y] = pt(i, R + 12);
    const anchor = Math.abs(x) < 6 ? "middle" : x > 0 ? "start" : "end";
    const miss = series.some(({ p }) => pc(p, k) == null) ? "*" : "";
    return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}">${esc(l)}${miss}</text>`;
  }).join("");
  const missing = axes.some(([k]) => series.some(({ p }) => pc(p, k) == null));
  const names = series.map(({ p }) => p.name).join(" mot ");
  return `<figure class="pc-radar">
    <svg viewBox="-210 -128 420 256" role="img" aria-label="${esc(`Spindeldiagram: ${names}, percentil mot ligan`)}">
      ${rings}${spokes}${areas}${dots}<g class="pc-lbl">${labels}</g>
    </svg>
    <figcaption>${series.map(({ p, cls }) => `<span class="pc-key ${cls}"></span>${esc(p.short || p.name)}`).join(" ")}
      ${leagueRing ? '<span class="pc-key pc-key-league"></span>Ligasnitt (50)' : ""}
      <span class="pc-sub">· längre ut = bättre${missing ? " · * = saknas" : ""}</span></figcaption>
  </figure>`;
}

/** Hur många spindelområden varje spelare vinner (minst 8 percentilenheter). */
export function radarTally(a, b, axes) {
  let wa = 0, wb = 0, even = 0;
  for (const [k] of axes) {
    const x = a.stats?.[k]?.[2], y = b.stats?.[k]?.[2];
    if (x == null || y == null) continue;
    if (x - y >= 8) wa++;
    else if (y - x >= 8) wb++;
    else even++;
  }
  return { wa, wb, even };
}

// ---------- Kortet ----------

const leagueOf = (p) => String(p.statsFrom || "").replace(/\s*\d{4}(\/\d{4})?\s*$/, "") || "sin liga";

/** Klartext om en spelare: bäst och sämst mot ligan. */
function soloSummary(ctx, p) {
  // Bara positionens viktiga områden (spindelns axlar), inte kort, straffar och liknande små tal
  const list = axesFor(p.group).map(([k, l]) => [l, p.stats?.[k]]).filter(([, x]) => x?.[2] != null);
  if (!list.length) return noStats(p) ? `Ingen statistik hittades för ${esc(p.short || p.name)}.` : `${esc(p.short || p.name)} har för lite speltid för percentiler i de viktigaste områdena.`;
  const best = list.filter(([, x]) => x[2] >= 70).sort((a, b) => b[1][2] - a[1][2]).slice(0, 4);
  const worst = list.filter(([, x]) => x[2] <= 30).sort((a, b) => a[1][2] - b[1][2]).slice(0, 3);
  const lc = (l) => (/^x[A-Z]/.test(l) ? l : l.charAt(0).toLowerCase() + l.slice(1));
  const item = ([l, x]) => `${esc(lc(l))} <small>(${ordinal(x[2])})</small>`;
  const name = esc(p.short || p.name);
  const vs = `Jämfört med andra ${esc(GROUP_PLURAL[p.group] || "spelare på samma position")} i ${esc(leagueOf(p))}`;
  const top = best.length ? `${vs} är ${name} bäst på ${best.map(item).join(", ")}.` : `${vs} har ${name} inget område bland de bästa 30 %.`;
  return `${top}${worst.length ? ` Svagast på ${worst.map(item).join(", ")}.` : ""} <span class="pc-sub">(siffran = percentil, 50 = ligasnitt)</span>`;
}

function pairSummary(a, b, axes) {
  const t = radarTally(a, b, axes);
  const total = t.wa + t.wb + t.even;
  if (!total) return "För lite statistik för att jämföra.";
  if (t.wa === t.wb) return `Jämnt: båda är bättre på ${t.wa} av ${total} områden i spindeln${t.even ? `, jämnt på ${t.even}` : ""}.`;
  const [w, l, nw, nl] = t.wa > t.wb ? [a, b, t.wa, t.wb] : [b, a, t.wb, t.wa];
  return `${w.short || w.name} är bättre på ${nw} av ${total} områden i spindeln, ${l.short || l.name} på ${nl}${t.even ? `, jämnt på ${t.even}` : ""}.`;
}

// Färger i kortet: spelare 1 blå, spelare 2 orange (oberoende av lag, så att "grönt" inte betyder både lag och bra).
// Staplarna färgas efter percentilen: grön = översta tredjedelen i ligan, gul = mitten, röd = nedersta tredjedelen.
const seriesCls = (a, b) => ["pc-c-p1", b ? "pc-c-p2" : null];
const levelCls = (pct) => (pct >= 67 ? "pc-hi" : pct <= 33 ? "pc-lo" : "pc-mid");
const levelTxt = (pct) => (pct >= 67 ? "bra" : pct <= 33 ? "svagt" : "medel");

function cell(k, x, other) {
  const v = statValue(k, x);
  const pct = NO_PCT.has(k) ? null : x?.[2];
  if (NO_PCT.has(k)) other = null;
  const better = pct != null && other?.[2] != null && pct - other[2] >= 8;
  return `<td class="pc-v${better ? " is-better" : ""}"><span class="pc-val">${esc(v.main)}</span>${better ? ' <span class="pc-best" title="Tydligt bättre än den andra">▲</span>' : ""}${v.sub ? ` <small>${esc(v.sub)}</small>` : ""}
    ${pct != null ? `<span class="pc-bar ${levelCls(pct)}" title="${ordinal(pct)} percentilen – ${levelTxt(pct)} i ligan"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></span><small class="pc-pct">${ordinal(pct)} perc. · ${levelTxt(pct)}</small>` : ""}</td>`;
}

function allStatsHtml(ctx, a, b) {
  const keys = new Set([...Object.keys(a.stats || {}), ...Object.keys(b?.stats || {})]);
  for (const [dup, main] of Object.entries(DUPLICATE)) if (keys.has(main)) keys.delete(dup);
  const placed = new Set();
  const cats = CATEGORIES.map(([title, list]) => {
    const ks = list.filter((k) => keys.has(k));
    ks.forEach((k) => placed.add(k));
    return [title, ks];
  });
  const rest = [...keys].filter((k) => !placed.has(k));
  if (rest.length) cats.push(["Övrigt", rest]);
  // Målvakter: målvaktsstatistiken först, annars sist
  const isGk = a.group === "malvakt";
  const ordered = isGk ? cats : [...cats.filter(([t]) => t !== "Målvakt"), ...cats.filter(([t]) => t === "Målvakt")];
  const [ca, cb] = seriesCls(a, b);
  const head = `<tr><th scope="col">Nyckeltal</th><th scope="col"><span class="pc-key ${ca}"></span>${esc(a.short || a.name)}</th>${b ? `<th scope="col"><span class="pc-key ${cb}"></span>${esc(b.short || b.name)}</th>` : ""}</tr>`;
  const body = ordered.filter(([, ks]) => ks.length).map(([title, ks]) => `<tr class="pc-cat"><th colspan="${b ? 3 : 2}" scope="colgroup">${esc(title)}</th></tr>
    ${ks.map((k) => `<tr><th scope="row">${esc(label(ctx, k))}${FEWER.has(k) ? ' <small class="pc-sub">(färre = bättre)</small>' : ""}</th>${cell(k, a.stats?.[k], b?.stats?.[k])}${b ? cell(k, b.stats?.[k], a.stats?.[k]) : ""}</tr>`).join("")}`).join("");
  return `<details class="pc-all" open><summary>Alla stats (${keys.size} nyckeltal)</summary>
    <p class="pc-legend"><span class="pc-sw pc-hi"></span>bra (topp tredjedel i ligan) <span class="pc-sw pc-mid"></span>medel <span class="pc-sw pc-lo"></span>svagt (botten tredjedel)${b ? ' · <b>▲</b> = tydligt bättre än den andra' : ""}</p>
    <p class="pc-sub">Huvudtalet är per 90 minuter, det lilla är totalt för säsongen. Stapeln och percentilen jämför mot samma position i spelarens egen liga.</p>
    <div class="pc-table-wrap"><table class="pc-table"><thead>${head}</thead><tbody>${body}</tbody></table></div></details>`;
}

function headHtml(p, cls = "pc-c-p1") {
  const ga = p.goals != null ? `${p.goals} mål + ${p.assists ?? 0} assist` : null;
  const bits = [p.statsFrom, p.minutes ? `${p.minutes} min` : null, ga, p.rating ? `snittbetyg ${num(p.rating, 2)}` : null].filter(Boolean).join(" · ");
  const who = [p.posLabel || GROUP_LABEL[p.group], p.club && p.club !== p.teamName ? p.club : null, p.age ? `${p.age} år` : null].filter(Boolean).join(" · ");
  return `<div class="pc-ph ${cls}"><div><span class="pc-key ${cls}"></span><b>${esc(p.name)}</b> <span class="pc-sub">${esc(p.teamName || "")}</span></div>
    <div class="pc-sub">${esc(who)}</div><div class="pc-sub">${esc(bits || "Ingen statistik")}</div></div>`;
}

function vsPicker(ctx, p, vs) {
  const others = Object.values(ctx.players).filter((x) => x.key !== p.key);
  // Förslag: samma position, motståndarlaget först
  const sugg = others.filter((x) => x.group === p.group).sort((x, y) => Number(x.team === p.team) - Number(y.team === p.team)).slice(0, 4);
  const chips = sugg.map((x) => `<button type="button" class="pc-chip${vs?.key === x.key ? " is-on" : ""}" data-pc-vs="${esc(x.key)}">${esc(x.short || x.name)} <small>${esc(x.teamName || "")}</small></button>`).join("");
  const opt = (team) => others.filter((x) => x.team === team).map((x) => `<option value="${esc(x.key)}"${vs?.key === x.key ? " selected" : ""}>${esc(`${x.name} – ${(x.posLabel || GROUP_LABEL[x.group] || "").toLowerCase()}`)}</option>`).join("");
  const teamName = (team) => others.find((x) => x.team === team)?.teamName || (team === "home" ? "Hemma" : "Borta");
  return `<div class="pc-vs"><span class="pc-sub">Jämför med:</span>${chips}
    <select data-pc-vs-select aria-label="Jämför med valfri spelare"><option value="">Välj spelare…</option>
      <optgroup label="${esc(teamName(p.team === "home" ? "away" : "home"))}">${opt(p.team === "home" ? "away" : "home")}</optgroup>
      <optgroup label="${esc(teamName(p.team))}">${opt(p.team)}</optgroup></select>
    ${vs ? '<button type="button" class="pc-chip" data-pc-solo>Bara mot ligan</button>' : ""}</div>`;
}

const noStats = (p) => !!p && !Object.keys(p.stats || {}).length;

function cardHtml(ctx) {
  const p = ctx.players[ctx.sel];
  if (!p) return "";
  const vs = ctx.vs ? ctx.players[ctx.vs] : null;
  const axes = axesFor(p.group);
  const [ca, cb] = seriesCls(p, vs);
  const series = vs ? [{ p, cls: ca }, { p: vs, cls: cb }] : [{ p, cls: ca }];
  const diffLeague = vs && leagueOf(p) !== leagueOf(vs)
    ? `<p class="pc-sub pc-warn">Olika ligor (${esc(p.statsFrom)} / ${esc(vs.statsFrom)}): percentilerna mäts mot respektive liga.</p>` : "";
  const posNote = vs && vs.group !== p.group ? `<p class="pc-sub">Spindeln visar ${esc((GROUP_LABEL[p.group] || "").toLowerCase())}ens områden; ${esc(vs.short || vs.name)} mäts mot sin egen position.</p>` : "";
  return `<section class="pc-card" aria-label="${esc(`Spelarkort ${p.name}`)}">
    <div class="pc-top"><h4>${esc(p.name)}${vs ? ` mot ${esc(vs.name)}` : " mot ligan"}</h4>
      <button type="button" class="pc-close" data-pc-close aria-label="Stäng spelarkortet">✕</button></div>
    <div class="pc-heads">${headHtml(p, ca)}${vs ? headHtml(vs, cb) : ""}</div>
    <div class="pc-summary"><b>Kort sagt:</b> ${vs ? esc(pairSummary(p, vs, axes)) : soloSummary(ctx, p)}</div>
    ${diffLeague}${posNote}
    ${vsPicker(ctx, p, vs)}
    ${noStats(p) || noStats(vs) ? `<p class="pc-missing">Statistiken för ${esc([p, vs].filter((x) => x && noStats(x)).map((x) => x.name).join(" och "))} kom inte med.
      Kör du appen lokalt: starta om GUI-servern (<code>npm run gui</code>) och ladda om sidan. På webben kommer den vid nästa uppdatering.</p>` : ""}
    ${noStats(p) ? "" : radarSvg(series, axes)}
    ${noStats(p) && (!vs || noStats(vs)) ? "" : allStatsHtml(ctx, p, vs)}
  </section>`;
}

export function setCardContext(id, { players, labels }) {
  const old = ctxs.get(id);
  ctxs.set(id, { players, labels: labels || {}, sel: old?.sel && players[old.sel] ? old.sel : null, vs: old?.vs && players[old.vs] ? old.vs : null });
}

/** Rutan där kortet visas (tom tills en spelare klickas). */
export function cardHostHtml(id) {
  const ctx = ctxs.get(id);
  return `<div class="pc-host" data-pc-host="${esc(id)}">${ctx?.sel ? cardHtml(ctx) : ""}</div>`;
}

function rerender(id, { scroll = false } = {}) {
  const ctx = ctxs.get(id);
  for (const el of document.querySelectorAll(`.pc-host[data-pc-host="${CSS.escape(id)}"]`)) {
    el.innerHTML = ctx?.sel ? cardHtml(ctx) : "";
    if (scroll && ctx?.sel) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  // Markera vald spelare i listorna
  for (const b of document.querySelectorAll(`[data-pc-ctx="${CSS.escape(id)}"] [data-pc-open]`)) {
    b.classList.toggle("pc-is-sel", b.dataset.pcOpen === ctx?.sel || b.dataset.pcOpen === ctx?.vs);
    b.setAttribute("aria-pressed", String(b.dataset.pcOpen === ctx?.sel));
  }
}

/** Öppna kortet för en spelare (används också av värdsidorna). */
export function openCard(id, key) {
  const ctx = ctxs.get(id);
  if (!ctx?.players[key]) return;
  // Samma spelare igen stänger; annars ny spelare utan jämförelse
  if (ctx.sel === key && !ctx.vs) ctx.sel = null;
  else {
    ctx.sel = key;
    ctx.vs = null;
  }
  rerender(id, { scroll: true });
}

const ctxOf = (el) => el.closest("[data-pc-ctx]")?.dataset.pcCtx || el.closest(".pc-host")?.dataset.pcHost || null;

document.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-pc-open], [data-pc-vs], [data-pc-close], [data-pc-solo]");
  if (!t) return;
  const id = ctxOf(t);
  const ctx = id && ctxs.get(id);
  if (!ctx) return;
  ev.preventDefault();
  if (t.matches("[data-pc-open]")) return openCard(id, t.dataset.pcOpen);
  if (t.matches("[data-pc-close]")) ctx.sel = ctx.vs = null;
  else if (t.matches("[data-pc-solo]")) ctx.vs = null;
  else if (t.matches("[data-pc-vs]")) ctx.vs = ctx.vs === t.dataset.pcVs ? null : t.dataset.pcVs;
  rerender(id);
});

document.addEventListener("change", (ev) => {
  const t = ev.target.closest("select[data-pc-vs-select]");
  if (!t) return;
  const id = ctxOf(t);
  const ctx = id && ctxs.get(id);
  if (!ctx) return;
  ctx.vs = t.value || null;
  rerender(id);
});
