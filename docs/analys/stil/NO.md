# Stilmatchning – Eliteserien (NO)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1466 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 77 m · hemma −0,18 · kryss −0 pe · ö2,5 – | 150 m · hemma +0,07 · kryss +1 pe · ö2,5 – | 126 m · hemma −0,02 · kryss −1 pe · ö2,5 – |
| **Mellan** | 149 m · hemma +0,01 · kryss −0 pe · ö2,5 – | 251 m · hemma +0,03 · kryss −5 pe · ö2,5 – | 218 m · hemma +0,07 · kryss −6 pe · ö2,5 – |
| **Mycket boll** | 130 m · hemma +0,15 · kryss −2 pe · ö2,5 – | 214 m · hemma −0,08 · kryss +1 pe · ö2,5 – | 151 m · hemma −0,03 · kryss +2 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 144 m · hemma +0,10 · kryss −10 pe · ö2,5 – | 157 m · hemma −0,07 · kryss +3 pe · ö2,5 – | 179 m · hemma +0,03 · kryss −2 pe · ö2,5 – |
| **Balanserat** | 161 m · hemma −0,05 · kryss +3 pe · ö2,5 – | 188 m · hemma +0,14 · kryss −1 pe · ö2,5 – | 154 m · hemma +0,11 · kryss −5 pe · ö2,5 – |
| **Bollinnehav** | 178 m · hemma −0,02 · kryss +0 pe · ö2,5 – | 154 m · hemma −0,18 · kryss −1 pe · ö2,5 – | 151 m · hemma +0,02 · kryss −4 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 468 m · mot marknaden +0,05 (z +0,9) · mål 1,70 · ö2,5 – | 408 m · mot marknaden +0,01 (z +0,1) · mål 1,55 · ö2,5 – | 228 m · mot marknaden −0,03 (z −0,4) · mål 1,50 · ö2,5 – |
| **Medel på fasta** | 372 m · mot marknaden −0,02 (z −0,3) · mål 1,68 · ö2,5 – | 320 m · mot marknaden −0,02 (z −0,3) · mål 1,57 · ö2,5 – | 277 m · mot marknaden +0,10 (z +1,3) · mål 1,64 · ö2,5 – |
| **Farlig på fasta** | 298 m · mot marknaden +0,02 (z +0,3) · mål 1,39 · ö2,5 – | 310 m · mot marknaden −0,06 (z −0,8) · mål 1,41 · ö2,5 – | 251 m · mot marknaden +0,02 (z +0,2) · mål 1,39 · ö2,5 – |

## Lag (säsong 2026)

### Bodo/Glimt

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 63,9 %). 192 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026 (21 m): 0,48 mål för (xG 0,45), 0,05 emot (xG 0,11), 7,71 hörnor · 2025 (30 m): 0,57 mål för (xG 0,52), 0,07 emot (xG 0,14), 7,73 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 68 | 2,40–1,04 | +0,13 | −0,02 (−0,2) | +4 pe | – | +0,14 / −0,17  |
| Balanserat | 69 | 2,41–1,36 | +0,15 | +0,00 (+0,0) | +2 pe | – | −0,01 / +0,02  |
| Bollinnehav | 55 | 2,76–1,04 | +0,17 | +0,02 (+0,1) | −8 pe | – | −0,02 / +0,05  |
| Kortpass | 67 | 2,45–1,09 | −0,01 | −0,16 (−1,1) | −2 pe | – | −0,50 / −0,12 ✔ |
| Blandat | 61 | 2,57–1,15 | +0,14 | −0,01 (−0,1) | −1 pe | – | −0,04 / +0,03  |
| Direktspel | 64 | 2,50–1,23 | +0,32 | +0,17 (+1,4) | +3 pe | – | +0,15 / +0,27 ✔ |
| Lågpress | 57 | 2,51–1,12 | +0,21 | +0,06 (+0,4) | +2 pe | – | +0,17 / −0,30  |
| Mellanpress | 77 | 2,42–1,09 | +0,20 | +0,05 (+0,4) | −2 pe | – | −0,07 / +0,16  |
| Högpress | 58 | 2,62–1,28 | +0,02 | −0,13 (−0,8) | −0 pe | – | −0,09 / −0,14 ✔ |
| Svag på fasta | 78 | 2,58–1,09 | +0,19 | +0,04 (+0,3) | −1 pe | – | +0,11 / −0,01  |
| Medel på fasta | 57 | 2,44–1,26 | +0,00 | −0,15 (−1,0) | +4 pe | – | −0,11 / −0,19 ✔ |
| Farlig på fasta | 57 | 2,47–1,14 | +0,24 | +0,09 (+0,6) | −3 pe | – | +0,09 / +0,09 ✔ |
| Stark mot fasta | 84 | 2,57–0,96 | +0,20 | +0,05 (+0,5) | −1 pe | – | +0,26 / −0,09  |
| Medel mot fasta | 66 | 2,47–1,26 | +0,13 | −0,02 (−0,1) | −3 pe | – | +0,00 / −0,04  |
| Svag mot fasta | 42 | 2,43–1,38 | +0,08 | −0,07 (−0,4) | +5 pe | – | −0,19 / +0,16  |

- Svårast mot **Kortpass** (−0,16 p/match rel. eget snitt, z −1,1, 67 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,17 p/match rel. eget snitt, z +1,4, 64 m) – åt samma håll i båda halvorna men svagt

### Brann

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 58,6 %). 167 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026 (21 m): 0,38 mål för (xG 0,47), 0,29 emot (xG 0,35), 6,62 hörnor · 2025 (30 m): 0,37 mål för (xG 0,44), 0,37 emot (xG 0,20), 7,07 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 1,49–1,40 | −0,18 | −0,10 (−0,6) | +2 pe | – | −0,33 / +0,04  |
| Balanserat | 57 | 1,23–1,63 | −0,22 | −0,14 (−0,9) | +1 pe | – | +0,00 / −0,43  |
| Bollinnehav | 53 | 1,70–1,21 | +0,18 | +0,26 (+1,5) | −3 pe | – | +0,10 / +0,38 ✔ |
| Kortpass | 62 | 1,84–1,34 | +0,06 | +0,14 (+0,9) | −4 pe | – | +0,00 / +0,16 ✔ |
| Blandat | 35 | 1,29–1,86 | −0,31 | −0,23 (−1,1) | +2 pe | – | −0,27 / −0,18 ✔ |
| Direktspel | 70 | 1,23–1,27 | −0,10 | −0,02 (−0,1) | +3 pe | – | +0,00 / −0,11  |
| Lågpress | 70 | 1,36–1,39 | −0,09 | −0,01 (−0,0) | −1 pe | – | +0,01 / −0,04  |
| Mellanpress | 69 | 1,52–1,57 | −0,15 | −0,07 (−0,5) | +0 pe | – | −0,17 / +0,02  |
| Högpress | 28 | 1,61–1,14 | +0,10 | +0,19 (+0,8) | +2 pe | – | +0,03 / +0,21  |
| Svag på fasta | 54 | 1,44–1,39 | +0,11 | +0,19 (+1,1) | −6 pe | – | +0,16 / +0,22 ✔ |
| Medel på fasta | 60 | 1,60–1,63 | −0,17 | −0,09 (−0,6) | +6 pe | – | −0,10 / −0,08 ✔ |
| Farlig på fasta | 53 | 1,34–1,21 | −0,18 | −0,10 (−0,5) | −0 pe | – | −0,18 / +0,01  |
| Stark mot fasta | 65 | 1,54–1,09 | +0,10 | +0,18 (+1,2) | +5 pe | – | +0,10 / +0,23 ✔ |
| Medel mot fasta | 55 | 1,51–1,55 | −0,11 | −0,03 (−0,2) | +1 pe | – | −0,33 / +0,24  |
| Svag mot fasta | 47 | 1,32–1,72 | −0,30 | −0,22 (−1,1) | −8 pe | – | +0,05 / −0,78  |

- Svårast mot **Blandat** (−0,23 p/match rel. eget snitt, z −1,1, 35 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,26 p/match rel. eget snitt, z +1,5, 53 m) – åt samma håll i båda halvorna men svagt

### Fredrikstad

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,0 %). 42 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026 (21 m): 0,29 mål för (xG 0,30), 0,43 emot (xG 0,43), 4,19 hörnor · 2025 (30 m): 0,40 mål för (xG 0,36), 0,23 emot (xG 0,25), 4,70 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 15 | 1,47–1,20 | +0,41 | +0,35 (+1,1) | −6 pe | – | +0,57 / +0,01 ✔ |
| Balanserat | 10 | 0,90–1,60 | −0,21 | −0,27 (−1,0) | +4 pe | – | −0,17 / −0,31  |
| Bollinnehav | 17 | 0,88–1,24 | −0,10 | −0,15 (−0,6) | +7 pe | – | −0,39 / +0,12  |
| Kortpass | 36 | 0,94–1,39 | −0,07 | −0,13 (−0,7) | +0 pe | – | −0,17 / −0,09 ✔ |
| Blandat | 4 | 1,50–0,75 | +0,54 | +0,49 (+1,3) | +25 pe | – | +1,39 / +0,18  |
| Direktspel | 2 | 3,00–1,00 | +1,44 | +1,38 (+5,5) | −25 pe | – | +1,38 / –  |
| Lågpress | 14 | 1,14–1,43 | +0,20 | +0,14 (+0,5) | −9 pe | – | +0,52 / −0,07  |
| Mellanpress | 26 | 1,15–1,31 | +0,04 | −0,02 (−0,1) | +6 pe | – | −0,00 / −0,04 ✔ |
| Högpress | 2 | 0,00–0,50 | −0,66 | −0,71 (−1,2) | +23 pe | – | −0,71 / –  |
| Svag på fasta | 16 | 1,19–1,06 | +0,33 | +0,28 (+0,9) | −8 pe | – | +0,24 / +0,36 ✔ |
| Medel på fasta | 18 | 1,06–1,50 | −0,01 | −0,06 (−0,3) | +4 pe | – | −0,04 / −0,09 ✔ |
| Farlig på fasta | 8 | 1,00–1,38 | −0,35 | −0,41 (−1,7) | +14 pe | – | −0,61 / −0,34  |
| Stark mot fasta | 20 | 1,15–1,10 | +0,11 | +0,05 (+0,2) | +5 pe | – | +0,30 / −0,19  |
| Medel mot fasta | 9 | 0,56–1,56 | −0,57 | −0,63 (−2,2) | +9 pe | – | −0,96 / +0,03  |
| Svag mot fasta | 13 | 1,38–1,46 | +0,41 | +0,35 (+1,1) | −9 pe | – | +0,78 / +0,08 ✔ |

- Svårast mot **Kortpass** (−0,13 p/match rel. eget snitt, z −0,7, 36 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,35 p/match rel. eget snitt, z +1,1, 15 m) – åt samma håll i båda halvorna men svagt

### HamKam

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 46,3 %). 93 matcher med stil, mot marknaden totalt +0,08 per match.

Fasta situationer per match: 2026 (21 m): 0,38 mål för (xG 0,32), 0,24 emot (xG 0,23), 4,09 hörnor · 2025 (30 m): 0,33 mål för (xG 0,33), 0,47 emot (xG 0,37), 4,77 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,18–1,68 | −0,12 | −0,20 (−0,9) | +4 pe | – | −0,58 / +0,01  |
| Balanserat | 27 | 1,41–1,81 | +0,11 | +0,03 (+0,1) | −10 pe | – | +0,09 / −0,05  |
| Bollinnehav | 38 | 1,37–1,82 | +0,21 | +0,13 (+0,7) | −4 pe | – | +0,44 / −0,22  |
| Kortpass | 63 | 1,27–1,89 | −0,07 | −0,15 (−1,1) | −2 pe | – | +0,05 / −0,29  |
| Blandat | 24 | 1,58–1,50 | +0,59 | +0,51 (+2,1) | −4 pe | – | +0,35 / +0,89 ✔ ⚑ |
| Direktspel | 6 | 0,83–1,67 | −0,32 | −0,40 (−0,9) | −8 pe | – | −0,69 / +0,17  |
| Lågpress | 17 | 1,53–1,88 | +0,44 | +0,36 (+1,2) | −11 pe | – | +1,29 / +0,24  |
| Mellanpress | 36 | 1,19–1,89 | −0,01 | −0,10 (−0,5) | −3 pe | – | −0,05 / −0,12 ✔ |
| Högpress | 40 | 1,35–1,63 | +0,01 | −0,07 (−0,4) | +1 pe | – | +0,08 / −0,65  |
| Svag på fasta | 49 | 1,20–1,86 | +0,03 | −0,05 (−0,3) | −3 pe | – | −0,04 / −0,07 ✔ |
| Medel på fasta | 30 | 1,40–1,93 | +0,04 | −0,04 (−0,2) | −7 pe | – | −0,04 / −0,03 ✔ |
| Farlig på fasta | 14 | 1,57–1,14 | +0,33 | +0,25 (+0,8) | +4 pe | – | +0,85 / −0,34  |
| Stark mot fasta | 42 | 1,29–1,60 | +0,06 | −0,02 (−0,1) | −1 pe | – | −0,06 / +0,02  |
| Medel mot fasta | 36 | 1,25–2,00 | +0,03 | −0,05 (−0,3) | −6 pe | – | +0,16 / −0,42  |
| Svag mot fasta | 15 | 1,60–1,73 | +0,25 | +0,17 (+0,5) | −2 pe | – | +1,94 / +0,04  |

- Svårast mot **Kortpass** (−0,15 p/match rel. eget snitt, z −1,1, 63 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,51 p/match rel. eget snitt, z +2,1, 24 m) – ⚑ håller i båda halvorna

### KFUM Oslo

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 44,3 %). 41 matcher med stil, mot marknaden totalt −0,10 per match.

Fasta situationer per match: 2026 (21 m): 0,10 mål för (xG 0,18), 0,29 emot (xG 0,42), 4,05 hörnor · 2025 (30 m): 0,10 mål för (xG 0,28), 0,43 emot (xG 0,25), 4,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 17 | 1,35–1,35 | −0,23 | −0,13 (−0,5) | +8 pe | – | +0,08 / −0,52  |
| Balanserat | 6 | 1,83–1,33 | +0,66 | +0,76 (+1,6) | +8 pe | – | −0,49 / +1,39  |
| Bollinnehav | 18 | 1,22–1,78 | −0,23 | −0,13 (−0,4) | −13 pe | – | +0,69 / −0,65  |
| Kortpass | 34 | 1,18–1,68 | −0,15 | −0,05 (−0,2) | −5 pe | – | +0,14 / −0,20  |
| Blandat | 5 | 2,00–1,00 | +0,09 | +0,19 (+0,4) | +13 pe | – | +0,62 / −0,46  |
| Direktspel | 2 | 3,00–0,50 | +0,26 | +0,36 (+0,6) | +24 pe | – | +0,36 / –  |
| Lågpress | 14 | 1,57–1,93 | −0,31 | −0,22 (−0,9) | +5 pe | – | +0,13 / −0,47  |
| Mellanpress | 23 | 1,35–1,26 | +0,11 | +0,21 (+0,7) | −0 pe | – | +0,57 / −0,07  |
| Högpress | 4 | 0,75–1,75 | −0,54 | −0,44 (−0,9) | −30 pe | – | −0,44 / –  |
| Svag på fasta | 15 | 1,40–1,40 | +0,22 | +0,32 (+1,0) | −7 pe | – | +0,61 / −0,02  |
| Medel på fasta | 16 | 1,63–1,63 | −0,35 | −0,25 (−1,0) | +7 pe | – | +0,08 / −0,59  |
| Farlig på fasta | 10 | 0,90–1,60 | −0,17 | −0,07 (−0,2) | −6 pe | – | −0,20 / +0,01  |
| Stark mot fasta | 20 | 1,45–1,20 | +0,01 | +0,10 (+0,4) | −7 pe | – | +0,05 / +0,16 ✔ |
| Medel mot fasta | 11 | 1,36–2,00 | −0,50 | −0,40 (−1,2) | +2 pe | – | +0,15 / −1,07  |
| Svag mot fasta | 10 | 1,20–1,70 | +0,13 | +0,23 (+0,7) | +5 pe | – | +0,82 / −0,16  |

- Svårast mot **Medel på fasta** (−0,25 p/match rel. eget snitt, z −1,0, 16 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,32 p/match rel. eget snitt, z +1,0, 15 m) – inte stabilt, troligen slump

### Kristiansund

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 42,6 %). 170 matcher med stil, mot marknaden totalt +0,14 per match.

Fasta situationer per match: 2026 (21 m): 0,14 mål för (xG 0,29), 0,29 emot (xG 0,32), 4,29 hörnor · 2025 (30 m): 0,27 mål för (xG 0,21), 0,43 emot (xG 0,36), 4,13 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,37–1,77 | +0,08 | −0,06 (−0,4) | −3 pe | – | +0,17 / −0,19  |
| Balanserat | 61 | 1,39–1,74 | +0,04 | −0,10 (−0,6) | −3 pe | – | +0,02 / −0,34  |
| Bollinnehav | 57 | 1,32–1,65 | +0,31 | +0,17 (+1,1) | +6 pe | – | +0,34 / +0,02 ✔ |
| Kortpass | 51 | 1,04–1,90 | +0,14 | +0,00 (+0,0) | +3 pe | – | +0,59 / −0,08  |
| Blandat | 43 | 1,44–1,84 | −0,07 | −0,21 (−1,1) | −5 pe | – | −0,11 / −0,30 ✔ |
| Direktspel | 76 | 1,53–1,53 | +0,26 | +0,12 (+0,8) | +1 pe | – | +0,19 / −0,15  |
| Lågpress | 65 | 1,31–1,65 | +0,16 | +0,02 (+0,1) | +5 pe | – | +0,01 / +0,03 ✔ |
| Mellanpress | 85 | 1,41–1,74 | +0,16 | +0,02 (+0,1) | −0 pe | – | +0,29 / −0,18  |
| Högpress | 20 | 1,30–1,85 | +0,02 | −0,12 (−0,4) | −14 pe | – | +0,71 / −0,27  |
| Svag på fasta | 56 | 1,32–1,86 | +0,04 | −0,10 (−0,6) | +1 pe | – | −0,14 / −0,06 ✔ |
| Medel på fasta | 60 | 1,48–1,65 | +0,42 | +0,28 (+1,7) | −5 pe | – | +0,35 / +0,21 ✔ |
| Farlig på fasta | 54 | 1,26–1,65 | −0,07 | −0,21 (−1,3) | +5 pe | – | +0,20 / −0,69  |
| Stark mot fasta | 57 | 1,33–2,09 | −0,12 | −0,26 (−1,6) | +4 pe | – | −0,07 / −0,42 ✔ |
| Medel mot fasta | 56 | 1,16–1,43 | +0,20 | +0,06 (+0,4) | −4 pe | – | +0,17 / −0,02  |
| Svag mot fasta | 57 | 1,58–1,63 | +0,34 | +0,20 (+1,2) | +1 pe | – | +0,31 / +0,03 ✔ |

- Svårast mot **Stark mot fasta** (−0,26 p/match rel. eget snitt, z −1,6, 57 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel på fasta** (+0,28 p/match rel. eget snitt, z +1,7, 60 m) – åt samma håll i båda halvorna men svagt

### Molde

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 59,2 %). 217 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026 (21 m): 0,38 mål för (xG 0,47), 0,19 emot (xG 0,26), 5,57 hörnor · 2025 (30 m): 0,17 mål för (xG 0,35), 0,27 emot (xG 0,21), 5,73 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 67 | 1,96–1,31 | −0,03 | −0,18 (−1,1) | −14 pe | – | −0,02 / −0,32 ✔ |
| Balanserat | 75 | 2,35–1,19 | +0,23 | +0,08 (+0,6) | −6 pe | – | +0,31 / −0,22  |
| Bollinnehav | 75 | 2,20–1,21 | +0,23 | +0,08 (+0,5) | −6 pe | – | +0,05 / +0,10 ✔ |
| Kortpass | 73 | 1,93–1,33 | −0,02 | −0,17 (−1,0) | −9 pe | – | −0,16 / −0,17 ✔ |
| Blandat | 58 | 2,24–1,24 | +0,18 | +0,03 (+0,2) | −13 pe | – | +0,20 / −0,10  |
| Direktspel | 86 | 2,34–1,15 | +0,27 | +0,12 (+1,0) | −5 pe | – | +0,14 / +0,03 ✔ |
| Lågpress | 73 | 2,15–1,27 | +0,03 | −0,12 (−0,8) | −8 pe | – | −0,00 / −0,51 ✔ |
| Mellanpress | 88 | 2,22–1,17 | +0,31 | +0,16 (+1,2) | −9 pe | – | +0,33 / −0,01  |
| Högpress | 56 | 2,14–1,29 | +0,05 | −0,10 (−0,6) | −7 pe | – | −0,10 / −0,10 ✔ |
| Svag på fasta | 78 | 2,22–1,23 | +0,28 | +0,13 (+0,9) | −14 pe | – | +0,19 / +0,09 ✔ |
| Medel på fasta | 73 | 2,08–1,21 | +0,04 | −0,11 (−0,7) | −10 pe | – | +0,23 / −0,44  |
| Farlig på fasta | 66 | 2,23–1,27 | +0,12 | −0,03 (−0,2) | −0 pe | – | +0,01 / −0,11  |
| Stark mot fasta | 88 | 2,08–1,26 | −0,05 | −0,20 (−1,4) | −10 pe | – | +0,12 / −0,43  |
| Medel mot fasta | 70 | 1,99–1,13 | +0,15 | +0,00 (+0,0) | −5 pe | – | −0,05 / +0,04  |
| Svag mot fasta | 59 | 2,54–1,32 | +0,44 | +0,29 (+1,9) | −10 pe | – | +0,27 / +0,33 ✔ |

- Svårast mot **Stark mot fasta** (−0,20 p/match rel. eget snitt, z −1,4, 88 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,29 p/match rel. eget snitt, z +1,9, 59 m) – åt samma håll i båda halvorna men svagt

### Rosenborg

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 52,5 %). 217 matcher med stil, mot marknaden totalt +0,01 per match.

Fasta situationer per match: 2026 (21 m): 0,14 mål för (xG 0,26), 0,33 emot (xG 0,29), 6,09 hörnor · 2025 (30 m): 0,20 mål för (xG 0,30), 0,10 emot (xG 0,18), 6,10 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 1,81–1,15 | +0,10 | +0,09 (+0,7) | −2 pe | – | −0,02 / +0,17  |
| Balanserat | 69 | 1,61–1,55 | −0,10 | −0,11 (−0,7) | −5 pe | – | −0,10 / −0,14 ✔ |
| Bollinnehav | 76 | 1,88–1,42 | +0,03 | +0,02 (+0,1) | +6 pe | – | +0,06 / −0,02  |
| Kortpass | 74 | 1,73–1,61 | +0,03 | +0,02 (+0,1) | −2 pe | – | +0,31 / −0,02  |
| Blandat | 65 | 1,86–1,43 | −0,02 | −0,03 (−0,2) | +2 pe | – | −0,13 / +0,08  |
| Direktspel | 78 | 1,73–1,10 | +0,02 | +0,01 (+0,1) | −0 pe | – | −0,01 / +0,14  |
| Lågpress | 69 | 1,75–1,25 | −0,03 | −0,04 (−0,3) | +5 pe | – | −0,06 / +0,01  |
| Mellanpress | 92 | 1,70–1,41 | −0,06 | −0,07 (−0,6) | +3 pe | – | +0,03 / −0,18  |
| Högpress | 56 | 1,91–1,46 | +0,18 | +0,17 (+1,0) | −11 pe | – | −0,15 / +0,22  |
| Svag på fasta | 77 | 1,79–1,64 | −0,08 | −0,09 (−0,6) | −4 pe | – | −0,26 / +0,02  |
| Medel på fasta | 75 | 1,91–1,31 | +0,03 | +0,02 (+0,1) | +7 pe | – | +0,09 / −0,06  |
| Farlig på fasta | 65 | 1,58–1,14 | +0,10 | +0,09 (+0,6) | −4 pe | – | +0,04 / +0,16 ✔ |
| Stark mot fasta | 87 | 1,79–1,24 | +0,15 | +0,14 (+1,1) | −3 pe | – | +0,08 / +0,18 ✔ |
| Medel mot fasta | 73 | 1,79–1,53 | −0,09 | −0,10 (−0,7) | +4 pe | – | −0,22 / +0,01  |
| Svag mot fasta | 57 | 1,70–1,37 | −0,07 | −0,08 (−0,6) | −0 pe | – | +0,06 / −0,38  |

- Svårast mot **Medel mot fasta** (−0,10 p/match rel. eget snitt, z −0,7, 73 m) – inte stabilt, troligen slump
- Bäst mot **Stark mot fasta** (+0,14 p/match rel. eget snitt, z +1,1, 87 m) – åt samma håll i båda halvorna men svagt

### Sandefjord

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 50,3 %). 168 matcher med stil, mot marknaden totalt +0,02 per match.

Fasta situationer per match: 2026 (21 m): 0,24 mål för (xG 0,18), 0,24 emot (xG 0,31), 5,48 hörnor · 2025 (30 m): 0,30 mål för (xG 0,21), 0,23 emot (xG 0,23), 4,40 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,42–1,74 | +0,04 | +0,02 (+0,1) | +4 pe | – | −0,11 / +0,16  |
| Balanserat | 48 | 1,31–1,88 | −0,16 | −0,18 (−1,1) | −13 pe | – | −0,26 / −0,11 ✔ |
| Bollinnehav | 55 | 1,47–1,84 | +0,15 | +0,13 (+0,9) | −1 pe | – | +0,12 / +0,15 ✔ |
| Kortpass | 73 | 1,37–1,58 | +0,08 | +0,07 (+0,5) | −4 pe | – | −0,08 / +0,10  |
| Blandat | 49 | 1,53–1,94 | −0,07 | −0,09 (−0,6) | +2 pe | – | −0,08 / −0,11 ✔ |
| Direktspel | 46 | 1,33–2,04 | +0,01 | −0,01 (−0,1) | −5 pe | – | −0,08 / +0,41  |
| Lågpress | 38 | 1,50–1,74 | −0,07 | −0,09 (−0,6) | +10 pe | – | −0,09 / −0,08 ✔ |
| Mellanpress | 78 | 1,36–1,87 | +0,07 | +0,06 (+0,4) | −7 pe | – | −0,04 / +0,17  |
| Högpress | 52 | 1,40–1,77 | −0,00 | −0,02 (−0,1) | −4 pe | – | −0,17 / +0,07  |
| Svag på fasta | 64 | 1,45–1,80 | +0,18 | +0,16 (+1,1) | −3 pe | – | −0,06 / +0,31  |
| Medel på fasta | 57 | 1,47–2,00 | −0,09 | −0,10 (−0,7) | −4 pe | – | −0,17 / −0,02 ✔ |
| Farlig på fasta | 47 | 1,26–1,60 | −0,07 | −0,09 (−0,5) | −0 pe | – | +0,00 / −0,20  |
| Stark mot fasta | 61 | 1,48–1,66 | −0,09 | −0,10 (−0,7) | +1 pe | – | +0,01 / −0,17  |
| Medel mot fasta | 66 | 1,42–2,08 | +0,07 | +0,05 (+0,3) | −9 pe | – | −0,20 / +0,35  |
| Svag mot fasta | 41 | 1,27–1,61 | +0,09 | +0,08 (+0,4) | +3 pe | – | +0,01 / +0,19 ✔ |

- Svårast mot **Balanserat** (−0,18 p/match rel. eget snitt, z −1,1, 48 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag på fasta** (+0,16 p/match rel. eget snitt, z +1,1, 64 m) – inte stabilt, troligen slump

### Sarpsborg 08

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress, Svag på fasta, Stark mot fasta** (faktiskt bollinnehav 45,2 %). 219 matcher med stil, mot marknaden totalt −0,11 per match.

Fasta situationer per match: 2026 (21 m): 0,14 mål för (xG 0,31), 0,29 emot (xG 0,21), 5,19 hörnor · 2025 (30 m): 0,30 mål för (xG 0,40), 0,20 emot (xG 0,20), 5,73 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 72 | 1,39–1,42 | −0,11 | +0,00 (+0,0) | +1 pe | – | −0,09 / +0,07  |
| Balanserat | 75 | 1,31–1,64 | −0,18 | −0,07 (−0,5) | +3 pe | – | −0,13 / +0,03  |
| Bollinnehav | 72 | 1,60–1,74 | −0,04 | +0,07 (+0,5) | +1 pe | – | +0,08 / +0,06 ✔ |
| Kortpass | 73 | 1,66–1,47 | +0,28 | +0,39 (+2,5) | +1 pe | – | +0,93 / +0,33 ✔ ⚑ |
| Blandat | 66 | 1,39–1,95 | −0,40 | −0,29 (−2,1) | −1 pe | – | +0,01 / −0,57  |
| Direktspel | 80 | 1,25–1,43 | −0,24 | −0,12 (−0,8) | +4 pe | – | −0,21 / +0,38  |
| Lågpress | 70 | 1,23–1,57 | −0,29 | −0,18 (−1,3) | +11 pe | – | −0,21 / −0,08 ✔ |
| Mellanpress | 93 | 1,35–1,48 | −0,03 | +0,09 (+0,6) | −3 pe | – | −0,01 / +0,18  |
| Högpress | 56 | 1,80–1,82 | −0,03 | +0,08 (+0,5) | −2 pe | – | +0,45 / −0,01  |
| Svag på fasta | 81 | 1,51–1,56 | +0,05 | +0,16 (+1,1) | +2 pe | – | +0,18 / +0,16 ✔ |
| Medel på fasta | 76 | 1,47–1,72 | −0,23 | −0,12 (−0,9) | +7 pe | – | −0,01 / −0,27 ✔ |
| Farlig på fasta | 62 | 1,27–1,50 | −0,18 | −0,07 (−0,4) | −5 pe | – | −0,27 / +0,30  |
| Stark mot fasta | 86 | 1,48–1,51 | −0,16 | −0,05 (−0,3) | −2 pe | – | +0,08 / −0,13  |
| Medel mot fasta | 78 | 1,56–1,83 | −0,12 | −0,01 (−0,1) | +3 pe | – | −0,18 / +0,16  |
| Svag mot fasta | 55 | 1,16–1,40 | −0,02 | +0,09 (+0,5) | +6 pe | – | −0,05 / +0,42  |

- Svårast mot **Blandat** (−0,29 p/match rel. eget snitt, z −2,1, 66 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,39 p/match rel. eget snitt, z +2,5, 73 m) – ⚑ håller i båda halvorna

### Tromso

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 50,5 %). 167 matcher med stil, mot marknaden totalt +0,11 per match.

Fasta situationer per match: 2026 (21 m): 0,33 mål för (xG 0,46), 0,19 emot (xG 0,20), 5,38 hörnor · 2025 (30 m): 0,33 mål för (xG 0,39), 0,33 emot (xG 0,16), 4,13 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,55–1,66 | +0,01 | −0,10 (−0,6) | −1 pe | – | −0,43 / +0,27  |
| Balanserat | 52 | 1,54–1,56 | +0,18 | +0,07 (+0,4) | −8 pe | – | +0,14 / +0,01 ✔ |
| Bollinnehav | 62 | 1,35–1,44 | +0,14 | +0,03 (+0,2) | −13 pe | – | +0,12 / −0,05  |
| Kortpass | 68 | 1,43–1,57 | +0,04 | −0,07 (−0,5) | −12 pe | – | +0,11 / −0,11  |
| Blandat | 41 | 1,56–1,27 | +0,21 | +0,10 (+0,5) | +2 pe | – | −0,10 / +0,32  |
| Direktspel | 58 | 1,47–1,71 | +0,13 | +0,02 (+0,1) | −10 pe | – | −0,08 / +0,75  |
| Lågpress | 45 | 1,76–1,56 | +0,13 | +0,02 (+0,1) | −9 pe | – | −0,05 / +0,14  |
| Mellanpress | 74 | 1,38–1,66 | +0,04 | −0,07 (−0,5) | −10 pe | – | −0,33 / +0,19  |
| Högpress | 48 | 1,35–1,35 | +0,20 | +0,09 (+0,5) | −2 pe | – | +0,50 / −0,13  |
| Svag på fasta | 64 | 1,28–1,72 | −0,11 | −0,22 (−1,3) | −13 pe | – | −0,32 / −0,16 ✔ |
| Medel på fasta | 53 | 1,64–1,40 | +0,25 | +0,14 (+0,8) | −2 pe | – | −0,06 / +0,34  |
| Farlig på fasta | 50 | 1,54–1,48 | +0,24 | +0,14 (+0,7) | −8 pe | – | +0,15 / +0,11 ✔ |
| Stark mot fasta | 61 | 1,66–1,31 | +0,32 | +0,21 (+1,3) | −11 pe | – | +0,05 / +0,32 ✔ |
| Medel mot fasta | 64 | 1,38–1,70 | −0,04 | −0,15 (−0,9) | −9 pe | – | −0,15 / −0,15 ✔ |
| Svag mot fasta | 42 | 1,36–1,64 | +0,03 | −0,08 (−0,4) | −2 pe | – | −0,05 / −0,11 ✔ |

- Svårast mot **Svag på fasta** (−0,22 p/match rel. eget snitt, z −1,3, 64 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,21 p/match rel. eget snitt, z +1,3, 61 m) – åt samma håll i båda halvorna men svagt

### Valerenga

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 49,7 %). 168 matcher med stil, mot marknaden totalt −0,13 per match.

Fasta situationer per match: 2026 (21 m): 0,24 mål för (xG 0,35), 0,33 emot (xG 0,34), 6,86 hörnor · 2025 (30 m): 0,30 mål för (xG 0,25), 0,43 emot (xG 0,44), 5,33 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 1,32–1,35 | −0,12 | +0,01 (+0,1) | −0 pe | – | −0,05 / +0,05  |
| Balanserat | 62 | 1,31–1,55 | −0,19 | −0,06 (−0,4) | +7 pe | – | −0,06 / −0,06 ✔ |
| Bollinnehav | 49 | 1,67–1,61 | −0,07 | +0,06 (+0,4) | −4 pe | – | +0,44 / −0,27  |
| Kortpass | 32 | 1,19–1,81 | −0,40 | −0,27 (−1,3) | +4 pe | – | +0,48 / −0,37  |
| Blandat | 54 | 1,56–1,46 | −0,01 | +0,12 (+0,7) | +0 pe | – | +0,18 / +0,10 ✔ |
| Direktspel | 82 | 1,41–1,40 | −0,11 | +0,02 (+0,2) | +1 pe | – | +0,03 / −0,00  |
| Lågpress | 60 | 1,37–1,38 | −0,12 | +0,02 (+0,1) | +3 pe | – | +0,07 / −0,21  |
| Mellanpress | 72 | 1,31–1,64 | −0,14 | −0,00 (−0,0) | +4 pe | – | +0,11 / −0,10  |
| Högpress | 36 | 1,72–1,42 | −0,15 | −0,02 (−0,1) | −7 pe | – | −0,11 / −0,01  |
| Svag på fasta | 57 | 1,46–1,56 | −0,19 | −0,05 (−0,3) | +5 pe | – | +0,10 / −0,14  |
| Medel på fasta | 51 | 1,47–1,73 | −0,02 | +0,11 (+0,6) | −5 pe | – | +0,06 / +0,18 ✔ |
| Farlig på fasta | 60 | 1,33–1,25 | −0,18 | −0,05 (−0,3) | +3 pe | – | +0,08 / −0,22  |
| Stark mot fasta | 62 | 1,63–1,24 | −0,05 | +0,09 (+0,6) | +8 pe | – | +0,19 / +0,01 ✔ |
| Medel mot fasta | 61 | 1,28–1,72 | −0,26 | −0,13 (−0,8) | −3 pe | – | +0,10 / −0,32  |
| Svag mot fasta | 45 | 1,31–1,56 | −0,08 | +0,05 (+0,3) | −1 pe | – | −0,04 / +0,22  |

- Svårast mot **Kortpass** (−0,27 p/match rel. eget snitt, z −1,3, 32 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,12 p/match rel. eget snitt, z +0,7, 54 m) – åt samma håll i båda halvorna men svagt

### Viking

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 51,2 %). 165 matcher med stil, mot marknaden totalt +0,18 per match.

Fasta situationer per match: 2026 (21 m): 0,76 mål för (xG 0,64), 0,19 emot (xG 0,19), 7,00 hörnor · 2025 (30 m): 0,57 mål för (xG 0,51), 0,20 emot (xG 0,16), 7,73 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 2,19–1,60 | +0,27 | +0,08 (+0,5) | −10 pe | – | +0,05 / +0,11 ✔ |
| Balanserat | 48 | 1,71–1,46 | +0,22 | +0,04 (+0,2) | −1 pe | – | −0,13 / +0,27  |
| Bollinnehav | 59 | 2,08–1,66 | +0,07 | −0,11 (−0,7) | +5 pe | – | −0,48 / +0,16  |
| Kortpass | 66 | 2,30–1,39 | +0,26 | +0,08 (+0,6) | +5 pe | – | −0,36 / +0,14  |
| Blandat | 63 | 1,86–1,76 | +0,08 | −0,10 (−0,6) | −5 pe | – | −0,26 / +0,27  |
| Direktspel | 36 | 1,75–1,61 | +0,22 | +0,04 (+0,2) | −7 pe | – | +0,00 / +0,20 ✔ |
| Lågpress | 41 | 2,00–1,71 | +0,19 | +0,01 (+0,0) | −8 pe | – | −0,07 / +0,18  |
| Mellanpress | 68 | 2,04–1,54 | +0,24 | +0,06 (+0,4) | −2 pe | – | −0,05 / +0,17  |
| Högpress | 56 | 1,98–1,54 | +0,11 | −0,08 (−0,4) | +4 pe | – | −0,53 / +0,18  |
| Svag på fasta | 72 | 1,85–1,60 | +0,06 | −0,13 (−0,9) | +2 pe | – | −0,37 / +0,03  |
| Medel på fasta | 54 | 2,22–1,74 | +0,24 | +0,06 (+0,4) | +0 pe | – | −0,19 / +0,42  |
| Farlig på fasta | 39 | 2,03–1,33 | +0,34 | +0,15 (+0,7) | −11 pe | – | +0,10 / +0,23 ✔ |
| Stark mot fasta | 74 | 2,22–1,42 | +0,30 | +0,11 (+0,8) | −1 pe | – | −0,06 / +0,24  |
| Medel mot fasta | 55 | 1,91–1,71 | +0,02 | −0,16 (−0,9) | +4 pe | – | −0,18 / −0,14 ✔ |
| Svag mot fasta | 36 | 1,75–1,72 | +0,20 | +0,02 (+0,1) | −12 pe | – | −0,32 / +0,56  |

- Svårast mot **Medel mot fasta** (−0,16 p/match rel. eget snitt, z −0,9, 55 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,11 p/match rel. eget snitt, z +0,8, 74 m) – inte stabilt, troligen slump
