# Övergångar: lyckas spelaren i sin nya liga?

Uppdaterad 2026-10-04 av `scripts/lardomar-overgangar.mjs` (rådata: `scripts/fetch-player-careers-fotmob.mjs`).
8020 spelare som bytt klubb sedan januari 2024, 10221 ligabyten, varav 4575 går att utvärdera
(betyg i gamla ligan finns och nya ligans säsong har spelats klart eller nästan klart).

## Kort sagt

- **Bara 25 % av alla ligabyten blir en klar succé** (ordinarie och betyg minst i nivå med ligans median).
  47 % blir ordinarie, och av dem som får minst 10 matcher presterar 49 % minst som ligans median.
- **Det bästa enskilda måttet är "förväntat betyg i nya ligan"**: betyget i gamla ligan minus hur mycket svårare nya ligan är.
  Ligger det över nya ligans median lyckas 41 %, ligger det klart under lyckas bara 14 %.
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
| under -0,3 | 1247 | 14 % |
| -0,3 till -0,1 | 962 | 20 % |
| -0,1 till 0,1 | 939 | 28 % |
| 0,1 till 0,3 | 712 | 31 % |
| över 0,3 | 715 | 41 % |

## Vad påverkar, en sak i taget

**Ålder vid bytet**

|  | Byten | Lyckades |
|---|---|---|
| under 21 | 647 | 17 % |
| 21–23 | 1277 | 23 % |
| 24–27 | 1538 | 27 % |
| 28–30 | 664 | 28 % |
| 31+ | 449 | 30 % |

**Speltid i gamla ligan**

|  | Byten | Lyckades |
|---|---|---|
| under 33 % | 1706 | 21 % |
| 33–60 % | 1253 | 21 % |
| 60 %+ | 1616 | 33 % |

**Nivåskillnad (ny minus gammal)**

|  | Byten | Lyckades |
|---|---|---|
| klart svagare liga (< -0,25) | 932 | 29 % |
| lite svagare | 964 | 28 % |
| ungefär samma | 640 | 27 % |
| lite starkare | 941 | 24 % |
| klart starkare (> 0,25) | 1098 | 19 % |

**Lån eller köp**

|  | Byten | Lyckades |
|---|---|---|
| köp/fri | 3060 | 27 % |
| lån | 1515 | 21 % |

**Position**

|  | Byten | Lyckades |
|---|---|---|
| målvakt | 286 | 26 % |
| mittback | 770 | 26 % |
| ytterback | 649 | 29 % |
| mittfält | 1302 | 28 % |
| ytter | 762 | 22 % |
| anfallare | 806 | 17 % |

## Modellen

Logistisk regression, tränad på 2339 byten (nya ligans säsong 2024 och 2024/2025) och testad på 2236 senare byten.
AUC träning 0,68, test 0,67. Bara förväntat betyg ger 0,64, så resten av faktorerna tillför lite.

Träffsäkerhet i testet (sa modellen X %, hur ofta lyckades de?):

| Modellens chans | Byten | Lyckades |
|---|---|---|
| 0–20 % | 819 | 14 % |
| 20–35 % | 999 | 27 % |
| 35–50 % | 332 | 39 % |
| 50–65 % | 81 | 58 % |
| 65–100 % | 5 | 80 % |

Vikter (standardiserade, slutmodellen på alla byten; positivt = ökar chansen):

| Faktor | Vikt |
|---|---|
| förväntat betyg i nya ligan mot median | 0,25 |
| marknadsvärde (log) | 0,23 |
| nivåskillnad | -0,22 |
| speltid i gamla ligan | 0,20 |
| anfallare/ytter | -0,14 |
| ålder | 0,11 |
| marknadsvärde saknas | -0,11 |
| nya lagets styrka | 0,11 |
| lån | -0,11 |
| mål+assist per match | -0,09 |
| två säsonger: betyg mot median | 0,09 |
| ålder² | -0,05 |
| gamla lagets styrka | 0,03 |
| betyg mot median i gamla ligan | 0,02 |
| målvakt | -0,01 |

När spelaren väl spelar (minst 10 matcher) är sambandet med betyget mot medianen i nya ligan: förväntat betyg r = 0,34,
gamla betyget r = 0,19, två säsonger r = 0,19 (0 = inget samband, 1 = perfekt).

## Andra säsongen

| Första året | Byten | Kvar i ligan år 2 | Ordinarie år 2 |
|---|---|---|---|
| lyckades | 684 | 69 % | 51 % |
| lyckades inte | 2101 | 54 % | 31 % |

## Ligornas nivå (ur bytena, minst 15 byten)

| Liga | Nivå | Byten |
|---|---|---|
| Premier League (id 47) | 0,58 | 248 |
| LaLiga | 0,45 | 170 |
| Serie A (id 55) | 0,42 | 198 |
| Bundesliga (id 54) | 0,35 | 239 |
| Ligue 1 | 0,30 | 201 |
| Premier League (id 63) | 0,26 | 25 |
| Série A | 0,22 | 312 |
| Championship | 0,19 | 337 |
| LaLiga2 | 0,14 | 79 |
| Super Lig | 0,12 | 149 |
| Saudi Pro League | 0,11 | 56 |
| Serie B (id 86) | 0,10 | 44 |
| Liga Portugal | 0,09 | 150 |
| Liga MX | 0,09 | 94 |
| First Division A | 0,04 | 135 |
| Super League 1 | 0,04 | 83 |
| MLS | 0,02 | 117 |
| Eredivisie | -0,02 | 200 |
| J. League | -0,03 | 37 |
| Serie B (id 8814) | -0,03 | 181 |
| Super League (id 69) | -0,03 | 47 |
| Liga Profesional | -0,04 | 231 |
| 2. Bundesliga | -0,04 | 199 |
| Premiership | -0,06 | 100 |
| League One | -0,08 | 209 |
| Ligue 2 | -0,10 | 52 |
| Bundesliga (id 38) | -0,11 | 76 |
| Superligaen | -0,11 | 126 |
| Ekstraklasa | -0,13 | 128 |
| K League 1 | -0,15 | 15 |
| League Two | -0,17 | 91 |
| Primera A | -0,19 | 101 |
| HNL | -0,20 | 42 |
| Serie A (id 246) | -0,20 | 18 |
| 1. Liga | -0,20 | 21 |
| Liga de Primera | -0,27 | 43 |
| 3. Liga | -0,32 | 71 |
| Allsvenskan | -0,32 | 110 |
| Liga 1 | -0,34 | 16 |
| Eerste Divisie | -0,37 | 76 |
| Super League (id 120) | -0,38 | 20 |
| Primera B Nacional | -0,39 | 34 |
| Eliteserien | -0,41 | 70 |
| 1. Division | -0,58 | 31 |

## Vanligaste ligabytena (minst 8)

| Från → till | Byten | Lyckades | Betyg, median förändring |
|---|---|---|---|
| Série A → Serie B | 167 | 28 % | 0,17 |
| Championship → League One | 89 | 27 % | 0,31 |
| Serie B → Série A | 87 | 10 % | -0,21 |
| Eerste Divisie → Eredivisie | 83 | 18 % | -0,29 |
| League One → Championship | 68 | 24 % | -0,18 |
| Premier League → Championship | 57 | 19 % | 0,40 |
| Bundesliga → 2. Bundesliga | 53 | 21 % | 0,36 |
| League Two → League One | 51 | 37 % | 0,07 |
| 3. Liga → 2. Bundesliga | 50 | 36 % | -0,16 |
| 2. Bundesliga → Bundesliga | 44 | 18 % | -0,44 |
| Eredivisie → Eerste Divisie | 42 | 14 % | 0,68 |
| League One → League Two | 37 | 22 % | 0,07 |
| Ligue 1 → Premier League | 36 | 31 % | -0,24 |
| Liga Profesional → Série A | 35 | 14 % | -0,43 |
| MLS Next Pro → MLS | 34 | 9 % | -0,41 |
| Série A → Liga Profesional | 33 | 39 % | 0,34 |
| Premier League → Serie A | 32 | 28 % | 0,09 |
| Liga MX → Liga Profesional | 31 | 10 % | 0,21 |
| Championship → Premier League | 29 | 17 % | -0,45 |
| Premier League → Bundesliga | 28 | 46 % | 0,32 |
| Liga Profesional → Primera A | 28 | 18 % | 0,10 |
| LaLiga → Premier League | 27 | 41 % | -0,03 |
| Primera B Nacional → Liga Profesional | 27 | 26 % | -0,42 |
| Liga de Primera → Liga Profesional | 27 | 26 % | -0,39 |
| Bundesliga → Premier League | 26 | 42 % | -0,20 |
| Premier League → LaLiga | 26 | 54 % | 0,19 |
| 3. Liga → Bundesliga | 26 | 12 % | -0,67 |
| MLS → MLS Next Pro | 26 | 15 % | -0,38 |
| Premier League → Série A | 24 | 25 % | 0,10 |
| Serie A → Premier League | 24 | 29 % | -0,06 |
| Eliteserien → Allsvenskan | 24 | 17 % | -0,11 |
| Bundesliga → Bundesliga | 24 | 33 % | -0,10 |
| Bundesliga → Championship | 24 | 25 % | -0,15 |
| Liga Portugal → Série A | 22 | 23 % | 0,27 |
| Ligue 1 → Serie A | 22 | 27 % | -0,17 |
| Liga Profesional → Liga MX | 22 | 9 % | -0,42 |
| Premier League → Super Lig | 21 | 48 % | 0,41 |
| Premier League → Ligue 1 | 21 | 19 % | 0,34 |
| Série A → Liga Portugal | 19 | 21 % | -0,08 |
| Primera A → Liga Profesional | 19 | 16 % | -0,27 |

## Årets nyförvärv: prognos

Byten där nya ligans säsong är 2026 eller 2026/2027 (spelaren är kvar i klubben). Chansen är modellens; matcher/betyg hittills som facit.

| Spelare | Från | Till | Ålder | Förväntat mot median | Chans | Hittills |
|---|---|---|---|---|---|---|
| Mauro Arambarri | Getafe (LaLiga) | River Plate (Liga Profesional) | 30 | 0,53 | 67 % | 6 m, 6,32 |
| Thiago Almada | Atlético Madrid (LaLiga) | River Plate (Liga Profesional) | 24 | 0,34 | 61 % | 6 m, 8,03 |
| Ángel Correa | Tigres (Liga MX) | River Plate (Liga Profesional) | 30 | 0,72 | 60 % | 9 m, 7,55 |
| Nicolás Otamendi | Benfica (Liga Portugal) | River Plate (Liga Profesional) | 38 | 0,70 | 57 % | 10 m, 7,21 |
| Lucas Paquetá | West Ham United (Premier League) | Flamengo (Série A) | 28 | 0,47 | 57 % | 19 m, 7,34 |
| Aníbal Moreno | Palmeiras (Série A) | River Plate (Liga Profesional) | 26 | 0,24 | 57 % | 24 m, 7,31 |
| Giovanni González | FC Krasnodar (Premier League) | River Plate (Liga Profesional) | 31 | 0,50 | 55 % | 3 m, 6,87 |
| Joshua Kitolano | Sparta Rotterdam (Eredivisie) | Bodø/Glimt (Eliteserien) | 24 | 0,41 | 52 % | 6 m, 6,74 |
| Francisco Ortega | Olympiacos (Super League 1) | River Plate (Liga Profesional) | 26 | 0,45 | 52 % | 6 m, 6,52 |
| Gustavo Cuéllar | Grêmio (Série A) | Deportivo Cali (Primera A) | 33 | 0,47 | 48 % | 16 m, 7,16 |
| Pacha Espino | Rayo Vallecano (LaLiga) | Racing Club (Liga Profesional) | 34 | 0,44 | 48 % | 3 m, 6,27 |
| Stiven Barreiro | León (Liga MX) | Millonarios (Primera A) | 31 | 0,24 | 47 % | 11 m, 6,99 |
| Cristian Arango | San Jose Earthquakes (MLS) | Atlético Nacional (Primera A) | 30 | 0,79 | 47 % | 24 m, 6,42 |
| Fred | Fenerbahçe (Super Lig) | Atlético-MG (Série A) | 32 | 0,26 | 47 % | 5 m, 6,91 |
| Renan Lodi | Al Hilal (Saudi Pro League) | Atlético-MG (Série A) | 27 | 0,52 | 46 % | 24 m, 7,05 |
| Juan Cuadrado | Pisa (Serie A) | Millonarios (Primera A) | 37 | 0,39 | 46 % | 1 m, 6,71 |
| Joel Mvuka | Lorient (Ligue 1) | Bodø/Glimt (Eliteserien) | 23 | 0,41 | 45 % | 3 m, 6,54 |
| Tommi Jyry | Petrolul Ploiești (Liga I) | KuPS (Veikkausliiga) | 26 | 0,26 | 45 % | 9 m, 6,99 |
| Gerson | Zenit St. Petersburg (Premier League) | Cruzeiro (Série A) | 28 | 0,15 | 45 % | 24 m, 7,13 |
| Micael | Palmeiras (Série A) | Inter Miami CF (MLS) | 25 | 0,56 | 44 % | 18 m, 6,95 |
| James Rodríguez | Minnesota United (MLS) | Atlético Nacional (Primera A) | 34 | 0,65 | 44 % | 4 m, 6,82 |
| Patrick de Paula | Remo (Série A) | Sport Recife (Serie B) | 26 | 0,58 | 43 % | 5 m, 6,81 |
| Jesper Daland | Fortuna Düsseldorf (2. Bundesliga) | Viking (Eliteserien) | 26 | 0,16 | 43 % | 2 m, 6,18 |
| Alcides Benítez | Guaraní (Division Profesional) | Belgrano (Liga Profesional) | 23 | 0,42 | 43 % | 22 m, 6,89 |
| Jherson Mosquera | Newell's Old Boys (Liga Profesional) | Tolima (Primera A) | 26 | 1,32 | 43 % | 21 m, 6,56 |
| Alexander Jensen | Aberdeen (Premiership) | Elfsborg (Allsvenskan) | 24 | 0,19 | 42 % | 9 m, 7,38 |
| Lubomír Belko | Žilina (1. liga) | Viking (Eliteserien) | 24 | 0,25 | 42 % | 11 m, 6,89 |
| Lucas Beltrán | Valencia (LaLiga) | River Plate (Liga Profesional) | 24 | 0,09 | 42 % | 10 m, 6,28 |
| Domingos Duarte | Getafe (LaLiga) | São Paulo (Série A) | 30 | 0,18 | 42 % | 5 m, 7,30 |
| Santiago Sosa | Racing Club (Liga Profesional) | Vasco da Gama (Série A) | 26 | 0,29 | 42 % | 6 m, 7,31 |
| Neraysho Kasanwirjo | Fortuna Sittard (Eredivisie) | Brann (Eliteserien) | 24 | 0,37 | 42 % | 3 m, 6,81 |
| Pedro Gallese | Orlando City (MLS) | Deportivo Cali (Primera A) | 36 | 0,41 | 42 % | 26 m, 6,89 |
| Lucas Lima | Sport Recife (Série A) | Goiás (Serie B) | 35 | 0,61 | 42 % | 27 m, 7,00 |
| Guillermo Maripán | Torino (Serie A) | Internacional (Série A) | 31 | 0,18 | 41 % | 9 m, 6,74 |
| Mathias Fjørtoft Løvik | Trabzonspor (Super Lig) | Molde (Eliteserien) | 22 | 0,34 | 41 % | 7 m, 6,24 |
| Rodrigo Ureña | Universitario de Deportes (Liga 1) | Millonarios (Primera A) | 32 | 0,62 | 40 % | 28 m, 7,18 |
| Eric Bailly | Real Oviedo (LaLiga) | Columbus Crew (MLS) | 31 | 0,36 | 40 % | 3 m, 6,57 |
| Juan Fernando Quintero | River Plate (Liga Profesional) | Independiente Medellín (Primera A) | 33 | 0,49 | 40 % | 5 m, 7,86 |
| Vicente Pizarro | Colo Colo (Liga de Primera) | Rosario Central (Liga Profesional) | 23 | 0,44 | 40 % | 28 m, 7,16 |
| Moisés Mosquera | FC Juárez (Liga MX) | Sporting Kansas City (MLS) | 24 | 0,17 | 40 % | 8 m, 6,46 |
| Alan Lescano | Argentinos Juniors (Liga Profesional) | Vasco da Gama (Série A) | 24 | 0,17 | 40 % | 2 m, 7,74 |
| Franco Cristaldo | Grêmio (Série A) | Talleres (Liga Profesional) | 29 | 0,04 | 39 % | 19 m, 6,90 |
| Matías Viña | Flamengo (Série A) | River Plate (Liga Profesional) | 28 | 0,20 | 39 % | 10 m, 6,59 |
| Julián Bazán | Red Bull New York (MLS) | Red Bull New York  II (MLS Next Pro) | 20 | 0,53 | 39 % | 3 m, 8,18 |
| Jhon Arias | Wolverhampton Wanderers (Premier League) | Palmeiras (Série A) | 28 | 0,00 | 38 % | 22 m, 7,25 |
| Fausto Vera | Atlético-MG (Série A) | River Plate (Liga Profesional) | 25 | 0,09 | 38 % | 24 m, 7,13 |
| Mohamed Soumah | Gent U23 (First Division B) | Sirius (Allsvenskan) | 22 | 0,54 | 38 % | 18 m, 7,23 |
| Alexander Jallow | Brescia (Serie B) | IFK Göteborg (Allsvenskan) | 27 | 0,16 | 38 % | 13 m, 6,62 |
| Felipe Andrade | Houston Dynamo FC (MLS) | Houston Dynamo 2 (MLS Next Pro) | 23 | 0,14 | 38 % | 2 m, 6,53 |
| Herman Johansson | Mjällby (Allsvenskan) | FC Dallas (MLS) | 28 | 0,27 | 38 % | 24 m, 6,68 |
| Milton Casco | River Plate (Liga Profesional) | Atlético Nacional (Primera A) | 37 | 0,42 | 38 % | 25 m, 7,11 |
| Júnior Alonso | Atlético-MG (Série A) | Atlanta United (MLS) | 33 | 0,21 | 37 % | 11 m, 6,70 |
| Luis Muriel | Orlando City (MLS) | Junior FC (Primera A) | 34 | 0,50 | 37 % | 29 m, 7,03 |
| Stian Gregersen | Atlanta United (MLS) | Malmö FF (Allsvenskan) | 30 | 0,20 | 37 % | 4 m, 7,22 |
| Lourenço | Ceará (Série A) | Goiás (Serie B) | 28 | 0,15 | 37 % | 23 m, 6,80 |
| Rafael Borré | Internacional (Série A) | River Plate (Liga Profesional) | 30 | -0,02 | 37 % | 8 m, 6,10 |
| Gastón Ávila | Fortaleza (Série A) | Rosario Central (Liga Profesional) | 24 | 0,17 | 36 % | 22 m, 7,39 |
| Léo Duarte | Başakşehir (Super Lig) | Atlético-MG (Série A) | 29 | 0,09 | 36 % | 1 m, 6,98 |
| Kasim Adams | Servette (Super League) | KuPS (Veikkausliiga) | 30 | 0,35 | 36 % | 14 m, 7,05 |
| Ezequiel Unsain | Necaxa (Liga MX) | Talleres (Liga Profesional) | 30 | -0,24 | 36 % | 10 m, 7,19 |
