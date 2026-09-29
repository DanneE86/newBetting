# HNL (HR) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/HR.csv`.

## Lärdomar i korthet

- 227 matcher (2025-08-01 – 2026-09-20): hemmavinst 47,1 %, kryss 26,0 %, bortavinst 26,9 %, 2,74 mål per match.
- Modellens 1X2-tips träffade 64,3 % (18/28). 
- Över/under 2,5: träff 64,3 % (28). BTTS: 46,4 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 188 | 44 % | 27 % | 29 % | 2,65 | 48 % | 53 % |
| 2026/27 | 39 | 62 % | 21 % | 18 % | 3,15 | 64 % | 51 % |

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Dinamo Zagreb | 7 | 5 | 1 | 1 | 17-9 | 8 | 16 |
| 2 | Hajduk Split | 8 | 5 | 1 | 2 | 16-8 | 8 | 16 |
| 3 | Osijek | 8 | 5 | 1 | 2 | 17-11 | 6 | 16 |
| 4 | Varaždin | 8 | 4 | 3 | 1 | 13-7 | 6 | 15 |
| 5 | Rijeka | 7 | 4 | 2 | 1 | 13-7 | 6 | 14 |
| 6 | Istra 1961 | 8 | 2 | 3 | 3 | 14-13 | 1 | 9 |
| 7 | Lokomotiva Zagreb | 8 | 2 | 1 | 5 | 11-16 | -5 | 7 |
| 8 | Slaven Belupo Koprivnica | 8 | 2 | 1 | 5 | 7-16 | -9 | 7 |
| 9 | HNK Gorica | 8 | 1 | 2 | 5 | 5-12 | -7 | 5 |
| 10 | Rudeš | 8 | 1 | 1 | 6 | 10-24 | -14 | 4 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/HR.json`.

## Lagfiler

- [Dinamo Zagreb](../lag/HR/dinamo-zagreb.md)
- [HNK Gorica](../lag/HR/hnk-gorica.md)
- [Hajduk Split](../lag/HR/hajduk-split.md)
- [Istra 1961](../lag/HR/istra-1961.md)
- [Lokomotiva Zagreb](../lag/HR/lokomotiva-zagreb.md)
- [Osijek](../lag/HR/osijek.md)
- [Rijeka](../lag/HR/rijeka.md)
- [Rudeš](../lag/HR/rudes.md)
- [Slaven Belupo Koprivnica](../lag/HR/slaven-belupo-koprivnica.md)
- [Varaždin](../lag/HR/varazdin.md)
