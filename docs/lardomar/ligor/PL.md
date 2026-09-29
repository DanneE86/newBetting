# Premier League (PL) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/PL.md`.

Underlag: 3470 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 3470 matcher. xG: Understat (100 % av matcherna).

## Lärdomar i korthet

- Inbördes möten, kryss mot förväntat: svag signal (z 2,6) som inte håller i både träning och kontroll. Använd inte.
- Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–): svag signal (z 2,8) som inte håller i både träning och kontroll. Använd inte.

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

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | −0,014 | +0,012 | −0,060 | +0,0014 (z 1,9, n 1190) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,007 | +0,020 | −0,059 | +0,0015 (z 1,8, n 1190) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,067 (z −1,8, n 3420) | −0,044 (z −1,0, n 2230) | −0,113 (z −1,8, n 1190) | −0,075 (z −2,0, n 3420) | −0,008 (z −3,5, n 3420) | −0,096 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,055 (z 1,9, n 3420) | +0,036 (z 1,0, n 2230) | +0,092 (z 1,9, n 1190) | +0,062 (z 2,1, n 3420) | +0,007 (z 3,9, n 3420) | +0,099 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,047 (z −1,3, n 3420) | −0,015 (z −0,4, n 2230) | −0,108 (z −1,8, n 1190) | −0,048 (z −1,4, n 3420) | −0,001 (z −0,3, n 3420) | −0,069 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,045 (z 0,9, n 2415) | +0,048 (z 0,7, n 1347) | +0,041 (z 0,5, n 1068) | +0,044 (z 0,8, n 2415) | −0,002 (z −0,6, n 2415) | +0,053 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,006 (z −0,3, n 2415) | −0,010 (z −0,5, n 1347) | +0,002 (z 0,1, n 1068) | −0,008 (z −0,4, n 2415) | −0,002 (z −1,6, n 2415) | −0,023 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,130 (z 2,6, n 2415) | +0,093 (z 1,6, n 1347) | +0,201 (z 2,3, n 1068) | – | – | +0,060 p | svag signal (inte bekräftad) |
| Vilodagar (hemma − borta, ligamatcher) | −0,008 (z −0,7, n 3346) | −0,003 (z −0,2, n 2196) | −0,022 (z −1,0, n 1150) | −0,009 (z −0,8, n 3346) | −0,001 (z −1,1, n 3346) | −0,017 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–) | +1,214 (z 2,8, n 810) | +1,187 (z 1,9, n 380) | +1,244 (z 2,0, n 430) | +1,105 (z 2,5, n 810) | −0,109 (z −3,9, n 810) | +0,273 p | svag signal (inte bekräftad) |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,452 (z 1,7, n 3470) | +0,420 (z 1,3, n 2280) | +0,554 (z 1,3, n 1190) | – | – | +0,085 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | +1,007 (z 0,8, n 2490) | +0,290 (z 0,2, n 1520) | +1,821 (z 1,0, n 970) | – | – | +0,045 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | −0,096 (z −1,0, n 2710) | −0,090 (z −0,7, n 1520) | −0,024 (z −0,1, n 1190) | – | – | −0,022 p | ingen effekt |

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

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Man City | 5 | 5 | 0 | 0 | 13-5 | 8 | 15 |
| 2 | Arsenal | 5 | 4 | 0 | 1 | 8-4 | 4 | 12 |
| 3 | Brighton | 5 | 3 | 1 | 1 | 16-5 | 11 | 10 |
| 4 | Brentford | 5 | 2 | 3 | 0 | 10-4 | 6 | 9 |
| 5 | Leeds | 5 | 2 | 3 | 0 | 7-3 | 4 | 9 |
| 6 | Liverpool | 5 | 2 | 3 | 0 | 7-4 | 3 | 9 |
| 7 | Everton | 5 | 2 | 3 | 0 | 6-3 | 3 | 9 |
| 8 | Hull | 5 | 2 | 2 | 1 | 6-4 | 2 | 8 |
| 9 | Newcastle | 5 | 2 | 2 | 1 | 9-9 | 0 | 8 |
| 10 | Chelsea | 5 | 2 | 1 | 2 | 10-12 | -2 | 7 |
| 11 | Ipswich | 5 | 2 | 0 | 3 | 7-11 | -4 | 6 |
| 12 | Man United | 5 | 1 | 2 | 2 | 8-8 | 0 | 5 |
| 13 | Nott'm Forest | 5 | 1 | 2 | 2 | 4-5 | -1 | 5 |
| 14 | Sunderland | 5 | 1 | 1 | 3 | 6-10 | -4 | 4 |
| 15 | Crystal Palace | 5 | 1 | 1 | 3 | 6-11 | -5 | 4 |
| 16 | Aston Villa | 5 | 1 | 1 | 3 | 4-9 | -5 | 4 |
| 17 | Bournemouth | 5 | 0 | 3 | 2 | 6-8 | -2 | 3 |
| 18 | Coventry | 5 | 1 | 0 | 4 | 1-10 | -9 | 3 |
| 19 | Fulham | 5 | 0 | 2 | 3 | 5-8 | -3 | 2 |
| 20 | Tottenham | 5 | 0 | 2 | 3 | 2-8 | -6 | 2 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/PL.json`.

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
