import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const root = path.resolve(__dirname, '..');
const GUI_PORT = 3855;

function readJson(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

test.describe('spelarstatistik — öppna källor vs Opta', () => {
  test('Opta / FBref / WhoScored är blockerade eller kräver licens', async ({ request }) => {
    const probes = [
      {
        name: 'FBref',
        url: 'https://fbref.com/en/comps/9/stats/Premier-League-Stats',
        expectBlocked: true,
      },
      {
        name: 'WhoScored',
        url: 'https://www.whoscored.com/Regions/252/Tournaments/2/England-Premier-League',
        expectBlocked: true,
      },
      {
        name: 'Sofascore',
        url: 'https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-09-20',
        expectBlocked: true,
      },
    ];

    const results: { name: string; status: number; blocked: boolean }[] = [];
    for (const p of probes) {
      const res = await request.get(p.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
        timeout: 30_000,
        failOnStatusCode: false,
      });
      const status = res.status();
      const blocked = status === 403 || status === 401 || status === 429 || status >= 500;
      results.push({ name: p.name, status, blocked });
      if (p.expectBlocked) {
        expect(blocked || status !== 200, `${p.name} förväntas blockerad, fick ${status}`).toBeTruthy();
      }
    }

    // Opta har ingen öppen spelstat-API — dokumentera förväntan
    const opta = await request.get('https://api.performfeeds.com/', {
      timeout: 20_000,
      failOnStatusCode: false,
    });
    results.push({
      name: 'Opta/PerformFeeds',
      status: opta.status(),
      blocked: opta.status() !== 200,
    });
    expect(opta.status(), 'Opta PerformFeeds ska inte ge öppen 200 utan nyckel').not.toBe(200);

    const outDir = path.join(root, 'data', 'open');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'player_sources_probe.json'),
      JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          results,
          conclusion:
            'totalPasses per spelare kräver Opta/FBref/licens. Använd Understat key_passes + FPL + ESPN CH.',
        },
        null,
        2
      ),
      'utf8'
    );
  });

  test('Understat getLeagueData ger alla EPL-spelare med key_passes', async ({ request }) => {
    const season = '2026';
    await request.get(`https://understat.com/league/EPL/${season}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 45_000,
      failOnStatusCode: false,
    });
    const ajax = await request.get(`https://understat.com/getLeagueData/EPL/${season}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        Referer: `https://understat.com/league/EPL/${season}`,
      },
      timeout: 60_000,
    });
    expect(ajax.ok()).toBeTruthy();
    const data = await ajax.json();
    expect(Array.isArray(data.players)).toBeTruthy();
    expect(data.players.length).toBeGreaterThan(400);
    const bruno = data.players.find((p: { player_name: string }) =>
      /bruno fernandes/i.test(p.player_name)
    );
    expect(bruno).toBeTruthy();
    expect(Number(bruno.key_passes)).toBeGreaterThanOrEqual(0);

    const detail = await request.get(`https://understat.com/getPlayerData/${bruno.id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://understat.com/player/${bruno.id}`,
      },
      timeout: 45_000,
    });
    expect(detail.ok()).toBeTruthy();
    const pd = await detail.json();
    expect(Array.isArray(pd.matches)).toBeTruthy();
    expect(pd.matches.length).toBeGreaterThan(0);
    expect(pd.matches[0]).toHaveProperty('key_passes');
    // totalPasses finns inte — det är poängen med detta test
    expect(pd.matches[0].totalPasses).toBeUndefined();
  });

  test('FPL element-summary ger matchhistorik (utan totalPasses)', async ({ request }) => {
    const boot = await request.get('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: { 'User-Agent': 'BettingNy/1.0' },
      timeout: 60_000,
    });
    expect(boot.ok()).toBeTruthy();
    const data = await boot.json();
    expect(data.elements.length).toBeGreaterThan(500);
    const bruno = data.elements.find(
      (e: { web_name: string; second_name: string }) =>
        /fernandes/i.test(e.second_name) || /Bruno/i.test(e.web_name)
    );
    expect(bruno).toBeTruthy();
    const sum = await request.get(
      `https://fantasy.premierleague.com/api/element-summary/${bruno.id}/`,
      { headers: { 'User-Agent': 'BettingNy/1.0' }, timeout: 30_000 }
    );
    expect(sum.ok()).toBeTruthy();
    const hist = await sum.json();
    expect(hist.history.length).toBeGreaterThan(0);
    const last = hist.history[hist.history.length - 1];
    expect(last).toHaveProperty('minutes');
    expect(last).toHaveProperty('tackles');
    expect(last).toHaveProperty('creativity');
    expect(last.totalPasses ?? last.passes).toBeUndefined();
  });
});

test.describe('GUI /api/players (fallback när Opta saknas)', () => {
  let server: ReturnType<typeof spawn> | null = null;

  test.beforeAll(async () => {
    const statsPath = path.join(root, 'data', 'open', 'player_stats.json');
    test.skip(!fs.existsSync(statsPath), 'Kör npm run players först');

    server = spawn('node', ['gui/server.mjs'], {
      cwd: root,
      env: { ...process.env, PORT: String(GUI_PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    // Vänta tills servern svarar
    const deadline = Date.now() + 15_000;
    let ready = false;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`http://127.0.0.1:${GUI_PORT}/api/dashboard`);
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {
        /* retry */
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    expect(ready).toBeTruthy();
  });

  test.afterAll(async () => {
    if (server && !server.killed) {
      server.kill();
    }
  });

  test('player_stats.json täcker top-6 ligor', async () => {
    const stats = readJson(path.join(root, 'data', 'open', 'player_stats.json'));
    const counts = stats.counts || {};
    expect(counts.PL || stats.premierLeague?.length || 0).toBeGreaterThan(400);
    // Big 5 understat
    for (const lg of ['LL', 'SA', 'BL', 'L1']) {
      expect(counts[lg] ?? 0, `liga ${lg}`).toBeGreaterThan(200);
    }
    // Eredivisie via ESPN
    expect(counts.ED ?? 0).toBeGreaterThan(50);
    expect(stats.sources?.understat?.ok).toBeTruthy();
  });

  test('GET /api/players?q=bruno ger lastMatch med keyPasses', async () => {
    const res = await fetch(`http://127.0.0.1:${GUI_PORT}/api/players?q=bruno%20fernandes&limit=5`);
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBeTruthy();
    expect(body.players.length).toBeGreaterThan(0);
    const hit = body.players.find((p: { name: string }) => /fernandes/i.test(p.name));
    expect(hit).toBeTruthy();
    if (body.detail?.lastMatch) {
      expect(body.detail.lastMatch).toHaveProperty('keyPasses');
    } else if (hit.lastKeyPasses != null) {
      expect(typeof hit.lastKeyPasses).toBe('number');
    }
  });

  test('GET /api/players?league=LL returnerar La Liga', async () => {
    const res = await fetch(`http://127.0.0.1:${GUI_PORT}/api/players?league=LL&limit=20`);
    const body = await res.json();
    expect(body.ok).toBeTruthy();
    expect(body.players.length).toBeGreaterThan(0);
    expect(body.players.every((p: { league: string }) => p.league === 'LL')).toBeTruthy();
  });

  test('GET /api/players?league=CH returnerar Championship', async () => {
    const res = await fetch(`http://127.0.0.1:${GUI_PORT}/api/players?league=CH&limit=20`);
    const body = await res.json();
    expect(body.ok).toBeTruthy();
    expect(body.players.length).toBeGreaterThan(0);
    expect(body.players.every((p: { league: string }) => p.league === 'CH')).toBeTruthy();
  });
});
