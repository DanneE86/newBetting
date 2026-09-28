# Lärdomar per liga och lag

Genererad 2026-09-28 av `node scripts/analyze-learnings.mjs` (91345 matcher, 23 ligor, 458 lag). Agenten `.claude/agents/lardomar.md` kör och tolkar analysen.

Frågan i varje test: **ger signalen något utöver stängningsoddsen?** Allt som oddsen redan prisar in har inget värde för våra spel. Träning på säsonger före 2023/24, kontroll på 2023/24 och senare. En signal räknas som bekräftad först när den håller i båda.

## Alla ligor tillsammans

| Signal | Hela perioden | Träning (< 2023/24) | Kontroll (2023/24–) | Mot öppningsodds | Oddsrörelse | Effekt p90–p10 | Bedömning |
|---|---|---|---|---|---|---|---|
| xG-tur (poäng − xP, senaste 8) | −0,024 (z −2,6, n 48302) | −0,028 (z −2,4, n 31381) | −0,017 (z −1,1, n 16921) | −0,034 (z −3,7, n 48259) | −0,010 (z −15,5, n 48259) | −0,037 p | svag signal (inte bekräftad) |
| xG-form mot målform (xGD − GD, senaste 8) | +0,014 (z 1,9, n 48302) | +0,012 (z 1,3, n 31381) | +0,018 (z 1,4, n 16921) | +0,021 (z 2,9, n 48259) | +0,007 (z 13,3, n 48259) | +0,027 p | ingen effekt |
| Form mot marknaden (poäng − förväntat, senaste 8) | −0,028 (z −4,1, n 89027) | −0,032 (z −3,9, n 62152) | −0,019 (z −1,6, n 26875) | −0,038 (z −4,0, n 48260) | −0,004 (z −6,3, n 48260) | −0,044 p | svag signal (inte bekräftad) |
| Inbördes möten mot marknaden (≥ 3 möten, 8 år) | +0,007 (z 0,6, n 60122) | +0,001 (z 0,1, n 38393) | +0,020 (z 1,1, n 21729) | +0,021 (z 1,5, n 29244) | −0,002 (z −1,5, n 29244) | +0,008 p | ingen effekt |
| Inbördes möten, poängskillnad | +0,011 (z 2,6, n 60122) | +0,006 (z 1,2, n 38393) | +0,020 (z 2,9, n 21729) | +0,019 (z 3,5, n 29244) | +0,001 (z 1,7, n 29244) | +0,033 p | svag signal (inte bekräftad) |
| Inbördes möten, kryss mot förväntat | +0,009 (z 0,9, n 60122) | +0,005 (z 0,4, n 38393) | +0,019 (z 1,0, n 21729) | – | – | +0,004 p | ingen effekt |
| Vilodagar (hemma − borta, ligamatcher) | −0,003 (z −1,2, n 87544) | +0,001 (z 0,2, n 61511) | −0,011 (z −2,5, n 26033) | −0,002 (z −0,5, n 47835) | −0,000 (z −0,9, n 47835) | −0,006 p | ingen effekt |
| Nyckelspelare borta (andel av xG+xA, hemma − borta) | +0,873 (z 4,1, n 3752) | – | +0,873 (z 4,1, n 3752) | +0,759 (z 3,6, n 3752) | −0,113 (z −8,1, n 3752) | +0,199 p | **bekräftad (bara ny data)** |

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
| Derbyn, motivation, väder | Väder testat separat i pro-lagret (inget värde). Derby och motivation saknas | – |

## Köra om

```
npm run history    # äldre säsonger + Understat-xG (en gång, cachas)
npm run lardomar   # analys + alla filer
```
