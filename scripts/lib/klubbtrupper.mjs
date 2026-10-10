// Klubbarnas egna trupputtagningar ("Truppen mot X") och medicinska truppstatus ("Truppstatus: Herrlaget v.41").
// Just nu AIK (aikfotboll.se). Ren tolkning av HTML, hämtningen ligger i scripts/fetch-klubbtrupper.mjs.

const decode = (s) => String(s)
  .replace(/<!-- -->/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
const text = (html) => decode(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Artikeladresser i sitemapen: [{ url, date: 'YYYY-MM-DD', kind: 'trupp' | 'status', slug }] */
export function sitemapArticles(xml, host = 'https://www.aikfotboll.se') {
  const out = new Map();
  for (const m of String(xml).matchAll(/artiklar-och-nyheter\/(\d{2})(\d{2})(\d{2})-(truppen-mot-[a-z0-9-]+|truppstatus[a-z0-9-]*)/g)) {
    const slug = `${m[1]}${m[2]}${m[3]}-${m[4]}`;
    out.set(slug, {
      url: `${host}/artiklar-och-nyheter/${slug}`, date: `20${m[1]}-${m[2]}-${m[3]}`,
      kind: m[4].startsWith('truppen') ? 'trupp' : 'status', slug,
    });
  }
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function mainPart(html) {
  const m = String(html).match(/<main[\s\S]*?<\/main>/);
  return m ? m[0] : String(html);
}
const title = (html) => text(mainPart(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
const preamble = (html) => text(mainPart(html).match(/Preamble_preamble__text[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');

/**
 * "Truppen mot X": uttagna (nummer, namn, målvakt) och ej uttagna med orsak (skadad, ej uttagen, avstängd …).
 * team = 'herr' | 'dam' (damlagets artiklar har samma adressmönster).
 */
export function parseSquadArticle(html) {
  const main = mainPart(html);
  const pre = preamble(html);
  const players = [];
  const seen = new Set();
  for (const m of main.matchAll(/<strong>\s*(\d{1,2})\s*<\/strong>\s*([^<]+?)(?=\s*(?:<br|<\/p|<strong))/gi)) {
    const raw = decode(m[2]).trim();
    if (!raw) continue;
    const gk = /\((mv|gk)\)|m[åa]lvakt/i.test(raw);
    const name = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const k = `${m[1]}|${name}`;
    if (seen.has(k)) continue;
    seen.add(k);
    players.push({ nr: Number(m[1]), name, gk });
  }
  const out = [];
  const ej = main.split(/<h3[^>]*>\s*Ej uttagna\s*:?\s*<\/h3>/i)[1];
  if (ej) {
    const list = ej.match(/<ul[\s\S]*?<\/ul>/)?.[0] ?? '';
    for (const li of list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
      const t = text(li[1]);
      const m = t.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      out.push(m ? { name: m[1].trim(), reason: m[2].trim().toLowerCase() } : { name: t, reason: null });
    }
  }
  const opp = title(html).replace(/^Truppen mot\s+/i, '').trim() || null;
  const team = /dam(allsvensk|laget)|\bdam\b/i.test(pre) ? 'dam' : 'herr';
  const kick = pre.match(/kl\.?\s*(\d{1,2})[:.](\d{2})/);
  return { opponent: opp, team, home: /hemmamatch/i.test(pre) ? true : /bortamatch/i.test(pre) ? false : null,
    kickoff: kick ? `${kick[1].padStart(2, '0')}:${kick[2]}` : null, players, out };
}

/** Status per spelare: rubrik = spelarnamn, stycket = status. back = åter i full träning. */
export function parseStatusArticle(html) {
  const main = mainPart(html);
  const t = title(html);
  const week = Number(t.match(/v\.?\s*(\d{1,2})/i)?.[1]) || null;
  const players = [];
  const parts = main.split(/<h3[^>]*>/).slice(1);
  for (const p of parts) {
    const name = text(p.split('</h3>')[0]);
    const status = text((p.split('</h3>')[1] ?? '').match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
    if (!name || !status) continue;
    players.push({ name, status, back: /åter i (full )?träning|tillbaka i (full )?träning|tränar fullt/i.test(status) });
  }
  return { title: t, team: /damlaget/i.test(t) ? 'dam' : 'herr', week, players };
}

/**
 * Klubbens frånvarolista in i FotMob-truppen (data/trupper/<liga>.json), på plats.
 * Senaste truppstatus (högst 10 dagar gammal): spelare i rehabilitering markeras skadade.
 * Senaste uttagning (högst 3 dagar gammal): ej uttagna som är skadade/avstängda markeras.
 * Spelare som FotMob redan markerat lämnas. sameName = namnjämförelse (lib/transfermarkt.mjs). Returnerar antal tillagda.
 */
export function mergeClubInjuries(team, doc, today, sameName) {
  if (!team?.players?.length || !doc) return 0;
  for (const p of team.players) if (p.injury?.source === 'Klubben') p.injury = null;
  const age = (d) => (Date.parse(today) - Date.parse(d)) / 864e5;
  const status = (doc.status ?? []).filter((s) => s.team === 'herr' && age(s.date) >= 0 && age(s.date) <= 10).at(-1);
  const squad = (doc.squads ?? []).filter((s) => s.team === 'herr' && age(s.date) >= 0 && age(s.date) <= 3).at(-1);
  const marks = [
    ...(status?.players ?? []).filter((x) => !x.back).map((x) => ({ name: x.name, why: x.status, url: status.url })),
    ...(squad?.out ?? []).filter((x) => /skad|avst|sjuk/i.test(x.reason ?? '')).map((x) => ({ name: x.name, why: x.reason, url: squad.url })),
  ];
  let added = 0;
  for (const m of marks) {
    const p = team.players.find((x) => sameName(x.name, m.name));
    if (!p || p.injury) continue;
    p.injury = { typeId: null, expectedReturn: 'Unknown', name: m.why, source: 'Klubben', url: m.url };
    added++;
  }
  return added;
}
