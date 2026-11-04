# MLS (MLS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/MLS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 540 | 50,6 % | 46,7 % | +3,9 pe (1,8) | 44,3 % | 135 / 132 | modell (inga odds) |
| 2026/27 | 495 | 49,9 % | 46,7 % | +3,2 pe (1,4) | 45,9 % | 129 / 119 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 489 | 48,3 % | 49,7 % | −0,6 | 24,7 % | 25,3 % | −0,3 |
| 2023 | 521 | 47,0 % | 49,3 % | −1,0 | 29,2 % | 25,5 % | 1,9 |
| 2024 | 522 | 46,2 % | 50,3 % | −1,9 | 24,9 % | 24,6 % | 0,1 |
| 2025 | 540 | 49,8 % | 49,2 % | 0,3 | 25,0 % | 24,8 % | 0,1 |
| 2026 | 495 | 50,5 % | 50,5 % | −0,0 | 26,1 % | 23,8 % | 1,2 |

### 2026: vad gick fel

- Kryss: 129 av 495 (26,1 %) mot väntat 117,7 (z 1,2).
- Hemmafavoriter vann 201 av 393 (väntat 203,8), bortafavoriter 49 av 102 (väntat 46,3), favoriter ≥ 60 % 62 av 94 (väntat 62,5).
- Lag sämst mot oddsen (poäng mot förväntat): Los Angeles FC −10,9 (33 m), CF Montreal −9,7 (33 m), New York City −8,2 (33 m), Columbus Crew −8,1 (33 m).
- Lag bäst mot oddsen: Nashville SC +17,8 (33 m), New England Revolution +15,0 (33 m), FC Dallas +9,9 (33 m), San Jose Earthquakes +8,5 (33 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 654 / 304 | −2,0 pe (−1,0) | −2,4 pe (−0,8) | +1,0 pe (0,6) | −0,8 pe (−0,3) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1433 / 764 | +0,4 pe (0,3) | −3,7 pe (−2,1) | −0,8 pe (−0,7) | +2,3 pe (1,4) | ingen säker effekt |
| Bortafavorit | 549 / 311 | −2,9 pe (−1,4) | +2,1 pe (0,8) | −0,8 pe (−0,4) | +1,1 pe (0,4) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 122 / 49 | +2,8 pe (0,7) | −1,4 pe (−0,2) | −2,6 pe (−0,8) | +0,1 pe (0,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/MLS.md](../ligor/MLS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn (odds) träffar 49,7 % mot väntat 50,4 %. Webben visade 45,0 % från grundmodellen: grundmodellen och oddsen var oense i 55 matcher, och då hade oddsen rätt 22 gånger mot grundmodellens 13.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
