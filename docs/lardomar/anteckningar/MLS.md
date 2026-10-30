# MLS (MLS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/MLS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 540 | 50,6 % | 46,7 % | +3,9 pe (1,8) | 44,3 % | 135 / 132 | modell (inga odds) |
| 2026/27 | 480 | 49,6 % | 46,7 % | +2,9 pe (1,3) | 45,4 % | 127 / 115 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,3). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 489 | 48,3 % | 49,7 % | −0,6 | 24,7 % | 25,3 % | −0,3 |
| 2023 | 521 | 47,0 % | 49,3 % | −1,0 | 29,2 % | 25,5 % | 1,9 |
| 2024 | 522 | 46,2 % | 50,3 % | −1,9 | 24,9 % | 24,6 % | 0,1 |
| 2025 | 540 | 49,8 % | 49,2 % | 0,3 | 25,0 % | 24,8 % | 0,1 |
| 2026 | 480 | 50,0 % | 50,4 % | −0,2 | 26,5 % | 23,8 % | 1,4 |

### 2026: vad gick fel

- Kryss: 127 av 480 (26,5 %) mot väntat 114,4 (z 1,4).
- Hemmafavoriter vann 192 av 380 (väntat 196,8), bortafavoriter 48 av 100 (väntat 45,4), favoriter ≥ 60 % 59 av 90 (väntat 59,9).
- Lag sämst mot oddsen (poäng mot förväntat): CF Montreal −10,1 (32 m), San Diego FC −9,7 (32 m), Los Angeles FC −9,0 (32 m), Columbus Crew −8,9 (32 m).
- Lag bäst mot oddsen: Nashville SC +16,9 (32 m), New England Revolution +16,2 (32 m), FC Dallas +10,7 (32 m), San Jose Earthquakes +6,9 (32 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 654 / 304 | −2,0 pe (−1,0) | −2,4 pe (−0,8) | +1,0 pe (0,6) | −0,8 pe (−0,3) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1433 / 759 | +0,4 pe (0,3) | −3,9 pe (−2,2) | −0,8 pe (−0,7) | +2,5 pe (1,5) | ingen säker effekt |
| Bortafavorit | 549 / 309 | −2,9 pe (−1,4) | +2,1 pe (0,8) | −0,8 pe (−0,4) | +0,9 pe (0,4) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 122 / 48 | +2,8 pe (0,7) | −2,0 pe (−0,3) | −2,6 pe (−0,8) | +0,5 pe (0,1) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/MLS.md](../ligor/MLS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn (odds) träffar 49,7 % mot väntat 50,4 %. Webben visade 45,0 % från grundmodellen: grundmodellen och oddsen var oense i 55 matcher, och då hade oddsen rätt 22 gånger mot grundmodellens 13.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
