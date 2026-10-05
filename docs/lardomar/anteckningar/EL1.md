# League One (EL1) – lärdomar om tipsen

En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.

<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->

Uppdaterad 2026-10-04. Källor: `data/reports/pro-evaluation.json` (tipAccuracy), `data/reports/tips-backtest.json`, `data/matcher/EL1.csv`.

### Tipsens träff (1X2, samma motor som live)

| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |
|---|---|---|---|---|---|---|---|
| 2025/26 | 552 | 50,0 % | 47,2 % | +2,8 pe (1,3) | 46,0 % | 139 / 137 | odds |
| 2026/27 | 87 | 34,5 % | 46,1 % | −11,6 pe (−2,2) | 34,5 % | 29 / 28 | odds |

Bedömning 2026/27: sämre än tipsens procent lovade (z −2,2). Tipsen träffar lika ofta som att alltid tippa hemma.

### Oddsfavoriten och kryssen per säsong

| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |
|---|---|---|---|---|---|---|---|
| 2022/23 | 552 | 51,4 % | 48,9 % | 1,2 | 25,4 % | 26,6 % | −0,7 |
| 2023/24 | 552 | 49,6 % | 48,1 % | 0,7 | 24,5 % | 26,8 % | −1,2 |
| 2024/25 | 552 | 50,7 % | 49,0 % | 0,8 | 23,9 % | 26,3 % | −1,3 |
| 2025/26 | 552 | 50,2 % | 46,7 % | 1,7 | 25,2 % | 26,7 % | −0,8 |
| 2026/27 | 87 | 34,5 % | 45,5 % | −2,1 | 33,3 % | 26,1 % | 1,5 |

### 2026/27: vad gick fel

- Kryss: 29 av 87 (33,3 %) mot väntat 22,7 (z 1,5).
- Hemmafavoriter vann 22 av 60 (väntat 28,5), bortafavoriter 8 av 27 (väntat 11,1), favoriter ≥ 60 % 1 av 4 (väntat 2,5).
- Lag sämst mot oddsen (poäng mot förväntat): Wigan −5,0 (7 m), Peterboro −4,2 (8 m), Doncaster −4,2 (7 m), Luton −3,7 (7 m).
- Lag bäst mot oddsen: Bradford +4,2 (7 m), Sheffield Weds +3,8 (7 m), Oxford +3,1 (6 m), AFC Wimbledon +3,0 (8 m). Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.
- Grundmodellen och oddsen var oense i 19 matcher: grundmodellen rätt 7, oddsen rätt 6.
- Dixon-Coles och oddsen var oense i 18 matcher: DC rätt 6.

### Vad systemet kan missa: situationer mot öppningsoddsen

Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.

| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |
|---|---|---|---|---|---|---|
| Oddsen rör sig bort från favoriten (öppning → stängning) | 1206 / 619 | −2,5 pe (−1,8) | +0,1 pe (0,0) | +0,3 pe (0,3) | −2,6 pe (−1,5) | ingen säker effekt |
| Målsnål match (över 2,5 < 45 %) | 661 / 394 | +0,9 pe (0,5) | +2,9 pe (1,2) | −0,5 pe (−0,3) | −2,7 pe (−1,2) | ingen säker effekt |
| Omgång 1–5 | 364 / 244 | +4,6 pe (1,8) | +1,9 pe (0,6) | −2,8 pe (−1,2) | −4,1 pe (−1,5) | ingen säker effekt |
| Jämn match (favorit < 45 %) | 1562 / 819 | +1,5 pe (1,2) | −0,0 pe (−0,0) | −1,9 pe (−1,6) | −1,1 pe (−0,7) | ingen säker effekt |
| Bortafavorit | 1009 / 541 | +3,0 pe (1,9) | +2,4 pe (1,1) | −2,8 pe (−2,0) | −0,6 pe (−0,3) | ingen säker effekt |
| Uppflyttad favorit | 66 / 51 | −7,2 pe (−1,2) | +10,0 pe (1,4) | +2,8 pe (0,5) | −1,5 pe (−0,2) | ingen säker effekt |

Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.

Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/EL1.md](../ligor/EL1.md).

<!-- AUTO:END -->

## Lärdomar och beslut (handskrivet, daterat – nyast överst)

### 2026-10-05: genomgång av alla 90 spelade matcher 2026/27 – missade vi något?

- Stängningsfavoriten vann 32 av 90 (väntat 41,0, z ≈ −1,9), kryss 30 av 90 (väntat ≈ 24). Fortfarande inom slumpen. Följ upp vid 200 matcher, som beslutades 2026-09-28.
- Nya situationer testade mot öppningsoddsen (träning före 2023/24, kontroll 2023/24–2025/26, sedan i år): nedflyttad favorit (tr +9,2 pe z 1,8, ko −2,3 pe z −0,3, i år −3,3 pe), nedflyttad motståndare (krysset tr z +1,4, ko z −2,3, olika tecken), favorit med mindre vila (inget). Ingen är bekräftad, så inget förs in.
- Stryktipset 4973 (3/10, landslagsuppehåll, bara 3 League One-matcher): bortafavoriterna Huddersfield (1-3) och Plymouth (0-2) var garderade i alla kuponger. Reading–Bradford 1-1 (kryss 26–27 %) föll i A (12) och i B:s senaste version (2).
- Datahål som hittades:
  - **xG:** football-data har riktig xG (HxG/AxG) för alla engelska ligor från 2026/27. Lärdomsdelen (`learnings-data.mjs` → `data/matcher`, lagfilerna) läser bara Understat och använder annars skott-proxy. Proxyn korrelerar 0,74 med riktig xG men skiljer upp till 0,35 mål/match per lag (Wigan, Barnsley, Cambridge). Stryktipsmotorn läser redan HxG.
  - **Domare:** de 3 matcherna 3/10 saknar domare i matchfilen fast rådatan har dem. League Two saknar domare i alla 102 matcher i år.
  - **Skador (`miss_*`):** tomma utanför topp 5. Så är det byggt (spelardata från Understat), men det betyder att "nyckelspelare borta" aldrig testas i League One.
  - **Åtgärdat samma dag (gäller PL, CH, EL1, EL2):** riktig xG från football-data (`xg_src = football-data`), domare/avspark/kort direkt ur CSV:n när betting-store inte hunnit, spelade matcher utan resultat ligger kvar som `väntar` i upp till 21 dagar så att oddsen före matchen inte tappas (3/10-matcherna tappades så), frånvaron före matchen sparas i `pre_inj_*` för varje kommande match, och Transfermarkts skadelista fyller på FotMob (FotMob hade 2 skadade i hela League One, nu 23; CH +16, PL +6). Om ungefär en säsong går "frånvaro före matchen" att testa mot oddsen i League One.
  - Kvar utan åtgärd: `book` (bolagssnitt mot Pinnacle) är tom för 2026/27 i alla ligor eftersom football-data slutat leverera Pinnacles odds.

### 2026-10-03: missas något tecken (1/X/2) oftare än väntat i Stryktipset A/B? (107 omg)

- League One: för få matcher (25 hemmavinster, 23 kryss, 31 bortavinster). A missade 1 1 (väntat 2), X 12 (10), 2 8 (5); B 6 (5), 13 (13), 6 (7). Inget att läsa ut.
- Samlat: nej. Kryss missas oftast men som modellen väntar. Se [slutsatser.md](../slutsatser.md) (Förkastat 2026-10-03).
- Senare samma dag bakkördes "ta med X oftare" i A och B (1X/X2 före 12, inget favoritspik vid högt kryss, X-vikt). Färre X-missar men fler missade 1:or/2:or, lägre chans till 13 och sämre netto. Inget infört, tabellen finns i slutsatser.md.

### 2026-10-03: spikar på Stryktipset (bakkörning 107 omgångar, A/B/C)

- League One: 35 favoritspikar (A+B+C) satt 34 % (väntat 43 %). Med kryss ≥ 27 % satt de 26 % (23 st), under 27 % 50 % (12 st). 14 av 23 missar blev kryss. Litet urval, men samma mönster som Championship och starkare. Spika helst inte League One.
- Samlat i [slutsatser.md](../slutsatser.md) (2026-10-03): det fanns nästan alltid en starkare garderad favorit med kryss < 27 % som hade suttit 68–79 %.

### 2026-09-28: felanalys och förbättringsvarv

- Tipsmotorns träff 2026/27 är 34,5 % mot väntat 46,1 % (z −2,2), den enda ligan som ligger klart under vad tipsens egna procent lovade. Kontroll av datafel: med ombytta hemma- och bortaodds blir träffen 32 %, så lagen är rätt matchade. Förra säsongen låg samma motor 2,8 procentenheter över förväntan (z +1,3).
- Missarna: 29 kryss (väntat 22,7), hemmafavoriter vann 22 av 60 (väntat 28,5). Ingen av de testade situationerna (oddsrörelse, jämn match, bortafavorit, omgång 1–5, uppflyttad favorit) är bekräftad i ligan.
- Bedömning: slump i ett litet urval (87 matcher) snarare än ett systemfel. Följ upp: ligger z fortfarande ≤ −2 efter 200 matcher ska oddskällan granskas (egen avläsning mot stängningsodds).
- Webbens träffruta visar nu tipsmotorns riktiga träff (samma motor som live: senaste oddsen i ligor med odds, annars DC + grundmodell). Förut visade den grundmodellens träff, trots att den inte styr tipsen i ligor med odds. Rutan visar också "väntat", alltså vad tipsens egna procent lovade. Skillnaden mot väntat, räknad som z, avgör om missarna är slump (|z| < 2) eller ett systemfel.
- Gäller alla ligor med odds: kryssregeln (tippa X när krysset ligger nära favoriten) prövades i 14 ligor med tröskel vald på träning och gav lägre träff i kontrollen (50,78 % → 50,66 %). Förkastad. Senaste oddsen före avspark träffar 0,5 procentenheter oftare än öppningsoddsen (51,25 % mot 50,78 %, kontroll 2023/24–). Motorn läser om oddsen vid varje körning, så tipset ska alltid bygga på de senaste oddsen.
- Gäller alla ligor: ett kryssöverskott tidigt på säsongen håller inte i sig (257 ligasäsonger, lutning −0,04, z −1,0). Justera inte för det.
