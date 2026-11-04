# Canadian Premier League (CAN) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/CAN.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 66 | 45,5 % | 51,5 % | −6,1 pe (−1,0) | 45,5 % | 20 / 16 | modell (inga odds) |
| 2026/27 | 114 | 54,4 % | 48,2 % | +6,2 pe (1,3) | 46,5 % | 28 / 24 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,3). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 114 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.
- Grundmodellen och oddsen var oense i 1 matcher: grundmodellen rätt 0, oddsen rätt 0.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/CAN.md](../ligor/CAN.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
