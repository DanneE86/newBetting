# Eredivisie (ED) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/ED.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 52,9 % | 54,5 % | −1,6 pe (−0,6) | 44,4 % | 80 / 64 | odds |
| 2026/27 | 63 | 54,0 % | 59,4 % | −5,4 pe (−0,9) | 30,2 % | 17 / 12 | odds |

Bedömning 2026/27: inom slumpen (z −0,9). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 57,8 % | 56,8 % | 0,4 | 23,9 % | 22,4 % | 0,6 |
| 2023/24 | 306 | 58,5 % | 58,5 % | 0,0 | 24,8 % | 21,5 % | 1,4 |
| 2024/25 | 306 | 55,2 % | 56,2 % | −0,3 | 25,2 % | 23,1 % | 0,9 |
| 2025/26 | 306 | 53,3 % | 54,1 % | −0,3 | 26,1 % | 22,8 % | 1,4 |
| 2026/27 | 63 | 54,0 % | 58,3 % | −0,7 | 27,0 % | 20,6 % | 1,3 |

### 2026/27: vad gick fel

- Kryss: 17 av 63 (27,0 %) mot väntat 13,0 (z 1,3).
- Hemmafavoriter vann 16 av 40 (väntat 24,0), bortafavoriter 18 av 23 (väntat 12,7), favoriter ≥ 60 % 20 av 29 (väntat 20,7).
- Lag sämst mot oddsen (poäng mot förväntat): Den Haag −4,9 (7 m), Nijmegen −4,3 (7 m), Willem II −3,6 (7 m), Sparta Rotterdam −3,0 (7 m).
- Lag bäst mot oddsen: For Sittard +6,2 (7 m), AZ Alkmaar +4,2 (7 m), Excelsior +2,8 (7 m), Twente +1,8 (7 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 2 matcher: grundmodellen rätt 1, oddsen rätt 0.
- Dixon-Coles och oddsen var oense i 8 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Bortafavorit | 637 / 352 | −1,0 pe (−0,5) | +1,1 pe (0,4) | +1,3 pe (0,8) | +1,1 pe (0,5) | ingen säker effekt |
| Omgång 1–5 | 276 / 187 | −1,2 pe (−0,4) | +2,3 pe (0,7) | +0,6 pe (0,3) | +1,0 pe (0,3) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 676 / 339 | −5,6 pe (−3,0) | −6,7 pe (−2,6) | +1,5 pe (0,9) | +6,5 pe (2,9) | bekräftad: favoriten överskattad |
| Jämn match (favorit < 45 %) | 492 / 284 | −0,6 pe (−0,3) | −4,6 pe (−1,6) | +1,2 pe (0,6) | +4,0 pe (1,5) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 371 / 184 | +0,9 pe (0,4) | +0,8 pe (0,3) | −0,6 pe (−0,3) | +3,0 pe (1,2) | ingen säker effekt |

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
