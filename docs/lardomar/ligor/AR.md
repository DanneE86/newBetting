# Liga Profesional (AR) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/AR.md`.

Underlag: 6384 matcher, säsong 2012/13 – 2026. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 43,1 % | 42,6 % |
| Kryss | 30,2 % | 29,7 % |
| Bortavinst | 26,7 % | 27,6 % |
| Mål per match | 2,23 | |
| Över 2,5 mål | 38,9 % | |
| Båda lagen gör mål | 44,7 % | |
| Logloss stängning | 1,0393 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 2497 | 33,0 % | 32,0 % | +1,1 pe (1,1) | ingen effekt |
| mellan | 2569 | 30,0 % | 30,1 % | −0,2 pe (−0,2) | ingen effekt |
| klar favorit (> 35 %) | 1318 | 25,3 % | 24,7 % | +0,6 pe (0,5) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 3356 | 37,9 % | 39,3 % | −1,5 pe (−1,7) | ingen effekt |
| 45–55 % | 1875 | 51,5 % | 49,4 % | +2,1 pe (1,8) | ingen effekt |
| 55–65 % | 833 | 56,8 % | 59,1 % | −2,3 pe (−1,3) | ingen effekt |
| 65–75 % | 237 | 67,9 % | 68,7 % | −0,8 pe (−0,3) | ingen effekt |
| 75–100 % | 48 | 85,4 % | 78,5 % | +6,9 pe (1,3) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,025 | +0,030 | +0,030 | 0,0000 (z −0,0, n 1781) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,040 (z −1,5, n 6217) | −0,035 (z −1,1, n 4456) | −0,054 (z −1,1, n 1761) | – | – | −0,063 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,023 (z 0,6, n 4299) | +0,019 (z 0,4, n 2816) | +0,033 (z 0,5, n 1483) | – | – | +0,030 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,001 (z −0,1, n 4299) | +0,004 (z 0,2, n 2816) | −0,014 (z −0,5, n 1483) | – | – | −0,003 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,051 (z 1,4, n 4299) | +0,065 (z 1,6, n 2816) | +0,009 (z 0,1, n 1483) | – | – | +0,028 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,019 (z −2,3, n 6012) | −0,013 (z −1,3, n 4321) | −0,035 (z −2,3, n 1691) | – | – | −0,076 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,244 (z −0,5, n 5927) | −0,268 (z −0,5, n 4596) | −0,158 (z −0,1, n 1331) | – | – | −0,019 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,011 (z 0,3, n 1047) | −0,001 (z −0,0, n 828) | +0,056 (z 0,7, n 219) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,055 (z −1,1, n 584) | −0,051 (z −0,8, n 417) | −0,064 (z −0,7, n 167) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,002 (z 0,1, n 584) | −0,010 (z −0,4, n 417) | +0,031 (z 0,8, n 167) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,031 (z −0,5, n 340) | +0,050 (z 0,7, n 282) | −0,426 (z −2,9, n 58) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,193 (z 3,0, n 384) | +0,146 (z 1,9, n 273) | +0,307 (z 2,7, n 111) | svag signal (inte bekräftad) |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,02 (z 0,3, n 317). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,05 (z 0,9, n 317). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-10-04)

**Clausura Group A**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Instituto | 11 | 8 | 1 | 2 | 17-8 | 9 | 25 |
| 2 | Defensa y Justicia | 11 | 6 | 3 | 2 | 16-11 | 5 | 21 |
| 3 | Boca Juniors | 11 | 5 | 5 | 1 | 17-11 | 6 | 20 |
| 4 | Velez Sarsfield | 10 | 5 | 5 | 0 | 15-9 | 6 | 20 |
| 5 | Gimnasia Mendoza | 10 | 5 | 2 | 3 | 14-9 | 5 | 17 |
| 6 | Lanus | 11 | 5 | 2 | 4 | 13-9 | 4 | 17 |
| 7 | Newells Old Boys | 11 | 4 | 5 | 2 | 11-8 | 3 | 17 |
| 8 | Independiente | 11 | 5 | 2 | 4 | 11-12 | -1 | 17 |
| 9 | Union de Santa Fe | 11 | 4 | 1 | 6 | 17-19 | -2 | 13 |
| 10 | San Lorenzo | 11 | 3 | 2 | 6 | 4-11 | -7 | 11 |
| 11 | Estudiantes L.P. | 10 | 3 | 1 | 6 | 10-11 | -1 | 10 |
| 12 | Dep. Riestra | 10 | 2 | 4 | 4 | 8-10 | -2 | 10 |
| 13 | Platense | 10 | 2 | 3 | 5 | 9-15 | -6 | 9 |
| 14 | Talleres Cordoba | 10 | 2 | 2 | 6 | 11-17 | -6 | 8 |
| 15 | Central Cordoba | 10 | 2 | 2 | 6 | 7-13 | -6 | 8 |

**Clausura Group B**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Argentinos Jrs | 10 | 5 | 3 | 2 | 13-9 | 4 | 18 |
| 2 | Rosario Central | 10 | 5 | 3 | 2 | 11-8 | 3 | 18 |
| 3 | Ind. Rivadavia | 11 | 5 | 3 | 3 | 15-14 | 1 | 18 |
| 4 | Gimnasia L.P. | 11 | 5 | 3 | 3 | 16-16 | 0 | 18 |
| 5 | Belgrano | 10 | 4 | 4 | 2 | 11-7 | 4 | 16 |
| 6 | Huracan | 10 | 4 | 4 | 2 | 10-8 | 2 | 16 |
| 7 | Sarmiento Junin | 10 | 5 | 1 | 4 | 17-16 | 1 | 16 |
| 8 | Barracas Central | 11 | 4 | 3 | 4 | 8-9 | -1 | 15 |
| 9 | River Plate | 10 | 4 | 1 | 5 | 13-12 | 1 | 13 |
| 10 | Atl. Tucuman | 11 | 3 | 4 | 4 | 9-9 | 0 | 13 |
| 11 | Tigre | 10 | 3 | 3 | 4 | 9-9 | 0 | 12 |
| 12 | Banfield | 10 | 2 | 3 | 5 | 11-16 | -5 | 9 |
| 13 | Aldosivi | 10 | 2 | 2 | 6 | 12-16 | -4 | 8 |
| 14 | Racing Club | 10 | 2 | 2 | 6 | 11-16 | -5 | 8 |
| 15 | Estudiantes Rio Cuarto | 10 | 1 | 3 | 6 | 5-13 | -8 | 6 |

**Apertura Group A**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Estudiantes L.P. | 16 | 9 | 4 | 3 | 19-7 | 12 | 31 |
| 2 | Boca Juniors | 16 | 8 | 6 | 2 | 22-9 | 13 | 30 |
| 3 | Velez Sarsfield | 16 | 7 | 7 | 2 | 18-12 | 6 | 28 |
| 4 | Talleres Cordoba | 16 | 7 | 5 | 4 | 17-13 | 4 | 26 |
| 5 | Independiente | 16 | 6 | 6 | 4 | 24-20 | 4 | 24 |
| 6 | Lanus | 16 | 6 | 6 | 4 | 18-15 | 3 | 24 |
| 7 | San Lorenzo | 16 | 5 | 7 | 4 | 14-14 | 0 | 22 |
| 8 | Union de Santa Fe | 16 | 5 | 6 | 5 | 24-20 | 4 | 21 |
| 9 | Instituto | 16 | 6 | 3 | 7 | 17-17 | 0 | 21 |
| 10 | Defensa y Justicia | 16 | 4 | 7 | 5 | 18-21 | -3 | 19 |
| 11 | Gimnasia Mendoza | 16 | 5 | 4 | 7 | 14-22 | -8 | 19 |
| 12 | Platense | 16 | 3 | 7 | 6 | 10-15 | -5 | 16 |
| 13 | Central Cordoba | 16 | 4 | 4 | 8 | 11-21 | -10 | 16 |
| 14 | Newells Old Boys | 16 | 3 | 6 | 7 | 15-27 | -12 | 15 |
| 15 | Dep. Riestra | 16 | 1 | 8 | 7 | 5-12 | -7 | 11 |

**Apertura Group B**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Ind. Rivadavia | 16 | 10 | 4 | 2 | 29-15 | 14 | 34 |
| 2 | River Plate | 16 | 9 | 2 | 5 | 22-12 | 10 | 29 |
| 3 | Argentinos Jrs | 16 | 8 | 5 | 3 | 17-13 | 4 | 29 |
| 4 | Rosario Central | 16 | 8 | 4 | 4 | 20-16 | 4 | 28 |
| 5 | Belgrano | 16 | 7 | 5 | 4 | 17-13 | 4 | 26 |
| 6 | Gimnasia L.P. | 16 | 8 | 2 | 6 | 19-19 | 0 | 26 |
| 7 | Huracan | 16 | 5 | 7 | 4 | 17-13 | 4 | 22 |
| 8 | Racing Club | 16 | 5 | 6 | 5 | 17-15 | 2 | 21 |
| 9 | Barracas Central | 16 | 5 | 6 | 5 | 15-15 | 0 | 21 |
| 10 | Tigre | 16 | 4 | 8 | 4 | 18-15 | 3 | 20 |
| 11 | Sarmiento Junin | 16 | 6 | 1 | 9 | 13-20 | -7 | 19 |
| 12 | Banfield | 16 | 5 | 3 | 8 | 17-19 | -2 | 18 |
| 13 | Atl. Tucuman | 16 | 3 | 5 | 8 | 15-20 | -5 | 14 |
| 14 | Aldosivi | 16 | 0 | 8 | 8 | 6-19 | -13 | 8 |
| 15 | Estudiantes Rio Cuarto | 16 | 1 | 2 | 13 | 5-24 | -19 | 5 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/AR.json`.

## Lagfiler

- [Aldosivi](../lag/AR/aldosivi.md)
- [Argentinos Jrs](../lag/AR/argentinos-jrs.md)
- [Atl. Tucuman](../lag/AR/atl-tucuman.md)
- [Banfield](../lag/AR/banfield.md)
- [Barracas Central](../lag/AR/barracas-central.md)
- [Belgrano](../lag/AR/belgrano.md)
- [Boca Juniors](../lag/AR/boca-juniors.md)
- [Central Cordoba](../lag/AR/central-cordoba.md)
- [Defensa y Justicia](../lag/AR/defensa-y-justicia.md)
- [Dep. Riestra](../lag/AR/dep-riestra.md)
- [Estudiantes L.P.](../lag/AR/estudiantes-l-p.md)
- [Estudiantes Rio Cuarto](../lag/AR/estudiantes-rio-cuarto.md)
- [Gimnasia L.P.](../lag/AR/gimnasia-l-p.md)
- [Gimnasia Mendoza](../lag/AR/gimnasia-mendoza.md)
- [Huracan](../lag/AR/huracan.md)
- [Ind. Rivadavia](../lag/AR/ind-rivadavia.md)
- [Independiente](../lag/AR/independiente.md)
- [Instituto](../lag/AR/instituto.md)
- [Lanus](../lag/AR/lanus.md)
- [Newells Old Boys](../lag/AR/newells-old-boys.md)
- [Platense](../lag/AR/platense.md)
- [Racing Club](../lag/AR/racing-club.md)
- [River Plate](../lag/AR/river-plate.md)
- [Rosario Central](../lag/AR/rosario-central.md)
- [San Lorenzo](../lag/AR/san-lorenzo.md)
- [Sarmiento Junin](../lag/AR/sarmiento-junin.md)
- [Talleres Cordoba](../lag/AR/talleres-cordoba.md)
- [Tigre](../lag/AR/tigre.md)
- [Union de Santa Fe](../lag/AR/union-de-santa-fe.md)
- [Velez Sarsfield](../lag/AR/velez-sarsfield.md)
