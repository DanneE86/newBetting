# La Liga (LL) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/LL.md`.

Underlag: 3489 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 3488 matcher. xG: Understat (100 % av matcherna).

## Lärdomar i korthet

- Favoriter 65–75 %: vann 76,9 % mot oddsens 69,5 %.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 45,3 % | 44,6 % |
| Kryss | 26,5 % | 26,2 % |
| Bortavinst | 28,3 % | 29,2 % |
| Mål per match | 2,59 | |
| Över 2,5 mål | 47,3 % | |
| Båda lagen gör mål | 51,2 % | |
| Logloss stängning / öppning | 0,9703 / 0,9732 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1029 | 32,4 % | 30,5 % | +1,9 pe (1,3) | ingen effekt |
| mellan | 1135 | 28,7 % | 28,5 % | +0,2 pe (0,2) | ingen effekt |
| klar favorit (> 35 %) | 1325 | 20,0 % | 20,9 % | −0,9 pe (−0,8) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1307 | 42,0 % | 39,6 % | +2,4 pe (1,8) | ingen effekt |
| 45–55 % | 914 | 50,9 % | 49,7 % | +1,2 pe (0,7) | ingen effekt |
| 55–65 % | 636 | 59,4 % | 59,3 % | +0,1 pe (0,1) | ingen effekt |
| 65–75 % | 389 | 76,9 % | 69,5 % | +7,4 pe (3,5) | **bekräftad** |
| 75–100 % | 237 | 78,9 % | 80,9 % | −2,0 pe (−0,7) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | +0,020 | +0,039 | +0,061 | −0,0010 (z −1,5, n 1209) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,011 | +0,035 | +0,047 | −0,0005 (z −0,9, n 1209) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | +0,004 (z 0,1, n 3439) | −0,020 (z −0,4, n 2230) | +0,047 (z 0,8, n 1209) | −0,010 (z −0,3, n 3438) | −0,013 (z −5,2, n 3438) | +0,006 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,009 (z 0,3, n 3439) | −0,006 (z −0,2, n 2230) | +0,039 (z 0,8, n 1209) | +0,022 (z 0,7, n 3438) | +0,012 (z 5,6, n 3438) | +0,016 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,036 (z −1,0, n 3439) | −0,063 (z −1,4, n 2230) | +0,010 (z 0,2, n 1209) | −0,046 (z −1,3, n 3438) | −0,009 (z −3,6, n 3438) | −0,052 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,001 (z 0,0, n 2479) | +0,030 (z 0,5, n 1339) | −0,056 (z −0,7, n 1140) | +0,003 (z 0,1, n 2479) | +0,002 (z 0,6, n 2479) | +0,001 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,038 (z 2,1, n 2479) | +0,039 (z 1,6, n 1339) | +0,037 (z 1,3, n 1140) | +0,041 (z 2,3, n 2479) | +0,004 (z 2,8, n 2479) | +0,136 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,050 (z 1,1, n 2479) | +0,059 (z 1,0, n 1339) | +0,032 (z 0,4, n 1140) | – | – | +0,025 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,004 (z 0,3, n 3364) | +0,034 (z 2,0, n 2197) | −0,039 (z −2,0, n 1167) | +0,004 (z 0,3, n 3363) | +0,000 (z 0,3, n 3363) | +0,014 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–) | +1,061 (z 2,5, n 829) | +0,957 (z 1,6, n 380) | +1,132 (z 1,9, n 449) | +0,989 (z 2,3, n 829) | −0,073 (z −2,6, n 829) | +0,256 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,024 (z 0,1, n 3488) | +0,005 (z 0,0, n 2279) | +0,068 (z 0,1, n 1209) | – | – | +0,005 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,808 (z −0,7, n 2467) | −2,819 (z −1,8, n 1520) | +1,656 (z 1,0, n 947) | – | – | −0,040 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,118 (z 1,5, n 2729) | +0,112 (z 1,0, n 1520) | +0,120 (z 1,1, n 1209) | – | – | +0,033 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,057 (z −1,1, n 490) | −0,152 (z −2,2, n 293) | +0,086 (z 1,0, n 197) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,012 (z 0,2, n 358) | +0,047 (z 0,6, n 238) | −0,058 (z −0,5, n 120) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,013 (z −0,6, n 358) | −0,003 (z −0,1, n 238) | −0,032 (z −0,8, n 120) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,072 (z 0,9, n 229) | +0,175 (z 1,7, n 132) | −0,068 (z −0,6, n 97) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,039 (z 0,3, n 98) | −0,182 (z −1,2, n 51) | +0,280 (z 1,5, n 47) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,13 (z 1,4, n 136). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,07 (z −0,7, n 136). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (126 matcher: 8 Stryktipset, 118 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,009 / 1,009 / 1,007 / 1,025 |
| Folket streckar favoriten | ×1,11 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 23,0 % / 26,9 % / 25,6 % |
| Favoriter ≥ 55 %: höll / väntat | 66,7 % / 63,9 % (n 27) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 45,2 % | 40,5 % | 43,2 % | 1,05 |
| X | 23,0 % | 26,9 % | 25,6 % | 0,90 |
| 2 | 31,7 % | 32,6 % | 31,2 % | 1,02 |

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Barcelona | 7 | 7 | 0 | 0 | 31-7 | 24 | 21 |
| 2 | Ath Madrid | 7 | 5 | 1 | 1 | 16-7 | 9 | 16 |
| 3 | Betis | 7 | 5 | 1 | 1 | 9-7 | 2 | 16 |
| 4 | Real Madrid | 7 | 5 | 0 | 2 | 18-8 | 10 | 15 |
| 5 | Sevilla | 7 | 4 | 1 | 2 | 10-9 | 1 | 13 |
| 6 | Alaves | 7 | 3 | 2 | 2 | 11-6 | 5 | 11 |
| 7 | La Coruna | 7 | 2 | 4 | 1 | 10-8 | 2 | 10 |
| 8 | Sociedad | 7 | 3 | 1 | 3 | 9-13 | -4 | 10 |
| 9 | Villarreal | 7 | 2 | 2 | 3 | 13-12 | 1 | 8 |
| 10 | Ath Bilbao | 6 | 2 | 2 | 2 | 7-6 | 1 | 8 |
| 11 | Getafe | 7 | 2 | 2 | 3 | 4-7 | -3 | 8 |
| 12 | Vallecano | 7 | 2 | 2 | 3 | 11-16 | -5 | 8 |
| 13 | Osasuna | 7 | 2 | 2 | 3 | 6-13 | -7 | 8 |
| 14 | Celta | 7 | 1 | 4 | 2 | 8-6 | 2 | 7 |
| 15 | Espanol | 7 | 2 | 1 | 4 | 10-10 | 0 | 7 |
| 16 | Santander | 7 | 2 | 1 | 4 | 11-21 | -10 | 7 |
| 17 | Levante | 6 | 1 | 2 | 3 | 8-12 | -4 | 5 |
| 18 | Elche | 7 | 1 | 2 | 4 | 11-17 | -6 | 5 |
| 19 | Valencia | 7 | 1 | 1 | 5 | 4-13 | -9 | 4 |
| 20 | Malaga | 7 | 0 | 3 | 4 | 3-12 | -9 | 3 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/LL.json`.

## Lagfiler

- [Alaves](../lag/LL/alaves.md)
- [Ath Bilbao](../lag/LL/ath-bilbao.md)
- [Ath Madrid](../lag/LL/ath-madrid.md)
- [Barcelona](../lag/LL/barcelona.md)
- [Betis](../lag/LL/betis.md)
- [Celta](../lag/LL/celta.md)
- [Elche](../lag/LL/elche.md)
- [Espanol](../lag/LL/espanol.md)
- [Getafe](../lag/LL/getafe.md)
- [La Coruna](../lag/LL/la-coruna.md)
- [Levante](../lag/LL/levante.md)
- [Malaga](../lag/LL/malaga.md)
- [Osasuna](../lag/LL/osasuna.md)
- [Real Madrid](../lag/LL/real-madrid.md)
- [Santander](../lag/LL/santander.md)
- [Sevilla](../lag/LL/sevilla.md)
- [Sociedad](../lag/LL/sociedad.md)
- [Valencia](../lag/LL/valencia.md)
- [Vallecano](../lag/LL/vallecano.md)
- [Villarreal](../lag/LL/villarreal.md)
