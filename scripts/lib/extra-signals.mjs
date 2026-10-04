// Extra lardomssignaler per match som raknas likadant i traning (learnings-signals) och live (pro-layer, Stryktipset):
//   alt = 1 nar hemmalaget spelar pa hoghojd mot ett lagt bortalag (scripts/lib/altitude.mjs), annars 0
//   sp  = fasta situationer: (hemma anfall + borta forsvar) - (borta anfall + hemma forsvar), z-poang fran
//         forra sasongen (data/stil-z.json, node scripts/analyze-style-matchups.mjs). Positivt = hemmalaget farligare.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './learnings-data.mjs';
import { ALTITUDE, isAltitudeGame } from './altitude.mjs';

const COUNTRY = { PL: 'ENG', CH: 'ENG', EL1: 'ENG', EL2: 'ENG', BL: 'GER', BL2: 'GER', LL: 'ESP', LL2: 'ESP', SA: 'ITA', SB: 'ITA' };

/** 2025/26 -> 2024/25, 2025 -> 2024 */
export function prevSeason(season) {
  const y = Number(String(season).slice(0, 4));
  if (!Number.isFinite(y)) return null;
  return /^\d{4}\/\d{2}$/.test(season) ? `${y - 1}/${String(y).slice(2)}` : String(y - 1);
}

// Ligor vars sasong heter som kalenderaret i data/matcher (t.ex. "2026"), ovriga "2026/27" med ny sasong fran juli
// (aven AR, COL, BR2, SE2, NO2 m.fl. ar markta 2025/26 i vara filer)
const CALENDAR = new Set(['AS', 'NO', 'JP1', 'MLS', 'BR']);
/** Sasongsetikett for en liga och ett datum (YYYY-MM-DD), som i data/matcher/<liga>.csv. */
export function seasonOf(league, date) {
  const y = Number(String(date).slice(0, 4)), mo = Number(String(date).slice(5, 7));
  if (!Number.isFinite(y)) return null;
  if (CALENDAR.has(league)) return String(y);
  const start = mo >= 7 ? y : y - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

let zDoc;
export function loadStyleZ(file = path.join(root, 'data', 'stil-z.json')) {
  if (zDoc !== undefined && !arguments.length) return zDoc;
  let d = null;
  try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { d = null; }
  if (!arguments.length) zDoc = d;
  return d;
}

/** Fasta-matchning ur z-tabellen { land: { "sasong|lag": { spAtt, spDef } } }. null om nagot lag saknas. */
export function spSignal(z, league, season, home, away) {
  const tab = z?.[COUNTRY[league] ?? league];
  const ps = prevSeason(season);
  if (!tab || !ps) return null;
  const H = tab[`${ps}|${home}`], A = tab[`${ps}|${away}`];
  if ([H?.spAtt, H?.spDef, A?.spAtt, A?.spDef].some((x) => x == null || !Number.isFinite(x))) return null;
  return (H.spAtt + A.spDef) - (A.spAtt + H.spDef);
}

/** Alla extra signaler for en match. z = z-tabellen (standard: data/stil-z.json). */
export function extraSignals(league, season, home, away, z = loadStyleZ()?.countries) {
  const f = {};
  if (ALTITUDE[league]) f.alt = isAltitudeGame(league, home, away) ? 1 : 0;
  const sp = spSignal(z, league, season, home, away);
  if (sp != null) f.sp = sp;
  return f;
}
