# Stilmatchning – Superligaen (DK)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1188 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 91 m · hemma −0,01 · kryss +8 pe · ö2,5 – | 129 m · hemma +0,01 · kryss +3 pe · ö2,5 – | 113 m · hemma +0,06 · kryss −9 pe · ö2,5 – |
| **Mellan** | 129 m · hemma +0,09 · kryss +1 pe · ö2,5 – | 176 m · hemma −0,04 · kryss +5 pe · ö2,5 – | 157 m · hemma +0,00 · kryss −7 pe · ö2,5 – |
| **Mycket boll** | 110 m · hemma +0,12 · kryss +0 pe · ö2,5 – | 159 m · hemma +0,03 · kryss −2 pe · ö2,5 – | 124 m · hemma +0,02 · kryss +3 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 124 m · hemma −0,14 · kryss +5 pe · ö2,5 – | 152 m · hemma +0,13 · kryss −4 pe · ö2,5 – | 126 m · hemma −0,01 · kryss −0 pe · ö2,5 – |
| **Balanserat** | 151 m · hemma +0,00 · kryss −3 pe · ö2,5 – | 177 m · hemma −0,07 · kryss +5 pe · ö2,5 – | 129 m · hemma +0,17 · kryss −4 pe · ö2,5 – |
| **Bollinnehav** | 126 m · hemma +0,07 · kryss +4 pe · ö2,5 – | 129 m · hemma +0,10 · kryss −5 pe · ö2,5 – | 74 m · hemma −0,00 · kryss +3 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 352 m · mot marknaden +0,09 (z +1,4) · mål 1,54 · ö2,5 – | 380 m · mot marknaden −0,04 (z −0,6) · mål 1,43 · ö2,5 – | 165 m · mot marknaden +0,03 (z +0,3) · mål 1,55 · ö2,5 – |
| **Medel på fasta** | 212 m · mot marknaden +0,10 (z +1,2) · mål 1,56 · ö2,5 – | 368 m · mot marknaden −0,08 (z −1,3) · mål 1,34 · ö2,5 – | 192 m · mot marknaden −0,05 (z −0,5) · mål 1,39 · ö2,5 – |
| **Farlig på fasta** | 147 m · mot marknaden −0,03 (z −0,3) · mål 1,39 · ö2,5 – | 321 m · mot marknaden −0,04 (z −0,6) · mål 1,29 · ö2,5 – | 239 m · mot marknaden +0,04 (z +0,5) · mål 1,41 · ö2,5 – |

## Lag (säsong 2026/27)

### Aarhus

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 56,1 %). 237 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,32), 0,44 emot (xG 0,24), 7,11 hörnor · 2025/26 (32 m): 0,38 mål för (xG 0,50), 0,16 emot (xG 0,18), 5,50 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 1,26–1,14 | −0,00 | −0,03 (−0,2) | +1 pe | – | +0,12 / −0,24  |
| Balanserat | 87 | 1,55–1,25 | +0,21 | +0,18 (+1,4) | +1 pe | – | +0,28 / +0,10 ✔ |
| Bollinnehav | 78 | 1,36–1,46 | −0,15 | −0,18 (−1,3) | +11 pe | – | −0,26 / −0,11 ✔ |
| Kortpass | 62 | 1,52–1,45 | −0,02 | −0,05 (−0,3) | +10 pe | – | −0,62 / −0,01  |
| Blandat | 101 | 1,39–1,27 | +0,01 | −0,02 (−0,1) | +5 pe | – | −0,03 / −0,00 ✔ |
| Direktspel | 74 | 1,32–1,18 | +0,09 | +0,06 (+0,5) | −3 pe | – | +0,19 / −0,51  |
| Lågpress | 80 | 1,69–1,16 | +0,43 | +0,41 (+3,1) | −0 pe | – | +0,38 / +0,47 ✔ ⚑ |
| Mellanpress | 86 | 1,31–1,27 | −0,21 | −0,23 (−1,8) | +5 pe | – | −0,25 / −0,21 ✔ |
| Högpress | 71 | 1,18–1,45 | −0,15 | −0,18 (−1,3) | +8 pe | – | −0,30 / −0,15 ✔ |
| Svag på fasta | 89 | 1,35–1,33 | −0,03 | −0,06 (−0,5) | +9 pe | – | +0,04 / −0,14  |
| Medel på fasta | 78 | 1,29–1,29 | −0,06 | −0,09 (−0,6) | +3 pe | – | +0,07 / −0,20  |
| Farlig på fasta | 70 | 1,59–1,23 | +0,20 | +0,17 (+1,1) | −1 pe | – | +0,07 / +0,34 ✔ |
| Stark mot fasta | 66 | 1,53–1,23 | +0,10 | +0,07 (+0,5) | −6 pe | – | +0,01 / +0,15 ✔ |
| Medel mot fasta | 113 | 1,31–1,34 | −0,02 | −0,04 (−0,4) | +8 pe | – | −0,00 / −0,08 ✔ |
| Svag mot fasta | 58 | 1,43–1,26 | +0,03 | +0,00 (+0,0) | +8 pe | – | +0,23 / −0,23  |

- Svårast mot **Mellanpress** (−0,23 p/match rel. eget snitt, z −1,8, 86 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,41 p/match rel. eget snitt, z +3,1, 80 m) – ⚑ håller i båda halvorna

### Brondby

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 55,8 %). 237 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,34), 0,33 emot (xG 0,36), 6,11 hörnor · 2025/26 (32 m): 0,19 mål för (xG 0,29), 0,13 emot (xG 0,20), 3,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,65–1,35 | +0,12 | +0,09 (+0,7) | +1 pe | – | +0,03 / +0,18 ✔ |
| Balanserat | 88 | 1,43–1,45 | −0,14 | −0,16 (−1,2) | −4 pe | – | +0,01 / −0,31  |
| Bollinnehav | 63 | 1,65–1,30 | +0,13 | +0,10 (+0,6) | +0 pe | – | +0,23 / −0,02  |
| Kortpass | 51 | 1,47–1,35 | −0,08 | −0,11 (−0,6) | +0 pe | – | −0,02 / −0,11  |
| Blandat | 96 | 1,49–1,38 | +0,04 | +0,02 (+0,1) | −3 pe | – | +0,21 / −0,15  |
| Direktspel | 90 | 1,71–1,39 | +0,07 | +0,04 (+0,3) | −0 pe | – | −0,01 / +0,22  |
| Lågpress | 80 | 1,43–1,27 | −0,13 | −0,15 (−1,1) | −5 pe | – | −0,20 / −0,03 ✔ |
| Mellanpress | 87 | 1,62–1,33 | +0,14 | +0,11 (+0,9) | +3 pe | – | +0,28 / −0,09  |
| Högpress | 70 | 1,67–1,54 | +0,07 | +0,04 (+0,2) | −2 pe | – | +0,55 / −0,08  |
| Svag på fasta | 79 | 1,65–1,35 | +0,16 | +0,13 (+1,0) | −5 pe | – | +0,09 / +0,17 ✔ |
| Medel på fasta | 79 | 1,86–1,46 | +0,16 | +0,13 (+0,9) | +1 pe | – | +0,46 / −0,17  |
| Farlig på fasta | 79 | 1,20–1,32 | −0,24 | −0,27 (−1,9) | −0 pe | – | −0,27 / −0,26 ✔ |
| Stark mot fasta | 75 | 1,55–1,37 | −0,05 | −0,07 (−0,5) | −2 pe | – | −0,04 / −0,10 ✔ |
| Medel mot fasta | 108 | 1,56–1,40 | +0,09 | +0,06 (+0,5) | −1 pe | – | +0,09 / +0,03 ✔ |
| Svag mot fasta | 54 | 1,61–1,33 | +0,01 | −0,02 (−0,1) | +0 pe | – | +0,17 / −0,23  |

- Svårast mot **Farlig på fasta** (−0,27 p/match rel. eget snitt, z −1,9, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,13 p/match rel. eget snitt, z +1,0, 79 m) – åt samma håll i båda halvorna men svagt

### FC Copenhagen

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 50,6 %). 232 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,38), 0,00 emot (xG 0,09), 4,56 hörnor · 2025/26 (32 m): 0,44 mål för (xG 0,44), 0,41 emot (xG 0,32), 5,66 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,82–1,34 | −0,10 | −0,20 (−1,4) | −9 pe | – | −0,03 / −0,42 ✔ |
| Balanserat | 81 | 1,99–1,04 | +0,27 | +0,17 (+1,2) | −12 pe | – | +0,30 / +0,04 ✔ |
| Bollinnehav | 68 | 2,10–1,09 | +0,15 | +0,04 (+0,3) | −2 pe | – | +0,11 / −0,01  |
| Kortpass | 54 | 2,20–1,00 | +0,24 | +0,14 (+0,8) | −8 pe | – | +0,83 / +0,11  |
| Blandat | 94 | 1,98–1,16 | +0,09 | −0,01 (−0,1) | −6 pe | – | +0,22 / −0,27  |
| Direktspel | 84 | 1,79–1,26 | +0,02 | −0,08 (−0,6) | −10 pe | – | +0,02 / −0,39  |
| Lågpress | 79 | 2,08–1,22 | +0,08 | −0,02 (−0,1) | −10 pe | – | +0,02 / −0,11  |
| Mellanpress | 79 | 2,03–1,15 | +0,12 | +0,01 (+0,1) | −6 pe | – | +0,03 / −0,00  |
| Högpress | 74 | 1,77–1,11 | +0,11 | +0,01 (+0,0) | −7 pe | – | +0,73 / −0,19  |
| Svag på fasta | 83 | 2,13–1,10 | +0,19 | +0,09 (+0,7) | −8 pe | – | +0,17 / +0,01 ✔ |
| Medel på fasta | 85 | 1,87–1,18 | +0,05 | −0,06 (−0,4) | −4 pe | – | +0,26 / −0,31  |
| Farlig på fasta | 64 | 1,86–1,22 | +0,06 | −0,04 (−0,3) | −14 pe | – | −0,08 / +0,01  |
| Stark mot fasta | 69 | 2,20–0,94 | +0,31 | +0,21 (+1,4) | −13 pe | – | +0,40 / +0,04 ✔ |
| Medel mot fasta | 114 | 1,87–1,21 | +0,03 | −0,07 (−0,6) | −6 pe | – | +0,08 / −0,22  |
| Svag mot fasta | 49 | 1,84–1,35 | −0,02 | −0,12 (−0,7) | −4 pe | – | −0,11 / −0,14 ✔ |

- Svårast mot **Backar hem** (−0,20 p/match rel. eget snitt, z −1,4, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,21 p/match rel. eget snitt, z +1,4, 69 m) – åt samma håll i båda halvorna men svagt

### Midtjylland

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 51,1 %). 232 matcher med stil, mot marknaden totalt +0,14 per match.

Fasta situationer per match: 2026/27 (9 m): 0,67 mål för (xG 0,62), 0,11 emot (xG 0,17), 5,56 hörnor · 2025/26 (32 m): 0,44 mål för (xG 0,47), 0,19 emot (xG 0,23), 5,47 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,83–1,00 | +0,21 | +0,08 (+0,5) | −3 pe | – | −0,06 / +0,33  |
| Balanserat | 97 | 1,68–1,06 | +0,09 | −0,05 (−0,3) | +0 pe | – | −0,10 / −0,00 ✔ |
| Bollinnehav | 82 | 1,93–1,30 | +0,15 | +0,01 (+0,0) | −0 pe | – | +0,06 / −0,05  |
| Kortpass | 62 | 1,92–1,34 | +0,07 | −0,07 (−0,4) | +8 pe | – | −0,19 / −0,06  |
| Blandat | 108 | 1,72–1,08 | +0,17 | +0,03 (+0,2) | −3 pe | – | −0,03 / +0,10  |
| Direktspel | 62 | 1,82–1,02 | +0,16 | +0,02 (+0,2) | −6 pe | – | −0,03 / +0,33  |
| Lågpress | 81 | 1,88–1,05 | +0,17 | +0,03 (+0,2) | −4 pe | – | −0,02 / +0,14  |
| Mellanpress | 93 | 1,76–1,11 | +0,10 | −0,04 (−0,3) | −1 pe | – | −0,12 / +0,06  |
| Högpress | 58 | 1,76–1,29 | +0,15 | +0,01 (+0,1) | +4 pe | – | +0,26 / −0,06  |
| Svag på fasta | 101 | 1,81–1,38 | −0,01 | −0,15 (−1,2) | −1 pe | – | −0,22 / −0,08 ✔ |
| Medel på fasta | 69 | 1,99–1,09 | +0,28 | +0,14 (+1,0) | −6 pe | – | +0,14 / +0,15 ✔ |
| Farlig på fasta | 62 | 1,58–0,79 | +0,23 | +0,09 (+0,6) | +6 pe | – | +0,09 / +0,08 ✔ |
| Stark mot fasta | 71 | 1,80–1,00 | +0,21 | +0,07 (+0,6) | +9 pe | – | +0,14 / +0,02 ✔ |
| Medel mot fasta | 105 | 1,79–1,24 | +0,18 | +0,04 (+0,3) | −6 pe | – | −0,03 / +0,14  |
| Svag mot fasta | 56 | 1,82–1,11 | −0,03 | −0,17 (−1,0) | −5 pe | – | −0,22 / −0,12 ✔ |

- Svårast mot **Svag på fasta** (−0,15 p/match rel. eget snitt, z −1,2, 101 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,14 p/match rel. eget snitt, z +1,0, 69 m) – åt samma håll i båda halvorna men svagt

### Nordsjaelland

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 56,3 %). 236 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,30), 0,22 emot (xG 0,34), 5,56 hörnor · 2025/26 (32 m): 0,16 mål för (xG 0,22), 0,34 emot (xG 0,27), 4,84 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 91 | 1,70–1,46 | +0,19 | +0,19 (+1,5) | +6 pe | – | +0,09 / +0,31 ✔ |
| Balanserat | 95 | 1,54–1,31 | +0,01 | +0,00 (+0,0) | −3 pe | – | +0,14 / −0,09  |
| Bollinnehav | 50 | 1,32–1,80 | −0,34 | −0,35 (−2,2) | +6 pe | – | −0,43 / −0,24 ✔ ⚑ |
| Kortpass | 41 | 1,46–1,39 | −0,16 | −0,17 (−0,9) | +0 pe | – | – / −0,17  |
| Blandat | 104 | 1,39–1,49 | −0,08 | −0,09 (−0,8) | +2 pe | – | −0,31 / +0,10  |
| Direktspel | 91 | 1,78–1,48 | +0,19 | +0,18 (+1,4) | +4 pe | – | +0,19 / +0,13 ✔ |
| Lågpress | 88 | 1,66–1,39 | +0,18 | +0,17 (+1,3) | −5 pe | – | +0,26 / −0,06  |
| Mellanpress | 87 | 1,39–1,57 | −0,11 | −0,12 (−1,0) | +7 pe | – | −0,30 / +0,05  |
| Högpress | 61 | 1,64–1,44 | −0,06 | −0,07 (−0,5) | +7 pe | – | −0,41 / +0,01  |
| Svag på fasta | 84 | 1,40–1,58 | −0,15 | −0,16 (−1,2) | +2 pe | – | −0,33 / +0,04  |
| Medel på fasta | 75 | 1,88–1,35 | +0,20 | +0,19 (+1,3) | +1 pe | – | +0,32 / +0,10 ✔ |
| Farlig på fasta | 77 | 1,40–1,47 | −0,01 | −0,01 (−0,1) | +5 pe | – | +0,08 / −0,13  |
| Stark mot fasta | 75 | 1,72–1,20 | +0,13 | +0,12 (+0,9) | +3 pe | – | +0,02 / +0,20 ✔ |
| Medel mot fasta | 99 | 1,42–1,53 | +0,00 | −0,01 (−0,1) | +6 pe | – | −0,06 / +0,04  |
| Svag mot fasta | 62 | 1,56–1,71 | −0,13 | −0,14 (−0,9) | −4 pe | – | +0,02 / −0,36  |

- Svårast mot **Bollinnehav** (−0,35 p/match rel. eget snitt, z −2,2, 50 m) – ⚑ håller i båda halvorna
- Bäst mot **Backar hem** (+0,19 p/match rel. eget snitt, z +1,5, 91 m) – åt samma håll i båda halvorna men svagt

### Odense

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,8 %). 166 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (9 m): 0,00 mål för (xG 0,37), 0,44 emot (xG 0,53), 6,78 hörnor · 2025/26 (32 m): 0,28 mål för (xG 0,31), 0,22 emot (xG 0,28), 5,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 62 | 1,21–1,39 | −0,10 | −0,04 (−0,3) | +8 pe | – | +0,00 / −0,10  |
| Balanserat | 64 | 1,31–1,25 | +0,05 | +0,10 (+0,6) | +3 pe | – | +0,19 / +0,03 ✔ |
| Bollinnehav | 40 | 1,13–1,70 | −0,15 | −0,09 (−0,5) | +2 pe | – | −0,32 / +0,13  |
| Kortpass | 24 | 1,17–1,29 | +0,29 | +0,34 (+1,3) | +4 pe | – | – / +0,34  |
| Blandat | 64 | 1,16–1,67 | −0,14 | −0,09 (−0,5) | −1 pe | – | −0,05 / −0,12 ✔ |
| Direktspel | 78 | 1,31–1,23 | −0,09 | −0,03 (−0,3) | +9 pe | – | +0,01 / −0,13  |
| Lågpress | 57 | 1,12–1,35 | −0,20 | −0,15 (−1,0) | +3 pe | – | −0,19 / +0,00  |
| Mellanpress | 61 | 1,34–1,38 | +0,08 | +0,13 (+0,8) | +3 pe | – | +0,19 / +0,07 ✔ |
| Högpress | 48 | 1,21–1,52 | −0,04 | +0,01 (+0,0) | +7 pe | – | +0,18 / −0,04  |
| Svag på fasta | 52 | 1,02–1,63 | −0,26 | −0,21 (−1,3) | +5 pe | – | −0,37 / +0,11  |
| Medel på fasta | 61 | 1,34–1,41 | +0,04 | +0,09 (+0,6) | +0 pe | – | +0,29 / −0,01  |
| Farlig på fasta | 53 | 1,30–1,19 | +0,05 | +0,10 (+0,7) | +9 pe | – | +0,22 / −0,02  |
| Stark mot fasta | 50 | 1,30–1,22 | +0,07 | +0,12 (+0,7) | +14 pe | – | −0,02 / +0,21  |
| Medel mot fasta | 84 | 1,15–1,57 | −0,17 | −0,12 (−0,9) | +1 pe | – | −0,04 / −0,20 ✔ |
| Svag mot fasta | 32 | 1,31–1,28 | +0,06 | +0,11 (+0,5) | −1 pe | – | +0,06 / +0,19 ✔ |

- Svårast mot **Svag på fasta** (−0,21 p/match rel. eget snitt, z −1,3, 52 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,34 p/match rel. eget snitt, z +1,3, 24 m) – inte stabilt, troligen slump

### Randers FC

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 44,1 %). 228 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,18), 0,44 emot (xG 0,37), 4,00 hörnor · 2025/26 (32 m): 0,25 mål för (xG 0,31), 0,38 emot (xG 0,19), 5,34 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,34–1,18 | +0,15 | +0,14 (+1,1) | +6 pe | – | +0,25 / +0,00 ✔ |
| Balanserat | 88 | 1,25–1,45 | +0,03 | +0,03 (+0,2) | −3 pe | – | −0,06 / +0,11  |
| Bollinnehav | 69 | 1,26–1,80 | −0,17 | −0,18 (−1,2) | −1 pe | – | −0,05 / −0,28 ✔ |
| Kortpass | 46 | 1,26–1,65 | −0,09 | −0,09 (−0,5) | +3 pe | – | +0,59 / −0,13  |
| Blandat | 99 | 1,21–1,54 | +0,00 | −0,01 (−0,1) | +1 pe | – | −0,09 / +0,07  |
| Direktspel | 83 | 1,37–1,30 | +0,07 | +0,06 (+0,5) | −2 pe | – | +0,14 / −0,20  |
| Lågpress | 82 | 1,26–1,23 | −0,01 | −0,02 (−0,1) | +4 pe | – | +0,03 / −0,14  |
| Mellanpress | 86 | 1,41–1,49 | +0,23 | +0,23 (+1,6) | −4 pe | – | +0,26 / +0,19 ✔ |
| Högpress | 60 | 1,13–1,78 | −0,29 | −0,30 (−2,2) | +3 pe | – | −0,80 / −0,20 ✔ ⚑ |
| Svag på fasta | 96 | 1,23–1,52 | +0,09 | +0,09 (+0,7) | +2 pe | – | +0,25 / −0,06  |
| Medel på fasta | 71 | 1,32–1,54 | −0,22 | −0,23 (−1,7) | +2 pe | – | −0,27 / −0,18 ✔ |
| Farlig på fasta | 61 | 1,31–1,33 | +0,14 | +0,13 (+0,8) | −3 pe | – | +0,15 / +0,11 ✔ |
| Stark mot fasta | 63 | 1,57–1,02 | +0,52 | +0,51 (+3,3) | +3 pe | – | +0,51 / +0,52 ✔ ⚑ |
| Medel mot fasta | 106 | 1,06–1,75 | −0,32 | −0,33 (−3,2) | +3 pe | – | −0,31 / −0,35 ✔ ⚑ |
| Svag mot fasta | 59 | 1,37–1,46 | +0,06 | +0,05 (+0,3) | −6 pe | – | +0,19 / −0,14  |

- Svårast mot **Medel mot fasta** (−0,33 p/match rel. eget snitt, z −3,2, 106 m) – ⚑ håller i båda halvorna
- Bäst mot **Stark mot fasta** (+0,51 p/match rel. eget snitt, z +3,3, 63 m) – ⚑ håller i båda halvorna

### Silkeborg

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 47,6 %). 108 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,21), 0,33 emot (xG 0,30), 4,22 hörnor · 2025/26 (32 m): 0,13 mål för (xG 0,21), 0,25 emot (xG 0,26), 4,31 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 36 | 1,53–1,58 | −0,04 | +0,02 (+0,1) | +5 pe | – | −0,08 / +0,13  |
| Balanserat | 50 | 1,16–1,78 | −0,25 | −0,20 (−1,2) | +4 pe | – | −0,27 / −0,15 ✔ |
| Bollinnehav | 22 | 1,45–1,59 | +0,37 | +0,42 (+1,7) | −5 pe | – | +0,31 / +0,62 ✔ |
| Kortpass | 38 | 1,39–1,39 | +0,44 | +0,50 (+2,6) | −0 pe | – | +0,62 / +0,40 ✔ ⚑ |
| Blandat | 51 | 1,24–2,02 | −0,44 | −0,38 (−2,5) | +3 pe | – | −0,60 / −0,18 ✔ ⚑ |
| Direktspel | 19 | 1,53–1,32 | −0,02 | +0,04 (+0,1) | +5 pe | – | +0,15 / −0,15  |
| Lågpress | 15 | 0,93–1,53 | −0,35 | −0,30 (−1,0) | +8 pe | – | −1,34 / +0,08  |
| Mellanpress | 42 | 1,33–1,76 | −0,04 | +0,01 (+0,1) | +2 pe | – | +0,08 / −0,01  |
| Högpress | 51 | 1,47–1,65 | +0,02 | +0,08 (+0,4) | +1 pe | – | +0,05 / +0,17 ✔ |
| Svag på fasta | 38 | 1,37–1,84 | −0,07 | −0,02 (−0,1) | −0 pe | – | −0,05 / +0,01  |
| Medel på fasta | 41 | 1,39–1,61 | +0,02 | +0,08 (+0,4) | +6 pe | – | −0,10 / +0,51  |
| Farlig på fasta | 29 | 1,24–1,55 | −0,14 | −0,09 (−0,4) | −0 pe | – | +0,14 / −0,18  |
| Stark mot fasta | 38 | 1,39–1,32 | −0,13 | −0,07 (−0,3) | +3 pe | – | −0,12 / −0,03 ✔ |
| Medel mot fasta | 42 | 1,21–1,83 | −0,11 | −0,06 (−0,3) | −0 pe | – | −0,07 / −0,03 ✔ |
| Svag mot fasta | 28 | 1,46–1,93 | +0,13 | +0,18 (+0,8) | +5 pe | – | +0,18 / +0,18 ✔ |

- Svårast mot **Blandat** (−0,38 p/match rel. eget snitt, z −2,5, 51 m) – ⚑ håller i båda halvorna
- Bäst mot **Kortpass** (+0,50 p/match rel. eget snitt, z +2,6, 38 m) – ⚑ håller i båda halvorna

### Sonderjyske

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 39,8 %). 139 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026/27 (9 m): 0,56 mål för (xG 0,30), 0,44 emot (xG 0,32), 4,44 hörnor · 2025/26 (32 m): 0,22 mål för (xG 0,31), 0,28 emot (xG 0,30), 4,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 50 | 1,22–1,38 | −0,03 | +0,05 (+0,3) | +7 pe | – | +0,07 / +0,02 ✔ |
| Balanserat | 57 | 1,14–1,56 | −0,01 | +0,08 (+0,5) | +2 pe | – | −0,17 / +0,21  |
| Bollinnehav | 32 | 1,00–1,88 | −0,31 | −0,22 (−1,1) | −13 pe | – | −0,30 / −0,14 ✔ |
| Kortpass | 25 | 1,00–1,52 | −0,05 | +0,04 (+0,1) | −1 pe | – | – / +0,04  |
| Blandat | 53 | 1,19–1,77 | −0,06 | +0,03 (+0,2) | −0 pe | – | −0,21 / +0,24  |
| Direktspel | 61 | 1,15–1,41 | −0,12 | −0,04 (−0,3) | +3 pe | – | −0,02 / −0,09 ✔ |
| Lågpress | 57 | 1,12–1,44 | +0,03 | +0,11 (+0,7) | +2 pe | – | −0,04 / +0,38  |
| Mellanpress | 63 | 1,08–1,46 | −0,16 | −0,07 (−0,5) | +3 pe | – | −0,27 / +0,06  |
| Högpress | 19 | 1,37–2,32 | −0,17 | −0,09 (−0,3) | −9 pe | – | +0,28 / −0,35  |
| Svag på fasta | 48 | 1,15–1,63 | −0,12 | −0,04 (−0,2) | −3 pe | – | −0,36 / +0,50  |
| Medel på fasta | 35 | 1,17–1,54 | −0,03 | +0,05 (+0,3) | −1 pe | – | −0,03 / +0,16  |
| Farlig på fasta | 56 | 1,11–1,54 | −0,09 | −0,00 (−0,0) | +5 pe | – | +0,26 / −0,15  |
| Stark mot fasta | 43 | 1,14–1,23 | −0,12 | −0,03 (−0,2) | +13 pe | – | +0,01 / −0,09  |
| Medel mot fasta | 54 | 1,09–1,93 | −0,16 | −0,08 (−0,5) | −10 pe | – | −0,17 / +0,00  |
| Svag mot fasta | 42 | 1,19–1,45 | +0,05 | +0,13 (+0,7) | +2 pe | – | −0,11 / +0,36  |

- Svårast mot **Bollinnehav** (−0,22 p/match rel. eget snitt, z −1,1, 32 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,13 p/match rel. eget snitt, z +0,7, 42 m) – inte stabilt, troligen slump

### Viborg

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,2 %). 112 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,46), 0,22 emot (xG 0,21), 4,89 hörnor · 2025/26 (32 m): 0,28 mål för (xG 0,32), 0,38 emot (xG 0,33), 4,75 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,53–1,79 | −0,19 | −0,25 (−1,3) | +0 pe | – | −0,49 / +0,12  |
| Balanserat | 38 | 1,18–1,16 | +0,01 | −0,05 (−0,2) | +3 pe | – | −0,15 / −0,01 ✔ |
| Bollinnehav | 36 | 1,44–1,36 | +0,38 | +0,31 (+1,4) | −12 pe | – | +0,31 / +0,32 ✔ |
| Kortpass | 45 | 1,42–1,40 | +0,35 | +0,28 (+1,4) | −17 pe | – | +0,30 / +0,27 ✔ |
| Blandat | 49 | 1,35–1,31 | −0,04 | −0,11 (−0,6) | +11 pe | – | −0,18 / −0,04 ✔ |
| Direktspel | 18 | 1,39–1,89 | −0,36 | −0,42 (−1,5) | −5 pe | – | −0,68 / +0,10  |
| Lågpress | 20 | 1,60–1,15 | +0,47 | +0,41 (+1,4) | −6 pe | – | −0,02 / +0,55  |
| Mellanpress | 44 | 1,39–1,45 | −0,04 | −0,10 (−0,6) | −1 pe | – | +0,08 / −0,22  |
| Högpress | 48 | 1,29–1,54 | −0,01 | −0,08 (−0,4) | −3 pe | – | −0,21 / +0,26  |
| Svag på fasta | 47 | 1,38–1,34 | +0,16 | +0,09 (+0,5) | −7 pe | – | −0,01 / +0,21  |
| Medel på fasta | 39 | 1,31–1,36 | +0,01 | −0,05 (−0,2) | −5 pe | – | −0,23 / +0,28  |
| Farlig på fasta | 26 | 1,50–1,73 | −0,04 | −0,10 (−0,4) | +9 pe | – | −0,01 / −0,12 ✔ |
| Stark mot fasta | 41 | 1,49–1,41 | −0,05 | −0,11 (−0,6) | −2 pe | – | +0,08 / −0,34  |
| Medel mot fasta | 48 | 1,19–1,54 | +0,05 | −0,01 (−0,1) | +2 pe | – | −0,28 / +0,33  |
| Svag mot fasta | 23 | 1,61–1,26 | +0,29 | +0,23 (+0,8) | −12 pe | – | −0,03 / +0,34  |

- Svårast mot **Direktspel** (−0,42 p/match rel. eget snitt, z −1,5, 18 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,31 p/match rel. eget snitt, z +1,4, 36 m) – åt samma håll i båda halvorna men svagt
