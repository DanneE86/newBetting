# Lokal databas

All data finns kvar som filer i `data/` precis som förut. Databasen är en **kopia i tabellform** som byggs om från filerna, så att du kan bläddra, söka och filtrera utan att öppna JSON-filer.

- `fotboll.sqlite`: matcher, tabeller, spelare, tränare, matchstatistik och våra Oddset-tips
- `stryktips.sqlite`: Stryktipset och Europatipset: alla omgångar, matcher, hur svenska folket spelat, odds, tio tidningar, facit, utdelning, våra kuponger med varje rad och antal rätt, samt alla bakkörningar
- `hastar.sqlite`: omgångar, lopp, starter (streck, odds, placering, km-tid, galopp), hästar, tidigare starter, utdelning, våra analyser och tips, uppföljningen och alla bakkörningar med modellens chans per häst

## Uppdatera

```
npm run databas                bygger alla tre (ca 1 minut)
npm run databas -- fotboll     bara fotboll
npm run databas -- stryktips   bara Stryktipset och Europatipset
npm run databas -- hastar      bara hästar
```

Den byggs också om **automatiskt**: Windows-uppgiften "Betting databas auto" kollar varje timme och bygger om de databaser som är 3 dygn eller äldre (logg: `databas/auto-logg.txt`). Installera eller ta bort den med `powershell -ExecutionPolicy Bypass -File scripts\databas-auto-installera.ps1` (lägg till `-TaBort` för att ta bort). Datorn måste vara på och du inloggad; missade körningar tas igen när den startar. Vill du ha färsk data direkt kör du kommandot ovan. Databasen ändrar aldrig filerna. Stäng DB Browser innan du bygger om, annars går filen inte att byta ut.

## Titta i den

Öppna filen i **DB Browser for SQLite** (Start-menyn): *Öppna databas*, välj filen, gå sedan till fliken *Bläddra data*.

Börja med de här:

- **om_tabeller**: vad varje tabell innehåller, var den kommer ifrån och hur många rader den har
- **om_kolumner**: förklaring av kolumnerna (alla matchkolumner är förklarade)
- **visa_...**: färdiga vyer, till exempel `visa_spelade_matcher`, `visa_tabeller`, `visa_vinnare`, `visa_kuskar`, `visa_skrallar`, `visa_vara_kuponger`, `visa_bakkorningar` och `visa_modell_kalibrering`
- **rapporter**: träningsrapporter och summeringar som inte passar som rader, hela filen som text

## Så läser du siffrorna

- Chanser är tal mellan 0 och 1 (0,55 = 55 %). Odds är vanliga decimalodds.
- `resultat` är 1, X eller 2.
- Hästarnas `streck` är 0–1, och `km_tid` är sekunder efter första minuten (13,5 = 1.13,5).
- Tomt (NULL) betyder att källan saknade uppgiften.

## Exempel (fliken *Kör SQL*)

```sql
-- Alla AIK-matcher senaste året
SELECT * FROM visa_spelade_matcher WHERE (hemmalag = 'AIK' OR bortalag = 'AIK') AND datum >= '2025-10-01';

-- Matcher där folket spelat under 15 % på det som vann
SELECT * FROM visa_skrallar WHERE folket_procent < 15;

-- Bästa hästbakkörningarna på 500 kr
SELECT * FROM visa_bakkorningar WHERE budget_kr = 500 AND spelform = 'alla' ORDER BY netto_kr DESC;

-- Vinnare med under 10 % streck på V86
SELECT * FROM visa_vinnare WHERE spelform = 'V86' AND streck_procent < 10;
```
