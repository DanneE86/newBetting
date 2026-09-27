---
name: match-analysis
description: >-
  Kör sexstegs matchanalys (Football + Research → Quant → Market →
  Devil's Advocate → Head Agent) och valfri Daily Scanner. Använd när
  användaren ber om analysera match, quant, sannolikheter, fair odds,
  value bet, dagens matcher, eller multi-agent betting-analys.
---

# Match Analysis Pipeline

Flöde (alltid i denna ordning):

```
Match → Agent 1 + Agent 4 → Agent 2 → Agent 3 → Agent 5 → Agent 6
```

Valfritt först: **Agent 7 Daily Scanner** väljer kandidater → samma flöde per match.

## Progress

```
Progress:
- [ ] 0. (Valfritt) Agent 7 – Daily Scanner
- [ ] 1. Agent 1 – Football Data
- [ ] 4. Agent 4 – Research (parallellt med 1)
- [ ] 2. Agent 2 – QUANT MODEL
- [ ] 3. Agent 3 – Market
- [ ] 5. Agent 5 – Devil's Advocate
- [ ] 6. Agent 6 – Head Agent (slutresultat till användaren)
```

## Lokala datakällor (läs innan du gissar)

| Fil | Innehåll |
|-----|----------|
| `data/betting-store.json` | Lagform, Elo, xG, availability, playerAttack |
| `data/open/player_stats.json` | Spelarstatistik PL/LL/SA/BL/L1/ED/CH |
| `data/open/team_player_attack.json` | Lag-attackindex |
| `data/open/understat_*_xg.json` | Lag-xG (främst EPL) |
| `data/open/espn_lineups.json` | Elvor / status |
| `data/open/upcoming_odds.json` | Marknadsodds |
| `data/open/fpl_availability.json` | PL skador/availability |
| `data/open/clubelo_ratings.json` | ClubElo |
| `data/tips-latest.json` | Befintliga modelltips |
| `data/upcoming-fixtures.json` | Kommande matcher |

**Hitta inte på statistik.** Saknas data → sänk confidence och skriv det explicit.

## Agentfiler

Läs och följ varje agents instruktion i ordning:

1. [agents/01-football.md](agents/01-football.md)
2. [agents/04-research.md](agents/04-research.md) *(kör parallellt med 01)*
3. [agents/02-quant.md](agents/02-quant.md)
4. [agents/03-market.md](agents/03-market.md)
5. [agents/05-devils-advocate.md](agents/05-devils-advocate.md)
6. [agents/06-head.md](agents/06-head.md)
7. [agents/07-daily-scanner.md](agents/07-daily-scanner.md) *(endast vid "dagens matcher" / scan)*

## Regler

- Agent 2 får **inte** välja bets på magkänsla — bara sannolikheter och fair odds.
- Agent 3 jämför fair odds mot **aktuella** odds i `upcoming_odds.json` (eller ange saknas).
- Agent 5 ska aktivt försöka slå hål på caset.
- Endast Agent 6 ger slutrekommendation till användaren (på svenska om användaren skriver svenska).
- Spara full analys under `docs/analys/<datum>-<hem>-vs-<bort>.md` när analysen är klar.
