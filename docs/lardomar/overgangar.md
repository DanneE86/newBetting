# Övergångar: lyckas spelaren i sin nya liga?

Uppdaterad 2026-10-04 av `scripts/lardomar-overgangar.mjs` (rådata: `scripts/fetch-player-careers-fotmob.mjs`).
13263 spelare som bytt klubb sedan januari 2024, 16492 ligabyten, varav 7149 går att utvärdera
(betyg i gamla ligan finns och nya ligans säsong har spelats klart eller nästan klart).

## Kort sagt

- **Bara 24 % av alla ligabyten blir en klar succé** (ordinarie och betyg minst i nivå med ligans median).
  45 % blir ordinarie, och av dem som får minst 10 matcher presterar 48 % minst som ligans median.
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
| under -0,3 | 2014 | 14 % |
| -0,3 till -0,1 | 1498 | 19 % |
| -0,1 till 0,1 | 1486 | 26 % |
| 0,1 till 0,3 | 1100 | 30 % |
| över 0,3 | 1051 | 39 % |

## Vad påverkar, en sak i taget

**Ålder vid bytet**

|  | Byten | Lyckades |
|---|---|---|
| under 21 | 1070 | 15 % |
| 21–23 | 2053 | 21 % |
| 24–27 | 2359 | 27 % |
| 28–30 | 999 | 27 % |
| 31+ | 668 | 31 % |

**Speltid i gamla ligan**

|  | Byten | Lyckades |
|---|---|---|
| under 33 % | 2807 | 20 % |
| 33–60 % | 1962 | 21 % |
| 60 %+ | 2380 | 31 % |

**Nivåskillnad (ny minus gammal)**

|  | Byten | Lyckades |
|---|---|---|
| klart svagare liga (< -0,25) | 1555 | 27 % |
| lite svagare | 1366 | 27 % |
| ungefär samma | 1148 | 26 % |
| lite starkare | 1360 | 23 % |
| klart starkare (> 0,25) | 1720 | 18 % |

**Lån eller köp**

|  | Byten | Lyckades |
|---|---|---|
| köp/fri | 4850 | 26 % |
| lån | 2299 | 19 % |

**Position**

|  | Byten | Lyckades |
|---|---|---|
| målvakt | 485 | 24 % |
| mittback | 1211 | 26 % |
| ytterback | 958 | 28 % |
| mittfält | 2022 | 27 % |
| ytter | 1207 | 22 % |
| anfallare | 1266 | 16 % |

## Modellen

Logistisk regression, tränad på 3599 byten (nya ligans säsong 2024 och 2024/2025) och testad på 3550 senare byten.
AUC träning 0,68, test 0,67. Bara förväntat betyg ger 0,63, så resten av faktorerna tillför lite.

Träffsäkerhet i testet (sa modellen X %, hur ofta lyckades de?):

| Modellens chans | Byten | Lyckades |
|---|---|---|
| 0–20 % | 1369 | 13 % |
| 20–35 % | 1552 | 25 % |
| 35–50 % | 508 | 39 % |
| 50–65 % | 113 | 47 % |
| 65–100 % | 8 | 50 % |

Vikter (standardiserade, slutmodellen på alla byten; positivt = ökar chansen):

| Faktor | Vikt |
|---|---|
| förväntat betyg i nya ligan mot median | 0,26 |
| marknadsvärde (log) | 0,25 |
| nivåskillnad | -0,19 |
| anfallare/ytter | -0,17 |
| speltid i gamla ligan | 0,16 |
| marknadsvärde saknas | -0,15 |
| lån | -0,15 |
| ålder | 0,14 |
| ålder² | -0,13 |
| två säsonger: betyg mot median | 0,10 |
| nya lagets styrka | 0,09 |
| mål+assist per match | -0,07 |
| betyg mot median i gamla ligan | -0,05 |
| gamla lagets styrka | 0,05 |
| målvakt | 0,00 |

När spelaren väl spelar (minst 10 matcher) är sambandet med betyget mot medianen i nya ligan: förväntat betyg r = 0,32,
gamla betyget r = 0,19, två säsonger r = 0,20 (0 = inget samband, 1 = perfekt).

## Andra säsongen

| Första året | Byten | Kvar i ligan år 2 | Ordinarie år 2 |
|---|---|---|---|
| lyckades | 1042 | 68 % | 51 % |
| lyckades inte | 3286 | 54 % | 31 % |

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
| Serie B → Série A | 91 | 12 % | -0,17 |
| Eerste Divisie → Eredivisie | 91 | 18 % | -0,31 |
| League One → Championship | 88 | 22 % | -0,21 |
| Serie A → Serie B | 86 | 26 % | 0,41 |
| Premier League → Championship | 77 | 22 % | 0,40 |
| LaLiga → LaLiga2 | 71 | 24 % | 0,42 |
| Bundesliga → 2. Bundesliga | 56 | 21 % | 0,26 |
| Eredivisie → Eerste Divisie | 53 | 11 % | 0,64 |
| 3. Liga → 2. Bundesliga | 52 | 35 % | -0,17 |
| LaLiga2 → LaLiga | 50 | 12 % | -0,38 |
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
| Casemiro | Manchester United (Premier League) | Inter Miami CF (MLS) | 34 | 1,06 | 66 % | 11 m, 7,07 |
| Mauro Arambarri | Getafe (LaLiga) | River Plate (Liga Profesional) | 30 | 0,51 | 63 % | 6 m, 6,32 |
| Fallou Fall | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 21 | 0,84 | 63 % | 2 m, 6,94 |
| Tomas Totland | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 26 | 0,80 | 60 % | 1 m, 6,88 |
| Thiago Almada | Atlético Madrid (LaLiga) | River Plate (Liga Profesional) | 24 | 0,32 | 60 % | 6 m, 8,03 |
| Nicolás Otamendi | Benfica (Liga Portugal) | River Plate (Liga Profesional) | 38 | 0,70 | 56 % | 10 m, 7,21 |
| Lucas Paquetá | West Ham United (Premier League) | Flamengo (Série A) | 28 | 0,46 | 55 % | 19 m, 7,34 |
| Ángel Correa | Tigres (Liga MX) | River Plate (Liga Profesional) | 30 | 0,70 | 55 % | 9 m, 7,55 |
| Aníbal Moreno | Palmeiras (Série A) | River Plate (Liga Profesional) | 26 | 0,25 | 55 % | 24 m, 7,31 |
| Lukas MacNaughton | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 30 | 0,50 | 55 % | 1 m, 6,79 |
| Brais Méndez | Real Sociedad (LaLiga) | Columbus Crew (MLS) | 29 | 0,55 | 55 % | 10 m, 7,28 |
| Sang-Bin Jeong | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 23 | 0,36 | 54 % | 1 m, 6,76 |
| Robert Lewandowski | Barcelona (LaLiga) | Chicago Fire FC (MLS) | 37 | 0,55 | 53 % | 11 m, 7,20 |
| Reed Baker-Whiting | Nashville SC (MLS) | Huntsville City FC (MLS Next Pro) | 20 | 0,48 | 52 % | 1 m, 7,29 |
| Joshua Kitolano | Sparta Rotterdam (Eredivisie) | Bodø/Glimt (Eliteserien) | 24 | 0,45 | 51 % | 6 m, 6,74 |
| Giovanni González | FC Krasnodar (Premier League) | River Plate (Liga Profesional) | 31 | 0,53 | 50 % | 3 m, 6,87 |
| Francisco Ortega | Olympiacos (Super League 1) | River Plate (Liga Profesional) | 26 | 0,41 | 49 % | 6 m, 6,52 |
| Mathias Fjørtoft Løvik | Trabzonspor (Super Lig) | Molde (Eliteserien) | 22 | 0,31 | 48 % | 7 m, 6,24 |
| Carlo Holse | Samsunspor (Super Lig) | St. Louis City (MLS) | 26 | 0,50 | 48 % | 9 m, 7,07 |
| Gustavo Cuéllar | Grêmio (Série A) | Deportivo Cali (Primera A) | 33 | 0,47 | 46 % | 16 m, 7,16 |
| Renan Lodi | Al Hilal (Saudi Pro League) | Atlético-MG (Série A) | 27 | 0,51 | 46 % | 24 m, 7,05 |
| Niklas Dorsch | FC Heidenheim (Bundesliga) | Toronto FC (MLS) | 28 | 0,31 | 45 % | 7 m, 6,80 |
| Josh Cohen | Chicago Fire FC (MLS) | Chicago Fire FC II (MLS Next Pro) | 33 | 1,38 | 45 % | 1 m, 6,38 |
| Antoine Griezmann | Atlético Madrid (LaLiga) | Orlando City (MLS) | 34 | 0,50 | 45 % | 11 m, 8,19 |
| Gerson | Zenit St. Petersburg (Premier League) | Cruzeiro (Série A) | 28 | 0,17 | 45 % | 24 m, 7,13 |
| Fred | Fenerbahçe (Super Lig) | Atlético-MG (Série A) | 32 | 0,24 | 45 % | 5 m, 6,91 |
| Jonas Svensson | Beşiktaş (Super Lig) | Rosenborg (Eliteserien) | 32 | 0,81 | 45 % | 13 m, 7,20 |
| Kai Wagner | Birmingham City (Championship) | Philadelphia Union (MLS) | 29 | 0,69 | 45 % | 12 m, 7,49 |
| Henry Kessler | Charlotte FC (MLS) | Crown Legacy FC (MLS Next Pro) | 27 | 0,47 | 44 % | 1 m, 8,07 |
| Juan Cuadrado | Pisa (Serie A) | Millonarios (Primera A) | 37 | 0,38 | 44 % | 1 m, 6,71 |
| Alcides Benítez | Guaraní (Division Profesional) | Belgrano (Liga Profesional) | 23 | 0,51 | 44 % | 22 m, 6,89 |
| Lubomír Belko | Žilina (1. liga) | Viking (Eliteserien) | 24 | 0,30 | 43 % | 11 m, 6,89 |
| Facundo Torres | Palmeiras (Série A) | Austin FC (MLS) | 25 | 0,51 | 43 % | 27 m, 7,23 |
| Joel Mvuka | Lorient (Ligue 1) | Bodø/Glimt (Eliteserien) | 23 | 0,37 | 42 % | 3 m, 6,54 |
| Neraysho Kasanwirjo | Fortuna Sittard (Eredivisie) | Brann (Eliteserien) | 24 | 0,41 | 42 % | 3 m, 6,81 |
| Julián Bazán | Red Bull New York (MLS) | Red Bull New York  II (MLS Next Pro) | 20 | 0,62 | 42 % | 3 m, 8,18 |
| Pacha Espino | Rayo Vallecano (LaLiga) | Racing Club (Liga Profesional) | 34 | 0,42 | 42 % | 3 m, 6,27 |
| Giovanny Sequera | Philadelphia Union (MLS) | Philadelphia Union II (MLS Next Pro) | 20 | 0,98 | 42 % | 23 m, 6,79 |
| Elías Báez | San Lorenzo (Liga Profesional) | Atlanta United (MLS) | 21 | 0,23 | 42 % | 24 m, 6,85 |
| James Rodríguez | Minnesota United (MLS) | Atlético Nacional (Primera A) | 34 | 0,63 | 42 % | 4 m, 6,82 |
| Morten Bjørlo | Konyaspor (Super Lig) | Tromsø (Eliteserien) | 30 | 0,15 | 41 % | 3 m, 6,84 |
| Stiven Barreiro | León (Liga MX) | Millonarios (Primera A) | 31 | 0,22 | 41 % | 11 m, 6,99 |
| Patrick de Paula | Remo (Série A) | Sport Recife (Serie B) | 26 | 0,57 | 41 % | 5 m, 6,81 |
| Felipe Andrade | Houston Dynamo FC (MLS) | Houston Dynamo 2 (MLS Next Pro) | 23 | 0,23 | 41 % | 2 m, 6,53 |
| Sergio Reguilón | Tottenham Hotspur (Premier League) | Inter Miami CF (MLS) | 29 | 0,40 | 41 % | 13 m, 6,62 |
| Alexander Jensen | Aberdeen (Premiership) | Elfsborg (Allsvenskan) | 24 | 0,19 | 41 % | 9 m, 7,38 |
| Breel Embolo | Rennes (Ligue 1) | Atlanta United (MLS) | 29 | 0,26 | 41 % | 5 m, 6,99 |
| Miguel Perez | St. Louis City (MLS) | St. Louis City 2 (MLS Next Pro) | 20 | -0,14 | 41 % | 4 m, 7,30 |
| Paulo Díaz | River Plate (Liga Profesional) | Atlanta United (MLS) | 31 | 0,82 | 40 % | 6 m, 6,70 |
| Tommi Jyry | Petrolul Ploiești (Liga I) | KuPS (Veikkausliiga) | 26 | 0,19 | 40 % | 9 m, 6,99 |
| Orbelín Pineda | AEK Athens (Super League 1) | Monterrey (Liga MX) | 30 | 0,31 | 40 % | 7 m, 7,40 |
| Vicente Pizarro | Colo Colo (Liga de Primera) | Rosario Central (Liga Profesional) | 23 | 0,48 | 40 % | 28 m, 7,16 |
| Santiago Sosa | Racing Club (Liga Profesional) | Vasco da Gama (Série A) | 26 | 0,28 | 40 % | 6 m, 7,31 |
| Bryan Ramírez | LDU de Quito (Serie A) | FC Cincinnati (MLS) | 25 | 0,53 | 39 % | 24 m, 7,26 |
| Juan Fernando Quintero | River Plate (Liga Profesional) | Independiente Medellín (Primera A) | 33 | 0,48 | 39 % | 5 m, 7,86 |
| Jack Harrison | Fiorentina (Serie A) | New England Revolution (MLS) | 29 | 0,32 | 39 % | 7 m, 7,57 |
| Alan Lescano | Argentinos Juniors (Liga Profesional) | Vasco da Gama (Série A) | 24 | 0,16 | 39 % | 2 m, 7,74 |
| Mohamed Soumah | Gent U23 (First Division B) | Sirius (Allsvenskan) | 22 | 0,57 | 39 % | 18 m, 7,23 |
| Allan Saint-Maximin | Lens (Ligue 1) | Charlotte FC (MLS) | 28 | 0,55 | 39 % | 9 m, 7,36 |
| Lucas Halter | Vitória (Série A) | Houston Dynamo FC (MLS) | 25 | 0,22 | 39 % | 15 m, 7,10 |
