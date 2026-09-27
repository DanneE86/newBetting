# Ticket-mall

## Trello-kort – beskrivningsformat

```markdown
## Sammanfattning
<1–2 meningar: vad och varför för betting>

## Typ
Epic | Story | Task | Bug

## Prioritet
P0 | P1 | P2

## Liga
Premier League | Championship | Båda

## Databehov
- Entitet/fält: ...
- Källa (API): ...
- Sync-frekvens: ...

## Acceptanskriterier
- [ ] ...
- [ ] ...
- [ ] Data sparas med tydlig primary key och updated_at

## Beroenden
- Blockeras av: ...
- Blockerar: ...

## Definition of Done
- [ ] Kod/merge eller dokumenterat resultat
- [ ] Verifierat med minst 1 PL- och 1 Championship-exempel (om data)
```

## JSON för scriptet

`docs/tickets/*.json` ska vara en lista:

```json
[
  {
    "name": "[STORY] Hämta PL- och Championship-lag",
    "desc": "## Sammanfattning\n...\n",
    "labels": ["data", "teams", "p0"],
    "idList": null
  }
]
```

- `name` (krav): korttitel
- `desc` (krav): markdown-beskrivning enligt mallen ovan
- `labels` (valfritt): skapas/matchas mot board-labels om de finns
- `idList` (valfritt): override av `TRELLO_LIST_ID`
