// Kompletterar xG (HxG/AxG) fran Understat for avslutade sasonger dar football-data-CSV:erna saknar xG
// (2025/26 och aldre i PL, La Liga, Serie A, Bundesliga, Ligue 1). Lagmodellen vager mal och xG 50/50.
// Cache per liga och sasong i data/open/understat_xg_<liga>_<sasong>.json (hamtas en gang for avslutad sasong).
//   await fillXg(matches, log)   // fyller m.hxg/m.axg dar de saknas (matchning: datum +-1 dag och lagnamn)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nameScore } from './match-context.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const UNDERSTAT = { PL: 'EPL', LL: 'La_liga', SA: 'Serie_A', BL: 'Bundesliga', L1: 'Ligue_1' };

async function load(code, season) {
  const file = path.join(root, 'data', 'open', `understat_xg_${code}_${season}.json`);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* hamta */ }
  const year = 2000 + Number(String(season).slice(0, 2));
  try {
    const res = await fetch(`https://understat.com/getLeagueData/${UNDERSTAT[code]}/${year}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = (data.dates || []).filter((d) => d.isResult).map((d) => ({
      date: String(d.datetime).slice(0, 10), home: d.h?.title, away: d.a?.title, hxg: Number(d.xG?.h), axg: Number(d.xG?.a),
    })).filter((r) => r.home && Number.isFinite(r.hxg));
    // Spara bara nar sasongen ar klar (annars hamtas den igen nasta gang)
    const done = Date.now() > Date.UTC(year + 1, 6, 1);
    if (done && rows.length) fs.writeFileSync(file, JSON.stringify(rows), 'utf8');
    return rows;
  } catch { return null; }
}

export async function fillXg(matches, log = () => {}) {
  const need = new Map();
  for (const m of matches) if (m.hxg == null && UNDERSTAT[m.league]) need.set(`${m.league}|${m.season}`, [m.league, m.season]);
  for (const [k, [code, season]] of need) {
    const rows = await load(code, season);
    if (!rows?.length) { log(`  xG ${code} ${season}: saknas hos Understat`); continue; }
    const byDate = new Map();
    for (const r of rows) (byDate.get(r.date) || byDate.set(r.date, []).get(r.date)).push(r);
    let filled = 0, total = 0;
    for (const m of matches) {
      if (`${m.league}|${m.season}` !== k || m.hxg != null) continue;
      total++;
      const d = Date.parse(m.date);
      const cands = [-1, 0, 1].flatMap((o) => byDate.get(new Date(d + o * 86400e3).toISOString().slice(0, 10)) || []);
      let best = null;
      for (const r of cands) {
        const sh = nameScore(m.home, null, r.home), sa = nameScore(m.away, null, r.away);
        if (sh >= 0.5 && sa >= 0.5 && (!best || sh + sa > best.s)) best = { s: sh + sa, r };
      }
      if (best) { m.hxg = best.r.hxg; m.axg = best.r.axg; filled++; }
    }
    log(`  xG ${code} ${season}: ${filled}/${total} matcher kompletterade från Understat`);
  }
}
