// Mappning av FotMobs lagnamn till vara (football-data/store). Anvands av fetch-squads.mjs och fetch-team-style.mjs.
import { nameScore } from './match-context.mjs';

// FotMob-namn som inte liknar football-datas (football-data -> vart namn)
export const ALIASES = {
  'Sporting CP': 'Sp Lisbon', 'Sporting Braga': 'Sp Braga', 'Olympiacos': 'Olympiakos', 'Levadiakos': 'Levadeiakos',
  'FC København': 'FC Copenhagen', OB: 'Odense', AGF: 'Aarhus', AB: 'AB Gladsaxe', 'Urawa Red Diamonds': 'Urawa Reds',
  'Deportivo A Coruña': 'La Coruna', 'Celta Fortuna': 'Celta B', 'Real Sociedad B': 'Sociedad B', 'Wisła Kraków': 'Wisla',
  'Zagłębie Lubin': 'Zaglebie', 'Athletic Club': 'Ath Bilbao', 'Atletico Madrid': 'Ath Madrid', 'Atlético Madrid': 'Ath Madrid',
  'Tokyo Verdy': 'Verdy', 'Argentinos Juniors': 'Argentinos Jrs', 'Independiente Rivadavia': 'Ind. Rivadavia',
  Estudiantes: 'Estudiantes L.P.', 'Athletic Club MG': 'Athletic', 'NK Lokomotiva': 'Lokomotiva Zagreb', 'Lunds BK': 'Lund',
  'Paris Saint-Germain': 'Paris SG', Inter: 'Internazionale', 'FK Crvena Zvezda': 'Red Star Belgrade', Rennes: 'Stade Rennais',
  'Sheffield Wednesday': 'Sheffield Weds', 'Odds Ballklubb': 'Odd', AaB: 'Aalborg', Hamarkameratene: ['HamKam', 'Ham-Kam'],
  'Atletico MG': 'Atletico-MG',
};
export const fold = (x) => String(x).replace(/ø/g, 'o').replace(/Ø/g, 'O').replace(/æ/g, 'ae').replace(/Æ/g, 'Ae').replace(/ł/g, 'l').replace(/Ł/g, 'L')
  .replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
// -> { n: vart namn, s: sakerhet } (alias/exakt = 2, annars nameScore). Innevarande sasong provas forst.
export function mapTeam(names, fm, short) {
  for (const list of [names.cur, names.all]) {
    const alias = [].concat(ALIASES[fm] ?? []).find((a) => list.includes(a)); // flera stavningar mojliga
    if (alias) return { n: alias, s: 2 };
    const exact = list.find((n) => fold(n).toLowerCase() === fold(fm).toLowerCase() || (short && fold(n).toLowerCase() === fold(short).toLowerCase()));
    if (exact) return { n: exact, s: 2 };
    let best = null;
    for (const n of list) {
      const a = fold(n), b = fold(fm), c = short ? fold(short) : null;
      const s = Math.max(nameScore(a, null, b), c ? nameScore(a, null, c) : 0, nameScore(b, null, a));
      if (s >= 0.5 && (!best || s > best.s)) best = { s, n };
    }
    if (best) return best;
  }
  return { n: fm, s: 0 };
}

// Ett av vara namn far bara ga till ett FotMob-lag (annars skriver t.ex. Argentinos Juniors over Boca Juniors trupp).
// Vid krock behaller den sakraste kopplingen namnet, ovriga far sitt FotMob-namn.
export function mapTable(names, rows) {
  const byId = new Map();
  for (const r of rows) if (!byId.has(r.id)) byId.set(r.id, { ...mapTeam(names, r.name, r.shortName), fm: r.name });
  const owner = new Map();
  for (const [id, m] of byId) if (!owner.has(m.n) || m.s > byId.get(owner.get(m.n)).s) owner.set(m.n, id);
  const out = new Map();
  for (const [id, m] of byId) {
    if (owner.get(m.n) === id) out.set(id, m.n);
    else { console.warn(`  namnkrock: FotMob "${m.fm}" och "${byId.get(owner.get(m.n)).fm}" -> "${m.n}" (behåller FotMob-namnet)`); out.set(id, m.fm); }
  }
  return out;
}
