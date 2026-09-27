// Pro-lager: rena funktioner (devig, Dixon-Coles, Kelly, RPS, CLV).
// Bakgrund: docs/krav/01-proffs-research.md

const DAY_MS = 86_400_000;

export function toDate(d) {
  return new Date(`${String(d).slice(0, 10)}T00:00:00Z`);
}

export function daysBetween(a, b) {
  return Math.round((toDate(b) - toDate(a)) / DAY_MS);
}

// ---------- Devig ----------

export function overround(odds) {
  return odds.reduce((s, o) => s + 1 / o, 0) - 1;
}

/**
 * Skarpt facit (Pinnacle, annars Betfair Exchange) - men bara om 1X2-priserna ar rimliga.
 * Illikvida borsmarknader ger t.ex. 1.13/1.18/1.15 (summa 260 %) -> devig 33/33/33 och falska vardespel.
 * Krav: marginal mellan -2 % och +12 %, och ingen utfallschans mer an 12 pp fran bolagssnittet.
 */
export function findSharpBook(books) {
  const others = books.filter((b) => !/pinnacle|^betfair_ex/i.test(b.key));
  const avg = (() => {
    const ps = others.map((b) => devigMultiplicative([b.home, b.draw, b.away])).filter(Boolean);
    return ps.length >= 3 ? [0, 1, 2].map((i) => ps.reduce((s, p) => s + p[i], 0) / ps.length) : null;
  })();
  const ok = (b) => {
    const odds = [b.home, b.draw, b.away];
    if (!validOdds(odds)) return false;
    const or = overround(odds);
    if (or < -0.02 || or > 0.12) return false;
    const f = devigMultiplicative(odds);
    return !avg || f.every((p, i) => Math.abs(p - avg[i]) <= 0.12);
  };
  return books.find((b) => /pinnacle/i.test(`${b.key} ${b.bookmaker}`) && ok(b))
    ?? books.find((b) => /^betfair_ex/.test(b.key) && ok(b))
    ?? null;
}

/** Multiplicative (proportionell) devig. Basta RPS i PL 24/25 enligt penaltyblog. */
export function devigMultiplicative(odds) {
  if (!validOdds(odds)) return null;
  const inv = odds.map((o) => 1 / o);
  const sum = inv.reduce((s, x) => s + x, 0);
  return inv.map((x) => x / sum);
}

/** Power-devig: hitta k sa att sum((1/o)^k) = 1. Hanterar favorit-longshot-bias. */
export function devigPower(odds) {
  if (!validOdds(odds)) return null;
  const inv = odds.map((o) => 1 / o);
  let lo = 0.01;
  let hi = 10;
  for (let i = 0; i < 100; i++) {
    const k = (lo + hi) / 2;
    const s = inv.reduce((acc, x) => acc + x ** k, 0);
    if (s > 1) lo = k;
    else hi = k;
  }
  const k = (lo + hi) / 2;
  const p = inv.map((x) => x ** k);
  const sum = p.reduce((s, x) => s + x, 0);
  return p.map((x) => x / sum);
}

export function validOdds(odds) {
  return Array.isArray(odds) && odds.length >= 2 && odds.every((o) => typeof o === 'number' && o > 1.001);
}

// ---------- Staking ----------

/** Fraktionell Kelly som andel av bankrulle, med tak. */
export function kellyStake(p, odds, fraction = 0.25, cap = 0.02) {
  if (!(odds > 1) || !(p > 0)) return 0;
  const full = (p * odds - 1) / (odds - 1);
  if (full <= 0) return 0;
  return Math.min(cap, full * fraction);
}

// ---------- Utvardering ----------

/** Ranked Probability Score for 1X2 (ordning H, D, A). Lagre = battre. */
export function rps1x2(p, result) {
  const o = result === 'H' ? [1, 0, 0] : result === 'D' ? [0, 1, 0] : [0, 0, 1];
  const c1 = p[0] - o[0];
  const c2 = p[0] + p[1] - o[0] - o[1];
  return 0.5 * (c1 * c1 + c2 * c2);
}

export function brier(p, happened) {
  const d = p - (happened ? 1 : 0);
  return d * d;
}

/** CLV = tagna odds mot fair closing-odds (devig:ad). 0.05 = slog stangningen med 5 %. */
export function clv(oddsTaken, fairCloseProb) {
  if (!(oddsTaken > 1) || !(fairCloseProb > 0)) return null;
  return oddsTaken * fairCloseProb - 1;
}

// ---------- Dixon-Coles ----------

function poissonPmf(k, lambda) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-lambda) * lambda ** k) / f;
}

function tau(x, y, lambda, mu, rho) {
  if (x === 0 && y === 0) return 1 - lambda * mu * rho;
  if (x === 0 && y === 1) return 1 + lambda * rho;
  if (x === 1 && y === 0) return 1 + mu * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

/**
 * Viktad Poisson-anpassning (attack/forsvar/hemmafordel) med exponentiell tidsdecay,
 * foljt av grid search for Dixon-Coles rho.
 * matches: [{date, home, away, hg, ag}] - bara matcher fore refDate anvands.
 */
export function fitDixonColes(matches, refDate, opts = {}) {
  const xi = opts.xi ?? 0.0025; // halveringstid ~ 277 dagar
  const maxDays = opts.maxDays ?? 900;
  const shrink = opts.shrink ?? 2; // pseudo-matcher mot ligasnitt
  const iterations = opts.iterations ?? 60;

  const train = [];
  for (const m of matches) {
    const age = daysBetween(m.date, refDate);
    if (age <= 0 || age > maxDays) continue;
    train.push({ ...m, w: Math.exp(-xi * age) });
  }
  if (train.length < 50) return null;

  const teams = new Set();
  for (const m of train) {
    teams.add(m.home);
    teams.add(m.away);
  }
  const att = new Map([...teams].map((t) => [t, 1]));
  const def = new Map([...teams].map((t) => [t, 1]));
  let gamma = 1.3;

  for (let it = 0; it < iterations; it++) {
    const numA = new Map();
    const denA = new Map();
    for (const m of train) {
      add(numA, m.home, m.w * m.hg);
      add(denA, m.home, m.w * def.get(m.away) * gamma);
      add(numA, m.away, m.w * m.ag);
      add(denA, m.away, m.w * def.get(m.home));
    }
    for (const t of teams) att.set(t, ((numA.get(t) ?? 0) + shrink) / ((denA.get(t) ?? 0) + shrink));
    const meanA = [...att.values()].reduce((s, x) => s + x, 0) / teams.size;
    for (const t of teams) {
      att.set(t, att.get(t) / meanA);
      def.set(t, def.get(t) * meanA);
    }

    const numD = new Map();
    const denD = new Map();
    for (const m of train) {
      add(numD, m.away, m.w * m.hg);
      add(denD, m.away, m.w * att.get(m.home) * gamma);
      add(numD, m.home, m.w * m.ag);
      add(denD, m.home, m.w * att.get(m.away));
    }
    // Forsvar skalas mot ligans snitt-mal sa shrink drar mot "genomsnittligt lag"
    const avgGoals = train.reduce((s, m) => s + m.w * (m.hg + m.ag), 0) / (2 * train.reduce((s, m) => s + m.w, 0));
    for (const t of teams) {
      def.set(t, ((numD.get(t) ?? 0) + shrink * avgGoals) / ((denD.get(t) ?? 0) + shrink));
    }

    let gNum = 0;
    let gDen = 0;
    for (const m of train) {
      gNum += m.w * m.hg;
      gDen += m.w * att.get(m.home) * def.get(m.away);
    }
    gamma = gNum / gDen;
  }

  // rho: bara tau-termen beror pa rho nar lambda/mu ar fixa
  let bestRho = 0;
  let bestLl = -Infinity;
  for (let r = -0.25; r <= 0.1501; r += 0.01) {
    let ll = 0;
    let ok = true;
    for (const m of train) {
      if (m.hg > 1 || m.ag > 1) continue;
      const lambda = att.get(m.home) * def.get(m.away) * gamma;
      const mu = att.get(m.away) * def.get(m.home);
      const t = tau(m.hg, m.ag, lambda, mu, r);
      if (t <= 0) {
        ok = false;
        break;
      }
      ll += m.w * Math.log(t);
    }
    if (ok && ll > bestLl) {
      bestLl = ll;
      bestRho = Math.round(r * 100) / 100;
    }
  }

  return { att, def, gamma, rho: bestRho, trainCount: train.length, refDate };
}

function add(map, k, v) {
  map.set(k, (map.get(k) ?? 0) + v);
}

/**
 * Sannolikheter for en match ur resultatmatrisen. Okanda lag = ligasnitt.
 * adj.home/adj.away skalar lagens forvantade mal (t.ex. franvarande spelare).
 */
export function predictDixonColes(model, home, away, maxGoals = 10, adj = {}) {
  const aH = model.att.get(home) ?? 1;
  const dH = model.def.get(home) ?? avgOf(model.def);
  const aA = model.att.get(away) ?? 1;
  const dA = model.def.get(away) ?? avgOf(model.def);
  const lambda = aH * dA * model.gamma * (adj.home ?? 1);
  const mu = aA * dH * (adj.away ?? 1);

  let pH = 0, pD = 0, pA = 0, pOver = 0, pBtts = 0, total = 0;
  for (let x = 0; x <= maxGoals; x++) {
    const px = poissonPmf(x, lambda);
    for (let y = 0; y <= maxGoals; y++) {
      const p = px * poissonPmf(y, mu) * tau(x, y, lambda, mu, model.rho);
      total += p;
      if (x > y) pH += p;
      else if (x === y) pD += p;
      else pA += p;
      if (x + y >= 3) pOver += p;
      if (x >= 1 && y >= 1) pBtts += p;
    }
  }
  return {
    home: pH / total,
    draw: pD / total,
    away: pA / total,
    over25: pOver / total,
    btts: pBtts / total,
    lambdaHome: lambda,
    lambdaAway: mu,
    knownTeams: model.att.has(home) && model.att.has(away),
  };
}

function avgOf(map) {
  const v = [...map.values()];
  return v.reduce((s, x) => s + x, 0) / v.length;
}

export function round(x, d = 4) {
  if (x === null || x === undefined || Number.isNaN(x)) return null;
  const f = 10 ** d;
  return Math.round(x * f) / f;
}
