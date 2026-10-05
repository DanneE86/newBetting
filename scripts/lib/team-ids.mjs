// Ett ID per lag (config/team-ids.json): FotMob:s lag-ID (fotmob.com/teams/<id>), annars ett eget ID fran OWN_START.
// Samma klubb far samma ID i alla ligor/cuper och oavsett stavning ("FC Copenhagen" = "F.C. København" = 8391).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'config', 'team-ids.json');
// Egna ID ligger langt over FotMob:s lag-ID (som ar under en miljon) sa de aldrig krockar
export const OWN_START = 90_000_001;

let doc;
export function loadTeamIds(file = FILE) {
  if (doc !== undefined && file === FILE) return doc;
  let d = {};
  try { d = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')).leagues ?? {}; } catch { d = {}; }
  if (file === FILE) doc = d;
  return d;
}

/** Lagets ID i ligan, eller null om laget inte finns i registret. */
export function teamId(league, name, ids = loadTeamIds()) {
  return ids[league]?.[name] ?? null;
}

export const isOwnId = (id) => Number(id) >= OWN_START;

/**
 * Bygger registret. squads: { liga: { vartNamn: fotmobId } }, names: { liga: [vara namn] }, prev: tidigare register,
 * country: { liga: land } (cuper utan land), searched: { "LIGA|namn": FotMob-ID } fran FotMob-sok. Ordning per lag:
 *  1. FotMob-ID fran ligans trupp  2. samma namn i en annan liga i samma land (Aston Villa i CH = PL:s ID)
 *  3. cup: samma namn med ett enda FotMob-ID i nagon liga  4. FotMob-sok  5. tidigare ID  6. eget ID, delat inom landet.
 * Samma namn i olika lander delar aldrig ID (kan vara olika klubbar).
 */
export function buildTeamIds({ squads = {}, names = {}, prev = {}, country = {}, searched = {} }) {
  const out = {};
  let next = OWN_START;
  for (const lg of Object.values(prev)) for (const id of Object.values(lg)) if (isOwnId(id) && id >= next) next = id + 1;
  const land = (lg) => country[lg] ?? null;
  const fmByLand = new Map(); // "land|namn" -> FotMob-ID
  const fmAll = new Map(); // namn -> Set av FotMob-ID
  for (const [lg, m] of Object.entries(squads)) for (const [n, id] of Object.entries(m)) {
    if (land(lg)) fmByLand.set(`${land(lg)}|${n}`, Number(id));
    (fmAll.get(n) ?? fmAll.set(n, new Set()).get(n)).add(Number(id));
  }
  const ownByLand = new Map();
  for (const [lg, m] of Object.entries(prev)) for (const [n, id] of Object.entries(m)) if (isOwnId(id) && land(lg)) ownByLand.set(`${land(lg)}|${n}`, id);
  const leagues = [...new Set([...Object.keys(prev), ...Object.keys(squads), ...Object.keys(names)])].sort();
  for (const lg of leagues) {
    const all = [...new Set([...Object.keys(prev[lg] ?? {}), ...Object.keys(squads[lg] ?? {}), ...(names[lg] ?? [])])].sort();
    const m = {};
    for (const n of all) {
      const key = `${land(lg)}|${n}`;
      const cup = !land(lg) && fmAll.get(n)?.size === 1 ? [...fmAll.get(n)][0] : null;
      const fm = Number(squads[lg]?.[n]) || (land(lg) ? fmByLand.get(key) : cup) || Number(searched[`${lg}|${n}`]) || null;
      const old = prev[lg]?.[n] ?? null;
      let id = fm ?? (old != null && !isOwnId(old) ? old : null);
      if (id == null) {
        id = (land(lg) && ownByLand.get(key)) || (isOwnId(old) ? old : next++);
        if (land(lg)) ownByLand.set(key, id);
      } else if (land(lg)) fmByLand.set(key, id);
      m[n] = id;
    }
    out[lg] = m;
  }
  return out;
}
