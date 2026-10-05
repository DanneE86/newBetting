import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

// scripts/lib/match-context.mjs (FotMob-kontext for Stryktipset/Europatipset) med mockad fetch - inget nat.
const modUrl = pathToFileURL(path.resolve(__dirname, '..', 'scripts', 'lib', 'match-context.mjs')).href;
let n = 0;
// Farsk modul per test: dag-/lagcacharna ar modulnivaa
const load = () => import(`${modUrl}?t=${Date.now()}-${n++}`);

const KICKOFF = '2026-10-01T20:45:00+02:00'; // 18:45 UTC
const utc = (iso: string) => new Date(iso).toISOString();

type Routes = { matches?: Record<string, any>; details?: Record<string, any>; teams?: Record<string, any>; status?: number };
let calls: string[] = [];
const realFetch = globalThis.fetch;

function mockFetch(r: Routes) {
  calls = [];
  globalThis.fetch = (async (url: string) => {
    calls.push(String(url));
    const u = new URL(String(url));
    let body: any;
    if (r.status && r.status !== 200) return new Response('{}', { status: r.status });
    if (u.pathname.endsWith('/matches')) body = r.matches?.[u.searchParams.get('date')!] ?? { leagues: [] };
    else if (u.pathname.endsWith('/matchDetails')) body = r.details?.[u.searchParams.get('matchId')!];
    else if (u.pathname.endsWith('/teams')) body = r.teams?.[u.searchParams.get('id')!] ?? fixtures([]);
    if (body === undefined) return new Response('{}', { status: 404 });
    return new Response(JSON.stringify(body), { status: 200 });
  }) as any;
}
test.afterEach(() => { globalThis.fetch = realFetch; });

// Svaren har samma nyckelfält som FotMobs riktiga (lag-id, matchId, lagdetaljer) – formatkontrollen i api-schemas.mjs kräver dem
const fmMatch = (id: number, home: string, away: string, iso: string) => ({ id, home: { id: id * 100 + 1, name: home }, away: { id: id * 100 + 2, name: away }, status: { utcTime: utc(iso) } });
const dayWith = (league: string, matches: any[]) => ({ leagues: [{ name: league, matches }] });

const player = (name: string, marketValue: number, extra: any = {}) => ({ name, marketValue, ...extra });
function details(over: any = {}) {
  return {
    general: { matchId: 1, leagueName: 'UEFA Nations League', matchRound: '3' },
    content: {
      lineup: {
        lineupType: 'lastStarting11',
        homeTeam: { id: 10, name: 'Bosnia and Herzegovina', formation: '4-3-3', starters: [player('A', 30), player('B', 20), player('C', 10)], unavailable: [player('Skadad', 40, { unavailability: { type: 'injury', expectedReturn: 'Nov 2026' } })] },
        awayTeam: { id: 20, name: 'Sweden', formation: '4-4-2', starters: [player('D', 50), player('E', 50)], unavailable: [] },
      },
      matchFacts: { infoBox: { Referee: { text: 'Anthony Taylor' }, Stadium: { name: 'Bilino Polje', city: 'Zenica', country: 'Bosnia', lat: 44.2, long: 17.9, surface: 'grass' } }, teamForm: [[{ resultString: 'W' }, { resultString: 'L' }], [{ resultString: 'D' }]] },
      weather: { temperature: 12, windSpeed: 4, precipChance: 20, precipitation: 0, description: 'Molnigt' },
      h2h: { summary: [1, 2, 3] },
      ...over,
    },
  };
}
const fixtures = (list: any[]) => ({ details: { id: 1, name: 'Lag' }, fixtures: { allFixtures: { fixtures: list } } });
const fx = (iso: string, tournament: string, opponent = 'X', cancelled = false) => ({ status: { utcTime: utc(iso), cancelled }, tournament: { name: tournament }, opponent: { name: opponent } });

// ---------- fetchMatchContext ----------

test('hittar landskamp med svenska namn (Bosnien & Hercegovina - Sverige) och fyller kontexten', async () => {
  mockFetch({
    matches: { '20261001': dayWith('UEFA Nations League', [
      fmMatch(1, 'Bosnia and Herzegovina', 'Sweden', '2026-10-01T18:45:00Z'),
      fmMatch(2, 'Denmark', 'Portugal', '2026-10-01T18:45:00Z'),
    ]) },
    details: { '1': details() },
    teams: {
      '10': fixtures([fx('2026-09-27T16:00:00Z', 'UEFA Nations League'), fx('2026-09-20T16:00:00Z', 'Friendly'), fx('2026-10-04T16:00:00Z', 'UEFA Nations League'), fx('2026-10-02T16:00:00Z', 'Friendly', 'Y', true)]),
      '20': fixtures([fx('2026-09-24T16:00:00Z', 'UEFA Nations League'), fx('2026-10-08T16:00:00Z', 'World Cup Qualification')]),
    },
  });
  const { fetchMatchContext } = await load();
  const cx = await fetchMatchContext({ kickoff: KICKOFF, home: 'Bosnien & Hercegovina', away: 'Sverige' });
  expect(cx).toBeTruthy();
  expect(cx.fotmobMatchId).toBe(1);
  expect(cx.league).toBe('UEFA Nations League');
  expect(cx.lineupType).toBe('lastStarting11');
  expect(cx.lineupConfirmed).toBe(false);
  expect(cx.home.fotmobTeam).toBe('Bosnia and Herzegovina');
  expect(cx.home.starters).toEqual(['A', 'B', 'C']);
  expect(cx.home.unavailable).toEqual([{ name: 'Skadad', type: 'injury', expectedReturn: 'Nov 2026', marketValue: 40 }]);
  // 40 / (60 + 40)
  expect(cx.home.missingValueShare).toBe(0.4);
  expect(cx.away.missingValueShare).toBe(0);
  // Vila: senaste matchen fore avspark (27/9 16:00 -> 1/10 18:45 = 4,1 dagar); installd match raknas inte
  expect(cx.home.restDays).toBe(4.1);
  expect(cx.home.prevMatch.date).toBe(utc('2026-09-27T16:00:00Z'));
  expect(cx.home.nextMatch.date).toBe(utc('2026-10-04T16:00:00Z'));
  expect(cx.home.daysToNext).toBe(2.9);
  expect(cx.away.restDays).toBe(7.1);
  expect(cx.referee).toBe('Anthony Taylor');
  expect(cx.stadium.city).toBe('Zenica');
  expect(cx.form).toEqual({ home: 'WL', away: 'D' });
  expect(cx.h2h).toEqual({ homeWins: 1, draws: 2, awayWins: 3 });
  expect(cx).not.toHaveProperty('weather'); // vader paverkar inte utfallet och hamtas inte
  // Hamtar bara detaljer for den matchade matchen
  expect(calls.filter((c) => c.includes('matchDetails'))).toHaveLength(1);
});

test('matchar inte en match mer än 2 h från avspark eller med fel lag', async () => {
  mockFetch({
    matches: { '20261001': dayWith('UEFA Nations League', [
      fmMatch(1, 'Bosnia and Herzegovina', 'Sweden', '2026-10-01T21:00:00Z'), // 2 h 15 min senare
      fmMatch(2, 'Denmark', 'Portugal', '2026-10-01T18:45:00Z'),
    ]) },
    details: { '1': details(), '2': details() },
  });
  const { fetchMatchContext } = await load();
  expect(await fetchMatchContext({ kickoff: KICKOFF, home: 'Bosnien & Hercegovina', away: 'Sverige' })).toBeNull();
  expect(await fetchMatchContext({ kickoff: KICKOFF, home: 'Norge', away: 'Italien' })).toBeNull();
  expect(calls.some((c) => c.includes('matchDetails'))).toBe(false);
});

test('matchar inte andra lag som bara delar ett ord i namnet eller har fel motståndare', async () => {
  // Ratt match saknas i FotMobs lista (t.ex. flyttad avspark) - da ska ingen annan match med liknande namn valjas
  mockFetch({
    matches: { '20261001': dayWith('Mix', [
      fmMatch(8, 'Newcastle United', 'West Bromwich Albion', '2026-10-01T18:45:00Z'),
      fmMatch(9, 'Malmö FF', 'Hammarby', '2026-10-01T18:45:00Z'),
    ]) },
    details: { '8': details(), '9': details() },
  });
  const { fetchMatchContext } = await load();
  expect((await fetchMatchContext({ kickoff: KICKOFF, home: 'Manchester United', away: 'West Ham' }))?.fotmobMatchId ?? null).toBeNull();
  // Ett lag exakt ratt men motstandaren helt fel (t.ex. damlag eller annan match) - elvor/franvaro skulle bli fel lags
  expect((await fetchMatchContext({ kickoff: KICKOFF, home: 'Malmö FF', away: 'IFK Göteborg' }))?.fotmobMatchId ?? null).toBeNull();
});

test('väljer rätt lag när namnen liknar varandra (Irland / Nordirland)', async () => {
  mockFetch({
    matches: { '20261001': dayWith('UEFA Nations League', [
      fmMatch(5, 'Northern Ireland', 'Germany', '2026-10-01T18:45:00Z'),
      fmMatch(6, 'Ireland', 'Austria', '2026-10-01T18:45:00Z'),
    ]) },
    details: { '5': details(), '6': details() },
  });
  const { fetchMatchContext } = await load();
  expect((await fetchMatchContext({ kickoff: KICKOFF, home: 'Irland', away: 'Österrike' }))?.fotmobMatchId).toBe(6);
  expect((await fetchMatchContext({ kickoff: KICKOFF, home: 'Nordirland', away: 'Tyskland' }))?.fotmobMatchId).toBe(5);
});

test('hittar match som i UTC ligger på dagen före (sen avspark nära midnatt)', async () => {
  // 00:30 svensk tid = 22:30 UTC dagen innan
  mockFetch({
    matches: { '20261001': dayWith('Liga', [fmMatch(7, 'Norway', 'Italy', '2026-10-01T22:30:00Z')]) },
    details: { '7': details() },
  });
  const { fetchMatchContext } = await load();
  expect((await fetchMatchContext({ kickoff: '2026-10-02T00:30:00+02:00', home: 'Norge', away: 'Italien' }))?.fotmobMatchId).toBe(7);
});

test('bekräftad elva: lineupConfirmed true, "predicted" räknas inte som bekräftad', async () => {
  for (const [type, confirmed] of [['standard', true], ['predictedLineup', false], ['lastStarting11', false], ['unavailable', false]] as const) {
    mockFetch({
      matches: { '20261001': dayWith('UEFA Nations League', [fmMatch(1, 'Bosnia and Herzegovina', 'Sweden', '2026-10-01T18:45:00Z')]) },
      details: { '1': details({ lineup: { ...details().content.lineup, lineupType: type } }) },
    });
    const { fetchMatchContext } = await load();
    const cx = await fetchMatchContext({ kickoff: KICKOFF, home: 'Bosnien & Hercegovina', away: 'Sverige' });
    expect(cx.lineupConfirmed, type).toBe(confirmed);
  }
});

test('bekräftad elva kräver startspelare: "standard" utan startelvor (dagar före matchen) är inte bekräftad', async () => {
  const lu = details().content.lineup;
  mockFetch({
    matches: { '20261001': dayWith('UEFA Nations League', [fmMatch(1, 'Bosnia and Herzegovina', 'Sweden', '2026-10-01T18:45:00Z')]) },
    details: { '1': details({ lineup: { ...lu, lineupType: 'standard', homeTeam: { ...lu.homeTeam, starters: [] }, awayTeam: { ...lu.awayTeam, starters: [] } } }) },
  });
  const { fetchMatchContext, contextNotes } = await load();
  const cx = await fetchMatchContext({ kickoff: KICKOFF, home: 'Bosnien & Hercegovina', away: 'Sverige' });
  expect(cx.lineupConfirmed).toBe(false);
  expect(contextNotes(cx, 'Bosnien', 'Sverige')[0]).toMatch(/^Elvorna är inte bekräftade/);
});

test('matchdetaljer saknas: bara id och liga, ingen krasch', async () => {
  mockFetch({
    matches: { '20261001': dayWith('UEFA Nations League', [fmMatch(1, 'Bosnia and Herzegovina', 'Sweden', '2026-10-01T18:45:00Z')]) },
    details: { '1': { general: {} } },
  });
  const { fetchMatchContext, contextNotes } = await load();
  const cx = await fetchMatchContext({ kickoff: KICKOFF, home: 'Bosnien & Hercegovina', away: 'Sverige' });
  expect(cx).toEqual({ fotmobMatchId: 1, league: 'UEFA Nations League' });
  expect(contextNotes(cx, 'Bosnien & Hercegovina', 'Sverige')).toEqual([]);
});

test('ogiltig avsparkstid: null utan nätanrop', async () => {
  mockFetch({});
  const { fetchMatchContext } = await load();
  expect(await fetchMatchContext({ kickoff: 'okänd', home: 'Norge', away: 'Italien' })).toBeNull();
  expect(calls).toHaveLength(0);
});

test('FotMob nere (HTTP 500 / nätfel): null, ingen krasch', async () => {
  test.slow(); // tre forsok med vantan
  mockFetch({ status: 500 });
  let mod = await load();
  expect(await mod.fetchMatchContext({ kickoff: KICKOFF, home: 'Norge', away: 'Italien' })).toBeNull();
  globalThis.fetch = (async () => { throw new Error('ECONNRESET'); }) as any;
  mod = await load();
  expect(await mod.fetchMatchContext({ kickoff: KICKOFF, home: 'Norge', away: 'Italien' })).toBeNull();
});

// ---------- contextNotes ----------

const side = (over: any = {}) => ({ unavailable: [], missingValueShare: 0, restDays: 7, daysToNext: 7, prevMatch: null, nextMatch: null, ...over });
const cxOf = (home: any, away: any, over: any = {}) => ({ league: 'Premier League', lineupConfirmed: false, home, away, referee: null, weather: null, ...over });

test('contextNotes: tom utan kontext, elvastatus alltid först', async () => {
  const { contextNotes } = await load();
  expect(contextNotes(null, 'A', 'B')).toEqual([]);
  expect(contextNotes({ fotmobMatchId: 1 }, 'A', 'B')).toEqual([]);
  expect(contextNotes(cxOf(side(), side()), 'A', 'B')).toEqual(['Elvorna är inte bekräftade än (FotMob visar senaste elvan).']);
  expect(contextNotes(cxOf(side(), side(), { lineupConfirmed: true }), 'A', 'B')[0]).toBe('Startelvorna är bekräftade (FotMob).');
});

test('contextNotes: frånvaro visar topp 4 efter marknadsvärde, andel bara från 10 %', async () => {
  const { contextNotes } = await load();
  const un = [['a', 1], ['b', 50], ['c', 5], ['d', 30], ['e', 20]].map(([name, marketValue]) => ({ name, marketValue, type: 'injury' }));
  const notes = contextNotes(cxOf(side({ unavailable: un, missingValueShare: 0.25 }), side({ unavailable: un.slice(0, 1), missingValueShare: 0.099 })), 'Hemma', 'Borta');
  expect(notes).toContain('Hemma saknar 5 spelare (b, d, e, c), 25 % av startelvans + frånvarandes marknadsvärde.');
  expect(notes).toContain('Borta saknar 1 spelare (a).');
});

test('contextNotes: vila bara när laget har < 4 dagar och minst 1,5 dag mindre än motståndaren', async () => {
  const { contextNotes } = await load();
  const rest = (h: number, a: number) => contextNotes(cxOf(side({ restDays: h, prevMatch: { tournament: 'Europa League' } }), side({ restDays: a })), 'Hemma', 'Borta').filter((s: string) => s.includes('vila'));
  expect(rest(3, 4.5)).toEqual(['Hemma har 3 dagars vila mot 4.5 för motståndaren (senast Europa League).']);
  expect(rest(3, 4.4)).toEqual([]); // skillnad < 1,5
  expect(rest(4, 7)).toEqual([]); // 4 dagar ar tillrackligt
  expect(rest(3, 3)).toEqual([]); // landslagsuppehall: alla lika
});

test('contextNotes: rotation bara inom 4 dagar och i en annan turnering', async () => {
  const { contextNotes } = await load();
  const rot = (days: number, tournament: string) => contextNotes(cxOf(side({ daysToNext: days, nextMatch: { tournament } }), side()), 'Hemma', 'Borta').filter((s: string) => s.includes('rotation'));
  expect(rot(3, 'Champions League')).toEqual(['Hemma spelar Champions League om 3 dagar, vilket ger risk för rotation.']);
  expect(rot(3, 'Premier League')).toEqual([]); // samma liga
  expect(rot(4, 'Champions League')).toEqual([]);
});

test('contextNotes: domare alltid, aldrig väder (påverkar inte utfallet)', async () => {
  const { contextNotes } = await load();
  const w = (windSpeed: number, precipChance: number) => contextNotes(cxOf(side(), side(), { referee: 'Glenn Nyberg', weather: { windSpeed, precipChance, description: 'Regn' } }), 'A', 'B');
  expect(w(4, 20)).toContain('Domare: Glenn Nyberg.');
  expect(w(4, 20).some((s: string) => s.startsWith('Väder'))).toBe(false);
  expect(w(20, 0).some((s: string) => s.startsWith('Väder'))).toBe(false);
  expect(w(0, 90).some((s: string) => s.startsWith('Väder'))).toBe(false);
});
