# Ralph-loop: gröna tester + robust hämtning

Teknik: [Ralph Wiggum](https://awesomeclaude.ai/ralph-wiggum). Du körs i en loop av
`scripts/ralph-iterate.ps1` (`npm run ralph`). Varje varv börjar med tom kontext:
allt du vet om läget finns i filerna, `git log` och testerna. Gör **ett** avgränsat
steg per varv, committa det och avsluta.

## Varje varv

1. Läs `ralph/PLAN.md` (checklista, blockers, logg) och `git log --oneline -15`.
2. Välj den **översta ej avbockade** punkten som inte står under Blockers.
3. Undersök, åtgärda, verifiera (kör relevant testprojekt, t.ex.
   `npx playwright test --project=pro-layer --reporter=line`).
4. Städa bort datafiler som testerna skrivit om men som inte hör till din åtgärd:
   `git status`, sedan `git checkout -- <fil>` för sådant (testerna kör hämtningar
   som ändrar `data/`).
5. Uppdatera `ralph/PLAN.md`: bocka av, lägg till nyupptäckta punkter, skriv en rad
   i Logg (datum, vad, resultat).
6. `git add` bara det du avsiktligt ändrat, `git commit` med svenskt meddelande i
   projektets stil (`Fix: ...`, `Test: ...`, `Robusthet: ...`).
7. Avsluta varvet. Börja inte på nästa punkt.

## Mål A: alla Playwright-tester gröna

`npx playwright test --reporter=line` ska ge 0 failed.

Regler:
- **Ett test som vaktar spellogik får inte försvagas för att bli grönt.** Det gäller
  värdeomdömen (Värde/Ej värde, minOdds/maxOdds, edge), devig, Kelly, CLV,
  avsparkstid, modell/ligaparametrar. Laga koden. Är det oklart om testet eller
  koden har rätt: skriv under Blockers med din analys och gå vidare.
- Ett test som bara hänger efter koden (t.ex. ny källa `fotmob` i ligaregistret)
  får uppdateras. Skriv i commit-meddelandet varför testet var inaktuellt.
- Saknad data (t.ex. arenakoordinater) fylls via befintliga hämtskript eller
  config-filer, inte genom att hårdkoda i testet.
- Tester som är beroende av nätet och som tar för lång tid (e2e `npm run sync` ger
  ETIMEDOUT) ska göras deterministiska (kortare/offline-variant, `test.slow()`,
  eller skippas med tydlig villkorad `test.skip` när nätet saknas). De ska fortfarande
  testa något meningsfullt.

## Mål B: en källa som ligger nere stoppar inte pipelinen

Kedjan i `.github/workflows/daily.yml` (fetch → OddsPortal → store → ledger → scanner
→ audit → stryktips → webbygge) ska gå hela vägen även om en enskild extern källa
svarar fel, timeout eller ger skräp.

Klart när:
- Varje hämtskript (`scripts/Fetch-*.ps1`, `scripts/fetch-*.mjs`) har timeout på
  nätanrop, fångar fel per källa, loggar tydligt och avslutar med exit 0 när minst
  befintlig data kan användas. Befintlig datafil skrivs **aldrig** över med tom
  eller trasig data.
- `data/open/fetch-report.json` (eller motsvarande) markerar trasig källa med
  `ok: false` och felorsak.
- `Update-BettingStore.ps1`, `Update-TipsLedger.ps1`, `daily-scanner.mjs` och
  `build-static-site.mjs` klarar att en indatafil saknas eller är äldre. De
  degraderar i stället för att krascha.
- Ett nytt Playwright-testprojekt `robusthet` (`tests/robusthet.spec.ts`) simulerar
  att en källa är nere, t.ex. via en miljövariabel som `FETCH_FAIL_SOURCES=understat,fpl`
  som skripten respekterar och som gör att den källan fallerar direkt. Testet visar
  exit 0, `ok:false` i rapporten och att store/tips byggs på befintlig data.
  Testet får inte kräva nätet.

## Får inte

- Pusha, byta till eller committa på `main`. Rör inte `git remote`.
- Ändra `.github/workflows/*` på annat sätt än att lägga till `continue-on-error`
  eller timeout där Mål B kräver det.
- Ändra hur tips visas: varje visat odds har ett Värde/Ej värde-omdöme, varje tips
  visar avsparkstid, inga insatsbelopp visas (flat 500 kr).
- Scrapa med inloggning, lägga in API-nycklar eller hemligheter i filer.
- Köra `npm run site` (publicerar till produktion). `npm run site:build` går bra.

## Fastnat

Om samma punkt misslyckats två varv i rad (se Logg): flytta den till Blockers med
vad du provat och varför det inte gick, och gå vidare.

## Klart

När varje punkt i `ralph/PLAN.md` är avbockad eller under Blockers och
`npx playwright test --reporter=line` ger 0 failed, skriv som sista rad, ensam på raden:

COMPLETE
