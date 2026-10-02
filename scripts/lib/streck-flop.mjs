// Streckfavoriter som inte vinner: lag som Svenska folket streckar som favorit (minst 50 % pa lagets seger)
// men som ofta kryssar eller forlorar. Kalla: data/stryktipset-statistik.json (Svenska Spels resultatsidor).
// Flagga (anvandarens regel 2026-10-02): innevarande sasong, minst 2 matcher som streckfavorit och
// minst 50 % utan seger. Forra sasongen visas som jamforelse men flaggar inte.
export const FAV_MIN = 50; // folk-% pa lagets seger for att rakna som streckfavorit
export const MIN_GAMES = 2;
export const FLAG_RATE = 0.5;
// Bara engelska lag ar risklag (anvandaren 2026-10-02: "ha bara med engelska lag pa risklag") - Stryktipset spelas
// pa engelska ligor. Galler panelen och flaggan i kupongen.
export const RISK_COUNTRIES = new Set(['England']);
// Lander dar ligorna spelar over kalenderaret (sasong = ar i st f juli-juni)
const CALENDAR_COUNTRIES = new Set(['Sverige', 'Norge', 'Finland', 'Brasilien', 'Island', 'Irland']);

// Sasongens startdatum (YYYY-MM-DD) for en match/kupong pa datumet `date`
export function seasonStart(date, country) {
  const y = Number(String(date).slice(0, 4));
  if (CALENDAR_COUNTRIES.has(country)) return `${y}-01-01`;
  return String(date).slice(5) >= '07-01' ? `${y}-07-01` : `${y - 1}-07-01`;
}
const prevSeasonStart = (start) => `${Number(start.slice(0, 4)) - 1}${start.slice(4)}`;

// Per lag: matcher som streckfavorit fran `from` till (inte med) `to`
export function streckFavStats(matches, team, from, to) {
  const s = { games: 0, noWin: 0, draws: 0, losses: 0, folkSum: 0, probSum: 0, last: [] };
  for (const m of matches || []) {
    if (m.cancelled || !m.outcome || m.date < from || (to && m.date >= to)) continue;
    const sign = m.home === team ? '1' : m.away === team ? '2' : null;
    if (!sign || !(m[`folk${sign}`] >= FAV_MIN)) continue;
    s.games++;
    s.folkSum += m[`folk${sign}`];
    s.probSum += m[`prob${sign}`] || 0;
    const won = m.outcome === sign;
    if (!won) { s.noWin++; if (m.outcome === 'X') s.draws++; else s.losses++; }
    s.last.push({ date: m.date, opp: sign === '1' ? m.away : m.home, home: sign === '1', folk: m[`folk${sign}`], score: `${m.ftHome}-${m.ftAway}`, res: won ? 'V' : m.outcome === 'X' ? 'O' : 'F' });
  }
  const { folkSum, probSum, ...rest } = s;
  return {
    ...rest,
    rate: s.games ? s.noWin / s.games : null,
    avgFolk: s.games ? Math.round(folkSum / s.games) : null,
    avgOdds: s.games ? Math.round((probSum / s.games) * 100) : null,
    last: s.last.slice(-10).reverse(),
  };
}

// Flagga for ett lag infor en match pa `date`: denna sasong (flaggar) + forra sasongen (jamforelse)
export function teamStreckFlop(matches, team, date, country) {
  const start = seasonStart(date, country);
  const season = streckFavStats(matches, team, start, date);
  const prev = streckFavStats(matches, team, prevSeasonStart(start), start);
  const flag = season.games >= MIN_GAMES && season.rate >= FLAG_RATE;
  return { flag, season, prev: prev.games ? { games: prev.games, noWin: prev.noWin, rate: prev.rate } : null };
}

// Bada lagen i en kupongmatch; null om inget lag flaggas
export function streckFlopFlags(matches, { home, away, date, country }) {
  if (!RISK_COUNTRIES.has(country)) return null;
  const h = teamStreckFlop(matches, home, date, country);
  const a = teamStreckFlop(matches, away, date, country);
  if (!h.flag && !a.flag) return null;
  return { flagged: true, home: h.flag ? h : null, away: a.flag ? a : null };
}

const pct = (x) => `${Math.round(x * 100)} %`;
// Analysrader i klartext
export function streckFlopNotes(sf, home, away) {
  if (!sf?.flagged) return [];
  return [[sf.home, home], [sf.away, away]].filter(([t]) => t).map(([t, name]) => {
    const s = t.season;
    const prev = t.prev ? ` Förra säsongen: ${t.prev.noWin} av ${t.prev.games} (${pct(t.prev.rate)}).` : '';
    return `Streckfavorit utan seger: ${name} har varit streckat som favorit ${s.games} gånger denna säsong (i snitt ${s.avgFolk} %) men inte vunnit ${s.noWin} av dem (${s.draws} kryss, ${s.losses} förluster, ${pct(s.rate)}).${prev}`;
  });
}

// Alla lag med minst MIN_GAMES matcher som streckfavorit denna sasong (varje lags egen sasong, efter landet),
// sorterade pa andel utan seger. risk = flaggas i kupongen. Underlag for panelen "Risklag denna säsong".
export function streckFlopSeasonList(matches, date) {
  const teams = new Map(); // lag -> senaste liga/land
  for (const m of matches || []) {
    if (m.date >= date) continue;
    for (const team of [m.home, m.away]) {
      const cur = teams.get(team);
      if (!cur || m.date >= cur.date) teams.set(team, { date: m.date, league: m.league, country: m.country });
    }
  }
  return [...teams].map(([team, t]) => ({ team, league: t.league, country: t.country, ...teamStreckFlop(matches, team, date, t.country) }))
    .filter((r) => RISK_COUNTRIES.has(r.country) && r.season.games >= MIN_GAMES)
    .map(({ flag, ...r }) => ({ ...r, risk: flag }))
    .sort((a, b) => b.season.rate - a.season.rate || b.season.noWin - a.season.noWin || b.season.avgFolk - a.season.avgFolk);
}

// Topplista: lag som streckats som favorit minst `minGames` ganger och oftast inte vunnit
export function streckFlopTop(matches, from, to, { minGames = 5, limit = 10 } = {}) {
  const teams = new Set();
  for (const m of matches || []) if (m.date >= from && m.date < to) { teams.add(m.home); teams.add(m.away); }
  return [...teams].map((team) => ({ team, ...streckFavStats(matches, team, from, to) }))
    .filter((r) => r.games >= minGames)
    .sort((a, b) => b.rate - a.rate || b.noWin - a.noWin)
    .slice(0, limit);
}
