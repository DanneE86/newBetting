// FotMobs lagstatistik -> vara stilfalt (data/stil/<liga>.json). Anvands av scripts/fetch-team-style.mjs.

// FotMob-statistik -> vart falt
export const STATS = {
  possession_percentage_team: 'poss',
  accurate_pass_team: 'pass',
  accurate_long_balls_team: 'longBalls',
  poss_won_att_3rd_team: 'possWonAtt3rd',
  effective_clearance_team: 'clearances',
  total_tackle_team: 'tackles',
  interception_team: 'interceptions',
  // Fasta situationer (sasongstotal -> per match). SubStatValue = xG fran fasta situationer.
  _set_piece_goals_team: 'spFor',
  _set_piece_goals_conceded_team: 'spAgainst',
  corner_taken_team: 'corners',
};
// Falt som FotMob ger som sasongstotal (raknas om till per match) och deras xG i SubStatValue
export const TOTALS = new Set(['spFor', 'spAgainst', 'corners']);
export const SUB = { spFor: 'spXgFor', spAgainst: 'spXgAgainst' };
export const ALL_FIELDS = [...Object.values(STATS), ...Object.values(SUB)];

/** FotMob-rad -> vara falt. Sasongstotaler (fasta, horn) blir per match, xG fran fasta tas ur SubStatValue. */
export function statFields(field, x) {
  if (!TOTALS.has(field)) return { [field]: x.StatValue };
  const m = x.MatchesPlayed;
  const per = (v) => (m > 0 && Number.isFinite(v) ? Math.round((v / m) * 1000) / 1000 : null);
  const out = { [field]: per(x.StatValue) };
  // xG 0 over en hel sasong = FotMob saknar xG (aldre sasonger), inte noll chanser
  if (SUB[field]) out[SUB[field]] = x.SubStatValue > 0 ? per(x.SubStatValue) : null;
  return out;
}

// Fasta situationer: snitt av mal och xG fran fasta per match (xG jamnar ut slumpen i malen), bara mal om xG saknas
export const spValue = (goals, xg) => (goals == null ? null : xg != null ? (goals + xg) / 2 : goals);

// Stilaxlar (klass 0/1/2 = z < -0,5 / mellan / z > 0,5 inom ligan). Anvands av analyze-style-matchups och analyze-learnings.
export const AXES = {
  poss: { name: 'Bollinnehav (justerat för styrka)', labels: ['Backar hem', 'Balanserat', 'Bollinnehav'] },
  direct: { name: 'Långbollar (justerat för styrka)', labels: ['Kortpass', 'Blandat', 'Direktspel'] },
  press: { name: 'Bollvinster högt upp (justerat för styrka)', labels: ['Lågpress', 'Mellanpress', 'Högpress'] },
  possRaw: { name: 'Bollinnehav (ojusterat)', labels: ['Lite boll', 'Mellan', 'Mycket boll'] },
  spAtt: { name: 'Fasta situationer anfall (justerat för styrka)', labels: ['Svag på fasta', 'Medel på fasta', 'Farlig på fasta'] },
  spDef: { name: 'Fasta situationer försvar (justerat för styrka)', labels: ['Stark mot fasta', 'Medel mot fasta', 'Svag mot fasta'] },
};
export const TEAM_AXES = ['poss', 'direct', 'press', 'spAtt', 'spDef'];

/**
 * Lagets resultat mot olika motstandartyper (data/stilmatchning.json, leagues[liga].teams[lag].vs) -> basta och samsta
 * typerna, aven svaga monster. Stabilitet: 'stabil' (|z| >= 2 och samma hall i bada halvorna), 'samma hall' eller 'svag'.
 */
export function styleSummary(tj, { minN = 15, top = 3 } = {}) {
  const rows = Object.entries(tj?.vs ?? {}).map(([k, v]) => {
    const [axis, type] = k.split('|');
    return { axis, type, ...v, stab: v.strong ? 'stabil' : v.both ? 'samma håll' : 'svag' };
  }).filter((r) => r.n >= minN && Number.isFinite(r.rel));
  return {
    rows,
    best: rows.filter((r) => r.rel > 0).sort((a, b) => b.zRel - a.zRel).slice(0, top),
    worst: rows.filter((r) => r.rel < 0).sort((a, b) => a.zRel - b.zRel).slice(0, top),
  };
}

/** Lagets egna stilklasser (own[axis].c) -> etiketter, t.ex. ['Backar hem', 'Blandat', 'Lågpress', 'Farlig på fasta', 'Stark mot fasta']. */
export const ownStyleLabels = (own) => TEAM_AXES.filter((a) => own?.[a]).map((a) => AXES[a].labels[own[a].c]);
