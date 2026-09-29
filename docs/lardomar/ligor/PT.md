# Primeira Liga (PT) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/PT.md`.

Underlag: 2816 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 2814 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inbördes möten, poängskillnad: svag signal (z 3,3) som inte håller i både träning och kontroll. Använd inte.
- Favoriter 75–100 %: vann 88,0 % mot oddsens 81,3 %.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,0 % | 43,2 % |
| Kryss | 24,0 % | 25,0 % |
| Bortavinst | 32,0 % | 31,8 % |
| Mål per match | 2,62 | |
| Över 2,5 mål | 49,3 % | |
| Båda lagen gör mål | 48,5 % | |
| Logloss stängning / öppning | 0,9130 / 0,9172 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 832 | 28,5 % | 30,4 % | −1,9 pe (−1,2) | ingen effekt |
| mellan | 849 | 31,1 % | 28,6 % | +2,5 pe (1,6) | ingen effekt |
| klar favorit (> 35 %) | 1135 | 15,4 % | 18,5 % | −3,1 pe (−2,9) | svag signal (inte bekräftad) |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1062 | 39,7 % | 39,6 % | +0,1 pe (0,1) | ingen effekt |
| 45–55 % | 648 | 50,5 % | 49,4 % | +1,1 pe (0,6) | ingen effekt |
| 55–65 % | 328 | 62,2 % | 59,6 % | +2,6 pe (1,0) | ingen effekt |
| 65–75 % | 377 | 75,6 % | 70,1 % | +5,5 pe (2,5) | svag signal (inte bekräftad) |
| 75–100 % | 401 | 88,0 % | 81,3 % | +6,8 pe (4,2) | **bekräftad** |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | +0,158 | −0,016 | −0,046 | −0,0006 (z −0,3, n 980) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,143 | −0,008 | −0,054 | −0,0005 (z −0,2, n 980) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | +0,010 (z 0,3, n 2711) | +0,021 (z 0,5, n 1751) | −0,010 (z −0,2, n 960) | −0,001 (z −0,0, n 2709) | −0,013 (z −4,6, n 2709) | +0,017 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | −0,021 (z −0,8, n 2711) | −0,025 (z −0,8, n 1751) | −0,013 (z −0,3, n 960) | −0,013 (z −0,5, n 2709) | +0,008 (z 3,8, n 2709) | −0,045 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,015 (z −0,4, n 2711) | −0,007 (z −0,1, n 1751) | −0,029 (z −0,4, n 960) | −0,022 (z −0,6, n 2709) | −0,010 (z −3,0, n 2709) | −0,021 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,099 (z 1,9, n 1759) | +0,170 (z 2,5, n 1001) | −0,018 (z −0,2, n 758) | +0,098 (z 1,8, n 1759) | −0,002 (z −0,4, n 1759) | +0,126 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,054 (z 3,3, n 1759) | +0,075 (z 3,4, n 1001) | +0,027 (z 1,1, n 758) | +0,057 (z 3,5, n 1759) | +0,003 (z 1,9, n 1759) | +0,240 p | svag signal (inte bekräftad) |
| Inbördes möten, kryss mot förväntat | +0,120 (z 2,2, n 1759) | +0,089 (z 1,3, n 1001) | +0,159 (z 1,7, n 758) | – | – | +0,055 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,002 (z 0,2, n 2704) | −0,004 (z −0,3, n 1761) | +0,011 (z 0,6, n 943) | +0,003 (z 0,2, n 2702) | +0,001 (z 0,6, n 2702) | +0,010 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,065 (z 0,3, n 2814) | −0,271 (z −0,9, n 1834) | +0,725 (z 1,9, n 980) | – | – | +0,015 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −1,361 (z −1,5, n 1988) | −0,809 (z −0,6, n 1223) | −1,983 (z −1,5, n 765) | – | – | −0,089 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,199 (z 2,0, n 2204) | +0,205 (z 1,5, n 1224) | +0,223 (z 1,6, n 980) | – | – | +0,049 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,051 (z −0,9, n 448) | −0,073 (z −1,0, n 270) | −0,017 (z −0,2, n 178) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,112 (z 1,7, n 323) | +0,126 (z 1,6, n 216) | +0,085 (z 0,7, n 107) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,003 (z −0,1, n 323) | −0,020 (z −0,7, n 216) | +0,033 (z 0,8, n 107) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,130 (z 1,6, n 200) | +0,162 (z 1,5, n 118) | +0,084 (z 0,6, n 82) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,059 (z 0,5, n 98) | +0,039 (z 0,2, n 57) | +0,088 (z 0,6, n 41) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,17 (z 1,6, n 123). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,04 (z 0,5, n 123). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (9 matcher: 9 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,067 / 1,067 / 1,047 / 1,050 |
| Folket streckar favoriten | ×1,08 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 55,6 % / 26,5 % / 26,8 % |
| Favoriter ≥ 55 %: höll / väntat | 100,0 % / 88,8 % (n 1) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 22,2 % | 41,3 % | 42,2 % | 0,53 |
| X | 55,6 % | 26,5 % | 26,8 % | 2,07 |
| 2 | 22,2 % | 32,2 % | 31,0 % | 0,72 |

- Bara 9 matcher: se det som indikation, inte regel.

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Porto | 7 | 7 | 0 | 0 | 18-3 | 15 | 21 |
| 2 | Benfica | 7 | 5 | 1 | 1 | 22-7 | 15 | 16 |
| 3 | Sp Lisbon | 7 | 4 | 3 | 0 | 17-8 | 9 | 15 |
| 4 | Santa Clara | 7 | 4 | 3 | 0 | 11-4 | 7 | 15 |
| 5 | Arouca | 7 | 3 | 2 | 2 | 10-7 | 3 | 11 |
| 6 | Sp Braga | 6 | 3 | 2 | 1 | 7-5 | 2 | 11 |
| 7 | Academico Viseu | 7 | 3 | 2 | 2 | 9-9 | 0 | 11 |
| 8 | Estrela | 7 | 2 | 4 | 1 | 14-14 | 0 | 10 |
| 9 | Gil Vicente | 6 | 2 | 2 | 2 | 5-5 | 0 | 8 |
| 10 | Alverca | 7 | 2 | 2 | 3 | 9-11 | -2 | 8 |
| 11 | Maritimo | 7 | 2 | 2 | 3 | 8-12 | -4 | 8 |
| 12 | Moreirense | 7 | 2 | 2 | 3 | 8-14 | -6 | 8 |
| 13 | Famalicao | 7 | 1 | 4 | 2 | 9-7 | 2 | 7 |
| 14 | Guimaraes | 7 | 1 | 2 | 4 | 5-8 | -3 | 5 |
| 15 | Nacional | 7 | 1 | 1 | 5 | 7-15 | -8 | 4 |
| 16 | Rio Ave | 7 | 1 | 1 | 5 | 5-15 | -10 | 4 |
| 17 | Casa Pia | 7 | 1 | 1 | 5 | 3-16 | -13 | 4 |
| 18 | Estoril | 7 | 0 | 2 | 5 | 3-10 | -7 | 2 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/PT.json`.

## Lagfiler

- [Academico Viseu](../lag/PT/academico-viseu.md)
- [Alverca](../lag/PT/alverca.md)
- [Arouca](../lag/PT/arouca.md)
- [Benfica](../lag/PT/benfica.md)
- [Casa Pia](../lag/PT/casa-pia.md)
- [Estoril](../lag/PT/estoril.md)
- [Estrela](../lag/PT/estrela.md)
- [Famalicao](../lag/PT/famalicao.md)
- [Gil Vicente](../lag/PT/gil-vicente.md)
- [Guimaraes](../lag/PT/guimaraes.md)
- [Maritimo](../lag/PT/maritimo.md)
- [Moreirense](../lag/PT/moreirense.md)
- [Nacional](../lag/PT/nacional.md)
- [Porto](../lag/PT/porto.md)
- [Rio Ave](../lag/PT/rio-ave.md)
- [Santa Clara](../lag/PT/santa-clara.md)
- [Sp Braga](../lag/PT/sp-braga.md)
- [Sp Lisbon](../lag/PT/sp-lisbon.md)
