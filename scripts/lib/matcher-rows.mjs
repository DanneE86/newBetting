// Hjalpfunktioner for data/matcher/<liga>.csv (scripts/export-league-matches.mjs), separat sa de kan testas.

// Domare, horn, frisparkar, kort, avspark fran store (m), annars direkt ur football-data-CSV:n (fd).
// Store uppdateras senare an CSV:n, sa nyss spelade matcher saknade annars domare och kort.
export function extraCols(m, fd = {}) {
  const d = m?.discipline ?? {};
  const v = (a, b) => (Number.isFinite(a) ? a : Number.isFinite(b) ? b : null);
  return {
    kickoff: m?.kickoff || fd.kickoff || null, referee: m?.referee || fd.referee || null,
    hc: v(d.homeCorners, fd.hc), ac: v(d.awayCorners, fd.ac), hf: v(d.homeFouls, fd.hf), af: v(d.awayFouls, fd.af),
    hy: v(d.homeYellow, fd.hy), ay: v(d.awayYellow, fd.ay), hr: v(d.homeRed, fd.hr), ar: v(d.awayRed, fd.ar),
  };
}

// Spelad match utan resultat i football-data an (kommer 1-3 dagar senare): raden behalls som 'vantar' sa att
// oddsen och franvaron vi sag fore matchen (pre_*) foljer med nar resultatet kommer. Efter PENDING_DAYS slapps den.
export const PENDING_DAYS = 21;
export function pendingRows(prev, today, isTaken) {
  const from = new Date(Date.parse(today) - PENDING_DAYS * 864e5).toISOString().slice(0, 10);
  return prev
    .filter((r) => (r.status === 'kommande' || r.status === 'väntar') && r.date < today && r.date >= from
      && (r.pre_first_at || r.pre_inj_at) && !isTaken(r))
    .map((r) => ({ ...r, status: 'väntar' }));
}

// Franvaro i laget nu (data/trupper/<liga>.json): antal skadade/avstangda och deras andel av truppens marknadsvarde
export function squadAbsence(team) {
  const ps = team?.players ?? [];
  if (!ps.length) return null;
  const out = ps.filter((p) => p.injury);
  const total = ps.reduce((s, p) => s + (p.value ?? 0), 0);
  return { n: out.length, share: total > 0 ? out.reduce((s, p) => s + (p.value ?? 0), 0) / total : null };
}

const FIRST = ['pre_first_at', 'pre_first_h', 'pre_first_d', 'pre_first_a'];
const LAST = ['pre_last_at', 'pre_last_h', 'pre_last_d', 'pre_last_a', 'pre_best_h', 'pre_best_d', 'pre_best_a'];
export const INJ = ['pre_inj_at', 'pre_inj_h', 'pre_inj_a', 'pre_injv_h', 'pre_injv_a'];

// For over fore-match-varden fran forra korningens rad (p) till nya raden (r), pa plats:
// forsta oddsavlasningen behalls, senaste odds och senaste franvaro uppdateras om nya rader har egna.
export function carryPre(r, p) {
  if (p?.pre_first_at) for (const c of FIRST) r[c] = p[c];
  else if (r.pre_last_at) Object.assign(r, { pre_first_at: r.pre_last_at, pre_first_h: r.pre_last_h, pre_first_d: r.pre_last_d, pre_first_a: r.pre_last_a });
  if (!p) return r;
  if (!r.pre_last_at) for (const c of LAST) r[c] = p[c];
  if (!r.pre_inj_at) for (const c of INJ) r[c] = p[c];
  return r;
}
