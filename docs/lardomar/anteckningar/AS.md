# Allsvenskan (AS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/AS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 240 | 53,3 % | 50,5 % | +2,8 pe (0,9) | 40,0 % | 53 / 59 | odds |
| 2026/27 | 176 | 51,7 % | 52,4 % | −0,7 pe (−0,2) | 41,5 % | 41 / 44 | odds |

Bedömning 2026/27: inom slumpen (z −0,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 242 | 52,5 % | 53,1 % | −0,2 | 24,8 % | 24,6 % | 0,1 |
| 2023 | 240 | 53,8 % | 51,7 % | 0,6 | 19,6 % | 25,0 % | −1,9 |
| 2024 | 242 | 47,5 % | 50,1 % | −0,8 | 21,9 % | 25,0 % | −1,1 |
| 2025 | 240 | 53,3 % | 50,4 % | 0,9 | 22,1 % | 25,0 % | −1,1 |
| 2026 | 176 | 50,6 % | 51,6 % | −0,3 | 23,3 % | 24,4 % | −0,3 |

### 2026: vad gick fel

- Kryss: 41 av 176 (23,3 %) mot väntat 43,0 (z −0,3).
- Hemmafavoriter vann 56 av 105 (väntat 57,1), bortafavoriter 33 av 71 (väntat 33,7), favoriter ≥ 60 % 29 av 46 (väntat 30,8).
- Lag sämst mot oddsen (poäng mot förväntat): Kalmar −8,8 (22 m), Mjallby −8,1 (22 m), Halmstad −5,4 (22 m), Degerfors −4,2 (22 m).
- Lag bäst mot oddsen: Vasteras SK +11,3 (22 m), Sirius +10,4 (22 m), Elfsborg +5,6 (22 m), Brommapojkarna +3,2 (22 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 462 / 162 | +0,1 pe (0,0) | +1,1 pe (0,3) | +0,5 pe (0,2) | −5,0 pe (−1,5) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 907 / 345 | −1,0 pe (−0,6) | −3,3 pe (−1,3) | +2,2 pe (1,5) | −1,8 pe (−0,7) | ingen säker effekt |
| Bortafavorit | 876 / 316 | +2,5 pe (1,5) | +3,1 pe (1,1) | −0,4 pe (−0,3) | −3,4 pe (−1,4) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 235 / 62 | +5,3 pe (1,9) | +9,2 pe (1,7) | −0,6 pe (−0,2) | −4,4 pe (−1,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/AS.md](../ligor/AS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Webben visade 46,9 % från grundmodellen. Oddsen, som styr tipsen, ger 51,7 % mot väntat 52,4 %. Grundmodellen och oddsen var oense i 36 matcher, och oddsen hade rätt 13 gånger mot grundmodellens 7.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
