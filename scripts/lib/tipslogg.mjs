// Tipslogg: allt som tippas (Oddset, Stryktipset, Europatipset, Hästar) sparas per match/lopp.
//   data/tipslogg/<produkt>/<ÅÅÅÅ-MM>.json   { items: { <id>: post } }
// En post: first = tipset som det såg ut första gången (låst), latest = senaste före start, result = facit.
// Efter start ändras inget tips, bara facit fylls i. Analysen (scripts/tipslogg.mjs --analys) räknar
// träffar per produkt, marknad, liga och lag ur detta, så nya regler kan jämföras mot vad som faktiskt tippades.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LOG_DIR = path.join(root, 'data', 'tipslogg');
export const PRODUCTS = ['oddset', 'stryktipset', 'europatipset', 'hastar'];

const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
const month = (date) => String(date || '').slice(0, 7) || 'okant';

// ---------- Ren logik (testas i lib-units) ----------

// Har matchen/loppet startat? Utan avsparkstid räknas dagen efter datumet som start.
export function started(rec, now = new Date()) {
  const t = rec.kickoff ? Date.parse(rec.kickoff) : rec.date ? Date.parse(`${rec.date}T23:59:59Z`) : NaN;
  return Number.isFinite(t) && now.getTime() >= t;
}

// Lägg in eller uppdatera ett tips. first låses vid första sparningen, latest skrivs över fram till start.
export function applyTip(store, rec, now = new Date()) {
  const { tip, ...meta } = rec;
  const at = now.toISOString();
  const old = store.items[rec.id];
  if (!old) {
    if (started(rec, now)) return 'sen'; // första gången vi ser den är efter start: inget riktigt tips
    store.items[rec.id] = { ...meta, firstAt: at, first: tip, latestAt: at, latest: tip, result: null };
    return 'ny';
  }
  if (old.result || started(old, now)) return 'last';
  if (JSON.stringify(old.latest) === JSON.stringify(tip)) return 'samma';
  Object.assign(old, meta, { latestAt: at, latest: tip });
  return 'andrad';
}

export function applyResult(store, id, result, now = new Date()) {
  const rec = store.items[id];
  if (!rec || rec.result || !result) return false;
  rec.result = result;
  rec.settledAt = now.toISOString();
  return true;
}

// Ett spelbart val per rad: { market, pick, p, odds?, value?, hit }. Används av analysen.
// which = 'first' | 'latest'
export function gradeRecord(rec, which = 'first') {
  const tip = rec[which];
  const res = rec.result;
  if (!tip || !res) return [];
  const out = [];
  if (rec.product === 'oddset') {
    for (const [market, t] of Object.entries(tip.markets || {})) {
      // Kort: facit är antalet (gula + röda), linjen står i tipset
      const actual = market === 'CARDS' && Number.isFinite(res.cards) ? `${res.cards > t.line ? 'OVER' : 'UNDER'} ${t.line}` : res[market];
      if (!t?.pick || !actual || (market === 'CARDS' && !Number.isFinite(t.line))) continue;
      out.push({ market, pick: t.pick, p: t.p ?? null, odds: t.odds ?? null, value: t.value ?? null, hit: t.pick === actual });
    }
  } else if (rec.product === 'stryktipset' || rec.product === 'europatipset') {
    const o = res.outcome;
    if (!o) return [];
    const pOf = (signs) => (tip.probs ? r3([...signs].reduce((s, c) => s + (tip.probs['1X2'.indexOf(c)] || 0), 0)) : null);
    if (tip.single) out.push({ market: 'enkelrad', pick: tip.single, p: pOf(tip.single), hit: tip.single === o }); // inget spel: inga odds i resultatet
    for (const k of ['A', 'B', 'C']) {
      const s = tip.coupons?.[k];
      if (s?.signs) out.push({ market: `kupong ${k}`, pick: s.signs, type: s.type || null, p: pOf(s.signs), hit: s.signs.includes(o) });
    }
  } else if (rec.product === 'hastar') {
    const winners = res.winners || [];
    if (!winners.length || !tip.top?.length) return [];
    const top = tip.top;
    out.push({ market: 'etta', pick: String(top[0].nr), p: top[0].p, hit: winners.includes(top[0].nr) });
    const top3 = top.slice(0, 3);
    out.push({ market: 'topp 3', pick: top3.map((h) => h.nr).join(','), p: r3(top3.reduce((s, h) => s + (h.p || 0), 0)), hit: top3.some((h) => winners.includes(h.nr)) });
    if (tip.spik) out.push({ market: 'spik', pick: String(tip.spik), p: top.find((h) => h.nr === tip.spik)?.p ?? null, hit: winners.includes(tip.spik) });
  }
  return out;
}

// Plattar ut posterna till rader för analys, med filter. Lag matchas mot hemma/borta (skiftlägesokänsligt, delsträng).
export function flatten(records, { product, league, team, from, to, market, which = 'first' } = {}) {
  const lc = (s) => String(s || '').toLowerCase();
  const rows = [];
  for (const rec of records) {
    if (product && rec.product !== product) continue;
    if (league && lc(rec.league) !== lc(league) && !lc(rec.league).includes(lc(league))) continue;
    if (team && !lc(rec.home).includes(lc(team)) && !lc(rec.away).includes(lc(team))) continue;
    if (from && String(rec.date) < from) continue;
    if (to && String(rec.date) > to) continue;
    for (const g of gradeRecord(rec, which)) {
      if (market && g.market !== market) continue;
      rows.push({ ...g, product: rec.product, league: rec.league || null, home: rec.home || null, away: rec.away || null, date: rec.date, id: rec.id });
    }
  }
  return rows;
}

// Sammanställning: antal, träffar, träff%, väntad träff% (modellens p), och resultat med 500 kr flat där odds finns.
export function summarize(rows) {
  const n = rows.length;
  const hits = rows.filter((r) => r.hit).length;
  const withP = rows.filter((r) => Number.isFinite(r.p));
  const withOdds = rows.filter((r) => Number.isFinite(r.odds) && r.odds > 1);
  const profit = withOdds.reduce((s, r) => s + (r.hit ? (r.odds - 1) * 500 : -500), 0);
  return {
    n, hits,
    rate: n ? r3(hits / n) : null,
    expected: withP.length ? r3(withP.reduce((s, r) => s + r.p, 0) / withP.length) : null,
    bets: withOdds.length,
    profit: Math.round(profit),
    roi: withOdds.length ? r3(profit / (withOdds.length * 500)) : null,
  };
}

// Grupperar rader. by = 'product' | 'market' | 'league' | 'team' | 'value' | 'pband' (sannolikhetsband)
export function groupRows(rows, by) {
  const keysOf = (r) => {
    if (by === 'team') return [r.home, r.away].filter(Boolean);
    if (by === 'pband') return [Number.isFinite(r.p) ? `${Math.floor(r.p * 10) * 10}-${Math.floor(r.p * 10) * 10 + 10} %` : 'okänd'];
    if (by === 'value') return [r.value || 'utan odds'];
    return [r[by] ?? 'okänd'];
  };
  const groups = new Map();
  for (const r of rows) for (const k of keysOf(r)) { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
  return [...groups.entries()].map(([key, rs]) => ({ key, ...summarize(rs) })).sort((a, b) => b.n - a.n || String(a.key).localeCompare(String(b.key)));
}

// ---------- Byggare per produkt (från det som skripten redan räknar fram) ----------

// Oddset: en kandidat ur tips-latest.json (allCandidates). Värde/Ej värde från pro.verdicts när odds finns.
export function oddsetRecord(t) {
  const v = t.pro?.verdicts || {};
  const odds = t.pro?.odds || {};
  const side = { 1: 'home', X: 'draw', 2: 'away', 'OVER 2.5': 'over25', 'UNDER 2.5': 'under25' };
  const verdict = (key) => (v[key] ? (v[key].value ? 'Värde' : 'Ej värde') : null);
  const markets = {};
  const x = t.tips?.['1X2'];
  if (x?.pick) {
    const k = side[x.pick];
    markets['1X2'] = { pick: x.pick, p: r3(x.confidence), odds: odds[k] ?? null, value: verdict(k), probs: x.probs || null };
  }
  const ou = t.tips?.OU25;
  if (ou?.pick) {
    const k = side[ou.pick];
    markets.OU25 = { pick: ou.pick, p: r3(ou.confidence), odds: odds[k] ?? null, value: verdict(k), expGoals: ou.expGoals ?? null };
  }
  const b = t.tips?.BTTS;
  if (b?.pick) markets.BTTS = { pick: b.pick, p: r3(b.confidence) };
  const c = t.tips?.CARDS;
  if (c?.pick) markets.CARDS = { pick: c.pick, line: c.line, p: r3(c.confidence), expCards: c.expCards ?? null, referee: c.referee?.name ?? null };
  return {
    id: `${t.date}|${t.league}|${t.home}|${t.away}`,
    product: 'oddset', date: t.date, kickoff: t.kickoffUtc || null, league: t.league, home: t.home, away: t.away,
    tip: {
      markets,
      tipScore: t.tipScore ?? null,
      topTip: Boolean(t.passEdgeFilter),
      valueBets: (t.pro?.valueBets || []).map((vb) => ({ market: vb.market, pick: vb.pick, odds: vb.odds, p: vb.p })),
      lineupStatus: t.lineupStatus || null,
    },
  };
}

// Facit för Oddset ur betting-store.json (result H/D/A, btts, over25). cards = gula + röda: storens
// football-data-kort, annars cardsFallback (FotMob-raden för matchen) när den finns.
export function oddsetResult(m, cardsFallback = null) {
  if (!m || !m.result || m.hg == null) return null;
  const d = m.discipline || {};
  const own = Number.isFinite(d.homeYellow) && Number.isFinite(d.awayYellow) ? d.homeYellow + d.awayYellow + (d.homeRed || 0) + (d.awayRed || 0) : null;
  const cards = own ?? (Number.isFinite(cardsFallback) ? cardsFallback : null);
  return { '1X2': m.result === 'H' ? '1' : m.result === 'D' ? 'X' : '2', BTTS: m.btts ? 'JA' : 'NEJ', OU25: m.over25 ? 'OVER 2.5' : 'UNDER 2.5', ...(cards == null ? {} : { cards }), score: `${m.hg}-${m.ag}` };
}

// Stryktipset/Europatipset: en match ur analyzeDraw-resultatet (a.events) med kupongernas tecken
export function strykRecords(a) {
  const pickC = a.reducedC?.picks || [];
  return a.events.map((e, i) => ({
    id: `${a.product}-${a.drawNumber}-${e.eventNumber}`,
    product: a.product, draw: a.drawNumber, event: e.eventNumber,
    date: String(e.kickoff || a.regCloseTime || '').slice(0, 10), kickoff: e.kickoff || a.regCloseTime || null,
    league: e.league || null, home: e.home, away: e.away,
    tip: {
      probs: e.final || null, folk: e.folk || null, odds: e.odds || null, market: e.market || null,
      single: e.tip || null,
      coupons: {
        A: e.systemPick ? { signs: e.systemPick.signs, type: e.systemPick.type || null } : null,
        B: e.systemPickB ? { signs: e.systemPickB.signs, type: e.systemPickB.type || null } : null,
        C: pickC[i] ? { signs: pickC[i] } : null,
      },
      lineupStatus: e.lineup?.status || null,
    },
  }));
}

// Hästar: ett lopp ur analyzeGame-resultatet. top = modellens rangordning (ej strukna), spik = omgångens spikförslag.
export function hastRecords(analysis) {
  const spikeLegs = new Map(Object.values(analysis.spikes || {}).filter(Boolean).map((s) => [s.raceNr, s.nr]));
  return (analysis.races || []).map((r) => {
    const top = (r.horses || []).filter((h) => !h.scratched && Number.isFinite(h.p)).sort((x, y) => y.p - x.p)
      .slice(0, 5).map((h) => ({ nr: h.nr, horse: h.horse, p: r3(h.p), marketP: r3(h.marketP), rank: h.rank || null }));
    return {
      id: `${analysis.id}|${r.number}`,
      product: 'hastar', game: analysis.id, type: analysis.type, leg: r.leg, race: r.number,
      date: analysis.date, kickoff: r.startTime ? new Date(r.startTime).toISOString() : null,
      league: analysis.type, track: r.track || analysis.track || null, home: null, away: null,
      tip: { top, spik: spikeLegs.get(r.number) || null, favorite: r.favorite?.nr ?? null },
    };
  });
}

// ---------- Filer ----------

const fileOf = (product, m) => path.join(LOG_DIR, product, `${m}.json`);
const readStore = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return { items: {} }; } };
const writeStore = (file, s) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(s, null, 1), 'utf8'); };

// Spara tips (grupperat per månad). Returnerar räknare { ny, andrad, samma, last, sen }.
export function logTips(product, recs, now = new Date()) {
  const count = { ny: 0, andrad: 0, samma: 0, last: 0, sen: 0 };
  const byMonth = new Map();
  for (const r of recs) { const m = month(r.date); if (!byMonth.has(m)) byMonth.set(m, []); byMonth.get(m).push(r); }
  for (const [m, rs] of byMonth) {
    const file = fileOf(product, m);
    const store = readStore(file);
    let dirty = false;
    for (const r of rs) { const s = applyTip(store, r, now); count[s]++; if (s === 'ny' || s === 'andrad') dirty = true; }
    if (dirty) writeStore(file, { product, month: m, updatedAt: now.toISOString(), items: store.items });
  }
  return count;
}

// Fyll i facit: resolve(post) -> result eller null. Går igenom alla månader med obesvarade poster.
export async function settleTips(product, resolve, now = new Date()) {
  const dir = path.join(LOG_DIR, product);
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const file = path.join(dir, f);
    const store = readStore(file);
    let dirty = false;
    for (const rec of Object.values(store.items)) {
      if (rec.result || !started(rec, now)) continue;
      const res = await resolve(rec);
      if (applyResult(store, rec.id, res, now)) { n++; dirty = true; }
    }
    if (dirty) writeStore(file, { ...store, updatedAt: now.toISOString() });
  }
  return n;
}

export function readAll(products = PRODUCTS) {
  const out = [];
  for (const p of products) {
    const dir = path.join(LOG_DIR, p);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) out.push(...Object.values(readStore(path.join(dir, f)).items));
  }
  return out;
}
