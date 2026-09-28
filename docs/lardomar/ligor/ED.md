# Eredivisie (ED) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/ED.md`.

Underlag: 2743 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 2740 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,9 % | 45,7 % |
| Kryss | 23,6 % | 22,2 % |
| Bortavinst | 31,5 % | 32,1 % |
| Mål per match | 3,13 | |
| Över 2,5 mål | 60,5 % | |
| Båda lagen gör mål | 57,0 % | |
| Logloss stängning / öppning | 0,9280 / 0,9349 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 720 | 27,8 % | 27,1 % | +0,7 pe (0,4) | ingen effekt |
| mellan | 728 | 26,9 % | 25,5 % | +1,4 pe (0,8) | ingen effekt |
| klar favorit (> 35 %) | 1295 | 19,4 % | 17,7 % | +1,7 pe (1,6) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 779 | 40,7 % | 40,5 % | +0,2 pe (0,1) | ingen effekt |
| 45–55 % | 641 | 48,4 % | 49,6 % | −1,2 pe (−0,6) | ingen effekt |
| 55–65 % | 518 | 59,5 % | 59,8 % | −0,3 pe (−0,1) | ingen effekt |
| 65–75 % | 394 | 68,5 % | 69,7 % | −1,1 pe (−0,5) | ingen effekt |
| 75–100 % | 411 | 84,7 % | 81,8 % | +2,9 pe (1,6) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,017 (z −0,5, n 2650) | −0,033 (z −0,7, n 1679) | +0,009 (z 0,1, n 971) | −0,029 (z −0,8, n 2647) | −0,011 (z −4,0, n 2647) | −0,027 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,002 (z 0,1, n 2650) | +0,021 (z 0,7, n 1679) | −0,033 (z −0,8, n 971) | +0,007 (z 0,3, n 2647) | +0,006 (z 2,9, n 2647) | +0,003 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,042 (z −1,1, n 2650) | −0,062 (z −1,2, n 1679) | −0,008 (z −0,1, n 971) | −0,046 (z −1,1, n 2647) | −0,003 (z −1,1, n 2647) | −0,061 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,073 (z −1,2, n 1790) | −0,062 (z −0,8, n 951) | −0,099 (z −1,0, n 839) | −0,081 (z −1,4, n 1790) | −0,008 (z −1,7, n 1790) | −0,081 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,010 (z −0,6, n 1790) | −0,027 (z −1,1, n 951) | +0,011 (z 0,4, n 839) | −0,010 (z −0,6, n 1790) | −0,000 (z −0,2, n 1790) | −0,042 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,136 (z 2,5, n 1790) | +0,134 (z 2,0, n 951) | +0,138 (z 1,5, n 839) | – | – | +0,064 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,005 (z −0,3, n 2642) | +0,010 (z 0,6, n 1698) | −0,022 (z −1,1, n 944) | −0,004 (z −0,3, n 2639) | +0,000 (z 0,1, n 2639) | −0,009 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,144 (z −2,7, n 437) | −0,142 (z −2,0, n 264) | −0,148 (z −1,8, n 173) | svag signal (inte bekräftad) |
| Sista 4 omgångarna (hemmalagets poäng) | +0,013 (z 0,2, n 318) | +0,101 (z 1,2, n 212) | −0,164 (z −1,5, n 106) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,001 (z −0,0, n 318) | −0,021 (z −0,8, n 212) | +0,039 (z 0,9, n 106) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,028 (z −0,3, n 201) | −0,006 (z −0,1, n 102) | −0,050 (z −0,4, n 99) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,057 (z 0,5, n 92) | −0,167 (z −1,0, n 47) | +0,290 (z 1,7, n 45) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,07 (z 0,6, n 123). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,12 (z 1,5, n 123). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (7 matcher: 7 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,040 / 1,041 / 1,069 / 0,979 |
| Folket streckar favoriten | ×1,17 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 14,3 % / 24,0 % / 20,7 % |
| Favoriter ≥ 55 %: höll / väntat | 50,0 % / 56,5 % (n 2) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 42,9 % | 36,6 % | 38,1 % | 1,12 |
| X | 14,3 % | 24,0 % | 20,7 % | 0,69 |
| 2 | 42,9 % | 39,4 % | 41,1 % | 1,04 |

- Folket överstreckar favoriter (×1,17). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 3,3 procentenheter under vår procent. Kryss ger streckvärde.
- Bara 7 matcher: se det som indikation, inte regel.

## Lagfiler

- [Ajax](../lag/ED/ajax.md)
- [AZ Alkmaar](../lag/ED/az-alkmaar.md)
- [Cambuur](../lag/ED/cambuur.md)
- [Den Haag](../lag/ED/den-haag.md)
- [Excelsior](../lag/ED/excelsior.md)
- [Feyenoord](../lag/ED/feyenoord.md)
- [For Sittard](../lag/ED/for-sittard.md)
- [Go Ahead Eagles](../lag/ED/go-ahead-eagles.md)
- [Groningen](../lag/ED/groningen.md)
- [Heerenveen](../lag/ED/heerenveen.md)
- [Nijmegen](../lag/ED/nijmegen.md)
- [PSV Eindhoven](../lag/ED/psv-eindhoven.md)
- [Sparta Rotterdam](../lag/ED/sparta-rotterdam.md)
- [Telstar](../lag/ED/telstar.md)
- [Twente](../lag/ED/twente.md)
- [Utrecht](../lag/ED/utrecht.md)
- [Willem II](../lag/ED/willem-ii.md)
- [Zwolle](../lag/ED/zwolle.md)
