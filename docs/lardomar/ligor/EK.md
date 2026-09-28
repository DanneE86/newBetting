# Ekstraklasa (EK) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/EK.md`.

Underlag: 4160 matcher, säsong 2012/13 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Vilodagar (hemma − borta, ligamatcher): svag signal (z 2,5) som inte håller i både träning och kontroll. Använd inte.

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

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,020 (z −0,6, n 4021) | −0,009 (z −0,2, n 3049) | −0,059 (z −0,9, n 972) | – | – | −0,032 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,044 (z −0,8, n 2852) | −0,082 (z −1,4, n 2144) | +0,072 (z 0,7, n 708) | – | – | −0,049 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,025 (z −1,1, n 2852) | −0,036 (z −1,4, n 2144) | +0,009 (z 0,2, n 708) | – | – | −0,065 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,010 (z 0,2, n 2852) | −0,016 (z −0,3, n 2144) | +0,094 (z 0,9, n 708) | – | – | +0,005 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,029 (z 2,5, n 3904) | +0,045 (z 3,2, n 2973) | +0,000 (z 0,0, n 931) | – | – | +0,115 p | svag signal (inte bekräftad) |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,030 (z −0,6, n 609) | −0,075 (z −1,2, n 440) | +0,087 (z 0,9, n 169) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,042 (z −0,7, n 462) | −0,073 (z −1,1, n 354) | +0,061 (z 0,5, n 108) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,004 (z 0,2, n 462) | +0,002 (z 0,1, n 354) | +0,010 (z 0,2, n 108) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,055 (z −0,8, n 323) | −0,004 (z −0,1, n 223) | −0,166 (z −1,4, n 100) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,054 (z −0,6, n 174) | −0,083 (z −0,8, n 113) | −0,001 (z −0,0, n 61) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,19 (z −2,5, n 185). 
- Lagets extra hemmafördel → nästa säsong: lutning −0,08 (z −1,1, n 185). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

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
