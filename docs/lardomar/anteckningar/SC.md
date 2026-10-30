# Premiership (SC) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-30. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/SC.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 228 | 51,7 % | 52,1 % | −0,3 pe (−0,1) | 44,7 % | 61 / 49 | modell (inga odds) |
| 2026/27 | 66 | 45,5 % | 49,2 % | −3,8 pe (−0,6) | 40,9 % | 15 / 21 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z −0,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 228 | 61,4 % | 54,7 % | 2,1 | 17,5 % | 24,3 % | −2,4 |
| 2023/24 | 228 | 53,5 % | 55,0 % | −0,5 | 26,8 % | 24,0 % | 1,0 |
| 2024/25 | 228 | 55,3 % | 55,3 % | −0,0 | 21,1 % | 23,6 % | −0,9 |
| 2025/26 | 228 | 51,3 % | 54,4 % | −1,0 | 26,8 % | 24,1 % | 0,9 |
| 2026/27 | 66 | 47,0 % | 54,0 % | −1,2 | 22,7 % | 23,5 % | −0,1 |

### 2026/27: vad gick fel

- Kryss: 15 av 66 (22,7 %) mot väntat 15,5 (z −0,1).
- Hemmafavoriter vann 21 av 43 (väntat 23,8), bortafavoriter 10 av 23 (väntat 11,8), favoriter ≥ 60 % 14 av 18 (väntat 13,1).
- Lag sämst mot oddsen (poäng mot förväntat): Hibernian −8,9 (11 m), Motherwell −4,9 (11 m), Aberdeen −3,1 (11 m), Kilmarnock −2,0 (11 m).
- Lag bäst mot oddsen: Dundee +5,9 (11 m), Celtic +3,6 (11 m), Falkirk +3,0 (11 m), St Mirren +2,2 (11 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 9 matcher: grundmodellen rätt 1, oddsen rätt 3.
- Dixon-Coles och oddsen var oense i 8 matcher: DC rätt 1.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Storfavorit (≥ 70 %) | 277 / 132 | +1,8 pe (0,7) | +4,4 pe (1,2) | +0,2 pe (0,1) | −3,2 pe (−1,1) | ingen säker effekt |
| Omgång 1–5 | 183 / 121 | +1,9 pe (0,5) | −8,0 pe (−1,8) | −1,7 pe (−0,6) | +8,2 pe (2,1) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 445 / 201 | −1,1 pe (−0,5) | −3,3 pe (−1,0) | −0,1 pe (−0,1) | +5,3 pe (1,7) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 481 / 271 | +3,5 pe (1,6) | −4,2 pe (−1,4) | −1,7 pe (−0,8) | +1,0 pe (0,4) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 515 / 81 | +3,5 pe (1,6) | +6,4 pe (1,2) | −1,0 pe (−0,5) | −2,4 pe (−0,5) | ingen säker effekt |
| Bortafavorit | 499 / 262 | +0,6 pe (0,3) | −3,6 pe (−1,2) | +1,3 pe (0,7) | +2,4 pe (0,9) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/SC.md](../ligor/SC.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

Inga egna lärdomar ännu.
