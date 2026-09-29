# League Two (EL2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/EL2.csv`.

### Tipsens träff (1X2, samma motor som live)

Ligan finns inte i webben och tippas inte. Oddsfavoritens facit nedan visar hur tipsen skulle ha gått (tipsen följer oddsen i ligor med odds).

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 552 | 45,7 % | 45,6 % | 0,0 | 29,0 % | 28,5 % | 0,3 |
| 2023/24 | 552 | 47,5 % | 47,8 % | −0,1 | 23,7 % | 26,0 % | −1,2 |
| 2024/25 | 552 | 45,3 % | 46,8 % | −0,7 | 28,6 % | 27,0 % | 0,8 |
| 2025/26 | 552 | 51,1 % | 46,7 % | 2,1 | 24,8 % | 26,9 % | −1,1 |
| 2026/27 | 94 | 42,6 % | 46,3 % | −0,7 | 36,2 % | 26,4 % | 2,1 |

### 2026/27: vad gick fel

- Kryss: 34 av 94 (36,2 %) mot väntat 24,8 (z 2,1).
- Hemmafavoriter vann 35 av 65 (väntat 31,1), bortafavoriter 5 av 29 (väntat 12,3), favoriter ≥ 60 % 4 av 6 (väntat 3,8).
- Lag sämst mot oddsen (poäng mot förväntat): Oldham −5,2 (8 m), Port Vale −5,0 (7 m), Northampton −4,7 (7 m), Exeter −3,4 (8 m).
- Lag bäst mot oddsen: Cheltenham +6,0 (8 m), Gillingham +3,2 (8 m), Barnet +3,1 (7 m), Walsall +3,0 (8 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 365 / 244 | +0,8 pe (0,3) | +1,1 pe (0,3) | +1,6 pe (0,7) | +0,3 pe (0,1) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1864 / 843 | +0,4 pe (0,4) | +1,0 pe (0,6) | +0,5 pe (0,5) | −1,3 pe (−0,8) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 1242 / 623 | −2,1 pe (−1,5) | −2,8 pe (−1,4) | +0,4 pe (0,3) | −0,8 pe (−0,4) | ingen säker effekt |
| Bortafavorit | 923 / 501 | +0,9 pe (0,6) | −1,0 pe (−0,4) | −2,3 pe (−1,5) | −0,7 pe (−0,4) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 1164 / 296 | +0,2 pe (0,1) | −1,2 pe (−0,4) | +0,2 pe (0,1) | +1,6 pe (0,6) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/EL2.md](../ligor/EL2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- League Two finns inte i webben och tippas inte, men matchfilen finns. Oddsfavoriten 2026/27 vann 42,6 % mot väntat 46,3 % (senaste oddsen), med 34 kryss mot väntat 24,8 (z 2,1). Tidigare säsonger var favoriterna rätt prissatta (2025/26 +4,2 procentenheter). Läggs ligan till i webben ska tipsen styras av oddsen som i övriga England.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
