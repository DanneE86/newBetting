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
- **Användarens fasta regler gäller i alla körningar:** 350–400 kr per system, utdelning för 13 rätt ≥ 30 000 kr, A minst 5-3-2, B minst 4-3-3, max alltid fullt, och B har högst 1 gemensam spik med A.
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

Urval: omgångar sedan 1 aug 2025 med minst 3 matcher från topp 4-ligorna, alltså 55 av 119 omgångar. Samma regler som Stryktipset (A 5-3-2, B 4-3-3, 350–400 kr).
Rådata: . Köra om: omgång 2611 (2026-09-27): PL 0, topp 4 0 – hoppar över
omgång 2610 (2026-09-24): PL 0, topp 4 0 – hoppar över
omgång 2609 2026-09-20 (PL 4): facit X21X111X21212 · A bästa 11 (-179 kr) · B bästa 8 (-383 kr) · grundrad A 12/13
omgång 2608 2026-09-16 (PL 0): facit 221X1X22112XX · A bästa 9 (-351 kr) · B bästa 9 (-386 kr) · grundrad A 11/13
omgång 2607 2026-09-13 (PL 2): facit 22111X221X1X2 · A bästa 7 (-395 kr) · B bästa 11 (-345 kr) · grundrad A 10/13
omgång 2606 (2026-09-09): PL 0, topp 4 0 – hoppar över
omgång 2605 2026-09-06 (PL 2): facit 1XXXX1X12X221 · A bästa 8 (-395 kr) · B bästa 11 (514 kr) · grundrad A 9/13
omgång 2604 (2026-09-02): PL 0, topp 4 0 – hoppar över
omgång 2603 2026-08-30 (PL 4): facit 11X1221121111 · A bästa 10 (-393 kr) · B bästa 8 (-389 kr) · grundrad A 13/13
omgång 2602 (2026-08-27): PL 0, topp 4 1 – hoppar över
omgång 2601 2026-08-23 (PL 3): facit X112212X21211 · A bästa 9 (-382 kr) · B bästa 7 (-372 kr) · grundrad A 12/13
omgång 2600 (2026-08-20): PL 0, topp 4 1 – hoppar över
omgång 2599 (2026-08-16): PL 0, topp 4 2 – hoppar över
omgång 2598 (2026-08-13): PL 0, topp 4 0 – hoppar över
omgång 2597 (2026-08-09): PL 0, topp 4 0 – hoppar över
omgång 2596 (2026-08-06): PL 0, topp 4 0 – hoppar över
omgång 2595 (2026-08-02): PL 0, topp 4 0 – hoppar över
omgång 2594 (2026-07-30): PL 0, topp 4 0 – hoppar över
omgång 2593 (2026-07-26): PL 0, topp 4 0 – hoppar över
omgång 2592 (2026-07-23): PL 0, topp 4 0 – hoppar över
omgång 2591 (2026-07-19): PL 0, topp 4 0 – hoppar över
omgång 2590 (2026-07-15): PL 0, topp 4 0 – hoppar över
omgång 2589 (2026-07-12): PL 0, topp 4 0 – hoppar över
omgång 2588 (2026-07-09): PL 0, topp 4 0 – hoppar över
omgång 2587 (2026-07-05): PL 0, topp 4 0 – hoppar över
omgång 2586 (2026-06-29): PL 0, topp 4 0 – hoppar över
omgång 2585 (2026-06-25): PL 0, topp 4 0 – hoppar över
omgång 2584 (2026-06-22): PL 0, topp 4 0 – hoppar över
omgång 2583 (2026-06-17): PL 0, topp 4 0 – hoppar över
omgång 2582 (2026-06-11): PL 0, topp 4 0 – hoppar över
omgång 2581 (2026-06-07): PL 0, topp 4 0 – hoppar över
omgång 2580 (2026-06-03): PL 0, topp 4 0 – hoppar över
omgång 2579 (2026-05-31): PL 0, topp 4 0 – hoppar över
omgång 2578 (2026-05-27): PL 0, topp 4 0 – hoppar över
omgång 2577 2026-05-23 (PL 0): facit 112X1X1X11111 · A bästa 6 (-395 kr) · B bästa 8 (-393 kr) · grundrad A 9/13
omgång 2576 (2026-05-20): PL 0, topp 4 0 – hoppar över
omgång 2575 2026-05-16 (PL 0): facit 2XXXXX1212X11 · A bästa 10 (-224 kr) · B bästa 9 (-354 kr) · grundrad A 10/13
omgång 2574 2026-05-13 (PL 1): facit 1121112222XX1 · A bästa 10 (-344 kr) · B bästa 10 (-321 kr) · grundrad A 11/13
omgång 2573 2026-05-10 (PL 4): facit 2XXX122212212 · A bästa 9 (-385 kr) · B bästa 10 (-345 kr) · grundrad A 11/13
omgång 2572 2026-05-07 (PL 0): facit 1112X11111122 · A bästa 8 (-392 kr) · B bästa 9 (-370 kr) · grundrad A 11/13
omgång 2571 2026-05-03 (PL 3): facit 121122X11X111 · A bästa 10 (-251 kr) · B bästa 8 (-379 kr) · grundrad A 11/13
omgång 2570 2026-04-30 (PL 1): facit 11211122X1121 · A bästa 8 (-352 kr) · B bästa 8 (-368 kr) · grundrad A 11/13
omgång 2569 2026-04-26 (PL 0): facit 1XX2X21112X11 · A bästa 8 (-374 kr) · B bästa 9 (-363 kr) · grundrad A 11/13
omgång 2568 2026-04-22 (PL 2): facit 2XX21XX2112X2 · A bästa 11 (296 kr) · B bästa 7 (-360 kr) · grundrad A 11/13
omgång 2567 2026-04-19 (PL 4): facit 12111211X2221 · A bästa 8 (-387 kr) · B bästa 8 (-357 kr) · grundrad A 12/13
omgång 2566 (2026-04-15): PL 0, topp 4 0 – hoppar över
omgång 2565 2026-04-12 (PL 4): facit 211X2X1122112 · A bästa 6 (-391 kr) · B bästa 9 (-354 kr) · grundrad A 10/13
omgång 2564 (2026-04-07): PL 0, topp 4 0 – hoppar över
omgång 2563 2026-04-05 (PL 0): facit X122X21XXX1X1 · A bästa 8 (-354 kr) · B bästa 10 (-103 kr) · grundrad A 10/13
omgång 2562 (2026-03-31): PL 0, topp 4 0 – hoppar över
omgång 2561 (2026-03-29): PL 0, topp 4 0 – hoppar över
omgång 2560 (2026-03-26): PL 0, topp 4 0 – hoppar över
omgång 2559 2026-03-22 (PL 2): facit 21211212X1222 · A bästa 7 (-370 kr) · B bästa 9 (-359 kr) · grundrad A 10/13
omgång 2558 (2026-03-18): PL 0, topp 4 0 – hoppar över
omgång 2557 2026-03-15 (PL 4): facit X1XX1X112X112 · A bästa 9 (-359 kr) · B bästa 8 (-366 kr) · grundrad A 10/13
omgång 2556 (2026-03-11): PL 0, topp 4 0 – hoppar över
omgång 2555 2026-03-08 (PL 0): facit 11X121X1X2X11 · A bästa 10 (-359 kr) · B bästa 9 (-385 kr) · grundrad A 11/13
omgång 2554 2026-03-04 (PL 5): facit 122X2X12XX212 · A bästa 9 (-393 kr) · B bästa 8 (-388 kr) · grundrad A 11/13
omgång 2553 2026-03-01 (PL 4): facit 1111X11X2121X · A bästa 8 (-395 kr) · B bästa 9 (-373 kr) · grundrad A 11/13
omgång 2552 (2026-02-24): PL 0, topp 4 0 – hoppar över
omgång 2551 2026-02-22 (PL 4): facit 22211211X1111 · A bästa 9 (-394 kr) · B bästa 8 (-394 kr) · grundrad A 12/13
omgång 2550 (2026-02-18): PL 1, topp 4 2 – hoppar över
omgång 2549 2026-02-15 (PL 0): facit X12X221221111 · A bästa 8 (-392 kr) · B bästa 10 (-387 kr) · grundrad A 12/13
omgång 2548 2026-02-11 (PL 5): facit 211X21X11X122 · A bästa 9 (-392 kr) · B bästa 6 (-372 kr) · grundrad A 11/13
omgång 2547 2026-02-08 (PL 2): facit 22X212211X212 · A bästa 7 (-352 kr) · B bästa 10 (-140 kr) · grundrad A 10/13
omgång 2546 (2026-02-04): PL 0, topp 4 0 – hoppar över
omgång 2545 2026-02-01 (PL 4): facit X12X2XX1X1121 · A bästa 11 (-31 kr) · B bästa 10 (-390 kr) · grundrad A 13/13
omgång 2544 (2026-01-28): PL 0, topp 4 0 – hoppar över
omgång 2543 2026-01-25 (PL 4): facit 22221X1111122 · A bästa 9 (-354 kr) · B bästa 9 (-360 kr) · grundrad A 11/13
omgång 2542 (2026-01-21): PL 0, topp 4 0 – hoppar över
omgång 2541 2026-01-18 (PL 2): facit X2221X1112XX1 · A bästa 8 (-384 kr) · B bästa 10 (-337 kr) · grundrad A 10/13
omgång 2540 2026-01-14 (PL 0): facit 21111X11221X2 · A bästa 10 (-386 kr) · B bästa 8 (-371 kr) · grundrad A 13/13
omgång 2539 2026-01-11 (PL 0): facit 22XX1X1XX2X12 · A bästa 8 (-379 kr) · B bästa 12 (5171 kr) · grundrad A 10/13
omgång 2538 2026-01-07 (PL 8): facit X1X11X1X1X222 · A bästa 11 (501 kr) · B bästa 7 (-392 kr) · grundrad A 11/13
omgång 2537 2026-01-03 (PL 3): facit 211X1X222X21X · A bästa 8 (-391 kr) · B bästa 10 (-245 kr) · grundrad A 10/13
omgång 2536 2026-01-01 (PL 4): facit XXXX1X1221X11 · A bästa 10 (355 kr) · B bästa 7 (-354 kr) · grundrad A 10/13
omgång 2535 2025-12-28 (PL 2): facit 2X2X2XX1XX21X · A bästa 8 (-355 kr) · B bästa 10 (-318 kr) · grundrad A 11/13
omgång 2534 (2025-12-26): PL 1, topp 4 1 – hoppar över
omgång 2533 2025-12-21 (PL 1): facit 1212211XX1111 · A bästa 9 (-391 kr) · B bästa 12 (1638 kr) · grundrad A 12/13
omgång 2532 (2025-12-18): PL 0, topp 4 0 – hoppar över
omgång 2531 2025-12-14 (PL 5): facit X211222121X21 · A bästa 9 (-370 kr) · B bästa 9 (-361 kr) · grundrad A 11/13
omgång 2530 (2025-12-10): PL 0, topp 4 0 – hoppar över
omgång 2529 2025-12-07 (PL 2): facit 2X1X1X1111122 · A bästa 6 (-395 kr) · B bästa 7 (-392 kr) · grundrad A 8/13
omgång 2528 2025-12-03 (PL 6): facit 1X1222X21XXXX · A bästa 10 (-231 kr) · B bästa 9 (-350 kr) · grundrad A 11/13
omgång 2527 2025-11-30 (PL 4): facit X2121222X1111 · A bästa 9 (-350 kr) · B bästa 9 (-389 kr) · grundrad A 11/13
omgång 2526 (2025-11-26): PL 0, topp 4 0 – hoppar över
omgång 2525 2025-11-23 (PL 2): facit 12212X2X12X11 · A bästa 7 (-388 kr) · B bästa 9 (-395 kr) · grundrad A 9/13
omgång 2524 (2025-11-18): PL 0, topp 4 0 – hoppar över
omgång 2523 (2025-11-16): PL 0, topp 4 0 – hoppar över
omgång 2522 (2025-11-13): PL 0, topp 4 0 – hoppar över
omgång 2521 2025-11-09 (PL 5): facit 1111X112X2212 · A bästa 10 (-378 kr) · B bästa 9 (-391 kr) · grundrad A 13/13
omgång 2520 (2025-11-05): PL 0, topp 4 0 – hoppar över
omgång 2519 2025-11-02 (PL 2): facit 11122X11122XX · A bästa 8 (-393 kr) · B bästa 10 (-307 kr) · grundrad A 10/13
omgång 2518 2025-10-29 (PL 0): facit 1212X122X1X12 · A bästa 9 (-351 kr) · B bästa 10 (-363 kr) · grundrad A 11/13
omgång 2517 2025-10-26 (PL 5): facit 21112121X21X2 · A bästa 11 (74 kr) · B bästa 9 (-394 kr) · grundrad A 11/13
omgång 2516 (2025-10-22): PL 0, topp 4 0 – hoppar över
omgång 2515 2025-10-19 (PL 2): facit 22X12X22XX1X1 · A bästa 10 (-98 kr) · B bästa 9 (-360 kr) · grundrad A 11/13
omgång 2514 (2025-10-14): PL 0, topp 4 0 – hoppar över
omgång 2513 (2025-10-12): PL 0, topp 4 0 – hoppar över
omgång 2512 (2025-10-09): PL 0, topp 4 0 – hoppar över
omgång 2511 2025-10-05 (PL 5): facit 2111XX2X22XX1 · A bästa 11 (2089 kr) · B bästa 7 (-392 kr) · grundrad A 12/13
omgång 2510 (2025-10-01): PL 0, topp 4 0 – hoppar över
omgång 2509 2025-09-28 (PL 2): facit 2111XX111X22X · A bästa 10 (-393 kr) · B bästa 9 (-375 kr) · grundrad A 12/13
omgång 2508 2025-09-24 (PL 0): facit 22X1X111X1XXX · A bästa 10 (-319 kr) · B bästa 9 (-363 kr) · grundrad A 10/13
omgång 2507 2025-09-21 (PL 3): facit XXX2X2X111XX2 · A bästa 8 (-388 kr) · B bästa 7 (-372 kr) · grundrad A 8/13
omgång 2506 (2025-09-17): PL 0, topp 4 0 – hoppar över
omgång 2505 2025-09-14 (PL 2): facit 121121X1211X1 · A bästa 10 (-242 kr) · B bästa 7 (-361 kr) · grundrad A 12/13
omgång 2504 (2025-09-09): PL 0, topp 4 0 – hoppar över
omgång 2503 (2025-09-07): PL 0, topp 4 0 – hoppar över
omgång 2502 (2025-09-04): PL 0, topp 4 0 – hoppar över
omgång 2501 2025-08-31 (PL 4): facit 112221XX12111 · A bästa 10 (-355 kr) · B bästa 7 (-372 kr) · grundrad A 11/13
omgång 2500 (2025-08-28): PL 0, topp 4 0 – hoppar över
omgång 2499 2025-08-24 (PL 3): facit XX111X1XX12X2 · A bästa 8 (-386 kr) · B bästa 9 (-385 kr) · grundrad A 10/13
omgång 2498 (2025-08-21): PL 0, topp 4 0 – hoppar över
omgång 2497 2025-08-17 (PL 3): facit 2X111212X22XX · A bästa 8 (-391 kr) · B bästa 8 (-369 kr) · grundrad A 9/13
omgång 2496 (2025-08-14): PL 0, topp 4 0 – hoppar över
omgång 2495 (2025-08-10): PL 0, topp 4 0 – hoppar över
omgång 2494 (2025-08-07): PL 0, topp 4 0 – hoppar över
omgång 2493 (2025-08-03): PL 0, topp 4 0 – hoppar över

Klart: 55 omgångar -> dataeuropatips-backtest-2526.json
{
 "product": "europatipset",
 "from": "2025-08-17",
 "to": "2026-09-20",
 "draws": 55,
 "matches": 715,
 "modelWeight": 0.1,
 "seasons": "2627,2526,2425",
 "A": {
  "cost": 20935,
  "winnings": 6801,
  "best": [
   11,
   9,
   7,
   8,
   10,
   9,
   6,
   10,
   10,
   9,
   8,
   10,
   8,
   8,
   11,
   8,
   6,
   8,
   7,
   9,
   10,
   9,
   8,
   9,
   8,
   9,
   7,
   11,
   9,
   8,
   10,
   8,
   11,
   8,
   10,
   8,
   9,
   9,
   6,
   10,
   9,
   7,
   10,
   8,
   9,
   11,
   10,
   11,
   10,
   10,
   8,
   10,
   10,
   8,
   8
  ],
  "spik": {
   "n": 254,
   "lost": 92
  },
  "net": -14134,
  "quality": {
   "rows": 20935,
   "ge9": 773,
   "ge10": 156,
   "ge11": 20,
   "meanCorrect": 5.573,
   "xCovered": 128,
   "xTotal": 189
  }
 },
 "B": {
  "cost": 20681,
  "winnings": 9440,
  "best": [
   8,
   9,
   11,
   11,
   8,
   7,
   8,
   9,
   10,
   10,
   9,
   8,
   8,
   9,
   7,
   8,
   9,
   10,
   9,
   8,
   9,
   8,
   9,
   8,
   10,
   6,
   10,
   10,
   9,
   10,
   8,
   12,
   7,
   10,
   7,
   10,
   12,
   9,
   7,
   9,
   9,
   9,
   9,
   10,
   10,
   9,
   9,
   7,
   9,
   9,
   7,
   7,
   7,
   9,
   8
  ],
  "spik": {
   "n": 226,
   "lost": 99
  },
  "net": -11241,
  "quality": {
   "rows": 20681,
   "ge9": 607,
   "ge10": 141,
   "ge11": 22,
   "meanCorrect": 5.403,
   "xCovered": 111,
   "xTotal": 189
  }
 },
 "drawRate": {
  "actual": 0.264,
  "predicted": 0.259,
  "folk": 0.24
 },
 "favouriteWinRate": 0.513,
 "logLoss": {
  "final": 0.995,
  "market": 0.994,
  "model": 1.018,
  "folk": 0.99
 }
}. Varianter styrs med  och .

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
| Nuvarande (oms 10 milj, utd ≥ 30 000) | −14 134 | 156 / 20 / 0 | 1/471 | −11 241 |
| Verklig omsättning 6,8 milj | −14 155 | 156 / 20 / 0 | 1/471 | −11 235 |
| Utd ≥ 15 000 | −18 058 | 162 / 16 / 0 | 1/326 | −20 034 |
| Utd ≥ 20 000 | +17 677 | 192 / 34 / 5 | 1/376 | −18 629 |
| Utd ≥ 50 000 | −15 579 | 137 / 19 / 0 | 1/619 | −12 528 |

Slutsatser:
1. **Lägre omsättning spelar ingen roll för gränsen.** För de rader vi spelar är beräknad utdelning ≈ 26 % / radens streckprodukt, alltså oberoende av omsättningen. 6,8 eller 10 milj ger samma system. Den fasta 10 milj behålls så att radantalet stämmer med Gambling Cabin.
2. **Sänk inte utdelningsgränsen.** Plusset för 20 000 kr kommer från en enda 13-rätt (omg 2545, som gav 32 668 kr, alltså över 30 000 i verkligheten). 15 000 kr är sämre än 30 000 och B blir sämre av alla sänkningar. Det är brus, inte en regel.
3. **Det som skiljer är folket, inte utdelningen.** Europatipset är mest topp 5-ligor, och där är folkets streck nästan lika bra som oddsen: logloss folk 0,990 mot odds 0,994 och vår slutprocent 0,995. På Stryktipset kommer streckvärdet främst från Championship och League One (folk 1,12–1,13 mot odds 1,07–1,09). I PL ligger folket ungefär lika nära oddsen på båda spelen (+0,015). Det finns alltså mindre felstreckning att utnyttja på Europatipset. Det syns i nettot (A −14 000 på 55 omgångar mot +3 000 på 33 för Stryktipset), men båda styrs av enstaka 12–13-rätt.
4. Kryss: 26,4 % utfall mot 25,9 % väntat och 24,0 % hos folket. Folket underspelar X även här, alltså samma X-logik.
5. **Följ upp:** formeln antar att 26 % av omsättningen går till 13 rätt, men i verkligheten går median 32 % (Europatipset) och 39 % (Stryktipset), eftersom pengar från 10 rätt flyttas upp. Utdelningen underskattas alltså för båda spelen. Det kan vara värt en gemensam justering, men testa det på båda produkterna.

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
- **Jackpot:** potten för 13 rätt var större än 26 % av omsättningen i ungefär hälften av omgångarna (median 39 %, upp till 68 %) på grund av jackpottar och överförda pengar. Formeln för vinnare stämmer bra (faktiska mot förväntade vinnare: median 1,06). Nu räknas jackpotten in, live från `/draw/1/jackpots` och i backtest som överskottet i potten. Det ger fler rader över 30 000 kr i jackpotveckor och bättre chans till 13 rätt (A 1/522 → 1/447). Gränsen översätts till Gambling Cabins formel, så att länken ger samma rader. Antagandet att GC räknar in jackpotten ska verifieras första gången en öppen omgång har jackpot.
- **Sparade system innehåller nu odds (Svenska Spels och skarpa), streck och sannolikheter per match** vid sparandet, för rättvisa framtida backtest.

### Viktig upptäckt: teckenreglerna stänger ute 13 rätt de flesta veckor

Facit i 38 omgångar (2025/26 + hösten 2026) hade i snitt 5,4 ettor, 3,4 kryss och 4,1 tvåor. Andel omgångar där rätt rad klarar teckenregeln, alltså där systemet alls *kan* ta 13 rätt:

| Regel | 5-3-2 (A) | 4-3-3 (B) | 4-3-2 | 3-3-3 | 3-3-2 | 4-2-2 | 3-2-2 |
|---|---|---|---|---|---|---|---|
| Rätt rad släpps igenom | **34 %** | **61 %** | 63 % | 68 % | 71 % | 82 % | 89 % |

Exempel: i 4949 och 4929 hade grundraden alla 13 rätt, men raden stoppades (4949 hade 2 ettor, 4929 hade 2 kryss). Dessutom gav 13 rätt under 30 000 kr i 6 av 36 omgångar, så utdelningsregeln stänger också ute dem. Lösare regler ger fler rader och därmed mindre täckning inom budgeten, så en ändring måste backtestas. Reglerna är användarens och ändras inte utan klartecken.

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

- **2026-09-28 (natt):** Europatipset backtestat (55 omgångar med minst 3 topp 4-matcher). Ingen egen logik behövs: omsättningen påverkar inte utdelningsgränsen, och att sänka gränsen var brus. Backtestet har nu produktberoende urval, ,  och .

- **2026-09-28 (sent):** Startelvor/frånvaro läses från Oddset-tipsen (data/tips-latest.json: ESPN-elva för PL/Championship, annars FPL-skador) och visas per match. Samma anfallsfaktor och vikt (alpha) som Oddset. Oddsets backtest (2000 matcher) valde alpha 0, så elvorna flyttar inte procenten direkt. Effekten kommer via oddsen när man kör sent. Nytt arbetsflöde: "Stryktipset – sen körning (startelvor)". Öppen fråga: backtesta elva-effekten på Stryktipset när vi har sparade slutodds.

- **2026-09-28 (kväll):** Backtest av hela säsongen 2025/26 (33 omgångar) med båda modellvikterna, vilket bekräftar 10 %. Skripten har nu `STRYK_SEASONS` och `STRYK_MODEL_W` för backtest. Backtest-vy på webben. Europatipset använder samma regler (bekräftat av användaren).

- **2026-09-28:** Första backtestet (17 omgångar). Modellvikten sänktes från 35 % till 10 % (`MODEL_W`, `MODEL_W_THIN` i `scripts/fetch-stryktipset.mjs`). Agentens spikregler och B-regler testades och förkastades (se ovan).
