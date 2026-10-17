// xG per match ur matchfilerna (data/matcher/<liga>.csv: Understat, football-data, FotMob/Opta) in i store-matcherna,
// som m.xh / m.xa. Används av Dixon-Coles (params.xgW): bakkört 2026-10-16, mål+xG 50/50 slog bara mål i 24 av 28 ligor.
// Koppling: samma liga, datum och resultat, sedan lagnamn. En ensam kandidat med samma resultat räcker.
import fs from 'node:fs';
import path from 'node:path';
import { parseCsvText } from '../lib/databas.mjs';
import { sameTeamName } from '../lib/team-aliases.mjs';

/** Rader ur matchfilerna → Map `liga|datum|hg|ag` → [{ home, away, xh, xa }]. Skottproxy (xg_src skott) tas inte med. */
export function indexMatchXg(rows) {
  const idx = new Map();
  for (const r of rows) {
    if (r.xg_h === '' || r.xg_a === '' || r.hg === '' || r.ag === '' || r.xg_src === 'skott') continue;
    const xh = Number(r.xg_h), xa = Number(r.xg_a);
    if (!Number.isFinite(xh) || !Number.isFinite(xa)) continue;
    const k = `${r.league}|${r.date}|${Number(r.hg)}|${Number(r.ag)}`;
    (idx.get(k) ?? idx.set(k, []).get(k)).push({ home: r.home, away: r.away, xh, xa });
  }
  return idx;
}

/** Sätter m.xh/m.xa på matcherna som har xG. Returnerar antal kopplade. */
export function attachMatchXg(matches, idx) {
  let n = 0;
  for (const m of matches) {
    const c = idx.get(`${m.league}|${m.date}|${m.hg}|${m.ag}`);
    if (!c) continue;
    const hit = c.find((x) => sameTeamName(x.home, m.home) && sameTeamName(x.away, m.away)) ?? (c.length === 1 ? c[0] : null);
    if (!hit) continue;
    m.xh = hit.xh;
    m.xa = hit.xa;
    n++;
  }
  return n;
}

/** Läser alla data/matcher/*.csv under root och kopplar xG till matcherna. */
export function loadMatchXg(root, matches) {
  const dir = path.join(root, 'data', 'matcher');
  if (!fs.existsSync(dir)) return 0;
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith('.csv')).flatMap((f) => parseCsvText(fs.readFileSync(path.join(dir, f), 'utf8')));
  return attachMatchXg(matches, indexMatchXg(rows));
}
