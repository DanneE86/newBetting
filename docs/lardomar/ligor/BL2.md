# 2. Bundesliga (BL2) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/BL2.md`.

Underlag: 2808 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 2808 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- xG-tur (poäng − xP, senaste 8): svag signal (z −2,7) som inte håller i både träning och kontroll. Använd inte.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,0 % | 42,8 % |
| Kryss | 26,8 % | 26,1 % |
| Bortavinst | 30,2 % | 31,1 % |
| Mål per match | 2,95 | |
| Över 2,5 mål | 57,8 % | |
| Båda lagen gör mål | 58,5 % | |
| Logloss stängning / öppning | 1,0502 / 1,0514 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1279 | 26,2 % | 27,6 % | −1,4 pe (−1,2) | ingen effekt |
| mellan | 1065 | 28,8 % | 26,0 % | +2,8 pe (2,0) | ingen effekt |
| klar favorit (> 35 %) | 464 | 23,7 % | 21,9 % | +1,8 pe (0,9) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1416 | 40,9 % | 40,3 % | +0,6 pe (0,4) | ingen effekt |
| 45–55 % | 901 | 46,1 % | 49,3 % | −3,2 pe (−1,9) | ingen effekt |
| 55–65 % | 386 | 57,8 % | 59,0 % | −1,3 pe (−0,5) | ingen effekt |
| 65–75 % | 93 | 69,9 % | 68,5 % | +1,4 pe (0,3) | ingen effekt |
| 75–100 % | 12 | 75,0 % | 77,0 % | – | för lite data |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | −0,083 | +0,047 | +0,032 | +0,0004 (z 0,4, n 972) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,075 | +0,047 | +0,041 | +0,0003 (z 0,3, n 972) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,112 (z −2,7, n 2710) | −0,109 (z −2,1, n 1758) | −0,117 (z −1,7, n 952) | −0,122 (z −3,0, n 2710) | −0,010 (z −3,7, n 2710) | −0,171 p | svag signal (inte bekräftad) |
| xG-form mot målform (xGD − GD, senaste 8) | +0,053 (z 1,7, n 2710) | +0,041 (z 1,1, n 1758) | +0,074 (z 1,4, n 952) | +0,057 (z 1,9, n 2710) | +0,004 (z 2,0, n 2710) | +0,107 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,094 (z −2,3, n 2710) | −0,087 (z −1,7, n 1758) | −0,105 (z −1,5, n 952) | −0,097 (z −2,4, n 2710) | −0,004 (z −1,3, n 2710) | −0,143 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,009 (z 0,2, n 1542) | +0,071 (z 1,0, n 854) | −0,087 (z −1,0, n 688) | +0,001 (z 0,0, n 1542) | −0,007 (z −2,0, n 1542) | +0,013 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,011 (z 0,4, n 1542) | +0,039 (z 1,1, n 854) | −0,026 (z −0,6, n 688) | +0,009 (z 0,3, n 1542) | −0,002 (z −1,1, n 1542) | +0,034 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,026 (z −0,5, n 1542) | −0,023 (z −0,3, n 854) | −0,033 (z −0,4, n 688) | – | – | −0,015 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,003 (z −0,2, n 2661) | −0,002 (z −0,1, n 1734) | −0,009 (z −0,2, n 927) | −0,004 (z −0,3, n 2661) | −0,001 (z −1,1, n 2661) | −0,009 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | −0,348 (z −1,2, n 2808) | −0,094 (z −0,3, n 1836) | −0,837 (z −1,7, n 972) | – | – | −0,072 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | +0,068 (z 0,1, n 1926) | +0,352 (z 0,2, n 1224) | −0,265 (z −0,2, n 702) | – | – | +0,004 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,031 (z 0,2, n 2196) | −0,113 (z −0,5, n 1224) | +0,221 (z 0,8, n 972) | – | – | +0,005 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,019 (z −0,3, n 450) | +0,010 (z 0,1, n 270) | −0,063 (z −0,6, n 180) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,081 (z 1,1, n 317) | +0,076 (z 0,8, n 209) | +0,091 (z 0,8, n 108) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,013 (z −0,5, n 317) | −0,021 (z −0,8, n 209) | +0,004 (z 0,1, n 108) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,197 (z −2,2, n 194) | −0,175 (z −1,5, n 114) | −0,228 (z −1,7, n 80) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,209 (z −2,1, n 176) | −0,105 (z −0,8, n 106) | −0,367 (z −2,4, n 70) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,035 (z −0,2, n 53) | −0,061 (z −0,4, n 52) | – | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,28 (z 2,4, n 106). 
- Lagets extra hemmafördel → nästa säsong: lutning 0,06 (z 0,6, n 106). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Hertha | 6 | 6 | 0 | 0 | 17-7 | 10 | 18 |
| 2 | Nurnberg | 6 | 5 | 1 | 0 | 16-6 | 10 | 16 |
| 3 | Heidenheim | 6 | 4 | 1 | 1 | 14-12 | 2 | 13 |
| 4 | Wolfsburg | 6 | 3 | 2 | 1 | 15-8 | 7 | 11 |
| 5 | Kaiserslautern | 6 | 3 | 2 | 1 | 6-4 | 2 | 11 |
| 6 | Magdeburg | 6 | 3 | 1 | 2 | 11-9 | 2 | 10 |
| 7 | Cottbus | 6 | 2 | 2 | 2 | 14-13 | 1 | 8 |
| 8 | St Pauli | 6 | 1 | 4 | 1 | 8-8 | 0 | 7 |
| 9 | Bochum | 6 | 2 | 1 | 3 | 5-6 | -1 | 7 |
| 10 | Hannover | 6 | 2 | 1 | 3 | 7-9 | -2 | 7 |
| 11 | Osnabruck | 6 | 2 | 1 | 3 | 9-12 | -3 | 7 |
| 12 | Greuther Furth | 6 | 1 | 3 | 2 | 9-11 | -2 | 6 |
| 13 | Bielefeld | 6 | 1 | 2 | 3 | 10-12 | -2 | 5 |
| 14 | Karlsruhe | 6 | 1 | 2 | 3 | 6-12 | -6 | 5 |
| 15 | Braunschweig | 6 | 1 | 1 | 4 | 12-13 | -1 | 4 |
| 16 | Holstein Kiel | 6 | 0 | 4 | 2 | 7-10 | -3 | 4 |
| 17 | Dresden | 6 | 1 | 1 | 4 | 8-14 | -6 | 4 |
| 18 | Darmstadt | 6 | 1 | 1 | 4 | 5-13 | -8 | 4 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/BL2.json`.

## Lagfiler

- [Bielefeld](../lag/BL2/bielefeld.md)
- [Bochum](../lag/BL2/bochum.md)
- [Braunschweig](../lag/BL2/braunschweig.md)
- [Cottbus](../lag/BL2/cottbus.md)
- [Darmstadt](../lag/BL2/darmstadt.md)
- [Dresden](../lag/BL2/dresden.md)
- [Greuther Furth](../lag/BL2/greuther-furth.md)
- [Hannover](../lag/BL2/hannover.md)
- [Heidenheim](../lag/BL2/heidenheim.md)
- [Hertha](../lag/BL2/hertha.md)
- [Holstein Kiel](../lag/BL2/holstein-kiel.md)
- [Kaiserslautern](../lag/BL2/kaiserslautern.md)
- [Karlsruhe](../lag/BL2/karlsruhe.md)
- [Magdeburg](../lag/BL2/magdeburg.md)
- [Nurnberg](../lag/BL2/nurnberg.md)
- [Osnabruck](../lag/BL2/osnabruck.md)
- [St Pauli](../lag/BL2/st-pauli.md)
- [Wolfsburg](../lag/BL2/wolfsburg.md)
