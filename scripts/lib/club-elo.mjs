// Klubb-Elo fran clubelo.com/{land} (inbaddad JSON) for klubbmatcher utan egen lagmodell: Europacup mellan lander,
// Allsvenskan, Eliteserien, Superligan m.fl. Cache i data/open/clubelo_all.json (24 h). Sidan ar langsam -> tidsgrans.
//   const elo = await clubEloFor([{ isoCode: 'SWE', name: 'Malmö FF' }, ...])   // -> Map(name -> { elo, clubEloName })
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findClubElo } from './elo-1x2.mjs';
import { getText } from './http.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = path.join(root, 'data', 'open', 'clubelo_all.json');
const MAX_AGE_H = 24;
// Svenska Spels isoCode (ISO 3166 alpha-3, ibland FIFA) -> clubelo:s landskod (Rumänien ROU, Lettland LVA - ROM/LAT ger
// clubelo:s allmänna topplista i stället för landet, rättat 2026-10-12)
export const ISO_TO_CLUBELO = {
  GBR: 'ENG', ENG: 'ENG', SCO: 'SCO', WAL: 'WAL', NIR: 'NIR', IRL: 'IRL', ESP: 'ESP', ITA: 'ITA', DEU: 'GER', GER: 'GER',
  FRA: 'FRA', NLD: 'NED', NED: 'NED', PRT: 'POR', POR: 'POR', BEL: 'BEL', TUR: 'TUR', AUT: 'AUT', CHE: 'SUI', SUI: 'SUI',
  GRC: 'GRE', GRE: 'GRE', DNK: 'DEN', DEN: 'DEN', NOR: 'NOR', SWE: 'SWE', FIN: 'FIN', CZE: 'CZE', POL: 'POL', UKR: 'UKR',
  HRV: 'CRO', CRO: 'CRO', SRB: 'SRB', HUN: 'HUN', ROU: 'ROU', ROM: 'ROU', BGR: 'BUL', SVK: 'SVK', SVN: 'SVN', CYP: 'CYP', ISR: 'ISR',
  RUS: 'RUS', AZE: 'AZE', KAZ: 'KAZ', ISL: 'ISL', BIH: 'BIH', ALB: 'ALB', MKD: 'MKD', MDA: 'MDA', GEO: 'GEO', ARM: 'ARM',
  BLR: 'BLR', LVA: 'LVA', LAT: 'LVA', LTU: 'LTU', EST: 'EST', LUX: 'LUX', MLT: 'MLT', MNE: 'MNE', XKX: 'KOS', KOS: 'KOS', FRO: 'FAR', AND: 'AND',
};

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { return { countries: {} }; }
}

async function fetchCountry(code) {
  try {
    const html = await getText(`https://clubelo.com/${code}`, { orNull: true, timeoutMs: 45_000, retries: 1 });
    if (!html) return null;
    const clubs = [];
    for (const obj of html.match(/\{[^{}]*"Federation":\s*"[^"]+"[^{}]*\}/g) || []) {
      const name = /"Name":\s*"([^"]+)"/.exec(obj)?.[1];
      const elo = Number(/"Elo":\s*([\d.]+)/.exec(obj)?.[1]);
      if (name && elo) clubs.push({ name: JSON.parse(`"${name}"`), elo: Math.round(elo * 10) / 10, level: Number(/"Level":\s*(\d+)/.exec(obj)?.[1]) || null });
    }
    return clubs.length ? clubs : null;
  } catch { return null; }
}

export async function clubEloFor(teams, log = () => {}) {
  const cache = readCache();
  const codes = [...new Set(teams.map((t) => ISO_TO_CLUBELO[t.isoCode]).filter(Boolean))];
  let changed = false;
  for (const code of codes) {
    const c = cache.countries[code];
    if (c && Date.now() - Date.parse(c.fetchedAt) < MAX_AGE_H * 3600e3) continue;
    const clubs = await fetchCountry(code);
    if (clubs) { cache.countries[code] = { fetchedAt: new Date().toISOString(), clubs }; changed = true; log(`  Klubb-Elo ${code}: ${clubs.length} lag`); }
    else log(`  Klubb-Elo ${code}: kunde inte hämtas (använder cache om den finns)`);
  }
  if (changed) { fs.mkdirSync(path.dirname(CACHE), { recursive: true }); fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1), 'utf8'); }
  const out = new Map();
  for (const t of teams) {
    // Samma matchning som findClubElo men bara lagets land: exakt namn utan accenter forst ("Bodö/Glimt" = "Bodø/Glimt")
    const code = ISO_TO_CLUBELO[t.isoCode];
    const hit = code && cache.countries[code] ? findClubElo(t.name, { countries: { [code]: cache.countries[code] } }, 0.6) : null;
    if (hit) out.set(t.name, { elo: hit.elo, clubEloName: hit.clubEloName });
  }
  return out;
}
