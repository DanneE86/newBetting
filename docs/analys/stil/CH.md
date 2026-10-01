# Stilmatchning – Championship (CH)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 4247 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 526 m · hemma +0,03 · kryss +1 pe · ö2,5 −3 pe | 629 m · hemma −0,05 · kryss −2 pe · ö2,5 +2 pe | 379 m · hemma −0,10 · kryss +1 pe · ö2,5 +0 pe |
| **Mellan** | 631 m · hemma −0,02 · kryss −1 pe · ö2,5 +1 pe | 632 m · hemma +0,02 · kryss −2 pe · ö2,5 +1 pe | 417 m · hemma −0,03 · kryss −0 pe · ö2,5 −2 pe |
| **Mycket boll** | 378 m · hemma +0,03 · kryss +1 pe · ö2,5 +1 pe | 418 m · hemma −0,00 · kryss −2 pe · ö2,5 −5 pe | 237 m · hemma +0,12 · kryss −3 pe · ö2,5 +5 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 370 m · hemma −0,02 · kryss +0 pe · ö2,5 −4 pe | 576 m · hemma −0,03 · kryss −1 pe · ö2,5 −1 pe | 349 m · hemma −0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Balanserat** | 574 m · hemma −0,03 · kryss −1 pe · ö2,5 −2 pe | 756 m · hemma −0,03 · kryss +0 pe · ö2,5 +1 pe | 502 m · hemma +0,06 · kryss −2 pe · ö2,5 +3 pe |
| **Bollinnehav** | 351 m · hemma +0,08 · kryss +2 pe · ö2,5 −2 pe | 501 m · hemma −0,01 · kryss −3 pe · ö2,5 +0 pe | 268 m · hemma −0,00 · kryss −2 pe · ö2,5 −0 pe |

## Lag (säsong 2026/27)

### Birmingham

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress** (faktiskt bollinnehav 48,2 %). 364 matcher med stil, mot marknaden totalt −0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 111 | 1,14–1,20 | −0,03 | +0,04 (+0,3) | +1 pe | −8 pe | −0,11 / +0,20  |
| Balanserat | 151 | 1,13–1,27 | −0,11 | −0,05 (−0,5) | +2 pe | +1 pe | +0,03 / −0,12  |
| Bollinnehav | 102 | 1,32–1,52 | −0,04 | +0,03 (+0,3) | +1 pe | +6 pe | −0,19 / +0,25  |
| Kortpass | 103 | 1,32–1,42 | −0,09 | −0,03 (−0,3) | +2 pe | +5 pe | −0,18 / +0,01  |
| Blandat | 143 | 1,24–1,33 | +0,01 | +0,08 (+0,7) | −4 pe | +4 pe | +0,02 / +0,14 ✔ |
| Direktspel | 118 | 1,01–1,22 | −0,13 | −0,07 (−0,6) | +8 pe | −10 pe | −0,13 / +0,11  |
| Lågpress | 115 | 1,36–1,44 | +0,03 | +0,09 (+0,8) | −2 pe | +15 pe | −0,09 / +0,39  |
| Mellanpress | 129 | 1,10–1,33 | −0,19 | −0,12 (−1,3) | +8 pe | −6 pe | −0,19 / −0,05 ✔ |
| Högpress | 120 | 1,12–1,18 | −0,02 | +0,05 (+0,4) | −2 pe | −9 pe | +0,15 / −0,01  |

- Svårast mot **Mellanpress** (−0,12 p/match rel. eget snitt, z −1,3, 129 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,09 p/match rel. eget snitt, z +0,8, 115 m) – inte stabilt, troligen slump

### Blackburn

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 51,5 %). 324 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,25–1,22 | −0,07 | −0,04 (−0,4) | +4 pe | −3 pe | +0,03 / −0,13  |
| Balanserat | 140 | 1,21–1,17 | −0,02 | +0,01 (+0,1) | −5 pe | −4 pe | +0,02 / +0,01 ✔ |
| Bollinnehav | 82 | 1,24–1,37 | +0,01 | +0,04 (+0,2) | −8 pe | +6 pe | +0,09 / −0,01  |
| Kortpass | 107 | 1,15–1,28 | −0,02 | +0,00 (+0,0) | −4 pe | −3 pe | +0,07 / −0,01  |
| Blandat | 125 | 1,22–1,30 | −0,07 | −0,04 (−0,4) | −5 pe | +3 pe | −0,01 / −0,09 ✔ |
| Direktspel | 92 | 1,35–1,09 | +0,03 | +0,06 (+0,4) | +1 pe | −4 pe | +0,07 / +0,00 ✔ |
| Lågpress | 78 | 1,28–1,09 | +0,01 | +0,04 (+0,2) | −6 pe | −7 pe | +0,02 / +0,07 ✔ |
| Mellanpress | 132 | 1,21–1,26 | −0,13 | −0,10 (−1,0) | −1 pe | +1 pe | +0,10 / −0,30  |
| Högpress | 114 | 1,23–1,31 | +0,07 | +0,10 (+0,8) | −2 pe | +1 pe | −0,02 / +0,18  |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −1,0, 132 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,8, 114 m) – inte stabilt, troligen slump

### Bolton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 51,1 %). 322 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 111 | 1,31–1,23 | −0,12 | −0,15 (−1,3) | +7 pe | −5 pe | −0,08 / −0,19 ✔ |
| Balanserat | 130 | 1,42–1,27 | +0,09 | +0,06 (+0,6) | −7 pe | +1 pe | +0,16 / −0,06  |
| Bollinnehav | 81 | 1,43–1,27 | +0,13 | +0,10 (+0,7) | −8 pe | −6 pe | +0,04 / +0,18 ✔ |
| Kortpass | 68 | 1,62–1,24 | +0,18 | +0,16 (+1,0) | −11 pe | −1 pe | +0,08 / +0,19 ✔ |
| Blandat | 141 | 1,29–1,20 | −0,04 | −0,07 (−0,7) | +3 pe | −8 pe | +0,03 / −0,15  |
| Direktspel | 113 | 1,35–1,34 | +0,01 | −0,01 (−0,1) | −5 pe | +2 pe | +0,08 / −0,21  |
| Lågpress | 94 | 1,14–1,30 | −0,12 | −0,14 (−1,2) | +5 pe | −9 pe | −0,08 / −0,24 ✔ |
| Mellanpress | 117 | 1,35–1,25 | −0,00 | −0,03 (−0,2) | −4 pe | −4 pe | +0,09 / −0,13  |
| Högpress | 111 | 1,62–1,23 | +0,18 | +0,15 (+1,2) | −7 pe | +4 pe | +0,20 / +0,11 ✔ |

- Svårast mot **Backar hem** (−0,15 p/match rel. eget snitt, z −1,3, 111 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,15 p/match rel. eget snitt, z +1,2, 111 m) – åt samma håll i båda halvorna men svagt

### Bristol City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 44,7 %). 364 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 116 | 1,23–1,35 | +0,09 | +0,04 (+0,3) | −4 pe | +0 pe | +0,10 / −0,03  |
| Balanserat | 148 | 1,16–1,37 | −0,12 | −0,17 (−1,7) | −0 pe | −4 pe | −0,22 / −0,13 ✔ |
| Bollinnehav | 100 | 1,32–1,23 | +0,26 | +0,21 (+1,6) | −3 pe | −2 pe | +0,26 / +0,15 ✔ |
| Kortpass | 109 | 1,20–1,20 | +0,14 | +0,09 (+0,8) | +2 pe | −9 pe | +0,30 / +0,04 ✔ |
| Blandat | 137 | 1,30–1,41 | −0,02 | −0,07 (−0,7) | −2 pe | +4 pe | −0,16 / +0,03  |
| Direktspel | 118 | 1,16–1,35 | +0,05 | +0,00 (+0,0) | −6 pe | −3 pe | +0,11 / −0,34  |
| Lågpress | 100 | 1,21–1,32 | +0,07 | +0,02 (+0,2) | −5 pe | −5 pe | +0,11 / −0,14  |
| Mellanpress | 144 | 1,33–1,33 | +0,05 | +0,00 (+0,0) | +0 pe | +0 pe | +0,07 / −0,06  |
| Högpress | 120 | 1,11–1,32 | +0,02 | −0,03 (−0,2) | −3 pe | −3 pe | −0,19 / +0,07  |

- Svårast mot **Balanserat** (−0,17 p/match rel. eget snitt, z −1,7, 148 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,21 p/match rel. eget snitt, z +1,6, 100 m) – åt samma håll i båda halvorna men svagt

### Burnley

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 49,8 %). 328 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,25–1,26 | +0,12 | +0,01 (+0,1) | +3 pe | +1 pe | −0,05 / +0,05  |
| Balanserat | 143 | 1,15–1,36 | +0,13 | +0,02 (+0,3) | +2 pe | −8 pe | +0,08 / −0,04  |
| Bollinnehav | 81 | 1,28–1,49 | +0,05 | −0,06 (−0,5) | +4 pe | +5 pe | −0,08 / −0,03 ✔ |
| Kortpass | 88 | 1,31–1,24 | +0,10 | −0,01 (−0,1) | +5 pe | −4 pe | +0,34 / −0,08  |
| Blandat | 134 | 1,17–1,38 | +0,10 | −0,01 (−0,2) | +4 pe | −3 pe | −0,10 / +0,07  |
| Direktspel | 106 | 1,20–1,44 | +0,14 | +0,03 (+0,2) | −1 pe | +1 pe | +0,03 / +0,02 ✔ |
| Lågpress | 91 | 1,07–1,53 | −0,08 | −0,19 (−1,6) | +2 pe | +5 pe | −0,11 / −0,41 ✔ |
| Mellanpress | 125 | 1,27–1,36 | +0,16 | +0,05 (+0,6) | −0 pe | −4 pe | +0,11 / −0,00  |
| Högpress | 112 | 1,28–1,23 | +0,20 | +0,09 (+0,9) | +7 pe | −5 pe | +0,02 / +0,12 ✔ |

- Svårast mot **Lågpress** (−0,19 p/match rel. eget snitt, z −1,6, 91 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,09 p/match rel. eget snitt, z +0,9, 112 m) – åt samma håll i båda halvorna men svagt

### Cardiff

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 64,8 %). 362 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 114 | 1,37–1,42 | +0,15 | +0,15 (+1,3) | −6 pe | +5 pe | +0,08 / +0,22 ✔ |
| Balanserat | 153 | 1,24–1,29 | −0,02 | −0,02 (−0,2) | +0 pe | −1 pe | +0,04 / −0,08  |
| Bollinnehav | 95 | 1,09–1,49 | −0,15 | −0,15 (−1,3) | −6 pe | −0 pe | −0,06 / −0,26 ✔ |
| Kortpass | 92 | 1,22–1,50 | −0,14 | −0,14 (−1,2) | −2 pe | −0 pe | −0,45 / −0,06 ✔ |
| Blandat | 156 | 1,24–1,34 | −0,03 | −0,03 (−0,3) | −5 pe | −2 pe | +0,08 / −0,13  |
| Direktspel | 114 | 1,26–1,36 | +0,16 | +0,16 (+1,3) | −3 pe | +6 pe | +0,07 / +0,47 ✔ |
| Lågpress | 93 | 1,22–1,53 | −0,23 | −0,22 (−1,8) | −7 pe | +5 pe | −0,17 / −0,37 ✔ |
| Mellanpress | 153 | 1,39–1,33 | +0,12 | +0,12 (+1,2) | −3 pe | +2 pe | +0,12 / +0,12 ✔ |
| Högpress | 116 | 1,07–1,35 | +0,02 | +0,02 (+0,2) | −1 pe | −4 pe | +0,15 / −0,05  |

- Svårast mot **Lågpress** (−0,22 p/match rel. eget snitt, z −1,8, 93 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,16 p/match rel. eget snitt, z +1,3, 114 m) – åt samma håll i båda halvorna men svagt

### Charlton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 38,0 %). 284 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 1,41–1,14 | +0,13 | +0,13 (+1,0) | +3 pe | −4 pe | +0,07 / +0,17 ✔ |
| Balanserat | 107 | 1,42–1,33 | −0,03 | −0,03 (−0,3) | +4 pe | +7 pe | −0,03 / −0,04 ✔ |
| Bollinnehav | 85 | 1,12–1,29 | −0,09 | −0,09 (−0,7) | −2 pe | −8 pe | −0,18 / +0,01  |
| Kortpass | 87 | 1,17–1,18 | +0,10 | +0,10 (+0,7) | −5 pe | −7 pe | −0,05 / +0,16  |
| Blandat | 109 | 1,40–1,41 | −0,09 | −0,10 (−0,8) | +4 pe | +11 pe | −0,20 / +0,01  |
| Direktspel | 88 | 1,39–1,14 | +0,03 | +0,02 (+0,2) | +7 pe | −10 pe | +0,08 / −0,10  |
| Lågpress | 76 | 1,30–1,37 | +0,09 | +0,09 (+0,7) | +4 pe | −2 pe | −0,15 / +0,27  |
| Mellanpress | 106 | 1,22–1,24 | −0,10 | −0,10 (−0,8) | +1 pe | −2 pe | −0,01 / −0,23 ✔ |
| Högpress | 102 | 1,46–1,20 | +0,04 | +0,04 (+0,3) | +1 pe | +0 pe | −0,04 / +0,10  |

- Svårast mot **Blandat** (−0,10 p/match rel. eget snitt, z −0,8, 109 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,13 p/match rel. eget snitt, z +1,0, 92 m) – åt samma håll i båda halvorna men svagt

### Derby

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 49,3 %). 364 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 110 | 1,22–1,22 | −0,17 | −0,17 (−1,5) | +0 pe | +2 pe | −0,12 / −0,23 ✔ |
| Balanserat | 156 | 1,37–1,08 | +0,14 | +0,14 (+1,3) | −7 pe | −1 pe | +0,06 / +0,20 ✔ |
| Bollinnehav | 98 | 1,15–1,27 | −0,02 | −0,03 (−0,2) | +1 pe | −0 pe | −0,04 / −0,02 ✔ |
| Kortpass | 98 | 1,23–1,28 | +0,10 | +0,10 (+0,8) | −7 pe | +4 pe | +0,22 / +0,07 ✔ |
| Blandat | 144 | 1,26–1,22 | −0,06 | −0,06 (−0,6) | −4 pe | +3 pe | −0,07 / −0,05 ✔ |
| Direktspel | 122 | 1,30–1,02 | −0,01 | −0,01 (−0,1) | +3 pe | −6 pe | −0,03 / +0,04  |
| Lågpress | 109 | 1,13–1,37 | −0,14 | −0,14 (−1,2) | −4 pe | −3 pe | −0,07 / −0,25 ✔ |
| Mellanpress | 149 | 1,41–1,10 | +0,09 | +0,08 (+0,8) | −2 pe | +2 pe | +0,05 / +0,12 ✔ |
| Högpress | 106 | 1,20–1,07 | +0,03 | +0,02 (+0,2) | −2 pe | +0 pe | −0,04 / +0,07  |

- Svårast mot **Backar hem** (−0,17 p/match rel. eget snitt, z −1,5, 110 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,14 p/match rel. eget snitt, z +1,3, 156 m) – åt samma håll i båda halvorna men svagt

### Lincoln

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress** (faktiskt bollinnehav 35,7 %). 284 matcher med stil, mot marknaden totalt +0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,41–1,13 | +0,05 | −0,10 (−0,8) | −5 pe | +2 pe | −0,16 / −0,06 ✔ |
| Balanserat | 108 | 1,31–0,97 | +0,19 | +0,04 (+0,3) | +8 pe | −4 pe | −0,23 / +0,33  |
| Bollinnehav | 80 | 1,49–1,15 | +0,23 | +0,07 (+0,5) | −4 pe | +0 pe | +0,10 / +0,05 ✔ |
| Kortpass | 81 | 1,43–1,06 | +0,25 | +0,09 (+0,7) | +2 pe | −3 pe | −0,27 / +0,27  |
| Blandat | 111 | 1,49–1,11 | +0,23 | +0,08 (+0,7) | −1 pe | −2 pe | +0,04 / +0,10 ✔ |
| Direktspel | 92 | 1,25–1,04 | −0,02 | −0,17 (−1,3) | +2 pe | +2 pe | −0,16 / −0,21 ✔ |
| Lågpress | 68 | 1,51–1,10 | +0,27 | +0,11 (+0,7) | +5 pe | −3 pe | −0,03 / +0,24  |
| Mellanpress | 114 | 1,40–1,17 | +0,08 | −0,08 (−0,7) | −1 pe | +3 pe | −0,08 / −0,08 ✔ |
| Högpress | 102 | 1,30–0,95 | +0,17 | +0,02 (+0,1) | −0 pe | −4 pe | −0,20 / +0,20  |

- Svårast mot **Direktspel** (−0,17 p/match rel. eget snitt, z −1,3, 92 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,11 p/match rel. eget snitt, z +0,7, 68 m) – inte stabilt, troligen slump

### Middlesbrough

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 60,2 %). 364 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 106 | 1,19–1,18 | −0,19 | −0,12 (−0,9) | −3 pe | −2 pe | −0,08 / −0,16 ✔ |
| Balanserat | 160 | 1,54–1,13 | +0,06 | +0,13 (+1,2) | −3 pe | −0 pe | +0,22 / +0,04 ✔ |
| Bollinnehav | 98 | 1,37–1,28 | −0,14 | −0,08 (−0,6) | −4 pe | +6 pe | −0,34 / +0,24  |
| Kortpass | 107 | 1,57–1,27 | −0,00 | +0,06 (+0,5) | −1 pe | +3 pe | −0,36 / +0,17  |
| Blandat | 139 | 1,34–1,23 | −0,13 | −0,06 (−0,6) | −4 pe | +3 pe | +0,02 / −0,15  |
| Direktspel | 118 | 1,29–1,05 | −0,05 | +0,02 (+0,2) | −3 pe | −4 pe | +0,00 / +0,06 ✔ |
| Lågpress | 105 | 1,29–1,13 | −0,00 | +0,06 (+0,5) | −1 pe | −0 pe | +0,04 / +0,11 ✔ |
| Mellanpress | 143 | 1,45–1,23 | −0,14 | −0,08 (−0,7) | −1 pe | +2 pe | −0,06 / −0,09 ✔ |
| Högpress | 116 | 1,41–1,17 | −0,03 | +0,04 (+0,3) | −7 pe | +0 pe | −0,11 / +0,12  |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,13 p/match rel. eget snitt, z +1,2, 160 m) – åt samma håll i båda halvorna men svagt

### Millwall

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 44,0 %). 364 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 99 | 1,18–0,97 | +0,12 | +0,04 (+0,4) | +6 pe | −6 pe | +0,03 / +0,06 ✔ |
| Balanserat | 164 | 1,16–1,23 | +0,04 | −0,04 (−0,4) | −2 pe | −2 pe | +0,02 / −0,09  |
| Bollinnehav | 101 | 1,15–1,21 | +0,09 | +0,02 (+0,1) | −3 pe | −1 pe | −0,34 / +0,43  |
| Kortpass | 115 | 1,10–1,12 | +0,21 | +0,14 (+1,1) | −6 pe | −4 pe | +0,03 / +0,16 ✔ |
| Blandat | 139 | 1,17–1,31 | −0,02 | −0,10 (−0,9) | +0 pe | +1 pe | −0,14 / −0,05 ✔ |
| Direktspel | 110 | 1,21–0,99 | +0,06 | −0,02 (−0,2) | +7 pe | −6 pe | −0,06 / +0,14  |
| Lågpress | 108 | 1,22–1,19 | +0,06 | −0,02 (−0,2) | −2 pe | +0 pe | −0,06 / +0,06  |
| Mellanpress | 140 | 1,19–1,21 | +0,02 | −0,05 (−0,5) | +3 pe | +1 pe | −0,19 / +0,07  |
| Högpress | 116 | 1,07–1,04 | +0,16 | +0,08 (+0,7) | −1 pe | −11 pe | +0,04 / +0,11 ✔ |

- Svårast mot **Blandat** (−0,10 p/match rel. eget snitt, z −0,9, 139 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,14 p/match rel. eget snitt, z +1,1, 115 m) – åt samma håll i båda halvorna men svagt

### Norwich

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress** (faktiskt bollinnehav 53,0 %). 354 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 109 | 1,29–1,35 | −0,01 | +0,01 (+0,1) | −8 pe | +1 pe | +0,05 / −0,04  |
| Balanserat | 165 | 1,42–1,44 | +0,03 | +0,05 (+0,6) | −1 pe | +1 pe | +0,03 / +0,08 ✔ |
| Bollinnehav | 80 | 1,46–1,54 | −0,15 | −0,12 (−0,9) | −2 pe | +5 pe | +0,16 / −0,34  |
| Kortpass | 108 | 1,39–1,44 | −0,20 | −0,18 (−1,6) | +0 pe | +1 pe | +0,12 / −0,24  |
| Blandat | 127 | 1,35–1,58 | +0,02 | +0,05 (+0,4) | −2 pe | +4 pe | −0,13 / +0,23  |
| Direktspel | 119 | 1,44–1,26 | +0,09 | +0,11 (+1,0) | −7 pe | +0 pe | +0,18 / −0,15  |
| Lågpress | 101 | 1,32–1,55 | +0,04 | +0,07 (+0,6) | −2 pe | +4 pe | +0,05 / +0,10 ✔ |
| Mellanpress | 139 | 1,40–1,55 | −0,16 | −0,14 (−1,3) | −4 pe | +4 pe | −0,08 / −0,19 ✔ |
| Högpress | 114 | 1,46–1,18 | +0,09 | +0,11 (+1,0) | −2 pe | −2 pe | +0,32 / −0,01  |

- Svårast mot **Kortpass** (−0,18 p/match rel. eget snitt, z −1,6, 108 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,11 p/match rel. eget snitt, z +1,0, 119 m) – inte stabilt, troligen slump

### Portsmouth

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Mellanpress** (faktiskt bollinnehav 53,6 %). 283 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 85 | 1,33–1,09 | +0,10 | +0,04 (+0,3) | +1 pe | +1 pe | −0,18 / +0,21  |
| Balanserat | 121 | 1,43–1,33 | +0,08 | +0,02 (+0,2) | −6 pe | +7 pe | −0,05 / +0,09  |
| Bollinnehav | 77 | 1,32–1,09 | −0,03 | −0,08 (−0,7) | +15 pe | −3 pe | −0,03 / −0,17 ✔ |
| Kortpass | 97 | 1,23–1,44 | −0,08 | −0,13 (−1,1) | +6 pe | +2 pe | −0,52 / +0,02  |
| Blandat | 105 | 1,42–1,11 | +0,14 | +0,09 (+0,8) | +2 pe | +2 pe | +0,16 / +0,02 ✔ |
| Direktspel | 81 | 1,48–1,00 | +0,10 | +0,04 (+0,3) | −4 pe | +2 pe | −0,09 / +0,41  |
| Lågpress | 71 | 1,10–1,31 | −0,24 | −0,30 (−2,4) | +17 pe | +2 pe | −0,30 / −0,30 ✔ ⚑ |
| Mellanpress | 120 | 1,40–1,09 | +0,05 | −0,01 (−0,1) | −4 pe | −2 pe | −0,04 / +0,02  |
| Högpress | 92 | 1,54–1,24 | +0,30 | +0,24 (+1,9) | −3 pe | +9 pe | +0,05 / +0,42 ✔ |

- Svårast mot **Lågpress** (−0,30 p/match rel. eget snitt, z −2,4, 71 m) – ⚑ håller i båda halvorna
- Bäst mot **Högpress** (+0,24 p/match rel. eget snitt, z +1,9, 92 m) – åt samma håll i båda halvorna men svagt

### Preston

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 43,6 %). 364 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 114 | 1,16–1,27 | +0,01 | −0,01 (−0,1) | −4 pe | −2 pe | −0,25 / +0,28  |
| Balanserat | 151 | 1,14–1,42 | −0,01 | −0,04 (−0,4) | +5 pe | +8 pe | +0,14 / −0,19  |
| Bollinnehav | 99 | 1,11–1,27 | +0,10 | +0,07 (+0,6) | −3 pe | +2 pe | −0,04 / +0,19  |
| Kortpass | 113 | 1,12–1,42 | −0,02 | −0,05 (−0,4) | +3 pe | +10 pe | −0,15 / −0,03 ✔ |
| Blandat | 136 | 1,15–1,35 | +0,13 | +0,10 (+0,9) | −4 pe | +3 pe | +0,07 / +0,15 ✔ |
| Direktspel | 115 | 1,13–1,22 | −0,05 | −0,08 (−0,6) | +0 pe | −2 pe | −0,12 / +0,06  |
| Lågpress | 106 | 1,11–1,41 | −0,16 | −0,19 (−1,5) | +1 pe | +1 pe | −0,14 / −0,28 ✔ |
| Mellanpress | 138 | 1,15–1,18 | +0,12 | +0,09 (+0,9) | +5 pe | −0 pe | −0,06 / +0,24  |
| Högpress | 120 | 1,14–1,44 | +0,08 | +0,06 (+0,5) | −7 pe | +9 pe | +0,14 / +0,01 ✔ |

- Svårast mot **Lågpress** (−0,19 p/match rel. eget snitt, z −1,5, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +0,9, 136 m) – åt samma håll i båda halvorna men svagt

### QPR

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 50,5 %). 364 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 113 | 1,33–1,39 | +0,05 | +0,02 (+0,1) | +3 pe | +5 pe | +0,28 / −0,28  |
| Balanserat | 157 | 1,24–1,40 | +0,07 | +0,04 (+0,3) | −8 pe | +6 pe | −0,00 / +0,08  |
| Bollinnehav | 94 | 0,99–1,44 | −0,04 | −0,08 (−0,6) | −6 pe | +2 pe | −0,14 / −0,02 ✔ |
| Kortpass | 106 | 1,10–1,40 | +0,01 | −0,03 (−0,2) | +1 pe | +1 pe | −0,39 / +0,06  |
| Blandat | 140 | 1,14–1,38 | +0,03 | −0,00 (−0,0) | −4 pe | +6 pe | +0,12 / −0,13  |
| Direktspel | 118 | 1,36–1,45 | +0,07 | +0,03 (+0,2) | −8 pe | +6 pe | +0,11 / −0,21  |
| Lågpress | 103 | 1,24–1,46 | −0,12 | −0,16 (−1,3) | −3 pe | +6 pe | −0,20 / −0,08 ✔ |
| Mellanpress | 143 | 1,22–1,34 | +0,15 | +0,11 (+1,0) | −6 pe | +4 pe | +0,27 / −0,03  |
| Högpress | 118 | 1,14–1,44 | +0,05 | +0,01 (+0,1) | −2 pe | +4 pe | +0,15 / −0,07  |

- Svårast mot **Lågpress** (−0,16 p/match rel. eget snitt, z −1,3, 103 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,11 p/match rel. eget snitt, z +1,0, 143 m) – inte stabilt, troligen slump

### Sheffield United

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 39,9 %). 346 matcher med stil, mot marknaden totalt +0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 98 | 1,19–1,38 | −0,09 | −0,10 (−0,8) | −10 pe | −5 pe | −0,05 / −0,15 ✔ |
| Balanserat | 155 | 1,26–1,22 | +0,02 | +0,01 (+0,1) | −5 pe | −5 pe | −0,09 / +0,10  |
| Bollinnehav | 93 | 1,27–1,25 | +0,11 | +0,10 (+0,8) | −5 pe | −1 pe | +0,25 / −0,06  |
| Kortpass | 100 | 1,37–1,19 | −0,00 | −0,02 (−0,1) | −5 pe | +1 pe | +0,40 / −0,09  |
| Blandat | 132 | 1,25–1,32 | +0,12 | +0,10 (+1,0) | −7 pe | −2 pe | +0,12 / +0,08 ✔ |
| Direktspel | 114 | 1,12–1,29 | −0,09 | −0,10 (−0,9) | −8 pe | −11 pe | −0,14 / +0,03  |
| Lågpress | 100 | 1,26–1,16 | −0,07 | −0,08 (−0,7) | −5 pe | −5 pe | +0,03 / −0,34  |
| Mellanpress | 130 | 1,17–1,19 | +0,01 | +0,00 (+0,0) | −8 pe | −3 pe | −0,07 / +0,08  |
| Högpress | 116 | 1,31–1,46 | +0,08 | +0,07 (+0,6) | −6 pe | −4 pe | +0,11 / +0,05 ✔ |

- Svårast mot **Direktspel** (−0,10 p/match rel. eget snitt, z −0,9, 114 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +1,0, 132 m) – åt samma håll i båda halvorna men svagt

### Southampton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 58,8 %). 328 matcher med stil, mot marknaden totalt −0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,51–1,50 | −0,03 | +0,06 (+0,5) | +2 pe | +4 pe | −0,06 / +0,17  |
| Balanserat | 142 | 1,18–1,72 | −0,11 | −0,03 (−0,3) | −5 pe | +4 pe | +0,13 / −0,21  |
| Bollinnehav | 90 | 1,37–1,78 | −0,10 | −0,02 (−0,2) | +2 pe | +5 pe | +0,01 / −0,04  |
| Kortpass | 89 | 1,54–1,78 | −0,05 | +0,04 (+0,3) | −0 pe | +14 pe | +0,27 / −0,00  |
| Blandat | 131 | 1,21–1,63 | −0,15 | −0,06 (−0,6) | +2 pe | −3 pe | +0,12 / −0,23  |
| Direktspel | 108 | 1,31–1,64 | −0,05 | +0,04 (+0,3) | −5 pe | +7 pe | −0,05 / +0,38  |
| Lågpress | 95 | 1,41–1,74 | −0,01 | +0,07 (+0,6) | −3 pe | +9 pe | +0,03 / +0,17 ✔ |
| Mellanpress | 131 | 1,40–1,46 | −0,02 | +0,07 (+0,6) | +1 pe | +5 pe | +0,13 / −0,01  |
| Högpress | 102 | 1,16–1,88 | −0,24 | −0,15 (−1,4) | −2 pe | −0 pe | −0,14 / −0,16 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,4, 102 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,07 p/match rel. eget snitt, z +0,6, 131 m) – inte stabilt, troligen slump

### Stoke

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,5 %). 364 matcher med stil, mot marknaden totalt −0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 111 | 0,99–1,20 | −0,27 | −0,11 (−1,1) | +2 pe | −9 pe | −0,04 / −0,19 ✔ |
| Balanserat | 152 | 1,19–1,23 | −0,14 | +0,02 (+0,2) | −4 pe | −1 pe | −0,07 / +0,10  |
| Bollinnehav | 101 | 1,12–1,30 | −0,07 | +0,09 (+0,7) | +1 pe | +0 pe | +0,05 / +0,13 ✔ |
| Kortpass | 110 | 1,19–1,31 | +0,04 | +0,20 (+1,7) | −2 pe | −3 pe | +0,09 / +0,22 ✔ |
| Blandat | 140 | 1,21–1,24 | −0,11 | +0,05 (+0,5) | −4 pe | +2 pe | +0,14 / −0,05  |
| Direktspel | 114 | 0,91–1,17 | −0,41 | −0,25 (−2,4) | +3 pe | −10 pe | −0,20 / −0,43 ✔ ⚑ |
| Lågpress | 103 | 1,16–1,16 | −0,08 | +0,08 (+0,7) | +1 pe | −1 pe | +0,07 / +0,12 ✔ |
| Mellanpress | 143 | 1,12–1,28 | −0,19 | −0,03 (−0,3) | −4 pe | −4 pe | −0,08 / +0,02  |
| Högpress | 118 | 1,06–1,26 | −0,20 | −0,04 (−0,3) | +1 pe | −4 pe | −0,08 / −0,02 ✔ |

- Svårast mot **Direktspel** (−0,25 p/match rel. eget snitt, z −2,4, 114 m) – ⚑ håller i båda halvorna
- Bäst mot **Kortpass** (+0,20 p/match rel. eget snitt, z +1,7, 110 m) – åt samma håll i båda halvorna men svagt

### Swansea

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 59,8 %). 364 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 116 | 1,37–1,09 | +0,16 | +0,08 (+0,7) | −2 pe | +1 pe | +0,18 / −0,04  |
| Balanserat | 160 | 1,28–1,40 | +0,01 | −0,07 (−0,7) | +0 pe | +7 pe | −0,07 / −0,06 ✔ |
| Bollinnehav | 88 | 1,23–1,24 | +0,09 | +0,01 (+0,1) | −7 pe | −2 pe | −0,09 / +0,14  |
| Kortpass | 102 | 1,24–1,47 | −0,00 | −0,08 (−0,6) | −5 pe | +3 pe | −0,33 / −0,02 ✔ |
| Blandat | 141 | 1,20–1,30 | −0,08 | −0,15 (−1,5) | −1 pe | +3 pe | −0,19 / −0,12 ✔ |
| Direktspel | 121 | 1,46–1,04 | +0,32 | +0,24 (+2,1) | −2 pe | +2 pe | +0,23 / +0,28 ✔ ⚑ |
| Lågpress | 105 | 1,35–1,29 | +0,05 | −0,02 (−0,2) | +2 pe | +5 pe | −0,21 / +0,33  |
| Mellanpress | 139 | 1,20–1,19 | +0,05 | −0,03 (−0,2) | −7 pe | +3 pe | +0,13 / −0,19  |
| Högpress | 120 | 1,36–1,32 | +0,12 | +0,05 (+0,4) | −1 pe | +1 pe | +0,16 / −0,01  |

- Svårast mot **Blandat** (−0,15 p/match rel. eget snitt, z −1,5, 141 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,24 p/match rel. eget snitt, z +2,1, 121 m) – ⚑ håller i båda halvorna

### Watford

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 46,1 %). 352 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 107 | 1,21–1,24 | −0,10 | −0,05 (−0,4) | +1 pe | −4 pe | +0,05 / −0,16  |
| Balanserat | 159 | 1,14–1,38 | −0,05 | +0,01 (+0,1) | +3 pe | −1 pe | +0,08 / −0,06  |
| Bollinnehav | 86 | 1,21–1,48 | −0,01 | +0,04 (+0,3) | −10 pe | +6 pe | −0,04 / +0,13  |
| Kortpass | 113 | 1,15–1,40 | −0,01 | +0,04 (+0,4) | −6 pe | +4 pe | +0,22 / +0,00 ✔ |
| Blandat | 129 | 1,06–1,45 | −0,29 | −0,24 (−2,4) | +5 pe | −5 pe | −0,25 / −0,22 ✔ ⚑ |
| Direktspel | 110 | 1,35–1,23 | +0,18 | +0,23 (+2,0) | −3 pe | +2 pe | +0,23 / +0,25 ✔ ⚑ |
| Lågpress | 100 | 1,04–1,41 | −0,19 | −0,13 (−1,2) | +2 pe | −4 pe | −0,19 / −0,02 ✔ |
| Mellanpress | 140 | 1,16–1,46 | −0,08 | −0,02 (−0,2) | −0 pe | +1 pe | +0,10 / −0,15  |
| Högpress | 112 | 1,32–1,20 | +0,09 | +0,15 (+1,3) | −4 pe | +2 pe | +0,35 / +0,04 ✔ |

- Svårast mot **Blandat** (−0,24 p/match rel. eget snitt, z −2,4, 129 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +2,0, 110 m) – ⚑ håller i båda halvorna

### West Brom

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 53,1 %). 356 matcher med stil, mot marknaden totalt −0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 98 | 1,20–1,12 | −0,26 | −0,16 (−1,4) | +10 pe | −7 pe | −0,14 / −0,18 ✔ |
| Balanserat | 159 | 1,33–1,22 | −0,04 | +0,05 (+0,5) | −3 pe | −4 pe | +0,00 / +0,10 ✔ |
| Bollinnehav | 99 | 1,46–1,25 | −0,02 | +0,08 (+0,6) | +4 pe | +1 pe | +0,07 / +0,09 ✔ |
| Kortpass | 103 | 1,17–1,14 | −0,15 | −0,06 (−0,5) | +1 pe | −5 pe | −0,02 / −0,06 ✔ |
| Blandat | 143 | 1,37–1,14 | +0,02 | +0,12 (+1,2) | +3 pe | −4 pe | +0,08 / +0,16 ✔ |
| Direktspel | 110 | 1,43–1,35 | −0,19 | −0,10 (−0,8) | +5 pe | −1 pe | −0,11 / −0,06 ✔ |
| Lågpress | 104 | 1,58–1,22 | +0,03 | +0,12 (+1,0) | +1 pe | +2 pe | +0,14 / +0,09 ✔ |
| Mellanpress | 140 | 1,25–1,20 | −0,16 | −0,07 (−0,7) | +5 pe | −2 pe | −0,10 / −0,04 ✔ |
| Högpress | 112 | 1,21–1,19 | −0,12 | −0,02 (−0,2) | +2 pe | −11 pe | −0,16 / +0,05  |

- Svårast mot **Backar hem** (−0,16 p/match rel. eget snitt, z −1,4, 98 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,12 p/match rel. eget snitt, z +1,2, 143 m) – åt samma håll i båda halvorna men svagt

### West Ham

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 57,2 %). 312 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 99 | 1,47–1,49 | +0,09 | +0,03 (+0,2) | −2 pe | +3 pe | +0,19 / −0,09  |
| Balanserat | 127 | 1,36–1,61 | +0,01 | −0,05 (−0,5) | +0 pe | −1 pe | −0,06 / −0,03 ✔ |
| Bollinnehav | 86 | 1,40–1,51 | +0,09 | +0,04 (+0,3) | −5 pe | +1 pe | +0,18 / −0,10  |
| Kortpass | 80 | 1,41–1,63 | −0,03 | −0,09 (−0,7) | +5 pe | −1 pe | −0,12 / −0,09 ✔ |
| Blandat | 131 | 1,39–1,50 | +0,12 | +0,06 (+0,5) | −8 pe | +4 pe | +0,17 / −0,04  |
| Direktspel | 101 | 1,43–1,53 | +0,05 | −0,00 (−0,0) | −0 pe | −1 pe | +0,02 / −0,11  |
| Lågpress | 83 | 1,39–1,46 | +0,07 | +0,02 (+0,1) | −7 pe | −3 pe | +0,01 / +0,02 ✔ |
| Mellanpress | 115 | 1,52–1,51 | +0,12 | +0,06 (+0,5) | −1 pe | +6 pe | +0,18 / −0,11  |
| Högpress | 114 | 1,31–1,64 | −0,01 | −0,07 (−0,7) | +0 pe | −1 pe | −0,06 / −0,08 ✔ |

- Svårast mot **Kortpass** (−0,09 p/match rel. eget snitt, z −0,7, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,06 p/match rel. eget snitt, z +0,5, 131 m) – inte stabilt, troligen slump

### Wolves

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 53,4 %). 311 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 99 | 1,04–1,37 | −0,02 | −0,04 (−0,4) | +3 pe | −9 pe | −0,01 / −0,06 ✔ |
| Balanserat | 131 | 1,05–1,47 | −0,03 | −0,05 (−0,5) | −9 pe | −2 pe | −0,02 / −0,11 ✔ |
| Bollinnehav | 81 | 1,33–1,51 | +0,17 | +0,14 (+1,0) | −0 pe | +4 pe | +0,21 / +0,06 ✔ |
| Kortpass | 80 | 1,29–1,86 | −0,02 | −0,04 (−0,3) | −9 pe | +14 pe | +0,13 / −0,08  |
| Blandat | 131 | 1,02–1,29 | +0,12 | +0,09 (+0,9) | −1 pe | −12 pe | +0,16 / +0,03 ✔ |
| Direktspel | 100 | 1,12–1,33 | −0,06 | −0,09 (−0,7) | −1 pe | −3 pe | −0,06 / −0,19 ✔ |
| Lågpress | 79 | 1,03–1,10 | +0,05 | +0,02 (+0,2) | +6 pe | −15 pe | −0,01 / +0,11  |
| Mellanpress | 118 | 1,11–1,42 | +0,08 | +0,05 (+0,5) | −1 pe | −3 pe | +0,11 / −0,02  |
| Högpress | 114 | 1,20–1,73 | −0,05 | −0,07 (−0,6) | −11 pe | +6 pe | +0,01 / −0,10  |

- Svårast mot **Direktspel** (−0,09 p/match rel. eget snitt, z −0,7, 100 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,14 p/match rel. eget snitt, z +1,0, 81 m) – åt samma håll i båda halvorna men svagt

### Wrexham

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 48,3 %). 100 matcher med stil, mot marknaden totalt +0,28 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 30 | 1,53–1,07 | +0,50 | +0,21 (+0,9) | −7 pe | +1 pe | +0,03 / +0,58 ✔ |
| Balanserat | 37 | 1,57–1,08 | +0,48 | +0,19 (+1,0) | −3 pe | +4 pe | +0,55 / +0,02 ✔ |
| Bollinnehav | 33 | 1,24–1,18 | −0,13 | −0,41 (−2,2) | +15 pe | −3 pe | −0,24 / −0,62 ✔ ⚑ |
| Kortpass | 61 | 1,39–1,28 | +0,05 | −0,24 (−1,6) | +8 pe | +1 pe | −0,14 / −0,31 ✔ |
| Blandat | 30 | 1,50–0,83 | +0,72 | +0,44 (+2,1) | −1 pe | −3 pe | +0,38 / +0,50 ✔ ⚑ |
| Direktspel | 9 | 1,67–0,89 | +0,44 | +0,16 (+0,3) | −28 pe | +11 pe | −0,01 / +1,53  |
| Lågpress | 34 | 1,53–1,56 | +0,15 | −0,14 (−0,6) | +6 pe | +10 pe | −0,16 / −0,13 ✔ |
| Mellanpress | 34 | 1,53–1,00 | +0,50 | +0,22 (+1,1) | −1 pe | +0 pe | +0,60 / −0,04  |
| Högpress | 32 | 1,28–0,75 | +0,19 | −0,09 (−0,4) | +1 pe | −9 pe | −0,15 / +0,15  |

- Svårast mot **Bollinnehav** (−0,41 p/match rel. eget snitt, z −2,2, 33 m) – ⚑ håller i båda halvorna
- Bäst mot **Blandat** (+0,44 p/match rel. eget snitt, z +2,1, 30 m) – ⚑ håller i båda halvorna
