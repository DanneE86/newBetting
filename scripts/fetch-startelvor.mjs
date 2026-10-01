// Startelvor från FotMob för kommande Oddset-matcher och Stryktipsets/Europatipsets kuponger, plus statistik för
// spelare som saknas i data/spelare (landslagsspelare i ligor vi inte hämtar m.fl.). Sparas i data/startelvor.json
// och visas i GUI:t under "Startelva" på varje match (scripts/lib/startelva.mjs).
//   npm run elvor                 Oddset-matcher inom 4 dagar + kupongerna
//   npm run elvor -- --days 7     längre fram
//   npm run elvor -- --force      hämta om även bekräftade och nyss hämtade elvor
import { collectMatches, updateStore, readStore, writeStore } from './lib/startelva.mjs';
import { findMatch } from './lib/match-context.mjs';

const args = process.argv.slice(2);
const arg = (name, d) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const days = Number(arg('--days', 4));
const force = args.includes('--force');

const matches = collectMatches({ days });
console.log(`Startelvor: ${matches.length} matcher (Oddset inom ${days} dagar + kupongerna)`);
const t0 = Date.now();
const res = await updateStore(matches, { store: readStore(), force, findMatch, log: (s) => console.log(s) });
writeStore(res.store);
const withXi = res.store.matches.filter((m) => m.lineup);
const confirmed = withXi.filter((m) => m.lineup.confirmed).length;
console.log(`Klart på ${Math.round((Date.now() - t0) / 1000)} s: ${res.found} hittade på FotMob, ${res.missing} saknas, ${res.lineups} elvor hämtade nu`
  + ` (${withXi.length} med elva, ${confirmed} officiella), ${res.fetchedPlayers} spelare hämtade utöver data/spelare`);
