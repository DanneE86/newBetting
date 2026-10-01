# Stilmatchning – Premier League (PL)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 3090 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 192 m · hemma −0,13 · kryss +0 pe · ö2,5 −6 pe | 272 m · hemma +0,02 · kryss +3 pe · ö2,5 −3 pe | 327 m · hemma +0,05 · kryss −0 pe · ö2,5 −2 pe |
| **Mellan** | 272 m · hemma −0,25 · kryss +3 pe · ö2,5 +5 pe | 400 m · hemma +0,19 · kryss −5 pe · ö2,5 +1 pe | 433 m · hemma +0,12 · kryss −4 pe · ö2,5 +3 pe |
| **Mycket boll** | 328 m · hemma −0,10 · kryss −3 pe · ö2,5 −1 pe | 429 m · hemma −0,05 · kryss −1 pe · ö2,5 −1 pe | 437 m · hemma −0,05 · kryss +2 pe · ö2,5 +2 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 301 m · hemma −0,04 · kryss +1 pe · ö2,5 −2 pe | 407 m · hemma +0,04 · kryss −2 pe · ö2,5 +0 pe | 289 m · hemma +0,11 · kryss −2 pe · ö2,5 +0 pe |
| **Balanserat** | 407 m · hemma −0,04 · kryss −0 pe · ö2,5 −1 pe | 490 m · hemma +0,01 · kryss +0 pe · ö2,5 +0 pe | 350 m · hemma +0,12 · kryss +0 pe · ö2,5 +2 pe |
| **Bollinnehav** | 291 m · hemma −0,13 · kryss −0 pe · ö2,5 −1 pe | 348 m · hemma −0,07 · kryss −4 pe · ö2,5 +0 pe | 207 m · hemma −0,11 · kryss +0 pe · ö2,5 +5 pe |

## Lag (säsong 2026/27)

### Arsenal

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 59,3 %). 309 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 98 | 1,89–1,01 | −0,04 | −0,13 (−1,0) | −2 pe | +4 pe | −0,21 / −0,06 ✔ |
| Balanserat | 124 | 1,65–1,16 | +0,03 | −0,07 (−0,6) | +1 pe | −3 pe | −0,17 / +0,08  |
| Bollinnehav | 87 | 2,10–0,92 | +0,32 | +0,23 (+2,1) | −7 pe | +2 pe | +0,38 / +0,11 ✔ ⚑ |
| Kortpass | 76 | 2,05–0,82 | +0,23 | +0,14 (+1,2) | −2 pe | −2 pe | −0,11 / +0,18  |
| Blandat | 127 | 1,97–1,07 | +0,11 | +0,02 (+0,2) | −3 pe | +8 pe | +0,13 / −0,08  |
| Direktspel | 106 | 1,57–1,18 | −0,03 | −0,12 (−1,0) | −2 pe | −6 pe | −0,14 / −0,02 ✔ |
| Lågpress | 82 | 1,72–1,05 | +0,13 | +0,04 (+0,3) | −2 pe | −5 pe | −0,06 / +0,30  |
| Mellanpress | 114 | 1,75–1,07 | +0,06 | −0,03 (−0,3) | −4 pe | +3 pe | −0,03 / −0,03 ✔ |
| Högpress | 113 | 2,04–1,02 | +0,10 | +0,01 (+0,1) | −0 pe | +2 pe | +0,00 / +0,01 ✔ |

- Svårast mot **Direktspel** (−0,12 p/match rel. eget snitt, z −1,0, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,23 p/match rel. eget snitt, z +2,1, 87 m) – ⚑ håller i båda halvorna

### Aston Villa

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 45,9 %). 311 matcher med stil, mot marknaden totalt +0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,42–1,28 | +0,07 | −0,05 (−0,4) | +0 pe | −2 pe | −0,10 / −0,01 ✔ |
| Balanserat | 120 | 1,48–1,63 | +0,04 | −0,08 (−0,7) | −3 pe | +10 pe | −0,27 / +0,19  |
| Bollinnehav | 89 | 1,61–1,24 | +0,29 | +0,17 (+1,3) | −7 pe | +3 pe | +0,08 / +0,24 ✔ |
| Kortpass | 79 | 1,72–1,43 | +0,41 | +0,29 (+2,0) | −12 pe | +14 pe | −0,02 / +0,36  |
| Blandat | 132 | 1,44–1,38 | +0,02 | −0,10 (−0,9) | −3 pe | +1 pe | −0,17 / −0,04 ✔ |
| Direktspel | 100 | 1,39–1,41 | +0,03 | −0,09 (−0,8) | +4 pe | +0 pe | −0,11 / −0,03 ✔ |
| Lågpress | 81 | 1,42–1,44 | +0,01 | −0,11 (−0,8) | −2 pe | +6 pe | −0,21 / +0,32  |
| Mellanpress | 111 | 1,41–1,38 | +0,14 | +0,02 (+0,2) | −3 pe | +2 pe | −0,05 / +0,09  |
| Högpress | 119 | 1,63–1,39 | +0,18 | +0,06 (+0,5) | −4 pe | +5 pe | −0,11 / +0,11  |

- Svårast mot **Blandat** (−0,10 p/match rel. eget snitt, z −0,9, 132 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,29 p/match rel. eget snitt, z +2,0, 79 m) – inte stabilt, troligen slump

### Bournemouth

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress** (faktiskt bollinnehav 47,7 %). 325 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 117 | 1,33–1,40 | −0,11 | −0,16 (−1,4) | +3 pe | −1 pe | −0,34 / +0,00  |
| Balanserat | 120 | 1,36–1,60 | +0,09 | +0,04 (+0,4) | +3 pe | +6 pe | +0,07 / −0,00  |
| Bollinnehav | 88 | 1,56–1,25 | +0,20 | +0,16 (+1,2) | −4 pe | −0 pe | +0,08 / +0,22 ✔ |
| Kortpass | 81 | 1,46–1,16 | +0,17 | +0,12 (+1,0) | +10 pe | −7 pe | +0,19 / +0,11 ✔ |
| Blandat | 128 | 1,38–1,46 | −0,02 | −0,07 (−0,7) | +2 pe | +4 pe | −0,14 / −0,02 ✔ |
| Direktspel | 116 | 1,39–1,59 | +0,04 | −0,01 (−0,1) | −7 pe | +6 pe | −0,06 / +0,19  |
| Lågpress | 87 | 1,37–1,40 | +0,01 | −0,03 (−0,3) | +3 pe | −2 pe | −0,05 / +0,03  |
| Mellanpress | 122 | 1,31–1,39 | −0,01 | −0,06 (−0,5) | −1 pe | +2 pe | −0,15 / +0,05  |
| Högpress | 116 | 1,53–1,51 | +0,13 | +0,08 (+0,7) | +1 pe | +4 pe | +0,08 / +0,09 ✔ |

- Svårast mot **Backar hem** (−0,16 p/match rel. eget snitt, z −1,4, 117 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,16 p/match rel. eget snitt, z +1,2, 88 m) – åt samma håll i båda halvorna men svagt

### Brentford

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 45,2 %). 321 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 112 | 1,56–1,28 | +0,19 | +0,14 (+1,2) | +4 pe | −3 pe | +0,09 / +0,17 ✔ |
| Balanserat | 118 | 1,48–1,34 | −0,04 | −0,10 (−0,9) | −1 pe | −1 pe | −0,06 / −0,14 ✔ |
| Bollinnehav | 91 | 1,59–1,15 | +0,01 | −0,04 (−0,3) | +3 pe | +3 pe | −0,26 / +0,14  |
| Kortpass | 91 | 1,64–1,23 | +0,17 | +0,11 (+0,9) | +6 pe | +6 pe | −0,14 / +0,18  |
| Blandat | 130 | 1,43–1,33 | +0,02 | −0,04 (−0,3) | −2 pe | −3 pe | −0,03 / −0,04 ✔ |
| Direktspel | 100 | 1,60–1,21 | +0,00 | −0,05 (−0,4) | +2 pe | −2 pe | −0,06 / −0,01 ✔ |
| Lågpress | 90 | 1,71–1,13 | +0,19 | +0,13 (+1,0) | +0 pe | +3 pe | +0,05 / +0,41 ✔ |
| Mellanpress | 118 | 1,42–1,32 | −0,05 | −0,10 (−1,0) | +1 pe | −1 pe | −0,07 / −0,14 ✔ |
| Högpress | 113 | 1,53–1,31 | +0,06 | +0,00 (+0,0) | +3 pe | −2 pe | −0,28 / +0,11  |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −1,0, 118 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,14 p/match rel. eget snitt, z +1,2, 112 m) – åt samma håll i båda halvorna men svagt

### Brighton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 64,8 %). 309 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 103 | 1,26–1,30 | −0,13 | −0,09 (−0,7) | +6 pe | −4 pe | −0,11 / −0,07 ✔ |
| Balanserat | 126 | 1,33–1,43 | +0,09 | +0,13 (+1,2) | −3 pe | +3 pe | +0,02 / +0,30 ✔ |
| Bollinnehav | 80 | 1,49–1,44 | −0,14 | −0,10 (−0,8) | +20 pe | −0 pe | −0,01 / −0,18 ✔ |
| Kortpass | 73 | 1,77–1,44 | −0,04 | +0,00 (+0,0) | +6 pe | +10 pe | +0,32 / −0,06  |
| Blandat | 134 | 1,25–1,40 | −0,07 | −0,03 (−0,3) | +6 pe | −5 pe | −0,21 / +0,12  |
| Direktspel | 102 | 1,19–1,34 | −0,01 | +0,04 (+0,3) | +7 pe | −2 pe | +0,06 / −0,07  |
| Lågpress | 83 | 1,27–1,33 | −0,05 | −0,01 (−0,1) | +4 pe | +1 pe | +0,01 / −0,07  |
| Mellanpress | 116 | 1,23–1,47 | −0,09 | −0,05 (−0,5) | +4 pe | −1 pe | −0,16 / +0,10  |
| Högpress | 110 | 1,54–1,35 | +0,02 | +0,06 (+0,5) | +9 pe | −0 pe | +0,25 / +0,00 ✔ |

- Svårast mot **Bollinnehav** (−0,10 p/match rel. eget snitt, z −0,8, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,13 p/match rel. eget snitt, z +1,2, 126 m) – åt samma håll i båda halvorna men svagt

### Chelsea

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 47,5 %). 309 matcher med stil, mot marknaden totalt −0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,60–1,12 | −0,21 | −0,04 (−0,4) | +4 pe | −4 pe | +0,16 / −0,18  |
| Balanserat | 125 | 1,43–1,32 | −0,34 | −0,17 (−1,6) | +8 pe | +0 pe | −0,09 / −0,30 ✔ |
| Bollinnehav | 80 | 2,10–1,23 | +0,16 | +0,32 (+2,4) | −13 pe | +11 pe | +0,24 / +0,39 ✔ ⚑ |
| Kortpass | 74 | 1,85–1,38 | −0,08 | +0,09 (+0,6) | −8 pe | +11 pe | +0,21 / +0,06 ✔ |
| Blandat | 131 | 1,59–1,25 | −0,22 | −0,06 (−0,5) | +8 pe | −3 pe | −0,00 / −0,10 ✔ |
| Direktspel | 104 | 1,62–1,09 | −0,16 | +0,01 (+0,1) | +1 pe | +0 pe | +0,07 / −0,23  |
| Lågpress | 83 | 1,53–1,13 | −0,22 | −0,05 (−0,4) | +3 pe | −1 pe | +0,04 / −0,35  |
| Mellanpress | 113 | 1,63–1,20 | −0,22 | −0,05 (−0,5) | −2 pe | +3 pe | +0,02 / −0,15  |
| Högpress | 113 | 1,79–1,32 | −0,07 | +0,09 (+0,8) | +5 pe | +2 pe | +0,14 / +0,07 ✔ |

- Svårast mot **Balanserat** (−0,17 p/match rel. eget snitt, z −1,6, 125 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,32 p/match rel. eget snitt, z +2,4, 80 m) – ⚑ håller i båda halvorna

### Coventry

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 39,0 %). 281 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,31–1,06 | +0,03 | +0,01 (+0,1) | −5 pe | −3 pe | +0,04 / −0,03  |
| Balanserat | 118 | 1,51–1,25 | +0,04 | +0,02 (+0,1) | −2 pe | +4 pe | −0,02 / +0,05  |
| Bollinnehav | 73 | 1,41–1,30 | −0,02 | −0,04 (−0,3) | +9 pe | +2 pe | −0,15 / +0,05  |
| Kortpass | 101 | 1,65–1,07 | +0,22 | +0,20 (+1,6) | +2 pe | +1 pe | +0,40 / +0,14 ✔ |
| Blandat | 108 | 1,30–1,47 | −0,19 | −0,21 (−1,8) | −1 pe | +6 pe | −0,22 / −0,21 ✔ |
| Direktspel | 72 | 1,28–0,99 | +0,06 | +0,04 (+0,3) | −2 pe | −6 pe | −0,01 / +0,32  |
| Lågpress | 57 | 1,61–1,09 | +0,09 | +0,07 (+0,4) | +1 pe | +9 pe | +0,30 / −0,23  |
| Mellanpress | 113 | 1,36–1,34 | −0,10 | −0,12 (−1,1) | +3 pe | +0 pe | −0,28 / +0,00  |
| Högpress | 111 | 1,38–1,13 | +0,11 | +0,09 (+0,7) | −5 pe | −2 pe | +0,01 / +0,18 ✔ |

- Svårast mot **Blandat** (−0,21 p/match rel. eget snitt, z −1,8, 108 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,20 p/match rel. eget snitt, z +1,6, 101 m) – åt samma håll i båda halvorna men svagt

### Crystal Palace

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress** (faktiskt bollinnehav 43,5 %). 309 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 97 | 1,01–1,38 | −0,15 | −0,22 (−1,9) | +1 pe | −5 pe | −0,18 / −0,24 ✔ |
| Balanserat | 125 | 1,11–1,51 | +0,04 | −0,03 (−0,3) | +5 pe | −6 pe | +0,04 / −0,14  |
| Bollinnehav | 87 | 1,51–1,29 | +0,37 | +0,29 (+2,4) | +2 pe | +3 pe | +0,23 / +0,35 ✔ ⚑ |
| Kortpass | 75 | 1,29–1,32 | +0,21 | +0,13 (+1,0) | +2 pe | −0 pe | +0,38 / +0,09 ✔ |
| Blandat | 130 | 1,31–1,46 | +0,11 | +0,04 (+0,4) | +7 pe | −1 pe | +0,19 / −0,09  |
| Direktspel | 104 | 0,97–1,40 | −0,07 | −0,14 (−1,2) | −1 pe | −8 pe | −0,12 / −0,21 ✔ |
| Lågpress | 83 | 1,11–1,43 | +0,05 | −0,02 (−0,2) | −2 pe | −3 pe | −0,03 / +0,01  |
| Mellanpress | 116 | 1,09–1,36 | −0,01 | −0,08 (−0,8) | +1 pe | −5 pe | +0,03 / −0,20  |
| Högpress | 110 | 1,35–1,44 | +0,18 | +0,10 (+1,0) | +8 pe | −2 pe | +0,20 / +0,07 ✔ |

- Svårast mot **Backar hem** (−0,22 p/match rel. eget snitt, z −1,9, 97 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,29 p/match rel. eget snitt, z +2,4, 87 m) – ⚑ håller i båda halvorna

### Everton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress** (faktiskt bollinnehav 43,6 %). 309 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 95 | 1,18–1,29 | +0,07 | +0,05 (+0,4) | −2 pe | −1 pe | −0,07 / +0,15  |
| Balanserat | 126 | 1,10–1,52 | −0,10 | −0,11 (−1,1) | +2 pe | −5 pe | −0,12 / −0,10 ✔ |
| Bollinnehav | 88 | 1,22–1,22 | +0,12 | +0,10 (+0,8) | +0 pe | −14 pe | +0,11 / +0,09 ✔ |
| Kortpass | 81 | 1,25–1,36 | +0,21 | +0,19 (+1,3) | −0 pe | −7 pe | −0,12 / +0,25  |
| Blandat | 134 | 1,06–1,37 | −0,05 | −0,07 (−0,7) | +3 pe | −7 pe | +0,07 / −0,19  |
| Direktspel | 94 | 1,21–1,36 | −0,06 | −0,07 (−0,5) | −2 pe | −4 pe | −0,13 / +0,21  |
| Lågpress | 84 | 1,17–1,38 | −0,05 | −0,07 (−0,5) | −0 pe | −3 pe | −0,16 / +0,25  |
| Mellanpress | 114 | 1,13–1,36 | −0,02 | −0,03 (−0,3) | −1 pe | −5 pe | +0,02 / −0,10  |
| Högpress | 111 | 1,17–1,35 | +0,10 | +0,09 (+0,8) | +2 pe | −10 pe | +0,09 / +0,09 ✔ |

- Svårast mot **Balanserat** (−0,11 p/match rel. eget snitt, z −1,1, 126 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,19 p/match rel. eget snitt, z +1,3, 81 m) – inte stabilt, troligen slump

### Fulham

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 54,3 %). 319 matcher med stil, mot marknaden totalt +0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 109 | 1,17–1,21 | −0,08 | −0,09 (−0,8) | −1 pe | −9 pe | −0,05 / −0,11 ✔ |
| Balanserat | 127 | 1,45–1,56 | −0,00 | −0,02 (−0,2) | −4 pe | +3 pe | −0,11 / +0,10  |
| Bollinnehav | 83 | 1,53–1,34 | +0,16 | +0,14 (+1,0) | −6 pe | +4 pe | −0,09 / +0,37  |
| Kortpass | 74 | 1,54–1,31 | +0,26 | +0,25 (+1,6) | −13 pe | +5 pe | −0,08 / +0,29  |
| Blandat | 135 | 1,38–1,39 | −0,04 | −0,06 (−0,5) | +1 pe | −1 pe | −0,18 / +0,06  |
| Direktspel | 110 | 1,26–1,43 | −0,08 | −0,10 (−1,0) | −2 pe | −5 pe | −0,02 / −0,42 ✔ |
| Lågpress | 85 | 1,22–1,38 | −0,17 | −0,18 (−1,5) | −1 pe | −10 pe | −0,26 / +0,05  |
| Mellanpress | 118 | 1,34–1,42 | −0,04 | −0,06 (−0,5) | −8 pe | +3 pe | +0,01 / −0,15  |
| Högpress | 116 | 1,53–1,35 | +0,20 | +0,19 (+1,6) | −1 pe | +1 pe | +0,06 / +0,23 ✔ |

- Svårast mot **Lågpress** (−0,18 p/match rel. eget snitt, z −1,5, 85 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,6, 116 m) – åt samma håll i båda halvorna men svagt

### Hull

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress** (faktiskt bollinnehav 32,3 %). 361 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,36–1,32 | +0,15 | +0,06 (+0,5) | −3 pe | −1 pe | −0,06 / +0,18  |
| Balanserat | 161 | 1,31–1,24 | +0,09 | +0,00 (+0,0) | −2 pe | −1 pe | +0,13 / −0,12  |
| Bollinnehav | 96 | 1,22–1,42 | +0,02 | −0,07 (−0,5) | −2 pe | +1 pe | −0,15 / +0,03  |
| Kortpass | 105 | 1,21–1,39 | −0,00 | −0,09 (−0,7) | +2 pe | +1 pe | −0,21 / −0,06 ✔ |
| Blandat | 136 | 1,13–1,29 | −0,02 | −0,11 (−1,0) | −3 pe | −4 pe | −0,04 / −0,18 ✔ |
| Direktspel | 120 | 1,57–1,27 | +0,29 | +0,20 (+1,7) | −5 pe | +2 pe | +0,07 / +0,60 ✔ |
| Lågpress | 97 | 1,28–1,37 | +0,15 | +0,07 (+0,5) | +1 pe | +2 pe | −0,11 / +0,40  |
| Mellanpress | 140 | 1,38–1,34 | +0,01 | −0,08 (−0,8) | −3 pe | −0 pe | +0,08 / −0,25  |
| Högpress | 124 | 1,23–1,23 | +0,13 | +0,04 (+0,3) | −5 pe | −3 pe | +0,00 / +0,06 ✔ |

- Svårast mot **Blandat** (−0,11 p/match rel. eget snitt, z −1,0, 136 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,20 p/match rel. eget snitt, z +1,7, 120 m) – åt samma håll i båda halvorna men svagt

### Ipswich

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 44,8 %). 316 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 1,54–1,32 | −0,08 | −0,05 (−0,4) | −3 pe | +7 pe | −0,07 / −0,02 ✔ |
| Balanserat | 130 | 1,48–1,35 | −0,07 | −0,04 (−0,4) | +3 pe | +2 pe | −0,05 / −0,04 ✔ |
| Bollinnehav | 94 | 1,38–1,07 | +0,08 | +0,11 (+0,9) | +12 pe | −9 pe | −0,10 / +0,30  |
| Kortpass | 99 | 1,55–1,14 | +0,19 | +0,22 (+1,9) | +7 pe | −3 pe | −0,04 / +0,30  |
| Blandat | 110 | 1,40–1,38 | −0,12 | −0,10 (−0,9) | +4 pe | −1 pe | +0,07 / −0,23  |
| Direktspel | 107 | 1,48–1,24 | −0,13 | −0,10 (−1,0) | +1 pe | +4 pe | −0,15 / +0,11  |
| Lågpress | 85 | 1,31–1,28 | −0,19 | −0,16 (−1,3) | +4 pe | −7 pe | −0,29 / +0,05  |
| Mellanpress | 117 | 1,62–1,11 | +0,06 | +0,09 (+0,9) | +11 pe | +2 pe | +0,07 / +0,10 ✔ |
| Högpress | 114 | 1,44–1,39 | +0,01 | +0,03 (+0,3) | −3 pe | +3 pe | −0,00 / +0,05  |

- Svårast mot **Lågpress** (−0,16 p/match rel. eget snitt, z −1,3, 85 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,22 p/match rel. eget snitt, z +1,9, 99 m) – inte stabilt, troligen slump

### Leeds

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress** (faktiskt bollinnehav 44,8 %). 329 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 99 | 1,49–1,25 | −0,07 | −0,06 (−0,5) | +5 pe | −4 pe | +0,08 / −0,18  |
| Balanserat | 141 | 1,61–1,30 | +0,02 | +0,03 (+0,3) | −1 pe | −1 pe | +0,01 / +0,06 ✔ |
| Bollinnehav | 89 | 1,55–1,24 | +0,00 | +0,02 (+0,1) | −0 pe | −1 pe | +0,04 / −0,01  |
| Kortpass | 96 | 1,49–1,24 | −0,08 | −0,07 (−0,6) | +5 pe | −5 pe | −0,37 / −0,01 ✔ |
| Blandat | 135 | 1,61–1,45 | −0,03 | −0,02 (−0,2) | −0 pe | +6 pe | +0,04 / −0,08  |
| Direktspel | 98 | 1,56–1,04 | +0,09 | +0,10 (+0,8) | −2 pe | −10 pe | +0,12 / +0,01 ✔ |
| Lågpress | 91 | 1,43–1,31 | −0,13 | −0,11 (−0,9) | −2 pe | −4 pe | −0,08 / −0,22 ✔ |
| Mellanpress | 137 | 1,61–1,22 | +0,08 | +0,09 (+0,9) | −4 pe | −0 pe | +0,04 / +0,13 ✔ |
| Högpress | 101 | 1,61–1,30 | −0,03 | −0,02 (−0,2) | +9 pe | −3 pe | +0,27 / −0,16  |

- Svårast mot **Lågpress** (−0,11 p/match rel. eget snitt, z −0,9, 91 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,09 p/match rel. eget snitt, z +0,9, 137 m) – åt samma håll i båda halvorna men svagt

### Liverpool

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress** (faktiskt bollinnehav 58,9 %). 309 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 2,13–0,82 | +0,25 | +0,19 (+1,9) | −2 pe | −4 pe | +0,27 / +0,14 ✔ |
| Balanserat | 118 | 2,02–1,05 | −0,03 | −0,09 (−0,9) | +8 pe | −5 pe | +0,15 / −0,43  |
| Bollinnehav | 89 | 2,22–1,13 | −0,04 | −0,10 (−0,8) | −0 pe | +4 pe | −0,10 / −0,10 ✔ |
| Kortpass | 82 | 2,13–1,28 | −0,06 | −0,12 (−0,9) | +3 pe | +7 pe | +0,40 / −0,20  |
| Blandat | 131 | 2,11–0,92 | −0,02 | −0,07 (−0,7) | +4 pe | −5 pe | +0,02 / −0,17  |
| Direktspel | 96 | 2,10–0,86 | +0,26 | +0,20 (+2,0) | −1 pe | −6 pe | +0,14 / +0,45 ✔ ⚑ |
| Lågpress | 82 | 2,07–0,78 | +0,33 | +0,28 (+2,7) | +0 pe | −5 pe | +0,36 / −0,01  |
| Mellanpress | 120 | 2,11–1,02 | −0,00 | −0,06 (−0,6) | −2 pe | +5 pe | +0,01 / −0,14  |
| Högpress | 107 | 2,15–1,14 | −0,09 | −0,15 (−1,4) | +8 pe | −7 pe | −0,25 / −0,11 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,4, 107 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,28 p/match rel. eget snitt, z +2,7, 82 m) – inte stabilt, troligen slump

### Man City

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 63,1 %). 309 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 105 | 2,34–0,95 | −0,08 | −0,08 (−0,7) | −1 pe | +2 pe | −0,31 / +0,08  |
| Balanserat | 120 | 2,33–0,81 | +0,04 | +0,03 (+0,4) | −2 pe | −5 pe | +0,14 / −0,11  |
| Bollinnehav | 84 | 2,45–0,83 | +0,06 | +0,05 (+0,5) | −5 pe | +1 pe | +0,02 / +0,09 ✔ |
| Kortpass | 79 | 2,24–1,08 | −0,03 | −0,04 (−0,3) | +2 pe | −0 pe | −0,49 / +0,04  |
| Blandat | 130 | 2,33–0,83 | −0,02 | −0,02 (−0,2) | −4 pe | +2 pe | −0,04 / −0,01 ✔ |
| Direktspel | 100 | 2,51–0,74 | +0,06 | +0,06 (+0,6) | −4 pe | −6 pe | +0,07 / +0,03 ✔ |
| Lågpress | 88 | 2,28–0,85 | −0,02 | −0,02 (−0,2) | −6 pe | −2 pe | −0,06 / +0,09  |
| Mellanpress | 112 | 2,52–0,81 | +0,02 | +0,02 (+0,2) | −6 pe | +1 pe | +0,02 / +0,01 ✔ |
| Högpress | 109 | 2,28–0,93 | +0,00 | −0,00 (−0,0) | +3 pe | −2 pe | −0,03 / +0,01  |

- Svårast mot **Backar hem** (−0,08 p/match rel. eget snitt, z −0,7, 105 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,06 p/match rel. eget snitt, z +0,6, 100 m) – åt samma håll i båda halvorna men svagt

### Man United

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 59,9 %). 309 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,66–1,25 | −0,01 | −0,01 (−0,1) | −2 pe | −0 pe | −0,03 / −0,00 ✔ |
| Balanserat | 120 | 1,43–1,46 | −0,02 | −0,02 (−0,2) | +3 pe | +1 pe | −0,16 / +0,17  |
| Bollinnehav | 87 | 1,80–1,17 | +0,05 | +0,05 (+0,4) | +3 pe | −6 pe | +0,08 / +0,02 ✔ |
| Kortpass | 78 | 1,47–1,29 | −0,14 | −0,14 (−1,0) | −1 pe | −8 pe | −0,50 / −0,07 ✔ |
| Blandat | 129 | 1,62–1,40 | −0,00 | −0,00 (−0,0) | +1 pe | +1 pe | −0,10 / +0,08  |
| Direktspel | 102 | 1,70–1,21 | +0,11 | +0,11 (+0,9) | +3 pe | +1 pe | +0,05 / +0,35 ✔ |
| Lågpress | 80 | 1,71–1,24 | +0,10 | +0,10 (+0,7) | +4 pe | +3 pe | +0,09 / +0,12 ✔ |
| Mellanpress | 119 | 1,67–1,22 | +0,08 | +0,08 (+0,6) | −5 pe | −0 pe | −0,02 / +0,18  |
| Högpress | 110 | 1,46–1,45 | −0,15 | −0,15 (−1,3) | +6 pe | −6 pe | −0,44 / −0,05 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,3, 110 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,11 p/match rel. eget snitt, z +0,9, 102 m) – åt samma håll i båda halvorna men svagt

### Newcastle

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 49,1 %). 309 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,67–1,30 | +0,04 | −0,08 (−0,6) | −0 pe | −1 pe | +0,14 / −0,21  |
| Balanserat | 130 | 1,33–1,62 | +0,11 | +0,00 (+0,0) | −3 pe | +1 pe | +0,05 / −0,06  |
| Bollinnehav | 88 | 1,45–1,22 | +0,19 | +0,07 (+0,6) | +2 pe | +1 pe | +0,18 / −0,03  |
| Kortpass | 78 | 1,68–1,22 | +0,11 | −0,00 (−0,0) | −0 pe | +7 pe | +0,40 / −0,08  |
| Blandat | 137 | 1,43–1,48 | +0,11 | −0,00 (−0,0) | −3 pe | +0 pe | +0,07 / −0,06  |
| Direktspel | 94 | 1,34–1,47 | +0,12 | +0,00 (+0,0) | +3 pe | −4 pe | +0,09 / −0,37  |
| Lågpress | 78 | 1,19–1,58 | −0,01 | −0,12 (−1,0) | −1 pe | +0 pe | −0,08 / −0,25 ✔ |
| Mellanpress | 118 | 1,39–1,41 | +0,23 | +0,12 (+1,0) | −5 pe | +1 pe | +0,22 / −0,01  |
| Högpress | 113 | 1,73–1,30 | +0,07 | −0,04 (−0,4) | +5 pe | +1 pe | +0,23 / −0,14  |

- Svårast mot **Lågpress** (−0,12 p/match rel. eget snitt, z −1,0, 78 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,12 p/match rel. eget snitt, z +1,0, 118 m) – inte stabilt, troligen slump

### Nott'm Forest

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress** (faktiskt bollinnehav 47,3 %). 329 matcher med stil, mot marknaden totalt +0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 112 | 1,20–1,29 | −0,02 | −0,10 (−0,9) | +5 pe | −4 pe | −0,05 / −0,15 ✔ |
| Balanserat | 122 | 1,30–1,30 | +0,06 | −0,02 (−0,2) | +1 pe | −4 pe | −0,03 / −0,01 ✔ |
| Bollinnehav | 95 | 1,23–1,15 | +0,23 | +0,15 (+1,1) | +1 pe | −7 pe | +0,08 / +0,22 ✔ |
| Kortpass | 86 | 1,29–1,37 | +0,06 | −0,02 (−0,2) | +3 pe | −1 pe | −0,44 / +0,06  |
| Blandat | 133 | 1,26–1,35 | +0,12 | +0,04 (+0,4) | −2 pe | −7 pe | +0,10 / −0,02  |
| Direktspel | 110 | 1,18–1,05 | +0,05 | −0,03 (−0,3) | +7 pe | −5 pe | −0,02 / −0,07 ✔ |
| Lågpress | 85 | 1,27–1,13 | +0,01 | −0,07 (−0,6) | +5 pe | −9 pe | +0,01 / −0,32  |
| Mellanpress | 118 | 1,09–1,25 | −0,04 | −0,13 (−1,2) | +5 pe | −5 pe | −0,04 / −0,24 ✔ |
| Högpress | 126 | 1,37–1,33 | +0,25 | +0,17 (+1,5) | −2 pe | −2 pe | +0,01 / +0,23 ✔ |

- Svårast mot **Mellanpress** (−0,13 p/match rel. eget snitt, z −1,2, 118 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,17 p/match rel. eget snitt, z +1,5, 126 m) – åt samma håll i båda halvorna men svagt

### Sunderland

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Lågpress** (faktiskt bollinnehav 48,4 %). 277 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,33–1,10 | +0,09 | +0,05 (+0,4) | +2 pe | −1 pe | +0,02 / +0,09 ✔ |
| Balanserat | 121 | 1,40–1,14 | −0,03 | −0,07 (−0,6) | +7 pe | −2 pe | −0,18 / +0,02  |
| Bollinnehav | 67 | 1,40–1,12 | +0,10 | +0,06 (+0,4) | −7 pe | +4 pe | +0,24 / −0,12  |
| Kortpass | 98 | 1,21–1,23 | −0,00 | −0,04 (−0,3) | +1 pe | −0 pe | −0,02 / −0,05 ✔ |
| Blandat | 99 | 1,37–1,06 | +0,10 | +0,06 (+0,5) | −2 pe | −2 pe | +0,01 / +0,11 ✔ |
| Direktspel | 80 | 1,57–1,06 | +0,02 | −0,02 (−0,2) | +8 pe | +3 pe | −0,02 / −0,01 ✔ |
| Lågpress | 44 | 1,52–1,11 | +0,20 | +0,16 (+0,8) | −6 pe | +1 pe | +0,13 / +0,20 ✔ |
| Mellanpress | 115 | 1,42–1,15 | +0,01 | −0,03 (−0,3) | +0 pe | +4 pe | +0,01 / −0,07  |
| Högpress | 118 | 1,28–1,10 | +0,01 | −0,03 (−0,2) | +7 pe | −4 pe | −0,09 / +0,04  |

- Svårast mot **Balanserat** (−0,07 p/match rel. eget snitt, z −0,6, 121 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,16 p/match rel. eget snitt, z +0,8, 44 m) – åt samma håll i båda halvorna men svagt

### Tottenham

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 60,6 %). 309 matcher med stil, mot marknaden totalt −0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 97 | 1,59–1,35 | −0,18 | −0,12 (−0,9) | −6 pe | +5 pe | +0,07 / −0,23  |
| Balanserat | 127 | 1,72–1,32 | +0,10 | +0,16 (+1,5) | −3 pe | +4 pe | +0,17 / +0,16 ✔ |
| Bollinnehav | 85 | 1,76–1,48 | −0,18 | −0,11 (−0,8) | −11 pe | +6 pe | +0,00 / −0,23  |
| Kortpass | 75 | 1,71–1,75 | −0,27 | −0,20 (−1,5) | −3 pe | +14 pe | +0,02 / −0,25  |
| Blandat | 130 | 1,63–1,31 | −0,05 | +0,02 (+0,1) | −5 pe | −0 pe | +0,12 / −0,07  |
| Direktspel | 104 | 1,76–1,19 | +0,06 | +0,13 (+1,0) | −8 pe | +4 pe | +0,09 / +0,24 ✔ |
| Lågpress | 77 | 1,61–1,53 | −0,27 | −0,21 (−1,5) | −7 pe | +18 pe | −0,02 / −0,80 ✔ |
| Mellanpress | 120 | 1,63–1,14 | +0,00 | +0,07 (+0,6) | −5 pe | −3 pe | +0,13 / −0,01  |
| Högpress | 112 | 1,82–1,52 | +0,01 | +0,07 (+0,6) | −6 pe | +3 pe | +0,25 / +0,01 ✔ |

- Svårast mot **Kortpass** (−0,20 p/match rel. eget snitt, z −1,5, 75 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,16 p/match rel. eget snitt, z +1,5, 127 m) – åt samma håll i båda halvorna men svagt
