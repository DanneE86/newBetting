# Eliteserien (NO) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/NO.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 57,5 % | 52,2 % | +5,3 pe (1,7) | 48,8 % | 46 / 56 | modell (inga odds) |
| 2026/27 | 192 | 55,2 % | 50,8 % | +4,4 pe (1,2) | 50,0 % | 38 / 48 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 242 | 51,7 % | 53,3 % | −0,5 | 23,6 % | 23,4 % | 0,1 |
| 2023 | 242 | 56,2 % | 53,9 % | 0,7 | 17,4 % | 23,4 % | −2,2 |
| 2024 | 242 | 49,2 % | 52,4 % | −1,0 | 25,2 % | 23,8 % | 0,5 |
| 2025 | 240 | 61,3 % | 54,9 % | 2,1 | 19,2 % | 22,8 % | −1,4 |
| 2026 | 192 | 55,7 % | 54,9 % | 0,2 | 19,8 % | 22,4 % | −0,9 |

### 2026: vad gick fel

- Kryss: 38 av 192 (19,8 %) mot väntat 43,0 (z −0,9).
- Hemmafavoriter vann 80 av 134 (väntat 75,1), bortafavoriter 27 av 58 (väntat 30,4), favoriter ≥ 60 % 46 av 64 (väntat 44,9).
- Lag sämst mot oddsen (poäng mot förväntat): Brann −9,4 (24 m), Start −5,4 (24 m), Valerenga −3,7 (24 m), Sandefjord −3,3 (24 m).
- Lag bäst mot oddsen: Viking +11,0 (24 m), Lillestrom +4,6 (24 m), Rosenborg +4,5 (24 m), HamKam +3,1 (24 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 471 / 175 | +1,0 pe (0,5) | −1,2 pe (−0,3) | −0,5 pe (−0,2) | −0,0 pe (−0,0) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 945 / 279 | −0,9 pe (−0,6) | +3,4 pe (1,2) | +0,9 pe (0,6) | −5,2 pe (−2,0) | ingen säker effekt |
| Bortafavorit | 650 / 280 | +0,8 pe (0,4) | +2,1 pe (0,7) | +0,5 pe (0,3) | −2,1 pe (−0,8) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 180 / 119 | +0,4 pe (0,1) | +6,3 pe (1,6) | +3,9 pe (1,5) | −5,7 pe (−1,8) | ingen säker effekt |
| Uppflyttad favorit | 66 / 32 | −0,7 pe (−0,1) | −0,7 pe (−0,1) | −4,0 pe (−0,7) | +9,4 pe (1,2) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/NO.md](../ligor/NO.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 56,5 % mot väntat 55,0 %. Förra säsongen låg den över förväntan (z +2,1). Inga fel att rätta.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
