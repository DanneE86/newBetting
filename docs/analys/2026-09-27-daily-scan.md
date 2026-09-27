# Daily Scanner — 2026-09-27

Körd 2026-09-27T18:03:43.053Z · data från 2026-09-27T20:03:13.0767559+02:00 · 624 matcher inom 7 dagar

## Kandidater (rankade)

| # | Match | Liga | Varför kandidat | Pipeline |
|---|---|---|---|---|
| 1 | Las Palmas vs Valladolid | LL2 | värde EV 11 %, Elo-diff 198, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 2 | Londrina vs Criciúma | BR2 | värde EV 9 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 3 | Avaí vs Ceará | BR2 | värde EV 4 %, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 4 | Burgos vs Eldense | LL2 | Elo-diff 208, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 5 | Oviedo vs Sp Gijon | LL2 | skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 6 | UNAM Pumas vs Atl. San Luis | MX | Elo-diff 183, skarpt facit | 1+4 → 2 → 3 → 5 → 6 |
| 7 | Fortaleza vs Athletic | BR2 | skarpt facit | 1+4 → 2 → 3 → 5 → 6 |

## Sammanfattning Head Agent

| Match | Dom | Bästa marknad | Edge | Confidence |
|---|---|---|---|---|
| Las Palmas vs Valladolid | WAIT | 2 @ 3.85 | 11 % | LOW |
| Londrina vs Criciúma | WAIT | 1 @ 3.2 | 9 % | LOW |
| Avaí vs Ceará | WAIT | 2 @ 2.95 | 4 % | LOW |
| Burgos vs Eldense | NO BET | — | — | HIGH |
| Oviedo vs Sp Gijon | NO BET | — | — | HIGH |
| UNAM Pumas vs Atl. San Luis | NO BET | — | — | MEDIUM |
| Fortaleza vs Athletic | NO BET | — | — | HIGH |

---

# Analys: Las Palmas vs Valladolid (LL2, 2026-10-04)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.59 – A 0.81 (tot 2.4)
- 1X2: 54 % / 25 % / 21 % (fair 1.85 / 4.03 / 4.75)
- Ö2.5 41 % (fair 2.44) · BTTS 44 % (fair 2.29)

## Marknad (Agent 3)
Facit: pinnacle · 14 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 54 % | 41 % | 2.15 (Betsson) | -11 % | Ej värde |
| X | 25 % | 30 % | 3.5 (Unibet (SE)) | 5 % | Värde |
| 2 | 21 % | 29 % | 3.85 (Unibet (SE)) | 11 % | Värde |
| Över 2.5 | 41 % | 47 % | 2.05 (Betsson) | -4 % | Ej värde |
| Under 2.5 | 59 % | 53 % | 1.79 (Unibet (SE)) | -5 % | Ej värde |

## Devil's Advocate (Agent 5)
- Matchen är 7 dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.
- (skört) Egna modellen (25 %) är lägre än marknaden (30 %) på X
- (skört) X @ 3.5: hög varians, långt oddsintervall
- (skört) Egna modellen (21 %) är lägre än marknaden (29 %) på 2
- (skört) 2 @ 3.85: hög varians, långt oddsintervall
- (skört) Modell 54 % vs marknad 41 % på home – när de är oense brukar marknaden ha rätt
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- 2 @ 3.85 (Unibet (SE)) har EV 11 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- X: oddset faller under 3.43
- 2: oddset faller under 3.58
- värdet är borta när du scannar igen 1–2 dagar före
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Londrina vs Criciúma (BR2, 2026-10-02)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.21 – A 1.16 (tot 2.37)
- 1X2: 34 % / 29 % / 37 % (fair 2.94 / 3.41 / 2.73)
- Ö2.5 44 % (fair 2.27) · BTTS 48 % (fair 2.08)

## Marknad (Agent 3)
Facit: pinnacle · 12 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 34 % | 34 % | 3.2 (Unibet (SE)) | 9 % | Värde |
| X | 29 % | 29 % | 3.15 (Coolbet) | -8 % | Ej värde |
| 2 | 37 % | 37 % | 2.55 (Coolbet) | -6 % | Ej värde |
| Över 2.5 | 44 % | 42 % | 2.22 (Nordic Bet) | -7 % | Ej värde |
| Under 2.5 | 56 % | 58 % | 1.61 (Unibet (SE)) | -6 % | Ej värde |

## Devil's Advocate (Agent 5)
- Matchen är 5 dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.
- (skört) Egna modellen (34 %) är lägre än marknaden (34 %) på 1
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- 1 @ 3.2 (Unibet (SE)) har EV 9 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- 1: oddset faller under 3.01
- värdet är borta när du scannar igen 1–2 dagar före
- bekräftad elva utan nyckelspelare

## Datakvalitet (Agent 1)
- ClubElo saknas (intern Elo)

---

# Analys: Avaí vs Ceará (BR2, 2026-10-03)

## Dom
- Rekommendation: **WAIT**
- Confidence: LOW

## Modell (Agent 2)
- Proj. mål: H 1.51 – A 1.01 (tot 2.52)
- 1X2: 44 % / 28 % / 28 % (fair 2.26 / 3.53 / 3.64)
- Ö2.5 42 % (fair 2.4) · BTTS 47 % (fair 2.11)

## Marknad (Agent 3)
Facit: pinnacle · 12 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 44 % | 35 % | 2.62 (Nordic Bet) | -9 % | Ej värde |
| X | 28 % | 30 % | 3.15 (Unibet (SE)) | -6 % | Ej värde |
| 2 | 28 % | 35 % | 2.95 (Unibet (SE)) | 4 % | Värde |
| Över 2.5 | 42 % | 43 % | 2.22 (Nordic Bet) | -5 % | Ej värde |
| Under 2.5 | 58 % | 57 % | 1.66 (Unibet (SE)) | -5 % | Ej värde |

## Devil's Advocate (Agent 5)
- Matchen är 6 dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.
- (skört) Egna modellen (28 %) är lägre än marknaden (35 %) på 2
- (skört) Elvor inte släppta – rotation/skador kan ändra caset
- Residual: **Weakened**

## Varför
- 2 @ 2.95 (Unibet (SE)) har EV 4 % mot pinnacle.
- Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).

## Vad som skulle ändra beslutet
- 2: oddset faller under 2.91
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
- 1X2: 53 % / 26 % / 21 % (fair 1.88 / 3.9 / 4.76)
- Ö2.5 44 % (fair 2.3) · BTTS 43 % (fair 2.35)

## Marknad (Agent 3)
Facit: pinnacle · 14 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 53 % | 67 % | 1.33 (Coolbet) | -11 % | Ej värde |
| X | 26 % | 25 % | 4 (Coolbet) | -1 % | Ej värde |
| 2 | 21 % | 8 % | 14 (LeoVegas (SE)) | 14 % | Ej värde |

## Devil's Advocate (Agent 5)
- Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.
- (skört) Modell 53 % vs marknad 67 % på home – när de är oense brukar marknaden ha rätt
- (skört) Modell 21 % vs marknad 8 % på away – när de är oense brukar marknaden ha rätt
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
- 1X2: 42 % / 26 % / 32 % (fair 2.37 / 3.83 / 3.16)
- Ö2.5 40 % (fair 2.51) · BTTS 44 % (fair 2.29)

## Marknad (Agent 3)
Facit: pinnacle · 21 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 42 % | 46 % | 2.08 (Unibet (SE)) | -4 % | Ej värde |
| X | 26 % | 31 % | 3.25 (Coolbet) | -1 % | Ej värde |
| 2 | 32 % | 23 % | 3.85 (Coolbet) | -10 % | Ej värde |
| Över 2.5 | 40 % | 39 % | 2.35 (Unibet (SE)) | -8 % | Ej värde |
| Under 2.5 | 60 % | 61 % | 1.52 (Betsson) | -8 % | Ej värde |

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
- 1X2: 52 % / 25 % / 23 % (fair 1.94 / 3.99 / 4.29)
- Ö2.5 56 % (fair 1.77) · BTTS 55 % (fair 1.81)

## Marknad (Agent 3)
Facit: pinnacle · 18 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 52 % | 47 % | 2.02 (Nordic Bet) | -6 % | Ej värde |
| X | 25 % | 26 % | 3.55 (Unibet (SE)) | -6 % | Ej värde |
| 2 | 23 % | 27 % | 3.8 (Coolbet) | 2 % | Ej värde |
| Över 2.5 | 56 % | 55 % | 1.73 (Coolbet) | -5 % | Ej värde |
| Under 2.5 | 44 % | 45 % | 2.12 (Coolbet) | -4 % | Ej värde |

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
- 1X2: 48 % / 29 % / 23 % (fair 2.07 / 3.42 / 4.44)
- Ö2.5 40 % (fair 2.49) · BTTS 45 % (fair 2.23)

## Marknad (Agent 3)
Facit: pinnacle · 15 bolag

| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |
|---|---|---|---|---|---|
| 1 | 48 % | 60 % | 1.66 (Unibet (SE)) | -1 % | Ej värde |
| X | 29 % | 25 % | 3.85 (Coolbet) | -5 % | Ej värde |
| 2 | 23 % | 15 % | 5.75 (Coolbet) | -11 % | Ej värde |
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