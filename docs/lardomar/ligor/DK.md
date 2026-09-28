# Superligaen (DK) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/DK.md`.

Underlag: 3006 matcher, säsong 2012/13 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- **Inbördes möten, poängskillnad:** marknaden underskattar historiken Effekt +0,202 poäng för hemmalaget mellan stark och svag signal (z 3,2). Använd som justering.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,0 % | 42,5 % |
| Kryss | 26,1 % | 25,7 % |
| Bortavinst | 30,9 % | 31,8 % |
| Mål per match | 2,80 | |
| Över 2,5 mål | 53,6 % | |
| Båda lagen gör mål | 55,9 % | |
| Logloss stängning | 1,0097 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1076 | 29,3 % | 28,1 % | +1,1 pe (0,8) | ingen effekt |
| mellan | 1106 | 26,9 % | 26,5 % | +0,4 pe (0,3) | ingen effekt |
| klar favorit (> 35 %) | 824 | 21,0 % | 21,6 % | −0,6 pe (−0,4) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1245 | 39,4 % | 40,3 % | −0,9 pe (−0,6) | ingen effekt |
| 45–55 % | 921 | 50,7 % | 49,4 % | +1,3 pe (0,8) | ingen effekt |
| 55–65 % | 562 | 60,9 % | 59,2 % | +1,6 pe (0,8) | ingen effekt |
| 65–75 % | 229 | 69,9 % | 69,0 % | +0,8 pe (0,3) | ingen effekt |
| 75–100 % | 49 | 85,7 % | 77,3 % | +8,4 pe (1,7) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | +0,011 (z 0,3, n 2931) | +0,010 (z 0,2, n 2310) | +0,015 (z 0,2, n 621) | – | – | +0,017 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,105 (z 1,9, n 2488) | +0,078 (z 1,2, n 1913) | +0,241 (z 1,7, n 575) | – | – | +0,110 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,068 (z 3,2, n 2488) | +0,060 (z 2,5, n 1913) | +0,092 (z 2,1, n 575) | – | – | +0,202 p | **bekräftad** |
| Inbördes möten, kryss mot förväntat | −0,015 (z −0,3, n 2488) | +0,004 (z 0,1, n 1913) | −0,105 (z −0,8, n 575) | – | – | −0,005 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,030 (z −1,8, n 2807) | −0,028 (z −1,5, n 2219) | −0,037 (z −1,1, n 588) | – | – | −0,121 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,003 (z −0,1, n 467) | −0,002 (z −0,0, n 349) | −0,007 (z −0,1, n 118) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,039 (z 0,6, n 330) | +0,056 (z 0,7, n 259) | −0,021 (z −0,1, n 71) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,001 (z 0,0, n 330) | +0,009 (z 0,3, n 259) | −0,028 (z −0,6, n 71) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,002 (z 0,0, n 232) | +0,086 (z 0,9, n 160) | −0,185 (z −1,4, n 72) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,007 (z −0,1, n 73) | +0,067 (z 0,4, n 56) | – | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,18 (z −1,9, n 137). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,07 (z 0,7, n 137). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (9 matcher: 9 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,313 / 1,313 / 1,410 / – |
| Folket streckar favoriten | ×1,13 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 33,3 % / 24,4 % / 22,4 % |
| Favoriter ≥ 55 %: höll / väntat | 0,0 % / 61,1 % (n 3) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 33,3 % | 44,0 % | 47,8 % | 0,70 |
| X | 33,3 % | 24,4 % | 22,4 % | 1,49 |
| 2 | 33,3 % | 31,7 % | 29,8 % | 1,12 |

- Folket överstreckar favoriter (×1,13). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 1,9 procentenheter under vår procent. Kryss ger streckvärde.
- Bara 9 matcher: se det som indikation, inte regel.

## Lagfiler

- [Aarhus](../lag/DK/aarhus.md)
- [Brondby](../lag/DK/brondby.md)
- [FC Copenhagen](../lag/DK/fc-copenhagen.md)
- [Horsens](../lag/DK/horsens.md)
- [Lyngby](../lag/DK/lyngby.md)
- [Midtjylland](../lag/DK/midtjylland.md)
- [Nordsjaelland](../lag/DK/nordsjaelland.md)
- [Odense](../lag/DK/odense.md)
- [Randers FC](../lag/DK/randers-fc.md)
- [Silkeborg](../lag/DK/silkeborg.md)
- [Sonderjyske](../lag/DK/sonderjyske.md)
- [Viborg](../lag/DK/viborg.md)
