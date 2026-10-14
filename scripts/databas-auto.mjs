// Bygger om de lokala databaserna (databas/*.sqlite) som inte byggts på 3 dygn. Körs varje timme av Windows-uppgiften
// "Betting databas auto" (scripts/databas-auto-installera.ps1) och gör inget om allt är färskt. Logg: databas/auto-logg.txt.
//   node scripts/databas-auto.mjs              bygg om det som är äldre än 3 dygn
//   node scripts/databas-auto.mjs --dagar 1    annan gräns
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DATABASER, databaserAttBygga } from './lib/databas.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UT = path.join(ROOT, 'databas');
const i = process.argv.indexOf('--dagar');
const dagar = i > 0 ? Number(process.argv[i + 1]) : 3;
const log = (msg) => {
  const line = `${new Date().toISOString().slice(0, 19).replace('T', ' ')} ${msg}`;
  console.log(line);
  fs.mkdirSync(UT, { recursive: true });
  fs.appendFileSync(path.join(UT, 'auto-logg.txt'), line + '\n');
};

const andrad = Object.fromEntries(DATABASER.map((n) => {
  try { return [n, fs.statSync(path.join(UT, `${n}.sqlite`)).mtimeMs]; } catch { return [n, null]; }
}));
for (const namn of databaserAttBygga(andrad, Date.now(), dagar)) {
  log(`${namn}: ${andrad[namn] == null ? 'saknas' : `${((Date.now() - andrad[namn]) / 864e5).toFixed(1)} dygn gammal`} – bygger om`);
  const r = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'scripts', 'bygg-databas.mjs'), namn], { cwd: ROOT, encoding: 'utf8' });
  if (r.status === 0) log(`${namn}: klar (${(r.stdout.match(/: (\d+ MB på \d+ s)/) ?? [])[1] ?? 'ok'})`);
  else log(`${namn}: misslyckades – försöker igen nästa timme. ${(r.stderr || r.stdout).trim().split('\n').filter((l) => /Error|Kunde/.test(l)).slice(-1)[0] ?? ''}`);
}
