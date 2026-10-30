# Canadian Premier League (CAN) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/CAN.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 66 | 45,5 % | 51,5 % | −6,1 pe (−1,0) | 45,5 % | 20 / 16 | modell (inga odds) |
| 2026/27 | 112 | 55,4 % | 48,3 % | +7,0 pe (1,5) | 46,4 % | 27 / 23 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,5). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 112 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/CAN.md](../ligor/CAN.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
