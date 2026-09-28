# Matcher per liga

En CSV per liga med alla matcher vi har: `status` = spelad eller kommande. Genereras av `npm run matcher` (körs dagligen). Rör inte för hand.

- Sannolikheter (`open_*`, `close_*`, `pre_*`) är utan bolagsmarginal. `pin_close` = 1 när stängningen är Pinnacle (annars bolagssnitt).
- `best_*` = bästa odds bland bolagen. `over25_*` = sannolikhet för över 2,5 mål.
- Signalerna (`luck`, `gap`, `mres`, `rest`, `h2h_*`, `promo`, `releg`, `miss_*`, `steam`, `book`) använder bara data före matchen, hemmalaget minus bortalaget. Se `docs/lardomar/README.md`.
- `pre_first_*` / `pre_last_*` = oddsen vi såg innan matchen (första och senaste avläsning, bolagssnitt i Sverige). De följer med när matchen blir spelad, så filen byggs på över tid.
- xG: `xg_src` = understat (topp 5) eller skott (uppskattat från skott och skott på mål).
- `referee`, hörnor `hc/ac`, frisparkar `hf/af`, gula `hy/ay`, röda `hr/ar` (där källan har det, främst 2023/24 och senare).

Relaterat, också per liga och med historik: aktuella trupper (skador, betyg, mål, marknadsvärde, vilka som lämnat, tränarbyten) i `data/trupper/<liga>.json` och tabell med daglig tabellhistorik i `data/ligor/<liga>.json` (`npm run trupper`). Lärdomar per liga och lag: `docs/lardomar/`.
