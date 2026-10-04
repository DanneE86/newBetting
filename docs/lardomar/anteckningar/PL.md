# Premier League (PL) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-09-28. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/PL.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 380 | 49,2 % | 50,9 % | −1,7 pe (−0,7) | 42,6 % | 104 / 89 | odds (DC 30 %) |
| 2026/27 | 50 | 46,0 % | 50,3 % | −4,3 pe (−0,6) | 36,0 % | 16 / 11 | odds (DC 30 %) |

Bedömning 2026/27: inom slumpen (z −0,6). Tipsen slår att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 380 | 54,7 % | 53,8 % | 0,4 | 22,9 % | 24,3 % | −0,6 |
| 2023/24 | 380 | 59,7 % | 56,2 % | 1,4 | 21,6 % | 22,5 % | −0,4 |
| 2024/25 | 380 | 55,3 % | 54,8 % | 0,2 | 24,5 % | 23,3 % | 0,6 |
| 2025/26 | 380 | 48,7 % | 51,9 % | −1,3 | 27,4 % | 24,8 % | 1,2 |
| 2026/27 | 50 | 46,0 % | 52,4 % | −0,9 | 32,0 % | 24,2 % | 1,3 |

### 2026/27: vad gick fel

- Kryss: 16 av 50 (32,0 %) mot väntat 12,1 (z 1,3).
- Hemmafavoriter vann 15 av 33 (väntat 17,6), bortafavoriter 8 av 17 (väntat 8,6), favoriter ≥ 60 % 6 av 10 (väntat 7,0).
- Lag sämst mot oddsen (poäng mot förväntat): Tottenham −5,5 (5 m), Man United −4,2 (5 m), Fulham −3,6 (5 m), Bournemouth −3,0 (5 m).
- Lag bäst mot oddsen: Man City +4,5 (5 m), Hull +4,5 (5 m), Brighton +3,1 (5 m), Everton +2,4 (5 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 6 matcher: grundmodellen rätt 1, oddsen rätt 1.
- Dixon-Coles och oddsen var oense i 9 matcher: DC rätt 3.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Omgång 1–5 | 302 / 201 | +0,1 pe (0,1) | +0,8 pe (0,2) | +0,4 pe (0,2) | +3,7 pe (1,2) | ingen säker effekt |
| Storfavorit (≥ 70 %) | 413 / 160 | −0,5 pe (−0,2) | +1,1 pe (0,3) | −0,6 pe (−0,3) | +2,1 pe (0,8) | ingen säker effekt |
| Bortafavorit | 823 / 440 | +0,8 pe (0,5) | +0,6 pe (0,3) | −2,4 pe (−1,6) | +1,9 pe (0,9) | ingen säker effekt |
| Oddsen rör sig bort från favoriten (öppning → stängning) | 863 / 426 | −3,8 pe (−2,3) | −2,2 pe (−1,0) | −0,9 pe (−0,6) | +2,0 pe (1,0) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 414 / 53 | −1,1 pe (−0,4) | +5,5 pe (0,8) | −1,3 pe (−0,6) | −0,7 pe (−0,1) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 736 / 360 | +0,8 pe (0,4) | −0,4 pe (−0,1) | −0,6 pe (−0,4) | +1,6 pe (0,7) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/PL.md](../ligor/PL.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-10-03: missas något tecken (1/X/2) oftare än väntat i Stryktipset A/B? (107 omg)

- Premier League (A/B): missade 1 24/240 (väntat 24), X 74/130 (71), 2 48/182 (43) i A; B 1 26 (24), X 54 (59), 2 41 (40). Alla |z| < 1. Inget tecken missas oftare än väntat i PL.
- Samlat: nej. Kryss missas oftast men som modellen väntar. Se [slutsatser.md](../slutsatser.md) (Förkastat 2026-10-03).
- Senare samma dag bakkördes "ta med X oftare" i A och B (1X/X2 före 12, inget favoritspik vid högt kryss, X-vikt). Färre X-missar men fler missade 1:or/2:or, lägre chans till 13 och sämre netto. Inget infört, tabellen finns i slutsatser.md.

### 2026-10-03: spikar på Stryktipset (bakkörning 107 omgångar, A/B/C)

- Premier League: 469 favoritspikar (A+B+C) satt 56 % (väntat 56 %). Med kryss ≥ 27 % satt de 42 % (142 st), under 27 % 62 % (327 st). 105 av 207 missar blev kryss. Spikar i PL håller när krysset är lågt. Undvik spik i jämna PL-matcher med högt kryss.
- Samlat i [slutsatser.md](../slutsatser.md) (2026-10-03): det fanns nästan alltid en starkare garderad favorit med kryss < 27 % som hade suttit 68–79 %.

### 2026-09-28: felanalys och förbättringsvarv

- Webben visade grundmodellens träff (40,0 %, 30 matcher). Tipsmotorns riktiga träff 2026/27 är 46,0 % (50 matcher) mot väntat 50,3 % (z −0,6): inom slumpen. 16 kryss mot väntat 12,1 och hemmafavoriterna vann 15 av 33 (väntat 17,6). Inget av det har hållit i sig tidigare säsonger.
- Rättat: i PL vägs modellen in med 30 % (marknadstestet visade att den tillför information). Testet gjordes mot Dixon-Coles ensam, men live vägdes blandningen DC + grundmodell in. Nu vägs DC in, som testat.
- Grundmodellen hade sämst logloss i PL 2026/27 (1,102 mot DC 1,059 och oddsen 1,100). Den ska inte styra PL-tips.
- Tottenham och Man United ligger mest under oddsen i år (−5,5 och −4,2 poäng på 5 matcher). Det är beskrivande och används inte: lagens avvikelse mot oddsen håller inte i sig till nästa säsong.
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
