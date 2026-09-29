# Serie B (SB) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SB.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 49,7 % | 46,8 % | +3,0 pe (1,2) | 45,0 % | 118 / 73 | odds |
| 2026/27 | 50 | 46,0 % | 46,3 % | −0,3 pe (−0,0) | 42,0 % | 13 / 14 | odds |

Bedömning 2026/27: inom slumpen (z −0,0). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 380 | 42,6 % | 44,5 % | −0,8 | 32,1 % | 29,9 % | 1,0 |
| 2023/24 | 380 | 45,5 % | 45,0 % | 0,2 | 32,1 % | 29,8 % | 1,0 |
| 2024/25 | 380 | 43,4 % | 44,4 % | −0,4 | 33,9 % | 30,6 % | 1,4 |
| 2025/26 | 380 | 49,2 % | 46,2 % | 1,2 | 31,1 % | 28,6 % | 1,1 |
| 2026/27 | 50 | 46,0 % | 45,8 % | 0,0 | 26,0 % | 28,3 % | −0,4 |

### 2026/27: vad gick fel

- Kryss: 13 av 50 (26,0 %) mot väntat 14,1 (z −0,4).
- Hemmafavoriter vann 19 av 38 (väntat 18,1), bortafavoriter 4 av 12 (väntat 4,8), favoriter ≥ 60 % 3 av 3 (väntat 1,9).
- Lag sämst mot oddsen (poäng mot förväntat): Carrarese −4,8 (5 m), Catanzaro −3,2 (5 m), Sampdoria −2,8 (5 m), Cremonese −2,8 (5 m).
- Lag bäst mot oddsen: Sudtirol +4,7 (5 m), Mantova +3,5 (5 m), Palermo +3,5 (5 m), Ascoli +3,2 (5 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 7 matcher: grundmodellen rätt 1, oddsen rätt 2.
- Dixon-Coles och oddsen var oense i 11 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Målsnål match (över 2,5 < 45 %) | 1178 / 699 | −1,1 pe (−0,7) | −3,8 pe (−2,0) | +4,1 pe (3,1) | +5,3 pe (3,0) | bekräftad: kryss underskattat |
| Omgång 1–5 | 306 / 205 | +3,4 pe (1,2) | −4,1 pe (−1,2) | +1,4 pe (0,5) | +2,8 pe (0,9) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 985 / 457 | −5,6 pe (−3,5) | −5,2 pe (−2,3) | +5,7 pe (3,9) | +4,4 pe (2,1) | bekräftad: favoriten överskattad |
| Jämn match (favorit < 45 %) | 1295 / 680 | −0,8 pe (−0,6) | −3,6 pe (−1,9) | +4,3 pe (3,4) | +5,9 pe (3,3) | bekräftad: kryss underskattat |
| Bortafavorit | 493 / 296 | +1,0 pe (0,4) | −0,0 pe (−0,0) | +3,4 pe (1,6) | +3,5 pe (1,3) | ingen säker effekt |
| Uppflyttad favorit | 66 / 32 | −4,4 pe (−0,7) | −3,4 pe (−0,4) | +2,6 pe (0,5) | +10,4 pe (1,3) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SB.md](../ligor/SB.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Bekräftat i ligan (träning före 2023/24, kontroll 2023/24–): kryss är underprissatt i målsnåla matcher (över 2,5 < 45 %, z 3,1 och 3,0) och i jämna matcher (favorit < 45 %, z 3,4 och 3,3). Det används redan i liga-kalibreringen av Oddset-oddsen (kryssparametern) och syns i omdömet Värde på kryss. En kryssregel för själva tipset prövades och gav ingen högre träff (tröskel 0 valdes på träningen).
- Oddsrörelser bort från favoriten är bekräftade (favoriten −5,6 och −5,2 procentenheter, z −3,5 och −2,3). Det fångas genom att tipset bygger på de senaste oddsen.
- Tipsens träff 2026/27: 46,0 % mot väntat 46,3 % (z 0,0).
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
