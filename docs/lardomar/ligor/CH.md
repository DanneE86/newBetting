# Championship (CH) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/CH.md`.

Underlag: 5063 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 5063 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,0 % | 42,6 % |
| Kryss | 26,6 % | 27,3 % |
| Bortavinst | 30,4 % | 30,1 % |
| Mål per match | 2,55 | |
| Över 2,5 mål | 47,6 % | |
| Båda lagen gör mål | 51,3 % | |
| Logloss stängning / öppning | 1,0348 / 1,0362 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 2076 | 27,9 % | 29,4 % | −1,4 pe (−1,4) | ingen effekt |
| mellan | 1915 | 27,3 % | 27,6 % | −0,4 pe (−0,3) | ingen effekt |
| klar favorit (> 35 %) | 1072 | 22,8 % | 22,7 % | +0,0 pe (0,0) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2495 | 39,4 % | 39,9 % | −0,4 pe (−0,5) | ingen effekt |
| 45–55 % | 1543 | 49,3 % | 49,6 % | −0,3 pe (−0,3) | ingen effekt |
| 55–65 % | 744 | 59,4 % | 59,2 % | +0,2 pe (0,1) | ingen effekt |
| 65–75 % | 238 | 68,9 % | 69,1 % | −0,2 pe (−0,1) | ingen effekt |
| 75–100 % | 43 | 88,4 % | 78,3 % | +10,1 pe (2,0) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,037 (z −1,3, n 5003) | −0,016 (z −0,5, n 3252) | −0,078 (z −1,6, n 1751) | −0,045 (z −1,6, n 5003) | −0,008 (z −4,6, n 5003) | −0,060 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,035 (z 1,5, n 5003) | +0,014 (z 0,5, n 3252) | +0,072 (z 1,9, n 1751) | +0,042 (z 1,8, n 5003) | +0,007 (z 5,1, n 5003) | +0,069 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,026 (z −0,9, n 5003) | −0,016 (z −0,5, n 3252) | −0,045 (z −0,9, n 1751) | −0,030 (z −1,1, n 5003) | −0,004 (z −2,6, n 5003) | −0,042 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,014 (z 0,3, n 3025) | +0,009 (z 0,2, n 1642) | +0,025 (z 0,4, n 1383) | +0,019 (z 0,5, n 3025) | +0,005 (z 1,9, n 3025) | +0,020 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,011 (z 0,6, n 3025) | +0,008 (z 0,3, n 1642) | +0,017 (z 0,6, n 1383) | +0,014 (z 0,7, n 3025) | +0,003 (z 2,6, n 3025) | +0,034 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,002 (z −0,1, n 3025) | −0,041 (z −0,8, n 1642) | +0,070 (z 1,0, n 1383) | – | – | −0,001 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,003 (z −0,3, n 4929) | −0,001 (z −0,1, n 3226) | −0,008 (z −0,4, n 1703) | −0,004 (z −0,3, n 4929) | −0,001 (z −0,9, n 4929) | −0,006 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,017 (z −0,3, n 597) | +0,007 (z 0,1, n 357) | −0,052 (z −0,6, n 240) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,002 (z −0,0, n 415) | −0,002 (z −0,0, n 275) | −0,002 (z −0,0, n 140) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,015 (z −0,7, n 415) | −0,006 (z −0,3, n 275) | −0,032 (z −0,9, n 140) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,038 (z −0,5, n 240) | −0,044 (z −0,4, n 136) | −0,030 (z −0,2, n 104) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,047 (z 0,6, n 231) | +0,076 (z 0,7, n 132) | +0,008 (z 0,1, n 99) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,004 (z −0,0, n 223) | +0,022 (z 0,2, n 150) | −0,056 (z −0,4, n 73) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,17 (z −1,9, n 144). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,05 (z 0,6, n 144). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (237 matcher: 223 Stryktipset, 14 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,071 / 1,071 / 1,119 / 1,082 |
| Folket streckar favoriten | ×1,15 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 23,2 % / 27,1 % / 24,6 % |
| Favoriter ≥ 55 %: höll / väntat | 58,8 % / 60,5 % (n 34) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 43,0 % | 42,6 % | 46,4 % | 0,93 |
| X | 23,2 % | 27,1 % | 24,6 % | 0,94 |
| 2 | 33,8 % | 30,3 % | 29,0 % | 1,16 |

- Folket överstreckar favoriter (×1,15). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 2,5 procentenheter under vår procent. Kryss ger streckvärde.

## Lagfiler

- [Birmingham](../lag/CH/birmingham.md)
- [Blackburn](../lag/CH/blackburn.md)
- [Bolton](../lag/CH/bolton.md)
- [Bristol City](../lag/CH/bristol-city.md)
- [Burnley](../lag/CH/burnley.md)
- [Cardiff](../lag/CH/cardiff.md)
- [Charlton](../lag/CH/charlton.md)
- [Derby](../lag/CH/derby.md)
- [Lincoln](../lag/CH/lincoln.md)
- [Middlesbrough](../lag/CH/middlesbrough.md)
- [Millwall](../lag/CH/millwall.md)
- [Norwich](../lag/CH/norwich.md)
- [Portsmouth](../lag/CH/portsmouth.md)
- [Preston](../lag/CH/preston.md)
- [QPR](../lag/CH/qpr.md)
- [Sheffield United](../lag/CH/sheffield-united.md)
- [Southampton](../lag/CH/southampton.md)
- [Stoke](../lag/CH/stoke.md)
- [Swansea](../lag/CH/swansea.md)
- [Watford](../lag/CH/watford.md)
- [West Brom](../lag/CH/west-brom.md)
- [West Ham](../lag/CH/west-ham.md)
- [Wolves](../lag/CH/wolves.md)
- [Wrexham](../lag/CH/wrexham.md)
