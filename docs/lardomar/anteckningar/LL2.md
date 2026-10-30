# LaLiga 2 (LL2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/LL2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 462 | 44,6 % | 45,8 % | −1,2 pe (−0,5) | 44,8 % | 115 / 141 | modell (inga odds) |
| 2026/27 | 121 | 51,2 % | 45,1 % | +6,1 pe (1,4) | 46,3 % | 26 / 33 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 462 | 47,0 % | 45,5 % | 0,7 | 33,3 % | 30,8 % | 1,2 |
| 2023/24 | 462 | 46,8 % | 45,6 % | 0,5 | 30,1 % | 30,3 % | −0,1 |
| 2024/25 | 462 | 49,8 % | 47,0 % | 1,2 | 28,1 % | 29,2 % | −0,5 |
| 2025/26 | 462 | 49,4 % | 47,5 % | 0,8 | 24,9 % | 28,1 % | −1,5 |
| 2026/27 | 121 | 50,4 % | 47,3 % | 0,7 | 21,5 % | 27,7 % | −1,5 |

### 2026/27: vad gick fel

- Kryss: 26 av 121 (21,5 %) mot väntat 33,6 (z −1,5).
- Hemmafavoriter vann 48 av 94 (väntat 45,8), bortafavoriter 13 av 27 (väntat 11,4), favoriter ≥ 60 % 10 av 12 (väntat 7,9).
- Lag sämst mot oddsen (poäng mot förväntat): Albacete −9,0 (11 m), Ceuta −6,4 (11 m), Andorra −5,8 (11 m), Sociedad B −4,1 (11 m).
- Lag bäst mot oddsen: Burgos +5,9 (11 m), Eibar +5,9 (11 m), Almeria +5,6 (11 m), Granada +5,6 (11 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 20 matcher: grundmodellen rätt 6, oddsen rätt 9.
- Dixon-Coles och oddsen var oense i 14 matcher: DC rätt 7.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 1205 / 514 | −2,9 pe (−2,0) | −1,5 pe (−0,7) | +0,7 pe (0,5) | +0,1 pe (0,0) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1485 / 755 | −0,6 pe (−0,4) | +2,5 pe (1,4) | +2,3 pe (1,9) | −1,0 pe (−0,6) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 2284 / 894 | −0,3 pe (−0,3) | +0,9 pe (0,5) | +1,6 pe (1,7) | −0,2 pe (−0,1) | ingen säker effekt |
| Omgång 1–5 | 329 / 218 | +1,4 pe (0,5) | −2,2 pe (−0,7) | −2,0 pe (−0,8) | −1,1 pe (−0,4) | ingen säker effekt |
| Bortafavorit | 510 / 269 | −2,3 pe (−1,1) | +3,8 pe (1,3) | +1,7 pe (0,8) | −4,0 pe (−1,4) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/LL2.md](../ligor/LL2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 47,4 % mot väntat 47,7 %. Inget att rätta.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
