// Tacklingsmodell för spelare, lag och match (bet365-marknaderna "Tacklingar" och "Totalt antal tacklingar").
// Data: FotMob/Opta per match (data/fotmob-matcher/<liga>/ och .../spelare/). bet365:s "senaste 5" är exakt
// samma siffror som FotMob:s tkl (kontrollerat 2026-10-17 på Leeds–Man Utd), så definitionen är densamma.
// Spelare: takt/90 (krympt mot 1,4) × speltid i senaste 6 matcherna × motståndarens faktor, negativ binomial,
// kalibrerad mot utfall. Lag/match: rullande lagtakt × motståndarens "tacklingar mot", chans ur faktiska
// avvikelser i matcher med liknande prognos (rättar modellens överskattning, ~0,7 per lag).
import fs from 'fs';
import path from 'path';
import { probOver } from './cards-model.mjs';

export const PRIOR_RATE = 1.4;   // tacklingar/90 för en okänd utespelare
export const PRIOR_W90 = 4;      // krympning: 4 × 90 minuter
export const DECAY = 0.995;      // per spelarmatch i kalibreringen
export const VALUE_EDGE = 0.05;  // Värde = ja kräver minst +5 % (modellens felmarginal)
export const LIKELY = 0.7;       // "troligt" = minst 70 % chans
export const TEAM_DECAY = 0.95;  // per lagmatch; bakkört 2026-10-17 på PL/SA/LL/BL/L1 (0,97 släpade efter nivåskiften)
export const MAX_DISAGREE = 1.5; // lag/match: "oense" (visas) när modellen ligger mer än 1,5 tacklingar från bet365:s mittlinje
export const START_MIN = 80;     // "om han startar"
export const START_FULL = 60;    // matcher som räknas till starttakten
export const START_GAMES = 4;    // minst så många sådana matcher, annars ingen startbedömning

export const norm = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').replace(/ø/g, 'o').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z ]/g, '').trim();

// P(X >= k) med negativ binomial (invK = 1/r)
export const atLeast = (k, mu, invK) => probOver(mu, k - 0.5, invK > 0 ? 1 / invK : null);

// Linjär kalibrering ur punkter [[modell, utfall], ...]
export function calibrate(points, p) {
  if (!points || points.length < 2) return p;
  const pts = [[0, 0], ...points, [1, 1]];
  for (let i = 1; i < pts.length; i++) if (p <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return x1 === x0 ? y1 : y0 + (y1 - y0) * (p - x0) / (x1 - x0);
  }
  return p;
}

export const ev = (p, odds) => p * odds - 1;
export const verdict = (p, odds) => ev(p, odds) >= VALUE_EDGE;
// Lag/match bygger på några hundra jämförbara matcher: värdet måste hålla även med chansen ett medelfel lägre
export const verdictSampled = (p, n, odds) => verdict(p, odds) && ev(p - Math.sqrt(p * (1 - p) / n), odds) >= 0;

// Läser en ligas säsonger: [{ d, h, a, tkl:[h,a], players:[{n,t,min,tkl,gk}] }]
export function loadMatches(dataDir, league, seasons) {
  const out = [];
  for (const s of seasons) {
    const mf = path.join(dataDir, 'fotmob-matcher', league, `${s}.json`);
    const pf = path.join(dataDir, 'fotmob-matcher', league, 'spelare', `${s}.json`);
    if (!fs.existsSync(mf)) continue;
    const M = JSON.parse(fs.readFileSync(mf, 'utf8')).matches || {};
    const P = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')).matches || {} : {};
    for (const [id, m] of Object.entries(M)) {
      if (!m.s?.tkl) continue;
      out.push({ id, season: s, d: m.k || m.d, h: m.h, a: m.a, tkl: m.s.tkl,
        players: (P[id] || []).map((p) => ({ n: p.n, t: p.t, gk: p.gk, st: p.st, min: p.s?.min || 0, tkl: p.s?.tkl || 0 })) });
    }
  }
  return out.sort((a, b) => (a.d < b.d ? -1 : 1));
}

// Spridning: var = mu + mu^2 * invK, skattad på heltidsmatcher (≥80 min) för spelare med ≥8 sådana
export function estimateInvK(matches) {
  const by = {};
  for (const m of matches) for (const p of m.players) if (!p.gk && p.min >= 80) (by[p.n] ??= []).push(p.tkl);
  let num = 0, den = 0;
  for (const g of Object.values(by)) {
    if (g.length < 8) continue;
    const mu = g.reduce((a, b) => a + b, 0) / g.length;
    const v = g.reduce((a, x) => a + (x - mu) ** 2, 0) / (g.length - 1);
    num += v - mu; den += mu * mu;
  }
  return den ? Math.max(0.01, num / den) : 0.06;
}

// Spelarprofiler: viktad takt (senaste säsongen ×2), speltid i senaste matcherna för nuvarande lag
export function playerProfiles(matches, weights = {}) {
  const pl = {};
  for (const m of matches) {
    const w = weights[m.season] ?? 1;
    for (const p of m.players) {
      if (p.gk || !p.min) continue;
      const team = p.t === 0 ? m.h : m.a;
      const r = (pl[norm(p.n)] ??= { name: p.n, w90: 0, tk: 0, games: [], w90s: 0, tks: 0, ns: 0 });
      r.w90 += w * p.min / 90; r.tk += w * p.tkl;
      if (p.min >= START_FULL) { r.w90s += w * p.min / 90; r.tks += w * p.tkl; r.ns++; }
      r.games.push({ d: m.d, team, min: p.min, tkl: p.tkl });
      r.team = team;
    }
  }
  for (const r of Object.values(pl)) {
    r.rate90 = (r.tk + PRIOR_RATE * PRIOR_W90) / (r.w90 + PRIOR_W90);
    // takt i matcher med minst 60 min: inhopp på 18 min ger opålitlig takt för "om han startar"
    r.startRate90 = r.ns >= START_GAMES ? (r.tks + PRIOR_RATE * PRIOR_W90) / (r.w90s + PRIOR_W90) : null;
  }
  return pl;
}

export const recentMinutes = (prof, team, n = 6) =>
  prof.games.filter((g) => g.team === team).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, n).map((g) => g.min);

// Kalibrering spelare: takt ur tidigare matcher, känd speltid, P(>=k) mot utfall. Returnerar { k: [[modell, utfall]] }
export function playerCalibration(matches, invK, from) {
  const acc = {}, bins = {};
  for (const m of matches) {
    for (const p of m.players) {
      if (p.gk || !p.min) continue;
      const a = (acc[p.n] ??= { w90: 0, tk: 0 });
      if (m.d >= from && a.w90 >= 5) {
        const mu = (a.tk + PRIOR_RATE * PRIOR_W90) / (a.w90 + PRIOR_W90) * p.min / 90;
        for (const k of [1, 2, 3, 4, 5]) {
          const pr = atLeast(k, mu, invK), b = Math.min(9, Math.floor(pr * 10));
          const B = ((bins[k] ??= {})[b] ??= { n: 0, p: 0, y: 0 });
          B.n++; B.p += pr; B.y += p.tkl >= k ? 1 : 0;
        }
      }
      a.w90 = a.w90 * DECAY + p.min / 90; a.tk = a.tk * DECAY + p.tkl;
    }
  }
  const out = {};
  for (const [k, bs] of Object.entries(bins))
    out[k] = Object.keys(bs).map(Number).sort((a, b) => a - b).filter((b) => bs[b].n >= 50).map((b) => [bs[b].p / bs[b].n, bs[b].y / bs[b].n]);
  return out;
}

// Kalibrering "om han startar": spelare med snitt under 75 min i senaste 6 som sedan startade, starttakt × 80/90 mot utfall.
// Bakkört 2026-10-17: okalibrerat 5–8 enheter för högt (inhoppare som startar byts ofta tidigt).
export function startCalibration(matches, invK, from) {
  const acc = {}, bins = {};
  for (const m of matches) for (const p of m.players) {
    if (p.gk || !p.min) continue;
    const a = (acc[p.n] ??= { w90s: 0, tks: 0, ns: 0, mins: [] });
    const last = a.mins.slice(-6), avg = last.length >= 3 ? last.reduce((x, y) => x + y, 0) / last.length : null;
    if (m.d >= from && avg != null && avg < 75 && p.st === 1 && a.ns >= START_GAMES) {
      const mu = (a.tks + PRIOR_RATE * PRIOR_W90) / (a.w90s + PRIOR_W90) * START_MIN / 90;
      for (const k of [1, 2, 3, 4, 5]) {
        const pr = atLeast(k, mu, invK), b = Math.min(9, Math.floor(pr * 10));
        const B = ((bins[k] ??= {})[b] ??= { n: 0, p: 0, y: 0 });
        B.n++; B.p += pr; B.y += p.tkl >= k ? 1 : 0;
      }
    }
    if (p.min >= START_FULL) { a.w90s = a.w90s * DECAY + p.min / 90; a.tks = a.tks * DECAY + p.tkl; a.ns++; }
    a.mins.push(p.min);
  }
  const out = {};
  for (const [k, bs] of Object.entries(bins))
    out[k] = Object.keys(bs).map(Number).sort((a, b) => a - b).filter((b) => bs[b].n >= 30).map((b) => [bs[b].p / bs[b].n, bs[b].y / bs[b].n]);
  return out;
}

// bet365:s mittlinje: linjen där över och under är jämnast
export const marketMid = (lines) => lines.reduce((b, l) => (Math.abs(1 / l.over - 1 / l.under) < Math.abs(1 / b.over - 1 / b.under) ? l : b)).line;

// Lagmodell: rullande (TEAM_DECAY per lagmatch) tacklingar och tacklingar mot. Returnerar prognosfunktion och historik.
export function teamModel(matches, from) {
  const T = {}; let lg = 16; const res = [], resTot = [];
  const pred = (h, a) => {
    const H = T[h], A = T[a]; if (!H || !A || H.n < 6 || A.n < 6) return null;
    return [(H.tk / H.n) * (A.ag / A.n) / lg, (A.tk / A.n) * (H.ag / H.n) / lg];
  };
  for (const m of matches) {
    const p = pred(m.h, m.a);
    if (p && m.d >= from) { res.push([p[0], m.tkl[0]], [p[1], m.tkl[1]]); resTot.push([p[0] + p[1], m.tkl[0] + m.tkl[1]]); }
    for (const [x, i] of [[m.h, 0], [m.a, 1]]) {
      const t = (T[x] ??= { n: 0, tk: 0, ag: 0 });
      t.n = t.n * TEAM_DECAY + 1; t.tk = t.tk * TEAM_DECAY + m.tkl[i]; t.ag = t.ag * TEAM_DECAY + m.tkl[1 - i];
    }
    lg = lg * 0.995 + 0.005 * (m.tkl[0] + m.tkl[1]) / 2;
  }
  // motståndarfaktor för spelare: hur mycket fler tacklingar lag gör mot just denna motståndare
  const oppFactor = (opp) => (T[opp] ? (T[opp].ag / T[opp].n) / lg : 1);
  return { pred, res, resTot, oppFactor, lg, teams: T };
}

// P(utfall < linje) bland historiska prognoser nära mu (±band), med minst 100 matcher (bandet vidgas annars)
export function probUnder(history, mu, line, band) {
  let b = band, f = [];
  while (b < band * 4) { f = history.filter(([p]) => Math.abs(p - mu) <= b); if (f.length >= 100) break; b *= 1.5; }
  if (!f.length) return null;
  return { p: f.filter(([p, y]) => y - p < line - mu).length / f.length, n: f.length };
}

// Hittar FotMob-laget där flest av bet365-spelarna finns
export function matchTeam(prof, names) {
  const cnt = {};
  for (const n of names) { const r = prof[norm(n)]; if (r) cnt[r.team] = (cnt[r.team] || 0) + 1; }
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

export function findPlayer(prof, name, team) {
  const k = norm(name);
  if (prof[k]) return prof[k];
  // samma efternamn och samma första bokstav i förnamnet (ett ensamt namn som "Bremer" räcker med efternamnet), inom laget och bara en träff
  const w = k.split(' '), last = w.pop(), ini = w[0]?.[0];
  const c = Object.values(prof).filter((r) => { const x = norm(r.name).split(' '); return r.team === team && x.pop() === last && (!ini || x[0]?.[0] === ini); });
  return c.length === 1 ? c[0] : null;
}

// Hela analysen för en sparad bet365-oddsfil
export function analyzeMatch(odds, ctx) {
  const { prof, invK, cal, tm } = ctx;
  const calStart = ctx.calStart || cal;
  const out = { match: `${odds.home} – ${odds.away}`, when: odds.when || `${odds.date} ${odds.time || ''}`.trim(), players: [], team: [], total: [] };
  const pm = odds.markets?.Tacklingar || {};
  const tabs = Object.keys(pm);
  const fm = {}; for (const t of tabs) fm[t] = matchTeam(prof, (pm[t] || []).map((r) => r.name));
  out.teams = fm; out.date = odds.date; // bet365-flik → FotMob-lag, för uppföljningen
  for (const [i, tab] of tabs.entries()) {
    const team = fm[tab], opp = fm[tabs[1 - i]];
    const fac = opp ? tm.oppFactor(opp) : 1;
    for (const row of pm[tab] || []) {
      const r = findPlayer(prof, row.name, team);
      const base = { team: tab, name: row.name, last5: row.last5 };
      if (!r || r.w90 < 3) { out.players.push({ ...base, note: 'för lite data' }); continue; }
      const mins = recentMinutes(r, team); if (!mins.length) mins.push(60);
      const avgMin = mins.reduce((a, b) => a + b, 0) / mins.length;
      const raw = (k, ms, rate = r.rate90) => ms.reduce((a, m) => a + atLeast(k, rate * m / 90 * fac, invK), 0) / ms.length;
      const prob = (k, ms) => calibrate(cal[k] || cal[4], raw(k, ms));
      const lines = Object.entries(row.odds).map(([lab, o]) => {
        const k = parseInt(lab, 10), p = prob(k, mins);
        const pStart = avgMin < 75 && r.startRate90 != null ? calibrate(calStart[k] || calStart[4], raw(k, [START_MIN], r.startRate90)) : null;
        return { line: lab, k, odds: o, p, ev: ev(p, o), value: verdict(p, o), likely: p >= LIKELY,
          ...(pStart != null ? { pStart, evStart: ev(pStart, o), valueStart: verdict(pStart, o) } : {}) };
      });
      out.players.push({ ...base, rate90: r.rate90, mins, avgMin, expected: r.rate90 * avgMin / 90 * fac, lines });
    }
  }
  const ou = odds.markets?.['Totalt antal tacklingar'] || {};
  const pr = fm[tabs[0]] && fm[tabs[1]] ? tm.pred(fm[tabs[0]], fm[tabs[1]]) : null;
  if (pr) {
    out.expected = { [tabs[0]]: pr[0], [tabs[1]]: pr[1], total: pr[0] + pr[1] };
    for (const [tab, lines] of Object.entries(ou)) {
      const isTot = !tabs.includes(tab);
      const mu = isTot ? pr[0] + pr[1] : pr[tabs.indexOf(tab)];
      // Nivån tas från bet365 (modellen = marknaden, som hästarna): lagmodellen förklarar bara 5–13 % av variationen och
      // vid oenighet har oddsen haft rätt (Elo 2026-10-12). Bara svansarnas form kommer ur vår historik.
      const mid = lines.length ? marketMid(lines) : null, gap = mid == null ? 0 : mu - mid, agree = Math.abs(gap) <= MAX_DISAGREE;
      const center = mid ?? mu;
      for (const l of lines) {
        const u = probUnder(isTot ? (ctx.resTotPool || tm.resTot) : (ctx.resPool || tm.res), center, l.line, isTot ? 2 : 1.25); if (!u) continue;
        const row = { market: isTot ? 'Matchen totalt' : tab, line: l.line, n: u.n, mu, mid, gap, agree,
          over: { odds: l.over, p: 1 - u.p, ev: ev(1 - u.p, l.over), value: verdictSampled(1 - u.p, u.n, l.over), likely: 1 - u.p >= LIKELY },
          under: { odds: l.under, p: u.p, ev: ev(u.p, l.under), value: verdictSampled(u.p, u.n, l.under), likely: u.p >= LIKELY } };
        (isTot ? out.total : out.team).push(row);
      }
    }
  }
  return out;
}

// Avvikelser ur flera ligor: svansen (t.ex. under 25,5) blir stabil först med ~800 matcher (2026-10-17: en liga gav 16–24 % beroende på inställning)
export const POOL_LEAGUES = ['PL', 'SA', 'LL', 'BL', 'L1'];
export function residualPool(dataDir, leagues = POOL_LEAGUES, seasons = ['2024-2025', '2025-2026', '2026-2027']) {
  const res = [], resTot = [];
  for (const l of leagues) {
    const all = loadMatches(dataDir, l, seasons); if (!all.length) continue;
    const from = all.find((m) => m.season === seasons[seasons.length - 2])?.d || all[0].d;
    const tm = teamModel(all, from); res.push(...tm.res); resTot.push(...tm.resTot);
  }
  return { resPool: res, resTotPool: resTot };
}

// Bygger allt som behövs en gång (PL, två senaste säsongerna för takt, tre för kalibrering/lagmodell)
export function buildContext(dataDir, league = 'PL', seasons = ['2024-2025', '2025-2026', '2026-2027']) {
  const all = loadMatches(dataDir, league, seasons);
  const recent = seasons.slice(-2);
  const prof = playerProfiles(all.filter((m) => recent.includes(m.season)), { [recent[0]]: 1, [recent[1]]: 2 });
  const invK = estimateInvK(all);
  const from = all.find((m) => m.season === recent[0])?.d || all[0]?.d;
  const cal = playerCalibration(all, invK, from);
  const calStart = startCalibration(all, invK, from);
  const tm = teamModel(all, from);
  return { prof, invK, cal, calStart, tm, nMatches: all.length };
}
