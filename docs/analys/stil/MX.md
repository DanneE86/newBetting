# Stilmatchning – Liga MX (MX)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2275 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 128 m · hemma −0,01 · kryss −5 pe · ö2,5 – | 268 m · hemma −0,01 · kryss +0 pe · ö2,5 – | 173 m · hemma −0,12 · kryss +1 pe · ö2,5 – |
| **Mellan** | 271 m · hemma +0,05 · kryss +2 pe · ö2,5 – | 465 m · hemma +0,04 · kryss −2 pe · ö2,5 – | 305 m · hemma −0,09 · kryss +2 pe · ö2,5 – |
| **Mycket boll** | 176 m · hemma −0,04 · kryss −2 pe · ö2,5 – | 306 m · hemma +0,18 · kryss −1 pe · ö2,5 – | 183 m · hemma +0,13 · kryss +3 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 214 m · hemma +0,04 · kryss +1 pe · ö2,5 – | 237 m · hemma +0,06 · kryss −3 pe · ö2,5 – | 230 m · hemma −0,06 · kryss −4 pe · ö2,5 – |
| **Balanserat** | 236 m · hemma +0,00 · kryss −0 pe · ö2,5 – | 368 m · hemma −0,03 · kryss +3 pe · ö2,5 – | 284 m · hemma +0,04 · kryss −1 pe · ö2,5 – |
| **Bollinnehav** | 230 m · hemma +0,07 · kryss −1 pe · ö2,5 – | 277 m · hemma +0,07 · kryss +0 pe · ö2,5 – | 199 m · hemma +0,03 · kryss +3 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 613 m · mot marknaden −0,04 (z −0,9) · mål 1,27 · ö2,5 – | 637 m · mot marknaden +0,03 (z +0,6) · mål 1,32 · ö2,5 – | 337 m · mot marknaden +0,12 (z +1,8) · mål 1,53 · ö2,5 – |
| **Medel på fasta** | 653 m · mot marknaden −0,04 (z −0,8) · mål 1,33 · ö2,5 – | 726 m · mot marknaden −0,07 (z −1,5) · mål 1,27 · ö2,5 – | 451 m · mot marknaden +0,05 (z +0,9) · mål 1,51 · ö2,5 – |
| **Farlig på fasta** | 368 m · mot marknaden −0,02 (z −0,2) · mål 1,39 · ö2,5 – | 422 m · mot marknaden +0,06 (z +1,0) · mål 1,38 · ö2,5 – | 343 m · mot marknaden −0,01 (z −0,1) · mål 1,38 · ö2,5 – |

## Lag (säsong 2026/27)

### Atl. San Luis

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 52,7 %). 228 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (10 m): 0,20 mål för (xG 0,21), 0,50 emot (xG 0,38), 2,80 hörnor · 2025/26 (34 m): 0,18 mål för (xG 0,24), 0,29 emot (xG 0,24), 4,41 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,16–1,71 | −0,21 | −0,19 (−1,3) | −6 pe | – | −0,27 / −0,07 ✔ |
| Balanserat | 92 | 1,36–1,64 | −0,02 | −0,01 (−0,0) | −11 pe | – | +0,03 / −0,03  |
| Bollinnehav | 67 | 1,34–1,46 | +0,18 | +0,20 (+1,3) | −5 pe | – | +0,17 / +0,23 ✔ |
| Kortpass | 56 | 1,50–1,45 | +0,40 | +0,42 (+2,5) | −10 pe | – | +0,48 / +0,40 ✔ ⚑ |
| Blandat | 88 | 1,27–1,76 | −0,18 | −0,16 (−1,2) | −9 pe | – | −0,04 / −0,24 ✔ |
| Direktspel | 84 | 1,18–1,56 | −0,13 | −0,11 (−0,8) | −6 pe | – | −0,13 / −0,05 ✔ |
| Lågpress | 73 | 1,14–1,40 | +0,07 | +0,08 (+0,6) | −0 pe | – | +0,03 / +0,22 ✔ |
| Mellanpress | 66 | 1,27–1,68 | −0,18 | −0,16 (−1,1) | −12 pe | – | −0,10 / −0,25 ✔ |
| Högpress | 89 | 1,44–1,73 | +0,03 | +0,05 (+0,4) | −11 pe | – | −0,07 / +0,10  |
| Svag på fasta | 76 | 1,29–1,61 | +0,01 | +0,03 (+0,2) | −2 pe | – | −0,04 / +0,13  |
| Medel på fasta | 102 | 1,23–1,56 | −0,00 | +0,01 (+0,1) | −6 pe | – | −0,19 / +0,19  |
| Farlig på fasta | 50 | 1,44–1,72 | −0,09 | −0,07 (−0,4) | −20 pe | – | +0,32 / −0,33  |
| Stark mot fasta | 77 | 1,22–1,52 | −0,00 | +0,01 (+0,1) | −6 pe | – | −0,09 / +0,19  |
| Medel mot fasta | 96 | 1,14–1,79 | −0,24 | −0,22 (−1,8) | −9 pe | – | −0,20 / −0,25 ✔ |
| Svag mot fasta | 55 | 1,67–1,42 | +0,35 | +0,37 (+2,2) | −8 pe | – | +0,62 / +0,26 ✔ ⚑ |

- Svårast mot **Medel mot fasta** (−0,22 p/match rel. eget snitt, z −1,8, 96 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,42 p/match rel. eget snitt, z +2,5, 56 m) – ⚑ håller i båda halvorna

### Atlas

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 52,9 %). 257 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (10 m): 0,30 mål för (xG 0,41), 0,20 emot (xG 0,28), 5,50 hörnor · 2025/26 (36 m): 0,31 mål för (xG 0,37), 0,33 emot (xG 0,23), 3,53 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 73 | 1,03–1,12 | +0,04 | +0,10 (+0,7) | −1 pe | – | +0,06 / +0,16 ✔ |
| Balanserat | 103 | 1,25–1,40 | +0,07 | +0,13 (+1,1) | −1 pe | – | +0,20 / +0,08 ✔ |
| Bollinnehav | 81 | 1,12–1,53 | −0,31 | −0,26 (−2,0) | +0 pe | – | −0,42 / −0,09 ✔ |
| Kortpass | 57 | 1,12–1,65 | −0,14 | −0,09 (−0,5) | −1 pe | – | −0,68 / +0,11  |
| Blandat | 105 | 1,17–1,56 | −0,12 | −0,06 (−0,5) | +3 pe | – | −0,11 / −0,03 ✔ |
| Direktspel | 95 | 1,14–0,97 | +0,06 | +0,12 (+0,9) | −4 pe | – | +0,11 / +0,14 ✔ |
| Lågpress | 99 | 1,15–1,24 | −0,06 | −0,01 (−0,1) | −3 pe | – | −0,03 / +0,04  |
| Mellanpress | 78 | 1,19–1,36 | −0,11 | −0,05 (−0,4) | −3 pe | – | −0,09 / +0,02  |
| Högpress | 80 | 1,10–1,51 | +0,01 | +0,06 (+0,5) | +5 pe | – | +0,06 / +0,06 ✔ |
| Svag på fasta | 96 | 0,96–1,33 | −0,23 | −0,17 (−1,4) | +1 pe | – | −0,22 / −0,08 ✔ |
| Medel på fasta | 104 | 1,33–1,35 | +0,15 | +0,21 (+1,8) | +0 pe | – | +0,28 / +0,16 ✔ |
| Farlig på fasta | 57 | 1,14–1,44 | −0,15 | −0,10 (−0,6) | −3 pe | – | −0,20 / −0,03 ✔ |
| Stark mot fasta | 92 | 1,24–1,24 | +0,03 | +0,08 (+0,6) | −3 pe | – | −0,08 / +0,32  |
| Medel mot fasta | 100 | 1,08–1,44 | −0,08 | −0,02 (−0,2) | −5 pe | – | +0,02 / −0,06  |
| Svag mot fasta | 65 | 1,12–1,42 | −0,14 | −0,09 (−0,6) | +9 pe | – | −0,09 / −0,08 ✔ |

- Svårast mot **Bollinnehav** (−0,26 p/match rel. eget snitt, z −2,0, 81 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,21 p/match rel. eget snitt, z +1,8, 104 m) – åt samma håll i båda halvorna men svagt

### Club America

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 55,7 %). 284 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026/27 (9 m): 0,56 mål för (xG 0,56), 0,22 emot (xG 0,17), 7,00 hörnor · 2025/26 (38 m): 0,26 mål för (xG 0,26), 0,21 emot (xG 0,19), 5,95 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 84 | 1,68–1,02 | +0,13 | −0,01 (−0,1) | +3 pe | – | −0,11 / +0,09  |
| Balanserat | 100 | 1,83–1,05 | +0,11 | −0,04 (−0,3) | +1 pe | – | +0,06 / −0,14  |
| Bollinnehav | 100 | 1,66–0,97 | +0,20 | +0,05 (+0,4) | −1 pe | – | +0,21 / −0,10  |
| Kortpass | 64 | 1,88–1,00 | +0,22 | +0,07 (+0,5) | −8 pe | – | +0,34 / −0,01  |
| Blandat | 121 | 1,57–0,98 | +0,08 | −0,07 (−0,6) | +3 pe | – | +0,00 / −0,12  |
| Direktspel | 99 | 1,82–1,07 | +0,18 | +0,04 (+0,3) | +4 pe | – | +0,04 / +0,03 ✔ |
| Lågpress | 89 | 1,75–1,09 | +0,16 | +0,01 (+0,1) | +2 pe | – | −0,05 / +0,19  |
| Mellanpress | 88 | 1,76–1,00 | +0,13 | −0,02 (−0,1) | −1 pe | – | +0,14 / −0,26  |
| Högpress | 107 | 1,67–0,96 | +0,15 | +0,01 (+0,1) | +1 pe | – | +0,20 / −0,04  |
| Svag på fasta | 112 | 1,52–0,95 | +0,23 | +0,09 (+0,8) | +0 pe | – | +0,18 / −0,06  |
| Medel på fasta | 104 | 1,86–1,01 | +0,22 | +0,08 (+0,7) | −1 pe | – | −0,04 / +0,17  |
| Farlig på fasta | 68 | 1,87–1,13 | −0,11 | −0,26 (−1,7) | +5 pe | – | −0,07 / −0,38 ✔ |
| Stark mot fasta | 104 | 1,70–0,98 | +0,12 | −0,03 (−0,3) | +1 pe | – | −0,01 / −0,07 ✔ |
| Medel mot fasta | 106 | 1,60–1,13 | +0,02 | −0,13 (−1,1) | +2 pe | – | +0,04 / −0,23  |
| Svag mot fasta | 74 | 1,93–0,89 | +0,38 | +0,23 (+1,8) | −0 pe | – | +0,21 / +0,25 ✔ |

- Svårast mot **Farlig på fasta** (−0,26 p/match rel. eget snitt, z −1,7, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,23 p/match rel. eget snitt, z +1,8, 74 m) – åt samma håll i båda halvorna men svagt

### Club Leon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 50,1 %). 254 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (10 m): 0,10 mål för (xG 0,18), 0,20 emot (xG 0,18), 3,80 hörnor · 2025/26 (34 m): 0,15 mål för (xG 0,26), 0,38 emot (xG 0,30), 5,00 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,38–1,17 | +0,12 | +0,11 (+0,8) | −4 pe | – | +0,14 / +0,07 ✔ |
| Balanserat | 95 | 1,28–1,52 | −0,22 | −0,24 (−1,9) | +1 pe | – | −0,31 / −0,18 ✔ |
| Bollinnehav | 77 | 1,48–1,22 | +0,19 | +0,17 (+1,3) | −1 pe | – | +0,40 / −0,07  |
| Kortpass | 56 | 1,16–1,39 | −0,05 | −0,06 (−0,4) | +5 pe | – | +0,19 / −0,14  |
| Blandat | 98 | 1,52–1,44 | +0,03 | +0,02 (+0,1) | −2 pe | – | +0,30 / −0,17  |
| Direktspel | 100 | 1,35–1,15 | +0,03 | +0,02 (+0,1) | −4 pe | – | −0,06 / +0,27  |
| Lågpress | 78 | 1,32–1,29 | −0,10 | −0,11 (−0,8) | +2 pe | – | −0,15 / −0,04 ✔ |
| Mellanpress | 88 | 1,58–1,24 | +0,22 | +0,21 (+1,5) | −6 pe | – | +0,29 / +0,08 ✔ |
| Högpress | 88 | 1,22–1,41 | −0,10 | −0,11 (−0,8) | +0 pe | – | +0,06 / −0,16  |
| Svag på fasta | 94 | 1,36–1,39 | −0,03 | −0,04 (−0,3) | −3 pe | – | −0,00 / −0,12 ✔ |
| Medel på fasta | 102 | 1,28–1,20 | +0,10 | +0,09 (+0,7) | −1 pe | – | +0,24 / −0,03  |
| Farlig på fasta | 58 | 1,55–1,40 | −0,07 | −0,08 (−0,5) | −1 pe | – | −0,05 / −0,10 ✔ |
| Stark mot fasta | 102 | 1,26–1,27 | −0,14 | −0,15 (−1,2) | −3 pe | – | −0,19 / −0,09 ✔ |
| Medel mot fasta | 86 | 1,43–1,43 | +0,17 | +0,15 (+1,2) | −1 pe | – | +0,34 / +0,00 ✔ |
| Svag mot fasta | 66 | 1,47–1,23 | +0,05 | +0,04 (+0,2) | +0 pe | – | +0,31 / −0,14  |

- Svårast mot **Balanserat** (−0,24 p/match rel. eget snitt, z −1,9, 95 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +1,5, 88 m) – åt samma håll i båda halvorna men svagt

### Club Tijuana

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 44,1 %). 241 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,32), 0,33 emot (xG 0,24), 3,89 hörnor · 2025/26 (36 m): 0,25 mål för (xG 0,30), 0,14 emot (xG 0,24), 3,50 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,18–1,54 | +0,01 | +0,11 (+0,8) | −4 pe | – | +0,05 / +0,19 ✔ |
| Balanserat | 93 | 1,39–1,52 | +0,02 | +0,12 (+0,9) | +8 pe | – | +0,03 / +0,19 ✔ |
| Bollinnehav | 77 | 1,06–1,68 | −0,34 | −0,24 (−2,0) | +3 pe | – | −0,50 / +0,03  |
| Kortpass | 57 | 1,30–1,56 | −0,05 | +0,04 (+0,3) | +4 pe | – | −0,46 / +0,18  |
| Blandat | 94 | 1,23–1,64 | −0,22 | −0,12 (−1,1) | +2 pe | – | −0,42 / +0,08  |
| Direktspel | 90 | 1,17–1,51 | +0,01 | +0,10 (+0,8) | +3 pe | – | +0,07 / +0,21 ✔ |
| Lågpress | 83 | 1,16–1,41 | −0,09 | +0,01 (+0,1) | +10 pe | – | −0,12 / +0,27  |
| Mellanpress | 79 | 1,10–1,63 | −0,24 | −0,14 (−1,2) | −2 pe | – | −0,31 / +0,11  |
| Högpress | 79 | 1,42–1,68 | +0,04 | +0,13 (+0,9) | +0 pe | – | +0,29 / +0,09 ✔ |
| Svag på fasta | 75 | 1,04–1,61 | −0,19 | −0,10 (−0,7) | +1 pe | – | −0,18 / +0,07  |
| Medel på fasta | 100 | 1,22–1,43 | +0,02 | +0,11 (+1,0) | +7 pe | – | −0,00 / +0,21  |
| Farlig på fasta | 66 | 1,44–1,74 | −0,16 | −0,06 (−0,4) | −1 pe | – | −0,30 / +0,09  |
| Stark mot fasta | 88 | 1,08–1,51 | −0,07 | +0,03 (+0,2) | −0 pe | – | −0,07 / +0,22  |
| Medel mot fasta | 93 | 1,30–1,58 | +0,03 | +0,12 (+1,0) | +5 pe | – | −0,06 / +0,26  |
| Svag mot fasta | 60 | 1,32–1,65 | −0,32 | −0,23 (−1,6) | +5 pe | – | −0,44 / −0,10 ✔ |

- Svårast mot **Bollinnehav** (−0,24 p/match rel. eget snitt, z −2,0, 77 m) – inte stabilt, troligen slump
- Bäst mot **Medel mot fasta** (+0,12 p/match rel. eget snitt, z +1,0, 93 m) – inte stabilt, troligen slump

### Cruz Azul

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 55,4 %). 276 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026/27 (10 m): 0,40 mål för (xG 0,25), 0,20 emot (xG 0,29), 6,30 hörnor · 2025/26 (44 m): 0,27 mål för (xG 0,30), 0,20 emot (xG 0,19), 5,64 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,51–1,15 | +0,15 | +0,07 (+0,5) | −3 pe | – | −0,01 / +0,18  |
| Balanserat | 111 | 1,58–1,21 | +0,04 | −0,04 (−0,3) | +1 pe | – | −0,21 / +0,06  |
| Bollinnehav | 83 | 1,36–1,07 | +0,07 | −0,01 (−0,1) | −3 pe | – | +0,07 / −0,13  |
| Kortpass | 67 | 1,58–1,01 | +0,17 | +0,08 (+0,6) | +9 pe | – | +0,67 / −0,06  |
| Blandat | 117 | 1,50–1,16 | +0,08 | −0,00 (−0,0) | −5 pe | – | −0,16 / +0,14  |
| Direktspel | 92 | 1,42–1,23 | +0,03 | −0,06 (−0,4) | −5 pe | – | −0,08 / +0,03  |
| Lågpress | 84 | 1,54–1,11 | +0,18 | +0,09 (+0,6) | −2 pe | – | +0,16 / −0,06  |
| Mellanpress | 98 | 1,50–1,38 | −0,02 | −0,10 (−0,8) | −1 pe | – | −0,31 / +0,17  |
| Högpress | 94 | 1,45–0,95 | +0,11 | +0,02 (+0,2) | −1 pe | – | +0,09 / +0,00 ✔ |
| Svag på fasta | 96 | 1,44–1,08 | +0,15 | +0,06 (+0,5) | −5 pe | – | +0,04 / +0,12 ✔ |
| Medel på fasta | 111 | 1,42–1,15 | +0,05 | −0,03 (−0,3) | −0 pe | – | −0,16 / +0,07  |
| Farlig på fasta | 69 | 1,68–1,23 | +0,04 | −0,04 (−0,3) | +2 pe | – | −0,03 / −0,05 ✔ |
| Stark mot fasta | 90 | 1,48–1,12 | +0,07 | −0,01 (−0,1) | −7 pe | – | −0,05 / +0,04  |
| Medel mot fasta | 118 | 1,49–1,10 | +0,20 | +0,11 (+1,0) | −2 pe | – | +0,03 / +0,18 ✔ |
| Svag mot fasta | 68 | 1,51–1,26 | −0,10 | −0,18 (−1,2) | +7 pe | – | −0,17 / −0,19 ✔ |

- Svårast mot **Svag mot fasta** (−0,18 p/match rel. eget snitt, z −1,2, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,11 p/match rel. eget snitt, z +1,0, 118 m) – åt samma håll i båda halvorna men svagt

### Guadalajara Chivas

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 59,5 %). 264 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (10 m): 0,40 mål för (xG 0,34), 0,00 emot (xG 0,12), 8,00 hörnor · 2025/26 (40 m): 0,32 mål för (xG 0,34), 0,20 emot (xG 0,11), 5,85 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,29–1,11 | +0,03 | −0,01 (−0,1) | −0 pe | – | −0,21 / +0,30  |
| Balanserat | 105 | 1,41–1,04 | +0,13 | +0,09 (+0,8) | +1 pe | – | +0,16 / +0,04 ✔ |
| Bollinnehav | 76 | 1,32–1,30 | −0,07 | −0,11 (−0,8) | +2 pe | – | +0,16 / −0,36  |
| Kortpass | 51 | 1,47–1,12 | −0,00 | −0,04 (−0,3) | +8 pe | – | +0,26 / −0,10  |
| Blandat | 111 | 1,30–1,19 | +0,04 | −0,01 (−0,1) | −3 pe | – | +0,12 / −0,10  |
| Direktspel | 102 | 1,33–1,09 | +0,07 | +0,03 (+0,2) | +1 pe | – | −0,07 / +0,35  |
| Lågpress | 96 | 1,18–1,17 | −0,11 | −0,15 (−1,2) | −2 pe | – | −0,03 / −0,39 ✔ |
| Mellanpress | 76 | 1,47–1,17 | +0,11 | +0,06 (+0,4) | +2 pe | – | +0,01 / +0,14 ✔ |
| Högpress | 92 | 1,41–1,08 | +0,15 | +0,11 (+0,9) | +2 pe | – | +0,16 / +0,09 ✔ |
| Svag på fasta | 84 | 1,25–1,17 | +0,09 | +0,05 (+0,3) | −0 pe | – | +0,19 / −0,27  |
| Medel på fasta | 109 | 1,45–1,20 | −0,01 | −0,06 (−0,5) | +1 pe | – | −0,16 / +0,01  |
| Farlig på fasta | 71 | 1,30–1,00 | +0,07 | +0,03 (+0,2) | +2 pe | – | −0,06 / +0,09  |
| Stark mot fasta | 90 | 1,41–1,16 | +0,07 | +0,03 (+0,2) | −1 pe | – | −0,05 / +0,16  |
| Medel mot fasta | 105 | 1,33–1,19 | +0,03 | −0,01 (−0,1) | −1 pe | – | +0,11 / −0,11  |
| Svag mot fasta | 69 | 1,28–1,03 | +0,02 | −0,02 (−0,2) | +5 pe | – | −0,01 / −0,03 ✔ |

- Svårast mot **Lågpress** (−0,15 p/match rel. eget snitt, z −1,2, 96 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,11 p/match rel. eget snitt, z +0,9, 92 m) – åt samma håll i båda halvorna men svagt

### Juarez

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 43,6 %). 217 matcher med stil, mot marknaden totalt −0,12 per match.

Fasta situationer per match: 2026/27 (10 m): 0,00 mål för (xG 0,19), 0,50 emot (xG 0,36), 3,00 hörnor · 2025/26 (36 m): 0,36 mål för (xG 0,29), 0,28 emot (xG 0,28), 4,56 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,05–1,68 | −0,10 | +0,02 (+0,1) | −2 pe | – | −0,02 / +0,06  |
| Balanserat | 84 | 1,06–1,62 | −0,14 | −0,02 (−0,1) | −6 pe | – | +0,22 / −0,19  |
| Bollinnehav | 68 | 1,04–1,57 | −0,11 | +0,01 (+0,0) | +5 pe | – | −0,11 / +0,13  |
| Kortpass | 55 | 1,16–1,80 | −0,03 | +0,09 (+0,6) | −4 pe | – | −0,19 / +0,15  |
| Blandat | 84 | 1,10–1,50 | −0,08 | +0,04 (+0,3) | +1 pe | – | +0,24 / −0,13  |
| Direktspel | 78 | 0,92–1,63 | −0,23 | −0,11 (−0,8) | −2 pe | – | −0,07 / −0,24 ✔ |
| Lågpress | 74 | 0,81–1,61 | −0,31 | −0,19 (−1,5) | −2 pe | – | −0,10 / −0,37 ✔ |
| Mellanpress | 61 | 1,16–1,64 | −0,03 | +0,09 (+0,6) | −11 pe | – | +0,05 / +0,15 ✔ |
| Högpress | 82 | 1,18–1,62 | −0,01 | +0,11 (+0,8) | +7 pe | – | +0,27 / +0,04 ✔ |
| Svag på fasta | 72 | 0,85–1,44 | −0,11 | +0,00 (+0,0) | +1 pe | – | +0,02 / −0,03  |
| Medel på fasta | 93 | 1,19–1,66 | −0,02 | +0,10 (+0,8) | +1 pe | – | +0,11 / +0,09 ✔ |
| Farlig på fasta | 52 | 1,08–1,81 | −0,31 | −0,19 (−1,3) | −7 pe | – | −0,12 / −0,24 ✔ |
| Stark mot fasta | 70 | 0,93–1,41 | +0,10 | +0,22 (+1,4) | −10 pe | – | +0,16 / +0,33 ✔ |
| Medel mot fasta | 92 | 0,93–1,72 | −0,30 | −0,18 (−1,7) | −2 pe | – | −0,22 / −0,14 ✔ |
| Svag mot fasta | 55 | 1,40–1,73 | −0,10 | +0,02 (+0,1) | +12 pe | – | +0,25 / −0,13  |

- Svårast mot **Medel mot fasta** (−0,18 p/match rel. eget snitt, z −1,7, 92 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,22 p/match rel. eget snitt, z +1,4, 70 m) – åt samma håll i båda halvorna men svagt

### Monterrey

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 57,1 %). 273 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026/27 (9 m): 0,44 mål för (xG 0,39), 0,33 emot (xG 0,32), 6,67 hörnor · 2025/26 (38 m): 0,24 mål för (xG 0,25), 0,13 emot (xG 0,22), 4,47 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 1,60–1,04 | −0,05 | −0,00 (−0,0) | +0 pe | – | −0,13 / +0,16  |
| Balanserat | 112 | 1,71–1,22 | +0,12 | +0,16 (+1,4) | −5 pe | – | +0,13 / +0,20 ✔ |
| Bollinnehav | 84 | 1,37–1,17 | −0,26 | −0,21 (−1,6) | +4 pe | – | −0,18 / −0,25 ✔ |
| Kortpass | 61 | 1,52–1,21 | −0,26 | −0,22 (−1,5) | +2 pe | – | −0,46 / −0,15 ✔ |
| Blandat | 111 | 1,60–1,23 | +0,00 | +0,05 (+0,4) | −4 pe | – | +0,07 / +0,04 ✔ |
| Direktspel | 101 | 1,57–1,03 | +0,04 | +0,08 (+0,7) | +1 pe | – | −0,05 / +0,53  |
| Lågpress | 94 | 1,35–1,18 | −0,19 | −0,14 (−1,2) | −2 pe | – | −0,12 / −0,19 ✔ |
| Mellanpress | 85 | 1,66–1,06 | +0,05 | +0,10 (+0,7) | −1 pe | – | +0,07 / +0,13 ✔ |
| Högpress | 94 | 1,72–1,21 | +0,01 | +0,06 (+0,4) | +1 pe | – | −0,14 / +0,12  |
| Svag på fasta | 95 | 1,52–1,33 | −0,32 | −0,28 (−2,3) | +9 pe | – | −0,25 / −0,34 ✔ ⚑ |
| Medel på fasta | 111 | 1,51–1,15 | −0,06 | −0,02 (−0,1) | −5 pe | – | +0,11 / −0,11  |
| Farlig på fasta | 67 | 1,76–0,91 | +0,38 | +0,42 (+3,1) | −7 pe | – | +0,13 / +0,60 ✔ ⚑ |
| Stark mot fasta | 104 | 1,55–1,10 | −0,16 | −0,12 (−1,0) | +6 pe | – | −0,14 / −0,09 ✔ |
| Medel mot fasta | 110 | 1,55–1,28 | +0,01 | +0,06 (+0,5) | −4 pe | – | −0,01 / +0,11  |
| Svag mot fasta | 59 | 1,66–1,02 | +0,06 | +0,10 (+0,7) | −5 pe | – | +0,12 / +0,09 ✔ |

- Svårast mot **Svag på fasta** (−0,28 p/match rel. eget snitt, z −2,3, 95 m) – ⚑ håller i båda halvorna
- Bäst mot **Farlig på fasta** (+0,42 p/match rel. eget snitt, z +3,1, 67 m) – ⚑ håller i båda halvorna

### Necaxa

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 50,3 %). 243 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (10 m): 0,50 mål för (xG 0,57), 0,60 emot (xG 0,54), 5,40 hörnor · 2025/26 (34 m): 0,24 mål för (xG 0,26), 0,32 emot (xG 0,33), 4,85 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,19–1,67 | −0,10 | −0,05 (−0,3) | −10 pe | – | −0,04 / −0,07 ✔ |
| Balanserat | 93 | 1,33–1,42 | −0,00 | +0,04 (+0,3) | +2 pe | – | +0,15 / −0,04  |
| Bollinnehav | 81 | 1,28–1,54 | −0,05 | −0,00 (−0,0) | −4 pe | – | −0,01 / +0,00  |
| Kortpass | 61 | 1,36–1,66 | −0,19 | −0,14 (−1,0) | −1 pe | – | −0,18 / −0,13 ✔ |
| Blandat | 96 | 1,33–1,55 | +0,08 | +0,12 (+1,0) | +1 pe | – | +0,15 / +0,10 ✔ |
| Direktspel | 86 | 1,15–1,42 | −0,08 | −0,04 (−0,3) | −9 pe | – | −0,00 / −0,16 ✔ |
| Lågpress | 84 | 1,13–1,63 | −0,16 | −0,11 (−0,9) | −9 pe | – | −0,09 / −0,16 ✔ |
| Mellanpress | 79 | 1,32–1,30 | +0,11 | +0,15 (+1,1) | −3 pe | – | +0,15 / +0,15 ✔ |
| Högpress | 80 | 1,39–1,65 | −0,08 | −0,03 (−0,3) | +2 pe | – | +0,13 / −0,08  |
| Svag på fasta | 83 | 1,24–1,72 | −0,15 | −0,10 (−0,7) | −14 pe | – | +0,03 / −0,41  |
| Medel på fasta | 98 | 1,19–1,50 | −0,05 | −0,01 (−0,1) | −2 pe | – | +0,09 / −0,07  |
| Farlig på fasta | 62 | 1,45–1,32 | +0,10 | +0,15 (+1,0) | +9 pe | – | −0,05 / +0,28  |
| Stark mot fasta | 90 | 1,17–1,48 | −0,20 | −0,15 (−1,2) | −8 pe | – | −0,02 / −0,36 ✔ |
| Medel mot fasta | 90 | 1,27–1,68 | −0,02 | +0,02 (+0,2) | +1 pe | – | +0,06 / −0,01  |
| Svag mot fasta | 63 | 1,44–1,40 | +0,13 | +0,18 (+1,1) | −2 pe | – | +0,11 / +0,23 ✔ |

- Svårast mot **Stark mot fasta** (−0,15 p/match rel. eget snitt, z −1,2, 90 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,18 p/match rel. eget snitt, z +1,1, 63 m) – åt samma håll i båda halvorna men svagt

### Pachuca

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 46,8 %). 268 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (10 m): 0,20 mål för (xG 0,30), 0,10 emot (xG 0,19), 5,10 hörnor · 2025/26 (38 m): 0,24 mål för (xG 0,20), 0,32 emot (xG 0,18), 4,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,53–1,20 | +0,09 | +0,07 (+0,4) | −5 pe | – | +0,06 / +0,07 ✔ |
| Balanserat | 101 | 1,41–1,19 | +0,05 | +0,03 (+0,2) | +1 pe | – | +0,07 / −0,00  |
| Bollinnehav | 84 | 1,52–1,26 | −0,07 | −0,10 (−0,7) | +1 pe | – | +0,12 / −0,38  |
| Kortpass | 62 | 1,26–1,15 | −0,18 | −0,20 (−1,3) | +1 pe | – | −0,28 / −0,18 ✔ |
| Blandat | 105 | 1,47–1,30 | +0,03 | +0,01 (+0,0) | −4 pe | – | +0,26 / −0,17  |
| Direktspel | 101 | 1,63–1,18 | +0,14 | +0,12 (+1,0) | +2 pe | – | +0,06 / +0,30 ✔ |
| Lågpress | 99 | 1,41–1,13 | −0,04 | −0,07 (−0,5) | −1 pe | – | −0,05 / −0,10 ✔ |
| Mellanpress | 90 | 1,56–1,13 | +0,17 | +0,15 (+1,1) | −1 pe | – | +0,17 / +0,12 ✔ |
| Högpress | 79 | 1,48–1,42 | −0,06 | −0,08 (−0,6) | −1 pe | – | +0,38 / −0,21  |
| Svag på fasta | 92 | 1,47–1,16 | +0,04 | +0,01 (+0,1) | −3 pe | – | +0,19 / −0,41  |
| Medel på fasta | 111 | 1,33–1,26 | −0,00 | −0,03 (−0,2) | +4 pe | – | +0,02 / −0,06  |
| Farlig på fasta | 65 | 1,75–1,22 | +0,05 | +0,03 (+0,2) | −5 pe | – | −0,06 / +0,09  |
| Stark mot fasta | 103 | 1,33–1,26 | −0,18 | −0,21 (−1,7) | +0 pe | – | −0,11 / −0,37 ✔ |
| Medel mot fasta | 96 | 1,45–1,20 | +0,13 | +0,11 (+0,8) | −3 pe | – | +0,17 / +0,06 ✔ |
| Svag mot fasta | 69 | 1,75–1,17 | +0,18 | +0,15 (+1,0) | +1 pe | – | +0,41 / −0,02  |

- Svårast mot **Stark mot fasta** (−0,21 p/match rel. eget snitt, z −1,7, 103 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,15 p/match rel. eget snitt, z +1,1, 90 m) – åt samma håll i båda halvorna men svagt

### Puebla

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 41,6 %). 254 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (10 m): 0,30 mål för (xG 0,32), 0,30 emot (xG 0,27), 4,50 hörnor · 2025/26 (34 m): 0,18 mål för (xG 0,24), 0,35 emot (xG 0,32), 4,68 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 74 | 1,04–1,58 | −0,09 | −0,06 (−0,5) | −6 pe | – | +0,21 / −0,47  |
| Balanserat | 94 | 1,26–1,74 | −0,05 | −0,03 (−0,3) | +3 pe | – | −0,07 / −0,01 ✔ |
| Bollinnehav | 86 | 1,08–1,37 | +0,07 | +0,09 (+0,7) | −1 pe | – | +0,22 / −0,06  |
| Kortpass | 60 | 1,02–1,50 | +0,06 | +0,08 (+0,5) | −6 pe | – | +0,26 / +0,02 ✔ |
| Blandat | 104 | 1,16–1,59 | −0,05 | −0,03 (−0,2) | −2 pe | – | +0,21 / −0,22  |
| Direktspel | 90 | 1,18–1,60 | −0,04 | −0,02 (−0,2) | +4 pe | – | +0,05 / −0,21  |
| Lågpress | 82 | 1,09–1,32 | +0,11 | +0,13 (+1,0) | −3 pe | – | +0,23 / −0,08  |
| Mellanpress | 85 | 1,18–1,64 | −0,07 | −0,05 (−0,4) | −3 pe | – | +0,12 / −0,30  |
| Högpress | 87 | 1,14–1,75 | −0,10 | −0,08 (−0,6) | +3 pe | – | −0,08 / −0,07 ✔ |
| Svag på fasta | 91 | 1,26–1,44 | +0,15 | +0,17 (+1,3) | −2 pe | – | +0,25 / +0,05 ✔ |
| Medel på fasta | 98 | 1,03–1,58 | −0,09 | −0,07 (−0,6) | +2 pe | – | +0,11 / −0,21  |
| Farlig på fasta | 65 | 1,11–1,74 | −0,15 | −0,13 (−0,9) | −3 pe | – | −0,05 / −0,19 ✔ |
| Stark mot fasta | 88 | 1,07–1,41 | −0,02 | −0,00 (−0,0) | +1 pe | – | +0,21 / −0,30  |
| Medel mot fasta | 112 | 1,12–1,78 | −0,09 | −0,07 (−0,7) | −0 pe | – | −0,07 / −0,07 ✔ |
| Svag mot fasta | 54 | 1,28–1,41 | +0,13 | +0,15 (+0,9) | −4 pe | – | +0,43 / −0,05  |

- Svårast mot **Farlig på fasta** (−0,13 p/match rel. eget snitt, z −0,9, 65 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,17 p/match rel. eget snitt, z +1,3, 91 m) – åt samma håll i båda halvorna men svagt

### Queretaro

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 38,6 %). 238 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,20), 0,11 emot (xG 0,21), 4,67 hörnor · 2025/26 (34 m): 0,12 mål för (xG 0,21), 0,24 emot (xG 0,26), 4,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 70 | 1,24–1,47 | +0,11 | +0,10 (+0,6) | −1 pe | – | −0,11 / +0,42  |
| Balanserat | 91 | 1,08–1,34 | +0,06 | +0,04 (+0,3) | +7 pe | – | −0,19 / +0,20  |
| Bollinnehav | 77 | 1,01–1,60 | −0,12 | −0,14 (−1,0) | −1 pe | – | −0,32 / +0,06  |
| Kortpass | 56 | 1,07–1,59 | −0,04 | −0,06 (−0,4) | +8 pe | – | −0,22 / −0,02 ✔ |
| Blandat | 95 | 1,17–1,51 | +0,14 | +0,13 (+1,0) | −5 pe | – | −0,20 / +0,35  |
| Direktspel | 87 | 1,06–1,33 | −0,09 | −0,10 (−0,8) | +6 pe | – | −0,21 / +0,27  |
| Lågpress | 77 | 1,12–1,45 | −0,02 | −0,04 (−0,3) | +7 pe | – | −0,21 / +0,34  |
| Mellanpress | 77 | 1,17–1,34 | +0,02 | +0,00 (+0,0) | +0 pe | – | −0,09 / +0,15  |
| Högpress | 84 | 1,04–1,58 | +0,05 | +0,03 (+0,3) | −1 pe | – | −0,46 / +0,18  |
| Svag på fasta | 87 | 0,99–1,47 | −0,17 | −0,18 (−1,5) | +2 pe | – | −0,35 / +0,12  |
| Medel på fasta | 89 | 1,15–1,52 | +0,07 | +0,06 (+0,4) | −1 pe | – | −0,21 / +0,26  |
| Farlig på fasta | 62 | 1,21–1,37 | +0,19 | +0,17 (+1,1) | +7 pe | – | +0,14 / +0,19 ✔ |
| Stark mot fasta | 87 | 1,13–1,51 | −0,11 | −0,12 (−1,1) | +5 pe | – | −0,37 / +0,29  |
| Medel mot fasta | 91 | 1,07–1,55 | −0,02 | −0,03 (−0,3) | −2 pe | – | −0,23 / +0,13  |
| Svag mot fasta | 60 | 1,13–1,27 | +0,24 | +0,23 (+1,3) | +3 pe | – | +0,22 / +0,23 ✔ |

- Svårast mot **Svag på fasta** (−0,18 p/match rel. eget snitt, z −1,5, 87 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,23 p/match rel. eget snitt, z +1,3, 60 m) – åt samma håll i båda halvorna men svagt

### Santos Laguna

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,8 %). 256 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (10 m): 0,20 mål för (xG 0,29), 0,40 emot (xG 0,25), 7,80 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,26), 0,32 emot (xG 0,25), 4,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 1,46–1,46 | +0,14 | +0,20 (+1,4) | +1 pe | – | +0,25 / +0,12 ✔ |
| Balanserat | 97 | 1,47–1,74 | −0,06 | −0,01 (−0,1) | −1 pe | – | +0,31 / −0,21  |
| Bollinnehav | 83 | 1,12–1,53 | −0,23 | −0,17 (−1,4) | −11 pe | – | −0,20 / −0,14 ✔ |
| Kortpass | 54 | 1,02–1,67 | −0,16 | −0,10 (−0,7) | −7 pe | – | −0,13 / −0,10 ✔ |
| Blandat | 110 | 1,36–1,70 | −0,07 | −0,01 (−0,1) | −6 pe | – | −0,00 / −0,02 ✔ |
| Direktspel | 92 | 1,54–1,41 | +0,02 | +0,08 (+0,6) | +0 pe | – | +0,23 / −0,42  |
| Lågpress | 89 | 1,47–1,65 | −0,15 | −0,09 (−0,7) | −9 pe | – | +0,00 / −0,30  |
| Mellanpress | 82 | 1,49–1,33 | +0,10 | +0,16 (+1,2) | +6 pe | – | +0,16 / +0,16 ✔ |
| Högpress | 85 | 1,11–1,78 | −0,12 | −0,06 (−0,5) | −8 pe | – | +0,39 / −0,17  |
| Svag på fasta | 90 | 1,30–1,38 | +0,08 | +0,14 (+1,1) | −4 pe | – | +0,20 / +0,04 ✔ |
| Medel på fasta | 101 | 1,36–1,71 | −0,10 | −0,04 (−0,3) | −1 pe | – | +0,28 / −0,27  |
| Farlig på fasta | 65 | 1,43–1,69 | −0,19 | −0,13 (−0,9) | −6 pe | – | −0,30 / +0,00  |
| Stark mot fasta | 92 | 1,39–1,49 | −0,07 | −0,01 (−0,1) | +0 pe | – | +0,23 / −0,39  |
| Medel mot fasta | 102 | 1,25–1,69 | −0,05 | +0,00 (+0,0) | −4 pe | – | +0,18 / −0,13  |
| Svag mot fasta | 62 | 1,47–1,58 | −0,05 | +0,01 (+0,1) | −9 pe | – | −0,23 / +0,21  |

- Svårast mot **Bollinnehav** (−0,17 p/match rel. eget snitt, z −1,4, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,20 p/match rel. eget snitt, z +1,4, 76 m) – åt samma håll i båda halvorna men svagt

### Tigres UANL

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,0 %). 280 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (10 m): 0,30 mål för (xG 0,44), 0,30 emot (xG 0,14), 6,80 hörnor · 2025/26 (42 m): 0,21 mål för (xG 0,34), 0,19 emot (xG 0,15), 5,45 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,48–1,03 | −0,00 | +0,00 (+0,0) | +1 pe | – | −0,05 / +0,08  |
| Balanserat | 110 | 1,44–1,04 | −0,08 | −0,08 (−0,7) | +3 pe | – | +0,03 / −0,17  |
| Bollinnehav | 81 | 1,57–1,02 | +0,10 | +0,10 (+0,8) | +3 pe | – | +0,04 / +0,16 ✔ |
| Kortpass | 60 | 1,50–1,05 | −0,01 | −0,01 (−0,1) | +1 pe | – | +0,31 / −0,11  |
| Blandat | 109 | 1,52–1,08 | −0,04 | −0,04 (−0,3) | +5 pe | – | −0,14 / +0,01  |
| Direktspel | 111 | 1,45–0,97 | +0,04 | +0,04 (+0,4) | +0 pe | – | +0,01 / +0,17 ✔ |
| Lågpress | 99 | 1,46–1,19 | −0,06 | −0,05 (−0,4) | −2 pe | – | −0,06 / −0,04 ✔ |
| Mellanpress | 86 | 1,34–0,81 | −0,02 | −0,02 (−0,2) | +9 pe | – | −0,02 / −0,03 ✔ |
| Högpress | 95 | 1,65–1,06 | +0,07 | +0,07 (+0,6) | +1 pe | – | +0,17 / +0,04 ✔ |
| Svag på fasta | 96 | 1,50–1,13 | −0,09 | −0,09 (−0,7) | +2 pe | – | −0,19 / +0,08  |
| Medel på fasta | 109 | 1,45–0,90 | +0,08 | +0,09 (+0,8) | +4 pe | – | +0,16 / +0,02 ✔ |
| Farlig på fasta | 75 | 1,53–1,11 | −0,02 | −0,01 (−0,1) | −0 pe | – | +0,12 / −0,09  |
| Stark mot fasta | 102 | 1,61–1,12 | +0,00 | +0,01 (+0,1) | +7 pe | – | +0,03 / −0,03  |
| Medel mot fasta | 109 | 1,19–1,03 | −0,13 | −0,13 (−1,1) | +0 pe | – | −0,19 / −0,07 ✔ |
| Svag mot fasta | 69 | 1,78–0,91 | +0,18 | +0,19 (+1,4) | −0 pe | – | +0,33 / +0,11 ✔ |

- Svårast mot **Medel mot fasta** (−0,13 p/match rel. eget snitt, z −1,1, 109 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,19 p/match rel. eget snitt, z +1,4, 69 m) – åt samma håll i båda halvorna men svagt

### Toluca

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 58,0 %). 267 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (10 m): 0,30 mål för (xG 0,24), 0,30 emot (xG 0,24), 5,70 hörnor · 2025/26 (42 m): 0,40 mål för (xG 0,44), 0,17 emot (xG 0,10), 5,64 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,57–1,35 | +0,06 | −0,04 (−0,3) | +3 pe | – | −0,06 / +0,00  |
| Balanserat | 106 | 1,82–1,49 | +0,03 | −0,06 (−0,5) | +1 pe | – | +0,02 / −0,11  |
| Bollinnehav | 81 | 1,64–1,19 | +0,21 | +0,12 (+0,9) | +5 pe | – | +0,13 / +0,10 ✔ |
| Kortpass | 69 | 1,71–1,17 | +0,12 | +0,02 (+0,1) | +3 pe | – | +0,04 / +0,01 ✔ |
| Blandat | 97 | 1,73–1,27 | +0,01 | −0,08 (−0,7) | +6 pe | – | +0,04 / −0,16  |
| Direktspel | 101 | 1,64–1,56 | +0,16 | +0,06 (+0,5) | −1 pe | – | +0,01 / +0,28 ✔ |
| Lågpress | 86 | 1,50–1,47 | +0,10 | +0,00 (+0,0) | +1 pe | – | +0,00 / +0,01 ✔ |
| Mellanpress | 86 | 1,57–1,29 | +0,04 | −0,05 (−0,4) | +5 pe | – | +0,09 / −0,30  |
| Högpress | 95 | 1,98–1,32 | +0,14 | +0,04 (+0,4) | +2 pe | – | −0,09 / +0,08  |
| Svag på fasta | 91 | 1,49–1,47 | +0,02 | −0,08 (−0,6) | +9 pe | – | −0,12 / +0,01  |
| Medel på fasta | 111 | 1,79–1,26 | +0,21 | +0,11 (+1,0) | −4 pe | – | +0,12 / +0,11 ✔ |
| Farlig på fasta | 65 | 1,80–1,35 | +0,01 | −0,09 (−0,6) | +5 pe | – | +0,19 / −0,23  |
| Stark mot fasta | 98 | 1,58–1,51 | +0,08 | −0,02 (−0,1) | +1 pe | – | −0,01 / −0,02 ✔ |
| Medel mot fasta | 104 | 1,87–1,26 | +0,25 | +0,16 (+1,4) | +8 pe | – | +0,18 / +0,14 ✔ |
| Svag mot fasta | 65 | 1,58–1,28 | −0,13 | −0,23 (−1,5) | −2 pe | – | −0,17 / −0,27 ✔ |

- Svårast mot **Svag mot fasta** (−0,23 p/match rel. eget snitt, z −1,5, 65 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,16 p/match rel. eget snitt, z +1,4, 104 m) – åt samma håll i båda halvorna men svagt

### UNAM Pumas

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 48,1 %). 263 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (10 m): 0,40 mål för (xG 0,26), 0,10 emot (xG 0,18), 5,90 hörnor · 2025/26 (40 m): 0,37 mål för (xG 0,28), 0,40 emot (xG 0,28), 3,77 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,18–1,20 | +0,03 | −0,00 (−0,0) | +7 pe | – | +0,12 / −0,16  |
| Balanserat | 101 | 1,42–1,38 | +0,01 | −0,03 (−0,2) | +3 pe | – | −0,09 / +0,01  |
| Bollinnehav | 79 | 1,38–1,30 | +0,07 | +0,04 (+0,3) | +2 pe | – | −0,07 / +0,15  |
| Kortpass | 61 | 1,33–1,39 | −0,09 | −0,13 (−0,9) | +1 pe | – | −0,56 / +0,03  |
| Blandat | 112 | 1,45–1,30 | +0,14 | +0,11 (+1,0) | +5 pe | – | +0,14 / +0,09 ✔ |
| Direktspel | 90 | 1,19–1,23 | −0,01 | −0,05 (−0,4) | +5 pe | – | +0,03 / −0,33  |
| Lågpress | 90 | 1,32–1,36 | +0,01 | −0,02 (−0,2) | +5 pe | – | −0,03 / −0,01 ✔ |
| Mellanpress | 77 | 1,44–1,48 | +0,09 | +0,06 (+0,4) | −7 pe | – | −0,01 / +0,16  |
| Högpress | 96 | 1,25–1,10 | +0,01 | −0,02 (−0,2) | +12 pe | – | +0,05 / −0,05  |
| Svag på fasta | 95 | 1,19–1,27 | −0,03 | −0,06 (−0,6) | +10 pe | – | +0,14 / −0,38  |
| Medel på fasta | 98 | 1,21–1,35 | −0,10 | −0,13 (−1,1) | +4 pe | – | −0,32 / +0,00  |
| Farlig på fasta | 70 | 1,69–1,27 | +0,31 | +0,27 (+2,0) | −5 pe | – | +0,13 / +0,40 ✔ |
| Stark mot fasta | 91 | 1,26–1,46 | −0,06 | −0,10 (−0,8) | −4 pe | – | −0,00 / −0,24 ✔ |
| Medel mot fasta | 106 | 1,29–1,23 | +0,09 | +0,05 (+0,5) | +13 pe | – | −0,01 / +0,11  |
| Svag mot fasta | 66 | 1,48–1,20 | +0,08 | +0,05 (+0,3) | +1 pe | – | −0,00 / +0,08  |

- Svårast mot **Medel på fasta** (−0,13 p/match rel. eget snitt, z −1,1, 98 m) – inte stabilt, troligen slump
- Bäst mot **Farlig på fasta** (+0,27 p/match rel. eget snitt, z +2,0, 70 m) – åt samma håll i båda halvorna men svagt
