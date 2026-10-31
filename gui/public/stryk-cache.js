// Stryktipset/Europatipset i webbläsaren: när datan hämtas om och när gamla omgångar rensas (användaren 2026-10-31:
// "den visar gamla matcher … se till att cachen rensas efter en ny omgång laddas in"). Sidan hämtade förut bara en gång,
// så en flik som stått öppen sedan förra omgången visade de gamla matcherna.

// Datan hämtas om när fliken visas och den är äldre än så här
export const DATA_MAX_AGE_MS = 5 * 60 * 1000;
export const needsReload = (loadedAt, now = Date.now()) => !loadedAt || now - loadedAt > DATA_MAX_AGE_MS;

// Krav, fördelning och lås sparas per omgång: betting.<typ>.<spel>.<omgång> (stryktips.js bKey, sharesKey, sealKey)
const DRAW_KEY = /^betting\.(spikes|fileShares|fileSharesPrev|sealed)\.(stryktipset|europatipset)\.(\d+)$/;

/** Nycklarna som hör till en annan omgång än den aktuella. Spel som saknas i datan (misslyckad hämtning) rörs inte. */
export function staleDrawKeys(keys, products) {
  const current = new Map((products || []).map((p) => [p.product, String(p.drawNumber)]));
  return keys.filter((k) => {
    const m = DRAW_KEY.exec(k);
    return !!m && current.has(m[2]) && current.get(m[2]) !== m[3];
  });
}
