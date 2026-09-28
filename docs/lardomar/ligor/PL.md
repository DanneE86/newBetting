# Premier League (PL) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/PL.md`.

Underlag: 3470 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 3470 matcher. xG: Understat (100 % av matcherna).

## Lärdomar i korthet

- Inbördes möten, kryss mot förväntat: svag signal (z 2,6) som inte håller i både träning och kontroll. Använd inte.
- Nyckelspelare borta (andel av xG+xA, hemma − borta): svag signal (z 2,8) som inte håller i både träning och kontroll. Använd inte.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,0 % | 43,9 % |
| Kryss | 23,5 % | 24,0 % |
| Bortavinst | 32,5 % | 32,1 % |
| Mål per match | 2,84 | |
| Över 2,5 mål | 54,4 % | |
| Båda lagen gör mål | 52,9 % | |
| Logloss stängning / öppning | 0,9547 / 0,9583 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 951 | 27,8 % | 28,7 % | −0,9 pe (−0,6) | ingen effekt |
| mellan | 1001 | 27,0 % | 26,7 % | +0,3 pe (0,2) | ingen effekt |
| klar favorit (> 35 %) | 1518 | 18,5 % | 19,3 % | −0,8 pe (−0,8) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1095 | 39,6 % | 40,1 % | −0,4 pe (−0,3) | ingen effekt |
| 45–55 % | 864 | 49,3 % | 49,8 % | −0,5 pe (−0,3) | ingen effekt |
| 55–65 % | 688 | 61,2 % | 59,6 % | +1,6 pe (0,9) | ingen effekt |
| 65–75 % | 456 | 71,1 % | 69,7 % | +1,3 pe (0,6) | ingen effekt |
| 75–100 % | 367 | 80,9 % | 80,8 % | +0,1 pe (0,0) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,068 (z −1,9, n 3420) | −0,044 (z −1,0, n 2230) | −0,115 (z −1,8, n 1190) | −0,076 (z −2,1, n 3420) | −0,008 (z −3,5, n 3420) | −0,097 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,056 (z 1,9, n 3420) | +0,036 (z 1,0, n 2230) | +0,094 (z 1,9, n 1190) | +0,063 (z 2,2, n 3420) | +0,007 (z 4,0, n 3420) | +0,100 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,047 (z −1,3, n 3420) | −0,015 (z −0,4, n 2230) | −0,108 (z −1,8, n 1190) | −0,048 (z −1,4, n 3420) | −0,001 (z −0,3, n 3420) | −0,069 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,045 (z 0,9, n 2415) | +0,048 (z 0,7, n 1347) | +0,041 (z 0,5, n 1068) | +0,044 (z 0,8, n 2415) | −0,002 (z −0,6, n 2415) | +0,053 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,006 (z −0,3, n 2415) | −0,010 (z −0,5, n 1347) | +0,002 (z 0,1, n 1068) | −0,008 (z −0,4, n 2415) | −0,002 (z −1,6, n 2415) | −0,023 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,130 (z 2,6, n 2415) | +0,093 (z 1,6, n 1347) | +0,201 (z 2,3, n 1068) | – | – | +0,060 p | svag signal (inte bekräftad) |
| Vilodagar (hemma − borta, ligamatcher) | −0,008 (z −0,7, n 3346) | −0,003 (z −0,2, n 2196) | −0,022 (z −1,0, n 1150) | −0,009 (z −0,8, n 3346) | −0,001 (z −1,1, n 3346) | −0,017 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta) | +1,214 (z 2,8, n 810) | – | +1,214 (z 2,8, n 810) | +1,105 (z 2,5, n 810) | −0,109 (z −3,9, n 810) | +0,273 p | svag signal (inte bekräftad) |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,074 (z −1,4, n 497) | −0,052 (z −0,8, n 298) | −0,108 (z −1,4, n 199) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,041 (z 0,6, n 346) | +0,069 (z 0,8, n 230) | −0,015 (z −0,1, n 116) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,005 (z 0,2, n 346) | −0,002 (z −0,1, n 230) | +0,018 (z 0,5, n 116) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,124 (z −1,7, n 225) | −0,094 (z −0,9, n 134) | −0,168 (z −1,5, n 91) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,134 (z 1,5, n 158) | +0,126 (z 1,2, n 123) | +0,163 (z 0,9, n 35) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,03 (z −0,3, n 136). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,05 (z −0,5, n 136). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (334 matcher: 191 Stryktipset, 143 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 0,995 / 0,994 / 1,016 / 1,022 |
| Folket streckar favoriten | ×1,13 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 26,6 % / 24,9 % / 22,3 % |
| Favoriter ≥ 55 %: höll / väntat | 68,1 % / 64,4 % (n 113) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 43,7 % | 43,6 % | 46,7 % | 0,94 |
| X | 26,6 % | 24,9 % | 22,3 % | 1,19 |
| 2 | 29,6 % | 31,5 % | 30,9 % | 0,96 |

- Folket överstreckar favoriter (×1,13). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 2,6 procentenheter under vår procent. Kryss ger streckvärde.

## Lagfiler

- [Arsenal](../lag/PL/arsenal.md)
- [Aston Villa](../lag/PL/aston-villa.md)
- [Bournemouth](../lag/PL/bournemouth.md)
- [Brentford](../lag/PL/brentford.md)
- [Brighton](../lag/PL/brighton.md)
- [Chelsea](../lag/PL/chelsea.md)
- [Coventry](../lag/PL/coventry.md)
- [Crystal Palace](../lag/PL/crystal-palace.md)
- [Everton](../lag/PL/everton.md)
- [Fulham](../lag/PL/fulham.md)
- [Hull](../lag/PL/hull.md)
- [Ipswich](../lag/PL/ipswich.md)
- [Leeds](../lag/PL/leeds.md)
- [Liverpool](../lag/PL/liverpool.md)
- [Man City](../lag/PL/man-city.md)
- [Man United](../lag/PL/man-united.md)
- [Newcastle](../lag/PL/newcastle.md)
- [Nott'm Forest](../lag/PL/nott-m-forest.md)
- [Sunderland](../lag/PL/sunderland.md)
- [Tottenham](../lag/PL/tottenham.md)
