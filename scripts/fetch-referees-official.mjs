// Officiella domare fran ligornas/forbundens egna sajter, for ligor dar FotMob saknar domare i manga matcher
// (andel utan domare 2025-26: J1 65 %, Serie B Brasilien 35 %, Tjeckien 34 %, Brasilien 26 %, LaLiga 2 11 %,
// Conference League 9 %). Sparas i data/open/referee_official.json -> loadRefereeMatches (applyOfficialReferees)
// fyller luckor och rattar FotMob. Bara huvuddomare, datum och lag (kort/resultat kommer fran FotMob).
//   BR, BR2   cbf.com.br        API /api/cbf/jogos/campeonato/{id}/rodada/{n}/fase (arbitros, funcao "Arbitro")
//   CZ        chanceliga.cz     matchsidor (/zapas/...): "Rozhodčí: J. Efternamn"
//   LL2       laliga.com        resultatsidor per omgang (persons_role, roll 5 = Árbitro Principal)
//   CL/EL/ECL match.uefa.com    API v5/matches (referees, roll REFEREE)
//   JP1       data.j-league.or.jp  engelska matchsidor (SFMS02): "Referee Förnamn EFTERNAMN"
// Inkrementellt: redan hamtade matcher hoppas over (sidor/omgangar med bara hamtade matcher hamtas inte om).
//   node scripts/fetch-referees-official.mjs                     alla ligor, 4-5 sasonger
//   node scripts/fetch-referees-official.mjs --current           bara aktuell sasong (daglig korning)
//   node scripts/fetch-referees-official.mjs --leagues BR,CZ     bara dessa
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data', 'open', 'referee_official.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const onlyCurrent = process.argv.includes('--current');
const wanted = arg('--leagues')?.split(',').map((x) => x.trim().toUpperCase());
const want = (lg) => !wanted || wanted.includes(lg);
const today = new Date().toISOString().slice(0, 10);
const year = Number(today.slice(0, 4));
const log = (s) => process.stdout.write(`${s}\n`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// cbf.com.br skickar inte mellancertifikatet (curl/webblasare klarar det, Node inte) -> bara for den
// vardens publika sidor laser vi utan certifikatkontroll (ingen inloggning, inget skickas).
function getNoVerify(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers, rejectUnauthorized: false }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, text: async () => body }));
    }).on('error', reject);
  });
}

async function get(url, { json = false, headers = {} } = {}) {
  for (let i = 0; i < 5; i++) {
    try {
      const h = { 'user-agent': UA, ...headers };
      const res = new URL(url).hostname.endsWith('cbf.com.br') ? await getNoVerify(url, h) : await fetch(url, { headers: h });
      if (res.ok) { const t = await res.text(); if (t) return json ? JSON.parse(t) : t; }
      else if (res.status === 404) return null;
    } catch { /* forsok igen */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}
async function pool(items, n, fn) { for (let i = 0; i < items.length; i += n) await Promise.all(items.slice(i, i + n).map(fn)); }

const doc = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return { matches: {} }; } })();
doc.matches ??= {};
const save = () => {
  doc.updatedAt = new Date().toISOString();
  doc.source = 'cbf.com.br, chanceliga.cz, laliga.com, uefa.com, data.j-league.or.jp (huvuddomare per match)';
  fs.writeFileSync(OUT, `${JSON.stringify(doc)}\n`, 'utf8');
};
const put = (id, row) => { if (row.r && row.d && row.d <= today) doc.matches[id] = { id, ...row }; };
const has = (id) => !!doc.matches[id];

// ---------- Brasilien (CBF) ----------
const dmy = (s) => { const m = String(s || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null; };
async function cbfIds(serie) {
  const html = await get(`https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/${serie}/${year}`);
  const ids = {};
  for (const m of String(html || '').matchAll(/\\"year\\":\\"(20\d\d)\\",\\"id\\":\\"(\d+)\\"/g)) ids[m[1]] = m[2];
  return ids;
}
async function brazil(lg, serie) {
  const ids = await cbfIds(serie);
  const years = Object.keys(ids).map(Number).filter((y) => y > year - (onlyCurrent ? 1 : 5)).sort((a, b) => b - a);
  for (const y of years) {
    let n = 0;
    for (let rd = 1; rd <= 38; rd++) {
      const j = await get(`https://www.cbf.com.br/api/cbf/jogos/campeonato/${ids[y]}/rodada/${rd}/fase`, { json: true });
      for (const g of (j?.jogos || []).flatMap((x) => x.jogo || [])) {
        const id = `cbf${g.id_jogo}`;
        if (has(id) || g.mandante?.gols === '' || g.mandante?.gols == null) continue;
        const r = (g.arbitros || []).find((a) => a.funcao === 'Arbitro')?.nome;
        put(id, { src: 'cbf', d: dmy(g.data), lg, h: g.mandante.nome, a: g.visitante.nome, r: r?.trim() });
        if (doc.matches[id]) n++;
      }
    }
    log(`${lg} ${y}: ${n} nya`);
    save();
  }
}

// ---------- Tjeckien (chanceliga.cz) ----------
async function czech() {
  // Sasong 2027 = 2026/27
  const cur = Number(today.slice(5, 7)) >= 7 ? year + 1 : year;
  for (let s = cur; s > cur - (onlyCurrent ? 1 : 4); s--) {
    const links = new Set();
    // Stadie 1 = grundserien, 2-4 = mastarskapsgrupp, kvalspel, nedflyttningsgrupp
    for (let stage = 1; stage <= 4; stage++) {
      let empty = 0;
      for (let rd = 1; rd <= 40 && empty < 3; rd++) {
        const html = await get(`https://www.chanceliga.cz/rozpis-zapasu/${s}?id_stage=${stage}&month=0&round=${rd}&type=1`);
        const before = links.size;
        for (const m of String(html || '').matchAll(/href="(\/zapas\/\d+-[a-z0-9]+-[a-z0-9]+)"/g)) links.add(m[1]);
        empty = links.size === before ? empty + 1 : 0;
      }
    }
    const todo = [...links].filter((l) => !has(`cz${l.split('/')[2].split('-')[0]}`));
    let n = 0;
    await pool(todo, 3, async (l) => {
      const html = await get(`https://www.chanceliga.cz${l}`);
      if (!html) return;
      const t = html.match(/Detail zápasu (.+?) - (.+?) \| Chance Liga/);
      const d = html.match(/game__header[\s\S]{0,400}?(\d{2})\/(\d{2})\/(\d{4})/);
      const r = html.match(/Rozhodčí: <a href="\/rozhodci\/[^"]*"[^>]*>([^<]+)</);
      if (!t || !d || !r || !/\d+:\d+/.test(html.slice(html.indexOf('game__header'), html.indexOf('game__header') + 1500))) return;
      put(`cz${l.split('/')[2].split('-')[0]}`, { src: 'cz', d: `${d[3]}-${d[2]}-${d[1]}`, lg: 'CZ', h: t[1].trim(), a: t[2].trim(), r: r[1].trim() });
      n++;
    });
    log(`CZ ${s - 1}/${String(s % 100).padStart(2, '0')}: ${links.size} matchlankar, ${n} nya`);
    save();
  }
}

// ---------- LaLiga 2 (laliga.com) ----------
function laligaMatches(html) {
  const s = String(html || '').replace(/\\"/g, '"');
  const out = [];
  // Varje match borjar med {"id":N,"name":"Temporada ...; lagen och domarna ar nastlade objekt fram till nasta match
  const starts = [...s.matchAll(/\{"id":(\d+),"name":"Temporada/g)].map((m) => m.index);
  for (let i = 0; i < starts.length; i++) {
    const part = s.slice(starts[i] + 6, starts[i + 1] ?? starts[i] + 20000);
    const id = part.match(/^(\d+)/)[1];
    const date = part.match(/"date":"(\d{4}-\d{2}-\d{2})/)?.[1];
    const status = part.match(/"status":"([^"]+)"/)?.[1];
    const home = part.match(/"home_team":\{[^}]*?"nickname":"([^"]+)"/)?.[1];
    const away = part.match(/"away_team":\{[^}]*?"nickname":"([^"]+)"/)?.[1];
    const ref = part.match(/"person":\{"name":"([^"]+)"[^}]*\},"role":\{"id":5,/)?.[1];
    if (id && date && home && away) out.push({ id, date, status, home, away, ref });
  }
  return out;
}
async function laliga2() {
  const cur = Number(today.slice(5, 7)) >= 7 ? year : year - 1;
  for (let s = cur; s > cur - (onlyCurrent ? 1 : 4); s--) {
    const season = `${s}-${String((s + 1) % 100).padStart(2, '0')}`;
    let n = 0;
    for (let gw = 1; gw <= 42; gw++) {
      const html = await get(`https://www.laliga.com/en-GB/laliga-hypermotion/results/${season}/gameweek-${gw}`);
      for (const m of laligaMatches(html)) {
        const id = `ll${m.id}`;
        if (has(id) || m.status !== 'FullTime' || !m.ref) continue;
        put(id, { src: 'laliga', d: m.date, lg: 'LL2', h: m.home, a: m.away, r: m.ref });
        n++;
      }
    }
    log(`LL2 ${season}: ${n} nya`);
    save();
  }
}

// ---------- UEFA (CL, EL, ECL) ----------
async function uefa(lg, comp) {
  // seasonYear = slutaret (2026 = 2025/26)
  const cur = Number(today.slice(5, 7)) >= 7 ? year + 1 : year;
  for (let s = cur; s > cur - (onlyCurrent ? 1 : 4); s--) {
    let n = 0;
    for (let off = 0; off < 1000; off += 100) {
      const list = await get(`https://match.uefa.com/v5/matches?competitionId=${comp}&seasonYear=${s}&limit=100&offset=${off}&order=ASC`, { json: true });
      if (!Array.isArray(list) || !list.length) break;
      for (const m of list) {
        const id = `uefa${m.id}`;
        if (has(id) || m.status !== 'FINISHED') continue;
        const ref = (m.referees || []).find((x) => x.role === 'REFEREE')?.person?.translations;
        const name = ref?.name?.EN || [ref?.firstName?.EN, ref?.lastName?.EN].filter(Boolean).join(' ');
        put(id, { src: 'uefa', d: m.kickOffTime?.date, lg, h: m.homeTeam?.internationalName, a: m.awayTeam?.internationalName, r: name });
        if (doc.matches[id]) n++;
      }
      if (list.length < 100) break;
    }
    log(`${lg} ${s - 1}/${String(s % 100).padStart(2, '0')}: ${n} nya`);
    save();
  }
}

// Efternamnet skrivs med versaler, fore eller efter fornamnet ("Hiroyuki KIMURA" / "KIMURA Hiroyuki") -> "Hiroyuki Kimura"
function jName(s) {
  const t = String(s || '').trim().split(/\s+/).filter(Boolean);
  if (!t.length) return null;
  const isSur = (w) => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w);
  const sur = t.filter(isSur), given = t.filter((w) => !isSur(w));
  const cap = (w) => w.charAt(0) + w.slice(1).toLowerCase();
  return [...given, ...sur.map(cap)].join(' ');
}

// ---------- J1 League (data.j-league.or.jp, engelska sidor via cookie) ----------
async function jleague() {
  const res = await fetch('https://data.j-league.or.jp/?lang=en', { headers: { 'user-agent': UA }, redirect: 'manual' }).catch(() => null);
  const cookie = (res?.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const H = { headers: { cookie } };
  const months = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
  // Sasongsval: "2026" (= 2026/27), "20261" (= 2026 SPECIAL, J1 100 Year Vision League feb-jun 2026, egen
  // sasong under omstallningen till host-var), "2025" osv. Specialsasongen saknar tavlingsfilter -> rader med J1.
  const seasons = [];
  for (let y = year; y > year - (onlyCurrent ? 1 : 4); y--) seasons.push(String(y), `${y}1`);
  for (const y of seasons) {
    const special = y.length === 5;
    const list = String(await get(`https://data.j-league.or.jp/SFMS01/search?competition_years=${y}${special ? '' : '&competition_frame_ids=1'}`, H) || '');
    const rows = special ? list.split('<tr>').filter((r) => /J1 /.test(r)).join('') : list;
    const ids = [...new Set([...rows.matchAll(/SFMS02\/\?match_card_id=(\d+)/g)].map((m) => m[1]))].filter((id) => !has(`jl${id}`));
    if (special && !ids.length) continue;
    let n = 0;
    await pool(ids, 3, async (id) => {
      const html = await get(`https://data.j-league.or.jp/SFMS02/?match_card_id=${id}`, H);
      const t = String(html || '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
      // Domarraden efter vaderuppgifterna ("... 48% Referee Namn Assistant Referee"); "Half time Referee Changed" fore
      const r = jName(t.match(/\d% Referee (.+?) Assistant Referee/)?.[1]);
      const d = t.match(/Humidity (\d{1,2}) ([A-Z][a-z]+) (\d{4})/);
      const h = String(html).match(/id="team-name-l"[^>]*>([^<]+)</)?.[1]?.trim();
      const a = String(html).match(/id="team-name-r"[^>]*>([^<]+)</)?.[1]?.trim();
      if (!r || !d || !h || !a || !months[d[2]]) return;
      put(`jl${id}`, { src: 'jleague', d: `${d[3]}-${months[d[2]]}-${d[1].padStart(2, '0')}`, lg: 'JP1', h, a, r });
      n++;
    });
    log(`JP1 ${y}: ${ids.length} matcher att hamta, ${n} nya`);
    save();
  }
}

const t0 = Date.now();
if (want('BR')) await brazil('BR', 'serie-a');
if (want('BR2')) await brazil('BR2', 'serie-b');
if (want('CZ')) await czech();
if (want('LL2')) await laliga2();
for (const [lg, comp] of [['CL', 1], ['EL', 14], ['ECL', 2019]]) if (want(lg)) await uefa(lg, comp);
if (want('JP1')) await jleague();
save();
const per = {};
for (const m of Object.values(doc.matches)) per[m.lg] = (per[m.lg] || 0) + 1;
log(`Domare officiella kallor: ${JSON.stringify(per)} (${Math.round((Date.now() - t0) / 1000)} s)`);
