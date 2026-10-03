// Kör backtest-stryktipset.mjs parallellt: omgångarna delas på flera processer (en kärna var) och slås ihop till en fil.
// Systembygget (framför allt kupong C) tar 2 s till flera minuter per omgång och använder bara en kärna, så en
// period på 36 omgångar tog en timme i en process (2026-10-03). Samma argument som backtest-stryktipset.mjs, plus --jobs.
//   STRYK_SEASONS=2627,2526,2425 node scripts/backtest-parallel.mjs --from 2025-08-01 --out data/x.json --jobs 8
// Miljövariabler (STRYK_*) följer med till alla processer. Sammanfattningen i den ihopslagna filen räknas om från omgångarna.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts', 'backtest-stryktipset.mjs');
const argv = process.argv.slice(2);
const take = (name, def) => { const i = argv.indexOf(`--${name}`); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const OUT = path.resolve(root, take('out', 'data/stryktips-backtest.json'));
const JOBS = Math.max(1, Number(take('jobs', Math.max(1, Math.floor(os.cpus().length / 2)))));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stryk-bt-'));

const run = (args, logFile) => new Promise((resolve, reject) => {
  const out = [];
  const p = spawn(process.execPath, [script, ...args], { cwd: root, env: process.env });
  const log = logFile ? fs.createWriteStream(logFile) : null;
  p.stdout.on('data', (b) => { out.push(b); log?.write(b); });
  p.stderr.on('data', (b) => log?.write(b));
  p.on('close', (code) => { log?.end(); code === 0 ? resolve(Buffer.concat(out).toString()) : reject(new Error(`${args.join(' ')}: kod ${code}`)); });
});

const listOut = await run([...argv, '--list']);
const line = listOut.split('\n').find((l) => l.startsWith('LIST:'));
if (!line) throw new Error('kunde inte lista omgångarna');
const all = JSON.parse(line.slice(5));
// Varannan omgång till varje process (round robin): tunga och lätta omgångar sprids jämnt
const chunks = Array.from({ length: Math.min(JOBS, all.length) }, (_, j) => all.filter((_, i) => i % JOBS === j));
process.stdout.write(`${all.length} omgångar på ${chunks.length} processer (loggar i ${tmp})\n`);
let done = 0;
const parts = await Promise.all(chunks.map(async (c, j) => {
  const file = path.join(tmp, `del-${j}.json`);
  await run([...argv, '--draws', c.join(','), '--out', file], path.join(tmp, `del-${j}.log`));
  done += c.length;
  process.stdout.write(`del ${j + 1}/${chunks.length} klar (${done}/${all.length} omgångar)\n`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}));

const draws = parts.flatMap((x) => x.draws).sort((a, b) => b.drawNumber - a.drawNumber);
const sum = (sys) => {
  const xs = draws.map((d) => d[sys]).filter(Boolean);
  const cost = xs.reduce((s, v) => s + (v.cost || 0), 0), winnings = xs.reduce((s, v) => s + (v.winnings || 0), 0);
  return { cost, winnings, net: winnings - cost, best: draws.map((d) => d[sys]?.best) };
};
const summary = { ...parts[0].summary, from: draws.at(-1)?.date, to: draws[0]?.date, draws: draws.length, matches: draws.length * 13, A: sum('A'), B: sum('B'), C: sum('C'), parallel: chunks.length, byLeague: undefined };
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, draws }, null, 2), 'utf8');
process.stdout.write(`Klart: ${draws.length} omgångar -> ${path.relative(root, OUT)} · A netto ${summary.A.net} kr · B netto ${summary.B.net} kr · C netto ${summary.C.net} kr\n`);
