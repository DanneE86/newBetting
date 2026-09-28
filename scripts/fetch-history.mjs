// Langre historik (football-data mmz4281) for lardomsanalysen: inbordes moten, lagmonster, marknadens kalibrering.
// Sparar bara de kolumner analysen behover (datum, lag, mal, skott, oppnings-/slutodds 1X2) i data/raw/hist/.
// Befintliga filer hamtas inte om (avslutade sasonger andras inte) om de har alla kolumner. Kors: npm run history
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'raw', 'hist');
const CODES = { PL: 'E0', CH: 'E1', EL1: 'E2', EL2: 'E3', BL: 'D1', BL2: 'D2', LL: 'SP1', LL2: 'SP2', SA: 'I1', SB: 'I2', L1: 'F1', ED: 'N1', PT: 'P1', GR: 'G1' };
const SEASONS = ['1718', '1819', '1920', '2021', '2122', '2223', '2324'];
const KEEP = ['Date', 'HomeTeam', 'AwayTeam', 'FTHG', 'FTAG', 'FTR', 'HS', 'AS', 'HST', 'AST',
  'PSH', 'PSD', 'PSA', 'PSCH', 'PSCD', 'PSCA', 'AvgH', 'AvgD', 'AvgA', 'AvgCH', 'AvgCD', 'AvgCA',
  'BbAvH', 'BbAvD', 'BbAvA', 'B365H', 'B365D', 'B365A',
  'MaxH', 'MaxD', 'MaxA', 'MaxCH', 'MaxCD', 'MaxCA', 'BbMxH', 'BbMxD', 'BbMxA',
  'P>2.5', 'P<2.5', 'PC>2.5', 'PC<2.5', 'Avg>2.5', 'Avg<2.5', 'AvgC>2.5', 'AvgC<2.5', 'BbAv>2.5', 'BbAv<2.5'];

fs.mkdirSync(OUT, { recursive: true });
let ok = 0;
let fail = 0;
for (const [league, code] of Object.entries(CODES)) {
  for (const season of SEASONS) {
    const file = path.join(OUT, `${league}_${season}.csv`);
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').split('\n', 1)[0] === KEEP.join(',')) continue;
    const url = `https://www.football-data.co.uk/mmz4281/${season}/${code}.csv`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = (await res.text()).replace(/^﻿/, '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const head = lines[0].split(',');
      const idx = KEEP.map((k) => head.indexOf(k));
      const rows = lines.slice(1).map((l) => l.split(',')).filter((c) => c[idx[1]] && c[idx[3]] !== '');
      if (rows.length < 50) throw new Error(`bara ${rows.length} rader`);
      const out = [KEEP.join(','), ...rows.map((c) => idx.map((i) => (i >= 0 ? c[i] ?? '' : '')).join(','))];
      fs.writeFileSync(file, `${out.join('\n')}\n`, 'utf8');
      ok++;
      console.log(`${league}_${season}: ${rows.length} matcher`);
    } catch (e) {
      fail++;
      console.warn(`${league}_${season}: ${e.message} (${url})`);
    }
  }
}
console.log(`Klart: ${ok} nya filer, ${fail} fel. Katalog: ${path.relative(root, OUT)}`);

// xG fran Understat for samma sasonger i topp 5 (cache i data/open/understat_xg_<liga>_<sasong>.json)
const { loadUnderstatXg } = await import('./lib/understat-xg.mjs');
for (const league of ['PL', 'LL', 'SA', 'BL', 'L1']) {
  for (const season of SEASONS) {
    const rows = await loadUnderstatXg(league, season);
    console.log(`xG ${league}_${season}: ${rows?.length ?? 'saknas'}`);
  }
}
