# Liga MX (MX) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/MX.md`.

Underlag: 4731 matcher, säsong 2012/13 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Form mot marknaden (poäng − förväntat, senaste 8): svag signal (z −2,9) som inte håller i både träning och kontroll. Använd inte.
- Inbördes möten mot marknaden (≥ 3 möten, 8 år): svag signal (z −3,4) som inte håller i både träning och kontroll. Använd inte.

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,6 % | 44,5 % |
| Kryss | 27,1 % | 26,8 % |
| Bortavinst | 28,3 % | 28,7 % |
| Mål per match | 2,67 | |
| Över 2,5 mål | 50,4 % | |
| Båda lagen gör mål | 55,1 % | |
| Logloss stängning | 1,0219 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1792 | 29,0 % | 29,1 % | −0,1 pe (−0,1) | ingen effekt |
| mellan | 1791 | 28,0 % | 27,3 % | +0,7 pe (0,7) | ingen effekt |
| klar favorit (> 35 %) | 1148 | 22,7 % | 22,3 % | +0,4 pe (0,3) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2159 | 39,7 % | 40,0 % | −0,3 pe (−0,3) | ingen effekt |
| 45–55 % | 1430 | 51,0 % | 49,5 % | +1,5 pe (1,1) | ingen effekt |
| 55–65 % | 817 | 59,6 % | 59,5 % | +0,1 pe (0,1) | ingen effekt |
| 65–75 % | 282 | 70,9 % | 68,7 % | +2,2 pe (0,8) | ingen effekt |
| 75–100 % | 40 | 80,0 % | 77,6 % | +2,4 pe (0,4) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,055 | −0,031 | +0,022 | −0,0004 (z −0,7, n 1092) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,088 (z −2,9, n 4651) | −0,110 (z −3,1, n 3559) | −0,016 (z −0,3, n 1092) | – | – | −0,134 p | svag signal (inte bekräftad) |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,176 (z −3,4, n 3937) | −0,226 (z −3,9, n 2854) | +0,048 (z 0,4, n 1083) | – | – | −0,160 p | svag signal (inte bekräftad) |
| Inbördes möten, poängskillnad | −0,044 (z −2,0, n 3937) | −0,072 (z −2,9, n 2854) | +0,036 (z 0,9, n 1083) | – | – | −0,098 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | −0,030 (z −0,7, n 3937) | −0,029 (z −0,6, n 2854) | −0,042 (z −0,3, n 1083) | – | – | −0,012 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,021 (z −1,9, n 4445) | −0,018 (z −1,4, n 3436) | −0,029 (z −1,4, n 1009) | – | – | −0,042 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,080 (z −0,1, n 4437) | −0,089 (z −0,1, n 3626) | −0,356 (z −0,3, n 811) | – | – | −0,006 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,045 (z −0,9, n 663) | −0,049 (z −0,9, n 490) | −0,032 (z −0,3, n 173) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,153 (z −1,6, n 184) | −0,103 (z −1,0, n 153) | −0,404 (z −1,8, n 31) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,039 (z −1,3, n 184) | −0,039 (z −1,1, n 153) | −0,037 (z −0,5, n 31) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,082 (z −0,6, n 89) | −0,092 (z −0,7, n 80) | – | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,223 (z 2,6, n 189) | +0,191 (z 1,8, n 133) | +0,300 (z 1,9, n 56) | svag signal (inte bekräftad) |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,09 (z 1,3, n 227). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,02 (z 0,3, n 227). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-09-28)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Toluca | 10 | 6 | 2 | 2 | 23-12 | 11 | 20 |
| 2 | Club America | 9 | 6 | 2 | 1 | 21-10 | 11 | 20 |
| 3 | Guadalajara Chivas | 10 | 5 | 3 | 2 | 17-10 | 7 | 18 |
| 4 | Queretaro | 9 | 5 | 2 | 2 | 13-8 | 5 | 17 |
| 5 | Club Leon | 10 | 5 | 2 | 3 | 14-11 | 3 | 17 |
| 6 | Atlas | 10 | 5 | 2 | 3 | 16-17 | -1 | 17 |
| 7 | Cruz Azul | 10 | 5 | 1 | 4 | 19-18 | 1 | 16 |
| 8 | Club Tijuana | 9 | 4 | 2 | 3 | 14-13 | 1 | 14 |
| 9 | Puebla | 10 | 4 | 2 | 4 | 11-12 | -1 | 14 |
| 10 | Monterrey | 9 | 4 | 1 | 4 | 16-14 | 2 | 13 |
| 11 | Pachuca | 10 | 3 | 3 | 4 | 15-11 | 4 | 12 |
| 12 | UNAM Pumas | 10 | 3 | 3 | 4 | 14-16 | -2 | 12 |
| 13 | Atl. San Luis | 10 | 3 | 3 | 4 | 14-18 | -4 | 12 |
| 14 | Atlante | 10 | 2 | 5 | 3 | 12-15 | -3 | 11 |
| 15 | Tigres UANL | 10 | 2 | 4 | 4 | 10-13 | -3 | 10 |
| 16 | Santos Laguna | 10 | 3 | 1 | 6 | 10-15 | -5 | 10 |
| 17 | Necaxa | 10 | 2 | 2 | 6 | 12-20 | -8 | 8 |
| 18 | Juarez | 10 | 1 | 0 | 9 | 7-25 | -18 | 3 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/MX.json`.

## Lagfiler

- [Atl. San Luis](../lag/MX/atl-san-luis.md)
- [Atlante](../lag/MX/atlante.md)
- [Atlas](../lag/MX/atlas.md)
- [Club America](../lag/MX/club-america.md)
- [Club Leon](../lag/MX/club-leon.md)
- [Club Tijuana](../lag/MX/club-tijuana.md)
- [Cruz Azul](../lag/MX/cruz-azul.md)
- [Guadalajara Chivas](../lag/MX/guadalajara-chivas.md)
- [Juarez](../lag/MX/juarez.md)
- [Monterrey](../lag/MX/monterrey.md)
- [Necaxa](../lag/MX/necaxa.md)
- [Pachuca](../lag/MX/pachuca.md)
- [Puebla](../lag/MX/puebla.md)
- [Queretaro](../lag/MX/queretaro.md)
- [Santos Laguna](../lag/MX/santos-laguna.md)
- [Tigres UANL](../lag/MX/tigres-uanl.md)
- [Toluca](../lag/MX/toluca.md)
- [UNAM Pumas](../lag/MX/unam-pumas.md)
