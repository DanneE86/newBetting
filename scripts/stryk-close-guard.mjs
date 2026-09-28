// Vakt for den sena Stryktipset-korningen: kor bara nar en oppen Stryktipset-kupong stanger om 15-75 minuter.
// Schemat startar arbetsflodet var 30:e minut lor/son eftermiddag; vakten slapper igenom en (ibland tva) korningar
// nara spelstopp, oavsett sommar-/vintertid och forsenade GitHub-scheman. Skriver run=true/false till GITHUB_OUTPUT.
//   node scripts/stryk-close-guard.mjs [--min 15 --max 75]
import fs from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? Number(process.argv[i + 1]) : d; };
const MIN = arg('min', 15), MAX = arg('max', 75);
let run = false, why = 'ingen öppen Stryktipset-kupong';
try {
  const res = await fetch('https://api.spela.svenskaspel.se/draw/1/stryktipset/draws', { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny)' } });
  const draws = (await res.json()).draws || [];
  for (const d of draws.filter((x) => x.drawState === 'Open')) {
    const mins = (Date.parse(d.regCloseTime) - Date.now()) / 60000;
    why = `omgång ${d.drawNumber} stänger om ${Math.round(mins)} min (${d.regCloseTime})`;
    if (mins >= MIN && mins <= MAX) { run = true; break; }
  }
} catch (e) { why = `kunde inte läsa kupongen: ${e.message}`; }
console.log(`${run ? 'Kör' : 'Hoppar över'}: ${why} (fönster ${MIN}-${MAX} min)`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `run=${run}\n`);
