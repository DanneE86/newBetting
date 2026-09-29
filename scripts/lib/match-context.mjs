// Matchkontext fran FotMob (utan nyckel) for Stryktipset/Europatipset: elva (senaste/bekraftad), franvaro med
// marknadsvarde, vilodagar och nasta match (rotation), domare, arena, form och inbordes moten.
// Vader hamtas inte: det paverkar inte utfallet (data/reports/pro-evaluation.json, weatherEffect).
// Fungerar for alla lag FotMob tacker: landslag, Europacup, topp 5-ligor, Allsvenskan osv.
//   const ctx = await fetchMatchContext({ kickoff, home, away, homeCountry, awayCountry })
// Matchning: FotMobs matchlista for avsparksdagen (UTC), avspark +-2 h och lagnamn (svenska landsnamn oversatta
// till engelska via Intl.DisplayNames). Returnerar null om matchen inte hittas.
const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'application/json',
};
const FM = 'https://www.fotmob.com/api/data';

async function getJson(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch { /* forsok igen */ }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return null;
}

// Svenska landsnamn -> engelska (FotMob). Hemnationerna ar inte ISO-regioner.
const COUNTRY_EN = new Map([
  ['england', 'england'], ['skottland', 'scotland'], ['wales', 'wales'], ['nordirland', 'northern ireland'],
  ['irland', 'ireland'], ['bosnienochhercegovina', 'bosnia and herzegovina'], ['nordmakedonien', 'north macedonia'],
  ['tjeckien', 'czechia'], ['turkiet', 'turkiye'], ['usa', 'usa'], ['sydkorea', 'south korea'], ['elfenbenskusten', 'ivory coast'],
]);
try {
  const sv = new Intl.DisplayNames(['sv'], { type: 'region' });
  const en = new Intl.DisplayNames(['en'], { type: 'region' });
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      const s = sv.of(code), e = en.of(code);
      if (s && e && s !== code) { const k = key(s); if (!COUNTRY_EN.has(k)) COUNTRY_EN.set(k, e.toLowerCase()); }
    }
  }
} catch { /* ICU saknas: bara tabellen ovan */ }

function key(s) {
  return String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/&/g, 'och').replace(/[^a-z0-9]+/g, '');
}
const STOP = /\b(fc|cf|afc|ac|sc|if|ff|bk|fk|sk|ik|club|de|the|cd|ssc|as|us|rc|vfb|vfl|tsg|sv|and|och|town|1)\b/g;
// Vanliga kortformer -> fullt ord (engelska klubbar m.fl.)
const ALIAS = { wolves: 'wolverhampton', man: 'manchester', utd: 'united', nottm: 'nottingham', nott: 'nottingham', spurs: 'tottenham', qpr: 'queens', sheff: 'sheffield', espanol: 'espanyol', koln: 'cologne', cologne: 'cologne', rvs: 'rovers' };
// Hela namn som inte gar att harleda ordvis (football-data -> Understat/odds)
const FULL_ALIAS = { athbilbao: 'athletic club', athmadrid: 'atletico madrid', mgladbach: 'borussia gladbach', borussiamgladbach: 'borussia gladbach', fckoln: 'cologne', koln: 'cologne', fccologne: 'cologne', sociedad: 'real sociedad', betis: 'real betis' };
// Ord (minst 3 tecken) och initialer (1-2 tecken, t.ex. "Sheffield U" / "Sheffield W")
function tokens(s) {
  s = FULL_ALIAS[key(String(s || '').replace(/'/g, ''))] || s;
  const raw = String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/&/g, ' ').replace(/'/g, '').replace(STOP, ' ')
    .split(/[^a-z0-9]+/).filter(Boolean);
  return raw.map((t) => ALIAS[t] || t).map((t) => (t.length >= 3 ? { w: t } : /^[a-z]$/.test(t) ? { init: t } : null)).filter(Boolean);
}
// Tva ord ar samma om de ar lika, eller om det kortare (minst 4 tecken) inleder det langre och ar minst halva langden
// (Malmo/Malmoe, Brom/Bromwich) - men inte Northampton/North eller Nottingham/Notts
const sameWord = (x, y) => {
  if (x === y) return true;
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  return s.length >= 4 && l.startsWith(s) && s.length / l.length >= 0.5;
};
// Likhet 0..1 mellan svenskt namn (eller engelsk oversattning) och namnet i en annan kalla (FotMob, odds, Elo, Understat).
// Poang = traffar mot det kortare namnet (70 %) och mot det langre (30 %), sa "Brighton" ~ "Brighton and Hove Albion" = 0,8
// men "Bristol Rovers" ~ "Doncaster Rovers" = 0,5. Initialer raknas bara nar de passar ett ord i det andra namnet.
export function nameScore(svName, country, fmName) {
  const cands = [svName];
  const en = COUNTRY_EN.get(key(svName)) || (country ? COUNTRY_EN.get(key(country)) : null);
  if (en) cands.push(en);
  let best = 0;
  for (const c of cands) {
    if (key(c) === key(fmName)) return 1;
    const a = tokens(c), b = tokens(fmName);
    const aw = a.filter((t) => t.w), bw = b.filter((t) => t.w);
    if (!aw.length || !bw.length) continue;
    const used = new Set();
    let hit = 0;
    for (const t of aw) {
      const j = bw.findIndex((u, i) => !used.has(i) && sameWord(t.w, u.w));
      if (j >= 0) { used.add(j); hit++; }
    }
    if (!hit) continue;
    // Initial i ena namnet mot ett oanvant ord i det andra (Sheffield U ~ Sheffield United, inte Wednesday)
    let initHit = 0, initMiss = 0;
    for (const [x, ys] of [[a, bw], [b, aw]]) {
      for (const t of x.filter((q) => q.init)) {
        const k = ys.findIndex((u, i) => (ys === bw ? !used.has(i) : true) && u.w.startsWith(t.init));
        if (k >= 0) initHit++; else initMiss++;
      }
    }
    const la = aw.length + a.filter((t) => t.init).length, lb = bw.length + b.filter((t) => t.init).length;
    const h = hit + initHit;
    const score = initMiss ? (0.7 * h / Math.min(la, lb) + 0.3 * h / Math.max(la, lb)) * 0.6
      : 0.7 * Math.min(1, h / Math.min(la, lb)) + 0.3 * Math.min(1, h / Math.max(la, lb));
    best = Math.max(best, score);
  }
  return best;
}

const dayCache = new Map();
async function matchesOn(ymd) {
  if (!dayCache.has(ymd)) dayCache.set(ymd, getJson(`${FM}/matches?date=${ymd.replace(/-/g, '')}`).then((d) => {
    const out = [];
    for (const lg of d?.leagues || []) for (const m of lg.matches || []) out.push({ ...m, leagueName: lg.name });
    return out;
  }));
  return dayCache.get(ymd);
}

async function findMatch({ kickoff, home, away, homeCountry, awayCountry }) {
  const t = new Date(kickoff).getTime();
  if (!Number.isFinite(t)) return null;
  const days = [...new Set([-1, 0, 1].map((d) => new Date(t + d * 86400e3).toISOString().slice(0, 10)))];
  let best = null;
  for (const ymd of days) {
    for (const m of await matchesOn(ymd)) {
      const mt = new Date(m.status?.utcTime || m.time).getTime();
      if (!Number.isFinite(mt) || Math.abs(mt - t) > 2 * 3600e3) continue;
      // Bada lagen maste likna (annars t.ex. "Malmo FF - Hammarby" for "Malmo FF - IFK Goteborg" vid samma tid)
      const sh = nameScore(home, homeCountry, m.home?.name), sa = nameScore(away, awayCountry, m.away?.name);
      const s = sh + sa;
      if (sh >= 0.6 && sa >= 0.6 && s >= 1.2 && (!best || s > best.s)) best = { s, m };
    }
  }
  return best?.m || null;
}

const teamCache = new Map();
async function teamFixtures(id) {
  if (!teamCache.has(id)) teamCache.set(id, getJson(`${FM}/teams?id=${id}`).then((d) => d?.fixtures?.allFixtures?.fixtures || []));
  return teamCache.get(id);
}

const mv = (p) => Number(p?.marketValue) || 0;
const daysBetween = (a, b) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400e3 * 10) / 10;

async function side(team, kickoff, isHome) {
  if (!team) return null;
  const starters = team.starters || [];
  const unavailable = (team.unavailable || []).map((p) => ({
    name: p.name, type: p.unavailability?.type || null, expectedReturn: p.unavailability?.expectedReturn || null, marketValue: mv(p),
  }));
  const starterValue = starters.reduce((s, p) => s + mv(p), 0);
  const missingValue = unavailable.reduce((s, p) => s + p.marketValue, 0);
  // Rotation: dagar sedan forra matchen och till nasta (alla turneringar)
  let prev = null, next = null;
  const fx = team.id ? await teamFixtures(team.id) : [];
  const t = new Date(kickoff).getTime();
  for (const f of fx) {
    const ft = new Date(f.status?.utcTime).getTime();
    if (!Number.isFinite(ft) || f.status?.cancelled) continue;
    const item = { date: f.status.utcTime, tournament: f.tournament?.name || null, opponent: f.opponent?.name || null };
    if (ft < t - 3600e3 && (!prev || ft > new Date(prev.date).getTime())) prev = item;
    if (ft > t + 3600e3 && (!next || ft < new Date(next.date).getTime())) next = item;
  }
  if (!prev && team.lastMatch?.matchDate) prev = { date: `${team.lastMatch.matchDate}Z`, tournament: null, opponent: null };
  return {
    fotmobTeam: team.name, formation: team.formation || null,
    starters: starters.map((p) => p.name),
    unavailable,
    // Andel av (elva + franvarande) marknadsvarde som saknas: grovt matt pa hur hart franvaron slar, for alla lag
    missingValueShare: starterValue + missingValue > 0 ? Math.round((missingValue / (starterValue + missingValue)) * 1000) / 1000 : null,
    starterValue: team.totalStarterMarketValue || starterValue || null,
    restDays: prev ? daysBetween(prev.date, kickoff) : null,
    prevMatch: prev,
    nextMatch: next,
    daysToNext: next ? daysBetween(kickoff, next.date) : null,
    home: isHome,
  };
}

export async function fetchMatchContext(ev) {
  const hit = await findMatch(ev);
  if (!hit) return null;
  const md = await getJson(`${FM}/matchDetails?matchId=${hit.id}`);
  if (!md?.content) return { fotmobMatchId: hit.id, league: hit.leagueName };
  const c = md.content;
  const lu = c.lineup || {};
  const ib = c.matchFacts?.infoBox || {};
  const [home, away] = await Promise.all([side(lu.homeTeam, ev.kickoff, true), side(lu.awayTeam, ev.kickoff, false)]);
  const form = (c.matchFacts?.teamForm || []).map((arr) => (arr || []).map((x) => x.resultString).join(''));
  return {
    fotmobMatchId: hit.id,
    league: md.general?.leagueName || hit.leagueName,
    round: md.general?.matchRound || null,
    // lineupType: 'lastStarting11' = senaste elvan (ingen bekraftelse an), 'predicted', eller bekraftad elva (~1 h fore)
    lineupType: lu.lineupType || null,
    lineupConfirmed: !!lu.lineupType && !/last|predict/i.test(lu.lineupType),
    home, away,
    referee: ib.Referee?.text || null,
    stadium: ib.Stadium ? { name: ib.Stadium.name, city: ib.Stadium.city, country: ib.Stadium.country, lat: ib.Stadium.lat, long: ib.Stadium.long, surface: ib.Stadium.surface } : null,
    form: { home: form[0] || null, away: form[1] || null },
    h2h: c.h2h?.summary ? { homeWins: c.h2h.summary[0], draws: c.h2h.summary[1], awayWins: c.h2h.summary[2] } : null,
    fetchedAt: new Date().toISOString(),
  };
}

// Korta svenska rader for analystexten
export function contextNotes(cx, homeName, awayName) {
  if (!cx?.home) return [];
  const out = [];
  const pct = (x) => `${Math.round(x * 100)} %`;
  out.push(cx.lineupConfirmed ? 'Startelvorna är bekräftade (FotMob).' : 'Elvorna är inte bekräftade än (FotMob visar senaste elvan).');
  const other = (s) => (s === cx.home ? cx.away : cx.home);
  for (const [s, name] of [[cx.home, homeName], [cx.away, awayName]]) {
    if (!s) continue;
    if (s.unavailable.length) {
      const top = [...s.unavailable].sort((a, b) => b.marketValue - a.marketValue).slice(0, 4).map((p) => p.name).join(', ');
      out.push(`${name} saknar ${s.unavailable.length} spelare (${top})${s.missingValueShare >= 0.1 ? `, ${pct(s.missingValueShare)} av startelvans + frånvarandes marknadsvärde` : ''}.`);
    }
    // Vila: bara nar lagen skiljer sig tydligt (landslagsuppehall = alla lika)
    const o = other(s);
    if (s.restDays != null && o?.restDays != null && s.restDays < 4 && o.restDays - s.restDays >= 1.5) out.push(`${name} har ${s.restDays} dagars vila mot ${o.restDays} för motståndaren${s.prevMatch?.tournament ? ` (senast ${s.prevMatch.tournament})` : ''}.`);
    // Rotation: nasta match inom 4 dagar i en ANNAN turnering (t.ex. CL efter ligamatch)
    if (s.daysToNext != null && s.daysToNext < 4 && s.nextMatch?.tournament && s.nextMatch.tournament !== cx.league) out.push(`${name} spelar ${s.nextMatch.tournament} om ${s.daysToNext} dagar, vilket ger risk för rotation.`);
  }
  if (cx.referee) out.push(`Domare: ${cx.referee}.`);
  return out;
}
