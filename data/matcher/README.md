# Matcher per liga

En CSV per liga med alla matcher vi har: `status` = spelad, väntar (spelad men resultatet har inte kommit, högst 21 dagar) eller kommande. Genereras av `npm run matcher` (körs dagligen). Rör inte för hand.

- Sannolikheter (`open_*`, `close_*`, `pre_*`) är utan bolagsmarginal. `pin_close` = 1 när stängningen är Pinnacle. `close_src` = pinnacle, betfair (Betfair-börsen, sedan football-data slutade med Pinnacle 2026/27) eller snitt.
- `best_*` = bästa odds bland bolagen. `over25_*` = sannolikhet för över 2,5 mål.
- Signalerna (`luck`, `gap`, `mres`, `rest`, `h2h_*`, `promo`, `releg`, `miss_*`, `steam`, `book`) använder bara data före matchen, hemmalaget minus bortalaget. Se `docs/lardomar/README.md`.
- `pre_first_*` / `pre_last_*` = oddsen vi såg innan matchen (första och senaste avläsning, bolagssnitt i Sverige). De följer med när matchen blir spelad, så filen byggs på över tid.
- `pre_inj_*` = frånvaron i lagen före matchen (senaste avläsning ur `data/trupper`, sparas från 2026-10-05): antal skadade/avstängda (`pre_inj_h/a`) och deras andel av truppens marknadsvärde (`pre_injv_h/a`). I engelska ligorna FotMob + Transfermarkts skadelista.
- xG: `xg_src` = understat (topp 5), football-data (riktig xG, från 2026/27) eller skott (uppskattat från skott och skott på mål).
- `referee`, hörnor `hc/ac`, frisparkar `hf/af`, gula `hy/ay`, röda `hr/ar` (där källan har det, främst 2023/24 och senare; direkt ur football-data-CSV:n när betting-store inte har dem än).
- Matchstatistik från ESPN/365scores (`data/matchstats`, `npm run matchstats`), `stats_src` = espn, 365 eller opta: fyller tomma skott, hörnor, frisparkar, kort och domare (football-data går före) och ger bollinnehav `poss_*` (%), passningar `pas_*` / lyckade `pasok_*`, offside `off_*`, räddningar `sav_*`, blockerade skott `blk_*`, tacklingar `tkl_*`, brytningar `int_*`, inlägg `cro_*`, anfall `att_*` och stora chanser `bigch_*` (bara 365scores), halvtid `htg_*`, formation `form_*`, arena `venue` och publik `att`. Lagstatistik finns från ungefär 2024 i Norden och Japan, längre bak i de flesta andra ligor; äldre matcher har bara halvtid och kort. Opta (`npm run opta`) används bara när ESPN/365scores saknar matchen.

Relaterat, också per liga och med historik: aktuella trupper (skador, betyg, mål, marknadsvärde, vilka som lämnat, tränarbyten) i `data/trupper/<liga>.json` och tabell med daglig tabellhistorik i `data/ligor/<liga>.json` (`npm run trupper`). Lärdomar per liga och lag: `docs/lardomar/`.
