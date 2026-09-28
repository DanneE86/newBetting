# Brasileirão Série A (BR) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/BR.md`.

Underlag: 5596 matcher, säsong 2012 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 48,4 % | 46,9 % |
| Kryss | 26,9 % | 27,3 % |
| Bortavinst | 24,7 % | 25,8 % |
| Mål per match | 2,40 | |
| Över 2,5 mål | 43,7 % | |
| Båda lagen gör mål | 48,3 % | |
| Logloss stängning | 0,9983 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1744 | 29,9 % | 30,3 % | −0,4 pe (−0,3) | ingen effekt |
| mellan | 1939 | 29,2 % | 28,7 % | +0,6 pe (0,5) | ingen effekt |
| klar favorit (> 35 %) | 1913 | 21,7 % | 23,2 % | −1,5 pe (−1,6) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2213 | 40,6 % | 39,7 % | +0,9 pe (0,9) | ingen effekt |
| 45–55 % | 1594 | 52,2 % | 49,7 % | +2,5 pe (2,0) | ingen effekt |
| 55–65 % | 1186 | 60,8 % | 59,4 % | +1,4 pe (1,0) | ingen effekt |
| 65–75 % | 515 | 68,9 % | 69,1 % | −0,1 pe (−0,1) | ingen effekt |
| 75–100 % | 87 | 85,1 % | 78,4 % | +6,7 pe (1,7) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,009 (z −0,3, n 5458) | −0,030 (z −0,9, n 4171) | +0,053 (z 0,9, n 1287) | – | – | −0,013 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,042 (z −1,0, n 3962) | −0,067 (z −1,4, n 2828) | +0,047 (z 0,5, n 1134) | – | – | −0,049 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,008 (z −0,5, n 3962) | −0,023 (z −1,1, n 2828) | +0,034 (z 1,0, n 1134) | – | – | −0,024 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,027 (z 0,7, n 3962) | +0,064 (z 1,4, n 2828) | −0,093 (z −1,1, n 1134) | – | – | +0,013 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,010 (z −1,0, n 5390) | −0,005 (z −0,4, n 4148) | −0,020 (z −1,2, n 1242) | – | – | −0,020 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,083 (z 1,8, n 734) | +0,086 (z 1,7, n 590) | +0,070 (z 0,7, n 144) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,052 (z 1,0, n 591) | +0,083 (z 1,4, n 435) | −0,035 (z −0,4, n 156) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,005 (z −0,3, n 591) | +0,004 (z 0,2, n 435) | −0,031 (z −0,9, n 156) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,066 (z −1,2, n 470) | −0,067 (z −1,1, n 370) | −0,062 (z −0,5, n 100) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,103 (z 1,3, n 244) | +0,045 (z 0,5, n 158) | +0,210 (z 1,6, n 86) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,10 (z −1,4, n 224). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,04 (z −0,7, n 224). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Lagfiler

- [Athletico-PR](../lag/BR/athletico-pr.md)
- [Atletico-MG](../lag/BR/atletico-mg.md)
- [Bahia](../lag/BR/bahia.md)
- [Botafogo RJ](../lag/BR/botafogo-rj.md)
- [Bragantino](../lag/BR/bragantino.md)
- [Chapecoense-SC](../lag/BR/chapecoense-sc.md)
- [Corinthians](../lag/BR/corinthians.md)
- [Coritiba](../lag/BR/coritiba.md)
- [Cruzeiro](../lag/BR/cruzeiro.md)
- [Flamengo RJ](../lag/BR/flamengo-rj.md)
- [Fluminense](../lag/BR/fluminense.md)
- [Gremio](../lag/BR/gremio.md)
- [Internacional](../lag/BR/internacional.md)
- [Mirassol](../lag/BR/mirassol.md)
- [Palmeiras](../lag/BR/palmeiras.md)
- [Remo](../lag/BR/remo.md)
- [Santos](../lag/BR/santos.md)
- [Sao Paulo](../lag/BR/sao-paulo.md)
- [Vasco](../lag/BR/vasco.md)
- [Vitoria](../lag/BR/vitoria.md)
