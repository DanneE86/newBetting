# Ralph Wiggum loop — fixa alla Betting-tickets

Technique: iterative loop until COMPLETE ([Ralph Wiggum](https://awesomeclaude.ai/ralph-wiggum)).

## Goal

Close/implement every open backlog item for local PL+Championship betting tips (1X2, BTTS, OU2.5).

## Tickets checklist (must all be true)

### Done when verified
- [ ] Lokal store `data/betting-store.json` (matchCount > 500)
- [ ] CSV sync PL+CH (raw E0/E1)
- [ ] openfootball fixtures + `upcoming-fixtures.json`
- [ ] Understat xG EPL via getLeagueData
- [ ] Tipsmotor + tips-latest.*
- [ ] Edge boards BTTS/OU/form
- [ ] Playwright tests green (`npx playwright test`)
- [ ] H2H script `scripts/Get-H2H.ps1`
- [ ] Ralph scripts: `PROMPT.md`, `scripts/ralph-iterate.ps1`, `npm run ralph`
- [ ] FPL availability (PL injuries/doubtful) in store + tips adjustment
- [ ] Squads/players snapshot from FPL (PL)
- [ ] Championship: documented no FPL/Understat — form/odds only
- [ ] Trello: completed cards commented + moved to Done/Senare

## Each iteration
1. `npm run sync` (or fetch pieces that fail)
2. `npm run xg` if understat missing
3. `npm run fpl` (availability)
4. `npm run store`
5. `npx playwright test`
6. `npm run trello:close-done` when criteria met
7. Fix failures, repeat

## Stuck rules
- Prefer open APIs (football-data.co.uk, openfootball, Understat AJAX, FPL)
- No bookmaker login/scrape
- If Championship injuries impossible openly: document blocker and mark ticket DONE with note

## Completion promise

When checklist is satisfied and tests pass, output exactly:

COMPLETE
