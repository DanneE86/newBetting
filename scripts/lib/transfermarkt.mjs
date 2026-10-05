// Transfermarkt som reserv for trupper dar FotMob saknar data (Ettan Norra/Sodra, vissa CL-lag).
// Vanlig HTML-hamtning (ingen inloggning). Sidor utan saison_id ger innevarande trupp.
import { nameScore } from './match-context.mjs';
import { getText } from './http.mjs';

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
  ED: 'NL1', PT: 'PO1', GR: 'GR1', AS: 'SE1', SE2: 'SE2', NO: 'NO1', NO2: 'NO2', DK: 'DK1', EK: 'PL1', JP1: 'JAP1',
  MLS: 'MLS1', MX: 'MEXA', BR: 'BRA1', BR2: 'BRA2', AR: 'AR1N', COL: 'COLP', CZ: 'TS1', HR: 'KR1',
};
for (const [code, comp] of Object.entries(TM_LEAGUE)) TM_COMP[code] ??= { comp };
// Lag vars namn inte liknar Transfermarkts ("liga|vart lagnamn" -> klubb-id)
export const TM_TEAM_ID = {
  'AR|Gimnasia Mendoza': '14687', // Gimnasia y Esgrima de Mendoza (saknas i TM:s AR1N-lista)
  'AR|Aldosivi': '12301', // CA Aldosivi (saknas i TM:s AR1N-lista)
  'AR|Estudiantes Rio Cuarto': '14602', // AA Estudiantes (saknas i TM:s AR1N-lista)
};

const getHtml = (url) => getText(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, orNull: true, retries: 2, retryDelayMs: 2000 });

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

// ---- Namn- och klubbjamforelse FotMob <-> Transfermarkt (verify-squads-tm.mjs, fetch-player-stats-fotmob.mjs) ----
export const fold = (x) => String(x).replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').replace(/[æÆ]/g, 'ae').replace(/ß/g, 'ss').replace(/[đĐ]/g, 'd')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
// FotMob skriver ibland o som oe (Bjoerklund), Transfermarkt som o
export const loose = (x) => fold(x).replace(/oe/g, 'o').replace(/ae/g, 'a').replace(/ue/g, 'u').replace(/aa/g, 'a');
export function sameName(a, b) {
  const x = loose(a), y = loose(b);
  if (x === y || ` ${y} `.includes(` ${x} `) || ` ${x} `.includes(` ${y} `)) return true;
  const xs = x.split(' '), ys = y.split(' ');
  return xs.length > 1 && ys.length > 1 && xs.at(-1) === ys.at(-1) && xs[0][0] === ys[0][0];
}
export const foldClub = (x) => String(x).replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
export const clubScore = (a, b) => Math.max(nameScore(foldClub(a), null, foldClub(b)), nameScore(foldClub(b), null, foldClub(a)));
// Samma klubb, aven dess U19/U21/B-lag
export const YOUTH = /\b(u\s?\d\d|ii|b|b team|reserves|youth|academy|juniors?|sub \d\d|atletico|castilla|jong|primavera|promesas)\b/g;
// names = vart lagnamn, FotMobs och Transfermarkts (TM skriver "1.FC Nuremberg", vi "Nurnberg")
export const sameClub = (tmClub, names) => names.some((n) => clubScore(foldClub(tmClub).replace(YOUTH, ' '), n) >= 0.5 || clubScore(tmClub, n) >= 0.5);
// Okand klubb i soket ("---", tomt) ar inget bevis for att spelaren lamnat
export const unknownClub = (c) => !c || /^-+$/.test(c.trim());

// Vara lag -> Transfermarkt-klubbar: forst sakra namnlikheter, sedan de som blir over parvis efter basta likhet
export function pairClubs(code, teams, clubs) {
  const out = new Map(), used = new Set();
  // Fasta id galler aven nar klubben saknas i Transfermarkts ligalista (inaktuell efter upp-/nedflyttning)
  for (const [team] of teams) {
    const id = TM_TEAM_ID[`${code}|${team}`];
    if (id) { out.set(team, clubs.find((c) => c.id === id) ?? { id, name: team }); used.add(id); }
  }
  const cand = [];
  for (const [team, x] of teams) for (const c of clubs) cand.push({ team, c, s: Math.max(clubScore(team, c.name), clubScore(x.fotmobName, c.name)) });
  cand.sort((a, b) => b.s - a.s);
  for (const k of cand) {
    if (out.has(k.team) || used.has(k.c.id) || (k.s < 0.5 && teams.length - out.size > 1 && k.s < 0.2)) continue;
    out.set(k.team, k.c); used.add(k.c.id);
  }
  return out;
}
