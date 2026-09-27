# Daily Scanner — 2026-09-27

Körd 2026-09-27T17:40:25.241Z · data från 2026-09-27T19:39:47.5148228+02:00 · 624 matcher inom 7 dagar

## Kandidater (rankade)

| # | Match | Liga | Varför kandidat | Pipeline |
|---|---|---|---|---|
| 1 | Necaxa vs Club America | MX | värde EV 6 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 2 | Burton vs Huddersfield | EL1 | värde EV 4 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 3 | Burgos vs Eldense | LL2 | Elo-diff 208, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 4 | Oviedo vs Sp Gijon | LL2 | skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 5 | UNAM Pumas vs Atl. San Luis | MX | Elo-diff 183, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 6 | Fortaleza vs Athletic | BR2 | skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 7 | Columbus Crew vs Inter Miami | MLS | skarpt facit | 1+4 → 2 → 3 → 5 → 6 |

## Sammanfattning Head Agent

| Match | Dom | Bästa marknad | Edge | Confidence |
|---|---|---|---|---|
| Necaxa vs Club America | BET | 1 @ 4.33 | 6 % | MEDIUM |
| Burton vs Huddersfield | WAIT | 1 @ 4.25 | 4 % | LOW |
| Burgos vs Eldense | NO BET | — | — | HIGH |
| Oviedo vs Sp Gijon | NO BET | — | — | HIGH |
| UNAM Pumas vs Atl. San Luis | NO BET | — | — | MEDIUM |
| Fortaleza vs Athletic | NO BET | — | — | HIGH |
| Columbus Crew vs Inter Miami | NO BET | — | — | MEDIUM |

---

# Analys: Necaxa vs Club America (MX, 2026-09-28)

## Dom
- Rekommendation: **BET**
- Confidence: MEDIUM

## Modell (Agent 2)
- Proj. mål: H 1.18 – A 1.7 (tot 2.88)
- 1X2: 29 % / 26 % / 45 % (fair 3.47 / 3.84 / 2.21)
- Ö2.5 55 % (fair 1.82) · BTTS 59 % (fair 1.69)

## Marknad (Agent 3)
Facit: betfair-exchange · 3 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 29 % | 25 % | 4.33 (Marknadens basta (football-data)) | 6 % | Värde |
| X | 26 % | 25 % | 3.75 (Marknadens basta (football-data)) | -7 % | Ej värde |
| 2 | 45 % | 51 % | 1.9 (Marknadens basta (football-data)) | -4 % | Ej värde |

## Devil's Advocate (Agent 5)
- (skört) 1 @ 4.33: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Still plausible**

## Varför
- 1 @ 4.33 (Marknadens basta (football-data)) har EV 6 % mot betfair-exchange.

## Vad som skulle ändra beslutet
- 1: oddset faller under 4.2
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- xG saknas Necaxa
- xG saknas Club America
- ClubElo saknas (intern Elo)

---

# Analys: Burton vs Huddersfield (EL1, 2026-10-03)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.32 – A 1.44 (tot 2.76)
- 1X2: 25 % / 24 % / 51 % (fair 4.07 / 4.11 / 1.96)
- Ö2.5 52 % (fair 1.94) · BTTS 58 % (fair 1.73)

## Marknad (Agent 3)
Facit: pinnacle · 13 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 25 % | 25 % | 4.25 (Nordic Bet) | 4 % | Värde |
| X | 24 % | 24 % | 3.75 (Coolbet) | -9 % | Ej värde |
| 2 | 51 % | 51 % | 1.82 (Unibet (SE)) | -7 % | Ej värde |
| Över 2.5 | 52 % | 52 % | 1.78 (Coolbet) | -8 % | Ej värde |
| Under 2.5 | 48 % | 48 % | 2.02 (Unibet (SE)) | -2 % | Ej värde |

## Devil's Advocate (Agent 5)
- Matchen är 6 dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.
- (skört) 1 @ 4.25: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- 1 @ 4.25 (Nordic Bet) har EV 4 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- 1: oddset faller under 4.19
- värdet är borta när du scannar igen 1–2 dagar före
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Burgos vs Eldense (LL2, 2026-09-27)

## Dom
- Rekommendation: **NO BET**
- Confidence: HIGH

## Modell (Agent 2)
- Proj. mål: H 1.45 – A 0.72 (tot 2.17)
- 1X2: 54 % / 26 % / 21 % (fair 1.87 / 3.93 / 4.74)
- Ö2.5 44 % (fair 2.3) · BTTS 43 % (fair 2.35)

## Marknad (Agent 3)
Facit: betfair-exchange · 3 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 54 % | 49 % | 1.95 (Marknadens basta (football-data)) | -5 % | Ej värde |
| X | 26 % | 28 % | 3.35 (Marknadens basta (football-data)) | -4 % | Ej värde |
| 2 | 21 % | 23 % | 4.1 (Marknadens basta (football-data)) | -8 % | Ej värde |
| Över 2.5 | 44 % | 43 % | 2.15 (Marknadens basta (football-data)) | -7 % | Ej värde |
| Under 2.5 | 56 % | 57 % | 1.73 (Marknadens basta (football-data)) | -2 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Dead**

## Varför
- Ingen marknad med värde vid dagens odds.

## Vad som skulle ändra beslutet
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Oviedo vs Sp Gijon (LL2, 2026-09-27)

## Dom
- Rekommendation: **NO BET**
- Confidence: HIGH

## Modell (Agent 2)
- Proj. mål: H 1.31 – A 1.05 (tot 2.36)
- 1X2: 42 % / 26 % / 32 % (fair 2.36 / 3.86 / 3.15)
- Ö2.5 40 % (fair 2.51) · BTTS 44 % (fair 2.29)

## Marknad (Agent 3)
Facit: betfair-exchange · 3 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 42 % | 47 % | 2.05 (Marknadens basta (football-data)) | -4 % | Ej värde |
| X | 26 % | 30 % | 3.2 (Marknadens basta (football-data)) | -3 % | Ej värde |
| 2 | 32 % | 23 % | 4.1 (Marknadens basta (football-data)) | -5 % | Ej värde |
| Över 2.5 | 40 % | 40 % | 2.38 (Marknadens basta (football-data)) | -6 % | Ej värde |
| Under 2.5 | 60 % | 60 % | 1.6 (Marknadens basta (football-data)) | -3 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Dead**

## Varför
- Ingen marknad med värde vid dagens odds.

## Vad som skulle ändra beslutet
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: UNAM Pumas vs Atl. San Luis (MX, 2026-09-27)

## Dom
- Rekommendation: **NO BET**
- Confidence: MEDIUM

## Modell (Agent 2)
- Proj. mål: H 1.95 – A 1.14 (tot 3.09)
- 1X2: 52 % / 25 % / 23 % (fair 1.94 / 4 / 4.28)
- Ö2.5 56 % (fair 1.77) · BTTS 55 % (fair 1.81)

## Marknad (Agent 3)
Facit: betfair-exchange · 3 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 52 % | 49 % | 2 (Marknadens basta (football-data)) | -3 % | Ej värde |
| X | 25 % | 25 % | 3.65 (Marknadens basta (football-data)) | -7 % | Ej värde |
| 2 | 23 % | 26 % | 3.75 (Marknadens basta (football-data)) | -2 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Dead**

## Varför
- Ingen marknad med värde vid dagens odds.

## Vad som skulle ändra beslutet
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- xG saknas UNAM Pumas
- xG saknas Atl. San Luis
- ClubElo saknas (intern Elo)

---

# Analys: Fortaleza vs Athletic (BR2, 2026-09-27)

## Dom
- Rekommendation: **NO BET**
- Confidence: HIGH

## Modell (Agent 2)
- Proj. mål: H 1.38 – A 0.77 (tot 2.15)
- 1X2: 49 % / 29 % / 23 % (fair 2.06 / 3.47 / 4.41)
- Ö2.5 40 % (fair 2.49) · BTTS 45 % (fair 2.23)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 49 % | 60 % | 1.66 (Unibet (SE)) | -1 % | Ej värde |
| X | 29 % | 25 % | 3.85 (Coolbet) | -5 % | Ej värde |
| 2 | 23 % | 15 % | 5.75 (Coolbet) | -12 % | Ej värde |
| Över 2.5 | 40 % | 45 % | 2.14 (Unibet (SE)) | -4 % | Ej värde |
| Under 2.5 | 60 % | 55 % | 1.7 (Nordic Bet) | -7 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Dead**

## Varför
- Ingen marknad med värde vid dagens odds.

## Vad som skulle ändra beslutet
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Columbus Crew vs Inter Miami (MLS, 2026-09-27)

## Dom
- Rekommendation: **NO BET**
- Confidence: MEDIUM

## Modell (Agent 2)
- Proj. mål: H 1.82 – A 2.22 (tot 4.04)
- 1X2: 31 % / 24 % / 45 % (fair 3.23 / 4.23 / 2.2)
- Ö2.5 67 % (fair 1.49) · BTTS 67 % (fair 1.5)

## Marknad (Agent 3)
Facit: betfair-exchange · 3 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 31 % | 35 % | 2.82 (Marknadens basta (football-data)) | -2 % | Ej värde |
| X | 24 % | 23 % | 4.1 (Marknadens basta (football-data)) | -8 % | Ej värde |
| 2 | 45 % | 43 % | 2.3 (Marknadens basta (football-data)) | -1 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Dead**

## Varför
- Ingen marknad med värde vid dagens odds.

## Vad som skulle ändra beslutet
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- xG saknas Columbus Crew
- xG saknas Inter Miami
- ClubElo saknas (intern Elo)