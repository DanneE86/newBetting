# Chance Liga (CZ) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/CZ.csv`.

## Lärdomar i korthet

- 341 matcher (2025-07-18 – 2026-09-20): hemmavinst 43,1 %, kryss 24,0 %, bortavinst 32,8 %, 2,65 mål per match.
- Modellens 1X2-tips träffade 56,4 % (31/55). 
- Över/under 2,5: träff 49,1 % (55). BTTS: 43,6 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 270 | 43 % | 25 % | 33 % | 2,60 | 48 % | 49 % |
| 2026/27 | 71 | 45 % | 21 % | 34 % | 2,83 | 58 % | 54 % |

## Tabell nu (FotMob, 2026-09-28)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Slavia Prague | 9 | 7 | 2 | 0 | 25-6 | 19 | 23 |
| 2 | Slovan Liberec | 9 | 6 | 2 | 1 | 13-4 | 9 | 20 |
| 3 | Mladá Boleslav | 8 | 5 | 2 | 1 | 17-9 | 8 | 17 |
| 4 | Sigma Olomouc | 9 | 5 | 1 | 3 | 16-13 | 3 | 16 |
| 5 | Teplice | 9 | 5 | 1 | 3 | 17-15 | 2 | 16 |
| 6 | Zbrojovka Brno | 9 | 5 | 1 | 3 | 12-12 | 0 | 16 |
| 7 | Sparta Prague | 9 | 5 | 0 | 4 | 18-12 | 6 | 15 |
| 8 | Jablonec | 9 | 4 | 2 | 3 | 11-9 | 2 | 14 |
| 9 | Hradec Králové | 9 | 4 | 2 | 3 | 8-9 | -1 | 14 |
| 10 | Viktoria Plzeň | 9 | 2 | 4 | 3 | 17-17 | 0 | 10 |
| 11 | Baník Ostrava | 9 | 3 | 1 | 5 | 7-17 | -10 | 10 |
| 12 | Bohemians 1905 | 8 | 2 | 3 | 3 | 9-11 | -2 | 9 |
| 13 | Pardubice | 9 | 2 | 2 | 5 | 9-14 | -5 | 8 |
| 14 | Artis Brno | 9 | 1 | 2 | 6 | 7-18 | -11 | 5 |
| 15 | Slovácko | 9 | 0 | 4 | 5 | 7-16 | -9 | 4 |
| 16 | Zlín | 9 | 0 | 1 | 8 | 8-19 | -11 | 1 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/CZ.json`.

## Lagfiler

- [Artis Brno](../lag/CZ/artis-brno.md)
- [Baník Ostrava](../lag/CZ/banik-ostrava.md)
- [Bohemians 1905](../lag/CZ/bohemians-1905.md)
- [Hradec Králové](../lag/CZ/hradec-kralove.md)
- [Jablonec](../lag/CZ/jablonec.md)
- [Mladá Boleslav](../lag/CZ/mlada-boleslav.md)
- [Pardubice](../lag/CZ/pardubice.md)
- [Sigma Olomouc](../lag/CZ/sigma-olomouc.md)
- [Slavia Prague](../lag/CZ/slavia-prague.md)
- [Slovan Liberec](../lag/CZ/slovan-liberec.md)
- [Slovácko](../lag/CZ/slovacko.md)
- [Sparta Prague](../lag/CZ/sparta-prague.md)
- [Teplice](../lag/CZ/teplice.md)
- [Viktoria Plzeň](../lag/CZ/viktoria-plzen.md)
- [Zbrojovka Brno](../lag/CZ/zbrojovka-brno.md)
- [Zlín](../lag/CZ/zlin.md)
