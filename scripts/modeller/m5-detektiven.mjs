// Modell 5 "Detektiven": letar efter sprickor i marknaden, inte efter hur bra lagen är. Frågar: är bolagen oense
// (ett bolag sticker ut, Pinnacle mot snittet)? Stämmer 1X2-oddsen med målmarknaden? Har marknaden systematiskt
// haft fel om just det här laget på sistone? Utgår från snittoddsen och lär sig varje månad av sina egna matcher hur
// mycket varje spricka betyder (börjar på noll = samma som marknaden). Band som förlorat stängs tills de vänder.
import { utanMarginal } from './grund.mjs';

const MIN_EV = 0.04, MAX_EV = 0.25, MAX_ODDS = 8, ANTAL = 5;
const softmax = (s) => { const m = Math.max(...s); const e = s.map((x) => Math.exp(x - m)); const t = e[0] + e[1] + e[2]; return e.map((x) => x / t); };
const log = (a, b) => (a > 1 && b > 1 ? Math.log(a / b) : 0);
const underChans = (over, under) => (over > 1 && under > 1 ? (1 / under) / (1 / over + 1 / under) : null);

export function skapa() {
  const vikter = [0, 1, 2].map(() => new Array(ANTAL).fill(0));
  const hist = [], lagFel = new Map(), vantar = new Map(), roi = new Map();
  let manad = null;
  const felAv = (t) => {
    const s = lagFel.get(t);
    if (!s?.length) return 0;
    const u = s.slice(-10);
    return u.reduce((a, b) => a + b, 0) / u.length;
  };
  const sprickor = (v) => {
    const o = v.odds;
    const avg = [o.home, o.draw, o.away], max = [o.max_home, o.max_draw, o.max_away];
    const b3 = [o.b365_home, o.b365_draw, o.b365_away], pin = [o.pinnacle_home, o.pinnacle_draw, o.pinnacle_away];
    const under = underChans(o.over25, o.under25);
    const lagskillnad = felAv(v.home) - felAv(v.away);
    return [0, 1, 2].map((i) => [
      10 * log(max[i], avg[i]),
      10 * log(b3[i], avg[i]),
      10 * log(pin[i], avg[i]),
      under == null ? 0 : (under - 0.5) * (i === 1 ? 2 : -1),
      (i === 0 ? 1 : i === 2 ? -1 : 0) * lagskillnad,
    ]);
  };
  const rakna = (lp, x) => softmax(lp.map((l, i) => l + x[i].reduce((a, q, k) => a + q * vikter[i][k], 0)));
  const lar = () => {
    if (hist.length < 500) return;
    const r = hist.slice(-8000);
    for (let it = 0; it < 80; it++) {
      const g = [0, 1, 2].map(() => new Array(ANTAL).fill(0));
      for (const { lp, x, y } of r) {
        const p = rakna(lp, x);
        for (let i = 0; i < 3; i++) {
          const e = (y === i ? 1 : 0) - p[i];
          for (let k = 0; k < ANTAL; k++) g[i][k] += e * x[i][k];
        }
      }
      for (let i = 0; i < 3; i++) for (let k = 0; k < ANTAL; k++) vikter[i][k] += 0.3 * (g[i][k] / r.length - 0.01 * vikter[i][k]);
    }
  };
  const nyckel = (bok, i, o) => `${bok}|${i}|${o < 2 ? 'a' : o < 3 ? 'b' : o < 5 ? 'c' : 'd'}`;
  const stangt = (k) => {
    const s = roi.get(k);
    if (!s || s.length < 60) return false;
    const u = s.slice(-120);
    return u.reduce((a, b) => a + b, 0) / u.length < -0.10;
  };
  return {
    namn: 'M5 Detektiven',
    predict(v) {
      const m = v.date.slice(0, 7);
      if (m !== manad) { manad = m; lar(); }
      const o = v.odds ?? {};
      const p0 = utanMarginal([o.home, o.draw, o.away]);
      if (!p0) return null;
      const lp = p0.map(Math.log);
      const x = sprickor(v);
      const p = rakna(lp, x);
      vantar.set(v.id, { lp, x, p0, bets: {} });
      return { p, pick: p.indexOf(Math.max(...p)) };
    },
    bet(v, pred, bok, pris) {
      let best = null, bestEv = MIN_EV;
      const e = vantar.get(v.id);
      for (let i = 0; i < 3; i++) {
        const ev = pred.p[i] * pris[i] - 1;
        if (ev < MIN_EV || ev > MAX_EV || pris[i] > MAX_ODDS) continue;
        const k = nyckel(bok, i, pris[i]);
        e.bets[k] = pris[i];
        if (ev >= bestEv && !stangt(k)) { best = i; bestEv = ev; }
      }
      return best;
    },
    learn(m) {
      const e = vantar.get(m.id);
      vantar.delete(m.id);
      if (!e) return;
      const y = { H: 0, D: 1, A: 2 }[m.result];
      hist.push({ lp: e.lp, x: e.x, y });
      // Lagets poäng mot vad marknaden väntade sig
      const eH = 3 * e.p0[0] + e.p0[1], eA = 3 * e.p0[2] + e.p0[1];
      const pH = y === 0 ? 3 : y === 1 ? 1 : 0, pA = y === 2 ? 3 : y === 1 ? 1 : 0;
      for (const [t, d] of [[m.home, pH - eH], [m.away, pA - eA]]) {
        const s = lagFel.get(t) ?? [];
        s.push(d);
        lagFel.set(t, s);
      }
      for (const [k, odds] of Object.entries(e.bets)) {
        const i = Number(k.split('|')[1]);
        const s = roi.get(k) ?? [];
        s.push(i === y ? odds - 1 : -1);
        roi.set(k, s);
      }
    },
  };
}
