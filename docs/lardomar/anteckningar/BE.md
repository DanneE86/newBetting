# Pro League (BE) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BE.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 311 | 44,7 % | 48,6 % | −3,9 pe (−1,4) | 40,5 % | 78 / 94 | modell (inga odds) |
| 2026/27 | 80 | 61,3 % | 47,3 % | +13,9 pe (2,5) | 51,2 % | 15 / 16 | modell (inga odds) |

Bedömning 2026/27: bättre än tipsens procent lovade (z 2,5). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 55,2 % | 52,0 % | 1,2 | 22,2 % | 24,5 % | −0,9 |
| 2023/24 | 312 | 53,2 % | 52,5 % | 0,3 | 26,0 % | 24,1 % | 0,8 |
| 2024/25 | 312 | 53,2 % | 50,9 % | 0,8 | 28,8 % | 25,2 % | 1,5 |
| 2025/26 | 311 | 46,3 % | 50,0 % | −1,3 | 25,4 % | 25,6 % | −0,1 |
| 2026/27 | 80 | 62,5 % | 51,9 % | 2,0 | 18,8 % | 24,6 % | −1,2 |

### 2026/27: vad gick fel

- Kryss: 15 av 80 (18,8 %) mot väntat 19,7 (z −1,2).
- Hemmafavoriter vann 31 av 46 (väntat 25,8), bortafavoriter 19 av 34 (väntat 15,7), favoriter ≥ 60 % 17 av 20 (väntat 14,1).
- Lag sämst mot oddsen (poäng mot förväntat): Cercle Brugge −6,7 (9 m), St Truiden −5,4 (9 m), Kortrijk −4,8 (8 m), Oud-Heverlee Leuven −3,9 (9 m).
- Lag bäst mot oddsen: Gent +11,7 (9 m), Charleroi +6,3 (9 m), Lommel SK +4,5 (9 m), St. Gilloise +4,0 (9 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 14 matcher: grundmodellen rätt 4, oddsen rätt 6.
- Dixon-Coles och oddsen var oense i 12 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 642 / 356 | −4,8 pe (−2,5) | −4,4 pe (−1,7) | +0,7 pe (0,4) | +5,7 pe (2,5) | ingen säker effekt |
| Bortafavorit | 573 / 355 | +2,8 pe (1,4) | +1,5 pe (0,6) | −3,2 pe (−1,8) | −0,3 pe (−0,1) | ingen säker effekt |
| Omgång 1–5 | 258 / 170 | −2,9 pe (−0,9) | +3,1 pe (0,8) | −3,5 pe (−1,3) | +0,7 pe (0,2) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 529 / 375 | −1,7 pe (−0,8) | −0,6 pe (−0,2) | −0,2 pe (−0,1) | +3,9 pe (1,7) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 146 / 67 | +1,0 pe (0,3) | +3,3 pe (0,6) | −1,5 pe (−0,5) | −0,9 pe (−0,2) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BE.md](../ligor/BE.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
