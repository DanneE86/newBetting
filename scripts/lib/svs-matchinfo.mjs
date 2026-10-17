// Tolkning av Svenska Spels matchinfo på Stryktipset/Europatipset (scripts/fetch-stryktips-svs.mjs).
// Statistik, tabell och laguppställning är Enetpulse-widgets vars data är krypterad, så de läses som
// den text sidan visar (innerText). Övrigt kommer som JSON (sportevent, odds, PlayMaker, Kambi, CMS).

const num = (s) => {
  if (s == null || s === '') return null;
  const n = Number(String(s).replace(/\s/g, '').replace('%', '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const lines = (text) => String(text || '').split('\n').map((s) => s.replace(/\t/g, ' ').trim()).filter(Boolean);
const STATUS = new Set(['FT', 'EFT', 'AET', 'AP', 'Pen', 'STR', 'Avbr', 'Avbruten', 'Uppskjuten', 'Inställd']);
// "12.10.26 21:00" -> "2026-10-12"
const isoDate = (s) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{2})/.exec(s || '');
  return m ? `20${m[3]}-${m[2]}-${m[1]}` : null;
};

/**
 * En matchrad i Enetpulse-texten: status, "Hemma 2 Borta 1", 2, 1, "Deltagare: Hemma", Hemma,
 * "Deltagare: Borta", Borta, "dd.mm.yy hh:mm", "dd.mm.yy", liga. Straffavgjorda matcher har status
 * "STR" följd av straffresultatet på två rader. Ankras på resultatraden (i). Returnerar { match, next } eller null.
 */
function matchAt(L, i) {
  if (!L[i + 3]?.startsWith('Deltagare: ') || !L[i + 5]?.startsWith('Deltagare: ')) return null;
  const hg = num(L[i + 1]), ag = num(L[i + 2]);
  const home = L[i + 3].slice(11), away = L[i + 5].slice(11);
  if (hg == null || ag == null || !L[i].startsWith(home)) return null;
  // Status och ev. straffar står före resultatraden
  let k = i - 1;
  const pens = [];
  while (k >= 0 && /^\d+$/.test(L[k]) && pens.length < 2) pens.unshift(Number(L[k--]));
  const status = k >= 0 && /^[A-ZÅÄÖ][A-Za-zÅÄÖåäö]{0,9}$/.test(L[k]) && pens.length !== 1 ? L[k] : null;
  const date = isoDate(L[i + 7]);
  const time = /\d{2}:\d{2}$/.exec(L[i + 7] || '')?.[0] || null;
  let j = i + 8;
  if (isoDate(L[j])) j++; // kort datum upprepas
  const league = L[j] && !/^Visa alla/.test(L[j]) && !matchAt(L, j + 1) && !STATUS.has(L[j]) ? L[j] : null;
  const match = { status, date, time, home, away, hg, ag, league };
  if (status && pens.length === 2) match.pens = pens;
  return { match, next: league ? j + 1 : j };
}

const resultFor = (m, team) => {
  if (m.hg == null || m.ag == null) return null;
  const isHome = m.home === team;
  const isAway = m.away === team;
  if (!isHome && !isAway) return null;
  const f = isHome ? m.hg : m.ag, a = isHome ? m.ag : m.hg;
  return f > a ? 'V' : f === a ? 'O' : 'F';
};

/**
 * Fliken Statistik: "Senast <lag>" (form) för båda lagen, "Head 2 Head" (inbördes, "2 - 1 - 2", med filter "H2H <lag>")
 * och vinstchansen ("Birmingham 4 48%", "Oavgjorda 3 27%", ...).
 * @returns {{ form: {team:string, letters:string[], matches:object[]}[], h2h: {summary:string|null, matches:object[]}|null, winProbability: object|null }}
 */
export function parseStatistik(text) {
  const L = lines(text);
  const form = [];
  let h2h = null;
  let cur = null;
  for (let i = 0; i < L.length; i++) {
    const s = /^Senast\s+(.+)$/.exec(L[i]);
    if (s) {
      cur = { team: s[1].trim(), letters: [], matches: [] };
      form.push(cur);
      for (let k = i + 1; k < L.length && /^[VOF]$/.test(L[k]); k++) cur.letters.push(L[k]);
      continue;
    }
    if (L[i] === 'Head 2 Head' || /^H2H\b/.test(L[i])) { // "H2H Newcastle" när hemma-/bortafiltret är valt
      cur = { summary: /^\d+\s*-\s*\d+\s*-\s*\d+$/.test(L[i + 1] || '') ? L[i + 1].replace(/\s+/g, '') : null, matches: [] };
      h2h = cur;
      continue;
    }
    const m = matchAt(L, i);
    if (m && cur) {
      cur.matches.push(m.match);
      i = m.next - 1;
    }
  }
  for (const f of form) for (const m of f.matches) m.result = resultFor(m, f.team);

  // Vinstchans: ": Hemmalag", Hemmalag, n, "48%", "Oavgjorda", n, "27%", ": Bortalag", Bortalag, n, "25%"
  let winProbability = null;
  const pctAt = (k) => (/^\d+%$/.test(L[k] || '') ? num(L[k]) / 100 : null);
  for (let i = 0; i < L.length - 10; i++) {
    if (!L[i].startsWith(': ') || L[i + 4] !== 'Oavgjorda') continue;
    const home = pctAt(i + 3), draw = pctAt(i + 6), away = pctAt(i + 10);
    if (home == null || draw == null || away == null || !L[i + 7]?.startsWith(': ')) continue;
    winProbability = { home, draw, away, homeTeam: L[i + 1], awayTeam: L[i + 8] };
    break;
  }
  return { form, h2h, winProbability };
}

/**
 * Fliken Tabell: rad = plats, ": Lag", Lag, M, V, O, F, +/-, P. Fotnoterna (Champions League,
 * Nedflyttning ...) sparas som legend.
 * @returns {{ rows: {pos:number, team:string, played:number, w:number, d:number, l:number, gd:number, pts:number}[], legend: string[] }}
 */
export function parseTabell(text) {
  const L = lines(text);
  const rows = [];
  let last = -1;
  for (let i = 0; i < L.length - 8; i++) {
    if (!/^\d+$/.test(L[i]) || !L[i + 1].startsWith(': ')) continue;
    const v = [L[i + 3], L[i + 4], L[i + 5], L[i + 6], L[i + 7], L[i + 8]].map(num);
    if (v.some((x) => x == null)) continue;
    const [played, w, d, l, gd, pts] = v;
    rows.push({ pos: Number(L[i]), team: L[i + 2], played, w, d, l, gd, pts });
    last = i + 8;
    i += 8;
  }
  const legend = last < 0 ? [] : L.slice(last + 1).filter((s) => s.length < 40 && !/^\d/.test(s));
  return { rows, legend };
}

/** Laget och dess grannar i tabellen (för kortet), `around` platser åt varje håll. */
export function tableAround(rows, teams, around = 2) {
  const idx = rows.map((r, i) => (teams.includes(r.team) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return [];
  const keep = new Set(idx.flatMap((i) => Array.from({ length: around * 2 + 1 }, (_, k) => i - around + k)));
  return rows.filter((_, i) => keep.has(i));
}

/** PlayMaker x-stats: { entireSeason, lastFiveGames } med metrics [{home, away, metricName}] -> { season: {xp:{home,away}, ...}, last5 } */
export function compactXStats(x) {
  if (!x || typeof x !== 'object') return null;
  const one = (part) => (part?.metrics ? Object.fromEntries(part.metrics.map((m) => [m.metricName, { home: m.home, away: m.away }])) : null);
  const season = one(x.entireSeason), last5 = one(x.lastFiveGames);
  return season || last5 ? { season, last5 } : null;
}

/** PlayMaker lagprofil (ts-<id>.json): percentiler 0–1 per mått för hemma- och bortalaget. */
export function compactTeamStyle(t) {
  const part = t?.entireSeason;
  if (!part) return null;
  const obj = (arr) => (Array.isArray(arr) ? Object.fromEntries(arr.map((m) => [m.name, m.value])) : null);
  return { home: obj(part.homeTeamMetrics), away: obj(part.awayTeamMetrics) };
}

/** Kambi betoffers -> [{ market, outcomes: [{ label, line, odds }] }] sorterade efter marknad. */
export function compactKambi(k) {
  const out = [];
  for (const b of k?.betOffers || []) {
    const outcomes = (b.outcomes || []).filter((o) => o.odds > 1000).map((o) => ({
      label: o.label, line: o.line != null ? o.line / 1000 : null, odds: Math.round(o.odds) / 1000,
    }));
    if (outcomes.length) out.push({ market: b.criterion?.label || b.betOfferType?.name || '?', outcomes });
  }
  const lineOf = (m) => m.outcomes[0]?.line ?? 0;
  return out.sort((a, b) => a.market.localeCompare(b.market, 'sv') || lineOf(a) - lineOf(b));
}

/** CMS-text (HTML) -> ren text. */
export function cleanHtml(s) {
  return String(s || '').replace(/<\/(p|blockquote|li|h\d)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, '’')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/** Nyhet ur CMS: rubrik, tid, källa och en kort ingress (hela artikeln är tredjepartstext, Everysport/TT). */
export function compactNews(r, maxLen = 400) {
  const text = cleanHtml(r.body);
  return {
    title: r.title || '',
    published: r.published || r.created || null,
    source: r.importOrigin || null,
    excerpt: text.length > maxLen ? `${text.slice(0, maxLen).replace(/\s+\S*$/, '')} …` : text,
  };
}

/** sport/2/sportevent/<id>/odds -> { ou25: {over, under}, otherDraws: [{ product, drawNumber, eventNumber, distribution:[1,X,2] }] } */
export function compactSporteventOdds(o, ownProductId) {
  const types = o?.eventTypes || [];
  const ou = types.find((t) => t.eventTypeId === 4);
  const val = (arr, key) => num(arr?.find((x) => x.outcome === key)?.value);
  const res = { ou25: null, otherDraws: [] };
  if (ou?.odds?.odds?.length) res.ou25 = { over: val(ou.odds.odds, 'TotalGoalsOver2Point5'), under: val(ou.odds.odds, 'TotalGoalsUnder2Point5') };
  for (const t of types.filter((x) => x.eventTypeId === 1)) {
    for (const d of t.draws || []) {
      if (d.productId === ownProductId) continue;
      for (const e of d.events || []) {
        const dist = ['1', 'X', '2'].map((k) => val(e.distribution, k));
        if (dist.some((x) => x != null)) res.otherDraws.push({ product: d.productName, drawNumber: d.drawNumber, eventNumber: e.eventNumber, distribution: dist });
      }
    }
  }
  return res;
}
