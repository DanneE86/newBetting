# Serie A (SA) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SA.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 54,2 % | 52,2 % | +2,0 pe (0,8) | 39,0 % | 97 / 77 | odds |
| 2026/27 | 50 | 58,0 % | 52,1 % | +5,8 pe (0,9) | 44,0 % | 9 / 12 | odds |

Bedömning 2026/27: inom slumpen (z 0,9). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 380 | 51,6 % | 51,8 % | −0,1 | 26,3 % | 26,1 % | 0,1 |
| 2023/24 | 380 | 55,5 % | 51,5 % | 1,6 | 29,5 % | 26,3 % | 1,4 |
| 2024/25 | 380 | 53,9 % | 52,2 % | 0,7 | 28,4 % | 26,7 % | 0,8 |
| 2025/26 | 380 | 54,5 % | 51,9 % | 1,0 | 26,1 % | 27,0 % | −0,4 |
| 2026/27 | 50 | 58,0 % | 51,7 % | 0,9 | 18,0 % | 25,8 % | −1,3 |

### 2026/27: vad gick fel

- Kryss: 9 av 50 (18,0 %) mot väntat 12,9 (z −1,3).
- Hemmafavoriter vann 17 av 28 (väntat 15,3), bortafavoriter 12 av 22 (väntat 10,5), favoriter ≥ 60 % 11 av 12 (väntat 8,5).
- Lag sämst mot oddsen (poäng mot förväntat): Venezia −6,1 (5 m), Genoa −4,9 (5 m), Bologna −4,8 (5 m), Fiorentina −3,0 (5 m).
- Lag bäst mot oddsen: Cagliari +6,5 (5 m), Lazio +6,1 (5 m), Frosinone +5,2 (5 m), Roma +3,6 (5 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 6 matcher: grundmodellen rätt 2, oddsen rätt 1.
- Dixon-Coles och oddsen var oense i 2 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Storfavorit (≥ 70 %) | 343 / 109 | +2,4 pe (1,1) | +1,2 pe (0,3) | −1,9 pe (−1,0) | +1,3 pe (0,4) | ingen säker effekt |
| Omgång 1–5 | 304 / 200 | +4,5 pe (1,7) | +0,1 pe (0,0) | −1,2 pe (−0,5) | +2,1 pe (0,7) | ingen säker effekt |
| Bortafavorit | 881 / 440 | +4,0 pe (2,4) | +6,7 pe (2,9) | +0,1 pe (0,1) | −2,2 pe (−1,0) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 840 / 413 | −0,8 pe (−0,5) | +0,7 pe (0,3) | +0,3 pe (0,2) | +0,2 pe (0,1) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 699 / 436 | +0,5 pe (0,3) | +0,7 pe (0,3) | +0,9 pe (0,5) | +2,7 pe (1,2) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 252 / 463 | +2,6 pe (0,8) | +0,5 pe (0,2) | −1,4 pe (−0,5) | +3,2 pe (1,5) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SA.md](../ligor/SA.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 58,0 % mot väntat 52,1 %. Liga-kalibreringen av öppningsodds (hemmalag överprissatta) gäller fortfarande, se ligafilen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
