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
- **Användarens fasta regler gäller i alla körningar:** 350–400 kr per system, utdelning för 13 rätt ≥ 30 000 kr (Europatipset ≥ 20 000 kr från 2026-09-28), A minst 5-3-2, B minst 4-3-3, max alltid fullt, och B har högst 1 gemensam spik med A.
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

- **2026-09-28 (natt):** Steg 2: skarpa odds (Pinnacle/Betfair/bolagssnitt, slutodds i backtest) och jackpot i utdelningen. Snapshots sparar odds och streck. Upptäckt att 5-3-2 bara släpper igenom rätt rad i 34 % av omgångarna. Backtest-vyn visar tre steg.

- **2026-09-28 (natt):** Europatipset backtestat (55 omgångar med minst 3 topp 4-matcher). Ingen egen logik behövs: omsättningen påverkar inte utdelningsgränsen, och att sänka gränsen var brus. Backtestet har nu produktberoende urval, `--all`, `STRYK_UTD_MIN` och `STRYK_TURNOVER`. Därefter bytte Europatipset till utdelningsgränsen 20 000 kr (användarens beslut, `UTD_MIN_BY_PRODUCT` i `scripts/fetch-stryktipset.mjs`).

- **2026-09-28 (sent):** Startelvor/frånvaro läses från Oddset-tipsen (data/tips-latest.json: ESPN-elva för PL/Championship, annars FPL-skador) och visas per match. Samma anfallsfaktor och vikt (alpha) som Oddset. Oddsets backtest (2000 matcher) valde alpha 0, så elvorna flyttar inte procenten direkt. Effekten kommer via oddsen när man kör sent. Nytt arbetsflöde: "Stryktipset – sen körning (startelvor)". Öppen fråga: backtesta elva-effekten på Stryktipset när vi har sparade slutodds.

- **2026-09-28 (kväll):** Backtest av hela säsongen 2025/26 (33 omgångar) med båda modellvikterna, vilket bekräftar 10 %. Skripten har nu `STRYK_SEASONS` och `STRYK_MODEL_W` för backtest. Backtest-vy på webben. Europatipset använder samma regler (bekräftat av användaren).

- **2026-09-28:** Första backtestet (17 omgångar). Modellvikten sänktes från 35 % till 10 % (`MODEL_W`, `MODEL_W_THIN` i `scripts/fetch-stryktipset.mjs`). Agentens spikregler och B-regler testades och förkastades (se ovan).
