# LaLiga 2 (LL2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/LL2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 462 | 49,4 % | 47,5 % | +1,8 pe (0,8) | 44,8 % | 114 / 120 | odds |
| 2026/27 | 76 | 47,4 % | 47,7 % | −0,3 pe (−0,1) | 43,4 % | 16 / 24 | odds |

Bedömning 2026/27: inom slumpen (z −0,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 462 | 47,0 % | 45,5 % | 0,7 | 33,3 % | 30,8 % | 1,2 |
| 2023/24 | 462 | 46,8 % | 45,6 % | 0,5 | 30,1 % | 30,3 % | −0,1 |
| 2024/25 | 462 | 49,8 % | 47,0 % | 1,2 | 28,1 % | 29,2 % | −0,5 |
| 2025/26 | 462 | 49,1 % | 47,0 % | 0,9 | 24,9 % | 27,9 % | −1,5 |
| 2026/27 | 76 | 47,4 % | 47,0 % | 0,1 | 21,1 % | 27,6 % | −1,3 |

### 2026/27: vad gick fel

- Kryss: 16 av 76 (21,1 %) mot väntat 21,0 (z −1,3).
- Hemmafavoriter vann 28 av 60 (väntat 28,9), bortafavoriter 8 av 16 (väntat 6,8), favoriter ≥ 60 % 6 av 6 (väntat 3,9).
- Lag sämst mot oddsen (poäng mot förväntat): Albacete −7,2 (7 m), Andorra −5,0 (7 m), Cadiz −4,2 (7 m), Ceuta −3,6 (7 m).
- Lag bäst mot oddsen: Eibar +6,9 (7 m), Castellon +5,0 (6 m), Burgos +4,3 (7 m), Leganes +3,5 (6 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 12 matcher: grundmodellen rätt 4, oddsen rätt 5.
- Dixon-Coles och oddsen var oense i 11 matcher: DC rätt 4.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 1205 / 522 | −2,9 pe (−2,0) | −1,0 pe (−0,5) | +0,7 pe (0,5) | −0,3 pe (−0,2) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1485 / 730 | −0,6 pe (−0,4) | +2,3 pe (1,3) | +2,3 pe (1,9) | −1,0 pe (−0,6) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 2284 / 885 | −0,3 pe (−0,3) | +1,0 pe (0,6) | +1,6 pe (1,7) | −0,3 pe (−0,2) | ingen säker effekt |
| Omgång 1–5 | 329 / 218 | +1,4 pe (0,5) | −2,2 pe (−0,7) | −2,0 pe (−0,8) | −1,1 pe (−0,4) | ingen säker effekt |
| Bortafavorit | 510 / 259 | −2,3 pe (−1,1) | +3,2 pe (1,0) | +1,7 pe (0,8) | −3,8 pe (−1,3) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/LL2.md](../ligor/LL2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 47,4 % mot väntat 47,7 %. Inget att rätta.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
