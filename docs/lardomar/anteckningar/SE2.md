# Superettan (SE2) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SE2.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 186 | 46,2 % | 49,5 % | −3,3 pe (−0,9) | 43,0 % | 51 / 49 | modell (inga odds) |
| 2026/27 | 223 | 45,7 % | 44,3 % | +1,4 pe (0,4) | 39,9 % | 61 / 60 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 0,4). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2026/27 | 8 | 62,5 % | 49,3 % | 0,8 | 25,0 % | 24,5 % | 0,0 |

### 2026/27: vad gick fel

- Kryss: 2 av 8 (25,0 %) mot väntat 2,0 (z 0,0).
- Hemmafavoriter vann 5 av 8 (väntat 3,9), bortafavoriter 0 av 0 (väntat 0,0), favoriter ≥ 60 % 1 av 1 (väntat 0,7).
- Grundmodellen och oddsen var oense i 2 matcher: grundmodellen rätt 2, oddsen rätt 0.
- Dixon-Coles och oddsen var oense i 7 matcher: DC rätt 3.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SE2.md](../ligor/SE2.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Inga odds. Modellen träffar 44,2 % mot väntat 45,9 %. Att alltid tippa hemma ger 39 %. Här var grundmodellen värdefull: blandningen slog DC ensam (logloss 1,068 mot 1,072 i kontrollhalvan).
- Förra säsongen låg träffen under förväntan (z −1,8). Följ upp.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller ligor utan odds: DC-vikten i blandningen med grundmodellen (0,5 i dag) prövades. Poolat över alla ligor var 0,8 bäst både i träning och kontroll men vinsten var liten (logloss −0,0025, z under 2) och träffen oförändrad (47,7 %). Vald vikt per liga höll inte i kontrollen. Ingen ändring.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0).
