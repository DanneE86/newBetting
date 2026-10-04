# League Two (EL2) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/EL2.md`.

Underlag: 4950 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 4943 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 42,7 % | 41,8 % |
| Kryss | 27,2 % | 27,5 % |
| Bortavinst | 30,1 % | 30,7 % |
| Mål per match | 2,55 | |
| Över 2,5 mål | 47,0 % | |
| Båda lagen gör mål | 51,4 % | |
| Logloss stängning / öppning | 1,0459 / 1,0491 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 2308 | 28,1 % | 28,9 % | −0,8 pe (−0,9) | ingen effekt |
| mellan | 1944 | 27,3 % | 27,3 % | −0,1 pe (−0,1) | ingen effekt |
| klar favorit (> 35 %) | 698 | 24,2 % | 23,3 % | +0,9 pe (0,5) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2715 | 41,4 % | 40,0 % | +1,4 pe (1,5) | ingen effekt |
| 45–55 % | 1566 | 48,9 % | 49,4 % | −0,6 pe (−0,5) | ingen effekt |
| 55–65 % | 561 | 59,2 % | 58,9 % | +0,3 pe (0,1) | ingen effekt |
| 65–75 % | 104 | 74,0 % | 68,3 % | +5,8 pe (1,3) | ingen effekt |
| 75–100 % | 4 | 50,0 % | 81,7 % | – | för lite data |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | +0,038 | +0,034 | +0,020 | +0,0001 (z 0,3, n 1750) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,048 | +0,028 | +0,015 | +0,0001 (z 0,1, n 1750) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,004 (z −0,1, n 4830) | −0,007 (z −0,2, n 3095) | +0,002 (z 0,0, n 1735) | −0,003 (z −0,1, n 4823) | −0,001 (z −0,3, n 4823) | −0,006 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,027 (z 1,1, n 4830) | +0,034 (z 1,1, n 3095) | +0,016 (z 0,4, n 1735) | +0,027 (z 1,1, n 4823) | −0,001 (z −0,5, n 4823) | +0,050 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,012 (z −0,4, n 4830) | −0,012 (z −0,3, n 3095) | −0,011 (z −0,2, n 1735) | −0,008 (z −0,3, n 4823) | +0,003 (z 1,7, n 4823) | −0,018 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,060 (z 1,5, n 2611) | +0,080 (z 1,5, n 1324) | +0,034 (z 0,5, n 1287) | +0,054 (z 1,3, n 2608) | −0,005 (z −2,1, n 2608) | +0,097 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,023 (z 1,1, n 2611) | +0,033 (z 1,3, n 1324) | +0,009 (z 0,3, n 1287) | +0,020 (z 1,0, n 2608) | −0,002 (z −1,6, n 2608) | +0,074 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,082 (z −1,8, n 2611) | −0,180 (z −3,0, n 1324) | +0,041 (z 0,6, n 1287) | – | – | −0,041 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,003 (z 0,3, n 4825) | +0,014 (z 1,2, n 3124) | −0,021 (z −1,2, n 1701) | +0,004 (z 0,5, n 4818) | +0,001 (z 2,4, n 4818) | +0,007 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,238 (z 1,0, n 4943) | +0,107 (z 0,4, n 3193) | +0,568 (z 1,3, n 1750) | – | – | +0,045 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | +0,371 (z 0,4, n 3364) | −0,274 (z −0,2, n 2093) | +1,210 (z 0,8, n 1271) | – | – | +0,021 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,042 (z 0,4, n 3842) | +0,042 (z 0,2, n 2096) | +0,020 (z 0,1, n 1746) | – | – | +0,007 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,098 (z 1,9, n 591) | +0,061 (z 0,9, n 355) | +0,153 (z 1,9, n 236) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,012 (z −0,2, n 398) | +0,035 (z 0,4, n 264) | −0,104 (z −1,0, n 134) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,010 (z −0,4, n 398) | −0,028 (z −1,1, n 264) | +0,026 (z 0,7, n 134) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,152 (z −1,6, n 166) | −0,258 (z −2,0, n 94) | −0,015 (z −0,1, n 72) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,220 (z −3,1, n 306) | −0,187 (z −2,0, n 168) | −0,260 (z −2,5, n 138) | svag signal (inte bekräftad) |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,014 (z −0,2, n 400) | −0,056 (z −0,7, n 274) | +0,076 (z 0,7, n 126) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,02 (z 0,2, n 145). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,04 (z 0,5, n 145). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Salford | 9 | 5 | 1 | 3 | 13-10 | 3 | 16 |
| 2 | Barnet | 7 | 4 | 3 | 0 | 17-10 | 7 | 15 |
| 3 | Crewe | 9 | 3 | 6 | 0 | 11-7 | 4 | 15 |
| 4 | Cheltenham | 9 | 4 | 3 | 2 | 16-14 | 2 | 15 |
| 5 | Bristol Rvs | 9 | 5 | 0 | 4 | 14-14 | 0 | 15 |
| 6 | York | 8 | 4 | 2 | 2 | 16-10 | 6 | 14 |
| 7 | Walsall | 8 | 3 | 5 | 0 | 11-5 | 6 | 14 |
| 8 | Chesterfield | 9 | 4 | 2 | 3 | 15-12 | 3 | 14 |
| 9 | Grimsby | 9 | 3 | 4 | 2 | 13-10 | 3 | 13 |
| 10 | Gillingham | 9 | 3 | 4 | 2 | 11-9 | 2 | 13 |
| 11 | Rochdale | 9 | 4 | 1 | 4 | 10-11 | -1 | 13 |
| 12 | Tranmere | 9 | 2 | 5 | 2 | 12-12 | 0 | 11 |
| 13 | Swindon | 9 | 3 | 2 | 4 | 9-13 | -4 | 11 |
| 14 | Shrewsbury | 9 | 3 | 2 | 4 | 9-14 | -5 | 11 |
| 15 | Newport County | 9 | 2 | 4 | 3 | 12-12 | 0 | 10 |
| 16 | Accrington | 9 | 2 | 4 | 3 | 13-14 | -1 | 10 |
| 17 | Rotherham | 9 | 2 | 4 | 3 | 11-12 | -1 | 10 |
| 18 | Fleetwood Town | 9 | 2 | 4 | 3 | 9-10 | -1 | 10 |
| 19 | Colchester | 8 | 2 | 4 | 2 | 10-12 | -2 | 10 |
| 20 | Exeter | 9 | 2 | 3 | 4 | 5-6 | -1 | 9 |
| 21 | Oldham | 8 | 2 | 1 | 5 | 9-13 | -4 | 7 |
| 22 | Northampton | 7 | 1 | 3 | 3 | 3-6 | -3 | 6 |
| 23 | Port Vale | 7 | 1 | 2 | 4 | 3-9 | -6 | 5 |
| 24 | Crawley Town | 7 | 1 | 1 | 5 | 6-13 | -7 | 4 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/EL2.json`.

## Lagfiler

- [Accrington](../lag/EL2/accrington.md)
- [Barnet](../lag/EL2/barnet.md)
- [Bristol Rvs](../lag/EL2/bristol-rvs.md)
- [Cheltenham](../lag/EL2/cheltenham.md)
- [Chesterfield](../lag/EL2/chesterfield.md)
- [Colchester](../lag/EL2/colchester.md)
- [Crawley Town](../lag/EL2/crawley-town.md)
- [Crewe](../lag/EL2/crewe.md)
- [Exeter](../lag/EL2/exeter.md)
- [Fleetwood Town](../lag/EL2/fleetwood-town.md)
- [Gillingham](../lag/EL2/gillingham.md)
- [Grimsby](../lag/EL2/grimsby.md)
- [Newport County](../lag/EL2/newport-county.md)
- [Northampton](../lag/EL2/northampton.md)
- [Oldham](../lag/EL2/oldham.md)
- [Port Vale](../lag/EL2/port-vale.md)
- [Rochdale](../lag/EL2/rochdale.md)
- [Rotherham](../lag/EL2/rotherham.md)
- [Salford](../lag/EL2/salford.md)
- [Shrewsbury](../lag/EL2/shrewsbury.md)
- [Swindon](../lag/EL2/swindon.md)
- [Tranmere](../lag/EL2/tranmere.md)
- [Walsall](../lag/EL2/walsall.md)
- [York](../lag/EL2/york.md)
