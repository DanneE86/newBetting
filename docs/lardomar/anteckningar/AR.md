# Liga Profesional (AR) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-11-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/AR.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 510 | 42,2 % | 44,4 % | −2,2 pe (−1,0) | 40,8 % | 146 / 149 | modell (inga odds) |
| 2026/27 | 479 | 45,1 % | 42,6 % | +2,4 pe (1,1) | 42,0 % | 144 / 119 | modell (inga odds) |

Bedömning 2026/27: inom slumpen (z 1,1). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022 | 580 | 44,5 % | 46,2 % | −0,9 | 30,3 % | 29,1 % | 0,6 |
| 2023 | 582 | 43,5 % | 45,2 % | −0,8 | 33,5 % | 30,6 % | 1,5 |
| 2024 | 581 | 45,3 % | 46,5 % | −0,6 | 32,2 % | 30,5 % | 0,9 |
| 2025 | 510 | 42,0 % | 45,3 % | −1,5 | 31,8 % | 31,4 % | 0,2 |
| 2026 | 479 | 44,1 % | 45,8 % | −0,8 | 30,1 % | 31,1 % | −0,5 |

### 2026: vad gick fel

- Kryss: 144 av 479 (30,1 %) mot väntat 148,8 (z −0,5).
- Hemmafavoriter vann 161 av 349 (väntat 166,2), bortafavoriter 51 av 130 (väntat 52,6), favoriter ≥ 60 % 34 av 45 (väntat 29,4).
- Lag sämst mot oddsen (poäng mot förväntat): Dep. Riestra −16,1 (31 m), Estudiantes Rio Cuarto −13,9 (31 m), Aldosivi −12,6 (31 m), Racing Club −10,0 (33 m).
- Lag bäst mot oddsen: Gimnasia L.P. +15,8 (33 m), Barracas Central +11,1 (31 m), Velez Sarsfield +9,7 (32 m), Instituto +9,1 (31 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 770 / 273 | +0,9 pe (0,5) | +2,3 pe (0,8) | −0,0 pe (−0,0) | −1,6 pe (−0,6) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 2217 / 1059 | −0,4 pe (−0,4) | −3,7 pe (−2,5) | +0,4 pe (0,4) | +1,9 pe (1,3) | ingen säker effekt |
| Bortafavorit | 1077 / 486 | −0,4 pe (−0,3) | −6,4 pe (−2,9) | +0,7 pe (0,5) | +2,8 pe (1,3) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 92 / 31 | −1,7 pe (−0,4) | +5,5 pe (0,7) | −1,0 pe (−0,2) | −17,1 pe (−2,5) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/AR.md](../ligor/AR.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-09-28: felanalys och förbättringsvarv

- Argentina har hög kryssandel (30–32 %) och favoriten vinner bara 42–45 %. Därför är träffen låg, 43,3 % mot väntat 45,6 % (z −0,9). Oddsen är rätt prissatta över tid, så det finns inget att rätta i tipsen.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
