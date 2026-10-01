# Stilmatchning – Primeira Liga (PT)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1703 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 109 m · hemma +0,04 · kryss +0 pe · ö2,5 −1 pe | 181 m · hemma −0,10 · kryss +4 pe · ö2,5 −3 pe | 168 m · hemma +0,03 · kryss −2 pe · ö2,5 −3 pe |
| **Mellan** | 181 m · hemma +0,03 · kryss −4 pe · ö2,5 +4 pe | 259 m · hemma +0,01 · kryss −0 pe · ö2,5 +2 pe | 237 m · hemma −0,08 · kryss −6 pe · ö2,5 +5 pe |
| **Mycket boll** | 166 m · hemma +0,14 · kryss −4 pe · ö2,5 +2 pe | 239 m · hemma +0,12 · kryss −3 pe · ö2,5 +1 pe | 163 m · hemma −0,04 · kryss +2 pe · ö2,5 +6 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 184 m · hemma +0,13 · kryss −3 pe · ö2,5 +1 pe | 215 m · hemma +0,00 · kryss +0 pe · ö2,5 −6 pe | 167 m · hemma −0,08 · kryss −6 pe · ö2,5 +6 pe |
| **Balanserat** | 215 m · hemma +0,08 · kryss −5 pe · ö2,5 +1 pe | 225 m · hemma −0,02 · kryss +0 pe · ö2,5 +4 pe | 192 m · hemma +0,08 · kryss −2 pe · ö2,5 −1 pe |
| **Bollinnehav** | 165 m · hemma −0,09 · kryss −0 pe · ö2,5 +4 pe | 191 m · hemma +0,00 · kryss −2 pe · ö2,5 +7 pe | 149 m · hemma +0,01 · kryss +3 pe · ö2,5 −2 pe |

## Lag (säsong 2026/27)

### Alverca

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 43,5 %). 7 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 0,00–2,00 | −0,36 | −0,36 (−3,6) | −15 pe | −57 pe | −0,36 / –  |
| Balanserat | 5 | 1,60–1,40 | +0,24 | +0,24 (+0,6) | +14 pe | +10 pe | −0,51 / +0,75  |
| Bollinnehav | 1 | 1,00–2,00 | −0,86 | −0,86 (−8,6) | −27 pe | +55 pe | – / −0,86  |
| Kortpass | 6 | 1,00–1,67 | −0,26 | −0,26 (−1,0) | +10 pe | −1 pe | −0,46 / −0,07  |
| Blandat | 1 | 3,00–1,00 | +1,58 | +1,58 (+15,8) | −29 pe | +53 pe | – / +1,58  |
| Lågpress | 2 | 1,50–2,50 | −0,51 | −0,51 (−6,7) | +28 pe | +44 pe | −0,51 / –  |
| Mellanpress | 5 | 1,20–1,20 | +0,20 | +0,20 (+0,5) | −5 pe | −8 pe | −0,36 / +0,35  |

### Arouca

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 50,6 %). 120 matcher med stil, mot marknaden totalt +0,17 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 37 | 1,27–1,30 | +0,33 | +0,16 (+0,8) | +4 pe | +3 pe | +0,35 / −0,15  |
| Balanserat | 44 | 1,52–1,68 | +0,16 | −0,01 (−0,1) | −15 pe | +17 pe | +0,21 / −0,17  |
| Bollinnehav | 39 | 1,13–1,67 | +0,03 | −0,14 (−1,0) | +14 pe | −2 pe | −0,23 / −0,06 ✔ |
| Kortpass | 64 | 1,41–1,63 | +0,07 | −0,10 (−0,7) | −0 pe | +10 pe | −0,14 / −0,08 ✔ |
| Blandat | 46 | 1,11–1,61 | +0,16 | −0,01 (−0,1) | +1 pe | +3 pe | +0,07 / −0,16  |
| Direktspel | 10 | 1,70–0,90 | +0,87 | +0,70 (+1,6) | +4 pe | +1 pe | +1,10 / −0,91  |
| Lågpress | 15 | 1,40–1,93 | +0,21 | +0,04 (+0,1) | +3 pe | +23 pe | – / +0,04  |
| Mellanpress | 51 | 1,33–1,24 | +0,38 | +0,21 (+1,3) | −3 pe | +4 pe | +0,35 / +0,05 ✔ |
| Högpress | 54 | 1,28–1,76 | −0,03 | −0,20 (−1,4) | +3 pe | +4 pe | −0,05 / −0,47 ✔ |

- Svårast mot **Högpress** (−0,20 p/match rel. eget snitt, z −1,4, 54 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +1,3, 51 m) – åt samma håll i båda halvorna men svagt

### Benfica

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 63,6 %). 227 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 2,18–0,76 | +0,11 | +0,02 (+0,1) | −2 pe | −2 pe | +0,13 / −0,14  |
| Balanserat | 85 | 2,27–0,92 | −0,02 | −0,11 (−0,9) | −4 pe | +0 pe | −0,12 / −0,10 ✔ |
| Bollinnehav | 66 | 2,61–0,88 | +0,21 | +0,12 (+1,0) | −3 pe | +17 pe | +0,04 / +0,17 ✔ |
| Kortpass | 62 | 2,37–0,87 | +0,03 | −0,06 (−0,5) | +5 pe | +10 pe | +0,37 / −0,07  |
| Blandat | 77 | 2,44–0,79 | +0,14 | +0,05 (+0,5) | −3 pe | +9 pe | +0,04 / +0,06 ✔ |
| Direktspel | 88 | 2,23–0,90 | +0,09 | −0,00 (−0,0) | −8 pe | −3 pe | +0,00 / −0,06  |
| Lågpress | 69 | 2,49–0,87 | +0,24 | +0,15 (+1,1) | −9 pe | +7 pe | +0,15 / +0,15 ✔ |
| Mellanpress | 99 | 2,27–0,78 | +0,01 | −0,08 (−0,7) | +0 pe | +1 pe | −0,11 / −0,04 ✔ |
| Högpress | 59 | 2,27–0,97 | +0,05 | −0,04 (−0,3) | −1 pe | +7 pe | −0,06 / −0,04 ✔ |

- Svårast mot **Balanserat** (−0,11 p/match rel. eget snitt, z −0,9, 85 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,15 p/match rel. eget snitt, z +1,1, 69 m) – åt samma håll i båda halvorna men svagt

### Casa Pia

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 44,6 %). 92 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 1,13–1,96 | −0,04 | −0,12 (−0,5) | +2 pe | +8 pe | −0,01 / −0,31 ✔ |
| Balanserat | 35 | 1,09–1,37 | +0,09 | +0,01 (+0,0) | +1 pe | −4 pe | +0,54 / −0,61  |
| Bollinnehav | 33 | 0,88–1,39 | +0,16 | +0,08 (+0,4) | +10 pe | −6 pe | −0,27 / +0,28  |
| Kortpass | 56 | 1,13–1,59 | +0,14 | +0,06 (+0,4) | +0 pe | +5 pe | +0,16 / −0,01  |
| Blandat | 30 | 0,77–1,23 | +0,10 | +0,02 (+0,1) | +14 pe | −19 pe | +0,37 / −0,39  |
| Direktspel | 6 | 1,33–2,50 | −0,58 | −0,66 (−8,5) | −5 pe | +30 pe | −0,59 / −1,01  |
| Lågpress | 12 | 0,83–1,67 | −0,19 | −0,27 (−0,9) | +8 pe | +5 pe | −0,49 / −0,20  |
| Mellanpress | 35 | 0,94–1,54 | −0,07 | −0,15 (−0,7) | −2 pe | −7 pe | +0,06 / −0,26  |
| Högpress | 45 | 1,13–1,49 | +0,27 | +0,19 (+1,2) | +8 pe | +1 pe | +0,25 / +0,07 ✔ |

- Svårast mot **Mellanpress** (−0,15 p/match rel. eget snitt, z −0,7, 35 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,2, 45 m) – åt samma håll i båda halvorna men svagt

### Estoril

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 46,2 %). 121 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,13–1,47 | +0,04 | +0,08 (+0,4) | −7 pe | +5 pe | +0,27 / −0,14  |
| Balanserat | 41 | 1,32–1,66 | −0,30 | −0,26 (−1,5) | −1 pe | +7 pe | −0,63 / −0,00 ✔ |
| Bollinnehav | 42 | 1,29–1,67 | +0,13 | +0,18 (+1,0) | −8 pe | −1 pe | +0,10 / +0,26 ✔ |
| Kortpass | 61 | 1,48–1,69 | −0,01 | +0,03 (+0,2) | +3 pe | +14 pe | −0,14 / +0,12  |
| Blandat | 50 | 1,08–1,60 | −0,15 | −0,10 (−0,6) | −11 pe | −4 pe | −0,08 / −0,15 ✔ |
| Direktspel | 10 | 0,70–1,10 | +0,29 | +0,34 (+0,7) | −25 pe | −21 pe | +0,31 / +0,45  |
| Lågpress | 16 | 0,94–1,50 | −0,35 | −0,31 (−1,2) | −1 pe | +0 pe | −0,24 / −0,31  |
| Mellanpress | 52 | 1,31–1,67 | −0,11 | −0,07 (−0,4) | −9 pe | +7 pe | +0,00 / −0,12  |
| Högpress | 53 | 1,28–1,57 | +0,12 | +0,16 (+1,0) | −3 pe | +2 pe | −0,07 / +0,69  |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −1,5, 41 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,18 p/match rel. eget snitt, z +1,0, 42 m) – åt samma håll i båda halvorna men svagt

### Estrela

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 49,4 %). 64 matcher med stil, mot marknaden totalt −0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 17 | 0,65–1,71 | −0,19 | −0,12 (−0,5) | −0 pe | −6 pe | −0,28 / +0,61  |
| Balanserat | 24 | 1,38–1,75 | −0,15 | −0,08 (−0,3) | +10 pe | +16 pe | −0,33 / +0,05  |
| Bollinnehav | 23 | 1,09–1,70 | +0,09 | +0,17 (+0,7) | +0 pe | +6 pe | +0,14 / +0,19 ✔ |
| Kortpass | 45 | 1,24–1,89 | −0,14 | −0,07 (−0,4) | +3 pe | +18 pe | −0,17 / +0,01  |
| Blandat | 17 | 0,76–1,29 | +0,16 | +0,23 (+0,8) | +5 pe | −24 pe | −0,09 / +0,69  |
| Direktspel | 2 | 0,00–1,50 | −0,52 | −0,44 (−0,9) | +21 pe | +6 pe | −0,44 / –  |
| Lågpress | 16 | 0,81–1,69 | −0,46 | −0,38 (−1,9) | +6 pe | +3 pe | −0,56 / −0,28 ✔ |
| Mellanpress | 28 | 1,11–1,43 | +0,18 | +0,25 (+1,1) | +6 pe | +4 pe | +0,14 / +0,34 ✔ |
| Högpress | 20 | 1,25–2,15 | −0,12 | −0,04 (−0,2) | −1 pe | +13 pe | −0,25 / +0,43  |

- Svårast mot **Lågpress** (−0,38 p/match rel. eget snitt, z −1,9, 16 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,25 p/match rel. eget snitt, z +1,1, 28 m) – åt samma håll i båda halvorna men svagt

### Famalicao

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 53,9 %). 174 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 50 | 1,22–1,40 | +0,08 | +0,08 (+0,5) | −7 pe | +16 pe | +0,10 / +0,06 ✔ |
| Balanserat | 67 | 1,22–1,25 | −0,08 | −0,07 (−0,5) | +5 pe | −1 pe | −0,03 / −0,10 ✔ |
| Bollinnehav | 57 | 1,19–1,28 | +0,01 | +0,01 (+0,1) | +11 pe | −2 pe | −0,21 / +0,26  |
| Kortpass | 69 | 1,16–1,00 | +0,14 | +0,15 (+1,1) | +11 pe | −8 pe | −0,06 / +0,18  |
| Blandat | 65 | 1,40–1,42 | −0,04 | −0,04 (−0,2) | −2 pe | +13 pe | +0,07 / −0,20  |
| Direktspel | 40 | 1,00–1,65 | −0,20 | −0,19 (−1,0) | −2 pe | +9 pe | −0,18 / −0,31  |
| Lågpress | 24 | 1,04–1,25 | −0,18 | −0,18 (−0,9) | +19 pe | −3 pe | +0,11 / −0,32  |
| Mellanpress | 83 | 1,27–1,12 | +0,08 | +0,09 (+0,7) | −2 pe | +1 pe | +0,07 / +0,12 ✔ |
| Högpress | 67 | 1,21–1,55 | −0,05 | −0,04 (−0,3) | +4 pe | +10 pe | −0,33 / +0,15  |

- Svårast mot **Direktspel** (−0,19 p/match rel. eget snitt, z −1,0, 40 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,15 p/match rel. eget snitt, z +1,1, 69 m) – inte stabilt, troligen slump

### Gil Vicente

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 53,3 %). 172 matcher med stil, mot marknaden totalt +0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,07–1,39 | −0,03 | −0,04 (−0,3) | −3 pe | +1 pe | +0,17 / −0,27  |
| Balanserat | 62 | 1,03–1,26 | −0,15 | −0,15 (−1,1) | +3 pe | −5 pe | −0,52 / +0,11  |
| Bollinnehav | 54 | 1,28–1,30 | +0,23 | +0,22 (+1,3) | −4 pe | +2 pe | +0,40 / −0,02  |
| Kortpass | 61 | 0,93–1,39 | −0,25 | −0,25 (−1,9) | +10 pe | −5 pe | −0,43 / −0,22 ✔ |
| Blandat | 71 | 1,34–1,37 | +0,14 | +0,13 (+0,9) | −11 pe | +10 pe | −0,01 / +0,35  |
| Direktspel | 40 | 1,02–1,10 | +0,17 | +0,16 (+0,8) | −2 pe | −13 pe | +0,24 / −0,32  |
| Lågpress | 19 | 1,16–1,11 | +0,35 | +0,34 (+1,3) | −11 pe | −6 pe | +0,45 / +0,29 ✔ |
| Mellanpress | 90 | 1,14–1,22 | −0,05 | −0,06 (−0,5) | +4 pe | −2 pe | −0,06 / −0,05 ✔ |
| Högpress | 63 | 1,08–1,51 | −0,01 | −0,02 (−0,1) | −6 pe | +2 pe | +0,17 / −0,15  |

- Svårast mot **Kortpass** (−0,25 p/match rel. eget snitt, z −1,9, 61 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,34 p/match rel. eget snitt, z +1,3, 19 m) – åt samma håll i båda halvorna men svagt

### Guimaraes

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Högpress** (faktiskt bollinnehav 55,8 %). 228 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,41–1,14 | +0,24 | +0,19 (+1,3) | −5 pe | +0 pe | +0,36 / −0,00  |
| Balanserat | 86 | 1,26–1,16 | +0,05 | +0,01 (+0,0) | −3 pe | −4 pe | −0,28 / +0,32  |
| Bollinnehav | 71 | 1,10–1,45 | −0,16 | −0,20 (−1,5) | −5 pe | +4 pe | −0,16 / −0,23 ✔ |
| Kortpass | 66 | 1,26–1,32 | −0,01 | −0,05 (−0,4) | −1 pe | −2 pe | +0,09 / −0,06  |
| Blandat | 76 | 1,20–1,24 | +0,16 | +0,11 (+0,8) | −6 pe | +4 pe | +0,09 / +0,13 ✔ |
| Direktspel | 86 | 1,30–1,20 | −0,01 | −0,06 (−0,4) | −5 pe | −2 pe | −0,09 / +0,22  |
| Lågpress | 71 | 1,11–1,32 | −0,17 | −0,22 (−1,5) | −3 pe | −5 pe | −0,14 / −0,48 ✔ |
| Mellanpress | 95 | 1,36–1,09 | +0,21 | +0,16 (+1,3) | −6 pe | −0 pe | +0,13 / +0,19 ✔ |
| Högpress | 62 | 1,26–1,39 | +0,05 | +0,01 (+0,0) | −4 pe | +6 pe | −0,13 / +0,05  |

- Svårast mot **Lågpress** (−0,22 p/match rel. eget snitt, z −1,5, 71 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,16 p/match rel. eget snitt, z +1,3, 95 m) – åt samma håll i båda halvorna men svagt

### Moreirense

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 35,9 %). 172 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 0,95–1,42 | +0,02 | −0,01 (−0,1) | −2 pe | −1 pe | +0,06 / −0,09  |
| Balanserat | 64 | 1,06–1,52 | +0,06 | +0,03 (+0,2) | +3 pe | +1 pe | +0,15 / −0,10  |
| Bollinnehav | 51 | 1,10–1,63 | −0,01 | −0,03 (−0,2) | −4 pe | +8 pe | +0,22 / −0,20  |
| Kortpass | 45 | 1,22–1,60 | +0,09 | +0,07 (+0,4) | −3 pe | +12 pe | −0,57 / +0,08  |
| Blandat | 45 | 0,98–1,51 | −0,02 | −0,05 (−0,3) | −4 pe | +3 pe | +0,48 / −0,26  |
| Direktspel | 82 | 0,96–1,48 | +0,02 | −0,01 (−0,1) | +3 pe | −4 pe | +0,08 / −0,64  |
| Lågpress | 70 | 1,00–1,47 | +0,10 | +0,08 (+0,6) | −3 pe | −1 pe | +0,13 / −0,10  |
| Mellanpress | 66 | 1,00–1,47 | −0,02 | −0,05 (−0,3) | −5 pe | +3 pe | +0,16 / −0,16  |
| Högpress | 36 | 1,17–1,69 | −0,04 | −0,06 (−0,4) | +11 pe | +5 pe | +0,05 / −0,10  |

- Svårast mot **Högpress** (−0,06 p/match rel. eget snitt, z −0,4, 36 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,08 p/match rel. eget snitt, z +0,6, 70 m) – inte stabilt, troligen slump

### Nacional

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 50,9 %). 37 matcher med stil, mot marknaden totalt −0,31 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 5 | 1,00–2,40 | −0,74 | −0,44 (−2,3) | −4 pe | +10 pe | −0,14 / −0,63  |
| Balanserat | 16 | 1,44–1,63 | −0,09 | +0,22 (+0,8) | +12 pe | +7 pe | +0,70 / −0,27  |
| Bollinnehav | 16 | 0,63–1,25 | −0,39 | −0,08 (−0,3) | −19 pe | −18 pe | −0,18 / +0,02  |
| Kortpass | 29 | 1,07–1,59 | −0,28 | +0,03 (+0,1) | −5 pe | +2 pe | +0,35 / −0,27  |
| Blandat | 8 | 0,88–1,50 | −0,41 | −0,10 (−0,4) | +0 pe | −25 pe | −0,25 / +0,04  |
| Lågpress | 11 | 0,91–2,09 | −0,52 | −0,21 (−0,9) | −14 pe | +3 pe | +0,01 / −0,47  |
| Mellanpress | 16 | 1,25–1,63 | −0,43 | −0,13 (−0,5) | +3 pe | +10 pe | −0,12 / −0,13 ✔ |
| Högpress | 10 | 0,80–0,90 | +0,13 | +0,43 (+1,0) | −4 pe | −32 pe | +1,21 / −0,08  |

- Svårast mot **Mellanpress** (−0,13 p/match rel. eget snitt, z −0,5, 16 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,22 p/match rel. eget snitt, z +0,8, 16 m) – inte stabilt, troligen slump

### Porto

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 54,3 %). 228 matcher med stil, mot marknaden totalt +0,17 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 2,01–0,70 | +0,18 | +0,01 (+0,1) | +0 pe | −1 pe | −0,11 / +0,15  |
| Balanserat | 83 | 1,98–0,77 | +0,12 | −0,04 (−0,3) | −7 pe | −3 pe | +0,19 / −0,27  |
| Bollinnehav | 66 | 2,30–0,71 | +0,21 | +0,04 (+0,4) | −4 pe | +9 pe | +0,09 / +0,00 ✔ |
| Kortpass | 67 | 1,99–0,79 | +0,21 | +0,04 (+0,3) | −7 pe | +3 pe | +0,32 / +0,02  |
| Blandat | 75 | 2,13–0,75 | +0,07 | −0,10 (−0,8) | −0 pe | +2 pe | +0,10 / −0,24  |
| Direktspel | 86 | 2,12–0,66 | +0,22 | +0,05 (+0,5) | −4 pe | −1 pe | +0,02 / +0,39 ✔ |
| Lågpress | 69 | 2,09–0,57 | +0,31 | +0,14 (+1,3) | −6 pe | −1 pe | +0,05 / +0,47 ✔ |
| Mellanpress | 96 | 2,07–0,78 | +0,12 | −0,05 (−0,5) | −4 pe | −1 pe | +0,00 / −0,10  |
| Högpress | 63 | 2,10–0,83 | +0,09 | −0,08 (−0,6) | −1 pe | +6 pe | +0,26 / −0,16  |

- Svårast mot **Blandat** (−0,10 p/match rel. eget snitt, z −0,8, 75 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,14 p/match rel. eget snitt, z +1,3, 69 m) – åt samma håll i båda halvorna men svagt

### Rio Ave

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 43,0 %). 175 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,28–1,48 | +0,07 | +0,09 (+0,6) | +3 pe | +4 pe | +0,03 / +0,17 ✔ |
| Balanserat | 72 | 1,03–1,49 | −0,10 | −0,09 (−0,6) | +5 pe | −3 pe | −0,11 / −0,06 ✔ |
| Bollinnehav | 39 | 1,00–1,44 | +0,01 | +0,02 (+0,1) | +22 pe | −10 pe | −0,16 / +0,10  |
| Kortpass | 57 | 1,09–1,70 | −0,03 | −0,02 (−0,2) | +8 pe | +1 pe | +0,60 / −0,05  |
| Blandat | 42 | 1,05–1,33 | +0,11 | +0,12 (+0,7) | +14 pe | −10 pe | −0,20 / +0,28  |
| Direktspel | 76 | 1,17–1,38 | −0,06 | −0,05 (−0,4) | +5 pe | +0 pe | −0,04 / −0,16 ✔ |
| Lågpress | 67 | 1,15–1,55 | −0,01 | +0,01 (+0,0) | +0 pe | +1 pe | +0,07 / −0,19  |
| Mellanpress | 57 | 1,11–1,42 | −0,10 | −0,08 (−0,6) | +8 pe | −2 pe | −0,25 / +0,06  |
| Högpress | 51 | 1,08–1,43 | +0,07 | +0,09 (+0,7) | +19 pe | −5 pe | −0,15 / +0,15  |

- Svårast mot **Balanserat** (−0,09 p/match rel. eget snitt, z −0,6, 72 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,12 p/match rel. eget snitt, z +0,7, 42 m) – inte stabilt, troligen slump

### Santa Clara

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 45,0 %). 144 matcher med stil, mot marknaden totalt −0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 37 | 1,00–1,41 | −0,28 | −0,11 (−0,6) | +4 pe | +2 pe | −0,07 / −0,19 ✔ |
| Balanserat | 57 | 1,04–1,47 | −0,09 | +0,07 (+0,5) | −0 pe | +1 pe | +0,11 / +0,03 ✔ |
| Bollinnehav | 50 | 0,90–1,42 | −0,16 | +0,00 (+0,0) | −7 pe | +6 pe | +0,07 / −0,05  |
| Kortpass | 35 | 0,91–1,26 | −0,01 | +0,15 (+0,8) | −10 pe | −2 pe | −0,42 / +0,19  |
| Blandat | 53 | 1,04–1,70 | −0,27 | −0,11 (−0,7) | −1 pe | +14 pe | +0,05 / −0,21  |
| Direktspel | 56 | 0,96–1,30 | −0,16 | +0,00 (+0,0) | +3 pe | −4 pe | +0,06 / −0,38  |
| Lågpress | 38 | 0,92–1,47 | −0,26 | −0,10 (−0,6) | −3 pe | −1 pe | −0,13 / −0,02 ✔ |
| Mellanpress | 74 | 0,99–1,28 | −0,08 | +0,09 (+0,6) | −1 pe | +4 pe | +0,21 / −0,01  |
| Högpress | 32 | 1,03–1,75 | −0,25 | −0,08 (−0,5) | −1 pe | +7 pe | −0,01 / −0,12 ✔ |

- Svårast mot **Blandat** (−0,11 p/match rel. eget snitt, z −0,7, 53 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,15 p/match rel. eget snitt, z +0,8, 35 m) – inte stabilt, troligen slump

### Sp Braga

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 59,8 %). 228 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 1,64–0,97 | −0,01 | −0,06 (−0,4) | −9 pe | −2 pe | −0,14 / +0,06  |
| Balanserat | 82 | 1,73–1,15 | +0,07 | +0,03 (+0,2) | +3 pe | +2 pe | +0,13 / −0,07  |
| Bollinnehav | 69 | 1,78–1,23 | +0,08 | +0,03 (+0,2) | −3 pe | +7 pe | +0,04 / +0,02 ✔ |
| Kortpass | 68 | 1,88–1,12 | +0,11 | +0,07 (+0,5) | +3 pe | +9 pe | +0,50 / +0,05  |
| Blandat | 76 | 1,74–1,20 | +0,00 | −0,04 (−0,3) | −3 pe | +3 pe | −0,15 / +0,04  |
| Direktspel | 84 | 1,56–1,04 | +0,03 | −0,02 (−0,1) | −7 pe | −4 pe | +0,04 / −0,81  |
| Lågpress | 70 | 1,40–1,09 | −0,03 | −0,07 (−0,5) | −11 pe | −4 pe | +0,02 / −0,39  |
| Mellanpress | 94 | 1,89–1,06 | +0,03 | −0,02 (−0,1) | +1 pe | +7 pe | −0,16 / +0,12  |
| Högpress | 64 | 1,80–1,22 | +0,15 | +0,10 (+0,8) | +1 pe | +2 pe | +0,45 / +0,01 ✔ |

- Svårast mot **Lågpress** (−0,07 p/match rel. eget snitt, z −0,5, 70 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,8, 64 m) – åt samma håll i båda halvorna men svagt

### Sp Lisbon

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 60,2 %). 229 matcher med stil, mot marknaden totalt +0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 2,05–0,75 | +0,26 | +0,09 (+0,9) | −5 pe | −1 pe | +0,02 / +0,19 ✔ |
| Balanserat | 84 | 2,46–0,77 | +0,23 | +0,06 (+0,6) | −4 pe | +13 pe | +0,03 / +0,10 ✔ |
| Bollinnehav | 68 | 2,04–0,94 | −0,01 | −0,18 (−1,4) | +8 pe | +2 pe | +0,05 / −0,34  |
| Kortpass | 64 | 2,75–0,81 | +0,12 | −0,05 (−0,4) | +5 pe | +14 pe | +0,17 / −0,06  |
| Blandat | 75 | 2,05–0,80 | +0,04 | −0,13 (−1,2) | +2 pe | −0 pe | −0,19 / −0,08 ✔ |
| Direktspel | 90 | 1,93–0,83 | +0,30 | +0,14 (+1,3) | −8 pe | +3 pe | +0,11 / +0,38 ✔ |
| Lågpress | 67 | 1,94–0,99 | +0,01 | −0,15 (−1,3) | +1 pe | +7 pe | −0,12 / −0,24 ✔ |
| Mellanpress | 95 | 2,34–0,68 | +0,29 | +0,12 (+1,3) | −4 pe | +3 pe | +0,16 / +0,09 ✔ |
| Högpress | 67 | 2,27–0,84 | +0,14 | −0,03 (−0,2) | +1 pe | +5 pe | +0,15 / −0,08  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,4, 68 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,12 p/match rel. eget snitt, z +1,3, 95 m) – åt samma håll i båda halvorna men svagt
