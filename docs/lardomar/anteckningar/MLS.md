# MLS (MLS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/MLS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 540 | 49,8 % | 49,2 % | +0,6 pe (0,3) | 44,3 % | 135 / 136 | odds |
| 2026/27 | 404 | 50,0 % | 50,4 % | −0,4 pe (−0,2) | 46,0 % | 103 / 99 | odds |

Bedömning 2026/27: inom slumpen (z −0,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 489 | 48,3 % | 49,7 % | −0,6 | 24,7 % | 25,3 % | −0,3 |
| 2023 | 521 | 47,0 % | 49,3 % | −1,0 | 29,2 % | 25,5 % | 1,9 |
| 2024 | 522 | 46,2 % | 50,3 % | −1,9 | 24,9 % | 24,6 % | 0,1 |
| 2025 | 540 | 49,8 % | 49,2 % | 0,3 | 25,0 % | 24,8 % | 0,1 |
| 2026 | 404 | 49,5 % | 50,0 % | −0,2 | 25,5 % | 23,8 % | 0,8 |

### 2026: vad gick fel

- Kryss: 103 av 404 (25,5 %) mot väntat 96,3 (z 0,8).
- Hemmafavoriter vann 162 av 319 (väntat 163,8), bortafavoriter 38 av 85 (väntat 38,2), favoriter ≥ 60 % 45 av 63 (väntat 42,0).
- Lag sämst mot oddsen (poäng mot förväntat): Columbus Crew −13,1 (27 m), Minnesota United −8,2 (27 m), Los Angeles FC −7,6 (28 m), CF Montreal −7,0 (27 m).
- Lag bäst mot oddsen: Nashville SC +15,8 (27 m), FC Dallas +11,0 (27 m), New England Revolution +10,7 (27 m), St. Louis City +9,9 (27 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 654 / 304 | −2,0 pe (−1,0) | −2,2 pe (−0,8) | +1,0 pe (0,6) | −0,8 pe (−0,3) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1433 / 730 | +0,4 pe (0,3) | −4,0 pe (−2,2) | −0,8 pe (−0,7) | +2,0 pe (1,2) | ingen säker effekt |
| Bortafavorit | 549 / 292 | −2,9 pe (−1,4) | +1,6 pe (0,5) | −0,8 pe (−0,4) | +0,8 pe (0,3) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 122 / 39 | +2,8 pe (0,7) | −1,1 pe (−0,2) | −2,6 pe (−0,8) | −3,3 pe (−0,6) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/MLS.md](../ligor/MLS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn (odds) träffar 49,7 % mot väntat 50,4 %. Webben visade 45,0 % från grundmodellen: grundmodellen och oddsen var oense i 55 matcher, och då hade oddsen rätt 22 gånger mot grundmodellens 13.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
