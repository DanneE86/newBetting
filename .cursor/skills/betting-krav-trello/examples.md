# Exempel

## Input från användare

> Vi behöver hämta skador för PL och Championship inför matchdag.

## Förväntat beteende

1. Skriver kort krav i `docs/krav/injuries.md` (mål, fält, sync).
2. Skapar tickets, t.ex.:
   - `[EPIC] Injuries & availability`
   - `[STORY] Synka injury-feed per liga`
   - `[TASK] Mappa API-fält till Injury-entitet`
   - `[TASK] Daglig job + matchdag-refresh`
3. Sparar JSON och kör `create_trello_cards.py`.
4. Returnerar kortlänkar.

## Bra vs dålig ticket

**Bra:** `[TASK] Spara opening + closing 1X2-odds per fixture` med acceptanskriterier för bookmaker, timestamps och PL+Championship.

**Dålig:** `Fix odds` utan fält, liga eller DoD.
