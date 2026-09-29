# Brasileirão Série A (BR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 51,8 % | 50,1 % | +1,7 pe (0,7) | 50,3 % | 99 / 84 | odds |
| 2026/27 | 277 | 50,9 % | 50,1 % | +0,8 pe (0,3) | 46,9 % | 77 / 59 | odds |

Bedömning 2026/27: inom slumpen (z 0,3). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 380 | 48,9 % | 50,6 % | −0,7 | 28,4 % | 27,6 % | 0,3 |
| 2023 | 380 | 48,2 % | 49,5 % | −0,5 | 25,8 % | 27,6 % | −0,8 |
| 2024 | 380 | 53,9 % | 49,1 % | 1,9 | 26,6 % | 27,8 % | −0,6 |
| 2025 | 380 | 51,8 % | 50,0 % | 0,7 | 26,1 % | 27,8 % | −0,8 |
| 2026 | 277 | 50,9 % | 49,4 % | 0,5 | 27,8 % | 27,0 % | 0,3 |

### 2026: vad gick fel

- Kryss: 77 av 277 (27,8 %) mot väntat 74,8 (z 0,3).
- Hemmafavoriter vann 117 av 221 (väntat 112,5), bortafavoriter 24 av 56 (väntat 24,4), favoriter ≥ 60 % 31 av 45 (väntat 30,1).
- Lag sämst mot oddsen (poäng mot förväntat): Internacional −11,6 (28 m), Corinthians −8,7 (28 m), Vasco −7,0 (27 m), Mirassol −5,4 (28 m).
- Lag bäst mot oddsen: Athletico-PR +11,2 (28 m), Palmeiras +8,1 (28 m), Coritiba +6,6 (28 m), Fluminense +5,0 (28 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 558 / 206 | −0,8 pe (−0,4) | +3,0 pe (0,9) | +1,3 pe (0,7) | +1,1 pe (0,4) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1643 / 559 | +0,9 pe (0,7) | +0,9 pe (0,4) | −0,3 pe (−0,3) | −1,7 pe (−0,9) | ingen säker effekt |
| Bortafavorit | 812 / 284 | −0,7 pe (−0,4) | +1,7 pe (0,6) | +0,6 pe (0,4) | −2,3 pe (−0,8) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 208 / 56 | +0,2 pe (0,1) | +8,2 pe (1,4) | −1,5 pe (−0,6) | +0,6 pe (0,1) | ingen säker effekt |
| Uppflyttad favorit | 89 / 38 | +4,3 pe (0,8) | −7,0 pe (−0,9) | −3,3 pe (−0,7) | +1,6 pe (0,2) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BR.md](../ligor/BR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,9 % mot väntat 50,1 %. Grundmodellen och oddsen var oense i 36 matcher, och oddsen hade rätt 17 gånger mot grundmodellens 8. Oddsen ska styra, och det gör de.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
