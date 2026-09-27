---
name: ralph-tickets
description: >-
  Ralph Wiggum-style iterative loop for Betting-projektet. Anvand nar anvandaren
  ber om ralph, loopa, fixa alla tickets, eller kor tills COMPLETE.
---

# Ralph tickets-loop

Folj [PROMPT.md](../../../PROMPT.md) (projektroten).

## Installerat i projektet
- `npm run ralph` → `scripts/ralph-iterate.ps1`
- Technique ref: https://awesomeclaude.ai/ralph-wiggum

## Workflow
1. Las PROMPT.md checklist
2. Implementera nasta saknade punkt
3. Kor sync + playwright
4. Uppdatera Trello (comment/move) nar klart
5. Upprepa tills COMPLETE

## Max iterations
Anvand `--MaxIterations` (default 8). Vid stuck: dokumentera blocker i `data/open/fetch-report.json`.
