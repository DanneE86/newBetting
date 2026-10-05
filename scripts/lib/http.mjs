// Gemensam hämtning för alla skript: tidsgräns, omförsök, strypning per värd och formatkontroll (zod).
//   const d = await getJson(url)                                  // kastar HttpError/FormatError vid fel
//   const d = await getJson(url, { orNull: true, schema: S.x })   // null vid fel
// Formatfel loggas en gång per källa och summeras när processen avslutas.
// Omförsök: nätverksfel, tidsgräns, 5xx, strypning (429, och 403 om throttleStatus säger så) och tomt svar.
// Andra 4xx försöks inte igen. 404 ger null med orNull, annars HttpError.
// Strypning: värden pausas för alla anrop (även parallella) tills Retry-After/väntetiden gått ut.

export const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export class HttpError extends Error {
  constructor(status, url) { super(`HTTP ${status} ${String(url).slice(0, 160)}`); this.name = 'HttpError'; this.status = status; this.url = url; }
}
export class FormatError extends Error {
  constructor(label, url, issues) {
    super(`Oväntat format (${label}): ${issues.slice(0, 3).map((i) => `${i.path.join('.') || '(roten)'} ${i.message}`).join('; ')} – ${String(url).slice(0, 160)}`);
    this.name = 'FormatError'; this.label = label; this.url = url; this.issues = issues;
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pausedUntil = new Map(); // värd -> ms-tid då anrop får fortsätta
const warned = new Set();
export const formatErrors = new Map(); // label -> antal (sammanfattas när processen avslutas)
let summaryHooked = false;

function noteFormatError(err, log) {
  formatErrors.set(err.label, (formatErrors.get(err.label) || 0) + 1);
  if (!warned.has(err.label)) { warned.add(err.label); log(`VARNING ${err.message}`); }
  if (!summaryHooked && typeof process !== 'undefined') {
    summaryHooked = true;
    process.once('exit', () => {
      const parts = [...formatErrors].map(([k, n]) => `${k} ${n} st`);
      if (parts.length) process.stderr.write(`Formatfel i hämtade svar: ${parts.join(', ')} (källan kan ha ändrat format)\n`);
    });
  }
}

function retryAfterMs(res) {
  const v = res.headers.get('retry-after');
  if (!v) return null;
  const s = Number(v);
  if (Number.isFinite(s)) return Math.max(0, s * 1000);
  const t = Date.parse(v);
  return Number.isFinite(t) ? Math.max(0, t - Date.now()) : null;
}

/**
 * Hämtar en URL. as: 'json' | 'text'. Returnerar tolkat svar (validerat mot schema om det finns).
 * @param {string} url
 * @param {object} [o]
 */
export async function request(url, o = {}) {
  const {
    as = 'json', method = 'GET', headers = {}, body, redirect,
    retries = 3, timeoutMs = 30_000, retryDelayMs = 1000, throttleMs = 15_000, maxThrottleMs = 120_000,
    throttleStatus = [429], orNull = false, schema, label = new URL(url).hostname,
    onResponse, log = (s) => console.log(s),
  } = o;
  const host = new URL(url).host;
  let lastErr = null;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const wait = (pausedUntil.get(host) || 0) - Date.now();
    if (wait > 0) await sleep(wait);
    let res;
    try {
      res = await fetch(url, { method, headers: { 'User-Agent': BROWSER_UA, ...headers }, body, redirect, signal: AbortSignal.timeout(timeoutMs) });
    } catch (e) {
      lastErr = e;
      if (attempt <= retries) await sleep(retryDelayMs * attempt);
      continue;
    }
    onResponse?.(res);
    if (res.ok) {
      let data;
      try {
        const text = await res.text();
        if (as === 'text') return text;
        if (!text.trim()) throw new Error('tomt svar');
        data = JSON.parse(text);
      } catch (e) {
        lastErr = e;
        if (attempt <= retries) await sleep(retryDelayMs * attempt);
        continue;
      }
      if (!schema) return data;
      const r = schema.safeParse(data);
      if (r.success) return data; // originalet returneras: schemat kontrollerar, det skalar inte bort fält
      // Loggas alltid, även när anroparen fångar felet (t.ex. .catch(() => null)), så att det aldrig blir tyst
      const err = new FormatError(label, url, r.error.issues);
      noteFormatError(err, log);
      if (orNull) return null;
      throw err;
    }
    lastErr = new HttpError(res.status, url);
    if (res.status === 404 && orNull) return null;
    if (throttleStatus.includes(res.status)) {
      const ms = Math.min(maxThrottleMs, retryAfterMs(res) ?? throttleMs * attempt);
      pausedUntil.set(host, Math.max(pausedUntil.get(host) || 0, Date.now() + ms));
      if (attempt <= retries) log(`  strypt av ${host} (${res.status}), väntar ${Math.round(ms / 1000)} s`);
      continue;
    }
    if (res.status < 500) break; // övriga 4xx: inget nytt försök
    if (attempt <= retries) await sleep(retryDelayMs * attempt);
  }
  if (orNull) return null;
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export const getJson = (url, o = {}) => request(url, { ...o, as: 'json' });
export const getText = (url, o = {}) => request(url, { ...o, as: 'text' });

/** Kör fn för varje element med högst n samtidiga. Returnerar resultaten i samma ordning. */
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

// För tester: nollställ strypning och formatfelräkning
export function _resetHttpState() { pausedUntil.clear(); warned.clear(); formatErrors.clear(); }
