# Stilmatchning – Eliteserien (NO)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 1457 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 77 m · hemma −0,18 · kryss −0 pe · ö2,5 – | 148 m · hemma +0,07 · kryss +1 pe · ö2,5 – | 124 m · hemma −0,01 · kryss −2 pe · ö2,5 – |
| **Mellan** | 144 m · hemma +0,03 · kryss +0 pe · ö2,5 – | 251 m · hemma +0,03 · kryss −5 pe · ö2,5 – | 218 m · hemma +0,07 · kryss −6 pe · ö2,5 – |
| **Mycket boll** | 130 m · hemma +0,15 · kryss −2 pe · ö2,5 – | 214 m · hemma −0,08 · kryss +1 pe · ö2,5 – | 151 m · hemma −0,03 · kryss +2 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 142 m · hemma +0,11 · kryss −10 pe · ö2,5 – | 154 m · hemma −0,07 · kryss +3 pe · ö2,5 – | 178 m · hemma +0,03 · kryss −2 pe · ö2,5 – |
| **Balanserat** | 160 m · hemma −0,04 · kryss +3 pe · ö2,5 – | 188 m · hemma +0,14 · kryss −1 pe · ö2,5 – | 154 m · hemma +0,11 · kryss −5 pe · ö2,5 – |
| **Bollinnehav** | 176 m · hemma −0,02 · kryss +1 pe · ö2,5 – | 154 m · hemma −0,18 · kryss −1 pe · ö2,5 – | 151 m · hemma +0,02 · kryss −4 pe · ö2,5 – |

## Lag (säsong 2026)

### Bodo/Glimt

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 63,9 %). 192 matcher med stil, mot marknaden totalt +0,15 per match.

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

- Svårast mot **Kortpass** (−0,16 p/match rel. eget snitt, z −1,1, 67 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,17 p/match rel. eget snitt, z +1,4, 64 m) – åt samma håll i båda halvorna men svagt

### Brann

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 58,6 %). 167 matcher med stil, mot marknaden totalt −0,08 per match.

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

- Svårast mot **Blandat** (−0,23 p/match rel. eget snitt, z −1,1, 35 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,26 p/match rel. eget snitt, z +1,5, 53 m) – åt samma håll i båda halvorna men svagt

### Fredrikstad

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 48,0 %). 42 matcher med stil, mot marknaden totalt +0,06 per match.

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

- Svårast mot **Kortpass** (−0,13 p/match rel. eget snitt, z −0,7, 36 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,35 p/match rel. eget snitt, z +1,1, 15 m) – åt samma håll i båda halvorna men svagt

### HamKam

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,3 %). 67 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 22 | 1,23–1,55 | −0,08 | −0,14 (−0,6) | +7 pe | – | +0,06 / −0,30  |
| Balanserat | 15 | 1,47–1,80 | +0,04 | −0,02 (−0,1) | −4 pe | – | −0,51 / +0,54  |
| Bollinnehav | 30 | 1,37–1,87 | +0,16 | +0,11 (+0,6) | −5 pe | – | +0,32 / −0,10  |
| Kortpass | 57 | 1,30–1,91 | −0,04 | −0,09 (−0,7) | −2 pe | – | −0,01 / −0,17 ✔ |
| Blandat | 8 | 1,50–0,75 | +0,67 | +0,61 (+1,4) | +11 pe | – | −0,10 / +1,04  |
| Direktspel | 2 | 2,00–1,00 | +0,25 | +0,20 (+0,2) | −25 pe | – | +1,99 / −1,60  |
| Lågpress | 17 | 1,53–1,88 | +0,44 | +0,39 (+1,2) | −11 pe | – | +0,74 / +0,20 ✔ |
| Mellanpress | 28 | 1,32–2,00 | −0,00 | −0,06 (−0,3) | −5 pe | – | +0,10 / −0,12  |
| Högpress | 22 | 1,23–1,32 | −0,17 | −0,23 (−1,0) | +12 pe | – | −0,21 / −0,36  |

- Svårast mot **Högpress** (−0,23 p/match rel. eget snitt, z −1,0, 22 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,39 p/match rel. eget snitt, z +1,2, 17 m) – åt samma håll i båda halvorna men svagt

### KFUM Oslo

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 44,3 %). 41 matcher med stil, mot marknaden totalt −0,10 per match.

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

- Svårast mot **Backar hem** (−0,13 p/match rel. eget snitt, z −0,5, 17 m) – inte stabilt, troligen slump
- Bäst mot **Mellanpress** (+0,21 p/match rel. eget snitt, z +0,7, 23 m) – inte stabilt, troligen slump

### Kristiansund

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 42,6 %). 170 matcher med stil, mot marknaden totalt +0,14 per match.

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

- Svårast mot **Blandat** (−0,21 p/match rel. eget snitt, z −1,1, 43 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,17 p/match rel. eget snitt, z +1,1, 57 m) – åt samma håll i båda halvorna men svagt

### Molde

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 59,2 %). 216 matcher med stil, mot marknaden totalt +0,16 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 66 | 1,97–1,32 | −0,01 | −0,16 (−1,0) | −15 pe | – | −0,03 / −0,29 ✔ |
| Balanserat | 75 | 2,35–1,19 | +0,23 | +0,07 (+0,5) | −6 pe | – | +0,30 / −0,23  |
| Bollinnehav | 75 | 2,20–1,21 | +0,23 | +0,07 (+0,5) | −6 pe | – | +0,05 / +0,09 ✔ |
| Kortpass | 73 | 1,93–1,33 | −0,02 | −0,18 (−1,1) | −9 pe | – | −0,17 / −0,18 ✔ |
| Blandat | 58 | 2,24–1,24 | +0,18 | +0,03 (+0,2) | −13 pe | – | +0,19 / −0,11  |
| Direktspel | 85 | 2,35–1,15 | +0,29 | +0,13 (+1,1) | −6 pe | – | +0,13 / +0,19 ✔ |
| Lågpress | 73 | 2,15–1,27 | +0,03 | −0,13 (−0,9) | −8 pe | – | −0,01 / −0,52 ✔ |
| Mellanpress | 88 | 2,22–1,17 | +0,31 | +0,16 (+1,2) | −9 pe | – | +0,33 / −0,02  |
| Högpress | 55 | 2,16–1,29 | +0,07 | −0,08 (−0,5) | −9 pe | – | −0,11 / −0,08 ✔ |

- Svårast mot **Kortpass** (−0,18 p/match rel. eget snitt, z −1,1, 73 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,16 p/match rel. eget snitt, z +1,2, 88 m) – inte stabilt, troligen slump

### Rosenborg

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 52,5 %). 217 matcher med stil, mot marknaden totalt +0,01 per match.

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

- Svårast mot **Balanserat** (−0,11 p/match rel. eget snitt, z −0,7, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,17 p/match rel. eget snitt, z +1,0, 56 m) – inte stabilt, troligen slump

### Sandefjord

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Mellanpress** (faktiskt bollinnehav 50,3 %). 167 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 64 | 1,44–1,75 | +0,06 | +0,04 (+0,2) | +5 pe | – | −0,12 / +0,22  |
| Balanserat | 48 | 1,31–1,88 | −0,16 | −0,19 (−1,1) | −13 pe | – | −0,27 / −0,12 ✔ |
| Bollinnehav | 55 | 1,47–1,84 | +0,15 | +0,12 (+0,8) | −1 pe | – | +0,14 / +0,11 ✔ |
| Kortpass | 73 | 1,37–1,58 | +0,08 | +0,06 (+0,4) | −4 pe | – | −0,05 / +0,08  |
| Blandat | 49 | 1,53–1,94 | −0,07 | −0,10 (−0,7) | +2 pe | – | −0,09 / −0,12 ✔ |
| Direktspel | 45 | 1,36–2,07 | +0,05 | +0,02 (+0,1) | −4 pe | – | −0,09 / +0,75  |
| Lågpress | 38 | 1,50–1,74 | −0,07 | −0,10 (−0,6) | +10 pe | – | −0,10 / −0,09 ✔ |
| Mellanpress | 78 | 1,36–1,87 | +0,07 | +0,05 (+0,3) | −7 pe | – | −0,05 / +0,16  |
| Högpress | 51 | 1,43–1,78 | +0,03 | +0,00 (+0,0) | −4 pe | – | −0,16 / +0,09  |

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −1,1, 48 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,12 p/match rel. eget snitt, z +0,8, 55 m) – åt samma håll i båda halvorna men svagt

### Sarpsborg 08

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 45,2 %). 218 matcher med stil, mot marknaden totalt −0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 1,39–1,42 | −0,10 | +0,01 (+0,1) | −0 pe | – | −0,09 / +0,08  |
| Balanserat | 75 | 1,31–1,64 | −0,18 | −0,07 (−0,5) | +3 pe | – | −0,13 / +0,03  |
| Bollinnehav | 72 | 1,60–1,74 | −0,04 | +0,07 (+0,4) | +1 pe | – | +0,08 / +0,06 ✔ |
| Kortpass | 73 | 1,66–1,47 | +0,28 | +0,39 (+2,5) | +1 pe | – | +0,93 / +0,33 ✔ ⚑ |
| Blandat | 66 | 1,39–1,95 | −0,40 | −0,29 (−2,1) | −1 pe | – | +0,01 / −0,57  |
| Direktspel | 79 | 1,25–1,43 | −0,23 | −0,12 (−0,8) | +4 pe | – | −0,21 / +0,48  |
| Lågpress | 70 | 1,23–1,57 | −0,29 | −0,18 (−1,3) | +11 pe | – | −0,22 / −0,09 ✔ |
| Mellanpress | 93 | 1,35–1,48 | −0,03 | +0,08 (+0,6) | −3 pe | – | −0,01 / +0,17  |
| Högpress | 55 | 1,82–1,84 | −0,02 | +0,09 (+0,5) | −4 pe | – | +0,45 / +0,00 ✔ |

- Svårast mot **Blandat** (−0,29 p/match rel. eget snitt, z −2,1, 66 m) – inte stabilt, troligen slump
- Bäst mot **Kortpass** (+0,39 p/match rel. eget snitt, z +2,5, 73 m) – ⚑ håller i båda halvorna

### Tromso

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 50,5 %). 166 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,54–1,67 | −0,01 | −0,11 (−0,7) | −1 pe | – | −0,43 / +0,25  |
| Balanserat | 52 | 1,54–1,56 | +0,18 | +0,08 (+0,4) | −8 pe | – | +0,14 / +0,01 ✔ |
| Bollinnehav | 62 | 1,35–1,44 | +0,14 | +0,03 (+0,2) | −13 pe | – | +0,12 / −0,04  |
| Kortpass | 68 | 1,43–1,57 | +0,04 | −0,07 (−0,5) | −12 pe | – | +0,11 / −0,10  |
| Blandat | 41 | 1,56–1,27 | +0,21 | +0,10 (+0,5) | +2 pe | – | −0,09 / +0,33  |
| Direktspel | 57 | 1,46–1,72 | +0,12 | +0,01 (+0,1) | −10 pe | – | −0,08 / +0,75  |
| Lågpress | 45 | 1,76–1,56 | +0,13 | +0,03 (+0,1) | −9 pe | – | −0,04 / +0,14  |
| Mellanpress | 74 | 1,38–1,66 | +0,04 | −0,07 (−0,5) | −10 pe | – | −0,32 / +0,20  |
| Högpress | 47 | 1,34–1,36 | +0,19 | +0,08 (+0,4) | −2 pe | – | +0,51 / −0,15  |

- Svårast mot **Backar hem** (−0,11 p/match rel. eget snitt, z −0,7, 52 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +0,5, 41 m) – inte stabilt, troligen slump

### Valerenga

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 49,7 %). 167 matcher med stil, mot marknaden totalt −0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 56 | 1,30–1,38 | −0,15 | −0,01 (−0,0) | +0 pe | – | −0,11 / +0,06  |
| Balanserat | 62 | 1,31–1,55 | −0,19 | −0,05 (−0,3) | +7 pe | – | −0,05 / −0,05 ✔ |
| Bollinnehav | 49 | 1,67–1,61 | −0,07 | +0,07 (+0,4) | −4 pe | – | +0,44 / −0,26  |
| Kortpass | 32 | 1,19–1,81 | −0,40 | −0,26 (−1,3) | +4 pe | – | +0,49 / −0,36  |
| Blandat | 54 | 1,56–1,46 | −0,01 | +0,13 (+0,8) | +0 pe | – | +0,11 / +0,14 ✔ |
| Direktspel | 81 | 1,41–1,42 | −0,13 | +0,01 (+0,1) | +2 pe | – | +0,04 / −0,07  |
| Lågpress | 60 | 1,37–1,38 | −0,12 | +0,02 (+0,2) | +3 pe | – | +0,08 / −0,20  |
| Mellanpress | 72 | 1,31–1,64 | −0,14 | +0,00 (+0,0) | +4 pe | – | +0,12 / −0,09  |
| Högpress | 35 | 1,71–1,46 | −0,19 | −0,05 (−0,2) | −7 pe | – | −0,89 / +0,00  |

- Svårast mot **Kortpass** (−0,26 p/match rel. eget snitt, z −1,3, 32 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,13 p/match rel. eget snitt, z +0,8, 54 m) – åt samma håll i båda halvorna men svagt

### Viking

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Mellanpress** (faktiskt bollinnehav 51,2 %). 164 matcher med stil, mot marknaden totalt +0,20 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 57 | 2,23–1,58 | +0,30 | +0,10 (+0,6) | −9 pe | – | +0,04 / +0,17 ✔ |
| Balanserat | 48 | 1,71–1,46 | +0,22 | +0,03 (+0,2) | −1 pe | – | −0,14 / +0,26  |
| Bollinnehav | 59 | 2,08–1,66 | +0,07 | −0,12 (−0,8) | +5 pe | – | −0,49 / +0,15  |
| Kortpass | 66 | 2,30–1,39 | +0,26 | +0,07 (+0,5) | +5 pe | – | −0,37 / +0,13  |
| Blandat | 63 | 1,86–1,76 | +0,08 | −0,11 (−0,7) | −5 pe | – | −0,27 / +0,26  |
| Direktspel | 35 | 1,80–1,57 | +0,27 | +0,08 (+0,3) | −7 pe | – | −0,01 / +0,58  |
| Lågpress | 41 | 2,00–1,71 | +0,19 | −0,00 (−0,0) | −8 pe | – | −0,08 / +0,17  |
| Mellanpress | 68 | 2,04–1,54 | +0,24 | +0,05 (+0,3) | −2 pe | – | −0,06 / +0,15  |
| Högpress | 55 | 2,02–1,51 | +0,14 | −0,06 (−0,3) | +4 pe | – | −0,54 / +0,22  |

- Svårast mot **Bollinnehav** (−0,12 p/match rel. eget snitt, z −0,8, 59 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,10 p/match rel. eget snitt, z +0,6, 57 m) – åt samma håll i båda halvorna men svagt
