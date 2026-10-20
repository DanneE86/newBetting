// Oddsschema: hamtar odds for matcher inom 24 h - alla ligor en gang per dag fran 08:00, europeiska ligor och
// UEFA-cuperna dessutom 1 h fore avspark - och raknar om tipsen sa oddsrorelsen syns pa /tips.
// Kors var 10:e minut av .github/workflows/odds-schema.yml (molnet, aven nar datorn ar av). Regler: scripts/lib/odds-schedule.mjs.
//   node scripts/odds-schema.mjs --plan    visa vad som ar due (skriver run=true/false till GITHUB_OUTPUT)
//   node scripts/odds-schema.mjs           hamta det som ar due: OddsPortal (gratis) + The Odds API inom kvoten, pro-lagret, rapport
// Tillstand: data/open/odds-schema.json (committas, sa nasta korning vet vad som redan hamtats).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { planOdds, apiBudget, nextState } from './lib/odds-schedule.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  tips: path.join(root, 'data', 'tips-latest.json'),
  leagues: path.join(root, 'config', 'leagues.json'),
  state: path.join(root, 'data', 'open', 'odds-schema.json'),
  env: path.join(root, '.env'),
};
const readJson = (p, fb) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')) : fb);
const planOnly = process.argv.includes('--plan');

function upcomingMatches() {
  const tips = readJson(P.tips, {});
  const seen = new Map();
  for (const t of [...(tips.bestUpcoming ?? []), ...(tips.allCandidates ?? [])]) {
    const kickoffUtc = t.kickoffUtc ?? t.pro?.kickoffUtc;
    if (!kickoffUtc) continue;
    const key = `${t.date}|${t.league}|${t.home}|${t.away}`;
    if (!seen.has(key)) seen.set(key, { key, league: t.league, kickoffUtc, match: t.match });
  }
  return [...seen.values()];
}

function apiKey() {
  if (process.env.THE_ODDS_API_KEY) return process.env.THE_ODDS_API_KEY;
  if (!fs.existsSync(P.env)) return null;
  const m = /^\s*THE_ODDS_API_KEY\s*=\s*"?([^"\r\n]+)"?/m.exec(fs.readFileSync(P.env, 'utf8'));
  return m?.[1]?.trim() || null;
}

// Kvarvarande krediter: listan over sporter kostar inget och svarar med kvoten i huvudet
async function creditsLeft(key) {
  if (!key) return null;
  try {
    const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(30_000) });
    const left = Number(res.headers.get('x-requests-remaining'));
    return Number.isFinite(left) ? left : null;
  } catch { return null; }
}

const run = (cmd, args, env = {}) => {
  console.log(`> ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
};

const registry = readJson(P.leagues, { leagues: {} });
const state = readJson(P.state, {});
const plan = planOdds({ matches: upcomingMatches(), state, leagues: registry.leagues });
console.log(`Oddsschema ${plan.date}: dagens hämtning ${plan.daily ? `ja (${plan.dailyLeagues.join(', ') || 'inga matcher inom 24 h'})` : 'gjord'}`
  + ` · 1 h före avspark: ${plan.prekickKeys.length ? `${plan.prekickKeys.length} matcher (${plan.prekickLeagues.join(', ')})` : 'inga'}`);
const due = plan.daily || plan.prekickKeys.length > 0;
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `run=${due}\n`);
if (planOnly || !due) process.exit(0);

if (plan.leagues.length) {
  // OddsPortal: gratis, alla ligor med sida dar
  const op = plan.leagues.filter((c) => registry.leagues[c]?.oddsportal);
  if (op.length) {
    try { run('node', ['scripts/fetch-oddsportal.mjs', ...op]); } catch (e) { console.log(`OddsPortal misslyckades: ${e.message}`); }
  }
  // The Odds API (Pinnacle-facit): bara inom dagens kvot, europeiska matcher fore avspark forst
  const key = apiKey();
  const leftNow = await creditsLeft(key);
  const credits = state.credits?.date === plan.date ? state.credits : { date: plan.date, startLeft: leftNow };
  const budget = apiBudget({ startLeft: credits.startLeft, leftNow, daily: plan.daily && !plan.prekickKeys.length });
  const apiLeagues = [...plan.prekickLeagues, ...plan.dailyLeagues.filter((c) => !plan.prekickLeagues.includes(c))]
    .filter((c) => registry.leagues[c]?.odds).slice(0, budget / 2);
  console.log(`The Odds API: ${leftNow ?? '?'} krediter kvar, ${budget} i denna körning -> ${apiLeagues.join(', ') || 'inga ligor'}`);
  if (apiLeagues.length) {
    try {
      run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/Fetch-OddsApi.ps1'],
        { ODDS_LEAGUES: apiLeagues.join(','), ODDS_BUDGET: String(budget), ODDS_HORIZON_DAYS: '1' });
    } catch (e) { console.log(`The Odds API misslyckades: ${e.message}`); }
  }
  run('node', ['scripts/pro-layer.mjs']);
  run('node', ['scripts/odds-rorelser.mjs']);
  state.credits = credits;
}
fs.writeFileSync(P.state, `${JSON.stringify(nextState(state, plan, { leftNow: state.credits?.startLeft ?? null }), null, 2)}\n`);
console.log('Oddsschema: klart');
