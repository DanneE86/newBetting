// Arkiv for Stryktipset/Europatipset-kuponger, for snabba backtest utan natanrop.
//   data/tips-archive/raw/<produkt>-<nr>.json       Svenska Spels kupong + facit (bantad till falten analysen anvander)
//   data/tips-archive/raw/<produkt>-<nr>-open.json  senaste hamtning av en oppen kupong (odds/streck vid korningen)
//   data/tips-archive/systems/<produkt>-<nr>.json   kupong A/B byggda med reglerna som gallde + utvardering mot facit
// Rahdatan gor att vilka regler som helst kan provas i efterhand (scripts/backtest-stryktipset.mjs laser arkivet forst).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ARCHIVE = path.join(root, 'data', 'tips-archive');
const RAW = path.join(ARCHIVE, 'raw');
const SYS = path.join(ARCHIVE, 'systems');
const API = 'https://api.spela.svenskaspel.se/draw/1';

const pick = (o, keys) => (o ? Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]])) : o);

// Bara falten analyzeDraw/backtest anvander (ca en tiondel av API-svaret)
export function slimDraw(d) {
  return {
    ...pick(d, ['productName', 'productId', 'drawNumber', 'drawState', 'regOpenTime', 'regCloseTime', 'regCloseDescription', 'currentNetSale', 'rowPrice', 'drawComment']),
    drawEvents: (d.drawEvents || []).map((ev) => ({
      ...pick(ev, ['eventNumber', 'cancelled', 'eventDescription', 'odds', 'startOdds', 'svenskaFolket', 'tioTidningarsTips']),
      match: ev.match && {
        ...pick(ev.match, ['matchId', 'matchStart', 'status']),
        participants: (ev.match.participants || []).map((pt) => pick(pt, ['id', 'type', 'name', 'shortName', 'mediumName', 'countryName', 'isoCode'])),
        league: ev.match.league && { name: ev.match.league.name, country: ev.match.league.country && pick(ev.match.league.country, ['name', 'isoCode']) },
      },
    })),
  };
}
export function slimResult(r) {
  if (!r) return null;
  return {
    ...pick(r, ['drawNumber', 'currentNetSale', 'regCloseTime', 'cancelled']),
    events: (r.events || []).map((e) => pick(e, ['eventNumber', 'cancelled', 'outcome', 'outcomeScore'])),
    distribution: (r.distribution || []).map((x) => pick(x, ['name', 'winners', 'amount'])),
  };
}

const rawFile = (product, n, open = false) => path.join(RAW, `${product}-${n}${open ? '-open' : ''}.json`);
export const sysFile = (product, n) => path.join(SYS, `${product}-${n}.json`);
const write = (file, obj) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj), 'utf8'); };

export function readRaw(product, n) {
  try { return JSON.parse(fs.readFileSync(rawFile(product, n), 'utf8')); } catch { return null; }
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (betting-ny arkiv)' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Avgjord kupong med facit: fran arkivet om den finns, annars fran API:t (och sparas). null om den inte ar avgjord.
export async function loadDraw(product, n, { refresh = false } = {}) {
  const cached = !refresh && readRaw(product, n);
  if (cached?.result?.distribution?.length) return cached;
  const d = await getJson(`${API}/${product}/draws/${n}`).then((r) => r?.draw).catch(() => null);
  if (!d) return null;
  const res = await getJson(`${API}/${product}/draws/${n}/result`).then((r) => r?.result || r).catch(() => null);
  const entry = { product, drawNumber: n, archivedAt: new Date().toISOString(), draw: slimDraw(d), result: res?.distribution?.length ? slimResult(res) : null };
  if (entry.result) write(rawFile(product, n), entry);
  return entry;
}

// Oppen kupong: spara senaste hamtningen (odds och streck vid korningen) - skrivs over vid varje korning
export function saveOpenDraw(product, draw) {
  write(rawFile(product, draw.drawNumber, true), { product, drawNumber: draw.drawNumber, fetchedAt: new Date().toISOString(), draw: slimDraw(draw) });
}

// Kupong A/B med nuvarande regler + utvardering. analysis = analyzeDraw-resultat, evaluate = evaluateSnapshot.
export function saveSystems(product, analysis, rules, evaluate) {
  const a = analysis;
  const outcomes = a.events.map((e) => e.result?.outcome);
  const complete = outcomes.every(Boolean);
  const dist = a.result?.distribution?.length ? a.result.distribution : null;
  const side = (red, key) => {
    if (!red) return null;
    const snap = { rowList: red.rowList, cost: red.cost, picks: a.events.map((e) => e[key]?.signs || '') };
    return {
      rows: red.rows, cost: red.cost, grundRows: red.grundRows, hitAll: red.hitAll, rules: red.rules, split: Boolean(red.split),
      gamblingCabinUrl: red.gamblingCabinUrl, picks: snap.picks, rowList: red.rowList,
      evaluation: complete && dist ? evaluate(snap, outcomes, dist) : null,
    };
  };
  const out = {
    product, drawNumber: a.drawNumber, closeTime: a.regCloseTime, builtAt: new Date().toISOString(), rules,
    outcomes: complete ? outcomes.join('') : null, distribution: dist, jackpot: a.reduced?.rules?.jackpot ?? 0,
    matches: a.events.map((e) => ({ n: e.eventNumber, match: `${e.home} - ${e.away}`, league: e.league, kickoff: e.kickoff, basis: e.basis,
      final: e.final, market: e.market, marketSource: e.marketSource, folk: e.folk, outcome: e.result?.outcome || null, score: e.result?.score || null })),
    A: side(a.reduced, 'systemPick'), B: side(a.reducedB, 'systemPickB'),
  };
  write(sysFile(product, a.drawNumber), out);
  return out;
}

export function listArchived(product) {
  try {
    return fs.readdirSync(RAW).map((f) => new RegExp(`^${product}-(\\d+)\\.json$`).exec(f)?.[1]).filter(Boolean).map(Number).sort((x, y) => x - y);
  } catch { return []; }
}
