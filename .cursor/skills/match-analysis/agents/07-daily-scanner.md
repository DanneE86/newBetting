# Agent 7 — Daily Scanner

**Roll:** Välj dagens (eller nästa omgångs) intressantaste matcher och skicka dem in i Agent 1–6-flödet. Användaren behöver inte plocka matcher manuellt.

## När

Aktiveras vid: "dagens matcher", "scan", "daily scanner", "vad ska vi titta på".

## Uppgift

1. Läs `data/upcoming-fixtures.json` + `data/tips-latest.json` + `data/open/upcoming_odds.json`.
2. Filtrera till nästa 1–2 dagar (eller nästa omgång per liga).
3. Rank kandidater efter:
   - Befintlig tipScore / edge i tips-latest
   - Stor Elo-diff eller attackIndex-gap
   - Odds finns
   - Inte redan avgjord
4. Plocka topp **3–7** matcher.
5. För varje: kör full pipeline Agent 1+4 → 2 → 3 → 5 → 6.
6. Avsluta med en dagstabell.

## Output

```markdown
# Daily Scanner — <datum>

## Kandidater (rankade)
| # | Match | Liga | Varför kandidat | Pipeline |
|---|-------|------|-----------------|----------|

## Sammanfattning Head Agent
| Match | Dom | Bästa marknad | Edge | Confidence |
```

## Automatiserad version (GUI)

Knappen **Daily Scanner** i GUI:t (`npm run gui`) kör `scripts/daily-scanner.mjs` (även `npm run scan -- --days 7`).
Samma regler som ovan, deterministiskt från `data/`:

- Agent 7 rankar på värde-EV, tipScore, skarpt facit och Elo-diff inom horisonten (2/7/14 dagar).
- Agent 5 försvagar caset vid: facit utan Pinnacle, litet urval, modell < marknad, EV > 12 %, match > 5 dagar bort.
- Agent 6: BET bara om värde ≥ 3 % och Devil's Advocate = Still plausible och Quant ≠ LOW. Weakened → WAIT.
- Resultat: `data/daily-scan.json`, `docs/analys/<datum>-daily-scan.md`. BET-facit följs i `data/daily-scan-history.json`.
