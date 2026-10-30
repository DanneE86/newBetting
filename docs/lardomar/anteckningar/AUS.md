# A-League (AUS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/AUS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 110 | 37,3 % | 46,3 % | −9,1 pe (−1,9) | 32,7 % | 35 / 34 | modell (inga odds) |
| 2026/27 | 11 | 45,5 % | 46,3 % | −0,9 pe (−0,1) | 63,6 % | 4 / 2 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −0,1). Tipsen träffar sämre än att alltid tippa hemma – granska.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 11 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/AUS.md](../ligor/AUS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
