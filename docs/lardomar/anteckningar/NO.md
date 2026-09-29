# Eliteserien (NO) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/NO.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 61,3 % | 54,9 % | +6,4 pe (2,1) | 48,8 % | 46 / 47 | odds |
| 2026/27 | 168 | 56,5 % | 55,0 % | +1,5 pe (0,4) | 51,2 % | 33 / 40 | odds |

Bedömning 2026/27: inom slumpen (z 0,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 242 | 51,7 % | 53,3 % | −0,5 | 23,6 % | 23,4 % | 0,1 |
| 2023 | 242 | 56,2 % | 53,9 % | 0,7 | 17,4 % | 23,4 % | −2,2 |
| 2024 | 242 | 49,2 % | 52,4 % | −1,0 | 25,2 % | 23,8 % | 0,5 |
| 2025 | 240 | 61,3 % | 54,6 % | 2,1 | 19,2 % | 23,0 % | −1,4 |
| 2026 | 168 | 56,0 % | 53,9 % | 0,5 | 19,6 % | 22,9 % | −1,0 |

### 2026: vad gick fel

- Kryss: 33 av 168 (19,6 %) mot väntat 38,5 (z −1,0).
- Hemmafavoriter vann 70 av 115 (väntat 63,4), bortafavoriter 24 av 53 (väntat 27,2), favoriter ≥ 60 % 36 av 45 (väntat 31,2).
- Lag sämst mot oddsen (poäng mot förväntat): Valerenga −6,4 (21 m), Brann −5,1 (21 m), Start −5,0 (21 m), Aalesund −1,8 (21 m).
- Lag bäst mot oddsen: Viking +8,7 (21 m), Fredrikstad +4,0 (21 m), Rosenborg +3,3 (21 m), Tromso +3,1 (21 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 471 / 180 | +1,0 pe (0,5) | −1,3 pe (−0,3) | −0,5 pe (−0,2) | −0,2 pe (−0,1) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 945 / 269 | −0,9 pe (−0,6) | +3,2 pe (1,1) | +0,9 pe (0,6) | −5,2 pe (−1,9) | ingen säker effekt |
| Bortafavorit | 650 / 274 | +0,8 pe (0,4) | +2,1 pe (0,7) | +0,5 pe (0,3) | −2,5 pe (−1,0) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 180 / 108 | +0,4 pe (0,1) | +6,9 pe (1,7) | +3,9 pe (1,5) | −5,1 pe (−1,5) | ingen säker effekt |
| Uppflyttad favorit | 66 / 34 | −0,7 pe (−0,1) | −2,9 pe (−0,3) | −4,0 pe (−0,7) | +7,2 pe (1,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/NO.md](../ligor/NO.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 56,5 % mot väntat 55,0 %. Förra säsongen låg den över förväntan (z +2,1). Inga fel att rätta.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
