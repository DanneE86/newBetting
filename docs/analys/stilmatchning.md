# Stilmatchning – sammanfattning

Genererad 2026-10-01 av `scripts/analyze-style-matchups.mjs` (stil: `scripts/fetch-team-style.mjs`, FotMob). 50888 matcher i 23 ligor med stängningsodds och spelstil för båda lagen. Per liga och lag: [stil/](stil/).

## Metod

- Spelstil per lag och säsong från FotMobs lagstatistik: snittbollinnehav, andel långbollar av passningar, bollvinster på offensiv tredjedel.
- Svaga lag har nästan alltid mindre boll. Därför justeras varje mått för lagets styrka (marknadens väntade poäng per match) – "Backar hem" betyder att laget har mindre boll än dess styrka motiverar. Tredjedelar: z < −0,5 / mellan / z > 0,5 inom ligan.
- Allt mäts mot stängningsoddsen. Att ett lag vinner mot defensiva lag är inte intressant om oddsen redan väntade sig det; det intressanta är om resultaten avviker från oddsen.
- Varje lag klassas efter sin stil **föregående säsong** (i någon liga i samma land). Samma säsongs stil går inte att använda: lag som slår oddsen leder ofta och backar då hem, så resultatet läcker in i stilen. Stil är stabil mellan säsonger (bollinnehav r ≈ 0,65–0,85), men nyuppflyttade lag från lägre serier och lag utan förra säsongen faller bort.

## Backar hem mot backar hem (alla ligor)

| Stilaxel | Matchning | M | Hemmalag mot marknaden | Kryss mot odds | Över 2,5 mot marknaden |
|---|---|---|---|---|---|
| Bollinnehav (ojusterat) | Lite boll mot Lite boll | 4355 | +0,00 (z +0,0) | −0 pe | −1 pe |
| Bollinnehav (ojusterat) | Mycket boll mot Mycket boll | 4706 | −0,01 (z −0,7) | −0 pe | +2 pe |
| Bollinnehav (justerat för styrka) | Backar hem mot Backar hem | 4558 | +0,01 (z +0,8) | −0 pe | +0 pe |
| Bollinnehav (justerat för styrka) | Bollinnehav mot Bollinnehav | 3658 | −0,02 (z −1,2) | +1 pe | +1 pe |
| Långbollar (justerat för styrka) | Kortpass mot Kortpass | 4707 | +0,02 (z +1,1) | +0 pe | +2 pe |
| Långbollar (justerat för styrka) | Direktspel mot Direktspel | 7626 | −0,00 (z −0,0) | +0 pe | −1 pe |
| Bollvinster högt upp (justerat för styrka) | Lågpress mot Lågpress | 6197 | +0,02 (z +1,1) | +0 pe | +1 pe |
| Bollvinster högt upp (justerat för styrka) | Högpress mot Högpress | 6801 | +0,01 (z +0,7) | +1 pe | −0 pe |

## Alla ligor: hemmalagets stil mot bortalagets

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 4558 m · hemma +0,01 · kryss −0 pe · ö2,5 +0 pe | 6363 m · hemma −0,00 · kryss +0 pe · ö2,5 −1 pe | 4646 m · hemma +0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Balanserat** | 6384 m · hemma −0,02 · kryss +0 pe · ö2,5 −1 pe | 8684 m · hemma +0,01 · kryss +0 pe · ö2,5 +1 pe | 5967 m · hemma −0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Bollinnehav** | 4653 m · hemma +0,05 · kryss −0 pe · ö2,5 +1 pe | 5975 m · hemma −0,00 · kryss −1 pe · ö2,5 +1 pe | 3658 m · hemma −0,02 · kryss +1 pe · ö2,5 +1 pe |

### Långbollar (justerat för styrka)

| Hemma \ Borta | Kortpass | Blandat | Direktspel |
|---|---|---|---|
| **Kortpass** | 4707 m · hemma +0,02 · kryss +0 pe · ö2,5 +2 pe | 5066 m · hemma +0,00 · kryss −1 pe · ö2,5 +3 pe | 2452 m · hemma +0,05 · kryss −2 pe · ö2,5 +0 pe |
| **Blandat** | 5066 m · hemma −0,03 · kryss +1 pe · ö2,5 +1 pe | 9603 m · hemma −0,01 · kryss +1 pe · ö2,5 +1 pe | 6954 m · hemma +0,04 · kryss −1 pe · ö2,5 +1 pe |
| **Direktspel** | 2436 m · hemma −0,00 · kryss +1 pe · ö2,5 −2 pe | 6978 m · hemma −0,01 · kryss +0 pe · ö2,5 −0 pe | 7626 m · hemma −0,00 · kryss +0 pe · ö2,5 −1 pe |

### Bollvinster högt upp (justerat för styrka)

| Hemma \ Borta | Lågpress | Mellanpress | Högpress |
|---|---|---|---|
| **Lågpress** | 6197 m · hemma +0,02 · kryss +0 pe · ö2,5 +1 pe | 5396 m · hemma +0,03 · kryss −1 pe · ö2,5 +1 pe | 2759 m · hemma +0,02 · kryss −1 pe · ö2,5 +2 pe |
| **Mellanpress** | 5412 m · hemma +0,01 · kryss +1 pe · ö2,5 +1 pe | 8635 m · hemma −0,00 · kryss +1 pe · ö2,5 −0 pe | 6448 m · hemma +0,00 · kryss −0 pe · ö2,5 +1 pe |
| **Högpress** | 2756 m · hemma −0,03 · kryss −0 pe · ö2,5 −1 pe | 6484 m · hemma −0,02 · kryss −1 pe · ö2,5 +1 pe | 6801 m · hemma +0,01 · kryss +1 pe · ö2,5 −0 pe |

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 4355 m · hemma +0,00 · kryss −0 pe · ö2,5 −1 pe | 6084 m · hemma −0,02 · kryss +1 pe · ö2,5 −0 pe | 4843 m · hemma −0,00 · kryss +0 pe · ö2,5 +0 pe |
| **Mellan** | 6108 m · hemma +0,01 · kryss +1 pe · ö2,5 +0 pe | 7677 m · hemma +0,01 · kryss −0 pe · ö2,5 +1 pe | 6117 m · hemma −0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Mycket boll** | 4872 m · hemma +0,05 · kryss −1 pe · ö2,5 −0 pe | 6126 m · hemma +0,02 · kryss −1 pe · ö2,5 +1 pe | 4706 m · hemma −0,01 · kryss −0 pe · ö2,5 +2 pe |

## Håller lagmönstren? (stabilitetstest)

Varje lags matcher delas i en tidig och en sen halva. För varje lag och motståndartyp med minst 8 matcher i båda halvorna jämförs lagets resultat mot typen (relativt eget snitt, mot marknaden). Om lagspecifika mönster är verkliga ska den tidiga halvan förutsäga den sena: korrelation över 0 och mer än 50 % samma tecken.

| Axel | Par | Korrelation tidig→sen | Samma tecken | Starka mönster (|z| ≥ 2 tidigt) | – av dem samma tecken sen | – snitt sen halva i mönstrets riktning |
|---|---|---|---|---|---|---|
| Bollinnehav (justerat för styrka) | 1406 | −0,00 (±0,05) | 48 % | 11 | 64 % | +0,05 p/match |
| Långbollar (justerat för styrka) | 1249 | +0,02 (±0,06) | 52 % | 16 | 56 % | +0,04 p/match |
| Bollvinster högt upp (justerat för styrka) | 1308 | +0,00 (±0,06) | 49 % | 9 | 44 % | +0,00 p/match |

## Lag med stabila mönster (⚑)

Lag där sämsta/bästa motståndartyp avviker med |z| ≥ 2 från lagets eget snitt mot marknaden och åt samma håll i båda halvorna. Läs tillsammans med stabilitetstestet ovan: med ~1 500 test väntas ett antal sådana av ren slump.

| Liga | Lag | Motståndartyp | Rel. eget snitt | z | M |
|---|---|---|---|---|---|
| JP1 | [Shimizu S-Pulse](stil/JP1.md#shimizu-s-pulse) | Svårt mot Kortpass | −0,48 | −4,9 | 23 |
| EL2 | [Swindon](stil/EL2.md#swindon) | Svårt mot Kortpass | −0,48 | −3,2 | 52 |
| DK | [Aarhus](stil/DK.md#aarhus) | Bra mot Lågpress | +0,41 | +3,1 | 80 |
| LL2 | [Oviedo](stil/LL2.md#oviedo) | Svårt mot Direktspel | −0,34 | −2,9 | 80 |
| L1 | [Le Havre](stil/L1.md#le-havre) | Svårt mot Högpress | −0,44 | −2,9 | 21 |
| SB | [Sampdoria](stil/SB.md#sampdoria) | Svårt mot Kortpass | −0,37 | −2,7 | 56 |
| JP1 | [Gamba Osaka](stil/JP1.md#gamba-osaka) | Svårt mot Direktspel | −0,42 | −2,7 | 56 |
| AR | [Gimnasia L.P.](stil/AR.md#gimnasia-lp) | Bra mot Bollinnehav | +0,51 | +2,6 | 41 |
| AR | [San Lorenzo](stil/AR.md#san-lorenzo) | Svårt mot Kortpass | −0,38 | −2,6 | 48 |
| EL2 | [Shrewsbury](stil/EL2.md#shrewsbury) | Svårt mot Kortpass | −0,32 | −2,6 | 74 |
| ED | [Feyenoord](stil/ED.md#feyenoord) | Bra mot Backar hem | +0,30 | +2,6 | 68 |
| DK | [Silkeborg](stil/DK.md#silkeborg) | Bra mot Kortpass | +0,50 | +2,6 | 38 |
| NO | [Sarpsborg 08](stil/NO.md#sarpsborg-08) | Bra mot Kortpass | +0,39 | +2,5 | 73 |
| DK | [Silkeborg](stil/DK.md#silkeborg) | Svårt mot Blandat | −0,38 | −2,5 | 51 |
| BL2 | [Hertha](stil/BL2.md#hertha) | Svårt mot Balanserat | −0,26 | −2,5 | 110 |
| CH | [Watford](stil/CH.md#watford) | Svårt mot Blandat | −0,24 | −2,4 | 129 |
| ED | [PSV Eindhoven](stil/ED.md#psv-eindhoven) | Bra mot Högpress | +0,24 | +2,4 | 71 |
| PL | [Chelsea](stil/PL.md#chelsea) | Bra mot Bollinnehav | +0,32 | +2,4 | 80 |
| PL | [Crystal Palace](stil/PL.md#crystal-palace) | Bra mot Bollinnehav | +0,29 | +2,4 | 87 |
| CH | [Portsmouth](stil/CH.md#portsmouth) | Svårt mot Lågpress | −0,30 | −2,4 | 71 |
| CH | [Stoke](stil/CH.md#stoke) | Svårt mot Direktspel | −0,25 | −2,4 | 114 |
| GR | [PAOK](stil/GR.md#paok) | Bra mot Direktspel | +0,40 | +2,4 | 26 |
| LL | [Osasuna](stil/LL.md#osasuna) | Svårt mot Kortpass | −0,32 | −2,4 | 68 |
| AR | [Aldosivi](stil/AR.md#aldosivi) | Svårt mot Balanserat | −0,35 | −2,4 | 32 |
| MX | [Atl. San Luis](stil/MX.md#atl-san-luis) | Bra mot Kortpass | +0,40 | +2,3 | 55 |
| AR | [Newells Old Boys](stil/AR.md#newells-old-boys) | Bra mot Backar hem | +0,45 | +2,3 | 49 |
| EK | [GKS Katowice](stil/EK.md#gks-katowice) | Bra mot Balanserat | +0,65 | +2,3 | 16 |
| EL2 | [Cheltenham](stil/EL2.md#cheltenham) | Svårt mot Kortpass | −0,32 | −2,3 | 64 |
| EL2 | [Swindon](stil/EL2.md#swindon) | Bra mot Blandat | +0,25 | +2,3 | 129 |
| DK | [Randers FC](stil/DK.md#randers-fc) | Svårt mot Högpress | −0,30 | −2,2 | 60 |
| DK | [Nordsjaelland](stil/DK.md#nordsjaelland) | Svårt mot Bollinnehav | −0,35 | −2,2 | 50 |
| CH | [Wrexham](stil/CH.md#wrexham) | Svårt mot Bollinnehav | −0,41 | −2,2 | 33 |
| SA | [Milan](stil/SA.md#milan) | Svårt mot Kortpass | −0,33 | −2,2 | 67 |
| ED | [Twente](stil/ED.md#twente) | Svårt mot Mellanpress | −0,27 | −2,1 | 90 |
| EK | [Zaglebie](stil/EK.md#zaglebie) | Svårt mot Högpress | −0,45 | −2,1 | 28 |
| AS | [AIK](stil/AS.md#aik) | Svårt mot Blandat | −0,29 | −2,1 | 88 |
| CH | [Swansea](stil/CH.md#swansea) | Bra mot Direktspel | +0,24 | +2,1 | 121 |
| BL2 | [Bielefeld](stil/BL2.md#bielefeld) | Svårt mot Backar hem | −0,33 | −2,1 | 40 |
| SB | [Juve Stabia](stil/SB.md#juve-stabia) | Svårt mot Lågpress | −0,36 | −2,1 | 26 |
| CH | [Wrexham](stil/CH.md#wrexham) | Bra mot Blandat | +0,44 | +2,1 | 30 |
| BL2 | [Bielefeld](stil/BL2.md#bielefeld) | Bra mot Bollinnehav | +0,35 | +2,1 | 55 |
| LL | [Ath Bilbao](stil/LL.md#ath-bilbao) | Svårt mot Lågpress | −0,27 | −2,1 | 85 |
| MLS | [New York City](stil/MLS.md#new-york-city) | Bra mot Balanserat | +0,21 | +2,1 | 137 |
| PL | [Arsenal](stil/PL.md#arsenal) | Bra mot Bollinnehav | +0,23 | +2,1 | 87 |
| SA | [Inter](stil/SA.md#inter) | Bra mot Högpress | +0,21 | +2,1 | 92 |
| LL | [Celta](stil/LL.md#celta) | Svårt mot Högpress | −0,23 | −2,0 | 90 |
| CH | [Watford](stil/CH.md#watford) | Bra mot Direktspel | +0,23 | +2,0 | 110 |
| LL | [Ath Bilbao](stil/LL.md#ath-bilbao) | Bra mot Högpress | +0,26 | +2,0 | 80 |
| BL | [Freiburg](stil/BL.md#freiburg) | Svårt mot Backar hem | −0,25 | −2,0 | 88 |
| BR | [Bahia](stil/BR.md#bahia) | Svårt mot Mellanpress | −0,26 | −2,0 | 73 |
| MLS | [Real Salt Lake](stil/MLS.md#real-salt-lake) | Svårt mot Kortpass | −0,31 | −2,0 | 60 |
| MX | [Club Leon](stil/MX.md#club-leon) | Svårt mot Balanserat | −0,24 | −2,0 | 94 |
