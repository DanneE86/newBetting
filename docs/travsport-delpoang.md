# Delpoäng från Travsport

Delpoängen beräknas enbart för presentationen. Sparade vinstchanser,
ranking, ordinarie totalpoäng och systemval ändras inte. Vald tidskälla gäller även
delpoängen. Vid Travsport används samma N giltiga starter som i tidsurvalet,
före omgångens datum. Ogiltiga starter ersätts av äldre giltiga starter.

| Poäng | Underlag |
|---|---|
| Fo | Placeringsvärde 1/√placering, noll för oplacerad. Nyaste loppet har vikt 1, därefter 0,9 upphöjt till loppets ålder i urvalet. |
| Fa | Negativ viktad omräknad tid: 50 % bästa tiden i senaste N giltiga starter, 30 % rekord på aktuell distansklass, 20 % livstidsrekord. |
| Kl | log(1 + genomsnittlig intjänad prissumma i urvalet). Intjäning är en förenkling av klass, inte en bedömning av motståndet. |
| Sp | Genomsnittligt placeringsvärde från dagens spår och startmetod i hästens urval. |
| Ku | Genomsnittligt placeringsvärde för dagens kusk i samtliga startande hästars valda historik. |
| Tr | Som Ku, för dagens tränare. |
| Ut | Genomsnittligt placeringsvärde med dagens skokombination och vagntyp i hästens urval. Båda måste vara kända. |
| Te | Negativ genomsnittlig omräknad tid i hästens urval: uthållig fart, ingen positions- eller öppningstempomodell. |
| St | Logaritmen av aktuell marknadsandel från ATG. Dagens marknad finns inte i historiska Travsport-resultat. |

Varje råvärde standardiseras inom fältet bland hästar med underlag till
50 + 20 × standardavvikelse från snittet, begränsat till 0–100.
Lika värden ger 50. Vid saknade historiska fält behålls den gamla ATG-poängen,
gulmarkerad med förklaring. Helt saknad poäng visas som gult streck.
Fa visas som saknad om ingen kolumntid finns; saknade kolumner utelämnas
och övriga vikter räknas om till summa 1. Samma rekord kan ligga i flera
kolumner: det är tre perspektiv på fart, inte tre oberoende prestationer.
Alla tider omräknas med samma befintliga distans-, startmetods- och
tilläggsregler som kolumnerna. Rekordkolumnerna använder hela tillgängliga
historiken, inte bara senaste N. RT behöver äldre starter som jämförelse
med det rekord som var känt före varje start. LI är karriärstarter.

Ku/Tr avser enbart urvalet, inte personernas fullständiga statistik.
Sp/Ut kan bygga på få matchande lopp; metoden är beskrivande och inte
kalibrerad som prognosmodell. Galopp med angiven placering över 0 och utan
diskvalifikation räknas nu som giltig tid. Den omräknade tiden minskas med
exakt 0,5 s, även för kallblod. Avdraget görs efter övriga omräkningar och
gäller de tre tidskolumnerna, Fa och parentespoängen. Ursprungstiden ändras
inte. Galopp utan placering och diskvalifikationer utesluts fortsatt.
RT och FT räknar med placerade galopplopp med samma korrigering på −0,5 s.
FT räknar även med segerlopp där omräknad tid är lika med eller bättre än
det omräknade livsrekord som var känt före starten. Övriga segerlopp hoppas
över utan att bryta följden. RT räknar med segertider inom ±0,5 s från
tidigare rekord, inklusive exakt ±0,5 s; andra segertider hoppas över i
antal och andel. För andra placeringar gäller fortsatt strikt mindre än
0,5 s. Giltiga segertider får alltid fastställa rekord inför senare starter.
FT jämför närmast föregående jämförbara lopp över överhoppade segerlopp
och ogiltiga galopplopp. Saknat tidigare rekord gör att en seger inte kan
kvalificera sig för RT/FT; den får inte jämföras med sig själv.
Segerlopp behålls i de tre tidskolumnerna och övriga delpoäng.

Historiken kommer ur Sportinfo-filerna (data/hastar/travsport/ts<id>.json) med
kusk, tränare, spår, prissumma och utrustning per start, se docs/travsport-historik.md.

## Alternativ total med Fa

Poäng visas som ordinarie total (alternativ total med Fa och Fo). Jämförelsemodellen
använder endast Fa som tidsfaktor, med negativ Fa-tid från samma gemensamma
50/30/20-beräkning som delpoängen. Fa-tiden z-standardiseras inom loppet,
begränsad till ±2,5 standardavvikelser, precis som originalmodellens faktorer.
Fältet Tidsvikt (Fa) direkt efter Antal lopp med giltig tid anger multipeln
av den befintliga fartkoefficienten enbart i parentespoängen. Startvärdet är
2: för nuvarande inlärda modell 2 × 0,0636 = 0,1272. 1 ger ursprunglig vikt,
3 tredubbel och 0 tar bort tidsbidraget. Decimaler tillåts; intervallet är
0–100. Ändring räknar om parentespoängen direkt när fältets värde bekräftas.
Alla gamla tidsfaktorer tas bort: fart, rekord, bastKm3, kmSenast,
efterSenast, efterSnitt3, naraUtanPlats och motFalt3. De fyra sista härleds
ur tidsskillnader mot vinnaren eller fältet. Även gamla formbidrag tas bort:
form, seger5, plats5, senast och galopp. Den visade Fo-poängen tillförs i
stället som (Fo − 50)/20, med beloppet av ursprunglig formkoefficient.
Nuvarande Fo-koefficient blir därför +0,0759. Detta val gör att bättre
visad form höjer parentespoängen; det är ingen nyinlärd formmodell.
Saknad Fo ger neutralt bidrag. ATG-reserv används som för den visade Fo-poängen.
Tidsvikt (Fa) styr enbart Fa. På raden direkt under ligger Formvikt (Fo),
som styr enbart Fo. Startvärde 1 behåller Fo-koefficienten +0,0759, 2 ger
+0,1518 och 0 tar bort formbidraget. Decimaler tillåts i intervallet 0–100.
Parentespoängen räknas om när det ändrade värdet bekräftas. Övriga faktorer behålls.

Jämförelsechansen är proportionell mot ordinarie exakt chans ×
exp(vald tidsmultipel × fartkoefficient × Fa-z + vald formmultipel × |formkoefficient| × Fo-z
− summan av alla gamla tids- och formbidrag). Alla hästar normaliseras sedan
till summa 1. Den alternativa totalen använder samma logaritmiska poängskala
som originalet: 0,5 % ger 0 och 60 % ger 100, begränsat till 0–100.
Detta är en jämförelsemodell med befintlig vikt, inte nyinlärda Fa-vikter.

Exakta referenschanser, gammalt fart-z, gamla tids- och formbidrag samt
formkoefficient sparas som faBaseline version 3 i nya analyser.
Äldre analyser får en referens ur sparad rådata endast om omräknad originalchans
och total överensstämmer med sparad analys för hela loppet. Ingen sparad
analys skrivs om vid läsningen. Saknas säker referens visas (—).
Häst utan Fa-tid får neutralt Fa-bidrag i normaliseringen efter att alla gamla
tidsbidrag tagits bort, men visar (—) som alternativ total. Den alternativa totalen påverkar aldrig
ranking, ordinarie chans, spelvärde eller systembyggaren.
