# Conference League (ECL) – lärdomar

Genererad 2026-09-29 av `node scripts/analyze-learnings.mjs`. Cup: lagen hör till sina ligor, se deras lagfiler. Alla matcher: `data/matcher/ECL.csv`.

## Lärdomar i korthet

- Utan odds finns ingen marknad att lära av. Oddsen vi ser före varje match sparas nu (`pre_*` i matcherfilen), så marknadstestet kan köras här efter cirka 150 matcher.

## Tabell nu (FotMob, 2026-09-29)

| # | Lag | M | V | O | F | Mål | +/− | P |
|---|---|---|---|---|---|---|---|---|
| 1 | AGF | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 2 | Ajax Amsterdam | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 3 | Atalanta | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 4 | Borac Banja Luka | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 5 | Braga | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 6 | SK Brann | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 7 | Brighton & Hove Albion | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 8 | CSKA Sofia | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 9 | Egnatia | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 10 | F.C. København | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 11 | FC Midtjylland | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 12 | FC Nordsjælland | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 13 | FC Twente | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 14 | Red Star Belgrade | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 15 | Kauno Zalgiris | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 16 | SC Freiburg | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 17 | KAA Gent | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 18 | Getafe | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 19 | Hajduk Split | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 20 | Heart of Midlothian | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 21 | Iberia 1999 | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 22 | Inter D'Escaldes | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 23 | Jablonec | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 24 | Kairat Almaty | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 25 | KuPS Kuopio | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 26 | Lincoln Red Imps | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 27 | FC Lugano | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 28 | Mjällby AIF | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 29 | AS Monaco | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 30 | Pafos | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 31 | Panathinaikos | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 32 | Riga FC | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 33 | Sint-Truidense | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 34 | FC Thun | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 35 | Trabzonspor | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |
| 36 | CSU Craiova | 0 | 0 | 0 | 0 | 0-0 | 0 | 0 |

Tabellhistorik (en rad per lag och dag sedan 2026-09-28): `data/ligor/ECL.json`.

## Trupper

Trupperna för cuplagen finns i `data/trupper/ECL.json` och i lagens egna ligafiler.
