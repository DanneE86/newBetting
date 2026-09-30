// Transfermarkt som reserv for trupper dar FotMob saknar data (Ettan Norra/Sodra, vissa CL-lag).
// Vanlig HTML-hamtning (ingen inloggning). Sidor utan saison_id ger innevarande trupp.
const BASE = 'https://www.transfermarkt.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Var liga -> Transfermarkts tavling (cup = deltagarsida)
export const TM_COMP = {
  SE3N: { comp: 'SE3N' }, SE3S: { comp: 'SE3S' },
  CL: { comp: 'CL', cup: true }, EL: { comp: 'EL', cup: true }, ECL: { comp: 'UCOL', cup: true },
};
// Ovriga ligor: bara for kontroll av FotMob-trupperna (scripts/verify-squads-tm.mjs)
export const TM_LEAGUE = {
  PL: 'GB1', CH: 'GB2', EL1: 'GB3', EL2: 'GB4', BL: 'L1', BL2: 'L2', LL: 'ES1', LL2: 'ES2', SA: 'IT1', SB: 'IT2', L1: 'FR1',
  ED: 'NL1', PT: 'PO1', GR: 'GR1', AS: 'SE1', SE2: 'SE2', NO: 'NO1', NO2: 'NO2', DK: 'DK1', DK2: 'DK2', EK: 'PL1', JP1: 'JAP1',
  MLS: 'MLS1', MX: 'MEXA', BR: 'BRA1', BR2: 'BRA2', AR: 'AR1N', COL: 'COLP', CZ: 'TS1', HR: 'KR1',
};
for (const [code, comp] of Object.entries(TM_LEAGUE)) TM_COMP[code] ??= { comp };
// Lag vars namn inte liknar Transfermarkts ("liga|vart lagnamn" -> klubb-id)
export const TM_TEAM_ID = {
  'DK2|AaB': '1053', // Aalborg BK
  'DK2|AB Gladsaxe': '362', // Akademisk Boldklub
  'AR|Gimnasia Mendoza': '14687', // Gimnasia y Esgrima de Mendoza (saknas i TM:s AR1N-lista)
  'AR|Aldosivi': '12301', // CA Aldosivi (saknas i TM:s AR1N-lista)
  'AR|Estudiantes Rio Cuarto': '14602', // AA Estudiantes (saknas i TM:s AR1N-lista)
};

async function getHtml(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch { /* forsok igen */ }
    await sleep(2000 * (i + 1));
  }
  return null;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').trim();

/** Klubbar i tavlingen: [{ id, name }] */
export async function tmClubs(code) {
  const c = TM_COMP[code];
  if (!c) return [];
  const html = await getHtml(c.cup ? `${BASE}/x/teilnehmer/pokalwettbewerb/${c.comp}` : `${BASE}/x/startseite/wettbewerb/${c.comp}`);
  const out = new Map();
  for (const m of html?.matchAll(/title="([^"]+)" href="\/[^"]*\/startseite\/verein\/(\d+)/g) ?? []) out.set(m[2], decode(m[1]));
  return [...out].map(([id, name]) => ({ id, name }));
}

function role(pos) {
  if (/goalkeeper/i.test(pos)) return 'keepers';
  if (/back|defender/i.test(pos)) return 'defenders';
  if (/midfield/i.test(pos)) return 'midfielders';
  return 'attackers';
}
function money(v) {
  const m = v?.match(/€([\d.]+)(m|k)/);
  return m ? Math.round(parseFloat(m[1]) * (m[2] === 'm' ? 1e6 : 1e3)) : null;
}

/**
 * Spelare med namnet i Transfermarkts sok: [{ id, name, club }] (club = nuvarande klubb, "Without Club", "Retired" ...)
 */
export async function tmSearchPlayer(name) {
  const html = await getHtml(`${BASE}/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(name)}`);
  const out = [];
  for (const row of html?.split(/<tr class="(?:odd|even)">/).slice(1) ?? []) {
    const m = row.match(/href="\/[^"]*\/profil\/spieler\/(\d+)">([^<]+)<\/a><\/td><\/tr><tr><td>(?:<a title="([^"]+)"|([^<]*))/);
    if (!m) continue;
    const age = row.match(/<td class="zentriert">(\d{1,2})<\/td>/)?.[1];
    out.push({ id: m[1], name: decode(m[2]), club: decode(m[3] ?? m[4] ?? ''), age: age ? Number(age) : null });
  }
  return out;
}

/** Trupp i samma form som FotMob-trupperna (fetch-squads.mjs). Id prefixas "tm" sa de inte krockar med FotMobs. */
export async function tmSquad(clubId, { coach: withCoach = true } = {}) {
  const html = await getHtml(`${BASE}/x/kader/verein/${clubId}/plus/1`);
  if (!html) return null;
  const body = html.slice(html.indexOf('<tbody>'));
  const players = [];
  for (const row of body.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const link = row.match(/profil\/spieler\/(\d+)">\s*([^<]+?)\s*</);
    if (!link) continue;
    const num = row.match(/rn_nummer>(\d+)</)?.[1];
    const pos = row.match(/<tr>\s*<td>\s*([^<]+?)\s*<\/td>\s*<\/tr>/)?.[1] ?? '';
    const born = row.match(/(\d\d)\/(\d\d)\/(\d{4}) \((\d+)\)/);
    const height = row.match(/(\d),(\d\d)m/);
    const injured = row.match(/class="verletzt-table[^"]*" title="([^"]*)"/)?.[1] ?? null;
    players.push({
      id: `tm${link[1]}`, name: decode(link[2]), role: role(pos), position: pos || null, number: num ? Number(num) : null,
      age: born ? Number(born[4]) : null, born: born ? `${born[3]}-${born[2]}-${born[1]}` : null,
      country: row.match(/class="flaggenrahmen"[^>]*title="([^"]+)"|title="([^"]+)" alt="[^"]*" class="flaggenrahmen"/)?.slice(1).find(Boolean) ?? null,
      height: height ? Number(height[1]) * 100 + Number(height[2]) : null,
      value: money(row.match(/marktwertverlauf[^>]*>([^<]+)</)?.[1]), rating: null, goals: null, assists: null, penalties: null, yellow: null, red: null,
      injury: injured ? { typeId: null, expectedReturn: injured } : null,
    });
  }
  if (!players.length) return null;
  if (!withCoach) return { coach: null, players };
  await sleep(800);
  const staff = await getHtml(`${BASE}/x/mitarbeiter/verein/${clubId}`);
  const coach = staff?.match(/profil\/trainer\/\d+">\s*([^<]+?)\s*</)?.[1] ?? null;
  return { coach: coach ? decode(coach) : null, players };
}
