# Liga MX (MX) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/MX.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 336 | 53,3 % | 50,7 % | +2,5 pe (0,9) | 47,0 % | 85 / 72 | modell (inga odds) |
| 2026/27 | 125 | 39,2 % | 47,5 % | −8,3 pe (−1,9) | 36,8 % | 34 / 42 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −1,9). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 342 | 50,9 % | 48,6 % | 0,9 | 27,8 % | 26,5 % | 0,6 |
| 2023/24 | 340 | 51,8 % | 50,0 % | 0,7 | 26,2 % | 25,3 % | 0,4 |
| 2024/25 | 340 | 54,1 % | 51,3 % | 1,1 | 23,8 % | 25,3 % | −0,6 |
| 2025/26 | 333 | 52,9 % | 52,3 % | 0,2 | 24,9 % | 24,6 % | 0,1 |
| 2026/27 | 125 | 44,0 % | 51,3 % | −1,7 | 27,2 % | 24,6 % | 0,7 |

### 2026/27: vad gick fel

- Kryss: 34 av 125 (27,2 %) mot väntat 30,7 (z 0,7).
- Hemmafavoriter vann 35 av 80 (väntat 43,0), bortafavoriter 20 av 45 (väntat 21,1), favoriter ≥ 60 % 19 av 29 (väntat 19,6).
- Lag sämst mot oddsen (poäng mot förväntat): Juarez −8,2 (14 m), Tigres UANL −7,5 (14 m), Necaxa −6,3 (14 m), Toluca −5,0 (14 m).
- Lag bäst mot oddsen: Atlas +6,0 (14 m), Queretaro +5,8 (13 m), Santos Laguna +4,5 (14 m), Atl. San Luis +3,9 (14 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 21 matcher: grundmodellen rätt 7, oddsen rätt 8.
- Dixon-Coles och oddsen var oense i 15 matcher: DC rätt 4.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 1763 / 401 | −0,3 pe (−0,2) | −1,4 pe (−0,6) | +0,2 pe (0,2) | +0,0 pe (0,0) | ingen säker effekt |
| Bortafavorit | 874 / 368 | +1,0 pe (0,6) | −2,8 pe (−1,1) | +0,7 pe (0,4) | +4,9 pe (2,1) | ingen säker effekt |
| Omgång 1–5 | 506 / 187 | −1,3 pe (−0,6) | −1,6 pe (−0,5) | +1,6 pe (0,8) | +0,9 pe (0,3) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 62 / 76 | +4,1 pe (0,7) | +7,1 pe (1,4) | +0,5 pe (0,1) | −1,4 pe (−0,3) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/MX.md](../ligor/MX.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 45,6 % mot väntat 52,1 % (z −1,2, 79 matcher), inom slumpen. Liga MX har korta säsonger (Apertura/Clausura), så varje säsongsstart har få matcher.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
