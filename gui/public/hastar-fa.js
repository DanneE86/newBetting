// Fa/Fo-jämförelsen på fliken Hästar (talet inom parentes vid poängen). Bara visning: ändrar aldrig modellen, rankingen eller systemet.
// Fa = 50 % bästa tiden i urvalet, 30 % rekord på dagens distans, 20 % livstidsrekord (hastar-times.js faTime), Fo = formdelpoängen.
import { faTime, raceTimes } from './hastar-times.js';
import { presentationParts } from './hastar-parts.js';
export const FA_WEIGHT_MULTIPLIER = 2;
export const FO_WEIGHT_MULTIPLIER = 1;
function normalizeWeight(value, fallback) {
  if (value == null || String(value).trim() === '') return fallback;
  const number=Number(value);
  return Number.isFinite(number) ? Math.max(0,Math.min(100,number)) : fallback;
}
export const normalizeFaWeight = value => normalizeWeight(value,FA_WEIGHT_MULTIPLIER);
export const normalizeFoWeight = value => normalizeWeight(value,FO_WEIGHT_MULTIPLIER);
const score = p => Math.round(Math.max(0,Math.min(100,100*Math.log(Math.max(p,1e-9)/.005)/Math.log(.6/.005))));
export function faComparison(race, count=5, cutoff=null, multiplier=FA_WEIGHT_MULTIPLIER, formMultiplier=FO_WEIGHT_MULTIPLIER) {
  multiplier=normalizeFaWeight(multiplier);
  formMultiplier=normalizeFoWeight(formMultiplier);
  const live=race.horses.filter(h=>!h.scratched), times=raceTimes(race,count,cutoff);
  const missing=new Map(live.map(h=>[h.nr,null]));
  if (!live.length || live.some(h=>!Number.isFinite(h.faBaseline?.p) || h.faBaseline.p<=0
    || h.faBaseline.version!==3 || !Number.isFinite(h.faBaseline.timeContribution) || !Number.isFinite(h.faBaseline.weight)
    || !Number.isFinite(h.faBaseline.formContribution) || !Number.isFinite(h.faBaseline.formWeight))) return missing;
  const raw=live.map(h=>faTime(times.get(h.nr))), values=raw.filter(Number.isFinite).map(x=>-x);
  if (!values.length) return missing;
  const avg=values.reduce((a,b)=>a+b,0)/values.length;
  const sd=Math.sqrt(values.reduce((s,v)=>s+(v-avg)**2,0)/values.length);
  const z=raw.map(t=>t==null ? null : sd ? Math.max(-2.5,Math.min(2.5,(-t-avg)/sd)) : 0);
  const parts=presentationParts(race,count,cutoff);
  const forms=live.map(h=>parts.get(h.nr)?.scores.form);
  const formZ=forms.map(v=>Number.isFinite(v) ? Math.max(-2.5,Math.min(2.5,(v-50)/20)) : 0);
  const logits=live.map((h,i)=>Math.log(h.faBaseline.p)-h.faBaseline.timeContribution-h.faBaseline.formContribution
    +(z[i]==null ? 0 : multiplier*h.faBaseline.weight*z[i])+formMultiplier*h.faBaseline.formWeight*formZ[i]);
  const max=Math.max(...logits), exp=logits.map(v=>Math.exp(v-max)), sum=exp.reduce((a,b)=>a+b,0);
  return new Map(live.map((h,i)=>[h.nr,z[i]==null ? null : {
    total:score(exp[i]/sum),p:exp[i]/sum,time:raw[i],weight:multiplier*h.faBaseline.weight,multiplier,
    formScore:forms[i] ?? null,formWeight:formMultiplier*h.faBaseline.formWeight,formMultiplier,formFallback:!!parts.get(h.nr)?.fallback.form || h.timeSource!=='travsport',
    oldZ:h.faBaseline.speedZ,newZ:z[i],count:times.get(h.nr).count
  }]));
}
