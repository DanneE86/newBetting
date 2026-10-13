// Cuphistorik från Transfermarkt: spelschema med resultat per säsong (gesamtspielplan) och truppvärde vid tillfället
// (klubbens truppsida för samma säsong visar dåtidens marknadsvärden; deltagarsidan visar dagens och duger inte).
//   parseTmFixtures(html) -> [{ date, stage, homeId, home, awayId, away, hg, ag, extra: null|'aet'|'pens', season }]
//   parseTmSquadValue(html) -> { value: 563500000, players: 31 } | null
//   CUP_HISTORY_COMPS.LIB -> { comp: 'CLI', slug: 'copa-libertadores', from: 2016 }

// TM:s säsong (saison_id) = året säsongen börjar; kalenderårscuper (LIB, SUD) har saison_id = året före (2023 = 2024 års upplaga)
export const CUP_HISTORY_COMPS = {
  CL: { comp: 'CL', slug: 'uefa-champions-league', from: 2016, region: 'Europa' },
  EL: { comp: 'EL', slug: 'europa-league', from: 2016, region: 'Europa' },
  ECL: { comp: 'UCOL', slug: 'uefa-conference-league', from: 2021, region: 'Europa' },
  LIB: { comp: 'CLI', slug: 'copa-libertadores', from: 2016, region: 'Sydamerika' },
  SUD: { comp: 'CS', slug: 'copa-sudamericana', from: 2016, region: 'Sydamerika' },
};

const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').trim();

/** Matcher i TM:s spelschema. Datum ur länken "datum/ÅÅÅÅ-MM-DD" som står före dagens matcher. */
export function parseTmFixtures(html) {
  const out = [];
  if (!html) return out;
  let stage = null;
  let date = null;
  // Rubriker (Group A, Knockout stage ...), datumlänkar och matchrader i dokumentordning
  const re = /<h2 class="content-box-headline">\s*([^<]+?)\s*<\/h2>|datum\/(\d{4}-\d\d-\d\d)"|<tr>((?:(?!<\/tr>)[\s\S])*?ergebnis-link(?:(?!<\/tr>)[\s\S])*?)<\/tr>/g;
  for (const m of html.matchAll(re)) {
    if (m[1]) { stage = decode(m[1]); continue; }
    if (m[2]) { date = m[2]; continue; }
    const row = m[3];
    const clubs = [...row.matchAll(/<a title="([^"]+)" href="\/[^"]*\/startseite\/verein\/(\d+)(?:\/saison_id\/(\d+))?/g)];
    const score = row.match(/ergebnis-link"[^>]*>(\d+):(\d+)(?:<span class="ergebnis_zusatz">([^<]*)<\/span>)?/);
    if (clubs.length < 2 || !score || !date) continue;
    const [h, a] = [clubs[0], clubs.at(-1)];
    if (h[2] === a[2]) continue;
    const zusatz = (score[3] || '').toLowerCase();
    out.push({
      date, stage, homeId: h[2], home: decode(h[1]), awayId: a[2], away: decode(a[1]),
      hg: Number(score[1]), ag: Number(score[2]),
      extra: /pen/.test(zusatz) ? 'pens' : /aet|n\.v/.test(zusatz) ? 'aet' : null,
      season: h[3] ? Number(h[3]) : null,
    });
  }
  // Samma match kan stå två gånger (mobil- och datorrad): en per id-par och datum
  const seen = new Set();
  return out.filter((x) => { const k = `${x.date}|${x.homeId}|${x.awayId}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

function money(v) {
  const m = String(v ?? '').match(/€([\d.]+)(bn|m|k)/);
  return m ? Math.round(parseFloat(m[1]) * (m[2] === 'bn' ? 1e9 : m[2] === 'm' ? 1e6 : 1e3)) : null;
}

/** Truppvärdet = summan av spelarnas marknadsvärde på truppsidan (säsongens värden). */
export function parseTmSquadValue(html) {
  if (!html) return null;
  const body = html.slice(html.indexOf('<tbody>'));
  const vals = [];
  for (const row of body.split(/<tr class="(?:odd|even)">/).slice(1)) {
    if (!/profil\/spieler\/\d+/.test(row)) continue;
    const v = money(row.match(/<td class="rechts hauptlink">(?:<a[^>]*>)?([^<]+)</)?.[1]);
    if (v) vals.push(v);
  }
  return vals.length ? { value: vals.reduce((s, v) => s + v, 0), players: vals.length } : null;
}
