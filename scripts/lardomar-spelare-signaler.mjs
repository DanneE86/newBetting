// Lärdomar ur spelardatan (data/spelare): signaler per lag och match mot resultat minus oddsens förväntan.
// Lagets matcher byggs ur spelarnas 10 senaste matcher (alla tävlingar): vila, Europamatch före/efter, rotation
// (startelvans marknadsvärde mot lagets median), dyraste spelare borta, landslagsspelare i startelvan.
// Lagnivå: keeperns goals_prevented och avslut (mål − xG) förra säsongen, andel minuter från nyförvärv.
// Kör: node scripts/lardomar-spelare-signaler.mjs  (kör npm run spelare först; fönstret är ca 10 matcher per lag)
import fs from 'node:fs';
import { root as ROOT } from './lib/learnings-data.mjs';
const rd = (p) => JSON.parse(fs.readFileSync(`${ROOT}/${p}`, 'utf8'));
const csv = (c) => { const L = fs.readFileSync(`${ROOT}/data/matcher/${c}.csv`, 'utf8').trim().split('\n'); const h = L[0].split(','); return L.slice(1).map((l) => { const v = l.split(','); return Object.fromEntries(h.map((k, i) => [k, v[i]])); }); };
const dd = (a, b) => (Date.parse(a) - Date.parse(b)) / 864e5;
const NAT = /Nations League|World Cup|Qualif.*(UEFA|CONMEBOL|CONCACAF|AFC|CAF)|International Friendl|Friendlies$|U21|U-21|Euro(pean)? Championship|Copa Am|Gold Cup|Asian Cup|Africa Cup/i;

const EURO = /Champions League|Europa League|Conference League|Libertadores|Sudamericana|Concacaf Champions|AFC Champions/i;
const leagues = fs.readdirSync(`${ROOT}/data/spelare`).filter((f) => !f.startsWith('_')).map((f) => f.slice(0, -5)).filter((c) => !['CL', 'EL', 'ECL'].includes(c));
const out = [];      // rad per lag och match
const teamRows = []; // rad per lag och säsong
for (const code of leagues) {
  const sp = rd(`data/spelare/${code}.json`);
  const rows = csv(code).filter((r) => r.status === 'spelad');
  const odds = rows.some((r) => r.close_h && r.date >= '2026-01-01');
  // ligans turnering = vanligaste namnet i loggarna
  const cnt = {};
  for (const t of Object.values(sp.teams)) for (const p of t.players) for (const m of p.matches ?? []) cnt[m[11]] = (cnt[m[11]] ?? 0) + 1;
  const LEAGUE = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0];
  for (const [team, T] of Object.entries(sp.teams)) {
    const ps = T.players.filter((p) => p.matches?.length);
    // klubbens matcher (alla tävlingar) = datum där någon spelare spelade för klubben (inte landslag)
    const club = new Map(); // datum -> {league, players:[{p,min,rating}]}
    // klubbens FotMob-namn = vanligaste lagnamnet i loggarna (utlånade spelare spelar för andra klubbar)
    const tc = {}; for (const p of ps) for (const m of p.matches) if (!NAT.test(m[11])) tc[m[1]] = (tc[m[1]] ?? 0) + 1;
    const CLUB = Object.entries(tc).sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const p of ps) for (const m of p.matches) {
      if (m[1] === CLUB && !NAT.test(m[11]) && !/Friendl/i.test(m[11])) {
        const k = m[0]; if (!club.has(k)) club.set(k, { league: m[11], opp: m[2], home: m[3], pl: [] });
        club.get(k).pl.push({ p, min: m[4], bench: m[10], rating: m[5] });
      }
    }
    // värde vid datum (månadshistorik)
    const valAt = (p, d) => { let v = null; for (const [dt, x] of p.marketValueHistory ?? []) if (dt <= d) v = x; return v ?? p.info?.marketValue ?? 0; };
    // samma match loggas ibland med ett dygns skillnad (tidszon): slå ihop datum inom 1 dag, behåll det med flest spelare
    for (const d of [...club.keys()].sort()) { const n = [...club.keys()].find((x) => x !== d && Math.abs(dd(x, d)) <= 1 && club.get(x).opp === club.get(d).opp);
      if (n && club.has(d)) { const [keep, drop] = club.get(n).pl.length >= club.get(d).pl.length ? [n, d] : [d, n];
        const K = club.get(keep); for (const x of club.get(drop).pl) if (!K.pl.some((y) => y.p === x.p)) K.pl.push(x); club.delete(drop); } }
    const dates = [...club.keys()].sort();
    // bevakningsfönster: bara datum där minst 8 spelare har loggen täckande (loggen täcker spelarens 10 senaste)
    for (const d of dates) {
      const M = club.get(d);
      if (M.league !== LEAGUE) continue;
      const row = rows.find((r) => (r.home === team || r.away === team) && Math.abs(dd(r.date, d)) <= 1);
      if (!row) continue;
      const home = row.home === team;
      // täckning: spelare vars logg når tillbaka till datumet
      const covered = ps.filter((p) => p.matches.at(-1)[0] <= d);
      if (covered.length < 14) continue;
      const played = M.pl.filter((x) => x.min > 0);
      if (played.length < 9) continue;
      // Rotation: värde för de 11 med flest minuter mot lagets 11 dyraste (bland täckta, vid datum)
      const xi = played.sort((a, b) => b.min - a.min).slice(0, 11);
      const xiVal = xi.reduce((s, x) => s + valAt(x.p, d), 0);
      const top11 = covered.map((p) => valAt(p, d)).sort((a, b) => b - a).slice(0, 11).reduce((a, b) => a + b, 0);
      // vila: dagar sedan förra klubbmatchen (alla tävlingar)
      const prev = dates.filter((x) => x < d).at(-1);
      const rest = prev ? dd(d, prev) : null;
      const prevEuro = prev ? EURO.test(club.get(prev).league) : false;
      // landslag: startare som spelat landskamp inom 7 dagar före
      const natXi = xi.filter((x) => x.p.matches.some((m) => NAT.test(m[11]) && m[4] > 0 && dd(d, m[0]) > 0 && dd(d, m[0]) <= 7)).length;
      // Nästa match är Europa inom 4 dagar (vilar folk?)
      const nxt = dates.filter((x) => x > d)[0];
      const nextEuro = nxt && dd(nxt, d) <= 4 && EURO.test(club.get(nxt).league);
      const pts = row.res === 'D' ? 1 : (row.res === (home ? 'H' : 'A') ? 3 : 0);
      const P = (b) => (row[`${b}_h`] ? { w: +row[`${b}_${home ? 'h' : 'a'}`], d: +row[`${b}_d`], l: +row[`${b}_${home ? 'a' : 'h'}`] } : null);
      const pc = P('close'), po = P('open');
      out.push({ code, team, date: d, home, odds, pts, xp_c: pc ? 3 * pc.w + pc.d : null, xp_o: po ? 3 * po.w + po.d : null, pw_c: pc?.w,
        win: pts === 3 ? 1 : 0, draw: pts === 1 ? 1 : 0, goals: +row.hg + +row.ag, over_c: row.over25_close ? +row.over25_close : null,
        xiVal, top3out: covered.map((p)=>[p,valAt(p,d)]).sort((a,b)=>b[1]-a[1]).slice(0,3).filter(([p])=>!played.some((x)=>x.p===p)).length, rot: null, rest, prevEuro, nextEuro, natXi, key: `${row.date}|${row.home}|${row.away}` });
    }
    // Lagnivå: truppens förra säsong (de som spelar i år), keeperns goals_prevented
    const reg = T.players.filter((p) => p.season?.stats?.minutes_played?.[0] > 0 || p.league?.minutes_played > 0);
    const gk = T.players.filter((p) => p.position?.group === 'malvakt').sort((a, b) => (b.league?.minutes_played ?? 0) - (a.league?.minutes_played ?? 0))[0];
    const gp = gk?.prevSeason?.stats?.goals_prevented;
    const gpNow = gk?.season?.stats?.goals_prevented;
    // anfallare/offensiva: förra säsongens mål minus xG (avslutsskicklighet) viktat med minuter i år
    let fin = 0, finW = 0;
    for (const p of T.players) {
      const g = p.prevSeason?.stats?.goals_minus_xg?.[0], mins = p.league?.minutes_played ?? 0, pm = p.prevSeason?.stats?.minutes_played?.[0] ?? 0;
      if (g != null && pm > 600 && mins > 0) { fin += (g / pm) * 90 * mins; finW += mins; }
    }
    teamRows.push({ code, team, odds, gkPrev: gp ? gp[1] : null, gkNow: gpNow ? gpNow[1] : null, finPrev: finW ? fin / finW : null,
      newShare: T.players.filter((p) => (p.league?.minutes_played ?? 0) > 0 && p.career?.[0]?.[1] >= '2026-01-01').reduce((s, p) => s + p.league.minutes_played, 0)
        / Math.max(1, T.players.reduce((s, p) => s + (p.league?.minutes_played ?? 0), 0)) });
  }
}

for (const g of Object.values(Object.groupBy(out,(r)=>r.code+'|'+r.team))) { const v=g.map((r)=>r.xiVal).sort((a,b)=>a-b); const med=v[Math.floor(v.length/2)]; if (g.length>=4 && med) for (const r of g) r.rot=r.xiVal/med; }
// ---- statistik ----
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
function reg1(xs, ys) { // lutning, z
  const n = xs.length; if (n < 10) return null;
  const mx = mean(xs), my = mean(ys);
  let sxx = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  const b = sxy / sxx; let sse = 0; for (let i = 0; i < n; i++) sse += (ys[i] - my - b * (xs[i] - mx)) ** 2;
  const se = Math.sqrt(sse / (n - 2) / sxx); return { n, b, z: b / se };
}
function diff(rows, f, y) { const a = rows.filter(f).map(y), b = rows.filter((r) => !f(r)).map(y); if (a.length < 8) return null;
  const va = mean(a.map((x) => (x - mean(a)) ** 2)), vb = mean(b.map((x) => (x - mean(b)) ** 2));
  return { n: a.length, d: mean(a) - mean(b), z: (mean(a) - mean(b)) / Math.sqrt(va / a.length + vb / b.length) }; }
const f = (x, d = 3) => (x == null ? '–' : x.toFixed(d));

const withO = out.filter((r) => r.xp_c != null);
// dubbletter: en match syns från båda lagen – ok för lagsignaler (hemma/borta var för sig)
console.log(`Lag-matcher: ${out.length}, med stängningsodds: ${withO.length}, unika matcher: ${new Set(withO.map((r) => r.key)).size}`);
const res = (r) => r.pts - r.xp_c, reso = (r) => r.pts - r.xp_o;
const signals = {
  'Rotation (XI-värde/lagets median)': [(r) => r.rot != null, (r) => r.rot],
  'Vila (dagar, max 10)': [(r) => r.rest != null, (r) => Math.min(r.rest, 10)],
  'Landslagsspelare i XI (7 d före)': [() => true, (r) => r.natXi],
};
const flags = {
  'Europamatch förra (≤4 d)': (r) => r.prevEuro && r.rest <= 4,
  'Europamatch nästa (≤4 d)': (r) => r.nextEuro,
  'Kort vila ≤3 d': (r) => r.rest != null && r.rest <= 3,
  'Hårt roterat (XI < 80 % av median)': (r) => r.rot != null && r.rot < 0.8,
  'Minst 2 av 3 dyraste borta': (r) => r.top3out >= 2,
  '≥3 landslagsspelare i XI': (r) => r.natXi >= 3,
};
const by = (rows) => Object.groupBy(rows, (r) => r.code);
function report(label, rows) {
  console.log(`\n=== ${label} (n=${rows.length}) ===`);
  for (const [k, [ok, x]] of Object.entries(signals)) {
    const R = rows.filter(ok); const c = reg1(R.map(x), R.map(res)); const o = reg1(R.filter((r) => r.xp_o != null).map(x), R.filter((r) => r.xp_o != null).map(reso));
    const raw = reg1(R.map(x), R.map((r) => r.pts));
    console.log(`${k.padEnd(34)} rått b ${f(raw?.b)} z ${f(raw?.z, 1)} | mot stängning b ${f(c?.b)} z ${f(c?.z, 1)} | mot öppning z ${f(o?.z, 1)}`);
  }
  for (const [k, fl] of Object.entries(flags)) {
    const c = diff(rows, fl, res), raw = diff(rows, fl, (r) => r.pts), o = diff(rows.filter((r) => r.xp_o != null), fl, reso);
    console.log(`${k.padEnd(34)} n ${c?.n ?? 0} rått ${f(raw?.d, 2)} p (z ${f(raw?.z, 1)}) | mot stängning ${f(c?.d, 2)} p (z ${f(c?.z, 1)}) | mot öppning z ${f(o?.z, 1)}`);
  }
}
report('ALLA LIGOR MED ODDS', withO);
for (const [c, R] of Object.entries(by(withO))) {
  const lines = [];
  for (const [k, [ok, x]] of Object.entries(signals)) { const q = R.filter(ok); const s = reg1(q.map(x), q.map(res)); if (s) lines.push(`${k.split(' ')[0]} z${f(s.z, 1)}`); }
  for (const [k, fl] of Object.entries(flags)) { const s = diff(R, fl, res); if (s) lines.push(`${k.split(' (')[0]} n${s.n} ${f(s.d, 2)}p z${f(s.z, 1)}`); }
  console.log(`${c.padEnd(4)} n ${String(R.length).padStart(3)} | ${lines.join(' | ')}`);
}
// Lagnivå mot säsongens residual (i år)
console.log('\n=== LAGNIVÅ: signal mot lagets poäng minus oddsens förväntan i år (2026-01-01–) ===');
const T = [];
for (const code of leagues) {
  const rows = csv(code).filter((r) => r.status === 'spelad' && r.close_h && r.date >= (['AS', 'NO', 'BR', 'AR', 'JP1', 'MLS', 'DK'].includes(code) ? '2026-01-01' : '2026-07-01'));
  const agg = {};
  for (const r of rows) for (const home of [true, false]) {
    const t = home ? r.home : r.away; const pts = r.res === 'D' ? 1 : (r.res === (home ? 'H' : 'A') ? 3 : 0);
    const xp = 3 * +r[`close_${home ? 'h' : 'a'}`] + +r.close_d;
    const ga = home ? +r.ag : +r.hg;
    (agg[t] ??= { n: 0, res: 0, ga: 0 }); agg[t].n++; agg[t].res += pts - xp; agg[t].ga += ga;
  }
  for (const tr of teamRows.filter((x) => x.code === code)) if (agg[tr.team]?.n >= 4) T.push({ ...tr, n: agg[tr.team].n, resPm: agg[tr.team].res / agg[tr.team].n });
}
for (const [k, x] of Object.entries({ 'Keeper goals_prevented/90 förra säsongen': 'gkPrev', 'Avslut (mål−xG/90) förra säsongen': 'finPrev', 'Andel minuter nyförvärv 2026': 'newShare' })) {
  const R = T.filter((t) => t[x] != null); const s = reg1(R.map((t) => t[x]), R.map((t) => t.resPm));
  console.log(`${k.padEnd(44)} lag ${s?.n} b ${f(s?.b)} z ${f(s?.z, 1)}`);
}
