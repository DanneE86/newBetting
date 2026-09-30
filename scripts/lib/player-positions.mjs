// Positionsgrupper och nyckeltal per grupp for spelarstatistiken (scripts/fetch-player-stats-fotmob.mjs).
// Position mappas fran FotMob (positioner spelaren faktiskt spelat i matcher) och Transfermarkt (klubbens angivna).

export const GROUPS = {
  malvakt: 'Målvakt',
  mittback: 'Mittback',
  ytterback: 'Ytterback',
  defensiv_mittfaltare: 'Defensiv mittfältare',
  central_mittfaltare: 'Central mittfältare',
  offensiv_mittfaltare: 'Offensiv mittfältare',
  ytter: 'Ytter',
  anfallare: 'Anfallare',
};

// FotMobs korta positionsnamn (strPosShort / positionIdsDesc) -> grupp
const FOTMOB_POS = {
  GK: 'malvakt', CB: 'mittback', LB: 'ytterback', RB: 'ytterback', LWB: 'ytterback', RWB: 'ytterback',
  DM: 'defensiv_mittfaltare', CDM: 'defensiv_mittfaltare', CM: 'central_mittfaltare', LM: 'central_mittfaltare', RM: 'central_mittfaltare',
  AM: 'offensiv_mittfaltare', CAM: 'offensiv_mittfaltare', LW: 'ytter', RW: 'ytter', ST: 'anfallare', CF: 'anfallare', SS: 'anfallare',
};
// Transfermarkts positionstext -> grupp. Allmanna (Defender, Midfield, Attack) ger bara grov grupp.
const TM_POS = [
  [/goalkeeper/i, 'malvakt'], [/centre-back/i, 'mittback'], [/left-back|right-back/i, 'ytterback'],
  [/defensive midfield/i, 'defensiv_mittfaltare'], [/attacking midfield/i, 'offensiv_mittfaltare'],
  [/central midfield|left midfield|right midfield/i, 'central_mittfaltare'], [/winger/i, 'ytter'],
  [/centre-forward|second striker|attack|forward/i, 'anfallare'], [/defender/i, 'mittback'], [/midfield/i, 'central_mittfaltare'],
];
// Truppens roll (keepers/defenders/midfielders/attackers) nar inget annat finns
const ROLE_POS = { keepers: 'malvakt', defenders: 'mittback', midfielders: 'central_mittfaltare', attackers: 'anfallare' };

export const fotmobGroup = (short) => (short ? FOTMOB_POS[String(short).split(',')[0].trim().toUpperCase()] ?? null : null);
export const tmGroup = (pos) => (pos ? TM_POS.find(([re]) => re.test(pos))?.[1] ?? null : null);

// Minst sa manga matcher pa FotMobs huvudposition for att den ska ga fore Transfermarkt
const MIN_FOTMOB_MATCHES = 5;
/**
 * Slutlig grupp: FotMobs huvudposition om spelaren har spelat den i minst 5 matcher (faktisk roll i ar),
 * annars Transfermarkt, annars FotMobs huvudposition, annars truppens position/roll.
 */
export function positionGroup({ fotmobMain, fotmobMatches, tm, squadPosition, role }) {
  const fm = fotmobGroup(fotmobMain), t = tmGroup(tm);
  if (fm && (fotmobMatches ?? 0) >= MIN_FOTMOB_MATCHES) return { group: fm, source: 'FotMob' };
  if (t) return { group: t, source: 'Transfermarkt' };
  if (fm) return { group: fm, source: 'FotMob' };
  const sq = fotmobGroup(squadPosition);
  if (sq) return { group: sq, source: 'FotMob-trupp' };
  return { group: ROLE_POS[role] ?? null, source: role ? 'roll' : null };
}

// Svenska namn pa FotMobs statistik (localizedTitleId), samma som pa fotmob.com/sv
export const STAT_LABELS = {
  goals: 'Mål', expected_goals: 'Förväntade mål (xG)', expected_goals_on_target: 'xG på mål (xGOT)', non_penalty_xg: 'xG utan straff',
  shots: 'Skott', ShotsOnTarget: 'Skott på mål', headed_shots: 'Skott via nick',
  assists: 'Assister', expected_assists: 'Förväntade assister (xA)', successful_passes: 'Lyckade passningar',
  successful_passes_accuracy: 'Lyckade passningar %', long_balls_accurate: 'Precisa långbollar', long_ball_succeeeded_accuracy: 'Precisa långbollar %',
  chances_created: 'Skapade chanser', big_chance_created_team_title: 'Skapade stora chanser', crosses_succeeeded: 'Lyckade inlägg',
  crosses_succeeeded_accuracy: 'Lyckade inlägg %',
  dribbles_succeeded: 'Lyckade dribblingar', won_contest_subtitle: 'Lyckade dribblingar %', duel_won: 'Vunna dueller', duel_won_percent: 'Vunna dueller %',
  aerials_won: 'Vunna luftdueller', aerials_won_percent: 'Vunna luftdueller %', touches: 'Bollkontakter',
  touches_opp_box: 'Bollkontakter i motståndarnas straffområde', dispossessed: 'Förlorat bollinnehav', fouls_won: 'Vunna frisparkar',
  penalty_won_title: 'Erhållna straffar',
  defensive_actions: 'Försvarsingripanden', 'matchstats.headers.tackles': 'Tacklingar', interceptions: 'Brutna passningar', fouls: 'Regelbrott',
  recoveries: 'Återerövringar', poss_won_att_3rd_team_title: 'Bollvinster i sista tredjedelen', dribbled_past: 'Dribblad förbi',
  clearances: 'Rensningar', clean_sheet_team_title: 'Hållna nollor', goals_conceded_while_on_pitch: 'Insläppta mål (på planen)',
  expected_goals_against_while_on_pitch: 'xG emot (på planen)',
  yellow_cards: 'Gula kort', red_cards: 'Röda kort',
  saves: 'Räddningar', save_percentage: 'Räddningsprocent', goals_conceded: 'Insläppta mål', goals_prevented: 'Förhindrade mål',
  penalty_saves: 'Räddade straffar', penalty_goals_conceded: 'Insläppta straffmål', penalty_save_percent: 'Räddade straffar %',
  error_led_to_goal: 'Misstag som ledde till mål', keeper_sweeper: 'Agerade libero', keeper_high_claim: 'Höga plockningar',
  // Harledda (raknas i skriptet)
  goals_minus_xg: 'Mål minus xG (avslut)', xgot_minus_xg: 'xGOT minus xG (skottkvalitet)',
  xga_minus_conceded: 'xG emot minus insläppta (på planen)',
};

// Nyckeltal per grupp, viktigast forst. Det som saknas for en spelare hoppas over.
export const KEY_STATS = {
  malvakt: ['goals_prevented', 'save_percentage', 'saves', 'goals_conceded', 'clean_sheet_team_title', 'error_led_to_goal',
    'penalty_saves', 'penalty_save_percent', 'keeper_high_claim', 'keeper_sweeper', 'long_ball_succeeeded_accuracy', 'successful_passes_accuracy'],
  mittback: ['aerials_won', 'aerials_won_percent', 'duel_won_percent', 'clearances', 'interceptions', 'matchstats.headers.tackles',
    'recoveries', 'dribbled_past', 'defensive_actions', 'successful_passes_accuracy', 'long_balls_accurate', 'goals_conceded_while_on_pitch',
    'expected_goals_against_while_on_pitch', 'xga_minus_conceded', 'clean_sheet_team_title', 'fouls', 'headed_shots', 'goals'],
  ytterback: ['matchstats.headers.tackles', 'interceptions', 'recoveries', 'dribbled_past', 'duel_won_percent', 'crosses_succeeeded',
    'crosses_succeeeded_accuracy', 'chances_created', 'expected_assists', 'assists', 'dribbles_succeeded', 'successful_passes_accuracy',
    'expected_goals_against_while_on_pitch', 'goals_conceded_while_on_pitch', 'clean_sheet_team_title'],
  defensiv_mittfaltare: ['interceptions', 'matchstats.headers.tackles', 'recoveries', 'defensive_actions', 'duel_won_percent',
    'aerials_won_percent', 'dribbled_past', 'successful_passes', 'successful_passes_accuracy', 'long_balls_accurate',
    'long_ball_succeeeded_accuracy', 'dispossessed', 'fouls', 'yellow_cards'],
  central_mittfaltare: ['successful_passes', 'successful_passes_accuracy', 'chances_created', 'expected_assists', 'assists',
    'long_balls_accurate', 'recoveries', 'matchstats.headers.tackles', 'interceptions', 'duel_won_percent', 'dribbles_succeeded',
    'expected_goals', 'goals', 'touches', 'poss_won_att_3rd_team_title'],
  offensiv_mittfaltare: ['chances_created', 'big_chance_created_team_title', 'expected_assists', 'assists', 'expected_goals', 'goals',
    'goals_minus_xg', 'shots', 'ShotsOnTarget', 'dribbles_succeeded', 'touches_opp_box', 'poss_won_att_3rd_team_title', 'dispossessed', 'fouls_won'],
  ytter: ['dribbles_succeeded', 'won_contest_subtitle', 'chances_created', 'big_chance_created_team_title', 'expected_assists', 'assists',
    'crosses_succeeeded', 'crosses_succeeeded_accuracy', 'expected_goals', 'goals', 'goals_minus_xg', 'shots', 'touches_opp_box',
    'fouls_won', 'dispossessed', 'poss_won_att_3rd_team_title'],
  anfallare: ['goals', 'expected_goals', 'non_penalty_xg', 'goals_minus_xg', 'expected_goals_on_target', 'xgot_minus_xg', 'shots',
    'ShotsOnTarget', 'headed_shots', 'touches_opp_box', 'aerials_won', 'aerials_won_percent', 'assists', 'expected_assists',
    'big_chance_created_team_title', 'penalty_won_title', 'dispossessed'],
};
