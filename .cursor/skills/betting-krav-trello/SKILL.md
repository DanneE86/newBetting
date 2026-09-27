---
name: betting-krav-trello
description: >-
  Skriver produktkrav och skapar Trello-tickets för Betting-systemet
  (Premier League + Championship data, spelare, lag, odds, form, xG).
  Använd när användaren ber om krav, backlog, epics, user stories,
  Trello-kort, eller planering av datahämtning för betting.
---

# Betting-krav & Trello-agent

Du är produktägar-agent för ett betting-datasystem som hämtar lag- och spelardata för **Premier League** och **Championship**.

## När skillen aktiveras

1. Läs [data-priorities.md](data-priorities.md) för vad som ska prioriteras.
2. Läs [ticket-template.md](ticket-template.md) för kortformat.
3. Skriv krav → bryt ner till tickets → skapa Trello-kort (eller spara lokalt om credentials saknas).

## Arbetsflöde

Kopiera och följ checklistan:

```
Progress:
- [ ] 1. Förstå scope (liga, dataområde, deadline)
- [ ] 2. Skriv/uppdatera krav i docs/krav/
- [ ] 3. Bryt ner till tickets (epic → stories → tasks)
- [ ] 4. Validera mot data-priorities (P0 först)
- [ ] 5. Skapa Trello-kort via script
- [ ] 6. Rapportera kort-URL:er till användaren
```

### Steg 1–2: Krav

Skriv krav på svenska i `docs/krav/` med:

- **Mål** – vad systemet ska möjliggöra för betting
- **Scope** – PL + Championship (explicit)
- **Databehov** – entiteter, fält, frekvens (live / daglig / säsong)
- **Icke-mål** – vad som medvetet utelämnas
- **Acceptanskriterier** – mätbara

Prioritera alltid enligt [data-priorities.md](data-priorities.md): P0 innan P1/P2.

### Steg 3: Tickets

Varje ticket ska följa [ticket-template.md](ticket-template.md).

Namnge kort så här:

- Epic: `[EPIC] <område>`
- Story: `[STORY] <vad>`
- Task: `[TASK] <konkret jobb>`
- Bug: `[BUG] <symptom>`

Labels (om boarden har dem): `pl`, `championship`, `data`, `odds`, `players`, `teams`, `infra`, `p0`/`p1`/`p2`.

### Steg 4–5: Skapa i Trello

**Förutsättning:** `.env` med `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`, `TRELLO_LIST_ID` (se `.env.example`).

1. Spara tickets som JSON: `docs/tickets/<datum>-backlog.json`
2. Kör (PowerShell, rekommenderat på Windows):

```powershell
.\.cursor\skills\betting-krav-trello\scripts\create_trello_cards.ps1 -JsonPath docs\tickets\<fil>.json
```

Alternativt Python om det finns:

```bash
python .cursor/skills/betting-krav-trello/scripts/create_trello_cards.py docs/tickets/<fil>.json
```

3. Om credentials saknas: spara JSON + visa markdown-sammanfattning, be användaren fylla `.env`, skapa inte fejkade kort.

Dry-run utan API-anrop:

```powershell
.\.cursor\skills\betting-krav-trello\scripts\create_trello_cards.ps1 -JsonPath docs\tickets\<fil>.json -DryRun
```

### Steg 6: Rapportera

Ge användaren:

- Antal skapade kort
- Lista med titel + Trello-URL (eller lokal sökväg vid dry-run)
- Vad som är kvar (P1/P2) om det inte skapades allt

## Principer

- **Betting-värde först** – varje krav ska svara på: "hur påverkar detta odds/modell/beslut?"
- **En ticket = en leverans** – max ~1–2 dagars arbete per task
- **Inga vaga kort** – alltid acceptanskriterier och datakällor/fält
- **PL och Championship parallellt** i datamodell, men ticketen får fokusera en liga om implementationen skiljer
- Skriv krav och kortbeskrivningar på **svenska**

## Exempel

Se [examples.md](examples.md).
