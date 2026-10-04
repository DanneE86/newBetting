# Stilmatchning – Allsvenskan (AS)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1492 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 103 m · hemma +0,07 · kryss +3 pe · ö2,5 – | 161 m · hemma −0,17 · kryss −2 pe · ö2,5 – | 164 m · hemma −0,00 · kryss +0 pe · ö2,5 – |
| **Mellan** | 160 m · hemma −0,08 · kryss +2 pe · ö2,5 – | 163 m · hemma −0,05 · kryss −1 pe · ö2,5 – | 202 m · hemma −0,16 · kryss +3 pe · ö2,5 – |
| **Mycket boll** | 168 m · hemma −0,02 · kryss −2 pe · ö2,5 – | 201 m · hemma −0,16 · kryss −7 pe · ö2,5 – | 170 m · hemma +0,15 · kryss +4 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 161 m · hemma +0,01 · kryss +0 pe · ö2,5 – | 197 m · hemma −0,11 · kryss +0 pe · ö2,5 – | 164 m · hemma +0,03 · kryss +4 pe · ö2,5 – |
| **Balanserat** | 198 m · hemma −0,14 · kryss +2 pe · ö2,5 – | 187 m · hemma +0,07 · kryss −1 pe · ö2,5 – | 156 m · hemma −0,12 · kryss −5 pe · ö2,5 – |
| **Bollinnehav** | 165 m · hemma −0,03 · kryss −1 pe · ö2,5 – | 156 m · hemma −0,12 · kryss −6 pe · ö2,5 – | 108 m · hemma −0,09 · kryss +3 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 504 m · mot marknaden +0,04 (z +0,7) · mål 1,45 · ö2,5 – | 364 m · mot marknaden +0,02 (z +0,3) · mål 1,45 · ö2,5 – | 226 m · mot marknaden −0,05 (z −0,7) · mål 1,32 · ö2,5 – |
| **Medel på fasta** | 324 m · mot marknaden −0,08 (z −1,2) · mål 1,26 · ö2,5 – | 410 m · mot marknaden −0,03 (z −0,6) · mål 1,33 · ö2,5 – | 200 m · mot marknaden −0,02 (z −0,2) · mål 1,24 · ö2,5 – |
| **Farlig på fasta** | 290 m · mot marknaden −0,02 (z −0,3) · mål 1,38 · ö2,5 – | 408 m · mot marknaden +0,15 (z +2,5) · mål 1,49 · ö2,5 – | 258 m · mot marknaden −0,08 (z −1,1) · mål 1,49 · ö2,5 – |

## Lag (säsong 2026)

### AIK

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 53,5 %). 219 matcher med stil, mot marknaden totalt +0,07 per match.

Fasta situationer per match: 2026 (22 m): 0,14 mål för (xG 0,19), 0,27 emot (xG 0,45), 5,09 hörnor · 2025 (30 m): 0,40 mål för (xG 0,48), 0,10 emot (xG 0,18), 5,73 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,49–1,10 | +0,13 | +0,05 (+0,4) | −2 pe | – | +0,43 / −0,25  |
| Balanserat | 81 | 1,19–1,15 | +0,03 | −0,04 (−0,3) | −8 pe | – | −0,11 / +0,06  |
| Bollinnehav | 69 | 1,26–1,03 | +0,06 | −0,01 (−0,0) | +8 pe | – | +0,11 / −0,10  |
| Kortpass | 57 | 1,37–1,11 | +0,22 | +0,15 (+0,9) | +7 pe | – | +0,16 / +0,15 ✔ |
| Blandat | 88 | 1,28–1,31 | −0,22 | −0,29 (−2,1) | −3 pe | – | −0,22 / −0,38 ✔ ⚑ |
| Direktspel | 74 | 1,28–0,84 | +0,30 | +0,23 (+1,7) | −3 pe | – | +0,42 / −0,16  |
| Lågpress | 60 | 1,28–0,85 | +0,21 | +0,14 (+0,9) | +3 pe | – | +0,16 / +0,02 ✔ |
| Mellanpress | 85 | 1,19–1,18 | −0,16 | −0,23 (−1,7) | +7 pe | – | −0,09 / −0,42 ✔ |
| Högpress | 74 | 1,46–1,20 | +0,22 | +0,15 (+1,0) | −12 pe | – | +0,78 / +0,05 ✔ |
| Svag på fasta | 78 | 1,22–1,00 | +0,09 | +0,02 (+0,1) | +1 pe | – | +0,08 / −0,04  |
| Medel på fasta | 70 | 1,26–1,11 | −0,06 | −0,13 (−0,8) | +0 pe | – | +0,01 / −0,28  |
| Farlig på fasta | 71 | 1,45–1,18 | +0,18 | +0,11 (+0,7) | −4 pe | – | +0,21 / −0,01  |
| Stark mot fasta | 83 | 1,29–1,01 | +0,08 | +0,01 (+0,1) | −4 pe | – | +0,03 / −0,01  |
| Medel mot fasta | 84 | 1,43–1,13 | +0,22 | +0,15 (+1,1) | −2 pe | – | +0,41 / −0,03  |
| Svag mot fasta | 52 | 1,13–1,17 | −0,18 | −0,25 (−1,5) | +5 pe | – | −0,10 / −0,60 ✔ |

- Svårast mot **Blandat** (−0,29 p/match rel. eget snitt, z −2,1, 88 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +1,7, 74 m) – inte stabilt, troligen slump

### Brommapojkarna

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 46,9 %). 70 matcher med stil, mot marknaden totalt −0,21 per match.

Fasta situationer per match: 2026 (22 m): 0,23 mål för (xG 0,28), 0,50 emot (xG 0,33), 4,54 hörnor · 2025 (30 m): 0,23 mål för (xG 0,26), 0,23 emot (xG 0,26), 5,10 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 26 | 1,38–1,42 | −0,07 | +0,14 (+0,6) | +5 pe | – | +0,12 / +0,17 ✔ |
| Balanserat | 24 | 1,29–2,13 | −0,28 | −0,07 (−0,3) | −3 pe | – | −0,42 / +0,18  |
| Bollinnehav | 20 | 1,30–1,90 | −0,32 | −0,11 (−0,4) | +2 pe | – | +0,14 / −0,48  |
| Kortpass | 36 | 1,14–1,83 | −0,18 | +0,03 (+0,2) | −2 pe | – | +0,01 / +0,05 ✔ |
| Blandat | 30 | 1,43–1,67 | −0,26 | −0,05 (−0,2) | +5 pe | – | +0,02 / −0,15  |
| Direktspel | 4 | 2,25–2,50 | −0,14 | +0,07 (+0,1) | +0 pe | – | −0,50 / +1,78  |
| Lågpress | 10 | 1,50–1,70 | +0,17 | +0,38 (+0,7) | −24 pe | – | +2,36 / −0,12  |
| Mellanpress | 28 | 1,25–1,68 | −0,29 | −0,07 (−0,4) | +1 pe | – | −0,33 / +0,07  |
| Högpress | 32 | 1,34–1,94 | −0,27 | −0,05 (−0,3) | +9 pe | – | −0,10 / +0,07  |
| Svag på fasta | 22 | 1,32–1,95 | −0,34 | −0,12 (−0,5) | −2 pe | – | +0,00 / −0,69  |
| Medel på fasta | 31 | 1,58–1,90 | −0,15 | +0,06 (+0,3) | −2 pe | – | −0,17 / +0,19  |
| Farlig på fasta | 17 | 0,88–1,41 | −0,17 | +0,04 (+0,2) | +10 pe | – | +0,12 / +0,00 ✔ |
| Stark mot fasta | 24 | 1,04–1,83 | −0,42 | −0,21 (−0,9) | +7 pe | – | −0,37 / +0,20  |
| Medel mot fasta | 38 | 1,37–1,76 | −0,17 | +0,05 (+0,3) | −0 pe | – | +0,25 / −0,10  |
| Svag mot fasta | 8 | 2,00–1,88 | +0,17 | +0,39 (+0,8) | −12 pe | – | +0,62 / +0,31  |

- Svårast mot **Stark mot fasta** (−0,21 p/match rel. eget snitt, z −0,9, 24 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,14 p/match rel. eget snitt, z +0,6, 26 m) – åt samma håll i båda halvorna men svagt

### Degerfors

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 46,7 %). 69 matcher med stil, mot marknaden totalt −0,21 per match.

Fasta situationer per match: 2026 (22 m): 0,27 mål för (xG 0,28), 0,32 emot (xG 0,26), 4,68 hörnor · 2025 (30 m): 0,17 mål för (xG 0,32), 0,27 emot (xG 0,35), 4,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 29 | 1,03–1,69 | −0,20 | +0,00 (+0,0) | +10 pe | – | −0,03 / +0,05  |
| Balanserat | 19 | 0,89–2,16 | −0,13 | +0,08 (+0,3) | −13 pe | – | +0,17 / −0,00  |
| Bollinnehav | 21 | 0,71–1,95 | −0,29 | −0,08 (−0,3) | −4 pe | – | +0,01 / −0,13  |
| Kortpass | 24 | 0,67–1,67 | −0,30 | −0,10 (−0,4) | −8 pe | – | +0,05 / −0,14  |
| Blandat | 21 | 1,10–1,81 | −0,09 | +0,11 (+0,5) | −1 pe | – | +0,16 / +0,06 ✔ |
| Direktspel | 24 | 0,96–2,21 | −0,21 | −0,00 (−0,0) | +8 pe | – | −0,06 / +0,12  |
| Lågpress | 7 | 0,71–1,14 | −0,12 | +0,08 (+0,2) | −26 pe | – | – / +0,08  |
| Mellanpress | 25 | 1,08–1,92 | −0,19 | +0,02 (+0,1) | −4 pe | – | +0,24 / −0,13  |
| Högpress | 37 | 0,81–2,03 | −0,23 | −0,03 (−0,2) | +7 pe | – | −0,05 / +0,02  |
| Svag på fasta | 18 | 0,89–2,22 | −0,10 | +0,11 (+0,4) | −11 pe | – | +0,41 / −0,04  |
| Medel på fasta | 16 | 1,06–1,69 | +0,07 | +0,28 (+0,9) | −7 pe | – | +0,37 / +0,23 ✔ |
| Farlig på fasta | 35 | 0,83–1,83 | −0,39 | −0,18 (−1,3) | +8 pe | – | −0,14 / −0,27 ✔ |
| Stark mot fasta | 21 | 1,14–1,62 | −0,24 | −0,04 (−0,2) | −2 pe | – | −0,17 / +0,04  |
| Medel mot fasta | 30 | 0,90–1,90 | −0,04 | +0,17 (+0,9) | +4 pe | – | +0,29 / +0,04 ✔ |
| Svag mot fasta | 18 | 0,61–2,22 | −0,44 | −0,23 (−1,0) | −6 pe | – | −0,18 / −0,33 ✔ |

- Svårast mot **Farlig på fasta** (−0,18 p/match rel. eget snitt, z −1,3, 35 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,28 p/match rel. eget snitt, z +0,9, 16 m) – åt samma håll i båda halvorna men svagt

### Djurgarden

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 55,6 %). 219 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (22 m): 0,46 mål för (xG 0,41), 0,27 emot (xG 0,14), 6,32 hörnor · 2025 (30 m): 0,33 mål för (xG 0,43), 0,27 emot (xG 0,25), 5,80 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 75 | 1,29–1,13 | −0,17 | −0,21 (−1,4) | −7 pe | – | −0,17 / −0,25 ✔ |
| Balanserat | 78 | 1,73–1,00 | +0,19 | +0,14 (+1,0) | −1 pe | – | +0,14 / +0,15 ✔ |
| Bollinnehav | 66 | 1,79–1,02 | +0,12 | +0,07 (+0,5) | −4 pe | – | +0,12 / +0,03 ✔ |
| Kortpass | 54 | 1,85–1,06 | +0,00 | −0,04 (−0,3) | −5 pe | – | +0,14 / −0,09  |
| Blandat | 95 | 1,53–1,09 | −0,09 | −0,13 (−1,0) | −0 pe | – | −0,08 / −0,19 ✔ |
| Direktspel | 70 | 1,50–0,99 | +0,26 | +0,21 (+1,4) | −9 pe | – | +0,15 / +0,35 ✔ |
| Lågpress | 63 | 1,54–0,94 | +0,07 | +0,02 (+0,1) | −4 pe | – | +0,01 / +0,07 ✔ |
| Mellanpress | 87 | 1,69–1,08 | −0,04 | −0,08 (−0,6) | −1 pe | – | +0,12 / −0,29  |
| Högpress | 69 | 1,54–1,12 | +0,13 | +0,08 (+0,5) | −8 pe | – | −0,15 / +0,12  |
| Svag på fasta | 76 | 1,49–1,13 | +0,01 | −0,04 (−0,2) | −7 pe | – | +0,14 / −0,21  |
| Medel på fasta | 73 | 1,64–0,96 | +0,08 | +0,03 (+0,2) | −3 pe | – | −0,06 / +0,12  |
| Farlig på fasta | 70 | 1,67–1,06 | +0,05 | +0,01 (+0,0) | −1 pe | – | +0,04 / −0,03  |
| Stark mot fasta | 82 | 1,43–1,17 | −0,23 | −0,28 (−1,9) | −4 pe | – | −0,25 / −0,30 ✔ |
| Medel mot fasta | 82 | 1,74–0,90 | +0,30 | +0,26 (+1,9) | −7 pe | – | +0,27 / +0,25 ✔ |
| Svag mot fasta | 55 | 1,64–1,09 | +0,07 | +0,03 (+0,2) | −0 pe | – | +0,15 / −0,16  |

- Svårast mot **Stark mot fasta** (−0,28 p/match rel. eget snitt, z −1,9, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,26 p/match rel. eget snitt, z +1,9, 82 m) – åt samma håll i båda halvorna men svagt

### Elfsborg

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 48,0 %). 219 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026 (22 m): 0,18 mål för (xG 0,31), 0,23 emot (xG 0,20), 4,23 hörnor · 2025 (30 m): 0,40 mål för (xG 0,51), 0,30 emot (xG 0,31), 5,77 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,44–1,22 | +0,03 | +0,03 (+0,2) | +9 pe | – | −0,03 / +0,07  |
| Balanserat | 84 | 1,45–1,49 | +0,02 | +0,02 (+0,1) | −1 pe | – | −0,03 / +0,08  |
| Bollinnehav | 67 | 1,57–1,36 | −0,05 | −0,05 (−0,3) | −3 pe | – | +0,11 / −0,19  |
| Kortpass | 56 | 1,46–1,23 | +0,02 | +0,02 (+0,1) | −3 pe | – | +0,49 / −0,08  |
| Blandat | 97 | 1,56–1,45 | −0,04 | −0,04 (−0,4) | +1 pe | – | −0,07 / −0,01 ✔ |
| Direktspel | 66 | 1,39–1,35 | +0,05 | +0,05 (+0,3) | +6 pe | – | −0,00 / +0,19  |
| Lågpress | 65 | 1,23–1,49 | +0,03 | +0,02 (+0,2) | −0 pe | – | −0,08 / +0,67  |
| Mellanpress | 90 | 1,70–1,29 | +0,11 | +0,11 (+0,8) | +4 pe | – | +0,20 / +0,01 ✔ |
| Högpress | 64 | 1,44–1,34 | −0,17 | −0,17 (−1,2) | +1 pe | – | −0,44 / −0,14 ✔ |
| Svag på fasta | 80 | 1,30–1,32 | −0,14 | −0,15 (−1,1) | +2 pe | – | −0,14 / −0,15 ✔ |
| Medel på fasta | 65 | 1,75–1,45 | +0,11 | +0,11 (+0,7) | −7 pe | – | +0,34 / −0,08  |
| Farlig på fasta | 74 | 1,45–1,34 | +0,07 | +0,06 (+0,4) | +9 pe | – | −0,07 / +0,22  |
| Stark mot fasta | 84 | 1,43–1,35 | +0,06 | +0,06 (+0,4) | +2 pe | – | +0,22 / −0,11  |
| Medel mot fasta | 88 | 1,50–1,32 | −0,02 | −0,03 (−0,2) | +2 pe | – | −0,17 / +0,07  |
| Svag mot fasta | 47 | 1,55–1,49 | −0,05 | −0,05 (−0,3) | +1 pe | – | −0,07 / −0,00 ✔ |

- Svårast mot **Högpress** (−0,17 p/match rel. eget snitt, z −1,2, 64 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,11 p/match rel. eget snitt, z +0,8, 90 m) – åt samma håll i båda halvorna men svagt

### GAIS

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 50,5 %). 45 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026 (22 m): 0,14 mål för (xG 0,29), 0,23 emot (xG 0,11), 5,00 hörnor · 2025 (30 m): 0,17 mål för (xG 0,44), 0,30 emot (xG 0,25), 6,07 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 15 | 1,47–0,80 | +0,09 | +0,11 (+0,4) | +7 pe | – | +0,09 / +0,14 ✔ |
| Balanserat | 16 | 1,19–1,06 | −0,28 | −0,26 (−1,0) | +17 pe | – | −0,53 / +0,02  |
| Bollinnehav | 14 | 1,21–1,36 | +0,14 | +0,17 (+0,5) | −11 pe | – | +0,86 / −0,52  |
| Kortpass | 25 | 1,24–1,12 | −0,00 | +0,03 (+0,1) | +6 pe | – | +0,44 / −0,25  |
| Blandat | 18 | 1,39–1,00 | −0,07 | −0,04 (−0,2) | +7 pe | – | −0,21 / +0,17  |
| Direktspel | 2 | 1,00–1,00 | +0,01 | +0,03 (+0,0) | −26 pe | – | +0,03 / –  |
| Lågpress | 10 | 0,70–1,50 | −0,53 | −0,50 (−1,6) | −6 pe | – | −0,10 / −0,67  |
| Mellanpress | 26 | 1,50–0,88 | +0,10 | +0,13 (+0,6) | +12 pe | – | +0,13 / +0,12 ✔ |
| Högpress | 9 | 1,33–1,11 | +0,16 | +0,19 (+0,4) | −5 pe | – | +0,16 / +0,29  |
| Svag på fasta | 8 | 1,75–1,13 | +0,49 | +0,51 (+1,3) | +23 pe | – | +0,20 / +1,47  |
| Medel på fasta | 27 | 1,33–1,00 | −0,04 | −0,01 (−0,1) | +0 pe | – | +0,19 / −0,23  |
| Farlig på fasta | 10 | 0,80–1,20 | −0,41 | −0,38 (−1,2) | +3 pe | – | −0,70 / −0,30  |
| Stark mot fasta | 11 | 1,82–0,91 | +0,25 | +0,27 (+0,7) | +1 pe | – | +0,62 / −0,14  |
| Medel mot fasta | 28 | 1,14–1,07 | −0,15 | −0,12 (−0,6) | +13 pe | – | −0,10 / −0,13 ✔ |
| Svag mot fasta | 6 | 1,00–1,33 | +0,02 | +0,05 (+0,1) | −26 pe | – | −0,01 / +0,17  |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −1,0, 16 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +0,6, 26 m) – åt samma håll i båda halvorna men svagt

### Goteborg

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,8 %). 219 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026 (22 m): 0,41 mål för (xG 0,41), 0,27 emot (xG 0,27), 7,18 hörnor · 2025 (30 m): 0,40 mål för (xG 0,44), 0,30 emot (xG 0,26), 6,37 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 1,06–1,33 | −0,15 | −0,04 (−0,3) | −4 pe | – | −0,11 / +0,03  |
| Balanserat | 75 | 1,29–1,55 | −0,04 | +0,07 (+0,5) | −2 pe | – | −0,05 / +0,23  |
| Bollinnehav | 65 | 1,35–1,45 | −0,15 | −0,04 (−0,2) | −2 pe | – | +0,03 / −0,09  |
| Kortpass | 55 | 1,13–1,42 | −0,06 | +0,05 (+0,3) | −7 pe | – | +0,34 / −0,01  |
| Blandat | 88 | 1,30–1,36 | −0,13 | −0,02 (−0,2) | +2 pe | – | −0,05 / +0,02  |
| Direktspel | 76 | 1,22–1,54 | −0,13 | −0,02 (−0,1) | −5 pe | – | −0,13 / +0,20  |
| Lågpress | 64 | 1,39–1,42 | +0,10 | +0,21 (+1,3) | −5 pe | – | +0,20 / +0,26 ✔ |
| Mellanpress | 87 | 1,10–1,41 | −0,21 | −0,09 (−0,8) | −1 pe | – | −0,23 / +0,04  |
| Högpress | 68 | 1,24–1,49 | −0,19 | −0,08 (−0,5) | −3 pe | – | −0,65 / +0,02  |
| Svag på fasta | 82 | 1,15–1,41 | −0,15 | −0,03 (−0,3) | −2 pe | – | +0,07 / −0,14  |
| Medel på fasta | 64 | 1,41–1,36 | −0,18 | −0,07 (−0,5) | −2 pe | – | −0,38 / +0,22  |
| Farlig på fasta | 73 | 1,16–1,53 | −0,01 | +0,10 (+0,7) | −5 pe | – | +0,09 / +0,11 ✔ |
| Stark mot fasta | 81 | 1,26–1,31 | −0,06 | +0,05 (+0,4) | −5 pe | – | +0,02 / +0,09 ✔ |
| Medel mot fasta | 87 | 1,18–1,49 | −0,10 | +0,01 (+0,1) | −4 pe | – | −0,03 / +0,04  |
| Svag mot fasta | 51 | 1,25–1,55 | −0,22 | −0,11 (−0,7) | +4 pe | – | −0,15 / −0,02 ✔ |

- Svårast mot **Mellanpress** (−0,09 p/match rel. eget snitt, z −0,8, 87 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,21 p/match rel. eget snitt, z +1,3, 64 m) – åt samma håll i båda halvorna men svagt

### Hacken

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 51,7 %). 219 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026 (22 m): 0,23 mål för (xG 0,34), 0,68 emot (xG 0,33), 5,59 hörnor · 2025 (30 m): 0,30 mål för (xG 0,28), 0,27 emot (xG 0,24), 5,57 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 1,68–1,37 | −0,13 | −0,12 (−0,9) | +6 pe | – | −0,21 / −0,06 ✔ |
| Balanserat | 78 | 1,68–1,01 | +0,14 | +0,15 (+1,1) | +3 pe | – | +0,02 / +0,33 ✔ |
| Bollinnehav | 65 | 1,66–1,52 | −0,04 | −0,03 (−0,2) | +5 pe | – | −0,04 / −0,02 ✔ |
| Kortpass | 53 | 1,64–1,53 | −0,01 | +0,00 (+0,0) | +1 pe | – | +0,25 / −0,06  |
| Blandat | 92 | 1,66–1,23 | −0,01 | −0,00 (−0,0) | +7 pe | – | −0,06 / +0,06  |
| Direktspel | 74 | 1,72–1,19 | −0,00 | +0,00 (+0,0) | +6 pe | – | −0,15 / +0,29  |
| Lågpress | 62 | 1,45–1,06 | −0,05 | −0,04 (−0,3) | +5 pe | – | −0,01 / −0,27 ✔ |
| Mellanpress | 83 | 1,61–1,25 | −0,06 | −0,05 (−0,4) | +6 pe | – | −0,24 / +0,19  |
| Högpress | 74 | 1,93–1,51 | +0,09 | +0,09 (+0,6) | +3 pe | – | +0,47 / +0,04 ✔ |
| Svag på fasta | 80 | 1,52–1,51 | −0,24 | −0,24 (−1,7) | +2 pe | – | −0,58 / +0,07  |
| Medel på fasta | 67 | 1,87–1,01 | +0,22 | +0,22 (+1,6) | +5 pe | – | +0,16 / +0,29 ✔ |
| Farlig på fasta | 72 | 1,67–1,29 | +0,05 | +0,06 (+0,4) | +8 pe | – | +0,24 / −0,14  |
| Stark mot fasta | 82 | 1,70–1,20 | +0,03 | +0,03 (+0,3) | −4 pe | – | +0,20 / −0,10  |
| Medel mot fasta | 88 | 1,73–1,45 | +0,04 | +0,04 (+0,3) | +6 pe | – | −0,19 / +0,23  |
| Svag mot fasta | 49 | 1,55–1,14 | −0,14 | −0,14 (−0,9) | +18 pe | – | −0,22 / +0,05  |

- Svårast mot **Svag på fasta** (−0,24 p/match rel. eget snitt, z −1,7, 80 m) – inte stabilt, troligen slump
- Bäst mot **Medel på fasta** (+0,22 p/match rel. eget snitt, z +1,6, 67 m) – åt samma håll i båda halvorna men svagt

### Halmstad

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 41,7 %). 69 matcher med stil, mot marknaden totalt +0,09 per match.

Fasta situationer per match: 2026 (22 m): 0,09 mål för (xG 0,25), 0,36 emot (xG 0,39), 4,27 hörnor · 2025 (30 m): 0,13 mål för (xG 0,31), 0,30 emot (xG 0,29), 3,60 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 0,86–1,59 | +0,13 | +0,05 (+0,2) | −6 pe | – | −0,42 / +0,37  |
| Balanserat | 25 | 0,84–1,56 | +0,19 | +0,10 (+0,4) | −7 pe | – | +0,52 / −0,35  |
| Bollinnehav | 22 | 0,86–2,18 | −0,07 | −0,16 (−0,7) | −4 pe | – | −0,01 / −0,34 ✔ |
| Kortpass | 37 | 0,78–2,11 | −0,14 | −0,23 (−1,4) | −4 pe | – | −0,06 / −0,34 ✔ |
| Blandat | 28 | 0,96–1,29 | +0,39 | +0,30 (+1,2) | −6 pe | – | +0,29 / +0,30 ✔ |
| Direktspel | 4 | 0,75–2,00 | +0,14 | +0,05 (+0,1) | −20 pe | – | −0,59 / +0,70  |
| Lågpress | 9 | 0,67–2,33 | −0,41 | −0,50 (−3,8) | +11 pe | – | −0,15 / −0,60  |
| Mellanpress | 27 | 1,11–1,74 | +0,20 | +0,11 (+0,4) | −6 pe | – | +0,12 / +0,10 ✔ |
| Högpress | 33 | 0,70–1,64 | +0,14 | +0,05 (+0,2) | −11 pe | – | +0,09 / −0,05  |
| Svag på fasta | 24 | 1,04–1,42 | +0,58 | +0,50 (+2,0) | −7 pe | – | +0,36 / +0,89 ✔ ⚑ |
| Medel på fasta | 29 | 0,83–1,97 | −0,04 | −0,12 (−0,5) | −6 pe | – | +0,16 / −0,28  |
| Farlig på fasta | 16 | 0,63–1,94 | −0,43 | −0,52 (−3,1) | −5 pe | – | −0,89 / −0,30 ✔ ⚑ |
| Stark mot fasta | 25 | 0,88–1,84 | +0,07 | −0,02 (−0,1) | −16 pe | – | −0,01 / −0,06 ✔ |
| Medel mot fasta | 38 | 0,84–1,74 | +0,11 | +0,03 (+0,1) | −2 pe | – | +0,19 / −0,08  |
| Svag mot fasta | 6 | 0,83–1,67 | +0,01 | −0,08 (−0,2) | +10 pe | – | +0,15 / −0,12  |

- Svårast mot **Farlig på fasta** (−0,52 p/match rel. eget snitt, z −3,1, 16 m) – ⚑ håller i båda halvorna
- Bäst mot **Svag på fasta** (+0,50 p/match rel. eget snitt, z +2,0, 24 m) – ⚑ håller i båda halvorna

### Hammarby

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 61,0 %). 219 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026 (22 m): 0,55 mål för (xG 0,49), 0,18 emot (xG 0,18), 6,59 hörnor · 2025 (30 m): 0,40 mål för (xG 0,30), 0,23 emot (xG 0,14), 6,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,62–1,17 | −0,03 | −0,12 (−0,9) | +1 pe | – | −0,14 / −0,10 ✔ |
| Balanserat | 76 | 1,66–1,21 | +0,11 | +0,03 (+0,2) | +3 pe | – | −0,13 / +0,24  |
| Bollinnehav | 61 | 2,10–1,21 | +0,20 | +0,12 (+0,8) | +1 pe | – | +0,22 / +0,03 ✔ |
| Kortpass | 53 | 1,98–1,11 | +0,21 | +0,12 (+0,7) | −7 pe | – | +0,43 / +0,04 ✔ |
| Blandat | 94 | 1,76–1,22 | +0,03 | −0,05 (−0,4) | +5 pe | – | −0,04 / −0,06 ✔ |
| Direktspel | 72 | 1,63–1,22 | +0,06 | −0,03 (−0,2) | +3 pe | – | −0,14 / +0,19  |
| Lågpress | 62 | 1,65–1,27 | +0,04 | −0,05 (−0,3) | −0 pe | – | −0,13 / +0,55  |
| Mellanpress | 88 | 1,95–1,24 | +0,11 | +0,03 (+0,2) | +7 pe | – | +0,08 / −0,03  |
| Högpress | 69 | 1,64–1,07 | +0,09 | +0,01 (+0,0) | −3 pe | – | −0,05 / +0,02  |
| Svag på fasta | 80 | 1,66–1,36 | +0,09 | +0,01 (+0,1) | +3 pe | – | −0,11 / +0,13  |
| Medel på fasta | 74 | 2,00–0,97 | +0,18 | +0,09 (+0,7) | +5 pe | – | −0,06 / +0,23  |
| Farlig på fasta | 65 | 1,63–1,25 | −0,04 | −0,12 (−0,8) | −4 pe | – | +0,07 / −0,32  |
| Stark mot fasta | 81 | 1,74–1,10 | +0,10 | +0,01 (+0,1) | +4 pe | – | −0,03 / +0,05  |
| Medel mot fasta | 92 | 1,75–1,24 | +0,11 | +0,03 (+0,3) | −3 pe | – | −0,03 / +0,08  |
| Svag mot fasta | 46 | 1,85–1,28 | −0,01 | −0,09 (−0,5) | +6 pe | – | −0,06 / −0,13 ✔ |

- Svårast mot **Backar hem** (−0,12 p/match rel. eget snitt, z −0,9, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,12 p/match rel. eget snitt, z +0,8, 61 m) – åt samma håll i båda halvorna men svagt

### Malmo FF

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 56,9 %). 219 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026 (22 m): 0,55 mål för (xG 0,32), 0,27 emot (xG 0,26), 4,86 hörnor · 2025 (30 m): 0,37 mål för (xG 0,31), 0,17 emot (xG 0,18), 6,40 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,71–0,93 | +0,00 | +0,04 (+0,3) | +0 pe | – | −0,07 / +0,14  |
| Balanserat | 76 | 1,84–1,03 | −0,07 | −0,03 (−0,2) | +5 pe | – | +0,07 / −0,15  |
| Bollinnehav | 60 | 2,13–1,20 | −0,05 | −0,01 (−0,1) | −4 pe | – | +0,14 / −0,15  |
| Kortpass | 51 | 1,94–1,20 | −0,01 | +0,02 (+0,1) | −7 pe | – | +0,03 / +0,02 ✔ |
| Blandat | 96 | 1,96–0,90 | +0,03 | +0,07 (+0,6) | +2 pe | – | +0,04 / +0,10 ✔ |
| Direktspel | 72 | 1,71–1,11 | −0,14 | −0,11 (−0,8) | +4 pe | – | +0,03 / −0,43  |
| Lågpress | 60 | 1,73–1,07 | −0,14 | −0,10 (−0,7) | +6 pe | – | −0,07 / −0,41 ✔ |
| Mellanpress | 89 | 1,88–0,93 | −0,04 | −0,01 (−0,1) | +2 pe | – | +0,11 / −0,15  |
| Högpress | 70 | 1,99–1,14 | +0,06 | +0,10 (+0,7) | −5 pe | – | +0,31 / +0,07 ✔ |
| Svag på fasta | 78 | 1,97–1,01 | −0,00 | +0,03 (+0,3) | +3 pe | – | +0,15 / −0,07  |
| Medel på fasta | 68 | 1,84–0,99 | −0,02 | +0,02 (+0,1) | +1 pe | – | +0,10 / −0,06  |
| Farlig på fasta | 73 | 1,79–1,11 | −0,09 | −0,05 (−0,4) | −2 pe | – | −0,12 / +0,02  |
| Stark mot fasta | 86 | 1,86–0,86 | −0,05 | −0,01 (−0,1) | +2 pe | – | −0,13 / +0,10  |
| Medel mot fasta | 82 | 1,96–1,09 | +0,03 | +0,06 (+0,5) | −4 pe | – | +0,22 / −0,06  |
| Svag mot fasta | 51 | 1,75–1,25 | −0,11 | −0,08 (−0,5) | +4 pe | – | +0,05 / −0,26  |

- Svårast mot **Direktspel** (−0,11 p/match rel. eget snitt, z −0,8, 72 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,7, 70 m) – åt samma håll i båda halvorna men svagt

### Mjallby

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 51,1 %). 147 matcher med stil, mot marknaden totalt +0,32 per match.

Fasta situationer per match: 2026 (22 m): 0,32 mål för (xG 0,39), 0,32 emot (xG 0,34), 4,59 hörnor · 2025 (30 m): 0,43 mål för (xG 0,47), 0,17 emot (xG 0,23), 5,60 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,49–0,78 | +0,35 | +0,03 (+0,2) | −6 pe | – | +0,04 / +0,02 ✔ |
| Balanserat | 50 | 1,08–1,30 | +0,14 | −0,18 (−1,2) | +2 pe | – | −0,42 / +0,04  |
| Bollinnehav | 46 | 1,57–1,15 | +0,48 | +0,16 (+0,9) | +3 pe | – | −0,04 / +0,38  |
| Kortpass | 53 | 1,51–1,21 | +0,24 | −0,08 (−0,5) | +7 pe | – | −0,11 / −0,06 ✔ |
| Blandat | 54 | 1,37–1,06 | +0,34 | +0,02 (+0,1) | −6 pe | – | −0,45 / +0,32  |
| Direktspel | 40 | 1,20–0,93 | +0,39 | +0,07 (+0,4) | −1 pe | – | +0,04 / +0,24 ✔ |
| Lågpress | 21 | 1,14–1,48 | −0,06 | −0,37 (−1,6) | +7 pe | – | −0,55 / −0,22 ✔ |
| Mellanpress | 54 | 1,41–1,00 | +0,20 | −0,12 (−0,7) | −2 pe | – | −0,34 / +0,11  |
| Högpress | 72 | 1,42–1,01 | +0,51 | +0,20 (+1,4) | −1 pe | – | +0,13 / +0,26 ✔ |
| Svag på fasta | 50 | 1,46–1,00 | +0,45 | +0,13 (+0,8) | −8 pe | – | +0,01 / +0,23 ✔ |
| Medel på fasta | 49 | 1,49–0,96 | +0,38 | +0,06 (+0,4) | +2 pe | – | −0,31 / +0,26  |
| Farlig på fasta | 48 | 1,17–1,27 | +0,12 | −0,20 (−1,1) | +7 pe | – | −0,14 / −0,35 ✔ |
| Stark mot fasta | 42 | 1,57–1,12 | +0,33 | +0,01 (+0,1) | −1 pe | – | −0,21 / +0,13  |
| Medel mot fasta | 73 | 1,32–1,03 | +0,36 | +0,04 (+0,3) | +0 pe | – | −0,04 / +0,12  |
| Svag mot fasta | 32 | 1,25–1,13 | +0,22 | −0,10 (−0,5) | +1 pe | – | −0,24 / +0,22  |

- Svårast mot **Lågpress** (−0,37 p/match rel. eget snitt, z −1,6, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,20 p/match rel. eget snitt, z +1,4, 72 m) – åt samma håll i båda halvorna men svagt

### Sirius

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 47,5 %). 219 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026 (22 m): 0,64 mål för (xG 0,43), 0,27 emot (xG 0,23), 5,59 hörnor · 2025 (30 m): 0,27 mål för (xG 0,41), 0,40 emot (xG 0,30), 5,43 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,54–1,61 | +0,08 | +0,03 (+0,2) | −3 pe | – | +0,03 / +0,03 ✔ |
| Balanserat | 83 | 1,39–1,99 | −0,06 | −0,11 (−0,8) | −9 pe | – | −0,05 / −0,19 ✔ |
| Bollinnehav | 53 | 1,43–1,49 | +0,17 | +0,12 (+0,7) | +2 pe | – | −0,26 / +0,37  |
| Kortpass | 51 | 1,86–1,31 | +0,36 | +0,31 (+1,7) | −5 pe | – | −0,09 / +0,38  |
| Blandat | 88 | 1,38–1,75 | −0,05 | −0,10 (−0,8) | −1 pe | – | −0,06 / −0,14 ✔ |
| Direktspel | 80 | 1,29–1,96 | −0,04 | −0,09 (−0,7) | −7 pe | – | −0,05 / −0,17 ✔ |
| Lågpress | 61 | 1,30–1,75 | +0,08 | +0,03 (+0,2) | −4 pe | – | −0,07 / +0,81  |
| Mellanpress | 89 | 1,48–1,84 | −0,05 | −0,10 (−0,8) | −1 pe | – | −0,16 / −0,04 ✔ |
| Högpress | 69 | 1,57–1,55 | +0,15 | +0,10 (+0,7) | −8 pe | – | +0,49 / +0,05 ✔ |
| Svag på fasta | 78 | 1,31–1,83 | −0,05 | −0,09 (−0,7) | −4 pe | – | −0,24 / +0,03  |
| Medel på fasta | 71 | 1,52–1,45 | +0,19 | +0,14 (+0,9) | −4 pe | – | +0,05 / +0,23 ✔ |
| Farlig på fasta | 70 | 1,56–1,89 | +0,01 | −0,04 (−0,3) | −4 pe | – | +0,01 / −0,10  |
| Stark mot fasta | 84 | 1,51–1,69 | +0,03 | −0,02 (−0,2) | −4 pe | – | +0,01 / −0,05  |
| Medel mot fasta | 86 | 1,50–1,81 | +0,08 | +0,03 (+0,2) | −6 pe | – | −0,16 / +0,14  |
| Svag mot fasta | 49 | 1,29–1,63 | +0,03 | −0,02 (−0,1) | −2 pe | – | −0,05 / +0,07  |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −0,8, 89 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,31 p/match rel. eget snitt, z +1,7, 51 m) – inte stabilt, troligen slump
