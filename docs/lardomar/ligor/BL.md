# Bundesliga (BL) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/BL.md`.

Underlag: 2790 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 2789 matcher. xG: Understat (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,8 % | 44,6 % |
| Kryss | 24,8 % | 23,6 % |
| Bortavinst | 31,4 % | 31,8 % |
| Mål per match | 3,13 | |
| Över 2,5 mål | 60,6 % | |
| Båda lagen gör mål | 59,2 % | |
| Logloss stängning / öppning | 0,9755 / 0,9767 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 854 | 28,3 % | 27,5 % | +0,8 pe (0,6) | ingen effekt |
| mellan | 890 | 28,2 % | 25,8 % | +2,4 pe (1,6) | ingen effekt |
| klar favorit (> 35 %) | 1046 | 19,1 % | 18,5 % | +0,6 pe (0,5) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 949 | 39,5 % | 40,4 % | −0,9 pe (−0,5) | ingen effekt |
| 45–55 % | 757 | 48,2 % | 49,7 % | −1,4 pe (−0,8) | ingen effekt |
| 55–65 % | 514 | 59,5 % | 59,7 % | −0,2 pe (−0,1) | ingen effekt |
| 65–75 % | 319 | 71,8 % | 69,5 % | +2,3 pe (0,9) | ingen effekt |
| 75–100 % | 251 | 79,7 % | 81,6 % | −1,9 pe (−0,7) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | −0,034 | +0,036 | +0,042 | +0,0008 (z 1,0, n 954) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | −0,038 | +0,042 | +0,041 | +0,0011 (z 1,4, n 954) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,042 (z −1,0, n 2745) | −0,059 (z −1,1, n 1791) | −0,007 (z −0,1, n 954) | −0,062 (z −1,4, n 2744) | −0,020 (z −7,0, n 2744) | −0,056 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,017 (z 0,6, n 2745) | +0,025 (z 0,6, n 1791) | +0,003 (z 0,1, n 954) | +0,033 (z 1,1, n 2744) | +0,016 (z 7,5, n 2744) | +0,033 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,039 (z −1,0, n 2745) | −0,064 (z −1,3, n 1791) | +0,013 (z 0,2, n 954) | −0,050 (z −1,3, n 2744) | −0,010 (z −3,9, n 2744) | −0,059 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,145 (z 2,4, n 1924) | +0,143 (z 1,9, n 1125) | +0,151 (z 1,5, n 799) | +0,146 (z 2,5, n 1923) | +0,001 (z 0,3, n 1923) | +0,169 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,036 (z 1,6, n 1924) | +0,012 (z 0,4, n 1125) | +0,078 (z 2,2, n 799) | +0,035 (z 1,6, n 1923) | −0,002 (z −1,1, n 1923) | +0,114 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,105 (z −1,9, n 1924) | −0,111 (z −1,7, n 1125) | −0,087 (z −0,8, n 799) | – | – | −0,049 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,051 (z −2,5, n 2682) | −0,046 (z −1,8, n 1764) | −0,061 (z −1,8, n 918) | −0,050 (z −2,4, n 2681) | +0,001 (z 0,9, n 2681) | −0,102 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–) | +0,880 (z 1,7, n 648) | +1,359 (z 1,9, n 306) | +0,408 (z 0,5, n 342) | +0,762 (z 1,5, n 648) | −0,118 (z −3,4, n 648) | +0,206 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | −0,312 (z −1,1, n 2789) | −0,257 (z −0,7, n 1835) | −0,341 (z −0,7, n 954) | – | – | −0,063 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | +0,308 (z 0,3, n 1985) | +1,336 (z 0,8, n 1224) | −1,348 (z −0,7, n 761) | – | – | +0,016 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,071 (z 0,7, n 2178) | +0,048 (z 0,4, n 1224) | +0,115 (z 0,7, n 954) | – | – | +0,016 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,046 (z −0,8, n 441) | −0,037 (z −0,5, n 270) | −0,060 (z −0,7, n 171) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,022 (z −0,3, n 322) | +0,087 (z 1,0, n 214) | −0,238 (z −2,1, n 108) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,014 (z 0,6, n 322) | −0,013 (z −0,5, n 214) | +0,069 (z 1,6, n 108) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,120 (z −1,3, n 172) | −0,198 (z −1,8, n 104) | −0,001 (z −0,0, n 68) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,319 (z 1,3, n 26) | – | – | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,12 (z −1,3, n 127). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,08 (z 0,8, n 127). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (55 matcher: 55 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 0,971 / 0,971 / 0,949 / 0,977 |
| Folket streckar favoriten | ×1,16 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 27,3 % / 24,9 % / 21,9 % |
| Favoriter ≥ 55 %: höll / väntat | 75,0 % / 61,7 % (n 12) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 47,3 % | 43,4 % | 48,0 % | 0,98 |
| X | 27,3 % | 24,9 % | 21,9 % | 1,24 |
| 2 | 25,5 % | 31,7 % | 30,0 % | 0,85 |

- Folket överstreckar favoriter (×1,16). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 2,9 procentenheter under vår procent. Kryss ger streckvärde.
- Folket slog vår slutprocent i ligan. Kontrollera oddskällan (gamla odds?).

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Dortmund | 4 | 4 | 0 | 0 | 9-2 | 7 | 12 |
| 2 | Bayern Munich | 4 | 3 | 1 | 0 | 14-2 | 12 | 10 |
| 3 | Freiburg | 4 | 3 | 1 | 0 | 12-3 | 9 | 10 |
| 4 | Augsburg | 4 | 2 | 1 | 1 | 11-6 | 5 | 7 |
| 5 | Leverkusen | 4 | 2 | 1 | 1 | 10-5 | 5 | 7 |
| 6 | Mainz | 4 | 2 | 1 | 1 | 10-6 | 4 | 7 |
| 7 | Elversberg | 4 | 2 | 1 | 1 | 8-7 | 1 | 7 |
| 8 | Werder Bremen | 4 | 2 | 1 | 1 | 8-8 | 0 | 7 |
| 9 | RB Leipzig | 4 | 2 | 0 | 2 | 9-5 | 4 | 6 |
| 10 | Ein Frankfurt | 4 | 1 | 2 | 1 | 9-10 | -1 | 5 |
| 11 | Schalke 04 | 4 | 1 | 2 | 1 | 3-4 | -1 | 5 |
| 12 | Paderborn | 4 | 1 | 1 | 2 | 3-5 | -2 | 4 |
| 13 | FC Koln | 4 | 1 | 1 | 2 | 6-9 | -3 | 4 |
| 14 | Hoffenheim | 4 | 1 | 0 | 3 | 7-10 | -3 | 3 |
| 15 | Stuttgart | 4 | 1 | 0 | 3 | 6-9 | -3 | 3 |
| 16 | Hamburg | 4 | 1 | 0 | 3 | 2-13 | -11 | 3 |
| 17 | Union Berlin | 4 | 0 | 1 | 3 | 4-17 | -13 | 1 |
| 18 | M'gladbach | 4 | 0 | 0 | 4 | 6-16 | -10 | 0 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/BL.json`.

## Lagfiler

- [Augsburg](../lag/BL/augsburg.md)
- [Bayern Munich](../lag/BL/bayern-munich.md)
- [Dortmund](../lag/BL/dortmund.md)
- [Ein Frankfurt](../lag/BL/ein-frankfurt.md)
- [Elversberg](../lag/BL/elversberg.md)
- [FC Koln](../lag/BL/fc-koln.md)
- [Freiburg](../lag/BL/freiburg.md)
- [Hamburg](../lag/BL/hamburg.md)
- [Hoffenheim](../lag/BL/hoffenheim.md)
- [Leverkusen](../lag/BL/leverkusen.md)
- [M'gladbach](../lag/BL/m-gladbach.md)
- [Mainz](../lag/BL/mainz.md)
- [Paderborn](../lag/BL/paderborn.md)
- [RB Leipzig](../lag/BL/rb-leipzig.md)
- [Schalke 04](../lag/BL/schalke-04.md)
- [Stuttgart](../lag/BL/stuttgart.md)
- [Union Berlin](../lag/BL/union-berlin.md)
- [Werder Bremen](../lag/BL/werder-bremen.md)
