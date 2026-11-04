# Slå bolagen: slutprov

Genererad av scripts/slabolagen/slutprov.mjs --slutprov, 2026-11-01. Modellerna låstes på data t.o.m. 2024-10-31. Prov 2024-11-01 till 2026-10-31. Del 1 = t.o.m. 2025-10-31.

Regel: hela 95 %-intervallet över noll på svenskt pris (minst 100 spel) och plus i båda delarna.

| Modell | Pris | Spel | Träff | Snittodds | ROI | 95 %-intervall | CLV | Del 1 | Del 2 |
|---|---|---:|---:|---:|---:|---|---:|---:|---:|
| J1 Stängningsjägaren 1X2 | Högsta pris | 62 | 38,7 % | 3,53 | **+23,1 %** | -17 % till +67 % | +9,6 % | 27: +28,5 % | 35: +19,0 % |
| J1 Stängningsjägaren 1X2 | Svenskt (−3 %) | 24 | 41,7 % | 3,27 | **+34,9 %** | -33 % till +103 % | +12,8 % | 7: +108,8 % | 17: +4,4 % |
| J1 Stängningsjägaren 1X2 | Bet365 | 40 | 27,5 % | 4,23 | **+16,7 %** | -39 % till +77 % | +3,1 % | 29: +20,6 % | 11: +6,4 % |
| J2 Stängningsjägaren mål | Högsta pris | 91 | 52,7 % | 2,32 | **+16,6 %** | -7 % till +42 % | +4,8 % | 68: +31,1 % | 23: -26,0 % |
| J2 Stängningsjägaren mål | Svenskt (−3 %) | 36 | 41,7 % | 2,19 | **-18,2 %** | -51 % till +15 % | +10,7 % | 18: -7,3 % | 18: -29,1 % |
| J2 Stängningsjägaren mål | Bet365 | 1 | 100,0 % | 1,53 | **+53,0 %** | +53 % till +53 % | +9,6 % | 1: +53,0 % | 0: – |
| J3 Pinnacle-jägaren 1X2 | Högsta pris | 49 | 34,7 % | 3,71 | **+25,6 %** | -24 % till +79 % | +5,5 % | 46: +26,9 % | 3: +5,0 % |
| J3 Pinnacle-jägaren 1X2 | Svenskt (−3 %) | 15 | 66,7 % | 3,34 | **+136,6 %** | +43 % till +233 % | +6,8 % | 14: +131,6 % | 1: +205,5 % |
| J3 Pinnacle-jägaren 1X2 | Bet365 | 45 | 24,4 % | 3,71 | **-5,3 %** | -55 % till +43 % | +4,0 % | 43: -7,5 % | 2: +42,5 % |
| J4 Pinnacle-pilen mål | Högsta pris | 50 | 46,0 % | 2,97 | **+20,4 %** | -19 % till +62 % | +6,2 % | 46: +13,8 % | 4: +96,2 % |
| J4 Pinnacle-pilen mål | Svenskt (−3 %) | 20 | 45,0 % | 2,91 | **+19,4 %** | -41 % till +88 % | +7,2 % | 18: -9,7 % | 2: +280,7 % |
| J4 Pinnacle-pilen mål | Bet365 | 22 | 36,4 % | 3,00 | **-3,5 %** | -58 % till +59 % | +6,7 % | 18: -25,1 % | 4: +93,8 % |
| J5 Portföljen | Högsta pris | 208 | 41,8 % | 3,02 | **+13,1 %** | -7 % till +33 % | +6,6 % | 143: +15,8 % | 65: +7,2 % |
| J5 Portföljen | Svenskt (−3 %) | 80 | 43,8 % | 2,84 | **+20,8 %** | -12 % till +55 % | +10,4 % | 42: +32,1 % | 38: +8,4 % |
| J5 Portföljen | Bet365 | 90 | 26,7 % | 3,69 | **-5,8 %** | -37 % till +29 % | +4,0 % | 73: -14,4 % | 17: +31,2 % |

Klarar regeln: **ingen**.

## Jakten: hemmaregeln

Sökning på utvecklingsdata (t.o.m. 2024-10-31, scripts/slabolagen/jakt.mjs): 476 prov med minst 150 spel, krav z >= 3,3 efter korrigering. Bara ett klarade det: **hemmaregeln**. Maskininlärning (boost.mjs) gav inget bestående.

Regel: vid stängning i AR, AS, BR, DK, EK, JP1, MLS, MX, NO. Tecknet med störst fördel mot Pinnacle utan marginal ska vara hemma, med fördel minst 2 %, odds högst 5.

| Period | Pris | Spel | ROI | z |
|---|---|---:|---:|---:|
| Utveckling 2012 – okt 2024 | Högsta pris −3 % | 2 468 | +9,3 % | 3,53 |
| Slutprov nov 2024 – 2025 | Högsta pris −3 % | 150 | +14,9 % | 1,27 |
| Slutprov 2025 | Bet365 vid stängning | 74 | +12,6 % | 0,73 |

Samma regel på andra tecken i slutprovet: kryss −6,4 %, borta −6,0 %. Slutprovet är inte säkert i sig. Priset som krävs ligger i snitt 11–13 % över Pinnacle, så det finns ofta inte hos svenska bolag. Pinnacles stängning saknas i datan från slutet av 2025. Regeln är inte inkopplad i tipsen.

## Runda 3: oberoende prov och nya idéer

Samma regel i toppligorna, där den inte hittades (högsta pris −3 %, Pinnacle-stängning):

| Tecken | Utveckling: spel, ROI | Nya matcher: spel, ROI |
|---|---:|---:|
| Hemma | 1 566, +4,9 % | 189, +9,9 % |
| Kryss | 1 116, +1,6 % | 100, −1,5 % |
| Borta | 1 307, −2,8 % | 226, −16,5 % |

Bet365 vid stängning i toppligorna: hemma +2,8 % (140 spel) och +6,3 % (98 spel), kryss +4,0 % (763 spel) och +22,9 % (112 spel), borta −12,5 % (218 spel) och −23,7 % (95 spel). Kryss på Bet365 upptäcktes i de nya matcherna och är därför bara en hypotes.

Betfair-börsen som facit från nov 2024, högsta pris −3 %: hemma +7,5 % (113 spel, nio ligor) och +8,8 % (156 spel, toppligor), men borta är också plus (+12,9 %, +12,2 %). Hemmaskillnaden bekräftas alltså inte där. Hemma 2026: +9,5 % (22 spel) och −19,3 % (31 spel).

Två nya kandidater klarade eller låg nära kravet på utvecklingsdata (517 prov, z ≥ 3,5) men föll på nya matcher: hemmaregeln när hemma är favorit (+11,3 % till +2,5 %, 97 spel) och handikapp hemma vid stängning (+9,2 % till −1,7 %, 154 spel).

Riktiga svenska priser, alla ligor: 16 spel +1,2 % (första avläsningen), 19 spel −19,8 % (sista). För få för slutsats. Skarp logg: npm run hemmaregeln, data/hemmaregeln/logg.json.
