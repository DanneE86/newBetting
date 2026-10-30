// Tider, RT, FT och LI på fliken Hästar, omräknade till dagens distans, startmetod och tillägg. Bara visning.
export function recentRecordDate(date, reference) {
  const parse = value => {
    const s = String(value || '').slice(0,10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const d = new Date(`${s}T00:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === s ? d : null;
  };
  const day=parse(date), end=parse(reference);
  if (!day || !end || day>end) return false;
  const start=new Date(end);
  start.setUTCDate(1);
  start.setUTCMonth(start.getUTCMonth()-3);
  const last=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
  start.setUTCDate(Math.min(end.getUTCDate(),last));
  return day>=start;
}
export const distanceClass = (d) => typeof d === "string" && ["short", "medium", "long"].includes(d)
  ? d : Number(d) > 2300 ? "long" : Number(d) >= 1800 ? "medium" : Number(d) > 0 ? "short" : null;
export const distanceLabel = (distance) => ({ short: "K", medium: "M", long: "L" })[distanceClass(distance)] || "";
export function faTime(times) {
  const columns=[['last5',.5],['current',.3],['lifetime',.2]].filter(([k])=>Number.isFinite(times?.[k]?.time));
  return columns.length ? columns.reduce((s,[k,w])=>s+times[k].time*w,0)/columns.reduce((s,[,w])=>s+w,0) : null;
}
const base = { short: 1640, medium: 2140, long: 2640 };
const method = (m) => m === "auto" ? "auto" : ["volte", "volt"].includes(m) ? "volt" : null;
export function convertedTime(source, race, horse) {
  const galloped=!!(source.galloped || source.galopp);
  const placed=Number.isInteger(Number(source.place)) && Number(source.place)>0;
  if(source.scratched || source.disqualified || (galloped && !placed)) return null;
  const from = distanceClass(source.distance ?? source.dist);
  const to = distanceClass(race.distance);
  const fm = method(source.startMethod ?? source.method), tm = method(race.startMethod);
  if (!from || !to || !fm || !tm || !Number.isFinite(source.km) || source.km <= 60) return null;
  const cold = race.coldblood === true || /kallblod|coldblood/i.test(`${race.name || ""} ${race.terms || ""} ${race.breed || ""} ${horse.breed || ""}`);
  const multiplier = cold ? 2 : 1;
  const pastHandicap = source.baseDistance > 0 && Number(source.distance) > source.baseDistance ? source.distance - source.baseDistance : 0;
  const handicap = Math.max(0, (horse.distance || race.distance) - race.distance);
  const adjustment = (base[to] - base[from]) / 500 + (fm === tm ? 0 : fm === "volt" ? -0.5 : 0.5) + (handicap - pastHandicap) / 20 * 0.5;
  const gallopCorrection=galloped ? 0.5 : 0;
  return { time: Math.round((source.km + multiplier * adjustment - gallopCorrection) * 10) / 10, gallopCorrection,
    date: source.date || null, year: source.year || null, long: from === "long",
    original: source.km, distance: source.distance ?? source.dist, method: fm };
}
const best = (xs) => xs.filter(Boolean).sort((a,b) => a.time - b.time || String(b.date || b.year || "").localeCompare(String(a.date || a.year || "")))[0] || null;
export const validStarts = (h, race, cutoff) => (h.timeHistory ?? h.records ?? h.last5 ?? [])
  .filter(r => !r.scratched && !r.disqualified
    && (!cutoff || (r.date && r.date.slice(0,10) < cutoff.slice(0,10))) && convertedTime(r, race, h))
  .sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.raceId || "").localeCompare(String(a.raceId || "")));

/** Display statistics only. A record must be known before the evaluated start. */
export function timeFactors(race, count = 5, cutoff = null) {
  count = Math.max(1, Math.min(100, Math.floor(Number(count)) || 5));
  const live = race.horses.filter(h => !h.scratched);
  const least = new Set(live.filter(h => Number.isInteger(h.lifeStarts) && h.lifeStarts >= 0)
    .slice().sort((a,b) => a.lifeStarts - b.lifeStarts || a.nr - b.nr).slice(0,3).map(h => h.nr));
  return new Map(live.map(h => {
    const valid = validStarts(h, race, cutoff);
    const selected = valid.slice(0,count);
    // Rekord utan datum samma år kan inte visa vad som var känt före en start
    const records = (h.lifeRecords || []).map(r => {
      const match = valid.find(s => Math.abs(s.km - r.km) < 0.001 && distanceClass(s.distance) === distanceClass(r.dist)
        && method(s.startMethod) === method(r.method) && (!r.year || String(s.date).startsWith(String(r.year))));
      return match ? { ...r, ...match } : r;
    });
    const priorDifference = s => {
      if (!s.date) return null;
      const day = s.date.slice(0,10);
      const prior = [...valid.filter(r => r.date && r.date.slice(0,10) < day),
        ...records.filter(r => r.date ? r.date.slice(0,10) < day : r.year && r.year < Number(day.slice(0,4)))];
      const record = best(prior.map(r => convertedTime(r, race, h)));
      if (!record) return null;
      return Math.round(convertedTime(s,race,h).time*10)-Math.round(record.time*10);
    };
    const differences=new Map(selected.map(s=>[s,priorDifference(s)]));
    let near = 0, compared = 0;
    for (const s of selected) {
      const difference=differences.get(s);
      if(difference==null) continue;
      const win=Number(s.place)===1;
      // Långsamma taktiska segrar hoppas över; segrar inom ±0,5 s räknas, gränsen inräknad
      if(win && Math.abs(difference)>5) continue;
      compared++;
      if (Math.abs(difference) < 5 || (win && Math.abs(difference)===5)) near++;
    }
    // FT tar med en seger bara om den är lika med eller bättre än rekordet som var känt före starten
    const dated = selected.filter(s=>s.date && (Number(s.place)!==1 ||
      (differences.get(s)!=null && differences.get(s)<=0)));
    let streak = dated.length >= 2 ? 0 : null, direction = 0;
    // Räkna förbättringar/försämringar i rad bakåt från senaste starten
    for (let i = 0; i < dated.length - 1; i++) {
      if (dated[i].date === dated[i+1].date) break;
      const newer = Math.round(convertedTime(dated[i],race,h).time * 10);
      const older = Math.round(convertedTime(dated[i+1],race,h).time * 10);
      const sign = Math.sign(newer - older);
      if (!sign || (direction && direction !== sign)) break;
      direction = sign;
      streak++;
    }
    return [h.nr, { near, compared, percent: compared ? Math.round(100 * near / compared) : null,
      count: selected.length, requested: count, streak, direction,
      lifeStarts: Number.isInteger(h.lifeStarts) && h.lifeStarts >= 0 ? h.lifeStarts : null,
      leastStarts: least.has(h.nr) }];
  }));
}
export function raceTimes(race, count = 5, cutoff = null) {
  count = Math.max(1, Math.min(100, Math.floor(Number(count)) || 5));
  const rows = race.horses.filter(h => !h.scratched).map(h => {
    const valid = validStarts(h, race, cutoff);
    const selected = valid.slice(0, count);
    const recs = (h.lifeRecords || []).map(r => {
      // Exakt datum bara när en sparad start motsvarar rekordet och dess år
      const match = valid.find(s => Math.abs(s.km - r.km) < 0.001 && distanceClass(s.distance) === distanceClass(r.dist) && method(s.startMethod) === method(r.method) && (!r.year || String(s.date).startsWith(String(r.year))));
      // En sådan start ger också rekordets verkliga distans och tidigare tillägg
      return match ? { ...r, ...match } : { ...r, date: r.date || null };
    }).filter(r => !cutoff || (r.date ? r.date.slice(0,10) < cutoff.slice(0,10) : !r.year || r.year <= Number(cutoff.slice(0,4))));
    const times = [...recs, ...valid].map(r => convertedTime(r, race, h));
    return { nr: h.nr, count: selected.length, requested: count,
      lifetime: best(times),
      last5: best(selected.map(r => convertedTime(r, race, h))),
      current: best([...recs.filter(r => distanceClass(r.dist) === distanceClass(race.distance)), ...valid.filter(r => distanceClass(r.distance) === distanceClass(race.distance))].map(r => convertedTime(r, race, h))) };
  });
  const fastest = Math.min(...rows.flatMap(r => [r.lifetime, r.last5, r.current].filter(Boolean).map(t => t.time)));
  for (const key of ["lifetime", "last5", "current"]) {
    const entries = rows.filter(r => r[key]);
    for (const row of entries) {
      const t = row[key];
      t.rank = 1 + entries.filter(r => r[key].time < t.time).length;
      const others = entries.filter(r => r !== row);
      t.star = entries.length === rows.length && others.length > 0 && others.every(r => r[key].time - t.time >= 0.5 - 1e-8);
      t.longMark = t.long && t.time <= fastest + 0.5 + 1e-8;
      t.red = t.star || t.longMark;
      t.green = !t.red && t.time <= fastest + 0.5 + 1e-8;
    }
  }
  return new Map(rows.map(r => [r.nr, r]));
}
