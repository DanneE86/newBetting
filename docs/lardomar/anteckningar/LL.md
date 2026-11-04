# La Liga (LL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/LL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 53,2 % | 51,3 % | +1,9 pe (0,8) | 48,9 % | 93 / 85 | modell (inga odds) |
| 2026/27 | 109 | 56,0 % | 48,6 % | +7,3 pe (1,6) | 45,9 % | 27 / 21 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 380 | 53,4 % | 51,1 % | 0,9 | 23,4 % | 26,8 % | −1,5 |
| 2023/24 | 380 | 55,5 % | 51,7 % | 1,5 | 28,2 % | 26,3 % | 0,8 |
| 2024/25 | 380 | 56,1 % | 52,4 % | 1,5 | 25,5 % | 26,5 % | −0,5 |
| 2025/26 | 380 | 54,5 % | 50,6 % | 1,6 | 24,5 % | 26,4 % | −0,9 |
| 2026/27 | 109 | 56,9 % | 53,9 % | 0,7 | 24,8 % | 24,6 % | 0,0 |

### 2026/27: vad gick fel

- Kryss: 27 av 109 (24,8 %) mot väntat 26,8 (z 0,0).
- Hemmafavoriter vann 42 av 76 (väntat 41,4), bortafavoriter 19 av 33 (väntat 17,3), favoriter ≥ 60 % 28 av 34 (väntat 25,2).
- Lag sämst mot oddsen (poäng mot förväntat): Villarreal −6,5 (11 m), Malaga −5,2 (11 m), Celta −4,0 (11 m), Valencia −3,0 (11 m).
- Lag bäst mot oddsen: Ath Madrid +7,4 (11 m), Betis +6,5 (11 m), Sevilla +3,9 (11 m), Sociedad +3,1 (11 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 14 matcher: grundmodellen rätt 4, oddsen rätt 6.
- Dixon-Coles och oddsen var oense i 11 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Målsnål match (över 2,5 < 45 %) | 969 / 511 | +0,9 pe (0,6) | −0,5 pe (−0,2) | +1,4 pe (1,0) | +0,6 pe (0,3) | ingen säker effekt |
| Omgång 1–5 | 306 / 203 | −2,6 pe (−1,0) | +4,4 pe (1,3) | +2,7 pe (1,1) | −1,0 pe (−0,3) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 799 / 398 | −2,4 pe (−1,4) | +2,7 pe (1,1) | +1,3 pe (0,8) | −0,1 pe (−0,0) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 865 / 494 | −0,2 pe (−0,1) | +3,0 pe (1,4) | +3,1 pe (2,0) | +1,7 pe (0,8) | ingen säker effekt |
| Bortafavorit | 721 / 370 | −0,1 pe (−0,0) | +3,4 pe (1,3) | +0,8 pe (0,5) | +2,2 pe (0,9) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 237 / 145 | −4,3 pe (−1,6) | +12,6 pe (3,6) | +1,5 pe (0,6) | −8,7 pe (−2,9) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/LL.md](../ligor/LL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 55,1 % mot väntat 53,4 %. Webben visade 51,0 % från grundmodellen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
