# Primeira Liga (PT) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/PT.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 56,2 % | 55,2 % | +1,1 pe (0,4) | 41,2 % | 82 / 52 | modell (inga odds) |
| 2026/27 | 90 | 56,7 % | 50,9 % | +5,7 pe (1,1) | 40,0 % | 19 / 20 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 63,1 % | 54,2 % | 3,3 | 18,0 % | 25,0 % | −2,9 |
| 2023/24 | 306 | 57,5 % | 54,6 % | 1,1 | 24,5 % | 24,0 % | 0,2 |
| 2024/25 | 306 | 55,6 % | 54,6 % | 0,3 | 25,8 % | 25,1 % | 0,3 |
| 2025/26 | 306 | 57,5 % | 55,9 % | 0,6 | 27,1 % | 24,4 % | 1,1 |
| 2026/27 | 90 | 53,3 % | 56,7 % | −0,7 | 21,1 % | 24,1 % | −0,7 |

### 2026/27: vad gick fel

- Kryss: 19 av 90 (21,1 %) mot väntat 21,7 (z −0,7).
- Hemmafavoriter vann 28 av 54 (väntat 31,2), bortafavoriter 20 av 36 (väntat 19,7), favoriter ≥ 60 % 24 av 34 (väntat 25,7).
- Lag sämst mot oddsen (poäng mot förväntat): Estoril −9,8 (10 m), Guimaraes −6,0 (10 m), Sp Braga −4,9 (10 m), Famalicao −4,7 (10 m).
- Lag bäst mot oddsen: Academico Viseu +10,2 (10 m), Arouca +7,6 (10 m), Santa Clara +7,5 (10 m), Porto +6,5 (10 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 14 matcher: grundmodellen rätt 5, oddsen rätt 4.
- Dixon-Coles och oddsen var oense i 9 matcher: DC rätt 5.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 695 / 336 | +2,2 pe (1,2) | −4,2 pe (−1,6) | −2,1 pe (−1,3) | +3,5 pe (1,5) | ingen säker effekt |
| Bortafavorit | 532 / 334 | +6,0 pe (2,9) | +4,2 pe (1,6) | −5,0 pe (−2,7) | +1,0 pe (0,4) | ingen säker effekt |
| Omgång 1–5 | 270 / 182 | +1,2 pe (0,4) | +4,6 pe (1,3) | −0,3 pe (−0,1) | −1,8 pe (−0,6) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 726 / 376 | +2,2 pe (1,2) | +3,2 pe (1,3) | −1,2 pe (−0,7) | +2,1 pe (0,9) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 806 / 353 | −0,5 pe (−0,3) | −1,4 pe (−0,5) | −0,7 pe (−0,5) | +4,7 pe (1,9) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 350 / 224 | +8,7 pe (4,0) | +6,9 pe (2,5) | −7,4 pe (−3,9) | −3,6 pe (−1,5) | bekräftad: favoriten underskattad |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/PT.md](../ligor/PT.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Bekräftat i ligan: storfavoriter (≥ 70 %) vinner oftare än öppningsoddsen säger (+8,7 och +6,9 procentenheter, z 4,0 och 2,5). Det ändrar inte vilket tecken som tippas, men omdömet Värde på storfavoriter kan vara för försiktigt. Oddstaket 5 och EV-gränsen gäller fortfarande.
- Tipsens träff 2026/27: 46,8 % mot väntat 57,2 % (z −1,8), inom slumpen men nära gränsen. Följ upp efter fler omgångar.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
