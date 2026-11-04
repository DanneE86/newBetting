// Modell 3 "Skottmotorn": bryr sig inte om slutresultat när lagen bedöms, bara om chanserna de skapar och släpper till.
// Varje lag har ett anfalls- och ett försvarsläge som flyttas efter varje match mot skottvärdet
// (vikt * skott utanför + vikt * skott på mål). Vikterna lärs från hur många mål skott faktiskt gett. Inga odds i
// bedömningen; de används bara för att avgöra om priset är bra. Lär sig av sig själv: ser hur övertygad den brukar
// vara mot utfallet och rättar sina egna procent, och stänger EV-band som förlorat.
const MAX_MAL = 10;
const fak = [1];
for (let i = 1; i <= MAX_MAL + 1; i++) fak[i] = fak[i - 1] * i;
const poisson = (l, k) => Math.exp(-l) * l ** k / fak[k];

function utfall(lh, la) {
  let h = 0, d = 0, a = 0;
  for (let x = 0; x <= MAX_MAL; x++) {
    for (let y = 0; y <= MAX_MAL; y++) {
      const q = poisson(lh, x) * poisson(la, y);
      if (x > y) h += q; else if (x === y) d += q; else a += q;
    }
  }
  const t = h + d + a;
  return [h / t, d / t, a / t];
}
const softmax = (s) => { const m = Math.max(...s); const e = s.map((x) => Math.exp(x - m)); const t = e[0] + e[1] + e[2]; return e.map((x) => x / t); };

export function skapa() {
  const lag = new Map(), ligor = new Map(), vantar = new Map(), egna = [], skott = [], evBand = new Map();
  let vikter = { ut: 0.03, pa: 0.28 }, manad = null, kal = { a: [0, 0, 0], b: 1 };
  const ligaAv = (l) => { if (!ligor.has(l)) ligor.set(l, { h: 1.45, a: 1.15, n: 0 }); return ligor.get(l); };
  const lagAv = (l, t) => {
    const k = `${l}|${t}`;
    if (!lag.has(k)) lag.set(k, { atk: -0.1, def: 0.1, n: 0, sasong: null });
    return lag.get(k);
  };
  const nySasong = (t, s) => {
    if (t.sasong && t.sasong !== s) { t.atk *= 0.8; t.def *= 0.8; t.n = Math.min(t.n, 12); }
    t.sasong = s;
  };
  const uppdateraVikter = () => {
    // Minsta kvadrat: mål = ut * skott utanför + pa * skott på mål (bara egen historik)
    if (skott.length < 500) return;
    let a = 0, b = 0, c = 0, d = 0, e = 0;
    for (const [u, p, g] of skott.slice(-20000)) { a += u * u; b += u * p; c += p * p; d += u * g; e += p * g; }
    const det = a * c - b * b;
    if (Math.abs(det) < 1e-6) return;
    const ut = (c * d - b * e) / det, pa = (a * e - b * d) / det;
    if (ut > 0 && pa > 0) vikter = { ut, pa };
  };
  const kalibrera = () => {
    if (egna.length < 400) return;
    const r = egna.slice(-6000);
    const t = { a: [0, 0, 0], b: 1 };
    for (let it = 0; it < 100; it++) {
      const ga = [0, 0, 0]; let gb = 0;
      for (const { lp, y } of r) {
        const p = softmax(lp.map((x, i) => t.a[i] + t.b * x));
        for (let i = 0; i < 3; i++) { const q = (y === i ? 1 : 0) - p[i]; ga[i] += q; gb += q * lp[i]; }
      }
      for (let i = 0; i < 3; i++) t.a[i] += 0.5 * ga[i] / r.length;
      t.b += 0.2 * gb / r.length;
    }
    kal = t;
  };
  const band = (ev) => (ev < 0.1 ? 'a' : ev < 0.2 ? 'b' : ev < 0.3 ? 'c' : 'd');
  const avstangt = (bok, b) => {
    const s = evBand.get(`${bok}|${b}`);
    if (!s || s.length < 100) return false;
    const u = s.slice(-200);
    return u.reduce((x, y) => x + y, 0) / u.length < -0.05;
  };
  return {
    namn: 'M3 Skottmotorn',
    predict(v) {
      const m = v.date.slice(0, 7);
      if (m !== manad) { manad = m; uppdateraVikter(); kalibrera(); }
      const L = ligaAv(v.league);
      const H = lagAv(v.league, v.home), A = lagAv(v.league, v.away);
      nySasong(H, v.season); nySasong(A, v.season);
      if (L.n < 40 || H.n < 3 || A.n < 3) return null;
      const lh = L.h * Math.exp(H.atk + A.def), la = L.a * Math.exp(A.atk + H.def);
      const lp = utfall(lh, la).map(Math.log);
      const p = softmax(lp.map((x, i) => kal.a[i] + kal.b * x));
      vantar.set(v.id, { lp, bets: {} });
      return { p, pick: p.indexOf(Math.max(...p)) };
    },
    bet(v, pred, bok, pris) {
      let best = null, bestEv = 0.06;
      const e = vantar.get(v.id);
      for (let i = 0; i < 3; i++) {
        const ev = pred.p[i] * pris[i] - 1;
        if (ev < 0.06 || ev > 0.40 || pris[i] > 6) continue;
        e.bets[`${bok}|${i}`] = { odds: pris[i], ev };
        if (ev >= bestEv && !avstangt(bok, band(ev))) { best = i; bestEv = ev; }
      }
      return best;
    },
    learn(m) {
      const e = vantar.get(m.id);
      vantar.delete(m.id);
      const y = { H: 0, D: 1, A: 2 }[m.result];
      if (e) {
        egna.push({ lp: e.lp, y });
        for (const [k, b] of Object.entries(e.bets)) {
          const [bok, i] = k.split('|');
          const n = `${bok}|${band(b.ev)}`;
          const q = evBand.get(n) ?? [];
          q.push(Number(i) === y ? b.odds - 1 : -1);
          evBand.set(n, q);
        }
      }
      const s = m.shots ?? {};
      if (![s.home, s.away, s.homeSot, s.awaySot].every(Number.isFinite) || s.home + s.away === 0) return;
      const uh = Math.max(0, s.home - s.homeSot), ua = Math.max(0, s.away - s.awaySot);
      skott.push([uh, s.homeSot, m.hg], [ua, s.awaySot, m.ag]);
      const vh = vikter.ut * uh + vikter.pa * s.homeSot;
      const va = vikter.ut * ua + vikter.pa * s.awaySot;
      const L = ligaAv(m.league);
      const H = lagAv(m.league, m.home), A = lagAv(m.league, m.away);
      const lh = L.h * Math.exp(H.atk + A.def), la = L.a * Math.exp(A.atk + H.def);
      const K = (t) => Math.max(0.05, 0.35 / Math.sqrt(t.n + 1));
      const fh = Math.log((vh + 0.2) / (lh + 0.2)), fa = Math.log((va + 0.2) / (la + 0.2));
      const kh = K(H), ka = K(A);
      H.atk += kh * fh / 2; A.def += ka * fh / 2;
      A.atk += ka * fa / 2; H.def += kh * fa / 2;
      H.n++; A.n++; L.n++;
      L.h += 0.005 * (vh - L.h); L.a += 0.005 * (va - L.a);
    },
  };
}
