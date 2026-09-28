# Allsvenskan (AS) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/AS.md`.

Underlag: 3560 matcher, säsong 2012 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,5 % | 44,7 % |
| Kryss | 24,9 % | 25,1 % |
| Bortavinst | 31,6 % | 30,2 % |
| Mål per match | 2,80 | |
| Över 2,5 mål | 53,9 % | |
| Båda lagen gör mål | 54,4 % | |
| Logloss stängning | 0,9841 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1077 | 29,2 % | 28,2 % | +0,9 pe (0,7) | ingen effekt |
| mellan | 1175 | 27,5 % | 26,6 % | +0,9 pe (0,7) | ingen effekt |
| klar favorit (> 35 %) | 1308 | 19,2 % | 21,1 % | −1,9 pe (−1,8) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1253 | 38,5 % | 40,2 % | −1,7 pe (−1,2) | ingen effekt |
| 45–55 % | 999 | 48,6 % | 49,8 % | −1,1 pe (−0,7) | ingen effekt |
| 55–65 % | 760 | 62,6 % | 59,5 % | +3,1 pe (1,8) | ingen effekt |
| 65–75 % | 415 | 71,3 % | 69,2 % | +2,1 pe (0,9) | ingen effekt |
| 75–100 % | 132 | 81,8 % | 78,6 % | +3,2 pe (0,9) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,110 | −0,083 | +0,037 | +0,0002 (z 0,1, n 800) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,025 (z −0,7, n 3430) | −0,013 (z −0,3, n 2645) | −0,063 (z −0,8, n 785) | – | – | −0,039 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,044 (z 0,9, n 2430) | +0,049 (z 0,9, n 1790) | +0,027 (z 0,3, n 640) | – | – | +0,055 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,016 (z 0,8, n 2430) | +0,018 (z 0,8, n 1790) | +0,011 (z 0,3, n 640) | – | – | +0,056 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,002 (z −0,0, n 2430) | +0,008 (z 0,1, n 1790) | −0,059 (z −0,6, n 640) | – | – | −0,001 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,021 (z 1,6, n 3370) | +0,009 (z 0,5, n 2611) | +0,061 (z 2,1, n 759) | – | – | +0,043 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −1,538 (z −2,2, n 3366) | −1,558 (z −2,0, n 2758) | −1,430 (z −0,9, n 608) | – | – | −0,110 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,004 (z 0,1, n 599) | +0,025 (z 0,5, n 479) | −0,078 (z −0,7, n 120) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,153 (z −2,6, n 455) | −0,191 (z −2,8, n 330) | −0,053 (z −0,5, n 125) | svag signal (inte bekräftad) |
| Sista 4 omgångarna (kryss mot förväntat) | −0,017 (z −0,9, n 455) | −0,021 (z −0,9, n 330) | −0,007 (z −0,2, n 125) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,088 (z −1,2, n 288) | −0,055 (z −0,7, n 220) | −0,194 (z −1,3, n 68) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,180 (z −1,4, n 94) | −0,104 (z −0,7, n 71) | −0,415 (z −1,5, n 23) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,02 (z 0,3, n 190). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,01 (z −0,2, n 190). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (48 matcher: 45 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,076 / 1,076 / 1,087 / – |
| Folket streckar favoriten | ×1,11 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 35,4 % / 24,6 % / 23,0 % |
| Favoriter ≥ 55 %: höll / väntat | 46,2 % / 64,3 % (n 13) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 41,7 % | 44,6 % | 47,9 % | 0,87 |
| X | 35,4 % | 24,6 % | 23,0 % | 1,54 |
| 2 | 22,9 % | 30,8 % | 29,0 % | 0,79 |

- Folket streckar kryss 1,5 procentenheter under vår procent. Kryss ger streckvärde.

## Tabell nu (FotMob, 2026-09-28)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Sirius | 22 | 16 | 3 | 3 | 52-28 | 24 | 51 |
| 2 | Hammarby | 22 | 13 | 4 | 5 | 49-20 | 29 | 43 |
| 3 | Djurgarden | 22 | 13 | 2 | 7 | 47-21 | 26 | 41 |
| 4 | Elfsborg | 22 | 10 | 7 | 5 | 31-22 | 9 | 37 |
| 5 | Hacken | 22 | 9 | 9 | 4 | 39-30 | 9 | 36 |
| 6 | Vasteras SK | 22 | 10 | 5 | 7 | 34-35 | -1 | 35 |
| 7 | Malmo FF | 22 | 10 | 3 | 9 | 37-33 | 4 | 33 |
| 8 | AIK | 22 | 9 | 6 | 7 | 31-34 | -3 | 33 |
| 9 | Goteborg | 22 | 9 | 5 | 8 | 31-41 | -10 | 32 |
| 10 | GAIS | 22 | 8 | 6 | 8 | 28-20 | 8 | 30 |
| 11 | Brommapojkarna | 22 | 7 | 6 | 9 | 30-36 | -6 | 27 |
| 12 | Mjallby | 22 | 5 | 7 | 10 | 27-38 | -11 | 22 |
| 13 | Kalmar | 22 | 5 | 4 | 13 | 21-36 | -15 | 19 |
| 14 | Degerfors | 22 | 5 | 4 | 13 | 19-34 | -15 | 19 |
| 15 | Orgryte | 22 | 3 | 6 | 13 | 25-49 | -24 | 15 |
| 16 | Halmstad | 22 | 3 | 5 | 14 | 16-40 | -24 | 14 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/AS.json`.

## Lagfiler

- [AIK](../lag/AS/aik.md)
- [Brommapojkarna](../lag/AS/brommapojkarna.md)
- [Degerfors](../lag/AS/degerfors.md)
- [Djurgarden](../lag/AS/djurgarden.md)
- [Elfsborg](../lag/AS/elfsborg.md)
- [GAIS](../lag/AS/gais.md)
- [Goteborg](../lag/AS/goteborg.md)
- [Hacken](../lag/AS/hacken.md)
- [Halmstad](../lag/AS/halmstad.md)
- [Hammarby](../lag/AS/hammarby.md)
- [Kalmar](../lag/AS/kalmar.md)
- [Malmo FF](../lag/AS/malmo-ff.md)
- [Mjallby](../lag/AS/mjallby.md)
- [Orgryte](../lag/AS/orgryte.md)
- [Sirius](../lag/AS/sirius.md)
- [Vasteras SK](../lag/AS/vasteras-sk.md)
