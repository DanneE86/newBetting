# Brasileirão Série B (BR2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/BR2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 323 | 43,3 % | 45,6 % | −2,2 pe (−0,8) | 44,0 % | 98 / 85 | modell (inga odds) |
| 2026/27 | 310 | 48,4 % | 42,9 % | +5,5 pe (2,0) | 45,2 % | 83 / 77 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 2,0). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 11 | 63,6 % | 51,3 % | 0,9 | 9,1 % | 26,0 % | −1,3 |

### 2026/27: vad gick fel

- Kryss: 1 av 11 (9,1 %) mot väntat 2,9 (z −1,3).
- Hemmafavoriter vann 5 av 9 (väntat 4,8), bortafavoriter 2 av 2 (väntat 0,8), favoriter ≥ 60 % 3 av 3 (väntat 2,2).
- Grundmodellen och oddsen var oense i 2 matcher: grundmodellen rätt 0, oddsen rätt 2.
- Dixon-Coles och oddsen var oense i 2 matcher: DC rätt 1.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/BR2.md](../ligor/BR2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Inga odds. Modellen träffar 47,3 % mot väntat 42,5 % och slår att alltid tippa hemma (45 %). DC ensam gav något bättre logloss (1,022 mot 1,026 i kontrollhalvan).
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller ligor utan odds: DC-vikten i blandningen med grundmodellen (0,5 i dag) prövades. Poolat över alla ligor var 0,8 bäst både i träning och kontroll men vinsten var liten (logloss −0,0025, z under 2) och träffen oförändrad (47,7 %). Vald vikt per liga höll inte i kontrollen. Ingen ändring.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0).
