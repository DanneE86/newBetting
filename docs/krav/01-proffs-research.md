# Hur betting-proffs jobbar – research (2026-09-26)

Sammanställning från webben om hur professionella spelare/syndikat arbetar, vilken data de
använder, och vad det betyder för det här projektet (PL + Championship, 1X2 / BTTS / O/U 2.5).

---

## 1. Kärnprinciperna

| Princip | Vad proffsen gör |
|---|---|
| **Egen sannolikhet vs marknadens** | Räknar fram egna odds med en modell och spelar bara när bookmakerns pris är högre än det egna "fair price". (Starlizard/Tony Bloom: jämför egna odds med bookies, satsar på gapet.) |
| **CLV = huvudmåttet** | Mäter sig mot *closing line* (sista oddset innan avspark), inte mot vinst/förlust. Slår man stängningsoddset konsekvent har man en edge. |
| **Pinnacle som facit** | Pinnacles closing odds anses vara de mest korrekta (höga limits, låg marginal, tar emot skarpa spelare). Används som benchmark för "sann sannolikhet". |
| **Ta bort marginalen (devig)** | Oddsen räknas om till sannolikheter och bookmakerns marginal skalas bort innan jämförelse. |
| **Line shopping** | Konton hos många bolag, tar alltid bästa pris. Mjuka bolag följer skarpa bolag med fördröjning → värde uppstår i glappet. |
| **Fraktionell Kelly** | Insats ∝ edge, men bara ¼–½ Kelly för att skydda mot modellfel. Sällan över 1–3 % av bankrullen per spel. |
| **Allt loggas** | Varje spel: marknad, odds, insats, closing odds, resultat. Uppföljning per liga/marknad/speltyp. |

### CLV i siffror
- football-data.co.uk analyserade ~88 000 Pinnacle-oddspar (2012–2016): förhållandet
  `mitt odds / closing odds` förutsäger förväntad avkastning med lutning ≈ **1.00**.
  Ex: tog 2.50, stängde 2.00 → förväntad edge ≈ 25 %.
- CLV har mycket lägre varians än P/L (std ≈ 0.1 mot ≈ 1.0 för jämna odds) → **redan ~50 spel**
  kan ge en signal, medan P/L kräver tusentals spel (Buchdahl).
- Forskning (Kaunitz m.fl., arXiv 1710.02824): att bara jämföra ett bolags odds mot
  *konsensus/genomsnitt av marknaden* gav vinst i 10 års simulering + 5 månader riktiga pengar
  – men bolagen **begränsade kontona** snabbt. Räkna med limiteringar hos "mjuka" bolag.

### Devig – vilken metod?
penaltyblog testade 7 metoder på PL 2024/25 (RPS, lägre = bättre):

| Metod | RPS |
|---|---|
| Multiplicative (proportionell) | 0.19724 |
| Logarithmic / Odds ratio | 0.19730 |
| Shin | 0.19731 |
| Additive | 0.19736 |

Skillnaderna är försumbara i effektiva marknader → **multiplicative räcker** för 1X2 och O/U.
Power/Shin hanterar favorit–longshot-bias bättre och kan vara värt på höga odds.

---

## 2. Vilken data proffsen vill ha

### A. Odds (viktigast)
- **Öppnings-, löpande och closing odds** – helst från Pinnacle/Betfair Exchange + snitt/max marknad.
- **Oddsrörelse** över tid (vilka matcher "droppar" hos skarpa bolag).
- Historiska odds för backtesting.

### B. Prestationsdata (modellinput)
- **Mål för/emot** med tidsviktning (Dixon–Coles: exponentiell decay, nyare matcher väger mer).
- **xG / xGA** (Understat m.fl.) – bättre prediktor än faktiska mål.
- **Skott, skott på mål, hörnor** – proxy för xG där xG saknas.
- **Hemma/borta-styrka** separat för anfall och försvar.
- **Elo/ratingsystem** (t.ex. ClubElo) för lagstyrka över säsonger.

### C. Kontext
- **Lagnytt & startelvor** – bekräftad elva kan flytta priset på minuter (nyckelanfallare/mittbackar).
- **Skador/avstängningar** och vilka spelare som saknas (vägt efter spelarens värde).
- **Vila & matchtäthet** – dagar sedan förra matchen, 3 matcher på 7–8 dagar, resor, Europaspel.
- **Domare** – kortsnitt (4 vs 7+ gula/match), påverkar kortmarknader och spelflyt.
- **Väder / planförhållanden** – vind, nederbörd (Starlizard spårar tusentals variabler, bl.a. detta).
- **Motivation / tabelläge** – nedflyttningsstrid, inget att spela för, tränarbyten.

### D. Egen historik
- Bet-ledger med: tidpunkt, bolag, odds tagna, **closing odds**, modellens sannolikhet, edge, insats, resultat.

---

## 3. Modellen proffsen typiskt använder (fotboll)

1. **Poisson / Dixon–Coles**: attack- och försvarsparametrar per lag + hemmafördel,
   korrigering för låga resultat (0-0, 1-0, 0-1, 1-1) och tidsdecay.
2. Ger en **resultatmatris** → härleder 1X2, BTTS, O/U 2.5, AH från samma matris (konsistent).
3. Justera för lagnytt/skador/vila.
4. Jämför mot devig:ade marknadsodds → spela bara om edge > tröskel (t.ex. 2–5 %).
5. Kelly-andel → insats.
6. Efter match: logga closing odds → CLV → utvärdera modellen (RPS/Brier + CLV).

Dixon & Pope (2004) visade att en modifierad Dixon–Coles kunde ge vinst mot publicerade odds.

---

## 4. Gap-analys mot det här projektet

| Proffsens behov | Status i projektet | Förslag |
|---|---|---|
| Closing odds | **Saknas.** football-data CSV har redan (verifierat i `data/raw`) `PSCH/PSCD/PSCA` (Pinnacle closing 1X2), `PC>2.5/PC<2.5` (Pinnacle closing O/U), `BFECH…` (Betfair Exchange closing), `AvgCH…`, `MaxCH…` | Läs in closing-kolumnerna i `Update-BettingStore.ps1` |
| CLV-uppföljning | Saknas (ingen `clv` i scripts) | Lägg till `closingOdds` + `clv` i `tips-ledger.json` vid settle |
| Devig | Oklart/saknas | Multiplicative devig av marknadsodds innan edge räknas |
| Modell | Elo + form + xG-proxy | Lägg till Dixon–Coles-matris → 1X2/BTTS/OU ur samma modell |
| Tidsviktning | – | Exponentiell decay (halveringstid ~ ½ säsong) |
| Staking | Saknas | ¼ Kelly, tak 2–3 % av bankrulle |
| Lagnytt/skador | FPL (bara PL) | Behåll; Championship förblir blocker |
| Vila/matchtäthet | Saknas | Räkna vilodagar från fixtures (gratis, redan i datan) |
| Domare | Kolumn `Referee` finns i CSV | Spara domarens kortsnitt (relevant om kortmarknader läggs till) |
| Modellutvärdering | Playwright-tester av data | Lägg till RPS/Brier + CLV-rapport per marknad |

### Prioritet (störst nytta / minst jobb)
1. **Closing odds + CLV i ledgern** – finns redan gratis i CSV:erna, blir projektets sanna facit.
2. **Devig + edge-tröskel** mot Pinnacle/snitt-odds.
3. **Dixon–Coles-matris** för konsistenta 1X2/BTTS/OU-sannolikheter.
4. **Vilodagar** som feature.
5. **Fraktionell Kelly** i tipsrapporten.

---

## 5. Varningar
- Marknaderna i PL är mycket effektiva – edge är ofta 1–3 %, lätt att överskatta.
- Vinnande konton begränsas av mjuka bolag.
- Utvärdera på CLV och RPS, inte på kort vinstsvit.

---

## Källor
- [VSiN – Closing Line Value](https://vsin.com/how-to-bet/the-importance-of-closing-line-value/)
- [football-data.co.uk – The Efficiency of the Pinnacle Closing Line](https://www.football-data.co.uk/blog/pinnacle_efficiency.php)
- [football-data.co.uk – notes.txt (kolumnkoder)](https://www.football-data.co.uk/notes.txt)
- [Pinnacle Odds Dropper – CLV demystified (Joseph Buchdahl)](https://www.pinnacleoddsdropper.com/blog/closing-line-value--clv-demystified-by-expert-joseph-buchdahl)
- [Kaunitz et al. – Beating the bookies with their own numbers (arXiv)](https://arxiv.org/abs/1710.02824)
- [penaltyblog – From Biased Odds to Fair Probabilities](https://pena.lt/y/2025/09/14/from-biased-odds-to-fair-probabilities/)
- [Bet Hero – Devigging methods](https://betherosports.com/blog/devigging-methods-explained)
- [Bet Hero – How to use Pinnacle](https://betherosports.com/blog/how-to-use-pinnacle)
- [dashee87 – Dixon-Coles and Time-Weighting](https://dashee87.github.io/football/python/predicting-football-results-with-statistical-modelling-dixon-coles-and-time-weighting/)
- [penaltyblog – Dixon and Coles in Python](https://pena.lt/y/2021/06/24/predicting-football-results-using-python-and-dixon-and-coles/)
- [Wikipedia – Statistical association football predictions](https://en.wikipedia.org/wiki/Statistical_association_football_predictions)
- [Wikipedia – Tony Bloom](https://en.wikipedia.org/wiki/Tony_Bloom)
- [The Esk – Analysis of Starlizard](https://theesk.org/2026/04/09/anthony-grant-bloom-analysis-of-starlizard-the-brighton-model-and-the-legal-challenges-to-professional-gambling-integrity/)
- [Bet Hero – Kelly criterion](https://betherosports.com/blog/kelly-criterion-sports-betting)
- [BetResearcher – Bankroll management](https://betresearcher.com/guides/sports-betting-bankroll-management/)
- [PerformanceOdds – Fixture dynamics](https://www.performanceodds.com/betting-tricks/football-fixture-dynamics-timing-load-and-performance-variance/)
- [WinFullTime – Pro framework](https://winfulltime.com/blog/analyze-football-match-betting.html)
