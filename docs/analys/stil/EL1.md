# Stilmatchning – League One (EL1)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 3409 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 351 m · hemma +0,04 · kryss −5 pe · ö2,5 −1 pe | 423 m · hemma −0,06 · kryss −2 pe · ö2,5 −2 pe | 368 m · hemma +0,14 · kryss −2 pe · ö2,5 −0 pe |
| **Mellan** | 421 m · hemma +0,02 · kryss −0 pe · ö2,5 −3 pe | 426 m · hemma +0,00 · kryss −1 pe · ö2,5 +5 pe | 366 m · hemma +0,09 · kryss −2 pe · ö2,5 −1 pe |
| **Mycket boll** | 367 m · hemma +0,03 · kryss +0 pe · ö2,5 −1 pe | 367 m · hemma +0,04 · kryss −1 pe · ö2,5 +4 pe | 320 m · hemma −0,17 · kryss −2 pe · ö2,5 +3 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 417 m · hemma +0,08 · kryss −5 pe · ö2,5 +1 pe | 461 m · hemma −0,05 · kryss +1 pe · ö2,5 −3 pe | 326 m · hemma +0,14 · kryss −2 pe · ö2,5 −2 pe |
| **Balanserat** | 460 m · hemma −0,05 · kryss −2 pe · ö2,5 +4 pe | 471 m · hemma +0,00 · kryss −2 pe · ö2,5 +4 pe | 357 m · hemma −0,01 · kryss −1 pe · ö2,5 −0 pe |
| **Bollinnehav** | 328 m · hemma +0,15 · kryss −0 pe · ö2,5 −1 pe | 356 m · hemma +0,04 · kryss −2 pe · ö2,5 +1 pe | 233 m · hemma −0,18 · kryss −0 pe · ö2,5 −2 pe |

## Lag (säsong 2026/27)

### AFC Wimbledon

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 45,4 %). 272 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,15–1,23 | −0,08 | +0,03 (+0,2) | +0 pe | −1 pe | −0,14 / +0,17  |
| Balanserat | 122 | 1,27–1,38 | −0,06 | +0,04 (+0,4) | +7 pe | −0 pe | −0,04 / +0,13  |
| Bollinnehav | 62 | 1,02–1,35 | −0,23 | −0,12 (−0,8) | −0 pe | −7 pe | −0,14 / −0,11 ✔ |
| Kortpass | 69 | 1,14–1,45 | −0,13 | −0,02 (−0,2) | −0 pe | +1 pe | −0,28 / +0,10  |
| Blandat | 118 | 1,21–1,25 | −0,04 | +0,07 (+0,6) | +6 pe | −1 pe | +0,01 / +0,11 ✔ |
| Direktspel | 85 | 1,14–1,32 | −0,18 | −0,08 (−0,6) | +2 pe | −5 pe | −0,12 / +0,03  |
| Lågpress | 76 | 1,11–1,39 | −0,21 | −0,10 (−0,8) | +9 pe | −5 pe | −0,33 / +0,12  |
| Mellanpress | 109 | 1,22–1,35 | −0,08 | +0,02 (+0,2) | +0 pe | −1 pe | −0,09 / +0,15  |
| Högpress | 87 | 1,17–1,23 | −0,04 | +0,06 (+0,4) | +2 pe | −1 pe | +0,13 / +0,00 ✔ |

- Svårast mot **Bollinnehav** (−0,12 p/match rel. eget snitt, z −0,8, 62 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,07 p/match rel. eget snitt, z +0,6, 118 m) – åt samma håll i båda halvorna men svagt

### Barnsley

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 54,2 %). 287 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 106 | 1,39–1,37 | +0,01 | +0,02 (+0,2) | −7 pe | +5 pe | +0,19 / −0,08  |
| Balanserat | 108 | 1,30–1,41 | −0,13 | −0,12 (−1,0) | −1 pe | +1 pe | −0,10 / −0,13 ✔ |
| Bollinnehav | 73 | 1,55–1,40 | +0,12 | +0,14 (+0,9) | +2 pe | +15 pe | +0,14 / +0,13 ✔ |
| Kortpass | 70 | 1,63–1,50 | +0,09 | +0,10 (+0,7) | +7 pe | +12 pe | +0,13 / +0,09 ✔ |
| Blandat | 136 | 1,23–1,44 | −0,14 | −0,13 (−1,2) | −4 pe | +2 pe | −0,07 / −0,20 ✔ |
| Direktspel | 81 | 1,47–1,21 | +0,12 | +0,13 (+1,0) | −7 pe | +8 pe | +0,17 / +0,06 ✔ |
| Lågpress | 75 | 1,13–1,23 | −0,18 | −0,17 (−1,3) | +5 pe | −8 pe | −0,22 / −0,13 ✔ |
| Mellanpress | 114 | 1,46–1,38 | +0,07 | +0,08 (+0,7) | −3 pe | +9 pe | +0,26 / −0,15  |
| Högpress | 98 | 1,52–1,53 | +0,03 | +0,04 (+0,3) | −8 pe | +14 pe | −0,04 / +0,10  |

- Svårast mot **Lågpress** (−0,17 p/match rel. eget snitt, z −1,3, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +1,0, 81 m) – åt samma håll i båda halvorna men svagt

### Blackpool

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 48,8 %). 283 matcher med stil, mot marknaden totalt +0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,25–1,22 | −0,05 | −0,06 (−0,5) | −4 pe | −2 pe | +0,02 / −0,13  |
| Balanserat | 113 | 1,30–1,29 | +0,06 | +0,04 (+0,3) | −1 pe | −1 pe | +0,13 / −0,09  |
| Bollinnehav | 68 | 1,35–1,22 | +0,05 | +0,03 (+0,2) | −2 pe | +1 pe | −0,11 / +0,16  |
| Kortpass | 73 | 1,47–1,29 | +0,18 | +0,17 (+1,1) | −3 pe | +6 pe | +0,35 / +0,09 ✔ |
| Blandat | 127 | 1,17–1,43 | −0,13 | −0,15 (−1,4) | +0 pe | −2 pe | −0,15 / −0,14 ✔ |
| Direktspel | 83 | 1,34–0,94 | +0,10 | +0,08 (+0,6) | −5 pe | −5 pe | +0,13 / −0,03  |
| Lågpress | 64 | 1,38–1,47 | −0,06 | −0,07 (−0,5) | +1 pe | +5 pe | +0,21 / −0,31  |
| Mellanpress | 105 | 1,22–1,12 | +0,02 | −0,00 (−0,0) | −6 pe | −6 pe | −0,01 / +0,01  |
| Högpress | 114 | 1,32–1,24 | +0,06 | +0,04 (+0,4) | −0 pe | −0 pe | +0,01 / +0,08 ✔ |

- Svårast mot **Blandat** (−0,15 p/match rel. eget snitt, z −1,4, 127 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,17 p/match rel. eget snitt, z +1,1, 73 m) – åt samma håll i båda halvorna men svagt

### Bradford

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 49,6 %). 263 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 74 | 1,34–1,15 | +0,08 | +0,06 (+0,4) | −4 pe | +7 pe | +0,08 / +0,04 ✔ |
| Balanserat | 134 | 1,10–1,05 | −0,03 | −0,05 (−0,5) | +3 pe | −4 pe | −0,10 / +0,00  |
| Bollinnehav | 55 | 1,40–1,04 | +0,08 | +0,05 (+0,3) | −2 pe | −6 pe | −0,15 / +0,25  |
| Kortpass | 58 | 1,38–1,17 | −0,01 | −0,04 (−0,2) | −3 pe | −3 pe | −0,72 / +0,12  |
| Blandat | 141 | 1,16–1,01 | +0,06 | +0,04 (+0,3) | −1 pe | −2 pe | +0,09 / −0,04  |
| Direktspel | 64 | 1,25–1,13 | −0,02 | −0,05 (−0,3) | +4 pe | +2 pe | −0,21 / +0,23  |
| Lågpress | 73 | 1,26–1,07 | −0,00 | −0,03 (−0,2) | +1 pe | −5 pe | −0,18 / +0,11  |
| Mellanpress | 95 | 1,24–1,02 | +0,09 | +0,06 (+0,5) | +2 pe | −3 pe | +0,21 / −0,08  |
| Högpress | 95 | 1,20–1,14 | −0,02 | −0,04 (−0,3) | −3 pe | +3 pe | −0,25 / +0,19  |

- Svårast mot **Balanserat** (−0,05 p/match rel. eget snitt, z −0,5, 134 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,06 p/match rel. eget snitt, z +0,5, 95 m) – inte stabilt, troligen slump

### Bromley

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 36,0 %). 49 matcher med stil, mot marknaden totalt +0,37 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 1,56–1,06 | +0,42 | +0,04 (+0,2) | +5 pe | +20 pe | +0,12 / −0,01  |
| Balanserat | 16 | 1,44–0,94 | +0,44 | +0,07 (+0,2) | +3 pe | −16 pe | +0,55 / −0,30  |
| Bollinnehav | 17 | 1,59–1,71 | +0,27 | −0,11 (−0,4) | +3 pe | +14 pe | +0,00 / −0,27  |
| Kortpass | 23 | 1,52–1,35 | +0,56 | +0,19 (+0,8) | −1 pe | +2 pe | +0,63 / −0,22  |
| Blandat | 20 | 1,55–1,10 | +0,23 | −0,14 (−0,6) | +12 pe | +12 pe | −0,29 / +0,00  |
| Direktspel | 6 | 1,50–1,33 | +0,13 | −0,24 (−0,5) | −10 pe | +1 pe | +0,22 / −0,70  |
| Lågpress | 23 | 1,65–1,35 | +0,31 | −0,07 (−0,3) | +12 pe | +11 pe | +0,07 / −0,24  |
| Mellanpress | 23 | 1,43–1,13 | +0,43 | +0,06 (+0,2) | −1 pe | +4 pe | +0,26 / −0,10  |
| Högpress | 3 | 1,33–1,33 | +0,45 | +0,07 (+0,1) | −28 pe | −14 pe | +1,20 / −0,49  |

- Svårast mot **Blandat** (−0,14 p/match rel. eget snitt, z −0,6, 20 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,19 p/match rel. eget snitt, z +0,8, 23 m) – inte stabilt, troligen slump

### Burton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 43,9 %). 288 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,11–1,46 | +0,05 | +0,03 (+0,2) | −3 pe | +4 pe | −0,20 / +0,17  |
| Balanserat | 113 | 1,22–1,58 | +0,08 | +0,06 (+0,5) | +1 pe | +6 pe | +0,28 / −0,22  |
| Bollinnehav | 79 | 1,03–1,38 | −0,09 | −0,12 (−0,9) | +4 pe | −6 pe | −0,20 / −0,01 ✔ |
| Kortpass | 77 | 0,97–1,42 | −0,14 | −0,17 (−1,2) | +8 pe | −3 pe | −0,34 / −0,07 ✔ |
| Blandat | 123 | 1,20–1,61 | +0,09 | +0,06 (+0,6) | −10 pe | +9 pe | +0,25 / −0,08  |
| Direktspel | 88 | 1,17–1,36 | +0,08 | +0,05 (+0,4) | +8 pe | −5 pe | −0,05 / +0,33  |
| Lågpress | 71 | 1,01–1,35 | +0,09 | +0,07 (+0,5) | +5 pe | −3 pe | −0,15 / +0,29  |
| Mellanpress | 118 | 1,30–1,57 | +0,10 | +0,08 (+0,6) | −0 pe | +6 pe | +0,14 / −0,01  |
| Högpress | 99 | 1,02–1,47 | −0,11 | −0,14 (−1,1) | −1 pe | +0 pe | −0,07 / −0,19 ✔ |

- Svårast mot **Kortpass** (−0,17 p/match rel. eget snitt, z −1,2, 77 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,08 p/match rel. eget snitt, z +0,6, 118 m) – inte stabilt, troligen slump

### Cambridge

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 45,8 %). 276 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,19–1,34 | +0,19 | +0,13 (+0,9) | −7 pe | +5 pe | +0,32 / +0,03 ✔ |
| Balanserat | 102 | 1,22–1,28 | +0,01 | −0,04 (−0,4) | +0 pe | +1 pe | −0,05 / −0,04 ✔ |
| Bollinnehav | 84 | 1,07–1,29 | −0,03 | −0,09 (−0,7) | −0 pe | −12 pe | +0,15 / −0,36  |
| Kortpass | 72 | 0,97–1,31 | −0,15 | −0,20 (−1,5) | −3 pe | −15 pe | −0,09 / −0,25 ✔ |
| Blandat | 118 | 1,24–1,42 | +0,03 | −0,02 (−0,2) | +1 pe | +5 pe | +0,14 / −0,20  |
| Direktspel | 86 | 1,22–1,15 | +0,25 | +0,20 (+1,4) | −6 pe | +1 pe | +0,15 / +0,29 ✔ |
| Lågpress | 70 | 1,39–1,14 | +0,32 | +0,27 (+1,9) | +3 pe | −3 pe | +0,33 / +0,22 ✔ |
| Mellanpress | 99 | 1,09–1,35 | −0,09 | −0,14 (−1,2) | −1 pe | −2 pe | −0,00 / −0,29 ✔ |
| Högpress | 107 | 1,08–1,36 | +0,01 | −0,05 (−0,4) | −7 pe | −0 pe | +0,06 / −0,15  |

- Svårast mot **Kortpass** (−0,20 p/match rel. eget snitt, z −1,5, 72 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,27 p/match rel. eget snitt, z +1,9, 70 m) – åt samma håll i båda halvorna men svagt

### Doncaster

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 49,8 %). 271 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,21–1,44 | −0,06 | −0,11 (−0,9) | −6 pe | +3 pe | −0,10 / −0,11 ✔ |
| Balanserat | 119 | 1,27–1,51 | +0,05 | +0,00 (+0,0) | −13 pe | +6 pe | −0,16 / +0,18  |
| Bollinnehav | 61 | 1,28–1,26 | +0,20 | +0,15 (+0,9) | +2 pe | +2 pe | +0,08 / +0,23 ✔ |
| Kortpass | 62 | 1,23–1,35 | +0,09 | +0,05 (+0,3) | −2 pe | −1 pe | −0,01 / +0,07  |
| Blandat | 121 | 1,19–1,37 | −0,00 | −0,05 (−0,4) | −9 pe | +5 pe | −0,12 / +0,01  |
| Direktspel | 88 | 1,35–1,57 | +0,08 | +0,04 (+0,3) | −9 pe | +6 pe | −0,07 / +0,30  |
| Lågpress | 75 | 1,09–1,52 | −0,09 | −0,13 (−1,0) | −11 pe | +3 pe | −0,36 / +0,10  |
| Mellanpress | 109 | 1,27–1,34 | +0,18 | +0,13 (+1,0) | −8 pe | +5 pe | +0,18 / +0,08 ✔ |
| Högpress | 87 | 1,37–1,47 | −0,00 | −0,05 (−0,4) | −3 pe | +4 pe | −0,19 / +0,07  |

- Svårast mot **Lågpress** (−0,13 p/match rel. eget snitt, z −1,0, 75 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +1,0, 109 m) – åt samma håll i båda halvorna men svagt

### Huddersfield

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 52,1 %). 361 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 128 | 1,20–1,20 | +0,05 | +0,10 (+0,9) | +2 pe | −1 pe | +0,22 / −0,01  |
| Balanserat | 144 | 1,15–1,63 | −0,10 | −0,05 (−0,5) | −1 pe | +8 pe | −0,07 / −0,03 ✔ |
| Bollinnehav | 89 | 1,10–1,51 | −0,11 | −0,06 (−0,5) | −2 pe | −3 pe | −0,12 / −0,01 ✔ |
| Kortpass | 78 | 1,40–1,60 | −0,06 | −0,01 (−0,1) | −4 pe | +7 pe | +0,09 / −0,04  |
| Blandat | 154 | 1,13–1,39 | −0,05 | −0,00 (−0,0) | +2 pe | −0 pe | +0,18 / −0,15  |
| Direktspel | 129 | 1,04–1,41 | −0,04 | +0,01 (+0,1) | −1 pe | +2 pe | −0,12 / +0,35  |
| Lågpress | 98 | 1,16–1,50 | −0,12 | −0,07 (−0,5) | −5 pe | +6 pe | +0,05 / −0,30  |
| Mellanpress | 140 | 1,14–1,49 | −0,08 | −0,03 (−0,3) | +5 pe | −2 pe | −0,05 / −0,01 ✔ |
| Högpress | 123 | 1,17–1,35 | +0,04 | +0,09 (+0,8) | −2 pe | +3 pe | +0,09 / +0,09 ✔ |

- Svårast mot **Lågpress** (−0,07 p/match rel. eget snitt, z −0,5, 98 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,10 p/match rel. eget snitt, z +0,9, 128 m) – inte stabilt, troligen slump

### Leicester

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 68,0 %). 327 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 99 | 1,57–1,39 | +0,03 | +0,06 (+0,5) | −4 pe | +3 pe | +0,07 / +0,06 ✔ |
| Balanserat | 138 | 1,38–1,55 | −0,17 | −0,13 (−1,3) | −6 pe | +9 pe | −0,05 / −0,24 ✔ |
| Bollinnehav | 90 | 1,58–1,27 | +0,11 | +0,14 (+1,0) | −1 pe | +2 pe | +0,29 / −0,01  |
| Kortpass | 86 | 1,41–1,64 | −0,21 | −0,18 (−1,4) | +2 pe | +8 pe | −0,43 / −0,13 ✔ |
| Blandat | 139 | 1,53–1,41 | +0,06 | +0,09 (+0,8) | −7 pe | +4 pe | +0,22 / −0,03  |
| Direktspel | 102 | 1,52–1,26 | +0,00 | +0,03 (+0,3) | −5 pe | +4 pe | +0,04 / −0,02  |
| Lågpress | 95 | 1,37–1,47 | −0,16 | −0,13 (−1,0) | −1 pe | +5 pe | +0,01 / −0,43  |
| Mellanpress | 125 | 1,62–1,35 | +0,02 | +0,05 (+0,5) | −1 pe | +6 pe | +0,07 / +0,04 ✔ |
| Högpress | 107 | 1,46–1,47 | +0,02 | +0,05 (+0,4) | −10 pe | +3 pe | +0,20 / −0,02  |

- Svårast mot **Kortpass** (−0,18 p/match rel. eget snitt, z −1,4, 86 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,14 p/match rel. eget snitt, z +1,0, 90 m) – inte stabilt, troligen slump

### Leyton Orient

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 49,6 %). 271 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,20–1,13 | +0,09 | +0,04 (+0,3) | −7 pe | +1 pe | −0,06 / +0,10  |
| Balanserat | 124 | 1,29–1,16 | −0,01 | −0,05 (−0,4) | −1 pe | −3 pe | +0,05 / −0,22  |
| Bollinnehav | 54 | 1,44–1,09 | +0,09 | +0,04 (+0,2) | −11 pe | +2 pe | −0,10 / +0,16  |
| Kortpass | 54 | 1,33–1,15 | −0,02 | −0,06 (−0,4) | −7 pe | −0 pe | −0,05 / −0,06 ✔ |
| Blandat | 148 | 1,35–1,24 | −0,02 | −0,06 (−0,6) | −2 pe | +5 pe | −0,11 / −0,01 ✔ |
| Direktspel | 69 | 1,13–0,91 | +0,23 | +0,18 (+1,1) | −8 pe | −12 pe | +0,19 / +0,17 ✔ |
| Lågpress | 66 | 1,29–1,08 | −0,11 | −0,16 (−1,0) | +5 pe | −2 pe | −0,13 / −0,18 ✔ |
| Mellanpress | 98 | 1,33–1,26 | +0,03 | −0,02 (−0,1) | −9 pe | −0 pe | +0,05 / −0,08  |
| Högpress | 107 | 1,26–1,07 | +0,16 | +0,11 (+0,9) | −8 pe | −0 pe | +0,02 / +0,21 ✔ |

- Svårast mot **Lågpress** (−0,16 p/match rel. eget snitt, z −1,0, 66 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,1, 69 m) – åt samma håll i båda halvorna men svagt

### Luton

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 57,1 %). 275 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 100 | 1,25–1,19 | +0,17 | +0,13 (+1,1) | −2 pe | −2 pe | +0,31 / −0,04  |
| Balanserat | 113 | 1,25–1,40 | −0,01 | −0,04 (−0,4) | −2 pe | −2 pe | +0,24 / −0,34  |
| Bollinnehav | 62 | 1,16–1,50 | −0,10 | −0,13 (−0,9) | +1 pe | −1 pe | +0,03 / −0,28  |
| Kortpass | 83 | 1,29–1,64 | −0,16 | −0,20 (−1,4) | −4 pe | +3 pe | +0,26 / −0,36  |
| Blandat | 123 | 1,19–1,20 | +0,05 | +0,01 (+0,1) | +3 pe | −4 pe | +0,14 / −0,10  |
| Direktspel | 69 | 1,23–1,26 | +0,25 | +0,21 (+1,4) | −6 pe | −2 pe | +0,28 / −0,14  |
| Lågpress | 53 | 1,57–1,11 | +0,34 | +0,30 (+1,8) | −1 pe | +5 pe | +0,51 / −0,03  |
| Mellanpress | 113 | 1,11–1,28 | −0,08 | −0,12 (−1,0) | −2 pe | −6 pe | −0,05 / −0,18 ✔ |
| Högpress | 109 | 1,19–1,52 | +0,01 | −0,02 (−0,2) | −1 pe | −0 pe | +0,30 / −0,34  |

- Svårast mot **Kortpass** (−0,20 p/match rel. eget snitt, z −1,4, 83 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,30 p/match rel. eget snitt, z +1,8, 53 m) – inte stabilt, troligen slump

### Mansfield

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 45,9 %). 267 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,16–1,13 | −0,20 | −0,20 (−1,6) | +9 pe | −8 pe | −0,06 / −0,26 ✔ |
| Balanserat | 121 | 1,73–1,21 | +0,15 | +0,15 (+1,3) | −1 pe | +11 pe | +0,10 / +0,26 ✔ |
| Bollinnehav | 63 | 1,51–1,29 | −0,04 | −0,04 (−0,2) | +2 pe | +3 pe | −0,04 / −0,04 ✔ |
| Kortpass | 64 | 1,53–1,38 | +0,04 | +0,05 (+0,3) | −1 pe | +5 pe | +0,25 / +0,01 ✔ |
| Blandat | 134 | 1,57–1,22 | +0,04 | +0,04 (+0,4) | +5 pe | +8 pe | +0,13 / −0,10  |
| Direktspel | 69 | 1,32–1,01 | −0,12 | −0,12 (−0,8) | +2 pe | −9 pe | −0,19 / +0,01  |
| Lågpress | 74 | 1,65–1,26 | +0,04 | +0,05 (+0,3) | −1 pe | +6 pe | +0,00 / +0,09 ✔ |
| Mellanpress | 92 | 1,46–1,12 | +0,05 | +0,05 (+0,4) | +12 pe | +1 pe | +0,17 / −0,07  |
| Högpress | 101 | 1,43–1,25 | −0,08 | −0,08 (−0,6) | −3 pe | +3 pe | −0,06 / −0,10 ✔ |

- Svårast mot **Backar hem** (−0,20 p/match rel. eget snitt, z −1,6, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,3, 121 m) – åt samma håll i båda halvorna men svagt

### Milton Keynes Dons

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress** (faktiskt bollinnehav 43,7 %). 271 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 85 | 1,61–1,15 | +0,11 | +0,11 (+0,8) | −4 pe | +5 pe | +0,16 / +0,06 ✔ |
| Balanserat | 119 | 1,43–1,28 | +0,02 | +0,02 (+0,2) | −3 pe | −2 pe | +0,19 / −0,14  |
| Bollinnehav | 67 | 1,31–1,40 | −0,17 | −0,17 (−1,2) | +1 pe | +1 pe | −0,30 / −0,00 ✔ |
| Kortpass | 61 | 1,49–1,41 | −0,15 | −0,15 (−1,0) | +2 pe | +4 pe | −0,50 / +0,01  |
| Blandat | 114 | 1,43–1,38 | −0,11 | −0,11 (−1,0) | −2 pe | +5 pe | −0,16 / −0,07 ✔ |
| Direktspel | 96 | 1,47–1,05 | +0,23 | +0,23 (+1,8) | −5 pe | −5 pe | +0,38 / −0,05  |
| Lågpress | 75 | 1,65–1,25 | +0,06 | +0,06 (+0,4) | +5 pe | +8 pe | +0,04 / +0,08 ✔ |
| Mellanpress | 109 | 1,51–1,16 | +0,11 | +0,11 (+0,9) | −9 pe | −0 pe | +0,23 / −0,03  |
| Högpress | 87 | 1,22–1,43 | −0,19 | −0,18 (−1,4) | −0 pe | −3 pe | −0,20 / −0,17 ✔ |

- Svårast mot **Högpress** (−0,18 p/match rel. eget snitt, z −1,4, 87 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +1,8, 96 m) – inte stabilt, troligen slump

### Notts County

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 45,4 %). 91 matcher med stil, mot marknaden totalt +0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 29 | 1,62–1,10 | −0,03 | −0,12 (−0,5) | +2 pe | −3 pe | −0,60 / +0,27  |
| Balanserat | 44 | 1,18–0,98 | +0,03 | −0,07 (−0,4) | −2 pe | −15 pe | −0,05 / −0,10 ✔ |
| Bollinnehav | 18 | 2,06–1,22 | +0,46 | +0,37 (+1,2) | −9 pe | +20 pe | +0,12 / +0,53 ✔ |
| Kortpass | 32 | 1,47–1,00 | +0,20 | +0,11 (+0,5) | +3 pe | −15 pe | +0,16 / +0,07 ✔ |
| Blandat | 44 | 1,45–0,91 | +0,20 | +0,11 (+0,6) | −6 pe | −5 pe | −0,11 / +0,39  |
| Direktspel | 15 | 1,67–1,67 | −0,45 | −0,54 (−1,7) | −0 pe | +23 pe | −1,08 / −0,07 ✔ |
| Lågpress | 28 | 1,71–1,07 | +0,27 | +0,17 (+0,8) | −1 pe | +6 pe | −0,15 / +0,35  |
| Mellanpress | 40 | 1,15–1,18 | −0,19 | −0,29 (−1,5) | −2 pe | −9 pe | −0,75 / +0,05  |
| Högpress | 23 | 1,83–0,87 | +0,39 | +0,30 (+1,1) | −3 pe | −7 pe | +0,34 / +0,14 ✔ |

- Svårast mot **Direktspel** (−0,54 p/match rel. eget snitt, z −1,7, 15 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,37 p/match rel. eget snitt, z +1,2, 18 m) – åt samma håll i båda halvorna men svagt

### Oxford

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 57,7 %). 282 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,40–1,18 | +0,01 | +0,01 (+0,1) | +4 pe | −6 pe | −0,12 / +0,12  |
| Balanserat | 119 | 1,52–1,23 | +0,07 | +0,07 (+0,6) | −1 pe | +6 pe | +0,02 / +0,12 ✔ |
| Bollinnehav | 74 | 1,19–1,45 | −0,12 | −0,12 (−0,8) | −6 pe | +5 pe | −0,23 / −0,00 ✔ |
| Kortpass | 90 | 1,20–1,53 | −0,07 | −0,07 (−0,6) | −2 pe | +7 pe | −0,44 / +0,07  |
| Blandat | 108 | 1,44–1,18 | +0,13 | +0,13 (+1,0) | −3 pe | +3 pe | +0,17 / +0,09 ✔ |
| Direktspel | 84 | 1,56–1,11 | −0,09 | −0,09 (−0,7) | +3 pe | −5 pe | −0,16 / +0,18  |
| Lågpress | 68 | 1,47–1,46 | −0,05 | −0,04 (−0,3) | −5 pe | +12 pe | −0,31 / +0,24  |
| Mellanpress | 119 | 1,39–1,14 | +0,15 | +0,15 (+1,4) | +0 pe | −2 pe | +0,18 / +0,11 ✔ |
| Högpress | 95 | 1,35–1,29 | −0,16 | −0,16 (−1,3) | +1 pe | −1 pe | −0,28 / −0,04 ✔ |

- Svårast mot **Högpress** (−0,16 p/match rel. eget snitt, z −1,3, 95 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,15 p/match rel. eget snitt, z +1,4, 119 m) – åt samma håll i båda halvorna men svagt

### Peterboro

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 57,6 %). 284 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,57–1,50 | −0,03 | +0,00 (+0,0) | −6 pe | +10 pe | +0,19 / −0,11  |
| Balanserat | 113 | 1,48–1,44 | −0,15 | −0,12 (−1,0) | −8 pe | +4 pe | −0,12 / −0,11 ✔ |
| Bollinnehav | 69 | 1,43–1,36 | +0,16 | +0,19 (+1,3) | −3 pe | +4 pe | +0,34 / −0,01  |
| Kortpass | 65 | 1,52–1,48 | +0,02 | +0,05 (+0,3) | −1 pe | +6 pe | +0,28 / −0,06  |
| Blandat | 138 | 1,38–1,49 | −0,08 | −0,05 (−0,5) | −9 pe | +4 pe | +0,13 / −0,23  |
| Direktspel | 81 | 1,68–1,33 | +0,01 | +0,04 (+0,3) | −6 pe | +10 pe | −0,05 / +0,21  |
| Lågpress | 64 | 1,36–1,58 | −0,16 | −0,13 (−0,8) | −7 pe | +6 pe | −0,00 / −0,23 ✔ |
| Mellanpress | 115 | 1,49–1,17 | +0,12 | +0,15 (+1,3) | −5 pe | −1 pe | +0,23 / +0,04 ✔ |
| Högpress | 105 | 1,60–1,66 | −0,12 | −0,09 (−0,8) | −7 pe | +14 pe | −0,07 / −0,11 ✔ |

- Svårast mot **Balanserat** (−0,12 p/match rel. eget snitt, z −1,0, 113 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,15 p/match rel. eget snitt, z +1,3, 115 m) – åt samma håll i båda halvorna men svagt

### Plymouth

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 42,8 %). 284 matcher med stil, mot marknaden totalt +0,21 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,43–1,36 | +0,25 | +0,04 (+0,3) | −7 pe | +2 pe | −0,02 / +0,09  |
| Balanserat | 122 | 1,39–1,50 | +0,17 | −0,04 (−0,4) | −3 pe | −0 pe | +0,16 / −0,23  |
| Bollinnehav | 73 | 1,44–1,41 | +0,24 | +0,02 (+0,1) | +1 pe | +0 pe | +0,05 / −0,01  |
| Kortpass | 86 | 1,29–1,71 | +0,20 | −0,01 (−0,1) | −4 pe | +4 pe | +0,58 / −0,22  |
| Blandat | 121 | 1,59–1,42 | +0,24 | +0,02 (+0,2) | −1 pe | +5 pe | −0,02 / +0,05  |
| Direktspel | 77 | 1,29–1,14 | +0,19 | −0,02 (−0,2) | −5 pe | −10 pe | −0,02 / −0,04 ✔ |
| Lågpress | 47 | 1,66–1,15 | +0,46 | +0,25 (+1,3) | −11 pe | −1 pe | +0,25 / +0,25 ✔ |
| Mellanpress | 131 | 1,40–1,59 | +0,10 | −0,12 (−1,1) | +0 pe | +3 pe | −0,06 / −0,17 ✔ |
| Högpress | 106 | 1,33–1,37 | +0,25 | +0,03 (+0,3) | −4 pe | −1 pe | +0,16 / −0,08  |

- Svårast mot **Mellanpress** (−0,12 p/match rel. eget snitt, z −1,1, 131 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,25 p/match rel. eget snitt, z +1,3, 47 m) – åt samma håll i båda halvorna men svagt

### Reading

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 48,8 %). 363 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 138 | 1,23–1,26 | +0,06 | +0,01 (+0,1) | −1 pe | +1 pe | −0,10 / +0,10  |
| Balanserat | 142 | 1,32–1,51 | +0,00 | −0,05 (−0,5) | −1 pe | +11 pe | −0,02 / −0,07 ✔ |
| Bollinnehav | 83 | 1,29–1,58 | +0,12 | +0,07 (+0,5) | +0 pe | −0 pe | +0,01 / +0,15 ✔ |
| Kortpass | 69 | 1,45–1,64 | +0,15 | +0,10 (+0,7) | −2 pe | +8 pe | +0,18 / +0,08 ✔ |
| Blandat | 158 | 1,25–1,51 | −0,03 | −0,08 (−0,8) | +0 pe | +4 pe | −0,24 / +0,06  |
| Direktspel | 136 | 1,24–1,24 | +0,09 | +0,04 (+0,3) | −2 pe | +2 pe | +0,07 / −0,05  |
| Lågpress | 107 | 1,36–1,31 | +0,08 | +0,03 (+0,3) | −3 pe | +3 pe | −0,20 / +0,38  |
| Mellanpress | 130 | 1,28–1,54 | +0,00 | −0,05 (−0,4) | +0 pe | +11 pe | +0,03 / −0,15  |
| Högpress | 126 | 1,22–1,42 | +0,07 | +0,02 (+0,2) | −1 pe | −1 pe | +0,07 / −0,00  |

- Svårast mot **Blandat** (−0,08 p/match rel. eget snitt, z −0,8, 158 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,10 p/match rel. eget snitt, z +0,7, 69 m) – åt samma håll i båda halvorna men svagt

### Sheffield Weds

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 54,3 %). 363 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 100 | 1,33–1,26 | −0,10 | −0,07 (−0,6) | −1 pe | +6 pe | −0,13 / +0,02  |
| Balanserat | 151 | 1,12–1,29 | −0,05 | −0,02 (−0,2) | −3 pe | −5 pe | −0,01 / −0,03 ✔ |
| Bollinnehav | 112 | 1,25–1,53 | +0,05 | +0,08 (+0,7) | +3 pe | +4 pe | +0,17 / −0,01  |
| Kortpass | 113 | 1,11–1,62 | −0,07 | −0,04 (−0,3) | −1 pe | +4 pe | −0,05 / −0,03 ✔ |
| Blandat | 128 | 1,13–1,38 | −0,12 | −0,09 (−0,8) | +1 pe | +1 pe | +0,02 / −0,17  |
| Direktspel | 122 | 1,41–1,08 | +0,09 | +0,12 (+1,1) | −2 pe | −2 pe | +0,02 / +0,56 ✔ |
| Lågpress | 107 | 1,14–1,42 | −0,07 | −0,03 (−0,3) | +7 pe | +2 pe | −0,06 / +0,02  |
| Mellanpress | 145 | 1,28–1,32 | −0,01 | +0,03 (+0,3) | −3 pe | +1 pe | +0,11 / −0,05  |
| Högpress | 111 | 1,22–1,34 | −0,04 | −0,00 (−0,0) | −5 pe | +0 pe | −0,03 / +0,02  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,8, 128 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,12 p/match rel. eget snitt, z +1,1, 122 m) – åt samma håll i båda halvorna men svagt

### Stevenage

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress** (faktiskt bollinnehav 43,8 %). 271 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 81 | 0,94–1,09 | −0,14 | −0,13 (−1,0) | −3 pe | −3 pe | −0,48 / +0,05  |
| Balanserat | 127 | 1,20–1,08 | +0,14 | +0,15 (+1,4) | +1 pe | +1 pe | +0,13 / +0,17 ✔ |
| Bollinnehav | 63 | 0,98–0,97 | −0,14 | −0,13 (−0,9) | +8 pe | −9 pe | +0,06 / −0,29  |
| Kortpass | 62 | 1,05–1,00 | −0,03 | −0,02 (−0,2) | +0 pe | −7 pe | +0,43 / −0,13  |
| Blandat | 143 | 1,13–1,16 | −0,01 | +0,00 (+0,0) | −0 pe | +1 pe | −0,07 / +0,08  |
| Direktspel | 66 | 0,97–0,88 | +0,01 | +0,02 (+0,2) | +4 pe | −7 pe | −0,02 / +0,13  |
| Lågpress | 71 | 1,01–0,93 | +0,04 | +0,05 (+0,4) | +6 pe | −14 pe | +0,02 / +0,09 ✔ |
| Mellanpress | 96 | 0,98–1,11 | −0,05 | −0,04 (−0,4) | −4 pe | −1 pe | +0,01 / −0,10  |
| Högpress | 104 | 1,19–1,09 | −0,01 | +0,00 (+0,0) | +2 pe | +3 pe | −0,06 / +0,06  |

- Svårast mot **Backar hem** (−0,13 p/match rel. eget snitt, z −1,0, 81 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,4, 127 m) – åt samma håll i båda halvorna men svagt

### Stockport

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 58,4 %). 142 matcher med stil, mot marknaden totalt +0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 59 | 1,64–1,10 | +0,10 | +0,00 (+0,0) | −14 pe | +12 pe | −0,12 / +0,10  |
| Balanserat | 45 | 1,76–1,24 | +0,04 | −0,07 (−0,4) | +4 pe | +4 pe | −0,04 / −0,09 ✔ |
| Bollinnehav | 38 | 1,76–0,84 | +0,18 | +0,08 (+0,4) | +15 pe | −13 pe | +0,15 / −0,03  |
| Kortpass | 55 | 1,71–1,00 | +0,08 | −0,02 (−0,1) | +15 pe | −10 pe | +0,14 / −0,14  |
| Blandat | 61 | 1,54–1,15 | +0,01 | −0,09 (−0,5) | −9 pe | +8 pe | −0,19 / −0,01 ✔ |
| Direktspel | 26 | 2,12–1,08 | +0,36 | +0,25 (+1,2) | −14 pe | +18 pe | +0,05 / +1,11 ✔ |
| Lågpress | 41 | 1,73–0,93 | +0,23 | +0,12 (+0,6) | −8 pe | +2 pe | +0,41 / −0,04  |
| Mellanpress | 48 | 1,71–1,17 | +0,16 | +0,06 (+0,4) | +4 pe | +7 pe | −0,21 / +0,21  |
| Högpress | 53 | 1,70–1,11 | −0,05 | −0,15 (−0,9) | +1 pe | −1 pe | −0,08 / −0,34 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −0,9, 53 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,25 p/match rel. eget snitt, z +1,2, 26 m) – åt samma håll i båda halvorna men svagt

### Wigan

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 53,7 %). 323 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 123 | 1,13–1,20 | +0,10 | +0,06 (+0,6) | −2 pe | −3 pe | +0,09 / +0,04 ✔ |
| Balanserat | 118 | 1,27–1,27 | +0,04 | +0,00 (+0,0) | −0 pe | +1 pe | +0,09 / −0,10  |
| Bollinnehav | 82 | 1,15–1,32 | −0,06 | −0,09 (−0,7) | −1 pe | −5 pe | −0,16 / −0,02 ✔ |
| Kortpass | 77 | 1,14–1,13 | +0,02 | −0,01 (−0,1) | −1 pe | −8 pe | +0,15 / −0,09  |
| Blandat | 134 | 1,12–1,37 | −0,14 | −0,17 (−1,7) | +1 pe | −1 pe | −0,32 / −0,05 ✔ |
| Direktspel | 112 | 1,29–1,21 | +0,25 | +0,21 (+1,8) | −4 pe | +1 pe | +0,24 / +0,14 ✔ |
| Lågpress | 78 | 1,41–1,17 | +0,14 | +0,10 (+0,7) | +0 pe | +2 pe | +0,18 / +0,00 ✔ |
| Mellanpress | 120 | 1,13–1,34 | +0,01 | −0,03 (−0,2) | −5 pe | −0 pe | −0,11 / +0,07  |
| Högpress | 125 | 1,10–1,23 | −0,00 | −0,04 (−0,3) | +2 pe | −6 pe | +0,06 / −0,10  |

- Svårast mot **Blandat** (−0,17 p/match rel. eget snitt, z −1,7, 134 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,21 p/match rel. eget snitt, z +1,8, 112 m) – åt samma håll i båda halvorna men svagt

### Wycombe

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress** (faktiskt bollinnehav 49,5 %). 284 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 100 | 1,41–1,17 | +0,02 | −0,05 (−0,4) | −4 pe | +1 pe | −0,12 / +0,00  |
| Balanserat | 104 | 1,32–1,23 | +0,06 | −0,01 (−0,1) | +7 pe | −4 pe | −0,05 / +0,05  |
| Bollinnehav | 80 | 1,34–1,25 | +0,14 | +0,07 (+0,5) | −5 pe | −1 pe | +0,33 / −0,26  |
| Kortpass | 78 | 1,41–1,05 | +0,09 | +0,02 (+0,1) | −2 pe | −5 pe | +0,37 / −0,16  |
| Blandat | 124 | 1,26–1,35 | −0,02 | −0,09 (−0,8) | −2 pe | −0 pe | −0,14 / −0,05 ✔ |
| Direktspel | 82 | 1,45–1,16 | +0,18 | +0,11 (+0,8) | +4 pe | +0 pe | +0,07 / +0,20 ✔ |
| Lågpress | 75 | 1,39–1,25 | −0,03 | −0,10 (−0,7) | +1 pe | −2 pe | +0,10 / −0,30  |
| Mellanpress | 111 | 1,35–1,32 | +0,13 | +0,06 (+0,5) | −0 pe | −2 pe | −0,03 / +0,18  |
| Högpress | 98 | 1,34–1,06 | +0,08 | +0,01 (+0,1) | −1 pe | −0 pe | +0,12 / −0,07  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,8, 124 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,11 p/match rel. eget snitt, z +0,8, 82 m) – åt samma håll i båda halvorna men svagt
