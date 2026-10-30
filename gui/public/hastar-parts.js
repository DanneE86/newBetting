// Delpoäng Fo–St ur Travsport-historiken (docs/travsport-delpoang.md). Bara visning, går aldrig tillbaka till chanserna eller systemet.
import { validStarts, convertedTime, raceTimes, faTime } from './hastar-times.js';
const mean = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
const performance = r => r.place > 0 ? 1 / Math.sqrt(r.place) : 0;
const name = s => String(s || '').trim().toLocaleLowerCase('sv-SE');
const definitions = {
  form:'Fo: placeringsvärde 1/√placering, viktat med 0,9 per äldre lopp i valt urval.',
  fart:'Fa: 50 % bästa tiden i valda loppen, 30 % rekord på aktuell distans, 20 % livstidsrekord. Saknad kolumn utelämnas och återstående vikter normaliseras. Lägre omräknad tid är bättre.',
  klass:'Kl: logaritmen av genomsnittlig intjänad prissumma per lopp i valt urval. Detta mäter intjäning, inte motståndarnas klass.',
  spar:'Sp: genomsnittligt placeringsvärde i urvalets lopp från dagens spår och startmetod.',
  kusk:'Ku: genomsnittligt placeringsvärde för dagens kusk i samtliga startande hästars valda historik. Detta är ett urval, inte kuskens fullständiga statistik.',
  tranare:'Tr: genomsnittligt placeringsvärde för dagens tränare i samtliga startande hästars valda historik. Detta är ett urval, inte tränarens fullständiga statistik.',
  utrustning:'Ut: genomsnittligt placeringsvärde med dagens skokombination och vagntyp i hästens valda historik.',
  tempo:'Te: genomsnittlig omräknad tid i valda loppen, som mått på uthållig fart. Detta är ingen uppgift om tidigare löpningspositioner.',
  marknad:'St: aktuell spelandel eller odds från ATG; historiska resultat innehåller inte dagens marknad.'
};
export function presentationParts(race, count=5, cutoff=null) {
  const live=race.horses.filter(h=>!h.scratched), times=raceTimes(race,count,cutoff);
  const selected=new Map(live.map(h=>[h.nr,validStarts(h,race,cutoff).slice(0,Math.max(1,Math.min(100,Math.floor(Number(count))||5)))]));
  const pool=live.flatMap(h=>selected.get(h.nr));
  const raw=new Map(live.map(h=>{
    const rs=selected.get(h.nr), t=times.get(h.nr);
    const speed=faTime(t);
    const places=rs.filter(r=>Number.isInteger(r.place));
    const weight=places.reduce((s,_,i)=>s+.9**i,0);
    const prizes=rs.filter(r=>Number.isFinite(r.prize) && r.prize>=0);
    const sp=places.filter(r=>r.post===h.post && r.startMethod===race.startMethod);
    const ku=pool.filter(r=>name(h.driver) && name(r.driver)===name(h.driver) && Number.isInteger(r.place));
    const tr=pool.filter(r=>name(h.trainer) && name(r.trainer)===name(h.trainer) && Number.isInteger(r.place));
    const shoe=h.shoes?.front!=null && h.shoes?.back!=null ? `${+h.shoes.front}${+h.shoes.back}` : null;
    const cart=h.sulky?.text ? (/amerik/i.test(h.sulky.text)?'american':'normal') : null;
    const equipment=places.filter(r=>shoe && cart && r.shoeKey===shoe && r.sulkyKey===cart);
    return [h.nr,{
      form:weight ? places.reduce((s,r,i)=>s+performance(r)*.9**i,0)/weight : null,
      fart:speed == null ? null : -speed,
      klass:prizes.length ? Math.log1p(mean(prizes.map(r=>r.prize))) : null,
      spar:mean(sp.map(performance)),kusk:mean(ku.map(performance)),tranare:mean(tr.map(performance)),
      utrustning:mean(equipment.map(performance)),tempo:rs.length ? -mean(rs.map(r=>convertedTime(r,race,h).time)) : null,
      marknad:h.marketPct>0 ? Math.log(h.marketPct) : null
    }];
  }));
  const out=new Map(live.map(h=>[h.nr,{scores:{...h.poang},titles:{},fallback:{}}]));
  for(const key of Object.keys(definitions)) {
    const values=live.filter(h=>h.timeSource==='travsport' || key==='fart').map(h=>raw.get(h.nr)[key]).filter(Number.isFinite), avg=mean(values);
    const sd=values.length>1 ? Math.sqrt(mean(values.map(v=>(v-avg)**2))) : 0;
    for(const h of live){
      const result=out.get(h.nr), value=raw.get(h.nr)[key];
      // ATG-poängen står kvar som reserv per delpoäng när Travsport-underlag saknas
      const use=(h.timeSource==='travsport' || key==='fart') && Number.isFinite(value);
      if(use) result.scores[key]=Math.round(Math.max(0,Math.min(100,50+(sd ? 20*(value-avg)/sd : 0))));
      if(key==='fart' && !use) result.scores[key]=null;
      result.fallback[key]=h.timeSource==='travsport' && !use;
      result.titles[key]=use ? `${definitions[key]} Underlag: ${selected.get(h.nr).length}/${count} giltiga lopp. 50 = snitt bland hästar med underlag.` : `${key==='fart' ? definitions[key]+' ' : ''}ATG-reserv: ${h.timeSource==='travsport' ? 'Travsport-underlag saknas för denna delpoäng.' : 'Travsport används inte för hästen.'}`;
    }
  }
  return out;
}
