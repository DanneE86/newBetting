# Stilmatchning – LaLiga 2 (LL2)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2198 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 240 m · hemma +0,07 · kryss −2 pe · ö2,5 +3 pe | 327 m · hemma +0,06 · kryss −4 pe · ö2,5 −4 pe | 168 m · hemma +0,03 · kryss +2 pe · ö2,5 −1 pe |
| **Mellan** | 324 m · hemma +0,12 · kryss +3 pe · ö2,5 +0 pe | 440 m · hemma +0,03 · kryss +1 pe · ö2,5 −0 pe | 226 m · hemma −0,08 · kryss +3 pe · ö2,5 −2 pe |
| **Mycket boll** | 170 m · hemma +0,09 · kryss −7 pe · ö2,5 +4 pe | 222 m · hemma −0,01 · kryss −3 pe · ö2,5 +6 pe | 81 m · hemma −0,11 · kryss −1 pe · ö2,5 −1 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 155 m · hemma +0,11 · kryss −0 pe · ö2,5 +2 pe | 294 m · hemma +0,08 · kryss −1 pe · ö2,5 +2 pe | 157 m · hemma +0,08 · kryss −2 pe · ö2,5 +1 pe |
| **Balanserat** | 293 m · hemma +0,01 · kryss −2 pe · ö2,5 +0 pe | 506 m · hemma +0,06 · kryss −0 pe · ö2,5 +1 pe | 264 m · hemma −0,06 · kryss +3 pe · ö2,5 −5 pe |
| **Bollinnehav** | 157 m · hemma +0,15 · kryss −3 pe · ö2,5 +3 pe | 266 m · hemma +0,00 · kryss −2 pe · ö2,5 −2 pe | 106 m · hemma −0,10 · kryss −1 pe · ö2,5 +3 pe |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 447 m · mot marknaden −0,07 (z −1,2) · mål 1,19 · ö2,5 +5 pe | 577 m · mot marknaden −0,09 (z −1,8) · mål 1,01 · ö2,5 −4 pe | 414 m · mot marknaden +0,05 (z +0,9) · mål 1,17 · ö2,5 +0 pe |
| **Medel på fasta** | 518 m · mot marknaden +0,02 (z +0,4) · mål 1,25 · ö2,5 +2 pe | 656 m · mot marknaden +0,06 (z +1,2) · mål 1,19 · ö2,5 +1 pe | 481 m · mot marknaden +0,04 (z +0,7) · mål 1,15 · ö2,5 −5 pe |
| **Farlig på fasta** | 380 m · mot marknaden +0,06 (z +1,0) · mål 1,20 · ö2,5 +4 pe | 518 m · mot marknaden +0,01 (z +0,3) · mål 1,05 · ö2,5 −2 pe | 405 m · mot marknaden −0,06 (z −1,1) · mål 1,08 · ö2,5 +3 pe |

## Lag (säsong 2026/27)

### Albacete

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 47,7 %). 177 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,25), 0,38 emot (xG 0,29), 5,25 hörnor · 2025/26 (42 m): 0,33 mål för (xG 0,30), 0,19 emot (xG 0,16), 5,09 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 46 | 0,96–1,24 | −0,13 | −0,08 (−0,4) | −2 pe | −2 pe | −0,07 / −0,09 ✔ |
| Balanserat | 86 | 0,99–1,36 | −0,12 | −0,06 (−0,4) | −7 pe | −3 pe | −0,30 / +0,21  |
| Bollinnehav | 45 | 1,33–1,27 | +0,14 | +0,20 (+1,1) | +0 pe | −1 pe | +0,32 / +0,10 ✔ |
| Kortpass | 39 | 1,41–1,36 | +0,11 | +0,16 (+0,8) | −4 pe | +0 pe | +0,18 / +0,16 ✔ |
| Blandat | 86 | 1,07–1,33 | −0,09 | −0,04 (−0,3) | +1 pe | −4 pe | −0,15 / +0,06  |
| Direktspel | 52 | 0,81–1,23 | −0,12 | −0,06 (−0,4) | −11 pe | −1 pe | −0,09 / +0,10  |
| Lågpress | 49 | 1,00–1,18 | −0,02 | +0,04 (+0,2) | −3 pe | −12 pe | −0,35 / +0,35  |
| Mellanpress | 94 | 1,07–1,27 | −0,02 | +0,04 (+0,3) | −3 pe | −3 pe | +0,06 / +0,02 ✔ |
| Högpress | 34 | 1,15–1,59 | −0,22 | −0,16 (−0,7) | −6 pe | +12 pe | −0,24 / −0,08 ✔ |
| Svag på fasta | 59 | 1,14–1,42 | −0,08 | −0,02 (−0,1) | −4 pe | +4 pe | −0,33 / +0,22  |
| Medel på fasta | 67 | 1,06–1,19 | +0,05 | +0,11 (+0,7) | −6 pe | −8 pe | +0,08 / +0,14 ✔ |
| Farlig på fasta | 51 | 1,00–1,31 | −0,17 | −0,12 (−0,7) | −0 pe | −2 pe | −0,12 / −0,11 ✔ |
| Stark mot fasta | 50 | 1,06–1,42 | −0,19 | −0,13 (−0,7) | −8 pe | −0 pe | −0,34 / +0,10  |
| Medel mot fasta | 72 | 1,01–1,25 | −0,03 | +0,02 (+0,2) | −0 pe | −4 pe | −0,01 / +0,06  |
| Svag mot fasta | 55 | 1,15–1,27 | +0,03 | +0,09 (+0,5) | −4 pe | −1 pe | +0,02 / +0,16 ✔ |

- Svårast mot **Högpress** (−0,16 p/match rel. eget snitt, z −0,7, 34 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,20 p/match rel. eget snitt, z +1,1, 45 m) – åt samma håll i båda halvorna men svagt

### Almeria

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 54,7 %). 249 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,39), 0,13 emot (xG 0,14), 4,00 hörnor · 2025/26 (42 m): 0,29 mål för (xG 0,27), 0,36 emot (xG 0,30), 4,83 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,54–1,32 | +0,02 | −0,03 (−0,2) | +8 pe | +16 pe | −0,02 / −0,04 ✔ |
| Balanserat | 118 | 1,47–1,25 | +0,06 | +0,01 (+0,1) | −8 pe | +5 pe | +0,15 / −0,18  |
| Bollinnehav | 63 | 1,35–1,40 | +0,08 | +0,02 (+0,2) | −1 pe | −3 pe | +0,13 / −0,07  |
| Kortpass | 41 | 1,46–1,56 | +0,06 | +0,00 (+0,0) | −4 pe | +3 pe | −0,06 / +0,01  |
| Blandat | 130 | 1,49–1,37 | +0,02 | −0,04 (−0,4) | −1 pe | +6 pe | +0,08 / −0,14  |
| Direktspel | 78 | 1,40–1,06 | +0,12 | +0,07 (+0,5) | −2 pe | +7 pe | +0,15 / −0,22  |
| Lågpress | 67 | 1,66–1,25 | +0,20 | +0,15 (+1,0) | −1 pe | +10 pe | +0,11 / +0,21 ✔ |
| Mellanpress | 112 | 1,54–1,14 | +0,13 | +0,07 (+0,7) | +0 pe | +5 pe | +0,24 / −0,11  |
| Högpress | 70 | 1,13–1,61 | −0,20 | −0,26 (−1,9) | −6 pe | +4 pe | −0,20 / −0,29 ✔ |
| Svag på fasta | 86 | 1,47–1,28 | +0,09 | +0,03 (+0,2) | −2 pe | +7 pe | +0,09 / −0,01  |
| Medel på fasta | 99 | 1,39–1,47 | −0,04 | −0,10 (−0,8) | −2 pe | +7 pe | +0,01 / −0,20  |
| Farlig på fasta | 64 | 1,55–1,08 | +0,17 | +0,11 (+0,7) | −2 pe | +4 pe | +0,24 / −0,09  |
| Stark mot fasta | 84 | 1,45–1,52 | −0,10 | −0,15 (−1,3) | +2 pe | +11 pe | +0,07 / −0,33  |
| Medel mot fasta | 97 | 1,46–1,14 | +0,10 | +0,04 (+0,3) | −4 pe | +4 pe | +0,17 / −0,10  |
| Svag mot fasta | 68 | 1,46–1,26 | +0,19 | +0,13 (+0,9) | −4 pe | +3 pe | +0,05 / +0,23 ✔ |

- Svårast mot **Högpress** (−0,26 p/match rel. eget snitt, z −1,9, 70 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,15 p/match rel. eget snitt, z +1,0, 67 m) – åt samma håll i båda halvorna men svagt

### Andorra

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 63,6 %). 40 matcher med stil, mot marknaden totalt −0,34 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,23), 0,57 emot (xG 0,50), 5,29 hörnor · 2025/26 (42 m): 0,29 mål för (xG 0,22), 0,26 emot (xG 0,32), 4,88 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 0,56–1,25 | −0,37 | −0,03 (−0,1) | +8 pe | −24 pe | +0,17 / −0,19  |
| Balanserat | 15 | 1,07–1,60 | −0,38 | −0,04 (−0,1) | −17 pe | −2 pe | −0,01 / −0,07 ✔ |
| Bollinnehav | 9 | 1,33–1,22 | −0,21 | +0,13 (+0,3) | −7 pe | +1 pe | −0,12 / +0,44  |
| Kortpass | 7 | 1,14–1,29 | −0,84 | −0,51 (−1,5) | +1 pe | −4 pe | −0,56 / −0,47  |
| Blandat | 23 | 1,04–1,74 | −0,43 | −0,09 (−0,4) | −8 pe | −3 pe | −0,16 / −0,02 ✔ |
| Direktspel | 10 | 0,50–0,60 | +0,23 | +0,57 (+1,7) | −0 pe | −30 pe | +0,81 / +0,33 ✔ |
| Lågpress | 1 | 3,00–2,00 | +1,92 | +2,25 (+22,5) | −28 pe | +52 pe | – / +2,25  |
| Mellanpress | 21 | 0,62–1,00 | −0,37 | −0,04 (−0,2) | +8 pe | −27 pe | −0,08 / +0,04  |
| Högpress | 18 | 1,17–1,78 | −0,42 | −0,08 (−0,3) | −17 pe | +6 pe | +0,22 / −0,27  |
| Svag på fasta | 11 | 0,73–1,36 | −0,58 | −0,24 (−0,7) | −2 pe | −17 pe | −0,68 / +0,12  |
| Medel på fasta | 15 | 0,87–1,33 | −0,04 | +0,29 (+0,9) | −24 pe | −6 pe | +0,59 / −0,16  |
| Farlig på fasta | 14 | 1,14–1,43 | −0,46 | −0,12 (−0,5) | +14 pe | −9 pe | −0,24 / −0,03 ✔ |
| Stark mot fasta | 15 | 1,13–1,13 | −0,11 | +0,23 (+0,7) | −3 pe | −8 pe | +0,28 / +0,17 ✔ |
| Medel mot fasta | 18 | 0,72–1,67 | −0,73 | −0,39 (−1,6) | −18 pe | −9 pe | −0,38 / −0,40 ✔ |
| Svag mot fasta | 7 | 1,00–1,14 | +0,17 | +0,51 (+1,3) | +29 pe | −18 pe | +0,54 / +0,48  |

- Svårast mot **Medel mot fasta** (−0,39 p/match rel. eget snitt, z −1,6, 18 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,29 p/match rel. eget snitt, z +0,9, 15 m) – inte stabilt, troligen slump

### Burgos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 47,1 %). 142 matcher med stil, mot marknaden totalt +0,14 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,17), 0,38 emot (xG 0,26), 3,38 hörnor · 2025/26 (42 m): 0,19 mål för (xG 0,27), 0,12 emot (xG 0,15), 3,71 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 41 | 1,00–1,12 | +0,09 | −0,04 (−0,2) | −14 pe | +2 pe | −0,22 / +0,16  |
| Balanserat | 60 | 0,95–1,00 | +0,15 | +0,01 (+0,1) | +5 pe | −0 pe | −0,23 / +0,23  |
| Bollinnehav | 41 | 1,10–1,02 | +0,17 | +0,03 (+0,2) | −6 pe | +3 pe | +0,31 / −0,23  |
| Kortpass | 41 | 1,02–1,12 | +0,09 | −0,05 (−0,2) | −8 pe | −3 pe | −0,00 / −0,06 ✔ |
| Blandat | 77 | 1,00–0,88 | +0,29 | +0,16 (+1,2) | −3 pe | +1 pe | +0,13 / +0,19 ✔ |
| Direktspel | 24 | 1,00–1,42 | −0,29 | −0,43 (−1,8) | +1 pe | +11 pe | −0,53 / +0,08  |
| Lågpress | 29 | 1,00–1,03 | +0,19 | +0,05 (+0,2) | −10 pe | +1 pe | −0,31 / +0,14  |
| Mellanpress | 65 | 1,08–1,08 | +0,12 | −0,01 (−0,1) | +6 pe | +3 pe | −0,14 / +0,09  |
| Högpress | 48 | 0,92–1,00 | +0,13 | −0,01 (−0,1) | −12 pe | +0 pe | +0,01 / −0,08  |
| Svag på fasta | 47 | 0,94–0,81 | +0,25 | +0,11 (+0,6) | −1 pe | −3 pe | −0,26 / +0,38  |
| Medel på fasta | 55 | 0,98–1,18 | +0,04 | −0,10 (−0,6) | −1 pe | +4 pe | +0,11 / −0,28  |
| Farlig på fasta | 40 | 1,13–1,13 | +0,14 | +0,01 (+0,0) | −11 pe | +4 pe | −0,12 / +0,22  |
| Stark mot fasta | 43 | 1,16–1,21 | +0,03 | −0,11 (−0,6) | −13 pe | +10 pe | −0,03 / −0,18 ✔ |
| Medel mot fasta | 57 | 0,75–0,96 | +0,01 | −0,13 (−0,9) | +2 pe | −5 pe | −0,16 / −0,09 ✔ |
| Svag mot fasta | 42 | 1,19–0,98 | +0,42 | +0,29 (+1,5) | −2 pe | +3 pe | +0,02 / +0,49 ✔ |

- Svårast mot **Direktspel** (−0,43 p/match rel. eget snitt, z −1,8, 24 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,29 p/match rel. eget snitt, z +1,5, 42 m) – åt samma håll i båda halvorna men svagt

### Cadiz

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,4 %). 258 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,21), 0,13 emot (xG 0,13), 4,13 hörnor · 2025/26 (42 m): 0,21 mål för (xG 0,23), 0,21 emot (xG 0,24), 4,41 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 1,24–1,50 | +0,14 | +0,10 (+0,6) | −9 pe | +11 pe | −0,04 / +0,19  |
| Balanserat | 122 | 0,89–1,24 | +0,05 | +0,01 (+0,1) | +7 pe | −6 pe | +0,29 / −0,30  |
| Bollinnehav | 78 | 0,83–1,37 | −0,04 | −0,08 (−0,6) | +5 pe | −8 pe | −0,08 / −0,08 ✔ |
| Kortpass | 54 | 0,91–1,37 | −0,10 | −0,14 (−1,0) | +8 pe | −4 pe | +0,00 / −0,20  |
| Blandat | 136 | 1,00–1,43 | +0,03 | −0,01 (−0,1) | +3 pe | +0 pe | +0,05 / −0,06  |
| Direktspel | 68 | 0,90–1,13 | +0,18 | +0,14 (+0,9) | −1 pe | −8 pe | +0,20 / −0,15  |
| Lågpress | 73 | 0,92–1,25 | −0,13 | −0,17 (−1,5) | +13 pe | −1 pe | −0,23 / −0,09 ✔ |
| Mellanpress | 110 | 1,11–1,25 | +0,23 | +0,19 (+1,5) | −1 pe | −2 pe | +0,35 / −0,02  |
| Högpress | 75 | 0,76–1,55 | −0,07 | −0,11 (−0,9) | −2 pe | −6 pe | +0,06 / −0,20  |
| Svag på fasta | 88 | 0,91–1,34 | +0,01 | −0,03 (−0,3) | +10 pe | −3 pe | +0,21 / −0,20  |
| Medel på fasta | 101 | 0,94–1,45 | +0,08 | +0,03 (+0,3) | +1 pe | +1 pe | +0,05 / +0,02 ✔ |
| Farlig på fasta | 69 | 1,03–1,17 | +0,03 | −0,01 (−0,1) | −2 pe | −8 pe | +0,09 / −0,17  |
| Stark mot fasta | 96 | 0,89–1,26 | +0,07 | +0,03 (+0,3) | +1 pe | −8 pe | +0,12 / −0,06  |
| Medel mot fasta | 93 | 0,97–1,33 | +0,01 | −0,03 (−0,3) | +4 pe | −2 pe | +0,10 / −0,18  |
| Svag mot fasta | 69 | 1,03–1,45 | +0,04 | +0,00 (+0,0) | +5 pe | +3 pe | +0,09 / −0,09  |

- Svårast mot **Lågpress** (−0,17 p/match rel. eget snitt, z −1,5, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,19 p/match rel. eget snitt, z +1,5, 110 m) – inte stabilt, troligen slump

### Castellon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 61,6 %). 38 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,26), 0,14 emot (xG 0,07), 5,29 hörnor · 2025/26 (42 m): 0,45 mål för (xG 0,37), 0,14 emot (xG 0,17), 6,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 9 | 1,56–1,00 | −0,33 | −0,44 (−1,1) | +11 pe | −22 pe | −0,66 / −0,26  |
| Balanserat | 20 | 1,35–0,90 | +0,11 | +0,00 (+0,0) | −1 pe | −13 pe | −0,33 / +0,41  |
| Bollinnehav | 9 | 1,78–1,11 | +0,54 | +0,43 (+1,0) | −15 pe | +13 pe | +0,62 / +0,28  |
| Kortpass | 14 | 1,71–1,07 | +0,44 | +0,33 (+0,9) | −19 pe | −2 pe | +0,50 / +0,16 ✔ |
| Blandat | 22 | 1,45–0,86 | +0,06 | −0,06 (−0,2) | +7 pe | −9 pe | −0,49 / +0,38  |
| Direktspel | 2 | 0,50–1,50 | −1,58 | −1,69 (−15,0) | +29 pe | −57 pe | −1,84 / −1,53  |
| Lågpress | 18 | 1,50–0,56 | +0,41 | +0,30 (+1,1) | −4 pe | −24 pe | −0,19 / +0,80  |
| Mellanpress | 14 | 1,64–1,21 | +0,07 | −0,04 (−0,1) | +11 pe | +3 pe | +0,05 / −0,15  |
| Högpress | 6 | 1,17–1,67 | −0,71 | −0,83 (−1,6) | −24 pe | +7 pe | −1,23 / −0,62  |
| Svag på fasta | 19 | 1,58–0,79 | +0,29 | +0,18 (+0,6) | −5 pe | −11 pe | +0,02 / +0,35 ✔ |
| Medel på fasta | 12 | 1,75–1,17 | +0,49 | +0,38 (+1,2) | −9 pe | +5 pe | +0,19 / +0,52 ✔ |
| Farlig på fasta | 7 | 0,86–1,14 | −1,02 | −1,13 (−3,3) | +20 pe | −29 pe | −1,24 / −0,99  |
| Stark mot fasta | 11 | 1,82–1,36 | −0,02 | −0,14 (−0,4) | −6 pe | +8 pe | −0,20 / −0,08 ✔ |
| Medel mot fasta | 10 | 1,50–0,50 | +0,83 | +0,72 (+2,9) | +3 pe | −10 pe | +0,52 / +0,85  |
| Svag mot fasta | 17 | 1,29–1,00 | −0,23 | −0,34 (−1,0) | −2 pe | −20 pe | −0,49 / −0,12 ✔ |

- Svårast mot **Svag mot fasta** (−0,34 p/match rel. eget snitt, z −1,0, 17 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,30 p/match rel. eget snitt, z +1,1, 18 m) – inte stabilt, troligen slump

### Ceuta

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 49,8 %). 6 matcher med stil, mot marknaden totalt −0,31 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,29), 0,43 emot (xG 0,31), 5,43 hörnor · 2025/26 (42 m): 0,26 mål för (xG 0,27), 0,17 emot (xG 0,17), 4,05 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 1,00–3,00 | −0,75 | −0,44 (−4,4) | −25 pe | +53 pe | – / −0,44  |
| Balanserat | 3 | 1,33–1,67 | +0,30 | +0,61 (+1,1) | +7 pe | +16 pe | −0,27 / +1,05  |
| Bollinnehav | 2 | 0,50–3,50 | −1,01 | −0,70 (−3,7) | −25 pe | −5 pe | −0,70 / –  |
| Kortpass | 3 | 0,33–3,33 | −0,87 | −0,56 (−3,2) | −24 pe | +11 pe | −0,56 / –  |
| Blandat | 3 | 1,67–1,67 | +0,25 | +0,56 (+0,9) | +6 pe | +20 pe | – / +0,56  |
| Lågpress | 1 | 0,00–3,00 | −0,58 | −0,27 (−2,7) | −20 pe | +42 pe | −0,27 / –  |
| Mellanpress | 2 | 0,50–2,50 | −1,01 | −0,70 (−3,7) | −26 pe | −2 pe | −0,97 / −0,44  |
| Högpress | 3 | 1,67–2,33 | +0,25 | +0,56 (+0,9) | +6 pe | +18 pe | −0,44 / +1,05  |
| Svag på fasta | 1 | 3,00–1,00 | +1,68 | +1,99 (+19,9) | −28 pe | +51 pe | – / +1,99  |
| Medel på fasta | 4 | 0,50–3,25 | −0,84 | −0,53 (−4,0) | −24 pe | +21 pe | −0,56 / −0,44  |
| Farlig på fasta | 1 | 1,00–1,00 | −0,20 | +0,11 (+1,1) | +70 pe | −44 pe | – / +0,11  |
| Stark mot fasta | 1 | 1,00–3,00 | −0,75 | −0,44 (−4,4) | −25 pe | +53 pe | – / −0,44  |
| Medel mot fasta | 3 | 1,33–1,33 | +0,07 | +0,38 (+0,5) | +5 pe | −17 pe | −0,97 / +1,05  |
| Svag mot fasta | 2 | 0,50–4,00 | −0,66 | −0,35 (−5,0) | −22 pe | +45 pe | −0,35 / –  |

### Cordoba

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 57,2 %). 40 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,30), 0,29 emot (xG 0,40), 5,14 hörnor · 2025/26 (42 m): 0,24 mål för (xG 0,35), 0,41 emot (xG 0,25), 6,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 10 | 1,90–1,50 | +0,10 | +0,11 (+0,2) | −7 pe | +38 pe | +0,79 / −0,35  |
| Balanserat | 21 | 1,14–1,43 | −0,13 | −0,12 (−0,5) | +1 pe | −3 pe | +0,11 / −0,33  |
| Bollinnehav | 9 | 1,33–1,67 | +0,15 | +0,16 (+0,3) | −16 pe | +26 pe | −0,26 / +1,00  |
| Kortpass | 15 | 1,60–1,60 | +0,25 | +0,26 (+0,7) | −7 pe | +28 pe | −0,07 / +0,76  |
| Blandat | 23 | 1,17–1,43 | −0,16 | −0,16 (−0,6) | −1 pe | +1 pe | +0,52 / −0,68  |
| Direktspel | 2 | 2,00–1,50 | −0,18 | −0,17 (−0,1) | −28 pe | +52 pe | −1,82 / +1,48  |
| Lågpress | 18 | 1,33–1,28 | +0,12 | +0,13 (+0,4) | +0 pe | +11 pe | +0,55 / −0,40  |
| Mellanpress | 18 | 1,28–1,50 | −0,06 | −0,06 (−0,2) | −11 pe | +10 pe | −0,23 / +0,12  |
| Högpress | 4 | 2,00–2,50 | −0,33 | −0,32 (−0,6) | −2 pe | +44 pe | −0,64 / −0,21  |
| Svag på fasta | 18 | 1,22–1,44 | −0,15 | −0,15 (−0,5) | +0 pe | +11 pe | +0,19 / −0,56  |
| Medel på fasta | 15 | 1,53–1,60 | +0,08 | +0,09 (+0,2) | −0 pe | +14 pe | +0,11 / +0,06 ✔ |
| Farlig på fasta | 7 | 1,43–1,43 | +0,19 | +0,19 (+0,3) | −28 pe | +21 pe | +0,02 / +0,27  |
| Stark mot fasta | 12 | 1,83–1,75 | −0,18 | −0,17 (−0,4) | +6 pe | +31 pe | +0,42 / −0,77  |
| Medel mot fasta | 12 | 1,08–1,75 | +0,05 | +0,06 (+0,1) | −19 pe | +17 pe | +0,16 / −0,04  |
| Svag mot fasta | 16 | 1,25–1,13 | +0,08 | +0,09 (+0,3) | −3 pe | −1 pe | −0,09 / +0,26  |

- Svårast mot **Blandat** (−0,16 p/match rel. eget snitt, z −0,6, 23 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,26 p/match rel. eget snitt, z +0,7, 15 m) – inte stabilt, troligen slump

### Eibar

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 41,3 %). 282 matcher med stil, mot marknaden totalt +0,07 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,23), 0,13 emot (xG 0,09), 3,00 hörnor · 2025/26 (42 m): 0,29 mål för (xG 0,33), 0,29 emot (xG 0,20), 4,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 1,19–1,10 | +0,11 | +0,04 (+0,3) | −6 pe | +3 pe | −0,05 / +0,12  |
| Balanserat | 120 | 1,26–1,16 | +0,09 | +0,02 (+0,2) | +4 pe | +4 pe | −0,08 / +0,13  |
| Bollinnehav | 74 | 1,04–1,16 | −0,01 | −0,08 (−0,6) | +4 pe | −11 pe | −0,07 / −0,08 ✔ |
| Kortpass | 50 | 1,08–0,88 | +0,16 | +0,09 (+0,6) | +13 pe | −13 pe | +0,35 / +0,00 ✔ |
| Blandat | 134 | 1,21–1,25 | −0,02 | −0,09 (−0,9) | −1 pe | +2 pe | −0,28 / +0,06  |
| Direktspel | 98 | 1,19–1,13 | +0,15 | +0,08 (+0,6) | −3 pe | +3 pe | +0,03 / +0,19 ✔ |
| Lågpress | 75 | 1,21–1,19 | +0,10 | +0,03 (+0,2) | −4 pe | +8 pe | −0,23 / +0,40  |
| Mellanpress | 141 | 1,14–1,18 | +0,02 | −0,06 (−0,6) | +3 pe | −3 pe | −0,01 / −0,12 ✔ |
| Högpress | 66 | 1,23–1,02 | +0,16 | +0,08 (+0,6) | +0 pe | −2 pe | +0,06 / +0,09 ✔ |
| Svag på fasta | 88 | 1,10–1,05 | +0,02 | −0,05 (−0,4) | +5 pe | −8 pe | −0,06 / −0,04 ✔ |
| Medel på fasta | 112 | 1,17–1,20 | +0,05 | −0,03 (−0,2) | −0 pe | +1 pe | −0,24 / +0,22  |
| Farlig på fasta | 82 | 1,28–1,17 | +0,16 | +0,09 (+0,7) | −3 pe | +8 pe | +0,17 / +0,00 ✔ |
| Stark mot fasta | 84 | 1,31–1,25 | +0,10 | +0,03 (+0,2) | −5 pe | +10 pe | +0,06 / −0,00  |
| Medel mot fasta | 94 | 1,17–1,05 | +0,05 | −0,02 (−0,2) | −1 pe | −1 pe | −0,19 / +0,12  |
| Svag mot fasta | 104 | 1,09–1,13 | +0,07 | −0,00 (−0,0) | +7 pe | −7 pe | −0,06 / +0,08  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,9, 134 m) – inte stabilt, troligen slump
- Bäst mot **Farlig på fasta** (+0,09 p/match rel. eget snitt, z +0,7, 82 m) – åt samma håll i båda halvorna men svagt

### Girona

Egen stil 2021/22 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 49,9 %). 293 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,23), 0,14 emot (xG 0,19), 3,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,20–1,27 | +0,02 | +0,01 (+0,1) | −2 pe | −3 pe | −0,01 / +0,03  |
| Balanserat | 137 | 1,37–1,28 | +0,01 | −0,01 (−0,1) | −4 pe | +3 pe | −0,02 / +0,01  |
| Bollinnehav | 70 | 1,34–1,31 | +0,02 | +0,01 (+0,1) | −5 pe | +3 pe | −0,22 / +0,21  |
| Kortpass | 52 | 1,25–1,44 | −0,18 | −0,20 (−1,3) | +4 pe | +1 pe | −0,66 / −0,14 ✔ |
| Blandat | 141 | 1,45–1,33 | +0,15 | +0,14 (+1,3) | −4 pe | +4 pe | +0,07 / +0,19 ✔ |
| Direktspel | 100 | 1,15–1,14 | −0,07 | −0,09 (−0,7) | −8 pe | −3 pe | −0,13 / +0,05  |
| Lågpress | 75 | 1,00–1,29 | −0,22 | −0,24 (−1,7) | +1 pe | −4 pe | −0,25 / −0,22 ✔ |
| Mellanpress | 134 | 1,25–1,30 | +0,02 | −0,00 (−0,0) | −6 pe | −2 pe | +0,06 / −0,08  |
| Högpress | 84 | 1,69–1,26 | +0,23 | +0,21 (+1,6) | −5 pe | +11 pe | −0,10 / +0,34  |
| Svag på fasta | 88 | 1,30–1,22 | +0,08 | +0,06 (+0,5) | −8 pe | −4 pe | +0,10 / +0,03 ✔ |
| Medel på fasta | 125 | 1,42–1,40 | +0,04 | +0,03 (+0,3) | −1 pe | +9 pe | −0,08 / +0,12  |
| Farlig på fasta | 80 | 1,16–1,19 | −0,10 | −0,12 (−0,9) | −4 pe | −5 pe | −0,20 / −0,01 ✔ |
| Stark mot fasta | 97 | 1,46–1,37 | +0,05 | +0,04 (+0,3) | −11 pe | +9 pe | +0,16 / −0,04  |
| Medel mot fasta | 112 | 1,29–1,26 | +0,04 | +0,03 (+0,3) | −1 pe | +1 pe | −0,22 / +0,26  |
| Svag mot fasta | 84 | 1,17–1,23 | −0,07 | −0,08 (−0,6) | −0 pe | −8 pe | −0,07 / −0,11 ✔ |

- Svårast mot **Lågpress** (−0,24 p/match rel. eget snitt, z −1,7, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +1,6, 84 m) – inte stabilt, troligen slump

### Granada

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 51,1 %). 261 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,50), 0,29 emot (xG 0,16), 5,57 hörnor · 2025/26 (42 m): 0,29 mål för (xG 0,32), 0,41 emot (xG 0,27), 4,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 1,29–1,27 | +0,16 | +0,17 (+1,2) | −1 pe | +2 pe | +0,24 / +0,10 ✔ |
| Balanserat | 107 | 1,23–1,59 | −0,24 | −0,24 (−2,3) | −5 pe | +9 pe | +0,00 / −0,47  |
| Bollinnehav | 76 | 1,17–1,43 | +0,16 | +0,16 (+1,2) | −0 pe | −0 pe | +0,26 / +0,05 ✔ |
| Kortpass | 60 | 1,10–1,32 | −0,06 | −0,06 (−0,4) | −6 pe | −3 pe | −0,02 / −0,07 ✔ |
| Blandat | 119 | 1,33–1,61 | −0,06 | −0,05 (−0,5) | +3 pe | +10 pe | +0,25 / −0,28  |
| Direktspel | 82 | 1,20–1,32 | +0,11 | +0,12 (+0,9) | −7 pe | +2 pe | +0,11 / +0,12 ✔ |
| Lågpress | 69 | 1,29–1,43 | −0,02 | −0,01 (−0,1) | −3 pe | +12 pe | +0,03 / −0,06  |
| Mellanpress | 111 | 1,23–1,51 | +0,02 | +0,03 (+0,3) | +1 pe | +3 pe | +0,20 / −0,19  |
| Högpress | 81 | 1,20–1,37 | −0,04 | −0,03 (−0,3) | −5 pe | −0 pe | +0,19 / −0,16  |
| Svag på fasta | 88 | 1,33–1,69 | −0,17 | −0,17 (−1,4) | −1 pe | +12 pe | +0,02 / −0,32  |
| Medel på fasta | 102 | 1,12–1,35 | +0,05 | +0,05 (+0,4) | −2 pe | +0 pe | +0,22 / −0,12  |
| Farlig på fasta | 71 | 1,28–1,28 | +0,13 | +0,13 (+1,0) | −4 pe | +0 pe | +0,20 / +0,06 ✔ |
| Stark mot fasta | 89 | 1,27–1,46 | +0,11 | +0,11 (+0,9) | +2 pe | +3 pe | +0,29 / −0,04  |
| Medel mot fasta | 91 | 1,14–1,44 | −0,18 | −0,17 (−1,6) | −0 pe | −2 pe | −0,11 / −0,23 ✔ |
| Svag mot fasta | 81 | 1,30–1,44 | +0,06 | +0,07 (+0,5) | −9 pe | +13 pe | +0,27 / −0,17  |

- Svårast mot **Balanserat** (−0,24 p/match rel. eget snitt, z −2,3, 107 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,17 p/match rel. eget snitt, z +1,2, 78 m) – åt samma håll i båda halvorna men svagt

### Las Palmas

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 54,4 %). 257 matcher med stil, mot marknaden totalt +0,09 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,13), 0,14 emot (xG 0,11), 4,29 hörnor · 2025/26 (42 m): 0,24 mål för (xG 0,25), 0,19 emot (xG 0,17), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,14–1,39 | −0,07 | −0,17 (−1,2) | +0 pe | +6 pe | −0,01 / −0,29 ✔ |
| Balanserat | 136 | 1,12–0,97 | +0,22 | +0,12 (+1,2) | +2 pe | −8 pe | +0,21 / +0,02 ✔ |
| Bollinnehav | 50 | 1,24–1,28 | −0,00 | −0,09 (−0,6) | +5 pe | −6 pe | −0,12 / −0,07 ✔ |
| Kortpass | 43 | 1,12–1,16 | +0,22 | +0,13 (+0,7) | −1 pe | −14 pe | +0,24 / +0,11 ✔ |
| Blandat | 120 | 1,08–1,14 | +0,08 | −0,02 (−0,2) | +1 pe | −6 pe | +0,24 / −0,21  |
| Direktspel | 94 | 1,24–1,15 | +0,06 | −0,04 (−0,3) | +4 pe | +4 pe | −0,02 / −0,10 ✔ |
| Lågpress | 66 | 1,29–1,15 | +0,17 | +0,08 (+0,6) | +2 pe | −2 pe | +0,21 / −0,13  |
| Mellanpress | 112 | 1,03–1,13 | +0,04 | −0,05 (−0,5) | +6 pe | −5 pe | +0,01 / −0,11  |
| Högpress | 79 | 1,20–1,18 | +0,10 | +0,01 (+0,0) | −4 pe | −3 pe | +0,12 / −0,07  |
| Svag på fasta | 78 | 1,18–1,23 | +0,15 | +0,06 (+0,5) | +5 pe | −4 pe | +0,07 / +0,05 ✔ |
| Medel på fasta | 104 | 0,92–1,15 | −0,02 | −0,11 (−0,9) | −0 pe | −10 pe | +0,00 / −0,21  |
| Farlig på fasta | 75 | 1,43–1,05 | +0,18 | +0,09 (+0,7) | +1 pe | +5 pe | +0,22 / −0,10  |
| Stark mot fasta | 89 | 1,01–1,20 | −0,05 | −0,14 (−1,1) | −2 pe | −9 pe | +0,01 / −0,25  |
| Medel mot fasta | 95 | 1,32–1,18 | +0,19 | +0,10 (+0,9) | +2 pe | −0 pe | +0,30 / −0,17  |
| Svag mot fasta | 73 | 1,10–1,04 | +0,14 | +0,05 (+0,3) | +6 pe | −3 pe | −0,11 / +0,22  |

- Svårast mot **Backar hem** (−0,17 p/match rel. eget snitt, z −1,2, 71 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,12 p/match rel. eget snitt, z +1,2, 136 m) – åt samma håll i båda halvorna men svagt

### Leganes

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 45,3 %). 283 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,11), 0,25 emot (xG 0,17), 3,00 hörnor · 2025/26 (42 m): 0,19 mål för (xG 0,28), 0,33 emot (xG 0,24), 4,69 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 0,87–0,95 | −0,06 | −0,03 (−0,3) | +10 pe | −6 pe | −0,21 / +0,13  |
| Balanserat | 133 | 1,08–1,24 | −0,00 | +0,02 (+0,2) | −5 pe | +4 pe | −0,02 / +0,07  |
| Bollinnehav | 72 | 1,03–1,03 | −0,02 | −0,00 (−0,0) | +4 pe | −3 pe | −0,03 / +0,02  |
| Kortpass | 50 | 0,90–1,22 | −0,19 | −0,16 (−1,0) | −6 pe | −9 pe | −0,52 / −0,10 ✔ |
| Blandat | 129 | 1,12–1,07 | +0,09 | +0,12 (+1,1) | +1 pe | +3 pe | +0,09 / +0,13 ✔ |
| Direktspel | 104 | 0,92–1,10 | −0,09 | −0,07 (−0,6) | +5 pe | −1 pe | −0,15 / +0,16  |
| Lågpress | 65 | 1,23–1,09 | +0,08 | +0,10 (+0,7) | +6 pe | +3 pe | +0,13 / +0,06 ✔ |
| Mellanpress | 141 | 0,95–1,16 | −0,01 | +0,02 (+0,2) | −1 pe | −2 pe | +0,03 / +0,00 ✔ |
| Högpress | 77 | 0,92–1,03 | −0,14 | −0,12 (−0,9) | +1 pe | −3 pe | −0,68 / +0,17  |
| Svag på fasta | 90 | 1,09–1,08 | +0,01 | +0,03 (+0,3) | −7 pe | +5 pe | +0,01 / +0,05 ✔ |
| Medel på fasta | 106 | 1,00–1,09 | −0,00 | +0,02 (+0,2) | +3 pe | −3 pe | +0,02 / +0,03 ✔ |
| Farlig på fasta | 87 | 0,93–1,15 | −0,08 | −0,06 (−0,5) | +7 pe | −4 pe | −0,27 / +0,15  |
| Stark mot fasta | 92 | 1,11–1,08 | +0,12 | +0,15 (+1,2) | +5 pe | −2 pe | −0,00 / +0,26  |
| Medel mot fasta | 95 | 0,86–1,02 | −0,20 | −0,18 (−1,6) | −1 pe | −5 pe | −0,28 / −0,09 ✔ |
| Svag mot fasta | 96 | 1,05–1,22 | +0,02 | +0,04 (+0,3) | −0 pe | +5 pe | +0,04 / +0,03 ✔ |

- Svårast mot **Medel mot fasta** (−0,18 p/match rel. eget snitt, z −1,6, 95 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,15 p/match rel. eget snitt, z +1,2, 92 m) – inte stabilt, troligen slump

### Mallorca

Egen stil 2020/21 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 54,4 %). 267 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,36), 0,14 emot (xG 0,13), 3,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 78 | 0,97–1,32 | +0,01 | −0,02 (−0,1) | −3 pe | +0 pe | +0,09 / −0,12  |
| Balanserat | 116 | 0,97–1,17 | +0,00 | −0,02 (−0,2) | −0 pe | −3 pe | +0,02 / −0,07  |
| Bollinnehav | 73 | 1,19–1,41 | +0,08 | +0,06 (+0,4) | −10 pe | +5 pe | +0,03 / +0,09 ✔ |
| Kortpass | 59 | 1,14–1,56 | −0,18 | −0,21 (−1,4) | −6 pe | +13 pe | −0,73 / −0,06 ✔ |
| Blandat | 126 | 0,90–1,16 | +0,04 | +0,01 (+0,1) | −1 pe | −7 pe | +0,11 / −0,07  |
| Direktspel | 82 | 1,15–1,27 | +0,15 | +0,13 (+0,9) | −6 pe | +1 pe | +0,13 / +0,12 ✔ |
| Lågpress | 61 | 1,02–1,15 | +0,11 | +0,09 (+0,6) | −3 pe | −0 pe | +0,28 / −0,16  |
| Mellanpress | 121 | 0,98–1,39 | −0,08 | −0,10 (−1,0) | −8 pe | −4 pe | −0,09 / −0,12 ✔ |
| Högpress | 85 | 1,12–1,22 | +0,11 | +0,08 (+0,7) | +1 pe | +6 pe | +0,06 / +0,10 ✔ |
| Svag på fasta | 91 | 0,90–1,21 | −0,03 | −0,05 (−0,4) | −3 pe | −6 pe | −0,11 / +0,01  |
| Medel på fasta | 99 | 1,04–1,06 | +0,16 | +0,14 (+1,1) | −2 pe | −1 pe | +0,40 / −0,06  |
| Farlig på fasta | 77 | 1,17–1,65 | −0,09 | −0,11 (−0,9) | −7 pe | +8 pe | −0,14 / −0,08 ✔ |
| Stark mot fasta | 99 | 1,02–1,18 | +0,12 | +0,09 (+0,8) | +4 pe | −2 pe | +0,17 / +0,02 ✔ |
| Medel mot fasta | 98 | 1,05–1,37 | −0,00 | −0,03 (−0,2) | −15 pe | +1 pe | −0,13 / +0,07  |
| Svag mot fasta | 70 | 1,01–1,30 | −0,07 | −0,09 (−0,7) | +0 pe | +2 pe | +0,09 / −0,32  |

- Svårast mot **Kortpass** (−0,21 p/match rel. eget snitt, z −1,4, 59 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,14 p/match rel. eget snitt, z +1,1, 99 m) – inte stabilt, troligen slump

### Oviedo

Egen stil 2024/25 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 50,5 %). 248 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,36), 0,13 emot (xG 0,09), 5,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 0,89–1,04 | −0,23 | −0,29 (−2,2) | +4 pe | −7 pe | −0,40 / −0,22 ✔ ⚑ |
| Balanserat | 117 | 1,20–1,05 | +0,24 | +0,18 (+1,7) | +3 pe | +2 pe | +0,10 / +0,30 ✔ |
| Bollinnehav | 60 | 1,28–1,27 | +0,04 | −0,02 (−0,1) | −0 pe | +11 pe | −0,03 / −0,01 ✔ |
| Kortpass | 48 | 1,27–1,17 | +0,23 | +0,17 (+1,0) | +0 pe | +4 pe | −0,29 / +0,24  |
| Blandat | 120 | 1,20–1,07 | +0,21 | +0,16 (+1,4) | −0 pe | +2 pe | +0,42 / −0,08  |
| Direktspel | 80 | 0,94–1,11 | −0,28 | −0,34 (−2,9) | +8 pe | −1 pe | −0,42 / −0,05 ✔ ⚑ |
| Lågpress | 74 | 1,08–1,15 | +0,02 | −0,04 (−0,3) | −1 pe | −1 pe | +0,08 / −0,18  |
| Mellanpress | 108 | 1,28–1,13 | +0,10 | +0,04 (+0,4) | +8 pe | +5 pe | −0,09 / +0,17  |
| Högpress | 66 | 0,94–1,00 | +0,03 | −0,03 (−0,2) | −3 pe | −1 pe | −0,09 / +0,02  |
| Svag på fasta | 74 | 1,24–0,92 | +0,24 | +0,18 (+1,3) | −1 pe | +2 pe | +0,22 / +0,14 ✔ |
| Medel på fasta | 95 | 1,01–1,22 | −0,11 | −0,17 (−1,5) | +5 pe | −1 pe | −0,25 / −0,08 ✔ |
| Farlig på fasta | 79 | 1,16–1,13 | +0,09 | +0,03 (+0,2) | +3 pe | +4 pe | −0,01 / +0,07  |
| Stark mot fasta | 74 | 1,12–0,96 | −0,04 | −0,10 (−0,7) | +4 pe | −1 pe | −0,29 / +0,09  |
| Medel mot fasta | 114 | 1,11–1,13 | +0,13 | +0,07 (+0,7) | +1 pe | +0 pe | +0,14 / +0,01 ✔ |
| Svag mot fasta | 60 | 1,18–1,22 | +0,04 | −0,02 (−0,1) | +3 pe | +8 pe | −0,02 / −0,01 ✔ |

- Svårast mot **Direktspel** (−0,34 p/match rel. eget snitt, z −2,9, 80 m) – ⚑ håller i båda halvorna
- Bäst mot **Balanserat** (+0,18 p/match rel. eget snitt, z +1,7, 117 m) – åt samma håll i båda halvorna men svagt

### Sociedad B

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 39,3 %). 6 matcher med stil, mot marknaden totalt +0,16 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,20), 0,29 emot (xG 0,26), 3,71 hörnor · 2025/26 (42 m): 0,12 mål för (xG 0,20), 0,29 emot (xG 0,24), 3,79 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 2 | 2,00–1,50 | +1,09 | +0,94 (+1,2) | +23 pe | +53 pe | +0,94 / –  |
| Balanserat | 2 | 0,00–1,00 | −0,99 | −1,15 (−16,2) | −26 pe | −53 pe | −1,07 / −1,22  |
| Bollinnehav | 2 | 2,00–2,00 | +0,37 | +0,21 (+0,2) | −26 pe | +48 pe | – / +0,21  |
| Kortpass | 4 | 1,00–1,50 | −0,31 | −0,47 (−0,7) | −26 pe | −3 pe | −1,07 / −0,27  |
| Blandat | 2 | 2,00–1,50 | +1,09 | +0,94 (+1,2) | +23 pe | +53 pe | +0,94 / –  |
| Lågpress | 1 | 0,00–1,00 | −1,06 | −1,22 (−12,2) | −27 pe | −49 pe | – / −1,22  |
| Mellanpress | 1 | 2,00–2,00 | +0,01 | −0,14 (−1,4) | +71 pe | +57 pe | −0,14 / –  |
| Högpress | 4 | 1,50–1,50 | +0,50 | +0,34 (+0,4) | −26 pe | +22 pe | +0,47 / +0,21  |
| Medel på fasta | 3 | 1,67–1,33 | +0,36 | +0,20 (+0,3) | +6 pe | +18 pe | −0,14 / +0,38  |
| Farlig på fasta | 3 | 1,00–1,67 | −0,05 | −0,20 (−0,2) | −26 pe | +14 pe | +0,47 / −1,55  |
| Stark mot fasta | 3 | 1,67–2,00 | +0,26 | +0,11 (+0,1) | +6 pe | +52 pe | +0,94 / −1,55  |
| Medel mot fasta | 1 | 0,00–1,00 | −0,91 | −1,07 (−10,7) | −24 pe | −57 pe | −1,07 / –  |
| Svag mot fasta | 2 | 1,50–1,00 | +0,53 | +0,38 (+0,3) | −26 pe | −2 pe | – / +0,38  |

### Sp Gijon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 50,6 %). 242 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,29), 0,00 emot (xG 0,14), 3,14 hörnor · 2025/26 (42 m): 0,26 mål för (xG 0,25), 0,26 emot (xG 0,26), 4,57 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 67 | 1,15–0,96 | +0,02 | +0,10 (+0,7) | +7 pe | −0 pe | −0,09 / +0,23  |
| Balanserat | 115 | 1,06–1,06 | −0,05 | +0,04 (+0,3) | −1 pe | −3 pe | −0,03 / +0,12  |
| Bollinnehav | 60 | 1,18–1,25 | −0,27 | −0,18 (−1,2) | −5 pe | −1 pe | −0,27 / −0,11 ✔ |
| Kortpass | 39 | 1,23–1,13 | −0,01 | +0,08 (+0,4) | +1 pe | −3 pe | −0,03 / +0,10  |
| Blandat | 117 | 1,21–1,26 | −0,18 | −0,10 (−0,9) | −3 pe | +4 pe | −0,27 / +0,03  |
| Direktspel | 86 | 0,93–0,81 | +0,01 | +0,10 (+0,7) | +4 pe | −9 pe | +0,03 / +0,31 ✔ |
| Lågpress | 64 | 1,02–1,03 | −0,07 | +0,01 (+0,1) | +1 pe | −13 pe | +0,04 / −0,03  |
| Mellanpress | 115 | 1,11–1,06 | −0,14 | −0,06 (−0,5) | −2 pe | +1 pe | −0,14 / +0,02  |
| Högpress | 63 | 1,22–1,16 | +0,02 | +0,10 (+0,7) | +4 pe | +4 pe | −0,19 / +0,31  |
| Svag på fasta | 76 | 1,26–1,08 | +0,01 | +0,10 (+0,7) | −1 pe | −1 pe | +0,02 / +0,16 ✔ |
| Medel på fasta | 93 | 0,99–1,10 | −0,14 | −0,06 (−0,5) | +1 pe | −4 pe | −0,02 / −0,09 ✔ |
| Farlig på fasta | 73 | 1,12–1,05 | −0,11 | −0,03 (−0,2) | −1 pe | −1 pe | −0,28 / +0,28  |
| Stark mot fasta | 73 | 1,21–1,21 | −0,06 | +0,02 (+0,1) | −11 pe | +8 pe | −0,09 / +0,13  |
| Medel mot fasta | 97 | 1,01–1,05 | −0,16 | −0,08 (−0,7) | +4 pe | −7 pe | −0,06 / −0,10 ✔ |
| Svag mot fasta | 72 | 1,17–0,99 | +0,01 | +0,09 (+0,6) | +7 pe | −5 pe | −0,14 / +0,33  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,2, 60 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,10 p/match rel. eget snitt, z +0,7, 86 m) – åt samma håll i båda halvorna men svagt

### Valladolid

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,8 %). 261 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,27), 0,71 emot (xG 0,19), 3,29 hörnor · 2025/26 (42 m): 0,38 mål för (xG 0,39), 0,31 emot (xG 0,20), 5,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 1,10–1,32 | +0,05 | +0,10 (+0,8) | −9 pe | +2 pe | +0,23 / −0,01  |
| Balanserat | 109 | 0,99–1,50 | −0,11 | −0,06 (−0,6) | −1 pe | +2 pe | +0,04 / −0,16  |
| Bollinnehav | 73 | 1,01–1,45 | −0,07 | −0,02 (−0,1) | +9 pe | −6 pe | +0,05 / −0,09  |
| Kortpass | 55 | 0,95–1,76 | −0,21 | −0,15 (−1,1) | −3 pe | +1 pe | −0,10 / −0,17 ✔ |
| Blandat | 120 | 0,97–1,49 | −0,09 | −0,04 (−0,4) | +0 pe | −2 pe | +0,02 / −0,08  |
| Direktspel | 86 | 1,17–1,14 | +0,10 | +0,15 (+1,2) | +0 pe | +1 pe | +0,19 / +0,02 ✔ |
| Lågpress | 60 | 0,98–1,43 | −0,21 | −0,15 (−1,2) | −6 pe | +0 pe | −0,13 / −0,18 ✔ |
| Mellanpress | 134 | 1,05–1,45 | −0,04 | +0,02 (+0,2) | +2 pe | +1 pe | +0,17 / −0,14  |
| Högpress | 67 | 1,03–1,40 | +0,05 | +0,10 (+0,8) | +0 pe | −4 pe | +0,17 / +0,05 ✔ |
| Svag på fasta | 80 | 1,06–1,44 | +0,00 | +0,06 (+0,5) | −5 pe | −0 pe | +0,28 / −0,12  |
| Medel på fasta | 108 | 1,04–1,39 | +0,03 | +0,09 (+0,8) | −0 pe | −1 pe | +0,12 / +0,05 ✔ |
| Farlig på fasta | 73 | 0,99–1,49 | −0,25 | −0,19 (−1,7) | +4 pe | +1 pe | −0,12 / −0,28 ✔ |
| Stark mot fasta | 99 | 1,08–1,52 | −0,05 | +0,01 (+0,1) | −1 pe | +4 pe | +0,29 / −0,21  |
| Medel mot fasta | 80 | 0,99–1,34 | −0,09 | −0,03 (−0,3) | −2 pe | −6 pe | −0,03 / −0,04 ✔ |
| Svag mot fasta | 82 | 1,01–1,43 | −0,03 | +0,03 (+0,2) | +2 pe | −1 pe | +0,02 / +0,03 ✔ |

- Svårast mot **Farlig på fasta** (−0,19 p/match rel. eget snitt, z −1,7, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,15 p/match rel. eget snitt, z +1,2, 86 m) – åt samma håll i båda halvorna men svagt
