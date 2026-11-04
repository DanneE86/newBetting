# A-League (AUS) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/AUS.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 110 | 37,3 % | 46,3 % | −9,1 pe (−1,9) | 32,7 % | 35 / 34 | modell (inga odds) |
| 2026/27 | 17 | 47,1 % | 46,5 % | +0,6 pe (0,1) | 52,9 % | 7 / 2 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,1). Tipsen träffar sämre än att alltid tippa hemma – granska.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 6 | 16,7 % | 45,9 % | −1,5 | 50,0 % | 25,1 % | 1,4 |

### 2026/27: vad gick fel

- Kryss: 3 av 6 (50,0 %) mot väntat 1,5 (z 1,4).
- Hemmafavoriter vann 1 av 4 (väntat 2,0), bortafavoriter 0 av 2 (väntat 0,8), favoriter ≥ 60 % 0 av 1 (väntat 0,7).
- Dixon-Coles och oddsen var oense i 2 matcher: DC rätt 2.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/AUS.md](../ligor/AUS.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
