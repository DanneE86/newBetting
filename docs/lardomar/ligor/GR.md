# Super League (Grekland) (GR) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/GR.md`.

Underlag: 2183 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 2163 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 42,8 % | 44,4 % |
| Kryss | 27,0 % | 26,1 % |
| Bortavinst | 30,2 % | 29,4 % |
| Mål per match | 2,42 | |
| Över 2,5 mål | 44,8 % | |
| Båda lagen gör mål | 44,6 % | |
| Logloss stängning / öppning | 0,9278 / 0,9357 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 546 | 34,2 % | 32,2 % | +2,1 pe (1,0) | ingen effekt |
| mellan | 649 | 35,0 % | 29,8 % | +5,2 pe (2,8) | svag signal (inte bekräftad) |
| klar favorit (> 35 %) | 988 | 17,7 % | 20,4 % | −2,7 pe (−2,3) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 731 | 35,4 % | 39,4 % | −4,0 pe (−2,3) | ingen effekt |
| 45–55 % | 510 | 43,9 % | 49,6 % | −5,7 pe (−2,6) | svag signal (inte bekräftad) |
| 55–65 % | 345 | 63,5 % | 59,6 % | +3,9 pe (1,5) | ingen effekt |
| 65–75 % | 321 | 75,1 % | 69,8 % | +5,3 pe (2,2) | ingen effekt |
| 75–100 % | 264 | 86,7 % | 81,1 % | +5,7 pe (2,8) | svag signal (inte bekräftad) |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | +0,031 (z 0,8, n 2099) | +0,054 (z 1,1, n 1379) | −0,018 (z −0,2, n 720) | +0,021 (z 0,5, n 2080) | −0,014 (z −3,4, n 2080) | +0,048 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | −0,041 (z −1,4, n 2099) | −0,059 (z −1,6, n 1379) | −0,011 (z −0,2, n 720) | −0,034 (z −1,1, n 2080) | +0,008 (z 2,6, n 2080) | −0,085 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,009 (z −0,2, n 2099) | +0,019 (z 0,3, n 1379) | −0,061 (z −0,8, n 720) | −0,004 (z −0,1, n 2080) | +0,001 (z 0,3, n 2080) | −0,013 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,056 (z −0,8, n 1548) | −0,074 (z −0,9, n 932) | −0,015 (z −0,1, n 616) | −0,071 (z −1,1, n 1547) | −0,012 (z −1,8, n 1547) | −0,057 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,030 (z 1,6, n 1548) | +0,031 (z 1,3, n 932) | +0,029 (z 0,9, n 616) | +0,029 (z 1,5, n 1547) | −0,000 (z −0,2, n 1547) | +0,123 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,039 (z 0,6, n 1548) | +0,045 (z 0,6, n 932) | +0,026 (z 0,2, n 616) | – | – | +0,017 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | +0,009 (z 0,5, n 2089) | +0,017 (z 0,8, n 1377) | −0,013 (z −0,4, n 712) | +0,010 (z 0,5, n 2069) | −0,003 (z −1,5, n 2069) | +0,018 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,077 (z −1,3, n 356) | −0,071 (z −0,9, n 218) | −0,087 (z −1,0, n 138) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,184 (z −2,6, n 257) | −0,226 (z −2,7, n 174) | −0,095 (z −0,7, n 83) | svag signal (inte bekräftad) |
| Sista 4 omgångarna (kryss mot förväntat) | +0,029 (z 1,1, n 257) | +0,059 (z 1,7, n 174) | −0,034 (z −0,8, n 83) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,045 (z −0,5, n 132) | −0,111 (z −0,8, n 68) | +0,025 (z 0,2, n 64) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,015 (z 0,1, n 42) | −0,147 (z −0,8, n 32) | – | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,08 (z 0,7, n 101). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,05 (z 0,5, n 101). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Lagfiler

- [AEK](../lag/GR/aek.md)
- [Aris](../lag/GR/aris.md)
- [Asteras Tripolis](../lag/GR/asteras-tripolis.md)
- [Atromitos](../lag/GR/atromitos.md)
- [Iraklis](../lag/GR/iraklis.md)
- [Kalamata](../lag/GR/kalamata.md)
- [Kifisia](../lag/GR/kifisia.md)
- [Levadeiakos](../lag/GR/levadeiakos.md)
- [OFI Crete](../lag/GR/ofi-crete.md)
- [Olympiakos](../lag/GR/olympiakos.md)
- [Panathinaikos](../lag/GR/panathinaikos.md)
- [Panetolikos](../lag/GR/panetolikos.md)
- [PAOK](../lag/GR/paok.md)
- [Volos NFC](../lag/GR/volos-nfc.md)
