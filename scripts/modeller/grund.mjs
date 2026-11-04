// Grunden för modelltävlingen (npm run modeller): matcherna som flöde och bakkörningen dag för dag.
// Här finns ingen modellogik. En modell får bara en "vy" av matchen (inget resultat, inga stängningsodds, ingen
// matchstatistik) och hela matchen först när matchdagen är slut. Modellerna kan inte se varandra: de körs i egna
// processer och importerar bara den här filen (tests/modeller.spec.ts vaktar båda delarna).
import fs from 'node:fs';
import path from 'node:path';
import { loadMatchXg } from '../pro/match-xg.mjs';

export const TECKEN = ['H', 'D', 'A'];
export const UPPSTART = '2023-08-01';
export const TEST_FRAN = '2024-11-01';
export const TEST_TILL = '2026-10-31';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

/** Odds utan bolagsmarginal, eller null om något pris saknas eller är orimligt. */
export function utanMarginal(odds) {
  if (!odds || odds.length !== 3 || odds.some((o) => !(o > 1) || !(o < 1000))) return null;
  const inv = odds.map((o) => 1 / o);
  const sum = inv[0] + inv[1] + inv[2];
  // Under 98 % eller över 130 % är datafel, inte en marknad
  if (sum < 0.98 || sum > 1.3) return null;
  return inv.map((x) => x / sum);
}

/** Spelade matcher från store: sorterade, unika, med xG där det finns. */
export function laddaMatcher(root) {
  const store = readJson(path.join(root, 'data', 'betting-store.json'));
  const seen = new Set();
  const list = [];
  for (const m of store.matches) {
    if (!Number.isFinite(m.hg) || !Number.isFinite(m.ag) || !TECKEN.includes(m.result)) continue;
    if (m.date < UPPSTART || m.date > TEST_TILL || seen.has(m.id)) continue;
    seen.add(m.id);
    list.push(m);
  }
  loadMatchXg(root, list);
  list.sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)));
  return list;
}

/** Det modellen får veta före matchen. Allt annat (resultat, closing, skott, kort, xG) saknas med flit. */
export function vy(m) {
  return Object.freeze({
    id: m.id, league: m.league, season: m.season, date: m.date, home: m.home, away: m.away,
    kickoff: m.kickoff ?? null, referee: m.referee ?? null,
    odds: m.odds ? Object.freeze({ ...m.odds }) : null,
  });
}

export const priser = (m, bok) => {
  const o = m.odds ?? {};
  const p = [o[`${bok}_home`], o[`${bok}_draw`], o[`${bok}_away`]];
  return p.every((x) => x > 1) ? p : null;
};

/**
 * Kör en modell dag för dag. model = { predict(vy), bet(vy, pred, bok, priser), learn(match) }.
 * predict -> { p: [H, D, A], pick } eller null. bet -> index 0-2 eller null. Facit (learn) kommer först efter hela dagen.
 * Returnerar raderna från testperioden.
 */
export function bakkor(model, matcher, { from = TEST_FRAN, boker = ['b365', 'max'] } = {}) {
  const rader = [];
  for (let i = 0; i < matcher.length;) {
    let j = i;
    while (j < matcher.length && matcher[j].date === matcher[i].date) j++;
    const dag = matcher.slice(i, j);
    for (const m of dag) {
      const v = vy(m);
      const pred = model.predict(v);
      const bets = {};
      if (pred) {
        for (const bok of boker) {
          const pris = priser(m, bok);
          if (!pris) continue;
          const val = model.bet(v, pred, bok, pris);
          if (val != null) bets[bok] = { i: val, odds: pris[val] };
        }
      }
      if (m.date >= from && pred) rader.push({ id: m.id, p: pred.p.map((x) => Math.round(x * 1e5) / 1e5), pick: pred.pick, bets });
    }
    for (const m of dag) model.learn(m);
    i = j;
  }
  return rader;
}
