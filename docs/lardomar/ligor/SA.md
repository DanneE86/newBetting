# Serie A (SA) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/SA.md`.

Underlag: 3470 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 3469 matcher. xG: Understat (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 41,3 % | 43,0 % |
| Kryss | 25,9 % | 25,4 % |
| Bortavinst | 32,8 % | 31,6 % |
| Mål per match | 2,72 | |
| Över 2,5 mål | 52,0 % | |
| Båda lagen gör mål | 53,6 % | |
| Logloss stängning / öppning | 0,9510 / 0,9533 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 926 | 32,2 % | 29,9 % | +2,3 pe (1,5) | ingen effekt |
| mellan | 1046 | 29,3 % | 27,9 % | +1,4 pe (1,0) | ingen effekt |
| klar favorit (> 35 %) | 1498 | 19,6 % | 20,8 % | −1,1 pe (−1,1) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1162 | 41,0 % | 39,9 % | +1,2 pe (0,8) | ingen effekt |
| 45–55 % | 858 | 52,2 % | 49,9 % | +2,3 pe (1,4) | ingen effekt |
| 55–65 % | 708 | 62,4 % | 59,7 % | +2,7 pe (1,5) | ingen effekt |
| 65–75 % | 497 | 72,4 % | 69,6 % | +2,8 pe (1,4) | ingen effekt |
| 75–100 % | 244 | 81,1 % | 79,9 % | +1,3 pe (0,5) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,028 (z −0,8, n 3419) | −0,059 (z −1,3, n 2229) | +0,029 (z 0,5, n 1190) | −0,039 (z −1,1, n 3418) | −0,011 (z −4,2, n 3418) | −0,040 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,009 (z 0,3, n 3419) | +0,019 (z 0,5, n 2229) | −0,013 (z −0,3, n 1190) | +0,018 (z 0,6, n 3418) | +0,010 (z 4,7, n 3418) | +0,015 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,047 (z −1,3, n 3419) | −0,069 (z −1,6, n 2229) | −0,006 (z −0,1, n 1190) | −0,051 (z −1,5, n 3418) | −0,004 (z −1,8, n 3418) | −0,069 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,026 (z 0,5, n 2360) | +0,009 (z 0,1, n 1306) | +0,061 (z 0,7, n 1054) | +0,027 (z 0,5, n 2359) | −0,000 (z −0,1, n 2359) | +0,030 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,032 (z 1,9, n 2360) | +0,021 (z 1,0, n 1306) | +0,050 (z 1,9, n 1054) | +0,034 (z 2,0, n 2359) | +0,001 (z 1,2, n 2359) | +0,128 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,008 (z −0,2, n 2360) | +0,029 (z 0,5, n 1306) | −0,076 (z −0,9, n 1054) | – | – | −0,004 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,003 (z 0,2, n 3342) | +0,001 (z 0,1, n 2192) | +0,006 (z 0,3, n 1150) | +0,001 (z 0,1, n 3341) | −0,002 (z −1,8, n 3341) | +0,006 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta) | +0,500 (z 1,1, n 810) | – | +0,500 (z 1,1, n 810) | +0,367 (z 0,8, n 810) | −0,133 (z −4,8, n 810) | +0,116 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,037 (z −0,7, n 496) | −0,056 (z −0,8, n 296) | −0,009 (z −0,1, n 200) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,105 (z −1,7, n 357) | −0,031 (z −0,4, n 238) | −0,254 (z −2,3, n 119) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,003 (z −0,1, n 357) | −0,017 (z −0,6, n 238) | +0,025 (z 0,6, n 119) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,053 (z −0,7, n 229) | −0,106 (z −1,1, n 132) | +0,018 (z 0,1, n 97) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,142 (z −1,1, n 85) | −0,075 (z −0,4, n 44) | −0,213 (z −1,1, n 41) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,02 (z 0,2, n 136). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,00 (z 0,0, n 136). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (128 matcher: 6 Stryktipset, 122 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 0,989 / 0,987 / 0,998 / 1,016 |
| Folket streckar favoriten | ×1,11 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 26,6 % / 27,5 % / 26,3 % |
| Favoriter ≥ 55 %: höll / väntat | 71,1 % / 64,2 % (n 38) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 36,7 % | 36,8 % | 37,9 % | 0,97 |
| X | 26,6 % | 27,5 % | 26,3 % | 1,01 |
| 2 | 36,7 % | 35,7 % | 35,9 % | 1,02 |

## Lagfiler

- [Atalanta](../lag/SA/atalanta.md)
- [Bologna](../lag/SA/bologna.md)
- [Cagliari](../lag/SA/cagliari.md)
- [Como](../lag/SA/como.md)
- [Fiorentina](../lag/SA/fiorentina.md)
- [Frosinone](../lag/SA/frosinone.md)
- [Genoa](../lag/SA/genoa.md)
- [Inter](../lag/SA/inter.md)
- [Juventus](../lag/SA/juventus.md)
- [Lazio](../lag/SA/lazio.md)
- [Lecce](../lag/SA/lecce.md)
- [Milan](../lag/SA/milan.md)
- [Monza](../lag/SA/monza.md)
- [Napoli](../lag/SA/napoli.md)
- [Parma](../lag/SA/parma.md)
- [Roma](../lag/SA/roma.md)
- [Sassuolo](../lag/SA/sassuolo.md)
- [Torino](../lag/SA/torino.md)
- [Udinese](../lag/SA/udinese.md)
- [Venezia](../lag/SA/venezia.md)
