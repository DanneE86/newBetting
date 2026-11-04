// Modell 2 "Oddsläsaren": vet ingenting om lag eller matcher, bara oddsen och hur oddsen brukar slå in.
// Tar bolagens snittodds utan marginal och lär sig varje månad hur de ska rättas per liga: exp(a[tecken] + b * log p),
// där b under 1 betyder att favoriter överskattas. Ligan krymps mot helheten. Lär sig av egna spel: oddsband som
// förlorat pausas, men följs vidare i skuggan och släpps på igen när de vänder.
import { utanMarginal } from './grund.mjs';

const MIN_EV = 0.03, MAX_EV = 0.25, MAX_ODDS = 8;
const softmax = (s) => { const m = Math.max(...s); const e = s.map((x) => Math.exp(x - m)); const t = e[0] + e[1] + e[2]; return e.map((x) => x / t); };
const BAS = () => ({ a: [0, 0, 0], b: 1 });
const rakna = (t, lp) => softmax(lp.map((x, i) => t.a[i] + t.b * x));

function anpassa(rader, start, krymp) {
  const t = { a: [...start.a], b: start.b };
  if (rader.length < 50) return t;
  const n = rader.length;
  for (let it = 0; it < 120; it++) {
    const ga = [0, 0, 0]; let gb = 0;
    for (const r of rader) {
      const p = rakna(t, r.lp);
      for (let i = 0; i < 3; i++) { const e = (r.y === i ? 1 : 0) - p[i]; ga[i] += e; gb += e * r.lp[i]; }
    }
    for (let i = 0; i < 3; i++) t.a[i] += 0.4 * (ga[i] - krymp * (t.a[i] - start.a[i])) / n;
    t.b += 0.15 * (gb - krymp * (t.b - start.b)) / n;
    const mean = (t.a[0] + t.a[1] + t.a[2]) / 3;
    t.a = t.a.map((x) => x - mean);
  }
  return t;
}

export function skapa() {
  const hist = [], skugga = new Map(), egna = new Map(), liga = new Map();
  let manad = null, global = BAS();
  const band = (i, o) => `${i}|${o < 2 ? 'a' : o < 3 ? 'b' : o < 5 ? 'c' : 'd'}`;
  const pausad = (bok, k) => {
    const s = skugga.get(`${bok}|${k}`);
    if (!s || s.length < 60) return false;
    const u = s.slice(-120);
    return u.reduce((a, b) => a + b, 0) / u.length < -0.10;
  };
  return {
    namn: 'M2 Oddsläsaren',
    predict(v) {
      const o = v.odds ?? {};
      const p0 = utanMarginal([o.home, o.draw, o.away]);
      if (!p0) return null;
      const m = v.date.slice(0, 7);
      if (m !== manad) {
        manad = m;
        global = anpassa(hist, BAS(), 5);
        const per = {};
        for (const r of hist) (per[r.league] ??= []).push(r);
        for (const [l, rader] of Object.entries(per)) liga.set(l, anpassa(rader, global, 150));
      }
      const t = liga.get(v.league) ?? global;
      const lp = p0.map(Math.log);
      const p = rakna(t, lp);
      egna.set(v.id, { lp, league: v.league, bets: {} });
      return { p, pick: p.indexOf(Math.max(...p)) };
    },
    bet(v, pred, bok, pris) {
      let best = null, bestEv = MIN_EV;
      const e = egna.get(v.id);
      for (let i = 0; i < 3; i++) {
        const ev = pred.p[i] * pris[i] - 1;
        if (ev < MIN_EV || ev > MAX_EV || pris[i] > MAX_ODDS) continue;
        e.bets[`${bok}|${i}`] = pris[i];
        if (ev >= bestEv && !pausad(bok, band(i, pris[i]))) { best = i; bestEv = ev; }
      }
      return best;
    },
    learn(m) {
      const e = egna.get(m.id);
      if (!e) return;
      const y = { H: 0, D: 1, A: 2 }[m.result];
      hist.push({ lp: e.lp, league: e.league, y });
      // Skuggfacit: alla tecken över EV-gränsen, oavsett om bandet var pausat
      for (const [k, odds] of Object.entries(e.bets)) {
        const [bok, i] = k.split('|');
        const nyckel = `${bok}|${band(Number(i), odds)}`;
        const s = skugga.get(nyckel) ?? [];
        s.push(Number(i) === y ? odds - 1 : -1);
        skugga.set(nyckel, s);
      }
      egna.delete(m.id);
    },
  };
}
