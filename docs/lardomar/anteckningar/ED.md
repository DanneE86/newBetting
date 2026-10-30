# Eredivisie (ED) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/ED.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 52,0 % | 52,4 % | −0,5 pe (−0,2) | 44,4 % | 80 / 67 | modell (inga odds) |
| 2026/27 | 90 | 48,9 % | 48,4 % | +0,5 pe (0,1) | 31,1 % | 26 / 20 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 57,8 % | 56,8 % | 0,4 | 23,9 % | 22,4 % | 0,6 |
| 2023/24 | 306 | 58,5 % | 58,5 % | 0,0 | 24,8 % | 21,5 % | 1,4 |
| 2024/25 | 306 | 55,2 % | 56,2 % | −0,3 | 25,2 % | 23,1 % | 0,9 |
| 2025/26 | 306 | 52,9 % | 54,5 % | −0,6 | 26,1 % | 22,7 % | 1,4 |
| 2026/27 | 90 | 50,0 % | 58,5 % | −1,7 | 28,9 % | 20,9 % | 1,9 |

### 2026/27: vad gick fel

- Kryss: 26 av 90 (28,9 %) mot väntat 18,8 (z 1,9).
- Hemmafavoriter vann 22 av 57 (väntat 34,1), bortafavoriter 23 av 33 (väntat 18,6), favoriter ≥ 60 % 29 av 46 (väntat 32,3).
- Lag sämst mot oddsen (poäng mot förväntat): Willem II −6,2 (10 m), Nijmegen −5,8 (10 m), Den Haag −3,5 (10 m), Telstar −3,4 (10 m).
- Lag bäst mot oddsen: For Sittard +8,7 (10 m), Cambuur +3,5 (10 m), Feyenoord +3,0 (10 m), Groningen +1,9 (10 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 5 matcher: grundmodellen rätt 2, oddsen rätt 2.
- Dixon-Coles och oddsen var oense i 9 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Bortafavorit | 637 / 361 | −1,0 pe (−0,5) | +1,0 pe (0,4) | +1,3 pe (0,8) | +1,1 pe (0,5) | ingen säker effekt |
| Omgång 1–5 | 276 / 187 | −1,2 pe (−0,4) | +2,3 pe (0,7) | +0,6 pe (0,3) | +1,0 pe (0,3) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 676 / 328 | −5,6 pe (−3,0) | −6,1 pe (−2,3) | +1,5 pe (0,9) | +6,7 pe (2,9) | bekräftad: favoriten överskattad |
| Jämn match (favorit < 45 %) | 492 / 289 | −0,6 pe (−0,3) | −4,5 pe (−1,6) | +1,2 pe (0,6) | +3,8 pe (1,5) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 371 / 189 | +0,9 pe (0,4) | −0,1 pe (−0,0) | −0,6 pe (−0,3) | +3,0 pe (1,2) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/ED.md](../ligor/ED.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Bekräftat i ligan: när oddsen rör sig bort från favoriten efter öppning vinner favoriten 5,6–6,7 procentenheter mer sällan än öppningsoddsen sa (z −3,0 och −2,6). Tipsen ska bygga på de senaste oddsen, och det gör de.
- Tipsens träff 2026/27: 54,0 % mot väntat 59,4 % (z −0,9), inom slumpen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
