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
    // Årets statistik från en annan liga (Assadi: Primera División, nu i AIK) märks, även i nyckeltalstexten
    const chile = { stats: { minutes_played: [801], dribbles_succeeded: [15, 1.685, 75.8] }, tournament: 'Primera División', season: '2026' };
    const moved = m.statSource({ league: { name: 'Allsvenskan' }, season: chile });
    expect(moved).toMatchObject({ minutes: 801, label: 'Primera División 2026' });
    expect(m.statText(moved, 'dribbles_succeeded').text).toBe('15 lyckade dribblingar (76:e perc. i Primera División 2026)');
    expect(m.statSource({ league: { name: 'Allsvenskan' }, season: { ...chile, tournament: 'Allsvenskan' } }).label).toBeNull();
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

test.describe('team-match', () => {
  test('uniqueBest: delad etta ger null (Argentinos Juniors blir aldrig Boca Juniors)', async () => {
    const { uniqueBest } = await lib('team-match.mjs');
    const words = (n, t) => { const b = n.toLowerCase().split(' '); const a = t.toLowerCase().split(' ');
      return a.filter((w) => b.some((v) => v.startsWith(w) || w.startsWith(v))).length / a.length; };
    expect(uniqueBest('Argentinos Juniors', ['Boca Juniors', 'Argentinos Jrs', 'Tigre'], words)).toBeNull();
    expect(uniqueBest('Boca Juniors', ['Boca Juniors', 'Argentinos Jrs'], words)).toBe('Boca Juniors');
    expect(uniqueBest('Velez Sarsfield FC', ['Velez Sarsfield', 'Tigre'], words)).toBe('Velez Sarsfield');
    expect(uniqueBest('Real Madrid', ['Tigre'], words)).toBeNull();
  });

  test('buildTeamIds: FotMob-ID, samma land delar ID, cup, sok, egna ID behalls och krockar aldrig', async () => {
    const { buildTeamIds, OWN_START, isOwnId } = await lib('team-ids.mjs');
    const country = { AR: 'Argentina', PL: 'England', CH: 'England', CL: null, BR: 'Brazil' };
    const ids = buildTeamIds({
      squads: { AR: { 'Talleres Cordoba': 10101, 'Boca Juniors': 10077, 'Argentinos Jrs': 10086 }, PL: { 'Aston Villa': 10252 } },
      names: { AR: ['Boca Juniors', 'All Boys'], CH: ['Aston Villa', 'Bury'], CL: ['Aston Villa'], BR: ['Aston Villa'], PL: ['Bury'] },
      searched: { 'CH|Bury': 9895 },
      prev: { AR: { 'All Boys': OWN_START + 5 } },
      country,
    });
    expect(ids.AR['Talleres Cordoba']).toBe(10101);
    expect(ids.AR['Argentinos Jrs']).not.toBe(ids.AR['Boca Juniors']);
    expect(ids.CH['Aston Villa']).toBe(10252); // samma land
    expect(ids.CL['Aston Villa']).toBe(10252); // cup, entydigt namn
    expect(isOwnId(ids.BR['Aston Villa'])).toBe(true); // annat land delar aldrig ID
    expect(ids.CH.Bury).toBe(9895);
    expect(ids.PL.Bury).toBe(9895); // sokt ID delas inom landet
    expect(ids.AR['All Boys']).toBe(OWN_START + 5); // tidigare eget ID behalls
    expect(ids.BR['Aston Villa']).toBeGreaterThan(OWN_START + 5); // nytt eget ID krockar inte
  });

  test('clashesWith: gammal felmappad rad slangs nar laget redan spelar inom 2 dagar', async () => {
    const { clashesWith } = await lib('team-match.mjs');
    const up = [{ date: '2026-10-04', home: 'Argentinos Jrs', away: 'Tigre' }, { date: '2026-10-09', home: 'Instituto', away: 'Boca Juniors' }];
    expect(clashesWith({ date: '2026-10-04', home: 'Boca Juniors', away: 'Tigre' }, up)).toBe(true);
    expect(clashesWith({ date: '2026-10-11', home: 'Platense', away: 'Boca Juniors' }, up)).toBe(true);
    expect(clashesWith({ date: '2026-10-20', home: 'Boca Juniors', away: 'Racing Club' }, up)).toBe(false); // flyttad match behalls
  });
});

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

  test('assessMatch: favoriten byter aldrig sida (samma tecken som Oddset)', async () => {
    const { assessMatch } = await lib('stryk-calibration.mjs');
    // Aston Villa–Brentford 2026-10-10: modellen 2 (37 %), historiken sanker bortafavoriter kraftigt
    const weak = { bs: { 'borta|0.35': { n: 200, w: 40, e: 74 } }, lg: {} };
    const a = assessMatch([0.36, 0.268, 0.372], 'Premier League', weak, 0);
    expect(a.fav).toBe('2');
    expect(a.sysP.indexOf(Math.max(...a.sysP))).toBe(2);
    expect(a.sysP[2]).toBeGreaterThan(a.sysP[0]);
    expect(a.sysP.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 3);
    // Hemmafavorit som sanks: 1 forblir storst
    const h = assessMatch([0.4, 0.25, 0.35], '', { bs: { 'hemma|0.40': { n: 200, w: 40, e: 80 } }, lg: {} }, 0);
    expect(h.sysP.indexOf(Math.max(...h.sysP))).toBe(0);
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

  test('hämtar via http.mjs med formatkontroll (inget eget fetch)', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'extra-odds.mjs'), 'utf8');
    expect(src, 'extra-odds ska använda getJson från http.mjs').toMatch(/import \{[^}]*getJson[^}]*\} from '\.\/http\.mjs'/);
    expect(src.replace(/\/\/[^\n]*/g, ''), 'inget eget fetch()').not.toMatch(/(?<![\w.])fetch\(/);
    const { oddsApiSchemas } = await lib('api-schemas.mjs');
    const ev = { commence_time: '2026-10-11T14:00:00Z', home_team: 'Sweden', away_team: 'Kosovo', bookmakers: [{ key: 'pinnacle', title: 'Pinnacle', markets: [{ key: 'h2h', outcomes: [{ name: 'Sweden', price: 1.6 }, { name: 'Draw', price: 3.9 }, { name: 'Kosovo', price: 5.5 }] }] }] };
    expect(oddsApiSchemas.odds.safeParse([ev]).success).toBe(true);
    expect(oddsApiSchemas.odds.safeParse([{ ...ev, home_team: undefined }]).success, 'lagnamn saknas').toBe(false);
    expect(oddsApiSchemas.odds.safeParse({ message: 'Invalid API key' }).success, 'felsvar i stället för lista').toBe(false);
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

// ---------- stryk-miss-profile.mjs: missar per system (A, B, C) ----------

test.describe('stryk-miss-profile: missar per kupong ur bakkörningen', () => {
  test('buildSystemMissProfiles: grupper per system, skräll utan favoriten, bara valda ligor', async () => {
    const { buildSystemMissProfiles, sysGroupKey } = await lib('stryk-miss-profile.mjs');
    // Favorit 1 med 50 % -> band 1 (45–55 %); spik 2 utan favoriten = skräll
    expect(sysGroupKey('1', [0.5, 0.3, 0.2])).toBe('spik|1|1');
    expect(sysGroupKey('1X', [0.5, 0.3, 0.2])).toBe('halv|1X|1');
    expect(sysGroupKey('2', [0.5, 0.3, 0.2])).toBe('skrall|spik');
    expect(sysGroupKey('X2', [0.5, 0.3, 0.2])).toBe('skrall|halv');
    const m = (outcome: string, pickA: string, pickB: string, league = 'Premier League') => ({ outcome, final: [0.5, 0.3, 0.2], league, pickA, pickB });
    const draws = [
      { date: '2025-01-04', C: { picks: ['2', '1X2'] }, matches: [m('X', '1', '1X'), m('1', '1X2', '2')] },
      { date: '2025-01-11', C: { picks: ['2', '1'] }, matches: [m('1', '1', '1X'), m('2', '1', '2', 'Serie A')] },
    ];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sysmiss-'));
    fs.writeFileSync(path.join(dir, 'bt.json'), JSON.stringify({ draws }));
    const p = buildSystemMissProfiles(['bt.json', 'saknas.json'], { dir });
    expect(p).toMatchObject({ draws: 2, from: '2025-01-04', to: '2025-01-11', leaguesOnly: ['Premier League', 'Championship', 'League One'] });
    // A: spik 1 två gånger i PL (en miss med X); Serie A-matchen räknas inte
    expect(p.systems.A['spik|1|1']).toMatchObject({ n: 2, miss: 1, rate: 0.5, by: { 1: 0, X: 1, 2: 0 }, label: 'Spik 1 · hemmafavorit 45–55 %' });
    expect(p.systems.A['spik|1|1'].exp).toBeCloseTo(0.5, 3);
    // B: 1X två gånger utan miss; skrällspik 2 en gång (miss, kom 1)
    expect(p.systems.B['halv|1X|1']).toMatchObject({ n: 2, miss: 0 });
    expect(p.systems.B['skrall|spik']).toMatchObject({ n: 1, miss: 1, label: 'Skrällspik (inte favoriten)' });
    // C: skrällspik 2 två gånger (X och 1 kom), helgardering räknas inte
    expect(p.systems.C['skrall|spik']).toMatchObject({ n: 2, miss: 2, rate: 1 });
    expect(buildSystemMissProfiles(['saknas.json'], { dir })).toBeNull();
  });
});

// ---------- coaches.mjs ----------

test.describe('coaches: tränare per match från FotMob', () => {
  test('coachRowFromFotmob: tränare ur lineup, resultat och datum ur fixturen; coachMatches äldst först', async () => {
    const { coachRowFromFotmob, coachMatches } = await lib('coaches.mjs');
    const fx = { id: 5795363, status: { scoreStr: '3 - 0', utcTime: '2026-08-21T19:00:00Z' }, home: { name: 'Arsenal' }, away: { name: 'Coventry City' } };
    const md = { content: { lineup: { homeTeam: { coach: { id: 24011, name: 'Mikel Arteta ' } }, awayTeam: { coach: { id: 30631, name: 'Frank Lampard' } } } } };
    expect(coachRowFromFotmob(md, fx, 'PL')).toEqual({ id: '5795363', d: '2026-08-21', lg: 'PL', h: 'Arsenal', a: 'Coventry City', hg: 3, ag: 0,
      hc: { id: 24011, name: 'Mikel Arteta' }, ac: { id: 30631, name: 'Frank Lampard' } });
    // Utan lineup: matchen sparas men utan tränare; ospelad match (inget resultat) sparas inte
    expect(coachRowFromFotmob({}, fx, 'PL')).toMatchObject({ hc: null, ac: null });
    expect(coachRowFromFotmob(md, { ...fx, status: { utcTime: '2026-08-21T19:00:00Z' } }, 'PL')).toBeNull();
    const doc = { leagues: { PL: { matches: { b: { d: '2026-09-01', hc: { name: 'X' }, ac: null }, a: { d: '2026-08-01', hc: null, ac: { name: 'Y' } }, c: { d: '2026-07-01', hc: null, ac: null } } } } };
    expect(coachMatches(doc).map((m: any) => m.d)).toEqual(['2026-08-01', '2026-09-01']);
  });

  test('coachTenure: ny tränare de 5 första matcherna, kort vikariat är inget byte, första tränaren i datan är inte ny', async () => {
    const { buildCoachIndex, coachTenure, NEW_COACH } = await lib('coaches.mjs');
    expect(NEW_COACH).toEqual({ matches: 5, shift: [-0.02, 0.01, 0.01] });
    const day = (i: number) => new Date(Date.UTC(2026, 0, 1 + i * 7)).toISOString().slice(0, 10);
    const c = (id: number, name: string) => ({ id, name });
    const seq = (team: string, coaches: any[]) => coaches.map((hc, i) => ({ d: day(i), h: team, a: 'Opp' + i, hg: 1, ag: 0, hc, ac: c(900 + i, 'X') }));
    const A = c(1, 'Anna'), B = c(2, 'Bo'), V = c(3, 'Vikarie');
    const idx = buildCoachIndex([
      ...seq('Byte', [A, A, A, B, B]), // Bo har 2 matcher -> nästa är match 3: ny
      ...seq('Vikariat', [A, A, V, A, A]), // en match med vikarie -> Anna har 4 och inget byte
      ...seq('Forsta', [A, A]), // bara Anna i datan -> inget byte
      ...seq('Klar', [A, B, B, B, B, B]), // Bo har 5 -> match 6 är inte ny
    ]);
    const end = '2027-01-01';
    expect(coachTenure(idx, 'Byte', end)).toMatchObject({ coach: 'Bo', matches: 2, changed: true, isNew: true });
    expect(coachTenure(idx, 'Vikariat', end)).toMatchObject({ coach: 'Anna', matches: 4, changed: false, isNew: false });
    expect(coachTenure(idx, 'Forsta', end)).toMatchObject({ matches: 2, changed: false, isNew: false });
    expect(coachTenure(idx, 'Klar', end)).toMatchObject({ coach: 'Bo', matches: 5, changed: true, isNew: false });
    // Bara matcher före datumet: innan Bos första match är Anna tränare utan byte
    expect(coachTenure(idx, 'Byte', day(3))).toMatchObject({ coach: 'Anna', matches: 3, isNew: false });
    expect(coachTenure(idx, 'Okänt lag', end)).toBeNull();
  });

  test('applyNewCoach: lagets vinst -2, kryss +1, motståndaren +1; båda lagen; utan ny tränare oförändrat', async () => {
    const { applyNewCoach, newCoachNotes } = await lib('coaches.mjs');
    const p = [0.5, 0.25, 0.25];
    const h = applyNewCoach(p, { isNew: true }, null);
    expect(h[0]).toBeCloseTo(0.48, 9); expect(h[1]).toBeCloseTo(0.26, 9); expect(h[2]).toBeCloseTo(0.26, 9);
    const a = applyNewCoach(p, null, { isNew: true });
    expect(a[2]).toBeCloseTo(0.23, 9); expect(a[1]).toBeCloseTo(0.26, 9); expect(a[0]).toBeCloseTo(0.51, 9);
    const b = applyNewCoach(p, { isNew: true }, { isNew: true });
    expect(b[0]).toBeCloseTo(0.49, 9); expect(b[1]).toBeCloseTo(0.27, 9); expect(b[2]).toBeCloseTo(0.24, 9);
    expect(applyNewCoach(p, { isNew: false }, null)).toBe(p);
    expect(newCoachNotes({ isNew: true, coach: 'Bo', matches: 2 }, null, 'Reading', 'Bradford')).toEqual([
      'Ny tränare: Reading spelar match 3 under Bo. Lag med ny tränare har vunnit mindre än oddsen sagt de fem första matcherna – Reading −2 procentenheter, krysset +1.',
    ]);
  });
});

// ---------- referee-streaks.mjs ----------

test.describe('referee-streaks: domare med låg hemmavinst (bortalaget vinner oftare)', () => {
  // 40 matcher med "P Howard": 14 hemmavinster (35 %); "M Oliver": 20 av 40 (50 %); en Bundesliga-match räknas inte
  const rows = [
    ...Array.from({ length: 40 }, (_, i) => ({ d: `2025-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`, lg: i % 2 ? 'CH' : 'EL1', h: 'A', a: 'B', hg: i < 14 ? 2 : 0, ag: i < 14 ? 0 : 1, r: 'P Howard' })),
    ...Array.from({ length: 40 }, (_, i) => ({ d: '2025-03-01', lg: 'PL', h: 'C', a: 'D', hg: i < 20 ? 1 : 0, ag: 0, r: 'M Oliver' })),
    { d: '2025-03-01', lg: 'BL', h: 'E', a: 'F', hg: 0, ag: 3, r: 'Paul Howard' },
  ];
  test('refereeHomeBias: minst 40 engelska matcher och högst 38 % hemmavinst, bara matcher före datumet', async () => {
    const { buildRefHomeIndex, refereeHomeBias, AWAY_REF } = await lib('referee-streaks.mjs');
    expect(AWAY_REF).toEqual({ minMatches: 40, maxHomeRate: 0.38, shift: [-0.02, -0.01, 0.03] });
    const idx = buildRefHomeIndex(rows);
    // FotMobs fulla namn ger samma nyckel som football-datas "P Howard"
    const b = refereeHomeBias(idx, 'Paul Howard', '2026-10-03');
    expect(b).toMatchObject({ matches: 40, homeRate: 0.35, flag: true });
    expect(refereeHomeBias(idx, 'Michael Oliver', '2026-10-03')?.flag).toBe(false);
    // Före sista matcherna: färre än 40 -> ingen flagga
    expect(refereeHomeBias(idx, 'Paul Howard', '2025-06-01')?.flag).toBe(false);
    expect(refereeHomeBias(idx, 'Okänd Domare', '2026-10-03')).toBeNull();
  });
  test('applyRefereeAway: hemma -2, kryss -1, borta +3 procentenheter, summa 1; utan flagga oförändrat', async () => {
    const { applyRefereeAway, refereeAwayNotes } = await lib('referee-streaks.mjs');
    const p = [0.408, 0.283, 0.309];
    const q = applyRefereeAway(p, { flag: true });
    expect(q.reduce((a: number, b: number) => a + b, 0)).toBeCloseTo(1, 9);
    expect(q[0]).toBeCloseTo(0.388, 3);
    expect(q[1]).toBeCloseTo(0.273, 3);
    expect(q[2]).toBeCloseTo(0.339, 3);
    expect(applyRefereeAway(p, { flag: false })).toBe(p);
    expect(applyRefereeAway(p, null)).toBe(p);
    expect(refereeAwayNotes({ flag: true, referee: 'Paul Howard', matches: 139, homeRate: 0.338 }, 'Reading', 'Bradford')[0]).toContain('Bradford +3');
    expect(refereeAwayNotes({ flag: false }, 'A', 'B')).toEqual([]);
  });
});

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

  test('Officiella källor: datumfönstret +-1 dag behålls och kopplingen är snabb (GUI-start)', async () => {
    const { applyOfficialReferees } = await lib('referee-streaks.mjs');
    const row = (d: string, h: string, a: string) => ({ d, lg: 'LL2', h, a, hg: 1, ag: 0, r: null as string | null });
    const off = (d: string, h: string, a: string, r: string) => ({ d, lg: 'LL2', h, a, r });
    // En dag ifrån räcker, två dagar gör det inte
    expect(applyOfficialReferees([row('2026-08-14', 'Eibar', 'Huesca')], [off('2026-08-15', 'SD Eibar', 'SD Huesca', 'Ana Ett')])[0].r).toBe('Ana Ett');
    expect(applyOfficialReferees([row('2026-08-14', 'Eibar', 'Huesca')], [off('2026-08-16', 'SD Eibar', 'SD Huesca', 'Ana Ett')])[0].r).toBeNull();
    // Månadsskifte: 31 aug mot 1 sep är en dag
    expect(applyOfficialReferees([row('2026-08-31', 'Eibar', 'Huesca')], [off('2026-09-01', 'SD Eibar', 'SD Huesca', 'Ana Ett')])[0].r).toBe('Ana Ett');
    // Hela säsonger (som verkliga datat, ~54 000 rader) kopplas utan att jämföra alla mot alla: tog ~5 s vid GUI-start
    const teams = Array.from({ length: 40 }, (_, i) => `Lag${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + Math.floor(i / 26))}x`);
    const day = (i: number) => new Date(Date.UTC(2020, 0, 1) + i * 864e5).toISOString().slice(0, 10);
    const rows: any[] = [], offs: any[] = [];
    for (let i = 0; i < 6000; i++) {
      const d = day(Math.floor(i / 5)), h = teams[(i * 2) % 40], a = teams[(i * 2 + 1) % 40];
      rows.push(row(d, h, a)); offs.push(off(d, h, a, `Domare Nummer${i % 30}`));
    }
    const t = performance.now();
    const out = applyOfficialReferees(rows, offs);
    expect(performance.now() - t).toBeLessThan(2000);
    expect(out.filter((m: any) => m.r?.startsWith('Domare')).length).toBe(6000);
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

// ---------- död kod (fotboll): CSS-klasser och toppnivåfunktioner som inget använder ----------

test.describe('död kod: fotbollens webbsidor och skript', () => {
  const SKIP = new Set(['node_modules', 'data', 'site', '.git', 'playwright-report', 'test-results', 'logs']);
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (SKIP.has(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
  const pub = path.join(ROOT, 'gui', 'public');

  test('CSS: varje klass i fotbollens stilmallar används i HTML eller JS', () => {
    const src = ['index.html', 'app.js', 'stryktips.js', 'startelva.js', 'spelarkort.js', 'stryk-engine.js']
      .map((f) => fs.readFileSync(path.join(pub, f), 'utf8')).join('\n') + fs.readFileSync(path.join(ROOT, 'gui', 'static-mode.js'), 'utf8');
    // Klasser som byggs med mall (t.ex. `odd-${key}`, `f-${m.r}`): prefixet måste finnas i koden
    const DYNAMIC = ['odd-', 'flag-', 'se-ph-', 'pc-c-', 'c-', 'f-'];
    const dead: string[] = [];
    for (const f of ['styles.css', 'stryktips.css', 'startelva.css', 'spelarkort.css']) {
      const css = fs.readFileSync(path.join(pub, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '');
      for (const c of new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))) {
        if (src.includes(c)) continue;
        const pre = DYNAMIC.find((p) => c.startsWith(p) && src.includes(`${p}\${`));
        if (!pre) dead.push(`${f}: .${c}`);
      }
    }
    expect(dead, 'oanvända CSS-klasser').toEqual([]);
  });

  test('JS: inga toppnivåfunktioner eller konstanter som aldrig används', () => {
    const all = walk(ROOT).filter((f) => /\.(m?js|ts|html|ps1|ya?ml)$/.test(f));
    const text = all.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const targets = [...['app.js', 'stryktips.js', 'stryk-engine.js', 'stryk-rules.js', 'startelva.js', 'spelarkort.js'].map((f) => path.join(pub, f)),
      ...fs.readdirSync(path.join(ROOT, 'scripts', 'lib')).filter((f) => f.endsWith('.mjs') && !/^(hast|trav|interbet)/.test(f)).map((f) => path.join(ROOT, 'scripts', 'lib', f))];
    const dead: string[] = [];
    for (const f of targets) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/^(?:export\s+)?(?:async\s+)?(?:function\*?\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)\s*=)/gm)) {
        const name = m[1] || m[2];
        if (name.length < 3) continue;
        const n = (text.match(new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`, 'g')) || []).length;
        if (n <= 1) dead.push(`${path.relative(ROOT, f)}: ${name}`);
      }
    }
    expect(dead, 'definierat men aldrig använt').toEqual([]);
  });
});

// ---------- gui/public/stryk-rules.js (regler som delas av webbens motor och pipelinen) ----------

test.describe('stryk-rules: en enda källa för tecknen, folkets färger och skrällfickan', () => {
  const rulesFile = path.join(ROOT, 'gui', 'public', 'stryk-rules.js');
  const users = { 'gui/public/stryk-engine.js': '"./stryk-rules.js"', 'scripts/fetch-stryktipset.mjs': "'../gui/public/stryk-rules.js'" };

  test('motorn och pipelinen definierar inga egna kopior av de delade reglerna', () => {
    const exported = [...fs.readFileSync(rulesFile, 'utf8').matchAll(/^export (?:const|function|let) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    expect(exported.sort()).toEqual(['COLOR', 'POCKET', 'SIGNS', 'applyPocket', 'pocketSign', 'signColor']);
    for (const [file, spec] of Object.entries(users)) {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(src, `${file} importerar stryk-rules.js`).toContain(`from ${spec}`);
      const own = [...src.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)/gm)].map((m) => m[1] || m[2]);
      expect(own.filter((n) => exported.includes(n)), `${file}: egna kopior av delade regler`).toEqual([]);
    }
  });

  test('inga Gambling Cabin-regler kvar i motorerna (2026-10-11: bara fil)', () => {
    for (const file of ['gui/public/stryk-engine.js', 'gui/public/stryk-rules.js', 'scripts/fetch-stryktipset.mjs', 'gui/public/stryktips.js']) {
      const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(src, file).not.toMatch(/gamblingCabinUrl|reducera\.gamblingcabin|buildWithLadder|bestWithSpikes|fitColorRule|buildCoupon[DEF]\b/);
    }
  });
});

// ---------- gui/public/stryk-engine.js (webbens kupongmotor) ----------

test.describe('stryk-rules: skrällficka (skrällar folket missar, 2026-10-11)', () => {
  const rules = () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-rules.js')).href);
  // Oddsen 2 = 25 %, folket 15 % -> 1,67 x folket: i fickan i PL/Championship
  const e = (league: string, market: number[], folk: number[]) => ({ league, market, final: market, folk });
  test('pocketSign: PL/CH, inte favorit, oddsen 20–30 %, minst 1,3 x folket och folket högst 30 %', async () => {
    const { pocketSign, POCKET } = await rules();
    expect(POCKET.leagues).toEqual(['Premier League', 'Championship']);
    expect(pocketSign(e('Premier League', [0.5, 0.25, 0.25], [0.6, 0.25, 0.15]), 2)).toBe(true);
    expect(pocketSign(e('Championship', [0.5, 0.25, 0.25], [0.6, 0.25, 0.15]), 2)).toBe(true);
    // Andra ligor och Europatipset-cuper: nej (gick in färre gånger än oddsen sa)
    expect(pocketSign(e('Serie A', [0.5, 0.25, 0.25], [0.6, 0.25, 0.15]), 2)).toBe(false);
    // Under 1,3 x folket, utanför 20–30 %, folket över 30 % eller oddsfavoriten: nej
    expect(pocketSign(e('Premier League', [0.5, 0.25, 0.25], [0.55, 0.25, 0.2]), 2)).toBe(false);
    expect(pocketSign(e('Premier League', [0.6, 0.22, 0.18], [0.75, 0.15, 0.1]), 2)).toBe(false);
    expect(pocketSign(e('Premier League', [0.3, 0.32, 0.38], [0.5, 0.2, 0.3]), 0)).toBe(false);
    expect(pocketSign(e('Premier League', [0.25, 0.27, 0.48], [0.15, 0.2, 0.65]), 2)).toBe(false);
  });
  test('applyPocket: fickans tecken höjs 12 % och procenten summerar till 1; utan ficka oförändrat', async () => {
    const { applyPocket, POCKET } = await rules();
    expect(POCKET.lift).toBe(0.12);
    const m = e('Premier League', [0.5, 0.25, 0.25], [0.6, 0.25, 0.15]);
    const r = applyPocket(m);
    expect(r.signs).toEqual([2]);
    expect(r.p[0] + r.p[1] + r.p[2]).toBeCloseTo(1, 12);
    expect(r.p[2] / r.p[1]).toBeCloseTo(1.12, 12);
    const none = e('Serie A', [0.5, 0.25, 0.25], [0.6, 0.25, 0.15]);
    expect(applyPocket(none)).toEqual({ signs: [], p: none.final });
    expect(applyPocket(m, 0).p).toBe(m.final);
  });
});

test.describe('stryk-engine: kupong A, B och C', () => {
  const dataFile = path.join(ROOT, 'data', 'stryktipset.json');
  const products: any[] = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')).products ?? [] : [];
  const engine = () => import(pathToFileURL(path.join(ROOT, 'gui', 'public', 'stryk-engine.js')).href);
  const spikes = (c: any) => c.picks.filter((x: any) => x.signs.length === 1).length;

  // Filkuponger (användaren 2026-10-11: "skippa helt allt som har med Gambling Cabin att göra, ta bort alla regler, vill
  // bara köra på fil"): A, B och C är Egna rader-filer à 500 rader.
  test('filkuponger: A/B/C à 500 rader ≥ 30 000 kr, 2 starka spikar, B utan A:s rader, C väger underspelade tecken', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    const { generateCoupons, sysFinal, FILE_RULES, underplayed } = await engine();
    expect(FILE_RULES).toMatchObject({ rows: 500, payoutMin: 30000, spikes: 2, underBonus: 1.3 });
    for (const p of products.slice(0, 2)) {
      const out = generateCoupons(p, {});
      expect(Object.keys(out).filter((k) => /^[A-Z]$/.test(k)).sort(), p.product).toEqual(['A', 'B', 'C']);
      const ev = p.events.map((e: any) => ({ ...e, final: sysFinal(e) }));
      const strength = ev.map((e: any, i: number) => ({ i, v: Math.max(...e.final) })).sort((a: any, b: any) => b.v - a.v);
      for (const name of ['A', 'B', 'C']) {
        const c = out[name];
        const at = `${p.product} ${name}`;
        expect(c.gamblingCabinUrl, at).toBeUndefined();
        expect(c.rows, at).toBe(500);
        expect(new Set(c.rowList).size, at).toBe(500);
        expect(Math.min(...c.rowReal), at).toBeGreaterThanOrEqual(30000);
        expect(c.egnaRader.trim().split('\n'), at).toHaveLength(501);
        for (const { i, v } of strength.slice(0, 2)) expect(c.picks[i].signs, `${at} match ${i + 1}: stark spik`).toBe('1X2'[ev[i].final.indexOf(v)]);
      }
      const setA = new Set(out.A.rowList);
      expect(out.B.rowList.some((r: string) => setA.has(r)), `${p.product}: B utan A:s rader`).toBe(false);
      expect(out.unionHit).toBeCloseTo(out.A.hitAll + out.B.hitAll, 12);
      // C: underspelade tecken förekommer minst lika ofta som i A
      const share = (c: any) => c.rowList.reduce((n: number, r: string) => n + r.split('').filter((s: string, i: number) => underplayed(ev[i], '1X2'.indexOf(s))).length, 0);
      expect(share(out.C), p.product).toBeGreaterThanOrEqual(share(out.A));
    }
  });

  // Egen summa per kupong (2026-10-12: "jag ska kunna bestämma summa fortfarande"), 1 kr per rad, 1–10 000 kr
  test('filkuponger: egen summa per kupong A/B/C', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    const { generateCoupons, clampFileRows, FILE_BUDGET } = await engine();
    expect(FILE_BUDGET).toEqual({ min: 1, max: 10000 });
    expect(clampFileRows('')).toBe(500);
    expect(clampFileRows(undefined, 300)).toBe(300);
    expect(clampFileRows('abc', 300)).toBe(300);
    expect(clampFileRows(0)).toBe(1);
    expect(clampFileRows(99999)).toBe(10000);
    expect(clampFileRows('250.4')).toBe(250);
    const p = products[0];
    const out = generateCoupons(p, {}, { rows: { A: 200, B: 300, C: 100 } });
    expect([out.A.rows, out.B.rows, out.C.rows]).toEqual([200, 300, 100]);
    expect(out.A.cost).toBe(200);
    expect(out.A.egnaRader.trim().split('\n')).toHaveLength(201);
    expect(Math.min(...out.B.rowReal)).toBeGreaterThanOrEqual(30000);
    const setA = new Set(out.A.rowList);
    expect(out.B.rowList.some((r: string) => setA.has(r))).toBe(false);
    // Saknas en kupong i rows gäller standarden 500
    expect(generateCoupons(p, {}, { rows: { A: 100 } }).B.rows).toBe(500);
  });

  // Egen fördelning per match (2026-10-12: "jag ska kunna bestämma fördelningen själv som förut"), som gamla D/E/F %
  test('filkuponger: egen fördelning A/B/C % per match', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    const { generateCoupons, fallShareTargets, sysFinal } = await engine();
    expect(fallShareTargets(500, [40, 30, 30])).toEqual([200, 150, 150]);
    expect(fallShareTargets(100, [33, 33, 34])).toEqual([33, 33, 34]);
    expect(fallShareTargets(10, [50, 50, 0], [0, 1])).toEqual([5, 5, 0]);
    const p = products[0];
    const ev = p.events.map((e: any) => ({ ...e, final: sysFinal(e) }));
    const strongest = ev.map((e: any, i: number) => ({ i, v: Math.max(...e.final) })).sort((a: any, b: any) => b.v - a.v)[0].i;
    const nr = (i: number) => p.events[i].eventNumber;
    const other = (strongest + 3) % 13;
    const dist = (c: any, i: number) => ['1', 'X', '2'].map((s) => c.rowList.filter((r: string) => r[i] === s).length);
    const out = generateCoupons({ ...p, fileShares: { A: { [nr(strongest)]: [40, 30, 30], [nr(other)]: [20, 50, 30] }, B: { [nr(other)]: [0, 50, 50] } } }, {}, { rows: { A: 500, B: 400, C: 500 } });
    // Starkaste matchen spikas inte när den har egen fördelning
    expect(dist(out.A, strongest)).toEqual([200, 150, 150]);
    expect(dist(out.A, other)).toEqual([100, 250, 150]);
    expect(dist(out.B, other)).toEqual([0, 200, 200]);
    expect(out.A.rows).toBe(500);
    expect(new Set(out.A.rowList).size).toBe(500);
    expect(out.B.rowList.some((r: string) => out.A.rowList.includes(r))).toBe(false);
    expect(out.A.relaxed.join(' ')).toContain('2 matcher med din egen fördelning');
    // C utan egna andelar: spikar fortfarande starkaste matchen
    expect(out.C.picks[strongest].signs).toHaveLength(1);
    // Ett spikat krav går före fördelningen
    const k = generateCoupons({ ...p, fileShares: { A: { [nr(other)]: [20, 50, 30] } } }, { [nr(other)]: { signs: 'X', scope: 'A' } });
    expect(dist(k.A, other)).toEqual([0, 500, 0]);
  });

  test('filkuponger: dina krav gäller bara sina kuponger, egna spikar stänger av de starka spikarna', async () => {
    test.skip(products.length === 0, 'data/stryktipset.json saknas');
    const { generateCoupons, strongSpikeForced, sysFinal } = await engine();
    const p = products[0];
    const ev = p.events.map((e: any) => ({ ...e, final: sysFinal(e) }));
    // Krav X på svagaste matchen, bara i A
    const weakest = ev.map((e: any, i: number) => ({ i, v: Math.max(...e.final) })).sort((a: any, b: any) => a.v - b.v)[0].i;
    const out = generateCoupons(p, { [p.events[weakest].eventNumber]: { signs: 'X', scope: 'A' } });
    expect(out.A.picks[weakest].signs).toBe('X');
    expect(out.A.picks[weakest].locked).toBe(true);
    expect(out.B.picks[weakest].locked).toBe(false);
    // Två egna spikar: inga starka spikar läggs till
    const forced: any[] = ev.map(() => null);
    forced[weakest] = [1];
    forced[(weakest + 1) % 13] = [0];
    const f2 = strongSpikeForced(ev, forced, 2);
    expect(f2.filter((x: any) => x?.length === 1)).toHaveLength(2);
    expect(f2).toEqual(forced);
    // En egen spik: ingen annan match spikas (användaren 2026-10-12)
    forced[(weakest + 1) % 13] = null;
    expect(strongSpikeForced(ev, forced, 2)).toEqual(forced);
    // Egen halvgardering är ingen spik: de 2 starka spikarna läggs till
    forced[weakest] = [0, 1];
    expect(strongSpikeForced(ev, forced, 2).filter((x: any) => x?.length === 1)).toHaveLength(2);
    // Hela kupongen: egen spik i A -> inga starka spikar i A, men B/C (kravet gäller inte där) får sina 2
    const own = generateCoupons(p, { [p.events[weakest].eventNumber]: { signs: 'X', scope: 'A' } });
    expect(own.A.picks.filter((x: any) => x.spikStrong)).toHaveLength(0);
    expect(own.B.picks.filter((x: any) => x.spikStrong)).toHaveLength(2);
    // Egna spikar: ingen annan match blir spik ens av sig själv (alla rader samma tecken) – den görs om
    const strongest = ev.map((e: any, i: number) => ({ i, v: Math.max(...e.final) })).sort((a: any, b: any) => b.v - a.v)[0].i;
    const k2 = { [p.events[weakest].eventNumber]: { signs: 'X', scope: 'all' }, [p.events[(strongest + 1) % 13].eventNumber]: { signs: '1', scope: 'all' } };
    const two = generateCoupons(p, k2);
    for (const s of ['A', 'B', 'C']) {
      const c = two[s];
      expect(c.rows).toBeGreaterThan(0);
      c.picks.forEach((x: any, i: number) => {
        if (k2[p.events[i].eventNumber]) expect(x.signs).toBe(k2[p.events[i].eventNumber].signs);
        else expect(x.signs.length, `kupong ${s} match ${i + 1}`).toBeGreaterThan(1);
      });
    }
  });



  // "Kan falla" (2026-10-03): favorit (1 eller 2) med folket ≥ 50 % och vår chans < 55 %, samma gränser i webben och skriptet
  test('canFall: favorit som folket tror på men som har under 55 % hos oss', async () => {
    const { canFall, FALL } = await engine();
    expect(FALL).toEqual({ folk: 0.5, p: 0.55 });
    const cases: [number[], number[], string | null][] = [
      [[0.5, 0.27, 0.23], [0.62, 0.2, 0.18], '1'], // hemmafavorit 50 %, folket 62 %
      [[0.25, 0.27, 0.48], [0.15, 0.2, 0.65], '2'], // bortafavorit
      [[0.6, 0.22, 0.18], [0.7, 0.2, 0.1], null], // 60 % – inte svag
      [[0.5, 0.27, 0.23], [0.45, 0.3, 0.25], null], // folket under 50 %
      [[0.54, 0.26, 0.2], [0.5, 0.3, 0.2], '1'], // precis på gränserna (folk 50 %, chans under 55 %)
      [[0.55, 0.25, 0.2], [0.8, 0.1, 0.1], null], // chans 55 % räcker
    ];
    for (const [final, folk, sign] of cases) {
      const e = { final, folk };
      expect(canFall(e)?.sign ?? null, `${final} / ${folk}`).toBe(sign);
    }
    expect(canFall({ final: [0.5, 0.27, 0.23], folk: [0.62, 0.2, 0.18] })?.side).toBe('home');
    expect(canFall({ final: [0.5, 0.27, 0.23] })).toBeNull(); // utan streck ingen varning
  });

  // Icke-spikbara: tipset baseras på Oddsets marknadsstyrda blandning (tips-latest) när matchen finns där
  test('applyOddsetTipBasis: sätter tip/final från Oddset blended', async () => {
    const { applyOddsetTipBasis, findOddsetRow } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'fetch-stryktipset.mjs')).href);
    const row = findOddsetRow('E0', '2026-10-10', ['Man United', 'Tottenham'], ['Manchester United', 'Tottenham']);
    expect(row?.pro?.blended?.home).toBeGreaterThan(0);
    const a = {
      home: 'Manchester United', away: 'Tottenham', kickoff: '2026-10-10T16:30:00Z', leagueCode: 'E0',
      matched: { home: 'Man United', away: 'Tottenham' }, folk: [0.5, 0.25, 0.25], odds: [1.8, 4, 4.5],
      final: [0.4, 0.3, 0.3], tip: 'X', tipP: 0.3,
    };
    expect(applyOddsetTipBasis(a)).toBe(true);
    expect(a.basis).toBe('oddset');
    expect(a.tipBasis).toBe('oddset');
    expect(['1', 'X', '2']).toContain(a.tip);
    expect(a.final[0] + a.final[1] + a.final[2]).toBeCloseTo(1, 2);
    expect(applyOddsetTipBasis({ home: 'Okänt FC', away: 'Påhittad United', kickoff: '2099-01-01', leagueCode: 'E0' })).toBe(false);
  });






  test('sysFinal: spikbedömningens procent bara när favoriten är densamma', async () => {
    const { sysFinal } = await engine();
    const final = [0.36, 0.268, 0.372];
    expect(sysFinal({ final, spik: { used: true, sysP: [0.3827, 0.2849, 0.3335] } })).toEqual(final); // vänd: Villa–Brentford
    expect(sysFinal({ final, spik: { used: true, sysP: [0.34, 0.27, 0.39] } })).toEqual([0.34, 0.27, 0.39]);
    expect(sysFinal({ final, spik: { used: false, sysP: [0.34, 0.27, 0.39] } })).toEqual(final);
    // Tips som Oddset: alltid Oddsets procent (samma som servern), även när spikbedömningen har samma favorit
    expect(sysFinal({ final, tipBasis: 'oddset', spik: { used: true, sysP: [0.34, 0.27, 0.39] } })).toEqual(final);
  });

  test('skrallTip: skrällspik att läsa om – aldrig favoriten, minst 30 % och understreckad, 35–47 % först, med varför', async () => {
    const { skrallTip, SKRALL_TIP } = await engine();
    expect(SKRALL_TIP.min).toBe(0.3);
    const e = (eventNumber: number, final: number[], folk: number[], extra: any = {}) => ({ eventNumber, home: `H${eventNumber}`, away: `B${eventNumber}`, final, folk, ...extra });
    const events = [
      e(1, [0.30, 0.25, 0.45], [0.20, 0.20, 0.60]), // 1 30 %: +10 men utanför 35–47
      e(2, [0.40, 0.25, 0.35], [0.45, 0.25, 0.30]), // 2 35 %: +5 och i fönstret -> vinner
      e(3, [0.29, 0.21, 0.50], [0.10, 0.20, 0.70]), // 1 29 %: under 30 %
      e(4, [0.60, 0.25, 0.15], [0.40, 0.30, 0.30]), // favoriten understreckad: aldrig
    ];
    const t = skrallTip(events);
    expect(`${t.eventNumber}:${t.sign}`).toBe('2:2');
    expect(t.window).toBe(true);
    expect(t.reasons[0]).toContain('35 %');
    expect(t.reasons.at(-1)).toContain('chansning');
    expect(t.hit).toBeNull();
    // Utan fönsterkandidat: störst värde mot folket
    expect(skrallTip([events[0], events[2], events[3]])).toMatchObject({ eventNumber: 1, sign: '1' });
    // Inget understreckat tecken på minst 30 %: ingen skräll
    expect(skrallTip([events[2], events[3]])).toBeNull();
    // Facit och skäl från risklag, oddsrörelse och experter
    const r = skrallTip([e(5, [0.50, 0.30, 0.20], [0.60, 0.22, 0.18], {
      result: { outcome: 'X', score: '1-1' }, odds: [2.0, 3.2, 5.0], startOdds: [1.9, 3.5, 5.0],
      experts: [{ signs: '1X' }, { signs: '1' }], streckFlop: { flagged: true, home: { season: { noWin: 3, games: 4 } } },
    })]);
    expect(r).toMatchObject({ sign: 'X', hit: true, score: '1-1' });
    expect(r.reasons.join(' ')).toContain('ned från 3,50');
    expect(r.reasons.join(' ')).toContain('H5 är ett risklag');
    expect(r.reasons.join(' ')).toContain('1 av 2');
  });

  test('skrallTips: alltid två att välja på – olika matcher, reserv (weak) när bara en klarar kravet', async () => {
    const { skrallTips, SKRALL_TIP } = await engine();
    expect(SKRALL_TIP.count).toBe(2);
    expect(SKRALL_TIP.weakMin).toBe(0.25);
    const e = (eventNumber: number, final: number[], folk: number[]) => ({ eventNumber, home: `H${eventNumber}`, away: `B${eventNumber}`, final, folk });
    const events = [
      e(1, [0.30, 0.25, 0.45], [0.20, 0.20, 0.60]), // 1 30 %: +10
      e(2, [0.40, 0.25, 0.35], [0.45, 0.25, 0.30]), // 2 35 %: i fönstret -> först
      e(3, [0.29, 0.21, 0.50], [0.10, 0.20, 0.70]), // 1 29 %: bara reserv
      e(4, [0.60, 0.25, 0.15], [0.40, 0.30, 0.30]), // favoriten: aldrig
    ];
    const two = skrallTips(events);
    expect(two.map((t: any) => `${t.eventNumber}:${t.sign}`)).toEqual(['2:2', '1:1']);
    expect(two.every((t: any) => !t.weak)).toBe(true);
    // Högst en per match, även när två tecken i samma match klarar kravet
    const same = skrallTips([e(7, [0.36, 0.30, 0.34], [0.60, 0.20, 0.20]), e(8, [0.31, 0.19, 0.50], [0.20, 0.20, 0.60])]);
    expect(new Set(same.map((t: any) => t.eventNumber)).size).toBe(same.length);
    expect(same.map((t: any) => t.eventNumber)).toEqual([7, 8]);
    // Bara en klarar kravet: reserven fyller på och märks weak
    const fill = skrallTips([events[1], events[2], events[3]]);
    expect(fill.map((t: any) => `${t.eventNumber}:${t.sign}:${t.weak}`)).toEqual(['2:2:false', '3:1:true']);
    // Ingen klarar kravet: skrallTip säger null men skrallTips ger reserven
    const { skrallTip } = await engine();
    expect(skrallTip([events[2], events[3]])).toBeNull();
    expect(skrallTips([events[2], events[3]])).toHaveLength(1);
    // Inget understreckat tecken på minst 25 %: tomt
    expect(skrallTips([events[3]])).toEqual([]);
  });

  test('skrallKryss: två skrällkryss – aldrig favorit, andra matcher än skrällspikarna, reserv (weak), med varför', async () => {
    const { skrallKryss, skrallTips, SKRALL_X } = await engine();
    expect(SKRALL_X).toMatchObject({ min: 0.26, edge: 0.02, count: 2, weakMin: 0.22 });
    const e = (eventNumber: number, final: number[], folk: number[], extra: any = {}) => ({ eventNumber, home: `H${eventNumber}`, away: `B${eventNumber}`, final, folk, ...extra });
    const events = [
      e(1, [0.40, 0.25, 0.35], [0.45, 0.25, 0.30]), // skrällspik 2 -> matchen tas inte för kryss
      e(2, [0.38, 0.30, 0.32], [0.45, 0.22, 0.33]), // X 30 %: +8, jämn
      e(3, [0.50, 0.28, 0.22], [0.55, 0.24, 0.21]), // X 28 %: +4
      e(4, [0.45, 0.27, 0.28], [0.44, 0.26, 0.30]), // X 27 %: +1 -> bara reserv
      e(5, [0.30, 0.40, 0.30], [0.40, 0.20, 0.40]), // krysset är favorit: aldrig
      e(6, [0.60, 0.21, 0.19], [0.70, 0.15, 0.15]), // X 21 %: under 22 %
      e(7, [0.36, 0.20, 0.44], [0.20, 0.20, 0.60]), // skrällspik 1 (+16) -> andra skrällspiken
    ];
    expect(skrallTips(events).map((t: any) => t.eventNumber)).toEqual([7, 1]);
    const spik = skrallTips(events).map((t: any) => t.eventNumber);
    const x = skrallKryss(events);
    expect(x.map((t: any) => `${t.eventNumber}:${t.sign}:${t.weak}`)).toEqual(['2:X:false', '3:X:false']);
    expect(x.some((t: any) => spik.includes(t.eventNumber))).toBe(false);
    expect(x[0].outcome).toBe('oavgjort');
    expect(x[0].reasons[0]).toContain('30 %');
    expect(x[0].reasons.join(' ')).toContain('Jämn match');
    expect(x[1].reasons.join(' ')).not.toContain('Jämn match');
    expect(x[0].reasons.at(-1)).toContain('chansning');
    // Bara en klarar kravet: reserven fyller på
    expect(skrallKryss([events[0], events[6], events[2], events[3]]).map((t: any) => `${t.eventNumber}:${t.weak}`)).toEqual(['3:false', '4:true']);
    // Inget understreckat kryss på minst 22 % (eller krysset favorit): tomt
    expect(skrallKryss([events[4], events[5]])).toEqual([]);
    // Facit
    expect(skrallKryss([events[0], events[6], e(9, [0.45, 0.28, 0.27], [0.50, 0.22, 0.28], { result: { outcome: 'X', score: '0-0' } })])[0]).toMatchObject({ hit: true, score: '0-0' });
  });

});

// ---------- streck-flop.mjs ----------

test.describe('streck-flop: streckfavoriter som inte vinner', () => {
  // m(datum, hemma, borta, folk1, folk2, utfall)
  const m = (date: string, home: string, away: string, f1: number, f2: number, outcome: string | null, extra = {}) =>
    ({ date, home, away, folk1: f1, folkX: 100 - f1 - f2, folk2: f2, prob1: f1 / 120, prob2: f2 / 120, outcome, ftHome: 1, ftAway: 1, cancelled: false, ...extra });
  const hist = [
    m('2026-03-01', 'Chelsea', 'Leeds', 70, 10, '1'), // forra sasongen: vinst
    m('2026-04-01', 'Leeds', 'Chelsea', 15, 65, 'X'), // forra sasongen: kryss
    m('2026-08-10', 'Chelsea', 'Spurs', 68, 12, 'X'), // denna: kryss
    m('2026-08-20', 'Fulham', 'Chelsea', 20, 55, '1'), // denna: forlust
    m('2026-08-30', 'Chelsea', 'Wolves', 72, 8, '1'), // denna: vinst
    m('2026-09-05', 'Chelsea', 'Brentford', 45, 30, 'X'), // inte streckfavorit (< 50 %)
    m('2026-09-12', 'Chelsea', 'Everton', 70, 10, '2', { cancelled: true }), // struken
    m('2026-10-03', 'Chelsea', 'Burnley', 75, 8, null), // ej spelad
  ];

  test('seasonStart: juli-juni i England, kalenderar i Norden', async () => {
    const { seasonStart } = await lib('streck-flop.mjs');
    expect(seasonStart('2026-10-03', 'England')).toBe('2026-07-01');
    expect(seasonStart('2026-03-03', 'England')).toBe('2025-07-01');
    expect(seasonStart('2026-10-03', 'Sverige')).toBe('2026-01-01');
  });

  test('streckFavStats: bara >= 50 % streck, spelade och ej strukna matcher', async () => {
    const { streckFavStats } = await lib('streck-flop.mjs');
    const s = streckFavStats(hist, 'Chelsea', '2026-07-01', '2026-10-03');
    expect(s).toMatchObject({ games: 3, noWin: 2, draws: 1, losses: 1, avgFolk: 65 });
    expect(s.rate).toBeCloseTo(2 / 3);
    expect(s.last[0]).toMatchObject({ date: '2026-08-30', res: 'V', home: true });
  });

  test('streckFlopFlags: flaggar denna sasong (minst 2 matcher, minst 50 % utan seger) med forra sasongen som jamforelse', async () => {
    const { streckFlopFlags, streckFlopNotes } = await lib('streck-flop.mjs');
    const f = streckFlopFlags(hist, { home: 'Chelsea', away: 'Burnley', date: '2026-10-03', country: 'England' });
    expect(f.flagged).toBe(true);
    expect(f.away).toBeNull();
    expect(f.home.season.games).toBe(3);
    expect(f.home.prev).toMatchObject({ games: 2, noWin: 1 });
    const notes = streckFlopNotes(f, 'Chelsea', 'Burnley');
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain('Chelsea');
    expect(notes[0]).toContain('67 %');
    // Ingen framtidsdata: fore 2026-08-20 finns bara en match denna sasong -> ingen flagga
    expect(streckFlopFlags(hist, { home: 'Chelsea', away: 'Burnley', date: '2026-08-20', country: 'England' })).toBeNull();
  });

  test('streckFlopFlags: ett lag som vinner som favorit flaggas inte', async () => {
    const { streckFlopFlags } = await lib('streck-flop.mjs');
    const wins = [m('2026-08-10', 'Arsenal', 'X', 70, 10, '1'), m('2026-08-20', 'Arsenal', 'Y', 70, 10, '1'), m('2026-08-30', 'Z', 'Arsenal', 10, 70, 'X')];
    expect(streckFlopFlags(wins, { home: 'Arsenal', away: 'Q', date: '2026-10-03', country: 'England' })).toBeNull();
  });

  test('streckFlopTop: sorterar pa andel utan seger med minsta antal matcher', async () => {
    const { streckFlopTop } = await lib('streck-flop.mjs');
    const top = streckFlopTop(hist, '2026-07-01', '2026-10-03', { minGames: 2 });
    expect(top.map((r) => r.team)).toEqual(['Chelsea']);
  });
});

test.describe('streck-flop: säsongslistan (panelen Risklag)', () => {
  const m = (date: string, home: string, away: string, f1: number, f2: number, outcome: string, country = 'England') =>
    ({ date, home, away, folk1: f1, folkX: 100 - f1 - f2, folk2: f2, prob1: 0.5, prob2: 0.2, outcome, ftHome: 0, ftAway: 0, cancelled: false, league: country === 'England' ? 'Championship' : 'Allsvenskan', country });
  const hist = [
    m('2026-08-10', 'Burnley', 'A', 60, 15, 'X'), m('2026-08-20', 'B', 'Burnley', 15, 60, '1'), // risklag 2/2
    m('2026-08-10', 'Leeds', 'C', 60, 15, '1'), m('2026-08-20', 'D', 'Leeds', 15, 60, '2'), // vinner -> inte risk
    m('2026-03-01', 'Häcken', 'E', 60, 15, 'X', 'Sverige'), m('2026-09-01', 'Häcken', 'F', 60, 15, '2', 'Sverige'), // kalenderar: 2/2
    m('2026-09-20', 'Wrexham', 'G', 70, 10, 'X'), // bara 1 match -> inte med
    m('2026-10-05', 'Leeds', 'H', 60, 15, 'X'), // efter datumet -> raknas inte
  ];

  test('risklag overst, vinnande favoriter efter, lag med en match utanfor, ingen framtidsdata', async () => {
    const { streckFlopSeasonList } = await lib('streck-flop.mjs');
    const list = streckFlopSeasonList(hist, '2026-10-02');
    // Bara engelska lag (användaren 2026-10-02): Häcken (2/2 utan seger) är inte med
    expect(list.map((r: any) => [r.team, r.risk])).toEqual([['Burnley', true], ['Leeds', false]]);
    expect(list.every((r: any) => r.country === 'England')).toBe(true);
    expect(list[0]).toMatchObject({ league: 'Championship', season: { games: 2, noWin: 2 } });
    expect(list[0].season.last.map((x: any) => x.res)).toEqual(['F', 'O']); // senaste forst
  });

  test('flaggan i kupongen bara for engelska matcher', async () => {
    const { streckFlopFlags } = await lib('streck-flop.mjs');
    expect(streckFlopFlags(hist, { home: 'Burnley', away: 'Z', date: '2026-10-02', country: 'England' })?.home?.flag).toBe(true);
    expect(streckFlopFlags(hist, { home: 'Häcken', away: 'Z', date: '2026-10-02', country: 'Sverige' })).toBeNull();
  });
});

// ---------- tipslogg.mjs ----------

test.describe('tipslogg: vad som tippats sparas och analyseras', () => {
  const now = new Date('2026-10-04T10:00:00Z');
  const later = new Date('2026-10-04T12:00:00Z');
  const after = new Date('2026-10-04T20:00:00Z');
  const rec = (pick: string, kickoff = '2026-10-04T15:00:00Z') => ({
    id: 'x', product: 'oddset', date: '2026-10-04', kickoff, league: 'PL', home: 'Arsenal', away: 'Chelsea',
    tip: { markets: { '1X2': { pick, p: 0.5, odds: 2.1, value: 'Värde' } } },
  });

  test('första tipset låses, senaste uppdateras fram till start, sedan ändras inget', async () => {
    const { applyTip } = await lib('tipslogg.mjs');
    const store = { items: {} as Record<string, any> };
    expect(applyTip(store, rec('1'), now)).toBe('ny');
    expect(applyTip(store, rec('1'), later)).toBe('samma');
    expect(applyTip(store, rec('X'), later)).toBe('andrad');
    expect(store.items.x.first.markets['1X2'].pick).toBe('1');
    expect(store.items.x.latest.markets['1X2'].pick).toBe('X');
    expect(applyTip(store, rec('2'), after)).toBe('last');
    expect(store.items.x.latest.markets['1X2'].pick).toBe('X');
  });

  test('en match som redan startat när den först ses loggas inte (inget riktigt tips)', async () => {
    const { applyTip } = await lib('tipslogg.mjs');
    const store = { items: {} as Record<string, any> };
    expect(applyTip(store, rec('1'), after)).toBe('sen');
    expect(store.items.x).toBeUndefined();
  });

  test('facit sätts en gång och tipset efter facit är låst', async () => {
    const { applyTip, applyResult } = await lib('tipslogg.mjs');
    const store = { items: {} as Record<string, any> };
    applyTip(store, rec('1'), now);
    expect(applyResult(store, 'x', { '1X2': '1' }, after)).toBe(true);
    expect(applyResult(store, 'x', { '1X2': '2' }, after)).toBe(false);
    expect(store.items.x.result['1X2']).toBe('1');
    expect(applyResult(store, 'saknas', { '1X2': '1' }, after)).toBe(false);
  });

  test('gradeRecord: Oddset, Stryktipset (enkelrad + kuponger) och Hästar', async () => {
    const { gradeRecord } = await lib('tipslogg.mjs');
    const o = gradeRecord({ product: 'oddset', first: rec('1').tip, result: { '1X2': '1' } });
    expect(o).toEqual([{ market: '1X2', pick: '1', p: 0.5, odds: 2.1, value: 'Värde', hit: true }]);
    const s = gradeRecord({
      product: 'stryktipset', result: { outcome: 'X' },
      first: { probs: [0.5, 0.3, 0.2], odds: [2, 3.4, 5], single: '1', coupons: { A: { signs: '1X', type: 'Halvgardering' }, B: { signs: '2' }, C: null } },
    });
    expect(s.map((g: any) => [g.market, g.hit, g.p])).toEqual([['enkelrad', false, 0.5], ['kupong A', true, 0.8], ['kupong B', false, 0.2]]);
    const h = gradeRecord({ product: 'hastar', result: { winners: [7] }, first: { top: [{ nr: 3, p: 0.4 }, { nr: 7, p: 0.2 }, { nr: 1, p: 0.1 }], spik: 3 } });
    expect(h.map((g: any) => [g.market, g.hit])).toEqual([['etta', false], ['topp 3', true], ['spik', false]]);
    expect(gradeRecord({ product: 'oddset', first: rec('1').tip, result: null })).toEqual([]);
  });

  test('flatten filtrerar på lag, liga och produkt; summarize räknar träff och 500 kr flat', async () => {
    const { flatten, summarize, groupRows } = await lib('tipslogg.mjs');
    const recs = [
      { ...rec('1'), id: 'a', first: rec('1').tip, result: { '1X2': '1' } },
      { ...rec('2'), id: 'b', home: 'Leeds', away: 'Arsenal', first: rec('2').tip, result: { '1X2': '1' } },
      { ...rec('1'), id: 'c', league: 'CH', home: 'Hull', away: 'Stoke', first: rec('1').tip, result: { '1X2': '1' } },
    ];
    const ars = flatten(recs, { team: 'arsenal' });
    expect(ars.map((r: any) => r.id)).toEqual(['a', 'b']);
    expect(flatten(recs, { league: 'CH' }).map((r: any) => r.id)).toEqual(['c']);
    expect(flatten(recs, { product: 'stryktipset' })).toEqual([]);
    const s = summarize(ars);
    expect(s).toMatchObject({ n: 2, hits: 1, rate: 0.5, expected: 0.5, bets: 2, profit: 50, roi: 0.05 });
    const byTeam = groupRows(flatten(recs), 'team');
    expect(byTeam.find((g: any) => g.key === 'Arsenal')).toMatchObject({ n: 2, hits: 1 });
  });

  test('byggare: Oddset-kandidat, Stryktipset-match och travlopp blir poster med rätt id', async () => {
    const { oddsetRecord, oddsetResult, strykRecords, hastRecords } = await lib('tipslogg.mjs');
    const o = oddsetRecord({
      date: '2026-10-04', kickoffUtc: '2026-10-04T15:00Z', league: 'PL', home: 'Arsenal', away: 'Chelsea', passEdgeFilter: true,
      tips: { '1X2': { pick: '1', confidence: 0.52 }, OU25: { pick: 'UNDER 2.5', confidence: 0.6 }, BTTS: { pick: 'NEJ', confidence: 0.55 } },
      pro: { odds: { home: 2.1, under25: 1.8 }, verdicts: { home: { value: true }, under25: { value: false } }, valueBets: [] },
    });
    expect(o.id).toBe('2026-10-04|PL|Arsenal|Chelsea');
    expect(o.tip.markets['1X2']).toMatchObject({ pick: '1', odds: 2.1, value: 'Värde' });
    expect(o.tip.markets.OU25).toMatchObject({ value: 'Ej värde' });
    expect(o.tip.topTip).toBe(true);
    expect(oddsetResult({ result: 'D', hg: 1, ag: 1, btts: true, over25: false })).toEqual({ '1X2': 'X', BTTS: 'JA', OU25: 'UNDER 2.5', score: '1-1' });
    expect(oddsetResult({ result: null })).toBeNull();
    const s = strykRecords({
      product: 'stryktipset', drawNumber: 4974, regCloseTime: '2026-10-10T15:59:00+02:00', reducedC: { picks: ['X2'] },
      events: [{ eventNumber: 1, home: 'Hull', away: 'Stoke', kickoff: '2026-10-10T16:00:00+02:00', final: [0.4, 0.3, 0.3], tip: '1', systemPick: { signs: '1X', type: 'Halvgardering' }, systemPickB: { signs: '1X2', type: 'Helgardering' } }],
    });
    expect(s[0].id).toBe('stryktipset-4974-1');
    expect(s[0].tip.coupons).toEqual({ A: { signs: '1X', type: 'Halvgardering' }, B: { signs: '1X2', type: 'Helgardering' }, C: { signs: 'X2' } });
    const h = hastRecords({
      id: 'V85_2026-10-10_5_5', type: 'V85', date: '2026-10-10', track: 'Solvalla', spikes: { sakerhet: { raceNr: 5, nr: 2 }, varde: null },
      races: [{ leg: 1, number: 5, startTime: '2026-10-10T15:00:00', horses: [{ nr: 1, p: 0.1 }, { nr: 2, p: 0.5 }, { nr: 3, p: 0.6, scratched: true }] }],
    });
    expect(h[0].id).toBe('V85_2026-10-10_5_5|5');
    expect(h[0].tip.top.map((x: any) => x.nr)).toEqual([2, 1]);
    expect(h[0].tip.spik).toBe(2);
  });
});

// ---------- cards-model.mjs (Antal kort Ö/U som på Oddset) ----------

test.describe('cards-model: antal kort över/under 3.5/4.5/5.5', () => {
  // Liga X: 3 kort/match (2 hemma, 1 borta) utom Butchers som alltid får 3 egna. Domare Hård dömer dubbelt så många.
  const teams = ['A', 'B', 'C', 'D', 'Butchers'];
  const rows: any[] = [];
  const day = (i: number) => new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString().slice(0, 10);
  for (let i = 0; i < 200; i++) {
    const h = teams[i % 5], a = teams[(i + 1 + Math.floor(i / 5)) % 5];
    if (h === a) continue;
    const hard = i % 4 === 0;
    const hy = (h === 'Butchers' ? 3 : 2) * (hard ? 2 : 1), ay = (a === 'Butchers' ? 3 : 1) * (hard ? 2 : 1);
    rows.push({ d: day(i), lg: 'X', h, a, r: hard ? 'Hård' : 'Snäll', hy, ay, hr: 0, ar: 0 });
  }
  const asOf = day(201);

  test('probOver: Poisson och negativ binomial stämmer med handräknat', async () => {
    const { probOver } = await lib('cards-model.mjs');
    // Poisson mu=4: P(X<=4) = e^-4 (1+4+8+10.667+10.667) = 0.6288
    expect(probOver(4, 4.5)).toBeCloseTo(1 - 0.6288, 3);
    // Stor dispersion -> nästan Poisson; liten dispersion -> fetare svans (mer över 5.5)
    expect(probOver(4, 4.5, 1e7)).toBeCloseTo(probOver(4, 4.5), 4);
    expect(probOver(4, 5.5, 3)).toBeGreaterThan(probOver(4, 5.5));
    expect(probOver(4, 3.5)).toBeGreaterThan(probOver(4, 4.5));
  });

  test('lag som får fler kort och hård domare ger högre prognos, bara data före asOf', async () => {
    const { buildCardIndex, predictCards } = await lib('cards-model.mjs');
    const idx = buildCardIndex(rows, asOf);
    const base = predictCards(idx, { league: 'X', home: 'A', away: 'B' });
    const butch = predictCards(idx, { league: 'X', home: 'Butchers', away: 'B' });
    const hard = predictCards(idx, { league: 'X', home: 'A', away: 'B', referee: 'Hård' });
    const soft = predictCards(idx, { league: 'X', home: 'A', away: 'B', referee: 'Snäll' });
    expect(butch.expCards).toBeGreaterThan(base.expCards);
    expect(hard.expCards).toBeGreaterThan(base.expCards);
    expect(soft.expCards).toBeLessThan(base.expCards);
    expect(hard.referee.factor).toBeGreaterThan(1.2);
    expect(Object.keys(base.pOver)).toEqual(['3.5', '4.5', '5.5']);
    // Okänt lag, okänd liga, eller bara framtida matcher -> ingen prognos
    expect(predictCards(idx, { league: 'X', home: 'A', away: 'Okänd' })).toBeNull();
    expect(predictCards(idx, { league: 'Y', home: 'A', away: 'B' })).toBeNull();
    expect(predictCards(buildCardIndex(rows, day(0)), { league: 'X', home: 'A', away: 'B' })).toBeNull();
  });

  test('domarnamn matchas via refKey och lagnamn via resolveName', async () => {
    const { buildCardIndex, predictCards } = await lib('cards-model.mjs');
    const { refKey, resolveTeam } = await lib('referee-streaks.mjs');
    const named = rows.map((m) => ({ ...m, r: m.r === 'Hård' ? 'Anthony Taylor' : m.r }));
    const idx = buildCardIndex(named, asOf, undefined, { refKey });
    const p = predictCards(idx, { league: 'X', home: 'Butchers FC', away: 'B', referee: 'A. Taylor' }, { resolveName: resolveTeam });
    expect(p).not.toBeNull();
    expect(p.referee.name).toBe('A. Taylor');
    expect(p.referee.factor).toBeGreaterThan(1.2);
  });

  test('trasiga liga-månader (FotMob skriver 0 kort) räknas inte', async () => {
    const { brokenCardMonths, usableCardRows, buildCardIndex, leagueCardStats } = await lib('cards-model.mjs');
    // 2026-08: 10 matcher, 9 med 0 kort (och 1 ofullständig) -> hela månaden bort; 2026-09 med 2 matcher ärver
    const broken = [...Array(10)].map((_, i) => ({ d: `2026-08-${String(i + 10)}`, lg: 'X', h: 'A', a: 'B', hy: i === 0 ? 1 : 0, ay: 0 }));
    const tail = [{ d: '2026-09-02', lg: 'X', h: 'A', a: 'B', hy: 0, ay: 0 }, { d: '2026-09-03', lg: 'X', h: 'C', a: 'D', hy: 1, ay: 0 }];
    // En vanlig månad med 1 nolla av 10 är riktig data
    const okMonth = [...Array(10)].map((_, i) => ({ d: `2026-05-${String(i + 10)}`, lg: 'X', h: 'A', a: 'B', hy: i === 0 ? 0 : 2, ay: i === 0 ? 0 : 2 }));
    const all = [...rows, ...okMonth, ...broken, ...tail];
    const b = brokenCardMonths(all);
    expect(b.has('X|2026-08')).toBe(true);
    expect(b.has('X|2026-09')).toBe(true);
    expect(b.has('X|2026-05')).toBe(false);
    const use = usableCardRows(all);
    expect(use.some((m: any) => m.d.startsWith('2026-08') || m.d.startsWith('2026-09'))).toBe(false);
    expect(okMonth.every((m) => use.includes(m))).toBe(true);
    // Ligasnittet påverkas inte av de trasiga nollorna
    const s = leagueCardStats(buildCardIndex(all, '2026-10-01'), 'X');
    expect(s.last < '2026-08-01').toBe(true);
    expect(s.total).toBeGreaterThan(2.5);
  });

  test('båda lagen får kort: P(hemma >= 1) x P(borta >= 1) med kalibrerad nollchans', async () => {
    const { probBothCards, BOTH_K, buildCardIndex, predictCards } = await lib('cards-model.mjs');
    expect(BOTH_K).toBe(1.1);
    // lambda 2 och 1.5, k = 1.1: (1 - e^-2.2)(1 - e^-1.65) = 0.8892 x 0.8080 = 0.7185
    expect(probBothCards(2, 1.5)).toBeCloseTo(0.7185, 3);
    expect(probBothCards(2, 1.5, 1)).toBeCloseTo((1 - Math.exp(-2)) * (1 - Math.exp(-1.5)), 6);
    expect(probBothCards(2, 0)).toBe(0);
    // Fler kort för ett lag eller hård domare -> högre chans att båda får kort
    const idx = buildCardIndex(rows, asOf);
    const base = predictCards(idx, { league: 'X', home: 'A', away: 'B' });
    const hard = predictCards(idx, { league: 'X', home: 'A', away: 'B', referee: 'Hård' });
    expect(base.pBoth).toBeGreaterThan(0);
    expect(base.pBoth).toBeLessThan(1);
    expect(hard.pBoth).toBeGreaterThan(base.pBoth);
    expect(base.pBoth).toBeCloseTo(probBothCards(base.lambdaHome, base.lambdaAway), 2);
  });

  test('pickCardLine väljer linjen närmast 50 % och cardsOutcome ger facit', async () => {
    const { pickCardLine, cardsOutcome } = await lib('cards-model.mjs');
    const pk = pickCardLine({ pOver: { '3.5': 0.78, '4.5': 0.58, '5.5': 0.36 } });
    expect(pk).toEqual({ line: 4.5, pick: 'OVER 4.5', pOver: 0.58, confidence: 0.58 });
    expect(pickCardLine({ pOver: { '3.5': 0.45, '4.5': 0.27, '5.5': 0.14 } }).pick).toBe('UNDER 3.5');
    expect(pickCardLine(null)).toBeNull();
    expect(cardsOutcome({ hy: 2, ay: 2, hr: 1, ar: 0 }, 4.5)).toEqual({ total: 5, result: 'OVER 4.5' });
    expect(cardsOutcome({ hy: 2, ay: 2 }, 4.5).result).toBe('UNDER 4.5');
    expect(cardsOutcome({ hy: null, ay: 1 }, 4.5)).toBeNull();
  });

  test('tipslogg: korttipset loggas med linje och rättas mot gula + röda', async () => {
    const { oddsetRecord, oddsetResult, gradeRecord } = await lib('tipslogg.mjs');
    const t = {
      date: '2026-10-04', league: 'PL', home: 'Arsenal', away: 'Leeds',
      tips: { CARDS: { pick: 'OVER 4.5', line: 4.5, confidence: 0.56, expCards: 4.9, referee: { name: 'A Taylor' } }, BOTH_CARDS: { pick: 'JA', pYes: 0.77, confidence: 0.77 } },
    };
    const r = oddsetRecord(t);
    expect(r.tip.markets.CARDS).toEqual({ pick: 'OVER 4.5', line: 4.5, p: 0.56, expCards: 4.9, referee: 'A Taylor' });
    const m = { result: 'H', hg: 2, ag: 0, btts: false, over25: false, discipline: { homeYellow: 2, awayYellow: 2, homeRed: 0, awayRed: 1 } };
    expect(oddsetResult(m).cards).toBe(5);
    expect(oddsetResult(m).BOTH_CARDS).toBe('JA');
    // Utan football-data-kort: FotMob-raden; utan någon kortkälla: inga kortnycklar
    expect(oddsetResult({ ...m, discipline: {} }, { home: 3, away: 0 })).toMatchObject({ cards: 3, BOTH_CARDS: 'NEJ' });
    expect('cards' in oddsetResult({ ...m, discipline: {} })).toBe(false);
    expect('BOTH_CARDS' in oddsetResult({ ...m, discipline: {} })).toBe(false);
    const g = gradeRecord({ product: 'oddset', first: r.tip, result: oddsetResult(m) });
    expect(g.find((x: any) => x.market === 'CARDS')).toMatchObject({ pick: 'OVER 4.5', hit: true, p: 0.56 });
    const miss = gradeRecord({ product: 'oddset', first: r.tip, result: { ...oddsetResult(m), cards: 4 } });
    expect(miss.find((x: any) => x.market === 'CARDS').hit).toBe(false);
    expect(gradeRecord({ product: 'oddset', first: r.tip, result: { '1X2': '1' } }).some((x: any) => x.market === 'CARDS')).toBe(false);
    // Båda lagen får kort: loggas och rättas mot JA/NEJ
    expect(r.tip.markets.BOTH_CARDS).toEqual({ pick: 'JA', p: 0.77 });
    expect(g.find((x: any) => x.market === 'BOTH_CARDS')).toMatchObject({ pick: 'JA', hit: true });
    const noAway = oddsetResult({ ...m, discipline: { homeYellow: 3, awayYellow: 0, homeRed: 0, awayRed: 0 } });
    expect(gradeRecord({ product: 'oddset', first: r.tip, result: noAway }).find((x: any) => x.market === 'BOTH_CARDS').hit).toBe(false);
  });
});

// ---------- learnings-signals.mjs: landslagsuppehall och svara motstandare ----------

test.describe('learnings-signals: landslagsuppehall', () => {
  test('breakEnds: 12–50 dagars ligauppehall i sep–dec/mar–apr, inte sommar eller lang vinterpaus', async () => {
    const { breakEnds } = await lib('learnings-signals.mjs');
    const dates = ['2025-08-16', '2025-08-23', '2025-08-30', '2025-09-13', '2025-09-20', '2025-09-27', '2025-10-04', '2025-10-18', '2025-10-25', '2025-11-01', '2025-11-08', '2025-11-22', '2026-03-14', '2026-03-21', '2026-04-04', '2026-05-24', '2026-08-15'];
    // 30/8 -> 13/9 = 14 d (sep), 4/10 -> 18/10 = 14 d, 8/11 -> 22/11 = 14 d, 21/3 -> 4/4 = 14 d (apr); 22/11 -> 14/3 och sommaren for langa
    expect(breakEnds(dates)).toEqual(['2025-09-13', '2025-10-18', '2025-11-22', '2026-04-04']);
    // 11 dagar raknas inte, och ett 14-dagarsuppehall i februari (cuphelg) inte heller
    expect(breakEnds(['2025-10-01', '2025-10-12', '2026-02-01', '2026-02-15'])).toEqual([]);
    // VM-uppehallet 2022: 13/11 -> 26/12 = 43 dagar
    expect(breakEnds(['2022-11-13', '2022-12-26'])).toEqual(['2022-12-26']);
  });

  test('afterBreakKeys: varje lags forsta match inom 4 dagar efter omstarten, inte nasta', async () => {
    const { afterBreakKeys } = await lib('learnings-signals.mjs');
    const list = [
      { date: '2025-08-30', home: 'Arsenal', away: 'Leeds' },
      { date: '2025-08-30', home: 'Chelsea', away: 'Fulham' },
      { date: '2025-09-13', home: 'Arsenal', away: 'Fulham' },
      { date: '2025-09-15', home: 'Leeds', away: 'Chelsea' }, // mandagsmatch efter uppehallet
      { date: '2025-09-20', home: 'Chelsea', away: 'Arsenal' }, // andra matchen efter: raknas inte
    ];
    const k = afterBreakKeys(list);
    expect([...k].sort()).toEqual(['Arsenal|2025-09-13', 'Chelsea|2025-09-15', 'Fulham|2025-09-13', 'Leeds|2025-09-15']);
    expect(k.has('Arsenal|2025-09-20')).toBe(false);
  });

  test('hardOpponents: minst 6 moten och lag poang eller dalig mot marknaden, samst forst', async () => {
    const { hardOpponents } = await lib('learnings-signals.mjs');
    const h2h = [
      { opp: 'Man City', n: 15, w: 2, d: 3, l: 10, res: -0.3 },
      { opp: 'Liverpool', n: 16, w: 3, d: 6, l: 7, res: -0.21 },
      { opp: 'Brighton', n: 17, w: 7, d: 5, l: 5, res: -0.45 },
      { opp: 'Chelsea', n: 16, w: 10, d: 4, l: 2, res: 0.69 },
      { opp: 'Ipswich', n: 2, w: 0, d: 0, l: 2, res: -1 }, // for fa moten
    ];
    const hard = hardOpponents(h2h);
    expect(hard.map((h: any) => h.opp)).toEqual(['Man City', 'Liverpool', 'Brighton']);
    expect(hard[0].ppg).toBeCloseTo(0.6, 5);
    expect(hardOpponents([])).toEqual([]);
    expect(hardOpponents(undefined)).toEqual([]);
  });
});
// ---------- team-style.mjs: fasta situationer och stilsammanfattning ----------

test.describe('team-style: fasta situationer', () => {
  test('statFields: sasongstotal blir per match, xG ur SubStatValue, xG 0 = saknas', async () => {
    const { statFields } = await lib('team-style.mjs');
    expect(statFields('poss', { StatValue: 59.3, MatchesPlayed: 5 })).toEqual({ poss: 59.3 });
    expect(statFields('spFor', { StatValue: 23, SubStatValue: 20.6, MatchesPlayed: 38 })).toEqual({ spFor: 0.605, spXgFor: 0.542 });
    expect(statFields('spAgainst', { StatValue: 7, SubStatValue: 0, MatchesPlayed: 38 })).toEqual({ spAgainst: 0.184, spXgAgainst: null });
    expect(statFields('corners', { StatValue: 216, SubStatValue: 0, MatchesPlayed: 38 })).toEqual({ corners: 5.684 });
    expect(statFields('spFor', { StatValue: 3, SubStatValue: 2, MatchesPlayed: 0 })).toEqual({ spFor: null, spXgFor: null });
  });

  test('spValue: snitt av mal och xG, bara mal om xG saknas', async () => {
    const { spValue } = await lib('team-style.mjs');
    expect(spValue(0.6, 0.5)).toBeCloseTo(0.55, 9);
    expect(spValue(0.4, null)).toBe(0.4);
    expect(spValue(null, 0.5)).toBeNull();
  });

  test('styleSummary: basta/samsta typer aven svaga, minsta antal matcher, stabilitet', async () => {
    const { styleSummary, ownStyleLabels } = await lib('team-style.mjs');
    const tj = {
      own: { poss: { c: 0 }, direct: { c: 1 }, press: { c: 0 }, spAtt: { c: 2 }, spDef: { c: 0 } },
      vs: {
        'poss|Bollinnehav': { n: 87, rel: 0.23, zRel: 2.1, both: true, strong: true },
        'direct|Direktspel': { n: 106, rel: -0.12, zRel: -1.0, both: true, strong: false },
        'poss|Backar hem': { n: 98, rel: -0.13, zRel: -1.0, both: false, strong: false },
        'spDef|Svag mot fasta': { n: 60, rel: 0.05, zRel: 0.4, both: false, strong: false },
        'press|Högpress': { n: 10, rel: -0.9, zRel: -3, both: true, strong: true }, // for fa matcher
      },
    };
    const s = styleSummary(tj);
    expect(s.best.map((r: any) => r.type)).toEqual(['Bollinnehav', 'Svag mot fasta']);
    expect(s.best[0].stab).toBe('stabil');
    expect(s.worst.map((r: any) => [r.type, r.stab])).toEqual([['Direktspel', 'samma håll'], ['Backar hem', 'svag']]);
    expect(styleSummary(tj, { minN: 1 }).rows).toHaveLength(5);
    expect(styleSummary(null).rows).toEqual([]);
    expect(ownStyleLabels(tj.own)).toEqual(['Backar hem', 'Blandat', 'Lågpress', 'Farlig på fasta', 'Stark mot fasta']);
    expect(ownStyleLabels(null)).toEqual([]);
  });
});
// ---------- altitude.mjs: hoghojd ----------

test.describe('altitude: hoghojd', () => {
  test('isAltitudeGame: arena >= 1500 m och bortalaget minst 1000 m lagre, okanda lag = lag hojd', async () => {
    const { isAltitudeGame, altitudeOf } = await lib('altitude.mjs');
    expect(isAltitudeGame('MX', 'Toluca', 'Monterrey')).toBe(true);
    expect(isAltitudeGame('MX', 'Toluca', 'Club America')).toBe(false); // bada hoga
    expect(isAltitudeGame('MX', 'Monterrey', 'Toluca')).toBe(false); // lag arena
    expect(isAltitudeGame('MLS', 'Colorado Rapids', 'Seattle Sounders')).toBe(true);
    expect(isAltitudeGame('MLS', 'Real Salt Lake', 'Seattle Sounders')).toBe(false); // 1300 m < 1500
    expect(isAltitudeGame('PL', 'Arsenal', 'Leeds')).toBe(false);
    expect(altitudeOf('MLS', 'Seattle Sounders')).toBe(200);
  });

  test('altitudeStats och hardestAtAltitude: poang och mot marknaden per lag', async () => {
    const { altitudeStats, hardestAtAltitude } = await lib('altitude.mjs');
    const p = { pH: 0.5, pD: 0.25, pA: 0.25 }; // hemma vantas 1,75 p, borta 1,0 p
    const ms = [
      { home: 'Toluca', away: 'Monterrey', hg: 2, ag: 0, ...p },
      { home: 'Toluca', away: 'Monterrey', hg: 1, ag: 1, ...p },
      { home: 'Tigres UANL', away: 'Monterrey', hg: 0, ag: 1, ...p },
      { home: 'Toluca', away: 'Club America', hg: 0, ag: 0, ...p },
    ];
    const s = altitudeStats('MX', ms);
    expect(s.league.alt).toMatchObject({ n: 2, w: 1, d: 1, l: 0, ppg: 2 });
    expect(s.league.alt.res).toBeCloseTo(0.25, 9);
    expect(s.away.Monterrey.alt).toMatchObject({ n: 2, ppg: 0.5 });
    expect(s.away.Monterrey.other).toMatchObject({ n: 1, ppg: 3 });
    expect(s.home.Toluca.alt.n).toBe(2);
    expect(s.home.Toluca.other.n).toBe(1);
    expect(s.home['Tigres UANL']).toBeUndefined(); // lag arena
    const hard = hardestAtAltitude(s, { minN: 2 });
    expect(hard.map((h: any) => h.team)).toEqual(['Monterrey']);
    expect(hard[0].diff).toBeCloseTo(-2.5, 9);
    // utan odds: poang men inget mot marknaden
    const noOdds = altitudeStats('COL', [{ home: 'Millonarios', away: 'Atlético Junior', hg: 1, ag: 0 }]);
    expect(noOdds.league.alt).toMatchObject({ n: 1, ppg: 3, res: null });
  });
});
// ---------- extra-signals.mjs + learned-adjust: hoghojd och fasta i motorerna ----------

test.describe('extra-signals och hoghojdsjustering', () => {
  test('prevSeason och seasonOf: host-var och kalenderar som i data/matcher', async () => {
    const { prevSeason, seasonOf } = await lib('extra-signals.mjs');
    expect(prevSeason('2026/27')).toBe('2025/26');
    expect(prevSeason('2000/01')).toBe('1999/00');
    expect(prevSeason('2026')).toBe('2025');
    expect(seasonOf('PL', '2026-10-04')).toBe('2026/27');
    expect(seasonOf('PL', '2027-03-01')).toBe('2026/27');
    expect(seasonOf('MX', '2026-07-20')).toBe('2026/27');
    expect(seasonOf('MLS', '2026-10-04')).toBe('2026');
    expect(seasonOf('AR', '2026-02-10')).toBe('2026'); // AR spelar kalenderar sedan 2021
    expect(seasonOf('JP1', '2026-10-04')).toBe('2026/27'); // J1 host-var sedan 2026/27
    expect(seasonOf('SE2', '2026-10-04')).toBe('2026/27'); // ESPN/FotMob-ligor markas host-var av storen
  });

  test('seasonOf: samma etikett som senaste matchen i varje data/matcher-fil', async () => {
    const { seasonOf } = await lib('extra-signals.mjs');
    const dir = path.join(ROOT, 'data', 'matcher');
    let checked = 0;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.csv'))) {
      const [head, ...rows] = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
      const cols = head.split(',');
      const [iS, iD, iSt] = ['season', 'date', 'status'].map((c) => cols.indexOf(c));
      const last = rows.map((r) => r.split(',')).filter((r) => r[iSt] === 'spelad' && r[iS]).at(-1);
      if (!last) continue;
      expect(seasonOf(f.slice(0, -4), last[iD]), f).toBe(last[iS]);
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
  });

  test('extraSignals: alt bara i hoghojdsligor, sp ur forra sasongens z', async () => {
    const { extraSignals, spSignal } = await lib('extra-signals.mjs');
    const z = { MX: { '2025/26|Toluca': { spAtt: 1, spDef: -0.5 }, '2025/26|Monterrey': { spAtt: 0.2, spDef: 0.8 } }, ENG: { '2025/26|Arsenal': { spAtt: 1.5, spDef: -1 } } };
    // (1 + 0,8) - (0,2 + -0,5) = 2,1
    expect(spSignal(z, 'MX', '2026/27', 'Toluca', 'Monterrey')).toBeCloseTo(2.1, 9);
    expect(extraSignals('MX', '2026/27', 'Toluca', 'Monterrey', z)).toEqual({ alt: 1, sp: expect.closeTo(2.1, 9) });
    expect(extraSignals('MX', '2026/27', 'Monterrey', 'Toluca', z).alt).toBe(0);
    // PL: ingen hoghojd, Leeds saknas i z -> ingen sp
    expect(extraSignals('PL', '2026/27', 'Arsenal', 'Leeds', z)).toEqual({});
    expect(spSignal(null, 'PL', '2026/27', 'Arsenal', 'Leeds')).toBeNull();
  });

  test('adjustProbs: hoghojd flyttar mot hemmalaget aven utan bas-justering, bara nar alt = 1', async () => {
    const { adjustProbs } = await lib('learned-adjust.mjs');
    const doc = { altitude: { MX: { b: 0.26 } } };
    const p = [0.5, 0.27, 0.23];
    const r = adjustProbs(p, 'MX', { alt: 1 }, 'close', doc);
    expect(r.applied).toEqual(['höghöjd']);
    expect(r.p[0]).toBeGreaterThan(0.52);
    expect(r.p[2]).toBeLessThan(0.23);
    expect(r.p.reduce((a: number, b: number) => a + b, 0)).toBeCloseTo(1, 9);
    expect(adjustProbs(p, 'MX', { alt: 0 }, 'close', doc)).toEqual({ p, applied: [] });
    expect(adjustProbs(p, 'PL', { alt: 1 }, 'close', doc).applied).toEqual([]);
    // ligakalibrering + hoghojd tillsammans
    const both = adjustProbs(p, 'MX', { alt: 1 }, 'open', { open: { leagues: { MX: { g: 0, h: 0.1, d: 0 } } }, altitude: { MX: { b: 0.26 } } });
    expect(both.applied).toEqual(['liga-kalibrering', 'höghöjd']);
  });

  test('fitAltitude: hittar positiv effekt nar hemmalaget pa hoghojd vinner oftare an oddsen', async () => {
    const { fitAltitude } = await lib('altitude.mjs');
    const rows: any[] = [];
    // 60 % hemmavinster i hoghojdsmatcher dar oddsen sager 50 %, fore och efter split
    for (let i = 0; i < 400; i++) {
      const date = i < 200 ? '2020-01-01' : '2024-01-01';
      rows.push({ date, p: [0.5, 0.27, 0.23], y: i % 10 < 6 ? 0 : i % 10 < 8 ? 1 : 2, alt: true });
      rows.push({ date, p: [0.5, 0.27, 0.23], y: i % 2 === 0 ? 0 : 1, alt: false });
    }
    const f = fitAltitude(rows, '2023-07-01');
    expect(f.bTrain).toBeGreaterThan(0.2);
    expect(f.test.dLL).toBeLessThan(0);
    expect(f.test.nAlt).toBe(200);
  });
});
// ---------- odds-history.mjs: dubbletter med olika versaler ----------

test.describe('odds-history: versaldubbletter', () => {
  test('mergeCaseDuplicates: en post per match, nyaste nyckeln, tidigaste first, summerade snapshots', async () => {
    const { mergeCaseDuplicates } = await lib('odds-history.mjs');
    const m: any = {
      '2026-10-15|EL|Jagiellonia Bialystok|ARARAT-ARMENIA': { match: 'Jagiellonia Bialystok vs ARARAT-ARMENIA', first: { at: '2026-09-29T04:00Z', odds: { home: 1.42 } }, last: { at: '2026-09-29T04:00Z' }, snapshots: 1 },
      '2026-10-15|EL|Jagiellonia Bialystok|Ararat-Armenia': { match: 'Jagiellonia Bialystok vs Ararat-Armenia', first: { at: '2026-10-01T10:00Z', odds: { home: 1.4 } }, last: { at: '2026-10-04T09:00Z' }, snapshots: 3 },
      '2026-10-10|PL|Arsenal|Leeds': { first: { at: '2026-09-28T10:00Z' }, last: { at: '2026-10-04T09:00Z' }, snapshots: 5 },
    };
    expect(mergeCaseDuplicates(m)).toBe(1);
    expect(Object.keys(m).sort()).toEqual(['2026-10-10|PL|Arsenal|Leeds', '2026-10-15|EL|Jagiellonia Bialystok|Ararat-Armenia']);
    const e = m['2026-10-15|EL|Jagiellonia Bialystok|Ararat-Armenia'];
    expect(e.match).toBe('Jagiellonia Bialystok vs Ararat-Armenia');
    expect(e.first.odds.home).toBe(1.42); // tidigaste oppningen behalls
    expect(e.last.at).toBe('2026-10-04T09:00Z');
    expect(e.snapshots).toBe(4);
    expect(mergeCaseDuplicates(m)).toBe(0);
  });
});
// ---------- team-aliases.mjs + odds-history: namnvarianter ----------

test.describe('lagnamn: varianter och dubbletter', () => {
  test('globala alias (TEAM_ALIASES) finns bara i config/team-aliases.json', async () => {
    const { TEAM_ALIASES } = await lib('team-aliases.mjs');
    const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'team-aliases.json'), 'utf8').replace(/^﻿/, ''));
    expect(TEAM_ALIASES).toEqual(json.global);
    expect(TEAM_ALIASES['PSV']).toBe('PSV Eindhoven');
    expect(TEAM_ALIASES['Atletico Madrid']).toBe('Ath Madrid');
    const weather = await import(pathToFileURL(path.join(ROOT, 'scripts', 'weather', 'teams.mjs')).href);
    expect(weather.TEAM_ALIASES, 'weather/teams.mjs läser samma objekt').toBe(TEAM_ALIASES);
    for (const f of ['pro-layer.mjs', 'fetch-extra-leagues.mjs', 'weather/teams.mjs']) {
      const src = fs.readFileSync(path.join(ROOT, 'scripts', f), 'utf8');
      expect(src, `${f}: ingen egen TEAM_ALIASES-lista`).not.toMatch(/TEAM_ALIASES\s*=\s*\{/);
    }
  });

  test('canonTeam: kanda varianter till namnet som anvands, per liga och skiftlageskansligt', async () => {
    const { canonTeam } = await lib('team-aliases.mjs');
    const al = { EK: { 'Gornik Z.': 'Gornik Zabrze' }, EL: { 'ARARAT-ARMENIA': 'Ararat-Armenia' } };
    expect(canonTeam('EK', 'Gornik Z.', al)).toBe('Gornik Zabrze');
    expect(canonTeam('EK', 'Gornik Zabrze', al)).toBe('Gornik Zabrze');
    expect(canonTeam('PL', 'Gornik Z.', al)).toBe('Gornik Z.'); // annan liga
    expect(canonTeam('EL', 'ARARAT-ARMENIA', al)).toBe('Ararat-Armenia');
    expect(canonTeam('EL', 'Ararat-armenia', al)).toBe('Ararat-armenia');
    expect(canonTeam('EL', null, al)).toBeNull();
  });

  test('config/team-aliases.json: olika klubbar slas aldrig ihop', async () => {
    const { loadAliases } = await lib('team-aliases.mjs');
    const al = loadAliases();
    const pairs: [string, string, string][] = [['AS', 'Osters', 'Ostersunds'], ['AS', 'Oster', 'Ostersunds'], ['EK', 'Zaglebie', 'Zaglebie Sosnowiec'], ['EK', 'Wisla', 'Wisla Plock'], ['BR2', 'Athletic', 'Athletico-PR'], ['JP1', 'Yamaga', 'Montedio Yamagata'], ['LL2', 'Lorca', 'Mallorca'], ['SE3N', 'Karlstad', 'FBK Karlstad']];
    for (const [lg, a, b] of pairs) {
      const ca = al[lg]?.[a] ?? a, cb = al[lg]?.[b] ?? b;
      expect(ca, `${lg}: ${a} och ${b} är olika klubbar`).not.toBe(cb);
    }
  });

  test('sameTeamName: kort/langt namn och accenter, men inte olika lag', async () => {
    const { sameTeamName } = await lib('team-aliases.mjs');
    expect(sameTeamName('Inter', 'Internazionale')).toBe(true);
    expect(sameTeamName('FC Koln', '1. FC Köln')).toBe(true);
    expect(sameTeamName('Bodo/Glimt', 'Bodø/Glimt')).toBe(true);
    expect(sameTeamName('Arsenal', 'Leeds')).toBe(false);
    expect(sameTeamName('', 'Leeds')).toBe(false);
  });

  test('mergeNameVariants: samma dag och liga med namnvarianter blir en post, olika matcher ror den inte', async () => {
    const { mergeNameVariants } = await lib('odds-history.mjs');
    const { sameTeamName } = await lib('team-aliases.mjs');
    const m: any = {
      '2026-10-13|CL|Internazionale|Club Brugge': { first: { at: '2026-09-29T04:00Z', odds: { home: 1.5 } }, last: { at: '2026-09-29T04:00Z' }, snapshots: 1 },
      '2026-10-13|CL|Inter|Club Brugge KV': { first: { at: '2026-10-01T10:00Z' }, last: { at: '2026-10-04T09:00Z' }, snapshots: 2 },
      '2026-10-13|CL|Viking FK|Bayern Munich': { first: { at: '2026-10-01T10:00Z' }, last: { at: '2026-10-04T09:00Z' }, snapshots: 1 },
      '2026-10-14|CL|Inter|Club Brugge KV': { first: { at: '2026-10-01T10:00Z' }, last: { at: '2026-10-04T09:00Z' }, snapshots: 1 }, // annan dag
    };
    expect(mergeNameVariants(m, sameTeamName)).toBe(1);
    expect(Object.keys(m).sort()).toEqual(['2026-10-13|CL|Inter|Club Brugge KV', '2026-10-13|CL|Viking FK|Bayern Munich', '2026-10-14|CL|Inter|Club Brugge KV']);
    expect(m['2026-10-13|CL|Inter|Club Brugge KV']).toMatchObject({ snapshots: 3, first: { odds: { home: 1.5 } } });
  });
});
test('mergeNameVariants: tva egna lag i historiken (Wisla / Wisla Plock) slas inte ihop samma dag', async () => {
  const { mergeNameVariants } = await lib('odds-history.mjs');
  const { sameTeamName } = await lib('team-aliases.mjs');
  const m: any = {
    '2018-11-10|EK|Wisla|Zaglebie': { first: { at: '1' }, last: { at: '1' }, snapshots: 1 },
    '2018-11-10|EK|Wisla Plock|Zaglebie Sosnowiec': { first: { at: '1' }, last: { at: '2' }, snapshots: 1 },
  };
  const hist = new Set(['Wisla', 'Wisla Plock', 'Zaglebie', 'Zaglebie Sosnowiec']);
  expect(mergeNameVariants(m, sameTeamName, (_lg: string, a: string, b: string) => hist.has(a) && hist.has(b))).toBe(0);
  expect(Object.keys(m)).toHaveLength(2);
  // utan spärren hade de slagits ihop
  expect(mergeNameVariants({ ...m }, sameTeamName)).toBe(1);
});
// ---------- next-round.mjs ----------

test.describe('next-round: bara kommande omgång per liga', () => {
  const now = new Date('2026-10-04T10:00:00');
  const fx = (league: string, date: string, round: string) => ({ league, date, round, home: `${league}${date}a`, away: `${league}${date}b` });

  test('säsongsmärkning i round (2026-allsvenskan) avgränsas på datum: 9–12 okt, inte 24 okt', async () => {
    const { nextRoundsFromFixtures, filterNextRoundOnly } = await lib('next-round.mjs');
    const fixtures = ['2026-10-09', '2026-10-10', '2026-10-12', '2026-10-17', '2026-10-24'].map((d) => fx('AS', d, '2026-allsvenskan'));
    const next = nextRoundsFromFixtures(fixtures, now);
    expect(next.get('AS')).toEqual({ type: 'date', value: '2026-10-09' });
    const kept = filterNextRoundOnly(fixtures, next).map((t: any) => t.date);
    expect(kept).toEqual(['2026-10-09', '2026-10-10', '2026-10-12']);
  });

  test('riktiga omgångar (Matchday 7/8) används som omgång', async () => {
    const { nextRoundsFromFixtures, filterNextRoundOnly } = await lib('next-round.mjs');
    const fixtures = [fx('PL', '2026-10-10', 'Matchday 7'), fx('PL', '2026-10-14', 'Matchday 7'), fx('PL', '2026-10-17', 'Matchday 8')];
    const next = nextRoundsFromFixtures(fixtures, now);
    expect(next.get('PL')).toEqual({ type: 'round', value: 'Matchday 7' });
    expect(filterNextRoundOnly(fixtures, next).map((t: any) => t.date)).toEqual(['2026-10-10', '2026-10-14']);
  });

  test('spelade matcher räknas inte, liga utan schema faller tillbaka på tidigaste datum', async () => {
    const { nextRoundsFromFixtures, filterNextRoundOnly } = await lib('next-round.mjs');
    const fixtures = [fx('PL', '2026-10-01', 'Matchday 6'), fx('PL', '2026-10-10', 'Matchday 7')];
    expect(nextRoundsFromFixtures(fixtures, now).get('PL')).toEqual({ type: 'date', value: '2026-10-10' });
    const tips = [fx('SE2', '2026-10-10', 'x'), fx('SE2', '2026-10-13', 'x'), fx('SE2', '2026-10-17', 'x')];
    expect(filterNextRoundOnly(tips, new Map()).map((t: any) => t.date)).toEqual(['2026-10-10', '2026-10-13']);
  });

  test('uppskjuten match utan nytt datum visas kvar och flyttar inte omgångsfönstret', async () => {
    const { nextRoundsFromFixtures, filterNextRoundOnly } = await lib('next-round.mjs');
    const pp = { ...fx('LL2', '2026-10-03', 'Grundserie'), postponed: true };
    const fixtures = [pp, fx('LL2', '2026-10-04', 'Grundserie'), fx('LL2', '2026-10-11', 'Grundserie')];
    const next = nextRoundsFromFixtures(fixtures, now);
    expect(next.get('LL2')).toEqual({ type: 'date', value: '2026-10-04' });
    expect(filterNextRoundOnly(fixtures, next).map((t: any) => t.date)).toEqual(['2026-10-03', '2026-10-04']);
    // Liga utan schema: den uppskjutna styr inte "tidigaste datum"
    const tips = [{ ...fx('SE2', '2026-09-30', 'x'), postponed: true }, fx('SE2', '2026-10-10', 'x'), fx('SE2', '2026-10-17', 'x')];
    expect(filterNextRoundOnly(tips, new Map()).map((t: any) => t.date)).toEqual(['2026-09-30', '2026-10-10']);
  });
});

// ---------- postponed.mjs ----------

test.describe('postponed: uppskjutna matcher försvinner inte tyst', () => {
  const now = new Date('2026-10-04T10:00:00Z');

  test('status och avspark avgör om matchen räknas som uppskjuten', async () => {
    const { postponedState } = await lib('postponed.mjs');
    // ESPN-status och FotMob-orsak
    expect(postponedState({ statusName: 'STATUS_POSTPONED', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('postponed');
    expect(postponedState({ cancelled: true, reason: 'Postponed', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('postponed');
    expect(postponedState({ cancelled: true, reason: 'PP', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('postponed');
    expect(postponedState({ statusName: 'STATUS_SUSPENDED', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('postponed');
    // Inställd = bort, spelad = inget
    expect(postponedState({ cancelled: true, reason: 'Cancelled', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('cancelled');
    expect(postponedState({ completed: true, statusName: 'STATUS_POSTPONED' }, now)).toBeNull();
    // Inte startad 4 h efter avspark (källan har inte satt status) = uppskjuten; pågående eller nyss = nej
    expect(postponedState({ statusName: 'STATUS_SCHEDULED', kickoffUtc: '2026-10-03T16:30Z' }, now)).toBe('postponed');
    expect(postponedState({ statusName: 'STATUS_SCHEDULED', kickoffUtc: '2026-10-04T07:00Z' }, now)).toBeNull();
    expect(postponedState({ started: true, kickoffUtc: '2026-10-03T16:30Z' }, now)).toBeNull();
    expect(postponedState({ statusName: 'STATUS_SCHEDULED', kickoffUtc: '2026-10-04T19:00Z' }, now)).toBeNull();
  });

  test('fönster bakåt: 7 dagar', async () => {
    const { withinLookback, POSTPONE_LOOKBACK_DAYS } = await lib('postponed.mjs');
    expect(POSTPONE_LOOKBACK_DAYS).toBe(7);
    expect(withinLookback('2026-09-28T16:30Z', now)).toBe(true);
    expect(withinLookback('2026-09-26T16:30Z', now)).toBe(false);
    expect(withinLookback('', now)).toBe(false);
  });

  test('Sabadell–Andorra: uppskjuten läggs till, men ersätts när nytt datum finns', async () => {
    const { mergePostponed } = await lib('postponed.mjs');
    const old = { date: '2026-10-03', league: 'LL2', home: 'Sabadell', away: 'Andorra', homeId: 4033, awayId: 494050, espnEventId: '401883190' };
    const other = { date: '2026-10-04', league: 'LL2', home: 'Girona', away: 'Mallorca', homeId: 7732, awayId: 8661 };
    // Inget nytt datum ännu -> kvar med postponed: true
    const a = mergePostponed([other], [old]);
    expect(a).toHaveLength(2);
    expect(a.find((f: any) => f.home === 'Sabadell')).toMatchObject({ date: '2026-10-03', postponed: true });
    // Nytt datum (samma lag) -> bara den nya raden
    const moved = { ...old, date: '2026-10-04', espnEventId: '401883190' };
    expect(mergePostponed([other, moved], [old]).filter((f: any) => f.home === 'Sabadell')).toEqual([moved]);
    // Samma ESPN-id men annat lagnamn i nya raden -> också omlagd
    expect(mergePostponed([{ ...moved, home: 'CE Sabadell', homeId: null }], [old])).toHaveLength(1);
    // Omvänd match (Andorra hemma) är inte samma match
    expect(mergePostponed([{ ...other, home: 'Andorra', away: 'Sabadell', homeId: 494050, awayId: 4033 }], [old])).toHaveLength(2);
    // Dubbletter från två källor/dagar -> en rad
    expect(mergePostponed([], [old, { ...old }])).toHaveLength(1);
  });
});

// ---------- transfer-study.mjs ----------

test.describe('transfer-study: ligabyten och prognos', () => {
  // [säsong, lagId, lag, övergång, [[ligaId, liga, matcher, mål, assist, betyg]]]
  const assadi = [
    ['2026', 8349, 'AIK', null, [[67, 'Allsvenskan', 4, 0, 0, 6.29]]],
    ['2026', 6310, 'Universidad de Chile', null, [[273, 'Liga de Primera', 15, 0, 4, 6.92], [9091, 'Copa Chile', 1, 0, 0, null]]],
    ['2025', 6310, 'Universidad de Chile', null, [[273, 'Liga de Primera', 16, 4, 6, 7.09], [299, 'Copa Sudamericana', 7, 5, 0, 7.74]]],
  ];

  test('careerSeasons och CUP_RE: cuper och Europaspel räknas inte som liga', async () => {
    const { careerSeasons, isLeagueName } = await lib('transfer-study.mjs');
    const rows = careerSeasons([{ seasonName: '2026', teamId: 1, team: 'AIK', transferType: { text: 'on loan' },
      tournamentStats: [{ leagueId: 67, leagueName: 'Allsvenskan', appearances: '4', goals: '0', assists: '1', rating: { rating: '6.29' } },
        { leagueId: 9, leagueName: 'Friendlies', isFriendly: true, appearances: '2' }] }]);
    expect(rows).toEqual([['2026', 1, 'AIK', 'on loan', [[67, 'Allsvenskan', 4, 0, 1, 6.29]]]]);
    for (const n of ['Allsvenskan', 'Liga de Primera', 'Premier League', 'Série A', 'Eliteserien', 'Championship', 'Serie A']) expect(isLeagueName(n)).toBe(true);
    for (const n of ['Copa Chile', 'Copa Sudamericana', 'Europa League', 'Champions League Qualification', 'DFB Pokal', 'U19 League', 'Euro', 'Premier League 2',
      'Paulista A1', 'Carioca Taca Guanabara', 'CONCACAF Champions Cup'])
      expect(isLeagueName(n)).toBe(false);
  });

  test('leagueMoves: Liga de Primera -> Allsvenskan, samma klubb två säsonger är inget byte, lån tillbaka hoppas över', async () => {
    const { leagueMoves, seasonEnd } = await lib('transfer-study.mjs');
    const mv = leagueMoves(assadi);
    expect(mv).toHaveLength(1);
    expect(mv[0]).toMatchObject({ loan: false, latest: true, from: { league: 'Liga de Primera', apps: 15, rating: 6.92 }, to: { league: 'Allsvenskan', apps: 4 } });
    const back = [['2025/2026', 2, 'B', 'back from loan', [[47, 'Premier League', 10, 0, 0, 6.8]]], ['2024/2025', 3, 'C', 'on loan', [[48, 'Championship', 30, 2, 2, 7.0]]]];
    expect(leagueMoves(back)).toHaveLength(0);
    expect(leagueMoves(assadi, { minEnd: 2027 })).toHaveLength(0);
    expect([seasonEnd('2025/2026'), seasonEnd('2025/26'), seasonEnd('2026')]).toEqual([2026, 2026, 2026]);
  });

  test('isSuccess: ordinarie och betyg minst ligans median', async () => {
    const { isSuccess } = await lib('transfer-study.mjs');
    expect(isSuccess({ share: 0.7, rating: 6.9, median: 6.8 })).toBe(true);
    expect(isSuccess({ share: 0.7, rating: 6.7, median: 6.8 })).toBe(false);
    expect(isSuccess({ share: 0.3, rating: 7.5, median: 6.8 })).toBe(false);
    expect(isSuccess({ share: 0.7, rating: 6.9, median: null })).toBeNull();
  });

  test('fitLeagueLevels: spelare tappar betyg i starkare liga -> högre nivå', async () => {
    const { fitLeagueLevels } = await lib('transfer-study.mjs');
    const moves = [];
    for (let i = 0; i < 30; i++) moves.push({ a: 1, b: 2, d: -0.3 }, { a: 2, b: 1, d: 0.3 }, { a: 2, b: 3, d: -0.2 });
    const lv = fitLeagueLevels(moves, { iters: 2000, ridge: 0.1 });
    expect(lv.get(2) - lv.get(1)).toBeCloseTo(0.3, 1);
    expect(lv.get(3) - lv.get(2)).toBeCloseTo(0.2, 1);
  });

  test('features: förväntat betyg i nya ligan = gammalt betyg minus nivåskillnad, mot nya ligans median', async () => {
    const { features } = await lib('transfer-study.mjs');
    const m = { born: '2004-01-08', pos: 'ytter', loan: false,
      from: { leagueId: 273, rating: 6.92, median: 6.8, share: 0.5, apps: 15, goals: 0, assists: 4 },
      to: { leagueId: 67, season: '2026', rating: 6.29, median: 6.85, share: 0.15, apps: 4 } };
    const f = features(m, new Map([[273, -0.26], [67, -0.17]]));
    expect(f.gap).toBeCloseTo(0.09, 5);
    expect(f.expRel).toBeCloseTo(6.92 - 0.09 - 6.85, 5);
    expect(f.age).toBeCloseTo(22.1, 1);
    expect(f.success).toBe(false);
    expect(f.x).toHaveLength(15);
    // Utan lagstyrka och marknadsvärde: lag = ligasnitt (0), värde saknas-flagga
    expect(f.x.slice(10)).toEqual([0, 0, f.relA, 6, 1]);
    // Två säsonger viktas med matcher; marknadsvärde som log10
    const two = features({ ...m, value: 2_000_000, prev: { rating: 7.09, median: 6.79, apps: 15 } }, new Map([[273, -0.26], [67, -0.17]]));
    expect(two.rel2).toBeCloseTo(((6.92 - 6.8) * 15 + (7.09 - 6.79) * 15) / 30, 5);
    expect(two.logValue).toBeCloseTo(Math.log10(2_000_000), 5);
    expect(features({ ...m, from: { ...m.from, rating: null } }, new Map([[273, 0], [67, 0]])).x).toBeNull();
    // Pågående säsong: prognos finns fast utfallet inte går att avgöra än
    const ongoing = features({ ...m, to: { ...m.to, season: '2026/2027', share: null } }, new Map([[273, -0.26], [67, -0.17]]));
    expect(ongoing.success).toBeNull();
    expect(ongoing.x).toHaveLength(15);
  });

  test('prevSeasonName och buildMoves: pågående säsong utan median lånar förra säsongens', async () => {
    const { prevSeasonName, buildMoves } = await lib('transfer-study.mjs');
    expect([prevSeasonName('2026/2027'), prevSeasonName('2026'), prevSeasonName('x')]).toEqual(['2025/2026', '2025', null]);
    const p = { id: 'a', seasons: [['2026/2027', 2, 'Liverpool', null, [[47, 'Premier League', 3, 0, 0, 6.6]]], ['2025/2026', 1, 'PSG', null, [[53, 'Ligue 1', 30, 5, 5, 7.1]]]] };
    const ls = new Map([['47|2026/2027', { rounds: 5, median: null }], ['47|2025/2026', { rounds: 38, median: 6.8 }], ['53|2025/2026', { rounds: 34, median: 6.75 }]]);
    const [mv] = buildMoves([p], ls);
    expect(mv.to).toMatchObject({ median: 6.8, medianFromPrev: true });
    expect(mv.from).toMatchObject({ median: 6.75, medianFromPrev: false });
  });

  test('teamMedian och leagueSeasonStats: spelaren själv räknas inte, trupperna fyller på medianen utan dubbletter', async () => {
    const { teamSeasonStats, teamMedian, leagueSeasonStats } = await lib('transfer-study.mjs');
    const players = Array.from({ length: 7 }, (_, i) => ({ id: `p${i}`, seasons: [['2026', 8349, 'AIK', null, [[67, 'Allsvenskan', 20, 0, 0, 6.5 + i * 0.1]]]] }));
    const ts = teamSeasonStats(players);
    expect(teamMedian(ts, 8349, '2026', 'p6')).toBeCloseTo(6.75, 5); // 6,5–7,0 utan p6 (7,1)
    expect(teamMedian(ts, 8349, '2026', 'p0')).toBeCloseTo(6.85, 5);
    expect(teamMedian(ts, 9999, '2026', 'p0')).toBeNull();
    const extra = [{ id: 'p0', leagueId: 67, season: '2026', apps: 20, rating: 9.9 }, { id: 'x', leagueId: 67, season: '2026', apps: 30, rating: 6.0 }];
    const ls = leagueSeasonStats(players, extra).get('67|2026');
    expect(ls.n).toBe(8); // p0 räknas en gång
    expect(ls.rounds).toBe(30);
  });

  test('logistic och auc: hittar ett tydligt samband', async () => {
    const { logistic, auc } = await lib('transfer-study.mjs');
    const x = [], y = [];
    for (let i = 0; i < 200; i++) { const v = (i % 20) / 20; x.push([v, (i * 7) % 13]); y.push(v > 0.5 ? 1 : 0); }
    const m = logistic(x, y);
    expect(m.predict([0.9, 3])).toBeGreaterThan(0.8);
    expect(m.predict([0.1, 3])).toBeLessThan(0.2);
    expect(auc(x.map((r) => m.predict(r)), y)).toBeGreaterThan(0.95);
    expect(auc([0.1, 0.9], [0, 1])).toBe(1);
  });
});

// ---------- http.mjs och api-schemas.mjs (lokal testserver, inget nät) ----------

test.describe('http: gemensam hämtning med omförsök, strypning och formatkontroll', () => {
  // Servern svarar enligt en lista per sökväg: [status, body, headers?, fördröjning?]. Sista svaret upprepas.
  const http = require('http');
  let server: any, base = '';
  const plans: Record<string, any[][]> = {};
  const hits: Record<string, number> = {};
  test.beforeAll(async () => {
    server = http.createServer((req: any, res: any) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      hits[p] = (hits[p] || 0) + 1;
      const plan = plans[p] || [[404, '']];
      const [status, body, headers, delayMs] = plan[Math.min(hits[p] - 1, plan.length - 1)];
      setTimeout(() => { res.writeHead(status, { 'content-type': 'application/json', ...(headers || {}) }); res.end(body); }, delayMs || 0);
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  test.afterAll(() => server.close());
  const fast = { retryDelayMs: 5, throttleMs: 5, log: () => {} };

  test('5xx och tomt svar försöks igen, sedan lyckas det', async () => {
    const { getJson, _resetHttpState } = await lib('http.mjs');
    _resetHttpState();
    plans['/a'] = [[500, 'fel'], [200, ''], [200, '{"ok":1}']];
    expect(await getJson(`${base}/a`, fast)).toEqual({ ok: 1 });
    expect(hits['/a']).toBe(3);
  });

  test('404: null med orNull, annars HttpError med status – och inget nytt försök', async () => {
    const { getJson, HttpError } = await lib('http.mjs');
    plans['/saknas'] = [[404, '']];
    expect(await getJson(`${base}/saknas`, { ...fast, orNull: true })).toBeNull();
    const err = await getJson(`${base}/saknas`, fast).catch((e: any) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
    expect(hits['/saknas']).toBe(2);
  });

  test('övriga 4xx försöks inte igen; ger upp efter retries och kastar senaste felet', async () => {
    const { getJson } = await lib('http.mjs');
    plans['/400'] = [[400, '']];
    expect((await getJson(`${base}/400`, fast).catch((e: any) => e)).status).toBe(400);
    expect(hits['/400']).toBe(1);
    plans['/alltid500'] = [[503, '']];
    expect((await getJson(`${base}/alltid500`, { ...fast, retries: 2 }).catch((e: any) => e)).status).toBe(503);
    expect(hits['/alltid500']).toBe(3);
  });

  test('429 med Retry-After pausar värden; 403 räknas som strypning bara när det anges', async () => {
    const { getJson, _resetHttpState } = await lib('http.mjs');
    _resetHttpState();
    plans['/strypt'] = [[429, '', { 'retry-after': '1' }], [200, '{"ok":2}']];
    const t = Date.now();
    expect(await getJson(`${base}/strypt`, fast)).toEqual({ ok: 2 });
    expect(Date.now() - t).toBeGreaterThanOrEqual(900); // Retry-After 1 s respekteras
    _resetHttpState();
    plans['/f403'] = [[403, ''], [200, '{"ok":3}']];
    expect((await getJson(`${base}/f403`, fast).catch((e: any) => e)).status).toBe(403);
    expect(await getJson(`${base}/f403`, { ...fast, throttleStatus: [429, 403] })).toEqual({ ok: 3 });
  });

  test('tidsgräns: ett anrop som hänger avbryts och försöks igen', async () => {
    const { getJson, _resetHttpState } = await lib('http.mjs');
    _resetHttpState();
    plans['/seg'] = [[200, '{"x":1}', {}, 1000], [200, '{"x":2}']];
    expect(await getJson(`${base}/seg`, { ...fast, timeoutMs: 200 })).toEqual({ x: 2 });
  });

  test('formatfel: null med orNull, annars FormatError – loggas en gång per källa och räknas', async () => {
    const { getJson, FormatError, formatErrors, _resetHttpState } = await lib('http.mjs');
    const { z } = require('zod');
    _resetHttpState();
    plans['/form'] = [[200, '{"draws":"inte en lista"}']];
    const schema = z.object({ draws: z.array(z.unknown()) });
    const logged: string[] = [];
    const o = { ...fast, schema, label: 'Test', log: (s: string) => logged.push(s) };
    expect(await getJson(`${base}/form`, { ...o, orNull: true })).toBeNull();
    const err = await getJson(`${base}/form`, o).catch((e: any) => e);
    expect(err).toBeInstanceOf(FormatError);
    expect(err.message).toContain('draws');
    expect(logged.length).toBe(1);
    expect(formatErrors.get('Test')).toBe(2);
    expect(hits['/form']).toBe(2); // formatfel försöks inte igen
    // Rätt format: originalet returneras med alla fält (schemat skalar inte bort något)
    plans['/ratt'] = [[200, '{"draws":[1],"extra":"kvar"}']];
    expect(await getJson(`${base}/ratt`, o)).toEqual({ draws: [1], extra: 'kvar' });
  });

  test('getText och pool: text utan tolkning, pool håller ordningen och högst n samtidiga', async () => {
    const { getText, pool, sleep } = await lib('http.mjs');
    plans['/csv'] = [[200, 'a,b\n1,2\n']];
    expect(await getText(`${base}/csv`, fast)).toBe('a,b\n1,2\n');
    let now = 0, max = 0;
    const out = await pool([5, 1, 4, 2, 3], 2, async (x: number) => { now++; max = Math.max(max, now); await sleep(x * 3); now--; return x * 10; });
    expect(out).toEqual([50, 10, 40, 20, 30]);
    expect(max).toBe(2);
  });

  test('fotmobGet: andra värdar hämtas utan kontroll; schema finns för alla FotMob-anrop som görs', async () => {
    const { fotmobGet, fotmobSchemas } = await lib('api-schemas.mjs');
    plans['/ej-fotmob'] = [[200, '{"vad":"som helst"}']];
    expect(await fotmobGet(`${base}/ej-fotmob`, fast)).toEqual({ vad: 'som helst' });
    // Alla FotMob-sökvägar som skripten anropar ska ha ett schema (nya anrop utan schema fångas här)
    const used = new Set<string>();
    const walk = (d: string) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.mjs')) for (const m of fs.readFileSync(p, 'utf8').matchAll(/(?:\$\{FM\}|fotmob\.com\/api\/data)\/([a-zA-Z/]+)\?/g)) used.add(m[1] === 'search/suggest' ? 'suggest' : m[1]);
    } };
    walk(path.join(ROOT, 'scripts'));
    expect(used.size).toBeGreaterThan(4);
    for (const k of used) expect(Object.keys(fotmobSchemas)).toContain(k);
  });
});

test.describe('api-schemas: FotMob, Svenska Spel och ATG', () => {
  const team = (id: any, name: string) => ({ id, name });
  test('FotMob: verkliga former godkänns (id som text eller tal, trupp null), saknade nyckelfält underkänns', async () => {
    const { fotmobSchemas: F } = await lib('api-schemas.mjs');
    const lg = { details: { id: 47, name: 'Premier League', selectedSeason: '2026/2027' }, table: [{ data: {} }],
      fixtures: { allMatches: [{ id: '5795363', home: team('9825', 'Arsenal'), away: team('8669', 'Coventry City'), status: { utcTime: '2026-08-21T19:00:00Z' } }] } };
    expect(F.leagues.safeParse(lg).success).toBe(true);
    expect(F.leagues.safeParse({ ...lg, details: { id: 47 } }).success).toBe(false);
    expect(F.leagues.safeParse({ ...lg, fixtures: { allMatches: [{ id: 1, home: { id: 1 }, away: team(2, 'B') }] } }).success).toBe(false);
    const md = { general: { matchId: '5795363', leagueName: 'Premier League' }, header: { teams: [team(9825, 'Arsenal'), team(8669, 'Coventry')] }, content: { lineup: {} } };
    expect(F.matchDetails.safeParse(md).success).toBe(true);
    expect(F.matchDetails.safeParse({ general: md.general }).success).toBe(false); // content saknas
    expect(F.teams.safeParse({ details: { id: 169, name: 'Lag' }, squad: { squad: null } }).success).toBe(true);
    expect(F.playerData.safeParse({ id: 737066, name: 'Erling Haaland', careerHistory: null }).success).toBe(true);
    expect(F.playerData.safeParse({ id: '737066', name: 'Erling Haaland' }).success).toBe(false);
    expect(F.matches.safeParse({ leagues: [{ id: 1, matches: [{ id: 5181831, home: team(6383, 'Greece'), away: team(8570, 'Germany') }] }] }).success).toBe(true);
    expect(F.matches.safeParse({ date: '20261004' }).success).toBe(false);
    expect(F.suggest.safeParse([{ suggestions: [{ type: 'team', id: '9825', name: 'Arsenal' }, { type: 'match', id: '1' }] }]).success).toBe(true);
  });

  test('Svenska Spel och ATG: drawEvents (inte events), öppen kupong utan resultat, kalender och spel', async () => {
    const { svsSchemas: V, atgSchemas: A } = await lib('api-schemas.mjs');
    const draw = { drawNumber: 4974, drawState: 'Open', regCloseTime: '2026-10-11T13:59:00+02:00', drawEvents: [{ eventNumber: 1, cancelled: false }] };
    expect(V.draws.safeParse({ draws: [draw], error: null }).success).toBe(true);
    expect(V.draws.safeParse({ error: { code: 500 } }).success).toBe(false);
    expect(V.draw.safeParse({ draw }).success).toBe(true);
    expect(V.draw.safeParse({ draw: { ...draw, drawNumber: '4974' } }).success).toBe(false);
    expect(V.result.safeParse({ result: { drawNumber: 4973, events: [], distribution: [] } }).success).toBe(true);
    expect(A.calendar.safeParse({ date: '2026-10-05', tracks: [{ id: 40, name: 'Solvalla' }], games: { V86: [{ id: 'V86_2026-10-05_40_1' }] } }).success).toBe(true);
    expect(A.calendar.safeParse({ date: '2026-10-05', games: [] }).success).toBe(false);
    expect(A.game.safeParse({ id: 'V86_2026-10-05_40_1', races: [{ id: '2026-10-05_40_1', starts: [{ number: 1 }] }] }).success).toBe(true);
    expect(A.game.safeParse({ id: 'V86_2026-10-05_40_1', races: [{ id: '2026-10-05_40_1', starts: [{ number: '1' }] }] }).success).toBe(false);
  });
});

// ---------- transfermarkt.mjs: skadelistan (2026-10-05) ----------

test.describe('transfermarkt: skadelistan fyller på FotMob', () => {
  const row = (cls: string, id: string, name: string, club: string, injury: string, until: string, value: string) =>
    `<tr class="${cls}"> <td> <table class="inline-table"> <tr> <td rowspan="2"><img title="${name}" /></td> <td class="hauptlink"> <a title="${name}" href="/x/profil/spieler/${id}">${name}</a> </td> </tr> <tr> <td>Left-Back</td> </tr> </table> </td>`
    + `<td class="zentriert no-border-rechts"><a title="${club}" href="/x/startseite/verein/1"><img title="${club}" /></a></td><td class="links">${injury}</td><td class="zentriert">${until}</td><td class="rechts">${value}</td></tr>`;
  const html = `<table class="items"><thead><tr><th>x</th></tr></thead><tbody>${row('odd', '1', 'Rio Adebisi', 'Peterborough United', 'Knee injury', '', '€225k')}${row('even', '2', 'Frankie Kent', 'Oxford United', 'Hamstring injury', '23/10/2026', '€1.20m')}${row('odd', '3', 'Okand Spelare', 'Leicester City', 'Ankle injury', '', '€50k')}</tbody></table>`;

  test('parseTmInjuries: namn, klubb, skada, åter och marknadsvärde', async () => {
    const { parseTmInjuries } = await lib('transfermarkt.mjs');
    const inj = parseTmInjuries(html);
    expect(inj).toHaveLength(3);
    expect(inj[0]).toEqual({ tmId: '1', name: 'Rio Adebisi', club: 'Peterborough United', injury: 'Knee injury', until: null, value: 225000 });
    expect(inj[1].until).toBe('23/10/2026');
    expect(inj[1].value).toBe(1200000);
    expect(parseTmInjuries(null)).toEqual([]);
  });

  test('mergeTmInjuries: bästa klubbmatchning (Peterborough United hamnar inte i Oxford United), FotMob går före, gamla TM-skador rensas', async () => {
    const { parseTmInjuries, mergeTmInjuries } = await lib('transfermarkt.mjs');
    const teams: any = {
      Oxford: { fotmobName: 'Oxford United', players: [{ name: 'Frankie Kent', injury: { typeId: '42', expectedReturn: 'Doubtful' } }, { name: 'Will Vaulks', injury: { typeId: null, expectedReturn: 'Unknown', source: 'Transfermarkt' } }] },
      Peterboro: { fotmobName: 'Peterborough United', players: [{ name: 'Rio Adebisi', injury: null }] },
      Leicester: { fotmobName: 'Leicester City', players: [{ name: 'Jordan Ayew', injury: null }] },
    };
    expect(mergeTmInjuries(teams, parseTmInjuries(html))).toBe(1);
    expect(teams.Peterboro.players[0].injury).toEqual({ typeId: null, expectedReturn: 'Unknown', name: 'Knee injury', source: 'Transfermarkt' });
    expect(teams.Oxford.players[0].injury.typeId).toBe('42'); // FotMobs markering ligger kvar
    expect(teams.Oxford.players[1].injury).toBeNull(); // frisk enligt dagens lista
    expect(teams.Leicester.players[0].injury).toBeNull(); // okand spelare: ingen gissning
  });

  test('TM_INJURY_LEAGUES: de engelska Stryktipsligorna', async () => {
    const { TM_INJURY_LEAGUES, TM_LEAGUE } = await lib('transfermarkt.mjs');
    expect(TM_INJURY_LEAGUES).toEqual(['PL', 'CH', 'EL1', 'EL2']);
    for (const c of TM_INJURY_LEAGUES) expect(TM_LEAGUE[c]).toBeTruthy();
  });
});

// ---------- learnings-data.mjs: stangningsodds utan Pinnacle (2026-10-05) ----------

test.describe('learnings-data: stängningsodds Pinnacle, annars Betfair-börsen, annars snitt', () => {
  test('closeOdds: källordning och marginalfria sannolikheter', async () => {
    const { closeOdds } = await lib('learnings-data.mjs');
    const all = { PSCH: '2', PSCD: '3.5', PSCA: '4', BFECH: '2.1', BFECD: '3.6', BFECA: '4.1', AvgCH: '1.95', AvgCD: '3.4', AvgCA: '3.8' };
    const a = closeOdds(all);
    expect(a.src).toBe('pinnacle');
    expect(a.sharp).toEqual(a.pin);
    expect(a.sharp.reduce((s: number, x: number) => s + x, 0)).toBeCloseTo(1, 10);
    const b = closeOdds({ ...all, PSCH: '', PSCD: '', PSCA: '' }); // 2026/27: football-data utan Pinnacle
    expect(b.src).toBe('betfair');
    expect(b.pin).toBeNull();
    expect(b.sharp).toEqual(b.bfe);
    const c = closeOdds({ AvgCH: '1.95', AvgCD: '3.4', AvgCA: '3.8' });
    expect([c.src, c.sharp]).toEqual(['snitt', null]);
    expect(c.avg).not.toBeNull();
    expect(closeOdds({}).src).toBeNull();
  });
});

// ---------- matcher-rows.mjs: data/matcher (2026-10-05) ----------

test.describe('matcher-rows: domare, väntande matcher och frånvaro före matchen', () => {
  test('extraCols: store går före, football-data-CSV:n fyller det som saknas', async () => {
    const { extraCols } = await lib('matcher-rows.mjs');
    const fd = { kickoff: '15:00', referee: 'P Howard', hc: 9, ac: 5, hf: 10, af: 21, hy: 2, ay: 3, hr: 0, ar: 0 };
    expect(extraCols(undefined, fd)).toEqual({ kickoff: '15:00', referee: 'P Howard', hc: 9, ac: 5, hf: 10, af: 21, hy: 2, ay: 3, hr: 0, ar: 0 });
    const store = { kickoff: '14:00', referee: 'N Hair', discipline: { homeCorners: 4, awayCorners: 6, homeYellow: 1, awayYellow: 0, homeRed: 0, awayRed: 1 } };
    const x = extraCols(store, fd);
    expect([x.kickoff, x.referee, x.hc, x.ac, x.hy, x.ay, x.ar]).toEqual(['14:00', 'N Hair', 4, 6, 1, 0, 1]);
    expect(x.hf).toBe(10); // store saknar frisparkar
    expect(extraCols(undefined, { hc: NaN }).hc).toBeNull();
  });

  test('pendingRows: spelad match utan resultat behålls som väntar i högst 21 dagar och bara med pre-data', async () => {
    const { pendingRows, PENDING_DAYS } = await lib('matcher-rows.mjs');
    expect(PENDING_DAYS).toBe(21);
    const prev = [
      { status: 'kommande', date: '2026-10-03', home: 'Reading', away: 'Bradford', pre_first_at: '2026-09-28', pre_first_h: '0.4' },
      { status: 'kommande', date: '2026-10-03', home: 'Burton', away: 'Huddersfield', pre_first_at: '2026-09-28' },
      { status: 'kommande', date: '2026-10-03', home: 'Utan', away: 'Data' },
      { status: 'väntar', date: '2026-09-01', home: 'Gammal', away: 'Match', pre_first_at: '2026-08-28' },
      { status: 'kommande', date: '2026-10-10', home: 'Framtida', away: 'Match', pre_first_at: '2026-10-01' },
      { status: 'spelad', date: '2026-10-03', home: 'Redan', away: 'Spelad', pre_first_at: '2026-09-28' },
      { status: 'väntar', date: '2026-10-01', home: 'Bara', away: 'Skador', pre_inj_at: '2026-09-30' },
    ];
    const out = pendingRows(prev, '2026-10-05', (r: any) => r.home === 'Burton');
    expect(out.map((r: any) => r.home)).toEqual(['Reading', 'Bara']);
    expect(out.every((r: any) => r.status === 'väntar')).toBe(true);
    expect(out[0].pre_first_h).toBe('0.4');
    expect(prev[0].status).toBe('kommande'); // originalet andras inte
  });

  test('squadAbsence: antal skadade och andel av truppens värde', async () => {
    const { squadAbsence } = await lib('matcher-rows.mjs');
    const team = { players: [{ value: 300, injury: { expectedReturn: 'Doubtful' } }, { value: 100, injury: null }, { value: 600, injury: null }, { value: null, injury: { x: 1 } }] };
    expect(squadAbsence(team)).toEqual({ n: 2, share: 0.3 });
    expect(squadAbsence({ players: [{ value: null, injury: null }] })).toEqual({ n: 0, share: null });
    expect(squadAbsence(undefined)).toBeNull();
  });

  test('carryPre: första oddsen behålls, senaste odds och frånvaro uppdateras, spelad rad ärver allt', async () => {
    const { carryPre, INJ } = await lib('matcher-rows.mjs');
    expect(INJ).toEqual(['pre_inj_at', 'pre_inj_h', 'pre_inj_a', 'pre_injv_h', 'pre_injv_a']);
    const prev = { pre_first_at: 't1', pre_first_h: 0.5, pre_first_d: 0.3, pre_first_a: 0.2, pre_last_at: 't2', pre_last_h: 0.55, pre_last_d: 0.25, pre_last_a: 0.2, pre_best_h: 1.9, pre_best_d: 4, pre_best_a: 5, pre_inj_at: 't2', pre_inj_h: 3, pre_inj_a: 1, pre_injv_h: 0.2, pre_injv_a: 0.05 };
    // Spelad rad (inga egna pre-varden): arver allt
    const played: any = carryPre({ status: 'spelad' }, prev);
    expect([played.pre_first_at, played.pre_last_h, played.pre_best_a, played.pre_inj_h, played.pre_injv_a]).toEqual(['t1', 0.55, 5, 3, 0.05]);
    // Kommande med nya odds men utan ny franvaro: forsta fran prev, senaste odds nya, franvaro fran prev
    const up: any = carryPre({ pre_last_at: 't3', pre_last_h: 0.6, pre_last_d: 0.2, pre_last_a: 0.2 }, prev);
    expect([up.pre_first_at, up.pre_first_h, up.pre_last_h, up.pre_inj_h]).toEqual(['t1', 0.5, 0.6, 3]);
    // Ny franvaro skrivs inte over
    const inj: any = carryPre({ pre_inj_at: 't3', pre_inj_h: 0, pre_inj_a: 0, pre_injv_h: 0, pre_injv_a: 0 }, prev);
    expect([inj.pre_inj_h, inj.pre_last_h]).toEqual([0, 0.55]);
    // Ingen tidigare rad: forsta = senaste
    const fresh: any = carryPre({ pre_last_at: 't9', pre_last_h: 0.4, pre_last_d: 0.3, pre_last_a: 0.3 }, undefined);
    expect([fresh.pre_first_at, fresh.pre_first_h]).toEqual(['t9', 0.4]);
  });
});

test.describe('xp-table: förväntade poäng (xP) och förväntad tabellplats', () => {
  const m = (home: string, away: string, hg: number, ag: number, hxg: number | null, axg: number | null) => ({ home, away, hg, ag, hxg, axg });

  test('tabellplats efter poäng, xP ur xG och förväntad plats efter xP', async () => {
    const { xpTable } = await lib('xp-table.mjs');
    // A vinner två matcher på tur (lågt xG), B förlorar trots klart bäst xG
    const t = xpTable([m('A', 'B', 1, 0, 0.3, 2.5), m('C', 'A', 0, 1, 2.2, 0.4), m('B', 'C', 0, 0, 2.0, 0.5)]);
    const a = t.byTeam.get('A'), b = t.byTeam.get('B'), c = t.byTeam.get('C');
    expect(t.complete).toBe(true);
    expect([a.pos, a.pts, a.played]).toEqual([1, 6, 2]);
    expect(a.xp).toBeLessThan(1);
    expect(b.xp).toBeGreaterThan(a.xp + 2);
    expect(b.xpPos).toBe(1);
    expect(a.xpPos).toBe(3);
    expect([b.pts, c.pts]).toEqual([1, 1]);
    expect([b.pos, c.pos].sort()).toEqual([2, 3]);
  });

  test('saknar någon match xG: xP bara ur matcher med xG och ingen förväntad plats', async () => {
    const { xpTable } = await lib('xp-table.mjs');
    const t = xpTable([m('A', 'B', 2, 0, 1.8, 0.6), m('B', 'A', 1, 1, null, null)]);
    expect(t.complete).toBe(false);
    expect(t.byTeam.get('A').xgGames).toBe(1);
    expect(t.byTeam.get('A').xpPos).toBeNull();
    expect(t.byTeam.get('A').pts).toBe(4);
    expect(xpTable([]).rows).toEqual([]);
  });

  test('xpNotes: rad med xP och förväntad plats, otur/tur nämns först från 2 poängs skillnad', async () => {
    const { xpNotes } = await lib('xp-table.mjs');
    const p = (points: number, xp: number | null, position = 10, xpPosition: number | null = 5) => ({ points, xp, position, xpPosition });
    const out = xpNotes(p(9, 10.4, 18, 15), p(11, 14.2, 13, 1), 'Sheffield U', 'Lincoln');
    expect(out[0]).toBe('Förväntade poäng (xP, ur xG): Sheffield U 10,4 mot 9 verkliga (förväntad plats 15, verklig 18) · Lincoln 14,2 mot 11 verkliga (förväntad plats 1, verklig 13).');
    expect(out).toHaveLength(2); // Sheffield U -1,4 nämns inte, Lincoln -3,2 gör det
    expect(out[1]).toBe('Lincoln har fått 3,2 poäng mindre än spelet motiverar (otur – kan vända).');
    expect(xpNotes(p(12, 9.5), p(5, 5), 'A', 'B')[1]).toBe('A har fått 2,5 poäng mer än spelet motiverar (tur – kan vända).');
    expect(xpNotes(p(5, 5, 3, null), p(5, 5), 'A', 'B')[0]).toContain('A 5,0 mot 5 verkliga ·');
    expect(xpNotes(p(5, null), p(5, 5), 'A', 'B')).toEqual([]);
  });
});

// ---------- matchstats.mjs (ESPN/365scores -> data/matchstats -> data/matcher) ----------

const espnSummary = (o: any = {}) => ({
  header: {
    id: '401', competitions: [{
      date: '2026-09-20T12:00Z', status: { type: { completed: o.completed ?? true } },
      competitors: [
        { homeAway: 'home', id: '10', score: '1', team: { id: '10', displayName: 'Djurgården' }, linescores: [{ displayValue: '0' }, { displayValue: '1' }] },
        { homeAway: 'away', id: '20', score: '2', team: { id: '20', displayName: 'IF Elfsborg' }, linescores: [{ displayValue: '1' }, { displayValue: '1' }] },
      ],
    }],
  },
  gameInfo: { venue: { fullName: 'Tele2 Arena' }, attendance: 0, officials: [{ displayName: 'Oscar Johnson', position: { name: 'Referee' } }] },
  boxscore: {
    teams: o.noStats ? [{ team: { id: '10' }, statistics: [] }, { team: { id: '20' }, statistics: [{ name: 'totalShots', displayValue: '0' }] }] : [
      { team: { id: '10' }, statistics: [
        { name: 'possessionPct', displayValue: '55.6' }, { name: 'totalShots', displayValue: '9' }, { name: 'shotsOnTarget', displayValue: '2' },
        { name: 'wonCorners', displayValue: '4' }, { name: 'foulsCommitted', displayValue: '8' }, { name: 'yellowCards', displayValue: '1' },
        { name: 'redCards', displayValue: '0' }, { name: 'totalPasses', displayValue: '543' }, { name: 'accuratePasses', displayValue: '458' },
        { name: 'offsides', displayValue: '2' },
      ] },
      { team: { id: '20' }, statistics: [
        { name: 'possessionPct', displayValue: '44.4' }, { name: 'totalShots', displayValue: '15' }, { name: 'shotsOnTarget', displayValue: '3' },
        { name: 'wonCorners', displayValue: '7' }, { name: 'foulsCommitted', displayValue: '7' }, { name: 'yellowCards', displayValue: '0' },
        { name: 'redCards', displayValue: '0' }, { name: 'totalPasses', displayValue: '432' },
      ] },
    ],
  },
  keyEvents: [
    { type: { type: 'yellow-card' }, team: { id: '10' }, period: { number: 1 } },
    { type: { type: 'goal' }, team: { id: '20' }, period: { number: 1 }, scoringPlay: true },
    { type: { type: 'red-card' }, team: { id: '20' }, period: { number: 2 } },
  ],
  rosters: [
    { homeAway: 'home', formation: '4-2-3-1', roster: [
      { starter: true, athlete: { id: '1', displayName: 'Jacob Rinne' }, position: { abbreviation: 'G' }, stats: [{ name: 'saves', value: 1 }, { name: 'goalsConceded', value: 2 }] },
      { starter: true, subbedOut: true, athlete: { id: '2', displayName: 'Piotr Johansson' }, position: { abbreviation: 'LB' },
        plays: [{ substitution: true, clock: { displayValue: "60'" } }], stats: [{ name: 'totalShots', value: 1 }] },
      { starter: false, subbedIn: true, athlete: { id: '3', displayName: 'Max Larsson' }, position: { abbreviation: 'SUB' },
        plays: [{ substitution: true, clock: { displayValue: "90'+7'" } }], stats: [] },
      { starter: false, subbedIn: false, athlete: { id: '4', displayName: 'Bänkad' }, stats: [{ name: 'appearances', value: 0 }] },
    ] },
    { homeAway: 'away', formation: '3-5-2', roster: [] },
  ],
});
const playerMap = (m: any, cols: string[]) => Object.fromEntries(m.p.map((r: any[]) => [r[1], Object.fromEntries(cols.map((c, i) => [c, r[i]]))]));

test.describe('matchstats: ESPN-sammanfattning', () => {
  test('lagstatistik, halvtid, domare, formation och spelare med minuter', async () => {
    const { parseEspnSummary, PLAYER_COLS } = await lib('matchstats.mjs');
    const m = parseEspnSummary(espnSummary());
    expect(m).toMatchObject({ src: 'espn', id: '401', d: '2026-09-20', h: 'Djurgården', a: 'IF Elfsborg', hg: 1, ag: 2, ht: [0, 1], ref: 'Oscar Johnson', form: ['4-2-3-1', '3-5-2'] });
    expect(m.t.h).toMatchObject({ poss: 55.6, sh: 9, sot: 2, cor: 4, fou: 8, yc: 1, pas: 543, pasok: 458, off: 2 });
    expect(m.t.a.sh).toBe(15);
    expect(m.ev).toEqual({ yc: [1, 0], rc: [0, 1], g1: [0, 1] });
    const p = playerMap(m, PLAYER_COLS);
    expect(Object.keys(p)).toEqual(['Jacob Rinne', 'Piotr Johansson', 'Max Larsson']); // oanvänd avbytare utelämnas
    expect(p['Jacob Rinne']).toMatchObject({ side: 'h', start: 1, min: 90, sav: 1, gc: 2 });
    expect(p['Piotr Johansson']).toMatchObject({ out: 1, min: 60, sh: 1 });
    expect(p['Max Larsson']).toMatchObject({ in: 1, min: 1 }); // inhopp i tilläggstid = minst 1 minut
  });

  test('ej färdigspelad -> null; bara nollor = saknad lagstatistik (äldre säsonger), händelserna finns kvar', async () => {
    const { parseEspnSummary } = await lib('matchstats.mjs');
    expect(parseEspnSummary(espnSummary({ completed: false }))).toBeNull();
    expect(parseEspnSummary({})).toBeNull();
    const m = parseEspnSummary(espnSummary({ noStats: true }));
    expect(m.t).toEqual({ h: null, a: null });
    expect(m.ev.yc).toEqual([1, 0]);
  });
});

test.describe('matchstats: 365scores', () => {
  const game = (o: any = {}) => ({
    id: 77, statusGroup: o.statusGroup ?? 4, startTime: '2026-10-10T07:30:00+00:00', officials: [{ name: 'Byung-Jin Park' }],
    venue: { name: 'Gimcheon Stadium', attendance: 2363 },
    stages: [{ id: 7, shortName: 'HT', homeCompetitorScore: 0, awayCompetitorScore: 1 }],
    homeCompetitor: { id: 1, name: 'Gimcheon', score: 0, lineups: { formation: '4-4-2', members: [
      { id: 11, status: 1, position: { name: 'Goalkeeper' }, stats: [{ type: 30, value: "90'" }, { type: 23, value: '6' }, { type: 35, value: '1' }] },
      { id: 12, status: 1, position: { name: 'Defender' }, stats: [{ type: 30, value: "76'" }] },
      { id: 13, status: 2, substitution: { time: 77 }, position: { name: 'Defender' }, stats: [{ type: 30, value: "14'" }] },
      { id: 14, status: 2, position: { name: 'Forward' }, stats: [] },
    ] } },
    awayCompetitor: { id: 2, name: 'FC Anyang', score: 1, lineups: { formation: '4-3-3', members: [] } },
    members: [{ id: 11, athleteId: 501, name: 'Man-ho Park' }, { id: 12, athleteId: 502, name: 'Park Min-Seo' }, { id: 13, athleteId: -1, name: 'Park Jin-Seong' }, { id: 14, name: 'Bänkad' }],
    events: [
      { competitorId: 1, eventType: { id: 2, name: 'Yellow Card' }, playerId: 12, gameTime: 25 },
      { competitorId: 2, eventType: { id: 1, name: 'Goal' }, playerId: 99, extraPlayers: [98], gameTime: 37 },
      { competitorId: 1, eventType: { id: 1000, name: 'Substitution' }, playerId: 13, extraPlayers: [12], gameTime: 76 },
    ],
  });
  const stats = { statistics: [
    { name: 'Possession', competitorId: 1, value: '60%' }, { name: 'Total Shots', competitorId: 1, value: '11' },
    { name: 'Corners', competitorId: 1, value: '9' }, { name: 'Fouls', competitorId: 1, value: '15' },
    { name: 'Possession', competitorId: 2, value: '40%' }, { name: 'Total Shots', competitorId: 2, value: '12' },
    { name: 'Corners', competitorId: 2, value: '1' }, { name: 'Attacks', competitorId: 2, value: '77' },
  ] };

  test('lag, halvtid, kort ur händelser och spelare (inhoppare, utbytt)', async () => {
    const { parse365, PLAYER_COLS } = await lib('matchstats.mjs');
    const m = parse365(game(), stats);
    expect(m).toMatchObject({ src: '365', id: '77', d: '2026-10-10', hg: 0, ag: 1, ht: [0, 1], ref: 'Byung-Jin Park', att: 2363, form: ['4-4-2', '4-3-3'] });
    expect(m.t.h).toMatchObject({ poss: 60, sh: 11, cor: 9, fou: 15 });
    expect(m.t.a).toMatchObject({ poss: 40, att: 77 });
    expect(m.ev).toEqual({ yc: [1, 0], rc: [0, 0], g1: [0, 1] });
    const p = playerMap(m, PLAYER_COLS);
    expect(Object.keys(p)).toEqual(['Man-ho Park', 'Park Min-Seo', 'Park Jin-Seong']);
    expect(p['Man-ho Park']).toMatchObject({ id: '501', start: 1, min: 90, sav: 6, gc: 1 });
    expect(p['Park Min-Seo']).toMatchObject({ out: 1, min: 76, yc: 1 });
    expect(p['Park Jin-Seong']).toMatchObject({ id: '13', in: 1, min: 14 }); // athleteId -1 -> lineup-id
  });

  test('inte slutspelad -> null, utan statistik -> bara händelser', async () => {
    const { parse365 } = await lib('matchstats.mjs');
    expect(parse365(game({ statusGroup: 2 }), stats)).toBeNull();
    const m = parse365(game(), null);
    expect(m.t).toEqual({ h: null, a: null });
    expect(m.ev.yc).toEqual([1, 0]);
  });
});

test.describe('matchstats: koppling till data/matcher-raderna', () => {
  const score = (a: string, b: string) => (a === b ? 1 : a.split(' ')[0] === b.split(' ')[0] ? 0.6 : 0);
  const c = (o: any) => ({ d: '2026-09-20', h: 'Djurgarden', a: 'Elfsborg', hg: 1, ag: 2, ...o });

  test('findStatMatch: datum ±1 dag, samma resultat, båda lagen; tvetydigt -> null', async () => {
    const { findStatMatch } = await lib('matchstats.mjs');
    const row = { date: '2026-09-20', home: 'Djurgarden', away: 'Elfsborg', hg: 1, ag: 2 };
    expect(findStatMatch(row, [c({ d: '2026-09-21' })], score)).toMatchObject({ d: '2026-09-21' });
    expect(findStatMatch(row, [c({ d: '2026-09-22' })], score)).toBeNull();
    expect(findStatMatch(row, [c({ hg: 2 })], score)).toBeNull(); // annat resultat
    expect(findStatMatch(row, [c({ a: 'Hammarby' })], score)).toBeNull(); // bortalaget liknar inte
    expect(findStatMatch(row, [c({ id: 1 }), c({ id: 2 })], score)).toBeNull(); // två lika bra
    expect(findStatMatch(row, [c({ id: 1, d: '2026-09-21' }), c({ id: 2 })], score)).toMatchObject({ id: 2 }); // samma dag vinner
    expect(findStatMatch({ ...row, hg: '', ag: '' }, [c({})], score)).toBeTruthy(); // rad utan resultat: namn + datum räcker
  });

  test('applyStats: fyller bara tomma (även NaN), nya kolumner sätts, kort ur händelser utan lagstatistik', async () => {
    const { applyStats, parseEspnSummary } = await lib('matchstats.mjs');
    const r: any = applyStats({ hs: 20, as: NaN, hc: '', ac: null, referee: 'Fd-domare' }, parseEspnSummary(espnSummary()));
    expect(r).toMatchObject({
      hs: 20, as: 15, hc: 4, ac: 7, hf: 8, af: 7, referee: 'Fd-domare', poss_h: 55.6, poss_a: 44.4, pas_h: 543, pasok_h: 458, pasok_a: null,
      off_h: 2, htg_h: 0, htg_a: 1, form_h: '4-2-3-1', stats_src: 'espn',
    });
    const old = applyStats({}, parseEspnSummary(espnSummary({ noStats: true })));
    expect(old).toMatchObject({ hy: 1, ay: 0, hr: 0, ar: 1, poss_h: null, referee: 'Oscar Johnson' });
    expect(applyStats({ hs: 1 }, null)).toEqual({ hs: 1 });
  });

  test('seasonPlayers: summa per spelare och lag, sorterad på minuter', async () => {
    const { seasonPlayers, parseEspnSummary } = await lib('matchstats.mjs');
    const m = parseEspnSummary(espnSummary());
    const s = seasonPlayers([m, m]);
    expect(s[0]).toMatchObject({ name: 'Jacob Rinne', team: 'Djurgården', apps: 2, starts: 2, min: 180, sav: 2, gc: 4 });
    expect(s.find((x: any) => x.name === 'Max Larsson')).toMatchObject({ subIns: 2, min: 2 });
  });

  test('exporten skriver STAT_COLS och Opta används bara som reserv', async () => {
    const { STAT_COLS } = await lib('matchstats.mjs');
    const src = fs.readFileSync(path.join(ROOT, 'scripts', 'export-league-matches.mjs'), 'utf8');
    expect(src).toContain('...STAT_COLS');
    expect(src).toContain("if (src === 'opta' && r.stats_src) continue;");
    expect(STAT_COLS).toEqual(expect.arrayContaining(['poss_h', 'pas_h', 'off_h', 'htg_h', 'form_h', 'stats_src']));
  });
});

// ---------- klubbtrupper.mjs (AIK:s uttagningar och truppstatus) ----------

test.describe('klubbtrupper: AIK', () => {
  const picked = Array.from({ length: 11 }, (_, i) => `<strong>${i + 2} </strong>Spelare ${i + 2}<br/>`).join('');
  const squadHtml = '<main><h1>Truppen mot BP</h1>'
    + '<p class="Preamble_preamble__text__uiJvl">Följande spelare till dagens allsvenska hemmamatch mot IF Brommapojkarna. Avspark sker kl 15:00 på Strawberry Arena.</p>'
    + `<h3>Den uttagna truppen:</h3><p>${picked}<strong>15</strong> Kristoffer Nordfeldt (mv)<br/><strong>30 </strong>Kalle Joelsson (mv)</p>`
    + '<h3 id="Ej-uttagna">Ej uttagna:</h3><ul><li><p>Dino Beširović (skadad)</p></li><li><p>Norton de Carvalho (ej uttagen)</p></li>'
    + '<li><p>Någon Avstängd (avstängd)</p></li></ul><p>Se truppstatus</p></main>';
  const statusHtml = '<main><h1>Truppstatus: Herrlaget v.41 (2026)</h1><h3 id="a">Taha Ayari</h3><p>Åter i full träning.</p>'
    + '<h3 id="b">Dino Beširović</h3><p>Befinner sig i rehabilitering för en skada i baksida lår.</p></main>';

  test('sitemapArticles: uttagningar och truppstatus, datum ur adressen, utan dubbletter', async () => {
    const { sitemapArticles } = await lib('klubbtrupper.mjs');
    const xml = 'artiklar-och-nyheter/261010-truppen-mot-bp artiklar-och-nyheter/261010-truppen-mot-bp artiklar-och-nyheter/261007-truppstatus-herrlaget-v41-2026 artiklar-och-nyheter/261009-ny-vd';
    const a = sitemapArticles(xml);
    expect(a.map((x: any) => [x.date, x.kind])).toEqual([['2026-10-07', 'status'], ['2026-10-10', 'trupp']]);
    expect(a[1].url).toBe('https://www.aikfotboll.se/artiklar-och-nyheter/261010-truppen-mot-bp');
  });

  test('parseSquadArticle: uttagna, målvakter, ej uttagna med orsak, hemma och avspark', async () => {
    const { parseSquadArticle } = await lib('klubbtrupper.mjs');
    const s = parseSquadArticle(squadHtml);
    expect(s).toMatchObject({ opponent: 'BP', team: 'herr', home: true, kickoff: '15:00' });
    expect(s.players).toHaveLength(13);
    expect(s.players.filter((p: any) => p.gk).map((p: any) => p.name)).toEqual(['Kristoffer Nordfeldt', 'Kalle Joelsson']);
    expect(s.out).toEqual([{ name: 'Dino Beširović', reason: 'skadad' }, { name: 'Norton de Carvalho', reason: 'ej uttagen' }, { name: 'Någon Avstängd', reason: 'avstängd' }]);
  });

  test('parseStatusArticle: vecka, status per spelare, åter i träning', async () => {
    const { parseStatusArticle } = await lib('klubbtrupper.mjs');
    const s = parseStatusArticle(statusHtml);
    expect(s).toMatchObject({ week: 41, team: 'herr' });
    expect(s.players.map((p: any) => [p.name, p.back])).toEqual([['Taha Ayari', true], ['Dino Beširović', false]]);
  });

  test('mergeClubInjuries: rehab och skadad/avstängd markeras; ej uttagen, gamla artiklar och FotMob-markeringar lämnas', async () => {
    const { mergeClubInjuries, parseSquadArticle, parseStatusArticle } = await lib('klubbtrupper.mjs');
    const { sameName } = await lib('transfermarkt.mjs');
    const doc = {
      squads: [{ date: '2026-10-10', url: 'u1', ...parseSquadArticle(squadHtml) }],
      status: [{ date: '2026-10-07', url: 'u2', ...parseStatusArticle(statusHtml) }],
    };
    const team: any = { players: [
      { name: 'Dino Besirovic', injury: null }, { name: 'Norton de Carvalho', injury: null }, { name: 'Taha Ayari', injury: null },
      { name: 'Någon Avstängd', injury: { source: 'FotMob' } }, { name: 'Gammal', injury: { source: 'Klubben' } },
    ] };
    expect(mergeClubInjuries(team, doc, '2026-10-10', sameName)).toBe(1);
    expect(team.players[0].injury).toMatchObject({ source: 'Klubben', url: 'u2' });
    expect(team.players[1].injury).toBeNull(); // ej uttagen = inte frånvaro
    expect(team.players[2].injury).toBeNull(); // åter i träning
    expect(team.players[3].injury).toEqual({ source: 'FotMob' });
    expect(team.players[4].injury).toBeNull(); // förra körningens klubbmarkering rensas
    const t2: any = { players: [{ name: 'Dino Besirovic', injury: null }] };
    expect(mergeClubInjuries(t2, doc, '2026-10-25', sameName)).toBe(0); // för gamla artiklar
  });
});

// ---------- opta.mjs ----------

test.describe('opta: livescore', () => {
  const m = (o: any = {}) => ({
    id: 'x1', status: 'played', date: 1791585000, comp: { name: 'Liga Profesional Argentina', country: { name: 'argentina' } },
    home: { id: 'h', name: 'Instituto' }, away: { id: 'a', name: 'Boca Juniors' },
    score: { ht: { home: 1, away: 1 }, ft: { home: 2, away: 2 } },
    events: [
      { teamId: 'h', entity_type: 'card', type: 'YC', min: 22, reason: 'Foul', playerName: 'G. Abregú' },
      { teamId: 'a', entity_type: 'card', type: 'Y2C', min: 80, reason: 'Dissent' },
      { teamId: 'a', entity_type: 'goal', type: 'G', min: 23 },
    ],
    ...o,
  });

  test('parseOpta: halvtid, slutresultat, kort med orsak; andra gula = utvisning; ligakod', async () => {
    const { parseOpta, optaLeague } = await lib('opta.mjs');
    const x = parseOpta(m());
    expect(x).toMatchObject({ src: 'opta', h: 'Instituto', a: 'Boca Juniors', hg: 2, ag: 2, ht: [1, 1], ev: { yc: [1, 0], rc: [0, 1] } });
    expect(x.cards[0]).toEqual(['h', 22, 'YC', 'Foul', 'G. Abregú']);
    expect(optaLeague(m())).toBe('AR');
    expect(optaLeague(m({ comp: { name: 'Okänd', country: { name: 'x' } } }))).toBeNull();
    expect(parseOpta(m({ status: 'fixture' }))).toBeNull();
  });
});

// ---------- nya ligor (BE, SC, SAU, AUS, KR, CAN) och matchstatistikens källor ----------

test('ligaregister: nya ligor har FotMob-id, statistikkälla och historik', async () => {
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'leagues.json'), 'utf8'));
  const { FOTMOB_LEAGUES } = await lib('fotmob-leagues.mjs');
  for (const code of ['BE', 'SC', 'SAU', 'AUS', 'KR', 'CAN']) {
    const lg = reg.leagues[code];
    expect(lg, code).toBeTruthy();
    expect(FOTMOB_LEAGUES[code], code).toBe(lg.fotmobId);
    expect(lg.espn || lg.s365, `${code} saknar statistikkälla`).toBeTruthy();
  }
  for (const [code, lg] of Object.entries<any>(reg.leagues)) {
    if (lg.espnStats) expect(lg.espn, `${code}: espnStats bara när espn saknas`).toBeFalsy();
    if (lg.s365) expect(Number.isInteger(lg.s365), code).toBe(true);
  }
  const { MAIN } = await lib('learnings-data.mjs');
  expect(MAIN).toEqual(expect.arrayContaining(['BE', 'SC']));
});

// ---------- pick-1x2.mjs (kryssregeln) ----------

test.describe('pick-1x2: kryssregeln', () => {
  test('X blir tipset nar krysset ligger inom 6 %-enheter fran favoriten', async () => {
    const { pick1x2, DRAW_MARGIN } = await lib('pick-1x2.mjs');
    expect(DRAW_MARGIN).toBe(0.06);
    expect(pick1x2({ home: 0.35, draw: 0.31, away: 0.34 })).toEqual({ pick: 'X', confidence: 0.31, drawRule: 'nara' });
    expect(pick1x2({ home: 0.31, draw: 0.32, away: 0.37 }).pick).toBe('X'); // bortafavorit 5 enheter fore
    // Como-Roma 2026-10-11: X 10,7 enheter efter -> hemmafavoriten kvar
    expect(pick1x2({ home: 0.374, draw: 0.267, away: 0.358 }, 'SA').pick).toBe('1');
  });
  test('klar favorit och 7 enheter ger favoriten, X hogst ger X utan regel', async () => {
    const { pick1x2 } = await lib('pick-1x2.mjs');
    expect(pick1x2({ home: 0.62, draw: 0.22, away: 0.16 }).pick).toBe('1');
    expect(pick1x2({ home: 0.37, draw: 0.30, away: 0.33 }).pick).toBe('1');
    expect(pick1x2({ home: 0.30, draw: 0.40, away: 0.30 })).toEqual({ pick: 'X', confidence: 0.4, drawRule: null });
    expect(pick1x2({ home: 0.2, draw: 0.32, away: 0.48 }, null, 0.2).pick).toBe('X'); // egen marginal
  });
  test('Serie B: X nar krysset ar minst 29 %, andra ligor och lagre kryss far favoriten', async () => {
    const { pick1x2, DRAW_LEAGUES } = await lib('pick-1x2.mjs');
    expect(DRAW_LEAGUES).toEqual({ SB: 0.29 });
    expect(pick1x2({ home: 0.42, draw: 0.30, away: 0.28 }, 'SB')).toEqual({ pick: 'X', confidence: 0.3, drawRule: 'liga' });
    expect(pick1x2({ home: 0.42, draw: 0.30, away: 0.28 }, 'SA').pick).toBe('1');
    expect(pick1x2({ home: 0.47, draw: 0.28, away: 0.25 }, 'SB').pick).toBe('1');
    expect(pick1x2({ home: 0.36, draw: 0.32, away: 0.32 }, 'SB').drawRule).toBe('nara'); // nara-regeln gar forst
  });
});

// ---------- upset-pick.mjs (skräll med värde) ----------

test.describe('upset-pick: skräll med värde', () => {
  const fair = { home: 0.55, draw: 0.24, away: 0.21 };
  const v = (pick: string, ev: number, extra = {}) => ({ market: '1X2', pick, odds: 5, bookmaker: 'Unibet (SE)', p: 0.21, ev, value: true, fairSource: 'pinnacle', ...extra });
  test('2 som inte är favorit med minst 6 % värde mot Pinnacle blir skräll', async () => {
    const { findUpset, UPSET_MIN_EV } = await lib('upset-pick.mjs');
    expect(UPSET_MIN_EV).toBe(0.06);
    expect(findUpset(fair, { away: v('2', 0.06) })).toEqual({ pick: '2', odds: 5, bookmaker: 'Unibet (SE)', p: 0.21, ev: 0.06 });
    expect(findUpset(fair, { away: v('2', 0.059) })).toBeNull(); // EV 3–6 % gick minus i backtest
  });
  test('favoriten, X, Ej värde och snittfacit blir aldrig skräll', async () => {
    const { findUpset } = await lib('upset-pick.mjs');
    expect(findUpset(fair, { home: v('1', 0.1) })).toBeNull();
    expect(findUpset(fair, { draw: v('X', 0.1) })).toBeNull();
    expect(findUpset(fair, { away: v('2', 0.1, { value: false }) })).toBeNull(); // över odds-taket / misstänkt
    expect(findUpset(fair, { away: v('2', 0.1, { fairSource: 'snitt av 14 bolag' }) })).toBeNull();
    expect(findUpset(fair, { away: v('2', 0.1, { fairSource: 'betfair-exchange' }) })?.pick).toBe('2');
    expect(findUpset(null, { away: v('2', 0.1) })).toBeNull();
  });
  test('bortafavorit: hemmaskrällen väljs, högst EV vinner', async () => {
    const { findUpset } = await lib('upset-pick.mjs');
    const f = { home: 0.25, draw: 0.27, away: 0.48 };
    expect(findUpset(f, { home: v('1', 0.07), away: v('2', 0.2) })?.pick).toBe('1');
    expect(findUpset({ home: 0.2, draw: 0.5, away: 0.3 }, { home: v('1', 0.07), away: v('2', 0.09) })?.pick).toBe('2');
  });
});

// ---------- elo-1x2.mjs ----------

test.describe('elo-1x2: 1X2 ur Klubb-Elo utan odds', () => {
  test('eloProbs summerar till 1, hemmafordel och starkare lag ger hogre chans', async () => {
    const { eloProbs } = await lib('elo-1x2.mjs');
    const even = eloProbs(1700, 1700);
    expect(even.home + even.draw + even.away).toBeCloseTo(1, 6);
    expect(even.home).toBeGreaterThan(even.away);
    const strong = eloProbs(1900, 1600);
    expect(strong.home).toBeGreaterThan(0.6);
    expect(eloProbs(1600, 1900).away).toBeGreaterThan(eloProbs(1600, 1900).home);
  });

  test('eloProbs kalibrerad: Elo-skillnaden krymps till 75 %, favoriten far lagre chans, kryss och underdog mer', async () => {
    const { eloProbs, eloToLambdas, CLUB_ELO_SCALE, CLUB_HOME_ADV } = await lib('elo-1x2.mjs');
    expect(CLUB_ELO_SCALE).toBe(0.75);
    const kal = eloProbs(1900, 1600);
    const ra = eloProbs(1900, 1600, CLUB_HOME_ADV, 1);
    // Bakkorning 2026-10-12: Elo-favoriten fick ~3-4 enh. for mycket, 70 %+ fick 77 % men vann 73 %
    expect(ra.home - kal.home).toBeGreaterThan(0.03);
    expect(kal.away).toBeGreaterThan(ra.away);
    expect(kal.draw).toBeGreaterThan(ra.draw); // jamnare match -> lite mer kryss
    expect(kal.draw - ra.draw).toBeLessThan(ra.home - kal.home);
    expect(kal.home + kal.draw + kal.away).toBeCloseTo(1, 6);
    // Samma sak som att krympa skillnaden for hand; landslags-Elo (eloToLambdas utan skala) ar orort
    const hand = eloToLambdas(1600 + 0.75 * (1900 + CLUB_HOME_ADV - 1600), 1600, 0);
    expect(kal.lh).toBeCloseTo(hand.lh, 6);
    expect(eloToLambdas(1900, 1600, 100).we).toBeCloseTo(1 / (10 ** (-400 / 400) + 1), 9);
    // Lika lag utan hemmafordel: skalan andrar ingenting
    const jamn = eloProbs(1700, 1700, 0);
    expect(jamn.home).toBeCloseTo(jamn.away, 6);
  });

  test('findClubElo inom ett land: "Bodö/Glimt" (svenskt ö) hittar "Bodø/Glimt"', async () => {
    const { findClubElo } = await lib('elo-1x2.mjs');
    const nor = { countries: { NOR: { clubs: [{ name: 'Bodø/Glimt', elo: 1790 }, { name: 'Brann', elo: 1600 }] } } };
    expect(findClubElo('Bodö/Glimt', nor, 0.6)?.clubEloName).toBe('Bodø/Glimt');
    expect(findClubElo('Bodö/Glimt', nor, 0.6)?.elo).toBe(1790);
  });

  test('findClubElo: exakt namn gar fore prefix, engelska stadsnamn oversatts', async () => {
    const { findClubElo } = await lib('elo-1x2.mjs');
    const cache = { countries: {
      FRA: { clubs: [{ name: 'Lille', elo: 1780 }, { name: 'Red Star', elo: 1580 }] },
      NOR: { clubs: [{ name: 'Lillestrøm', elo: 1515 }] },
      NED: { clubs: [{ name: 'Sparta', elo: 1497 }] },
      CZE: { clubs: [{ name: 'Sparta Praha', elo: 1653 }] },
      SRB: { clubs: [{ name: 'Crvena Zvezda', elo: 1668 }] },
    } };
    expect(findClubElo('Lillestrom', cache)?.clubEloName).toBe('Lillestrøm');
    expect(findClubElo('Lille', cache)?.clubEloName).toBe('Lille');
    expect(findClubElo('Sparta Prague', cache)?.clubEloName).toBe('Sparta Praha');
    expect(findClubElo('Red Star Belgrade', cache)?.clubEloName).toBe('Crvena Zvezda');
    expect(findClubElo('Okänt FC', cache)).toBeNull();
  });

  test('clubEloLookup: Elo + plats i landet, bara ligans land, en klubb till ett lag', async () => {
    const { clubEloLookup } = await lib('elo-1x2.mjs');
    const cache = { countries: {
      SWE: { clubs: [{ name: 'AIK', elo: 1526.3, level: 1 }, { name: 'Hammarby', elo: 1621.9, level: 1 }, { name: 'Öster', elo: 1413.7, level: 2 }] },
      ITA: { clubs: [{ name: 'Juventus', elo: 1841.7, level: 1 }] },
      POR: { clubs: [{ name: 'Nacional', elo: 1450, level: 1 }] },
    } };
    const domestic = [
      { name: 'AIK', country: 'Sweden', tier: 1 }, { name: 'Skövde AIK', country: 'Sweden', tier: 3 },
      { name: 'Hammarby', country: 'Sweden', tier: 1 }, { name: 'Hammarby Talang', country: 'Sweden', tier: 3 },
      { name: 'Östers IF', country: 'Sweden', tier: 2 }, { name: 'Östersunds FK', country: 'Sweden', tier: 2 },
      { name: 'Juventus', country: 'Italy', tier: 1 }, { name: 'Juve Stabia', country: 'Italy', tier: 2 },
    ];
    const eloOf = clubEloLookup(cache, domestic);
    expect(eloOf('Hammarby', 'Sweden')).toEqual({ elo: 1622, rank: 1, country: 'SWE' });
    expect(eloOf('AIK', 'Sweden')).toEqual({ elo: 1526, rank: 2, country: 'SWE' });
    expect(eloOf('Skövde AIK', 'Sweden')).toBeNull();
    expect(eloOf('Hammarby Talang', 'Sweden')).toBeNull();
    expect(eloOf('Juve Stabia', 'Italy')).toBeNull();
    expect(eloOf('Östersunds FK', 'Sweden')).toBeNull(); // lika poang och samma niva -> ingen far Oster
    expect(eloOf('Nacional', 'Colombia')).toBeNull(); // land utan clubelo-sida
    expect(eloOf('Juventus', null)?.country).toBe('ITA'); // europacup: alla lander
  });
});

// ---------- squad-value.mjs ----------

test.describe('squad-value: truppvärde per lag', () => {
  const pl = (...v: (number | null)[]) => ({ players: v.map((x) => ({ info: { marketValue: x } })) });
  test('summerar marknadsvärden, hoppar över saknade, null utan värden', async () => {
    const { squadValue } = await lib('squad-value.mjs');
    expect(squadValue(pl(100, 50, null, 0))).toEqual({ value: 150, players: 2 });
    expect(squadValue(pl(null))).toBeNull();
    expect(squadValue(undefined)).toBeNull();
  });
  test('ligans egen fil först, Europacuptrupp bara när ligan saknar fil', async () => {
    const { squadValueLookup } = await lib('squad-value.mjs');
    const valueOf = squadValueLookup({ PL: { Arsenal: pl(10) }, CL: { Arsenal: pl(30), Rangers: pl(5) }, PT: { Nacional: pl(7) } });
    expect(valueOf('Arsenal', 'PL')?.value).toBe(10);
    expect(valueOf('Arsenal', 'CL')?.value).toBe(30);
    expect(valueOf('Rangers', 'SC')?.value).toBe(5); // SC saknar fil -> CL-truppen
    expect(valueOf('Rangers', 'PL')).toBeNull(); // PL har fil men inte laget -> aldrig från annan liga
    expect(valueOf('Nacional', 'URU')).toBeNull(); // samma namn i en annan liga (PT) är en annan klubb
  });
});

// ---------- team-elo.mjs ----------

test.describe('team-elo: eget lag-Elo ur ligaresultat', () => {
  test('startvarde per division, vinnaren tar poang av forloraren, inget efter cutoff', async () => {
    const { teamElo, TEAM_ELO_START } = await lib('team-elo.mjs');
    const ms = [
      { league: 'PL', date: '2026-08-01', home: 'A', away: 'B', hg: 2, ag: 1 },
      { league: 'CH', date: '2026-08-02', home: 'C', away: 'D', hg: 0, ag: 0 },
      { league: 'PL', date: '2026-08-09', home: 'B', away: 'A', hg: 5, ag: 0 },
    ];
    const r = teamElo(ms, '2026-08-05');
    expect(r.get('A')! + r.get('B')!).toBeCloseTo(2 * TEAM_ELO_START.PL, 6); // nollsumma
    expect(r.get('A')!).toBeGreaterThan(TEAM_ELO_START.PL);
    expect(r.get('C')! + r.get('D')!).toBeCloseTo(2 * TEAM_ELO_START.CH, 6);
    expect(r.get('C')!).toBeLessThan(TEAM_ELO_START.CH); // oavgjort hemma = under forvantan
    const later = teamElo(ms, '2026-08-10');
    expect(later.get('B')!).toBeGreaterThan(later.get('A')!); // 5-0 efter cutoff raknas forst nu
  });

  test('malskillnad vager som hos clubelo', async () => {
    const { goalDiffMult } = await lib('team-elo.mjs');
    expect(goalDiffMult(0)).toBe(1);
    expect(goalDiffMult(-1)).toBe(1);
    expect(goalDiffMult(2)).toBe(1.5);
    expect(goalDiffMult(3)).toBe(14 / 8);
    expect(goalDiffMult(-5)).toBe(2);
  });
});

// ---------- .github/workflows ----------

test.describe('arbetsfloden: npm ci fore node-skript', () => {
  // Stryktipsvakten kraschade (zod saknades) nar npm ci lag efter den, 10-11 okt 2026
  test('inget steg kor node scripts/... innan beroendena ar installerade', () => {
    const dir = path.join(ROOT, '.github', 'workflows');
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.yml'))) {
      const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
      const ci = lines.findIndex((l) => /\bnpm ci\b/.test(l));
      const node = lines.findIndex((l) => /\bnode scripts\//.test(l));
      if (node < 0) continue;
      expect(ci, `${f}: npm ci saknas`).toBeGreaterThanOrEqual(0);
      expect(ci, `${f}: node scripts/ på rad ${node + 1} före npm ci på rad ${ci + 1}`).toBeLessThan(node);
    }
  });
});

// ---------- seasons.mjs: sasonger fran datum och config/leagues.json i stallet for hardkodade ar ----------

test.describe('seasons: sasonger raknas fram, inga hardkodade ar', () => {
  test('seasonStartYear, etiketter och football-data-koder byter 1 juli', async () => {
    const { seasonStartYear, splitSeasonLabel, seasonCode } = await lib('seasons.mjs');
    expect(seasonStartYear('2026-06-30')).toBe(2025);
    expect(seasonStartYear('2026-07-01')).toBe(2026);
    expect(seasonStartYear('2027-03-01')).toBe(2026);
    expect(splitSeasonLabel(2026)).toBe('2026/27');
    expect(splitSeasonLabel(2099)).toBe('2099/00');
    expect(seasonCode(2026)).toBe('2627');
    expect(seasonCode(2009)).toBe('0910');
  });

  test('latestSeasons: ligans senaste etiketter i datan, flyttas fram av sig sjalv', async () => {
    const { latestSeasons } = await lib('seasons.mjs');
    const m = (season: string) => ({ season });
    expect([...latestSeasons([m('2024/25'), m('2026/27'), m('2025/26'), m('2026/27')], 2)]).toEqual(['2025/26', '2026/27']);
    expect([...latestSeasons([m('2027/28'), m('2026/27'), m('2025/26')], 2)]).toEqual(['2026/27', '2027/28']);
    expect(latestSeasons([], 2).size).toBe(0);
  });

  test('calendarLeagues: kalenderarsligor ur leagues.json, J1 inte langre med', async () => {
    const { calendarLeagues } = await lib('seasons.mjs');
    const cal = calendarLeagues();
    for (const c of ['AS', 'SE2', 'SE3N', 'SE3S', 'NO', 'NO2', 'BR', 'BR2', 'MLS', 'AR', 'COL', 'KR', 'CAN']) expect(cal.has(c), c).toBe(true);
    for (const c of ['PL', 'JP1', 'DK', 'AUS', 'SAU']) expect(cal.has(c), c).toBe(false);
    const { CALENDAR_LEAGUES } = await lib('referee-streaks.mjs');
    expect(CALENDAR_LEAGUES.has('SE3')).toBe(true); // Ettan Norra/Sodra delar domarnyckel
    expect(CALENDAR_LEAGUES.has('JP1')).toBe(false);
  });

  test('fd-main-ligor har football-data-divisionskod (Update-BettingStore.ps1 bygger hamtlistan)', async () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'leagues.json'), 'utf8').replace(/^\uFEFF/, ''));
    const fdMain = Object.entries(reg.leagues).filter(([, l]: any) => l.history === 'fd-main');
    expect(fdMain.length).toBeGreaterThan(10);
    for (const [code, l] of fdMain as [string, any][]) expect(l.fd, code).toMatch(/^[A-Z]+\d$/);
    expect(reg.leagues.PL.fd).toBe('E0');
    expect(reg.leagues.SC.fd).toBe('SC0');
  });

  test('Seasons.ps1: football-data-listan byter sasong av sig sjalv 1 juli', async () => {
    test.skip(process.platform !== 'win32', 'PowerShell 5.1 finns bara pa Windows');
    const { execFileSync } = await import('child_process');
    const ps = `. '${path.join(ROOT, 'scripts', 'lib', 'Seasons.ps1')}'
      $r = ([System.IO.File]::ReadAllText('${path.join(ROOT, 'config', 'leagues.json')}')) | ConvertFrom-Json
      foreach ($d in '2026-10-13', '2027-06-30', '2027-08-01') {
        $y = Get-SeasonStartYear ([datetime]$d)
        $s = @(Get-FootballDataSources $r $y)
        "$d|$y|$(Get-SplitSeasonLabel $y)|$($s.Count)|$(($s | Where-Object League -eq 'PL' | ForEach-Object File) -join ',')|$(($s | Where-Object League -eq 'SA' | ForEach-Object Url) -join ',')"
      }`;
    const out = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' }).trim().split(/\r?\n/).map((l) => l.split('|'));
    const fdMain = Object.values(JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'leagues.json'), 'utf8')).leagues).filter((l: any) => l.history === 'fd-main').length;
    expect(out[0].slice(0, 3)).toEqual(['2026-10-13', '2026', '2026/27']);
    expect(Number(out[0][3])).toBe(fdMain * 3 + 2); // tre sasonger, PL och CH fyra
    expect(out[0][4]).toBe('PL_2627.csv,PL_2526.csv,PL_2425.csv,PL_2324.csv');
    expect(out[1].slice(1, 3)).toEqual(['2026', '2026/27']);
    expect(out[2].slice(1, 3)).toEqual(['2027', '2027/28']);
    expect(out[2][4]).toBe('PL_2728.csv,PL_2627.csv,PL_2526.csv,PL_2425.csv');
    expect(out[2][5].split(',')[0]).toBe('https://www.football-data.co.uk/mmz4281/2728/I1.csv');
  });

  test('inga hardkodade sasongsar kvar i hamtskripten', async () => {
    const files = ['scripts/Update-BettingStore.ps1', 'scripts/Fetch-OpenSources.ps1', 'scripts/Fetch-UnderstatXg.ps1', 'scripts/lib/Seasons.ps1',
      'scripts/Fetch-PlayerStats.ps1', 'scripts/fetch-player-impact.mjs', 'scripts/tune-league-models.mjs', 'scripts/pro-layer.mjs'];
    for (const f of files) {
      // Kod, inte kommentarer (dar far exempel som "2026/27" sta)
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8').split(/\r?\n/).filter((l) => !/^\s*(#|\/\/|\*)/.test(l)).join('\n');
      expect(src, f).not.toMatch(/mmz4281\/\d{4}\//);
      expect(src, f).not.toMatch(/football\.json\/master\/\d{4}-\d{2}\//);
      expect(src, f).not.toMatch(/['"]20\d\d\/\d\d['"]\s*[\],)]/); // t.ex. new Set(['2025/26', '2026/27'])
      expect(src, f).not.toMatch(/(SEASONS?|Season)\s*=\s*[@[(]*\s*['"]?20\d\d/);
    }
  });
});

// ---------- cups.mjs / cup-elo.mjs / uefa-referees.mjs (AFC Champions League Elite och Two, Copa Libertadores/Sudamericana) ----------

test.describe('cuper: CL/EL/ECL, asiatiska CL (ACL, ACL2) och Copa (LIB, SUD)', () => {
  test('cuplistan läses ur config/leagues.json', async () => {
    const { CUPS, isCup, cupsOf } = await lib('cups.mjs');
    expect(CUPS).toEqual(['CL', 'EL', 'ECL', 'ACL', 'ACL2', 'LIB', 'SUD']);
    expect(isCup('ACL2')).toBe(true);
    expect(isCup('JP1')).toBe(false);
    expect(cupsOf({ leagues: { X: { cup: true }, Y: {} } })).toEqual(['X']);
  });
  test('AFC-cuperna har FotMob, Transfermarkt och domardata', async () => {
    const { FOTMOB_LEAGUES } = await lib('fotmob-leagues.mjs');
    const { TM_COMP } = await lib('transfermarkt.mjs');
    const { REF_LEAGUES } = await lib('referee-streaks.mjs');
    expect(FOTMOB_LEAGUES.ACL).toBe(525);
    expect(FOTMOB_LEAGUES.ACL2).toBe(9469);
    expect(TM_COMP.ACL).toEqual({ comp: 'ACLE', cup: true });
    expect(TM_COMP.ACL2).toEqual({ comp: 'ACL2', cup: true });
    for (const lg of ['CL', 'EL', 'ECL', 'ACL', 'ACL2', 'SAU', 'KR']) expect(REF_LEAGUES.has(lg), lg).toBe(true);
  });
  test('Copa-cuperna har FotMob, Transfermarkt, domardata, odds och grupp Sydamerika', async () => {
    const { FOTMOB_LEAGUES } = await lib('fotmob-leagues.mjs');
    const { TM_COMP } = await lib('transfermarkt.mjs');
    const { REF_LEAGUES } = await lib('referee-streaks.mjs');
    expect(FOTMOB_LEAGUES.LIB).toBe(45);
    expect(FOTMOB_LEAGUES.SUD).toBe(299);
    expect(TM_COMP.LIB).toEqual({ comp: 'CLI', cup: true });
    expect(TM_COMP.SUD).toEqual({ comp: 'CS', cup: true });
    for (const lg of ['LIB', 'SUD']) expect(REF_LEAGUES.has(lg), lg).toBe(true);
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'leagues.json'), 'utf8'));
    expect(reg.groups.find((g: any) => g.id === 'sydamerika').leagues).toEqual(['LIB', 'SUD']);
    expect(reg.leagues.LIB).toMatchObject({ cup: true, espn: 'conmebol.libertadores', odds: 'soccer_conmebol_copa_libertadores' });
    expect(reg.leagues.SUD).toMatchObject({ cup: true, espn: 'conmebol.sudamericana', odds: 'soccer_conmebol_copa_sudamericana' });
  });
  test('AFC-cuptrupp är reserv för truppvärdet', async () => {
    const { squadValueLookup } = await lib('squad-value.mjs');
    const pl = (v: number) => ({ players: [{ info: { marketValue: v } }] });
    const valueOf = squadValueLookup({ ACL: { 'Al Hilal': pl(200) }, JP1: { 'Vissel Kobe': pl(12) } });
    expect(valueOf('Al Hilal', 'ACL')?.value).toBe(200);
    expect(valueOf('Al Hilal', 'SAU')?.value).toBe(200); // SAU saknar fil -> cuptruppen
    expect(valueOf('Al Hilal', 'JP1')).toBeNull(); // JP1 har fil men inte laget
    const cups = squadValueLookup({ LIB: { 'Boca Juniors': pl(300) }, SUD: { 'Vasco da Gama': pl(130) } });
    expect(cups('Boca Juniors', 'SUD')?.value).toBe(300); // från Libertadores till Sudamericana
    const lib2 = squadValueLookup({ LIB: { Estudiantes: pl(40) }, AR: { 'Estudiantes L.P.': pl(41) } });
    expect(lib2('Estudiantes de La Plata', 'LIB')?.value).toBe(40); // ESPN-namn mot FotMob-namn, bara i cuper
    expect(lib2('Estudiantes de La Plata', 'AR')).toBeNull();
  });
});

test.describe('cup-elo: eget Elo för AFC-cuperna', () => {
  const ms = [
    { league: 'SAU', date: '2026-08-01', home: 'Al Hilal', away: 'Al Ahli', hg: 3, ag: 0 },
    { league: 'SAU', date: '2026-08-08', home: 'Al Ahli', away: 'Al Fateh', hg: 2, ag: 0 },
    { league: 'JP1', date: '2026-08-01', home: 'Kyoto', away: 'Vissel Kobe', hg: 0, ag: 1 },
    { league: 'SAU', date: '2026-12-01', home: 'Al Fateh', away: 'Al Hilal', hg: 5, ag: 0 }, // efter cutoff
  ];
  test('rankas i sin liga, namnlikhet bara inom hemmaligan', async () => {
    const { asiaEloLookup, ASIA_ELO_START } = await lib('cup-elo.mjs');
    const eloOf = asiaEloLookup(ms, '2026-10-13');
    const hilal = eloOf('Al Hilal', 'SAU');
    expect(hilal).toMatchObject({ rank: 1, league: 'SAU', source: 'own' });
    expect(hilal.elo).toBeGreaterThan(ASIA_ELO_START.SAU);
    expect(eloOf('Kyoto Sanga', 'JP1')).toMatchObject({ league: 'JP1', rank: 2 }); // FotMob/ESPN-namn mot vårt
    expect(eloOf('Al Ahli', 'QAT')).toBeNull(); // Qatars Al Ahli: liga utan data
    expect(eloOf('Shabab Al-Ahli', undefined)).toBeNull(); // okänd hemmaliga -> aldrig gissning över länder
  });
  test('Sydamerika: Libertadores/Sudamericana rankas i BR/BR2/AR/COL, Uruguay saknas', async () => {
    const { cupEloLookup, CUP_ELO, CUP_ELO_REGIONS, SA_ELO_START, ASIA_CUPS } = await lib('cup-elo.mjs');
    expect(CUP_ELO).toMatchObject({ ACL: 'asia', ACL2: 'asia', LIB: 'sydamerika', SUD: 'sydamerika' });
    expect([...ASIA_CUPS]).toEqual(['ACL', 'ACL2']);
    expect(CUP_ELO_REGIONS.sydamerika.source).toBe('saelo');
    const sa = [
      { league: 'BR', date: '2026-08-01', home: 'Palmeiras', away: 'Fluminense', hg: 2, ag: 0 },
      { league: 'AR', date: '2026-08-01', home: 'Boca Juniors', away: 'Estudiantes L.P.', hg: 1, ag: 1 },
      { league: 'SAU', date: '2026-08-01', home: 'Al Hilal', away: 'Al Ahli', hg: 3, ag: 0 }, // annan region
    ];
    const eloOf = cupEloLookup(sa, '2026-10-13', SA_ELO_START);
    expect(eloOf('Palmeiras', 'BR')).toMatchObject({ rank: 1, league: 'BR', source: 'own' });
    expect(eloOf('Palmeiras', 'BR').elo).toBeGreaterThan(SA_ELO_START.BR);
    expect(eloOf('Boca Juniors', 'AR').elo).toBeLessThan(eloOf('Fluminense', 'BR').elo); // Brasilien startar högre
    expect(eloOf('Al Hilal', 'SAU')).toBeNull();
    expect(eloOf('Montevideo City Torque', 'URU')).toBeNull();
  });
  test('hemmaligan ur trupperna (FotMob primaryLeagueId)', async () => {
    const { cupHomeLeagues } = await lib('cup-elo.mjs');
    const home = cupHomeLeagues({
      ACL: { teams: { 'Al Ahli': { primaryLeagueId: 536 }, 'Shabab Al-Ahli': { primaryLeagueId: 538 } } },
      ACL2: { teams: { 'FC Seoul': { primaryLeagueId: 9080 } } },
    });
    expect(home.get('ACL|Al Ahli')).toBe('SAU');
    expect(home.get('ACL|Shabab Al-Ahli')).toBeUndefined(); // UAE-ligan finns inte hos oss
    expect(home.get('ACL2|FC Seoul')).toBe('KR');
  });
  test('hemmaligan för cupmatch: annan cup i regionen och ESPN-namn mot FotMob-namn', async () => {
    const { homeLeagueOf } = await lib('cup-elo.mjs');
    const home = new Map([['LIB|Estudiantes', 'AR'], ['LIB|Boca Juniors', 'AR'], ['SUD|Vasco da Gama', 'BR'], ['ACL|Al Ahli', 'SAU']]);
    expect(homeLeagueOf(home, 'SUD', 'Boca Juniors')).toBe('AR'); // gick från Libertadores till Sudamericana
    expect(homeLeagueOf(home, 'LIB', 'Estudiantes de La Plata')).toBe('AR');
    expect(homeLeagueOf(home, 'SUD', 'Vasco da Gama')).toBe('BR');
    expect(homeLeagueOf(home, 'LIB', 'Al Ahli')).toBeUndefined(); // aldrig över regioner
    expect(homeLeagueOf(home, 'SUD', 'Montevideo City Torque')).toBeUndefined();
  });
});

test.describe('uefa-referees: tillsatta domare från UEFA', () => {
  const list = [
    { league: 'CL', date: '2026-10-13', home: 'Inter', away: 'Club Brugge', referee: 'Rohit Saggi' },
    { league: 'CL', date: '2026-10-14', home: 'Roma', away: 'Real Madrid', referee: 'François Letexier' },
    { league: 'EL', date: '2026-10-14', home: 'Roma', away: 'Real Madrid', referee: 'Fel tävling' },
  ];
  test('samma tävling och datum, båda lagen eller ett säkert lag', async () => {
    const { uefaRefereeFor } = await lib('uefa-referees.mjs');
    expect(uefaRefereeFor(list, { league: 'CL', date: '2026-10-14', home: 'AS Roma', away: 'Real Madrid' })).toBe('François Letexier');
    expect(uefaRefereeFor(list, { league: 'CL', date: '2026-10-13', home: 'Internazionale', away: 'Club Brugge' })).toBe('Rohit Saggi');
    expect(uefaRefereeFor(list, { league: 'ECL', date: '2026-10-14', home: 'AS Roma', away: 'Real Madrid' })).toBeNull();
    expect(uefaRefereeFor(list, { league: 'CL', date: '2026-10-20', home: 'AS Roma', away: 'Real Madrid' })).toBeNull();
  });
});

// ---------- tm-cup-history.mjs / oddsportal-results.mjs / cup-value-model.mjs (truppvärde i cuperna) ----------

test.describe('cuphistorik: truppvärde mot utfall i CL/EL/ECL/Libertadores/Sudamericana', () => {
  const club = (id: string, name: string, y = 2023) => `<a title="${name}" href="/x/startseite/verein/${id}/saison_id/${y}">${name}</a>`;
  const row = (h: string, a: string, score: string) =>
    `<tr><td>${h}</td><td class="zentriert hauptlink"><a title="Match report" class="ergebnis-link" id="1" href="/spielbericht/index/spielbericht/1">${score}</a></td><td>${a}</td></tr>`;
  test('TM-spelschema: rubrik, datum, resultat, straffar och dubbletter', async () => {
    const { parseTmFixtures, CUP_HISTORY_COMPS } = await lib('tm-cup-history.mjs');
    expect(Object.keys(CUP_HISTORY_COMPS)).toEqual(['CL', 'EL', 'ECL', 'LIB', 'SUD']);
    const html = `<h2 class="content-box-headline">\n Group A </h2>
      <a href="/aktuell/waspassiertheute/aktuell/new/datum/2024-04-04">x</a>
      ${row(club('2433', 'CSD Colo-Colo'), club('1214', 'Club Cerro Porteño'), '1:0')}
      ${row(club('2433', 'CSD Colo-Colo'), club('1214', 'Club Cerro Porteño'), '1:0')}
      <h2 class="content-box-headline">Knockout stage</h2>
      <a href="/aktuell/waspassiertheute/aktuell/new/datum/2024-03-15">x</a>
      ${row(club('866', 'Club Nacional'), club('42208', 'Club Always Ready'), '7:5<span class="ergebnis_zusatz">on pens</span>')}
      ${row(club('1', 'A &amp; B'), club('2', 'C'), '-:-')}`;
    const m = parseTmFixtures(html);
    expect(m).toHaveLength(2);
    expect(m[0]).toMatchObject({ date: '2024-04-04', stage: 'Group A', homeId: '2433', home: 'CSD Colo-Colo', awayId: '1214', hg: 1, ag: 0, extra: null, season: 2023 });
    expect(m[1]).toMatchObject({ stage: 'Knockout stage', date: '2024-03-15', extra: 'pens' });
  });
  test('TM-trupp: truppvärdet är summan av säsongens spelarvärden', async () => {
    const { parseTmSquadValue } = await lib('tm-cup-history.mjs');
    const p = (v: string) => `<tr class="odd"><td><a href="/x/profil/spieler/1">X</a></td><td class="rechts hauptlink"><a href="/x/marktwertverlauf/spieler/1">${v}</a></td></tr>`;
    expect(parseTmSquadValue(`<tbody>${p('€1.50bn')}${p('€25.00m')}${p('€400k')}${p('-')}`)).toEqual({ value: 1_525_400_000, players: 3 });
    expect(parseTmSquadValue('<tbody></tbody>')).toBeNull();
  });
  test('OddsPortal-arkiv: sökvägar per säsong och resultatlistans text', async () => {
    const { cupResultsSlugs, parseResultsText } = await lib('oddsportal-results.mjs');
    expect(cupResultsSlugs('LIB', 2023, 2026)).toEqual(['south-america/copa-libertadores-2024']);
    expect(cupResultsSlugs('LIB', 2025, 2026)).toEqual(['south-america/copa-libertadores-2026', 'south-america/copa-libertadores']);
    expect(cupResultsSlugs('CL', 2023, 2026)).toEqual(['europe/champions-league-2023-2024']);
    expect(cupResultsSlugs('CL', 2026, 2026)).toEqual(['europe/champions-league']);
    expect(cupResultsSlugs('ECL', 2022, 2026)).toEqual(['europe/conference-league-2022-2023', 'europe/europa-conference-league-2022-2023']);
    const text = ['30 Nov 2024 - Play Offs', '1', 'X', '2', 'Finished', '1', 'Atletico-MG (Bra)', '-', 'Botafogo RJ (Bra)', '3', '4.45', '3.25', '2.02',
      '26 Sep 2024 - Play Offs', 'After Pen.', '1', 'Sao Paulo (Bra)', '-', 'Botafogo RJ (Bra)', '2', '3.00', '2.88', '2.75',
      'Finished', '2', 'Dortmund', '-', 'Real Madrid', '0', '-'].join('\n');
    const r = parseResultsText(text);
    expect(r).toHaveLength(3);
    expect(r[0]).toEqual({ date: '2024-11-30', status: 'Finished', home: 'Atletico-MG', away: 'Botafogo RJ', country: { home: 'Bra', away: 'Bra' }, hg: 1, ag: 3, odds: [4.45, 3.25, 2.02] });
    expect(r[1]).toMatchObject({ date: '2024-09-26', status: 'After Pen.' });
    expect(r[2]).toMatchObject({ home: 'Dortmund', country: { home: null }, odds: null });
  });
  test('truppvärdesmodell: rader, ordnad logit, koppling till oddsen och justering', async () => {
    const { cupValueRows, fitValueModel, valueModelProbs, joinMarket, blendMarket } = await lib('cup-value-model.mjs');
    const doc = {
      seasons: { 'LIB|2023': { league: 'LIB', season: 2023, matches: [
        { date: '2024-04-04', homeId: '1', home: 'Palmeiras', awayId: '2', away: 'Always Ready', hg: 0, ag: 1, extra: null },
        { date: '2024-04-05', homeId: '2', home: 'Always Ready', awayId: '1', away: 'Palmeiras', hg: 1, ag: 1, extra: 'pens' }, // straffar räknas inte
        { date: '2024-04-06', homeId: '3', home: 'Okänd', awayId: '1', away: 'Palmeiras', hg: 0, ag: 2, extra: null }, // saknar värde
      ] } },
      clubs: { '1|2023': { value: 200e6 }, '2|2023': { value: 5e6 }, '3|2023': null },
    };
    const rows = cupValueRows(doc);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ res: 'A', richHome: true, richRes: 'L' });
    expect(rows[0].ratio).toBeCloseTo(40, 6);
    // Syntetiskt: dyrare laget vinner oftare -> b > 0, sannolikheterna summerar till 1
    const syn: any[] = [];
    for (let i = 0; i < 300; i++) {
      const x = ((i % 7) - 3) / 2;
      syn.push({ x, res: x > 0.4 ? (i % 4 ? 'H' : 'D') : x < -0.4 ? (i % 4 ? 'A' : 'D') : 'HDA'[i % 3] });
    }
    const m = fitValueModel(syn);
    expect(m.b).toBeGreaterThan(0.5);
    const p = valueModelProbs(m, Math.log(5));
    expect(p[0] + p[1] + p[2]).toBeCloseTo(1, 9);
    expect(p[0]).toBeGreaterThan(p[2]);
    expect(fitValueModel(syn, { useValue: false }).b).toBe(0);
    // Koppling: samma resultat, datum ±1, bäst namnlikhet
    const odds = { seasons: { 'LIB|2023': { league: 'LIB', season: 2023, matches: [
      { date: '2024-04-05', home: 'Palmeiras', away: 'Always Ready', hg: 0, ag: 1, odds: [1.25, 6, 11] },
      { date: '2024-04-04', home: 'Bolivar', away: 'Flamengo', hg: 0, ag: 1, odds: [3, 3, 2.5] },
    ] } } };
    const score = (a: string, b: string) => (a === b ? 1 : 0);
    expect(joinMarket(rows, odds, score)).toBe(1);
    expect(rows[0].market[0]).toBeGreaterThan(0.7);
    expect(rows[0].market.reduce((s: number, v: number) => s + v, 0)).toBeCloseTo(1, 9);
    expect(blendMarket([0.5, 0.25, 0.25], 0, 0.3)).toEqual([0.5, 0.25, 0.25]);
    expect(blendMarket([0.5, 0.25, 0.25], Math.log(4), 0.2)[0]).toBeGreaterThan(0.5);
  });
});

// ---------- databas.mjs: filerna → lokala databasen (npm run databas) ----------

test.describe('databas: översättning från filerna', () => {
  test('CSV och matchrad: svenska kolumner, tal som tal, H/D/A blir 1/X/2', async () => {
    const { parseCsvText, matchRad, MATCH_KOLUMNER } = await lib('databas.mjs');
    const rader = parseCsvText('status,league,date,home,away,hg,ag,res,close_h,referee,nytt\nspelad,PL,2026-09-20,"Brighton, FC",Leeds,2,0,H,0.55,,x\nkommande,PL,2026-10-20,A,B,,,,,,\n');
    expect(rader).toHaveLength(2);
    expect(rader[0].home).toBe('Brighton, FC');
    const m = matchRad(rader[0]);
    expect(m).toMatchObject({ status: 'spelad', liga: 'PL', hemmalag: 'Brighton, FC', bortalag: 'Leeds', hemmamal: 2, bortamal: 0, resultat: '1', stang_chans_1: 0.55, domare: null, nytt: 'x' });
    expect(matchRad({ res: 'D' }).resultat).toBe('X');
    expect(matchRad({ res: 'A' }).resultat).toBe('2');
    expect(matchRad(rader[1])).toMatchObject({ hemmamal: null, resultat: null });
    // Varje kolumn har ett unikt svenskt namn och en förklaring
    const namn = MATCH_KOLUMNER.map((k: string[]) => k[1]);
    expect(new Set(namn).size).toBe(namn.length);
    for (const k of MATCH_KOLUMNER) { expect(k[3].length).toBeGreaterThan(3); expect(k[1]).toMatch(/^[a-z0-9_]+$/); }
    // Alla kolumner i riktiga matchfilen är förklarade
    const head = fs.readFileSync(path.join(ROOT, 'data', 'matcher', 'PL.csv'), 'utf8').split(/\r?\n/)[0].split(',');
    expect(head.filter((h) => !MATCH_KOLUMNER.some((k: string[]) => k[0] === h))).toEqual([]);
  });

  test('tabeller, spelare och trupper', async () => {
    const { tabellRader, aktuellTabellRader, spelarRad, truppRader, sqlVarde } = await lib('databas.mjs');
    const lg = { league: 'AS', updatedAt: 'u', table: [{ rank: 1, team: 'Sirius', played: 22, won: 16, drawn: 3, lost: 3, goals: '40-15', gd: 25, pts: 51 }], tableHistory: { '2026-10-01': [['Sirius', 1, 22, 51, 25]] } };
    expect(tabellRader(lg)).toEqual([{ liga: 'AS', datum: '2026-10-01', placering: 1, lag: 'Sirius', spelade: 22, poang: 51, malskillnad: 25 }]);
    expect(aktuellTabellRader(lg)[0]).toMatchObject({ gjorda_mal: 40, inslappta_mal: 15, poang: 51, vunna: 16 });
    // FotMob: [totalt, per 90, percentil] – totalen ska med
    const p = spelarRad({ id: 1, name: 'Erling Haaland', team: 'Man City', info: { age: 26, marketValue: 1e8 }, season: { season: '2026/2027', stats: { goals: [5, 1, 100], assists: [0, 0, 0], rating: [7.99, 7.99, 90] } }, form: { last5: { goals: 4 } } }, 'PL');
    expect(p).toMatchObject({ spelar_id: 1, liga: 'PL', mal: 5, assist: 0, betyg: 7.99, alder: 26, senaste5_mal: 4, forra_mal: null });
    const t = truppRader({ league: 'BL', teams: { Dortmund: { coach: 'B', coachHistory: [{ name: 'A', firstSeen: 'd1' }, { name: 'B', firstSeen: 'd2' }], left: [{ id: '7', name: 'X', firstSeen: 'd1', lastSeen: 'd2' }] } } });
    expect(t.tranare.map((x: any) => [x.tranare, x.nuvarande])).toEqual([['A', 0], ['B', 1]]);
    expect(t.lamnat[0]).toMatchObject({ spelar_id: 7, namn: 'X' });
    expect([sqlVarde(true), sqlVarde(''), sqlVarde(undefined), sqlVarde(NaN), sqlVarde({ a: 1 }), sqlVarde('x')]).toEqual([1, null, null, null, '{"a":1}', 'x']);
  });

  test('matchstatistik och tipsloggar', async () => {
    const { matchstatRader, oddsetTipsRader, stryktipsRad } = await lib('databas.mjs');
    const ms = matchstatRader({ league: 'BL', playerCols: ['id', 'name', 'side', 'min', 'g'], matches: { 9: { src: 'espn', id: '9', d: '2025-01-01', h: 'H', a: 'A', hg: 2, ag: 1, ht: [1, 0], form: ['4-4-2', '4-3-3'], p: [['5', 'Kalle', 'a', 90, 1]] } } });
    expect(ms.matcher[0]).toMatchObject({ match_id: 'espn:9', hemma_mal_halvtid: 1, borta_formation: '4-3-3' });
    expect(ms.spelare[0]).toMatchObject({ match_id: 'espn:9', spelar_id: '5', namn: 'Kalle', sida: 'borta', lag: 'A', minuter: 90, mal: 1 });
    const o = oddsetTipsRader({ id: 'i', date: 'd', league: 'COL', home: 'H', away: 'A', latest: { topTip: true, markets: { '1X2': { pick: '1', p: 0.4, odds: 1.9, value: 'Ej värde', probs: { home: 0.4, draw: 0.3, away: 0.3 } }, BTTS: { pick: 'JA', p: 0.5 } } }, result: { '1X2': '1', BTTS: 'NEJ', score: '1-0' } });
    expect(o.map((r: any) => [r.marknad, r.ratt])).toEqual([['1X2', 1], ['BTTS', 0]]);
    expect(o[0]).toMatchObject({ chans_x: 0.3, basta_tips: true, slutresultat: '1-0' });
    expect(oddsetTipsRader({ id: 'i', latest: { markets: { OU25: { pick: 'OVER 2.5' } } } })[0].ratt).toBeNull();
    const s = stryktipsRad({ id: 's', product: 'stryktipset', draw: 4974, event: 1, latest: { probs: [0.5, 0.3, 0.2], folk: [0.6, 0.2, 0.2], single: '1', coupons: { A: { signs: '1X' }, B: { signs: '1' }, C: { signs: '2' } } }, result: { outcome: 'X' } });
    expect(s).toMatchObject({ omgang: 4974, chans_1: 0.5, folket_1: 0.6, kupong_a: '1X', ratt_enkeltips: 0, ratt_a: 1, ratt_b: 0, ratt_c: 0 });
  });

  test('hästar: omgång, kompakta lopp och tips', async () => {
    const { omgangRader, kompaktLoppRader, hastTipsRader } = await lib('databas.mjs');
    const g = { id: 'V86_2026-10-05_40_1', type: 'V86', date: '2026-10-05', track: 'Gävle', turnover: 100, payouts: { 8: { systems: 3, payout: 5000 } }, races: [{ leg: 1, number: 6, id: '2026-10-05_40_6', distance: 2140, startMethod: 'auto', starts: [{ nr: 5, post: 5, horse: 'Häst', horseId: 9, sex: 'mare', father: 'F', grandfather: 'M', shoes: { front: false, back: true }, streck: 0.4, result: { place: 1, finishOrder: 1, km: 12.5, finalOdds: 2.1 }, records: [{ date: '2026-09-01', track: 'Solvalla', place: 2, km: 13 }] }] }] };
    const r = omgangRader(g);
    expect(r.omgang).toMatchObject({ spel_id: g.id, spelform: 'V86', omsattning_kr: 100 });
    expect(r.utdelning).toEqual([{ spel_id: g.id, antal_ratt: 8, vinnande_system: 3, utdelning_kr: 5000 }]);
    expect(r.avdelningar[0]).toEqual({ spel_id: g.id, avdelning: 1, lopp_id: '2026-10-05_40_6' });
    expect(r.lopp[0]).toMatchObject({ datum: '2026-10-05', bana: 'Gävle', distans_m: 2140, kalla: 'omgang' });
    expect(r.starter[0]).toMatchObject({ startnummer: 5, hast_id: 9, kon: 'sto', skor_fram: false, placering: 1, km_tid: 12.5, slutodds: 2.1, streck: 0.4 });
    expect(r.hastar[0]).toMatchObject({ far: 'F', morfar: 'M' });
    expect(r.tidigare[0]).toMatchObject({ hast_id: 9, datum: '2026-09-01', bana: 'Solvalla', placering: 2 });
    const k = kompaktLoppRader({ id: '2026-09-26_6_1', date: '2026-09-26', track: 'Åby', dist: 2140, method: 'auto', starts: [[1, 'A', 1, 1, 12.1, 0, 0, 2.02]] });
    expect(k.lopp).toMatchObject({ loppnummer: 1, kalla: 'alla lopp' });
    expect(k.starter[0]).toMatchObject({ hast: 'A', placering: 1, galopp: 0, slutodds: 2.02 });
    const t = hastTipsRader({ id: 't', game: 'g', type: 'V86', leg: 3, race: 7, latest: { top: [{ nr: 5, horse: 'X', p: 0.5, rank: 'A' }, { nr: 2, horse: 'Y', p: 0.2, rank: 'B' }], spik: 5, favorite: 2 }, result: { winners: [5] } });
    expect(t.map((x: any) => [x.startnummer, x.spik, x.favorit, x.vann])).toEqual([[5, 1, 0, 1], [2, 0, 1, 0]]);
  });

  test('SQL: tabell och typ', async () => {
    const { skapaTabellSql, gissaTyp } = await lib('databas.mjs');
    expect(skapaTabellSql('t', [['a', 'TEXT'], ['b', 'INTEGER']], { nyckel: ['a'] })).toBe('CREATE TABLE "t" (\n  "a" TEXT,\n  "b" INTEGER,\n  PRIMARY KEY ("a")\n)');
    expect([gissaTyp([1, 2]), gissaTyp([1, 2.5]), gissaTyp([null, 'x']), gissaTyp([]), gissaTyp([true])]).toEqual(['INTEGER', 'REAL', 'TEXT', 'TEXT', 'INTEGER']);
  });

  test('Stryktipset/Europatipset: omgång, folket, utdelning och facit', async () => {
    const { kupongOmgangRader, kronor, ratt } = await lib('databas.mjs');
    expect([kronor('1119407,00'), kronor('2,50'), kronor(''), kronor(null)]).toEqual([1119407, 2.5, null, null]);
    expect([ratt('1X2', '1XX'), ratt(null, '1'), ratt('1', null)]).toEqual([2, null, null]);
    const ev = (n: number, ut: string) => ({ eventNumber: n, odds: { one: '2,10', x: '3,40', two: '3,60' }, svenskaFolket: { one: '35', x: '24', two: '41', refOne: '36' }, tioTidningarsTips: { one: 5, x: 1, two: 4 }, match: { matchStart: 's', participants: [{ type: 'home', name: 'H' + n }, { type: 'away', name: 'B' + n }], league: { name: 'Premier League', country: { name: 'England' } } }, _ut: ut });
    const events = Array.from({ length: 13 }, (_, i) => ev(i + 1, i % 3 === 0 ? 'X' : '1'));
    const r = kupongOmgangRader({ product: 'stryktipset', drawNumber: 4900, draw: { drawEvents: events, rowPrice: '1,00', regCloseTime: 't' }, result: { currentNetSale: '21527062,00', events: events.map((e) => ({ eventNumber: e.eventNumber, outcome: e._ut, outcomeScore: { home: 1, away: 1 } })), distribution: [{ name: '13 rätt', winners: 5, amount: '1119407,00' }, { name: '10 rätt', winners: 25703, amount: '136,00' }] } });
    expect(r.omgang).toMatchObject({ produkt: 'stryktipset', omgang: 4900, omsattning_kr: 21527062, radpris_kr: 1, facit: 'X11X11X11X11X', antal_kryss: 5 });
    expect(r.matcher[0]).toMatchObject({ matchnr: 1, hemmalag: 'H1', bortalag: 'B1', liga: 'Premier League', land: 'England', odds_1: 2.1, folket_1: 0.35, folket_2: 0.41, folket_tidigare_1: 0.36, tio_tidningar_1: 5, utfall: 'X', hemmamal: 1, struken: 0 });
    expect(r.utdelning).toEqual([{ produkt: 'stryktipset', omgang: 4900, antal_ratt: 13, vinnare: 5, utdelning_kr: 1119407 }, { produkt: 'stryktipset', omgang: 4900, antal_ratt: 10, vinnare: 25703, utdelning_kr: 136 }]);
    // Ofullständigt facit → inget facit
    expect(kupongOmgangRader({ product: 'europatipset', drawNumber: 1, draw: { drawEvents: events.slice(0, 2) }, result: {} }).omgang.facit).toBeNull();
  });

  test('Stryktipset/Europatipset: våra kuponger och bakkörningar', async () => {
    const { kupongSystemRader, stryktipsBakkorningRader } = await lib('databas.mjs');
    const facit = '1111111111111';
    const arkiv = kupongSystemRader({ product: 'stryktipset', drawNumber: 4900, outcomes: facit, matches: [{ match: 'A - B', final: [0.5, 0.3, 0.2], folk: [0.6, 0.2, 0.2], outcome: '1' }], A: { rows: 2, cost: 2, hitAll: 0.01, picks: ['1X', '2'], rowList: ['1111111111111', '2222222222222'], evaluation: { best: 13, winnings: 900, net: 898, groundCorrect: 12 } } });
    expect(arkiv.system[0]).toMatchObject({ kupong: 'A', kalla: 'arkiv', rader: 2, bast_ratt: 13, vinst_kr: 900, netto_kr: 898, chans_13: 0.01 });
    expect(arkiv.rader.map((x: any) => x.antal_ratt)).toEqual([13, 0]);
    expect(arkiv.tecken.map((x: any) => [x.matchnr, x.tecken, x.satt])).toEqual([[1, '1X', 1], [2, '2', 0]]);
    expect(arkiv.tecken[0]).toMatchObject({ match: 'A - B', var_chans_1: 0.5, folket_1: 0.6 });
    // Historikfilen: sparad/senaste för A och B, bästa antal rätt räknas ur facit när utvärdering saknas
    const hist = kupongSystemRader({ product: 'europatipset', drawNumber: 2615, result: { outcomes: facit }, saved: { at: 'a', rowList: ['1111111111112'], picks: [] }, latestB: { rowList: ['1111111112222'] } });
    expect(hist.system.map((x: any) => [x.kupong, x.kalla, x.bast_ratt])).toEqual([['A', 'sparad', 12], ['B', 'senaste', 9]]);
    const b = stryktipsBakkorningRader('stryktips-backtest-x.json', { generatedAt: 'g', summary: { from: 'f', to: 't', draws: 1, A: { cost: 10, winnings: 30, net: 20 } }, draws: [{ drawNumber: 4971, date: 'd', outcomes: facit, prize13: { amount: '0,00', winners: 0 }, A: { rows: 10, cost: 10, best: 11, winnings: 30, net: 20, perClass: { 11: 1, 10: 4 } }, B: null, matches: [{ n: 1, match: 'A - B', league: 'PL', outcome: '1', final: [0.5, 0.3, 0.2], model: [0.4, 0.3, 0.3], pickA: '1', pickB: '1X2' }] }] });
    expect(b.korning).toMatchObject({ fil: 'stryktips-backtest-x.json', produkt: 'stryktipset', netto_a: 20, vinst_a: 30, netto_b: null, omgangar: 1 });
    expect(b.omgangar).toHaveLength(1);
    expect(b.omgangar[0]).toMatchObject({ omgang: 4971, kupong: 'A', rader_11: 1, rader_10: 4, rader_13: 0, utdelning_13_kr: 0 });
    expect(b.matcher[0]).toMatchObject({ omgang: 4971, matchnr: 1, modell_1: 0.4, tecken_a: '1', tecken_b: '1X2', tecken_c: null });
    expect(stryktipsBakkorningRader('europatips-backtest-y.json', { draws: [] }).korning.produkt).toBe('europatipset');
  });

  test('hästar: bakkörningar, analyser och uppföljning', async () => {
    const { hastBakkorningRader, hastAnalysRader, hastUppfoljningRader } = await lib('databas.mjs');
    const b = hastBakkorningRader('bakkorning-2025.json', { year: 2025, model: 'rullande', alpha: 'standard', variants: ['rakt'], budgets: [500], summary: { rakt: { 500: { all: { games: 2, cost: 960, win: 1000, net: 40, roi: 0.04, biggest: { id: 'g', win: 1000 } }, V86: { games: 1, cost: 480, win: 0, net: -480 } } } }, games: [{ id: 'V86_x', type: 'V86', date: 'd', winners: [[10], [7]], by: { 500: { rakt: { cost: 480, win: 0, net: -480, best: 1, system: [[10, 5], [3]] } } }, field: [[[10, 0.33, 0.3, 'A'], [5, 0.28, 0.3, 'A']], [[7, 0.1, 0.2, 'C']]] }] });
    expect(b.korning).toMatchObject({ ar: 2025, modell: 'rullande', varianter: 'rakt', budgetar: '500' });
    expect(b.resultat.map((x: any) => [x.spelform, x.netto_kr])).toEqual([['alla', 40], ['V86', -480]]);
    expect(b.resultat[0]).toMatchObject({ budget_kr: 500, storsta_vinst_kr: 1000, storsta_vinst_omgang: 'g' });
    expect(b.omgangar[0]).toMatchObject({ spel_id: 'V86_x', budget_kr: 500, variant: 'rakt', bast_ratt: 1, system: [[10, 5], [3]] });
    expect(b.chanser.map((x: any) => [x.avdelning, x.startnummer, x.vann])).toEqual([[1, 10, 1], [1, 5, 0], [2, 7, 1]]);
    const a = hastAnalysRader({ id: 'V85_x', type: 'V85', date: 'd', races: [{ leg: 1, id: 'l', horses: [{ nr: 10, horse: 'H', p: 0.376, marketP: 0.37, rank: 'A', comments: ['Barfota', 'Tillägg'], scores: { form: 95 }, result: { place: 1 } }] }] });
    expect(a[0]).toMatchObject({ spel_id: 'V85_x', avdelning: 1, startnummer: 10, chans: 0.376, klass: 'A', kommentarer: 'Barfota · Tillägg', placering: 1, poang: { form: 95 } });
    const u = hastUppfoljningRader({ id: 'V86_y', type: 'V86', systems: { standard: { 500: { rows: 1920, cost: 480, hit: 0.08, legs: [[1]], result: { win: 0, net: -480, best: 4 } } } } });
    expect(u[0]).toMatchObject({ spel_id: 'V86_y', variant: 'standard', budget_kr: 500, kostnad_kr: 480, bast_ratt: 4, netto_kr: -480 });
  });

  test('hästar: Sportinfo-filer blir häst, säsonger, starter och omgång', async () => {
    const { travsportRader, travsportOmgangRader } = await lib('databas.mjs');
    const r = travsportRader({ kalla: 'k', hamtad: '2026-10-15', hast: { namn: 'S.G.Empress', id: 'ts787053', segerprocent: 53 }, sasong: [{ ar: '2026', starter: 9 }], starter: [{ datum: '2026-10-17', datum_kod: '261017-5', bana_kod: 'G', distans: '1640' }, { datum_kod: '260101-1', bana_kod: 'S', distans: '2140 tl' }] });
    expect(r.hast).toEqual({ hast_id: 787053, ts_id: 'ts787053', namn: 'S.G.Empress', segerprocent: 53, kalla: 'k', hamtad: '2026-10-15' });
    expect(r.sasonger).toEqual([{ hast_id: 787053, ar: '2026', starter: 9 }]);
    expect(r.starter.map((x: any) => [x.hast_id, x.datum_kod, x.distans])).toEqual([[787053, '261017-5', 1640], [787053, '260101-1', '2140 tl']]);
    expect(travsportRader({ hast: {} })).toEqual({ hast: null, sasonger: [], starter: [] });
    const o = travsportOmgangRader({ spel_id: 'V85_x', spelform: 'V85', datum: 'd', bana: 'Gävle', hastar: [{ avdelning: 2, startnummer: 7, hast: { id: 'ts772022', namn: 'Zätamustangen' } }], saknas: [{ avdelning: 1, startnummer: 2, id: 'ts787053', namn: 'S.G.Empress' }] });
    expect(o.map((x: any) => [x.avdelning, x.startnummer, x.hast_id, x.hast, x.hamtad])).toEqual([[2, 7, 772022, 'Zätamustangen', 1], [1, 2, 787053, 'S.G.Empress', 0]]);
    expect(o[0]).toMatchObject({ spel_id: 'V85_x', spelform: 'V85', bana: 'Gävle' });
  });

  test('hästar: Sportinfos tävlingsdag blir lopp, tempo och målordning', async () => {
    const { sportinfoLoppRader } = await lib('databas.mjs');
    const r = sportinfoLoppRader({ raceday_id: 'ts1', datum: '2026-09-26', bana: 'TESTBANAN', hamtad: 'h', lopp: [{ lopp: 5, distans: 2140, sista500_sek: 70.3, domartexter: ['Nr 8 döms ej.', 'Annat.'], namnda_nr: [8], tempo: [{ meter: 500, km_sek: 69.1, ledare_nr: 1 }], malordning: [{ placering: '1', startnummer: 6, kusk: 'K' }] }] });
    expect(r.lopp[0]).toEqual({ raceday_id: 'ts1', datum: '2026-09-26', bana: 'TESTBANAN', lopp: 5, distans: 2140, sista500_sek: 70.3, domartexter: 'Nr 8 döms ej.\nAnnat.', namnda_nr: '8', hamtad: 'h' });
    expect(r.tempo).toEqual([{ raceday_id: 'ts1', lopp: 5, meter: 500, km_sek: 69.1, ledare_nr: 1 }]);
    expect(r.malordning).toEqual([{ raceday_id: 'ts1', datum: '2026-09-26', lopp: 5, placering: '1', startnummer: 6, kusk: 'K' }]);
    expect(sportinfoLoppRader({})).toEqual({ lopp: [], tempo: [], malordning: [] });
    // Äldre filer tolkade bara komma som decimal: tempot räknas om ur texten
    const om = sportinfoLoppRader({ raceday_id: 'ts2', lopp: [{ lopp: 1, tempo_text: 'första 500 1.17.0 (6 Test), 1000 1.17.3 (6 Test) sista 500 1.14.3', tempo: [], sista500_sek: null }] });
    expect(om.tempo.map((t: any) => [t.meter, t.km_sek, t.ledare_nr])).toEqual([[500, 77, 6], [1000, 77.3, 6]]);
    expect(om.lopp[0].sista500_sek).toBe(74.3);
  });

  test('automatisk ombyggnad: bara databaser som saknas eller är minst 3 dygn gamla', async () => {
    const { databaserAttBygga } = await lib('databas.mjs');
    const nu = Date.parse('2026-10-14T12:00:00Z'), dygn = 864e5;
    expect(databaserAttBygga({ fotboll: nu - dygn, stryktips: nu - 2.9 * dygn, hastar: nu - 0.1 * dygn }, nu)).toEqual([]);
    expect(databaserAttBygga({ fotboll: nu - 3 * dygn, stryktips: nu - 2 * dygn, hastar: null }, nu)).toEqual(['fotboll', 'hastar']);
    expect(databaserAttBygga({}, nu)).toEqual(['fotboll', 'stryktips', 'hastar']);
    expect(databaserAttBygga({ fotboll: nu - 1.5 * dygn, stryktips: nu, hastar: nu }, nu, 1)).toEqual(['fotboll']);
  });

  test('hästar: skrällmissar och fynd (filerna från scripts/hastar-skrallmissar.mjs)', async () => {
    const { skrallmissRader, fyndRader, sqlVarde } = await lib('databas.mjs');
    const avd = { spel_id: 'V85_x', avdelning: 3, system: 'storvinst', budget_kr: 500, vinnare_streck: 0.04, med_i_systemet: 0, miss_typ: 'långt ner', overflodiga_hastar: 2 };
    const h = { spel_id: 'V85_x', avdelning: 3, startnummer: 8, hast: 'H', borde_rank: 6, skal: 'barfota första gången' };
    expect(skrallmissRader({ avdelningar: [avd], missade_hastar: [h] })).toEqual({ avdelningar: [avd], hastar: [h] });
    expect(skrallmissRader(null)).toEqual({ avdelningar: [], hastar: [] });
    const f = fyndRader({ fynd: [{ id: 'f1', datum: '2026-10-13', session: '5f', rubrik: 'R', storlek: 'stor', status: 'fakta', siffror: { n: 12 } }, { id: 'f2' }] });
    expect(f[0]).toMatchObject({ id: 'f1', storlek: 'stor', status: 'fakta', spelform: null, siffror: { n: 12 } });
    expect(sqlVarde(f[0].siffror)).toBe('{"n":12}');
    expect(f[1]).toMatchObject({ id: 'f2', rubrik: null, siffror: null });
    expect(fyndRader(null)).toEqual([]);
  });
});

// ---------- hastar-skrallmissar.mjs ----------

test.describe('skrällmissar: rang och missklassning', () => {
  const skript = () => import(pathToFileURL(path.join(ROOT, 'scripts', 'hastar-skrallmissar.mjs')).href);

  test('ranks: högst chans = 1, saknad chans sist', async () => {
    const { ranks } = await skript();
    const r = ranks([{ nr: 1, p: 0.2 }, { nr: 2, p: 0.5 }, { nr: 3, p: null }, { nr: 4, p: 0.3 }], 'p');
    expect([1, 2, 3, 4].map((nr) => r.get(nr))).toEqual([3, 1, 4, 2]);
  });

  test('classifyLeg: träff, spik föll, precis utanför, mittfält, långt ner', async () => {
    const { classifyLeg } = await skript();
    const rank = new Map([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9]]);
    // Träff: vinnaren (2) med, hästarna 3 och 4 är rankade under vinnaren och behövdes inte
    expect(classifyLeg([1, 2, 3, 4], [2], rank)).toMatchObject({ med: true, wRank: 2, last: 4, overflodiga: 2, typ: null });
    expect(classifyLeg([1], [3], rank)).toMatchObject({ med: false, typ: 'spik föll', overflodiga: null });
    expect(classifyLeg([1, 2], [4], rank).typ).toBe('precis utanför');
    expect(classifyLeg([1, 2], [6], rank).typ).toBe('mittfält');
    expect(classifyLeg([1, 2], [9], rank).typ).toBe('långt ner');
    // Dött lopp: någon av vinnarna med räcker
    expect(classifyLeg([1, 2], [2, 9], rank)).toMatchObject({ med: true, wRank: 2 });
  });
});

// ---------- gui/static-mode.js: webbversionens spellista för Hästar ----------

test.describe('static-mode: Hästars spellista på webbsidan', () => {
  const run = async (datum: string) => {
    const vm = await import('vm');
    const state = { index: { analyses: [
      { id: 'V86_2026-10-14_40_1', type: 'V86', date: '2026-10-14', track: 'Bergsåker' },
      { id: 'V85_2026-10-10_5_6', type: 'V85', date: '2026-10-10', track: 'Solvalla' },
      { id: 'V75_2026-10-14_1_1', type: 'V75', date: '2026-10-14', track: 'X', backtestOnly: true },
    ] } };
    const asked: string[] = [];
    const realFetch = async (u: string) => { asked.push(u); return new Response(JSON.stringify(state), { status: 200 }); };
    const window: any = { fetch: realFetch };
    const document = { createElement: () => ({}), head: { appendChild: () => {} } };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'gui', 'static-mode.js'), 'utf8'),
      { window, document, location: { href: 'https://newbetting.pages.dev/hastar', origin: 'https://newbetting.pages.dev' }, Response, URL, JSON, setTimeout });
    const body = await (await window.fetch(`/api/hastar/spel?datum=${datum}`)).json();
    return { body, asked };
  };

  test('dagens sparade omgång visas som spel (inte "Inga V-spel"), backtest-omgångar hoppas över', async () => {
    const { body, asked } = await run('2026-10-14');
    expect(asked).toEqual(['/api/hastar.json']);
    expect(body).toMatchObject({ date: '2026-10-14', saved: true });
    expect(body.games.map((g: any) => g.id)).toEqual(['V86_2026-10-14_40_1']);
  });

  test('datum utan sparad omgång ger tom lista med saved-flagga', async () => {
    const { body } = await run('2026-10-15');
    expect(body).toMatchObject({ games: [], saved: true });
  });

  test('kommande=1 tar närmaste stora sparade spelet från och med fran', async () => {
    const vm = await import('vm');
    const state = { index: { analyses: [
      { id: 'V86_2026-10-14_40_1', type: 'V86', date: '2026-10-14', track: 'Bergsåker' },
      { id: 'V85_2026-10-10_5_6', type: 'V85', date: '2026-10-10', track: 'Solvalla' },
      { id: 'V75_2026-10-14_1_1', type: 'V75', date: '2026-10-14', track: 'X', backtestOnly: true },
    ] } };
    const realFetch = async () => new Response(JSON.stringify(state), { status: 200 });
    const window: any = { fetch: realFetch };
    const document = { createElement: () => ({}), head: { appendChild: () => {} } };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'gui', 'static-mode.js'), 'utf8'),
      { window, document, location: { href: 'https://newbetting.pages.dev/hastar', origin: 'https://newbetting.pages.dev' }, Response, URL, JSON, setTimeout });
    const fromOct = await (await window.fetch('/api/hastar/spel?kommande=1&fran=2026-10-01')).json();
    expect(fromOct).toMatchObject({ date: '2026-10-10', upcomingId: 'V85_2026-10-10_5_6', saved: true });
    const from14 = await (await window.fetch('/api/hastar/spel?kommande=1&fran=2026-10-14')).json();
    expect(from14.upcomingId).toBe('V86_2026-10-14_40_1');
    expect(from14.games.map((g: any) => g.id)).toEqual(['V86_2026-10-14_40_1']);
    const none = await (await window.fetch('/api/hastar/spel?kommande=1&fran=2026-10-15')).json();
    expect(none).toMatchObject({ games: [], upcomingId: null, saved: true });
  });

  test('hastar.js: saved-listan ger egen text och laddar omgången vid val', () => {
    const src = fs.readFileSync(path.join(ROOT, 'gui', 'public', 'hastar.js'), 'utf8');
    expect(src).toContain('games.saved ? "Ingen sparad omgång denna dag"');
    expect(src).toMatch(/t\.id === "hs-game" && games\?\.saved && t\.value\) load\(t\.value\)/);
  });
});

// ---------- fotmob-match.mjs (FotMob matchDetails/Opta -> data/fotmob-matcher -> data/matcher) ----------

const fotmobDetails = (o: any = {}) => ({
  general: { matchId: 5107619, finished: o.finished ?? true, matchTimeUTCDate: '2026-10-12T17:00:00.000Z' },
  header: { teams: [{ name: 'Malmö FF', id: 10237, score: 1 }, { name: 'Kalmar FF', id: 9892, score: 0 }] },
  content: {
    stats: o.noStats ? null : { Periods: { All: { stats: [
      { key: 'top_stats', stats: [
        { key: 'BallPossesion', stats: [52, 48], type: 'graph' }, { key: 'expected_goals', stats: ['1.28', '1.78'], type: 'text' },
        { key: 'accurate_passes', stats: ['375 (84%)', '352 (83%)'], type: 'text' }, { key: 'big_chance', stats: [1, 4], type: 'text' },
      ] },
      { key: 'expected_goals', stats: [
        { key: 'expected_goals', stats: [null, null], type: 'title' }, { key: 'expected_goals', stats: ['9.99', '9.99'], type: 'text' },
        { key: 'expected_goals_on_target', stats: ['1.26', '1.20'], type: 'text' }, { key: 'okand_nyckel', stats: [1, 2], type: 'text' },
      ] },
    ] } } },
    lineup: { homeTeam: { formation: '4-3-3', rating: 7.1, starters: [{ id: 2 }] }, awayTeam: { formation: '4-2-3-1', rating: 6.6, starters: [] } },
    playerStats: o.noStats ? {} : {
      2: { id: 2, optaId: '68659', name: 'Jens Stryger Larsen', teamId: 10237, isGoalkeeper: false, stats: [
        { key: 'top_stats', stats: { 'Minutes played': { key: 'minutes_played', stat: { value: 90 } }, 'Expected goals (xG)': { key: 'expected_goals', stat: { value: 0.07 } },
          'Accurate passes': { key: 'accurate_passes', stat: { value: 39, total: 43 } }, 'Shotmap': { key: null, stat: { value: 1 } } } },
      ] },
      3: { id: 3, name: 'Bänkad', teamId: 9892, isGoalkeeper: true, stats: [{ key: 'top_stats', stats: { 'xGOT': { key: 'expected_goals_on_target_variant', stat: {} } } }] },
      4: { id: 4, name: 'Inhoppare', teamId: 9892, stats: [{ key: 'top_stats', stats: { 'Minutes played': { key: 'minutes_played', stat: { value: 12 } } } }] },
    },
  },
});

test.describe('fotmob-match: Optas siffror via FotMob', () => {
  test('lagraden: xG, bråktal, första värdet vinner, titlar och okända nycklar hoppas över', async () => {
    const { teamFromDetails, statNum } = await lib('fotmob-match.mjs');
    expect(statNum('375 (84%)')).toBe(375);
    expect(statNum('1.28')).toBe(1.28);
    expect(statNum(null)).toBeNull();
    const t = teamFromDetails(fotmobDetails());
    expect(t).toMatchObject({ src: 'fotmob', id: '5107619', d: '2026-10-12', h: 'Malmö FF', a: 'Kalmar FF', hg: 1, ag: 0, form: ['4-3-3', '4-2-3-1'], rat: [7.1, 6.6] });
    expect(t.s).toEqual({ poss: [52, 48], xg: [1.28, 1.78], pasok: [375, 352], bigch: [1, 4], xgot: [1.26, 1.2] });
  });

  test('ospelad match ger null, match utan statistik ger tomt s', async () => {
    const { teamFromDetails, playersFromDetails, hasStats } = await lib('fotmob-match.mjs');
    expect(teamFromDetails(fotmobDetails({ finished: false }))).toBeNull();
    const t = teamFromDetails(fotmobDetails({ noStats: true }));
    expect(t.s).toEqual({});
    expect(hasStats(t, playersFromDetails(fotmobDetails({ noStats: true })))).toBe(false);
    expect(hasStats(teamFromDetails(fotmobDetails()), [])).toBe(true);
  });

  test('spelarna: lag, start, bråktal med försök, bänkade utan siffror hoppas över', async () => {
    const { playersFromDetails } = await lib('fotmob-match.mjs');
    const p = playersFromDetails(fotmobDetails());
    expect(p.map((x: any) => x.id)).toEqual([2, 4]);
    expect(p[0]).toEqual({ id: 2, optaId: '68659', n: 'Jens Stryger Larsen', t: 0, gk: false, st: 1, s: { min: 90, xg: 0.07, pasok: 39, pasokN: 43 } });
    expect(p[1]).toMatchObject({ t: 1, st: 0, s: { min: 12 } });
  });

  test('applyFotmob fyller bara tomma celler, xG bara utan understat/football-data', async () => {
    const { teamFromDetails, applyFotmob, seasonFile } = await lib('fotmob-match.mjs');
    const m = teamFromDetails(fotmobDetails());
    const tom: any = applyFotmob({ xg_h: '', xg_a: '', poss_h: '' }, m);
    expect(tom).toMatchObject({ xg_h: 1.28, xg_a: 1.78, xg_src: 'fotmob', poss_h: 52, poss_a: 48, bigch_h: 1, xgot_h: 1.26, rat_a: 6.6, fotmob_id: '5107619', stats_src: 'fotmob', form_h: '4-3-3' });
    const full: any = applyFotmob({ xg_h: 2.1, xg_a: 0.4, xg_src: 'understat', poss_h: 60, poss_a: 40, stats_src: 'espn' }, m);
    expect(full).toMatchObject({ xg_h: 2.1, xg_a: 0.4, xg_src: 'understat', poss_h: 60, poss_a: 40, stats_src: 'espn', xgot_h: 1.26 });
    expect(seasonFile('2026/2027 - Apertura')).toBe('2026-2027-apertura');
    expect(seasonFile('2025')).toBe('2025');
  });
});

test.describe('databas: Opta via FotMob', () => {
  test('lag per match blir hemma_/borta_-kolumner, spelare får lag, sida och svenska namn', async () => {
    const { teamFromDetails, playersFromDetails } = await lib('fotmob-match.mjs');
    const { optaMatchRader } = await lib('databas.mjs');
    const md = fotmobDetails();
    const t = teamFromDetails(md);
    const lagDoc = { league: 'AS', season: '2026', matches: { [t.id]: t } };
    const { lag, spelare } = optaMatchRader(lagDoc, { matches: { [t.id]: playersFromDetails(md) } });
    expect(lag).toHaveLength(1);
    expect(lag[0]).toMatchObject({ match_id: 'fotmob:5107619', fotmob_match_id: '5107619', liga: 'AS', sasong: '2026', datum: '2026-10-12', hemmalag: 'Malmö FF',
      hemma_xg: 1.28, borta_xg: 1.78, hemma_xg_pa_mal: 1.26, hemma_lyckade_passningar: 375, hemma_bollinnehav: 52, borta_stora_chanser: 4, hemma_formation: '4-3-3', borta_lagbetyg: 6.6 });
    expect(spelare[0]).toMatchObject({ match_id: 'fotmob:5107619', spelar_id: 2, opta_id: '68659', sida: 'hemma', lag: 'Malmö FF', malvakt: 0, startade: 1,
      minuter: 90, xg: 0.07, lyckade_passningar: 39, passningar: 43 });
    expect(spelare[1]).toMatchObject({ sida: 'borta', lag: 'Kalmar FF', startade: 0, minuter: 12 });
    expect(optaMatchRader(lagDoc).spelare).toEqual([]);
  });
});
