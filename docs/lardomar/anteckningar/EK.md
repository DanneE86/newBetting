# Ekstraklasa (EK) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/EK.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 306 | 42,8 % | 46,0 % | −3,2 pe (−1,1) | 45,1 % | 85 / 90 | modell (inga odds) |
| 2026/27 | 106 | 50,9 % | 43,7 % | +7,2 pe (1,5) | 48,1 % | 24 / 28 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,5). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 306 | 49,7 % | 47,9 % | 0,6 | 26,5 % | 27,0 % | −0,2 |
| 2023/24 | 306 | 42,8 % | 49,1 % | −2,2 | 30,4 % | 26,8 % | 1,4 |
| 2024/25 | 306 | 48,4 % | 48,4 % | −0,0 | 25,2 % | 26,6 % | −0,6 |
| 2025/26 | 306 | 42,5 % | 46,8 % | −1,5 | 27,8 % | 26,6 % | 0,5 |
| 2026/27 | 106 | 51,9 % | 45,9 % | 1,3 | 22,6 % | 26,4 % | −0,9 |

### 2026/27: vad gick fel

- Kryss: 24 av 106 (22,6 %) mot väntat 28,0 (z −0,9).
- Hemmafavoriter vann 44 av 80 (väntat 38,0), bortafavoriter 11 av 26 (väntat 10,7), favoriter ≥ 60 % 6 av 9 (väntat 5,7).
- Lag sämst mot oddsen (poäng mot förväntat): Rakow −11,0 (12 m), Wieczysta Krakow −7,6 (12 m), Widzew Lodz −6,8 (12 m), Radomiak Radom −5,0 (12 m).
- Lag bäst mot oddsen: Gornik Zabrze +8,4 (12 m), Pogon Szczecin +7,7 (11 m), Lech Poznan +7,4 (11 m), Piast Gliwice +4,8 (12 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 15 matcher: grundmodellen rätt 9, oddsen rätt 4.
- Dixon-Coles och oddsen var oense i 15 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Jämn match (favorit < 45 %) | 1542 / 473 | −0,3 pe (−0,2) | −4,0 pe (−1,8) | +0,1 pe (0,1) | −1,0 pe (−0,5) | ingen säker effekt |
| Omgång 1–5 | 460 / 191 | −1,6 pe (−0,7) | +1,6 pe (0,5) | +0,5 pe (0,2) | +0,1 pe (0,0) | ingen säker effekt |
| Bortafavorit | 864 / 277 | −1,9 pe (−1,2) | −10,4 pe (−3,5) | +0,1 pe (0,0) | +6,0 pe (2,3) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/EK.md](../ligor/EK.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorn 50,0 % mot väntat 46,0 %. Förra säsongen låg den under (z −1,5), så det svänger åt båda hållen. Ingen ändring.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
