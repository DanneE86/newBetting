# Stilmatchning – Eredivisie (ED)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1769 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 117 m · hemma +0,12 · kryss −2 pe · ö2,5 +0 pe | 210 m · hemma +0,03 · kryss +1 pe · ö2,5 +1 pe | 166 m · hemma −0,12 · kryss −1 pe · ö2,5 +1 pe |
| **Mellan** | 214 m · hemma −0,12 · kryss +0 pe · ö2,5 −3 pe | 294 m · hemma +0,01 · kryss +6 pe · ö2,5 −4 pe | 229 m · hemma −0,01 · kryss +6 pe · ö2,5 +2 pe |
| **Mycket boll** | 166 m · hemma +0,04 · kryss −2 pe · ö2,5 +3 pe | 231 m · hemma +0,00 · kryss +4 pe · ö2,5 +0 pe | 142 m · hemma −0,09 · kryss −1 pe · ö2,5 +5 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 141 m · hemma +0,06 · kryss −1 pe · ö2,5 −3 pe | 238 m · hemma −0,03 · kryss +2 pe · ö2,5 −3 pe | 128 m · hemma +0,12 · kryss +2 pe · ö2,5 −0 pe |
| **Balanserat** | 242 m · hemma −0,10 · kryss +4 pe · ö2,5 +2 pe | 373 m · hemma −0,05 · kryss −1 pe · ö2,5 +2 pe | 213 m · hemma −0,03 · kryss +4 pe · ö2,5 −1 pe |
| **Bollinnehav** | 126 m · hemma +0,00 · kryss +4 pe · ö2,5 +5 pe | 215 m · hemma +0,03 · kryss +0 pe · ö2,5 +1 pe | 93 m · hemma −0,06 · kryss +8 pe · ö2,5 −5 pe |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 429 m · mot marknaden +0,06 (z +1,1) · mål 1,63 · ö2,5 −1 pe | 334 m · mot marknaden +0,03 (z +0,4) · mål 1,52 · ö2,5 −4 pe | 243 m · mot marknaden +0,07 (z +1,0) · mål 1,53 · ö2,5 −2 pe |
| **Medel på fasta** | 573 m · mot marknaden −0,11 (z −2,3) · mål 1,45 · ö2,5 +0 pe | 650 m · mot marknaden −0,04 (z −1,0) · mål 1,49 · ö2,5 +1 pe | 293 m · mot marknaden −0,10 (z −1,5) · mål 1,54 · ö2,5 +0 pe |
| **Farlig på fasta** | 324 m · mot marknaden +0,04 (z +0,6) · mål 1,72 · ö2,5 +1 pe | 394 m · mot marknaden +0,04 (z +0,6) · mål 1,75 · ö2,5 +2 pe | 298 m · mot marknaden +0,03 (z +0,5) · mål 1,68 · ö2,5 +4 pe |

## Lag (säsong 2026/27)

### Ajax

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 64,3 %). 228 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026/27 (7 m): 0,71 mål för (xG 0,54), 0,14 emot (xG 0,03), 8,00 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,22), 0,32 emot (xG 0,29), 4,82 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 2,10–1,04 | −0,22 | −0,18 (−1,4) | +2 pe | −9 pe | −0,03 / −0,34 ✔ |
| Balanserat | 107 | 2,75–1,10 | +0,10 | +0,14 (+1,5) | −0 pe | +6 pe | +0,15 / +0,13 ✔ |
| Bollinnehav | 53 | 2,43–0,85 | −0,10 | −0,05 (−0,4) | +13 pe | −3 pe | +0,01 / −0,12  |
| Kortpass | 45 | 1,91–1,09 | +0,05 | +0,09 (+0,5) | +9 pe | −8 pe | −0,46 / +0,23  |
| Blandat | 104 | 2,26–1,12 | −0,21 | −0,17 (−1,6) | +6 pe | −1 pe | +0,08 / −0,35  |
| Direktspel | 79 | 3,10–0,87 | +0,13 | +0,17 (+1,7) | −3 pe | +4 pe | +0,12 / +0,32 ✔ |
| Lågpress | 52 | 2,71–0,90 | +0,02 | +0,07 (+0,5) | −1 pe | −6 pe | +0,09 / −0,01  |
| Mellanpress | 106 | 2,58–1,11 | −0,01 | +0,03 (+0,3) | +3 pe | +5 pe | +0,09 / −0,01  |
| Högpress | 70 | 2,16–0,99 | −0,14 | −0,10 (−0,8) | +8 pe | −5 pe | −0,05 / −0,12 ✔ |
| Svag på fasta | 61 | 2,72–0,87 | +0,00 | +0,05 (+0,4) | −2 pe | −2 pe | −0,02 / +0,22  |
| Medel på fasta | 97 | 2,15–1,07 | −0,20 | −0,16 (−1,5) | +8 pe | −2 pe | +0,03 / −0,27  |
| Farlig på fasta | 70 | 2,73–1,10 | +0,14 | +0,18 (+1,4) | +2 pe | +2 pe | +0,20 / +0,17 ✔ |
| Stark mot fasta | 87 | 2,52–0,93 | −0,02 | +0,03 (+0,3) | +3 pe | −6 pe | +0,19 / −0,15  |
| Medel mot fasta | 92 | 2,36–1,01 | −0,02 | +0,03 (+0,3) | +4 pe | −2 pe | +0,04 / +0,02 ✔ |
| Svag mot fasta | 49 | 2,65–1,22 | −0,15 | −0,10 (−0,7) | +3 pe | +11 pe | −0,11 / −0,09 ✔ |

- Svårast mot **Blandat** (−0,17 p/match rel. eget snitt, z −1,6, 104 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,17 p/match rel. eget snitt, z +1,7, 79 m) – åt samma håll i båda halvorna men svagt

### AZ Alkmaar

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 59,1 %). 226 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,43 mål för (xG 0,46), 0,29 emot (xG 0,19), 8,57 hörnor · 2025/26 (34 m): 0,27 mål för (xG 0,34), 0,27 emot (xG 0,15), 5,76 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 61 | 2,05–1,36 | −0,08 | −0,10 (−0,6) | +4 pe | +8 pe | +0,08 / −0,32  |
| Balanserat | 111 | 1,86–1,21 | +0,08 | +0,06 (+0,5) | −5 pe | +3 pe | +0,04 / +0,08 ✔ |
| Bollinnehav | 54 | 1,89–1,07 | +0,02 | −0,00 (−0,0) | +1 pe | +6 pe | −0,11 / +0,10  |
| Kortpass | 49 | 2,10–1,49 | −0,14 | −0,16 (−0,9) | +4 pe | +8 pe | −0,02 / −0,20 ✔ |
| Blandat | 100 | 1,80–1,06 | +0,16 | +0,14 (+1,1) | −7 pe | +1 pe | +0,18 / +0,10 ✔ |
| Direktspel | 77 | 1,95–1,25 | −0,05 | −0,07 (−0,6) | +3 pe | +8 pe | −0,11 / +0,02  |
| Lågpress | 51 | 1,96–1,18 | +0,13 | +0,11 (+0,6) | +4 pe | +3 pe | +0,05 / +0,28 ✔ |
| Mellanpress | 100 | 1,95–1,33 | −0,15 | −0,18 (−1,4) | −0 pe | +6 pe | −0,21 / −0,14 ✔ |
| Högpress | 75 | 1,84–1,09 | +0,18 | +0,16 (+1,1) | −5 pe | +4 pe | +0,32 / +0,06 ✔ |
| Svag på fasta | 61 | 2,02–1,38 | +0,05 | +0,03 (+0,2) | −2 pe | +12 pe | +0,09 / −0,14  |
| Medel på fasta | 97 | 1,81–1,04 | +0,16 | +0,14 (+1,1) | +0 pe | −4 pe | +0,12 / +0,15 ✔ |
| Farlig på fasta | 68 | 1,97–1,32 | −0,20 | −0,22 (−1,5) | −2 pe | +11 pe | −0,24 / −0,21 ✔ |
| Stark mot fasta | 81 | 1,91–1,25 | −0,16 | −0,19 (−1,3) | +3 pe | +9 pe | −0,13 / −0,25 ✔ |
| Medel mot fasta | 92 | 1,98–1,14 | +0,17 | +0,15 (+1,2) | +0 pe | +3 pe | +0,16 / +0,14 ✔ |
| Svag mot fasta | 53 | 1,81–1,30 | +0,05 | +0,03 (+0,2) | −10 pe | +2 pe | +0,05 / −0,02  |

- Svårast mot **Farlig på fasta** (−0,22 p/match rel. eget snitt, z −1,5, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,15 p/match rel. eget snitt, z +1,2, 92 m) – åt samma håll i båda halvorna men svagt

### Excelsior

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Direktspel, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 40,8 %). 61 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,71 mål för (xG 0,23), 0,00 emot (xG 0,20), 4,29 hörnor · 2025/26 (34 m): 0,18 mål för (xG 0,30), 0,32 emot (xG 0,26), 4,09 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 13 | 0,92–2,08 | −0,16 | −0,14 (−0,6) | +5 pe | −11 pe | −0,03 / −0,19  |
| Balanserat | 30 | 1,50–2,33 | +0,04 | +0,06 (+0,3) | +12 pe | +16 pe | −0,03 / +0,14  |
| Bollinnehav | 18 | 1,61–2,33 | −0,02 | +0,00 (+0,0) | +0 pe | +15 pe | +0,24 / −0,47  |
| Kortpass | 7 | 1,71–2,14 | +0,03 | +0,05 (+0,1) | +35 pe | +23 pe | +2,42 / −0,34  |
| Blandat | 24 | 1,50–2,33 | +0,08 | +0,10 (+0,5) | +10 pe | +19 pe | +0,43 / +0,02 ✔ |
| Direktspel | 30 | 1,27–2,27 | −0,12 | −0,10 (−0,5) | −2 pe | −1 pe | −0,09 / −0,10 ✔ |
| Lågpress | 21 | 1,19–2,19 | −0,08 | −0,06 (−0,2) | −8 pe | −4 pe | −0,10 / +0,60  |
| Mellanpress | 27 | 1,74–2,30 | +0,19 | +0,21 (+1,0) | +17 pe | +19 pe | +0,43 / +0,08 ✔ |
| Högpress | 13 | 1,08–2,38 | −0,36 | −0,34 (−1,8) | +11 pe | +14 pe | – / −0,34  |
| Svag på fasta | 11 | 0,91–2,09 | −0,17 | −0,15 (−0,5) | +16 pe | −7 pe | −0,33 / +0,07  |
| Medel på fasta | 22 | 1,59–2,41 | +0,12 | +0,14 (+0,6) | +7 pe | +19 pe | +0,18 / +0,11 ✔ |
| Farlig på fasta | 28 | 1,46–2,25 | −0,07 | −0,05 (−0,2) | +3 pe | +9 pe | +0,18 / −0,32  |
| Stark mot fasta | 18 | 1,61–2,22 | +0,18 | +0,20 (+0,7) | +6 pe | +17 pe | +1,18 / −0,18  |
| Medel mot fasta | 20 | 1,10–2,25 | −0,34 | −0,32 (−1,3) | −17 pe | +4 pe | −0,68 / +0,04  |
| Svag mot fasta | 23 | 1,52–2,35 | +0,10 | +0,12 (+0,6) | +29 pe | +9 pe | +0,22 / −0,05  |

- Svårast mot **Medel mot fasta** (−0,32 p/match rel. eget snitt, z −1,3, 20 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +1,0, 27 m) – åt samma håll i båda halvorna men svagt

### Feyenoord

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 56,2 %). 229 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,59), 0,14 emot (xG 0,13), 6,14 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,38), 0,12 emot (xG 0,15), 7,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 2,24–0,88 | +0,32 | +0,30 (+2,6) | +6 pe | −3 pe | +0,38 / +0,23 ✔ ⚑ |
| Balanserat | 100 | 2,05–1,16 | −0,14 | −0,16 (−1,4) | +4 pe | −5 pe | −0,44 / +0,12  |
| Bollinnehav | 61 | 2,30–1,30 | −0,05 | −0,08 (−0,5) | +0 pe | +5 pe | +0,02 / −0,18  |
| Kortpass | 45 | 1,98–1,00 | −0,04 | −0,07 (−0,4) | +9 pe | −15 pe | +0,47 / −0,22  |
| Blandat | 112 | 2,30–1,25 | +0,12 | +0,10 (+0,9) | +1 pe | +4 pe | −0,10 / +0,28  |
| Direktspel | 72 | 2,08–0,97 | −0,09 | −0,11 (−0,8) | +3 pe | −3 pe | −0,16 / −0,01 ✔ |
| Lågpress | 47 | 1,89–1,21 | −0,18 | −0,21 (−1,1) | +5 pe | −1 pe | −0,09 / −0,50 ✔ |
| Mellanpress | 113 | 2,26–1,13 | +0,06 | +0,04 (+0,4) | +3 pe | −3 pe | −0,05 / +0,11  |
| Högpress | 69 | 2,22–1,01 | +0,10 | +0,08 (+0,6) | +2 pe | −1 pe | −0,11 / +0,20  |
| Svag på fasta | 61 | 1,93–1,00 | −0,11 | −0,14 (−1,0) | +3 pe | −11 pe | −0,16 / −0,08 ✔ |
| Medel på fasta | 100 | 2,26–0,97 | +0,18 | +0,16 (+1,5) | +0 pe | −1 pe | +0,18 / +0,14 ✔ |
| Farlig på fasta | 68 | 2,25–1,43 | −0,09 | −0,11 (−0,7) | +8 pe | +4 pe | −0,24 / +0,03  |
| Stark mot fasta | 86 | 2,20–1,06 | +0,08 | +0,06 (+0,5) | +6 pe | −2 pe | −0,02 / +0,13  |
| Medel mot fasta | 87 | 2,18–1,11 | −0,09 | −0,11 (−0,9) | +1 pe | −4 pe | −0,36 / +0,06  |
| Svag mot fasta | 56 | 2,11–1,20 | +0,11 | +0,09 (+0,6) | +3 pe | +2 pe | +0,15 / −0,02  |

- Svårast mot **Balanserat** (−0,16 p/match rel. eget snitt, z −1,4, 100 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,30 p/match rel. eget snitt, z +2,6, 68 m) – ⚑ håller i båda halvorna

### For Sittard

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 35,7 %). 200 matcher med stil, mot marknaden totalt +0,05 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,10), 0,71 emot (xG 0,53), 2,14 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,29), 0,29 emot (xG 0,41), 4,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 62 | 1,23–1,77 | +0,11 | +0,06 (+0,4) | +3 pe | −5 pe | −0,11 / +0,26  |
| Balanserat | 89 | 1,22–2,03 | +0,10 | +0,05 (+0,4) | −6 pe | +12 pe | +0,23 / −0,11  |
| Bollinnehav | 49 | 1,18–1,96 | −0,12 | −0,17 (−1,1) | +6 pe | +4 pe | −0,04 / −0,29 ✔ |
| Kortpass | 45 | 1,22–1,96 | −0,02 | −0,07 (−0,4) | −1 pe | +5 pe | −0,07 / −0,07 ✔ |
| Blandat | 108 | 1,13–2,00 | +0,01 | −0,04 (−0,4) | +2 pe | +4 pe | −0,04 / −0,04 ✔ |
| Direktspel | 47 | 1,40–1,77 | +0,21 | +0,16 (+0,9) | −5 pe | +6 pe | +0,22 / −0,02  |
| Lågpress | 36 | 0,97–2,42 | −0,18 | −0,23 (−1,6) | +1 pe | +1 pe | +0,02 / −0,58  |
| Mellanpress | 93 | 1,35–1,73 | +0,11 | +0,06 (+0,5) | −0 pe | +5 pe | +0,01 / +0,11 ✔ |
| Högpress | 71 | 1,15–1,96 | +0,09 | +0,03 (+0,2) | −1 pe | +6 pe | +0,11 / −0,04  |
| Svag på fasta | 60 | 1,18–2,00 | +0,07 | +0,02 (+0,1) | −6 pe | +4 pe | +0,02 / +0,02 ✔ |
| Medel på fasta | 91 | 1,24–1,86 | +0,03 | −0,02 (−0,2) | +1 pe | +9 pe | +0,06 / −0,09  |
| Farlig på fasta | 49 | 1,20–2,00 | +0,06 | +0,01 (+0,1) | +5 pe | −2 pe | +0,09 / −0,03  |
| Stark mot fasta | 76 | 1,18–1,91 | −0,03 | −0,08 (−0,6) | −1 pe | +5 pe | −0,08 / −0,07 ✔ |
| Medel mot fasta | 78 | 1,23–1,85 | +0,15 | +0,10 (+0,8) | −1 pe | −1 pe | +0,28 / −0,02  |
| Svag mot fasta | 46 | 1,24–2,13 | +0,01 | −0,04 (−0,3) | +3 pe | +14 pe | −0,03 / −0,07 ✔ |

- Svårast mot **Lågpress** (−0,23 p/match rel. eget snitt, z −1,6, 36 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,16 p/match rel. eget snitt, z +0,9, 47 m) – inte stabilt, troligen slump

### Go Ahead Eagles

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 53,3 %). 117 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,71 mål för (xG 0,43), 0,57 emot (xG 0,27), 6,00 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,31), 0,35 emot (xG 0,37), 5,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 35 | 1,43–1,86 | −0,12 | −0,11 (−0,7) | +14 pe | +12 pe | −0,33 / +0,10  |
| Balanserat | 55 | 1,64–1,56 | +0,12 | +0,14 (+0,9) | −0 pe | −6 pe | +0,41 / −0,13  |
| Bollinnehav | 27 | 1,30–1,78 | −0,15 | −0,14 (−0,8) | +25 pe | −5 pe | −0,27 / −0,00 ✔ |
| Kortpass | 37 | 1,59–1,43 | +0,08 | +0,10 (+0,6) | +22 pe | −9 pe | +0,60 / +0,00 ✔ |
| Blandat | 58 | 1,55–2,07 | −0,13 | −0,11 (−0,9) | +5 pe | +8 pe | −0,06 / −0,19 ✔ |
| Direktspel | 22 | 1,18–1,18 | +0,12 | +0,13 (+0,5) | +3 pe | −7 pe | +0,01 / +0,66  |
| Lågpress | 13 | 1,38–2,00 | −0,17 | −0,16 (−0,5) | +8 pe | +0 pe | −0,71 / −0,06  |
| Mellanpress | 60 | 1,52–1,60 | −0,05 | −0,04 (−0,3) | +13 pe | −3 pe | +0,09 / −0,12  |
| Högpress | 44 | 1,50–1,75 | +0,08 | +0,10 (+0,6) | +6 pe | +3 pe | +0,03 / +0,24 ✔ |
| Svag på fasta | 19 | 1,42–2,00 | −0,03 | −0,01 (−0,1) | −13 pe | −4 pe | +0,34 / −0,22  |
| Medel på fasta | 64 | 1,55–1,63 | +0,01 | +0,03 (+0,2) | +15 pe | +4 pe | −0,10 / +0,16  |
| Farlig på fasta | 34 | 1,44–1,68 | −0,06 | −0,05 (−0,3) | +14 pe | −7 pe | +0,15 / −0,27  |
| Stark mot fasta | 39 | 1,44–1,36 | +0,13 | +0,14 (+0,8) | +14 pe | −10 pe | +0,05 / +0,23 ✔ |
| Medel mot fasta | 59 | 1,59–1,83 | −0,06 | −0,05 (−0,4) | +12 pe | +7 pe | +0,10 / −0,20  |
| Svag mot fasta | 19 | 1,32–2,00 | −0,15 | −0,13 (−0,6) | −7 pe | −3 pe | −0,20 / −0,06 ✔ |

- Svårast mot **Blandat** (−0,11 p/match rel. eget snitt, z −0,9, 58 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,14 p/match rel. eget snitt, z +0,9, 55 m) – inte stabilt, troligen slump

### Groningen

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 49,4 %). 173 matcher med stil, mot marknaden totalt −0,12 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,17), 0,00 emot (xG 0,23), 4,43 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,39), 0,21 emot (xG 0,18), 6,24 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 47 | 1,11–1,60 | −0,18 | −0,06 (−0,3) | −11 pe | +11 pe | −0,11 / +0,00  |
| Balanserat | 78 | 1,06–1,47 | −0,05 | +0,06 (+0,5) | −3 pe | −11 pe | +0,40 / −0,20  |
| Bollinnehav | 48 | 1,19–1,46 | −0,16 | −0,04 (−0,3) | +4 pe | −16 pe | +0,08 / −0,18  |
| Kortpass | 34 | 1,24–1,41 | −0,15 | −0,04 (−0,2) | +7 pe | −4 pe | +0,11 / −0,08  |
| Blandat | 80 | 0,96–1,69 | −0,13 | −0,01 (−0,1) | −3 pe | −11 pe | +0,07 / −0,09  |
| Direktspel | 59 | 1,24–1,31 | −0,08 | +0,04 (+0,2) | −9 pe | −2 pe | +0,23 / −0,35  |
| Lågpress | 51 | 0,98–1,35 | −0,23 | −0,11 (−0,7) | +3 pe | −17 pe | −0,03 / −0,30 ✔ |
| Mellanpress | 74 | 1,24–1,42 | −0,06 | +0,06 (+0,4) | −5 pe | −2 pe | +0,26 / −0,16  |
| Högpress | 48 | 1,04–1,79 | −0,09 | +0,03 (+0,2) | −6 pe | −3 pe | +0,29 / −0,06  |
| Svag på fasta | 51 | 1,04–1,65 | −0,41 | −0,29 (−1,8) | −3 pe | −2 pe | −0,10 / −0,56 ✔ |
| Medel på fasta | 70 | 1,06–1,46 | −0,04 | +0,08 (+0,5) | −2 pe | −14 pe | +0,18 / +0,02 ✔ |
| Farlig på fasta | 52 | 1,25–1,42 | +0,07 | +0,19 (+1,1) | −5 pe | −1 pe | +0,36 / −0,10  |
| Stark mot fasta | 57 | 1,09–1,51 | −0,14 | −0,02 (−0,1) | −2 pe | −4 pe | +0,16 / −0,20  |
| Medel mot fasta | 67 | 1,12–1,70 | −0,23 | −0,12 (−0,8) | −8 pe | +2 pe | −0,15 / −0,10 ✔ |
| Svag mot fasta | 49 | 1,12–1,22 | +0,06 | +0,18 (+1,1) | +2 pe | −21 pe | +0,32 / −0,18  |

- Svårast mot **Svag på fasta** (−0,29 p/match rel. eget snitt, z −1,8, 51 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,19 p/match rel. eget snitt, z +1,1, 52 m) – inte stabilt, troligen slump

### Heerenveen

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 54,1 %). 230 matcher med stil, mot marknaden totalt −0,14 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,24), 0,00 emot (xG 0,07), 5,14 hörnor · 2025/26 (34 m): 0,21 mål för (xG 0,31), 0,29 emot (xG 0,23), 5,56 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,25–1,70 | −0,12 | +0,02 (+0,1) | +10 pe | +1 pe | +0,25 / −0,22  |
| Balanserat | 107 | 1,43–1,88 | −0,15 | −0,00 (−0,0) | +4 pe | +4 pe | −0,00 / −0,01 ✔ |
| Bollinnehav | 54 | 1,31–1,72 | −0,16 | −0,02 (−0,1) | +2 pe | −6 pe | −0,17 / +0,13  |
| Kortpass | 43 | 1,16–1,56 | −0,26 | −0,11 (−0,7) | +13 pe | −9 pe | −0,06 / −0,13 ✔ |
| Blandat | 109 | 1,33–1,95 | −0,17 | −0,02 (−0,2) | +1 pe | +2 pe | −0,01 / −0,03 ✔ |
| Direktspel | 78 | 1,47–1,68 | −0,05 | +0,09 (+0,7) | +8 pe | +4 pe | +0,09 / +0,09 ✔ |
| Lågpress | 56 | 1,64–1,80 | −0,05 | +0,10 (+0,7) | +16 pe | +3 pe | +0,12 / +0,03 ✔ |
| Mellanpress | 98 | 1,31–1,71 | −0,11 | +0,03 (+0,2) | +5 pe | −5 pe | +0,04 / +0,02 ✔ |
| Högpress | 76 | 1,18–1,87 | −0,25 | −0,11 (−0,8) | −2 pe | +6 pe | −0,08 / −0,12 ✔ |
| Svag på fasta | 66 | 1,33–1,58 | −0,05 | +0,09 (+0,7) | +7 pe | −6 pe | +0,17 / −0,09  |
| Medel på fasta | 95 | 1,40–1,78 | −0,05 | +0,09 (+0,8) | +4 pe | +5 pe | −0,02 / +0,16  |
| Farlig på fasta | 69 | 1,29–2,00 | −0,36 | −0,22 (−1,6) | +5 pe | +1 pe | −0,09 / −0,33 ✔ |
| Stark mot fasta | 89 | 1,28–1,53 | −0,10 | +0,04 (+0,4) | +7 pe | −5 pe | +0,12 / −0,04  |
| Medel mot fasta | 90 | 1,40–1,79 | −0,13 | +0,02 (+0,1) | +5 pe | +4 pe | +0,12 / −0,05  |
| Svag mot fasta | 51 | 1,37–2,24 | −0,25 | −0,10 (−0,7) | +3 pe | +5 pe | −0,17 / +0,02  |

- Svårast mot **Farlig på fasta** (−0,22 p/match rel. eget snitt, z −1,6, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,09 p/match rel. eget snitt, z +0,8, 95 m) – inte stabilt, troligen slump

### Nijmegen

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 61,0 %). 117 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,13), 0,14 emot (xG 0,36), 5,00 hörnor · 2025/26 (34 m): 0,35 mål för (xG 0,31), 0,32 emot (xG 0,33), 6,12 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 35 | 1,57–1,91 | −0,21 | −0,23 (−0,9) | −4 pe | +14 pe | −0,02 / −0,42 ✔ |
| Balanserat | 55 | 1,71–1,27 | +0,13 | +0,11 (+0,8) | +14 pe | −6 pe | −0,03 / +0,28  |
| Bollinnehav | 27 | 1,52–1,59 | +0,07 | +0,06 (+0,3) | +18 pe | −2 pe | −0,13 / +0,21  |
| Kortpass | 31 | 1,77–1,35 | +0,07 | +0,05 (+0,2) | +12 pe | −1 pe | −0,26 / +0,07  |
| Blandat | 63 | 1,59–1,75 | −0,05 | −0,06 (−0,4) | +2 pe | +9 pe | −0,20 / +0,16  |
| Direktspel | 23 | 1,52–1,22 | +0,11 | +0,10 (+0,4) | +28 pe | −16 pe | +0,31 / −0,65  |
| Lågpress | 15 | 1,87–1,33 | +0,36 | +0,35 (+1,2) | +24 pe | −4 pe | −0,33 / +0,45  |
| Mellanpress | 55 | 1,56–1,49 | +0,00 | −0,01 (−0,1) | +5 pe | −1 pe | −0,03 / −0,00 ✔ |
| Högpress | 47 | 1,62–1,66 | −0,08 | −0,10 (−0,6) | +10 pe | +5 pe | −0,05 / −0,21 ✔ |
| Svag på fasta | 18 | 2,22–1,33 | +0,59 | +0,57 (+1,8) | −12 pe | +23 pe | +0,64 / +0,54 ✔ |
| Medel på fasta | 65 | 1,45–1,48 | −0,05 | −0,06 (−0,4) | +12 pe | −2 pe | −0,22 / +0,11  |
| Farlig på fasta | 34 | 1,65–1,76 | −0,17 | −0,19 (−0,9) | +16 pe | −5 pe | +0,05 / −0,45  |
| Stark mot fasta | 43 | 1,40–1,47 | −0,04 | −0,05 (−0,3) | +5 pe | −5 pe | −0,19 / +0,07  |
| Medel mot fasta | 57 | 1,84–1,53 | +0,03 | +0,02 (+0,1) | +12 pe | +6 pe | +0,01 / +0,02 ✔ |
| Svag mot fasta | 17 | 1,47–1,76 | +0,09 | +0,07 (+0,2) | +13 pe | +3 pe | +0,08 / +0,06 ✔ |

- Svårast mot **Backar hem** (−0,23 p/match rel. eget snitt, z −0,9, 35 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,57 p/match rel. eget snitt, z +1,8, 18 m) – åt samma håll i båda halvorna men svagt

### PSV Eindhoven

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 63,7 %). 231 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,36), 0,00 emot (xG 0,26), 7,57 hörnor · 2025/26 (34 m): 0,53 mål för (xG 0,43), 0,27 emot (xG 0,23), 7,15 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 61 | 2,74–1,03 | +0,25 | +0,09 (+0,7) | −5 pe | +10 pe | +0,07 / +0,11 ✔ |
| Balanserat | 115 | 2,67–1,18 | +0,11 | −0,05 (−0,5) | +3 pe | +10 pe | −0,18 / +0,08  |
| Bollinnehav | 55 | 2,64–0,93 | +0,15 | −0,00 (−0,0) | −8 pe | +3 pe | +0,03 / −0,04  |
| Kortpass | 47 | 2,77–1,19 | +0,15 | −0,00 (−0,0) | −5 pe | +13 pe | +0,04 / −0,01  |
| Blandat | 108 | 2,60–1,15 | +0,17 | +0,01 (+0,1) | −1 pe | +7 pe | −0,25 / +0,23  |
| Direktspel | 76 | 2,74–0,92 | +0,14 | −0,02 (−0,2) | −1 pe | +7 pe | +0,08 / −0,34  |
| Lågpress | 53 | 2,36–1,11 | +0,03 | −0,12 (−0,8) | −0 pe | +5 pe | −0,17 / −0,01 ✔ |
| Mellanpress | 107 | 2,77–1,10 | +0,06 | −0,10 (−0,9) | −1 pe | +8 pe | −0,08 / −0,11 ✔ |
| Högpress | 71 | 2,79–1,03 | +0,39 | +0,24 (+2,4) | −5 pe | +11 pe | +0,13 / +0,30 ✔ ⚑ |
| Svag på fasta | 62 | 2,44–1,08 | +0,09 | −0,06 (−0,5) | −4 pe | +2 pe | −0,08 / −0,01 ✔ |
| Medel på fasta | 106 | 2,71–1,09 | +0,18 | +0,02 (+0,2) | −1 pe | +10 pe | −0,04 / +0,06  |
| Farlig på fasta | 63 | 2,87–1,06 | +0,18 | +0,03 (+0,2) | −1 pe | +10 pe | −0,05 / +0,09  |
| Stark mot fasta | 86 | 2,70–0,99 | +0,13 | −0,02 (−0,2) | +1 pe | +5 pe | −0,05 / +0,00  |
| Medel mot fasta | 91 | 2,84–1,19 | +0,25 | +0,09 (+0,8) | −6 pe | +12 pe | +0,05 / +0,12 ✔ |
| Svag mot fasta | 54 | 2,39–1,06 | +0,04 | −0,12 (−0,8) | +2 pe | +7 pe | −0,17 / +0,00  |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −0,9, 107 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,24 p/match rel. eget snitt, z +2,4, 71 m) – ⚑ håller i båda halvorna

### Sparta Rotterdam

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 45,4 %). 181 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (7 m): 0,29 mål för (xG 0,40), 0,71 emot (xG 0,43), 6,00 hörnor · 2025/26 (34 m): 0,21 mål för (xG 0,27), 0,27 emot (xG 0,20), 4,56 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 48 | 1,23–1,50 | −0,04 | −0,07 (−0,4) | −2 pe | −3 pe | −0,03 / −0,11 ✔ |
| Balanserat | 87 | 1,34–1,47 | +0,10 | +0,06 (+0,5) | +7 pe | −3 pe | −0,02 / +0,16  |
| Bollinnehav | 46 | 1,33–1,52 | −0,01 | −0,04 (−0,3) | +4 pe | −6 pe | +0,48 / −0,62  |
| Kortpass | 48 | 1,13–1,60 | −0,13 | −0,17 (−1,0) | +10 pe | −18 pe | +0,14 / −0,25  |
| Blandat | 96 | 1,24–1,48 | +0,03 | −0,01 (−0,1) | +3 pe | −6 pe | +0,00 / −0,03  |
| Direktspel | 37 | 1,73–1,38 | +0,29 | +0,25 (+1,3) | −3 pe | +17 pe | +0,30 / +0,09 ✔ |
| Lågpress | 18 | 1,06–1,72 | +0,11 | +0,07 (+0,3) | +15 pe | −13 pe | −0,15 / +0,25  |
| Mellanpress | 93 | 1,37–1,44 | +0,02 | −0,02 (−0,2) | +4 pe | −5 pe | +0,33 / −0,29  |
| Högpress | 70 | 1,30–1,50 | +0,05 | +0,01 (+0,1) | +0 pe | −0 pe | −0,05 / +0,10  |
| Svag på fasta | 50 | 1,06–1,36 | −0,14 | −0,18 (−1,2) | +6 pe | −21 pe | −0,12 / −0,32 ✔ |
| Medel på fasta | 87 | 1,51–1,41 | +0,24 | +0,20 (+1,5) | +1 pe | +5 pe | +0,41 / +0,01 ✔ |
| Farlig på fasta | 44 | 1,20–1,80 | −0,15 | −0,19 (−1,3) | +7 pe | −2 pe | −0,23 / −0,18 ✔ |
| Stark mot fasta | 74 | 1,34–1,41 | +0,02 | −0,02 (−0,2) | +3 pe | −7 pe | +0,01 / −0,07  |
| Medel mot fasta | 78 | 1,29–1,46 | +0,07 | +0,03 (+0,2) | +4 pe | −0 pe | +0,13 / −0,05  |
| Svag mot fasta | 29 | 1,28–1,79 | +0,02 | −0,02 (−0,1) | +5 pe | −6 pe | +0,36 / −0,38  |

- Svårast mot **Farlig på fasta** (−0,19 p/match rel. eget snitt, z −1,3, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,20 p/match rel. eget snitt, z +1,5, 87 m) – åt samma håll i båda halvorna men svagt

### Telstar

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 40,8 %). 6 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,34), 0,29 emot (xG 0,30), 4,14 hörnor · 2025/26 (34 m): 0,41 mål för (xG 0,41), 0,38 emot (xG 0,34), 4,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 1 | 0,00–1,00 | −0,44 | −0,34 (−3,4) | −15 pe | −73 pe | – / −0,34  |
| Balanserat | 4 | 0,25–2,00 | −0,63 | −0,52 (−1,7) | +5 pe | −19 pe | −1,04 / −0,01  |
| Bollinnehav | 1 | 2,00–1,00 | +2,33 | +2,43 (+24,3) | −19 pe | +30 pe | +2,43 / –  |
| Kortpass | 3 | 0,67–1,67 | +0,60 | +0,70 (+1,0) | +13 pe | −3 pe | +0,91 / +0,29  |
| Blandat | 3 | 0,33–1,67 | −0,81 | −0,70 (−2,3) | −18 pe | −36 pe | −1,46 / −0,32  |
| Lågpress | 2 | 0,00–2,50 | −0,58 | −0,47 (−5,0) | −17 pe | −21 pe | −0,61 / −0,34  |
| Mellanpress | 2 | 0,50–2,00 | −0,99 | −0,89 (−2,2) | −20 pe | −18 pe | −1,46 / −0,31  |
| Högpress | 2 | 1,00–0,50 | +1,25 | +1,36 (+1,8) | +30 pe | −19 pe | +2,43 / +0,29  |
| Svag på fasta | 3 | 0,00–2,00 | −0,52 | −0,42 (−5,4) | −16 pe | −39 pe | −0,61 / −0,32  |
| Medel på fasta | 3 | 1,00–1,33 | +0,31 | +0,42 (+0,5) | +11 pe | +0 pe | +0,48 / +0,29  |
| Stark mot fasta | 1 | 1,00–3,00 | −1,57 | −1,46 (−14,6) | −25 pe | +39 pe | −1,46 / –  |
| Medel mot fasta | 3 | 0,00–0,67 | −0,23 | −0,12 (−0,7) | +17 pe | −72 pe | – / −0,12  |
| Svag mot fasta | 2 | 1,00–2,50 | +0,81 | +0,91 (+0,8) | −19 pe | +30 pe | +0,91 / –  |

### Twente

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 57,9 %). 179 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,44), 0,00 emot (xG 0,13), 7,43 hörnor · 2025/26 (34 m): 0,18 mål för (xG 0,34), 0,27 emot (xG 0,18), 5,35 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,48–1,17 | −0,00 | −0,10 (−0,7) | +4 pe | −12 pe | −0,07 / −0,14 ✔ |
| Balanserat | 84 | 1,98–1,19 | +0,25 | +0,15 (+1,2) | +8 pe | +7 pe | +0,26 / +0,04 ✔ |
| Bollinnehav | 41 | 1,73–1,44 | −0,07 | −0,17 (−0,9) | −1 pe | −1 pe | −0,03 / −0,31 ✔ |
| Kortpass | 44 | 1,80–1,34 | −0,04 | −0,14 (−0,8) | +9 pe | −3 pe | +0,39 / −0,26  |
| Blandat | 91 | 1,70–1,31 | +0,11 | +0,01 (+0,1) | +4 pe | +0 pe | −0,01 / +0,03  |
| Direktspel | 44 | 1,89–1,00 | +0,22 | +0,12 (+0,7) | +2 pe | +1 pe | +0,17 / −0,08  |
| Lågpress | 20 | 2,05–1,15 | +0,51 | +0,41 (+1,8) | +16 pe | +1 pe | +0,79 / +0,16 ✔ |
| Mellanpress | 90 | 1,64–1,34 | −0,17 | −0,27 (−2,1) | +4 pe | −1 pe | −0,14 / −0,39 ✔ ⚑ |
| Högpress | 69 | 1,86–1,13 | +0,33 | +0,23 (+1,7) | +2 pe | +0 pe | +0,20 / +0,27 ✔ |
| Svag på fasta | 50 | 1,68–1,44 | +0,00 | −0,10 (−0,6) | +9 pe | +1 pe | +0,08 / −0,48  |
| Medel på fasta | 85 | 1,75–0,86 | +0,28 | +0,18 (+1,4) | +2 pe | −7 pe | +0,18 / +0,19 ✔ |
| Farlig på fasta | 44 | 1,91–1,75 | −0,14 | −0,24 (−1,6) | +5 pe | +12 pe | −0,19 / −0,26 ✔ |
| Stark mot fasta | 75 | 1,77–1,40 | +0,01 | −0,09 (−0,7) | +8 pe | +5 pe | −0,07 / −0,11 ✔ |
| Medel mot fasta | 75 | 1,87–1,12 | +0,20 | +0,10 (+0,8) | +6 pe | −5 pe | +0,27 / −0,03  |
| Svag mot fasta | 29 | 1,52–1,14 | +0,06 | −0,04 (−0,2) | −10 pe | −3 pe | +0,13 / −0,26  |

- Svårast mot **Mellanpress** (−0,27 p/match rel. eget snitt, z −2,1, 90 m) – ⚑ håller i båda halvorna
- Bäst mot **Lågpress** (+0,41 p/match rel. eget snitt, z +1,8, 20 m) – åt samma håll i båda halvorna men svagt

### Utrecht

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 43,7 %). 228 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026/27 (7 m): 0,57 mål för (xG 0,23), 0,71 emot (xG 0,36), 3,29 hörnor · 2025/26 (34 m): 0,41 mål för (xG 0,38), 0,15 emot (xG 0,19), 5,18 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,59–1,50 | −0,13 | −0,11 (−0,7) | +10 pe | −3 pe | −0,10 / −0,13 ✔ |
| Balanserat | 112 | 1,44–1,41 | −0,05 | −0,04 (−0,4) | +7 pe | −5 pe | −0,33 / +0,24  |
| Bollinnehav | 60 | 1,97–1,50 | +0,17 | +0,18 (+1,3) | +9 pe | +6 pe | +0,30 / +0,06 ✔ |
| Kortpass | 50 | 1,50–1,24 | +0,19 | +0,20 (+1,2) | +11 pe | −12 pe | +0,22 / +0,19 ✔ |
| Blandat | 105 | 1,55–1,70 | −0,07 | −0,06 (−0,5) | +6 pe | +1 pe | −0,07 / −0,05 ✔ |
| Direktspel | 73 | 1,78–1,25 | −0,06 | −0,05 (−0,4) | +9 pe | +3 pe | −0,19 / +0,37  |
| Lågpress | 55 | 1,82–1,49 | −0,05 | −0,04 (−0,2) | +5 pe | +8 pe | −0,05 / +0,01  |
| Mellanpress | 102 | 1,63–1,41 | +0,09 | +0,10 (+0,9) | +7 pe | −3 pe | −0,12 / +0,29  |
| Högpress | 71 | 1,44–1,49 | −0,13 | −0,12 (−0,9) | +12 pe | −6 pe | −0,14 / −0,10 ✔ |
| Svag på fasta | 66 | 1,53–1,42 | −0,19 | −0,18 (−1,3) | +12 pe | −5 pe | −0,24 / −0,02 ✔ |
| Medel på fasta | 103 | 1,60–1,48 | +0,06 | +0,07 (+0,6) | +8 pe | +1 pe | −0,09 / +0,16  |
| Farlig på fasta | 59 | 1,73–1,46 | +0,07 | +0,08 (+0,5) | +4 pe | −1 pe | +0,13 / +0,04 ✔ |
| Stark mot fasta | 88 | 1,63–1,42 | −0,08 | −0,07 (−0,5) | +14 pe | −0 pe | −0,23 / +0,12  |
| Medel mot fasta | 88 | 1,50–1,41 | +0,05 | +0,06 (+0,4) | +3 pe | −3 pe | −0,09 / +0,16  |
| Svag mot fasta | 52 | 1,79–1,60 | +0,00 | +0,02 (+0,1) | +6 pe | +1 pe | +0,07 / −0,08  |

- Svårast mot **Svag på fasta** (−0,18 p/match rel. eget snitt, z −1,3, 66 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,18 p/match rel. eget snitt, z +1,3, 60 m) – åt samma håll i båda halvorna men svagt

### Zwolle

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 40,1 %). 175 matcher med stil, mot marknaden totalt −0,03 per match.

Fasta situationer per match: 2026/27 (7 m): 0,14 mål för (xG 0,19), 0,71 emot (xG 0,44), 4,14 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,27), 0,32 emot (xG 0,34), 3,59 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 1,25–1,98 | +0,01 | +0,04 (+0,3) | +2 pe | +1 pe | −0,15 / +0,25  |
| Balanserat | 88 | 1,09–1,78 | −0,05 | −0,01 (−0,1) | −2 pe | −13 pe | −0,04 / +0,01  |
| Bollinnehav | 32 | 1,06–1,78 | −0,06 | −0,03 (−0,1) | +18 pe | −17 pe | −0,01 / −0,05 ✔ |
| Kortpass | 39 | 0,87–2,23 | −0,19 | −0,16 (−1,0) | +3 pe | −8 pe | −0,44 / −0,09 ✔ |
| Blandat | 76 | 1,21–1,80 | +0,07 | +0,10 (+0,9) | +9 pe | −6 pe | +0,03 / +0,17 ✔ |
| Direktspel | 60 | 1,22–1,65 | −0,06 | −0,03 (−0,2) | −6 pe | −14 pe | −0,07 / +0,12  |
| Lågpress | 53 | 0,92–2,04 | −0,19 | −0,16 (−1,1) | −9 pe | −12 pe | −0,17 / −0,14 ✔ |
| Mellanpress | 80 | 1,34–1,64 | +0,10 | +0,13 (+1,1) | +11 pe | −9 pe | +0,07 / +0,19 ✔ |
| Högpress | 42 | 1,02–2,00 | −0,08 | −0,05 (−0,3) | +1 pe | −6 pe | −0,19 / +0,01  |
| Svag på fasta | 58 | 0,93–1,66 | +0,03 | +0,06 (+0,4) | −7 pe | −13 pe | +0,12 / −0,02  |
| Medel på fasta | 67 | 1,21–1,97 | −0,12 | −0,09 (−0,7) | +8 pe | −8 pe | −0,43 / +0,06  |
| Farlig på fasta | 50 | 1,28–1,90 | +0,02 | +0,05 (+0,3) | +7 pe | −7 pe | −0,04 / +0,23  |
| Stark mot fasta | 64 | 1,13–1,73 | +0,07 | +0,10 (+0,8) | +12 pe | −8 pe | +0,03 / +0,15 ✔ |
| Medel mot fasta | 64 | 1,02–1,91 | −0,07 | −0,04 (−0,3) | −8 pe | −11 pe | −0,15 / +0,05  |
| Svag mot fasta | 47 | 1,32–1,91 | −0,12 | −0,09 (−0,5) | +5 pe | −8 pe | −0,08 / −0,10 ✔ |

- Svårast mot **Lågpress** (−0,16 p/match rel. eget snitt, z −1,1, 53 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,13 p/match rel. eget snitt, z +1,1, 80 m) – åt samma håll i båda halvorna men svagt
