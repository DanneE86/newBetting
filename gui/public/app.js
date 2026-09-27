const $ = (sel) => document.querySelector(sel);

let state = {
  league: localStorage.getItem("betting.leagueFilter") || "ALL",
  bestUpcoming: [],
  allCandidates: [],
  accuracy: null,
  accuracyByLeague: null,
  accuracyByConfidence: null,
  accuracyByConfidenceByLeague: null,
  rounds: {},
  openMarket: null,
  leagueNames: {},
  leagueGroups: [],
  openGroup: null,
};

function fmtPct(rate) {
  if (rate == null || rate === "") return "—";
  return `${(Number(rate) * 100).toFixed(1)}%`;
}

/** Chans att tipset går in (0–1 → heltal %). */
function fmtChance(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

const LEAGUE_NAMES = {
  PL: "Premier League",
  CH: "Championship",
  LL: "La Liga",
  SA: "Serie A",
  BL: "Bundesliga",
  L1: "Ligue 1",
  ED: "Eredivisie",
};

function fmtWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Avspark i svensk tid. Utan känd tid: datum + "tid ej känd" (aldrig bara datum). */
function fmtKick(tip) {
  if (tip.kickoffUtc) {
    const d = new Date(tip.kickoffUtc);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("sv-SE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  if (!tip.date) return "—";
  const day = new Date(`${tip.date}T12:00:00`);
  const dayTxt = Number.isNaN(day.getTime())
    ? tip.date
    : day.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" });
  return `${dayTxt} · tid ej känd`;
}

function noteLines(tip) {
  const parts = [];
  if (tip.marketOnly) parts.push(`<span class="market-only">Marknadstips – chansen är ${escapeHtml(tip.marketSource || "marknaden")} utan marginal (ingen modell för denna liga)</span>`);
  if (tip.lineupStatus && tip.lineupStatus !== "none") {
    const cls = tip.lineupStatus === "confirmed" ? "xi-confirmed" : "xi-pending";
    parts.push(`<span class="${cls}">Elvor: ${tip.lineupStatus}</span>`);
  }
  for (const n of tip.lineupNotes || []) parts.push(escapeHtml(n));
  for (const n of tip.playerAttackNotes || []) parts.push(escapeHtml(n));
  for (const n of tip.availabilityNotes || []) parts.push(escapeHtml(n));
  return parts.length ? `<div class="notes">${parts.join(" · ")}</div>` : "";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Namn för liga ("PL"), grupp ("G:england") eller "ALL". */
function leagueName(sel) {
  if (!sel || sel === "ALL") return "alla ligor";
  if (sel.startsWith("G:")) return state.leagueGroups.find((g) => `G:${g.id}` === sel)?.name || sel;
  return state.leagueNames[sel] || LEAGUE_NAMES[sel] || sel;
}

/** Ligor som ingår i valet: null = alla. */
function leaguesOf(sel) {
  if (!sel || sel === "ALL") return null;
  if (sel.startsWith("G:")) return state.leagueGroups.find((g) => `G:${g.id}` === sel)?.leagues || [];
  return [sel];
}

function byLeague(list) {
  const ls = leaguesOf(state.league);
  if (!ls) return list;
  return list.filter((t) => ls.includes(t.league));
}

function oddsCells(tip) {
  // Pro-lagret: basta odds hos dina bolag (Odds API). Annars det enda bolagets odds.
  const pro = tip.pro?.odds;
  if (pro && (pro.home || pro.over25)) {
    const books = [...new Set(Object.values(tip.pro.oddsBooks || {}).filter(Boolean))];
    return {
      one: pro.home ?? null,
      x: pro.draw ?? null,
      two: pro.away ?? null,
      over: pro.over25 ?? null,
      under: pro.under25 ?? null,
      bttsYes: null,
      bttsNo: null,
      book: books.length ? `bästa pris · ${books.join(", ")}` : "",
    };
  }
  const od = tip.value?.odds;
  if (!od?.home) {
    return { one: null, x: null, two: null, over: null, under: null, bttsYes: null, bttsNo: null, book: "" };
  }
  return {
    one: od.home ?? null,
    x: od.draw ?? null,
    two: od.away ?? null,
    over: od.over25 ?? null,
    under: od.under25 ?? null,
    bttsYes: od.bttsYes ?? null,
    bttsNo: od.bttsNo ?? null,
    book: tip.value?.bookmaker ? String(tip.value.bookmaker) : "",
  };
}

function fmtOdd(v) {
  if (v == null || v === "") return "—";
  return String(v);
}

/** Alla utfall med fasta farger; tippat utfall markeras. */
function oddsGroup(items, activeKey) {
  const parts = items.map(({ key, label, odd }) => {
    const active = key === activeKey ? " is-tip" : "";
    return `<span class="odd-pill odd-${key}${active}"><em>${escapeHtml(label)}</em><b>${escapeHtml(fmtOdd(odd))}</b></span>`;
  });
  return `<div class="odds-group">${parts.join("")}</div>`;
}

/**
 * Värde vid dagens odds för det tippade utfallet (pro.verdicts från pro-lagret).
 * Visar även om ett annat utfall i samma marknad har värde.
 */
function valueCell(tip, pickKey, keys) {
  const v = tip.pro?.verdicts || {};
  const x = v[pickKey];
  const others = keys
    .filter((k) => k !== pickKey && v[k]?.value)
    .map((k) => `${escapeHtml(v[k].pick)} @ ${escapeHtml(fmtOdd(v[k].odds))}`);
  const otherTxt = others.length ? `<div class="val-other">Värde: ${others.join(", ")}</div>` : "";
  if (!x || x.value == null) {
    // Pro-lagret ger alltid ett omdöme när det finns odds; saknas det finns inga odds för utfallet
    return `<td class="val"><span class="val-badge val-none">Inga odds</span>${otherTxt}</td>`;
  }
  // Facit utan Pinnacle/Betfair (snitt av bolagen): svagare, därför högre tröskel - visas under omdömet
  const basis = x.fairSource && !/pinnacle|betfair/.test(x.fairSource) ? `<div class="val-min">facit: ${escapeHtml(x.fairSource)}</div>` : "";
  const title = `Värt att spela från odds ${x.minOdds}${basis ? ` (facit: ${x.fairSource})` : ""}`;
  return x.value
    ? `<td class="val" title="${escapeHtml(title)}"><span class="val-badge val-yes">Värde</span>${basis}${otherTxt}</td>`
    : x.reason
      ? `<td class="val" title="Skrällodds – chansen överskattas, spelas aldrig"><span class="val-badge val-no">Ej värde</span><div class="val-min">${escapeHtml(x.reason)}</div>${otherTxt}</td>`
      : `<td class="val" title="${escapeHtml(title)}"><span class="val-badge val-no">Ej värde</span><div class="val-min">från ${escapeHtml(fmtOdd(x.minOdds))}</div>${basis}${otherTxt}</td>`;
}

function tipCard(tip, i) {
  const t = tip.tips || {};
  const od = oddsCells(tip);
  const style = `animation-delay:${Math.min(i * 0.04, 0.4)}s`;
  const leagueShort = tip.league || "";
  const leagueFull = leagueName(tip.league);
  const roundShort = tip.round
    ? String(tip.round).replace(/^Matchday\s+/i, "Omg ")
    : "";

  const pick1 = t["1X2"]?.pick ?? "";
  const pickB = t.BTTS?.pick ?? "";
  const pickO = String(t.OU25?.pick || "").toUpperCase();
  const ouKey = pickO.includes("OVER") ? "over" : pickO.includes("UNDER") ? "under" : "";
  const bttsKey = pickB === "JA" ? "btts-yes" : pickB === "NEJ" ? "btts-no" : "";

  // Chans att respektive tips går in (confidence), inte rå pYes/pOver
  const conf1 = t["1X2"]?.confidence;
  const confB = t.BTTS?.confidence;
  const confO = t.OU25?.confidence;

  return `
    <article class="tip" style="${style}">
      <header class="tip-head">
        <div class="tip-meta">
          <time class="date">${escapeHtml(fmtKick(tip))}</time>
          <div class="tip-tags">
            <span class="league" title="${escapeHtml(leagueFull)}">${escapeHtml(leagueShort)}</span>
            ${roundShort ? `<span class="round">${escapeHtml(roundShort)}</span>` : ""}
          </div>
        </div>
        <h3 class="match">${escapeHtml(tip.match || "")}</h3>
        <div class="score-box" title="Samlad chans att tipset håller (snitt över marknaderna)">
          <div class="n">${fmtChance(tip.tipScore)}</div>
          <div class="l">chans</div>
        </div>
      </header>

      <table class="tip-table">
        <thead>
          <tr>
            <th>Marknad</th>
            <th>Tips + odds</th>
            <th>Chans</th>
            <th>Värde</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mkt">1X2</td>
            <td>${oddsGroup(
              [
                { key: "home", label: "1", odd: od.one },
                { key: "draw", label: "X", odd: od.x },
                { key: "away", label: "2", odd: od.two },
              ],
              pick1 === "1" ? "home" : pick1 === "X" ? "draw" : pick1 === "2" ? "away" : ""
            )}</td>
            <td class="num">${fmtChance(conf1)}</td>
            ${valueCell(tip, pick1 === "1" ? "home" : pick1 === "X" ? "draw" : "away", ["home", "draw", "away"])}
          </tr>
          <tr>
            <td class="mkt">BTTS</td>
            <td>${oddsGroup(
              [
                { key: "btts-yes", label: "JA", odd: od.bttsYes },
                { key: "btts-no", label: "NEJ", odd: od.bttsNo },
              ],
              bttsKey
            )}</td>
            <td class="num">${fmtChance(confB)}</td>
            <td class="val"><span class="val-badge val-none">Inga odds</span></td>
          </tr>
          <tr>
            <td class="mkt">Ö/U 2.5</td>
            <td>${oddsGroup(
              [
                { key: "over", label: "Ö", odd: od.over },
                { key: "under", label: "U", odd: od.under },
              ],
              ouKey
            )}</td>
            <td class="num">${fmtChance(confO)}</td>
            ${valueCell(tip, ouKey === "over" ? "over25" : "under25", ["over25", "under25"])}
          </tr>
        </tbody>
      </table>
      ${od.book ? `<div class="odds-src">Odds: ${escapeHtml(od.book)}</div>` : ""}
      ${noteLines(tip)}
      <div class="tip-analyze">
        <button type="button" class="btn-analyze" aria-expanded="false"
          data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
          data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}">Analys · agent 1–6</button>
        <div class="analysis" hidden></div>
      </div>
    </article>
  `;
}

function renderList(el, list, emptyMsg) {
  const filtered = byLeague(list);
  if (!filtered.length) {
    el.innerHTML = `<div class="empty">${escapeHtml(emptyMsg)}</div>`;
    return;
  }
  el.innerHTML = filtered.map(tipCard).join("");
}

function renderTips() {
  const selName = leagueName(state.league);
  renderList(
    $("#tips"),
    state.bestUpcoming,
    state.bestUpcoming.length
      ? `Inga tips i ${selName} just nu.`
      : "Inga kommande tips. Tryck på Hämta data."
  );
  renderList(
    $("#candidates"),
    state.allCandidates,
    state.allCandidates.length
      ? `Inga kandidater i ${selName}.`
      : "Inga kommande kandidater."
  );
}

function activeAccuracy() {
  if (state.league && state.league !== "ALL" && state.accuracyByLeague?.[state.league]) {
    return state.accuracyByLeague[state.league];
  }
  return state.accuracy;
}

function activeConfidenceBands(marketKey) {
  const byLg =
    state.league && state.league !== "ALL"
      ? state.accuracyByConfidenceByLeague?.[state.league]?.[marketKey]
      : null;
  if (byLg && (byLg.ge70 || byLg.b60_69 || byLg.under70)) return byLg;
  const global = state.accuracyByConfidence?.[marketKey];
  if (global && (global.ge70 || global.b60_69 || global.under70)) return global;
  return null;
}

const MARKET_KEYS = {
  "1X2": "1X2",
  BTTS: "BTTS",
  "Ö/U 2.5": "OU25",
};

const BAND_ORDER = ["ge70", "b60_69", "b50_59", "under50", "under70"];

function closeAccDetail() {
  state.openMarket = null;
  const detail = $("#acc-detail");
  if (detail) detail.hidden = true;
  document.querySelectorAll(".acc.is-open").forEach((el) => el.classList.remove("is-open"));
}

function showAccDetail(label, marketKey) {
  const bands = activeConfidenceBands(marketKey);
  const detail = $("#acc-detail");
  const title = $("#acc-detail-title");
  const lead = $("#acc-detail-lead");
  const host = $("#acc-bands");
  if (!detail || !host) return;

  state.openMarket = marketKey;
  document.querySelectorAll(".acc").forEach((el) => {
    el.classList.toggle("is-open", el.dataset.market === marketKey);
  });

  const scope = state.league === "ALL" ? "Alla ligor" : leagueName(state.league);
  title.textContent = `${label} · träff per chansband`;
  lead.textContent = bands
    ? `Hur ofta tipset satt när modellens chans låg i respektive intervall · ${scope}`
    : "Ingen banddata ännu — kör om store/tips.";

  if (!bands) {
    host.innerHTML = `<div class="empty">Saknar accuracyByConfidence</div>`;
  } else {
    host.innerHTML = BAND_ORDER.map((key) => {
      const b = bands[key];
      if (!b) return "";
      const agg = key === "under70" ? " is-agg" : "";
      return `
        <div class="acc-band${agg}">
          <div class="band-label">${escapeHtml(b.label || key)}</div>
          <div class="band-val">${fmtPct(b.rate)}</div>
          <div class="band-sub">${b.correct ?? 0}/${b.tested ?? 0} rätt</div>
        </div>`;
    }).join("");
  }

  detail.hidden = false;
}

function toggleAccDetail(label, marketKey) {
  if (state.openMarket === marketKey) {
    closeAccDetail();
    return;
  }
  showAccDetail(label, marketKey);
  $("#acc-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderAccuracy(acc) {
  const box = $("#accuracy");
  if (!acc) {
    box.innerHTML = "";
    closeAccDetail();
    return;
  }
  const scope = state.league === "ALL" ? "Alla ligor" : leagueName(state.league);
  const rows = [
    ["1X2", "1X2", acc["1X2"]],
    ["BTTS", "BTTS", acc.BTTS],
    ["Ö/U 2.5", "OU25", acc.OU25],
  ];
  box.innerHTML = rows
    .map(
      ([label, key, a]) => `
      <button type="button" class="acc${state.openMarket === key ? " is-open" : ""}" data-market="${key}" data-label="${escapeHtml(label)}">
        <div class="label">${label}</div>
        <div class="val">${fmtPct(a?.rate)}</div>
        <div class="sub">${a?.correct ?? 0}/${a?.tested ?? 0} i backtest · ${scope}</div>
        <div class="hint">Klicka för chansband</div>
      </button>`
    )
    .join("");

  if (state.openMarket) {
    const row = rows.find(([, key]) => key === state.openMarket);
    if (row) showAccDetail(row[0], row[1]);
    else closeAccDetail();
  }
}

function renderSources(sources) {
  const pills = [];
  if (sources?.clubElo) pills.push(`ClubElo ${sources.clubElo.teams} lag`);
  if (sources?.lineups)
    pills.push(`ESPN XI ${sources.lineups.confirmed}/${sources.lineups.fixtures} bekräftade`);
  if (sources?.understat?.loaded) pills.push("Understat xG");
  if (sources?.fpl?.loaded) pills.push(`FPL ${sources.fpl.keyOuts ?? 0} key outs`);
  $("#source-pills").innerHTML = pills.map((p) => `<span class="pill">${escapeHtml(p)}</span>`).join("");
}

function syncLeaguePills() {
  const sel = state.league;
  document.querySelectorAll("#league-filters .filter-pill, #league-sub .filter-pill").forEach((btn) => {
    const g = btn.dataset.group;
    const active = g
      ? sel === `G:${g}` || (state.leagueGroups.find((x) => x.id === g)?.leagues || []).includes(sel)
      : btn.dataset.league === sel;
    btn.classList.toggle("active", active);
    if (g) btn.classList.toggle("open", state.openGroup === g);
  });
}

/** Antal kandidater per liga (visas på knapparna). */
function countFor(codes) {
  return state.allCandidates.filter((t) => codes.includes(t.league)).length;
}

/**
 * Grupperade ligafilter: grupper med flera ligor (England, Europa, Sverige ...) fäller ut
 * sina turneringar i en underrad. Grupper med en liga blir en vanlig knapp.
 */
function buildLeagueFilters(leagues) {
  const host = $("#league-filters");
  if (!host) return;
  const present = new Set((leagues || []).filter(Boolean));
  const grouped = new Set();
  const pills = [`<button type="button" class="filter-pill" data-league="ALL">Alla</button>`];
  for (const g of state.leagueGroups) {
    const ls = g.leagues.filter((l) => present.has(l));
    ls.forEach((l) => grouped.add(l));
    if (!ls.length) continue;
    const n = countFor(ls);
    if (ls.length > 1) {
      pills.push(`<button type="button" class="filter-pill is-group" data-group="${escapeHtml(g.id)}" aria-expanded="${state.openGroup === g.id}">${escapeHtml(g.name)}<span class="count">${n}</span></button>`);
    } else {
      pills.push(`<button type="button" class="filter-pill" data-league="${escapeHtml(ls[0])}" title="${escapeHtml(leagueName(ls[0]))}">${escapeHtml(g.name)}<span class="count">${n}</span></button>`);
    }
  }
  // Ligor som inte finns i någon grupp
  for (const l of present) {
    if (!grouped.has(l)) pills.push(`<button type="button" class="filter-pill" data-league="${escapeHtml(l)}">${escapeHtml(leagueName(l))}<span class="count">${countFor([l])}</span></button>`);
  }
  host.innerHTML = pills.join("");
  renderLeagueSub(present);
  syncLeaguePills();
}

function renderLeagueSub(present) {
  const sub = $("#league-sub");
  if (!sub) return;
  const g = state.leagueGroups.find((x) => x.id === state.openGroup);
  const ls = g ? g.leagues.filter((l) => !present || present.has(l)) : [];
  if (!g || ls.length < 2) {
    sub.hidden = true;
    sub.innerHTML = "";
    return;
  }
  sub.hidden = false;
  sub.innerHTML = [
    `<button type="button" class="filter-pill" data-league="G:${escapeHtml(g.id)}">Alla i ${escapeHtml(g.name)}<span class="count">${countFor(ls)}</span></button>`,
    ...ls.map((l) => `<button type="button" class="filter-pill" data-league="${escapeHtml(l)}">${escapeHtml(leagueName(l))}<span class="count">${countFor([l])}</span></button>`),
  ].join("");
}

function presentLeagues() {
  return new Set([...state.bestUpcoming, ...state.allCandidates].map((t) => t.league).filter(Boolean));
}

/** Klick på grupp: fäll ut/in turneringarna och visa hela gruppen. */
function toggleGroup(id) {
  if (state.openGroup === id) {
    state.openGroup = null;
  } else {
    state.openGroup = id;
    setLeague(`G:${id}`, { keepGroup: true });
  }
  renderLeagueSub(presentLeagues());
  syncLeaguePills();
}

function setLeague(league, { keepGroup = false } = {}) {
  state.league = league;
  if (!keepGroup) {
    const owner = state.leagueGroups.find((g) => `G:${g.id}` === league || g.leagues.includes(league));
    // Behåll underraden öppen när man väljer en turnering i den öppna gruppen
    if (!owner || owner.id !== state.openGroup) state.openGroup = null;
    renderLeagueSub(presentLeagues());
  }
  localStorage.setItem("betting.leagueFilter", league);
  syncLeaguePills();
  renderTips();
  renderAccuracy(activeAccuracy());
  const mc = $("#match-count");
  if (mc && state._matchCount != null) {
    mc.textContent = `${byLeague(state.bestUpcoming).length} tips · ${state._matchCount} i store`;
  }
}

async function loadDashboard() {
  const res = await fetch("/api/dashboard", { cache: "no-store" });
  if (!res.ok) throw new Error("Kunde inte läsa dashboard");
  const data = await res.json();

  state.bestUpcoming = data.bestUpcoming || [];
  state.allCandidates = data.allCandidates || [];
  state.rounds = data.rounds || {};
  state.accuracy = data.accuracy || null;
  state.accuracyByLeague = data.accuracyByLeague || null;
  state.accuracyByConfidence = data.accuracyByConfidence || null;
  state.accuracyByConfidenceByLeague = data.accuracyByConfidenceByLeague || null;
  state._matchCount = data.sources?.matchCount ?? "—";
  state.leagueNames = data.leagueNames || {};
  // Länder/grupper i bokstavsordning (svensk sortering: ... Tjeckien, Tyskland, USA)
  state.leagueGroups = (data.leagueGroups || []).slice().sort((a, b) => a.name.localeCompare(b.name, "sv"));
  if (state.league.startsWith("G:")) state.openGroup = state.league.slice(2);

  buildLeagueFilters(data.leagues || ["PL", "CH"]);

  const roundBits = Object.entries(state.rounds || {})
    .filter(([, v]) => v)
    .map(([lg, v]) => `${lg} ${String(v).replace(/^Matchday\s+/i, "omg ")}`);
  const roundTxt = roundBits.length ? roundBits.join(" · ") : "nästa omgång";
  const tipsSub = $("#tips-sub");
  const candSub = $("#cand-sub");
  if (tipsSub) tipsSub.textContent = `${roundTxt} · edge-filter · tidigaste först`;
  if (candSub) candSub.textContent = `${roundTxt} · även under filtertröskel`;

  $("#updated-at").textContent = fmtWhen(data.updatedAt);
  $("#status-msg").textContent = data.message || data.status || "—";
  $("#match-count").textContent = `${byLeague(state.bestUpcoming).length} tips · ${state._matchCount} i store`;
  const lu = data.sources?.lineups;
  $("#lineup-meta").textContent = lu
    ? `${lu.confirmed} bekräftade · ${lu.pending} pending`
    : "—";

  renderAccuracy(activeAccuracy());
  syncLeaguePills();
  renderTips();
  renderSources(data.sources);

  const busy = Boolean(data.fetch?.running);
  $("#btn-fetch").disabled = busy;
  $("#btn-fetch .btn-label").textContent = busy ? "Hämtar…" : "Hämta data";
  return data;
}

function appendLog(line) {
  const panel = $("#log-panel");
  const out = $("#log-out");
  panel.hidden = false;
  out.textContent += (out.textContent ? "\n" : "") + line;
  out.scrollTop = out.scrollHeight;
}

function watchFetchStream() {
  const es = new EventSource("/api/fetch/stream");
  es.onmessage = async (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (msg.type === "log") appendLog(msg.line);
    if (msg.type === "done") {
      $("#log-state").textContent = msg.ok ? "klar" : "fel";
      $("#btn-fetch").disabled = false;
      $("#btn-fetch .btn-label").textContent = "Hämta data";
      es.close();
      try {
        await loadDashboard();
      } catch (e) {
        appendLog(String(e.message || e));
      }
    }
  };
  es.onerror = () => {
    /* browser reconnects while running; ignore */
  };
  return es;
}

async function startFetch() {
  const btn = $("#btn-fetch");
  btn.disabled = true;
  btn.querySelector(".btn-label").textContent = "Hämtar…";
  $("#log-panel").hidden = false;
  $("#log-out").textContent = "";
  $("#log-state").textContent = "kör…";

  const res = await fetch("/api/fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "full" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    appendLog(body.error || "Kunde inte starta hämtning");
    btn.disabled = false;
    btn.querySelector(".btn-label").textContent = "Hämta data";
    $("#log-state").textContent = "fel";
    return;
  }
  watchFetchStream();
}

for (const id of ["#league-filters", "#league-sub"]) {
  $(id).addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    if (btn.dataset.group) toggleGroup(btn.dataset.group);
    else setLeague(btn.dataset.league);
  });
}

// Analys-knappen på varje match: samma agentpipeline som Daily Scanner (GET /api/analyze)
async function toggleAnalysis(btn) {
  const box = btn.nextElementSibling;
  const open = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!open));
  box.hidden = open;
  btn.textContent = open ? "Analys · agent 1–6" : "Dölj analys";
  if (open || box.dataset.loaded) return;
  box.innerHTML = `<p class="scan-empty">Agenterna analyserar…</p>`;
  try {
    const qs = new URLSearchParams({ league: btn.dataset.league, date: btn.dataset.date, home: btn.dataset.home, away: btn.dataset.away });
    const res = await fetch(`/api/analyze?${qs}`, { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) {
      // Gammal serverprocess utan /api/analyze
      if (body.error === "Okänd API-route") throw new Error("GUI-servern kör en äldre version – starta om den (npm run gui) och ladda om sidan.");
      throw new Error(body.error || "Analysen misslyckades");
    }
    box.innerHTML = agentBody(body, { withVerdict: true });
    box.dataset.loaded = "1";
  } catch (e) {
    box.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  }
}

for (const id of ["#tips", "#candidates"]) {
  $(id).addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-analyze");
    if (btn) toggleAnalysis(btn);
  });
}

$("#accuracy").addEventListener("click", (e) => {
  const card = e.target.closest(".acc");
  if (!card) return;
  toggleAccDetail(card.dataset.label || card.dataset.market, card.dataset.market);
});

$("#acc-detail-close")?.addEventListener("click", () => closeAccDetail());

$("#btn-fetch").addEventListener("click", () => {
  startFetch().catch((e) => {
    appendLog(String(e.message || e));
    $("#btn-fetch").disabled = false;
    $("#btn-fetch .btn-label").textContent = "Hämta data";
  });
});

$("#btn-refresh").addEventListener("click", () => {
  loadDashboard().catch((e) => appendLog(String(e.message || e)));
});

// ---------- Daily Scanner (Agent 7 → 1+4 → 2 → 3 → 5 → 6) ----------

const VERDICT_CLASS = { BET: "verdict-bet", WAIT: "verdict-wait", "NO BET": "verdict-nobet" };
let scanStream = null;

function pctTxt(p) {
  return p == null ? "—" : `${Math.round(Number(p) * 100)}%`;
}

function evTxt(ev) {
  if (ev == null) return "—";
  const n = Math.round(Number(ev) * 100);
  return `${n > 0 ? "+" : ""}${n}%`;
}

function setScanButton(state, label) {
  const btn = $("#btn-scan");
  btn.dataset.state = state;
  btn.querySelector(".btn-label").textContent = label;
}

/** Knappens text säger hur det går: kör, antal BET/WAIT, eller fel. */
function scanButtonFromResult(result, st) {
  if (st?.running) {
    const p = st.progress;
    const pctDone = p?.total ? Math.round((p.step / p.total) * 100) : 0;
    return setScanButton("running", `Scannar… ${pctDone}%`);
  }
  if (st?.ok === false) return setScanButton("error", "Scanner: fel");
  if (!result) return setScanButton("idle", "Daily Scanner");
  const s = result.summary || {};
  if (s.bet) return setScanButton("bet", `Scanner: ${s.bet} BET`);
  if (s.wait) return setScanButton("wait", `Scanner: ${s.wait} WAIT`);
  return setScanButton("idle", "Scanner: inga spel");
}

function renderScanProgress(st) {
  const p = st?.progress;
  const pctDone = p?.total ? Math.min(100, Math.round((p.step / p.total) * 100)) : 0;
  $("#scan-bar-fill").style.width = `${st?.running ? pctDone : st?.ok === false ? 0 : 100}%`;
  if (st?.running) $("#scan-step").textContent = `${p?.text || "Kör…"} (${p?.step ?? 0}/${p?.total ?? "?"})`;
  else if (st?.ok === false) $("#scan-step").textContent = `Fel: ${st.error || "okänt fel"}`;
}

function agentList(items, empty = "—") {
  if (!items?.length) return `<p class="scan-empty">${escapeHtml(empty)}</p>`;
  return `<ul>${items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
}

function scanItem(m) {
  const h = m.head;
  const b = h.best;
  const vcls = VERDICT_CLASS[h.verdict] || "verdict-nobet";
  return `
    <details class="scan-item">
      <summary>
        <span class="verdict ${vcls}">${escapeHtml(h.verdict)}</span>
        <span class="scan-match">
          <strong>${escapeHtml(m.match)}</strong>
          <span>${escapeHtml(m.league)} · ${escapeHtml(fmtKick(m))} · confidence ${escapeHtml(h.confidence)}</span>
        </span>
        <span class="scan-pick">${
          b
            ? `${escapeHtml(b.pick)} @ ${escapeHtml(fmtOdd(b.book))} <small>EV ${evTxt(b.ev)} · spela från ${escapeHtml(fmtOdd(b.minOdds))}</small>`
            : `<small>${escapeHtml(h.why[0] || "")}</small>`
        }</span>
      </summary>
      ${agentBody(m)}
    </details>`;
}

/** Agent 1–6 för en match (Daily Scanner-listan och Analys-knappen på korten). */
function agentBody(m, { withVerdict = false } = {}) {
  const h = m.head;
  const q = m.quant;
  const k = q.markets || {};
  const vcls = VERDICT_CLASS[h.verdict] || "verdict-nobet";
  const resCls = m.devil.residual === "Dead" ? "dead" : m.devil.residual === "Weakened" ? "weak" : "ok";
  const f = m.football;
  const side = (x) =>
    x
      ? `${x.form ? escapeHtml(String(x.form).slice(-5)) : "—"} · Elo ${Math.round(x.elo)}${x.eloSource === "clubelo" ? "" : "*"} · ${x.played} m`
      : "saknas";
  const marketRows = m.market.rows
    .map(
      (r) => `<tr><td>${escapeHtml(r.pick)}</td><td>${pctTxt(r.modelP)}</td><td>${pctTxt(r.marketP)}</td>
        <td>${escapeHtml(fmtOdd(r.book))}</td><td>${evTxt(r.ev)}</td>
        <td>${r.value === true ? '<span class="val-badge val-yes">Värde</span>' : r.value === false ? '<span class="val-badge val-no">Ej värde</span>' : "—"}</td></tr>`
    )
    .join("");
  const verdictTxt = withVerdict
    ? ` — <span class="verdict ${vcls}">${escapeHtml(h.verdict)}</span> confidence ${escapeHtml(h.confidence)}`
    : "";
  return `
      <div class="scan-body">
        <div class="agent-box agent-wide">
          <h4>Agent 6 · Head${verdictTxt}</h4>
          ${agentList(h.why)}
          ${h.changeIf?.length ? `<p class="scan-empty">Ändrar beslutet: ${escapeHtml(h.changeIf.join(" · "))}</p>` : ""}
        </div>
        <div class="agent-box">
          <h4>Agent 1 · Football</h4>
          <ul><li>Hemma: ${side(f.home)}</li><li>Borta: ${side(f.away)}</li></ul>
          ${f.missing?.length ? `<p class="scan-empty">Saknas: ${escapeHtml(f.missing.join(" · "))}</p>` : ""}
        </div>
        <div class="agent-box">
          <h4>Agent 4 · Research</h4>
          ${agentList([`Elvor: ${m.research.lineupStatus}`, ...m.research.notes])}
        </div>
        <div class="agent-box">
          <h4>Agent 2 · Quant (${escapeHtml(q.confidence)})</h4>
          ${
            q.available
              ? `<ul>
                  ${q.projectedGoals ? `<li>Proj. mål ${q.projectedGoals.home} – ${q.projectedGoals.away} (tot ${q.projectedGoals.total})</li>` : ""}
                  <li>1X2 ${pctTxt(k.home?.p)} / ${pctTxt(k.draw?.p)} / ${pctTxt(k.away?.p)}</li>
                  <li>Ö2.5 ${pctTxt(k.over25?.p)} · BTTS ${pctTxt(k.btts?.p)} · Ö3.5 ${pctTxt(k.over35?.p)}</li>
                </ul>`
              : `<p class="scan-empty">${escapeHtml(q.reason || "Ingen modell")}</p>`
          }
        </div>
        <div class="agent-box agent-wide">
          <h4>Agent 3 · Market${m.market.fairSource ? ` (facit ${escapeHtml(m.market.fairSource)})` : ""}</h4>
          ${
            m.market.available
              ? `<table><thead><tr><th>Utfall</th><th>Modell</th><th>Marknad</th><th>Bästa odds</th><th>EV</th><th></th></tr></thead><tbody>${marketRows}</tbody></table>`
              : `<p class="scan-empty">NO MARKET DATA</p>`
          }
        </div>
        <div class="agent-box agent-wide">
          <h4>Agent 5 · Devil's Advocate — <span class="${resCls}">${escapeHtml(m.devil.residual)}</span></h4>
          ${agentList([...m.devil.attacks, ...m.devil.fragile], "Inga invändningar")}
        </div>
      </div>`;
}

function renderScanResult(result) {
  const sum = $("#scan-summary");
  const list = $("#scan-list");
  if (!result) {
    sum.innerHTML = "";
    list.innerHTML = `<p class="scan-empty">Ingen scan körd ännu. Tryck “Kör scan”.</p>`;
    $("#scan-step").textContent = "—";
    return;
  }
  const s = result.summary || {};
  const r = result.record;
  const chips = [
    `<span class="scan-chip"><b>${s.bet ?? 0}</b> BET</span>`,
    `<span class="scan-chip"><b>${s.wait ?? 0}</b> WAIT</span>`,
    `<span class="scan-chip"><b>${s.noBet ?? 0}</b> NO BET</span>`,
    `<span class="scan-chip">${result.matches.length} av ${result.poolSize} kandidater · ${result.days} dagar</span>`,
  ];
  if (r?.bets) {
    chips.push(
      r.settled
        ? `<span class="scan-chip">Facit scanner-BET: <b>${r.won}/${r.settled}</b> rätt · ROI <b>${evTxt(r.roi)}</b>${r.open ? ` · ${r.open} öppna` : ""}</span>`
        : `<span class="scan-chip">Facit: ${r.open} BET inväntar resultat</span>`
    );
  }
  sum.innerHTML = chips.join("");
  $("#scan-step").textContent = `Senaste scan ${fmtWhen(result.finishedAt)} · data från ${fmtWhen(result.dataUpdatedAt)}`;
  list.innerHTML = result.matches.length
    ? result.matches.map(scanItem).join("")
    : `<p class="scan-empty">Inga matcher inom horisonten.</p>`;
}

async function loadScan() {
  const res = await fetch("/api/scan", { cache: "no-store" });
  if (!res.ok) throw new Error("Kunde inte läsa scan");
  const { state: st, result } = await res.json();
  scanButtonFromResult(result, st);
  renderScanResult(result);
  renderScanProgress(st);
  if (st.running) watchScan();
  return { st, result };
}

function watchScan() {
  if (scanStream) return;
  scanStream = new EventSource("/api/scan/stream");
  scanStream.onmessage = async (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (msg.type === "progress") {
      const st = { running: true, progress: msg.progress };
      renderScanProgress(st);
      scanButtonFromResult(null, st);
    }
    if (msg.type === "done") {
      scanStream.close();
      scanStream = null;
      $("#scan-run").disabled = false;
      if (!msg.replay) await loadScan().catch(() => {});
      if (msg.ok === false) {
        renderScanProgress(msg);
        scanButtonFromResult(null, msg);
      }
    }
  };
  scanStream.onerror = () => {
    /* webbläsaren återansluter medan scannern kör */
  };
}

async function runScan() {
  $("#scan-panel").hidden = false;
  $("#scan-run").disabled = true;
  const days = Number($("#scan-days").value) || 7;
  try {
    localStorage.setItem("betting.scanDays", String(days));
  } catch {
    /* ignore */
  }
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    $("#scan-step").textContent = body.error || "Kunde inte starta scannern";
    $("#scan-run").disabled = false;
    return;
  }
  const st = res.ok ? body : { running: true, progress: { text: body.error } };
  renderScanProgress(st);
  scanButtonFromResult(null, st);
  watchScan();
}

try {
  const savedDays = localStorage.getItem("betting.scanDays");
  if (savedDays) $("#scan-days").value = savedDays;
} catch {
  /* ignore */
}

// Knappen öppnar panelen; kör en scan direkt om ingen finns eller den är från en tidigare dag
$("#btn-scan").addEventListener("click", async () => {
  const panel = $("#scan-panel");
  const opening = panel.hidden;
  panel.hidden = false;
  if (!opening) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  try {
    const { st, result } = await loadScan();
    const stale = !result || String(result.finishedAt || "").slice(0, 10) !== new Date().toISOString().slice(0, 10);
    if (!st.running && stale) await runScan();
  } catch (e) {
    $("#scan-step").textContent = String(e.message || e);
  }
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#scan-run").addEventListener("click", () => runScan().catch((e) => ($("#scan-step").textContent = String(e.message || e))));
$("#scan-close").addEventListener("click", () => ($("#scan-panel").hidden = true));

syncLeaguePills();
loadScan().catch(() => setScanButton("idle", "Daily Scanner"));
loadDashboard().catch((e) => {
  $("#tips").innerHTML = `<div class="empty">${escapeHtml(e.message || e)}</div>`;
});
