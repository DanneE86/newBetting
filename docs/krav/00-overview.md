# Betting-krav v1 (aktuell)

## Mal
Lokal, uppdaterbar datastore + tips for PL och Championship pa marknaderna **1X2**, **BTTS**, **Over/Under 2.5**.

## Oppna kallor
- football-data.co.uk CSV (E0/E1) - resultat + 1X2 + O/U odds
- openfootball/football.json - fixtures/schema
- Understat - xG via Playwright fallback om HTML saknar teamsData

## Kommandon
```powershell
npm run sync          # fetch + store
npm test              # playwright
npm run ralph         # iterativ loop tills COMPLETE
.\scripts\Get-H2H.ps1 -HomeTeam Arsenal -AwayTeam Chelsea -League PL
```

## Masterfiler
- `data/betting-store.json` - all match/lagdata
- `data/tips-latest.md` - basta tips
- `data/upcoming-fixtures.json` - kommande matcher
- `PROMPT.md` - Ralph completion-kriterier

## Nya lager (2026-09-25)
- Elo-styrka + form for 1X2
- Shot-based xG-proxy for Championship
- Edge-filter (tipScore/confidence/value)
- Tips-ledger `data/tips-ledger.json` (append + settle)
- Optional live odds: `THE_ODDS_API_KEY` i `.env` + `npm run odds`

## Pro-lager (2026-09-26) - se `01-proffs-research.md`
- `scripts/pro-layer.mjs` + `scripts/pro/lib.mjs` (kors automatiskt i `npm run store`, eller `npm run pro`)
- Closing odds (Pinnacle/Betfair/snitt) i store -> CLV i `tips-ledger.json` (`liveClv`)
- Dixon-Coles, devig, 1/4 Kelly (tak 2 %), vilodagar, `data/open/referees.json`
- Utvardering: `data/reports/pro-evaluation.json` (DC ensam slar inte Pinnacle; konsensus + basta pris ger positiv CLV)
- Live value bets: `konsensus` om Pinnacle finns i odds (kraver `THE_ODDS_API_KEY`), annars `marketAnchored`
- Tester: `npx playwright test --project=pro-layer`

## Arenor + vader (2026-09-26)
- `npm run venues`: arena + koordinater for 170 lag (Wikipedia -> Wikidata P115/P625) -> `data/open/venues.json`
  - Lagnamn -> Wikipedia-artikel: `scripts/weather/teams.mjs` (nya lag/alias laggs till har)
  - Manuella rattelser: `data/open/venue-overrides.json`
- `npm run weather`: Open-Meteo (gratis, ingen nyckel)
  - prognos BARA for matcher som spelas idag (vid avspark) -> `data/open/weather_forecast.json` -> `tips[].pro.weather`
  - historik (ERA5) per spelad match bara pa begaran: `npm run weather:history` (cachad i `data/open/weather_history.json`)
- Vadereffekt mot Pinnacle closing O/U: `pro-evaluation.json` -> `weatherEffect`

## 21 ligor (2026-09-27) - register `config/leagues.json`
- Grupper i GUI (klick fäller ut turneringar): England (PL, CH), Europa (CL, EL, ECL), Sverige (AS, SE2),
  Tyskland (BL, BL2), Italien (SA, SB), Brasilien (BR, BR2), Spanien, Frankrike, Nederländerna, Norge, Danmark, Portugal, Grekland, Kroatien
- Historik per liga (`history` i registret):
  - `fd-main`: football-data mmz4281 (PL, CH, LL, SA, SB, BL, BL2, L1, ED, PT, GR) - i Update-BettingStore.ps1 + Fetch-OpenSources.ps1
  - `fd-new`: football-data/new (BR, AS, NO, DK) - sasong "2026" / "2026/2027" -> "2026/27"
  - `espn`: ESPN-resultat (BR2), `tsdb`: TheSportsDB omgangar (HR)
  - `none`: bara marknadsodds (CL, EL, ECL, SE2) -> marknadstips i pro-lagret
- `npm run leagues` (`scripts/fetch-extra-leagues.mjs`): historik + ESPN/TSDB-spelschema, och oversatter ALLA lagnamn i
  `upcoming-fixtures.json` till historikens namn (annars inga modelltips)
- Odds: `npm run odds` hamtar bara ligor med matcher inom 14 dagar (spar kvoten), `ODDS_ALL=1` for alla.
  Kvot slut / ingen nyckel -> `scripts/fetch-odds-fallback.mjs` (football-data fixtures, Betfair Exchange som facit)
- Vardeomdome: Pinnacle (annars Betfair Exchange) utan marginal som facit, basta pris hos svenska bolag, EV >= 3 %, odds <= 5
- Arenor: 450 lag - manuell lista + automatisk Wikipedia/Wikidata-uppslagning (land kontrolleras) + stad som reserv

## 35 ligor (2026-09-27, forts.)
- Nya: Japan (J1, J2, J3), Sydkorea (K League 1), Mexiko (Liga MX), USA (MLS), Sverige (Div 1 Norra/Södra),
  Tjeckien, Chile, Colombia, Argentina, Danmark (1. division), Norge (OBOS-ligaen)
- Kallor: football-data/new (JPN, MEX, USA, ARG), ESPN (Chile, Colombia), TheSportsDB (J2, J3, K1, Div 1, Tjeckien, DK2, NO2)
  - TheSportsDB: sasongsformat kanns av automatiskt ("2026" / "2026-2027"), gratisnivan ~30 anrop/min
- Store laser ligalistor fran registret (`$AllLeagues`, `$FdNewLeagues`) - nya ligor laggs bara till i `config/leagues.json`
- GUI: lander/grupper i bokstavsordning (svensk sortering)

## bolldata.se (Allsvenskan)
- `npx playwright test --project=bolldata` (`tests/bolldata.spec.ts`), kors aven i Fetch-OpenSources
- robots.txt: Crawl-delay 100 -> 100 s mellan anrop, ra HTML cachas 20 h i `data/raw/bolldata_*.html`
- `data/open/bolldata_allsvenskan.json`: 16 lag (37 tabeller: xG/xGA, hemma/borta, form, skott ...) + topplistor spelare
- Store: lagens xG/xGA per match -> `teams[].xg` (source "bolldata") for Allsvenskan i stallet for skott-proxy

## Oddsportal
- Hamtas INTE: robots.txt forbjuder just oddssidorna/flodena (`*/match-event/*`, `ajax-*`, `feed`). Odds kommer fran
  The Odds API (Pinnacle + svenska bolag) och football-data (closing odds) - lagliga kallor med samma data.

## Kvar / begransningar
- Kroatien (HR): inga odds i nagon kalla -> bara modelltips, inget vardeomdome
- Superettan (SE2): ingen historik och ingen Pinnacle -> marknadstips, "Kraver skarpa odds"
- Bekraftade elvor bara PL/CH/BR (ESPN); spelarfranvaro bara PL (FPL)
