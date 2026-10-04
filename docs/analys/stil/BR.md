# Stilmatchning – Brasileirão Série A (BR)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2101 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 114 m · hemma +0,05 · kryss −4 pe · ö2,5 – | 182 m · hemma −0,01 · kryss +0 pe · ö2,5 – | 222 m · hemma +0,03 · kryss −4 pe · ö2,5 – |
| **Mellan** | 184 m · hemma −0,01 · kryss +0 pe · ö2,5 – | 271 m · hemma +0,14 · kryss +2 pe · ö2,5 – | 295 m · hemma +0,01 · kryss +2 pe · ö2,5 – |
| **Mycket boll** | 220 m · hemma +0,22 · kryss +1 pe · ö2,5 – | 299 m · hemma +0,08 · kryss −3 pe · ö2,5 – | 314 m · hemma +0,06 · kryss −1 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 178 m · hemma +0,10 · kryss −1 pe · ö2,5 – | 238 m · hemma −0,05 · kryss −1 pe · ö2,5 – | 216 m · hemma +0,12 · kryss −4 pe · ö2,5 – |
| **Balanserat** | 239 m · hemma +0,03 · kryss +3 pe · ö2,5 – | 330 m · hemma +0,11 · kryss −1 pe · ö2,5 – | 248 m · hemma −0,00 · kryss +3 pe · ö2,5 – |
| **Bollinnehav** | 217 m · hemma +0,11 · kryss −1 pe · ö2,5 – | 251 m · hemma +0,13 · kryss −2 pe · ö2,5 – | 184 m · hemma +0,05 · kryss −1 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 784 m · mot marknaden −0,04 (z −0,9) · mål 1,14 · ö2,5 – | 674 m · mot marknaden +0,05 (z +1,2) · mål 1,18 · ö2,5 – | 166 m · mot marknaden +0,11 (z +1,2) · mål 1,28 · ö2,5 – |
| **Medel på fasta** | 316 m · mot marknaden +0,06 (z +0,9) · mål 1,28 · ö2,5 – | 528 m · mot marknaden −0,02 (z −0,5) · mål 1,16 · ö2,5 – | 300 m · mot marknaden −0,00 (z −0,0) · mål 1,23 · ö2,5 – |
| **Farlig på fasta** | 220 m · mot marknaden +0,02 (z +0,2) · mål 1,21 · ö2,5 – | 482 m · mot marknaden −0,05 (z −0,9) · mål 1,19 · ö2,5 – | 382 m · mot marknaden −0,00 (z −0,0) · mål 1,19 · ö2,5 – |

## Lag (säsong 2026)

### Atletico-MG

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,0 %). 265 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026 (28 m): 0,29 mål för (xG 0,29), 0,25 emot (xG 0,24), 5,00 hörnor · 2025 (38 m): 0,50 mål för (xG 0,26), – emot (xG –), 5,87 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 85 | 1,44–1,29 | −0,17 | −0,15 (−1,1) | +2 pe | – | −0,15 / −0,15 ✔ |
| Balanserat | 103 | 1,34–0,98 | +0,06 | +0,08 (+0,7) | −6 pe | – | +0,12 / +0,05 ✔ |
| Bollinnehav | 77 | 1,30–1,09 | +0,02 | +0,05 (+0,3) | −2 pe | – | −0,05 / +0,14  |
| Kortpass | 69 | 1,43–1,19 | +0,04 | +0,06 (+0,4) | −2 pe | – | +0,06 / +0,07 ✔ |
| Blandat | 100 | 1,27–1,06 | −0,07 | −0,05 (−0,4) | −2 pe | – | −0,09 / −0,00 ✔ |
| Direktspel | 96 | 1,40–1,11 | −0,02 | +0,00 (+0,0) | −2 pe | – | +0,04 / −0,04  |
| Lågpress | 86 | 1,38–1,20 | −0,07 | −0,04 (−0,3) | −9 pe | – | −0,03 / −0,06 ✔ |
| Mellanpress | 102 | 1,37–1,22 | −0,05 | −0,02 (−0,2) | −5 pe | – | +0,01 / −0,05  |
| Högpress | 77 | 1,31–0,88 | +0,05 | +0,07 (+0,5) | +10 pe | – | +0,06 / +0,08 ✔ |
| Svag på fasta | 102 | 1,47–1,00 | +0,08 | +0,10 (+0,8) | −2 pe | – | +0,21 / −0,00  |
| Medel på fasta | 72 | 1,46–1,31 | −0,17 | −0,14 (−1,0) | +0 pe | – | −0,30 / +0,03  |
| Farlig på fasta | 77 | 1,22–1,08 | −0,02 | +0,01 (+0,0) | −1 pe | – | −0,02 / +0,04  |
| Stark mot fasta | 84 | 1,43–0,98 | −0,04 | −0,01 (−0,1) | −2 pe | – | −0,09 / +0,07  |
| Medel mot fasta | 110 | 1,19–1,22 | −0,13 | −0,11 (−0,9) | −3 pe | – | −0,03 / −0,17 ✔ |
| Svag mot fasta | 50 | 1,70–1,12 | +0,12 | +0,15 (+0,9) | +3 pe | – | +0,11 / +0,30 ✔ |

- Svårast mot **Backar hem** (−0,15 p/match rel. eget snitt, z −1,1, 85 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,15 p/match rel. eget snitt, z +0,9, 50 m) – åt samma håll i båda halvorna men svagt

### Bahia

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 54,6 %). 201 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026 (28 m): 0,32 mål för (xG 0,31), 0,14 emot (xG 0,20), 5,64 hörnor · 2025 (38 m): 0,26 mål för (xG 0,26), – emot (xG –), 4,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 61 | 1,30–1,23 | +0,00 | +0,03 (+0,2) | +9 pe | – | −0,06 / +0,10  |
| Balanserat | 71 | 1,25–1,32 | −0,07 | −0,04 (−0,3) | +2 pe | – | −0,14 / +0,07  |
| Bollinnehav | 69 | 1,07–1,36 | −0,01 | +0,02 (+0,1) | −11 pe | – | +0,07 / −0,03  |
| Kortpass | 55 | 1,00–1,20 | −0,05 | −0,03 (−0,2) | −4 pe | – | +0,01 / −0,04  |
| Blandat | 83 | 1,22–1,45 | −0,03 | −0,01 (−0,0) | −6 pe | – | −0,08 / +0,08  |
| Direktspel | 63 | 1,37–1,22 | −0,00 | +0,03 (+0,2) | +10 pe | – | −0,04 / +0,13  |
| Lågpress | 82 | 1,20–1,12 | +0,14 | +0,17 (+1,4) | +5 pe | – | +0,17 / +0,20 ✔ |
| Mellanpress | 73 | 1,18–1,47 | −0,29 | −0,26 (−2,0) | +1 pe | – | −0,27 / −0,25 ✔ ⚑ |
| Högpress | 46 | 1,26–1,39 | +0,07 | +0,10 (+0,5) | −12 pe | – | −0,82 / +0,26  |
| Svag på fasta | 56 | 0,86–1,45 | −0,37 | −0,34 (−2,4) | −2 pe | – | −0,22 / −0,47 ✔ ⚑ |
| Medel på fasta | 61 | 1,26–1,26 | +0,13 | +0,16 (+1,1) | −6 pe | – | +0,17 / +0,15 ✔ |
| Farlig på fasta | 70 | 1,37–1,29 | +0,02 | +0,05 (+0,3) | +1 pe | – | −0,10 / +0,23  |
| Stark mot fasta | 50 | 1,04–1,28 | −0,20 | −0,17 (−1,0) | −4 pe | – | −0,01 / −0,34 ✔ |
| Medel mot fasta | 82 | 1,26–1,45 | −0,07 | −0,04 (−0,3) | −1 pe | – | −0,12 / +0,03  |
| Svag mot fasta | 48 | 1,21–1,21 | +0,07 | +0,10 (+0,6) | −3 pe | – | −0,00 / +0,48  |

- Svårast mot **Svag på fasta** (−0,34 p/match rel. eget snitt, z −2,4, 56 m) – ⚑ håller i båda halvorna
- Bäst mot **Lågpress** (+0,17 p/match rel. eget snitt, z +1,4, 82 m) – åt samma håll i båda halvorna men svagt

### Botafogo RJ

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 46,9 %). 203 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026 (28 m): 0,36 mål för (xG 0,33), 0,39 emot (xG 0,29), 4,36 hörnor · 2025 (38 m): 0,21 mål för (xG 0,21), – emot (xG –), 4,84 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 62 | 1,21–1,10 | +0,01 | −0,07 (−0,4) | +0 pe | – | −0,18 / +0,02  |
| Balanserat | 77 | 1,16–1,27 | +0,03 | −0,05 (−0,4) | +8 pe | – | −0,07 / −0,03 ✔ |
| Bollinnehav | 64 | 1,17–1,23 | +0,21 | +0,13 (+0,9) | −12 pe | – | +0,01 / +0,23 ✔ |
| Kortpass | 54 | 1,20–1,17 | +0,26 | +0,19 (+1,2) | −2 pe | – | +0,13 / +0,21 ✔ |
| Blandat | 85 | 1,12–1,28 | −0,04 | −0,12 (−0,9) | −1 pe | – | −0,14 / −0,08 ✔ |
| Direktspel | 64 | 1,23–1,14 | +0,07 | −0,00 (−0,0) | +0 pe | – | −0,08 / +0,11  |
| Lågpress | 73 | 1,14–1,36 | +0,08 | +0,01 (+0,0) | −7 pe | – | −0,09 / +0,33  |
| Mellanpress | 74 | 1,08–1,20 | −0,02 | −0,09 (−0,8) | +8 pe | – | −0,30 / +0,08  |
| Högpress | 56 | 1,36–1,02 | +0,19 | +0,11 (+0,6) | −5 pe | – | +0,69 / −0,03  |
| Svag på fasta | 54 | 1,20–1,15 | +0,18 | +0,11 (+0,6) | −6 pe | – | +0,16 / +0,04 ✔ |
| Medel på fasta | 63 | 1,00–1,16 | −0,02 | −0,09 (−0,7) | +1 pe | – | −0,18 / −0,01 ✔ |
| Farlig på fasta | 72 | 1,29–1,21 | +0,10 | +0,02 (+0,2) | −1 pe | – | −0,18 / +0,28  |
| Stark mot fasta | 44 | 1,30–0,91 | +0,31 | +0,23 (+1,2) | +4 pe | – | +0,28 / +0,16 ✔ |
| Medel mot fasta | 82 | 1,20–1,24 | +0,03 | −0,05 (−0,4) | −2 pe | – | −0,15 / +0,02  |
| Svag mot fasta | 54 | 0,98–1,30 | −0,07 | −0,14 (−0,9) | −5 pe | – | −0,23 / +0,15  |

- Svårast mot **Blandat** (−0,12 p/match rel. eget snitt, z −0,9, 85 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,23 p/match rel. eget snitt, z +1,2, 44 m) – åt samma håll i båda halvorna men svagt

### Bragantino

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,8 %). 171 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026 (28 m): 0,36 mål för (xG 0,31), 0,29 emot (xG 0,21), 5,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,34–1,11 | +0,05 | +0,10 (+0,6) | +6 pe | – | +0,47 / −0,29  |
| Balanserat | 61 | 1,21–1,43 | −0,03 | +0,02 (+0,1) | −3 pe | – | +0,16 / −0,14  |
| Bollinnehav | 57 | 1,16–1,37 | −0,16 | −0,11 (−0,7) | −5 pe | – | −0,13 / −0,09 ✔ |
| Kortpass | 56 | 1,20–1,30 | −0,10 | −0,05 (−0,3) | −5 pe | – | −0,08 / −0,03 ✔ |
| Blandat | 66 | 1,23–1,38 | −0,07 | −0,02 (−0,1) | +2 pe | – | +0,10 / −0,11  |
| Direktspel | 49 | 1,29–1,22 | +0,03 | +0,08 (+0,4) | −1 pe | – | +0,38 / −0,62  |
| Lågpress | 29 | 1,03–1,41 | −0,25 | −0,20 (−0,9) | −8 pe | – | +0,18 / −0,40  |
| Mellanpress | 73 | 1,22–1,36 | −0,12 | −0,07 (−0,5) | −2 pe | – | −0,15 / +0,00  |
| Högpress | 69 | 1,33–1,22 | +0,11 | +0,16 (+1,2) | +3 pe | – | +0,43 / −0,24  |
| Svag på fasta | 86 | 1,34–1,24 | +0,06 | +0,11 (+0,9) | +2 pe | – | +0,20 / −0,36  |
| Medel på fasta | 40 | 1,15–1,45 | −0,29 | −0,24 (−1,4) | +7 pe | – | −0,17 / −0,27 ✔ |
| Farlig på fasta | 33 | 1,09–1,33 | −0,01 | +0,04 (+0,2) | −16 pe | – | +0,31 / +0,00  |
| Stark mot fasta | 66 | 1,27–1,12 | −0,09 | −0,04 (−0,3) | +2 pe | – | +0,09 / −0,52  |
| Medel mot fasta | 70 | 1,23–1,43 | +0,08 | +0,13 (+0,9) | −1 pe | – | +0,34 / −0,04  |
| Svag mot fasta | 14 | 1,21–1,71 | −0,32 | −0,27 (−0,9) | +0 pe | – | −0,42 / −0,25  |

- Svårast mot **Medel på fasta** (−0,24 p/match rel. eget snitt, z −1,4, 40 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,16 p/match rel. eget snitt, z +1,2, 69 m) – inte stabilt, troligen slump

### Corinthians

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 54,0 %). 261 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026 (28 m): 0,25 mål för (xG 0,33), 0,21 emot (xG 0,15), 4,96 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,02–1,13 | −0,17 | −0,13 (−1,1) | +6 pe | – | −0,04 / −0,21 ✔ |
| Balanserat | 99 | 1,09–1,13 | +0,09 | +0,13 (+1,1) | −4 pe | – | +0,06 / +0,21 ✔ |
| Bollinnehav | 79 | 0,99–1,05 | −0,07 | −0,03 (−0,3) | +7 pe | – | −0,01 / −0,05 ✔ |
| Kortpass | 67 | 1,13–1,10 | −0,03 | +0,01 (+0,1) | +4 pe | – | +0,12 / −0,05  |
| Blandat | 99 | 1,05–1,13 | +0,02 | +0,07 (+0,6) | +3 pe | – | −0,10 / +0,23  |
| Direktspel | 95 | 0,96–1,08 | −0,12 | −0,08 (−0,7) | +1 pe | – | +0,05 / −0,25  |
| Lågpress | 80 | 0,85–1,02 | −0,11 | −0,07 (−0,6) | +1 pe | – | −0,05 / −0,14 ✔ |
| Mellanpress | 101 | 1,17–1,15 | +0,02 | +0,06 (+0,6) | +7 pe | – | +0,20 / −0,07  |
| Högpress | 80 | 1,06–1,14 | −0,06 | −0,01 (−0,1) | −2 pe | – | −0,38 / +0,08  |
| Svag på fasta | 100 | 0,95–1,03 | +0,03 | +0,07 (+0,6) | +2 pe | – | +0,05 / +0,09 ✔ |
| Medel på fasta | 73 | 1,04–1,21 | −0,13 | −0,08 (−0,7) | −2 pe | – | +0,02 / −0,17  |
| Farlig på fasta | 76 | 1,12–1,09 | −0,05 | −0,01 (−0,1) | +9 pe | – | −0,06 / +0,06  |
| Stark mot fasta | 82 | 0,96–1,15 | −0,09 | −0,04 (−0,3) | −1 pe | – | +0,06 / −0,14  |
| Medel mot fasta | 108 | 1,06–1,07 | +0,06 | +0,11 (+1,0) | +5 pe | – | +0,08 / +0,13 ✔ |
| Svag mot fasta | 50 | 1,08–1,06 | −0,13 | −0,09 (−0,6) | +5 pe | – | −0,15 / +0,11  |

- Svårast mot **Backar hem** (−0,13 p/match rel. eget snitt, z −1,1, 83 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,13 p/match rel. eget snitt, z +1,1, 99 m) – åt samma håll i båda halvorna men svagt

### Cruzeiro

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 55,0 %). 142 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026 (28 m): 0,18 mål för (xG 0,23), 0,36 emot (xG 0,23), 5,14 hörnor · 2025 (38 m): 0,42 mål för (xG 0,30), – emot (xG –), 5,82 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,34–0,84 | +0,29 | +0,35 (+2,0) | −2 pe | – | +0,20 / +0,46 ✔ |
| Balanserat | 56 | 0,89–1,18 | −0,23 | −0,16 (−1,1) | +6 pe | – | −0,24 / −0,05 ✔ |
| Bollinnehav | 48 | 1,02–1,17 | −0,15 | −0,09 (−0,5) | +3 pe | – | −0,38 / +0,14  |
| Kortpass | 37 | 1,38–1,08 | +0,17 | +0,24 (+1,2) | −4 pe | – | +0,75 / +0,11 ✔ |
| Blandat | 62 | 0,89–1,23 | −0,27 | −0,20 (−1,4) | +3 pe | – | −0,47 / +0,13  |
| Direktspel | 43 | 1,02–0,88 | +0,02 | +0,09 (+0,5) | +7 pe | – | −0,07 / +0,46  |
| Lågpress | 65 | 0,86–1,12 | −0,17 | −0,11 (−0,8) | +1 pe | – | −0,22 / +0,20  |
| Mellanpress | 47 | 1,17–1,04 | −0,04 | +0,03 (+0,2) | +1 pe | – | −0,15 / +0,14  |
| Högpress | 30 | 1,30–1,07 | +0,13 | +0,19 (+1,0) | +9 pe | – | +0,03 / +0,22 ✔ |
| Svag på fasta | 18 | 0,72–0,83 | −0,10 | −0,03 (−0,1) | −2 pe | – | +0,22 / −0,55  |
| Medel på fasta | 49 | 1,00–0,96 | +0,06 | +0,13 (+0,8) | +2 pe | – | −0,02 / +0,28  |
| Farlig på fasta | 62 | 1,10–1,24 | −0,25 | −0,18 (−1,3) | +6 pe | – | −0,44 / +0,14  |
| Stark mot fasta | 22 | 1,27–1,00 | −0,00 | +0,06 (+0,2) | −1 pe | – | +0,14 / −0,05  |
| Medel mot fasta | 60 | 0,90–1,05 | −0,11 | −0,04 (−0,3) | +3 pe | – | −0,28 / +0,21  |
| Svag mot fasta | 38 | 0,92–0,92 | −0,10 | −0,03 (−0,2) | +5 pe | – | −0,23 / +0,45  |

- Svårast mot **Blandat** (−0,20 p/match rel. eget snitt, z −1,4, 62 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,35 p/match rel. eget snitt, z +2,0, 38 m) – åt samma håll i båda halvorna men svagt

### Flamengo RJ

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 57,3 %). 263 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (28 m): 0,25 mål för (xG 0,23), 0,14 emot (xG 0,14), 5,25 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 84 | 1,71–1,08 | +0,03 | −0,02 (−0,1) | −2 pe | – | +0,01 / −0,04  |
| Balanserat | 98 | 1,64–1,03 | +0,03 | −0,01 (−0,1) | −3 pe | – | +0,01 / −0,03  |
| Bollinnehav | 81 | 1,84–0,94 | +0,08 | +0,03 (+0,2) | −2 pe | – | +0,09 / −0,03  |
| Kortpass | 69 | 1,67–1,04 | −0,17 | −0,22 (−1,4) | −1 pe | – | −0,15 / −0,27 ✔ |
| Blandat | 99 | 1,86–1,02 | +0,17 | +0,12 (+1,0) | −3 pe | – | +0,12 / +0,13 ✔ |
| Direktspel | 95 | 1,63–1,00 | +0,07 | +0,03 (+0,2) | −3 pe | – | +0,05 / +0,00 ✔ |
| Lågpress | 87 | 1,72–0,83 | +0,17 | +0,13 (+1,1) | +3 pe | – | +0,22 / −0,17  |
| Mellanpress | 101 | 1,78–1,14 | −0,10 | −0,15 (−1,1) | −7 pe | – | −0,08 / −0,21 ✔ |
| Högpress | 75 | 1,65–1,08 | +0,09 | +0,05 (+0,4) | −3 pe | – | −0,37 / +0,17  |
| Svag på fasta | 100 | 1,60–1,05 | −0,06 | −0,10 (−0,8) | −2 pe | – | −0,05 / −0,16 ✔ |
| Medel på fasta | 75 | 1,93–1,00 | +0,20 | +0,16 (+1,2) | −5 pe | – | +0,25 / +0,06 ✔ |
| Farlig på fasta | 75 | 1,73–0,99 | +0,04 | −0,01 (−0,1) | −2 pe | – | −0,06 / +0,05  |
| Stark mot fasta | 88 | 1,56–1,01 | +0,07 | +0,02 (+0,2) | −0 pe | – | +0,21 / −0,15  |
| Medel mot fasta | 98 | 1,86–1,05 | +0,01 | −0,03 (−0,3) | −4 pe | – | −0,28 / +0,17  |
| Svag mot fasta | 54 | 1,70–1,00 | +0,06 | +0,02 (+0,1) | −5 pe | – | +0,18 / −0,68  |

- Svårast mot **Kortpass** (−0,22 p/match rel. eget snitt, z −1,4, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,16 p/match rel. eget snitt, z +1,2, 75 m) – åt samma håll i båda halvorna men svagt

### Fluminense

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 58,0 %). 262 matcher med stil, mot marknaden totalt +0,18 per match.

Fasta situationer per match: 2026 (28 m): 0,36 mål för (xG 0,29), 0,46 emot (xG 0,27), 5,54 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 84 | 1,31–1,08 | +0,28 | +0,10 (+0,8) | −3 pe | – | +0,16 / +0,05 ✔ |
| Balanserat | 100 | 1,00–1,15 | +0,12 | −0,06 (−0,5) | −9 pe | – | −0,14 / +0,04  |
| Bollinnehav | 78 | 1,35–1,18 | +0,14 | −0,04 (−0,3) | −2 pe | – | +0,06 / −0,13  |
| Kortpass | 59 | 1,02–1,03 | +0,04 | −0,14 (−0,9) | −0 pe | – | −0,21 / −0,09 ✔ |
| Blandat | 109 | 1,25–1,21 | +0,14 | −0,04 (−0,3) | −4 pe | – | +0,02 / −0,10  |
| Direktspel | 94 | 1,27–1,12 | +0,31 | +0,13 (+1,0) | −10 pe | – | +0,10 / +0,17 ✔ |
| Lågpress | 84 | 1,20–1,29 | +0,18 | −0,00 (−0,0) | −4 pe | – | −0,05 / +0,18  |
| Mellanpress | 102 | 1,20–1,00 | +0,21 | +0,03 (+0,2) | −8 pe | – | +0,13 / −0,06  |
| Högpress | 76 | 1,21–1,16 | +0,14 | −0,04 (−0,3) | −3 pe | – | −0,09 / −0,02 ✔ |
| Svag på fasta | 104 | 1,16–1,16 | +0,01 | −0,17 (−1,4) | −1 pe | – | −0,20 / −0,14 ✔ |
| Medel på fasta | 72 | 1,26–1,15 | +0,32 | +0,14 (+1,0) | −7 pe | – | +0,26 / +0,03 ✔ |
| Farlig på fasta | 76 | 1,12–1,05 | +0,27 | +0,09 (+0,7) | −10 pe | – | +0,08 / +0,11 ✔ |
| Stark mot fasta | 82 | 1,09–1,06 | −0,01 | −0,19 (−1,4) | −2 pe | – | −0,37 / −0,01 ✔ |
| Medel mot fasta | 108 | 1,21–1,16 | +0,29 | +0,11 (+0,9) | −10 pe | – | +0,15 / +0,08 ✔ |
| Svag mot fasta | 50 | 1,28–1,16 | +0,30 | +0,12 (+0,7) | −4 pe | – | +0,22 / −0,21  |

- Svårast mot **Stark mot fasta** (−0,19 p/match rel. eget snitt, z −1,4, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,13 p/match rel. eget snitt, z +1,0, 94 m) – åt samma håll i båda halvorna men svagt

### Gremio

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,6 %). 203 matcher med stil, mot marknaden totalt −0,07 per match.

Fasta situationer per match: 2026 (28 m): 0,32 mål för (xG 0,23), 0,21 emot (xG 0,22), 4,11 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 59 | 1,46–0,92 | +0,19 | +0,26 (+1,9) | +1 pe | – | +0,26 / +0,26 ✔ |
| Balanserat | 76 | 1,08–1,18 | −0,27 | −0,20 (−1,4) | +2 pe | – | −0,20 / −0,20 ✔ |
| Bollinnehav | 68 | 1,35–1,43 | −0,08 | −0,00 (−0,0) | −9 pe | – | −0,01 / +0,00  |
| Kortpass | 53 | 1,25–1,38 | −0,08 | −0,00 (−0,0) | −6 pe | – | +0,05 / −0,03  |
| Blandat | 82 | 1,41–1,27 | −0,01 | +0,06 (+0,4) | −6 pe | – | −0,01 / +0,12  |
| Direktspel | 68 | 1,15–0,94 | −0,14 | −0,07 (−0,5) | +6 pe | – | −0,04 / −0,11 ✔ |
| Lågpress | 80 | 1,44–1,07 | +0,02 | +0,09 (+0,6) | +0 pe | – | +0,06 / +0,18 ✔ |
| Mellanpress | 78 | 1,22–1,27 | −0,19 | −0,11 (−0,9) | −4 pe | – | −0,11 / −0,12 ✔ |
| Högpress | 45 | 1,11–1,24 | −0,03 | +0,04 (+0,2) | −3 pe | – | −0,12 / +0,06  |
| Svag på fasta | 54 | 1,24–1,22 | −0,31 | −0,24 (−1,4) | −8 pe | – | −0,09 / −0,40 ✔ |
| Medel på fasta | 63 | 1,37–1,11 | +0,14 | +0,21 (+1,4) | +1 pe | – | +0,22 / +0,20 ✔ |
| Farlig på fasta | 74 | 1,30–1,22 | −0,06 | +0,01 (+0,1) | +1 pe | – | −0,15 / +0,20  |
| Stark mot fasta | 50 | 1,56–1,16 | −0,00 | +0,07 (+0,4) | −6 pe | – | +0,16 / −0,04  |
| Medel mot fasta | 78 | 1,15–1,32 | −0,21 | −0,14 (−1,1) | −5 pe | – | −0,31 / −0,01 ✔ |
| Svag mot fasta | 52 | 1,29–0,85 | +0,15 | +0,22 (+1,3) | +7 pe | – | +0,12 / +0,55 ✔ |

- Svårast mot **Svag på fasta** (−0,24 p/match rel. eget snitt, z −1,4, 54 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,26 p/match rel. eget snitt, z +1,9, 59 m) – åt samma håll i båda halvorna men svagt

### Internacional

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 48,2 %). 231 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (28 m): 0,18 mål för (xG 0,41), 0,25 emot (xG 0,16), 6,04 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 75 | 1,08–0,92 | +0,06 | +0,08 (+0,6) | −2 pe | – | +0,33 / −0,12  |
| Balanserat | 77 | 1,40–1,22 | +0,08 | +0,10 (+0,7) | +3 pe | – | +0,18 / +0,01 ✔ |
| Bollinnehav | 79 | 1,18–1,20 | −0,20 | −0,17 (−1,4) | +4 pe | – | −0,18 / −0,17 ✔ |
| Kortpass | 61 | 1,31–1,07 | +0,00 | +0,03 (+0,2) | +2 pe | – | +0,38 / −0,23  |
| Blandat | 92 | 1,29–1,21 | −0,07 | −0,05 (−0,4) | +3 pe | – | +0,02 / −0,13  |
| Direktspel | 78 | 1,06–1,05 | +0,01 | +0,04 (+0,3) | −0 pe | – | +0,01 / +0,07 ✔ |
| Lågpress | 54 | 1,02–1,00 | −0,12 | −0,09 (−0,6) | +1 pe | – | −0,05 / −0,17 ✔ |
| Mellanpress | 99 | 1,35–1,23 | +0,00 | +0,03 (+0,2) | +2 pe | – | +0,28 / −0,25  |
| Högpress | 78 | 1,19–1,05 | +0,00 | +0,03 (+0,2) | +3 pe | – | −0,05 / +0,07  |
| Svag på fasta | 98 | 1,17–1,05 | −0,01 | +0,01 (+0,1) | +3 pe | – | +0,06 / −0,08  |
| Medel på fasta | 65 | 1,18–1,03 | +0,01 | +0,03 (+0,2) | +2 pe | – | +0,21 / −0,09  |
| Farlig på fasta | 57 | 1,39–1,32 | −0,07 | −0,04 (−0,3) | −2 pe | – | +0,08 / −0,13  |
| Stark mot fasta | 86 | 1,27–0,98 | +0,10 | +0,13 (+1,0) | +0 pe | – | +0,08 / +0,18 ✔ |
| Medel mot fasta | 88 | 1,28–1,20 | −0,04 | −0,01 (−0,1) | +1 pe | – | +0,13 / −0,14  |
| Svag mot fasta | 36 | 1,06–1,11 | −0,06 | −0,04 (−0,2) | +5 pe | – | +0,08 / −0,27  |

- Svårast mot **Bollinnehav** (−0,17 p/match rel. eget snitt, z −1,4, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,13 p/match rel. eget snitt, z +1,0, 86 m) – åt samma håll i båda halvorna men svagt

### Mirassol

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,5 %). 22 matcher med stil, mot marknaden totalt −0,17 per match.

Fasta situationer per match: 2026 (28 m): 0,32 mål för (xG 0,34), 0,18 emot (xG 0,25), 5,43 hörnor · 2025 (38 m): 0,40 mål för (xG 0,39), – emot (xG –), 5,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 7 | 1,14–1,57 | −0,43 | −0,26 (−0,9) | +15 pe | – | −0,69 / +0,05  |
| Balanserat | 8 | 1,25–1,13 | +0,06 | +0,22 (+0,5) | −3 pe | – | −0,37 / +1,20  |
| Bollinnehav | 7 | 1,14–2,14 | −0,15 | +0,01 (+0,0) | −12 pe | – | +0,59 / −0,42  |
| Kortpass | 11 | 1,09–1,73 | −0,07 | +0,09 (+0,3) | +1 pe | – | +0,13 / +0,06 ✔ |
| Blandat | 9 | 1,44–1,56 | −0,22 | −0,05 (−0,1) | −6 pe | – | −0,43 / +0,42  |
| Direktspel | 2 | 0,50–1,00 | −0,45 | −0,28 (−1,2) | +24 pe | – | −0,63 / +0,06  |
| Lågpress | 10 | 1,50–1,30 | +0,36 | +0,52 (+1,5) | −9 pe | – | +0,20 / +0,85 ✔ |
| Mellanpress | 8 | 0,75–2,13 | −0,86 | −0,69 (−4,5) | −1 pe | – | −1,05 / −0,48  |
| Högpress | 4 | 1,25–1,25 | −0,08 | +0,08 (+0,1) | +23 pe | – | +0,02 / +0,29  |
| Medel på fasta | 3 | 1,67–1,67 | −0,46 | −0,30 (−0,4) | −28 pe | – | −1,22 / +1,54  |
| Farlig på fasta | 7 | 1,14–1,71 | −0,28 | −0,12 (−0,4) | +15 pe | – | +0,15 / −0,32  |

### Palmeiras

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 52,9 %). 264 matcher med stil, mot marknaden totalt +0,09 per match.

Fasta situationer per match: 2026 (28 m): 0,36 mål för (xG 0,31), 0,04 emot (xG 0,15), 6,04 hörnor · 2025 (38 m): 0,37 mål för (xG 0,39), – emot (xG –), 5,95 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,80–0,90 | +0,25 | +0,16 (+1,2) | −3 pe | – | +0,12 / +0,20 ✔ |
| Balanserat | 108 | 1,44–0,88 | +0,04 | −0,06 (−0,5) | +0 pe | – | −0,15 / +0,05  |
| Bollinnehav | 87 | 1,41–0,86 | +0,03 | −0,06 (−0,5) | +3 pe | – | −0,06 / −0,06 ✔ |
| Kortpass | 75 | 1,27–0,89 | −0,10 | −0,19 (−1,3) | +5 pe | – | −0,09 / −0,25 ✔ |
| Blandat | 109 | 1,50–0,89 | +0,14 | +0,04 (+0,4) | +1 pe | – | −0,05 / +0,14  |
| Direktspel | 80 | 1,81–0,85 | +0,21 | +0,12 (+0,9) | −4 pe | – | −0,04 / +0,36  |
| Lågpress | 82 | 1,57–0,82 | +0,15 | +0,06 (+0,4) | −1 pe | – | +0,04 / +0,12 ✔ |
| Mellanpress | 102 | 1,47–0,92 | +0,03 | −0,07 (−0,5) | +1 pe | – | −0,08 / −0,05 ✔ |
| Högpress | 80 | 1,55–0,89 | +0,12 | +0,03 (+0,2) | +2 pe | – | −0,28 / +0,13  |
| Svag på fasta | 102 | 1,46–0,83 | +0,13 | +0,04 (+0,3) | +1 pe | – | +0,07 / +0,00 ✔ |
| Medel på fasta | 75 | 1,41–1,03 | −0,14 | −0,23 (−1,6) | +3 pe | – | −0,39 / −0,07 ✔ |
| Farlig på fasta | 73 | 1,67–0,85 | +0,20 | +0,11 (+0,8) | −2 pe | – | +0,09 / +0,12 ✔ |
| Stark mot fasta | 80 | 1,60–0,84 | +0,15 | +0,06 (+0,4) | −2 pe | – | +0,05 / +0,06 ✔ |
| Medel mot fasta | 104 | 1,38–0,92 | +0,07 | −0,02 (−0,2) | +3 pe | – | −0,19 / +0,13  |
| Svag mot fasta | 56 | 1,61–0,89 | −0,01 | −0,11 (−0,7) | −2 pe | – | −0,00 / −0,49 ✔ |

- Svårast mot **Medel på fasta** (−0,23 p/match rel. eget snitt, z −1,6, 75 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,16 p/match rel. eget snitt, z +1,2, 69 m) – åt samma håll i båda halvorna men svagt

### Santos

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 49,9 %). 200 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026 (28 m): 0,29 mål för (xG 0,31), 0,18 emot (xG 0,23), 5,39 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 61 | 1,20–1,34 | −0,05 | −0,14 (−0,9) | +6 pe | – | −0,23 / −0,04 ✔ |
| Balanserat | 82 | 1,21–1,18 | +0,05 | −0,04 (−0,3) | +4 pe | – | +0,11 / −0,17  |
| Bollinnehav | 57 | 1,16–1,11 | +0,28 | +0,20 (+1,3) | +0 pe | – | +0,19 / +0,21 ✔ |
| Kortpass | 45 | 1,16–1,36 | −0,01 | −0,09 (−0,5) | +12 pe | – | −0,01 / −0,15 ✔ |
| Blandat | 76 | 1,17–1,18 | +0,08 | −0,00 (−0,0) | −0 pe | – | −0,05 / +0,06  |
| Direktspel | 79 | 1,23–1,15 | +0,14 | +0,05 (+0,4) | +2 pe | – | +0,12 / −0,01  |
| Lågpress | 76 | 1,18–1,07 | +0,05 | −0,03 (−0,3) | +3 pe | – | −0,13 / +0,31  |
| Mellanpress | 71 | 1,24–1,21 | +0,18 | +0,09 (+0,7) | +4 pe | – | +0,29 / −0,12  |
| Högpress | 53 | 1,13–1,42 | +0,01 | −0,08 (−0,5) | +4 pe | – | −0,06 / −0,08  |
| Svag på fasta | 92 | 1,12–1,26 | +0,08 | −0,01 (−0,1) | +4 pe | – | +0,26 / −0,11  |
| Medel på fasta | 48 | 1,21–1,23 | −0,00 | −0,09 (−0,5) | +8 pe | – | −0,06 / −0,16 ✔ |
| Farlig på fasta | 50 | 1,20–1,02 | +0,18 | +0,10 (+0,6) | +0 pe | – | −0,05 / +0,77  |
| Stark mot fasta | 70 | 1,01–1,11 | −0,05 | −0,14 (−1,0) | +3 pe | – | +0,10 / −0,26  |
| Medel mot fasta | 68 | 1,21–1,29 | +0,20 | +0,11 (+0,8) | +8 pe | – | +0,06 / +0,18 ✔ |
| Svag mot fasta | 42 | 1,26–1,19 | +0,03 | −0,06 (−0,3) | −4 pe | – | −0,04 / −0,63  |

- Svårast mot **Stark mot fasta** (−0,14 p/match rel. eget snitt, z −1,0, 70 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,20 p/match rel. eget snitt, z +1,3, 57 m) – åt samma håll i båda halvorna men svagt

### Sao Paulo

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 53,8 %). 261 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026 (28 m): 0,21 mål för (xG 0,24), 0,39 emot (xG 0,24), 6,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 82 | 1,12–1,15 | −0,19 | −0,20 (−1,6) | −5 pe | – | −0,04 / −0,35 ✔ |
| Balanserat | 105 | 1,36–1,06 | +0,14 | +0,13 (+1,2) | +6 pe | – | +0,20 / +0,07 ✔ |
| Bollinnehav | 74 | 1,05–1,03 | +0,05 | +0,04 (+0,3) | −2 pe | – | −0,15 / +0,24  |
| Kortpass | 67 | 1,24–1,03 | +0,15 | +0,13 (+0,9) | −7 pe | – | +0,33 / +0,02 ✔ |
| Blandat | 102 | 1,15–1,26 | −0,14 | −0,15 (−1,2) | +1 pe | – | −0,23 / −0,06 ✔ |
| Direktspel | 92 | 1,23–0,90 | +0,08 | +0,07 (+0,6) | +5 pe | – | +0,13 / −0,03  |
| Lågpress | 77 | 1,18–1,00 | +0,03 | +0,02 (+0,2) | +1 pe | – | +0,03 / +0,00 ✔ |
| Mellanpress | 100 | 1,23–1,10 | −0,11 | −0,12 (−1,1) | +7 pe | – | +0,04 / −0,27  |
| Högpress | 84 | 1,18–1,12 | +0,14 | +0,13 (+1,0) | −8 pe | – | −0,02 / +0,17  |
| Svag på fasta | 98 | 1,05–1,10 | −0,11 | −0,13 (−1,1) | +6 pe | – | −0,06 / −0,20 ✔ |
| Medel på fasta | 74 | 1,26–1,07 | +0,05 | +0,04 (+0,3) | −3 pe | – | +0,10 / −0,03  |
| Farlig på fasta | 77 | 1,31–1,03 | +0,09 | +0,08 (+0,6) | −2 pe | – | +0,05 / +0,13 ✔ |
| Stark mot fasta | 84 | 1,08–0,87 | −0,08 | −0,09 (−0,8) | +6 pe | – | −0,07 / −0,12 ✔ |
| Medel mot fasta | 102 | 1,20–1,33 | −0,06 | −0,07 (−0,6) | +0 pe | – | −0,23 / +0,05  |
| Svag mot fasta | 54 | 1,35–0,87 | +0,27 | +0,25 (+1,6) | −5 pe | – | +0,38 / −0,19  |

- Svårast mot **Backar hem** (−0,20 p/match rel. eget snitt, z −1,6, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,25 p/match rel. eget snitt, z +1,6, 54 m) – inte stabilt, troligen slump

### Vasco

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 53,8 %). 172 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (27 m): 0,26 mål för (xG 0,35), 0,33 emot (xG 0,22), 5,70 hörnor · 2025 (38 m): 0,32 mål för (xG 0,25), – emot (xG –), 4,21 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,25–1,36 | +0,22 | +0,25 (+1,5) | −11 pe | – | +0,20 / +0,28 ✔ |
| Balanserat | 62 | 0,95–1,61 | −0,16 | −0,13 (−0,9) | −1 pe | – | −0,08 / −0,21 ✔ |
| Bollinnehav | 57 | 1,09–1,49 | −0,11 | −0,08 (−0,5) | −2 pe | – | +0,08 / −0,22  |
| Kortpass | 50 | 1,32–1,54 | +0,08 | +0,11 (+0,6) | −6 pe | – | +0,39 / −0,03  |
| Blandat | 68 | 0,99–1,68 | −0,16 | −0,14 (−1,0) | −8 pe | – | −0,16 / −0,11 ✔ |
| Direktspel | 54 | 1,00–1,22 | +0,05 | +0,07 (+0,5) | +2 pe | – | +0,10 / +0,04 ✔ |
| Lågpress | 71 | 1,14–1,35 | +0,03 | +0,05 (+0,3) | −3 pe | – | −0,06 / +0,34  |
| Mellanpress | 67 | 1,03–1,60 | +0,03 | +0,05 (+0,3) | −8 pe | – | +0,25 / −0,13  |
| Högpress | 34 | 1,09–1,59 | −0,22 | −0,20 (−1,0) | −1 pe | – | −0,64 / −0,17  |
| Svag på fasta | 26 | 0,96–1,35 | +0,14 | +0,16 (+0,7) | −13 pe | – | +0,08 / +0,28 ✔ |
| Medel på fasta | 63 | 1,16–1,38 | +0,03 | +0,05 (+0,4) | +1 pe | – | +0,10 / −0,00  |
| Farlig på fasta | 71 | 1,07–1,59 | −0,09 | −0,07 (−0,5) | −3 pe | – | −0,03 / −0,12 ✔ |
| Stark mot fasta | 28 | 1,04–1,57 | −0,10 | −0,07 (−0,3) | −10 pe | – | +0,13 / −0,34  |
| Medel mot fasta | 70 | 1,19–1,44 | +0,10 | +0,12 (+0,8) | −6 pe | – | +0,12 / +0,12 ✔ |
| Svag mot fasta | 52 | 0,96–1,42 | −0,02 | +0,00 (+0,0) | +3 pe | – | −0,05 / +0,17  |

- Svårast mot **Högpress** (−0,20 p/match rel. eget snitt, z −1,0, 34 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,25 p/match rel. eget snitt, z +1,5, 53 m) – åt samma håll i båda halvorna men svagt

### Vitoria

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 44,3 %). 83 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026 (28 m): 0,18 mål för (xG 0,24), 0,36 emot (xG 0,30), 4,57 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 18 | 0,89–1,94 | −0,03 | +0,01 (+0,0) | −5 pe | – | +0,57 / −0,27  |
| Balanserat | 37 | 0,92–1,65 | −0,02 | +0,03 (+0,2) | +6 pe | – | −0,12 / +0,29  |
| Bollinnehav | 28 | 0,79–1,32 | −0,09 | −0,04 (−0,2) | +1 pe | – | −0,31 / +0,13  |
| Kortpass | 29 | 0,97–1,34 | +0,02 | +0,06 (+0,3) | +1 pe | – | −0,26 / +0,26  |
| Blandat | 34 | 0,74–1,62 | −0,08 | −0,03 (−0,2) | +6 pe | – | −0,03 / −0,04 ✔ |
| Direktspel | 20 | 0,95–1,95 | −0,07 | −0,03 (−0,1) | −2 pe | – | +0,05 / −0,17  |
| Lågpress | 48 | 0,92–1,50 | +0,06 | +0,10 (+0,6) | +0 pe | – | −0,05 / +0,43  |
| Mellanpress | 18 | 0,78–1,67 | −0,34 | −0,30 (−1,5) | +6 pe | – | +0,35 / −0,48  |
| Högpress | 17 | 0,82–1,82 | −0,01 | +0,03 (+0,1) | +3 pe | – | −0,63 / +0,24  |
| Svag på fasta | 6 | 0,67–1,17 | −0,37 | −0,32 (−1,4) | +38 pe | – | −0,02 / −0,94  |
| Medel på fasta | 26 | 0,81–1,73 | −0,16 | −0,12 (−0,7) | +5 pe | – | −0,37 / +0,29  |
| Farlig på fasta | 41 | 0,93–1,66 | +0,04 | +0,08 (+0,5) | −3 pe | – | +0,16 / +0,00 ✔ |
| Stark mot fasta | 6 | 0,67–1,67 | −0,57 | −0,53 (−2,3) | +24 pe | – | −0,89 / −0,16  |
| Medel mot fasta | 28 | 0,82–1,50 | −0,05 | −0,01 (−0,1) | +5 pe | – | +0,06 / −0,11  |
| Svag mot fasta | 26 | 0,96–1,77 | −0,03 | +0,02 (+0,1) | +0 pe | – | −0,05 / +0,38  |

- Svårast mot **Mellanpress** (−0,30 p/match rel. eget snitt, z −1,5, 18 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,10 p/match rel. eget snitt, z +0,6, 48 m) – inte stabilt, troligen slump
