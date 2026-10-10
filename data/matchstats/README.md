# Matchstatistik per match

`npm run matchstats` (`scripts/fetch-matchstats.mjs`). Dagligen i molnet med `--recent` (innevarande och förra året, bara nya matcher). Färdiga matcher hämtas aldrig om.

- `<LIGA>/<år>.json`: en post per match (`matches[id]`), år = kalenderåret för matchdagen.
  - `src` = `espn` eller `365`, `d` datum, `k` avspark (UTC), `h`/`a` lagen (källans namn), `hg`/`ag` mål, `ht` halvtid, `ref` domare, `venue`, `att` publik, `form` formationer.
  - `t.h` / `t.a` = lagstatistik eller `null` när källan saknar den. Fält: `poss` bollinnehav %, `sh` skott, `sot` på mål, `blk` blockerade, `cor` hörnor, `fou` frisparkar (begångna), `yc`/`rc` kort, `off` offside, `sav` räddningar, `pas`/`pasok` passningar/lyckade, `cro`/`crook` inlägg, `lb`/`lbok` långbollar, `tkl`/`tklok` tacklingar, `int` brytningar, `clr` rensningar, `pkg`/`pks` straffmål/straffar (ESPN); `att` anfall, `bigch` stora chanser, `wood` stolpträffar, `fk` frisparkar, `thr` inkast, `gk` utsparkar (365scores).
  - `ev` = ur händelserna (finns även när lagstatistik saknas): `yc`/`rc` kort per lag (andra gula räknas som rött), `g1` mål i första halvlek.
  - `p` = spelare som spelat, en array per spelare i ordningen `playerCols`: id, namn, sida (h/a), position, start, inhopp, utbytt, minuter, mål, assist, självmål, skott, på mål, räddningar, skott mot, insläppta, frisparkar begångna, frisparkar mot sig, gula, röda, offside. Bara från förra året och framåt (äldre matcher har bara lagstatistik).
- `<LIGA>/spelare.json`: summa per spelare och kalenderår ur matcherna.
- `rapport.json`: senaste körningen per liga.

Källor: ESPN:s matchsammanfattning (config `espn` eller `espnStats`) och 365scores (config `s365`) för ligor ESPN saknar (Superettan, Ekstraklasa, HNL, Chance Liga, OBOS, K League, Kanada). 365scores ger bara ungefär ett år bakåt. Läses av `scripts/export-league-matches.mjs` till `data/matcher/<liga>.csv`.

Relaterat: `data/klubbtrupper/<LAG>.json` (klubbens egna uttagningar och truppstatus, `npm run klubbtrupper`, fylls i `data/trupper` som `injury.source = 'Klubben'`) och `data/opta/<LIGA>.json` (Opta-livescore med halvtid och kort med orsak, `npm run opta`, bara lokalt eftersom Opta kräver synlig webbläsare).
