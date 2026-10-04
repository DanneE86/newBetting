// Hoghojd: arenans hojd over havet (meter, ungefar) per lag i ligor med arenor pa hog hojd, och hur lag klarar
// bortamatcher pa hoghojd. Anvands av scripts/analyze-learnings.mjs (lagfiler och ligafiler).
// Lag som saknas i en liga raknas som lag hojd (DEFAULT_LOW).

export const HIGH = 1500;      // arena pa hoghojd
export const MIN_DIFF = 1000;  // bortalaget kommer fran minst sa mycket lagre
export const DEFAULT_LOW = 200;

export const ALTITUDE = {
  MX: {
    Toluca: 2660, Pachuca: 2400, 'UNAM Pumas': 2300, 'Club America': 2240, 'Cruz Azul': 2240, Puebla: 2135, 'Lobos BUAP': 2135,
    Monarcas: 1920, Necaxa: 1880, 'Atl. San Luis': 1860, Queretaro: 1820, 'Club Leon': 1815, 'Guadalajara Chivas': 1560, Atlas: 1560,
    'Leones Negros': 1560, Juarez: 1140, 'Santos Laguna': 1120, Monterrey: 540, 'Tigres UANL': 510, Chiapas: 530, 'Club Tijuana': 100,
    'Dorados de Sinaloa': 60, Atlante: 10, 'Mazatlan FC': 10, Veracruz: 10,
  },
  COL: {
    'Boyacá Chicó FC': 2810, 'Independiente Santa Fe': 2640, Millonarios: 2640, 'Internacional de Bogotá': 2640, 'Fortaleza CEIF': 2640,
    'Deportivo Pasto': 2530, 'Once Caldas': 2150, 'Águilas Doradas': 2100, 'Envigado FC': 1575, 'Atlético Nacional': 1495,
    'Independiente Medellín': 1495, 'Deportivo Pereira': 1410, 'Deportes Tolima': 1250, 'América de Cali': 1000, 'Deportivo Cali': 1000,
    'Atlético Bucaramanga': 960, 'Llaneros FC': 470, 'Cúcuta Deportivo': 320, 'Alianza FC': 170, 'Atlético Junior': 20,
    'Jaguares de Córdoba': 20, 'Unión Magdalena': 10,
  },
  MLS: { 'Colorado Rapids': 1610, 'Real Salt Lake': 1300 },
};

export const altitudeOf = (league, team) => ALTITUDE[league]?.[team] ?? DEFAULT_LOW;
/** Bortalag fran lag hojd pa en arena pa hoghojd? */
export const isAltitudeGame = (league, home, away) => {
  const h = altitudeOf(league, home), a = altitudeOf(league, away);
  return h >= HIGH && h - a >= MIN_DIFF;
};

/**
 * Matcher { home, away, hg, ag, pH?, pD?, pA? } (pH/pD/pA = stangningsoddsens sannolikheter, kan saknas) ->
 *   league: hemmalaget i hoghojdsmatcher mot ovriga hemmamatcher (poang och mot marknaden)
 *   away[lag]: lagets bortamatcher pa hoghojd mot ovriga bortamatcher
 *   home[lag]: hoghojdslagets hemmamatcher mot lagland-lag mot ovriga hemmamatcher
 */
export function altitudeStats(league, matches) {
  const acc = () => ({ n: 0, pts: 0, res: 0, nRes: 0, w: 0, d: 0, l: 0 });
  const add = (a, gf, ga, exp) => {
    const p = gf > ga ? 3 : gf === ga ? 1 : 0;
    a.n++; a.pts += p; if (p === 3) a.w++; else if (p === 1) a.d++; else a.l++;
    if (Number.isFinite(exp)) { a.res += p - exp; a.nRes++; }
  };
  const fin = (a) => (a.n ? { n: a.n, w: a.w, d: a.d, l: a.l, ppg: a.pts / a.n, res: a.nRes ? a.res / a.nRes : null, nRes: a.nRes } : null);
  const lg = { alt: acc(), other: acc() };
  const away = {}, home = {};
  for (const m of matches) {
    const alt = isAltitudeGame(league, m.home, m.away);
    const eH = Number.isFinite(m.pH) ? 3 * m.pH + m.pD : NaN, eA = Number.isFinite(m.pA) ? 3 * m.pA + m.pD : NaN;
    add(alt ? lg.alt : lg.other, m.hg, m.ag, eH);
    const aw = (away[m.away] ??= { alt: acc(), other: acc() });
    add(alt ? aw.alt : aw.other, m.ag, m.hg, eA);
    if (altitudeOf(league, m.home) >= HIGH) {
      const hm = (home[m.home] ??= { alt: acc(), other: acc() });
      add(alt ? hm.alt : hm.other, m.hg, m.ag, eH);
    }
  }
  const map = (o) => Object.fromEntries(Object.entries(o).map(([t, v]) => [t, { alt: fin(v.alt), other: fin(v.other) }]));
  return { league: { alt: fin(lg.alt), other: fin(lg.other) }, away: map(away), home: map(home) };
}

/** Lag med svarast bortamatcher pa hoghojd: minst minN sadana matcher, sorterat pa poang per match mot ovriga bortamatcher. */
export function hardestAtAltitude(stats, { minN = 6 } = {}) {
  return Object.entries(stats.away)
    .filter(([, v]) => v.alt?.n >= minN && v.other?.n)
    .map(([team, v]) => ({ team, ...v, diff: v.alt.ppg - v.other.ppg, resDiff: v.alt.res != null && v.other.res != null ? v.alt.res - v.other.res : null }))
    .sort((a, b) => a.diff - b.diff);
}

// Hemmalagets logit i hoghojdsmatcher: logit_H + b/2, logit_B - b/2 (samma form som learned-adjust)
export function altitudeShift(p, b) {
  const l = [Math.log(Math.max(1e-6, p[0])) + b / 2, Math.log(Math.max(1e-6, p[1])), Math.log(Math.max(1e-6, p[2])) - b / 2];
  const mx = Math.max(...l);
  const e = l.map((x) => Math.exp(x - mx));
  const z = e[0] + e[1] + e[2];
  return e.map((x) => x / z);
}

/**
 * Skattar b (rutnat -0,5..1) pa matcher fore split och mater EN gang efter: rows { date, y (0/1/2), p [H,D,A], alt (bool) }.
 * dLL = andring i logloss per match i kontrollen (negativ = battre), z over hoghojdsmatcherna.
 */
export function fitAltitude(rows, split) {
  const ll = (m, b) => -Math.log(Math.max(1e-9, (m.alt ? altitudeShift(m.p, b) : m.p)[m.y]));
  const fitB = (rs) => {
    let best = 0, bl = Infinity;
    for (let i = -50; i <= 100; i++) {
      const b = i / 100;
      let v = 0;
      for (const m of rs) if (m.alt) v += ll(m, b);
      if (v < bl) { bl = v; best = b; }
    }
    return best;
  };
  const tr = rows.filter((m) => m.date < split), te = rows.filter((m) => m.date >= split);
  const b = fitB(tr);
  const d = te.filter((m) => m.alt).map((m) => ll(m, b) - ll(m, 0));
  const mean = d.length ? d.reduce((a, x) => a + x, 0) / d.length : 0;
  const sd = d.length > 1 ? Math.sqrt(d.reduce((a, x) => a + (x - mean) ** 2, 0) / (d.length - 1)) : 0;
  return {
    bTrain: b, bAll: fitB(rows),
    test: { n: te.length, nAlt: d.length, dLL: te.length ? d.reduce((a, x) => a + x, 0) / te.length : 0, z: sd > 0 ? mean / (sd / Math.sqrt(d.length)) : 0 },
  };
}
