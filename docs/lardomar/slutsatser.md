# Lärdomar – slutsatser och beslut

Levande fil, skriven för hand (agenten `.claude/agents/lardomar.md` fyller på). Lägg till daterade rader, skriv inte över. Siffror och tabeller per liga och lag genereras i [README.md](README.md), [ligor/](ligor/) och [lag/](lag/). Rådata per liga: `data/matcher/<liga>.csv`.

## Utgångsläge (2026-09-28)

- 91 345 ligamatcher med stängningsodds i 23 ligor. De 14 fd-ligorna har data 2017/18–2026/27, och Allsvenskan, Eliteserien, Danmark, Polen, J1, MLS, Mexiko, Brasilien och Argentina har data från 2012.
- xG från Understat i topp 5 (9 säsonger). Övriga fd-ligor har en skott-proxy: 0,059 per skott utanför mål + 0,219 per skott på mål, kalibrerad mot Understat.
- Spelare per match (Understat) i topp 5 från 2024/25, alltså 3 752 matcher.
- 1 209 matcher från Stryktipset (494) och Europatipset (715) med folkets streck och odds.
- Metod: signaler räknas bara på data före matchen och testas mot resultatet minus oddsens förväntan. Träning före 2023/24, kontroll 2023/24 och senare.

## Vad som INTE slår marknaden (förkastat 2026-09-28)

Alla ligor tillsammans, mot stängningsodds. z = styrka, och |z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs.

| Idé | Resultat | Varför |
|---|---|---|
| **xG-tur (poäng − xP)** | Svag (z −2,6 totalt, −1,1 i kontrollen). Förutsäger däremot oddsrörelsen starkt (z −15) | Marknaden prisar in turen före avspark. Lag med tur går upp i odds från öppning till stängning. Inget värde vid stängning |
| **xG-form mot målform** | Ingen effekt (z 1,9). Förutsäger oddsrörelsen (z 13) | Samma: marknaden vet |
| **Form mot marknaden** (lag som slagit oddsen senaste 8) | Svag återgång (z −4,1 totalt, −1,6 i kontrollen), effekt −0,04 poäng | För liten och håller inte i kontrollen |
| **Inbördes möten** (≥ 3 möten, 8 år) | Mot marknaden z 0,6, poängskillnad z 2,6 men inte i träningen, kryss z 0,9 | Historiken mellan två lag är redan inprisad. "Laget brukar slå dem" är ett argument som inte håller |
| **Nyckelspelare borta** (andel av lagets xG + xA) | Vikt **positiv**: laget som saknar spelare gör det något *bättre* än oddsen. Kontroll 2025/26 z −0,4 | Marknaden prisar in frånvaron, möjligen lite för mycket, men det är inte bekräftat. Använd inte för att flytta procent |
| **Vilodagar** (ligamatcher) | Ingen effekt (z −1,2) | Cup- och Europamatcher saknas i datan, så det är ett svagt test |
| **Uppflyttade lag omgång 1–10** | −0,035 p/match (z −2,1) | Svag, följ upp |
| **Nedflyttade lag omgång 1–10** | −0,06 (z −1,9, kontroll −0,14 z −2,7) | Svag, följ upp |
| **Oddsrörelse ("steam")** | Ingen effekt vid stängning | Stängningen har redan tagit in rörelsen |
| **Bolagssnitt mot Pinnacle** | Ingen effekt | Pinnacle räcker som facit |
| **Över/under-marknaden mot kryss** | Ingen effekt | 1X2- och O/U-marknaderna är samstämmiga |
| **Sista 4 omgångarna, omgång 1–5** | Ingen effekt | – |
| **Stilmatchning** (2026-10-01): backar hem mot backar hem, bollinnehav, långbollar, press – och "laget X har svårt för lagtyp Y" | Ligamönster: inget |z| > 1,2 (kryss och över 2,5 inom ±2 pe). Lagmönster: tidig halva förutsäger inte sen, korrelation 0,00 ± 0,05 över ~4 000 par, 48–52 % samma tecken | Oddsen prisar redan in stilmötet. Lagspecifika "svårt för"-mönster är slump. Se [stilmatchning.md](../analys/stilmatchning.md). Använd inte för att flytta procent |
| **Lag som marknaden felvärderar** (säsong → nästa) | Ingen persistens i någon liga | Ett lag som slagit oddsen en säsong är inte ett bättre spel nästa |

Justeringsmodellen med alla signaler samtidigt förbättrade inte kontrollen (mot öppning −0,0004, z −1,0, mot stängning −0,0002, z −0,7). **Slutsats: lägg inte tid på att flytta procent efter form, xG, H2H eller frånvaro. Oddsen gör det redan.**

### Förkastat 2026-09-28 (kväll), tipsens träff
- **Kryssregel** (tippa X när P(X) ligger inom δ från favoriten, δ vald på träning per liga): kontroll 2023/24–, 14 ligor: 50,78 % → 50,66 %. Sämre.
- **DC-vikt i blandningen** (ligor utan odds): 0,8 bäst poolat (logloss −0,0025 mot 0,5, z under 2, träff oförändrad 47,7 %). Vikt vald per liga håller inte i kontrollen. Ingen ändring.
- **Kryssöverskott tidigt på säsongen håller i sig?** Nej: 257 ligasäsonger, lutning −0,04 (z −1,0). Englands 33 % kryss i år (väntat 26 %, z 2,9) har inget historiskt mönster (tidigare säsonger z mellan −1,0 och +1,1).
- **Situationer mot öppningsoddsen, poolat alla ligor:** oddsrörelse bort från favoriten (favoriten −2,7/−2,3 procentenheter, z −6,3/−3,8) är bekräftad, men den fångas redan av att tipset bygger på de senaste oddsen. Senaste oddsen träffar 51,25 % mot öppningens 50,78 %. Storfavoriter ≥ 70 % vinner oftare än oddsen säger (+1,8/+4,3 procentenheter, z 2,6/4,2), vilket inte ändrar tecknet. Veckodag, månad, omgång 1–10, uppflyttad favorit, vila och målsnåla matcher: ingen säker effekt. Bekräftat per liga: SB (kryss i målsnåla och jämna matcher), ED och GR (oddsrörelse), PT (storfavoriter).

### Förkastat 2026-09-30, spelardatan (`data/spelare`) mot stängningsodds
Skript: `scripts/lardomar-spelare-signaler.mjs`. Lagets matcher byggs ur spelarnas 10 senaste matcher (alla tävlingar, även cup, Europa och landslag): 3 327 lag-matcher (1 770 matcher) i 23 ligor med odds, sommaren–hösten 2026. Poäng minus oddsens förväntade poäng.

| Signal | Rått (utan odds) | Mot stängning | Mot öppning |
|---|---|---|---|
| Vila i dagar, alla tävlingar (det gamla vilotestet saknade cup/Europa) | z −1,9 | z 0,4 | z −0,3 |
| Kort vila ≤ 3 dagar (n 437) | +0,09 p | −0,02 p (z −0,3) | z 0,0 |
| Europamatch ≤ 4 dagar före (n 169) | +0,50 p (starka lag) | **+0,14 p (z 1,6)** | z 2,1 |
| Europamatch ≤ 4 dagar efter (n 104) | +0,38 p | +0,10 p (z 0,8) | z 0,7 |
| Rotation: startelvans marknadsvärde / lagets median | z −0,3 | z −0,8 | z −1,5 |
| Hårt roterat, elvan < 80 % av median (n 304) | −0,01 p | +0,02 p (z 0,3) | z −0,3 |
| Minst 2 av lagets 3 dyraste spelar inte (n 839) | −0,07 p | +0,01 p (z 0,2) | z 0,5 |
| Landslagsspelare i startelvan (landskamp ≤ 7 dagar före) | z 0,5 | z −0,1 | z 0,2 |
| Lagnivå: keeperns goals_prevented/90 förra säsongen (361 lag) | – | z 0,7 | – |
| Lagnivå: avslut (mål − xG)/90 förra säsongen | – | z −0,2 | – |
| Lagnivå: andel minuter från nyförvärv 2026 | – | z −0,6 | – |

Per liga (80–260 lag-matcher per liga, cirka 230 tester): inget |z| över 2,2, alltså vad slumpen ger. Enstaka: PL Europamatch före −0,44 p (n 9), LL hårt roterat +0,58 p (n 18), BL2 hårt roterat −0,67 p (n 10), MX hårt roterat +0,85 p (n 8). För små urval att använda. **Slutsats: rotation, frånvaro, vila, Europamatcher och landslagsresor är inprisade i stängningsoddsen.** Lagen spelar det oddsen säger. Samma mönster som för nyckelspelare 2026-09-28: tappet syns i rådata men inte mot oddsen. Europamatch före (+0,14 p, z 1,6) pekar åt samma håll som tidigare, att marknaden straffar trötthet lite för mycket. Följ upp.

### Förkastat 2026-10-03, Stryktipset: missar A eller B något tecken (1, X, 2) oftare än väntat?

Bakkörning med nuvarande regler, 107 omgångar 2023/24–2026/27, bara PL/Championship/League One (1 294 matcher, `data/stryktips-backtest-*-nya-regler.json`). Missat = utfallet låg utanför systemets tecken. Väntat = summan av våra slutprocent (`final`) för de tecken systemet lämnade ute. z = (missat − väntat) / sd.

| System | Utfall | Utfall totalt | Missade | Väntat (modell) | Väntat (folket) | z |
|---|---|---|---|---|---|---|
| A | 1 | 557 | 50 (9,0 %) | 45,0 (8,0 %) | 39,6 | +0,9 |
| A | X | 322 | 137 (42,5 %) | 135,0 (40,5 %) | 124,3 | +0,2 |
| A | 2 | 415 | 120 (28,9 %) | 104,3 (26,2 %) | 82,9 | +1,7 |
| B | 1 | 557 | 77 (13,8 %) | 62,6 (11,1 %) | 59,2 | +2,2 |
| B | X | 322 | 145 (45,0 %) | 162,1 (48,6 %) | 152,9 | −1,6 |
| B | 2 | 415 | 111 (26,7 %) | 106,8 (26,9 %) | 91,0 | +0,5 |

- **Kryss missas oftast (42–45 % av alla kryss), men exakt så ofta som modellen väntar.** Det beror på att kryss nästan aldrig är favorit och därför lämnas ute på spikar (A missade 80 av 80 kryss i spikmatcher, väntat 75). Kryss kom totalt 322 gånger mot väntat 334, alltså inte underskattat.
- Folket väntar sig färre missar på alla tecken (de streckar favoriten för högt), så mot folket ser alla tecken ut att "missas", mest 2:or. Det säger inget om modellen.
- Uppdelat på spik/halv/hel och färg (cirka 40 celler för A och B) fanns 4 med |z| ≥ 2, vilket är vad slumpen ger. Starkast: A:s halvgarderingar som lämnar ute ett rött tecken (oftast 1X mot en röd 2:a): 111 utfall mot väntat 90 (z 2,5, n 421), plus i alla tre säsongerna (z 1,0 / 1,4 / 1,9). Men träning (2023/24–2024/25) z 1,7 och kontroll z 1,9, under kraven 2,5/2.
- Motprov på stor historik (PL/CH/L1 2017/18–2025/26, 13 204 matcher, stängningsodds Pinnacle): bortalag på 20–25 % vann *färre* gånger än oddsen sa (träning 249 mot 273, kontroll 134 mot 148). Kryss på 20–25 % också färre (z −2,5 i träning). Ingen systematisk underskattning av röda 2:or eller kryss att rätta.
- Samlat över alla 1 294 matcher: röd 2 148 mot väntat 130 (z 1,8, nästan bara 2025/26–: z 2,2, övriga säsonger z 0,6 och 0,1). B:s missade 1:or (z 2,2) kommer nästan bara från 2025/26– (z 2,5, övriga 0,2 och 1,0) och har motsatt tecken mot A. Brus.
- Första beslutet var att inte ändra motorn. Användaren ville ändå ha kryss oftare i A och B (kryss = 44–45 % av alla missar), så varianter bakkördes, se nästa punkt.
- **2026-10-03 (senare): "ta med X oftare" i A och B bakkört, 107 omgångar, samma omgångar som `*-nya-regler`, C av.** Reglage i `scripts/fetch-stryktipset.mjs` (`X_TILT`: `STRYK_X_HALF`, `STRYK_X_SPIK`, `STRYK_X_W`, `STRYK_X_FOR`, av som standard, samma neutrala `X_TILT` i `gui/public/stryk-engine.js`). Filer: `data/stryktips-backtest-{2324,2425,budget}-kryss-*.json` (`kryss-bas` = nuvarande regler, C av, samma som `nya-regler` för A och B). X-miss = kryss utanför systemet (PL/CH/L1, 322 kryss).

  | Variant | A X-miss | A missar | A 10+/11+/12+/13 | A netto | A chans 13 | A 30–50k | B X-miss | B 12+ | B netto | B 50–75k |
  |---|---|---|---|---|---|---|---|---|---|---|
  | Nu (kryss-bas) | 137 | 307 | 29/11/4/1 | +24 234 | 0,234 % | 96 | 145 | 4 | +11 280 | 106 |
  | (a) 1X/X2 före 12, bonus 3 p.e. | 104 | 312 | 32/10/4/0 | −20 650 | 0,223 % | 90 | 136 | 1 | −18 827 | 105 |
  | (a) bonus 6 p.e. | 83 | 316 | 31/11/2/0 | −32 629 | 0,220 % | 89 | 119 | 0 | −28 756 | 103 |
  | (b) ingen favoritspik vid X ≥ 27 % | 135 | 297 | 32/12/4/1 | +24 968 | 0,236 % | 96 | 144 | 1 | −19 699 | 105 |
  | (b) X ≥ 30 % | 135 | 303 | 30/11/4/1 | +24 333 | 0,235 % | 96 | 147 | 4 | +11 362 | 106 |
  | (c) X × 1,1 | 102 | 307 | 32/11/4/0 | −20 681 | 0,224 % | 90 | 139 | 1 | −18 853 | 105 |
  | (c) X × 1,2 | 85 | 319 | 28/11/3/0 | −30 112 | 0,221 % | 89 | 117 | 2 | −22 959 | 102 |
  | (a) 3 p.e. bara A | 104 | 312 | 32/10/4/0 | −20 650 | 0,223 % | 90 | 165 | 2 | −24 576 | 107 |
  | (b) 27 % bara A | 135 | 297 | 32/12/4/1 | +24 968 | 0,236 % | 96 | 144 | 3 | +7 135 | 102 |

  - (a) och (c) gör precis vad de ska: A missar 83–104 kryss i stället för 137. Men missarna flyttar till 1:or och 2:or (totalt 307 → 307–319), chansen till 13 rätt sjunker (0,234 → 0,220–0,224 %) och 30–50k håller i färre omgångar (96 → 89–90). A tappar sin enda 13:a (omg 4876, 47 432 kr i vinst), därav nettot. B tappar 12:or (4 → 0–2).
  - (b) påverkar knappt krysset (137 → 135), eftersom spikarna redan sällan ligger på matcher med högt kryss efter toppregeln (`SPIK_TOP`). A blir marginellt bättre (missar 307 → 297, 10+ 29 → 32), men B tappar 12:or med 27 %. Med 30 % är allt inom ±2.
  - Rättningen bekräftar analysen ovan: kryss missas oftast men inte oftare än sannolikheten säger. Tar man med fler kryss missas fler 1:or och 2:or.
  - **Beslut: inget infört.** Ingen variant minskar X-missarna utan att förlora netto, 12+ eller 13 rätt. Reglagen ligger kvar, avstängda, för ny bakkörning (`STRYK_X_SPIK=0.27 STRYK_X_FOR=A` är närmast och kan följas upp när fler omgångar finns). Följ upp A:s halvgarderingar mot röd 2:a när 2026/27 har ~30 nya omgångar.

### Förkastat 2026-10-03, varför faller favoriten? (PL/CH/L1 2017/18–2026/27, 13 431 favoritmatcher)

Favorit = högst stängningschans av 1 och 2. Utfall: vann favoriten mer sällan än oddsen sa? Träning före 2023/24 (8 748), kontroll därefter (4 683). Krav |z| ≥ 2,5 i träning och ≥ 2 i kontroll, samma håll.
- **~60 signaler, ingen bekräftad**, varken mot stängnings- eller öppningsodds: favoritens och motståndarens form (5), vinstsvit ≥ 4/≥ 6, motståndaren obesegrad ≥ 5 eller förlustsvit, storseger/storförlust senast, förlust/kryss senast, tabellplacering och poäng per match (även "tabellen säger jämnt men oddsen favorit"), kryssandel och lågmålsmatcher senaste 10, insläppta/gjorda mål, vila och vilodifferens, form mot oddsen, xG-tur, julhelgen, säsongsslut, bottenlag i nedflyttningsstrid, favorit utan något att spela för, uppflyttad motståndare, hemma/borta, oddsnivå, oddsrörelse, över/under 2,5. Närmast: favoritens vinstsvit ≥ 4 i kontrollen −6,3 pe (z −1,7) men +1,9 pe i träningen; motståndare med många lågmålsmatcher −3,8 pe (z −1,9) i kontrollen, 0 i träningen.
- **Alla signaler i en modell** (logistisk med oddsen som grund, vikter valda på träningen): bättre i träning (z −3,1), **sämre i kontrollen** (logloss +0,0007 mot stängning, +0,0014 mot öppning). Delad i femtedelar efter modellens "kan falla" vann favoriterna i kontrollen som oddsen sa i alla femtedelar. Modellen lär sig brus.
- **Vad som faktiskt förutsäger fall är procenten själv** (Stryktipset 107 omg, 1 294 matcher): favorit ≥ 65 % faller 24 % (väntat 26), 55–65 % 39 % (41), 45–55 % 54 % (50), < 45 % 62 % (60). p ≥ 55 % och kryss < 27 % faller 33 %, övriga 58 %.
- Kandidat, inte bekräftad: favoriter som folket streckar ≥ 1,10 × vår procent vann 368 mot väntat 394 (z −1,1 / −0,6 / −1,6 per period, samlat ~−1,9). Följ upp på fler omgångar och på Europatipset. Överstreckade favoriter är där ett fall betalar mest, oavsett om de faller oftare.
- Skript: `scripts/lardomar-favoritfall.mjs` (data, `--open` mot öppningsodds), `-test.mjs` (signal för signal), `-modell.mjs` (alla tillsammans).

### Förkastat 2026-10-04, Stryktipset: finns det skrällar som vinner oftare än vår procent? (PL/CH/L1)

Frågan från användaren: kan vi pricka in fler skrällar (folket ≤ 30 %) och få stora utdelningar oftare? Två datamängder:
- **Stor historik** (PL/CH/L1 2017/18–2026/27, stängningsodds, `scripts/lardomar-skrallar-hist.mjs`). Skräll = 1 eller 2 med p ≤ 30 %. Träning till och med 2022/23 (validering 2021/22–2022/23), kontroll 2023/24–.
- **Stryktipset** (107 omg, 1 294 matcher, `data/stryktips-backtest-*-motB.json`, `scripts/lardomar-skrallar-folk.mjs`). Väntat = vår slutprocent (`final`) och folkets streck. Folkdata finns bara från 2023/24, så här delas 2023/24–2024/25 mot 2025/26–.

Hypoteserna (riktning bestämd i förväg: skrällen vinner oftare än väntat) och utfallet:

| Signal | n (tr / ko) | Utfall / väntat träning | z träning | Utfall / väntat kontroll | z kontroll |
|---|---|---|---|---|---|
| Alla skrällar 1/2, p ≤ 30 % | 6 269 / 3 357 | 1 316 / 1 326 | −0,3 | 694 / 716 | −0,9 |
| League One-skräll | 2 130 / 1 208 | 430 / 477 | **−2,4** | 260 / 271 | −0,8 |
| Championship-skräll | 2 303 / 1 234 | 535 / 516 | +1,0 | 274 / 271 | +0,2 |
| Hemmaskräll | 1 730 / 900 | 381 / 386 | −0,3 | 200 / 206 | −0,5 |
| Bortaskräll | 4 539 / 2 457 | 935 / 940 | −0,2 | 494 / 510 | −0,8 |
| Skräll, oddsen rörde sig ≥ 3 pe mot den (öppning → stängning) | 275 / 133 | 64 / 65 | −0,2 | 32 / 32 | −0,1 |
| Samma mot öppningsodds | 275 / 133 | 64 / 54 | +1,5 | 32 / 27 | +1,1 |
| Kryss i jämna matcher (\|p1 − p2\| < 0,15) | 3 318 / 1 699 | 904 / 968 | **−2,4** | 468 / 483 | −0,8 |
| Sen säsong (apr–maj), skrällen i botten 6 | 416 / 240 | 86 / 79 | +0,9 | 55 / 45 | +1,6 |
| Uppflyttat lag som skräll | 246 / 175 | 49 / 51 | −0,4 | 32 / 36 | −0,8 |

Stryktipset med folket (väntat enligt `final` / enligt folket; utfall/folk = hur mycket mer skrällen vann än strecken sa):

| Signal | n | Utfall | Väntat final | Väntat folk | Utfall/folk | z 23/24–24/25 | z 25/26– |
|---|---|---|---|---|---|---|---|
| 1/2-skräll folk ≤ 30 % | 1 100 | 280 | 255 | 199 | 1,41 | +0,7 | +2,1 |
| Kryss folk ≤ 30 % | 1 220 | 306 | 311 | 282 | 1,09 | −0,3 | −0,2 |
| Bortaskräll folk ≤ 30 % | 770 | 190 | 170 | 133 | 1,43 | +0,5 | +2,3 |
| Hemmaskräll folk ≤ 30 % | 330 | 90 | 85 | 67 | 1,35 | +0,5 | +0,5 |
| Skräll, folk/final ≤ 0,75 (kraftigt understreckad) | 514 | 117 | 105 | 69 | **1,70** | +0,8 | +1,2 |
| Skräll, folk/final 0,75–0,9 | 403 | 116 | 105 | 86 | 1,34 | +0,3 | +1,6 |
| Skräll, folk/final > 0,9 | 183 | 47 | 45 | 44 | 1,07 | −0,1 | +0,8 |
| Kryss folk < 22 % | 364 | 84 | 77 | 61 | 1,37 | 0,0 | +1,6 |
| Skrällspik-bandet (final 35–47 %, final − folk ≥ 3 pe) | 76 | 35 | 29 | 25 | 1,41 | +1,8 | +0,1 |

- **Ingen signal håller.** Inget når |z| ≥ 2,5 i träning med skräll-riktning. De två som gör det (League One-skrällar z −2,4 och kryss i jämna matcher z −2,4) pekar åt **andra hållet**: skrällarna och krysset vinner *mer sällan* än oddsen säger, och i kontrollen är det bara −0,8. Det håller inte heller åt det hållet.
- Att 1/2-skrällar vann fler än `final` i Stryktipset (z +1,8) kommer nästan bara från 2025/26– (z +2,1, före +0,7). I den stora historiken vann skrällar *färre* än stängningsoddsen i samma period (z −0,9). Det är samma brus som "röd 2:a z 1,8" 2026-10-03.
- Oddsrörelse mot skrällen: slår öppningsoddsen (z +1,5 / +1,1) men inte stängningen. Marknaden prisar in det före avspark, och vår `final` bygger på sena odds. Ingen nytta för Stryktipset.
- **Det enda som skiljer grupperna är folkets streck, och det vet vi redan före matchen.** Kraftigt understreckade skrällar (folk ≤ 0,75 × vår procent) vann ungefär som vår procent (117 mot 105, z +0,8/+1,2) men 1,70 gånger så ofta som folket trodde. Skrällar som folket streckar som vi (> 0,9) vann bara 1,07 × strecken. De ger alltså inte fler rätt, men varje rätt betalar mer. Det är redan inbyggt i utdelningsgränsen och i skrällspikens krav (final − folk ≥ 3 pe).
- **Hur det kan användas (förslag, inte infört och inte bakkört):** när motorn ska välja *vilket* rött tecken som tas med i en halva eller blir skrällspik, välj det med lägst folk/final bland kandidater med ungefär samma chans. Samma chans till 13 rätt, högre utdelning när den sitter. Det ändrar inte hur ofta en skräll sitter. Det gör bara procenten. Ingen regel ger "fler skrällar rätt" utan att fler favoriter faller ur systemet (se X-tilt 2026-10-03).
- Inte testat igen: favoritfall, domare, risklag, tränare, inbördes, X-tilt och överstreckade favoriter (se ovan).

### Förkastat 2026-10-04, Stryktipset: kryss – kan vi få in fler X i grundraden?
X är det tecken som oftast saknas i grundraden: A saknar 41 % av kryssen, mot 9 % av 1:orna och 29 % av 2:orna (107 omg).
- **X går inte att förutsäga bättre än oddsen** (PL, CH, L1 och L2 2022/23–2026/27, 8 041 matcher, mot Pinnacles slutodds):
  - Lagens kryssandel och kryss över marknaden (20 senaste), målsnitt, inbördes kryss, månad och liga ligger alla inom ±2 pe.
  - En logistisk modell med allt testad på 2025/26–: logloss 0,58187 mot oddsens 0,58204, alltså noll i praktiken.
  - Vår `final` är kalibrerad för X: matcher vi ger 28 % blir kryss 28 %. Högsta X är cirka 32 %.
- **Blått X** (en blå halva har alltid X i A/B): infört på användarens önskan. Det gav fler omgångar med blått X (A 43 → 79), men chansen till 13 rätt sjönk något (A 25,0 → 23,9 %) och inga fler X kom med. Färgen är inte problemet.
- **Fler X-halvor** (STRYK_X_HALF 0,05, 1X/X2 före 12): A −28k netto mot +24k, och rätt rad i grundraden 8 → 5. X kom med oftare, men 1 och 2 föll bort.
- **B täcker A:s kryss-hål** (extra grundradskandidater för B med X där A saknar X, vikt 1,15–1,6): ingen skillnad (A+B 43,8 %, X täckt 288 av 353). B väljs redan efter A+B:s gemensamma chans.
- **Färre tvingade spikar** (STRYK_MIN_SPIKES 1 eller 0): exakt samma kuponger. Motorn väljer i snitt 3 spikar självmant, och minst-2-regeln binder aldrig. Spikarna sitter 56 % (A), lika ofta som modellen säger.
- **Det som faktiskt flyttar 13 rätt är utdelningsgränsen**, inte X (A, 107 omg, data `data/stryktips-backtest-*-{tB2,utd15,utd5}.json`):

| A:s gräns | Summa chans 13 | 13 rätt | 12+ | 11+ | Netto | Netto 23/24, 24/25, 25/26+ |
|---|---|---|---|---|---|---|
| 30–50k (idag) | 27,5 % | 1 | 4 | 12 | +13 088 | −11 990, +36 423, −11 345 |
| 15k | 39,9 % | 1 | 5 | 16 | +23 824 | −12 463, +47 070, −10 783 |
| 5k | 57,1 % | 4 | 12 | 17 | +43 660 | +2 344, +7 379, +33 937 |

  Modellens väntade återbetalning sjunker med lägre gräns (15 649 → 11 304 kr), eftersom favoritraderna betalar lite. Utfallet var ändå bättre, men 13-rättarna med 5k-gräns betalade 4–44k. Ett beslut för användaren (gränsen är användarens regel, 30–50k).

## Vad som håller

**2026-10-03, Stryktipset: varför systemen missar 13 rätt, och spikarna (A, B och C, 107 omgångar 2023/24–2026/27, `data/stryktips-backtest-*-riskC.json`).**
- **Rätt rad finns nästan aldrig i grundraden.** Den låg utanför i 100 av 107 omgångar för A, 105 för B och 104 för C. Det är grundraden (tecknen) som avgör, inte reduceringen. I 70 av A:s 100 missar var 3 eller fler matcher fel.
- Rätt rad har i snitt 4,0 röda (folket ≤ 25 %) och 3,3 kryss. Av A:s missade tecken var 206 av 332 röda och 152 kryss.
- **Modellen är välkalibrerad.** Favoriter vinner som vi säger på alla nivåer (till exempel 70–100 %: 77,7 % mot 76,7 %) och i alla ligor. Felet sitter i vilka matcher som spikas, inte i procenten.
- **Spikarna går sämre än favoriter i allmänhet.** A:s favoritspikar på 45–55 % satt 32 % (väntat 51 %, n 75). Ospikade favoriter på samma nivå vann 49 %. Under 55 % satt A:s spikar 34 % (väntat 45 %, n 166).
- **Kryss är det som fäller spikarna.** Spik när vårt kryss är ≥ 27 %: A satt 32 % (väntat 41 %), under 27 % 62 % (väntat 63 %). 91 av 159 missade favoritspikar i A blev kryss, B 64 av 152, C 68 av 162.
- **Det fanns nästan alltid en bättre spik.** Vid varje svag favoritspik (kryss ≥ 27 % eller p < 55 %) fanns i samma omgång en garderad favorit med kryss < 27 %. Svaga spikar satt / starkaste garderade favoriten hade suttit: A 34 % / 68 % (n 166), B 43 % / 79 % (n 209), C 37 % / 76 % (n 230). Troligen spikar motorn svaga favoriter för att utdelningsgränsen tar bort rader där starka favoriter vinner (de betalar lite). Reservspikarna (favorit som inte bedömts spikbar, för att nå minst 2 spikar eller hålla 30–75k) är de svaga.
- **Exakt vad som stoppade rätt rad när den fanns i grundraden** (räknat som Gambling Cabin, bara färgade garderingar): B 4847 (247 257 kr) 5 röda mot röd max 4; A 4873 (254 901 kr) 4 röda och 2 gröna; A 4915 (285 598 kr) 7 röda och 1 grön; A 4846 (97 744 kr) och C 4825 (92 431 kr) utdelningsgränsen. Övriga betalade 559–9 180 kr och ska bort. Bakkörningen räknade tidigare färger över alla 13 matcher, sedan 2026-10-03 som GC (`colorA/B/C.stop`).
- **B:s röd max skär inga rader** när B har 7 färgade garderingar (4 spikar + 2 blå halvor): grön + gul + röd = 7 och grön minst 3 ger högst 4 röda. Grön 2–6 i B testades (röd 0–6 gav då fler rader) men gav netto −25 339 kr mot −1 807 kr (12 rätt 4 → 2). Grönt är kvar på 3–6 (användaren 2026-10-03). Körningen: `data/stryktips-backtest-*-greenB26.json`.
- **Resultat av varianterna (107 omg, `data/stryktips-backtest-*-{redB5,spik27,spiktop4,redA4,nya-regler}.json`):**
  - B röd max 5 (1–5/2–5): netto −1 807 → +4 033 kr, 12 rätt 4 → 5, samma chans och gräns. **Infört.**
  - Reservspik bara på omgångens 4 starkaste favoriter: spikträff A 53,3 → 56,2 %, C 41,1 → 46,5 %, B 46,5 → 44,5 %. Chans C 0,21 → 0,27 %, 11+ rätt C 12 → 15. **Infört i A och C** (`SPIK_TOP`), inte i B. Går det inte (för få starka favoriter när utdelningsgränsen kräver 4 spikar) väljs som förut.
  - Reservspik bara när krysset < 27 %: samma riktning men svagare (A 54,8 %, C 45,9 %, B 45,9 %). Inte infört, reglaget finns kvar (`STRYK_SPIK_X_MAX`).
  - A röd 1–4: **förkastat**. Chans A 0,22 → 0,14 %, gränsen höll bara 49 av 107 gånger (idag 98), B blev också sämre.
  - Båda införda tillsammans: A netto −22 111 → +24 239 kr (en 13:a, omg 4876), B −1 807 → +11 273 kr, C +216 877 → −49 034 kr. C tappade 13 rätt i omg 4847 (280 850 kr) men fick högre chans (0,27 mot 0,21 %) och fler 11+ (15 mot 12). Nettot avgörs av enstaka omgångar – följ upp spikträffen live.
  - Nästa idé: när toppregeln inte går, vidga gradvis (5, 6 starkaste) i stället för att släppa den helt. Bakkörningen går nu på 15–20 min med `scripts/backtest-parallel.mjs`.
- Analysen ska göras om när fler omgångar finns: spikar per kryssnivå och "fanns en bättre spik".

**2026-10-03 (eftermiddag), Stryktipset: varför inte 13 rätt i de stora omgångarna (82 av 107 omgångar med 13 rätt > 40 000 kr, `data/stryktips-backtest-*-nya-regler.json`).**
- **Modellen väntar sig inte fler.** Summan av chansen till 13 rätt var 0,19 för A och 0,07 för B på de 82 omgångarna. Utfallet: A en 13:a (4876, 43 372 kr), B ingen. Det är ingen otur.
- **Rätt rad låg i grundraden i 4 av 82 omgångar (A) och 2 (B).** I snitt 3,3 (A) och 3,5 (B) fel i grundraden. Stora omgångar har i median 4 röda och 3 kryss, och rätt rad ligger på plats ~200 000 av 1,6 miljoner enligt modellen. Vanligaste felen: A halv 1X → röd 2:a (65), spik 1 → rött kryss (44); B halv 1X → röd 2:a (35), spik 1 → röd 2:a (32).
- Spikarna satt sämre än väntat i just de stora omgångarna (A 144/269 mot 156) och bättre i de små. Det är urvalet (omgången blir stor för att favoriter föll), inte en felkalibrering.
- **B:s teckenregel 3-3-3 uteslöt rätt rad i 51 av 107 omgångar** (för få kryss 34, för få tvåor 19), 33 av de 82 stora. Bland dem 4847 (247 257 kr): rätt rad låg i B:s grundrad och klarade färg och gräns men hade 2 kryss. A:s 4-2-2 uteslöt 23 av 107, bland dem båda 10-miljonersomgångarna (4896, 4970: 3 ettor), men där hade A:s grundrad ändå 3 och 5 fel.
- Bakkörning 107 omg (`data/stryktips-backtest-*-sign{A322,B322,B222,AB322}.json`):
  - B 3-2-2: chans 13 rätt 0,087 → 0,099 % per omgång, högre i alla tre perioderna (0,084 → 0,097, 0,092 → 0,109, 0,087 → 0,093). Väntad återbetalning lika eller högre. 13 rätt i 4825 (92 431 kr), netto +11 273 → +85 902 kr (den enda 13:an, alltså brus i kronor). **Infört.**
  - B 2-2-2: samma chans, lite sämre netto. A 3-2-2: ingen skillnad i A (0,234 → 0,232 %), C sämre (C ärver A:s regel). Inte infört.
- **Ett system för 400 kr når inte en 10-miljonersrad.** De 400 rader som har störst chans bland raderna som betalar minst 5 miljoner ger träff en gång på ~18 000 omgångar (minst 1 miljon: en på ~2 400). Sådana rader har oftast 6–8 röda. Ingen regel ändrar det; det som går är att inte stänga ute raderna (som teckenregeln gjorde). Skript: per-match-fälten i bakkörningen (`pickA/pickB`, `C.picks`, `final`, `folk`, `outcome`).

0. **2026-09-30, truppens marknadsvärde i ligor UTAN odds (kandidat, starkaste fyndet i spelardatan).** Skript: `scripts/lardomar-spelare-truppvarde.mjs`. x = ln(värde hemma / borta), där värdet är summan för de 14 med flest ligaminuter i år, med marknadsvärdet vid matchdatum (`marketValueHistory`). Mot tipsens sannolikheter (`data/reports/tips-backtest.json`):
   - Ligor utan odds (BR2, COL, CZ, HR, NO2, SE2, n 1 015): b 0,20 p per enhet, **z 3,3**. Per liga: COL z 2,2, NO2 z 2,2, HR z 2,0, BR2 z 1,4, CZ z 0,9, SE2 z −0,2.
   - Ligor med odds: z 0,5 mot tipsen och z 1,0 mot stängningsodds. Marknaden har det redan.
   - Halvtest (ligor utan odds): vikten väljs på matcher före 2026-07-07 (k 0,12 i `p' ∝ p·exp(k·x·[1,0,−1])`) och testas efter. Logloss 1,0226 → 1,0139 (z −3,0), bättre i alla 6 ligor, träff 48,6 → 49,2 %. Med k 0,12 blir även första halvan bättre (1,0421 → 1,0407). Fritt vald k på andra halvan (0,28) blir sämre på den första. Använd en försiktig vikt.
   - Svagheter: truppen är dagens (spelare som kom under säsongen räknas bakåt) och perioden är bara 2026. Modellen (Dixon-Coles på resultat) vet inget om kvalitet utöver resultaten, och där tillför värdet något.
   - **Förslag, inte infört:** väg in k ≈ 0,10 i 1X2-tipsen för ligor utan odds. Kör om skriptet när NO2, SE2 och BR2 har spelat klart 2026.

1. **Serie A och Serie B: oddsen har en strukturell bias.** Hemmalagen i Serie A vann mer sällan än öppningsoddsen sade i 9 av 9 hela säsonger (2017/18–2025/26). Kryss kom oftare än väntat i 7 av 9 säsonger i båda ligorna, i Serie B i snitt cirka +3 procentenheter. Favoriter vann oftare än väntat, och marknaden stänger bara en del av gapet före avspark. Kalibreringen förbättrade kontrollen: Serie A −0,0046 (z −3,0), Serie B −0,0031 (z −2,3) mot öppning, och −0,0037 (z −2,6) respektive −0,0032 (z −2,0) mot stängning.
2. **Liga-kalibrering av öppningsodds** för alla fd-ligor (favorit-, hemma- och kryssbias per liga, med straff) gav −0,0006 (z −2,0) i kontrollen. **Infört i Oddset** 2026-09-28 (se beslut). I Oddset-simuleringen: 4 248 spel och avkastning 7,8 % ± 2,4 % mot 1 287 spel och 2,3 % ± 4,6 % utan justering. Den mesta ökningen är kryss. Med snittodds blev det 467 spel och 8,0 % ± 6,5 %, alltså inte säkerställt i kronor.
3. **Starka favoriter i La Liga (65–75 %) och Portugal (75 %+)** vann oftare än oddsen säger (76,9 % mot 69,5 % och 88,0 % mot 81,3 %), bekräftat i både träning och kontroll. Det fångas av kalibreringen (g > 0).
4. **Danmark: inbördes möten** (poängskillnad) bekräftat i träning och kontroll (z 3,2), men det är den enda ligan av 23. Kandidat, inte infört.
5. **Stryktipset och Europatipset: folket.** Folket streckar favoriten ×1,13 av vår sannolikhet och kryss 2,1 procentenheter under vår procent. Utfall per tecken mot folkets streck: 1 = 0,94, X = 1,10, 2 = 1,00. Kryss är det tecken som betalar mest i förhållande till strecken. Det fångas redan av utdelningsgränsen i systemen.
   - Mest överspelade lag (folk/vår procent, minst 6 matcher): Southampton ×1,20, Coventry ×1,18, Ipswich ×1,17, Manchester City ×1,16 (36 matcher), Barcelona ×1,13.
   - Mest underspelade: Burnley ×0,66 (33 matcher), Sheffield Wednesday ×0,66, Parma och Lecce ×0,72, Oxford ×0,77.
   - Folket slår inte oddsen i PL (logloss 1,016 mot vår 0,995) eller Championship (1,119 mot 1,071), men väl i Bundesliga och Ligue 1 (få matcher, 55 st).

**2026-10-03 (kväll), Stryktipset: storomgångarna med PL (13 rätt > 50 000 kr) och tre färger + ny A/B-regel.**
- **Historiken utan modellen** (168 omgångar i `data/tips-archive/raw`, 107 med PL): 80 av 107 PL-omgångar gav över 50 000 kr eller ingen 13:a. De hade i snitt 6,4 tecken som folket streckat under 30 % (de små 3,4) och 3,6 kryss (2,4). Med 6 eller fler sådana blev det alltid över 50 000 kr. Folket överstreckar favoriter (80–89 % i folket vann 71 %, oddsen sa 75 %), oddsen är välkalibrerade. En tredjedel av de engelska 1/2-skrällarna vann med färre skott på mål. Rapport: artefakten "Stryktipsets storomgångar".
- **Användarens beslut (2026-10-03):** bara tre färger i Gambling Cabin (blå, grön, röd – tecken på 26–44 % är blå utan regel, gult skär aldrig, kupong D:s 26–35 % är grönt) och "A och B får inte ha samma garderingar men max 1 spik skilja" (B ärver A:s spikar, `AB_SPIK_DIFF` 1). A är huvudsystemet. Grön- och rödregeln fick göras om.
- **Varianter, 107 omg, C av** (`data/stryktips-backtest-{2324,2425,budget}-tre-*.json`, `tre-bas` = tre färger + A/B-regeln). Chans = summan av chansen till 13 rätt över omgångarna:
  - `tre-bas`: A chans 23,98 %, 13/12/11 rätt 1/4/5, spikar sprack 46 %. B chans 14,22 % (förut 10,59 % i `bas`), spikar sprack 50 % (56 %).
  - Ingen skrällspik i A (`STRYK_SKRALL_A=0`): chans 23,87 %, spikar 45 %, A:s 13:a försvann. **Förkastat.**
  - Ingen spik på överstreckad favorit (`STRYK_OVER_SPIK=0.1`): A chans 21,22 %, spikar 48 %. **Förkastat** – marknaden prissätter redan favoriten rätt.
  - Favorit + X i stället för 1-2 när folket ger X < 20 % och vi ≥ 22 % (`STRYK_X_FOLK`): A oförändrad, B chans 14,39 %, netto lite bättre. **Infört** (liten effekt, ca 0,7 matcher per omgång).
  - A röd 1–4: chans 13,56 %. A röd 2–5: 16,28 %, 13:an försvann. Grönregeln av: A chans 21,66 %, 12 rätt 4 → 1. **Alla förkastade** – A har kvar röd 1–3 och grön 3–6, B röd 1–5/2–5.
- **Slutkörning med C, nya standardregler** (`data/stryktips-backtest-*-tre-slut.json`): A chans 23,98 % (25,05 % i `bas` före blått X och tre färger), 13/12/11 rätt 1/4/5, netto +27 192 kr. B chans 14,39 % (10,59 %), spikar sprack 50 % (56 %), netto −33 899 kr mot +85 902 kr – skillnaden är B:s enda 13:a i `bas` (4825, 92 431 kr). C chans 28,93 % (28,44 % i `spiktop4`), 12 rätt 2 → 3, netto −40 197 kr (−49 034 kr). Öppen omgång 4973: A identisk med HEAD-motorn på samma streck, B 1 på 975 mot 1 på 1 450. Gambling Cabin-länken provad i verktyget: bara blå, röda och gröna celler, gul regel av.

**2026-10-03 (natt), Stryktipset: 30 iterationer för högst chans till 13 rätt** (användaren: "kör 30 iterationer av ändringar tills du hittat den bästa"). Fast: tre färger, A/B-regeln, A huvudsystem, 350–400 kr och utdelningsgränserna. Mått: summan av kupongens chans till 13 rätt över 107 omgångar (C av), bas `tre-xfolk` A 23,98 % / B 14,39 %. Filer `data/stryktips-backtest-*-itNN-*.json`.
- **Tak:** de 400 troligaste raderna med utdelning ≥ 30 000 kr ger 42,5 % (≥ 50 000 kr 31,7 %, utan gräns 179,6 %). Utdelningsgränsen är den största begränsningen; Gambling Cabins gräns tar bort de troligaste raderna, så regler som tar bort osannolika rader (färre röda) låter gränsen ligga lågt.
- **Ingen effekt eller sämre (A chans):** min röda 3 (−0,16), 2 helor (−1,01), 4 helor (−0,33), 1 blå halva (−1,90), 3 blå halvor (−3,18), spikgräns 50 % (−0,15), spiktopp 0 (−1,99) och 3 (−0,29), större grundrad (±0), max 5 spikar (±0), grön 3–7 (±0), grön 4–6 (−1,55), röd 0–3 (±0), tecken 4-3-2 (−1,30), utan färgfönster (±0).
- **Bättre:** röd 1–2 i A +1,51 (12 rätt 4 → 5, 11 rätt 5 → 8, gränsen höll 105 mot 89), gränsen på 90 % av budgeten +1,01, tecken 5-2-2 +0,33, utan favoritregeln +0,13.
- **Kombinationer:** röd 1–2 + 90 % = **26,71 % (+2,73, +11 %)**. Med sikte 100 % 26,78, utan favoritregeln 26,95 (bryter användarens 10 %-regel), kryssvikt 1,1 26,80, spikgräns 60 % 26,72, min röda 3 26,68, 2 helor 26,27 (B 13,92). Röd 0–2, 5-2-2 och B röd 1–4/2–4 gav inget extra.
- **Infört:** A röd 1–2 (`RED_RULE`), `CUT_AIM` 0,9 (ca 395 rader), B:s reserv röd 1–2 och sedan 1–3 innan fria färger (B chans 12,32 % mot 10,62 % med bara 1–3; med bara 1–2 fick Stryktipset 4973 fria färger), C:s reserv kvar 1–3. Fast färg går före fria färger i reservordningen. Skyddet "3 röda + resten gröna" gäller B och C, i A blir det "2 röda + resten gröna" (`redGreenTop`). Slutkörning med C (`*-iter-slut2.json`): A 26,71 %, B 14,39 → 12,32 % (B byggs mot A, som är huvudsystemet; gränsen höll 77 mot 89), C 28,93 → 31,02 %.

**2026-10-04, Stryktipset: vad A (30–50k) missar och grundrad mot gränsen** (användaren: "spinn vidare på det som gett över 50k, bara 30–50k är viktigt"). 107 omg, C av, filer `data/stryktips-backtest-*-g-*.json`.
- **Var A tappar 13 rätt:** i 80 omgångar betalade 13 rätt ≥ 50 000 kr, och rätt rad låg i A:s grundrad i bara 3 av dem. Spikarna sprack 123 av 258 gånger (67 på kryss, 52 på skräll), halvorna 114 av 385. Kalibreringen håller (spik favorit väntat 58 %, utfall 57 %; halva med X 80 mot 75 %), så det är inga felbedömda matcher utan att favoriter faller.
- **Gapet till taket:** bästa 395 raderna ≥ 30 000 kr bland alla rader 42,1 %, bästa 395 inom A:s grundrad 33,2 %, A efter GC-reglerna 26,7 %. Grundraden kostar alltså 8,8 enheter, reduceringen 6,5.
- **Orsak:** grundraden väljs efter chansen att rätt rad finns i den, men gränsen stryker favoritraderna. Offline gav vikten p × folk^−0,5 grundrader med 38,2 % (inom-grundrad-tak), men nästan allt försvinner med röd max 2 (rader över gränsen har ofta 3 understreckade tecken).
- **I motorn (extra grundradskandidater, valet efter kupongens chans):** β 0,5 27,20 %, **β 0,3 + 0,5 27,46 %** (bas 26,75; 8,41→8,68, 9,33→9,62, 9,00→9,16 per period), B 15,67 → 16,66 %. 12 rätt 6 → 4 och 11+ 14 → 12 (brus, 2 omgångar). Med A röd 1–3 26,53 %, röd 1–4 25,22 % – röd 1–2 kvar.
- **Infört:** `GRUND_TILT` [0, 0,3, 0,5] i `scripts/fetch-stryktipset.mjs` och `gui/public/stryk-engine.js` (`tiltShare`), test i lib-units.
- **2026-10-04, rätt rad i A:s grundrad men ingen 13:a** (`*-motB.json`, 107 omg): 9 omgångar hade rätt rad i grundraden, 13 rätt bara i 4876. Fyra betalade under 30 000 kr (gränsen, som tänkt). Fyra betalade mer: 4846 (97 744 kr), 4873 (254 901), 4915 (285 598), 4944 (1 181 818). Alla fyra stoppades av **färgreglerna, både röd 1–2 och grön 3–6**: rätt rad hade 3/4/7/7 röda och 2/2/1/0 gröna bland garderingarna (spikar och blå räknas inte). Teckenregeln 4-2-2 och utdelningsgränsen stoppade ingen. Röd 1–3 och grönregeln av är redan bakkörda och sämre totalt; A är byggt för små och mellanstora omgångar, och de stora omgångarna ligger utanför A med avsikt.
- **2026-10-04, egen lutning för B (`GRUND_TILT_B`)** (användaren: "oftare pricka in skrällar så jag får in mycket pengar"). 107 omg, C av, A oförändrad, filer `data/stryktips-backtest-*-tB{1,2,3}.json`, bas `*-arvB.json`. Väntad återbetalning = summan av chans × verklig utdelning per kostnad (modellens).

  | B-lutning (beta) | Chans 13 (summa) | Per period | Väntad återbet. kr/kr | 12/11 rätt | Netto |
  |---|---|---|---|---|---|
  | 0 / 0,3 / 0,5 (som A, förut) | 16,67 % | 5,57/5,50/5,61 | 0,48 | 3/5 | −25 658 |
  | 0 / 0,3 / 0,5 / 0,8 / 1 | 16,73 % | 5,43/5,59/5,72 | 0,51 | 4/6 | −24 520 |
  | **0,5 / 0,8 / 1** | **16,35 %** | 5,29/5,35/5,71 | **0,66** | 4/5 | −18 013 |
  | 1 / 1,5 | 9,33 % | 3,00/3,37/2,96 | 0,85 | 0/8 + en 13:a (4921, 177 604 kr) | +152 828 |
  - **Infört 0,5/0,8/1 för B** (båda motorerna, test i lib-units): nästan samma chans (−0,3 enheter) men en tredjedel högre utdelning när B sitter. 1/1,5 halverar chansen; dess 13:a är en enda omgång (brus). Grundraden träffar fortfarande nästan aldrig storomgångarna (1 av 76), så lutningen flyttar utdelningen uppåt, inte träffen.
- **Noterat, inte ändrat:** verklig 13-rättsutdelning är i median 1,33 × GC-formelns (25 milj omsättning). 30 000 kr i länken motsvarar alltså ungefär 40 000 kr i verkligheten. I 6 av 107 omgångar betalade rätt rad ≥ 30 000 kr fast GC räknade under 30 000 (t.ex. 4951: GC 29 629, verkligt 63 157). Gränsen i länken är användarens regel och rördes inte.

**2026-10-05: kupong D borttagen** (användaren: "Ta bort D från stryck och Europa tips den känns helt onödig"). Motorn, kortet och testerna för D är borta; anteckningarna nedan är kvar som historik.

**2026-10-04, Stryktipset: kupong D ombyggd till fritt system för vinster över 20 000 kr** (användaren: "bygg om D utifrån alla lärdomar, gräns 15k mer eller lite mindre", sedan "skippa alla regler … viktigt är att vinna större summor än massa små. Summor över 20k"). 107 omg (samma som A/B/C), bara D, 350–400 kr. Mått: summerad chans till 13 rätt (modellen) och chans till 13 rätt som betalar minst 20 000 kr (verklig omsättning). Bakkörningsskripten för D sparades inte i repot (engångskörning). Samma sökning finns i `searchD`.
- **Gamla D** (4/4/5, röd 1–3, grön 1–3, 4-3-3, 30–50k): chans 25,2 %, budgeten höll i 76 av 107, netto −25 204 kr. Rätt rad låg i grundraden i 9 omgångar men stoppades av färg- eller teckenreglerna i 8.
- **Regel-D med 15k:** 36,1 %. Teckenregeln 4-3-3 var största bromsen: 4-2-2 gav 38,4 % och med lutad grundrad och favorit+X-halvor 40,6 % (bättre i alla tre perioderna). Röd 1–2/1–4/2–4, grönt av, andra former (3/5/5, 4/3/6, 5/3/5, 4/5/4) och spikar bara på starka favoriter eller kryss < 27 % var sämre.
- **Fritt D** (valfri spik/halv/hel på valfria tecken, ingen färg- eller teckenregel, bara lägsta utdelning i GC-formeln): chans till 13 rätt ≥ 20 000 kr per gräns i länken: 15k 34,3 %, 18k 38,2 %, **20k 40,3 %**, 22k 39,8 %, 25k 37,9 % (all utdelning: 50,0 / 45,4 / 43,2 / 40,6 / 38,2 %). Sökningen väljer i snitt 5,3 spikar, 4,5 halvor och 3,2 helor (4–7 spikar) och en liten grundrad (~800 rader) som gränsen halverar.
- Utfall fritt D 20k: en 13:a (4815, bara 12 106 kr trots GC-gräns 20 000 – verklig utdelning kan bli lägre än GC-formeln), 12 rätt i 6 omg, 11+ i 20, netto +82 kr (kostnad 42 545 kr; per period +17 736 / −11 099 / −6 555). Gambling Cabin-länken provad (Europatipset 2613): rätt grundrad, 399 kr mot motorns 400.
- **Infört:** D = fritt system, gräns 20 000 kr (`D_RULES`, `searchD`, `makeEvalD` i `gui/public/stryk-engine.js`, 100 000 provade grundrader ≈ 2–3 s, cache per omgång och krav). Test i lib-units ("kupong D").
- **2026-10-04 (senare), D reducerat** (användaren: "System D är inte något reducerat system, bygg vidare på det du gjort där men gör det reducerat också"). Det fria D valde en liten grundrad (snitt ~870 rader) som 20k-gränsen bara skar ner till 400 – i praktiken oreducerat. Nu är grundraden minst 3 000 rader (snitt ~10 000) och reduceras till 350–400 med regler som sökningen väljer fritt per omgång: antal 1/X/2, gröna och röda bland garderingarna och lägsta utdelning 20 000 kr (GC-formeln, kan höjas). Reglerna stramas åt en gräns i taget, den som tar bort minst chans per borttagen rad. Bakkörning 107 omg (GC-omsättning 25 milj), summerad chans till 13 rätt: bara utdelning 35,5 % (12,7 / 11,8 / 10,9 per period), reducerat gmin 1 500 45,5 %, **3 000 45,3 %** (16,3 / 15,1 / 13,9), 6 000 44,9 %. 12 rätt 5 mot 5, 11+ 21 mot 18. Reglerna sparar de troligare raderna i stället för att bara behålla de högst betalande. Skriptet var en engångskörning (inte i repot).

### Förkastat 2026-10-04, lagfilerna: har marknaden missat något per lag?
Lagfilerna (`docs/lardomar/lag/`, 649 lag) beskriver mönster per lag (form mot marknaden, hemma/borta, kryss, efter uppehåll, svårt för, nyckelspelare). Att plocka ut enskilda lag som sticker ut vore att jaga brus, så varje mönster testades på alla lag i 34 ligor (182 628 lag-matcher med stängningsodds): förutsäger lagets avvikelse mot marknaden i en period avvikelsen i nästa? Krav |z| ≥ 2,5 i träning och ≥ 2 i kontroll (2023/24– eller 2024–).

| Mönster | Träning z | Kontroll z | PL/CH/L1 kontroll z |
|---|---|---|---|
| Mot marknaden, säsong → nästa | −0,2 | −0,6 | −1,5 |
| Mot marknaden, första halvan → andra | −0,8 | +1,0 | 0,0 |
| Mot marknaden, 10 matcher → nästa 10 | −1,3 | −0,5 | +1,0 |
| Hemma / borta mot marknaden, säsong → nästa | −0,5 / −0,4 | +1,5 / +0,8 | −0,4 / −0,8 |
| Egen hemmafördel (hemma − borta), säsong → nästa | −0,6 | +3,0 | – |
| Kryss mot oddsen, säsong → nästa / halva / 10 | +1,6 / −0,9 / −0,1 | +1,0 / −0,9 / −0,9 | +1,1 / −0,3 / −0,2 |
| Som storfavorit (≥ 60 %) / skräll (≤ 25 %), säsong → nästa | +1,0 / +0,6 | +0,4 / −0,5 | +1,0 / −0,1 |

- **Inget håller.** Lagets avvikelse mot oddsen (totalt, hemma, borta, kryss, som favorit eller skräll) bär inte över till nästa period. Egen hemmafördel z +3,0 i kontrollen men −0,6 i träningen: inte bekräftat, följ upp efter 2026/27. Efter uppehåll, inbördes ("svårt för") och nyckelspelare är redan förkastade på ligenivå (2026-09-28/30). Lagfilerna är beskrivande, inte spelbara. Inget fördes in i D eller tipsen. Skript: `scripts/lardomar-lagmonster.mjs`.

## Beslut

- **2026-09-28, felanalys av tipsen per liga (kväll):** webbens träffruta visade grundmodellens träff, men i ligor med odds styr oddsen tipsen. Grundmodellen tippar hemmalaget för ofta (flata procent, oavgjort går till hemma), och när den och oddsen var oense hade oddsen rätt oftare (till exempel Championship 10 mot 0 av 17, Brasilien 17 mot 8). Pro-lagret räknar nu tipsmotorns riktiga träff per liga och säsong (`evaluation.tipAccuracy`, per match i `data/reports/tips-backtest.json`), och webben visar den med "väntat". Championship 36,6 % → 45,3 %, PL 40,0 % → 46,0 %. Bara League One ligger klart under tipsens egna procent (34,5 % mot 46,1 %, z −2,2, 87 matcher). Datafel är uteslutet, förra säsongen låg ligan på z +1,3, så det bedöms som slump. Följ upp.
- **2026-09-28:** i PL vägdes blandningen DC + grundmodell in med 30 % i det oddsstyrda tipset, men marknadstestet mätte DC ensam. Nu vägs DC in, som testat.
- **2026-09-28:** en lärdomsfil per liga, `docs/lardomar/anteckningar/<liga>.md` (35 st, även League Two och cuperna). Den automatiska delen uppdateras dagligen i molnet (`npm run felanalys`, steg "Felanalys per liga"). Handskrivna, daterade lärdomar står under egen rubrik och ligger kvar. Översikt: `docs/lardomar/anteckningar/README.md`.
- **2026-09-28:** Oddset (`scripts/pro-layer.mjs`) justerar 1X2-facit med liga-kalibreringen (`config/learned-adjustments.json`, bas "open") när avsparken är minst 24 timmar bort (`CONFIG.learnedMinHours`). Tipsen visar före- och efter-procent i `pro.market.learned`. Det kan stängas av med `LEARNED_OFF=1`. Första körningen gav 50 värdespel mot 22 utan justering: 32 nya, varav 20 i Serie A/B (13 kryss, 7 favoriter/bortalag), 7 kryss i Eredivisie och Bundesliga 1–2, och 4 som försvann.
- **2026-09-28, enskilda matcher (Oddset-tipsen), alla ligor:** pro-lagrets marknadstest (halva perioden väljer vikt, andra halvan kontrollerar, 250–930 matcher per liga) visar att **oddsen slår lagmodellen i 21 av 22 ligor**. Modellens logloss är 0,01–0,04 sämre, vilket är tio gånger större än alla signaler ovan. Bara i PL tillför modellen något (vikt 20–30 %). För över/under 2,5 är Pinnacle bättre i 11 av 13 ligor (PL lika, Grekland modellen). Därför styr oddsen nu 1X2-tipset hela säsongen när odds finns (`CONFIG.marketLedTips`), modellen vägs in med den testade vikten, och O/U följer oddsen där de var bättre. Första körningen: 243 av 624 tips oddsstyrda, 48 bytte 1X2-tecken. Tips utan odds (långt fram eller ligor utan odds) följer modellen som förut. "Tipsens träff" i webben bygger på modellens historik tills ledgern har nya avgjorda tips.
- **Kryss tippas nästan aldrig**, och det är rätt: ett 1X2-tips väljer det mest sannolika utfallet, och kryss är nästan aldrig det (även med oddsen). Värdet i kryss fångas i stället av Värde/Ej värde-omdömet, där kalibreringen ger fler kryss med värde i Serie A/B och Eredivisie.
- **2026-09-28:** Stryktipset och Europatipset justeras **inte**. Mot stängningsodds klarade ingen variant kontrollen totalt (−0,0002, z −0,7). Italien ensamt klarar det (se ovan). Ett eget undantag för Serie A/B på Europatipset (cirka 2 matcher per omgång ger cirka +0,7 % chans till 13 rätt) är ett beslut för användaren.
- **2026-09-28, metodlärdom:** att välja ligor per liga på valideringsdata var skört. Med "dLL < 0" kom brusligor med (PL blev sämre), och med "z ≤ −1" åkte Serie A ut. Därför bestämdes slutregeln i förväg: kalibrera alla ligor med straff, utan signaler. Välj aldrig ligor på kontrollperioden.

## Följ upp

- **Stryktipset, A:s utdelningsgräns (2026-10-04): beslut 15k** (användaren: "kör 15k på A"). Alla gränser, A, 107 omg, C av:

| Gräns | Chans 13 (summa) | 13 | 12+ | 11+ | 10+ | Netto | Modellens väntade |
|---|---|---|---|---|---|---|---|
| 30k (förr) | 27,5 % | 1 | 4 | 12 | 32 | +13 088 | 15 649 |
| 20k | 34,9 % | 1 | 6 | 12 | 40 | +27 072 | 13 883 |
| 15k | 39,8 % | 1 | 5 | 16 | 40 | +23 824 | 13 234 |
| 10k | 47,2 % | 0 | 7 | 16 | 40 | −19 639 | 12 332 |
| 5k | 57,1 % | 4 | 12 | 17 | 39 | +43 660 | 11 304 |

  Chans och 10–11 rätt stiger jämnt när gränsen sänks. Nettot hoppar (10k minus, 5k stort plus), så det styrs av enstaka träffar. 15k är mellanläget. Följ upp: jämför 11+ och netto för A i skarpa omgångar efter cirka 30 omg.
- **Europatipset A** behåller 20k. 55 omg (2025/26–): 20k chans 17,5 %, 11+ 9, netto −15 820; 15k 21,0 %, 11+ 6, −11 334; 10k 24,5 %, 11+ 9, 12+ 4, −9 011. Blandat och för litet urval. Kör om när fler omgångar finns (`data/europatips-backtest-utd*.json`).

- **Hästar V85 (2026-10-04):** V85 Boden 2026-10-03 gav 4 av 8 med en analys gjord kl. 10:19. Med slutstrecket hade samma system gett 6 av 8, eftersom sena pengar gick till tre vinnare. Beslut: analysera nära spelstopp. Barfota ändrat (streck < 10 % vinner 1,56 × strecket) är redan inprisat av modellen (rest 1,19, z 1,9, inte bekräftat). Km-tider justerade för distans och startmetod: z −2,97 på 2025–2026, men z −0,58 på fem år (2021–2026, 21 100 lopp). Inte infört, testa igen i januari 2027. Hästhistoriken täcker nu 2021–2026. Detaljer: [anteckningar/V85.md](anteckningar/V85.md).

- **Hästar V85 (2026-10-09), 8 rätt och vinster över 20 000 kr:** Systemet missar nästan alltid vinnare under 5 % streck (V85 4 %, V86 3 % med i systemet), och 8 rätt över 20 000 kr kräver 1–2 sådana på V85. Raka system gav aldrig över 20 000 kr på V85 (0 av 74). Skrällsystem ≥ 3 per rad på 1 000 kr: V85 +275 % (3 vinster ≥ 20k), V75 2023/2024 +43/+34 %, men minus utan de tre största vinsterna. ≥ 2 per rad på 2 000 kr var bäst på V85 men −47 % på V75 båda åren. Loppbeskrivningar (position, otur) saknas och finns inte i öppna API:er. Ersättningssignaler höll inte (bäst: ursäkt i 2 av 3 senaste bland skrällar, 1,17 × modellen, z 2,1). Ingen ändring. Platsodds sparas nu i streckbilderna. Detaljer: [anteckningar/V85.md](anteckningar/V85.md).

- **Hästar (2026-10-09 kväll), fältets resultat i tidigare lopp:** 89 486 lopp hämtade från ATG (`scripts/hastar-lopp.mjs`). Nya faktorer: meter efter vinnaren senast och snitt 3, nära utan plats, km-tid mot fältet. Bättre logloss i båda testperioderna (2025–26 −0,00093, z −1,77; 2024 −0,00148, z −2,44), rullande omlärning 1,6853 mot marknaden 1,7030, vikterna skrivna. V85 själv: ingen effekt (+0,0002), och V85/V86-systemen 2025–26 fick inte fler rätt (inom slumpen). Följ upp efter cirka 30 omgångar. Detaljer: [anteckningar/V85.md](anteckningar/V85.md).

- **Ligor helt utan oddshistorik** (Colombia, Brasilien B, Chile, J2, J3, K League, Superettan, Div 1, OBOS, Danmark 1. div, Tjeckien, Kroatien): där kan varken marknadstest eller kalibrering göras, och tipsen följer modellen. `data/matcher/<liga>.csv` sparar från och med nu oddsen vi ser före varje match (`pre_first_*`, `pre_last_*`). Efter cirka 150 matcher per liga kan marknadstestet köras där också. Modellen slår "alltid hemmavinst" i 10 av 13 sådana ligor, men inte i Chile (44,3 % mot 48,9 %, n 167; bortatipsen träffar 33 %, vilket tyder på underskattad hemmafördel), K League (32,5 % mot 36,5 %, n 166) och Danmark 1. div (35,7 % mot 38,2 %, n 42). Urvalen är för små för att ändra något nu. Granska hemmafördelen i Chile och K League med `npm run tune` när fler matcher finns.
- **League One** (z −2,2 i år): ligger z fortfarande ≤ −2 efter 200 matcher, granska oddskällan (egen avläsning mot stängning). **Portugal** (z −1,8) och **Superettan** (z −1,8 förra säsongen): följ upp i ligafilerna.
- **Oddsstyrda tips:** jämför träffen i `data/tips-ledger.json` före och efter 2026-09-28, per liga.

- **Premier League** blev marginellt sämre med kalibreringen i kontrollen (+0,0014, z +1,9). Om den blir sämre med z > 2 vid nästa körning: ta bort PL ur justeringen.
- **Oddset-utfallet med justering**: följ värdespelen i `data/tips-ledger.json` separat för justerade tips (`pro.market.learned`), särskilt kryss i Serie A/B. Efter 150+ avgjorda spel: jämför CLV och avkastning mot ojusterade.
- **Nyckelspelare:** kör om när 2026/27 är klar (fler matcher). Hypotes: marknaden överreagerar på frånvaro.
- **Uppflyttade och nedflyttade lag:** svag negativ effekt (z ≈ −2), testa igen efter säsongen 2026/27.
- **Europatipset Serie A/B-undantag:** backtesta med `scripts/backtest-stryktipset.mjs` om användaren vill.

- **Spelardatan (2026-09-30):** Europamatch ≤ 4 dagar före (+0,14 p mot stängning, z 1,6, n 169) och truppvärdet i ligor utan odds. Kör båda skripten igen om 1–2 månader. Spelarloggen är bara 10 matcher, så **spara lag-matchraderna löpande** (se "Data" nedan) för att få ett växande urval.

## Data: var allt ligger och hur det är uppbyggt (2026-09-30)

Läs detta först nästa gång. Alla sökvägar är relativa till projektroten. Sannolikheter i matchfilerna är utan bolagsmarginal.

**Matcher och resultat**
- `data/matcher/<liga>.csv`, en rad per match (`npm run matcher`, dagligen). Innehåller status spelad/kommande, datum, lag, mål, res H/D/A, skott, xG (`xg_src` understat eller skott-proxy), domare, hörnor, kort, öppnings- och stängningsodds som sannolikheter (`open_*`, `close_*`, `pin_close`), `best_*`, `over25_*`, förberäknade signaler (`luck`, `gap`, `mres`, `rest`, `h2h_*`, `promo`, `releg`, `miss_*`, `steam`, `book`) och våra egna oddsavläsningar (`pre_first_*`, `pre_last_*`). Beskrivning: `data/matcher/README.md`. **Utgå från den här filen** när något ska testas mot odds.
- Ligor utan oddshistorik (inga `close_*`): BR2, COL, CZ, HR, NO2, SE2, SE3N, SE3S. CL, EL och ECL är cuper och saknar ligamatcher i csv.
- `data/betting-store.json` är den stora matchbasen, som webben och modellerna läser (`matches` 23 000+, `teams`, `accuracy*`, `edgeBoards`). `data/raw/<liga>_<säsong>.csv` och `data/raw/<liga>_all.csv` är rådata från football-data med mera.
- `data/open/` innehåller källfiler: Understat-xG per liga och säsong (`understat_xg_<liga>_<säsong>.json`), Understat per spelare och match (`understat_player_matches.json`, topp 5 från 2024/25), ClubElo, FPL-tillgänglighet, ESPN-laguppställningar, domare, Oddsportal, oddshistorik.

**Tips och facit**
- `data/reports/tips-backtest.json`: `matches[]` med `league, season, date, home, away, result, source (modell/odds), pick, hit, p [H,D,A], dc, base, market`. Tipsens egna sannolikheter per match. Använd den som facit för "tillför X något utöver tipsen", särskilt i ligor utan odds.
- `data/tips-ledger.json`: live-tips med utfall och CLV (`entries`). `data/tips-latest.json`: senaste körningens tips. `data/reports/pro-evaluation.json`: pro-lagrets marknadstest.
- `data/lardomar.json` och `data/lardomar-modell.json`: resultat från `npm run lardomar` och `npm run lardomar:modell`, genererade.

**Trupper och spelare**
- `data/trupper/<liga>.json` (`npm run trupper`): `teams.<lag>` = `{ fotmobName, fotmobId, coach, coachHistory, players[], history, left }`. Per spelare: `id, name, role, position, number, age, born, country, height, value, rating, goals, assists, yellow, red, injury`. Här finns skador, tränarbyten och spelare som lämnat, som dagliga ögonblicksbilder.
- `data/spelare/<liga>.json` (`npm run spelare`, cirka 2 h första gången, spelare återanvänds i 3 dagar): `teams.<lag>.players[]`, där lagnamnet är samma som i `data/matcher`. Per spelare:
  - `position.group` (malvakt, mittback, ytterback, defensiv/central/offensiv_mittfaltare, ytter, anfallare). Källa FotMob om spelaren gjort minst 5 matcher på positionen, annars Transfermarkt.
  - `info`: ålder, längd, fot, land, marknadsvärde, kontrakt, skada, landslagsuppdrag.
  - `league`: ligans säsongssummor (`minutes_played`, `matches_uppercase`, `rating` med flera).
  - `season` och `prevSeason`: `stats.<nyckel> = [total, per 90, percentil mot samma position]` samt `shots`, en skottsammanfattning. Nycklarnas svenska namn står i `STAT_LABELS` i `scripts/lib/player-positions.mjs`.
  - `nyckeltal` per positionsgrupp, `traits`, `form.last5`.
  - `matches`: de **10 senaste matcherna i alla tävlingar**, som `[datum, lag, motståndare, hemma, minuter, betyg, mål, assist, gula, röda, bänk, turnering]`.
  - `career` och `marketValueHistory` (`[datum, värde]`, månadsvis).
  - `_transfermarkt.json` innehåller Transfermarkts positioner, cache 7 dagar.
- **Fällor i `data/spelare`, alla upptäckta 2026-09-30:**
  - Utlånade spelare har kvar `fotmobTeam` = moderklubben men spelar för en annan klubb i `matches`. Bestäm klubbens namn som det vanligaste lagnamnet i lagets loggar.
  - Vissa ligamatcher har andra datum än i csv. Matcha på lag och datum ±1 dag.
  - Filtrera bort landslag (Nations League, VM, kval, "Friendlies", U21) och "Club Friendlies" när klubbens matcher byggs.
  - Sök på "Champions League", inte på "Champions", eftersom "Championship" också träffar.
  - Säsongsstatistiken (`season`) innehåller matcherna man testar på. Använd `prevSeason` eller `marketValueHistory` vid matchdatum för att slippa titta framåt.
  - Varje spelares logg täcker bara spelarens 10 senaste matcher. Lag-matcher räknas bara där minst 14 spelares loggar når tillbaka.
- **Spara historik framåt:** spelarloggen skrivs över varje körning. Vill vi ha fler än cirka 10 matcher per lag måste `scripts/lardomar-spelare-signaler.mjs` (eller hämtningen) spara lag-matchraderna (startelva, minuter, värde, vila) i en växande fil, till exempel `data/lagmatcher/<liga>.csv`. Det är inte byggt än.

**Stryktipset och Europatipset**
- `data/stryktipset.json`: omgångar, historik, backtest och missprofiler. `data/stryktipset-statistik.json`: Svenska Spels statistik per match (`draws`, `matches`, `fields`). `data/stryktips-history/`: arkiverade kuponger. `data/tips-archive/`: sparade system. Backtester: `data/stryktips-backtest-*.json`, `data/europatips-backtest-2526.json`.

**Lärdomar**
- `docs/lardomar/slutsatser.md` (den här filen, handskriven), `docs/lardomar/anteckningar/<liga>.md` (en per liga, auto-del plus handskrivet), `docs/lardomar/ligor/` och `docs/lardomar/lag/` (genererade).
- Testmetod: signal mot poäng minus oddsens förväntade poäng (`3·p_vinst + p_kryss`), mot stängning och mot öppning. Krav |z| ≥ 2,5 i träning och ≥ 2 i kontroll. Vikter väljs aldrig på kontrollperioden.

## Data som skulle kunna ändra slutsatserna

- Historik över skador och avstängningar *före* matchen (inte bara vem som spelade). Då kan vi testa vad marknaden visste i förväg.
- Cup- och Europamatcher (vila och trötthet).
- xG utanför topp 5, till exempel Championship, där Stryktipset har många matcher. Idag finns bara skott-proxy.
- Tränarbyten.
- Slutodds och streck från fler säsonger av Stryktipset/Europatipset (idag bara 2025/26 och framåt).

## 2026-10-04: landslagsuppehåll, svåra motståndare, fasta situationer och höghöjd

Användaren: "allt i lärdomsfilen som kan ge något ska läggas in i alla motorer". Regeln blev: det som förbättrar kontrollperioden (2023/24–) mot oddsen förs in, även när det är svagt. Det som inte gör det visas i lagfilerna men flyttar inga procent.

| Idé | Resultat | Beslut |
|---|---|---|
| **Första matchen efter landslagsuppehåll** (hela ligan vilat 12–50 dagar, sep–dec och mar–apr) | PL alla lag: 0,00 mot marknaden (690 lagmatcher). Arsenal +0,10 mot +0,05 annars (35 m), Leeds −0,11 mot −0,02 (34 m) | Inget. Visas per lag i lagfilerna ("Efter landslagsuppehåll") |
| **"Svårt för"** (minst 6 möten, högst 1,2 p/match eller högst −0,30 mot marknaden) | Samma som inbördes möten: inprisat | Visas per lag, inget i motorerna |
| **Fasta situationer** (FotMob: mål och xG från fasta för/emot per säsong, alla ligor från 2017/18 eller 2012) | Farlig på fasta mot svag mot fasta: −0,00 mot marknaden (6 722 lagmatcher). Lagmönster: korrelation tidig→sen −0,06 / +0,04. I justeringsmodellen: `sp` z −0,36 (öppning) och −0,26 (stängning) på valideringen | Inte vald av modellen. Visas per lag (egen stil, fasta per match, resultat mot varje typ) |
| **Spelstil** (bollinnehav, långbollar, press, fasta) per lag | Som 2026-10-01: lagmönster håller inte (korrelation ≈ 0) | Visas i varje lagfil, även svaga mönster, märkta stabil / samma håll / svag (användaren vill se allt) |
| **Höghöjd, Liga MX** (arena ≥ 1 500 m, bortalaget minst 1 000 m lägre) | Hemmalaget +0,13 mot marknaden mot −0,03 annars (991 matcher, z 3,7; före 2019 z 3,3, efter z 1,9). Logloss utanför urvalet: b 0,28, kontroll 2023/24– dLL −0,0007 (z −0,48, 221 höghöjdsmatcher) | **Infört** i `config/learned-adjustments.json` (`altitude.MX.b` 0,26 = hemma 50 % → cirka 53 %). Gäller Oddset (även nära avspark) och Stryktipset/Europatipset |
| **Höghöjd, MLS** (Colorado 1 610 m) | Ingen effekt mot marknaden (dLL 0, z −0,44, 52 matcher) | Infört med b 0,08 (nästan ingen flytt). Skattas om varje `npm run lardomar:modell` |
| **Höghöjd, Colombia** (Bogotá, Tunja, Pasto, Manizales) | Inga odds. Hemmalag på höghöjd tog *färre* poäng (1,51 mot 1,71, 170 m) | Visas, inget i motorerna (ingen marknad att testa mot) |

Ändrat i motorerna: `scripts/lib/extra-signals.mjs` (alt, sp), `scripts/lib/learned-adjust.mjs` (höghöjd per liga), `scripts/pro-layer.mjs` (Oddset), `scripts/fetch-stryktipset.mjs` (Stryktipset och Europatipset: lärdomsjustering med bas `close`; i dag bara höghöjd, eftersom inget annat slog kontrollen vid stängning). Webbmotorn (`gui/public/stryk-engine.js`) läser procenten från filen och får justeringen automatiskt. Hästar berörs inte (egen modell).

## 2026-10-04: kryss i kupong C (Europatipset)

Användaren: "för få kryss, jag måste få in 50 % av kryssen" (omgång 2613: C hade X på bara 4 matcher, nästan alla halvor var favorit + skräll). Infört: C:s grundrad ska täcka minst 50 % av omgångens väntade kryss (summan av vår X-chans), X_SHARE_C i båda motorerna. X får en bonus i valet av tecken som höjs stegvis tills regeln håller. En egen räknare i DP:n gjorde bakkörningen ~10 gånger långsammare och förkastades.

Bakkörning 55 Europatipset-omgångar 2025-08 – 2026-09 (`data/europatips-backtest-cX-{bas,x50,x50t}.json`):

| C | Chans 13 rätt (summa) | 12+ | 11+ | 10+ | X-matcher i snitt | X saknas i grundraden | Netto |
|---|---|---|---|---|---|---|---|
| Utan regel | 15,66 % | 2 | 7 | 17 | 6,6 | 46 omg | −37 018 kr |
| Kryss 50 % | 16,17 % | 1 | 8 | 23 | 7,5 | 44 omg | −40 156 kr |
| Kryss 50 % + B:s lutning | 15,63 % | 1 | 8 | 20 | 7,0 | 43 omg | −39 973 kr |

Kryssregeln ger något högre chans och fler 10–11 rätt, men nettot sjunker med ungefär 3 000 kr eftersom en 12:a (3 327 kr) försvann. Skillnaderna ligger inom slumpen på 55 omgångar. Regeln behålls eftersom användaren kräver den. B:s lutning (STRYK_C_TILT=b) gav inget och infördes inte. Kryss på väldigt många matcher kan pressa C:s högsta rad under 1 miljon (2613: 659 000 kr).
