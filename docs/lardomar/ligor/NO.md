# Eliteserien (NO) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/NO.md`.

Underlag: 3550 matcher, säsong 2012 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 47,3 % | 47,0 % |
| Kryss | 24,0 % | 24,4 % |
| Bortavinst | 28,7 % | 28,7 % |
| Mål per match | 3,00 | |
| Över 2,5 mål | 57,9 % | |
| Båda lagen gör mål | 58,1 % | |
| Logloss stängning | 0,9825 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1095 | 26,8 % | 27,4 % | −0,5 pe (−0,4) | ingen effekt |
| mellan | 1210 | 26,9 % | 25,8 % | +1,1 pe (0,9) | ingen effekt |
| klar favorit (> 35 %) | 1245 | 18,6 % | 20,3 % | −1,7 pe (−1,5) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 1215 | 40,5 % | 40,5 % | +0,0 pe (0,0) | ingen effekt |
| 45–55 % | 1065 | 51,1 % | 49,7 % | +1,4 pe (0,9) | ingen effekt |
| 55–65 % | 737 | 59,3 % | 59,6 % | −0,3 pe (−0,2) | ingen effekt |
| 65–75 % | 399 | 72,7 % | 69,3 % | +3,4 pe (1,5) | ingen effekt |
| 75–100 % | 134 | 83,6 % | 79,4 % | +4,2 pe (1,3) | ingen effekt |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | +0,020 (z 0,6, n 3444) | +0,022 (z 0,6, n 2658) | +0,012 (z 0,2, n 786) | – | – | +0,031 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,047 (z 0,9, n 2609) | −0,011 (z −0,2, n 1990) | +0,293 (z 2,4, n 619) | – | – | +0,055 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,027 (z 1,3, n 2609) | +0,016 (z 0,7, n 1990) | +0,069 (z 1,6, n 619) | – | – | +0,082 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,004 (z 0,1, n 2609) | +0,027 (z 0,5, n 1990) | −0,088 (z −0,8, n 619) | – | – | +0,002 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,005 (z 0,4, n 3385) | +0,004 (z 0,3, n 2620) | +0,006 (z 0,3, n 765) | – | – | +0,010 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,028 (z 0,5, n 576) | +0,066 (z 1,2, n 464) | −0,132 (z −1,1, n 112) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,056 (z 0,9, n 452) | +0,031 (z 0,5, n 332) | +0,124 (z 1,1, n 120) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,031 (z −1,7, n 452) | −0,018 (z −0,8, n 332) | −0,068 (z −2,1, n 120) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,004 (z −0,1, n 291) | −0,045 (z −0,5, n 217) | +0,114 (z 0,8, n 74) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | −0,080 (z −0,7, n 136) | −0,007 (z −0,1, n 86) | −0,205 (z −1,2, n 50) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,11 (z 1,4, n 189). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,07 (z −1,0, n 189). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Lagfiler

- [Aalesund](../lag/NO/aalesund.md)
- [Bodo/Glimt](../lag/NO/bodo-glimt.md)
- [Brann](../lag/NO/brann.md)
- [Fredrikstad](../lag/NO/fredrikstad.md)
- [HamKam](../lag/NO/hamkam.md)
- [KFUM Oslo](../lag/NO/kfum-oslo.md)
- [Kristiansund](../lag/NO/kristiansund.md)
- [Lillestrom](../lag/NO/lillestrom.md)
- [Molde](../lag/NO/molde.md)
- [Rosenborg](../lag/NO/rosenborg.md)
- [Sandefjord](../lag/NO/sandefjord.md)
- [Sarpsborg 08](../lag/NO/sarpsborg-08.md)
- [Start](../lag/NO/start.md)
- [Tromso](../lag/NO/tromso.md)
- [Valerenga](../lag/NO/valerenga.md)
- [Viking](../lag/NO/viking.md)
