// Fyller arkivet (data/tips-archive) med alla avgjorda Stryktipset- och Europatipset-omgangar i ett intervall:
// radata + kupong A/B byggda med nuvarande regler + utvardering mot facit. Framtida omgangar arkiveras
// automatiskt av scripts/fetch-stryktipset.mjs.
//   STRYK_SEASONS=2627,2526,2425,2324 node scripts/build-tips-archive.mjs --from 2025-01-01
//   node scripts/build-tips-archive.mjs --product europatipset --rebuild   (bygg om kupongerna med nya regler)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analyzeDraw, evaluateSnapshot, loadNationalElo, loadGroup, fitModel, currentRules, PRODUCTS } from './fetch-stryktipset.mjs';
import { loadDraw, saveSystems, sysFile, listArchived, ARCHIVE } from './lib/tips-archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (s) => process.stdout.write(`${s}\n`);
const SEED = { stryktipset: 4972, europatipset: 2611 };

export function makeCtx(elo) {
  const cache = new Map();
  return {
    elo,
    async group(group, cutoff) {
      const key = `${group}|${cutoff}`;
      if (!cache.has(key)) {
        if (!cache.has(group)) cache.set(group, await loadGroup(group));
        const all = cache.get(group);
        cache.set(key, { all, model: fitModel(all, cutoff) });
      }
      return cache.get(key);
    },
  };
}

// Arkivera en avgjord omgang: radata (loadDraw) + kuponger med nuvarande regler. Returnerar systems-objektet eller null.
export async function archiveDraw(product, n, ctx, { rebuild = false } = {}) {
  const entry = await loadDraw(product.id, n);
  if (!entry?.result) return null;
  const rules = currentRules(product.id);
  if (!rebuild && fs.existsSync(sysFile(product.id, n))) {
    const old = JSON.parse(fs.readFileSync(sysFile(product.id, n), 'utf8'));
    if (JSON.stringify(old.rules) === JSON.stringify(rules)) return old;
  }
  const a = await analyzeDraw(product, entry.draw, ctx, entry.result);
  return saveSystems(product.id, a, rules, evaluateSnapshot);
}

// Nya avgjorda omgangar sedan senaste arkiverade (anropas av fetch-stryktipset.mjs vid varje korning)
export async function archiveNew(product, latestNumber, ctx) {
  const have = listArchived(product.id);
  const start = have.length ? have[have.length - 1] + 1 : latestNumber - 3;
  const done = [];
  for (let n = start; n <= latestNumber; n++) {
    const s = await archiveDraw(product, n, ctx).catch(() => null);
    if (s) done.push(n);
  }
  return done;
}

async function main() {
  const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
  const FROM = arg('from', '2025-01-01');
  const only = arg('product', null);
  const rebuild = process.argv.includes('--rebuild');
  const ctx = makeCtx(await loadNationalElo());
  let latest = {};
  try { latest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stryktipset.json'), 'utf8')).lastDrawNumber || {}; } catch { /* seed */ }
  for (const p of PRODUCTS.filter((x) => !only || x.id === only)) {
    const top = Math.max(latest[p.id] || 0, SEED[p.id]);
    const sum = { draws: 0, cost: 0, win: 0, hits13: 0 };
    let misses = 0;
    for (let n = top; n > 0; n--) {
      const entry = await loadDraw(p.id, n).catch(() => null);
      if (!entry) { if (++misses > 15) break; continue; }
      misses = 0;
      if ((entry.draw.regCloseTime || '') < FROM) break;
      const s = await archiveDraw(p, n, ctx, { rebuild }).catch((e) => { log(`  ${p.id} ${n}: fel ${e.message}`); return null; });
      if (!s) continue;
      const ev = [s.A?.evaluation, s.B?.evaluation].filter(Boolean);
      const cost = (s.A?.cost || 0) + (s.B?.cost || 0), win = ev.reduce((x, e) => x + (e.winnings || 0), 0);
      const best = Math.max(...ev.map((e) => e.best || 0), 0);
      sum.draws++; sum.cost += cost; sum.win += win; if (best === 13) sum.hits13++;
      log(`  ${p.id} ${n} ${String(s.closeTime).slice(0, 10)} ${s.outcomes || '-'} · bästa ${best} · vinst ${Math.round(win)} kr`);
    }
    log(`${p.name}: ${sum.draws} omgångar · insats ${sum.cost} kr · vinst ${Math.round(sum.win)} kr · netto ${Math.round(sum.win - sum.cost)} kr · 13 rätt ${sum.hits13} gånger`);
  }
  log(`Arkiv: ${path.relative(root, ARCHIVE)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { log(e.stack); process.exit(1); });
