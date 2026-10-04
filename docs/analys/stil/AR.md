# Stilmatchning – Liga Profesional (AR)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2432 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 233 m · hemma +0,03 · kryss −0 pe · ö2,5 – | 308 m · hemma +0,03 · kryss +1 pe · ö2,5 – | 215 m · hemma +0,11 · kryss +2 pe · ö2,5 – |
| **Mellan** | 309 m · hemma +0,02 · kryss +6 pe · ö2,5 – | 386 m · hemma −0,06 · kryss +2 pe · ö2,5 – | 285 m · hemma +0,04 · kryss +1 pe · ö2,5 – |
| **Mycket boll** | 229 m · hemma −0,02 · kryss −2 pe · ö2,5 – | 286 m · hemma −0,13 · kryss +3 pe · ö2,5 – | 181 m · hemma +0,08 · kryss −4 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 198 m · hemma −0,01 · kryss +4 pe · ö2,5 – | 318 m · hemma −0,02 · kryss −0 pe · ö2,5 – | 199 m · hemma −0,05 · kryss +2 pe · ö2,5 – |
| **Balanserat** | 322 m · hemma −0,10 · kryss +5 pe · ö2,5 – | 446 m · hemma +0,05 · kryss −2 pe · ö2,5 – | 298 m · hemma +0,01 · kryss +4 pe · ö2,5 – |
| **Bollinnehav** | 199 m · hemma +0,16 · kryss −3 pe · ö2,5 – | 298 m · hemma −0,04 · kryss +1 pe · ö2,5 – | 154 m · hemma +0,07 · kryss +1 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 818 m · mot marknaden −0,06 (z −1,5) · mål 1,02 · ö2,5 – | 634 m · mot marknaden +0,07 (z +1,4) · mål 1,03 · ö2,5 – | 318 m · mot marknaden −0,04 (z −0,5) · mål 1,14 · ö2,5 – |
| **Medel på fasta** | 533 m · mot marknaden −0,01 (z −0,1) · mål 1,09 · ö2,5 – | 638 m · mot marknaden −0,00 (z −0,1) · mål 1,07 · ö2,5 – | 323 m · mot marknaden −0,04 (z −0,7) · mål 1,05 · ö2,5 – |
| **Farlig på fasta** | 278 m · mot marknaden −0,07 (z −0,9) · mål 1,03 · ö2,5 – | 402 m · mot marknaden +0,02 (z +0,3) · mål 1,03 · ö2,5 – | 218 m · mot marknaden +0,09 (z +1,0) · mål 1,31 · ö2,5 – |

## Lag (säsong 2026)

### Aldosivi

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 43,0 %). 74 matcher med stil, mot marknaden totalt −0,21 per match.

Fasta situationer per match: 2026 (26 m): 0,19 mål för (xG 0,23), 0,35 emot (xG 0,30), 4,19 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 0,82–1,00 | +0,11 | +0,32 (+1,2) | +3 pe | – | +0,63 / −0,13  |
| Balanserat | 32 | 0,69–1,81 | −0,57 | −0,36 (−2,4) | −6 pe | – | −0,42 / −0,32 ✔ ⚑ |
| Bollinnehav | 20 | 0,90–1,85 | +0,01 | +0,22 (+0,8) | −7 pe | – | +0,48 / −0,17  |
| Kortpass | 16 | 0,63–1,44 | −0,24 | −0,03 (−0,1) | +8 pe | – | −0,00 / −0,06 ✔ |
| Blandat | 37 | 0,97–1,73 | −0,10 | +0,11 (+0,6) | −6 pe | – | +0,48 / −0,20  |
| Direktspel | 21 | 0,57–1,43 | −0,38 | −0,17 (−0,8) | −9 pe | – | +0,06 / −0,49  |
| Lågpress | 31 | 0,71–1,39 | −0,27 | −0,07 (−0,4) | +6 pe | – | +0,53 / −0,18  |
| Mellanpress | 17 | 0,59–2,18 | −0,58 | −0,37 (−2,0) | −14 pe | – | −0,29 / −0,45 ✔ ⚑ |
| Högpress | 26 | 1,00–1,42 | +0,12 | +0,32 (+1,2) | −8 pe | – | +0,36 / −0,07  |
| Svag på fasta | 18 | 0,67–1,89 | −0,46 | −0,25 (−1,1) | −15 pe | – | +0,01 / −0,66  |
| Medel på fasta | 20 | 0,95–1,70 | +0,24 | +0,45 (+1,4) | −12 pe | – | +0,44 / +0,50  |
| Farlig på fasta | 16 | 0,88–1,31 | −0,06 | +0,15 (+0,6) | +9 pe | – | +0,10 / +0,19 ✔ |
| Stark mot fasta | 11 | 0,55–1,55 | −0,59 | −0,38 (−1,2) | −18 pe | – | −0,04 / −0,97  |
| Medel mot fasta | 13 | 1,15–1,92 | +0,66 | +0,87 (+2,6) | −10 pe | – | +0,76 / +2,18  |
| Svag mot fasta | 25 | 0,76–1,60 | −0,29 | −0,09 (−0,4) | −4 pe | – | +0,00 / −0,31  |

- Svårast mot **Balanserat** (−0,36 p/match rel. eget snitt, z −2,4, 32 m) – ⚑ håller i båda halvorna
- Bäst mot **Medel på fasta** (+0,45 p/match rel. eget snitt, z +1,4, 20 m) – inte stabilt, troligen slump

### Argentinos Jrs

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 62,4 %). 189 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026 (29 m): 0,28 mål för (xG 0,31), 0,21 emot (xG 0,11), 5,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,43–1,02 | +0,11 | +0,12 (+0,7) | −0 pe | – | +0,07 / +0,19 ✔ |
| Balanserat | 95 | 1,09–0,92 | −0,05 | −0,04 (−0,3) | +0 pe | – | −0,28 / +0,16  |
| Bollinnehav | 41 | 1,15–0,83 | −0,07 | −0,06 (−0,3) | −3 pe | – | +0,23 / −0,35  |
| Kortpass | 56 | 1,07–0,79 | +0,01 | +0,01 (+0,1) | +7 pe | – | +0,34 / −0,13  |
| Blandat | 78 | 1,26–0,96 | −0,09 | −0,08 (−0,6) | −1 pe | – | −0,25 / +0,11  |
| Direktspel | 55 | 1,25–1,02 | +0,09 | +0,10 (+0,6) | −9 pe | – | −0,02 / +0,33  |
| Lågpress | 66 | 1,17–0,82 | +0,01 | +0,01 (+0,1) | +3 pe | – | −0,17 / +0,05  |
| Mellanpress | 55 | 1,11–0,76 | +0,12 | +0,13 (+0,8) | −3 pe | – | +0,08 / +0,20 ✔ |
| Högpress | 68 | 1,31–1,16 | −0,12 | −0,12 (−0,8) | −2 pe | – | −0,11 / −0,14 ✔ |
| Svag på fasta | 69 | 1,10–0,94 | −0,11 | −0,11 (−0,7) | +4 pe | – | −0,15 / +0,06  |
| Medel på fasta | 58 | 1,14–0,93 | −0,07 | −0,06 (−0,4) | −7 pe | – | −0,07 / −0,06 ✔ |
| Farlig på fasta | 40 | 1,43–0,90 | +0,18 | +0,19 (+1,0) | −5 pe | – | +0,35 / +0,10 ✔ |
| Stark mot fasta | 61 | 1,26–0,89 | +0,02 | +0,03 (+0,2) | −3 pe | – | −0,17 / +0,36  |
| Medel mot fasta | 61 | 1,25–0,97 | +0,03 | +0,04 (+0,3) | +1 pe | – | +0,17 / −0,08  |
| Svag mot fasta | 40 | 1,10–0,97 | −0,19 | −0,18 (−1,0) | −3 pe | – | −0,14 / −0,28 ✔ |

- Svårast mot **Svag mot fasta** (−0,18 p/match rel. eget snitt, z −1,0, 40 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,19 p/match rel. eget snitt, z +1,0, 40 m) – åt samma håll i båda halvorna men svagt

### Atl. Tucuman

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 43,9 %). 179 matcher med stil, mot marknaden totalt −0,04 per match.

Fasta situationer per match: 2026 (27 m): 0,33 mål för (xG 0,30), 0,26 emot (xG 0,17), 5,11 hörnor · 2025 (32 m): 0,31 mål för (xG 0,30), – emot (xG –), 4,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,15–1,30 | −0,00 | +0,04 (+0,2) | −7 pe | – | +0,18 / −0,14  |
| Balanserat | 79 | 0,86–1,03 | −0,01 | +0,03 (+0,2) | +8 pe | – | +0,25 / −0,17  |
| Bollinnehav | 47 | 1,00–1,28 | −0,13 | −0,09 (−0,5) | −4 pe | – | +0,17 / −0,32  |
| Kortpass | 43 | 0,88–1,05 | −0,05 | −0,00 (−0,0) | +1 pe | – | +0,33 / −0,17  |
| Blandat | 83 | 1,10–1,27 | −0,07 | −0,03 (−0,2) | +5 pe | – | +0,13 / −0,21  |
| Direktspel | 53 | 0,89–1,13 | +0,01 | +0,05 (+0,3) | −9 pe | – | +0,26 / −0,25  |
| Lågpress | 52 | 0,94–1,15 | −0,08 | −0,04 (−0,2) | −4 pe | – | −0,03 / −0,04 ✔ |
| Mellanpress | 59 | 0,95–1,32 | −0,20 | −0,16 (−1,0) | −12 pe | – | +0,12 / −0,49  |
| Högpress | 68 | 1,04–1,06 | +0,13 | +0,17 (+1,3) | +14 pe | – | +0,31 / −0,17  |
| Svag på fasta | 62 | 0,82–0,95 | +0,01 | +0,05 (+0,4) | +1 pe | – | +0,09 / −0,10  |
| Medel på fasta | 55 | 1,22–1,36 | +0,08 | +0,12 (+0,7) | +5 pe | – | +0,54 / −0,15  |
| Farlig på fasta | 41 | 1,07–1,32 | −0,06 | −0,02 (−0,1) | −13 pe | – | +0,15 / −0,15  |
| Stark mot fasta | 57 | 0,95–0,96 | +0,04 | +0,08 (+0,5) | −0 pe | – | +0,31 / −0,42  |
| Medel mot fasta | 66 | 0,83–1,30 | −0,04 | +0,00 (+0,0) | −1 pe | – | +0,14 / −0,09  |
| Svag mot fasta | 32 | 1,56–1,34 | +0,07 | +0,11 (+0,5) | −1 pe | – | +0,12 / +0,09 ✔ |

- Svårast mot **Mellanpress** (−0,16 p/match rel. eget snitt, z −1,0, 59 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,17 p/match rel. eget snitt, z +1,3, 68 m) – inte stabilt, troligen slump

### Banfield

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 40,6 %). 181 matcher med stil, mot marknaden totalt −0,09 per match.

Fasta situationer per match: 2026 (26 m): 0,08 mål för (xG 0,25), 0,27 emot (xG 0,23), 3,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 0,96–1,09 | −0,10 | −0,00 (−0,0) | −2 pe | – | +0,07 / −0,13  |
| Balanserat | 80 | 0,96–1,18 | −0,13 | −0,03 (−0,3) | +6 pe | – | +0,21 / −0,22  |
| Bollinnehav | 46 | 0,93–1,22 | −0,03 | +0,06 (+0,3) | −10 pe | – | −0,12 / +0,22  |
| Kortpass | 50 | 0,96–1,16 | −0,11 | −0,02 (−0,1) | −3 pe | – | +0,19 / −0,11  |
| Blandat | 82 | 0,95–1,18 | −0,21 | −0,12 (−0,9) | −2 pe | – | −0,12 / −0,11 ✔ |
| Direktspel | 49 | 0,96–1,12 | +0,12 | +0,22 (+1,2) | +4 pe | – | +0,28 / +0,09 ✔ |
| Lågpress | 61 | 1,13–1,23 | −0,02 | +0,07 (+0,4) | −5 pe | – | +0,08 / +0,07 ✔ |
| Mellanpress | 55 | 0,84–0,96 | −0,08 | +0,01 (+0,1) | +5 pe | – | +0,23 / −0,27  |
| Högpress | 65 | 0,89–1,26 | −0,17 | −0,08 (−0,5) | −2 pe | – | −0,02 / −0,21 ✔ |
| Svag på fasta | 72 | 0,78–0,96 | −0,08 | +0,01 (+0,1) | +8 pe | – | +0,10 / −0,31  |
| Medel på fasta | 52 | 1,02–1,25 | −0,04 | +0,06 (+0,3) | −10 pe | – | −0,10 / +0,16  |
| Farlig på fasta | 37 | 1,16–1,38 | −0,18 | −0,09 (−0,5) | +2 pe | – | +0,27 / −0,29  |
| Stark mot fasta | 62 | 0,82–0,95 | −0,10 | −0,01 (−0,0) | +7 pe | – | +0,02 / −0,04  |
| Medel mot fasta | 58 | 0,90–1,33 | −0,12 | −0,03 (−0,2) | −2 pe | – | +0,07 / −0,12  |
| Svag mot fasta | 37 | 1,19–1,08 | +0,02 | +0,12 (+0,5) | −6 pe | – | +0,16 / −0,00  |

- Svårast mot **Blandat** (−0,12 p/match rel. eget snitt, z −0,9, 82 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,22 p/match rel. eget snitt, z +1,2, 49 m) – åt samma håll i båda halvorna men svagt

### Barracas Central

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 43,8 %). 134 matcher med stil, mot marknaden totalt +0,15 per match.

Fasta situationer per match: 2026 (27 m): 0,37 mål för (xG 0,23), 0,22 emot (xG 0,16), 2,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 39 | 0,95–1,13 | +0,11 | −0,05 (−0,2) | +11 pe | – | −0,01 / −0,10 ✔ |
| Balanserat | 67 | 0,73–1,21 | +0,21 | +0,06 (+0,4) | +3 pe | – | −0,01 / +0,13  |
| Bollinnehav | 28 | 0,89–1,21 | +0,08 | −0,07 (−0,4) | +21 pe | – | −0,51 / +0,21  |
| Kortpass | 32 | 0,69–1,19 | −0,02 | −0,17 (−1,1) | +20 pe | – | −0,45 / −0,03 ✔ |
| Blandat | 63 | 0,92–1,14 | +0,27 | +0,11 (+0,7) | +5 pe | – | +0,01 / +0,23 ✔ |
| Direktspel | 39 | 0,79–1,26 | +0,11 | −0,04 (−0,2) | +6 pe | – | −0,07 / −0,01 ✔ |
| Lågpress | 50 | 0,82–1,06 | +0,16 | +0,01 (+0,0) | +3 pe | – | +0,18 / −0,01  |
| Mellanpress | 45 | 0,91–1,31 | +0,20 | +0,05 (+0,3) | +15 pe | – | −0,10 / +0,28  |
| Högpress | 39 | 0,74–1,21 | +0,08 | −0,07 (−0,4) | +10 pe | – | −0,13 / +0,43  |
| Svag på fasta | 45 | 0,69–1,29 | +0,05 | −0,11 (−0,7) | +8 pe | – | −0,16 / +0,09  |
| Medel på fasta | 42 | 0,98–1,26 | +0,19 | +0,04 (+0,2) | +8 pe | – | −0,20 / +0,32  |
| Farlig på fasta | 27 | 0,89–1,19 | +0,29 | +0,14 (+0,6) | +8 pe | – | +0,44 / −0,01  |
| Stark mot fasta | 48 | 0,98–1,15 | +0,36 | +0,20 (+1,2) | +5 pe | – | +0,07 / +0,43 ✔ |
| Medel mot fasta | 47 | 0,74–1,40 | +0,04 | −0,11 (−0,7) | +14 pe | – | −0,18 / +0,05  |
| Svag mot fasta | 14 | 0,79–1,21 | −0,17 | −0,32 (−1,3) | +13 pe | – | −0,55 / −0,23  |

- Svårast mot **Kortpass** (−0,17 p/match rel. eget snitt, z −1,1, 32 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,20 p/match rel. eget snitt, z +1,2, 48 m) – åt samma håll i båda halvorna men svagt

### Belgrano

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,8 %). 95 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026 (30 m): 0,27 mål för (xG 0,23), 0,17 emot (xG 0,18), 3,97 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 21 | 1,14–0,90 | +0,08 | +0,07 (+0,3) | +20 pe | – | −0,02 / +0,27  |
| Balanserat | 42 | 1,14–1,17 | +0,11 | +0,11 (+0,6) | +3 pe | – | −0,25 / +0,37  |
| Bollinnehav | 32 | 1,03–1,09 | −0,19 | −0,19 (−1,0) | +16 pe | – | −0,07 / −0,30 ✔ |
| Kortpass | 34 | 1,09–1,26 | −0,06 | −0,06 (−0,3) | +13 pe | – | +0,15 / −0,28  |
| Blandat | 47 | 1,23–0,98 | +0,18 | +0,18 (+1,1) | +8 pe | – | −0,30 / +0,59  |
| Direktspel | 14 | 0,71–1,00 | −0,43 | −0,44 (−1,8) | +19 pe | – | −0,22 / −0,72 ✔ |
| Lågpress | 55 | 1,16–1,16 | +0,09 | +0,09 (+0,5) | +7 pe | – | −0,10 / +0,17  |
| Mellanpress | 23 | 1,00–0,74 | +0,04 | +0,04 (+0,2) | +22 pe | – | +0,13 / −0,10  |
| Högpress | 17 | 1,06–1,29 | −0,35 | −0,35 (−1,5) | +11 pe | – | −0,35 / –  |
| Svag på fasta | 15 | 1,47–0,87 | +0,40 | +0,40 (+1,3) | +22 pe | – | +0,24 / +0,58 ✔ |
| Medel på fasta | 36 | 0,97–1,22 | −0,10 | −0,11 (−0,6) | +14 pe | – | −0,05 / −0,24 ✔ |
| Farlig på fasta | 22 | 1,18–1,45 | −0,10 | −0,10 (−0,4) | +1 pe | – | −0,46 / +0,53  |
| Stark mot fasta | 24 | 1,04–1,08 | −0,16 | −0,17 (−0,8) | +19 pe | – | −0,07 / −0,32 ✔ |
| Medel mot fasta | 31 | 0,94–1,13 | −0,09 | −0,09 (−0,4) | +15 pe | – | −0,18 / +0,23  |
| Svag mot fasta | 12 | 1,58–1,67 | +0,08 | +0,07 (+0,2) | +2 pe | – | −0,05 / +0,32  |

- Svårast mot **Högpress** (−0,35 p/match rel. eget snitt, z −1,5, 17 m) – inte stabilt, troligen slump
- Bäst mot **Svag på fasta** (+0,40 p/match rel. eget snitt, z +1,3, 15 m) – åt samma håll i båda halvorna men svagt

### Boca Juniors

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Svag på fasta, Medel mot fasta** (faktiskt bollinnehav 60,2 %). 190 matcher med stil, mot marknaden totalt +0,09 per match.

Fasta situationer per match: 2026 (28 m): 0,11 mål för (xG 0,21), 0,21 emot (xG 0,16), 5,32 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,11–0,98 | −0,07 | −0,16 (−0,9) | −6 pe | – | −0,03 / −0,34 ✔ |
| Balanserat | 80 | 1,26–0,75 | +0,10 | +0,01 (+0,1) | +1 pe | – | −0,15 / +0,17  |
| Bollinnehav | 56 | 1,43–0,79 | +0,23 | +0,14 (+0,9) | +1 pe | – | +0,05 / +0,21 ✔ |
| Kortpass | 56 | 1,66–0,82 | +0,37 | +0,28 (+1,7) | −5 pe | – | +0,23 / +0,30 ✔ |
| Blandat | 87 | 1,17–0,74 | +0,04 | −0,05 (−0,4) | +3 pe | – | −0,13 / +0,06  |
| Direktspel | 47 | 0,98–1,00 | −0,15 | −0,24 (−1,3) | −4 pe | – | −0,11 / −0,44 ✔ |
| Lågpress | 62 | 1,44–0,77 | +0,25 | +0,16 (+1,0) | −3 pe | – | −0,12 / +0,20  |
| Mellanpress | 58 | 1,22–0,83 | +0,04 | −0,05 (−0,3) | +3 pe | – | −0,02 / −0,08 ✔ |
| Högpress | 70 | 1,16–0,87 | −0,01 | −0,10 (−0,7) | −2 pe | – | −0,08 / −0,21 ✔ |
| Svag på fasta | 64 | 1,23–0,92 | +0,13 | +0,04 (+0,3) | −5 pe | – | −0,02 / +0,33  |
| Medel på fasta | 65 | 1,38–0,75 | +0,16 | +0,08 (+0,5) | −4 pe | – | −0,09 / +0,18  |
| Farlig på fasta | 39 | 1,05–0,85 | −0,10 | −0,19 (−1,0) | +1 pe | – | −0,13 / −0,24 ✔ |
| Stark mot fasta | 69 | 1,17–0,97 | −0,12 | −0,21 (−1,4) | −6 pe | – | −0,16 / −0,28 ✔ |
| Medel mot fasta | 65 | 1,22–0,57 | +0,27 | +0,18 (+1,2) | +4 pe | – | +0,01 / +0,35 ✔ |
| Svag mot fasta | 31 | 1,52–1,13 | +0,13 | +0,04 (+0,2) | −10 pe | – | +0,02 / +0,09 ✔ |

- Svårast mot **Stark mot fasta** (−0,21 p/match rel. eget snitt, z −1,4, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,28 p/match rel. eget snitt, z +1,7, 56 m) – åt samma håll i båda halvorna men svagt

### Central Cordoba

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 44,1 %). 181 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026 (26 m): 0,31 mål för (xG 0,21), 0,23 emot (xG 0,20), 4,35 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 0,94–1,23 | −0,03 | −0,02 (−0,1) | −0 pe | – | −0,17 / +0,14  |
| Balanserat | 74 | 0,85–1,30 | −0,04 | −0,03 (−0,2) | −5 pe | – | +0,06 / −0,12  |
| Bollinnehav | 54 | 1,20–1,41 | +0,06 | +0,07 (+0,4) | +4 pe | – | −0,02 / +0,15  |
| Kortpass | 59 | 1,10–1,37 | +0,09 | +0,09 (+0,6) | −5 pe | – | +0,07 / +0,10 ✔ |
| Blandat | 77 | 0,94–1,26 | −0,02 | −0,02 (−0,1) | +1 pe | – | +0,02 / −0,08  |
| Direktspel | 45 | 0,91–1,31 | −0,09 | −0,09 (−0,5) | −1 pe | – | −0,20 / +0,08  |
| Lågpress | 60 | 0,97–1,38 | −0,08 | −0,08 (−0,5) | −0 pe | – | −0,12 / −0,07 ✔ |
| Mellanpress | 57 | 0,88–1,37 | −0,10 | −0,09 (−0,6) | −0 pe | – | −0,28 / +0,18  |
| Högpress | 64 | 1,09–1,19 | +0,15 | +0,15 (+1,0) | −3 pe | – | +0,15 / +0,16 ✔ |
| Svag på fasta | 67 | 0,93–1,15 | +0,03 | +0,03 (+0,2) | −5 pe | – | +0,03 / +0,04 ✔ |
| Medel på fasta | 54 | 1,04–1,50 | −0,09 | −0,09 (−0,6) | +4 pe | – | −0,25 / +0,03  |
| Farlig på fasta | 39 | 1,08–1,38 | −0,01 | −0,01 (−0,0) | +1 pe | – | +0,05 / −0,05  |
| Stark mot fasta | 66 | 0,89–1,09 | −0,04 | −0,03 (−0,2) | +5 pe | – | −0,05 / −0,01 ✔ |
| Medel mot fasta | 61 | 1,15–1,52 | +0,04 | +0,04 (+0,3) | −3 pe | – | −0,06 / +0,17  |
| Svag mot fasta | 30 | 1,03–1,33 | −0,05 | −0,04 (−0,2) | −6 pe | – | +0,06 / −0,19  |

- Svårast mot **Mellanpress** (−0,09 p/match rel. eget snitt, z −0,6, 57 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,15 p/match rel. eget snitt, z +1,0, 64 m) – åt samma håll i båda halvorna men svagt

### Defensa y Justicia

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 51,8 %). 182 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,25), 0,37 emot (xG 0,25), 4,22 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,24–0,96 | +0,38 | +0,32 (+2,0) | −0 pe | – | +0,27 / +0,38 ✔ |
| Balanserat | 80 | 0,96–1,32 | −0,15 | −0,21 (−1,5) | −1 pe | – | −0,14 / −0,28 ✔ |
| Bollinnehav | 48 | 1,35–1,27 | +0,04 | −0,02 (−0,1) | +19 pe | – | +0,01 / −0,04  |
| Kortpass | 56 | 1,14–1,20 | +0,07 | +0,01 (+0,1) | +9 pe | – | +0,20 / −0,05  |
| Blandat | 74 | 1,05–1,30 | −0,09 | −0,16 (−1,1) | +4 pe | – | −0,13 / −0,19 ✔ |
| Direktspel | 52 | 1,29–1,08 | +0,27 | +0,21 (+1,3) | −1 pe | – | +0,14 / +0,32 ✔ |
| Lågpress | 58 | 1,09–1,29 | −0,03 | −0,09 (−0,6) | +4 pe | – | −0,20 / −0,06 ✔ |
| Mellanpress | 63 | 1,14–1,30 | +0,03 | −0,03 (−0,2) | +5 pe | – | −0,14 / +0,12  |
| Högpress | 61 | 1,21–1,02 | +0,17 | +0,11 (+0,7) | +4 pe | – | +0,19 / −0,12  |
| Svag på fasta | 72 | 1,15–1,15 | −0,01 | −0,07 (−0,5) | +2 pe | – | −0,04 / −0,16 ✔ |
| Medel på fasta | 54 | 1,22–1,19 | +0,03 | −0,03 (−0,2) | +13 pe | – | +0,05 / −0,08  |
| Farlig på fasta | 34 | 0,94–1,32 | +0,12 | +0,06 (+0,3) | −9 pe | – | +0,22 / −0,04  |
| Stark mot fasta | 69 | 1,07–1,13 | +0,05 | −0,01 (−0,1) | +0 pe | – | +0,10 / −0,14  |
| Medel mot fasta | 52 | 1,13–1,33 | −0,00 | −0,06 (−0,4) | +5 pe | – | −0,10 / −0,03 ✔ |
| Svag mot fasta | 37 | 1,30–1,14 | +0,08 | +0,02 (+0,1) | +7 pe | – | +0,01 / +0,03 ✔ |

- Svårast mot **Balanserat** (−0,21 p/match rel. eget snitt, z −1,5, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,32 p/match rel. eget snitt, z +2,0, 54 m) – åt samma håll i båda halvorna men svagt

### Dep. Riestra

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 35,9 %). 56 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026 (26 m): 0,12 mål för (xG 0,32), 0,19 emot (xG 0,14), 3,81 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 18 | 0,94–0,94 | −0,07 | −0,16 (−0,6) | +5 pe | – | +0,42 / −0,90  |
| Balanserat | 20 | 0,90–0,60 | +0,46 | +0,36 (+1,3) | +2 pe | – | +1,14 / −0,27  |
| Bollinnehav | 18 | 0,56–0,67 | −0,14 | −0,24 (−0,9) | +18 pe | – | +0,18 / −0,65  |
| Kortpass | 27 | 0,56–0,67 | −0,17 | −0,27 (−1,3) | +11 pe | – | +0,35 / −0,58  |
| Blandat | 15 | 1,07–1,00 | +0,20 | +0,10 (+0,3) | +1 pe | – | +0,55 / −0,57  |
| Direktspel | 14 | 1,00–0,57 | +0,51 | +0,41 (+1,4) | +9 pe | – | +0,80 / −0,57  |
| Lågpress | 43 | 0,67–0,77 | −0,03 | −0,13 (−0,7) | +9 pe | – | +0,47 / −0,56  |
| Mellanpress | 11 | 1,09–0,73 | +0,29 | +0,19 (+0,6) | +11 pe | – | +0,52 / −0,66  |
| Högpress | 2 | 2,00–0,00 | +1,80 | +1,71 (+7,5) | −32 pe | – | +1,71 / –  |
| Svag på fasta | 7 | 1,00–0,71 | +0,50 | +0,40 (+0,9) | −5 pe | – | +0,65 / −1,06  |
| Medel på fasta | 17 | 0,88–0,53 | +0,41 | +0,32 (+1,1) | +15 pe | – | +0,50 / −1,10  |
| Farlig på fasta | 10 | 1,20–0,60 | +0,62 | +0,52 (+1,5) | −3 pe | – | +0,66 / +0,18  |
| Stark mot fasta | 7 | 0,57–0,43 | +0,19 | +0,09 (+0,2) | +24 pe | – | +0,57 / −1,10  |
| Medel mot fasta | 21 | 1,10–0,57 | +0,76 | +0,66 (+2,6) | +6 pe | – | +0,79 / −0,50  |
| Svag mot fasta | 4 | 1,25–1,00 | −0,33 | −0,43 (−0,8) | −8 pe | – | −0,43 / –  |

- Svårast mot **Kortpass** (−0,27 p/match rel. eget snitt, z −1,3, 27 m) – inte stabilt, troligen slump
- Bäst mot **Medel mot fasta** (+0,66 p/match rel. eget snitt, z +2,6, 21 m) – inte stabilt, troligen slump

### Estudiantes L.P.

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 55,7 %). 189 matcher med stil, mot marknaden totalt −0,10 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,34), 0,22 emot (xG 0,19), 4,18 hörnor · 2025 (37 m): 0,70 mål för (xG 0,14), – emot (xG –), 4,43 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 49 | 1,10–0,92 | −0,04 | +0,05 (+0,3) | +2 pe | – | −0,01 / +0,14  |
| Balanserat | 74 | 1,05–1,14 | −0,14 | −0,05 (−0,3) | −4 pe | – | −0,03 / −0,06 ✔ |
| Bollinnehav | 66 | 1,27–1,11 | −0,09 | +0,01 (+0,1) | +2 pe | – | +0,02 / +0,00 ✔ |
| Kortpass | 61 | 1,15–0,98 | −0,04 | +0,06 (+0,4) | −3 pe | – | +0,24 / −0,03  |
| Blandat | 78 | 1,15–1,19 | −0,26 | −0,16 (−1,2) | +7 pe | – | −0,21 / −0,10 ✔ |
| Direktspel | 50 | 1,12–0,98 | +0,08 | +0,18 (+1,0) | −8 pe | – | +0,11 / +0,28 ✔ |
| Lågpress | 66 | 1,20–0,89 | +0,10 | +0,20 (+1,3) | −1 pe | – | +0,13 / +0,22 ✔ |
| Mellanpress | 56 | 0,93–1,07 | −0,25 | −0,15 (−0,9) | +4 pe | – | +0,07 / −0,42  |
| Högpress | 67 | 1,27–1,24 | −0,17 | −0,07 (−0,5) | −3 pe | – | −0,09 / −0,03 ✔ |
| Svag på fasta | 70 | 1,24–1,09 | −0,03 | +0,07 (+0,4) | −3 pe | – | +0,14 / −0,22  |
| Medel på fasta | 62 | 1,08–1,24 | −0,23 | −0,13 (−0,8) | +3 pe | – | −0,10 / −0,15 ✔ |
| Farlig på fasta | 32 | 1,09–1,00 | −0,06 | +0,03 (+0,2) | +7 pe | – | −0,43 / +0,39  |
| Stark mot fasta | 70 | 1,19–1,10 | −0,15 | −0,06 (−0,4) | +7 pe | – | +0,12 / −0,30  |
| Medel mot fasta | 57 | 1,16–1,12 | +0,08 | +0,18 (+1,1) | −3 pe | – | +0,17 / +0,19 ✔ |
| Svag mot fasta | 37 | 1,08–1,19 | −0,33 | −0,24 (−1,2) | −3 pe | – | −0,37 / +0,12  |

- Svårast mot **Blandat** (−0,16 p/match rel. eget snitt, z −1,2, 78 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,20 p/match rel. eget snitt, z +1,3, 66 m) – åt samma håll i båda halvorna men svagt

### Gimnasia L.P.

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 45,0 %). 184 matcher med stil, mot marknaden totalt +0,14 per match.

Fasta situationer per match: 2026 (29 m): 0,38 mål för (xG 0,35), 0,45 emot (xG 0,29), 3,86 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,07–0,95 | +0,18 | +0,03 (+0,2) | −5 pe | – | +0,11 / −0,05  |
| Balanserat | 87 | 0,90–1,38 | −0,12 | −0,26 (−1,9) | −10 pe | – | −0,32 / −0,22 ✔ |
| Bollinnehav | 41 | 1,29–0,95 | +0,66 | +0,52 (+2,7) | −6 pe | – | +0,59 / +0,43 ✔ ⚑ |
| Kortpass | 43 | 1,09–1,19 | +0,21 | +0,06 (+0,3) | −6 pe | – | +0,21 / −0,03  |
| Blandat | 82 | 1,05–1,11 | +0,18 | +0,03 (+0,2) | −6 pe | – | +0,28 / −0,19  |
| Direktspel | 59 | 0,98–1,19 | +0,05 | −0,09 (−0,5) | −11 pe | – | −0,31 / +0,25  |
| Lågpress | 58 | 0,88–1,34 | +0,06 | −0,09 (−0,5) | −19 pe | – | +0,20 / −0,13  |
| Mellanpress | 58 | 1,16–1,24 | +0,03 | −0,11 (−0,6) | −6 pe | – | −0,23 / +0,07  |
| Högpress | 68 | 1,07–0,91 | +0,31 | +0,17 (+1,2) | +1 pe | – | +0,20 / +0,09 ✔ |
| Svag på fasta | 71 | 0,90–1,24 | −0,04 | −0,19 (−1,3) | −2 pe | – | −0,06 / −0,71 ✔ |
| Medel på fasta | 53 | 1,17–0,94 | +0,31 | +0,16 (+0,9) | −9 pe | – | +0,08 / +0,22 ✔ |
| Farlig på fasta | 43 | 0,88–1,23 | +0,04 | −0,10 (−0,5) | −12 pe | – | +0,35 / −0,32  |
| Stark mot fasta | 57 | 0,98–1,23 | +0,07 | −0,08 (−0,5) | −4 pe | – | −0,03 / −0,16 ✔ |
| Medel mot fasta | 75 | 0,91–1,23 | −0,02 | −0,17 (−1,2) | −6 pe | – | −0,11 / −0,21 ✔ |
| Svag mot fasta | 27 | 1,33–0,63 | +0,50 | +0,35 (+1,4) | −12 pe | – | +0,37 / +0,27 ✔ |

- Svårast mot **Balanserat** (−0,26 p/match rel. eget snitt, z −1,9, 87 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,52 p/match rel. eget snitt, z +2,7, 41 m) – ⚑ håller i båda halvorna

### Huracan

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,7 %). 184 matcher med stil, mot marknaden totalt +0,12 per match.

Fasta situationer per match: 2026 (28 m): 0,21 mål för (xG 0,19), 0,21 emot (xG 0,22), 3,82 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,11–0,84 | +0,20 | +0,08 (+0,5) | +6 pe | – | +0,03 / +0,17 ✔ |
| Balanserat | 76 | 1,05–0,89 | +0,10 | −0,02 (−0,2) | −4 pe | – | −0,29 / +0,18  |
| Bollinnehav | 52 | 0,98–0,81 | +0,07 | −0,05 (−0,3) | +1 pe | – | −0,00 / −0,09 ✔ |
| Kortpass | 51 | 1,00–0,75 | +0,21 | +0,08 (+0,5) | +0 pe | – | −0,07 / +0,16  |
| Blandat | 82 | 1,02–0,83 | +0,07 | −0,05 (−0,4) | +2 pe | – | −0,20 / +0,09  |
| Direktspel | 51 | 1,14–1,00 | +0,13 | +0,00 (+0,0) | −3 pe | – | +0,02 / −0,03  |
| Lågpress | 61 | 1,08–0,74 | +0,22 | +0,10 (+0,7) | +8 pe | – | −0,11 / +0,13  |
| Mellanpress | 57 | 0,89–0,93 | −0,03 | −0,16 (−1,0) | −7 pe | – | −0,28 / +0,00  |
| Högpress | 66 | 1,15–0,89 | +0,17 | +0,04 (+0,3) | −1 pe | – | +0,02 / +0,11 ✔ |
| Svag på fasta | 71 | 1,06–0,94 | +0,07 | −0,06 (−0,4) | +2 pe | – | −0,10 / +0,14  |
| Medel på fasta | 57 | 1,05–0,75 | +0,25 | +0,13 (+0,8) | −1 pe | – | +0,14 / +0,12 ✔ |
| Farlig på fasta | 35 | 1,09–0,94 | +0,01 | −0,11 (−0,5) | −12 pe | – | −0,54 / +0,09  |
| Stark mot fasta | 67 | 1,01–0,97 | +0,01 | −0,12 (−0,8) | −4 pe | – | −0,27 / +0,10  |
| Medel mot fasta | 56 | 1,20–0,79 | +0,34 | +0,22 (+1,4) | −6 pe | – | +0,31 / +0,13 ✔ |
| Svag mot fasta | 35 | 0,89–0,83 | −0,05 | −0,18 (−0,9) | +7 pe | – | −0,27 / +0,06  |

- Svårast mot **Mellanpress** (−0,16 p/match rel. eget snitt, z −1,0, 57 m) – inte stabilt, troligen slump
- Bäst mot **Medel mot fasta** (+0,22 p/match rel. eget snitt, z +1,4, 56 m) – åt samma håll i båda halvorna men svagt

### Ind. Rivadavia

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 48,7 %). 55 matcher med stil, mot marknaden totalt +0,19 per match.

Fasta situationer per match: 2026 (28 m): 0,54 mål för (xG 0,36), 0,29 emot (xG 0,24), 4,21 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 9 | 0,67–0,67 | +0,08 | −0,10 (−0,2) | +3 pe | – | −0,23 / +0,05  |
| Balanserat | 29 | 1,28–1,28 | +0,00 | −0,19 (−0,9) | +7 pe | – | −0,35 / −0,07 ✔ |
| Bollinnehav | 17 | 1,47–1,00 | +0,56 | +0,37 (+1,1) | −2 pe | – | +0,31 / +0,46 ✔ |
| Kortpass | 23 | 1,35–1,30 | +0,20 | +0,01 (+0,1) | −1 pe | – | −0,20 / +0,34  |
| Blandat | 22 | 1,09–1,05 | +0,03 | −0,16 (−0,6) | +1 pe | – | −0,09 / −0,18 ✔ |
| Direktspel | 10 | 1,30–0,70 | +0,50 | +0,31 (+1,0) | +20 pe | – | +0,19 / +0,49  |
| Lågpress | 44 | 1,16–1,07 | +0,14 | −0,05 (−0,3) | +3 pe | – | −0,15 / +0,02  |
| Mellanpress | 11 | 1,55–1,18 | +0,39 | +0,20 (+0,5) | +5 pe | – | +0,07 / +0,56  |
| Svag på fasta | 10 | 0,80–1,50 | −0,41 | −0,60 (−2,4) | +8 pe | – | −0,60 / –  |
| Medel på fasta | 15 | 1,20–1,00 | +0,28 | +0,09 (+0,3) | +2 pe | – | +0,15 / −0,12  |
| Farlig på fasta | 11 | 1,09–0,64 | +0,32 | +0,14 (+0,4) | +24 pe | – | +0,38 / −0,06  |
| Stark mot fasta | 15 | 1,20–0,80 | +0,38 | +0,19 (+0,6) | +9 pe | – | +0,19 / –  |
| Medel mot fasta | 10 | 0,70–1,00 | −0,31 | −0,50 (−1,8) | +28 pe | – | −0,45 / −0,68  |
| Svag mot fasta | 6 | 1,17–1,67 | −0,03 | −0,22 (−0,4) | −14 pe | – | −0,38 / +0,11  |

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −0,9, 29 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,37 p/match rel. eget snitt, z +1,1, 17 m) – åt samma håll i båda halvorna men svagt

### Independiente

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 52,3 %). 181 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (28 m): 0,32 mål för (xG 0,31), 0,29 emot (xG 0,19), 5,75 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 1,12–1,05 | −0,08 | −0,06 (−0,4) | +2 pe | – | −0,23 / +0,12  |
| Balanserat | 76 | 1,16–0,96 | +0,05 | +0,06 (+0,4) | +1 pe | – | +0,04 / +0,08 ✔ |
| Bollinnehav | 48 | 0,96–0,79 | −0,05 | −0,03 (−0,2) | +15 pe | – | +0,04 / −0,11  |
| Kortpass | 43 | 1,12–0,79 | +0,02 | +0,04 (+0,2) | +12 pe | – | +0,02 / +0,05 ✔ |
| Blandat | 78 | 1,08–1,06 | −0,11 | −0,09 (−0,7) | +6 pe | – | −0,28 / +0,13  |
| Direktspel | 60 | 1,10–0,90 | +0,07 | +0,09 (+0,6) | −1 pe | – | +0,20 / −0,08  |
| Lågpress | 58 | 1,03–0,84 | −0,00 | +0,01 (+0,1) | +8 pe | – | −0,37 / +0,06  |
| Mellanpress | 54 | 1,31–1,09 | +0,03 | +0,05 (+0,3) | +2 pe | – | +0,15 / −0,10  |
| Högpress | 69 | 0,97–0,91 | −0,07 | −0,05 (−0,3) | +5 pe | – | −0,14 / +0,21  |
| Svag på fasta | 62 | 0,97–1,00 | −0,10 | −0,09 (−0,6) | +6 pe | – | −0,10 / −0,03 ✔ |
| Medel på fasta | 55 | 1,11–0,85 | −0,04 | −0,03 (−0,2) | +12 pe | – | +0,09 / −0,12  |
| Farlig på fasta | 42 | 1,12–0,93 | +0,08 | +0,10 (+0,5) | +0 pe | – | −0,10 / +0,21  |
| Stark mot fasta | 53 | 1,11–0,85 | +0,10 | +0,12 (+0,8) | +8 pe | – | +0,05 / +0,25 ✔ |
| Medel mot fasta | 74 | 0,96–0,89 | −0,11 | −0,10 (−0,7) | +8 pe | – | −0,15 / −0,06 ✔ |
| Svag mot fasta | 29 | 1,17–1,14 | −0,09 | −0,07 (−0,3) | +1 pe | – | −0,06 / −0,11 ✔ |

- Svårast mot **Medel mot fasta** (−0,10 p/match rel. eget snitt, z −0,7, 74 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Stark mot fasta** (+0,12 p/match rel. eget snitt, z +0,8, 53 m) – åt samma håll i båda halvorna men svagt

### Instituto

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 48,9 %). 90 matcher med stil, mot marknaden totalt −0,13 per match.

Fasta situationer per match: 2026 (27 m): 0,30 mål för (xG 0,30), 0,07 emot (xG 0,12), 5,30 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 26 | 1,23–1,04 | +0,09 | +0,22 (+1,0) | −2 pe | – | +0,32 / +0,13 ✔ |
| Balanserat | 37 | 1,03–1,27 | −0,29 | −0,17 (−0,9) | −8 pe | – | −0,28 / −0,03 ✔ |
| Bollinnehav | 27 | 0,93–1,26 | −0,10 | +0,02 (+0,1) | −24 pe | – | −0,10 / +0,14  |
| Kortpass | 29 | 0,76–1,10 | −0,30 | −0,18 (−0,8) | −11 pe | – | −0,45 / −0,02 ✔ |
| Blandat | 36 | 1,19–1,25 | −0,05 | +0,07 (+0,3) | −15 pe | – | +0,09 / +0,05 ✔ |
| Direktspel | 25 | 1,20–1,24 | −0,02 | +0,10 (+0,4) | −5 pe | – | −0,01 / +0,21  |
| Lågpress | 44 | 0,93–1,14 | −0,04 | +0,08 (+0,5) | −7 pe | – | +0,01 / +0,11 ✔ |
| Mellanpress | 25 | 0,88–1,24 | −0,43 | −0,30 (−1,4) | −4 pe | – | −0,41 / −0,11 ✔ |
| Högpress | 21 | 1,52–1,29 | +0,06 | +0,18 (+0,6) | −27 pe | – | +0,18 / +0,24  |
| Svag på fasta | 13 | 1,00–1,23 | −0,12 | +0,00 (+0,0) | −18 pe | – | +0,20 / −0,32  |
| Medel på fasta | 36 | 0,97–1,19 | −0,17 | −0,04 (−0,2) | −12 pe | – | −0,06 / +0,02  |
| Farlig på fasta | 22 | 1,09–1,32 | −0,34 | −0,22 (−0,9) | +0 pe | – | −0,28 / −0,15 ✔ |
| Stark mot fasta | 23 | 0,91–1,04 | −0,20 | −0,07 (−0,3) | −11 pe | – | −0,24 / +0,24  |
| Medel mot fasta | 37 | 1,05–1,41 | −0,27 | −0,15 (−0,7) | −10 pe | – | −0,10 / −0,23 ✔ |
| Svag mot fasta | 8 | 1,25–1,25 | −0,00 | +0,12 (+0,3) | −7 pe | – | +0,47 / −0,94  |

- Svårast mot **Mellanpress** (−0,30 p/match rel. eget snitt, z −1,4, 25 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,22 p/match rel. eget snitt, z +1,0, 26 m) – åt samma håll i båda halvorna men svagt

### Lanus

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 51,8 %). 182 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (28 m): 0,21 mål för (xG 0,23), 0,25 emot (xG 0,15), 4,29 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,25–1,02 | +0,10 | +0,12 (+0,8) | +3 pe | – | −0,05 / +0,30  |
| Balanserat | 75 | 1,09–1,01 | +0,02 | +0,04 (+0,3) | +4 pe | – | +0,06 / +0,02 ✔ |
| Bollinnehav | 51 | 0,98–1,27 | −0,21 | −0,19 (−1,1) | −1 pe | – | −0,29 / −0,11 ✔ |
| Kortpass | 47 | 1,11–1,15 | −0,03 | −0,01 (−0,1) | +1 pe | – | −0,30 / +0,13  |
| Blandat | 79 | 1,10–1,05 | −0,01 | +0,01 (+0,1) | +1 pe | – | +0,12 / −0,12  |
| Direktspel | 56 | 1,13–1,09 | −0,02 | −0,00 (−0,0) | +5 pe | – | −0,19 / +0,27  |
| Lågpress | 55 | 1,11–0,82 | +0,18 | +0,20 (+1,1) | −6 pe | – | +0,63 / +0,12 ✔ |
| Mellanpress | 58 | 1,09–1,17 | −0,08 | −0,06 (−0,4) | +12 pe | – | −0,22 / +0,12  |
| Högpress | 69 | 1,13–1,23 | −0,13 | −0,11 (−0,8) | +1 pe | – | −0,08 / −0,21 ✔ |
| Svag på fasta | 64 | 1,13–1,11 | +0,02 | +0,04 (+0,3) | +5 pe | – | +0,10 / −0,26  |
| Medel på fasta | 56 | 0,98–1,04 | −0,09 | −0,07 (−0,4) | +3 pe | – | −0,45 / +0,16  |
| Farlig på fasta | 38 | 1,24–1,18 | +0,01 | +0,03 (+0,2) | −1 pe | – | −0,09 / +0,12  |
| Stark mot fasta | 60 | 1,10–1,05 | −0,10 | −0,08 (−0,5) | +2 pe | – | −0,01 / −0,21 ✔ |
| Medel mot fasta | 66 | 1,06–1,15 | −0,03 | −0,01 (−0,1) | +3 pe | – | −0,25 / +0,18  |
| Svag mot fasta | 31 | 1,16–1,10 | +0,11 | +0,13 (+0,6) | +5 pe | – | +0,11 / +0,18 ✔ |

- Svårast mot **Bollinnehav** (−0,19 p/match rel. eget snitt, z −1,1, 51 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,20 p/match rel. eget snitt, z +1,1, 55 m) – åt samma håll i båda halvorna men svagt

### Newells Old Boys

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 45,0 %). 181 matcher med stil, mot marknaden totalt −0,00 per match.

Fasta situationer per match: 2026 (27 m): 0,33 mål för (xG 0,26), 0,30 emot (xG 0,30), 3,70 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,25–0,82 | +0,41 | +0,41 (+2,2) | −6 pe | – | +0,24 / +0,62 ✔ ⚑ |
| Balanserat | 79 | 0,94–1,24 | −0,15 | −0,14 (−1,1) | −2 pe | – | +0,07 / −0,36  |
| Bollinnehav | 51 | 0,73–1,16 | −0,20 | −0,19 (−1,1) | −7 pe | – | +0,13 / −0,44  |
| Kortpass | 56 | 0,88–1,30 | −0,16 | −0,16 (−1,0) | −1 pe | – | +0,26 / −0,31  |
| Blandat | 76 | 1,01–1,08 | −0,00 | +0,00 (+0,0) | −7 pe | – | +0,13 / −0,18  |
| Direktspel | 49 | 1,00–0,90 | +0,17 | +0,17 (+0,9) | −4 pe | – | +0,09 / +0,32 ✔ |
| Lågpress | 59 | 0,92–1,36 | −0,11 | −0,11 (−0,7) | −4 pe | – | +0,75 / −0,27  |
| Mellanpress | 52 | 0,87–0,88 | +0,03 | +0,04 (+0,2) | −0 pe | – | +0,23 / −0,19  |
| Högpress | 70 | 1,09–1,04 | +0,06 | +0,07 (+0,4) | −8 pe | – | −0,01 / +0,31  |
| Svag på fasta | 69 | 1,13–0,97 | +0,14 | +0,14 (+1,0) | −5 pe | – | +0,10 / +0,32 ✔ |
| Medel på fasta | 52 | 0,77–1,12 | −0,26 | −0,26 (−1,6) | +0 pe | – | +0,14 / −0,51  |
| Farlig på fasta | 40 | 0,85–1,10 | +0,06 | +0,06 (+0,3) | −15 pe | – | +0,29 / −0,08  |
| Stark mot fasta | 64 | 0,88–0,94 | −0,15 | −0,15 (−1,0) | −0 pe | – | −0,05 / −0,29 ✔ |
| Medel mot fasta | 58 | 0,88–1,16 | +0,02 | +0,02 (+0,1) | −10 pe | – | +0,14 / −0,08  |
| Svag mot fasta | 35 | 1,26–1,06 | +0,23 | +0,24 (+1,0) | −13 pe | – | +0,47 / −0,20  |

- Svårast mot **Medel på fasta** (−0,26 p/match rel. eget snitt, z −1,6, 52 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,41 p/match rel. eget snitt, z +2,2, 51 m) – ⚑ håller i båda halvorna

### Platense

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Svag på fasta, Svag mot fasta** (faktiskt bollinnehav 50,1 %). 177 matcher med stil, mot marknaden totalt −0,01 per match.

Fasta situationer per match: 2026 (26 m): 0,08 mål för (xG 0,19), 0,35 emot (xG 0,25), 4,19 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 55 | 0,67–0,91 | −0,15 | −0,14 (−1,0) | +9 pe | – | −0,28 / −0,00 ✔ |
| Balanserat | 70 | 0,94–1,17 | +0,04 | +0,05 (+0,4) | −2 pe | – | +0,11 / −0,02  |
| Bollinnehav | 52 | 0,81–0,96 | +0,06 | +0,07 (+0,4) | +3 pe | – | +0,16 / +0,01 ✔ |
| Kortpass | 46 | 0,78–1,00 | −0,04 | −0,03 (−0,2) | +4 pe | – | +0,48 / −0,21  |
| Blandat | 78 | 0,83–0,97 | +0,07 | +0,08 (+0,6) | +8 pe | – | −0,04 / +0,25  |
| Direktspel | 53 | 0,83–1,13 | −0,11 | −0,10 (−0,6) | −5 pe | – | −0,12 / −0,07 ✔ |
| Lågpress | 63 | 0,71–1,05 | −0,12 | −0,11 (−0,8) | +12 pe | – | −0,24 / −0,08 ✔ |
| Mellanpress | 57 | 0,91–1,05 | +0,09 | +0,10 (+0,6) | −9 pe | – | +0,17 / −0,01  |
| Högpress | 57 | 0,84–0,98 | +0,01 | +0,02 (+0,1) | +5 pe | – | −0,06 / +0,28  |
| Svag på fasta | 67 | 0,96–1,06 | −0,00 | +0,01 (+0,1) | +1 pe | – | +0,01 / +0,01 ✔ |
| Medel på fasta | 53 | 0,74–1,00 | +0,06 | +0,08 (+0,5) | +4 pe | – | −0,09 / +0,20  |
| Farlig på fasta | 34 | 0,74–0,97 | −0,02 | −0,01 (−0,0) | +3 pe | – | +0,15 / −0,10  |
| Stark mot fasta | 58 | 0,81–1,00 | +0,02 | +0,03 (+0,2) | +2 pe | – | +0,03 / +0,02 ✔ |
| Medel mot fasta | 66 | 0,85–1,03 | +0,11 | +0,12 (+0,8) | −0 pe | – | +0,17 / +0,08 ✔ |
| Svag mot fasta | 28 | 0,86–0,96 | −0,11 | −0,10 (−0,5) | +12 pe | – | −0,30 / +0,33  |

- Svårast mot **Backar hem** (−0,14 p/match rel. eget snitt, z −1,0, 55 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Medel mot fasta** (+0,12 p/match rel. eget snitt, z +0,8, 66 m) – åt samma håll i båda halvorna men svagt

### Racing Club

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 56,9 %). 192 matcher med stil, mot marknaden totalt −0,02 per match.

Fasta situationer per match: 2026 (28 m): 0,32 mål för (xG 0,29), 0,25 emot (xG 0,31), 4,39 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,22–1,08 | −0,15 | −0,13 (−0,7) | −8 pe | – | +0,12 / −0,51  |
| Balanserat | 94 | 1,43–1,15 | −0,07 | −0,05 (−0,4) | +6 pe | – | −0,01 / −0,08 ✔ |
| Bollinnehav | 47 | 1,64–0,89 | +0,21 | +0,23 (+1,3) | −12 pe | – | +0,41 / +0,11 ✔ |
| Kortpass | 58 | 1,53–0,83 | +0,25 | +0,27 (+1,6) | −12 pe | – | +0,41 / +0,19 ✔ |
| Blandat | 87 | 1,43–1,07 | −0,03 | −0,01 (−0,1) | +5 pe | – | +0,09 / −0,10  |
| Direktspel | 47 | 1,28–1,36 | −0,34 | −0,31 (−1,7) | −3 pe | – | −0,05 / −0,88 ✔ |
| Lågpress | 65 | 1,23–1,03 | −0,07 | −0,05 (−0,3) | −1 pe | – | +0,06 / −0,07  |
| Mellanpress | 60 | 1,28–1,18 | −0,28 | −0,26 (−1,6) | −5 pe | – | −0,24 / −0,28 ✔ |
| Högpress | 67 | 1,73–1,00 | +0,26 | +0,28 (+1,8) | +0 pe | – | +0,38 / −0,02  |
| Svag på fasta | 78 | 1,56–1,08 | +0,06 | +0,08 (+0,5) | −2 pe | – | +0,14 / −0,09  |
| Medel på fasta | 57 | 1,39–0,98 | +0,04 | +0,06 (+0,4) | +1 pe | – | +0,19 / −0,00  |
| Farlig på fasta | 37 | 1,38–1,08 | −0,07 | −0,05 (−0,2) | −10 pe | – | −0,04 / −0,05 ✔ |
| Stark mot fasta | 71 | 1,34–1,17 | −0,19 | −0,16 (−1,1) | −1 pe | – | −0,16 / −0,16 ✔ |
| Medel mot fasta | 56 | 1,61–1,11 | +0,07 | +0,09 (+0,5) | −5 pe | – | +0,42 / −0,19  |
| Svag mot fasta | 38 | 1,58–0,74 | +0,40 | +0,42 (+2,2) | −2 pe | – | +0,27 / +0,80 ✔ ⚑ |

- Svårast mot **Direktspel** (−0,31 p/match rel. eget snitt, z −1,7, 47 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Svag mot fasta** (+0,42 p/match rel. eget snitt, z +2,2, 38 m) – ⚑ håller i båda halvorna

### River Plate

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 65,0 %). 189 matcher med stil, mot marknaden totalt −0,14 per match.

Fasta situationer per match: 2026 (30 m): 0,13 mål för (xG 0,32), 0,23 emot (xG 0,16), 5,30 hörnor · 2025 (35 m): 0,80 mål för (xG 0,15), – emot (xG –), 4,91 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 60 | 1,57–0,82 | −0,13 | +0,01 (+0,1) | +5 pe | – | +0,41 / −0,39  |
| Balanserat | 88 | 1,59–0,83 | −0,09 | +0,05 (+0,4) | −6 pe | – | −0,02 / +0,12  |
| Bollinnehav | 41 | 1,66–1,02 | −0,27 | −0,12 (−0,6) | +3 pe | – | +0,07 / −0,33  |
| Kortpass | 46 | 1,46–0,87 | −0,27 | −0,13 (−0,7) | +6 pe | – | +0,27 / −0,29  |
| Blandat | 85 | 1,59–0,85 | −0,00 | +0,14 (+1,0) | −0 pe | – | +0,19 / +0,07 ✔ |
| Direktspel | 58 | 1,72–0,90 | −0,25 | −0,10 (−0,6) | −6 pe | – | −0,01 / −0,22 ✔ |
| Lågpress | 64 | 1,30–0,83 | −0,18 | −0,04 (−0,3) | −3 pe | – | +0,31 / −0,11  |
| Mellanpress | 63 | 1,87–0,83 | +0,04 | +0,18 (+1,1) | −7 pe | – | +0,37 / −0,09  |
| Högpress | 62 | 1,63–0,95 | −0,28 | −0,14 (−1,0) | +9 pe | – | −0,10 / −0,28 ✔ |
| Svag på fasta | 69 | 1,55–0,75 | −0,10 | +0,04 (+0,3) | −3 pe | – | +0,09 / −0,15  |
| Medel på fasta | 53 | 1,53–0,87 | −0,24 | −0,10 (−0,6) | +16 pe | – | +0,14 / −0,31  |
| Farlig på fasta | 43 | 1,81–0,95 | −0,05 | +0,09 (+0,5) | −9 pe | – | +0,28 / −0,01  |
| Stark mot fasta | 56 | 1,89–0,88 | −0,14 | −0,00 (−0,0) | +1 pe | – | +0,09 / −0,17  |
| Medel mot fasta | 66 | 1,64–0,89 | −0,04 | +0,10 (+0,6) | +5 pe | – | +0,31 / −0,08  |
| Svag mot fasta | 38 | 1,29–0,74 | −0,25 | −0,11 (−0,5) | −0 pe | – | −0,00 / −0,40 ✔ |

- Svårast mot **Högpress** (−0,14 p/match rel. eget snitt, z −1,0, 62 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,18 p/match rel. eget snitt, z +1,1, 63 m) – inte stabilt, troligen slump

### Rosario Central

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Farlig på fasta, Stark mot fasta** (faktiskt bollinnehav 56,4 %). 188 matcher med stil, mot marknaden totalt +0,13 per match.

Fasta situationer per match: 2026 (29 m): 0,31 mål för (xG 0,43), 0,10 emot (xG 0,11), 5,10 hörnor · 2025 (35 m): 0,63 mål för (xG 0,09), – emot (xG –), 4,91 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 65 | 1,14–1,00 | −0,01 | −0,14 (−1,1) | +10 pe | – | −0,29 / +0,07  |
| Balanserat | 76 | 1,12–0,96 | +0,25 | +0,12 (+0,9) | −3 pe | – | +0,28 / +0,01 ✔ |
| Bollinnehav | 47 | 1,13–1,09 | +0,13 | +0,00 (+0,0) | −5 pe | – | −0,09 / +0,10  |
| Kortpass | 44 | 0,98–1,05 | −0,17 | −0,30 (−1,5) | −6 pe | – | −0,08 / −0,43 ✔ |
| Blandat | 85 | 1,07–0,96 | +0,15 | +0,02 (+0,2) | +4 pe | – | −0,09 / +0,13  |
| Direktspel | 59 | 1,32–1,03 | +0,33 | +0,20 (+1,3) | +2 pe | – | +0,02 / +0,44 ✔ |
| Lågpress | 58 | 1,05–0,84 | +0,10 | −0,03 (−0,2) | −2 pe | – | −0,45 / +0,03  |
| Mellanpress | 59 | 1,27–1,00 | +0,42 | +0,28 (+2,0) | −2 pe | – | +0,07 / +0,59 ✔ |
| Högpress | 71 | 1,07–1,14 | −0,08 | −0,21 (−1,5) | +6 pe | – | −0,07 / −0,59 ✔ |
| Svag på fasta | 76 | 1,12–0,88 | +0,33 | +0,19 (+1,4) | −1 pe | – | +0,19 / +0,20 ✔ |
| Medel på fasta | 56 | 1,02–1,21 | −0,03 | −0,16 (−1,1) | −2 pe | – | −0,48 / +0,07  |
| Farlig på fasta | 32 | 1,25–0,94 | +0,01 | −0,12 (−0,6) | +13 pe | – | −0,50 / +0,05  |
| Stark mot fasta | 57 | 1,14–0,93 | +0,28 | +0,15 (+0,9) | −6 pe | – | +0,12 / +0,21 ✔ |
| Medel mot fasta | 69 | 1,19–1,14 | +0,07 | −0,06 (−0,4) | +4 pe | – | −0,19 / +0,03  |
| Svag mot fasta | 34 | 0,94–0,91 | +0,02 | −0,11 (−0,6) | +9 pe | – | −0,16 / +0,03  |

- Svårast mot **Kortpass** (−0,30 p/match rel. eget snitt, z −1,5, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,28 p/match rel. eget snitt, z +2,0, 59 m) – åt samma håll i båda halvorna men svagt

### San Lorenzo

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 48,6 %). 184 matcher med stil, mot marknaden totalt +0,04 per match.

Fasta situationer per match: 2026 (28 m): 0,18 mål för (xG 0,26), 0,14 emot (xG 0,18), 3,82 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 0,98–0,98 | −0,03 | −0,08 (−0,5) | +1 pe | – | −0,26 / +0,12  |
| Balanserat | 79 | 0,80–0,68 | +0,15 | +0,11 (+0,8) | +15 pe | – | +0,22 / −0,00  |
| Bollinnehav | 49 | 0,96–0,98 | −0,04 | −0,08 (−0,5) | +9 pe | – | +0,09 / −0,25  |
| Kortpass | 48 | 0,85–1,10 | −0,33 | −0,38 (−2,5) | +3 pe | – | −0,16 / −0,50 ✔ ⚑ |
| Blandat | 75 | 0,75–0,80 | +0,03 | −0,02 (−0,1) | +21 pe | – | −0,08 / +0,06  |
| Direktspel | 61 | 1,11–0,72 | +0,36 | +0,32 (+2,0) | −0 pe | – | +0,26 / +0,39 ✔ |
| Lågpress | 53 | 0,77–1,06 | −0,09 | −0,14 (−0,8) | +1 pe | – | −0,08 / −0,14 ✔ |
| Mellanpress | 60 | 0,97–0,80 | +0,17 | +0,13 (+0,8) | +10 pe | – | +0,28 / −0,06  |
| Högpress | 71 | 0,93–0,75 | +0,03 | −0,01 (−0,1) | +15 pe | – | −0,11 / +0,28  |
| Svag på fasta | 61 | 0,89–0,75 | +0,01 | −0,04 (−0,2) | +12 pe | – | −0,01 / −0,17 ✔ |
| Medel på fasta | 63 | 0,95–0,92 | +0,02 | −0,03 (−0,2) | +11 pe | – | +0,18 / −0,18  |
| Farlig på fasta | 39 | 0,97–0,79 | +0,31 | +0,27 (+1,4) | +4 pe | – | −0,09 / +0,50  |
| Stark mot fasta | 61 | 0,85–0,75 | +0,09 | +0,05 (+0,3) | +4 pe | – | +0,06 / +0,04 ✔ |
| Medel mot fasta | 70 | 0,84–0,80 | +0,06 | +0,01 (+0,1) | +13 pe | – | −0,04 / +0,05  |
| Svag mot fasta | 30 | 1,30–1,07 | +0,06 | +0,02 (+0,1) | +12 pe | – | +0,10 / −0,23  |

- Svårast mot **Kortpass** (−0,38 p/match rel. eget snitt, z −2,5, 48 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,32 p/match rel. eget snitt, z +2,0, 61 m) – åt samma håll i båda halvorna men svagt

### Sarmiento Junin

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 44,0 %). 167 matcher med stil, mot marknaden totalt +0,06 per match.

Fasta situationer per match: 2026 (26 m): 0,35 mål för (xG 0,33), 0,31 emot (xG 0,32), 3,69 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 47 | 0,98–1,02 | +0,32 | +0,25 (+1,4) | +1 pe | – | +0,32 / +0,18 ✔ |
| Balanserat | 79 | 0,77–1,39 | −0,13 | −0,19 (−1,4) | −11 pe | – | −0,22 / −0,16 ✔ |
| Bollinnehav | 41 | 0,85–0,98 | +0,13 | +0,07 (+0,4) | +19 pe | – | +0,06 / +0,08 ✔ |
| Kortpass | 42 | 0,64–0,95 | −0,00 | −0,07 (−0,4) | +0 pe | – | −0,26 / +0,03  |
| Blandat | 78 | 1,04–1,23 | +0,17 | +0,11 (+0,8) | −7 pe | – | +0,15 / +0,06 ✔ |
| Direktspel | 47 | 0,72–1,32 | −0,06 | −0,13 (−0,9) | +10 pe | – | −0,06 / −0,20 ✔ |
| Lågpress | 59 | 0,86–1,20 | +0,18 | +0,12 (+0,7) | −5 pe | – | +0,08 / +0,12 ✔ |
| Mellanpress | 46 | 0,85–1,17 | −0,08 | −0,14 (−0,8) | +0 pe | – | −0,17 / −0,11 ✔ |
| Högpress | 62 | 0,84–1,18 | +0,06 | −0,01 (−0,0) | +3 pe | – | +0,11 / −0,36  |
| Svag på fasta | 61 | 0,75–1,11 | +0,02 | −0,04 (−0,3) | −3 pe | – | +0,03 / −0,37  |
| Medel på fasta | 50 | 0,84–1,16 | +0,10 | +0,04 (+0,2) | +7 pe | – | +0,04 / +0,04 ✔ |
| Farlig på fasta | 38 | 0,89–1,13 | +0,08 | +0,02 (+0,1) | +4 pe | – | −0,05 / +0,06  |
| Stark mot fasta | 57 | 0,77–1,14 | −0,14 | −0,21 (−1,3) | −2 pe | – | −0,23 / −0,17 ✔ |
| Medel mot fasta | 60 | 0,78–1,27 | +0,06 | −0,01 (−0,1) | +11 pe | – | +0,14 / −0,12  |
| Svag mot fasta | 26 | 0,92–0,81 | +0,42 | +0,36 (+1,4) | −3 pe | – | +0,28 / +0,69 ✔ |

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −1,4, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,25 p/match rel. eget snitt, z +1,4, 47 m) – åt samma håll i båda halvorna men svagt

### Talleres Cordoba

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 54,1 %). 179 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026 (27 m): 0,22 mål för (xG 0,26), 0,30 emot (xG 0,27), 4,67 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 1,12–1,09 | −0,13 | −0,05 (−0,3) | +5 pe | – | +0,01 / −0,13  |
| Balanserat | 78 | 1,14–0,91 | +0,11 | +0,19 (+1,4) | +2 pe | – | +0,21 / +0,18 ✔ |
| Bollinnehav | 44 | 1,14–1,23 | −0,35 | −0,27 (−1,4) | −5 pe | – | −0,10 / −0,43 ✔ |
| Kortpass | 49 | 0,84–1,27 | −0,51 | −0,43 (−2,6) | −1 pe | – | +0,05 / −0,60  |
| Blandat | 76 | 1,38–1,07 | +0,12 | +0,20 (+1,5) | +2 pe | – | −0,00 / +0,49  |
| Direktspel | 54 | 1,06–0,81 | +0,02 | +0,10 (+0,5) | +2 pe | – | +0,17 / −0,00  |
| Lågpress | 50 | 0,86–0,96 | −0,32 | −0,24 (−1,3) | +3 pe | – | −0,21 / −0,24 ✔ |
| Mellanpress | 56 | 1,18–1,07 | −0,01 | +0,08 (+0,5) | −10 pe | – | +0,02 / +0,13 ✔ |
| Högpress | 73 | 1,29–1,08 | +0,02 | +0,10 (+0,7) | +8 pe | – | +0,13 / +0,03 ✔ |
| Svag på fasta | 63 | 1,25–1,02 | +0,06 | +0,14 (+0,9) | −6 pe | – | +0,19 / −0,03  |
| Medel på fasta | 54 | 1,13–1,09 | −0,05 | +0,03 (+0,2) | −2 pe | – | −0,21 / +0,19  |
| Farlig på fasta | 41 | 1,00–0,98 | −0,29 | −0,21 (−1,1) | +21 pe | – | +0,07 / −0,38  |
| Stark mot fasta | 60 | 1,38–0,95 | +0,03 | +0,11 (+0,7) | −3 pe | – | +0,12 / +0,09 ✔ |
| Medel mot fasta | 65 | 1,03–1,09 | −0,09 | −0,01 (−0,1) | +2 pe | – | +0,35 / −0,32  |
| Svag mot fasta | 30 | 0,93–1,10 | −0,26 | −0,18 (−0,9) | +10 pe | – | −0,40 / +0,42  |

- Svårast mot **Kortpass** (−0,43 p/match rel. eget snitt, z −2,6, 49 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,20 p/match rel. eget snitt, z +1,5, 76 m) – inte stabilt, troligen slump

### Tigre

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 46,6 %). 134 matcher med stil, mot marknaden totalt −0,16 per match.

Fasta situationer per match: 2026 (26 m): 0,23 mål för (xG 0,38), 0,39 emot (xG 0,25), 4,15 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 31 | 0,90–0,94 | −0,09 | +0,07 (+0,3) | +4 pe | – | −0,06 / +0,29  |
| Balanserat | 69 | 0,83–1,04 | −0,10 | +0,05 (+0,4) | +4 pe | – | −0,37 / +0,42  |
| Bollinnehav | 34 | 0,91–1,26 | −0,33 | −0,17 (−0,8) | −2 pe | – | −0,28 / −0,08 ✔ |
| Kortpass | 45 | 0,89–1,09 | −0,14 | +0,01 (+0,1) | +7 pe | – | −0,26 / +0,17  |
| Blandat | 62 | 0,87–1,15 | −0,28 | −0,12 (−0,7) | −2 pe | – | −0,28 / +0,06  |
| Direktspel | 27 | 0,81–0,89 | +0,09 | +0,25 (+1,1) | +6 pe | – | −0,20 / +1,32  |
| Lågpress | 55 | 0,93–0,95 | +0,11 | +0,26 (+1,5) | −1 pe | – | −0,43 / +0,38  |
| Mellanpress | 44 | 0,80–1,14 | −0,36 | −0,21 (−1,3) | +6 pe | – | −0,31 / −0,03 ✔ |
| Högpress | 35 | 0,86–1,20 | −0,31 | −0,15 (−0,7) | +4 pe | – | −0,16 / −0,08  |
| Svag på fasta | 47 | 0,66–0,94 | −0,21 | −0,05 (−0,3) | −2 pe | – | −0,21 / +0,46  |
| Medel på fasta | 45 | 1,00–1,36 | −0,13 | +0,03 (+0,1) | −8 pe | – | −0,26 / +0,33  |
| Farlig på fasta | 23 | 0,91–0,83 | +0,05 | +0,20 (+0,9) | +21 pe | – | −0,46 / +0,55  |
| Stark mot fasta | 51 | 0,84–1,16 | −0,31 | −0,15 (−0,9) | +2 pe | – | −0,43 / +0,46  |
| Medel mot fasta | 49 | 0,84–0,96 | +0,01 | +0,16 (+0,9) | −4 pe | – | −0,02 / +0,41  |
| Svag mot fasta | 10 | 0,70–1,50 | −0,14 | +0,02 (+0,1) | +9 pe | – | −0,38 / +0,29  |

- Svårast mot **Mellanpress** (−0,21 p/match rel. eget snitt, z −1,3, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,26 p/match rel. eget snitt, z +1,5, 55 m) – inte stabilt, troligen slump

### Union de Santa Fe

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,5 %). 183 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026 (29 m): 0,24 mål för (xG 0,28), 0,38 emot (xG 0,27), 4,59 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 48 | 0,85–1,04 | −0,33 | −0,25 (−1,6) | +6 pe | – | −0,41 / −0,03 ✔ |
| Balanserat | 80 | 1,10–1,01 | +0,11 | +0,19 (+1,4) | +5 pe | – | +0,24 / +0,13 ✔ |
| Bollinnehav | 55 | 1,11–1,22 | −0,13 | −0,05 (−0,3) | −5 pe | – | −0,01 / −0,08 ✔ |
| Kortpass | 54 | 0,94–0,96 | −0,04 | +0,04 (+0,2) | +2 pe | – | +0,15 / +0,00 ✔ |
| Blandat | 82 | 1,05–1,11 | −0,15 | −0,07 (−0,6) | +4 pe | – | −0,06 / −0,08 ✔ |
| Direktspel | 47 | 1,13–1,17 | −0,00 | +0,08 (+0,4) | −1 pe | – | −0,04 / +0,27  |
| Lågpress | 60 | 1,18–1,18 | −0,18 | −0,10 (−0,7) | +2 pe | – | −0,20 / −0,08 ✔ |
| Mellanpress | 61 | 1,02–1,13 | −0,03 | +0,04 (+0,3) | −3 pe | – | −0,12 / +0,25  |
| Högpress | 62 | 0,92–0,94 | −0,02 | +0,05 (+0,4) | +8 pe | – | +0,10 / −0,06  |
| Svag på fasta | 69 | 0,87–1,01 | −0,05 | +0,02 (+0,2) | +10 pe | – | +0,04 / −0,05  |
| Medel på fasta | 55 | 0,89–0,80 | −0,09 | −0,01 (−0,1) | −4 pe | – | −0,04 / +0,01  |
| Farlig på fasta | 34 | 1,26–1,44 | −0,10 | −0,02 (−0,1) | +1 pe | – | −0,25 / +0,16  |
| Stark mot fasta | 65 | 0,80–0,97 | −0,19 | −0,12 (−0,8) | +7 pe | – | −0,08 / −0,17 ✔ |
| Medel mot fasta | 55 | 1,04–0,96 | +0,02 | +0,10 (+0,6) | −2 pe | – | +0,02 / +0,17 ✔ |
| Svag mot fasta | 37 | 1,14–1,22 | +0,02 | +0,09 (+0,5) | +5 pe | – | +0,02 / +0,28 ✔ |

- Svårast mot **Backar hem** (−0,25 p/match rel. eget snitt, z −1,6, 48 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,19 p/match rel. eget snitt, z +1,4, 80 m) – åt samma håll i båda halvorna men svagt

### Velez Sarsfield

Egen stil 2026 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,7 %). 184 matcher med stil, mot marknaden totalt −0,05 per match.

Fasta situationer per match: 2026 (27 m): 0,26 mål för (xG 0,24), 0,26 emot (xG 0,21), 4,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 62 | 1,21–1,00 | −0,13 | −0,07 (−0,5) | +9 pe | – | −0,10 / −0,04 ✔ |
| Balanserat | 74 | 1,01–0,82 | +0,10 | +0,16 (+1,1) | +4 pe | – | −0,13 / +0,48  |
| Bollinnehav | 48 | 1,00–1,04 | −0,20 | −0,15 (−0,9) | +3 pe | – | −0,24 / −0,07 ✔ |
| Kortpass | 41 | 1,07–0,80 | +0,02 | +0,07 (+0,4) | −2 pe | – | −0,49 / +0,28  |
| Blandat | 80 | 0,96–0,90 | −0,07 | −0,02 (−0,2) | +9 pe | – | −0,16 / +0,15  |
| Direktspel | 63 | 1,22–1,08 | −0,07 | −0,02 (−0,1) | +6 pe | – | −0,04 / +0,01  |
| Lågpress | 57 | 1,00–0,89 | +0,05 | +0,10 (+0,7) | +9 pe | – | +0,22 / +0,09 ✔ |
| Mellanpress | 53 | 1,06–0,87 | −0,03 | +0,02 (+0,1) | −1 pe | – | −0,06 / +0,12  |
| Högpress | 74 | 1,15–1,03 | −0,15 | −0,09 (−0,7) | +7 pe | – | −0,24 / +0,37  |
| Svag på fasta | 66 | 0,98–0,92 | −0,19 | −0,14 (−1,0) | +8 pe | – | −0,20 / +0,12  |
| Medel på fasta | 56 | 0,95–1,09 | −0,22 | −0,17 (−1,1) | +5 pe | – | −0,38 / −0,00 ✔ |
| Farlig på fasta | 40 | 1,35–0,85 | +0,24 | +0,29 (+1,4) | −5 pe | – | +0,49 / +0,19 ✔ |
| Stark mot fasta | 59 | 0,95–0,88 | −0,16 | −0,11 (−0,7) | +13 pe | – | −0,03 / −0,26 ✔ |
| Medel mot fasta | 70 | 1,11–1,03 | −0,06 | −0,00 (−0,0) | −2 pe | – | −0,25 / +0,20  |
| Svag mot fasta | 29 | 1,14–1,03 | −0,26 | −0,21 (−0,9) | +1 pe | – | −0,22 / −0,16 ✔ |

- Svårast mot **Medel på fasta** (−0,17 p/match rel. eget snitt, z −1,1, 56 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Farlig på fasta** (+0,29 p/match rel. eget snitt, z +1,4, 40 m) – åt samma håll i båda halvorna men svagt
