# Stryktipset – lärdomar från backtest

Levande fil. Här samlas allt vi lärt oss om de automatiska Stryktipset-systemen (A och B), så att kunskapen finns kvar mellan sessioner. Nya backtest och omgångar ska läggas till här: lägg till rader, skriv inte över.

- Rådata: `data/stryktips-backtest.json` (hösten 2026) och `data/stryktips-backtest-2526.json` (våren 2026). Varje match har sannolikheter, utfall, systemens val och logloss.
- Sparade riktiga system med facit: `data/stryktips-history/`.
- Köra om:
  ```
  node scripts/backtest-stryktipset.mjs                                       # från 2026-08-01
  node scripts/backtest-stryktipset.mjs --to 2026-06-30 --count 12 --out data/stryktips-backtest-2526.json
  ```

## Förutsättningar (viktigt vid tolkning)

- **Marknaden i backtestet är Svenska Spels startodds.** API:t saknar slutodds för avgjorda omgångar. Live används oddsen vid hämtning, som ligger närmare spelstopp och är skarpare.
- **Folkets streck är slutliga värden** (vid spelstopp).
- **Lagmodellen har cutoff = omgångens första match**, så den använder ingen framtidsdata. Landslags-Elo är däremot dagens, men det påverkar bara landskamper.
- **Användarens fasta regler gäller i alla körningar:** 350–400 kr per system, utdelning för 13 rätt ≥ 30 000 kr, A minst 5-3-2, B minst 4-3-3, max alltid fullt, och B har högst 1 gemensam spik med A.
- **Utdelning räknas med Svenska Spels verkliga vinstklasser.**

## Datamängd

| Period | Omgångar | Matcher | Urval |
|---|---|---|---|
| 7 feb – 24 maj 2026 (säsongen 2025/26) | 12 | 156 | de 12 sista med minst 1 PL-match |
| 22 aug – 19 sep 2026 (säsongen 2026/27) | 5 | 65 | alla med PL-match sedan 1 aug |
| **Totalt** | **17** | **221** | |

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

**Metodlärdom:** 5 omgångar (65 matcher) räcker inte för att ändra regler. Hösten 2026 hade 37 % kryss, men våren låg på normala 26 %. Testa alltid mot minst 12–17 omgångar och på flera mått innan en regel ändras.

## Öppna frågor att följa

- **System B underpresterar.** Den är konstruerad för att gå emot A, och B:s spikar mot folket (folk/P < 1,15) höll bara 7 av 26 mot väntat 12,8. Alla varianter vi testat har ändå varit sämre. Följ B i de sparade systemen innan något ändras.
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

- **2026-09-28:** Första backtestet (17 omgångar). Modellvikten sänktes från 35 % till 10 % (`MODEL_W`, `MODEL_W_THIN` i `scripts/fetch-stryktipset.mjs`). Agentens spikregler och B-regler testades och förkastades (se ovan).
