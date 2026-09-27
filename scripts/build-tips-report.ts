/**
 * Bygger en lokal HTML-rapport från tips + store för e2e-screenshots.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

function readJson(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function esc(s: unknown) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildTipsReportHtml(): string {
  const tipsPath = path.join(root, 'data', 'tips-latest.json');
  const storePath = path.join(root, 'data', 'betting-store.json');
  if (!fs.existsSync(tipsPath) || !fs.existsSync(storePath)) {
    throw new Error('Saknar tips-latest.json eller betting-store.json — kör npm run sync först');
  }

  const tips = readJson(tipsPath);
  const store = readJson(storePath);
  const upcoming = Array.isArray(tips.bestUpcoming) ? tips.bestUpcoming.slice(0, 12) : [];
  const keyOuts = (store.teams || [])
    .filter((t: { league: string; availability?: { keyMissing?: string[] } }) =>
      t.league === 'PL' && t.availability?.keyMissing?.length
    )
    .slice(0, 10);

  const rows = upcoming
    .map((t: {
      date: string;
      league: string;
      match: string;
      tipScore: number;
      tips: {
        '1X2': { pick: string; confidence: number };
        BTTS: { pick: string; pYes: number };
        OU25: { pick: string; pOver: number; expGoals: number; usedXg?: boolean };
      };
      availabilityNotes?: string[];
    }) => {
      const notes = (t.availabilityNotes || []).join(' · ');
      return `<tr>
        <td>${esc(t.date)}</td>
        <td>${esc(t.league)}</td>
        <td>${esc(t.match)}</td>
        <td class="score">${esc(t.tipScore)}</td>
        <td><strong>${esc(t.tips['1X2'].pick)}</strong> <span class="muted">${esc(t.tips['1X2'].confidence)}</span></td>
        <td><strong>${esc(t.tips.BTTS.pick)}</strong> <span class="muted">${esc(t.tips.BTTS.pYes)}</span></td>
        <td><strong>${esc(t.tips.OU25.pick)}</strong> <span class="muted">exp ${esc(t.tips.OU25.expGoals)}${t.tips.OU25.usedXg ? ' · xG' : ''}</span></td>
        <td class="notes">${esc(notes)}</td>
      </tr>`;
    })
    .join('\n');

  const outs = keyOuts
    .map(
      (t: { name: string; availability: { keyMissing: string[] } }) =>
        `<li><strong>${esc(t.name)}</strong>: ${esc(t.availability.keyMissing.join(', '))}</li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>Betting tips rapport</title>
  <style>
    :root {
      --bg: #0f1419;
      --panel: #1a222c;
      --text: #e8eef4;
      --muted: #8b9aab;
      --accent: #3dd68c;
      --line: #2a3544;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1e3a2f 0%, var(--bg) 45%), var(--bg);
      color: var(--text);
      padding: 32px;
    }
    h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.02em; }
    .sub { color: var(--muted); margin-bottom: 24px; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 28px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
    .card .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    .card .value { font-size: 22px; margin-top: 6px; color: var(--accent); font-weight: 700; }
    table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; font-size: 14px; vertical-align: top; }
    th { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .score { color: var(--accent); font-weight: 700; }
    .muted { color: var(--muted); font-size: 12px; }
    .notes { color: var(--muted); font-size: 12px; max-width: 220px; }
    h2 { margin: 28px 0 12px; font-size: 18px; }
    ul { margin: 0; padding-left: 18px; color: var(--muted); }
  </style>
</head>
<body>
  <h1>Betting tips — 1X2 · BTTS · Ö/U 2.5</h1>
  <p class="sub" id="meta">Uppdaterad: ${esc(tips.updatedAt)} · matcher i store: ${esc(store.meta?.matchCount)}</p>

  <div class="cards">
    <div class="card"><div class="label">1X2 accuracy</div><div class="value">${esc(((tips.accuracy?.['1X2']?.rate ?? 0) * 100).toFixed(1))}%</div></div>
    <div class="card"><div class="label">BTTS accuracy</div><div class="value">${esc(((tips.accuracy?.BTTS?.rate ?? 0) * 100).toFixed(1))}%</div></div>
    <div class="card"><div class="label">Ö/U 2.5 accuracy</div><div class="value">${esc(((tips.accuracy?.OU25?.rate ?? 0) * 100).toFixed(1))}%</div></div>
    <div class="card"><div class="label">Tips i listan</div><div class="value">${esc(upcoming.length)}</div></div>
  </div>

  <h2>Bästa tips (närmaste omgångar)</h2>
  <table>
    <thead>
      <tr>
        <th>Datum</th><th>Liga</th><th>Match</th><th>Score</th><th>1X2</th><th>BTTS</th><th>Ö/U 2.5</th><th>Availability</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="8">Inga upcoming tips</td></tr>'}
    </tbody>
  </table>

  <h2>PL key outs (FPL)</h2>
  <ul>
    ${outs || '<li>Inga key outs just nu</li>'}
  </ul>
</body>
</html>`;
}

export function writeTipsReport(): string {
  const outDir = path.join(root, 'data', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'tips-report.html');
  fs.writeFileSync(outPath, buildTipsReportHtml(), 'utf8');
  return outPath;
}
