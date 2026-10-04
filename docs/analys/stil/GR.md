# Stilmatchning – Super League (Grekland) (GR)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 540 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 53 m · hemma −0,24 · kryss +1 pe · ö2,5 +4 pe | 43 m · hemma −0,24 · kryss −5 pe · ö2,5 +9 pe | 66 m · hemma −0,11 · kryss −2 pe · ö2,5 +8 pe |
| **Mellan** | 44 m · hemma +0,04 · kryss −12 pe · ö2,5 +8 pe | 47 m · hemma +0,03 · kryss −7 pe · ö2,5 +6 pe | 56 m · hemma −0,05 · kryss +1 pe · ö2,5 +1 pe |
| **Mycket boll** | 67 m · hemma +0,05 · kryss +1 pe · ö2,5 −5 pe | 56 m · hemma +0,09 · kryss −5 pe · ö2,5 +5 pe | 108 m · hemma +0,15 · kryss −1 pe · ö2,5 +3 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 33 m · hemma −0,01 · kryss −9 pe · ö2,5 +10 pe | 68 m · hemma −0,23 · kryss −7 pe · ö2,5 +6 pe | 31 m · hemma −0,12 · kryss +7 pe · ö2,5 +11 pe |
| **Balanserat** | 66 m · hemma +0,02 · kryss +7 pe · ö2,5 −1 pe | 133 m · hemma +0,07 · kryss −6 pe · ö2,5 +8 pe | 73 m · hemma −0,06 · kryss −3 pe · ö2,5 +5 pe |
| **Bollinnehav** | 34 m · hemma +0,14 · kryss +8 pe · ö2,5 −7 pe | 76 m · hemma +0,02 · kryss −10 pe · ö2,5 +4 pe | 26 m · hemma +0,07 · kryss +9 pe · ö2,5 −18 pe |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 113 m · mot marknaden +0,09 (z +0,8) · mål 1,49 · ö2,5 +9 pe | 219 m · mot marknaden −0,05 (z −0,6) · mål 1,23 · ö2,5 +4 pe | 73 m · mot marknaden +0,33 (z +2,4) · mål 1,64 · ö2,5 +2 pe |
| **Medel på fasta** | 114 m · mot marknaden −0,00 (z −0,0) · mål 1,16 · ö2,5 +15 pe | 243 m · mot marknaden −0,08 (z −1,1) · mål 1,35 · ö2,5 +2 pe | 82 m · mot marknaden +0,19 (z +1,5) · mål 1,57 · ö2,5 +2 pe |
| **Farlig på fasta** | 22 m · mot marknaden −0,06 (z −0,3) · mål 2,32 · ö2,5 +9 pe | 133 m · mot marknaden −0,07 (z −0,7) · mål 1,14 · ö2,5 −4 pe | 75 m · mot marknaden +0,05 (z +0,4) · mål 1,17 · ö2,5 +6 pe |

## Lag (säsong 2026/27)

### AEK

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 61,1 %). 92 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,32), 0,20 emot (xG 0,16), 3,80 hörnor · 2025/26 (32 m): 0,38 mål för (xG 0,52), 0,22 emot (xG 0,13), 5,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 25 | 1,88–0,72 | +0,10 | +0,08 (+0,4) | +9 pe | −12 pe | +0,06 / +0,11 ✔ |
| Balanserat | 47 | 1,87–0,98 | −0,04 | −0,06 (−0,4) | −2 pe | +6 pe | −0,11 / −0,02 ✔ |
| Bollinnehav | 20 | 1,90–0,70 | +0,06 | +0,04 (+0,2) | −11 pe | +2 pe | +0,27 / −0,24  |
| Kortpass | 17 | 2,06–0,88 | +0,11 | +0,09 (+0,3) | −6 pe | +14 pe | +1,25 / +0,01  |
| Blandat | 52 | 1,77–0,83 | +0,02 | −0,00 (−0,0) | −1 pe | −4 pe | −0,00 / −0,01 ✔ |
| Direktspel | 23 | 2,00–0,87 | −0,03 | −0,05 (−0,3) | +3 pe | +0 pe | +0,02 / −0,18  |
| Lågpress | 10 | 2,30–0,80 | +0,18 | +0,16 (+0,7) | +4 pe | +12 pe | +0,05 / +0,58  |
| Mellanpress | 48 | 2,10–0,65 | +0,26 | +0,24 (+1,8) | −1 pe | +2 pe | +0,25 / +0,22 ✔ |
| Högpress | 34 | 1,44–1,15 | −0,36 | −0,38 (−1,9) | −2 pe | −5 pe | −0,50 / −0,32 ✔ |
| Svag på fasta | 39 | 2,03–0,87 | +0,23 | +0,21 (+1,4) | −5 pe | +11 pe | +0,27 / +0,17 ✔ |
| Medel på fasta | 37 | 1,81–0,84 | −0,08 | −0,10 (−0,5) | +4 pe | −7 pe | −0,08 / −0,11 ✔ |
| Farlig på fasta | 16 | 1,69–0,81 | −0,27 | −0,29 (−1,0) | −4 pe | −8 pe | −0,11 / −0,43 ✔ |
| Stark mot fasta | 19 | 2,05–0,79 | +0,18 | +0,15 (+0,6) | +3 pe | +7 pe | +0,21 / +0,11 ✔ |
| Medel mot fasta | 56 | 1,84–0,84 | −0,05 | −0,07 (−0,5) | −3 pe | −1 pe | +0,00 / −0,14  |
| Svag mot fasta | 17 | 1,82–0,94 | +0,07 | +0,05 (+0,2) | −1 pe | −4 pe | −0,02 / +0,15  |

- Svårast mot **Högpress** (−0,38 p/match rel. eget snitt, z −1,9, 34 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,24 p/match rel. eget snitt, z +1,8, 48 m) – åt samma håll i båda halvorna men svagt

### Aris

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,6 %). 91 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,50), 0,20 emot (xG 0,20), 5,80 hörnor · 2025/26 (32 m): 0,25 mål för (xG 0,32), 0,25 emot (xG 0,27), 5,16 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,36–0,95 | +0,12 | +0,01 (+0,1) | +2 pe | −1 pe | −0,03 / +0,07  |
| Balanserat | 49 | 1,20–1,33 | +0,20 | +0,10 (+0,5) | −7 pe | −2 pe | +0,24 / −0,06  |
| Bollinnehav | 20 | 1,25–1,00 | −0,15 | −0,25 (−1,1) | +22 pe | −21 pe | −0,26 / −0,25 ✔ |
| Kortpass | 18 | 1,39–1,17 | +0,20 | +0,10 (+0,4) | +22 pe | +0 pe | −0,08 / +0,11  |
| Blandat | 49 | 1,12–1,20 | +0,04 | −0,06 (−0,3) | −6 pe | −12 pe | +0,13 / −0,26  |
| Direktspel | 24 | 1,42–1,08 | +0,16 | +0,06 (+0,2) | +1 pe | +2 pe | +0,06 / +0,04 ✔ |
| Lågpress | 11 | 1,55–1,55 | +0,04 | −0,07 (−0,2) | −25 pe | +15 pe | +0,33 / −0,29  |
| Mellanpress | 48 | 1,21–1,17 | −0,07 | −0,17 (−1,0) | +3 pe | −13 pe | −0,18 / −0,16 ✔ |
| Högpress | 32 | 1,22–1,03 | +0,38 | +0,28 (+1,4) | +9 pe | −3 pe | +0,46 / +0,09 ✔ |
| Svag på fasta | 32 | 1,22–1,19 | −0,05 | −0,16 (−0,7) | +2 pe | −9 pe | +0,40 / −0,41  |
| Medel på fasta | 40 | 1,38–1,15 | +0,24 | +0,14 (+0,7) | −0 pe | +2 pe | +0,05 / +0,34 ✔ |
| Farlig på fasta | 19 | 1,05–1,16 | +0,08 | −0,02 (−0,1) | +5 pe | −19 pe | −0,17 / +0,06  |
| Stark mot fasta | 27 | 1,15–1,30 | +0,09 | −0,02 (−0,1) | +8 pe | −7 pe | −0,08 / +0,03  |
| Medel mot fasta | 44 | 1,32–1,27 | +0,08 | −0,03 (−0,1) | −3 pe | −1 pe | +0,10 / −0,17  |
| Svag mot fasta | 20 | 1,25–0,75 | +0,19 | +0,08 (+0,3) | +3 pe | −16 pe | +0,29 / −0,12  |

- Svårast mot **Bollinnehav** (−0,25 p/match rel. eget snitt, z −1,1, 20 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,28 p/match rel. eget snitt, z +1,4, 32 m) – åt samma håll i båda halvorna men svagt

### Asteras Tripolis

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 49,8 %). 90 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (5 m): 0,00 mål för (xG 0,18), 0,40 emot (xG 0,28), 4,40 hörnor · 2025/26 (36 m): 0,22 mål för (xG 0,32), 0,28 emot (xG 0,22), 4,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,05–1,45 | −0,14 | −0,08 (−0,3) | −9 pe | +10 pe | −0,39 / +0,22  |
| Balanserat | 38 | 0,89–1,74 | −0,20 | −0,14 (−0,8) | −7 pe | +7 pe | −0,05 / −0,23 ✔ |
| Bollinnehav | 30 | 1,20–1,17 | +0,19 | +0,24 (+1,0) | −12 pe | −4 pe | +0,74 / −0,25  |
| Kortpass | 18 | 1,06–1,28 | −0,13 | −0,07 (−0,3) | −5 pe | +0 pe | +0,93 / −0,20  |
| Blandat | 45 | 1,11–1,56 | −0,03 | +0,03 (+0,2) | −12 pe | +9 pe | +0,17 / −0,09  |
| Direktspel | 27 | 0,89–1,48 | −0,06 | −0,00 (−0,0) | −8 pe | −1 pe | +0,02 / −0,08  |
| Lågpress | 16 | 1,38–1,38 | +0,19 | +0,25 (+0,8) | +2 pe | +6 pe | +0,44 / −0,16  |
| Mellanpress | 48 | 0,92–1,35 | −0,15 | −0,10 (−0,6) | −13 pe | +2 pe | −0,12 / −0,08 ✔ |
| Högpress | 26 | 1,04–1,77 | −0,03 | +0,03 (+0,1) | −9 pe | +7 pe | +0,30 / −0,20  |
| Svag på fasta | 38 | 1,21–1,61 | +0,05 | +0,11 (+0,5) | −15 pe | +14 pe | +0,69 / −0,12  |
| Medel på fasta | 34 | 1,03–1,41 | −0,05 | +0,00 (+0,0) | −7 pe | +3 pe | +0,02 / −0,04  |
| Farlig på fasta | 15 | 0,60–1,47 | −0,37 | −0,32 (−1,2) | −4 pe | −7 pe | −0,40 / −0,25 ✔ |
| Stark mot fasta | 23 | 1,13–1,74 | −0,23 | −0,18 (−0,8) | −10 pe | +16 pe | −0,49 / −0,07 ✔ |
| Medel mot fasta | 44 | 1,07–1,36 | +0,09 | +0,15 (+0,8) | −9 pe | −2 pe | +0,52 / −0,25  |
| Svag mot fasta | 20 | 0,85–1,55 | −0,20 | −0,15 (−0,5) | −13 pe | +12 pe | −0,28 / +0,10  |

- Svårast mot **Farlig på fasta** (−0,32 p/match rel. eget snitt, z −1,2, 15 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,24 p/match rel. eget snitt, z +1,0, 30 m) – inte stabilt, troligen slump

### Atromitos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 45,9 %). 86 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (5 m): 0,00 mål för (xG 0,12), 0,20 emot (xG 0,14), 3,40 hörnor · 2025/26 (36 m): 0,42 mål för (xG 0,33), 0,14 emot (xG 0,26), 4,28 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,45–1,50 | +0,18 | +0,21 (+0,9) | −5 pe | +10 pe | +0,33 / +0,07 ✔ |
| Balanserat | 41 | 0,93–1,49 | −0,13 | −0,09 (−0,4) | −14 pe | +5 pe | −0,29 / +0,12  |
| Bollinnehav | 23 | 1,35–1,13 | −0,08 | −0,04 (−0,2) | +34 pe | −7 pe | −0,09 / −0,00 ✔ |
| Kortpass | 12 | 1,67–0,83 | −0,04 | −0,01 (−0,0) | +23 pe | −3 pe | +0,39 / −0,05  |
| Blandat | 53 | 1,09–1,36 | −0,01 | +0,02 (+0,1) | −3 pe | +2 pe | −0,06 / +0,10  |
| Direktspel | 21 | 1,10–1,81 | −0,09 | −0,05 (−0,3) | −1 pe | +9 pe | −0,10 / +0,15  |
| Lågpress | 8 | 1,38–1,50 | −0,04 | −0,00 (−0,0) | −26 pe | +14 pe | +0,11 / −0,19  |
| Mellanpress | 52 | 1,33–1,31 | −0,01 | +0,02 (+0,1) | +7 pe | +8 pe | −0,08 / +0,11  |
| Högpress | 26 | 0,81–1,54 | −0,08 | −0,04 (−0,2) | −1 pe | −10 pe | −0,12 / +0,04  |
| Svag på fasta | 36 | 1,19–1,31 | −0,11 | −0,08 (−0,4) | +9 pe | +1 pe | −0,11 / −0,06 ✔ |
| Medel på fasta | 32 | 0,97–1,59 | −0,16 | −0,13 (−0,7) | −1 pe | +3 pe | −0,17 / −0,06 ✔ |
| Farlig på fasta | 18 | 1,50–1,22 | +0,35 | +0,38 (+1,2) | −10 pe | +6 pe | +0,25 / +0,49 ✔ |
| Stark mot fasta | 19 | 1,47–1,58 | −0,01 | +0,02 (+0,1) | +1 pe | +17 pe | +0,21 / −0,07  |
| Medel mot fasta | 51 | 0,98–1,31 | −0,05 | −0,02 (−0,1) | +6 pe | −6 pe | −0,13 / +0,09  |
| Svag mot fasta | 16 | 1,44–1,44 | −0,01 | +0,03 (+0,1) | −14 pe | +17 pe | −0,09 / +0,38  |

- Svårast mot **Medel på fasta** (−0,13 p/match rel. eget snitt, z −0,7, 32 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,38 p/match rel. eget snitt, z +1,2, 18 m) – åt samma håll i båda halvorna men svagt

### Kifisia

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 45,0 %). 5 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (5 m): 0,00 mål för (xG 0,14), 0,20 emot (xG 0,10), 4,40 hörnor · 2025/26 (36 m): 0,17 mål för (xG 0,28), 0,17 emot (xG 0,25), 4,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Balanserat | 3 | 0,67–2,00 | −0,34 | −0,36 (−0,9) | +12 pe | −20 pe | −0,31 / −0,47  |
| Bollinnehav | 2 | 1,00–0,50 | +0,57 | +0,55 (+0,6) | +21 pe | +6 pe | – / +0,55  |
| Kortpass | 5 | 0,80–1,40 | +0,03 | 0,00 (0,0) | +15 pe | −9 pe | −0,31 / +0,21  |
| Lågpress | 3 | 0,33–1,00 | −0,41 | −0,44 (−1,1) | +41 pe | −48 pe | −0,31 / −0,69  |
| Mellanpress | 2 | 1,50–2,00 | +0,69 | +0,66 (+0,8) | −23 pe | +49 pe | – / +0,66  |
| Medel på fasta | 3 | 0,33–1,67 | −0,74 | −0,76 (−4,8) | +8 pe | −16 pe | −1,13 / −0,58  |
| Farlig på fasta | 2 | 1,50–1,00 | +1,17 | +1,14 (+2,5) | +26 pe | +1 pe | +0,50 / +1,79  |
| Stark mot fasta | 2 | 1,00–1,50 | +0,36 | +0,33 (+0,3) | −29 pe | +6 pe | −1,13 / +1,79  |
| Medel mot fasta | 2 | 1,00–2,00 | +0,05 | +0,02 (+0,1) | +32 pe | −7 pe | +0,50 / −0,47  |
| Svag mot fasta | 1 | 0,00–0,00 | −0,67 | −0,69 (−6,9) | +71 pe | −45 pe | – / −0,69  |

### Levadeiakos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 44,0 %). 33 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2025/26 (32 m): 0,19 mål för (xG 0,29), 0,53 emot (xG 0,35), 4,34 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 8 | 2,25–1,00 | +0,44 | +0,44 (+1,6) | +12 pe | +16 pe | +0,30 / +0,83  |
| Balanserat | 21 | 1,43–1,81 | −0,17 | −0,18 (−0,8) | −2 pe | +13 pe | +0,36 / −0,44  |
| Bollinnehav | 4 | 1,75–1,75 | +0,05 | +0,05 (+0,1) | −23 pe | +0 pe | +0,28 / −0,63  |
| Kortpass | 11 | 2,27–1,36 | +0,54 | +0,54 (+2,0) | −7 pe | +14 pe | +0,67 / +0,38 ✔ ⚑ |
| Blandat | 20 | 1,40–1,75 | −0,29 | −0,30 (−1,4) | −1 pe | +12 pe | +0,16 / −0,67  |
| Direktspel | 2 | 1,00–1,50 | −0,01 | −0,02 (−0,1) | +31 pe | −1 pe | −0,36 / +0,33  |
| Lågpress | 6 | 1,50–2,17 | −0,48 | −0,48 (−1,0) | −27 pe | +17 pe | +1,25 / −0,83  |
| Mellanpress | 20 | 1,95–1,40 | +0,21 | +0,21 (+1,1) | +4 pe | +12 pe | +0,48 / −0,21  |
| Högpress | 7 | 1,00–1,71 | −0,17 | −0,17 (−0,6) | +5 pe | +8 pe | −0,62 / +0,17  |
| Svag på fasta | 15 | 2,13–1,47 | +0,10 | +0,10 (+0,4) | −6 pe | +12 pe | +0,58 / −0,45  |
| Medel på fasta | 14 | 1,50–1,43 | +0,10 | +0,10 (+0,4) | +9 pe | +9 pe | +0,39 / −0,12  |
| Farlig på fasta | 4 | 0,50–2,75 | −0,73 | −0,73 (−7,5) | −23 pe | +25 pe | −0,90 / −0,55  |
| Stark mot fasta | 11 | 2,91–0,82 | +0,86 | +0,86 (+4,8) | −8 pe | +25 pe | +0,81 / +0,93  |
| Medel mot fasta | 18 | 0,78–2,06 | −0,48 | −0,49 (−3,3) | +9 pe | +2 pe | −0,22 / −0,70 ✔ ⚑ |
| Svag mot fasta | 4 | 2,25–1,75 | −0,16 | −0,17 (−0,2) | −28 pe | +25 pe | +1,25 / −0,64  |

- Svårast mot **Medel mot fasta** (−0,49 p/match rel. eget snitt, z −3,3, 18 m) – ⚑ håller i båda halvorna
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +1,1, 20 m) – inte stabilt, troligen slump

### OFI Crete

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 53,0 %). 91 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,24), 0,00 emot (xG 0,02), 2,80 hörnor · 2025/26 (32 m): 0,28 mål för (xG 0,23), 0,22 emot (xG 0,22), 2,91 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 1,29–1,58 | −0,16 | −0,20 (−1,0) | +7 pe | +10 pe | −0,34 / −0,01 ✔ |
| Balanserat | 47 | 1,09–1,66 | +0,06 | +0,02 (+0,1) | −8 pe | +5 pe | −0,00 / +0,04  |
| Bollinnehav | 20 | 1,25–1,35 | +0,25 | +0,20 (+0,8) | −6 pe | −6 pe | +0,50 / +0,04 ✔ |
| Kortpass | 17 | 1,41–1,59 | +0,19 | +0,15 (+0,5) | −15 pe | +3 pe | −0,88 / +0,21  |
| Blandat | 46 | 1,17–1,57 | +0,16 | +0,11 (+0,6) | −10 pe | +4 pe | +0,17 / +0,06 ✔ |
| Direktspel | 28 | 1,04–1,57 | −0,23 | −0,28 (−1,4) | +14 pe | +3 pe | −0,18 / −0,72 ✔ |
| Lågpress | 8 | 1,00–1,00 | −0,25 | −0,29 (−0,8) | +22 pe | −24 pe | −0,29 / –  |
| Mellanpress | 56 | 1,27–1,41 | −0,02 | −0,07 (−0,4) | +2 pe | +2 pe | −0,14 / +0,01  |
| Högpress | 27 | 1,04–2,07 | +0,27 | +0,22 (+0,8) | −23 pe | +16 pe | +0,54 / +0,06 ✔ |
| Svag på fasta | 31 | 1,16–1,84 | +0,12 | +0,08 (+0,3) | −13 pe | +5 pe | −0,02 / +0,15  |
| Medel på fasta | 39 | 1,13–1,33 | +0,01 | −0,04 (−0,2) | +10 pe | −4 pe | −0,08 / +0,02  |
| Farlig på fasta | 18 | 1,39–1,72 | +0,02 | −0,03 (−0,1) | −18 pe | +26 pe | +0,14 / −0,16  |
| Stark mot fasta | 21 | 1,33–1,71 | +0,30 | +0,26 (+1,0) | −11 pe | +6 pe | +0,06 / +0,34 ✔ |
| Medel mot fasta | 48 | 1,02–1,71 | −0,10 | −0,15 (−0,9) | −7 pe | +4 pe | −0,16 / −0,13 ✔ |
| Svag mot fasta | 19 | 1,47–1,16 | +0,16 | +0,11 (+0,4) | +11 pe | +8 pe | +0,17 / −0,05  |

- Svårast mot **Direktspel** (−0,28 p/match rel. eget snitt, z −1,4, 28 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,26 p/match rel. eget snitt, z +1,0, 21 m) – åt samma håll i båda halvorna men svagt

### Olympiakos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 63,4 %). 93 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,32), 0,00 emot (xG 0,08), 9,20 hörnor · 2025/26 (32 m): 0,28 mål för (xG 0,38), 0,09 emot (xG 0,09), 6,88 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 17 | 2,47–0,35 | +0,37 | +0,30 (+1,8) | −16 pe | +2 pe | +0,13 / +0,55 ✔ |
| Balanserat | 50 | 1,58–0,94 | −0,13 | −0,19 (−1,1) | −1 pe | −2 pe | −0,22 / −0,16 ✔ |
| Bollinnehav | 26 | 1,85–0,62 | +0,23 | +0,17 (+0,9) | +1 pe | −9 pe | +0,18 / +0,16 ✔ |
| Kortpass | 20 | 1,55–0,50 | +0,03 | −0,03 (−0,1) | +4 pe | −26 pe | −0,44 / −0,01  |
| Blandat | 46 | 1,74–0,85 | −0,06 | −0,12 (−0,8) | −4 pe | +0 pe | −0,08 / −0,17 ✔ |
| Direktspel | 27 | 2,15–0,74 | +0,29 | +0,23 (+1,0) | −7 pe | +7 pe | −0,01 / +0,92  |
| Lågpress | 12 | 2,17–0,50 | +0,12 | +0,06 (+0,2) | −2 pe | +12 pe | +0,20 / −0,23  |
| Mellanpress | 51 | 1,78–0,59 | +0,11 | +0,04 (+0,3) | −5 pe | −11 pe | −0,18 / +0,24  |
| Högpress | 30 | 1,73–1,10 | −0,04 | −0,10 (−0,4) | −1 pe | +3 pe | −0,00 / −0,18 ✔ |
| Svag på fasta | 31 | 1,84–0,81 | −0,07 | −0,13 (−0,7) | −1 pe | +2 pe | −0,38 / +0,08  |
| Medel på fasta | 37 | 2,00–0,76 | +0,17 | +0,11 (+0,6) | −10 pe | +1 pe | +0,07 / +0,18 ✔ |
| Farlig på fasta | 25 | 1,52–0,64 | +0,06 | −0,01 (−0,0) | +4 pe | −17 pe | +0,11 / −0,06  |
| Stark mot fasta | 20 | 1,45–0,90 | −0,21 | −0,27 (−1,2) | −6 pe | −12 pe | −0,79 / +0,07  |
| Medel mot fasta | 51 | 1,76–0,75 | −0,11 | −0,17 (−1,1) | +4 pe | −7 pe | −0,15 / −0,20 ✔ |
| Svag mot fasta | 22 | 2,27–0,59 | +0,70 | +0,64 (+3,8) | −17 pe | +12 pe | +0,69 / +0,59 ✔ ⚑ |

- Svårast mot **Stark mot fasta** (−0,27 p/match rel. eget snitt, z −1,2, 20 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,64 p/match rel. eget snitt, z +3,8, 22 m) – ⚑ håller i båda halvorna

### Panathinaikos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 65,0 %). 92 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026/27 (5 m): 0,40 mål för (xG 0,20), 0,00 emot (xG 0,02), 7,00 hörnor · 2025/26 (32 m): 0,31 mål för (xG 0,29), 0,16 emot (xG 0,18), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 1,79–0,71 | +0,35 | +0,24 (+1,1) | −1 pe | +0 pe | +0,56 / −0,13  |
| Balanserat | 47 | 1,77–1,17 | +0,15 | +0,04 (+0,2) | −6 pe | +18 pe | −0,24 / +0,33  |
| Bollinnehav | 21 | 1,57–1,10 | −0,26 | −0,37 (−1,5) | +4 pe | −7 pe | −0,46 / −0,30 ✔ |
| Kortpass | 9 | 1,78–0,44 | +0,13 | +0,03 (+0,1) | −0 pe | −6 pe | – / +0,03  |
| Blandat | 53 | 1,60–1,17 | −0,04 | −0,14 (−0,9) | +2 pe | +4 pe | −0,15 / −0,14 ✔ |
| Direktspel | 30 | 1,93–0,97 | +0,36 | +0,25 (+1,2) | −11 pe | +18 pe | +0,07 / +0,61 ✔ |
| Lågpress | 13 | 2,46–0,69 | +0,22 | +0,11 (+0,3) | −23 pe | +3 pe | −0,35 / +0,84  |
| Mellanpress | 45 | 1,84–0,89 | +0,29 | +0,18 (+1,1) | −5 pe | +8 pe | +0,40 / −0,01  |
| Högpress | 34 | 1,29–1,35 | −0,17 | −0,28 (−1,4) | +9 pe | +8 pe | −0,48 / −0,07 ✔ |
| Svag på fasta | 31 | 1,58–0,74 | +0,10 | −0,01 (−0,0) | −2 pe | −13 pe | +0,02 / −0,02  |
| Medel på fasta | 41 | 2,10–1,12 | +0,16 | +0,05 (+0,3) | −2 pe | +24 pe | −0,01 / +0,20  |
| Farlig på fasta | 20 | 1,20–1,30 | +0,01 | −0,10 (−0,3) | −4 pe | +6 pe | −0,35 / +0,04  |
| Stark mot fasta | 19 | 1,79–0,89 | +0,27 | +0,16 (+0,6) | +1 pe | +20 pe | +0,45 / −0,05  |
| Medel mot fasta | 52 | 1,69–1,19 | −0,10 | −0,20 (−1,3) | −1 pe | +6 pe | −0,31 / −0,08 ✔ |
| Svag mot fasta | 21 | 1,76–0,76 | +0,46 | +0,36 (+1,5) | −10 pe | −1 pe | +0,24 / +0,46 ✔ |

- Svårast mot **Bollinnehav** (−0,37 p/match rel. eget snitt, z −1,5, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,36 p/match rel. eget snitt, z +1,5, 21 m) – åt samma håll i båda halvorna men svagt

### Panetolikos

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 42,5 %). 86 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (5 m): 0,60 mål för (xG 0,26), 0,40 emot (xG 0,28), 3,20 hörnor · 2025/26 (36 m): 0,11 mål för (xG 0,12), 0,33 emot (xG 0,17), 3,64 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 0,95–1,18 | −0,07 | −0,08 (−0,3) | −5 pe | −3 pe | −0,45 / +0,18  |
| Balanserat | 42 | 0,76–1,36 | +0,01 | −0,00 (−0,0) | −1 pe | −10 pe | +0,01 / −0,02  |
| Bollinnehav | 22 | 0,86–1,73 | +0,09 | +0,08 (+0,3) | −14 pe | +6 pe | +0,44 / −0,16  |
| Kortpass | 18 | 0,72–1,67 | −0,28 | −0,29 (−1,2) | −4 pe | +0 pe | −0,78 / −0,26  |
| Blandat | 48 | 0,92–1,44 | +0,12 | +0,11 (+0,6) | −8 pe | +3 pe | +0,05 / +0,17 ✔ |
| Direktspel | 20 | 0,75–1,10 | +0,02 | +0,01 (+0,0) | +1 pe | −23 pe | −0,03 / +0,16  |
| Lågpress | 9 | 1,22–1,78 | +0,20 | +0,19 (+0,5) | −27 pe | +9 pe | −0,06 / +0,50  |
| Mellanpress | 49 | 0,90–1,20 | +0,07 | +0,06 (+0,3) | −7 pe | −3 pe | +0,09 / +0,04 ✔ |
| Högpress | 28 | 0,61–1,64 | −0,16 | −0,17 (−1,1) | +5 pe | −10 pe | −0,09 / −0,27 ✔ |
| Svag på fasta | 32 | 0,84–1,59 | −0,03 | −0,04 (−0,2) | −5 pe | −1 pe | +0,08 / −0,13  |
| Medel på fasta | 33 | 0,97–1,39 | −0,05 | −0,06 (−0,3) | −7 pe | +1 pe | −0,07 / −0,04 ✔ |
| Farlig på fasta | 21 | 0,62–1,14 | +0,16 | +0,15 (+0,6) | −2 pe | −16 pe | +0,04 / +0,22 ✔ |
| Stark mot fasta | 18 | 0,78–2,11 | −0,37 | −0,38 (−1,7) | −2 pe | +14 pe | −0,24 / −0,44 ✔ |
| Medel mot fasta | 48 | 0,88–1,42 | +0,02 | +0,01 (+0,0) | −5 pe | −1 pe | +0,01 / −0,00  |
| Svag mot fasta | 20 | 0,80–0,75 | +0,33 | +0,32 (+1,1) | −8 pe | −27 pe | +0,12 / +0,53 ✔ |

- Svårast mot **Stark mot fasta** (−0,38 p/match rel. eget snitt, z −1,7, 18 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,32 p/match rel. eget snitt, z +1,1, 20 m) – åt samma håll i båda halvorna men svagt

### PAOK

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 45,3 %). 93 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,20), 0,20 emot (xG 0,10), 3,80 hörnor · 2025/26 (32 m): 0,38 mål för (xG 0,37), 0,19 emot (xG 0,12), 5,41 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 2,21–0,92 | +0,23 | +0,13 (+0,6) | +0 pe | +9 pe | +0,24 / +0,00 ✔ |
| Balanserat | 43 | 2,12–1,14 | +0,22 | +0,12 (+0,7) | −7 pe | +18 pe | +0,43 / −0,20  |
| Bollinnehav | 26 | 1,77–0,88 | −0,22 | −0,32 (−1,3) | −4 pe | +13 pe | −0,92 / +0,12  |
| Kortpass | 19 | 1,89–1,11 | −0,18 | −0,28 (−1,0) | −8 pe | +22 pe | −0,80 / −0,25  |
| Blandat | 48 | 2,08–1,08 | −0,00 | −0,10 (−0,6) | −6 pe | +19 pe | −0,09 / −0,12 ✔ |
| Direktspel | 26 | 2,08–0,81 | +0,50 | +0,40 (+2,4) | +1 pe | +0 pe | +0,28 / +0,70 ✔ ⚑ |
| Lågpress | 12 | 2,00–0,67 | +0,11 | +0,01 (+0,0) | −12 pe | +11 pe | −0,29 / +0,61  |
| Mellanpress | 55 | 2,20–0,93 | +0,11 | +0,00 (+0,0) | −2 pe | +15 pe | +0,24 / −0,23  |
| Högpress | 26 | 1,73–1,35 | +0,09 | −0,01 (−0,0) | −6 pe | +15 pe | −0,18 / +0,11  |
| Svag på fasta | 39 | 2,05–1,00 | +0,02 | −0,08 (−0,4) | −3 pe | +20 pe | −0,31 / +0,06  |
| Medel på fasta | 33 | 2,12–0,94 | +0,18 | +0,08 (+0,4) | −6 pe | +6 pe | +0,21 / −0,25  |
| Farlig på fasta | 21 | 1,90–1,14 | +0,13 | +0,03 (+0,1) | −5 pe | +16 pe | +0,30 / −0,11  |
| Stark mot fasta | 23 | 2,17–1,26 | +0,23 | +0,13 (+0,5) | −5 pe | +20 pe | +0,36 / −0,13  |
| Medel mot fasta | 53 | 1,77–0,96 | −0,06 | −0,17 (−1,1) | −1 pe | +5 pe | −0,27 / −0,07 ✔ |
| Svag mot fasta | 17 | 2,71–0,82 | +0,45 | +0,34 (+1,4) | −14 pe | +35 pe | +0,53 / +0,13 ✔ |

- Svårast mot **Bollinnehav** (−0,32 p/match rel. eget snitt, z −1,3, 26 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,40 p/match rel. eget snitt, z +2,4, 26 m) – ⚑ håller i båda halvorna

### Volos NFC

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 47,1 %). 86 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026/27 (5 m): 0,20 mål för (xG 0,26), 0,20 emot (xG 0,28), 2,00 hörnor · 2025/26 (32 m): 0,13 mål för (xG 0,21), 0,34 emot (xG 0,38), 3,94 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,05–1,23 | +0,07 | +0,16 (+0,6) | +1 pe | +0 pe | +0,04 / +0,27 ✔ |
| Balanserat | 43 | 0,93–1,74 | −0,07 | +0,02 (+0,1) | −5 pe | +7 pe | +0,04 / −0,01  |
| Bollinnehav | 21 | 0,95–1,90 | −0,29 | −0,20 (−0,8) | −12 pe | +15 pe | +0,11 / −0,49  |
| Kortpass | 14 | 0,86–2,00 | −0,41 | −0,32 (−1,0) | −25 pe | +22 pe | −0,60 / −0,30  |
| Blandat | 49 | 0,96–1,59 | +0,00 | +0,09 (+0,6) | −5 pe | +6 pe | +0,05 / +0,13 ✔ |
| Direktspel | 23 | 1,04–1,57 | −0,09 | −0,00 (−0,0) | +5 pe | +1 pe | +0,10 / −0,38  |
| Lågpress | 14 | 0,79–1,50 | −0,42 | −0,33 (−1,2) | +8 pe | −19 pe | −0,38 / −0,26 ✔ |
| Mellanpress | 42 | 1,07–1,43 | −0,04 | +0,05 (+0,3) | −4 pe | +9 pe | +0,12 / −0,01  |
| Högpress | 30 | 0,90–2,03 | −0,01 | +0,08 (+0,4) | −12 pe | +16 pe | +0,21 / −0,05  |
| Svag på fasta | 31 | 0,74–1,81 | −0,17 | −0,08 (−0,4) | −16 pe | +4 pe | −0,27 / +0,04  |
| Medel på fasta | 36 | 1,08–1,67 | −0,07 | +0,01 (+0,1) | +4 pe | +9 pe | +0,23 / −0,41  |
| Farlig på fasta | 19 | 1,11–1,37 | +0,02 | +0,11 (+0,4) | −6 pe | +8 pe | +0,05 / +0,14 ✔ |
| Stark mot fasta | 17 | 0,88–2,29 | −0,24 | −0,15 (−0,6) | −18 pe | +32 pe | −0,14 / −0,16 ✔ |
| Medel mot fasta | 49 | 0,94–1,55 | −0,05 | +0,04 (+0,2) | −5 pe | +4 pe | +0,03 / +0,04 ✔ |
| Svag mot fasta | 20 | 1,10–1,35 | −0,05 | +0,04 (+0,1) | +4 pe | −7 pe | +0,20 / −0,22  |

- Svårast mot **Bollinnehav** (−0,20 p/match rel. eget snitt, z −0,8, 21 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,16 p/match rel. eget snitt, z +0,6, 22 m) – åt samma håll i båda halvorna men svagt
