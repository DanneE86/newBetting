// FotMob matchDetails (Optas siffror, lineup.source = optaSdapi) -> lagstatistik och spelarstatistik per match.
// Ren logik; hämtningen ligger i scripts/fetch-fotmob-matcher.mjs. Lagraden används av export-league-matches
// (xG per match där understat/football-data saknas), spelarraderna stannar lokalt (data/fotmob-matcher/<LIGA>/spelare).

// FotMobs lagnyckel -> vår korta nyckel. Värdet sparas som [hemma, borta].
export const TEAM_KEYS = {
  BallPossesion: 'poss', expected_goals: 'xg', expected_goals_open_play: 'xgop', expected_goals_set_play: 'xgsp',
  expected_goals_non_penalty: 'xgnp', expected_goals_on_target: 'xgot', total_shots: 'sh', ShotsOnTarget: 'sot',
  ShotsOffTarget: 'shoff', blocked_shots: 'shb', shots_woodwork: 'wood', shots_inside_box: 'shib', shots_outside_box: 'shob',
  big_chance: 'bigch', big_chance_missed_title: 'bigchm', passes: 'pas', accurate_passes: 'pasok', own_half_passes: 'pasown',
  opposition_half_passes: 'pasopp', long_balls_accurate: 'lb', accurate_crosses: 'cro', player_throws: 'thr',
  touches_opp_box: 'tob', Offsides: 'off', 'matchstats.headers.tackles': 'tkl', interceptions: 'int', shot_blocks: 'blk',
  clearances: 'clr', keeper_saves: 'sav', duel_won: 'duel', ground_duels_won: 'gduel', aerials_won: 'aer',
  dribbles_succeeded: 'drb', yellow_cards: 'yc', red_cards: 'rc', fouls: 'fou', corners: 'cor',
};

// FotMobs spelarnyckel -> vår korta nyckel. Okända nycklar hoppas över.
export const PLAYER_KEYS = {
  rating_title: 'rat', minutes_played: 'min', goals: 'g', assists: 'a', expected_goals: 'xg',
  expected_goals_on_target_variant: 'xgot', expected_goals_non_penalty: 'xgnp', expected_assists: 'xa', total_shots: 'sh',
  ShotsOnTarget: 'sot', blocked_shots: 'shb', accurate_passes: 'pasok', chances_created: 'kp', touches: 'tch',
  touches_opp_box: 'tob', passes_into_final_third: 'p3', accurate_crosses: 'cro', long_balls_accurate: 'lb',
  dispossessed: 'disp', defensive_actions: 'def', 'matchstats.headers.tackles': 'tkl', shot_blocks: 'blk', clearances: 'clr',
  headed_clearance: 'hclr', interceptions: 'int', recoveries: 'rec', dribbled_past: 'drbp', ground_duels_won: 'gduel',
  aerials_won: 'aer', was_fouled: 'fs', fouls: 'fc', duel_won: 'duelw', duel_lost: 'duell', dribbles_succeeded: 'drb',
  saves: 'sav', goals_conceded: 'gc', expected_goals_on_target_faced: 'xgotf', goals_prevented: 'gp', keeper_sweeper: 'swp',
  keeper_high_claim: 'hcl', punches: 'pun', keeper_diving_save: 'dsav', ShotsOffTarget: 'shoff', big_chance_created_team_title: 'bcc',
  big_chance_missed_title: 'bcm', corners: 'cor', Offsides: 'off', player_throws: 'thr', saves_inside_box: 'savib', penalties_won: 'penw',
  penalties_conceded: 'penc', missed_penalty: 'penm', yellow_cards: 'yc', red_cards: 'rc',
};

/** "375 (84%)" -> 375, "1.28" -> 1.28, 52 -> 52, annat -> null */
export function statNum(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

const day = (s) => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null);

/**
 * Lagraden för en spelad match: { src: 'fotmob', id, d, k, h, a, hid, aid, hg, ag, form, rat, s: { xg: [h, a], ... } }.
 * null om matchen inte är spelad eller saknar lag. s är tomt när FotMob saknar statistik för matchen.
 */
export function teamFromDetails(md) {
  const g = md?.general, teams = md?.header?.teams;
  if (!g || !Array.isArray(teams) || teams.length < 2 || g.finished === false) return null;
  const [h, a] = teams;
  const hg = statNum(h.score), ag = statNum(a.score);
  if (hg == null || ag == null) return null;
  const s = {};
  for (const grp of md?.content?.stats?.Periods?.All?.stats ?? []) {
    for (const st of grp?.stats ?? []) {
      const k = TEAM_KEYS[st?.key];
      if (!k || s[k] || st.type === 'title' || !Array.isArray(st.stats)) continue;
      const v = st.stats.map(statNum);
      if (v[0] != null || v[1] != null) s[k] = [v[0], v[1]];
    }
  }
  const lu = md?.content?.lineup;
  const k = g.matchTimeUTCDate ?? null;
  return {
    src: 'fotmob', id: String(g.matchId), d: day(k), k, h: h.name, a: a.name, hid: h.id ?? null, aid: a.id ?? null, hg, ag,
    form: [lu?.homeTeam?.formation ?? null, lu?.awayTeam?.formation ?? null],
    rat: [statNum(lu?.homeTeam?.rating), statNum(lu?.awayTeam?.rating)],
    s,
  };
}

/**
 * Spelarna som spelade i matchen: [{ id, optaId, n, t: 0 hemma / 1 borta, gk, st: 1 startade, s: { xg, min, ... } }].
 * Bråktal (8 av 10 passningar) sparas som värdet plus <nyckel>N = försöken.
 */
export function playersFromDetails(md) {
  const hid = md?.header?.teams?.[0]?.id, aid = md?.header?.teams?.[1]?.id;
  const lu = md?.content?.lineup;
  const starters = new Set([...(lu?.homeTeam?.starters ?? []), ...(lu?.awayTeam?.starters ?? [])].map((p) => p?.id));
  const out = [];
  for (const p of Object.values(md?.content?.playerStats ?? {})) {
    if (!p?.id) continue;
    const t = p.teamId === hid ? 0 : p.teamId === aid ? 1 : null;
    const s = {};
    for (const grp of p.stats ?? []) {
      for (const st of Object.values(grp?.stats ?? {})) {
        const k = PLAYER_KEYS[st?.key];
        if (!k || k in s) continue;
        const v = statNum(st.stat?.value);
        if (v == null) continue;
        s[k] = v;
        const n = statNum(st.stat?.total);
        if (n != null) s[`${k}N`] = n;
      }
    }
    // Bänkade utan speltid har inga siffror
    if (!Object.keys(s).length) continue;
    out.push({ id: p.id, optaId: p.optaId ?? null, n: p.name ?? null, t, gk: !!p.isGoalkeeper, st: starters.has(p.id) ? 1 : 0, s });
  }
  return out;
}

/** Har matchen någon statistik alls (lag eller spelare)? Används för att sluta gå bakåt i säsonger. */
export const hasStats = (team, players) => !!(team && Object.keys(team.s).length) || !!players?.length;

/** Säsongsnamn -> filnamn: "2025/2026" -> "2025-2026", "2026/2027 - Apertura" -> "2026-2027-apertura" */
export const seasonFile = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Nya kolumner i data/matcher/<liga>.csv ur FotMob-lagraden (export-league-matches)
export const FOTMOB_COLS = [
  'xgot_h', 'xgot_a', 'xgop_h', 'xgop_a', 'xgsp_h', 'xgsp_a', 'tob_h', 'tob_a', 'bigchm_h', 'bigchm_a',
  'duel_h', 'duel_a', 'aer_h', 'aer_a', 'clr_h', 'clr_a', 'rat_h', 'rat_a', 'fotmob_id',
];
const blank = (v) => v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v));

/**
 * Fyller matchraden (på plats) ur FotMob-lagraden m. Befintliga värden skrivs aldrig över: xG bara när
 * xg_h/xg_a är tomma (xg_src = fotmob), skott/hörnor/kort/innehav m.m. bara när ESPN/365scores/football-data saknar dem.
 */
export function applyFotmob(r, m) {
  if (!m?.s) return r;
  const s = m.s;
  if (blank(r.xg_h) && blank(r.xg_a) && s.xg?.[0] != null && s.xg?.[1] != null) { r.xg_h = s.xg[0]; r.xg_a = s.xg[1]; r.xg_src = 'fotmob'; }
  const fill = (ch, ca, k) => {
    if (blank(r[ch]) && s[k]?.[0] != null) r[ch] = s[k][0];
    if (blank(r[ca]) && s[k]?.[1] != null) r[ca] = s[k][1];
  };
  const before = ['poss_h', 'hs', 'hst', 'tkl_h'].filter((c) => !blank(r[c])).length;
  fill('hs', 'as', 'sh'); fill('hst', 'ast', 'sot'); fill('hc', 'ac', 'cor'); fill('hf', 'af', 'fou');
  fill('hy', 'ay', 'yc'); fill('hr', 'ar', 'rc');
  for (const k of ['poss', 'pas', 'pasok', 'off', 'sav', 'blk', 'tkl', 'int', 'cro', 'bigch']) fill(`${k}_h`, `${k}_a`, k);
  for (const k of ['xgot', 'xgop', 'xgsp', 'tob', 'bigchm', 'duel', 'aer', 'clr']) { r[`${k}_h`] = s[k]?.[0] ?? null; r[`${k}_a`] = s[k]?.[1] ?? null; }
  if (blank(r.form_h) && m.form?.[0]) r.form_h = m.form[0];
  if (blank(r.form_a) && m.form?.[1]) r.form_a = m.form[1];
  r.rat_h = m.rat?.[0] ?? null; r.rat_a = m.rat?.[1] ?? null;
  r.fotmob_id = m.id;
  if (blank(r.stats_src) && Object.keys(s).length && before === 0) r.stats_src = 'fotmob';
  return r;
}
