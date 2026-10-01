import { startelvaButton, startelvaPanel } from "/startelva.js";

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
  if (tip.marketLed) parts.push(`<span class="market-only">${escapeHtml((tip.marketLedNote || "Tidig säsong – marknadens chans styr tipset").replace(/\b(pinnacle|betfair)\b/g, capFirst))}</span>`);
  if (tip.lineupStatus && tip.lineupStatus !== "none") {
    const cls = tip.lineupStatus === "confirmed" ? "xi-confirmed" : "xi-pending";
    parts.push(`<span class="${cls}">Elvor: ${tip.lineupStatus === "confirmed" ? "bekräftade" : "ej släppta än"}</span>`);
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
      book: books.length ? `bästa pris · ${books.map(capFirst).join(", ")}` : "",
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
    book: tip.value?.bookmaker ? capFirst(String(tip.value.bookmaker)) : "",
  };
}

function fmtOdd(v) {
  if (v == null || v === "") return "—";
  return String(v);
}

/** Alla utfall med fasta farger; tippat utfall markeras. Med mkt blir utfallen klickbara (värde per utfall). */
const capFirst = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);

function oddsGroup(items, activeKey, mkt = null, valueKeys = []) {
  const parts = items.map(({ key, label, odd }) => {
    // Utfall med Värde markeras på själva chipet, även när det inte är det tippade utfallet
    const val = valueKeys.includes(key);
    const active = (key === activeKey ? " is-tip is-selected" : "") + (val ? " is-value" : "");
    const click = mkt ? ` role="button" tabindex="0" data-mkt="${mkt}" data-key="${key}" title="Klicka: spelvärde för ${escapeHtml(label)}"` : "";
    return `<span class="odd-pill odd-${key}${active}${mkt ? " is-clickable" : ""}"${click}><em>${escapeHtml(label)}</em><b>${escapeHtml(fmtOdd(odd))}</b>${val ? `<i class="pill-val">Värde</i>` : ""}</span>`;
  });
  return `<div class="odds-group">${parts.join("")}</div>`;
}

// Utan marknadsfacit (BTTS, hörn: inga odds i källorna) krävs samma marginal som tunnaste facit i pro-lagret
const MODEL_ONLY_MIN_EV = 0.08;
const tipIndex = new Map();
const tipId = (t) => `${t.league}|${t.date}|${t.home}|${t.away}`;

/** Lägsta odds där ett utfall utan marknadsfacit har värde (modellens chans + marginal). */
const modelMin = (p) => Math.round(((1 + MODEL_ONLY_MIN_EV) / p) * 100) / 100;

/** Utfall utan odds: modellens chans -> lägsta odds där spelet har värde. Detaljerna ligger i title och Detaljer. */
function modelValueCell(p, label) {
  if (p == null || !(p > 0)) return `<td class="val"><span class="val-badge val-none">Inga odds</span></td>`;
  const minOdds = modelMin(p);
  const fair = Math.round((1 / p) * 100) / 100;
  const title = `Inga odds i källorna för ${label}. Modellens chans ${Math.round(p * 100)} % ger fair odds ${fair}; spelvärde från ${minOdds} (+8 % marginal, inget marknadsfacit).`;
  return `<td class="val" title="${escapeHtml(title)}"><div class="val-line"><span class="val-badge val-none">Inga odds</span><span class="val-from">spela från <b>${minOdds}</b></span></div></td>`;
}

/** Modellens chans för Ö/U (samma källa som BTTS-raden: pro-lagrets blandning, annars tipsmotorn). */
function ouP(tip, key) {
  const po = tip.pro?.blended?.over25 ?? tip.tips?.OU25?.pOver;
  if (po == null) return null;
  return key === "over25" ? po : 1 - po;
}

/** Ö/U: omdöme mot odds om det finns, annars "spela från" som BTTS. */
function ouCell(tip, key, label = null) {
  const x = tip.pro?.verdicts?.[key];
  if (x && x.value != null) return valueCell(tip, key, ["over25", "under25"], label);
  return modelValueCell(ouP(tip, key), key === "over25" ? "Över 2.5" : "Under 2.5");
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
    return ouCell(tip, k, key === "over" ? "Över 2.5" : "Under 2.5");
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
  // Övriga utfall i marknaden på EN dämpad rad, varje med omdöme + "från X" (Värde markeras grönt)
  const rest = keys
    .filter((k) => k !== pickKey && v[k] && v[k].value != null)
    .map((k) => {
      const y = v[k];
      const name = escapeHtml(PICK_LABEL[k] || y.pick);
      const fromTxt = y.minOdds ? ` från ${escapeHtml(fmtOdd(y.minOdds))}` : "";
      return y.value
        ? `<span class="vo-yes" title="Värde vid odds ${escapeHtml(fmtOdd(y.odds))}">${name} Värde${fromTxt}</span>`
        : `<span title="Ej värde vid odds ${escapeHtml(fmtOdd(y.odds))}">${name}${fromTxt}</span>`;
    });
  const otherTxt = rest.length ? `<div class="val-others">Övriga: ${rest.join(" · ")}</div>` : "";
  const forTxt = label ? `<div class="val-for">${escapeHtml(label)}${x?.odds ? ` @ ${escapeHtml(fmtOdd(x.odds))}` : ""}</div>` : "";
  if (!x || x.value == null) {
    // Pro-lagret ger alltid ett omdöme när det finns odds; saknas det finns inga odds för utfallet
    return `<td class="val">${forTxt}<span class="val-badge val-none">Inga odds</span>${otherTxt}</td>`;
  }
  const from = x.minOdds ? `<span class="val-from">från <b>${escapeHtml(fmtOdd(x.minOdds))}</b></span>` : "";
  // EV, krav, chans/krävs och facit: i title (ⓘ) och i kortets Detaljer, inte på raden
  const title = `${x.reason ? "Skrällodds – chansen överskattas, spelas aldrig. " : ""}Värt att spela från odds ${x.minOdds}. ${rrText(x)}${x.fairSource ? ` · facit: ${x.fairSource}` : ""}`;
  const badge = x.value ? `<span class="val-badge val-yes">Värde</span>` : `<span class="val-badge val-no">Ej värde</span>`;
  const reason = x.reason ? `<div class="val-min">${escapeHtml(x.reason)}</div>` : "";
  return `<td class="val" title="${escapeHtml(title)}">${forTxt}<div class="val-line">${badge}${from}<span class="val-info" aria-hidden="true">ⓘ</span></div>${reason}${otherTxt}</td>`;
}

/**
 * Risk vs reward i procent (flat insats, inga kronbelopp):
 * förväntat värde mot kravet för "Värde", och vår chans mot break-even-chansen (1/odds).
 */
function rrText(x) {
  const rr = x.riskReward;
  const pc = (p) => `${Math.round(p * 100)} %`;
  // Krav för "Värde" = marginal över break-even (3 % mot Pinnacle/Betfair, högre mot bolagssnitt).
  // minOdds är satt så att p x minOdds - 1 = kravet -> kravet kan räknas tillbaka.
  const evPct = x.ev != null ? x.ev : x.p * x.odds - 1;
  const req = x.minOdds && x.p ? x.minOdds * x.p - 1 : null;
  const pctTxt = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(Math.round(v * 1000) / 10).toLocaleString("sv-SE")} %`;
  const parts = [`EV ${pctTxt(evPct)}`];
  if (req != null) parts.push(`krav ${pctTxt(req)}`);
  if (x.p != null) parts.push(`chans ${pc(x.p)}`);
  if (rr?.breakEven != null) parts.push(`krävs ${pc(rr.breakEven)}`);
  return parts.join(" · ");
}

/** Utfallsnamn i normal skrift: "OVER 2.5" -> "Över 2.5". */
const pickName = (p) => String(p ?? "").replace(/^OVER/i, "Över").replace(/^UNDER/i, "Under");

const PICK_LABEL = { home: "1", draw: "X", away: "2", over25: "Över 2.5", under25: "Under 2.5" };
const KEY_1X2 = { 1: "home", X: "draw", 2: "away" };
const mktLabel = (k) => (k.length > 4 ? PICK_LABEL[k] : `1X2 · ${PICK_LABEL[k]}`);

/** BTTS-chans för JA/NEJ (samma som BTTS-raden). */
function bttsP(tip, pick) {
  const pYes = tip.pro?.blended?.btts ?? tip.tips?.BTTS?.pYes;
  if (pYes == null) return null;
  return pick === "JA" ? pYes : 1 - pYes;
}

/**
 * Kortets främsta tips: ett utfall med Värde (högst EV) om något har det, annars den tippade marknaden
 * (1X2, BTTS, Ö/U) med högst chans. Bara presentation av befintliga omdömen.
 */
function primaryOf(tip) {
  const t = tip.tips || {};
  const v = tip.pro?.verdicts || {};
  const vals = Object.entries(v).filter(([, x]) => x?.value).sort((a, b) => (b[1].ev ?? 0) - (a[1].ev ?? 0));
  if (vals.length) {
    const [k, x] = vals[0];
    const p = k.length > 4 ? ouP(tip, k) : t["1X2"]?.probs?.[k];
    return { label: mktLabel(k), p: p ?? x.p, verdict: "yes", odds: x.odds, from: x.minOdds };
  }
  const cands = [];
  if (t["1X2"]?.pick && KEY_1X2[t["1X2"].pick]) cands.push({ label: `1X2 · ${t["1X2"].pick}`, p: t["1X2"].confidence, key: KEY_1X2[t["1X2"].pick] });
  if (t.BTTS?.pick) cands.push({ label: `BTTS ${t.BTTS.pick}`, p: t.BTTS.confidence, modelP: bttsP(tip, t.BTTS.pick) });
  if (t.OU25?.pick) {
    const k = /OVER/i.test(t.OU25.pick) ? "over25" : "under25";
    cands.push({ label: PICK_LABEL[k], p: t.OU25.confidence, key: k, modelP: ouP(tip, k) });
  }
  const best = cands.filter((c) => c.p != null).sort((a, b) => b.p - a.p)[0];
  if (!best) return null;
  const x = best.key ? v[best.key] : null;
  if (x && x.value != null) return { label: best.label, p: best.p, verdict: "no", odds: x.odds, from: x.minOdds };
  const mp = best.modelP;
  return { label: best.label, p: best.p, verdict: "none", from: mp > 0 ? modelMin(mp) : null };
}

/** Omdömesbadge: Värde grön, Ej värde grå, alltid med "från X" när det finns. */
function verdictBadge(pr) {
  if (!pr) return "";
  const from = pr.from ? ` · från ${escapeHtml(fmtOdd(pr.from))}` : "";
  if (pr.verdict === "yes") return `<span class="val-badge val-yes">Värde${from}</span>`;
  if (pr.verdict === "no") return `<span class="val-badge val-no">Ej värde${from}</span>`;
  return `<span class="val-badge val-none">Inga odds${pr.from ? ` · spela från ${escapeHtml(fmtOdd(pr.from))}` : ""}</span>`;
}

const hasValue = (tip) => Object.values(tip.pro?.verdicts || {}).some((x) => x?.value);

/** Detaljer per kort: EV, krav, chans mot krävs och facit för varje marknad. */
function detailsHtml(tip) {
  const t = tip.tips || {};
  const v = tip.pro?.verdicts || {};
  const items = [];
  const seen = new Set();
  const add = (k) => {
    const x = v[k];
    if (!x || x.value == null || seen.has(k)) return;
    seen.add(k);
    items.push(`<li><b>${escapeHtml(mktLabel(k))} @ ${escapeHtml(fmtOdd(x.odds))}</b> – ${x.value ? "Värde" : "Ej värde"}, från ${escapeHtml(fmtOdd(x.minOdds))} · ${escapeHtml(rrText(x))}${x.fairSource ? ` · facit: ${escapeHtml(x.fairSource)}` : ""}${x.reason ? ` · ${escapeHtml(x.reason)}` : ""}</li>`);
  };
  if (KEY_1X2[t["1X2"]?.pick]) add(KEY_1X2[t["1X2"].pick]);
  for (const [k, x] of Object.entries(v)) if (x?.value) add(k);
  const ouK = /OVER/i.test(t.OU25?.pick || "") ? "over25" : /UNDER/i.test(t.OU25?.pick || "") ? "under25" : null;
  if (ouK) add(ouK);
  const model = (label, p) => {
    if (!(p > 0)) return;
    items.push(`<li><b>${escapeHtml(label)}</b> – inga odds, spela från ${modelMin(p)} · chans ${Math.round(p * 100)} % · fair ${Math.round((1 / p) * 100) / 100} · facit: bara modell (+8 % marginal)</li>`);
  };
  if (t.BTTS?.pick) model(`BTTS ${t.BTTS.pick}`, bttsP(tip, t.BTTS.pick));
  if (ouK && !(v[ouK] && v[ouK].value != null)) model(PICK_LABEL[ouK], ouP(tip, ouK));
  if (!items.length) return "";
  return `<details class="tip-details"><summary>Detaljer</summary><ul>${items.join("")}</ul>
    <p class="tip-details-note">EV = förväntat värde per spel. Krav = marginalen som krävs för Värde. Chans/krävs = facits chans mot den chans oddset kräver. Kortets snittchans: ${fmtChance(tip.tipScore)}.</p></details>`;
}

// Domarsvit (minst 5 raka segrar/förluster för ett lag med matchens domare): tydlig ruta, annars en kort domarrad
const refRec = (s) => `${s.record.w}-${s.record.d}-${s.record.l}`;
const refLast = (s) => (s.last || []).map((m) => `${m.date} ${m.home ? "hemma" : "borta"} mot ${m.opp} ${m.score}`).join("\n");
function refereeBox(r, home, away) {
  if (!r?.referee) return "";
  const sides = [[r.home, home], [r.away, away]];
  if (!r.flagged) {
    const rec = sides.filter(([s]) => s?.matches).map(([s, name]) => `${escapeHtml(name)} ${refRec(s)}`).join(" · ");
    return `<div class="ref-line">Domare: <b>${escapeHtml(r.referee)}</b>${rec ? ` <small>· med domaren (V-O-F): ${rec}</small>` : ""}</div>`;
  }
  const flagged = sides.filter(([s]) => s?.flag);
  const kind = flagged.every(([s]) => s.flag === "wins") ? "win" : flagged.every(([s]) => s.flag === "losses") ? "loss" : "mixed";
  const rows = flagged.map(([s, name]) => `<li class="${s.flag === "wins" ? "win" : "loss"}" title="${escapeHtml(refLast(s))}"><b>${escapeHtml(name)}</b>: ${s.streak.n} ${s.flag === "wins" ? "raka segrar" : "raka förluster"} med domaren <small>(${refRec(s)} på ${s.matches} ligamatcher)</small></li>`).join("");
  return `<div class="ref-alert ${kind}" role="note"><span class="ref-alert-k">⚑ Domarsvit</span> <b>${escapeHtml(r.referee)}</b> dömer<ul>${rows}</ul></div>`;
}
function refereeBadge(r) {
  if (!r?.flagged) return "";
  const kinds = [r.home?.flag, r.away?.flag].filter(Boolean);
  const kind = kinds.every((k) => k === "wins") ? "win" : kinds.every((k) => k === "losses") ? "loss" : "mixed";
  return `<span class="ref-badge ${kind}" title="Domarsvit: ${escapeHtml(r.referee)}">⚑ domare</span>`;
}

function tipCard(tip, i) {
  const t = tip.tips || {};
  const od = oddsCells(tip);
  const style = `animation-delay:${Math.min(i * 0.04, 0.4)}s`;
  const leagueShort = tip.league || "";
  const leagueFull = leagueName(tip.league);
  // Bara riktiga omgångar ("Matchday 24" -> "Omg 24"); id-strängar som "2026-27-german-2-bundesliga" visas inte
  const roundRaw = String(tip.round || "");
  const roundShort = !roundRaw || /^\d{4}(-\d{2})?-[a-z]/i.test(roundRaw)
    ? ""
    : /^[a-z]+(-[a-z]+)+$/.test(roundRaw)
      ? roundRaw.split("-").map(capFirst).join(" ") // "torneo-clausura" -> "Torneo Clausura"
      : roundRaw.replace(/^Matchday\s+/i, "Omg ");

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
  const pr = primaryOf(tip);
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
    <article class="tip${pr?.verdict === "yes" ? " has-value" : ""}${tip.referee?.flagged ? " ref-flagged" : ""}" style="${style}" data-tip-id="${escapeHtml(tipId(tip))}">
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
        <div class="score-box" title="Kortets främsta tips: marknaden med Värde om någon har det, annars den med högst chans. Snitt över marknaderna: ${fmtChance(tip.tipScore)}">
          ${pr ? `<div class="n">${fmtChance(pr.p)}</div><div class="l">${escapeHtml(pr.label)}</div>${verdictBadge(pr)}` : `<div class="n">${fmtChance(tip.tipScore)}</div><div class="l">snitt chans</div>`}
        </div>
      </header>
      ${refereeBox(tip.referee, tip.home, tip.away)}
      <div class="team-panel" hidden></div>

      <table class="tip-table">
        <colgroup><col class="c-mkt" /><col class="c-odds" /><col class="c-num" /><col class="c-val" /></colgroup>
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
              "1X2",
              ["home", "draw", "away"].filter((k) => tip.pro?.verdicts?.[k]?.value)
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
              "OU25",
              [["over", "over25"], ["under", "under25"]].filter(([, k]) => tip.pro?.verdicts?.[k]?.value).map(([key]) => key)
            )}</td>
            <td class="num">${fmtChance(confO)}</td>
            ${ouCell(tip, ouKey === "over" ? "over25" : "under25")}
          </tr>
          ${cornersRow}
        </tbody>
      </table>
      ${od.book ? `<div class="odds-src">Odds: ${escapeHtml(od.book)}</div>` : ""}
      ${noteLines(tip)}
      ${detailsHtml(tip)}
      <div class="tip-analyze">
        <div class="tip-actions">
          <button type="button" class="btn-analyze" aria-expanded="false"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}">Analys</button>
          <button type="button" class="btn-lineup"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}"
            title="Hämta startelva för just den här matchen (Fotmob/ESPN)">Hämta elva</button>
          <button type="button" class="btn-matchup" aria-expanded="false"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}"
            title="Spelare mot spelare: ytter mot ytterback, anfall mot försvar, mittfält och målvakt">Duellanalys</button>
          ${REF_LEAGUES.has(tip.league) ? `<button type="button" class="btn-referee" aria-expanded="false"
            data-league="${escapeHtml(tip.league || "")}" data-date="${escapeHtml(tip.date || "")}"
            data-home="${escapeHtml(tip.home || "")}" data-away="${escapeHtml(tip.away || "")}"
            title="Domaren: gula och frisparkar mot ligasnittet, lagens facit mot domaren och alla ligans domare">Domare</button>` : ""}
          ${startelvaButton([tip.league, tip.date, tip.home, tip.away].join("|"))}
        </div>
        ${startelvaPanel([tip.league, tip.date, tip.home, tip.away].join("|"))}
        <div class="matchup" hidden></div>
        <div class="refpanel" hidden></div>
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
  return `<h3 class="tip-group-head">${escapeHtml(title)}<span class="count"> · ${count} ${count === 1 ? "match" : "matcher"}</span></h3>`;
}

/** En rad per match i Alla kandidater: tid, match, liga, främsta tips, odds, chans, omdöme. Klick fäller ut hela kortet. */
function candRow(tip) {
  tipIndex.set(tipId(tip), tip);
  const pr = primaryOf(tip);
  const odds = pr?.odds ? `<span class="cr-odds">@ ${escapeHtml(fmtOdd(pr.odds))}</span>` : "";
  return `<details class="cand-row" data-tip-id="${escapeHtml(tipId(tip))}">
    <summary>
      <time class="cr-time" data-league="${escapeHtml(tip.league || "")}">${escapeHtml(fmtKick(tip))}</time>
      <span class="cr-match">${escapeHtml(tip.home && tip.away ? `${tip.home} – ${tip.away}` : tip.match || "")}${refereeBadge(tip.referee)}</span>
      <span class="cr-league" title="${escapeHtml(leagueName(tip.league))}">${escapeHtml(tip.league || "")}</span>
      <span class="cr-tip">${escapeHtml(pr?.label || "—")} ${odds}</span>
      <span class="cr-chance">${pr ? fmtChance(pr.p) : "—"}</span>
      <span class="cr-verdict">${verdictBadge(pr)}</span>
    </summary>
    <div class="cand-body"></div>
  </details>`;
}

function renderList(el, list, emptyMsg, { top = false, limit = Infinity, compact = false } = {}) {
  const all = byLeague(list);
  const filtered = all.length > limit ? [...all].sort((a, b) => kickMs(a) - kickMs(b)).slice(0, limit) : all;
  if (!filtered.length) {
    el.innerHTML = `<div class="empty">${escapeHtml(emptyMsg)}</div>`;
    return;
  }
  let i = 0;
  const card = compact ? (t) => candRow(t) : (t) => tipCard(t, i++);
  let html = "";
  let rest = filtered;
  if (top) {
    const { day, top: best } = topOfDay(filtered);
    if (best.length) {
      const today = new Date().toLocaleDateString("sv-SE");
      const d = new Date(`${day}T12:00:00`).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "short" }).replace(/\.$/, "");
      const dayTxt = day === today ? `Idag, ${d}` : d.charAt(0).toUpperCase() + d.slice(1);
      html += groupHead(`${dayTxt} · dagens bästa`, best.length) + best.map(card).join("");
      rest = filtered.filter((t) => !best.includes(t));
    }
  }
  for (const [lg, tips] of groupByLeague(rest)) {
    html += groupHead(leagueName(lg), tips.length) + tips.map(card).join("");
  }
  if (all.length > filtered.length) {
    html += `<button type="button" class="btn-ghost btn-more" data-more>Visa fler (${filtered.length} av ${all.length})</button>`;
  }
  el.innerHTML = html;
}

// Alla kandidater kan vara flera hundra kort: renderas först när listan fälls ut, i omgångar
const CAND_STEP = 30;
let candLimit = CAND_STEP;

function renderCandidates() {
  const n = byLeague(state.allCandidates).length;
  $("#cand-count").textContent = n ? `${n} st` : "";
  if (!$("#cand-wrap").open) {
    $("#candidates").innerHTML = "";
    return;
  }
  const selName = leagueName(state.league);
  renderList(
    $("#candidates"),
    state.allCandidates,
    state.allCandidates.length ? `Inga kandidater i ${selName}.` : "Inga kommande kandidater.",
    { limit: candLimit, compact: true }
  );
}

let valueOnly = false;
try {
  valueOnly = localStorage.getItem("betting.valueOnly") === "1";
} catch {
  /* privat läge */
}

function syncValueFilter() {
  const inLeague = byLeague(state.bestUpcoming);
  $("#vf-all").textContent = inLeague.length;
  $("#vf-value").textContent = inLeague.filter(hasValue).length;
  document.querySelectorAll("#value-filter .vf-btn").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.vf === "value") === valueOnly)));
}

$("#value-filter").addEventListener("click", (e) => {
  const b = e.target.closest(".vf-btn");
  if (!b) return;
  valueOnly = b.dataset.vf === "value";
  try {
    localStorage.setItem("betting.valueOnly", valueOnly ? "1" : "0");
  } catch {
    /* privat läge */
  }
  renderTips();
});

function renderTips() {
  const selName = leagueName(state.league);
  syncValueFilter();
  const best = valueOnly ? state.bestUpcoming.filter(hasValue) : state.bestUpcoming;
  renderList(
    $("#tips"),
    best,
    valueOnly && state.bestUpcoming.length
      ? `Inga tips med Värde i ${selName} just nu – välj Alla för att se alla tips.`
      : state.bestUpcoming.length
        ? `Inga tips i ${selName} just nu.`
        : "Inga kommande tips. Tryck på Hämta data.",
    { top: true }
  );
  candLimit = CAND_STEP;
  renderCandidates();
}

$("#cand-wrap").addEventListener("toggle", (e) => {
  if (e.target === $("#cand-wrap")) renderCandidates();
});
// Kandidatrad fälls ut: rendera hela kortet först då
$("#candidates").addEventListener("toggle", (e) => {
  const row = e.target.closest?.(".cand-row");
  if (!row || e.target !== row || !row.open) return;
  const body = row.querySelector(".cand-body");
  const tip = tipIndex.get(row.dataset.tipId);
  if (body && tip && !body.dataset.loaded) {
    body.innerHTML = tipCard(tip, 0);
    body.dataset.loaded = "1";
  }
}, true);

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

// Träffsäkerhetskorten är hopfällda bakom en rad; utfällt läge sparas per webbläsare
let accOpen = false;
try {
  accOpen = localStorage.getItem("betting.accOpen") === "1";
} catch {
  /* privat läge */
}
const pctSv = (rate) => (rate == null || rate === "" ? "—" : `${(Number(rate) * 100).toFixed(1).replace(".", ",")} %`);

function syncAccOpen() {
  const btn = $("#acc-summary");
  btn.setAttribute("aria-expanded", String(accOpen));
  btn.classList.toggle("is-open", accOpen);
  $("#accuracy").hidden = !accOpen || !$("#accuracy").children.length;
  if (!accOpen) closeAccDetail();
}

$("#acc-summary").addEventListener("click", () => {
  accOpen = !accOpen;
  try {
    localStorage.setItem("betting.accOpen", accOpen ? "1" : "0");
  } catch {
    /* privat läge */
  }
  syncAccOpen();
});

function renderAccuracy(acc) {
  const box = $("#accuracy");
  const sum = $("#acc-summary");
  if (!acc) {
    box.innerHTML = "";
    sum.hidden = true;
    closeAccDetail();
    syncAccOpen();
    return;
  }
  sum.hidden = false;
  sum.innerHTML = `<span class="acc-sum-k">Träffsäkerhet</span>${[["1X2", acc["1X2"]], ["BTTS", acc.BTTS], ["Ö/U", acc.OU25]]
    .map(([l, a]) => `<span class="acc-sum-i"><span class="acc-sum-l">${l}</span> <b>${pctSv(a?.rate)}</b></span>`)
    .join("")}<span class="acc-sum-chev" aria-hidden="true">›</span>`;
  sum.title = accOpen ? "Dölj träffsäkerheten" : "Visa träffsäkerheten per marknad och chansband";
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

  syncAccOpen();
  if (state.openMarket && accOpen) {
    const row = rows.find(([, key]) => key === state.openMarket);
    if (row) showAccDetail(row[0], row[1]);
    else closeAccDetail();
  }
}

$("#help-chans-btn").addEventListener("click", () => {
  const box = $("#help-chans");
  box.hidden = !box.hidden;
  $("#help-chans-btn").setAttribute("aria-expanded", String(!box.hidden));
});

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
  // Scrolla raden (inte sidan) så att det aktiva valet syns
  for (const row of [$("#league-filters"), $("#league-sub")]) {
    const act = row?.querySelector(".filter-pill.active");
    if (!act || row.scrollWidth <= row.clientWidth) continue;
    const l = act.offsetLeft - row.offsetLeft, r = l + act.offsetWidth;
    if (l < row.scrollLeft + 24) row.scrollLeft = Math.max(0, l - 24);
    else if (r > row.scrollLeft + row.clientWidth - 24) row.scrollLeft = r - row.clientWidth + 24;
  }
  syncFilterFade();
}

/** Fade i kanterna på ligaraden när det finns mer att scrolla åt det hållet. */
function syncFilterFade() {
  const row = $("#league-filters");
  if (!row) return;
  const more = row.scrollWidth - row.clientWidth;
  row.classList.toggle("fade-r", more > 2 && row.scrollLeft < more - 2);
  row.classList.toggle("fade-l", row.scrollLeft > 2);
}
$("#league-filters").addEventListener("scroll", syncFilterFade, { passive: true });
window.addEventListener("resize", syncFilterFade);

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
  if (mc) mc.textContent = `${byLeague(state.bestUpcoming).length} tips`;
}

/** Statusraden: "Uppdaterad 28 sep 22:23 · 38 tips · Startelvor 0/56 klara". Äldre än 24 h = bärnsten. */
function renderStatus(data) {
  const up = $("#updated-at");
  const d = new Date(data.updatedAt || "");
  if (Number.isNaN(d.getTime())) {
    up.textContent = "Uppdaterad –";
  } else {
    const when = d.toLocaleString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(/\./g, "");
    const ageH = (Date.now() - d.getTime()) / 36e5;
    const days = Math.floor(ageH / 24);
    const ago = ageH < 24 ? "" : ` <span class="lbl-long">(${days === 1 ? "1 dag" : `${days} dagar`} sedan)</span><span class="lbl-short">(${days} d sedan)</span>`;
    up.innerHTML = `<span class="lbl-long">Uppdaterad</span><span class="lbl-short">Uppd.</span> ${escapeHtml(when)}${ago}`;
    up.classList.toggle("is-stale", ageH >= 24);
    up.title = ageH >= 24 ? "Datan är mer än ett dygn gammal – tryck Hämta data" : "";
  }
  $("#match-count").textContent = `${byLeague(state.bestUpcoming).length} tips`;
  const lu = data.sources?.lineups;
  $("#lineup-meta").innerHTML = `<span class="lbl-long">Startelvor</span><span class="lbl-short">Elvor</span> ${lu ? `${lu.confirmed}/${lu.fixtures ?? lu.confirmed + lu.pending}<span class="lbl-long"> klara</span>` : "–"}`;
  $("#status-msg").textContent = data.message || data.status || "";
  $("#status-bar").title = data.message || "";
}

const SKELETONS = `${'<div class="tip-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>'.repeat(3)}<p class="sr-only">Hämtar tips…</p>`;

/** Skelettkort och "Hämtar tips…" medan /api/dashboard laddas. */
function showLoading() {
  $("#tips").setAttribute("aria-busy", "true");
  $("#tips").innerHTML = SKELETONS;
  $("#status-bar").classList.add("is-loading");
  $("#status-bar").classList.remove("is-error");
}

function showLoadError(e) {
  $("#tips").setAttribute("aria-busy", "false");
  $("#tips").innerHTML = `<div class="load-error" role="alert"><span>Kunde inte hämta tipsen: ${escapeHtml(e?.message || e)}</span><button type="button" class="btn-ghost" data-retry>Försök igen</button></div>`;
  const bar = $("#status-bar");
  bar.classList.remove("is-loading");
  bar.classList.add("is-error");
  bar.querySelector(".status-loading").textContent = "Kunde inte hämta tips";
}

$("#tips").addEventListener("click", (e) => {
  if (!e.target.closest("[data-retry]")) return;
  $("#status-bar .status-loading").textContent = "Hämtar tips…";
  showLoading();
  loadDashboard().catch(showLoadError);
});

async function loadDashboard() {
  const res = await fetch("/api/dashboard", { cache: "no-store" });
  if (!res.ok) throw new Error(`servern svarade ${res.status}`);
  const data = await res.json();
  $("#status-bar").classList.remove("is-loading", "is-error");
  $("#tips").setAttribute("aria-busy", "false");

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

  renderStatus(data);

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
  btn.textContent = open ? "Analys" : "Dölj analys";
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
    // Duellanalysen byter till den officiella elvan: ladda om om den är öppen, annars vid nästa klick
    const mxBtn = wrap?.querySelector(".btn-matchup");
    const mxBox = wrap?.querySelector(".matchup");
    if (mxBox) delete mxBox.dataset.loaded;
    if (mxBtn && mxBox && !mxBox.hidden) toggleMatchup(mxBtn, { reload: true });
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

// ---------- Duellanalys (GET /api/matchup, scripts/lib/matchup.mjs) ----------

const pctShort = (p) => (p == null ? "—" : `${Math.round(Number(p) * 100)} %`);

function mxPlayer(p) {
  if (!p) return "—";
  const bits = [p.goals != null && p.minutes ? `${p.goals}+${p.assists ?? 0}` : "", p.rating ? Number(p.rating).toFixed(2).replace(".", ",") : ""].filter(Boolean).join(" · ");
  const flag = p.notInData ? ' <span class="mx-flag" title="Spelaren saknas i spelardatan">?</span>' : "";
  return `<span class="mx-name">${escapeHtml(p.name)}</span>${flag}${bits ? ` <span class="mx-sub">${escapeHtml(bits)}</span>` : ""}`;
}

/** Elvan i led: målvakt, backlinje (V → H), mittfält, kanter och anfall. */
function mxLineup(name, side, t, tableRow, tableSize) {
  const r = t.roles;
  const byName = new Map(t.xi.map((p) => [p.name, p]));
  const row = (label, names) => (names.length ? `<div class="mx-line"><span class="mx-k">${label}</span><span class="mx-v">${names.map((n) => mxPlayer(byName.get(n) || { name: n })).join("<br>")}</span></div>` : "");
  const back = [r.lb, ...r.cbs, r.rb].filter((x, i, a) => x && a.indexOf(x) === i);
  const front = [r.lw, r.rw].filter((x) => x && !back.includes(x));
  const used = new Set([r.gk, ...back, ...r.mid, ...front, ...r.attack]);
  const rest = t.xi.map((p) => p.name).filter((n) => !used.has(n));
  const tbl = tableRow ? `${tableRow.rank}:a${tableSize ? ` av ${tableSize}` : ""} · ${tableRow.pts} p · ${escapeHtml(tableRow.goals)}` : "";
  const out = t.out?.length ? `<div class="mx-note">Borta: ${t.out.map((o) => `${escapeHtml(o.name)} – ${escapeHtml(o.why)}`).join("; ")}</div>` : "";
  const notes = (t.notes || []).map((n) => `<div class="mx-note mx-warn">${escapeHtml(n)}</div>`).join("");
  const unknown = t.unknown?.length ? `<div class="mx-note">Saknas i spelardatan: ${t.unknown.map(escapeHtml).join(", ")}</div>` : "";
  const bench = t.bench?.length ? `<div class="mx-note">Närmast in: ${t.bench.map(escapeHtml).join(", ")}</div>` : "";
  return `<div class="mx-team mx-${side}">
      <div class="mx-team-head"><b>${escapeHtml(name)}</b> <span class="mx-sub">${escapeHtml(t.formation || "")}</span>${tbl ? `<span class="mx-table">${tbl}</span>` : ""}</div>
      ${row("Mål", [r.gk].filter(Boolean))}
      ${row("Försvar", back)}
      ${row("Mittfält", [...r.mid, ...rest])}
      ${row("Kanter", front)}
      ${row("Anfall", r.attack)}
      ${out}${notes}${unknown}${bench}
    </div>`;
}

function mxDuelRow(d, m) {
  if (!d) return "";
  const cls = d.edge.who == null ? "mx-even" : d.edge.who === m.home ? "mx-home" : "mx-away";
  const who = d.edge.who == null ? d.edge.text : d.edge.text.replace(d.edge.who, d.edge.who === m.home ? m.names.home : m.names.away);
  const sc = d.attack.score != null && d.defend.score != null ? `<span class="mx-score">${d.attack.score}–${d.defend.score}</span>` : "";
  return `<tr>
      <td class="mx-duel"><div>${escapeHtml(d.title)}</div>${d.why.length ? `<ul class="mx-why">${d.why.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : ""}</td>
      <td class="mx-edge"><span class="mx-badge ${cls}">${escapeHtml(who)}</span>${sc}</td>
    </tr>`;
}

function mxSection(title, rows, m) {
  const list = rows.filter(Boolean);
  if (!list.length) return "";
  return `<div class="agent-box agent-wide"><h4>${escapeHtml(title)}</h4>
    <table class="mx-table-duels"><tbody>${list.map((d) => mxDuelRow(d, m)).join("")}</tbody></table></div>`;
}

function matchupHtml(m) {
  if (!m.ok) return `<p class="scan-empty">${escapeHtml(m.reason || "Ingen duellanalys för matchen")}</p>`;
  const H = m.names.home, A = m.names.away;
  const official = m.teams.home.status === "officiell" && m.teams.away.status === "officiell";
  const xiTxt = official ? "Officiella elvor" : m.teams.home.status === "officiell" || m.teams.away.status === "officiell" ? "Elvor: en officiell, en förväntad" : "Förväntade elvor";
  const v = m.verdict;
  const pickTeam = v.pick === "1" ? H : v.pick === "2" ? A : "oavgjort";
  const val = v.value
    ? `${escapeHtml(v.pick)} @ ${escapeHtml(fmtOdd(v.value.odds))}${v.value.bookmaker ? ` (${escapeHtml(v.value.bookmaker)})` : ""} – ${v.value.value ? '<span class="val-badge val-yes">Värde</span>' : `<span class="val-badge val-no">Ej värde</span> <span class="mx-sub">från ${escapeHtml(fmtOdd(v.value.minOdds))}</span>`}`
    : '<span class="val-badge val-none">Inga odds</span>';
  const other = v.otherValue?.length ? `<div class="mx-note">Värde i stället: ${v.otherValue.map((o) => `${escapeHtml(pickName(o.pick))} @ ${escapeHtml(fmtOdd(o.odds))}${o.minOdds ? ` (från ${escapeHtml(fmtOdd(o.minOdds))})` : ""}`).join(", ")}</div>` : "";
  const strengths = (list, name) => (list.length ? `<li><b>${escapeHtml(name)}:</b> ${list.map(escapeHtml).join(" · ")}</li>` : "");
  const edgeTxt = m.edgeTeam
    ? `Duellerna väger över till <b>${escapeHtml(m.edgeTeam === m.home ? H : A)}</b> (${m.edge > 0 ? "+" : ""}${String(m.edge).replace(".", ",")})`
    : "Duellerna väger jämnt";
  const probs = (p) => (p ? `${pctShort(p.home)} / ${pctShort(p.draw)} / ${pctShort(p.away)}` : "—");
  return `<div class="mx-wrap">
    <div class="mx-head">
      <div><b>${escapeHtml(H)} – ${escapeHtml(A)}</b> <span class="mx-sub">${escapeHtml(fmtKick(m))}</span></div>
      <div class="mx-head-r"><span class="mx-chip ${official ? "mx-chip-ok" : ""}">${escapeHtml(xiTxt)}</span>
        <button type="button" class="btn-ghost mx-print" title="Skriv ut duellanalysen">Skriv ut</button></div>
    </div>
    <div class="scan-body">
      <div class="agent-box agent-wide"><h4>${escapeHtml(xiTxt)}${official ? "" : " · minuter i de senaste 5 matcherna"}</h4>
        <div class="mx-teams">${mxLineup(H, "home", m.teams.home, m.table?.home, m.table?.size)}${mxLineup(A, "away", m.teams.away, m.table?.away, m.table?.size)}</div>
      </div>
      ${mxSection("Ytter mot ytterback", m.duels.flanks, m)}
      ${mxSection("Anfall mot försvar", m.duels.central, m)}
      ${mxSection("Mittfält mot mittfält", [m.duels.midfield], m)}
      ${mxSection("Målvakt", [m.duels.keeper], m)}
      <div class="agent-box agent-wide mx-summary"><h4>Sammanvägning och tips</h4>
        <p>${edgeTxt}.</p>
        <ul class="mx-why">${strengths(m.strengths.home, H)}${strengths(m.strengths.away, A)}</ul>
        <div class="mx-tip">
          <div><span class="mx-k">Tips</span> <b>${escapeHtml(v.pick)}</b> (${escapeHtml(pickTeam)})</div>
          <div><span class="mx-k">Resultat</span> <b>${escapeHtml(v.score || "—")}</b></div>
          <div><span class="mx-k">Båda gör mål</span> <b>${escapeHtml(v.btts)}</b> <span class="mx-sub">${pctShort(v.pBtts)}</span></div>
          <div><span class="mx-k">Mål</span> <b>${escapeHtml(v.over25)} 2,5</b> <span class="mx-sub">${pctShort(v.pOver25)}</span></div>
        </div>
        <div class="mx-note">1 / X / 2: ${probs(v.probs)} <span class="mx-sub">(modellen/marknaden före dueller: ${probs(v.baseProbs)})</span></div>
        <div class="mx-val">${val}</div>${other}
        <div class="mx-note">Duellerna justerar bara den här analysen – tipsmotorn och värdeomdömet ovan påverkas inte. Percentiler från FotMob (per 90 min, mot spelare på samma position; högre = bättre).${m.playerDataAt ? ` Spelardata ${escapeHtml(new Date(m.playerDataAt).toLocaleDateString("sv-SE"))}.` : ""}</div>
      </div>
    </div>
  </div>`;
}

async function toggleMatchup(btn, { reload = false } = {}) {
  const box = btn.closest(".tip-analyze")?.querySelector(".matchup");
  if (!box) return;
  const open = btn.getAttribute("aria-expanded") === "true";
  if (!reload) {
    btn.setAttribute("aria-expanded", String(!open));
    box.hidden = open;
    btn.textContent = open ? "Duellanalys" : "Dölj dueller";
    if (open || box.dataset.loaded) return;
  }
  box.innerHTML = `<p class="scan-empty">Ställer upp elvorna…</p>`;
  try {
    const qs = new URLSearchParams({ league: btn.dataset.league, date: btn.dataset.date, home: btn.dataset.home, away: btn.dataset.away });
    const res = await fetch(`/api/matchup?${qs}`, { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error === "Okänd API-route" ? "GUI-servern kör en äldre version – starta om den (npm run gui) och ladda om sidan." : body.error || "Duellanalysen misslyckades");
    box.innerHTML = matchupHtml(body);
    box.dataset.loaded = "1";
  } catch (e) {
    box.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  }
}

// ---------- Domarpanelen (bredvid Duellanalys): domaren mot ligasnittet och lagen + alla ligans domare ----------
const REF_LEAGUES = new Set(["PL", "CH", "EL1", "EL2"]);
const REF_TABLE_MIN = 5;
const numSv = (x, d = 1) => (x == null ? "—" : Number(x).toFixed(d).replace(".", ","));
const signSv = (x, d = 1) => (x == null ? "" : `${x > 0 ? "+" : x < 0 ? "−" : "±"}${numSv(Math.abs(x), d)}`);
const pctSign = (p) => `${p > 0 ? "+" : p < 0 ? "−" : "±"}${Math.abs(p)} %`;
const seasonSv = (since) => (since ? `${since.slice(0, 4)}/${String((Number(since.slice(2, 4)) + 1) % 100).padStart(2, "0")}` : "");
// Mer än snittet = varm färg, mindre = kall, inom ±5 % = som snittet
const cmpClass = (c) => (!c || Math.abs(c.pct) < 5 ? "even" : c.pct > 0 ? "more" : "less");

// "3,44 · ligan 3,89 · −0,45 (−12 %) mindre än snittet"
function refVsAvg(v, avg, cmp, d = 2) {
  if (v == null) return `<span class="rf-v">—</span>`;
  const word = !cmp ? "" : Math.abs(cmp.pct) < 5 ? "som snittet" : cmp.pct > 0 ? "mer än snittet" : "mindre än snittet";
  return `<span class="rf-v">${numSv(v, d)}</span><span class="rf-avg">ligan ${numSv(avg, d)}</span>${cmp ? `<span class="rf-diff ${cmpClass(cmp)}">${signSv(cmp.diff, d)} (${pctSign(cmp.pct)}) ${word}</span>` : ""}`;
}

const recTxt = (r) => (r?.matches ? `${r.w}-${r.d}-${r.l}` : "—");
const pctOf = (n, of) => (of ? `${Math.round((n / of) * 100)} %` : "—");

function refStreakTxt(s) {
  if (!s) return "—";
  const one = { W: "seger", L: "förlust", D: "oavgjord" }[s.res];
  const many = { W: "raka segrar", L: "raka förluster", D: "raka oavgjorda" }[s.res];
  return s.n === 1 ? `1 ${one}` : `${s.n} ${many}`;
}

function refTeamBox(name, s) {
  if (!s) return `<div class="rf-team"><h5>${escapeHtml(name)}</h5><p class="mx-sub">Laget finns inte i domarhistoriken.</p></div>`;
  if (!s.matches) return `<div class="rf-team"><h5>${escapeHtml(name)}</h5><p class="mx-sub">Har inte haft domaren i någon ligamatch sedan 2012/13.</p></div>`;
  const r = s.record;
  const badges = (s.last || []).slice(0, 8).map((m) => {
    const k = m.res === "W" ? "V" : m.res === "D" ? "O" : "F";
    return `<span class="r-badge ${R_CLASS[k]}" title="${escapeHtml(`${fmtDateShort(m.date)} ${m.home ? "hemma" : "borta"} mot ${m.opp} ${m.score}`)}">${k}</span>`;
  }).join("");
  const flag = s.flag ? ` <span class="ref-badge ${s.flag === "wins" ? "win" : "loss"}">⚑ ${s.streak.n} raka</span>` : "";
  return `<div class="rf-team${s.flag ? ` flag-${s.flag === "wins" ? "win" : "loss"}` : ""}"><h5>${escapeHtml(name)}${flag}</h5>
    <div class="rf-grid">
      <span class="tp-k">Matcher</span><span>${s.matches}</span>
      <span class="tp-k">V-O-F</span><span><b>${r.w}-${r.d}-${r.l}</b></span>
      <span class="tp-k">Vinner</span><span>${pctOf(r.w, s.matches)}</span>
      <span class="tp-k">Förlorar</span><span>${pctOf(r.l, s.matches)}</span>
      <span class="tp-k">Gula/match</span><span>${numSv(s.yellowPg, 2)} <small class="mx-sub">för laget</small></span>
      <span class="tp-k">Svit nu</span><span>${refStreakTxt(s.streak)}</span>
    </div>
    ${badges ? `<div class="rf-last"><span class="tp-k">Senaste, nyast först</span> ${badges}</div>` : ""}
  </div>`;
}

function refereeHtml(d) {
  const H = d.home, A = d.away, avg = d.leagueAvg || {};
  const lg = leagueName(d.league) || d.league;
  const r = d.referee;
  const period = `ligamatcher i ${escapeHtml(lg)} sedan ${seasonSv(d.since)}`;
  const head = r
    ? `<div class="mx-head"><div><span class="mx-k">Domare</span> <b class="rf-name">${escapeHtml(r.referee)}</b> <span class="mx-sub">${r.matches} matcher (${r.otherLeagues ? "alla engelska ligor, ny i ligan" : period})</span></div></div>
      <div class="rf-stats">
        <div class="rf-stat"><span class="tp-k">Gula kort per match</span>${refVsAvg(r.yellowPg, avg.yellowPg, r.yellowVsAvg, 2)}</div>
        <div class="rf-stat"><span class="tp-k">Frisparkar per match</span>${refVsAvg(r.foulsPg, avg.foulsPg, r.foulsVsAvg, 1)}</div>
        <div class="rf-stat"><span class="tp-k">Röda kort per match</span><span class="rf-v">${numSv(r.redPg, 2)}</span><span class="rf-avg">ligan ${numSv(avg.redPg, 2)}</span></div>
        <div class="rf-stat"><span class="tp-k">1 / X / 2 med domaren</span><span class="rf-v">${pctShort(r.homeWinRate)} / ${pctShort(r.drawRate)} / ${pctShort(r.awayWinRate)}</span><span class="rf-avg">ligan ${pctShort(avg.homeWinRate)} / ${pctShort(avg.drawRate)} / ${pctShort(avg.awayWinRate)}</span></div>
      </div>
      <div class="rf-teams">${refTeamBox(H, r.home)}${refTeamBox(A, r.away)}</div>`
    : `<div class="mx-head"><div><span class="mx-k">Domare</span> <b>inte tillsatt än</b> <span class="mx-sub">FotMob har domaren normalt 2–4 dagar före matchen. Tabellen visar lagens facit mot ligans alla domare.</span></div></div>
      <div class="rf-stats">
        <div class="rf-stat"><span class="tp-k">Ligasnitt gula per match</span><span class="rf-v">${numSv(avg.yellowPg, 2)}</span></div>
        <div class="rf-stat"><span class="tp-k">Ligasnitt frisparkar per match</span><span class="rf-v">${numSv(avg.foulsPg, 1)}</span></div>
      </div>`;
  const diffCell = (c) => (c ? `<span class="rf-diff ${cmpClass(c)}">${pctSign(c.pct)}</span>` : "");
  const teamCell = (x) => (x?.matches ? `<b>${recTxt(x)}</b> <small class="mx-sub">${pctOf(x.w, x.matches)} V</small>` : `<span class="mx-sub">—</span>`);
  // Färre än REF_TABLE_MIN matcher i ligan ger brusiga snitt: döljs, utom matchens domare
  const shown = (d.referees || []).filter((x) => x.matches >= REF_TABLE_MIN || (r && x.key === r.key));
  const hidden = (d.referees || []).length - shown.length;
  const rows = shown.map((x) => `<tr class="${r && x.key === r.key ? "rf-current" : ""}">
      <td>${escapeHtml(x.referee)}</td><td class="num">${x.matches}</td>
      <td class="num">${numSv(x.yellowPg, 2)} ${diffCell(x.yellowVsAvg)}</td>
      <td class="num">${numSv(x.foulsPg, 1)} ${diffCell(x.foulsVsAvg)}</td>
      <td class="num">${pctShort(x.homeWinRate)}</td>
      <td>${teamCell(x.home)}</td><td>${teamCell(x.away)}</td></tr>`).join("");
  return `<div class="rf-wrap">
    ${head}
    <details class="rf-all"${r ? "" : " open"}><summary>Alla domare i ${escapeHtml(lg)} (${shown.length}): kort, frisparkar och lagens facit</summary>
      <div class="rf-table-wrap"><table class="rf-table">
        <thead><tr><th>Domare</th><th class="num">Matcher</th><th class="num">Gula/m</th><th class="num">Frisp./m</th><th class="num">Hemmaseger</th><th>${escapeHtml(H)} V-O-F</th><th>${escapeHtml(A)} V-O-F</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="mx-sub">Inga domare med matcher i ligan</td></tr>`}</tbody>
        <tfoot><tr><td>Ligasnitt</td><td class="num">${avg.matches ?? "—"}</td><td class="num">${numSv(avg.yellowPg, 2)}</td><td class="num">${numSv(avg.foulsPg, 1)}</td><td class="num">${pctShort(avg.homeWinRate)}</td><td></td><td></td></tr></tfoot>
      </table></div>
      ${hidden ? `<p class="mx-note">${hidden} domare med färre än ${REF_TABLE_MIN} matcher i ligan visas inte (för få matcher för ett snitt).</p>` : ""}
    </details>
    <div class="mx-note">Kort och frisparkar: ${period} (football-data.co.uk). Lagens V-O-F: alla ligamatcher med domaren sedan 2012/13 (PL–League Two). Domarstatistiken påverkar inte tipset eller värdeomdömet.</div>
  </div>`;
}

async function toggleReferee(btn) {
  const box = btn.closest(".tip-analyze")?.querySelector(".refpanel");
  if (!box) return;
  const open = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!open));
  box.hidden = open;
  btn.textContent = open ? "Domare" : "Dölj domare";
  if (open || box.dataset.loaded) return;
  box.innerHTML = `<p class="scan-empty">Hämtar domarstatistik…</p>`;
  try {
    const qs = new URLSearchParams({ league: btn.dataset.league, date: btn.dataset.date, home: btn.dataset.home, away: btn.dataset.away });
    const res = await fetch(`/api/referees?${qs}`, { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error === "Okänd API-route" ? "GUI-servern kör en äldre version – starta om den (npm run gui) och ladda om sidan." : body.error || "Domarstatistiken misslyckades");
    box.innerHTML = refereeHtml(body);
    box.dataset.loaded = "1";
  } catch (e) {
    box.innerHTML = `<p class="scan-empty">${escapeHtml(e.message || e)}</p>`;
  }
}

/** Skriv ut bara den här duellanalysen. */
function printMatchup(btn) {
  const box = btn.closest(".matchup");
  if (!box) return;
  box.classList.add("print-target");
  document.body.classList.add("print-one");
  const done = () => {
    box.classList.remove("print-target");
    document.body.classList.remove("print-one");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
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
    ${facts.length ? `<ul class="tp-facts">${facts.map((f) => `<li>${f}</li>`).join("")}</ul>` : ""}
    ${keyPlayersHtml(d.keyPlayers)}`;
}

/** Nyckelspelare + truppens källa, så att det går att granska att rätt spelare ligger i laget. */
function keyPlayersHtml(k) {
  if (!k) return "";
  const sq = k.squad;
  const money = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace(".", ",")} M€` : `${Math.round(v / 1e3)} k€`);
  // FotMob ger 0/0 även när säsongsstatistik saknas: visa mål/assist bara om spelaren har betyg eller poäng
  const played = (p) => p.rating != null || p.goals || p.assists;
  const stat = (p) => [played(p) && p.goals != null ? `${p.goals} mål` : "", played(p) && p.assists != null ? `${p.assists} ass` : "", p.rating != null ? `betyg ${Number(p.rating).toFixed(2)}` : "", p.value ? money(p.value) : ""].filter(Boolean).join(" · ");
  const hasShare = k.list.some((p) => p.share != null);
  const rows = k.list.map((p) => `<tr class="${p.status === "ej i truppen" ? "kp-warn" : ""}">
      <td>${p.number ?? ""}</td><td><b>${escapeHtml(p.name)}</b></td><td>${escapeHtml(p.pos || "")}</td><td>${p.age ?? ""}</td>
      ${hasShare ? `<td>${p.share != null ? `${Math.round(p.share * 100)} %` : ""}</td>` : ""}<td>${escapeHtml(stat(p))}</td>
      <td class="kp-status">${escapeHtml(p.status || "")}</td></tr>`).join("");
  const removed = k.removed?.length
    ? `<div class="kp-note">Borttagna efter kontroll mot Transfermarkt: ${k.removed.map((r) => `${escapeHtml(r.name)} (${escapeHtml(r.club)})`).join(", ")}</div>` : "";
  return `<div class="tp-row kp"><span class="tp-k">Nyckelspelare</span>
      <span class="tp-v">${escapeHtml(k.source)}</span></div>
    ${rows ? `<div class="kp-wrap"><table class="kp-table"><thead><tr><th>#</th><th>Spelare</th><th>Pos</th><th>Ålder</th>${hasShare ? "<th>Andel</th>" : ""}<th>Säsong</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="scan-empty">Ingen spelardata för laget.</p>`}
    ${sq ? `<div class="kp-note">Trupp: ${sq.count} spelare från ${escapeHtml(sq.source)} (hämtad ${escapeHtml(sq.fetchedAt || "–")})${sq.coach ? ` · tränare ${escapeHtml(sq.coach)}` : ""}${sq.injured ? ` · ${sq.injured} skadade/osäkra` : ""}</div>` : `<div class="kp-note">Ingen trupp sparad för laget.</div>`}
    ${removed}`;
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
    const printBtn = e.target.closest(".mx-print");
    if (printBtn) {
      printMatchup(printBtn);
      return;
    }
    const refBtn = e.target.closest(".btn-referee");
    if (refBtn) {
      toggleReferee(refBtn);
      return;
    }
    const matchupBtn = e.target.closest(".btn-matchup");
    if (matchupBtn) {
      toggleMatchup(matchupBtn);
      return;
    }
    if (e.target.closest("[data-more]")) {
      candLimit += CAND_STEP;
      renderCandidates();
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

function setScanButton(state, label, short = label) {
  const btn = $("#btn-scan");
  btn.dataset.state = state;
  const el = btn.querySelector(".btn-label");
  el.innerHTML = `<span class="lbl-long">${escapeHtml(label)}</span><span class="lbl-short">${escapeHtml(short)}</span>`;
  btn.title = label;
}

/** Knappens text säger hur det går: kör, antal BET/WAIT, eller fel. */
function scanButtonFromResult(result, st) {
  if (st?.running) {
    const p = st.progress;
    const pctDone = p?.total ? Math.round((p.step / p.total) * 100) : 0;
    return setScanButton("running", `Scannar… ${pctDone}%`, `${pctDone}%`);
  }
  if (st?.ok === false) return setScanButton("error", "Scanner: fel");
  if (!result) return setScanButton("idle", "Daily Scanner", "Scanner");
  const s = result.summary || {};
  if (s.bet) return setScanButton("bet", `Scanner: ${s.bet} BET`, `Scanner ${s.bet}`);
  if (s.wait) return setScanButton("wait", `Scanner: ${s.wait} WAIT`, `Scanner ${s.wait}`);
  return setScanButton("idle", "Scanner: inga spel", "Scanner 0");
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
            ? `${escapeHtml(pickName(b.pick))} @ ${escapeHtml(fmtOdd(b.book))} <small>EV ${evTxt(b.ev)} · spela från ${escapeHtml(fmtOdd(b.minOdds))}</small>`
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
      (r) => `<tr><td>${escapeHtml(pickName(r.pick))}</td><td>${pctTxt(r.modelP)}</td><td>${pctTxt(r.marketP)}</td>
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
loadScan().catch(() => setScanButton("idle", "Daily Scanner", "Scanner"));
loadDashboard().catch(showLoadError);
