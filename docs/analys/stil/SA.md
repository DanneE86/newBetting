# Stilmatchning – Serie A (SA)

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, från lagets föregående säsong. 2950 matcher med stängningsodds och stil för båda lagen.

Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.

## Ligan: hemmalagets stil mot bortalagets

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 166 m · hemma −0,13 · kryss +6 pe · ö2,5 −0 pe | 222 m · hemma −0,07 · kryss +3 pe · ö2,5 −2 pe | 343 m · hemma −0,15 · kryss −4 pe · ö2,5 +5 pe |
| **Mellan** | 221 m · hemma +0,04 · kryss +2 pe · ö2,5 +0 pe | 262 m · hemma +0,01 · kryss +3 pe · ö2,5 −4 pe | 411 m · hemma −0,11 · kryss −0 pe · ö2,5 −4 pe |
| **Mycket boll** | 346 m · hemma +0,04 · kryss +2 pe · ö2,5 +0 pe | 409 m · hemma −0,00 · kryss +1 pe · ö2,5 +3 pe | 570 m · hemma −0,03 · kryss −0 pe · ö2,5 +2 pe |

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 258 m · hemma −0,10 · kryss +2 pe · ö2,5 +2 pe | 360 m · hemma +0,04 · kryss −0 pe · ö2,5 −1 pe | 268 m · hemma −0,10 · kryss −2 pe · ö2,5 +3 pe |
| **Balanserat** | 365 m · hemma −0,04 · kryss +2 pe · ö2,5 −0 pe | 546 m · hemma −0,06 · kryss +2 pe · ö2,5 −0 pe | 336 m · hemma −0,10 · kryss +1 pe · ö2,5 −3 pe |
| **Bollinnehav** | 265 m · hemma +0,07 · kryss +2 pe · ö2,5 +5 pe | 338 m · hemma +0,01 · kryss +1 pe · ö2,5 −3 pe | 214 m · hemma −0,13 · kryss −0 pe · ö2,5 +4 pe |

## Lag (säsong 2026/27)

### Atalanta

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 48,0 %). 301 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 88 | 2,09–1,23 | +0,06 | +0,07 (+0,6) | +5 pe | +2 pe | +0,17 / −0,06  |
| Balanserat | 129 | 1,89–1,18 | −0,05 | −0,04 (−0,3) | −0 pe | +5 pe | −0,08 / −0,00 ✔ |
| Bollinnehav | 84 | 1,80–1,11 | −0,03 | −0,02 (−0,1) | −6 pe | −4 pe | −0,04 / +0,00  |
| Kortpass | 70 | 1,79–1,00 | +0,02 | +0,03 (+0,2) | −1 pe | −1 pe | −0,11 / +0,09  |
| Blandat | 112 | 1,79–1,18 | −0,06 | −0,04 (−0,4) | −3 pe | +0 pe | −0,01 / −0,08 ✔ |
| Direktspel | 119 | 2,13–1,27 | +0,01 | +0,02 (+0,2) | +3 pe | +4 pe | +0,07 / −0,06  |
| Lågpress | 83 | 1,87–1,08 | +0,08 | +0,10 (+0,7) | +1 pe | −2 pe | +0,16 / +0,05 ✔ |
| Mellanpress | 134 | 1,86–1,24 | −0,09 | −0,08 (−0,7) | −0 pe | +3 pe | −0,12 / −0,04 ✔ |
| Högpress | 84 | 2,08–1,15 | +0,01 | +0,03 (+0,2) | −1 pe | +2 pe | +0,08 / −0,07  |

- Svårast mot **Mellanpress** (−0,08 p/match rel. eget snitt, z −0,7, 134 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,10 p/match rel. eget snitt, z +0,7, 83 m) – åt samma håll i båda halvorna men svagt

### Bologna

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 52,3 %). 301 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 93 | 1,41–1,39 | +0,06 | +0,00 (+0,0) | +12 pe | +2 pe | −0,05 / +0,07  |
| Balanserat | 133 | 1,21–1,35 | −0,02 | −0,07 (−0,7) | +1 pe | −2 pe | −0,27 / +0,09  |
| Bollinnehav | 75 | 1,41–1,37 | +0,17 | +0,12 (+0,8) | −5 pe | +6 pe | +0,14 / +0,10 ✔ |
| Kortpass | 63 | 1,24–1,22 | −0,07 | −0,12 (−0,8) | −4 pe | +2 pe | −0,20 / −0,10 ✔ |
| Blandat | 122 | 1,32–1,37 | +0,16 | +0,11 (+1,0) | +4 pe | +0 pe | −0,02 / +0,25  |
| Direktspel | 116 | 1,37–1,44 | −0,00 | −0,05 (−0,5) | +5 pe | +2 pe | −0,13 / +0,07  |
| Lågpress | 80 | 1,38–1,40 | −0,02 | −0,07 (−0,5) | +7 pe | +4 pe | −0,18 / −0,01 ✔ |
| Mellanpress | 129 | 1,30–1,42 | −0,04 | −0,10 (−1,0) | +3 pe | +4 pe | −0,29 / +0,11  |
| Högpress | 92 | 1,30–1,26 | +0,25 | +0,20 (+1,5) | −1 pe | −5 pe | +0,21 / +0,18 ✔ |

- Svårast mot **Mellanpress** (−0,10 p/match rel. eget snitt, z −1,0, 129 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,20 p/match rel. eget snitt, z +1,5, 92 m) – åt samma håll i båda halvorna men svagt

### Cagliari

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 40,7 %). 291 matcher med stil, mot marknaden totalt −0,00 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 85 | 1,09–1,69 | −0,13 | −0,13 (−1,2) | +6 pe | +3 pe | −0,14 / −0,12 ✔ |
| Balanserat | 132 | 1,17–1,44 | +0,11 | +0,11 (+1,1) | +1 pe | −0 pe | +0,02 / +0,18 ✔ |
| Bollinnehav | 74 | 0,96–1,30 | −0,05 | −0,05 (−0,4) | +4 pe | −11 pe | −0,02 / −0,09 ✔ |
| Kortpass | 66 | 1,24–1,35 | +0,26 | +0,26 (+1,8) | +2 pe | +3 pe | +0,27 / +0,25 ✔ |
| Blandat | 122 | 0,89–1,43 | −0,08 | −0,08 (−0,8) | +0 pe | −9 pe | −0,19 / +0,01  |
| Direktspel | 103 | 1,23–1,61 | −0,07 | −0,07 (−0,6) | +7 pe | +3 pe | −0,02 / −0,17 ✔ |
| Lågpress | 84 | 1,11–1,43 | +0,05 | +0,05 (+0,4) | +2 pe | +2 pe | −0,16 / +0,19  |
| Mellanpress | 121 | 1,07–1,55 | −0,01 | −0,01 (−0,1) | +5 pe | −3 pe | +0,00 / −0,02  |
| Högpress | 86 | 1,12–1,43 | −0,04 | −0,04 (−0,3) | +1 pe | −4 pe | −0,04 / −0,02 ✔ |

- Svårast mot **Backar hem** (−0,13 p/match rel. eget snitt, z −1,2, 85 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Kortpass** (+0,26 p/match rel. eget snitt, z +1,8, 66 m) – åt samma håll i båda halvorna men svagt

### Como

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 61,6 %). 139 matcher med stil, mot marknaden totalt +0,13 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 25 | 1,52–1,24 | +0,06 | −0,07 (−0,3) | −6 pe | +2 pe | −0,20 / +0,03  |
| Balanserat | 85 | 1,40–1,08 | +0,04 | −0,09 (−0,8) | +5 pe | −3 pe | −0,02 / −0,18 ✔ |
| Bollinnehav | 29 | 1,59–1,00 | +0,47 | +0,33 (+1,5) | −1 pe | −2 pe | +0,21 / +0,42 ✔ |
| Kortpass | 41 | 1,59–1,07 | +0,07 | −0,07 (−0,4) | +2 pe | −4 pe | −0,53 / +0,06  |
| Blandat | 72 | 1,39–1,08 | +0,14 | +0,00 (+0,0) | +0 pe | −1 pe | +0,07 / −0,08  |
| Direktspel | 26 | 1,46–1,15 | +0,22 | +0,09 (+0,4) | +5 pe | −2 pe | +0,08 / +0,15 ✔ |
| Lågpress | 58 | 1,55–1,19 | −0,00 | −0,14 (−0,9) | −4 pe | +4 pe | −0,38 / −0,07 ✔ |
| Mellanpress | 44 | 1,34–1,05 | +0,17 | +0,04 (+0,2) | +7 pe | −4 pe | +0,00 / +0,10 ✔ |
| Högpress | 37 | 1,46–1,00 | +0,30 | +0,17 (+0,9) | +4 pe | −7 pe | +0,15 / +0,24 ✔ |

- Svårast mot **Lågpress** (−0,14 p/match rel. eget snitt, z −0,9, 58 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Bollinnehav** (+0,33 p/match rel. eget snitt, z +1,5, 29 m) – åt samma håll i båda halvorna men svagt

### Fiorentina

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 43,5 %). 301 matcher med stil, mot marknaden totalt −0,09 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 92 | 1,35–1,37 | −0,12 | −0,03 (−0,2) | −1 pe | +4 pe | −0,22 / +0,21  |
| Balanserat | 126 | 1,34–1,15 | −0,12 | −0,03 (−0,3) | +5 pe | −4 pe | +0,04 / −0,08  |
| Bollinnehav | 83 | 1,42–1,37 | −0,02 | +0,08 (+0,6) | +7 pe | +6 pe | −0,06 / +0,23  |
| Kortpass | 71 | 1,27–1,30 | −0,05 | +0,04 (+0,3) | +9 pe | −1 pe | −0,05 / +0,07  |
| Blandat | 120 | 1,43–1,26 | −0,02 | +0,07 (+0,6) | +1 pe | +1 pe | +0,07 / +0,07 ✔ |
| Direktspel | 110 | 1,35–1,29 | −0,19 | −0,10 (−0,9) | +3 pe | +2 pe | −0,21 / +0,10  |
| Lågpress | 83 | 1,33–1,12 | −0,11 | −0,02 (−0,1) | +9 pe | −1 pe | +0,09 / −0,09  |
| Mellanpress | 128 | 1,24–1,46 | −0,22 | −0,12 (−1,2) | −6 pe | +4 pe | −0,36 / +0,08  |
| Högpress | 90 | 1,58–1,17 | +0,10 | +0,19 (+1,5) | +12 pe | −1 pe | +0,12 / +0,31 ✔ |

- Svårast mot **Mellanpress** (−0,12 p/match rel. eget snitt, z −1,2, 128 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,19 p/match rel. eget snitt, z +1,5, 90 m) – åt samma håll i båda halvorna men svagt

### Frosinone

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Blandat, Högpress** (faktiskt bollinnehav 41,5 %). 217 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 52 | 1,25–1,17 | +0,12 | +0,06 (+0,3) | +5 pe | −5 pe | −0,11 / +0,17  |
| Balanserat | 107 | 1,47–1,23 | +0,11 | +0,04 (+0,4) | −0 pe | +7 pe | +0,02 / +0,07 ✔ |
| Bollinnehav | 58 | 1,19–1,21 | −0,06 | −0,12 (−0,8) | −3 pe | −4 pe | −0,26 / +0,02  |
| Kortpass | 45 | 1,42–0,93 | +0,24 | +0,18 (+1,1) | +10 pe | −5 pe | −0,02 / +0,20  |
| Blandat | 90 | 1,46–1,27 | +0,11 | +0,04 (+0,3) | −8 pe | +8 pe | −0,10 / +0,20  |
| Direktspel | 82 | 1,17–1,30 | −0,08 | −0,14 (−1,1) | +4 pe | −3 pe | −0,08 / −0,29 ✔ |
| Lågpress | 48 | 1,48–1,00 | +0,30 | +0,23 (+1,3) | +1 pe | −5 pe | −0,11 / +0,35  |
| Mellanpress | 108 | 1,22–1,29 | −0,07 | −0,14 (−1,3) | −1 pe | +1 pe | −0,22 / −0,06 ✔ |
| Högpress | 61 | 1,44–1,25 | +0,13 | +0,06 (+0,4) | +2 pe | +5 pe | +0,08 / +0,01 ✔ |

- Svårast mot **Mellanpress** (−0,14 p/match rel. eget snitt, z −1,3, 108 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,23 p/match rel. eget snitt, z +1,3, 48 m) – inte stabilt, troligen slump

### Genoa

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 47,7 %). 291 matcher med stil, mot marknaden totalt −0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 83 | 1,08–1,64 | −0,07 | −0,01 (−0,1) | +11 pe | +0 pe | −0,24 / +0,33  |
| Balanserat | 132 | 0,99–1,26 | −0,09 | −0,04 (−0,4) | +5 pe | +0 pe | −0,09 / −0,00 ✔ |
| Bollinnehav | 76 | 1,22–1,49 | +0,02 | +0,08 (+0,6) | +2 pe | +5 pe | +0,23 / −0,08  |
| Kortpass | 66 | 1,00–1,24 | +0,05 | +0,10 (+0,7) | +2 pe | −3 pe | +0,24 / +0,05 ✔ |
| Blandat | 117 | 1,10–1,39 | +0,02 | +0,08 (+0,8) | +10 pe | +3 pe | +0,08 / +0,07 ✔ |
| Direktspel | 108 | 1,10–1,57 | −0,21 | −0,15 (−1,4) | +4 pe | +3 pe | −0,24 / +0,02  |
| Lågpress | 91 | 1,18–1,41 | −0,06 | −0,00 (−0,0) | −1 pe | +8 pe | −0,12 / +0,07  |
| Mellanpress | 116 | 0,96–1,47 | −0,04 | +0,01 (+0,1) | +8 pe | −0 pe | −0,00 / +0,03  |
| Högpress | 84 | 1,14–1,38 | −0,07 | −0,02 (−0,1) | +10 pe | −3 pe | −0,07 / +0,07  |

- Svårast mot **Direktspel** (−0,15 p/match rel. eget snitt, z −1,4, 108 m) – inte stabilt, troligen slump
- Bäst mot **Blandat** (+0,08 p/match rel. eget snitt, z +0,8, 117 m) – åt samma håll i båda halvorna men svagt

### Inter

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Blandat, Lågpress** (faktiskt bollinnehav 63,0 %). 301 matcher med stil, mot marknaden totalt +0,14 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 2,09–0,94 | −0,01 | −0,14 (−1,2) | +2 pe | +5 pe | −0,25 / +0,00  |
| Balanserat | 129 | 2,18–0,77 | +0,23 | +0,09 (+0,9) | −5 pe | −1 pe | +0,16 / +0,03 ✔ |
| Bollinnehav | 86 | 2,09–1,09 | +0,14 | +0,01 (+0,1) | −3 pe | +3 pe | +0,01 / +0,00 ✔ |
| Kortpass | 72 | 2,33–0,99 | +0,15 | +0,01 (+0,1) | −5 pe | +8 pe | −0,06 / +0,03  |
| Blandat | 115 | 2,15–0,85 | +0,25 | +0,12 (+1,2) | −4 pe | −4 pe | +0,27 / −0,03  |
| Direktspel | 114 | 1,98–0,92 | +0,01 | −0,13 (−1,2) | +1 pe | +4 pe | −0,22 / +0,05  |
| Lågpress | 82 | 2,17–0,93 | +0,09 | −0,04 (−0,4) | −4 pe | +1 pe | +0,03 / −0,10  |
| Mellanpress | 127 | 1,98–0,99 | +0,01 | −0,13 (−1,3) | +1 pe | −1 pe | −0,20 / −0,06 ✔ |
| Högpress | 92 | 2,29–0,78 | +0,35 | +0,21 (+2,1) | −4 pe | +6 pe | +0,15 / +0,33 ✔ ⚑ |

- Svårast mot **Mellanpress** (−0,13 p/match rel. eget snitt, z −1,3, 127 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,21 p/match rel. eget snitt, z +2,1, 92 m) – ⚑ håller i båda halvorna

### Juventus

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Lågpress** (faktiskt bollinnehav 56,1 %). 301 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 86 | 1,65–0,84 | +0,13 | +0,09 (+0,7) | +1 pe | −9 pe | +0,00 / +0,20 ✔ |
| Balanserat | 131 | 1,63–0,92 | +0,03 | −0,01 (−0,1) | +2 pe | −7 pe | −0,05 / +0,02  |
| Bollinnehav | 84 | 1,70–1,01 | −0,04 | −0,08 (−0,6) | +2 pe | +1 pe | +0,03 / −0,20  |
| Kortpass | 69 | 1,68–0,90 | −0,06 | −0,10 (−0,8) | +12 pe | −6 pe | −0,03 / −0,13 ✔ |
| Blandat | 122 | 1,61–1,06 | −0,02 | −0,06 (−0,6) | −0 pe | −3 pe | −0,07 / −0,06 ✔ |
| Direktspel | 110 | 1,68–0,79 | +0,17 | +0,14 (+1,3) | −3 pe | −8 pe | +0,04 / +0,32 ✔ |
| Lågpress | 82 | 1,79–0,88 | +0,09 | +0,05 (+0,5) | +2 pe | −5 pe | +0,21 / −0,06  |
| Mellanpress | 125 | 1,58–0,89 | −0,03 | −0,07 (−0,7) | +7 pe | −8 pe | −0,23 / +0,08  |
| Högpress | 94 | 1,64–1,01 | +0,09 | +0,05 (+0,4) | −6 pe | −2 pe | +0,10 / −0,02  |

- Svårast mot **Kortpass** (−0,10 p/match rel. eget snitt, z −0,8, 69 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Direktspel** (+0,14 p/match rel. eget snitt, z +1,3, 110 m) – åt samma håll i båda halvorna men svagt

### Lazio

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 46,5 %). 301 matcher med stil, mot marknaden totalt +0,10 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 89 | 1,55–1,15 | +0,14 | +0,04 (+0,3) | −1 pe | +2 pe | +0,04 / +0,03 ✔ |
| Balanserat | 128 | 1,59–1,20 | +0,10 | −0,01 (−0,1) | −3 pe | +1 pe | −0,06 / +0,04  |
| Bollinnehav | 84 | 1,65–1,21 | +0,08 | −0,03 (−0,2) | −8 pe | +6 pe | −0,18 / +0,16  |
| Kortpass | 67 | 1,57–1,24 | +0,04 | −0,07 (−0,4) | −6 pe | +4 pe | −0,17 / −0,03 ✔ |
| Blandat | 121 | 1,50–1,25 | +0,12 | +0,01 (+0,1) | −1 pe | +1 pe | −0,19 / +0,24  |
| Direktspel | 113 | 1,71–1,10 | +0,13 | +0,03 (+0,2) | −6 pe | +3 pe | +0,08 / −0,05  |
| Lågpress | 79 | 1,41–1,13 | −0,00 | −0,11 (−0,8) | +0 pe | −4 pe | −0,19 / −0,06 ✔ |
| Mellanpress | 125 | 1,56–1,14 | +0,18 | +0,08 (+0,7) | −8 pe | +2 pe | −0,09 / +0,23  |
| Högpress | 97 | 1,79–1,31 | +0,09 | −0,01 (−0,1) | −2 pe | +9 pe | +0,02 / −0,07  |

- Svårast mot **Lågpress** (−0,11 p/match rel. eget snitt, z −0,8, 79 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Mellanpress** (+0,08 p/match rel. eget snitt, z +0,7, 125 m) – inte stabilt, troligen slump

### Lecce

Egen stil nu (jämfört med vad lagets styrka motiverar): **Backar hem, Kortpass, Mellanpress** (faktiskt bollinnehav 38,6 %). 253 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 71 | 0,97–1,55 | −0,20 | −0,18 (−1,5) | +5 pe | +0 pe | −0,13 / −0,23 ✔ |
| Balanserat | 104 | 1,15–1,25 | +0,19 | +0,21 (+1,8) | −2 pe | −2 pe | +0,26 / +0,18 ✔ |
| Bollinnehav | 78 | 1,04–1,59 | −0,14 | −0,12 (−1,1) | +4 pe | +1 pe | −0,08 / −0,18 ✔ |
| Kortpass | 67 | 1,03–1,39 | +0,09 | +0,11 (+0,8) | −2 pe | +0 pe | +0,13 / +0,10 ✔ |
| Blandat | 90 | 0,92–1,44 | −0,08 | −0,05 (−0,5) | +3 pe | −4 pe | −0,14 / +0,03  |
| Direktspel | 96 | 1,23–1,47 | −0,05 | −0,03 (−0,2) | +3 pe | +2 pe | +0,10 / −0,33  |
| Lågpress | 69 | 0,87–1,49 | −0,05 | −0,03 (−0,2) | −6 pe | −3 pe | +0,02 / −0,04  |
| Mellanpress | 104 | 1,10–1,25 | −0,02 | +0,00 (+0,0) | +6 pe | −3 pe | −0,01 / +0,01  |
| Högpress | 80 | 1,20–1,64 | +0,00 | +0,02 (+0,2) | +3 pe | +4 pe | +0,04 / −0,04  |

- Svårast mot **Backar hem** (−0,18 p/match rel. eget snitt, z −1,5, 71 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,21 p/match rel. eget snitt, z +1,8, 104 m) – åt samma håll i båda halvorna men svagt

### Milan

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 60,5 %). 301 matcher med stil, mot marknaden totalt +0,12 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 94 | 1,66–1,07 | +0,18 | +0,06 (+0,4) | −1 pe | −0 pe | +0,29 / −0,24  |
| Balanserat | 120 | 1,77–1,01 | +0,21 | +0,08 (+0,8) | −1 pe | +2 pe | +0,22 / −0,03  |
| Bollinnehav | 87 | 1,63–1,16 | −0,05 | −0,17 (−1,3) | −2 pe | +5 pe | −0,19 / −0,15 ✔ |
| Kortpass | 67 | 1,66–1,19 | −0,20 | −0,33 (−2,2) | +8 pe | +6 pe | −0,10 / −0,41 ✔ ⚑ |
| Blandat | 119 | 1,66–1,04 | +0,23 | +0,10 (+1,0) | −4 pe | −1 pe | +0,09 / +0,11 ✔ |
| Direktspel | 115 | 1,76–1,03 | +0,21 | +0,08 (+0,7) | −3 pe | +3 pe | +0,20 / −0,12  |
| Lågpress | 76 | 1,55–0,97 | +0,11 | −0,01 (−0,1) | +3 pe | −2 pe | +0,05 / −0,05  |
| Mellanpress | 131 | 1,70–1,15 | +0,09 | −0,04 (−0,3) | −3 pe | +4 pe | +0,07 / −0,13  |
| Högpress | 94 | 1,81–1,05 | +0,18 | +0,06 (+0,5) | −2 pe | +2 pe | +0,21 / −0,20  |

- Svårast mot **Kortpass** (−0,33 p/match rel. eget snitt, z −2,2, 67 m) – ⚑ håller i båda halvorna
- Bäst mot **Blandat** (+0,10 p/match rel. eget snitt, z +1,0, 119 m) – åt samma håll i båda halvorna men svagt

### Monza

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Lågpress** (faktiskt bollinnehav 46,1 %). 177 matcher med stil, mot marknaden totalt +0,04 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 59 | 1,29–1,39 | +0,00 | −0,04 (−0,3) | +2 pe | +8 pe | +0,23 / −0,20  |
| Balanserat | 76 | 1,33–1,37 | +0,09 | +0,05 (+0,4) | −5 pe | −5 pe | +0,08 / +0,01 ✔ |
| Bollinnehav | 42 | 1,02–1,29 | +0,01 | −0,03 (−0,2) | +9 pe | −7 pe | +0,09 / −0,20  |
| Kortpass | 47 | 1,02–1,23 | −0,05 | −0,09 (−0,6) | +3 pe | −11 pe | −0,16 / −0,07 ✔ |
| Blandat | 69 | 1,35–1,38 | +0,15 | +0,10 (+0,7) | −4 pe | +1 pe | +0,33 / −0,15  |
| Direktspel | 61 | 1,30–1,43 | −0,00 | −0,05 (−0,3) | +4 pe | +5 pe | +0,01 / −0,15  |
| Lågpress | 45 | 1,44–1,36 | +0,21 | +0,17 (+1,0) | −7 pe | +8 pe | +0,28 / +0,16  |
| Mellanpress | 82 | 1,11–1,26 | +0,04 | −0,01 (−0,0) | +4 pe | −11 pe | +0,21 / −0,31  |
| Högpress | 50 | 1,28–1,52 | −0,10 | −0,14 (−0,9) | +0 pe | +8 pe | −0,01 / −0,46 ✔ |

- Svårast mot **Högpress** (−0,14 p/match rel. eget snitt, z −0,9, 50 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Lågpress** (+0,17 p/match rel. eget snitt, z +1,0, 45 m) – inte stabilt, troligen slump

### Napoli

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 49,8 %). 301 matcher med stil, mot marknaden totalt +0,07 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 94 | 1,93–1,05 | +0,15 | +0,08 (+0,6) | −5 pe | +9 pe | +0,04 / +0,13 ✔ |
| Balanserat | 129 | 1,61–0,89 | +0,15 | +0,08 (+0,8) | −0 pe | −6 pe | +0,09 / +0,07 ✔ |
| Bollinnehav | 78 | 1,79–1,09 | −0,15 | −0,22 (−1,5) | −5 pe | +1 pe | −0,27 / −0,18 ✔ |
| Kortpass | 70 | 1,59–0,81 | +0,12 | +0,05 (+0,3) | −2 pe | −8 pe | +0,37 / −0,06  |
| Blandat | 110 | 1,86–1,09 | +0,04 | −0,03 (−0,3) | −1 pe | +4 pe | −0,08 / +0,02  |
| Direktspel | 121 | 1,76–1,01 | +0,08 | +0,00 (+0,0) | −4 pe | +2 pe | −0,08 / +0,13  |
| Lågpress | 83 | 1,77–0,99 | +0,13 | +0,06 (+0,4) | +2 pe | +5 pe | −0,12 / +0,18  |
| Mellanpress | 127 | 1,68–1,02 | +0,02 | −0,05 (−0,5) | −5 pe | −4 pe | +0,10 / −0,19  |
| Högpress | 91 | 1,86–0,96 | +0,10 | +0,02 (+0,2) | −5 pe | +3 pe | −0,11 / +0,22  |

- Svårast mot **Bollinnehav** (−0,22 p/match rel. eget snitt, z −1,5, 78 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Balanserat** (+0,08 p/match rel. eget snitt, z +0,8, 129 m) – åt samma håll i båda halvorna men svagt

### Parma

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 42,8 %). 243 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 54 | 1,35–1,30 | +0,14 | +0,08 (+0,5) | +2 pe | −0 pe | +0,14 / +0,01 ✔ |
| Balanserat | 120 | 1,26–1,35 | +0,13 | +0,08 (+0,7) | +7 pe | +1 pe | −0,06 / +0,17  |
| Bollinnehav | 69 | 0,99–1,43 | −0,14 | −0,20 (−1,4) | +2 pe | −7 pe | −0,36 / +0,03  |
| Kortpass | 57 | 0,93–1,44 | +0,02 | −0,03 (−0,2) | +5 pe | −10 pe | −0,30 / +0,07  |
| Blandat | 112 | 1,19–1,41 | +0,05 | −0,00 (−0,0) | +3 pe | +0 pe | −0,21 / +0,20  |
| Direktspel | 74 | 1,43–1,23 | +0,08 | +0,03 (+0,2) | +7 pe | +1 pe | +0,08 / −0,07  |
| Lågpress | 75 | 1,12–1,44 | +0,06 | +0,01 (+0,0) | +4 pe | −7 pe | −0,29 / +0,14  |
| Mellanpress | 89 | 1,08–1,30 | −0,10 | −0,16 (−1,3) | +13 pe | −4 pe | −0,20 / −0,12 ✔ |
| Högpress | 79 | 1,42–1,35 | +0,23 | +0,17 (+1,2) | −4 pe | +5 pe | +0,05 / +0,44 ✔ |

- Svårast mot **Bollinnehav** (−0,20 p/match rel. eget snitt, z −1,4, 69 m) – inte stabilt, troligen slump
- Bäst mot **Högpress** (+0,17 p/match rel. eget snitt, z +1,2, 79 m) – åt samma håll i båda halvorna men svagt

### Roma

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Högpress** (faktiskt bollinnehav 57,7 %). 301 matcher med stil, mot marknaden totalt +0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 90 | 1,53–1,00 | +0,12 | +0,08 (+0,6) | −7 pe | −2 pe | +0,01 / +0,18 ✔ |
| Balanserat | 127 | 1,65–1,19 | +0,01 | −0,04 (−0,4) | −5 pe | +3 pe | −0,24 / +0,11  |
| Bollinnehav | 84 | 1,74–1,23 | +0,02 | −0,03 (−0,2) | +4 pe | +0 pe | +0,05 / −0,11  |
| Kortpass | 66 | 1,83–1,11 | +0,02 | −0,03 (−0,2) | −4 pe | +6 pe | −0,07 / −0,01 ✔ |
| Blandat | 124 | 1,48–1,10 | +0,09 | +0,04 (+0,4) | −4 pe | −7 pe | −0,12 / +0,19  |
| Direktspel | 111 | 1,71–1,21 | +0,02 | −0,03 (−0,2) | −2 pe | +5 pe | −0,03 / −0,03 ✔ |
| Lågpress | 78 | 1,76–0,99 | +0,14 | +0,10 (+0,7) | −10 pe | −1 pe | −0,02 / +0,19  |
| Mellanpress | 131 | 1,63–1,31 | −0,04 | −0,09 (−0,9) | −3 pe | +4 pe | −0,26 / +0,06  |
| Högpress | 92 | 1,57–1,04 | +0,09 | +0,04 (+0,4) | +3 pe | −4 pe | +0,12 / −0,06  |

- Svårast mot **Mellanpress** (−0,09 p/match rel. eget snitt, z −0,9, 131 m) – inte stabilt, troligen slump
- Bäst mot **Lågpress** (+0,10 p/match rel. eget snitt, z +0,7, 78 m) – inte stabilt, troligen slump

### Sassuolo

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Kortpass, Mellanpress** (faktiskt bollinnehav 47,0 %). 293 matcher med stil, mot marknaden totalt +0,06 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 81 | 1,52–1,49 | +0,17 | +0,11 (+0,8) | −0 pe | +9 pe | +0,12 / +0,10 ✔ |
| Balanserat | 133 | 1,53–1,53 | +0,05 | −0,01 (−0,1) | +1 pe | +9 pe | −0,12 / +0,08  |
| Bollinnehav | 79 | 1,47–1,81 | −0,04 | −0,10 (−0,8) | +1 pe | +2 pe | +0,22 / −0,37  |
| Kortpass | 58 | 1,47–1,43 | −0,00 | −0,06 (−0,3) | −5 pe | +3 pe | +0,69 / −0,25  |
| Blandat | 124 | 1,48–1,65 | +0,11 | +0,05 (+0,5) | −0 pe | +6 pe | +0,08 / +0,03 ✔ |
| Direktspel | 111 | 1,58–1,61 | +0,03 | −0,03 (−0,3) | +5 pe | +10 pe | −0,08 / +0,07  |
| Lågpress | 77 | 1,36–1,35 | +0,04 | −0,02 (−0,2) | +1 pe | +2 pe | −0,18 / +0,10  |
| Mellanpress | 126 | 1,55–1,63 | +0,09 | +0,03 (+0,3) | +2 pe | +8 pe | +0,22 / −0,14  |
| Högpress | 90 | 1,59–1,76 | +0,04 | −0,02 (−0,1) | −2 pe | +9 pe | +0,01 / −0,06  |

- Svårast mot **Bollinnehav** (−0,10 p/match rel. eget snitt, z −0,8, 79 m) – inte stabilt, troligen slump
- Bäst mot **Backar hem** (+0,11 p/match rel. eget snitt, z +0,8, 81 m) – åt samma håll i båda halvorna men svagt

### Torino

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Lågpress** (faktiskt bollinnehav 53,7 %). 301 matcher med stil, mot marknaden totalt −0,02 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 95 | 1,35–1,20 | +0,11 | +0,13 (+1,1) | +4 pe | −3 pe | +0,19 / +0,05 ✔ |
| Balanserat | 122 | 1,11–1,32 | −0,01 | +0,01 (+0,1) | +0 pe | −0 pe | −0,06 / +0,07  |
| Bollinnehav | 84 | 0,98–1,48 | −0,18 | −0,16 (−1,3) | +11 pe | −8 pe | −0,18 / −0,14 ✔ |
| Kortpass | 66 | 1,12–1,42 | −0,05 | −0,03 (−0,2) | +7 pe | −1 pe | −0,20 / +0,04  |
| Blandat | 122 | 1,05–1,41 | −0,09 | −0,07 (−0,7) | +4 pe | −1 pe | −0,12 / −0,03 ✔ |
| Direktspel | 113 | 1,27–1,18 | +0,08 | +0,10 (+0,9) | +3 pe | −7 pe | +0,14 / +0,02 ✔ |
| Lågpress | 82 | 1,23–1,38 | +0,01 | +0,03 (+0,2) | +4 pe | +2 pe | −0,06 / +0,09  |
| Mellanpress | 129 | 0,94–1,28 | −0,15 | −0,13 (−1,3) | +5 pe | −11 pe | −0,13 / −0,13 ✔ |
| Högpress | 90 | 1,38–1,34 | +0,14 | +0,16 (+1,3) | +4 pe | +3 pe | +0,15 / +0,17 ✔ |

- Svårast mot **Mellanpress** (−0,13 p/match rel. eget snitt, z −1,3, 129 m) – åt samma håll i båda halvorna men svagt
- Bäst mot **Högpress** (+0,16 p/match rel. eget snitt, z +1,3, 90 m) – åt samma håll i båda halvorna men svagt

### Udinese

Egen stil nu (jämfört med vad lagets styrka motiverar): **Balanserat, Blandat, Mellanpress** (faktiskt bollinnehav 45,9 %). 301 matcher med stil, mot marknaden totalt −0,05 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 80 | 1,19–1,52 | −0,06 | −0,01 (−0,1) | −1 pe | −0 pe | +0,00 / −0,03  |
| Balanserat | 134 | 1,19–1,31 | +0,05 | +0,10 (+0,9) | +3 pe | −3 pe | +0,02 / +0,16 ✔ |
| Bollinnehav | 87 | 1,01–1,48 | −0,19 | −0,14 (−1,2) | +6 pe | −3 pe | +0,10 / −0,40  |
| Kortpass | 73 | 1,10–1,21 | −0,03 | +0,02 (+0,2) | +10 pe | −6 pe | +0,02 / +0,02 ✔ |
| Blandat | 116 | 1,16–1,59 | −0,13 | −0,09 (−0,9) | +5 pe | +1 pe | −0,08 / −0,09 ✔ |
| Direktspel | 112 | 1,15–1,38 | +0,03 | +0,07 (+0,6) | −5 pe | −4 pe | +0,14 / −0,05  |
| Lågpress | 78 | 1,01–1,29 | −0,05 | −0,00 (−0,0) | −2 pe | −3 pe | −0,13 / +0,07  |
| Mellanpress | 127 | 1,13–1,47 | −0,08 | −0,03 (−0,3) | +3 pe | −2 pe | +0,22 / −0,29  |
| Högpress | 96 | 1,26–1,44 | −0,01 | +0,04 (+0,4) | +6 pe | −3 pe | −0,08 / +0,23  |

- Svårast mot **Bollinnehav** (−0,14 p/match rel. eget snitt, z −1,2, 87 m) – inte stabilt, troligen slump
- Bäst mot **Balanserat** (+0,10 p/match rel. eget snitt, z +0,9, 134 m) – åt samma håll i båda halvorna men svagt

### Venezia

Egen stil nu (jämfört med vad lagets styrka motiverar): **Bollinnehav, Kortpass, Högpress** (faktiskt bollinnehav 57,1 %). 227 matcher med stil, mot marknaden totalt +0,03 per match.

| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |
|---|---|---|---|---|---|---|---|
| Backar hem | 69 | 1,14–1,32 | −0,12 | −0,15 (−1,1) | −3 pe | −2 pe | −0,40 / +0,05  |
| Balanserat | 112 | 1,31–1,31 | +0,04 | +0,01 (+0,1) | +9 pe | −1 pe | −0,00 / +0,02  |
| Bollinnehav | 46 | 1,39–1,20 | +0,23 | +0,20 (+1,1) | −8 pe | +2 pe | +0,13 / +0,27 ✔ |
| Kortpass | 45 | 1,56–1,36 | +0,07 | +0,04 (+0,2) | −9 pe | +10 pe | +0,79 / −0,08  |
| Blandat | 99 | 1,16–1,33 | −0,03 | −0,06 (−0,5) | +8 pe | −6 pe | −0,21 / +0,11  |
| Direktspel | 83 | 1,27–1,20 | +0,07 | +0,04 (+0,3) | +1 pe | +0 pe | −0,06 / +0,24  |
| Lågpress | 62 | 1,58–1,29 | +0,07 | +0,04 (+0,3) | −9 pe | +13 pe | +0,19 / +0,01 ✔ |
| Mellanpress | 99 | 1,10–1,29 | −0,06 | −0,09 (−0,8) | +6 pe | −8 pe | −0,17 / +0,03  |
| Högpress | 66 | 1,26–1,29 | +0,12 | +0,09 (+0,7) | +6 pe | −2 pe | −0,03 / +0,30  |

- Svårast mot **Backar hem** (−0,15 p/match rel. eget snitt, z −1,1, 69 m) – inte stabilt, troligen slump
- Bäst mot **Bollinnehav** (+0,20 p/match rel. eget snitt, z +1,1, 46 m) – åt samma håll i båda halvorna men svagt
