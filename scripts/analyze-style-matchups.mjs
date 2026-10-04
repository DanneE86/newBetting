// Stilmatchning: hur gar det nar lag med en viss spelstil moter en annan, och vilka lagtyper har varje lag svart for?
// Stil per lag och sasong fran data/stil/<liga>.json (npm run stil:hamta). Tre axlar, alla justerade for lagets styrka
// (marknadens vantade poang per match) eftersom svaga lag nastan alltid har mindre boll:
//   poss   bollinnehav          lag: "Backar hem"  / "Balanserat" / "Bollinnehav"
//   direct langbollar / pass     lag: "Kortpass"    / "Blandat"    / "Direktspel"
//   press  bollvinster hogt upp  lag: "Lagpress"    / "Mellanpress"/ "Hogpress"
// plus possRaw (ojusterat bollinnehav) for ligans matchningstabell. Allt mats mot marknaden (stangningsodds):
// poang minus vantade poang, kryss minus oddsens krysschans, over 2,5 minus marknadens.
// Ut: docs/analys/stilmatchning.md (sammanfattning), docs/analys/stil/<liga>.md (per lag), data/stilmatchning.json.
// Kors: node scripts/analyze-style-matchups.mjs
import fs from 'node:fs';
import path from 'node:path';
import { root, LEAGUE_NAMES } from './lib/learnings-data.mjs';
import { AXES, TEAM_AXES, spValue } from './lib/team-style.mjs';

const DIR_DOC = path.join(root, 'docs', 'analys', 'stil');
const MIN_HALF = 8; // minst sa manga matcher mot lagtypen i varje halva for stabilitetstestet
// Lag kan flytta mellan ligor i samma land, deras matcher slas ihop per land
const COUNTRY = { PL: 'ENG', CH: 'ENG', EL1: 'ENG', EL2: 'ENG', BL: 'GER', BL2: 'GER', LL: 'ESP', LL2: 'ESP', SA: 'ITA', SB: 'ITA' };
const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const num = (x) => (x === '' || x == null ? null : Number(x));
const fmt = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x).toFixed(d).replace('.', ',')}`);
const pct = (x) => (x == null || !Number.isFinite(x) ? '–' : `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(Math.round(x * 100))} pe`);
// Rubrikankare som GitHub/VS Code: skiljetecken tas bort, mellanslag blir bindestreck, bokstaver behalls
const slug = (s) => s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');

function readMatches(code) {
  const file = path.join(root, 'data', 'matcher', `${code}.csv`);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines[0].split(',');
  const out = [];
  for (const l of lines.slice(1)) {
    const c = Object.fromEntries(head.map((h, i) => [h, l.split(',')[i] ?? '']));
    const pH = num(c.close_h), pD = num(c.close_d), pA = num(c.close_a);
    if (c.status !== 'spelad' || pH == null || pD == null || pA == null || c.hg === '') continue;
    const s = pH + pD + pA;
    out.push({
      league: code, season: c.season, date: c.date, home: c.home, away: c.away, hg: +c.hg, ag: +c.ag, res: c.res,
      pH: pH / s, pD: pD / s, pA: pA / s, pOver: num(c.over25_close) ?? num(c.over25_open),
    });
  }
  return out;
}

// Enkel linjar regression y = a + b x
function ols(xs, ys) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const b = sxx ? sxy / sxx : 0;
  return { a: my - b * mx, b };
}
// Stilvarde per lag och sasong -> z-poang (residual mot styrka) och klass 0/1/2 per axel
function styleClasses(code, matches) {
  const stil = readJson(path.join(root, 'data', 'stil', `${code}.json`));
  if (!stil) return null;
  // marknadens vantade poang per match = lagets styrka
  const xp = new Map();
  for (const m of matches) {
    for (const [t, e] of [[m.home, 3 * m.pH + m.pD], [m.away, 3 * m.pA + m.pD]]) {
      const k = `${m.season}|${t}`;
      const v = xp.get(k) ?? [0, 0];
      xp.set(k, [v[0] + e, v[1] + 1]);
    }
  }
  const rows = [];
  for (const [season, teams] of Object.entries(stil.seasons)) {
    for (const [team, s] of Object.entries(teams)) {
      const v = xp.get(`${season}|${team}`);
      if (!v || s.poss == null) continue;
      rows.push({
        season, team, strength: v[0] / v[1], poss: s.poss,
        direct: s.longBalls != null && s.pass ? s.longBalls / s.pass : null, press: s.possWonAtt3rd ?? null,
        spAtt: spValue(s.spFor, s.spXgFor), spDef: spValue(s.spAgainst, s.spXgAgainst), sp: s.spFor != null ? s : null, m: s.m ?? null,
      });
    }
  }
  if (rows.length < 20) return null;
  const z = {};
  for (const [axis, field, adjust] of [['poss', 'poss', true], ['direct', 'direct', true], ['press', 'press', true], ['possRaw', 'poss', false], ['spAtt', 'spAtt', true], ['spDef', 'spDef', true]]) {
    const ok = rows.filter((r) => r[field] != null);
    if (ok.length < 20) continue;
    let res;
    if (adjust) {
      const { a, b } = ols(ok.map((r) => r.strength), ok.map((r) => r[field]));
      res = ok.map((r) => r[field] - (a + b * r.strength));
    } else {
      // ojusterat: avvikelse fran sasongens snitt i ligan
      const mean = new Map();
      for (const r of ok) { const v = mean.get(r.season) ?? [0, 0]; mean.set(r.season, [v[0] + r[field], v[1] + 1]); }
      res = ok.map((r) => r[field] - mean.get(r.season)[0] / mean.get(r.season)[1]);
    }
    const sd = Math.sqrt(res.reduce((s, x) => s + x * x, 0) / res.length) || 1;
    ok.forEach((r, i) => { (z[`${r.season}|${r.team}`] ??= {})[axis] = res[i] / sd; });
  }
  const cls = new Map();
  for (const [k, v] of Object.entries(z)) {
    cls.set(k, Object.fromEntries(Object.entries(v).map(([axis, x]) => [axis, { z: x, c: x < -0.5 ? 0 : x > 0.5 ? 2 : 1 }])));
  }
  return { cls, raw: new Map(rows.map((r) => [`${r.season}|${r.team}`, r])) };
}

// Ackumulator for mot-marknaden-matt
const acc = () => ({ n: 0, pts: 0, pts2: 0, d: 0, ou: 0, ouN: 0, gf: 0, ga: 0 });
function add(a, pts, exp, isD, pD, goals, pOver, gf, ga) {
  const r = pts - exp;
  a.n++; a.pts += r; a.pts2 += r * r; a.d += (isD ? 1 : 0) - pD; a.gf += gf; a.ga += ga;
  if (pOver != null) { a.ou += (goals > 2.5 ? 1 : 0) - pOver; a.ouN++; }
}
const summ = (a) => {
  if (!a?.n) return null;
  const mean = a.pts / a.n, sd = Math.sqrt(Math.max(a.pts2 / a.n - mean * mean, 0.01));
  return { n: a.n, vsMkt: mean, se: sd / Math.sqrt(a.n), z: mean / (sd / Math.sqrt(a.n)), draw: a.d / a.n, over: a.ouN ? a.ou / a.ouN : null, gf: a.gf / a.n, ga: a.ga / a.n };
};

// Standard: lagets stil forra sasongen (i nagon liga i samma land). Sasongens egen stil bygger pa samma matcher som
// analyseras: lag som slar oddsen leder ofta och backar da hem, sa resultatet lacker in i stilen.
const SAME_SEASON = process.argv.includes('--samma-sasong');
const leagues = Object.keys(LEAGUE_NAMES);
const all = []; // matcher med stil for bada lag
const perLeague = {};
const loaded = [];
const byCountry = new Map(); // land -> { cls: Map(sasong|lag -> klasser), seasons: Set }
for (const code of leagues) {
  const matches = readMatches(code);
  const st = matches.length ? styleClasses(code, matches) : null;
  if (!st) { console.warn(`${code}: saknar stil eller odds, hoppar over`); continue; }
  const ctry = COUNTRY[code] ?? code;
  if (!byCountry.has(ctry)) byCountry.set(ctry, { cls: new Map(), seasons: new Set() });
  const bc = byCountry.get(ctry);
  for (const [k, v] of st.cls) bc.cls.set(k, v);
  for (const m of matches) bc.seasons.add(m.season);
  loaded.push({ code, ctry, matches, st });
}
for (const { code, ctry, matches, st } of loaded) {
  const bc = byCountry.get(ctry);
  const order = [...bc.seasons].sort();
  const prevSeason = new Map(order.map((s, i) => [s, order[i - 1]]));
  const styleOf = (season, team) => (SAME_SEASON ? bc.cls.get(`${season}|${team}`) : bc.cls.get(`${prevSeason.get(season)}|${team}`));
  let withStyle = 0;
  for (const m of matches) {
    const h = styleOf(m.season, m.home), a = styleOf(m.season, m.away);
    if (!h || !a) continue;
    m.hs = h; m.as = a; withStyle++;
    all.push(m);
  }
  const seasons = [...new Set(matches.map((m) => m.season))];
  perLeague[code] = { st, current: seasons.at(-1), n: withStyle, total: matches.length };
  console.log(`${code}: ${withStyle}/${matches.length} matcher med stil for bada lag`);
}

// --- Ligans matchningstabell: hemmalagets stil x bortalagets stil ---
function grid(ms, axis) {
  const g = Array.from({ length: 3 }, () => Array.from({ length: 3 }, acc));
  for (const m of ms) {
    const h = m.hs[axis]?.c, a = m.as[axis]?.c;
    if (h == null || a == null) continue;
    const ptsH = m.res === 'H' ? 3 : m.res === 'D' ? 1 : 0;
    add(g[h][a], ptsH, 3 * m.pH + m.pD, m.res === 'D', m.pD, m.hg + m.ag, m.pOver, m.hg, m.ag);
  }
  return g.map((r) => r.map(summ));
}
function gridTable(g, axis) {
  const L = AXES[axis].labels;
  const lines = [`| Hemma \\ Borta | ${L.join(' | ')} |`, `|---|${L.map(() => '---|').join('')}`];
  for (let h = 0; h < 3; h++) {
    lines.push(`| **${L[h]}** | ${g[h].map((s) => (s ? `${s.n} m · hemma ${fmt(s.vsMkt)} · kryss ${pct(s.draw)} · ö2,5 ${pct(s.over)}` : '–')).join(' | ')} |`);
  }
  return lines.join('\n');
}
// Samma-mot-samma (t.ex. Backar hem mot Backar hem) poolat over hela matchsamlingen
function sameVsSame(ms, axis, c) {
  const a = acc();
  for (const m of ms) if (m.hs[axis]?.c === c && m.as[axis]?.c === c) {
    add(a, m.res === 'H' ? 3 : m.res === 'D' ? 1 : 0, 3 * m.pH + m.pD, m.res === 'D', m.pD, m.hg + m.ag, m.pOver, m.hg, m.ag);
  }
  return summ(a);
}

// --- Per lag: resultat mot marknaden mot varje motstandartyp ---
// nyckel land|lag, matcher i kronologisk ordning
const teamMatches = new Map();
for (const m of all) {
  const ctry = COUNTRY[m.league] ?? m.league;
  for (const side of ['home', 'away']) {
    const team = m[side], k = `${ctry}|${team}`;
    const isH = side === 'home';
    const pts = m.res === 'D' ? 1 : (m.res === 'H') === isH ? 3 : 0;
    const exp = isH ? 3 * m.pH + m.pD : 3 * m.pA + m.pD;
    if (!teamMatches.has(k)) teamMatches.set(k, []);
    teamMatches.get(k).push({ m, isH, pts, exp, opp: isH ? m.as : m.hs, own: isH ? m.hs : m.as });
  }
}
for (const v of teamMatches.values()) v.sort((a, b) => a.m.date.localeCompare(b.m.date));

function teamProfile(list) {
  const overall = acc(), by = {}, halves = {};
  const mid = Math.floor(list.length / 2);
  list.forEach((x, i) => {
    const goals = x.m.hg + x.m.ag, gf = x.isH ? x.m.hg : x.m.ag, ga = x.isH ? x.m.ag : x.m.hg;
    add(overall, x.pts, x.exp, x.m.res === 'D', x.m.pD, goals, x.m.pOver, gf, ga);
    for (const axis of TEAM_AXES) {
      const c = x.opp[axis]?.c;
      if (c == null) continue;
      const k = `${axis}|${c}`;
      add(by[k] ??= acc(), x.pts, x.exp, x.m.res === 'D', x.m.pD, goals, x.m.pOver, gf, ga);
      add((halves[k] ??= [acc(), acc()])[i < mid ? 0 : 1], x.pts, x.exp, false, 0, goals, null, gf, ga);
    }
  });
  return { overall: summ(overall), by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, summ(v)])), halves: Object.fromEntries(Object.entries(halves).map(([k, v]) => [k, v.map(summ)])) };
}

// Stabilitetstest: forutsager lagets effekt mot en lagtyp i forsta halvan av matcherna samma effekt i andra halvan?
// Effekt = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden i samma halva.
const pairs = Object.fromEntries(TEAM_AXES.map((a) => [a, []]));
const profiles = new Map();
for (const [k, list] of teamMatches) {
  const p = teamProfile(list);
  profiles.set(k, p);
  for (const axis of TEAM_AXES) {
    const halfAll = [0, 1].map((h) => {
      const a = acc();
      for (const c of [0, 1, 2]) { const s = p.halves[`${axis}|${c}`]?.[h]; if (s) { a.n += s.n; a.pts += s.vsMkt * s.n; } }
      return a.n ? a.pts / a.n : 0;
    });
    for (const c of [0, 1, 2]) {
      const hv = p.halves[`${axis}|${c}`];
      if (!hv || !hv[0] || !hv[1] || hv[0].n < MIN_HALF || hv[1].n < MIN_HALF) continue;
      pairs[axis].push({ a: hv[0].vsMkt - halfAll[0], b: hv[1].vsMkt - halfAll[1], w: Math.min(hv[0].n, hv[1].n) });
    }
  }
}
function wcorr(ps) {
  const W = ps.reduce((s, p) => s + p.w, 0);
  if (!W) return { r: null, slope: null, n: 0 };
  const ma = ps.reduce((s, p) => s + p.w * p.a, 0) / W, mb = ps.reduce((s, p) => s + p.w * p.b, 0) / W;
  let sab = 0, saa = 0, sbb = 0;
  for (const p of ps) { sab += p.w * (p.a - ma) * (p.b - mb); saa += p.w * (p.a - ma) ** 2; sbb += p.w * (p.b - mb) ** 2; }
  const r = sab / Math.sqrt(saa * sbb);
  // Andel par dar effekten har samma tecken i bada halvorna (slump = ca 50 %)
  const same = ps.filter((p) => Math.sign(p.a) === Math.sign(p.b)).length / ps.length;
  return { r, slope: sab / saa, n: ps.length, same, se: 1 / Math.sqrt(ps.length) };
}
const stability = Object.fromEntries(TEAM_AXES.map((a) => [a, wcorr(pairs[a])]));
// Samma test bara for "starka" monster (|z| >= 2 i forsta halvan)
const strongStability = Object.fromEntries(TEAM_AXES.map((axis) => {
  const ps = pairs[axis].filter((p) => Math.abs(p.a) >= 2 * 1.25 / Math.sqrt(p.w));
  return [axis, { n: ps.length, same: ps.length ? ps.filter((p) => Math.sign(p.a) === Math.sign(p.b)).length / ps.length : null, meanB: ps.length ? ps.reduce((s, p) => s + Math.sign(p.a) * p.b, 0) / ps.length : null }];
}));

// Fasta-matchning: lagets fasta-anfall mot motstandarens fasta-forsvar, fran anfallande lagets perspektiv
// (varje match raknas en gang per lag, sa z blir nagot for optimistiskt)
function spGrid(ms) {
  const g = Array.from({ length: 3 }, () => Array.from({ length: 3 }, acc));
  for (const m of ms) {
    for (const [own, opp, isH] of [[m.hs, m.as, true], [m.as, m.hs, false]]) {
      const a = own.spAtt?.c, d = opp.spDef?.c;
      if (a == null || d == null) continue;
      const pts = m.res === 'D' ? 1 : (m.res === 'H') === isH ? 3 : 0;
      add(g[a][d], pts, isH ? 3 * m.pH + m.pD : 3 * m.pA + m.pD, m.res === 'D', m.pD, m.hg + m.ag, m.pOver, isH ? m.hg : m.ag, isH ? m.ag : m.hg);
    }
  }
  return g.map((r) => r.map(summ));
}
function spGridTable(g) {
  const A = AXES.spAtt.labels, D = AXES.spDef.labels;
  const lines = [`| Laget \\ Motståndaren | ${D.join(' | ')} |`, `|---|${D.map(() => '---|').join('')}`];
  for (let a = 0; a < 3; a++) lines.push(`| **${A[a]}** | ${g[a].map((s) => (s ? `${s.n} m · mot marknaden ${fmt(s.vsMkt)} (z ${fmt(s.z, 1)}) · mål ${s.gf.toFixed(2).replace('.', ',')} · ö2,5 ${pct(s.over)}` : '–')).join(' | ')} |`);
  return lines.join('\n');
}

// Lagets senaste sasong fore current med stil (null om ingen)
function prevOwn(raw, current, team) {
  return [...raw.keys()].filter((k) => k.endsWith(`|${team}`)).map((k) => k.split('|')[0]).filter((s) => s < current).sort().at(-1) ?? null;
}
// Lagets egna fasta-siffror: innevarande sasong och forra (innevarande ar ofta bara nagra matcher)
function spNumbers(raw, current, team) {
  const seasons = [...new Set([...raw.keys()].map((k) => k.split('|')[0]))].sort();
  const prev = seasons[seasons.indexOf(current) - 1];
  const pick = (season) => {
    const s = raw.get(`${season}|${team}`)?.sp;
    return s ? { season, m: s.m, spFor: s.spFor, spXgFor: s.spXgFor, spAgainst: s.spAgainst, spXgAgainst: s.spXgAgainst, corners: s.corners } : null;
  };
  const out = [pick(current), prev ? pick(prev) : null].filter(Boolean);
  return out.length ? out : null;
}
function spLine(raw, current, team) {
  const sp = spNumbers(raw, current, team);
  if (!sp) return null;
  const n = (x) => (x == null ? '–' : x.toFixed(2).replace('.', ','));
  return `Fasta situationer per match: ${sp.map((s) => `${s.season} (${s.m} m): ${n(s.spFor)} mål för (xG ${n(s.spXgFor)}), ${n(s.spAgainst)} emot (xG ${n(s.spXgAgainst)}), ${n(s.corners)} hörnor`).join(' · ')}.`;
}

// --- Skriv rapporter ---
fs.mkdirSync(DIR_DOC, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const json = { updatedAt: new Date().toISOString(), stability, strongStability, leagues: {} };
const pooled = TEAM_AXES.concat('possRaw').map((axis) => ({ axis, g: grid(all, axis) }));
const summary = [];

// Lagets "svarast for": lagtyp med lagst resultat relativt eget snitt, markerad om den haller i bada halvorna
function verdict(p, axis, c) {
  const s = p.by[`${axis}|${c}`], hv = p.halves[`${axis}|${c}`];
  if (!s || !p.overall) return null;
  const rel = s.vsMkt - p.overall.vsMkt;
  const zRel = rel / s.se;
  const both = hv?.[0] && hv?.[1] && hv[0].n >= 5 && hv[1].n >= 5 && Math.sign(hv[0].vsMkt - p.overall.vsMkt) === Math.sign(rel) && Math.sign(hv[1].vsMkt - p.overall.vsMkt) === Math.sign(rel);
  return { ...s, rel, zRel, both, strong: Math.abs(zRel) >= 2 && both };
}

for (const [code, info] of Object.entries(perLeague)) {
  const ms = all.filter((m) => m.league === code);
  const ctry = COUNTRY[code] ?? code;
  const curTeams = [...new Set(ms.filter((m) => m.season === info.current).flatMap((m) => [m.home, m.away]))].sort((a, b) => a.localeCompare(b, 'sv'));
  const lj = { current: info.current, grid: {}, teams: {} };
  const out = [
    `# Stilmatchning – ${LEAGUE_NAMES[code]} (${code})`, '',
    `Genererad ${today} av \`scripts/analyze-style-matchups.mjs\`. Spelstil per lag från FotMob (bollinnehav, långbollar, bollvinster högt upp), justerad för lagets styrka, ${SAME_SEASON ? 'samma säsong' : 'från lagets föregående säsong'}. ${info.n} matcher med stängningsodds och stil för båda lagen.`, '',
    'Läs så här: **mot marknaden** = poäng per match minus vad stängningsoddsen väntade sig. **Rel. eget snitt** = mot marknaden mot lagtypen minus lagets eget snitt mot marknaden (visar om laget har *särskilt* svårt för typen). **kryss/ö2,5** = utfall minus oddsens sannolikhet i procentenheter. ✔ = åt samma håll i första och andra halvan av lagets matcher, ⚑ = |z| ≥ 2 och ✔. Se [sammanfattningen](../stilmatchning.md) för hur ofta sådana mönster håller.', '',
    '## Ligan: hemmalagets stil mot bortalagets', '',
  ];
  for (const axis of ['possRaw', 'poss']) {
    const g = grid(ms, axis);
    lj.grid[axis] = g;
    out.push(`### ${AXES[axis].name}`, '', gridTable(g, axis), '');
  }
  lj.spGrid = spGrid(ms);
  out.push('### Fasta situationer: lagets anfall mot motståndarens försvar', '', 'Från det anfallande lagets perspektiv: hur går det mot oddsen när ett lag som är farligt på fasta möter ett lag som är svagt mot fasta?', '', spGridTable(lj.spGrid), '');
  out.push('## Lag (säsong ' + info.current + ')', '');
  for (const team of curTeams) {
    const p = profiles.get(`${ctry}|${team}`);
    if (!p?.overall) continue;
    // Egen stil: innevarande sasong nar den har minst 15 matcher, annars forra (som for motstandarna)
    const curRaw = info.st.raw.get(`${info.current}|${team}`);
    const ownSeason = curRaw?.m >= 15 ? info.current : (prevOwn(info.st.raw, info.current, team) ?? info.current);
    const own = info.st.cls.get(`${ownSeason}|${team}`), raw = curRaw;
    const ownTxt = own ? TEAM_AXES.map((a) => own[a] ? AXES[a].labels[own[a].c] : null).filter(Boolean).join(', ') : 'okänd';
    out.push(`### ${team}`, '');
    out.push(`Egen stil ${ownSeason} (jämfört med vad lagets styrka motiverar): **${ownTxt}**${raw ? ` (faktiskt bollinnehav ${raw.poss.toFixed(1).replace('.', ',')} %)` : ''}. ${p.overall.n} matcher med stil, mot marknaden totalt ${fmt(p.overall.vsMkt)} per match.`, '');
    const spTxt = spLine(info.st.raw, info.current, team);
    if (spTxt) out.push(spTxt, '');
    out.push('| Motståndartyp | M | Mål för–emot | Mot marknaden | Rel. eget snitt (z) | Kryss | Ö2,5 | Halvor |', '|---|---|---|---|---|---|---|---|');
    const tj = { overall: p.overall, own: own ?? null, ownSeason, vs: {}, sp: spNumbers(info.st.raw, info.current, team) };
    const flags = [];
    for (const axis of TEAM_AXES) {
      for (const c of [0, 1, 2]) {
        const v = verdict(p, axis, c);
        if (!v) continue;
        tj.vs[`${axis}|${AXES[axis].labels[c]}`] = v;
        const hv = p.halves[`${axis}|${c}`];
        out.push(`| ${AXES[axis].labels[c]} | ${v.n} | ${v.gf.toFixed(2).replace('.', ',')}–${v.ga.toFixed(2).replace('.', ',')} | ${fmt(v.vsMkt)} | ${fmt(v.rel)} (${fmt(v.zRel, 1)}) | ${pct(v.draw)} | ${pct(v.over)} | ${hv?.map((h) => (h ? fmt(h.vsMkt - p.overall.vsMkt) : '–')).join(' / ') ?? '–'} ${v.both ? '✔' : ''}${v.strong ? ' ⚑' : ''} |`);
        if (v.n >= 15) flags.push({ axis, c, ...v });
      }
    }
    const worst = flags.filter((f) => f.rel < 0).sort((a, b) => a.zRel - b.zRel)[0];
    const best = flags.filter((f) => f.rel > 0).sort((a, b) => b.zRel - a.zRel)[0];
    const say = (f, word) => `${word} **${AXES[f.axis].labels[f.c]}** (${fmt(f.rel)} p/match rel. eget snitt, z ${fmt(f.zRel, 1)}, ${f.n} m)${f.strong ? ' – ⚑ håller i båda halvorna' : f.both ? ' – åt samma håll i båda halvorna men svagt' : ' – inte stabilt, troligen slump'}`;
    const lines = [];
    if (worst) lines.push(say(worst, 'Svårast mot'));
    if (best) lines.push(say(best, 'Bäst mot'));
    if (lines.length) out.push('', ...lines.map((l) => `- ${l}`));
    out.push('');
    tj.worst = worst ? { type: AXES[worst.axis].labels[worst.c], rel: worst.rel, z: worst.zRel, n: worst.n, strong: worst.strong } : null;
    tj.best = best ? { type: AXES[best.axis].labels[best.c], rel: best.rel, z: best.zRel, n: best.n, strong: best.strong } : null;
    lj.teams[team] = tj;
    if (worst?.strong) summary.push({ code, team, ...tj.worst, dir: 'svårt' });
    if (best?.strong) summary.push({ code, team, ...tj.best, dir: 'bra' });
  }
  fs.writeFileSync(path.join(DIR_DOC, `${code}.md`), out.join('\n'), 'utf8');
  json.leagues[code] = lj;
}

// Sammanfattning
const S = [
  '# Stilmatchning – sammanfattning', '',
  `Genererad ${today} av \`scripts/analyze-style-matchups.mjs\` (stil: \`scripts/fetch-team-style.mjs\`, FotMob). ${all.length} matcher i ${Object.keys(perLeague).length} ligor med stängningsodds och spelstil för båda lagen. Per liga och lag: [stil/](stil/).`, '',
  '## Metod', '',
  '- Spelstil per lag och säsong från FotMobs lagstatistik: snittbollinnehav, andel långbollar av passningar, bollvinster på offensiv tredjedel, fasta situationer (mål och xG för och emot).',
  '- Svaga lag har nästan alltid mindre boll. Därför justeras varje mått för lagets styrka (marknadens väntade poäng per match) – "Backar hem" betyder att laget har mindre boll än dess styrka motiverar. Tredjedelar: z < −0,5 / mellan / z > 0,5 inom ligan.',
  '- Allt mäts mot stängningsoddsen. Att ett lag vinner mot defensiva lag är inte intressant om oddsen redan väntade sig det; det intressanta är om resultaten avviker från oddsen.',
  SAME_SEASON ? '- Stilen är samma säsongs snitt (--samma-sasong). Lag som slår oddsen leder ofta och backar då hem, så resultaten läcker in i stilen – använd bara som jämförelse.' : '- Varje lag klassas efter sin stil **föregående säsong** (i någon liga i samma land). Samma säsongs stil går inte att använda: lag som slår oddsen leder ofta och backar då hem, så resultatet läcker in i stilen. Stil är stabil mellan säsonger (bollinnehav r ≈ 0,65–0,85), men nyuppflyttade lag från lägre serier och lag utan förra säsongen faller bort.', '',
  '## Backar hem mot backar hem (alla ligor)', '',
  '| Stilaxel | Matchning | M | Hemmalag mot marknaden | Kryss mot odds | Över 2,5 mot marknaden |', '|---|---|---|---|---|---|',
];
for (const axis of ['possRaw', 'poss', 'direct', 'press']) {
  for (const c of [0, 2]) {
    const s = sameVsSame(all, axis, c);
    if (s) S.push(`| ${AXES[axis].name} | ${AXES[axis].labels[c]} mot ${AXES[axis].labels[c]} | ${s.n} | ${fmt(s.vsMkt)} (z ${fmt(s.z, 1)}) | ${pct(s.draw)} | ${pct(s.over)} |`);
  }
}
S.push('', '## Alla ligor: hemmalagets stil mot bortalagets', '');
for (const { axis, g } of pooled) S.push(`### ${AXES[axis].name}`, '', gridTable(g, axis), '');
const spAll = spGrid(all);
S.push('## Fasta situationer: lagets anfall mot motståndarens försvar (alla ligor)', '',
  'Fasta = snitt av mål och xG från fasta situationer per match förra säsongen (FotMob; bara mål där xG saknas), justerat för lagets styrka. Från det anfallande lagets perspektiv, så varje match räknas en gång per lag. Mot marknaden nära noll = oddsen tar redan hänsyn till fasta situationer.', '',
  spGridTable(spAll), '');
S.push('## Håller lagmönstren? (stabilitetstest)', '',
  `Varje lags matcher delas i en tidig och en sen halva. För varje lag och motståndartyp med minst ${MIN_HALF} matcher i båda halvorna jämförs lagets resultat mot typen (relativt eget snitt, mot marknaden). Om lagspecifika mönster är verkliga ska den tidiga halvan förutsäga den sena: korrelation över 0 och mer än 50 % samma tecken.`, '',
  '| Axel | Par | Korrelation tidig→sen | Samma tecken | Starka mönster (|z| ≥ 2 tidigt) | – av dem samma tecken sen | – snitt sen halva i mönstrets riktning |', '|---|---|---|---|---|---|---|');
for (const axis of TEAM_AXES) {
  const s = stability[axis], t = strongStability[axis];
  S.push(`| ${AXES[axis].name} | ${s.n} | ${fmt(s.r)} (±${(2 * s.se).toFixed(2).replace('.', ',')}) | ${Math.round(s.same * 100)} % | ${t.n} | ${t.same == null ? '–' : Math.round(t.same * 100) + ' %'} | ${fmt(t.meanB)} p/match |`);
}
S.push('', '## Lag med stabila mönster (⚑)', '', 'Lag där sämsta/bästa motståndartyp avviker med |z| ≥ 2 från lagets eget snitt mot marknaden och åt samma håll i båda halvorna. Läs tillsammans med stabilitetstestet ovan: med ~1 500 test väntas ett antal sådana av ren slump.', '',
  '| Liga | Lag | Motståndartyp | Rel. eget snitt | z | M |', '|---|---|---|---|---|---|');
for (const x of summary.sort((a, b) => Math.abs(b.z) - Math.abs(a.z))) S.push(`| ${x.code} | [${x.team}](stil/${x.code}.md#${slug(x.team)}) | ${x.dir === 'svårt' ? 'Svårt mot' : 'Bra mot'} ${x.type} | ${fmt(x.rel)} | ${fmt(x.z, 1)} | ${x.n} |`);
fs.writeFileSync(path.join(root, 'docs', 'analys', 'stilmatchning.md'), S.join('\n') + '\n', 'utf8');
json.sameVsSame = Object.fromEntries(['possRaw', 'poss', 'direct', 'press'].map((a) => [a, [0, 2].map((c) => sameVsSame(all, a, c))]));
json.flagged = summary;
// z-poang per land och "sasong|lag" for lardomssignalerna (scripts/lib/extra-signals.mjs)
const zOut = {};
for (const [ctry, bc] of byCountry) {
  zOut[ctry] = Object.fromEntries([...bc.cls].map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, x]) => [a, Math.round(x.z * 1000) / 1000]))]));
}
fs.writeFileSync(path.join(root, 'data', 'stil-z.json'), JSON.stringify({ updatedAt: new Date().toISOString(), countries: zOut }), 'utf8');
json.spGrid = spAll;
fs.writeFileSync(path.join(root, 'data', 'stilmatchning.json'), JSON.stringify(json, null, 1), 'utf8');
console.log('Stabilitet:', JSON.stringify(stability), JSON.stringify(strongStability));
console.log(`Flaggade lagmönster: ${summary.length}`);
