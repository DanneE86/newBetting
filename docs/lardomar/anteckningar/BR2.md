# Brasileirão Série B (BR2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BR2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 323 | 42,7 % | 45,9 % | −3,1 pe (−1,1) | 44,0 % | 101 / 84 | modell (inga odds) |
| 2026/27 | 359 | 46,5 % | 43,7 % | +2,8 pe (1,1) | 44,6 % | 97 / 95 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 40 | 52,5 % | 51,7 % | 0,1 | 22,5 % | 25,9 % | −0,5 |

### 2026/27: vad gick fel

- Kryss: 9 av 40 (22,5 %) mot väntat 10,4 (z −0,5).
- Hemmafavoriter vann 16 av 34 (väntat 17,6), bortafavoriter 5 av 6 (väntat 3,0), favoriter ≥ 60 % 8 av 10 (väntat 7,2).
- Lag sämst mot oddsen (poäng mot förväntat): Operário PR −4,8 (4 m), Londrina −4,1 (4 m), Cuiabá −3,2 (4 m), Náutico −1,4 (4 m).
- Lag bäst mot oddsen: Novorizontino +3,8 (4 m), Vila Nova +2,2 (4 m), Goiás +2,2 (3 m), Botafogo-SP +2,1 (5 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 6 matcher: grundmodellen rätt 0, oddsen rätt 5.
- Dixon-Coles och oddsen var oense i 5 matcher: DC rätt 1.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BR2.md](../ligor/BR2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Inga odds. Modellen träffar 47,3 % mot väntat 42,5 % och slår att alltid tippa hemma (45 %). DC ensam gav något bättre logloss (1,022 mot 1,026 i kontrollhalvan).
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller ligor utan odds: DC-vikten i blandningen med grundmodellen (0,5 i dag) prövades. Poolat över alla ligor var 0,8 bäst både i träning och kontroll men vinsten var liten (logloss −0,0025, z under 2) och träffen oförändrad (47,7 %). Vald vikt per liga höll inte i kontrollen. Ingen ändring.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0).
