# Europa League (EL) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Cup: lagen hör till sina ligor, se deras lagfiler. Alla matcher: `data/matcher/EL.csv`.

## Lärdomar i korthet

- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Stryktipset och Europatipset

17 matcher (Europa League). Kryss: utfall 23,5 %, vår procent 25,4 %, folket 23,8 %. Folket streckar favoriten ×1,10. Logloss vår/folket 0,971/0,968.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Juventus | 1 | 1 | 0 | 0 | 5-0 | 5 | 3 |
| 2 | Crystal Palace | 1 | 1 | 0 | 0 | 4-0 | 4 | 3 |
| 3 | Sparta Prague | 1 | 1 | 0 | 0 | 4-1 | 3 | 3 |
| 4 | Besiktas | 1 | 1 | 0 | 0 | 4-1 | 3 | 3 |
| 5 | Union St.-Gilloise | 1 | 1 | 0 | 0 | 3-0 | 3 | 3 |
| 6 | Ferencvaros | 1 | 1 | 0 | 0 | 3-1 | 2 | 3 |
| 7 | Benfica | 1 | 1 | 0 | 0 | 2-0 | 2 | 3 |
| 8 | Bayer Leverkusen | 1 | 1 | 0 | 0 | 2-0 | 2 | 3 |
| 9 | OFI CRETE | 1 | 1 | 0 | 0 | 2-0 | 2 | 3 |
| 10 | AFC Bournemouth | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 11 | Lyon | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 12 | Torreense | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 13 | Olympiacos | 1 | 1 | 0 | 0 | 2-1 | 1 | 3 |
| 14 | RB Salzburg | 1 | 1 | 0 | 0 | 1-0 | 1 | 3 |
| 15 | Omonia Nicosia | 1 | 1 | 0 | 0 | 1-0 | 1 | 3 |
| 16 | Sunderland | 1 | 1 | 0 | 0 | 1-0 | 1 | 3 |
| 17 | Dinamo Zagreb | 1 | 0 | 1 | 0 | 0-0 | 0 | 1 |
| 18 | Hapoel Be'er | 1 | 0 | 1 | 0 | 0-0 | 0 | 1 |
| 19 | Stade Rennais | 1 | 0 | 1 | 0 | 0-0 | 0 | 1 |
| 20 | SK Sturm Graz | 1 | 0 | 1 | 0 | 0-0 | 0 | 1 |
| 21 | Jagiellonia Bialystok | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 22 | Anderlecht | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 23 | Lillestrom | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 24 | Real Sociedad | 1 | 0 | 0 | 1 | 1-2 | -1 | 0 |
| 25 | AZ Alkmaar | 1 | 0 | 0 | 1 | 0-1 | -1 | 0 |
| 26 | Celta Vigo | 1 | 0 | 0 | 1 | 0-1 | -1 | 0 |
| 27 | Levski Sofia | 1 | 0 | 0 | 1 | 0-1 | -1 | 0 |
| 28 | Celtic | 1 | 0 | 0 | 1 | 1-3 | -2 | 0 |
| 29 | AC Milan | 1 | 0 | 0 | 1 | 0-2 | -2 | 0 |
| 30 | TSG Hoffenheim | 1 | 0 | 0 | 1 | 0-2 | -2 | 0 |
| 31 | NK Celje | 1 | 0 | 0 | 1 | 0-2 | -2 | 0 |
| 32 | Marseille | 1 | 0 | 0 | 1 | 1-4 | -3 | 0 |
| 33 | ARARAT-ARMENIA | 1 | 0 | 0 | 1 | 1-4 | -3 | 0 |
| 34 | Viktoria Plzen | 1 | 0 | 0 | 1 | 0-3 | -3 | 0 |
| 35 | Lech Poznan | 1 | 0 | 0 | 1 | 0-4 | -4 | 0 |
| 36 | NEC Nijmegen | 1 | 0 | 0 | 1 | 0-5 | -5 | 0 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/EL.json`.

## Trupper

Trupperna för cuplagen finns i `data/trupper/EL.json` och i lagens egna ligafiler.
