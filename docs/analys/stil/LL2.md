# Stilmatchning – LaLiga 2 (LL2)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2197 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 240 m · hemma +0,07 · kryss −2 pe · ö2,5 +3 pe | 327 m · hemma +0,06 · kryss −4 pe · ö2,5 −4 pe | 168 m · hemma +0,03 · kryss +2 pe · ö2,5 −1 pe |
| **Mellan** | 324 m · hemma +0,12 · kryss +3 pe · ö2,5 +0 pe | 440 m · hemma +0,03 · kryss +1 pe · ö2,5 −0 pe | 225 m · hemma −0,07 · kryss +3 pe · ö2,5 −2 pe |
| **Mycket boll** | 170 m · hemma +0,09 · kryss −7 pe · ö2,5 +4 pe | 222 m · hemma −0,01 · kryss −3 pe · ö2,5 +6 pe | 81 m · hemma −0,11 · kryss −1 pe · ö2,5 −1 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 155 m · hemma +0,11 · kryss −0 pe · ö2,5 +2 pe | 294 m · hemma +0,08 · kryss −1 pe · ö2,5 +2 pe | 157 m · hemma +0,08 · kryss −2 pe · ö2,5 +1 pe |
| **Balanserat** | 293 m · hemma +0,01 · kryss −2 pe · ö2,5 +0 pe | 505 m · hemma +0,06 · kryss −0 pe · ö2,5 +1 pe | 264 m · hemma −0,06 · kryss +3 pe · ö2,5 −5 pe |
| **Bollinnehav** | 157 m · hemma +0,15 · kryss −3 pe · ö2,5 +3 pe | 266 m · hemma +0,00 · kryss −2 pe · ö2,5 −2 pe | 106 m · hemma −0,10 · kryss −1 pe · ö2,5 +3 pe |

## Lag (säsong 2026/27)

### Albacete

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 47,3 %). 177 matcher med stil, mot marknaden totalt −0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 46 | 0,96–1,24 | −0,13 | −0,08 (−0,4) | −2 pe | −2 pe | −0,07 / −0,09 ✔ |
| Balanserat | 86 | 0,99–1,36 | −0,12 | −0,06 (−0,4) | −7 pe | −3 pe | −0,30 / +0,21  |
| Bollinnehav | 45 | 1,33–1,27 | +0,14 | +0,20 (+1,1) | +0 pe | −1 pe | +0,32 / +0,10 ✔ |
| Kortpass | 39 | 1,41–1,36 | +0,11 | +0,16 (+0,8) | −4 pe | +0 pe | +0,18 / +0,16 ✔ |
| Blandat | 86 | 1,07–1,33 | −0,09 | −0,04 (−0,3) | +1 pe | −4 pe | −0,15 / +0,06  |
| Direktspel | 52 | 0,81–1,23 | −0,12 | −0,06 (−0,4) | −11 pe | −1 pe | −0,09 / +0,10  |
| Lågpress | 49 | 1,00–1,18 | −0,02 | +0,04 (+0,2) | −3 pe | −12 pe | −0,35 / +0,35  |
| Mellanpress | 94 | 1,07–1,27 | −0,02 | +0,04 (+0,3) | −3 pe | −3 pe | +0,06 / +0,02 ✔ |
| Högpress | 34 | 1,15–1,59 | −0,22 | −0,16 (−0,7) | −6 pe | +12 pe | −0,24 / −0,08 ✔ |

- Svårast mot **Högpress** (−0,16 p/match rel. eget snitt, z −0,7, 34 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,20 p/match rel. eget snitt, z +1,1, 45 m) – åt samma håll i båda halvorna men svagt

### Almeria

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 52,8 %). 249 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,54–1,32 | +0,02 | −0,03 (−0,2) | +8 pe | +16 pe | −0,02 / −0,04 ✔ |
| Balanserat | 118 | 1,47–1,25 | +0,06 | +0,01 (+0,1) | −8 pe | +5 pe | +0,15 / −0,18  |
| Bollinnehav | 63 | 1,35–1,40 | +0,08 | +0,02 (+0,2) | −1 pe | −3 pe | +0,13 / −0,07  |
| Kortpass | 41 | 1,46–1,56 | +0,06 | +0,00 (+0,0) | −4 pe | +3 pe | −0,06 / +0,01  |
| Blandat | 130 | 1,49–1,37 | +0,02 | −0,04 (−0,4) | −1 pe | +6 pe | +0,08 / −0,14  |
| Direktspel | 78 | 1,40–1,06 | +0,12 | +0,07 (+0,5) | −2 pe | +7 pe | +0,15 / −0,22  |
| Lågpress | 67 | 1,66–1,25 | +0,20 | +0,15 (+1,0) | −1 pe | +10 pe | +0,11 / +0,21 ✔ |
| Mellanpress | 112 | 1,54–1,14 | +0,13 | +0,07 (+0,7) | +0 pe | +5 pe | +0,24 / −0,11  |
| Högpress | 70 | 1,13–1,61 | −0,20 | −0,26 (−1,9) | −6 pe | +4 pe | −0,20 / −0,29 ✔ |

- Svårast mot **Högpress** (−0,26 p/match rel. eget snitt, z −1,9, 70 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,15 p/match rel. eget snitt, z +1,0, 67 m) – åt samma håll i båda halvorna men svagt

### Andorra

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 63,6 %). 40 matcher med stil, mot marknaden totalt −0,34 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 0,56–1,25 | −0,37 | −0,03 (−0,1) | +8 pe | −24 pe | +0,17 / −0,19  |
| Balanserat | 15 | 1,07–1,60 | −0,38 | −0,04 (−0,1) | −17 pe | −2 pe | −0,01 / −0,07 ✔ |
| Bollinnehav | 9 | 1,33–1,22 | −0,21 | +0,13 (+0,3) | −7 pe | +1 pe | −0,12 / +0,44  |
| Kortpass | 7 | 1,14–1,29 | −0,84 | −0,51 (−1,5) | +1 pe | −4 pe | −0,56 / −0,47  |
| Blandat | 23 | 1,04–1,74 | −0,43 | −0,09 (−0,4) | −8 pe | −3 pe | −0,16 / −0,02 ✔ |
| Direktspel | 10 | 0,50–0,60 | +0,23 | +0,57 (+1,7) | −0 pe | −30 pe | +0,81 / +0,33 ✔ |
| Lågpress | 1 | 3,00–2,00 | +1,92 | +2,25 (+22,5) | −28 pe | +52 pe | – / +2,25  |
| Mellanpress | 21 | 0,62–1,00 | −0,37 | −0,04 (−0,2) | +8 pe | −27 pe | −0,08 / +0,04  |
| Högpress | 18 | 1,17–1,78 | −0,42 | −0,08 (−0,3) | −17 pe | +6 pe | +0,22 / −0,27  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,4, 23 m) – åt samma håll i båda halvorna men svagt

### Burgos

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 49,4 %). 142 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 41 | 1,00–1,12 | +0,09 | −0,04 (−0,2) | −14 pe | +2 pe | −0,22 / +0,16  |
| Balanserat | 60 | 0,95–1,00 | +0,15 | +0,01 (+0,1) | +5 pe | −0 pe | −0,23 / +0,23  |
| Bollinnehav | 41 | 1,10–1,02 | +0,17 | +0,03 (+0,2) | −6 pe | +3 pe | +0,31 / −0,23  |
| Kortpass | 41 | 1,02–1,12 | +0,09 | −0,05 (−0,2) | −8 pe | −3 pe | −0,00 / −0,06 ✔ |
| Blandat | 77 | 1,00–0,88 | +0,29 | +0,16 (+1,2) | −3 pe | +1 pe | +0,13 / +0,19 ✔ |
| Direktspel | 24 | 1,00–1,42 | −0,29 | −0,43 (−1,8) | +1 pe | +11 pe | −0,53 / +0,08  |
| Lågpress | 29 | 1,00–1,03 | +0,19 | +0,05 (+0,2) | −10 pe | +1 pe | −0,31 / +0,14  |
| Mellanpress | 65 | 1,08–1,08 | +0,12 | −0,01 (−0,1) | +6 pe | +3 pe | −0,14 / +0,09  |
| Högpress | 48 | 0,92–1,00 | +0,13 | −0,01 (−0,1) | −12 pe | +0 pe | +0,01 / −0,08  |

- Svårast mot **Direktspel** (−0,43 p/match rel. eget snitt, z −1,8, 24 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,16 p/match rel. eget snitt, z +1,2, 77 m) – åt samma håll i båda halvorna men svagt

### Cadiz

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 52,3 %). 258 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 1,24–1,50 | +0,14 | +0,10 (+0,6) | −9 pe | +11 pe | −0,04 / +0,19  |
| Balanserat | 122 | 0,89–1,24 | +0,05 | +0,01 (+0,1) | +7 pe | −6 pe | +0,29 / −0,30  |
| Bollinnehav | 78 | 0,83–1,37 | −0,04 | −0,08 (−0,6) | +5 pe | −8 pe | −0,08 / −0,08 ✔ |
| Kortpass | 54 | 0,91–1,37 | −0,10 | −0,14 (−1,0) | +8 pe | −4 pe | +0,00 / −0,20  |
| Blandat | 136 | 1,00–1,43 | +0,03 | −0,01 (−0,1) | +3 pe | +0 pe | +0,05 / −0,06  |
| Direktspel | 68 | 0,90–1,13 | +0,18 | +0,14 (+0,9) | −1 pe | −8 pe | +0,20 / −0,15  |
| Lågpress | 73 | 0,92–1,25 | −0,13 | −0,17 (−1,5) | +13 pe | −1 pe | −0,23 / −0,09 ✔ |
| Mellanpress | 110 | 1,11–1,25 | +0,23 | +0,19 (+1,5) | −1 pe | −2 pe | +0,35 / −0,02  |
| Högpress | 75 | 0,76–1,55 | −0,07 | −0,11 (−0,9) | −2 pe | −6 pe | +0,06 / −0,20  |

- Svårast mot **Lågpress** (−0,17 p/match rel. eget snitt, z −1,5, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,19 p/match rel. eget snitt, z +1,5, 110 m) – inte stabilt, troligen slump

### Castellon

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 61,6 %). 37 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 9 | 1,56–1,00 | −0,33 | −0,40 (−1,1) | +11 pe | −22 pe | −0,63 / −0,22  |
| Balanserat | 19 | 1,32–0,95 | +0,04 | −0,03 (−0,1) | +0 pe | −11 pe | −0,25 / +0,21  |
| Bollinnehav | 9 | 1,78–1,11 | +0,54 | +0,47 (+1,0) | −15 pe | +13 pe | +0,66 / +0,32  |
| Kortpass | 13 | 1,69–1,15 | +0,36 | +0,29 (+0,7) | −19 pe | +1 pe | +0,53 / +0,00 ✔ |
| Blandat | 22 | 1,45–0,86 | +0,06 | −0,02 (−0,1) | +7 pe | −9 pe | −0,43 / +0,32  |
| Direktspel | 2 | 0,50–1,50 | −1,58 | −1,65 (−14,7) | +29 pe | −57 pe | −1,81 / −1,49  |
| Lågpress | 17 | 1,47–0,59 | +0,35 | +0,28 (+1,0) | −3 pe | −22 pe | −0,16 / +0,77  |
| Mellanpress | 14 | 1,64–1,21 | +0,07 | −0,00 (−0,0) | +11 pe | +3 pe | +0,20 / −0,21  |
| Högpress | 6 | 1,17–1,67 | −0,71 | −0,79 (−1,5) | −24 pe | +7 pe | −1,20 / −0,59  |

- Svårast mot **Balanserat** (−0,03 p/match rel. eget snitt, z −0,1, 19 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,28 p/match rel. eget snitt, z +1,0, 17 m) – inte stabilt, troligen slump

### Ceuta

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 49,8 %). 6 matcher med stil, mot marknaden totalt −0,31 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 1,00–3,00 | −0,75 | −0,44 (−4,4) | −25 pe | +53 pe | – / −0,44  |
| Balanserat | 3 | 1,33–1,67 | +0,30 | +0,61 (+1,1) | +7 pe | +16 pe | −0,27 / +1,05  |
| Bollinnehav | 2 | 0,50–3,50 | −1,01 | −0,70 (−3,7) | −25 pe | −5 pe | −0,70 / –  |
| Kortpass | 3 | 0,33–3,33 | −0,87 | −0,56 (−3,2) | −24 pe | +11 pe | −0,56 / –  |
| Blandat | 3 | 1,67–1,67 | +0,25 | +0,56 (+0,9) | +6 pe | +20 pe | – / +0,56  |
| Lågpress | 1 | 0,00–3,00 | −0,58 | −0,27 (−2,7) | −20 pe | +42 pe | −0,27 / –  |
| Mellanpress | 2 | 0,50–2,50 | −1,01 | −0,70 (−3,7) | −26 pe | −2 pe | −0,97 / −0,44  |
| Högpress | 3 | 1,67–2,33 | +0,25 | +0,56 (+0,9) | +6 pe | +18 pe | −0,44 / +1,05  |

### Cordoba

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 57,2 %). 40 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 10 | 1,90–1,50 | +0,10 | +0,11 (+0,2) | −7 pe | +38 pe | +0,79 / −0,35  |
| Balanserat | 21 | 1,14–1,43 | −0,13 | −0,12 (−0,5) | +1 pe | −3 pe | +0,11 / −0,33  |
| Bollinnehav | 9 | 1,33–1,67 | +0,15 | +0,16 (+0,3) | −16 pe | +26 pe | −0,26 / +1,00  |
| Kortpass | 15 | 1,60–1,60 | +0,25 | +0,26 (+0,7) | −7 pe | +28 pe | −0,07 / +0,76  |
| Blandat | 23 | 1,17–1,43 | −0,16 | −0,16 (−0,6) | −1 pe | +1 pe | +0,52 / −0,68  |
| Direktspel | 2 | 2,00–1,50 | −0,18 | −0,17 (−0,1) | −28 pe | +52 pe | −1,82 / +1,48  |
| Lågpress | 18 | 1,33–1,28 | +0,12 | +0,13 (+0,4) | +0 pe | +11 pe | +0,55 / −0,40  |
| Mellanpress | 18 | 1,28–1,50 | −0,06 | −0,06 (−0,2) | −11 pe | +10 pe | −0,23 / +0,12  |
| Högpress | 4 | 2,00–2,50 | −0,33 | −0,32 (−0,6) | −2 pe | +44 pe | −0,64 / −0,21  |

- Svårast mot **Blandat** (−0,16 p/match rel. eget snitt, z −0,6, 23 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,26 p/match rel. eget snitt, z +0,7, 15 m) – inte stabilt, troligen slump

### Eibar

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 40,2 %). 282 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,19–1,10 | +0,11 | +0,04 (+0,3) | −6 pe | +3 pe | −0,05 / +0,12  |
| Balanserat | 120 | 1,26–1,16 | +0,09 | +0,02 (+0,2) | +4 pe | +4 pe | −0,08 / +0,13  |
| Bollinnehav | 74 | 1,04–1,16 | −0,01 | −0,08 (−0,6) | +4 pe | −11 pe | −0,07 / −0,08 ✔ |
| Kortpass | 50 | 1,08–0,88 | +0,16 | +0,09 (+0,6) | +13 pe | −13 pe | +0,35 / +0,00 ✔ |
| Blandat | 134 | 1,21–1,25 | −0,02 | −0,09 (−0,9) | −1 pe | +2 pe | −0,28 / +0,06  |
| Direktspel | 98 | 1,19–1,13 | +0,15 | +0,08 (+0,6) | −3 pe | +3 pe | +0,03 / +0,19 ✔ |
| Lågpress | 75 | 1,21–1,19 | +0,10 | +0,03 (+0,2) | −4 pe | +8 pe | −0,23 / +0,40  |
| Mellanpress | 141 | 1,14–1,18 | +0,02 | −0,06 (−0,6) | +3 pe | −3 pe | −0,01 / −0,12 ✔ |
| Högpress | 66 | 1,23–1,02 | +0,16 | +0,08 (+0,6) | +0 pe | −2 pe | +0,06 / +0,09 ✔ |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,9, 134 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,08 p/match rel. eget snitt, z +0,6, 98 m) – åt samma håll i båda halvorna men svagt

### Girona

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 49,9 %). 293 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,20–1,27 | +0,02 | +0,01 (+0,1) | −2 pe | −3 pe | −0,01 / +0,03  |
| Balanserat | 137 | 1,37–1,28 | +0,01 | −0,01 (−0,1) | −4 pe | +3 pe | −0,02 / +0,01  |
| Bollinnehav | 70 | 1,34–1,31 | +0,02 | +0,01 (+0,1) | −5 pe | +3 pe | −0,22 / +0,21  |
| Kortpass | 52 | 1,25–1,44 | −0,18 | −0,20 (−1,3) | +4 pe | +1 pe | −0,66 / −0,14 ✔ |
| Blandat | 141 | 1,45–1,33 | +0,15 | +0,14 (+1,3) | −4 pe | +4 pe | +0,07 / +0,19 ✔ |
| Direktspel | 100 | 1,15–1,14 | −0,07 | −0,09 (−0,7) | −8 pe | −3 pe | −0,13 / +0,05  |
| Lågpress | 75 | 1,00–1,29 | −0,22 | −0,24 (−1,7) | +1 pe | −4 pe | −0,25 / −0,22 ✔ |
| Mellanpress | 134 | 1,25–1,30 | +0,02 | −0,00 (−0,0) | −6 pe | −2 pe | +0,06 / −0,08  |
| Högpress | 84 | 1,69–1,26 | +0,23 | +0,21 (+1,6) | −5 pe | +11 pe | −0,10 / +0,34  |

- Svårast mot **Lågpress** (−0,24 p/match rel. eget snitt, z −1,7, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +1,6, 84 m) – inte stabilt, troligen slump

### Granada

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Lågpress** (faktiskt bollinnehav 51,1 %). 261 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 1,29–1,27 | +0,16 | +0,17 (+1,2) | −1 pe | +2 pe | +0,24 / +0,10 ✔ |
| Balanserat | 107 | 1,23–1,59 | −0,24 | −0,24 (−2,3) | −5 pe | +9 pe | +0,00 / −0,47  |
| Bollinnehav | 76 | 1,17–1,43 | +0,16 | +0,16 (+1,2) | −0 pe | −0 pe | +0,26 / +0,05 ✔ |
| Kortpass | 60 | 1,10–1,32 | −0,06 | −0,06 (−0,4) | −6 pe | −3 pe | −0,02 / −0,07 ✔ |
| Blandat | 119 | 1,33–1,61 | −0,06 | −0,05 (−0,5) | +3 pe | +10 pe | +0,25 / −0,28  |
| Direktspel | 82 | 1,20–1,32 | +0,11 | +0,12 (+0,9) | −7 pe | +2 pe | +0,11 / +0,12 ✔ |
| Lågpress | 69 | 1,29–1,43 | −0,02 | −0,01 (−0,1) | −3 pe | +12 pe | +0,03 / −0,06  |
| Mellanpress | 111 | 1,23–1,51 | +0,02 | +0,03 (+0,3) | +1 pe | +3 pe | +0,20 / −0,19  |
| Högpress | 81 | 1,20–1,37 | −0,04 | −0,03 (−0,3) | −5 pe | −0 pe | +0,19 / −0,16  |

- Svårast mot **Balanserat** (−0,24 p/match rel. eget snitt, z −2,3, 107 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,17 p/match rel. eget snitt, z +1,2, 78 m) – åt samma håll i båda halvorna men svagt

### Las Palmas

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 54,4 %). 257 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,14–1,39 | −0,07 | −0,17 (−1,2) | +0 pe | +6 pe | −0,01 / −0,29 ✔ |
| Balanserat | 136 | 1,12–0,97 | +0,22 | +0,12 (+1,2) | +2 pe | −8 pe | +0,21 / +0,02 ✔ |
| Bollinnehav | 50 | 1,24–1,28 | −0,00 | −0,09 (−0,6) | +5 pe | −6 pe | −0,12 / −0,07 ✔ |
| Kortpass | 43 | 1,12–1,16 | +0,22 | +0,13 (+0,7) | −1 pe | −14 pe | +0,24 / +0,11 ✔ |
| Blandat | 120 | 1,08–1,14 | +0,08 | −0,02 (−0,2) | +1 pe | −6 pe | +0,24 / −0,21  |
| Direktspel | 94 | 1,24–1,15 | +0,06 | −0,04 (−0,3) | +4 pe | +4 pe | −0,02 / −0,10 ✔ |
| Lågpress | 66 | 1,29–1,15 | +0,17 | +0,08 (+0,6) | +2 pe | −2 pe | +0,21 / −0,13  |
| Mellanpress | 112 | 1,03–1,13 | +0,04 | −0,05 (−0,5) | +6 pe | −5 pe | +0,01 / −0,11  |
| Högpress | 79 | 1,20–1,18 | +0,10 | +0,01 (+0,0) | −4 pe | −3 pe | +0,12 / −0,07  |

- Svårast mot **Backar hem** (−0,17 p/match rel. eget snitt, z −1,2, 71 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,12 p/match rel. eget snitt, z +1,2, 136 m) – åt samma håll i båda halvorna men svagt

### Leganes

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 43,9 %). 282 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 0,87–0,95 | −0,06 | −0,04 (−0,3) | +10 pe | −6 pe | −0,22 / +0,12  |
| Balanserat | 132 | 1,08–1,23 | +0,01 | +0,03 (+0,2) | −5 pe | +4 pe | −0,02 / +0,08  |
| Bollinnehav | 72 | 1,03–1,03 | −0,02 | −0,01 (−0,0) | +4 pe | −3 pe | −0,03 / +0,02  |
| Kortpass | 49 | 0,92–1,20 | −0,17 | −0,15 (−0,9) | −6 pe | −9 pe | −0,52 / −0,08 ✔ |
| Blandat | 129 | 1,12–1,07 | +0,09 | +0,11 (+1,1) | +1 pe | +3 pe | +0,09 / +0,13 ✔ |
| Direktspel | 104 | 0,92–1,10 | −0,09 | −0,07 (−0,6) | +5 pe | −1 pe | −0,16 / +0,16  |
| Lågpress | 65 | 1,23–1,09 | +0,08 | +0,10 (+0,7) | +6 pe | +3 pe | +0,13 / +0,05 ✔ |
| Mellanpress | 141 | 0,95–1,16 | −0,01 | +0,01 (+0,1) | −1 pe | −2 pe | +0,02 / −0,00  |
| Högpress | 76 | 0,93–1,01 | −0,13 | −0,11 (−0,8) | +1 pe | −2 pe | −0,69 / +0,19  |

- Svårast mot **Kortpass** (−0,15 p/match rel. eget snitt, z −0,9, 49 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,11 p/match rel. eget snitt, z +1,1, 129 m) – åt samma håll i båda halvorna men svagt

### Mallorca

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 54,4 %). 267 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 0,97–1,32 | +0,01 | −0,02 (−0,1) | −3 pe | +0 pe | +0,09 / −0,12  |
| Balanserat | 116 | 0,97–1,17 | +0,00 | −0,02 (−0,2) | −0 pe | −3 pe | +0,02 / −0,07  |
| Bollinnehav | 73 | 1,19–1,41 | +0,08 | +0,06 (+0,4) | −10 pe | +5 pe | +0,03 / +0,09 ✔ |
| Kortpass | 59 | 1,14–1,56 | −0,18 | −0,21 (−1,4) | −6 pe | +13 pe | −0,73 / −0,06 ✔ |
| Blandat | 126 | 0,90–1,16 | +0,04 | +0,01 (+0,1) | −1 pe | −7 pe | +0,11 / −0,07  |
| Direktspel | 82 | 1,15–1,27 | +0,15 | +0,13 (+0,9) | −6 pe | +1 pe | +0,13 / +0,12 ✔ |
| Lågpress | 61 | 1,02–1,15 | +0,11 | +0,09 (+0,6) | −3 pe | −0 pe | +0,28 / −0,16  |
| Mellanpress | 121 | 0,98–1,39 | −0,08 | −0,10 (−1,0) | −8 pe | −4 pe | −0,09 / −0,12 ✔ |
| Högpress | 85 | 1,12–1,22 | +0,11 | +0,08 (+0,7) | +1 pe | +6 pe | +0,06 / +0,10 ✔ |

- Svårast mot **Kortpass** (−0,21 p/match rel. eget snitt, z −1,4, 59 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +0,9, 82 m) – åt samma håll i båda halvorna men svagt

### Oviedo

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 51,1 %). 248 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 0,89–1,04 | −0,23 | −0,29 (−2,2) | +4 pe | −7 pe | −0,40 / −0,22 ✔ ⚑ |
| Balanserat | 117 | 1,20–1,05 | +0,24 | +0,18 (+1,7) | +3 pe | +2 pe | +0,10 / +0,30 ✔ |
| Bollinnehav | 60 | 1,28–1,27 | +0,04 | −0,02 (−0,1) | −0 pe | +11 pe | −0,03 / −0,01 ✔ |
| Kortpass | 48 | 1,27–1,17 | +0,23 | +0,17 (+1,0) | +0 pe | +4 pe | −0,29 / +0,24  |
| Blandat | 120 | 1,20–1,07 | +0,21 | +0,16 (+1,4) | −0 pe | +2 pe | +0,42 / −0,08  |
| Direktspel | 80 | 0,94–1,11 | −0,28 | −0,34 (−2,9) | +8 pe | −1 pe | −0,42 / −0,05 ✔ ⚑ |
| Lågpress | 74 | 1,08–1,15 | +0,02 | −0,04 (−0,3) | −1 pe | −1 pe | +0,08 / −0,18  |
| Mellanpress | 108 | 1,28–1,13 | +0,10 | +0,04 (+0,4) | +8 pe | +5 pe | −0,09 / +0,17  |
| Högpress | 66 | 0,94–1,00 | +0,03 | −0,03 (−0,2) | −3 pe | −1 pe | −0,09 / +0,02  |

- Svårast mot **Direktspel** (−0,34 p/match rel. eget snitt, z −2,9, 80 m) – ⚑ håller i båda halvorna
- Bäst mot **Balanserat** (+0,18 p/match rel. eget snitt, z +1,7, 117 m) – åt samma håll i båda halvorna men svagt

### Sociedad B

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 39,3 %). 6 matcher med stil, mot marknaden totalt +0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 2 | 2,00–1,50 | +1,09 | +0,94 (+1,2) | +23 pe | +53 pe | +0,94 / –  |
| Balanserat | 2 | 0,00–1,00 | −0,99 | −1,15 (−16,2) | −26 pe | −53 pe | −1,07 / −1,22  |
| Bollinnehav | 2 | 2,00–2,00 | +0,37 | +0,21 (+0,2) | −26 pe | +48 pe | – / +0,21  |
| Kortpass | 4 | 1,00–1,50 | −0,31 | −0,47 (−0,7) | −26 pe | −3 pe | −1,07 / −0,27  |
| Blandat | 2 | 2,00–1,50 | +1,09 | +0,94 (+1,2) | +23 pe | +53 pe | +0,94 / –  |
| Lågpress | 1 | 0,00–1,00 | −1,06 | −1,22 (−12,2) | −27 pe | −49 pe | – / −1,22  |
| Mellanpress | 1 | 2,00–2,00 | +0,01 | −0,14 (−1,4) | +71 pe | +57 pe | −0,14 / –  |
| Högpress | 4 | 1,50–1,50 | +0,50 | +0,34 (+0,4) | −26 pe | +22 pe | +0,47 / +0,21  |

### Sp Gijon

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 50,6 %). 242 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 67 | 1,15–0,96 | +0,02 | +0,10 (+0,7) | +7 pe | −0 pe | −0,09 / +0,23  |
| Balanserat | 115 | 1,06–1,06 | −0,05 | +0,04 (+0,3) | −1 pe | −3 pe | −0,03 / +0,12  |
| Bollinnehav | 60 | 1,18–1,25 | −0,27 | −0,18 (−1,2) | −5 pe | −1 pe | −0,27 / −0,11 ✔ |
| Kortpass | 39 | 1,23–1,13 | −0,01 | +0,08 (+0,4) | +1 pe | −3 pe | −0,03 / +0,10  |
| Blandat | 117 | 1,21–1,26 | −0,18 | −0,10 (−0,9) | −3 pe | +4 pe | −0,27 / +0,03  |
| Direktspel | 86 | 0,93–0,81 | +0,01 | +0,10 (+0,7) | +4 pe | −9 pe | +0,03 / +0,31 ✔ |
| Lågpress | 64 | 1,02–1,03 | −0,07 | +0,01 (+0,1) | +1 pe | −13 pe | +0,04 / −0,03  |
| Mellanpress | 115 | 1,11–1,06 | −0,14 | −0,06 (−0,5) | −2 pe | +1 pe | −0,14 / +0,02  |
| Högpress | 63 | 1,22–1,16 | +0,02 | +0,10 (+0,7) | +4 pe | +4 pe | −0,19 / +0,31  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,2, 60 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,10 p/match rel. eget snitt, z +0,7, 86 m) – åt samma håll i båda halvorna men svagt

### Valladolid

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 49,8 %). 261 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 1,10–1,32 | +0,05 | +0,10 (+0,8) | −9 pe | +2 pe | +0,23 / −0,01  |
| Balanserat | 109 | 0,99–1,50 | −0,11 | −0,06 (−0,6) | −1 pe | +2 pe | +0,04 / −0,16  |
| Bollinnehav | 73 | 1,01–1,45 | −0,07 | −0,02 (−0,1) | +9 pe | −6 pe | +0,05 / −0,09  |
| Kortpass | 55 | 0,95–1,76 | −0,21 | −0,15 (−1,1) | −3 pe | +1 pe | −0,10 / −0,17 ✔ |
| Blandat | 120 | 0,97–1,49 | −0,09 | −0,04 (−0,4) | +0 pe | −2 pe | +0,02 / −0,08  |
| Direktspel | 86 | 1,17–1,14 | +0,10 | +0,15 (+1,2) | +0 pe | +1 pe | +0,19 / +0,02 ✔ |
| Lågpress | 60 | 0,98–1,43 | −0,21 | −0,15 (−1,2) | −6 pe | +0 pe | −0,13 / −0,18 ✔ |
| Mellanpress | 134 | 1,05–1,45 | −0,04 | +0,02 (+0,2) | +2 pe | +1 pe | +0,17 / −0,14  |
| Högpress | 67 | 1,03–1,40 | +0,05 | +0,10 (+0,8) | +0 pe | −4 pe | +0,17 / +0,05 ✔ |

- Svårast mot **Lågpress** (−0,15 p/match rel. eget snitt, z −1,2, 60 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,15 p/match rel. eget snitt, z +1,2, 86 m) – åt samma håll i båda halvorna men svagt
