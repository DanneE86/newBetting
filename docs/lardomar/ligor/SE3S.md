# Div 1 Södra (SE3S) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/SE3S.csv`.

## Lärdomar i korthet

- 432 matcher (2025-03-28 – 2026-09-27): hemmavinst 44,4 %, kryss 23,8 %, bortavinst 31,7 %, 3,05 mål per match.
- Modellens 1X2-tips träffade 45,5 % (80/176). 
- Över/under 2,5: träff 55,1 % (176). BTTS: 55,1 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 46 % | 22 % | 32 % | 3,03 | 62 % | 55 % |
| 2026/27 | 192 | 43 % | 26 % | 31 % | 3,07 | 61 % | 60 % |

## Tabell nu (FotMob, 2026-09-29)

**Soedra**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Trelleborg | 24 | 15 | 6 | 3 | 53-28 | 25 | 51 |
| 2 | Åtvidaberg | 24 | 13 | 6 | 5 | 48-34 | 14 | 45 |
| 3 | Hässleholm | 24 | 13 | 3 | 8 | 44-29 | 15 | 42 |
| 4 | Lund | 24 | 11 | 8 | 5 | 46-28 | 18 | 41 |
| 5 | AFC Malmö | 24 | 10 | 8 | 6 | 44-35 | 9 | 38 |
| 6 | Rosengård | 24 | 10 | 8 | 6 | 41-34 | 7 | 38 |
| 7 | Trollhättan | 24 | 10 | 7 | 7 | 41-36 | 5 | 37 |
| 8 | Jönköping Södra | 24 | 9 | 6 | 9 | 29-25 | 4 | 33 |
| 9 | Tvååker | 24 | 9 | 6 | 9 | 32-37 | -5 | 33 |
| 10 | BK Olympic | 24 | 9 | 3 | 12 | 41-46 | -5 | 30 |
| 11 | Skövde AIK | 24 | 7 | 9 | 8 | 28-36 | -8 | 30 |
| 12 | Eskilsminne | 24 | 8 | 5 | 11 | 39-44 | -5 | 29 |
| 13 | Kristianstad | 24 | 7 | 6 | 11 | 29-36 | -7 | 27 |
| 14 | Laholm | 24 | 6 | 4 | 14 | 31-43 | -12 | 22 |
| 15 | Ängelholm | 24 | 3 | 9 | 12 | 28-47 | -19 | 18 |
| 16 | Utsikten | 24 | 2 | 6 | 16 | 21-57 | -36 | 12 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/SE3S.json`.

## Lagfiler

- [AFC Malmö](../lag/SE3S/afc-malmo.md)
- [BK Olympic](../lag/SE3S/bk-olympic.md)
- [Eskilsminne](../lag/SE3S/eskilsminne.md)
- [Hässleholm](../lag/SE3S/hassleholm.md)
- [Jönköping Södra](../lag/SE3S/jonkoping-sodra.md)
- [Kristianstad](../lag/SE3S/kristianstad.md)
- [Laholm](../lag/SE3S/laholm.md)
- [Lund](../lag/SE3S/lund.md)
- [Rosengård](../lag/SE3S/rosengard.md)
- [Skövde AIK](../lag/SE3S/skovde-aik.md)
- [Trelleborg](../lag/SE3S/trelleborg.md)
- [Trollhättan](../lag/SE3S/trollhattan.md)
- [Tvååker](../lag/SE3S/tvaaker.md)
- [Utsikten](../lag/SE3S/utsikten.md)
- [Ängelholm](../lag/SE3S/angelholm.md)
- [Åtvidaberg](../lag/SE3S/atvidaberg.md)
