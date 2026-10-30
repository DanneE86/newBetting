# Travsport som tidskälla

På fliken Hästar finns kortet **Tider och Fa/Fo-delpoäng** ovanför avdelningarna. Där väljs **Källa för tider och delpoäng**:

- **Travsport (Sportinfo) – full historik**: hästens alla starter ur Sportinfo-filerna `data/hastar/travsport/ts<id>.json`.
- **ATG – sparade omgångar**: starterna som finns i ATG-data i de sparade analyserna (`data/hastar/analys/`).

Valet sparas i `config/hastar-presentation.json` (gitignorerad) och gäller även efter omstart.

## Läsa historiken

Välj avdelning eller **Hela omgången** och tryck **Läs Travsport-historik**. GUI:t kör `scripts/fetch-travsport-hast.mjs` med omgångens häst-id (ATG:s `horseId` = Sportinfo-id `ts<horseId>`) och visar förloppet. Det är samma skript som annars körs för hand: en häst i taget, 20–45 s paus, en omladdning vid robotkontroll och sedan avbrott. En hel omgång tar ungefär en timme. Redan sparade hästar läses inte om, om inte **Hämta på nytt** är ikryssat (`--igen`). **Avbryt** stoppar körningen.

## Vad som räknas

`scripts/lib/travsport-history.mjs` gör om Sportinfo-filen till starter med datum, bana, distans, startmetod, km-tid, placering, galopp, diskning, spår, kusk, tränare, prissumma, skor och vagn. Kval, premielopp, strykningar och kommande starter räknas bort. Historiken är **komplett** när antalet starter är lika med livstidsraden på Sportinfo, annars visas "ofullständigt" vid hästen.

Starter samma dag som omgången eller senare ingår inte. Källan används bara till de tre tidskolumnerna, RT/FT/LI, delpoängen Fo–Te och talet inom parentes vid poängen (docs/travsport-delpoang.md). Chans, rank och systembyggaren räknas som förut.

## Lokalt, aldrig på webben

Sportinfo-filerna är gitignorerade och läggs aldrig på webbsidan: `/api/hastar?publik=1` (scripts/build-static-site.mjs) tar inte med Travsport-historiken. Webbsidan visar tiderna ur ATG:s sparade omgångar.
