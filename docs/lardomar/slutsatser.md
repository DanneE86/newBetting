# Lärdomar – slutsatser och beslut

Levande fil, skriven för hand (agenten `.claude/agents/lardomar.md` fyller på). Lägg till daterade rader, skriv inte över. Siffror och tabeller per liga och lag genereras i [README.md](README.md), [ligor/](ligor/) och [lag/](lag/). Rådata per liga: `data/matcher/<liga>.csv`.

## Utgångsläge (2026-09-28)

- 91 345 ligamatcher med stängningsodds i 23 ligor. De 14 fd-ligorna har data 2017/18–2026/27, och Allsvenskan, Eliteserien, Danmark, Polen, J1, MLS, Mexiko, Brasilien och Argentina har data från 2012.
- xG från Understat i topp 5 (9 säsonger). Övriga fd-ligor har en skott-proxy: 0,059 per skott utanför mål + 0,219 per skott på mål, kalibrerad mot Understat.
- Spelare per match (Understat) i topp 5 från 2024/25, alltså 3 752 matcher.
- 1 209 matcher från Stryktipset (494) och Europatipset (715) med folkets streck och odds.
- Metod: signaler räknas bara på data före matchen och testas mot resultatet minus oddsens förväntan. Träning före 2023/24, kontroll 2023/24 och senare.

## Vad som INTE slår marknaden (förkastat 2026-09-28)

Alla ligor tillsammans, mot stängningsodds. z = styrka, och |z| ≥ 2,5 i träning och ≥ 2 i kontroll krävs.

| Idé | Resultat | Varför |
|---|---|---|
| **xG-tur (poäng − xP)** | Svag (z −2,6 totalt, −1,1 i kontrollen). Förutsäger däremot oddsrörelsen starkt (z −15) | Marknaden prisar in turen före avspark. Lag med tur går upp i odds från öppning till stängning. Inget värde vid stängning |
| **xG-form mot målform** | Ingen effekt (z 1,9). Förutsäger oddsrörelsen (z 13) | Samma: marknaden vet |
| **Form mot marknaden** (lag som slagit oddsen senaste 8) | Svag återgång (z −4,1 totalt, −1,6 i kontrollen), effekt −0,04 poäng | För liten och håller inte i kontrollen |
| **Inbördes möten** (≥ 3 möten, 8 år) | Mot marknaden z 0,6, poängskillnad z 2,6 men inte i träningen, kryss z 0,9 | Historiken mellan två lag är redan inprisad. "Laget brukar slå dem" är ett argument som inte håller |
| **Nyckelspelare borta** (andel av lagets xG + xA) | Vikt **positiv**: laget som saknar spelare gör det något *bättre* än oddsen. Kontroll 2025/26 z −0,4 | Marknaden prisar in frånvaron, möjligen lite för mycket, men det är inte bekräftat. Använd inte för att flytta procent |
| **Vilodagar** (ligamatcher) | Ingen effekt (z −1,2) | Cup- och Europamatcher saknas i datan, så det är ett svagt test |
| **Uppflyttade lag omgång 1–10** | −0,035 p/match (z −2,1) | Svag, följ upp |
| **Nedflyttade lag omgång 1–10** | −0,06 (z −1,9, kontroll −0,14 z −2,7) | Svag, följ upp |
| **Oddsrörelse ("steam")** | Ingen effekt vid stängning | Stängningen har redan tagit in rörelsen |
| **Bolagssnitt mot Pinnacle** | Ingen effekt | Pinnacle räcker som facit |
| **Över/under-marknaden mot kryss** | Ingen effekt | 1X2- och O/U-marknaderna är samstämmiga |
| **Sista 4 omgångarna, omgång 1–5** | Ingen effekt | – |
| **Lag som marknaden felvärderar** (säsong → nästa) | Ingen persistens i någon liga | Ett lag som slagit oddsen en säsong är inte ett bättre spel nästa |

Justeringsmodellen med alla signaler samtidigt förbättrade inte kontrollen (mot öppning −0,0004, z −1,0, mot stängning −0,0002, z −0,7). **Slutsats: lägg inte tid på att flytta procent efter form, xG, H2H eller frånvaro. Oddsen gör det redan.**

### Förkastat 2026-09-28 (kväll), tipsens träff
- **Kryssregel** (tippa X när P(X) ligger inom δ från favoriten, δ vald på träning per liga): kontroll 2023/24–, 14 ligor: 50,78 % → 50,66 %. Sämre.
- **DC-vikt i blandningen** (ligor utan odds): 0,8 bäst poolat (logloss −0,0025 mot 0,5, z under 2, träff oförändrad 47,7 %). Vikt vald per liga håller inte i kontrollen. Ingen ändring.
- **Kryssöverskott tidigt på säsongen håller i sig?** Nej: 257 ligasäsonger, lutning −0,04 (z −1,0). Englands 33 % kryss i år (väntat 26 %, z 2,9) har inget historiskt mönster (tidigare säsonger z mellan −1,0 och +1,1).
- **Situationer mot öppningsoddsen, poolat alla ligor:** oddsrörelse bort från favoriten (favoriten −2,7/−2,3 procentenheter, z −6,3/−3,8) är bekräftad, men den fångas redan av att tipset bygger på de senaste oddsen. Senaste oddsen träffar 51,25 % mot öppningens 50,78 %. Storfavoriter ≥ 70 % vinner oftare än oddsen säger (+1,8/+4,3 procentenheter, z 2,6/4,2), vilket inte ändrar tecknet. Veckodag, månad, omgång 1–10, uppflyttad favorit, vila och målsnåla matcher: ingen säker effekt. Bekräftat per liga: SB (kryss i målsnåla och jämna matcher), ED och GR (oddsrörelse), PT (storfavoriter).

## Vad som håller

1. **Serie A och Serie B: oddsen har en strukturell bias.** Hemmalagen i Serie A vann mer sällan än öppningsoddsen sade i 9 av 9 hela säsonger (2017/18–2025/26). Kryss kom oftare än väntat i 7 av 9 säsonger i båda ligorna, i Serie B i snitt cirka +3 procentenheter. Favoriter vann oftare än väntat, och marknaden stänger bara en del av gapet före avspark. Kalibreringen förbättrade kontrollen: Serie A −0,0046 (z −3,0), Serie B −0,0031 (z −2,3) mot öppning, och −0,0037 (z −2,6) respektive −0,0032 (z −2,0) mot stängning.
2. **Liga-kalibrering av öppningsodds** för alla fd-ligor (favorit-, hemma- och kryssbias per liga, med straff) gav −0,0006 (z −2,0) i kontrollen. **Infört i Oddset** 2026-09-28 (se beslut). I Oddset-simuleringen: 4 248 spel och avkastning 7,8 % ± 2,4 % mot 1 287 spel och 2,3 % ± 4,6 % utan justering. Den mesta ökningen är kryss. Med snittodds blev det 467 spel och 8,0 % ± 6,5 %, alltså inte säkerställt i kronor.
3. **Starka favoriter i La Liga (65–75 %) och Portugal (75 %+)** vann oftare än oddsen säger (76,9 % mot 69,5 % och 88,0 % mot 81,3 %), bekräftat i både träning och kontroll. Det fångas av kalibreringen (g > 0).
4. **Danmark: inbördes möten** (poängskillnad) bekräftat i träning och kontroll (z 3,2), men det är den enda ligan av 23. Kandidat, inte infört.
5. **Stryktipset och Europatipset: folket.** Folket streckar favoriten ×1,13 av vår sannolikhet och kryss 2,1 procentenheter under vår procent. Utfall per tecken mot folkets streck: 1 = 0,94, X = 1,10, 2 = 1,00. Kryss är det tecken som betalar mest i förhållande till strecken. Det fångas redan av utdelningsgränsen i systemen.
   - Mest överspelade lag (folk/vår procent, minst 6 matcher): Southampton ×1,20, Coventry ×1,18, Ipswich ×1,17, Manchester City ×1,16 (36 matcher), Barcelona ×1,13.
   - Mest underspelade: Burnley ×0,66 (33 matcher), Sheffield Wednesday ×0,66, Parma och Lecce ×0,72, Oxford ×0,77.
   - Folket slår inte oddsen i PL (logloss 1,016 mot vår 0,995) eller Championship (1,119 mot 1,071), men väl i Bundesliga och Ligue 1 (få matcher, 55 st).

## Beslut

- **2026-09-28, felanalys av tipsen per liga (kväll):** webbens träffruta visade grundmodellens träff, men i ligor med odds styr oddsen tipsen. Grundmodellen tippar hemmalaget för ofta (flata procent, oavgjort går till hemma), och när den och oddsen var oense hade oddsen rätt oftare (till exempel Championship 10 mot 0 av 17, Brasilien 17 mot 8). Pro-lagret räknar nu tipsmotorns riktiga träff per liga och säsong (`evaluation.tipAccuracy`, per match i `data/reports/tips-backtest.json`), och webben visar den med "väntat". Championship 36,6 % → 45,3 %, PL 40,0 % → 46,0 %. Bara League One ligger klart under tipsens egna procent (34,5 % mot 46,1 %, z −2,2, 87 matcher). Datafel är uteslutet, förra säsongen låg ligan på z +1,3, så det bedöms som slump. Följ upp.
- **2026-09-28:** i PL vägdes blandningen DC + grundmodell in med 30 % i det oddsstyrda tipset, men marknadstestet mätte DC ensam. Nu vägs DC in, som testat.
- **2026-09-28:** en lärdomsfil per liga, `docs/lardomar/anteckningar/<liga>.md` (35 st, även League Two och cuperna). Den automatiska delen uppdateras dagligen i molnet (`npm run felanalys`, steg "Felanalys per liga"). Handskrivna, daterade lärdomar står under egen rubrik och ligger kvar. Översikt: `docs/lardomar/anteckningar/README.md`.
- **2026-09-28:** Oddset (`scripts/pro-layer.mjs`) justerar 1X2-facit med liga-kalibreringen (`config/learned-adjustments.json`, bas "open") när avsparken är minst 24 timmar bort (`CONFIG.learnedMinHours`). Tipsen visar före- och efter-procent i `pro.market.learned`. Det kan stängas av med `LEARNED_OFF=1`. Första körningen gav 50 värdespel mot 22 utan justering: 32 nya, varav 20 i Serie A/B (13 kryss, 7 favoriter/bortalag), 7 kryss i Eredivisie och Bundesliga 1–2, och 4 som försvann.
- **2026-09-28, enskilda matcher (Oddset-tipsen), alla ligor:** pro-lagrets marknadstest (halva perioden väljer vikt, andra halvan kontrollerar, 250–930 matcher per liga) visar att **oddsen slår lagmodellen i 21 av 22 ligor**. Modellens logloss är 0,01–0,04 sämre, vilket är tio gånger större än alla signaler ovan. Bara i PL tillför modellen något (vikt 20–30 %). För över/under 2,5 är Pinnacle bättre i 11 av 13 ligor (PL lika, Grekland modellen). Därför styr oddsen nu 1X2-tipset hela säsongen när odds finns (`CONFIG.marketLedTips`), modellen vägs in med den testade vikten, och O/U följer oddsen där de var bättre. Första körningen: 243 av 624 tips oddsstyrda, 48 bytte 1X2-tecken. Tips utan odds (långt fram eller ligor utan odds) följer modellen som förut. "Tipsens träff" i webben bygger på modellens historik tills ledgern har nya avgjorda tips.
- **Kryss tippas nästan aldrig**, och det är rätt: ett 1X2-tips väljer det mest sannolika utfallet, och kryss är nästan aldrig det (även med oddsen). Värdet i kryss fångas i stället av Värde/Ej värde-omdömet, där kalibreringen ger fler kryss med värde i Serie A/B och Eredivisie.
- **2026-09-28:** Stryktipset och Europatipset justeras **inte**. Mot stängningsodds klarade ingen variant kontrollen totalt (−0,0002, z −0,7). Italien ensamt klarar det (se ovan). Ett eget undantag för Serie A/B på Europatipset (cirka 2 matcher per omgång ger cirka +0,7 % chans till 13 rätt) är ett beslut för användaren.
- **2026-09-28, metodlärdom:** att välja ligor per liga på valideringsdata var skört. Med "dLL < 0" kom brusligor med (PL blev sämre), och med "z ≤ −1" åkte Serie A ut. Därför bestämdes slutregeln i förväg: kalibrera alla ligor med straff, utan signaler. Välj aldrig ligor på kontrollperioden.

## Följ upp

- **Ligor helt utan oddshistorik** (Colombia, Brasilien B, Chile, J2, J3, K League, Superettan, Div 1, OBOS, Danmark 1. div, Tjeckien, Kroatien): där kan varken marknadstest eller kalibrering göras, och tipsen följer modellen. `data/matcher/<liga>.csv` sparar från och med nu oddsen vi ser före varje match (`pre_first_*`, `pre_last_*`). Efter cirka 150 matcher per liga kan marknadstestet köras där också. Modellen slår "alltid hemmavinst" i 10 av 13 sådana ligor, men inte i Chile (44,3 % mot 48,9 %, n 167; bortatipsen träffar 33 %, vilket tyder på underskattad hemmafördel), K League (32,5 % mot 36,5 %, n 166) och Danmark 1. div (35,7 % mot 38,2 %, n 42). Urvalen är för små för att ändra något nu. Granska hemmafördelen i Chile och K League med `npm run tune` när fler matcher finns.
- **League One** (z −2,2 i år): ligger z fortfarande ≤ −2 efter 200 matcher, granska oddskällan (egen avläsning mot stängning). **Portugal** (z −1,8) och **Superettan** (z −1,8 förra säsongen): följ upp i ligafilerna.
- **Oddsstyrda tips:** jämför träffen i `data/tips-ledger.json` före och efter 2026-09-28, per liga.

- **Premier League** blev marginellt sämre med kalibreringen i kontrollen (+0,0014, z +1,9). Om den blir sämre med z > 2 vid nästa körning: ta bort PL ur justeringen.
- **Oddset-utfallet med justering**: följ värdespelen i `data/tips-ledger.json` separat för justerade tips (`pro.market.learned`), särskilt kryss i Serie A/B. Efter 150+ avgjorda spel: jämför CLV och avkastning mot ojusterade.
- **Nyckelspelare:** kör om när 2026/27 är klar (fler matcher). Hypotes: marknaden överreagerar på frånvaro.
- **Uppflyttade och nedflyttade lag:** svag negativ effekt (z ≈ −2), testa igen efter säsongen 2026/27.
- **Europatipset Serie A/B-undantag:** backtesta med `scripts/backtest-stryktipset.mjs` om användaren vill.

## Data som skulle kunna ändra slutsatserna

- Historik över skador och avstängningar *före* matchen (inte bara vem som spelade). Då kan vi testa vad marknaden visste i förväg.
- Cup- och Europamatcher (vila och trötthet).
- xG utanför topp 5, till exempel Championship, där Stryktipset har många matcher. Idag finns bara skott-proxy.
- Tränarbyten.
- Slutodds och streck från fler säsonger av Stryktipset/Europatipset (idag bara 2025/26 och framåt).
