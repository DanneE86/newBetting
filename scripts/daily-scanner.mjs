// Daily Scanner (Agent 7) + matchanalys-pipeline per kandidat:
//   Agent 1 Football + Agent 4 Research -> Agent 2 Quant -> Agent 3 Market -> Agent 5 Devil's Advocate -> Agent 6 Head
// Deterministisk version av .cursor/skills/match-analysis: bara lokala filer i data/, inga pahittade siffror.
// Utdata: data/daily-scan.json (GUI), docs/analys/<datum>-daily-scan.md, facit i data/daily-scan-history.json.
// Progress skrivs som rader "@@progress <json>" pa stdout (gui/server.mjs laser dem).
//   node scripts/daily-scanner.mjs [--days 7] [--top 7]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  tips: path.join(root, 'data', 'tips-latest.json'),
  store: path.join(root, 'data', 'betting-store.json'),
  scan: path.join(root, 'data', 'daily-scan.json'),
  history: path.join(root, 'data', 'daily-scan-history.json'),
  docs: path.join(root, 'docs', 'analys'),
};

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : def;
};
const DAYS = arg('days', 7);
const TOP = arg('top', 7);
// Agent 3: edge-troskel 3 pp (samma som minEv i pro-lagret)
const EDGE_MIN = 0.03;
// Agent 5: modell och skarp marknad oense mer an sa har -> marknaden vinner (backtest: Pinnacle RPS battre an DC i alla ligor)
const DISAGREE_PP = 0.08;

const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')) : null);
const r2 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 100) / 100);
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const fair = (p) => (p > 0 ? r2(1 / p) : null);
const pct = (p) => (p == null ? '—' : `${Math.round(p * 100)} %`);

function progress(step, total, text, extra = {}) {
  process.stdout.write(`@@progress ${JSON.stringify({ step, total, text, ...extra })}\n`);
}
const log = (s) => process.stdout.write(`${s}\n`);

// ---------- Poisson fran lambda (Agent 2) ----------
function poisson(k, l) {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-l) * l ** k) / f;
}
function goalMarkets(lh, la) {
  const N = 10;
  let pOver15 = 0, pOver25 = 0, pOver35 = 0, pH = 0, pD = 0, pA = 0, ahH = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = poisson(i, lh) * poisson(j, la);
      const t = i + j;
      if (t >= 2) pOver15 += p;
      if (t >= 3) pOver25 += p;
      if (t >= 4) pOver35 += p;
      if (i > j) pH += p; else if (i === j) pD += p; else pA += p;
      if (i - j >= 2) ahH += p; // hemma -1.5
    }
  }
  const s = pH + pD + pA;
  return {
    home: pH / s, draw: pD / s, away: pA / s,
    over15: pOver15, over25: pOver25, over35: pOver35,
    btts: (1 - Math.exp(-lh)) * (1 - Math.exp(-la)),
    homeOver05: 1 - Math.exp(-lh), homeOver15: 1 - Math.exp(-lh) * (1 + lh),
    awayOver05: 1 - Math.exp(-la), awayOver15: 1 - Math.exp(-la) * (1 + la),
    ahHomeMinus15: ahH,
  };
}

// ---------- Agent 7: kandidater ----------
function isFinished(t, now) {
  if (/FULL_TIME|FINAL/i.test(String(t.matchStatus || ''))) return true;
  const kick = t.kickoffUtc ? new Date(t.kickoffUtc) : new Date(`${t.date}T23:59:00`);
  return kick.getTime() + 2 * 3600e3 < now.getTime();
}

function scanCandidates(tips, now) {
  const limit = new Date(now.getTime() + DAYS * 86400e3).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const pool = (tips.allCandidates || []).filter((t) => t.date >= today && t.date <= limit && !isFinished(t, now));
  const scored = pool.map((t) => {
    const verdicts = Object.values(t.pro?.verdicts || {});
    const bestEv = Math.max(0, ...verdicts.filter((v) => v.value).map((v) => v.ev));
    const hasOdds = Boolean(t.pro?.odds?.home || t.value?.odds?.home);
    const sharp = t.pro?.market?.fairSource === 'pinnacle' || t.pro?.market?.fairSource === 'betfair-exchange';
    const why = [];
    if (bestEv > 0) why.push(`värde EV ${pct(bestEv)}`);
    if (t.tipScore >= 0.58) why.push(`tipScore ${pct(t.tipScore)}`);
    if (Math.abs(t.eloDiff || 0) >= 150) why.push(`Elo-diff ${Math.round(t.eloDiff)}`);
    if (sharp) why.push('skarpt facit');
    if (!hasOdds) why.push('odds saknas');
    const rank = bestEv * 10 + (t.tipScore || 0) + (hasOdds ? 0.3 : 0) + (sharp ? 0.2 : 0)
      + Math.min(0.15, Math.abs(t.eloDiff || 0) / 1500)
      // tidigare matcher lite fore (daglig scan) - max 0.2
      - Math.min(0.2, (new Date(`${t.date}T12:00:00`) - now) / 86400e3 * 0.03);
    return { t, rank, why };
  });
  return scored.sort((a, b) => b.rank - a.rank).slice(0, TOP);
}

// ---------- Agent 1: Football Data ----------
function agentFootball(t, teams) {
  const H = teams.get(`${t.league}|${t.home}`);
  const A = teams.get(`${t.league}|${t.away}`);
  const side = (x, venue) => x && {
    elo: x.elo, eloSource: x.eloSource, form: x.form, played: x.played, ppg: x.ppg,
    venuePlayed: x[venue]?.played, venueWinRate: x[venue]?.winRate,
    gfPg: x[venue]?.gfPg, gaPg: x[venue]?.gaPg,
    bttsRate: x[venue]?.bttsRate, over25Rate: x[venue]?.over25Rate,
    xg: x.xg ? { source: x.xg.source, xGpg: x.xg.xGpg, xGApg: x.xg.xGApg } : null,
    attackIndex: x.playerAttack?.attackIndex ?? null,
  };
  const home = side(H, 'home');
  const away = side(A, 'away');
  const missing = [];
  if (!home || !away) missing.push('laget saknas i store (marknadstips/cup)');
  if (home && !home.xg) missing.push(`xG saknas ${t.home}`);
  if (away && !away.xg) missing.push(`xG saknas ${t.away}`);
  if (home?.eloSource === 'internal' || away?.eloSource === 'internal') missing.push('ClubElo saknas (intern Elo)');
  if ((home?.played ?? 0) < 6 || (away?.played ?? 0) < 6) missing.push('litet urval (< 6 matcher i säsongen)');
  return { home, away, missing };
}

// ---------- Agent 4: Research ----------
function starterNames(list) {
  return (list || []).map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
}

function agentResearch(t) {
  const pro = t.pro || {};
  const notes = [...(t.availabilityNotes || []), ...(t.lineupNotes || [])];
  const rest = pro.rest || {};
  for (const [lbl, r] of [['Hemma', rest.home], ['Borta', rest.away]]) {
    if (r?.congested) notes.push(`${lbl}: tät matchning (${r.matches7d} matcher senaste 7 d)`);
    if (r?.restDays != null && r.restDays <= 3) notes.push(`${lbl}: bara ${r.restDays} vilodagar`);
  }
  const homeStarters = starterNames(t.homeStarters);
  const awayStarters = starterNames(t.awayStarters);
  if (t.lineupSource) notes.push(`Källa: ${t.lineupSource}`);
  return {
    lineupStatus: t.lineupStatus || 'none',
    lineupSource: t.lineupSource || null,
    homeFormation: t.homeFormation || null,
    awayFormation: t.awayFormation || null,
    homeStarters,
    awayStarters,
    keyOuts: t.keyOuts || { home: 0, away: 0 },
    notes,
    assumptions: t.lineupStatus === 'confirmed' ? [] : ['Elvor ej bekräftade – antar ordinarie startelva'],
  };
}

// ---------- Agent 2: QUANT ----------
function agentQuant(t, football) {
  const dc = t.pro?.dc;
  const bl = t.pro?.blended;
  if (!dc?.lambdaHome && !bl) {
    // Marknadstips utan modell: ingen egen kvantmodell
    return { available: false, confidence: 'LOW', reason: 'ingen modell för ligan/matchen (endast marknadspris)' };
  }
  const lh = dc?.lambdaHome;
  const la = dc?.lambdaAway;
  const g = lh && la ? goalMarkets(lh, la) : null;
  // 1X2 / O2.5 / BTTS: blandningen DC + formmodell (samma som pro-lagret); ovriga fran DC-lambdorna
  const p = {
    home: bl?.home ?? g?.home, draw: bl?.draw ?? g?.draw, away: bl?.away ?? g?.away,
    over15: g?.over15, over25: bl?.over25 ?? g?.over25, over35: g?.over35,
    btts: bl?.btts ?? g?.btts,
  };
  const markets = Object.fromEntries(Object.entries(p).filter(([, v]) => v != null).map(([k, v]) => [k, { p: r3(v), fair: fair(v) }]));
  markets.under25 = { p: r3(1 - p.over25), fair: fair(1 - p.over25) };
  markets.bttsNo = { p: r3(1 - p.btts), fair: fair(1 - p.btts) };
  const uncert = [...football.missing];
  if (t.lineupStatus !== 'confirmed') uncert.push('elvor okända');
  if (!dc?.knownTeams) uncert.push('Dixon-Coles känner inte båda lagen');
  // Confidence: data + urval
  let score = 3;
  if (football.missing.some((m) => m.startsWith('litet urval'))) score -= 1;
  if (football.missing.some((m) => m.startsWith('xG saknas'))) score -= 1;
  if (!dc?.knownTeams) score -= 1;
  if (football.missing.some((m) => m.startsWith('laget saknas'))) score -= 2;
  const confidence = score >= 3 ? 'HIGH' : score === 2 ? 'MEDIUM' : 'LOW';
  return {
    available: true,
    projectedGoals: lh && la ? { home: r2(lh), away: r2(la), total: r2(lh + la) } : null,
    markets,
    teamTotals: g ? {
      homeOver05: r3(g.homeOver05), homeOver15: r3(g.homeOver15),
      awayOver05: r3(g.awayOver05), awayOver15: r3(g.awayOver15),
    } : null,
    asianHandicap: g ? { homeMinus15: r3(g.ahHomeMinus15) } : null,
    assumptions: ['Dixon-Coles (lagstyrka + hemmafördel) blandat 50/50 med Elo/form/xG-modellen', 'Poisson för målmarknader'],
    uncertainties: uncert,
    confidence,
  };
}

// ---------- Agent 3: Market ----------
const MARKET_ROWS = [
  ['1X2', '1', 'home'], ['1X2', 'X', 'draw'], ['1X2', '2', 'away'],
  ['OU25', 'Över 2.5', 'over25'], ['OU25', 'Under 2.5', 'under25'],
];
function agentMarket(t, quant) {
  const pro = t.pro || {};
  const mf = pro.market?.fair || {};
  const rows = [];
  for (const [mkt, label, k] of MARKET_ROWS) {
    const v = pro.verdicts?.[k];
    const book = v?.odds ?? pro.odds?.[k] ?? null;
    if (!(book > 1)) continue;
    const modelP = quant.markets?.[k]?.p ?? null;
    const marketP = mf[k] ?? null;
    rows.push({
      market: mkt, pick: label, key: k, modelP, fairModel: modelP ? fair(modelP) : null,
      marketP: r3(marketP), book, bookmaker: v?.bookmaker ?? pro.oddsBooks?.[k] ?? null,
      implied: r3(1 / book),
      edgeModel: modelP != null ? r3(modelP - 1 / book) : null,
      ev: v?.ev ?? (marketP ? r3(marketP * book - 1) : null),
      minOdds: v?.minOdds ?? null,
      value: v?.value ?? null,
      reason: v?.reason ?? null,
    });
  }
  if (!rows.length) return { available: false, note: 'NO MARKET DATA', rows: [], candidates: [] };
  const candidates = rows.filter((r) => r.value === true && r.ev >= EDGE_MIN);
  return {
    available: true,
    fairSource: pro.market?.fairSource ?? null,
    booksCount: pro.market?.booksCount ?? null,
    rows,
    candidates,
  };
}

// ---------- Agent 5: Devil's Advocate ----------
function agentDevil(t, football, research, quant, market) {
  const attacks = [];
  const fragile = [];
  const kill = [];
  let severity = 0; // 0 = still plausible, 1-2 weakened, >=3 dead
  if (!market.available) {
    attacks.push('Inga odds – ingen edge kan mätas.');
    severity += 3;
  }
  if (!market.candidates?.length && market.available) {
    attacks.push(/OddsPortal|ett bolag/.test(market.fairSource || '')
      ? `Bara ${market.fairSource} – samma odds är både facit och pris, så EV visar bara bolagens marginal. Leta odds över "från"-gränsen hos ditt bolag.`
      : 'Ingen marknad når värdegränsen (EV ≥ 3 %) – oddset är effektivt prissatt.');
    severity += 3;
  }
  const fs = market.fairSource || '';
  if (market.available && fs && !/pinnacle|betfair/.test(fs)) {
    attacks.push(`Facit är ${fs} (inte Pinnacle) – svagare referens.`);
    severity += 1;
  }
  for (const c of market.candidates || []) {
    if (c.modelP != null && c.marketP != null && c.modelP < c.marketP - DISAGREE_PP) {
      attacks.push(`Egna modellen ger ${c.pick} bara ${pct(c.modelP)} mot marknadens ${pct(c.marketP)} – värdet kommer enbart från priset.`);
      severity += 1;
    }
    if (c.ev > 0.12) {
      attacks.push(`EV ${pct(c.ev)} är ovanligt högt för ${c.pick} – kan vara inaktuella odds; kontrollera hos bolaget.`);
      fragile.push('odds kan ha rört sig sedan hämtningen');
      severity += 1;
    }
    else if (c.modelP != null && c.marketP != null && c.modelP < c.marketP) {
      fragile.push(`Egna modellen (${pct(c.modelP)}) är lägre än marknaden (${pct(c.marketP)}) på ${c.pick}`);
    }
    if (c.book >= 3.5) fragile.push(`${c.pick} @ ${c.book}: hög varians, långt oddsintervall`);
    kill.push(`${c.pick}: oddset faller under ${c.minOdds}`);
  }
  // Tidiga linjer: langt fore match ar Pinnacle-limiten lag och priserna ror sig mycket
  const daysAway = (new Date(t.kickoffUtc || `${t.date}T15:00:00Z`) - Date.now()) / 86400e3;
  if (market.candidates?.length && daysAway > 5) {
    attacks.push(`Matchen är ${Math.round(daysAway)} dagar bort – tidiga linjer rör sig mycket; värdet måste finnas kvar närmare avspark.`);
    kill.push('värdet är borta när du scannar igen 1–2 dagar före');
    severity += 1;
  }
  // Modell mot marknad i 1X2 (tips-riktningen)
  const q = quant.markets || {};
  const mf = t.pro?.market?.fair || {};
  for (const k of ['home', 'draw', 'away', 'over25']) {
    if (q[k]?.p != null && mf[k] != null && Math.abs(q[k].p - mf[k]) > DISAGREE_PP * 1.5) {
      fragile.push(`Modell ${pct(q[k].p)} vs marknad ${pct(mf[k])} på ${k} – när de är oense brukar marknaden ha rätt`);
    }
  }
  if (football.missing.some((m) => m.startsWith('litet urval'))) {
    attacks.push('Litet urval i säsongen – rater och form är brusiga.');
    severity += 1;
  }
  if (research.lineupStatus !== 'confirmed') {
    fragile.push('Elvor inte släppta – rotation/skador kan ändra caset');
    kill.push('bekräftad elva utan nyckelspelare');
  }
  if ((research.keyOuts?.home || 0) + (research.keyOuts?.away || 0) > 0) {
    fragile.push(`Nyckelfrånvaro: hemma ${research.keyOuts.home}, borta ${research.keyOuts.away}`);
  }
  for (const n of research.notes.filter((x) => /tät matchning|vilodagar/.test(x))) fragile.push(n);
  if (quant.confidence === 'LOW') {
    attacks.push('Modellens underlag är tunt (LOW confidence).');
    severity += 1;
  }
  const residual = severity >= 3 ? 'Dead' : severity >= 1 ? 'Weakened' : 'Still plausible';
  return { attacks, fragile, kill, residual };
}

// ---------- Agent 6: Head ----------
function agentHead(t, quant, market, devil, research, now) {
  const best = (market.candidates || []).slice().sort((a, b) => b.ev - a.ev)[0] || null;
  let verdict = 'NO BET';
  const why = [];
  if (!best) {
    why.push(market.available ? 'Ingen marknad med värde vid dagens odds.' : 'Inga odds för matchen.');
  } else if (devil.residual === 'Dead') {
    why.push("Devil's Advocate dödade caset.");
  } else if (quant.confidence === 'LOW') {
    // Agent 6-regel: confidence LOW -> NO BET
    why.push(`${best.pick} @ ${best.book} har EV ${pct(best.ev)}, men modellens underlag är för tunt (LOW).`);
  } else {
    // Weakened -> WAIT: kolla igen narmare avspark / nar elvorna ar ute. Still plausible -> BET.
    verdict = devil.residual === 'Still plausible' ? 'BET' : 'WAIT';
    why.push(`${best.pick} @ ${best.book} (${best.bookmaker ?? 'bästa pris'}) har EV ${pct(best.ev)} mot ${market.fairSource}.`);
    if (verdict === 'WAIT') {
      why.push(research.lineupStatus !== 'confirmed'
        ? 'Caset är försvagat – kör scannern igen närmare avspark (elvor, aktuella odds).'
        : 'Caset är försvagat – kontrollera oddset hos bolaget innan spel.');
    }
  }
  const confidence = verdict === 'NO BET' ? quant.confidence
    : verdict === 'BET' && quant.confidence === 'HIGH' && research.lineupStatus === 'confirmed' ? 'HIGH'
      : verdict === 'BET' ? 'MEDIUM' : 'LOW';
  return {
    verdict,
    confidence,
    best: best && {
      market: best.market, pick: best.pick, book: best.book, bookmaker: best.bookmaker,
      fair: best.marketP ? fair(best.marketP) : null, minOdds: best.minOdds, ev: best.ev, modelP: best.modelP,
    },
    why,
    risks: [...devil.attacks, ...devil.fragile].slice(0, 5),
    changeIf: devil.kill.slice(0, 4),
  };
}

// ---------- En match genom hela pipelinen (anvands av scannern och GUI:ts Analys-knapp) ----------
export function analyzeMatch(t, teams, now = new Date(), why = []) {
  const football = agentFootball(t, teams);
  const research = agentResearch(t);
  const quant = agentQuant(t, football);
  const market = agentMarket(t, quant);
  const devil = agentDevil(t, football, research, quant, market);
  const head = agentHead(t, quant, market, devil, research, now);
  return {
    match: t.match, home: t.home, away: t.away, league: t.league, date: t.date, kickoffUtc: t.kickoffUtc ?? null,
    marketOnly: Boolean(t.marketOnly), why, football, research, quant, market, devil, head,
  };
}

export function loadTeams(store) {
  return new Map((store?.teams || []).map((x) => [`${x.league}|${x.name}`, x]));
}

// ---------- Facit for tidigare scanner-BET ----------
function settleHistory(history, store) {
  const idx = new Map();
  for (const m of store?.matches || []) idx.set(`${m.league}|${m.date}|${m.home}|${m.away}`, m);
  for (const h of history.bets) {
    if (h.result) continue;
    const m = idx.get(`${h.league}|${h.date}|${h.home}|${h.away}`);
    if (!m) continue;
    const res = m.result === 'H' ? 'home' : m.result === 'D' ? 'draw' : 'away';
    const won = h.key === 'over25' ? m.totalGoals > 2.5 : h.key === 'under25' ? m.totalGoals < 2.5 : h.key === res;
    h.result = won ? 'won' : 'lost';
    h.score = `${m.hg}-${m.ag}`;
  }
  const settled = history.bets.filter((h) => h.result);
  const won = settled.filter((h) => h.result === 'won');
  const profit = settled.reduce((s, h) => s + (h.result === 'won' ? h.odds - 1 : -1), 0);
  return {
    bets: history.bets.length,
    settled: settled.length,
    open: history.bets.length - settled.length,
    won: won.length,
    hitRate: settled.length ? r3(won.length / settled.length) : null,
    roi: settled.length ? r3(profit / settled.length) : null,
  };
}

// ---------- Markdown ----------
function toMarkdown(scan) {
  const L = [];
  L.push(`# Daily Scanner — ${scan.date}`, '');
  L.push(`Körd ${scan.finishedAt} · data från ${scan.dataUpdatedAt} · ${scan.poolSize} matcher inom ${DAYS} dagar`, '');
  L.push('## Kandidater (rankade)', '', '| # | Match | Liga | Varför kandidat | Pipeline |', '|---|---|---|---|---|');
  scan.matches.forEach((m, i) => L.push(`| ${i + 1} | ${m.match} | ${m.league} | ${m.why.join(', ') || '—'} | 1+4 → 2 → 3 → 5 → 6 |`));
  L.push('', '## Sammanfattning Head Agent', '', '| Match | Dom | Bästa marknad | Edge | Confidence |', '|---|---|---|---|---|');
  for (const m of scan.matches) {
    const b = m.head.best;
    L.push(`| ${m.match} | ${m.head.verdict} | ${b ? `${b.pick} @ ${b.book}` : '—'} | ${b ? pct(b.ev) : '—'} | ${m.head.confidence} |`);
  }
  for (const m of scan.matches) {
    const q = m.quant;
    L.push('', `---`, '', `# Analys: ${m.match} (${m.league}, ${m.date})`, '');
    L.push('## Dom', `- Rekommendation: **${m.head.verdict}**`, `- Confidence: ${m.head.confidence}`, '');
    if (q.available) {
      const k = q.markets;
      L.push('## Modell (Agent 2)');
      if (q.projectedGoals) L.push(`- Proj. mål: H ${q.projectedGoals.home} – A ${q.projectedGoals.away} (tot ${q.projectedGoals.total})`);
      L.push(`- 1X2: ${pct(k.home?.p)} / ${pct(k.draw?.p)} / ${pct(k.away?.p)} (fair ${k.home?.fair} / ${k.draw?.fair} / ${k.away?.fair})`);
      L.push(`- Ö2.5 ${pct(k.over25?.p)} (fair ${k.over25?.fair}) · BTTS ${pct(k.btts?.p)} (fair ${k.btts?.fair})`, '');
    } else {
      L.push('## Modell (Agent 2)', `- ${q.reason}`, '');
    }
    L.push('## Marknad (Agent 3)');
    if (!m.market.available) L.push('- NO MARKET DATA');
    else {
      L.push(`Facit: ${m.market.fairSource} · ${m.market.booksCount} bolag`, '', '| Marknad | Modell p | Marknad p | Bästa odds | EV | Värde |', '|---|---|---|---|---|---|');
      for (const r of m.market.rows) L.push(`| ${r.pick} | ${pct(r.modelP)} | ${pct(r.marketP)} | ${r.book} (${r.bookmaker ?? '—'}) | ${pct(r.ev)} | ${r.value === true ? 'Värde' : r.value === false ? 'Ej värde' : '—'} |`);
    }
    L.push('', "## Devil's Advocate (Agent 5)", ...m.devil.attacks.map((a) => `- ${a}`), ...m.devil.fragile.map((a) => `- (skört) ${a}`), `- Residual: **${m.devil.residual}**`);
    L.push('', '## Varför', ...m.head.why.map((w) => `- ${w}`));
    if (m.head.changeIf.length) L.push('', '## Vad som skulle ändra beslutet', ...m.head.changeIf.map((w) => `- ${w}`));
    if (m.football.missing.length) L.push('', '## Datakvalitet (Agent 1)', ...m.football.missing.map((w) => `- ${w}`));
  }
  return L.join('\n');
}

// ---------- Main ----------
function main() {
  const now = new Date();
  const tips = readJson(P.tips);
  if (!tips) throw new Error('data/tips-latest.json saknas — kör Hämta data först');
  const store = readJson(P.store);
  const teams = loadTeams(store);

  progress(0, 1, 'Agent 7 – Daily Scanner väljer kandidater');
  const picked = scanCandidates(tips, now);
  const poolSize = (tips.allCandidates || []).length;
  log(`Agent 7: ${picked.length} kandidater valda (${DAYS} dagar, topp ${TOP})`);
  const steps = picked.length * 5 + 2;
  let step = 1;
  const matches = [];
  for (const { t, why } of picked) {
    const label = `${t.match} (${t.league})`;
    progress(step++, steps, `Agent 1 + 4 – Football & Research: ${label}`, { match: t.match });
    progress(step++, steps, `Agent 2 – Quant: ${label}`, { match: t.match });
    progress(step++, steps, `Agent 3 – Market: ${label}`, { match: t.match });
    progress(step++, steps, `Agent 5 – Devil's Advocate: ${label}`, { match: t.match });
    progress(step++, steps, `Agent 6 – Head: ${label}`, { match: t.match });
    const m = analyzeMatch(t, teams, now, why);
    const head = m.head;
    log(`  ${head.verdict.padEnd(6)} ${label}${head.best ? ` → ${head.best.pick} @ ${head.best.book} EV ${pct(head.best.ev)}` : ''}`);
    matches.push(m);
  }

  progress(step++, steps, 'Sparar analys och uppdaterar facit');
  const history = readJson(P.history) || { bets: [] };
  for (const m of matches) {
    if (m.head.verdict !== 'BET' || !m.head.best) continue;
    const key = m.market.candidates.find((c) => c.pick === m.head.best.pick)?.key;
    const id = `${m.league}|${m.date}|${m.home}|${m.away}|${key}`;
    if (history.bets.some((b) => b.id === id)) continue;
    history.bets.push({
      id, league: m.league, date: m.date, home: m.home, away: m.away, key,
      pick: m.head.best.pick, odds: m.head.best.book, ev: m.head.best.ev, scannedAt: now.toISOString(),
    });
  }
  const record = settleHistory(history, store);
  fs.writeFileSync(P.history, JSON.stringify(history, null, 2));

  const scan = {
    date: now.toISOString().slice(0, 10),
    startedAt: now.toISOString(),
    finishedAt: new Date().toISOString(),
    dataUpdatedAt: tips.updatedAt ?? null,
    days: DAYS,
    poolSize,
    summary: {
      bet: matches.filter((m) => m.head.verdict === 'BET').length,
      wait: matches.filter((m) => m.head.verdict === 'WAIT').length,
      noBet: matches.filter((m) => m.head.verdict === 'NO BET').length,
    },
    record,
    matches,
  };
  fs.writeFileSync(P.scan, JSON.stringify(scan, null, 2));
  fs.mkdirSync(P.docs, { recursive: true });
  const mdPath = path.join(P.docs, `${scan.date}-daily-scan.md`);
  fs.writeFileSync(mdPath, toMarkdown(scan));
  progress(steps, steps, `Klart: ${scan.summary.bet} BET · ${scan.summary.wait} WAIT · ${scan.summary.noBet} NO BET`);
  log(`Sparat: data/daily-scan.json, ${path.relative(root, mdPath)}`);
}

/** npm run scan -- --match "Arsenal vs Leeds": analys av en match, sparas i docs/analys/<datum>-<hem>-vs-<bort>.md */
function mainSingle(query) {
  const tips = readJson(P.tips);
  const q = query.toLowerCase();
  const t = (tips?.allCandidates || []).find((x) => x.match.toLowerCase() === q)
    ?? (tips?.allCandidates || []).find((x) => x.match.toLowerCase().includes(q));
  if (!t) throw new Error(`Hittar ingen kommande match "${query}"`);
  const m = analyzeMatch(t, loadTeams(readJson(P.store)));
  const slug = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  fs.mkdirSync(P.docs, { recursive: true });
  const mdPath = path.join(P.docs, `${t.date}-${slug(t.home)}-vs-${slug(t.away)}.md`);
  // Bara matchdelen (utan scannerns kandidattabeller)
  const full = toMarkdown({ date: t.date, finishedAt: new Date().toISOString(), dataUpdatedAt: tips.updatedAt, poolSize: 1, matches: [m] });
  const md = full.slice(full.indexOf('# Analys:'));
  fs.writeFileSync(mdPath, md);
  log(md);
  log(`
Sparat: ${path.relative(root, mdPath)}`);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  try {
    const mi = process.argv.indexOf('--match');
    if (mi > 0) mainSingle(process.argv[mi + 1] || '');
    else main();
  } catch (e) {
    log(`Fel: ${e.message}`);
    process.exit(1);
  }
}
