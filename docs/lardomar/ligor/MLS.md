# MLS (MLS) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/MLS.md`.

Underlag: 6204 matcher, säsong 2012 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 49,3 % | 48,5 % |
| Kryss | 25,2 % | 25,2 % |
| Bortavinst | 25,5 % | 26,4 % |
| Mål per match | 2,91 | |
| Över 2,5 mål | 56,9 % | |
| Båda lagen gör mål | 58,1 % | |
| Logloss stängning | 1,0121 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1939 | 27,2 % | 27,3 % | −0,1 pe (−0,1) | ingen effekt |
| mellan | 2526 | 25,7 % | 25,9 % | −0,2 pe (−0,2) | ingen effekt |
| klar favorit (> 35 %) | 1739 | 22,2 % | 21,8 % | +0,4 pe (0,4) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2157 | 39,5 % | 40,6 % | −1,1 pe (−1,0) | ingen effekt |
| 45–55 % | 2225 | 51,2 % | 49,8 % | +1,4 pe (1,4) | ingen effekt |
| 55–65 % | 1354 | 60,1 % | 59,1 % | +1,0 pe (0,8) | ingen effekt |
| 65–75 % | 436 | 69,5 % | 68,6 % | +0,9 pe (0,4) | ingen effekt |
| 75–100 % | 32 | 87,5 % | 77,8 % | +9,8 pe (1,6) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,012 | +0,111 | +0,041 | +0,0035 (z 3,3, n 1692) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,021 (z −0,8, n 6095) | −0,052 (z −1,6, n 4408) | +0,061 (z 1,2, n 1687) | – | – | −0,032 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,042 (z −1,0, n 4922) | −0,068 (z −1,4, n 3402) | +0,029 (z 0,4, n 1520) | – | – | −0,044 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,036 (z −1,9, n 4922) | −0,048 (z −2,2, n 3402) | −0,000 (z 0,0, n 1520) | – | – | −0,082 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,079 (z −2,0, n 4922) | −0,072 (z −1,5, n 3402) | −0,099 (z −1,3, n 1520) | – | – | −0,031 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,002 (z −0,3, n 5940) | −0,006 (z −0,9, n 4348) | +0,019 (z 1,3, n 1592) | – | – | −0,010 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,023 (z −0,0, n 5798) | −0,037 (z −0,1, n 4510) | +1,284 (z 1,0, n 1288) | – | – | −0,002 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,008 (z −0,2, n 867) | +0,010 (z 0,2, n 650) | −0,062 (z −0,7, n 217) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,098 (z 1,8, n 511) | +0,135 (z 1,9, n 337) | +0,026 (z 0,3, n 174) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,001 (z 0,1, n 511) | −0,009 (z −0,4, n 337) | +0,021 (z 0,6, n 174) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,033 (z −0,3, n 112) | −0,030 (z −0,2, n 102) | – | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,016 (z 0,3, n 615) | +0,029 (z 0,5, n 505) | −0,042 (z −0,3, n 110) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,04 (z 0,7, n 334). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,07 (z 1,2, n 332). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-09-29)

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
| 8 | New York Red Bulls | 26 | 9 | 6 | 11 | 34-48 | -14 | 33 |
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
| 2 | FC Dallas | 27 | 13 | 8 | 6 | 50-42 | 8 | 47 |
| 3 | San Jose Earthquakes | 27 | 13 | 6 | 8 | 49-39 | 10 | 45 |
| 4 | Houston Dynamo | 27 | 13 | 5 | 9 | 34-32 | 2 | 44 |
| 5 | St. Louis City | 26 | 12 | 8 | 6 | 45-36 | 9 | 44 |
| 6 | Los Angeles FC | 28 | 11 | 8 | 9 | 43-30 | 13 | 41 |
| 7 | Colorado Rapids | 27 | 11 | 3 | 13 | 38-38 | 0 | 36 |
| 8 | Los Angeles Galaxy | 28 | 9 | 9 | 10 | 37-44 | -7 | 36 |
| 9 | Seattle Sounders | 26 | 9 | 8 | 9 | 33-34 | -1 | 35 |
| 10 | Portland Timbers | 27 | 9 | 5 | 13 | 48-51 | -3 | 32 |
| 11 | Real Salt Lake | 27 | 9 | 5 | 13 | 40-44 | -4 | 32 |
| 12 | San Diego FC | 27 | 8 | 8 | 11 | 47-47 | 0 | 32 |
| 13 | Austin FC | 27 | 7 | 10 | 10 | 35-47 | -12 | 31 |
| 14 | Minnesota United | 27 | 7 | 8 | 12 | 40-49 | -9 | 29 |
| 15 | Sporting Kansas City | 26 | 6 | 3 | 17 | 31-63 | -32 | 21 |

**Supporters Shield**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Nashville SC | 27 | 18 | 6 | 3 | 55-21 | 34 | 60 |
| 2 | Vancouver Whitecaps | 26 | 15 | 5 | 6 | 59-26 | 33 | 50 |
| 3 | FC Dallas | 27 | 13 | 8 | 6 | 50-42 | 8 | 47 |
| 4 | New England Revolution | 27 | 14 | 4 | 9 | 45-36 | 9 | 46 |
| 5 | Inter Miami | 27 | 12 | 10 | 5 | 64-50 | 14 | 46 |
| 6 | San Jose Earthquakes | 27 | 13 | 6 | 8 | 49-39 | 10 | 45 |
| 7 | Houston Dynamo | 27 | 13 | 5 | 9 | 34-32 | 2 | 44 |
| 8 | St. Louis City | 26 | 12 | 8 | 6 | 45-36 | 9 | 44 |
| 9 | Charlotte | 27 | 12 | 7 | 8 | 47-38 | 9 | 43 |
| 10 | Chicago Fire | 26 | 12 | 6 | 8 | 46-38 | 8 | 42 |
| 11 | Los Angeles FC | 28 | 11 | 8 | 9 | 43-30 | 13 | 41 |
| 12 | Philadelphia Union | 27 | 11 | 6 | 10 | 54-44 | 10 | 39 |
| 13 | Colorado Rapids | 27 | 11 | 3 | 13 | 38-38 | 0 | 36 |
| 14 | Los Angeles Galaxy | 28 | 9 | 9 | 10 | 37-44 | -7 | 36 |
| 15 | Seattle Sounders | 26 | 9 | 8 | 9 | 33-34 | -1 | 35 |
| 16 | Orlando City | 27 | 10 | 4 | 13 | 48-64 | -16 | 34 |
| 17 | New York Red Bulls | 26 | 9 | 6 | 11 | 34-48 | -14 | 33 |
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
| 30 | Sporting Kansas City | 26 | 6 | 3 | 17 | 31-63 | -32 | 21 |

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
