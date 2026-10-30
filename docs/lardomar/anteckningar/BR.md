# Brasileirão Série A (BR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 52,1 % | 48,8 % | +3,3 pe (1,3) | 50,3 % | 99 / 83 | modell (inga odds) |
| 2026/27 | 327 | 51,4 % | 46,9 % | +4,5 pe (1,6) | 48,0 % | 90 / 69 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 319 | 49,2 % | 50,7 % | −0,5 | 28,8 % | 27,6 % | 0,5 |
| 2023 | 340 | 48,8 % | 49,6 % | −0,3 | 25,9 % | 27,6 % | −0,7 |
| 2024 | 348 | 53,4 % | 49,3 % | 1,6 | 26,7 % | 27,8 % | −0,5 |
| 2025 | 351 | 51,0 % | 50,3 % | 0,3 | 26,5 % | 27,7 % | −0,5 |
| 2026 | 311 | 53,4 % | 50,4 % | 1,1 | 28,3 % | 26,9 % | 0,6 |

### 2026: vad gick fel

- Kryss: 88 av 311 (28,3 %) mot väntat 83,7 (z 0,6).
- Hemmafavoriter vann 137 av 247 (väntat 128,4), bortafavoriter 29 av 64 (väntat 28,3), favoriter ≥ 60 % 40 av 57 (väntat 38,5).
- Lag sämst mot oddsen (poäng mot förväntat): Internacional −11,2 (33 m), Corinthians −10,9 (29 m), Vasco −6,3 (31 m), Mirassol −5,1 (31 m).
- Lag bäst mot oddsen: Palmeiras +9,6 (30 m), Athletico-PR +7,8 (32 m), Cruzeiro +5,8 (33 m), Bahia +5,6 (30 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 560 / 215 | −0,7 pe (−0,3) | +1,3 pe (0,4) | +1,4 pe (0,7) | +0,9 pe (0,3) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1619 / 516 | +0,8 pe (0,6) | +1,5 pe (0,7) | −0,2 pe (−0,2) | −1,9 pe (−0,9) | ingen säker effekt |
| Bortafavorit | 793 / 262 | −1,4 pe (−0,8) | +2,3 pe (0,8) | +0,9 pe (0,6) | −1,4 pe (−0,5) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 205 / 61 | −0,1 pe (−0,0) | +7,7 pe (1,4) | −1,2 pe (−0,5) | −0,7 pe (−0,1) | ingen säker effekt |
| Uppflyttad favorit | 88 / 37 | +3,7 pe (0,7) | −6,1 pe (−0,8) | −3,0 pe (−0,6) | −0,3 pe (−0,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BR.md](../ligor/BR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,9 % mot väntat 50,1 %. Grundmodellen och oddsen var oense i 36 matcher, och oddsen hade rätt 17 gånger mot grundmodellens 8. Oddsen ska styra, och det gör de.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
