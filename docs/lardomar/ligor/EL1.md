# League One (EL1) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/EL1.md`.

Underlag: 4903 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 4902 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,2 % | 42,2 % |
| Kryss | 25,7 % | 26,8 % |
| Bortavinst | 31,1 % | 31,0 % |
| Mål per match | 2,61 | |
| Över 2,5 mål | 49,2 % | |
| Båda lagen gör mål | 51,5 % | |
| Logloss stängning / öppning | 1,0210 / 1,0246 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1989 | 26,5 % | 28,6 % | −2,1 pe (−2,1) | ingen effekt |
| mellan | 1920 | 26,6 % | 27,0 % | −0,4 pe (−0,4) | ingen effekt |
| klar favorit (> 35 %) | 994 | 22,3 % | 22,7 % | −0,4 pe (−0,3) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2312 | 40,6 % | 40,0 % | +0,5 pe (0,5) | ingen effekt |
| 45–55 % | 1622 | 53,0 % | 49,5 % | +3,5 pe (2,8) | svag signal (inte bekräftad) |
| 55–65 % | 721 | 61,3 % | 59,1 % | +2,2 pe (1,2) | ingen effekt |
| 65–75 % | 216 | 71,3 % | 68,5 % | +2,8 pe (0,9) | ingen effekt |
| 75–100 % | 32 | 78,1 % | 78,2 % | −0,1 pe (−0,0) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | +0,102 | +0,008 | +0,003 | −0,0008 (z −1,0, n 1743) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,117 | +0,004 | +0,004 | −0,0007 (z −0,8, n 1743) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | +0,012 (z 0,4, n 4841) | −0,013 (z −0,4, n 3098) | +0,055 (z 1,2, n 1743) | +0,006 (z 0,2, n 4840) | −0,006 (z −3,3, n 4840) | +0,020 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | −0,014 (z −0,6, n 4841) | −0,010 (z −0,3, n 3098) | −0,023 (z −0,6, n 1743) | −0,012 (z −0,5, n 4840) | +0,002 (z 1,5, n 4840) | −0,028 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,002 (z −0,1, n 4841) | −0,029 (z −0,8, n 3098) | +0,042 (z 0,9, n 1743) | −0,009 (z −0,3, n 4840) | −0,006 (z −3,3, n 4840) | −0,004 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,031 (z −0,7, n 2580) | −0,012 (z −0,2, n 1385) | −0,059 (z −0,8, n 1195) | −0,029 (z −0,6, n 2580) | +0,003 (z 0,9, n 2580) | −0,045 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,002 (z −0,1, n 2580) | −0,004 (z −0,2, n 1385) | +0,002 (z 0,1, n 1195) | +0,000 (z 0,0, n 2580) | +0,002 (z 1,5, n 2580) | −0,005 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,031 (z −0,7, n 2580) | −0,050 (z −0,9, n 1385) | −0,002 (z −0,0, n 1195) | – | – | −0,016 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,000 (z −0,0, n 4783) | +0,009 (z 0,9, n 3088) | −0,018 (z −1,3, n 1695) | 0,000 (z 0,0, n 4782) | +0,000 (z 0,3, n 4782) | −0,001 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,334 (z 1,6, n 4902) | +0,442 (z 1,7, n 3159) | +0,121 (z 0,3, n 1743) | – | – | +0,068 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,561 (z −0,7, n 3318) | −2,546 (z −2,1, n 2049) | +0,911 (z 0,9, n 1269) | – | – | −0,033 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | −0,093 (z −0,8, n 3798) | +0,100 (z 0,6, n 2056) | −0,275 (z −1,6, n 1742) | – | – | −0,014 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,074 (z 1,4, n 587) | +0,116 (z 1,7, n 351) | +0,011 (z 0,1, n 236) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,073 (z −1,2, n 389) | +0,034 (z 0,5, n 260) | −0,290 (z −2,7, n 129) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,010 (z 0,5, n 389) | +0,029 (z 1,0, n 260) | −0,028 (z −0,8, n 129) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,010 (z 0,1, n 297) | −0,095 (z −1,0, n 172) | +0,155 (z 1,4, n 125) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,078 (z 0,9, n 228) | +0,121 (z 1,1, n 136) | +0,013 (z 0,1, n 92) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,067 (z −1,2, n 502) | −0,106 (z −1,6, n 325) | +0,005 (z 0,1, n 177) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,02 (z −0,2, n 136). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,12 (z −1,4, n 136). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (51 matcher: 50 Stryktipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,098 / 1,097 / 1,135 / 1,128 |
| Folket streckar favoriten | ×1,12 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 33,3 % / 27,4 % / 25,7 % |
| Favoriter ≥ 55 %: höll / väntat | 100,0 % / 57,9 % (n 2) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 33,3 % | 39,0 % | 41,5 % | 0,80 |
| X | 33,3 % | 27,4 % | 25,7 % | 1,30 |
| 2 | 33,3 % | 33,6 % | 32,7 % | 1,02 |

- Folket överstreckar favoriter (×1,12). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 1,6 procentenheter under vår procent. Kryss ger streckvärde.

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Bradford | 7 | 5 | 0 | 2 | 7-4 | 3 | 15 |
| 2 | Sheffield Weds | 7 | 4 | 2 | 1 | 13-6 | 7 | 14 |
| 3 | Stockport | 8 | 4 | 1 | 3 | 17-10 | 7 | 13 |
| 4 | Plymouth | 8 | 4 | 1 | 3 | 14-11 | 3 | 13 |
| 5 | Cambridge | 8 | 3 | 4 | 1 | 13-11 | 2 | 13 |
| 6 | Huddersfield | 7 | 3 | 3 | 1 | 11-6 | 5 | 12 |
| 7 | Burton | 8 | 3 | 3 | 2 | 13-12 | 1 | 12 |
| 8 | AFC Wimbledon | 8 | 3 | 3 | 2 | 6-8 | -2 | 12 |
| 9 | Reading | 7 | 3 | 2 | 2 | 16-9 | 7 | 11 |
| 10 | Oxford | 6 | 3 | 2 | 1 | 13-7 | 6 | 11 |
| 11 | Leyton Orient | 7 | 3 | 1 | 3 | 13-9 | 4 | 10 |
| 12 | Wycombe | 8 | 2 | 4 | 2 | 13-16 | -3 | 10 |
| 13 | Stevenage | 7 | 2 | 3 | 2 | 11-8 | 3 | 9 |
| 14 | Leicester | 7 | 2 | 3 | 2 | 9-11 | -2 | 9 |
| 15 | Blackpool | 7 | 2 | 2 | 3 | 13-13 | 0 | 8 |
| 16 | Luton | 7 | 2 | 2 | 3 | 12-14 | -2 | 8 |
| 17 | Mansfield | 7 | 2 | 2 | 3 | 10-13 | -3 | 8 |
| 18 | Barnsley | 7 | 2 | 2 | 3 | 7-12 | -5 | 8 |
| 19 | Bromley | 7 | 2 | 2 | 3 | 8-18 | -10 | 8 |
| 20 | Notts County | 7 | 1 | 4 | 2 | 7-9 | -2 | 7 |
| 21 | Doncaster | 7 | 1 | 3 | 3 | 8-9 | -1 | 6 |
| 22 | Milton Keynes Dons | 7 | 0 | 6 | 1 | 8-10 | -2 | 6 |
| 23 | Peterboro | 8 | 1 | 2 | 5 | 4-13 | -9 | 5 |
| 24 | Wigan | 7 | 1 | 1 | 5 | 5-12 | -7 | 4 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/EL1.json`.

## Lagfiler

- [AFC Wimbledon](../lag/EL1/afc-wimbledon.md)
- [Barnsley](../lag/EL1/barnsley.md)
- [Blackpool](../lag/EL1/blackpool.md)
- [Bradford](../lag/EL1/bradford.md)
- [Bromley](../lag/EL1/bromley.md)
- [Burton](../lag/EL1/burton.md)
- [Cambridge](../lag/EL1/cambridge.md)
- [Doncaster](../lag/EL1/doncaster.md)
- [Huddersfield](../lag/EL1/huddersfield.md)
- [Leicester](../lag/EL1/leicester.md)
- [Leyton Orient](../lag/EL1/leyton-orient.md)
- [Luton](../lag/EL1/luton.md)
- [Mansfield](../lag/EL1/mansfield.md)
- [Milton Keynes Dons](../lag/EL1/milton-keynes-dons.md)
- [Notts County](../lag/EL1/notts-county.md)
- [Oxford](../lag/EL1/oxford.md)
- [Peterboro](../lag/EL1/peterboro.md)
- [Plymouth](../lag/EL1/plymouth.md)
- [Reading](../lag/EL1/reading.md)
- [Sheffield Weds](../lag/EL1/sheffield-weds.md)
- [Stevenage](../lag/EL1/stevenage.md)
- [Stockport](../lag/EL1/stockport.md)
- [Wigan](../lag/EL1/wigan.md)
- [Wycombe](../lag/EL1/wycombe.md)
