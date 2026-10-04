// Antal kort (över/under) som på Oddset: gula + röda för båda lagen, linjerna 3.5 / 4.5 / 5.5.
// Indata = domarmatcherna från loadRefereeMatches ({ d, lg, h, a, r, hy, ay, hr, ar }).
// Förväntat antal = ligans snitt x lagets egna kort x motståndarens "framkallade" kort x domarens nivå,
// allt krympt mot ligasnittet. Fördelning: negativ binomial (kort sprider mer än Poisson).
// Ligans nivå har kort minne (kortnivån flyttar sig mellan säsonger), lagens och domarens profil längre minne
// och mäts relativt ligasnittet med samma vikt.

export const CARD_LINES = [3.5, 4.5, 5.5];
export const CARD_CFG = {
  windowDays: 730, // två säsonger bakåt
  halfLifeDays: 300, // lag och domare: nyare matcher väger tyngre
  leagueHalfLifeDays: 30, // ligans kortnivå (backtest 2025-07 till 2026-10: 30 dgr bäst)
  teamK: 8, // krympning mot ligasnitt (vägda matcher)
  refK: 12,
  minTeamN: 3, // färre matcher för något av lagen -> inget tips
  minLeagueN: 80,
  // FotMob slutade rapportera kort i AR/BR/BR2/COL/MX 2025 och skriver 0 i stället (kontroll 2026-10-04:
  // 65-88 % nollor mot 0-8 % annars, och de få korten som finns är ofullständiga). En liga-månad med fler
  // nollor än så räknas som saknad; en månad med för få matcher ärver förra månadens status.
  maxZeroShare: 0.25,
  minMonthN: 8,
};

const DAY = 86400000;
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const round = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
export const cardsOf = (m, side) => (side === 'h' ? m.hy + (m.hr || 0) : m.ay + (m.ar || 0));
const hasCards = (m) => Number.isFinite(m.hy) && Number.isFinite(m.ay);
const isZero = (m) => cardsOf(m, 'h') + cardsOf(m, 'a') === 0;

/** Liga-månader utan riktig kortdata ("PL|2026-09"). */
export function brokenCardMonths(rows, cfg = CARD_CFG) {
  const months = new Map();
  for (const m of rows || []) {
    if (!hasCards(m) || !m.d) continue;
    const k = `${m.lg}|${m.d.slice(0, 7)}`;
    const b = months.get(k) ?? { n: 0, z: 0 };
    b.n++; if (isZero(m)) b.z++;
    months.set(k, b);
  }
  const broken = new Set();
  let prev = null;
  for (const [k, b] of [...months].sort(([a], [c]) => a.localeCompare(c))) {
    const lg = k.split('|')[0];
    const bad = b.n >= cfg.minMonthN ? b.z / b.n > cfg.maxZeroShare : prev?.lg === lg && prev.bad;
    if (bad) broken.add(k);
    prev = { lg, bad };
  }
  return broken;
}

/** Matcher med användbara kort (trasiga liga-månader bort). */
export function usableCardRows(rows, cfg = CARD_CFG) {
  const broken = brokenCardMonths(rows, cfg);
  return (rows || []).filter((m) => hasCards(m) && m.d && !broken.has(`${m.lg}|${m.d.slice(0, 7)}`));
}

/** Index över lag, domare och liga med tidsvikt, bara matcher före asOf. */
export function buildCardIndex(rows, asOf, cfg = CARD_CFG, { refKey = (r) => r } = {}) {
  const leagues = new Map();
  const L = (lg) => {
    if (!leagues.has(lg)) leagues.set(lg, { w: 0, home: 0, away: 0, wS: 0, homeS: 0, awayS: 0, sqS: 0, n: 0, last: null, teams: new Map(), refs: new Map() });
    return leagues.get(lg);
  };
  for (const m of usableCardRows(rows, cfg)) {
    if (m.d >= asOf) continue;
    const age = daysBetween(m.d, asOf);
    if (age > cfg.windowDays) continue;
    const w = 0.5 ** (age / cfg.halfLifeDays);
    const ch = cardsOf(m, 'h'), ca = cardsOf(m, 'a'), tot = ch + ca;
    const lg = L(m.lg);
    const wS = 0.5 ** (age / cfg.leagueHalfLifeDays);
    lg.w += w; lg.home += w * ch; lg.away += w * ca; lg.n++;
    if (!lg.last || m.d > lg.last) lg.last = m.d;
    lg.wS += wS; lg.homeS += wS * ch; lg.awayS += wS * ca; lg.sqS += wS * tot * tot;
    for (const [team, own, drawn] of [[m.h, ch, ca], [m.a, ca, ch]]) {
      const t = lg.teams.get(team) ?? { w: 0, own: 0, drawn: 0, n: 0 };
      t.w += w; t.own += w * own; t.drawn += w * drawn; t.n++;
      lg.teams.set(team, t);
    }
    const rk = m.r && refKey(m.r);
    if (rk) {
      const r = lg.refs.get(rk) ?? { w: 0, tot: 0, n: 0 };
      r.w += w; r.tot += w * tot; r.n++;
      lg.refs.set(rk, r);
    }
  }
  return { asOf, cfg, leagues, refKey };
}

/** Ligans snitt (hemma/borta/totalt) och spridning (negativ binomial r, null = Poisson). */
export function leagueCardStats(index, league) {
  const lg = index.leagues.get(league);
  if (!lg || lg.n < index.cfg.minLeagueN) return null;
  const home = lg.homeS / lg.wS, away = lg.awayS / lg.wS, mu = home + away;
  const variance = lg.sqS / lg.wS - mu * mu;
  // longTotal = snittet med lagens vikt, som lagens och domarens kvoter mäts mot
  return { n: lg.n, last: lg.last, home, away, total: mu, longTotal: (lg.home + lg.away) / lg.w, variance, dispersion: variance > mu ? (mu * mu) / (variance - mu) : null };
}

/** P(X > line) för negativ binomial med medel mu och r (r = null -> Poisson). */
export function probOver(mu, line, r = null) {
  const k = Math.floor(line);
  let cdf = 0;
  if (r == null || !Number.isFinite(r) || r > 1e6) {
    let p = Math.exp(-mu);
    for (let i = 0; i <= k; i++) { cdf += p; p *= mu / (i + 1); }
  } else {
    const q = r / (r + mu); // P(0) = q^r
    let p = Math.pow(q, r);
    for (let i = 0; i <= k; i++) { cdf += p; p *= ((i + r) / (i + 1)) * (1 - q); }
  }
  return Math.min(1, Math.max(0, 1 - cdf));
}

const shrink = (sum, w, prior, k) => (sum + k * prior) / (w + k);

/**
 * Båda lagen får kort: P(hemma >= 1) x P(borta >= 1) med P(0 kort) = e^(-k x lambda). Ett lag går mer sällan
 * kortlöst än Poisson säger (k = 1 gav 73 % Ja mot verkliga 78 %). k anpassat på 2024/25 och testat på
 * 2025/26-2026/10 (10 281 matcher): 77,4 % mot 77,9 %, log-loss 0,502 mot 0,508 (k = 1) och 0,517 (bara ligan).
 */
export const BOTH_K = 1.1;
export function probBothCards(lamH, lamA, k = BOTH_K) {
  return (1 - Math.exp(-k * lamH)) * (1 - Math.exp(-k * lamA));
}

/**
 * Förväntade kort för en match. Lagen måste finnas i ligan (namn som i domardatan, resolveName mappar).
 * Returnerar null om data saknas, annars lambda per lag, domarfaktor och P(över) för varje linje.
 */
export function predictCards(index, { league, home, away, referee = null }, { resolveName = (n) => n, lines = CARD_LINES } = {}) {
  const ls = leagueCardStats(index, league);
  if (!ls) return null;
  const lg = index.leagues.get(league);
  const teams = [...lg.teams.keys()];
  const th = resolveName(home, teams), ta = resolveName(away, teams);
  const H = th && lg.teams.get(th), A = ta && lg.teams.get(ta);
  const cfg = index.cfg;
  if (!H || !A || H.n < cfg.minTeamN || A.n < cfg.minTeamN) return null;
  const perTeam = ls.longTotal / 2;
  const ownH = shrink(H.own, H.w, perTeam, cfg.teamK) / perTeam;
  const drawnH = shrink(H.drawn, H.w, perTeam, cfg.teamK) / perTeam;
  const ownA = shrink(A.own, A.w, perTeam, cfg.teamK) / perTeam;
  const drawnA = shrink(A.drawn, A.w, perTeam, cfg.teamK) / perTeam;
  const lamH = ls.home * ownH * drawnA;
  const lamA = ls.away * ownA * drawnH;
  let refFactor = 1, ref = null;
  const R = referee ? lg.refs.get(index.refKey(referee)) : null;
  if (R) {
    refFactor = shrink(R.tot, R.w, ls.longTotal, cfg.refK) / ls.longTotal;
    ref = { name: referee, matches: R.n, cardsPg: round(R.tot / R.w, 2), factor: round(refFactor, 3) };
  }
  const exp = (lamH + lamA) * refFactor;
  const pOver = Object.fromEntries(lines.map((l) => [String(l), round(probOver(exp, l, ls.dispersion))]));
  const pBoth = round(probBothCards(lamH * refFactor, lamA * refFactor));
  return {
    expCards: round(exp, 2), lambdaHome: round(lamH * refFactor, 2), lambdaAway: round(lamA * refFactor, 2),
    leagueAvg: round(ls.total, 2), dataTo: ls.last, referee: ref, dispersion: ls.dispersion == null ? null : round(ls.dispersion, 2), pOver, pBoth,
  };
}

/** Linjen att tippa: den där modellens chans ligger närmast 50 % (jämnast odds, som på Oddset). */
export function pickCardLine(pred) {
  if (!pred) return null;
  let best = null;
  for (const [line, p] of Object.entries(pred.pOver)) {
    if (!best || Math.abs(p - 0.5) < Math.abs(best.p - 0.5)) best = { line: Number(line), p };
  }
  const over = best.p >= 0.5;
  return { line: best.line, pick: `${over ? 'OVER' : 'UNDER'} ${best.line}`, pOver: best.p, confidence: round(over ? best.p : 1 - best.p) };
}

/** Facit: OVER/UNDER för linjen ur gula+röda (null om korten saknas). */
export function cardsOutcome(m, line) {
  if (!hasCards(m)) return null;
  const tot = cardsOf(m, 'h') + cardsOf(m, 'a');
  return { total: tot, result: `${tot > line ? 'OVER' : 'UNDER'} ${line}` };
}
