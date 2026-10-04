# Primera A (COL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/COL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 399 | 48,6 % | 47,3 % | +1,3 pe (0,5) | 46,4 % | 99 / 106 | modell (inga odds) |
| 2026/27 | 315 | 47,0 % | 46,5 % | +0,5 pe (0,2) | 45,4 % | 97 / 70 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,2). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 315 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/COL.md](../ligor/COL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Inga odds, så tipsen följer modellen (DC 50 % + grundmodell 50 %). Träff 46,7 % mot väntat 46,2 %. Att alltid tippa hemma ger 45 %. DC ensam hade bättre logloss (1,019 mot 1,026), men det håller inte i alla ligor utan odds, se gemensam punkt.
- Hög kryssandel (31 %) gör ligan svår att tippa.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller ligor utan odds: DC-vikten i blandningen med grundmodellen (0,5 i dag) prövades. Poolat över alla ligor var 0,8 bäst både i träning och kontroll men vinsten var liten (logloss −0,0025, z under 2) och träffen oförändrad (47,7 %). Vald vikt per liga höll inte i kontrollen. Ingen ändring.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0).
