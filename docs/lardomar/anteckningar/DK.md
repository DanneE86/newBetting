# Superligaen (DK) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/DK.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 192 | 53,1 % | 51,4 % | +1,7 pe (0,5) | 41,7 % | 45 / 45 | odds |
| 2026/27 | 54 | 50,0 % | 54,1 % | −4,1 pe (−0,6) | 44,4 % | 15 / 12 | odds |

Bedömning 2026/27: inom slumpen (z −0,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 193 | 45,6 % | 48,1 % | −0,7 | 28,0 % | 26,0 % | 0,6 |
| 2023/24 | 193 | 51,3 % | 51,5 % | −0,0 | 25,4 % | 25,1 % | 0,1 |
| 2024/25 | 192 | 50,0 % | 50,3 % | −0,1 | 28,1 % | 24,8 % | 1,1 |
| 2025/26 | 192 | 53,1 % | 50,9 % | 0,6 | 23,4 % | 24,1 % | −0,2 |
| 2026/27 | 54 | 50,0 % | 52,8 % | −0,4 | 27,8 % | 23,7 % | 0,7 |

### 2026/27: vad gick fel

- Kryss: 15 av 54 (27,8 %) mot väntat 12,8 (z 0,7).
- Hemmafavoriter vann 18 av 31 (väntat 17,0), bortafavoriter 9 av 23 (väntat 11,6), favoriter ≥ 60 % 10 av 12 (väntat 8,1).
- Lag sämst mot oddsen (poäng mot förväntat): Aarhus −8,5 (9 m), Lyngby −5,1 (9 m), Sonderjyske −3,5 (9 m), Odense −2,0 (9 m).
- Lag bäst mot oddsen: FC Copenhagen +6,7 (9 m), Horsens +3,2 (9 m), Viborg +2,8 (9 m), Silkeborg +2,8 (9 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 12 matcher: grundmodellen rätt 5, oddsen rätt 4.
- Dixon-Coles och oddsen var oense i 2 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 1027 / 217 | −1,0 pe (−0,6) | −0,2 pe (−0,1) | +1,0 pe (0,7) | −2,0 pe (−0,7) | ingen säker effekt |
| Omgång 1–5 | 363 / 122 | −3,0 pe (−1,2) | +4,7 pe (1,1) | +2,2 pe (0,9) | −2,8 pe (−0,7) | ingen säker effekt |
| Bortafavorit | 824 / 236 | −0,4 pe (−0,2) | +0,3 pe (0,1) | +0,6 pe (0,4) | +0,4 pe (0,1) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 96 / 32 | +3,8 pe (0,8) | −5,1 pe (−0,7) | −2,0 pe (−0,5) | +5,7 pe (0,9) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/DK.md](../ligor/DK.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,0 % mot väntat 54,1 % (54 matcher), inom slumpen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
