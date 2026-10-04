# LaLiga 2 (LL2) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/LL2.md`.

Underlag: 4214 matcher, säsong 2017/18 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds finns för 4213 matcher. xG: skott-proxy (100 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 44,7 % | 43,4 % |
| Kryss | 29,8 % | 30,0 % |
| Bortavinst | 25,5 % | 26,6 % |
| Mål per match | 2,31 | |
| Över 2,5 mål | 41,0 % | |
| Båda lagen gör mål | 48,2 % | |
| Logloss stängning / öppning | 1,0329 / 1,0358 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 1661 | 33,0 % | 32,2 % | +0,8 pe (0,7) | ingen effekt |
| mellan | 1740 | 30,3 % | 30,1 % | +0,2 pe (0,2) | ingen effekt |
| klar favorit (> 35 %) | 813 | 22,1 % | 25,3 % | −3,1 pe (−2,2) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2182 | 39,8 % | 39,2 % | +0,7 pe (0,6) | ingen effekt |
| 45–55 % | 1304 | 50,7 % | 49,3 % | +1,3 pe (1,0) | ingen effekt |
| 55–65 % | 584 | 62,2 % | 58,8 % | +3,4 pe (1,7) | ingen effekt |
| 65–75 % | 97 | 73,2 % | 68,3 % | +4,9 pe (1,1) | ingen effekt |
| 75–100 % | 11 | 63,6 % | 78,3 % | – | för lite data |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| öppningsodds (Oddset, långt före avspark) | +0,042 | +0,064 | +0,081 | +0,0001 (z 0,1, n 1463) | ja |
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,062 | +0,052 | +0,063 | +0,0001 (z 0,1, n 1463) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,042 (z −1,3, n 4055) | −0,047 (z −1,2, n 2612) | −0,031 (z −0,6, n 1443) | −0,059 (z −1,8, n 4054) | −0,018 (z −6,6, n 4054) | −0,064 p | ingen effekt |
| xG-form mot målform (xGD − GD, senaste 8) | +0,047 (z 1,7, n 4055) | +0,053 (z 1,5, n 2612) | +0,036 (z 0,8, n 1443) | +0,058 (z 2,1, n 4054) | +0,012 (z 5,1, n 4054) | +0,085 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,058 (z −1,8, n 4055) | −0,066 (z −1,6, n 2612) | −0,044 (z −0,8, n 1443) | −0,064 (z −1,9, n 4054) | −0,007 (z −2,3, n 4054) | −0,085 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,001 (z 0,0, n 1888) | +0,073 (z 1,1, n 937) | −0,095 (z −1,2, n 951) | −0,006 (z −0,1, n 1888) | −0,006 (z −1,5, n 1888) | +0,001 p | ingen effekt |
| Inbördes möten, poängskillnad | −0,001 (z −0,0, n 1888) | +0,037 (z 1,1, n 937) | −0,048 (z −1,3, n 951) | −0,005 (z −0,2, n 1888) | −0,004 (z −2,1, n 1888) | −0,002 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,010 (z 0,2, n 1888) | +0,006 (z 0,1, n 937) | +0,013 (z 0,2, n 951) | – | – | +0,006 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,004 (z −0,3, n 4090) | +0,011 (z 0,7, n 2671) | −0,032 (z −1,4, n 1419) | −0,005 (z −0,4, n 4089) | −0,002 (z −1,4, n 4089) | −0,008 p | ingen effekt |
| Oddsrörelse öppning → stängning (förväntade poäng) | −0,067 (z −0,4, n 4213) | −0,062 (z −0,3, n 2750) | −0,070 (z −0,2, n 1463) | – | – | −0,017 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,307 (z −0,3, n 2966) | +0,083 (z 0,1, n 1846) | −0,764 (z −0,6, n 1120) | – | – | −0,018 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,149 (z 1,4, n 3310) | +0,214 (z 1,2, n 1848) | +0,037 (z 0,3, n 1462) | – | – | +0,027 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,020 (z −0,4, n 546) | +0,025 (z 0,3, n 326) | −0,085 (z −1,0, n 220) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | +0,180 (z 2,9, n 392) | +0,187 (z 2,4, n 260) | +0,167 (z 1,6, n 132) | svag signal (inte bekräftad) |
| Sista 4 omgångarna (kryss mot förväntat) | −0,036 (z −1,7, n 392) | −0,041 (z −1,5, n 260) | −0,028 (z −0,8, n 132) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,011 (z −0,1, n 304) | −0,041 (z −0,4, n 172) | +0,028 (z 0,3, n 132) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,062 (z 0,8, n 245) | +0,144 (z 1,4, n 138) | −0,045 (z −0,4, n 107) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,059 (z 0,4, n 90) | −0,133 (z −0,8, n 55) | +0,361 (z 1,6, n 35) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning 0,09 (z 0,7, n 120). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,04 (z −0,4, n 120). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-10-04)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Eibar | 8 | 7 | 0 | 1 | 18-7 | 11 | 21 |
| 2 | Castellon | 7 | 6 | 1 | 0 | 14-2 | 12 | 19 |
| 3 | Almeria | 8 | 6 | 0 | 2 | 13-5 | 8 | 18 |
| 4 | Burgos | 8 | 4 | 2 | 2 | 12-9 | 3 | 14 |
| 5 | Girona | 7 | 4 | 1 | 2 | 14-8 | 6 | 13 |
| 6 | Mallorca | 7 | 4 | 1 | 2 | 8-3 | 5 | 13 |
| 7 | Sabadell | 7 | 3 | 3 | 1 | 8-6 | 2 | 12 |
| 8 | Oviedo | 8 | 3 | 2 | 3 | 8-8 | 0 | 11 |
| 9 | Tenerife | 7 | 3 | 2 | 2 | 8-9 | -1 | 11 |
| 10 | Leganes | 8 | 3 | 2 | 3 | 6-11 | -5 | 11 |
| 11 | Las Palmas | 7 | 3 | 1 | 3 | 10-11 | -1 | 10 |
| 12 | Sp Gijon | 7 | 3 | 1 | 3 | 5-6 | -1 | 10 |
| 13 | Granada | 7 | 2 | 2 | 3 | 10-11 | -1 | 8 |
| 14 | Sociedad B | 7 | 2 | 2 | 3 | 9-10 | -1 | 8 |
| 15 | Eldense | 8 | 2 | 2 | 4 | 8-10 | -2 | 8 |
| 16 | Celta B | 7 | 2 | 2 | 3 | 8-11 | -3 | 8 |
| 17 | Valladolid | 7 | 2 | 2 | 3 | 6-9 | -3 | 8 |
| 18 | Cadiz | 8 | 1 | 4 | 3 | 11-10 | 1 | 7 |
| 19 | Andorra | 7 | 2 | 0 | 5 | 12-15 | -3 | 6 |
| 20 | Cordoba | 7 | 2 | 0 | 5 | 10-16 | -6 | 6 |
| 21 | Ceuta | 7 | 1 | 1 | 5 | 6-17 | -11 | 4 |
| 22 | Albacete | 8 | 0 | 1 | 7 | 5-15 | -10 | 1 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/LL2.json`.

## Lagfiler

- [Albacete](../lag/LL2/albacete.md)
- [Almeria](../lag/LL2/almeria.md)
- [Andorra](../lag/LL2/andorra.md)
- [Burgos](../lag/LL2/burgos.md)
- [Cadiz](../lag/LL2/cadiz.md)
- [Castellon](../lag/LL2/castellon.md)
- [Celta B](../lag/LL2/celta-b.md)
- [Ceuta](../lag/LL2/ceuta.md)
- [Cordoba](../lag/LL2/cordoba.md)
- [Eibar](../lag/LL2/eibar.md)
- [Eldense](../lag/LL2/eldense.md)
- [Girona](../lag/LL2/girona.md)
- [Granada](../lag/LL2/granada.md)
- [Las Palmas](../lag/LL2/las-palmas.md)
- [Leganes](../lag/LL2/leganes.md)
- [Mallorca](../lag/LL2/mallorca.md)
- [Oviedo](../lag/LL2/oviedo.md)
- [Sabadell](../lag/LL2/sabadell.md)
- [Sociedad B](../lag/LL2/sociedad-b.md)
- [Sp Gijon](../lag/LL2/sp-gijon.md)
- [Tenerife](../lag/LL2/tenerife.md)
- [Valladolid](../lag/LL2/valladolid.md)
