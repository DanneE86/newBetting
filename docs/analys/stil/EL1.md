# Stilmatchning – League One (EL1)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 3409 matcher med stängningsodds och stil för båda lagen.

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

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 983 m · mot marknaden +0,06 (z +1,6) · mål 1,30 · ö2,5 −1 pe | 992 m · mot marknaden −0,01 (z −0,3) · mål 1,31 · ö2,5 +0 pe | 479 m · mot marknaden +0,04 (z +0,7) · mål 1,28 · ö2,5 +1 pe |
| **Medel på fasta** | 798 m · mot marknaden −0,06 (z −1,3) · mål 1,31 · ö2,5 −1 pe | 1523 m · mot marknaden +0,01 (z +0,5) · mål 1,36 · ö2,5 +2 pe | 679 m · mot marknaden +0,00 (z +0,0) · mål 1,34 · ö2,5 +1 pe |
| **Farlig på fasta** | 398 m · mot marknaden +0,02 (z +0,4) · mål 1,18 · ö2,5 −1 pe | 649 m · mot marknaden −0,01 (z −0,2) · mål 1,27 · ö2,5 +1 pe | 317 m · mot marknaden +0,01 (z +0,1) · mål 1,35 · ö2,5 +1 pe |

## Lag (säsong 2026/27)

### AFC Wimbledon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 45,4 %). 272 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,38), 0,13 emot (xG 0,07), 5,00 hörnor · 2025/26 (46 m): 0,30 mål för (xG 0,34), 0,39 emot (xG 0,37), 4,70 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,15–1,23 | −0,08 | +0,03 (+0,2) | +0 pe | −1 pe | −0,14 / +0,17  |
| Balanserat | 122 | 1,27–1,38 | −0,06 | +0,04 (+0,4) | +7 pe | −0 pe | −0,04 / +0,13  |
| Bollinnehav | 62 | 1,02–1,35 | −0,23 | −0,12 (−0,8) | −0 pe | −7 pe | −0,14 / −0,11 ✔ |
| Kortpass | 69 | 1,14–1,45 | −0,13 | −0,02 (−0,2) | −0 pe | +1 pe | −0,28 / +0,10  |
| Blandat | 118 | 1,21–1,25 | −0,04 | +0,07 (+0,6) | +6 pe | −1 pe | +0,01 / +0,11 ✔ |
| Direktspel | 85 | 1,14–1,32 | −0,18 | −0,08 (−0,6) | +2 pe | −5 pe | −0,12 / +0,03  |
| Lågpress | 76 | 1,11–1,39 | −0,21 | −0,10 (−0,8) | +9 pe | −5 pe | −0,33 / +0,12  |
| Mellanpress | 111 | 1,20–1,37 | −0,10 | +0,01 (+0,1) | −0 pe | −1 pe | −0,09 / +0,12  |
| Högpress | 85 | 1,20–1,20 | −0,03 | +0,08 (+0,6) | +3 pe | −0 pe | +0,13 / +0,04 ✔ |
| Svag på fasta | 96 | 1,16–1,33 | −0,23 | −0,12 (−1,0) | +5 pe | −4 pe | −0,12 / −0,11 ✔ |
| Medel på fasta | 125 | 1,29–1,27 | +0,02 | +0,13 (+1,2) | +6 pe | +2 pe | −0,02 / +0,24  |
| Farlig på fasta | 51 | 0,92–1,43 | −0,20 | −0,10 (−0,6) | −6 pe | −8 pe | −0,18 / −0,06 ✔ |
| Stark mot fasta | 84 | 1,01–1,15 | −0,24 | −0,14 (−1,0) | +1 pe | −9 pe | −0,26 / +0,07  |
| Medel mot fasta | 125 | 1,30–1,36 | −0,06 | +0,04 (+0,4) | +7 pe | +1 pe | −0,01 / +0,08  |
| Svag mot fasta | 63 | 1,14–1,48 | −0,01 | +0,10 (+0,6) | −1 pe | +1 pe | +0,04 / +0,16 ✔ |

- Svårast mot **Stark mot fasta** (−0,14 p/match rel. eget snitt, z −1,0, 84 m) – inte stabilt, troligen slump
- Bäst mot **Medel på fasta** (+0,13 p/match rel. eget snitt, z +1,2, 125 m) – inte stabilt, troligen slump

### Barnsley

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 54,2 %). 287 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,23), 0,71 emot (xG 0,40), 8,29 hörnor · 2025/26 (46 m): 0,26 mål för (xG 0,25), 0,39 emot (xG 0,42), 4,91 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 106 | 1,39–1,37 | +0,01 | +0,02 (+0,2) | −7 pe | +5 pe | +0,19 / −0,08  |
| Balanserat | 108 | 1,30–1,41 | −0,13 | −0,12 (−1,0) | −1 pe | +1 pe | −0,10 / −0,13 ✔ |
| Bollinnehav | 73 | 1,55–1,40 | +0,12 | +0,14 (+0,9) | +2 pe | +15 pe | +0,14 / +0,13 ✔ |
| Kortpass | 70 | 1,63–1,50 | +0,09 | +0,10 (+0,7) | +7 pe | +12 pe | +0,13 / +0,09 ✔ |
| Blandat | 136 | 1,23–1,44 | −0,14 | −0,13 (−1,2) | −4 pe | +2 pe | −0,07 / −0,20 ✔ |
| Direktspel | 81 | 1,47–1,21 | +0,12 | +0,13 (+1,0) | −7 pe | +8 pe | +0,17 / +0,06 ✔ |
| Lågpress | 75 | 1,13–1,23 | −0,18 | −0,17 (−1,3) | +5 pe | −8 pe | −0,22 / −0,13 ✔ |
| Mellanpress | 116 | 1,45–1,39 | +0,06 | +0,07 (+0,6) | −2 pe | +9 pe | +0,26 / −0,16  |
| Högpress | 96 | 1,53–1,52 | +0,04 | +0,05 (+0,4) | −9 pe | +14 pe | −0,04 / +0,12  |
| Svag på fasta | 103 | 1,23–1,29 | −0,04 | −0,03 (−0,3) | −2 pe | +2 pe | +0,04 / −0,19  |
| Medel på fasta | 106 | 1,55–1,52 | +0,02 | +0,03 (+0,3) | −1 pe | +10 pe | −0,13 / +0,11  |
| Farlig på fasta | 78 | 1,40–1,35 | −0,01 | +0,00 (+0,0) | −5 pe | +7 pe | +0,21 / −0,22  |
| Stark mot fasta | 104 | 1,37–1,26 | −0,02 | −0,00 (−0,0) | +1 pe | +2 pe | −0,05 / +0,07  |
| Medel mot fasta | 135 | 1,36–1,53 | −0,08 | −0,06 (−0,6) | −4 pe | +9 pe | +0,03 / −0,13  |
| Svag mot fasta | 48 | 1,54–1,27 | +0,18 | +0,19 (+1,0) | −6 pe | +8 pe | +0,33 / +0,05 ✔ |

- Svårast mot **Lågpress** (−0,17 p/match rel. eget snitt, z −1,3, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,19 p/match rel. eget snitt, z +1,0, 48 m) – åt samma håll i båda halvorna men svagt

### Blackpool

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,8 %). 283 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,30), 0,86 emot (xG 0,70), 4,57 hörnor · 2025/26 (46 m): 0,28 mål för (xG 0,29), 0,50 emot (xG 0,36), 4,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,25–1,22 | −0,05 | −0,06 (−0,5) | −4 pe | −2 pe | +0,02 / −0,13  |
| Balanserat | 113 | 1,30–1,29 | +0,06 | +0,04 (+0,3) | −1 pe | −1 pe | +0,13 / −0,09  |
| Bollinnehav | 68 | 1,35–1,22 | +0,05 | +0,03 (+0,2) | −2 pe | +1 pe | −0,11 / +0,16  |
| Kortpass | 73 | 1,47–1,29 | +0,18 | +0,17 (+1,1) | −3 pe | +6 pe | +0,35 / +0,09 ✔ |
| Blandat | 127 | 1,17–1,43 | −0,13 | −0,15 (−1,4) | +0 pe | −2 pe | −0,15 / −0,14 ✔ |
| Direktspel | 83 | 1,34–0,94 | +0,10 | +0,08 (+0,6) | −5 pe | −5 pe | +0,13 / −0,03  |
| Lågpress | 64 | 1,38–1,47 | −0,06 | −0,07 (−0,5) | +1 pe | +5 pe | +0,21 / −0,31  |
| Mellanpress | 107 | 1,21–1,13 | −0,00 | −0,02 (−0,2) | −6 pe | −5 pe | −0,01 / −0,03 ✔ |
| Högpress | 112 | 1,33–1,23 | +0,08 | +0,06 (+0,5) | +0 pe | −0 pe | +0,01 / +0,12 ✔ |
| Svag på fasta | 84 | 1,21–1,24 | +0,02 | +0,00 (+0,0) | +2 pe | −6 pe | +0,03 / −0,05  |
| Medel på fasta | 142 | 1,21–1,26 | −0,05 | −0,07 (−0,6) | −6 pe | −1 pe | −0,08 / −0,06 ✔ |
| Farlig på fasta | 57 | 1,61–1,23 | +0,18 | +0,16 (+1,0) | +3 pe | +7 pe | +0,44 / +0,00 ✔ |
| Stark mot fasta | 90 | 1,26–1,31 | −0,12 | −0,13 (−1,1) | +1 pe | −5 pe | −0,17 / −0,09 ✔ |
| Medel mot fasta | 143 | 1,25–1,23 | −0,01 | −0,03 (−0,2) | −2 pe | −1 pe | −0,06 / +0,01  |
| Svag mot fasta | 50 | 1,48–1,18 | +0,33 | +0,31 (+1,7) | −7 pe | +7 pe | +0,70 / −0,11  |

- Svårast mot **Blandat** (−0,15 p/match rel. eget snitt, z −1,4, 127 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,31 p/match rel. eget snitt, z +1,7, 50 m) – inte stabilt, troligen slump

### Bradford

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,9 %). 263 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,30), 0,25 emot (xG 0,19), 6,25 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,41), 0,39 emot (xG 0,25), 5,57 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 74 | 1,34–1,15 | +0,08 | +0,06 (+0,4) | −4 pe | +7 pe | +0,08 / +0,04 ✔ |
| Balanserat | 134 | 1,10–1,05 | −0,03 | −0,05 (−0,5) | +3 pe | −4 pe | −0,10 / +0,00  |
| Bollinnehav | 55 | 1,40–1,04 | +0,08 | +0,05 (+0,3) | −2 pe | −6 pe | −0,15 / +0,25  |
| Kortpass | 58 | 1,38–1,17 | −0,01 | −0,04 (−0,2) | −3 pe | −3 pe | −0,72 / +0,12  |
| Blandat | 141 | 1,16–1,01 | +0,06 | +0,04 (+0,3) | −1 pe | −2 pe | +0,09 / −0,04  |
| Direktspel | 64 | 1,25–1,13 | −0,02 | −0,05 (−0,3) | +4 pe | +2 pe | −0,21 / +0,23  |
| Lågpress | 71 | 1,21–1,08 | −0,03 | −0,06 (−0,4) | +2 pe | −7 pe | −0,26 / +0,11  |
| Mellanpress | 99 | 1,28–1,00 | +0,15 | +0,12 (+0,9) | +0 pe | −1 pe | +0,25 / −0,00  |
| Högpress | 93 | 1,19–1,15 | −0,06 | −0,08 (−0,6) | −2 pe | +3 pe | −0,25 / +0,12  |
| Svag på fasta | 84 | 1,29–1,12 | −0,05 | −0,08 (−0,5) | +5 pe | −0 pe | −0,09 / −0,04 ✔ |
| Medel på fasta | 128 | 1,18–1,14 | −0,03 | −0,05 (−0,4) | −4 pe | −0 pe | −0,13 / +0,00  |
| Farlig på fasta | 51 | 1,27–0,84 | +0,28 | +0,25 (+1,5) | +2 pe | −6 pe | +0,16 / +0,30 ✔ |
| Stark mot fasta | 89 | 1,16–1,06 | +0,07 | +0,04 (+0,3) | −1 pe | −3 pe | +0,02 / +0,09 ✔ |
| Medel mot fasta | 110 | 1,33–1,16 | −0,05 | −0,08 (−0,6) | +0 pe | +4 pe | −0,33 / +0,06  |
| Svag mot fasta | 64 | 1,17–0,95 | +0,10 | +0,07 (+0,5) | +0 pe | −8 pe | +0,08 / +0,07 ✔ |

- Svårast mot **Medel mot fasta** (−0,08 p/match rel. eget snitt, z −0,6, 110 m) – inte stabilt, troligen slump
- Bäst mot **Farlig på fasta** (+0,25 p/match rel. eget snitt, z +1,5, 51 m) – åt samma håll i båda halvorna men svagt

### Bromley

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 36,0 %). 49 matcher med stil, mot marknaden totalt +0,37 per match.

Fasta situationer per match: 2026/27 (7 m): 0,71 mål för (xG 0,34), 0,86 emot (xG 0,53), 3,29 hörnor.

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
| Svag på fasta | 9 | 1,67–1,44 | +0,52 | +0,15 (+0,4) | −5 pe | +18 pe | +0,84 / −0,71  |
| Medel på fasta | 15 | 1,53–1,47 | +0,48 | +0,11 (+0,3) | +0 pe | −4 pe | +0,49 / −0,15  |
| Farlig på fasta | 25 | 1,48–1,04 | +0,26 | −0,12 (−0,6) | +9 pe | +8 pe | −0,19 / −0,04 ✔ |
| Stark mot fasta | 8 | 1,50–1,00 | +0,27 | −0,10 (−0,2) | −3 pe | +3 pe | +0,11 / −0,45  |
| Medel mot fasta | 18 | 1,67–1,11 | +0,22 | −0,15 (−0,6) | +17 pe | +13 pe | −0,12 / −0,19 ✔ |
| Svag mot fasta | 23 | 1,43–1,43 | +0,53 | +0,15 (+0,6) | −5 pe | +2 pe | +0,59 / −0,13  |

- Svårast mot **Blandat** (−0,14 p/match rel. eget snitt, z −0,6, 20 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,19 p/match rel. eget snitt, z +0,8, 23 m) – inte stabilt, troligen slump

### Burton

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 45,4 %). 288 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,22), 0,00 emot (xG 0,33), 2,89 hörnor · 2025/26 (46 m): 0,39 mål för (xG 0,43), 0,39 emot (xG 0,31), 5,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 96 | 1,11–1,46 | +0,05 | +0,03 (+0,2) | −3 pe | +4 pe | −0,20 / +0,17  |
| Balanserat | 113 | 1,22–1,58 | +0,08 | +0,06 (+0,5) | +1 pe | +6 pe | +0,28 / −0,22  |
| Bollinnehav | 79 | 1,03–1,38 | −0,09 | −0,12 (−0,9) | +4 pe | −6 pe | −0,20 / −0,01 ✔ |
| Kortpass | 77 | 0,97–1,42 | −0,14 | −0,17 (−1,2) | +8 pe | −3 pe | −0,34 / −0,07 ✔ |
| Blandat | 123 | 1,20–1,61 | +0,09 | +0,06 (+0,6) | −10 pe | +9 pe | +0,25 / −0,08  |
| Direktspel | 88 | 1,17–1,36 | +0,08 | +0,05 (+0,4) | +8 pe | −5 pe | −0,05 / +0,33  |
| Lågpress | 71 | 1,01–1,35 | +0,09 | +0,07 (+0,5) | +5 pe | −3 pe | −0,15 / +0,29  |
| Mellanpress | 120 | 1,31–1,56 | +0,11 | +0,08 (+0,7) | −1 pe | +6 pe | +0,14 / +0,01 ✔ |
| Högpress | 97 | 1,00–1,48 | −0,13 | −0,15 (−1,2) | −1 pe | −1 pe | −0,07 / −0,22 ✔ |
| Svag på fasta | 104 | 1,09–1,57 | −0,04 | −0,06 (−0,5) | −6 pe | +4 pe | −0,00 / −0,20 ✔ |
| Medel på fasta | 132 | 1,23–1,50 | +0,11 | +0,09 (+0,8) | +2 pe | +5 pe | +0,08 / +0,09 ✔ |
| Farlig på fasta | 52 | 0,96–1,27 | −0,07 | −0,10 (−0,6) | +10 pe | −10 pe | −0,16 / −0,07 ✔ |
| Stark mot fasta | 93 | 1,04–1,31 | −0,00 | −0,03 (−0,2) | +2 pe | −2 pe | +0,03 / −0,11  |
| Medel mot fasta | 135 | 1,19–1,50 | +0,06 | +0,03 (+0,3) | +1 pe | +4 pe | −0,08 / +0,11  |
| Svag mot fasta | 60 | 1,13–1,70 | −0,00 | −0,03 (−0,2) | −2 pe | +3 pe | +0,12 / −0,24  |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,2, 97 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,09 p/match rel. eget snitt, z +0,8, 132 m) – åt samma håll i båda halvorna men svagt

### Cambridge

Egen stil 2024/25 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 45,8 %). 276 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,35), 0,38 emot (xG 0,36), 6,25 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,19–1,34 | +0,19 | +0,13 (+0,9) | −7 pe | +5 pe | +0,32 / +0,03 ✔ |
| Balanserat | 102 | 1,22–1,28 | +0,01 | −0,04 (−0,4) | +0 pe | +1 pe | −0,05 / −0,04 ✔ |
| Bollinnehav | 84 | 1,07–1,29 | −0,03 | −0,09 (−0,7) | −0 pe | −12 pe | +0,15 / −0,36  |
| Kortpass | 72 | 0,97–1,31 | −0,15 | −0,20 (−1,5) | −3 pe | −15 pe | −0,09 / −0,25 ✔ |
| Blandat | 118 | 1,24–1,42 | +0,03 | −0,02 (−0,2) | +1 pe | +5 pe | +0,14 / −0,20  |
| Direktspel | 86 | 1,22–1,15 | +0,25 | +0,20 (+1,4) | −6 pe | +1 pe | +0,15 / +0,29 ✔ |
| Lågpress | 68 | 1,40–1,16 | +0,32 | +0,27 (+1,9) | +3 pe | −3 pe | +0,33 / +0,22 ✔ |
| Mellanpress | 101 | 1,09–1,34 | −0,08 | −0,13 (−1,2) | −1 pe | −2 pe | +0,01 / −0,29  |
| Högpress | 107 | 1,08–1,36 | +0,01 | −0,05 (−0,4) | −7 pe | −0 pe | +0,06 / −0,15  |
| Svag på fasta | 94 | 0,95–1,36 | −0,12 | −0,18 (−1,4) | −5 pe | −7 pe | −0,04 / −0,46 ✔ |
| Medel på fasta | 113 | 1,27–1,35 | +0,24 | +0,18 (+1,6) | −7 pe | +3 pe | +0,44 / −0,00  |
| Farlig på fasta | 69 | 1,28–1,16 | −0,01 | −0,06 (−0,4) | +9 pe | −3 pe | −0,15 / −0,01 ✔ |
| Stark mot fasta | 94 | 1,05–1,28 | +0,01 | −0,04 (−0,3) | −4 pe | −3 pe | −0,07 / −0,01 ✔ |
| Medel mot fasta | 116 | 1,16–1,41 | −0,00 | −0,06 (−0,5) | −3 pe | +1 pe | +0,08 / −0,16  |
| Svag mot fasta | 66 | 1,33–1,17 | +0,21 | +0,16 (+1,1) | +2 pe | −4 pe | +0,41 / −0,11  |

- Svårast mot **Kortpass** (−0,20 p/match rel. eget snitt, z −1,5, 72 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,27 p/match rel. eget snitt, z +1,9, 68 m) – åt samma håll i båda halvorna men svagt

### Doncaster

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,8 %). 271 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,41), 0,57 emot (xG 0,17), 4,86 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,45), 0,35 emot (xG 0,23), 4,28 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,21–1,44 | −0,06 | −0,11 (−0,9) | −6 pe | +3 pe | −0,10 / −0,11 ✔ |
| Balanserat | 119 | 1,27–1,51 | +0,05 | +0,00 (+0,0) | −13 pe | +6 pe | −0,16 / +0,18  |
| Bollinnehav | 61 | 1,28–1,26 | +0,20 | +0,15 (+0,9) | +2 pe | +2 pe | +0,08 / +0,23 ✔ |
| Kortpass | 62 | 1,23–1,35 | +0,09 | +0,05 (+0,3) | −2 pe | −1 pe | −0,01 / +0,07  |
| Blandat | 121 | 1,19–1,37 | −0,00 | −0,05 (−0,4) | −9 pe | +5 pe | −0,12 / +0,01  |
| Direktspel | 88 | 1,35–1,57 | +0,08 | +0,04 (+0,3) | −9 pe | +6 pe | −0,07 / +0,30  |
| Lågpress | 75 | 1,09–1,52 | −0,09 | −0,13 (−1,0) | −11 pe | +3 pe | −0,36 / +0,10  |
| Mellanpress | 111 | 1,26–1,37 | +0,16 | +0,11 (+0,9) | −8 pe | +5 pe | +0,18 / +0,04 ✔ |
| Högpress | 85 | 1,38–1,44 | +0,03 | −0,02 (−0,2) | −3 pe | +4 pe | −0,19 / +0,13  |
| Svag på fasta | 94 | 1,21–1,45 | +0,13 | +0,08 (+0,6) | −10 pe | +8 pe | −0,06 / +0,47  |
| Medel på fasta | 129 | 1,38–1,44 | +0,03 | −0,02 (−0,2) | −7 pe | +7 pe | −0,13 / +0,05  |
| Farlig på fasta | 48 | 0,98–1,38 | −0,06 | −0,11 (−0,7) | −1 pe | −12 pe | −0,04 / −0,15 ✔ |
| Stark mot fasta | 81 | 1,40–1,48 | +0,13 | +0,08 (+0,6) | −6 pe | +10 pe | +0,06 / +0,11 ✔ |
| Medel mot fasta | 130 | 1,21–1,36 | +0,07 | +0,02 (+0,2) | −11 pe | +2 pe | −0,05 / +0,07  |
| Svag mot fasta | 60 | 1,15–1,52 | −0,11 | −0,15 (−1,1) | +0 pe | +1 pe | −0,40 / +0,09  |

- Svårast mot **Svag mot fasta** (−0,15 p/match rel. eget snitt, z −1,1, 60 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,15 p/match rel. eget snitt, z +0,9, 61 m) – åt samma håll i båda halvorna men svagt

### Huddersfield

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 51,0 %). 361 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,59), 0,38 emot (xG 0,38), 6,88 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,39), 0,46 emot (xG 0,25), 5,89 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 128 | 1,20–1,20 | +0,05 | +0,10 (+0,9) | +2 pe | −1 pe | +0,22 / −0,01  |
| Balanserat | 144 | 1,15–1,63 | −0,10 | −0,05 (−0,5) | −1 pe | +8 pe | −0,07 / −0,03 ✔ |
| Bollinnehav | 89 | 1,10–1,51 | −0,11 | −0,06 (−0,5) | −2 pe | −3 pe | −0,12 / −0,01 ✔ |
| Kortpass | 78 | 1,40–1,60 | −0,06 | −0,01 (−0,1) | −4 pe | +7 pe | +0,09 / −0,04  |
| Blandat | 154 | 1,13–1,39 | −0,05 | −0,00 (−0,0) | +2 pe | −0 pe | +0,18 / −0,15  |
| Direktspel | 129 | 1,04–1,41 | −0,04 | +0,01 (+0,1) | −1 pe | +2 pe | −0,12 / +0,35  |
| Lågpress | 98 | 1,16–1,50 | −0,12 | −0,07 (−0,5) | −5 pe | +6 pe | +0,05 / −0,30  |
| Mellanpress | 142 | 1,13–1,49 | −0,10 | −0,05 (−0,5) | +4 pe | −2 pe | −0,05 / −0,04 ✔ |
| Högpress | 121 | 1,18–1,35 | +0,06 | +0,11 (+1,0) | −2 pe | +4 pe | +0,09 / +0,12 ✔ |
| Svag på fasta | 118 | 1,03–1,45 | −0,05 | −0,00 (−0,0) | −3 pe | −2 pe | −0,01 / +0,01  |
| Medel på fasta | 147 | 1,15–1,48 | −0,11 | −0,06 (−0,6) | −3 pe | +3 pe | −0,01 / −0,10 ✔ |
| Farlig på fasta | 96 | 1,31–1,39 | +0,05 | +0,10 (+0,8) | +8 pe | +5 pe | +0,08 / +0,12 ✔ |
| Stark mot fasta | 115 | 1,07–1,35 | −0,08 | −0,03 (−0,3) | +6 pe | −4 pe | +0,08 / −0,15  |
| Medel mot fasta | 165 | 1,17–1,50 | −0,07 | −0,02 (−0,2) | −2 pe | +4 pe | −0,05 / −0,00 ✔ |
| Svag mot fasta | 81 | 1,25–1,47 | +0,05 | +0,09 (+0,7) | −5 pe | +6 pe | +0,04 / +0,19 ✔ |

- Svårast mot **Medel på fasta** (−0,06 p/match rel. eget snitt, z −0,6, 147 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,11 p/match rel. eget snitt, z +1,0, 121 m) – åt samma håll i båda halvorna men svagt

### Leicester

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 68,0 %). 327 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,26), 0,14 emot (xG 0,33), 6,71 hörnor.

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
| Svag på fasta | 108 | 1,60–1,46 | +0,04 | +0,07 (+0,5) | −3 pe | +8 pe | +0,12 / −0,01  |
| Medel på fasta | 137 | 1,49–1,28 | +0,01 | +0,04 (+0,3) | −2 pe | +0 pe | +0,02 / +0,04 ✔ |
| Farlig på fasta | 82 | 1,35–1,61 | −0,18 | −0,15 (−1,1) | −9 pe | +9 pe | +0,07 / −0,32  |
| Stark mot fasta | 122 | 1,54–1,51 | −0,08 | −0,05 (−0,5) | −8 pe | +6 pe | −0,04 / −0,07 ✔ |
| Medel mot fasta | 125 | 1,53–1,38 | +0,09 | +0,12 (+1,1) | −2 pe | +7 pe | +0,29 / −0,04  |
| Svag mot fasta | 80 | 1,36–1,36 | −0,13 | −0,10 (−0,8) | −0 pe | −0 pe | −0,07 / −0,14 ✔ |

- Svårast mot **Kortpass** (−0,18 p/match rel. eget snitt, z −1,4, 86 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,12 p/match rel. eget snitt, z +1,1, 125 m) – inte stabilt, troligen slump

### Leyton Orient

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 50,5 %). 271 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,44), 0,38 emot (xG 0,39), 3,88 hörnor · 2025/26 (46 m): 0,20 mål för (xG 0,28), 0,52 emot (xG 0,41), 4,76 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,20–1,13 | +0,09 | +0,04 (+0,3) | −7 pe | +1 pe | −0,06 / +0,10  |
| Balanserat | 124 | 1,29–1,16 | −0,01 | −0,05 (−0,4) | −1 pe | −3 pe | +0,05 / −0,22  |
| Bollinnehav | 54 | 1,44–1,09 | +0,09 | +0,04 (+0,2) | −11 pe | +2 pe | −0,10 / +0,16  |
| Kortpass | 54 | 1,33–1,15 | −0,02 | −0,06 (−0,4) | −7 pe | −0 pe | −0,05 / −0,06 ✔ |
| Blandat | 148 | 1,35–1,24 | −0,02 | −0,06 (−0,6) | −2 pe | +5 pe | −0,11 / −0,01 ✔ |
| Direktspel | 69 | 1,13–0,91 | +0,23 | +0,18 (+1,1) | −8 pe | −12 pe | +0,19 / +0,17 ✔ |
| Lågpress | 64 | 1,28–1,08 | −0,11 | −0,16 (−1,0) | +6 pe | −2 pe | −0,13 / −0,18 ✔ |
| Mellanpress | 102 | 1,32–1,25 | +0,02 | −0,02 (−0,2) | −7 pe | +0 pe | +0,04 / −0,08  |
| Högpress | 105 | 1,27–1,07 | +0,16 | +0,12 (+0,9) | −9 pe | −0 pe | +0,02 / +0,22 ✔ |
| Svag på fasta | 92 | 1,21–0,95 | +0,13 | +0,08 (+0,7) | −8 pe | −8 pe | +0,04 / +0,19 ✔ |
| Medel på fasta | 123 | 1,37–1,21 | +0,01 | −0,03 (−0,2) | −5 pe | +2 pe | +0,01 / −0,06  |
| Farlig på fasta | 56 | 1,25–1,29 | −0,03 | −0,07 (−0,4) | −1 pe | +5 pe | −0,20 / −0,00 ✔ |
| Stark mot fasta | 94 | 1,16–0,90 | +0,17 | +0,12 (+1,0) | −3 pe | −8 pe | +0,09 / +0,18 ✔ |
| Medel mot fasta | 118 | 1,33–1,25 | +0,03 | −0,01 (−0,1) | −8 pe | +3 pe | −0,02 / −0,01 ✔ |
| Svag mot fasta | 59 | 1,42–1,29 | −0,13 | −0,17 (−1,0) | −2 pe | +4 pe | −0,15 / −0,20 ✔ |

- Svårast mot **Svag mot fasta** (−0,17 p/match rel. eget snitt, z −1,0, 59 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,18 p/match rel. eget snitt, z +1,1, 69 m) – åt samma håll i båda halvorna men svagt

### Luton

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 57,1 %). 275 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,30), 0,43 emot (xG 0,17), 6,29 hörnor · 2025/26 (46 m): 0,50 mål för (xG 0,36), 0,28 emot (xG 0,25), 6,09 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 100 | 1,25–1,19 | +0,17 | +0,13 (+1,1) | −2 pe | −2 pe | +0,31 / −0,04  |
| Balanserat | 113 | 1,25–1,40 | −0,01 | −0,04 (−0,4) | −2 pe | −2 pe | +0,24 / −0,34  |
| Bollinnehav | 62 | 1,16–1,50 | −0,10 | −0,13 (−0,9) | +1 pe | −1 pe | +0,03 / −0,28  |
| Kortpass | 83 | 1,29–1,64 | −0,16 | −0,20 (−1,4) | −4 pe | +3 pe | +0,26 / −0,36  |
| Blandat | 123 | 1,19–1,20 | +0,05 | +0,01 (+0,1) | +3 pe | −4 pe | +0,14 / −0,10  |
| Direktspel | 69 | 1,23–1,26 | +0,25 | +0,21 (+1,4) | −6 pe | −2 pe | +0,28 / −0,14  |
| Lågpress | 53 | 1,57–1,11 | +0,34 | +0,30 (+1,8) | −1 pe | +5 pe | +0,51 / −0,03  |
| Mellanpress | 115 | 1,12–1,27 | −0,07 | −0,10 (−0,9) | −1 pe | −6 pe | −0,05 / −0,15 ✔ |
| Högpress | 107 | 1,18–1,54 | −0,00 | −0,04 (−0,3) | −1 pe | −0 pe | +0,30 / −0,38  |
| Svag på fasta | 85 | 1,07–1,25 | +0,11 | +0,07 (+0,5) | +0 pe | −7 pe | +0,31 / −0,38  |
| Medel på fasta | 115 | 1,30–1,47 | −0,14 | −0,17 (−1,5) | −0 pe | +1 pe | +0,00 / −0,28  |
| Farlig på fasta | 75 | 1,31–1,27 | +0,22 | +0,19 (+1,3) | −4 pe | +1 pe | +0,33 / +0,04 ✔ |
| Stark mot fasta | 81 | 1,25–1,16 | +0,20 | +0,17 (+1,2) | −2 pe | −9 pe | +0,29 / −0,02  |
| Medel mot fasta | 149 | 1,24–1,37 | −0,00 | −0,04 (−0,4) | −0 pe | +2 pe | +0,24 / −0,26  |
| Svag mot fasta | 45 | 1,16–1,60 | −0,13 | −0,17 (−0,9) | −3 pe | −2 pe | +0,02 / −0,35  |

- Svårast mot **Medel på fasta** (−0,17 p/match rel. eget snitt, z −1,5, 115 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,30 p/match rel. eget snitt, z +1,8, 53 m) – inte stabilt, troligen slump

### Mansfield

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 45,9 %). 267 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,24), 0,57 emot (xG 0,36), 3,71 hörnor · 2025/26 (46 m): 0,28 mål för (xG 0,33), 0,13 emot (xG 0,20), 4,70 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,16–1,13 | −0,20 | −0,20 (−1,6) | +9 pe | −8 pe | −0,06 / −0,26 ✔ |
| Balanserat | 121 | 1,73–1,21 | +0,15 | +0,15 (+1,3) | −1 pe | +11 pe | +0,10 / +0,26 ✔ |
| Bollinnehav | 63 | 1,51–1,29 | −0,04 | −0,04 (−0,2) | +2 pe | +3 pe | −0,04 / −0,04 ✔ |
| Kortpass | 64 | 1,53–1,38 | +0,04 | +0,05 (+0,3) | −1 pe | +5 pe | +0,25 / +0,01 ✔ |
| Blandat | 134 | 1,57–1,22 | +0,04 | +0,04 (+0,4) | +5 pe | +8 pe | +0,13 / −0,10  |
| Direktspel | 69 | 1,32–1,01 | −0,12 | −0,12 (−0,8) | +2 pe | −9 pe | −0,19 / +0,01  |
| Lågpress | 72 | 1,67–1,28 | +0,04 | +0,04 (+0,3) | −2 pe | +8 pe | −0,01 / +0,09  |
| Mellanpress | 96 | 1,44–1,10 | +0,06 | +0,06 (+0,5) | +12 pe | +0 pe | +0,16 / −0,04  |
| Högpress | 99 | 1,43–1,25 | −0,09 | −0,09 (−0,7) | −3 pe | +3 pe | −0,06 / −0,12 ✔ |
| Svag på fasta | 94 | 1,56–1,24 | −0,01 | −0,01 (−0,0) | −0 pe | +11 pe | +0,07 / −0,20  |
| Medel på fasta | 126 | 1,56–1,25 | +0,01 | +0,02 (+0,2) | +3 pe | +3 pe | +0,08 / −0,02  |
| Farlig på fasta | 47 | 1,21–1,02 | −0,04 | −0,04 (−0,2) | +9 pe | −11 pe | −0,26 / +0,08  |
| Stark mot fasta | 92 | 1,53–1,23 | −0,09 | −0,09 (−0,7) | +5 pe | +2 pe | +0,03 / −0,30  |
| Medel mot fasta | 114 | 1,48–1,32 | −0,06 | −0,06 (−0,5) | −0 pe | +6 pe | −0,06 / −0,06 ✔ |
| Svag mot fasta | 61 | 1,48–0,97 | +0,24 | +0,24 (+1,5) | +6 pe | −1 pe | +0,17 / +0,34 ✔ |

- Svårast mot **Backar hem** (−0,20 p/match rel. eget snitt, z −1,6, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,24 p/match rel. eget snitt, z +1,5, 61 m) – åt samma håll i båda halvorna men svagt

### Milton Keynes Dons

Egen stil 2022/23 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 43,7 %). 271 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,64), 0,57 emot (xG 0,20), 5,43 hörnor.

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
| Svag på fasta | 94 | 1,29–1,30 | −0,12 | −0,12 (−0,9) | −2 pe | −3 pe | −0,11 / −0,12 ✔ |
| Medel på fasta | 117 | 1,53–1,38 | −0,01 | −0,01 (−0,1) | −5 pe | +7 pe | +0,15 / −0,12  |
| Farlig på fasta | 60 | 1,58–1,00 | +0,20 | +0,20 (+1,3) | +2 pe | −4 pe | +0,31 / +0,14 ✔ |
| Stark mot fasta | 84 | 1,36–1,26 | −0,01 | −0,00 (−0,0) | +1 pe | +0 pe | +0,10 / −0,14  |
| Medel mot fasta | 115 | 1,44–1,25 | −0,06 | −0,06 (−0,5) | −5 pe | −0 pe | −0,16 / +0,03  |
| Svag mot fasta | 72 | 1,60–1,31 | +0,09 | +0,10 (+0,6) | −3 pe | +4 pe | +0,26 / −0,06  |

- Svårast mot **Högpress** (−0,18 p/match rel. eget snitt, z −1,4, 87 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +1,8, 96 m) – inte stabilt, troligen slump

### Notts County

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 45,4 %). 91 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,39), 0,14 emot (xG 0,31), 4,43 hörnor.

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
| Svag på fasta | 12 | 1,92–0,75 | +0,90 | +0,80 (+2,9) | −9 pe | +4 pe | +0,94 / +0,67 ✔ ⚑ |
| Medel på fasta | 40 | 1,32–0,90 | −0,02 | −0,12 (−0,6) | +1 pe | −16 pe | −0,14 / −0,07 ✔ |
| Farlig på fasta | 39 | 1,54–1,33 | −0,03 | −0,13 (−0,6) | −3 pe | +6 pe | −0,83 / +0,19  |
| Stark mot fasta | 16 | 1,88–1,19 | +0,44 | +0,35 (+1,2) | −2 pe | +13 pe | +0,38 / +0,32 ✔ |
| Medel mot fasta | 48 | 1,35–0,96 | +0,06 | −0,03 (−0,2) | −5 pe | −10 pe | −0,15 / +0,13  |
| Svag mot fasta | 27 | 1,52–1,19 | −0,05 | −0,14 (−0,6) | +3 pe | −3 pe | −0,66 / +0,16  |

- Svårast mot **Direktspel** (−0,54 p/match rel. eget snitt, z −1,7, 15 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,37 p/match rel. eget snitt, z +1,2, 18 m) – åt samma håll i båda halvorna men svagt

### Oxford

Egen stil 2023/24 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 57,7 %). 282 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (6 m): 0,17 mål för (xG 0,13), 0,50 emot (xG 0,45), 4,33 hörnor.

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
| Svag på fasta | 114 | 1,44–1,32 | −0,05 | −0,04 (−0,4) | −6 pe | +4 pe | −0,18 / +0,18  |
| Medel på fasta | 116 | 1,29–1,28 | +0,03 | +0,03 (+0,3) | −3 pe | −1 pe | +0,08 / −0,01  |
| Farlig på fasta | 52 | 1,54–1,13 | +0,03 | +0,03 (+0,2) | +15 pe | +2 pe | −0,19 / +0,17  |
| Stark mot fasta | 104 | 1,28–1,13 | −0,07 | −0,07 (−0,6) | −1 pe | −4 pe | −0,14 / +0,01  |
| Medel mot fasta | 117 | 1,51–1,38 | +0,07 | +0,08 (+0,7) | −1 pe | +6 pe | +0,02 / +0,12 ✔ |
| Svag mot fasta | 61 | 1,38–1,30 | −0,03 | −0,03 (−0,2) | +0 pe | +3 pe | −0,17 / +0,17  |

- Svårast mot **Högpress** (−0,16 p/match rel. eget snitt, z −1,3, 95 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,15 p/match rel. eget snitt, z +1,4, 119 m) – åt samma håll i båda halvorna men svagt

### Peterboro

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 57,6 %). 284 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,31), 0,63 emot (xG 0,31), 5,25 hörnor · 2025/26 (46 m): 0,28 mål för (xG 0,31), 0,39 emot (xG 0,39), 4,41 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 102 | 1,57–1,50 | −0,03 | +0,00 (+0,0) | −6 pe | +10 pe | +0,19 / −0,11  |
| Balanserat | 113 | 1,48–1,44 | −0,15 | −0,12 (−1,0) | −8 pe | +4 pe | −0,12 / −0,11 ✔ |
| Bollinnehav | 69 | 1,43–1,36 | +0,16 | +0,19 (+1,3) | −3 pe | +4 pe | +0,34 / −0,01  |
| Kortpass | 65 | 1,52–1,48 | +0,02 | +0,05 (+0,3) | −1 pe | +6 pe | +0,28 / −0,06  |
| Blandat | 138 | 1,38–1,49 | −0,08 | −0,05 (−0,5) | −9 pe | +4 pe | +0,13 / −0,23  |
| Direktspel | 81 | 1,68–1,33 | +0,01 | +0,04 (+0,3) | −6 pe | +10 pe | −0,05 / +0,21  |
| Lågpress | 64 | 1,36–1,58 | −0,16 | −0,13 (−0,8) | −7 pe | +6 pe | −0,00 / −0,23 ✔ |
| Mellanpress | 117 | 1,50–1,18 | +0,13 | +0,16 (+1,4) | −5 pe | −0 pe | +0,23 / +0,06 ✔ |
| Högpress | 103 | 1,59–1,66 | −0,13 | −0,10 (−0,9) | −7 pe | +14 pe | −0,07 / −0,13 ✔ |
| Svag på fasta | 96 | 1,66–1,30 | +0,02 | +0,05 (+0,4) | −9 pe | +8 pe | −0,02 / +0,23  |
| Medel på fasta | 129 | 1,35–1,47 | −0,09 | −0,06 (−0,5) | −3 pe | +3 pe | +0,23 / −0,24  |
| Farlig på fasta | 59 | 1,58–1,63 | +0,01 | +0,04 (+0,3) | −8 pe | +11 pe | +0,09 / +0,01 ✔ |
| Stark mot fasta | 99 | 1,56–1,48 | −0,04 | −0,01 (−0,1) | −6 pe | +7 pe | +0,01 / −0,03  |
| Medel mot fasta | 134 | 1,54–1,49 | −0,03 | +0,00 (+0,0) | −6 pe | +8 pe | +0,04 / −0,03  |
| Svag mot fasta | 51 | 1,29–1,24 | −0,01 | +0,02 (+0,1) | −6 pe | −0 pe | +0,35 / −0,39  |

- Svårast mot **Balanserat** (−0,12 p/match rel. eget snitt, z −1,0, 113 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,16 p/match rel. eget snitt, z +1,4, 117 m) – åt samma håll i båda halvorna men svagt

### Plymouth

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 42,8 %). 284 matcher med stil, mot marknaden totalt +0,21 per match.

Fasta situationer per match: 2026/27 (9 m): 0,56 mål för (xG 0,61), 0,22 emot (xG 0,22), 5,67 hörnor · 2025/26 (46 m): 0,65 mål för (xG 0,61), 0,28 emot (xG 0,29), 5,57 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,43–1,36 | +0,25 | +0,04 (+0,3) | −7 pe | +2 pe | −0,02 / +0,09  |
| Balanserat | 122 | 1,39–1,50 | +0,17 | −0,04 (−0,4) | −3 pe | −0 pe | +0,16 / −0,23  |
| Bollinnehav | 73 | 1,44–1,41 | +0,24 | +0,02 (+0,1) | +1 pe | +0 pe | +0,05 / −0,01  |
| Kortpass | 86 | 1,29–1,71 | +0,20 | −0,01 (−0,1) | −4 pe | +4 pe | +0,58 / −0,22  |
| Blandat | 121 | 1,59–1,42 | +0,24 | +0,02 (+0,2) | −1 pe | +5 pe | −0,02 / +0,05  |
| Direktspel | 77 | 1,29–1,14 | +0,19 | −0,02 (−0,2) | −5 pe | −10 pe | −0,02 / −0,04 ✔ |
| Lågpress | 47 | 1,66–1,15 | +0,46 | +0,25 (+1,3) | −11 pe | −1 pe | +0,25 / +0,25 ✔ |
| Mellanpress | 133 | 1,41–1,59 | +0,10 | −0,11 (−1,0) | −0 pe | +3 pe | −0,06 / −0,15 ✔ |
| Högpress | 104 | 1,31–1,36 | +0,24 | +0,03 (+0,2) | −3 pe | −2 pe | +0,16 / −0,09  |
| Svag på fasta | 106 | 1,55–1,26 | +0,40 | +0,18 (+1,6) | +0 pe | −3 pe | +0,25 / +0,04 ✔ |
| Medel på fasta | 113 | 1,26–1,58 | +0,08 | −0,13 (−1,1) | −5 pe | +3 pe | −0,34 / +0,02  |
| Farlig på fasta | 65 | 1,48–1,46 | +0,14 | −0,07 (−0,5) | −6 pe | +3 pe | +0,36 / −0,33  |
| Stark mot fasta | 90 | 1,44–1,42 | +0,18 | −0,03 (−0,3) | −4 pe | +1 pe | +0,12 / −0,23  |
| Medel mot fasta | 129 | 1,44–1,50 | +0,21 | −0,00 (−0,0) | −0 pe | +3 pe | +0,04 / −0,04  |
| Svag mot fasta | 65 | 1,32–1,31 | +0,27 | +0,05 (+0,3) | −9 pe | −5 pe | +0,07 / +0,04 ✔ |

- Svårast mot **Medel på fasta** (−0,13 p/match rel. eget snitt, z −1,1, 113 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,18 p/match rel. eget snitt, z +1,6, 106 m) – åt samma håll i båda halvorna men svagt

### Reading

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 49,7 %). 363 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,63 mål för (xG 0,47), 0,25 emot (xG 0,13), 5,75 hörnor · 2025/26 (46 m): 0,26 mål för (xG 0,33), 0,39 emot (xG 0,31), 3,89 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 138 | 1,23–1,26 | +0,06 | +0,01 (+0,1) | −1 pe | +1 pe | −0,10 / +0,10  |
| Balanserat | 142 | 1,32–1,51 | +0,00 | −0,05 (−0,5) | −1 pe | +11 pe | −0,02 / −0,07 ✔ |
| Bollinnehav | 83 | 1,29–1,58 | +0,12 | +0,07 (+0,5) | +0 pe | −0 pe | +0,01 / +0,15 ✔ |
| Kortpass | 69 | 1,45–1,64 | +0,15 | +0,10 (+0,7) | −2 pe | +8 pe | +0,18 / +0,08 ✔ |
| Blandat | 158 | 1,25–1,51 | −0,03 | −0,08 (−0,8) | +0 pe | +4 pe | −0,24 / +0,06  |
| Direktspel | 136 | 1,24–1,24 | +0,09 | +0,04 (+0,3) | −2 pe | +2 pe | +0,07 / −0,05  |
| Lågpress | 107 | 1,36–1,31 | +0,08 | +0,03 (+0,3) | −3 pe | +3 pe | −0,20 / +0,38  |
| Mellanpress | 132 | 1,27–1,52 | +0,02 | −0,03 (−0,3) | +0 pe | +10 pe | +0,03 / −0,11  |
| Högpress | 124 | 1,23–1,44 | +0,06 | +0,01 (+0,1) | −1 pe | −1 pe | +0,07 / −0,02  |
| Svag på fasta | 116 | 1,14–1,50 | +0,03 | −0,02 (−0,2) | −0 pe | +5 pe | −0,11 / +0,10  |
| Medel på fasta | 154 | 1,33–1,38 | +0,09 | +0,04 (+0,4) | −3 pe | +3 pe | −0,07 / +0,12  |
| Farlig på fasta | 93 | 1,38–1,43 | +0,01 | −0,04 (−0,3) | +1 pe | +5 pe | +0,08 / −0,19  |
| Stark mot fasta | 107 | 1,45–1,44 | +0,12 | +0,07 (+0,6) | −2 pe | +12 pe | +0,07 / +0,06 ✔ |
| Medel mot fasta | 183 | 1,12–1,38 | −0,02 | −0,07 (−0,8) | −0 pe | −2 pe | −0,17 / +0,02  |
| Svag mot fasta | 73 | 1,44–1,53 | +0,12 | +0,07 (+0,5) | −1 pe | +9 pe | +0,06 / +0,09 ✔ |

- Svårast mot **Blandat** (−0,08 p/match rel. eget snitt, z −0,8, 158 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,10 p/match rel. eget snitt, z +0,7, 69 m) – åt samma håll i båda halvorna men svagt

### Sheffield Weds

Egen stil 2022/23 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 54,3 %). 363 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,31), 0,14 emot (xG 0,29), 6,71 hörnor.

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
| Svag på fasta | 147 | 1,27–1,21 | −0,08 | −0,04 (−0,4) | +1 pe | −2 pe | −0,06 / −0,02 ✔ |
| Medel på fasta | 122 | 1,11–1,43 | +0,02 | +0,05 (+0,5) | +2 pe | +0 pe | +0,16 / −0,05  |
| Farlig på fasta | 94 | 1,29–1,49 | −0,04 | −0,00 (−0,0) | −6 pe | +6 pe | −0,05 / +0,06  |
| Stark mot fasta | 122 | 1,33–1,30 | −0,05 | −0,02 (−0,1) | +1 pe | +4 pe | −0,14 / +0,06  |
| Medel mot fasta | 154 | 1,11–1,43 | −0,03 | +0,01 (+0,1) | −4 pe | +1 pe | +0,07 / −0,06  |
| Svag mot fasta | 87 | 1,25–1,31 | −0,02 | +0,01 (+0,1) | +3 pe | −3 pe | +0,05 / −0,08  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,8, 128 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,12 p/match rel. eget snitt, z +1,1, 122 m) – åt samma håll i båda halvorna men svagt

### Stevenage

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 43,8 %). 271 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,86 mål för (xG 0,41), 0,57 emot (xG 0,20), 4,14 hörnor · 2025/26 (46 m): 0,46 mål för (xG 0,46), 0,24 emot (xG 0,24), 4,39 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 81 | 0,94–1,09 | −0,14 | −0,13 (−1,0) | −3 pe | −3 pe | −0,48 / +0,05  |
| Balanserat | 127 | 1,20–1,08 | +0,14 | +0,15 (+1,4) | +1 pe | +1 pe | +0,13 / +0,17 ✔ |
| Bollinnehav | 63 | 0,98–0,97 | −0,14 | −0,13 (−0,9) | +8 pe | −9 pe | +0,06 / −0,29  |
| Kortpass | 62 | 1,05–1,00 | −0,03 | −0,02 (−0,2) | +0 pe | −7 pe | +0,43 / −0,13  |
| Blandat | 143 | 1,13–1,16 | −0,01 | +0,00 (+0,0) | −0 pe | +1 pe | −0,07 / +0,08  |
| Direktspel | 66 | 0,97–0,88 | +0,01 | +0,02 (+0,2) | +4 pe | −7 pe | −0,02 / +0,13  |
| Lågpress | 69 | 1,04–0,96 | +0,06 | +0,07 (+0,5) | +4 pe | −13 pe | +0,06 / +0,09 ✔ |
| Mellanpress | 100 | 0,99–1,09 | −0,03 | −0,02 (−0,1) | −3 pe | −1 pe | −0,01 / −0,02 ✔ |
| Högpress | 102 | 1,17–1,09 | −0,04 | −0,03 (−0,3) | +3 pe | +2 pe | −0,06 / −0,01 ✔ |
| Svag på fasta | 93 | 1,22–0,88 | +0,17 | +0,18 (+1,4) | −5 pe | −6 pe | +0,24 / +0,05 ✔ |
| Medel på fasta | 124 | 1,01–1,08 | −0,09 | −0,08 (−0,8) | +10 pe | −5 pe | −0,14 / −0,05 ✔ |
| Farlig på fasta | 54 | 0,96–1,30 | −0,13 | −0,12 (−0,7) | −9 pe | +8 pe | −0,48 / +0,11  |
| Stark mot fasta | 94 | 1,04–1,06 | −0,11 | −0,10 (−0,8) | −5 pe | +1 pe | −0,03 / −0,22 ✔ |
| Medel mot fasta | 115 | 1,11–1,06 | −0,00 | +0,01 (+0,1) | +7 pe | −4 pe | −0,09 / +0,07  |
| Svag mot fasta | 62 | 1,03–1,03 | +0,13 | +0,14 (+0,9) | +0 pe | −6 pe | +0,12 / +0,16 ✔ |

- Svårast mot **Backar hem** (−0,13 p/match rel. eget snitt, z −1,0, 81 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,18 p/match rel. eget snitt, z +1,4, 93 m) – åt samma håll i båda halvorna men svagt

### Stockport

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 58,4 %). 142 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,49), 0,38 emot (xG 0,24), 6,88 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,40), 0,35 emot (xG 0,33), 5,20 hörnor.

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
| Svag på fasta | 28 | 1,71–0,96 | +0,13 | +0,02 (+0,1) | −0 pe | −8 pe | +0,36 / −0,58  |
| Medel på fasta | 83 | 1,72–1,13 | +0,05 | −0,05 (−0,4) | +2 pe | +3 pe | −0,14 / +0,05  |
| Farlig på fasta | 31 | 1,68–1,03 | +0,22 | +0,11 (+0,5) | −9 pe | +11 pe | −0,13 / +0,19  |
| Stark mot fasta | 40 | 1,95–1,25 | +0,07 | −0,03 (−0,2) | −5 pe | +9 pe | −0,09 / +0,11  |
| Medel mot fasta | 74 | 1,70–0,91 | +0,22 | +0,11 (+0,8) | −4 pe | +2 pe | +0,08 / +0,14 ✔ |
| Svag mot fasta | 28 | 1,39–1,29 | −0,15 | −0,25 (−1,2) | +14 pe | −4 pe | −0,12 / −0,31 ✔ |

- Svårast mot **Svag mot fasta** (−0,25 p/match rel. eget snitt, z −1,2, 28 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,25 p/match rel. eget snitt, z +1,2, 26 m) – åt samma håll i båda halvorna men svagt

### Wigan

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,7 %). 323 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,49), 0,57 emot (xG 0,60), 5,71 hörnor · 2025/26 (46 m): 0,28 mål för (xG 0,36), 0,33 emot (xG 0,24), 5,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 123 | 1,13–1,20 | +0,10 | +0,06 (+0,6) | −2 pe | −3 pe | +0,09 / +0,04 ✔ |
| Balanserat | 118 | 1,27–1,27 | +0,04 | +0,00 (+0,0) | −0 pe | +1 pe | +0,09 / −0,10  |
| Bollinnehav | 82 | 1,15–1,32 | −0,06 | −0,09 (−0,7) | −1 pe | −5 pe | −0,16 / −0,02 ✔ |
| Kortpass | 77 | 1,14–1,13 | +0,02 | −0,01 (−0,1) | −1 pe | −8 pe | +0,15 / −0,09  |
| Blandat | 134 | 1,12–1,37 | −0,14 | −0,17 (−1,7) | +1 pe | −1 pe | −0,32 / −0,05 ✔ |
| Direktspel | 112 | 1,29–1,21 | +0,25 | +0,21 (+1,8) | −4 pe | +1 pe | +0,24 / +0,14 ✔ |
| Lågpress | 78 | 1,41–1,17 | +0,14 | +0,10 (+0,7) | +0 pe | +2 pe | +0,18 / +0,00 ✔ |
| Mellanpress | 122 | 1,13–1,36 | −0,00 | −0,04 (−0,3) | −5 pe | −0 pe | −0,11 / +0,05  |
| Högpress | 123 | 1,10–1,21 | +0,01 | −0,03 (−0,2) | +2 pe | −6 pe | +0,06 / −0,09  |
| Svag på fasta | 101 | 1,36–1,50 | −0,05 | −0,09 (−0,7) | −3 pe | +7 pe | −0,19 / +0,09  |
| Medel på fasta | 155 | 1,02–1,19 | −0,04 | −0,08 (−0,8) | +0 pe | −9 pe | +0,00 / −0,14  |
| Farlig på fasta | 67 | 1,31–1,04 | +0,34 | +0,31 (+2,1) | −2 pe | +1 pe | +0,57 / +0,14 ✔ ⚑ |
| Stark mot fasta | 90 | 1,14–1,17 | +0,01 | −0,03 (−0,2) | +3 pe | −4 pe | −0,06 / +0,01  |
| Medel mot fasta | 159 | 1,25–1,26 | +0,03 | −0,00 (−0,0) | −2 pe | +0 pe | −0,02 / +0,01  |
| Svag mot fasta | 74 | 1,11–1,35 | +0,07 | +0,04 (+0,3) | −3 pe | −5 pe | +0,17 / −0,17  |

- Svårast mot **Blandat** (−0,17 p/match rel. eget snitt, z −1,7, 134 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,31 p/match rel. eget snitt, z +2,1, 67 m) – ⚑ håller i båda halvorna

### Wycombe

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,5 %). 284 matcher med stil, mot marknaden totalt +0,07 per match.

Fasta situationer per match: 2026/27 (8 m): 1,00 mål för (xG 0,69), 0,25 emot (xG 0,30), 5,50 hörnor · 2025/26 (46 m): 0,43 mål för (xG 0,46), 0,24 emot (xG 0,24), 5,52 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 100 | 1,41–1,17 | +0,02 | −0,05 (−0,4) | −4 pe | +1 pe | −0,12 / +0,00  |
| Balanserat | 104 | 1,32–1,23 | +0,06 | −0,01 (−0,1) | +7 pe | −4 pe | −0,05 / +0,05  |
| Bollinnehav | 80 | 1,34–1,25 | +0,14 | +0,07 (+0,5) | −5 pe | −1 pe | +0,33 / −0,26  |
| Kortpass | 78 | 1,41–1,05 | +0,09 | +0,02 (+0,1) | −2 pe | −5 pe | +0,37 / −0,16  |
| Blandat | 124 | 1,26–1,35 | −0,02 | −0,09 (−0,8) | −2 pe | −0 pe | −0,14 / −0,05 ✔ |
| Direktspel | 82 | 1,45–1,16 | +0,18 | +0,11 (+0,8) | +4 pe | +0 pe | +0,07 / +0,20 ✔ |
| Lågpress | 75 | 1,39–1,25 | −0,03 | −0,10 (−0,7) | +1 pe | −2 pe | +0,10 / −0,30  |
| Mellanpress | 113 | 1,34–1,35 | +0,11 | +0,03 (+0,3) | −1 pe | −2 pe | −0,03 / +0,12  |
| Högpress | 96 | 1,35–1,03 | +0,11 | +0,04 (+0,3) | −1 pe | −2 pe | +0,12 / −0,02  |
| Svag på fasta | 105 | 1,23–1,28 | −0,02 | −0,09 (−0,8) | −3 pe | −4 pe | −0,06 / −0,18 ✔ |
| Medel på fasta | 105 | 1,51–1,21 | +0,08 | +0,01 (+0,1) | +4 pe | +1 pe | +0,06 / −0,00  |
| Farlig på fasta | 74 | 1,31–1,14 | +0,19 | +0,12 (+0,8) | −2 pe | −3 pe | +0,23 / −0,03  |
| Stark mot fasta | 94 | 1,26–1,18 | +0,11 | +0,04 (+0,3) | −2 pe | −8 pe | −0,02 / +0,14  |
| Medel mot fasta | 129 | 1,43–1,18 | +0,11 | +0,04 (+0,4) | −3 pe | +1 pe | +0,15 / −0,03  |
| Svag mot fasta | 61 | 1,36–1,34 | −0,08 | −0,15 (−1,0) | +8 pe | +2 pe | +0,02 / −0,33  |

- Svårast mot **Svag mot fasta** (−0,15 p/match rel. eget snitt, z −1,0, 61 m) – inte stabilt, troligen slump
- Bäst mot **Farlig på fasta** (+0,12 p/match rel. eget snitt, z +0,8, 74 m) – inte stabilt, troligen slump
