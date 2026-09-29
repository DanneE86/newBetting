# Chance Liga (CZ) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/CZ.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 217 | 45,6 % | 47,0 % | −1,4 pe (−0,4) | 41,9 % | 51 / 67 | modell (inga odds) |
| 2026/27 | 71 | 53,5 % | 46,8 % | +6,7 pe (1,1) | 45,1 % | 15 / 18 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 71 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/CZ.md](../ligor/CZ.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Inga odds. Modellen träffar 53,5 % mot väntat 46,8 %. DC ensam var klart bättre än blandningen i år (logloss 0,935 mot 0,959), men urvalet är litet (71 matcher). Pröva igen när säsongen har fler matcher.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller ligor utan odds: DC-vikten i blandningen med grundmodellen (0,5 i dag) prövades. Poolat över alla ligor var 0,8 bäst både i träning och kontroll men vinsten var liten (logloss −0,0025, z under 2) och träffen oförändrad (47,7 %). Vald vikt per liga höll inte i kontrollen. Ingen ändring.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0).
