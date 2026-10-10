// Opta (Stats Perform) livescore -> gemensamt matchformat (lib/matchstats.mjs). Ren logik; hämtningen
// (synlig webbläsare, Akamai stoppar headless) ligger i scripts/fetch-opta.mjs.

// Optas "land|tävling" -> vår ligakod
export const OPTA_LEAGUES = {
  'england|Premier League': 'PL', 'england|Championship': 'CH', 'england|League One': 'EL1', 'england|League Two': 'EL2',
  'germany|Bundesliga': 'BL', 'germany|2. Bundesliga': 'BL2', 'spain|Primera División': 'LL', 'spain|Segunda División': 'LL2',
  'italy|Serie A': 'SA', 'italy|Serie B': 'SB', 'france|Ligue 1': 'L1', 'netherlands|Eredivisie': 'ED', 'portugal|Primeira Liga': 'PT',
  'greece|Super League 1': 'GR', 'belgium|First Division A': 'BE', 'scotland|Premiership': 'SC', 'usa|MLS': 'MLS',
  'brazil|Serie A': 'BR', 'brazil|Serie B': 'BR2', 'argentina|Liga Profesional Argentina': 'AR', 'mexico|Liga MX': 'MX',
  'japan|J1 League': 'JP1', 'poland|Ekstraklasa': 'EK', 'croatia|HNL': 'HR', 'czechia|Czech Liga': 'CZ',
  'saudi arabia|Saudi League': 'SAU', 'sweden|Allsvenskan': 'AS', 'sweden|Superettan': 'SE2', 'norway|Eliteserien': 'NO',
  'denmark|Superliga': 'DK', 'korea republic|K League 1': 'KR', 'australia|A-League Men': 'AUS',
  'europe|UEFA Champions League': 'CL', 'europe|UEFA Europa League': 'EL', 'europe|UEFA Conference League': 'ECL',
};

export const optaLeague = (m) => OPTA_LEAGUES[`${m?.comp?.country?.name ?? ''}|${m?.comp?.name ?? ''}`] ?? null;

/** Spelad Opta-match -> { src: 'opta', d, k, h, a, hg, ag, ht, ev: { yc, rc, g1 }, cards: [...] }, annars null. */
export function parseOpta(m) {
  if (m?.status !== 'played' || !m.score?.ft) return null;
  const hid = m.home?.id, aid = m.away?.id;
  const ev = { yc: [0, 0], rc: [0, 0], g1: [0, 0] };
  const cards = [];
  for (const e of m.events ?? []) {
    const i = e.teamId === hid ? 0 : e.teamId === aid ? 1 : -1;
    if (i < 0) continue;
    if (e.entity_type === 'card') {
      if (e.type === 'YC') ev.yc[i]++;
      else { ev.rc[i]++; } // RC och Y2C (andra gula) = utvisning
      cards.push([i ? 'a' : 'h', e.min ?? null, e.type, e.reason ?? null, e.playerName ?? null]);
    }
  }
  const k = Number.isFinite(m.date) ? new Date(m.date * 1000).toISOString() : null;
  return {
    src: 'opta', id: String(m.id), d: k?.slice(0, 10) ?? null, k, h: m.home?.name, a: m.away?.name,
    hg: m.score.ft.home, ag: m.score.ft.away,
    ht: m.score.ht ? [m.score.ht.home, m.score.ht.away] : null,
    ref: null, venue: null, att: null, form: [null, null], t: { h: null, a: null }, ev, cards, p: [],
  };
}
