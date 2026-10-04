# OBOS-ligaen (NO2) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/NO2.csv`.

## Lärdomar i korthet

- 429 matcher (2025-03-31 – 2026-10-03): hemmavinst 44,5 %, kryss 22,1 %, bortavinst 33,3 %, 3,48 mål per match.
- Modellens 1X2-tips träffade 52,3 % (90/172). 
- Över/under 2,5: träff 67,4 % (172). BTTS: 61,6 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 40 % | 26 % | 33 % | 3,20 | 63 % | 63 % |
| 2026/27 | 189 | 50 % | 17 % | 33 % | 3,85 | 72 % | 64 % |

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Haugesund | 24 | 18 | 1 | 5 | 74-39 | 35 | 55 |
| 2 | Strømsgodset | 24 | 15 | 6 | 3 | 61-31 | 30 | 51 |
| 3 | Kongsvinger | 23 | 15 | 5 | 3 | 68-35 | 33 | 50 |
| 4 | Stabæk | 24 | 14 | 3 | 7 | 57-31 | 26 | 45 |
| 5 | Odd | 24 | 11 | 6 | 7 | 50-38 | 12 | 39 |
| 6 | Bryne | 23 | 11 | 2 | 10 | 32-31 | 1 | 35 |
| 7 | Hødd | 24 | 10 | 4 | 10 | 40-48 | -8 | 34 |
| 8 | Ranheim | 24 | 9 | 4 | 11 | 61-58 | 3 | 31 |
| 9 | Egersund | 24 | 8 | 5 | 11 | 36-49 | -13 | 29 |
| 10 | Lyn | 23 | 8 | 4 | 11 | 39-48 | -9 | 28 |
| 11 | Strømmen | 24 | 7 | 5 | 12 | 38-55 | -17 | 26 |
| 12 | Sandnes Ulf | 24 | 7 | 4 | 13 | 35-45 | -10 | 25 |
| 13 | Moss | 23 | 7 | 4 | 12 | 38-52 | -14 | 25 |
| 14 | Sogndal | 23 | 6 | 5 | 12 | 38-53 | -15 | 23 |
| 15 | Åsane | 24 | 5 | 5 | 14 | 34-53 | -19 | 19 |
| 16 | Raufoss | 23 | 6 | 1 | 16 | 26-61 | -35 | 19 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/NO2.json`.

## Lagfiler

- [Bryne](../lag/NO2/bryne.md)
- [Egersund](../lag/NO2/egersund.md)
- [Haugesund](../lag/NO2/haugesund.md)
- [Hødd](../lag/NO2/h-dd.md)
- [Kongsvinger](../lag/NO2/kongsvinger.md)
- [Lyn](../lag/NO2/lyn.md)
- [Moss](../lag/NO2/moss.md)
- [Odd](../lag/NO2/odd.md)
- [Ranheim](../lag/NO2/ranheim.md)
- [Raufoss](../lag/NO2/raufoss.md)
- [Sandnes Ulf](../lag/NO2/sandnes-ulf.md)
- [Sogndal](../lag/NO2/sogndal.md)
- [Stabæk](../lag/NO2/stab-k.md)
- [Strømmen](../lag/NO2/str-mmen.md)
- [Strømsgodset](../lag/NO2/str-msgodset.md)
- [Åsane](../lag/NO2/asane.md)
