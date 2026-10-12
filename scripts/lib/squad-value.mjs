// Truppvärde per lag (summa marknadsvärde i €, FotMob/Transfermarkt) ur data/spelare/{liga}.json - bara visning på /tips.
// Ligans fil om den finns, annars Europacuptrupperna (ligor utan egen fil, t.ex. SC/BE, för lag som spelar CL/EL/ECL).
//   const valueOf = squadValueLookup({ PL: { Arsenal: { players: [...] } }, CL: {...} })
//   valueOf('Arsenal', 'PL') -> { value: 1067000000, players: 24 } | null
export function squadValue(team) {
  const vals = (team?.players ?? []).map((p) => Number(p.info?.marketValue) || 0).filter((v) => v > 0);
  return vals.length ? { value: vals.reduce((s, v) => s + v, 0), players: vals.length } : null;
}

const CUPS = ['CL', 'EL', 'ECL'];

export function squadValueLookup(teamsByLeague) {
  const cache = new Map();
  return (name, league) => {
    const key = `${league}|${name}`;
    if (!cache.has(key)) {
      // har ligan egen fil men saknar laget -> inget; reserv bara Europacuptrupperna (samma namn i en annan liga kan vara en annan klubb)
      const own = teamsByLeague[league];
      const team = own ? own[name] : CUPS.map((c) => teamsByLeague[c]?.[name]).find(Boolean);
      cache.set(key, squadValue(team));
    }
    return cache.get(key);
  };
}
