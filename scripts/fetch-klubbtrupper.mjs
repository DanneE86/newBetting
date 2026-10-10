// Klubbens egna trupputtagningar och truppstatus -> data/klubbtrupper/<LAG>.json (just nu AIK, aikfotboll.se).
// "Truppen mot X": uttagna spelare (nr, namn, målvakt) och ej uttagna med orsak (skadad, ej uttagen, avstängd).
// "Truppstatus: Herrlaget v.N": medicinska teamets status per spelare (åter i träning / rehabilitering).
// Artiklarna hittas i sitemapen (äldre) och nyhetslistan (senaste, sitemapen släpar). Redan lästa hämtas inte om.
// Kör: npm run klubbtrupper
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getText, sleep } from './lib/http.mjs';
import { parseSquadArticle, parseStatusArticle, sitemapArticles } from './lib/klubbtrupper.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'klubbtrupper');
const CLUBS = [{ team: 'AIK', league: 'AS', host: 'https://www.aikfotboll.se' }];
const H = { headers: { 'Accept-Language': 'sv-SE,sv;q=0.9' }, orNull: true, retries: 2 };

fs.mkdirSync(OUT, { recursive: true });
for (const c of CLUBS) {
  const file = path.join(OUT, `${c.team}.json`);
  const doc = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { team: c.team, league: c.league, source: c.host, squads: [], status: [] };
  const done = new Set([...doc.squads, ...doc.status].map((a) => a.slug));
  const [sm, list] = await Promise.all([getText(`${c.host}/sitemap.xml`, H), getText(`${c.host}/artiklar-och-nyheter`, H)]);
  const arts = new Map([...sitemapArticles(sm ?? '', c.host), ...sitemapArticles(list ?? '', c.host)].map((a) => [a.slug, a]));
  let n = 0;
  for (const a of [...arts.values()].filter((x) => !done.has(x.slug))) {
    const html = await getText(a.url, H);
    await sleep(400);
    if (!html) continue;
    if (a.kind === 'trupp') {
      const s = parseSquadArticle(html);
      if (s.players.length < 11) continue; // inte en uttagning (eller ändrad sida)
      doc.squads.push({ slug: a.slug, url: a.url, date: a.date, ...s });
    } else {
      const s = parseStatusArticle(html);
      if (!s.players.length) continue;
      doc.status.push({ slug: a.slug, url: a.url, date: a.date, ...s });
    }
    n++;
  }
  doc.squads.sort((a, b) => a.date.localeCompare(b.date));
  doc.status.sort((a, b) => a.date.localeCompare(b.date));
  doc.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, `${JSON.stringify(doc, null, 1)}\n`, 'utf8');
  const herr = doc.squads.filter((s) => s.team === 'herr');
  console.log(`${c.team}: ${n} nya artiklar, ${herr.length} uttagningar (herr), ${doc.status.length} truppstatus. Senaste: ${herr.at(-1)?.date ?? '-'} mot ${herr.at(-1)?.opponent ?? '-'}`);
}
