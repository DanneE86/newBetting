# Daily Scanner — 2026-10-13

Körd 2026-10-13T19:13:43.012Z · data från 2026-10-13T06:30:34.2915088+02:00 · 809 matcher inom 7 dagar

## Kandidater (rankade)

| # | Match | Liga | Varför kandidat | Pipeline |
|---|---|---|---|---|
| 1 | Hamburg vs Stuttgart | BL | värde EV 13 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 2 | Athletic vs Londrina | BR2 | värde EV 9 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 3 | Elversberg vs Augsburg | BL | värde EV 9 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 4 | Parma vs Torino | SA | värde EV 9 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 5 | F.C. København vs Braga | ECL | värde EV 8 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 6 | Venezia vs Napoli | SA | värde EV 6 %, Elo-diff -185, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 7 | Schalke 04 vs Mainz | BL | värde EV 7 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |

## Sammanfattning Head Agent

| Match | Dom | Bästa marknad | Edge | Confidence |
|---|---|---|---|---|
| Hamburg vs Stuttgart | WAIT | X @ 4.4 | 13 % | LOW |
| Athletic vs Londrina | BET | 2 @ 3.95 | 9 % | MEDIUM |
| Elversberg vs Augsburg | WAIT | X @ 4 | 9 % | LOW |
| Parma vs Torino | WAIT | X @ 3.25 | 9 % | LOW |
| F.C. København vs Braga | NO BET | X @ 3.6 | 8 % | LOW |
| Venezia vs Napoli | WAIT | 2 @ 1.76 | 6 % | LOW |
| Schalke 04 vs Mainz | WAIT | X @ 3.8 | 7 % | LOW |

---

# Analys: Hamburg vs Stuttgart (BL, 2026-10-17)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.18 – A 2.07 (tot 3.25)
- 1X2: 23 % / 26 % / 52 % (fair 4.42 / 3.88 / 1.94)
- Ö2.5 69 % (fair 1.45) · BTTS 54 % (fair 1.87)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 23 % | 23 % | 4.2 (Unibet (SE)) | -5 % | Ej värde |
| X | 26 % | 26 % | 4.4 (Unibet (SE)) | 13 % | Värde |
| 2 | 52 % | 52 % | 1.85 (Nordic Bet) | -4 % | Ej värde |
| Över 2.5 | 69 % | 69 % | 1.38 (Betsson) | -5 % | Ej värde |
| Under 2.5 | 31 % | 31 % | 3.1 (Betsson) | -4 % | Ej värde |

## Devil's Advocate (Agent 5)
- EV 13 % är ovanligt högt för X – kan vara inaktuella odds; kontrollera hos bolaget.
- Litet urval i säsongen – rater och form är brusiga.
- (skört) odds kan ha rört sig sedan hämtningen
- (skört) X @ 4.4: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- X @ 4.4 (Unibet (SE)) har EV 13 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- X: oddset faller under 4
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)
- litet urval (< 6 matcher i säsongen)

---

# Analys: Athletic vs Londrina (BR2, 2026-10-13)

## Dom
- Rekommendation: **BET**
- Confidence: MEDIUM

## Modell (Agent 2)
- Proj. mål: H 1.69 – A 1.2 (tot 2.89)
- 1X2: 47 % / 27 % / 26 % (fair 2.13 / 3.74 / 3.8)
- Ö2.5 51 % (fair 1.95) · BTTS 54 % (fair 1.87)

## Marknad (Agent 3)
Facit: pinnacle · 12 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 47 % | 44 % | 2.2 (Coolbet) | -3 % | Ej värde |
| X | 27 % | 28 % | 3.35 (Unibet (SE)) | -5 % | Ej värde |
| 2 | 26 % | 28 % | 3.95 (Unibet (SE)) | 9 % | Värde |
| Över 2.5 | 51 % | 43 % | 2.18 (Nordic Bet) | -5 % | Ej värde |
| Under 2.5 | 49 % | 57 % | 1.68 (Unibet (SE)) | -5 % | Ej värde |

## Devil's Advocate (Agent 5)
- (skört) Egna modellen (26 %) är lägre än marknaden (28 %) på 2
- (skört) 2 @ 3.95: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Still plausible**

## Varför
- 2 @ 3.95 (Unibet (SE)) har EV 9 % mot pinnacle.

## Vad som skulle ändra beslutet
- 2: oddset faller under 3.74
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Elversberg vs Augsburg (BL, 2026-10-17)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.82 – A 1.57 (tot 3.39)
- 1X2: 37 % / 27 % / 36 % (fair 2.68 / 3.67 / 2.82)
- Ö2.5 65 % (fair 1.54) · BTTS 68 % (fair 1.47)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 37 % | 37 % | 2.45 (Nordic Bet) | -9 % | Ej värde |
| X | 27 % | 27 % | 4 (Unibet (SE)) | 9 % | Värde |
| 2 | 36 % | 36 % | 2.8 (Unibet (SE)) | -1 % | Ej värde |
| Över 2.5 | 65 % | 65 % | 1.47 (Betsson) | -5 % | Ej värde |
| Under 2.5 | 35 % | 35 % | 2.71 (Betsson) | -5 % | Ej värde |

## Devil's Advocate (Agent 5)
- Litet urval i säsongen – rater och form är brusiga.
- (skört) X @ 4: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- X @ 4 (Unibet (SE)) har EV 9 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- X: oddset faller under 3.78
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)
- litet urval (< 6 matcher i säsongen)

---

# Analys: Parma vs Torino (SA, 2026-10-19)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.07 – A 1.11 (tot 2.18)
- 1X2: 26 % / 34 % / 40 % (fair 3.79 / 2.97 / 2.51)
- Ö2.5 42 % (fair 2.41) · BTTS 45 % (fair 2.24)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 26 % | 26 % | 3.2 (Unibet (SE)) | -15 % | Ej värde |
| X | 34 % | 34 % | 3.25 (Unibet (SE)) | 9 % | Värde |
| 2 | 40 % | 40 % | 2.5 (Betsson) | 0 % | Ej värde |
| Över 2.5 | 42 % | 42 % | 2.32 (Betsson) | -4 % | Ej värde |
| Under 2.5 | 59 % | 59 % | 1.64 (LeoVegas (SE)) | -4 % | Ej värde |

## Devil's Advocate (Agent 5)
- Matchen är 6 dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.
- Litet urval i säsongen – rater och form är brusiga.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- X @ 3.25 (Unibet (SE)) har EV 9 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- X: oddset faller under 3.06
- värdet är borta när du scannar igen 1–2 dagar före
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)
- litet urval (< 6 matcher i säsongen)

---

# Analys: F.C. København vs Braga (ECL, 2026-10-15)

## Dom
- Rekommendation: **NO BET**
- Confidence: LOW

## Modell (Agent 2)
- 1X2: 39 % / 29 % / 32 % (fair 2.55 / 3.45 / 3.14)
- Ö2.5 50 % (fair 2) · BTTS — (fair undefined)

## Marknad (Agent 3)
Facit: pinnacle · 12 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 39 % | 40 % | 2.45 (Coolbet) | -2 % | Ej värde |
| X | 29 % | 30 % | 3.6 (Coolbet) | 8 % | Värde |
| 2 | 32 % | 30 % | 2.9 (Nordic Bet) | -13 % | Ej värde |
| Över 2.5 | 50 % | 50 % | 1.9 (Coolbet) | -5 % | Ej värde |
| Under 2.5 | 50 % | 50 % | 1.88 (Nordic Bet) | -6 % | Ej värde |

## Devil's Advocate (Agent 5)
- Litet urval i säsongen – rater och form är brusiga.
- Modellens underlag är tunt (LOW confidence).
- (skört) Egna modellen (29 %) är lägre än marknaden (30 %) på X
- (skört) X @ 3.6: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- X @ 3.6 har EV 8 %, men modellens underlag är för tunt (LOW).

## Vad som skulle ändra beslutet
- X: oddset faller under 3.44
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- laget saknas i store (marknadstips/cup)
- litet urval (< 6 matcher i säsongen)

---

# Analys: Venezia vs Napoli (SA, 2026-10-17)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 0.7 – A 2.03 (tot 2.73)
- 1X2: 17 % / 23 % / 60 % (fair 5.75 / 4.41 / 1.67)
- Ö2.5 56 % (fair 1.79) · BTTS 50 % (fair 2)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 17 % | 17 % | 4.7 (Betsson) | -18 % | Ej värde |
| X | 23 % | 23 % | 3.95 (Betsson) | -11 % | Ej värde |
| 2 | 60 % | 60 % | 1.76 (Unibet (SE)) | 6 % | Värde |
| Över 2.5 | 56 % | 56 % | 1.73 (Betsson) | -4 % | Ej värde |
| Under 2.5 | 44 % | 44 % | 2.13 (Betsson) | -6 % | Ej värde |

## Devil's Advocate (Agent 5)
- Litet urval i säsongen – rater och form är brusiga.
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- 2 @ 1.76 (Unibet (SE)) har EV 6 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- 2: oddset faller under 1.72
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)
- litet urval (< 6 matcher i säsongen)

---

# Analys: Schalke 04 vs Mainz (BL, 2026-10-17)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.28 – A 1.44 (tot 2.72)
- 1X2: 33 % / 28 % / 40 % (fair 3.08 / 3.57 / 2.53)
- Ö2.5 60 % (fair 1.68) · BTTS 52 % (fair 1.92)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 33 % | 33 % | 3.05 (Unibet (SE)) | -1 % | Ej värde |
| X | 28 % | 28 % | 3.8 (Unibet (SE)) | 7 % | Värde |
| 2 | 40 % | 40 % | 2.32 (Nordic Bet) | -8 % | Ej värde |
| Över 2.5 | 60 % | 60 % | 1.6 (Betsson) | -5 % | Ej värde |
| Under 2.5 | 41 % | 41 % | 2.36 (Betsson) | -4 % | Ej värde |

## Devil's Advocate (Agent 5)
- Litet urval i säsongen – rater och form är brusiga.
- (skört) X @ 3.8: hög varians, långt oddsintervall
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- X @ 3.8 (Unibet (SE)) har EV 7 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- X: oddset faller under 3.68
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)
- litet urval (< 6 matcher i säsongen)