// Övergångar liga A -> liga B, de 6 senaste fönstren (nya ligans säsong 2024 – 2026/2027): hur det gick och vad som
// förutsäger att en spelare lyckas. Rådata: data/spelare/_karriar.json (scripts/fetch-player-careers-fotmob.mjs) och
// data/spelare/<liga>.json (ålder, position).
//   Lyckad   = ordinarie (minst hälften av omgångarna, mätt som matcher / flest matcher någon spelare gjorde i
//              ligasäsongen) och FotMob-betyg minst ligasäsongens median (spelare med minst 10 matcher)
//   Nivå     = ligornas styrka ur bytena (samma spelare får lägre betyg i en starkare liga)
//   Prognos  = logistisk regression, tränad på byten till säsong 2024 och 2024/2025, testad på senare byten
// Skriver docs/lardomar/overgangar.md och data/lardomar/overgangar.json.
// Körs: node scripts/lardomar-overgangar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/learnings-data.mjs';
import { median, fitLeagueLevels, logistic, auc, buildMoves, leagueSeasonStats, teamSeasonStats, features, FEATURE_NAMES } from './lib/transfer-study.mjs';

const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return d; } };
const pct = (a, b) => (b ? Math.round((100 * a) / b) : null);
const rate = (arr) => `${pct(arr.filter((m) => m.success).length, arr.length)} % (${arr.length})`;
const fx = (v, d = 2) => (v == null ? '–' : (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).replace('.', ','));
const DIR = path.join(root, 'data', 'spelare');
const car = readJson(path.join(DIR, '_karriar.json'), {});

// Ålder och position från spelarfilerna, och hela truppernas ligasäsonger (årets och förra) för ligornas median
const info = new Map();
const extra = [];
for (const f of fs.readdirSync(DIR).filter((x) => /^[A-Z0-9]+\.json$/.test(x))) {
  const d = readJson(path.join(DIR, f), {});
  for (const t of Object.values(d.teams ?? {})) for (const p of t.players ?? []) {
    if (!info.has(String(p.id))) info.set(String(p.id), { born: p.info?.born ?? null, pos: p.position?.group ?? null, league: f.slice(0, -5), team: p.team, mv: p.marketValueHistory ?? [] });
    for (const s of [p.season, p.prevSeason]) {
      if (!s?.stats || !s.tournamentId) continue;
      extra.push({ id: String(p.id), leagueId: s.tournamentId, season: s.season, apps: s.stats.matches_uppercase?.[0] ?? null, rating: s.stats.rating?.[0] ?? null });
    }
  }
}

const players = Object.entries(car).map(([id, c]) => ({ id, name: c.name, born: c.born ?? info.get(id)?.born, pos: c.pos ?? info.get(id)?.pos, seasons: c.seasons,
  // Marknadsvärdet strax innan nya säsongen började (senaste värdet före 1 juli resp. 15 januari)
  valueAt: (season) => {
    const y = String(season ?? "").slice(0, 4), cut = String(season).includes("/") ? y + "-07-01" : y + "-01-15";
    return (info.get(id)?.mv ?? []).filter(([d]) => d && d <= cut).at(-1)?.[1] ?? null;
  } }));
const ls = leagueSeasonStats(players, extra);
const moves = buildMoves(players, ls, { ts: teamSeasonStats(players) });
console.log(`${players.length} spelare, ${moves.length} ligabyten`);

// Ligornas nivå: byten med betyg i båda ligorna och minst 10 matcher på båda sidor
const fitSet = moves.filter((m) => m.from.rating && m.to.rating && m.from.apps >= 10 && m.to.apps >= 10)
  .map((m) => ({ a: m.from.leagueId, b: m.to.leagueId, d: m.to.rating - m.from.rating }));
const levels = fitLeagueLevels(fitSet);
const leagueName = new Map();
for (const m of moves) { leagueName.set(m.from.leagueId, m.from.league); leagueName.set(m.to.leagueId, m.to.league); }
const leagueN = new Map();
for (const m of fitSet) { leagueN.set(m.a, (leagueN.get(m.a) ?? 0) + 1); leagueN.set(m.b, (leagueN.get(m.b) ?? 0) + 1); }

for (const m of moves) Object.assign(m, features(m, levels));

// Utvärderingsbara: betyg i gamla ligan finns, nya ligans säsong har minst 1 omgång kvar att mäta på (inte 2026/2027)
const evalSet = moves.filter((m) => m.x && m.to.season !== '2026/2027' && m.to.roundsMax >= 10);
const train = evalSet.filter((m) => m.to.end <= 2025 && m.to.season !== '2025');
const test = evalSet.filter((m) => !train.includes(m));
const model = logistic(train.map((m) => m.x), train.map((m) => (m.success ? 1 : 0)));
const pTest = test.map((m) => model.predict(m.x));
const aucTest = auc(pTest, test.map((m) => (m.success ? 1 : 0)));
const pTrain = train.map((m) => model.predict(m.x));
const aucTrain = auc(pTrain, train.map((m) => (m.success ? 1 : 0)));
// Enbart förväntat betyg (en siffra) som jämförelse
const aucSimple = auc(test.map((m) => m.expRel), test.map((m) => (m.success ? 1 : 0)));

// Två delfrågor: får han spela (ordinarie) och presterar han när han spelar (minst 10 matcher: betyg mot median)
const corr = (a, b) => {
  const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
  const cov = a.reduce((s, v, i) => s + (v - ma) * (b[i] - mb), 0);
  return cov / Math.sqrt(a.reduce((s, v) => s + (v - ma) ** 2, 0) * b.reduce((s, v) => s + (v - mb) ** 2, 0));
};
const played = evalSet.filter((m) => m.to.apps >= 10 && m.to.rating && m.to.median);
const relB = played.map((m) => m.to.rating - m.to.median);
const perf = {
  n: played.length,
  rExp: corr(played.map((m) => m.expRel), relB),
  rOld: corr(played.map((m) => m.relA), relB),
  rTwo: corr(played.map((m) => m.rel2), relB),
  // Hur mycket av försprånget i gamla ligan finns kvar i nya (lutning relB mot relA)
  keep: (() => { const a = played.map((m) => m.relA), ma = a.reduce((s, v) => s + v, 0) / a.length, mb = relB.reduce((s, v) => s + v, 0) / relB.length;
    return a.reduce((s, v, i) => s + (v - ma) * (relB[i] - mb), 0) / a.reduce((s, v) => s + (v - ma) ** 2, 0); })(),
};
const regularRate = pct(evalSet.filter((m) => m.to.share >= 0.5).length, evalSet.length);
const goodWhenPlaying = pct(relB.filter((v) => v >= 0).length, relB.length);
// Andra säsongen: hur det gick för dem som lyckades / inte lyckades första året
const second = [true, false].map((s) => {
  const g = evalSet.filter((m) => m.success === s && m.to.end <= 2025);
  const stayed = g.filter((m) => m.next);
  return { first: s, n: g.length, stayed: pct(stayed.length, g.length), regular2: pct(stayed.filter((m) => m.next.share >= 0.5).length, g.length) };
});
// Slutmodell på allt för prognoser
const full = logistic(evalSet.map((m) => m.x), evalSet.map((m) => (m.success ? 1 : 0)));
for (const m of moves) m.p = m.x ? full.predict(m.x) : null;


// Kalibrering i testet
const buckets = [[0, 0.2], [0.2, 0.35], [0.35, 0.5], [0.5, 0.65], [0.65, 1.01]].map(([a, b]) => {
  const s = test.filter((m, i) => pTest[i] >= a && pTest[i] < b);
  return { range: `${Math.round(a * 100)}–${Math.min(100, Math.round(b * 100))} %`, n: s.length, hit: pct(s.filter((m) => m.success).length, s.length) };
});

// Tumregel: förväntat betyg i nya ligan mot ligans median
const expBuckets = [[-9, -0.3], [-0.3, -0.1], [-0.1, 0.1], [0.1, 0.3], [0.3, 9]].map(([a, b]) => {
  const s = evalSet.filter((m) => m.expRel >= a && m.expRel < b);
  return { range: a < -1 ? `under ${fx(b, 1)}` : b > 1 ? `över ${fx(a, 1)}` : `${fx(a, 1)} till ${fx(b, 1)}`, n: s.length, rate: pct(s.filter((m) => m.success).length, s.length) };
});

// Faktorer en och en
const by = (fn, labels) => labels.map(([lab, test]) => { const s = evalSet.filter((m) => test(fn(m))); return { lab, n: s.length, rate: pct(s.filter((m) => m.success).length, s.length) }; });
const factors = {
  'Ålder vid bytet': by((m) => m.age, [['under 21', (a) => a != null && a < 21], ['21–23', (a) => a >= 21 && a < 24], ['24–27', (a) => a >= 24 && a < 28], ['28–30', (a) => a >= 28 && a < 31], ['31+', (a) => a >= 31]]),
  'Speltid i gamla ligan': by((m) => m.from.share, [['under 33 %', (s) => s < 0.33], ['33–60 %', (s) => s >= 0.33 && s < 0.6], ['60 %+', (s) => s >= 0.6]]),
  'Nivåskillnad (ny minus gammal)': by((m) => m.gap, [['klart svagare liga (< -0,25)', (g) => g < -0.25], ['lite svagare', (g) => g >= -0.25 && g < -0.08], ['ungefär samma', (g) => g >= -0.08 && g <= 0.08], ['lite starkare', (g) => g > 0.08 && g <= 0.25], ['klart starkare (> 0,25)', (g) => g > 0.25]]),
  'Lån eller köp': by((m) => m.loan, [['köp/fri', (l) => !l], ['lån', (l) => l]]),
  'Position': by((m) => m.pos, [['målvakt', (p) => p === 'malvakt'], ['mittback', (p) => p === 'mittback'], ['ytterback', (p) => p === 'ytterback'], ['mittfält', (p) => /mittfaltare/.test(p ?? '')], ['ytter', (p) => p === 'ytter'], ['anfallare', (p) => p === 'anfallare']]),
};

// Vanligaste ligaparen
const pairs = new Map();
for (const m of evalSet) {
  const k = `${m.from.league} → ${m.to.league}`;
  if (!pairs.has(k)) pairs.set(k, []);
  pairs.get(k).push(m);
}
const pairRows = [...pairs.entries()].filter(([, v]) => v.length >= 8).sort((a, b) => b[1].length - a[1].length).slice(0, 40)
  .map(([k, v]) => ({ pair: k, n: v.length, rate: pct(v.filter((m) => m.success).length, v.length), dRating: median(v.filter((m) => m.from.apps >= 10 && m.to.apps >= 10).map((m) => m.to.rating - m.from.rating)) }));

const levelRows = [...levels.entries()].filter(([id]) => (leagueN.get(id) ?? 0) >= 15).sort((a, b) => b[1] - a[1])
  .map(([id, v]) => ({ id, league: leagueName.get(id), level: v, n: leagueN.get(id) }));

const weights = FEATURE_NAMES.map((n, j) => ({ name: n, w: full.w[j + 1] })).sort((a, b) => Math.abs(b.w) - Math.abs(a.w));

// Sommarens byten (säsong 2026 och 2026/2027) till våra ligor med prognos
const recent = moves.filter((m) => m.x && m.latest && (m.to.season === '2026/2027' || m.to.season === '2026'))
  .sort((a, b) => b.p - a.p);

// Ligor med samma namn (Premier League i England, Ryssland, Ukraina …) får sitt id i texten
const nameCount = new Map();
for (const l of levelRows) nameCount.set(l.league, (nameCount.get(l.league) ?? 0) + 1);
for (const l of levelRows) if (nameCount.get(l.league) > 1) l.label = `${l.league} (id ${l.id})`; else l.label = l.league;

const out = { updatedAt: new Date().toISOString(), players: players.length, moves: moves.length, evaluated: evalSet.length,
  successRate: pct(evalSet.filter((m) => m.success).length, evalSet.length), regularRate, goodWhenPlaying, perf, second,
  aucTrain, aucTest, aucSimple, train: train.length, test: test.length, buckets, expBuckets, factors, pairRows, levelRows, weights,
  recent: recent.map((m) => ({ id: m.id, name: m.name, from: m.from.team, fromLeague: m.from.league, to: m.to.team, toLeague: m.to.league, season: m.to.season, age: m.age, expRel: m.expRel, p: m.p, apps: m.to.apps, rating: m.to.rating })) };
fs.mkdirSync(path.join(root, 'data', 'lardomar'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'lardomar', 'overgangar.json'), JSON.stringify(out, null, 1), 'utf8');
console.log(`Utvärderade ${evalSet.length} (träning ${train.length}, test ${test.length}), lyckade ${out.successRate} %`);
console.log(`AUC träning ${fx(aucTrain)}, test ${fx(aucTest)}, bara förväntat betyg ${fx(aucSimple)}`);
console.log('Kalibrering (test):', buckets.map((b) => `${b.range}: ${b.hit} % av ${b.n}`).join(' | '));
console.log('Förväntat betyg mot median:', expBuckets.map((b) => `${b.range}: ${b.rate} % av ${b.n}`).join(' | '));
for (const [k, v] of Object.entries(factors)) console.log(k + ':', v.map((x) => `${x.lab} ${x.rate} % (${x.n})`).join(' | '));
console.log('Vikter:', weights.map((w) => `${w.name} ${fx(w.w)}`).join(', '));
console.log('Nivåer:', levelRows.slice(0, 50).map((l) => `${l.league} ${fx(l.level)} (${l.n})`).join(' | '));
console.log('Par:', pairRows.slice(0, 25).map((p) => `${p.pair} ${p.rate} % av ${p.n}, Δbetyg ${fx(p.dRating)}`).join('\n'));
console.log(`Ordinarie ${regularRate} %, bra när de spelar ${goodWhenPlaying} % (n ${perf.n}); r förväntat ${fx(perf.rExp)}, r gammalt ${fx(perf.rOld)}, r två säsonger ${fx(perf.rTwo)}, kvar av försprång ${fx(perf.keep)}`);
console.log('Andra säsongen:', second.map((s) => `${s.first ? 'lyckades' : 'lyckades inte'} år 1 (${s.n}): kvar i ligan ${s.stayed} %, ordinarie år 2 ${s.regular2} %`).join(' | '));

// ---------- Rapport ----------
const md = [];
const tbl = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
md.push(`# Övergångar: lyckas spelaren i sin nya liga?

Uppdaterad ${out.updatedAt.slice(0, 10)} av \`scripts/lardomar-overgangar.mjs\` (rådata: \`scripts/fetch-player-careers-fotmob.mjs\`).
${players.length} spelare som bytt klubb sedan januari 2024, ${moves.length} ligabyten, varav ${evalSet.length} går att utvärdera
(betyg i gamla ligan finns och nya ligans säsong har spelats klart eller nästan klart).

## Kort sagt

- **Bara ${out.successRate} % av alla ligabyten blir en klar succé** (ordinarie och betyg minst i nivå med ligans median).
  ${regularRate} % blir ordinarie, och av dem som får minst 10 matcher presterar ${goodWhenPlaying} % minst som ligans median.
- **Det bästa enskilda måttet är "förväntat betyg i nya ligan"**: betyget i gamla ligan minus hur mycket svårare nya ligan är.
  Ligger det över nya ligans median lyckas ${expBuckets.at(-1).rate} %, ligger det klart under lyckas bara ${expBuckets[0].rate} %.
- **Bara ${fx(perf.keep * 100, 0)} % av försprånget följer med.** En spelare som var 0,30 bättre än medianen i gamla ligan är i snitt
  ${fx(perf.keep * 0.3)} bättre än medianen i nya, efter nivåjusteringen. Resten är tur, lagets stil och roll.
- Modellen skiljer lyckade från misslyckade bättre än slumpen men långt ifrån perfekt (AUC ${fx(aucTest)} på byten den inte tränats på,
  0,5 = slump, 1 = perfekt). Den säger "troligare / mindre troligt", inte "säkert".

## Så läser du det här

- **Betyg** är FotMobs matchbetyg (6,0–10). **Median** är mittenbetyget bland spelare med minst 10 matcher i samma liga och säsong.
- **Nivå** är hur svår ligan är, räknat ur bytena själva: tappar spelare som går från A till B i snitt 0,2 i betyg är B 0,2 starkare.
- **Förväntat betyg mot median** = betyg i gamla ligan − nivåskillnaden − nya ligans median. Positivt = borde vara bättre än mittenspelaren.
- **Ordinarie** = minst hälften av omgångarna (matcher delat med flest matcher någon spelare gjorde i ligan den säsongen).
- Spelare som flyttat till en liga vi inte följer och inte kommit tillbaka saknas, så misslyckanden är något underskattade.

## Tumregel: förväntat betyg i nya ligan mot ligans median

${tbl(['Förväntat betyg mot median', 'Byten', 'Lyckades'], expBuckets.map((b) => [b.range, b.n, `${b.rate} %`]))}

## Vad påverkar, en sak i taget

${Object.entries(factors).map(([k, v]) => `**${k}**\n\n${tbl(['', 'Byten', 'Lyckades'], v.map((x) => [x.lab, x.n, `${x.rate} %`]))}`).join('\n\n')}

## Modellen

Logistisk regression, tränad på ${train.length} byten (nya ligans säsong 2024 och 2024/2025) och testad på ${test.length} senare byten.
AUC träning ${fx(aucTrain)}, test ${fx(aucTest)}. Bara förväntat betyg ger ${fx(aucSimple)}, så resten av faktorerna tillför lite.

Träffsäkerhet i testet (sa modellen X %, hur ofta lyckades de?):

${tbl(['Modellens chans', 'Byten', 'Lyckades'], buckets.filter((b) => b.n).map((b) => [b.range, b.n, `${b.hit} %`]))}

Vikter (standardiserade, slutmodellen på alla byten; positivt = ökar chansen):

${tbl(['Faktor', 'Vikt'], weights.map((w) => [w.name, fx(w.w)]))}

När spelaren väl spelar (minst 10 matcher) är sambandet med betyget mot medianen i nya ligan: förväntat betyg r = ${fx(perf.rExp)},
gamla betyget r = ${fx(perf.rOld)}, två säsonger r = ${fx(perf.rTwo)} (0 = inget samband, 1 = perfekt).

## Andra säsongen

${tbl(['Första året', 'Byten', 'Kvar i ligan år 2', 'Ordinarie år 2'], second.map((s) => [s.first ? 'lyckades' : 'lyckades inte', s.n, `${s.stayed} %`, `${s.regular2} %`]))}

## Ligornas nivå (ur bytena, minst 15 byten)

${tbl(['Liga', 'Nivå', 'Byten'], levelRows.map((l) => [l.label, fx(l.level), l.n]))}

## Vanligaste ligabytena (minst 8)

${tbl(['Från → till', 'Byten', 'Lyckades', 'Betyg, median förändring'], pairRows.map((p) => [p.pair, p.n, `${p.rate} %`, fx(p.dRating)]))}

## Årets nyförvärv: prognos

Byten där nya ligans säsong är 2026 eller 2026/2027 (spelaren är kvar i klubben). Chansen är modellens; matcher/betyg hittills som facit.

${tbl(['Spelare', 'Från', 'Till', 'Ålder', 'Förväntat mot median', 'Chans', 'Hittills'],
  recent.slice(0, 60).map((m) => [m.name, `${m.from.team} (${m.from.league})`, `${m.to.team} (${m.to.league})`, m.age ? Math.floor(m.age) : '–', fx(m.expRel), `${Math.round(m.p * 100)} %`,
    `${m.to.apps} m${m.to.rating ? `, ${fx(m.to.rating)}` : ''}`]))}
`);
fs.writeFileSync(path.join(root, 'docs', 'lardomar', 'overgangar.md'), md.join('\n'), 'utf8');
console.log('Skrev docs/lardomar/overgangar.md');
