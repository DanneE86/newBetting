# 1. division (DK2) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/DK2.csv`.

## Lärdomar i korthet

- 246 matcher (2025-07-18 – 2026-09-21): hemmavinst 38,2 %, kryss 29,7 %, bortavinst 32,1 %, 2,80 mål per match.
- Modellens 1X2-tips träffade 35,7 % (15/42). Det är sämre än att alltid tippa hemmavinst (38,2 %), så modellen behöver granskas i ligan.
- Över/under 2,5: träff 50,0 % (42). BTTS: 54,8 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 192 | 40 % | 27 % | 33 % | 2,80 | 55 % | 55 % |
| 2026/27 | 54 | 33 % | 39 % | 28 % | 2,78 | 56 % | 63 % |

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Hvidovre | 9 | 6 | 3 | 0 | 18-9 | 9 | 21 |
| 2 | Vejle | 9 | 5 | 4 | 0 | 22-13 | 9 | 19 |
| 3 | Fredericia | 9 | 3 | 5 | 1 | 12-6 | 6 | 14 |
| 4 | Aarhus Fremad | 9 | 3 | 4 | 2 | 10-9 | 1 | 13 |
| 5 | AaB | 9 | 3 | 4 | 2 | 11-11 | 0 | 13 |
| 6 | Hobro | 9 | 4 | 1 | 4 | 12-16 | -4 | 13 |
| 7 | Vendsyssel | 9 | 2 | 4 | 3 | 10-14 | -4 | 10 |
| 8 | AB Gladsaxe | 9 | 2 | 3 | 4 | 11-10 | 1 | 9 |
| 9 | Hillerød | 9 | 2 | 3 | 4 | 13-14 | -1 | 9 |
| 10 | Kolding | 9 | 1 | 5 | 3 | 10-12 | -2 | 8 |
| 11 | Køge | 9 | 1 | 4 | 4 | 11-17 | -6 | 7 |
| 12 | Esbjerg | 9 | 1 | 2 | 6 | 10-19 | -9 | 5 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/DK2.json`.

## Lagfiler

- [AB Gladsaxe](../lag/DK2/ab-gladsaxe.md)
- [AaB](../lag/DK2/aab.md)
- [Aarhus Fremad](../lag/DK2/aarhus-fremad.md)
- [Esbjerg](../lag/DK2/esbjerg.md)
- [Fredericia](../lag/DK2/fredericia.md)
- [Hillerød](../lag/DK2/hiller-d.md)
- [Hobro](../lag/DK2/hobro.md)
- [Hvidovre](../lag/DK2/hvidovre.md)
- [Kolding](../lag/DK2/kolding.md)
- [Køge](../lag/DK2/k-ge.md)
- [Vejle](../lag/DK2/vejle.md)
- [Vendsyssel](../lag/DK2/vendsyssel.md)
