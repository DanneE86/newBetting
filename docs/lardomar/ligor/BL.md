# Bundesliga (BL) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/BL.md`.

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

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,042 (z −1,0, n 2745) | −0,059 (z −1,1, n 1791) | −0,008 (z −0,1, n 954) | −0,062 (z −1,4, n 2744) | −0,020 (z −7,0, n 2744) | −0,057 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,018 (z 0,6, n 2745) | +0,025 (z 0,6, n 1791) | +0,004 (z 0,1, n 954) | +0,034 (z 1,1, n 2744) | +0,016 (z 7,5, n 2744) | +0,034 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,039 (z −1,0, n 2745) | −0,064 (z −1,3, n 1791) | +0,013 (z 0,2, n 954) | −0,050 (z −1,3, n 2744) | −0,010 (z −3,9, n 2744) | −0,059 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,145 (z 2,4, n 1924) | +0,143 (z 1,9, n 1125) | +0,151 (z 1,5, n 799) | +0,146 (z 2,5, n 1923) | +0,001 (z 0,3, n 1923) | +0,169 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,036 (z 1,6, n 1924) | +0,012 (z 0,4, n 1125) | +0,078 (z 2,2, n 799) | +0,035 (z 1,6, n 1923) | −0,002 (z −1,1, n 1923) | +0,114 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,105 (z −1,9, n 1924) | −0,111 (z −1,7, n 1125) | −0,087 (z −0,8, n 799) | – | – | −0,049 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,051 (z −2,5, n 2682) | −0,046 (z −1,8, n 1764) | −0,061 (z −1,8, n 918) | −0,050 (z −2,4, n 2681) | +0,001 (z 0,9, n 2681) | −0,102 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta) | +0,880 (z 1,7, n 648) | – | +0,880 (z 1,7, n 648) | +0,762 (z 1,5, n 648) | −0,118 (z −3,4, n 648) | +0,206 p | ingen effekt |

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
