// Ligatabell med förväntade poäng (xP) ur xG: tabellplats, xP och "förväntad tabellplats" per lag.
// matches: en ligas matcher för en säsong ({ home, away, hg, ag, hxg, axg }).
// xP = väntade poäng om matchen avgjorts av xG (Poisson, samma som lärdomarna).
// Förväntad tabellplats ges bara när varje match i ligan har xG – annars jämförs lag med olika underlag.
import { xPts } from './learnings-signals.mjs';

export function xpTable(matches) {
  const table = new Map();
  let complete = matches.length > 0;
  for (const m of matches) {
    const hasXg = m.hxg != null && m.axg != null;
    if (!hasXg) complete = false;
    for (const [t, gf, ga, xf, xa] of [[m.home, m.hg, m.ag, m.hxg, m.axg], [m.away, m.ag, m.hg, m.axg, m.hxg]]) {
      const e = table.get(t) || { team: t, played: 0, pts: 0, gd: 0, gf: 0, xp: 0, xgGames: 0 };
      e.played++; e.gf += gf; e.gd += gf - ga; e.pts += gf > ga ? 3 : gf === ga ? 1 : 0;
      if (hasXg) { e.xp += xPts(xf, xa); e.xgGames++; }
      table.set(t, e);
    }
  }
  const rows = [...table.values()];
  rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).forEach((e, i) => { e.pos = i + 1; });
  if (complete) rows.slice().sort((a, b) => b.xp - a.xp || b.pts - a.pts).forEach((e, i) => { e.xpPos = i + 1; });
  for (const e of rows) {
    e.xpPos ??= null;
    e.xp = e.xgGames ? Math.round(e.xp * 10) / 10 : null;
  }
  return { rows, byTeam: new Map(rows.map((e) => [e.team, e])), complete };
}

const d1 = (x) => Number(x).toFixed(1).replace('.', ',');

// Analystext: xP mot verkliga poäng och förväntad mot verklig tabellplats. Tom om xG saknas för något av lagen.
// Skillnad på minst 2 poäng nämns i klartext (otur = färre poäng än spelet motiverar, tur = fler).
export function xpNotes(hp, ap, H, A) {
  if (hp?.xp == null || ap?.xp == null) return [];
  const one = (p, n) => `${n} ${d1(p.xp)} mot ${p.points} verkliga${p.xpPosition ? ` (förväntad plats ${p.xpPosition}, verklig ${p.position})` : ''}`;
  const out = [`Förväntade poäng (xP, ur xG): ${one(hp, H)} · ${one(ap, A)}.`];
  for (const [p, n] of [[hp, H], [ap, A]]) {
    const diff = p.points - p.xp;
    if (diff <= -2) out.push(`${n} har fått ${d1(-diff)} poäng mindre än spelet motiverar (otur – kan vända).`);
    else if (diff >= 2) out.push(`${n} har fått ${d1(diff)} poäng mer än spelet motiverar (tur – kan vända).`);
  }
  return out;
}
