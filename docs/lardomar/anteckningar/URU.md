# Primera División (URU) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/URU.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 244 | 50,4 % | 48,7 % | +1,7 pe (0,5) | 43,0 % | 59 / 62 | modell (inga odds) |
| 2026/27 | 273 | 47,6 % | 45,6 % | +2,0 pe (0,7) | 41,8 % | 71 / 72 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,7). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 273 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.
- Grundmodellen och oddsen var oense i 1 matcher: grundmodellen rätt 0, oddsen rätt 1.
- Dixon-Coles och oddsen var oense i 1 matcher: DC rätt 0.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/URU.md](../ligor/URU.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
