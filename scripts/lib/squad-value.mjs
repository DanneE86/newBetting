// Truppvärde per lag (summa marknadsvärde i €, FotMob/Transfermarkt) ur data/spelare/{liga}.json - bara visning på /tips.
// Ligans fil om den finns, annars cuptrupperna (ligor utan egen fil, t.ex. SC/BE, för lag som spelar CL/EL/ECL/ACL/ACL2/LIB/SUD).
// I cupmatcher även ensam bästa namnlikhet ≥ 0,8 i cuptrupperna (ESPN "Estudiantes de La Plata" ~ FotMob "Estudiantes").
//   const valueOf = squadValueLookup({ PL: { Arsenal: { players: [...] } }, CL: {...} })
//   valueOf('Arsenal', 'PL') -> { value: 1067000000, players: 24 } | null
import { CUPS } from './cups.mjs';
import { nameScore } from './match-context.mjs';

export function squadValue(team) {
  const vals = (team?.players ?? []).map((p) => Number(p.info?.marketValue) || 0).filter((v) => v > 0);
  return vals.length ? { value: vals.reduce((s, v) => s + v, 0), players: vals.length } : null;
}

export function squadValueLookup(teamsByLeague) {
  const cache = new Map();
  return (name, league) => {
    const key = `${league}|${name}`;
    if (!cache.has(key)) {
      // har ligan egen fil men saknar laget -> inget; reserv bara Europacuptrupperna (samma namn i en annan liga kan vara en annan klubb)
      // Cup: egen cupfil först, sedan övriga cuper (Boca Juniors gick från Libertadores till Sudamericana)
      const own = teamsByLeague[league];
      const team = (own ? own[name] : null) ?? (!own || CUPS.includes(league) ? CUPS.map((c) => teamsByLeague[c]?.[name]).find(Boolean) : null);
      let hit = team;
      if (!hit && CUPS.includes(league)) {
        const scored = CUPS.flatMap((c) => Object.entries(teamsByLeague[c] ?? {})).map(([n, t]) => [t, nameScore(name, null, n)])
          .filter(([, sc]) => sc >= 0.8).sort((a, b) => b[1] - a[1]);
        if (scored.length && (scored.length === 1 || scored[0][1] > scored[1][1] || scored[0][0] === scored[1][0])) hit = scored[0][0];
      }
      cache.set(key, squadValue(hit));
    }
    return cache.get(key);
  };
}
