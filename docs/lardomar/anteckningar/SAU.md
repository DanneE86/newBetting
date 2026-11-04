# Saudi Pro League (SAU) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SAU.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 252 | 56,8 % | 55,8 % | +0,9 pe (0,3) | 45,2 % | 59 / 50 | modell (inga odds) |
| 2026/27 | 100 | 54,0 % | 50,4 % | +3,6 pe (0,7) | 40,0 % | 27 / 19 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,7). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 6 | 16,7 % | 52,5 % | −1,9 | 33,3 % | 22,6 % | 0,6 |

### 2026/27: vad gick fel

- Kryss: 2 av 6 (33,3 %) mot väntat 1,4 (z 0,6).
- Hemmafavoriter vann 1 av 3 (väntat 1,7), bortafavoriter 0 av 3 (väntat 1,5), favoriter ≥ 60 % 1 av 1 (väntat 0,9).
- Grundmodellen och oddsen var oense i 8 matcher: grundmodellen rätt 4, oddsen rätt 3.
- Dixon-Coles och oddsen var oense i 5 matcher: DC rätt 4.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SAU.md](../ligor/SAU.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
