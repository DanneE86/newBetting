# Serie B (SB) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/SB.md`.

Underlag: 3511 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 3503 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 41,2 % | 42,3 % |
| Kryss | 32,0 % | 29,6 % |
| Bortavinst | 26,8 % | 28,2 % |
| Mål per match | 2,50 | |
| Över 2,5 mål | 45,3 % | |
| Båda lagen gör mål | 53,7 % | |
| Logloss stängning / öppning | 1,0402 / 1,0458 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1503 | 35,7 % | 31,4 % | +4,3 pe (3,5) | svag signal (inte bekräftad) |
| mellan | 1432 | 32,5 % | 29,6 % | +2,9 pe (2,4) | ingen effekt |
| klar favorit (> 35 %) | 576 | 21,2 % | 24,7 % | −3,5 pe (−2,0) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1948 | 39,3 % | 39,3 % | −0,1 pe (−0,1) | ingen effekt |
| 45–55 % | 1051 | 48,2 % | 49,3 % | −1,0 pe (−0,7) | ingen effekt |
| 55–65 % | 420 | 63,1 % | 59,0 % | +4,1 pe (1,8) | ingen effekt |
| 65–75 % | 76 | 78,9 % | 68,2 % | +10,7 pe (2,3) | ingen effekt |
| 75–100 % | 7 | 85,7 % | 79,6 % | – | för lite data |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,030 (z −0,9, n 3348) | −0,065 (z −1,5, n 2187) | +0,026 (z 0,5, n 1161) | −0,042 (z −1,2, n 3341) | −0,011 (z −4,0, n 3341) | −0,046 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,001 (z 0,0, n 3348) | +0,026 (z 0,7, n 2187) | −0,044 (z −0,9, n 1161) | +0,007 (z 0,3, n 3341) | +0,006 (z 2,5, n 3341) | +0,001 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,039 (z −1,1, n 3349) | −0,058 (z −1,3, n 2188) | −0,006 (z −0,1, n 1161) | −0,042 (z −1,2, n 3342) | −0,001 (z −0,3, n 3342) | −0,060 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,038 (z 0,7, n 1305) | +0,003 (z 0,0, n 727) | +0,101 (z 1,1, n 578) | +0,037 (z 0,6, n 1300) | +0,003 (z 0,7, n 1300) | +0,056 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,018 (z 0,7, n 1305) | +0,007 (z 0,2, n 727) | +0,040 (z 0,9, n 578) | +0,018 (z 0,7, n 1300) | +0,002 (z 1,0, n 1300) | +0,059 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,020 (z −0,4, n 1305) | +0,011 (z 0,2, n 727) | −0,078 (z −0,9, n 578) | – | – | −0,013 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,009 (z 0,5, n 3390) | +0,006 (z 0,4, n 2242) | +0,022 (z 0,5, n 1148) | +0,009 (z 0,6, n 3383) | +0,001 (z 0,5, n 3383) | +0,017 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,014 (z 0,3, n 493) | +0,030 (z 0,4, n 298) | −0,010 (z −0,1, n 195) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,076 (z 1,2, n 355) | +0,014 (z 0,2, n 235) | +0,196 (z 1,9, n 120) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,008 (z 0,3, n 355) | +0,001 (z 0,0, n 235) | +0,022 (z 0,5, n 120) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,051 (z −0,7, n 298) | −0,076 (z −0,8, n 184) | −0,011 (z −0,1, n 114) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,116 (z −1,5, n 233) | −0,049 (z −0,5, n 134) | −0,207 (z −1,6, n 99) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,066 (z 0,5, n 79) | +0,081 (z 0,6, n 65) | – | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,10 (z −0,7, n 102). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,01 (z −0,1, n 102). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Lagfiler

- [Arezzo](../lag/SB/arezzo.md)
- [Ascoli](../lag/SB/ascoli.md)
- [Avellino](../lag/SB/avellino.md)
- [Benevento](../lag/SB/benevento.md)
- [Carrarese](../lag/SB/carrarese.md)
- [Catanzaro](../lag/SB/catanzaro.md)
- [Cesena](../lag/SB/cesena.md)
- [Cremonese](../lag/SB/cremonese.md)
- [Empoli](../lag/SB/empoli.md)
- [Juve Stabia](../lag/SB/juve-stabia.md)
- [Mantova](../lag/SB/mantova.md)
- [Modena](../lag/SB/modena.md)
- [Padova](../lag/SB/padova.md)
- [Palermo](../lag/SB/palermo.md)
- [Pisa](../lag/SB/pisa.md)
- [Sampdoria](../lag/SB/sampdoria.md)
- [Sudtirol](../lag/SB/sudtirol.md)
- [Verona](../lag/SB/verona.md)
- [Vicenza](../lag/SB/vicenza.md)
- [Virtus Entella](../lag/SB/virtus-entella.md)
