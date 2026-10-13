// Cuper (config/leagues.json "cup": true): CL, EL, ECL, ACL, ACL2. Lagen hor till sina ligor; cupfilerna ar reserv.
//   CUPS -> ['CL', 'EL', 'ECL', 'ACL', 'ACL2'], isCup('ACL') -> true
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'config', 'leagues.json');
export const cupsOf = (registry) => Object.entries(registry?.leagues ?? {}).filter(([, l]) => l.cup).map(([c]) => c);
export const CUPS = cupsOf(JSON.parse(fs.readFileSync(FILE, 'utf8').replace(/^﻿/, '')));
const SET = new Set(CUPS);
export const isCup = (code) => SET.has(code);
