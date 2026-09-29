# Liga MX (MX) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/MX.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 336 | 53,0 % | 52,2 % | +0,8 pe (0,3) | 47,0 % | 84 / 74 | odds |
| 2026/27 | 79 | 45,6 % | 52,1 % | −6,6 pe (−1,2) | 40,5 % | 19 / 24 | odds |

Bedömning 2026/27: inom slumpen (z −1,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 342 | 50,9 % | 48,6 % | 0,9 | 27,8 % | 26,5 % | 0,6 |
| 2023/24 | 340 | 51,8 % | 50,0 % | 0,7 | 26,2 % | 25,3 % | 0,4 |
| 2024/25 | 340 | 54,1 % | 51,3 % | 1,1 | 23,8 % | 25,3 % | −0,6 |
| 2025/26 | 333 | 52,9 % | 51,8 % | 0,4 | 24,9 % | 24,7 % | 0,1 |
| 2026/27 | 79 | 45,6 % | 51,2 % | −1,0 | 24,1 % | 24,7 % | −0,1 |

### 2026/27: vad gick fel

- Kryss: 19 av 79 (24,1 %) mot väntat 19,5 (z −0,1).
- Hemmafavoriter vann 23 av 48 (väntat 25,9), bortafavoriter 13 av 31 (väntat 14,6), favoriter ≥ 60 % 14 av 19 (väntat 12,4).
- Lag sämst mot oddsen (poäng mot förväntat): Tigres UANL −8,5 (9 m), Juarez −6,0 (9 m), Necaxa −2,6 (9 m), Pachuca −2,5 (9 m).
- Lag bäst mot oddsen: Queretaro +5,5 (8 m), Puebla +5,4 (9 m), Club Tijuana +3,8 (8 m), Club America +2,7 (8 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 12 matcher: grundmodellen rätt 4, oddsen rätt 3.
- Dixon-Coles och oddsen var oense i 10 matcher: DC rätt 2.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 1766 / 387 | −0,2 pe (−0,2) | −1,0 pe (−0,4) | +0,2 pe (0,1) | +0,3 pe (0,1) | ingen säker effekt |
| Bortafavorit | 879 / 353 | +1,0 pe (0,6) | −2,8 pe (−1,1) | +0,5 pe (0,3) | +4,5 pe (1,9) | ingen säker effekt |
| Omgång 1–5 | 505 / 187 | −1,2 pe (−0,6) | −1,4 pe (−0,4) | +1,5 pe (0,7) | +0,8 pe (0,3) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 62 / 63 | +4,1 pe (0,7) | +6,6 pe (1,2) | +0,5 pe (0,1) | −1,7 pe (−0,4) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/MX.md](../ligor/MX.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 45,6 % mot väntat 52,1 % (z −1,2, 79 matcher), inom slumpen. Liga MX har korta säsonger (Apertura/Clausura), så varje säsongsstart har få matcher.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
