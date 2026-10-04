# Primera A (COL) – lärdomar

Genererad 2026-10-04 av `node scripts/analyze-learnings.mjs`. Ligan saknar oddshistorik (inga stängningsodds i våra källor), så signaler och kalibrering kan inte testas mot marknaden här. Alla matcher: `data/matcher/COL.csv`.

## Lärdomar i korthet

- 766 matcher (2025-01-24 – 2026-10-03): hemmavinst 45,7 %, kryss 29,5 %, bortavinst 24,8 %, 2,40 mål per match.
- Modellens 1X2-tips träffade 47,3 % (139/294). 
- Över/under 2,5: träff 44,9 % (294). BTTS: 54,1 %.
- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Höghöjd

Hemmalag på arena ≥ 1500 m mot bortalag från minst 1000 m lägre (arenahöjder i `scripts/lib/altitude.mjs`).

| Hemmamatcher | M | V-O-F | P/M | Mot marknaden |
|---|---|---|---|---|
| På höghöjd mot låglandslag | 172 | 72-45-55 | 1,52 | – |
| Övriga | 594 | 278-181-135 | 1,71 | – |

Ligan saknar odds, så höjden kan bara jämföras i poäng (marknaden kan redan ta hänsyn till den).

### Bortalag på höghöjd

| Lag | M på höghöjd | P/M höghöjd | P/M övriga borta | Skillnad | Mot marknaden höghöjd / övriga |
|---|---|---|---|---|---|
| Cúcuta Deportivo | 7 | 0,00 | 0,89 | −0,89 | – |
| Independiente Medellín | 11 | 1,18 | 1,60 | −0,42 | – |
| Deportes Tolima | 15 | 1,33 | 1,54 | −0,20 | – |
| Atlético Bucaramanga | 16 | 1,25 | 1,39 | −0,14 | – |
| Alianza FC | 14 | 0,93 | 0,95 | −0,02 | – |
| Deportivo Cali | 15 | 1,07 | 0,95 | +0,12 | – |
| Deportivo Pereira | 12 | 0,75 | 0,39 | +0,36 | – |
| América de Cali | 16 | 1,56 | 0,96 | +0,60 | – |
| Llaneros FC | 16 | 1,31 | 0,70 | +0,61 | – |
| Atlético Junior | 17 | 1,71 | 1,04 | +0,67 | – |
| Atlético Nacional | 14 | 2,07 | 1,16 | +0,91 | – |
| Unión Magdalena | 9 | 1,11 | 0,18 | +0,93 | – |

## Säsonger

| Säsong | M | Hemma | Kryss | Borta | Mål/M | Över 2,5 | Båda gör mål |
|---|---|---|---|---|---|---|---|
| 2025/26 | 451 | 46 % | 29 % | 25 % | 2,29 | 42 % | 46 % |
| 2026/27 | 315 | 45 % | 31 % | 24 % | 2,57 | 49 % | 55 % |

## Tabell nu (FotMob, 2026-10-04)

**Clausura**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | América de Cali | 11 | 7 | 3 | 1 | 22-6 | 16 | 24 |
| 2 | Deportivo Cali | 12 | 7 | 3 | 2 | 20-9 | 11 | 24 |
| 3 | Atlético Nacional | 10 | 7 | 1 | 2 | 21-10 | 11 | 22 |
| 4 | Millonarios | 13 | 5 | 6 | 2 | 18-11 | 7 | 21 |
| 5 | Atlético Bucaramanga | 10 | 5 | 5 | 0 | 17-9 | 8 | 20 |
| 6 | Independiente Medellín | 11 | 6 | 2 | 3 | 19-15 | 4 | 20 |
| 7 | Independiente Santa Fe | 11 | 5 | 4 | 2 | 18-12 | 6 | 19 |
| 8 | Deportes Tolima | 12 | 5 | 4 | 3 | 15-13 | 2 | 19 |
| 9 | Llaneros FC | 11 | 4 | 2 | 5 | 14-14 | 0 | 14 |
| 10 | Águilas Doradas | 11 | 3 | 5 | 3 | 14-15 | -1 | 14 |
| 11 | Once Caldas | 11 | 3 | 3 | 5 | 14-15 | -1 | 12 |
| 12 | Internacional de Bogotá | 12 | 2 | 6 | 4 | 13-17 | -4 | 12 |
| 13 | Cúcuta Deportivo | 11 | 3 | 3 | 5 | 11-19 | -8 | 12 |
| 14 | Boyacá Chicó FC | 11 | 3 | 3 | 5 | 10-18 | -8 | 12 |
| 15 | Alianza FC | 12 | 3 | 2 | 7 | 12-24 | -12 | 11 |
| 16 | Atlético Junior | 10 | 2 | 3 | 5 | 15-17 | -2 | 9 |
| 17 | Fortaleza CEIF | 11 | 1 | 6 | 4 | 13-18 | -5 | 9 |
| 18 | Deportivo Pereira | 10 | 1 | 5 | 4 | 7-13 | -6 | 8 |
| 19 | Deportivo Pasto | 11 | 2 | 2 | 7 | 9-18 | -9 | 8 |
| 20 | Jaguares de Córdoba | 11 | 1 | 4 | 6 | 11-20 | -9 | 7 |

**Apertura**

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | Atlético Nacional | 19 | 13 | 1 | 5 | 35-15 | 20 | 40 |
| 2 | Atlético Junior | 19 | 11 | 2 | 6 | 31-24 | 7 | 35 |
| 3 | Deportivo Pasto | 19 | 10 | 4 | 5 | 29-25 | 4 | 34 |
| 4 | América de Cali | 19 | 10 | 3 | 6 | 25-15 | 10 | 33 |
| 5 | Once Caldas | 19 | 8 | 9 | 2 | 31-22 | 9 | 33 |
| 6 | Deportes Tolima | 19 | 8 | 7 | 4 | 27-17 | 10 | 31 |
| 7 | Independiente Santa Fe | 19 | 7 | 8 | 4 | 29-22 | 7 | 29 |
| 8 | Internacional de Bogotá | 19 | 7 | 7 | 5 | 26-26 | 0 | 28 |
| 9 | Deportivo Cali | 19 | 7 | 6 | 6 | 20-16 | 4 | 27 |
| 10 | Millonarios | 19 | 7 | 5 | 7 | 31-23 | 8 | 26 |
| 11 | Independiente Medellín | 19 | 7 | 5 | 7 | 26-24 | 2 | 26 |
| 12 | Águilas Doradas | 19 | 7 | 5 | 7 | 20-25 | -5 | 26 |
| 13 | Atlético Bucaramanga | 19 | 5 | 8 | 6 | 26-20 | 6 | 23 |
| 14 | Llaneros FC | 19 | 4 | 10 | 5 | 17-20 | -3 | 22 |
| 15 | Fortaleza CEIF | 19 | 5 | 7 | 7 | 22-27 | -5 | 22 |
| 16 | Jaguares de Córdoba | 19 | 5 | 3 | 11 | 20-33 | -13 | 18 |
| 17 | Alianza FC | 19 | 3 | 8 | 8 | 13-27 | -14 | 17 |
| 18 | Boyacá Chicó FC | 19 | 5 | 2 | 12 | 15-32 | -17 | 17 |
| 19 | Cúcuta Deportivo | 19 | 3 | 7 | 9 | 22-35 | -13 | 16 |
| 20 | Deportivo Pereira | 19 | 1 | 7 | 11 | 15-32 | -17 | 10 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/COL.json`.

## Lagfiler

- [Alianza FC](../lag/COL/alianza-fc.md)
- [América de Cali](../lag/COL/america-de-cali.md)
- [Atlético Bucaramanga](../lag/COL/atletico-bucaramanga.md)
- [Atlético Junior](../lag/COL/atletico-junior.md)
- [Atlético Nacional](../lag/COL/atletico-nacional.md)
- [Boyacá Chicó FC](../lag/COL/boyaca-chico-fc.md)
- [Cúcuta Deportivo](../lag/COL/cucuta-deportivo.md)
- [Deportes Tolima](../lag/COL/deportes-tolima.md)
- [Deportivo Cali](../lag/COL/deportivo-cali.md)
- [Deportivo Pasto](../lag/COL/deportivo-pasto.md)
- [Deportivo Pereira](../lag/COL/deportivo-pereira.md)
- [Fortaleza CEIF](../lag/COL/fortaleza-ceif.md)
- [Independiente Medellín](../lag/COL/independiente-medellin.md)
- [Independiente Santa Fe](../lag/COL/independiente-santa-fe.md)
- [Internacional de Bogotá](../lag/COL/internacional-de-bogota.md)
- [Jaguares de Córdoba](../lag/COL/jaguares-de-cordoba.md)
- [Llaneros FC](../lag/COL/llaneros-fc.md)
- [Millonarios](../lag/COL/millonarios.md)
- [Once Caldas](../lag/COL/once-caldas.md)
- [Águilas Doradas](../lag/COL/aguilas-doradas.md)
