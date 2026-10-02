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

// ---------- referee-streaks.mjs ----------

test.describe('referee-streaks: domarsviter per lag', () => {
  // Arsenal med "A Taylor": 5 raka segrar efter en forlust; Leeds 5 raka forluster med samma domare
  const fd = (d: string, h: string, a: string, hg: number, ag: number, r = 'A Taylor') => ({ d, lg: 'PL', h, a, hg, ag, r });
  const hist = [
    fd('2020-01-01', 'Arsenal', 'Leeds', 0, 1),
    fd('2021-01-01', 'Arsenal', 'Leeds', 2, 0),
    fd('2022-01-01', 'Leeds', 'Arsenal', 0, 3),
    fd('2023-01-01', 'Arsenal', 'Leeds', 1, 0),
    fd('2024-01-01', 'Leeds', 'Arsenal', 1, 2),
    fd('2025-01-01', 'Arsenal', 'Leeds', 4, 1),
    fd('2025-02-01', 'Arsenal', 'Chelsea', 1, 1, 'M Oliver'),
  ];

  test('refKey: initial + efternamn, FotMob och football-data blir samma', async () => {
    const { refKey } = await lib('referee-streaks.mjs');
    expect(refKey('Anthony Taylor')).toBe('a taylor');
    expect(refKey('A Taylor')).toBe('a taylor');
    expect(refKey('A. Taylor ')).toBe('a taylor');
    expect(refKey("Jamie O'Connor")).toBe('j oconnor');
    expect(refKey('J jBrooks')).toBe('j brooks');
    expect(refKey('P  Wright')).toBe('p wright');
    expect(refKey('Robert Madley')).not.toBe(refKey('Andy Madley'));
    expect(refKey('')).toBe('');
  });

  test('refKey: stavningsvarianter av samma domare blir en nyckel (inga dubbletter i domarlistan)', async () => {
    const { refKey, refereeLeagueReport } = await lib('referee-streaks.mjs');
    const same = [
      ['Mohammed Al-Hakim', 'Mohammed Al Hakim'], ['Adam Ladebäck', 'Adam Ladebaeck'],
      ['Espen Eskås', 'Espen Eskaas'], ['Marius Hansen Grøtta', 'Marius Hansen Groetta'], ['Marius Hansen Grøtta', 'Marius Hansen Grotta'],
      ['Florian Badstübner', 'Florian Badstuebner'], ['Matthias Jöllenbeck', 'Dr. Matthias Jöllenbeck'], ['Matthias Jöllenbeck', 'Matthias Joellenbeck'],
      ['Jarosław Przybył', 'Jaroslaw Przybyl'], ['Łukasz Kuźma', 'Lukasz Kuzma'], ['Sandro Schärer', 'Sandro Schaerer'],
      ['Ali Al-Hatem', 'Ali Al Hatam'], ['Konrad Oldhafer', 'Konrad Oldhfer'], ['Spiros Zabalas', 'Spyros Zampalas'],
      ['Mohammad Usman Aslam', 'Usman Aslam'], ['Carlos Andrés Gariano', 'Andrés Carlos Gariano'],
      ['Joakim Sars', 'Joakim Östling'], ['Granit Maqedonci', 'Granit Maqedonki'], ['Andreas Ekberg', 'Lars Christian Andreas Ekberg'],
      ['Sunny Sukhvir Gill', 'S Singh'], ['S Gill', 'Sunny Singh'],
      ['Juuso Vuorinen', 'Juuso Vuorinen, Finland'], ['Peiman Simani', 'Peiman Simani (Finland)'],
    ];
    for (const [a, b] of same) expect(refKey(b), `${a} = ${b}`).toBe(refKey(a));
    // Olika personer med samma efternamn halls isar
    expect(refKey('Kristoffer Karlsson')).not.toBe(refKey('Niclas Karlsson'));
    expect(refKey('Chris Penso')).not.toBe(refKey('Tori Penso'));
    // Domarlistan: en rad per domare, vanligaste stavningen visas
    const m = (d, r) => ({ d, lg: 'AS', h: 'A', a: 'B', hg: 1, ag: 0, r, hy: 2, ay: 1 });
    const rep = refereeLeagueReport([m('2026-04-01', 'Mohammed Al Hakim'), m('2026-05-01', 'Mohammed Al Hakim'), m('2026-06-01', 'Mohammed Al-Hakim')], 'AS', { today: '2026-10-02' });
    expect(rep.referees).toHaveLength(1);
    expect(rep.referees[0]).toMatchObject({ referee: 'Mohammed Al Hakim', matches: 3 });
  });

  test('parseRefereeCsv: datum, mal, domare; ospelade och domarlosa hoppas over', async () => {
    const { parseRefereeCsv } = await lib('referee-streaks.mjs');
    const csv = '\uFEFFDiv,Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,FTR,Referee\r\nE0,16/08/2025,20:00,Liverpool,Bournemouth,4,2,H,A Taylor\r\nE0,17/08/15,15:00,Arsenal,Leeds,,,,M Oliver\r\nE0,18/08/2025,15:00,Chelsea,Fulham,1,1,D,\r\n';
    const rows = parseRefereeCsv(csv, 'PL');
    expect(rows).toEqual([{ d: '2025-08-16', lg: 'PL', h: 'Liverpool', a: 'Bournemouth', hg: 4, ag: 2, r: 'A Taylor' }]);
    expect(parseRefereeCsv('Div,Date,HomeTeam\nE0,1/1/20,X', 'PL')).toEqual([]);
  });

  test('mergeRefereeMatches: store fyller pa, inga dubbletter, bara engelska ligor', async () => {
    const { mergeRefereeMatches } = await lib('referee-streaks.mjs');
    const store = [
      { date: '2025-01-01', league: 'PL', home: 'Arsenal', away: 'Leeds', hg: 4, ag: 1, referee: 'A Taylor' }, // dubblett
      { date: '2026-01-01', league: 'PL', home: 'Leeds', away: 'Arsenal', hg: 0, ag: 1, referee: 'A Taylor' },
      { date: '2026-01-01', league: 'LL', home: 'Betis', away: 'Getafe', hg: 0, ag: 1, referee: 'X Y' },
      { date: '2026-02-01', league: 'PL', home: 'Leeds', away: 'Arsenal', hg: null, ag: null, referee: 'A Taylor' },
    ];
    const all = mergeRefereeMatches(hist, store);
    expect(all.length).toBe(hist.length + 1);
    expect(all.at(-1).d).toBe('2026-01-01');
  });

  test('currentStreak och refereeFlags: 5 raka segrar resp. forluster flaggas, FotMob-namn matchar', async () => {
    const { buildRefIndex, currentStreak, refereeFlags, MIN_STREAK } = await lib('referee-streaks.mjs');
    expect(MIN_STREAK).toBe(5);
    const idx = buildRefIndex(hist);
    expect(currentStreak(idx.byPair.get('Arsenal|a taylor'))).toEqual({ res: 'W', n: 5 });
    expect(currentStreak([])).toBeNull();
    const rf = refereeFlags(idx, { referee: 'Anthony Taylor', home: 'Arsenal', away: 'Leeds United' });
    expect(rf.flagged).toBe(true);
    expect(rf.home).toMatchObject({ team: 'Arsenal', flag: 'wins', matches: 6, record: { w: 5, d: 0, l: 1 } });
    expect(rf.away).toMatchObject({ team: 'Leeds', flag: 'losses', streak: { res: 'L', n: 5 } });
    expect(rf.home.last.length).toBe(5);
    expect(rf.home.last[0]).toEqual({ date: '2025-01-01', opp: 'Leeds', home: true, score: '4-1', res: 'W' });
    // Annan domare: ingen svit; kryss bryter svit
    const other = refereeFlags(idx, { referee: 'Michael Oliver', home: 'Arsenal', away: 'Chelsea' });
    expect(other.flagged).toBe(false);
    expect(other.home.streak).toEqual({ res: 'D', n: 1 });
    expect(refereeFlags(idx, { referee: null, home: 'Arsenal', away: 'Leeds' })).toBeNull();
  });

  test('4 raka racker inte, okant lag ger null-sida', async () => {
    const { buildRefIndex, refereeFlags } = await lib('referee-streaks.mjs');
    const idx = buildRefIndex(hist.slice(0, 5));
    const rf = refereeFlags(idx, { referee: 'A Taylor', home: 'Arsenal', away: 'Real Madrid' });
    expect(rf.home.streak).toEqual({ res: 'W', n: 4 });
    expect(rf.home.flag).toBeNull();
    expect(rf.away).toBeNull();
    expect(rf.flagged).toBe(false);
  });

  test('refereeNotes: svensk rad per flaggat lag, tom utan flagga', async () => {
    const { buildRefIndex, refereeFlags, refereeNotes } = await lib('referee-streaks.mjs');
    const rf = refereeFlags(buildRefIndex(hist), { referee: 'Anthony Taylor', home: 'Arsenal', away: 'Leeds' });
    expect(refereeNotes(rf, 'Arsenal', 'Leeds')).toEqual([
      'Domare Anthony Taylor: Arsenal har vunnit 5 ligamatcher i rad med domaren (totalt 5-0-1 i 6 matcher).',
      'Domare Anthony Taylor: Leeds har förlorat 5 ligamatcher i rad med domaren (totalt 1-0-5 i 6 matcher).',
    ]);
    expect(refereeNotes(null, 'A', 'B')).toEqual([]);
  });
});

// ---------- startelva.mjs ----------

// Elva i FotMob-format: [positions-id, x (djup), y (sida, högt = höger)]
const xi = (team: string, rows: [number, number, number][]) =>
  rows.map(([pid, x, y], i) => ({ id: `${team}${i}`, name: `${team} Spelare${i}`, pid, x, y, shirt: String(i + 1) }));
const F4231: [number, number, number][] = [[11, 0.1, 0.5], [32, 0.29, 0.875], [34, 0.29, 0.625], [36, 0.29, 0.375], [38, 0.29, 0.125],
  [64, 0.485, 0.7], [66, 0.485, 0.3], [83, 0.678, 0.837], [85, 0.678, 0.5], [87, 0.678, 0.163], [115, 0.87, 0.5]];
const F3421: [number, number, number][] = [[11, 0.1, 0.5], [33, 0.29, 0.79], [35, 0.29, 0.5], [37, 0.29, 0.21], [62, 0.485, 0.875],
  [64, 0.485, 0.625], [66, 0.485, 0.375], [68, 0.485, 0.125], [84, 0.678, 0.7], [86, 0.678, 0.3], [105, 0.87, 0.5]];
const F442: [number, number, number][] = [[11, 0.1, 0.5], [32, 0.357, 0.875], [34, 0.357, 0.625], [36, 0.357, 0.375], [38, 0.357, 0.125],
  [72, 0.613, 0.875], [74, 0.613, 0.625], [76, 0.613, 0.375], [78, 0.613, 0.125], [104, 0.87, 0.7], [106, 0.87, 0.3]];
const F343: [number, number, number][] = [[11, 0.1, 0.5], [33, 0.357, 0.79], [35, 0.357, 0.5], [37, 0.357, 0.21], [72, 0.613, 0.875],
  [74, 0.613, 0.625], [76, 0.613, 0.375], [78, 0.613, 0.125], [103, 0.87, 0.79], [105, 0.87, 0.5], [107, 0.87, 0.21]];
const F532: [number, number, number][] = [[11, 0.1, 0.5], [33, 0.357, 0.695], [35, 0.357, 0.5], [37, 0.357, 0.305], [51, 0.371, 0.89],
  [59, 0.371, 0.11], [73, 0.613, 0.79], [75, 0.613, 0.5], [77, 0.613, 0.21], [104, 0.87, 0.7], [106, 0.87, 0.3]];
const roles = (list: any[]) => list.map((p) => p.role + (p.side || '')).join(' ');
// Spelarpost där alla nyckeltal har samma percentil och gott om minuter
const rec = (pct: number) => ({
  id: 1, name: 'X', season: { season: '2026/2027', stats: Object.fromEntries(['dribbles_succeeded', 'won_contest_subtitle', 'chances_created', 'expected_assists',
    'expected_goals', 'touches_opp_box', 'crosses_succeeeded', 'dribbled_past', 'duel_won_percent', 'matchstats.headers.tackles', 'interceptions', 'recoveries',
    'expected_goals_against_while_on_pitch', 'defensive_actions', 'minutes_played'].map((k) => [k, [k === 'minutes_played' ? 1800 : 5, 1, pct]])) },
});

test.describe('startelva: roller och motståndare', () => {
  test('assignRoles: 4-2-3-1 -> ytterbackar, mittbackar, defensiva, yttrar, offensiv mittfältare, anfallare', async () => {
    const { assignRoles } = await lib('startelva.mjs');
    expect(roles(assignRoles(xi('h', F4231)))).toBe('gk fbR cb cb fbL dm dm wingR am wingL st');
  });

  test('assignRoles: trebackslinje -> breda mittfältare blir wingbacks, 3x i mitten är mittbackar', async () => {
    const { assignRoles } = await lib('startelva.mjs');
    expect(roles(assignRoles(xi('h', F3421)))).toBe('gk cb cb cb wbR dm dm wbL am am st');
    expect(roles(assignRoles(xi('h', F532)))).toBe('gk cb cb cb wbR wbL cm cm cm st st');
  });

  test('assignRoles: 4-4-2 -> breda mittfältare är yttrar; 3-4-3 -> yttre anfallarna är yttrar', async () => {
    const { assignRoles } = await lib('startelva.mjs');
    expect(roles(assignRoles(xi('h', F442)))).toBe('gk fbR cb cb fbL wingR cm cm wingL st st');
    expect(roles(assignRoles(xi('h', F343)))).toBe('gk cb cb cb wbR cm cm wbL wingR st wingL');
  });

  test('roleOf: utan positions-id används planpositionen', async () => {
    const { roleOf } = await lib('startelva.mjs');
    expect(roleOf(null, { x: 0.1, y: 0.5 })).toEqual({ role: 'gk', side: null });
    expect(roleOf(null, { x: 0.3, y: 0.9 })).toEqual({ role: 'fb', side: 'R' });
    expect(roleOf(null, { x: 0.3, y: 0.5 })).toEqual({ role: 'cb', side: null });
    expect(roleOf(null, { x: 0.7, y: 0.1 })).toEqual({ role: 'wing', side: 'L' });
    expect(roleOf(null, { x: 0.9, y: 0.5 })).toEqual({ role: 'st', side: null });
    expect(roleOf(null, null)).toEqual({ role: 'cm', side: null });
  });

  test('roleLabel: sida bara för kantroller', async () => {
    const { roleLabel } = await lib('startelva.mjs');
    expect(roleLabel('fb', 'R')).toBe('Höger ytterback');
    expect(roleLabel('wing', 'L')).toBe('Vänster ytter');
    expect(roleLabel('cb', 'R')).toBe('Mittback');
    expect(roleLabel('okand', null)).toBe('Spelare');
  });

  test('pairOpponents: högerytter mot vänsterback, anfallare mot närmaste mittback, målvakt mot målvakt', async () => {
    const { assignRoles, pairOpponents } = await lib('startelva.mjs');
    const H = assignRoles(xi('h', F4231)), A = assignRoles(xi('a', F4231));
    const o = pairOpponents(H, A);
    const by = (list: any[], role: string, side: string | null = null) => list.find((p) => p.role === role && (side == null || p.side === side)).id;
    expect(o[by(H, 'wing', 'R')][0]).toBe(by(A, 'fb', 'L'));
    expect(o[by(H, 'wing', 'L')][0]).toBe(by(A, 'fb', 'R'));
    expect(o[by(A, 'fb', 'R')][0]).toBe(by(H, 'wing', 'L'));
    expect(A.filter((p: any) => p.role === 'cb').map((p: any) => p.id)).toContain(o[by(H, 'st')][0]);
    expect(o[by(H, 'gk')]).toEqual([by(A, 'gk')]);
    expect(o[by(H, 'am')][0]).toMatch(/^a/);
    for (const list of Object.values(o) as string[][]) expect(list.length).toBeLessThanOrEqual(3);
  });

  test('pairOpponents: wingback mot wingback i 3-4-2-1 mot 5-3-2, och reserv när rollen saknas', async () => {
    const { assignRoles, pairOpponents } = await lib('startelva.mjs');
    const H = assignRoles(xi('h', F3421)), A = assignRoles(xi('a', F532));
    const o = pairOpponents(H, A);
    const wbR = H.find((p: any) => p.role === 'wb' && p.side === 'R');
    const opp = A.find((p: any) => p.id === o[wbR.id][0]);
    expect(opp.role).toBe('wb');
    expect(opp.side).toBe('L');
    // Yttrar utan ytterback/wingback hos motståndaren -> mittback
    const W = assignRoles(xi('w', F4231)), noFb = assignRoles(xi('n', F4231)).map((p: any) => (p.role === 'fb' ? { ...p, role: 'cb' } : p));
    const o2 = pairOpponents(W, noFb);
    expect(noFb.find((p: any) => p.id === o2[W.find((p: any) => p.role === 'wing').id][0]).role).toBe('cb');
  });

  test('mirrorDist: speglad position, samma kant ger kortast avstånd', async () => {
    const { mirrorDist } = await lib('startelva.mjs');
    expect(mirrorDist({ x: 0.68, y: 0.84 }, { x: 0.29, y: 0.13 })).toBeLessThan(0.1);
    expect(mirrorDist({ x: 0.68, y: 0.84 }, { x: 0.29, y: 0.87 })).toBeGreaterThan(1);
  });
});

test.describe('startelva: jämförelse och vy', () => {
  test('duelKind: kant, centralt, mittfält, målvakt och allmän', async () => {
    const { duelKind } = await lib('startelva.mjs');
    expect(duelKind('wing', 'fb')).toBe('kant');
    expect(duelKind('wb', 'wb')).toBe('kant');
    expect(duelKind('st', 'cb')).toBe('centralt');
    expect(duelKind('cb', 'am')).toBe('centralt');
    expect(duelKind('dm', 'am')).toBe('mittfalt');
    expect(duelKind('gk', 'gk')).toBe('malvakt');
    expect(duelKind('gk', 'st')).toBe('allman');
    expect(duelKind('st', 'fb')).toBe('allman');
  });

  test('compare: bättre spelare får fördelen, två aspekter, tabellrader och ingen NaN', async () => {
    const { compare } = await lib('startelva.mjs');
    const c = compare({ id: 'a', name: 'Anna Ytter', short: 'Ytter', role: 'wing', side: 'R', rec: rec(90) },
      { id: 'b', name: 'Bo Back', short: 'Back', role: 'fb', side: 'L', rec: rec(20) });
    expect(c.kind).toBe('kant');
    expect(c.aspects).toHaveLength(2);
    expect(c.aspects[0].title).toBe('Ytter anfaller – Back försvarar');
    expect(c.aspects[0].who).toBe('a');
    expect(c.who).toBe('a');
    expect(c.edge).toBeGreaterThan(25);
    expect(c.rows.length).toBeGreaterThan(5);
    expect(JSON.stringify(c)).not.toMatch(/NaN|undefined/);
    const d = compare({ id: 'a', name: 'A', short: 'A', role: 'wing', rec: rec(20) }, { id: 'b', name: 'B', short: 'B', role: 'fb', rec: rec(90) });
    expect(d.who).toBe('b');
  });

  test('compare: utan spelardata -> ingen fördel och notis om lite speltid', async () => {
    const { compare } = await lib('startelva.mjs');
    const c = compare({ id: 'a', name: 'A', role: 'st', rec: null }, { id: 'b', name: 'B', role: 'cb', rec: null });
    expect(c.kind).toBe('centralt');
    expect(c.edge).toBeNull();
    expect(c.who).toBeNull();
    expect(c.aspects.every((x: any) => x.diff == null)).toBe(true);
    expect(c.note).toMatch(/Lite speltid/);
  });

  test('parseLineup: förväntad/senaste elvan är inte officiell, saknad elva ger null', async () => {
    const { parseLineup, lineupStatusText } = await lib('startelva.mjs');
    const team = (name: string) => ({ name, formation: '4-2-3-1', starters: [{ id: 1, name: 'A', positionId: 11, shirtNumber: 1, horizontalLayout: { x: 0.1, y: 0.5 }, primaryTeamName: 'Klubb' }] });
    const md = (lineupType: string) => ({ content: { lineup: { lineupType, homeTeam: team('H'), awayTeam: team('B') } } });
    expect(parseLineup(md('predicted')).confirmed).toBe(false);
    expect(parseLineup(md('lastStarting11')).confirmed).toBe(false);
    expect(parseLineup(md('standard')).confirmed).toBe(true);
    expect(parseLineup(md('predicted')).home.starters[0]).toMatchObject({ id: 1, pid: 11, shirt: '1', x: 0.1, y: 0.5, club: 'Klubb' });
    expect(parseLineup({ content: { lineup: { homeTeam: { starters: [] }, awayTeam: { starters: [] } } } })).toBeNull();
    expect(parseLineup(null)).toBeNull();
    expect(lineupStatusText(parseLineup(md('predicted')))).toBe('Förväntad elva (FotMob)');
    expect(lineupStatusText(parseLineup(md('standard')))).toBe('Officiell startelva');
    expect(lineupStatusText(parseLineup(md('lastStarting11')))).toMatch(/Senaste elvan/);
    expect(lineupStatusText(null)).toBe('Ingen elva än');
  });

  test('nycklar: tipKey, svsKey och keyGroup', async () => {
    const { tipKey, svsKey, keyGroup } = await lib('startelva.mjs');
    expect(tipKey({ league: 'PL', date: '2026-10-03', home: 'Arsenal', away: 'Leeds' })).toBe('PL|2026-10-03|Arsenal|Leeds');
    expect(svsKey('stryktipset', 4973, 8)).toBe('svs|stryktipset|4973|8');
    expect(keyGroup('PL|2026-10-03|Arsenal|Leeds')).toBe('PL');
    expect(keyGroup('svs|europatipset|2612|1')).toBe('svs-europatipset');
  });

  test('buildView: elvor, roller, motståndare, jämförelser för alla par och nyckeldueller', async () => {
    const { buildView } = await lib('startelva.mjs');
    const starters = (t: string, rows: [number, number, number][]) => rows.map(([pid, x, y], i) => ({ id: (t === 'h' ? 100 : 200) + i, name: `${t.toUpperCase()} Namn${i}`, pid, x, y, shirt: String(i + 1) }));
    const entry = { keys: ['svs|stryktipset|1|1'], league: 'X', home: 'Hemma', away: 'Borta', fetchedAt: '2026-10-01T10:00:00Z',
      lineup: { lineupType: 'predicted', confirmed: false, home: { name: 'Hemma', formation: '4-2-3-1', starters: starters('h', F4231) }, away: { name: 'Borta', formation: '3-4-2-1', starters: starters('a', F3421) } } };
    const index = new Map([['100', { ...rec(70), id: 100, name: 'H Namn0', fotmobTeam: 'Klubb' }]]);
    const v = buildView(entry, { index });
    expect(v.ok).toBe(true);
    expect(v.status).toBe('Förväntad elva (FotMob)');
    expect(Object.keys(v.players)).toHaveLength(22);
    expect(v.players[100].noData).toBe(false);
    expect(v.players[100].club).toBe('Klubb');
    expect(v.players[101].noData).toBe(true);
    expect(v.players[101].roleLabel).toBe('Höger ytterback');
    expect(v.players[100]._rec).toBeUndefined();
    for (const [id, opp] of Object.entries(v.opponents) as [string, number[]][]) {
      for (const o of opp) {
        const k = v.players[id].team === 'home' ? `${id}-${o}` : `${o}-${id}`;
        expect(v.comparisons[k], k).toBeTruthy();
      }
    }
    expect(v.keyDuels.length).toBeGreaterThan(3);
    for (const k of v.keyDuels) {
      expect(v.comparisons[k].kind).not.toBe('allman');
      expect(v.players[k.split('-')[0]].team).toBe('home');
    }
    expect(v.keyDuels.map((k: string) => v.comparisons[k].kind)).toContain('malvakt');
    expect(JSON.stringify(v)).not.toMatch(/NaN/);
  });

  test('buildView: utan post eller elva -> ok:false med orsak', async () => {
    const { buildView } = await lib('startelva.mjs');
    expect(buildView(null, { index: new Map() })).toMatchObject({ ok: false });
    const v = buildView({ keys: ['a'], home: 'H', away: 'B', lineup: null }, { index: new Map() });
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/ingen elva/i);
  });

  test('slimRecord och recordFromPlayerData: alla nyckeltal med värde, säsong och form', async () => {
    const { slimRecord, recordFromPlayerData } = await lib('startelva.mjs');
    const s = slimRecord({ id: 5, name: 'N', season: { season: '2026', tournament: 'L', stats: { goals: [1, 0.1, 50], weird_stat: [1, 1, 1] } }, matches: Array(9).fill([]) });
    expect(s.season.stats.goals).toEqual([1, 0.1, 50]);
    expect(s.season.stats.weird_stat).toEqual([1, 1, 1]); // alla nyckeltal behålls för spelarkortet
    expect(s.matches).toHaveLength(5);
    const d = recordFromPlayerData({
      id: 7, name: 'Spelare', primaryTeam: { teamName: 'Klubb' },
      playerInformation: [{ translationKey: 'age_sentencecase', value: { numberValue: 25 } }],
      mainLeague: { leagueName: 'Liga', season: '2026/2027', stats: [{ localizedTitleId: 'rating', value: 7.1 }] },
      statSeasons: [{ seasonName: '2026/2027', tournaments: [{ name: 'Liga' }] }],
      firstSeasonStats: { topStatCard: { items: [{ localizedTitleId: 'goals', statValue: '3', per90: 0.3, percentileRankPer90: 80 }] } },
      recentMatches: [{ matchDate: { utcTime: '2026-09-20T12:00:00Z' }, minutesPlayed: 90, ratingProps: { rating: '7.5' }, opponentTeamName: 'Mot' }],
    });
    expect(d).toMatchObject({ id: 7, fotmobTeam: 'Klubb', info: { age: 25 }, league: { name: 'Liga', rating: 7.1 } });
    expect(d.season.stats.goals).toEqual([3, 0.3, 80]);
    expect(d.form.last5.avgRating).toBe(7.5);
    expect(d.matches[0][0]).toBe('2026-09-20');
  });

  test('collectMatches: unika nycklar, Oddset inom dagarna och kupongernas kommande matcher', async () => {
    const { collectMatches } = await lib('startelva.mjs');
    const list = collectMatches({ days: 4 });
    for (const m of list) expect(m.key && m.home && m.away).toBeTruthy();
    expect(new Set(list.map((m: any) => m.key)).size).toBe(list.length);
    const st = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stryktipset.json'), 'utf8'));
    const upcoming = (st.products || []).flatMap((p: any) => p.events.filter((e: any) => Date.parse(e.kickoff) > Date.now()));
    expect(list.filter((m: any) => m.key.startsWith('svs|')).length).toBeGreaterThanOrEqual(upcoming.length);
  });
});

test.describe('referee-streaks: domarstatistik per liga (panelen Domare)', () => {
  // Liga X: domare A Taylor 2 matcher (6 gula, 30 frisparkar), M Oliver 2 matcher (2 gula, 20 frisparkar)
  const m = (d: string, h: string, a: string, hg: number, ag: number, r: string, y: number, f: number, lg = 'PL') =>
    ({ d, lg, h, a, hg, ag, r, hy: y / 2, ay: y / 2, hr: 0, ar: 0, hf: f / 2, af: f / 2 });
  const rows = [
    m('2025-08-10', 'Arsenal', 'Leeds', 2, 0, 'A Taylor', 6, 30),
    m('2025-09-10', 'Leeds', 'Arsenal', 1, 1, 'A Taylor', 6, 30),
    m('2025-10-10', 'Chelsea', 'Leeds', 0, 1, 'M Oliver', 2, 20),
    m('2026-08-20', 'Arsenal', 'Chelsea', 3, 1, 'M Oliver', 2, 20),
    m('2020-01-01', 'Arsenal', 'Leeds', 1, 0, 'H Webb', 2, 20), // utanfor perioden
    m('2025-08-11', 'Ipswich', 'Leeds', 1, 0, 'S Allison', 4, 24, 'CH'),
  ];

  test('parseRefereeCsv tar med gula, roda och frisparkar nar de finns', async () => {
    const { parseRefereeCsv } = await lib('referee-streaks.mjs');
    const csv = 'Div,Date,HomeTeam,AwayTeam,FTHG,FTAG,Referee,HF,AF,HY,AY,HR,AR\nE0,16/08/2025,Liverpool,Bournemouth,4,2,A Taylor,10,12,1,3,0,1\nE0,17/08/2025,Arsenal,Leeds,1,0,M Oliver,,,,,,';
    const [a, b] = parseRefereeCsv(csv, 'PL');
    expect(a).toMatchObject({ hy: 1, ay: 3, hr: 0, ar: 1, hf: 10, af: 12 });
    expect(b.hy).toBeUndefined();
  });

  test('disciplineStats och vsAverage: snitt per match och skillnad mot ligan', async () => {
    const { disciplineStats, vsAverage } = await lib('referee-streaks.mjs');
    const st = disciplineStats(rows.slice(0, 4));
    expect(st).toMatchObject({ matches: 4, yellowPg: 4, foulsPg: 25, homeWinRate: 0.5, drawRate: 0.25, awayWinRate: 0.25 });
    expect(vsAverage(6, 4)).toEqual({ diff: 2, pct: 50 });
    expect(vsAverage(3, 4)).toEqual({ diff: -1, pct: -25 });
    expect(vsAverage(null, 4)).toBeNull();
    // Matcher utan kort/frisparkar raknas inte i de snitten
    expect(disciplineStats([{ hg: 1, ag: 0 }]).yellowPg).toBeNull();
  });

  test('refereeLeagueReport: bara ligan och perioden, domare jamfors mot ligasnittet', async () => {
    const { refereeLeagueReport } = await lib('referee-streaks.mjs');
    const rep = refereeLeagueReport(rows, 'PL', { today: '2026-10-01' });
    expect(rep.since).toBe('2024-07-01');
    expect(rep.leagueAvg).toMatchObject({ matches: 4, yellowPg: 4, foulsPg: 25 });
    expect(rep.referees.map((r: any) => r.referee).sort()).toEqual(['A Taylor', 'M Oliver']);
    const at = rep.referees.find((r: any) => r.key === 'a taylor');
    expect(at).toMatchObject({ matches: 2, yellowPg: 6, foulsPg: 30, yellowVsAvg: { diff: 2, pct: 50 }, foulsVsAvg: { diff: 5, pct: 20 } });
    const mo = rep.referees.find((r: any) => r.key === 'm oliver');
    expect(mo.yellowVsAvg).toEqual({ diff: -2, pct: -50 });
  });

  test('refereePanel: tillsatt domare (FotMob-namn) med lagens facit + tabell over alla domare', async () => {
    const { refereePanel, buildRefIndex } = await lib('referee-streaks.mjs');
    const idx = buildRefIndex(rows);
    const p = refereePanel({ matches: rows, index: idx, league: 'PL', home: 'Arsenal', away: 'Leeds United', referee: 'Anthony Taylor', today: '2026-10-01' });
    expect(p.teams).toEqual({ home: 'Arsenal', away: 'Leeds' });
    expect(p.referee).toMatchObject({ referee: 'Anthony Taylor', key: 'a taylor', otherLeagues: false, matches: 2, yellowPg: 6, yellowVsAvg: { pct: 50 } });
    expect(p.referee.home).toMatchObject({ team: 'Arsenal', record: { w: 1, d: 1, l: 0 }, yellowPg: 3 });
    expect(p.referee.away).toMatchObject({ team: 'Leeds', record: { w: 0, d: 1, l: 1 } });
    const row = p.referees.find((r: any) => r.key === 'm oliver');
    expect(row.home).toEqual({ matches: 1, w: 1, d: 0, l: 0 });
    expect(row.away).toEqual({ matches: 1, w: 1, d: 0, l: 0 });
    // Ingen domare tillsatt: bara tabellen; domare ny i ligan: profil fran andra ligor
    expect(refereePanel({ matches: rows, index: idx, league: 'PL', home: 'Arsenal', away: 'Leeds', today: '2026-10-01' }).referee).toBeNull();
    const nu = refereePanel({ matches: rows, index: idx, league: 'PL', home: 'Arsenal', away: 'Leeds', referee: 'Sam Allison', today: '2026-10-01' });
    expect(nu.referee).toMatchObject({ otherLeagues: true, matches: 1, yellowPg: 4, foulsPg: 24 });
  });

  test('refereeLeagueSeasons: årets säsong som standard, äldre säsonger valbara, matcherna för domarens lista', async () => {
    const { refereeLeagueSeasons, refereeSeasons } = await lib('referee-streaks.mjs');
    const s = refereeSeasons('PL', '2026-10-01');
    expect(s.current).toBe('2026');
    expect(s.seasons.map((x: any) => x.id)).toEqual(['2026', '2025', '2024', '2023', '2022', 'all']);
    expect(s.seasons[0]).toMatchObject({ label: '2026/27', since: '2026-07-01', until: '2027-06-30' });
    expect(refereeSeasons('AS', '2026-10-01').seasons[1]).toMatchObject({ id: '2025', label: '2025', since: '2025-01-01', until: '2025-12-31' });

    const p = refereeLeagueSeasons(rows, 'PL', { today: '2026-10-01' });
    // Toppnivån = innevarande säsong: bara M Oliver har dömt 2026/27
    expect(p.season).toBe('2026');
    expect(p.referees.map((r: any) => r.referee)).toEqual(['M Oliver']);
    expect(p.leagueAvg.matches).toBe(1);
    // Förra säsongen: A Taylor 2 matcher, M Oliver 1 – snitt mot den säsongens liga
    const prev = p.reports['2025'];
    expect(prev.leagueAvg.matches).toBe(3);
    expect(prev.referees.find((r: any) => r.key === 'a taylor')).toMatchObject({ matches: 2, yellowVsAvg: { pct: 28 } }); // 6 mot 4,67
    // Tre säsonger = samma som den gamla rapporten; säsonger utan matcher visas inte i valet
    expect(p.reports.all.leagueAvg.matches).toBe(4);
    expect(p.seasons.map((x: any) => x.id)).toEqual(['2026', '2025', 'all']);
    // Matcherna: nyast först, domarnyckel, kort och resultat (H Webb 2020 ligger utanför fem säsonger, CH-matchen är annan liga)
    expect(p.games.map((g: any) => g.d)).toEqual(['2026-08-20', '2025-10-10', '2025-09-10', '2025-08-10']);
    expect(p.games[0]).toMatchObject({ h: 'Arsenal', a: 'Chelsea', hg: 3, ag: 1, k: 'm oliver', hy: 1, ay: 1, hr: 0, ar: 0 });
  });

  test('refereePanel: domarens alla matcher med vardera laget och lagens facit mot alla säsongers domare', async () => {
    const { refereePanel, buildRefIndex } = await lib('referee-streaks.mjs');
    const idx = buildRefIndex(rows);
    const p = refereePanel({ matches: rows, index: idx, league: 'PL', home: 'Arsenal', away: 'Leeds United', referee: 'Anthony Taylor', today: '2026-10-01' });
    // Nyast först, ur lagets perspektiv: inbördes mötena syns för båda lagen
    expect(p.referee.home.games).toEqual([
      { date: '2025-09-10', league: 'PL', opp: 'Leeds', home: false, score: '1-1', res: 'D', yc: 3 },
      { date: '2025-08-10', league: 'PL', opp: 'Leeds', home: true, score: '2-0', res: 'W', yc: 3 },
    ]);
    expect(p.referee.away.games.map((g: any) => `${g.score} ${g.res}`)).toEqual(['1-1 D', '0-2 L']);
    expect(p.teamRecs['m oliver']).toEqual({ home: { matches: 1, w: 1, d: 0, l: 0 }, away: { matches: 1, w: 1, d: 0, l: 0 } });
    expect(p.teamRecs['a taylor'].home).toEqual({ matches: 2, w: 1, d: 1, l: 0 });
    expect(p.teamRecs['h webb']).toBeUndefined(); // 2020: utanför säsongsvalet
  });
});

test.describe('referee-streaks: FotMob, straffar och alla ligor', () => {
  const md = (over: any = {}) => ({
    general: { homeTeam: { id: 1 }, awayTeam: { id: 2 } },
    content: {
      matchFacts: { infoBox: { Referee: { text: 'Glenn Nyberg' } }, events: { events: [] } },
      stats: { Periods: { All: { stats: [{ stats: [{ key: 'yellow_cards', stats: [2, 3] }, { key: 'yellow_cards', stats: [9, 9] }, { key: 'red_cards', stats: [0, 1] }, { key: 'fouls', stats: [12, 14] }] }] } } },
      shotmap: { shots: [
        { situation: 'Penalty', teamId: 1, period: 'FirstHalf', eventType: 'Goal' },
        { situation: 'Penalty', teamId: 2, period: 'SecondHalf', eventType: 'AttemptSaved' },
        { situation: 'Penalty', teamId: 2, period: 'PenaltyShootout', eventType: 'Goal' },
        { situation: 'RegularPlay', teamId: 1, period: 'FirstHalf', eventType: 'Miss' },
      ] },
      ...over,
    },
  });
  const fx = { id: 99, home: { name: 'Djurgården' }, away: { name: 'Malmö FF' }, status: { utcTime: '2026-05-01T15:00:00Z', scoreStr: '2 - 1' } };

  test('rowFromFotmob: domare, mål, första värdet per stat, straffar utan straffläggning', async () => {
    const { rowFromFotmob } = await lib('referee-streaks.mjs');
    expect(rowFromFotmob(md(), fx, 'AS')).toEqual({ id: '99', d: '2026-05-01', lg: 'AS', h: 'Djurgården', a: 'Malmö FF', hg: 2, ag: 1, r: 'Glenn Nyberg', hy: 2, ay: 3, hr: 0, ar: 1, hf: 12, af: 14, hp: 1, ap: 1 });
    expect(rowFromFotmob(md(), { ...fx, status: { ...fx.status, scoreStr: '' } }, 'AS')).toBeNull();
  });

  test('penaltiesFromFotmob: utan skottkarta räknas straffmål och missade straffar i händelserna', async () => {
    const { penaltiesFromFotmob } = await lib('referee-streaks.mjs');
    const ev = { matchFacts: { events: { events: [
      { type: 'Goal', goalDescriptionKey: 'penalty', isHome: true },
      { type: 'MissedPenalty', isHome: true },
      { type: 'Goal', goalDescriptionKey: 'header', isHome: false },
      { type: 'Goal', goalDescriptionKey: 'penalty', isHome: false, isPenaltyShootoutEvent: true },
    ] } } };
    expect(penaltiesFromFotmob({ general: { homeTeam: { id: 1 } }, content: { shotmap: { shots: [] }, ...ev } })).toEqual([2, 0]);
    expect(penaltiesFromFotmob({ content: {} })).toBeNull();
  });

  test('attachPenalties: England får straffar från FotMob via liga + dag + domare', async () => {
    const { attachPenalties } = await lib('referee-streaks.mjs');
    const fd = [{ d: '2026-09-20', lg: 'PL', h: 'Man City', a: 'Arsenal', hg: 1, ag: 1, r: 'M Oliver' }, { d: '2026-09-20', lg: 'PL', h: 'Leeds', a: 'Spurs', hg: 0, ag: 0, r: 'A Taylor' }];
    const fm = [{ d: '2026-09-20', lg: 'PL', h: 'Manchester City', a: 'Arsenal', r: 'Michael Oliver', hp: 1, ap: 0 }];
    const out = attachPenalties(fd, fm);
    expect(out[0]).toMatchObject({ h: 'Man City', hp: 1, ap: 0 });
    expect(out[1].hp).toBeUndefined();
  });

  test('loadRefereeMatches: football-data + FotMob, FotMob-rader för England dubbleras inte', async () => {
    const { loadRefereeMatches, hasRefereeData } = await lib('referee-streaks.mjs');
    const files: Record<string, any> = {
      'data/open/referee_history.json': { bySeason: { '2627|E0': [{ d: '2026-09-20', lg: 'PL', h: 'Man City', a: 'Arsenal', hg: 1, ag: 1, r: 'M Oliver' }] } },
      'data/open/referee_fotmob.json': { leagues: {
        PL: { matches: { 1: { d: '2026-09-20', lg: 'PL', h: 'Manchester City', a: 'Arsenal', hg: 1, ag: 1, r: 'Michael Oliver', hp: 2, ap: 0 } } },
        AS: { matches: { 2: { d: '2026-05-01', lg: 'AS', h: 'Djurgården', a: 'Malmö FF', hg: 2, ag: 1, r: 'Glenn Nyberg', hp: 0, ap: 1 }, 3: { d: '2026-05-02', lg: 'AS', h: 'AIK', a: 'IFK Göteborg', hg: 0, ag: 0, r: null } } },
      } },
    };
    const all = loadRefereeMatches((rel: string) => files[rel] ?? null, []);
    expect(all.length).toBe(2);
    expect(all.find((m: any) => m.lg === 'PL')).toMatchObject({ h: 'Man City', hp: 2 });
    expect(hasRefereeData(all, 'AS', '2026-10-01')).toBe(true);
    expect(hasRefereeData(all, 'SE2', '2026-10-01')).toBe(false);
  });

  test('England: premierleague.com gäller alltid, efl.com bara när FotMob håller med; straffar behålls', async () => {
    const { loadRefereeMatches } = await lib('referee-streaks.mjs');
    const fd = { bySeason: { x: [
      { d: '2026-02-01', lg: 'PL', h: "Nott'm Forest", a: 'Crystal Palace', hg: 1, ag: 1, r: 'M Salisbury', hy: 2, ay: 3 },
      { d: '2026-02-01', lg: 'PL', h: 'Man City', a: 'Man United', hg: 2, ag: 0, r: 'A Taylor' },
      { d: '2025-11-29', lg: 'CH', h: 'Stoke', a: 'Hull', hg: 0, ag: 0, r: 'L Doughty' },
      { d: '2025-10-18', lg: 'CH', h: 'Oxford', a: 'Derby', hg: 1, ag: 2, r: 'J Bell' },
      { d: '2025-12-13', lg: 'CH', h: 'Middlesbrough', a: 'QPR', hg: 1, ag: 0, r: 'J Smith' },
    ] } };
    const fm = { leagues: { PL: { matches: { 1: { d: '2026-02-01', lg: 'PL', h: 'Nottingham Forest', a: 'Crystal Palace', hg: 1, ag: 1, r: 'Michael Salisbury', hp: 1, ap: 0 } } },
      CH: { matches: {
        2: { d: '2025-11-29', lg: 'CH', h: 'Stoke City', a: 'Hull City', r: 'Joshua Smith' },
        3: { d: '2025-10-18', lg: 'CH', h: 'Oxford United', a: 'Derby County', r: 'James Bell' },
        4: { d: '2025-12-13', lg: 'CH', h: 'Middlesbrough', a: 'Queens Park Rangers', r: 'Joshua Smith' },
      } } } };
    const eng = { matches: {
      a: { src: 'pl', d: '2026-02-01', lg: 'PL', h: 'Nottingham Forest', a: 'Crystal Palace', r: 'Tony Harrington', var: 'Darren England' },
      b: { src: 'pl', d: '2026-02-01', lg: 'PL', h: 'Manchester City', a: 'Manchester United', r: 'Anthony Taylor' },
      c: { src: 'efl', d: '2025-11-29', lg: 'CH', h: 'Stoke City', a: 'Hull City', r: 'Josh Smith' },
      d: { src: 'efl', d: '2025-10-18', lg: 'CH', h: 'Oxford United', a: 'Derby County', r: 'Gavin Ward' },
      e: { src: 'efl', d: '2025-12-13', lg: 'CH', h: 'Middlesbrough', a: 'Queens Park Rangers', r: 'David Webb' },
    } };
    const files: Record<string, any> = { 'data/open/referee_history.json': fd, 'data/open/referee_fotmob.json': fm, 'data/open/referee_england.json': eng };
    const all = loadRefereeMatches((rel: string) => files[rel] ?? null, []);
    const by = (h: string) => all.find((m: any) => m.h === h);
    // PL: officiellt namn och VAR; straffen (kopplad via football-datas domare) och korten finns kvar
    expect(by("Nott'm Forest")).toMatchObject({ r: 'Tony Harrington', var: 'Darren England', hp: 1, hy: 2 });
    expect(by('Man City').r).toBe('Anthony Taylor');
    // CH: efl.com + FotMob mot football-data -> rättas
    expect(by('Stoke').r).toBe('Josh Smith');
    // CH: FotMob håller med football-data -> oförändrat
    expect(by('Oxford').r).toBe('J Bell');
    // CH: efl.com ensam (FotMob säger football-datas domare) -> oförändrat
    expect(by('Middlesbrough').r).toBe('J Smith');
  });

  test('Officiella källor: namn översätts till FotMobs stavning, ett lag räcker, Superettan fristående', async () => {
    const { applyOfficialReferees, loadRefereeMatches, refereeLeagueReport, disciplineFromEvents } = await lib('referee-streaks.mjs');
    const fm = (d: string, h: string, a: string, r: string | null) => ({ d, lg: 'LL2', h, a, hg: 1, ag: 0, r });
    const rows = [
      fm('2026-08-14', 'Real Sociedad B', 'Castellon', 'Iván Caparrós'),
      fm('2026-08-21', 'Leganes', 'Malaga', 'Iván Caparrós'),
      fm('2026-08-28', 'Eibar', 'Huesca', null),
      fm('2026-09-04', 'Cadiz', 'Zaragoza', 'Rafael Sánchez'),
    ];
    const off = [
      // Fullständigt namn hos laliga.com; "R. Sociedad B" matchar inte, men Castellón gör det
      { d: '2026-08-14', lg: 'LL2', h: 'R. Sociedad B', a: 'CD Castellón', r: 'Iván Caparrós Hernández' },
      { d: '2026-08-21', lg: 'LL2', h: 'CD Leganés', a: 'Málaga CF', r: 'Iván Caparrós Hernández' },
      { d: '2026-08-28', lg: 'LL2', h: 'SD Eibar', a: 'SD Huesca', r: 'Iván Caparrós Hernández' },
      // Annan domare än FotMob -> rättas (officiellt namn när FotMob inte känner domaren)
      { d: '2026-09-04', lg: 'LL2', h: 'Cádiz CF', a: 'Real Zaragoza', r: 'Eder Mallo Fernández' },
    ];
    const out = applyOfficialReferees(rows, off);
    expect(out.map((m: any) => m.r)).toEqual(['Iván Caparrós', 'Iván Caparrós', 'Iván Caparrós', 'Eder Mallo Fernández']);
    // Vanliga efternamn räcker inte för att anse två namn vara samma domare
    const br = applyOfficialReferees([{ d: '2026-05-01', lg: 'BR', h: 'Santos', a: 'Bahia', hg: 0, ag: 0, r: null },
      { d: '2026-04-01', lg: 'BR', h: 'Gremio', a: 'Vitoria', hg: 0, ag: 0, r: 'Paulo Roberto Silva' }],
    [{ d: '2026-05-01', lg: 'BR', h: 'Santos FC', a: 'Bahia', r: 'Paulo Cesar Zanovelli da Silva' }]);
    expect(br[0].r).toBe('Paulo Cesar Zanovelli da Silva');
    // Superettan: inga FotMob-rader -> officiella rader med resultat och kort används direkt
    const se2 = { matches: { 1: { id: '1', v: 2, d: '2026-05-01', lg: 'SE2', h: 'Helsingborgs IF', a: 'Östers IF', hg: 4, ag: 1, r: 'Farouk Nehdi', ...disciplineFromEvents([{ type: 'WARNING', byHomeTeam: false }, { type: 'PENALTY_KICK', byHomeTeam: true }, { type: 'PENALTY', byHomeTeam: true }]) } } };
    const all = loadRefereeMatches((rel: string) => (rel === 'data/open/referee_allsvenskan.json' ? se2 : null), []);
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ lg: 'SE2', r: 'Farouk Nehdi', hy: 0, ay: 1, hr: 1, ar: 0, hp: 1, ap: 0 });
    expect(refereeLeagueReport(all, 'SE2', { today: '2026-10-02' }).referees[0]).toMatchObject({ referee: 'Farouk Nehdi', matches: 1 });
  });

  test('Allsvenskan: domare från allsvenskan.se fyller luckor och rättar FotMob, kort behålls', async () => {
    const { loadRefereeMatches, applyOfficialReferees, refereeLeagueReport } = await lib('referee-streaks.mjs');
    const fm = { leagues: { AS: { matches: {
      1: { d: '2026-05-10', lg: 'AS', h: 'AIK', a: 'Djurgården', hg: 1, ag: 1, r: 'Mohammed Nasser Ahmed', hy: 3, ay: 2 },
      2: { d: '2026-04-05', lg: 'AS', h: 'AIK', a: 'Halmstads BK', hg: 2, ag: 0, r: null, hy: 1, ay: 4 },
      3: { d: '2025-04-14', lg: 'AS', h: 'AIK', a: 'Malmö FF', hg: 0, ag: 1, r: 'Joakim Östling', hy: 2, ay: 2 },
      4: { d: '2026-06-01', lg: 'AS', h: 'Häcken', a: 'Mjällby', hg: 3, ag: 1, r: 'Joakim Sars', hy: 0, ay: 1 },
    } } } };
    // allsvenskan.se: UTC-datum kan vara dagen innan, lagnamnen skrivs med förkortningar
    const off = { matches: {
      a: { d: '2026-05-09', lg: 'AS', h: 'AIK', a: 'Djurgårdens IF', r: 'Mohammed Al-Hakim' },
      b: { d: '2026-04-05', lg: 'AS', h: 'AIK', a: 'Halmstads BK', r: 'Adam Ladebäck' },
      c: { d: '2026-04-05', lg: 'AS', h: 'IFK Göteborg', a: 'IF Elfsborg', r: 'Victor Wolf' },
    } };
    const files: Record<string, any> = { 'data/open/referee_fotmob.json': fm, 'data/open/referee_allsvenskan.json': off };
    const all = loadRefereeMatches((rel: string) => files[rel] ?? null, []);
    expect(all.length).toBe(4);
    expect(all.find((m: any) => m.d === '2026-05-10')).toMatchObject({ r: 'Mohammed Al-Hakim', hy: 3 });
    expect(all.find((m: any) => m.d === '2026-04-05')).toMatchObject({ r: 'Adam Ladebäck', ay: 4 });
    // Utan officiell data: oförändrat
    expect(applyOfficialReferees([fm.leagues.AS.matches[1]], [])[0].r).toBe('Mohammed Nasser Ahmed');
    // Joakim Östling heter numera Sars: en rad, nuvarande namnet visas
    const rep = refereeLeagueReport(all, 'AS', { today: '2026-10-02' });
    const sars = rep.referees.filter((r: any) => /Sars|Östling/.test(r.referee));
    expect(sars).toHaveLength(1);
    expect(sars[0]).toMatchObject({ referee: 'Joakim Sars', matches: 2 });
  });

  test('refereeLeagueReport: kalenderårsliga (Allsvenskan) och straffar/röda mot snittet, Ettan delar nyckel', async () => {
    const { refereeLeagueReport, refLeagueKey, disciplineStats } = await lib('referee-streaks.mjs');
    expect(refLeagueKey('SE3N')).toBe('SE3');
    expect(refLeagueKey('SE3S')).toBe('SE3');
    expect(refLeagueKey('AS')).toBe('AS');
    const r = (d: string, ref: string, hp: number, hr: number) => ({ d, lg: 'AS', h: 'A', a: 'B', hg: 1, ag: 0, r: ref, hy: 1, ay: 1, hr, ar: 0, hf: 10, af: 10, hp, ap: 0 });
    const rows = [r('2024-04-01', 'Glenn Nyberg', 1, 0), r('2025-05-01', 'Glenn Nyberg', 1, 1), r('2026-06-01', 'Kristoffer Karlsson', 0, 0), r('2026-07-01', 'Kristoffer Karlsson', 0, 0), r('2023-12-01', 'Gammal Domare', 3, 3)];
    const rep = refereeLeagueReport(rows, 'AS', { today: '2026-10-01' });
    expect(rep.calendar).toBe(true);
    expect(rep.since).toBe('2024-01-01');
    expect(rep.leagueAvg).toMatchObject({ matches: 4, penaltyPg: 0.5, penaltyTotal: 2, redPg: 0.25, redTotal: 1, yellowTotal: 8 });
    const gn = rep.referees.find((x: any) => x.key === 'g nyberg');
    expect(gn).toMatchObject({ matches: 2, penaltyPg: 1, penaltyTotal: 2, penaltyVsAvg: { pct: 100 }, redVsAvg: { pct: 100 } });
    expect(rep.referees.some((x: any) => x.referee === 'Gammal Domare')).toBe(false);
    expect(disciplineStats([{ hg: 0, ag: 0 }]).penaltyPg).toBeNull();
  });
});

// ---------- gui/public/stryk-engine.js (webbens kupongmotor) ----------

test.describe('stryk-engine: kupong A, B och C', () => {
  const dataFile = path.join(ROOT, 'data', 'stryktipset.json');
  const products: any[] = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')).products ?? [] : [];
  const engine = () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-engine.js')).href);
  const spikes = (c: any) => c.picks.filter((x: any) => x.signs.length === 1).length;

  test('2-4 spikar per kupong och B har aldrig samma tecken som A (inte ens spiken)', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    test.setTimeout(300_000);
    const { generateCoupons, skrallOk } = await engine();
    for (const p of products.slice(0, 2)) {
      const { A, B, C } = generateCoupons(p, {});
      const at = `${p.product} ${p.drawNumber}`;
      expect(A && B, at).toBeTruthy();
      for (const [name, c] of [['A', A], ['B', B], ['C', C]] as const) {
        if (!c) continue;
        expect(spikes(c), `${at} ${name}: minst 2 spikar`).toBeGreaterThanOrEqual(2);
        expect(spikes(c), `${at} ${name}: högst 4 spikar`).toBeLessThanOrEqual(4);
        // Minst 3 helgarderingar (användarens regel 2026-10-02)
        expect(c.picks.filter((x: any) => x.signs.length === 3).length, `${at} ${name}: minst 3 helgarderingar`).toBeGreaterThanOrEqual(3);
        // Spik på en match som inte bedömts som spikbar (reserv) bara för att nå 2 spikar, aldrig fler
        // Skrällspik (högst en, runt 40 % med värde mot folket) räknas inte som reserv
        const sysE = (e: any) => ({ final: e.spik?.used ? e.spik.sysP : e.final, folk: e.folk });
        const notSpikbar = c.picks.map((x: any, i: number) => x.signs.length === 1 && p.events[i].spik?.used && !(p.events[i].spik.spikbar && p.events[i].spik.fav === x.signs));
        const skrall = c.picks.filter((x: any, i: number) => notSpikbar[i] && skrallOk(sysE(p.events[i]), '1X2'.indexOf(x.signs))).length;
        expect(skrall, `${at} ${name}: högst en skrällspik`).toBeLessThanOrEqual(1);
        const reserve = notSpikbar.filter(Boolean).length - skrall;
        // Undantag (2026-10-02): gick systemet inte in på 30 000–50 000 kr får fler favoriter spikas (högst 4)
        if (reserve > 0 && !c.relaxed.some((t: string) => t.includes('minskades strecken'))) expect(spikes(c), `${at} ${name}: reservspikar bara upp till 2`).toBe(2);
      }
      A.picks.forEach((x: any, i: number) => expect(B.picks[i].signs, `${at} match ${i + 1}`).not.toBe(x.signs));
    }
  });

  // Användarens Gambling Cabin-bild 2026-10-02: 13 halvgarderingar, gula 8–11 + gröna 4–7 lämnar 1 tecken till rött
  // (0 = grön, 1 = gul, 2 = röd; tecken 0/1/2 = 1/X/2, oanvänt tecken får gul)
  const gcSets = [[1, 2], [1, 2], [0, 1], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [0, 1], [0, 1], [0, 2], [0, 1]];
  const gcColors = [[1, 1, 0], [1, 1, 0], [0, 2, 1], [1, 1, 1], [1, 1, 1], [0, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [0, 1, 1], [0, 2, 1], [0, 1, 1], [0, 1, 1]];
  const reachable = (rule: number[][], triples: number[][]) =>
    [0, 1, 2].every((c) => [0, 1].every((j) => triples.some((t) => t[c] === rule[c][j] && [0, 1, 2].every((o) => t[o] >= rule[o][0] && t[o] <= rule[o][1]))));

  for (const [name, load] of [
    ['stryk-engine.js', () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-engine.js')).href)],
    ['fetch-stryktipset.mjs', () => import(pathToFileURL(path.join(ROOT, 'scripts', 'fetch-stryktipset.mjs')).href)],
  ] as const) {
    test(`fitColorRule (${name}): röd max går att nå – gult/grönt min sänks, inga döda gränser`, async () => {
      const { colorTriples, fitColorRule } = await load();
      const triples = colorTriples(gcSets, gcColors);
      expect(triples.every((t: number[]) => t[0] + t[1] + t[2] === 13)).toBe(true);
      // Utan justering: högst 1 röd går att få med gröna 4–7, gula 8–11
      const before = [[4, 7], [8, 11], [0, 2]];
      expect(Math.max(...triples.filter((t: number[]) => t[0] >= 4 && t[0] <= 7 && t[1] >= 8 && t[1] <= 11).map((t: number[]) => t[2]))).toBe(1);
      const fit = fitColorRule(before, triples);
      expect(fit[2][1], 'röd max 2 ska gå att nå').toBe(2);
      expect(fit[1][0], 'gult min (högst min) sänks först').toBe(7);
      expect(fit[0][0], 'grönt min orört').toBe(4);
      expect(reachable(fit, triples), JSON.stringify(fit)).toBe(true);
      // Redan sammanhängande regel ändras inte, och fitColorRule är idempotent
      expect(fitColorRule(fit, triples)).toEqual(fit);
      // Röd max större än antalet röda tecken som finns dras in till 2
      expect(fitColorRule([[0, 13], [0, 13], [0, 9]], triples)[2][1]).toBe(2);
      // Spikar räknas inte: med spik på match 1 är summan 12
      const withSpik = colorTriples([[2], ...gcSets.slice(1)], gcColors);
      expect(withSpik.every((t: number[]) => t[0] + t[1] + t[2] === 12)).toBe(true);
    });
  }

  // Användarens Gambling Cabin-bild 2026-10-02 (Stryktipset 4973, kupong A): "får jag in 3 röda så kan jag få in alla
  // gröna också". Färger per match [1, X, 2] (0 grön, 1 gul, 2 röd), matcher 5 och 7 är blå halvor.
  const rgSets = [[2], [1, 2], [0, 1], [2], [0, 2], [0, 1, 2], [0, 2], [0], [2], [0, 1, 2], [0, 1], [0, 1, 2], [0, 1]];
  const rgColors = [[1, 2, 0], [1, 1, 0], [0, 2, 2], [1, 1, 1], [1, 2, 1], [0, 2, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [0, 2, 2], [0, 2, 2], [0, 1, 1], [0, 2, 2]];
  for (const [name, load] of [
    ['stryk-engine.js', () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-engine.js')).href)],
    ['fetch-stryktipset.mjs', () => import(pathToFileURL(path.join(ROOT, 'scripts', 'fetch-stryktipset.mjs')).href)],
  ] as const) {
    test(`redGreenRows (${name}): 3 röda + högst 1 gul + resten gröna`, async () => {
      const { redGreenRows, redGreenColors } = await load();
      const blue = new Set([4, 6]);
      // Utan gul: 5 matcher med rött tecken, 3 av dem röda (match 10 har två röda tecken) x 2 x 2 blå halvor = 16 x 4
      const pure: string[] = redGreenRows(rgSets, rgColors, blue, 3, 0);
      expect(pure.length).toBe(64);
      expect(pure).toContain('22X21X1121X11');
      expect(pure.every((r) => r[1] === '2' && r[11] === '1')).toBe(true);
      // Med högst 1 gul (användaren 2026-10-02: "om 3 röda går in och en gul då kan jag inte få 13 rätt")
      const rows: string[] = redGreenRows(rgSets, rgColors, blue);
      expect(rows.length).toBe(284);
      expect(new Set(rows).size).toBe(284);
      pure.forEach((r) => expect(rows).toContain(r));
      expect(rows, 'gul X på match 12').toContain('22X21X1121XX1');
      expect(rows, 'två gula').not.toContain('2XX21X1121XX1');
      expect(redGreenColors(rgSets, rgColors, blue)).toEqual([[4, 0, 3], [3, 1, 3]]);
      // Tre gröna halvor till (match 4, 8, 9): 7 gröna med 3 röda – grön 3–6 skulle stoppa dem
      const more = rgSets.map((x, i) => ([3, 7, 8].includes(i) ? [0, 2] : x));
      const moreColors = rgColors.map((x, i) => ([3, 7, 8].includes(i) ? [0, 1, 1] : x));
      expect(redGreenColors(more, moreColors, blue)).toEqual([[7, 0, 3], [6, 1, 3]]);
      // Inga röda tecken i garderingarna: inga krav
      expect(redGreenRows(rgSets.map((x, i) => ([2, 5, 9, 10, 12].includes(i) ? [0] : x)), rgColors, blue)).toEqual([]);
      // Bara 2 röda garderingar: röd max = 2
      expect(redGreenColors(rgSets.map((x, i) => ([9, 10, 12].includes(i) ? [0] : x)), rgColors, blue)).toEqual([[2, 0, 2], [1, 1, 2]]);
    });
  }

  for (const [name, load] of [
    ['stryk-engine.js', () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-engine.js')).href)],
    ['fetch-stryktipset.mjs', () => import(pathToFileURL(path.join(ROOT, 'scripts', 'fetch-stryktipset.mjs')).href)],
  ] as const) {
    test(`colorRuleOk (${name}): aldrig exakt antal och aldrig samma fönster för två färger`, async () => {
      const { colorRuleOk, colorsPresent } = await load();
      // Användarens Gambling Cabin-bild 2026-10-02: gul 2–2, röd 2–2, grön 3–3
      expect(colorRuleOk([[3, 3], [2, 2], [2, 2]])).toBe(false);
      expect(colorRuleOk([[3, 4], [2, 3], [2, 3]]), 'gul och röd samma fönster').toBe(false);
      expect(colorRuleOk([[3, 5], [1, 2], [2, 3]])).toBe(true);
      expect(colorRuleOk([[5, 6], [0, 1], [1, 2]])).toBe(true);
      // Färg som inte finns i garderingarna (alltid 0) räknas inte
      expect(colorsPresent([[3, 0, 1], [2, 0, 2]])).toEqual([true, false, true]);
      expect(colorRuleOk([[2, 3], [0, 0], [1, 2]], [true, false, true])).toBe(true);
      expect(colorRuleOk([[2, 3], [0, 0], [1, 2]])).toBe(false);
    });
  }

  test('skrallOk: skrällspik bara på 35–47 % med minst 3 procentenheter över folket', async () => {
    const { skrallOk } = await engine();
    const e = (final: number[], folk: number[] | null) => ({ final, folk });
    expect(skrallOk(e([0.27, 0.27, 0.46], [0.35, 0.27, 0.38]), 2), 'Burton 2: 46 % mot 38 %').toBe(true);
    expect(skrallOk(e([0.37, 0.29, 0.34], [0.45, 0.27, 0.28]), 2), '34 % räcker inte').toBe(false);
    expect(skrallOk(e([0.38, 0.30, 0.32], [0.45, 0.24, 0.31]), 0), 'under folket').toBe(false);
    expect(skrallOk(e([0.25, 0.25, 0.50], [0.30, 0.25, 0.40]), 2), 'över 47 %').toBe(false);
    expect(skrallOk(e([0.40, 0.30, 0.30], [0.38, 0.31, 0.31]), 0), 'bara 2 procentenheter').toBe(false);
    expect(skrallOk(e([0.40, 0.30, 0.30], null), 0), 'utan streck').toBe(false);
  });

  test('kuponger: färgreglernas min och max går alltid att nå i grundraden', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    test.setTimeout(300_000);
    const { generateCoupons, colorTriples, redGreenColors } = await engine();
    const col = (f: number | null | undefined) => (f == null ? 1 : f >= 0.45 ? 0 : Math.round(f * 100) <= 25 ? 2 : 1);
    for (const p of products.slice(0, 2)) {
      const out = generateCoupons(p, {});
      for (const name of ['A', 'B', 'C']) {
        const c = out[name];
        const cr = c?.rules?.colorRules;
        if (!cr) continue;
        const sets = c.picks.map((x: any) => [...x.signs].map((s: string) => '1X2'.indexOf(s)));
        const triples = colorTriples(sets, p.events.map((e: any) => [0, 1, 2].map((k) => col(e.folk?.[k]))), new Set(c.rules.blueHalves));
        // "2 halvor blå alltid" (2026-10-02): minst 2 halvgarderingar och exakt 2 av dem blå
        expect(sets.filter((x: number[]) => x.length === 2).length, `${p.product} ${name}: minst 2 halvgarderingar`).toBeGreaterThanOrEqual(2);
        expect(c.rules.blueHalves.filter((i: number) => sets[i].length === 2).length, `${p.product} ${name}: exakt 2 blå halvor`).toBe(2);
        // Inga blå helgarderingar, ingen helgul helgardering och högst 2 helgula garderingar (användaren 2026-10-02)
        const allYellow = (i: number) => [0, 1, 2].every((k) => col(p.events[i].folk?.[k]) === 1);
        sets.forEach((x: number[], i: number) => { if (allYellow(i)) expect(x.length, `${p.product} ${name} match ${i + 1}: helgul helgardering`).toBeLessThan(3); });
        // Fler bara när det inte går (t.ex. B får inte spika samma tecken som A) – rules.allYellowMax säger hur många
        expect(sets.filter((x: number[], i: number) => x.length > 1 && allYellow(i)).length, `${p.product} ${name}`).toBeLessThanOrEqual(c.rules.allYellowMax ?? 2);
        c.rules.blueHalves.forEach((i: number) => expect(sets[i].length, `${p.product} ${name} match ${i + 1}`).toBe(2));
        // Färgreglerna: aldrig exakt antal (2–2) och aldrig samma fönster för två färger (färger som inte finns är av)
        const on = ['green', 'yellow', 'red'].filter((k) => !c.rules.colorsOff.includes(k));
        if (on.includes('red')) expect(cr.red, `${p.product} ${name}: röd alltid 1–3`).toEqual([1, 3]);
        if (on.includes('green')) expect(cr.green, `${p.product} ${name}: grön alltid 3–6`).toEqual([3, 6]);
        expect(c.relaxed.some((t: string) => t.includes('grön 3–6')), `${p.product} ${name}: fasta färger hölls`).toBe(false);
        // Gult skär aldrig bort rader (2026-10-02) om inte 30 000–50 000 kr kräver det (rules.yellowFull false, står i kupongen)
        if (on.includes('yellow')) {
          const ys = triples.filter((t: number[]) => t[0] >= cr.green[0] && t[0] <= cr.green[1] && t[2] >= cr.red[0] && t[2] <= cr.red[1]).map((t: number[]) => t[1]);
          if (c.rules.yellowFull !== false) {
            expect(cr.yellow[0], `${p.product} ${name}: gul min`).toBe(Math.min(...ys));
            expect(cr.yellow[1], `${p.product} ${name}: gul max`).toBeGreaterThanOrEqual(Math.max(...ys));
          } else expect(c.relaxed.some((t: string) => t.includes('gulregeln skär')), `${p.product} ${name}`).toBe(true);
        }
        // 3 röda + resten gröna stoppas aldrig av färgreglerna (användaren 2026-10-02), annars mindre system
        const rgc = redGreenColors(sets, p.events.map((e: any) => [0, 1, 2].map((k) => col(e.folk?.[k]))), new Set(c.rules.blueHalves));
        rgc.forEach((t: number[]) => expect([0, 1, 2].every((o) => t[o] >= [cr.green, cr.yellow, cr.red][o][0] && t[o] <= [cr.green, cr.yellow, cr.red][o][1]), `${p.product} ${name}: 3 röda + gröna ${t} mot ${JSON.stringify(cr)}`).toBe(true));
        expect(c.relaxed.some((t: string) => t.includes('3 röda + resten gröna')), `${p.product} ${name}`).toBe(false);
        on.forEach((k, j) => {
          expect(cr[k][1], `${p.product} ${name} ${k}: inte exakt ${cr[k].join('–')}`).toBeGreaterThan(cr[k][0]);
          on.slice(j + 1).forEach((o) => expect(cr[o].join(), `${p.product} ${name}: ${k} och ${o} samma fönster`).not.toBe(cr[k].join()));
        });
        // Länken: gränsen 30 000–50 000 kr när den kunde hållas, aldrig tak
        if (c.rules.payoutExact === true) expect(c.rules.payoutMin, `${p.product} ${name}`).toBeLessThanOrEqual(c.rules.payoutMinReal * 50 / 30 + 1);
        expect(c.gamblingCabinUrl, `${p.product} ${name}`).toContain(',100000000');
        // Röd 1–3 och grön 3–6 är fasta (2026-10-02) och får ha döda gränser; gult min går alltid att nå inom regeln
        const rule = [cr.green, cr.yellow, cr.red];
        const inRule = (t: number[]) => [0, 1, 2].every((o) => t[o] >= rule[o][0] && t[o] <= rule[o][1]);
        [1].forEach((k) => [0].forEach((j) => expect(triples.some((t: number[]) => t[k] === rule[k][j] && inRule(t)), `${p.product} ${p.drawNumber} ${name}: ${JSON.stringify(cr)}`).toBe(true)));
      }
    }
  });

  test('krav i bara A: B väljer ändå andra tecken; krav i B får vara samma som A', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    test.setTimeout(300_000);
    const { generateCoupons } = await engine();
    const p = products[0];
    const e0 = p.events[0], e1 = p.events[1];
    const fav = (e: any) => ['1', 'X', '2'][e.final.indexOf(Math.max(...e.final))];
    const { A, B } = generateCoupons(p, { [e0.eventNumber]: { signs: fav(e0), scope: 'A' }, [e1.eventNumber]: { signs: '1X2', scope: 'both' } });
    expect(A.picks[0].signs).toBe(fav(e0));
    expect(B.picks[0].signs, 'krav bara i A').not.toBe(fav(e0));
    // Egna krav i B gäller även när A har samma tecken
    expect(A.picks[1].signs).toBe('1X2');
    expect(B.picks[1].signs).toBe('1X2');
    A.picks.forEach((x: any, i: number) => { if (i !== 1) expect(B.picks[i].signs, `match ${i + 1}`).not.toBe(x.signs); });
    expect(spikes(A)).toBeGreaterThanOrEqual(2);
    expect(spikes(B)).toBeGreaterThanOrEqual(2);
  });

  // Användaren 2026-10-02: "även om jag väljer själv vill jag ha min utdelning mellan 30–50k, inget max".
  // Egna skrällspikar gav förut gränsen 441 500 kr i länken – med egna krav går gränsen före röd + grön och färgreglerna.
  test('floorOrder: utan krav röd + grön först, med krav gränsen 30 000–50 000 kr först', async () => {
    const { floorOrder } = await engine();
    const free = floorOrder(false), locked = floorOrder(true);
    expect(free.slice(0, 3)).toEqual([['signs', true], ['signs', 'near'], ['signs', false]]);
    expect(locked).toEqual([['signs', true], ['colors', true], [false, true]]);
  });

  test('egna skrällspikar: gränsen i länken ligger ändå på 30 000–50 000 kr', async () => {
    const p = products.find((x) => x.product === 'stryktipset');
    test.skip(!p, 'data/stryktipset.json saknar Stryktipset');
    test.setTimeout(300_000);
    const { generateCoupons } = await engine();
    const und = (e: any) => ['1', 'X', '2'][e.final.indexOf(Math.min(...e.final))];
    for (const n of [1, 2, 3]) {
      const krav = Object.fromEntries(p.events.slice(0, n).map((e: any) => [e.eventNumber, { signs: und(e), scope: 'A' }]));
      const { A } = generateCoupons(p, krav);
      expect(A, `${n} skrällspikar`).toBeTruthy();
      expect(A.rules.payoutExact, `${n} skrällspikar: ${A.relaxed.join('; ')}`).toBe(true);
      expect(A.rules.payoutMin).toBeGreaterThanOrEqual(30000);
      expect(A.rules.payoutMin).toBeLessThanOrEqual(50000);
      expect(A.gamblingCabinUrl).toContain(`utd=1,${A.rules.payoutMin},100000000`);
      p.events.slice(0, n).forEach((e: any, i: number) => expect(A.picks[i].signs).toBe(und(e)));
      expect(A.cost).toBeGreaterThanOrEqual(350);
      expect(A.cost).toBeLessThanOrEqual(400);
    }
  });
});
