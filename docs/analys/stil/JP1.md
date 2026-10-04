# Stilmatchning – J1 League (JP1)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1386 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 121 m · hemma −0,09 · kryss +0 pe · ö2,5 – | 180 m · hemma +0,00 · kryss −3 pe · ö2,5 – | 140 m · hemma +0,04 · kryss +4 pe · ö2,5 – |
| **Mellan** | 179 m · hemma +0,10 · kryss −5 pe · ö2,5 – | 202 m · hemma +0,05 · kryss −1 pe · ö2,5 – | 159 m · hemma +0,02 · kryss −2 pe · ö2,5 – |
| **Mycket boll** | 137 m · hemma +0,14 · kryss −2 pe · ö2,5 – | 161 m · hemma +0,02 · kryss +1 pe · ö2,5 – | 107 m · hemma +0,14 · kryss +2 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 234 m · hemma −0,06 · kryss +0 pe · ö2,5 – | 132 m · hemma +0,01 · kryss +0 pe · ö2,5 – | 212 m · hemma +0,10 · kryss +0 pe · ö2,5 – |
| **Balanserat** | 129 m · hemma +0,06 · kryss −6 pe · ö2,5 – | 85 m · hemma +0,04 · kryss −6 pe · ö2,5 – | 117 m · hemma +0,06 · kryss −2 pe · ö2,5 – |
| **Bollinnehav** | 213 m · hemma +0,13 · kryss −0 pe · ö2,5 – | 117 m · hemma −0,15 · kryss −3 pe · ö2,5 – | 147 m · hemma +0,17 · kryss +4 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 356 m · mot marknaden +0,02 (z +0,2) · mål 1,25 · ö2,5 – | 383 m · mot marknaden −0,06 (z −1,0) · mål 1,31 · ö2,5 – | 232 m · mot marknaden +0,00 (z +0,0) · mål 1,33 · ö2,5 – |
| **Medel på fasta** | 468 m · mot marknaden +0,13 (z +2,3) · mål 1,32 · ö2,5 – | 565 m · mot marknaden −0,03 (z −0,6) · mål 1,25 · ö2,5 – | 316 m · mot marknaden −0,01 (z −0,1) · mål 1,41 · ö2,5 – |
| **Farlig på fasta** | 124 m · mot marknaden −0,07 (z −0,7) · mål 1,16 · ö2,5 – | 183 m · mot marknaden −0,01 (z −0,1) · mål 1,23 · ö2,5 – | 145 m · mot marknaden −0,00 (z −0,0) · mål 1,21 · ö2,5 – |

## Lag (säsong 2026/27)

### Avispa Fukuoka

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 40,2 %). 131 matcher med stil, mot marknaden totalt +0,07 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,44), 0,50 emot (xG 0,42), 4,75 hörnor · 2025 (38 m): 0,24 mål för (xG 0,29), 0,18 emot (xG 0,13), 4,13 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 48 | 0,96–0,98 | +0,16 | +0,09 (+0,5) | −2 pe | – | +0,24 / −0,04  |
| Balanserat | 37 | 0,92–1,57 | −0,31 | −0,38 (−1,9) | −14 pe | – | −0,41 / −0,34 ✔ |
| Bollinnehav | 46 | 1,00–1,00 | +0,28 | +0,21 (+1,2) | +3 pe | – | +0,13 / +0,29 ✔ |
| Kortpass | 40 | 1,02–1,23 | +0,17 | +0,09 (+0,5) | −14 pe | – | −0,38 / +0,41  |
| Blandat | 51 | 1,12–1,25 | +0,11 | +0,04 (+0,2) | +1 pe | – | +0,19 / −0,28  |
| Direktspel | 40 | 0,70–0,95 | −0,07 | −0,14 (−0,8) | +2 pe | – | −0,07 / −0,19 ✔ |
| Lågpress | 24 | 1,13–1,29 | +0,07 | +0,00 (+0,0) | −14 pe | – | +0,02 / −0,00  |
| Mellanpress | 64 | 0,95–1,06 | +0,06 | −0,01 (−0,1) | −1 pe | – | +0,14 / −0,14  |
| Högpress | 43 | 0,88–1,21 | +0,08 | +0,01 (+0,1) | −1 pe | – | −0,16 / +0,37  |
| Svag på fasta | 42 | 1,07–0,95 | +0,49 | +0,42 (+2,2) | −7 pe | – | +0,34 / +0,52 ✔ ⚑ |
| Medel på fasta | 72 | 0,99–1,29 | −0,06 | −0,13 (−0,9) | −5 pe | – | −0,15 / −0,12 ✔ |
| Farlig på fasta | 17 | 0,59–1,06 | −0,40 | −0,47 (−2,1) | +10 pe | – | −0,80 / −0,37  |
| Stark mot fasta | 43 | 0,72–0,86 | +0,12 | +0,04 (+0,2) | −0 pe | – | +0,04 / +0,05 ✔ |
| Medel mot fasta | 56 | 0,93–1,32 | −0,07 | −0,14 (−0,9) | −4 pe | – | −0,14 / −0,15 ✔ |
| Svag mot fasta | 32 | 1,34–1,25 | +0,26 | +0,19 (+0,9) | −7 pe | – | +0,18 / +0,19 ✔ |

- Svårast mot **Farlig på fasta** (−0,47 p/match rel. eget snitt, z −2,1, 17 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,42 p/match rel. eget snitt, z +2,2, 42 m) – ⚑ håller i båda halvorna

### Cerezo Osaka

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 56,7 %). 165 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,19), 0,13 emot (xG 0,34), 6,00 hörnor · 2025 (38 m): 0,32 mål för (xG 0,24), 0,32 emot (xG 0,27), 5,63 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,09–1,38 | −0,22 | −0,23 (−1,5) | −2 pe | – | −0,39 / −0,06 ✔ |
| Balanserat | 38 | 1,29–1,34 | +0,06 | +0,05 (+0,2) | −6 pe | – | +0,20 / −0,06  |
| Bollinnehav | 58 | 1,43–1,12 | +0,25 | +0,24 (+1,4) | −1 pe | – | +0,46 / −0,01  |
| Kortpass | 51 | 1,39–1,27 | +0,20 | +0,19 (+1,1) | −1 pe | – | +0,38 / +0,02 ✔ |
| Blandat | 63 | 1,13–1,10 | −0,01 | −0,02 (−0,1) | −1 pe | – | +0,10 / −0,20  |
| Direktspel | 51 | 1,27–1,51 | −0,16 | −0,17 (−1,0) | −7 pe | – | −0,50 / +0,02  |
| Lågpress | 26 | 1,38–1,35 | +0,05 | +0,04 (+0,1) | −8 pe | – | −0,03 / +0,06  |
| Mellanpress | 74 | 1,19–1,26 | −0,01 | −0,02 (−0,1) | −1 pe | – | −0,02 / −0,01 ✔ |
| Högpress | 65 | 1,28–1,28 | +0,01 | +0,00 (+0,0) | −3 pe | – | +0,11 / −0,18  |
| Svag på fasta | 58 | 1,10–1,02 | +0,05 | +0,04 (+0,2) | +0 pe | – | −0,01 / +0,11  |
| Medel på fasta | 81 | 1,31–1,20 | +0,15 | +0,14 (+0,9) | −7 pe | – | +0,30 / +0,01 ✔ |
| Farlig på fasta | 26 | 1,42–2,12 | −0,51 | −0,52 (−2,5) | +4 pe | – | −0,47 / −0,57 ✔ ⚑ |
| Stark mot fasta | 56 | 1,13–1,34 | −0,00 | −0,01 (−0,1) | −8 pe | – | +0,03 / −0,04  |
| Medel mot fasta | 69 | 1,38–1,14 | +0,16 | +0,15 (+0,9) | −1 pe | – | +0,37 / −0,05  |
| Svag mot fasta | 40 | 1,23–1,43 | −0,23 | −0,24 (−1,2) | +3 pe | – | −0,35 / −0,03 ✔ |

- Svårast mot **Farlig på fasta** (−0,52 p/match rel. eget snitt, z −2,5, 26 m) – ⚑ håller i båda halvorna
- Bäst mot **Bollinnehav** (+0,24 p/match rel. eget snitt, z +1,4, 58 m) – inte stabilt, troligen slump

### FC Tokyo

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 51,2 %). 164 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,14), 0,38 emot (xG 0,19), 4,88 hörnor · 2025 (38 m): 0,10 mål för (xG 0,22), 0,37 emot (xG 0,24), 4,42 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,28–1,30 | +0,13 | +0,03 (+0,2) | −3 pe | – | +0,11 / −0,05  |
| Balanserat | 37 | 1,30–1,11 | +0,29 | +0,19 (+0,9) | −10 pe | – | +0,02 / +0,37 ✔ |
| Bollinnehav | 58 | 1,38–1,62 | −0,07 | −0,16 (−1,0) | −2 pe | – | −0,45 / +0,11  |
| Kortpass | 46 | 1,37–1,48 | +0,06 | −0,03 (−0,2) | −9 pe | – | −0,30 / +0,24  |
| Blandat | 60 | 1,35–1,32 | +0,09 | −0,01 (−0,1) | +7 pe | – | −0,02 / +0,01  |
| Direktspel | 58 | 1,24–1,34 | +0,13 | +0,04 (+0,2) | −13 pe | – | −0,04 / +0,08  |
| Lågpress | 28 | 1,61–0,89 | +0,52 | +0,43 (+1,7) | −3 pe | – | +0,20 / +0,55 ✔ |
| Mellanpress | 74 | 1,27–1,28 | +0,15 | +0,06 (+0,4) | −2 pe | – | +0,13 / −0,01  |
| Högpress | 62 | 1,24–1,69 | −0,17 | −0,26 (−1,7) | −8 pe | – | −0,40 / −0,05 ✔ |
| Svag på fasta | 58 | 1,31–1,53 | −0,08 | −0,17 (−1,1) | +5 pe | – | −0,30 / +0,03  |
| Medel på fasta | 80 | 1,23–1,34 | +0,04 | −0,06 (−0,4) | −9 pe | – | −0,27 / +0,09  |
| Farlig på fasta | 26 | 1,62–1,12 | +0,66 | +0,56 (+2,5) | −12 pe | – | +0,79 / +0,29 ✔ ⚑ |
| Stark mot fasta | 57 | 1,53–1,46 | +0,18 | +0,09 (+0,5) | −11 pe | – | −0,43 / +0,44  |
| Medel mot fasta | 64 | 1,11–1,25 | +0,01 | −0,08 (−0,6) | +1 pe | – | −0,06 / −0,11 ✔ |
| Svag mot fasta | 43 | 1,35–1,44 | +0,10 | +0,01 (+0,0) | −4 pe | – | +0,14 / −0,18  |

- Svårast mot **Högpress** (−0,26 p/match rel. eget snitt, z −1,7, 62 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,56 p/match rel. eget snitt, z +2,5, 26 m) – ⚑ håller i båda halvorna

### Gamba Osaka

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 56,5 %). 163 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,28), 0,13 emot (xG 0,55), 4,88 hörnor · 2025 (38 m): 0,24 mål för (xG 0,29), 0,34 emot (xG 0,25), 4,92 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 0,99–1,26 | −0,07 | −0,13 (−0,9) | −3 pe | – | −0,23 / −0,01 ✔ |
| Balanserat | 34 | 0,97–1,71 | −0,14 | −0,20 (−0,9) | −12 pe | – | −0,40 / −0,05 ✔ |
| Bollinnehav | 57 | 1,39–1,37 | +0,34 | +0,28 (+1,6) | −10 pe | – | +0,24 / +0,33 ✔ |
| Kortpass | 44 | 1,32–1,34 | +0,43 | +0,37 (+2,0) | −7 pe | – | +0,33 / +0,40 ✔ |
| Blandat | 63 | 1,29–1,48 | +0,17 | +0,11 (+0,7) | −8 pe | – | −0,11 / +0,43  |
| Direktspel | 56 | 0,79–1,34 | −0,36 | −0,42 (−2,7) | −7 pe | – | −0,46 / −0,38 ✔ ⚑ |
| Lågpress | 29 | 1,14–1,38 | −0,05 | −0,10 (−0,4) | −14 pe | – | −0,33 / −0,01 ✔ |
| Mellanpress | 73 | 1,23–1,37 | +0,13 | +0,07 (+0,4) | −9 pe | – | −0,11 / +0,23  |
| Högpress | 61 | 0,98–1,43 | +0,03 | −0,03 (−0,2) | −3 pe | – | −0,03 / −0,04 ✔ |
| Svag på fasta | 57 | 1,25–1,35 | +0,29 | +0,23 (+1,3) | −11 pe | – | +0,11 / +0,40 ✔ |
| Medel på fasta | 77 | 1,06–1,48 | −0,07 | −0,13 (−0,9) | −9 pe | – | −0,18 / −0,09 ✔ |
| Farlig på fasta | 29 | 1,03–1,24 | −0,06 | −0,12 (−0,6) | +4 pe | – | −0,36 / +0,17  |
| Stark mot fasta | 57 | 1,09–1,09 | +0,25 | +0,19 (+1,1) | −7 pe | – | −0,14 / +0,46  |
| Medel mot fasta | 65 | 1,09–1,57 | −0,05 | −0,11 (−0,7) | −13 pe | – | +0,00 / −0,20  |
| Svag mot fasta | 41 | 1,22–1,54 | −0,04 | −0,10 (−0,5) | +1 pe | – | −0,16 / +0,03  |

- Svårast mot **Direktspel** (−0,42 p/match rel. eget snitt, z −2,7, 56 m) – ⚑ håller i båda halvorna
- Bäst mot **Kortpass** (+0,37 p/match rel. eget snitt, z +2,0, 44 m) – åt samma håll i båda halvorna men svagt

### Kashima Antlers

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 58,2 %). 165 matcher med stil, mot marknaden totalt +0,16 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,25), 0,25 emot (xG 0,20), 4,00 hörnor · 2025 (38 m): 0,26 mål för (xG 0,27), 0,24 emot (xG 0,16), 5,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 66 | 1,32–0,80 | +0,31 | +0,16 (+1,0) | −2 pe | – | +0,13 / +0,19 ✔ |
| Balanserat | 41 | 1,41–1,10 | +0,05 | −0,11 (−0,6) | +2 pe | – | −0,32 / +0,06  |
| Bollinnehav | 58 | 1,72–1,26 | +0,05 | −0,10 (−0,6) | −0 pe | – | −0,44 / +0,24  |
| Kortpass | 52 | 1,52–1,42 | −0,03 | −0,19 (−1,0) | −9 pe | – | −0,59 / +0,16  |
| Blandat | 65 | 1,49–0,92 | +0,13 | −0,03 (−0,2) | +7 pe | – | −0,27 / +0,33  |
| Direktspel | 48 | 1,44–0,77 | +0,40 | +0,24 (+1,4) | −1 pe | – | +0,56 / +0,04 ✔ |
| Lågpress | 30 | 1,47–0,77 | +0,51 | +0,35 (+1,5) | −4 pe | – | +0,44 / +0,31 ✔ |
| Mellanpress | 73 | 1,52–1,05 | +0,12 | −0,04 (−0,3) | +3 pe | – | −0,34 / +0,24  |
| Högpress | 62 | 1,45–1,15 | +0,03 | −0,12 (−0,8) | −2 pe | – | −0,16 / −0,07 ✔ |
| Svag på fasta | 57 | 1,47–0,95 | +0,21 | +0,05 (+0,3) | +11 pe | – | −0,14 / +0,29  |
| Medel på fasta | 82 | 1,43–1,17 | +0,08 | −0,08 (−0,6) | −6 pe | – | −0,24 / +0,06  |
| Farlig på fasta | 26 | 1,69–0,81 | +0,29 | +0,14 (+0,5) | −11 pe | – | −0,05 / +0,35  |
| Stark mot fasta | 57 | 1,58–0,86 | +0,38 | +0,22 (+1,4) | +2 pe | – | +0,05 / +0,39 ✔ |
| Medel mot fasta | 69 | 1,28–1,16 | −0,15 | −0,31 (−2,1) | +2 pe | – | −0,46 / −0,19 ✔ ⚑ |
| Svag mot fasta | 39 | 1,72–1,08 | +0,38 | +0,22 (+1,0) | −9 pe | – | −0,05 / +0,62  |

- Svårast mot **Medel mot fasta** (−0,31 p/match rel. eget snitt, z −2,1, 69 m) – ⚑ håller i båda halvorna
- Bäst mot **Lågpress** (+0,35 p/match rel. eget snitt, z +1,5, 30 m) – åt samma håll i båda halvorna men svagt

### Kashiwa Reysol

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 59,8 %). 164 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,06), 0,50 emot (xG 0,19), 5,75 hörnor · 2025 (38 m): 0,13 mål för (xG 0,19), 0,13 emot (xG 0,17), 5,37 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 63 | 0,98–1,48 | −0,29 | −0,22 (−1,5) | −5 pe | – | −0,24 / −0,21 ✔ |
| Balanserat | 41 | 1,07–1,05 | +0,08 | +0,14 (+0,8) | +9 pe | – | −0,09 / +0,35  |
| Bollinnehav | 60 | 1,48–1,40 | +0,07 | +0,14 (+0,9) | +2 pe | – | −0,00 / +0,28  |
| Kortpass | 52 | 1,38–1,31 | +0,04 | +0,11 (+0,7) | +6 pe | – | −0,13 / +0,29  |
| Blandat | 58 | 1,12–1,36 | −0,14 | −0,08 (−0,5) | −0 pe | – | −0,29 / +0,29  |
| Direktspel | 54 | 1,07–1,35 | −0,08 | −0,02 (−0,1) | −3 pe | – | +0,18 / −0,16  |
| Lågpress | 29 | 1,17–1,10 | +0,04 | +0,10 (+0,5) | −8 pe | – | −0,21 / +0,25  |
| Mellanpress | 75 | 1,12–1,35 | −0,06 | +0,00 (+0,0) | +5 pe | – | −0,14 / +0,13  |
| Högpress | 60 | 1,28–1,45 | −0,12 | −0,06 (−0,4) | −0 pe | – | −0,08 / −0,02 ✔ |
| Svag på fasta | 55 | 1,07–1,31 | −0,21 | −0,14 (−0,8) | −2 pe | – | −0,18 / −0,09 ✔ |
| Medel på fasta | 82 | 1,29–1,45 | −0,03 | +0,04 (+0,3) | +3 pe | – | −0,18 / +0,18  |
| Farlig på fasta | 27 | 1,11–1,07 | +0,11 | +0,18 (+0,7) | +2 pe | – | +0,13 / +0,24 ✔ |
| Stark mot fasta | 57 | 1,09–1,28 | −0,01 | +0,06 (+0,3) | −2 pe | – | +0,04 / +0,07 ✔ |
| Medel mot fasta | 67 | 1,09–1,33 | −0,20 | −0,14 (−1,0) | +7 pe | – | −0,43 / +0,10  |
| Svag mot fasta | 40 | 1,50–1,45 | +0,08 | +0,15 (+0,7) | −4 pe | – | +0,09 / +0,25 ✔ |

- Svårast mot **Backar hem** (−0,22 p/match rel. eget snitt, z −1,5, 63 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,14 p/match rel. eget snitt, z +0,9, 60 m) – inte stabilt, troligen slump

### Kawasaki Frontale

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 52,3 %). 164 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,30), 0,13 emot (xG 0,16), 4,75 hörnor · 2025 (38 m): 0,37 mål för (xG 0,27), 0,24 emot (xG 0,22), 4,84 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 73 | 1,84–1,26 | +0,07 | +0,03 (+0,2) | +2 pe | – | +0,23 / −0,18  |
| Balanserat | 36 | 1,75–1,28 | −0,12 | −0,16 (−0,8) | +10 pe | – | +0,09 / −0,32  |
| Bollinnehav | 55 | 1,82–1,25 | +0,11 | +0,06 (+0,4) | −4 pe | – | +0,24 / −0,14  |
| Kortpass | 45 | 1,89–1,29 | +0,11 | +0,06 (+0,4) | −2 pe | – | +0,42 / −0,22  |
| Blandat | 61 | 1,82–0,97 | +0,11 | +0,07 (+0,5) | +14 pe | – | +0,21 / −0,16  |
| Direktspel | 58 | 1,74–1,55 | −0,08 | −0,12 (−0,7) | −7 pe | – | +0,03 / −0,23  |
| Lågpress | 29 | 2,48–1,38 | +0,34 | +0,30 (+1,5) | −2 pe | – | +0,44 / +0,23 ✔ |
| Mellanpress | 74 | 1,50–1,24 | −0,17 | −0,22 (−1,6) | +3 pe | – | +0,07 / −0,50  |
| Högpress | 61 | 1,87–1,23 | +0,16 | +0,12 (+0,8) | +2 pe | – | +0,29 / −0,11  |
| Svag på fasta | 57 | 1,84–1,19 | +0,10 | +0,06 (+0,4) | +7 pe | – | +0,22 / −0,16  |
| Medel på fasta | 81 | 1,77–1,31 | +0,02 | −0,02 (−0,2) | −1 pe | – | +0,22 / −0,20  |
| Farlig på fasta | 26 | 1,88–1,27 | −0,02 | −0,07 (−0,3) | −1 pe | – | +0,16 / −0,33  |
| Stark mot fasta | 60 | 1,93–1,32 | +0,16 | +0,12 (+0,8) | −1 pe | – | +0,44 / −0,12  |
| Medel mot fasta | 65 | 1,58–1,17 | −0,16 | −0,20 (−1,4) | +1 pe | – | −0,06 / −0,32 ✔ |
| Svag mot fasta | 39 | 2,00–1,33 | +0,20 | +0,15 (+0,9) | +7 pe | – | +0,29 / −0,14  |

- Svårast mot **Mellanpress** (−0,22 p/match rel. eget snitt, z −1,6, 74 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,30 p/match rel. eget snitt, z +1,5, 29 m) – åt samma håll i båda halvorna men svagt

### Kyoto

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 47,7 %). 100 matcher med stil, mot marknaden totalt +0,22 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,23), 0,38 emot (xG 0,31), 3,13 hörnor · 2025 (38 m): 0,24 mål för (xG 0,33), 0,37 emot (xG 0,26), 4,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 39 | 1,26–1,18 | +0,39 | +0,16 (+0,8) | +5 pe | – | −0,03 / +0,33  |
| Balanserat | 25 | 1,40–1,24 | +0,27 | +0,05 (+0,2) | +1 pe | – | −0,32 / +0,70  |
| Bollinnehav | 36 | 1,31–1,50 | +0,01 | −0,21 (−0,9) | −10 pe | – | −0,34 / −0,11 ✔ |
| Kortpass | 32 | 1,53–1,50 | +0,09 | −0,14 (−0,6) | −8 pe | – | −0,68 / +0,15  |
| Blandat | 34 | 1,21–1,26 | +0,25 | +0,03 (+0,1) | −3 pe | – | −0,17 / +0,40  |
| Direktspel | 34 | 1,21–1,18 | +0,32 | +0,10 (+0,5) | +7 pe | – | +0,01 / +0,19 ✔ |
| Lågpress | 23 | 1,48–1,26 | +0,37 | +0,14 (+0,6) | −2 pe | – | −0,43 / +0,30  |
| Mellanpress | 47 | 1,21–1,17 | +0,24 | +0,02 (+0,1) | +7 pe | – | −0,15 / +0,15  |
| Högpress | 30 | 1,33–1,57 | +0,08 | −0,14 (−0,6) | −13 pe | – | −0,23 / +0,31  |
| Svag på fasta | 34 | 1,12–1,35 | +0,14 | −0,08 (−0,4) | +3 pe | – | −0,29 / +0,29  |
| Medel på fasta | 58 | 1,43–1,36 | +0,21 | −0,01 (−0,1) | −4 pe | – | −0,17 / +0,14  |
| Farlig på fasta | 8 | 1,25–0,75 | +0,66 | +0,44 (+1,1) | +8 pe | – | – / +0,44  |
| Stark mot fasta | 41 | 1,17–1,37 | +0,20 | −0,02 (−0,1) | −5 pe | – | −0,27 / +0,29  |
| Medel mot fasta | 43 | 1,37–1,37 | +0,16 | −0,06 (−0,3) | −4 pe | – | −0,30 / +0,22  |
| Svag mot fasta | 16 | 1,50–1,00 | +0,45 | +0,23 (+0,8) | +17 pe | – | +0,55 / +0,12  |

- Svårast mot **Bollinnehav** (−0,21 p/match rel. eget snitt, z −0,9, 36 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,16 p/match rel. eget snitt, z +0,8, 39 m) – inte stabilt, troligen slump

### Machida

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Mellanpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 47,5 %). 38 matcher med stil, mot marknaden totalt +0,03 per match.

Fasta situationer per match: 2026/27 (8 m): 1,13 mål för (xG 0,47), 0,25 emot (xG 0,25), 3,75 hörnor · 2025 (38 m): 0,42 mål för (xG 0,43), 0,16 emot (xG 0,15), 4,45 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 16 | 1,19–1,00 | −0,19 | −0,22 (−0,7) | −11 pe | – | −0,42 / +0,04  |
| Balanserat | 8 | 1,75–0,75 | +0,71 | +0,69 (+1,7) | −16 pe | – | +1,45 / +0,43  |
| Bollinnehav | 14 | 1,71–1,43 | −0,11 | −0,14 (−0,4) | −7 pe | – | −0,07 / −0,23 ✔ |
| Kortpass | 17 | 1,65–1,29 | +0,03 | +0,00 (+0,0) | −5 pe | – | +0,21 / −0,15  |
| Blandat | 6 | 1,33–0,67 | +0,30 | +0,27 (+0,5) | −29 pe | – | −0,21 / +1,23  |
| Direktspel | 15 | 1,40–1,07 | −0,08 | −0,11 (−0,3) | −9 pe | – | −0,27 / +0,07  |
| Lågpress | 17 | 1,82–0,82 | +0,57 | +0,54 (+1,8) | −17 pe | – | +0,57 / +0,51 ✔ |
| Mellanpress | 21 | 1,24–1,33 | −0,41 | −0,44 (−1,6) | −6 pe | – | −0,55 / −0,31 ✔ |
| Svag på fasta | 6 | 2,00–1,17 | +0,17 | +0,14 (+0,3) | −13 pe | – | +0,36 / −0,07  |
| Medel på fasta | 25 | 1,36–1,20 | −0,15 | −0,18 (−0,7) | −5 pe | – | −0,09 / −0,28 ✔ |
| Farlig på fasta | 7 | 1,57–0,71 | +0,54 | +0,52 (+1,1) | −30 pe | – | −0,47 / +1,26  |
| Stark mot fasta | 7 | 1,43–1,29 | −0,10 | −0,13 (−0,3) | −1 pe | – | −0,23 / −0,06  |
| Medel mot fasta | 20 | 1,45–0,95 | +0,12 | +0,09 (+0,3) | −14 pe | – | −0,19 / +0,32  |
| Svag mot fasta | 11 | 1,64–1,27 | −0,06 | −0,08 (−0,2) | −10 pe | – | +0,12 / −0,44  |

- Svårast mot **Mellanpress** (−0,44 p/match rel. eget snitt, z −1,6, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,54 p/match rel. eget snitt, z +1,8, 17 m) – åt samma håll i båda halvorna men svagt

### Nagoya Grampus

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Lågpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 60,0 %). 165 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,33), 0,13 emot (xG 0,07), 5,25 hörnor · 2025 (38 m): 0,26 mål för (xG 0,31), 0,34 emot (xG 0,27), 4,13 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,00–1,09 | −0,04 | +0,02 (+0,2) | +3 pe | – | +0,27 / −0,22  |
| Balanserat | 40 | 1,00–1,40 | −0,10 | −0,04 (−0,2) | −17 pe | – | +0,35 / −0,39  |
| Bollinnehav | 61 | 1,26–1,25 | −0,06 | −0,00 (−0,0) | −6 pe | – | −0,03 / +0,03  |
| Kortpass | 52 | 1,19–1,56 | −0,27 | −0,21 (−1,2) | −13 pe | – | −0,20 / −0,21 ✔ |
| Blandat | 62 | 1,15–1,00 | +0,09 | +0,15 (+0,9) | +1 pe | – | +0,16 / +0,14 ✔ |
| Direktspel | 51 | 0,94–1,16 | −0,03 | +0,03 (+0,2) | −5 pe | – | +0,60 / −0,41  |
| Lågpress | 25 | 1,00–1,36 | −0,31 | −0,25 (−1,1) | −21 pe | – | +0,36 / −0,45  |
| Mellanpress | 75 | 1,09–1,04 | +0,07 | +0,13 (+0,9) | +2 pe | – | +0,20 / +0,06 ✔ |
| Högpress | 65 | 1,14–1,38 | −0,11 | −0,05 (−0,3) | −7 pe | – | +0,12 / −0,30  |
| Svag på fasta | 55 | 1,15–1,15 | −0,01 | +0,05 (+0,3) | −11 pe | – | −0,06 / +0,19  |
| Medel på fasta | 84 | 1,11–1,24 | +0,02 | +0,08 (+0,6) | −6 pe | – | +0,47 / −0,22  |
| Farlig på fasta | 26 | 0,96–1,35 | −0,42 | −0,36 (−1,8) | +10 pe | – | −0,05 / −0,84 ✔ |
| Stark mot fasta | 57 | 1,02–1,19 | −0,11 | −0,05 (−0,3) | −3 pe | – | +0,12 / −0,18  |
| Medel mot fasta | 65 | 1,11–1,28 | −0,11 | −0,05 (−0,3) | −4 pe | – | +0,04 / −0,13  |
| Svag mot fasta | 43 | 1,19–1,19 | +0,09 | +0,15 (+0,8) | −9 pe | – | +0,37 / −0,23  |

- Svårast mot **Farlig på fasta** (−0,36 p/match rel. eget snitt, z −1,8, 26 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,15 p/match rel. eget snitt, z +0,9, 62 m) – åt samma håll i båda halvorna men svagt

### Okayama

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 42,2 %). 6 matcher med stil, mot marknaden totalt −0,25 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,34), 0,38 emot (xG 0,30), 6,25 hörnor · 2025 (38 m): 0,24 mål för (xG 0,30), 0,24 emot (xG 0,22), 4,92 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Balanserat | 5 | 1,40–1,40 | −0,08 | +0,17 (+0,2) | −7 pe | – | −0,88 / +0,88  |
| Bollinnehav | 1 | 1,00–2,00 | −1,12 | −0,87 (−8,7) | −27 pe | – | −0,87 / –  |
| Kortpass | 3 | 1,00–1,00 | −0,09 | +0,16 (+0,2) | +5 pe | – | −0,73 / +1,94  |
| Blandat | 1 | 3,00–2,00 | +2,04 | +2,29 (+22,9) | −27 pe | – | – / +2,29  |
| Direktspel | 2 | 1,00–2,00 | −1,63 | −1,38 (−9,2) | −27 pe | – | −1,17 / −1,59  |
| Lågpress | 2 | 1,50–1,50 | +0,13 | +0,39 (+0,4) | −28 pe | – | −1,17 / +1,94  |
| Mellanpress | 3 | 0,67–1,33 | −1,27 | −1,02 (−4,2) | +6 pe | – | −0,73 / −1,59  |
| Högpress | 1 | 3,00–2,00 | +2,04 | +2,29 (+22,9) | −27 pe | – | – / +2,29  |
| Svag på fasta | 1 | 0,00–0,00 | −0,85 | −0,59 (−5,9) | +72 pe | – | −0,59 / –  |
| Medel på fasta | 3 | 1,00–2,00 | −1,46 | −1,21 (−7,1) | −27 pe | – | −1,02 / −1,59  |
| Farlig på fasta | 2 | 2,50–1,50 | +1,86 | +2,12 (+17,2) | −27 pe | – | – / +2,12  |
| Stark mot fasta | 1 | 3,00–2,00 | +2,04 | +2,29 (+22,9) | −27 pe | – | – / +2,29  |
| Medel mot fasta | 2 | 1,00–0,50 | +0,42 | +0,67 (+0,8) | +22 pe | – | −0,59 / +1,94  |
| Svag mot fasta | 3 | 1,00–2,00 | −1,46 | −1,21 (−7,1) | −27 pe | – | −1,02 / −1,59  |

### Sanfrecce Hiroshima

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Högpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 59,8 %). 165 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026/27 (8 m): 0,50 mål för (xG 0,56), 0,13 emot (xG 0,05), 7,38 hörnor · 2025 (38 m): 0,50 mål för (xG 0,49), 0,08 emot (xG 0,13), 6,18 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,20–0,92 | −0,09 | −0,01 (−0,0) | −3 pe | – | +0,08 / −0,09  |
| Balanserat | 40 | 1,60–1,05 | +0,10 | +0,18 (+0,9) | −3 pe | – | +0,06 / +0,28 ✔ |
| Bollinnehav | 60 | 1,52–1,10 | −0,20 | −0,12 (−0,8) | +8 pe | – | −0,23 / −0,00 ✔ |
| Kortpass | 48 | 1,50–1,04 | −0,13 | −0,05 (−0,3) | +6 pe | – | −0,13 / +0,00  |
| Blandat | 62 | 1,37–1,08 | −0,15 | −0,07 (−0,4) | +1 pe | – | −0,33 / +0,33  |
| Direktspel | 55 | 1,38–0,93 | +0,04 | +0,12 (+0,7) | −4 pe | – | +0,49 / −0,17  |
| Lågpress | 32 | 1,44–0,88 | +0,05 | +0,13 (+0,6) | −5 pe | – | +0,27 / +0,08 ✔ |
| Mellanpress | 77 | 1,40–1,08 | −0,15 | −0,07 (−0,5) | +1 pe | – | −0,14 / +0,00  |
| Högpress | 56 | 1,41–1,02 | −0,07 | +0,02 (+0,1) | +3 pe | – | −0,01 / +0,06  |
| Svag på fasta | 58 | 1,48–1,21 | −0,12 | −0,04 (−0,2) | −1 pe | – | −0,11 / +0,09  |
| Medel på fasta | 80 | 1,36–0,95 | −0,04 | +0,04 (+0,3) | +5 pe | – | +0,06 / +0,03 ✔ |
| Farlig på fasta | 27 | 1,41–0,81 | −0,12 | −0,03 (−0,1) | −8 pe | – | −0,05 / −0,01 ✔ |
| Stark mot fasta | 54 | 1,37–0,98 | −0,06 | +0,03 (+0,2) | −1 pe | – | −0,06 / +0,09  |
| Medel mot fasta | 68 | 1,41–0,93 | −0,04 | +0,04 (+0,3) | +0 pe | – | −0,04 / +0,12  |
| Svag mot fasta | 43 | 1,47–1,21 | −0,18 | −0,10 (−0,5) | +4 pe | – | −0,02 / −0,21 ✔ |

- Svårast mot **Bollinnehav** (−0,12 p/match rel. eget snitt, z −0,8, 60 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,18 p/match rel. eget snitt, z +0,9, 40 m) – åt samma håll i båda halvorna men svagt

### Shimizu S-Pulse

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 42,4 %). 71 matcher med stil, mot marknaden totalt −0,20 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,25), 0,13 emot (xG 0,17), 5,13 hörnor · 2025 (38 m): 0,21 mål för (xG 0,26), 0,29 emot (xG 0,22), 4,87 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 30 | 1,27–1,43 | +0,06 | +0,26 (+1,1) | −9 pe | – | +0,44 / +0,06 ✔ |
| Balanserat | 16 | 0,81–1,44 | −0,15 | +0,06 (+0,2) | −7 pe | – | −0,07 / +0,13  |
| Bollinnehav | 25 | 0,96–1,56 | −0,55 | −0,35 (−2,9) | +22 pe | – | −0,30 / −0,40 ✔ ⚑ |
| Kortpass | 23 | 0,74–1,65 | −0,68 | −0,48 (−4,9) | +10 pe | – | −0,45 / −0,51 ✔ ⚑ |
| Blandat | 29 | 1,07–1,31 | −0,01 | +0,19 (+0,9) | +3 pe | – | +0,22 / +0,16 ✔ |
| Direktspel | 19 | 1,42–1,53 | +0,09 | +0,29 (+0,9) | −8 pe | – | +0,39 / +0,18 ✔ |
| Lågpress | 10 | 0,80–1,30 | −0,12 | +0,08 (+0,2) | −9 pe | – | +0,05 / +0,13  |
| Mellanpress | 31 | 1,03–1,26 | −0,05 | +0,15 (+0,7) | +1 pe | – | +0,42 / −0,02  |
| Högpress | 30 | 1,17–1,77 | −0,39 | −0,19 (−1,1) | +7 pe | – | −0,16 / −0,22 ✔ |
| Svag på fasta | 30 | 1,10–1,60 | −0,27 | −0,07 (−0,4) | +9 pe | – | −0,05 / −0,09 ✔ |
| Medel på fasta | 27 | 1,00–1,33 | −0,09 | +0,11 (+0,5) | −9 pe | – | +0,22 / +0,07 ✔ |
| Farlig på fasta | 14 | 1,07–1,50 | −0,27 | −0,07 (−0,3) | +8 pe | – | +0,17 / −0,68  |
| Stark mot fasta | 20 | 1,10–1,35 | −0,07 | +0,13 (+0,5) | +6 pe | – | +0,17 / +0,09 ✔ |
| Medel mot fasta | 27 | 1,07–1,37 | −0,21 | −0,01 (−0,0) | +6 pe | – | −0,07 / +0,06  |
| Svag mot fasta | 24 | 1,00–1,71 | −0,30 | −0,10 (−0,4) | −6 pe | – | +0,18 / −0,34  |

- Svårast mot **Kortpass** (−0,48 p/match rel. eget snitt, z −4,9, 23 m) – ⚑ håller i båda halvorna
- Bäst mot **Backar hem** (+0,26 p/match rel. eget snitt, z +1,1, 30 m) – åt samma håll i båda halvorna men svagt

### Urawa Reds

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,9 %). 166 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,33), 0,50 emot (xG 0,53), 4,38 hörnor · 2025 (38 m): 0,40 mål för (xG 0,36), 0,18 emot (xG 0,26), 4,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 1,15–0,86 | +0,10 | +0,10 (+0,8) | +7 pe | – | +0,14 / +0,06 ✔ |
| Balanserat | 39 | 1,33–1,38 | −0,19 | −0,18 (−0,9) | −2 pe | – | −0,03 / −0,32 ✔ |
| Bollinnehav | 55 | 1,36–1,27 | −0,01 | −0,01 (−0,0) | +0 pe | – | +0,00 / −0,02  |
| Kortpass | 48 | 1,40–1,42 | +0,04 | +0,05 (+0,2) | −6 pe | – | +0,08 / +0,01 ✔ |
| Blandat | 63 | 1,35–1,06 | −0,04 | −0,04 (−0,3) | +5 pe | – | +0,08 / −0,22  |
| Direktspel | 55 | 1,05–0,93 | +0,00 | +0,01 (+0,0) | +7 pe | – | −0,01 / +0,02  |
| Lågpress | 29 | 1,24–1,10 | +0,06 | +0,06 (+0,3) | −1 pe | – | −0,09 / +0,13  |
| Mellanpress | 72 | 1,24–1,04 | −0,03 | −0,02 (−0,2) | +6 pe | – | −0,06 / +0,01  |
| Högpress | 65 | 1,31–1,22 | −0,01 | −0,00 (−0,0) | +0 pe | – | +0,20 / −0,30  |
| Svag på fasta | 57 | 1,11–0,95 | −0,03 | −0,02 (−0,1) | −0 pe | – | −0,08 / +0,08  |
| Medel på fasta | 81 | 1,44–1,28 | −0,00 | −0,00 (−0,0) | +3 pe | – | +0,29 / −0,19  |
| Farlig på fasta | 28 | 1,07–1,00 | +0,05 | +0,05 (+0,2) | +8 pe | – | −0,09 / +0,24  |
| Stark mot fasta | 58 | 1,21–1,07 | +0,01 | +0,01 (+0,1) | −1 pe | – | +0,08 / −0,04  |
| Medel mot fasta | 65 | 1,17–0,95 | +0,01 | +0,01 (+0,1) | +7 pe | – | +0,07 / −0,04  |
| Svag mot fasta | 43 | 1,49–1,44 | −0,04 | −0,04 (−0,2) | +1 pe | – | +0,02 / −0,13  |

- Svårast mot **Balanserat** (−0,18 p/match rel. eget snitt, z −0,9, 39 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,10 p/match rel. eget snitt, z +0,8, 72 m) – åt samma håll i båda halvorna men svagt

### Verdy

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 43,9 %). 39 matcher med stil, mot marknaden totalt −0,23 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,17), 0,38 emot (xG 0,23), 3,88 hörnor · 2025 (38 m): 0,21 mål för (xG 0,16), 0,32 emot (xG 0,13), 4,37 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 17 | 0,29–1,24 | −0,26 | −0,04 (−0,2) | −2 pe | – | +0,26 / −0,37  |
| Balanserat | 8 | 0,63–2,00 | −0,96 | −0,73 (−4,8) | −5 pe | – | −0,92 / −0,66  |
| Bollinnehav | 14 | 0,64–0,79 | +0,24 | +0,46 (+1,5) | +6 pe | – | +0,18 / +0,83 ✔ |
| Kortpass | 17 | 0,65–1,24 | −0,24 | −0,01 (−0,0) | +12 pe | – | −0,05 / +0,02  |
| Blandat | 5 | 0,60–0,80 | +0,19 | +0,41 (+0,7) | −10 pe | – | +0,00 / +1,03  |
| Direktspel | 17 | 0,29–1,35 | −0,34 | −0,11 (−0,5) | −8 pe | – | +0,26 / −0,53  |
| Lågpress | 17 | 0,71–1,35 | −0,23 | +0,00 (+0,0) | −1 pe | – | +0,13 / −0,09  |
| Mellanpress | 22 | 0,32–1,14 | −0,23 | −0,00 (−0,0) | +2 pe | – | +0,09 / −0,11  |
| Svag på fasta | 5 | 0,80–1,40 | −0,19 | +0,04 (+0,1) | +10 pe | – | −0,44 / +0,36  |
| Medel på fasta | 26 | 0,42–1,12 | −0,24 | −0,02 (−0,1) | +5 pe | – | −0,01 / −0,02 ✔ |
| Farlig på fasta | 8 | 0,50–1,50 | −0,20 | +0,03 (+0,1) | −18 pe | – | +1,00 / −0,56  |
| Stark mot fasta | 8 | 0,50–0,63 | +0,12 | +0,35 (+1,0) | +18 pe | – | +1,27 / −0,21  |
| Medel mot fasta | 20 | 0,45–1,80 | −0,67 | −0,44 (−2,4) | −15 pe | – | −0,26 / −0,59 ✔ ⚑ |
| Svag mot fasta | 11 | 0,55–0,64 | +0,33 | +0,55 (+1,7) | +16 pe | – | +0,07 / +1,39  |

- Svårast mot **Medel mot fasta** (−0,44 p/match rel. eget snitt, z −2,4, 20 m) – ⚑ håller i båda halvorna
- Bäst mot **Lågpress** (+0,00 p/match rel. eget snitt, z +0,0, 17 m) – inte stabilt, troligen slump

### Vissel Kobe

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 50,8 %). 165 matcher med stil, mot marknaden totalt +0,22 per match.

Fasta situationer per match: 2026/27 (8 m): 0,63 mål för (xG 0,54), 0,00 emot (xG 0,01), 3,88 hörnor · 2025 (38 m): 0,45 mål för (xG 0,42), 0,18 emot (xG 0,14), 5,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 1,31–0,91 | +0,10 | −0,12 (−0,8) | +4 pe | – | −0,16 / −0,08 ✔ |
| Balanserat | 42 | 1,45–0,95 | +0,33 | +0,11 (+0,5) | −12 pe | – | −0,01 / +0,19  |
| Bollinnehav | 55 | 1,75–1,07 | +0,29 | +0,07 (+0,4) | −4 pe | – | +0,31 / −0,14  |
| Kortpass | 54 | 1,35–1,07 | +0,08 | −0,14 (−0,8) | −4 pe | – | −0,08 / −0,19 ✔ |
| Blandat | 59 | 1,80–0,97 | +0,38 | +0,16 (+1,0) | −3 pe | – | +0,17 / +0,15 ✔ |
| Direktspel | 52 | 1,29–0,88 | +0,18 | −0,04 (−0,2) | −1 pe | – | −0,09 / +0,00  |
| Lågpress | 32 | 1,28–1,03 | +0,04 | −0,18 (−0,9) | +10 pe | – | −0,15 / −0,19 ✔ |
| Mellanpress | 71 | 1,54–1,01 | +0,24 | +0,02 (+0,1) | −7 pe | – | −0,20 / +0,21  |
| Högpress | 62 | 1,55–0,90 | +0,29 | +0,07 (+0,5) | −5 pe | – | +0,25 / −0,24  |
| Svag på fasta | 60 | 1,45–1,03 | +0,11 | −0,11 (−0,7) | +4 pe | – | +0,12 / −0,39  |
| Medel på fasta | 81 | 1,49–0,90 | +0,32 | +0,10 (+0,7) | −7 pe | – | −0,00 / +0,17  |
| Farlig på fasta | 24 | 1,58–1,08 | +0,17 | −0,05 (−0,2) | −6 pe | – | −0,12 / +0,08  |
| Stark mot fasta | 55 | 1,65–0,71 | +0,46 | +0,24 (+1,5) | −3 pe | – | +0,43 / +0,08 ✔ |
| Medel mot fasta | 68 | 1,47–1,10 | +0,05 | −0,17 (−1,1) | −2 pe | – | −0,13 / −0,20 ✔ |
| Svag mot fasta | 42 | 1,31–1,12 | +0,18 | −0,04 (−0,2) | −6 pe | – | −0,18 / +0,18  |

- Svårast mot **Medel mot fasta** (−0,17 p/match rel. eget snitt, z −1,1, 68 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,24 p/match rel. eget snitt, z +1,5, 55 m) – åt samma håll i båda halvorna men svagt

### Yokohama F. Marinos

Egen stil 2025 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 48,5 %). 165 matcher med stil, mot marknaden totalt +0,14 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,20), 0,50 emot (xG 0,23), 3,38 hörnor · 2025 (38 m): 0,26 mål för (xG 0,20), 0,32 emot (xG 0,23), 4,11 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 73 | 1,86–1,11 | +0,14 | +0,01 (+0,0) | −9 pe | – | +0,15 / −0,16  |
| Balanserat | 42 | 1,62–1,57 | −0,05 | −0,19 (−0,9) | −0 pe | – | −0,14 / −0,24 ✔ |
| Bollinnehav | 50 | 1,84–1,10 | +0,29 | +0,15 (+0,9) | +4 pe | – | +0,34 / −0,02  |
| Kortpass | 42 | 1,71–1,50 | −0,06 | −0,19 (−1,0) | −0 pe | – | +0,01 / −0,37  |
| Blandat | 64 | 1,98–1,16 | +0,30 | +0,16 (+1,1) | −0 pe | – | +0,28 / −0,03  |
| Direktspel | 59 | 1,64–1,10 | +0,11 | −0,03 (−0,2) | −8 pe | – | +0,01 / −0,06  |
| Lågpress | 28 | 1,61–1,36 | −0,00 | −0,14 (−0,6) | −4 pe | – | +0,06 / −0,25  |
| Mellanpress | 79 | 1,77–1,05 | +0,25 | +0,11 (+0,8) | −0 pe | – | +0,28 / −0,03  |
| Högpress | 58 | 1,91–1,40 | +0,05 | −0,08 (−0,5) | −6 pe | – | +0,01 / −0,23  |
| Svag på fasta | 57 | 1,89–1,19 | +0,26 | +0,12 (+0,7) | −5 pe | – | +0,10 / +0,15 ✔ |
| Medel på fasta | 79 | 1,70–1,35 | +0,08 | −0,05 (−0,4) | −7 pe | – | +0,26 / −0,27  |
| Farlig på fasta | 29 | 1,86–0,93 | +0,06 | −0,08 (−0,4) | +11 pe | – | −0,02 / −0,16 ✔ |
| Stark mot fasta | 60 | 1,77–0,97 | +0,19 | +0,05 (+0,3) | −4 pe | – | +0,20 / −0,07  |
| Medel mot fasta | 68 | 1,84–1,37 | +0,18 | +0,04 (+0,2) | −9 pe | – | +0,21 / −0,11  |
| Svag mot fasta | 37 | 1,76–1,38 | −0,01 | −0,15 (−0,8) | +11 pe | – | −0,03 / −0,35 ✔ |

- Svårast mot **Kortpass** (−0,19 p/match rel. eget snitt, z −1,0, 42 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,16 p/match rel. eget snitt, z +1,1, 64 m) – inte stabilt, troligen slump
