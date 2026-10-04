# Stilmatchning – Championship (CH)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 4247 matcher med stängningsodds och stil för båda lagen.

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

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 1038 m · mot marknaden −0,01 (z −0,2) · mål 1,37 · ö2,5 +1 pe | 1352 m · mot marknaden +0,01 (z +0,2) · mål 1,30 · ö2,5 +1 pe | 594 m · mot marknaden +0,08 (z +1,6) · mål 1,31 · ö2,5 −4 pe |
| **Medel på fasta** | 1128 m · mot marknaden +0,04 (z +1,0) · mål 1,28 · ö2,5 −0 pe | 1543 m · mot marknaden +0,01 (z +0,2) · mål 1,20 · ö2,5 +0 pe | 658 m · mot marknaden −0,04 (z −0,8) · mål 1,26 · ö2,5 +2 pe |
| **Farlig på fasta** | 690 m · mot marknaden −0,01 (z −0,3) · mål 1,30 · ö2,5 −1 pe | 990 m · mot marknaden +0,02 (z +0,5) · mål 1,23 · ö2,5 +0 pe | 501 m · mot marknaden −0,10 (z −1,9) · mål 1,15 · ö2,5 −3 pe |

## Lag (säsong 2026/27)

### Birmingham

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,2 %). 364 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,46), 0,63 emot (xG 0,42), 6,00 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,36), 0,37 emot (xG 0,23), 5,76 hörnor.

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
| Svag på fasta | 122 | 1,02–1,50 | −0,24 | −0,18 (−1,7) | −6 pe | −0 pe | −0,27 / −0,07 ✔ |
| Medel på fasta | 153 | 1,35–1,21 | +0,09 | +0,16 (+1,6) | +4 pe | +2 pe | +0,17 / +0,14 ✔ |
| Farlig på fasta | 89 | 1,15–1,26 | −0,09 | −0,03 (−0,2) | +8 pe | −5 pe | −0,15 / +0,14  |
| Stark mot fasta | 118 | 1,21–1,32 | −0,07 | −0,01 (−0,1) | +5 pe | −2 pe | −0,14 / +0,09  |
| Medel mot fasta | 175 | 1,13–1,27 | −0,07 | −0,01 (−0,1) | −3 pe | −2 pe | −0,07 / +0,05  |
| Svag mot fasta | 71 | 1,30–1,42 | −0,04 | +0,03 (+0,2) | +6 pe | +6 pe | −0,01 / +0,10  |

- Svårast mot **Svag på fasta** (−0,18 p/match rel. eget snitt, z −1,7, 122 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,16 p/match rel. eget snitt, z +1,6, 153 m) – åt samma håll i båda halvorna men svagt

### Blackburn

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 51,5 %). 324 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,13), 0,25 emot (xG 0,26), 6,00 hörnor · 2025/26 (46 m): 0,22 mål för (xG 0,32), 0,33 emot (xG 0,36), 5,35 hörnor.

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
| Svag på fasta | 111 | 1,07–1,18 | −0,06 | −0,04 (−0,3) | −3 pe | −8 pe | −0,09 / +0,03  |
| Medel på fasta | 126 | 1,24–1,23 | +0,02 | +0,05 (+0,4) | −4 pe | +4 pe | +0,20 / −0,06  |
| Farlig på fasta | 87 | 1,44–1,31 | −0,05 | −0,02 (−0,2) | −0 pe | −0 pe | +0,02 / −0,07  |
| Stark mot fasta | 116 | 1,23–1,25 | −0,11 | −0,09 (−0,7) | −4 pe | +0 pe | +0,08 / −0,22  |
| Medel mot fasta | 141 | 1,22–1,22 | +0,05 | +0,08 (+0,7) | −3 pe | −3 pe | −0,02 / +0,18  |
| Svag mot fasta | 67 | 1,27–1,24 | −0,04 | −0,02 (−0,1) | −1 pe | +0 pe | +0,09 / −0,16  |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −1,0, 132 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,8, 114 m) – inte stabilt, troligen slump

### Bolton

Egen stil 2018/19 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 51,1 %). 322 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,16), 0,63 emot (xG 0,39), 5,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 111 | 1,31–1,23 | −0,12 | −0,15 (−1,3) | +7 pe | −5 pe | −0,08 / −0,19 ✔ |
| Balanserat | 130 | 1,42–1,27 | +0,09 | +0,06 (+0,6) | −7 pe | +1 pe | +0,16 / −0,06  |
| Bollinnehav | 81 | 1,43–1,27 | +0,13 | +0,10 (+0,7) | −8 pe | −6 pe | +0,04 / +0,18 ✔ |
| Kortpass | 68 | 1,62–1,24 | +0,18 | +0,16 (+1,0) | −11 pe | −1 pe | +0,08 / +0,19 ✔ |
| Blandat | 141 | 1,29–1,20 | −0,04 | −0,07 (−0,7) | +3 pe | −8 pe | +0,03 / −0,15  |
| Direktspel | 113 | 1,35–1,34 | +0,01 | −0,01 (−0,1) | −5 pe | +2 pe | +0,08 / −0,21  |
| Lågpress | 92 | 1,12–1,33 | −0,14 | −0,17 (−1,4) | +6 pe | −9 pe | −0,12 / −0,24 ✔ |
| Mellanpress | 121 | 1,36–1,24 | +0,01 | −0,02 (−0,2) | −4 pe | −4 pe | +0,13 / −0,15  |
| Högpress | 109 | 1,63–1,21 | +0,19 | +0,17 (+1,4) | −8 pe | +4 pe | +0,20 / +0,14 ✔ |
| Svag på fasta | 113 | 1,35–0,97 | +0,23 | +0,20 (+1,7) | −4 pe | −9 pe | +0,25 / +0,13 ✔ |
| Medel på fasta | 137 | 1,38–1,39 | −0,07 | −0,10 (−0,9) | −3 pe | −4 pe | −0,10 / −0,09 ✔ |
| Farlig på fasta | 72 | 1,44–1,43 | −0,10 | −0,13 (−0,9) | +2 pe | +8 pe | −0,02 / −0,21 ✔ |
| Stark mot fasta | 104 | 1,54–1,02 | +0,27 | +0,25 (+2,0) | −5 pe | −4 pe | +0,24 / +0,25 ✔ |
| Medel mot fasta | 144 | 1,41–1,28 | −0,05 | −0,08 (−0,8) | −3 pe | −2 pe | +0,04 / −0,17  |
| Svag mot fasta | 74 | 1,11–1,54 | −0,16 | −0,19 (−1,5) | +3 pe | −2 pe | −0,12 / −0,30 ✔ |

- Svårast mot **Svag mot fasta** (−0,19 p/match rel. eget snitt, z −1,5, 74 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,25 p/match rel. eget snitt, z +2,0, 104 m) – åt samma håll i båda halvorna men svagt

### Bristol City

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 44,7 %). 364 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,75 mål för (xG 0,55), 0,00 emot (xG 0,20), 5,25 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,26), 0,28 emot (xG 0,28), 4,83 hörnor.

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
| Svag på fasta | 129 | 1,33–1,34 | +0,21 | +0,16 (+1,4) | +2 pe | −2 pe | +0,13 / +0,18 ✔ |
| Medel på fasta | 138 | 1,18–1,20 | +0,05 | +0,00 (+0,0) | −2 pe | −6 pe | +0,03 / −0,02  |
| Farlig på fasta | 97 | 1,15–1,48 | −0,16 | −0,21 (−1,7) | −8 pe | +3 pe | −0,11 / −0,33 ✔ |
| Stark mot fasta | 122 | 1,30–1,23 | +0,14 | +0,09 (+0,8) | +2 pe | −2 pe | +0,29 / −0,06  |
| Medel mot fasta | 162 | 1,22–1,42 | −0,05 | −0,10 (−1,0) | −5 pe | +1 pe | −0,11 / −0,08 ✔ |
| Svag mot fasta | 80 | 1,13–1,29 | +0,11 | +0,06 (+0,4) | −4 pe | −8 pe | −0,03 / +0,21  |

- Svårast mot **Balanserat** (−0,17 p/match rel. eget snitt, z −1,7, 148 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,21 p/match rel. eget snitt, z +1,6, 100 m) – åt samma håll i båda halvorna men svagt

### Burnley

Egen stil 2024/25 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 49,8 %). 328 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,15), 0,63 emot (xG 0,49), 4,88 hörnor.

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
| Svag på fasta | 114 | 1,20–1,47 | +0,08 | −0,03 (−0,2) | −1 pe | −3 pe | −0,14 / +0,13  |
| Medel på fasta | 145 | 1,14–1,21 | +0,13 | +0,02 (+0,2) | +6 pe | −6 pe | +0,08 / −0,03  |
| Farlig på fasta | 69 | 1,41–1,49 | +0,12 | +0,01 (+0,0) | +1 pe | +8 pe | +0,14 / −0,11  |
| Stark mot fasta | 112 | 1,39–1,35 | +0,12 | +0,01 (+0,1) | −2 pe | +3 pe | −0,19 / +0,23  |
| Medel mot fasta | 155 | 1,08–1,36 | +0,05 | −0,06 (−0,7) | +7 pe | −6 pe | +0,07 / −0,15  |
| Svag mot fasta | 61 | 1,23–1,39 | +0,24 | +0,13 (+0,8) | +2 pe | −0 pe | +0,17 / +0,03 ✔ |

- Svårast mot **Lågpress** (−0,19 p/match rel. eget snitt, z −1,6, 91 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,09 p/match rel. eget snitt, z +0,9, 112 m) – åt samma håll i båda halvorna men svagt

### Cardiff

Egen stil 2024/25 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 64,8 %). 362 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,46), 0,25 emot (xG 0,25), 7,88 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 114 | 1,37–1,42 | +0,15 | +0,15 (+1,3) | −6 pe | +5 pe | +0,08 / +0,22 ✔ |
| Balanserat | 153 | 1,24–1,29 | −0,02 | −0,02 (−0,2) | +0 pe | −1 pe | +0,04 / −0,08  |
| Bollinnehav | 95 | 1,09–1,49 | −0,15 | −0,15 (−1,3) | −6 pe | −0 pe | −0,06 / −0,26 ✔ |
| Kortpass | 92 | 1,22–1,50 | −0,14 | −0,14 (−1,2) | −2 pe | −0 pe | −0,45 / −0,06 ✔ |
| Blandat | 156 | 1,24–1,34 | −0,03 | −0,03 (−0,3) | −5 pe | −2 pe | +0,08 / −0,13  |
| Direktspel | 114 | 1,26–1,36 | +0,16 | +0,16 (+1,3) | −3 pe | +6 pe | +0,07 / +0,47 ✔ |
| Lågpress | 93 | 1,22–1,53 | −0,23 | −0,22 (−1,8) | −7 pe | +5 pe | −0,17 / −0,37 ✔ |
| Mellanpress | 155 | 1,39–1,32 | +0,11 | +0,11 (+1,1) | −2 pe | +2 pe | +0,12 / +0,11 ✔ |
| Högpress | 114 | 1,07–1,36 | +0,03 | +0,03 (+0,3) | −2 pe | −3 pe | +0,15 / −0,04  |
| Svag på fasta | 126 | 1,15–1,58 | −0,09 | −0,09 (−0,8) | −11 pe | +5 pe | −0,05 / −0,14 ✔ |
| Medel på fasta | 140 | 1,26–1,30 | +0,04 | +0,04 (+0,4) | +3 pe | −3 pe | +0,10 / −0,01  |
| Farlig på fasta | 96 | 1,34–1,26 | +0,06 | +0,06 (+0,5) | −3 pe | +2 pe | +0,02 / +0,11 ✔ |
| Stark mot fasta | 120 | 1,13–1,41 | −0,04 | −0,03 (−0,3) | −6 pe | +3 pe | −0,15 / +0,07  |
| Medel mot fasta | 164 | 1,30–1,40 | +0,03 | +0,03 (+0,4) | −1 pe | +0 pe | +0,11 / −0,03  |
| Svag mot fasta | 78 | 1,29–1,32 | −0,02 | −0,02 (−0,1) | −6 pe | −0 pe | +0,08 / −0,17  |

- Svårast mot **Lågpress** (−0,22 p/match rel. eget snitt, z −1,8, 93 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,16 p/match rel. eget snitt, z +1,3, 114 m) – åt samma håll i båda halvorna men svagt

### Charlton

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 38,0 %). 284 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,30), 0,13 emot (xG 0,11), 4,38 hörnor · 2025/26 (46 m): 0,39 mål för (xG 0,39), 0,28 emot (xG 0,27), 4,13 hörnor.

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
| Svag på fasta | 111 | 1,43–1,32 | +0,05 | +0,05 (+0,4) | −2 pe | +1 pe | −0,03 / +0,21  |
| Medel på fasta | 120 | 1,28–1,18 | −0,01 | −0,02 (−0,1) | +4 pe | −3 pe | −0,17 / +0,08  |
| Farlig på fasta | 53 | 1,21–1,30 | −0,07 | −0,07 (−0,4) | +5 pe | −2 pe | +0,13 / −0,21  |
| Stark mot fasta | 100 | 1,24–1,17 | −0,02 | −0,02 (−0,2) | −0 pe | −7 pe | −0,22 / +0,18  |
| Medel mot fasta | 120 | 1,48–1,31 | +0,02 | +0,02 (+0,2) | +5 pe | +5 pe | +0,04 / +0,00 ✔ |
| Svag mot fasta | 64 | 1,17–1,30 | −0,00 | −0,00 (−0,0) | −1 pe | −3 pe | +0,04 / −0,06  |

- Svårast mot **Blandat** (−0,10 p/match rel. eget snitt, z −0,8, 109 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,13 p/match rel. eget snitt, z +1,0, 92 m) – åt samma håll i båda halvorna men svagt

### Derby

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,3 %). 364 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,31), 0,50 emot (xG 0,55), 6,38 hörnor · 2025/26 (46 m): 0,50 mål för (xG 0,39), 0,30 emot (xG 0,27), 4,54 hörnor.

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
| Svag på fasta | 139 | 1,27–1,16 | −0,01 | −0,01 (−0,1) | −1 pe | −1 pe | −0,10 / +0,07  |
| Medel på fasta | 133 | 1,24–1,20 | +0,05 | +0,04 (+0,4) | −6 pe | +5 pe | −0,02 / +0,10  |
| Farlig på fasta | 92 | 1,28–1,15 | −0,04 | −0,04 (−0,3) | +0 pe | −6 pe | +0,09 / −0,22  |
| Stark mot fasta | 124 | 1,34–1,01 | +0,11 | +0,10 (+0,9) | −2 pe | −4 pe | +0,09 / +0,12 ✔ |
| Medel mot fasta | 163 | 1,24–1,24 | −0,07 | −0,07 (−0,7) | −2 pe | +3 pe | −0,12 / −0,02 ✔ |
| Svag mot fasta | 77 | 1,19–1,29 | −0,01 | −0,02 (−0,1) | −6 pe | −1 pe | +0,04 / −0,10  |

- Svårast mot **Backar hem** (−0,17 p/match rel. eget snitt, z −1,5, 110 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,14 p/match rel. eget snitt, z +1,3, 156 m) – åt samma håll i båda halvorna men svagt

### Lincoln

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 35,7 %). 284 matcher med stil, mot marknaden totalt +0,16 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,50), 0,25 emot (xG 0,17), 4,13 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,41–1,13 | +0,05 | −0,10 (−0,8) | −5 pe | +2 pe | −0,16 / −0,06 ✔ |
| Balanserat | 108 | 1,31–0,97 | +0,19 | +0,04 (+0,3) | +8 pe | −4 pe | −0,23 / +0,33  |
| Bollinnehav | 80 | 1,49–1,15 | +0,23 | +0,07 (+0,5) | −4 pe | +0 pe | +0,10 / +0,05 ✔ |
| Kortpass | 81 | 1,43–1,06 | +0,25 | +0,09 (+0,7) | +2 pe | −3 pe | −0,27 / +0,27  |
| Blandat | 111 | 1,49–1,11 | +0,23 | +0,08 (+0,7) | −1 pe | −2 pe | +0,04 / +0,10 ✔ |
| Direktspel | 92 | 1,25–1,04 | −0,02 | −0,17 (−1,3) | +2 pe | +2 pe | −0,16 / −0,21 ✔ |
| Lågpress | 68 | 1,51–1,10 | +0,27 | +0,11 (+0,7) | +5 pe | −3 pe | −0,03 / +0,24  |
| Mellanpress | 116 | 1,42–1,16 | +0,10 | −0,06 (−0,5) | −2 pe | +4 pe | −0,08 / −0,02 ✔ |
| Högpress | 100 | 1,28–0,95 | +0,14 | −0,01 (−0,1) | +0 pe | −5 pe | −0,20 / +0,15  |
| Svag på fasta | 102 | 1,36–1,06 | +0,15 | −0,00 (−0,0) | +2 pe | −5 pe | −0,11 / +0,25  |
| Medel på fasta | 125 | 1,48–1,05 | +0,26 | +0,11 (+1,0) | +0 pe | +2 pe | −0,03 / +0,19  |
| Farlig på fasta | 57 | 1,26–1,16 | −0,07 | −0,23 (−1,4) | −1 pe | +1 pe | −0,25 / −0,21 ✔ |
| Stark mot fasta | 84 | 1,38–0,95 | +0,18 | +0,02 (+0,2) | +5 pe | −8 pe | −0,02 / +0,09  |
| Medel mot fasta | 135 | 1,30–1,09 | +0,12 | −0,04 (−0,4) | −3 pe | −0 pe | −0,14 / +0,03  |
| Svag mot fasta | 65 | 1,60–1,20 | +0,21 | +0,05 (+0,4) | +2 pe | +7 pe | −0,18 / +0,34  |

- Svårast mot **Farlig på fasta** (−0,23 p/match rel. eget snitt, z −1,4, 57 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,11 p/match rel. eget snitt, z +1,0, 125 m) – inte stabilt, troligen slump

### Middlesbrough

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 60,2 %). 364 matcher med stil, mot marknaden totalt −0,07 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,53), 0,25 emot (xG 0,31), 5,75 hörnor · 2025/26 (46 m): 0,30 mål för (xG 0,32), 0,35 emot (xG 0,20), 6,83 hörnor.

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
| Svag på fasta | 123 | 1,45–1,19 | +0,06 | +0,13 (+1,1) | −1 pe | +6 pe | +0,03 / +0,25 ✔ |
| Medel på fasta | 146 | 1,43–1,22 | −0,12 | −0,05 (−0,5) | −2 pe | +4 pe | −0,20 / +0,06  |
| Farlig på fasta | 95 | 1,25–1,13 | −0,15 | −0,08 (−0,6) | −6 pe | −9 pe | +0,09 / −0,29  |
| Stark mot fasta | 126 | 1,38–1,23 | −0,11 | −0,04 (−0,3) | −4 pe | +4 pe | +0,05 / −0,11  |
| Medel mot fasta | 158 | 1,42–1,20 | −0,03 | +0,04 (+0,4) | −4 pe | +0 pe | +0,04 / +0,04 ✔ |
| Svag mot fasta | 80 | 1,35–1,09 | −0,08 | −0,01 (−0,1) | −0 pe | −4 pe | −0,24 / +0,38  |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,13 p/match rel. eget snitt, z +1,2, 160 m) – åt samma håll i båda halvorna men svagt

### Millwall

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 44,0 %). 364 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026/27 (8 m): 0,63 mål för (xG 0,65), 0,38 emot (xG 0,19), 4,50 hörnor · 2025/26 (46 m): 0,54 mål för (xG 0,45), 0,20 emot (xG 0,27), 5,70 hörnor.

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
| Svag på fasta | 130 | 1,12–1,30 | −0,04 | −0,12 (−1,1) | −2 pe | −0 pe | −0,24 / +0,00  |
| Medel på fasta | 150 | 1,27–1,05 | +0,21 | +0,13 (+1,2) | −1 pe | −2 pe | −0,15 / +0,35  |
| Farlig på fasta | 84 | 1,04–1,12 | +0,03 | −0,05 (−0,4) | +5 pe | −9 pe | +0,20 / −0,43  |
| Stark mot fasta | 120 | 1,15–1,14 | −0,08 | −0,16 (−1,4) | +2 pe | −4 pe | −0,23 / −0,11 ✔ |
| Medel mot fasta | 168 | 1,15–1,13 | +0,18 | +0,11 (+1,1) | −1 pe | −3 pe | +0,02 / +0,20 ✔ |
| Svag mot fasta | 76 | 1,21–1,24 | +0,09 | +0,02 (+0,1) | −0 pe | −2 pe | −0,13 / +0,26  |

- Svårast mot **Stark mot fasta** (−0,16 p/match rel. eget snitt, z −1,4, 120 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,13 p/match rel. eget snitt, z +1,2, 150 m) – inte stabilt, troligen slump

### Norwich

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,0 %). 354 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,25), 0,25 emot (xG 0,34), 4,75 hörnor · 2025/26 (46 m): 0,30 mål för (xG 0,27), 0,15 emot (xG 0,34), 5,35 hörnor.

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
| Svag på fasta | 121 | 1,31–1,65 | −0,19 | −0,17 (−1,6) | −1 pe | +5 pe | −0,02 / −0,30 ✔ |
| Medel på fasta | 144 | 1,41–1,38 | −0,02 | +0,01 (+0,1) | −1 pe | +0 pe | +0,06 / −0,04  |
| Farlig på fasta | 89 | 1,47–1,22 | +0,19 | +0,22 (+1,7) | −10 pe | +0 pe | +0,16 / +0,29 ✔ |
| Stark mot fasta | 122 | 1,36–1,34 | +0,07 | +0,09 (+0,8) | −8 pe | +2 pe | +0,11 / +0,08 ✔ |
| Medel mot fasta | 162 | 1,48–1,42 | −0,01 | +0,01 (+0,1) | +1 pe | +2 pe | +0,15 / −0,13  |
| Svag mot fasta | 70 | 1,26–1,61 | −0,21 | −0,18 (−1,3) | −5 pe | +2 pe | −0,16 / −0,22 ✔ |

- Svårast mot **Svag på fasta** (−0,17 p/match rel. eget snitt, z −1,6, 121 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,22 p/match rel. eget snitt, z +1,7, 89 m) – åt samma håll i båda halvorna men svagt

### Portsmouth

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 53,6 %). 283 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,44), 0,29 emot (xG 0,23), 7,00 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,42), 0,46 emot (xG 0,31), 5,63 hörnor.

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
| Svag på fasta | 118 | 1,30–1,07 | −0,00 | −0,06 (−0,5) | +7 pe | −3 pe | −0,15 / +0,10  |
| Medel på fasta | 116 | 1,30–1,28 | +0,02 | −0,04 (−0,3) | +2 pe | +2 pe | −0,11 / +0,01  |
| Farlig på fasta | 49 | 1,71–1,29 | +0,29 | +0,23 (+1,3) | −11 pe | +17 pe | +0,27 / +0,20 ✔ |
| Stark mot fasta | 108 | 1,38–1,23 | −0,04 | −0,09 (−0,8) | +1 pe | +6 pe | −0,18 / −0,00 ✔ |
| Medel mot fasta | 116 | 1,45–1,15 | +0,22 | +0,17 (+1,4) | +1 pe | +2 pe | +0,04 / +0,27 ✔ |
| Svag mot fasta | 59 | 1,20–1,22 | −0,10 | −0,16 (−1,0) | +5 pe | −2 pe | −0,09 / −0,27 ✔ |

- Svårast mot **Lågpress** (−0,30 p/match rel. eget snitt, z −2,4, 71 m) – ⚑ håller i båda halvorna
- Bäst mot **Högpress** (+0,24 p/match rel. eget snitt, z +1,9, 92 m) – åt samma håll i båda halvorna men svagt

### Preston

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 43,6 %). 364 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,60), 0,50 emot (xG 0,25), 5,25 hörnor · 2025/26 (46 m): 0,30 mål för (xG 0,37), 0,43 emot (xG 0,40), 4,46 hörnor.

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
| Svag på fasta | 132 | 1,11–1,36 | +0,11 | +0,09 (+0,8) | +1 pe | +6 pe | +0,05 / +0,13 ✔ |
| Medel på fasta | 138 | 1,14–1,28 | −0,04 | −0,07 (−0,7) | +4 pe | −0 pe | −0,13 / −0,02 ✔ |
| Farlig på fasta | 94 | 1,17–1,37 | +0,00 | −0,02 (−0,2) | −9 pe | +5 pe | −0,07 / +0,04  |
| Stark mot fasta | 122 | 1,17–1,25 | +0,11 | +0,08 (+0,7) | −4 pe | +2 pe | −0,03 / +0,17  |
| Medel mot fasta | 166 | 1,20–1,42 | +0,04 | +0,02 (+0,2) | +4 pe | +8 pe | +0,06 / −0,03  |
| Svag mot fasta | 76 | 0,93–1,26 | −0,15 | −0,17 (−1,2) | −4 pe | −5 pe | −0,25 / −0,05 ✔ |

- Svårast mot **Lågpress** (−0,19 p/match rel. eget snitt, z −1,5, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +0,9, 136 m) – åt samma håll i båda halvorna men svagt

### QPR

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 50,5 %). 364 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,29), 0,13 emot (xG 0,26), 6,88 hörnor · 2025/26 (46 m): 0,20 mål för (xG 0,28), 0,41 emot (xG 0,29), 4,83 hörnor.

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
| Svag på fasta | 127 | 1,12–1,57 | −0,03 | −0,07 (−0,6) | −10 pe | +8 pe | −0,12 / −0,01 ✔ |
| Medel på fasta | 141 | 1,06–1,35 | −0,06 | −0,10 (−0,9) | −2 pe | +0 pe | −0,06 / −0,13 ✔ |
| Farlig på fasta | 96 | 1,52–1,27 | +0,27 | +0,23 (+1,8) | +2 pe | +6 pe | +0,41 / +0,01 ✔ |
| Stark mot fasta | 118 | 1,23–1,34 | −0,05 | −0,08 (−0,7) | −1 pe | +3 pe | +0,04 / −0,16  |
| Medel mot fasta | 169 | 1,11–1,40 | +0,07 | +0,03 (+0,3) | −6 pe | +1 pe | +0,06 / +0,00 ✔ |
| Svag mot fasta | 77 | 1,36–1,52 | +0,10 | +0,06 (+0,4) | −4 pe | +15 pe | +0,06 / +0,05 ✔ |

- Svårast mot **Lågpress** (−0,16 p/match rel. eget snitt, z −1,3, 103 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,23 p/match rel. eget snitt, z +1,8, 96 m) – åt samma håll i båda halvorna men svagt

### Sheffield United

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 39,9 %). 346 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,33), 0,00 emot (xG 0,24), 2,88 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,44), 0,30 emot (xG 0,27), 6,61 hörnor.

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
| Svag på fasta | 110 | 1,22–1,31 | −0,03 | −0,04 (−0,4) | −7 pe | −2 pe | −0,07 / −0,01 ✔ |
| Medel på fasta | 156 | 1,30–1,31 | −0,01 | −0,03 (−0,3) | −3 pe | +1 pe | −0,02 / −0,03 ✔ |
| Farlig på fasta | 80 | 1,16–1,14 | +0,12 | +0,11 (+0,8) | −12 pe | −16 pe | +0,18 / +0,03 ✔ |
| Stark mot fasta | 98 | 1,19–1,03 | +0,02 | +0,01 (+0,0) | −12 pe | −10 pe | −0,13 / +0,11  |
| Medel mot fasta | 173 | 1,26–1,52 | −0,08 | −0,09 (−1,0) | −3 pe | +0 pe | −0,06 / −0,12 ✔ |
| Svag mot fasta | 75 | 1,27–1,01 | +0,21 | +0,20 (+1,5) | −7 pe | −6 pe | +0,25 / +0,11 ✔ |

- Svårast mot **Medel mot fasta** (−0,09 p/match rel. eget snitt, z −1,0, 173 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,20 p/match rel. eget snitt, z +1,5, 75 m) – åt samma håll i båda halvorna men svagt

### Southampton

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 58,8 %). 328 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,31), 0,25 emot (xG 0,26), 5,63 hörnor · 2025/26 (46 m): 0,61 mål för (xG 0,42), 0,43 emot (xG 0,35), 5,74 hörnor.

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
| Svag på fasta | 118 | 1,36–1,63 | −0,01 | +0,08 (+0,7) | +5 pe | +4 pe | +0,19 / −0,06  |
| Medel på fasta | 132 | 1,24–1,76 | −0,22 | −0,13 (−1,3) | −5 pe | +8 pe | −0,21 / −0,07 ✔ |
| Farlig på fasta | 78 | 1,44–1,59 | +0,02 | +0,11 (+0,8) | −2 pe | −1 pe | +0,21 / +0,02 ✔ |
| Stark mot fasta | 122 | 1,39–1,67 | −0,00 | +0,08 (+0,7) | −0 pe | +5 pe | +0,06 / +0,10 ✔ |
| Medel mot fasta | 127 | 1,22–1,80 | −0,27 | −0,18 (−1,8) | −2 pe | +6 pe | −0,12 / −0,23 ✔ |
| Svag mot fasta | 79 | 1,41–1,46 | +0,08 | +0,17 (+1,2) | −1 pe | +2 pe | +0,21 / +0,09 ✔ |

- Svårast mot **Medel mot fasta** (−0,18 p/match rel. eget snitt, z −1,8, 127 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,17 p/match rel. eget snitt, z +1,2, 79 m) – åt samma håll i båda halvorna men svagt

### Stoke

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 46,5 %). 364 matcher med stil, mot marknaden totalt −0,16 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,19), 0,25 emot (xG 0,20), 4,50 hörnor · 2025/26 (46 m): 0,20 mål för (xG 0,29), 0,41 emot (xG 0,35), 5,98 hörnor.

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
| Svag på fasta | 130 | 1,07–1,37 | −0,20 | −0,04 (−0,4) | −0 pe | −2 pe | −0,10 / +0,01  |
| Medel på fasta | 139 | 1,16–1,20 | −0,12 | +0,04 (+0,3) | −3 pe | −3 pe | +0,06 / +0,02 ✔ |
| Farlig på fasta | 95 | 1,09–1,12 | −0,16 | +0,00 (+0,0) | +2 pe | −6 pe | −0,02 / +0,04  |
| Stark mot fasta | 122 | 1,21–1,18 | −0,15 | +0,01 (+0,1) | −4 pe | −1 pe | −0,04 / +0,04  |
| Medel mot fasta | 163 | 1,08–1,27 | −0,12 | +0,04 (+0,4) | +1 pe | −4 pe | +0,16 / −0,08  |
| Svag mot fasta | 79 | 1,01–1,27 | −0,25 | −0,09 (−0,6) | −1 pe | −6 pe | −0,30 / +0,30  |

- Svårast mot **Direktspel** (−0,25 p/match rel. eget snitt, z −2,4, 114 m) – ⚑ håller i båda halvorna
- Bäst mot **Kortpass** (+0,20 p/match rel. eget snitt, z +1,7, 110 m) – åt samma håll i båda halvorna men svagt

### Swansea

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 59,8 %). 364 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,31), 0,13 emot (xG 0,14), 4,25 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,31), 0,37 emot (xG 0,22), 4,54 hörnor.

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
| Svag på fasta | 128 | 1,31–1,28 | +0,13 | +0,06 (+0,5) | −4 pe | +5 pe | +0,02 / +0,09 ✔ |
| Medel på fasta | 138 | 1,27–1,25 | +0,03 | −0,04 (−0,4) | −2 pe | +0 pe | −0,05 / −0,04 ✔ |
| Farlig på fasta | 98 | 1,32–1,24 | +0,06 | −0,02 (−0,1) | −1 pe | +4 pe | +0,06 / −0,12  |
| Stark mot fasta | 120 | 1,35–1,20 | +0,11 | +0,04 (+0,3) | +2 pe | +0 pe | −0,19 / +0,19  |
| Medel mot fasta | 168 | 1,27–1,36 | +0,04 | −0,04 (−0,4) | −7 pe | +7 pe | +0,10 / −0,19  |
| Svag mot fasta | 76 | 1,28–1,14 | +0,10 | +0,02 (+0,2) | −0 pe | −1 pe | +0,03 / +0,00 ✔ |

- Svårast mot **Blandat** (−0,15 p/match rel. eget snitt, z −1,5, 141 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,24 p/match rel. eget snitt, z +2,1, 121 m) – ⚑ håller i båda halvorna

### Watford

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 46,1 %). 352 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,24), 0,13 emot (xG 0,55), 3,63 hörnor · 2025/26 (46 m): 0,24 mål för (xG 0,25), 0,52 emot (xG 0,35), 4,91 hörnor.

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
| Svag på fasta | 125 | 1,02–1,54 | −0,16 | −0,10 (−1,0) | −2 pe | +1 pe | −0,08 / −0,12 ✔ |
| Medel på fasta | 135 | 1,30–1,26 | +0,05 | +0,10 (+1,0) | +1 pe | +0 pe | +0,15 / +0,06 ✔ |
| Farlig på fasta | 92 | 1,21–1,27 | −0,07 | −0,01 (−0,1) | −2 pe | −2 pe | +0,08 / −0,11  |
| Stark mot fasta | 136 | 1,27–1,28 | +0,02 | +0,07 (+0,7) | +0 pe | −1 pe | +0,15 / −0,00  |
| Medel mot fasta | 152 | 1,06–1,43 | −0,18 | −0,13 (−1,4) | +2 pe | −3 pe | −0,11 / −0,14 ✔ |
| Svag mot fasta | 64 | 1,27–1,38 | +0,09 | +0,15 (+0,9) | −10 pe | +9 pe | +0,16 / +0,13 ✔ |

- Svårast mot **Blandat** (−0,24 p/match rel. eget snitt, z −2,4, 129 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +2,0, 110 m) – ⚑ håller i båda halvorna

### West Brom

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 53,1 %). 356 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,23), 0,13 emot (xG 0,31), 4,88 hörnor · 2025/26 (46 m): 0,41 mål för (xG 0,46), 0,26 emot (xG 0,21), 5,15 hörnor.

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
| Svag på fasta | 138 | 1,19–1,26 | −0,20 | −0,11 (−1,1) | +5 pe | −6 pe | −0,15 / −0,06 ✔ |
| Medel på fasta | 144 | 1,47–1,19 | +0,01 | +0,11 (+1,0) | −5 pe | −0 pe | −0,07 / +0,27  |
| Farlig på fasta | 74 | 1,34–1,12 | −0,10 | −0,01 (−0,1) | +14 pe | −4 pe | +0,35 / −0,36  |
| Stark mot fasta | 122 | 1,25–1,25 | −0,24 | −0,15 (−1,4) | −0 pe | −0 pe | −0,21 / −0,10 ✔ |
| Medel mot fasta | 159 | 1,30–1,08 | −0,01 | +0,08 (+0,8) | +1 pe | −9 pe | +0,02 / +0,14 ✔ |
| Svag mot fasta | 75 | 1,53–1,39 | −0,02 | +0,07 (+0,5) | +12 pe | +3 pe | +0,14 / −0,05  |

- Svårast mot **Stark mot fasta** (−0,15 p/match rel. eget snitt, z −1,4, 122 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,12 p/match rel. eget snitt, z +1,2, 143 m) – åt samma håll i båda halvorna men svagt

### West Ham

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 57,2 %). 312 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,75 mål för (xG 0,55), 0,50 emot (xG 0,42), 6,63 hörnor.

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
| Svag på fasta | 101 | 1,36–1,51 | +0,11 | +0,06 (+0,5) | −8 pe | +0 pe | +0,03 / +0,10 ✔ |
| Medel på fasta | 138 | 1,57–1,54 | +0,14 | +0,09 (+0,9) | +1 pe | +4 pe | +0,27 / −0,05  |
| Farlig på fasta | 73 | 1,18–1,59 | −0,19 | −0,25 (−1,9) | +1 pe | −4 pe | −0,22 / −0,27 ✔ |
| Stark mot fasta | 106 | 1,53–1,39 | +0,23 | +0,18 (+1,5) | −5 pe | +1 pe | +0,17 / +0,19 ✔ |
| Medel mot fasta | 135 | 1,34–1,70 | −0,12 | −0,18 (−1,7) | −2 pe | +3 pe | −0,14 / −0,21 ✔ |
| Svag mot fasta | 71 | 1,35–1,48 | +0,13 | +0,07 (+0,5) | +2 pe | −3 pe | +0,25 / −0,15  |

- Svårast mot **Farlig på fasta** (−0,25 p/match rel. eget snitt, z −1,9, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,18 p/match rel. eget snitt, z +1,5, 106 m) – åt samma håll i båda halvorna men svagt

### Wolves

Egen stil 2017/18 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 53,4 %). 311 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,33), 0,14 emot (xG 0,36), 6,29 hörnor.

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
| Svag på fasta | 101 | 0,93–1,47 | −0,05 | −0,07 (−0,6) | −7 pe | −10 pe | −0,07 / −0,08 ✔ |
| Medel på fasta | 134 | 1,31–1,41 | +0,14 | +0,11 (+1,1) | +2 pe | +2 pe | +0,33 / −0,05  |
| Farlig på fasta | 76 | 1,04–1,50 | −0,07 | −0,10 (−0,7) | −6 pe | −0 pe | −0,22 / −0,01 ✔ |
| Stark mot fasta | 108 | 0,95–1,35 | −0,03 | −0,05 (−0,4) | −2 pe | −9 pe | +0,04 / −0,16  |
| Medel mot fasta | 132 | 1,11–1,59 | −0,02 | −0,05 (−0,5) | −3 pe | −1 pe | −0,08 / −0,03 ✔ |
| Svag mot fasta | 71 | 1,41–1,34 | +0,19 | +0,16 (+1,1) | −4 pe | +4 pe | +0,23 / +0,08 ✔ |

- Svårast mot **Farlig på fasta** (−0,10 p/match rel. eget snitt, z −0,7, 76 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,11 p/match rel. eget snitt, z +1,1, 134 m) – inte stabilt, troligen slump

### Wrexham

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 48,3 %). 100 matcher med stil, mot marknaden totalt +0,28 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,31), 0,50 emot (xG 0,33), 4,75 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,32), 0,30 emot (xG 0,23), 4,46 hörnor.

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
| Svag på fasta | 26 | 1,38–1,27 | −0,11 | −0,39 (−1,9) | +31 pe | −10 pe | −0,36 / −0,42 ✔ |
| Medel på fasta | 53 | 1,49–1,04 | +0,33 | +0,05 (+0,3) | −5 pe | +4 pe | +0,16 / −0,14  |
| Farlig på fasta | 21 | 1,43–1,10 | +0,65 | +0,37 (+1,4) | −18 pe | +6 pe | +0,18 / +0,46 ✔ |
| Stark mot fasta | 28 | 1,61–1,04 | +0,59 | +0,31 (+1,3) | −6 pe | +8 pe | +0,30 / +0,33 ✔ |
| Medel mot fasta | 48 | 1,52–0,94 | +0,29 | +0,01 (+0,0) | +6 pe | −4 pe | −0,04 / +0,07  |
| Svag mot fasta | 24 | 1,13–1,54 | −0,10 | −0,38 (−1,6) | +2 pe | +0 pe | −0,05 / −0,54 ✔ |

- Svårast mot **Bollinnehav** (−0,41 p/match rel. eget snitt, z −2,2, 33 m) – ⚑ håller i båda halvorna
- Bäst mot **Blandat** (+0,44 p/match rel. eget snitt, z +2,1, 30 m) – ⚑ håller i båda halvorna
