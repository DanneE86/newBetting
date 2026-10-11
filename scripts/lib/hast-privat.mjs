// Hästfält som bara får finnas lokalt (gitignorerade data/hastar/interbet/<id>.json): aldrig i git eller på webbsidan.

export const PRIVATE_KEYS = ["ibP", "ibScore"];

/** Delar analysen: { analysis } utan privata fält + { priv } = { [leg]: { [nr]: { ibP, ibScore } } } (null om inga). */
export function splitPrivate(analysis) {
  const priv = {};
  const races = (analysis.races || []).map((r) => ({
    ...r,
    horses: r.horses.map((h) => {
      const own = {};
      const rest = { ...h };
      for (const k of PRIVATE_KEYS) if (k in rest) (own[k] = rest[k]), delete rest[k];
      if (Object.keys(own).length) (priv[r.leg] ||= {})[h.nr] = own;
      return rest;
    }),
  }));
  return { analysis: { ...analysis, races }, priv: Object.keys(priv).length ? priv : null };
}

/** Lägger tillbaka de privata fälten (lokalt). */
export function mergePrivate(analysis, priv) {
  if (!analysis || !priv) return analysis;
  return { ...analysis, races: analysis.races.map((r) => ({ ...r, horses: r.horses.map((h) => ({ ...h, ...(priv[r.leg]?.[h.nr] || {}) })) })) };
}
