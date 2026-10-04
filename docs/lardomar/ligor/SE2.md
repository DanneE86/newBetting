# Superettan (SE2) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/SE2.csv`.

## Lärdomar i korthet

- 439 matcher (2025-03-29 – 2026-09-20): hemmavinst 40,5 %, kryss 27,1 %, bortavinst 32,3 %, 2,88 mål per match.
- Modellens 1X2-tips träffade 41,5 % (76/183). 
- Över/under 2,5: träff 51,4 % (183). BTTS: 56,8 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 42 % | 27 % | 31 % | 2,86 | 56 % | 55 % |
| 2026/27 | 199 | 39 % | 27 % | 34 % | 2,90 | 56 % | 61 % |

## Stryktipset och Europatipset

20 matcher (Superettan). Kryss: utfall 40,0 %, vår procent 25,7 %, folket 24,1 %. Folket streckar favoriten ×1,10. Logloss vår/folket 1,121/1,139.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | IFK Norrköping | 25 | 17 | 4 | 4 | 48-16 | 32 | 55 |
| 2 | Falkenbergs FF | 25 | 13 | 6 | 6 | 46-33 | 13 | 45 |
| 3 | Varbergs BoIS FC | 25 | 13 | 5 | 7 | 44-33 | 11 | 44 |
| 4 | Östersunds FK | 25 | 11 | 10 | 4 | 33-24 | 9 | 43 |
| 5 | Landskrona BoIS | 25 | 11 | 7 | 7 | 39-26 | 13 | 40 |
| 6 | Sandvikens IF | 25 | 10 | 7 | 8 | 43-33 | 10 | 37 |
| 7 | IK Oddevold | 25 | 9 | 9 | 7 | 38-34 | 4 | 36 |
| 8 | Östers IF | 25 | 11 | 3 | 11 | 38-38 | 0 | 36 |
| 9 | Nordic United FC | 25 | 9 | 9 | 7 | 38-40 | -2 | 36 |
| 10 | Helsingborg | 25 | 8 | 6 | 11 | 36-45 | -9 | 30 |
| 11 | IFK Värnamo | 25 | 8 | 5 | 12 | 33-45 | -12 | 29 |
| 12 | Ljungskile | 25 | 6 | 7 | 12 | 31-38 | -7 | 25 |
| 13 | Norrby | 25 | 4 | 12 | 9 | 28-35 | -7 | 24 |
| 14 | Örebro | 25 | 5 | 9 | 11 | 27-39 | -12 | 24 |
| 15 | IK Brage | 25 | 5 | 8 | 12 | 39-48 | -9 | 23 |
| 16 | GIF Sundsvall | 25 | 6 | 1 | 18 | 19-53 | -34 | 19 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/SE2.json`.

## Lagfiler

- [Falkenbergs FF](../lag/SE2/falkenbergs-ff.md)
- [GIF Sundsvall](../lag/SE2/gif-sundsvall.md)
- [Helsingborg](../lag/SE2/helsingborg.md)
- [IFK Norrköping](../lag/SE2/ifk-norrkoping.md)
- [IFK Värnamo](../lag/SE2/ifk-varnamo.md)
- [IK Brage](../lag/SE2/ik-brage.md)
- [IK Oddevold](../lag/SE2/ik-oddevold.md)
- [Landskrona BoIS](../lag/SE2/landskrona-bois.md)
- [Ljungskile](../lag/SE2/ljungskile.md)
- [Nordic United FC](../lag/SE2/nordic-united-fc.md)
- [Norrby](../lag/SE2/norrby.md)
- [Sandvikens IF](../lag/SE2/sandvikens-if.md)
- [Varbergs BoIS FC](../lag/SE2/varbergs-bois-fc.md)
- [Örebro](../lag/SE2/orebro.md)
- [Östers IF](../lag/SE2/osters-if.md)
- [Östersunds FK](../lag/SE2/ostersunds-fk.md)
