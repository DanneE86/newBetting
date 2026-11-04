// Dataflödet för "slå bolagen": alla matcher med riktiga odds från före avspark, 2017/18 och framåt.
// Utveckling = t.o.m. UTVECKLING_TILL. Slutprovet (matcherna efter) går bara att läsa med { slutprov: true }, så att inget
// utvecklingsskript råkar se dem. Marknader: 1X2 och över/under 2,5. Bolag: Bet365, Pinnacle, snitt, högsta pris.
import fs from 'node:fs';
import path from 'node:path';

export const UTVECKLING_TILL = '2024-10-31';
export const SLUTPROV_TILL = '2026-10-31';
const LIGOR = ['PL', 'CH', 'EL1', 'BL', 'BL2', 'LL', 'LL2', 'SA', 'SB', 'L1', 'ED', 'BE', 'PT', 'GR', 'SC'];
const SASONGER = ['1718', '1819', '1920', '2021', '2122', '2223'];

/** En CSV-rad med citattecken stöds inte: football-data har inga. */
function radera(text) {
  const rader = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const h = rader[0].split(',');
  return rader.slice(1).map((l) => { const c = l.split(','); const o = {}; h.forEach((k, i) => { o[k] = c[i]; }); return o; });
}
const tal = (x) => { const v = Number(x); return x !== '' && x != null && Number.isFinite(v) && v > 0 ? v : null; };
const talNoll = (x) => { const v = Number(x); return x !== '' && x != null && Number.isFinite(v) ? v : null; };
function datum(d) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(d ?? '');
  if (!m) return null;
  const ar = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${ar}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/** football-data-rad -> samma form som betting-store. Äldre säsonger har Bb-kolumner i stället för Max/Avg. */
export function fransCsv(r, league, season) {
  const date = datum(r.Date), hg = talNoll(r.FTHG), ag = talNoll(r.FTAG);
  if (!date || hg == null || ag == null || !['H', 'D', 'A'].includes(r.FTR)) return null;
  const ett = (...k) => { for (const x of k) { const v = tal(r[x]); if (v) return v; } return null; };
  return {
    id: `${league}_${date}_${r.HomeTeam}_${r.AwayTeam}`, league, season, date, home: r.HomeTeam, away: r.AwayTeam, hg, ag, result: r.FTR,
    over25: hg + ag > 2.5,
    odds: {
      home: ett('AvgH', 'BbAvH'), draw: ett('AvgD', 'BbAvD'), away: ett('AvgA', 'BbAvA'),
      max_home: ett('MaxH', 'BbMxH'), max_draw: ett('MaxD', 'BbMxD'), max_away: ett('MaxA', 'BbMxA'),
      b365_home: ett('B365H'), b365_draw: ett('B365D'), b365_away: ett('B365A'),
      pinnacle_home: ett('PSH'), pinnacle_draw: ett('PSD'), pinnacle_away: ett('PSA'),
      over25: ett('Avg>2.5', 'BbAv>2.5'), under25: ett('Avg<2.5', 'BbAv<2.5'),
      max_over25: ett('Max>2.5', 'BbMx>2.5'), max_under25: ett('Max<2.5', 'BbMx<2.5'),
      b365_over25: ett('B365>2.5'), b365_under25: ett('B365<2.5'),
      pinnacle_over25: ett('P>2.5'), pinnacle_under25: ett('P<2.5'),
    },
    closing: {
      pinnacle_home: ett('PSCH'), pinnacle_draw: ett('PSCD'), pinnacle_away: ett('PSCA'),
      avg_home: ett('AvgCH'), avg_draw: ett('AvgCD'), avg_away: ett('AvgCA'),
      pinnacle_over25: ett('PC>2.5'), pinnacle_under25: ett('PC<2.5'),
      avg_over25: ett('AvgC>2.5'), avg_under25: ett('AvgC<2.5'),
    },
    shots: { home: talNoll(r.HS), away: talNoll(r.AS), homeSot: talNoll(r.HST), awaySot: talNoll(r.AST) },
  };
}

export function laddaAlla(root, { slutprov = false } = {}) {
  const ut = [];
  const seen = new Set();
  const med = (m) => { if (!m || seen.has(m.id)) return; seen.add(m.id); ut.push(m); };
  for (const liga of LIGOR) {
    for (const s of SASONGER) {
      const fil = path.join(root, 'data', 'raw', 'full', `${liga}_${s}.csv`);
      if (!fs.existsSync(fil)) continue;
      for (const r of radera(fs.readFileSync(fil, 'latin1'))) med(fransCsv(r, liga, `20${s.slice(0, 2)}/${s.slice(2)}`));
    }
  }
  const store = JSON.parse(fs.readFileSync(path.join(root, 'data', 'betting-store.json'), 'utf8').replace(/^﻿/, ''));
  for (const m of store.matches) {
    if (!LIGOR.includes(m.league) || m.date < '2023-07-01' || !m.odds || !Number.isFinite(m.hg) || !Number.isFinite(m.ag) || !['H', 'D', 'A'].includes(m.result)) continue;
    med(m);
  }
  const grans = slutprov ? SLUTPROV_TILL : UTVECKLING_TILL;
  return ut.filter((m) => m.date <= grans).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export const pris = (m, bok, marknad = '1x2') => {
  const o = m.odds ?? {};
  const pre = bok === 'avg' ? '' : `${bok}_`;
  const k = marknad === '1x2' ? ['home', 'draw', 'away'] : ['over25', 'under25'];
  const p = k.map((x) => o[`${pre}${x}`]);
  return p.every((x) => x > 1) ? p : null;
};

/** Pris utan marginal, eller null när summan är orimlig. */
export function fair(p) {
  if (!p) return null;
  const inv = p.map((x) => 1 / x), t = inv.reduce((a, b) => a + b, 0);
  const lag = p.length === 3 ? 0.98 : 0.98;
  if (t < lag || t > 1.3) return null;
  return inv.map((x) => x / t);
}

/** Stängningspriset utan marginal, skarpast först. Betfair finns bara i store. */
export function stangFair(m, marknad = '1x2') {
  const c = m.closing ?? {};
  const k = marknad === '1x2' ? ['home', 'draw', 'away'] : ['over25', 'under25'];
  for (const b of ['pinnacle', 'bfe', 'avg']) {
    const f = fair(k.map((x) => c[`${b}_${x}`]));
    if (k.every((x) => c[`${b}_${x}`] > 1) && f) return { f, kalla: b };
  }
  return null;
}

/** Löpande, egen lagstyrka från skott och mål. Allt uppdateras först efter matchdagen. */
export function lagstyrka() {
  const lag = new Map(), liga = new Map();
  const L = (l) => { if (!liga.has(l)) liga.set(l, { h: 1.45, a: 1.15, gh: 1.45, ga: 1.15, n: 0 }); return liga.get(l); };
  const T = (l, t) => { const k = `${l}|${t}`; if (!lag.has(k)) lag.set(k, { a: -0.1, d: 0.1, ga: -0.1, gd: 0.1, n: 0, s: null, sista: null, senaste: [] }); return lag.get(k); };
  const K = (t) => Math.max(0.05, 0.35 / Math.sqrt(t.n + 1));
  return {
    info(m) {
      const li = L(m.league), H = T(m.league, m.home), A = T(m.league, m.away);
      for (const t of [H, A]) { if (t.s && t.s !== m.season) { t.a *= 0.8; t.d *= 0.8; t.ga *= 0.8; t.gd *= 0.8; t.n = Math.min(t.n, 12); } t.s = m.season; }
      const dagar = (t) => (t.sista ? Math.min(14, (Date.parse(m.date) - Date.parse(t.sista)) / 864e5) : 7);
      return {
        ok: li.n >= 40 && H.n >= 3 && A.n >= 3,
        skott: [li.h * Math.exp(H.a + A.d), li.a * Math.exp(A.a + H.d)],
        mal: [li.gh * Math.exp(H.ga + A.gd), li.ga * Math.exp(A.ga + H.gd)],
        vila: dagar(H) - dagar(A),
      };
    },
    lar(m) {
      const li = L(m.league), H = T(m.league, m.home), A = T(m.league, m.away);
      const kh = K(H), ka = K(A);
      const s = m.shots ?? {};
      if ([s.home, s.away, s.homeSot, s.awaySot].every(Number.isFinite) && s.home + s.away > 0) {
        const vh = 0.03 * Math.max(0, s.home - s.homeSot) + 0.28 * s.homeSot, va = 0.03 * Math.max(0, s.away - s.awaySot) + 0.28 * s.awaySot;
        const lh = li.h * Math.exp(H.a + A.d), la = li.a * Math.exp(A.a + H.d);
        const fh = Math.log((vh + 0.2) / (lh + 0.2)), fa = Math.log((va + 0.2) / (la + 0.2));
        H.a += kh * fh / 2; A.d += ka * fh / 2; A.a += ka * fa / 2; H.d += kh * fa / 2;
        li.h += 0.005 * (vh - li.h); li.a += 0.005 * (va - li.a);
      }
      const gh = li.gh * Math.exp(H.ga + A.gd), ga = li.ga * Math.exp(A.ga + H.gd);
      const fg = Math.log((m.hg + 0.3) / (gh + 0.3)), fb = Math.log((m.ag + 0.3) / (ga + 0.3));
      H.ga += kh * fg / 2; A.gd += ka * fg / 2; A.ga += ka * fb / 2; H.gd += kh * fb / 2;
      li.gh += 0.005 * (m.hg - li.gh); li.ga += 0.005 * (m.ag - li.ga);
      H.n++; A.n++; li.n++;
      H.sista = m.date; A.sista = m.date;
    },
  };
}

const fak = [1];
for (let i = 1; i <= 12; i++) fak[i] = fak[i - 1] * i;
/** Poisson -> [H, D, A] och chans för över 2,5. */
export function poisson(lh, la) {
  let h = 0, d = 0, a = 0, o = 0;
  for (let x = 0; x <= 10; x++) {
    const px = Math.exp(-lh) * lh ** x / fak[x];
    for (let y = 0; y <= 10; y++) {
      const q = px * Math.exp(-la) * la ** y / fak[y];
      if (x > y) h += q; else if (x === y) d += q; else a += q;
      if (x + y > 2.5) o += q;
    }
  }
  const t = h + d + a;
  return { x: [h / t, d / t, a / t], over: o / t };
}

export const logit = (p) => Math.log(Math.max(1e-6, p) / Math.max(1e-6, 1 - p));
export const expit = (x) => 1 / (1 + Math.exp(-x));

/** Ridge: löser (X'X + lam I) b = X'y. */
export function ridge(X, y, lam = 1) {
  const n = X[0].length;
  const A = Array.from({ length: n }, () => new Float64Array(n + 1));
  for (let r = 0; r < X.length; r++) {
    const x = X[r];
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) A[i][j] += x[i] * x[j];
      A[i][n] += x[i] * y[r];
    }
  }
  for (let i = 0; i < n; i++) { for (let j = 0; j < i; j++) A[i][j] = A[j][i]; A[i][i] += lam; }
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (!f) continue;
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  const b = new Array(n).fill(0);
  for (let c = n - 1; c >= 0; c--) {
    let s = A[c][n];
    for (let k = c + 1; k < n; k++) s -= A[c][k] * b[k];
    b[c] = s / A[c][c];
  }
  return b;
}
