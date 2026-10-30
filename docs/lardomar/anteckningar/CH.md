# Championship (CH) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/CH.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 552 | 44,0 % | 45,2 % | −1,2 pe (−0,6) | 41,7 % | 146 / 163 | modell (inga odds) |
| 2026/27 | 144 | 41,0 % | 43,2 % | −2,3 pe (−0,6) | 40,3 % | 40 / 45 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −0,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 552 | 45,3 % | 46,4 % | −0,5 | 27,0 % | 28,0 % | −0,5 |
| 2023/24 | 552 | 48,9 % | 49,7 % | −0,4 | 23,4 % | 25,8 % | −1,3 |
| 2024/25 | 552 | 47,8 % | 48,0 % | −0,1 | 28,3 % | 27,1 % | 0,6 |
| 2025/26 | 552 | 46,2 % | 48,0 % | −0,8 | 26,4 % | 26,5 % | −0,0 |
| 2026/27 | 144 | 47,2 % | 47,6 % | −0,1 | 27,8 % | 26,1 % | 0,5 |

### 2026/27: vad gick fel

- Kryss: 40 av 144 (27,8 %) mot väntat 37,6 (z 0,5).
- Hemmafavoriter vann 48 av 99 (väntat 49,0), bortafavoriter 20 av 45 (väntat 19,6), favoriter ≥ 60 % 6 av 15 (väntat 9,9).
- Lag sämst mot oddsen (poäng mot förväntat): Preston −8,3 (12 m), Burnley −8,2 (12 m), Norwich −7,0 (12 m), Derby −6,4 (12 m).
- Lag bäst mot oddsen: Swansea +6,7 (12 m), Stoke +4,8 (12 m), Blackburn +4,4 (12 m), Southampton +4,0 (12 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 31 matcher: grundmodellen rätt 3, oddsen rätt 20.
- Dixon-Coles och oddsen var oense i 29 matcher: DC rätt 7.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 363 / 240 | −2,1 pe (−0,8) | −5,3 pe (−1,7) | +0,4 pe (0,2) | +1,3 pe (0,4) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 1248 / 588 | −1,6 pe (−1,2) | −3,9 pe (−1,9) | −0,1 pe (−0,1) | −0,7 pe (−0,4) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1670 / 857 | +0,3 pe (0,2) | −0,7 pe (−0,4) | −2,2 pe (−2,0) | −1,7 pe (−1,1) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 1263 / 451 | −1,0 pe (−0,7) | −1,8 pe (−0,8) | −1,6 pe (−1,3) | −2,5 pe (−1,2) | ingen säker effekt |
| Bortafavorit | 956 / 505 | +1,3 pe (0,8) | −2,0 pe (−0,9) | −2,4 pe (−1,6) | +0,1 pe (0,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/CH.md](../ligor/CH.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-10-03: missas något tecken (1/X/2) oftare än väntat i Stryktipset A/B? (107 omg)

- Championship: A missade 1 25/292 (väntat 19, z 1,6), X 51/169 (54), 2 64/202 (56, z 1,3). B 1 45 (34, z 2,4), X 78 (90, z −1,5), 2 64 (60). B:s 1:or sticker ut men nästan bara 2025/26– och åt motsatt håll mot A. Brus vid ~40 tester, ingen ändring.
- Samlat: nej. Kryss missas oftast men som modellen väntar. Se [slutsatser.md](../slutsatser.md) (Förkastat 2026-10-03).
- Senare samma dag bakkördes "ta med X oftare" i A och B (1X/X2 före 12, inget favoritspik vid högt kryss, X-vikt). Färre X-missar men fler missade 1:or/2:or, lägre chans till 13 och sämre netto. Inget infört, tabellen finns i slutsatser.md.

### 2026-10-03: spikar på Stryktipset (bakkörning 107 omgångar, A/B/C)

- Championship: 371 favoritspikar (A+B+C) satt 44 % (väntat 48 %). Med kryss ≥ 27 % satt de bara 35 % (205 st, över hälften av spikarna), under 27 % 55 % (166 st). 86 av 209 missar blev kryss. Championship är där vi oftast spikar matcher med högt kryss. Spika hellre en starkare favorit (oftast PL) och gardera Championship-matchen.
- Samlat i [slutsatser.md](../slutsatser.md) (2026-10-03): det fanns nästan alltid en starkare garderad favorit med kryss < 27 % som hade suttit 68–79 %.

### 2026-09-28: felanalys och förbättringsvarv

- Huvudfelet: webben visade grundmodellens träff (36,6 %). Grundmodellen tippar hemmalaget i 63 av 71 matcher (oddsen i 52), och när den och oddsen var oense hade den rätt 0 gånger av 17 (oddsen 10). Tipsen styrs av oddsen, och den riktiga träffen 2026/27 är 45,3 % mot väntat 47,1 % (z −0,4).
- Kryss 31 % i år mot normalt 26 %. Burnley, Preston, Cardiff och Derby ligger mest under oddsen (beskrivande).
- Championship är en av de svåraste ligorna att tippa: favoriten vinner bara 46–48 % i snitt, så även perfekta tips missar mer än hälften.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
