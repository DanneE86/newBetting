# Exempel — Stryktipset

## Exempel 1: Veckans kupong

**Användare:**
Bygg Stryktipset i helgen.

**Agent:** Läser `data/stryktipset.json` (kör `node scripts/fetch-stryktipset.mjs` om den är gammal) och visar system A (t.ex. 382 rader, minst 5-3-2, utdelning ≥ 34 900 kr) och system B (t.ex. 389 rader, minst 4-3-3, 1 gemensam spik). Båda har förifyllda Gambling Cabin-länkar. Tabell med A/B-tecken, P och folkets streck. Påminner om att systemen sparas och följs upp mot facit.

## Exempel 1b: Backtest

**Användare:**
Hur hade det gått de senaste omgångarna?

**Agent:** Kör `node scripts/backtest-stryktipset.mjs` (och vid behov `--to <datum> --count 12`), jämför med [lärdomsfilen](../../../docs/analys/stryktips-lardomar.md), redovisar chans till 13 rätt, rader med 11+ rätt och netto. Skriver in nya lärdomar i filen.

## Exempel 2: Med streck

**Användare:**  
Samma kupong + streck. Match 7 har 82 % på 1.

**Agent:** Om modellen har P(1)≈55 % och upset-risk medel → Halv `1X` eller `12`, lyft fram "emot streck" under Streck/value.

## Exempel 3: Bara enkelrad

**Användare:**  
Ge en enkelrad.

**Agent:** Ett tecken per match (högsta P), tydlig varning att enkelrad har hög varians, lista 2–3 matcher där du egentligen velat gardera.

## Exempel 4: Saknad kupong

**Användare:**  
Tipsar du Stryktipset?

**Agent:** Be om de 13 matcherna (eller omgångsnummer + lista). Tipsa inte påhittad kupong.
