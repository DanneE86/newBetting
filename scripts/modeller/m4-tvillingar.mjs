// Modell 4 "Tvillingarna": ingen formel för lagstyrka. För varje match letas tidigare matcher (i alla ligor) som såg
// likadana ut före avspark: form, målskillnad, skott, hemma/borta-form, vila, målrikedom. Chansen = hur de matcherna
// slutade, viktat efter hur lika de är. Inga odds i bedömningen, bara för att avgöra om priset är bra.
// Lär sig av sig själv: två gånger om året provar den att vikta upp/ner varje egenskap mot sina egna senaste matcher
// och behåller det som gav bättre tips. Band som förlorat stängs tills de vänder.
const ANTAL = 9, BAND = 1.1, MIN_FORM = 5, KAP = 60000;

export function skapa() {
  const lag = new Map(), vantar = new Map(), senaste = [], basLiga = new Map(), roi = new Map();
  const X = new Float64Array(KAP * ANTAL), Y = new Int8Array(KAP);
  const sum = new Float64Array(ANTAL), kv = new Float64Array(ANTAL);
  let n = 0, vikter = new Array(ANTAL).fill(1), halvar = null;
  const historia = (t) => { if (!lag.has(t)) lag.set(t, []); return lag.get(t); };
  const snitt = (rader, f, k) => { const s = rader.slice(-k); return s.length ? s.reduce((a, r) => a + f(r), 0) / s.length : 0; };
  const dag = (d) => Date.parse(`${d}T00:00:00Z`) / 864e5;
  const fingeravtryck = (v) => {
    const h = lag.get(v.home), a = lag.get(v.away);
    if (!h || !a || h.length < MIN_FORM || a.length < MIN_FORM) return null;
    const nu = dag(v.date);
    const hh = h.filter((r) => r.hemma), aa = a.filter((r) => !r.hemma);
    return [
      snitt(h, (r) => r.p, 5) - snitt(a, (r) => r.p, 5),
      snitt(h, (r) => r.p, 15) - snitt(a, (r) => r.p, 15),
      snitt(h, (r) => r.gd, 10) - snitt(a, (r) => r.gd, 10),
      snitt(h, (r) => r.sot, 10) - snitt(a, (r) => r.sot, 10),
      snitt(hh, (r) => r.p, 8) - snitt(aa, (r) => r.p, 8),
      Math.max(-7, Math.min(7, (nu - dag(h.at(-1).d)) - (nu - dag(a.at(-1).d)))),
      h.filter((r) => nu - dag(r.d) <= 14).length - a.filter((r) => nu - dag(r.d) <= 14).length,
      snitt(h, (r) => r.tot, 10) + snitt(a, (r) => r.tot, 10),
      snitt(h, (r) => r.ga, 10) - snitt(a, (r) => r.ga, 10),
    ];
  };
  const skala = (i) => { if (n < 50) return 1; const m = sum[i] / n; return Math.sqrt(Math.max(1e-6, kv[i] / n - m * m)) || 1; };
  const uppskatta = (f, w, slut, bas) => {
    const c = [bas[0] * 25, bas[1] * 25, bas[2] * 25];
    let vsum = 0;
    const s = [];
    for (let i = 0; i < ANTAL; i++) s[i] = w[i] / skala(i) ** 2;
    for (let r = Math.max(0, slut - 24000); r < slut; r++) {
      let d = 0;
      const off = r * ANTAL;
      for (let i = 0; i < ANTAL; i++) { const x = f[i] - X[off + i]; d += s[i] * x * x; }
      const q = Math.exp(-d / (2 * BAND * BAND));
      c[Y[r]] += q;
      vsum += q;
    }
    const t = c[0] + c[1] + c[2];
    return { p: c.map((x) => x / t), vikt: vsum };
  };
  const rps = (p, y) => {
    const a = p[0] - (y === 0 ? 1 : 0), b = p[0] + p[1] - (y <= 1 ? 1 : 0);
    return 0.5 * (a * a + b * b);
  };
  const larOm = () => {
    const prov = senaste.slice(-400);
    if (prov.length < 400) return;
    const score = (w) => prov.reduce((a, r) => a + rps(uppskatta(r.f, w, r.n, r.bas).p, r.y), 0) / prov.length;
    let bast = score(vikter);
    for (let i = 0; i < ANTAL; i++) {
      for (const k of [1.6, 0.6]) {
        const w = [...vikter];
        w[i] = Math.max(0.05, Math.min(4, w[i] * k));
        const s = score(w);
        if (s < bast - 1e-5) { bast = s; vikter = w; break; }
      }
    }
  };
  const nyckel = (bok, i, o) => `${bok}|${i}|${o < 2 ? 'a' : o < 3 ? 'b' : 'c'}`;
  const stangt = (k) => {
    const s = roi.get(k);
    if (!s || s.length < 80) return false;
    const u = s.slice(-160);
    return u.reduce((a, b) => a + b, 0) / u.length < -0.08;
  };
  return {
    namn: 'M4 Tvillingarna',
    predict(v) {
      const h = `${v.date.slice(0, 4)}-${v.date.slice(5, 7) < '07' ? 1 : 2}`;
      if (h !== halvar) { halvar = h; larOm(); }
      const f = fingeravtryck(v);
      const b = basLiga.get(v.league) ?? [46, 26, 28];
      const t = b[0] + b[1] + b[2];
      const bas = b.map((x) => x / t);
      if (!f) return null;
      const ok = n >= 1500;
      const res = ok ? uppskatta(f, vikter, n, bas) : null;
      vantar.set(v.id, { f, bas, n, bets: {} });
      if (!ok) return null;
      return { p: res.p, pick: res.p.indexOf(Math.max(...res.p)), vikt: res.vikt };
    },
    bet(v, pred, bok, pris) {
      if (pred.vikt < 100) return null;
      let best = null, bestEv = 0.07;
      const e = vantar.get(v.id);
      for (let i = 0; i < 3; i++) {
        const ev = pred.p[i] * pris[i] - 1;
        if (ev < 0.07 || ev > 0.40 || pris[i] > 5) continue;
        const k = nyckel(bok, i, pris[i]);
        e.bets[k] = pris[i];
        if (ev >= bestEv && !stangt(k)) { best = i; bestEv = ev; }
      }
      return best;
    },
    learn(m) {
      const e = vantar.get(m.id);
      vantar.delete(m.id);
      const y = { H: 0, D: 1, A: 2 }[m.result];
      if (e && n < KAP) {
        const off = n * ANTAL;
        for (let i = 0; i < ANTAL; i++) { X[off + i] = e.f[i]; sum[i] += e.f[i]; kv[i] += e.f[i] * e.f[i]; }
        Y[n] = y;
        senaste.push({ f: e.f, y, n, bas: e.bas });
        if (senaste.length > 800) senaste.shift();
        n++;
        for (const [k, odds] of Object.entries(e.bets)) {
          const i = Number(k.split('|')[1]);
          const s = roi.get(k) ?? [];
          s.push(i === y ? odds - 1 : -1);
          roi.set(k, s);
        }
      }
      const b = basLiga.get(m.league) ?? [46, 26, 28];
      b[y]++;
      basLiga.set(m.league, b);
      const sh = m.shots ?? {};
      const sotH = Number.isFinite(sh.homeSot) && Number.isFinite(sh.awaySot) ? sh.homeSot - sh.awaySot : 0;
      historia(m.home).push({ d: m.date, hemma: true, p: y === 0 ? 3 : y === 1 ? 1 : 0, gd: m.hg - m.ag, ga: m.ag, tot: m.hg + m.ag, sot: sotH });
      historia(m.away).push({ d: m.date, hemma: false, p: y === 2 ? 3 : y === 1 ? 1 : 0, gd: m.ag - m.hg, ga: m.hg, tot: m.hg + m.ag, sot: -sotH });
    },
  };
}
