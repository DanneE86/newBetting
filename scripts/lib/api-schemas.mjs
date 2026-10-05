// Formatkontroll (zod) för svaren från FotMob, Svenska Spel och ATG. Bara fälten koden bygger på krävs;
// övriga fält får finnas eller saknas. Används via getJson(url, { schema }) i scripts/lib/http.mjs.
// Ändrar en källa sitt format loggas en tydlig varning i stället för att fel siffror går vidare tyst.
import { z } from 'zod';
import { getJson } from './http.mjs';

const id = z.union([z.string(), z.number()]);
const team = z.object({ id, name: z.string() });

// ---------- FotMob ----------
export const FM = 'https://www.fotmob.com/api/data';

export const fotmobSchemas = {
  leagues: z.object({
    details: z.object({ id, name: z.string(), selectedSeason: z.string().optional() }),
    table: z.array(z.object({ data: z.object({}).optional() })).optional(),
    fixtures: z.object({
      allMatches: z.array(z.object({ id, home: team, away: team, status: z.object({ utcTime: z.string().optional() }).optional() })),
    }).optional(),
  }),
  matchDetails: z.object({
    general: z.object({ matchId: id, leagueName: z.string().optional(), matchTimeUTCDate: z.string().optional() }),
    header: z.object({ teams: z.array(team) }).optional(),
    content: z.object({ lineup: z.unknown().optional(), matchFacts: z.unknown().optional(), stats: z.unknown().optional() }),
  }),
  teams: z.object({
    details: z.object({ id, name: z.string() }),
    squad: z.object({ squad: z.array(z.object({ members: z.array(z.unknown()).optional() })).nullish() }).nullish(),
    fixtures: z.object({ allFixtures: z.object({ fixtures: z.array(z.unknown()) }).optional() }).optional(),
  }),
  playerData: z.object({
    id: z.number(), name: z.string(),
    careerHistory: z.object({ careerItems: z.unknown().optional() }).nullish(),
  }),
  playerStats: z.object({}),
  matches: z.object({
    leagues: z.array(z.object({ id: id.optional(), matches: z.array(z.object({ id, home: team, away: team })) })),
  }),
  suggest: z.array(z.object({ suggestions: z.array(z.object({ type: z.string(), id })).optional() })),
};

/**
 * FotMob-anrop med formatkontroll. kind = nyckel i fotmobSchemas, query = '?id=47' osv.
 * Returnerar null vid 404, nätverksfel eller formatfel (som loggas). 403 räknas som strypning.
 */
export function fotmob(kind, query, o = {}) {
  return fotmobGet(`${FM}/${kind === 'suggest' ? 'search/suggest' : kind}${query}`, o);
}

/** Som fotmob() men med hel URL: schemat väljs efter sökvägen (…/api/data/<kind>). Okänd sökväg = ingen kontroll. */
export function fotmobGet(url, o = {}) {
  const u = new URL(url);
  if (!u.hostname.endsWith('fotmob.com')) return getJson(url, { orNull: true, ...o });
  const p = u.pathname.replace(/^\/api\/data\//, '');
  const kind = p === 'search/suggest' ? 'suggest' : p;
  return getJson(url, {
    orNull: true, throttleStatus: [429, 403], headers: { Accept: 'application/json' },
    schema: fotmobSchemas[kind], label: `FotMob ${kind}`, ...o,
  });
}

// ---------- Svenska Spel ----------
const drawEvent = z.object({ eventNumber: z.number(), cancelled: z.boolean().optional() });
const draw = z.object({ drawNumber: z.number(), drawState: z.string().optional(), regCloseTime: z.string().optional(), drawEvents: z.array(drawEvent).optional() });
export const svsSchemas = {
  draws: z.object({ draws: z.array(draw) }),
  draw: z.object({ draw }),
  result: z.object({ result: z.object({ drawNumber: z.number().optional(), events: z.array(z.unknown()).optional(), distribution: z.array(z.unknown()).optional() }).nullish() }),
};

// ---------- ATG ----------
export const atgSchemas = {
  calendar: z.object({ date: z.string(), tracks: z.array(z.object({ id: z.number(), name: z.string() })).optional(), games: z.record(z.string(), z.array(z.object({ id: z.string() }))) }),
  game: z.object({ id: z.string(), races: z.array(z.object({ id: z.string(), starts: z.array(z.object({ number: z.number() })) })) }),
};
