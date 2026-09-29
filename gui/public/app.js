const $ = (sel) => document.querySelector(sel);

let state = {
  league: localStorage.getItem("betting.leagueFilter") || "ALL",
  bestUpcoming: [],
  allCandidates: [],
  accuracy: null,
  accuracyByLeague: null,
  accuracyByConfidence: null,
  accuracyByConfidenceByLeague: null,
  drawCalibration: null,
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
  if (tip.marketLed) parts.push(`<span class="market-only">${escapeHtml(tip.marketLedNote || "Tidig säsong – marknadens chans styr tipset")}</span>`);
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

/** Alla utfall med fasta farger; tippat utfall markeras. Med mkt blir utfallen klickbara (värde per utfall). */
function oddsGroup(items, activeKey, mkt = null) {
  const parts = items.map(({ key, label, odd }) => {
    const active = key === activeKey ? " is-tip is-selected" : "";
    const click = mkt ? ` role="button" tabindex="0" data-mkt="${mkt}" data-key="${key}" title="Klicka: spelvärde för ${escapeHtml(label)}"` : "";
    return `<span class="odd-pill odd-${key}${active}${mkt ? " is-clickable" : ""}"${click}><em>${escapeHtml(label)}</em><b>${escapeHtml(fmtOdd(odd))}</b></span>`;
  });
  return `<div class="odds-group">${parts.join("")}</div>`;
}

// Utan marknadsfacit (BTTS, hörn: inga odds i källorna) krävs samma marginal som tunnaste facit i pro-lagret
const MODEL_ONLY_MIN_EV = 0.08;
const tipIndex = new Map();
const tipId = (t) => `${t.league}|${t.date}|${t.home}|${t.away}`;

/** Utfall utan odds: modellens chans -> lägsta odds där spelet har värde. */
function modelValueCell(p, label) {
  if (p == null || !(p > 0)) return `<td class="val"><span class="val-badge val-none">Inga odds</span></td>`;
  const minOdds = Math.round(((1 + MODEL_ONLY_MIN_EV) / p) * 100) / 100;
  const fair = Math.round((1 / p) * 100) / 100;
  const title = `Inga odds i källorna för ${label}. Modellens chans ${Math.round(p * 100)} % ger fair odds ${fair}; spelvärde från ${minOdds} (+8 % marginal, inget marknadsfacit).`;
  return `<td class="val" title="${escapeHtml(title)}"><div class="val-for">${escapeHtml(label)}</div><span class="val-badge val-none">Inga odds</span>
    <div class="val-min">spela från <b>${minOdds}</b></div>
    <div class="val-rr">chans ${Math.round(p * 100)} % · fair ${fair}</div>
    <div class="val-min">facit: bara modell</div></td>`;
}

/** Värdecellen för valt utfall i en marknad (klick på oddsknapp eller tippat utfall). */
function valueFor(tip, mkt, key) {
  const t = tip.tips || {};
  if (mkt === "1X2") {
    const k = { home: "home", draw: "draw", away: "away" }[key];
    const label = { home: "1", draw: "X", away: "2" }[key];
    return valueCell(tip, k, ["home", "draw", "away"], label);
  }
  if (mkt === "OU25") {
    const k = key === "over" ? "over25" : "under25";
    return valueCell(tip, k, ["over25", "under25"], key === "over" ? "Över 2.5" : "Under 2.5");
  }
  if (mkt === "BTTS") {
    const pYes = tip.pro?.blended?.btts ?? t.BTTS?.pYes;
    return modelValueCell(pYes == null ? null : key === "btts-yes" ? pYes : 1 - pYes, key === "btts-yes" ? "BTTS JA" : "BTTS NEJ");
  }
  if (mkt === "CORNERS") {
    const c = t.CORNERS;
    const line = c?.line ?? 9.5;
    return modelValueCell(c?.pOver == null ? null : key === "over" ? c.pOver : 1 - c.pOver, `${key === "over" ? "Över" : "Under"} ${line} hörn`);
  }
  return `<td class="val"><span class="val-badge val-none">Inga odds</span></td>`;
}

/**
 * Värde vid dagens odds för valt utfall (pro.verdicts från pro-lagret).
 * Visar även om ett annat utfall i samma marknad har värde. label visas när utfallet inte är tipset.
 */
function valueCell(tip, pickKey, keys, label = null) {
  const v = tip.pro?.verdicts || {};
  const x = v[pickKey];
  const others = keys
    .filter((k) => k !== pickKey && v[k]?.value)
    .map((k) => `${escapeHtml(v[k].pick)} @ ${escapeHtml(fmtOdd(v[k].odds))}`);
  const otherTxt = others.length ? `<div class="val-other">Värde: ${others.join(", ")}</div>` : "";
  const forTxt = label ? `<div class="val-for">${escapeHtml(label)}${x?.odds ? ` @ ${escapeHtml(fmtOdd(x.odds))}` : ""}</div>` : "";
  if (!x || x.value == null) {
    // Pro-lagret ger alltid ett omdöme när det finns odds; saknas det finns inga odds för utfallet
    return `<td class="val">${forTxt}<span class="val-badge val-none">Inga odds</span>${otherTxt}</td>`;
  }
  // Facit utan Pinnacle/Betfair (snitt av bolagen): svagare, därför högre tröskel - visas under omdömet
  const basis = x.fairSource && !/pinnacle|betfair/.test(x.fairSource) ? `<div class="val-min">facit: ${escapeHtml(x.fairSource)}</div>` : "";
  const title = `Värt att spela från odds ${x.minOdds}${basis ? ` (facit: ${x.fairSource})` : ""}`;
  const rrTxt = riskRewardLines(x);
  return x.value
    ? `<td class="val" title="${escapeHtml(title)}">${forTxt}<span class="val-badge val-yes">Värde</span>${rrTxt}${basis}${otherTxt}</td>`
    : x.reason
      ? `<td class="val" title="Skrällodds – chansen överskattas, spelas aldrig">${forTxt}<span class="val-badge val-no">Ej värde</span><div class="val-min">${escapeHtml(x.reason)}</div>${rrTxt}${otherTxt}</td>`
      : `<td class="val" title="${escapeHtml(title)}">${forTxt}<span class="val-badge val-no">Ej värde</span><div class="val-min">från ${escapeHtml(fmtOdd(x.minOdds))}</div>${rrTxt}${basis}${otherTxt}</td>`;
}

/**
 * Risk vs reward: insats mot möjlig vinst, förväntat värde i kr,
 * och vår chans mot break-even-chansen (1/odds) som oddset kräver.
 */
function riskRewardLines(x) {
  const rr = x.riskReward;
  if (!rr) return "";
  const pc = (p) => `${Math.round(p * 100)} %`;
  const ev = `${rr.evSek >= 0 ? "+" : "−"}${Math.abs(rr.evSek)} kr`;
  // Krav för "Värde" = marginal över break-even (3 % mot Pinnacle/Betfair, högre mot bolagssnitt).
  // minOdds är satt så att p x minOdds - 1 = kravet -> kravet kan räknas tillbaka.
  const evPct = x.ev != null ? x.ev : x.p * x.odds - 1;
  const req = x.minOdds && x.p ? x.minOdds * x.p - 1 : null;
  const pctTxt = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v * 1000) / 10).toLocaleString("sv-SE")} %`;
  const cls = x.value ? "rr-pos" : rr.evSek > 0 ? "rr-near" : "rr-neg";
  const tip = `Risk ${rr.stake} kr för att vinna ${rr.win} kr (1:${rr.ratio}). Oddset kräver ${pc(rr.breakEven)} chans, facit ger ${pc(x.p)}. `
    + `Förväntat värde ${ev} per spel i snitt (${pctTxt(evPct)} av insatsen)${req != null ? `; för "Värde" krävs minst ${pctTxt(req)} som säkerhetsmarginal` : ""}.`;
  return `<div class="val-rr" title="${escapeHtml(tip)}">${rr.stake} kr → +${rr.win} kr</div>`
    + `<div class="val-rr" title="${escapeHtml(tip)}">EV <b class="${cls}">${ev} (${pctTxt(evPct)})</b>${req != null ? ` · krav ${pctTxt(req)}` : ""}</div>`
    + `<div class="val-rr">chans ${pc(x.p)} · krävs ${pc(rr.breakEven)}</div>`;
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
  const c = t.CORNERS;
  const cornerLine = c?.line != null ? String(c.line) : "9.5";
  const pickC = String(c?.pick || "").toUpperCase();
  const cornerKey = pickC.includes("OVER") ? "over" : pickC.includes("UNDER") ? "under" : "";

  // Chans att respektive tips går in (confidence), inte rå pYes/pOver
  const conf1 = t["1X2"]?.confidence;
  const confB = t.BTTS?.confidence;
  const confO = t.OU25?.confidence;
  const confC = c?.confidence;

  tipIndex.set(tipId(tip), tip);
  const cornersRow = c
    ? `<tr data-mkt="CORNERS">
            <td class="mkt">Hörn ${escapeHtml(cornerLine)}</td>
            <td>${oddsGroup(
              [
                { key: "over", label: "Ö", odd: null },
                { key: "under", label: "U", odd: null },
              ],
              cornerKey,
              "CORNERS"
            )}${c.expCorners != null ? `<div class="odds-src">Proj. ${escapeHtml(String(c.expCorners))} hörn</div>` : ""}</td>
            <td class="num">${fmtChance(confC)}</td>
            ${valueFor(tip, "CORNERS", cornerKey || "over")}
          </tr>`
    : "";

  return `
    <article class="tip" style="${style}" data-tip-id="${escapeHtml(tipId(tip))}">
      <header class="tip-head">
        <div class="tip-meta">
          <time class="date">${escapeHtml(fmtKick(tip))}</time>
          <div class="tip-tags">
            <span class="league" title="${escapeHtml(leagueFull)}">${escapeHtml(leagueShort)}</span>
            ${roundShort ? `<span class="round">${escapeHtml(roundShort)}</span>` : ""}
          </div>
        </div>
        <h3 class="match">${
          tip.home && tip.away
            ? `<button type="button" class="team-link" data-venue="home" title="Form, modellens träff och inbördes möten">${escapeHtml(tip.home)}</button> vs <button type="button" class="team-link" data-venue="away" title="Form, modellens träff och inbördes möten">${escapeHtml(tip.away)}</button>`
            : escapeHtml(tip.match || "")
        }</h3>
        <div class="score-box" title="Samlad chans att tipset håller (snitt över marknaderna)">
          <div class="n">${fmtChance(tip.tipScore)}</div>
          <div class="l">chans</div>
        </div>
      </header>
      <div class="team-panel" hidden></div>

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
          <tr data-mkt="1X2">
            <td class="mkt">1X2</td>
            <td>${oddsGroup(
              [
                { key: "home", label: "1", odd: od.one },
                { key: "draw", label: "X", odd: od.x },
                { key: "away", label: "2", odd: od.two },
              ],
              pick1 === "1" ? "home" : pick1 === "X" ? "draw" : pick1 === "2" ? "away" : "",
              "1X2"
            )}</td>
            <td class="num">${fmtChance(conf1)}</td>
            ${valueCell(tip, pick1 === "1" ? "home" : pick1 === "X" ? "draw" : "away", ["home", "draw", "away"])}
          </tr>
          <tr data-mkt="BTTS">
            <td class="mkt">BTTS</td>
            <td>${oddsGroup(
              [
                { key: "btts-yes", label: "JA", odd: od.bttsYes },
                { key: "btts-no", label: "NEJ", odd: od.bttsNo },
              ],
              bttsKey,
              "BTTS"
            )}</td>
            <td class="num">${fmtChance(confB)}</td>
            ${valueFor(tip, "BTTS", bttsKey || "btts-yes")}
          </tr>
          <tr data-mkt="OU25">
            <td class="mkt">Ö/U 2.5</td>
            <td>${oddsGroup(
              [
                { key: "over", label: "Ö", odd: od.over },
                { key: "under", label: "U", odd: od.under },
              ],
              ouKey,
              "OU25"
            )}</td>
            <td class="num">${fmtChance(confO)}</td>
            ${valueCell(tip, ouKey === "over" ? "over25" : "under25", ["over25", "under25"])}
          </tr>
          ${cornersRow}
        </tbody>
      </table>
      ${od.book ? `<div class="odds-src">Odds: ${escapeHtml(od.book)}</div>` : ""}
      ${noteLines(tip)}
      <div class="tip-analyze">
        <div class="tip-actions">
          <button type="button" class="btn-analyze" aria-expanded="false"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}">Analys · agent 1–6</button>
          <button type="button" class="btn-lineup"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}"
            title="Hämta startelva för just den här matchen (Fotmob/ESPN)">Hämta elva</button>
        </div>
        <div class="analysis" hidden></div>
      </div>
    </article>
  `;
}

function kickMs(tip) {
  const d = new Date(tip.kickoffUtc || `${tip.date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? Infinity : d.getTime();
}

/** Lokal speldag (YYYY-MM-DD) för en match. */
function kickDay(tip) {
  const d = new Date(tip.kickoffUtc || "");
  if (Number.isNaN(d.getTime())) return tip.date || "";
  return d.toLocaleDateString("sv-SE");
}

const TOP_N = 5;

/** Dagens (annars närmaste speldags) bästa tips, högst tipScore först. */
function topOfDay(list) {
  const today = new Date().toLocaleDateString("sv-SE");
  const days = [...new Set(list.map(kickDay).filter((d) => d && d >= today))].sort();
  const day = days[0];
  if (!day) return { day: null, top: [] };
  const top = list
    .filter((t) => kickDay(t) === day)
    .sort((a, b) => (b.tipScore ?? 0) - (a.tipScore ?? 0))
    .slice(0, TOP_N);
  return { day, top };
}

/** Grupperar per liga; ligorna i ordning efter tidigaste avspark, matcherna tidigaste först. */
function groupByLeague(list) {
  const groups = new Map();
  for (const t of [...list].sort((a, b) => kickMs(a) - kickMs(b))) {
    const k = t.league || "—";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  }
  return [...groups.entries()];
}

function groupHead(title, count) {
  return `<h3 class="tip-group-head">${escapeHtml(title)}<span class="count">${count}</span></h3>`;
}

function renderList(el, list, emptyMsg, { top = false } = {}) {
  const filtered = byLeague(list);
  if (!filtered.length) {
    el.innerHTML = `<div class="empty">${escapeHtml(emptyMsg)}</div>`;
    return;
  }
  let i = 0;
  const card = (t) => tipCard(t, i++);
  let html = "";
  let rest = filtered;
  if (top) {
    const { day, top: best } = topOfDay(filtered);
    if (best.length) {
      const today = new Date().toLocaleDateString("sv-SE");
      const dayTxt = day === today
        ? "idag"
        : new Date(`${day}T12:00:00`).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" });
      html += groupHead(`Topp ${best.length} · ${dayTxt}`, best.length) + best.map(card).join("");
      rest = filtered.filter((t) => !best.includes(t));
    }
  }
  for (const [lg, tips] of groupByLeague(rest)) {
    html += groupHead(leagueName(lg), tips.length) + tips.map(card).join("");
  }
  el.innerHTML = html;
}

function renderTips() {
  const selName = leagueName(state.league);
  renderList(
    $("#tips"),
    state.bestUpcoming,
    state.bestUpcoming.length
      ? `Inga tips i ${selName} just nu.`
      : "Inga kommande tips. Tryck på Hämta data.",
    { top: true }
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

  renderDrawCal(marketKey);
  detail.hidden = false;
}

/** 1X2: modellens krysschans (före/efter kalibrering) mot faktisk andel kryss i backtesten. */
function renderDrawCal(marketKey) {
  const host = $("#draw-cal");
  if (!host) return;
  const dc = state.drawCalibration;
  if (marketKey !== "1X2" || !dc?.bins) {
    host.hidden = true;
    return;
  }
  const lg = state.league !== "ALL" ? dc.byLeague?.[state.league] : null;
  const m = dc.meta || {};
  const row = (label, x) =>
    `<tr><td>${escapeHtml(label)}</td><td class="num">${x.tested}</td><td class="num">${fmtPct(x.predictedRaw)}</td><td class="num">${fmtPct(x.predicted)}</td><td class="num"><b>${fmtPct(x.actual)}</b></td></tr>`;
  const rows = Object.entries(dc.bins).filter(([, x]) => x.tested).map(([k, x]) => row(`Modell ${k} %`, x));
  if (lg?.tested) rows.push(row(`${leagueName(state.league)} totalt`, lg));
  const status = m.kept
    ? `Kalibrering aktiv: krysschansen = ligans kryssandel${m.w ? ` (${Math.round(m.w * 100)} % modell)` : ""}. Log-loss ${m.testLogLossRaw} → ${m.testLogLossCal} på säsongens andra halva.`
    : `Ingen kalibrering (${escapeHtml(m.reason || "okänt")}).`;
  host.innerHTML = `
    <h4>Kryss: modellens chans mot utfall</h4>
    <p class="scan-empty">${status} X tippas aldrig – det är sällan mest troligt, men kan ha värde (se Agent 3).</p>
    <table class="draw-cal-table">
      <thead><tr><th>Grupp</th><th class="num">Matcher</th><th class="num">Tidigare</th><th class="num">Nu</th><th class="num">Faktiskt kryss</th></tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>`;
  host.hidden = false;
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
  // 1X2: träff per val (hur ofta tippad 1 / X / 2 gick in)
  const picksHtml = (bp) =>
    bp
      ? `<div class="acc-picks">${["1", "X", "2"]
          .map((p) => {
            const x = bp[p];
            return `<div class="acc-pick"><span class="pk">${p}</span><span class="pv">${x?.tested ? fmtPct(x.rate) : "—"}</span><span class="pn">${x?.tested ? `${x.correct}/${x.tested}` : "tippas aldrig"}</span></div>`;
          })
          .join("")}</div>`
      : "";
  // Ligans faktiska utfall: hur ofta 1 / X / 2 händer (jämför med tipsens träff ovan)
  const out = state.outcomesByLeague?.[state.league === "ALL" ? "ALL" : state.league];
  const outcomesHtml = out?.matches
    ? `<div class="acc-outcomes">
        <div class="acc-outcomes-label">Så slutar matcherna · ${out.matches} spelade</div>
        <div class="acc-picks">${[["1", out.home], ["X", out.draw], ["2", out.away]]
          .map(([p, v]) => `<div class="acc-pick is-outcome"><span class="pk">${p}</span><span class="pv">${fmtPct(v)}</span></div>`)
          .join("")}</div>
      </div>`
    : "";
  box.innerHTML = rows
    .map(
      ([label, key, a]) => `
      <button type="button" class="acc${state.openMarket === key ? " is-open" : ""}" data-market="${key}" data-label="${escapeHtml(label)}">
        <div class="label">${label}</div>
        <div class="val">${fmtPct(a?.rate)}</div>
        <div class="sub">${a?.source === "tipsmotor"
          ? `${a.correct}/${a.tested} spelade ${a.season} · väntat ${fmtPct(a.expectedRate)} · ${scope}`
          : `${a?.correct ?? 0}/${a?.tested ?? 0} i backtest · ${scope}`}</div>
        ${key === "1X2" ? `<div class="acc-outcomes-label">Tipsens träff</div>${picksHtml(a?.byPick)}${outcomesHtml}` : ""}
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
  sub.innerHTML = ls
    .map((l) => `<button type="button" class="filter-pill" data-league="${escapeHtml(l)}">${escapeHtml(leagueName(l))}<span class="count">${countFor([l])}</span></button>`)
    .join("");
}

/** Landets högsta liga som har matcher (grupperna i config/leagues.json listar högsta ligan först). */
function topLeagueOf(groupId) {
  const g = state.leagueGroups.find((x) => x.id === groupId);
  if (!g) return null;
  const present = presentLeagues();
  return g.leagues.find((l) => present.has(l)) || g.leagues[0] || null;
}

function presentLeagues() {
  return new Set([...state.bestUpcoming, ...state.allCandidates].map((t) => t.league).filter(Boolean));
}

/** Klick på land: fäll ut/in ligorna och välj högsta ligan. */
function toggleGroup(id) {
  if (state.openGroup === id) {
    state.openGroup = null;
  } else {
    state.openGroup = id;
    const top = topLeagueOf(id);
    if (top) setLeague(top, { keepGroup: true });
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
  state.drawCalibration = data.drawCalibration || null;
  state.outcomesByLeague = data.outcomesByLeague || null;
  state._matchCount = data.sources?.matchCount ?? "—";
  state.leagueNames = data.leagueNames || {};
  // Länder/grupper i bokstavsordning (svensk sortering: ... Tjeckien, Tyskland, USA)
  state.leagueGroups = (data.leagueGroups || []).slice().sort((a, b) => a.name.localeCompare(b.name, "sv"));
  // Sparat landsval ("Alla i Norge") finns inte längre -> landets högsta liga
  if (state.league.startsWith("G:")) {
    state.openGroup = state.league.slice(2);
    const g = state.leagueGroups.find((x) => x.id === state.openGroup);
    const present = new Set([...state.bestUpcoming, ...state.allCandidates].map((t) => t.league));
    state.league = g?.leagues.find((l) => present.has(l)) || g?.leagues[0] || "ALL";
    localStorage.setItem("betting.leagueFilter", state.league);
  } else {
    const owner = state.leagueGroups.find((g) => g.leagues.includes(state.league));
    if (owner && owner.leagues.length > 1) state.openGroup = owner.id;
  }

  buildLeagueFilters(data.leagues || ["PL", "CH"]);

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
  const box = btn.closest(".tip-analyze")?.querySelector(".analysis");
  if (!box) return;
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
      if (body.error === "Okänd API-route") throw new Error("GUI-servern kör en äldre version – starta om den (npm run gui) och ladda om sidan.");
      throw new Error(body.error || "Analysen misslyckades");
    }
    box.innerHTML = agentBody(body, { withVerdict: true });
    box.dataset.loaded = "1";
  } catch (e) {
    box.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  }
}

/** Hämta elva för just den här matchen och uppdatera Agent 4. */
async function fetchLineupForTip(btn) {
  const wrap = btn.closest(".tip-analyze");
  const box = wrap?.querySelector(".analysis");
  const analyzeBtn = wrap?.querySelector(".btn-analyze");
  if (!box) return;
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Hämtar elva…";
  box.hidden = false;
  if (analyzeBtn) {
    analyzeBtn.setAttribute("aria-expanded", "true");
    analyzeBtn.textContent = "Dölj analys";
  }
  box.innerHTML = `<p class="scan-empty">Hämtar startelva från Fotmob/ESPN…</p>`;
  try {
    const res = await fetch("/api/lineup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        league: btn.dataset.league,
        date: btn.dataset.date,
        home: btn.dataset.home,
        away: btn.dataset.away,
      }),
    });
    const body = await res.json();
    if (!res.ok && !body.lineup) throw new Error(body.error || "Kunde inte hämta elva");
    if (body.analysis) {
      box.innerHTML = agentBody(body.analysis, { withVerdict: true });
      box.dataset.loaded = "1";
    } else {
      const lu = body.lineup || {};
      const status = lu.lineupStatus || "none";
      const home = (lu.homeStarters || []).map((p) => p.name || p).join(" · ") || "—";
      const away = (lu.awayStarters || []).map((p) => p.name || p).join(" · ") || "—";
      box.innerHTML = `<div class="scan-body"><div class="agent-box agent-wide"><h4>Elva · ${escapeHtml(status)}</h4>
        <p class="scan-empty">${escapeHtml(body.error || lu.note || (status === "confirmed" ? "Klart" : "Ej bekräftad"))}</p>
        <div class="xi-grid">
          <div class="xi-side"><div class="xi-label">Hemma</div><div class="xi-names">${escapeHtml(home)}</div></div>
          <div class="xi-side"><div class="xi-label">Borta</div><div class="xi-names">${escapeHtml(away)}</div></div>
        </div></div></div>`;
      box.dataset.loaded = "1";
    }
    // Uppdatera badge på kortet utan full reload
    const tip = btn.closest(".tip");
    if (tip && body.lineup?.lineupStatus) {
      let badge = tip.querySelector(".xi-confirmed, .xi-pending, .xi-none");
      const cls = body.lineup.lineupStatus === "confirmed" ? "xi-confirmed" : body.lineup.lineupStatus === "pending" ? "xi-pending" : "xi-none";
      const txt = `Elvor: ${body.lineup.lineupStatus}`;
      if (badge) {
        badge.className = cls;
        badge.textContent = txt;
      }
    }
  } catch (e) {
    box.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = prev;
  }
}

const R_CLASS = { V: "r-w", O: "r-d", F: "r-l" };
const fmtDateShort = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "2-digit" }) : "");

function formRow(label, f) {
  if (!f?.played) return `<div class="tp-row"><span class="tp-k">${escapeHtml(label)}</span><span class="tp-v">inga matcher än</span></div>`;
  const badges = f.last.map((x) => `<span class="r-badge ${R_CLASS[x.r]}" title="${escapeHtml(`${fmtDateShort(x.date)} ${x.venue === "H" ? "hemma" : "borta"} mot ${x.opp} ${x.score}`)}">${x.r}</span>`).join("");
  return `<div class="tp-row"><span class="tp-k">${escapeHtml(label)}</span>
    <span class="tp-v"><b>${f.w}-${f.d}-${f.l}</b> · ${f.ppg} p/match · mål ${f.gf}-${f.ga}</span>
    <span class="tp-badges">${badges}</span></div>`;
}

/** Panel för klickat lag: form denna säsong, modellens tips på laget och inbördes möten. */
function teamPanelHtml(d) {
  const venueTxt = d.venue === "away" ? "Borta" : "Hemma";
  const t = d.tips;
  const pct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : "—");
  const tipList = t.list
    .map((x) => `<span class="r-badge ${x.hit ? "r-w" : "r-l"}" title="${escapeHtml(`${fmtDateShort(x.date)} ${x.venue === "H" ? "hemma" : "borta"} mot ${x.opp}: tippade ${x.pickTeam ? d.team : "motståndaren"} – ${x.hit ? "rätt" : "fel"}`)}">${x.pickTeam ? "✓" : "✗"}</span>`)
    .join("");
  const h = d.h2h;
  const facts = [];
  if (h.total) {
    if (h.noWin >= 3) facts.push(`<b>${escapeHtml(d.team)}</b> har inte vunnit mot ${escapeHtml(d.opp)} på <b>${h.noWin}</b> möten${h.lastWin ? ` (senaste vinsten ${fmtDateShort(h.lastWin.date)}, ${h.lastWin.score})` : " – aldrig i datan"}`);
    else if (h.unbeaten >= 3) facts.push(`<b>${escapeHtml(d.team)}</b> är obesegrat mot ${escapeHtml(d.opp)} i <b>${h.unbeaten}</b> möten${h.lastLoss ? ` (senaste förlusten ${fmtDateShort(h.lastLoss.date)})` : ""}`);
    if (h.noWinAtVenue >= 3 && h.noWinAtVenue !== h.noWin) facts.push(`${venueTxt}: inte vunnit på ${h.noWinAtVenue} möten`);
    if (h.unbeatenAtVenue >= 3 && h.unbeatenAtVenue !== h.unbeaten) facts.push(`${venueTxt}: obesegrat i ${h.unbeatenAtVenue} möten`);
  }
  const recent = h.recent
    .map((x) => `<span class="r-badge ${R_CLASS[x.r]}" title="${escapeHtml(`${fmtDateShort(x.date)} ${x.venue === "H" ? "hemma" : "borta"} ${x.score}`)}">${x.r}</span>`)
    .join("");
  return `
    <div class="tp-head"><b>${escapeHtml(d.team)}</b> <span class="tp-sub">säsong ${escapeHtml(d.season)} · ${d.league}</span>
      <button type="button" class="btn-ghost tp-close" aria-label="Stäng">Stäng</button></div>
    ${formRow(`${venueTxt}form`, d.venueForm)}
    ${formRow("Alla matcher", d.form)}
    <div class="tp-row"><span class="tp-k">Modellen</span>
      <span class="tp-v">tippat ${escapeHtml(d.team)} <b>${t.forTeam.n}</b> ggr, rätt <b>${pct(t.forTeam.hits, t.forTeam.n)}</b>${t.forTeam.n ? ` (${t.forTeam.hits}/${t.forTeam.n})` : ""} · emot ${t.againstTeam.n} ggr, rätt ${pct(t.againstTeam.hits, t.againstTeam.n)}${t.againstTeam.n ? ` (${t.againstTeam.hits}/${t.againstTeam.n})` : ""}</span>
      <span class="tp-badges" title="Senaste tipsen i lagets matcher: ✓ = tippade laget, grönt = rätt">${tipList}</span></div>
    <div class="tp-row"><span class="tp-k">Mot ${escapeHtml(d.opp)}</span>
      <span class="tp-v">${h.total ? `<b>${h.w}-${h.d}-${h.l}</b> i ${h.total} möten sedan ${fmtDateShort(h.since)}` : "inga möten i datan"}</span>
      <span class="tp-badges" title="Senaste mötena, nyast först">${recent}</span></div>
    ${facts.length ? `<ul class="tp-facts">${facts.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}`;
}

async function toggleTeamPanel(btn) {
  const card = btn.closest(".tip");
  const tip = tipIndex.get(card?.dataset.tipId || "");
  const panel = card?.querySelector(".team-panel");
  if (!tip || !panel) return;
  const venue = btn.dataset.venue;
  const team = venue === "away" ? tip.away : tip.home;
  const opp = venue === "away" ? tip.home : tip.away;
  if (!panel.hidden && panel.dataset.team === team) {
    panel.hidden = true;
    return;
  }
  panel.dataset.team = team;
  panel.hidden = false;
  panel.innerHTML = `<p class="scan-empty">Hämtar ${escapeHtml(team)}…</p>`;
  try {
    const qs = new URLSearchParams({ league: tip.league, team, opp, venue });
    const res = await fetch(`/api/team?${qs}`, { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error === "Okänd API-route" ? "Starta om GUI-servern (npm run gui)." : body.error || "Kunde inte hämta laget");
    panel.innerHTML = teamPanelHtml(body);
  } catch (e) {
    panel.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  }
}

/** Klick på ett utfall (1 / X / 2, BTTS, Ö/U, hörn): visa spelvärdet för just det utfallet i raden. */
function selectOutcome(pill) {
  const card = pill.closest(".tip");
  const row = pill.closest("tr");
  const tip = tipIndex.get(card?.dataset.tipId || "");
  if (!tip || !row) return;
  row.querySelectorAll(".odd-pill.is-selected").forEach((p) => p.classList.remove("is-selected"));
  pill.classList.add("is-selected");
  const cell = row.querySelector("td.val");
  const html = valueFor(tip, pill.dataset.mkt, pill.dataset.key);
  if (cell) cell.outerHTML = html;
}

for (const id of ["#tips", "#candidates"]) {
  $(id).addEventListener("keydown", (e) => {
    const pill = e.target.closest?.(".odd-pill.is-clickable");
    if (pill && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      selectOutcome(pill);
    }
  });
  $(id).addEventListener("click", (e) => {
    const teamBtn = e.target.closest(".team-link");
    if (teamBtn) {
      toggleTeamPanel(teamBtn);
      return;
    }
    const closeBtn = e.target.closest(".tp-close");
    if (closeBtn) {
      closeBtn.closest(".team-panel").hidden = true;
      return;
    }
    const pill = e.target.closest(".odd-pill.is-clickable");
    if (pill) {
      selectOutcome(pill);
      return;
    }
    const lineupBtn = e.target.closest(".btn-lineup");
    if (lineupBtn) {
      fetchLineupForTip(lineupBtn);
      return;
    }
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

function researchBox(m) {
  const r = m.research || {};
  const status = r.lineupStatus || "none";
  const form =
    r.homeFormation || r.awayFormation
      ? `${escapeHtml(r.homeFormation || "?")} vs ${escapeHtml(r.awayFormation || "?")}`
      : null;
  const xi = (label, names) =>
    names?.length
      ? `<div class="xi-side"><div class="xi-label">${escapeHtml(label)}${form && label === "Hemma" && r.homeFormation ? ` · ${escapeHtml(r.homeFormation)}` : ""}${form && label === "Borta" && r.awayFormation ? ` · ${escapeHtml(r.awayFormation)}` : ""}</div><div class="xi-names">${names.map((n) => escapeHtml(n)).join(" · ")}</div></div>`
      : "";
  const head = [`Elvor: ${status}${r.lineupSource ? ` (${r.lineupSource})` : ""}`, ...r.notes];
  return `
    ${agentList(head)}
    ${
      status === "confirmed" && (r.homeStarters?.length || r.awayStarters?.length)
        ? `<div class="xi-grid">${xi("Hemma", r.homeStarters)}${xi("Borta", r.awayStarters)}</div>`
        : status === "pending"
          ? `<p class="scan-empty">Elvor ej släppta än — tryck “Hämta elva” igen närmare kickoff.</p>`
          : `<p class="scan-empty">Ingen elva i cache. Tryck “Hämta elva” för just den här matchen.</p>`
    }`;
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
          ${researchBox(m)}
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
