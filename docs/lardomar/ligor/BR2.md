# Brasileirão Série B (BR2) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/BR2.csv`.

## Lärdomar i korthet

- 676 matcher (2025-04-04 – 2026-09-27): hemmavinst 45,4 %, kryss 29,1 %, bortavinst 25,4 %, 2,27 mål per match.
- Modellens 1X2-tips träffade 49,3 % (136/276). 
- Över/under 2,5: träff 57,6 % (276). BTTS: 52,2 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 46 % | 31 % | 24 % | 2,22 | 40 % | 49 % |
| 2026/27 | 296 | 45 % | 27 % | 28 % | 2,34 | 43 % | 48 % |

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Vila Nova | 30 | 16 | 6 | 8 | 43-31 | 12 | 54 |
| 2 | Juventude | 30 | 15 | 8 | 7 | 32-19 | 13 | 53 |
| 3 | Fortaleza | 30 | 14 | 10 | 6 | 35-26 | 9 | 52 |
| 4 | Novorizontino | 30 | 14 | 9 | 7 | 49-27 | 22 | 51 |
| 5 | Criciúma | 30 | 14 | 8 | 8 | 31-27 | 4 | 50 |
| 6 | Atlético Goianiense | 30 | 13 | 10 | 7 | 37-27 | 10 | 49 |
| 7 | CRB | 30 | 14 | 6 | 10 | 45-41 | 4 | 48 |
| 8 | Operário PR | 30 | 13 | 9 | 8 | 43-38 | 5 | 48 |
| 9 | Sport | 30 | 11 | 11 | 8 | 40-32 | 8 | 44 |
| 10 | Cuiabá | 30 | 10 | 13 | 7 | 30-25 | 5 | 43 |
| 11 | Goiás | 30 | 12 | 6 | 12 | 30-36 | -6 | 42 |
| 12 | São Bernardo | 30 | 11 | 9 | 10 | 40-31 | 9 | 42 |
| 13 | Athletic | 30 | 10 | 12 | 8 | 36-33 | 3 | 42 |
| 14 | Náutico | 30 | 11 | 8 | 11 | 38-37 | 1 | 41 |
| 15 | Ceará | 30 | 9 | 9 | 12 | 33-39 | -6 | 36 |
| 16 | Botafogo-SP | 29 | 8 | 8 | 13 | 32-36 | -4 | 32 |
| 17 | Avaí | 30 | 8 | 6 | 16 | 30-41 | -11 | 30 |
| 18 | Londrina | 30 | 7 | 7 | 16 | 39-43 | -4 | 28 |
| 19 | América Mineiro | 30 | 4 | 5 | 21 | 21-50 | -29 | 17 |
| 20 | Ponte Preta | 29 | 3 | 4 | 22 | 17-62 | -45 | 13 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/BR2.json`.

## Lagfiler

- [América Mineiro](../lag/BR2/america-mineiro.md)
- [Athletic](../lag/BR2/athletic.md)
- [Atlético Goianiense](../lag/BR2/atletico-goianiense.md)
- [Avaí](../lag/BR2/avai.md)
- [Botafogo-SP](../lag/BR2/botafogo-sp.md)
- [CRB](../lag/BR2/crb.md)
- [Ceará](../lag/BR2/ceara.md)
- [Criciúma](../lag/BR2/criciuma.md)
- [Cuiabá](../lag/BR2/cuiaba.md)
- [Fortaleza](../lag/BR2/fortaleza.md)
- [Goiás](../lag/BR2/goias.md)
- [Juventude](../lag/BR2/juventude.md)
- [Londrina](../lag/BR2/londrina.md)
- [Novorizontino](../lag/BR2/novorizontino.md)
- [Náutico](../lag/BR2/nautico.md)
- [Operário PR](../lag/BR2/operario-pr.md)
- [Ponte Preta](../lag/BR2/ponte-preta.md)
- [Sport](../lag/BR2/sport.md)
- [São Bernardo](../lag/BR2/sao-bernardo.md)
- [Vila Nova](../lag/BR2/vila-nova.md)
