# K League 1 (KR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/KR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 178 | 42,7 % | 43,6 % | −0,9 pe (−0,3) | 41,6 % | 46 / 56 | modell (inga odds) |
| 2026/27 | 198 | 38,9 % | 41,8 % | −2,9 pe (−0,8) | 31,8 % | 67 / 54 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −0,8). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

Inga odds i historiken för ligan (tipsen följer modellen).

### 2026/27: vad gick fel

- 198 spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.
- Grundmodellen och oddsen var oense i 1 matcher: grundmodellen rätt 0, oddsen rätt 0.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/KR.md](../ligor/KR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
