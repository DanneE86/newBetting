# Stilmatchning – Liga Profesional (AR)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2371 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 219 m · hemma +0,01 · kryss −2 pe · ö2,5 – | 294 m · hemma +0,04 · kryss +1 pe · ö2,5 – | 211 m · hemma +0,10 · kryss +3 pe · ö2,5 – |
| **Mellan** | 299 m · hemma +0,01 · kryss +6 pe · ö2,5 – | 377 m · hemma −0,06 · kryss +1 pe · ö2,5 – | 280 m · hemma +0,06 · kryss +2 pe · ö2,5 – |
| **Mycket boll** | 225 m · hemma −0,03 · kryss −2 pe · ö2,5 – | 285 m · hemma −0,14 · kryss +3 pe · ö2,5 – | 181 m · hemma +0,08 · kryss −4 pe · ö2,5 – |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 180 m · hemma −0,01 · kryss +3 pe · ö2,5 – | 305 m · hemma −0,02 · kryss −1 pe · ö2,5 – | 189 m · hemma −0,04 · kryss +2 pe · ö2,5 – |
| **Balanserat** | 308 m · hemma −0,11 · kryss +6 pe · ö2,5 – | 446 m · hemma +0,05 · kryss −2 pe · ö2,5 – | 298 m · hemma +0,01 · kryss +4 pe · ö2,5 – |
| **Bollinnehav** | 193 m · hemma +0,15 · kryss −3 pe · ö2,5 – | 298 m · hemma −0,04 · kryss +1 pe · ö2,5 – | 154 m · hemma +0,07 · kryss +1 pe · ö2,5 – |

## Lag (säsong 2026)

### Aldosivi

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat** (faktiskt bollinnehav 43,0 %). 73 matcher med stil, mot marknaden totalt −0,22 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 21 | 0,81–1,00 | +0,10 | +0,31 (+1,2) | −1 pe | – | +0,64 / −0,12  |
| Balanserat | 32 | 0,69–1,81 | −0,57 | −0,35 (−2,4) | −6 pe | – | −0,42 / −0,31 ✔ ⚑ |
| Bollinnehav | 20 | 0,90–1,85 | +0,01 | +0,23 (+0,9) | −7 pe | – | +0,49 / −0,16  |
| Kortpass | 16 | 0,63–1,44 | −0,24 | −0,02 (−0,1) | +8 pe | – | +0,01 / −0,05  |
| Blandat | 36 | 0,97–1,75 | −0,11 | +0,10 (+0,5) | −8 pe | – | +0,48 / −0,20  |
| Direktspel | 21 | 0,57–1,43 | −0,38 | −0,16 (−0,7) | −9 pe | – | +0,07 / −0,48  |
| Lågpress | 31 | 0,71–1,39 | −0,27 | −0,06 (−0,3) | +6 pe | – | +0,54 / −0,17  |
| Mellanpress | 17 | 0,59–2,18 | −0,58 | −0,36 (−2,0) | −14 pe | – | −0,28 / −0,44 ✔ |
| Högpress | 25 | 1,00–1,44 | +0,10 | +0,32 (+1,2) | −12 pe | – | +0,35 / −0,07  |

- Svårast mot **Balanserat** (−0,35 p/match rel. eget snitt, z −2,4, 32 m) – ⚑ håller i båda halvorna
- Bäst mot **Högpress** (+0,32 p/match rel. eget snitt, z +1,2, 25 m) – inte stabilt, troligen slump

### Argentinos Jrs

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat** (faktiskt bollinnehav 62,4 %). 186 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 50 | 1,40–1,02 | +0,10 | +0,11 (+0,6) | +1 pe | – | +0,01 / +0,25 ✔ |
| Balanserat | 95 | 1,09–0,92 | −0,05 | −0,03 (−0,3) | +0 pe | – | −0,28 / +0,17  |
| Bollinnehav | 41 | 1,15–0,83 | −0,07 | −0,06 (−0,3) | −3 pe | – | +0,29 / −0,42  |
| Kortpass | 56 | 1,07–0,79 | +0,01 | +0,02 (+0,1) | +7 pe | – | +0,35 / −0,12  |
| Blandat | 75 | 1,23–0,96 | −0,11 | −0,09 (−0,7) | +0 pe | – | −0,31 / +0,14  |
| Direktspel | 55 | 1,25–1,02 | +0,09 | +0,11 (+0,6) | −9 pe | – | +0,02 / +0,29 ✔ |
| Lågpress | 66 | 1,17–0,82 | +0,01 | +0,02 (+0,1) | +3 pe | – | −0,17 / +0,06  |
| Mellanpress | 55 | 1,11–0,76 | +0,12 | +0,14 (+0,8) | −3 pe | – | +0,08 / +0,20 ✔ |
| Högpress | 65 | 1,28–1,17 | −0,15 | −0,13 (−0,9) | −1 pe | – | −0,12 / −0,17 ✔ |

- Svårast mot **Högpress** (−0,13 p/match rel. eget snitt, z −0,9, 65 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,14 p/match rel. eget snitt, z +0,8, 55 m) – åt samma håll i båda halvorna men svagt

### Atl. Tucuman

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 44,0 %). 177 matcher med stil, mot marknaden totalt −0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 1,20–1,33 | +0,03 | +0,06 (+0,3) | −8 pe | – | +0,23 / −0,15  |
| Balanserat | 79 | 0,86–1,03 | −0,01 | +0,02 (+0,2) | +8 pe | – | +0,21 / −0,15  |
| Bollinnehav | 47 | 1,00–1,28 | −0,13 | −0,10 (−0,5) | −4 pe | – | +0,17 / −0,33  |
| Kortpass | 43 | 0,88–1,05 | −0,05 | −0,01 (−0,1) | +1 pe | – | +0,33 / −0,18  |
| Blandat | 81 | 1,12–1,28 | −0,05 | −0,02 (−0,2) | +5 pe | – | +0,13 / −0,19  |
| Direktspel | 53 | 0,89–1,13 | +0,01 | +0,04 (+0,2) | −9 pe | – | +0,25 / −0,25  |
| Lågpress | 52 | 0,94–1,15 | −0,08 | −0,05 (−0,3) | −4 pe | – | −0,03 / −0,05 ✔ |
| Mellanpress | 59 | 0,95–1,32 | −0,20 | −0,17 (−1,1) | −12 pe | – | +0,07 / −0,48  |
| Högpress | 66 | 1,08–1,08 | +0,15 | +0,19 (+1,4) | +14 pe | – | +0,34 / −0,17  |

- Svårast mot **Mellanpress** (−0,17 p/match rel. eget snitt, z −1,1, 59 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,4, 66 m) – inte stabilt, troligen slump

### Banfield

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 40,6 %). 178 matcher med stil, mot marknaden totalt −0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 0,94–1,08 | −0,13 | −0,03 (−0,2) | −0 pe | – | +0,03 / −0,12  |
| Balanserat | 80 | 0,96–1,18 | −0,13 | −0,02 (−0,2) | +6 pe | – | +0,18 / −0,19  |
| Bollinnehav | 46 | 0,93–1,22 | −0,03 | +0,08 (+0,4) | −10 pe | – | −0,11 / +0,23  |
| Kortpass | 50 | 0,96–1,16 | −0,11 | −0,01 (−0,1) | −3 pe | – | +0,20 / −0,10  |
| Blandat | 79 | 0,94–1,18 | −0,24 | −0,13 (−1,1) | −1 pe | – | −0,19 / −0,08 ✔ |
| Direktspel | 49 | 0,96–1,12 | +0,12 | +0,23 (+1,3) | +4 pe | – | +0,29 / +0,10 ✔ |
| Lågpress | 61 | 1,13–1,23 | −0,02 | +0,08 (+0,5) | −5 pe | – | +0,09 / +0,08 ✔ |
| Mellanpress | 55 | 0,84–0,96 | −0,08 | +0,03 (+0,2) | +5 pe | – | +0,24 / −0,27  |
| Högpress | 62 | 0,87–1,26 | −0,21 | −0,10 (−0,7) | −0 pe | – | −0,09 / −0,14 ✔ |

- Svårast mot **Blandat** (−0,13 p/match rel. eget snitt, z −1,1, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,23 p/match rel. eget snitt, z +1,3, 49 m) – åt samma håll i båda halvorna men svagt

### Barracas Central

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 43,2 %). 132 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 37 | 0,92–1,14 | +0,07 | −0,08 (−0,4) | +10 pe | – | −0,11 / −0,03 ✔ |
| Balanserat | 67 | 0,73–1,21 | +0,21 | +0,07 (+0,5) | +3 pe | – | −0,00 / +0,14  |
| Bollinnehav | 28 | 0,89–1,21 | +0,08 | −0,06 (−0,3) | +21 pe | – | −0,50 / +0,22  |
| Kortpass | 32 | 0,69–1,19 | −0,02 | −0,16 (−1,0) | +20 pe | – | −0,48 / +0,03  |
| Blandat | 61 | 0,90–1,15 | +0,25 | +0,11 (+0,7) | +5 pe | – | −0,03 / +0,24  |
| Direktspel | 39 | 0,79–1,26 | +0,11 | −0,03 (−0,2) | +6 pe | – | −0,06 / +0,00  |
| Lågpress | 50 | 0,82–1,06 | +0,16 | +0,02 (+0,1) | +3 pe | – | +0,00 / +0,02 ✔ |
| Mellanpress | 45 | 0,91–1,31 | +0,20 | +0,06 (+0,4) | +15 pe | – | −0,09 / +0,29  |
| Högpress | 37 | 0,70–1,22 | +0,04 | −0,10 (−0,6) | +9 pe | – | −0,17 / +0,44  |

- Svårast mot **Kortpass** (−0,16 p/match rel. eget snitt, z −1,0, 32 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,11 p/match rel. eget snitt, z +0,7, 61 m) – inte stabilt, troligen slump

### Belgrano

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 51,8 %). 95 matcher med stil, mot marknaden totalt +0,00 per match.

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

- Svårast mot **Högpress** (−0,35 p/match rel. eget snitt, z −1,5, 17 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,18 p/match rel. eget snitt, z +1,1, 47 m) – inte stabilt, troligen slump

### Boca Juniors

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass** (faktiskt bollinnehav 59,8 %). 188 matcher med stil, mot marknaden totalt +0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,10–0,96 | −0,07 | −0,16 (−0,9) | −5 pe | – | −0,02 / −0,34 ✔ |
| Balanserat | 80 | 1,26–0,75 | +0,10 | +0,01 (+0,0) | +1 pe | – | −0,15 / +0,17  |
| Bollinnehav | 56 | 1,43–0,79 | +0,23 | +0,14 (+0,9) | +1 pe | – | +0,05 / +0,20 ✔ |
| Kortpass | 56 | 1,66–0,82 | +0,37 | +0,28 (+1,7) | −5 pe | – | +0,23 / +0,30 ✔ |
| Blandat | 85 | 1,16–0,72 | +0,04 | −0,05 (−0,4) | +4 pe | – | −0,12 / +0,06  |
| Direktspel | 47 | 0,98–1,00 | −0,15 | −0,24 (−1,3) | −4 pe | – | −0,11 / −0,44 ✔ |
| Lågpress | 62 | 1,44–0,77 | +0,25 | +0,16 (+1,0) | −3 pe | – | −0,12 / +0,19  |
| Mellanpress | 58 | 1,22–0,83 | +0,04 | −0,05 (−0,3) | +3 pe | – | −0,02 / −0,08 ✔ |
| Högpress | 68 | 1,15–0,85 | −0,01 | −0,10 (−0,7) | −1 pe | – | −0,07 / −0,23 ✔ |

- Svårast mot **Direktspel** (−0,24 p/match rel. eget snitt, z −1,3, 47 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,28 p/match rel. eget snitt, z +1,7, 56 m) – åt samma håll i båda halvorna men svagt

### Central Cordoba

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 44,1 %). 179 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 51 | 0,88–1,24 | −0,06 | −0,04 (−0,3) | −1 pe | – | −0,23 / +0,15  |
| Balanserat | 74 | 0,85–1,30 | −0,04 | −0,02 (−0,2) | −5 pe | – | +0,07 / −0,11  |
| Bollinnehav | 54 | 1,20–1,41 | +0,06 | +0,07 (+0,5) | +4 pe | – | −0,03 / +0,18  |
| Kortpass | 59 | 1,10–1,37 | +0,09 | +0,10 (+0,6) | −5 pe | – | +0,06 / +0,12 ✔ |
| Blandat | 75 | 0,89–1,27 | −0,04 | −0,03 (−0,2) | +1 pe | – | −0,00 / −0,07 ✔ |
| Direktspel | 45 | 0,91–1,31 | −0,09 | −0,08 (−0,5) | −1 pe | – | −0,20 / +0,09  |
| Lågpress | 60 | 0,97–1,38 | −0,08 | −0,07 (−0,4) | −0 pe | – | −0,15 / −0,05 ✔ |
| Mellanpress | 57 | 0,88–1,37 | −0,10 | −0,08 (−0,5) | −0 pe | – | −0,27 / +0,19  |
| Högpress | 62 | 1,05–1,19 | +0,13 | +0,14 (+0,9) | −3 pe | – | +0,13 / +0,17 ✔ |

- Svårast mot **Mellanpress** (−0,08 p/match rel. eget snitt, z −0,5, 57 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,14 p/match rel. eget snitt, z +0,9, 62 m) – åt samma håll i båda halvorna men svagt

### Defensa y Justicia

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass** (faktiskt bollinnehav 51,9 %). 180 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,21–0,98 | +0,34 | +0,30 (+1,8) | +1 pe | – | +0,25 / +0,35 ✔ |
| Balanserat | 80 | 0,96–1,32 | −0,15 | −0,19 (−1,4) | −1 pe | – | −0,13 / −0,26 ✔ |
| Bollinnehav | 48 | 1,35–1,27 | +0,04 | −0,00 (−0,0) | +19 pe | – | +0,03 / −0,02  |
| Kortpass | 56 | 1,14–1,20 | +0,07 | +0,03 (+0,2) | +9 pe | – | +0,22 / −0,03  |
| Blandat | 72 | 1,03–1,32 | −0,14 | −0,18 (−1,3) | +5 pe | – | −0,19 / −0,17 ✔ |
| Direktspel | 52 | 1,29–1,08 | +0,27 | +0,22 (+1,4) | −1 pe | – | +0,20 / +0,27 ✔ |
| Lågpress | 58 | 1,09–1,29 | −0,03 | −0,07 (−0,5) | +4 pe | – | −0,18 / −0,05 ✔ |
| Mellanpress | 63 | 1,14–1,30 | +0,03 | −0,01 (−0,1) | +5 pe | – | −0,08 / +0,08  |
| Högpress | 59 | 1,19–1,03 | +0,12 | +0,08 (+0,5) | +5 pe | – | +0,14 / −0,11  |

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −1,4, 80 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,30 p/match rel. eget snitt, z +1,8, 52 m) – åt samma håll i båda halvorna men svagt

### Dep. Riestra

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel** (faktiskt bollinnehav 35,9 %). 56 matcher med stil, mot marknaden totalt +0,10 per match.

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

- Svårast mot **Kortpass** (−0,27 p/match rel. eget snitt, z −1,3, 27 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,36 p/match rel. eget snitt, z +1,3, 20 m) – inte stabilt, troligen slump

### Estudiantes L.P.

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat** (faktiskt bollinnehav 55,7 %). 187 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 47 | 1,11–0,85 | +0,03 | +0,11 (+0,6) | +3 pe | – | +0,10 / +0,12 ✔ |
| Balanserat | 74 | 1,05–1,14 | −0,14 | −0,06 (−0,5) | −4 pe | – | −0,00 / −0,13 ✔ |
| Bollinnehav | 66 | 1,27–1,11 | −0,09 | −0,01 (−0,0) | +2 pe | – | +0,00 / −0,02  |
| Kortpass | 61 | 1,15–0,98 | −0,04 | +0,04 (+0,3) | −3 pe | – | +0,22 / −0,05  |
| Blandat | 76 | 1,16–1,16 | −0,22 | −0,14 (−1,0) | +8 pe | – | −0,16 / −0,12 ✔ |
| Direktspel | 50 | 1,12–0,98 | +0,08 | +0,16 (+0,9) | −8 pe | – | +0,15 / +0,19 ✔ |
| Lågpress | 66 | 1,20–0,89 | +0,10 | +0,18 (+1,2) | −1 pe | – | +0,11 / +0,20 ✔ |
| Mellanpress | 56 | 0,93–1,07 | −0,25 | −0,17 (−1,0) | +4 pe | – | +0,10 / −0,52  |
| Högpress | 65 | 1,28–1,20 | −0,12 | −0,04 (−0,3) | −2 pe | – | −0,04 / −0,04 ✔ |

- Svårast mot **Blandat** (−0,14 p/match rel. eget snitt, z −1,0, 76 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,18 p/match rel. eget snitt, z +1,2, 66 m) – åt samma håll i båda halvorna men svagt

### Gimnasia L.P.

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 44,7 %). 180 matcher med stil, mot marknaden totalt +0,15 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,13–0,98 | +0,20 | +0,05 (+0,3) | −7 pe | – | +0,16 / −0,06  |
| Balanserat | 87 | 0,90–1,38 | −0,12 | −0,27 (−2,0) | −10 pe | – | −0,31 / −0,23 ✔ |
| Bollinnehav | 41 | 1,29–0,95 | +0,66 | +0,51 (+2,6) | −6 pe | – | +0,58 / +0,43 ✔ ⚑ |
| Kortpass | 43 | 1,09–1,19 | +0,21 | +0,06 (+0,3) | −6 pe | – | +0,20 / −0,04  |
| Blandat | 78 | 1,09–1,14 | +0,19 | +0,04 (+0,3) | −7 pe | – | +0,32 / −0,21  |
| Direktspel | 59 | 0,98–1,19 | +0,05 | −0,10 (−0,6) | −11 pe | – | −0,32 / +0,24  |
| Lågpress | 58 | 0,88–1,34 | +0,06 | −0,09 (−0,5) | −19 pe | – | +0,20 / −0,13  |
| Mellanpress | 58 | 1,16–1,24 | +0,03 | −0,12 (−0,6) | −6 pe | – | −0,27 / +0,13  |
| Högpress | 64 | 1,13–0,94 | +0,34 | +0,19 (+1,3) | +0 pe | – | +0,26 / +0,00 ✔ |

- Svårast mot **Balanserat** (−0,27 p/match rel. eget snitt, z −2,0, 87 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,51 p/match rel. eget snitt, z +2,6, 41 m) – ⚑ håller i båda halvorna

### Huracan

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 51,7 %). 181 matcher med stil, mot marknaden totalt +0,11 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 1,09–0,85 | +0,17 | +0,06 (+0,3) | +6 pe | – | −0,04 / +0,22  |
| Balanserat | 76 | 1,05–0,89 | +0,10 | −0,01 (−0,1) | −4 pe | – | −0,28 / +0,19  |
| Bollinnehav | 52 | 0,98–0,81 | +0,07 | −0,04 (−0,2) | +1 pe | – | +0,01 / −0,08  |
| Kortpass | 51 | 1,00–0,75 | +0,21 | +0,10 (+0,5) | +0 pe | – | −0,08 / +0,19  |
| Blandat | 79 | 1,01–0,84 | +0,04 | −0,07 (−0,5) | +2 pe | – | −0,26 / +0,11  |
| Direktspel | 51 | 1,14–1,00 | +0,13 | +0,01 (+0,1) | −3 pe | – | +0,03 / −0,02  |
| Lågpress | 61 | 1,08–0,74 | +0,22 | +0,11 (+0,7) | +8 pe | – | −0,15 / +0,16  |
| Mellanpress | 57 | 0,89–0,93 | −0,03 | −0,14 (−0,9) | −7 pe | – | −0,27 / +0,02  |
| Högpress | 63 | 1,14–0,90 | +0,13 | +0,02 (+0,1) | −1 pe | – | −0,01 / +0,12  |

- Svårast mot **Mellanpress** (−0,14 p/match rel. eget snitt, z −0,9, 57 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,11 p/match rel. eget snitt, z +0,7, 61 m) – inte stabilt, troligen slump

### Ind. Rivadavia

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 48,8 %). 55 matcher med stil, mot marknaden totalt +0,19 per match.

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

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −0,9, 29 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,37 p/match rel. eget snitt, z +1,1, 17 m) – åt samma håll i båda halvorna men svagt

### Independiente

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat** (faktiskt bollinnehav 52,5 %). 178 matcher med stil, mot marknaden totalt −0,01 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,09–1,06 | −0,07 | −0,06 (−0,3) | +2 pe | – | −0,24 / +0,12  |
| Balanserat | 76 | 1,16–0,96 | +0,05 | +0,06 (+0,4) | +1 pe | – | +0,09 / +0,04 ✔ |
| Bollinnehav | 48 | 0,96–0,79 | −0,05 | −0,03 (−0,2) | +15 pe | – | −0,02 / −0,05 ✔ |
| Kortpass | 43 | 1,12–0,79 | +0,02 | +0,04 (+0,2) | +12 pe | – | −0,09 / +0,09  |
| Blandat | 75 | 1,05–1,07 | −0,10 | −0,09 (−0,7) | +6 pe | – | −0,24 / +0,08  |
| Direktspel | 60 | 1,10–0,90 | +0,07 | +0,09 (+0,5) | −1 pe | – | +0,20 / −0,08  |
| Lågpress | 58 | 1,03–0,84 | −0,00 | +0,01 (+0,1) | +8 pe | – | −0,51 / +0,08  |
| Mellanpress | 54 | 1,31–1,09 | +0,03 | +0,05 (+0,3) | +2 pe | – | +0,20 / −0,20  |
| Högpress | 66 | 0,94–0,91 | −0,06 | −0,05 (−0,3) | +5 pe | – | −0,13 / +0,21  |

- Svårast mot **Blandat** (−0,09 p/match rel. eget snitt, z −0,7, 75 m) – inte stabilt, troligen slump
- Bäst mot **Direktspel** (+0,09 p/match rel. eget snitt, z +0,5, 60 m) – inte stabilt, troligen slump

### Instituto

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Direktspel** (faktiskt bollinnehav 48,7 %). 90 matcher med stil, mot marknaden totalt −0,13 per match.

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

- Svårast mot **Mellanpress** (−0,30 p/match rel. eget snitt, z −1,4, 25 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,22 p/match rel. eget snitt, z +1,0, 26 m) – åt samma håll i båda halvorna men svagt

### Lanus

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 51,9 %). 180 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,24–1,04 | +0,04 | +0,08 (+0,5) | +4 pe | – | −0,15 / +0,32  |
| Balanserat | 75 | 1,09–1,01 | +0,02 | +0,06 (+0,4) | +4 pe | – | +0,08 / +0,04 ✔ |
| Bollinnehav | 51 | 0,98–1,27 | −0,21 | −0,17 (−1,0) | −1 pe | – | −0,18 / −0,16 ✔ |
| Kortpass | 47 | 1,11–1,15 | −0,03 | +0,00 (+0,0) | +1 pe | – | −0,15 / +0,09  |
| Blandat | 77 | 1,09–1,06 | −0,05 | −0,01 (−0,1) | +2 pe | – | +0,07 / −0,10  |
| Direktspel | 56 | 1,13–1,09 | −0,02 | +0,02 (+0,1) | +5 pe | – | −0,17 / +0,28  |
| Lågpress | 55 | 1,11–0,82 | +0,18 | +0,22 (+1,2) | −6 pe | – | +0,79 / +0,10 ✔ |
| Mellanpress | 58 | 1,09–1,17 | −0,08 | −0,04 (−0,3) | +12 pe | – | −0,20 / +0,14  |
| Högpress | 67 | 1,12–1,25 | −0,18 | −0,14 (−1,0) | +2 pe | – | −0,13 / −0,19 ✔ |

- Svårast mot **Bollinnehav** (−0,17 p/match rel. eget snitt, z −1,0, 51 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,22 p/match rel. eget snitt, z +1,2, 55 m) – åt samma håll i båda halvorna men svagt

### Newells Old Boys

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat** (faktiskt bollinnehav 44,8 %). 179 matcher med stil, mot marknaden totalt +0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 49 | 1,29–0,84 | +0,45 | +0,45 (+2,3) | −9 pe | – | +0,30 / +0,61 ✔ ⚑ |
| Balanserat | 79 | 0,94–1,24 | −0,15 | −0,15 (−1,1) | −2 pe | – | +0,09 / −0,41  |
| Bollinnehav | 51 | 0,73–1,16 | −0,20 | −0,20 (−1,2) | −7 pe | – | +0,13 / −0,45  |
| Kortpass | 56 | 0,88–1,30 | −0,16 | −0,16 (−1,1) | −1 pe | – | +0,25 / −0,31  |
| Blandat | 74 | 1,03–1,09 | +0,01 | +0,01 (+0,1) | −9 pe | – | +0,16 / −0,18  |
| Direktspel | 49 | 1,00–0,90 | +0,17 | +0,17 (+0,9) | −4 pe | – | +0,12 / +0,26 ✔ |
| Lågpress | 59 | 0,92–1,36 | −0,11 | −0,12 (−0,7) | −4 pe | – | +0,75 / −0,27  |
| Mellanpress | 52 | 0,87–0,88 | +0,03 | +0,03 (+0,2) | −0 pe | – | +0,26 / −0,25  |
| Högpress | 68 | 1,10–1,06 | +0,08 | +0,08 (+0,5) | −10 pe | – | +0,00 / +0,30 ✔ |

- Svårast mot **Bollinnehav** (−0,20 p/match rel. eget snitt, z −1,2, 51 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,45 p/match rel. eget snitt, z +2,3, 49 m) – ⚑ håller i båda halvorna

### Platense

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat** (faktiskt bollinnehav 50,1 %). 175 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 53 | 0,68–0,91 | −0,12 | −0,12 (−0,8) | +9 pe | – | −0,23 / −0,00 ✔ |
| Balanserat | 70 | 0,94–1,17 | +0,04 | +0,04 (+0,3) | −2 pe | – | +0,10 / −0,03  |
| Bollinnehav | 52 | 0,81–0,96 | +0,06 | +0,06 (+0,4) | +3 pe | – | +0,15 / +0,00 ✔ |
| Kortpass | 46 | 0,78–1,00 | −0,04 | −0,04 (−0,2) | +4 pe | – | +0,41 / −0,22  |
| Blandat | 76 | 0,84–0,97 | +0,10 | +0,10 (+0,7) | +7 pe | – | −0,00 / +0,23  |
| Direktspel | 53 | 0,83–1,13 | −0,11 | −0,11 (−0,7) | −5 pe | – | −0,13 / −0,08 ✔ |
| Lågpress | 63 | 0,71–1,05 | −0,12 | −0,12 (−0,8) | +12 pe | – | −0,26 / −0,09 ✔ |
| Mellanpress | 57 | 0,91–1,05 | +0,09 | +0,09 (+0,5) | −9 pe | – | +0,16 / −0,02  |
| Högpress | 55 | 0,85–0,98 | +0,05 | +0,05 (+0,3) | +5 pe | – | −0,03 / +0,27  |

- Svårast mot **Lågpress** (−0,12 p/match rel. eget snitt, z −0,8, 63 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +0,7, 76 m) – inte stabilt, troligen slump

### Racing Club

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat** (faktiskt bollinnehav 56,9 %). 190 matcher med stil, mot marknaden totalt −0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 49 | 1,14–1,12 | −0,22 | −0,18 (−0,9) | −7 pe | – | +0,04 / −0,50  |
| Balanserat | 94 | 1,43–1,15 | −0,07 | −0,03 (−0,2) | +6 pe | – | −0,03 / −0,03 ✔ |
| Bollinnehav | 47 | 1,64–0,89 | +0,21 | +0,25 (+1,4) | −12 pe | – | +0,42 / +0,13 ✔ |
| Kortpass | 58 | 1,53–0,83 | +0,25 | +0,29 (+1,7) | −12 pe | – | +0,42 / +0,20 ✔ |
| Blandat | 85 | 1,39–1,09 | −0,07 | −0,03 (−0,2) | +6 pe | – | +0,03 / −0,09  |
| Direktspel | 47 | 1,28–1,36 | −0,34 | −0,30 (−1,6) | −3 pe | – | −0,09 / −0,78 ✔ |
| Lågpress | 65 | 1,23–1,03 | −0,07 | −0,03 (−0,2) | −1 pe | – | +0,08 / −0,05  |
| Mellanpress | 60 | 1,28–1,18 | −0,28 | −0,24 (−1,5) | −5 pe | – | −0,28 / −0,20 ✔ |
| Högpress | 65 | 1,69–1,03 | +0,22 | +0,26 (+1,7) | +1 pe | – | +0,35 / −0,00  |

- Svårast mot **Direktspel** (−0,30 p/match rel. eget snitt, z −1,6, 47 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,29 p/match rel. eget snitt, z +1,7, 58 m) – åt samma håll i båda halvorna men svagt

### River Plate

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat** (faktiskt bollinnehav 65,0 %). 187 matcher med stil, mot marknaden totalt −0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 58 | 1,55–0,81 | −0,13 | +0,01 (+0,1) | +5 pe | – | +0,43 / −0,38  |
| Balanserat | 88 | 1,59–0,83 | −0,09 | +0,05 (+0,4) | −6 pe | – | −0,02 / +0,12  |
| Bollinnehav | 41 | 1,66–1,02 | −0,27 | −0,12 (−0,6) | +3 pe | – | +0,04 / −0,31  |
| Kortpass | 46 | 1,46–0,87 | −0,27 | −0,13 (−0,7) | +6 pe | – | +0,20 / −0,27  |
| Blandat | 83 | 1,58–0,84 | −0,00 | +0,14 (+1,0) | −1 pe | – | +0,20 / +0,07 ✔ |
| Direktspel | 58 | 1,72–0,90 | −0,25 | −0,10 (−0,6) | −6 pe | – | −0,01 / −0,22 ✔ |
| Lågpress | 64 | 1,30–0,83 | −0,18 | −0,04 (−0,2) | −3 pe | – | +0,23 / −0,10  |
| Mellanpress | 63 | 1,87–0,83 | +0,04 | +0,18 (+1,1) | −7 pe | – | +0,37 / −0,09  |
| Högpress | 60 | 1,62–0,95 | −0,29 | −0,15 (−1,0) | +8 pe | – | −0,10 / −0,28 ✔ |

- Svårast mot **Högpress** (−0,15 p/match rel. eget snitt, z −1,0, 60 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,18 p/match rel. eget snitt, z +1,1, 63 m) – inte stabilt, troligen slump

### Rosario Central

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 56,4 %). 185 matcher med stil, mot marknaden totalt +0,15 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 62 | 1,15–0,98 | +0,03 | −0,12 (−0,9) | +9 pe | – | −0,25 / +0,05  |
| Balanserat | 76 | 1,12–0,96 | +0,25 | +0,10 (+0,7) | −3 pe | – | +0,26 / −0,01  |
| Bollinnehav | 47 | 1,13–1,09 | +0,13 | −0,01 (−0,1) | −5 pe | – | −0,05 / +0,03  |
| Kortpass | 44 | 0,98–1,05 | −0,17 | −0,32 (−1,6) | −6 pe | – | −0,10 / −0,45 ✔ |
| Blandat | 82 | 1,07–0,95 | +0,19 | +0,04 (+0,3) | +3 pe | – | −0,04 / +0,12  |
| Direktspel | 59 | 1,32–1,03 | +0,33 | +0,18 (+1,2) | +2 pe | – | +0,04 / +0,39 ✔ |
| Lågpress | 58 | 1,05–0,84 | +0,10 | −0,05 (−0,3) | −2 pe | – | −0,47 / +0,01  |
| Mellanpress | 59 | 1,27–1,00 | +0,42 | +0,27 (+1,9) | −2 pe | – | +0,06 / +0,57 ✔ |
| Högpress | 68 | 1,07–1,13 | −0,05 | −0,19 (−1,4) | +4 pe | – | −0,01 / −0,71 ✔ |

- Svårast mot **Kortpass** (−0,32 p/match rel. eget snitt, z −1,6, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,27 p/match rel. eget snitt, z +1,9, 59 m) – åt samma håll i båda halvorna men svagt

### San Lorenzo

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass** (faktiskt bollinnehav 48,6 %). 182 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,02–1,02 | −0,01 | −0,06 (−0,4) | −2 pe | – | −0,24 / +0,11  |
| Balanserat | 79 | 0,80–0,68 | +0,15 | +0,10 (+0,8) | +15 pe | – | +0,20 / −0,01  |
| Bollinnehav | 49 | 0,96–0,98 | −0,04 | −0,09 (−0,6) | +9 pe | – | +0,08 / −0,26  |
| Kortpass | 48 | 0,85–1,10 | −0,33 | −0,38 (−2,6) | +3 pe | – | −0,17 / −0,50 ✔ ⚑ |
| Blandat | 73 | 0,77–0,82 | +0,05 | −0,01 (−0,0) | +19 pe | – | −0,06 / +0,06  |
| Direktspel | 61 | 1,11–0,72 | +0,36 | +0,31 (+1,9) | −0 pe | – | +0,25 / +0,38 ✔ |
| Lågpress | 53 | 0,77–1,06 | −0,09 | −0,14 (−0,9) | +1 pe | – | −0,09 / −0,15 ✔ |
| Mellanpress | 60 | 0,97–0,80 | +0,17 | +0,12 (+0,8) | +10 pe | – | +0,26 / −0,07  |
| Högpress | 69 | 0,96–0,77 | +0,05 | +0,00 (+0,0) | +13 pe | – | −0,10 / +0,27  |

- Svårast mot **Kortpass** (−0,38 p/match rel. eget snitt, z −2,6, 48 m) – ⚑ håller i båda halvorna
- Bäst mot **Direktspel** (+0,31 p/match rel. eget snitt, z +1,9, 61 m) – åt samma håll i båda halvorna men svagt

### Sarmiento Junin

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Direktspel** (faktiskt bollinnehav 44,0 %). 165 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 45 | 0,96–1,00 | +0,32 | +0,26 (+1,5) | +2 pe | – | +0,26 / +0,26 ✔ |
| Balanserat | 79 | 0,77–1,39 | −0,13 | −0,19 (−1,4) | −11 pe | – | −0,22 / −0,16 ✔ |
| Bollinnehav | 41 | 0,85–0,98 | +0,13 | +0,07 (+0,4) | +19 pe | – | +0,07 / +0,08 ✔ |
| Kortpass | 42 | 0,64–0,95 | −0,00 | −0,06 (−0,4) | +0 pe | – | −0,34 / +0,09  |
| Blandat | 76 | 1,03–1,22 | +0,17 | +0,11 (+0,8) | −7 pe | – | +0,15 / +0,07 ✔ |
| Direktspel | 47 | 0,72–1,32 | −0,06 | −0,13 (−0,9) | +10 pe | – | −0,06 / −0,20 ✔ |
| Lågpress | 59 | 0,86–1,20 | +0,18 | +0,12 (+0,7) | −5 pe | – | +0,08 / +0,13 ✔ |
| Mellanpress | 46 | 0,85–1,17 | −0,08 | −0,14 (−0,8) | +0 pe | – | −0,21 / −0,03 ✔ |
| Högpress | 60 | 0,82–1,17 | +0,05 | −0,01 (−0,1) | +4 pe | – | +0,11 / −0,36  |

- Svårast mot **Balanserat** (−0,19 p/match rel. eget snitt, z −1,4, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Backar hem** (+0,26 p/match rel. eget snitt, z +1,5, 45 m) – åt samma håll i båda halvorna men svagt

### Talleres Cordoba

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass** (faktiskt bollinnehav 54,1 %). 176 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,11–1,06 | −0,14 | −0,06 (−0,3) | +5 pe | – | +0,01 / −0,13  |
| Balanserat | 78 | 1,14–0,91 | +0,11 | +0,19 (+1,4) | +2 pe | – | +0,22 / +0,17 ✔ |
| Bollinnehav | 44 | 1,14–1,23 | −0,35 | −0,27 (−1,4) | −5 pe | – | −0,10 / −0,43 ✔ |
| Kortpass | 49 | 0,84–1,27 | −0,51 | −0,43 (−2,6) | −1 pe | – | +0,05 / −0,60  |
| Blandat | 73 | 1,38–1,04 | +0,13 | +0,21 (+1,5) | +2 pe | – | +0,01 / +0,50 ✔ |
| Direktspel | 54 | 1,06–0,81 | +0,02 | +0,10 (+0,5) | +2 pe | – | +0,17 / −0,00  |
| Lågpress | 50 | 0,86–0,96 | −0,32 | −0,24 (−1,3) | +3 pe | – | −0,21 / −0,24 ✔ |
| Mellanpress | 56 | 1,18–1,07 | −0,01 | +0,08 (+0,5) | −10 pe | – | +0,04 / +0,11 ✔ |
| Högpress | 70 | 1,29–1,06 | +0,03 | +0,11 (+0,7) | +8 pe | – | +0,14 / +0,03 ✔ |

- Svårast mot **Kortpass** (−0,43 p/match rel. eget snitt, z −2,6, 49 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,21 p/match rel. eget snitt, z +1,5, 73 m) – åt samma håll i båda halvorna men svagt

### Tigre

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 46,6 %). 133 matcher med stil, mot marknaden totalt −0,17 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 30 | 0,83–0,93 | −0,16 | +0,02 (+0,1) | +5 pe | – | −0,15 / +0,30  |
| Balanserat | 69 | 0,83–1,04 | −0,10 | +0,07 (+0,5) | +4 pe | – | −0,35 / +0,43  |
| Bollinnehav | 34 | 0,91–1,26 | −0,33 | −0,15 (−0,7) | −2 pe | – | −0,27 / −0,07 ✔ |
| Kortpass | 45 | 0,89–1,09 | −0,14 | +0,03 (+0,2) | +7 pe | – | −0,25 / +0,18  |
| Blandat | 61 | 0,84–1,15 | −0,31 | −0,14 (−0,9) | −2 pe | – | −0,34 / +0,07  |
| Direktspel | 27 | 0,81–0,89 | +0,09 | +0,26 (+1,1) | +6 pe | – | −0,19 / +1,33  |
| Lågpress | 55 | 0,93–0,95 | +0,11 | +0,28 (+1,6) | −1 pe | – | −0,41 / +0,39  |
| Mellanpress | 44 | 0,80–1,14 | −0,36 | −0,19 (−1,2) | +6 pe | – | −0,30 / −0,01 ✔ |
| Högpress | 34 | 0,79–1,21 | −0,37 | −0,20 (−1,0) | +5 pe | – | −0,22 / −0,06  |

- Svårast mot **Mellanpress** (−0,19 p/match rel. eget snitt, z −1,2, 44 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,28 p/match rel. eget snitt, z +1,6, 55 m) – inte stabilt, troligen slump

### Union de Santa Fe

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat** (faktiskt bollinnehav 49,1 %). 181 matcher med stil, mot marknaden totalt −0,08 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 46 | 0,87–1,07 | −0,33 | −0,26 (−1,6) | +3 pe | – | −0,43 / −0,03 ✔ |
| Balanserat | 80 | 1,10–1,01 | +0,11 | +0,19 (+1,3) | +5 pe | – | +0,24 / +0,13 ✔ |
| Bollinnehav | 55 | 1,11–1,22 | −0,13 | −0,06 (−0,3) | −5 pe | – | −0,06 / −0,05 ✔ |
| Kortpass | 54 | 0,94–0,96 | −0,04 | +0,04 (+0,2) | +2 pe | – | +0,06 / +0,03 ✔ |
| Blandat | 80 | 1,06–1,13 | −0,14 | −0,07 (−0,5) | +3 pe | – | −0,06 / −0,09 ✔ |
| Direktspel | 47 | 1,13–1,17 | −0,00 | +0,07 (+0,4) | −1 pe | – | −0,05 / +0,27  |
| Lågpress | 60 | 1,18–1,18 | −0,18 | −0,10 (−0,7) | +2 pe | – | −0,28 / −0,05 ✔ |
| Mellanpress | 61 | 1,02–1,13 | −0,03 | +0,04 (+0,3) | −3 pe | – | −0,12 / +0,25  |
| Högpress | 60 | 0,93–0,95 | −0,02 | +0,06 (+0,4) | +6 pe | – | +0,11 / −0,06  |

- Svårast mot **Backar hem** (−0,26 p/match rel. eget snitt, z −1,6, 46 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,19 p/match rel. eget snitt, z +1,3, 80 m) – åt samma håll i båda halvorna men svagt

### Velez Sarsfield

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass** (faktiskt bollinnehav 53,7 %). 181 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 59 | 1,19–0,97 | −0,11 | −0,06 (−0,4) | +11 pe | – | −0,08 / −0,05 ✔ |
| Balanserat | 74 | 1,01–0,82 | +0,10 | +0,15 (+1,0) | +4 pe | – | −0,14 / +0,48  |
| Bollinnehav | 48 | 1,00–1,04 | −0,20 | −0,15 (−1,0) | +3 pe | – | −0,29 / −0,03 ✔ |
| Kortpass | 41 | 1,07–0,80 | +0,02 | +0,07 (+0,3) | −2 pe | – | −0,55 / +0,32  |
| Blandat | 77 | 0,94–0,87 | −0,06 | −0,01 (−0,1) | +11 pe | – | −0,15 / +0,14  |
| Direktspel | 63 | 1,22–1,08 | −0,07 | −0,03 (−0,2) | +6 pe | – | −0,05 / +0,00  |
| Lågpress | 57 | 1,00–0,89 | +0,05 | +0,10 (+0,6) | +9 pe | – | +0,21 / +0,08 ✔ |
| Mellanpress | 53 | 1,06–0,87 | −0,03 | +0,01 (+0,1) | −1 pe | – | −0,07 / +0,11  |
| Högpress | 71 | 1,13–1,00 | −0,13 | −0,09 (−0,7) | +9 pe | – | −0,26 / +0,45  |

- Svårast mot **Bollinnehav** (−0,15 p/match rel. eget snitt, z −1,0, 48 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,15 p/match rel. eget snitt, z +1,0, 74 m) – inte stabilt, troligen slump
