// Samma lag med olika stavning (config/team-aliases.json): variant -> namnet som anvands.
// Anvands av learnings-data (historik), export-league-matches (data/matcher) och pro-layer (oddshistorik).
// Update-BettingStore.ps1 laser samma fil.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'config', 'team-aliases.json');
let doc;
export function loadAliases(file = FILE) {
  if (doc !== undefined && file === FILE) return doc;
  let d = {};
  try { d = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')).leagues ?? {}; } catch { d = {}; }
  if (file === FILE) doc = d;
  return d;
}

/** Namnet som anvands for laget i ligan (oforandrat om det inte ar en kand variant). */
export function canonTeam(league, name, aliases = loadAliases()) {
  if (name == null) return name;
  return aliases[league]?.[name] ?? name;
}

// Bokstaver som inte delas upp av NFD (ø, æ, ß, ł, đ) skrivs om forst
const SPECIAL = { ø: 'o', Ø: 'o', æ: 'ae', Æ: 'ae', ß: 'ss', ł: 'l', Ł: 'l', đ: 'd', Đ: 'd', ı: 'i' };
const norm = (s) => String(s).replace(/[øØæÆßłŁđĐı]/g, (c) => SPECIAL[c]).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
/** Samma lag med olika fullstandighet i namnet? ("Inter" / "Internazionale", "FC Koln" / "1. FC Köln") */
export function sameTeamName(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  return x === y || (Math.min(x.length, y.length) >= 3 && (x.includes(y) || y.includes(x)));
}
