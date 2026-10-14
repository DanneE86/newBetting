// Bygger den lokala databasen ur filerna i data/: databas/fotboll.sqlite, stryktips.sqlite och hastar.sqlite (SQLite, inbyggt i Node).
// Filerna är originalet och rörs inte – databasen byggs om från grunden varje gång (npm run databas).
// Öppna filerna i "DB Browser for SQLite". Varje databas har tabellerna om_tabeller och om_kolumner som förklarar allt.
//
//   npm run databas                 bygger alla tre (fotboll, stryktips, hastar)
//   npm run databas -- fotboll      bara fotboll
//   npm run databas -- stryktips    bara Stryktipset och Europatipset
//   npm run databas -- hastar       bara hästar
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  sqlVarde, gissaTyp, skapaTabellSql, parseCsvText, MATCH_KOLUMNER, matchRad, tabellRader, aktuellTabellRader, spelarRad, truppRader,
  matchstatRader, oddsetTipsRader, stryktipsRad, omgangRader, kompaktLoppRader, hastTipsRader,
  kupongOmgangRader, kupongSystemRader, stryktipsBakkorningRader, hastBakkorningRader, hastAnalysRader, hastUppfoljningRader, skrallmissRader, fyndRader,
} from './lib/databas.mjs';
import { normalizeGame } from './lib/trav-model.mjs';
import { addPrizes, addExtras } from './lib/hast-sasong.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const UT = path.join(ROOT, 'databas');
const vilka = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const log = (...a) => console.log(...a);
const lasJson = (f, fallback = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };
const jsonFiler = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(dir, f)) : []);

/** Databas med tabeller som skapas av första raderna och får nya kolumner när de dyker upp. */
class Databas {
  constructor(fil) {
    this.fil = fil;
    this.db = new DatabaseSync(fil);
    this.db.exec('PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;');
    this.tabeller = new Map();
    this.om = [];
    this.kolumnText = [];
  }
  /** Tabell med förklaring. kolumner: [[namn, typ]] i önskad ordning (resten läggs till efter första raderna). */
  tabell(namn, beskrivning, kalla, { kolumner = [], nyckel = null, unik = null, ersatt = false } = {}) {
    this.om.push({ tabell: namn, beskrivning, kalla });
    this.tabeller.set(namn, { kolumner: new Map(kolumner.map(([n, t]) => [n, t])), skapad: false, nyckel, unik, ersatt, satser: new Map(), rader: 0 });
  }
  infoga(namn, rader) {
    const t = this.tabeller.get(namn);
    if (!rader.length) return 0;
    const nya = [];
    for (const r of rader) for (const k of Object.keys(r)) if (!t.kolumner.has(k) || (!t.skapad && t.kolumner.get(k) == null)) nya.push(k);
    for (const k of new Set(nya)) {
      const typ = t.kolumner.get(k) ?? gissaTyp(rader.map((r) => r[k]));
      if (t.skapad && !t.kolumner.has(k)) this.db.exec(`ALTER TABLE "${namn}" ADD COLUMN "${k}" ${typ}`);
      t.kolumner.set(k, typ);
    }
    if (!t.skapad) {
      this.db.exec(skapaTabellSql(namn, [...t.kolumner], { nyckel: t.nyckel, unik: t.unik }));
      t.skapad = true;
    }
    let antal = 0;
    for (const r of rader) {
      const ks = Object.keys(r);
      const sig = ks.join('\u0001');
      let s = t.satser.get(sig);
      if (!s) {
        s = this.db.prepare(`INSERT OR ${t.ersatt ? 'REPLACE' : 'IGNORE'} INTO "${namn}" (${ks.map((k) => `"${k}"`).join(', ')}) VALUES (${ks.map(() => '?').join(', ')})`);
        t.satser.set(sig, s);
      }
      antal += Number(s.run(...ks.map((k) => sqlVarde(r[k]))).changes);
    }
    t.rader += antal;
    return antal;
  }
  i(fn) {
    this.db.exec('BEGIN');
    try { const v = fn(); this.db.exec('COMMIT'); return v; } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  /** Tomma tabeller skapas ändå (så att vyerna fungerar). */
  skapaTomma() {
    for (const [namn, t] of this.tabeller) if (!t.skapad && t.kolumner.size) { this.db.exec(skapaTabellSql(namn, [...t.kolumner], { nyckel: t.nyckel, unik: t.unik })); t.skapad = true; }
  }
  avsluta(vyer, index) {
    this.skapaTomma();
    for (const [namn, t] of this.tabeller) t.rader = Number(this.db.prepare(`SELECT COUNT(*) AS n FROM "${namn}"`).get().n);
    for (const sql of index) this.db.exec(sql);
    for (const [namn, beskrivning, sql] of vyer) {
      this.db.exec(`CREATE VIEW "${namn}" AS ${sql}`);
      this.om.push({ tabell: namn, beskrivning, kalla: 'vy (räknas fram ur tabellerna)' });
    }
    this.db.exec('CREATE TABLE om_tabeller (tabell TEXT PRIMARY KEY, beskrivning TEXT, kalla TEXT, antal_rader INTEGER)');
    this.db.exec('CREATE TABLE om_kolumner (tabell TEXT, kolumn TEXT, beskrivning TEXT, PRIMARY KEY (tabell, kolumn))');
    const s = this.db.prepare('INSERT INTO om_tabeller VALUES (?, ?, ?, ?)');
    for (const o of this.om) s.run(o.tabell, o.beskrivning, o.kalla, this.tabeller.get(o.tabell)?.rader ?? null);
    const k = this.db.prepare('INSERT OR REPLACE INTO om_kolumner VALUES (?, ?, ?)');
    for (const [tabell, kolumn, beskrivning] of this.kolumnText) k.run(tabell, kolumn, beskrivning);
    this.db.exec('CREATE TABLE byggd (byggd TEXT)');
    this.db.prepare('INSERT INTO byggd VALUES (?)').run(new Date().toISOString());
    this.db.exec('ANALYZE');
    this.db.close();
  }
}

/** Bygger till en tillfällig fil och byter sedan ut den gamla (som går att läsa under tiden). */
async function bygg(namn, fn) {
  fs.mkdirSync(UT, { recursive: true });
  const fil = path.join(UT, `${namn}.sqlite`), tmp = `${fil}.bygger`;
  fs.rmSync(tmp, { force: true });
  const t0 = Date.now();
  const db = new Databas(tmp);
  await fn(db);
  try {
    fs.rmSync(fil, { force: true });
    fs.renameSync(tmp, fil);
  } catch (e) {
    throw new Error(`Kunde inte ersätta ${path.relative(ROOT, fil)} – stäng den i DB Browser och kör igen. (${e.code ?? e.message})`);
  }
  log(`${path.relative(ROOT, fil)}: ${(fs.statSync(fil).size / 1e6).toFixed(0)} MB på ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  for (const [n, t] of db.tabeller) log(`  ${n.padEnd(24)} ${t.rader.toLocaleString('sv-SE')} rader`);
}

// ---------- Fotboll ----------

async function byggFotboll(db) {
  const cfg = lasJson(path.join(ROOT, 'config', 'leagues.json'), {});
  const ids = lasJson(path.join(ROOT, 'config', 'team-ids.json'), {});

  db.tabell('ligor', 'Alla ligor och cuper: kod, namn och land.', 'config/leagues.json + data/ligor', { kolumner: [['liga', 'TEXT'], ['namn', 'TEXT'], ['land', 'TEXT'], ['fotmob_liga_id', 'INTEGER']], nyckel: ['liga'] });
  db.tabell('lag', 'Alla lag med ett fast ID per lag (FotMob-ID, eget ID från 90000001 när FotMob saknas).', 'config/team-ids.json', { kolumner: [['liga', 'TEXT'], ['lag', 'TEXT'], ['lag_id', 'INTEGER']], nyckel: ['liga', 'lag'] });
  db.tabell('matcher', 'Alla matcher per liga: resultat, odds (som chans 0–1), skott, xG, kort, hörnor, signaler. En rad per match.', 'data/matcher/<liga>.csv', { kolumner: MATCH_KOLUMNER.map(([, n, t]) => [n, t]), unik: ['liga', 'datum', 'hemmalag', 'bortalag'] });
  db.tabell('tabell_nu', 'Ligatabellen just nu.', 'data/ligor/<liga>.json (table)', { nyckel: ['liga', 'lag', 'grupp'] });
  db.tabell('tabell_historik', 'Ligatabellen dag för dag (en rad per lag och dag).', 'data/ligor/<liga>.json (tableHistory)', { kolumner: [['liga', 'TEXT'], ['datum', 'TEXT'], ['placering', 'INTEGER'], ['lag', 'TEXT'], ['spelade', 'INTEGER'], ['poang', 'INTEGER'], ['malskillnad', 'INTEGER']], nyckel: ['liga', 'datum', 'lag'] });
  db.tabell('spelare', 'Spelarna i varje lag: position, ålder, marknadsvärde, skada och säsongens siffror (plus förra säsongen).', 'data/spelare/<liga>.json', { nyckel: ['liga', 'lag', 'spelar_id'] });
  db.tabell('tranare', 'Tränare per lag, med när vi först såg dem (tränarbyten).', 'data/trupper/<liga>.json', { nyckel: ['liga', 'lag', 'tranare'] });
  db.tabell('spelare_som_lamnat', 'Spelare som försvunnit ur truppen.', 'data/trupper/<liga>.json (left)', { nyckel: ['liga', 'lag', 'spelar_id'] });
  db.tabell('matchstatistik', 'Matcher från ESPN/365scores med halvtid, domare, arena och formation (kopplas till spelare_i_match via match_id).', 'data/matchstats/<liga>/<år>.json', { nyckel: ['match_id'] });
  db.tabell('spelare_i_match', 'Varje spelares insats i varje match: minuter, mål, assist, skott, kort, byten.', 'data/matchstats/<liga>/<år>.json', { nyckel: ['match_id', 'spelar_id', 'sida'] });
  db.tabell('tips_oddset', 'Våra Oddset-tips: en rad per match och marknad (1X2, över/under, båda gör mål, kort), med utfall och om det blev rätt.', 'data/tipslogg/oddset/<månad>.json', { nyckel: ['tips_id', 'marknad'] });
  db.tabell('tips_stryktipset', 'Våra Stryktips- och Europatipstips: chans, folket, odds, kupong A/B/C och om det satt.', 'data/tipslogg/stryktipset + europatipset', { nyckel: ['tips_id'] });

  for (const [tabell, kolumn, , text] of MATCH_KOLUMNER.map(([, n, t, b]) => ['matcher', n, t, b])) db.kolumnText.push([tabell, kolumn, text]);
  db.kolumnText.push(
    ['spelare', 'marknadsvarde_eur', 'marknadsvärde i euro (Transfermarkt/FotMob)'],
    ['spelare', 'betyg', 'FotMob-betyg i snitt denna säsong'],
    ['tips_oddset', 'chans', 'vår chans för tipset (0–1)'],
    ['tips_oddset', 'varde', 'Värde = oddset är högre än vår chans motiverar, annars Ej värde'],
    ['tips_oddset', 'ratt', '1 = rätt, 0 = fel, tomt = inte avgjord'],
    ['tips_stryktipset', 'folket_1', 'andel av svenska folket som spelat 1 (0–1)'],
    ['tips_stryktipset', 'kupong_a', 'tecknen i kupong A, t.ex. 1X'],
    ['spelare_i_match', 'sida', 'hemma eller borta'],
  );

  db.i(() => {
    const ligor = cfg.leagues ?? {};
    for (const f of jsonFiler(path.join(DATA, 'ligor'))) {
      const d = lasJson(f);
      if (d?.league && !ligor[d.league]) ligor[d.league] = { name: d.name, country: d.country };
      if (d?.league) ligor[d.league] = { ...ligor[d.league], fotmobId: d.fotmobId };
    }
    db.infoga('ligor', Object.entries(ligor).map(([liga, l]) => ({ liga, namn: l.name ?? null, land: l.country ?? null, fotmob_liga_id: l.fotmobId ?? null })));
    db.infoga('lag', Object.entries(ids.leagues ?? {}).flatMap(([liga, lag]) => Object.entries(lag).map(([namn, id]) => ({ liga, lag: namn, lag_id: id }))));
  });

  for (const f of fs.readdirSync(path.join(DATA, 'matcher')).filter((f) => f.endsWith('.csv')).sort()) {
    db.i(() => db.infoga('matcher', parseCsvText(fs.readFileSync(path.join(DATA, 'matcher', f), 'utf8')).map(matchRad)));
  }
  db.i(() => {
    for (const f of jsonFiler(path.join(DATA, 'ligor'))) {
      const d = lasJson(f);
      db.infoga('tabell_nu', aktuellTabellRader(d));
      db.infoga('tabell_historik', tabellRader(d));
    }
    for (const f of jsonFiler(path.join(DATA, 'spelare'))) {
      const d = lasJson(f);
      if (!d?.teams || !d.league) continue;
      db.infoga('spelare', Object.values(d.teams).flatMap((t) => (t.players ?? []).map((p) => spelarRad(p, d.league))));
    }
    for (const f of jsonFiler(path.join(DATA, 'trupper'))) {
      const { tranare, lamnat } = truppRader(lasJson(f));
      db.infoga('tranare', tranare);
      db.infoga('spelare_som_lamnat', lamnat);
    }
  });
  const msDir = path.join(DATA, 'matchstats');
  for (const liga of fs.existsSync(msDir) ? fs.readdirSync(msDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : []) {
    for (const f of jsonFiler(path.join(msDir, liga))) {
      const { matcher, spelare } = matchstatRader(lasJson(f));
      db.i(() => { db.infoga('matchstatistik', matcher); db.infoga('spelare_i_match', spelare); });
    }
  }
  db.i(() => {
    for (const f of jsonFiler(path.join(DATA, 'tipslogg', 'oddset'))) db.infoga('tips_oddset', Object.values(lasJson(f)?.items ?? {}).flatMap(oddsetTipsRader));
    for (const p of ['stryktipset', 'europatipset']) for (const f of jsonFiler(path.join(DATA, 'tipslogg', p))) db.infoga('tips_stryktipset', Object.values(lasJson(f)?.items ?? {}).map(stryktipsRad));
  });

  db.avsluta([
    ['visa_spelade_matcher', 'Spelade matcher med resultat och stängningsodds, senaste först.',
      `SELECT m.liga, l.namn AS liganamn, m.sasong, m.datum, m.hemmalag, m.bortalag, m.hemmamal || '-' || m.bortamal AS slutresultat, m.resultat,
        ROUND(m.stang_chans_1, 3) AS stang_chans_1, ROUND(m.stang_chans_x, 3) AS stang_chans_x, ROUND(m.stang_chans_2, 3) AS stang_chans_2,
        m.hemma_xg, m.borta_xg, m.domare FROM matcher m LEFT JOIN ligor l ON l.liga = m.liga WHERE m.status = 'spelad' ORDER BY m.datum DESC`],
    ['visa_kommande_matcher', 'Kommande matcher, närmast först.',
      `SELECT m.liga, l.namn AS liganamn, m.datum, m.avspark, m.hemmalag, m.bortalag, m.fore_senaste_chans_1, m.fore_senaste_chans_x, m.fore_senaste_chans_2
        FROM matcher m LEFT JOIN ligor l ON l.liga = m.liga WHERE m.status = 'kommande' ORDER BY m.avspark, m.datum`],
    ['visa_tabeller', 'Alla ligatabeller just nu, liga för liga.',
      `SELECT t.liga, l.namn AS liganamn, t.grupp, t.placering, t.lag, t.spelade, t.vunna, t.oavgjorda, t.forlorade, t.gjorda_mal, t.inslappta_mal, t.malskillnad, t.poang
        FROM tabell_nu t LEFT JOIN ligor l ON l.liga = t.liga ORDER BY t.liga, t.grupp, t.placering`],
    ['visa_skadade_spelare', 'Spelare som är skadade eller borta just nu.',
      `SELECT liga, lag, namn, position, marknadsvarde_eur, skada FROM spelare WHERE skada IS NOT NULL ORDER BY liga, lag, marknadsvarde_eur DESC`],
    ['visa_oddset_traffar', 'Hur ofta våra Oddset-tips blivit rätt, per liga och marknad.',
      `SELECT liga, marknad, COUNT(*) AS avgjorda, SUM(ratt) AS ratt, ROUND(100.0 * SUM(ratt) / COUNT(*), 1) AS procent_ratt
        FROM tips_oddset WHERE ratt IS NOT NULL GROUP BY liga, marknad ORDER BY liga, marknad`],
  ], [
    'CREATE INDEX matcher_lag_hemma ON matcher (hemmalag, datum)',
    'CREATE INDEX matcher_lag_borta ON matcher (bortalag, datum)',
    'CREATE INDEX matcher_datum ON matcher (datum)',
    'CREATE INDEX spelare_i_match_spelare ON spelare_i_match (spelar_id)',
    'CREATE INDEX spelare_namn ON spelare (namn)',
  ]);
}

// ---------- Hästar ----------

async function* rader(fil) {
  const strom = fil.endsWith('.gz') ? fs.createReadStream(fil).pipe(zlib.createGunzip()) : fs.createReadStream(fil);
  for await (const line of readline.createInterface({ input: strom, crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    try { yield JSON.parse(line); } catch { /* avbruten rad */ }
  }
}

async function byggHastar(db) {
  const HIST = path.join(DATA, 'hastar', 'historik');
  db.tabell('omgangar', 'Alla spelomgångar (V75, V86, V85, GS75, V64 …): datum, bana och omsättning.', 'data/hastar/historik/<år>.jsonl.gz + data/hastar/raw', { kolumner: [['spel_id', 'TEXT'], ['spelform', 'TEXT'], ['datum', 'TEXT'], ['bana', 'TEXT'], ['status', 'TEXT'], ['omsattning_kr', 'INTEGER']], nyckel: ['spel_id'], ersatt: true });
  db.tabell('utdelning', 'Utdelning per omgång och antal rätt.', 'samma som omgangar', { kolumner: [['spel_id', 'TEXT'], ['antal_ratt', 'INTEGER'], ['vinnande_system', 'INTEGER'], ['utdelning_kr', 'INTEGER']], nyckel: ['spel_id', 'antal_ratt'], ersatt: true });
  db.tabell('avdelningar', 'Vilket lopp som är vilken avdelning i en omgång (kopplar omgangar till lopp).', 'samma som omgangar', { kolumner: [['spel_id', 'TEXT'], ['avdelning', 'INTEGER'], ['lopp_id', 'TEXT']], nyckel: ['spel_id', 'avdelning'], ersatt: true });
  db.tabell('lopp', 'Alla lopp: datum, bana, distans, startmetod, pris. kalla = omgang (spellopp, full data) eller alla lopp (övriga lopp, bara resultat).', 'historik/<år>.jsonl.gz, raw/ och historik/lopp.jsonl', { kolumner: [['lopp_id', 'TEXT'], ['datum', 'TEXT'], ['bana', 'TEXT'], ['loppnummer', 'INTEGER'], ['namn', 'TEXT'], ['distans_m', 'INTEGER'], ['startmetod', 'TEXT'], ['starttid', 'TEXT'], ['forstapris_kr', 'INTEGER'], ['vinnaromsattning_kr', 'INTEGER'], ['underlag', 'TEXT'], ['sport', 'TEXT'], ['status', 'TEXT'], ['kalla', 'TEXT']], nyckel: ['lopp_id'], ersatt: true });
  db.tabell('starter', 'Varje häst i varje lopp: spår, kusk, tränare, skor, odds, streck och resultat.', 'samma som lopp', { kolumner: [['lopp_id', 'TEXT'], ['startnummer', 'INTEGER'], ['spar', 'INTEGER'], ['hast_id', 'INTEGER'], ['hast', 'TEXT']], unik: ['lopp_id', 'hast'], ersatt: true });
  db.tabell('hastar', 'Alla hästar med avel och hemmabana (senaste uppgiften vi sett).', 'samma som starter', { kolumner: [['hast_id', 'INTEGER'], ['namn', 'TEXT'], ['kon', 'TEXT'], ['far', 'TEXT'], ['morfar', 'TEXT'], ['hemmabana', 'TEXT'], ['tranare', 'TEXT'], ['senast_sedd', 'TEXT']], unik: ['namn'], ersatt: true });
  db.tabell('tidigare_starter', 'Hästens tidigare starter som ATG visar före ett lopp (formen), utan dubbletter.', 'records i historik/<år>.jsonl.gz', { unik: ['hast', 'datum', 'bana'] });
  db.tabell('tips_hastar', 'Våra hästtips: de tippade hästarna per avdelning med chans, marknadens chans och om de vann.', 'data/tipslogg/hastar/<månad>.json', { nyckel: ['tips_id', 'startnummer'] });
  db.kolumnText.push(
    ['starter', 'streck', 'andel av V-spelarna som streckat hästen (0–1)'],
    ['starter', 'km_tid', 'kilometertid i sekunder efter 1 minut, t.ex. 13,5 = 1.13,5'],
    ['starter', 'placering', 'placering (0 = oplacerad)'],
    ['starter', 'ordning_i_mal', 'ordning över mållinjen'],
    ['starter', 'skor_fram', '1 = skor fram, 0 = barfota fram'],
    ['hastar', 'morfar', 'moderns far (ATG: grandfather)'],
    ['tips_hastar', 'klass', 'vår rang A–D'],
    ['tips_hastar', 'marknadens_chans', 'chansen enligt streck/odds (0–1)'],
  );

  const sett = new Set();
  const spara = (g) => {
    const r = omgangRader(g);
    db.infoga('omgangar', [r.omgang]);
    db.infoga('utdelning', r.utdelning);
    db.infoga('avdelningar', r.avdelningar);
    db.infoga('lopp', r.lopp);
    db.infoga('starter', r.starter);
    db.infoga('hastar', r.hastar);
    db.infoga('tidigare_starter', r.tidigare);
    for (const l of r.lopp) sett.add(l.lopp_id);
  };
  const ar = fs.existsSync(HIST) ? fs.readdirSync(HIST).filter((f) => /^\d{4}\.jsonl\.gz$/.test(f)).sort() : [];
  const omgangar = new Set();
  for (const f of ar) {
    let n = 0;
    db.db.exec('BEGIN');
    for await (const g of rader(path.join(HIST, f))) { spara(g); omgangar.add(g.id); if (++n % 50 === 0) { db.db.exec('COMMIT'); db.db.exec('BEGIN'); } }
    db.db.exec('COMMIT');
    log(`  hästar ${f}: ${n} omgångar`);
  }
  // Nyare omgångar som bara finns som rådata (de ersätter inte säsongsfilen om båda finns)
  const raw = path.join(DATA, 'hastar', 'raw');
  db.i(() => {
    for (const f of jsonFiler(raw)) {
      const d = lasJson(f);
      const game = d?.main?.game;
      if (!game?.id || omgangar.has(game.id)) continue;
      spara(addExtras(addPrizes(normalizeGame(game, d.main.details ?? {}), game), game));
    }
  });
  // Övriga lopp (bara resultat) – lopp som redan finns från omgångarna hoppas över
  const loppFil = path.join(HIST, 'lopp.jsonl');
  if (fs.existsSync(loppFil)) {
    let n = 0;
    db.db.exec('BEGIN');
    for await (const r of rader(loppFil)) {
      if (sett.has(r.id)) continue;
      const { lopp, starter } = kompaktLoppRader(r);
      db.infoga('lopp', [lopp]);
      db.infoga('starter', starter);
      if (++n % 2000 === 0) { db.db.exec('COMMIT'); db.db.exec('BEGIN'); }
    }
    db.db.exec('COMMIT');
  }
  db.i(() => { for (const f of jsonFiler(path.join(DATA, 'tipslogg', 'hastar'))) db.infoga('tips_hastar', Object.values(lasJson(f)?.items ?? {}).flatMap(hastTipsRader)); });

  // Analyser, uppföljning och bakkörningar
  db.tabell('analyser', 'Vår analys före start: modellens chans, marknadens chans, värde, klass A–D, form, fart, galopprisk och kommentarer per häst.', 'data/hastar/analys/<omgång>.json', { nyckel: ['spel_id', 'avdelning', 'startnummer'], ersatt: true });
  db.tabell('uppfoljning', 'Systemen som låstes före start och hur de gick, per systemtyp och budget.', 'data/hastar/uppfoljning/<omgång>.json', { nyckel: ['spel_id', 'variant', 'budget_kr'], ersatt: true });
  db.tabell('bakkorningar', 'Varje bakkörning (en fil): år, modell, varianter och budgetar.', 'data/hastar/historik/bakkorning-*.json', { nyckel: ['fil'] });
  db.tabell('bakkorning_resultat', 'Bakkörningarnas resultat per variant, budget och spelform: kostnad, vinst, netto, ROI.', 'samma', { nyckel: ['fil', 'variant', 'budget_kr', 'spelform'] });
  db.tabell('bakkorning_omgangar', 'Bakkörningarnas system per omgång: kostnad, vinst, bästa antal rätt och vilka hästar som spelades.', 'samma', { nyckel: ['fil', 'spel_id', 'budget_kr', 'variant'] });
  db.tabell('bakkorning_chanser', 'Modellens chans per häst i bakkörningen (det systemet byggdes på) och om hästen vann.', 'samma', { nyckel: ['fil', 'spel_id', 'avdelning', 'startnummer'] });
  db.kolumnText.push(
    ['bakkorning_omgangar', 'system', 'hästarna per avdelning, t.ex. [[10,5],[7]] = avd 1 nr 10 och 5, avd 2 nr 7'],
    ['bakkorning_chanser', 'marknadens_andel', 'streckets andel (0–1)'],
    ['analyser', 'varde', 'vår chans delat med marknadens (över 1 = spelas för lite)'],
  );
  db.i(() => {
    for (const f of jsonFiler(path.join(DATA, 'hastar', 'analys'))) db.infoga('analyser', hastAnalysRader(lasJson(f, {})));
    for (const f of jsonFiler(path.join(DATA, 'hastar', 'uppfoljning'))) db.infoga('uppfoljning', hastUppfoljningRader(lasJson(f, {})));
  });
  for (const f of fs.existsSync(HIST) ? fs.readdirSync(HIST).filter((f) => /^bakkorning-.*\.json$/.test(f)).sort() : []) {
    const doc = lasJson(path.join(HIST, f));
    if (!doc) continue;
    const r = hastBakkorningRader(f, doc);
    db.i(() => { db.infoga('bakkorningar', [r.korning]); db.infoga('bakkorning_resultat', r.resultat); db.infoga('bakkorning_omgangar', r.omgangar); db.infoga('bakkorning_chanser', r.chanser); });
  }
  // Skrällmissar och fynd (scripts/hastar-skrallmissar.mjs och sessionernas gemensamma fyndlista)
  const T = 'TEXT', I = 'INTEGER', R = 'REAL';
  db.tabell('skrallmissar_avdelningar', 'Varje avdelning i bakkörda system: vann en häst vi hade med? Om inte, var låg vinnaren i modellen (miss_typ)?', 'data/hastar/historik/skrallmissar.json (scripts/hastar-skrallmissar.mjs)', {
    kolumner: [['spel_id', T], ['spelform', T], ['datum', T], ['bana', T], ['avdelning', I], ['system', T], ['budget_kr', I], ['hastar_i_lopp', I], ['hastar_i_systemet', I], ['spik', I], ['vinnare_nr', I], ['vinnare_hast', T], ['vinnare_streck', R], ['vinnare_odds', R], ['vinnare_chans_ren', R], ['vinnare_rank_ren', I], ['vinnare_rank_streck', I], ['vinnare_chans_mkt', R], ['vinnare_rank_mkt', I], ['med_i_systemet', I], ['miss_typ', T], ['sista_med_rank_ren', I], ['overflodiga_hastar', T]],
    nyckel: ['spel_id', 'avdelning', 'system', 'budget_kr'], ersatt: true,
  });
  db.tabell('skrallmissar_hastar', 'Vinnarna vi missade: häst, kusk, tränare, far, spår, streck, modellens chans och rang, och vilken rang som hade behövts.', 'samma som skrallmissar_avdelningar', {
    kolumner: [['spel_id', T], ['avdelning', I], ['startnummer', I], ['hast', T], ['kusk', T], ['tranare', T], ['far', T], ['spar', I], ['distans', I], ['startmetod', T], ['streck', R], ['odds', R], ['chans_ren', R], ['rank_ren', I], ['chans_mkt', R], ['rank_mkt', I], ['rank_streck', I], ['borde_rank', I], ['skal', T]],
    nyckel: ['spel_id', 'avdelning', 'startnummer'], ersatt: true,
  });
  db.tabell('fynd', 'Fynd om hästarna från alla sessioner, stora som små: fakta, infört, avvisat eller förslag.', 'data/hastar/historik/fynd-hastar.json', {
    kolumner: [['id', T], ['datum', T], ['session', T], ['rubrik', T], ['beskrivning', T], ['storlek', T], ['status', T], ['spelform', T], ['siffror', T]],
    nyckel: ['id'], ersatt: true,
  });
  db.kolumnText.push(
    ['skrallmissar_avdelningar', 'miss_typ', 'tomt = vinnaren var med; annars spik föll, precis utanför, mittfält eller långt ner'],
    ['skrallmissar_avdelningar', 'vinnare_rank_ren', 'vinnarens plats i ren data-modellen (1 = modellens etta)'],
    ['skrallmissar_hastar', 'borde_rank', 'vilken plats i modellen hästen hade behövt för att komma med i systemet'],
    ['fynd', 'siffror', 'siffrorna bakom fyndet (JSON-text)'],
  );
  db.i(() => {
    const sm = skrallmissRader(lasJson(path.join(HIST, 'skrallmissar.json')));
    db.infoga('skrallmissar_avdelningar', sm.avdelningar);
    db.infoga('skrallmissar_hastar', sm.hastar);
    db.infoga('fynd', fyndRader(lasJson(path.join(HIST, 'fynd-hastar.json'))));
  });

  sparaRapporter(db, ['data/hastar/historik/lararapport.json', 'data/hastar/backtest.json', 'data/hastar/uppfoljning.json', 'data/hastar/index.json']);

  db.avsluta([
    ['visa_resultat', 'Resultat för alla spellopp: omgång, avdelning, häst, kusk, odds, streck och placering.',
      `SELECT o.datum, o.spelform, o.bana, a.avdelning, l.distans_m, l.startmetod, s.startnummer, s.spar, s.hast, s.kusk, s.tranare,
        s.odds, ROUND(100 * s.streck, 1) AS streck_procent, s.placering, s.ordning_i_mal, s.km_tid, s.galopp
        FROM omgangar o JOIN avdelningar a ON a.spel_id = o.spel_id JOIN lopp l ON l.lopp_id = a.lopp_id JOIN starter s ON s.lopp_id = l.lopp_id
        ORDER BY o.datum DESC, o.spel_id, a.avdelning, s.startnummer`],
    ['visa_vinnare', 'Vinnaren i varje avdelning med vinnarens streck – skrällarna syns direkt.',
      `SELECT o.datum, o.spelform, o.bana, a.avdelning, s.startnummer, s.hast, s.kusk, ROUND(100 * s.streck, 1) AS streck_procent, s.slutodds
        FROM omgangar o JOIN avdelningar a ON a.spel_id = o.spel_id JOIN starter s ON s.lopp_id = a.lopp_id AND s.placering = 1
        ORDER BY o.datum DESC, o.spel_id, a.avdelning`],
    ['visa_omgangar', 'Omgångarna med omsättning och utdelning för alla rätt.',
      `SELECT o.datum, o.spelform, o.bana, o.omsattning_kr, u.antal_ratt, u.vinnande_system, u.utdelning_kr
        FROM omgangar o LEFT JOIN utdelning u ON u.spel_id = o.spel_id AND u.antal_ratt = (SELECT MAX(antal_ratt) FROM utdelning WHERE spel_id = o.spel_id)
        ORDER BY o.datum DESC`],
    ['visa_kuskar', 'Kuskarnas segrar och segerprocent i spelloppen.',
      `SELECT kusk, COUNT(*) AS starter, SUM(placering = 1) AS segrar, ROUND(100.0 * SUM(placering = 1) / COUNT(*), 1) AS segerprocent
        FROM starter WHERE kusk IS NOT NULL AND placering IS NOT NULL GROUP BY kusk HAVING COUNT(*) >= 20 ORDER BY segrar DESC`],
    ['visa_tips_traffar', 'Hur ofta våra tippade hästar vunnit, per spelform och klass (A–D).',
      `SELECT spelform, klass, COUNT(*) AS tippade, SUM(vann) AS vann, ROUND(100.0 * SUM(vann) / COUNT(*), 1) AS procent_vann
        FROM tips_hastar WHERE vann IS NOT NULL GROUP BY spelform, klass ORDER BY spelform, klass`],
    ['visa_bakkorningar', 'Alla bakkörningar sida vid sida: netto och ROI per variant, budget och spelform.',
      `SELECT k.fil, k.ar, k.modell, r.variant, r.budget_kr, r.spelform, r.omgangar, r.kostnad_kr, r.vinst_kr, r.netto_kr, ROUND(100 * r.roi, 1) AS roi_procent, r.omgangar_med_vinst, r.alla_ratt
        FROM bakkorning_resultat r JOIN bakkorningar k ON k.fil = r.fil ORDER BY k.ar, r.spelform, r.netto_kr DESC`],
    ['visa_modell_kalibrering', 'Stämmer modellens chans? Hästarna i varje bakkörning i chansgrupper om 5 %: snittchans mot verklig segerprocent.',
      `SELECT fil, CAST(chans * 20 AS INTEGER) * 5 AS chans_fran_procent, COUNT(*) AS hastar, ROUND(100 * AVG(chans), 1) AS snittchans_procent,
        ROUND(100.0 * AVG(vann), 1) AS vann_procent, ROUND(100 * AVG(marknadens_andel), 1) AS snittstreck_procent
        FROM bakkorning_chanser WHERE vann IS NOT NULL GROUP BY fil, 2 ORDER BY fil, 2`],
    ['visa_fynd', 'Alla fynd om hästarna, senaste först och stora före små.',
      `SELECT datum, storlek, status, spelform, rubrik, beskrivning, session, siffror, id FROM fynd
        ORDER BY datum DESC, CASE storlek WHEN 'stor' THEN 0 WHEN 'liten' THEN 1 ELSE 2 END, rubrik`],
    ['visa_skrallmissar', 'Missade vinnare per miss_typ, spelform, system och budget: hur många och vinnarnas snittstreck.',
      `SELECT spelform, system, budget_kr, COALESCE(miss_typ, 'med') AS utfall, COUNT(*) AS avdelningar,
        ROUND(100 * AVG(vinnare_streck), 1) AS vinnarens_snittstreck_procent, ROUND(AVG(vinnare_rank_ren), 1) AS vinnarens_snittrang
        FROM skrallmissar_avdelningar GROUP BY spelform, system, budget_kr, utfall ORDER BY spelform, system, budget_kr, avdelningar DESC`],
  ], [
    'CREATE INDEX starter_hast ON starter (hast_id)',
    'CREATE INDEX starter_hastnamn ON starter (hast)',
    'CREATE INDEX starter_kusk ON starter (kusk)',
    'CREATE INDEX lopp_datum ON lopp (datum, bana)',
    'CREATE INDEX tidigare_hast ON tidigare_starter (hast_id, datum)',
    'CREATE INDEX omgangar_datum ON omgangar (datum)',
  ]);
}

/** Sammanställningar som inte passar som rader (träningsrapporter, summeringar) sparas hela som JSON-text. */
function sparaRapporter(db, filer) {
  if (!db.tabeller.has('rapporter')) db.tabell('rapporter', 'Övriga sammanställningar och träningsrapporter, hela filen som text (JSON).', 'se kolumnen fil', { kolumner: [['fil', 'TEXT'], ['uppdaterad', 'TEXT'], ['innehall', 'TEXT']], nyckel: ['fil'], ersatt: true });
  db.i(() => {
    for (const rel of filer) {
      const f = path.join(ROOT, rel);
      if (!fs.existsSync(f)) continue;
      db.infoga('rapporter', [{ fil: rel, uppdaterad: fs.statSync(f).mtime.toISOString(), innehall: fs.readFileSync(f, 'utf8') }]);
    }
  });
}

// ---------- Stryktipset och Europatipset ----------

async function byggStryktips(db) {
  const ARKIV = path.join(DATA, 'tips-archive');
  db.tabell('omgangar', 'Alla omgångar av Stryktipset och Europatipset: stängning, omsättning, rätt rad (facit) och antal kryss.', 'data/tips-archive/raw/<produkt>-<omgång>.json (Svenska Spel)', { kolumner: [['produkt', 'TEXT'], ['omgang', 'INTEGER'], ['stanger', 'TEXT'], ['omsattning_kr', 'REAL'], ['radpris_kr', 'REAL'], ['beskrivning', 'TEXT'], ['status', 'TEXT'], ['facit', 'TEXT'], ['antal_kryss', 'INTEGER']], nyckel: ['produkt', 'omgang'] });
  db.tabell('matcher', 'Varje match i varje omgång: lag, liga, avspark, odds, hur svenska folket spelat, tio tidningars tips och utfall.', 'samma som omgangar', { nyckel: ['produkt', 'omgang', 'matchnr'] });
  db.tabell('utdelning', 'Utdelning per omgång för 13, 12, 11 och 10 rätt, med antal vinnare.', 'samma som omgangar', { nyckel: ['produkt', 'omgang', 'antal_ratt'] });
  db.tabell('system', 'Våra kuponger (A, B, C) per omgång: rader, kostnad, chans för 13, bästa antal rätt och vinst. kalla = arkiv (byggd i efterhand), sparad (först sparad), senaste (inför stängning) eller par.', 'data/tips-archive/systems + data/stryktips-history', { nyckel: ['produkt', 'omgang', 'kupong', 'kalla'], ersatt: true });
  db.tabell('system_tecken', 'Tecknen vi spelade per match i varje kupong, med vår chans, marknaden, folket och om tecknet satt.', 'samma som system', { nyckel: ['produkt', 'omgang', 'kupong', 'kalla', 'matchnr'], ersatt: true });
  db.tabell('system_rader', 'Varje rad i varje kupong och hur många rätt den fick.', 'samma som system', { nyckel: ['produkt', 'omgang', 'kupong', 'kalla', 'radnr'], ersatt: true });
  db.tabell('bakkorningar', 'Varje bakkörning (en fil): period, antal omgångar och kostnad/vinst/netto för A, B och C.', 'data/stryktips-backtest-*.json, data/europatips-backtest-*.json', { nyckel: ['fil'] });
  db.tabell('bakkorning_omgangar', 'Bakkörningarnas resultat per omgång och kupong: rader, bästa antal rätt, antal 10–13 rätt, vinst.', 'samma som bakkorningar', { nyckel: ['fil', 'omgang', 'kupong'] });
  db.tabell('bakkorning_matcher', 'Bakkörningarnas matcher: vår chans, marknad, modell, folket, tecken i A/B/C och utfall.', 'samma som bakkorningar', { nyckel: ['fil', 'omgang', 'matchnr'] });
  db.kolumnText.push(
    ['matcher', 'folket_1', 'andel av svenska folket som spelat 1 vid stängning (0–1)'],
    ['matcher', 'folket_tidigare_1', 'folkets andel för 1 vid en tidigare avläsning'],
    ['matcher', 'tio_tidningar_1', 'hur många av tio tidningar som tippat 1'],
    ['matcher', 'startodds_1', 'Svenska Spels odds när omgången öppnade'],
    ['omgangar', 'facit', 'rätt rad, 13 tecken'],
    ['system', 'chans_13', 'vår chans att kupongen får 13 rätt (0–1)'],
    ['system_rader', 'antal_ratt', 'antal rätt för raden mot facit'],
    ['bakkorning_omgangar', 'rader_10', 'antal rader med 10 rätt'],
  );

  // Facit per omgång ur arkivet (används för radernas antal rätt)
  const facit = new Map();
  const raw = jsonFiler(path.join(ARKIV, 'raw')).filter((f) => !f.endsWith('-open.json'));
  db.i(() => {
    for (const f of raw) {
      const r = kupongOmgangRader(lasJson(f, {}));
      if (r.omgang.omgang == null) continue;
      db.infoga('omgangar', [r.omgang]);
      db.infoga('matcher', r.matcher);
      db.infoga('utdelning', r.utdelning);
      if (r.omgang.facit) facit.set(`${r.omgang.produkt}|${r.omgang.omgang}`, r.omgang.facit);
    }
  });
  const system = (doc) => {
    if (!doc?.product) return;
    const r = kupongSystemRader(doc, facit.get(`${doc.product}|${doc.drawNumber}`));
    db.infoga('system', r.system);
    db.infoga('system_tecken', r.tecken);
    db.infoga('system_rader', r.rader);
  };
  db.i(() => {
    for (const f of jsonFiler(path.join(ARKIV, 'systems'))) system(lasJson(f));
    for (const f of jsonFiler(path.join(DATA, 'stryktips-history'))) system(lasJson(f));
  });
  const backtester = fs.readdirSync(DATA).filter((f) => /^(stryktips|europatips)-backtest.*\.json$/.test(f)).sort();
  for (const f of backtester) {
    const doc = lasJson(path.join(DATA, f));
    if (!doc) continue;
    const r = stryktipsBakkorningRader(f, doc);
    db.i(() => { db.infoga('bakkorningar', [r.korning]); db.infoga('bakkorning_omgangar', r.omgangar); db.infoga('bakkorning_matcher', r.matcher); });
  }
  sparaRapporter(db, ['data/stryktipset-statistik.json', 'data/stryktipset.json']);

  db.avsluta([
    ['visa_omgangar', 'Omgångarna med facit, antal kryss och utdelning för 13 rätt.',
      `SELECT o.produkt, o.omgang, substr(o.stanger, 1, 10) AS datum, o.facit, o.antal_kryss, o.omsattning_kr, u.vinnare AS vinnare_13, u.utdelning_kr AS utdelning_13_kr
        FROM omgangar o LEFT JOIN utdelning u ON u.produkt = o.produkt AND u.omgang = o.omgang AND u.antal_ratt = 13 ORDER BY o.stanger DESC`],
    ['visa_skrallar', 'Utfall som folket spelat lite (under 20 %) – skrällarna.',
      `SELECT produkt, omgang, matchnr, hemmalag, bortalag, liga, utfall, ROUND(100 * CASE utfall WHEN '1' THEN folket_1 WHEN 'X' THEN folket_x WHEN '2' THEN folket_2 END, 0) AS folket_procent
        FROM matcher WHERE utfall IS NOT NULL AND (CASE utfall WHEN '1' THEN folket_1 WHEN 'X' THEN folket_x WHEN '2' THEN folket_2 END) < 0.2 ORDER BY folket_procent`],
    ['visa_vara_kuponger', 'Våra kuponger omgång för omgång: kostnad, bästa antal rätt och vinst.',
      `SELECT s.produkt, s.omgang, substr(o.stanger, 1, 10) AS datum, s.kupong, s.kalla, s.rader, s.kostnad_kr, s.bast_ratt, s.vinst_kr, s.netto_kr
        FROM system s LEFT JOIN omgangar o ON o.produkt = s.produkt AND o.omgang = s.omgang ORDER BY o.stanger DESC, s.kupong, s.kalla`],
    ['visa_bakkorningar', 'Alla bakkörningar sida vid sida: netto för A, B och C.',
      `SELECT fil, produkt, fran, till, omgangar, netto_a, netto_b, netto_c, kostnad_a, vinst_a, kostnad_b, vinst_b FROM bakkorningar ORDER BY produkt, fil`],
    ['visa_folket_mot_utfall', 'Hur ofta vinner tecknet folket spelar mest på, per produkt och liga.',
      `SELECT produkt, liga, COUNT(*) AS matcher,
        ROUND(100.0 * AVG(CASE WHEN folket_1 >= folket_x AND folket_1 >= folket_2 THEN utfall = '1' WHEN folket_2 >= folket_x THEN utfall = '2' ELSE utfall = 'X' END), 1) AS folkfavorit_vinner_procent,
        ROUND(100.0 * AVG(utfall = 'X'), 1) AS kryss_procent, ROUND(100 * AVG(folket_x), 1) AS folket_kryss_procent
        FROM matcher WHERE utfall IS NOT NULL AND folket_1 IS NOT NULL GROUP BY produkt, liga HAVING COUNT(*) >= 20 ORDER BY produkt, matcher DESC`],
  ], [
    'CREATE INDEX matcher_lag ON matcher (hemmalag, bortalag)',
    'CREATE INDEX system_rader_ratt ON system_rader (produkt, omgang, antal_ratt)',
  ]);
}

if (!vilka.length || vilka.includes('fotboll')) await bygg('fotboll', byggFotboll);
if (!vilka.length || vilka.includes('stryktips')) await bygg('stryktips', byggStryktips);
if (!vilka.length || vilka.includes('hastar')) await bygg('hastar', byggHastar);
