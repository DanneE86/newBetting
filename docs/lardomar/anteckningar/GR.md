# Super League (GR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/GR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 236 | 50,8 % | 51,7 % | −0,9 pe (−0,3) | 41,1 % | 66 / 50 | modell (inga odds) |
| 2026/27 | 62 | 61,3 % | 50,5 % | +10,8 pe (1,7) | 50,0 % | 12 / 12 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,7). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 240 | 50,8 % | 54,7 % | −1,2 | 30,0 % | 26,3 % | 1,3 |
| 2023/24 | 240 | 57,5 % | 56,2 % | 0,4 | 25,8 % | 24,4 % | 0,5 |
| 2024/25 | 233 | 51,5 % | 54,9 % | −1,1 | 22,3 % | 25,7 % | −1,2 |
| 2025/26 | 236 | 53,0 % | 55,6 % | −0,8 | 28,4 % | 25,1 % | 1,2 |
| 2026/27 | 62 | 64,5 % | 57,5 % | 1,2 | 19,4 % | 24,4 % | −0,9 |

### 2026/27: vad gick fel

- Kryss: 12 av 62 (19,4 %) mot väntat 15,1 (z −0,9).
- Hemmafavoriter vann 28 av 42 (väntat 23,6), bortafavoriter 13 av 20 (väntat 11,9), favoriter ≥ 60 % 24 av 29 (väntat 21,1).
- Lag sämst mot oddsen (poäng mot förväntat): Volos NFC −5,3 (9 m), Atromitos −4,5 (8 m), Asteras Tripolis −4,2 (9 m), Levadeiakos −3,3 (9 m).
- Lag bäst mot oddsen: OFI Crete +6,3 (9 m), Panathinaikos +4,3 (9 m), Aris +2,5 (9 m), Kalamata +2,4 (9 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 4 matcher: grundmodellen rätt 0, oddsen rätt 3.
- Dixon-Coles och oddsen var oense i 9 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 560 / 251 | −5,7 pe (−2,8) | −9,5 pe (−3,1) | +2,9 pe (1,6) | +3,2 pe (1,2) | bekräftad: favoriten överskattad |
| Målsnål match (över 2,5 < 45 %) | 985 / 313 | −4,1 pe (−2,6) | −3,1 pe (−1,1) | +3,9 pe (2,7) | +1,3 pe (0,5) | ingen säker effekt |
| Omgång 1–5 | 221 / 142 | −2,4 pe (−0,7) | −3,8 pe (−1,0) | +4,8 pe (1,6) | +7,7 pe (2,2) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 248 / 169 | +6,6 pe (2,5) | +2,9 pe (0,9) | −3,9 pe (−1,7) | −0,9 pe (−0,3) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 500 / 255 | −5,1 pe (−2,3) | −3,0 pe (−1,0) | +4,4 pe (2,1) | +1,5 pe (0,5) | ingen säker effekt |
| Bortafavorit | 415 / 238 | +2,2 pe (0,9) | +0,1 pe (0,0) | −1,0 pe (−0,5) | −0,3 pe (−0,1) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/GR.md](../ligor/GR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Bekräftat i ligan: oddsrörelser bort från favoriten (favoriten −5,7 och −8,6 procentenheter mot öppningsoddsen, z −2,8 och −3,0). Senaste oddsen ska styra, och det gör de.
- Webben visade 45,0 % (grundmodellen, 20 matcher). Tipsmotorn ligger på 62,9 % (35 matcher) mot väntat 57,5 %.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
