# Lärdomar per liga och lag

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs` (91345 matcher, 23 ligor, 458 lag). Agenten `.claude/agents/lardomar.md` kör och tolkar analysen.

Frågan i varje test: **ger signalen något utöver stängningsoddsen?** Allt som oddsen redan prisar in har inget värde för våra spel. Träning på säsonger före 2023/24, kontroll på 2023/24 och senare. En signal räknas som bekräftad först när den håller i båda.

Slutsatser och beslut (handskrivet, levande): [slutsatser.md](slutsatser.md). Alla matcher per liga för träning: `data/matcher/<liga>.csv`.

## Alla ligor tillsammans

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,024 (z −2,6, n 48302) | −0,028 (z −2,4, n 31381) | −0,016 (z −1,1, n 16921) | −0,034 (z −3,6, n 48259) | −0,010 (z −15,5, n 48259) | −0,037 p | svag signal (inte bekräftad) |
| xG-form mot målform (xGD − GD, senaste 8) | +0,014 (z 1,9, n 48302) | +0,012 (z 1,3, n 31381) | +0,017 (z 1,4, n 16921) | +0,021 (z 2,9, n 48259) | +0,007 (z 13,4, n 48259) | +0,027 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,028 (z −4,1, n 89027) | −0,032 (z −3,9, n 62152) | −0,019 (z −1,6, n 26875) | −0,038 (z −4,0, n 48260) | −0,004 (z −6,3, n 48260) | −0,044 p | svag signal (inte bekräftad) |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,007 (z 0,6, n 60122) | +0,001 (z 0,1, n 38393) | +0,020 (z 1,1, n 21729) | +0,021 (z 1,5, n 29244) | −0,002 (z −1,5, n 29244) | +0,008 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,011 (z 2,6, n 60122) | +0,006 (z 1,2, n 38393) | +0,020 (z 2,9, n 21729) | +0,019 (z 3,5, n 29244) | +0,001 (z 1,7, n 29244) | +0,033 p | svag signal (inte bekräftad) |
| Inbördes möten, kryss mot förväntat | +0,009 (z 0,9, n 60122) | +0,005 (z 0,4, n 38393) | +0,019 (z 1,0, n 21729) | – | – | +0,004 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,003 (z −1,2, n 87544) | +0,001 (z 0,2, n 61511) | −0,011 (z −2,5, n 26033) | −0,002 (z −0,5, n 47835) | −0,000 (z −0,9, n 47835) | −0,006 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta; träning 2024/25, kontroll 2025/26–) | +0,873 (z 4,1, n 3752) | +1,023 (z 3,4, n 1752) | +0,724 (z 2,4, n 2000) | +0,759 (z 3,6, n 3752) | −0,113 (z −8,1, n 3752) | +0,199 p | **bekräftad** |
| Oddsrörelse öppning → stängning (förväntade poäng) | +0,090 (z 1,4, n 49506) | +0,064 (z 0,8, n 32428) | +0,148 (z 1,3, n 17078) | – | – | +0,019 p | ingen effekt |
| Bolagssnitt mot Pinnacle vid stängning | −0,357 (z −2,2, n 73872) | −0,467 (z −2,4, n 53144) | −0,044 (z −0,1, n 20728) | – | – | −0,023 p | ingen effekt |
| Under 2,5 mål (O/U-marknaden) mot kryss | +0,022 (z 0,9, n 38559) | +0,041 (z 1,3, n 21486) | +0,003 (z 0,1, n 17073) | – | – | +0,005 p | ingen effekt |

| Situation | Snitt mot marknaden | Träning | Kontroll | Bedömning |
|---|---|---|---|---|
| Omgång 1–5 (hemmalagets poäng mot marknaden) | −0,011 (z −1,0, n 13159) | −0,010 (z −0,8, n 8997) | −0,011 (z −0,6, n 4162) | ingen effekt |
| Sista 4 omgångarna (hemmalagets poäng) | −0,004 (z −0,3, n 8954) | +0,009 (z 0,6, n 6258) | −0,034 (z −1,4, n 2696) | ingen effekt |
| Sista 4 omgångarna (kryss mot förväntat) | −0,006 (z −1,3, n 8954) | −0,008 (z −1,5, n 6258) | −0,000 (z −0,0, n 2696) | ingen effekt |
| Uppflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,035 (z −2,1, n 5556) | −0,031 (z −1,5, n 3684) | −0,044 (z −1,6, n 1872) | ingen effekt |
| Nedflyttat lag, omgång 1–10 (lagets poäng mot marknaden) | −0,062 (z −1,9, n 1419) | −0,003 (z −0,1, n 814) | −0,140 (z −2,7, n 605) | ingen effekt |
| Hemmalaget ≤ 3 dagars vila, bortalaget ≥ 6 | +0,032 (z 1,7, n 4142) | +0,007 (z 0,3, n 2911) | +0,091 (z 2,6, n 1231) | ingen effekt |
| Hemmalaget saknar ≥ 25 % av anfallet (xG+xA) | +0,237 (z 1,3, n 42) | – | +0,237 (z 1,3, n 42) | ingen effekt |
| Bortalaget saknar ≥ 25 % av anfallet (hemmalagets poäng) | +0,224 (z 1,4, n 58) | – | +0,224 (z 1,4, n 58) | ingen effekt |

## Justeringsmodell: blir sannolikheterna bättre?

Alla signaler och en kalibrering per liga (favorit-/skrällbias, hemmabias, kryss) läggs på marknadens sannolikheter. Anpassning före 2021/22, val på 2021/22–2022/23, en enda mätning på 2023/24 och senare. Mått: logloss-skillnad per match (negativ = bättre). Grovt räknat ändras chansen till 13 rätt med faktorn e^(−13 × skillnaden), så −0,001 ≈ +1,3 %. Genererad av `scripts/learnings-model.mjs` 2026-09-28.

Oddset-simuleringen spelar tecken med EV ≥ 3 % och odds ≤ 5. "Bästa pris" = högsta odds bland alla bolag i football-data. Det är för optimistiskt (gamla och begränsade priser), så jämför varianterna med varandra, inte med noll. CLV mäts mot ojusterad stängning och blir därför lägre för justerade varianter.

### Mot öppningsodds (Oddset, långt före avspark)

| Variant | Logloss-skillnad (z) | Bästa pris: spel / ROI ± SE / CLV | Snittodds: spel / ROI ± SE |
|---|---|---|---|
| bas | – | 1287 / 2,3 % ± 4,6 % / 3,6 % | 4 / 12,3 % ± 59,7 % |
| alla ligor + alla signaler | −0,0004 (−1,0) | 6907 / 5,6 % ± 1,8 % / 0,4 % | 1498 / 6,5 % ± 3,6 % |
| ligakalibrering (alla ligor) | −0,0006 (−2,0) | 4248 / 7,8 % ± 2,4 % / 1,7 % | 467 / 8,0 % ± 6,5 % |
| valt på validering | −0,0005 (−1,8) | 2938 / 7,1 % ± 2,7 % / 1,7 % | 433 / 5,8 % ± 6,4 % |

Signaler en i taget (validering, negativ = bättre): luck −0,0001 (z −0,6), gap −0,0001 (z −0,9), mres +0,0001 (z 0,2), h2hPts −0,0001 (z −3,9), h2hRes +0,0001 (z 3,8), rest +0,0001 (z 0,9), promo 0,0000 (z 0,3), releg 0,0000 (z −0,6), h2hDraw 0,0000 (z 0,7), underOpen −0,0001 (z −1,2).

**Används live:** ligakalibrering, alla ligor, inga signaler (kontroll −0,0006, z −2,0).

### Mot stängningsodds (sen körning, Stryktipset/Europatipset)

| Variant | Logloss-skillnad (z) | Bästa pris: spel / ROI ± SE / CLV | Snittodds: spel / ROI ± SE |
|---|---|---|---|
| bas | – | 5186 / 5,7 % ± 2,2 % / 5,8 % | – / – |
| alla ligor + alla signaler | −0,0002 (−0,7) | 11191 / 5,1 % ± 1,4 % / 2,1 % | – / – |
| ligakalibrering (alla ligor) | −0,0002 (−0,7) | 9421 / 5,6 % ± 1,5 % / 2,8 % | – / – |
| valt på validering | −0,0001 (−0,5) | 5938 / 5,8 % ± 1,9 % / 4,9 % | – / – |

Signaler en i taget (validering, negativ = bättre): luck 0,0000 (z −0,5), gap 0,0000 (z −0,8), mres 0,0000 (z 0,2), h2hPts 0,0000 (z 2,9), h2hRes +0,0001 (z 2,7), rest 0,0000 (z 1,1), promo 0,0000 (z 0,5), releg 0,0000 (z 0,5), steam 0,0000 (z 0,7), book −0,0001 (z −2,0), h2hDraw 0,0000 (z 1,3), under 0,0000 (z −1,3).

**Används inte:** ingen variant blev bättre med z ≤ −2 i kontrollen.

### Nyckelspelare borta (träning 2024/25, kontroll 2025/26–)

Vikt 0,159 mot öppning och 0,183 mot stängning. Positiv vikt betyder att laget som saknar spelare gör det *bättre* än oddsen, alltså att marknaden överreagerar. Kontroll: −0,0005 (z −0,4) och −0,0009 (z −0,6). Inte bekräftat, så det används inte.

## Ligor

| Liga | Matcher | Säsonger | xG | Bekräftade lärdomar |
|---|---|---|---|---|
| [Premier League](ligor/PL.md) | 3470 | 2017/18–2026/27 | Understat | 0 |
| [Championship](ligor/CH.md) | 5063 | 2017/18–2026/27 | skott-proxy | 0 |
| [League One](ligor/EL1.md) | 4903 | 2017/18–2026/27 | skott-proxy | 0 |
| [League Two](ligor/EL2.md) | 4950 | 2017/18–2026/27 | skott-proxy | 0 |
| [Bundesliga](ligor/BL.md) | 2790 | 2017/18–2026/27 | Understat | 0 |
| [2. Bundesliga](ligor/BL2.md) | 2808 | 2017/18–2026/27 | skott-proxy | 0 |
| [La Liga](ligor/LL.md) | 3489 | 2017/18–2026/27 | Understat | 1 |
| [LaLiga 2](ligor/LL2.md) | 4213 | 2017/18–2026/27 | skott-proxy | 0 |
| [Serie A](ligor/SA.md) | 3470 | 2017/18–2026/27 | Understat | 0 |
| [Serie B](ligor/SB.md) | 3511 | 2017/18–2026/27 | skott-proxy | 0 |
| [Ligue 1](ligor/L1.md) | 3142 | 2017/18–2026/27 | Understat | 0 |
| [Eredivisie](ligor/ED.md) | 2743 | 2017/18–2026/27 | skott-proxy | 0 |
| [Primeira Liga](ligor/PT.md) | 2816 | 2017/18–2026/27 | skott-proxy | 1 |
| [Super League (Grekland)](ligor/GR.md) | 2183 | 2017/18–2026/27 | skott-proxy | 0 |
| [Allsvenskan](ligor/AS.md) | 3560 | 2012–2026 | saknas | 0 |
| [Eliteserien](ligor/NO.md) | 3550 | 2012–2026 | saknas | 0 |
| [Superligaen](ligor/DK.md) | 3006 | 2012/13–2026/27 | saknas | 1 |
| [Ekstraklasa](ligor/EK.md) | 4160 | 2012/13–2026/27 | saknas | 0 |
| [J1 League](ligor/JP1.md) | 4603 | 2012–2026/27 | saknas | 0 |
| [MLS](ligor/MLS.md) | 6204 | 2012–2026 | saknas | 0 |
| [Liga MX](ligor/MX.md) | 4731 | 2012/13–2026/27 | saknas | 0 |
| [Brasileirão Série A](ligor/BR.md) | 5596 | 2012–2026 | saknas | 0 |
| [Liga Profesional](ligor/AR.md) | 6384 | 2012/13–2026 | saknas | 0 |

### Ligor utan oddshistorik och cuper

Här kan inget mätas mot marknaden. Filerna visar profil, säsonger, modellens träff, form, inbördes möten, tabell och trupper.

| Liga | Matcher | Lagfiler |
|---|---|---|
| [Superettan](ligor/SE2.md) | 439 | 16 |
| [Div 1 Norra](ligor/SE3N.md) | 432 | 18 |
| [Div 1 Södra](ligor/SE3S.md) | 432 | 20 |
| [Brasileirão Série B](ligor/BR2.md) | 676 | 21 |
| [Champions League](ligor/CL.md) (cup) | 0 | 0 |
| [Europa League](ligor/EL.md) (cup) | 0 | 0 |
| [Conference League](ligor/ECL.md) (cup) | 0 | 0 |
| [OBOS-ligaen](ligor/NO2.md) | 424 | 16 |
| [1. division](ligor/DK2.md) | 246 | 13 |
| [HNL](ligor/HR.md) | 227 | 13 |
| [Chance Liga](ligor/CZ.md) | 341 | 16 |
| [Primera A](ligor/COL.md) | 757 | 20 |

## Stryktipset och Europatipset, alla ligor

Källa: backtesten i `data/stryktips-backtest-2526-steg3.json`, `data/stryktips-backtest.json` och `data/europatips-backtest-2526.json` (1209 matcher: 494 Stryktipset, 715 Europatipset).

| Mått | Värde |
|---|---|
| Logloss slutprocent / marknad / folket / lagmodell | 1,014 / 1,013 / 1,026 / 1,033 |
| Folket streckar favoriten | ×1,13 av vår sannolikhet |
| Kryss: utfall / vår procent / folket | 26,4 % / 26,0 % / 23,9 % |
| Favoriter ≥ 55 %: höll / väntat | 67,6 % / 63,9 % (n 293) |

| Tecken | Utfall | Vår procent | Folket | Utfall / folket |
|---|---|---|---|---|
| 1 | 42,3 % | 42,0 % | 44,9 % | 0,94 |
| X | 26,4 % | 26,0 % | 23,9 % | 1,10 |
| 2 | 31,3 % | 32,1 % | 31,2 % | 1,00 |

- Folket överstreckar favoriter (×1,13). Utdelningsgränsen fångar det redan, men garderingar mot favoriter i ligan ger mer i utdelning.
- Folket streckar kryss 2,1 procentenheter under vår procent. Kryss ger streckvärde.

### Ligor och cuper utan egen historik (bara pool-data)

| Liga | n | Kryss utfall / vår / folket | Folket på favoriten | Logloss vår / folket |
|---|---|---|---|---|
| Superettan | 20 | 40 % / 26 % / 24 % | ×1,10 | 1,121 / 1,139 |
| Europa League | 17 | 24 % / 25 % / 24 % | ×1,10 | 0,971 / 0,968 |
| FA Cup | 13 | 31 % / 23 % / 20 % | ×1,14 | 0,825 / 0,725 |
| Premiership | 12 | 50 % / 25 % / 24 % | ×1,13 | 0,953 / 0,928 |
| Pro League | 9 | 44 % / 28 % / 27 % | ×1,10 | 1,045 / 0,992 |
| EFL Cup | 9 | 0 % / 24 % / 24 % | ×1,05 | 0,880 / 0,850 |
| DFB Pokal | 7 | 14 % / 20 % / 19 % | ×1,07 | 0,632 / 0,584 |
| Svenska Cupen | 7 | 29 % / 24 % / 21 % | ×1,14 | 0,804 / 0,699 |
| Afrikanska mästerskapen | 7 | 57 % / 28 % / 28 % | ×1,13 | 0,972 / 0,960 |
| Coppa Italia | 5 | 60 % / 24 % / 23 % | ×1,08 | 0,928 / 0,846 |

## Data som saknas

| Data | Läge | Påverkan |
|---|---|---|
| xG utanför topp 5 | Bara skott-proxy (skott och skott på mål) för övriga fd-ligor. Inget alls för Allsvenskan, Eliteserien, MLS, J1, Liga MX, Brasilien, Argentina, Danmark och Polen | Tur/form-signaler kan inte testas där |
| Spelarnas matcher (vilka som spelade) | Bara Understat topp 5 från 2024/25 | Frånvarotest bara i topp 5 och kort period |
| Skador och avstängningar i förväg | Bara live (FPL för PL, FotMob). Ingen historik | Kan inte testa vad marknaden visste före elvan |
| Cup- och Europamatcher | Saknas i historiken | Vilodagar räknas bara mellan ligamatcher, trötthet efter Europa missas |
| Tränarbyten | Saknas | "Ny tränare-effekt" kan inte testas |
| Öppningsodds | fd-new-ligorna har bara stängning. Före 2019/20 saknas stängning i fd-main | Test mot öppningsodds bara i huvudligorna |
| Stryktipset/Europatipset | Streck och odds bara från 2025/26 (backtest) | Folkets bias per lag bygger på få matcher |
| Trupper | FotMob saknar trupper för J2, J3 och Ettan Norra/Södra (ESPN har inte heller ligorna). Truppernas historik börjar 2026-09-28 | Skador och truppändringar kan inte följas där |
| Derbyn, motivation, väder | Väder testat separat i pro-lagret (inget värde). Derby och motivation saknas | – |

## Köra om

```
npm run history    # äldre säsonger + Understat-xG (en gång, cachas)
npm run lardomar   # analys + alla filer
```
