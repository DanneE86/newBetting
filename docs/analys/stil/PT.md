# Stilmatchning – Primeira Liga (PT)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1703 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 109 m · hemma +0,04 · kryss +0 pe · ö2,5 −1 pe | 181 m · hemma −0,10 · kryss +4 pe · ö2,5 −3 pe | 168 m · hemma +0,03 · kryss −2 pe · ö2,5 −3 pe |
| **Mellan** | 181 m · hemma +0,03 · kryss −4 pe · ö2,5 +4 pe | 259 m · hemma +0,01 · kryss −0 pe · ö2,5 +2 pe | 237 m · hemma −0,08 · kryss −6 pe · ö2,5 +5 pe |
| **Mycket boll** | 166 m · hemma +0,14 · kryss −4 pe · ö2,5 +2 pe | 239 m · hemma +0,12 · kryss −3 pe · ö2,5 +1 pe | 163 m · hemma −0,04 · kryss +2 pe · ö2,5 +6 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 184 m · hemma +0,13 · kryss −3 pe · ö2,5 +1 pe | 215 m · hemma +0,00 · kryss +0 pe · ö2,5 −6 pe | 167 m · hemma −0,08 · kryss −6 pe · ö2,5 +6 pe |
| **Balanserat** | 215 m · hemma +0,08 · kryss −5 pe · ö2,5 +1 pe | 225 m · hemma −0,02 · kryss +0 pe · ö2,5 +4 pe | 192 m · hemma +0,08 · kryss −2 pe · ö2,5 −1 pe |
| **Bollinnehav** | 165 m · hemma −0,09 · kryss −0 pe · ö2,5 +4 pe | 191 m · hemma +0,00 · kryss −2 pe · ö2,5 +7 pe | 149 m · hemma +0,01 · kryss +3 pe · ö2,5 −2 pe |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 378 m · mot marknaden +0,08 (z +1,5) · mål 1,57 · ö2,5 +4 pe | 502 m · mot marknaden +0,01 (z +0,2) · mål 1,30 · ö2,5 +2 pe | 159 m · mot marknaden +0,15 (z +1,6) · mål 1,48 · ö2,5 +12 pe |
| **Medel på fasta** | 501 m · mot marknaden −0,00 (z −0,1) · mål 1,31 · ö2,5 −2 pe | 634 m · mot marknaden −0,02 (z −0,4) · mål 1,30 · ö2,5 +4 pe | 340 m · mot marknaden −0,07 (z −1,1) · mål 1,23 · ö2,5 +1 pe |
| **Farlig på fasta** | 205 m · mot marknaden −0,05 (z −0,6) · mål 1,29 · ö2,5 −4 pe | 372 m · mot marknaden −0,02 (z −0,3) · mål 1,34 · ö2,5 +2 pe | 315 m · mot marknaden +0,06 (z +1,0) · mål 1,31 · ö2,5 −3 pe |

## Lag (säsong 2026/27)

### Alverca

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 43,5 %). 7 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,34), 0,14 emot (xG 0,29), 5,00 hörnor · 2025/26 (34 m): 0,23 mål för (xG 0,31), 0,29 emot (xG 0,22), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 0,00–2,00 | −0,36 | −0,36 (−3,6) | −15 pe | −57 pe | −0,36 / –  |
| Balanserat | 5 | 1,60–1,40 | +0,24 | +0,24 (+0,6) | +14 pe | +10 pe | −0,51 / +0,75  |
| Bollinnehav | 1 | 1,00–2,00 | −0,86 | −0,86 (−8,6) | −27 pe | +55 pe | – / −0,86  |
| Kortpass | 6 | 1,00–1,67 | −0,26 | −0,26 (−1,0) | +10 pe | −1 pe | −0,46 / −0,07  |
| Blandat | 1 | 3,00–1,00 | +1,58 | +1,58 (+15,8) | −29 pe | +53 pe | – / +1,58  |
| Lågpress | 2 | 1,50–2,50 | −0,51 | −0,51 (−6,7) | +28 pe | +44 pe | −0,51 / –  |
| Mellanpress | 5 | 1,20–1,20 | +0,20 | +0,20 (+0,5) | −5 pe | −8 pe | −0,36 / +0,35  |
| Svag på fasta | 1 | 1,00–0,00 | +1,16 | +1,16 (+11,6) | −26 pe | −50 pe | – / +1,16  |
| Medel på fasta | 5 | 1,00–2,00 | −0,55 | −0,55 (−6,9) | +17 pe | +9 pe | −0,46 / −0,68  |
| Farlig på fasta | 1 | 3,00–1,00 | +1,58 | +1,58 (+15,8) | −29 pe | +53 pe | – / +1,58  |
| Medel mot fasta | 5 | 1,20–1,80 | −0,11 | −0,11 (−0,3) | −3 pe | +9 pe | −0,38 / +0,08  |
| Svag mot fasta | 2 | 1,50–1,00 | +0,27 | +0,27 (+0,4) | +23 pe | +2 pe | −0,62 / +1,16  |

### Arouca

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 50,6 %). 120 matcher med stil, mot marknaden totalt +0,17 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,16), 0,29 emot (xG 0,13), 2,86 hörnor · 2025/26 (34 m): 0,38 mål för (xG 0,24), 0,50 emot (xG 0,33), 3,71 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 37 | 1,27–1,30 | +0,33 | +0,16 (+0,8) | +4 pe | +3 pe | +0,35 / −0,15  |
| Balanserat | 44 | 1,52–1,68 | +0,16 | −0,01 (−0,1) | −15 pe | +17 pe | +0,21 / −0,17  |
| Bollinnehav | 39 | 1,13–1,67 | +0,03 | −0,14 (−1,0) | +14 pe | −2 pe | −0,23 / −0,06 ✔ |
| Kortpass | 64 | 1,41–1,63 | +0,07 | −0,10 (−0,7) | −0 pe | +10 pe | −0,14 / −0,08 ✔ |
| Blandat | 46 | 1,11–1,61 | +0,16 | −0,01 (−0,1) | +1 pe | +3 pe | +0,07 / −0,16  |
| Direktspel | 10 | 1,70–0,90 | +0,87 | +0,70 (+1,6) | +4 pe | +1 pe | +1,10 / −0,91  |
| Lågpress | 15 | 1,40–1,93 | +0,21 | +0,04 (+0,1) | +3 pe | +23 pe | – / +0,04  |
| Mellanpress | 51 | 1,33–1,24 | +0,38 | +0,21 (+1,3) | −3 pe | +4 pe | +0,35 / +0,05 ✔ |
| Högpress | 54 | 1,28–1,76 | −0,03 | −0,20 (−1,4) | +3 pe | +4 pe | −0,05 / −0,47 ✔ |
| Svag på fasta | 44 | 1,05–2,02 | −0,25 | −0,42 (−2,9) | −1 pe | +10 pe | −0,45 / −0,36 ✔ ⚑ |
| Medel på fasta | 59 | 1,41–1,24 | +0,38 | +0,21 (+1,4) | −0 pe | −0 pe | +0,83 / −0,31  |
| Farlig på fasta | 17 | 1,71–1,47 | +0,52 | +0,35 (+1,4) | +4 pe | +20 pe | −0,54 / +0,41  |
| Stark mot fasta | 42 | 1,40–1,26 | +0,10 | −0,07 (−0,4) | −1 pe | −2 pe | −0,07 / −0,08 ✔ |
| Medel mot fasta | 63 | 1,32–1,73 | +0,32 | +0,15 (+1,1) | −3 pe | +10 pe | +0,34 / −0,02  |
| Svag mot fasta | 15 | 1,07–1,67 | −0,25 | −0,42 (−1,7) | +20 pe | +12 pe | −0,54 / −0,42  |

- Svårast mot **Svag på fasta** (−0,42 p/match rel. eget snitt, z −2,9, 44 m) – ⚑ håller i båda halvorna
- Bäst mot **Farlig på fasta** (+0,35 p/match rel. eget snitt, z +1,4, 17 m) – inte stabilt, troligen slump

### Benfica

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 63,6 %). 227 matcher med stil, mot marknaden totalt +0,09 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,41), 0,29 emot (xG 0,17), 7,29 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,38), 0,12 emot (xG 0,12), 7,21 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 76 | 2,18–0,76 | +0,11 | +0,02 (+0,1) | −2 pe | −2 pe | +0,13 / −0,14  |
| Balanserat | 85 | 2,27–0,92 | −0,02 | −0,11 (−0,9) | −4 pe | +0 pe | −0,12 / −0,10 ✔ |
| Bollinnehav | 66 | 2,61–0,88 | +0,21 | +0,12 (+1,0) | −3 pe | +17 pe | +0,04 / +0,17 ✔ |
| Kortpass | 62 | 2,37–0,87 | +0,03 | −0,06 (−0,5) | +5 pe | +10 pe | +0,37 / −0,07  |
| Blandat | 77 | 2,44–0,79 | +0,14 | +0,05 (+0,5) | −3 pe | +9 pe | +0,04 / +0,06 ✔ |
| Direktspel | 88 | 2,23–0,90 | +0,09 | −0,00 (−0,0) | −8 pe | −3 pe | +0,00 / −0,06  |
| Lågpress | 69 | 2,49–0,87 | +0,24 | +0,15 (+1,1) | −9 pe | +7 pe | +0,15 / +0,15 ✔ |
| Mellanpress | 99 | 2,27–0,78 | +0,01 | −0,08 (−0,7) | +0 pe | +1 pe | −0,11 / −0,04 ✔ |
| Högpress | 59 | 2,27–0,97 | +0,05 | −0,04 (−0,3) | −1 pe | +7 pe | −0,06 / −0,04 ✔ |
| Svag på fasta | 68 | 2,26–0,82 | +0,11 | +0,02 (+0,2) | −0 pe | +4 pe | +0,15 / −0,06  |
| Medel på fasta | 103 | 2,36–0,90 | +0,03 | −0,06 (−0,5) | −4 pe | +7 pe | −0,11 / −0,02 ✔ |
| Farlig på fasta | 56 | 2,39–0,80 | +0,18 | +0,09 (+0,6) | −5 pe | −0 pe | +0,08 / +0,09 ✔ |
| Stark mot fasta | 78 | 2,32–0,87 | +0,03 | −0,06 (−0,4) | −0 pe | +1 pe | +0,03 / −0,12  |
| Medel mot fasta | 96 | 2,27–0,91 | +0,09 | −0,01 (−0,1) | −4 pe | +5 pe | −0,13 / +0,11  |
| Svag mot fasta | 53 | 2,49–0,74 | +0,18 | +0,09 (+0,7) | −5 pe | +9 pe | +0,21 / −0,12  |

- Svårast mot **Balanserat** (−0,11 p/match rel. eget snitt, z −0,9, 85 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,15 p/match rel. eget snitt, z +1,1, 69 m) – åt samma håll i båda halvorna men svagt

### Casa Pia

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 44,6 %). 92 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,23), 0,29 emot (xG 0,33), 4,14 hörnor · 2025/26 (34 m): 0,23 mål för (xG 0,23), 0,41 emot (xG 0,37), 4,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 24 | 1,13–1,96 | −0,04 | −0,12 (−0,5) | +2 pe | +8 pe | −0,01 / −0,31 ✔ |
| Balanserat | 35 | 1,09–1,37 | +0,09 | +0,01 (+0,0) | +1 pe | −4 pe | +0,54 / −0,61  |
| Bollinnehav | 33 | 0,88–1,39 | +0,16 | +0,08 (+0,4) | +10 pe | −6 pe | −0,27 / +0,28  |
| Kortpass | 56 | 1,13–1,59 | +0,14 | +0,06 (+0,4) | +0 pe | +5 pe | +0,16 / −0,01  |
| Blandat | 30 | 0,77–1,23 | +0,10 | +0,02 (+0,1) | +14 pe | −19 pe | +0,37 / −0,39  |
| Direktspel | 6 | 1,33–2,50 | −0,58 | −0,66 (−8,5) | −5 pe | +30 pe | −0,59 / −1,01  |
| Lågpress | 12 | 0,83–1,67 | −0,19 | −0,27 (−0,9) | +8 pe | +5 pe | −0,49 / −0,20  |
| Mellanpress | 35 | 0,94–1,54 | −0,07 | −0,15 (−0,7) | −2 pe | −7 pe | +0,06 / −0,26  |
| Högpress | 45 | 1,13–1,49 | +0,27 | +0,19 (+1,2) | +8 pe | +1 pe | +0,25 / +0,07 ✔ |
| Svag på fasta | 32 | 1,13–1,47 | +0,36 | +0,28 (+1,3) | +2 pe | +4 pe | +0,23 / +0,37 ✔ |
| Medel på fasta | 42 | 1,02–1,67 | −0,03 | −0,11 (−0,6) | +0 pe | −1 pe | +0,18 / −0,41  |
| Farlig på fasta | 18 | 0,83–1,33 | −0,15 | −0,23 (−0,9) | +19 pe | −13 pe | −0,45 / −0,17  |
| Stark mot fasta | 28 | 1,25–1,25 | −0,00 | −0,09 (−0,4) | +3 pe | −0 pe | +0,21 / −0,54  |
| Medel mot fasta | 48 | 0,77–1,63 | +0,02 | −0,06 (−0,4) | +11 pe | −6 pe | −0,00 / −0,13 ✔ |
| Svag mot fasta | 16 | 1,38–1,75 | +0,42 | +0,34 (+0,9) | −14 pe | +11 pe | +0,85 / +0,17  |

- Svårast mot **Farlig på fasta** (−0,23 p/match rel. eget snitt, z −0,9, 18 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,28 p/match rel. eget snitt, z +1,3, 32 m) – åt samma håll i båda halvorna men svagt

### Estoril

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 46,2 %). 121 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026/27 (7 m): 0,00 mål för (xG 0,20), 0,43 emot (xG 0,47), 4,86 hörnor · 2025/26 (34 m): 0,41 mål för (xG 0,33), 0,41 emot (xG 0,34), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 38 | 1,13–1,47 | +0,04 | +0,08 (+0,4) | −7 pe | +5 pe | +0,27 / −0,14  |
| Balanserat | 41 | 1,32–1,66 | −0,30 | −0,26 (−1,5) | −1 pe | +7 pe | −0,63 / −0,00 ✔ |
| Bollinnehav | 42 | 1,29–1,67 | +0,13 | +0,18 (+1,0) | −8 pe | −1 pe | +0,10 / +0,26 ✔ |
| Kortpass | 61 | 1,48–1,69 | −0,01 | +0,03 (+0,2) | +3 pe | +14 pe | −0,14 / +0,12  |
| Blandat | 50 | 1,08–1,60 | −0,15 | −0,10 (−0,6) | −11 pe | −4 pe | −0,08 / −0,15 ✔ |
| Direktspel | 10 | 0,70–1,10 | +0,29 | +0,34 (+0,7) | −25 pe | −21 pe | +0,31 / +0,45  |
| Lågpress | 16 | 0,94–1,50 | −0,35 | −0,31 (−1,2) | −1 pe | +0 pe | −0,24 / −0,31  |
| Mellanpress | 52 | 1,31–1,67 | −0,11 | −0,07 (−0,4) | −9 pe | +7 pe | +0,00 / −0,12  |
| Högpress | 53 | 1,28–1,57 | +0,12 | +0,16 (+1,0) | −3 pe | +2 pe | −0,07 / +0,69  |
| Svag på fasta | 43 | 1,28–1,74 | −0,16 | −0,12 (−0,7) | −9 pe | +5 pe | −0,14 / −0,07 ✔ |
| Medel på fasta | 59 | 1,22–1,49 | +0,11 | +0,15 (+0,9) | −6 pe | +2 pe | +0,05 / +0,25 ✔ |
| Farlig på fasta | 19 | 1,26–1,63 | −0,24 | −0,20 (−0,8) | +6 pe | +6 pe | −0,24 / −0,20  |
| Stark mot fasta | 45 | 1,40–1,38 | +0,01 | +0,05 (+0,3) | +6 pe | +1 pe | −0,06 / +0,24  |
| Medel mot fasta | 59 | 1,08–1,76 | −0,07 | −0,03 (−0,2) | −15 pe | +5 pe | −0,03 / −0,03 ✔ |
| Svag mot fasta | 17 | 1,41–1,65 | −0,07 | −0,03 (−0,1) | −2 pe | +9 pe | −0,16 / −0,02  |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −1,5, 41 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,18 p/match rel. eget snitt, z +1,0, 42 m) – åt samma håll i båda halvorna men svagt

### Estrela

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 49,4 %). 64 matcher med stil, mot marknaden totalt −0,07 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,16), 0,29 emot (xG 0,31), 4,00 hörnor · 2025/26 (34 m): 0,21 mål för (xG 0,28), 0,44 emot (xG 0,27), 3,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 17 | 0,65–1,71 | −0,19 | −0,12 (−0,5) | −0 pe | −6 pe | −0,28 / +0,61  |
| Balanserat | 24 | 1,38–1,75 | −0,15 | −0,08 (−0,3) | +10 pe | +16 pe | −0,33 / +0,05  |
| Bollinnehav | 23 | 1,09–1,70 | +0,09 | +0,17 (+0,7) | +0 pe | +6 pe | +0,14 / +0,19 ✔ |
| Kortpass | 45 | 1,24–1,89 | −0,14 | −0,07 (−0,4) | +3 pe | +18 pe | −0,17 / +0,01  |
| Blandat | 17 | 0,76–1,29 | +0,16 | +0,23 (+0,8) | +5 pe | −24 pe | −0,09 / +0,69  |
| Direktspel | 2 | 0,00–1,50 | −0,52 | −0,44 (−0,9) | +21 pe | +6 pe | −0,44 / –  |
| Lågpress | 16 | 0,81–1,69 | −0,46 | −0,38 (−1,9) | +6 pe | +3 pe | −0,56 / −0,28 ✔ |
| Mellanpress | 28 | 1,11–1,43 | +0,18 | +0,25 (+1,1) | +6 pe | +4 pe | +0,14 / +0,34 ✔ |
| Högpress | 20 | 1,25–2,15 | −0,12 | −0,04 (−0,2) | −1 pe | +13 pe | −0,25 / +0,43  |
| Svag på fasta | 17 | 0,82–1,59 | −0,05 | +0,03 (+0,1) | −2 pe | −6 pe | +0,09 / −0,03  |
| Medel på fasta | 29 | 1,38–1,66 | +0,17 | +0,25 (+1,2) | +12 pe | +11 pe | −0,17 / +0,76  |
| Farlig på fasta | 18 | 0,83–1,94 | −0,50 | −0,42 (−2,0) | −4 pe | +9 pe | −0,39 / −0,45 ✔ |
| Stark mot fasta | 19 | 1,37–1,26 | +0,32 | +0,40 (+1,4) | +2 pe | +5 pe | +0,36 / +0,43 ✔ |
| Medel mot fasta | 30 | 1,00–1,77 | −0,08 | −0,00 (−0,0) | +6 pe | +7 pe | −0,12 / +0,09  |
| Svag mot fasta | 15 | 0,87–2,20 | −0,57 | −0,50 (−2,7) | +1 pe | +6 pe | −0,68 / −0,13 ✔ ⚑ |

- Svårast mot **Svag mot fasta** (−0,50 p/match rel. eget snitt, z −2,7, 15 m) – ⚑ håller i båda halvorna
- Bäst mot **Stark mot fasta** (+0,40 p/match rel. eget snitt, z +1,4, 19 m) – åt samma håll i båda halvorna men svagt

### Famalicao

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 53,9 %). 174 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,26), 0,00 emot (xG 0,21), 5,43 hörnor · 2025/26 (34 m): 0,35 mål för (xG 0,39), 0,15 emot (xG 0,14), 5,47 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 50 | 1,22–1,40 | +0,08 | +0,08 (+0,5) | −7 pe | +16 pe | +0,10 / +0,06 ✔ |
| Balanserat | 67 | 1,22–1,25 | −0,08 | −0,07 (−0,5) | +5 pe | −1 pe | −0,03 / −0,10 ✔ |
| Bollinnehav | 57 | 1,19–1,28 | +0,01 | +0,01 (+0,1) | +11 pe | −2 pe | −0,21 / +0,26  |
| Kortpass | 69 | 1,16–1,00 | +0,14 | +0,15 (+1,1) | +11 pe | −8 pe | −0,06 / +0,18  |
| Blandat | 65 | 1,40–1,42 | −0,04 | −0,04 (−0,2) | −2 pe | +13 pe | +0,07 / −0,20  |
| Direktspel | 40 | 1,00–1,65 | −0,20 | −0,19 (−1,0) | −2 pe | +9 pe | −0,18 / −0,31  |
| Lågpress | 24 | 1,04–1,25 | −0,18 | −0,18 (−0,9) | +19 pe | −3 pe | +0,11 / −0,32  |
| Mellanpress | 83 | 1,27–1,12 | +0,08 | +0,09 (+0,7) | −2 pe | +1 pe | +0,07 / +0,12 ✔ |
| Högpress | 67 | 1,21–1,55 | −0,05 | −0,04 (−0,3) | +4 pe | +10 pe | −0,33 / +0,15  |
| Svag på fasta | 64 | 1,30–1,27 | +0,14 | +0,14 (+1,0) | −3 pe | +4 pe | +0,16 / +0,13 ✔ |
| Medel på fasta | 73 | 1,27–1,30 | −0,00 | +0,00 (+0,0) | +9 pe | +7 pe | −0,02 / +0,02  |
| Farlig på fasta | 37 | 0,95–1,38 | −0,26 | −0,25 (−1,4) | +4 pe | −4 pe | −0,51 / −0,01 ✔ |
| Stark mot fasta | 58 | 1,12–1,14 | −0,02 | −0,01 (−0,1) | +1 pe | −0 pe | −0,19 / +0,20  |
| Medel mot fasta | 87 | 1,34–1,38 | +0,07 | +0,07 (+0,6) | −0 pe | +9 pe | +0,04 / +0,10 ✔ |
| Svag mot fasta | 29 | 1,00–1,41 | −0,19 | −0,19 (−1,0) | +18 pe | −5 pe | −0,06 / −0,26 ✔ |

- Svårast mot **Farlig på fasta** (−0,25 p/match rel. eget snitt, z −1,4, 37 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,15 p/match rel. eget snitt, z +1,1, 69 m) – inte stabilt, troligen slump

### Gil Vicente

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 53,3 %). 172 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (6 m): 0,00 mål för (xG 0,12), 0,00 emot (xG 0,07), 3,67 hörnor · 2025/26 (34 m): 0,50 mål för (xG 0,45), 0,41 emot (xG 0,19), 5,56 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,07–1,39 | −0,03 | −0,04 (−0,3) | −3 pe | +1 pe | +0,17 / −0,27  |
| Balanserat | 62 | 1,03–1,26 | −0,15 | −0,15 (−1,1) | +3 pe | −5 pe | −0,52 / +0,11  |
| Bollinnehav | 54 | 1,28–1,30 | +0,23 | +0,22 (+1,3) | −4 pe | +2 pe | +0,40 / −0,02  |
| Kortpass | 61 | 0,93–1,39 | −0,25 | −0,25 (−1,9) | +10 pe | −5 pe | −0,43 / −0,22 ✔ |
| Blandat | 71 | 1,34–1,37 | +0,14 | +0,13 (+0,9) | −11 pe | +10 pe | −0,01 / +0,35  |
| Direktspel | 40 | 1,02–1,10 | +0,17 | +0,16 (+0,8) | −2 pe | −13 pe | +0,24 / −0,32  |
| Lågpress | 19 | 1,16–1,11 | +0,35 | +0,34 (+1,3) | −11 pe | −6 pe | +0,45 / +0,29 ✔ |
| Mellanpress | 90 | 1,14–1,22 | −0,05 | −0,06 (−0,5) | +4 pe | −2 pe | −0,06 / −0,05 ✔ |
| Högpress | 63 | 1,08–1,51 | −0,01 | −0,02 (−0,1) | −6 pe | +2 pe | +0,17 / −0,15  |
| Svag på fasta | 65 | 1,14–1,48 | −0,05 | −0,06 (−0,4) | −11 pe | −1 pe | +0,16 / −0,27  |
| Medel på fasta | 72 | 1,17–1,32 | +0,01 | +0,00 (+0,0) | +7 pe | +1 pe | −0,03 / +0,04  |
| Farlig på fasta | 35 | 1,00–1,00 | +0,12 | +0,11 (+0,5) | −2 pe | −4 pe | +0,00 / +0,23 ✔ |
| Stark mot fasta | 61 | 1,02–1,33 | −0,32 | −0,32 (−2,4) | +3 pe | −4 pe | −0,39 / −0,26 ✔ ⚑ |
| Medel mot fasta | 87 | 1,17–1,36 | +0,18 | +0,17 (+1,3) | −6 pe | +3 pe | +0,13 / +0,21 ✔ |
| Svag mot fasta | 24 | 1,21–1,13 | +0,23 | +0,22 (+0,8) | +3 pe | −5 pe | +0,96 / −0,31  |

- Svårast mot **Stark mot fasta** (−0,32 p/match rel. eget snitt, z −2,4, 61 m) – ⚑ håller i båda halvorna
- Bäst mot **Medel mot fasta** (+0,17 p/match rel. eget snitt, z +1,3, 87 m) – åt samma håll i båda halvorna men svagt

### Guimaraes

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 55,8 %). 228 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (7 m): 0,00 mål för (xG 0,39), 0,00 emot (xG 0,03), 5,71 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,32), 0,23 emot (xG 0,20), 4,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,41–1,14 | +0,24 | +0,19 (+1,3) | −5 pe | +0 pe | +0,36 / −0,00  |
| Balanserat | 86 | 1,26–1,16 | +0,05 | +0,01 (+0,0) | −3 pe | −4 pe | −0,28 / +0,32  |
| Bollinnehav | 71 | 1,10–1,45 | −0,16 | −0,20 (−1,5) | −5 pe | +4 pe | −0,16 / −0,23 ✔ |
| Kortpass | 66 | 1,26–1,32 | −0,01 | −0,05 (−0,4) | −1 pe | −2 pe | +0,09 / −0,06  |
| Blandat | 76 | 1,20–1,24 | +0,16 | +0,11 (+0,8) | −6 pe | +4 pe | +0,09 / +0,13 ✔ |
| Direktspel | 86 | 1,30–1,20 | −0,01 | −0,06 (−0,4) | −5 pe | −2 pe | −0,09 / +0,22  |
| Lågpress | 71 | 1,11–1,32 | −0,17 | −0,22 (−1,5) | −3 pe | −5 pe | −0,14 / −0,48 ✔ |
| Mellanpress | 95 | 1,36–1,09 | +0,21 | +0,16 (+1,3) | −6 pe | −0 pe | +0,13 / +0,19 ✔ |
| Högpress | 62 | 1,26–1,39 | +0,05 | +0,01 (+0,0) | −4 pe | +6 pe | −0,13 / +0,05  |
| Svag på fasta | 66 | 1,33–1,45 | +0,07 | +0,02 (+0,2) | −2 pe | +6 pe | −0,17 / +0,14  |
| Medel på fasta | 100 | 1,14–1,12 | +0,01 | −0,03 (−0,3) | −4 pe | −6 pe | −0,11 / +0,03  |
| Farlig på fasta | 62 | 1,35–1,23 | +0,07 | +0,03 (+0,2) | −8 pe | +4 pe | +0,12 / −0,24  |
| Stark mot fasta | 70 | 1,34–1,07 | +0,17 | +0,13 (+0,9) | −9 pe | −2 pe | +0,00 / +0,24 ✔ |
| Medel mot fasta | 100 | 1,21–1,41 | −0,04 | −0,08 (−0,8) | −2 pe | +4 pe | −0,05 / −0,11 ✔ |
| Svag mot fasta | 58 | 1,22–1,17 | +0,04 | −0,01 (−0,0) | −3 pe | −6 pe | −0,04 / +0,06  |

- Svårast mot **Lågpress** (−0,22 p/match rel. eget snitt, z −1,5, 71 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,16 p/match rel. eget snitt, z +1,3, 95 m) – åt samma håll i båda halvorna men svagt

### Moreirense

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 35,9 %). 172 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,20), 0,43 emot (xG 0,60), 2,14 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,22), 0,29 emot (xG 0,31), 3,65 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 0,95–1,42 | +0,02 | −0,01 (−0,1) | −2 pe | −1 pe | +0,06 / −0,09  |
| Balanserat | 64 | 1,06–1,52 | +0,06 | +0,03 (+0,2) | +3 pe | +1 pe | +0,15 / −0,10  |
| Bollinnehav | 51 | 1,10–1,63 | −0,01 | −0,03 (−0,2) | −4 pe | +8 pe | +0,22 / −0,20  |
| Kortpass | 45 | 1,22–1,60 | +0,09 | +0,07 (+0,4) | −3 pe | +12 pe | −0,57 / +0,08  |
| Blandat | 45 | 0,98–1,51 | −0,02 | −0,05 (−0,3) | −4 pe | +3 pe | +0,48 / −0,26  |
| Direktspel | 82 | 0,96–1,48 | +0,02 | −0,01 (−0,1) | +3 pe | −4 pe | +0,08 / −0,64  |
| Lågpress | 70 | 1,00–1,47 | +0,10 | +0,08 (+0,6) | −3 pe | −1 pe | +0,13 / −0,10  |
| Mellanpress | 66 | 1,00–1,47 | −0,02 | −0,05 (−0,3) | −5 pe | +3 pe | +0,16 / −0,16  |
| Högpress | 36 | 1,17–1,69 | −0,04 | −0,06 (−0,4) | +11 pe | +5 pe | +0,05 / −0,10  |
| Svag på fasta | 40 | 1,02–1,57 | +0,02 | −0,00 (−0,0) | −6 pe | +3 pe | −0,06 / +0,04  |
| Medel på fasta | 73 | 0,99–1,45 | −0,11 | −0,13 (−1,1) | +5 pe | −1 pe | +0,24 / −0,34  |
| Farlig på fasta | 59 | 1,10–1,56 | +0,19 | +0,17 (+1,1) | −3 pe | +6 pe | +0,14 / +0,23 ✔ |
| Stark mot fasta | 44 | 1,14–1,52 | −0,03 | −0,05 (−0,3) | +2 pe | +2 pe | +0,01 / −0,09  |
| Medel mot fasta | 70 | 0,89–1,46 | −0,05 | −0,08 (−0,6) | −1 pe | −5 pe | +0,18 / −0,29  |
| Svag mot fasta | 58 | 1,14–1,59 | +0,16 | +0,14 (+0,9) | −2 pe | +11 pe | +0,15 / +0,12 ✔ |

- Svårast mot **Medel på fasta** (−0,13 p/match rel. eget snitt, z −1,1, 73 m) – inte stabilt, troligen slump
- Bäst mot **Farlig på fasta** (+0,17 p/match rel. eget snitt, z +1,1, 59 m) – åt samma håll i båda halvorna men svagt

### Nacional

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,9 %). 37 matcher med stil, mot marknaden totalt −0,31 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,19), 0,29 emot (xG 0,24), 3,86 hörnor · 2025/26 (34 m): 0,35 mål för (xG 0,36), 0,27 emot (xG 0,34), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 5 | 1,00–2,40 | −0,74 | −0,44 (−2,3) | −4 pe | +10 pe | −0,14 / −0,63  |
| Balanserat | 16 | 1,44–1,63 | −0,09 | +0,22 (+0,8) | +12 pe | +7 pe | +0,70 / −0,27  |
| Bollinnehav | 16 | 0,63–1,25 | −0,39 | −0,08 (−0,3) | −19 pe | −18 pe | −0,18 / +0,02  |
| Kortpass | 29 | 1,07–1,59 | −0,28 | +0,03 (+0,1) | −5 pe | +2 pe | +0,35 / −0,27  |
| Blandat | 8 | 0,88–1,50 | −0,41 | −0,10 (−0,4) | +0 pe | −25 pe | −0,25 / +0,04  |
| Lågpress | 11 | 0,91–2,09 | −0,52 | −0,21 (−0,9) | −14 pe | +3 pe | +0,01 / −0,47  |
| Mellanpress | 16 | 1,25–1,63 | −0,43 | −0,13 (−0,5) | +3 pe | +10 pe | −0,12 / −0,13 ✔ |
| Högpress | 10 | 0,80–0,90 | +0,13 | +0,43 (+1,0) | −4 pe | −32 pe | +1,21 / −0,08  |
| Svag på fasta | 10 | 0,70–2,00 | −0,75 | −0,45 (−2,8) | −4 pe | −2 pe | −0,22 / −0,79  |
| Medel på fasta | 17 | 0,94–1,41 | −0,38 | −0,07 (−0,2) | −2 pe | −7 pe | +0,37 / −0,38  |
| Farlig på fasta | 10 | 1,50–1,40 | +0,26 | +0,57 (+1,8) | −6 pe | +1 pe | +0,52 / +0,62 ✔ |
| Stark mot fasta | 9 | 1,11–1,33 | −0,25 | +0,06 (+0,2) | +5 pe | −13 pe | +0,61 / −0,63  |
| Medel mot fasta | 20 | 0,95–1,65 | −0,27 | +0,03 (+0,1) | −2 pe | −3 pe | +0,40 / −0,27  |
| Svag mot fasta | 8 | 1,13–1,63 | −0,45 | −0,14 (−0,3) | −16 pe | +5 pe | −0,67 / +0,39  |

- Svårast mot **Mellanpress** (−0,13 p/match rel. eget snitt, z −0,5, 16 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,22 p/match rel. eget snitt, z +0,8, 16 m) – inte stabilt, troligen slump

### Porto

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 54,3 %). 228 matcher med stil, mot marknaden totalt +0,17 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,60), 0,00 emot (xG 0,04), 6,86 hörnor · 2025/26 (34 m): 0,44 mål för (xG 0,31), 0,18 emot (xG 0,08), 5,65 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 79 | 2,01–0,70 | +0,18 | +0,01 (+0,1) | +0 pe | −1 pe | −0,11 / +0,15  |
| Balanserat | 83 | 1,98–0,77 | +0,12 | −0,04 (−0,3) | −7 pe | −3 pe | +0,19 / −0,27  |
| Bollinnehav | 66 | 2,30–0,71 | +0,21 | +0,04 (+0,4) | −4 pe | +9 pe | +0,09 / +0,00 ✔ |
| Kortpass | 67 | 1,99–0,79 | +0,21 | +0,04 (+0,3) | −7 pe | +3 pe | +0,32 / +0,02  |
| Blandat | 75 | 2,13–0,75 | +0,07 | −0,10 (−0,8) | −0 pe | +2 pe | +0,10 / −0,24  |
| Direktspel | 86 | 2,12–0,66 | +0,22 | +0,05 (+0,5) | −4 pe | −1 pe | +0,02 / +0,39 ✔ |
| Lågpress | 69 | 2,09–0,57 | +0,31 | +0,14 (+1,3) | −6 pe | −1 pe | +0,05 / +0,47 ✔ |
| Mellanpress | 96 | 2,07–0,78 | +0,12 | −0,05 (−0,5) | −4 pe | −1 pe | +0,00 / −0,10  |
| Högpress | 63 | 2,10–0,83 | +0,09 | −0,08 (−0,6) | −1 pe | +6 pe | +0,26 / −0,16  |
| Svag på fasta | 73 | 1,95–0,68 | +0,12 | −0,05 (−0,4) | −3 pe | −1 pe | +0,07 / −0,12  |
| Medel på fasta | 98 | 2,29–0,79 | +0,16 | −0,01 (−0,1) | −6 pe | +7 pe | +0,06 / −0,07  |
| Farlig på fasta | 57 | 1,91–0,68 | +0,24 | +0,07 (+0,7) | −2 pe | −5 pe | +0,02 / +0,19 ✔ |
| Stark mot fasta | 76 | 2,24–0,57 | +0,32 | +0,15 (+1,6) | −2 pe | +4 pe | +0,25 / +0,08 ✔ |
| Medel mot fasta | 95 | 1,98–0,91 | −0,02 | −0,18 (−1,5) | −1 pe | −1 pe | −0,17 / −0,20 ✔ |
| Svag mot fasta | 57 | 2,05–0,65 | +0,27 | +0,10 (+0,9) | −11 pe | +1 pe | +0,12 / +0,07 ✔ |

- Svårast mot **Medel mot fasta** (−0,18 p/match rel. eget snitt, z −1,5, 95 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,15 p/match rel. eget snitt, z +1,6, 76 m) – åt samma håll i båda halvorna men svagt

### Rio Ave

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 43,0 %). 175 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,17), 0,14 emot (xG 0,20), 3,14 hörnor · 2025/26 (34 m): 0,15 mål för (xG 0,21), 0,53 emot (xG 0,37), 4,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,28–1,48 | +0,07 | +0,09 (+0,6) | +3 pe | +4 pe | +0,03 / +0,17 ✔ |
| Balanserat | 72 | 1,03–1,49 | −0,10 | −0,09 (−0,6) | +5 pe | −3 pe | −0,11 / −0,06 ✔ |
| Bollinnehav | 39 | 1,00–1,44 | +0,01 | +0,02 (+0,1) | +22 pe | −10 pe | −0,16 / +0,10  |
| Kortpass | 57 | 1,09–1,70 | −0,03 | −0,02 (−0,2) | +8 pe | +1 pe | +0,60 / −0,05  |
| Blandat | 42 | 1,05–1,33 | +0,11 | +0,12 (+0,7) | +14 pe | −10 pe | −0,20 / +0,28  |
| Direktspel | 76 | 1,17–1,38 | −0,06 | −0,05 (−0,4) | +5 pe | +0 pe | −0,04 / −0,16 ✔ |
| Lågpress | 67 | 1,15–1,55 | −0,01 | +0,01 (+0,0) | +0 pe | +1 pe | +0,07 / −0,19  |
| Mellanpress | 57 | 1,11–1,42 | −0,10 | −0,08 (−0,6) | +8 pe | −2 pe | −0,25 / +0,06  |
| Högpress | 51 | 1,08–1,43 | +0,07 | +0,09 (+0,7) | +19 pe | −5 pe | −0,15 / +0,15  |
| Svag på fasta | 44 | 1,07–1,66 | −0,04 | −0,02 (−0,2) | +6 pe | +4 pe | −0,28 / +0,12  |
| Medel på fasta | 73 | 1,15–1,37 | +0,11 | +0,12 (+1,0) | +15 pe | −4 pe | +0,18 / +0,08 ✔ |
| Farlig på fasta | 58 | 1,10–1,47 | −0,14 | −0,13 (−0,9) | +1 pe | −4 pe | −0,13 / −0,14 ✔ |
| Stark mot fasta | 44 | 1,18–0,98 | +0,35 | +0,37 (+2,3) | +14 pe | −11 pe | +0,45 / +0,29 ✔ ⚑ |
| Medel mot fasta | 80 | 1,00–1,56 | −0,14 | −0,13 (−1,1) | +5 pe | −6 pe | −0,25 / −0,04 ✔ |
| Svag mot fasta | 51 | 1,24–1,76 | −0,13 | −0,12 (−0,8) | +8 pe | +11 pe | −0,17 / −0,02 ✔ |

- Svårast mot **Medel mot fasta** (−0,13 p/match rel. eget snitt, z −1,1, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,37 p/match rel. eget snitt, z +2,3, 44 m) – ⚑ håller i båda halvorna

### Santa Clara

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 45,0 %). 144 matcher med stil, mot marknaden totalt −0,16 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,23), 0,43 emot (xG 0,10), 3,71 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,28), 0,32 emot (xG 0,21), 4,62 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 37 | 1,00–1,41 | −0,28 | −0,11 (−0,6) | +4 pe | +2 pe | −0,07 / −0,19 ✔ |
| Balanserat | 57 | 1,04–1,47 | −0,09 | +0,07 (+0,5) | −0 pe | +1 pe | +0,11 / +0,03 ✔ |
| Bollinnehav | 50 | 0,90–1,42 | −0,16 | +0,00 (+0,0) | −7 pe | +6 pe | +0,07 / −0,05  |
| Kortpass | 35 | 0,91–1,26 | −0,01 | +0,15 (+0,8) | −10 pe | −2 pe | −0,42 / +0,19  |
| Blandat | 53 | 1,04–1,70 | −0,27 | −0,11 (−0,7) | −1 pe | +14 pe | +0,05 / −0,21  |
| Direktspel | 56 | 0,96–1,30 | −0,16 | +0,00 (+0,0) | +3 pe | −4 pe | +0,06 / −0,38  |
| Lågpress | 38 | 0,92–1,47 | −0,26 | −0,10 (−0,6) | −3 pe | −1 pe | −0,13 / −0,02 ✔ |
| Mellanpress | 74 | 0,99–1,28 | −0,08 | +0,09 (+0,6) | −1 pe | +4 pe | +0,21 / −0,01  |
| Högpress | 32 | 1,03–1,75 | −0,25 | −0,08 (−0,5) | −1 pe | +7 pe | −0,01 / −0,12 ✔ |
| Svag på fasta | 43 | 1,05–1,70 | −0,13 | +0,04 (+0,2) | +1 pe | +11 pe | +0,32 / −0,21  |
| Medel på fasta | 60 | 0,82–1,37 | −0,25 | −0,08 (−0,6) | −4 pe | +1 pe | −0,19 / −0,01 ✔ |
| Farlig på fasta | 41 | 1,15–1,27 | −0,08 | +0,08 (+0,4) | −1 pe | −1 pe | +0,06 / +0,14 ✔ |
| Stark mot fasta | 43 | 1,02–1,56 | −0,10 | +0,07 (+0,4) | −2 pe | +5 pe | +0,11 / +0,03 ✔ |
| Medel mot fasta | 73 | 0,99–1,49 | −0,31 | −0,14 (−1,1) | −4 pe | +6 pe | −0,15 / −0,13 ✔ |
| Svag mot fasta | 28 | 0,89–1,11 | +0,10 | +0,26 (+1,2) | +4 pe | −7 pe | +0,33 / +0,12 ✔ |

- Svårast mot **Medel mot fasta** (−0,14 p/match rel. eget snitt, z −1,1, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,26 p/match rel. eget snitt, z +1,2, 28 m) – åt samma håll i båda halvorna men svagt

### Sp Braga

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 59,8 %). 228 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (6 m): 0,00 mål för (xG 0,32), 0,17 emot (xG 0,05), 4,00 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,39), 0,23 emot (xG 0,18), 5,29 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 1,64–0,97 | −0,01 | −0,06 (−0,4) | −9 pe | −2 pe | −0,14 / +0,06  |
| Balanserat | 82 | 1,73–1,15 | +0,07 | +0,03 (+0,2) | +3 pe | +2 pe | +0,13 / −0,07  |
| Bollinnehav | 69 | 1,78–1,23 | +0,08 | +0,03 (+0,2) | −3 pe | +7 pe | +0,04 / +0,02 ✔ |
| Kortpass | 68 | 1,88–1,12 | +0,11 | +0,07 (+0,5) | +3 pe | +9 pe | +0,50 / +0,05  |
| Blandat | 76 | 1,74–1,20 | +0,00 | −0,04 (−0,3) | −3 pe | +3 pe | −0,15 / +0,04  |
| Direktspel | 84 | 1,56–1,04 | +0,03 | −0,02 (−0,1) | −7 pe | −4 pe | +0,04 / −0,81  |
| Lågpress | 70 | 1,40–1,09 | −0,03 | −0,07 (−0,5) | −11 pe | −4 pe | +0,02 / −0,39  |
| Mellanpress | 94 | 1,89–1,06 | +0,03 | −0,02 (−0,1) | +1 pe | +7 pe | −0,16 / +0,12  |
| Högpress | 64 | 1,80–1,22 | +0,15 | +0,10 (+0,8) | +1 pe | +2 pe | +0,45 / +0,01 ✔ |
| Svag på fasta | 68 | 1,69–1,19 | −0,04 | −0,09 (−0,6) | −8 pe | +4 pe | +0,00 / −0,14  |
| Medel på fasta | 99 | 1,77–0,99 | +0,12 | +0,07 (+0,6) | +2 pe | +0 pe | +0,10 / +0,05 ✔ |
| Farlig på fasta | 61 | 1,66–1,23 | +0,03 | −0,02 (−0,1) | −4 pe | +4 pe | −0,10 / +0,20  |
| Stark mot fasta | 70 | 1,91–1,04 | +0,12 | +0,07 (+0,5) | −8 pe | +9 pe | −0,10 / +0,21  |
| Medel mot fasta | 104 | 1,67–1,06 | +0,07 | +0,02 (+0,2) | +1 pe | −3 pe | −0,01 / +0,04  |
| Svag mot fasta | 54 | 1,54–1,31 | −0,09 | −0,14 (−0,8) | −5 pe | +3 pe | +0,09 / −0,67  |

- Svårast mot **Svag mot fasta** (−0,14 p/match rel. eget snitt, z −0,8, 54 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,10 p/match rel. eget snitt, z +0,8, 64 m) – åt samma håll i båda halvorna men svagt

### Sp Lisbon

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 60,2 %). 229 matcher med stil, mot marknaden totalt +0,16 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,19), 0,00 emot (xG 0,14), 5,00 hörnor · 2025/26 (34 m): 0,53 mål för (xG 0,33), 0,12 emot (xG 0,13), 6,85 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 77 | 2,05–0,75 | +0,26 | +0,09 (+0,9) | −5 pe | −1 pe | +0,02 / +0,19 ✔ |
| Balanserat | 84 | 2,46–0,77 | +0,23 | +0,06 (+0,6) | −4 pe | +13 pe | +0,03 / +0,10 ✔ |
| Bollinnehav | 68 | 2,04–0,94 | −0,01 | −0,18 (−1,4) | +8 pe | +2 pe | +0,05 / −0,34  |
| Kortpass | 64 | 2,75–0,81 | +0,12 | −0,05 (−0,4) | +5 pe | +14 pe | +0,17 / −0,06  |
| Blandat | 75 | 2,05–0,80 | +0,04 | −0,13 (−1,2) | +2 pe | −0 pe | −0,19 / −0,08 ✔ |
| Direktspel | 90 | 1,93–0,83 | +0,30 | +0,14 (+1,3) | −8 pe | +3 pe | +0,11 / +0,38 ✔ |
| Lågpress | 67 | 1,94–0,99 | +0,01 | −0,15 (−1,3) | +1 pe | +7 pe | −0,12 / −0,24 ✔ |
| Mellanpress | 95 | 2,34–0,68 | +0,29 | +0,12 (+1,3) | −4 pe | +3 pe | +0,16 / +0,09 ✔ |
| Högpress | 67 | 2,27–0,84 | +0,14 | −0,03 (−0,2) | +1 pe | +5 pe | +0,15 / −0,08  |
| Svag på fasta | 69 | 2,48–0,75 | +0,27 | +0,10 (+0,9) | −8 pe | +13 pe | +0,13 / +0,09 ✔ |
| Medel på fasta | 99 | 2,12–0,91 | +0,05 | −0,11 (−1,2) | +6 pe | +4 pe | −0,13 / −0,10 ✔ |
| Farlig på fasta | 61 | 2,02–0,74 | +0,23 | +0,07 (+0,6) | −5 pe | −3 pe | +0,12 / −0,08  |
| Stark mot fasta | 75 | 2,35–0,75 | +0,19 | +0,02 (+0,2) | −5 pe | +3 pe | +0,20 / −0,11  |
| Medel mot fasta | 101 | 2,16–0,83 | +0,14 | −0,02 (−0,2) | +1 pe | +6 pe | −0,14 / +0,07  |
| Svag mot fasta | 53 | 2,08–0,89 | +0,17 | +0,01 (+0,0) | −0 pe | +6 pe | +0,08 / −0,16  |

- Svårast mot **Bollinnehav** (−0,18 p/match rel. eget snitt, z −1,4, 68 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,12 p/match rel. eget snitt, z +1,3, 95 m) – åt samma håll i båda halvorna men svagt
