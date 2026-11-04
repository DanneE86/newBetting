# K League 1 (KR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/KR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 178 | 42,7 % | 43,6 % | −0,9 pe (−0,3) | 41,6 % | 46 / 56 | modell (inga odds) |
| 2026/27 | 204 | 38,7 % | 41,8 % | −3,0 pe (−0,9) | 31,9 % | 70 / 55 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −0,9). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 6 | 33,3 % | 43,6 % | −0,5 | 50,0 % | 27,3 % | 1,2 |

### 2026/27: vad gick fel

- Kryss: 3 av 6 (50,0 %) mot väntat 1,6 (z 1,2).
- Hemmafavoriter vann 2 av 5 (väntat 2,2), bortafavoriter 0 av 1 (väntat 0,4), favoriter ≥ 60 % 0 av 0 (väntat 0,0).
- Grundmodellen och oddsen var oense i 1 matcher: grundmodellen rätt 0, oddsen rätt 0.
- Dixon-Coles och oddsen var oense i 1 matcher: DC rätt 0.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/KR.md](../ligor/KR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
