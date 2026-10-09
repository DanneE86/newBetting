# Stryktipset – lärdomar från backtest

Levande fil. Här samlas allt vi lärt oss om de automatiska Stryktipset-systemen (A och B), så att kunskapen finns kvar mellan sessioner. Nya backtest och omgångar ska läggas till här: lägg till rader, skriv inte över.

- Rådata: `data/stryktips-backtest-2526-hel.json` (hela säsongen 2025/26, modellvikt 10 %), `data/stryktips-backtest-2526-hel-gammal.json` (samma säsong, 35 %), `data/stryktips-backtest.json` (hösten 2026) och `data/stryktips-backtest-2526.json` (12 omgångar våren 2026). Varje match har sannolikheter, utfall, systemens val och logloss.
- På webben: `newbetting.pages.dev/#stryktips/backtest` (före och efter, samt resultat per omgång).
- **Europatipset byggs med exakt samma regler och kod som Stryktipset.** Backtestet 2026-09-28 visade att egen logik inte behövs (se avsnittet om Europatipset). Europatipsets backtest tar bara omgångar med minst 3 matcher från PL, La Liga, Serie A eller Bundesliga (användarens regel).
- Sparade riktiga system med facit: `data/stryktips-history/`.
- Köra om:
  ```
  node scripts/backtest-stryktipset.mjs                                       # från 2026-08-01
  node scripts/backtest-stryktipset.mjs --to 2026-06-30 --count 12 --out data/stryktips-backtest-2526.json
  # hela säsongen 2025/26 (2024/25 behövs som modellhistorik), ny resp. gammal modellvikt:
  STRYK_SEASONS=2627,2526,2425 STRYK_MODEL_W=0.1 node scripts/backtest-stryktipset.mjs --from 2025-08-01 --to 2026-06-30 --out data/stryktips-backtest-2526-hel.json
  STRYK_SEASONS=2627,2526,2425 STRYK_MODEL_W=0.35 STRYK_MODEL_W_THIN=0.2 node scripts/backtest-stryktipset.mjs --from 2025-08-01 --to 2026-06-30 --out data/stryktips-backtest-2526-hel-gammal.json
  ```

## Förutsättningar (viktigt vid tolkning)

- **Marknaden i backtestet är Svenska Spels startodds.** API:t saknar slutodds för avgjorda omgångar. Live används oddsen vid hämtning, som ligger närmare spelstopp och är skarpare.
- **Folkets streck är slutliga värden** (vid spelstopp).
- **Lagmodellen har cutoff = omgångens första match**, så den använder ingen framtidsdata. Landslags-Elo är däremot dagens, men det påverkar bara landskamper.
- **Användarens fasta regler** (äldre körningar i filen använde A 5-3-2 och motsystem B 4-3-3 med högst 1 gemensam spik). **Från 2026-09-28:** 350–400 kr per kupong, två kuponger (A och B) från ett delat system på 700–800 rader, minst 4-2-2, max alltid fullt, utdelning för 13 rätt ≥ 30 000 kr (Europatipset ≥ 20 000 kr).
- **Utdelning räknas med Svenska Spels verkliga vinstklasser.**

## Datamängd

| Period | Omgångar | Matcher | Urval |
|---|---|---|---|
| 7 feb – 24 maj 2026 (säsongen 2025/26) | 12 | 156 | de 12 sista med minst 1 PL-match |
| 22 aug – 19 sep 2026 (säsongen 2026/27) | 5 | 65 | alla med PL-match sedan 1 aug |
| **Totalt** | **17** | **221** | |

## Hela säsongen 2025/26 (33 omgångar, 429 matcher, 16 aug 2025 – 24 maj 2026)

Alla Stryktipset-omgångar med minst en PL-match. Samma regler som i dag: A 5-3-2, B 4-3-3, 350–400 kr, utdelning ≥ 30 000 kr.

| | Modell 35 % (gammal) | Modell 10 % (ny) |
|---|---|---|
| A netto | −9 217 kr | **+3 109 kr** |
| A vinst / insats | 3 419 / 12 636 kr | **15 686** / 12 577 kr |
| A rader med 10+ / 11+ / 12+ rätt | 77 / 10 / 1 | **157 / 21 / 2** |
| A chans 13 rätt per omgång | 1/535 | **1/485** |
| B netto | −8 227 kr | −8 210 kr |
| B rader med 10+ / 11+ / 12+ rätt | **94 / 21 / 3** | 65 / 5 / 0 |
| B chans 13 rätt per omgång | 1/923 | **1/895** |
| Logloss | 1,035 | **1,032** (marknad 1,032, modell 1,048, folk 1,058) |
| Kryss: utfall / vår förväntan / folket | 24,7 % / 26,4 % / 23,8 % | 24,7 % / 26,0 % / 23,8 % |

**Slutsats:** modellvikten 10 % bekräftas på hela säsongen, eftersom A blir klart bättre på alla mått. B:s toppträffar blev färre (11+ rätt: 21 → 5), men nettot är lika och B:s modellchans något bättre. B:s toppträffar kommer från få omgångar och är starkt korrelerade inom en omgång, så det är troligen brus. Följ upp.

## Europatipset: behövs egen logik? (2026-09-28)

Urval: omgångar sedan 1 aug 2025 med minst 3 matcher från topp 4-ligorna, alltså 55 av 119 omgångar. Samma regler och samma kod som Stryktipsets steg 2: skarpa slutodds, jackpot och verklig omsättning i utdelningen, A 5-3-2, B 4-3-3, 350–400 kr.
Rådata: `data/europatips-backtest-2526.json`. Köra om: `STRYK_SEASONS=2627,2526,2425 node scripts/backtest-stryktipset.mjs --product europatipset --from 2025-08-01 --out data/europatips-backtest-2526.json`. Utdelningsgränsen styrs med `STRYK_UTD_MIN`. `STRYK_TURNOVER` sätter bara Gambling Cabins fasta omsättning.

**Omsättning och utdelning** (109 avgjorda omgångar, sep 2025 – sep 2026, jämfört med Stryktipset):

| | Europatipset | Stryktipset |
|---|---|---|
| Omsättning, median | 6,8 milj kr (p25–p75: 5,1–9,6) | 22,8 milj kr |
| 13 rätt, median | 109 000 kr | 200 000 kr |
| 12 rätt, median | 1 800 kr | 3 800 kr |
| Omgångar där 13 rätt gav under 30 000 kr | 24 % (topp 4-urvalet: 15 %) | 23 % |

**Varianter på 55 omgångar (system A):**

| Variant | A netto | A 10+ / 11+ / 12+ | A chans 13 rätt | B netto |
|---|---|---|---|---|
| Nuvarande (utd ≥ 30 000, skarpa odds) | −14 134 | 156 / 20 / 0 | 1/471 | −11 241 |
| Svenska Spels odds som marknad | −15 570 | 122 / 9 / 0 | 1/468 | −18 060 |
| Utd ≥ 15 000 | −18 058 | 162 / 16 / 0 | 1/326 | −20 034 |
| Utd ≥ 20 000 | +17 677 | 192 / 34 / 5 | 1/376 | −18 629 |
| Utd ≥ 50 000 | −15 579 | 137 / 19 / 0 | 1/619 | −12 528 |

Slutsatser:
1. **Lägre omsättning kräver ingen egen logik.** För de rader vi spelar är utdelningen ≈ 26 % / radens streckprodukt, alltså nästan oberoende av omsättningen. Koden räknar dessutom redan med verklig omsättning och jackpot, så Europatipsets 6,8 milj (mot Gambling Cabins fasta 10 milj) hanteras automatiskt.
2. **Sänk inte utdelningsgränsen.** Plusset för 20 000 kr kommer från en enda 13-rätt (omg 2545, som gav 32 668 kr, alltså över 30 000 i verkligheten). 15 000 kr är sämre än 30 000 och B blir sämre av alla sänkningar. Det är brus, inte en regel.
3. **Det som skiljer är folket, inte utdelningen.** Europatipset är mest topp 5-ligor, och där är folkets streck nästan lika bra som oddsen: logloss folk 0,990 mot odds 0,994 och vår slutprocent 0,995. På Stryktipset kommer streckvärdet främst från Championship och League One (folk 1,12–1,13 mot odds 1,07–1,09). I PL ligger folket ungefär lika nära oddsen på båda spelen (+0,015). Det finns alltså mindre felstreckning att utnyttja på Europatipset. Nettot visar ändå ingen skillnad: A fick tillbaka 32 % av insatsen på Europatipset (−14 134 kr på 55 omgångar) mot 24 % på Stryktipset (−9 742 kr på 33 omgångar), och chansen till 13 rätt är lika (1/471 mot 1/447). Båda styrs av enstaka 12–13-rätt.
4. Kryss: 26,4 % utfall mot 25,9 % väntat och 24,0 % hos folket. Folket underspelar X även här, alltså samma X-logik.
5. Utfallet för 13 rätt var i median 32 % av omsättningen på Europatipset och 39 % på Stryktipset, mot 26 % i grundformeln. Det beror på jackpottar och pengar som förs över från 10 rätt, och det fångas nu av jackpotlogiken (steg 2).

**Beslut (användaren, 2026-09-28):** Europatipset får utdelningsgränsen **20 000 kr**, eftersom det var bäst i backtestet (A +17 677 kr, 11+ rätt 34 mot 20, chans 13 rätt 1/376 mot 1/471). Övriga regler är desamma som för Stryktipset. Stryktipset behåller 30 000 kr. **Följ upp:** resultatet bygger på en enda 13-rätt och B blev sämre (−18 629 mot −11 241 kr). Utvärdera efter 12+ nya Europatipset-omgångar. Om A inte har fler 11+ än med 30 000 i samma omgångar, gå tillbaka. `data/europatips-backtest-2526.json` är nu körd med 20 000.

## Steg 2: skarpa odds + jackpot (2026-09-28, 33 omgångar 2025/26)

| | Start (SvS-odds, modell 35 %) | Steg 1 (modell 10 %) | Steg 2 (skarpa odds + jackpot) | Endast skarpa odds (utan jackpot) |
|---|---|---|---|---|
| A netto | −9 217 | +3 113 | −9 742 | −10 530 |
| A rader med 10+ / 11+ / 12+ rätt | 77 / 10 / 1 | 157 / 21 / 2 | 88 / 13 / 1 | 65 / 5 / 0 |
| A chans 13 rätt per omgång | 1/535 | 1/485 | **1/447** | 1/522 |
| B netto | −8 227 | −8 210 | −8 625 | −8 512 |
| B rader med 10+ / 11+ rätt | 94 / 21 | 65 / 5 | 44 / 2 | 40 / 2 |
| B chans 13 rätt per omgång | 1/923 | 1/895 | **1/780** | 1/883 |
| Logloss (final) | 1,035 | 1,032 | **1,027** | 1,027 |

- **Skarpa odds:** Pinnacle, annars Betfair via Oddsets `findSharpBook`, annars snitt av minst 3 bolag. Backtestet använder slutodds från football-data: Pinnacle finns för hela 2024/25 men bara för ungefär halva 2025/26, och där de saknas används snitt av slutodds. De ger klart bättre träffsäkerhet per match (logloss 1,032 → 1,027). Obs: slutodds innehåller mer information än Svenska Spels startodds, så en del av förbättringen är informationsövertag. Live motsvaras det av att köra sent ("Stryktipset – sen körning").
- **Utfall per omgång är i praktiken lika.** A:s bästa rad var bättre i 9 omgångar mot 10, och rätt i grundraden 337 mot 340. Skillnaden i rader med 10+ rätt kommer från två omgångar (4948: 43 mot 5, 4915: 30 mot 4). Beslut: behåll skarpa odds (bättre sannolikheter). Det går att stänga av med `STRYK_MARKET=svs`.
- **Jackpot:** potten för 13 rätt var större än 26 % av omsättningen i ungefär hälften av omgångarna (median 39 %, upp till 68 %) på grund av jackpottar och överförda pengar. Formeln för vinnare stämmer bra (faktiska mot förväntade vinnare: median 1,06). Nu räknas jackpotten in, live från `/draw/1/jackpots` och i backtest som överskottet i potten. Det ger fler rader över 30 000 kr i jackpotveckor och bättre chans till 13 rätt (A 1/522 → 1/447). Gränsen översätts till Gambling Cabins formel, så att länken ger samma rader. Antagandet att GC räknar in jackpotten ska verifieras första gången en öppen omgång har jackpot. **Förbehåll:** en del av överskottet är pengar från 10 rätt som flyttas upp när 10 rätt ger för lite för att betalas ut, och det vet man inte i förväg. Backtestet räknar in hela överskottet, så jackpotens effekt i steg 2 är något överskattad. Live räknas bara annonserad jackpot, vilket är försiktigt. Se även Europatipset punkt 5.
- **Sparade system innehåller nu odds (Svenska Spels och skarpa), streck och sannolikheter per match** vid sparandet, för rättvisa framtida backtest.

### Viktig upptäckt: teckenreglerna stänger ute 13 rätt de flesta veckor

Facit i 38 omgångar (2025/26 + hösten 2026) hade i snitt 5,4 ettor, 3,4 kryss och 4,1 tvåor. Andel omgångar där rätt rad klarar teckenregeln, alltså där systemet alls *kan* ta 13 rätt:

| Regel | 5-3-2 (A) | 4-3-3 (B) | 4-3-2 | 3-3-3 | 3-3-2 | 4-2-2 | 3-2-2 |
|---|---|---|---|---|---|---|---|
| Rätt rad släpps igenom | **34 %** | **61 %** | 63 % | 68 % | 71 % | 82 % | 89 % |

Exempel: i 4949 och 4929 hade grundraden alla 13 rätt, men raden stoppades (4949 hade 2 ettor, 4929 hade 2 kryss). Dessutom gav 13 rätt under 30 000 kr i 6 av 36 omgångar, så utdelningsregeln stänger också ute dem. Lösare regler ger fler rader och därmed mindre täckning inom budgeten, så en ändring måste backtestas. Reglerna är användarens och ändras inte utan klartecken.

### Backtest av teckenregler för system A (33 omgångar 2025/26, steg 2-versionen)

Bara A:s teckenminimum ändrat (B 4-3-3). *Chans* = modellens chans till 13 rätt per omgång, det stabilaste måttet. Radantal i utfallet är brusigt.

| Regel (1-X-2) | Chans 13 rätt | Netto | 10+ / 11+ / 12+ rätt | Snitt bästa rad |
|---|---|---|---|---|
| **5-3-2 (nu)** | 1/447 | −9 742 | 88 / 13 / 1 | 8,45 |
| 4-3-3 | 1/456 | −10 323 | 79 / 7 / 0 | 8,33 |
| 4-3-2 | 1/449 | −9 727 | 85 / 13 / 1 | 8,27 |
| 3-3-3 | 1/460 | −10 281 | 83 / 7 / 0 | 8,39 |
| 3-3-2 | 1/453 | −9 720 | 89 / 13 / 1 | 8,27 |
| 4-2-2 (bryter minst 3 kryss) | **1/415** | −8 530 | 111 / 16 / 2 | 8,48 |
| 3-2-2 (bryter minst 3 kryss) | **1/417** | −8 425 | 121 / 18 / 2 | 8,33 |

**Slutsats:**
- 5-3-2 är **inte** dåligt. Bland regler med minst 3 kryss är den lika bra eller bäst: chansen skiljer bara 1/447–1/460, vilket är brus.
- Att rätt rad bara klarar 5-3-2 i 34 % av veckorna kostar mindre än det låter. Raderna som stängs ute är de minst sannolika, och budgeten på cirka 400 rader räcker ändå bara till en liten del av utfallen. Optimeringen flyttar raderna dit sannolikheten finns.
- Kravet på minst 3 kryss kostar cirka 7 % i chans. 4-2-2 och 3-2-2 gav 1/415 mot 1/447, och fler rader med 11+ rätt.
- 4-3-3 är den svagaste regeln med minst 3 kryss och används i dag för B. För B vore 3-3-2 eller 4-3-2 minst lika bra.

### Steg 3: fler förbättringar testade (33 omgångar 2025/26, 2026-09-28)

| Variant | A chans | A netto | A 10+/11+/12+ | B chans | B netto | B 10+/11+ | A+B chans |
|---|---|---|---|---|---|---|---|
| V0 som innan | 1/447 | −9 742 | 88/13/1 | 1/780 | −8 625 | 44/2 | 1/284 |
| **V1 B byggs tillsammans med A (infört)** | 1/447 | −9 742 | 88/13/1 | 1/780 | −8 625 | 44/2 | 1/284 |
| V2 B 4-3-2 | 1/447 | −9 742 | 88/13/1 | 1/785 | −9 803 | 41/3 | 1/285 |
| V3 B 3-3-2 | 1/447 | −9 742 | 88/13/1 | 1/784 | −11 519 | 39/2 | 1/285 |
| V4 mål = förväntad återbetalning | 1/3545 | −11 066 | 18/1/0 | 1/4496 | −11 059 | 6/0 | 1/1998 |

- **B tillsammans med A:** ingen effekt, eftersom A och B redan hade 0 gemensamma rader (regeln om högst 1 gemensam spik separerar dem). Behålls som skydd (`STRYK_B_JOINT`).
- **B:s teckenregel:** 4-3-2 och 3-3-2 gav samma chans men sämre utfall, så B behåller 4-3-3.
- **Mål = förväntad återbetalning: förkastad.** Modellens förväntade återbetalning från 13 rätt tredubblades, men chansen föll 8 gånger och utfallet blev klart sämre. Målet jagar långa odds där modellen och utdelningsformeln är minst pålitliga. Välj efter chans, inte modellens förväntade värde.
- **Värde per omgång (infört):** förväntad återbetalning från 13 rätt i förhållande till insatsen, för system A. I backtestet var p25 0,26, median 0,33 och p75 0,40 (obs: backtestets jackpot är något för hög, se förbehåll ovan). Under 26 % visas "Omgången saknar värde", och över 40 % "högt värde". Raderna skapas alltid (användarens val). Att bara spela värdeomgångar kan inte backtestas meningsfullt än, eftersom det inte fanns någon 13-rättare.
- **Automatisk sen körning:** lördagar 13:05 UTC (arbetsflödet `stryktips-late.yml`).

## Expertgranskning Europatipset (2026-09-28, 55 omgångar, 715 matcher)

Två granskningar: en av dataluckor och en av strategi och folkets streck. Förslag som bryter mot fasta regler är **inte** införda, eftersom de kräver användarens beslut.

**Folkets streck på Europatipset**
- Snedvridningen är likformig: favoriter streckas ×1,13 på alla nivåer, kryss ×0,93 (×0,81 när favoriten har minst 60 %) och skrällar ×0,83.
- Ingen skillnad mellan hemma- och bortafavoriter (1,13 / 1,12) eller mellan ligor (1,11–1,16). Streckvärdet ligger alltså redan i utdelningsgränsen, och det finns inga liga- eller bortamönster att jaga.
- Utfallen följer våra procent: ettor z +0,8, kryss z +0,3, tvåor z −1,1.
- A:s spikar höll 176 mot väntat 165 (z +1,3), B:s 124 mot 119.
- Brus: skrällar på Europatipset z −1,65 (Stryktipset +1,8), nordiska matcher fler kryss z +2,1, favoriter på 60–70 % z +1,9.

**Matcher utan skarpa odds:** Allsvenskan, cuper och Europa/Conference League, där marknaden är Svenska Spels startodds.
- Där slår folkets slutstreck våra procent. 25 % folk inblandat förbättrar logloss med 0,0081 ± 0,0030 (2,7 SE).
- I topp 5 är vinsten 0,0032 ± 0,0021 (brus), och på Stryktipset blir det sämre.
- Folket vet alltså inte mer än oddsen. Det är våra odds som är gamla. Åtgärden är skarpa odds eller slutodds för de matcherna, inte att väga in folket.

**Teckenregler:** rätt rad klarar 5-3-2 i 33 % av omgångarna, 4-3-3 i 35 %, 3-3-2 i 58 % och 4-2-2 i 71 %. Beräkningen över alla rader ger 4-2-2 cirka 14 % högre chans till 13 rätt än 5-3-2. Kravet på minst 3 kryss kostar mest. Inte ändrat, eftersom det är användarens regel.

**System B mot fler A-rader:** B:s förväntade antal 13 rätt var 0,081 på 55 omgångar. A:s rad 401–800 skulle ge cirka 0,13. Inte ändrat.

**Utdelningsgräns som EV-fråga:** räknat över alla rader ger 400 rader följande återbäring per krona från 13 rätt: 0,28 vid 20 000 kr, 0,37 vid 50 000 kr och 0,45 vid 100 000 kr. Chansen till 13 rätt är samtidigt 1/215, 1/396 och 1/646. Beräkningen antar oberoende streck, så den måste backtestas med verklig reducering innan något ändras.

**Jackpot:** utdelningen för 13 rätt växer i proportion till potten. 1 milj i jackpot på 6,8 milj i omsättning ger +57 %, medan felstreckningen bara skiljer ±12 % mellan omgångar. Omgångsval efter jackpot är värt att testa.

**Dataluckor**
- Åtgärdat 2026-09-28:
  - Elo-namnjämförelse ("Bosnien & Hercegovina" föll tillbaka på folket).
  - FotMob-kontext för alla matcher i båda spelen: elva, frånvaro med marknadsvärde, vila och rotation, domare, arena, väder, form och inbördes möten.
- Kvar:
  - Skarpa odds för landskamper och Europacup (The Odds API har nycklar för Nations League, VM-kval och Europacup, men krediterna är begränsade).
  - Neutral plan i Elo (`eloratings.net/fixtures.tsv`).
  - Klubb-Elo för Europacup och Allsvenskan (clubelo.com/{land}).
  - Understat-xG för 2025/26 i LL, SA, BL och L1.
- Expertanalyserna fungerar, men publiceras bara cirka 1 dygn före spelstopp. Kör alltså sent.

**Viktig begränsning:** spelstopp är vid första matchen, så bekräftade elvor finns i praktiken bara för de tidigaste matcherna. FotMob visar annars senaste elvan plus kända skador och avstängningar, och det finns flera dagar före.

## Steg 4: delat system 4-2-2, fler datakällor (2026-09-28, användaren: "gör allt")

Användaren godkände att förslagen från expertgranskningen genomförs, även där de bryter mot tidigare fasta regler. Allt gäller **båda spelen** (användarens regel: det som gynnar båda används av båda).

**Samlad chans till 13 rätt för kupong A+B.** Måttet är summan av chansen för A och B. Summan är rättvis eftersom A och B aldrig har gemensamma rader.

| Variant | Europatipset (55 omg) | Stryktipset (33 omg) |
|---|---|---|
| A 5-3-2 + motsystem B 4-3-3 (före) | 0,227 → 1 på 242 | 0,116 → 1 på 284 |
| A 4-2-2 + motsystem B | 0,244 | 0,122 |
| Delat system 5-3-2 | 0,268 | 0,138 |
| **Delat system 4-2-2 (infört)** | **0,305 → 1 på 180 (+34 %)** | **0,149 → 1 på 221 (+28 %)** |
| Utdelningsgräns 100 000 kr (Europatipset, motsystem) | 0,097 (1 på 979 för A) | – |

**Delat system:** grundrad och utdelningsgräns väljs för 700–800 rader med högst chans till 13 rätt. Raderna delas sedan efter Gambling Cabin-utdelning i kupong A (högst utdelning, ≥ t_mid) och kupong B (resten). Båda kostar 350–400 kr och har samma grundrad, och B:s länk använder utdelningsintervall (`utd=1,min,max`). Det gamla motsystemet finns kvar med `STRYK_B_MODE=counter`.

**Ärligt om nettot:** i backtestet gick det nya sämre i kronor. På Europatipset gav A+B −36 890 kr mot −952 kr före, eftersom den enda 13-rätten (omg 2545) inte längre fångades. På Stryktipset gav A+B −17 631 kr mot −18 367 kr. Nettot styrs av en enda träff, medan chansen är det stabila måttet (se tidigare lärdomar). **Följ upp** med riktiga omgångar.

- **100 000 kr som gräns förkastades:** chansen föll 2,6 gånger och antalet rader med 11+ rätt blev 4 mot 34. Europatipset behåller 20 000 kr och Stryktipset 30 000 kr.
- **Val av omgång efter jackpot:** jackpotten ingår redan i värdet per omgång ("högt värde"). Raderna skapas alltid, enligt användarens tidigare val.

**Nya datakällor**, alla i öppna omgångar:
- FotMob-kontext: elva, frånvaro, vila, rotation, domare och väder (`scripts/lib/match-context.mjs`).
- The Odds API för Nations League, VM-kval, Europacup, nordiska ligor och cuper. Bara 1X2, 1 kredit per turnering, 3 h cache, och inga anrop under 40 krediter (`scripts/lib/extra-odds.mjs`, `data/open/stryk_extra_odds.json`). Första körningen gav Pinnacle/Betfair för 7 av 13 matcher i Europatipset 2612. Resten saknar odds tills cirka 3 dagar före.
- Neutral plan i landslags-Elo från `eloratings.net/fixtures.tsv`. Exempel: Israel–Kosovo spelas i Ungern.
- Klubb-Elo från clubelo.com för klubbmatcher utan lagmodell, t.ex. Europacup och Allsvenskan (`scripts/lib/club-elo.mjs`, 24 h cache, 45 s tidsgräns).
- xG från Understat för 2024/25 och 2025/26 i topp 5 (`scripts/lib/understat-xg.mjs`). Alla 380 matcher per liga och säsong matchades. Lagmodellens logloss blev bättre: Europatipset 1,018 → 1,013, Stryktipset 1,048 → 1,045. Slutprocenten är oförändrad eftersom modellen väger 10 %.
- **Utan odds** (innan de släpps): 50 % modell + 50 % folk i stället för bara modellen. Elo ensamt är för säkert och gav till exempel Frankrike–Italien 80 %.
- Rådata: `data/stryktips-backtest-2526-steg3.json` (Stryktipset, i backtest-vyn som steg 3) och `data/europatips-backtest-2526.json` (Europatipset, nuvarande version).

## Omgångar där 13 rätt gav minst 40 000 kr (2026-09-28, 93 omgångar ST + ET)

76 av 93 omgångar (82 %) gav minst 40 000 kr eller hade ingen vinnare. Stor utdelning är alltså det normala. De 17 övriga var "favoritveckor".

| Snitt per omgång | ≥ 40 000 kr (76) | Övriga (17) |
|---|---|---|
| Favoriten vann (av 13) | 5,8 | 8,8 |
| Kryss | 3,7 | 2,1 |
| Utfall där vår chans var < 30 % | 5,5 | 2,8 |
| Mellanfavoriter (50–65 %) som föll | 2,0 | 0,8 |
| Kryss när favoriten hade ≥ 50 % | 1,3 | 0,4 |
| Spikar (A) som sprack | 2,4 | 0,5 |
| Utfall utanför grundraden | 2,75 | 0,94 |

Bara 9 av 76 stora omgångar hade exakt 1 utfall utanför grundraden. De flesta hade 2–3.

**Spikar per favoritnivå** (alla omgångar):

| Favoritens chans | Spikar | Sprack | Väntat |
|---|---|---|---|
| 50–60 % | 225 | 110 (49 %) | 102 |
| 60–70 % | 130 | 38 | 46 |
| 70–80 % | 45 | 9 | 12 |

Utfallen stämmer med förväntan. Spikarna är alltså rätt kalibrerade, och det finns inget modellfel.

**Test av större grundrad med färre spikar:** tillåten grundrad höjdes från 30 000 till 90 000 och 300 000 rader. Resultatet blev identiskt på båda spelen, eftersom optimeringen redan provade de större grundraderna och valde bort dem. Tillsammans med testerna av spikregler (se förkastade hypoteser) betyder det att det inte finns något dolt mönster att utnyttja utöver det som utdelningsgränsen redan riktar in sig på. Med cirka 800 rader är det 2–3 fallna mellanfavoriter per vecka som avgör. Enda sättet att få in fler sådana veckor är fler rader, alltså högre insats. `STRYK_GRUND_MAX` finns för framtida test.

## Kupongarkiv: alla omgångar sedan 1 januari 2025 (2026-09-28)

Arkivet ligger i `data/tips-archive/` och innehåller alla avgjorda omgångar, utan urvalsfilter:

| Mapp/fil | Innehåll |
|---|---|
| `raw/<produkt>-<nr>.json` | Svenska Spels kupong och facit, bantad till fälten analysen använder (cirka 11 kB per omgång). Ger identiska kuponger som hela API-svaret. |
| `raw/<produkt>-<nr>-open.json` | Den öppna kupongen vid senaste körningen: odds och streck vid körningen. |
| `systems/<produkt>-<nr>.json` | Kupong A och B byggda med reglerna som gällde (`rules`), med rader, Gambling Cabin-länk, sannolikheter och utvärdering mot facit. |

- **Bygga eller bygga om:** `STRYK_SEASONS=2627,2526,2425,2324 node scripts/build-tips-archive.mjs --from 2025-01-01`. Lägg till `--rebuild` efter en regeländring. Kupongerna byggs också om automatiskt när `rules` skiljer sig.
- **Framtida omgångar:** `scripts/fetch-stryktipset.mjs` sparar den öppna kupongen och arkiverar varje ny avgjord omgång vid varje körning. Arbetsflödena committar `data`.
- **Backtest:** `scripts/backtest-stryktipset.mjs` läser rådatan från arkivet först, utan nätanrop.

**Resultat med nuvarande regler** (delat system 4-2-2, 350–400 kr per kupong, Stryktipset 30 000 kr, Europatipset 20 000 kr), alla omgångar:

| | Omgångar | Insats | Vinst | Netto | 13 rätt |
|---|---|---|---|---|---|
| Stryktipset jan 2025 – sep 2026 | 91 | 70 507 | 76 722 | **+6 215** | 1 |
| Europatipset jan 2025 – sep 2026 | 179 | 137 666 | 141 266 | **+3 600** | 2 |
| Stryktipset från aug 2025 | 61 | – | – | +27 400 | 1 |
| Europatipset från aug 2025 | 118 | – | – | +20 614 | 2 |

**13-rättarna:**

| Omgång | Datum | Matcher | Vinst | Kupong |
|---|---|---|---|---|
| ST 4917 | 2025-09-06 | VM-kval, League One/Two | 54 845 kr | B |
| ET 2594 | 2026-07-30 | Europa/Conference League-kval | 67 528 kr | B |
| ET 2585 | 2026-06-25 | VM | 20 517 kr | B |

Ingen av dem fanns i de tidigare backtesten, eftersom urvalsfiltren (minst 1 PL-match respektive minst 3 topp 4-matcher) uteslöt dem.

**Förbehåll, viktiga:**
- **ET 2585 är läckt.** Landslags-Elo är dagens värde, alltså efter VM. Räknas den bort blir Europatipset −16 917 kr från januari 2025.
- **ST 4917** bygger på Pinnacles slutodds från football-data för klubbmatcherna, vilket är mer information än live.
- **ET 2594** är ren: Svenska Spels startodds, ingen modell.
- Plus eller minus avgörs helt av 2–3 träffar på 270 omgångar. Resultatet kan inte skiljas från slump, men det visar att det nya systemet *kan* träffa i skrällveckor.

## Spikar som sprack: tabell, form och läge vid matchtillfället (Stryktipset, 2026-09-28)

**Urval:** alla spikar i system A. Kupongerna är byggda med nuvarande regler ur arkivet, och arkivet går nu tillbaka till augusti 2023 (167 omgångar).

**Metod:** för engelska ligamatcher räknades läget fram dagen före matchen ur football-data:
- tabellplacering, zon och poäng per match
- form de senaste 5 matcherna, totalt och hemma/borta
- vilodagar
- säsongsläge

Spruckna spikar jämfördes med väntat antal (1 − vår chans för spiktecknet) per faktor, 24 faktorer.

**Resultat:** spikarna är välkalibrerade. Jan 2025 – sep 2026: 188 spruckna mot väntat 179,6 (z +0,8). Aug 2023 – dec 2024: 127 mot 138,7 (z −1,3).

Två faktorer såg ut som signaler 2025–26 och testades på den oberoende perioden 2023–24:

| Faktor | 2025–26 | 2023–24 (oberoende) |
|---|---|---|
| Favoritens hemma-/bortaform ≤ 5 p (5 matcher) | 32 mot 24,3, z +2,1 | 25 mot 28,4, z −0,9 |
| Tidigt på säsongen (3–7 matcher) | 23 mot 16,8, z +2,0 | 15 mot 19,0, z −1,2 |

Båda vände, så de är brus. Med 24 test väntas cirka en falsk signal med |z| ≥ 2.

Inget av följande spräcker spikar oftare än oddsen säger:
- tabellavstånd
- motståndare i nedflyttningszon
- "inget att spela för" sent på säsongen
- kort vila
- formskillnad
- hur folket streckar

**Slutsats:** tabell och form finns redan i oddsen. Det finns inget vi missat som hade räddat de spruckna spikarna.

**Oddsrörelse** går inte att testa bakåt, eftersom Svenska Spel tar bort slutoddsen efter spelstopp (bara 25 av 1 196 matcher har dem). Arkivet sparar nu oddsen vid varje körning (`raw/*-open.json`), så det kan testas framöver.

**Arkivet 2023–2026 med nuvarande regler (Stryktipset):** 167 omgångar, insats 129 270 kr, vinst 101 007 kr, netto **−28 263 kr**, 1 gång 13 rätt (4917, september 2025). Under aug 2023 – dec 2024 blev det ingen 13-rätt.

**Folket i Stryktipset** (91 omgångar, jan 2025 – sep 2026): att väga in folkets streck gav sämre logloss när vi har skarpa odds (+0,0036 vid 25 %, 2 SE) och brus när vi bara har Svenska Spels odds. Det införs inte för Stryktipset.

**Nytt 2026-09-28:**
- Den sena körningen startar var 30:e minut lördag/söndag. En vakt (`scripts/stryk-close-guard.mjs`) kör bara när kupongen stänger om 15–75 minuter, vilket fungerar både sommar- och vintertid.
- Körningen hämtar färska skarpa odds för PL, Championship, League One och League Two via The Odds API (`STRYK_FRESH_ODDS=1`, max 20 minuter gamla).
- Namnjämförelsen klarar initialer och alias: Sheffield U/W, Brighton, Nottingham, M'gladbach, Espanol, Bristol Rvs.

## Vanliga missar och turmatcher (2026-09-29, 347 omgångar ST + ET)

**Urval:** hela kupongarkivet (aug 2023 – sep 2026), grundraden i kupong A byggd med nuvarande regler. En miss = utfallet låg utanför grundradens tecken, alltså en match där 13 rätt krävde tur. Byggs av `scripts/lib/stryk-miss-profile.mjs` och följer med varje hämtning (`missProfile` i `data/stryktipset.json`).

- Helgarderingar missar aldrig. Alla missar är spikar och halvgarderingar.
- Rätt rad låg i snitt 2,2 matcher utanför grundraden (0: 34, 1: 73, 2: 104, minst 3: 136 omgångar).

| Matchtyp | Matcher | Missade | Väntat | Kom i stället |
|---|---|---|---|---|
| Spik 1, hemmafavorit 55–65 % | 484 | 38 % | 40 % | X 109, 2 75 |
| Spik 1, hemmafavorit 45–55 % | 316 | 48 % | 49 % | X 74, 2 76 |
| **Spik 2, bortafavorit 45–55 %** | 143 | **59 %** | 49 % | 1 36, X 48 |
| Spik 1, hemmafavorit 65–75 % | 307 | 25 % | 30 % | X 49, 2 28 |
| Spik 2, bortafavorit 55–65 % | 187 | 32 % | 40 % | 1 27, X 32 |
| Halvgardering 1X, favorit 45–55 % | 229 | 25 % | 23 % | 2 57 |

- Enda gruppen som missar klart oftare än väntat är spik på bortafavorit 45–55 % (84 mot väntat 70, cirka z +2,3). Med 20+ grupper väntas ungefär en sådan av slumpen. Följ upp innan reglerna ändras.
- Övriga grupper följer våra procent. Missarna är alltså tur, inte modellfel. När en spik spricker kommer oftast kryss.
- Spikar per liga (minst 25): Bundesliga 46 %, Eliteserien 45 %, Championship 45 %, Conference League 43 %. Alla ligger inom några procentenheter från väntat.

**På webben:** matcher där kupong A:s tecken hör till en grupp som missat minst 30 % markeras som 🍀 turmatch, med tecknet som oftast kom i stället. På B-sidan kan det läggas in som krav i kupong B med en knapp.

## Färgregler, max 4 spikar och favoritregeln (2026-09-30, 38 omg ST + 55 omg ET, 2025/26 + 2026/27)

Delat system A+B (700–800 rader). Nya varianterna har max 4 spikar och favoriten i varje gardering på minst 10 % av raderna i **båda** halvorna. Bredd = minsta max − min per färg (grön/gul/röd i garderingarna).

| Variant | ST netto | ST 11+ / 10+ rader | ET netto | ET 13 r | ET 11+ / 10+ rader |
|---|---|---|---|---|---|
| Gammal (fria spikar, inga färgregler, ingen favoritregel) | −14 612 | 18 / 171 | −34 380 | 0 | 25 / 274 |
| Bredd 0 (exakta antal tillåtna) | −20 754 | 30 / 200 | +23 153 | 1 | 108 / 496 |
| **Bredd 1 (vald)** | −20 716 | 30 / 200 | +24 712 | 1 | 115 / 540 |
| Bredd 2 (t.ex. 1–3, 2–4) | −21 735 | 23 / 163 | +8 596 | 1 | 84 / 442 |
| Bredd 3 | −21 043 | 29 / 178 | −27 131 | 0 | 56 / 365 |
| Inga färgregler | −22 268 | 27 / 180 | +11 574 | 1 | 88 / 444 |

- **Bredd 1 är bäst i båda spelen** på netto och på 10+/11+-rader. Bredd 2 (användarens exempel 1–3, 2–4) är sämre än 1 i båda.
- **Max 4 spikar + favoritregeln** lyfter Europatipset från −34 000 till +25 000 kr (13 rätt en gång, 115 mot 25 rader med 11+). På Stryktipset ger nya motorn fler 11+-rader (30 mot 18) och 10+-rader (200 mot 171). Den gamla hade högre vinst tack vare några enstaka utdelningar (brus).
- En första körning där favoritregeln bara gällde hela systemet (inte varje halva) gav kupong A med favoriten på 6 % av raderna. Därför kontrolleras halvorna var för sig.
- Följ upp efter 12+ nya omgångar.

## Färgband från rätt rad (2026-09-30, Stryktipset 38 omg + Europatipset 55 omg, 2025/26 + 2026/27)

Rätt rad 2025/26 (33 ST-omgångar med PL-match), antal tecken per omgång i folkets färg: **grön 5,0** (2–9, vanligen 3–7), **gul 6,1** (3–8), **röd 1,9** (0–6, vanligen 0–4). En grön favorit (folket ≥ 45 %) vann 50 %, gul 30 %, röd 22 %. Färgerna räknas nu över alla 13 matcher (spikar i sin färg, ingen rosa). Banden räknas från kupongarkivet, 365 dagar före omgången (`scripts/lib/stryk-color-bands.mjs`).

| Variant | ST netto | ST 12+ / 11+ / 10+ | ET netto | ET 12+ / 11+ / 10+ |
|---|---|---|---|---|
| Utan band (bredd 1, som innan) | −20 716 | 2 / 30 / 200 | **+24 712** | 17 / 115 / 540 |
| Kärnan p10–p90 måste släppas igenom, röd max 3 | −22 673 | 2 / 24 / 169 | −29 571 | 2 / 44 / 303 |
| Kärnan p10–p90, röd max 4 | −22 673 | 2 / 24 / 169 | +8 104 | 10 / 75 / 382 |
| Bandet som yttre gräns, röd max 3 | −19 356 | 1 / 28 / 227 | +10 573 | 13 / 91 / 451 |
| **Bandet som yttre gräns, röd max 4 (Stryktipset)** | **−8 771** | 3 / 34 / 248 | +10 557 | 13 / 91 / 451 |

- **Stryktipset: yttre band + max 4 röda** är bäst hittills (−8 771 mot −14 612 för gamla motorn och −20 716 utan band), med flest rader med 10+, 11+ och 12+ rätt. Valt.
- **Europatipset: utan band** är fortfarande bäst, så där används inga band.
- Att tvinga reglerna att släppa igenom kärnan (p10–p90) blir för brett och sämre, som breda regler tidigare.
- Rätt rad låg i grundraden bara 2 av 76 gånger på Stryktipset, så nettot styrs av 10–12-rättsrader. Följ upp efter 12+ nya omgångar.

## Kupong C och spikgränsen (2026-09-30, Stryktipset 38 omg + Europatipset 55 omg)

Kupong C är ett eget system på 700–850 kr med minst 30 000 kr för 13 rätt. Baktest av tio varianter per spel och sedan spikgränser:

| Kupong C | ST netto | ST 12+ / 11+ / 10+ | ET netto | ET 12+ / 11+ / 10+ |
|---|---|---|---|---|
| Start (4-2-2, färgfönster, max 4 spikar) | −25 112 | 1 / 12 / 129 | −12 651 | 8 / 94 / 522 |
| Teckenregler 3-2-2 | −24 835 | 1 / 15 / 144 | **−10 042** | 8 / 105 / 602 |
| Inga teckenregler | −18 974 | 2 / 40 / 253 | −20 752 | 7 / 90 / 506 |
| Max 2 spikar | −20 731 | 2 / 45 / 281 | −33 762 | 1 / 32 / 230 |
| Spik bara om favoriten ≥ 65 % | **−6 341** | 8 / 51 / 258 | −34 143 | 1 / 28 / 205 |
| Utdelning minst 20 000 kr | −25 112 | 1 / 12 / 129 | +8 918 (en 13-rätt) | 14 / 88 / 432 |
| Utdelning minst 50 000 kr | −26 080 | 0 / 10 / 117 | +99 711 (en 13-rätt) | 10 / 64 / 370 |

Lärdomar:
- **Spikar på favoriter 50–65 % spricker ofta:** 46–49 % på Stryktipset och 40–44 % på Europatipset. Favoriter ≥ 65 % spricker 26–28 % respektive 15–17 %.
- **Stryktipset: spik bara på favoriter ≥ 65 %** (gäller A, B och C). A+B −22 557 → −10 194 kr (11+ 23 → 35), C −25 112 → −8 928 (11+ 12 → 48). Modellen är för säker på engelska favoriter (väntad 13 rätt sjunker, utfallet blir bättre).
- **Europatipset: ingen spikgräns** (den gjorde allt sämre), men C med teckenregler 3-2-2: −10 024 kr, 11+ 105.
- Rätt rad låg i C:s grundrad 4 gånger på Europatipset men föll bort i reduceringen alla 4 gångerna. Två gånger betalade 13 rätt bara 3 500–5 300 kr (rätt att den föll bort). En gång, omgång 2545, betalade 13 rätt 32 668 kr, men gränsen hade höjts till 31 140 kr för att få plats i budgeten. Med 20 000 kr tog C 13 rätt där. Utdelningsgränsen för C är kvar på 30 000 kr (användarens regel).
- Delat system (A+B): favoritregeln kan inte släppas där. Går det inte byggs A och B var för sig, och favoritregeln släpps bara om ingen kupong alls går att bygga.
- Webbens kupongmotor: tecken- och utdelningsreglerna släpps sist, och högst 60 färgkombinationer provas. Det tog Stryktipset från 17 s till under 1 s.

## Spikbedömning match för match (2026-09-30, användarens regel: alla matcher bedöms alltid match för match)

Den fasta regeln (spik bara om modellens favoritchans är minst 65 %) är borttagen. I stället bedöms varje match (`scripts/lib/stryk-calibration.mjs`): favoritchansen justeras efter hur ofta favoriter av samma slag vunnit i kupongarkivet före omgången. Samma slag betyder samma spel, 5-procentsband, hemma- eller bortafavorit och liga (krympt mot modellen, K = 40). Systemet byggs på de justerade procenten, och en match får spikas om den justerade chansen är minst 55 %. Bedömningen står i matchanalysen.

Kalibreringen i arkivet: favoriterna vinner nästan så ofta som modellen säger (faktor 0,94–1,08). En spik på en 55 %-favorit spricker alltså 45 % av gångerna som väntat. Det var aldrig modellfel utan chansspikar.

| Variant | ST A+B | ST C | ET A+B | ET C |
|---|---|---|---|---|
| Fast 65 %-regel (ST), ingen bedömning (ET) | −20 384 (29 %) | −8 928 (70 %) | −24 950 (39 %) | −10 024 (76 %) |
| Bedömning, spik från 55 % (vald) | **−6 175 (78 %)** | −9 226 (69 %) | −19 707 (52 %) | −24 750 (42 %) |
| Bedömning, ingen lägsta nivå | −8 559 (70 %) | −7 938 (73 %) | −33 043 (19 %) | −19 132 (55 %) |
| Bedömning, spik från 60 % | −5 946 (79 %) | −10 466 (65 %) | −29 976 (27 %) | −32 522 (23 %) |
| Bedömning, spik från 65 % | −16 789 (41 %) | −12 137 (59 %) | −30 223 (27 %) | −36 440 (14 %) |

- **Stryktipset:** A+B+C −15 401 kr mot −29 312 med den fasta regeln.
- **Europatipset:** A+B+C −44 457 kr mot −34 974 utan bedömning. Bedömningen gör det sämre här, men den gäller ändå (användarens regel). Följ upp efter 12+ omgångar.
- A+B ger nu mer än C på båda spelen, och sidans rekommendation är ändrad.

## Varför vi nästan aldrig får 13 rätt (2026-10-07, 168 ST-omgångar i arkivet, 4806–4973)

Användarens fråga: "varför får vi aldrig 13 rätt, jag vill få in en 13-rättare när utdelningen är över 30 000 kr". Mätt på kupongerna i `data/tips-archive/systems/` (A+B, nuvarande regler).

- **Det följer förväntan.** A+B:s modellchans är 1 på 208 per omgång, alltså väntat 0,8 tretton-rättare på 168 omgångar. Utfallet blev 1 (4917).
- **Rätt rad är extremt osannolik:** median 1 på 510 000 enligt våra procent.
- **Grundraden är flaskhalsen, inte utdelningsgränsen.** I 137 omgångar med 13 rätt ≥ 30 000 kr (eller ingen vinnare) låg rätt rad i grundraden bara 2 gånger. 81 % av missarna var spikar (304 av 668 sprack, 45 %). A+B:s lägsta utdelning låg i median på 33 765 kr (p90 42 033), så gränsen stängde bara ute 1 av 130 storomgångar.
- **Tak (de troligaste raderna med verklig utdelning ≥ 30 000 kr, utan tecken- och färgregler):**

  | Rader | Chans per omgång | Väntat på 168 omg | Hade tagit 13 rätt i |
  |---|---|---|---|
  | 400 | 1 på 204 | 0,83 | 4973 |
  | 800 | 1 på 111 | 1,52 | 4885, 4973 |
  | 1 600 | 1 på 61 | 2,76 | 3 omg |
  | 3 200 | 1 på 34 | 4,95 | 5 omg |
  | 6 400 | 1 på 19 | 8,72 | 8 omg |

- **Kupong D infördes samma dag** (användaren: "skapa en D, budget 500 kr, jobba fritt"): de 500 troligaste raderna med verklig utdelning ≥ 30 000 kr, inga andra regler, spelas som fil i Svenska Spels Egna rader (`buildCouponD` i `gui/public/stryk-engine.js`). Bakkörning (`node scripts/backtest-stryk-d.mjs [produkt] [--rows] [--utd]`), samma procent och streck som arkivets kuponger:

  | | Omg | Chans 13 rätt | 13 / 12 / 11 rätt (rader) | Netto | Tillbaka |
  |---|---|---|---|---|---|
  | Stryktipset D (500 kr) | 168 | 1 på 167 | 1 / 17 / 177 (4973, 59 266 kr) | +16 845 | 120 % |
  | Stryktipset A+B (arkivet, ~800 kr) | 168 | 1 på 208 | – | −28 723 | 78 % |
  | Europatipset D (500 kr) | 182 | 1 på 159 | 1 / 29 / 226 (2590, 55 109 kr) | +17 612 | 119 % |
  | Europatipset A+B (arkivet) | 182 | 1 på 162 | – | +1 738 | 101 % |

  Gränsen för D, Stryktipset: 20 000 kr gav chansen 1 på 134 men 13 rätt som betalade 12 106 kr (−39 112), 25 000 1 på 151 (−14 845), 40 000 1 på 196 (−37 956), 50 000 1 på 223 (+28 032, en träff). 30 000 behålls (användarens mål). Nettot styrs av en enda 13-rättare, så plusset är brus; chansen är måttet.
- **D i Gambling Cabin (2026-10-07, användaren: "D ska också kunna öppnas i Gambling Cabin"):** Gambling Cabin kan inte importera rader, så `buildCouponDGC` efterliknar D med regler: grundrad = D:s tecken, mest troliga tecknet per match blått, övriga färgas grönt < gult < rött < rosa efter kostnad ln(pmax/p) (kvantiler i `D_GC.splits`), färgtak plus lägsta utdelning (GC:s formel med 25 M/10 M i omsättning, avrundad uppåt) väljs så att 450–500 rader får högst chans. Fälla: **max 0 läses som ingen regel** i Gambling Cabin; färger med tak 0 tas därför bort ur grundraden. Verifierat för 4974: länken gav exakt 460 kr i Gambling Cabin, samma som motorn. Bakkörning (`backtest-stryk-d.mjs`): Stryktipset 1 på 209 (D-fil 1 på 167), snitt 484 rader, 13 rätt i 4820 och 4885, netto +49 164; Europatipset 1 på 207 (D-fil 1 på 159), 13 rätt i 2448, netto +86 168. Alltså ungefär 80 % av filens chans; plusset är brus (få träffar). Filen är fortfarande bäst, länken är för den som vill spela via Gambling Cabin.

- **Kupong E infördes 2026-10-07** (användaren: komplettera D i de missade matcherna, budget 500 kr): `buildCouponE` tar de 500 nästa raderna (≥ 30 000 kr) som inte finns i D och ger bonus (`gapBonus` 2,5) åt tecken D saknar. Fil till Egna rader, samma som D. Bakkörning (`node scripts/backtest-stryk-e.mjs`), 168 Stryktipset-omgångar:

  | | Chans 13 rätt | 13 rätt (omg) | Netto | Tillbaka |
  |---|---|---|---|---|
  | D (500 kr) | 1 på 167 | 4973 | +16 845 | 120 % |
  | E (500 kr) | 1 på 277 | 4885 | −14 083 | 83 % |
  | D+E (1 000 kr) | 1 på 104 | 4885 + 4973 | +2 762 | 102 % |

  E räddade 1 omgång där D missade (4885). Chansen D+E (1 på 104) är bättre än A+B (1 på 208 för ~800 kr). Nettot är brus (få 13-rättare); chansen är måttet.
- **Slutsats:** dagens 800 rader (A+B) ger samma chans som de 400 bästa raderna. Gambling Cabin kan inte välja rader efter chans, bara via grundrad, tecken-, färg- och utdelningsregler, och det kostar ungefär halva chansen. Med 800 kr i veckan är taket ändå en 13-rättare ungefär vartannat år. Vill man ha det oftare krävs större insats eller egna rader (filuppladdning), som bryter regeln om bara Gambling Cabin-länk.

## Robusta lärdomar (stöds av hela urvalet)

1. **Oddsen slår vår lagmodell.** Logloss över 216 matcher, där lägre är bättre:

   | Modellvikt | 0 % | 10 % | 20 % | 35 % (gammal) | 50 % |
   |---|---|---|---|---|---|
   | Logloss | 1,0620 | 1,0623 | 1,0630 | 1,0647 | 1,0672 |

   → **Modellvikten sänkt från 35 % till 10 %** (2026-09-28). Med 10 % ökade antalet rader med minst 10 rätt för system A från 23 till 54 och med minst 11 rätt från 2 till 7. För B ökade rader med minst 10 rätt från 21 till 26. Oddsen var alltså bättre trots att det bara var startodds.
2. **Bara 12 och 13 rätt betalar något.** I normala omgångar gav 10 rätt 0 kr och 11 rätt ofta 29–100 kr. Systemens värde avgörs nästan helt av 13 rätt (och 12). Utvärdera därför på rader med 11+ och 12+ rätt och på chansen till 13 rätt, inte på snittet av antal rätt.
3. **Vissa veckor är 13 rätt värt under 30 000 kr.** Exempel: v4942 gav 9 420 kr och v4952 14 196 kr. Med regeln "utdelning ≥ 30 000 kr" kan systemet inte ta 13 rätt de veckorna. Det är ett medvetet val (värde före träff).
4. **A:s spikar är välkalibrerade.** 59 höll mot väntat 64,4 (85 spikar), vilket är inom slumpen.
5. **Kryss:** 64 utfall mot 57,7 väntat enligt oss och 51,8 enligt folket. Det är ungefär 1 standardfel och räcker inte för att kalibrera om. Folket underspelar X klart mer än vi, så X ger ofta streckvärde. Följ utvecklingen löpande.

## Hypoteser som testades och **förkastades**

| Förslag | Källa | Resultat | Beslut |
|---|---|---|---|
| A-spik bara om P ≥ 55 % och folk/P ≤ 1,30; max 4 spikar; 1X/X2 i stället för 12 | Stryktips-agenten efter 5 omgångar | Rader med minst 10 rätt för A föll från 8 till 0 (hösten). Chansen till 13 rätt sjönk från ~1/550 till ~1/1300–3200. På 17 omgångar höll spikar med folk/P ≥ 1,3 i 6 av 11 mot väntat 5,7, alltså ingen effekt. | Förkastad: brus i 5 omgångar |
| B måste ha X där A spikar och B-spik kräver P ≥ 50 % | Stryktips-agenten | B fick nästan inga spikar och chansen till 13 rätt sjönk till 1 på 4 000–11 000 | Förkastad |
| B-spik kräver P ≥ 50 % (utan X-kravet) | Egen | 17 omgångar: rader med minst 10 rätt för B föll från 21 till 12, chansen till 13 rätt från 1/939 till 1/1916 | Förkastad |
| Bollinnehavsstil (Hög/Mellan/Låg, snitt senaste 10 matcherna, tertiler per liga) justerar 1X2 eller X | Användaren (2026-09-28) | 19 077 matcher i 22 ligor (ESPN-innehav mot stängningsodds 2023–2026): inget stilmöte avviker från oddsen på 1X2 eller X. 3 av 396 liga×möte-tester har \|z\| ≥ 2,5, vilket är färre än slumpen ger (~5). På 456 Stryktipsmatcher streckar folket innehavslaget i Hög–Låg-möten med folk/P ≈ 1,13, lika mycket som andra favoriter på samma P-nivå (≈ 1,14). Stilen tillför alltså ingen felvärdering som streckvärdet inte redan fångar. | Förkastad. Följ upp: PL Hög–Låg gav fler kryss 2024/25–2025/26 (26,9 % mot 21,1 % väntat, 242 matcher) men inte 2023/24. Kan bara valideras på ny data. |
| A och B missar något tecken (1/X/2) oftare än modellen väntar, korrigera sannolikhet eller halvgarderingstecken | Användaren (2026-10-03) | 107 omg, 1 294 PL/CH/L1-matcher: A missade 1 50 (väntat 45), X 137 (135), 2 120 (104). B: 1 77 (63), X 145 (162), 2 111 (107). Kryss missas oftast (42–45 %) men som väntat. Starkaste cellen (A:s halvor utan röd 2:a, z 2,5) klarar inte träning/kontroll, och stängningsodds 2017–2026 underskattar inte röda bortalag. Detaljer i `docs/lardomar/slutsatser.md` (Förkastat 2026-10-03). | Förkastad, ingen ändring. Följ upp A:s halvor mot röd 2:a efter ~30 nya omgångar. |
| Ta med X oftare i A och B: (a) 1X/X2 före 12 (bonus 3/6 p.e.), (b) ingen favoritspik vid X ≥ 27/30 %, (c) X × 1,1/1,2 | Användaren (2026-10-03) | 107 omg (`data/stryktips-backtest-*-kryss-*.json`). (a)/(c): A:s X-missar 137 → 83–104 men missar totalt 307 → 307–319, chans 0,234 → 0,220–0,224 %, A tappar sin 13:a, netto A +24 234 → −20 650 till −32 629, B 12+ 4 → 0–2. (b): X-missar 137 → 135, A marginellt bättre, B sämre med 27 %, ±0 med 30 %. Tabell i `docs/lardomar/slutsatser.md`. | Förkastad. Reglagen `STRYK_X_*` finns kvar, avstängda. |
| B:s teckenregel 3-3-3 → 3-2-2 (A 4-2-2 → 3-2-2 testat samtidigt) | Egen (2026-10-03, analys av omgångar > 40 000 kr) | 3-3-3 uteslöt rätt rad i 51 av 107 omgångar (bl.a. 4847, 247 257 kr, som låg i B:s grundrad). 107 omg: B 3-2-2 chans 0,087 → 0,099 %, högre i alla tre perioderna, 13 rätt i 4825. B 2-2-2 lika chans, sämre netto. A 3-2-2 ingen skillnad i A, sämre C. | **B 3-2-2 infört.** A kvar 4-2-2. |
| Helgardering med andelar 40/30/30 (högst streck = 40), 1000 kr/omg | Användaren (2026-10-08) | ST 169 omg (2023-07–2026-10): −14 826 kr (−8,8 % ROI), 47 plusomg. ET 183 omg: −68 559 kr (−37 % ROI). Snitt ~6,4 streckfavoriter rätt/13. ~60 % av ST-vinsten från 13-rätt (jackpottar) trots ~0,001 kr snittinsats på rätt rad. `scripts/backtest-streck-403030.mjs`. | Förkastad som spelstrategi (förlust, särskilt ET). |
| 1–3 hårda spikar + 40/30/30 på resten (streck- eller oddsfavorit) | Användaren (2026-10-08) | ST 169 omg, 1000 kr: spik1 −28k (−16 %), spik2 −52k (−31 %), spik3 −82k (−48 %). Spikfel 48/87/123 omg. Fler spikar = sämre. ET samma mönster. `scripts/backtest-andel-modeller.mjs`. | Förkastad. Hårda spikar i andelsystem dödar kupongen oftare än de hjälper. |
| Andelar = p_odds / √folk (value), ev. market×X1,15 | Egen (2026-10-08) | ST kontinuerligt: +4 761 kr (+2,8 %). ST som kupong F (1000 egna rader): −70 247 kr (−42 %), 0×13 rätt i listan på 169 omg – samma förväntan men hög jackpot-varians. ET kontinuerligt −28 %. | **Kupong F införd** (`buildCouponF`). Följ upp verkligt spel; jämför med D/E. |

**Metodlärdom:** 5 omgångar (65 matcher) räcker inte för att ändra regler. Hösten 2026 hade 37 % kryss, men våren låg på normala 26 %. Testa alltid mot minst 12–17 omgångar och på flera mått innan en regel ändras.

## Öppna frågor att följa

- **System B underpresterar** (hela 2025/26: −8 210 kr mot A:s +3 109 kr med samma insats). Den är konstruerad för att gå emot A, och B:s spikar mot folket (folk/P < 1,15) höll bara 7 av 26 mot väntat 12,8. Alla varianter vi testat har ändå varit sämre. Följ B i de sparade systemen innan något ändras.
- **X-kalibrering:** om kryss ligger > 2 standardfel över förväntan efter ytterligare ~10 omgångar, höj X i jämna matcher (|P1−P2| < 0,15).
- **Slutodds:** spara oddsen vid spelstopp för framtida backtest. Då blir marknadsjämförelsen rättvisare än med startodds.

## Resultat per omgång (modellvikt 10 %, aktuell version)

| Omgång | Datum | PL-matcher | Kryss | 13 rätt (vinnare) | A bästa | A vinst | B bästa | B vinst |
|---|---|---|---|---|---|---|---|---|
| 4939 | 2026-02-07 | 6 | 3 | 319 290 (23) | 10 | 138 | 10 | 552 |
| 4941 | 2026-02-21 | 5 | 5 | 3 347 371 (2) | 7 | 0 | 8 | 0 |
| 4942 | 2026-02-28 | 4 | 1 | 9 420 (1380) | 8 | 0 | 9 | 0 |
| 4944 | 2026-03-14 | 5 | 4 | 1 181 818 (11) | 7 | 0 | 8 | 0 |
| 4945 | 2026-03-21 | 3 | 3 | 40 623 (159) | 7 | 0 | 9 | 0 |
| 4948 | 2026-04-11 | 3 | 3 | 684 210 (19) | **12** | 9 675 | 6 | 0 |
| 4949 | 2026-04-18 | 4 | 3 | 27 133 (228) | 9 | 0 | 9 | 0 |
| 4950 | 2026-04-25 | 4 | 3 | 47 619 (273) | 10 | 0 | 7 | 0 |
| 4951 | 2026-05-02 | 4 | 3 | 63 157 (190) | 10 | 48 | 8 | 0 |
| 4952 | 2026-05-09 | 4 | 3 | 14 196 (418) | 10 | 0 | 9 | 0 |
| 4953 | 2026-05-17 | 5 | 5 | 1 375 000 (8) | 5 | 0 | 6 | 0 |
| 4954 | 2026-05-24 | 10 | 4 | 970 175 (6) | 9 | 0 | 9 | 0 |
| 4967 | 2026-08-22 | 4 | 5 | 1 522 223 (4) | 9 | 0 | 6 | 0 |
| 4968 | 2026-08-29 | 3 | 3 | 590 909 (22) | 6 | 0 | 9 | 0 |
| 4969 | 2026-09-05 | 6 | 5 | 764 705 (17) | 9 | 0 | **11** | 2 334 |
| 4970 | 2026-09-12 | 7 | 5 | 10 000 000 (1) | 9 | 0 | 9 | 0 |
| 4971 | 2026-09-19 | 4 | 6 | – (0) | 9 | 0 | 7 | 0 |

**Summa för 17 omgångar:**

| System | Netto | Rader med 10+ rätt | Rader med 11+ rätt | Chans 13 rätt per omgång |
|---|---|---|---|---|
| A | +3 357 kr | 54 | 7 | ~1/500 |
| B | −3 556 kr | 26 | 2 | ~1/912 |

Nettot styrs av enstaka träffar: A:s plus kommer från en enda rad med 12 rätt. Med 65 % återbetalning är det normala förväntade utfallet negativt. Nettot säger därför lite om kvaliteten, och rader med 11+ rätt är ett bättre mått.

## Ändringslogg

- **2026-10-09:** D:s standard höjd från 500 till 1 050 kr (användaren: samma insats som F, raderna ska betala minst 30 000 kr). Urvalet är oförändrat: de troligaste raderna med utdelning ≥ 30 000 kr, bara fler av dem. Bakkörning 168 Stryktipsomgångar (`node scripts/backtest-stryk-d.mjs stryktipset --rows 1050`): chans 1 på 87 (500 kr var 1 på 167), 13 rätt i 4820 (45 825 kr), 4885 (42 207 kr) och 4973 (59 266 kr), netto +54 482 kr. E är kvar på 500 kr.

- **2026-10-08:** Baktest av helgardering 40/30/30, spik+40/30/30 och andelsmodeller – se förkastade hypoteser. **Kupong F** (1050 kr, fristående, default **40/30/30** streck, Egna rader). Diskret baktest 169 omg: 1000 −41 %, 1050 −43 %, 1500 +8 % (en stor 12-rätt), 2000−10k sämre. Skript: `scripts/backtest-stryk-f.mjs --model streck4030 --budget …`.

- **2026-09-30 (natt, match för match):** Fast 65 %-spikregel borttagen. Alla matcher bedöms match för match på båda spelen (användarens regel), spik från justerad chans 55 %. Se avsnittet om spikbedömning.

- **2026-09-30 (sent, rekommendation):** Användaren följde rekommendationen. Utdelningsregeln är en LÄGSTA gräns igen, som får höjas (exakt gräns kvar bakom STRYK_EXACT=1). Spikgränsen på Stryktipset och kupong C behålls. Servern bygger A och B var för sig som webben. Backtest med det (38 ST / 55 ET omg), återbetalning per insatt krona: ST C 70 % (−8 928 kr, 11+ 48), ET C 76 % (−10 024, 11+ 105), ST A+B 29 % (−20 384, 11+ 15; det delade systemet gav 64 % men används inte i webben), ET A+B 39 % (−24 950). Sidan rekommenderar att i första hand spela C. **Reglerna fryses** tills minst 12 nya omgångar utvärderats mot facit.

- **2026-09-30 (natt, exakt gräns):** Utdelningsgränsen i Gambling Cabin-länken är exakt regeln (användaren: "30k, inte mindre, inte mer"): A 30 000 / Europatipset 20 000, B och C 30 000. Budgeten nås med grundrad och färgregler. Går det inte höjs gränsen som reserv, och kupongen säger det. Servern bygger nu A och B var för sig (B 3-3-3, högst 2 spikar som A, ingen samma halvgardering, minst 30 000), eftersom det delade systemet alltid gav A en högre gräns. Backtest: Europatipset exakt i 55/55 omgångar (A, B, C), A+B −26 708 kr (11+ 69) mot −24 809, C −26 366 (11+ 79) mot −10 024. Stryktipset exakt bara i A 11/38, B 22/38, C 26/38 (30 000 släpper igenom för många rader), A+B −20 572 (11+ 18) mot −10 194, C −11 648 (11+ 43) mot −8 928.

- **2026-09-30 (natt, C-backtest):** Egna krav för kupong C (knapparna C och Alla; A+B gäller inte C). C byggs även i fetch-stryktipset.mjs och backtestas. Stryktipset: spik bara på favoriter ≥ 65 % (A, B, C). Europatipset C: 3-2-2. Favoritregeln släpps sist (efter skrällgränsen) och aldrig i delat system. Se avsnittet om kupong C.

- **2026-09-30 (natt, C):** Kupong C på sidan: ett eget system på 700–850 kr, oberoende av A och B och utan krav, samma regler som A och minst 30 000 kr för 13 rätt (användarens beslut). Europatipset 2612: 728 rader, chans 1 på 213; Stryktipset 4972: 774 rader, 1 på 184. Inte backtestad än (byggs bara i webbläsaren).

- **2026-09-30 (natt, sist):** Färgmålen är inte fasta längre (användaren: inte fasta, inte snäva). Per omgång räknas väntat antal gröna/gula/röda i rätt rad (summan av våra procent), och fönstret för hela raden är 3–4 brett runt det väntade antalet. Spikarna är rosa och deras färger dras av i länken. Backtest (ST 38 / ET 55 omg): fönster 3–4 ST −22 557 kr (11+ 23), ET −24 797 kr (11+ 71, väntad 13 rätt 0,265); bredd 3: −23 380 / −29 847; bredd 4: −23 468 / −24 811; bredd 5 ungefär som 4. Jämfört med fasta mål (−16 154 / −30 389) och fri optimering med bredd 2 (−8 373 / +8 596). Chansen till 13 rätt är lika hög som med bredd 2, men utfallet (några stora vinster) var sämre. Följ upp.

- **2026-10-07:** Icke-spikbara matcher baserar tipset på samma marknadsstyrda Oddset-blandning som tips-sidan (`tips-latest.json` → `pro.blended` / marketLed), när matchen finns där. Spikbara matcher behåller kalibrerad spikbedömning (`sysP`). Infört i `scripts/fetch-stryktipset.mjs` (`applyOddsetTipBasis`). Kräver omhämtning av kupongen. Inte backtestat ännu – utvärdera efter 12+ omgångar.

- **2026-09-30 (natt):** Fasta färgmål för hela raden, användarens beslut: grön 3–7, gul 4–8, röd 1–3 (båda spelen). Spikarna är rosa igen och deras färger dras av från målen i Gambling Cabin-länken (rosa = antal spikar). Går målen inte att hålla optimeras färgerna fritt, och skräll- och favoritregeln släpps sist. Backtest mot bredd 2 utan mål: Stryktipset −16 154 kr mot −8 373 (11+ 29 mot 29, väntad 13 rätt 0,119 mot 0,139); Europatipset −30 389 kr mot +8 596 (11+ 48 mot 84). Målen är alltså sämre i båda spelen, men användaren valde dem. Utvärdera efter 12+ nya omgångar.

- **2026-09-30 (sent):** Färgreglerna har minsta bredd 2 (t.ex. röd 1–3), användarens beslut: bredd 1 var för snäv i Gambling Cabin. Backtest: Stryktipset (yttre band, röd max 4) −8 373 kr mot −8 771 med bredd 1 (12+ 4 mot 3, 11+ 29 mot 34); Europatipset +8 596 mot +24 712 kr (11+ 84 mot 115). Bredd 3: −21 461 respektive −27 131, sämst i båda.

- **2026-09-30 (kväll):** Färgband från rätt rad senaste året som yttre gräns för färgreglerna på Stryktipset, röda högst 4, färger över alla 13 matcher (spikar i sin färg, ingen rosa i Gambling Cabin-länken). Europatipset utan band. Backtest ovan.

- **2026-09-30:** Färgregler per rad (grön/gul/röd, minsta bredd 1, optimeras mot chans till 13 rätt) och rosa = antal spikar i Gambling Cabin-länken. Högst 4 spikar per kupong. Favoriten i en gardering finns på minst 10 % av raderna. Backtest av bredder ovan. Budgetbaktestet är omkört med nya motorn.

- **2026-09-29:** Vanliga missar och turmatcher (se ovan), visas på Stryktipset/Europatipset A och B. B-sidan: krav med valfria tecken (1, X, 2, 1X, X2, 12, 1X2) som gäller A, B eller båda. Kupong B är ett eget system med minst 30 000 kr för 13 rätt utan tak, en annan grundrad än A och vald för att täcka rader A saknar (användarens regel). Hämtningens delade system på Stryktipset A är oförändrat.

- **2026-09-28 (sent):** Spikanalysen (tabell och form) visade inget missat. Stryktipsarkivet går tillbaka till augusti 2023. Den sena körningen går nära spelstopp med vakt och färska skarpa odds. Namnjämförelsen är förbättrad. Folkets streck vägs inte in på Stryktipset.

- **2026-09-28 (natt):** Kupongarkiv `data/tips-archive` (272 omgångar sedan januari 2025 plus alla framtida). Backtestet läser arkivet. Analys av omgångar med minst 40 000 kr. `STRYK_GRUND_MAX` finns för test av större grundrader (ingen effekt).

- **2026-09-28 (natt, sist):** Steg 4 (se ovan). Delat system 700–800 rader med minst 4-2-2 i kupong A och B för båda spelen. Odds från The Odds API för landskamper, Europacup och nordiska ligor. Neutral plan i Elo. Klubb-Elo. xG från Understat. 50/50 modell och folk när odds saknas. Europatipsets backtest innehåller nu steg 4.

- **2026-09-28 (natt, sent):** FotMob-kontext (`scripts/lib/match-context.mjs`) för alla matcher i öppna omgångar, både Stryktipset och Europatipset: elva, frånvaro, vila/rotation, domare, väder. Visas i analysen och på webben och sparas i snapshots (`context`) för framtida backtest. Kontexten flyttar inte procenten. Elo-namnjämförelsen är rättad. Expertgranskningen av Europatipset är införd ovan.

- **2026-09-28 (natt):** Steg 2: skarpa odds (Pinnacle/Betfair/bolagssnitt, slutodds i backtest) och jackpot i utdelningen. Snapshots sparar odds och streck. Upptäckt att 5-3-2 bara släpper igenom rätt rad i 34 % av omgångarna. Backtest-vyn visar tre steg.

- **2026-09-28 (natt):** Europatipset backtestat (55 omgångar med minst 3 topp 4-matcher). Ingen egen logik behövs: omsättningen påverkar inte utdelningsgränsen, och att sänka gränsen var brus. Backtestet har nu produktberoende urval, `--all`, `STRYK_UTD_MIN` och `STRYK_TURNOVER`. Därefter bytte Europatipset till utdelningsgränsen 20 000 kr (användarens beslut, `UTD_MIN_BY_PRODUCT` i `scripts/fetch-stryktipset.mjs`).

- **2026-09-28 (sent):** Startelvor/frånvaro läses från Oddset-tipsen (data/tips-latest.json: ESPN-elva för PL/Championship, annars FPL-skador) och visas per match. Samma anfallsfaktor och vikt (alpha) som Oddset. Oddsets backtest (2000 matcher) valde alpha 0, så elvorna flyttar inte procenten direkt. Effekten kommer via oddsen när man kör sent. Nytt arbetsflöde: "Stryktipset – sen körning (startelvor)". Öppen fråga: backtesta elva-effekten på Stryktipset när vi har sparade slutodds.

- **2026-09-28 (kväll):** Backtest av hela säsongen 2025/26 (33 omgångar) med båda modellvikterna, vilket bekräftar 10 %. Skripten har nu `STRYK_SEASONS` och `STRYK_MODEL_W` för backtest. Backtest-vy på webben. Europatipset använder samma regler (bekräftat av användaren).

- **2026-09-28:** Första backtestet (17 omgångar). Modellvikten sänktes från 35 % till 10 % (`MODEL_W`, `MODEL_W_THIN` i `scripts/fetch-stryktipset.mjs`). Agentens spikregler och B-regler testades och förkastades (se ovan).
