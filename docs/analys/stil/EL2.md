# Stilmatchning – League Two (EL2)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2850 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 407 m · hemma +0,08 · kryss −3 pe · ö2,5 −2 pe | 483 m · hemma −0,03 · kryss +1 pe · ö2,5 −4 pe | 209 m · hemma −0,03 · kryss −3 pe · ö2,5 +1 pe |
| **Mellan** | 488 m · hemma +0,07 · kryss +0 pe · ö2,5 +0 pe | 541 m · hemma −0,06 · kryss +0 pe · ö2,5 −0 pe | 218 m · hemma +0,04 · kryss −2 pe · ö2,5 +2 pe |
| **Mycket boll** | 203 m · hemma +0,02 · kryss −3 pe · ö2,5 +4 pe | 224 m · hemma −0,07 · kryss +4 pe · ö2,5 −1 pe | 77 m · hemma −0,09 · kryss +8 pe · ö2,5 −2 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 183 m · hemma +0,09 · kryss −1 pe · ö2,5 +3 pe | 383 m · hemma +0,12 · kryss −0 pe · ö2,5 −4 pe | 184 m · hemma −0,09 · kryss +0 pe · ö2,5 −0 pe |
| **Balanserat** | 381 m · hemma +0,05 · kryss −3 pe · ö2,5 −5 pe | 735 m · hemma −0,05 · kryss +1 pe · ö2,5 +1 pe | 330 m · hemma +0,00 · kryss −2 pe · ö2,5 +2 pe |
| **Bollinnehav** | 183 m · hemma −0,10 · kryss +0 pe · ö2,5 +5 pe | 330 m · hemma −0,02 · kryss +0 pe · ö2,5 −3 pe | 141 m · hemma +0,00 · kryss +1 pe · ö2,5 +2 pe |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 900 m · mot marknaden −0,07 (z −1,6) · mål 1,18 · ö2,5 −1 pe | 660 m · mot marknaden +0,03 (z +0,7) · mål 1,28 · ö2,5 −1 pe | 414 m · mot marknaden +0,10 (z +1,6) · mål 1,35 · ö2,5 −1 pe |
| **Medel på fasta** | 762 m · mot marknaden +0,03 (z +0,7) · mål 1,26 · ö2,5 −0 pe | 1039 m · mot marknaden +0,03 (z +0,9) · mål 1,30 · ö2,5 −0 pe | 673 m · mot marknaden −0,12 (z −2,5) · mål 1,19 · ö2,5 −0 pe |
| **Farlig på fasta** | 312 m · mot marknaden +0,03 (z +0,4) · mål 1,29 · ö2,5 +1 pe | 499 m · mot marknaden +0,03 (z +0,5) · mål 1,25 · ö2,5 −2 pe | 441 m · mot marknaden +0,00 (z +0,0) · mål 1,27 · ö2,5 −1 pe |

## Lag (säsong 2026/27)

### Accrington

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 46,0 %). 272 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,47), 0,33 emot (xG 0,48), 4,44 hörnor · 2025/26 (46 m): 0,26 mål för (xG 0,39), 0,37 emot (xG 0,40), 4,15 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 81 | 1,17–1,35 | −0,07 | −0,08 (−0,6) | +5 pe | −2 pe | −0,01 / −0,15 ✔ |
| Balanserat | 108 | 1,30–1,50 | +0,13 | +0,11 (+1,0) | +0 pe | +2 pe | +0,22 / +0,01 ✔ |
| Bollinnehav | 83 | 1,12–1,73 | −0,06 | −0,07 (−0,5) | −7 pe | +5 pe | −0,20 / +0,07  |
| Kortpass | 73 | 1,08–1,73 | −0,13 | −0,15 (−1,0) | −6 pe | +2 pe | −0,30 / −0,06 ✔ |
| Blandat | 111 | 1,26–1,39 | +0,18 | +0,16 (+1,4) | +1 pe | +3 pe | +0,28 / +0,06 ✔ |
| Direktspel | 88 | 1,24–1,53 | −0,07 | −0,08 (−0,6) | +2 pe | −0 pe | −0,06 / −0,12 ✔ |
| Lågpress | 77 | 1,19–1,74 | −0,10 | −0,12 (−0,9) | +4 pe | +9 pe | −0,44 / +0,14  |
| Mellanpress | 117 | 1,26–1,37 | +0,14 | +0,13 (+1,1) | +0 pe | −1 pe | +0,34 / −0,12  |
| Högpress | 78 | 1,14–1,55 | −0,06 | −0,07 (−0,5) | −6 pe | −2 pe | −0,08 / −0,07 ✔ |
| Svag på fasta | 104 | 1,08–1,63 | +0,06 | +0,05 (+0,4) | −6 pe | +5 pe | +0,02 / +0,10 ✔ |
| Medel på fasta | 110 | 1,40–1,56 | −0,01 | −0,02 (−0,2) | +3 pe | +2 pe | +0,11 / −0,11  |
| Farlig på fasta | 58 | 1,07–1,28 | −0,04 | −0,05 (−0,3) | +2 pe | −5 pe | −0,20 / +0,01  |
| Stark mot fasta | 86 | 1,08–1,58 | −0,07 | −0,09 (−0,7) | −2 pe | −0 pe | −0,04 / −0,15 ✔ |
| Medel mot fasta | 112 | 1,31–1,47 | +0,05 | +0,03 (+0,3) | +4 pe | +5 pe | +0,06 / +0,01 ✔ |
| Svag mot fasta | 74 | 1,19–1,54 | +0,06 | +0,05 (+0,3) | −6 pe | −2 pe | +0,06 / +0,04 ✔ |

- Svårast mot **Kortpass** (−0,15 p/match rel. eget snitt, z −1,0, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,16 p/match rel. eget snitt, z +1,4, 111 m) – åt samma håll i båda halvorna men svagt

### Barnet

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 51,2 %). 7 matcher med stil, mot marknaden totalt +0,44 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,57), 0,43 emot (xG 0,44), 6,71 hörnor · 2025/26 (46 m): 0,59 mål för (xG 0,56), 0,24 emot (xG 0,22), 6,87 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 3,00–1,00 | +1,30 | +0,86 (+8,6) | −27 pe | +52 pe | +0,86 / –  |
| Balanserat | 3 | 2,67–1,00 | +1,17 | +0,73 (+5,4) | −24 pe | +46 pe | +1,05 / +0,57  |
| Bollinnehav | 3 | 2,00–2,00 | −0,58 | −1,02 (−4,7) | +75 pe | +12 pe | −1,50 / −0,78  |
| Kortpass | 3 | 2,00–2,00 | −0,58 | −1,02 (−4,7) | +75 pe | +12 pe | −1,50 / −0,78  |
| Blandat | 2 | 2,50–1,00 | +1,01 | +0,57 (+8,1) | −23 pe | +44 pe | – / +0,57  |
| Direktspel | 2 | 3,00–1,00 | +1,40 | +0,96 (+13,5) | −27 pe | +51 pe | +0,96 / –  |
| Lågpress | 5 | 2,80–1,60 | +0,53 | +0,09 (+0,2) | +14 pe | +48 pe | +0,14 / +0,02  |
| Mellanpress | 2 | 1,50–1,00 | +0,21 | −0,23 (−0,4) | +26 pe | −8 pe | – / −0,23  |
| Medel på fasta | 5 | 2,20–1,60 | +0,06 | −0,38 (−1,0) | +36 pe | +24 pe | −1,50 / −0,10  |
| Farlig på fasta | 2 | 3,00–1,00 | +1,40 | +0,96 (+13,5) | −27 pe | +51 pe | +0,96 / –  |
| Medel mot fasta | 1 | 3,00–1,00 | +1,30 | +0,86 (+8,6) | −27 pe | +52 pe | +0,86 / –  |
| Svag mot fasta | 6 | 2,33–1,50 | +0,30 | −0,14 (−0,4) | +25 pe | +29 pe | −0,23 / −0,10  |

### Bristol Rvs

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 46,2 %). 275 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,57), 0,22 emot (xG 0,08), 6,00 hörnor · 2025/26 (46 m): 0,39 mål för (xG 0,40), 0,43 emot (xG 0,30), 4,61 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,19–1,38 | +0,00 | +0,01 (+0,0) | −10 pe | +1 pe | +0,05 / −0,02  |
| Balanserat | 112 | 1,22–1,37 | +0,07 | +0,07 (+0,6) | −8 pe | −1 pe | +0,05 / +0,10 ✔ |
| Bollinnehav | 74 | 1,14–1,66 | −0,12 | −0,11 (−0,8) | −9 pe | −4 pe | −0,12 / −0,11 ✔ |
| Kortpass | 64 | 1,14–1,55 | +0,04 | +0,05 (+0,3) | −11 pe | −4 pe | +0,05 / +0,05 ✔ |
| Blandat | 126 | 1,28–1,47 | +0,02 | +0,02 (+0,2) | −8 pe | +1 pe | −0,12 / +0,19  |
| Direktspel | 85 | 1,09–1,35 | −0,07 | −0,07 (−0,5) | −8 pe | −3 pe | +0,16 / −0,39  |
| Lågpress | 72 | 1,47–1,43 | +0,15 | +0,16 (+1,1) | −8 pe | +1 pe | +0,01 / +0,27 ✔ |
| Mellanpress | 105 | 1,15–1,41 | +0,07 | +0,07 (+0,6) | −12 pe | −3 pe | +0,21 / −0,09  |
| Högpress | 98 | 1,02–1,51 | −0,20 | −0,19 (−1,6) | −6 pe | −1 pe | −0,23 / −0,16 ✔ |
| Svag på fasta | 98 | 1,15–1,55 | −0,07 | −0,07 (−0,5) | −2 pe | −5 pe | −0,03 / −0,15 ✔ |
| Medel på fasta | 112 | 1,11–1,45 | −0,00 | +0,00 (+0,0) | −11 pe | −1 pe | +0,01 / −0,01  |
| Farlig på fasta | 65 | 1,38–1,31 | +0,09 | +0,10 (+0,6) | −15 pe | +3 pe | +0,11 / +0,09 ✔ |
| Stark mot fasta | 94 | 1,15–1,52 | −0,04 | −0,04 (−0,3) | −8 pe | +0 pe | +0,03 / −0,11  |
| Medel mot fasta | 116 | 1,22–1,41 | +0,10 | +0,11 (+0,9) | −12 pe | +0 pe | +0,16 / +0,07 ✔ |
| Svag mot fasta | 65 | 1,20–1,43 | −0,14 | −0,14 (−1,0) | −5 pe | −6 pe | −0,27 / +0,01  |

- Svårast mot **Högpress** (−0,19 p/match rel. eget snitt, z −1,6, 98 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,16 p/match rel. eget snitt, z +1,1, 72 m) – åt samma håll i båda halvorna men svagt

### Cheltenham

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 44,7 %). 271 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,16), 0,44 emot (xG 0,47), 4,11 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,27), 0,56 emot (xG 0,40), 4,20 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 1,34–1,25 | +0,14 | +0,06 (+0,4) | +2 pe | +2 pe | −0,00 / +0,12  |
| Balanserat | 116 | 1,18–1,36 | +0,20 | +0,12 (+1,1) | −4 pe | −1 pe | +0,17 / +0,08 ✔ |
| Bollinnehav | 79 | 1,15–1,70 | −0,16 | −0,24 (−1,8) | −2 pe | +5 pe | −0,27 / −0,21 ✔ |
| Kortpass | 64 | 1,14–1,97 | −0,24 | −0,32 (−2,3) | −9 pe | +7 pe | −0,37 / −0,30 ✔ ⚑ |
| Blandat | 125 | 1,18–1,22 | +0,18 | +0,10 (+0,9) | +3 pe | −4 pe | +0,06 / +0,13 ✔ |
| Direktspel | 82 | 1,34–1,33 | +0,17 | +0,10 (+0,7) | −3 pe | +6 pe | +0,05 / +0,19 ✔ |
| Lågpress | 74 | 1,23–1,46 | +0,08 | +0,00 (+0,0) | −1 pe | −2 pe | +0,04 / −0,03  |
| Mellanpress | 105 | 1,14–1,57 | −0,06 | −0,14 (−1,2) | +2 pe | +7 pe | −0,26 / −0,02 ✔ |
| Högpress | 92 | 1,29–1,24 | +0,23 | +0,15 (+1,2) | −6 pe | −2 pe | +0,21 / +0,09 ✔ |
| Svag på fasta | 98 | 1,18–1,49 | +0,03 | −0,04 (−0,4) | −6 pe | +4 pe | +0,13 / −0,44  |
| Medel på fasta | 105 | 1,30–1,53 | +0,05 | −0,03 (−0,2) | −2 pe | +7 pe | −0,22 / +0,09  |
| Farlig på fasta | 68 | 1,15–1,18 | +0,19 | +0,11 (+0,8) | +7 pe | −10 pe | −0,06 / +0,22  |
| Stark mot fasta | 88 | 0,99–1,42 | −0,12 | −0,20 (−1,6) | +0 pe | −2 pe | −0,13 / −0,30 ✔ |
| Medel mot fasta | 112 | 1,34–1,32 | +0,26 | +0,19 (+1,5) | −2 pe | +2 pe | +0,29 / +0,11 ✔ |
| Svag mot fasta | 71 | 1,31–1,61 | +0,03 | −0,05 (−0,3) | −4 pe | +5 pe | −0,23 / +0,14  |

- Svårast mot **Kortpass** (−0,32 p/match rel. eget snitt, z −2,3, 64 m) – ⚑ håller i båda halvorna
- Bäst mot **Medel mot fasta** (+0,19 p/match rel. eget snitt, z +1,5, 112 m) – åt samma håll i båda halvorna men svagt

### Chesterfield

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 58,3 %). 49 matcher med stil, mot marknaden totalt +0,12 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,36), 0,44 emot (xG 0,24), 5,78 hörnor · 2025/26 (46 m): 0,37 mål för (xG 0,31), 0,37 emot (xG 0,27), 5,43 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 18 | 1,33–0,94 | +0,09 | −0,03 (−0,1) | +18 pe | −16 pe | +0,02 / −0,08  |
| Balanserat | 17 | 1,59–1,29 | +0,44 | +0,33 (+0,9) | −16 pe | −2 pe | −0,14 / +0,74  |
| Bollinnehav | 14 | 1,79–1,50 | −0,24 | −0,35 (−1,1) | +25 pe | +11 pe | −0,25 / −0,45 ✔ |
| Kortpass | 18 | 2,17–1,61 | +0,30 | +0,18 (+0,6) | +7 pe | +20 pe | +0,13 / +0,24 ✔ |
| Blandat | 20 | 1,15–1,20 | −0,27 | −0,39 (−1,4) | +8 pe | −14 pe | −0,39 / −0,38 ✔ |
| Direktspel | 11 | 1,27–0,64 | +0,53 | +0,41 (+1,1) | +10 pe | −22 pe | +0,01 / +0,74 ✔ |
| Lågpress | 24 | 1,50–1,13 | −0,04 | −0,16 (−0,6) | +12 pe | −6 pe | −0,04 / −0,24 ✔ |
| Mellanpress | 23 | 1,48–1,30 | +0,17 | +0,05 (+0,2) | +7 pe | −5 pe | −0,25 / +0,52  |
| Högpress | 2 | 3,00–1,50 | +1,44 | +1,32 (+6,2) | −26 pe | +49 pe | +1,02 / +1,63  |
| Svag på fasta | 8 | 2,00–1,75 | +0,18 | +0,07 (+0,2) | +23 pe | +11 pe | −0,38 / +0,82  |
| Medel på fasta | 13 | 1,62–1,23 | +0,02 | −0,10 (−0,2) | −3 pe | −5 pe | +0,59 / −0,52  |
| Farlig på fasta | 28 | 1,39–1,07 | +0,14 | +0,03 (+0,1) | +9 pe | −7 pe | −0,27 / +0,32  |
| Stark mot fasta | 10 | 1,20–1,20 | −0,13 | −0,25 (−0,7) | +22 pe | −18 pe | −0,55 / +0,46  |
| Medel mot fasta | 17 | 1,53–1,53 | −0,29 | −0,41 (−1,4) | +21 pe | +2 pe | −0,46 / −0,37 ✔ |
| Svag mot fasta | 22 | 1,73–1,00 | +0,54 | +0,43 (+1,5) | −8 pe | −1 pe | +0,43 / +0,42 ✔ |

- Svårast mot **Medel mot fasta** (−0,41 p/match rel. eget snitt, z −1,4, 17 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,43 p/match rel. eget snitt, z +1,5, 22 m) – åt samma håll i båda halvorna men svagt

### Colchester

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 53,5 %). 259 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,31), 0,38 emot (xG 0,44), 4,13 hörnor · 2025/26 (46 m): 0,22 mål för (xG 0,36), 0,33 emot (xG 0,35), 4,61 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,03–1,26 | −0,17 | −0,09 (−0,6) | −1 pe | −10 pe | −0,19 / −0,02 ✔ |
| Balanserat | 128 | 1,09–1,35 | −0,16 | −0,08 (−0,8) | +9 pe | −2 pe | −0,01 / −0,17 ✔ |
| Bollinnehav | 61 | 1,26–1,07 | +0,19 | +0,27 (+1,8) | +2 pe | −7 pe | +0,26 / +0,28 ✔ |
| Kortpass | 49 | 1,35–1,18 | +0,13 | +0,21 (+1,1) | −3 pe | −4 pe | +0,27 / +0,19 ✔ |
| Blandat | 137 | 1,07–1,30 | −0,14 | −0,06 (−0,6) | +6 pe | −5 pe | −0,00 / −0,14 ✔ |
| Direktspel | 73 | 1,05–1,23 | −0,11 | −0,03 (−0,2) | +7 pe | −7 pe | −0,04 / −0,01 ✔ |
| Lågpress | 73 | 1,29–1,26 | +0,02 | +0,10 (+0,7) | +2 pe | +1 pe | +0,30 / −0,05  |
| Mellanpress | 94 | 1,12–1,21 | −0,10 | −0,02 (−0,2) | +5 pe | −8 pe | −0,07 / +0,03  |
| Högpress | 92 | 0,98–1,30 | −0,14 | −0,06 (−0,5) | +7 pe | −7 pe | −0,10 / −0,01 ✔ |
| Svag på fasta | 90 | 1,17–1,12 | +0,12 | +0,20 (+1,5) | +1 pe | −5 pe | +0,18 / +0,24 ✔ |
| Medel på fasta | 111 | 1,02–1,28 | −0,19 | −0,11 (−1,1) | +11 pe | −10 pe | −0,07 / −0,15 ✔ |
| Farlig på fasta | 58 | 1,22–1,43 | −0,17 | −0,09 (−0,6) | −0 pe | +4 pe | −0,41 / +0,03  |
| Stark mot fasta | 90 | 1,00–1,20 | −0,09 | −0,01 (−0,1) | +4 pe | −12 pe | +0,10 / −0,18  |
| Medel mot fasta | 101 | 1,11–1,33 | −0,15 | −0,07 (−0,6) | +6 pe | −3 pe | −0,16 / −0,01 ✔ |
| Svag mot fasta | 68 | 1,28–1,24 | +0,03 | +0,11 (+0,8) | +5 pe | +1 pe | +0,06 / +0,16 ✔ |

- Svårast mot **Medel på fasta** (−0,11 p/match rel. eget snitt, z −1,1, 111 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,27 p/match rel. eget snitt, z +1,8, 61 m) – åt samma håll i båda halvorna men svagt

### Crawley Town

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 58,1 %). 262 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,00 mål för (xG 0,30), 0,71 emot (xG 0,60), 4,43 hörnor · 2025/26 (46 m): 0,37 mål för (xG 0,35), 0,50 emot (xG 0,37), 5,48 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 1,17–1,42 | −0,07 | −0,10 (−0,7) | +4 pe | −3 pe | −0,31 / +0,02  |
| Balanserat | 122 | 1,30–1,48 | +0,15 | +0,12 (+1,1) | −5 pe | +4 pe | +0,14 / +0,09 ✔ |
| Bollinnehav | 64 | 1,09–1,58 | −0,10 | −0,12 (−0,8) | +1 pe | −9 pe | +0,27 / −0,47  |
| Kortpass | 55 | 1,09–1,67 | −0,21 | −0,24 (−1,5) | +2 pe | −6 pe | +0,32 / −0,41  |
| Blandat | 134 | 1,15–1,55 | −0,02 | −0,05 (−0,4) | −3 pe | +4 pe | −0,04 / −0,06 ✔ |
| Direktspel | 73 | 1,41–1,23 | +0,28 | +0,26 (+1,8) | +1 pe | −6 pe | +0,23 / +0,30 ✔ |
| Lågpress | 74 | 1,00–1,42 | −0,17 | −0,20 (−1,3) | −6 pe | −7 pe | +0,21 / −0,58  |
| Mellanpress | 98 | 1,13–1,59 | −0,01 | −0,03 (−0,2) | +4 pe | −2 pe | +0,04 / −0,10  |
| Högpress | 90 | 1,47–1,43 | +0,22 | +0,19 (+1,5) | −3 pe | +4 pe | +0,01 / +0,38 ✔ |
| Svag på fasta | 92 | 1,01–1,32 | +0,03 | +0,01 (+0,0) | −0 pe | −4 pe | −0,00 / +0,02  |
| Medel på fasta | 115 | 1,30–1,68 | −0,06 | −0,08 (−0,7) | −3 pe | +1 pe | −0,07 / −0,08 ✔ |
| Farlig på fasta | 55 | 1,36–1,38 | +0,18 | +0,15 (+0,9) | +3 pe | −0 pe | +0,76 / −0,14  |
| Stark mot fasta | 96 | 1,10–1,63 | −0,12 | −0,14 (−1,1) | −5 pe | −0 pe | −0,21 / −0,04 ✔ |
| Medel mot fasta | 100 | 1,29–1,31 | +0,26 | +0,24 (+1,9) | +1 pe | −6 pe | +0,49 / +0,08 ✔ |
| Svag mot fasta | 66 | 1,24–1,56 | −0,14 | −0,17 (−1,1) | +1 pe | +5 pe | +0,06 / −0,42  |

- Svårast mot **Kortpass** (−0,24 p/match rel. eget snitt, z −1,5, 55 m) – inte stabilt, troligen slump
- Bäst mot **Medel mot fasta** (+0,24 p/match rel. eget snitt, z +1,9, 100 m) – åt samma håll i båda halvorna men svagt

### Crewe

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,0 %). 267 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,34), 0,11 emot (xG 0,30), 5,22 hörnor · 2025/26 (46 m): 0,41 mål för (xG 0,41), 0,24 emot (xG 0,36), 4,91 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,20–1,37 | −0,11 | −0,14 (−1,0) | −3 pe | −2 pe | −0,17 / −0,10 ✔ |
| Balanserat | 117 | 1,15–1,20 | +0,13 | +0,11 (+1,0) | +7 pe | −9 pe | +0,06 / +0,16 ✔ |
| Bollinnehav | 64 | 1,13–1,48 | +0,00 | −0,02 (−0,1) | +0 pe | −11 pe | −0,15 / +0,09  |
| Kortpass | 62 | 1,19–1,24 | +0,14 | +0,11 (+0,8) | +4 pe | −12 pe | +0,22 / +0,06 ✔ |
| Blandat | 110 | 1,17–1,29 | +0,04 | +0,02 (+0,1) | +3 pe | −5 pe | −0,11 / +0,12  |
| Direktspel | 95 | 1,12–1,41 | −0,07 | −0,09 (−0,8) | +1 pe | −6 pe | −0,11 / −0,06 ✔ |
| Lågpress | 78 | 1,21–1,37 | +0,03 | +0,00 (+0,0) | +0 pe | −5 pe | −0,04 / +0,04  |
| Mellanpress | 105 | 1,18–1,27 | +0,15 | +0,12 (+1,1) | +3 pe | −6 pe | +0,10 / +0,15 ✔ |
| Högpress | 84 | 1,08–1,35 | −0,13 | −0,16 (−1,2) | +3 pe | −10 pe | −0,28 / −0,03 ✔ |
| Svag på fasta | 96 | 1,17–1,33 | +0,12 | +0,09 (+0,8) | +3 pe | −5 pe | +0,04 / +0,20 ✔ |
| Medel på fasta | 113 | 1,18–1,32 | +0,02 | +0,00 (+0,0) | +1 pe | −6 pe | −0,13 / +0,11  |
| Farlig på fasta | 58 | 1,10–1,31 | −0,13 | −0,15 (−1,0) | +3 pe | −13 pe | −0,23 / −0,13 ✔ |
| Stark mot fasta | 84 | 1,21–1,30 | +0,20 | +0,18 (+1,3) | +5 pe | −1 pe | +0,10 / +0,29 ✔ |
| Medel mot fasta | 114 | 1,12–1,40 | −0,11 | −0,13 (−1,1) | −2 pe | −7 pe | −0,20 / −0,07 ✔ |
| Svag mot fasta | 69 | 1,14–1,22 | +0,02 | +0,00 (+0,0) | +5 pe | −15 pe | −0,07 / +0,06  |

- Svårast mot **Högpress** (−0,16 p/match rel. eget snitt, z −1,2, 84 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,18 p/match rel. eget snitt, z +1,3, 84 m) – åt samma håll i båda halvorna men svagt

### Exeter

Egen stil 2021/22 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 44,7 %). 275 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,43), 0,33 emot (xG 0,20), 4,78 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,09–0,93 | +0,25 | +0,20 (+1,5) | −1 pe | −11 pe | +0,08 / +0,26 ✔ |
| Balanserat | 118 | 1,32–1,25 | −0,03 | −0,08 (−0,7) | −3 pe | +3 pe | +0,08 / −0,30  |
| Bollinnehav | 68 | 1,32–1,63 | −0,07 | −0,12 (−0,9) | +7 pe | +2 pe | −0,12 / −0,12 ✔ |
| Kortpass | 59 | 1,15–1,68 | −0,14 | −0,19 (−1,4) | +9 pe | +3 pe | +0,04 / −0,27  |
| Blandat | 142 | 1,30–1,17 | +0,10 | +0,05 (+0,4) | −5 pe | −2 pe | +0,01 / +0,09 ✔ |
| Direktspel | 74 | 1,23–1,04 | +0,12 | +0,07 (+0,5) | +3 pe | −6 pe | +0,05 / +0,11 ✔ |
| Lågpress | 64 | 1,23–1,28 | +0,04 | −0,01 (−0,1) | +1 pe | −2 pe | +0,17 / −0,16  |
| Mellanpress | 107 | 1,15–1,32 | −0,13 | −0,18 (−1,5) | +0 pe | −3 pe | −0,23 / −0,13 ✔ |
| Högpress | 104 | 1,36–1,14 | +0,24 | +0,19 (+1,6) | −0 pe | +0 pe | +0,20 / +0,17 ✔ |
| Svag på fasta | 92 | 1,36–1,34 | +0,03 | −0,03 (−0,2) | −2 pe | +2 pe | −0,01 / −0,07 ✔ |
| Medel på fasta | 126 | 1,21–1,24 | +0,08 | +0,02 (+0,2) | +2 pe | −1 pe | −0,00 / +0,04  |
| Farlig på fasta | 57 | 1,14–1,11 | +0,04 | −0,01 (−0,1) | −1 pe | −11 pe | +0,16 / −0,14  |
| Stark mot fasta | 98 | 1,23–1,29 | +0,00 | −0,05 (−0,4) | −4 pe | +1 pe | −0,14 / +0,11  |
| Medel mot fasta | 114 | 1,02–1,29 | −0,02 | −0,07 (−0,7) | +4 pe | −7 pe | −0,05 / −0,09 ✔ |
| Svag mot fasta | 63 | 1,68–1,10 | +0,27 | +0,21 (+1,5) | +1 pe | +3 pe | +0,40 / −0,02  |

- Svårast mot **Mellanpress** (−0,18 p/match rel. eget snitt, z −1,5, 107 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,6, 104 m) – åt samma håll i båda halvorna men svagt

### Fleetwood Town

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 50,5 %). 275 matcher med stil, mot marknaden totalt −0,10 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,29), 0,11 emot (xG 0,36), 4,78 hörnor · 2025/26 (46 m): 0,26 mål för (xG 0,36), 0,52 emot (xG 0,34), 4,80 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,25–1,20 | −0,11 | −0,01 (−0,1) | +8 pe | −3 pe | −0,15 / +0,10  |
| Balanserat | 107 | 1,10–1,42 | −0,20 | −0,10 (−0,9) | −0 pe | +2 pe | −0,05 / −0,15 ✔ |
| Bollinnehav | 79 | 1,28–1,34 | +0,05 | +0,15 (+1,1) | +9 pe | −2 pe | +0,21 / +0,07 ✔ |
| Kortpass | 67 | 1,25–1,45 | −0,01 | +0,10 (+0,6) | +1 pe | +2 pe | +0,54 / −0,19  |
| Blandat | 111 | 1,22–1,32 | −0,11 | −0,01 (−0,1) | +3 pe | +4 pe | −0,22 / +0,14  |
| Direktspel | 97 | 1,14–1,26 | −0,15 | −0,05 (−0,4) | +9 pe | −9 pe | −0,05 / −0,05 ✔ |
| Lågpress | 73 | 1,16–1,34 | −0,06 | +0,04 (+0,3) | +7 pe | −3 pe | +0,15 / −0,05  |
| Mellanpress | 112 | 1,10–1,21 | −0,14 | −0,04 (−0,4) | +11 pe | −5 pe | −0,03 / −0,05 ✔ |
| Högpress | 90 | 1,36–1,47 | −0,08 | +0,02 (+0,1) | −4 pe | +4 pe | −0,06 / +0,10  |
| Svag på fasta | 104 | 1,14–1,28 | −0,10 | +0,00 (+0,0) | +5 pe | −1 pe | +0,09 / −0,18  |
| Medel på fasta | 102 | 1,13–1,37 | −0,21 | −0,11 (−1,0) | +7 pe | −1 pe | −0,13 / −0,09 ✔ |
| Farlig på fasta | 69 | 1,39–1,33 | +0,06 | +0,16 (+1,0) | +2 pe | −1 pe | −0,00 / +0,23  |
| Stark mot fasta | 86 | 1,22–1,34 | −0,07 | +0,03 (+0,2) | +7 pe | +3 pe | +0,17 / −0,15  |
| Medel mot fasta | 120 | 1,21–1,27 | −0,05 | +0,05 (+0,4) | +4 pe | −4 pe | −0,10 / +0,17  |
| Svag mot fasta | 69 | 1,16–1,41 | −0,22 | −0,12 (−0,9) | +3 pe | −2 pe | −0,07 / −0,17 ✔ |

- Svårast mot **Medel på fasta** (−0,11 p/match rel. eget snitt, z −1,0, 102 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,15 p/match rel. eget snitt, z +1,1, 79 m) – åt samma håll i båda halvorna men svagt

### Gillingham

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 47,0 %). 266 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,31), 0,56 emot (xG 0,31), 3,56 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,48), 0,54 emot (xG 0,41), 5,07 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 0,99–1,30 | −0,09 | −0,06 (−0,5) | +6 pe | −9 pe | −0,06 / −0,06 ✔ |
| Balanserat | 120 | 0,84–1,15 | −0,10 | −0,07 (−0,7) | +2 pe | −15 pe | −0,04 / −0,10 ✔ |
| Bollinnehav | 69 | 1,28–1,39 | +0,17 | +0,19 (+1,3) | −5 pe | −4 pe | +0,24 / +0,15 ✔ |
| Kortpass | 65 | 1,11–1,32 | +0,05 | +0,08 (+0,5) | −1 pe | −9 pe | +0,10 / +0,07 ✔ |
| Blandat | 113 | 0,96–1,23 | −0,12 | −0,09 (−0,8) | +1 pe | −10 pe | −0,05 / −0,13 ✔ |
| Direktspel | 88 | 0,95–1,24 | +0,03 | +0,06 (+0,5) | +3 pe | −12 pe | +0,07 / +0,04 ✔ |
| Lågpress | 77 | 1,12–1,25 | −0,06 | −0,03 (−0,3) | +7 pe | −6 pe | −0,16 / +0,06  |
| Mellanpress | 109 | 1,06–1,26 | +0,07 | +0,09 (+0,8) | −3 pe | −9 pe | +0,24 / −0,09  |
| Högpress | 80 | 0,80–1,26 | −0,12 | −0,09 (−0,7) | −1 pe | −17 pe | −0,15 / −0,04 ✔ |
| Svag på fasta | 98 | 1,08–1,22 | +0,11 | +0,13 (+1,1) | −1 pe | −6 pe | +0,11 / +0,19 ✔ |
| Medel på fasta | 115 | 0,88–1,10 | −0,03 | −0,01 (−0,1) | −0 pe | −19 pe | +0,08 / −0,07  |
| Farlig på fasta | 53 | 1,09–1,64 | −0,25 | −0,23 (−1,5) | +7 pe | −0 pe | −0,49 / −0,12 ✔ |
| Stark mot fasta | 82 | 0,95–1,23 | −0,01 | +0,02 (+0,1) | +3 pe | −9 pe | +0,01 / +0,02 ✔ |
| Medel mot fasta | 111 | 1,12–1,20 | +0,06 | +0,08 (+0,7) | +1 pe | −7 pe | +0,11 / +0,06 ✔ |
| Svag mot fasta | 73 | 0,86–1,37 | −0,17 | −0,15 (−1,1) | −2 pe | −16 pe | −0,09 / −0,20 ✔ |

- Svårast mot **Farlig på fasta** (−0,23 p/match rel. eget snitt, z −1,5, 53 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,19 p/match rel. eget snitt, z +1,3, 69 m) – åt samma håll i båda halvorna men svagt

### Grimsby

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 55,5 %). 176 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,51), 0,44 emot (xG 0,31), 7,00 hörnor · 2025/26 (46 m): 0,33 mål för (xG 0,43), 0,35 emot (xG 0,24), 6,09 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,43–1,31 | +0,11 | +0,13 (+0,8) | +8 pe | −5 pe | +0,07 / +0,19 ✔ |
| Balanserat | 78 | 1,19–1,46 | −0,07 | −0,04 (−0,3) | −2 pe | +10 pe | −0,34 / +0,30  |
| Bollinnehav | 47 | 1,23–1,34 | −0,09 | −0,07 (−0,4) | −1 pe | −2 pe | +0,04 / −0,17  |
| Kortpass | 46 | 1,28–1,48 | −0,13 | −0,11 (−0,5) | −13 pe | +7 pe | −0,15 / −0,09 ✔ |
| Blandat | 83 | 1,30–1,23 | +0,06 | +0,09 (+0,7) | +9 pe | +3 pe | −0,07 / +0,25  |
| Direktspel | 47 | 1,21–1,57 | −0,08 | −0,05 (−0,3) | +2 pe | −3 pe | −0,20 / +0,30  |
| Lågpress | 50 | 1,44–1,44 | −0,10 | −0,08 (−0,4) | −3 pe | +10 pe | +0,02 / −0,13  |
| Mellanpress | 68 | 1,38–1,16 | +0,18 | +0,21 (+1,3) | +6 pe | −2 pe | −0,07 / +0,40  |
| Högpress | 58 | 1,00–1,60 | −0,20 | −0,18 (−1,1) | −1 pe | +2 pe | −0,24 / −0,00 ✔ |
| Svag på fasta | 44 | 1,00–1,64 | −0,29 | −0,27 (−1,5) | −5 pe | +4 pe | −0,39 / −0,02 ✔ |
| Medel på fasta | 86 | 1,23–1,38 | +0,01 | +0,04 (+0,3) | +3 pe | +3 pe | +0,03 / +0,05 ✔ |
| Farlig på fasta | 46 | 1,61–1,15 | +0,16 | +0,18 (+1,0) | +4 pe | +1 pe | −0,20 / +0,28  |
| Stark mot fasta | 46 | 1,20–1,26 | +0,04 | +0,07 (+0,3) | +3 pe | +2 pe | +0,00 / +0,23 ✔ |
| Medel mot fasta | 77 | 1,34–1,36 | −0,01 | +0,01 (+0,1) | −1 pe | +1 pe | −0,07 / +0,08  |
| Svag mot fasta | 53 | 1,25–1,53 | −0,10 | −0,08 (−0,5) | +3 pe | +6 pe | −0,45 / +0,17  |

- Svårast mot **Svag på fasta** (−0,27 p/match rel. eget snitt, z −1,5, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +1,3, 68 m) – inte stabilt, troligen slump

### Newport County

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 37,6 %). 259 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,67 mål för (xG 0,49), 0,33 emot (xG 0,34), 4,11 hörnor · 2025/26 (46 m): 0,22 mål för (xG 0,41), 0,41 emot (xG 0,35), 3,94 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,31–1,20 | +0,21 | +0,18 (+1,2) | −1 pe | −0 pe | +0,12 / +0,22 ✔ |
| Balanserat | 136 | 1,28–1,38 | −0,05 | −0,08 (−0,8) | −1 pe | +7 pe | −0,11 / −0,04 ✔ |
| Bollinnehav | 59 | 1,08–1,46 | +0,02 | −0,01 (−0,0) | −6 pe | −3 pe | +0,03 / −0,04  |
| Kortpass | 50 | 1,06–1,58 | +0,02 | −0,02 (−0,1) | −3 pe | +5 pe | −0,03 / −0,01 ✔ |
| Blandat | 136 | 1,35–1,33 | +0,07 | +0,04 (+0,4) | −4 pe | +3 pe | −0,05 / +0,16  |
| Direktspel | 73 | 1,18–1,23 | −0,03 | −0,06 (−0,4) | +1 pe | +1 pe | −0,02 / −0,13 ✔ |
| Lågpress | 73 | 1,33–1,15 | +0,27 | +0,24 (+1,6) | −3 pe | +4 pe | +0,29 / +0,20 ✔ |
| Mellanpress | 100 | 1,15–1,53 | −0,13 | −0,16 (−1,3) | −6 pe | +0 pe | −0,29 / −0,05 ✔ |
| Högpress | 86 | 1,28–1,31 | +0,01 | −0,02 (−0,1) | +3 pe | +5 pe | −0,01 / −0,02 ✔ |
| Svag på fasta | 92 | 1,26–1,27 | +0,00 | −0,03 (−0,2) | −1 pe | +2 pe | −0,08 / +0,07  |
| Medel på fasta | 112 | 1,34–1,34 | +0,13 | +0,09 (+0,8) | −2 pe | +5 pe | +0,13 / +0,07 ✔ |
| Farlig på fasta | 55 | 1,02–1,51 | −0,11 | −0,14 (−0,9) | −6 pe | −1 pe | −0,33 / −0,04 ✔ |
| Stark mot fasta | 92 | 1,27–1,26 | +0,02 | −0,01 (−0,1) | −1 pe | +0 pe | +0,01 / −0,06  |
| Medel mot fasta | 95 | 1,37–1,33 | +0,22 | +0,19 (+1,5) | −4 pe | +7 pe | −0,00 / +0,31  |
| Svag mot fasta | 72 | 1,04–1,50 | −0,20 | −0,24 (−1,7) | −3 pe | +1 pe | −0,16 / −0,30 ✔ |

- Svårast mot **Svag mot fasta** (−0,24 p/match rel. eget snitt, z −1,7, 72 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,24 p/match rel. eget snitt, z +1,6, 73 m) – åt samma håll i båda halvorna men svagt

### Northampton

Egen stil 2022/23 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 47,1 %). 275 matcher med stil, mot marknaden totalt +0,07 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,23), 0,14 emot (xG 0,13), 5,14 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,07–1,38 | +0,07 | −0,00 (−0,0) | −8 pe | +4 pe | +0,31 / −0,17  |
| Balanserat | 124 | 1,01–1,12 | +0,05 | −0,02 (−0,2) | +0 pe | −8 pe | +0,03 / −0,11  |
| Bollinnehav | 61 | 1,34–1,41 | +0,12 | +0,05 (+0,3) | +1 pe | +8 pe | +0,05 / +0,04 ✔ |
| Kortpass | 62 | 1,31–1,52 | +0,11 | +0,04 (+0,3) | +1 pe | +7 pe | +0,16 / +0,01 ✔ |
| Blandat | 139 | 1,00–1,17 | +0,08 | +0,01 (+0,1) | −3 pe | −5 pe | +0,11 / −0,12  |
| Direktspel | 74 | 1,12–1,24 | +0,02 | −0,05 (−0,3) | −4 pe | +1 pe | +0,06 / −0,23  |
| Lågpress | 75 | 1,12–0,91 | +0,26 | +0,19 (+1,4) | +5 pe | −11 pe | +0,48 / −0,07  |
| Mellanpress | 102 | 1,09–1,56 | −0,08 | −0,15 (−1,3) | −5 pe | +9 pe | +0,04 / −0,38  |
| Högpress | 98 | 1,10–1,24 | +0,08 | +0,01 (+0,1) | −5 pe | −2 pe | −0,12 / +0,13  |
| Svag på fasta | 100 | 1,17–1,19 | +0,15 | +0,08 (+0,7) | +5 pe | +2 pe | +0,13 / −0,04  |
| Medel på fasta | 130 | 1,17–1,34 | +0,13 | +0,06 (+0,5) | −6 pe | +2 pe | +0,11 / +0,02 ✔ |
| Farlig på fasta | 45 | 0,76–1,24 | −0,27 | −0,34 (−2,0) | −5 pe | −14 pe | −0,12 / −0,40 ✔ ⚑ |
| Stark mot fasta | 92 | 1,30–1,03 | +0,36 | +0,29 (+2,3) | −0 pe | +2 pe | +0,48 / +0,03 ✔ ⚑ |
| Medel mot fasta | 124 | 0,97–1,51 | −0,13 | −0,20 (−1,9) | −4 pe | +0 pe | −0,21 / −0,19 ✔ |
| Svag mot fasta | 59 | 1,07–1,14 | +0,03 | −0,04 (−0,2) | −2 pe | −6 pe | −0,03 / −0,05 ✔ |

- Svårast mot **Farlig på fasta** (−0,34 p/match rel. eget snitt, z −2,0, 45 m) – ⚑ håller i båda halvorna
- Bäst mot **Stark mot fasta** (+0,29 p/match rel. eget snitt, z +2,3, 92 m) – ⚑ håller i båda halvorna

### Oldham

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 45,1 %). 91 matcher med stil, mot marknaden totalt −0,17 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,40), 0,38 emot (xG 0,21), 6,13 hörnor · 2025/26 (46 m): 0,46 mål för (xG 0,48), 0,30 emot (xG 0,31), 5,20 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 1,81–1,81 | +0,28 | +0,45 (+1,2) | −21 pe | +26 pe | +0,54 / +0,37 ✔ |
| Balanserat | 53 | 1,32–1,77 | −0,23 | −0,07 (−0,4) | +1 pe | +11 pe | +0,03 / −0,15  |
| Bollinnehav | 22 | 0,77–1,55 | −0,34 | −0,17 (−0,6) | −13 pe | −1 pe | −0,14 / −0,21 ✔ |
| Kortpass | 6 | 1,17–2,50 | −0,65 | −0,48 (−1,1) | −27 pe | +32 pe | −0,82 / −0,32  |
| Blandat | 53 | 1,36–1,60 | +0,01 | +0,18 (+1,0) | −4 pe | +7 pe | +0,09 / +0,26 ✔ |
| Direktspel | 32 | 1,16–1,78 | −0,37 | −0,20 (−1,0) | −6 pe | +13 pe | +0,15 / −0,59  |
| Lågpress | 26 | 1,62–1,65 | +0,09 | +0,26 (+1,0) | −12 pe | +14 pe | −0,11 / +0,43  |
| Mellanpress | 27 | 1,11–1,89 | −0,33 | −0,16 (−0,7) | −4 pe | +4 pe | −0,07 / −0,28 ✔ |
| Högpress | 38 | 1,16–1,66 | −0,24 | −0,07 (−0,4) | −3 pe | +14 pe | +0,25 / −0,46  |
| Svag på fasta | 28 | 0,96–1,71 | −0,33 | −0,16 (−0,7) | −13 pe | +1 pe | −0,20 / −0,10 ✔ |
| Medel på fasta | 48 | 1,38–1,71 | −0,16 | +0,01 (+0,1) | −6 pe | +17 pe | +0,05 / −0,02  |
| Farlig på fasta | 15 | 1,53–1,80 | +0,09 | +0,26 (+0,8) | +7 pe | +10 pe | +0,90 / −0,17  |
| Stark mot fasta | 26 | 1,35–1,65 | +0,02 | +0,19 (+0,7) | −12 pe | +10 pe | +0,09 / +0,29 ✔ |
| Medel mot fasta | 31 | 1,48–1,87 | +0,05 | +0,21 (+1,0) | −4 pe | +17 pe | +0,72 / −0,26  |
| Svag mot fasta | 34 | 1,03–1,65 | −0,51 | −0,34 (−1,7) | −4 pe | +6 pe | −0,52 / −0,16 ✔ |

- Svårast mot **Svag mot fasta** (−0,34 p/match rel. eget snitt, z −1,7, 34 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,45 p/match rel. eget snitt, z +1,2, 16 m) – åt samma håll i båda halvorna men svagt

### Port Vale

Egen stil 2024/25 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,9 %). 271 matcher med stil, mot marknaden totalt −0,14 per match.

Fasta situationer per match: 2026/27 (7 m): 0,00 mål för (xG 0,33), 0,71 emot (xG 0,29), 4,71 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 1,05–1,38 | −0,21 | −0,08 (−0,6) | −5 pe | +0 pe | +0,23 / −0,23  |
| Balanserat | 130 | 1,04–1,28 | −0,19 | −0,05 (−0,5) | −0 pe | −1 pe | +0,03 / −0,15  |
| Bollinnehav | 63 | 1,29–1,32 | +0,07 | +0,20 (+1,3) | −7 pe | +0 pe | +0,05 / +0,43 ✔ |
| Kortpass | 55 | 1,02–1,25 | +0,07 | +0,21 (+1,2) | −3 pe | −5 pe | +0,24 / +0,20 ✔ |
| Blandat | 145 | 1,14–1,32 | −0,18 | −0,04 (−0,4) | −3 pe | −1 pe | +0,01 / −0,10  |
| Direktspel | 71 | 1,08–1,35 | −0,21 | −0,08 (−0,5) | −4 pe | +4 pe | +0,11 / −0,40  |
| Lågpress | 65 | 1,14–1,37 | −0,14 | −0,00 (−0,0) | −0 pe | −0 pe | +0,08 / −0,07  |
| Mellanpress | 106 | 0,94–1,14 | −0,09 | +0,05 (+0,4) | −3 pe | −12 pe | +0,09 / +0,01 ✔ |
| Högpress | 100 | 1,24–1,47 | −0,19 | −0,05 (−0,4) | −7 pe | +11 pe | +0,04 / −0,17  |
| Svag på fasta | 94 | 0,99–1,31 | −0,17 | −0,04 (−0,3) | −2 pe | −1 pe | −0,01 / −0,08 ✔ |
| Medel på fasta | 115 | 1,28–1,34 | −0,06 | +0,07 (+0,6) | −5 pe | +6 pe | +0,26 / −0,05  |
| Farlig på fasta | 62 | 0,94–1,29 | −0,22 | −0,08 (−0,5) | −4 pe | −11 pe | −0,06 / −0,10 ✔ |
| Stark mot fasta | 86 | 1,05–1,35 | −0,22 | −0,08 (−0,7) | −1 pe | +3 pe | +0,19 / −0,57  |
| Medel mot fasta | 116 | 1,09–1,27 | −0,05 | +0,09 (+0,8) | −2 pe | −3 pe | +0,18 / +0,04 ✔ |
| Svag mot fasta | 69 | 1,19–1,36 | −0,18 | −0,05 (−0,3) | −9 pe | −1 pe | −0,23 / +0,17  |

- Svårast mot **Stark mot fasta** (−0,08 p/match rel. eget snitt, z −0,7, 86 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,20 p/match rel. eget snitt, z +1,3, 63 m) – åt samma håll i båda halvorna men svagt

### Rotherham

Egen stil 2026/27 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 51,2 %). 286 matcher med stil, mot marknaden totalt −0,07 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,09), 0,11 emot (xG 0,17), 3,89 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 98 | 1,05–1,32 | −0,08 | −0,01 (−0,1) | −3 pe | −1 pe | +0,06 / −0,09  |
| Balanserat | 110 | 0,97–1,45 | −0,15 | −0,08 (−0,8) | −0 pe | −6 pe | −0,10 / −0,06 ✔ |
| Bollinnehav | 78 | 1,33–1,21 | +0,06 | +0,13 (+1,0) | +1 pe | −1 pe | +0,27 / −0,01  |
| Kortpass | 88 | 1,18–1,25 | +0,09 | +0,17 (+1,3) | +0 pe | −2 pe | +0,53 / +0,01 ✔ |
| Blandat | 116 | 0,99–1,53 | −0,15 | −0,08 (−0,8) | −5 pe | +1 pe | −0,11 / −0,06 ✔ |
| Direktspel | 82 | 1,16–1,17 | −0,13 | −0,06 (−0,5) | +3 pe | −10 pe | +0,00 / −0,31  |
| Lågpress | 66 | 1,27–1,15 | +0,01 | +0,08 (+0,5) | −5 pe | −9 pe | +0,47 / −0,36  |
| Mellanpress | 106 | 1,11–1,58 | −0,27 | −0,20 (−1,9) | −2 pe | +7 pe | −0,20 / −0,20 ✔ |
| Högpress | 114 | 0,98–1,22 | +0,07 | +0,14 (+1,3) | +3 pe | −9 pe | +0,04 / +0,23 ✔ |
| Svag på fasta | 95 | 1,23–1,33 | +0,11 | +0,18 (+1,6) | −2 pe | −6 pe | +0,24 / +0,08 ✔ |
| Medel på fasta | 115 | 1,10–1,30 | −0,10 | −0,03 (−0,2) | −4 pe | −1 pe | +0,18 / −0,17  |
| Farlig på fasta | 76 | 0,93–1,42 | −0,25 | −0,18 (−1,4) | +4 pe | −3 pe | −0,41 / +0,02  |
| Stark mot fasta | 91 | 1,04–1,38 | −0,03 | +0,04 (+0,3) | −5 pe | −0 pe | +0,05 / +0,02 ✔ |
| Medel mot fasta | 136 | 1,10–1,27 | −0,06 | +0,01 (+0,1) | +3 pe | −5 pe | +0,00 / +0,01 ✔ |
| Svag mot fasta | 59 | 1,17–1,42 | −0,15 | −0,08 (−0,5) | −4 pe | −3 pe | +0,18 / −0,31  |

- Svårast mot **Mellanpress** (−0,20 p/match rel. eget snitt, z −1,9, 106 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,18 p/match rel. eget snitt, z +1,6, 95 m) – åt samma håll i båda halvorna men svagt

### Salford

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 58,6 %). 260 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (9 m): 0,56 mål för (xG 0,40), 0,22 emot (xG 0,17), 6,67 hörnor · 2025/26 (46 m): 0,35 mål för (xG 0,46), 0,39 emot (xG 0,34), 5,63 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,33–1,16 | +0,00 | +0,01 (+0,1) | −10 pe | −1 pe | +0,14 / −0,07  |
| Balanserat | 132 | 1,36–1,21 | −0,04 | −0,03 (−0,3) | −1 pe | −0 pe | +0,11 / −0,22  |
| Bollinnehav | 58 | 1,36–1,10 | +0,06 | +0,06 (+0,3) | +1 pe | −5 pe | −0,30 / +0,37  |
| Kortpass | 53 | 1,47–1,19 | +0,21 | +0,22 (+1,1) | −6 pe | −2 pe | −0,11 / +0,30  |
| Blandat | 135 | 1,36–1,15 | −0,05 | −0,05 (−0,4) | −0 pe | −2 pe | +0,01 / −0,13  |
| Direktspel | 72 | 1,26–1,21 | −0,08 | −0,07 (−0,4) | −7 pe | +0 pe | +0,10 / −0,29  |
| Lågpress | 77 | 1,61–1,08 | +0,15 | +0,16 (+1,0) | −9 pe | +0 pe | −0,03 / +0,30  |
| Mellanpress | 95 | 1,31–1,24 | −0,08 | −0,08 (−0,6) | −2 pe | −2 pe | +0,02 / −0,18  |
| Högpress | 88 | 1,18–1,18 | −0,06 | −0,05 (−0,4) | +0 pe | −3 pe | +0,07 / −0,21  |
| Svag på fasta | 88 | 1,56–1,14 | +0,28 | +0,29 (+2,0) | −4 pe | +0 pe | +0,18 / +0,52 ✔ ⚑ |
| Medel på fasta | 114 | 1,26–1,21 | −0,17 | −0,16 (−1,3) | −4 pe | −2 pe | −0,07 / −0,24 ✔ |
| Farlig på fasta | 58 | 1,22–1,16 | −0,12 | −0,12 (−0,7) | −1 pe | −3 pe | −0,19 / −0,08 ✔ |
| Stark mot fasta | 88 | 1,36–1,32 | −0,07 | −0,06 (−0,4) | −8 pe | −0 pe | −0,06 / −0,06 ✔ |
| Medel mot fasta | 104 | 1,29–1,11 | −0,01 | −0,00 (−0,0) | −0 pe | −6 pe | +0,19 / −0,13  |
| Svag mot fasta | 68 | 1,44–1,09 | +0,08 | +0,08 (+0,5) | −1 pe | +4 pe | −0,03 / +0,20  |

- Svårast mot **Medel på fasta** (−0,16 p/match rel. eget snitt, z −1,3, 114 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,29 p/match rel. eget snitt, z +2,0, 88 m) – ⚑ håller i båda halvorna

### Shrewsbury

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 42,3 %). 279 matcher med stil, mot marknaden totalt −0,10 per match.

Fasta situationer per match: 2026/27 (9 m): 0,67 mål för (xG 0,74), 0,44 emot (xG 0,27), 5,33 hörnor · 2025/26 (46 m): 0,48 mål för (xG 0,44), 0,35 emot (xG 0,25), 3,96 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 0,98–1,27 | +0,06 | +0,17 (+1,2) | −6 pe | −3 pe | +0,46 / −0,06  |
| Balanserat | 107 | 0,91–1,32 | −0,11 | −0,01 (−0,1) | −5 pe | −6 pe | −0,05 / +0,05  |
| Bollinnehav | 86 | 1,01–1,64 | −0,26 | −0,16 (−1,3) | −3 pe | +6 pe | −0,14 / −0,18 ✔ |
| Kortpass | 74 | 0,88–1,69 | −0,42 | −0,32 (−2,6) | −6 pe | +2 pe | −0,19 / −0,38 ✔ ⚑ |
| Blandat | 113 | 0,93–1,36 | +0,01 | +0,12 (+1,0) | −5 pe | −4 pe | +0,10 / +0,13 ✔ |
| Direktspel | 92 | 1,07–1,22 | +0,01 | +0,11 (+0,8) | −4 pe | −1 pe | +0,12 / +0,09 ✔ |
| Lågpress | 76 | 0,86–1,50 | −0,22 | −0,12 (−0,9) | −8 pe | +3 pe | −0,10 / −0,13 ✔ |
| Mellanpress | 109 | 1,03–1,38 | −0,08 | +0,03 (+0,2) | −3 pe | −3 pe | +0,08 / −0,04  |
| Högpress | 94 | 0,97–1,35 | −0,04 | +0,07 (+0,5) | −3 pe | −3 pe | +0,14 / −0,01  |
| Svag på fasta | 106 | 0,97–1,43 | −0,15 | −0,04 (−0,4) | −6 pe | +1 pe | +0,08 / −0,32  |
| Medel på fasta | 109 | 0,93–1,47 | −0,08 | +0,02 (+0,2) | −1 pe | −3 pe | +0,07 / −0,01  |
| Farlig på fasta | 64 | 1,00–1,23 | −0,07 | +0,04 (+0,2) | −9 pe | −4 pe | −0,05 / +0,08  |
| Stark mot fasta | 94 | 0,94–1,35 | −0,03 | +0,07 (+0,6) | −9 pe | −3 pe | +0,16 / −0,02  |
| Medel mot fasta | 117 | 1,03–1,36 | −0,07 | +0,04 (+0,3) | +1 pe | −2 pe | +0,07 / +0,01 ✔ |
| Svag mot fasta | 68 | 0,88–1,54 | −0,27 | −0,17 (−1,1) | −8 pe | +1 pe | −0,11 / −0,23 ✔ |

- Svårast mot **Kortpass** (−0,32 p/match rel. eget snitt, z −2,6, 74 m) – ⚑ håller i båda halvorna
- Bäst mot **Backar hem** (+0,17 p/match rel. eget snitt, z +1,2, 86 m) – inte stabilt, troligen slump

### Swindon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 44,8 %). 263 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,30), 0,22 emot (xG 0,36), 4,22 hörnor · 2025/26 (46 m): 0,37 mål för (xG 0,34), 0,48 emot (xG 0,35), 5,28 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 1,45–1,56 | −0,08 | −0,04 (−0,3) | −3 pe | +11 pe | −0,11 / +0,01  |
| Balanserat | 134 | 1,49–1,34 | +0,08 | +0,12 (+1,1) | −1 pe | +7 pe | +0,12 / +0,13 ✔ |
| Bollinnehav | 52 | 1,38–1,69 | −0,29 | −0,25 (−1,5) | −5 pe | +19 pe | −0,37 / −0,16 ✔ |
| Kortpass | 52 | 1,29–1,79 | −0,52 | −0,48 (−3,2) | −3 pe | +18 pe | −0,91 / −0,35 ✔ ⚑ |
| Blandat | 129 | 1,61–1,24 | +0,21 | +0,25 (+2,3) | +2 pe | +10 pe | +0,16 / +0,36 ✔ ⚑ |
| Direktspel | 82 | 1,33–1,65 | −0,13 | −0,09 (−0,7) | −8 pe | +6 pe | −0,08 / −0,12 ✔ |
| Lågpress | 72 | 1,39–1,31 | −0,04 | +0,01 (+0,0) | +1 pe | +10 pe | −0,20 / +0,17  |
| Mellanpress | 105 | 1,33–1,46 | −0,05 | −0,01 (−0,1) | −0 pe | +4 pe | +0,16 / −0,19  |
| Högpress | 86 | 1,67–1,64 | −0,04 | +0,00 (+0,0) | −8 pe | +19 pe | −0,13 / +0,14  |
| Svag på fasta | 90 | 1,23–1,52 | −0,28 | −0,24 (−1,9) | +1 pe | +12 pe | −0,16 / −0,42 ✔ |
| Medel på fasta | 120 | 1,57–1,49 | +0,06 | +0,10 (+0,9) | −5 pe | +10 pe | −0,01 / +0,20  |
| Farlig på fasta | 53 | 1,60–1,36 | +0,13 | +0,17 (+1,0) | −2 pe | +8 pe | +0,58 / +0,02 ✔ |
| Stark mot fasta | 84 | 1,48–1,45 | −0,01 | +0,03 (+0,2) | −4 pe | +10 pe | −0,14 / +0,30  |
| Medel mot fasta | 113 | 1,50–1,48 | −0,05 | −0,01 (−0,1) | +3 pe | +11 pe | −0,01 / −0,01 ✔ |
| Svag mot fasta | 66 | 1,36–1,50 | −0,06 | −0,02 (−0,1) | −8 pe | +10 pe | +0,15 / −0,17  |

- Svårast mot **Kortpass** (−0,48 p/match rel. eget snitt, z −3,2, 52 m) – ⚑ håller i båda halvorna
- Bäst mot **Blandat** (+0,25 p/match rel. eget snitt, z +2,3, 129 m) – ⚑ håller i båda halvorna

### Tranmere

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 47,6 %). 260 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,28), 0,22 emot (xG 0,26), 3,33 hörnor · 2025/26 (46 m): 0,30 mål för (xG 0,34), 0,37 emot (xG 0,39), 4,15 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 74 | 1,05–1,31 | −0,17 | −0,14 (−1,0) | −3 pe | −8 pe | −0,33 / −0,02 ✔ |
| Balanserat | 129 | 1,16–1,22 | +0,09 | +0,12 (+1,0) | +1 pe | −5 pe | +0,25 / −0,08  |
| Bollinnehav | 57 | 1,26–1,33 | −0,10 | −0,07 (−0,5) | −1 pe | +4 pe | +0,31 / −0,40  |
| Kortpass | 54 | 1,26–1,70 | −0,32 | −0,30 (−2,0) | +2 pe | +13 pe | +0,13 / −0,42  |
| Blandat | 131 | 1,09–1,08 | +0,06 | +0,09 (+0,8) | +0 pe | −10 pe | +0,22 / −0,10  |
| Direktspel | 75 | 1,19–1,29 | +0,03 | +0,06 (+0,4) | −5 pe | −6 pe | −0,02 / +0,16  |
| Lågpress | 78 | 1,13–1,19 | −0,12 | −0,09 (−0,7) | −2 pe | −4 pe | +0,16 / −0,31  |
| Mellanpress | 94 | 1,06–1,38 | −0,20 | −0,17 (−1,4) | +2 pe | −5 pe | +0,08 / −0,41  |
| Högpress | 88 | 1,27–1,22 | +0,23 | +0,26 (+1,9) | −3 pe | −2 pe | +0,17 / +0,37 ✔ |
| Svag på fasta | 86 | 1,06–1,13 | −0,10 | −0,08 (−0,6) | +2 pe | −8 pe | +0,03 / −0,34  |
| Medel på fasta | 115 | 1,26–1,27 | +0,09 | +0,12 (+1,0) | −4 pe | −1 pe | +0,33 / −0,07  |
| Farlig på fasta | 59 | 1,08–1,47 | −0,15 | −0,12 (−0,8) | +3 pe | −4 pe | −0,12 / −0,12 ✔ |
| Stark mot fasta | 88 | 1,06–1,23 | −0,03 | −0,00 (−0,0) | +2 pe | −6 pe | −0,05 / +0,09  |
| Medel mot fasta | 103 | 1,22–1,27 | −0,01 | +0,02 (+0,2) | −2 pe | −3 pe | +0,20 / −0,10  |
| Svag mot fasta | 69 | 1,17–1,32 | −0,06 | −0,03 (−0,2) | −2 pe | −2 pe | +0,37 / −0,38  |

- Svårast mot **Kortpass** (−0,30 p/match rel. eget snitt, z −2,0, 54 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,26 p/match rel. eget snitt, z +1,9, 88 m) – åt samma håll i båda halvorna men svagt

### Walsall

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 57,6 %). 259 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (8 m): 0,63 mål för (xG 0,54), 0,25 emot (xG 0,26), 6,50 hörnor · 2025/26 (46 m): 0,54 mål för (xG 0,49), 0,41 emot (xG 0,32), 4,59 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,05–1,03 | −0,03 | +0,02 (+0,1) | +8 pe | −14 pe | +0,00 / +0,03 ✔ |
| Balanserat | 132 | 1,32–1,30 | −0,11 | −0,07 (−0,6) | +3 pe | +3 pe | −0,08 / −0,05 ✔ |
| Bollinnehav | 62 | 1,18–1,23 | +0,08 | +0,12 (+0,8) | +1 pe | +3 pe | −0,16 / +0,32  |
| Kortpass | 53 | 1,32–1,09 | +0,16 | +0,21 (+1,3) | +2 pe | −2 pe | −0,05 / +0,27  |
| Blandat | 138 | 1,20–1,22 | −0,12 | −0,08 (−0,7) | +0 pe | +0 pe | −0,15 / +0,02  |
| Direktspel | 68 | 1,16–1,28 | −0,05 | −0,00 (−0,0) | +11 pe | −4 pe | +0,06 / −0,09  |
| Lågpress | 78 | 1,38–1,19 | −0,03 | +0,02 (+0,1) | −0 pe | +7 pe | −0,26 / +0,24  |
| Mellanpress | 97 | 1,07–1,06 | −0,01 | +0,04 (+0,3) | +9 pe | −12 pe | −0,03 / +0,10  |
| Högpress | 84 | 1,23–1,40 | −0,10 | −0,06 (−0,4) | +2 pe | +3 pe | +0,01 / −0,13  |
| Svag på fasta | 90 | 1,09–1,21 | −0,21 | −0,17 (−1,4) | +2 pe | −2 pe | −0,24 / +0,01  |
| Medel på fasta | 115 | 1,30–1,23 | +0,06 | +0,11 (+0,9) | +5 pe | −4 pe | +0,01 / +0,18 ✔ |
| Farlig på fasta | 54 | 1,26–1,17 | +0,00 | +0,05 (+0,3) | +3 pe | +6 pe | +0,24 / −0,05  |
| Stark mot fasta | 94 | 1,26–1,34 | −0,04 | +0,01 (+0,1) | +1 pe | +2 pe | −0,01 / +0,03  |
| Medel mot fasta | 96 | 1,16–1,15 | −0,08 | −0,04 (−0,3) | +9 pe | −6 pe | −0,24 / +0,10  |
| Svag mot fasta | 69 | 1,25–1,13 | −0,00 | +0,04 (+0,3) | −1 pe | −0 pe | −0,02 / +0,09  |

- Svårast mot **Svag på fasta** (−0,17 p/match rel. eget snitt, z −1,4, 90 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,21 p/match rel. eget snitt, z +1,3, 53 m) – inte stabilt, troligen slump
