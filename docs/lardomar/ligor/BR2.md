# Brasileirão Série B (BR2) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/BR2.csv`.

## Lärdomar i korthet

- 690 matcher (2025-04-04 – 2026-10-03): hemmavinst 45,5 %, kryss 28,8 %, bortavinst 25,7 %, 2,27 mål per match.
- Modellens 1X2-tips träffade 49,7 % (144/290). 
- Över/under 2,5: träff 56,9 % (290). BTTS: 53,1 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 46 % | 31 % | 24 % | 2,22 | 40 % | 49 % |
| 2026/27 | 310 | 45 % | 27 % | 28 % | 2,34 | 43 % | 47 % |

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Vila Nova | 31 | 17 | 6 | 8 | 44-31 | 13 | 57 |
| 2 | Juventude | 31 | 16 | 8 | 7 | 35-19 | 16 | 56 |
| 3 | Novorizontino | 31 | 15 | 9 | 7 | 52-27 | 25 | 54 |
| 4 | Criciúma | 31 | 15 | 8 | 8 | 33-27 | 6 | 53 |
| 5 | Fortaleza | 31 | 14 | 11 | 6 | 36-27 | 9 | 53 |
| 6 | Atlético Goianiense | 31 | 14 | 10 | 7 | 39-27 | 12 | 52 |
| 7 | CRB | 31 | 14 | 6 | 11 | 46-44 | 2 | 48 |
| 8 | Operário PR | 31 | 13 | 9 | 9 | 43-41 | 2 | 48 |
| 9 | Sport | 31 | 12 | 11 | 8 | 42-33 | 9 | 47 |
| 10 | Cuiabá | 31 | 11 | 13 | 7 | 32-25 | 7 | 46 |
| 11 | São Bernardo | 31 | 12 | 9 | 10 | 43-32 | 11 | 45 |
| 12 | Goiás | 31 | 12 | 6 | 13 | 30-39 | -9 | 42 |
| 13 | Náutico | 31 | 11 | 9 | 11 | 39-38 | 1 | 42 |
| 14 | Athletic | 31 | 10 | 12 | 9 | 37-35 | 2 | 42 |
| 15 | Ceará | 31 | 10 | 9 | 12 | 34-39 | -5 | 39 |
| 16 | Botafogo-SP | 31 | 9 | 8 | 14 | 34-37 | -3 | 35 |
| 17 | Avaí | 31 | 8 | 6 | 17 | 30-42 | -12 | 30 |
| 18 | Londrina | 31 | 7 | 7 | 17 | 39-45 | -6 | 28 |
| 19 | América Mineiro | 31 | 4 | 5 | 22 | 21-52 | -31 | 17 |
| 20 | Ponte Preta | 31 | 3 | 4 | 24 | 17-66 | -49 | 13 |

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
