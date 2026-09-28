// Justering av marknadens 1X2-sannolikheter med lardomar (config/learned-adjustments.json, npm run lardomar:modell).
//   logit_H = g*log pH + h + s/2,  logit_X = g*log pX + d + dx,  logit_B = g*log pB - s/2,  softmax
//   g = favorit-/skrallbias per liga, h = hemmabias, d = krysskalibrering, s = sum(beta * standardiserad signal)
// Signaler saknas -> 0 (= snittet). Utan parameterfil returneras p oforandrad.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './learnings-data.mjs';

export const ADJ_FILE = path.join(root, 'config', 'learned-adjustments.json');
// Signaler per bas: vid oppning finns inte oddsrorelse/stangningsodds. miss testas separat (kort historik).
export const SIGNAL_KEYS = {
  open: ['luck', 'gap', 'mres', 'h2hPts', 'h2hRes', 'rest', 'promo', 'releg'],
  close: ['luck', 'gap', 'mres', 'h2hPts', 'h2hRes', 'rest', 'promo', 'releg', 'steam', 'book'],
};
export const DRAW_KEYS = { open: ['h2hDraw', 'underOpen'], close: ['h2hDraw', 'under'] };

let cache;
export function loadAdjustments(file = ADJ_FILE) {
  if (cache !== undefined && file === ADJ_FILE) return cache;
  let doc = null;
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { doc = null; }
  if (file === ADJ_FILE) cache = doc;
  return doc;
}

/** Rakna logits -> sannolikheter for en parameteruppsattning (anvands av bade traning och live). */
export function applyParams(p, params, f = {}) {
  const lg = params.league ?? {};
  const g = 1 + (lg.g ?? 0);
  let s = 0;
  let dx = 0;
  for (const [k, b] of Object.entries(params.beta ?? {})) {
    const v = f[k];
    if (v == null || !Number.isFinite(v)) continue;
    const sc = params.scale?.[k];
    s += b * (sc ? (v - sc.mean) / sc.sd : v);
  }
  for (const [k, b] of Object.entries(params.drawBeta ?? {})) {
    const v = f[k];
    if (v == null || !Number.isFinite(v)) continue;
    const sc = params.scale?.[k];
    dx += b * (sc ? (v - sc.mean) / sc.sd : v);
  }
  const l = [
    g * Math.log(Math.max(1e-6, p[0])) + (lg.h ?? 0) + s / 2,
    g * Math.log(Math.max(1e-6, p[1])) + (lg.d ?? 0) + dx,
    g * Math.log(Math.max(1e-6, p[2])) - s / 2,
  ];
  const mx = Math.max(...l);
  const e = l.map((x) => Math.exp(x - mx));
  const sum = e[0] + e[1] + e[2];
  return e.map((x) => x / sum);
}

/**
 * Live: justera marknadens sannolikheter. base = 'open' (odds langt fore avspark, t.ex. Oddset-tips)
 * eller 'close' (odds nara avspark, t.ex. Stryktipsets sena korning). Returnerar { p, applied } dar
 * applied beskriver vad som anvandes (tomt = ingen justering).
 */
export function adjustProbs(p, league, f = {}, base = 'open', doc = loadAdjustments()) {
  const set = doc?.[base];
  if (!set || !p || p.some((x) => !Number.isFinite(x))) return { p, applied: [] };
  const params = { beta: set.beta ?? {}, drawBeta: set.drawBeta ?? {}, scale: set.scale ?? {}, league: set.leagues?.[league] ?? {} };
  const applied = [
    ...(set.leagues?.[league] ? ['liga-kalibrering'] : []),
    ...Object.keys(params.beta).filter((k) => f[k] != null && Number.isFinite(f[k])),
    ...Object.keys(params.drawBeta).filter((k) => f[k] != null && Number.isFinite(f[k])),
  ];
  if (!applied.length) return { p, applied };
  return { p: applyParams(p, params, f), applied };
}
