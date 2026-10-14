// Lokal databas (SQLite, inbyggd i Node): översätter filerna i data/ till tabeller med svenska namn.
// Filerna är fortfarande originalet – databasen byggs om från dem (scripts/bygg-databas.mjs) och ändrar aldrig dem.
// Ren logik här (ingen disk), så att varje översättning kan testas.

/** Värde som SQLite tar emot: tomt → null, ja/nej → 1/0, objekt → JSON-text. */
export function sqlVarde(v) {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

const tal = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const tecken = { H: '1', D: 'X', A: '2' };

/** CSV-text → rader som objekt (citattecken och komman i fält hanteras). */
export function parseCsvText(text) {
  const lines = String(text).split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const head = lines[0].split(',');
  return lines.slice(1).map((l) => {
    const c = [];
    let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { c.push(cur); cur = ''; } else cur += ch;
    }
    c.push(cur);
    return Object.fromEntries(head.map((h, i) => [h, c[i] ?? '']));
  });
}

// ---------- Fotboll ----------

// Matchfilernas kolumner (data/matcher/<liga>.csv) → [csv-namn, kolumn i databasen, typ, förklaring].
// "hemma minus borta" = signalen räknas för hemmalaget minus bortalaget, bara med data före matchen.
export const MATCH_KOLUMNER = [
  ['status', 'status', 'TEXT', 'spelad, väntar (resultat saknas än) eller kommande'],
  ['league', 'liga', 'TEXT', 'ligakod, t.ex. PL = Premier League (se tabellen ligor)'],
  ['season', 'sasong', 'TEXT', 'säsong, t.ex. 2025/26 eller 2026'],
  ['date', 'datum', 'TEXT', 'matchdag ÅÅÅÅ-MM-DD'],
  ['kickoff', 'avspark', 'TEXT', 'avspark i UTC'],
  ['home', 'hemmalag', 'TEXT', 'hemmalag'],
  ['away', 'bortalag', 'TEXT', 'bortalag'],
  ['hg', 'hemmamal', 'INTEGER', 'hemmalagets mål'],
  ['ag', 'bortamal', 'INTEGER', 'bortalagets mål'],
  ['res', 'resultat', 'TEXT', '1, X eller 2'],
  ['hs', 'hemma_skott', 'INTEGER', 'skott, hemmalaget'],
  ['as', 'borta_skott', 'INTEGER', 'skott, bortalaget'],
  ['hst', 'hemma_skott_pa_mal', 'INTEGER', 'skott på mål, hemmalaget'],
  ['ast', 'borta_skott_pa_mal', 'INTEGER', 'skott på mål, bortalaget'],
  ['xg_h', 'hemma_xg', 'REAL', 'förväntade mål (xG), hemmalaget'],
  ['xg_a', 'borta_xg', 'REAL', 'förväntade mål (xG), bortalaget'],
  ['xg_src', 'xg_kalla', 'TEXT', 'understat, football-data eller skott (uppskattad)'],
  ['referee', 'domare', 'TEXT', 'huvuddomare'],
  ['hc', 'hemma_horn', 'INTEGER', 'hörnor, hemmalaget'],
  ['ac', 'borta_horn', 'INTEGER', 'hörnor, bortalaget'],
  ['hf', 'hemma_frisparkar', 'INTEGER', 'begångna frisparkar (fouls), hemmalaget'],
  ['af', 'borta_frisparkar', 'INTEGER', 'begångna frisparkar (fouls), bortalaget'],
  ['hy', 'hemma_gula', 'INTEGER', 'gula kort, hemmalaget'],
  ['ay', 'borta_gula', 'INTEGER', 'gula kort, bortalaget'],
  ['hr', 'hemma_roda', 'INTEGER', 'röda kort, hemmalaget'],
  ['ar', 'borta_roda', 'INTEGER', 'röda kort, bortalaget'],
  ['open_h', 'oppning_chans_1', 'REAL', 'öppningsoddsens chans för 1 (utan bolagsmarginal, 0–1)'],
  ['open_d', 'oppning_chans_x', 'REAL', 'öppningsoddsens chans för X'],
  ['open_a', 'oppning_chans_2', 'REAL', 'öppningsoddsens chans för 2'],
  ['close_h', 'stang_chans_1', 'REAL', 'stängningsoddsens chans för 1 (utan bolagsmarginal, 0–1)'],
  ['close_d', 'stang_chans_x', 'REAL', 'stängningsoddsens chans för X'],
  ['close_a', 'stang_chans_2', 'REAL', 'stängningsoddsens chans för 2'],
  ['pin_close', 'stang_ar_pinnacle', 'INTEGER', '1 = stängningen är Pinnacle'],
  ['best_open_h', 'basta_oppningsodds_1', 'REAL', 'bästa öppningsodds bland bolagen, 1'],
  ['best_open_d', 'basta_oppningsodds_x', 'REAL', 'bästa öppningsodds, X'],
  ['best_open_a', 'basta_oppningsodds_2', 'REAL', 'bästa öppningsodds, 2'],
  ['best_close_h', 'basta_stangningsodds_1', 'REAL', 'bästa stängningsodds bland bolagen, 1'],
  ['best_close_d', 'basta_stangningsodds_x', 'REAL', 'bästa stängningsodds, X'],
  ['best_close_a', 'basta_stangningsodds_2', 'REAL', 'bästa stängningsodds, 2'],
  ['over25_open', 'oppning_chans_over_2_5', 'REAL', 'öppningsoddsens chans för över 2,5 mål'],
  ['over25_close', 'stang_chans_over_2_5', 'REAL', 'stängningsoddsens chans för över 2,5 mål'],
  ['luck', 'signal_tur', 'REAL', 'tur: poäng minus xG-poäng senaste matcherna, hemma minus borta'],
  ['gap', 'signal_xg_glapp', 'REAL', 'xG-målskillnad minus verklig målskillnad, hemma minus borta'],
  ['mres', 'signal_form_mot_marknad', 'REAL', 'resultat mot marknadens förväntan senaste matcherna, hemma minus borta'],
  ['rest', 'signal_vila_dagar', 'REAL', 'vilodagar, hemma minus borta (−7 till 7)'],
  ['h2h_n', 'inbordes_antal', 'INTEGER', 'antal inbördes möten som räknas'],
  ['h2h_pts', 'inbordes_poang', 'REAL', 'inbördes: hemmalagets poäng minus bortalagets, snitt'],
  ['h2h_res', 'inbordes_mot_marknad', 'REAL', 'inbördes: hemmalagets poäng minus väntade poäng, snitt'],
  ['h2h_draw', 'inbordes_kryss', 'REAL', 'inbördes: kryss minus väntade kryss, snitt'],
  ['promo', 'signal_uppflyttad', 'REAL', 'uppflyttat lag, hemma minus borta'],
  ['releg', 'signal_nedflyttad', 'REAL', 'nedflyttat lag, hemma minus borta'],
  ['miss_h', 'hemma_saknade', 'REAL', 'saknade spelare, hemmalaget'],
  ['miss_a', 'borta_saknade', 'REAL', 'saknade spelare, bortalaget'],
  ['steam', 'signal_oddsrorelse', 'REAL', 'oddsrörelse öppning → stängning i väntade poäng för hemmalaget'],
  ['book', 'signal_bolag_mot_skarp', 'REAL', 'bolagssnittet minus skarp stängning (Pinnacle/Betfair) i väntade poäng'],
  ['pre_first_at', 'fore_forsta_tid', 'TEXT', 'när vi först såg oddsen före matchen'],
  ['pre_first_h', 'fore_forsta_chans_1', 'REAL', 'första avläsningen före matchen, chans 1 (bolagssnitt Sverige)'],
  ['pre_first_d', 'fore_forsta_chans_x', 'REAL', 'första avläsningen, chans X'],
  ['pre_first_a', 'fore_forsta_chans_2', 'REAL', 'första avläsningen, chans 2'],
  ['pre_last_at', 'fore_senaste_tid', 'TEXT', 'senaste avläsningen före matchen'],
  ['pre_last_h', 'fore_senaste_chans_1', 'REAL', 'senaste avläsningen, chans 1'],
  ['pre_last_d', 'fore_senaste_chans_x', 'REAL', 'senaste avläsningen, chans X'],
  ['pre_last_a', 'fore_senaste_chans_2', 'REAL', 'senaste avläsningen, chans 2'],
  ['pre_best_h', 'fore_basta_odds_1', 'REAL', 'bästa odds vi såg före matchen, 1'],
  ['pre_best_d', 'fore_basta_odds_x', 'REAL', 'bästa odds vi såg, X'],
  ['pre_best_a', 'fore_basta_odds_2', 'REAL', 'bästa odds vi såg, 2'],
  ['pre_inj_at', 'franvaro_tid', 'TEXT', 'när frånvaron lästes av (data/trupper)'],
  ['pre_inj_h', 'hemma_skadade_avstangda', 'INTEGER', 'skadade/avstängda före matchen, hemmalaget'],
  ['pre_inj_a', 'borta_skadade_avstangda', 'INTEGER', 'skadade/avstängda före matchen, bortalaget'],
  ['pre_injv_h', 'hemma_franvaro_andel_varde', 'REAL', 'frånvarons andel av truppens marknadsvärde, hemmalaget'],
  ['pre_injv_a', 'borta_franvaro_andel_varde', 'REAL', 'frånvarons andel av truppens marknadsvärde, bortalaget'],
  ['close_src', 'stang_kalla', 'TEXT', 'pinnacle, betfair eller snitt'],
  ['poss_h', 'hemma_bollinnehav', 'REAL', 'bollinnehav %, hemmalaget'],
  ['poss_a', 'borta_bollinnehav', 'REAL', 'bollinnehav %, bortalaget'],
  ['pas_h', 'hemma_passningar', 'INTEGER', 'passningar, hemmalaget'],
  ['pas_a', 'borta_passningar', 'INTEGER', 'passningar, bortalaget'],
  ['pasok_h', 'hemma_lyckade_passningar', 'INTEGER', 'lyckade passningar, hemmalaget'],
  ['pasok_a', 'borta_lyckade_passningar', 'INTEGER', 'lyckade passningar, bortalaget'],
  ['off_h', 'hemma_offside', 'INTEGER', 'offside, hemmalaget'],
  ['off_a', 'borta_offside', 'INTEGER', 'offside, bortalaget'],
  ['sav_h', 'hemma_raddningar', 'INTEGER', 'målvaktsräddningar, hemmalaget'],
  ['sav_a', 'borta_raddningar', 'INTEGER', 'målvaktsräddningar, bortalaget'],
  ['blk_h', 'hemma_blockerade_skott', 'INTEGER', 'blockerade skott, hemmalaget'],
  ['blk_a', 'borta_blockerade_skott', 'INTEGER', 'blockerade skott, bortalaget'],
  ['tkl_h', 'hemma_tacklingar', 'INTEGER', 'tacklingar, hemmalaget'],
  ['tkl_a', 'borta_tacklingar', 'INTEGER', 'tacklingar, bortalaget'],
  ['int_h', 'hemma_brytningar', 'INTEGER', 'brytningar, hemmalaget'],
  ['int_a', 'borta_brytningar', 'INTEGER', 'brytningar, bortalaget'],
  ['cro_h', 'hemma_inlagg', 'INTEGER', 'inlägg, hemmalaget'],
  ['cro_a', 'borta_inlagg', 'INTEGER', 'inlägg, bortalaget'],
  ['att_h', 'hemma_anfall', 'INTEGER', 'anfall, hemmalaget'],
  ['att_a', 'borta_anfall', 'INTEGER', 'anfall, bortalaget'],
  ['bigch_h', 'hemma_stora_chanser', 'INTEGER', 'stora chanser, hemmalaget (bara 365scores)'],
  ['bigch_a', 'borta_stora_chanser', 'INTEGER', 'stora chanser, bortalaget'],
  ['htg_h', 'hemma_mal_halvtid', 'INTEGER', 'mål i halvtid, hemmalaget'],
  ['htg_a', 'borta_mal_halvtid', 'INTEGER', 'mål i halvtid, bortalaget'],
  ['form_h', 'hemma_formation', 'TEXT', 'formation, hemmalaget'],
  ['form_a', 'borta_formation', 'TEXT', 'formation, bortalaget'],
  ['venue', 'arena', 'TEXT', 'arena'],
  ['att', 'publik', 'INTEGER', 'publiksiffra'],
  ['stats_src', 'statistik_kalla', 'TEXT', 'espn, 365 eller opta'],
];

/** En rad ur matchfilen → databasrad (svenska kolumnnamn, tal som tal, H/D/A som 1/X/2). Okända kolumner följer med oförändrade. */
export function matchRad(row) {
  const ut = {};
  const kanda = new Set();
  for (const [csv, namn, typ] of MATCH_KOLUMNER) {
    kanda.add(csv);
    const v = row[csv];
    if (csv === 'res') ut[namn] = tecken[v] ?? (v || null);
    else ut[namn] = typ === 'TEXT' ? (v === '' || v == null ? null : String(v)) : tal(v);
  }
  for (const [k, v] of Object.entries(row)) if (!kanda.has(k)) ut[k] = v === '' ? null : v;
  return ut;
}

/** Ligafilens tabellhistorik (data/ligor/<liga>.json) → en rad per lag och dag. Fältordning enligt fetch-squads.mjs. */
export function tabellRader(doc) {
  const ut = [];
  for (const [datum, rader] of Object.entries(doc?.tableHistory ?? {})) {
    for (const [lag, placering, spelade, poang, malskillnad] of rader) ut.push({ liga: doc.league, datum, placering, lag, spelade, poang, malskillnad });
  }
  return ut;
}

/** Ligans aktuella tabell → rader. */
export function aktuellTabellRader(doc) {
  return (doc?.table ?? []).map((t) => {
    const [gjorda, inslappta] = String(t.goals ?? '').split('-').map(tal);
    return { liga: doc.league, placering: t.rank, lag: t.team, grupp: t.group ?? null, spelade: t.played, vunna: t.won, oavgjorda: t.drawn, forlorade: t.lost, gjorda_mal: gjorda ?? null, inslappta_mal: inslappta ?? null, malskillnad: t.gd, poang: t.pts, fotmob_lag_id: t.fotmobId ?? null, uppdaterad: doc.updatedAt ?? null };
  });
}

// FotMob: varje siffra är [totalt, per 90 min, percentil]
const sasongsvarde = (s, k) => (Array.isArray(s?.stats?.[k]) ? s.stats[k][0] : s?.stats?.[k]) ?? null;

/** Spelare ur data/spelare/<liga>.json → en rad per spelare (aktuell säsong + förra säsongen). */
export function spelarRad(p, liga) {
  const i = p.info ?? {}, s = p.season, f = p.prevSeason, l5 = p.form?.last5 ?? {};
  return {
    spelar_id: p.id, namn: p.name, lag: p.team, liga, utlanad: p.onLoan ?? null,
    position: p.position?.label ?? null, positionsgrupp: p.position?.group ?? null,
    alder: i.age ?? null, fodd: i.born ?? null, langd_cm: i.height ?? null, fot: i.foot ?? null, land: i.country ?? null, trojnummer: i.shirt ?? null,
    marknadsvarde_eur: i.marketValue ?? null, kontrakt_till: i.contractEnd ?? null, kapten: i.captain ?? null, status: i.status ?? null,
    skada: i.injury ? (typeof i.injury === 'object' ? JSON.stringify(i.injury) : String(i.injury)) : null,
    sasong: s?.season ?? null, matcher: sasongsvarde(s, 'matches_uppercase'), starter: sasongsvarde(s, 'player_started_matches'), minuter: sasongsvarde(s, 'minutes_played'),
    mal: sasongsvarde(s, 'goals'), assist: sasongsvarde(s, 'assists') ?? sasongsvarde(s, 'goal_assist'), xg: sasongsvarde(s, 'expected_goals'), xa: sasongsvarde(s, 'expected_assists'),
    betyg: sasongsvarde(s, 'rating'), gula: sasongsvarde(s, 'yellow_cards'), roda: sasongsvarde(s, 'red_cards'),
    forra_sasong: f?.season ?? null, forra_matcher: sasongsvarde(f, 'matches_uppercase'), forra_mal: sasongsvarde(f, 'goals'), forra_assist: sasongsvarde(f, 'assists') ?? sasongsvarde(f, 'goal_assist'), forra_betyg: sasongsvarde(f, 'rating'),
    senaste5_spelade: l5.played ?? null, senaste5_minuter: l5.minutes ?? null, senaste5_mal: l5.goals ?? null, senaste5_assist: l5.assists ?? null, senaste5_betyg: l5.avgRating ?? null,
    senast_spelad: p.form?.lastPlayed ?? null, hamtad: p.fetchedAt ?? null,
  };
}

/** Trupp (data/trupper/<liga>.json) → tränare och spelare som lämnat. */
export function truppRader(doc) {
  const tranare = [], lamnat = [];
  for (const [lag, t] of Object.entries(doc?.teams ?? {})) {
    for (const c of t.coachHistory ?? []) tranare.push({ liga: doc.league, lag, tranare: c.name, forst_sedd: c.firstSeen ?? null, nuvarande: c.name === t.coach ? 1 : 0 });
    for (const x of t.left ?? []) lamnat.push({ liga: doc.league, lag, spelar_id: tal(x.id), namn: x.name, forst_sedd: x.firstSeen ?? null, senast_sedd: x.lastSeen ?? null });
  }
  return { tranare, lamnat };
}

// Matchstatistikens spelarkolumner (data/matchstats, playerCols) → databasnamn.
const SPELARKOLUMN = { id: 'spelar_id', name: 'namn', side: 'sida', pos: 'position', start: 'startade', in: 'inbytt', out: 'utbytt', min: 'minuter', g: 'mal', a: 'assist', og: 'sjalvmal', sh: 'skott', sot: 'skott_pa_mal', sav: 'raddningar', shf: 'skott_mot', gc: 'inslappta_mal', fc: 'begangna_frisparkar', fs: 'vunna_frisparkar', yc: 'gula', rc: 'roda', off: 'offside' };

/** Matchstatistikfil → matcher (en rad per match) och spelare i matchen. */
export function matchstatRader(doc) {
  const matcher = [], spelare = [];
  const cols = doc?.playerCols ?? [];
  for (const m of Object.values(doc?.matches ?? {})) {
    const match_id = `${m.src}:${m.id}`;
    matcher.push({ match_id, kalla: m.src, liga: doc.league, datum: m.d, avspark: m.k ?? null, hemmalag: m.h, bortalag: m.a, hemmamal: m.hg ?? null, bortamal: m.ag ?? null, hemma_mal_halvtid: m.ht?.[0] ?? null, borta_mal_halvtid: m.ht?.[1] ?? null, domare: m.ref ?? null, arena: m.venue ?? null, publik: m.att ?? null, hemma_formation: m.form?.[0] ?? null, borta_formation: m.form?.[1] ?? null });
    for (const p of m.p ?? []) {
      const r = { match_id, liga: doc.league, datum: m.d };
      cols.forEach((c, i) => { r[SPELARKOLUMN[c] ?? c] = c === 'side' ? (p[i] === 'h' ? 'hemma' : p[i] === 'a' ? 'borta' : p[i]) : p[i]; });
      r.lag = r.sida === 'hemma' ? m.h : r.sida === 'borta' ? m.a : null;
      spelare.push(r);
    }
  }
  return { matcher, spelare };
}

/** Oddset-tipsloggen → en rad per match och marknad (senaste tipset före matchen). */
export function oddsetTipsRader(item) {
  const t = item.latest ?? item.first ?? {};
  return Object.entries(t.markets ?? {}).map(([marknad, m]) => {
    const utfall = item.result?.[marknad] ?? null;
    return {
      tips_id: item.id, datum: item.date, avspark: item.kickoff ?? null, liga: item.league, hemmalag: item.home, bortalag: item.away,
      marknad, tips: m.pick ?? null, chans: m.p ?? null, odds: m.odds ?? null, varde: m.value ?? null, linje: m.line ?? null,
      chans_1: m.probs?.home ?? null, chans_x: m.probs?.draw ?? null, chans_2: m.probs?.away ?? null,
      basta_tips: t.topTip ?? null, tipspoang: t.tipScore ?? null,
      utfall, ratt: utfall == null || m.pick == null ? null : utfall === m.pick ? 1 : 0, slutresultat: item.result?.score ?? null, tippad: item.latestAt ?? item.firstAt ?? null,
    };
  });
}

/** Stryktipset/Europatipset-tipsloggen → en rad per match. */
export function stryktipsRad(item) {
  const t = item.latest ?? item.first ?? {};
  const utfall = item.result?.outcome ?? null;
  const k = (b) => t.coupons?.[b]?.signs ?? null;
  const satt = (s) => (s == null || utfall == null ? null : s.includes(utfall) ? 1 : 0);
  return {
    tips_id: item.id, produkt: item.product, omgang: item.draw ?? null, matchnr: item.event ?? null, datum: item.date, avspark: item.kickoff ?? null,
    liga: item.league, hemmalag: item.home, bortalag: item.away,
    chans_1: t.probs?.[0] ?? null, chans_x: t.probs?.[1] ?? null, chans_2: t.probs?.[2] ?? null,
    folket_1: t.folk?.[0] ?? null, folket_x: t.folk?.[1] ?? null, folket_2: t.folk?.[2] ?? null,
    odds_1: t.odds?.[0] ?? null, odds_x: t.odds?.[1] ?? null, odds_2: t.odds?.[2] ?? null,
    enkeltips: t.single ?? null, kupong_a: k('A'), kupong_b: k('B'), kupong_c: k('C'),
    utfall, slutresultat: item.result?.score ?? null, ratt_enkeltips: satt(t.single), ratt_a: satt(k('A')), ratt_b: satt(k('B')), ratt_c: satt(k('C')),
  };
}

// ---------- Hästar ----------

const KON = { gelding: 'valack', mare: 'sto', stallion: 'hingst' };

/**
 * En omgång (data/hastar/historik/<år>.jsonl.gz eller normalizeGame ur raw/) → rader för omgångar, utdelning,
 * avdelningar, lopp, starter, hästar och tidigare starter (hästens historik före loppet).
 */
export function omgangRader(g) {
  const omgang = { spel_id: g.id, spelform: g.type, datum: g.date, bana: g.track, status: g.status ?? null, omsattning_kr: g.turnover ?? null };
  const utdelning = Object.entries(g.payouts ?? {}).map(([ratt, p]) => ({ spel_id: g.id, antal_ratt: tal(ratt), vinnande_system: p?.systems ?? null, utdelning_kr: p?.payout ?? null }));
  const avdelningar = [], lopp = [], starter = [], hastar = [], tidigare = [];
  for (const r of g.races ?? []) {
    avdelningar.push({ spel_id: g.id, avdelning: r.leg, lopp_id: r.id });
    lopp.push({ lopp_id: r.id, datum: String(r.startTime ?? g.date).slice(0, 10), bana: r.track ?? g.track, loppnummer: r.number ?? null, namn: r.name ?? null, distans_m: r.distance ?? null, startmetod: r.startMethod ?? null, starttid: r.startTime ?? null, forstapris_kr: r.firstPrize ?? null, vinnaromsattning_kr: r.winTurnover ?? null, underlag: r.condition ?? null, sport: r.sport ?? null, status: r.status ?? null, kalla: 'omgang' });
    for (const s of r.starts ?? []) {
      const res = s.result ?? {};
      starter.push({
        lopp_id: r.id, startnummer: s.nr, spar: s.post ?? null, distans_m: s.distance ?? null, struken: s.scratched ?? null,
        hast_id: s.horseId ?? null, hast: s.horse, alder: s.age ?? null, kon: KON[s.sex] ?? s.sex ?? null,
        kusk: s.driver ?? null, kusk_id: s.driverId ?? null, tranare: s.trainer ?? null, tranare_id: s.trainerId ?? null,
        skor_fram: s.shoes?.front ?? null, skor_bak: s.shoes?.back ?? null, skobyte: s.shoes?.changed ?? null, sulky: s.sulky?.text ?? null,
        vinstsumma_kr: s.money ?? null, starter_totalt: s.lifeStarts ?? null, segrar_totalt: s.lifeWins ?? null, rekord_km: s.record ?? null, snittodds_5: s.avgOdds5 ?? null,
        odds: s.odds ?? null, streck: s.streck ?? null,
        placering: res.place ?? null, ordning_i_mal: res.finishOrder ?? null, km_tid: res.km ?? null, galopp: res.galloped ?? null, diskad: res.disqualified ?? null, slutodds: res.finalOdds ?? null, prispengar_kr: res.prizeMoney ?? null,
      });
      if (s.horseId != null || s.horse) hastar.push({ hast_id: s.horseId ?? null, namn: s.horse, kon: KON[s.sex] ?? s.sex ?? null, far: s.father ?? null, morfar: s.grandfather ?? null, hemmabana: s.horseHome ?? null, tranare: s.trainer ?? null, senast_sedd: g.date });
      for (const rec of s.records ?? []) {
        tidigare.push({ hast_id: s.horseId ?? null, hast: s.horse, datum: rec.date, bana: rec.track ?? null, placering: rec.place ?? null, galopp: rec.galloped ?? null, diskad: rec.disqualified ?? null, struken: rec.scratched ?? null, km_tid: rec.km ?? null, odds: rec.odds ?? null, startmetod: rec.startMethod ?? null, distans_m: rec.distance ?? null, spar: rec.post ?? null, kusk: rec.driver ?? null, kusk_id: rec.driverId ?? null, forstapris_kr: rec.firstPrize ?? null, skor_fram: rec.shoes?.front ?? null, skor_bak: rec.shoes?.back ?? null, underlag: rec.trackCondition ?? null, sport: rec.sport ?? null });
      }
    }
  }
  return { omgang, utdelning, avdelningar, lopp, starter, hastar, tidigare };
}

/** En rad ur lopp.jsonl (compactRace i hast-lopp.mjs) → lopp och starter. */
export function kompaktLoppRader(r) {
  const lopp = { lopp_id: r.id, datum: r.date, bana: r.track ?? null, loppnummer: tal(String(r.id).split('_')[2]), distans_m: r.dist ?? null, startmetod: r.method ?? null, kalla: 'alla lopp' };
  const starter = (r.starts ?? []).map(([hast_id, hast, placering, ordning, km, galopp, diskad, odds]) => ({ lopp_id: r.id, hast_id, hast, placering, ordning_i_mal: ordning, km_tid: km, galopp, diskad, slutodds: odds }));
  return { lopp, starter };
}

/** Hästtipsloggen → en rad per tippad häst. */
export function hastTipsRader(item) {
  const t = item.latest ?? item.first ?? {};
  const vinnare = item.result?.winners ?? null;
  const spikar = [t.spik].flat().filter((x) => x != null);
  return (t.top ?? []).map((h, i) => ({
    tips_id: item.id, spel_id: item.game, spelform: item.type, avdelning: item.leg, loppnummer: item.race, datum: item.date, starttid: item.kickoff ?? null, bana: item.track ?? null,
    ordning: i + 1, startnummer: h.nr, hast: h.horse, chans: h.p ?? null, marknadens_chans: h.marketP ?? null, klass: h.rank ?? null,
    spik: spikar.includes(h.nr) ? 1 : 0, favorit: t.favorite === h.nr ? 1 : 0,
    vann: vinnare == null ? null : vinnare.includes(h.nr) ? 1 : 0,
  }));
}

// ---------- SQL ----------

/** CREATE TABLE ur kolumner [namn, typ] (typen gissas ur första raden om den saknas). */
export function skapaTabellSql(tabell, kolumner, { nyckel = null, unik = null } = {}) {
  const delar = kolumner.map(([n, t]) => `"${n}" ${t ?? ''}`.trim());
  if (nyckel) delar.push(`PRIMARY KEY (${nyckel.map((n) => `"${n}"`).join(', ')})`);
  if (unik) delar.push(`UNIQUE (${unik.map((n) => `"${n}"`).join(', ')})`);
  return `CREATE TABLE "${tabell}" (\n  ${delar.join(',\n  ')}\n)`;
}

/** Kolumntyp ur exempelvärden. */
export function gissaTyp(varden) {
  let typ = null;
  for (const v of varden) {
    if (v == null || v === '') continue;
    if (typeof v === 'boolean') typ ??= 'INTEGER';
    else if (typeof v === 'number') typ = Number.isInteger(v) && typ !== 'REAL' ? 'INTEGER' : 'REAL';
    else return 'TEXT';
  }
  return typ ?? 'TEXT';
}

// ---------- Stryktipset och Europatipset ----------

/** Svenska Spels belopp "1119407,00" → 1119407. */
export const kronor = (s) => tal(String(s ?? '').replace(/\s/g, '').replace(',', '.'));
/** Svenska Spels procent "35" → 0,35. */
const andel = (s) => { const n = kronor(s); return n == null ? null : Math.round(n * 10) / 1000; };
const antalRatt = (namn) => tal(String(namn ?? '').match(/\d+/)?.[0]);
/** Antal rätt för en rad mot facit (13 tecken). Okänt facit → null. */
export const ratt = (rad, facit) => (!facit || !rad ? null : [...rad].filter((t, i) => t === facit[i]).length);

/** En omgång ur tips-archive/raw (Svenska Spels svar) → omgång, matcher med folket/odds/tio tidningar och utdelning. */
export function kupongOmgangRader(entry) {
  const d = entry?.draw ?? {}, res = entry?.result ?? {};
  const produkt = entry?.product ?? String(d.productName ?? '').toLowerCase();
  const omgang = entry?.drawNumber ?? d.drawNumber;
  const utfall = new Map((res.events ?? []).map((e) => [e.eventNumber, e]));
  const matcher = (d.drawEvents ?? []).map((e) => {
    const r = utfall.get(e.eventNumber) ?? {};
    const lag = Object.fromEntries((e.match?.participants ?? []).map((p) => [p.type, p.name]));
    const o = e.odds ?? {}, so = e.startOdds ?? {}, sf = e.svenskaFolket ?? {}, tt = e.tioTidningarsTips ?? {};
    return {
      produkt, omgang, matchnr: e.eventNumber, hemmalag: lag.home ?? null, bortalag: lag.away ?? null, liga: e.match?.league?.name ?? null, land: e.match?.league?.country?.name ?? null,
      avspark: e.match?.matchStart ?? null, struken: e.cancelled || r.cancelled ? 1 : 0,
      odds_1: kronor(o.one), odds_x: kronor(o.x), odds_2: kronor(o.two), startodds_1: kronor(so.one), startodds_x: kronor(so.x), startodds_2: kronor(so.two),
      folket_1: andel(sf.one), folket_x: andel(sf.x), folket_2: andel(sf.two), folket_tid: sf.date ?? null,
      folket_tidigare_1: andel(sf.refOne), folket_tidigare_x: andel(sf.refX), folket_tidigare_2: andel(sf.refTwo),
      tio_tidningar_1: tt.one ?? null, tio_tidningar_x: tt.x ?? null, tio_tidningar_2: tt.two ?? null,
      utfall: r.outcome ?? null, hemmamal: r.outcomeScore?.home ?? null, bortamal: r.outcomeScore?.away ?? null,
    };
  });
  const facit = matcher.length === 13 && matcher.every((m) => m.utfall) ? matcher.map((m) => m.utfall).join('') : null;
  const omg = {
    produkt, omgang, stanger: d.regCloseTime ?? res.regCloseTime ?? null, omsattning_kr: kronor(res.currentNetSale ?? d.currentNetSale), radpris_kr: kronor(d.rowPrice),
    beskrivning: d.drawComment ?? null, status: d.drawState ?? null, facit, antal_kryss: facit ? [...facit].filter((t) => t === 'X').length : null,
  };
  const utdelning = (res.distribution ?? []).map((x) => ({ produkt, omgang, antal_ratt: antalRatt(x.name), vinnare: x.winners ?? null, utdelning_kr: kronor(x.amount) }));
  return { omgang: omg, matcher, utdelning };
}

// Kupongerna i data/stryktips-history: sparad = först sparade, senaste = senast inför stängning, par = A:s par till B.
const HIST_KUPONG = { saved: ['A', 'sparad'], latest: ['A', 'senaste'], savedB: ['B', 'sparad'], latestB: ['B', 'senaste'], pairA: ['A', 'par'], savedC: ['C', 'sparad'], latestC: ['C', 'senaste'] };

/**
 * Våra system för en omgång → system (en rad per kupong), tecken per match och alla rader med antal rätt.
 * doc = tips-archive/systems (kalla 'arkiv', kupong A/B/C) eller stryktips-history (kalla sparad/senaste/par).
 */
export function kupongSystemRader(doc, facit = null) {
  const produkt = doc.product, omgang = doc.drawNumber;
  facit ??= doc.outcomes ?? doc.result?.outcomes ?? null;
  const delar = [];
  for (const k of ['A', 'B', 'C']) if (doc[k]?.rowList) delar.push([k, 'arkiv', doc[k], doc[k].evaluation, doc.matches]);
  for (const [nyckel, [k, kalla]] of Object.entries(HIST_KUPONG)) if (doc[nyckel]?.rowList) delar.push([k, kalla, doc[nyckel], doc.evaluation?.[nyckel], doc[nyckel].matches]);
  const system = [], tecken = [], rader = [];
  for (const [kupong, kalla, s, ev, matcher] of delar) {
    const nyckel = { produkt, omgang, kupong, kalla };
    const best = ev?.best ?? (facit ? Math.max(...s.rowList.map((r) => ratt(r, facit))) : null);
    system.push({ ...nyckel, sparad: s.at ?? doc.builtAt ?? null, rader: s.rows ?? s.rowList.length, kostnad_kr: s.cost ?? null, grundrader: s.grundRows ?? null, chans_13: s.hitAll ?? null, bast_ratt: best, vinst_kr: ev?.winnings ?? null, netto_kr: ev?.net ?? null, ratt_grundrad: ev?.groundCorrect ?? null, regler: s.rules ?? null });
    (s.picks ?? []).forEach((t, i) => {
      const m = matcher?.[i] ?? {};
      tecken.push({ ...nyckel, matchnr: i + 1, match: m.match ?? null, tecken: t, var_chans_1: m.final?.[0] ?? null, var_chans_x: m.final?.[1] ?? null, var_chans_2: m.final?.[2] ?? null, marknad_1: m.market?.[0] ?? null, marknad_x: m.market?.[1] ?? null, marknad_2: m.market?.[2] ?? null, folket_1: m.folk?.[0] ?? null, folket_x: m.folk?.[1] ?? null, folket_2: m.folk?.[2] ?? null, utfall: m.outcome ?? facit?.[i] ?? null, satt: facit?.[i] ? (t.includes(facit[i]) ? 1 : 0) : null });
    });
    s.rowList.forEach((rad, i) => rader.push({ ...nyckel, radnr: i + 1, rad, antal_ratt: ratt(rad, facit) }));
  }
  return { system, tecken, rader };
}

/** Bakkörningsfil (data/stryktips-backtest-*.json, europatips-backtest-*.json) → körning, omgångar per kupong och matcher. */
export function stryktipsBakkorningRader(fil, doc) {
  const s = doc?.summary ?? {};
  const produkt = s.product ?? doc?.product ?? (fil.startsWith('europatips') ? 'europatipset' : 'stryktipset');
  const korning = { fil, produkt, skapad: doc?.generatedAt ?? null, fran: s.from ?? doc?.from ?? null, till: s.to ?? doc?.to ?? null, omgangar: s.draws ?? (Array.isArray(doc?.draws) ? doc.draws.length : doc?.draws ?? null), modellvikt: s.modelWeight ?? null, sammanfattning: s && Object.keys(s).length ? s : doc };
  for (const k of ['A', 'B', 'C']) Object.assign(korning, { [`kostnad_${k.toLowerCase()}`]: s[k]?.cost ?? null, [`vinst_${k.toLowerCase()}`]: s[k]?.winnings ?? null, [`netto_${k.toLowerCase()}`]: s[k]?.net ?? null });
  const omgangar = [], matcher = [];
  for (const d of Array.isArray(doc?.draws) ? doc.draws : []) {
    for (const k of ['A', 'B', 'C']) {
      const x = d[k];
      if (!x) continue;
      const pc = x.perClass ?? {};
      omgangar.push({ fil, produkt, omgang: d.drawNumber, datum: d.date ?? null, facit: d.outcomes ?? null, kupong: k, rader: x.rows ?? null, kostnad_kr: x.cost ?? null, grundrader: x.grund ?? null, chans_13: x.hit ?? null, bast_ratt: x.best ?? null, vinst_kr: x.winnings ?? null, netto_kr: x.net ?? null, ratt_grundrad: x.groundCorrect ?? null, rader_13: pc[13] ?? 0, rader_12: pc[12] ?? 0, rader_11: pc[11] ?? 0, rader_10: pc[10] ?? 0, utdelning_13_kr: kronor(d.prize13?.amount), vinnare_13: d.prize13?.winners ?? null });
    }
    for (const m of d.matches ?? []) {
      matcher.push({ fil, produkt, omgang: d.drawNumber, matchnr: m.n, match: m.match ?? null, liga: m.league ?? null, utfall: m.outcome ?? null, slutresultat: m.score ?? null, var_chans_1: m.final?.[0] ?? null, var_chans_x: m.final?.[1] ?? null, var_chans_2: m.final?.[2] ?? null, marknad_1: m.market?.[0] ?? null, marknad_x: m.market?.[1] ?? null, marknad_2: m.market?.[2] ?? null, modell_1: m.model?.[0] ?? null, modell_x: m.model?.[1] ?? null, modell_2: m.model?.[2] ?? null, folket_1: m.folk?.[0] ?? null, folket_x: m.folk?.[1] ?? null, folket_2: m.folk?.[2] ?? null, tecken_a: m.pickA ?? null, tecken_b: m.pickB ?? null, tecken_c: m.pickC ?? null });
    }
  }
  return { korning, omgangar, matcher };
}

// ---------- Hästar: bakkörningar, analyser och uppföljning ----------

/** Hästarnas bakkörningsfil (historik/bakkorning-*.json) → körning, resultat per spelform/variant/budget, omgångar och modellens chanser. */
export function hastBakkorningRader(fil, doc) {
  const korning = { fil, ar: doc.year ?? null, modell: doc.model ?? null, alpha: doc.alpha == null ? null : String(doc.alpha), varianter: (doc.variants ?? []).join(','), budgetar: (doc.budgets ?? []).join(','), hogsta_rad_minst: doc.minTop ?? null, uppdaterad: doc.updatedAt ?? null, notering: doc.note ?? null };
  const resultat = [];
  for (const [variant, perBudget] of Object.entries(doc.summary ?? {})) {
    for (const [budget, perForm] of Object.entries(perBudget ?? {})) {
      for (const [spelform, x] of Object.entries(perForm ?? {})) {
        if (!x || typeof x !== 'object') continue;
        resultat.push({ fil, variant, budget_kr: tal(budget), spelform: spelform === 'all' ? 'alla' : spelform, omgangar: x.games ?? null, kostnad_kr: x.cost ?? null, vinst_kr: x.win ?? null, netto_kr: x.net ?? null, roi: x.roi ?? null, omgangar_med_vinst: x.hitGames ?? null, alla_ratt: x.allRight ?? null, storsta_vinst_kr: x.biggest?.win ?? null, storsta_vinst_omgang: x.biggest?.id ?? null, storsta_nedgang_kr: x.maxDrawdown ?? null });
      }
    }
  }
  const omgangar = [], chanser = [];
  for (const g of doc.games ?? []) {
    for (const [budget, perVariant] of Object.entries(g.by ?? {})) {
      for (const [variant, x] of Object.entries(perVariant ?? {})) {
        omgangar.push({ fil, spel_id: g.id, spelform: g.type, datum: g.date, bana: g.track ?? null, budget_kr: tal(budget), variant, kostnad_kr: x.cost ?? null, vinst_kr: x.win ?? null, netto_kr: x.net ?? null, bast_ratt: x.best ?? null, system: x.system ?? null, vinnare: g.winners ?? null });
      }
    }
    (g.field ?? []).forEach((falt, i) => {
      for (const [nr, p, marknad, klass] of falt) chanser.push({ fil, spel_id: g.id, avdelning: i + 1, startnummer: nr, chans: p, marknadens_andel: marknad, klass, vann: g.winners?.[i] ? (g.winners[i].includes(nr) ? 1 : 0) : null });
    });
  }
  return { korning, resultat, omgangar, chanser };
}

/** Vår analys av en omgång (data/hastar/analys) → en rad per häst med modellens chans, poäng och kommentarer. */
export function hastAnalysRader(a) {
  const ut = [];
  for (const r of a.races ?? []) {
    for (const h of r.horses ?? []) {
      ut.push({
        spel_id: a.id, spelform: a.type, datum: a.date, bana: a.track ?? null, avdelning: r.leg, lopp_id: r.id, startnummer: h.nr, hast: h.horse, struken: h.scratched ?? null,
        chans: h.p ?? null, marknadens_chans: h.marketP ?? null, streck: h.streck ?? null, odds: h.odds ?? null, varde: h.value ?? null, ar_varde: h.isValue ?? null, klass: h.rank ?? null,
        formpoang: h.formScore ?? null, galopprisk: h.gallopRisk ?? null, fart: h.speed ?? null, kusk_segerprocent: h.driverWin ?? null, tranare_segerprocent: h.trainerWin ?? null,
        poang: h.scores ?? null, position: h.position ?? null, kommentarer: (h.comments ?? []).join(' · ') || null,
        placering: h.result?.place ?? null, ordning_i_mal: h.result?.finishOrder ?? null,
      });
    }
  }
  return ut;
}

/** Skrällmissarna (data/hastar/historik/skrallmissar.json, scripts/hastar-skrallmissar.mjs) → avdelningar och missade hästar. */
export function skrallmissRader(doc) {
  return { avdelningar: doc?.avdelningar ?? [], hastar: doc?.missade_hastar ?? [] };
}

/** Fynden (data/hastar/historik/fynd-hastar.json) → en rad per fynd, siffrorna som JSON-text. */
export function fyndRader(doc) {
  return (doc?.fynd ?? []).map((f) => ({ id: f.id, datum: f.datum ?? null, session: f.session ?? null, rubrik: f.rubrik ?? null, beskrivning: f.beskrivning ?? null, storlek: f.storlek ?? null, status: f.status ?? null, spelform: f.spelform ?? null, siffror: f.siffror ?? null }));
}

/** Uppföljningen (data/hastar/uppfoljning/<id>.json, låsta system före start) → en rad per system och budget. */
export function hastUppfoljningRader(u) {
  const ut = [];
  for (const [variant, perBudget] of Object.entries(u.systems ?? {})) {
    for (const [budget, s] of Object.entries(perBudget ?? {})) {
      ut.push({ spel_id: u.id, spelform: u.type, datum: u.date, bana: u.track ?? null, last: u.frozenAt ?? null, variant, budget_kr: tal(budget), rader: s.rows ?? null, kostnad_kr: s.cost ?? null, chans_alla_ratt: s.hit ?? null, vinst_kr: s.result?.win ?? null, netto_kr: s.result?.net ?? null, bast_ratt: s.result?.best ?? null, system: s.legs ?? null });
    }
  }
  return ut;
}

export const DATABASER = ['fotboll', 'stryktips', 'hastar'];

/** Vilka databaser som ska byggas om automatiskt: de som saknas eller inte byggts på `dagar` dygn. andrad: { namn: mtimeMs | null }. */
export function databaserAttBygga(andrad, nu = Date.now(), dagar = 3) {
  return DATABASER.filter((n) => andrad?.[n] == null || nu - andrad[n] >= dagar * 864e5);
}
