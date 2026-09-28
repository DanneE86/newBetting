# Liga Profesional (AR) – lärdomar

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/AR.md`.

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

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,040 (z −1,6, n 6212) | −0,035 (z −1,1, n 4451) | −0,054 (z −1,1, n 1761) | – | – | −0,063 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,027 (z 0,7, n 4239) | +0,023 (z 0,5, n 2775) | +0,038 (z 0,6, n 1464) | – | – | +0,035 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,001 (z 0,1, n 4239) | +0,006 (z 0,3, n 2775) | −0,010 (z −0,3, n 1464) | – | – | +0,003 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,049 (z 1,4, n 4239) | +0,065 (z 1,6, n 2775) | +0,001 (z 0,0, n 1464) | – | – | +0,027 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,019 (z −2,3, n 6011) | −0,013 (z −1,3, n 4320) | −0,035 (z −2,3, n 1691) | – | – | −0,076 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | +0,011 (z 0,3, n 1047) | −0,001 (z −0,0, n 828) | +0,056 (z 0,7, n 219) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,049 (z −0,9, n 581) | −0,042 (z −0,7, n 414) | −0,064 (z −0,7, n 167) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | +0,002 (z 0,1, n 581) | −0,010 (z −0,5, n 414) | +0,031 (z 0,8, n 167) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,036 (z −0,5, n 350) | +0,042 (z 0,6, n 292) | −0,426 (z −2,9, n 58) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,193 (z 3,0, n 384) | +0,146 (z 1,9, n 273) | +0,307 (z 2,7, n 111) | svag signal (inte bekräftad) |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,02 (z 0,4, n 317). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning 0,05 (z 0,9, n 317). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

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
