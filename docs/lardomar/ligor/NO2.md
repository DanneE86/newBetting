# OBOS-ligaen (NO2) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/NO2.csv`.

## Lärdomar i korthet

- 424 matcher (2025-03-31 – 2026-09-20): hemmavinst 44,3 %, kryss 22,2 %, bortavinst 33,5 %, 3,48 mål per match.
- Modellens 1X2-tips träffade 52,1 % (87/167). 
- Över/under 2,5: träff 67,7 % (167). BTTS: 62,3 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 40 % | 26 % | 33 % | 3,20 | 63 % | 63 % |
| 2026/27 | 184 | 49 % | 17 % | 34 % | 3,85 | 72 % | 65 % |

## Tabell nu (FotMob, 2026-09-28)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Haugesund | 23 | 17 | 1 | 5 | 72-39 | 33 | 52 |
| 2 | Kongsvinger | 23 | 15 | 5 | 3 | 68-35 | 33 | 50 |
| 3 | Strømsgodset | 23 | 14 | 6 | 3 | 60-31 | 29 | 48 |
| 4 | Stabæk | 23 | 14 | 3 | 6 | 57-29 | 28 | 45 |
| 5 | Odd | 23 | 10 | 6 | 7 | 47-36 | 11 | 36 |
| 6 | Bryne | 23 | 11 | 2 | 10 | 32-31 | 1 | 35 |
| 7 | Hødd | 23 | 10 | 4 | 9 | 38-45 | -7 | 34 |
| 8 | Egersund | 23 | 8 | 5 | 10 | 36-44 | -8 | 29 |
| 9 | Ranheim | 23 | 8 | 4 | 11 | 56-58 | -2 | 28 |
| 10 | Lyn | 23 | 8 | 4 | 11 | 39-48 | -9 | 28 |
| 11 | Moss | 23 | 7 | 4 | 12 | 38-52 | -14 | 25 |
| 12 | Strømmen | 23 | 7 | 4 | 12 | 35-52 | -17 | 25 |
| 13 | Sandnes Ulf | 23 | 7 | 3 | 13 | 32-42 | -10 | 24 |
| 14 | Sogndal | 23 | 6 | 5 | 12 | 38-53 | -15 | 23 |
| 15 | Åsane | 23 | 5 | 5 | 13 | 34-52 | -18 | 19 |
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
