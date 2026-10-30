# Saudi Pro League (SAU) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SAU.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 252 | 56,8 % | 55,8 % | +0,9 pe (0,3) | 45,2 % | 59 / 50 | modell (inga odds) |
| 2026/27 | 94 | 55,3 % | 50,4 % | +4,9 pe (1,0) | 39,4 % | 25 / 17 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,0). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 94 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.
- Grundmodellen och oddsen var oense i 6 matcher: grundmodellen rätt 3, oddsen rätt 3.
- Dixon-Coles och oddsen var oense i 2 matcher: DC rätt 2.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SAU.md](../ligor/SAU.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
