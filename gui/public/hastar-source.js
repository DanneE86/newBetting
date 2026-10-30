// Tidskälla för visningen: Travsport-historiken (h.travsportHistory) eller ATG. Når aldrig modellen eller systembyggaren.
export function presentationRace(race, source = 'atg', cutoff = null) {
  return { ...race, horses:race.horses.map(h => {
    const history = source === 'travsport' ? h.travsportHistory : null;
    if (!history) return {...h,timeSource:'atg'};
    const records = history.records.filter(r => !cutoff || r.date < cutoff.slice(0,10));
    return { ...h, timeHistory:records, lifeRecords:[],
      lifeStarts:history.complete ? records.length : h.lifeStarts,
      timeSource:'travsport',historyComplete:history.complete };
  }) };
}
