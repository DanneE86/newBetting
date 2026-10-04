# Champions League (CL) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Cup: lagen hör till sina ligor, se deras lagfiler. Alla matcher: `data/matcher/CL.csv`.

## Lärdomar i korthet

- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Paris Saint-Germain | 1 | 1 | 0 | 0 | 6-1 | 5 | 3 |
| 2 | Bayern Munich | 1 | 1 | 0 | 0 | 5-0 | 5 | 3 |
| 3 | Barcelona | 1 | 1 | 0 | 0 | 5-1 | 4 | 3 |
| 4 | Manchester United | 1 | 1 | 0 | 0 | 4-0 | 4 | 3 |
| 5 | Como | 1 | 1 | 0 | 0 | 4-1 | 3 | 3 |
| 6 | Sporting CP | 1 | 1 | 0 | 0 | 3-1 | 2 | 3 |
| 7 | VfB Stuttgart | 1 | 1 | 0 | 0 | 3-1 | 2 | 3 |
| 8 | Manchester City | 1 | 1 | 0 | 0 | 2-0 | 2 | 3 |
| 9 | Aston Villa | 1 | 1 | 0 | 0 | 3-2 | 1 | 3 |
| 10 | Lens | 1 | 1 | 0 | 0 | 3-2 | 1 | 3 |
| 11 | Real Betis | 1 | 1 | 0 | 0 | 3-2 | 1 | 3 |
| 12 | Borussia Dortmund | 1 | 1 | 0 | 0 | 3-2 | 1 | 3 |
| 13 | Liverpool | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 14 | Real Madrid | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 15 | Arsenal | 1 | 1 | 0 | 0 | 1-0 | 1 | 3 |
| 16 | AEK Athens | 1 | 1 | 0 | 0 | 1-0 | 1 | 3 |
| 17 | AS Roma | 1 | 0 | 1 | 0 | 1-1 | 0 | 1 |
| 18 | Shakhtar Donetsk | 1 | 0 | 1 | 0 | 1-1 | 0 | 1 |
| 19 | Fenerbahce | 1 | 0 | 1 | 0 | 1-1 | 0 | 1 |
| 20 | PSV Eindhoven | 1 | 0 | 1 | 0 | 1-1 | 0 | 1 |
| 21 | Villarreal | 1 | 0 | 0 | 1 | 2-3 | -1 | 0 |
| 22 | Club Brugge | 1 | 0 | 0 | 1 | 2-3 | -1 | 0 |
| 23 | Lille | 1 | 0 | 0 | 1 | 2-3 | -1 | 0 |
| 24 | Slavia Prague | 1 | 0 | 0 | 1 | 2-3 | -1 | 0 |
| 25 | Atlético Madrid | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 26 | Internazionale | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 27 | LASK Linz | 1 | 0 | 0 | 1 | 0-1 | -1 | 0 |
| 28 | Napoli | 1 | 0 | 0 | 1 | 0-1 | -1 | 0 |
| 29 | Galatasaray | 1 | 0 | 0 | 1 | 1-3 | -2 | 0 |
| 30 | Viking FK | 1 | 0 | 0 | 1 | 1-3 | -2 | 0 |
| 31 | FC Porto | 1 | 0 | 0 | 1 | 0-2 | -2 | 0 |
| 32 | RB Leipzig | 1 | 0 | 0 | 1 | 1-4 | -3 | 0 |
| 33 | Feyenoord Rotterdam | 1 | 0 | 0 | 1 | 1-5 | -4 | 0 |
| 34 | Sabah FK | 1 | 0 | 0 | 1 | 0-4 | -4 | 0 |
| 35 | Slovan Bratislava | 1 | 0 | 0 | 1 | 1-6 | -5 | 0 |
| 36 | Bodo/Glimt | 1 | 0 | 0 | 1 | 0-5 | -5 | 0 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/CL.json`.

## Trupper

Trupperna för cuplagen finns i `data/trupper/CL.json` och i lagens egna ligafiler.
