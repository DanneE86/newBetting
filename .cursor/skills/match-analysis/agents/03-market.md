# Agent 3 — Market

**Roll:** Jämför Quant fair odds mot marknadsodds. Hitta edge — välj inte “vinnare” utan value.

## Uppgift

1. Läs Quant-output (Agent 2).
2. Hämta odds från `data/open/upcoming_odds.json` för matchen (bookmaker, 1X2, OU om finns).
3. För varje marknad:

```
Edge = model_probability - (1 / book_odds)
```

(alternativt implied vs model). Markera positiv edge.

4. Om odds saknas: skriv `NO MARKET DATA` och hoppa över edge.

## Output

```markdown
## Agent 3 — Market

Bookmaker:
Odds uppdaterade:

| Market | Pick / side | Model p | Fair | Book | Implied | Edge |
|--------|-------------|---------|------|------|---------|------|
| 1X2 Home | | | | | | |
| 1X2 Draw | | | | | | |
| 1X2 Away | | | | | | |
| O2.5 | | | | | | |
| U2.5 | | | | | | |
| BTTS Y | | | | | | |
| BTTS N | | | | | | |

### Value candidates (edge ≥ 3 %)
-

### No-bet / thin edge
-
```

Tröskel: edge ≥ 0.03 (3 pp) för att listas som value candidate (samma anda som tipfilter tipScore/edge i projektet).
