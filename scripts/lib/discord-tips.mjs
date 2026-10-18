// Bästa tipsen som Discord-meddelande. Samma urval som "Bästa tips" på sidan (gui/public/app.js topOfDay, läget Alla):
// 1X2-chans över 60 %, odds över 1.4, högst 3, första speldagen + 3 dagar. Varje odds får Värde/Ej värde, alltid avsparkstid.

export const TOP_N = 3;
export const TOP_MIN_P = 0.6;
export const TOP_MIN_ODDS = 1.4;
const ROUND_DAYS = 3;
const MODEL_ONLY_MIN_EV = 0.08;
const KEY_1X2 = { 1: 'home', X: 'draw', 2: 'away' };
const TZ = 'Europe/Stockholm';

const tipId = (t) => `${t.league}|${t.date}|${t.home}|${t.away}`;
const fmtOdd = (x) => (x == null ? '' : Number(x).toFixed(2));
const modelMin = (p) => Math.round(((1 + MODEL_ONLY_MIN_EV) / p) * 100) / 100;

function odds1x2(tip) {
  const pro = tip.pro?.odds;
  if (pro && (pro.home || pro.over25)) return { 1: pro.home ?? null, X: pro.draw ?? null, 2: pro.away ?? null };
  const od = tip.value?.odds;
  return { 1: od?.home ?? null, X: od?.draw ?? null, 2: od?.away ?? null };
}

/** Tippade 1X2-utfallets chans, odds och omdöme. */
export function pick1x2(tip) {
  const t = tip.tips?.['1X2'];
  const key = KEY_1X2[t?.pick];
  const p = t?.confidence ?? null;
  const odds = t?.pick ? odds1x2(tip)[t.pick] ?? null : null;
  const v = key ? tip.pro?.verdicts?.[key] : null;
  if (v && v.value != null) return { pick: t.pick, p, odds: v.odds ?? odds, verdict: v.value ? 'Värde' : 'Ej värde', from: v.minOdds };
  // Odds utan facit räknas som Ej värde (för lite oddsdata), utan odds: lägsta odds där spelet har värde
  if (odds) return { pick: t.pick, p, odds, verdict: 'Ej värde', from: p > 0 ? modelMin(p) : null };
  return { pick: t?.pick, p, odds: null, verdict: null, from: p > 0 ? modelMin(p) : null };
}

/** Lokal speldag (YYYY-MM-DD) i svensk tid. */
export function kickDay(tip) {
  const d = new Date(tip.kickoffUtc || '');
  if (Number.isNaN(d.getTime())) return tip.date || '';
  return d.toLocaleDateString('sv-SE', { timeZone: TZ });
}

function addDays(day, n) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Bästa tipsen i kommande omgång, högst 1X2-chans först. */
export function topTips(data, now = new Date()) {
  const seen = new Set();
  const all = [...(data.bestUpcoming || []), ...(data.allCandidates || [])].filter((t) => !seen.has(tipId(t)) && seen.add(tipId(t)));
  const today = now.toLocaleDateString('sv-SE', { timeZone: TZ });
  const list = all.filter((t) => {
    if (t.postponed) return false;
    const { p, odds } = pick1x2(t);
    return p > TOP_MIN_P && odds > TOP_MIN_ODDS;
  });
  const days = [...new Set(list.map(kickDay).filter((d) => d && d >= today))].sort();
  const day = days[0];
  if (!day) return [];
  const lastDay = day === today ? day : days.filter((d) => d <= addDays(day, ROUND_DAYS)).at(-1);
  return list
    .filter((t) => kickDay(t) >= day && kickDay(t) <= lastDay)
    .sort((a, b) => (pick1x2(b).p ?? 0) - (pick1x2(a).p ?? 0) || (b.tipScore ?? 0) - (a.tipScore ?? 0))
    .slice(0, TOP_N);
}

export function fmtKick(tip) {
  const d = new Date(tip.kickoffUtc || '');
  if (Number.isNaN(d.getTime())) return `${tip.date || '?'} (tid saknas)`;
  return d.toLocaleString('sv-SE', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Discord-text (max 2000 tecken). */
export function discordMessage(tips, data = {}) {
  if (!tips.length) return '**Bästa tips**\nInga tips klarar 1X2 över 60 % och odds över 1.4 i kommande omgång just nu.';
  const lines = ['**Bästa tips**'];
  tips.forEach((t, i) => {
    const pr = pick1x2(t);
    const match = t.home && t.away ? `${t.home} – ${t.away}` : t.match;
    const from = pr.from ? ` från ${fmtOdd(pr.from)}` : '';
    const verdict = pr.verdict ? `${pr.verdict === 'Värde' ? '✅' : '➖'} ${pr.verdict}${from}` : `Inga odds · spela${from}`;
    lines.push('', `**${i + 1}. ${match}** (${t.league})`, `🕒 ${fmtKick(t)}`,
      `1X2: **${pr.pick}** · chans ${Math.round(pr.p * 100)} %${pr.odds ? ` · @ ${fmtOdd(pr.odds)}` : ''} · ${verdict}`);
  });
  if (data.updatedAt) lines.push('', `_Data uppdaterad ${new Date(data.updatedAt).toLocaleString('sv-SE', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })}_`);
  return lines.join('\n').slice(0, 2000);
}
