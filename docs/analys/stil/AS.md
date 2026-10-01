# Stilmatchning – Allsvenskan (AS)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1492 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 103 m · hemma +0,07 · kryss +3 pe · ö2,5 – | 161 m · hemma −0,17 · kryss −2 pe · ö2,5 – | 164 m · hemma −0,00 · kryss +0 pe · ö2,5 – |
| **Mellan** | 160 m · hemma −0,08 · kryss +2 pe · ö2,5 – | 163 m · hemma −0,05 · kryss −1 pe · ö2,5 – | 202 m · hemma −0,16 · kryss +3 pe · ö2,5 – |
| **Mycket boll** | 168 m · hemma −0,02 · kryss −2 pe · ö2,5 – | 201 m · hemma −0,16 · kryss −7 pe · ö2,5 – | 170 m · hemma +0,15 · kryss +4 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 161 m · hemma +0,01 · kryss +0 pe · ö2,5 – | 197 m · hemma −0,11 · kryss +0 pe · ö2,5 – | 164 m · hemma +0,03 · kryss +4 pe · ö2,5 – |
| **Balanserat** | 198 m · hemma −0,14 · kryss +2 pe · ö2,5 – | 187 m · hemma +0,07 · kryss −1 pe · ö2,5 – | 156 m · hemma −0,12 · kryss −5 pe · ö2,5 – |
| **Bollinnehav** | 165 m · hemma −0,03 · kryss −1 pe · ö2,5 – | 156 m · hemma −0,12 · kryss −6 pe · ö2,5 – | 108 m · hemma −0,09 · kryss +3 pe · ö2,5 – |

## Lag (säsong 2026)

### AIK

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 53,5 %). 219 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,49–1,10 | +0,13 | +0,05 (+0,4) | −2 pe | – | +0,43 / −0,25  |
| Balanserat | 81 | 1,19–1,15 | +0,03 | −0,04 (−0,3) | −8 pe | – | −0,11 / +0,06  |
| Bollinnehav | 69 | 1,26–1,03 | +0,06 | −0,01 (−0,0) | +8 pe | – | +0,11 / −0,10  |
| Kortpass | 57 | 1,37–1,11 | +0,22 | +0,15 (+0,9) | +7 pe | – | +0,16 / +0,15 ✔ |
| Blandat | 88 | 1,28–1,31 | −0,22 | −0,29 (−2,1) | −3 pe | – | −0,22 / −0,38 ✔ ⚑ |
| Direktspel | 74 | 1,28–0,84 | +0,30 | +0,23 (+1,7) | −3 pe | – | +0,42 / −0,16  |
| Lågpress | 60 | 1,28–0,85 | +0,21 | +0,14 (+0,9) | +3 pe | – | +0,16 / +0,02 ✔ |
| Mellanpress | 85 | 1,19–1,18 | −0,16 | −0,23 (−1,7) | +7 pe | – | −0,09 / −0,42 ✔ |
| Högpress | 74 | 1,46–1,20 | +0,22 | +0,15 (+1,0) | −12 pe | – | +0,78 / +0,05 ✔ |

- Svårast mot **Blandat** (−0,29 p/match rel. eget snitt, z −2,1, 88 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +1,7, 74 m) – inte stabilt, troligen slump

### Brommapojkarna

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,9 %). 70 matcher med stil, mot marknaden totalt −0,21 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 26 | 1,38–1,42 | −0,07 | +0,14 (+0,6) | +5 pe | – | +0,12 / +0,17 ✔ |
| Balanserat | 24 | 1,29–2,13 | −0,28 | −0,07 (−0,3) | −3 pe | – | −0,42 / +0,18  |
| Bollinnehav | 20 | 1,30–1,90 | −0,32 | −0,11 (−0,4) | +2 pe | – | +0,14 / −0,48  |
| Kortpass | 36 | 1,14–1,83 | −0,18 | +0,03 (+0,2) | −2 pe | – | +0,01 / +0,05 ✔ |
| Blandat | 30 | 1,43–1,67 | −0,26 | −0,05 (−0,2) | +5 pe | – | +0,02 / −0,15  |
| Direktspel | 4 | 2,25–2,50 | −0,14 | +0,07 (+0,1) | +0 pe | – | −0,50 / +1,78  |
| Lågpress | 10 | 1,50–1,70 | +0,17 | +0,38 (+0,7) | −24 pe | – | +2,36 / −0,12  |
| Mellanpress | 28 | 1,25–1,68 | −0,29 | −0,07 (−0,4) | +1 pe | – | −0,33 / +0,07  |
| Högpress | 32 | 1,34–1,94 | −0,27 | −0,05 (−0,3) | +9 pe | – | −0,10 / +0,07  |

- Svårast mot **Bollinnehav** (−0,11 p/match rel. eget snitt, z −0,4, 20 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,14 p/match rel. eget snitt, z +0,6, 26 m) – åt samma håll i båda halvorna men svagt

### Degerfors

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,7 %). 69 matcher med stil, mot marknaden totalt −0,21 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 29 | 1,03–1,69 | −0,20 | +0,00 (+0,0) | +10 pe | – | −0,03 / +0,05  |
| Balanserat | 19 | 0,89–2,16 | −0,13 | +0,08 (+0,3) | −13 pe | – | +0,17 / −0,00  |
| Bollinnehav | 21 | 0,71–1,95 | −0,29 | −0,08 (−0,3) | −4 pe | – | +0,01 / −0,13  |
| Kortpass | 24 | 0,67–1,67 | −0,30 | −0,10 (−0,4) | −8 pe | – | +0,05 / −0,14  |
| Blandat | 21 | 1,10–1,81 | −0,09 | +0,11 (+0,5) | −1 pe | – | +0,16 / +0,06 ✔ |
| Direktspel | 24 | 0,96–2,21 | −0,21 | −0,00 (−0,0) | +8 pe | – | −0,06 / +0,12  |
| Lågpress | 7 | 0,71–1,14 | −0,12 | +0,08 (+0,2) | −26 pe | – | – / +0,08  |
| Mellanpress | 25 | 1,08–1,92 | −0,19 | +0,02 (+0,1) | −4 pe | – | +0,24 / −0,13  |
| Högpress | 37 | 0,81–2,03 | −0,23 | −0,03 (−0,2) | +7 pe | – | −0,05 / +0,02  |

- Svårast mot **Kortpass** (−0,10 p/match rel. eget snitt, z −0,4, 24 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,11 p/match rel. eget snitt, z +0,5, 21 m) – åt samma håll i båda halvorna men svagt

### Djurgarden

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 55,6 %). 219 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 75 | 1,29–1,13 | −0,17 | −0,21 (−1,4) | −7 pe | – | −0,17 / −0,25 ✔ |
| Balanserat | 78 | 1,73–1,00 | +0,19 | +0,14 (+1,0) | −1 pe | – | +0,14 / +0,15 ✔ |
| Bollinnehav | 66 | 1,79–1,02 | +0,12 | +0,07 (+0,5) | −4 pe | – | +0,12 / +0,03 ✔ |
| Kortpass | 54 | 1,85–1,06 | +0,00 | −0,04 (−0,3) | −5 pe | – | +0,14 / −0,09  |
| Blandat | 95 | 1,53–1,09 | −0,09 | −0,13 (−1,0) | −0 pe | – | −0,08 / −0,19 ✔ |
| Direktspel | 70 | 1,50–0,99 | +0,26 | +0,21 (+1,4) | −9 pe | – | +0,15 / +0,35 ✔ |
| Lågpress | 63 | 1,54–0,94 | +0,07 | +0,02 (+0,1) | −4 pe | – | +0,01 / +0,07 ✔ |
| Mellanpress | 87 | 1,69–1,08 | −0,04 | −0,08 (−0,6) | −1 pe | – | +0,12 / −0,29  |
| Högpress | 69 | 1,54–1,12 | +0,13 | +0,08 (+0,5) | −8 pe | – | −0,15 / +0,12  |

- Svårast mot **Backar hem** (−0,21 p/match rel. eget snitt, z −1,4, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,21 p/match rel. eget snitt, z +1,4, 70 m) – åt samma håll i båda halvorna men svagt

### Elfsborg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 48,0 %). 219 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,44–1,22 | +0,03 | +0,03 (+0,2) | +9 pe | – | −0,03 / +0,07  |
| Balanserat | 84 | 1,45–1,49 | +0,02 | +0,02 (+0,1) | −1 pe | – | −0,03 / +0,08  |
| Bollinnehav | 67 | 1,57–1,36 | −0,05 | −0,05 (−0,3) | −3 pe | – | +0,11 / −0,19  |
| Kortpass | 56 | 1,46–1,23 | +0,02 | +0,02 (+0,1) | −3 pe | – | +0,49 / −0,08  |
| Blandat | 97 | 1,56–1,45 | −0,04 | −0,04 (−0,4) | +1 pe | – | −0,07 / −0,01 ✔ |
| Direktspel | 66 | 1,39–1,35 | +0,05 | +0,05 (+0,3) | +6 pe | – | −0,00 / +0,19  |
| Lågpress | 65 | 1,23–1,49 | +0,03 | +0,02 (+0,2) | −0 pe | – | −0,08 / +0,67  |
| Mellanpress | 90 | 1,70–1,29 | +0,11 | +0,11 (+0,8) | +4 pe | – | +0,20 / +0,01 ✔ |
| Högpress | 64 | 1,44–1,34 | −0,17 | −0,17 (−1,2) | +1 pe | – | −0,44 / −0,14 ✔ |

- Svårast mot **Högpress** (−0,17 p/match rel. eget snitt, z −1,2, 64 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,11 p/match rel. eget snitt, z +0,8, 90 m) – åt samma håll i båda halvorna men svagt

### GAIS

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 50,5 %). 45 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 15 | 1,47–0,80 | +0,09 | +0,11 (+0,4) | +7 pe | – | +0,09 / +0,14 ✔ |
| Balanserat | 16 | 1,19–1,06 | −0,28 | −0,26 (−1,0) | +17 pe | – | −0,53 / +0,02  |
| Bollinnehav | 14 | 1,21–1,36 | +0,14 | +0,17 (+0,5) | −11 pe | – | +0,86 / −0,52  |
| Kortpass | 25 | 1,24–1,12 | −0,00 | +0,03 (+0,1) | +6 pe | – | +0,44 / −0,25  |
| Blandat | 18 | 1,39–1,00 | −0,07 | −0,04 (−0,2) | +7 pe | – | −0,21 / +0,17  |
| Direktspel | 2 | 1,00–1,00 | +0,01 | +0,03 (+0,0) | −26 pe | – | +0,03 / –  |
| Lågpress | 10 | 0,70–1,50 | −0,53 | −0,50 (−1,6) | −6 pe | – | −0,10 / −0,67  |
| Mellanpress | 26 | 1,50–0,88 | +0,10 | +0,13 (+0,6) | +12 pe | – | +0,13 / +0,12 ✔ |
| Högpress | 9 | 1,33–1,11 | +0,16 | +0,19 (+0,4) | −5 pe | – | +0,16 / +0,29  |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −1,0, 16 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +0,6, 26 m) – åt samma håll i båda halvorna men svagt

### Goteborg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 50,8 %). 219 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 1,06–1,33 | −0,15 | −0,04 (−0,3) | −4 pe | – | −0,11 / +0,03  |
| Balanserat | 75 | 1,29–1,55 | −0,04 | +0,07 (+0,5) | −2 pe | – | −0,05 / +0,23  |
| Bollinnehav | 65 | 1,35–1,45 | −0,15 | −0,04 (−0,2) | −2 pe | – | +0,03 / −0,09  |
| Kortpass | 55 | 1,13–1,42 | −0,06 | +0,05 (+0,3) | −7 pe | – | +0,34 / −0,01  |
| Blandat | 88 | 1,30–1,36 | −0,13 | −0,02 (−0,2) | +2 pe | – | −0,05 / +0,02  |
| Direktspel | 76 | 1,22–1,54 | −0,13 | −0,02 (−0,1) | −5 pe | – | −0,13 / +0,20  |
| Lågpress | 64 | 1,39–1,42 | +0,10 | +0,21 (+1,3) | −5 pe | – | +0,20 / +0,26 ✔ |
| Mellanpress | 87 | 1,10–1,41 | −0,21 | −0,09 (−0,8) | −1 pe | – | −0,23 / +0,04  |
| Högpress | 68 | 1,24–1,49 | −0,19 | −0,08 (−0,5) | −3 pe | – | −0,65 / +0,02  |

- Svårast mot **Mellanpress** (−0,09 p/match rel. eget snitt, z −0,8, 87 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,21 p/match rel. eget snitt, z +1,3, 64 m) – åt samma håll i båda halvorna men svagt

### Hacken

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 51,7 %). 219 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 1,68–1,37 | −0,13 | −0,12 (−0,9) | +6 pe | – | −0,21 / −0,06 ✔ |
| Balanserat | 78 | 1,68–1,01 | +0,14 | +0,15 (+1,1) | +3 pe | – | +0,02 / +0,33 ✔ |
| Bollinnehav | 65 | 1,66–1,52 | −0,04 | −0,03 (−0,2) | +5 pe | – | −0,04 / −0,02 ✔ |
| Kortpass | 53 | 1,64–1,53 | −0,01 | +0,00 (+0,0) | +1 pe | – | +0,25 / −0,06  |
| Blandat | 92 | 1,66–1,23 | −0,01 | −0,00 (−0,0) | +7 pe | – | −0,06 / +0,06  |
| Direktspel | 74 | 1,72–1,19 | −0,00 | +0,00 (+0,0) | +6 pe | – | −0,15 / +0,29  |
| Lågpress | 62 | 1,45–1,06 | −0,05 | −0,04 (−0,3) | +5 pe | – | −0,01 / −0,27 ✔ |
| Mellanpress | 83 | 1,61–1,25 | −0,06 | −0,05 (−0,4) | +6 pe | – | −0,24 / +0,19  |
| Högpress | 74 | 1,93–1,51 | +0,09 | +0,09 (+0,6) | +3 pe | – | +0,47 / +0,04 ✔ |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 76 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,1, 78 m) – åt samma håll i båda halvorna men svagt

### Halmstad

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 41,7 %). 69 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 0,86–1,59 | +0,13 | +0,05 (+0,2) | −6 pe | – | −0,42 / +0,37  |
| Balanserat | 25 | 0,84–1,56 | +0,19 | +0,10 (+0,4) | −7 pe | – | +0,52 / −0,35  |
| Bollinnehav | 22 | 0,86–2,18 | −0,07 | −0,16 (−0,7) | −4 pe | – | −0,01 / −0,34 ✔ |
| Kortpass | 37 | 0,78–2,11 | −0,14 | −0,23 (−1,4) | −4 pe | – | −0,06 / −0,34 ✔ |
| Blandat | 28 | 0,96–1,29 | +0,39 | +0,30 (+1,2) | −6 pe | – | +0,29 / +0,30 ✔ |
| Direktspel | 4 | 0,75–2,00 | +0,14 | +0,05 (+0,1) | −20 pe | – | −0,59 / +0,70  |
| Lågpress | 9 | 0,67–2,33 | −0,41 | −0,50 (−3,8) | +11 pe | – | −0,15 / −0,60  |
| Mellanpress | 27 | 1,11–1,74 | +0,20 | +0,11 (+0,4) | −6 pe | – | +0,12 / +0,10 ✔ |
| Högpress | 33 | 0,70–1,64 | +0,14 | +0,05 (+0,2) | −11 pe | – | +0,09 / −0,05  |

- Svårast mot **Kortpass** (−0,23 p/match rel. eget snitt, z −1,4, 37 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,30 p/match rel. eget snitt, z +1,2, 28 m) – åt samma håll i båda halvorna men svagt

### Hammarby

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 61,0 %). 219 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,62–1,17 | −0,03 | −0,12 (−0,9) | +1 pe | – | −0,14 / −0,10 ✔ |
| Balanserat | 76 | 1,66–1,21 | +0,11 | +0,03 (+0,2) | +3 pe | – | −0,13 / +0,24  |
| Bollinnehav | 61 | 2,10–1,21 | +0,20 | +0,12 (+0,8) | +1 pe | – | +0,22 / +0,03 ✔ |
| Kortpass | 53 | 1,98–1,11 | +0,21 | +0,12 (+0,7) | −7 pe | – | +0,43 / +0,04 ✔ |
| Blandat | 94 | 1,76–1,22 | +0,03 | −0,05 (−0,4) | +5 pe | – | −0,04 / −0,06 ✔ |
| Direktspel | 72 | 1,63–1,22 | +0,06 | −0,03 (−0,2) | +3 pe | – | −0,14 / +0,19  |
| Lågpress | 62 | 1,65–1,27 | +0,04 | −0,05 (−0,3) | −0 pe | – | −0,13 / +0,55  |
| Mellanpress | 88 | 1,95–1,24 | +0,11 | +0,03 (+0,2) | +7 pe | – | +0,08 / −0,03  |
| Högpress | 69 | 1,64–1,07 | +0,09 | +0,01 (+0,0) | −3 pe | – | −0,05 / +0,02  |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,12 p/match rel. eget snitt, z +0,8, 61 m) – åt samma håll i båda halvorna men svagt

### Malmo FF

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 56,9 %). 219 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,71–0,93 | +0,00 | +0,04 (+0,3) | +0 pe | – | −0,07 / +0,14  |
| Balanserat | 76 | 1,84–1,03 | −0,07 | −0,03 (−0,2) | +5 pe | – | +0,07 / −0,15  |
| Bollinnehav | 60 | 2,13–1,20 | −0,05 | −0,01 (−0,1) | −4 pe | – | +0,14 / −0,15  |
| Kortpass | 51 | 1,94–1,20 | −0,01 | +0,02 (+0,1) | −7 pe | – | +0,03 / +0,02 ✔ |
| Blandat | 96 | 1,96–0,90 | +0,03 | +0,07 (+0,6) | +2 pe | – | +0,04 / +0,10 ✔ |
| Direktspel | 72 | 1,71–1,11 | −0,14 | −0,11 (−0,8) | +4 pe | – | +0,03 / −0,43  |
| Lågpress | 60 | 1,73–1,07 | −0,14 | −0,10 (−0,7) | +6 pe | – | −0,07 / −0,41 ✔ |
| Mellanpress | 89 | 1,88–0,93 | −0,04 | −0,01 (−0,1) | +2 pe | – | +0,11 / −0,15  |
| Högpress | 70 | 1,99–1,14 | +0,06 | +0,10 (+0,7) | −5 pe | – | +0,31 / +0,07 ✔ |

- Svårast mot **Direktspel** (−0,11 p/match rel. eget snitt, z −0,8, 72 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,7, 70 m) – åt samma håll i båda halvorna men svagt

### Mjallby

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 51,1 %). 147 matcher med stil, mot marknaden totalt +0,32 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,49–0,78 | +0,35 | +0,03 (+0,2) | −6 pe | – | +0,04 / +0,02 ✔ |
| Balanserat | 50 | 1,08–1,30 | +0,14 | −0,18 (−1,2) | +2 pe | – | −0,42 / +0,04  |
| Bollinnehav | 46 | 1,57–1,15 | +0,48 | +0,16 (+0,9) | +3 pe | – | −0,04 / +0,38  |
| Kortpass | 53 | 1,51–1,21 | +0,24 | −0,08 (−0,5) | +7 pe | – | −0,11 / −0,06 ✔ |
| Blandat | 54 | 1,37–1,06 | +0,34 | +0,02 (+0,1) | −6 pe | – | −0,45 / +0,32  |
| Direktspel | 40 | 1,20–0,93 | +0,39 | +0,07 (+0,4) | −1 pe | – | +0,04 / +0,24 ✔ |
| Lågpress | 21 | 1,14–1,48 | −0,06 | −0,37 (−1,6) | +7 pe | – | −0,55 / −0,22 ✔ |
| Mellanpress | 54 | 1,41–1,00 | +0,20 | −0,12 (−0,7) | −2 pe | – | −0,34 / +0,11  |
| Högpress | 72 | 1,42–1,01 | +0,51 | +0,20 (+1,4) | −1 pe | – | +0,13 / +0,26 ✔ |

- Svårast mot **Lågpress** (−0,37 p/match rel. eget snitt, z −1,6, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,20 p/match rel. eget snitt, z +1,4, 72 m) – åt samma håll i båda halvorna men svagt

### Sirius

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 47,5 %). 219 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,54–1,61 | +0,08 | +0,03 (+0,2) | −3 pe | – | +0,03 / +0,03 ✔ |
| Balanserat | 83 | 1,39–1,99 | −0,06 | −0,11 (−0,8) | −9 pe | – | −0,05 / −0,19 ✔ |
| Bollinnehav | 53 | 1,43–1,49 | +0,17 | +0,12 (+0,7) | +2 pe | – | −0,26 / +0,37  |
| Kortpass | 51 | 1,86–1,31 | +0,36 | +0,31 (+1,7) | −5 pe | – | −0,09 / +0,38  |
| Blandat | 88 | 1,38–1,75 | −0,05 | −0,10 (−0,8) | −1 pe | – | −0,06 / −0,14 ✔ |
| Direktspel | 80 | 1,29–1,96 | −0,04 | −0,09 (−0,7) | −7 pe | – | −0,05 / −0,17 ✔ |
| Lågpress | 61 | 1,30–1,75 | +0,08 | +0,03 (+0,2) | −4 pe | – | −0,07 / +0,81  |
| Mellanpress | 89 | 1,48–1,84 | −0,05 | −0,10 (−0,8) | −1 pe | – | −0,16 / −0,04 ✔ |
| Högpress | 69 | 1,57–1,55 | +0,15 | +0,10 (+0,7) | −8 pe | – | +0,49 / +0,05 ✔ |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −0,8, 89 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,31 p/match rel. eget snitt, z +1,7, 51 m) – inte stabilt, troligen slump
