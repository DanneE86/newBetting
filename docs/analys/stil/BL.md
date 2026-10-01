# Stilmatchning – Bundesliga (BL)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2483 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 167 m · hemma +0,06 · kryss +1 pe · ö2,5 +6 pe | 271 m · hemma −0,10 · kryss +4 pe · ö2,5 +3 pe | 252 m · hemma +0,07 · kryss +6 pe · ö2,5 −2 pe |
| **Mellan** | 273 m · hemma +0,06 · kryss −3 pe · ö2,5 +3 pe | 347 m · hemma −0,07 · kryss +2 pe · ö2,5 +4 pe | 325 m · hemma −0,03 · kryss +5 pe · ö2,5 +3 pe |
| **Mycket boll** | 250 m · hemma +0,03 · kryss −1 pe · ö2,5 −3 pe | 326 m · hemma −0,01 · kryss +0 pe · ö2,5 +4 pe | 272 m · hemma −0,11 · kryss −3 pe · ö2,5 +5 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 228 m · hemma −0,01 · kryss +3 pe · ö2,5 +5 pe | 349 m · hemma −0,02 · kryss +1 pe · ö2,5 +2 pe | 215 m · hemma −0,00 · kryss +6 pe · ö2,5 +5 pe |
| **Balanserat** | 347 m · hemma −0,01 · kryss −2 pe · ö2,5 +2 pe | 418 m · hemma +0,01 · kryss −0 pe · ö2,5 +4 pe | 286 m · hemma −0,13 · kryss +4 pe · ö2,5 −1 pe |
| **Bollinnehav** | 217 m · hemma +0,03 · kryss +0 pe · ö2,5 +1 pe | 284 m · hemma −0,05 · kryss −2 pe · ö2,5 +1 pe | 139 m · hemma +0,06 · kryss +1 pe · ö2,5 +4 pe |

## Lag (säsong 2026/27)

### Augsburg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 39,8 %). 276 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 1,35–1,48 | +0,20 | +0,15 (+1,1) | −2 pe | +5 pe | +0,26 / +0,05 ✔ |
| Balanserat | 120 | 1,27–1,76 | +0,07 | +0,02 (+0,1) | −2 pe | −1 pe | −0,11 / +0,17  |
| Bollinnehav | 77 | 1,23–2,04 | −0,12 | −0,17 (−1,4) | +4 pe | +2 pe | −0,16 / −0,18 ✔ |
| Kortpass | 62 | 1,27–1,66 | +0,01 | −0,04 (−0,3) | +4 pe | +1 pe | +0,40 / −0,07  |
| Blandat | 108 | 1,19–1,92 | +0,04 | −0,02 (−0,1) | −1 pe | +3 pe | −0,07 / +0,06  |
| Direktspel | 106 | 1,39–1,65 | +0,10 | +0,04 (+0,3) | −3 pe | +0 pe | −0,01 / +0,16  |
| Lågpress | 86 | 1,33–1,84 | −0,01 | −0,06 (−0,5) | +0 pe | +2 pe | −0,13 / +0,10  |
| Mellanpress | 94 | 1,28–1,67 | +0,19 | +0,14 (+1,1) | +3 pe | +4 pe | +0,04 / +0,21 ✔ |
| Högpress | 96 | 1,25–1,77 | −0,02 | −0,08 (−0,6) | −5 pe | −2 pe | +0,07 / −0,16  |

- Svårast mot **Bollinnehav** (−0,17 p/match rel. eget snitt, z −1,4, 77 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,14 p/match rel. eget snitt, z +1,1, 94 m) – åt samma håll i båda halvorna men svagt

### Bayern Munich

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Lågpress** (faktiskt bollinnehav 70,4 %). 275 matcher med stil, mot marknaden totalt −0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 2,91–1,12 | −0,13 | −0,07 (−0,6) | +2 pe | +5 pe | −0,04 / −0,09 ✔ |
| Balanserat | 115 | 2,92–1,04 | +0,04 | +0,10 (+1,1) | +0 pe | +7 pe | +0,08 / +0,12 ✔ |
| Bollinnehav | 70 | 2,91–1,09 | −0,13 | −0,07 (−0,5) | +3 pe | +6 pe | −0,16 / +0,01  |
| Kortpass | 63 | 3,03–1,16 | +0,08 | +0,14 (+1,2) | +1 pe | +12 pe | −0,64 / +0,19  |
| Blandat | 105 | 2,64–1,15 | −0,20 | −0,14 (−1,2) | +4 pe | +5 pe | −0,12 / −0,18 ✔ |
| Direktspel | 107 | 3,12–0,96 | +0,00 | +0,06 (+0,6) | −0 pe | +4 pe | +0,11 / −0,05  |
| Lågpress | 83 | 2,82–1,05 | −0,07 | −0,01 (−0,1) | −0 pe | +9 pe | +0,00 / −0,04  |
| Mellanpress | 97 | 2,89–1,03 | +0,02 | +0,08 (+0,8) | +7 pe | +3 pe | −0,00 / +0,15  |
| Högpress | 95 | 3,03–1,16 | −0,13 | −0,07 (−0,6) | −2 pe | +7 pe | −0,06 / −0,08 ✔ |

- Svårast mot **Blandat** (−0,14 p/match rel. eget snitt, z −1,2, 105 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,14 p/match rel. eget snitt, z +1,2, 63 m) – inte stabilt, troligen slump

### Dortmund

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 48,6 %). 276 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 2,27–1,17 | +0,21 | +0,08 (+0,6) | −2 pe | +7 pe | +0,06 / +0,09 ✔ |
| Balanserat | 118 | 2,28–1,31 | +0,06 | −0,08 (−0,7) | −3 pe | +6 pe | −0,13 / −0,02 ✔ |
| Bollinnehav | 66 | 2,24–1,44 | +0,18 | +0,04 (+0,3) | −9 pe | +1 pe | +0,06 / +0,02 ✔ |
| Kortpass | 61 | 2,18–1,25 | +0,29 | +0,15 (+1,1) | −1 pe | −4 pe | +0,32 / +0,14  |
| Blandat | 103 | 2,22–1,33 | +0,13 | −0,01 (−0,1) | −10 pe | +10 pe | +0,04 / −0,08  |
| Direktspel | 112 | 2,36–1,29 | +0,07 | −0,07 (−0,7) | −1 pe | +5 pe | −0,10 / −0,02 ✔ |
| Lågpress | 79 | 2,25–1,20 | +0,23 | +0,10 (+0,7) | −4 pe | +3 pe | +0,11 / +0,06 ✔ |
| Mellanpress | 97 | 2,36–1,26 | +0,21 | +0,07 (+0,6) | −5 pe | +5 pe | −0,13 / +0,25  |
| Högpress | 100 | 2,19–1,40 | −0,01 | −0,14 (−1,2) | −4 pe | +6 pe | −0,11 / −0,16 ✔ |

- Svårast mot **Högpress** (−0,14 p/match rel. eget snitt, z −1,2, 100 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,15 p/match rel. eget snitt, z +1,1, 61 m) – inte stabilt, troligen slump

### Ein Frankfurt

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 49,6 %). 276 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,75–1,31 | +0,18 | +0,13 (+1,0) | +9 pe | +2 pe | +0,21 / +0,06 ✔ |
| Balanserat | 117 | 1,71–1,63 | −0,01 | −0,07 (−0,6) | +4 pe | +3 pe | −0,14 / +0,03  |
| Bollinnehav | 70 | 1,77–1,79 | +0,01 | −0,05 (−0,4) | +8 pe | +10 pe | +0,02 / −0,11  |
| Kortpass | 56 | 1,93–1,66 | +0,19 | +0,14 (+0,9) | +7 pe | +7 pe | +1,02 / +0,07  |
| Blandat | 109 | 1,65–1,57 | +0,08 | +0,02 (+0,2) | +10 pe | +4 pe | +0,03 / +0,02 ✔ |
| Direktspel | 111 | 1,73–1,52 | −0,04 | −0,09 (−0,8) | +3 pe | +3 pe | −0,09 / −0,10 ✔ |
| Lågpress | 86 | 1,94–1,69 | +0,07 | +0,02 (+0,1) | +5 pe | +14 pe | +0,07 / −0,11  |
| Mellanpress | 96 | 1,69–1,51 | +0,04 | −0,01 (−0,1) | +5 pe | +3 pe | −0,03 / +0,00  |
| Högpress | 94 | 1,61–1,52 | +0,05 | −0,00 (−0,0) | +10 pe | −3 pe | −0,11 / +0,06  |

- Svårast mot **Direktspel** (−0,09 p/match rel. eget snitt, z −0,8, 111 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,13 p/match rel. eget snitt, z +1,0, 89 m) – åt samma håll i båda halvorna men svagt

### Elversberg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 42,1 %). 62 matcher med stil, mot marknaden totalt +0,38 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 19 | 2,16–0,95 | +0,37 | −0,01 (−0,0) | +2 pe | +2 pe | +0,39 / −0,30  |
| Balanserat | 23 | 2,04–1,35 | +0,45 | +0,07 (+0,3) | +5 pe | +6 pe | +0,03 / +0,11 ✔ |
| Bollinnehav | 20 | 1,65–1,10 | +0,32 | −0,07 (−0,2) | −5 pe | −5 pe | −0,01 / −0,12 ✔ |
| Kortpass | 33 | 2,06–1,09 | +0,64 | +0,26 (+1,2) | −7 pe | +1 pe | +0,39 / +0,14 ✔ |
| Blandat | 27 | 1,93–1,19 | +0,16 | −0,23 (−1,0) | +9 pe | +6 pe | −0,10 / −0,37 ✔ |
| Direktspel | 2 | 0,50–1,50 | −0,87 | −1,25 (−10,3) | +24 pe | −57 pe | −1,42 / −1,08  |
| Lågpress | 24 | 1,92–1,25 | +0,23 | −0,15 (−0,6) | +4 pe | −1 pe | −0,24 / −0,12 ✔ |
| Mellanpress | 29 | 2,10–0,90 | +0,64 | +0,25 (+1,2) | −4 pe | +2 pe | +0,37 / +0,04 ✔ |
| Högpress | 9 | 1,56–1,67 | −0,04 | −0,43 (−1,1) | +8 pe | +6 pe | −0,34 / −0,73  |

- Svårast mot **Blandat** (−0,23 p/match rel. eget snitt, z −1,0, 27 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,26 p/match rel. eget snitt, z +1,2, 33 m) – åt samma håll i båda halvorna men svagt

### FC Koln

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 49,7 %). 266 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 1,35–1,40 | −0,02 | +0,09 (+0,7) | +9 pe | −8 pe | +0,16 / +0,02 ✔ |
| Balanserat | 113 | 1,58–1,62 | −0,11 | +0,00 (+0,0) | +4 pe | +0 pe | +0,13 / −0,14  |
| Bollinnehav | 75 | 1,39–1,95 | −0,20 | −0,09 (−0,7) | −6 pe | +7 pe | −0,03 / −0,16 ✔ |
| Kortpass | 54 | 1,35–1,72 | −0,33 | −0,22 (−1,5) | +5 pe | +2 pe | −0,43 / −0,21  |
| Blandat | 112 | 1,48–1,73 | +0,00 | +0,11 (+0,9) | +2 pe | −0 pe | +0,09 / +0,12 ✔ |
| Direktspel | 100 | 1,49–1,51 | −0,11 | +0,00 (+0,0) | +3 pe | −1 pe | +0,13 / −0,26  |
| Lågpress | 77 | 1,77–1,69 | −0,19 | −0,08 (−0,6) | −5 pe | +14 pe | +0,03 / −0,36  |
| Mellanpress | 101 | 1,46–1,64 | −0,05 | +0,05 (+0,5) | +3 pe | +4 pe | +0,16 / −0,04  |
| Högpress | 88 | 1,19–1,61 | −0,09 | +0,01 (+0,1) | +9 pe | −16 pe | +0,09 / −0,04  |

- Svårast mot **Kortpass** (−0,22 p/match rel. eget snitt, z −1,5, 54 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,11 p/match rel. eget snitt, z +0,9, 112 m) – åt samma håll i båda halvorna men svagt

### Freiburg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 53,1 %). 276 matcher med stil, mot marknaden totalt +0,17 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,39–1,51 | −0,08 | −0,25 (−2,0) | +2 pe | +7 pe | −0,24 / −0,25 ✔ ⚑ |
| Balanserat | 114 | 1,61–1,45 | +0,33 | +0,16 (+1,5) | +1 pe | +6 pe | +0,09 / +0,24 ✔ |
| Bollinnehav | 74 | 1,43–1,66 | +0,21 | +0,04 (+0,3) | +1 pe | +6 pe | +0,12 / −0,03  |
| Kortpass | 59 | 1,63–1,54 | +0,24 | +0,07 (+0,4) | +1 pe | +14 pe | +1,02 / −0,00  |
| Blandat | 109 | 1,43–1,47 | +0,21 | +0,04 (+0,4) | +2 pe | +1 pe | +0,05 / +0,03 ✔ |
| Direktspel | 108 | 1,48–1,57 | +0,09 | −0,08 (−0,7) | +0 pe | +7 pe | −0,10 / −0,03 ✔ |
| Lågpress | 84 | 1,46–1,61 | +0,12 | −0,05 (−0,4) | +2 pe | +5 pe | +0,00 / −0,17  |
| Mellanpress | 90 | 1,51–1,63 | +0,09 | −0,07 (−0,6) | +1 pe | +12 pe | +0,08 / −0,20  |
| Högpress | 102 | 1,50–1,36 | +0,27 | +0,10 (+0,9) | +0 pe | +2 pe | −0,11 / +0,23  |

- Svårast mot **Backar hem** (−0,25 p/match rel. eget snitt, z −2,0, 88 m) – ⚑ håller i båda halvorna
- Bäst mot **Balanserat** (+0,16 p/match rel. eget snitt, z +1,5, 114 m) – åt samma håll i båda halvorna men svagt

### Hamburg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 41,6 %). 238 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,64–1,43 | −0,15 | −0,11 (−0,8) | +13 pe | +0 pe | −0,27 / +0,03  |
| Balanserat | 90 | 2,04–1,28 | +0,10 | +0,14 (+1,0) | −9 pe | +11 pe | −0,04 / +0,32  |
| Bollinnehav | 78 | 1,51–1,35 | −0,11 | −0,06 (−0,5) | +13 pe | −8 pe | −0,11 / −0,01 ✔ |
| Kortpass | 59 | 1,53–1,47 | +0,04 | +0,09 (+0,6) | −1 pe | +0 pe | +0,12 / +0,08  |
| Blandat | 95 | 1,81–1,31 | −0,07 | −0,03 (−0,2) | +7 pe | +0 pe | −0,11 / +0,07  |
| Direktspel | 84 | 1,85–1,30 | −0,07 | −0,03 (−0,2) | +5 pe | +4 pe | −0,15 / +0,35  |
| Lågpress | 64 | 1,56–1,44 | −0,08 | −0,04 (−0,2) | +2 pe | +11 pe | −0,17 / +0,29  |
| Mellanpress | 94 | 1,85–1,30 | +0,02 | +0,06 (+0,5) | +4 pe | +1 pe | −0,11 / +0,18  |
| Högpress | 80 | 1,79–1,32 | −0,08 | −0,04 (−0,3) | +7 pe | −5 pe | −0,09 / +0,00  |

- Svårast mot **Backar hem** (−0,11 p/match rel. eget snitt, z −0,8, 70 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,14 p/match rel. eget snitt, z +1,0, 90 m) – inte stabilt, troligen slump

### Hoffenheim

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 56,8 %). 276 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,60–1,58 | −0,18 | −0,13 (−1,0) | +1 pe | +1 pe | −0,14 / −0,12 ✔ |
| Balanserat | 118 | 1,83–1,69 | +0,13 | +0,19 (+1,5) | −6 pe | +9 pe | +0,27 / +0,09 ✔ |
| Bollinnehav | 65 | 1,54–1,92 | −0,21 | −0,16 (−1,1) | +14 pe | +5 pe | −0,31 / −0,00 ✔ |
| Kortpass | 57 | 1,75–1,89 | −0,15 | −0,10 (−0,6) | −3 pe | +13 pe | −0,49 / −0,08  |
| Blandat | 105 | 1,67–1,65 | +0,08 | +0,13 (+1,1) | +6 pe | +1 pe | +0,14 / +0,12 ✔ |
| Direktspel | 114 | 1,67–1,68 | −0,12 | −0,07 (−0,6) | −2 pe | +6 pe | −0,08 / −0,06 ✔ |
| Lågpress | 81 | 1,83–1,74 | −0,11 | −0,06 (−0,4) | +5 pe | +8 pe | −0,06 / −0,05 ✔ |
| Mellanpress | 98 | 1,54–1,64 | −0,04 | +0,02 (+0,1) | −2 pe | +3 pe | +0,07 / −0,03  |
| Högpress | 97 | 1,71–1,75 | −0,02 | +0,03 (+0,2) | −0 pe | +5 pe | +0,03 / +0,03 ✔ |

- Svårast mot **Bollinnehav** (−0,16 p/match rel. eget snitt, z −1,1, 65 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,19 p/match rel. eget snitt, z +1,5, 118 m) – åt samma håll i båda halvorna men svagt

### Leverkusen

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 61,2 %). 276 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 2,04–1,00 | +0,18 | +0,09 (+0,8) | +0 pe | −1 pe | −0,09 / +0,26  |
| Balanserat | 116 | 2,05–1,37 | +0,11 | +0,03 (+0,3) | +0 pe | +2 pe | +0,04 / +0,03 ✔ |
| Bollinnehav | 68 | 1,96–1,46 | −0,10 | −0,18 (−1,2) | −0 pe | +6 pe | −0,22 / −0,15 ✔ |
| Kortpass | 59 | 2,27–1,24 | +0,10 | +0,02 (+0,1) | +5 pe | +7 pe | +0,58 / −0,02  |
| Blandat | 100 | 1,97–1,50 | +0,04 | −0,04 (−0,3) | −0 pe | +5 pe | −0,14 / +0,08  |
| Direktspel | 117 | 1,95–1,09 | +0,10 | +0,02 (+0,2) | −2 pe | −4 pe | −0,04 / +0,16  |
| Lågpress | 83 | 1,83–1,48 | −0,08 | −0,17 (−1,1) | −5 pe | +2 pe | −0,11 / −0,31 ✔ |
| Mellanpress | 93 | 2,12–1,06 | +0,22 | +0,14 (+1,2) | +3 pe | −0 pe | +0,12 / +0,15 ✔ |
| Högpress | 100 | 2,10–1,28 | +0,09 | +0,01 (+0,1) | +1 pe | +3 pe | −0,19 / +0,12  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,2, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,14 p/match rel. eget snitt, z +1,2, 93 m) – åt samma håll i båda halvorna men svagt

### M'gladbach

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 47,6 %). 276 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,45–1,47 | −0,10 | −0,07 (−0,6) | +7 pe | −0 pe | +0,11 / −0,22  |
| Balanserat | 119 | 1,67–1,60 | +0,04 | +0,07 (+0,6) | +0 pe | +2 pe | +0,16 / −0,03  |
| Bollinnehav | 66 | 1,80–1,86 | −0,06 | −0,03 (−0,2) | −2 pe | +13 pe | −0,18 / +0,15  |
| Kortpass | 55 | 1,38–1,91 | −0,33 | −0,30 (−2,0) | +3 pe | +3 pe | −1,40 / −0,21  |
| Blandat | 105 | 1,63–1,70 | −0,01 | +0,02 (+0,2) | −3 pe | +4 pe | +0,13 / −0,11  |
| Direktspel | 116 | 1,75–1,41 | +0,09 | +0,12 (+1,0) | +6 pe | +5 pe | +0,08 / +0,22 ✔ |
| Lågpress | 77 | 1,42–1,39 | −0,00 | +0,03 (+0,2) | −4 pe | −3 pe | +0,16 / −0,32  |
| Mellanpress | 97 | 1,60–1,67 | −0,12 | −0,09 (−0,8) | +3 pe | +6 pe | −0,21 / +0,00  |
| Högpress | 102 | 1,82–1,75 | +0,04 | +0,07 (+0,5) | +5 pe | +7 pe | +0,23 / −0,02  |

- Svårast mot **Kortpass** (−0,30 p/match rel. eget snitt, z −2,0, 55 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,12 p/match rel. eget snitt, z +1,0, 116 m) – åt samma håll i båda halvorna men svagt

### Mainz

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 51,1 %). 276 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,25–1,48 | −0,06 | −0,06 (−0,4) | +2 pe | +2 pe | +0,02 / −0,13  |
| Balanserat | 121 | 1,55–1,64 | +0,12 | +0,12 (+1,0) | −2 pe | +4 pe | +0,23 / −0,02  |
| Bollinnehav | 75 | 1,24–1,53 | −0,12 | −0,12 (−0,9) | +5 pe | −7 pe | −0,21 / −0,04 ✔ |
| Kortpass | 63 | 1,40–1,27 | +0,05 | +0,05 (+0,3) | +8 pe | −6 pe | −0,05 / +0,06  |
| Blandat | 103 | 1,38–1,66 | −0,06 | −0,06 (−0,5) | +4 pe | +0 pe | −0,03 / −0,11 ✔ |
| Direktspel | 110 | 1,37–1,64 | +0,03 | +0,03 (+0,3) | −5 pe | +5 pe | +0,13 / −0,19  |
| Lågpress | 87 | 1,36–1,70 | −0,00 | −0,00 (−0,0) | +4 pe | +6 pe | +0,06 / −0,15  |
| Mellanpress | 98 | 1,33–1,56 | +0,05 | +0,05 (+0,3) | −4 pe | −0 pe | +0,10 / −0,00  |
| Högpress | 91 | 1,46–1,43 | −0,04 | −0,05 (−0,3) | +4 pe | −3 pe | +0,00 / −0,07  |

- Svårast mot **Bollinnehav** (−0,12 p/match rel. eget snitt, z −0,9, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,12 p/match rel. eget snitt, z +1,0, 121 m) – inte stabilt, troligen slump

### Paderborn

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 46,7 %). 210 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,46–1,54 | −0,21 | −0,19 (−1,2) | +0 pe | +3 pe | −0,07 / −0,32 ✔ |
| Balanserat | 87 | 1,71–1,63 | +0,02 | +0,05 (+0,3) | −3 pe | +8 pe | −0,08 / +0,18  |
| Bollinnehav | 55 | 1,64–1,56 | +0,13 | +0,16 (+0,9) | +1 pe | +1 pe | −0,10 / +0,36  |
| Kortpass | 59 | 1,54–1,47 | +0,04 | +0,07 (+0,4) | −5 pe | +6 pe | −0,81 / +0,18  |
| Blandat | 71 | 1,73–1,92 | −0,09 | −0,06 (−0,4) | −0 pe | +5 pe | +0,08 / −0,21  |
| Direktspel | 80 | 1,55–1,38 | −0,02 | +0,01 (+0,0) | +2 pe | +3 pe | −0,10 / +0,34  |
| Lågpress | 51 | 1,49–1,65 | −0,21 | −0,18 (−1,1) | +1 pe | +2 pe | −0,13 / −0,24 ✔ |
| Mellanpress | 82 | 1,57–1,67 | −0,05 | −0,02 (−0,1) | +0 pe | +3 pe | −0,06 / +0,02  |
| Högpress | 77 | 1,73–1,45 | +0,11 | +0,14 (+0,9) | −3 pe | +8 pe | −0,07 / +0,34  |

- Svårast mot **Backar hem** (−0,19 p/match rel. eget snitt, z −1,2, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,16 p/match rel. eget snitt, z +0,9, 55 m) – inte stabilt, troligen slump

### RB Leipzig

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 57,8 %). 276 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 84 | 2,07–1,23 | −0,12 | −0,12 (−0,9) | +4 pe | +11 pe | −0,28 / +0,02  |
| Balanserat | 116 | 2,12–1,15 | +0,06 | +0,07 (+0,6) | +2 pe | −1 pe | −0,01 / +0,15  |
| Bollinnehav | 76 | 1,64–1,04 | +0,02 | +0,03 (+0,2) | +1 pe | −12 pe | +0,10 / −0,04  |
| Kortpass | 60 | 2,02–1,13 | +0,12 | +0,13 (+0,9) | −4 pe | −0 pe | +0,40 / +0,11  |
| Blandat | 102 | 1,93–1,28 | +0,02 | +0,03 (+0,2) | −2 pe | +1 pe | +0,05 / −0,00  |
| Direktspel | 114 | 1,99–1,02 | −0,10 | −0,09 (−0,9) | +10 pe | −1 pe | −0,16 / +0,03  |
| Lågpress | 85 | 1,96–1,14 | +0,04 | +0,05 (+0,4) | +1 pe | +0 pe | +0,14 / −0,18  |
| Mellanpress | 92 | 1,90–1,11 | −0,04 | −0,03 (−0,3) | +3 pe | −3 pe | −0,39 / +0,28  |
| Högpress | 99 | 2,05–1,17 | −0,02 | −0,01 (−0,1) | +3 pe | +2 pe | +0,02 / −0,02  |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 84 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,13 p/match rel. eget snitt, z +0,9, 60 m) – inte stabilt, troligen slump

### Schalke 04

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 36,0 %). 254 matcher med stil, mot marknaden totalt −0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,40–1,66 | +0,04 | +0,16 (+1,1) | −1 pe | +11 pe | −0,07 / +0,38  |
| Balanserat | 115 | 1,17–1,80 | −0,17 | −0,05 (−0,5) | +3 pe | −0 pe | −0,18 / +0,11  |
| Bollinnehav | 69 | 1,33–1,91 | −0,21 | −0,09 (−0,6) | −5 pe | +3 pe | +0,01 / −0,16  |
| Kortpass | 50 | 1,52–1,62 | +0,01 | +0,14 (+0,7) | −4 pe | +4 pe | +0,96 / +0,10  |
| Blandat | 107 | 1,31–1,82 | −0,12 | −0,00 (−0,0) | +1 pe | +3 pe | −0,08 / +0,08  |
| Direktspel | 97 | 1,11–1,85 | −0,19 | −0,07 (−0,6) | −0 pe | +5 pe | −0,15 / +0,17  |
| Lågpress | 86 | 1,19–1,57 | −0,19 | −0,06 (−0,5) | +2 pe | −1 pe | −0,27 / +0,36  |
| Mellanpress | 102 | 1,27–1,88 | −0,15 | −0,03 (−0,3) | +1 pe | +7 pe | −0,17 / +0,09  |
| Högpress | 66 | 1,39–1,94 | +0,01 | +0,13 (+0,9) | −5 pe | +6 pe | +0,49 / −0,04  |

- Svårast mot **Direktspel** (−0,07 p/match rel. eget snitt, z −0,6, 97 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,16 p/match rel. eget snitt, z +1,1, 70 m) – inte stabilt, troligen slump

### Stuttgart

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 53,2 %). 270 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 87 | 1,79–1,48 | +0,08 | +0,14 (+1,1) | −1 pe | +8 pe | +0,04 / +0,21 ✔ |
| Balanserat | 109 | 1,68–1,48 | −0,03 | +0,02 (+0,2) | +2 pe | +5 pe | +0,01 / +0,03 ✔ |
| Bollinnehav | 74 | 1,49–1,82 | −0,25 | −0,20 (−1,4) | +1 pe | +1 pe | −0,27 / −0,10 ✔ |
| Kortpass | 59 | 1,90–1,46 | −0,05 | +0,01 (+0,0) | +2 pe | +5 pe | +0,53 / −0,03  |
| Blandat | 109 | 1,64–1,76 | −0,10 | −0,05 (−0,5) | −1 pe | +7 pe | −0,05 / −0,05 ✔ |
| Direktspel | 102 | 1,55–1,44 | −0,00 | +0,05 (+0,4) | +1 pe | +3 pe | −0,12 / +0,34  |
| Lågpress | 79 | 1,51–1,75 | −0,06 | −0,00 (−0,0) | −2 pe | +5 pe | +0,02 / −0,06  |
| Mellanpress | 92 | 1,65–1,64 | −0,22 | −0,17 (−1,4) | +1 pe | +3 pe | −0,38 / −0,01 ✔ |
| Högpress | 99 | 1,80–1,37 | +0,11 | +0,16 (+1,4) | +3 pe | +6 pe | +0,14 / +0,18 ✔ |

- Svårast mot **Bollinnehav** (−0,20 p/match rel. eget snitt, z −1,4, 74 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,16 p/match rel. eget snitt, z +1,4, 99 m) – åt samma håll i båda halvorna men svagt

### Union Berlin

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 45,8 %). 272 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 75 | 1,31–1,40 | +0,08 | −0,00 (−0,0) | +1 pe | +9 pe | +0,05 / −0,05  |
| Balanserat | 116 | 1,19–1,45 | +0,03 | −0,05 (−0,5) | −2 pe | −6 pe | +0,21 / −0,35  |
| Bollinnehav | 81 | 1,49–1,52 | +0,17 | +0,08 (+0,6) | +6 pe | +5 pe | +0,09 / +0,07 ✔ |
| Kortpass | 63 | 1,22–1,43 | −0,01 | −0,10 (−0,6) | +3 pe | +1 pe | +0,10 / −0,11  |
| Blandat | 109 | 1,32–1,39 | +0,29 | +0,21 (+1,7) | +3 pe | −0 pe | +0,28 / +0,10 ✔ |
| Direktspel | 100 | 1,36–1,55 | −0,08 | −0,17 (−1,4) | −2 pe | +3 pe | −0,00 / −0,51 ✔ |
| Lågpress | 78 | 1,33–1,37 | +0,19 | +0,10 (+0,7) | +3 pe | +2 pe | +0,23 / −0,19  |
| Mellanpress | 91 | 1,32–1,38 | +0,20 | +0,11 (+0,9) | +2 pe | −0 pe | +0,11 / +0,11 ✔ |
| Högpress | 103 | 1,29–1,58 | −0,08 | −0,17 (−1,4) | −1 pe | +2 pe | +0,03 / −0,29  |

- Svårast mot **Direktspel** (−0,17 p/match rel. eget snitt, z −1,4, 100 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,21 p/match rel. eget snitt, z +1,7, 109 m) – åt samma håll i båda halvorna men svagt

### Werder Bremen

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 48,8 %). 270 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,49–1,71 | −0,04 | −0,02 (−0,2) | −10 pe | +11 pe | +0,05 / −0,08  |
| Balanserat | 111 | 1,46–1,69 | +0,01 | +0,03 (+0,2) | +5 pe | −3 pe | −0,03 / +0,09  |
| Bollinnehav | 68 | 1,32–1,63 | −0,03 | −0,01 (−0,1) | +11 pe | −7 pe | −0,13 / +0,11  |
| Kortpass | 62 | 1,42–1,82 | −0,07 | −0,05 (−0,3) | +4 pe | +3 pe | −0,12 / −0,05  |
| Blandat | 98 | 1,29–1,76 | −0,03 | −0,01 (−0,1) | +4 pe | −4 pe | −0,13 / +0,14  |
| Direktspel | 110 | 1,58–1,55 | +0,02 | +0,04 (+0,4) | −3 pe | +3 pe | +0,05 / +0,03 ✔ |
| Lågpress | 85 | 1,48–1,82 | −0,02 | −0,00 (−0,0) | +2 pe | +3 pe | +0,08 / −0,16  |
| Mellanpress | 105 | 1,33–1,70 | −0,14 | −0,12 (−1,0) | +1 pe | +3 pe | −0,26 / +0,04  |
| Högpress | 80 | 1,52–1,51 | +0,14 | +0,15 (+1,1) | +1 pe | −4 pe | +0,26 / +0,11 ✔ |

- Svårast mot **Mellanpress** (−0,12 p/match rel. eget snitt, z −1,0, 105 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,15 p/match rel. eget snitt, z +1,1, 80 m) – åt samma håll i båda halvorna men svagt
