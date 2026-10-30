# Bundesliga (BL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 54,9 % | 52,1 % | +2,8 pe (1,0) | 43,8 % | 75 / 63 | modell (inga odds) |
| 2026/27 | 63 | 55,6 % | 50,5 % | +5,0 pe (0,8) | 50,8 % | 13 / 15 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,8). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 53,3 % | 52,0 % | 0,5 | 24,5 % | 24,2 % | 0,1 |
| 2023/24 | 306 | 56,2 % | 54,7 % | 0,6 | 26,5 % | 22,7 % | 1,6 |
| 2024/25 | 306 | 52,6 % | 54,0 % | −0,5 | 25,2 % | 23,5 % | 0,7 |
| 2025/26 | 306 | 56,5 % | 52,1 % | 1,6 | 24,5 % | 23,9 % | 0,3 |
| 2026/27 | 63 | 54,0 % | 55,7 % | −0,3 | 20,6 % | 21,8 % | −0,2 |

### 2026/27: vad gick fel

- Kryss: 13 av 63 (20,6 %) mot väntat 13,7 (z −0,2).
- Hemmafavoriter vann 25 av 42 (väntat 23,7), bortafavoriter 9 av 21 (väntat 11,3), favoriter ≥ 60 % 15 av 22 (väntat 15,7).
- Lag sämst mot oddsen (poäng mot förväntat): Stuttgart −5,4 (7 m), M'gladbach −4,2 (7 m), Hoffenheim −2,4 (7 m), Schalke 04 −1,7 (7 m).
- Lag bäst mot oddsen: Werder Bremen +4,3 (7 m), Elversberg +3,5 (7 m), Dortmund +3,1 (7 m), Hamburg +2,7 (7 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 9 matcher: grundmodellen rätt 2, oddsen rätt 6.
- Dixon-Coles och oddsen var oense i 4 matcher: DC rätt 2.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 746 / 337 | −4,8 pe (−2,7) | −2,0 pe (−0,8) | +2,5 pe (1,6) | +4,0 pe (1,7) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 244 / 136 | −1,1 pe (−0,4) | +0,6 pe (0,2) | −0,2 pe (−0,1) | +2,2 pe (0,8) | ingen säker effekt |
| Omgång 1–5 | 270 / 180 | −3,0 pe (−1,0) | +5,1 pe (1,4) | +3,7 pe (1,4) | −2,6 pe (−0,8) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 620 / 336 | −2,1 pe (−1,1) | +0,9 pe (0,3) | +1,0 pe (0,5) | +1,5 pe (0,6) | ingen säker effekt |
| Bortafavorit | 643 / 321 | −2,1 pe (−1,1) | +3,8 pe (1,4) | −0,6 pe (−0,4) | +1,3 pe (0,6) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BL.md](../ligor/BL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,0 % mot väntat 55,3 % (36 matcher), inom slumpen. Webben visade 44,4 % från grundmodellen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
