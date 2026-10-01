# Stilmatchning – MLS (MLS)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 4150 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 349 m · hemma −0,06 · kryss −1 pe · ö2,5 – | 527 m · hemma +0,04 · kryss +2 pe · ö2,5 – | 402 m · hemma +0,04 · kryss +3 pe · ö2,5 – |
| **Mellan** | 539 m · hemma −0,09 · kryss +2 pe · ö2,5 – | 601 m · hemma −0,02 · kryss +0 pe · ö2,5 – | 501 m · hemma +0,01 · kryss −0 pe · ö2,5 – |
| **Mycket boll** | 416 m · hemma +0,07 · kryss −1 pe · ö2,5 – | 500 m · hemma +0,05 · kryss +0 pe · ö2,5 – | 315 m · hemma −0,07 · kryss +1 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 379 m · hemma −0,03 · kryss +1 pe · ö2,5 – | 505 m · hemma −0,04 · kryss +3 pe · ö2,5 – | 428 m · hemma +0,04 · kryss +1 pe · ö2,5 – |
| **Balanserat** | 518 m · hemma −0,01 · kryss +1 pe · ö2,5 – | 536 m · hemma +0,07 · kryss −3 pe · ö2,5 – | 493 m · hemma +0,00 · kryss +0 pe · ö2,5 – |
| **Bollinnehav** | 436 m · hemma +0,00 · kryss −2 pe · ö2,5 – | 498 m · hemma +0,02 · kryss +2 pe · ö2,5 – | 357 m · hemma −0,09 · kryss +4 pe · ö2,5 – |

## Lag (säsong 2026)

### Atlanta Utd

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 51,1 %). 291 matcher med stil, mot marknaden totalt −0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,31–1,35 | −0,23 | −0,14 (−1,2) | +6 pe | – | +0,08 / −0,31  |
| Balanserat | 120 | 1,60–1,46 | +0,01 | +0,09 (+0,8) | −3 pe | – | +0,18 / −0,04  |
| Bollinnehav | 88 | 1,48–1,56 | −0,08 | +0,01 (+0,1) | +2 pe | – | −0,04 / +0,05  |
| Kortpass | 65 | 1,32–1,80 | −0,22 | −0,14 (−0,9) | +2 pe | – | −0,35 / −0,09 ✔ |
| Blandat | 138 | 1,43–1,41 | −0,14 | −0,05 (−0,5) | +3 pe | – | −0,04 / −0,06 ✔ |
| Direktspel | 88 | 1,67–1,28 | +0,10 | +0,18 (+1,5) | −2 pe | – | +0,32 / −0,21  |
| Lågpress | 55 | 1,58–1,51 | −0,06 | +0,03 (+0,2) | −3 pe | – | +0,15 / −0,17  |
| Mellanpress | 139 | 1,50–1,47 | −0,09 | −0,00 (−0,0) | +0 pe | – | +0,14 / −0,14  |
| Högpress | 97 | 1,39–1,41 | −0,10 | −0,01 (−0,1) | +4 pe | – | −0,02 / −0,01 ✔ |

- Svårast mot **Backar hem** (−0,14 p/match rel. eget snitt, z −1,2, 83 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,5, 88 m) – inte stabilt, troligen slump

### Austin FC

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 48,7 %). 162 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 63 | 1,37–1,52 | +0,13 | +0,08 (+0,5) | +3 pe | – | +0,00 / +0,16 ✔ |
| Balanserat | 51 | 1,24–1,55 | −0,25 | −0,29 (−1,8) | −0 pe | – | −0,26 / −0,33 ✔ |
| Bollinnehav | 48 | 1,48–1,38 | +0,25 | +0,21 (+1,1) | +2 pe | – | +0,43 / −0,02  |
| Kortpass | 51 | 1,25–1,53 | +0,10 | +0,06 (+0,3) | −3 pe | – | +0,26 / −0,03  |
| Blandat | 87 | 1,31–1,40 | +0,02 | −0,03 (−0,2) | +2 pe | – | +0,06 / −0,13  |
| Direktspel | 24 | 1,75–1,71 | +0,02 | −0,03 (−0,1) | +13 pe | – | −0,19 / +0,45  |
| Lågpress | 31 | 1,23–1,52 | −0,20 | −0,24 (−1,2) | +10 pe | – | −0,62 / −0,11 ✔ |
| Mellanpress | 74 | 1,27–1,55 | −0,05 | −0,09 (−0,6) | +2 pe | – | −0,18 / +0,01  |
| Högpress | 57 | 1,54–1,39 | +0,30 | +0,25 (+1,5) | −2 pe | – | +0,49 / −0,05  |

- Svårast mot **Balanserat** (−0,29 p/match rel. eget snitt, z −1,8, 51 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,25 p/match rel. eget snitt, z +1,5, 57 m) – inte stabilt, troligen slump

### CF Montreal

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 48,5 %). 316 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 95 | 1,42–1,66 | −0,01 | −0,05 (−0,4) | −6 pe | – | −0,12 / +0,01  |
| Balanserat | 124 | 1,35–1,43 | +0,13 | +0,09 (+0,8) | −2 pe | – | +0,13 / +0,04 ✔ |
| Bollinnehav | 97 | 1,31–1,99 | −0,03 | −0,07 (−0,5) | −7 pe | – | −0,08 / −0,06 ✔ |
| Kortpass | 60 | 1,18–1,82 | −0,01 | −0,04 (−0,3) | −9 pe | – | +0,10 / −0,06  |
| Blandat | 141 | 1,43–1,72 | +0,07 | +0,03 (+0,3) | −4 pe | – | +0,05 / +0,01 ✔ |
| Direktspel | 115 | 1,36–1,53 | +0,02 | −0,02 (−0,1) | −3 pe | – | −0,04 / +0,08  |
| Lågpress | 89 | 1,60–1,63 | +0,06 | +0,02 (+0,2) | −7 pe | – | +0,06 / −0,06  |
| Mellanpress | 137 | 1,22–1,80 | −0,06 | −0,10 (−0,9) | −3 pe | – | −0,10 / −0,09 ✔ |
| Högpress | 90 | 1,33–1,51 | +0,16 | +0,12 (+0,9) | −5 pe | – | +0,07 / +0,16 ✔ |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −0,9, 137 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,12 p/match rel. eget snitt, z +0,9, 90 m) – åt samma håll i båda halvorna men svagt

### Charlotte

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 45,8 %). 133 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,63–1,58 | +0,19 | +0,05 (+0,3) | +3 pe | – | −0,14 / +0,37  |
| Balanserat | 53 | 1,42–1,28 | +0,03 | −0,12 (−0,7) | +3 pe | – | −0,18 / −0,08 ✔ |
| Bollinnehav | 42 | 1,33–1,26 | +0,24 | +0,10 (+0,5) | −6 pe | – | −0,01 / +0,25  |
| Kortpass | 59 | 1,47–1,44 | +0,10 | −0,04 (−0,2) | −2 pe | – | +0,20 / −0,13  |
| Blandat | 54 | 1,52–1,28 | +0,26 | +0,11 (+0,7) | −1 pe | – | −0,12 / +0,52  |
| Direktspel | 20 | 1,20–1,35 | −0,04 | −0,18 (−0,8) | +9 pe | – | −0,38 / +0,59  |
| Lågpress | 23 | 1,70–1,57 | +0,23 | +0,09 (+0,3) | −4 pe | – | +0,28 / +0,06  |
| Mellanpress | 66 | 1,38–1,33 | +0,07 | −0,07 (−0,5) | +2 pe | – | −0,09 / −0,06 ✔ |
| Högpress | 44 | 1,43–1,30 | +0,21 | +0,07 (+0,4) | −0 pe | – | −0,17 / +0,42  |

- Svårast mot **Direktspel** (−0,18 p/match rel. eget snitt, z −0,8, 20 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,11 p/match rel. eget snitt, z +0,7, 54 m) – inte stabilt, troligen slump

### Chicago Fire

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 51,6 %). 313 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,49–1,53 | +0,05 | +0,17 (+1,3) | +0 pe | – | +0,04 / +0,28 ✔ |
| Balanserat | 122 | 1,53–1,65 | −0,08 | +0,03 (+0,3) | +2 pe | – | +0,05 / −0,00  |
| Bollinnehav | 101 | 1,32–1,59 | −0,30 | −0,18 (−1,7) | +3 pe | – | −0,18 / −0,18 ✔ |
| Kortpass | 64 | 1,47–1,58 | −0,10 | +0,02 (+0,1) | +2 pe | – | +0,60 / −0,04  |
| Blandat | 128 | 1,37–1,54 | −0,09 | +0,02 (+0,2) | +2 pe | – | −0,12 / +0,13  |
| Direktspel | 121 | 1,53–1,67 | −0,14 | −0,03 (−0,3) | +1 pe | – | +0,00 / −0,14  |
| Lågpress | 87 | 1,68–1,59 | +0,04 | +0,15 (+1,2) | −0 pe | – | +0,03 / +0,52 ✔ |
| Mellanpress | 136 | 1,35–1,64 | −0,21 | −0,09 (−1,0) | +6 pe | – | −0,06 / −0,12 ✔ |
| Högpress | 90 | 1,38–1,54 | −0,12 | −0,01 (−0,0) | −3 pe | – | −0,03 / +0,01  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,7, 101 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,17 p/match rel. eget snitt, z +1,3, 90 m) – åt samma håll i båda halvorna men svagt

### Colorado Rapids

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 55,2 %). 306 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,26–1,49 | +0,03 | +0,05 (+0,4) | +3 pe | – | +0,23 / −0,13  |
| Balanserat | 106 | 1,54–1,58 | +0,09 | +0,11 (+1,0) | −6 pe | – | +0,08 / +0,15 ✔ |
| Bollinnehav | 96 | 1,19–1,79 | −0,20 | −0,18 (−1,5) | −4 pe | – | −0,15 / −0,21 ✔ |
| Kortpass | 54 | 1,54–1,72 | +0,05 | +0,07 (+0,4) | −8 pe | – | +0,40 / +0,03 ✔ |
| Blandat | 135 | 1,32–1,47 | +0,03 | +0,06 (+0,5) | −2 pe | – | +0,27 / −0,07  |
| Direktspel | 117 | 1,26–1,74 | −0,12 | −0,10 (−0,9) | +0 pe | – | −0,05 / −0,31 ✔ |
| Lågpress | 105 | 1,30–1,45 | +0,06 | +0,08 (+0,7) | −4 pe | – | +0,07 / +0,11 ✔ |
| Mellanpress | 132 | 1,24–1,86 | −0,20 | −0,18 (−1,9) | −0 pe | – | −0,12 / −0,22 ✔ |
| Högpress | 69 | 1,55–1,42 | +0,19 | +0,21 (+1,5) | −4 pe | – | +0,55 / +0,05 ✔ |

- Svårast mot **Mellanpress** (−0,18 p/match rel. eget snitt, z −1,9, 132 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +1,5, 69 m) – åt samma håll i båda halvorna men svagt

### Columbus Crew

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 56,5 %). 332 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 103 | 1,63–1,15 | +0,14 | +0,15 (+1,3) | +6 pe | – | +0,18 / +0,12 ✔ |
| Balanserat | 129 | 1,50–1,37 | −0,12 | −0,11 (−1,1) | −0 pe | – | −0,08 / −0,15 ✔ |
| Bollinnehav | 100 | 1,53–1,44 | −0,02 | −0,01 (−0,1) | −1 pe | – | +0,06 / −0,08  |
| Kortpass | 68 | 1,60–1,46 | −0,20 | −0,19 (−1,3) | −2 pe | – | +0,24 / −0,26  |
| Blandat | 130 | 1,67–1,43 | +0,02 | +0,03 (+0,3) | +4 pe | – | +0,03 / +0,02 ✔ |
| Direktspel | 134 | 1,40–1,15 | +0,06 | +0,07 (+0,7) | +1 pe | – | +0,01 / +0,27 ✔ |
| Lågpress | 94 | 1,46–1,45 | −0,13 | −0,12 (−0,9) | −6 pe | – | +0,02 / −0,45  |
| Mellanpress | 136 | 1,51–1,38 | −0,08 | −0,08 (−0,8) | +9 pe | – | −0,13 / −0,03 ✔ |
| Högpress | 102 | 1,68–1,13 | +0,21 | +0,21 (+1,7) | −2 pe | – | +0,33 / +0,15 ✔ |

- Svårast mot **Kortpass** (−0,19 p/match rel. eget snitt, z −1,3, 68 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +1,7, 102 m) – åt samma håll i båda halvorna men svagt

### DC United

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 37,3 %). 311 matcher med stil, mot marknaden totalt −0,13 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,14–1,90 | −0,21 | −0,09 (−0,7) | −6 pe | – | +0,04 / −0,20  |
| Balanserat | 118 | 1,37–1,52 | +0,03 | +0,15 (+1,4) | +8 pe | – | +0,21 / +0,09 ✔ |
| Bollinnehav | 107 | 1,25–1,73 | −0,22 | −0,10 (−0,9) | +1 pe | – | +0,05 / −0,22  |
| Kortpass | 68 | 1,26–1,60 | −0,15 | −0,03 (−0,2) | +12 pe | – | +0,15 / −0,05  |
| Blandat | 124 | 1,27–1,67 | −0,10 | +0,03 (+0,2) | +2 pe | – | +0,20 / −0,09  |
| Direktspel | 119 | 1,27–1,77 | −0,14 | −0,01 (−0,1) | −4 pe | – | +0,07 / −0,35  |
| Lågpress | 95 | 1,27–1,58 | −0,10 | +0,02 (+0,2) | −3 pe | – | +0,11 / −0,15  |
| Mellanpress | 124 | 1,25–1,65 | −0,13 | −0,01 (−0,1) | +6 pe | – | +0,12 / −0,11  |
| Högpress | 92 | 1,28–1,87 | −0,14 | −0,01 (−0,1) | +1 pe | – | +0,11 / −0,09  |

- Svårast mot **Bollinnehav** (−0,10 p/match rel. eget snitt, z −0,9, 107 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,4, 118 m) – åt samma håll i båda halvorna men svagt

### FC Cincinnati

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 48,9 %). 228 matcher med stil, mot marknaden totalt +0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,45–1,60 | −0,01 | −0,13 (−0,8) | −3 pe | – | −0,06 / −0,19 ✔ |
| Balanserat | 85 | 1,45–1,55 | +0,15 | +0,04 (+0,3) | +3 pe | – | −0,01 / +0,10  |
| Bollinnehav | 78 | 1,64–1,63 | +0,18 | +0,06 (+0,5) | −1 pe | – | −0,25 / +0,28  |
| Kortpass | 67 | 1,93–1,64 | +0,30 | +0,19 (+1,2) | −1 pe | – | +0,13 / +0,20 ✔ |
| Blandat | 108 | 1,35–1,55 | +0,07 | −0,04 (−0,4) | +1 pe | – | −0,11 / +0,05  |
| Direktspel | 53 | 1,32–1,62 | −0,03 | −0,15 (−0,9) | −3 pe | – | −0,12 / −0,23 ✔ |
| Lågpress | 41 | 1,66–1,76 | +0,21 | +0,09 (+0,5) | +4 pe | – | +0,29 / +0,01 ✔ |
| Mellanpress | 105 | 1,39–1,49 | +0,07 | −0,04 (−0,3) | +0 pe | – | −0,17 / +0,09  |
| Högpress | 82 | 1,60–1,65 | +0,12 | +0,01 (+0,0) | −3 pe | – | −0,10 / +0,16  |

- Svårast mot **Direktspel** (−0,15 p/match rel. eget snitt, z −0,9, 53 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,19 p/match rel. eget snitt, z +1,2, 67 m) – åt samma håll i båda halvorna men svagt

### FC Dallas

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 42,2 %). 313 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 110 | 1,37–1,31 | −0,04 | −0,03 (−0,3) | +4 pe | – | −0,14 / +0,08  |
| Balanserat | 112 | 1,50–1,43 | −0,04 | −0,04 (−0,3) | +11 pe | – | −0,03 / −0,05 ✔ |
| Bollinnehav | 91 | 1,53–1,43 | +0,08 | +0,08 (+0,7) | +8 pe | – | −0,15 / +0,26  |
| Kortpass | 49 | 1,73–1,78 | +0,17 | +0,17 (+1,0) | −0 pe | – | −0,18 / +0,22  |
| Blandat | 145 | 1,36–1,32 | −0,03 | −0,02 (−0,2) | +8 pe | – | −0,17 / +0,06  |
| Direktspel | 119 | 1,48–1,30 | −0,05 | −0,04 (−0,4) | +10 pe | – | −0,06 / +0,02  |
| Lågpress | 117 | 1,50–1,33 | −0,07 | −0,06 (−0,6) | +12 pe | – | −0,15 / +0,13  |
| Mellanpress | 121 | 1,36–1,42 | +0,00 | +0,01 (+0,1) | +4 pe | – | +0,01 / +0,01 ✔ |
| Högpress | 75 | 1,57–1,41 | +0,08 | +0,08 (+0,6) | +7 pe | – | −0,15 / +0,20  |

- Svårast mot **Lågpress** (−0,06 p/match rel. eget snitt, z −0,6, 117 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,17 p/match rel. eget snitt, z +1,0, 49 m) – inte stabilt, troligen slump

### Houston Dynamo

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 47,8 %). 315 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 114 | 1,36–1,52 | −0,08 | −0,00 (−0,0) | +6 pe | – | −0,22 / +0,18  |
| Balanserat | 108 | 1,43–1,47 | −0,05 | +0,02 (+0,2) | −5 pe | – | −0,04 / +0,10  |
| Bollinnehav | 93 | 1,29–1,25 | −0,10 | −0,03 (−0,2) | +2 pe | – | −0,02 / −0,03 ✔ |
| Kortpass | 55 | 1,33–1,25 | +0,06 | +0,13 (+0,7) | +1 pe | – | −0,15 / +0,17  |
| Blandat | 141 | 1,31–1,35 | −0,08 | −0,01 (−0,1) | −0 pe | – | +0,03 / −0,02  |
| Direktspel | 119 | 1,44–1,59 | −0,13 | −0,05 (−0,5) | +4 pe | – | −0,15 / +0,41  |
| Lågpress | 114 | 1,46–1,39 | −0,05 | +0,03 (+0,3) | +3 pe | – | −0,07 / +0,25  |
| Mellanpress | 137 | 1,35–1,45 | −0,03 | +0,04 (+0,4) | +1 pe | – | −0,06 / +0,12  |
| Högpress | 64 | 1,20–1,44 | −0,22 | −0,15 (−1,0) | +0 pe | – | −0,31 / −0,08 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,0, 64 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,13 p/match rel. eget snitt, z +0,7, 55 m) – inte stabilt, troligen slump

### Inter Miami

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 56,7 %). 203 matcher med stil, mot marknaden totalt +0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 1,90–1,79 | +0,17 | +0,02 (+0,1) | −3 pe | – | −0,23 / +0,22  |
| Balanserat | 79 | 1,72–1,61 | +0,03 | −0,13 (−0,8) | −4 pe | – | −0,16 / −0,09 ✔ |
| Bollinnehav | 66 | 1,86–1,39 | +0,29 | +0,14 (+0,9) | +1 pe | – | +0,01 / +0,28 ✔ |
| Kortpass | 61 | 2,08–1,67 | +0,03 | −0,12 (−0,7) | +3 pe | – | −0,40 / −0,04 ✔ |
| Blandat | 105 | 1,81–1,59 | +0,19 | +0,03 (+0,3) | −5 pe | – | −0,09 / +0,19  |
| Direktspel | 37 | 1,41–1,46 | +0,26 | +0,11 (+0,5) | −2 pe | – | −0,04 / +0,63  |
| Lågpress | 32 | 2,13–1,56 | +0,05 | −0,11 (−0,5) | −1 pe | – | −0,54 / −0,01 ✔ |
| Mellanpress | 95 | 1,87–1,47 | +0,30 | +0,14 (+1,0) | −3 pe | – | +0,14 / +0,14 ✔ |
| Högpress | 76 | 1,62–1,75 | +0,03 | −0,13 (−0,9) | −2 pe | – | −0,34 / +0,20  |

- Svårast mot **Högpress** (−0,13 p/match rel. eget snitt, z −0,9, 76 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,14 p/match rel. eget snitt, z +1,0, 95 m) – åt samma håll i båda halvorna men svagt

### Los Angeles FC

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 46,8 %). 263 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,98–1,29 | −0,12 | −0,04 (−0,3) | +7 pe | – | −0,26 / +0,21  |
| Balanserat | 90 | 1,84–1,26 | −0,13 | −0,05 (−0,4) | +2 pe | – | +0,14 / −0,24  |
| Bollinnehav | 84 | 1,87–1,32 | +0,03 | +0,10 (+0,7) | −5 pe | – | −0,01 / +0,20  |
| Kortpass | 51 | 1,76–1,39 | −0,17 | −0,09 (−0,6) | +2 pe | – | +0,53 / −0,15  |
| Blandat | 141 | 1,83–1,21 | −0,00 | +0,07 (+0,6) | +2 pe | – | −0,07 / +0,20  |
| Direktspel | 71 | 2,13–1,37 | −0,14 | −0,07 (−0,5) | −0 pe | – | −0,06 / −0,11 ✔ |
| Lågpress | 69 | 1,97–1,26 | −0,21 | −0,13 (−0,9) | −3 pe | – | −0,18 / −0,09 ✔ |
| Mellanpress | 123 | 1,80–1,29 | −0,00 | +0,07 (+0,6) | −1 pe | – | +0,02 / +0,12 ✔ |
| Högpress | 71 | 1,99–1,31 | −0,06 | +0,01 (+0,1) | +10 pe | – | −0,06 / +0,07  |

- Svårast mot **Lågpress** (−0,13 p/match rel. eget snitt, z −0,9, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,10 p/match rel. eget snitt, z +0,7, 84 m) – inte stabilt, troligen slump

### Los Angeles Galaxy

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 48,8 %). 316 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 115 | 1,86–1,93 | −0,03 | +0,04 (+0,3) | −1 pe | – | −0,13 / +0,18  |
| Balanserat | 110 | 1,47–1,79 | −0,14 | −0,07 (−0,6) | +1 pe | – | +0,03 / −0,20  |
| Bollinnehav | 91 | 1,46–1,54 | −0,03 | +0,03 (+0,2) | −3 pe | – | +0,04 / +0,03 ✔ |
| Kortpass | 55 | 1,60–1,67 | +0,08 | +0,14 (+0,9) | +5 pe | – | +0,59 / +0,02 ✔ |
| Blandat | 142 | 1,67–1,68 | −0,05 | +0,02 (+0,2) | +1 pe | – | +0,06 / −0,01  |
| Direktspel | 119 | 1,55–1,92 | −0,15 | −0,09 (−0,7) | −5 pe | – | −0,14 / +0,14  |
| Lågpress | 116 | 1,47–1,68 | −0,14 | −0,08 (−0,7) | −1 pe | – | −0,11 / −0,00 ✔ |
| Mellanpress | 116 | 1,53–1,84 | −0,07 | −0,00 (−0,0) | +2 pe | – | −0,13 / +0,08  |
| Högpress | 84 | 1,90–1,80 | +0,04 | +0,11 (+0,7) | −4 pe | – | +0,40 / −0,04  |

- Svårast mot **Direktspel** (−0,09 p/match rel. eget snitt, z −0,7, 119 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,14 p/match rel. eget snitt, z +0,9, 55 m) – åt samma håll i båda halvorna men svagt

### Minnesota United

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress** (faktiskt bollinnehav 46,0 %). 289 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,48–1,54 | +0,00 | −0,04 (−0,3) | +2 pe | – | −0,18 / +0,12  |
| Balanserat | 108 | 1,48–1,35 | +0,15 | +0,11 (+0,9) | −2 pe | – | +0,34 / −0,14  |
| Bollinnehav | 85 | 1,49–1,67 | −0,06 | −0,10 (−0,7) | +6 pe | – | −0,09 / −0,10 ✔ |
| Kortpass | 56 | 1,55–1,70 | −0,07 | −0,11 (−0,7) | +8 pe | – | +0,03 / −0,13  |
| Blandat | 130 | 1,47–1,45 | −0,01 | −0,06 (−0,5) | −0 pe | – | −0,16 / +0,01  |
| Direktspel | 103 | 1,47–1,48 | +0,17 | +0,13 (+1,1) | −0 pe | – | +0,17 / −0,07  |
| Lågpress | 82 | 1,62–1,65 | +0,01 | −0,03 (−0,2) | +0 pe | – | −0,05 / −0,01 ✔ |
| Mellanpress | 136 | 1,34–1,52 | −0,04 | −0,08 (−0,8) | +5 pe | – | +0,04 / −0,20  |
| Högpress | 71 | 1,61–1,32 | +0,23 | +0,19 (+1,2) | −3 pe | – | +0,26 / +0,15 ✔ |

- Svårast mot **Mellanpress** (−0,08 p/match rel. eget snitt, z −0,8, 136 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,2, 71 m) – åt samma håll i båda halvorna men svagt

### Nashville SC

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 53,9 %). 200 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 1,33–1,16 | +0,01 | −0,04 (−0,3) | +6 pe | – | −0,19 / +0,06  |
| Balanserat | 69 | 1,57–1,07 | +0,01 | −0,04 (−0,3) | −1 pe | – | +0,04 / −0,14  |
| Bollinnehav | 76 | 1,53–1,25 | +0,12 | +0,07 (+0,5) | +7 pe | – | −0,02 / +0,18  |
| Kortpass | 66 | 1,71–1,30 | +0,13 | +0,08 (+0,5) | −4 pe | – | −0,27 / +0,19  |
| Blandat | 100 | 1,41–1,15 | −0,01 | −0,06 (−0,5) | +6 pe | – | −0,03 / −0,09 ✔ |
| Direktspel | 34 | 1,26–0,94 | +0,06 | +0,01 (+0,0) | +13 pe | – | +0,07 / −0,20  |
| Lågpress | 28 | 1,75–1,36 | +0,20 | +0,15 (+0,7) | −4 pe | – | +0,12 / +0,15  |
| Mellanpress | 95 | 1,52–1,13 | +0,07 | +0,02 (+0,2) | +5 pe | – | −0,03 / +0,07  |
| Högpress | 77 | 1,35–1,14 | −0,03 | −0,08 (−0,6) | +5 pe | – | −0,07 / −0,10 ✔ |

- Svårast mot **Högpress** (−0,08 p/match rel. eget snitt, z −0,6, 77 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,15 p/match rel. eget snitt, z +0,7, 28 m) – inte stabilt, troligen slump

### New England Revolution

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 50,6 %). 320 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,42–1,43 | +0,10 | +0,08 (+0,6) | −5 pe | – | +0,11 / +0,05 ✔ |
| Balanserat | 128 | 1,61–1,55 | −0,01 | −0,02 (−0,2) | +5 pe | – | +0,05 / −0,11  |
| Bollinnehav | 106 | 1,35–1,56 | −0,02 | −0,03 (−0,3) | −1 pe | – | +0,03 / −0,09  |
| Kortpass | 61 | 1,44–1,77 | −0,11 | −0,13 (−0,8) | −3 pe | – | +0,61 / −0,21  |
| Blandat | 142 | 1,52–1,42 | +0,08 | +0,06 (+0,6) | +3 pe | – | −0,00 / +0,11  |
| Direktspel | 117 | 1,43–1,50 | +0,01 | −0,01 (−0,0) | −1 pe | – | +0,06 / −0,22  |
| Lågpress | 101 | 1,39–1,49 | −0,04 | −0,05 (−0,4) | −2 pe | – | −0,08 / +0,01  |
| Mellanpress | 123 | 1,51–1,54 | +0,05 | +0,04 (+0,3) | +1 pe | – | +0,11 / −0,02  |
| Högpress | 96 | 1,51–1,53 | +0,03 | +0,01 (+0,1) | +3 pe | – | +0,25 / −0,12  |

- Svårast mot **Kortpass** (−0,13 p/match rel. eget snitt, z −0,8, 61 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,06 p/match rel. eget snitt, z +0,6, 142 m) – inte stabilt, troligen slump

### New York City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 54,0 %). 336 matcher med stil, mot marknaden totalt +0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,42–1,34 | −0,21 | −0,22 (−1,7) | −4 pe | – | −0,21 / −0,23 ✔ |
| Balanserat | 137 | 1,72–1,09 | +0,22 | +0,21 (+2,1) | −0 pe | – | +0,15 / +0,31 ✔ ⚑ |
| Bollinnehav | 95 | 1,42–1,33 | −0,05 | −0,06 (−0,5) | +5 pe | – | −0,06 / −0,06 ✔ |
| Kortpass | 64 | 1,55–1,47 | −0,05 | −0,06 (−0,4) | +1 pe | – | −0,37 / −0,01 ✔ |
| Blandat | 141 | 1,46–1,13 | +0,00 | −0,01 (−0,1) | +5 pe | – | −0,11 / +0,06  |
| Direktspel | 131 | 1,63–1,23 | +0,05 | +0,04 (+0,4) | −6 pe | – | +0,11 / −0,18  |
| Lågpress | 94 | 1,65–1,32 | +0,09 | +0,08 (+0,6) | −2 pe | – | +0,14 / −0,04  |
| Mellanpress | 138 | 1,52–1,20 | −0,00 | −0,01 (−0,1) | +5 pe | – | −0,02 / −0,00 ✔ |
| Högpress | 104 | 1,47–1,21 | −0,05 | −0,06 (−0,4) | −5 pe | – | −0,16 / +0,01  |

- Svårast mot **Backar hem** (−0,22 p/match rel. eget snitt, z −1,7, 104 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,21 p/match rel. eget snitt, z +2,1, 137 m) – ⚑ håller i båda halvorna

### New York Red Bulls

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 51,9 %). 330 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,43–1,39 | −0,01 | +0,03 (+0,2) | +3 pe | – | +0,40 / −0,23  |
| Balanserat | 136 | 1,41–1,35 | −0,16 | −0,12 (−1,0) | −3 pe | – | −0,14 / −0,07 ✔ |
| Bollinnehav | 111 | 1,44–1,25 | +0,08 | +0,12 (+1,0) | −1 pe | – | +0,22 / +0,05 ✔ |
| Kortpass | 62 | 1,52–1,42 | +0,07 | +0,11 (+0,7) | −7 pe | – | +1,16 / +0,07  |
| Blandat | 137 | 1,28–1,32 | −0,21 | −0,17 (−1,6) | +5 pe | – | −0,18 / −0,17 ✔ |
| Direktspel | 131 | 1,53–1,28 | +0,09 | +0,13 (+1,2) | −4 pe | – | +0,17 / −0,10  |
| Lågpress | 98 | 1,54–1,34 | −0,02 | +0,02 (+0,2) | −4 pe | – | +0,07 / −0,09  |
| Mellanpress | 136 | 1,40–1,33 | +0,02 | +0,06 (+0,6) | −3 pe | – | +0,25 / −0,10  |
| Högpress | 96 | 1,35–1,30 | −0,15 | −0,11 (−0,8) | +5 pe | – | −0,27 / −0,02 ✔ |

- Svårast mot **Blandat** (−0,17 p/match rel. eget snitt, z −1,6, 137 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +1,2, 131 m) – inte stabilt, troligen slump

### Orlando City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 49,5 %). 321 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 97 | 1,45–1,59 | −0,02 | −0,05 (−0,4) | +5 pe | – | −0,29 / +0,15  |
| Balanserat | 112 | 1,60–1,71 | +0,09 | +0,06 (+0,5) | −9 pe | – | +0,04 / +0,08 ✔ |
| Bollinnehav | 112 | 1,33–1,38 | +0,01 | −0,02 (−0,2) | +7 pe | – | +0,04 / −0,07  |
| Kortpass | 68 | 1,49–1,72 | −0,05 | −0,08 (−0,5) | −4 pe | – | −0,25 / −0,05 ✔ |
| Blandat | 126 | 1,60–1,38 | +0,18 | +0,15 (+1,4) | +5 pe | – | +0,24 / +0,09 ✔ |
| Direktspel | 127 | 1,31–1,65 | −0,08 | −0,11 (−1,0) | −2 pe | – | −0,19 / +0,16  |
| Lågpress | 93 | 1,46–1,59 | +0,19 | +0,16 (+1,2) | −5 pe | – | +0,04 / +0,45 ✔ |
| Mellanpress | 129 | 1,49–1,60 | +0,03 | −0,00 (−0,0) | +6 pe | – | −0,06 / +0,04  |
| Högpress | 99 | 1,42–1,48 | −0,11 | −0,14 (−1,1) | −2 pe | – | −0,22 / −0,10 ✔ |

- Svårast mot **Högpress** (−0,14 p/match rel. eget snitt, z −1,1, 99 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,15 p/match rel. eget snitt, z +1,4, 126 m) – åt samma håll i båda halvorna men svagt

### Philadelphia Union

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 47,0 %). 330 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,80–1,14 | +0,27 | +0,15 (+1,2) | −2 pe | – | +0,16 / +0,15 ✔ |
| Balanserat | 135 | 1,69–1,20 | +0,11 | −0,01 (−0,1) | +3 pe | – | +0,02 / −0,04  |
| Bollinnehav | 104 | 1,61–1,39 | −0,01 | −0,12 (−1,0) | −3 pe | – | −0,08 / −0,16 ✔ |
| Kortpass | 75 | 1,80–1,36 | +0,06 | −0,06 (−0,4) | +3 pe | – | +0,18 / −0,09  |
| Blandat | 138 | 1,61–1,24 | −0,01 | −0,12 (−1,2) | +3 pe | – | −0,04 / −0,19 ✔ |
| Direktspel | 117 | 1,73–1,18 | +0,30 | +0,18 (+1,6) | −5 pe | – | +0,06 / +0,73 ✔ |
| Lågpress | 91 | 1,51–1,42 | +0,01 | −0,11 (−0,8) | +1 pe | – | −0,06 / −0,21 ✔ |
| Mellanpress | 131 | 1,75–1,21 | +0,16 | +0,04 (+0,4) | −4 pe | – | +0,14 / −0,05  |
| Högpress | 108 | 1,79–1,14 | +0,15 | +0,04 (+0,3) | +3 pe | – | +0,01 / +0,05 ✔ |

- Svårast mot **Blandat** (−0,12 p/match rel. eget snitt, z −1,2, 138 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,6, 117 m) – åt samma håll i båda halvorna men svagt

### Portland Timbers

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 51,0 %). 327 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 105 | 1,54–1,52 | +0,00 | −0,11 (−1,0) | +0 pe | – | −0,09 / −0,13 ✔ |
| Balanserat | 110 | 1,58–1,61 | −0,01 | −0,12 (−1,0) | +1 pe | – | +0,05 / −0,36  |
| Bollinnehav | 112 | 1,73–1,45 | +0,34 | +0,22 (+1,9) | +4 pe | – | +0,23 / +0,22 ✔ |
| Kortpass | 61 | 1,64–1,77 | +0,05 | −0,06 (−0,4) | +6 pe | – | +0,21 / −0,12  |
| Blandat | 142 | 1,61–1,56 | +0,14 | +0,03 (+0,2) | +0 pe | – | +0,11 / −0,02  |
| Direktspel | 124 | 1,62–1,36 | +0,11 | +0,00 (+0,0) | +2 pe | – | +0,02 / −0,12  |
| Lågpress | 111 | 1,54–1,42 | +0,04 | −0,07 (−0,6) | −0 pe | – | +0,01 / −0,29  |
| Mellanpress | 142 | 1,63–1,58 | +0,14 | +0,02 (+0,2) | +0 pe | – | −0,00 / +0,04  |
| Högpress | 74 | 1,72–1,57 | +0,18 | +0,07 (+0,5) | +8 pe | – | +0,39 / −0,08  |

- Svårast mot **Balanserat** (−0,12 p/match rel. eget snitt, z −1,0, 110 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,22 p/match rel. eget snitt, z +1,9, 112 m) – åt samma håll i båda halvorna men svagt

### Real Salt Lake

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 48,7 %). 323 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 121 | 1,49–1,59 | +0,12 | +0,07 (+0,6) | −1 pe | – | +0,15 / −0,01  |
| Balanserat | 113 | 1,40–1,42 | −0,02 | −0,07 (−0,6) | −1 pe | – | −0,01 / −0,14 ✔ |
| Bollinnehav | 89 | 1,37–1,44 | +0,04 | −0,01 (−0,0) | +0 pe | – | +0,13 / −0,09  |
| Kortpass | 60 | 1,22–1,55 | −0,27 | −0,31 (−2,0) | −4 pe | – | −0,39 / −0,30 ✔ ⚑ |
| Blandat | 142 | 1,40–1,39 | +0,02 | −0,03 (−0,3) | +5 pe | – | +0,05 / −0,06  |
| Direktspel | 121 | 1,55–1,57 | +0,23 | +0,19 (+1,6) | −5 pe | – | +0,13 / +0,55 ✔ |
| Lågpress | 121 | 1,51–1,55 | −0,00 | −0,05 (−0,4) | −7 pe | – | −0,04 / −0,06 ✔ |
| Mellanpress | 127 | 1,33–1,56 | +0,04 | −0,01 (−0,1) | +1 pe | – | +0,11 / −0,11  |
| Högpress | 75 | 1,44–1,27 | +0,14 | +0,10 (+0,7) | +8 pe | – | +0,41 / −0,05  |

- Svårast mot **Kortpass** (−0,31 p/match rel. eget snitt, z −2,0, 60 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,19 p/match rel. eget snitt, z +1,6, 121 m) – åt samma håll i båda halvorna men svagt

### San Diego FC

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 59,7 %). 26 matcher med stil, mot marknaden totalt −0,22 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 10 | 1,70–1,60 | −0,23 | −0,01 (−0,0) | +6 pe | – | −0,07 / +0,01  |
| Balanserat | 9 | 1,11–1,56 | −0,37 | −0,16 (−0,3) | −12 pe | – | −0,20 / −0,06  |
| Bollinnehav | 7 | 2,43–2,00 | +0,00 | +0,22 (+0,7) | +22 pe | – | +0,11 / +0,37  |
| Kortpass | 20 | 1,85–1,50 | −0,11 | +0,11 (+0,4) | +2 pe | – | +0,04 / +0,17 ✔ |
| Blandat | 6 | 1,17–2,33 | −0,58 | −0,36 (−1,0) | +10 pe | – | −0,33 / −0,44  |
| Lågpress | 11 | 1,55–1,18 | −0,19 | +0,03 (+0,1) | −5 pe | – | −0,30 / +0,41  |
| Mellanpress | 10 | 1,90–2,00 | −0,12 | +0,10 (+0,3) | +27 pe | – | −0,18 / +0,28  |
| Högpress | 5 | 1,60–2,20 | −0,47 | −0,25 (−0,4) | −23 pe | – | +0,50 / −1,39  |

- Bäst mot **Kortpass** (+0,11 p/match rel. eget snitt, z +0,4, 20 m) – åt samma håll i båda halvorna men svagt

### San Jose Earthquakes

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 49,2 %). 313 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 118 | 1,36–1,91 | −0,13 | −0,02 (−0,2) | +1 pe | – | +0,01 / −0,05  |
| Balanserat | 111 | 1,41–1,71 | −0,14 | −0,03 (−0,3) | +2 pe | – | −0,18 / +0,16  |
| Bollinnehav | 84 | 1,54–1,89 | −0,04 | +0,07 (+0,5) | +2 pe | – | +0,15 / +0,00 ✔ |
| Kortpass | 60 | 1,73–1,78 | +0,13 | +0,24 (+1,4) | +3 pe | – | +1,07 / +0,09 ✔ |
| Blandat | 136 | 1,44–1,99 | −0,17 | −0,06 (−0,6) | +1 pe | – | −0,10 / −0,04 ✔ |
| Direktspel | 117 | 1,26–1,68 | −0,17 | −0,06 (−0,5) | +2 pe | – | −0,11 / +0,18  |
| Lågpress | 115 | 1,37–1,72 | −0,14 | −0,03 (−0,3) | +3 pe | – | −0,10 / +0,09  |
| Mellanpress | 125 | 1,49–1,86 | −0,02 | +0,09 (+0,8) | +5 pe | – | +0,02 / +0,15 ✔ |
| Högpress | 73 | 1,41–1,96 | −0,21 | −0,10 (−0,7) | −6 pe | – | +0,04 / −0,16  |

- Svårast mot **Högpress** (−0,10 p/match rel. eget snitt, z −0,7, 73 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,24 p/match rel. eget snitt, z +1,4, 60 m) – åt samma håll i båda halvorna men svagt

### Seattle Sounders

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 50,8 %). 334 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 122 | 1,52–1,21 | +0,05 | +0,02 (+0,2) | +1 pe | – | +0,24 / −0,18  |
| Balanserat | 119 | 1,49–1,11 | +0,08 | +0,05 (+0,4) | +3 pe | – | +0,10 / −0,01  |
| Bollinnehav | 93 | 1,51–1,28 | −0,05 | −0,09 (−0,7) | −0 pe | – | +0,08 / −0,25  |
| Kortpass | 64 | 1,52–1,34 | +0,00 | −0,03 (−0,2) | +5 pe | – | +0,38 / −0,12  |
| Blandat | 139 | 1,46–1,14 | +0,03 | −0,01 (−0,1) | +1 pe | – | +0,27 / −0,14  |
| Direktspel | 131 | 1,55–1,18 | +0,05 | +0,02 (+0,2) | −1 pe | – | +0,07 / −0,22  |
| Lågpress | 127 | 1,49–1,09 | +0,08 | +0,05 (+0,4) | −2 pe | – | +0,12 / −0,11  |
| Mellanpress | 125 | 1,46–1,26 | +0,00 | −0,03 (−0,3) | +7 pe | – | +0,28 / −0,27  |
| Högpress | 82 | 1,60–1,24 | +0,00 | −0,03 (−0,2) | −5 pe | – | −0,08 / −0,01 ✔ |

- Svårast mot **Bollinnehav** (−0,09 p/match rel. eget snitt, z −0,7, 93 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,05 p/match rel. eget snitt, z +0,4, 119 m) – inte stabilt, troligen slump

### Sporting Kansas City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 44,6 %). 315 matcher med stil, mot marknaden totalt −0,13 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 119 | 1,47–1,53 | −0,06 | +0,07 (+0,6) | −1 pe | – | +0,06 / +0,07 ✔ |
| Balanserat | 110 | 1,52–1,60 | −0,09 | +0,04 (+0,3) | −7 pe | – | +0,26 / −0,24  |
| Bollinnehav | 86 | 1,40–1,66 | −0,27 | −0,14 (−1,1) | +5 pe | – | −0,33 / +0,01  |
| Kortpass | 60 | 1,52–2,10 | +0,07 | +0,20 (+1,3) | −6 pe | – | +0,60 / +0,13 ✔ |
| Blandat | 137 | 1,39–1,59 | −0,28 | −0,15 (−1,5) | −4 pe | – | −0,18 / −0,13 ✔ |
| Direktspel | 118 | 1,53–1,33 | −0,06 | +0,07 (+0,6) | +4 pe | – | +0,12 / −0,14  |
| Lågpress | 117 | 1,56–1,43 | −0,09 | +0,04 (+0,3) | +1 pe | – | −0,02 / +0,19  |
| Mellanpress | 133 | 1,40–1,73 | −0,16 | −0,03 (−0,3) | −5 pe | – | +0,10 / −0,12  |
| Högpress | 65 | 1,45–1,60 | −0,14 | −0,01 (−0,1) | −0 pe | – | +0,20 / −0,08  |

- Svårast mot **Blandat** (−0,15 p/match rel. eget snitt, z −1,5, 137 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,20 p/match rel. eget snitt, z +1,3, 60 m) – åt samma håll i båda halvorna men svagt

### St. Louis City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 52,3 %). 92 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 30 | 1,33–1,73 | −0,09 | −0,03 (−0,1) | +3 pe | – | −0,32 / +0,30  |
| Balanserat | 34 | 1,59–1,76 | −0,08 | −0,01 (−0,1) | +8 pe | – | −0,24 / +0,19  |
| Bollinnehav | 28 | 1,57–1,54 | −0,02 | +0,05 (+0,2) | +7 pe | – | +0,02 / +0,07 ✔ |
| Kortpass | 40 | 1,60–1,48 | +0,16 | +0,22 (+1,1) | +0 pe | – | +0,44 / +0,14 ✔ |
| Blandat | 47 | 1,45–1,85 | −0,19 | −0,12 (−0,8) | +8 pe | – | −0,35 / +0,27  |
| Direktspel | 5 | 1,20–1,80 | −0,68 | −0,61 (−2,9) | +37 pe | – | −0,61 / –  |
| Lågpress | 28 | 1,64–1,54 | +0,18 | +0,25 (+1,0) | −3 pe | – | −0,29 / +0,43  |
| Mellanpress | 38 | 1,37–1,76 | −0,13 | −0,06 (−0,4) | +7 pe | – | −0,21 / +0,11  |
| Högpress | 26 | 1,54–1,73 | −0,24 | −0,18 (−0,9) | +15 pe | – | −0,13 / −0,28 ✔ |

- Svårast mot **Högpress** (−0,18 p/match rel. eget snitt, z −0,9, 26 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,22 p/match rel. eget snitt, z +1,1, 40 m) – åt samma håll i båda halvorna men svagt

### Toronto FC

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 45,1 %). 320 matcher med stil, mot marknaden totalt −0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,27–1,75 | −0,30 | −0,16 (−1,4) | +3 pe | – | −0,20 / −0,14 ✔ |
| Balanserat | 127 | 1,54–1,65 | −0,05 | +0,09 (+0,8) | −1 pe | – | +0,13 / +0,03 ✔ |
| Bollinnehav | 100 | 1,27–1,49 | −0,10 | +0,04 (+0,3) | +8 pe | – | +0,19 / −0,09  |
| Kortpass | 57 | 1,28–1,81 | −0,26 | −0,12 (−0,9) | +11 pe | – | −0,93 / −0,05 ✔ |
| Blandat | 134 | 1,25–1,71 | −0,23 | −0,10 (−1,0) | +4 pe | – | +0,02 / −0,18  |
| Direktspel | 129 | 1,55–1,47 | +0,02 | +0,15 (+1,4) | −2 pe | – | +0,15 / +0,18 ✔ |
| Lågpress | 101 | 1,52–1,39 | −0,03 | +0,11 (+0,9) | +1 pe | – | +0,20 / −0,12  |
| Mellanpress | 137 | 1,36–1,66 | −0,19 | −0,06 (−0,6) | +5 pe | – | −0,05 / −0,06 ✔ |
| Högpress | 82 | 1,21–1,88 | −0,17 | −0,04 (−0,3) | +2 pe | – | −0,00 / −0,06 ✔ |

- Svårast mot **Backar hem** (−0,16 p/match rel. eget snitt, z −1,4, 93 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,15 p/match rel. eget snitt, z +1,4, 129 m) – åt samma håll i båda halvorna men svagt

### Vancouver Whitecaps

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 56,4 %). 322 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,62–1,57 | +0,14 | −0,00 (−0,0) | −1 pe | – | +0,03 / −0,03  |
| Balanserat | 121 | 1,36–1,32 | +0,11 | −0,03 (−0,3) | +3 pe | – | +0,13 / −0,26  |
| Bollinnehav | 99 | 1,53–1,60 | +0,18 | +0,04 (+0,3) | −1 pe | – | −0,05 / +0,12  |
| Kortpass | 62 | 1,74–1,40 | +0,05 | −0,09 (−0,6) | −3 pe | – | +0,31 / −0,16  |
| Blandat | 135 | 1,47–1,38 | +0,21 | +0,07 (+0,7) | +4 pe | – | +0,04 / +0,09 ✔ |
| Direktspel | 125 | 1,40–1,64 | +0,11 | −0,03 (−0,3) | −1 pe | – | +0,04 / −0,38  |
| Lågpress | 114 | 1,50–1,33 | +0,14 | −0,00 (−0,0) | +0 pe | – | +0,16 / −0,33  |
| Mellanpress | 128 | 1,55–1,70 | +0,13 | −0,01 (−0,1) | +0 pe | – | −0,05 / +0,02  |
| Högpress | 80 | 1,39–1,36 | +0,16 | +0,02 (+0,2) | +1 pe | – | −0,04 / +0,05  |

- Svårast mot **Kortpass** (−0,09 p/match rel. eget snitt, z −0,6, 62 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,07 p/match rel. eget snitt, z +0,7, 135 m) – åt samma håll i båda halvorna men svagt
