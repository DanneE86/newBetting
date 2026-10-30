// Travsport-historik per häst för tiderna och Fa/Fo-delpoängen på fliken Hästar. Bara visning: läses aldrig av modellen.
// Källan är Sportinfo-filerna som scripts/fetch-travsport-hast.mjs sparar (data/hastar/travsport/ts<id>.json,
// gitignorerade). De görs här om till startrader i samma form som ATG-starterna (km, distans, startmetod, placering).
import fs from "node:fs";
import path from "node:path";

export const validHorseId = (id) => /^[1-9]\d{4,7}$/.test(String(id));
export const cachePath = (root, id) => path.join(root, "data", "hastar", "travsport", `ts${id}.json`);

const text = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const num = (s) => (/^\d+$/.test(text(s)) ? Number(text(s)) : null);

/** Km-tid "1.25,6" → 85,6 s. */
export function kmOf(s) {
  const m = text(s).match(/^(\d)\.(\d{1,2}),(\d)$/);
  return m ? 60 * Number(m[1]) + Number(m[2]) + Number(m[3]) / 10 : null;
}

const shoeKey = (s) => (/barfota runt om/i.test(s) ? "00" : /barfota fram/i.test(s) ? "01" : /barfota bak/i.test(s) ? "10" : /skor runt om/i.test(s) ? "11" : null);
const sulkyKey = (s) => (/amerik/i.test(s) ? "american" : /^sulky$|vanlig|normal/i.test(text(s)) ? "normal" : null);

/**
 * Sportinfo-filen (normalizeHorse i scripts/lib/travsport-hast.mjs) som historik: { version, horseId, name, fetchedAt,
 * lifeStarts, complete, records }. Kval, premielopp, strykningar och kommande starter räknas inte; galopp och
 * diskning behålls som starter men ger ingen giltig tid (hastar-times.js). complete = livstidsantalet stämmer.
 */
export function historyFromSportinfo(doc, horseId) {
  const records = [];
  const seen = new Set();
  for (const s of doc?.starter || []) {
    const result = text(s.resultat).toLowerCase();
    const category = text(s.kategori).toLowerCase();
    if (!s.datum || !result || ["k", "p"].includes(category) || /^(gdk|ejg|str)/.test(result)) continue;
    const key = `${s.datum}:${text(s.bana)}:${s.lopp}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const rawTime = text(s.tid).toLowerCase();
    records.push({
      date: s.datum,
      raceId: `st:${key}`,
      track: text(s.bana) || null,
      raceNumber: s.lopp ?? null,
      raceUrl: s.lopp_url || null,
      distance: num(s.distans),
      startMethod: s.autostart === true || /a/.test(rawTime) ? "auto" : s.autostart === false || (rawTime && rawTime !== "-") ? "volte" : null,
      km: kmOf(s.km_tid),
      place: /^\d+$/.test(result) ? Number(result) : null,
      galloped: s.galopp === true || /g/.test(rawTime),
      disqualified: /^d(?:\b|$)/.test(result),
      scratched: false,
      post: Number.isInteger(s.spar) ? s.spar : num(s.spar),
      driver: text(s.kusk) || null,
      trainer: text(s.tranare) || null,
      prize: Number.isFinite(s.vinst_kr) ? s.vinst_kr : null,
      shoeKey: shoeKey(s.skor),
      sulkyKey: sulkyKey(s.vagn),
      sport: category === "m" ? "monte" : "trot",
      rawTime,
      rawResult: result,
    });
  }
  records.sort((a, b) => b.date.localeCompare(a.date) || (b.raceNumber ?? 0) - (a.raceNumber ?? 0));
  const life = (doc?.sasong || []).find((x) => text(x.ar) === "Livs");
  const lifeStarts = Number.isInteger(life?.starter) ? life.starter : null;
  return {
    version: 1,
    horseId: Number(horseId),
    name: text(doc?.hast?.namn),
    source: "travsport",
    url: doc?.kalla || null,
    fetchedAt: doc?.hamtad || null,
    lifeStarts,
    complete: lifeStarts != null && lifeStarts === records.length,
    records,
  };
}

/** Hästens historik, null om Sportinfo-filen saknas eller inte går att läsa. */
export function readHistory(root, id) {
  if (!validHorseId(id)) return null;
  try {
    return historyFromSportinfo(JSON.parse(fs.readFileSync(cachePath(root, id), "utf8")), id);
  } catch {
    return null;
  }
}
