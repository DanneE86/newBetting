# Övergångar: lyckas spelaren i sin nya liga?

Uppdaterad 2026-10-04 av `scripts/lardomar-overgangar.mjs` (rådata: `scripts/fetch-player-careers-fotmob.mjs`).
13263 spelare som bytt klubb sedan januari 2024, 16492 ligabyten, varav 7208 går att utvärdera
(betyg i gamla ligan finns och nya ligans säsong har spelats klart eller nästan klart).

## Kort sagt

- **Bara 24 % av alla ligabyten blir en klar succé** (ordinarie och betyg minst i nivå med ligans median).
  44 % blir ordinarie, och av dem som får minst 10 matcher presterar 48 % minst som ligans median.
- **Det bästa enskilda måttet är "förväntat betyg i nya ligan"**: betyget i gamla ligan minus hur mycket svårare nya ligan är.
  Ligger det över nya ligans median lyckas 39 %, ligger det klart under lyckas bara 14 %.
- **Bara 14 % av försprånget följer med.** En spelare som var 0,30 bättre än medianen i gamla ligan är i snitt
  0,04 bättre än medianen i nya, efter nivåjusteringen. Resten är tur, lagets stil och roll.
- Modellen skiljer lyckade från misslyckade bättre än slumpen men långt ifrån perfekt (AUC 0,67 på byten den inte tränats på,
  0,5 = slump, 1 = perfekt). Den säger "troligare / mindre troligt", inte "säkert".

## Så läser du det här

- **Betyg** är FotMobs matchbetyg (6,0–10). **Median** är mittenbetyget bland spelare med minst 10 matcher i samma liga och säsong.
- **Nivå** är hur svår ligan är, räknat ur bytena själva: tappar spelare som går från A till B i snitt 0,2 i betyg är B 0,2 starkare.
- **Förväntat betyg mot median** = betyg i gamla ligan − nivåskillnaden − nya ligans median. Positivt = borde vara bättre än mittenspelaren.
- **Ordinarie** = minst hälften av omgångarna (matcher delat med flest matcher någon spelare gjorde i ligan den säsongen).
- Spelare som flyttat till en liga vi inte följer och inte kommit tillbaka saknas, så misslyckanden är något underskattade.

## Tumregel: förväntat betyg i nya ligan mot ligans median

| Förväntat betyg mot median | Byten | Lyckades |
|---|---|---|
| under -0,3 | 2034 | 14 % |
| -0,3 till -0,1 | 1508 | 19 % |
| -0,1 till 0,1 | 1495 | 26 % |
| 0,1 till 0,3 | 1103 | 30 % |
| över 0,3 | 1068 | 39 % |

## Vad påverkar, en sak i taget

**Ålder vid bytet**

|  | Byten | Lyckades |
|---|---|---|
| under 21 | 1085 | 15 % |
| 21–23 | 2065 | 21 % |
| 24–27 | 2379 | 26 % |
| 28–30 | 1007 | 27 % |
| 31+ | 672 | 31 % |

**Speltid i gamla ligan**

|  | Byten | Lyckades |
|---|---|---|
| under 33 % | 2831 | 20 % |
| 33–60 % | 1977 | 21 % |
| 60 %+ | 2400 | 30 % |

**Nivåskillnad (ny minus gammal)**

|  | Byten | Lyckades |
|---|---|---|
| klart svagare liga (< -0,25) | 1562 | 26 % |
| lite svagare | 1371 | 27 % |
| ungefär samma | 1161 | 26 % |
| lite starkare | 1379 | 23 % |
| klart starkare (> 0,25) | 1735 | 18 % |

**Lån eller köp**

|  | Byten | Lyckades |
|---|---|---|
| köp/fri | 4899 | 26 % |
| lån | 2309 | 19 % |

**Position**

|  | Byten | Lyckades |
|---|---|---|
| målvakt | 486 | 24 % |
| mittback | 1219 | 25 % |
| ytterback | 964 | 28 % |
| mittfält | 2041 | 27 % |
| ytter | 1217 | 21 % |
| anfallare | 1281 | 16 % |

## Modellen

Logistisk regression, tränad på 3603 byten (nya ligans säsong 2024 och 2024/2025) och testad på 3605 senare byten.
AUC träning 0,68, test 0,67. Bara förväntat betyg ger 0,63, så resten av faktorerna tillför lite.

Träffsäkerhet i testet (sa modellen X %, hur ofta lyckades de?):

| Modellens chans | Byten | Lyckades |
|---|---|---|
| 0–20 % | 1396 | 13 % |
| 20–35 % | 1572 | 25 % |
| 35–50 % | 518 | 39 % |
| 50–65 % | 111 | 46 % |
| 65–100 % | 8 | 50 % |

Vikter (standardiserade, slutmodellen på alla byten; positivt = ökar chansen):

| Faktor | Vikt |
|---|---|
| marknadsvärde (log) | 0,26 |
| förväntat betyg i nya ligan mot median | 0,24 |
| nivåskillnad | -0,19 |
| anfallare/ytter | -0,17 |
| speltid i gamla ligan | 0,16 |
| marknadsvärde saknas | -0,15 |
| lån | -0,15 |
| ålder | 0,15 |
| ålder² | -0,14 |
| två säsonger: betyg mot median | 0,09 |
| nya lagets styrka | 0,09 |
| mål+assist per match | -0,07 |
| betyg mot median i gamla ligan | -0,05 |
| gamla lagets styrka | 0,04 |
| målvakt | 0,00 |

När spelaren väl spelar (minst 10 matcher) är sambandet med betyget mot medianen i nya ligan: förväntat betyg r = 0,32,
gamla betyget r = 0,18, två säsonger r = 0,20 (0 = inget samband, 1 = perfekt).

## Andra säsongen

| Första året | Byten | Kvar i ligan år 2 | Ordinarie år 2 |
|---|---|---|---|
| lyckades | 1043 | 68 % | 51 % |
| lyckades inte | 3289 | 54 % | 31 % |

## Ligornas nivå (ur bytena, minst 15 byten)

| Liga | Nivå | Byten |
|---|---|---|
| Premier League (id 47) | 0,56 | 316 |
| LaLiga | 0,42 | 287 |
| Serie A (id 55) | 0,40 | 339 |
| Bundesliga (id 54) | 0,34 | 286 |
| Premier League (id 63) | 0,27 | 32 |
| Ligue 1 | 0,26 | 306 |
| Série A | 0,22 | 358 |
| Championship | 0,18 | 460 |
| Super Lig | 0,10 | 191 |
| Saudi Pro League | 0,09 | 73 |
| Liga Portugal | 0,08 | 252 |
| Serie B (id 86) | 0,06 | 111 |
| LaLiga2 | 0,06 | 192 |
| Liga MX | 0,06 | 187 |
| First Division A | 0,05 | 197 |
| Eredivisie | 0,03 | 261 |
| MLS | -0,01 | 302 |
| Super League 1 | -0,01 | 159 |
| J. League | -0,02 | 79 |
| 2. Bundesliga | -0,02 | 225 |
| Serie B (id 8814) | -0,02 | 201 |
| Pro League | -0,04 | 19 |
| Super League (id 69) | -0,04 | 78 |
| Liga Profesional | -0,06 | 283 |
| Premiership | -0,08 | 165 |
| Superligaen | -0,09 | 148 |
| League One | -0,10 | 413 |
| Ligue 2 | -0,12 | 93 |
| Ekstraklasa | -0,13 | 153 |
| Bundesliga (id 38) | -0,13 | 97 |
| K League 1 | -0,14 | 19 |
| HNL | -0,17 | 79 |
| Serie A (id 246) | -0,19 | 22 |
| 1. Liga | -0,20 | 21 |
| 1. Lig | -0,20 | 18 |
| Primera A | -0,20 | 120 |
| USL Championship | -0,21 | 20 |
| Liga de Primera | -0,26 | 55 |
| League Two | -0,27 | 257 |
| 3. Liga | -0,30 | 75 |
| Liga 1 | -0,31 | 19 |
| A-League | -0,31 | 25 |
| Super League (id 120) | -0,33 | 24 |
| Premier Division | -0,33 | 19 |
| Allsvenskan | -0,34 | 151 |
| Eerste Divisie | -0,36 | 105 |
| Primera B Nacional | -0,40 | 35 |
| Eliteserien | -0,41 | 112 |
| MLS Next Pro | -0,49 | 40 |
| 1. Division | -0,56 | 41 |

## Vanligaste ligabytena (minst 8)

| Från → till | Byten | Lyckades | Betyg, median förändring |
|---|---|---|---|
| MLS Next Pro → MLS | 196 | 8 % | -0,41 |
| Série A → Serie B | 175 | 27 % | 0,19 |
| Championship → League One | 152 | 26 % | 0,27 |
| League One → League Two | 151 | 24 % | 0,22 |
| MLS → MLS Next Pro | 137 | 11 % | 0,61 |
| League Two → League One | 115 | 26 % | -0,17 |
| Eerste Divisie → Eredivisie | 93 | 17 % | -0,31 |
| Serie B → Série A | 91 | 12 % | -0,17 |
| League One → Championship | 88 | 22 % | -0,21 |
| Serie A → Serie B | 87 | 25 % | 0,41 |
| Premier League → Championship | 77 | 22 % | 0,40 |
| LaLiga → LaLiga2 | 71 | 24 % | 0,42 |
| Bundesliga → 2. Bundesliga | 56 | 21 % | 0,26 |
| Eredivisie → Eerste Divisie | 55 | 11 % | 0,64 |
| LaLiga2 → LaLiga | 53 | 11 % | -0,38 |
| 3. Liga → 2. Bundesliga | 52 | 35 % | -0,17 |
| Championship → Premier League | 48 | 19 % | -0,47 |
| 2. Bundesliga → Bundesliga | 46 | 17 % | -0,41 |
| Ligue 1 → Premier League | 43 | 30 % | -0,23 |
| Premier League → Serie A | 42 | 26 % | 0,11 |
| Liga Profesional → Liga MX | 37 | 22 % | -0,31 |
| Série A → Liga Portugal | 37 | 19 % | -0,08 |
| Serie A → Premier League | 37 | 30 % | 0,00 |
| Liga Profesional → Série A | 37 | 16 % | -0,40 |
| Série A → Liga Profesional | 36 | 39 % | 0,33 |
| Bundesliga → Premier League | 36 | 42 % | -0,20 |
| Premiership → League One | 36 | 31 % | 0,15 |
| Championship → League Two | 35 | 17 % | 0,54 |
| Ligue 1 → Serie A | 34 | 32 % | -0,19 |
| LaLiga → Premier League | 34 | 35 % | -0,05 |
| Premier League → Ligue 1 | 33 | 27 % | 0,33 |
| Serie B → Serie A | 33 | 21 % | -0,35 |
| Liga MX → Liga Profesional | 32 | 9 % | 0,17 |
| Premier League → LaLiga | 32 | 59 % | 0,17 |
| Premier League → Bundesliga | 31 | 45 % | 0,32 |
| Eliteserien → Allsvenskan | 31 | 16 % | 0,08 |
| Liga de Primera → Liga Profesional | 29 | 28 % | -0,38 |
| Serie A → LaLiga | 28 | 32 % | 0,00 |
| Premier League → Série A | 28 | 21 % | 0,03 |
| Liga Profesional → Primera A | 28 | 18 % | 0,10 |

## Årets nyförvärv: prognos

Byten där nya ligans säsong är 2026 eller 2026/2027 (spelaren är kvar i klubben). Chansen är modellens; matcher/betyg hittills som facit.

| Spelare | Från | Till | Ålder | Förväntat mot median | Chans | Hittills |
|---|---|---|---|---|---|---|
| Rodri | Manchester City (Premier League) | Barcelona (LaLiga) | 30 | 0,86 | 73 % | 6 m, 7,52 |
| Azzedine Ounahi | Girona (LaLiga) | Panathinaikos (Super League 1) | 26 | 0,89 | 70 % | 4 m, 7,35 |
| João Palhinha | Tottenham Hotspur (Premier League) | Benfica (Liga Portugal) | 31 | 0,64 | 69 % | 5 m, 7,30 |
| Trevoh Chalobah | Chelsea (Premier League) | Como (Serie A) | 27 | 0,40 | 68 % | 4 m, 7,16 |
| Imrân Louza | Watford (Championship) | Panathinaikos (Super League 1) | 27 | 0,82 | 67 % | 5 m, 6,88 |
| Bernardo Silva | Manchester City (Premier League) | Real Madrid (LaLiga) | 32 | 0,50 | 65 % | 6 m, 6,84 |
| Casemiro | Manchester United (Premier League) | Inter Miami CF (MLS) | 34 | 1,06 | 65 % | 11 m, 7,07 |
| Alexander Nübel | VfB Stuttgart (Bundesliga) | Beşiktaş (Super Lig) | 29 | 0,62 | 64 % | 6 m, 6,36 |
| Aleksey Batrakov | Lokomotiv Moscow (Premier League) | Galatasaray (Super Lig) | 21 | 0,85 | 64 % | 4 m, 6,75 |
| Ibrahima Konaté | Liverpool (Premier League) | Real Madrid (LaLiga) | 27 | 0,46 | 63 % | 6 m, 6,95 |
| Alejandro Grimaldo | Bayer Leverkusen (Bundesliga) | Atlético Madrid (LaLiga) | 30 | 0,82 | 63 % | 6 m, 7,62 |
| Mauro Arambarri | Getafe (LaLiga) | River Plate (Liga Profesional) | 30 | 0,51 | 63 % | 6 m, 6,32 |
| Julian Brandt | Borussia Dortmund (Bundesliga) | Ajax (Eredivisie) | 30 | 0,62 | 63 % | 7 m, 7,58 |
| Fallou Fall | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 21 | 0,84 | 62 % | 2 m, 6,94 |
| Jakub Kamiński | 1. FC Köln (Bundesliga) | Benfica (Liga Portugal) | 24 | 0,59 | 62 % | 1 m, 6,38 |
| Iñaki Peña | Elche (LaLiga) | Panathinaikos (Super League 1) | 27 | 0,53 | 62 % | 5 m, 7,42 |
| Kings Kangwa | Hapoel Beer Sheva (Ligat ha'Al) | Panathinaikos (Super League 1) | 27 | 1,08 | 61 % | 5 m, 7,54 |
| Sergi Altimira | Real Betis (LaLiga) | Sporting CP (Liga Portugal) | 25 | 0,42 | 61 % | 7 m, 7,99 |
| Cristian Romero | Tottenham Hotspur (Premier League) | Atlético Madrid (LaLiga) | 28 | 0,41 | 61 % | 4 m, 7,35 |
| Victor Nelsson | Hellas Verona (Serie A) | Nordsjælland (Superligaen) | 27 | 0,39 | 60 % | 3 m, 7,03 |
| Morten Hjulmand | Sporting CP (Liga Portugal) | Atlético Madrid (LaLiga) | 27 | 0,52 | 60 % | 7 m, 7,23 |
| Stefan de Vrij | Inter (Serie A) | Panathinaikos (Super League 1) | 34 | 0,76 | 60 % | 5 m, 7,56 |
| Thiago Almada | Atlético Madrid (LaLiga) | River Plate (Liga Profesional) | 24 | 0,32 | 60 % | 6 m, 8,03 |
| Marc Cucurella | Chelsea (Premier League) | Real Madrid (LaLiga) | 28 | 0,31 | 60 % | 7 m, 6,79 |
| Tomas Totland | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 26 | 0,80 | 60 % | 1 m, 6,88 |
| Ayyoub Bouaddi | Lille (Ligue 1) | Manchester City (Premier League) | 18 | -0,04 | 60 % | 2 m, 6,52 |
| Nathan Aké | Manchester City (Premier League) | Fenerbahçe (Super Lig) | 31 | 0,27 | 59 % | 6 m, 6,64 |
| Lutsharel Geertruida | Sunderland (Premier League) | PSV Eindhoven (Eredivisie) | 26 | 0,37 | 59 % | 4 m, 7,65 |
| Romano Schmid | Werder Bremen (Bundesliga) | Frosinone (Serie A) | 26 | 0,42 | 59 % | 5 m, 7,07 |
| Alessandro Circati | Parma (Serie A) | Benfica (Liga Portugal) | 22 | 0,37 | 59 % | 2 m, 6,42 |
| Mohamed Salah | Liverpool (Premier League) | Trabzonspor (Super Lig) | 34 | 0,58 | 59 % | 6 m, 8,16 |
| Rasmus Kristensen | Eintracht Frankfurt (Bundesliga) | FC Midtjylland (Superligaen) | 29 | 0,63 | 58 % | 9 m, 7,41 |
| Issa Doumbia | Venezia (Serie B) | Sporting CP (Liga Portugal) | 22 | 0,53 | 58 % | 7 m, 7,27 |
| Karim Adeyemi | Borussia Dortmund (Bundesliga) | Barcelona (LaLiga) | 24 | 0,09 | 58 % | 7 m, 7,23 |
| Mason Greenwood | Marseille (Ligue 1) | Fenerbahçe (Super Lig) | 24 | 0,82 | 58 % | 6 m, 7,68 |
| Sofyan Amrabat | Real Betis (LaLiga) | Ajax (Eredivisie) | 30 | 0,46 | 58 % | 4 m, 6,96 |
| Rick van Drongelen | Samsunspor (Super Lig) | Panathinaikos (Super League 1) | 27 | 0,44 | 58 % | 5 m, 7,12 |
| Curtis Jones | Liverpool (Premier League) | Inter (Serie A) | 25 | 0,35 | 57 % | 4 m, 6,76 |
| Freddie Potts | West Ham United (Premier League) | Club Brugge (First Division A) | 22 | 0,20 | 57 % | 7 m, 7,32 |
| Luis Milla | Getafe (LaLiga) | Como (Serie A) | 31 | 0,59 | 57 % | 5 m, 6,95 |
| Luka Vušković | Hamburger SV (Bundesliga) | Brighton & Hove Albion (Premier League) | 19 | 0,37 | 57 % | 5 m, 7,22 |
| Yann Sommer | Inter (Serie A) | Club Brugge (First Division A) | 37 | 0,28 | 56 % | 7 m, 7,52 |
| Lucas Paquetá | West Ham United (Premier League) | Flamengo (Série A) | 28 | 0,46 | 56 % | 19 m, 7,34 |
| Nicolás Otamendi | Benfica (Liga Portugal) | River Plate (Liga Profesional) | 38 | 0,70 | 55 % | 10 m, 7,21 |
| Aníbal Moreno | Palmeiras (Série A) | River Plate (Liga Profesional) | 26 | 0,25 | 55 % | 24 m, 7,31 |
| Ángel Correa | Tigres (Liga MX) | River Plate (Liga Profesional) | 30 | 0,70 | 55 % | 9 m, 7,55 |
| Kaan Kairinen | Sparta Prague (1. Liga) | AEK Athens (Super League 1) | 27 | 0,31 | 55 % | 2 m, 6,31 |
| Mika Mármol | Las Palmas (LaLiga2) | Feyenoord (Eredivisie) | 25 | 0,33 | 55 % | 7 m, 7,48 |
| Lukas MacNaughton | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 30 | 0,50 | 54 % | 1 m, 6,79 |
| Brais Méndez | Real Sociedad (LaLiga) | Columbus Crew (MLS) | 29 | 0,55 | 54 % | 10 m, 7,28 |
| Viktor Tsigankov | Girona (LaLiga) | Ajax (Eredivisie) | 28 | 0,69 | 54 % | 4 m, 6,63 |
| Mika Baur | Paderborn (2. Bundesliga) | Celtic (Premiership) | 22 | 0,47 | 54 % | 5 m, 7,48 |
| Sang-Bin Jeong | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 23 | 0,36 | 54 % | 1 m, 6,76 |
| Kervin Arriaga | Levante (LaLiga) | AEK Athens (Super League 1) | 28 | 0,40 | 54 % | 3 m, 6,14 |
| Oleksandr Zubkov | Trabzonspor (Super Lig) | AEK Athens (Super League 1) | 30 | 0,61 | 53 % | 4 m, 6,56 |
| Anthony Gordon | Newcastle United (Premier League) | Barcelona (LaLiga) | 25 | 0,31 | 53 % | 6 m, 7,50 |
| Caio Henrique | Monaco (Ligue 1) | Ajax (Eredivisie) | 29 | -0,01 | 53 % | 7 m, 6,94 |
| Darius Olaru | FCSB (Liga I) | Union St.Gilloise (First Division A) | 28 | 0,56 | 53 % | 3 m, 6,78 |
| Danilho Doekhi | Union Berlin (Bundesliga) | Lazio (Serie A) | 28 | 0,11 | 53 % | 3 m, 7,41 |
| Lovro Majer | Wolfsburg (Bundesliga) | AEK Athens (Super League 1) | 28 | 0,22 | 52 % | 5 m, 7,51 |
