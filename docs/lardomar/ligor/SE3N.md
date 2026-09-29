# Div 1 Norra (SE3N) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/SE3N.csv`.

## Lärdomar i korthet

- 432 matcher (2025-03-28 – 2026-09-27): hemmavinst 43,3 %, kryss 20,6 %, bortavinst 36,1 %, 3,26 mål per match.
- Modellens 1X2-tips träffade 50,0 % (88/176). 
- Över/under 2,5: träff 60,2 % (176). BTTS: 55,1 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 46 % | 20 % | 34 % | 3,36 | 64 % | 65 % |
| 2026/27 | 192 | 40 % | 21 % | 39 % | 3,14 | 59 % | 56 % |

## Tabell nu (FotMob, 2026-09-29)

**Norra**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Stockholm Internazionale | 24 | 17 | 3 | 4 | 57-20 | 37 | 54 |
| 2 | AFC Eskilstuna | 24 | 14 | 4 | 6 | 45-32 | 13 | 46 |
| 3 | Hammarby Talang | 24 | 13 | 6 | 5 | 50-23 | 27 | 45 |
| 4 | Arlanda | 24 | 13 | 6 | 5 | 42-27 | 15 | 45 |
| 5 | FBK Karlstad | 24 | 12 | 6 | 6 | 39-33 | 6 | 42 |
| 6 | Karlstad | 24 | 11 | 7 | 6 | 36-24 | 12 | 40 |
| 7 | Enköping | 24 | 12 | 3 | 9 | 37-40 | -3 | 39 |
| 8 | Assyriska | 24 | 9 | 5 | 10 | 43-42 | 1 | 32 |
| 9 | Gefle | 24 | 9 | 3 | 12 | 29-42 | -13 | 30 |
| 10 | Umeå | 24 | 8 | 5 | 11 | 32-40 | -8 | 29 |
| 11 | Karlberg | 24 | 8 | 5 | 11 | 30-39 | -9 | 29 |
| 12 | Vasalund | 24 | 7 | 6 | 11 | 35-48 | -13 | 27 |
| 13 | Sollentuna | 24 | 5 | 9 | 10 | 22-33 | -11 | 24 |
| 14 | Piteå | 24 | 5 | 6 | 13 | 29-45 | -16 | 21 |
| 15 | Järfälla | 24 | 5 | 3 | 16 | 32-54 | -22 | 18 |
| 16 | Stocksund | 24 | 3 | 5 | 16 | 44-60 | -16 | 14 |

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
