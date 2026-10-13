// Sasonger raknade fran datum och config/leagues.json i stallet for hardkodade ar.
// Host-var-ligor byter sasong 1 juli, kalenderarsligor (leagues.json "calendarYear": true) 1 januari.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const todayIso = () => new Date().toISOString().slice(0, 10);

let registry;
/** config/leagues.json (lases en gang). */
export function leagueRegistry() {
  registry ??= JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'leagues.json'), 'utf8').replace(/^﻿/, ''));
  return registry;
}

/** Ligakoder som spelar over kalenderaret. */
export function calendarLeagues(reg = leagueRegistry()) {
  return new Set(Object.entries(reg.leagues ?? {}).filter(([, l]) => l.calendarYear).map(([code]) => code));
}

/** Startaret for host-var-sasongen som pagar ("2026-10-13" -> 2026, "2027-03-01" -> 2026). */
export function seasonStartYear(ymd = todayIso()) {
  const [y, m] = String(ymd).split('-').map(Number);
  return m >= 7 ? y : y - 1;
}

/** 2026 -> "2026/27" */
export const splitSeasonLabel = (y) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;

/** 2026 -> "2627" (football-data mmz4281, data/raw/<LIGA>_2627.csv) */
export const seasonCode = (y) => `${String(y % 100).padStart(2, '0')}${String((y + 1) % 100).padStart(2, '0')}`;

/** De n senaste sasongsetiketterna som finns bland matcherna (en liga i taget). */
export function latestSeasons(matches, n = 2) {
  return new Set([...new Set((matches ?? []).map((m) => m.season).filter(Boolean))].sort().slice(-n));
}
