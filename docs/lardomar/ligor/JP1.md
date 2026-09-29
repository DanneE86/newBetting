# J1 League (JP1) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Skriv inte för hand här: egna anteckningar läggs i `docs/lardomar/anteckningar/JP1.md`.

Underlag: 4603 matcher, säsong 2012 – 2026/27. Marknad = stängningsodds utan marginal (Pinnacle, annars snitt av bolagen), öppningsodds saknas. xG: saknas (0 % av matcherna).

## Lärdomar i korthet

- Inga signaler slår marknaden i ligan. Lita på oddsen och lägg energin på streckvärde (Stryktipset) och bästa pris (Oddset).

## Ligans profil

| | Utfall | Oddsens förväntan |
|---|---|---|
| Hemmavinst | 41,1 % | 40,9 % |
| Kryss | 24,8 % | 26,6 % |
| Bortavinst | 34,1 % | 32,5 % |
| Mål per match | 2,62 | |
| Över 2,5 mål | 48,6 % | |
| Båda lagen gör mål | 51,6 % | |
| Logloss stängning | 1,0319 | |

### Kryss efter jämnhet (stängningsodds)

| Match | n | Kryss utfall | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| jämn (|P1−P2| < 15 %) | 2006 | 26,9 % | 28,4 % | −1,4 pe (−1,5) | ingen effekt |
| mellan | 1731 | 24,3 % | 26,7 % | −2,4 pe (−2,4) | ingen effekt |
| klar favorit (> 35 %) | 866 | 21,0 % | 22,2 % | −1,2 pe (−0,8) | ingen effekt |

### Favoriter (favorit–skräll-bias)

| Favoritens odds-sannolikhet | n | Vann | Oddsens | Skillnad (z) | Bedömning |
|---|---|---|---|---|---|
| 33–45 % | 2269 | 40,3 % | 40,0 % | +0,3 pe (0,3) | ingen effekt |
| 45–55 % | 1445 | 50,7 % | 49,3 % | +1,4 pe (1,1) | ingen effekt |
| 55–65 % | 677 | 59,5 % | 59,0 % | +0,5 pe (0,3) | ingen effekt |
| 65–75 % | 176 | 72,2 % | 68,9 % | +3,3 pe (1,0) | ingen effekt |
| 75–100 % | 34 | 82,4 % | 78,3 % | +4,1 pe (0,6) | ingen effekt |

## Kalibrering av oddsen (justeringsmodellen)

g > 0 = favoriter vinner oftare än oddsen säger (skrällar överprissatta), h < 0 = hemmalag överprissatta, d > 0 = kryss underprissatta. Parametrarna är tränade före 2023/24. Kontroll = logloss-skillnad 2023/24– (negativ = bättre). Live används parametrar refittade på all data.

| Bas | g (favoriter) | h (hemma) | d (kryss) | Kontroll | Används live |
|---|---|---|---|---|---|
| stängningsodds (sen körning, Stryktipset/Europatipset) | +0,038 | −0,064 | −0,105 | +0,0004 (z 0,3, n 984) | nej |

## Signaler mot marknaden

Tal = extra poäng för hemmalaget per enhet signal (kryss: andel), z = styrka (|z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs). "Oddsrörelse" visar om signalen förutsäger hur oddsen rör sig från öppning till stängning, alltså om marknaden lär sig det före avspark.

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,004 (z −0,1, n 4482) | +0,011 (z 0,3, n 3519) | −0,063 (z −1,0, n 963) | – | – | −0,007 p | ingen effekt |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | −0,019 (z −0,4, n 3428) | −0,016 (z −0,3, n 2634) | −0,034 (z −0,3, n 794) | – | – | −0,023 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,006 (z 0,3, n 3428) | +0,007 (z 0,3, n 2634) | +0,003 (z 0,1, n 794) | – | – | +0,018 p | ingen effekt |
| Inbördes möten, kryss mot förväntat | +0,035 (z 0,8, n 3428) | +0,008 (z 0,2, n 2634) | +0,145 (z 1,5, n 794) | – | – | +0,016 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,005 (z −0,4, n 4413) | −0,006 (z −0,4, n 3460) | −0,003 (z −0,1, n 953) | – | – | −0,009 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,470 (z −0,8, n 4503) | −0,786 (z −1,2, n 3609) | +0,564 (z 0,4, n 894) | – | – | −0,033 p | ingen effekt |

## Situationer

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,079 (z −1,7, n 690) | −0,095 (z −1,8, n 543) | −0,019 (z −0,2, n 147) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,099 (z −1,7, n 495) | −0,141 (z −2,2, n 380) | +0,041 (z 0,3, n 115) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,016 (z −0,8, n 495) | −0,020 (z −0,9, n 380) | −0,005 (z −0,1, n 115) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | +0,084 (z 1,3, n 332) | +0,100 (z 1,3, n 256) | +0,029 (z 0,2, n 76) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,050 (z 0,6, n 204) | +0,008 (z 0,1, n 161) | +0,207 (z 1,1, n 43) | ingen effekt |

## Lag som marknaden felvärderar?

- Lagets poäng mot marknaden en säsong → nästa: lutning −0,05 (z −0,6, n 206). Ingen persistens: ett lag som slagit oddsen är inte ett bättre spel nästa säsong.
- Lagets extra hemmafördel → nästa säsong: lutning −0,09 (z −1,3, n 206). Lagspecifik hemmafördel utöver marknaden är brus.

## Stryktipset och Europatipset

Inga matcher från ligan i de sparade backtesten ännu.

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Vissel Kobe | 8 | 6 | 1 | 1 | 12-5 | 7 | 19 |
| 2 | Kashiwa Reysol | 8 | 6 | 0 | 2 | 17-12 | 5 | 18 |
| 3 | Sanfrecce Hiroshima | 8 | 5 | 2 | 1 | 20-6 | 14 | 17 |
| 4 | Machida | 8 | 5 | 2 | 1 | 21-10 | 11 | 17 |
| 5 | FC Tokyo | 8 | 5 | 2 | 1 | 14-8 | 6 | 17 |
| 6 | Yokohama F. Marinos | 8 | 4 | 2 | 2 | 13-9 | 4 | 14 |
| 7 | Kawasaki Frontale | 8 | 3 | 4 | 1 | 16-12 | 4 | 13 |
| 8 | Kashima Antlers | 8 | 4 | 1 | 3 | 17-16 | 1 | 13 |
| 9 | Okayama | 8 | 4 | 1 | 3 | 11-10 | 1 | 13 |
| 10 | Urawa Reds | 8 | 4 | 0 | 4 | 16-18 | -2 | 12 |
| 11 | Cerezo Osaka | 8 | 3 | 2 | 3 | 7-12 | -5 | 11 |
| 12 | Shimizu S-Pulse | 8 | 3 | 1 | 4 | 6-8 | -2 | 10 |
| 13 | Mito | 8 | 2 | 3 | 3 | 11-11 | 0 | 9 |
| 14 | Kyoto | 8 | 2 | 2 | 4 | 11-15 | -4 | 8 |
| 15 | V-Varen Nagasaki | 8 | 2 | 2 | 4 | 10-15 | -5 | 8 |
| 16 | Gamba Osaka | 8 | 1 | 3 | 4 | 8-14 | -6 | 6 |
| 17 | Nagoya Grampus | 8 | 2 | 0 | 6 | 7-14 | -7 | 6 |
| 18 | Avispa Fukuoka | 8 | 1 | 1 | 6 | 9-12 | -3 | 4 |
| 19 | Verdy | 8 | 0 | 4 | 4 | 4-12 | -8 | 4 |
| 20 | Chiba | 8 | 1 | 1 | 6 | 7-18 | -11 | 4 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/JP1.json`.

## Lagfiler

- [Avispa Fukuoka](../lag/JP1/avispa-fukuoka.md)
- [Cerezo Osaka](../lag/JP1/cerezo-osaka.md)
- [Chiba](../lag/JP1/chiba.md)
- [FC Tokyo](../lag/JP1/fc-tokyo.md)
- [Gamba Osaka](../lag/JP1/gamba-osaka.md)
- [Kashima Antlers](../lag/JP1/kashima-antlers.md)
- [Kashiwa Reysol](../lag/JP1/kashiwa-reysol.md)
- [Kawasaki Frontale](../lag/JP1/kawasaki-frontale.md)
- [Kyoto](../lag/JP1/kyoto.md)
- [Machida](../lag/JP1/machida.md)
- [Mito](../lag/JP1/mito.md)
- [Nagoya Grampus](../lag/JP1/nagoya-grampus.md)
- [Okayama](../lag/JP1/okayama.md)
- [Sanfrecce Hiroshima](../lag/JP1/sanfrecce-hiroshima.md)
- [Shimizu S-Pulse](../lag/JP1/shimizu-s-pulse.md)
- [Urawa Reds](../lag/JP1/urawa-reds.md)
- [V-Varen Nagasaki](../lag/JP1/v-varen-nagasaki.md)
- [Verdy](../lag/JP1/verdy.md)
- [Vissel Kobe](../lag/JP1/vissel-kobe.md)
- [Yokohama F. Marinos](../lag/JP1/yokohama-f-marinos.md)
