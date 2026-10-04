# MLS (MLS) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/MLS.md`.

Underlag: 6220 matcher, säsong 2012 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 49,3 % | 48,4 % |
| Kryss | 25,2 % | 25,2 % |
| Bortavinst | 25,5 % | 26,4 % |
| Mål per match | 2,91 | |
| Över 2,5 mål | 56,9 % | |
| Båda lagen gör mål | 58,1 % | |
| Logloss stängning | 1,0120 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1946 | 27,2 % | 27,3 % | −0,0 pe (−0,0) | ingen effekt |
| mellan | 2530 | 25,7 % | 25,9 % | −0,2 pe (−0,2) | ingen effekt |
| klar favorit (> 35 %) | 1744 | 22,2 % | 21,8 % | +0,4 pe (0,4) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2164 | 39,6 % | 40,6 % | −1,1 pe (−1,0) | ingen effekt |
| 45–55 % | 2229 | 51,2 % | 49,8 % | +1,5 pe (1,4) | ingen effekt |
| 55–65 % | 1357 | 60,1 % | 59,1 % | +1,0 pe (0,8) | ingen effekt |
| 65–75 % | 437 | 69,6 % | 68,6 % | +1,0 pe (0,4) | ingen effekt |
| 75–100 % | 33 | 84,8 % | 77,7 % | +7,1 pe (1,1) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,012 | +0,111 | +0,041 | +0,0033 (z 3,2, n 1708) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,021 (z −0,8, n 6111) | −0,052 (z −1,6, n 4408) | +0,059 (z 1,2, n 1703) | – | – | −0,033 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,043 (z −1,0, n 4936) | −0,068 (z −1,4, n 3402) | +0,024 (z 0,3, n 1534) | – | – | −0,045 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,036 (z −2,0, n 4936) | −0,048 (z −2,2, n 3402) | −0,002 (z −0,1, n 1534) | – | – | −0,082 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,078 (z −1,9, n 4936) | −0,072 (z −1,5, n 3402) | −0,096 (z −1,3, n 1534) | – | – | −0,031 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,002 (z −0,3, n 5956) | −0,006 (z −0,9, n 4348) | +0,018 (z 1,2, n 1608) | – | – | −0,012 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,023 (z −0,0, n 5798) | −0,037 (z −0,1, n 4510) | +1,284 (z 1,0, n 1288) | – | – | −0,002 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,008 (z −0,2, n 867) | +0,010 (z 0,2, n 650) | −0,062 (z −0,7, n 217) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,091 (z 1,6, n 512) | +0,135 (z 1,9, n 337) | +0,008 (z 0,1, n 175) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,003 (z −0,2, n 512) | −0,009 (z −0,4, n 337) | +0,008 (z 0,2, n 175) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,033 (z −0,3, n 112) | −0,030 (z −0,2, n 102) | – | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,021 (z 0,4, n 617) | +0,029 (z 0,5, n 505) | −0,016 (z −0,1, n 112) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,03 (z 0,6, n 334). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,07 (z 1,2, n 332). Lagspecifik hemmafördel utöver marknaden är brus.

## Höghöjd

Hemmalag på arena ≥ 1500 m mot bortalag från minst 1000 m lägre (arenahöjder i `scripts/lib/altitude.mjs`).

| Hemmamatcher | M | V-O-F | P/M | Mot marknaden |
|---|---|---|---|---|
| På höghöjd mot låglandslag | 226 | 107-61-58 | 1,69 | +0,03 |
| Övriga | 5994 | 2962-1506-1526 | 1,73 | +0,03 |

Skillnad mot marknaden: +0,01 poäng per match för hemmalaget (z 0,1). Före 2019: z −0,7, efter: z 0,7. Ingen effekt mot marknaden: oddsen prisar redan in höjden.

### Bortalag på höghöjd

| Lag | M på höghöjd | P/M höghöjd | P/M övriga borta | Skillnad | Mot marknaden höghöjd / övriga |
|---|---|---|---|---|---|
| Los Angeles FC | 8 | 0,63 | 1,35 | −0,72 | −0,88 / −0,08 |
| CF Montreal | 7 | 0,43 | 0,88 | −0,45 | −0,55 / −0,01 |
| Minnesota United | 10 | 0,70 | 1,10 | −0,40 | −0,29 / +0,16 |
| Sporting Kansas City | 15 | 0,80 | 1,08 | −0,28 | −0,34 / −0,04 |
| Columbus Crew | 6 | 0,83 | 1,00 | −0,17 | −0,25 / −0,14 |
| Vancouver Whitecaps | 16 | 0,94 | 1,08 | −0,15 | −0,09 / +0,13 |
| Portland Timbers | 18 | 0,94 | 1,03 | −0,08 | −0,08 / +0,01 |
| FC Dallas | 17 | 0,88 | 0,97 | −0,08 | −0,25 / −0,07 |
| Houston Dynamo | 14 | 0,79 | 0,81 | −0,02 | −0,27 / −0,19 |
| Los Angeles Galaxy | 18 | 1,17 | 1,02 | +0,15 | −0,07 / −0,13 |
| Austin FC | 7 | 1,29 | 0,93 | +0,36 | +0,41 / −0,03 |
| San Jose Earthquakes | 17 | 1,24 | 0,87 | +0,37 | +0,24 / −0,08 |
| Seattle Sounders | 18 | 1,72 | 1,15 | +0,57 | +0,51 / −0,02 |

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-10-04)

**Eastern**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Nashville SC | 27 | 18 | 6 | 3 | 55-21 | 34 | 60 |
| 2 | New England Revolution | 27 | 14 | 4 | 9 | 45-36 | 9 | 46 |
| 3 | Inter Miami | 27 | 12 | 10 | 5 | 64-50 | 14 | 46 |
| 4 | Charlotte | 27 | 12 | 7 | 8 | 47-38 | 9 | 43 |
| 5 | Chicago Fire | 26 | 12 | 6 | 8 | 46-38 | 8 | 42 |
| 6 | Philadelphia Union | 27 | 11 | 6 | 10 | 54-44 | 10 | 39 |
| 7 | Orlando City | 27 | 10 | 4 | 13 | 48-64 | -16 | 34 |
| 8 | New York Red Bulls | 27 | 9 | 6 | 12 | 34-51 | -17 | 33 |
| 9 | New York City | 27 | 8 | 9 | 10 | 41-36 | 5 | 33 |
| 10 | FC Cincinnati | 26 | 8 | 9 | 9 | 55-64 | -9 | 33 |
| 11 | DC United | 26 | 6 | 12 | 8 | 34-42 | -8 | 30 |
| 12 | Columbus Crew | 27 | 8 | 5 | 14 | 39-43 | -4 | 29 |
| 13 | Toronto FC | 27 | 6 | 11 | 10 | 39-51 | -12 | 29 |
| 14 | Atlanta Utd | 27 | 7 | 6 | 14 | 32-45 | -13 | 27 |
| 15 | CF Montreal | 27 | 6 | 6 | 15 | 34-54 | -20 | 24 |

**Western**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Vancouver Whitecaps | 26 | 15 | 5 | 6 | 59-26 | 33 | 50 |
| 2 | St. Louis City | 27 | 13 | 8 | 6 | 48-36 | 12 | 47 |
| 3 | FC Dallas | 27 | 13 | 8 | 6 | 50-42 | 8 | 47 |
| 4 | San Jose Earthquakes | 27 | 13 | 6 | 8 | 49-39 | 10 | 45 |
| 5 | Houston Dynamo | 27 | 13 | 5 | 9 | 34-32 | 2 | 44 |
| 6 | Los Angeles FC | 28 | 11 | 8 | 9 | 43-30 | 13 | 41 |
| 7 | Seattle Sounders | 27 | 10 | 8 | 9 | 35-35 | 0 | 38 |
| 8 | Colorado Rapids | 27 | 11 | 3 | 13 | 38-38 | 0 | 36 |
| 9 | Los Angeles Galaxy | 28 | 9 | 9 | 10 | 37-44 | -7 | 36 |
| 10 | Portland Timbers | 27 | 9 | 5 | 13 | 48-51 | -3 | 32 |
| 11 | Real Salt Lake | 27 | 9 | 5 | 13 | 40-44 | -4 | 32 |
| 12 | San Diego FC | 27 | 8 | 8 | 11 | 47-47 | 0 | 32 |
| 13 | Austin FC | 27 | 7 | 10 | 10 | 35-47 | -12 | 31 |
| 14 | Minnesota United | 27 | 7 | 8 | 12 | 40-49 | -9 | 29 |
| 15 | Sporting Kansas City | 27 | 6 | 3 | 18 | 32-65 | -33 | 21 |

**Supporters Shield**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Nashville SC | 27 | 18 | 6 | 3 | 55-21 | 34 | 60 |
| 2 | Vancouver Whitecaps | 26 | 15 | 5 | 6 | 59-26 | 33 | 50 |
| 3 | St. Louis City | 27 | 13 | 8 | 6 | 48-36 | 12 | 47 |
| 4 | FC Dallas | 27 | 13 | 8 | 6 | 50-42 | 8 | 47 |
| 5 | New England Revolution | 27 | 14 | 4 | 9 | 45-36 | 9 | 46 |
| 6 | Inter Miami | 27 | 12 | 10 | 5 | 64-50 | 14 | 46 |
| 7 | San Jose Earthquakes | 27 | 13 | 6 | 8 | 49-39 | 10 | 45 |
| 8 | Houston Dynamo | 27 | 13 | 5 | 9 | 34-32 | 2 | 44 |
| 9 | Charlotte | 27 | 12 | 7 | 8 | 47-38 | 9 | 43 |
| 10 | Chicago Fire | 26 | 12 | 6 | 8 | 46-38 | 8 | 42 |
| 11 | Los Angeles FC | 28 | 11 | 8 | 9 | 43-30 | 13 | 41 |
| 12 | Philadelphia Union | 27 | 11 | 6 | 10 | 54-44 | 10 | 39 |
| 13 | Seattle Sounders | 27 | 10 | 8 | 9 | 35-35 | 0 | 38 |
| 14 | Colorado Rapids | 27 | 11 | 3 | 13 | 38-38 | 0 | 36 |
| 15 | Los Angeles Galaxy | 28 | 9 | 9 | 10 | 37-44 | -7 | 36 |
| 16 | Orlando City | 27 | 10 | 4 | 13 | 48-64 | -16 | 34 |
| 17 | New York Red Bulls | 27 | 9 | 6 | 12 | 34-51 | -17 | 33 |
| 18 | New York City | 27 | 8 | 9 | 10 | 41-36 | 5 | 33 |
| 19 | FC Cincinnati | 26 | 8 | 9 | 9 | 55-64 | -9 | 33 |
| 20 | Portland Timbers | 27 | 9 | 5 | 13 | 48-51 | -3 | 32 |
| 21 | Real Salt Lake | 27 | 9 | 5 | 13 | 40-44 | -4 | 32 |
| 22 | San Diego FC | 27 | 8 | 8 | 11 | 47-47 | 0 | 32 |
| 23 | Austin FC | 27 | 7 | 10 | 10 | 35-47 | -12 | 31 |
| 24 | DC United | 26 | 6 | 12 | 8 | 34-42 | -8 | 30 |
| 25 | Columbus Crew | 27 | 8 | 5 | 14 | 39-43 | -4 | 29 |
| 26 | Minnesota United | 27 | 7 | 8 | 12 | 40-49 | -9 | 29 |
| 27 | Toronto FC | 27 | 6 | 11 | 10 | 39-51 | -12 | 29 |
| 28 | Atlanta Utd | 27 | 7 | 6 | 14 | 32-45 | -13 | 27 |
| 29 | CF Montreal | 27 | 6 | 6 | 15 | 34-54 | -20 | 24 |
| 30 | Sporting Kansas City | 27 | 6 | 3 | 18 | 32-65 | -33 | 21 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/MLS.json`.

## Lagfiler

- [Atlanta Utd](../lag/MLS/atlanta-utd.md)
- [Austin FC](../lag/MLS/austin-fc.md)
- [CF Montreal](../lag/MLS/cf-montreal.md)
- [Charlotte](../lag/MLS/charlotte.md)
- [Chicago Fire](../lag/MLS/chicago-fire.md)
- [Colorado Rapids](../lag/MLS/colorado-rapids.md)
- [Columbus Crew](../lag/MLS/columbus-crew.md)
- [DC United](../lag/MLS/dc-united.md)
- [FC Cincinnati](../lag/MLS/fc-cincinnati.md)
- [FC Dallas](../lag/MLS/fc-dallas.md)
- [Houston Dynamo](../lag/MLS/houston-dynamo.md)
- [Inter Miami](../lag/MLS/inter-miami.md)
- [Los Angeles FC](../lag/MLS/los-angeles-fc.md)
- [Los Angeles Galaxy](../lag/MLS/los-angeles-galaxy.md)
- [Minnesota United](../lag/MLS/minnesota-united.md)
- [Nashville SC](../lag/MLS/nashville-sc.md)
- [New England Revolution](../lag/MLS/new-england-revolution.md)
- [New York City](../lag/MLS/new-york-city.md)
- [New York Red Bulls](../lag/MLS/new-york-red-bulls.md)
- [Orlando City](../lag/MLS/orlando-city.md)
- [Philadelphia Union](../lag/MLS/philadelphia-union.md)
- [Portland Timbers](../lag/MLS/portland-timbers.md)
- [Real Salt Lake](../lag/MLS/real-salt-lake.md)
- [San Diego FC](../lag/MLS/san-diego-fc.md)
- [San Jose Earthquakes](../lag/MLS/san-jose-earthquakes.md)
- [Seattle Sounders](../lag/MLS/seattle-sounders.md)
- [Sporting Kansas City](../lag/MLS/sporting-kansas-city.md)
- [St. Louis City](../lag/MLS/st-louis-city.md)
- [Toronto FC](../lag/MLS/toronto-fc.md)
- [Vancouver Whitecaps](../lag/MLS/vancouver-whitecaps.md)
