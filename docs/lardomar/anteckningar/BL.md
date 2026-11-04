# Bundesliga (BL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 54,9 % | 52,1 % | +2,8 pe (1,0) | 43,8 % | 75 / 63 | modell (inga odds) |
| 2026/27 | 72 | 54,2 % | 49,4 % | +4,8 pe (0,8) | 48,6 % | 16 / 17 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,8). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 53,3 % | 52,0 % | 0,5 | 24,5 % | 24,2 % | 0,1 |
| 2023/24 | 306 | 56,2 % | 54,7 % | 0,6 | 26,5 % | 22,7 % | 1,6 |
| 2024/25 | 306 | 52,6 % | 54,0 % | −0,5 | 25,2 % | 23,5 % | 0,7 |
| 2025/26 | 306 | 56,5 % | 52,1 % | 1,6 | 24,5 % | 23,9 % | 0,3 |
| 2026/27 | 72 | 51,4 % | 55,5 % | −0,7 | 22,2 % | 21,7 % | 0,1 |

### 2026/27: vad gick fel

- Kryss: 16 av 72 (22,2 %) mot väntat 15,6 (z 0,1).
- Hemmafavoriter vann 26 av 47 (väntat 26,8), bortafavoriter 11 av 25 (väntat 13,2), favoriter ≥ 60 % 16 av 24 (väntat 17,4).
- Lag sämst mot oddsen (poäng mot förväntat): M'gladbach −4,9 (8 m), Hoffenheim −3,9 (8 m), Stuttgart −3,3 (8 m), Mainz −3,2 (8 m).
- Lag bäst mot oddsen: Werder Bremen +6,0 (8 m), Elversberg +5,4 (8 m), Freiburg +4,1 (8 m), Dortmund +3,6 (8 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 14 matcher: grundmodellen rätt 5, oddsen rätt 7.
- Dixon-Coles och oddsen var oense i 6 matcher: DC rätt 2.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 746 / 341 | −4,8 pe (−2,7) | −2,2 pe (−0,8) | +2,5 pe (1,6) | +4,2 pe (1,8) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 244 / 137 | −1,1 pe (−0,4) | +0,1 pe (0,0) | −0,2 pe (−0,1) | +2,8 pe (1,0) | ingen säker effekt |
| Omgång 1–5 | 270 / 180 | −3,0 pe (−1,0) | +5,1 pe (1,4) | +3,7 pe (1,4) | −2,6 pe (−0,8) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 620 / 339 | −2,1 pe (−1,1) | +0,8 pe (0,3) | +1,0 pe (0,5) | +1,5 pe (0,6) | ingen säker effekt |
| Bortafavorit | 643 / 325 | −2,1 pe (−1,1) | +3,8 pe (1,4) | −0,6 pe (−0,4) | +1,0 pe (0,4) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BL.md](../ligor/BL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,0 % mot väntat 55,3 % (36 matcher), inom slumpen. Webben visade 44,4 % från grundmodellen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
