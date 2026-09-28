// Punkt-i-tid-signaler per match (bara data fore matchen) for lardomsanalysen och justeringsmodellen.
// Anvands av scripts/analyze-learnings.mjs, scripts/learnings-model.mjs och live (lagets nulage + inbordes).
import path from 'node:path';
import { UNDERSTAT, attachXg, loadMatches, root } from './learnings-data.mjs';
import { historicalMissing, findUsMatch, loadPlayerModel } from '../pro/players.mjs';

export const FORM_N = 8;     // senaste ligamatcherna for form/tur
export const H2H_YEARS = 8;
export const H2H_MIN = 3;
// Land per liga (lag byter liga inom landet) och niva inom landet (for uppflyttat/nedflyttat)
export const COUNTRY = { PL: 'ENG', CH: 'ENG', EL1: 'ENG', EL2: 'ENG', BL: 'GER', BL2: 'GER', LL: 'ESP', LL2: 'ESP', SA: 'ITA', SB: 'ITA' };
export const TIER = { PL: 1, CH: 2, EL1: 3, EL2: 4, BL: 1, BL2: 2, LL: 1, LL2: 2, SA: 1, SB: 2 };

export const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
export const pts = (gf, ga) => (gf > ga ? 3 : gf === ga ? 1 : 0);
export const expPts = (p) => 3 * p[0] + p[1];
export const teamKey = (league, team) => `${COUNTRY[league] ?? league}|${team}`;
export const pairKey = (a, b) => [a, b].sort().join('#');

function poisson(l, k) {
  let p = Math.exp(-l);
  for (let i = 1; i <= k; i++) p *= l / i;
  return p;
}
export function xPts(xgf, xga) {
  let w = 0, d = 0;
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) {
    const p = poisson(xgf, i) * poisson(xga, j);
    if (i > j) w += p; else if (i === j) d += p;
  }
  return 3 * w + d;
}

/** Lagets nulage ur historiken (senaste FORM_N ligamatcher). */
export function sideState(st, date) {
  const recent = (st?.hist ?? []).slice(-FORM_N);
  const xgRows = recent.filter((r) => r.xpts != null);
  return {
    rest: st?.last ? Math.round((Date.parse(date) - Date.parse(st.last)) / 864e5) : null,
    luck: xgRows.length >= 5 ? avg(xgRows.map((r) => r.pts - r.xpts)) : null,
    gap: xgRows.length >= 5 ? avg(xgRows.map((r) => (r.xgf - r.xga) - (r.gf - r.ga))) : null,
    mres: recent.length >= 5 ? avg(recent.map((r) => r.res)) : null,
  };
}

/** Inbordes moten fran hemmalagets perspektiv (bada planerna, senaste H2H_YEARS aren). */
export function h2hFeatures(meetings, hk, date) {
  const meet = (meetings ?? []).filter((x) => Date.parse(date) - Date.parse(x.date) < H2H_YEARS * 365.25 * 864e5);
  if (meet.length < H2H_MIN) return null;
  const persp = meet.map((x) => {
    const isHome = x.hk === hk;
    const gf = isHome ? x.hg : x.ag, ga = isHome ? x.ag : x.hg;
    const p = isHome ? x.close : [x.close[2], x.close[1], x.close[0]];
    return { pts: pts(gf, ga), opp: pts(ga, gf), exp: expPts(p), draw: gf === ga ? 1 : 0, pD: p[1] };
  });
  return {
    h2hN: meet.length,
    h2hRes: avg(persp.map((x) => x.pts - x.exp)),
    h2hPts: avg(persp.map((x) => x.pts - x.opp)),
    h2hDraw: avg(persp.map((x) => x.draw - x.pD)),
  };
}

/**
 * Laddar alla matcher och raknar signaler. Returnerar { matches, teamState, h2hState, seasonTeams, seasonsByLeague, proxy, xgStats, playerModel }.
 * m.f = signaler, m.y = hemmalagets poang minus stangningsoddsens forvantan, m.yD = kryss minus oddsens kryss,
 * m.yo = mot oppningsodds, m.mv = oddsrorelse (forvantade poang stangning - oppning).
 */
export function buildSignals({ players = true, log = console.log } = {}) {
  log('Laddar matcher ...');
  const matches = loadMatches();
  const xgStats = attachXg(matches);
  // Skott-proxy kalibrerad mot Understat-xG (topp 5): xG ~ a*(skott utanfor) + b*(skott pa mal)
  const proxy = (() => {
    let sxx = 0, sxy = 0, syy = 0, sx1 = 0, sy1 = 0, n = 0;
    for (const m of matches) {
      if (m.hxg == null || !Number.isFinite(m.hst) || !Number.isFinite(m.hs)) continue;
      for (const [sh, sot, g] of [[m.hs, m.hst, m.hxg], [m.as, m.ast, m.axg]]) {
        const x = sh - sot;
        sxx += x * x; sxy += x * sot; syy += sot * sot; sx1 += x * g; sy1 += sot * g; n++;
      }
    }
    const det = sxx * syy - sxy * sxy;
    return { off: (sx1 * syy - sy1 * sxy) / det, on: (sy1 * sxx - sx1 * sxy) / det, n };
  })();
  for (const m of matches) {
    if (m.hxg != null) { m.xg = [m.hxg, m.axg]; m.xgSrc = 'understat'; continue; }
    if (Number.isFinite(m.hst) && Number.isFinite(m.hs) && m.hs >= m.hst && m.as >= m.ast) {
      m.xg = [proxy.off * (m.hs - m.hst) + proxy.on * m.hst, proxy.off * (m.as - m.ast) + proxy.on * m.ast];
      m.xgSrc = 'skott';
    }
  }

  // Sasongsschema
  const seasonTeams = new Map();
  const teamSeasonCount = new Map();
  for (const m of matches) {
    const k = `${m.league}|${m.season}`;
    (seasonTeams.get(k) ?? seasonTeams.set(k, new Set()).get(k)).add(m.home).add(m.away);
    for (const t of [m.home, m.away]) teamSeasonCount.set(`${k}|${t}`, (teamSeasonCount.get(`${k}|${t}`) ?? 0) + 1);
  }
  const seasonsByLeague = {};
  for (const k of seasonTeams.keys()) {
    const [lg, s] = k.split('|');
    (seasonsByLeague[lg] ??= []).push(s);
  }
  for (const lg of Object.keys(seasonsByLeague)) seasonsByLeague[lg].sort();
  // Uppflyttad/nedflyttad: vilken liga spelade laget i forra sasongen (samma land)?
  const leagueOfTeamSeason = new Map();
  for (const [k, set] of seasonTeams) {
    const [lg, s] = k.split('|');
    for (const t of set) leagueOfTeamSeason.set(`${COUNTRY[lg] ?? lg}|${t}|${s.slice(0, 4)}`, lg);
  }
  const newStatus = (league, season, team) => {
    const prevYear = String(Number(season.slice(0, 4)) - 1);
    const prevLg = leagueOfTeamSeason.get(`${COUNTRY[league] ?? league}|${team}|${prevYear}`);
    if (prevLg === league) return null;
    if (!seasonsByLeague[league].some((s) => s.startsWith(prevYear))) return null; // okand forra sasong
    if (prevLg && TIER[prevLg] && TIER[league]) return TIER[prevLg] < TIER[league] ? 'ned' : 'upp';
    return 'upp';
  };

  log('Beräknar signaler ...');
  const teamState = new Map();
  const h2hState = new Map();
  const seasonIdx = new Map();
  for (const m of matches) {
    const hk = teamKey(m.league, m.home);
    const ak = teamKey(m.league, m.away);
    const sk = `${m.league}|${m.season}`;
    const f = {};
    const H = sideState(teamState.get(hk), m.date), A = sideState(teamState.get(ak), m.date);
    if (H.luck != null && A.luck != null) f.luck = H.luck - A.luck;
    if (H.gap != null && A.gap != null) f.gap = H.gap - A.gap;
    if (H.mres != null && A.mres != null) f.mres = H.mres - A.mres;
    if (H.rest != null && A.rest != null && H.rest <= 30 && A.rest <= 30) f.rest = Math.max(-7, Math.min(7, H.rest - A.rest));
    const pk = pairKey(hk, ak);
    Object.assign(f, h2hFeatures(h2hState.get(pk), hk, m.date) ?? {});
    const hi = (seasonIdx.get(`${sk}|${m.home}`) ?? 0) + 1;
    const ai = (seasonIdx.get(`${sk}|${m.away}`) ?? 0) + 1;
    seasonIdx.set(`${sk}|${m.home}`, hi);
    seasonIdx.set(`${sk}|${m.away}`, ai);
    const total = Math.max(teamSeasonCount.get(`${sk}|${m.home}`), teamSeasonCount.get(`${sk}|${m.away}`));
    f.early = Math.max(hi, ai) <= 5;
    f.late = Math.min(hi, ai) > total - 4 && total >= 20;
    if (hi <= 10) f.newH = newStatus(m.league, m.season, m.home);
    if (ai <= 10) f.newA = newStatus(m.league, m.season, m.away);
    // +1 = uppflyttat hemmalag / nedflyttat bortalag osv. Uppflyttade: -1 for laget
    f.promo = (f.newH === 'upp' ? 1 : 0) - (f.newA === 'upp' ? 1 : 0);
    f.releg = (f.newH === 'ned' ? 1 : 0) - (f.newA === 'ned' ? 1 : 0);
    // Marknadssignaler (kanda vid stangning): oddsrorelse, bolagssnitt mot Pinnacle, over/under-marknaden
    if (m.open && m.hasClose) f.steam = expPts(m.close) - expPts(m.open);
    if (m.pinClose && m.avgClose) f.book = expPts(m.avgClose) - expPts(m.pinClose);
    if (m.overClose != null) f.under = 1 - m.overClose;
    if (m.overOpen != null) f.underOpen = 1 - m.overOpen;
    m.f = f;
    m.y = pts(m.hg, m.ag) - expPts(m.close);
    m.yD = (m.res === 'D' ? 1 : 0) - m.close[1];
    if (m.open && m.hasClose) {
      m.yo = pts(m.hg, m.ag) - expPts(m.open);
      m.mv = expPts(m.close) - expPts(m.open);
    }
    for (const [key, gf, ga, xgf, xga, p] of [
      [hk, m.hg, m.ag, m.xg?.[0], m.xg?.[1], m.close],
      [ak, m.ag, m.hg, m.xg?.[1], m.xg?.[0], [m.close[2], m.close[1], m.close[0]]],
    ]) {
      const st = teamState.get(key) ?? teamState.set(key, { hist: [] }).get(key);
      st.hist.push({ date: m.date, pts: pts(gf, ga), gf, ga, xgf, xga, xpts: xgf != null ? xPts(xgf, xga) : null, res: pts(gf, ga) - expPts(p) });
      if (st.hist.length > 40) st.hist.shift();
      st.last = m.date;
      st.league = m.league;
    }
    (h2hState.get(pk) ?? h2hState.set(pk, []).get(pk)).push({ date: m.date, hk, hg: m.hg, ag: m.ag, close: m.close });
  }

  let playerModel = null;
  if (players) {
    log('Nyckelspelare ...');
    playerModel = loadPlayerModel(
      path.join(root, 'data', 'open', 'understat_league_matches.json'),
      path.join(root, 'data', 'open', 'understat_player_matches.json'),
      matches.filter((m) => UNDERSTAT.includes(m.league) && m.date >= '2024-07-01'),
    );
    let n = 0;
    if (playerModel) {
      for (const m of matches) {
        if (!UNDERSTAT.includes(m.league) || m.date < '2024-08-01') continue;
        const us = findUsMatch(playerModel, m.league, m.home, m.away, m.date);
        if (!us) continue;
        const mh = historicalMissing(playerModel, m.league, m.home, m.date, us.id);
        const ma = historicalMissing(playerModel, m.league, m.away, m.date, us.id);
        m.f.missH = mh.missingShare;
        m.f.missA = ma.missingShare;
        m.f.miss = mh.missingShare - ma.missingShare;
        m.missing = { home: mh.players, away: ma.players };
        n++;
      }
    }
    log(`  ${n} matcher med spelardata`);
  }
  return { matches, teamState, h2hState, seasonTeams, seasonsByLeague, proxy, xgStats, playerModel };
}
