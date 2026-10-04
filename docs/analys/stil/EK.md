# Stilmatchning – Ekstraklasa (EK)

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 684 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 58 m · hemma −0,26 · kryss +10 pe · ö2,5 – | 68 m · hemma −0,04 · kryss +10 pe · ö2,5 – | 70 m · hemma +0,15 · kryss +8 pe · ö2,5 – |
| **Mellan** | 66 m · hemma +0,11 · kryss −4 pe · ö2,5 – | 90 m · hemma −0,05 · kryss −1 pe · ö2,5 – | 92 m · hemma −0,03 · kryss +2 pe · ö2,5 – |
| **Mycket boll** | 72 m · hemma +0,11 · kryss −8 pe · ö2,5 – | 94 m · hemma +0,04 · kryss −3 pe · ö2,5 – | 74 m · hemma −0,08 · kryss −0 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 54 m · hemma −0,11 · kryss +8 pe · ö2,5 – | 78 m · hemma −0,18 · kryss +13 pe · ö2,5 – | 68 m · hemma −0,17 · kryss +9 pe · ö2,5 – |
| **Balanserat** | 78 m · hemma −0,03 · kryss −1 pe · ö2,5 – | 103 m · hemma +0,10 · kryss −7 pe · ö2,5 – | 87 m · hemma +0,07 · kryss +1 pe · ö2,5 – |
| **Bollinnehav** | 67 m · hemma +0,25 · kryss −5 pe · ö2,5 – | 91 m · hemma +0,07 · kryss −0 pe · ö2,5 – | 58 m · hemma −0,11 · kryss −2 pe · ö2,5 – |

### Fasta situationer: lagets anfall mot motståndarens försvar

Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 276 m · mot marknaden +0,01 (z +0,2) · mål 1,38 · ö2,5 – | 214 m · mot marknaden −0,07 (z −0,8) · mål 1,22 · ö2,5 – | 126 m · mot marknaden −0,04 (z −0,3) · mål 1,36 · ö2,5 – |
| **Medel på fasta** | 213 m · mot marknaden +0,01 (z +0,2) · mål 1,46 · ö2,5 – | 203 m · mot marknaden +0,10 (z +1,1) · mål 1,33 · ö2,5 – | 118 m · mot marknaden −0,08 (z −0,8) · mål 1,27 · ö2,5 – |
| **Farlig på fasta** | 78 m · mot marknaden −0,10 (z −0,7) · mål 1,32 · ö2,5 – | 89 m · mot marknaden +0,07 (z +0,5) · mål 1,35 · ö2,5 – | 51 m · mot marknaden −0,08 (z −0,5) · mål 1,24 · ö2,5 – |

## Lag (säsong 2026/27)

### Cracovia

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 47,8 %). 91 matcher med stil, mot marknaden totalt −0,08 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,48), 0,11 emot (xG 0,23), 5,89 hörnor · 2025/26 (34 m): 0,27 mål för (xG 0,42), 0,41 emot (xG 0,22), 4,79 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,45–1,18 | +0,02 | +0,11 (+0,4) | +12 pe | – | +0,41 / −0,42  |
| Balanserat | 39 | 1,18–1,21 | +0,03 | +0,11 (+0,5) | +5 pe | – | +0,05 / +0,15 ✔ |
| Bollinnehav | 30 | 1,37–1,77 | −0,30 | −0,22 (−1,2) | +16 pe | – | −0,10 / −0,36 ✔ |
| Kortpass | 18 | 1,50–1,56 | −0,22 | −0,14 (−0,5) | +34 pe | – | −0,13 / −0,14  |
| Blandat | 42 | 1,14–1,48 | −0,21 | −0,13 (−0,7) | +7 pe | – | −0,22 / −0,06 ✔ |
| Direktspel | 31 | 1,42–1,16 | +0,17 | +0,25 (+1,1) | +0 pe | – | +0,43 / −0,18  |
| Lågpress | 24 | 1,54–1,63 | +0,11 | +0,19 (+0,7) | −2 pe | – | +0,57 / +0,03 ✔ |
| Mellanpress | 37 | 1,19–1,54 | −0,33 | −0,25 (−1,3) | +12 pe | – | −0,10 / −0,34 ✔ |
| Högpress | 30 | 1,27–1,00 | +0,08 | +0,16 (+0,7) | +18 pe | – | +0,10 / +0,39 ✔ |
| Svag på fasta | 42 | 1,12–1,38 | −0,14 | −0,06 (−0,3) | +14 pe | – | −0,22 / +0,11  |
| Medel på fasta | 35 | 1,29–1,26 | −0,04 | +0,04 (+0,2) | +6 pe | – | +0,31 / −0,20  |
| Farlig på fasta | 14 | 1,93–1,71 | −0,01 | +0,07 (+0,2) | +8 pe | – | +0,76 / −0,44  |
| Stark mot fasta | 39 | 1,36–1,31 | −0,19 | −0,10 (−0,6) | +15 pe | – | −0,00 / −0,24 ✔ |
| Medel mot fasta | 34 | 1,47–1,21 | +0,30 | +0,38 (+1,8) | +10 pe | – | +0,39 / +0,38 ✔ |
| Svag mot fasta | 18 | 0,89–1,89 | −0,58 | −0,50 (−2,0) | +0 pe | – | −0,41 / −0,54 ✔ ⚑ |

- Svårast mot **Svag mot fasta** (−0,50 p/match rel. eget snitt, z −2,0, 18 m) – ⚑ håller i båda halvorna
- Bäst mot **Medel mot fasta** (+0,38 p/match rel. eget snitt, z +1,8, 34 m) – åt samma håll i båda halvorna men svagt

### GKS Katowice

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 51,0 %). 35 matcher med stil, mot marknaden totalt +0,16 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,30), 0,38 emot (xG 0,40), 4,75 hörnor · 2025/26 (34 m): 0,53 mål för (xG 0,50), 0,27 emot (xG 0,27), 4,65 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 8 | 0,88–1,38 | −0,77 | −0,93 (−3,0) | −15 pe | – | −1,34 / −0,51  |
| Balanserat | 16 | 1,81–1,38 | +0,81 | +0,65 (+2,3) | −8 pe | – | +0,32 / +1,20 ✔ ⚑ |
| Bollinnehav | 11 | 1,36–1,64 | −0,11 | −0,27 (−0,8) | +2 pe | – | −0,26 / −0,28  |
| Kortpass | 14 | 1,64–1,71 | +0,16 | +0,00 (+0,0) | −11 pe | – | −0,13 / +0,08  |
| Blandat | 17 | 1,29–1,35 | +0,30 | +0,14 (+0,5) | +3 pe | – | −0,02 / +0,38  |
| Direktspel | 4 | 1,50–1,00 | −0,47 | −0,63 (−1,2) | −26 pe | – | −1,04 / −0,22  |
| Lågpress | 10 | 1,90–1,60 | +0,39 | +0,23 (+0,6) | −15 pe | – | −0,48 / +0,71  |
| Mellanpress | 21 | 1,05–1,29 | −0,04 | −0,19 (−0,7) | −3 pe | – | −0,16 / −0,23 ✔ |
| Högpress | 4 | 2,50–2,00 | +0,60 | +0,44 (+0,9) | +1 pe | – | +0,19 / +1,19  |
| Svag på fasta | 14 | 1,14–1,50 | −0,04 | −0,20 (−0,6) | +3 pe | – | −0,48 / +0,09  |
| Medel på fasta | 14 | 1,64–1,14 | +0,50 | +0,34 (+1,1) | −5 pe | – | +0,05 / +0,72 ✔ |
| Farlig på fasta | 7 | 1,71–2,00 | −0,12 | −0,28 (−0,5) | −27 pe | – | +0,01 / −0,40  |
| Stark mot fasta | 11 | 1,82–1,45 | +0,55 | +0,39 (+1,0) | −8 pe | – | −0,18 / +0,86  |
| Medel mot fasta | 12 | 1,25–1,25 | −0,03 | −0,19 (−0,5) | −9 pe | – | −0,26 / −0,11 ✔ |
| Svag mot fasta | 12 | 1,33–1,67 | −0,01 | −0,17 (−0,5) | −1 pe | – | −0,08 / −0,26 ✔ |

- Svårast mot **Mellanpress** (−0,19 p/match rel. eget snitt, z −0,7, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,65 p/match rel. eget snitt, z +2,3, 16 m) – ⚑ håller i båda halvorna

### Gornik Zabrze

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Lågpress, Medel på fasta, Stark mot fasta** (faktiskt bollinnehav 48,3 %). 91 matcher med stil, mot marknaden totalt +0,22 per match.

Fasta situationer per match: 2026/27 (9 m): 0,89 mål för (xG 0,42), 0,11 emot (xG 0,18), 5,33 hörnor · 2025/26 (34 m): 0,23 mål för (xG 0,30), 0,21 emot (xG 0,22), 5,74 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,39–1,00 | +0,58 | +0,36 (+1,4) | −10 pe | – | +0,36 / +0,36 ✔ |
| Balanserat | 36 | 1,36–1,44 | +0,01 | −0,21 (−1,0) | −2 pe | – | −0,03 / −0,31 ✔ |
| Bollinnehav | 27 | 1,04–1,04 | +0,12 | −0,10 (−0,4) | +0 pe | – | −0,20 / +0,03  |
| Kortpass | 20 | 1,20–1,00 | +0,25 | +0,03 (+0,1) | +3 pe | – | +0,34 / −0,02  |
| Blandat | 41 | 1,27–1,39 | −0,06 | −0,28 (−1,3) | −13 pe | – | −0,37 / −0,20 ✔ |
| Direktspel | 30 | 1,33–1,03 | +0,58 | +0,36 (+1,6) | +3 pe | – | +0,39 / +0,27 ✔ |
| Lågpress | 18 | 1,28–1,11 | +0,32 | +0,10 (+0,4) | +1 pe | – | +0,18 / +0,02 ✔ |
| Mellanpress | 45 | 1,33–1,31 | +0,18 | −0,04 (−0,2) | −10 pe | – | −0,19 / +0,04  |
| Högpress | 28 | 1,18–1,04 | +0,22 | −0,00 (−0,0) | +2 pe | – | +0,21 / −0,54  |
| Svag på fasta | 40 | 1,30–1,15 | +0,31 | +0,10 (+0,5) | −2 pe | – | +0,24 / −0,06  |
| Medel på fasta | 35 | 1,20–1,29 | +0,18 | −0,03 (−0,2) | −13 pe | – | +0,02 / −0,09  |
| Farlig på fasta | 16 | 1,38–1,06 | +0,05 | −0,17 (−0,5) | +11 pe | – | −0,35 / −0,02 ✔ |
| Stark mot fasta | 38 | 1,24–1,26 | +0,02 | −0,20 (−1,0) | +2 pe | – | −0,15 / −0,28 ✔ |
| Medel mot fasta | 33 | 1,15–1,03 | +0,35 | +0,14 (+0,6) | −3 pe | – | +0,37 / −0,06  |
| Svag mot fasta | 20 | 1,55–1,30 | +0,36 | +0,14 (+0,5) | −17 pe | – | +0,15 / +0,14 ✔ |

- Svårast mot **Blandat** (−0,28 p/match rel. eget snitt, z −1,3, 41 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,36 p/match rel. eget snitt, z +1,6, 30 m) – åt samma håll i båda halvorna men svagt

### Jagiellonia

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 57,3 %). 90 matcher med stil, mot marknaden totalt +0,25 per match.

Fasta situationer per match: 2026/27 (8 m): 0,00 mål för (xG 0,19), 0,50 emot (xG 0,39), 3,63 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,30), 0,27 emot (xG 0,32), 5,44 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,71–1,29 | +0,11 | −0,15 (−0,6) | +9 pe | – | +0,07 / −0,49  |
| Balanserat | 36 | 2,00–1,19 | +0,53 | +0,27 (+1,4) | +2 pe | – | +0,73 / +0,02 ✔ |
| Bollinnehav | 26 | 1,62–1,46 | +0,03 | −0,22 (−1,0) | +1 pe | – | −0,41 / +0,04  |
| Kortpass | 14 | 1,64–1,07 | +0,45 | +0,19 (+0,7) | −4 pe | – | +0,01 / +0,24  |
| Blandat | 42 | 1,71–1,14 | +0,27 | +0,02 (+0,1) | +7 pe | – | +0,40 / −0,22  |
| Direktspel | 34 | 1,97–1,59 | +0,15 | −0,10 (−0,5) | +3 pe | – | −0,08 / −0,19 ✔ |
| Lågpress | 21 | 1,38–1,29 | −0,02 | −0,27 (−1,1) | +18 pe | – | −0,34 / −0,22 ✔ |
| Mellanpress | 41 | 1,90–1,41 | +0,29 | +0,04 (+0,2) | −7 pe | – | +0,38 / −0,19  |
| Högpress | 28 | 1,96–1,14 | +0,40 | +0,15 (+0,7) | +10 pe | – | +0,07 / +0,34 ✔ |
| Svag på fasta | 42 | 1,86–1,29 | +0,36 | +0,11 (+0,6) | −0 pe | – | +0,20 / −0,01  |
| Medel på fasta | 36 | 1,53–1,33 | +0,07 | −0,18 (−0,9) | +10 pe | – | +0,07 / −0,38  |
| Farlig på fasta | 12 | 2,42–1,25 | +0,42 | +0,16 (+0,5) | +0 pe | – | −0,22 / +0,55  |
| Stark mot fasta | 40 | 1,90–1,30 | +0,21 | −0,04 (−0,2) | +1 pe | – | +0,16 / −0,35  |
| Medel mot fasta | 31 | 1,81–1,35 | +0,45 | +0,20 (+0,9) | −0 pe | – | −0,05 / +0,42  |
| Svag mot fasta | 19 | 1,58–1,21 | +0,03 | −0,23 (−0,9) | +16 pe | – | +0,21 / −0,43  |

- Svårast mot **Lågpress** (−0,27 p/match rel. eget snitt, z −1,1, 21 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,27 p/match rel. eget snitt, z +1,4, 36 m) – åt samma håll i båda halvorna men svagt

### Korona Kielce

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 47,6 %). 91 matcher med stil, mot marknaden totalt −0,06 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,33), 0,22 emot (xG 0,41), 4,56 hörnor · 2025/26 (34 m): 0,53 mål för (xG 0,51), 0,32 emot (xG 0,39), 4,88 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 26 | 0,85–1,00 | −0,11 | −0,05 (−0,3) | +20 pe | – | −0,27 / +0,25  |
| Balanserat | 35 | 1,20–1,37 | −0,03 | +0,03 (+0,1) | +7 pe | – | −0,24 / +0,21  |
| Bollinnehav | 30 | 1,10–1,47 | −0,04 | +0,01 (+0,1) | −3 pe | – | +0,04 / −0,02  |
| Kortpass | 18 | 1,44–1,22 | +0,38 | +0,44 (+1,5) | −11 pe | – | +0,86 / +0,36  |
| Blandat | 42 | 1,02–1,26 | −0,11 | −0,05 (−0,3) | +10 pe | – | −0,13 / +0,02  |
| Direktspel | 31 | 0,90–1,39 | −0,24 | −0,19 (−1,0) | +14 pe | – | −0,30 / +0,10  |
| Lågpress | 22 | 1,05–1,18 | +0,11 | +0,17 (+0,7) | +4 pe | – | −0,25 / +0,46  |
| Mellanpress | 41 | 1,17–1,41 | −0,19 | −0,13 (−0,8) | +13 pe | – | −0,28 / −0,03 ✔ |
| Högpress | 28 | 0,93–1,21 | +0,00 | +0,06 (+0,3) | +1 pe | – | −0,00 / +0,20  |
| Svag på fasta | 42 | 0,98–1,26 | −0,17 | −0,11 (−0,7) | +17 pe | – | −0,16 / −0,05 ✔ |
| Medel på fasta | 36 | 1,11–1,36 | −0,04 | +0,02 (+0,1) | +3 pe | – | −0,22 / +0,23  |
| Farlig på fasta | 13 | 1,23–1,23 | +0,25 | +0,31 (+1,0) | −13 pe | – | +0,08 / +0,50 ✔ |
| Stark mot fasta | 37 | 1,03–1,05 | −0,10 | −0,04 (−0,3) | +15 pe | – | −0,03 / −0,05 ✔ |
| Medel mot fasta | 34 | 1,09–1,44 | +0,01 | +0,07 (+0,3) | −1 pe | – | −0,26 / +0,44  |
| Svag mot fasta | 20 | 1,10–1,50 | −0,10 | −0,04 (−0,1) | +7 pe | – | −0,22 / +0,04  |

- Svårast mot **Direktspel** (−0,19 p/match rel. eget snitt, z −1,0, 31 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,44 p/match rel. eget snitt, z +1,5, 18 m) – inte stabilt, troligen slump

### Lech Poznan

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 53,1 %). 91 matcher med stil, mot marknaden totalt +0,12 per match.

Fasta situationer per match: 2026/27 (8 m): 0,13 mål för (xG 0,28), 0,25 emot (xG 0,16), 7,25 hörnor · 2025/26 (34 m): 0,27 mål för (xG 0,32), 0,27 emot (xG 0,23), 6,12 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 27 | 1,74–1,22 | +0,06 | −0,07 (−0,3) | −4 pe | – | −0,07 / −0,06 ✔ |
| Balanserat | 39 | 1,69–1,15 | +0,09 | −0,03 (−0,1) | +3 pe | – | −0,20 / +0,09  |
| Bollinnehav | 25 | 1,80–0,92 | +0,24 | +0,12 (+0,5) | +3 pe | – | −0,15 / +0,40  |
| Kortpass | 18 | 2,17–1,17 | +0,08 | −0,04 (−0,2) | −1 pe | – | +0,30 / −0,14  |
| Blandat | 43 | 1,67–1,02 | +0,30 | +0,17 (+0,9) | +0 pe | – | −0,01 / +0,30  |
| Direktspel | 30 | 1,57–1,20 | −0,10 | −0,22 (−1,0) | +4 pe | – | −0,32 / +0,10  |
| Lågpress | 18 | 2,28–1,00 | +0,47 | +0,34 (+1,1) | −25 pe | – | +0,27 / +0,39 ✔ |
| Mellanpress | 45 | 1,71–1,24 | +0,08 | −0,04 (−0,2) | +6 pe | – | −0,18 / +0,04  |
| Högpress | 28 | 1,43–0,96 | −0,03 | −0,16 (−0,7) | +10 pe | – | −0,24 / +0,14  |
| Svag på fasta | 40 | 1,52–1,20 | +0,01 | −0,11 (−0,6) | +2 pe | – | −0,28 / +0,12  |
| Medel på fasta | 36 | 1,72–0,92 | +0,33 | +0,20 (+1,0) | +2 pe | – | +0,11 / +0,28 ✔ |
| Farlig på fasta | 15 | 2,33–1,33 | −0,07 | −0,19 (−0,6) | −3 pe | – | −0,25 / −0,16 ✔ |
| Stark mot fasta | 39 | 1,59–1,10 | −0,03 | −0,15 (−0,8) | +3 pe | – | −0,38 / +0,11  |
| Medel mot fasta | 31 | 1,71–1,10 | +0,13 | +0,01 (+0,1) | +0 pe | – | −0,08 / +0,15  |
| Svag mot fasta | 21 | 2,05–1,14 | +0,39 | +0,27 (+1,1) | −1 pe | – | +0,64 / +0,15 ✔ |

- Svårast mot **Direktspel** (−0,22 p/match rel. eget snitt, z −1,0, 30 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,34 p/match rel. eget snitt, z +1,1, 18 m) – åt samma håll i båda halvorna men svagt

### Legia

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 49,4 %). 92 matcher med stil, mot marknaden totalt −0,15 per match.

Fasta situationer per match: 2026/27 (9 m): 0,67 mål för (xG 0,63), 0,22 emot (xG 0,23), 4,56 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,44), 0,41 emot (xG 0,27), 5,53 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 29 | 1,31–1,28 | −0,35 | −0,20 (−1,0) | +8 pe | – | −0,14 / −0,30 ✔ |
| Balanserat | 33 | 1,58–1,06 | −0,03 | +0,12 (+0,6) | +2 pe | – | −0,02 / +0,23  |
| Bollinnehav | 30 | 1,53–1,30 | −0,09 | +0,06 (+0,3) | +11 pe | – | +0,19 / −0,03  |
| Kortpass | 20 | 1,70–1,10 | +0,03 | +0,18 (+0,8) | +25 pe | – | +0,09 / +0,20  |
| Blandat | 37 | 1,38–1,08 | −0,20 | −0,05 (−0,2) | −1 pe | – | −0,05 / −0,04 ✔ |
| Direktspel | 35 | 1,46–1,40 | −0,21 | −0,05 (−0,3) | +6 pe | – | +0,01 / −0,23  |
| Lågpress | 20 | 1,45–1,35 | −0,35 | −0,20 (−0,9) | +20 pe | – | −0,50 / −0,03 ✔ |
| Mellanpress | 46 | 1,35–1,20 | −0,19 | −0,03 (−0,2) | +2 pe | – | −0,03 / −0,03 ✔ |
| Högpress | 26 | 1,73–1,12 | +0,06 | +0,21 (+0,9) | +6 pe | – | +0,18 / +0,30 ✔ |
| Svag på fasta | 42 | 1,36–1,17 | −0,08 | +0,07 (+0,4) | +7 pe | – | +0,17 / −0,04  |
| Medel på fasta | 33 | 1,52–1,36 | −0,24 | −0,09 (−0,4) | +5 pe | – | −0,09 / −0,08 ✔ |
| Farlig på fasta | 17 | 1,71–1,00 | −0,16 | −0,01 (−0,0) | +10 pe | – | −0,38 / +0,25  |
| Stark mot fasta | 36 | 1,33–1,17 | −0,26 | −0,11 (−0,5) | +5 pe | – | −0,25 / +0,13  |
| Medel mot fasta | 35 | 1,51–1,37 | −0,11 | +0,04 (+0,2) | +5 pe | – | +0,08 / +0,00 ✔ |
| Svag mot fasta | 21 | 1,67–1,00 | −0,03 | +0,12 (+0,5) | +12 pe | – | +0,64 / −0,09  |

- Svårast mot **Backar hem** (−0,20 p/match rel. eget snitt, z −1,0, 29 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +0,9, 26 m) – åt samma håll i båda halvorna men svagt

### Motor Lublin

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 46,2 %). 37 matcher med stil, mot marknaden totalt −0,13 per match.

Fasta situationer per match: 2026/27 (9 m): 0,11 mål för (xG 0,29), 0,56 emot (xG 0,59), 4,00 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,32), 0,32 emot (xG 0,38), 5,26 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 9 | 1,33–1,22 | +0,41 | +0,54 (+1,7) | +29 pe | – | +0,78 / +0,35  |
| Balanserat | 18 | 1,39–2,00 | −0,38 | −0,25 (−1,1) | +7 pe | – | −0,30 / −0,21 ✔ |
| Bollinnehav | 10 | 0,90–1,70 | −0,17 | −0,04 (−0,1) | +6 pe | – | +0,50 / −0,85  |
| Kortpass | 10 | 1,30–2,00 | −0,54 | −0,41 (−1,4) | +5 pe | – | −0,02 / −1,00  |
| Blandat | 25 | 1,28–1,64 | +0,07 | +0,19 (+0,9) | +14 pe | – | +0,40 / +0,03 ✔ |
| Direktspel | 2 | 0,50–1,50 | −0,49 | −0,36 (−2,4) | +26 pe | – | −0,57 / −0,15  |
| Lågpress | 7 | 0,86–0,71 | +0,29 | +0,42 (+1,0) | +18 pe | – | +1,54 / −0,41  |
| Mellanpress | 26 | 1,35–1,77 | −0,13 | +0,00 (+0,0) | +12 pe | – | +0,05 / −0,04  |
| Högpress | 4 | 1,25–3,25 | −0,89 | −0,76 (−3,3) | +0 pe | – | −0,75 / −0,77  |
| Svag på fasta | 16 | 1,38–1,88 | −0,06 | +0,07 (+0,2) | +6 pe | – | +0,31 / −0,64  |
| Medel på fasta | 14 | 1,07–1,57 | −0,24 | −0,12 (−0,6) | +24 pe | – | −0,39 / +0,04  |
| Farlig på fasta | 7 | 1,29–1,71 | −0,06 | +0,07 (+0,2) | +2 pe | – | +2,01 / −0,25  |
| Stark mot fasta | 11 | 1,36–1,82 | −0,02 | +0,11 (+0,3) | +10 pe | – | +0,30 / −0,38  |
| Medel mot fasta | 11 | 1,00–1,27 | −0,10 | +0,03 (+0,1) | −7 pe | – | +0,19 / −0,07  |
| Svag mot fasta | 15 | 1,33–2,00 | −0,23 | −0,10 (−0,5) | +27 pe | – | +0,10 / −0,23  |

- Svårast mot **Balanserat** (−0,25 p/match rel. eget snitt, z −1,1, 18 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,19 p/match rel. eget snitt, z +0,9, 25 m) – åt samma håll i båda halvorna men svagt

### Piast Gliwice

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 57,0 %). 91 matcher med stil, mot marknaden totalt −0,12 per match.

Fasta situationer per match: 2026/27 (9 m): 0,33 mål för (xG 0,23), 0,11 emot (xG 0,12), 4,78 hörnor · 2025/26 (34 m): 0,38 mål för (xG 0,38), 0,44 emot (xG 0,33), 5,38 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,32–1,09 | −0,07 | +0,05 (+0,2) | +15 pe | – | −0,03 / +0,21  |
| Balanserat | 38 | 1,05–0,95 | −0,01 | +0,11 (+0,6) | +7 pe | – | +0,44 / −0,10  |
| Bollinnehav | 31 | 0,81–1,16 | −0,29 | −0,17 (−0,7) | −2 pe | – | −0,39 / +0,04  |
| Kortpass | 19 | 0,79–1,37 | −0,47 | −0,35 (−1,2) | −2 pe | – | −1,56 / −0,12  |
| Blandat | 39 | 1,21–0,87 | +0,17 | +0,29 (+1,5) | +4 pe | – | +0,37 / +0,22 ✔ |
| Direktspel | 33 | 0,97–1,09 | −0,26 | −0,14 (−0,7) | +12 pe | – | −0,08 / −0,31 ✔ |
| Lågpress | 23 | 0,91–1,22 | −0,14 | −0,02 (−0,1) | −16 pe | – | +0,27 / −0,21  |
| Mellanpress | 40 | 1,15–1,05 | −0,15 | −0,03 (−0,1) | +16 pe | – | −0,16 / +0,07  |
| Högpress | 28 | 0,96–0,93 | −0,07 | +0,05 (+0,2) | +10 pe | – | +0,02 / +0,15 ✔ |
| Svag på fasta | 40 | 0,95–1,02 | −0,12 | +0,00 (+0,0) | +0 pe | – | +0,32 / −0,35  |
| Medel på fasta | 35 | 1,06–1,09 | −0,07 | +0,05 (+0,2) | +14 pe | – | −0,30 / +0,42  |
| Farlig på fasta | 16 | 1,19–1,06 | −0,23 | −0,11 (−0,3) | +3 pe | – | −0,20 / −0,05 ✔ |
| Stark mot fasta | 36 | 1,14–1,06 | −0,27 | −0,15 (−0,8) | +10 pe | – | +0,13 / −0,70  |
| Medel mot fasta | 34 | 0,79–1,21 | −0,30 | −0,18 (−0,9) | +3 pe | – | −0,28 / −0,09 ✔ |
| Svag mot fasta | 21 | 1,24–0,81 | +0,43 | +0,55 (+1,9) | +4 pe | – | +0,34 / +0,61 ✔ |

- Svårast mot **Kortpass** (−0,35 p/match rel. eget snitt, z −1,2, 19 m) – inte stabilt, troligen slump
- Bäst mot **Svag mot fasta** (+0,55 p/match rel. eget snitt, z +1,9, 21 m) – åt samma håll i båda halvorna men svagt

### Pogon Szczecin

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 41,7 %). 90 matcher med stil, mot marknaden totalt +0,00 per match.

Fasta situationer per match: 2026/27 (8 m): 0,38 mål för (xG 0,56), 0,38 emot (xG 0,46), 3,63 hörnor · 2025/26 (34 m): 0,53 mål för (xG 0,42), 0,35 emot (xG 0,37), 5,03 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,93–1,29 | +0,23 | +0,23 (+1,0) | +2 pe | – | +0,13 / +0,36 ✔ |
| Balanserat | 38 | 1,21–1,16 | −0,07 | −0,07 (−0,3) | −10 pe | – | −0,03 / −0,11 ✔ |
| Bollinnehav | 24 | 1,46–1,33 | −0,15 | −0,15 (−0,6) | −4 pe | – | −0,41 / +0,10  |
| Kortpass | 19 | 1,89–1,26 | +0,28 | +0,28 (+0,9) | −10 pe | – | +0,35 / +0,26  |
| Blandat | 35 | 1,26–1,31 | −0,04 | −0,04 (−0,2) | −0 pe | – | −0,03 / −0,05 ✔ |
| Direktspel | 36 | 1,53–1,17 | −0,10 | −0,11 (−0,5) | −7 pe | – | −0,15 / +0,01  |
| Lågpress | 20 | 1,40–1,25 | +0,26 | +0,26 (+0,9) | −1 pe | – | +0,38 / +0,19 ✔ |
| Mellanpress | 40 | 1,68–1,25 | +0,13 | +0,12 (+0,6) | −12 pe | – | +0,18 / +0,09 ✔ |
| Högpress | 30 | 1,33–1,23 | −0,34 | −0,34 (−1,5) | +2 pe | – | −0,40 / −0,17 ✔ |
| Svag på fasta | 40 | 1,38–1,07 | +0,02 | +0,02 (+0,1) | −11 pe | – | +0,02 / +0,02 ✔ |
| Medel på fasta | 36 | 1,58–1,39 | +0,03 | +0,02 (+0,1) | −7 pe | – | +0,05 / +0,00 ✔ |
| Farlig på fasta | 14 | 1,64–1,36 | −0,10 | −0,11 (−0,4) | +18 pe | – | −0,76 / +0,38  |
| Stark mot fasta | 38 | 1,87–1,32 | +0,10 | +0,10 (+0,5) | −5 pe | – | +0,27 / −0,19  |
| Medel mot fasta | 36 | 1,22–1,03 | +0,03 | +0,03 (+0,1) | −4 pe | – | −0,48 / +0,54  |
| Svag mot fasta | 16 | 1,25–1,56 | −0,30 | −0,30 (−1,0) | −8 pe | – | −0,35 / −0,29  |

- Svårast mot **Högpress** (−0,34 p/match rel. eget snitt, z −1,5, 30 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,23 p/match rel. eget snitt, z +1,0, 28 m) – åt samma håll i båda halvorna men svagt

### Radomiak Radom

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress, Farlig på fasta, Svag mot fasta** (faktiskt bollinnehav 47,1 %). 92 matcher med stil, mot marknaden totalt −0,07 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,41), 0,22 emot (xG 0,32), 6,22 hörnor · 2025/26 (34 m): 0,32 mål för (xG 0,41), 0,35 emot (xG 0,41), 4,59 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 27 | 1,15–1,30 | +0,27 | +0,33 (+1,5) | +12 pe | – | +0,27 / +0,42 ✔ |
| Balanserat | 35 | 1,40–1,94 | −0,27 | −0,20 (−0,9) | −19 pe | – | −0,34 / −0,11 ✔ |
| Bollinnehav | 30 | 1,47–1,97 | −0,13 | −0,06 (−0,3) | −3 pe | – | −0,05 / −0,08 ✔ |
| Kortpass | 19 | 1,42–2,26 | −0,30 | −0,24 (−0,9) | +0 pe | – | −1,15 / +0,01  |
| Blandat | 42 | 1,36–1,69 | −0,05 | +0,02 (+0,1) | −11 pe | – | +0,21 / −0,14  |
| Direktspel | 31 | 1,29–1,55 | +0,04 | +0,11 (+0,5) | +1 pe | – | −0,06 / +0,60  |
| Lågpress | 23 | 1,61–2,04 | −0,01 | +0,06 (+0,2) | −4 pe | – | +0,18 / −0,03  |
| Mellanpress | 39 | 1,23–1,56 | +0,03 | +0,10 (+0,4) | −10 pe | – | −0,27 / +0,30  |
| Högpress | 30 | 1,30–1,80 | −0,24 | −0,17 (−0,8) | +2 pe | – | +0,01 / −0,66  |
| Svag på fasta | 42 | 1,64–1,98 | −0,04 | +0,02 (+0,1) | −13 pe | – | −0,09 / +0,16  |
| Medel på fasta | 35 | 1,09–1,54 | −0,05 | +0,02 (+0,1) | +1 pe | – | +0,01 / +0,03 ✔ |
| Farlig på fasta | 15 | 1,13–1,67 | −0,18 | −0,11 (−0,4) | +6 pe | – | +0,02 / −0,22  |
| Stark mot fasta | 39 | 1,54–1,62 | +0,05 | +0,12 (+0,6) | −2 pe | – | +0,03 / +0,24 ✔ |
| Medel mot fasta | 36 | 1,36–2,11 | −0,21 | −0,14 (−0,7) | −8 pe | – | −0,23 / −0,04 ✔ |
| Svag mot fasta | 17 | 0,88–1,35 | −0,04 | +0,03 (+0,1) | −3 pe | – | +0,48 / −0,10  |

- Svårast mot **Kortpass** (−0,24 p/match rel. eget snitt, z −0,9, 19 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,33 p/match rel. eget snitt, z +1,5, 27 m) – åt samma håll i båda halvorna men svagt

### Rakow

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 55,3 %). 92 matcher med stil, mot marknaden totalt −0,19 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,30), 0,44 emot (xG 0,40), 4,89 hörnor · 2025/26 (34 m): 0,41 mål för (xG 0,49), 0,23 emot (xG 0,25), 4,18 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 25 | 1,48–1,20 | −0,54 | −0,35 (−1,3) | −7 pe | – | −0,31 / −0,43 ✔ |
| Balanserat | 36 | 1,50–0,86 | +0,06 | +0,25 (+1,3) | +5 pe | – | +0,14 / +0,32 ✔ |
| Bollinnehav | 31 | 1,32–1,32 | −0,19 | −0,01 (−0,0) | −7 pe | – | +0,30 / −0,33  |
| Kortpass | 20 | 1,60–1,45 | +0,07 | +0,26 (+0,9) | −6 pe | – | +0,68 / +0,18  |
| Blandat | 42 | 1,50–1,07 | −0,12 | +0,06 (+0,3) | −5 pe | – | +0,22 / −0,06  |
| Direktspel | 30 | 1,23–0,93 | −0,45 | −0,26 (−1,1) | +4 pe | – | −0,19 / −0,56 ✔ |
| Lågpress | 24 | 1,17–0,96 | −0,18 | +0,01 (+0,0) | −1 pe | – | +0,72 / −0,42  |
| Mellanpress | 42 | 1,45–1,21 | −0,27 | −0,08 (−0,4) | −3 pe | – | −0,22 / +0,02  |
| Högpress | 26 | 1,65–1,08 | −0,06 | +0,12 (+0,5) | −2 pe | – | −0,04 / +0,57  |
| Svag på fasta | 42 | 1,50–1,24 | −0,05 | +0,14 (+0,7) | −2 pe | – | −0,02 / +0,31  |
| Medel på fasta | 38 | 1,32–0,92 | −0,24 | −0,05 (−0,2) | −5 pe | – | +0,08 / −0,19  |
| Farlig på fasta | 12 | 1,58–1,25 | −0,51 | −0,33 (−1,0) | +9 pe | – | +0,14 / −0,56  |
| Stark mot fasta | 41 | 1,39–0,98 | −0,11 | +0,07 (+0,4) | +1 pe | – | −0,03 / +0,22  |
| Medel mot fasta | 32 | 1,53–1,31 | −0,32 | −0,13 (−0,6) | −7 pe | – | −0,15 / −0,11 ✔ |
| Svag mot fasta | 19 | 1,37–1,05 | −0,13 | +0,06 (+0,2) | −1 pe | – | +1,01 / −0,27  |

- Svårast mot **Backar hem** (−0,35 p/match rel. eget snitt, z −1,3, 25 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,25 p/match rel. eget snitt, z +1,3, 36 m) – åt samma håll i båda halvorna men svagt

### Widzew Lodz

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress, Medel på fasta, Svag mot fasta** (faktiskt bollinnehav 48,6 %). 91 matcher med stil, mot marknaden totalt −0,25 per match.

Fasta situationer per match: 2026/27 (9 m): 0,22 mål för (xG 0,66), 0,56 emot (xG 0,22), 5,78 hörnor · 2025/26 (34 m): 0,29 mål för (xG 0,34), 0,41 emot (xG 0,27), 4,12 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,11–1,04 | +0,05 | +0,29 (+1,2) | +0 pe | – | +0,33 / +0,22 ✔ |
| Balanserat | 33 | 1,06–1,58 | −0,54 | −0,29 (−1,6) | −12 pe | – | −0,52 / −0,16 ✔ |
| Bollinnehav | 30 | 1,13–1,53 | −0,20 | +0,05 (+0,2) | −3 pe | – | +0,51 / −0,48  |
| Kortpass | 16 | 1,31–1,50 | −0,29 | −0,05 (−0,2) | −8 pe | – | +0,25 / −0,12  |
| Blandat | 40 | 0,93–1,38 | −0,40 | −0,15 (−0,8) | −12 pe | – | −0,08 / −0,19 ✔ |
| Direktspel | 35 | 1,20–1,37 | −0,05 | +0,19 (+1,0) | +4 pe | – | +0,32 / −0,16  |
| Lågpress | 21 | 0,76–1,57 | −0,43 | −0,19 (−0,9) | +2 pe | – | −0,11 / −0,25 ✔ |
| Mellanpress | 42 | 1,21–1,36 | −0,24 | +0,00 (+0,0) | −11 pe | – | +0,28 / −0,15  |
| Högpress | 28 | 1,18–1,32 | −0,11 | +0,14 (+0,6) | −2 pe | – | +0,21 / −0,07  |
| Svag på fasta | 38 | 1,21–1,55 | −0,36 | −0,11 (−0,6) | −11 pe | – | −0,17 / −0,06 ✔ |
| Medel på fasta | 39 | 1,21–1,44 | −0,03 | +0,22 (+1,1) | −2 pe | – | +0,59 / −0,17  |
| Farlig på fasta | 14 | 0,50–0,86 | −0,55 | −0,31 (−1,2) | +3 pe | – | −0,17 / −0,41 ✔ |
| Stark mot fasta | 38 | 1,13–1,21 | −0,07 | +0,18 (+0,8) | −11 pe | – | +0,21 / +0,14 ✔ |
| Medel mot fasta | 32 | 1,13–1,50 | −0,28 | −0,03 (−0,2) | +1 pe | – | +0,11 / −0,23  |
| Svag mot fasta | 21 | 1,00–1,57 | −0,52 | −0,27 (−1,3) | −3 pe | – | +0,24 / −0,44  |

- Svårast mot **Balanserat** (−0,29 p/match rel. eget snitt, z −1,6, 33 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,29 p/match rel. eget snitt, z +1,2, 28 m) – åt samma håll i båda halvorna men svagt

### Wisla Plock

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Medel på fasta, Medel mot fasta** (faktiskt bollinnehav 50,1 %). 7 matcher med stil, mot marknaden totalt +0,39 per match.

Fasta situationer per match: 2026/27 (8 m): 0,25 mål för (xG 0,63), 0,25 emot (xG 0,26), 6,25 hörnor · 2025/26 (34 m): 0,27 mål för (xG 0,28), 0,38 emot (xG 0,27), 4,35 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 4 | 0,50–1,75 | −0,24 | −0,63 (−1,0) | −3 pe | – | −1,02 / −0,24  |
| Balanserat | 3 | 2,00–1,00 | +1,23 | +0,84 (+1,4) | +6 pe | – | +1,80 / +0,36  |
| Kortpass | 1 | 3,00–1,00 | +1,69 | +1,30 (+13,0) | −28 pe | – | – / +1,30  |
| Blandat | 5 | 0,60–1,80 | −0,13 | −0,52 (−0,9) | +13 pe | – | −0,08 / −1,19  |
| Direktspel | 1 | 2,00–0,00 | +1,71 | +1,32 (+13,2) | −28 pe | – | – / +1,32  |
| Lågpress | 1 | 2,00–0,00 | +1,71 | +1,32 (+13,2) | −28 pe | – | – / +1,32  |
| Mellanpress | 6 | 1,00–1,67 | +0,17 | −0,22 (−0,4) | +6 pe | – | −0,08 / −0,36  |
| Medel på fasta | 2 | 1,50–0,50 | +0,73 | +0,34 (+0,5) | +21 pe | – | −0,62 / +1,30  |
| Farlig på fasta | 5 | 1,00–1,80 | +0,26 | −0,14 (−0,2) | −7 pe | – | +0,19 / −0,36  |
| Medel mot fasta | 4 | 1,75–1,75 | +1,14 | +0,75 (+1,2) | −27 pe | – | +0,19 / +1,31  |
| Svag mot fasta | 3 | 0,33–1,00 | −0,61 | −1,00 (−3,0) | +38 pe | – | −0,62 / −1,19  |

### Zaglebie

Egen stil 2025/26 (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel, Lågpress, Farlig på fasta, Medel mot fasta** (faktiskt bollinnehav 43,2 %). 91 matcher med stil, mot marknaden totalt +0,10 per match.

Fasta situationer per match: 2026/27 (9 m): 0,56 mål för (xG 0,63), 0,11 emot (xG 0,17), 3,89 hörnor · 2025/26 (34 m): 0,41 mål för (xG 0,46), 0,38 emot (xG 0,34), 3,62 hörnor.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 28 | 1,11–1,25 | +0,13 | +0,03 (+0,1) | −0 pe | – | +0,10 / −0,06  |
| Balanserat | 33 | 1,24–1,48 | +0,18 | +0,08 (+0,4) | −9 pe | – | −0,19 / +0,24  |
| Bollinnehav | 30 | 1,07–1,37 | −0,03 | −0,12 (−0,5) | −3 pe | – | −0,50 / +0,31  |
| Kortpass | 18 | 1,44–1,17 | +0,25 | +0,15 (+0,5) | +2 pe | – | −1,02 / +0,39  |
| Blandat | 38 | 1,08–1,39 | +0,04 | −0,06 (−0,3) | −1 pe | – | −0,36 / +0,19  |
| Direktspel | 35 | 1,06–1,46 | +0,08 | −0,02 (−0,1) | −11 pe | – | +0,02 / −0,12  |
| Lågpress | 22 | 1,14–1,23 | +0,25 | +0,15 (+0,6) | −9 pe | – | +0,11 / +0,19 ✔ |
| Mellanpress | 41 | 1,34–1,20 | +0,32 | +0,23 (+1,1) | −1 pe | – | +0,03 / +0,34 ✔ |
| Högpress | 28 | 0,86–1,75 | −0,36 | −0,45 (−2,1) | −6 pe | – | −0,51 / −0,30 ✔ ⚑ |
| Svag på fasta | 42 | 1,17–1,29 | +0,26 | +0,17 (+0,8) | −6 pe | – | −0,03 / +0,37  |
| Medel på fasta | 32 | 1,09–1,59 | −0,24 | −0,34 (−1,5) | −9 pe | – | −0,45 / −0,21 ✔ |
| Farlig på fasta | 17 | 1,18–1,18 | +0,31 | +0,21 (+0,7) | +8 pe | – | −0,07 / +0,41  |
| Stark mot fasta | 40 | 1,30–1,52 | −0,08 | −0,17 (−0,9) | −5 pe | – | −0,24 / −0,06 ✔ |
| Medel mot fasta | 33 | 1,12–1,58 | +0,15 | +0,05 (+0,2) | −9 pe | – | −0,42 / +0,45  |
| Svag mot fasta | 18 | 0,83–0,67 | +0,38 | +0,29 (+1,1) | +7 pe | – | +0,74 / +0,11 ✔ |

- Svårast mot **Högpress** (−0,45 p/match rel. eget snitt, z −2,1, 28 m) – ⚑ håller i båda halvorna
- Bäst mot **Svag mot fasta** (+0,29 p/match rel. eget snitt, z +1,1, 18 m) – åt samma håll i båda halvorna men svagt
