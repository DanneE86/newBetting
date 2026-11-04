# Eredivisie (ED) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/ED.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 52,0 % | 52,4 % | −0,5 pe (−0,2) | 44,4 % | 80 / 67 | modell (inga odds) |
| 2026/27 | 99 | 50,5 % | 48,3 % | +2,2 pe (0,4) | 34,3 % | 27 / 22 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 57,8 % | 56,8 % | 0,4 | 23,9 % | 22,4 % | 0,6 |
| 2023/24 | 306 | 58,5 % | 58,5 % | 0,0 | 24,8 % | 21,5 % | 1,4 |
| 2024/25 | 306 | 55,2 % | 56,2 % | −0,3 | 25,2 % | 23,1 % | 0,9 |
| 2025/26 | 306 | 52,9 % | 54,5 % | −0,6 | 26,1 % | 22,7 % | 1,4 |
| 2026/27 | 99 | 50,5 % | 58,3 % | −1,6 | 27,3 % | 20,9 % | 1,6 |

### 2026/27: vad gick fel

- Kryss: 27 av 99 (27,3 %) mot väntat 20,7 (z 1,6).
- Hemmafavoriter vann 26 av 63 (väntat 37,7), bortafavoriter 24 av 36 (väntat 20,0), favoriter ≥ 60 % 30 av 48 (väntat 34,0).
- Lag sämst mot oddsen (poäng mot förväntat): Nijmegen −7,0 (11 m), Willem II −6,4 (11 m), Den Haag −4,7 (11 m), Utrecht −1,8 (11 m).
- Lag bäst mot oddsen: For Sittard +9,4 (11 m), Cambuur +5,2 (11 m), Heerenveen +2,5 (11 m), Feyenoord +1,4 (11 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 6 matcher: grundmodellen rätt 3, oddsen rätt 2.
- Dixon-Coles och oddsen var oense i 10 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Bortafavorit | 637 / 364 | −1,0 pe (−0,5) | +0,9 pe (0,3) | +1,3 pe (0,8) | +0,9 pe (0,4) | ingen säker effekt |
| Omgång 1–5 | 276 / 187 | −1,2 pe (−0,4) | +2,3 pe (0,7) | +0,6 pe (0,3) | +1,0 pe (0,3) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 676 / 332 | −5,6 pe (−3,0) | −5,7 pe (−2,2) | +1,5 pe (0,9) | +6,3 pe (2,8) | bekräftad: favoriten överskattad |
| Jämn match (favorit < 45 %) | 492 / 292 | −0,6 pe (−0,3) | −4,5 pe (−1,6) | +1,2 pe (0,6) | +3,5 pe (1,4) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 371 / 191 | +0,9 pe (0,4) | −0,5 pe (−0,2) | −0,6 pe (−0,3) | +3,4 pe (1,4) | ingen säker effekt |

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
