// Rådata för jakten på en fördel: alla kolumner direkt ur football-data-filerna, per bolag, öppning och stängning.
// Toppligorna: data/raw/full (2017/18-2022/23) och data/raw/<liga>_<säsong>.csv (2023/24-). Övriga: data/raw/<liga>_all.csv
// som bara har stängningsodds men går tillbaka till 2012. Slutprovet (efter JAKT_TILL) kräver { slutprov: true }.
import fs from 'node:fs';
import path from 'node:path';

export const JAKT_TILL = '2024-10-31';
export const SLUT_TILL = '2026-10-31';
export const TOPP = ['PL', 'CH', 'EL1', 'BL', 'BL2', 'LL', 'LL2', 'SA', 'SB', 'L1', 'ED', 'BE', 'PT', 'GR', 'SC'];
export const STANG = ['AR', 'AS', 'BR', 'DK', 'EK', 'JP1', 'MLS', 'MX', 'NO'];

const num = (x) => { const v = Number(x); return x !== '' && x != null && Number.isFinite(v) ? v : null; };
const pos = (x) => { const v = num(x); return v && v > 1 ? v : null; };
function datum(d) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(d ?? '');
  if (!m) return null;
  return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
function rader(fil) {
  const t = fs.readFileSync(fil, 'latin1').replace(/^ï»¿/, '').replace(/^﻿/, '');
  const l = t.split(/\r?\n/).filter((x) => x.trim());
  const h = l[0].split(',');
  return l.slice(1).map((s) => { const c = s.split(','); const o = {}; h.forEach((k, i) => { if (k) o[k] = c[i]; }); return o; });
}
const tre = (r, a, b, c) => { const v = [a, b, c].map((k) => pos(r[k])); return v.every(Boolean) ? v : null; };
const tva = (r, a, b) => { const v = [a, b].map((k) => pos(r[k])); return v.every(Boolean) ? v : null; };
const forst = (...v) => v.find(Boolean) ?? null;

/** En rad -> match med priser per bolag. Äldre säsonger har Bb-kolumner. */
export function normalisera(r, league, season) {
  const date = datum(r.Date);
  const hg = num(r.FTHG ?? r.HG), ag = num(r.FTAG ?? r.AG);
  const home = r.HomeTeam ?? r.Home, away = r.AwayTeam ?? r.Away, res = r.FTR ?? r.Res;
  if (!date || hg == null || ag == null || !['H', 'D', 'A'].includes(res) || !home || !away) return null;
  return {
    id: `${league}_${date}_${home}_${away}`, league, season, date, home, away, hg, ag, y: { H: 0, D: 1, A: 2 }[res],
    skott: { h: num(r.HS), a: num(r.AS), hm: num(r.HST), am: num(r.AST) },
    o: {
      b365: tre(r, 'B365H', 'B365D', 'B365A'), pin: tre(r, 'PSH', 'PSD', 'PSA'),
      avg: forst(tre(r, 'AvgH', 'AvgD', 'AvgA'), tre(r, 'BbAvH', 'BbAvD', 'BbAvA')), max: forst(tre(r, 'MaxH', 'MaxD', 'MaxA'), tre(r, 'BbMxH', 'BbMxD', 'BbMxA')),
    },
    c: {
      b365: tre(r, 'B365CH', 'B365CD', 'B365CA'), pin: tre(r, 'PSCH', 'PSCD', 'PSCA'),
      avg: tre(r, 'AvgCH', 'AvgCD', 'AvgCA'), max: tre(r, 'MaxCH', 'MaxCD', 'MaxCA'), bfe: tre(r, 'BFECH', 'BFECD', 'BFECA'),
    },
    ou: {
      b365: tva(r, 'B365>2.5', 'B365<2.5'), pin: tva(r, 'P>2.5', 'P<2.5'),
      avg: forst(tva(r, 'Avg>2.5', 'Avg<2.5'), tva(r, 'BbAv>2.5', 'BbAv<2.5')), max: forst(tva(r, 'Max>2.5', 'Max<2.5'), tva(r, 'BbMx>2.5', 'BbMx<2.5')),
    },
    ouc: {
      b365: tva(r, 'B365C>2.5', 'B365C<2.5'), pin: tva(r, 'PC>2.5', 'PC<2.5'), avg: tva(r, 'AvgC>2.5', 'AvgC<2.5'), max: tva(r, 'MaxC>2.5', 'MaxC<2.5'),
    },
    ah: {
      linje: num(r.AHh ?? r.BbAHh), b365: tva(r, 'B365AHH', 'B365AHA'), pin: tva(r, 'PAHH', 'PAHA'),
      max: forst(tva(r, 'MaxAHH', 'MaxAHA'), tva(r, 'BbMxAHH', 'BbMxAHA')), avg: forst(tva(r, 'AvgAHH', 'AvgAHA'), tva(r, 'BbAvAHH', 'BbAvAHA')),
    },
    ahc: {
      linje: num(r.AHCh), b365: tva(r, 'B365CAHH', 'B365CAHA'), pin: tva(r, 'PCAHH', 'PCAHA'), max: tva(r, 'MaxCAHH', 'MaxCAHA'), avg: tva(r, 'AvgCAHH', 'AvgCAHA'),
    },
  };
}

/** Avräkning av asiatiskt handikapp, även kvartslinjer. sida 0 = hemma. Returnerar vinst per satsad enhet. */
export function ahVinst(hg, ag, linje, sida, odds) {
  const en = (l) => {
    const d = (sida === 0 ? hg - ag : ag - hg) + (sida === 0 ? l : -l);
    return d > 0 ? odds - 1 : d < 0 ? -1 : 0;
  };
  const f = Math.abs(linje * 4) % 2;
  if (f === 1) return (en(linje - 0.25) + en(linje + 0.25)) / 2;
  return en(linje);
}

export function laddaTopp(root, { slutprov = false } = {}) {
  const ut = [], seen = new Set();
  const lagg = (m) => { if (m && !seen.has(m.id)) { seen.add(m.id); ut.push(m); } };
  for (const l of TOPP) {
    for (const s of ['1718', '1819', '1920', '2021', '2122', '2223', '2324', '2425', '2526', '2627']) {
      const a = path.join(root, 'data', 'raw', 'full', `${l}_${s}.csv`), b = path.join(root, 'data', 'raw', `${l}_${s}.csv`);
      const fil = fs.existsSync(a) ? a : b;
      if (!fs.existsSync(fil)) continue;
      for (const r of rader(fil)) lagg(normalisera(r, l, s));
    }
  }
  const grans = slutprov ? SLUT_TILL : JAKT_TILL;
  return ut.filter((m) => m.date <= grans).sort((x, y) => x.date.localeCompare(y.date) || x.id.localeCompare(y.id));
}

export function laddaStang(root, { slutprov = false } = {}) {
  const ut = [], seen = new Set();
  for (const l of STANG) {
    const fil = path.join(root, 'data', 'raw', `${l}_all.csv`);
    if (!fs.existsSync(fil)) continue;
    for (const r of rader(fil)) {
      const m = normalisera(r, l, r.Season);
      if (m && !seen.has(m.id)) { seen.add(m.id); ut.push(m); }
    }
  }
  const grans = slutprov ? SLUT_TILL : JAKT_TILL;
  return ut.filter((m) => m.date <= grans).sort((x, y) => x.date.localeCompare(y.date) || x.id.localeCompare(y.id));
}

export function fairAv(p) {
  if (!p) return null;
  const inv = p.map((x) => 1 / x), t = inv.reduce((a, b) => a + b, 0);
  if (t < 0.98 || t > 1.3) return null;
  return inv.map((x) => x / t);
}

// ---------- Lagläge före matchen (tabell, form, tur) ----------
export function lagLage() {
  const sasong = new Map(), form = new Map();
  const S = (m) => { const k = `${m.league}|${m.season}`; if (!sasong.has(k)) sasong.set(k, new Map()); return sasong.get(k); };
  const F = (l, t) => { const k = `${l}|${t}`; if (!form.has(k)) form.set(k, []); return form.get(k); };
  const T = (s, t) => { if (!s.has(t)) s.set(t, { p: 0, g: 0, gd: 0 }); return s.get(t); };
  return {
    info(m) {
      const s = S(m);
      T(s, m.home); T(s, m.away);
      const tab = [...s.entries()].sort((a, b) => b[1].p - a[1].p || b[1].gd - a[1].gd);
      const n = tab.length;
      const rank = (t) => tab.findIndex((x) => x[0] === t) + 1;
      const antalMatcher = Math.max(2 * (n - 1), 1);
      const lage = (t) => {
        const me = s.get(t), f = F(m.league, t);
        const kvar = Math.max(0, antalMatcher - me.g);
        const rel = n >= 10 ? tab[n - 4]?.[1].p ?? 0 : 0;
        const top = n >= 10 ? tab[5]?.[1].p ?? 0 : 0;
        const senaste = f.slice(-6);
        let rak = 0, tecken = null;
        for (let i = f.length - 1; i >= 0; i--) {
          const r = f[i].p === 3 ? 'V' : f[i].p === 0 ? 'F' : 'O';
          if (tecken == null) tecken = r;
          if (r !== tecken) break;
          rak++;
        }
        const med = senaste.length ? senaste.reduce((a, b) => a + b.gd, 0) / senaste.length : 0;
        const tur = senaste.filter((x) => x.sv != null);
        return {
          g: me.g, kvar, rank: rank(t), n, p: me.p, sanHot: n >= 10 && me.g > 15 && me.p - rel <= 3, dod: n >= 10 && kvar > 0 && kvar <= 7 && me.p - rel > 3 * kvar && top - me.p > 3 * kvar,
          rakT: tecken, rak, gdForm: med, senastGd: f.at(-1)?.gd ?? 0, f: f.length,
          tur: tur.length >= 4 ? tur.reduce((a, b) => a + (b.gd - b.sv), 0) / tur.length : null,
        };
      };
      return { h: lage(m.home), a: lage(m.away) };
    },
    lar(m) {
      const s = S(m), H = T(s, m.home), A = T(s, m.away);
      const ph = m.y === 0 ? 3 : m.y === 1 ? 1 : 0, pa = m.y === 2 ? 3 : m.y === 1 ? 1 : 0;
      H.p += ph; A.p += pa; H.g++; A.g++; H.gd += m.hg - m.ag; A.gd += m.ag - m.hg;
      const k = m.skott;
      const sv = [k.h, k.a, k.hm, k.am].every(Number.isFinite) && k.h + k.a > 0
        ? (0.03 * (k.h - k.hm) + 0.28 * k.hm) - (0.03 * (k.a - k.am) + 0.28 * k.am) : null;
      F(m.league, m.home).push({ p: ph, gd: m.hg - m.ag, sv });
      F(m.league, m.away).push({ p: pa, gd: m.ag - m.hg, sv: sv == null ? null : -sv });
    },
  };
}

/**
 * Hemmaregeln: bland 1, X och 2 väljs tecknet med störst fördel mot Pinnacles pris utan marginal (minst tau, under 25 %,
 * odds högst 5). Regeln spelar bara när det tecknet är hemma. f = Pinnacle utan marginal, pris = priset man får.
 */
export function hemmaregel(f, pris, tau = 0.02, sida = 0) {
  if (!f || !pris) return false;
  let b = null, be = tau;
  for (let i = 0; i < 3; i++) {
    const ev = f[i] * pris[i] - 1;
    if (ev >= be && ev < 0.25 && pris[i] <= 5) { b = i; be = ev; }
  }
  return b === sida;
}
