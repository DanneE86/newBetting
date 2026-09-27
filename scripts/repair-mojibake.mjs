// Reparerar strangar som avkodats som ISO-8859-1 i stallet for UTF-8 ("MilenkoviÄ" -> "Milenković").
// Orsak: Windows PowerShell 5.1 utan charset i svaret (fixat i scripts/lib/Http.ps1).
// Kor: node scripts/repair-mojibake.mjs [filer...]   (utan argument: alla JSON i data/ och data/open/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = new TextDecoder('utf-8', { fatal: true });

/** Returnerar lagad strang, eller originalet om den inte ser ut som mojibake. */
export function fixString(s) {
  if (!/[Â-ô][\u0080-¿]/.test(s)) return s; // typiskt monster for UTF-8 last som latin-1
  if (/[^\u0000-ÿ]/.test(s)) return s;                 // innehaller redan riktiga Unicode-tecken
  try {
    return strict.decode(Buffer.from(s, 'latin1'));
  } catch {
    return s;                                               // inte giltig UTF-8 -> var inte mojibake
  }
}

function walk(v, stats) {
  if (typeof v === 'string') {
    const f = fixString(v);
    if (f !== v) stats.fixed++;
    return f;
  }
  if (Array.isArray(v)) return v.map((x) => walk(x, stats));
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, x] of Object.entries(v)) out[walk(k, stats)] = walk(x, stats);
    return out;
  }
  return v;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = process.argv.length > 2
    ? process.argv.slice(2)
    : ['data', 'data/open'].flatMap((d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith('.json')).map((f) => path.join(root, d, f)));
  let total = 0;
  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
    let doc;
    try { doc = JSON.parse(raw); } catch { continue; }
    const stats = { fixed: 0 };
    const fixed = walk(doc, stats);
    if (!stats.fixed) continue;
    // Behall ungefar samma format (kompakt om filen var kompakt)
    const compact = !raw.slice(0, 200).includes('\n');
    fs.writeFileSync(f, compact ? JSON.stringify(fixed) : JSON.stringify(fixed, null, 2), 'utf8');
    console.log(`  ${path.relative(root, f)}: ${stats.fixed} strangar lagade`);
    total += stats.fixed;
  }
  console.log(`Klart: ${total} strangar lagade`);
}
