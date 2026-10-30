# Stryktipset — referens

## Produkter

| Produkt | Typiskt | Format |
|---------|---------|--------|
| Stryktipset | Lördag | 13 matcher, 1/X/2 |
| Europatipset | Ofta söndag/andra dagar | 13 matcher, 1/X/2 |
| Topptipset | Färre matcher | Annan struktur — bekräfta antal innan tips |

Radpris historiskt 1 kr/rad på klassiska spelet; bekräfta om användaren nämner annat.

## Systemmatte

- **Enkelrad:** 13 enkla tecken = 1 rad.
- **Halvgardering:** två tecken på en match → ×2 rader.
- **Helgardering:** 1X2 → ×3 rader.

Exempel: 10 säkra + 2 halv + 1 hel = 1 × 2 × 2 × 3 = **12 rader**.

Kostnad ≈ rader × radpris.

## Streckprocent

- Streck = hur stor andel av insatserna som ligger på 1, X respektive 2.
- Högt streck på en utgång → låg utdelning om den går in (många delar på potten).
- Modell ≠ streck = intressant gardering eller medvetet "emot folket".
- Använd streck bara om användaren ger dem eller de finns i underlag — hitta inte på siffror.

## När du ska gardera

Gardera oftare vid:

- Favorit under ~55 % i din modell
- Tungt streck (>70 %) på en sida du inte litar på lika starkt
- Jämna lag / nyckelspelare borta / rotation
- Derbyn och "cup-häng"

Gardera mer sällan vid:

- Tydlig klasskillnad + frisk XI + stabil form
- Både modell och marknad (odds) pekar samma håll med HIGH confidence

## Filkuponger (fasta regler sedan 2026-10-11)

- **Utdelning för 13 rätt** per rad = (26 % × omsättning + jackpot) / (omsättning × radens streckprodukt + 1), med verklig omsättning (minst den typiska: 25 milj kr Stryktipset, 10 milj kr Europatipset).
- **A:** de 500 raderna med bäst chans × utdelning^w med minst 30 000 kr (`FILE_RULES.utdVikt`: Stryktipset 0,5, Europatipset 0 – sedan 2026-10-30). B och C borttagna 2026-10-25. **Spikar:** högst 3 favoriter med ≥ 55 % på data + 1 skrällspik.
- Filen till Svenska Spels Egna rader: första raden spelets namn, sedan en rad per kupongrad: `E,1,X,2,…` (13 tecken).
- Inga Gambling Cabin-regler (färger, tecken, utdelningsband, länkar) – borttagna 2026-10-11 på användarens begäran.
- **Vinstklasser i praktiken:** 10 rätt ger ofta 0 kr och 11 rätt ofta under 100 kr. Det är 13 (och 12) som räknas.

## Lärdomar från backtest

Allt finns i [docs/analys/stryktips-lardomar.md](../../../docs/analys/stryktips-lardomar.md) (17 omgångar, 221 matcher). Uppdatera den filen efter varje nytt backtest, även när en idé förkastas.

## Fallgropar

1. **13 favoriter** — sällan bra pott; ofta många med samma rad.
2. **För många helgarderingar** — budget sprängs, ingen edge i urvalet.
3. **Ignorera oavgjort** — ett otäckt X fäller hela 13-raden, och folket underspelar X (≈ 23 % streck mot ≈ 26–29 % utfall).
4. **Övertro på senaste 5 matcherna** — balansera med styrka (Elo/xG) och odds.
5. **Påhittad kupong** — tipsa aldrig matcher som inte är bekräftade som omgångens 13.
6. **Överanpassning** — dra inga regelslutsatser från < 12 omgångar (5 omgångar hösten 2026 hade 37 % kryss; våren 26 %).
7. **Övertro på egen modell** — oddsen var bättre än lagmodellen i backtestet; modellvikt 10 %.

## Koppling till match-analysis

Använd full `match-analysis`-pipeline när:

- Användaren pekar ut 1–3 nyckelmatcher
- En match avgör om den ska vara Säker vs Halv
- Streck/modell skiljer sig kraftigt och beloppet är stort

Annars: lättviktig bedömning (odds + store + kort motivering) för alla 13.
