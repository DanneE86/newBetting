# Ekstraklasa (EK) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/EK.md`.

Underlag: 4160 matcher, säsong 2012/13 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Vilodagar (hemma − borta, ligamatcher): svag signal (z 2,5) som inte håller i både träning och kontroll. Använd inte.
- Lag som slog marknaden en säsong gör det mindre nästa (lutning −0,20, z −2,6).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,0 % | 43,1 % |
| Kryss | 27,1 % | 27,2 % |
| Bortavinst | 29,0 % | 29,7 % |
| Mål per match | 2,65 | |
| Över 2,5 mål | 49,6 % | |
| Båda lagen gör mål | 53,1 % | |
| Logloss stängning | 1,0397 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1662 | 28,6 % | 29,1 % | −0,5 pe (−0,4) | ingen effekt |
| mellan | 1610 | 27,5 % | 27,6 % | −0,2 pe (−0,1) | ingen effekt |
| klar favorit (> 35 %) | 888 | 23,4 % | 22,8 % | +0,6 pe (0,4) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2010 | 38,8 % | 40,0 % | −1,2 pe (−1,1) | ingen effekt |
| 45–55 % | 1300 | 48,6 % | 49,3 % | −0,7 pe (−0,5) | ingen effekt |
| 55–65 % | 614 | 57,7 % | 59,3 % | −1,6 pe (−0,8) | ingen effekt |
| 65–75 % | 203 | 71,9 % | 69,0 % | +3,0 pe (0,9) | ingen effekt |
| 75–100 % | 32 | 81,3 % | 77,7 % | +3,5 pe (0,5) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,046 | +0,039 | −0,013 | −0,0006 (z −1,1, n 996) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,018 (z −0,6, n 4031) | −0,008 (z −0,2, n 3054) | −0,053 (z −0,8, n 977) | – | – | −0,029 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,049 (z −1,0, n 2923) | −0,080 (z −1,3, n 2152) | +0,042 (z 0,4, n 771) | – | – | −0,055 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,028 (z −1,3, n 2923) | −0,036 (z −1,4, n 2152) | −0,006 (z −0,1, n 771) | – | – | −0,072 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,007 (z −0,1, n 2923) | −0,019 (z −0,3, n 2152) | +0,028 (z 0,3, n 771) | – | – | −0,003 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,029 (z 2,5, n 3905) | +0,045 (z 3,1, n 2974) | +0,000 (z 0,0, n 931) | – | – | +0,114 p | svag signal (inte bekräftad) |
| Bolagssnitt mot Pinnacle vid stängning | +0,754 (z 1,2, n 3887) | +0,849 (z 1,2, n 3163) | +0,287 (z 0,2, n 724) | – | – | +0,057 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,030 (z −0,6, n 609) | −0,075 (z −1,2, n 440) | +0,087 (z 0,9, n 169) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,038 (z −0,7, n 466) | −0,068 (z −1,0, n 358) | +0,061 (z 0,5, n 108) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,004 (z 0,2, n 466) | +0,002 (z 0,1, n 358) | +0,010 (z 0,2, n 108) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,078 (z −1,1, n 314) | −0,037 (z −0,4, n 214) | −0,166 (z −1,4, n 100) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,054 (z −0,6, n 174) | −0,083 (z −0,8, n 113) | −0,001 (z −0,0, n 61) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,20 (z −2,6, n 186). 
- Lagets extra hemmafördel → nästa säsong: lutning −0,08 (z −1,2, n 186). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Gornik Zabrze | 9 | 7 | 1 | 1 | 16-8 | 8 | 22 |
| 2 | Legia | 9 | 5 | 4 | 0 | 19-8 | 11 | 19 |
| 3 | Lech Poznan | 8 | 6 | 1 | 1 | 17-7 | 10 | 19 |
| 4 | Wisla | 9 | 5 | 2 | 2 | 17-12 | 5 | 17 |
| 5 | Pogon Szczecin | 8 | 4 | 3 | 1 | 12-6 | 6 | 15 |
| 6 | Korona Kielce | 9 | 4 | 3 | 2 | 12-10 | 2 | 15 |
| 7 | Zaglebie | 9 | 4 | 3 | 2 | 11-10 | 1 | 15 |
| 8 | Piast Gliwice | 9 | 4 | 1 | 4 | 16-15 | 1 | 13 |
| 9 | GKS Katowice | 8 | 4 | 0 | 4 | 16-13 | 3 | 12 |
| 10 | Jagiellonia | 8 | 4 | 0 | 4 | 12-13 | -1 | 12 |
| 11 | Wisla Plock | 8 | 3 | 2 | 3 | 9-12 | -3 | 11 |
| 12 | Widzew Lodz | 9 | 1 | 6 | 2 | 13-13 | 0 | 9 |
| 13 | Cracovia | 9 | 2 | 2 | 5 | 9-14 | -5 | 8 |
| 14 | Radomiak Radom | 9 | 2 | 2 | 5 | 7-20 | -13 | 8 |
| 15 | Slask Wroclaw | 9 | 1 | 3 | 5 | 11-15 | -4 | 6 |
| 16 | Motor Lublin | 9 | 1 | 3 | 5 | 9-15 | -6 | 6 |
| 17 | Wieczysta Krakow | 8 | 1 | 2 | 5 | 11-17 | -6 | 5 |
| 18 | Rakow | 9 | 1 | 0 | 8 | 12-21 | -9 | 3 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/EK.json`.

## Lagfiler

- [Cracovia](../lag/EK/cracovia.md)
- [GKS Katowice](../lag/EK/gks-katowice.md)
- [Gornik Zabrze](../lag/EK/gornik-zabrze.md)
- [Jagiellonia](../lag/EK/jagiellonia.md)
- [Korona Kielce](../lag/EK/korona-kielce.md)
- [Lech Poznan](../lag/EK/lech-poznan.md)
- [Legia](../lag/EK/legia.md)
- [Motor Lublin](../lag/EK/motor-lublin.md)
- [Piast Gliwice](../lag/EK/piast-gliwice.md)
- [Pogon Szczecin](../lag/EK/pogon-szczecin.md)
- [Radomiak Radom](../lag/EK/radomiak-radom.md)
- [Rakow](../lag/EK/rakow.md)
- [Slask Wroclaw](../lag/EK/slask-wroclaw.md)
- [Widzew Lodz](../lag/EK/widzew-lodz.md)
- [Wieczysta Krakow](../lag/EK/wieczysta-krakow.md)
- [Wisla](../lag/EK/wisla.md)
- [Wisla Plock](../lag/EK/wisla-plock.md)
- [Zaglebie](../lag/EK/zaglebie.md)
