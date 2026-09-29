// Felanalys av tipsen per liga -> docs/lardomar/anteckningar/<liga>.md (en lardomsfil per liga).
// Den automatiska delen (mellan AUTO-markeringarna) skrivs om varje korning; allt under
// "Lärdomar och beslut" ar handskrivet och behalls. Kors dagligen efter export-league-matches.mjs.
// Underlag: data/reports/pro-evaluation.json (tipAccuracy), data/reports/tips-backtest.json (per match,
// fran scripts/pro-layer.mjs) och data/matcher/<liga>.csv (all historik med odds).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs', 'lardomar', 'anteckningar');
const readJson = (p, fb = null) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fb);
const today = new Date().toISOString().slice(0, 10);
const AUTO_START = '<!-- AUTO:START (skrivs om av scripts/tips-felanalys.mjs, ändra inte här) -->';
const AUTO_END = '<!-- AUTO:END -->';
// Ligor med matchfil men utan plats i webben (inga tips, bara odds-historik)
const EXTRA_NAMES = { EL2: 'League Two' };
const MANUAL_HEAD = '## Lärdomar och beslut (handskrivet, daterat – nyast överst)';

const cfg = readJson(path.join(root, 'config', 'leagues.json'), { leagues: {} });
const tipAcc = readJson(path.join(root, 'data', 'reports', 'pro-evaluation.json'), {}).tipAccuracy ?? {};
const perMatch = readJson(path.join(root, 'data', 'reports', 'tips-backtest.json'), { matches: [] }).matches;
const matcherDir = path.join(root, 'data', 'matcher');
const csvLeagues = fs.existsSync(matcherDir) ? fs.readdirSync(matcherDir).filter((f) => f.endsWith('.csv')).map((f) => f.slice(0, -4)) : [];
const leagues = [...new Set([...Object.keys(cfg.leagues ?? {}), ...csvLeagues])].sort();

const pct = (x, d = 1) => (x == null || !Number.isFinite(x) ? '–' : `${(100 * x).toFixed(d).replace('.', ',')} %`);
const num = (x, d = 1) => (x == null || !Number.isFinite(x) ? '–' : x.toFixed(d).replace('.', ',').replace('-', '−'));
const pe = (x) => `${x >= 0 ? '+' : '−'}${Math.abs(100 * x).toFixed(1).replace('.', ',')} pe`;
const IDX = { H: 0, D: 1, A: 2 };
const argmax = (a) => a.indexOf(Math.max(...a));

function readCsv(lg) {
  const f = path.join(matcherDir, `${lg}.csv`);
  if (!fs.existsSync(f)) return [];
  const [head, ...lines] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
  const cols = head.split(',');
  return lines.map((l) => {
    const v = l.split(',');
    return Object.fromEntries(cols.map((k, i) => [k, v[i] ?? '']));
  });
}
const probs = (r, k) => {
  const p = [r[`${k}_h`], r[`${k}_d`], r[`${k}_a`]].map(Number);
  return p[0] > 0 && p[1] > 0 && p[2] > 0 ? p : null;
};
// Oddsen tipset hade: senaste fore avspark (egen avlasning, annars stangning), annars oppning
const lastOdds = (r) => probs(r, 'pre_last') ?? probs(r, 'close') ?? probs(r, 'open') ?? probs(r, 'pre_first');
const openOdds = (r) => probs(r, 'open') ?? probs(r, 'pre_first') ?? probs(r, 'close');

function verdictZ(z) {
  if (z == null) return '–';
  if (z <= -2) return 'sämre än tipsens procent lovade';
  if (z >= 2) return 'bättre än tipsens procent lovade';
  return 'inom slumpen';
}

// Situationer dar favoriten kan missa oftare an oddsen sager (samma test som i analysen 2026-09-28)
function situations(rows) {
  const cnt = {};
  const res = {};
  for (const r of rows) {
    const p = openOdds(r);
    if (!p) continue;
    const kh = r.season + '|' + r.home, ka = r.season + '|' + r.away;
    cnt[kh] = (cnt[kh] ?? 0) + 1; cnt[ka] = (cnt[ka] ?? 0) + 1;
    const f = argmax(p);
    if (f === 1) continue;
    const a = IDX[r.res];
    const promo = r.promo === '' ? null : Number(r.promo);
    const steam = r.steam === '' ? null : Number(r.steam);
    const o25 = Number(r.over25_open) || Number(r.over25_close) || null;
    const tags = {
      'Oddsen rör sig bort från favoriten (öppning → stängning)': steam != null && (f === 0 ? steam : -steam) < -0.02,
      'Storfavorit (≥ 70 %)': p[f] >= 0.7,
      'Jämn match (favorit < 45 %)': p[f] < 0.45,
      'Bortafavorit': f === 2,
      'Målsnål match (över 2,5 < 45 %)': o25 != null && o25 < 0.45,
      'Omgång 1–5': Math.min(cnt[kh], cnt[ka]) <= 5,
      'Uppflyttad favorit': promo != null && ((f === 0 && promo > 0) || (f === 2 && promo < 0)),
    };
    const ctrl = r.season >= '2023';
    for (const [t, on] of Object.entries(tags)) {
      if (!on) continue;
      const s = (res[t] ??= { tr: [0, 0, 0, 0, 0], co: [0, 0, 0, 0, 0] });
      const b = ctrl ? s.co : s.tr;
      b[0]++; b[1] += (a === f ? 1 : 0) - p[f]; b[2] += p[f] * (1 - p[f]);
      b[3] += (a === 1 ? 1 : 0) - p[1]; b[4] += p[1] * (1 - p[1]);
    }
  }
  return res;
}

function autoSection(lg) {
  const name = cfg.leagues?.[lg]?.name ?? EXTRA_NAMES[lg] ?? lg;
  const L = [];
  const acc = tipAcc[lg] ?? {};
  const rows = readCsv(lg).filter((r) => r.status === 'spelad' && IDX[r.res] != null);
  L.push(`Uppdaterad ${today}. Källor: \`data/reports/pro-evaluation.json\` (tipAccuracy), \`data/reports/tips-backtest.json\`, \`data/matcher/${lg}.csv\`.`, '');

  // 1. Tipsmotorns traff
  L.push('### Tipsens träff (1X2, samma motor som live)', '');
  const seasons = Object.keys(acc).sort();
  if (!seasons.length) {
    L.push(cfg.leagues?.[lg] ? 'Ingen backtest av tipsmotorn för ligan ännu (för få spelade matcher i modellen, eller cupformat utan modell).' : 'Ligan finns inte i webben och tippas inte. Oddsfavoritens facit nedan visar hur tipsen skulle ha gått (tipsen följer oddsen i ligor med odds).', '');
  } else {
    L.push('| Säsong | Matcher | Träff | Väntat (tipsens procent) | Skillnad (z) | Alltid hemma | Missar: kryss / skräll | Styrs av |', '|---|---|---|---|---|---|---|---|');
    for (const s of seasons) {
      const a = acc[s];
      const src = a.bySource?.odds?.tested ? (a.bySource?.modell?.tested ? 'odds + modell' : `odds${a.modelW ? ` (DC ${Math.round(a.modelW * 100)} %)` : ''}`) : 'modell (inga odds)';
      L.push(`| ${s} | ${a.n} | ${pct(a.rate)} | ${pct(a.expectedRate)} | ${pe(a.rate - a.expectedRate)} (${num(a.zVsExpected)}) | ${pct(a.homeRate)} | ${a.missDraw} / ${a.missUpset} | ${src} |`);
    }
    const cur = acc[seasons.at(-1)];
    L.push('', `Bedömning ${seasons.at(-1)}: ${verdictZ(cur.zVsExpected)} (z ${num(cur.zVsExpected)}). ${cur.rate < cur.homeRate ? 'Tipsen träffar sämre än att alltid tippa hemma – granska.' : cur.rate === cur.homeRate ? 'Tipsen träffar lika ofta som att alltid tippa hemma.' : 'Tipsen slår att alltid tippa hemma.'}`, '');
  }

  // 2. Oddsfavoriten over tid
  const bySeason = {};
  for (const r of rows) {
    const p = lastOdds(r);
    if (!p) continue;
    const f = argmax(p);
    const a = IDX[r.res];
    const b = (bySeason[r.season] ??= { n: 0, hit: 0, exp: 0, v: 0, d: 0, ed: 0, vd: 0 });
    b.n++; b.exp += p[f]; b.v += p[f] * (1 - p[f]);
    if (a === f) b.hit++;
    if (a === 1) b.d++;
    b.ed += p[1]; b.vd += p[1] * (1 - p[1]);
  }
  const bs = Object.keys(bySeason).sort().slice(-5);
  if (bs.length) {
    L.push('### Oddsfavoriten och kryssen per säsong', '');
    L.push('| Säsong | Matcher | Favoriten vann | Oddsens förväntan | z | Kryss | Kryss väntat | z |', '|---|---|---|---|---|---|---|---|');
    for (const s of bs) {
      const b = bySeason[s];
      L.push(`| ${s} | ${b.n} | ${pct(b.hit / b.n)} | ${pct(b.exp / b.n)} | ${num((b.hit - b.exp) / Math.sqrt(b.v))} | ${pct(b.d / b.n)} | ${pct(b.ed / b.n)} | ${num((b.d - b.ed) / Math.sqrt(b.vd))} |`);
    }
    L.push('');
  } else {
    L.push('### Oddsfavoriten och kryssen per säsong', '', 'Inga odds i historiken för ligan (tipsen följer modellen).', '');
  }

  // 3. I ar: vad gick fel
  const curSeason = [...new Set(rows.map((r) => r.season))].sort().at(-1);
  const cur = rows.filter((r) => r.season === curSeason);
  if (cur.length) {
    L.push(`### ${curSeason}: vad gick fel`, '');
    let favH = [0, 0, 0], favA = [0, 0, 0], big = [0, 0, 0];
    const team = {};
    let withOdds = 0;
    for (const r of cur) {
      const p = lastOdds(r);
      if (!p) continue;
      withOdds++;
      const a = IDX[r.res];
      const f = p[0] >= p[2] ? 0 : 2;
      const t = f === 0 ? favH : favA;
      t[0]++; t[1] += a === f ? 1 : 0; t[2] += p[f];
      if (p[f] >= 0.6) { big[0]++; big[1] += a === f ? 1 : 0; big[2] += p[f]; }
      const exp = [3 * p[0] + p[1], 3 * p[2] + p[1]];
      const got = [a === 0 ? 3 : a === 1 ? 1 : 0, a === 2 ? 3 : a === 1 ? 1 : 0];
      for (const [tm, i] of [[r.home, 0], [r.away, 1]]) {
        const s = (team[tm] ??= { n: 0, d: 0 });
        s.n++; s.d += got[i] - exp[i];
      }
    }
    if (withOdds) {
      const d = bySeason[curSeason];
      if (d) L.push(`- Kryss: ${d.d} av ${d.n} (${pct(d.d / d.n)}) mot väntat ${num(d.ed, 1)} (z ${num((d.d - d.ed) / Math.sqrt(d.vd))}).`);
      L.push(`- Hemmafavoriter vann ${favH[1]} av ${favH[0]} (väntat ${num(favH[2])}), bortafavoriter ${favA[1]} av ${favA[0]} (väntat ${num(favA[2])}), favoriter ≥ 60 % ${big[1]} av ${big[0]} (väntat ${num(big[2])}).`);
      const ts = Object.entries(team).filter(([, s]) => s.n >= 3).sort((a, b) => a[1].d - b[1].d);
      if (ts.length >= 6) {
        L.push(`- Lag sämst mot oddsen (poäng mot förväntat): ${ts.slice(0, 4).map(([t, s]) => `${t} ${num(s.d)} (${s.n} m)`).join(', ')}.`);
        L.push(`- Lag bäst mot oddsen: ${ts.slice(-4).reverse().map(([t, s]) => `${t} +${num(s.d)} (${s.n} m)`).join(', ')}. Beskrivande: lagens avvikelse mot oddsen håller inte i sig (se ligafilen), så den används inte i tipsen.`);
      }
    } else {
      L.push(`- ${cur.length} spelade matcher, inga odds. Tipsen följer modellen, se tabellen ovan.`);
    }
    // Modellen mot oddsen nar de var oense (grundmodellen, bara 2026/27)
    const pm = perMatch.filter((m) => m.league === lg && m.season === curSeason && m.market);
    let dis = 0, mRight = 0, oRight = 0, dcRight = 0, dcDis = 0;
    for (const m of pm) {
      const act = IDX[m.result];
      const o = argmax(m.market);
      const dcp = argmax(m.dc);
      if (dcp !== o) { dcDis++; if (dcp === act) dcRight++; }
      if (!m.base) continue;
      const mp = argmax(m.base);
      if (mp !== o) { dis++; if (mp === act) mRight++; if (o === act) oRight++; }
    }
    if (dis) L.push(`- Grundmodellen och oddsen var oense i ${dis} matcher: grundmodellen rätt ${mRight}, oddsen rätt ${oRight}.`);
    if (dcDis) L.push(`- Dixon-Coles och oddsen var oense i ${dcDis} matcher: DC rätt ${dcRight}.`);
    L.push('');
  }

  // 4. Situationer mot oddsen
  const sit = situations(rows);
  const sitRows = Object.entries(sit).filter(([, s]) => s.tr[0] >= 60 && s.co[0] >= 30);
  if (sitRows.length) {
    L.push('### Vad systemet kan missa: situationer mot öppningsoddsen', '');
    L.push('Favoritens vinst och kryss mot oddsens förväntan. Träning = före 2023/24, kontroll = 2023/24–. Bekräftad = |z| ≥ 2,5 i träning och ≥ 2 i kontroll med samma tecken.', '');
    L.push('| Situation | n tr / ko | Favorit tr (z) | Favorit ko (z) | Kryss tr (z) | Kryss ko (z) | Bedömning |', '|---|---|---|---|---|---|---|');
    for (const [t, s] of sitRows) {
      const z = (b, i, v) => b[i] / Math.sqrt(b[v] || 1);
      const zf = [z(s.tr, 1, 2), z(s.co, 1, 2)], zd = [z(s.tr, 3, 4), z(s.co, 3, 4)];
      const ok = (zz) => Math.abs(zz[0]) >= 2.5 && Math.abs(zz[1]) >= 2 && Math.sign(zz[0]) === Math.sign(zz[1]);
      const bed = ok(zf) ? (zf[1] < 0 ? 'bekräftad: favoriten överskattad' : 'bekräftad: favoriten underskattad')
        : ok(zd) ? (zd[1] > 0 ? 'bekräftad: kryss underskattat' : 'bekräftad: kryss överskattat') : 'ingen säker effekt';
      L.push(`| ${t} | ${s.tr[0]} / ${s.co[0]} | ${pe(s.tr[1] / s.tr[0])} (${num(zf[0])}) | ${pe(s.co[1] / s.co[0])} (${num(zf[1])}) | ${pe(s.tr[3] / s.tr[0])} (${num(zd[0])}) | ${pe(s.co[3] / s.co[0])} (${num(zd[1])}) | ${bed} |`);
    }
    L.push('', 'Oddsrörelser mot favoriten är redan inräknade när tipset bygger på de senaste oddsen (motorn läser om oddsen vid varje körning). Storfavoriters underskattning ändrar inte vilket tecken som tippas.', '');
  }
  L.push(`Mer om ligan (signaler, kalibrering, Stryktipset): [ligor/${lg}.md](../ligor/${lg}.md).`);
  return { name, text: L.join('\n') };
}

fs.mkdirSync(outDir, { recursive: true });
const index = [];
for (const lg of leagues) {
  const file = path.join(outDir, `${lg}.md`);
  const { name, text } = autoSection(lg);
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const mi = old.indexOf(MANUAL_HEAD);
  const manual = mi >= 0 ? old.slice(mi).trimEnd() : `${MANUAL_HEAD}\n\nInga egna lärdomar ännu.`;
  const doc = [
    `# ${name} (${lg}) – lärdomar om tipsen`, '',
    'En fil per liga. Den automatiska delen visar hur tipsen gått och vad som blivit fel; den skrivs om dagligen av `node scripts/tips-felanalys.mjs`. Lärdomarna längst ner skrivs för hand (eller av lärdomsagenten), dateras och ligger kvar.', '',
    AUTO_START, '', text, '', AUTO_END, '', manual, '',
  ].join('\n');
  fs.writeFileSync(file, doc, 'utf8');
  const cur = Object.entries(tipAcc[lg] ?? {}).sort().at(-1)?.[1];
  index.push(`| [${lg}](${lg}.md) | ${name} | ${cur ? cur.n : '–'} | ${cur ? pct(cur.rate) : '–'} | ${cur ? pct(cur.expectedRate) : '–'} | ${cur ? num(cur.zVsExpected) : '–'} | ${cur ? verdictZ(cur.zVsExpected) : 'ingen backtest'} |`);
}
fs.writeFileSync(path.join(outDir, 'README.md'), [
  '# Lärdomar per liga – översikt', '',
  `Uppdaterad ${today} av \`node scripts/tips-felanalys.mjs\`. Aktuell säsong, tipsmotorns 1X2-träff mot vad tipsens egna procent lovade. z ≤ −2 = sämre än väntat (granska ligan), annars slump.`, '',
  '| Liga | Namn | Matcher | Träff | Väntat | z | Bedömning |', '|---|---|---|---|---|---|---|',
  ...index, '',
].join('\n'), 'utf8');
console.log(`Felanalys: ${leagues.length} ligafiler i docs/lardomar/anteckningar/`);
