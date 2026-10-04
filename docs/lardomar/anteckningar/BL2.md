# 2. Bundesliga (BL2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BL2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 50,3 % | 46,7 % | +3,6 pe (1,3) | 46,1 % | 74 / 78 | odds |
| 2026/27 | 54 | 44,4 % | 46,4 % | −1,9 pe (−0,3) | 38,9 % | 15 / 15 | odds |

Bedömning 2026/27: inom slumpen (z −0,3). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 49,7 % | 46,5 % | 1,1 | 23,9 % | 26,2 % | −0,9 |
| 2023/24 | 306 | 51,0 % | 47,7 % | 1,2 | 23,2 % | 25,0 % | −0,7 |
| 2024/25 | 306 | 42,8 % | 48,5 % | −2,0 | 28,1 % | 25,2 % | 1,2 |
| 2025/26 | 306 | 50,3 % | 46,3 % | 1,4 | 24,2 % | 25,7 % | −0,6 |
| 2026/27 | 54 | 46,3 % | 45,7 % | 0,1 | 27,8 % | 24,9 % | 0,5 |

### 2026/27: vad gick fel

- Kryss: 15 av 54 (27,8 %) mot väntat 13,5 (z 0,5).
- Hemmafavoriter vann 17 av 39 (väntat 18,4), bortafavoriter 8 av 15 (väntat 6,2), favoriter ≥ 60 % 1 av 3 (väntat 1,9).
- Lag sämst mot oddsen (poäng mot förväntat): Dresden −4,5 (6 m), Bielefeld −4,5 (6 m), Holstein Kiel −4,3 (6 m), Braunschweig −3,2 (6 m).
- Lag bäst mot oddsen: Hertha +9,3 (6 m), Nurnberg +7,5 (6 m), Heidenheim +3,9 (6 m), Kaiserslautern +3,2 (6 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 11 matcher: grundmodellen rätt 2, oddsen rätt 6.
- Dixon-Coles och oddsen var oense i 11 matcher: DC rätt 5.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 960 / 481 | −0,1 pe (−0,1) | +4,0 pe (1,8) | −0,9 pe (−0,6) | −0,2 pe (−0,1) | ingen säker effekt |
| Omgång 1–5 | 270 / 180 | +0,9 pe (0,3) | +3,7 pe (1,0) | +0,9 pe (0,3) | −2,5 pe (−0,8) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 725 / 357 | −4,0 pe (−2,2) | −2,3 pe (−0,9) | +1,5 pe (0,9) | +2,6 pe (1,1) | ingen säker effekt |
| Bortafavorit | 514 / 267 | −2,9 pe (−1,4) | +1,8 pe (0,6) | +0,8 pe (0,4) | +0,1 pe (0,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BL2.md](../ligor/BL2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 44,4 % mot väntat 46,4 %. Grundmodellen och oddsen var oense i 11 matcher, och oddsen hade rätt 5 gånger mot grundmodellens 2.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
