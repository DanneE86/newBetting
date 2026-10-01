# Stilmatchning – 2. Bundesliga (BL2)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1812 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 243 m · hemma +0,00 · kryss −3 pe · ö2,5 −0 pe | 250 m · hemma −0,00 · kryss −0 pe · ö2,5 +3 pe | 167 m · hemma −0,10 · kryss +4 pe · ö2,5 +5 pe |
| **Mellan** | 248 m · hemma +0,19 · kryss +3 pe · ö2,5 +4 pe | 289 m · hemma +0,08 · kryss −3 pe · ö2,5 +7 pe | 178 m · hemma −0,07 · kryss −2 pe · ö2,5 +4 pe |
| **Mycket boll** | 169 m · hemma +0,13 · kryss −6 pe · ö2,5 +5 pe | 178 m · hemma −0,03 · kryss +3 pe · ö2,5 −1 pe | 90 m · hemma −0,12 · kryss +8 pe · ö2,5 −6 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 117 m · hemma −0,13 · kryss −1 pe · ö2,5 −2 pe | 194 m · hemma −0,04 · kryss +3 pe · ö2,5 +5 pe | 173 m · hemma −0,01 · kryss −0 pe · ö2,5 +2 pe |
| **Balanserat** | 196 m · hemma +0,10 · kryss −3 pe · ö2,5 −1 pe | 247 m · hemma +0,17 · kryss +3 pe · ö2,5 +6 pe | 255 m · hemma −0,11 · kryss −2 pe · ö2,5 +3 pe |
| **Bollinnehav** | 173 m · hemma +0,12 · kryss −6 pe · ö2,5 +7 pe | 257 m · hemma +0,05 · kryss −1 pe · ö2,5 +4 pe | 200 m · hemma +0,03 · kryss +4 pe · ö2,5 +0 pe |

## Lag (säsong 2026/27)

### Bielefeld

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 46,1 %). 159 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 40 | 0,88–1,43 | −0,31 | −0,33 (−2,1) | +9 pe | −7 pe | −0,29 / −0,36 ✔ ⚑ |
| Balanserat | 64 | 1,17–1,55 | −0,08 | −0,10 (−0,7) | +9 pe | −4 pe | +0,23 / −0,42  |
| Bollinnehav | 55 | 1,55–1,40 | +0,37 | +0,35 (+2,1) | −4 pe | −1 pe | +0,46 / +0,22 ✔ ⚑ |
| Kortpass | 17 | 0,88–1,29 | −0,36 | −0,38 (−1,6) | +21 pe | −20 pe | −0,07 / −0,45  |
| Blandat | 72 | 1,26–1,51 | +0,14 | +0,12 (+0,9) | +3 pe | −4 pe | +0,22 / +0,03 ✔ |
| Direktspel | 70 | 1,27–1,46 | −0,01 | −0,03 (−0,2) | +3 pe | +1 pe | +0,21 / −0,37  |
| Lågpress | 53 | 1,32–1,30 | +0,09 | +0,07 (+0,4) | +8 pe | −5 pe | +0,25 / −0,71  |
| Mellanpress | 48 | 1,27–1,50 | +0,10 | +0,08 (+0,5) | +3 pe | +1 pe | −0,03 / +0,19  |
| Högpress | 58 | 1,10–1,59 | −0,11 | −0,13 (−0,9) | +3 pe | −6 pe | +0,50 / −0,30  |

- Svårast mot **Backar hem** (−0,33 p/match rel. eget snitt, z −2,1, 40 m) – ⚑ håller i båda halvorna
- Bäst mot **Bollinnehav** (+0,35 p/match rel. eget snitt, z +2,1, 55 m) – ⚑ håller i båda halvorna

### Bochum

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 53,9 %). 259 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,38–1,59 | +0,01 | −0,02 (−0,2) | −2 pe | −3 pe | +0,05 / −0,07  |
| Balanserat | 100 | 1,31–1,60 | +0,22 | +0,18 (+1,5) | −1 pe | +1 pe | +0,23 / +0,13 ✔ |
| Bollinnehav | 77 | 1,32–1,88 | −0,17 | −0,21 (−1,6) | +1 pe | +2 pe | −0,07 / −0,37 ✔ |
| Kortpass | 58 | 1,21–1,84 | −0,21 | −0,24 (−1,7) | +1 pe | −4 pe | −0,32 / −0,23 ✔ |
| Blandat | 111 | 1,21–1,67 | +0,09 | +0,06 (+0,5) | −5 pe | −1 pe | +0,09 / +0,00 ✔ |
| Direktspel | 90 | 1,58–1,59 | +0,12 | +0,09 (+0,7) | +3 pe | +4 pe | +0,11 / +0,05 ✔ |
| Lågpress | 85 | 1,31–1,49 | −0,03 | −0,06 (−0,5) | −3 pe | +2 pe | +0,04 / −0,24  |
| Mellanpress | 79 | 1,38–1,78 | +0,01 | −0,02 (−0,2) | −1 pe | +2 pe | −0,13 / +0,05  |
| Högpress | 95 | 1,33–1,76 | +0,11 | +0,07 (+0,6) | +1 pe | −3 pe | +0,29 / −0,11  |

- Svårast mot **Kortpass** (−0,24 p/match rel. eget snitt, z −1,7, 58 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,18 p/match rel. eget snitt, z +1,5, 100 m) – åt samma håll i båda halvorna men svagt

### Braunschweig

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 48,5 %). 91 matcher med stil, mot marknaden totalt −0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 0,96–2,04 | −0,39 | −0,25 (−1,0) | −10 pe | +3 pe | −0,57 / −0,02 ✔ |
| Balanserat | 36 | 1,00–2,03 | −0,34 | −0,20 (−1,1) | −3 pe | −1 pe | −0,27 / −0,13 ✔ |
| Bollinnehav | 31 | 1,13–1,26 | +0,28 | +0,42 (+1,8) | −6 pe | −15 pe | +0,21 / +0,67 ✔ |
| Kortpass | 44 | 1,05–1,75 | −0,06 | +0,08 (+0,4) | −5 pe | −2 pe | −0,01 / +0,16  |
| Blandat | 37 | 1,14–1,81 | −0,20 | −0,06 (−0,3) | −2 pe | −2 pe | −0,41 / +0,24  |
| Direktspel | 10 | 0,60–1,70 | −0,30 | −0,15 (−0,4) | −26 pe | −26 pe | +0,04 / −0,93  |
| Lågpress | 23 | 1,00–1,78 | +0,06 | +0,20 (+0,8) | −4 pe | +9 pe | +0,15 / +0,21  |
| Mellanpress | 38 | 1,32–1,76 | −0,09 | +0,05 (+0,3) | −7 pe | −4 pe | −0,04 / +0,12  |
| Högpress | 30 | 0,70–1,77 | −0,37 | −0,22 (−1,1) | −5 pe | −17 pe | −0,27 / +0,02  |

- Svårast mot **Högpress** (−0,22 p/match rel. eget snitt, z −1,1, 30 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,42 p/match rel. eget snitt, z +1,8, 31 m) – åt samma håll i båda halvorna men svagt

### Darmstadt

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 40,1 %). 242 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,54–1,67 | −0,04 | −0,10 (−0,7) | −6 pe | +4 pe | −0,15 / −0,06 ✔ |
| Balanserat | 92 | 1,48–1,73 | −0,00 | −0,06 (−0,5) | −1 pe | +10 pe | +0,11 / −0,23  |
| Bollinnehav | 81 | 1,54–1,41 | +0,22 | +0,16 (+1,1) | +4 pe | +2 pe | +0,29 / −0,00  |
| Kortpass | 59 | 1,46–1,61 | −0,01 | −0,07 (−0,5) | +9 pe | −0 pe | +0,47 / −0,12  |
| Blandat | 93 | 1,65–1,55 | +0,26 | +0,20 (+1,5) | −6 pe | +7 pe | +0,40 / −0,07  |
| Direktspel | 90 | 1,42–1,66 | −0,10 | −0,16 (−1,3) | −2 pe | +8 pe | −0,17 / −0,13 ✔ |
| Lågpress | 74 | 1,35–1,46 | +0,15 | +0,09 (+0,6) | +0 pe | +0 pe | +0,19 / −0,13  |
| Mellanpress | 82 | 1,59–1,56 | −0,00 | −0,06 (−0,5) | −1 pe | +5 pe | −0,03 / −0,09 ✔ |
| Högpress | 86 | 1,59–1,77 | +0,05 | −0,01 (−0,1) | −1 pe | +11 pe | +0,14 / −0,11  |

- Svårast mot **Direktspel** (−0,16 p/match rel. eget snitt, z −1,3, 90 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,20 p/match rel. eget snitt, z +1,5, 93 m) – inte stabilt, troligen slump

### Dresden

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 54,7 %). 64 matcher med stil, mot marknaden totalt −0,20 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 13 | 1,23–1,31 | −0,04 | +0,16 (+0,4) | +4 pe | −1 pe | −0,30 / +0,37  |
| Balanserat | 25 | 1,16–1,72 | −0,08 | +0,12 (+0,5) | −11 pe | +3 pe | +0,25 / −0,11  |
| Bollinnehav | 26 | 0,81–1,62 | −0,40 | −0,20 (−0,9) | +1 pe | −13 pe | +0,31 / −0,63  |
| Kortpass | 4 | 0,75–2,00 | −0,72 | −0,52 (−2,9) | +2 pe | +16 pe | – / −0,52  |
| Blandat | 28 | 0,96–1,82 | −0,38 | −0,18 (−0,9) | −4 pe | −9 pe | +0,22 / −0,53  |
| Direktspel | 32 | 1,13–1,34 | +0,02 | +0,22 (+1,0) | −2 pe | −2 pe | +0,19 / +0,27 ✔ |
| Lågpress | 40 | 1,13–1,45 | +0,01 | +0,21 (+1,1) | −4 pe | −5 pe | +0,27 / +0,00 ✔ |
| Mellanpress | 19 | 0,74–1,89 | −0,74 | −0,54 (−2,8) | +0 pe | −8 pe | −0,87 / −0,51  |
| Högpress | 5 | 1,40–1,60 | +0,22 | +0,42 (+0,7) | −6 pe | +20 pe | – / +0,42  |

- Svårast mot **Mellanpress** (−0,54 p/match rel. eget snitt, z −2,8, 19 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,21 p/match rel. eget snitt, z +1,1, 40 m) – åt samma håll i båda halvorna men svagt

### Greuther Furth

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 49,2 %). 241 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 67 | 1,36–1,40 | +0,16 | +0,17 (+1,1) | −1 pe | −3 pe | +0,18 / +0,15 ✔ |
| Balanserat | 95 | 1,18–1,83 | −0,09 | −0,08 (−0,7) | +3 pe | +3 pe | +0,17 / −0,32  |
| Bollinnehav | 79 | 1,33–1,76 | −0,05 | −0,05 (−0,4) | +13 pe | −2 pe | −0,02 / −0,07 ✔ |
| Kortpass | 54 | 1,13–1,83 | −0,20 | −0,19 (−1,3) | +10 pe | −5 pe | −0,62 / −0,13 ✔ |
| Blandat | 99 | 1,24–1,75 | +0,04 | +0,05 (+0,4) | +4 pe | +1 pe | +0,22 / −0,15  |
| Direktspel | 88 | 1,41–1,53 | +0,05 | +0,06 (+0,5) | +4 pe | +1 pe | +0,08 / +0,02 ✔ |
| Lågpress | 81 | 1,27–1,49 | +0,19 | +0,20 (+1,5) | +6 pe | −3 pe | +0,17 / +0,26 ✔ |
| Mellanpress | 74 | 1,26–1,77 | −0,08 | −0,07 (−0,5) | +7 pe | −1 pe | +0,16 / −0,20  |
| Högpress | 86 | 1,30–1,80 | −0,13 | −0,12 (−1,0) | +2 pe | +2 pe | −0,03 / −0,20 ✔ |

- Svårast mot **Kortpass** (−0,19 p/match rel. eget snitt, z −1,3, 54 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,20 p/match rel. eget snitt, z +1,5, 81 m) – åt samma håll i båda halvorna men svagt

### Hannover

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 52,5 %). 238 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,27–1,27 | −0,11 | −0,03 (−0,2) | +5 pe | −4 pe | −0,34 / +0,26  |
| Balanserat | 92 | 1,48–1,49 | +0,06 | +0,14 (+1,1) | +2 pe | +5 pe | −0,01 / +0,33  |
| Bollinnehav | 76 | 1,29–1,72 | −0,22 | −0,14 (−1,0) | −4 pe | +6 pe | −0,09 / −0,19 ✔ |
| Kortpass | 59 | 1,42–1,39 | −0,01 | +0,08 (+0,5) | +3 pe | +8 pe | −0,35 / +0,12  |
| Blandat | 90 | 1,43–1,54 | −0,04 | +0,05 (+0,4) | +3 pe | +3 pe | +0,08 / +0,00 ✔ |
| Direktspel | 89 | 1,24–1,53 | −0,18 | −0,10 (−0,8) | −3 pe | −1 pe | −0,27 / +0,33  |
| Lågpress | 80 | 1,26–1,68 | −0,13 | −0,05 (−0,4) | −3 pe | +6 pe | −0,05 / −0,04 ✔ |
| Mellanpress | 86 | 1,30–1,34 | −0,14 | −0,05 (−0,4) | +5 pe | −3 pe | −0,21 / +0,08  |
| Högpress | 72 | 1,53–1,50 | +0,04 | +0,12 (+0,8) | +0 pe | +6 pe | −0,16 / +0,28  |

- Svårast mot **Bollinnehav** (−0,14 p/match rel. eget snitt, z −1,0, 76 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,14 p/match rel. eget snitt, z +1,1, 92 m) – inte stabilt, troligen slump

### Heidenheim

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 47,0 %). 251 matcher med stil, mot marknaden totalt +0,15 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,55–1,43 | +0,27 | +0,12 (+0,8) | −5 pe | +1 pe | −0,11 / +0,27  |
| Balanserat | 96 | 1,45–1,71 | +0,05 | −0,10 (−0,8) | −3 pe | +5 pe | +0,07 / −0,29  |
| Bollinnehav | 86 | 1,29–1,41 | +0,17 | +0,02 (+0,1) | +1 pe | −3 pe | +0,04 / −0,01  |
| Kortpass | 69 | 1,22–1,68 | −0,01 | −0,15 (−1,1) | −7 pe | −0 pe | +0,51 / −0,25  |
| Blandat | 94 | 1,55–1,71 | +0,17 | +0,02 (+0,2) | +0 pe | +11 pe | +0,09 / −0,10  |
| Direktspel | 88 | 1,44–1,22 | +0,25 | +0,10 (+0,7) | −1 pe | −8 pe | −0,13 / +0,54  |
| Lågpress | 72 | 1,46–1,54 | +0,21 | +0,06 (+0,4) | +2 pe | +5 pe | +0,21 / −0,29  |
| Mellanpress | 83 | 1,31–1,73 | +0,02 | −0,13 (−1,0) | −5 pe | +7 pe | −0,19 / −0,09 ✔ |
| Högpress | 96 | 1,49–1,34 | +0,22 | +0,07 (+0,5) | −3 pe | −6 pe | −0,03 / +0,13  |

- Svårast mot **Kortpass** (−0,15 p/match rel. eget snitt, z −1,1, 69 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,12 p/match rel. eget snitt, z +0,8, 69 m) – inte stabilt, troligen slump

### Hertha

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 48,5 %). 261 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 74 | 1,64–1,62 | +0,20 | +0,22 (+1,6) | −0 pe | +7 pe | +0,08 / +0,35 ✔ |
| Balanserat | 110 | 1,28–1,90 | −0,27 | −0,26 (−2,5) | +3 pe | +9 pe | −0,28 / −0,23 ✔ ⚑ |
| Bollinnehav | 77 | 1,45–1,44 | +0,14 | +0,16 (+1,0) | −4 pe | +0 pe | +0,21 / +0,11 ✔ |
| Kortpass | 48 | 1,48–1,52 | +0,00 | +0,01 (+0,1) | −4 pe | −6 pe | −0,78 / +0,07  |
| Blandat | 119 | 1,43–1,71 | −0,01 | +0,01 (+0,1) | −0 pe | +8 pe | +0,01 / −0,00  |
| Direktspel | 94 | 1,41–1,74 | −0,03 | −0,02 (−0,1) | +3 pe | +9 pe | −0,07 / +0,11  |
| Lågpress | 83 | 1,43–1,51 | +0,06 | +0,08 (+0,5) | −2 pe | +6 pe | −0,00 / +0,22  |
| Mellanpress | 95 | 1,35–1,67 | −0,03 | −0,02 (−0,1) | −0 pe | +1 pe | −0,11 / +0,06  |
| Högpress | 83 | 1,53–1,88 | −0,07 | −0,05 (−0,4) | +3 pe | +11 pe | −0,02 / −0,07 ✔ |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −2,5, 110 m) – ⚑ håller i båda halvorna
- Bäst mot **Backar hem** (+0,22 p/match rel. eget snitt, z +1,6, 74 m) – åt samma håll i båda halvorna men svagt

### Holstein Kiel

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 54,9 %). 241 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 1,53–1,60 | −0,08 | −0,10 (−0,7) | +3 pe | +6 pe | −0,26 / +0,01  |
| Balanserat | 94 | 1,46–1,44 | +0,09 | +0,06 (+0,4) | +0 pe | −3 pe | +0,15 / −0,03  |
| Bollinnehav | 75 | 1,69–1,76 | +0,05 | +0,03 (+0,2) | −2 pe | +12 pe | −0,05 / +0,13  |
| Kortpass | 58 | 1,53–1,93 | −0,12 | −0,14 (−1,0) | +5 pe | +4 pe | −0,30 / −0,12 ✔ |
| Blandat | 91 | 1,64–1,52 | +0,15 | +0,12 (+0,8) | −5 pe | +8 pe | +0,21 / −0,00  |
| Direktspel | 92 | 1,48–1,43 | −0,00 | −0,03 (−0,2) | +2 pe | +1 pe | −0,20 / +0,32  |
| Lågpress | 78 | 1,54–1,45 | −0,03 | −0,06 (−0,4) | +5 pe | −0 pe | +0,05 / −0,24  |
| Mellanpress | 77 | 1,34–1,71 | −0,13 | −0,16 (−1,1) | −3 pe | +1 pe | −0,14 / −0,18 ✔ |
| Högpress | 86 | 1,76–1,59 | +0,22 | +0,19 (+1,4) | −2 pe | +12 pe | −0,00 / +0,30  |

- Svårast mot **Mellanpress** (−0,16 p/match rel. eget snitt, z −1,1, 77 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,4, 86 m) – inte stabilt, troligen slump

### Kaiserslautern

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 48,0 %). 92 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 1,92–1,13 | +0,45 | +0,39 (+1,4) | −18 pe | +9 pe | +0,30 / +0,45 ✔ |
| Balanserat | 38 | 1,39–1,76 | −0,11 | −0,17 (−0,8) | −5 pe | +8 pe | −0,34 / +0,01  |
| Bollinnehav | 30 | 1,60–2,00 | −0,04 | −0,10 (−0,4) | −5 pe | +21 pe | −0,04 / −0,17 ✔ |
| Kortpass | 46 | 1,22–1,57 | −0,15 | −0,21 (−1,2) | +1 pe | −3 pe | −0,28 / −0,15 ✔ |
| Blandat | 36 | 1,92–1,81 | +0,29 | +0,23 (+1,0) | −18 pe | +26 pe | +0,05 / +0,38 ✔ |
| Direktspel | 10 | 2,20–1,70 | +0,21 | +0,15 (+0,4) | −16 pe | +34 pe | +0,16 / +0,13  |
| Lågpress | 24 | 1,92–1,46 | +0,49 | +0,43 (+1,5) | −9 pe | +9 pe | +1,92 / +0,30  |
| Mellanpress | 37 | 1,43–1,76 | −0,06 | −0,12 (−0,6) | −9 pe | +11 pe | −0,01 / −0,24 ✔ |
| Högpress | 31 | 1,55–1,74 | −0,13 | −0,19 (−0,9) | −7 pe | +17 pe | −0,31 / +0,32  |

- Svårast mot **Kortpass** (−0,21 p/match rel. eget snitt, z −1,2, 46 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,43 p/match rel. eget snitt, z +1,5, 24 m) – inte stabilt, troligen slump

### Karlsruhe

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 47,4 %). 177 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 1,51–1,56 | −0,04 | −0,15 (−0,9) | +3 pe | +6 pe | −0,18 / −0,10 ✔ |
| Balanserat | 66 | 1,70–1,48 | +0,08 | −0,02 (−0,2) | +2 pe | +8 pe | +0,02 / −0,06  |
| Bollinnehav | 56 | 1,63–1,68 | +0,28 | +0,17 (+0,9) | −4 pe | +10 pe | +0,09 / +0,24 ✔ |
| Kortpass | 60 | 1,75–1,60 | +0,27 | +0,16 (+1,0) | +2 pe | +4 pe | +0,25 / +0,14 ✔ |
| Blandat | 69 | 1,55–1,74 | +0,01 | −0,10 (−0,6) | −2 pe | +16 pe | −0,08 / −0,11 ✔ |
| Direktspel | 48 | 1,54–1,29 | +0,04 | −0,06 (−0,4) | +3 pe | +0 pe | −0,06 / −0,06 ✔ |
| Lågpress | 35 | 1,43–1,43 | +0,28 | +0,17 (+0,8) | −5 pe | −2 pe | −0,12 / +0,32  |
| Mellanpress | 72 | 1,68–1,71 | +0,09 | −0,02 (−0,1) | −0 pe | +13 pe | +0,12 / −0,11  |
| Högpress | 70 | 1,64–1,50 | +0,04 | −0,07 (−0,5) | +4 pe | +8 pe | −0,10 / −0,02 ✔ |

- Svårast mot **Backar hem** (−0,15 p/match rel. eget snitt, z −0,9, 55 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,16 p/match rel. eget snitt, z +1,0, 60 m) – åt samma håll i båda halvorna men svagt

### Magdeburg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 53,1 %). 91 matcher med stil, mot marknaden totalt −0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 2,11–2,07 | −0,13 | −0,01 (−0,0) | −11 pe | +10 pe | +0,15 / −0,18  |
| Balanserat | 37 | 1,41–1,65 | −0,24 | −0,12 (−0,5) | −3 pe | −3 pe | −0,19 / −0,05 ✔ |
| Bollinnehav | 26 | 1,69–1,38 | +0,06 | +0,18 (+0,8) | +13 pe | −12 pe | +0,32 / +0,04 ✔ |
| Kortpass | 42 | 1,62–1,52 | −0,02 | +0,10 (+0,5) | −1 pe | −8 pe | +0,14 / +0,07 ✔ |
| Blandat | 37 | 1,78–1,81 | −0,24 | −0,11 (−0,6) | +4 pe | +3 pe | +0,04 / −0,28  |
| Direktspel | 12 | 1,75–2,00 | −0,11 | +0,01 (+0,0) | −17 pe | +6 pe | −0,03 / +0,21  |
| Lågpress | 23 | 1,70–1,48 | −0,10 | +0,02 (+0,1) | −12 pe | −5 pe | +0,53 / −0,08  |
| Mellanpress | 37 | 1,84–1,62 | +0,01 | +0,13 (+0,6) | −3 pe | −1 pe | +0,21 / +0,07 ✔ |
| Högpress | 31 | 1,55–1,97 | −0,29 | −0,17 (−0,8) | +10 pe | −0 pe | −0,09 / −0,58 ✔ |

- Svårast mot **Högpress** (−0,17 p/match rel. eget snitt, z −0,8, 31 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,18 p/match rel. eget snitt, z +0,8, 26 m) – åt samma håll i båda halvorna men svagt

### Nurnberg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 57,0 %). 240 matcher med stil, mot marknaden totalt −0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,38–1,39 | +0,06 | +0,16 (+1,1) | +6 pe | −2 pe | +0,11 / +0,21 ✔ |
| Balanserat | 93 | 1,23–1,73 | −0,18 | −0,08 (−0,7) | +2 pe | +3 pe | −0,02 / −0,14 ✔ |
| Bollinnehav | 83 | 1,18–1,86 | −0,13 | −0,03 (−0,2) | −4 pe | −1 pe | −0,34 / +0,28  |
| Kortpass | 55 | 1,24–1,82 | −0,07 | +0,03 (+0,2) | −11 pe | +3 pe | −0,55 / +0,11  |
| Blandat | 95 | 1,35–1,74 | −0,07 | +0,03 (+0,3) | +3 pe | +2 pe | −0,13 / +0,21  |
| Direktspel | 90 | 1,16–1,54 | −0,16 | −0,05 (−0,5) | +7 pe | −4 pe | −0,04 / −0,09 ✔ |
| Lågpress | 79 | 1,23–1,73 | −0,12 | −0,02 (−0,2) | +7 pe | −5 pe | −0,06 / +0,07  |
| Mellanpress | 81 | 1,38–1,54 | +0,11 | +0,22 (+1,5) | −5 pe | +3 pe | −0,10 / +0,49  |
| Högpress | 80 | 1,14–1,77 | −0,30 | −0,20 (−1,6) | +3 pe | +2 pe | −0,18 / −0,21 ✔ |

- Svårast mot **Högpress** (−0,20 p/match rel. eget snitt, z −1,6, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,22 p/match rel. eget snitt, z +1,5, 81 m) – inte stabilt, troligen slump

### St Pauli

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress** (faktiskt bollinnehav 46,7 %). 245 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,38–1,13 | +0,25 | +0,27 (+1,9) | +1 pe | −11 pe | +0,45 / +0,15 ✔ |
| Balanserat | 92 | 1,13–1,30 | −0,12 | −0,09 (−0,7) | +3 pe | −3 pe | −0,05 / −0,14 ✔ |
| Bollinnehav | 84 | 1,37–1,83 | −0,15 | −0,12 (−0,9) | −1 pe | +8 pe | −0,28 / +0,06  |
| Kortpass | 66 | 1,38–1,27 | +0,18 | +0,21 (+1,3) | +1 pe | −5 pe | +1,00 / +0,10 ✔ |
| Blandat | 89 | 1,08–1,66 | −0,23 | −0,20 (−1,7) | +8 pe | +3 pe | −0,20 / −0,20 ✔ |
| Direktspel | 90 | 1,41–1,33 | +0,02 | +0,05 (+0,3) | −6 pe | −4 pe | +0,00 / +0,14 ✔ |
| Lågpress | 71 | 1,23–1,56 | +0,03 | +0,06 (+0,4) | +3 pe | −0 pe | +0,10 / −0,05  |
| Mellanpress | 88 | 1,33–1,45 | −0,01 | +0,02 (+0,2) | −6 pe | −3 pe | +0,04 / +0,01 ✔ |
| Högpress | 86 | 1,28–1,31 | −0,09 | −0,07 (−0,5) | +8 pe | −1 pe | −0,28 / +0,05  |

- Svårast mot **Blandat** (−0,20 p/match rel. eget snitt, z −1,7, 89 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,27 p/match rel. eget snitt, z +1,9, 69 m) – åt samma håll i båda halvorna men svagt

### Wolfsburg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 57,5 %). 277 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,55–1,38 | −0,04 | −0,04 (−0,3) | +4 pe | +3 pe | +0,13 / −0,19  |
| Balanserat | 118 | 1,65–1,53 | −0,01 | −0,01 (−0,1) | −0 pe | +2 pe | +0,09 / −0,14  |
| Bollinnehav | 71 | 1,31–1,63 | +0,08 | +0,08 (+0,5) | −5 pe | −1 pe | +0,10 / +0,06 ✔ |
| Kortpass | 62 | 1,39–1,56 | −0,21 | −0,21 (−1,4) | +5 pe | −2 pe | −0,43 / −0,20  |
| Blandat | 111 | 1,54–1,61 | +0,09 | +0,09 (+0,8) | −7 pe | +6 pe | +0,18 / −0,02  |
| Direktspel | 104 | 1,61–1,37 | +0,02 | +0,02 (+0,2) | +4 pe | −1 pe | +0,06 / −0,06  |
| Lågpress | 86 | 1,58–1,51 | +0,10 | +0,10 (+0,8) | −4 pe | +7 pe | +0,13 / +0,03 ✔ |
| Mellanpress | 95 | 1,32–1,45 | −0,11 | −0,11 (−0,9) | +4 pe | −5 pe | +0,14 / −0,31  |
| Högpress | 96 | 1,70–1,56 | +0,02 | +0,02 (+0,1) | −1 pe | +4 pe | −0,00 / +0,03  |

- Svårast mot **Kortpass** (−0,21 p/match rel. eget snitt, z −1,4, 62 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,09 p/match rel. eget snitt, z +0,8, 111 m) – inte stabilt, troligen slump
