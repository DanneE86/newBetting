import { test, expect, type APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Hamtar Allsvenskan-data fran bolldata.se (lag + spelare: xG, xA, passningar, dueller ...).
 * - robots.txt: Crawl-delay 100 -> minst 100 s mellan anropen, och bara om datan ar aldre an 20 h.
 * - Sidorna ar serverrenderade tabeller; varje tabell parsas generellt (kolumnnamn fran data-title).
 * Resultat: data/open/bolldata_allsvenskan.json. Kor: npx playwright test --project=bolldata
 */
const root = path.resolve(__dirname, '..');
const OUT = path.join(root, 'data', 'open', 'bolldata_allsvenskan.json');
const CRAWL_DELAY_MS = 100_000;
const MAX_AGE_MS = 20 * 60 * 60 * 1000;
const PAGES = ['lagdata', 'spelardata'];
const UA = 'Mozilla/5.0 (betting-ny; respekterar robots.txt crawl-delay)';

type Row = { id: string | null; name: string; team: string | null; values: Record<string, number | string> };
type Table = { title: string; columns: { key: string; title: string }[]; rows: Row[] };

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const num = (s: string) => {
  const t = strip(s).replace(/\s/g, '').replace(',', '.').replace('%', '');
  return t !== '' && !Number.isNaN(Number(t)) ? Number(t) : strip(s);
};

/** Alla datatabeller pa sidan: rubrik (narmast foregaende h3/h4) + kolumner + rader. */
export function parseTables(html: string): Table[] {
  const tables: Table[] = [];
  const re = /<table[^>]*>([\s\S]*?)<\/table>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const before = html.slice(Math.max(0, m.index - 4000), m.index);
    const heads = [...before.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)];
    const title = heads.length ? strip(heads[heads.length - 1][1]) : `tabell ${tables.length + 1}`;
    const ths = [...m[1].matchAll(/<th([^>]*)>([\s\S]*?)<\/th>/g)].map((t) => ({
      key: strip(t[2]),
      title: /data-title="([^"]*)"/.exec(t[1])?.[1] ?? strip(t[2]),
      span: Number(/colspan="(\d+)"/.exec(t[1])?.[1] ?? 1),
    }));
    const valueCols = ths.slice(1); // forsta rubriken (SPELARE/LAG) spanner namn + lag
    const rows: Row[] = [];
    for (const tr of m[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const tds = [...tr[1].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
      // Spelarsidan: <td data-type="player" data-playerid data-team>. Lagsidan: <td data-team> (utan data-type).
      const entity = tds.find((td) => /data-type="(player|team)"/.test(td[1])) ?? tds.find((td) => /data-team=/.test(td[1]));
      if (!entity) continue;
      const attrs = entity[1];
      const isPlayer = /data-type="player"/.test(attrs);
      const name = strip(entity[2].replace(/<div class="col-overflow">[\s\S]*?<\/div>/, ''));
      const idx = tds.indexOf(entity);
      // Vardekolumner: allt efter namn/lag-cellerna (de med data-team/data-type)
      const values = tds.slice(idx + 1).filter((td) => !/data-team=|data-type=/.test(td[1]));
      const row: Row = {
        id: /data-(?:playerid|teamid)="([^"]*)"/.exec(attrs)?.[1] ?? null,
        name,
        team: /data-team="([^"]*)"/.exec(attrs)?.[1] ?? (isPlayer ? null : name),
        values: {},
      };
      values.forEach((td, i) => {
        const col = valueCols[i];
        if (col) row.values[col.key] = num(td[2]);
      });
      rows.push(row);
    }
    if (rows.length) tables.push({ title, columns: valueCols.map(({ key, title: t }) => ({ key, title: t })), rows });
  }
  return tables;
}

async function fetchPage(request: APIRequestContext, page: string) {
  const res = await request.get(`https://bolldata.se/${page}`, { headers: { 'User-Agent': UA } });
  expect(res.ok(), `bolldata.se/${page} gav ${res.status()}`).toBeTruthy();
  return res.text();
}

const rawPath = (page: string) => path.join(root, 'data', 'raw', `bolldata_${page}.html`);
const isFresh = (file: string) => fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < MAX_AGE_MS;

test('bolldata.se: Allsvenskan lag- och spelardata', async ({ request }) => {
  test.setTimeout(6 * 60_000);
  {
    // Ra HTML cachas i data/raw: hamtas bara om aldre an 20 h, med 100 s mellan anropen
    const doc: any = { fetchedAt: new Date().toISOString(), source: 'https://bolldata.se', note: 'Crawl-delay 100 s respekterad', pages: {} as Record<string, Table[]> };
    let fetched = 0;
    for (const page of PAGES) {
      if (!isFresh(rawPath(page))) {
        if (fetched++ > 0) await new Promise((r) => setTimeout(r, CRAWL_DELAY_MS));
        fs.mkdirSync(path.dirname(rawPath(page)), { recursive: true });
        fs.writeFileSync(rawPath(page), await fetchPage(request, page), 'utf8');
      }
      doc.pages[page] = parseTables(fs.readFileSync(rawPath(page), 'utf8'));
    }
    doc.fetchedAt = new Date(Math.min(...PAGES.map((p) => fs.statSync(rawPath(p)).mtimeMs))).toISOString();
    // Sammanslaget per spelare (id) och per lag: alla tabellers kolumner i ett objekt
    const merge = (tables: Table[], keyOf: (r: Row) => string | null) => {
      const out: Record<string, any> = {};
      for (const t of tables) for (const r of t.rows) {
        const k = keyOf(r);
        if (!k) continue;
        out[k] ??= { id: r.id, name: r.name, team: r.team, stats: {} };
        for (const [col, v] of Object.entries(r.values)) out[k].stats[`${t.title} | ${col}`] = v;
      }
      return Object.values(out);
    };
    doc.players = merge(doc.pages.spelardata, (r) => r.id);
    doc.teams = merge(doc.pages.lagdata, (r) => r.team ?? r.name);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(doc, null, 2), 'utf8');
  }
  const doc = JSON.parse(fs.readFileSync(OUT, 'utf8'));

  expect(doc.pages.spelardata.length).toBeGreaterThan(5);
  expect(doc.players.length).toBeGreaterThan(20);
  const withXg = doc.players.filter((p: any) => Object.keys(p.stats).some((k) => /\| xG$/.test(k)));
  expect(withXg.length).toBeGreaterThan(5);
  expect(doc.teams.length).toBeGreaterThanOrEqual(16); // 16 lag i Allsvenskan
});
