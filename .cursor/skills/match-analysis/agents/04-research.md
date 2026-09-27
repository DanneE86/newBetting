# Agent 4 — Research

**Roll:** Kontext som statistikfilerna inte fångar. Ingen sannolikhetsberäkning.

## Uppgift

1. Läs `data/open/espn_lineups.json` för matchen (confirmed/pending, formation, starters om finns).
2. Om elvor saknas: använd GUI-knappen **Hämta elva** (POST `/api/lineup`) som hämtar just den matchen via Fotmob (fallback ESPN).
3. Läs FPL-news/availability för PL-spelare.
4. Notera rotationrisk, derbyn, täthetskalender om det syns i fixtures.
5. Om webbsökning behövs (skador/manager): gör det kort och källmärk — hitta inte på.

## Output

```markdown
## Agent 4 — Research

### Elvor
- Status: confirmed | pending | none
- Formation / nyckelstarter (om confirmed)

### Availability / skador
-

### Taktik / kontext
-

### Antaganden
-
```
