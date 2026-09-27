# Dataprioriteringar – PL & Championship (betting)

Scope: **Premier League** + **EFL Championship**. Fokus: det som mest påverkar betting-beslut och modeller.

## P0 – Måste ha (bygg först)

| Område | Vad | Varför för betting |
|--------|-----|-------------------|
| Lag & ligor | id, namn, liga, säsong | Grundnyckel för allt |
| Matcher / fixtures | kickoff, hemma/borta, status, arena | Timing, marknader, scheduling |
| Resultat | slutresultat, halvtid, mål | Historik, form, backtest |
| Tabell / standings | poäng, GD, form-sträng | Kontext, motivation (topp/botten) |
| Odds (pre-match) | 1X2, Over/Under 2.5, BTTS; opening + closing om möjligt | Edge vs marknad, CLV |
| Lagform | senaste 5–10, hemma/borta separat | Primär signal före match |
| Skador / avstängningar | spelare, status, förväntad återkomst | Lineup-chock, odds-rörelse |
| Spelartrupp | id, lag, position, status | Koppla skador & spelarmarknader |

## P1 – Starkt värde (direkt efter P0)

| Område | Vad | Varför |
|--------|-----|--------|
| Matchstatistik | skott, SoT, possession, corners, cards, fouls | Underliggande kvalitet vs scoreline |
| xG / xGA | per match och säsong (lag) | Bättre än råa mål för modellering |
| Spelarstatistik | mål, assists, minuter, skott, kort, xG/xA | Spelarmarknader, "key man"-påverkan |
| Lineups | startelva, formation (bekräftad + expected om tillgänglig) | Sent edge före kickoff |
| H2H | historik mellan samma lag | Komplement till form (inte ensam signal) |
| Lag säsongsstats | GF/GA, clean sheets, BTTS-frekvens, home/away splits | Priorer för O/U, BTTS, AH |

## P2 – Nice to have

| Område | Vad | Varför |
|--------|-----|--------|
| Domare | kort/straff-tendenser | Cards/penalties-marknader |
| Odds fler marknader | AH, corners, cards, player props | Djupare modeller |
| Schema-belastning | dagar sedan senaste match, cups | Fatigue-proxy |
| Transferfönster | in/ut, lån | Tidig säsong / januari-edge |
| Väder | vid kickoff | Låg prioritet, marginellt |

## Entiteter (minimalt dataschema)

```
League { id, name, country, type }          # PL, Championship
Season { id, league_id, start, end, current }
Team { id, name, short_name, league_id, ... }
Player { id, name, position, team_id, nationality, birth_date }
Fixture { id, season_id, home_id, away_id, kickoff, status, venue }
FixtureResult { fixture_id, home_goals, away_goals, ht_home, ht_away }
Standing { season_id, team_id, played, pts, gf, ga, form, rank }
TeamMatchStats { fixture_id, team_id, shots, sot, xg, corners, ... }
PlayerMatchStats { fixture_id, player_id, minutes, goals, assists, xg, ... }
Injury { player_id, team_id, type, start, end_expected, status }
OddsSnapshot { fixture_id, bookmaker, market, selection, price, captured_at }
Lineup { fixture_id, team_id, formation, players[], is_confirmed }
```

## Sync-frekvens (kravriktlinjer)

| Data | Frekvens |
|------|----------|
| Fixtures / standings / injuries | minst 1×/dag; oftare matchdag |
| Odds | flera gånger/dag + nära kickoff |
| Lineups | matchdag (expected → confirmed) |
| Match/player stats + xG | efter match (när tillgängligt) |
| Squads | veckovis + vid transfers |

## Explicit icke-mål (initialt)

- Live in-play trading-motor
- Alla världsligor
- Automatisk bet-placering hos bookmakers
- Tipster-UI innan datalagret är stabilt

## Ticket-ordning (rekommenderad epic-sekvens)

1. Infra & API-klient (auth, rate limit, lagring)
2. Ligor / säsonger / lag
3. Fixtures + resultat + standings
4. Spelare / trupper
5. Injuries
6. Odds P0-marknader
7. Form & home/away aggregates
8. Matchstats + xG
9. Lineups
10. Spelarstats + H2H
