# Analys: Premier League och Serie B (2026-09-27)

Underlag: point-in-time-backtest (veckovis refit), säsong 2025/26 + 2026/27, 430 matcher per liga.
RPS = Ranked Probability Score för 1X2, lägre är bättre. "Marknad" = devig:at snitt av bolagens odds.

## Premier League – varför den är svår

| | Hemma | Oavgjort | Borta |
|---|---|---|---|
| Faktiskt utfall | 41,9 % | **27,9 %** | 30,2 % |
| Modellen (DC) | 41,6 % | 25,1 % | 33,2 % |
| Marknaden | 43,2 % | 24,8 % | 32,0 % |

RPS: modell 0.207, marknad (öppning och closing) 0.205. Modellen ligger nära marknaden men aldrig före den.

1. **Marknaden är effektivast här.** Marginal 5,5 % hos ett vanligt bolag, men bara 2,1 % på bästa pris.
   När modellen avviker mer än 5 procentenheter från marknaden har marknaden rätt:
   - Modellen tror mer på hemmalaget: modell 43 %, marknad 34 %, utfall **31 %**.
   - Modellen tror mindre på hemmalaget: modell 43 %, marknad 54 %, utfall **54 %**.
   - Enda undantaget är bortafavoriter: marknad 46 %, modell 36 %, utfall 30 %, med 69 matcher.
     Signalen är svag men värd att följa.
2. **Oavgjort underskattas.** Andelen oavgjorda har stigit tre säsonger i rad (22 → 24 → 27 → 32 %).
   Både modellen och marknaden ligger kvar på cirka 25 %.
   Backtestens plus på oavgjort-spel (+19 till +32 % ROI) kommer av den trenden. Det är inte en bevisad edge.
3. **Svagast i vårens omgångar.** RPS-gapet är +0.006 från omgång 20 och framåt.
   Det gäller motivation, rotation och Europaspel, som modellen inte ser.
4. **Pinnacle-facit försvann mitt i 2025/26.** football-data har 0 Pinnacle-odds för 2026/27.
   Live-strategin (konsensus vs bästa pris) backtestades på Pinnacle. Nu räknas den på snittet av bolagen, ett svagare facit.
   Betfair Exchange-closing finns i CSV:erna och bör bli nytt facit i backtesten.
5. **Frånvaro ger inget.** Spelarfrånvaro (FPL/Understat) fick alpha = 0 eftersom den gjorde RPS sämre.
   Den mäter bara anfall (xG+xA), inte målvakt eller försvar.
   Marknaden prisar redan in skador innan closing.
6. **Max-odds för O/U 2.5 är opålitliga.** Exempel: Leeds–Palace, max 2.25 mot b365 1.73.
   Backtest på max-pris överskattar värdet på över/under. Live används bara svenska bolag, vilket är rätt.
7. **Uppflyttade lag** underskattas något av marknaden: marknad 21 %, modell 24 %, utfall 28 % vinst (54 matcher).

**Slutsats PL:** det saknas ingen stor felkälla, men modellen tillför inget utöver marknaden.
Värde i PL kan bara komma från radskillnader mellan bolag (konsensus vs bästa pris), inte från modellen.
Fortsätt med konsensusstrategin och höga trösklar.

## Serie B – vad som kan förbättras

RPS: modell 0.209, marknad 0.199. Gapet är dubbelt så stort som i PL.

| Grupp | RPS-gap mot marknaden |
|---|---|
| Omgång 1–8 | **+0.020** |
| Matcher med nytt lag i ligan | **+0.026** |
| Etablerade lag | +0.004 |

1. **Nya lag var huvudfelet.** 14 nya lag på två säsonger: 6 nedflyttade från Serie A och 8 uppflyttade från Serie C.
   DC gav dem ligasnitt, så nedflyttade underskattades och uppflyttade överskattades.
   **Åtgärdat:** prior. Nedflyttat lag börjar som ligans övre kvartil, uppflyttat som nedre kvartil.
   Priorn klingar av med 8 pseudomatcher.
2. **Hemmafördelen underskattas.** Hemmavinster: utfall 44,7 %, modell 41,9 %. Bortavinster: utfall 24,9 %, modell 29,3 %.
3. **Snabbare glömska passar Serie B** (xi 0.004 i stället för 0.0025), eftersom truppomsättningen är stor.
4. **Spel på modellen är starkt negativt:** −26 % ROI på 530 spel, minus i alla marknader.
   Serie B ska aldrig spelas på modellsannolikhet, bara via konsensus mot bästa pris. Det gör livelogiken redan.
5. **Hög marginal:** 8,0 % hos b365 mot 5,5 % i PL. Det krävs större prisskillnader för värde.
6. **Kort historik:** bara från 2024/25. Pinnacle finns bara för 90 matcher 2025/26.
   Konsensusbacktesten har bara 9 spel och säger därför nästan ingenting.
7. **Ingen xG-källa** (Understat täcker inte Serie B). Skott på mål finns i CSV:erna men gav ingen förbättring i test.


## Ändringar gjorda

- `scripts/pro/league-models.mjs`: Dixon-Coles per liga (glömska xi, shrink, oavgjort-faktor) och prior för nya lag.
  Nivåordningen i `config/leagues.json` avgör vilka lag som är upp- respektive nedflyttade.
- `scripts/tune-league-models.mjs` (`npm run tune`): väljer parametrar per liga i backtest och skriver `config/league-models.json`.
  Standardparametrarna behålls om vinsten är under 0.0005 RPS.
- `scripts/pro-layer.mjs`:
  - använder ligaparametrarna både live och i utvärderingen;
  - använder Betfair Exchange-closing som facit när Pinnacle saknas;
  - har den nya strategin `averageConsensusAtBestPrice` (samma logik som live när Pinnacle saknas);
  - låter marknaden styra tipsen tidigt på säsongen i ligor med `earlyMarket`. Modellens tips sparas i `modelTips`.
- GUI: notis "Tidig säsong – marknadens chans styr tipset" på marknadsstyrda tips.

## Resultat per liga (RPS 1X2, lägre = bättre)

Före = samma DC-parametrar för alla ligor.
Efter = parametrar per liga, prior för nya lag och oavgjort-faktor.
Parametrarna valdes på samma period som de mäts på, så förbättringen är något optimistisk.
Gridet är litet (12 kombinationer × 3 oavgjort-faktorer) och kräver minst 0.0005 vinst.

| Liga | Före | Efter | Förbättring | Inställning |
|---|---|---|---|---|
| Serie B (SB) | 0.2094 | 0.2047 | 2.2 % | prior, xi 0.004, shrink 2, kryss ×1.05 |
| 2. Bundesliga (BL2) | 0.2305 | 0.2256 | 2.1 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| J2 League (JP2) | 0.2351 | 0.2302 | 2.1 % | prior, xi 0.004, shrink 5, kryss ×1.1 |
| Div 1 Södra (SE3S) | 0.2292 | 0.2249 | 1.9 % | prior, xi 0.004, shrink 5, kryss ×1 |
| Div 1 Norra (SE3N) | 0.2215 | 0.2176 | 1.8 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| Brasileirão Série B (BR2) | 0.2199 | 0.2163 | 1.6 % | prior, xi 0.0015, shrink 5, kryss ×1.1 |
| Championship (CH) | 0.2251 | 0.2215 | 1.6 % | prior, xi 0.004, shrink 5, kryss ×1.05 |
| Bundesliga (BL) | 0.2022 | 0.1991 | 1.5 % | prior, xi 0.004, shrink 2, kryss ×1 |
| J3 League (JP3) | 0.2283 | 0.2248 | 1.5 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| K League 1 (KR) | 0.2260 | 0.2231 | 1.3 % | prior, xi 0.004, shrink 5, kryss ×1.1 |
| Ligue 1 (L1) | 0.2117 | 0.2093 | 1.1 % | prior, xi 0.0015, shrink 5, kryss ×1.1, **marknad tidigt** |
| HNL (HR) | 0.2050 | 0.2027 | 1.1 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| J1 League (JP1) | 0.2187 | 0.2163 | 1.1 % | prior, xi 0.004, shrink 2, kryss ×1 |
| Ekstraklasa (EK) | 0.2264 | 0.2240 | 1.1 % | prior, xi 0.0015, shrink 5, kryss ×1.1 |
| LaLiga 2 (LL2) | 0.2262 | 0.2239 | 1.0 % | prior, xi 0.004, shrink 5, kryss ×1 |
| Super League (GR) | 0.1890 | 0.1871 | 1.0 % | prior, xi 0.0015, shrink 2, kryss ×1 |
| Allsvenskan (AS) | 0.2189 | 0.2167 | 1.0 % | prior, xi 0.004, shrink 5, kryss ×1 |
| Eliteserien (NO) | 0.2041 | 0.2022 | 0.9 % | prior, xi 0.0025, shrink 2, kryss ×1 |
| 1. division (DK2) | 0.2176 | 0.2156 | 0.9 % | prior, xi 0.0015, shrink 5, kryss ×1.1 |
| OBOS-ligaen (NO2) | 0.2126 | 0.2108 | 0.8 % | prior, xi 0.0025, shrink 5, kryss ×1 |
| Superligaen (DK) | 0.2209 | 0.2192 | 0.8 % | prior, xi 0.004, shrink 5, kryss ×1.05 |
| Primera División (CHI) | 0.2188 | 0.2176 | 0.5 % | prior, xi 0.0025, shrink 5, kryss ×1 |
| MLS (MLS) | 0.2224 | 0.2212 | 0.5 % | ingen prior, xi 0.004, shrink 5, kryss ×1.1 |
| La Liga (LL) | 0.2017 | 0.2007 | 0.5 % | prior, xi 0.0015, shrink 2, kryss ×1 |
| Primera A (COL) | 0.2066 | 0.2056 | 0.5 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| League One (EL1) | 0.2227 | 0.2217 | 0.4 % | prior, xi 0.004, shrink 5, kryss ×1.05, **marknad tidigt** |
| Primeira Liga (PT) | 0.1786 | 0.1778 | 0.4 % | prior, xi 0.0015, shrink 2, kryss ×1.1 |
| Eredivisie (ED) | 0.1983 | 0.1975 | 0.4 % | prior, xi 0.0025, shrink 2, kryss ×1.1, **marknad tidigt** |
| Premier League (PL) | 0.2074 | 0.2067 | 0.3 % | prior, xi 0.0015, shrink 2, kryss ×1.1 |
| Liga MX (MX) | 0.2102 | 0.2095 | 0.3 % | prior, xi 0.0015, shrink 5, kryss ×1.1 |
| Chance Liga (CZ) | 0.2130 | 0.2123 | 0.3 % | ingen prior, xi 0.004, shrink 5, kryss ×1 |
| Liga Profesional (AR) | 0.2168 | 0.2162 | 0.3 % | prior, xi 0.0015, shrink 5, kryss ×1 |
| Brasileirão Série A (BR) | 0.2048 | 0.2043 | 0.2 % | prior, xi 0.0015, shrink 2, kryss ×1 |
| Serie A (SA) | 0.2005 | 0.2005 | 0.0 % | ingen prior, xi 0.0025, shrink 2, kryss ×1 |

Snitt över alla ligor: 0.2141 → 0.2120.

## Tidig säsong: modell mot marknad (omgång 1–8, efter tuning)

Marknaden styr tipsen (`earlyMarket`) när den är minst 0.01 bättre än modellen och underlaget är minst 60 matcher.
Serie B behöver det inte längre: priorn för nya lag minskade gapet i omgång 1–8 från 0.020 till 0.003.

| Liga | Matcher | RPS modell | RPS marknad (öppning) | Marknaden styr |
|---|---|---|---|---|
| SB | 130 | 0.2159 | 0.2130 | nej |
| BL2 | 126 | 0.2329 | 0.2296 | nej |
| CH | 202 | 0.2242 | 0.2177 | nej |
| BL | 108 | 0.2051 | 0.1969 | nej |
| L1 | 117 | 0.2019 | 0.1908 | **ja** |
| LL2 | 155 | 0.2297 | 0.2247 | nej |
| GR | 93 | 0.1870 | 0.1794 | nej |
| LL | 149 | 0.1926 | 0.1929 | nej |
| EL1 | 183 | 0.2316 | 0.2197 | **ja** |
| PT | 134 | 0.1825 | 0.1825 | nej |
| ED | 135 | 0.1947 | 0.1841 | **ja** |
| PL | 132 | 0.2030 | 0.2056 | nej |
| SA | 130 | 0.1933 | 0.1918 | nej |

## Betfair som facit (ny utvärdering)

Med Betfair Exchange som facit täcks även matcherna efter att Pinnacle försvann.
`averageConsensusAtBestPrice` = det live gör utan Pinnacle: snittet av bolagen som facit, bästa pris, EV ≥ 3 %, odds ≤ 5.

| Liga | RPS modell | RPS skarp closing | Pinnacle / Betfair (matcher) | Snittkonsensus spel | ROI | CLV |
|---|---|---|---|---|---|---|
| PL | 0.207 | 0.2067 | 210 / 198 | 112 | -36 % | 5.7 % |
| SB | 0.2058 | 0.198 | 90 / 320 | 59 | -24 % | 1.7 % |
| CH | 0.2223 | 0.2165 | 271 / 340 | 50 | -43 % | 0.4 % |
| SA | 0.2012 | 0.1962 | 198 / 211 | 83 | -39 % | 4.4 % |

Snittkonsensus slår closing i genomsnitt (CLV positiv), men ROI är kraftigt negativ på 50–110 spel.
Det är ett svagare facit än Pinnacle, så trösklarna för snittfacit (5 % / 8 %) bör ligga kvar.
Om Värde-spelen på snitt-facit fortsätter att ge negativ CLV live bör trösklarna höjas.

## Kvar att bevaka

- **Oavgjort i PL:** faktorn 1.1 valdes men vinsten är liten (0.2068 → 0.2067). Tuningen omprövar den när `npm run tune` körs.
- **Tuningen körs inte automatiskt.** Kör `npm run tune` några gånger per säsong, särskilt efter omgång 8–10.
