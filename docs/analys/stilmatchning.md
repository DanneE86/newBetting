# Stilmatchning – sammanfattning

Genererad 2026-10-04 av `scripts/analyze-style-matchups.mjs` (stil: `scripts/fetch-team-style.mjs`, FotMob). 50983 matcher i 23 ligor med stängningsodds och spelstil för båda lagen. Per liga och lag: [stil/](stil/).

## Metod

- Spelstil per lag och säsong från FotMobs lagstatistik: snittbollinnehav, andel långbollar av passningar, bollvinster på offensiv tredjedel, fasta situationer (mål och xG för och emot).
- Svaga lag har nästan alltid mindre boll. Därför justeras varje mått för lagets styrka (marknadens väntade poäng per match) – "Backar hem" betyder att laget har mindre boll än dess styrka motiverar. Tredjedelar: z < −0,5 / mellan / z > 0,5 inom ligan.
- Allt mäts mot stängningsoddsen. Att ett lag vinner mot defensiva lag är inte intressant om oddsen redan väntade sig det; det intressanta är om resultaten avviker från oddsen.
- Varje lag klassas efter sin stil **föregående säsong** (i någon liga i samma land). Samma säsongs stil går inte att använda: lag som slår oddsen leder ofta och backar då hem, så resultatet läcker in i stilen. Stil är stabil mellan säsonger (bollinnehav r ≈ 0,65–0,85), men nyuppflyttade lag från lägre serier och lag utan förra säsongen faller bort.

## Backar hem mot backar hem (alla ligor)

| Stilaxel | Matchning | M | Hemmalag mot marknaden | Kryss mot odds | Över 2,5 mot marknaden |
|---|---|---|---|---|---|
| Bollinnehav (ojusterat) | Lite boll mot Lite boll | 4370 | +0,00 (z +0,1) | −0 pe | −1 pe |
| Bollinnehav (ojusterat) | Mycket boll mot Mycket boll | 4708 | −0,01 (z −0,7) | −0 pe | +2 pe |
| Bollinnehav (justerat för styrka) | Backar hem mot Backar hem | 4579 | +0,01 (z +0,8) | −0 pe | +0 pe |
| Bollinnehav (justerat för styrka) | Bollinnehav mot Bollinnehav | 3659 | −0,02 (z −1,1) | +1 pe | +1 pe |
| Långbollar (justerat för styrka) | Kortpass mot Kortpass | 4722 | +0,02 (z +1,1) | +0 pe | +2 pe |
| Långbollar (justerat för styrka) | Direktspel mot Direktspel | 7635 | −0,00 (z −0,0) | +0 pe | −1 pe |
| Bollvinster högt upp (justerat för styrka) | Lågpress mot Lågpress | 6193 | +0,02 (z +1,0) | +0 pe | +1 pe |
| Bollvinster högt upp (justerat för styrka) | Högpress mot Högpress | 6836 | +0,01 (z +0,7) | +1 pe | −0 pe |

## Alla ligor: hemmalagets stil mot bortalagets

### Bollinnehav (justerat för styrka)

| Hemma \ Borta | Backar hem | Balanserat | Bollinnehav |
|---|---|---|---|
| **Backar hem** | 4579 m · hemma +0,01 · kryss −0 pe · ö2,5 +0 pe | 6382 m · hemma −0,00 · kryss +0 pe · ö2,5 −1 pe | 4658 m · hemma +0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Balanserat** | 6400 m · hemma −0,02 · kryss +0 pe · ö2,5 −1 pe | 8692 m · hemma +0,01 · kryss +0 pe · ö2,5 +1 pe | 5969 m · hemma −0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Bollinnehav** | 4666 m · hemma +0,05 · kryss −0 pe · ö2,5 +1 pe | 5978 m · hemma −0,00 · kryss −1 pe · ö2,5 +1 pe | 3659 m · hemma −0,02 · kryss +1 pe · ö2,5 +1 pe |

### Långbollar (justerat för styrka)

| Hemma \ Borta | Kortpass | Blandat | Direktspel |
|---|---|---|---|
| **Kortpass** | 4722 m · hemma +0,02 · kryss +0 pe · ö2,5 +2 pe | 5075 m · hemma +0,00 · kryss −1 pe · ö2,5 +3 pe | 2454 m · hemma +0,05 · kryss −2 pe · ö2,5 +0 pe |
| **Blandat** | 5075 m · hemma −0,03 · kryss +1 pe · ö2,5 +1 pe | 9600 m · hemma −0,01 · kryss +1 pe · ö2,5 +1 pe | 6981 m · hemma +0,04 · kryss −1 pe · ö2,5 +1 pe |
| **Direktspel** | 2437 m · hemma −0,00 · kryss +1 pe · ö2,5 −2 pe | 7004 m · hemma −0,01 · kryss +0 pe · ö2,5 −0 pe | 7635 m · hemma −0,00 · kryss +0 pe · ö2,5 −1 pe |

### Bollvinster högt upp (justerat för styrka)

| Hemma \ Borta | Lågpress | Mellanpress | Högpress |
|---|---|---|---|
| **Lågpress** | 6193 m · hemma +0,02 · kryss +0 pe · ö2,5 +1 pe | 5403 m · hemma +0,03 · kryss −1 pe · ö2,5 +1 pe | 2748 m · hemma +0,02 · kryss −1 pe · ö2,5 +2 pe |
| **Mellanpress** | 5420 m · hemma +0,01 · kryss +1 pe · ö2,5 +1 pe | 8679 m · hemma −0,00 · kryss +1 pe · ö2,5 −0 pe | 6462 m · hemma +0,00 · kryss −0 pe · ö2,5 +1 pe |
| **Högpress** | 2742 m · hemma −0,03 · kryss −0 pe · ö2,5 −1 pe | 6500 m · hemma −0,02 · kryss −1 pe · ö2,5 +1 pe | 6836 m · hemma +0,01 · kryss +1 pe · ö2,5 −0 pe |

### Fasta situationer anfall (justerat för styrka)

| Hemma \ Borta | Svag på fasta | Medel på fasta | Farlig på fasta |
|---|---|---|---|
| **Svag på fasta** | 6624 m · hemma +0,01 · kryss −1 pe · ö2,5 +1 pe | 6700 m · hemma +0,01 · kryss +0 pe · ö2,5 +0 pe | 3742 m · hemma +0,02 · kryss −1 pe · ö2,5 +0 pe |
| **Medel på fasta** | 6688 m · hemma +0,00 · kryss +0 pe · ö2,5 +1 pe | 9223 m · hemma −0,00 · kryss +1 pe · ö2,5 +0 pe | 5212 m · hemma −0,02 · kryss +0 pe · ö2,5 +1 pe |
| **Farlig på fasta** | 3742 m · hemma −0,01 · kryss +1 pe · ö2,5 +0 pe | 5195 m · hemma +0,01 · kryss −1 pe · ö2,5 +1 pe | 3365 m · hemma +0,03 · kryss −1 pe · ö2,5 +0 pe |

### Fasta situationer försvar (justerat för styrka)

| Hemma \ Borta | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Stark mot fasta** | 6038 m · hemma −0,02 · kryss −0 pe · ö2,5 +1 pe | 7263 m · hemma −0,00 · kryss −0 pe · ö2,5 +1 pe | 3426 m · hemma +0,01 · kryss −0 pe · ö2,5 −1 pe |
| **Medel mot fasta** | 7283 m · hemma +0,01 · kryss +0 pe · ö2,5 +0 pe | 9999 m · hemma +0,01 · kryss −0 pe · ö2,5 +1 pe | 4912 m · hemma +0,04 · kryss +0 pe · ö2,5 −0 pe |
| **Svag mot fasta** | 3416 m · hemma +0,00 · kryss +0 pe · ö2,5 +1 pe | 4918 m · hemma −0,02 · kryss +1 pe · ö2,5 +1 pe | 3199 m · hemma +0,02 · kryss −1 pe · ö2,5 +1 pe |

### Bollinnehav (ojusterat)

| Hemma \ Borta | Lite boll | Mellan | Mycket boll |
|---|---|---|---|
| **Lite boll** | 4370 m · hemma +0,00 · kryss −0 pe · ö2,5 −1 pe | 6102 m · hemma −0,02 · kryss +1 pe · ö2,5 −0 pe | 4850 m · hemma −0,00 · kryss +0 pe · ö2,5 +0 pe |
| **Mellan** | 6127 m · hemma +0,01 · kryss +1 pe · ö2,5 +0 pe | 7690 m · hemma +0,01 · kryss −0 pe · ö2,5 +1 pe | 6125 m · hemma −0,01 · kryss −0 pe · ö2,5 +1 pe |
| **Mycket boll** | 4880 m · hemma +0,05 · kryss −1 pe · ö2,5 −0 pe | 6131 m · hemma +0,02 · kryss −1 pe · ö2,5 +1 pe | 4708 m · hemma −0,01 · kryss −0 pe · ö2,5 +2 pe |

## Fasta situationer: lagets anfall mot motståndarens försvar (alla ligor)

Fasta = snitt av mål och xG från fasta situationer per match förra säsongen (FotMob; bara mål där xG saknas), justerat för lagets styrka. Från det anfallande lagets perspektiv, så varje match räknas en gång per lag. Mot marknaden nära noll = oddsen tar redan hänsyn till fasta situationer.

| Laget \ Motståndaren | Stark mot fasta | Medel mot fasta | Svag mot fasta |
|---|---|---|---|
| **Svag på fasta** | 12987 m · mot marknaden +0,00 (z +0,1) · mål 1,38 · ö2,5 +1 pe | 14242 m · mot marknaden −0,01 (z −0,7) · mål 1,34 · ö2,5 +0 pe | 6891 m · mot marknaden +0,04 (z +2,8) · mål 1,39 · ö2,5 −0 pe |
| **Medel på fasta** | 13443 m · mot marknaden +0,00 (z +0,2) · mål 1,36 · ö2,5 −0 pe | 19339 m · mot marknaden −0,01 (z −1,7) · mål 1,32 · ö2,5 +1 pe | 9443 m · mot marknaden −0,00 (z −0,1) · mål 1,36 · ö2,5 +0 pe |
| **Farlig på fasta** | 7034 m · mot marknaden +0,01 (z +0,5) · mål 1,37 · ö2,5 +1 pe | 10793 m · mot marknaden +0,01 (z +0,6) · mål 1,33 · ö2,5 +0 pe | 6736 m · mot marknaden −0,00 (z −0,3) · mål 1,35 · ö2,5 +1 pe |

## Håller lagmönstren? (stabilitetstest)

Varje lags matcher delas i en tidig och en sen halva. För varje lag och motståndartyp med minst 8 matcher i båda halvorna jämförs lagets resultat mot typen (relativt eget snitt, mot marknaden). Om lagspecifika mönster är verkliga ska den tidiga halvan förutsäga den sena: korrelation över 0 och mer än 50 % samma tecken.

| Axel | Par | Korrelation tidig→sen | Samma tecken | Starka mönster (|z| ≥ 2 tidigt) | – av dem samma tecken sen | – snitt sen halva i mönstrets riktning |
|---|---|---|---|---|---|---|
| Bollinnehav (justerat för styrka) | 1410 | −0,00 (±0,05) | 48 % | 10 | 60 % | +0,04 p/match |
| Långbollar (justerat för styrka) | 1251 | +0,02 (±0,06) | 52 % | 16 | 56 % | +0,04 p/match |
| Bollvinster högt upp (justerat för styrka) | 1310 | +0,01 (±0,06) | 49 % | 8 | 38 % | −0,00 p/match |
| Fasta situationer anfall (justerat för styrka) | 1336 | −0,05 (±0,05) | 50 % | 13 | 23 % | −0,02 p/match |
| Fasta situationer försvar (justerat för styrka) | 1350 | +0,04 (±0,05) | 50 % | 11 | 55 % | +0,06 p/match |

## Lag med stabila mönster (⚑)

Lag där sämsta/bästa motståndartyp avviker med |z| ≥ 2 från lagets eget snitt mot marknaden och åt samma håll i båda halvorna. Läs tillsammans med stabilitetstestet ovan: med ~1 500 test väntas ett antal sådana av ren slump.

| Liga | Lag | Motståndartyp | Rel. eget snitt | z | M |
|---|---|---|---|---|---|
| JP1 | [Shimizu S-Pulse](stil/JP1.md#shimizu-s-pulse) | Svårt mot Kortpass | −0,48 | −4,9 | 23 |
| GR | [Olympiakos](stil/GR.md#olympiakos) | Bra mot Svag mot fasta | +0,64 | +3,8 | 22 |
| MLS | [Houston Dynamo](stil/MLS.md#houston-dynamo) | Svårt mot Stark mot fasta | −0,36 | −3,5 | 99 |
| DK | [Randers FC](stil/DK.md#randers-fc) | Bra mot Stark mot fasta | +0,51 | +3,3 | 63 |
| GR | [Levadeiakos](stil/GR.md#levadeiakos) | Svårt mot Medel mot fasta | −0,49 | −3,3 | 18 |
| DK | [Randers FC](stil/DK.md#randers-fc) | Svårt mot Medel mot fasta | −0,33 | −3,2 | 106 |
| EL2 | [Swindon](stil/EL2.md#swindon) | Svårt mot Kortpass | −0,48 | −3,2 | 52 |
| DK | [Aarhus](stil/DK.md#aarhus) | Bra mot Lågpress | +0,41 | +3,1 | 80 |
| MX | [Monterrey](stil/MX.md#monterrey) | Bra mot Farlig på fasta | +0,42 | +3,1 | 67 |
| AS | [Halmstad](stil/AS.md#halmstad) | Svårt mot Farlig på fasta | −0,52 | −3,1 | 16 |
| LL2 | [Oviedo](stil/LL2.md#oviedo) | Svårt mot Direktspel | −0,34 | −2,9 | 80 |
| BL | [Freiburg](stil/BL.md#freiburg) | Svårt mot Svag mot fasta | −0,48 | −2,9 | 44 |
| L1 | [Le Havre](stil/L1.md#le-havre) | Svårt mot Högpress | −0,44 | −2,9 | 21 |
| PT | [Arouca](stil/PT.md#arouca) | Svårt mot Svag på fasta | −0,42 | −2,9 | 44 |
| SB | [Sampdoria](stil/SB.md#sampdoria) | Svårt mot Kortpass | −0,37 | −2,7 | 56 |
| JP1 | [Gamba Osaka](stil/JP1.md#gamba-osaka) | Svårt mot Direktspel | −0,42 | −2,7 | 56 |
| PT | [Estrela](stil/PT.md#estrela) | Svårt mot Svag mot fasta | −0,50 | −2,7 | 15 |
| AR | [Gimnasia L.P.](stil/AR.md#gimnasia-lp) | Bra mot Bollinnehav | +0,52 | +2,7 | 41 |
| EL2 | [Shrewsbury](stil/EL2.md#shrewsbury) | Svårt mot Kortpass | −0,32 | −2,6 | 74 |
| ED | [Feyenoord](stil/ED.md#feyenoord) | Bra mot Backar hem | +0,30 | +2,6 | 68 |
| DK | [Silkeborg](stil/DK.md#silkeborg) | Bra mot Kortpass | +0,50 | +2,6 | 38 |
| AR | [San Lorenzo](stil/AR.md#san-lorenzo) | Svårt mot Kortpass | −0,38 | −2,5 | 48 |
| NO | [Sarpsborg 08](stil/NO.md#sarpsborg-08) | Bra mot Kortpass | +0,39 | +2,5 | 73 |
| JP1 | [Cerezo Osaka](stil/JP1.md#cerezo-osaka) | Svårt mot Farlig på fasta | −0,52 | −2,5 | 26 |
| PL | [Tottenham](stil/PL.md#tottenham) | Svårt mot Medel mot fasta | −0,26 | −2,5 | 134 |
| DK | [Silkeborg](stil/DK.md#silkeborg) | Svårt mot Blandat | −0,38 | −2,5 | 51 |
| BL2 | [Hertha](stil/BL2.md#hertha) | Svårt mot Balanserat | −0,26 | −2,5 | 110 |
| MX | [Atl. San Luis](stil/MX.md#atl-san-luis) | Bra mot Kortpass | +0,42 | +2,5 | 56 |
| JP1 | [FC Tokyo](stil/JP1.md#fc-tokyo) | Bra mot Farlig på fasta | +0,56 | +2,5 | 26 |
| CH | [Watford](stil/CH.md#watford) | Svårt mot Blandat | −0,24 | −2,4 | 129 |
| ED | [PSV Eindhoven](stil/ED.md#psv-eindhoven) | Bra mot Högpress | +0,24 | +2,4 | 71 |
| AR | [Aldosivi](stil/AR.md#aldosivi) | Svårt mot Balanserat | −0,36 | −2,4 | 32 |
| PL | [Chelsea](stil/PL.md#chelsea) | Bra mot Bollinnehav | +0,32 | +2,4 | 80 |
| PT | [Gil Vicente](stil/PT.md#gil-vicente) | Svårt mot Stark mot fasta | −0,32 | −2,4 | 61 |
| PL | [Crystal Palace](stil/PL.md#crystal-palace) | Bra mot Bollinnehav | +0,29 | +2,4 | 87 |
| CH | [Portsmouth](stil/CH.md#portsmouth) | Svårt mot Lågpress | −0,30 | −2,4 | 71 |
| CH | [Stoke](stil/CH.md#stoke) | Svårt mot Direktspel | −0,25 | −2,4 | 114 |
| GR | [PAOK](stil/GR.md#paok) | Bra mot Direktspel | +0,40 | +2,4 | 26 |
| JP1 | [Verdy](stil/JP1.md#verdy) | Svårt mot Medel mot fasta | −0,44 | −2,4 | 20 |
| LL | [Osasuna](stil/LL.md#osasuna) | Svårt mot Kortpass | −0,32 | −2,4 | 68 |
| BR | [Bahia](stil/BR.md#bahia) | Svårt mot Svag på fasta | −0,34 | −2,4 | 56 |
| MX | [Monterrey](stil/MX.md#monterrey) | Svårt mot Svag på fasta | −0,28 | −2,3 | 95 |
| EL2 | [Northampton](stil/EL2.md#northampton) | Bra mot Stark mot fasta | +0,29 | +2,3 | 92 |
| PT | [Rio Ave](stil/PT.md#rio-ave) | Bra mot Stark mot fasta | +0,37 | +2,3 | 44 |
| EK | [GKS Katowice](stil/EK.md#gks-katowice) | Bra mot Balanserat | +0,65 | +2,3 | 16 |
| EL2 | [Cheltenham](stil/EL2.md#cheltenham) | Svårt mot Kortpass | −0,32 | −2,3 | 64 |
| LL | [Sevilla](stil/LL.md#sevilla) | Bra mot Medel mot fasta | +0,26 | +2,3 | 111 |
| EL2 | [Swindon](stil/EL2.md#swindon) | Bra mot Blandat | +0,25 | +2,3 | 129 |
| MLS | [Vancouver Whitecaps](stil/MLS.md#vancouver-whitecaps) | Bra mot Stark mot fasta | +0,31 | +2,2 | 88 |
| AR | [Newells Old Boys](stil/AR.md#newells-old-boys) | Bra mot Backar hem | +0,41 | +2,2 | 51 |
| JP1 | [Avispa Fukuoka](stil/JP1.md#avispa-fukuoka) | Bra mot Svag på fasta | +0,42 | +2,2 | 42 |
| MLS | [Houston Dynamo](stil/MLS.md#houston-dynamo) | Bra mot Medel mot fasta | +0,24 | +2,2 | 131 |
| DK | [Nordsjaelland](stil/DK.md#nordsjaelland) | Svårt mot Bollinnehav | −0,35 | −2,2 | 50 |
| CH | [Wrexham](stil/CH.md#wrexham) | Svårt mot Bollinnehav | −0,41 | −2,2 | 33 |
| PL | [Nott'm Forest](stil/PL.md#nottm-forest) | Bra mot Svag mot fasta | +0,32 | +2,2 | 73 |
| SA | [Milan](stil/SA.md#milan) | Svårt mot Kortpass | −0,33 | −2,2 | 67 |
| BL | [RB Leipzig](stil/BL.md#rb-leipzig) | Svårt mot Svag på fasta | −0,28 | −2,2 | 80 |
| AR | [Racing Club](stil/AR.md#racing-club) | Bra mot Svag mot fasta | +0,42 | +2,2 | 38 |
| ED | [Twente](stil/ED.md#twente) | Svårt mot Mellanpress | −0,27 | −2,1 | 90 |
| EK | [Zaglebie](stil/EK.md#zaglebie) | Svårt mot Högpress | −0,45 | −2,1 | 28 |
| AS | [AIK](stil/AS.md#aik) | Svårt mot Blandat | −0,29 | −2,1 | 88 |
| JP1 | [Kashima Antlers](stil/JP1.md#kashima-antlers) | Svårt mot Medel mot fasta | −0,31 | −2,1 | 69 |
| L1 | [Paris SG](stil/L1.md#paris-sg) | Bra mot Farlig på fasta | +0,24 | +2,1 | 63 |
| CH | [Swansea](stil/CH.md#swansea) | Bra mot Direktspel | +0,24 | +2,1 | 121 |
| BL2 | [Bielefeld](stil/BL2.md#bielefeld) | Svårt mot Backar hem | −0,33 | −2,1 | 40 |
| SB | [Juve Stabia](stil/SB.md#juve-stabia) | Svårt mot Lågpress | −0,36 | −2,1 | 26 |
| LL | [La Coruna](stil/LL.md#la-coruna) | Svårt mot Medel på fasta | −0,40 | −2,1 | 30 |
| CH | [Wrexham](stil/CH.md#wrexham) | Bra mot Blandat | +0,44 | +2,1 | 30 |
| BL2 | [Bielefeld](stil/BL2.md#bielefeld) | Bra mot Bollinnehav | +0,35 | +2,1 | 55 |
| EL1 | [Wigan](stil/EL1.md#wigan) | Bra mot Farlig på fasta | +0,31 | +2,1 | 67 |
| LL | [Ath Bilbao](stil/LL.md#ath-bilbao) | Svårt mot Lågpress | −0,27 | −2,1 | 85 |
| PL | [Arsenal](stil/PL.md#arsenal) | Bra mot Bollinnehav | +0,23 | +2,1 | 87 |
| MLS | [New York City](stil/MLS.md#new-york-city) | Bra mot Balanserat | +0,21 | +2,1 | 138 |
| NO | [HamKam](stil/NO.md#hamkam) | Bra mot Blandat | +0,51 | +2,1 | 24 |
| SA | [Inter](stil/SA.md#inter) | Bra mot Högpress | +0,21 | +2,1 | 92 |
| BL | [Dortmund](stil/BL.md#dortmund) | Bra mot Stark mot fasta | +0,22 | +2,0 | 102 |
| EL2 | [Salford](stil/EL2.md#salford) | Bra mot Svag på fasta | +0,29 | +2,0 | 88 |
| LL | [Celta](stil/LL.md#celta) | Svårt mot Högpress | −0,23 | −2,0 | 90 |
| PL | [Brentford](stil/PL.md#brentford) | Bra mot Stark mot fasta | +0,24 | +2,0 | 102 |
| CH | [Watford](stil/CH.md#watford) | Bra mot Direktspel | +0,23 | +2,0 | 110 |
| EL2 | [Northampton](stil/EL2.md#northampton) | Svårt mot Farlig på fasta | −0,34 | −2,0 | 45 |
| LL | [Ath Bilbao](stil/LL.md#ath-bilbao) | Bra mot Högpress | +0,26 | +2,0 | 80 |
| AS | [Halmstad](stil/AS.md#halmstad) | Bra mot Svag på fasta | +0,50 | +2,0 | 24 |
| EK | [Cracovia](stil/EK.md#cracovia) | Svårt mot Svag mot fasta | −0,50 | −2,0 | 18 |
