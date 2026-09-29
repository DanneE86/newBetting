// Vanliga missar: vilka matchtyper systemets grundrad (kupong A) missar i kupongarkivet (data/tips-archive/systems).
// En miss = utfallet låg utanför tecknen i grundraden, alltså en match där 13 rätt krävde tur.
// Grupper: spik/halvgardering x tecken x favoritens chans (vår procent), samt spikar per liga.
// Resultatet läggs i data/stryktipset.json (missProfile) och visas på Stryktipset/Europatipset A och B.
//   node scripts/lib/stryk-miss-profile.mjs   (bygger om profilen och uppdaterar data/stryktipset.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SIGNS = ['1', 'X', '2'];
// Favoritens chans delas i band. Samma gränser används i webben (stryktips.js) för att slå upp en match.
export const BAND_EDGES = [0.45, 0.55, 0.65, 0.75];
const BAND_LABELS = ['under 45 %', '45–55 %', '55–65 %', '65–75 %', 'minst 75 %'];
export const bandOf = (fav) => BAND_EDGES.filter((x) => fav >= x).length;
export const pickType = (signs) => (signs.length === 1 ? 'spik' : signs.length === 2 ? 'halv' : 'hel');
export const groupKey = (signs, fav) => `${pickType(signs)}|${signs}|${bandOf(fav)}`;

function groupLabel(signs, band) {
  const favTxt = signs === '1' ? 'hemmafavorit' : signs === '2' ? 'bortafavorit' : 'favorit';
  const type = signs.length === 1 ? `Spik ${signs}` : `Halvgardering ${signs.split('').join('')}`;
  return `${type} · ${favTxt} ${BAND_LABELS[band]}`;
}

const empty = () => ({ n: 0, miss: 0, exp: 0, by: { 1: 0, X: 0, 2: 0 } });
const r3 = (x) => Math.round(x * 1000) / 1000;

export function buildMissProfile(dir = path.join(root, 'data', 'tips-archive', 'systems')) {
  if (!fs.existsSync(dir)) return null;
  const groups = {}, leagues = {};
  const perDraw = [];
  let from = null, to = null, matches = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    let d;
    try {
      d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    } catch {
      continue;
    }
    const picks = d.A?.picks;
    if (!picks || !d.matches?.length || !d.outcomes) continue;
    const day = (d.closeTime || '').slice(0, 10);
    if (day && (!from || day < from)) from = day;
    if (day && (!to || day > to)) to = day;
    let outside = 0;
    d.matches.forEach((m, i) => {
      const pick = picks[i];
      if (!pick || !m.outcome || !m.final) return;
      matches++;
      const fav = Math.max(...m.final);
      const exp = 1 - [...pick].reduce((s, c) => s + m.final[SIGNS.indexOf(c)], 0);
      const miss = !pick.includes(m.outcome);
      if (miss) outside++;
      const add = (bucket, key) => {
        const g = (bucket[key] ||= empty());
        g.n++;
        g.exp += exp;
        if (miss) { g.miss++; g.by[m.outcome]++; }
      };
      if (pick.length < 3) add(groups, groupKey(pick, fav));
      if (pick.length === 1 && m.league) add(leagues, m.league);
    });
    perDraw.push(outside);
  }
  if (!perDraw.length) return null;
  const finish = (g) => ({ ...g, rate: r3(g.miss / g.n), exp: r3(g.exp / g.n) });
  const out = {};
  for (const [k, g] of Object.entries(groups)) {
    const [, signs, band] = k.split('|');
    out[k] = { ...finish(g), label: groupLabel(signs, Number(band)) };
  }
  const lg = {};
  for (const [k, g] of Object.entries(leagues)) if (g.n >= 25) lg[k] = finish(g);
  const dist = [0, 0, 0, 0];
  for (const x of perDraw) dist[Math.min(3, x)]++;
  return {
    builtAt: new Date().toISOString(),
    from, to, draws: perDraw.length, matches,
    bandEdges: BAND_EDGES, minN: 25,
    avgOutside: r3(perDraw.reduce((s, x) => s + x, 0) / perDraw.length),
    outsideDist: dist, // antal omgångar med 0, 1, 2 och minst 3 utfall utanför grundraden
    groups: out,
    leagues: lg,
  };
}

// Kör direkt: bygg om profilen och lägg in den i data/stryktipset.json
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prof = buildMissProfile();
  const file = path.join(root, 'data', 'stryktipset.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  data.missProfile = prof;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Vanliga missar: ${prof.draws} omgångar, ${prof.matches} matcher, snitt ${prof.avgOutside} utfall utanför grundraden -> data/stryktipset.json`);
}
