// Modell 1 "Nuvarande": dagens motor så nära det går att köra om den bakåt.
// Tips: Dixon-Coles på mål+xG per liga (samma kod och parametrar som pro-lagret, omräknad per vecka), 50/50 med
// grundmodellen där den har sparade rader (från 2026-01-27), kryssregeln pick1x2. Inga odds i tipset.
// Värde: som live - skarpt pris utan marginal som facit mot priset man får, tak och EV-spärr som i CONFIG.
// Lär sig inte av sina spel: den ska vara som nu.
import fs from 'node:fs';
import path from 'node:path';
import { betBlock, predictDixonColes } from '../pro/lib.mjs';
import { buildTiers, fitLeagueModel, paramsFor } from '../pro/league-models.mjs';
import { pick1x2 } from '../lib/pick-1x2.mjs';
import { utanMarginal } from './grund.mjs';

const MIN_EV = 0.03, MIN_EV_SNITT = 0.05, MAX_ODDS = 5, MAX_ODDS_SNITT = 3.5, MAX_EV = 0.25, DC_VIKT = 0.5;
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

const veckostart = (date) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

export function skapa({ root } = {}) {
  const fil = (...p) => (root && fs.existsSync(path.join(root, ...p)) ? readJson(path.join(root, ...p)) : null);
  const ligaModeller = fil('config', 'league-models.json') ?? { defaults: { xi: 0.0025, shrink: 2, prior: false, drawK: 1, xgW: 0.5 }, leagues: {} };
  const tiers = buildTiers(fil('config', 'leagues.json') ?? { leagues: {} });
  const grund = new Map((fil('data', 'reports', 'base-backtest.json')?.rows ?? []).map((r) => [`${r.date}|${r.league}|${r.home}|${r.away}`, r.cal]));
  const perLiga = {};
  const cache = new Map();

  const lagmodell = (v) => {
    const k = `${v.league}|${veckostart(v.date)}`;
    const c = cache.get(k);
    if (c && c.lag.has(v.home) && c.lag.has(v.away)) return c.model;
    const lista = perLiga[v.league] ?? [];
    const lag = new Set([v.home, v.away]);
    for (const m of lista) { lag.add(m.home); lag.add(m.away); }
    const model = lista.length
      ? fitLeagueModel(lista, veckostart(v.date), paramsFor(ligaModeller, v.league), { league: v.league, byLeague: perLiga, tiers, teams: [...lag] })
      : null;
    cache.set(k, { model, lag });
    return model;
  };

  return {
    namn: 'M1 Nuvarande',
    predict(v) {
      const model = lagmodell(v);
      if (!model) return null;
      const dc = predictDixonColes(model, v.home, v.away);
      if (!dc || !Number.isFinite(dc.home)) return null;
      const st = grund.get(`${v.date}|${v.league}|${v.home}|${v.away}`);
      const d = [dc.home, dc.draw, dc.away];
      const p = st ? d.map((x, i) => DC_VIKT * x + (1 - DC_VIKT) * st[i]) : d;
      const { pick } = pick1x2({ home: p[0], draw: p[1], away: p[2] }, v.league);
      return { p, pick: { 1: 0, X: 1, 2: 2 }[pick] };
    },
    bet(v, _pred, _bok, pris) {
      const o = v.odds ?? {};
      const pin = utanMarginal([o.pinnacle_home, o.pinnacle_draw, o.pinnacle_away]);
      const fair = pin ?? utanMarginal([o.home, o.draw, o.away]);
      if (!fair) return null;
      const minEv = pin ? MIN_EV : MIN_EV_SNITT;
      const maxOdds = pin ? MAX_ODDS : MAX_ODDS_SNITT;
      let best = null, bestEv = -1;
      for (let i = 0; i < 3; i++) {
        const ev = fair[i] * pris[i] - 1;
        if (ev < minEv || betBlock(pris[i], ev, { maxOdds, maxEv: MAX_EV })) continue;
        if (ev > bestEv) { best = i; bestEv = ev; }
      }
      return best;
    },
    learn(m) { (perLiga[m.league] ??= []).push(m); },
  };
}
