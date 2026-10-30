# Superligaen (DK) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/DK.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 192 | 53,1 % | 50,0 % | +3,1 pe (0,9) | 41,7 % | 45 / 45 | modell (inga odds) |
| 2026/27 | 72 | 54,2 % | 47,1 % | +7,1 pe (1,2) | 44,4 % | 22 / 11 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 193 | 45,6 % | 48,1 % | −0,7 | 28,0 % | 26,0 % | 0,6 |
| 2023/24 | 193 | 51,3 % | 51,5 % | −0,0 | 25,4 % | 25,1 % | 0,1 |
| 2024/25 | 192 | 50,0 % | 50,3 % | −0,1 | 28,1 % | 24,8 % | 1,1 |
| 2025/26 | 192 | 53,1 % | 51,4 % | 0,5 | 23,4 % | 24,1 % | −0,2 |
| 2026/27 | 72 | 51,4 % | 53,1 % | −0,3 | 30,6 % | 23,6 % | 1,4 |

### 2026/27: vad gick fel

- Kryss: 22 av 72 (30,6 %) mot väntat 17,0 (z 1,4).
- Hemmafavoriter vann 25 av 42 (väntat 23,1), bortafavoriter 12 av 30 (väntat 15,2), favoriter ≥ 60 % 13 av 18 (väntat 12,2).
- Lag sämst mot oddsen (poäng mot förväntat): Lyngby −6,6 (12 m), Aarhus −5,7 (12 m), Sonderjyske −3,9 (12 m), Randers FC −3,2 (12 m).
- Lag bäst mot oddsen: Midtjylland +5,0 (12 m), Horsens +4,8 (12 m), FC Copenhagen +2,7 (12 m), Silkeborg +1,7 (12 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 17 matcher: grundmodellen rätt 6, oddsen rätt 7.
- Dixon-Coles och oddsen var oense i 5 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 1027 / 224 | −1,0 pe (−0,6) | +1,2 pe (0,4) | +1,0 pe (0,7) | −2,3 pe (−0,8) | ingen säker effekt |
| Omgång 1–5 | 363 / 122 | −3,0 pe (−1,2) | +4,3 pe (1,0) | +2,2 pe (0,9) | −2,7 pe (−0,7) | ingen säker effekt |
| Bortafavorit | 824 / 243 | −0,4 pe (−0,2) | −0,1 pe (−0,0) | +0,6 pe (0,4) | +1,0 pe (0,3) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 96 / 36 | +3,8 pe (0,8) | −4,7 pe (−0,6) | −2,0 pe (−0,5) | +6,2 pe (1,0) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/DK.md](../ligor/DK.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,0 % mot väntat 54,1 % (54 matcher), inom slumpen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
