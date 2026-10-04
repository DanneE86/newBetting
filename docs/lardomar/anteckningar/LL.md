# La Liga (LL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/LL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 54,5 % | 50,6 % | +3,9 pe (1,6) | 48,9 % | 92 / 81 | odds |
| 2026/27 | 69 | 55,1 % | 53,4 % | +1,6 pe (0,3) | 44,9 % | 16 / 15 | odds |

Bedömning 2026/27: inom slumpen (z 0,3). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 380 | 53,4 % | 51,1 % | 0,9 | 23,4 % | 26,8 % | −1,5 |
| 2023/24 | 380 | 55,5 % | 51,7 % | 1,5 | 28,2 % | 26,3 % | 0,8 |
| 2024/25 | 380 | 56,1 % | 52,4 % | 1,5 | 25,5 % | 26,5 % | −0,5 |
| 2025/26 | 380 | 54,7 % | 50,4 % | 1,8 | 24,5 % | 26,4 % | −0,8 |
| 2026/27 | 69 | 56,5 % | 52,8 % | 0,7 | 24,6 % | 24,8 % | −0,0 |

### 2026/27: vad gick fel

- Kryss: 17 av 69 (24,6 %) mot väntat 17,1 (z −0,0).
- Hemmafavoriter vann 26 av 50 (väntat 26,1), bortafavoriter 12 av 19 (väntat 10,4), favoriter ≥ 60 % 16 av 19 (väntat 14,1).
- Lag sämst mot oddsen (poäng mot förväntat): Villarreal −3,7 (7 m), Malaga −3,6 (7 m), Valencia −3,5 (7 m), Celta −3,3 (7 m).
- Lag bäst mot oddsen: Betis +6,0 (7 m), Sevilla +4,8 (7 m), Ath Madrid +3,8 (7 m), Barcelona +3,5 (7 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 5 matcher: grundmodellen rätt 1, oddsen rätt 4.
- Dixon-Coles och oddsen var oense i 7 matcher: DC rätt 2.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Målsnål match (över 2,5 < 45 %) | 969 / 505 | +0,9 pe (0,6) | −0,7 pe (−0,3) | +1,4 pe (1,0) | +0,8 pe (0,4) | ingen säker effekt |
| Omgång 1–5 | 306 / 203 | −2,6 pe (−1,0) | +4,4 pe (1,3) | +2,7 pe (1,1) | −1,0 pe (−0,3) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 799 / 419 | −2,4 pe (−1,4) | +2,7 pe (1,1) | +1,3 pe (0,8) | −0,4 pe (−0,2) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 865 / 477 | −0,2 pe (−0,1) | +3,1 pe (1,4) | +3,1 pe (2,0) | +1,3 pe (0,6) | ingen säker effekt |
| Bortafavorit | 721 / 355 | −0,1 pe (−0,0) | +3,6 pe (1,4) | +0,8 pe (0,5) | +1,7 pe (0,7) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 237 / 139 | −4,3 pe (−1,6) | +12,2 pe (3,4) | +1,5 pe (0,6) | −8,5 pe (−2,8) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/LL.md](../ligor/LL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 55,1 % mot väntat 53,4 %. Webben visade 51,0 % från grundmodellen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
