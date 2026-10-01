// Tolkning av FotMobs playerData (samma som fotmob.com/sv/players/<id>): statistik per säsong och form.
// Används av scripts/fetch-player-stats-fotmob.mjs (data/spelare/) och scripts/lib/startelva.mjs (spelare i
// startelvor som saknas i data/spelare, t.ex. landslagsspelare i ligor vi inte hämtar).

// FotMob ger datum som text eller { utcTime }
export const day = (x) => { const v = typeof x === 'string' ? x : x?.utcTime; return typeof v === 'string' ? v.slice(0, 10) : null; };
export const r = (x, d = 2) => (x == null || !Number.isFinite(Number(x)) ? null : Math.round(Number(x) * 10 ** d) / 10 ** d);

// FotMobs statistiksektioner -> { key: [total, per90, percentil per 90] }
export function statMap(doc) {
  const out = {};
  const add = (i) => {
    const v = Number(String(i.statValue ?? '').replace(',', '.'));
    if (!i.localizedTitleId || !Number.isFinite(v)) return;
    out[i.localizedTitleId] = [v, r(i.per90, 3), r(i.percentileRankPer90 ?? i.percentileRank, 1)];
  };
  for (const i of doc?.topStatCard?.items ?? []) add(i);
  for (const g of doc?.statsSection?.items ?? []) for (const i of g.items ?? []) add(i);
  // Harledda
  const v = (k) => out[k]?.[0];
  if (v('goals') != null && v('expected_goals') != null) out.goals_minus_xg = [r(v('goals') - v('expected_goals')), null, null];
  if (v('expected_goals_on_target') != null && v('expected_goals') != null) out.xgot_minus_xg = [r(v('expected_goals_on_target') - v('expected_goals')), null, null];
  if (v('expected_goals_against_while_on_pitch') != null && v('goals_conceded_while_on_pitch') != null)
    out.xga_minus_conceded = [r(v('expected_goals_against_while_on_pitch') - v('goals_conceded_while_on_pitch')), null, null];
  return out;
}

export function form(matches) {
  const played = matches.filter((m) => m.playedInMatch || m.minutesPlayed > 0);
  const last5 = matches.slice(0, 5);
  const ratings = last5.map((m) => Number(m.ratingProps?.rating)).filter((x) => x > 0);
  return {
    last5: {
      matches: last5.length, played: last5.filter((m) => m.minutesPlayed > 0).length, benched: last5.filter((m) => m.onBench && !m.minutesPlayed).length,
      minutes: last5.reduce((a, m) => a + (m.minutesPlayed ?? 0), 0), goals: last5.reduce((a, m) => a + (m.goals ?? 0), 0),
      assists: last5.reduce((a, m) => a + (m.assists ?? 0), 0), avgRating: ratings.length ? r(ratings.reduce((a, b) => a + b) / ratings.length) : null,
    },
    lastPlayed: day(played[0]?.matchDate),
  };
}

// [datum, lag, motstandare, hemma, minuter, betyg, mal, assist, gula, roda, bank, liga]
export const matchRows = (recent, n = 10) => recent.slice(0, n).map((m) => [day(m.matchDate), m.teamName, m.opponentTeamName, m.isHomeTeam ? 1 : 0,
  m.minutesPlayed ?? 0, Number(m.ratingProps?.rating) || null, m.goals ?? 0, m.assists ?? 0, m.yellowCards ?? 0, m.redCards ?? 0, m.onBench ? 1 : 0, m.leagueName]);
