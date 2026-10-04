# Div 1 Södra (SE3S) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/SE3S.csv`.

## Lärdomar i korthet

- 439 matcher (2025-03-28 – 2026-10-03): hemmavinst 44,2 %, kryss 23,7 %, bortavinst 32,1 %, 3,04 mål per match.
- Modellens 1X2-tips träffade 45,4 % (83/183). 
- Över/under 2,5: träff 54,1 % (183). BTTS: 55,7 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 46 % | 22 % | 32 % | 3,03 | 62 % | 55 % |
| 2026/27 | 199 | 42 % | 26 % | 32 % | 3,04 | 60 % | 59 % |

## Tabell nu (FotMob, 2026-10-04)

**Soedra**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Trelleborg | 24 | 15 | 6 | 3 | 53-28 | 25 | 51 |
| 2 | Åtvidaberg | 25 | 13 | 7 | 5 | 49-35 | 14 | 46 |
| 3 | Hässleholm | 25 | 14 | 3 | 8 | 46-30 | 16 | 45 |
| 4 | Lund | 25 | 11 | 8 | 6 | 46-29 | 17 | 41 |
| 5 | AFC Malmö | 25 | 11 | 8 | 6 | 45-35 | 10 | 41 |
| 6 | Trollhättan | 25 | 10 | 8 | 7 | 42-37 | 5 | 38 |
| 7 | Rosengård | 25 | 10 | 8 | 7 | 41-37 | 4 | 38 |
| 8 | Jönköping Södra | 25 | 9 | 6 | 10 | 29-26 | 3 | 33 |
| 9 | Tvååker | 25 | 9 | 6 | 10 | 33-39 | -6 | 33 |
| 10 | Skövde AIK | 25 | 8 | 9 | 8 | 31-38 | -7 | 33 |
| 11 | Eskilsminne | 25 | 9 | 5 | 11 | 40-44 | -4 | 32 |
| 12 | BK Olympic | 24 | 9 | 3 | 12 | 41-46 | -5 | 30 |
| 13 | Kristianstad | 25 | 7 | 6 | 12 | 29-37 | -8 | 27 |
| 14 | Laholm | 25 | 7 | 4 | 14 | 32-43 | -11 | 25 |
| 15 | Ängelholm | 25 | 4 | 9 | 12 | 31-47 | -16 | 21 |
| 16 | Utsikten | 25 | 2 | 6 | 17 | 23-60 | -37 | 12 |

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
