# Div 1 Norra (SE3N) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/SE3N.csv`.

## Lärdomar i korthet

- 438 matcher (2025-03-28 – 2026-10-03): hemmavinst 43,4 %, kryss 21,0 %, bortavinst 35,6 %, 3,26 mål per match.
- Modellens 1X2-tips träffade 50,5 % (92/182). 
- Över/under 2,5: träff 58,8 % (182). BTTS: 55,5 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 46 % | 20 % | 34 % | 3,36 | 64 % | 65 % |
| 2026/27 | 198 | 40 % | 22 % | 37 % | 3,13 | 59 % | 57 % |

## Tabell nu (FotMob, 2026-10-04)

**Norra**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Stockholm Internazionale | 25 | 18 | 3 | 4 | 60-20 | 40 | 57 |
| 2 | AFC Eskilstuna | 25 | 14 | 5 | 6 | 47-34 | 13 | 47 |
| 3 | Hammarby Talang | 24 | 13 | 6 | 5 | 50-23 | 27 | 45 |
| 4 | Arlanda | 24 | 13 | 6 | 5 | 42-27 | 15 | 45 |
| 5 | FBK Karlstad | 25 | 12 | 7 | 6 | 41-35 | 6 | 43 |
| 6 | Enköping | 25 | 13 | 3 | 9 | 38-40 | -2 | 42 |
| 7 | Karlstad | 25 | 11 | 8 | 6 | 37-25 | 12 | 41 |
| 8 | Assyriska | 25 | 9 | 5 | 11 | 43-45 | -2 | 32 |
| 9 | Karlberg | 25 | 9 | 5 | 11 | 33-41 | -8 | 32 |
| 10 | Gefle | 25 | 9 | 3 | 13 | 29-43 | -14 | 30 |
| 11 | Umeå | 24 | 8 | 5 | 11 | 32-40 | -8 | 29 |
| 12 | Vasalund | 24 | 7 | 6 | 11 | 35-48 | -13 | 27 |
| 13 | Sollentuna | 25 | 5 | 9 | 11 | 24-36 | -12 | 24 |
| 14 | Piteå | 25 | 5 | 7 | 13 | 30-46 | -16 | 22 |
| 15 | Järfälla | 25 | 5 | 4 | 16 | 33-55 | -22 | 19 |
| 16 | Stocksund | 25 | 3 | 6 | 16 | 45-61 | -16 | 15 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/SE3N.json`.

## Lagfiler

- [AFC Eskilstuna](../lag/SE3N/afc-eskilstuna.md)
- [Arlanda](../lag/SE3N/arlanda.md)
- [Assyriska](../lag/SE3N/assyriska.md)
- [Enköping](../lag/SE3N/enkoping.md)
- [FBK Karlstad](../lag/SE3N/fbk-karlstad.md)
- [Gefle](../lag/SE3N/gefle.md)
- [Hammarby Talang](../lag/SE3N/hammarby-talang.md)
- [Järfälla](../lag/SE3N/jarfalla.md)
- [Karlberg](../lag/SE3N/karlberg.md)
- [Karlstad](../lag/SE3N/karlstad.md)
- [Piteå](../lag/SE3N/pitea.md)
- [Sollentuna](../lag/SE3N/sollentuna.md)
- [Stockholm Internazionale](../lag/SE3N/stockholm-internazionale.md)
- [Stocksund](../lag/SE3N/stocksund.md)
- [Umeå](../lag/SE3N/umea.md)
- [Vasalund](../lag/SE3N/vasalund.md)
