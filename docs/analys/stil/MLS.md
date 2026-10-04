# Stilmatchning – MLS (MLS)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 4166 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 349 m · hemma −0,06 · kryss −1 pe · ö2,5 – | 528 m · hemma +0,05 · kryss +2 pe · ö2,5 – | 403 m · hemma +0,04 · kryss +3 pe · ö2,5 – |
| **Mellan** | 542 m · hemma −0,08 · kryss +2 pe · ö2,5 – | 605 m · hemma −0,02 · kryss −0 pe · ö2,5 – | 502 m · hemma +0,01 · kryss −0 pe · ö2,5 – |
| **Mycket boll** | 419 m · hemma +0,07 · kryss −1 pe · ö2,5 – | 502 m · hemma +0,05 · kryss +0 pe · ö2,5 – | 316 m · hemma −0,06 · kryss +1 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 380 m · hemma −0,02 · kryss +1 pe · ö2,5 – | 507 m · hemma −0,04 · kryss +3 pe · ö2,5 – | 429 m · hemma +0,04 · kryss +2 pe · ö2,5 – |
| **Balanserat** | 518 m · hemma −0,01 · kryss +1 pe · ö2,5 – | 540 m · hemma +0,06 · kryss −3 pe · ö2,5 – | 494 m · hemma −0,00 · kryss +0 pe · ö2,5 – |
| **Bollinnehav** | 440 m · hemma +0,01 · kryss −2 pe · ö2,5 – | 500 m · hemma +0,02 · kryss +2 pe · ö2,5 – | 358 m · hemma −0,08 · kryss +4 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 931 m · mot marknaden +0,02 (z +0,4) · mål 1,51 · ö2,5 – | 1084 m · mot marknaden −0,07 (z −1,8) · mål 1,44 · ö2,5 – | 650 m · mot marknaden +0,09 (z +1,9) · mål 1,52 · ö2,5 – |
| **Medel på fasta** | 1164 m · mot marknaden +0,01 (z +0,3) · mål 1,51 · ö2,5 – | 1498 m · mot marknaden −0,05 (z −1,7) · mål 1,39 · ö2,5 – | 850 m · mot marknaden +0,02 (z +0,6) · mål 1,48 · ö2,5 – |
| **Farlig på fasta** | 632 m · mot marknaden +0,04 (z +0,8) · mål 1,55 · ö2,5 – | 888 m · mot marknaden +0,05 (z +1,1) · mål 1,59 · ö2,5 – | 635 m · mot marknaden −0,09 (z −1,8) · mål 1,53 · ö2,5 – |

## Lag (säsong 2026)

### Atlanta Utd

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 51,1 %). 292 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026 (27 m): 0,18 mål för (xG 0,23), 0,22 emot (xG 0,34), 5,00 hörnor · 2025 (34 m): 0,29 mål för (xG 0,26), 0,29 emot (xG 0,24), 4,41 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,31–1,35 | −0,23 | −0,14 (−1,2) | +6 pe | – | +0,08 / −0,31  |
| Balanserat | 120 | 1,60–1,46 | +0,01 | +0,09 (+0,8) | −3 pe | – | +0,18 / −0,04  |
| Bollinnehav | 89 | 1,48–1,56 | −0,08 | +0,01 (+0,1) | +3 pe | – | −0,04 / +0,04  |
| Kortpass | 66 | 1,33–1,80 | −0,23 | −0,14 (−1,0) | +3 pe | – | −0,35 / −0,09 ✔ |
| Blandat | 138 | 1,43–1,41 | −0,14 | −0,05 (−0,5) | +3 pe | – | −0,04 / −0,07 ✔ |
| Direktspel | 88 | 1,67–1,28 | +0,10 | +0,18 (+1,5) | −2 pe | – | +0,32 / −0,21  |
| Lågpress | 56 | 1,59–1,52 | −0,07 | +0,02 (+0,1) | −2 pe | – | +0,15 / −0,17  |
| Mellanpress | 139 | 1,50–1,47 | −0,09 | +0,00 (+0,0) | +0 pe | – | +0,14 / −0,14  |
| Högpress | 97 | 1,39–1,41 | −0,10 | −0,01 (−0,1) | +4 pe | – | −0,01 / −0,01 ✔ |
| Svag på fasta | 96 | 1,46–1,46 | −0,22 | −0,14 (−1,1) | −3 pe | – | +0,04 / −0,35  |
| Medel på fasta | 132 | 1,44–1,44 | −0,01 | +0,07 (+0,7) | +6 pe | – | +0,12 / +0,04 ✔ |
| Farlig på fasta | 64 | 1,61–1,50 | −0,03 | +0,05 (+0,4) | −1 pe | – | +0,15 / −0,09  |
| Stark mot fasta | 106 | 1,49–1,51 | −0,11 | −0,02 (−0,2) | +2 pe | – | +0,15 / −0,21  |
| Medel mot fasta | 120 | 1,38–1,51 | −0,20 | −0,11 (−1,0) | +1 pe | – | −0,14 / −0,09 ✔ |
| Svag mot fasta | 66 | 1,67–1,29 | +0,15 | +0,24 (+1,7) | +1 pe | – | +0,32 / +0,10 ✔ |

- Svårast mot **Backar hem** (−0,14 p/match rel. eget snitt, z −1,2, 83 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,24 p/match rel. eget snitt, z +1,7, 66 m) – åt samma håll i båda halvorna men svagt

### Austin FC

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 48,7 %). 163 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,44 mål för (xG 0,33), 0,37 emot (xG 0,38), 4,44 hörnor · 2025 (36 m): 0,28 mål för (xG 0,25), 0,19 emot (xG 0,26), 4,39 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 63 | 1,37–1,52 | +0,13 | +0,08 (+0,5) | +3 pe | – | +0,01 / +0,16 ✔ |
| Balanserat | 51 | 1,24–1,55 | −0,25 | −0,29 (−1,8) | −0 pe | – | −0,26 / −0,32 ✔ |
| Bollinnehav | 49 | 1,51–1,41 | +0,24 | +0,20 (+1,1) | +4 pe | – | +0,43 / −0,03  |
| Kortpass | 52 | 1,29–1,56 | +0,09 | +0,05 (+0,3) | −2 pe | – | +0,26 / −0,04  |
| Blandat | 87 | 1,31–1,40 | +0,02 | −0,02 (−0,2) | +2 pe | – | +0,06 / −0,12  |
| Direktspel | 24 | 1,75–1,71 | +0,02 | −0,02 (−0,1) | +13 pe | – | −0,18 / +0,45  |
| Lågpress | 31 | 1,23–1,52 | −0,20 | −0,24 (−1,2) | +10 pe | – | −0,62 / −0,11 ✔ |
| Mellanpress | 75 | 1,29–1,57 | −0,05 | −0,09 (−0,6) | +3 pe | – | −0,17 / +0,00  |
| Högpress | 57 | 1,54–1,39 | +0,30 | +0,25 (+1,5) | −2 pe | – | +0,49 / −0,05  |
| Svag på fasta | 48 | 1,35–1,52 | −0,04 | −0,09 (−0,5) | +2 pe | – | +0,11 / −0,32  |
| Medel på fasta | 76 | 1,39–1,39 | +0,10 | +0,06 (+0,4) | +1 pe | – | +0,13 / −0,02  |
| Farlig på fasta | 39 | 1,33–1,67 | +0,03 | −0,01 (−0,1) | +6 pe | – | −0,30 / +0,17  |
| Stark mot fasta | 46 | 1,33–1,61 | −0,12 | −0,16 (−1,0) | +9 pe | – | −0,09 / −0,30 ✔ |
| Medel mot fasta | 78 | 1,37–1,54 | +0,08 | +0,04 (+0,3) | +3 pe | – | +0,21 / −0,09  |
| Svag mot fasta | 39 | 1,41–1,28 | +0,16 | +0,12 (+0,6) | −7 pe | – | −0,03 / +0,24  |

- Svårast mot **Balanserat** (−0,29 p/match rel. eget snitt, z −1,8, 51 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,25 p/match rel. eget snitt, z +1,5, 57 m) – inte stabilt, troligen slump

### CF Montreal

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 48,5 %). 317 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,11 mål för (xG 0,24), 0,59 emot (xG 0,35), 5,04 hörnor · 2025 (34 m): 0,21 mål för (xG 0,30), 0,38 emot (xG 0,39), 5,06 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,44–1,66 | +0,01 | −0,03 (−0,3) | −6 pe | – | −0,13 / +0,04  |
| Balanserat | 124 | 1,35–1,43 | +0,13 | +0,08 (+0,7) | −2 pe | – | +0,13 / +0,03 ✔ |
| Bollinnehav | 97 | 1,31–1,99 | −0,03 | −0,07 (−0,6) | −7 pe | – | −0,08 / −0,06 ✔ |
| Kortpass | 61 | 1,21–1,80 | +0,02 | −0,02 (−0,1) | −10 pe | – | +0,09 / −0,03  |
| Blandat | 141 | 1,43–1,72 | +0,07 | +0,03 (+0,2) | −4 pe | – | +0,05 / +0,01 ✔ |
| Direktspel | 115 | 1,36–1,53 | +0,02 | −0,02 (−0,2) | −3 pe | – | −0,05 / +0,08  |
| Lågpress | 89 | 1,60–1,63 | +0,06 | +0,02 (+0,1) | −7 pe | – | +0,05 / −0,07  |
| Mellanpress | 138 | 1,23–1,80 | −0,04 | −0,09 (−0,8) | −3 pe | – | −0,11 / −0,07 ✔ |
| Högpress | 90 | 1,33–1,51 | +0,16 | +0,12 (+0,9) | −5 pe | – | +0,06 / +0,15 ✔ |
| Svag på fasta | 104 | 1,33–1,83 | −0,07 | −0,12 (−1,0) | −6 pe | – | −0,18 / −0,05 ✔ |
| Medel på fasta | 137 | 1,42–1,69 | +0,04 | −0,00 (−0,0) | −2 pe | – | −0,06 / +0,04  |
| Farlig på fasta | 76 | 1,32–1,42 | +0,21 | +0,17 (+1,2) | −7 pe | – | +0,28 / +0,02 ✔ |
| Stark mot fasta | 118 | 1,28–1,64 | +0,08 | +0,03 (+0,3) | −7 pe | – | +0,01 / +0,06 ✔ |
| Medel mot fasta | 122 | 1,36–1,72 | −0,01 | −0,05 (−0,5) | −3 pe | – | −0,10 / −0,02 ✔ |
| Svag mot fasta | 77 | 1,49–1,64 | +0,08 | +0,03 (+0,2) | −4 pe | – | +0,06 / −0,03  |

- Svårast mot **Svag på fasta** (−0,12 p/match rel. eget snitt, z −1,0, 104 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,17 p/match rel. eget snitt, z +1,2, 76 m) – åt samma håll i båda halvorna men svagt

### Charlotte

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 45,8 %). 134 matcher med stil, mot marknaden totalt +0,13 per match.

Fasta situationer per match: 2026 (27 m): 0,41 mål för (xG 0,39), 0,33 emot (xG 0,28), 4,48 hörnor · 2025 (37 m): 0,22 mål för (xG 0,23), 0,14 emot (xG 0,14), 3,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,63–1,58 | +0,19 | +0,06 (+0,3) | +3 pe | – | −0,12 / +0,38  |
| Balanserat | 54 | 1,39–1,28 | −0,00 | −0,13 (−0,8) | +2 pe | – | −0,12 / −0,14 ✔ |
| Bollinnehav | 42 | 1,33–1,26 | +0,24 | +0,11 (+0,5) | −6 pe | – | −0,00 / +0,27  |
| Kortpass | 60 | 1,45–1,43 | +0,07 | −0,06 (−0,3) | −2 pe | – | +0,22 / −0,16  |
| Blandat | 54 | 1,52–1,28 | +0,26 | +0,13 (+0,8) | −1 pe | – | −0,08 / +0,51  |
| Direktspel | 20 | 1,20–1,35 | −0,04 | −0,17 (−0,7) | +9 pe | – | −0,37 / +0,60  |
| Lågpress | 23 | 1,70–1,57 | +0,23 | +0,10 (+0,4) | −4 pe | – | +0,29 / +0,07  |
| Mellanpress | 67 | 1,36–1,33 | +0,04 | −0,09 (−0,6) | +1 pe | – | −0,08 / −0,10 ✔ |
| Högpress | 44 | 1,43–1,30 | +0,21 | +0,08 (+0,4) | −0 pe | – | −0,12 / +0,40  |
| Svag på fasta | 39 | 1,33–1,33 | +0,00 | −0,12 (−0,6) | −5 pe | – | +0,10 / −0,32  |
| Medel på fasta | 70 | 1,56–1,36 | +0,29 | +0,16 (+1,1) | +3 pe | – | −0,12 / +0,50  |
| Farlig på fasta | 25 | 1,28–1,40 | −0,14 | −0,27 (−1,1) | −1 pe | – | −0,22 / −0,31 ✔ |
| Stark mot fasta | 43 | 1,40–1,23 | +0,13 | +0,00 (+0,0) | −2 pe | – | +0,00 / +0,01 ✔ |
| Medel mot fasta | 69 | 1,49–1,39 | +0,15 | +0,02 (+0,1) | −1 pe | – | −0,14 / +0,16  |
| Svag mot fasta | 22 | 1,36–1,50 | +0,05 | −0,08 (−0,3) | +7 pe | – | −0,06 / −0,10 ✔ |

- Svårast mot **Farlig på fasta** (−0,27 p/match rel. eget snitt, z −1,1, 25 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,16 p/match rel. eget snitt, z +1,1, 70 m) – inte stabilt, troligen slump

### Chicago Fire

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,6 %). 314 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026 (26 m): 0,31 mål för (xG 0,30), 0,23 emot (xG 0,21), 4,50 hörnor · 2025 (37 m): 0,46 mål för (xG 0,38), 0,30 emot (xG 0,19), 4,62 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,48–1,52 | +0,07 | +0,18 (+1,4) | −0 pe | – | +0,03 / +0,30 ✔ |
| Balanserat | 122 | 1,53–1,65 | −0,08 | +0,02 (+0,2) | +2 pe | – | +0,05 / −0,01  |
| Bollinnehav | 101 | 1,32–1,59 | −0,30 | −0,19 (−1,7) | +3 pe | – | −0,16 / −0,21 ✔ |
| Kortpass | 64 | 1,47–1,58 | −0,10 | +0,01 (+0,1) | +2 pe | – | +0,59 / −0,05  |
| Blandat | 129 | 1,36–1,53 | −0,08 | +0,03 (+0,3) | +2 pe | – | −0,11 / +0,13  |
| Direktspel | 121 | 1,53–1,67 | −0,14 | −0,04 (−0,4) | +1 pe | – | −0,00 / −0,15 ✔ |
| Lågpress | 88 | 1,67–1,57 | +0,06 | +0,17 (+1,4) | −1 pe | – | +0,02 / +0,58 ✔ |
| Mellanpress | 136 | 1,35–1,64 | −0,21 | −0,10 (−1,0) | +6 pe | – | −0,07 / −0,12 ✔ |
| Högpress | 90 | 1,38–1,54 | −0,12 | −0,01 (−0,1) | −3 pe | – | +0,00 / −0,02  |
| Svag på fasta | 98 | 1,52–1,63 | −0,19 | −0,09 (−0,8) | +7 pe | – | −0,08 / −0,10 ✔ |
| Medel på fasta | 144 | 1,45–1,55 | −0,07 | +0,03 (+0,3) | +2 pe | – | +0,06 / +0,02 ✔ |
| Farlig på fasta | 72 | 1,35–1,63 | −0,05 | +0,05 (+0,4) | −7 pe | – | −0,03 / +0,16  |
| Stark mot fasta | 108 | 1,46–1,66 | −0,06 | +0,05 (+0,4) | −3 pe | – | −0,00 / +0,09  |
| Medel mot fasta | 121 | 1,36–1,58 | −0,14 | −0,04 (−0,3) | +3 pe | – | −0,07 / −0,02 ✔ |
| Svag mot fasta | 85 | 1,55–1,53 | −0,12 | −0,01 (−0,1) | +6 pe | – | +0,01 / −0,05  |

- Svårast mot **Bollinnehav** (−0,19 p/match rel. eget snitt, z −1,7, 101 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,18 p/match rel. eget snitt, z +1,4, 91 m) – åt samma håll i båda halvorna men svagt

### Colorado Rapids

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 55,2 %). 307 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (27 m): 0,33 mål för (xG 0,33), 0,26 emot (xG 0,20), 4,96 hörnor · 2025 (34 m): 0,15 mål för (xG 0,29), 0,21 emot (xG 0,25), 5,06 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,26–1,49 | +0,03 | +0,06 (+0,5) | +3 pe | – | +0,24 / −0,13  |
| Balanserat | 106 | 1,54–1,58 | +0,09 | +0,12 (+1,0) | −6 pe | – | +0,09 / +0,16 ✔ |
| Bollinnehav | 97 | 1,20–1,80 | −0,21 | −0,19 (−1,6) | −4 pe | – | −0,15 / −0,22 ✔ |
| Kortpass | 55 | 1,55–1,75 | +0,03 | +0,06 (+0,3) | −8 pe | – | +0,40 / +0,01 ✔ |
| Blandat | 135 | 1,32–1,47 | +0,03 | +0,06 (+0,6) | −2 pe | – | +0,27 / −0,07  |
| Direktspel | 117 | 1,26–1,74 | −0,12 | −0,09 (−0,8) | +0 pe | – | −0,05 / −0,31 ✔ |
| Lågpress | 106 | 1,31–1,46 | +0,05 | +0,08 (+0,6) | −4 pe | – | +0,08 / +0,08 ✔ |
| Mellanpress | 132 | 1,24–1,86 | −0,20 | −0,18 (−1,8) | −0 pe | – | −0,12 / −0,22 ✔ |
| Högpress | 69 | 1,55–1,42 | +0,19 | +0,22 (+1,5) | −4 pe | – | +0,55 / +0,05 ✔ |
| Svag på fasta | 96 | 1,32–1,56 | +0,03 | +0,06 (+0,5) | −3 pe | – | −0,05 / +0,19  |
| Medel på fasta | 126 | 1,45–1,64 | −0,02 | +0,01 (+0,1) | +0 pe | – | +0,19 / −0,12  |
| Farlig på fasta | 85 | 1,18–1,66 | −0,10 | −0,07 (−0,5) | −6 pe | – | +0,09 / −0,27  |
| Stark mot fasta | 86 | 1,48–1,44 | +0,21 | +0,23 (+1,7) | +1 pe | – | +0,31 / +0,16 ✔ |
| Medel mot fasta | 134 | 1,37–1,75 | −0,04 | −0,02 (−0,2) | −5 pe | – | +0,07 / −0,10  |
| Svag mot fasta | 87 | 1,15–1,61 | −0,23 | −0,20 (−1,7) | −1 pe | – | −0,13 / −0,28 ✔ |

- Svårast mot **Mellanpress** (−0,18 p/match rel. eget snitt, z −1,8, 132 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,23 p/match rel. eget snitt, z +1,7, 86 m) – åt samma håll i båda halvorna men svagt

### Columbus Crew

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 56,5 %). 333 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026 (27 m): 0,22 mål för (xG 0,15), 0,33 emot (xG 0,19), 5,07 hörnor · 2025 (37 m): 0,14 mål för (xG 0,17), 0,19 emot (xG 0,26), 4,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 103 | 1,63–1,15 | +0,14 | +0,14 (+1,2) | +6 pe | – | +0,18 / +0,12 ✔ |
| Balanserat | 129 | 1,50–1,37 | −0,12 | −0,12 (−1,1) | −0 pe | – | −0,09 / −0,16 ✔ |
| Bollinnehav | 101 | 1,53–1,44 | +0,00 | +0,00 (+0,0) | −1 pe | – | +0,05 / −0,04  |
| Kortpass | 69 | 1,61–1,45 | −0,17 | −0,17 (−1,1) | −3 pe | – | +0,23 / −0,23  |
| Blandat | 130 | 1,67–1,43 | +0,02 | +0,02 (+0,2) | +4 pe | – | +0,03 / +0,02 ✔ |
| Direktspel | 134 | 1,40–1,15 | +0,06 | +0,07 (+0,6) | +1 pe | – | +0,01 / +0,26 ✔ |
| Lågpress | 94 | 1,46–1,45 | −0,13 | −0,13 (−1,0) | −6 pe | – | +0,02 / −0,46  |
| Mellanpress | 137 | 1,52–1,38 | −0,07 | −0,07 (−0,7) | +8 pe | – | −0,13 / −0,01 ✔ |
| Högpress | 102 | 1,68–1,13 | +0,21 | +0,21 (+1,7) | −2 pe | – | +0,33 / +0,14 ✔ |
| Svag på fasta | 104 | 1,48–1,24 | +0,02 | +0,03 (+0,2) | −4 pe | – | −0,04 / +0,13  |
| Medel på fasta | 148 | 1,66–1,34 | −0,02 | −0,02 (−0,2) | +6 pe | – | +0,20 / −0,15  |
| Farlig på fasta | 81 | 1,43–1,38 | +0,00 | +0,00 (+0,0) | −0 pe | – | −0,08 / +0,13  |
| Stark mot fasta | 106 | 1,39–1,35 | −0,20 | −0,20 (−1,7) | +3 pe | – | −0,21 / −0,19 ✔ |
| Medel mot fasta | 137 | 1,58–1,33 | −0,00 | −0,00 (−0,0) | +1 pe | – | +0,01 / −0,01  |
| Svag mot fasta | 90 | 1,69–1,28 | +0,23 | +0,23 (+1,8) | −0 pe | – | +0,24 / +0,22 ✔ |

- Svårast mot **Stark mot fasta** (−0,20 p/match rel. eget snitt, z −1,7, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,23 p/match rel. eget snitt, z +1,8, 90 m) – åt samma håll i båda halvorna men svagt

### DC United

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 37,3 %). 312 matcher med stil, mot marknaden totalt −0,12 per match.

Fasta situationer per match: 2026 (27 m): 0,52 mål för (xG 0,47), 0,33 emot (xG 0,29), 4,85 hörnor · 2025 (34 m): 0,18 mål för (xG 0,24), 0,35 emot (xG 0,23), 4,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,14–1,90 | −0,21 | −0,09 (−0,7) | −6 pe | – | +0,04 / −0,20  |
| Balanserat | 118 | 1,37–1,52 | +0,03 | +0,15 (+1,4) | +8 pe | – | +0,21 / +0,08 ✔ |
| Bollinnehav | 108 | 1,27–1,74 | −0,22 | −0,09 (−0,8) | +2 pe | – | +0,02 / −0,19  |
| Kortpass | 69 | 1,29–1,62 | −0,14 | −0,02 (−0,1) | +13 pe | – | +0,14 / −0,04  |
| Blandat | 124 | 1,27–1,67 | −0,10 | +0,02 (+0,2) | +2 pe | – | +0,16 / −0,08  |
| Direktspel | 119 | 1,27–1,77 | −0,14 | −0,01 (−0,1) | −4 pe | – | +0,07 / −0,35  |
| Lågpress | 95 | 1,27–1,58 | −0,10 | +0,02 (+0,2) | −3 pe | – | +0,11 / −0,15  |
| Mellanpress | 125 | 1,26–1,66 | −0,13 | −0,01 (−0,1) | +7 pe | – | +0,09 / −0,08  |
| Högpress | 92 | 1,28–1,87 | −0,14 | −0,01 (−0,1) | +1 pe | – | +0,11 / −0,09  |
| Svag på fasta | 113 | 1,38–1,70 | −0,13 | −0,01 (−0,1) | −1 pe | – | +0,13 / −0,19  |
| Medel på fasta | 126 | 1,23–1,63 | −0,09 | +0,03 (+0,3) | +0 pe | – | +0,15 / −0,05  |
| Farlig på fasta | 73 | 1,18–1,81 | −0,16 | −0,04 (−0,3) | +11 pe | – | +0,00 / −0,09  |
| Stark mot fasta | 115 | 1,32–1,83 | −0,06 | +0,06 (+0,6) | +2 pe | – | +0,26 / −0,11  |
| Medel mot fasta | 115 | 1,26–1,69 | −0,13 | −0,01 (−0,1) | +5 pe | – | +0,00 / −0,02  |
| Svag mot fasta | 82 | 1,22–1,54 | −0,20 | −0,07 (−0,6) | −2 pe | – | +0,03 / −0,33  |

- Svårast mot **Bollinnehav** (−0,09 p/match rel. eget snitt, z −0,8, 108 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,4, 118 m) – åt samma håll i båda halvorna men svagt

### FC Cincinnati

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 48,9 %). 229 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026 (27 m): 0,37 mål för (xG 0,44), 0,41 emot (xG 0,34), 4,89 hörnor · 2025 (38 m): 0,18 mål för (xG 0,22), 0,24 emot (xG 0,19), 4,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,45–1,60 | −0,01 | −0,12 (−0,8) | −3 pe | – | −0,06 / −0,18 ✔ |
| Balanserat | 85 | 1,45–1,55 | +0,15 | +0,04 (+0,3) | +3 pe | – | −0,00 / +0,11  |
| Bollinnehav | 79 | 1,63–1,65 | +0,16 | +0,05 (+0,4) | −2 pe | – | −0,24 / +0,25  |
| Kortpass | 68 | 1,91–1,66 | +0,28 | +0,17 (+1,1) | −1 pe | – | +0,13 / +0,17 ✔ |
| Blandat | 108 | 1,35–1,55 | +0,07 | −0,04 (−0,3) | +1 pe | – | −0,10 / +0,06  |
| Direktspel | 53 | 1,32–1,62 | −0,03 | −0,14 (−0,8) | −3 pe | – | −0,11 / −0,23 ✔ |
| Lågpress | 41 | 1,66–1,76 | +0,21 | +0,10 (+0,5) | +4 pe | – | +0,30 / +0,02 ✔ |
| Mellanpress | 105 | 1,39–1,49 | +0,07 | −0,03 (−0,3) | +0 pe | – | −0,16 / +0,10  |
| Högpress | 83 | 1,59–1,66 | +0,10 | −0,01 (−0,0) | −3 pe | – | −0,10 / +0,12  |
| Svag på fasta | 74 | 1,28–1,62 | +0,04 | −0,07 (−0,5) | −5 pe | – | −0,17 / −0,00 ✔ |
| Medel på fasta | 101 | 1,67–1,53 | +0,11 | +0,00 (+0,0) | +2 pe | – | −0,08 / +0,09  |
| Farlig på fasta | 54 | 1,52–1,69 | +0,20 | +0,09 (+0,5) | +1 pe | – | −0,01 / +0,24  |
| Stark mot fasta | 83 | 1,46–1,64 | +0,11 | +0,01 (+0,0) | +2 pe | – | −0,22 / +0,28  |
| Medel mot fasta | 95 | 1,56–1,48 | +0,07 | −0,03 (−0,3) | +2 pe | – | +0,14 / −0,13  |
| Svag mot fasta | 51 | 1,51–1,75 | +0,16 | +0,05 (+0,3) | −9 pe | – | −0,13 / +0,44  |

- Svårast mot **Direktspel** (−0,14 p/match rel. eget snitt, z −0,8, 53 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,17 p/match rel. eget snitt, z +1,1, 68 m) – åt samma håll i båda halvorna men svagt

### FC Dallas

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 42,2 %). 314 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026 (27 m): 0,22 mål för (xG 0,26), 0,22 emot (xG 0,17), 4,41 hörnor · 2025 (36 m): 0,19 mål för (xG 0,22), 0,25 emot (xG 0,31), 3,61 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 110 | 1,37–1,31 | −0,04 | −0,03 (−0,3) | +4 pe | – | −0,15 / +0,08  |
| Balanserat | 113 | 1,50–1,42 | −0,03 | −0,03 (−0,3) | +10 pe | – | −0,03 / −0,02 ✔ |
| Bollinnehav | 91 | 1,53–1,43 | +0,08 | +0,08 (+0,7) | +8 pe | – | −0,15 / +0,26  |
| Kortpass | 50 | 1,72–1,74 | +0,19 | +0,19 (+1,1) | −1 pe | – | −0,19 / +0,24  |
| Blandat | 145 | 1,36–1,32 | −0,03 | −0,03 (−0,3) | +8 pe | – | −0,18 / +0,06  |
| Direktspel | 119 | 1,48–1,30 | −0,05 | −0,05 (−0,4) | +10 pe | – | −0,06 / +0,01  |
| Lågpress | 118 | 1,49–1,32 | −0,06 | −0,05 (−0,5) | +12 pe | – | −0,15 / +0,15  |
| Mellanpress | 121 | 1,36–1,42 | +0,00 | +0,01 (+0,1) | +4 pe | – | +0,00 / +0,01 ✔ |
| Högpress | 75 | 1,57–1,41 | +0,08 | +0,08 (+0,5) | +7 pe | – | −0,16 / +0,20  |
| Svag på fasta | 98 | 1,64–1,43 | −0,03 | −0,03 (−0,3) | +11 pe | – | −0,17 / +0,18  |
| Medel på fasta | 117 | 1,44–1,30 | +0,08 | +0,08 (+0,8) | +6 pe | – | −0,02 / +0,15  |
| Farlig på fasta | 99 | 1,31–1,43 | −0,07 | −0,07 (−0,6) | +6 pe | – | −0,10 / −0,03 ✔ |
| Stark mot fasta | 93 | 1,42–1,17 | +0,11 | +0,11 (+0,9) | +6 pe | – | +0,03 / +0,20 ✔ |
| Medel mot fasta | 139 | 1,50–1,45 | −0,02 | −0,02 (−0,2) | +8 pe | – | −0,15 / +0,08  |
| Svag mot fasta | 82 | 1,45–1,50 | −0,09 | −0,09 (−0,7) | +9 pe | – | −0,18 / +0,04  |

- Svårast mot **Svag mot fasta** (−0,09 p/match rel. eget snitt, z −0,7, 82 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,19 p/match rel. eget snitt, z +1,1, 50 m) – inte stabilt, troligen slump

### Houston Dynamo

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 47,8 %). 316 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,23), 0,26 emot (xG 0,18), 4,30 hörnor · 2025 (34 m): 0,35 mål för (xG 0,43), 0,38 emot (xG 0,28), 5,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 114 | 1,36–1,52 | −0,08 | +0,01 (+0,0) | +6 pe | – | −0,22 / +0,20  |
| Balanserat | 109 | 1,41–1,48 | −0,07 | +0,01 (+0,1) | −5 pe | – | −0,03 / +0,06  |
| Bollinnehav | 93 | 1,29–1,25 | −0,10 | −0,02 (−0,2) | +2 pe | – | −0,02 / −0,02 ✔ |
| Kortpass | 55 | 1,33–1,25 | +0,06 | +0,14 (+0,8) | +1 pe | – | −0,15 / +0,18  |
| Blandat | 142 | 1,30–1,35 | −0,09 | −0,01 (−0,1) | −0 pe | – | +0,02 / −0,03  |
| Direktspel | 119 | 1,44–1,59 | −0,13 | −0,05 (−0,5) | +4 pe | – | −0,15 / +0,41  |
| Lågpress | 114 | 1,46–1,39 | −0,05 | +0,04 (+0,3) | +3 pe | – | −0,06 / +0,26  |
| Mellanpress | 137 | 1,35–1,45 | −0,03 | +0,05 (+0,5) | +1 pe | – | −0,06 / +0,14  |
| Högpress | 65 | 1,18–1,45 | −0,25 | −0,17 (−1,2) | −0 pe | – | −0,30 / −0,11 ✔ |
| Svag på fasta | 103 | 1,43–1,41 | −0,05 | +0,03 (+0,2) | +5 pe | – | +0,00 / +0,06 ✔ |
| Medel på fasta | 123 | 1,35–1,35 | −0,03 | +0,05 (+0,4) | +2 pe | – | −0,03 / +0,10  |
| Farlig på fasta | 90 | 1,29–1,54 | −0,18 | −0,10 (−0,8) | −4 pe | – | −0,27 / +0,09  |
| Stark mot fasta | 99 | 1,19–1,69 | −0,44 | −0,36 (−3,5) | +8 pe | – | −0,45 / −0,27 ✔ ⚑ |
| Medel mot fasta | 131 | 1,40–1,19 | +0,16 | +0,24 (+2,2) | −2 pe | – | +0,07 / +0,37 ✔ ⚑ |
| Svag mot fasta | 86 | 1,49–1,48 | −0,03 | +0,06 (+0,4) | −2 pe | – | +0,10 / −0,00  |

- Svårast mot **Stark mot fasta** (−0,36 p/match rel. eget snitt, z −3,5, 99 m) – ⚑ håller i båda halvorna
- Bäst mot **Medel mot fasta** (+0,24 p/match rel. eget snitt, z +2,2, 131 m) – ⚑ håller i båda halvorna

### Inter Miami

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 56,7 %). 204 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026 (27 m): 0,59 mål för (xG 0,37), 0,22 emot (xG 0,30), 5,30 hörnor · 2025 (40 m): 0,25 mål för (xG 0,22), 0,38 emot (xG 0,27), 4,63 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 1,90–1,79 | +0,17 | +0,03 (+0,2) | −3 pe | – | −0,22 / +0,23  |
| Balanserat | 79 | 1,72–1,61 | +0,03 | −0,12 (−0,8) | −4 pe | – | −0,15 / −0,08 ✔ |
| Bollinnehav | 67 | 1,85–1,40 | +0,26 | +0,12 (+0,8) | +0 pe | – | −0,00 / +0,25  |
| Kortpass | 62 | 2,06–1,68 | +0,01 | −0,14 (−0,8) | +3 pe | – | −0,41 / −0,06 ✔ |
| Blandat | 105 | 1,81–1,59 | +0,19 | +0,04 (+0,4) | −5 pe | – | −0,08 / +0,20  |
| Direktspel | 37 | 1,41–1,46 | +0,26 | +0,12 (+0,6) | −2 pe | – | −0,03 / +0,64  |
| Lågpress | 32 | 2,13–1,56 | +0,05 | −0,10 (−0,4) | −1 pe | – | −0,53 / +0,00  |
| Mellanpress | 96 | 1,86–1,48 | +0,28 | +0,13 (+1,0) | −3 pe | – | +0,13 / +0,12 ✔ |
| Högpress | 76 | 1,62–1,75 | +0,03 | −0,12 (−0,8) | −2 pe | – | −0,33 / +0,21  |
| Svag på fasta | 59 | 1,97–1,36 | +0,31 | +0,16 (+1,0) | −2 pe | – | +0,04 / +0,23 ✔ |
| Medel på fasta | 93 | 1,90–1,62 | +0,18 | +0,04 (+0,3) | −8 pe | – | −0,20 / +0,30  |
| Farlig på fasta | 52 | 1,48–1,81 | −0,10 | −0,25 (−1,5) | +7 pe | – | −0,10 / −0,49 ✔ |
| Stark mot fasta | 73 | 1,73–1,78 | +0,08 | −0,06 (−0,4) | −2 pe | – | +0,02 / −0,14  |
| Medel mot fasta | 84 | 1,93–1,50 | +0,18 | +0,03 (+0,2) | +0 pe | – | −0,18 / +0,17  |
| Svag mot fasta | 47 | 1,74–1,47 | +0,20 | +0,05 (+0,3) | −7 pe | – | −0,20 / +0,64  |

- Svårast mot **Farlig på fasta** (−0,25 p/match rel. eget snitt, z −1,5, 52 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,16 p/match rel. eget snitt, z +1,0, 59 m) – åt samma håll i båda halvorna men svagt

### Los Angeles FC

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 46,8 %). 264 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026 (28 m): 0,18 mål för (xG 0,26), 0,21 emot (xG 0,16), 6,21 hörnor · 2025 (37 m): 0,24 mål för (xG 0,29), 0,30 emot (xG 0,20), 4,89 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,96–1,29 | −0,13 | −0,05 (−0,4) | +6 pe | – | −0,25 / +0,18  |
| Balanserat | 90 | 1,84–1,26 | −0,13 | −0,05 (−0,4) | +2 pe | – | +0,14 / −0,23  |
| Bollinnehav | 84 | 1,87–1,32 | +0,03 | +0,11 (+0,8) | −5 pe | – | +0,02 / +0,19 ✔ |
| Kortpass | 52 | 1,73–1,38 | −0,18 | −0,11 (−0,7) | +2 pe | – | +0,53 / −0,16  |
| Blandat | 141 | 1,83–1,21 | −0,00 | +0,07 (+0,7) | +2 pe | – | −0,06 / +0,19  |
| Direktspel | 71 | 2,13–1,37 | −0,14 | −0,07 (−0,4) | −0 pe | – | −0,06 / −0,11 ✔ |
| Lågpress | 69 | 1,97–1,26 | −0,21 | −0,13 (−0,9) | −3 pe | – | −0,17 / −0,09 ✔ |
| Mellanpress | 124 | 1,79–1,29 | −0,01 | +0,07 (+0,6) | −2 pe | – | +0,04 / +0,09 ✔ |
| Högpress | 71 | 1,99–1,31 | −0,06 | +0,01 (+0,1) | +10 pe | – | −0,06 / +0,08  |
| Svag på fasta | 75 | 1,87–1,39 | −0,18 | −0,10 (−0,7) | +1 pe | – | −0,06 / −0,15 ✔ |
| Medel på fasta | 119 | 1,95–1,20 | −0,05 | +0,03 (+0,2) | −2 pe | – | +0,00 / +0,05 ✔ |
| Farlig på fasta | 70 | 1,81–1,33 | −0,01 | +0,06 (+0,4) | +7 pe | – | −0,10 / +0,19  |
| Stark mot fasta | 87 | 2,08–1,26 | −0,01 | +0,07 (+0,5) | +0 pe | – | +0,04 / +0,11 ✔ |
| Medel mot fasta | 120 | 1,74–1,24 | −0,13 | −0,05 (−0,4) | +3 pe | – | −0,15 / +0,06  |
| Svag mot fasta | 57 | 1,91–1,42 | −0,08 | −0,00 (−0,0) | −0 pe | – | +0,09 / −0,07  |

- Svårast mot **Lågpress** (−0,13 p/match rel. eget snitt, z −0,9, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,11 p/match rel. eget snitt, z +0,8, 84 m) – åt samma håll i båda halvorna men svagt

### Los Angeles Galaxy

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 48,8 %). 317 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026 (28 m): 0,25 mål för (xG 0,26), 0,21 emot (xG 0,28), 5,32 hörnor · 2025 (34 m): 0,21 mål för (xG 0,20), 0,27 emot (xG 0,28), 5,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 116 | 1,87–1,93 | −0,01 | +0,05 (+0,4) | −1 pe | – | −0,14 / +0,20  |
| Balanserat | 110 | 1,47–1,79 | −0,14 | −0,07 (−0,6) | +1 pe | – | +0,02 / −0,20  |
| Bollinnehav | 91 | 1,46–1,54 | −0,03 | +0,03 (+0,2) | −3 pe | – | +0,03 / +0,02 ✔ |
| Kortpass | 56 | 1,63–1,68 | +0,10 | +0,16 (+1,0) | +5 pe | – | +0,59 / +0,05 ✔ |
| Blandat | 142 | 1,67–1,68 | −0,05 | +0,01 (+0,1) | +1 pe | – | +0,05 / −0,01  |
| Direktspel | 119 | 1,55–1,92 | −0,15 | −0,09 (−0,8) | −5 pe | – | −0,14 / +0,14  |
| Lågpress | 116 | 1,47–1,68 | −0,14 | −0,08 (−0,7) | −1 pe | – | −0,11 / −0,01 ✔ |
| Mellanpress | 117 | 1,55–1,84 | −0,05 | +0,01 (+0,1) | +2 pe | – | −0,13 / +0,10  |
| Högpress | 84 | 1,90–1,80 | +0,04 | +0,10 (+0,7) | −4 pe | – | +0,40 / −0,05  |
| Svag på fasta | 87 | 1,57–1,71 | −0,09 | −0,03 (−0,2) | −3 pe | – | +0,18 / −0,36  |
| Medel på fasta | 132 | 1,55–1,71 | −0,05 | +0,01 (+0,1) | −0 pe | – | −0,11 / +0,09  |
| Farlig på fasta | 98 | 1,74–1,90 | −0,05 | +0,02 (+0,1) | +2 pe | – | −0,14 / +0,20  |
| Stark mot fasta | 95 | 1,80–1,63 | +0,03 | +0,10 (+0,7) | −7 pe | – | +0,13 / +0,06 ✔ |
| Medel mot fasta | 145 | 1,59–1,83 | −0,06 | +0,01 (+0,1) | +3 pe | – | −0,07 / +0,07  |
| Svag mot fasta | 77 | 1,43–1,83 | −0,19 | −0,13 (−0,9) | +1 pe | – | −0,15 / −0,11 ✔ |

- Svårast mot **Svag mot fasta** (−0,13 p/match rel. eget snitt, z −0,9, 77 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,16 p/match rel. eget snitt, z +1,0, 56 m) – åt samma håll i båda halvorna men svagt

### Minnesota United

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 46,0 %). 290 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,41 mål för (xG 0,47), 0,22 emot (xG 0,25), 5,44 hörnor · 2025 (38 m): 0,66 mål för (xG 0,46), 0,34 emot (xG 0,22), 4,45 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,48–1,54 | +0,00 | −0,04 (−0,3) | +2 pe | – | −0,15 / +0,10  |
| Balanserat | 108 | 1,48–1,35 | +0,15 | +0,12 (+0,9) | −2 pe | – | +0,35 / −0,13  |
| Bollinnehav | 86 | 1,49–1,69 | −0,07 | −0,11 (−0,8) | +6 pe | – | −0,09 / −0,12 ✔ |
| Kortpass | 57 | 1,54–1,72 | −0,09 | −0,13 (−0,7) | +7 pe | – | +0,03 / −0,15  |
| Blandat | 130 | 1,47–1,45 | −0,01 | −0,05 (−0,5) | −0 pe | – | −0,15 / +0,01  |
| Direktspel | 103 | 1,47–1,48 | +0,17 | +0,14 (+1,2) | −0 pe | – | +0,18 / −0,12  |
| Lågpress | 82 | 1,62–1,65 | +0,01 | −0,03 (−0,2) | +0 pe | – | −0,05 / −0,00 ✔ |
| Mellanpress | 137 | 1,34–1,53 | −0,05 | −0,08 (−0,8) | +5 pe | – | +0,04 / −0,21  |
| Högpress | 71 | 1,61–1,32 | +0,23 | +0,19 (+1,3) | −3 pe | – | +0,29 / +0,14 ✔ |
| Svag på fasta | 93 | 1,44–1,53 | +0,02 | −0,01 (−0,1) | +3 pe | – | −0,12 / +0,11  |
| Medel på fasta | 122 | 1,47–1,37 | +0,01 | −0,03 (−0,3) | +1 pe | – | +0,22 / −0,21  |
| Farlig på fasta | 75 | 1,56–1,73 | +0,10 | +0,06 (+0,4) | −0 pe | – | +0,07 / +0,06 ✔ |
| Stark mot fasta | 88 | 1,32–1,59 | −0,12 | −0,16 (−1,2) | +2 pe | – | +0,04 / −0,38  |
| Medel mot fasta | 132 | 1,66–1,53 | +0,20 | +0,17 (+1,6) | −0 pe | – | +0,15 / +0,18 ✔ |
| Svag mot fasta | 70 | 1,36–1,39 | −0,07 | −0,11 (−0,8) | +4 pe | – | −0,06 / −0,17 ✔ |

- Svårast mot **Stark mot fasta** (−0,16 p/match rel. eget snitt, z −1,2, 88 m) – inte stabilt, troligen slump
- Bäst mot **Medel mot fasta** (+0,17 p/match rel. eget snitt, z +1,6, 132 m) – åt samma håll i båda halvorna men svagt

### Nashville SC

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,9 %). 201 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026 (27 m): 0,37 mål för (xG 0,27), 0,18 emot (xG 0,19), 5,33 hörnor · 2025 (37 m): 0,30 mål för (xG 0,42), 0,32 emot (xG 0,14), 5,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 1,33–1,16 | +0,01 | −0,05 (−0,3) | +6 pe | – | −0,20 / +0,06  |
| Balanserat | 70 | 1,57–1,06 | +0,02 | −0,04 (−0,3) | −1 pe | – | +0,04 / −0,11  |
| Bollinnehav | 76 | 1,53–1,25 | +0,12 | +0,07 (+0,5) | +7 pe | – | −0,03 / +0,18  |
| Kortpass | 67 | 1,72–1,28 | +0,14 | +0,09 (+0,6) | −4 pe | – | −0,27 / +0,20  |
| Blandat | 100 | 1,41–1,15 | −0,01 | −0,06 (−0,5) | +6 pe | – | −0,03 / −0,10 ✔ |
| Direktspel | 34 | 1,26–0,94 | +0,06 | +0,00 (+0,0) | +13 pe | – | +0,07 / −0,20  |
| Lågpress | 28 | 1,75–1,36 | +0,20 | +0,15 (+0,7) | −4 pe | – | +0,12 / +0,15  |
| Mellanpress | 96 | 1,52–1,11 | +0,08 | +0,02 (+0,2) | +5 pe | – | −0,03 / +0,08  |
| Högpress | 77 | 1,35–1,14 | −0,03 | −0,08 (−0,6) | +5 pe | – | −0,07 / −0,10 ✔ |
| Svag på fasta | 66 | 1,73–1,24 | +0,22 | +0,16 (+1,1) | −3 pe | – | −0,21 / +0,40  |
| Medel på fasta | 102 | 1,38–1,20 | −0,09 | −0,15 (−1,3) | +4 pe | – | +0,03 / −0,34  |
| Farlig på fasta | 33 | 1,33–0,88 | +0,18 | +0,13 (+0,7) | +18 pe | – | −0,02 / +0,40  |
| Stark mot fasta | 71 | 1,72–1,13 | +0,16 | +0,11 (+0,8) | −1 pe | – | −0,00 / +0,23  |
| Medel mot fasta | 91 | 1,25–1,19 | −0,04 | −0,09 (−0,7) | +0 pe | – | −0,06 / −0,12 ✔ |
| Svag mot fasta | 39 | 1,62–1,15 | +0,07 | +0,02 (+0,1) | +22 pe | – | −0,08 / +0,41  |

- Svårast mot **Medel på fasta** (−0,15 p/match rel. eget snitt, z −1,3, 102 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,16 p/match rel. eget snitt, z +1,1, 66 m) – inte stabilt, troligen slump

### New England Revolution

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 50,6 %). 321 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026 (27 m): 0,37 mål för (xG 0,23), 0,22 emot (xG 0,22), 4,74 hörnor · 2025 (34 m): 0,21 mål för (xG 0,26), 0,15 emot (xG 0,19), 5,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,42–1,43 | +0,10 | +0,08 (+0,6) | −5 pe | – | +0,12 / +0,06 ✔ |
| Balanserat | 128 | 1,61–1,55 | −0,01 | −0,02 (−0,2) | +5 pe | – | +0,05 / −0,11  |
| Bollinnehav | 107 | 1,34–1,57 | −0,03 | −0,04 (−0,4) | −1 pe | – | +0,03 / −0,11  |
| Kortpass | 61 | 1,44–1,77 | −0,11 | −0,12 (−0,8) | −3 pe | – | +0,62 / −0,20  |
| Blandat | 143 | 1,51–1,43 | +0,07 | +0,05 (+0,5) | +3 pe | – | +0,00 / +0,10 ✔ |
| Direktspel | 117 | 1,43–1,50 | +0,01 | −0,00 (−0,0) | −1 pe | – | +0,06 / −0,22  |
| Lågpress | 101 | 1,39–1,49 | −0,04 | −0,05 (−0,4) | −2 pe | – | −0,08 / +0,01  |
| Mellanpress | 124 | 1,50–1,55 | +0,05 | +0,03 (+0,3) | +0 pe | – | +0,11 / −0,04  |
| Högpress | 96 | 1,51–1,53 | +0,03 | +0,01 (+0,1) | +3 pe | – | +0,26 / −0,12  |
| Svag på fasta | 106 | 1,36–1,39 | −0,03 | −0,04 (−0,4) | +1 pe | – | −0,02 / −0,07 ✔ |
| Medel på fasta | 132 | 1,55–1,58 | +0,05 | +0,03 (+0,3) | −3 pe | – | +0,03 / +0,03 ✔ |
| Farlig på fasta | 83 | 1,47–1,60 | +0,02 | +0,01 (+0,0) | +4 pe | – | +0,20 / −0,24  |
| Stark mot fasta | 117 | 1,44–1,56 | −0,09 | −0,10 (−0,9) | +3 pe | – | +0,06 / −0,24  |
| Medel mot fasta | 118 | 1,37–1,55 | +0,04 | +0,03 (+0,3) | −4 pe | – | −0,04 / +0,07  |
| Svag mot fasta | 86 | 1,63–1,43 | +0,11 | +0,10 (+0,8) | +3 pe | – | +0,14 / +0,01 ✔ |

- Svårast mot **Stark mot fasta** (−0,10 p/match rel. eget snitt, z −0,9, 117 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,10 p/match rel. eget snitt, z +0,8, 86 m) – åt samma håll i båda halvorna men svagt

### New York City

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 54,0 %). 337 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026 (27 m): 0,22 mål för (xG 0,20), 0,44 emot (xG 0,33), 3,81 hörnor · 2025 (39 m): 0,26 mål för (xG 0,22), 0,20 emot (xG 0,23), 4,92 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 104 | 1,42–1,34 | −0,21 | −0,22 (−1,7) | −4 pe | – | −0,21 / −0,22 ✔ |
| Balanserat | 138 | 1,72–1,10 | +0,22 | +0,21 (+2,1) | +0 pe | – | +0,15 / +0,30 ✔ ⚑ |
| Bollinnehav | 95 | 1,42–1,33 | −0,05 | −0,06 (−0,5) | +5 pe | – | −0,06 / −0,06 ✔ |
| Kortpass | 65 | 1,55–1,48 | −0,06 | −0,07 (−0,4) | +3 pe | – | −0,37 / −0,01 ✔ |
| Blandat | 141 | 1,46–1,13 | +0,00 | −0,01 (−0,1) | +5 pe | – | −0,11 / +0,06  |
| Direktspel | 131 | 1,63–1,23 | +0,05 | +0,04 (+0,4) | −6 pe | – | +0,11 / −0,18  |
| Lågpress | 95 | 1,65–1,33 | +0,09 | +0,08 (+0,6) | −1 pe | – | +0,14 / −0,05  |
| Mellanpress | 138 | 1,52–1,20 | −0,00 | −0,01 (−0,1) | +5 pe | – | −0,02 / −0,00 ✔ |
| Högpress | 104 | 1,47–1,21 | −0,05 | −0,06 (−0,4) | −5 pe | – | −0,16 / +0,01  |
| Svag på fasta | 106 | 1,62–1,14 | +0,14 | +0,13 (+1,1) | −2 pe | – | +0,03 / +0,23 ✔ |
| Medel på fasta | 146 | 1,54–1,23 | −0,02 | −0,03 (−0,3) | +3 pe | – | −0,08 / +0,01  |
| Farlig på fasta | 85 | 1,45–1,38 | −0,10 | −0,11 (−0,8) | −2 pe | – | +0,07 / −0,39  |
| Stark mot fasta | 132 | 1,65–1,14 | +0,13 | +0,12 (+1,1) | −2 pe | – | +0,06 / +0,17 ✔ |
| Medel mot fasta | 115 | 1,40–1,37 | −0,07 | −0,08 (−0,7) | +2 pe | – | −0,21 / −0,01 ✔ |
| Svag mot fasta | 90 | 1,57–1,21 | −0,06 | −0,07 (−0,5) | +2 pe | – | +0,10 / −0,45  |

- Svårast mot **Backar hem** (−0,22 p/match rel. eget snitt, z −1,7, 104 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,21 p/match rel. eget snitt, z +2,1, 138 m) – ⚑ håller i båda halvorna

### New York Red Bulls

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 51,9 %). 331 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,26 mål för (xG 0,33), 0,48 emot (xG 0,42), 5,67 hörnor · 2025 (34 m): 0,23 mål för (xG 0,25), 0,23 emot (xG 0,25), 4,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,43–1,39 | −0,01 | +0,03 (+0,2) | +3 pe | – | +0,40 / −0,23  |
| Balanserat | 137 | 1,40–1,36 | −0,16 | −0,12 (−1,1) | −3 pe | – | −0,14 / −0,08 ✔ |
| Bollinnehav | 111 | 1,44–1,25 | +0,08 | +0,12 (+1,0) | −1 pe | – | +0,22 / +0,05 ✔ |
| Kortpass | 63 | 1,49–1,44 | +0,05 | +0,10 (+0,6) | −7 pe | – | +1,16 / +0,06  |
| Blandat | 137 | 1,28–1,32 | −0,21 | −0,17 (−1,6) | +5 pe | – | −0,18 / −0,16 ✔ |
| Direktspel | 131 | 1,53–1,28 | +0,09 | +0,13 (+1,2) | −4 pe | – | +0,18 / −0,10  |
| Lågpress | 99 | 1,53–1,35 | −0,03 | +0,02 (+0,1) | −4 pe | – | +0,07 / −0,12  |
| Mellanpress | 136 | 1,40–1,33 | +0,02 | +0,06 (+0,6) | −3 pe | – | +0,26 / −0,10  |
| Högpress | 96 | 1,35–1,30 | −0,15 | −0,11 (−0,8) | +5 pe | – | −0,27 / −0,02 ✔ |
| Svag på fasta | 118 | 1,56–1,41 | +0,03 | +0,08 (+0,6) | −8 pe | – | +0,16 / −0,02  |
| Medel på fasta | 135 | 1,39–1,28 | −0,04 | +0,00 (+0,0) | +3 pe | – | −0,01 / +0,01  |
| Farlig på fasta | 78 | 1,28–1,29 | −0,16 | −0,12 (−0,8) | +1 pe | – | +0,06 / −0,36  |
| Stark mot fasta | 113 | 1,44–1,30 | +0,03 | +0,07 (+0,6) | +2 pe | – | +0,26 / −0,10  |
| Medel mot fasta | 125 | 1,34–1,39 | −0,06 | −0,02 (−0,2) | −5 pe | – | +0,01 / −0,04  |
| Svag mot fasta | 93 | 1,52–1,28 | −0,10 | −0,06 (−0,5) | +1 pe | – | −0,05 / −0,08 ✔ |

- Svårast mot **Blandat** (−0,17 p/match rel. eget snitt, z −1,6, 137 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +1,2, 131 m) – inte stabilt, troligen slump

### Orlando City

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 49,5 %). 322 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026 (27 m): 0,26 mål för (xG 0,18), 0,33 emot (xG 0,32), 4,15 hörnor · 2025 (35 m): 0,34 mål för (xG 0,26), 0,23 emot (xG 0,15), 4,51 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 98 | 1,46–1,61 | −0,02 | −0,05 (−0,4) | +4 pe | – | −0,29 / +0,14  |
| Balanserat | 112 | 1,60–1,71 | +0,09 | +0,06 (+0,5) | −9 pe | – | +0,02 / +0,11 ✔ |
| Bollinnehav | 112 | 1,33–1,38 | +0,01 | −0,02 (−0,1) | +7 pe | – | +0,04 / −0,06  |
| Kortpass | 68 | 1,49–1,72 | −0,05 | −0,07 (−0,5) | −4 pe | – | −0,25 / −0,05 ✔ |
| Blandat | 127 | 1,60–1,40 | +0,17 | +0,15 (+1,4) | +5 pe | – | +0,24 / +0,08 ✔ |
| Direktspel | 127 | 1,31–1,65 | −0,08 | −0,11 (−1,0) | −2 pe | – | −0,20 / +0,22  |
| Lågpress | 93 | 1,46–1,59 | +0,19 | +0,16 (+1,2) | −5 pe | – | +0,05 / +0,45 ✔ |
| Mellanpress | 129 | 1,49–1,60 | +0,03 | −0,00 (−0,0) | +6 pe | – | −0,05 / +0,04  |
| Högpress | 100 | 1,43–1,51 | −0,12 | −0,15 (−1,1) | −2 pe | – | −0,26 / −0,09 ✔ |
| Svag på fasta | 116 | 1,49–1,64 | +0,08 | +0,06 (+0,5) | +1 pe | – | +0,08 / +0,03 ✔ |
| Medel på fasta | 127 | 1,42–1,47 | −0,06 | −0,09 (−0,8) | +3 pe | – | −0,17 / −0,04 ✔ |
| Farlig på fasta | 79 | 1,49–1,62 | +0,09 | +0,06 (+0,4) | −6 pe | – | −0,12 / +0,29  |
| Stark mot fasta | 110 | 1,68–1,61 | +0,11 | +0,09 (+0,7) | −0 pe | – | +0,09 / +0,09 ✔ |
| Medel mot fasta | 127 | 1,34–1,57 | −0,12 | −0,14 (−1,3) | +1 pe | – | −0,29 / −0,06 ✔ |
| Svag mot fasta | 85 | 1,36–1,51 | +0,13 | +0,10 (+0,8) | +0 pe | – | −0,00 / +0,32  |

- Svårast mot **Medel mot fasta** (−0,14 p/match rel. eget snitt, z −1,3, 127 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,15 p/match rel. eget snitt, z +1,4, 127 m) – åt samma håll i båda halvorna men svagt

### Philadelphia Union

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 47,0 %). 331 matcher med stil, mot marknaden totalt +0,12 per match.

Fasta situationer per match: 2026 (27 m): 0,37 mål för (xG 0,48), 0,22 emot (xG 0,17), 6,00 hörnor · 2025 (37 m): 0,49 mål för (xG 0,46), 0,22 emot (xG 0,20), 6,16 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 1,83–1,15 | +0,28 | +0,16 (+1,2) | −2 pe | – | +0,16 / +0,16 ✔ |
| Balanserat | 135 | 1,69–1,20 | +0,11 | −0,01 (−0,1) | +3 pe | – | +0,02 / −0,05  |
| Bollinnehav | 104 | 1,61–1,39 | −0,01 | −0,13 (−1,1) | −3 pe | – | −0,08 / −0,16 ✔ |
| Kortpass | 76 | 1,83–1,37 | +0,07 | −0,05 (−0,3) | +3 pe | – | +0,18 / −0,08  |
| Blandat | 138 | 1,61–1,24 | −0,01 | −0,13 (−1,2) | +3 pe | – | −0,04 / −0,19 ✔ |
| Direktspel | 117 | 1,73–1,18 | +0,30 | +0,18 (+1,6) | −5 pe | – | +0,06 / +0,73 ✔ |
| Lågpress | 92 | 1,53–1,42 | +0,02 | −0,10 (−0,8) | +1 pe | – | −0,06 / −0,17 ✔ |
| Mellanpress | 131 | 1,75–1,21 | +0,16 | +0,04 (+0,4) | −4 pe | – | +0,14 / −0,05  |
| Högpress | 108 | 1,79–1,14 | +0,15 | +0,04 (+0,3) | +3 pe | – | +0,01 / +0,05 ✔ |
| Svag på fasta | 113 | 1,66–1,35 | +0,10 | −0,02 (−0,2) | −2 pe | – | +0,09 / −0,14  |
| Medel på fasta | 150 | 1,76–1,15 | +0,15 | +0,03 (+0,3) | +1 pe | – | −0,00 / +0,05  |
| Farlig på fasta | 68 | 1,63–1,28 | +0,08 | −0,04 (−0,2) | +1 pe | – | −0,00 / −0,11 ✔ |
| Stark mot fasta | 108 | 1,60–1,18 | +0,03 | −0,09 (−0,8) | +8 pe | – | −0,09 / −0,09 ✔ |
| Medel mot fasta | 124 | 1,77–1,24 | +0,16 | +0,05 (+0,4) | −5 pe | – | +0,07 / +0,03 ✔ |
| Svag mot fasta | 99 | 1,72–1,33 | +0,16 | +0,04 (+0,3) | −3 pe | – | +0,10 / −0,09  |

- Svårast mot **Blandat** (−0,13 p/match rel. eget snitt, z −1,2, 138 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,6, 117 m) – åt samma håll i båda halvorna men svagt

### Portland Timbers

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 51,0 %). 328 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026 (27 m): 0,48 mål för (xG 0,34), 0,22 emot (xG 0,25), 4,93 hörnor · 2025 (38 m): 0,26 mål för (xG 0,27), 0,32 emot (xG 0,27), 4,92 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 105 | 1,54–1,52 | +0,00 | −0,11 (−0,9) | +0 pe | – | −0,06 / −0,16 ✔ |
| Balanserat | 111 | 1,58–1,62 | −0,02 | −0,13 (−1,1) | +1 pe | – | +0,05 / −0,37  |
| Bollinnehav | 112 | 1,73–1,45 | +0,34 | +0,23 (+2,0) | +4 pe | – | +0,23 / +0,22 ✔ |
| Kortpass | 62 | 1,63–1,79 | +0,03 | −0,08 (−0,5) | +5 pe | – | +0,21 / −0,13  |
| Blandat | 142 | 1,61–1,56 | +0,14 | +0,03 (+0,3) | +0 pe | – | +0,14 / −0,03  |
| Direktspel | 124 | 1,62–1,36 | +0,11 | +0,00 (+0,0) | +2 pe | – | +0,03 / −0,12  |
| Lågpress | 111 | 1,54–1,42 | +0,04 | −0,07 (−0,6) | −0 pe | – | +0,02 / −0,29  |
| Mellanpress | 142 | 1,63–1,58 | +0,14 | +0,03 (+0,3) | +0 pe | – | −0,00 / +0,05  |
| Högpress | 75 | 1,71–1,59 | +0,16 | +0,05 (+0,4) | +8 pe | – | +0,43 / −0,12  |
| Svag på fasta | 101 | 1,39–1,42 | +0,14 | +0,03 (+0,2) | +6 pe | – | +0,08 / −0,04  |
| Medel på fasta | 136 | 1,74–1,49 | +0,09 | −0,02 (−0,1) | +4 pe | – | +0,11 / −0,10  |
| Farlig på fasta | 91 | 1,69–1,71 | +0,10 | −0,01 (−0,1) | −6 pe | – | +0,02 / −0,05  |
| Stark mot fasta | 103 | 1,55–1,50 | +0,04 | −0,07 (−0,6) | −1 pe | – | +0,08 / −0,27  |
| Medel mot fasta | 146 | 1,69–1,58 | +0,10 | −0,01 (−0,1) | +5 pe | – | +0,02 / −0,03  |
| Svag mot fasta | 79 | 1,57–1,47 | +0,22 | +0,11 (+0,8) | +0 pe | – | +0,13 / +0,09 ✔ |

- Svårast mot **Balanserat** (−0,13 p/match rel. eget snitt, z −1,1, 111 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,23 p/match rel. eget snitt, z +2,0, 112 m) – åt samma håll i båda halvorna men svagt

### Real Salt Lake

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 48,7 %). 324 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026 (27 m): 0,11 mål för (xG 0,29), 0,48 emot (xG 0,33), 4,82 hörnor · 2025 (35 m): 0,14 mål för (xG 0,25), 0,37 emot (xG 0,31), 4,69 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 121 | 1,49–1,59 | +0,12 | +0,07 (+0,6) | −1 pe | – | +0,17 / −0,05  |
| Balanserat | 114 | 1,41–1,40 | −0,01 | −0,06 (−0,6) | −1 pe | – | −0,02 / −0,12 ✔ |
| Bollinnehav | 89 | 1,37–1,44 | +0,04 | −0,01 (−0,1) | +0 pe | – | +0,12 / −0,10  |
| Kortpass | 61 | 1,25–1,52 | −0,24 | −0,29 (−1,9) | −4 pe | – | −0,39 / −0,28 ✔ |
| Blandat | 142 | 1,40–1,39 | +0,02 | −0,03 (−0,3) | +5 pe | – | +0,04 / −0,07  |
| Direktspel | 121 | 1,55–1,57 | +0,23 | +0,18 (+1,6) | −5 pe | – | +0,14 / +0,48 ✔ |
| Lågpress | 121 | 1,51–1,55 | −0,00 | −0,05 (−0,5) | −7 pe | – | −0,03 / −0,11 ✔ |
| Mellanpress | 128 | 1,34–1,55 | +0,05 | −0,00 (−0,0) | +1 pe | – | +0,11 / −0,09  |
| Högpress | 75 | 1,44–1,27 | +0,14 | +0,09 (+0,7) | +8 pe | – | +0,41 / −0,05  |
| Svag på fasta | 105 | 1,45–1,45 | −0,06 | −0,11 (−0,9) | +3 pe | – | +0,10 / −0,35  |
| Medel på fasta | 123 | 1,45–1,44 | +0,09 | +0,04 (+0,3) | −1 pe | – | −0,07 / +0,11  |
| Farlig på fasta | 96 | 1,39–1,57 | +0,12 | +0,07 (+0,5) | −4 pe | – | +0,21 / −0,11  |
| Stark mot fasta | 103 | 1,51–1,25 | +0,22 | +0,17 (+1,3) | −3 pe | – | +0,24 / +0,07 ✔ |
| Medel mot fasta | 129 | 1,43–1,57 | −0,01 | −0,06 (−0,6) | +2 pe | – | +0,11 / −0,19  |
| Svag mot fasta | 92 | 1,33–1,61 | −0,05 | −0,10 (−0,8) | −2 pe | – | −0,14 / −0,06 ✔ |

- Svårast mot **Kortpass** (−0,29 p/match rel. eget snitt, z −1,9, 61 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,6, 121 m) – åt samma håll i båda halvorna men svagt

### San Diego FC

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 59,7 %). 27 matcher med stil, mot marknaden totalt −0,23 per match.

Fasta situationer per match: 2026 (27 m): 0,22 mål för (xG 0,26), 0,33 emot (xG 0,35), 4,70 hörnor · 2025 (39 m): 0,26 mål för (xG 0,25), 0,23 emot (xG 0,20), 5,36 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 11 | 1,82–1,73 | −0,25 | −0,03 (−0,1) | +12 pe | – | −0,06 / −0,01  |
| Balanserat | 9 | 1,11–1,56 | −0,37 | −0,15 (−0,3) | −12 pe | – | −0,19 / −0,05  |
| Bollinnehav | 7 | 2,43–2,00 | +0,00 | +0,23 (+0,7) | +22 pe | – | +0,12 / +0,37  |
| Kortpass | 21 | 1,90–1,57 | −0,12 | +0,10 (+0,4) | +6 pe | – | +0,04 / +0,14 ✔ |
| Blandat | 6 | 1,17–2,33 | −0,58 | −0,36 (−0,9) | +10 pe | – | −0,32 / −0,43  |
| Lågpress | 12 | 1,67–1,33 | −0,21 | +0,01 (+0,0) | +2 pe | – | −0,29 / +0,31  |
| Mellanpress | 10 | 1,90–2,00 | −0,12 | +0,11 (+0,4) | +27 pe | – | −0,17 / +0,29  |
| Högpress | 5 | 1,60–2,20 | −0,47 | −0,25 (−0,4) | −23 pe | – | +0,51 / −1,38  |
| Svag på fasta | 11 | 2,00–1,64 | +0,24 | +0,47 (+1,4) | +23 pe | – | −0,32 / +0,92  |
| Medel på fasta | 8 | 2,13–1,25 | −0,16 | +0,07 (+0,2) | +2 pe | – | +0,52 / −0,68  |
| Farlig på fasta | 8 | 1,00–2,38 | −0,94 | −0,71 (−2,3) | −11 pe | – | −0,55 / −0,88  |
| Stark mot fasta | 5 | 2,20–1,80 | −0,05 | +0,18 (+0,4) | −4 pe | – | +1,35 / −0,12  |
| Medel mot fasta | 13 | 1,54–2,00 | −0,60 | −0,37 (−1,2) | −0 pe | – | −0,62 / −0,21 ✔ |
| Svag mot fasta | 9 | 1,78–1,33 | +0,21 | +0,44 (+1,3) | +23 pe | – | +0,13 / +1,53  |

- Bäst mot **Kortpass** (+0,10 p/match rel. eget snitt, z +0,4, 21 m) – åt samma håll i båda halvorna men svagt

### San Jose Earthquakes

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 49,2 %). 314 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026 (27 m): 0,41 mål för (xG 0,40), 0,18 emot (xG 0,25), 6,44 hörnor · 2025 (34 m): 0,44 mål för (xG 0,50), 0,29 emot (xG 0,29), 5,88 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 118 | 1,36–1,91 | −0,13 | −0,02 (−0,2) | +1 pe | – | −0,01 / −0,04 ✔ |
| Balanserat | 112 | 1,43–1,71 | −0,13 | −0,02 (−0,2) | +2 pe | – | −0,19 / +0,18  |
| Bollinnehav | 84 | 1,54–1,89 | −0,04 | +0,06 (+0,5) | +2 pe | – | +0,14 / −0,00  |
| Kortpass | 61 | 1,75–1,77 | +0,15 | +0,26 (+1,5) | +3 pe | – | +1,07 / +0,12 ✔ |
| Blandat | 136 | 1,44–1,99 | −0,17 | −0,06 (−0,6) | +1 pe | – | −0,10 / −0,04 ✔ |
| Direktspel | 117 | 1,26–1,68 | −0,17 | −0,06 (−0,6) | +2 pe | – | −0,11 / +0,21  |
| Lågpress | 116 | 1,39–1,72 | −0,13 | −0,02 (−0,2) | +3 pe | – | −0,10 / +0,12  |
| Mellanpress | 125 | 1,49–1,86 | −0,02 | +0,09 (+0,8) | +5 pe | – | +0,02 / +0,15 ✔ |
| Högpress | 73 | 1,41–1,96 | −0,21 | −0,11 (−0,7) | −6 pe | – | +0,01 / −0,16  |
| Svag på fasta | 95 | 1,44–1,96 | −0,22 | −0,12 (−0,9) | −4 pe | – | −0,12 / −0,12 ✔ |
| Medel på fasta | 121 | 1,51–1,64 | −0,03 | +0,08 (+0,7) | +5 pe | – | +0,08 / +0,08 ✔ |
| Farlig på fasta | 98 | 1,33–1,95 | −0,09 | +0,02 (+0,2) | +3 pe | – | −0,09 / +0,16  |
| Stark mot fasta | 101 | 1,57–1,76 | −0,00 | +0,10 (+0,9) | +1 pe | – | +0,05 / +0,18 ✔ |
| Medel mot fasta | 140 | 1,34–1,89 | −0,22 | −0,11 (−1,1) | +1 pe | – | −0,18 / −0,05 ✔ |
| Svag mot fasta | 73 | 1,41–1,81 | −0,04 | +0,07 (+0,5) | +3 pe | – | +0,04 / +0,10 ✔ |

- Svårast mot **Medel mot fasta** (−0,11 p/match rel. eget snitt, z −1,1, 140 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,26 p/match rel. eget snitt, z +1,5, 61 m) – åt samma håll i båda halvorna men svagt

### Seattle Sounders

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,0 %). 336 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,36), 0,22 emot (xG 0,23), 5,30 hörnor · 2025 (37 m): 0,30 mål för (xG 0,29), 0,43 emot (xG 0,24), 5,27 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 123 | 1,54–1,21 | +0,06 | +0,02 (+0,2) | +0 pe | – | +0,19 / −0,14  |
| Balanserat | 120 | 1,49–1,11 | +0,09 | +0,05 (+0,4) | +2 pe | – | +0,10 / +0,00 ✔ |
| Bollinnehav | 93 | 1,51–1,28 | −0,05 | −0,09 (−0,7) | −0 pe | – | +0,07 / −0,25  |
| Kortpass | 64 | 1,52–1,34 | +0,00 | −0,04 (−0,2) | +5 pe | – | +0,37 / −0,12  |
| Blandat | 141 | 1,48–1,13 | +0,04 | +0,00 (+0,0) | +1 pe | – | +0,26 / −0,12  |
| Direktspel | 131 | 1,55–1,18 | +0,05 | +0,01 (+0,1) | −1 pe | – | +0,04 / −0,15  |
| Lågpress | 128 | 1,50–1,09 | +0,09 | +0,05 (+0,4) | −2 pe | – | +0,09 / −0,04  |
| Mellanpress | 125 | 1,46–1,26 | +0,00 | −0,04 (−0,3) | +7 pe | – | +0,27 / −0,28  |
| Högpress | 83 | 1,60–1,24 | +0,02 | −0,02 (−0,2) | −5 pe | – | −0,08 / +0,00  |
| Svag på fasta | 114 | 1,59–1,13 | +0,15 | +0,11 (+1,0) | +3 pe | – | +0,09 / +0,14 ✔ |
| Medel på fasta | 119 | 1,42–1,23 | −0,12 | −0,16 (−1,4) | +2 pe | – | +0,05 / −0,31  |
| Farlig på fasta | 103 | 1,53–1,22 | +0,10 | +0,06 (+0,5) | −2 pe | – | +0,23 / −0,13  |
| Stark mot fasta | 94 | 1,80–1,34 | +0,14 | +0,10 (+0,8) | −2 pe | – | +0,35 / −0,21  |
| Medel mot fasta | 154 | 1,40–1,11 | +0,00 | −0,04 (−0,4) | +1 pe | – | −0,05 / −0,03 ✔ |
| Svag mot fasta | 88 | 1,40–1,18 | −0,00 | −0,04 (−0,3) | +3 pe | – | +0,13 / −0,24  |

- Svårast mot **Medel på fasta** (−0,16 p/match rel. eget snitt, z −1,4, 119 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,11 p/match rel. eget snitt, z +1,0, 114 m) – åt samma håll i båda halvorna men svagt

### Sporting Kansas City

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 44,5 %). 317 matcher med stil, mot marknaden totalt −0,12 per match.

Fasta situationer per match: 2026 (27 m): 0,04 mål för (xG 0,13), 0,44 emot (xG 0,40), 3,89 hörnor · 2025 (34 m): 0,18 mål för (xG 0,25), 0,47 emot (xG 0,38), 4,76 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 119 | 1,47–1,53 | −0,06 | +0,06 (+0,5) | −1 pe | – | +0,06 / +0,07 ✔ |
| Balanserat | 111 | 1,52–1,59 | −0,07 | +0,05 (+0,5) | −7 pe | – | +0,26 / −0,19  |
| Bollinnehav | 87 | 1,39–1,67 | −0,28 | −0,15 (−1,2) | +4 pe | – | −0,35 / +0,01  |
| Kortpass | 62 | 1,52–2,06 | +0,09 | +0,21 (+1,4) | −7 pe | – | +0,60 / +0,15 ✔ |
| Blandat | 137 | 1,39–1,59 | −0,28 | −0,15 (−1,5) | −4 pe | – | −0,20 / −0,12 ✔ |
| Direktspel | 118 | 1,53–1,33 | −0,06 | +0,07 (+0,6) | +4 pe | – | +0,12 / −0,15  |
| Lågpress | 118 | 1,56–1,42 | −0,07 | +0,05 (+0,4) | +1 pe | – | −0,03 / +0,25  |
| Mellanpress | 134 | 1,40–1,73 | −0,16 | −0,04 (−0,4) | −5 pe | – | +0,08 / −0,13  |
| Högpress | 65 | 1,45–1,60 | −0,14 | −0,02 (−0,1) | −0 pe | – | +0,19 / −0,09  |
| Svag på fasta | 98 | 1,58–1,63 | −0,03 | +0,09 (+0,7) | −5 pe | – | +0,14 / +0,04 ✔ |
| Medel på fasta | 123 | 1,34–1,62 | −0,26 | −0,14 (−1,3) | −1 pe | – | −0,20 / −0,09 ✔ |
| Farlig på fasta | 96 | 1,51–1,50 | −0,04 | +0,08 (+0,7) | +1 pe | – | +0,18 / −0,01  |
| Stark mot fasta | 95 | 1,68–1,51 | +0,11 | +0,24 (+1,9) | −4 pe | – | +0,30 / +0,17 ✔ |
| Medel mot fasta | 140 | 1,37–1,69 | −0,28 | −0,15 (−1,5) | −1 pe | – | −0,07 / −0,22 ✔ |
| Svag mot fasta | 82 | 1,38–1,50 | −0,14 | −0,02 (−0,1) | −0 pe | – | −0,10 / +0,09  |

- Svårast mot **Medel mot fasta** (−0,15 p/match rel. eget snitt, z −1,5, 140 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,24 p/match rel. eget snitt, z +1,9, 95 m) – åt samma håll i båda halvorna men svagt

### St. Louis City

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 52,3 %). 93 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,36), 0,37 emot (xG 0,26), 5,48 hörnor · 2025 (34 m): 0,32 mål för (xG 0,40), 0,32 emot (xG 0,23), 4,79 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 30 | 1,33–1,73 | −0,09 | −0,04 (−0,2) | +3 pe | – | −0,33 / +0,29  |
| Balanserat | 35 | 1,63–1,71 | −0,04 | +0,01 (+0,1) | +7 pe | – | −0,26 / +0,24  |
| Bollinnehav | 28 | 1,57–1,54 | −0,02 | +0,03 (+0,1) | +7 pe | – | +0,01 / +0,06 ✔ |
| Kortpass | 41 | 1,63–1,44 | +0,18 | +0,23 (+1,2) | −0 pe | – | +0,43 / +0,16 ✔ |
| Blandat | 47 | 1,45–1,85 | −0,19 | −0,14 (−0,9) | +8 pe | – | −0,36 / +0,26  |
| Direktspel | 5 | 1,20–1,80 | −0,68 | −0,63 (−3,0) | +37 pe | – | −0,63 / –  |
| Lågpress | 28 | 1,64–1,54 | +0,18 | +0,24 (+1,0) | −3 pe | – | −0,30 / +0,41  |
| Mellanpress | 38 | 1,37–1,76 | −0,13 | −0,08 (−0,4) | +7 pe | – | −0,22 / +0,10  |
| Högpress | 27 | 1,59–1,67 | −0,19 | −0,14 (−0,7) | +14 pe | – | −0,14 / −0,12 ✔ |
| Svag på fasta | 25 | 1,56–1,36 | +0,15 | +0,20 (+0,9) | +11 pe | – | −0,07 / +0,38  |
| Medel på fasta | 47 | 1,51–1,81 | −0,16 | −0,11 (−0,7) | +6 pe | – | −0,12 / −0,11 ✔ |
| Farlig på fasta | 21 | 1,48–1,71 | −0,04 | +0,01 (+0,0) | −0 pe | – | −0,52 / +0,59  |
| Stark mot fasta | 27 | 1,22–1,33 | −0,08 | −0,03 (−0,1) | +1 pe | – | −0,34 / +0,31  |
| Medel mot fasta | 42 | 1,62–1,86 | −0,16 | −0,11 (−0,7) | +12 pe | – | −0,15 / −0,05 ✔ |
| Svag mot fasta | 24 | 1,67–1,71 | +0,18 | +0,23 (+0,9) | +1 pe | – | −0,10 / +0,39  |

- Svårast mot **Blandat** (−0,14 p/match rel. eget snitt, z −0,9, 47 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,23 p/match rel. eget snitt, z +1,2, 41 m) – åt samma håll i båda halvorna men svagt

### Toronto FC

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 45,1 %). 321 matcher med stil, mot marknaden totalt −0,14 per match.

Fasta situationer per match: 2026 (27 m): 0,26 mål för (xG 0,34), 0,48 emot (xG 0,35), 4,89 hörnor · 2025 (34 m): 0,23 mål för (xG 0,24), 0,29 emot (xG 0,27), 4,00 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,27–1,75 | −0,30 | −0,16 (−1,4) | +3 pe | – | −0,19 / −0,14 ✔ |
| Balanserat | 128 | 1,52–1,65 | −0,05 | +0,09 (+0,8) | −1 pe | – | +0,13 / +0,02 ✔ |
| Bollinnehav | 100 | 1,27–1,49 | −0,10 | +0,04 (+0,3) | +8 pe | – | +0,19 / −0,09  |
| Kortpass | 58 | 1,26–1,81 | −0,26 | −0,13 (−0,9) | +10 pe | – | −0,93 / −0,05 ✔ |
| Blandat | 134 | 1,25–1,71 | −0,23 | −0,09 (−1,0) | +4 pe | – | +0,02 / −0,17  |
| Direktspel | 129 | 1,55–1,47 | +0,02 | +0,16 (+1,4) | −2 pe | – | +0,15 / +0,18 ✔ |
| Lågpress | 102 | 1,51–1,39 | −0,03 | +0,11 (+0,9) | +1 pe | – | +0,20 / −0,12  |
| Mellanpress | 137 | 1,36–1,66 | −0,19 | −0,06 (−0,6) | +5 pe | – | −0,05 / −0,06 ✔ |
| Högpress | 82 | 1,21–1,88 | −0,17 | −0,04 (−0,3) | +2 pe | – | −0,00 / −0,06 ✔ |
| Svag på fasta | 105 | 1,42–1,50 | −0,02 | +0,12 (+1,0) | −5 pe | – | +0,18 / +0,04 ✔ |
| Medel på fasta | 142 | 1,30–1,63 | −0,22 | −0,08 (−0,9) | +5 pe | – | +0,08 / −0,20  |
| Farlig på fasta | 74 | 1,45–1,80 | −0,15 | −0,01 (−0,1) | +11 pe | – | −0,12 / +0,12  |
| Stark mot fasta | 114 | 1,39–1,72 | −0,24 | −0,10 (−0,9) | +3 pe | – | −0,18 / −0,03 ✔ |
| Medel mot fasta | 117 | 1,16–1,70 | −0,22 | −0,09 (−0,9) | +6 pe | – | +0,04 / −0,15  |
| Svag mot fasta | 90 | 1,61–1,42 | +0,11 | +0,24 (+1,9) | −2 pe | – | +0,32 / +0,08 ✔ |

- Svårast mot **Backar hem** (−0,16 p/match rel. eget snitt, z −1,4, 93 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,24 p/match rel. eget snitt, z +1,9, 90 m) – åt samma håll i båda halvorna men svagt

### Vancouver Whitecaps

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 56,4 %). 323 matcher med stil, mot marknaden totalt +0,13 per match.

Fasta situationer per match: 2026 (26 m): 0,46 mål för (xG 0,53), 0,19 emot (xG 0,11), 5,96 hörnor · 2025 (39 m): 0,46 mål för (xG 0,45), 0,20 emot (xG 0,23), 5,82 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 103 | 1,63–1,58 | +0,12 | −0,01 (−0,1) | −1 pe | – | +0,04 / −0,05  |
| Balanserat | 121 | 1,36–1,32 | +0,11 | −0,03 (−0,2) | +3 pe | – | +0,14 / −0,25  |
| Bollinnehav | 99 | 1,53–1,60 | +0,18 | +0,05 (+0,4) | −1 pe | – | −0,04 / +0,12  |
| Kortpass | 62 | 1,74–1,40 | +0,05 | −0,09 (−0,5) | −3 pe | – | +0,31 / −0,16  |
| Blandat | 136 | 1,48–1,39 | +0,20 | +0,07 (+0,7) | +4 pe | – | +0,04 / +0,08 ✔ |
| Direktspel | 125 | 1,40–1,64 | +0,11 | −0,03 (−0,2) | −1 pe | – | +0,04 / −0,37  |
| Lågpress | 114 | 1,50–1,33 | +0,14 | +0,00 (+0,0) | +0 pe | – | +0,16 / −0,32  |
| Mellanpress | 129 | 1,57–1,71 | +0,12 | −0,02 (−0,2) | +1 pe | – | −0,04 / +0,00  |
| Högpress | 80 | 1,39–1,36 | +0,16 | +0,03 (+0,2) | +1 pe | – | −0,03 / +0,06  |
| Svag på fasta | 99 | 1,67–1,58 | +0,16 | +0,02 (+0,2) | +1 pe | – | −0,09 / +0,17  |
| Medel på fasta | 135 | 1,44–1,44 | +0,16 | +0,02 (+0,2) | +2 pe | – | +0,19 / −0,10  |
| Farlig på fasta | 89 | 1,40–1,47 | +0,07 | −0,06 (−0,5) | −2 pe | – | +0,07 / −0,22  |
| Stark mot fasta | 88 | 1,48–1,44 | +0,45 | +0,31 (+2,2) | −5 pe | – | +0,36 / +0,26 ✔ ⚑ |
| Medel mot fasta | 147 | 1,46–1,55 | −0,01 | −0,15 (−1,5) | +0 pe | – | −0,10 / −0,18 ✔ |
| Svag mot fasta | 88 | 1,59–1,43 | +0,07 | −0,07 (−0,5) | +7 pe | – | −0,03 / −0,12 ✔ |

- Svårast mot **Medel mot fasta** (−0,15 p/match rel. eget snitt, z −1,5, 147 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,31 p/match rel. eget snitt, z +2,2, 88 m) – ⚑ håller i båda halvorna
