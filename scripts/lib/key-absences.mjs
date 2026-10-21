// Nyckelspelare och tidig frånvaro per lag ur FotMobs spelardata per ligamatch (Opta), för alla ligor.
// Användaren 2026-10-20 (Burton–Bradford: Delap skadad, Armer och Lofthouse borta, ingen källa visade det):
// "Skador på viktiga spelare är bra att veta tidigt när man ska spela".
// Underlag: data/nyckelspelare/<LIGA>.json (kompakt, committas, scripts/fetch-nyckelspelare.mjs) + data/trupper (skador).
// Hur ofta spelaren startar nästa match per status mäts ur historiken (config/nyckelspelare-chans.json), inte gissat.
// Bara visning: spelarfrånvaro gav ingen bättre modell i backtest (pro-lagrets alpha 0), oddsen prisar in den.

export const KEY_WINDOW = 8;      // ordinarie = startat minst KEY_MIN_STARTS av lagets senaste KEY_WINDOW ligamatcher
export const KEY_MIN_STARTS = 5;
export const KEEP_PER_TEAM = 12;  // matcher per lag som sparas i data/nyckelspelare (KEY_WINDOW + marginal)
export const STALE_DAYS = 30;     // senaste ligamatchen äldre än så (uppehåll, ny säsong) -> ingen status
export const OFF_EARLY_MIN = 60;  // startade och spelade högst så här många minuter = utbytt tidigt

const DAY = 864e5;
const days = (a, b) => (Date.parse(b) - Date.parse(a)) / DAY;

/** FotMobs spelarrad (playersFromDetails / data/fotmob-matcher/<LIGA>/spelare) -> [id, lag 0/1, start 0/1, min, xG, xA, mål, assist]. */
export function compactPlayer(p) {
  const s = p.s ?? {};
  const r2 = (x) => Math.round((x ?? 0) * 100) / 100;
  return [Number(p.id), p.t, p.st ? 1 : 0, s.min ?? 0, r2(s.xg), r2(s.xa), s.g ?? 0, s.a ?? 0];
}

/** Lagmatch (data/fotmob-matcher/<LIGA>/<säsong>.json) + spelarrader -> kompakt matchpost. */
export function compactMatch(m, players) {
  return { d: m.d, h: m.hid, a: m.aid, xg: m.s?.xg ?? null, p: players.filter((p) => p.t === 0 || p.t === 1).map(compactPlayer) };
}

/** Behåll de KEEP_PER_TEAM senaste matcherna per lag (en match behålls om något av lagen behöver den). */
export function pruneStore(store, keep = KEEP_PER_TEAM) {
  const byTeam = new Map();
  for (const [id, m] of Object.entries(store.matches)) for (const t of [m.h, m.a]) (byTeam.get(t) ?? byTeam.set(t, []).get(t)).push([id, m.d]);
  const keepIds = new Set();
  for (const list of byTeam.values()) for (const [id] of list.sort((a, b) => (a[1] < b[1] ? 1 : -1)).slice(0, keep)) keepIds.add(id);
  for (const id of Object.keys(store.matches)) if (!keepIds.has(id)) delete store.matches[id];
  const used = new Set(Object.values(store.matches).flatMap((m) => m.p.map((p) => String(p[0]))));
  for (const id of Object.keys(store.names ?? {})) if (!used.has(id)) delete store.names[id];
  return store;
}

/** Lagets ligamatcher före datumet, äldst först: { id, d, side, xg, players: Map(spelar-id -> rad) }. */
export function teamMatches(store, teamId, before) {
  const out = [];
  for (const [id, m] of Object.entries(store?.matches ?? {})) {
    if (before && m.d >= before) continue;
    const side = m.h === teamId ? 0 : m.a === teamId ? 1 : null;
    if (side == null) continue;
    const players = new Map();
    for (const p of m.p) if (p[1] === side) players.set(p[0], { st: p[2], min: p[3], xg: p[4], xa: p[5], g: p[6], a: p[7] });
    out.push({ id, d: m.d, side, xg: m.xg?.[side] ?? null, players });
  }
  return out.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
}

/**
 * Status för en ordinarie spelare inför match k ur hans senaste lagmatch (k-1):
 * full (startade, 80+ min), off_early (startade, högst OFF_EARLY_MIN min), off_mid (61–79 min),
 * sub (inhoppare), missed1 (inte med i en match), missed2 (inte med i två eller fler i rad).
 * Tidigt byte som är spelarens vana (medianen i hans starter högst OFF_HABIT_MIN över) = off_habit: anfallare som
 * byts runt timmen varje match (Beesley, Bradford 2026-10-17: 67/58/57) är inte en skadevarning.
 */
export const OFF_HABIT_MIN = 15;
export function statusBefore(tm, idx, pid) {
  const last = tm[idx - 1]?.players.get(pid);
  if (last && last.min > 0) {
    if (!last.st) return 'sub';
    if (last.min <= OFF_EARLY_MIN) {
      const mins = tm.slice(Math.max(0, idx - 1 - KEY_WINDOW), idx - 1).map((m) => m.players.get(pid)).filter((r) => r?.st).map((r) => r.min).sort((a, b) => a - b);
      const median = mins.length ? mins[Math.floor(mins.length / 2)] : null;
      return median != null && median - last.min <= OFF_HABIT_MIN ? 'off_habit' : 'off_early';
    }
    return last.min >= 80 ? 'full' : 'off_mid';
  }
  const prev = tm[idx - 2]?.players.get(pid);
  return prev && prev.min > 0 ? 'missed1' : 'missed2';
}

/** Ordinarie spelare inför lagmatch idx (startat minst KEY_MIN_STARTS av KEY_WINDOW före). */
function regulars(tm, idx) {
  const win = tm.slice(Math.max(0, idx - KEY_WINDOW), idx);
  if (win.length < KEY_WINDOW) return [];
  const starts = new Map();
  for (const m of win) for (const [pid, r] of m.players) if (r.st) starts.set(pid, (starts.get(pid) ?? 0) + 1);
  return [...starts].filter(([, n]) => n >= KEY_MIN_STARTS).map(([pid, n]) => ({ pid, starts: n }));
}

/**
 * Hur ofta startar en ordinarie spelare nästa ligamatch, per status efter senaste matchen? stores = kompakta
 * ligafiler (eller hela FotMob-historiken omräknad till samma form). Bara spelare som spelar för laget igen inom
 * lagets 10 nästa matcher räknas (annars såld/utlånad, inte frånvaro).
 */
export function absenceRates(stores) {
  const acc = {};
  for (const store of stores) {
    const teams = new Set(Object.values(store.matches).flatMap((m) => [m.h, m.a]));
    for (const team of teams) {
      const tm = teamMatches(store, team);
      for (let k = KEY_WINDOW; k < tm.length; k++) {
        if (days(tm[k - 1].d, tm[k].d) > STALE_DAYS) continue;
        for (const { pid } of regulars(tm, k)) {
          if (!tm.slice(k, k + 10).some((m) => (m.players.get(pid)?.min ?? 0) > 0)) continue;
          const cat = statusBefore(tm, k, pid);
          const r = tm[k].players.get(pid);
          const a = (acc[cat] ??= { n: 0, start: 0, play: 0 });
          a.n++;
          if (r?.st) a.start++;
          if ((r?.min ?? 0) > 0) a.play++;
        }
      }
    }
  }
  return Object.fromEntries(Object.entries(acc).map(([k, a]) => [k, { n: a.n, start: Math.round((a.start / a.n) * 1000) / 1000, play: Math.round((a.play / a.n) * 1000) / 1000 }]));
}

/** Spelarens andel av lagets anfall (xG + xA) i matcherna sedan hans första match i fönstret. */
function attackShare(tm, pid) {
  const first = tm.findIndex((m) => m.players.has(pid));
  if (first < 0) return 0;
  let num = 0, den = 0;
  for (const m of tm.slice(first)) {
    const r = m.players.get(pid);
    if (r) num += r.xg + r.xa;
    if (m.xg != null) den += 2 * m.xg;
  }
  return den > 0 ? num / den : 0;
}

/**
 * Nyckelspelare med frånvarorisk inför matchen `date`. squadPlayers = data/trupper-lagets spelare (FotMob-id = samma
 * id som spelardatan): skada där (FotMob, Transfermarkt, klubben) går före. Spelare som inte finns i truppen hoppas
 * över (sålda). rates = absenceRates-utdata: en status flaggas bara när den startar klart mer sällan än en ordinarie
 * som spelade hela senaste matchen (minst FLAG_DROP lägre), och bara för viktiga spelare (minst KEY_SHARE av anfallet,
 * KEY_POINTS mål + assist eller startat KEY_CORE_STARTS av KEY_WINDOW). nextMatch = false: matchen är inte lagets nästa,
 * då gäller bara skador (speltiden i senaste matchen säger något om nästa match, inte om den efter).
 * Returnerar { lastMatch, players } eller null utan data.
 */
export const FLAG_DROP = 0.25; // 2026-10-20: utbytt 61–79 min startar 73 % (full 89 %) = taktiskt, flaggas inte
export const KEY_SHARE = 0.05;
export const KEY_POINTS = 2;
export const KEY_CORE_STARTS = 7;
export function keyAbsences({ store, teamId, date, squadPlayers = null, rates = null, nextMatch = true }) {
  const tm = teamMatches(store, teamId, date);
  if (tm.length < KEY_WINDOW) return null;
  const last = tm.at(-1);
  if (days(last.d, date) > STALE_DAYS) return null;
  const squad = squadPlayers?.length ? new Map(squadPlayers.map((p) => [Number(p.id), p])) : null;
  const base = rates?.full?.start ?? null;
  const idx = tm.length; // matchen som kommer
  const players = [];
  for (const { pid, starts } of regulars(tm, idx)) {
    const sp = squad?.get(pid);
    if (squad && !sp) continue; // inte i truppen längre
    const injury = sp?.injury ?? null;
    if (!injury && !nextMatch) continue;
    const status = injury ? 'injured' : statusBefore(tm, idx, pid);
    const pStart = injury ? null : rates?.[status]?.start ?? null;
    const flagged = injury != null || (pStart != null && base != null && pStart <= base - FLAG_DROP);
    if (!flagged) continue;
    const season = tm.filter((m) => m.players.has(pid));
    const share = attackShare(tm, pid);
    const goals = season.reduce((s, m) => s + m.players.get(pid).g, 0);
    const assists = season.reduce((s, m) => s + m.players.get(pid).a, 0);
    if (!injury && share < KEY_SHARE && goals + assists < KEY_POINTS && starts < KEY_CORE_STARTS) continue;
    const lr = last.players.get(pid);
    players.push({
      id: pid, name: sp?.name ?? store.names?.[pid] ?? null, starts, of: KEY_WINDOW, status, pStart,
      share: Math.round(share * 1000) / 1000, goals, assists,
      lastMin: lr?.min ?? 0,
      injury: injury ? { name: injury.name ?? null, expectedReturn: injury.expectedReturn ?? null, source: injury.source ?? 'FotMob' } : null,
    });
  }
  players.sort((a, b) => b.share - a.share || b.starts - a.starts);
  return { lastMatch: last.d, base, players };
}

const pct = (x) => `${Math.round(x * 100)} %`;
// FotMob: "Doubtful" = kan spela, "Unknown" = okänt, annars tidpunkt ("Mid November 2026")
const injuryReturn = (r) => (!r || /^unknown$/i.test(r) ? '' : /doubt/i.test(r) ? ', osäker' : `, åter ${r}`);
/** Klartext per spelare för /tips: "Finn Delap (3 mål, 19 % av anfallet) utbytt efter 60 min senast – startar nästa i 55 % av fallen". */
export function keyNote(team, p) {
  const stats = [p.goals ? `${p.goals} mål` : null, p.assists ? `${p.assists} assist` : null, p.share >= 0.05 ? `${pct(p.share)} av anfallet` : null].filter(Boolean);
  const who = `${p.name ?? 'okänd'}${stats.length ? ` (${stats.join(', ')})` : ` (startat ${p.starts} av ${p.of})`}`;
  const what = {
    injured: () => `skadad${p.injury?.name ? `: ${p.injury.name}` : ''}${injuryReturn(p.injury?.expectedReturn)} (${p.injury?.source ?? 'FotMob'})`,
    off_early: () => `utbytt efter ${p.lastMin} min senast`,
    off_mid: () => `utbytt efter ${p.lastMin} min senast`,
    off_habit: () => `utbytt efter ${p.lastMin} min senast (som vanligt)`,
    sub: () => 'bara inhoppare senast',
    missed1: () => 'missade senaste ligamatchen',
    missed2: () => 'har missat två ligamatcher i rad eller fler',
  }[p.status]?.() ?? p.status;
  return `${team}: ${who} ${what}${p.pStart != null ? ` – startar nästa i ${pct(p.pStart)} av fallen` : ''}`;
}

/**
 * Sätter t.keyAbsences ({ lastMatch, home, away } per lag) och t.keyNotes (klartext, högst maxPerTeam per lag) på
 * tipsen. stores[liga] = data/nyckelspelare-filen, squads[liga] = data/trupper-lagen (vårt lagnamn -> fotmobId,
 * players). Spelare som redan står i availabilityNotes (FPL i PL) skrivs inte två gånger. Senare matcher än lagets
 * nästa får bara skadorna.
 */
export function attachKeyAbsences(tips, { stores, squads, rates, maxPerTeam = 3 }) {
  let n = 0;
  // Lagets nästa match bland tipsen: bara där säger speltiden i senaste matchen något
  const next = new Map();
  for (const t of tips) for (const team of [t.home, t.away]) {
    const k = `${t.league}|${team}`;
    if (!next.has(k) || t.date < next.get(k)) next.set(k, t.date);
  }
  for (const t of tips) {
    delete t.keyAbsences;
    delete t.keyNotes;
    const store = stores[t.league], teams = squads[t.league];
    if (!store || !teams) continue;
    const side = (name) => {
      const sq = teams[name];
      if (!sq?.fotmobId) return null;
      return keyAbsences({ store, teamId: sq.fotmobId, date: t.date, squadPlayers: sq.players, rates, nextMatch: next.get(`${t.league}|${name}`) === t.date });
    };
    const home = side(t.home), away = side(t.away);
    if (!home && !away) continue;
    const said = (t.availabilityNotes ?? []).join(' ').toLowerCase();
    const fresh = (p) => !p.name || !said.includes(p.name.toLowerCase().split(/\s+/).at(-1));
    const pick = (r) => (r?.players ?? []).filter(fresh).slice(0, maxPerTeam);
    t.keyAbsences = { lastMatch: { home: home?.lastMatch ?? null, away: away?.lastMatch ?? null }, home: pick(home), away: pick(away) };
    const notes = [...t.keyAbsences.home.map((p) => keyNote(t.home, p)), ...t.keyAbsences.away.map((p) => keyNote(t.away, p))];
    if (notes.length) { t.keyNotes = notes; n++; }
  }
  return n;
}
