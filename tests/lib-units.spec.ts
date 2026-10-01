import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

// Enhetstester for scripts/lib/* som saknade tester: duellanalys, FotMob-namn/ligor, Stryktipsets kalibrering,
// missprofil och fargband, extra odds, Transfermarkt-namn, positioner och kupongarkivet. Inget nat.
const ROOT = path.resolve(__dirname, '..');
const lib = (f: string) => import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', f)).href);
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

// ---------- matchup.mjs ----------

test.describe('matchup: hjalpfunktioner', () => {
  test('ordinal: 1:a, 2:a, 3:e, 11:e, 12:e, 21:a, 22:a, 111:e', async () => {
    const { ordinal } = await lib('matchup.mjs');
    const want: Record<number, string> = { 1: '1:a', 2: '2:a', 3: '3:e', 11: '11:e', 12: '12:e', 21: '21:a', 22: '22:a', 100: '100:e', 101: '101:a', 111: '111:e', 112: '112:e' };
    for (const [n, s] of Object.entries(want)) expect(ordinal(Number(n))).toBe(s);
    expect(ordinal(61.6)).toBe('62:a');
  });

  test('normName: diakritiska tecken, ø/æ/ß/ł och skiljetecken', async () => {
    const { normName } = await lib('matchup.mjs');
    expect(normName('Martin Ødegaard')).toBe('martin odegaard');
    expect(normName('Thomas Müller')).toBe('thomas muller');
    expect(normName('Łukasz Fabiański')).toBe('lukasz fabianski');
    expect(normName('Jean-Philippe  Mateta')).toBe('jean philippe mateta');
    expect(normName('Leroy Saß')).toBe('leroy sass');
    expect(normName(null)).toBe('');
  });

  test('lineupPosition: ESPN-koder till grupp och sida', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    expect(m.lineupPosition('G')).toEqual({ group: 'malvakt', side: null, exact: true });
    expect(m.lineupPosition('LB')).toMatchObject({ group: 'ytterback', side: 'L', exact: true });
    expect(m.lineupPosition('RWB')).toMatchObject({ group: 'ytterback', side: 'R' });
    expect(m.lineupPosition('CD-L')).toMatchObject({ group: 'mittback', side: null });
    expect(m.lineupPosition('CB')).toMatchObject({ group: 'mittback' });
    expect(m.lineupPosition('DM')).toMatchObject({ group: 'defensiv_mittfaltare' });
    expect(m.lineupPosition('CDM')).toMatchObject({ group: 'defensiv_mittfaltare' }); // inte mittback
    expect(m.lineupPosition('CM-R')).toMatchObject({ group: 'central_mittfaltare', side: null });
    expect(m.lineupPosition('AM')).toMatchObject({ group: 'offensiv_mittfaltare', side: null });
    expect(m.lineupPosition('AM-L')).toMatchObject({ group: 'ytter', side: 'L' });
    expect(m.lineupPosition('RM')).toMatchObject({ group: 'ytter', side: 'R' });
    expect(m.lineupPosition('CF-L')).toMatchObject({ group: 'anfallare' });
    expect(m.lineupPosition('D')).toMatchObject({ group: 'mittback', exact: false });
    expect(m.lineupPosition('M')).toMatchObject({ group: 'central_mittfaltare', exact: false });
    expect(m.lineupPosition('F')).toMatchObject({ group: 'anfallare', exact: false });
    // FotMob ger siffror (usualPlayingPositionId) och tomt -> ingen position
    for (const x of ['12', '', null, undefined, 'SUB']) expect(m.lineupPosition(x)).toBeNull();
  });

  test('sideOf: huvudposition forst, annars mest spelade sidopositionen', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    expect(m.sideOf({ position: { fotmob: 'RB' } })).toBe('R');
    expect(m.sideOf({ position: { fotmob: 'lw' } })).toBe('L');
    expect(m.sideOf({ position: { fotmob: 'CB', fotmobOther: ['LB:3', 'RB:7', 'CM:20'] } })).toBe('R');
    expect(m.sideOf({ position: { fotmob: 'ST', fotmobOther: ['CM:9'] } })).toBeNull();
    expect(m.sideOf({})).toBeNull();
  });

  test('statSource och pct: forra sasongen vid lite speltid, percentil krymps mot 50', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const cur = { minutes_played: [500], goals: [3, 0, 90] };
    const prev = { minutes_played: [2500], goals: [10, 0, 80] };
    expect(m.statSource({ season: { stats: cur }, prevSeason: { stats: prev } })).toMatchObject({ minutes: 500, label: null });
    const few = m.statSource({ season: { stats: { minutes_played: [120] } }, prevSeason: { stats: prev, tournament: 'Serie A', season: '2025/2026' } });
    expect(few).toMatchObject({ minutes: 2500, label: 'Serie A 2025/2026' });
    // Malvakt utan minutes_played: startade matcher x 90
    expect(m.statSource({ season: { stats: { player_started_matches: [6] } } }).minutes).toBe(540);
    // Inget alls -> tom statistik, ingen krasch
    expect(m.statSource({})).toMatchObject({ stats: {}, minutes: 0 });

    expect(m.pct({ stats: cur, minutes: 900 }, 'goals')).toBe(90);
    expect(m.pct({ stats: cur, minutes: 1800 }, 'goals')).toBe(90);
    expect(m.pct({ stats: cur, minutes: 450 }, 'goals')).toBe(70);
    expect(m.pct({ stats: cur, minutes: 0 }, 'goals')).toBe(50);
    expect(m.pct({ stats: cur, minutes: 900 }, 'saknas')).toBeNull();
    expect(m.score({ stats: {}, minutes: 900 }, [['goals', 1]])).toBeNull();
    expect(m.score({ stats: { a: [0, 0, 80], b: [0, 0, 20] }, minutes: 900 }, [['a', 3], ['b', 1]])).toBe(65);
  });

  test('fmtVal: procent, forhindrade mal och decimaler med komma', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    expect(m.fmtVal('duel_won_percent', 54.36)).toBe('54,4 %');
    expect(m.fmtVal('goals_prevented', 2.456)).toBe('+2,46');
    expect(m.fmtVal('goals_prevented', -1.2)).toBe('-1,2');
    expect(m.fmtVal('expected_goals', 3.141)).toBe('3,14');
    expect(m.fmtVal('goals', 7)).toBe('7');
    expect(m.fmtVal('goals', null)).toBe('');
  });

  test('edgeText: granserna 7/15/25 och vilket lag som far fordelen', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    expect(m.edgeText(null, 'A', 'B')).toMatchObject({ who: null, level: 'okänt' });
    expect(m.edgeText(6.9, 'A', 'B')).toMatchObject({ who: null, level: 'jämnt' });
    expect(m.edgeText(7, 'A', 'B')).toMatchObject({ who: 'A', level: 'lite', text: 'A, lite' });
    expect(m.edgeText(-14.9, 'A', 'B')).toMatchObject({ who: 'B', level: 'lite' });
    expect(m.edgeText(15, 'A', 'B')).toMatchObject({ who: 'A', level: 'tydlig', text: 'A' });
    expect(m.edgeText(-25, 'A', 'B')).toMatchObject({ who: 'B', level: 'klart', text: 'B, klart' });
  });

  test('findPlayer: exakt namn, unikt efternamn, initial och inget fel lag', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const ps = [{ name: 'Bukayo Saka' }, { name: 'Gabriel Jesus' }, { name: 'Gabriel Magalhães' }, { name: 'Gabriel Martinelli' }, { name: 'William Saliba' }, { name: 'Ben White' }, { name: 'Jack White' }];
    expect(m.findPlayer(ps, 'Bukayo Saka').name).toBe('Bukayo Saka');
    expect(m.findPlayer(ps, 'B. Saka').name).toBe('Bukayo Saka');
    expect(m.findPlayer(ps, 'Gabriel Magalhaes').name).toBe('Gabriel Magalhães');
    expect(m.findPlayer(ps, 'J. White').name).toBe('Jack White');
    expect(m.findPlayer(ps, 'Erling Haaland')).toBeNull();
    expect(m.findPlayer(ps, '')).toBeNull();
  });

  test('officialXI: position fran elvan vinner, okanda spelare markeras', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const team = { players: [{ name: 'Ben White', position: { group: 'mittback', fotmob: 'CB' } }] };
    const { xi, unknown } = m.officialXI(team, [{ name: 'Ben White', position: 'RB' }, { name: 'Okänd Spelare', position: 'LB' }]);
    expect(xi[0]).toMatchObject({ name: 'Ben White', group: 'ytterback', side: 'R', lineupPos: 'RB' });
    expect(xi[1]).toMatchObject({ name: 'Okänd Spelare', group: 'ytterback', side: 'L', notInData: true, minutes: 0 });
    expect(unknown).toEqual(['Okänd Spelare']);
  });
});

// Syntetiskt lag: 4-4-2 i de fem senaste matcherna
const DATES = ['2026-09-01', '2026-09-06', '2026-09-13', '2026-09-20', '2026-09-27'];
function pl(name: string, group: string | null, fotmob: string, dates: string[], opts: any = {}) {
  return {
    id: name, name, fotmobTeam: 'Testlag',
    position: group ? { group, fotmob } : undefined,
    info: opts.info || {},
    league: { minutes_played: opts.seasonMin ?? dates.length * 90 },
    season: { stats: { minutes_played: [dates.length * 90] } },
    // [datum, lag, -, -, minuter, -, -, -, -, roda kort]
    matches: dates.map((d) => [d, 'Testlag', 0, 0, opts.min ?? 90, 0, 0, 0, 0, opts.red?.includes(d) ? 1 : 0]),
  };
}
function team442() {
  return {
    players: [
      pl('Malvakt', 'malvakt', 'GK', DATES),
      pl('Reservkeeper', 'malvakt', 'GK', [], { seasonMin: 0 }),
      pl('MB1', 'mittback', 'CB', DATES), pl('MB2', 'mittback', 'CB', DATES),
      pl('MB-reserv', 'mittback', 'CB', DATES, { min: 10, seasonMin: 50 }),
      pl('VB', 'ytterback', 'LB', DATES), pl('HB', 'ytterback', 'RB', DATES),
      pl('CM1', 'central_mittfaltare', 'CM', DATES, { red: [DATES[4]] }), pl('CM2', 'central_mittfaltare', 'CM', DATES),
      pl('VY', 'ytter', 'LW', DATES), pl('HY', 'ytter', 'RW', DATES),
      pl('ST1', 'anfallare', 'ST', DATES),
      pl('ST2', 'anfallare', 'ST', DATES.slice(2)),
      pl('Skadad', 'anfallare', 'ST', DATES.slice(0, 2), { info: { injury: { name: 'Knäskada', expectedReturn: { expectedReturnFallback: 'Nov 2026' } } } }),
      pl('Klubblös', 'mittback', 'CB', DATES.slice(0, 1), { info: { status: 'unattached' } }),
      pl('Utan position', null, '', DATES),
    ],
  };
}

test.describe('matchup: forvantad elva och uppstallning', () => {
  test('predictedXI: rätt elva, skadade och klubblösa ute, rött kort noteras, bänk', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const r = m.predictedXI(team442(), '2026-10-04');
    expect(r.xi).toHaveLength(11);
    const names = r.xi.map((p: any) => p.name);
    expect(names[0]).toBe('Malvakt');
    expect(names.sort()).toEqual(['CM1', 'CM2', 'HB', 'HY', 'MB1', 'MB2', 'Malvakt', 'ST1', 'ST2', 'VB', 'VY'].sort());
    expect(r.out.map((o: any) => o.name).sort()).toEqual(['Klubblös', 'Skadad']);
    expect(r.out.find((o: any) => o.name === 'Skadad').why).toBe('Knäskada (Nov 2026)');
    expect(r.notes).toEqual([`CM1 fick rött kort i senaste matchen (${DATES[4]}) – kan vara avstängd`]);
    expect(r.bench).toContain('MB-reserv');
    expect(r.bench).not.toContain('Reservkeeper');
    expect(r.recentDates).toEqual([...DATES].reverse());
  });

  test('predictedXI: utan minuter blir det ingen elva (noMinutes)', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    expect(m.predictedXI({ players: [] }, '2026-10-04')).toMatchObject({ xi: [], noMinutes: true });
    expect(m.predictedXI({}, '2026-10-04')).toMatchObject({ xi: [], noMinutes: true });
  });

  const x = (name: string, group: string, side: string | null = null) => ({ name, group, side });

  test('shape: 4-4-2 -> roller pa ratt kant och formation', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const s = m.shape([x('GK', 'malvakt'), x('CB1', 'mittback'), x('CB2', 'mittback'), x('LB', 'ytterback', 'L'), x('RB', 'ytterback', 'R'),
      x('CM1', 'central_mittfaltare'), x('CM2', 'central_mittfaltare'), x('LW', 'ytter', 'L'), x('RW', 'ytter', 'R'), x('ST1', 'anfallare'), x('ST2', 'anfallare')]);
    expect(s.formation).toBe('4-2-2-2');
    expect([s.gk.name, s.lb.name, s.rb.name, s.lw.name, s.rw.name]).toEqual(['GK', 'LB', 'RB', 'LW', 'RW']);
    expect(s.lbIsFullback && s.rbIsFullback).toBe(true);
    expect(s.attack.map((p: any) => p.name)).toEqual(['ST1', 'ST2']);
    expect(s.midfield.map((p: any) => p.name)).toEqual(['CM1', 'CM2']);
  });

  test('shape: 4-2-3-1 utan yttrar -> offensiva mittfaltare tar kanterna', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const s = m.shape([x('GK', 'malvakt'), x('CB1', 'mittback'), x('CB2', 'mittback'), x('LB', 'ytterback', 'L'), x('RB', 'ytterback', 'R'),
      x('DM', 'defensiv_mittfaltare'), x('CM', 'central_mittfaltare'), x('AMR', 'offensiv_mittfaltare', 'R'), x('AML', 'offensiv_mittfaltare', 'L'),
      x('AM', 'offensiv_mittfaltare'), x('ST', 'anfallare')]);
    expect(s.formation).toBe('4-2-3-1');
    expect(s.rw.name).toBe('AMR');
    expect(s.lw.name).toBe('AML');
    expect(s.midfield.map((p: any) => p.name)).toEqual(['DM', 'CM', 'AM']);
  });

  test('shape: trebackslinje -> ytterbackarna blir wingbacks och tar kanterna', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const s = m.shape([x('GK', 'malvakt'), x('CB1', 'mittback'), x('CB2', 'mittback'), x('CB3', 'mittback'), x('LWB', 'ytterback', 'L'),
      x('RWB', 'ytterback', 'R'), x('CM1', 'central_mittfaltare'), x('CM2', 'central_mittfaltare'), x('AM', 'offensiv_mittfaltare'),
      x('ST1', 'anfallare'), x('ST2', 'anfallare')]);
    expect(s.formation).toBe('3-4-1-2');
    expect(s.rw).toMatchObject({ name: 'RWB', wingback: true });
    expect(s.lw).toMatchObject({ name: 'LWB', wingback: true });
  });

  test('shape: utan anfallare -> offensiv mittfaltare leder anfallet', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const s = m.shape([x('GK', 'malvakt'), x('CB1', 'mittback'), x('CB2', 'mittback'), x('LB', 'ytterback', 'L'), x('RB', 'ytterback', 'R'),
      x('CM1', 'central_mittfaltare'), x('CM2', 'central_mittfaltare'), x('CM3', 'central_mittfaltare'), x('LW', 'ytter', 'L'), x('RW', 'ytter', 'R'),
      x('AM', 'offensiv_mittfaltare')]);
    expect(s.attack.map((p: any) => p.name)).toEqual(['AM']);
    expect(s.midfield.map((p: any) => p.name)).not.toContain('AM');
  });
});

test.describe('matchup: tipset', () => {
  const tip = {
    pro: {
      blended: { home: 0.5, draw: 0.27, away: 0.23 }, dc: { lambdaHome: 1.6, lambdaAway: 1.0 },
      verdicts: { home: { odds: 2.1, bookmaker: 'Pinnacle', minOdds: 2.0, value: true, ev: 0.05 }, away: { pick: '2', odds: 5.0, bookmaker: 'Bet365', value: true } },
    },
  };

  test('verdictFor: utan duellfordel = marknadens sannolikheter, summa 1', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const v = m.verdictFor(tip, 0);
    expect(v.probs.home).toBeCloseTo(0.5, 3);
    expect(v.probs.draw).toBeCloseTo(0.27, 3);
    expect(sum(v.probs)).toBeCloseTo(1, 2);
    expect(v.pick).toBe('1');
    expect(v.pickKey).toBe('home');
    expect(v.value).toEqual({ odds: 2.1, bookmaker: 'Pinnacle', minOdds: 2.0, value: true, ev: 0.05 });
    expect(v.otherValue).toEqual([{ market: 'away', pick: '2', odds: 5.0, bookmaker: 'Bet365' }]);
    expect(v.baseProbs).toEqual(tip.pro.blended);
  });

  test('verdictFor: fordel flyttar sannolikheten at ratt hall och ar takad (±12 %)', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const plus = m.verdictFor(tip, 20), minus = m.verdictFor(tip, -20);
    expect(plus.probs.home).toBeGreaterThan(0.5);
    expect(minus.probs.home).toBeLessThan(0.5);
    expect(m.verdictFor(tip, 30)).toEqual(m.verdictFor(tip, 1000));
    expect(m.verdictFor(tip, -30)).toEqual(m.verdictFor(tip, -1000));
    expect(plus.expGoals.home).toBeCloseTo(1.6 * Math.exp(0.08), 2);
  });

  test('verdictFor: resultatet stammer med 1X2-tipset och BTTS/over-under har ratt sida', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    for (const edge of [-100, -10, 0, 10, 100]) {
      for (const t of [tip, { pro: { blended: { home: 0.2, draw: 0.25, away: 0.55 }, dc: { lambdaHome: 0.8, lambdaAway: 1.9 } } }]) {
        const v = m.verdictFor(t, edge);
        const [h, a] = v.score.split('–').map(Number);
        const res = h > a ? '1' : h < a ? '2' : 'X';
        expect(res).toBe(v.pick);
        expect(v.btts).toBe(v.pBtts >= 0.5 ? 'JA' : 'NEJ');
        expect(v.over25).toBe(v.pOver25 >= 0.5 ? 'ÖVER' : 'UNDER');
        expect(sum(v.probs)).toBeCloseTo(1, 2);
      }
    }
  });

  test('verdictFor: utan Dixon-Coles och utan sannolikheter -> reserv, ingen NaN', async () => {
    const { _internal: m } = await lib('matchup.mjs');
    const v = m.verdictFor({}, 0);
    expect(['1', 'X', '2']).toContain(v.pick);
    expect(Object.values(v.probs).every((p) => Number.isFinite(p))).toBe(true);
    expect(sum(v.probs)).toBeCloseTo(1, 2);
    expect(v.value).toBeNull();
    expect(v.baseProbs).toBeNull();
    const w = m.verdictFor({ tips: { '1X2': { probs: { home: 0.6, draw: 0.25, away: 0.15 } }, OU25: { expGoals: 3.1 } } }, 0);
    expect(w.probs.home).toBeCloseTo(0.6, 3);
    expect(w.expGoals.home + w.expGoals.away).toBeCloseTo(3.1, 1);
  });
});

test.describe('matchup: buildMatchup', () => {
  test('saknad spelardata -> ok:false med orsak', async () => {
    const { buildMatchup } = await lib('matchup.mjs');
    expect(buildMatchup({ league: 'FINNS_INTE', home: 'A', away: 'B' })).toEqual({ ok: false, reason: 'Ingen spelardata för ligan (FINNS_INTE)' });
    const league = fs.readdirSync(path.join(ROOT, 'data', 'spelare')).find((f) => f.endsWith('.json'))!.replace('.json', '');
    const r = buildMatchup({ league, home: 'Lag Som Inte Finns', away: 'Inte Heller' });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Ingen spelardata för Lag Som Inte Finns och Inte Heller');
  });

  test('riktig data: kommande matcher ger hel analys utan undefined/NaN i texterna', async () => {
    const { buildMatchup } = await lib('matchup.mjs');
    const tips = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tips-latest.json'), 'utf8').replace(/^﻿/, ''));
    const have = new Set(fs.readdirSync(path.join(ROOT, 'data', 'spelare')).map((f) => f.replace('.json', '')));
    const pool = [...(tips.bestUpcoming || []), ...(tips.allCandidates || [])].filter((t: any) => have.has(t.league));
    // En match per liga, hogst 15 ligor
    const perLeague = new Map<string, any>();
    for (const t of pool) if (!perLeague.has(t.league) && perLeague.size < 15) perLeague.set(t.league, t);
    test.skip(perLeague.size === 0, 'inga kommande matcher med spelardata');
    let ok = 0;
    for (const t of perLeague.values()) {
      const r = buildMatchup(t);
      if (!r.ok) { expect(typeof r.reason, `${t.league} ${t.home}-${t.away}`).toBe('string'); continue; }
      ok++;
      const where = `${t.league} ${t.home}-${t.away}`;
      expect(r.teams.home.xi, where).toHaveLength(11);
      expect(r.teams.away.xi, where).toHaveLength(11);
      expect(new Set(r.teams.home.xi.map((p: any) => p.name)).size, `${where}: dubbletter i elvan`).toBe(11);
      expect(r.teams.home.xi.filter((p: any) => p.group === 'malvakt').length, `${where}: en malvakt`).toBeLessThanOrEqual(1);
      expect(r.edge, where).toBeGreaterThanOrEqual(-100);
      expect(r.edge, where).toBeLessThanOrEqual(100);
      expect(['1', 'X', '2'], where).toContain(r.verdict.pick);
      expect(sum(r.verdict.probs), where).toBeCloseTo(1, 2);
      for (const d of [...r.duels.flanks, ...r.duels.central, r.duels.midfield, r.duels.keeper].filter(Boolean)) {
        expect(['okänt', 'jämnt', 'lite', 'tydlig', 'klart'], where).toContain(d.edge.level);
      }
      const text = JSON.stringify(r);
      expect(text, `${where}: undefined i texten`).not.toMatch(/undefined/);
      expect(text, `${where}: NaN i texten`).not.toMatch(/NaN/);
      expect(text, `${where}: interna falt (_src) läcker`).not.toContain('"_src"');
    }
    expect(ok, 'minst en match ska ga att analysera').toBeGreaterThan(0);
  });
});

// ---------- fotmob-names.mjs / fotmob-leagues.mjs ----------

test.describe('fotmob-names', () => {
  test('mapTeam: alias, exakt (vikta tecken), kortnamn, likhet och ingen traff', async () => {
    const { mapTeam } = await lib('fotmob-names.mjs');
    expect(mapTeam({ cur: ['Sp Lisbon', 'Porto'], all: [] }, 'Sporting CP')).toEqual({ n: 'Sp Lisbon', s: 2 });
    expect(mapTeam({ cur: [], all: ['Ham-Kam'] }, 'Hamarkameratene')).toEqual({ n: 'Ham-Kam', s: 2 });
    expect(mapTeam({ cur: ['Malmo FF'], all: [] }, 'Malmö FF')).toEqual({ n: 'Malmo FF', s: 2 });
    expect(mapTeam({ cur: ['Wolves'], all: [] }, 'Wolverhampton Wanderers', 'Wolves')).toEqual({ n: 'Wolves', s: 2 });
    const fuzzy = mapTeam({ cur: ['Brighton', 'Arsenal'], all: [] }, 'Brighton & Hove Albion');
    expect(fuzzy.n).toBe('Brighton');
    expect(fuzzy.s).toBeGreaterThanOrEqual(0.5);
    expect(fuzzy.s).toBeLessThan(2);
    expect(mapTeam({ cur: ['Arsenal'], all: ['Chelsea'] }, 'Real Madrid')).toEqual({ n: 'Real Madrid', s: 0 });
  });

  test('mapTeam: innevarande sasong provas fore alla sasonger', async () => {
    const { mapTeam } = await lib('fotmob-names.mjs');
    expect(mapTeam({ cur: ['Kolding'], all: ['Kolding IF', 'Kolding'] }, 'Kolding IF').n).toBe('Kolding'); // namnformen bytt mellan sasonger
    expect(mapTeam({ cur: ['Leeds'], all: ['Leeds United'] }, 'Leeds United').n).toBe('Leeds');
  });

  test('mapTable: ett vart namn gar bara till ett FotMob-lag, sakraste kopplingen vinner', async () => {
    const { mapTable } = await lib('fotmob-names.mjs');
    const warn = console.warn;
    const warnings: string[] = [];
    console.warn = (s: string) => warnings.push(s);
    try {
      const out = mapTable({ cur: ['Boca Juniors', 'River Plate'], all: [] }, [
        { id: 1, name: 'Argentinos Juniors' }, { id: 2, name: 'Boca Juniors' }, { id: 2, name: 'Boca Juniors' }, { id: 3, name: 'River Plate' },
      ]);
      expect(out.get(2)).toBe('Boca Juniors');
      expect(out.get(1)).toBe('Argentinos Juniors');
      expect(out.get(3)).toBe('River Plate');
      expect(out.size).toBe(3);
      expect(warnings.some((w) => w.includes('namnkrock'))).toBe(true);
    } finally { console.warn = warn; }
  });

  test('fold: nordiska och polska tecken', async () => {
    const { fold } = await lib('fotmob-names.mjs');
    expect(fold('Bodø/Glimt')).toBe('Bodo/Glimt');
    expect(fold('FC København')).toBe('FC Kobenhavn');
    expect(fold('Wisła Kraków')).toBe('Wisla Krakow');
    expect(fold('Ærø')).toBe('Aero');
  });

  test('ALIASES: inga tomma alias', async () => {
    const { ALIASES } = await lib('fotmob-names.mjs');
    for (const [k, v] of Object.entries(ALIASES)) for (const a of ([] as any[]).concat(v)) expect(String(a).trim(), k).not.toBe('');
  });
});

test('FOTMOB_LEAGUES: giltiga id, inga dubbletter utom delad tabell med grupp', async () => {
  const { FOTMOB_LEAGUES } = await lib('fotmob-leagues.mjs');
  const seen = new Map<number, string>();
  for (const [code, v] of Object.entries<any>(FOTMOB_LEAGUES)) {
    const [id, group] = Array.isArray(v) ? v : [v, null];
    expect(Number.isInteger(id) && id > 0, code).toBe(true);
    if (Array.isArray(v)) expect(typeof group === 'string' && group.length > 0, code).toBe(true);
    if (seen.has(id)) {
      expect(Array.isArray(v) && Array.isArray((FOTMOB_LEAGUES as any)[seen.get(id)!]), `${code} delar id ${id} med ${seen.get(id)} utan grupp`).toBe(true);
    }
    seen.set(id, code);
  }
  expect(FOTMOB_LEAGUES.PL).toBe(47);
});

// ---------- stryk-calibration.mjs ----------

test.describe('stryk-calibration', () => {
  const table = {
    bs: { 'hemma|0.60': { n: 100, w: 50, e: 62 }, 'borta|0.50': { n: 80, w: 50, e: 40 } },
    lg: { 'Premier League': { n: 100, w: 60, e: 60 }, Championship: { n: 30, w: 10, e: 15 } },
  };

  test('assessMatch: justerad favoritchans, procenten summerar till 1, spikgrans', async () => {
    const { assessMatch } = await lib('stryk-calibration.mjs');
    const a = assessMatch([0.62, 0.22, 0.16], 'Premier League', table, 0.5);
    const cal = 0.62 * ((50 + 40) / (62 + 40));
    expect(a.fav).toBe('1');
    expect(a.model).toBe(0.62);
    expect(a.calibrated).toBeCloseTo(cal, 3);
    expect(a.sysP.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 3);
    expect(a.sysP[0]).toBeCloseTo(cal, 3);
    expect(a.sysP[1] / a.sysP[2]).toBeCloseTo(0.22 / 0.16, 2); // ovriga behaller sin inbordes andel
    expect(a.group).toEqual({ n: 100, won: 0.5, expected: 0.62 });
    expect(a.spikbar).toBe(true);
    expect(assessMatch([0.62, 0.22, 0.16], 'Premier League', table, 0.6).spikbar).toBe(false);
  });

  test('assessMatch: bortafavorit, okand liga, tak 95 % och saknad data', async () => {
    const { assessMatch } = await lib('stryk-calibration.mjs');
    const b = assessMatch([0.25, 0.22, 0.53], 'Okänd liga', table, 0.5);
    expect(b.fav).toBe('2');
    expect(b.league).toBeNull();
    expect(b.calibrated).toBeCloseTo(0.53 * (90 / 80), 3);
    const big = { bs: { 'hemma|0.85': { n: 1000, w: 1000, e: 100 } }, lg: {} };
    expect(assessMatch([0.9, 0.06, 0.04], '', big, 0.5).calibrated).toBe(0.95);
    expect(assessMatch(null, 'x', table, 0.5)).toBeNull();
    expect(assessMatch([0.5, 0.3, 0.2], 'x', null, 0.5)).toBeNull();
  });

  test('assessmentText: lag, spikbar/inte spikbar, ligarad bara fran 40 matcher', async () => {
    const { assessMatch, assessmentText } = await lib('stryk-calibration.mjs');
    expect(assessmentText(null, 'A', 'B')).toBeNull();
    const a = assessMatch([0.62, 0.22, 0.16], 'Premier League', table, 0.5);
    const t = assessmentText(a, 'Arsenal', 'Chelsea');
    expect(t).toContain('Spikbedömning: Arsenal (1) har 62 %');
    expect(t).toContain('Kan spikas (minst 50 %).');
    expect(t).toContain('i ligan 60 % mot väntat 60 %');
    const c = assessMatch([0.62, 0.22, 0.16], 'Championship', table, 0.7);
    const tc = assessmentText(c, 'Leeds', 'Hull');
    expect(tc).toContain('Spikas inte – under 70 %');
    expect(tc).not.toContain('i ligan');
    expect(assessmentText({ ...a, used: false }, 'A', 'B')).toContain('På Europatipset byggs systemet på modellens procent');
    expect(assessmentText({ ...a, spikMin: 0 }, 'A', 'B')).toContain('Systemet väljer spik eller gardering');
    expect(t).not.toMatch(/undefined|NaN/);
  });

  test('calibrationTable: framtiden syns aldrig, for tidigt datum ger null', async () => {
    const { calibrationTable } = await lib('stryk-calibration.mjs');
    expect(calibrationTable('stryktipset', '2000-01-01')).toBeNull();
    const t = calibrationTable('stryktipset', '2026-10-01');
    test.skip(!t, 'for litet kupongarkiv');
    expect(t.before).toBe('2026-10-01');
    for (const x of Object.values<any>(t.bs)) {
      expect(x.w).toBeLessThanOrEqual(x.n);
      expect(x.e).toBeLessThanOrEqual(x.n);
    }
  });
});

// ---------- stryk-miss-profile.mjs ----------

test.describe('stryk-miss-profile', () => {
  test('bandOf, pickType, groupKey: granserna ingar i bandet ovanfor', async () => {
    const { bandOf, pickType, groupKey } = await lib('stryk-miss-profile.mjs');
    expect([0.3, 0.44, 0.45, 0.549, 0.55, 0.65, 0.75, 0.95].map(bandOf)).toEqual([0, 0, 1, 1, 2, 3, 4, 4]);
    expect(pickType('1')).toBe('spik');
    expect(pickType('1X')).toBe('halv');
    expect(pickType('1X2')).toBe('hel');
    expect(groupKey('X2', 0.6)).toBe('halv|X2|2');
  });

  test('buildMissProfile: missar, grupper, fordelning, produkt- och ligafilter', async () => {
    const { buildMissProfile, STRYK_LEAGUES } = await lib('stryk-miss-profile.mjs');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'missprofil-'));
    try {
      const w = (f: string, d: any) => fs.writeFileSync(path.join(dir, f), typeof d === 'string' ? d : JSON.stringify(d));
      w('stryktipset-1.json', {
        closeTime: '2026-01-10T15:00:00', outcomes: '121', A: { picks: ['1', '1X', '2', '1X2'] },
        matches: [
          { league: 'Premier League', outcome: '1', final: [0.6, 0.25, 0.15] },
          { league: 'Championship', outcome: '2', final: [0.5, 0.3, 0.2] },
          { league: 'Serie A', outcome: '1', final: [0.3, 0.3, 0.4] },
          { league: 'League One', outcome: 'X', final: [0.4, 0.3, 0.3] },
        ],
      });
      w('europatipset-2.json', { closeTime: '2026-02-01T18:00:00', outcomes: '1', A: { picks: ['1'] }, matches: [{ league: 'La Liga', outcome: '1', final: [0.7, 0.2, 0.1] }] });
      w('stryktipset-3.json', '{ trasig json');
      w('stryktipset-4.json', { closeTime: '2026-03-01', outcomes: '1', matches: [{ league: 'Premier League', outcome: '1', final: [0.5, 0.3, 0.2] }] }); // utan A
      w('notes.txt', 'ignoreras');

      const p = buildMissProfile(dir);
      expect(p).toMatchObject({ draws: 2, matches: 5, from: '2026-01-10', to: '2026-02-01', avgOutside: 1, outsideDist: [1, 0, 1, 0] });
      expect(p.groups['spik|1|2']).toMatchObject({ n: 1, miss: 0, rate: 0, exp: 0.4, label: 'Spik 1 · hemmafavorit 55–65 %' });
      expect(p.groups['halv|1X|1']).toMatchObject({ n: 1, miss: 1, rate: 1, exp: 0.2, by: { 1: 0, X: 0, 2: 1 } });
      expect(p.groups['spik|2|0']).toMatchObject({ n: 1, miss: 1, label: 'Spik 2 · bortafavorit under 45 %' });
      expect(Object.keys(p.groups).some((k) => k.startsWith('hel'))).toBe(false); // helgarderingar raknas inte som grupp
      expect(p.leagues).toEqual({}); // under 25 spikar per liga
      expect(p.leaguePicks.Championship['1X']).toMatchObject({ n: 1, miss: 1 });

      expect(buildMissProfile(dir, { product: 'stryktipset' })).toMatchObject({ draws: 1, matches: 4 });
      const eng = buildMissProfile(dir, { product: 'stryktipset', leagues: STRYK_LEAGUES });
      expect(eng).toMatchObject({ draws: 1, matches: 3, avgOutside: 1, leaguesOnly: STRYK_LEAGUES });
      expect(buildMissProfile(dir, { product: 'topptipset' })).toBeNull();
      expect(buildMissProfile(path.join(dir, 'finns-inte'))).toBeNull();
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});

// ---------- stryk-color-bands.mjs ----------

test('colorBands: karnan ligger inom min-max, for tidigt datum ger null', async () => {
  const { colorBands, BAND_COLORS } = await lib('stryk-color-bands.mjs');
  expect(BAND_COLORS).toEqual(['green', 'yellow', 'red']);
  expect(colorBands('stryktipset', '2000-01-01')).toBeNull();
  for (const product of ['stryktipset', 'europatipset']) {
    const b = colorBands(product, '2026-10-01');
    if (!b) continue;
    expect(b.draws).toBeGreaterThanOrEqual(10);
    expect(b.from <= b.to).toBe(true);
    expect(b.to < '2026-10-01').toBe(true);
    for (const c of BAND_COLORS) {
      const { core, range, mean } = b[c];
      expect(range[0] <= core[0] && core[0] <= core[1] && core[1] <= range[1], `${product} ${c}`).toBe(true);
      expect(mean >= range[0] && mean <= range[1], `${product} ${c} snitt`).toBe(true);
      expect(range[1]).toBeLessThanOrEqual(13);
    }
  }
});

// ---------- extra-odds.mjs ----------

test.describe('extra-odds', () => {
  test('sportKeyFor: Svenska Spels liganamn till The Odds API', async () => {
    const { sportKeyFor } = await lib('extra-odds.mjs');
    expect(sportKeyFor('Premier League')).toBe('soccer_epl');
    expect(sportKeyFor('Championship')).toBe('soccer_efl_champ');
    expect(sportKeyFor('League Two')).toBe('soccer_england_league2');
    expect(sportKeyFor('UEFA Champions League')).toBe('soccer_uefa_champs_league');
    expect(sportKeyFor('UEFA Nations League')).toBe('soccer_uefa_nations_league');
    expect(sportKeyFor('Allsvenskan')).toBe('soccer_sweden_allsvenskan');
    expect(sportKeyFor('Damallsvenskan')).toBeNull();
    expect(sportKeyFor('Okänd liga')).toBeNull();
    expect(sportKeyFor(null)).toBeNull();
  });

  const books = [
    { key: 'pinnacle', bookmaker: 'Pinnacle', home: 2.0, draw: 3.6, away: 3.9 },
    { key: 'unibet', bookmaker: 'Unibet', home: 1.95, draw: 3.5, away: 3.8 },
    { key: 'bet365', bookmaker: 'Bet365', home: 1.97, draw: 3.4, away: 3.75 },
    { key: 'betsson', bookmaker: 'Betsson', home: 1.93, draw: 3.55, away: 3.85 },
  ];
  const cache = (b: any[]) => ({ sports: { soccer_epl: { events: [{ commence: '2026-10-03T14:00:00Z', home: 'Arsenal', away: 'Chelsea', books: b }] } } });
  const q = { league: 'Premier League', kickoff: '2026-10-03T16:00:00+02:00', home: 'Arsenal', away: 'Chelsea' };

  test('matchExtraOdds: skarpt bolag (Pinnacle) forst, marginalfritt', async () => {
    const { matchExtraOdds } = await lib('extra-odds.mjs');
    const r = matchExtraOdds(cache(books), q);
    expect(r.source).toBe('Pinnacle');
    expect(r.odds).toEqual([2.0, 3.6, 3.9]);
    expect(r.p.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 6);
    expect(r.p[0]).toBeGreaterThan(r.p[2]);
  });

  test('matchExtraOdds: utan skarpt bolag snitt av minst 3 bolag, annars null', async () => {
    const { matchExtraOdds } = await lib('extra-odds.mjs');
    const r = matchExtraOdds(cache(books.slice(1)), q);
    expect(r).toMatchObject({ odds: null, source: 'snitt 3 bolag' });
    expect(r.p.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 6);
    expect(matchExtraOdds(cache(books.slice(1, 3)), q)).toBeNull();
  });

  test('matchExtraOdds: fel tid (> 3 h), fel lag, okand liga eller ogiltig avspark -> null', async () => {
    const { matchExtraOdds } = await lib('extra-odds.mjs');
    expect(matchExtraOdds(cache(books), { ...q, kickoff: '2026-10-03T21:00:00Z' })).toBeNull();
    expect(matchExtraOdds(cache(books), { ...q, home: 'Liverpool' })).toBeNull();
    expect(matchExtraOdds(cache(books), { ...q, league: 'Okänd' })).toBeNull();
    expect(matchExtraOdds(cache(books), { ...q, kickoff: 'inte ett datum' })).toBeNull();
    expect(matchExtraOdds(null, q)).toBeNull();
  });
});

// ---------- transfermarkt.mjs (bara namnlogiken, inget nat) ----------

test.describe('transfermarkt: namn och klubbar', () => {
  test('sameName: tecken, oe/o, initial och efternamn', async () => {
    const { sameName } = await lib('transfermarkt.mjs');
    expect(sameName('Martin Ødegaard', 'Martin Odegaard')).toBe(true);
    expect(sameName('Viktor Bjoerklund', 'Viktor Björklund')).toBe(true);
    expect(sameName('E. Haaland', 'Erling Haaland')).toBe(true);
    expect(sameName('Silva', 'Bernardo Silva')).toBe(true);
    expect(sameName('Bernardo Silva', 'Mario Silva')).toBe(false);
    expect(sameName('Ben White', 'Ben Davies')).toBe(false);
  });

  test('sameClub/unknownClub: ungdomslag raknas som samma klubb, okand klubb ar inget bevis', async () => {
    const { sameClub, unknownClub } = await lib('transfermarkt.mjs');
    expect(sameClub('Arsenal U21', ['Arsenal'])).toBe(true);
    expect(sameClub('Arsenal FC', ['Arsenal'])).toBe(true);
    expect(sameClub('Chelsea FC', ['Arsenal'])).toBe(false);
    expect(unknownClub('---')).toBe(true);
    expect(unknownClub('')).toBe(true);
    expect(unknownClub(null)).toBe(true);
    expect(unknownClub('Arsenal')).toBe(false);
  });

  test('pairClubs: fasta id forst, sedan basta namnlikhet, varje klubb en gang', async () => {
    const { pairClubs } = await lib('transfermarkt.mjs');
    const teams: any[] = [['Gimnasia Mendoza', { fotmobName: 'Gimnasia Mendoza' }], ['Boca Juniors', { fotmobName: 'Boca Juniors' }], ['River Plate', { fotmobName: 'River Plate' }]];
    const clubs = [{ id: '1', name: 'CA Boca Juniors' }, { id: '2', name: 'CA River Plate' }, { id: '3', name: 'Gimnasia y Esgrima La Plata' }];
    const out = pairClubs('AR', teams, clubs);
    expect(out.get('Gimnasia Mendoza')).toEqual({ id: '14687', name: 'Gimnasia Mendoza' });
    expect(out.get('Boca Juniors').id).toBe('1');
    expect(out.get('River Plate').id).toBe('2');
    const ids = [...out.values()].map((c: any) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------- player-positions.mjs ----------

test.describe('player-positions', () => {
  test('fotmobGroup och tmGroup', async () => {
    const { fotmobGroup, tmGroup } = await lib('player-positions.mjs');
    expect(fotmobGroup('RB')).toBe('ytterback');
    expect(fotmobGroup('cb, dm')).toBe('mittback');
    expect(fotmobGroup('XX')).toBeNull();
    expect(fotmobGroup(null)).toBeNull();
    expect(tmGroup('Goalkeeper')).toBe('malvakt');
    expect(tmGroup('Left Winger')).toBe('ytter');
    expect(tmGroup('Defensive Midfield')).toBe('defensiv_mittfaltare');
    expect(tmGroup('Attacking Midfield')).toBe('offensiv_mittfaltare');
    expect(tmGroup('Right Midfield')).toBe('central_mittfaltare');
    expect(tmGroup('Centre-Forward')).toBe('anfallare');
    expect(tmGroup('Second Striker')).toBe('anfallare');
    expect(tmGroup('Defender')).toBe('mittback');
    expect(tmGroup('')).toBeNull();
  });

  test('positionGroup: FotMob (minst 5 matcher) > Transfermarkt > FotMob > trupp > roll', async () => {
    const { positionGroup } = await lib('player-positions.mjs');
    expect(positionGroup({ fotmobMain: 'RW', fotmobMatches: 5, tm: 'Right-Back' })).toEqual({ group: 'ytter', source: 'FotMob' });
    expect(positionGroup({ fotmobMain: 'RW', fotmobMatches: 4, tm: 'Right-Back' })).toEqual({ group: 'ytterback', source: 'Transfermarkt' });
    expect(positionGroup({ fotmobMain: 'RW', fotmobMatches: 1 })).toEqual({ group: 'ytter', source: 'FotMob' });
    expect(positionGroup({ squadPosition: 'GK' })).toEqual({ group: 'malvakt', source: 'FotMob-trupp' });
    expect(positionGroup({ role: 'attackers' })).toEqual({ group: 'anfallare', source: 'roll' });
    expect(positionGroup({})).toEqual({ group: null, source: null });
  });

  test('alla nyckeltal har svensk etikett och alla grupper har nyckeltal', async () => {
    const { GROUPS, KEY_STATS, STAT_LABELS } = await lib('player-positions.mjs');
    expect(Object.keys(KEY_STATS).sort()).toEqual(Object.keys(GROUPS).sort());
    for (const [g, keys] of Object.entries<string[]>(KEY_STATS)) {
      for (const k of keys) expect(STAT_LABELS[k], `${g}: ${k}`).toBeTruthy();
      expect(new Set(keys).size, `${g}: dubbletter`).toBe(keys.length);
    }
  });
});

// ---------- tips-archive.mjs ----------

test('tips-archive: slimDraw/slimResult behaller bara analysfalten', async () => {
  const { slimDraw, slimResult } = await lib('tips-archive.mjs');
  const d = slimDraw({
    drawNumber: 4321, productName: 'Stryktipset', regCloseTime: '2026-10-03T14:59:00', skrap: 'x',
    drawEvents: [{
      eventNumber: 1, odds: { one: '2,10' }, svenskaFolket: { one: '45' }, skrap: 1,
      match: { matchId: 9, matchStart: '2026-10-03T16:00', status: 'x', skrap: 2, participants: [{ id: 1, name: 'Arsenal', type: 'home', logo: 'url' }], league: { name: 'Premier League', id: 5, country: { name: 'England', isoCode: 'GB', id: 1 } } },
    }],
  });
  expect(d).toEqual({
    drawNumber: 4321, productName: 'Stryktipset', regCloseTime: '2026-10-03T14:59:00',
    drawEvents: [{
      eventNumber: 1, odds: { one: '2,10' }, svenskaFolket: { one: '45' },
      match: { matchId: 9, matchStart: '2026-10-03T16:00', status: 'x', participants: [{ id: 1, name: 'Arsenal', type: 'home' }], league: { name: 'Premier League', country: { name: 'England', isoCode: 'GB' } } },
    }],
  });
  expect(slimDraw({}).drawEvents).toEqual([]);
  expect(slimResult(null)).toBeNull();
  expect(slimResult({ drawNumber: 1, skrap: 1, events: [{ eventNumber: 1, outcome: '1', x: 1 }], distribution: [{ name: '13 rätt', winners: 2, amount: '100', y: 1 }] }))
    .toEqual({ drawNumber: 1, events: [{ eventNumber: 1, outcome: '1' }], distribution: [{ name: '13 rätt', winners: 2, amount: '100' }] });
});
