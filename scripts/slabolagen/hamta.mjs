// Hela sasongsfiler fran football-data for utvecklingsdata (2017/18-2022/23): 1X2 och malodds fran Pinnacle, Bet365, snitt och hogsta pris.
// Sparas i data/raw/full (gitignorerad). Avslutade sasonger hamtas inte om. Kor: node scripts/slabolagen/hamta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getText } from '../lib/http.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(root, 'data', 'raw', 'full');
const LIGOR = { PL: 'E0', CH: 'E1', EL1: 'E2', BL: 'D1', BL2: 'D2', LL: 'SP1', LL2: 'SP2', SA: 'I1', SB: 'I2', L1: 'F1', ED: 'N1', BE: 'B1', PT: 'P1', GR: 'G1', SC: 'SC0' };
const SASONGER = ['1718', '1819', '1920', '2021', '2122', '2223'];
fs.mkdirSync(OUT, { recursive: true });
let ok = 0, fel = 0;
for (const [liga, kod] of Object.entries(LIGOR)) {
  for (const s of SASONGER) {
    const fil = path.join(OUT, `${liga}_${s}.csv`);
    if (fs.existsSync(fil) && fs.statSync(fil).size > 1000) { ok++; continue; }
    try {
      const txt = await getText(`https://www.football-data.co.uk/mmz4281/${s}/${kod}.csv`);
      fs.writeFileSync(fil, txt);
      ok++;
    } catch (e) { fel++; console.log(`FEL ${liga} ${s}: ${e.message}`); }
  }
}
console.log(`Klart: ${ok} filer, ${fel} fel`);
