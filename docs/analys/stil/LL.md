# Stilmatchning – La Liga (LL)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 3001 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 166 m · hemma +0,10 · kryss −2 pe · ö2,5 +0 pe | 320 m · hemma −0,02 · kryss +4 pe · ö2,5 +2 pe | 275 m · hemma +0,02 · kryss −1 pe · ö2,5 −3 pe |
| **Mellan** | 323 m · hemma +0,15 · kryss +5 pe · ö2,5 +2 pe | 494 m · hemma −0,05 · kryss +3 pe · ö2,5 −3 pe | 403 m · hemma +0,07 · kryss +1 pe · ö2,5 −1 pe |
| **Mycket boll** | 273 m · hemma −0,05 · kryss −3 pe · ö2,5 −6 pe | 401 m · hemma +0,10 · kryss −3 pe · ö2,5 +2 pe | 346 m · hemma −0,01 · kryss −3 pe · ö2,5 +0 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 242 m · hemma +0,13 · kryss +0 pe · ö2,5 −1 pe | 398 m · hemma +0,13 · kryss −2 pe · ö2,5 +0 pe | 259 m · hemma −0,04 · kryss +2 pe · ö2,5 −5 pe |
| **Balanserat** | 398 m · hemma +0,07 · kryss +3 pe · ö2,5 −4 pe | 499 m · hemma −0,01 · kryss +2 pe · ö2,5 −2 pe | 368 m · hemma −0,03 · kryss +1 pe · ö2,5 −1 pe |
| **Bollinnehav** | 257 m · hemma +0,02 · kryss −1 pe · ö2,5 −1 pe | 368 m · hemma −0,02 · kryss +0 pe · ö2,5 +5 pe | 212 m · hemma +0,05 · kryss −2 pe · ö2,5 +4 pe |

## Lag (säsong 2026/27)

### Alaves

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 42,1 %). 301 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 81 | 0,89–1,31 | −0,12 | −0,11 (−1,0) | +4 pe | −1 pe | −0,33 / +0,06  |
| Balanserat | 135 | 0,99–1,29 | +0,08 | +0,08 (+0,8) | −8 pe | +1 pe | +0,21 / −0,04  |
| Bollinnehav | 85 | 1,06–1,54 | −0,03 | −0,02 (−0,2) | +3 pe | −1 pe | −0,04 / −0,01 ✔ |
| Kortpass | 69 | 0,96–1,36 | −0,08 | −0,08 (−0,6) | +2 pe | −2 pe | −0,37 / +0,04  |
| Blandat | 135 | 1,12–1,39 | +0,15 | +0,15 (+1,5) | −3 pe | +2 pe | +0,29 / +0,03 ✔ |
| Direktspel | 97 | 0,80–1,34 | −0,15 | −0,15 (−1,3) | −2 pe | −1 pe | −0,14 / −0,17 ✔ |
| Lågpress | 77 | 1,10–1,31 | +0,15 | +0,15 (+1,1) | −5 pe | +2 pe | +0,13 / +0,17 ✔ |
| Mellanpress | 130 | 0,95–1,48 | −0,01 | −0,01 (−0,1) | −2 pe | +2 pe | −0,02 / +0,01  |
| Högpress | 94 | 0,93–1,24 | −0,12 | −0,11 (−1,0) | +2 pe | −5 pe | −0,12 / −0,11 ✔ |

- Svårast mot **Direktspel** (−0,15 p/match rel. eget snitt, z −1,3, 97 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,15 p/match rel. eget snitt, z +1,5, 135 m) – åt samma håll i båda halvorna men svagt

### Ath Bilbao

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 45,0 %). 304 matcher med stil, mot marknaden totalt −0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 87 | 1,25–0,83 | −0,05 | +0,04 (+0,3) | −0 pe | −9 pe | +0,02 / +0,06 ✔ |
| Balanserat | 126 | 1,30–1,17 | −0,07 | +0,02 (+0,2) | +4 pe | +1 pe | −0,05 / +0,09  |
| Bollinnehav | 91 | 1,12–1,19 | −0,15 | −0,06 (−0,5) | +1 pe | −10 pe | +0,13 / −0,26  |
| Kortpass | 71 | 1,20–1,28 | −0,16 | −0,07 (−0,5) | −2 pe | −0 pe | −0,07 / −0,07 ✔ |
| Blandat | 135 | 1,36–1,09 | −0,00 | +0,09 (+0,9) | −2 pe | −4 pe | +0,12 / +0,05 ✔ |
| Direktspel | 98 | 1,09–0,91 | −0,15 | −0,06 (−0,5) | +9 pe | −10 pe | −0,04 / −0,13 ✔ |
| Lågpress | 85 | 1,08–1,07 | −0,36 | −0,27 (−2,1) | +5 pe | −7 pe | −0,20 / −0,34 ✔ ⚑ |
| Mellanpress | 139 | 1,21–1,14 | −0,07 | +0,01 (+0,1) | −0 pe | −5 pe | +0,07 / −0,05  |
| Högpress | 80 | 1,44–0,97 | +0,17 | +0,26 (+2,0) | +2 pe | −2 pe | +0,26 / +0,26 ✔ ⚑ |

- Svårast mot **Lågpress** (−0,27 p/match rel. eget snitt, z −2,1, 85 m) – ⚑ håller i båda halvorna
- Bäst mot **Högpress** (+0,26 p/match rel. eget snitt, z +2,0, 80 m) – ⚑ håller i båda halvorna

### Ath Madrid

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 57,1 %). 305 matcher med stil, mot marknaden totalt +0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,74–0,80 | +0,22 | +0,12 (+0,9) | −5 pe | +2 pe | +0,24 / +0,01 ✔ |
| Balanserat | 136 | 1,70–0,91 | +0,12 | +0,03 (+0,3) | +3 pe | −0 pe | −0,14 / +0,19  |
| Bollinnehav | 89 | 1,60–1,02 | −0,05 | −0,15 (−1,1) | −8 pe | −6 pe | −0,13 / −0,16 ✔ |
| Kortpass | 70 | 1,84–1,01 | +0,11 | +0,01 (+0,1) | −6 pe | +5 pe | +0,48 / −0,15  |
| Blandat | 133 | 1,62–0,94 | +0,07 | −0,03 (−0,3) | +0 pe | −5 pe | −0,31 / +0,17  |
| Direktspel | 102 | 1,65–0,81 | +0,13 | +0,03 (+0,3) | −3 pe | −1 pe | +0,03 / +0,04 ✔ |
| Lågpress | 76 | 1,80–0,91 | +0,20 | +0,10 (+0,9) | +1 pe | −1 pe | +0,12 / +0,08 ✔ |
| Mellanpress | 138 | 1,66–0,92 | +0,06 | −0,04 (−0,4) | +2 pe | −1 pe | −0,20 / +0,17  |
| Högpress | 91 | 1,60–0,91 | +0,08 | −0,02 (−0,2) | −11 pe | −2 pe | +0,14 / −0,10  |

- Svårast mot **Bollinnehav** (−0,15 p/match rel. eget snitt, z −1,1, 89 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,12 p/match rel. eget snitt, z +0,9, 80 m) – åt samma håll i båda halvorna men svagt

### Barcelona

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Lågpress** (faktiskt bollinnehav 68,6 %). 305 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 2,10–0,72 | +0,20 | +0,11 (+1,0) | −2 pe | −8 pe | −0,27 / +0,45  |
| Balanserat | 132 | 2,25–1,03 | +0,01 | −0,09 (−0,9) | −3 pe | −1 pe | −0,14 / −0,04 ✔ |
| Bollinnehav | 77 | 2,48–1,12 | +0,10 | +0,01 (+0,1) | −7 pe | +11 pe | +0,05 / −0,04  |
| Kortpass | 65 | 2,83–1,42 | +0,05 | −0,04 (−0,3) | −6 pe | +14 pe | +0,11 / −0,10  |
| Blandat | 136 | 2,24–0,93 | +0,18 | +0,09 (+1,0) | −7 pe | +1 pe | −0,03 / +0,18  |
| Direktspel | 104 | 1,93–0,70 | +0,00 | −0,09 (−0,8) | +2 pe | −11 pe | −0,26 / +0,36  |
| Lågpress | 81 | 2,40–0,94 | +0,21 | +0,12 (+1,0) | −4 pe | +1 pe | −0,08 / +0,33  |
| Mellanpress | 138 | 2,34–1,06 | +0,02 | −0,07 (−0,7) | −7 pe | +3 pe | −0,10 / −0,03 ✔ |
| Högpress | 86 | 2,01–0,80 | +0,10 | +0,00 (+0,0) | +2 pe | −6 pe | −0,26 / +0,14  |

- Svårast mot **Balanserat** (−0,09 p/match rel. eget snitt, z −0,9, 132 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,11 p/match rel. eget snitt, z +1,0, 96 m) – inte stabilt, troligen slump

### Betis

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 54,1 %). 305 matcher med stil, mot marknaden totalt +0,13 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 97 | 1,16–1,24 | +0,03 | −0,10 (−0,8) | −0 pe | −1 pe | −0,07 / −0,12 ✔ |
| Balanserat | 130 | 1,41–1,12 | +0,32 | +0,19 (+1,8) | −0 pe | −1 pe | +0,04 / +0,37 ✔ |
| Bollinnehav | 78 | 1,53–1,58 | −0,06 | −0,19 (−1,5) | +9 pe | +1 pe | −0,16 / −0,22 ✔ |
| Kortpass | 57 | 1,53–1,35 | +0,11 | −0,02 (−0,1) | +14 pe | +4 pe | −0,02 / −0,02 ✔ |
| Blandat | 141 | 1,41–1,38 | +0,14 | +0,01 (+0,1) | +0 pe | +2 pe | −0,11 / +0,11  |
| Direktspel | 107 | 1,21–1,08 | +0,12 | −0,01 (−0,1) | −2 pe | −7 pe | +0,00 / −0,04  |
| Lågpress | 79 | 1,59–1,20 | +0,35 | +0,22 (+1,6) | −3 pe | +5 pe | +0,13 / +0,34 ✔ |
| Mellanpress | 138 | 1,27–1,37 | −0,04 | −0,16 (−1,6) | +0 pe | −3 pe | −0,17 / −0,15 ✔ |
| Högpress | 88 | 1,30–1,18 | +0,18 | +0,05 (+0,5) | +9 pe | −2 pe | +0,04 / +0,06 ✔ |

- Svårast mot **Mellanpress** (−0,16 p/match rel. eget snitt, z −1,6, 138 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,19 p/match rel. eget snitt, z +1,8, 130 m) – åt samma håll i båda halvorna men svagt

### Celta

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 52,5 %). 305 matcher med stil, mot marknaden totalt −0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 94 | 1,14–1,27 | −0,22 | −0,10 (−0,8) | +2 pe | −1 pe | +0,03 / −0,23  |
| Balanserat | 135 | 1,24–1,39 | −0,11 | +0,02 (+0,2) | +1 pe | +0 pe | −0,02 / +0,05  |
| Bollinnehav | 76 | 1,45–1,47 | −0,03 | +0,09 (+0,7) | +3 pe | +3 pe | −0,07 / +0,24  |
| Kortpass | 62 | 1,53–1,42 | −0,13 | −0,00 (−0,0) | +8 pe | +8 pe | −0,29 / +0,09  |
| Blandat | 136 | 1,23–1,42 | −0,03 | +0,09 (+0,9) | −2 pe | +1 pe | +0,14 / +0,06 ✔ |
| Direktspel | 107 | 1,14–1,28 | −0,24 | −0,12 (−1,0) | +3 pe | −4 pe | −0,07 / −0,26 ✔ |
| Lågpress | 77 | 1,29–1,30 | −0,08 | +0,04 (+0,3) | −0 pe | +1 pe | −0,10 / +0,25  |
| Mellanpress | 138 | 1,33–1,37 | +0,00 | +0,13 (+1,3) | +5 pe | −2 pe | +0,15 / +0,10 ✔ |
| Högpress | 90 | 1,13–1,43 | −0,36 | −0,23 (−2,0) | −1 pe | +4 pe | −0,31 / −0,20 ✔ ⚑ |

- Svårast mot **Högpress** (−0,23 p/match rel. eget snitt, z −2,0, 90 m) – ⚑ håller i båda halvorna
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +1,3, 138 m) – åt samma håll i båda halvorna men svagt

### Elche

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 49,8 %). 261 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,02–1,27 | −0,01 | −0,05 (−0,4) | −1 pe | −5 pe | +0,04 / −0,11  |
| Balanserat | 114 | 1,12–1,30 | +0,03 | −0,01 (−0,1) | +9 pe | −1 pe | +0,06 / −0,10  |
| Bollinnehav | 67 | 1,03–1,52 | +0,12 | +0,08 (+0,6) | −3 pe | +2 pe | +0,00 / +0,18 ✔ |
| Kortpass | 55 | 1,13–1,55 | −0,04 | −0,08 (−0,6) | −1 pe | +5 pe | −0,13 / −0,06 ✔ |
| Blandat | 126 | 1,05–1,39 | −0,01 | −0,05 (−0,5) | +6 pe | −1 pe | −0,07 / −0,03 ✔ |
| Direktspel | 80 | 1,06–1,15 | +0,17 | +0,13 (+0,9) | −0 pe | −7 pe | +0,18 / −0,03  |
| Lågpress | 74 | 1,11–1,47 | +0,01 | −0,03 (−0,2) | +9 pe | +4 pe | +0,04 / −0,10  |
| Mellanpress | 121 | 1,06–1,27 | +0,05 | +0,01 (+0,1) | −2 pe | −4 pe | −0,07 / +0,09  |
| Högpress | 66 | 1,05–1,35 | +0,05 | +0,02 (+0,1) | +3 pe | −1 pe | +0,28 / −0,18  |

- Svårast mot **Kortpass** (−0,08 p/match rel. eget snitt, z −0,6, 55 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +0,9, 80 m) – inte stabilt, troligen slump

### Espanol

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 49,4 %). 297 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,20–1,11 | +0,08 | +0,15 (+1,3) | +5 pe | −1 pe | +0,18 / +0,13 ✔ |
| Balanserat | 121 | 1,15–1,36 | −0,08 | −0,01 (−0,1) | −5 pe | +5 pe | −0,13 / +0,12  |
| Bollinnehav | 83 | 1,17–1,54 | −0,23 | −0,16 (−1,4) | +7 pe | −1 pe | −0,31 / −0,03 ✔ |
| Kortpass | 60 | 1,22–1,48 | −0,17 | −0,10 (−0,7) | +8 pe | +7 pe | −0,29 / −0,05 ✔ |
| Blandat | 131 | 1,15–1,35 | −0,05 | +0,02 (+0,2) | +3 pe | −3 pe | −0,11 / +0,12  |
| Direktspel | 106 | 1,17–1,22 | −0,04 | +0,03 (+0,3) | −4 pe | +4 pe | −0,02 / +0,19  |
| Lågpress | 71 | 1,13–1,48 | −0,25 | −0,18 (−1,4) | +2 pe | +5 pe | −0,29 / −0,07 ✔ |
| Mellanpress | 152 | 1,15–1,34 | −0,09 | −0,02 (−0,2) | +3 pe | +2 pe | −0,08 / +0,05  |
| Högpress | 74 | 1,26–1,16 | +0,15 | +0,22 (+1,6) | −1 pe | −2 pe | +0,18 / +0,24 ✔ |

- Svårast mot **Bollinnehav** (−0,16 p/match rel. eget snitt, z −1,4, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,22 p/match rel. eget snitt, z +1,6, 74 m) – åt samma håll i båda halvorna men svagt

### Getafe

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 40,2 %). 305 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,02–1,14 | −0,04 | −0,02 (−0,2) | +3 pe | −3 pe | −0,12 / +0,07  |
| Balanserat | 137 | 0,91–1,08 | −0,09 | −0,07 (−0,7) | −1 pe | −4 pe | −0,07 / −0,07 ✔ |
| Bollinnehav | 88 | 0,94–1,07 | +0,11 | +0,13 (+1,0) | −2 pe | −4 pe | +0,09 / +0,17 ✔ |
| Kortpass | 72 | 0,79–1,29 | −0,18 | −0,16 (−1,1) | −8 pe | +0 pe | −0,19 / −0,14 ✔ |
| Blandat | 143 | 1,00–1,02 | +0,06 | +0,08 (+0,8) | +1 pe | −4 pe | +0,11 / +0,05 ✔ |
| Direktspel | 90 | 0,99–1,04 | −0,02 | +0,00 (+0,0) | +3 pe | −8 pe | −0,12 / +0,52  |
| Lågpress | 82 | 1,06–1,06 | −0,07 | −0,04 (−0,3) | −9 pe | +2 pe | −0,11 / +0,04  |
| Mellanpress | 141 | 0,89–1,05 | −0,02 | +0,00 (+0,0) | +2 pe | −7 pe | −0,03 / +0,05  |
| Högpress | 82 | 0,94–1,20 | +0,02 | +0,04 (+0,3) | +4 pe | −5 pe | +0,08 / +0,02 ✔ |

- Svårast mot **Kortpass** (−0,16 p/match rel. eget snitt, z −1,1, 72 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,13 p/match rel. eget snitt, z +1,0, 88 m) – åt samma håll i båda halvorna men svagt

### La Coruna

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,5 %). 79 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 1,63–0,81 | +0,39 | +0,41 (+1,4) | +8 pe | −5 pe | −0,25 / +0,81  |
| Balanserat | 43 | 1,16–1,21 | +0,00 | +0,02 (+0,1) | +9 pe | +2 pe | −0,12 / +0,19  |
| Bollinnehav | 20 | 1,10–1,60 | −0,40 | −0,38 (−1,4) | +6 pe | +1 pe | −0,31 / −0,44 ✔ |
| Kortpass | 20 | 1,15–1,25 | −0,20 | −0,18 (−0,7) | +12 pe | −13 pe | −1,06 / −0,08  |
| Blandat | 34 | 1,50–1,18 | +0,22 | +0,24 (+1,2) | +6 pe | +10 pe | −0,05 / +0,46  |
| Direktspel | 25 | 0,96–1,28 | −0,20 | −0,18 (−0,7) | +9 pe | −2 pe | −0,21 / +0,04  |
| Lågpress | 34 | 1,18–0,91 | +0,10 | +0,13 (+0,6) | +17 pe | −10 pe | +0,12 / +0,13 ✔ |
| Mellanpress | 36 | 1,25–1,56 | −0,15 | −0,13 (−0,6) | −2 pe | +10 pe | −0,48 / +0,30  |
| Högpress | 9 | 1,44–1,11 | +0,03 | +0,05 (+0,1) | +15 pe | −1 pe | +0,04 / +0,06  |

- Svårast mot **Bollinnehav** (−0,38 p/match rel. eget snitt, z −1,4, 20 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,41 p/match rel. eget snitt, z +1,4, 16 m) – inte stabilt, troligen slump

### Levante

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress** (faktiskt bollinnehav 34,4 %). 292 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,19–1,25 | +0,08 | +0,02 (+0,1) | +3 pe | −0 pe | −0,00 / +0,03  |
| Balanserat | 115 | 1,32–1,48 | +0,08 | +0,02 (+0,2) | +9 pe | −2 pe | −0,04 / +0,08  |
| Bollinnehav | 81 | 1,31–1,43 | +0,02 | −0,04 (−0,3) | +6 pe | −2 pe | +0,02 / −0,11  |
| Kortpass | 63 | 1,32–1,43 | +0,00 | −0,06 (−0,4) | +2 pe | −1 pe | +0,07 / −0,11  |
| Blandat | 123 | 1,36–1,43 | +0,13 | +0,07 (+0,7) | +4 pe | +1 pe | +0,05 / +0,09 ✔ |
| Direktspel | 106 | 1,15–1,32 | +0,01 | −0,05 (−0,4) | +11 pe | −4 pe | −0,06 / −0,00 ✔ |
| Lågpress | 76 | 1,34–1,84 | −0,13 | −0,19 (−1,6) | +7 pe | −1 pe | −0,33 / +0,00  |
| Mellanpress | 135 | 1,23–1,27 | +0,13 | +0,06 (+0,6) | +5 pe | −3 pe | +0,15 / −0,04  |
| Högpress | 81 | 1,28–1,17 | +0,13 | +0,07 (+0,6) | +6 pe | +2 pe | +0,07 / +0,07 ✔ |

- Svårast mot **Lågpress** (−0,19 p/match rel. eget snitt, z −1,6, 76 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,07 p/match rel. eget snitt, z +0,7, 123 m) – åt samma håll i båda halvorna men svagt

### Malaga

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 50,7 %). 181 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 44 | 1,00–1,07 | −0,05 | −0,01 (−0,1) | −15 pe | −6 pe | −0,08 / +0,02  |
| Balanserat | 97 | 0,94–1,11 | −0,04 | −0,01 (−0,1) | +11 pe | −9 pe | +0,03 / −0,05  |
| Bollinnehav | 40 | 1,02–1,20 | −0,01 | +0,03 (+0,2) | +7 pe | −1 pe | −0,07 / +0,13  |
| Kortpass | 28 | 1,04–1,39 | −0,21 | −0,18 (−0,9) | +19 pe | −7 pe | −0,65 / −0,07 ✔ |
| Blandat | 82 | 1,05–1,12 | −0,00 | +0,03 (+0,3) | +11 pe | −4 pe | −0,12 / +0,17  |
| Direktspel | 71 | 0,86–1,01 | −0,01 | +0,03 (+0,2) | −11 pe | −9 pe | +0,15 / −0,20  |
| Lågpress | 63 | 1,00–1,27 | −0,16 | −0,12 (−0,9) | +6 pe | −3 pe | −0,21 / −0,03 ✔ |
| Mellanpress | 78 | 0,94–0,92 | +0,09 | +0,13 (+1,0) | +0 pe | −12 pe | +0,21 / +0,01 ✔ |
| Högpress | 40 | 1,00–1,27 | −0,09 | −0,06 (−0,3) | +7 pe | −1 pe | −0,33 / +0,06  |

- Svårast mot **Kortpass** (−0,18 p/match rel. eget snitt, z −0,9, 28 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +1,0, 78 m) – åt samma håll i båda halvorna men svagt

### Osasuna

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 45,6 %). 273 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,16–1,24 | +0,04 | −0,03 (−0,2) | −1 pe | −1 pe | +0,10 / −0,12  |
| Balanserat | 106 | 1,08–1,29 | +0,16 | +0,09 (+0,8) | +1 pe | −3 pe | +0,11 / +0,07 ✔ |
| Bollinnehav | 81 | 1,05–1,51 | −0,02 | −0,09 (−0,8) | +3 pe | −0 pe | −0,12 / −0,06 ✔ |
| Kortpass | 68 | 1,00–1,60 | −0,25 | −0,32 (−2,4) | +1 pe | −0 pe | −0,47 / −0,25 ✔ ⚑ |
| Blandat | 126 | 1,12–1,26 | +0,23 | +0,17 (+1,6) | +2 pe | −4 pe | +0,21 / +0,12 ✔ |
| Direktspel | 79 | 1,15–1,24 | +0,07 | +0,01 (+0,0) | −2 pe | +0 pe | +0,01 / −0,01  |
| Lågpress | 74 | 1,19–1,36 | −0,03 | −0,10 (−0,8) | +6 pe | +1 pe | −0,09 / −0,11 ✔ |
| Mellanpress | 125 | 1,20–1,46 | +0,20 | +0,14 (+1,2) | −4 pe | +3 pe | +0,16 / +0,10 ✔ |
| Högpress | 74 | 0,84–1,11 | −0,06 | −0,13 (−1,1) | +4 pe | −12 pe | −0,11 / −0,14 ✔ |

- Svårast mot **Kortpass** (−0,32 p/match rel. eget snitt, z −2,4, 68 m) – ⚑ håller i båda halvorna
- Bäst mot **Blandat** (+0,17 p/match rel. eget snitt, z +1,6, 126 m) – åt samma håll i båda halvorna men svagt

### Real Madrid

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 52,5 %). 305 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,80–0,71 | +0,14 | +0,03 (+0,2) | −3 pe | −10 pe | −0,13 / +0,16  |
| Balanserat | 119 | 2,07–0,82 | +0,13 | +0,02 (+0,1) | −4 pe | −8 pe | +0,12 / −0,09  |
| Bollinnehav | 90 | 2,06–1,16 | +0,06 | −0,05 (−0,4) | +1 pe | +7 pe | −0,01 / −0,09 ✔ |
| Kortpass | 71 | 1,96–1,07 | −0,04 | −0,16 (−1,1) | +4 pe | −2 pe | −0,19 / −0,15 ✔ |
| Blandat | 136 | 2,07–0,96 | +0,14 | +0,02 (+0,2) | −5 pe | −2 pe | +0,06 / −0,00  |
| Direktspel | 98 | 1,87–0,64 | +0,19 | +0,08 (+0,7) | −3 pe | −9 pe | +0,01 / +0,25 ✔ |
| Lågpress | 81 | 1,77–1,10 | −0,13 | −0,24 (−1,7) | −2 pe | −5 pe | −0,24 / −0,23 ✔ |
| Mellanpress | 135 | 2,04–0,81 | +0,24 | +0,13 (+1,4) | −2 pe | −2 pe | +0,13 / +0,14 ✔ |
| Högpress | 89 | 2,09–0,79 | +0,13 | +0,02 (+0,1) | −3 pe | −7 pe | +0,09 / −0,02  |

- Svårast mot **Lågpress** (−0,24 p/match rel. eget snitt, z −1,7, 81 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +1,4, 135 m) – åt samma håll i båda halvorna men svagt

### Santander

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 48,0 %). 109 matcher med stil, mot marknaden totalt +0,25 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 34 | 1,74–1,44 | −0,01 | −0,26 (−1,1) | −1 pe | +13 pe | −0,37 / −0,10 ✔ |
| Balanserat | 44 | 1,59–1,36 | +0,26 | +0,02 (+0,1) | −7 pe | +9 pe | +0,15 / −0,09  |
| Bollinnehav | 31 | 2,00–1,48 | +0,50 | +0,26 (+1,2) | −7 pe | +8 pe | +0,07 / +0,43 ✔ |
| Kortpass | 33 | 1,79–1,42 | +0,38 | +0,14 (+0,7) | −4 pe | +6 pe | +0,17 / +0,12 ✔ |
| Blandat | 61 | 1,70–1,48 | +0,16 | −0,08 (−0,5) | −6 pe | +11 pe | −0,24 / +0,08  |
| Direktspel | 15 | 1,87–1,20 | +0,29 | +0,04 (+0,1) | −2 pe | +14 pe | +0,19 / −0,36  |
| Lågpress | 32 | 1,72–1,75 | +0,12 | −0,13 (−0,6) | −3 pe | +4 pe | +0,14 / −0,18  |
| Mellanpress | 55 | 1,80–1,20 | +0,31 | +0,06 (+0,3) | −8 pe | +13 pe | −0,11 / +0,27  |
| Högpress | 22 | 1,68–1,50 | +0,28 | +0,04 (+0,1) | −1 pe | +12 pe | −0,03 / +0,48  |

- Svårast mot **Backar hem** (−0,26 p/match rel. eget snitt, z −1,1, 34 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,26 p/match rel. eget snitt, z +1,2, 31 m) – åt samma håll i båda halvorna men svagt

### Sevilla

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Högpress** (faktiskt bollinnehav 42,0 %). 305 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 97 | 1,22–1,21 | −0,05 | −0,04 (−0,3) | −1 pe | −3 pe | +0,12 / −0,16  |
| Balanserat | 126 | 1,28–1,13 | −0,07 | −0,06 (−0,6) | −1 pe | −8 pe | +0,00 / −0,13  |
| Bollinnehav | 82 | 1,48–1,37 | +0,12 | +0,13 (+1,1) | +2 pe | −0 pe | +0,24 / +0,03 ✔ |
| Kortpass | 68 | 1,37–1,41 | +0,12 | +0,13 (+0,9) | −2 pe | −2 pe | +0,66 / −0,07  |
| Blandat | 135 | 1,30–1,21 | −0,00 | +0,01 (+0,1) | +1 pe | −4 pe | +0,07 / −0,03  |
| Direktspel | 102 | 1,28–1,10 | −0,12 | −0,10 (−0,8) | −1 pe | −7 pe | −0,02 / −0,33 ✔ |
| Lågpress | 80 | 1,31–1,34 | −0,02 | −0,00 (−0,0) | −1 pe | −3 pe | +0,28 / −0,31  |
| Mellanpress | 138 | 1,29–1,23 | −0,08 | −0,07 (−0,7) | +1 pe | −5 pe | +0,01 / −0,17  |
| Högpress | 87 | 1,34–1,09 | +0,09 | +0,11 (+0,8) | −1 pe | −4 pe | +0,08 / +0,12 ✔ |

- Svårast mot **Direktspel** (−0,10 p/match rel. eget snitt, z −0,8, 102 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,13 p/match rel. eget snitt, z +1,1, 82 m) – åt samma håll i båda halvorna men svagt

### Sociedad

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 49,2 %). 305 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,28–1,06 | −0,13 | −0,11 (−0,9) | −4 pe | +1 pe | +0,11 / −0,31  |
| Balanserat | 128 | 1,29–1,21 | −0,04 | −0,01 (−0,1) | +2 pe | −4 pe | +0,01 / −0,04  |
| Bollinnehav | 81 | 1,36–1,22 | +0,12 | +0,15 (+1,1) | −6 pe | +6 pe | +0,04 / +0,25 ✔ |
| Kortpass | 67 | 1,46–1,25 | +0,11 | +0,14 (+1,0) | +1 pe | +6 pe | +0,35 / +0,07 ✔ |
| Blandat | 132 | 1,23–1,22 | −0,06 | −0,03 (−0,3) | −5 pe | −1 pe | −0,05 / −0,02 ✔ |
| Direktspel | 106 | 1,30–1,05 | −0,08 | −0,05 (−0,5) | −1 pe | −2 pe | +0,05 / −0,36  |
| Lågpress | 79 | 1,53–1,04 | +0,10 | +0,13 (+1,1) | +6 pe | +4 pe | +0,15 / +0,10 ✔ |
| Mellanpress | 141 | 1,17–1,28 | −0,11 | −0,08 (−0,8) | −6 pe | −2 pe | −0,04 / −0,15 ✔ |
| Högpress | 85 | 1,32–1,09 | −0,01 | +0,02 (+0,1) | −3 pe | +1 pe | +0,17 / −0,04  |

- Svårast mot **Backar hem** (−0,11 p/match rel. eget snitt, z −0,9, 96 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,13 p/match rel. eget snitt, z +1,1, 79 m) – åt samma håll i båda halvorna men svagt

### Valencia

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 47,6 %). 305 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,19–1,27 | −0,15 | −0,10 (−0,8) | +0 pe | +5 pe | −0,24 / +0,04  |
| Balanserat | 129 | 1,12–1,16 | +0,02 | +0,08 (+0,7) | +11 pe | −7 pe | +0,21 / −0,05  |
| Bollinnehav | 90 | 1,22–1,57 | −0,07 | −0,02 (−0,1) | −2 pe | +0 pe | +0,06 / −0,10  |
| Kortpass | 67 | 1,25–1,75 | −0,08 | −0,02 (−0,2) | −1 pe | +9 pe | +0,35 / −0,17  |
| Blandat | 138 | 1,10–1,22 | −0,03 | +0,02 (+0,2) | +6 pe | −7 pe | +0,10 / −0,03  |
| Direktspel | 100 | 1,21–1,14 | −0,07 | −0,02 (−0,1) | +4 pe | −2 pe | −0,09 / +0,21  |
| Lågpress | 76 | 1,08–1,33 | −0,14 | −0,09 (−0,8) | +8 pe | −3 pe | +0,01 / −0,19  |
| Mellanpress | 142 | 1,31–1,38 | +0,05 | +0,10 (+1,0) | +3 pe | +2 pe | +0,09 / +0,12 ✔ |
| Högpress | 87 | 1,02–1,18 | −0,14 | −0,08 (−0,6) | +3 pe | −6 pe | −0,07 / −0,09 ✔ |

- Svårast mot **Backar hem** (−0,10 p/match rel. eget snitt, z −0,8, 86 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,10 p/match rel. eget snitt, z +1,0, 142 m) – åt samma håll i båda halvorna men svagt

### Vallecano

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 48,8 %). 265 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 1,12–1,10 | −0,00 | +0,04 (+0,3) | +5 pe | −4 pe | −0,15 / +0,20  |
| Balanserat | 124 | 1,16–1,19 | −0,06 | −0,01 (−0,1) | +4 pe | −1 pe | +0,05 / −0,09  |
| Bollinnehav | 64 | 1,05–1,52 | −0,08 | −0,03 (−0,2) | +1 pe | +2 pe | −0,07 / +0,00  |
| Kortpass | 59 | 1,03–1,25 | +0,02 | +0,07 (+0,4) | +6 pe | −8 pe | +0,28 / +0,01 ✔ |
| Blandat | 122 | 1,06–1,44 | −0,12 | −0,07 (−0,7) | −1 pe | +3 pe | −0,08 / −0,07 ✔ |
| Direktspel | 84 | 1,27–0,95 | +0,01 | +0,06 (+0,5) | +9 pe | −1 pe | −0,04 / +0,31  |
| Lågpress | 74 | 1,05–1,35 | −0,27 | −0,22 (−1,7) | +2 pe | +1 pe | −0,26 / −0,17 ✔ |
| Mellanpress | 116 | 1,24–1,26 | +0,05 | +0,10 (+0,9) | +4 pe | −1 pe | +0,09 / +0,11 ✔ |
| Högpress | 75 | 1,00–1,12 | +0,02 | +0,07 (+0,5) | +5 pe | −3 pe | +0,06 / +0,07 ✔ |

- Svårast mot **Lågpress** (−0,22 p/match rel. eget snitt, z −1,7, 74 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,10 p/match rel. eget snitt, z +0,9, 116 m) – åt samma håll i båda halvorna men svagt

### Villarreal

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 61,7 %). 305 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 1,58–1,14 | +0,04 | −0,00 (−0,0) | +4 pe | +5 pe | −0,13 / +0,11  |
| Balanserat | 129 | 1,70–1,27 | +0,13 | +0,09 (+0,8) | +1 pe | +8 pe | −0,02 / +0,18  |
| Bollinnehav | 84 | 1,70–1,43 | −0,09 | −0,13 (−0,9) | −8 pe | +6 pe | −0,20 / −0,03 ✔ |
| Kortpass | 70 | 1,77–1,36 | +0,16 | +0,12 (+0,7) | −10 pe | +6 pe | +0,09 / +0,13 ✔ |
| Blandat | 131 | 1,68–1,40 | −0,02 | −0,06 (−0,6) | +0 pe | +8 pe | −0,25 / +0,08  |
| Direktspel | 104 | 1,57–1,07 | +0,04 | +0,00 (+0,0) | +4 pe | +5 pe | −0,05 / +0,14  |
| Lågpress | 78 | 1,74–1,14 | +0,07 | +0,02 (+0,2) | +2 pe | +2 pe | −0,29 / +0,43  |
| Mellanpress | 137 | 1,63–1,33 | −0,01 | −0,05 (−0,5) | −1 pe | +9 pe | −0,15 / +0,08  |
| Högpress | 90 | 1,64–1,31 | +0,10 | +0,06 (+0,4) | −3 pe | +6 pe | +0,28 / −0,05  |

- Svårast mot **Bollinnehav** (−0,13 p/match rel. eget snitt, z −0,9, 84 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,09 p/match rel. eget snitt, z +0,8, 129 m) – inte stabilt, troligen slump
