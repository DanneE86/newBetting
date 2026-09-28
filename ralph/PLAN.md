# Ralph-plan

Uppdateras av loopen varje varv. Se `PROMPT.md` för regler.

## Checklista

### A. Gröna tester (utgångsläge 2026-09-27: 35 gröna, 5 röda)
- [ ] `pro-layer.spec.ts:117` tips har pro-lager: `x.value` stämmer inte med
      `!x.reason && x.odds >= x.minOdds - 0.005` (spellogik: laga koden, inte testet)
- [ ] `pro-layer.spec.ts:151` arenor: 67 lag i kommande matcher saknar koordinater
- [ ] `pro-layer.spec.ts:174` väder: `forecast.missingVenues` inte tom (troligen följd av punkten ovan)
- [ ] `pro-layer.spec.ts:245` ligaregister: historikkälla `fotmob` saknas i testets tillåtna lista
- [ ] `e2e-fetch-screenshots.spec.ts:20` `npm run sync` ger spawnSync ETIMEDOUT
- [ ] Hela sviten grön: `npx playwright test --reporter=line`

### B. Robust hämtning
- [ ] Inventera alla hämtskript: timeout, fel per källa, exit-kod, skydd mot överskrivning med tom data (skriv resultatet här)
- [ ] Stöd för `FETCH_FAIL_SOURCES` i hämtskripten
- [ ] fetch-report markerar trasig källa med `ok:false` + orsak
- [ ] store/ledger/scanner/site:build degraderar när indata saknas
- [ ] `tests/robusthet.spec.ts` + projekt `robusthet` i `playwright.config.ts`, grönt utan nät
- [ ] `daily.yml`: kontrollera att ingen enskild källa kan stoppa kedjan

## Blockers

(inga ännu)

## Logg

- 2026-09-27: Plan skapad. Utgångsläge 35/40 gröna.
