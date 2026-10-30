# J1 League (JP1) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/JP1.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 49,7 % | 46,2 % | +3,6 pe (1,4) | 44,2 % | 96 / 95 | modell (inga odds) |
| 2026/27 | 120 | 49,2 % | 47,5 % | +1,7 pe (0,4) | 44,2 % | 29 / 32 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 310 | 44,5 % | 46,3 % | −0,6 | 32,3 % | 27,6 % | 1,9 |
| 2023 | 306 | 45,4 % | 46,6 % | −0,4 | 25,5 % | 26,8 % | −0,5 |
| 2024 | 380 | 40,8 % | 46,1 % | −2,1 | 27,4 % | 27,3 % | 0,0 |
| 2025 | 380 | 49,5 % | 44,4 % | 2,0 | 25,5 % | 28,4 % | −1,2 |
| 2026/27 | 120 | 54,2 % | 49,1 % | 1,1 | 24,2 % | 26,3 % | −0,5 |

### 2026/27: vad gick fel

- Kryss: 29 av 120 (24,2 %) mot väntat 31,5 (z −0,5).
- Hemmafavoriter vann 40 av 71 (väntat 36,2), bortafavoriter 25 av 49 (väntat 22,8), favoriter ≥ 60 % 15 av 17 (väntat 11,1).
- Lag sämst mot oddsen (poäng mot förväntat): Avispa Fukuoka −8,0 (12 m), Gamba Osaka −4,7 (12 m), Verdy −3,9 (12 m), Chiba −3,8 (12 m).
- Lag bäst mot oddsen: Machida +7,3 (12 m), Vissel Kobe +4,9 (12 m), Kashiwa Reysol +4,7 (12 m), FC Tokyo +4,2 (12 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 26 matcher: grundmodellen rätt 7, oddsen rätt 13.
- Dixon-Coles och oddsen var oense i 29 matcher: DC rätt 6.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 521 / 198 | +0,1 pe (0,1) | +2,8 pe (0,8) | −0,0 pe (−0,0) | +0,1 pe (0,0) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1638 / 639 | +1,2 pe (1,0) | −2,0 pe (−1,1) | −1,8 pe (−1,6) | −0,7 pe (−0,4) | ingen säker effekt |
| Bortafavorit | 1254 / 422 | +2,6 pe (1,9) | −2,0 pe (−0,8) | −1,3 pe (−1,0) | −0,1 pe (−0,1) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/JP1.md](../ligor/JP1.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn träffar över förväntan båda säsongerna (2025/26 z +2,0, 2026/27 z +1,4). Webben visade 50,0 % från grundmodellen, den riktiga träffen är 56,3 %.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
