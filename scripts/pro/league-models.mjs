// Ligaanpassad Dixon-Coles: parametrar per liga (config/league-models.json, valda i backtest av
// scripts/tune-league-models.mjs) + prior for nya lag i ligan (upp-/nedflyttade).
// Utan prior far ett nytt lag ligasnitt: nedflyttade underskattas, uppflyttade overskattas.
// Det var den storsta felkallan i Serie B (RPS-gap mot marknaden 0.026 for matcher med nya lag).
import fs from 'node:fs';
import { fitDixonColes } from './lib.mjs';

// drawK = oavgjort-faktor. earlyMarket = marknaden styr tipsen tills lagen spelat EARLY_ROUNDS matcher
// (satts av tuningen nar marknaden ar klart battre an modellen i sasongens borjan, t.ex. Serie B).
export const DEFAULT_PARAMS = { xi: 0.0025, shrink: 2, prior: false, priorK: 8, topQ: 0.75, botQ: 0.25, drawK: 1, earlyMarket: false };
export const EARLY_ROUNDS = 8;
const MIN_RECENT = 15; // farre ligamatcher senaste aret = nytt lag i ligan

export function loadLeagueModels(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')).leagues ?? {};
}

export function paramsFor(leagueModels, league) {
  return { ...DEFAULT_PARAMS, ...(leagueModels[league]?.params ?? {}) };
}

// Nivå inom land: ordningen i config/leagues.json groups (PL > CH > EL1, SA > SB ...)
export function buildTiers(leaguesCfg) {
  const tiers = {};
  for (const g of leaguesCfg.groups ?? []) g.leagues.forEach((l, i) => { tiers[l] = { group: g.id, level: i }; });
  return tiers;
}

function yearBefore(date) {
  return `${Number(date.slice(0, 4)) - 1}${date.slice(4, 10)}`;
}

function quantile(values, p) {
  const a = [...values].sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.max(0, Math.round(p * (a.length - 1))))];
}

/**
 * Anpassa ligamodell per liga. ctx: { league, byLeague, tiers, teams } dar teams = lagen som ska
 * prediceras (kommande matcher). Prior: nedflyttat lag (spelat hogre niva senaste aret) borjar som
 * ligans ovre kvartil, ovriga nya lag (uppflyttade, okant ursprung) som nedre kvartil. Priorn vags
 * mot lagets egna ligamatcher med priorK pseudomatcher och klingar av under hosten.
 */
export function fitLeagueModel(list, refDate, params, ctx = {}) {
  const model = fitDixonColes(list, refDate, { xi: params.xi, shrink: params.shrink });
  if (model) model.drawK = params.drawK;
  if (!model || !params.prior || !ctx.teams) return model;
  const from = yearBefore(refDate);
  const recent = (league, team) => {
    let n = 0;
    for (const m of ctx.byLeague?.[league] ?? []) {
      if (m.date < refDate && m.date > from && (m.home === team || m.away === team)) n++;
    }
    return n;
  };
  const established = [...model.att.keys()].filter((t) => recent(ctx.league, t) >= MIN_RECENT);
  if (established.length < 6) return model;
  const atts = established.map((t) => model.att.get(t));
  const defs = established.map((t) => model.def.get(t));
  // Lagt def = bra forsvar, darfor spegelvand kvantil
  const top = { att: quantile(atts, params.topQ), def: quantile(defs, 1 - params.topQ) };
  const bottom = { att: quantile(atts, params.botQ), def: quantile(defs, 1 - params.botQ) };
  const avgDef = defs.reduce((s, x) => s + x, 0) / defs.length;
  const me = ctx.tiers?.[ctx.league];

  const out = { ...model, att: new Map(model.att), def: new Map(model.def), priors: {} };
  for (const team of new Set(ctx.teams)) {
    const own = recent(ctx.league, team);
    if (own >= MIN_RECENT) continue;
    let relegated = false;
    if (me) {
      for (const [lg, t] of Object.entries(ctx.tiers)) {
        if (t.group === me.group && t.level < me.level && recent(lg, team) >= 10) relegated = true;
      }
    }
    const prior = relegated ? top : bottom;
    const w = params.priorK / (params.priorK + own);
    out.att.set(team, w * prior.att + (1 - w) * (model.att.get(team) ?? 1));
    out.def.set(team, w * prior.def + (1 - w) * (model.def.get(team) ?? avgDef));
    out.priors[team] = { type: relegated ? 'nedflyttat' : 'nytt/uppflyttat', leagueMatches: own, weight: Math.round(w * 100) / 100 };
  }
  return out;
}
