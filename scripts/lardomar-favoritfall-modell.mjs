// Alla favoritfall-signaler i en logistisk modell med oddsen som grund: vikter på träning, logloss på kontroll.
//   node scripts/lardomar-favoritfall-modell.mjs data/reports/favoritfall.json
import fs from 'fs';
const d=JSON.parse(fs.readFileSync(process.argv[2]));
const keys=['favAway','drawHi','early','favLossLast','favDrawLast','favBigWinLast','oppBigLossLast','xmas','lateSeason','oppBottom','favTop','oppRelFightLate','drift','ppgGap','favForm5','oppForm5','oppDrawRate10','favDrawRate10','oppLow10','favLow10','oppGA5','favGF5','favRest','oppRest','favVsOdds8','oppVsOdds8','over25','favWinStreak','oppUnbeaten','oppLossStreak','favXgLuck','oppXgLuck','pd'];
const tr=d.filter(x=>!x.ctrl), ct=d.filter(x=>x.ctrl);
const val=(x,k)=>{const v=k==='pd'?x.pd:x.f[k];return v===true?1:v===false?0:v;};
const mu={},sd={};for(const k of keys){const v=tr.map(x=>val(x,k)).filter(v=>v!=null&&isFinite(v));const m=v.reduce((a,b)=>a+b,0)/v.length;mu[k]=m;sd[k]=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length)||1;}
const X=x=>keys.map(k=>{const v=val(x,k);return v==null||!isFinite(v)?0:(v-mu[k])/sd[k];});
const lg=p=>Math.log(p/(1-p)), sig=z=>1/(1+Math.exp(-z));
const fit=(set,lambda)=>{const w=new Array(keys.length+1).fill(0);const xs=set.map(X),off=set.map(x=>lg(x.p)),y=set.map(x=>x.won);
 for(let it=0;it<400;it++){const g=new Array(w.length).fill(0);for(let i=0;i<set.length;i++){const z=off[i]+w[0]+xs[i].reduce((a,v,j)=>a+v*w[j+1],0);const e=sig(z)-y[i];g[0]+=e;xs[i].forEach((v,j)=>g[j+1]+=e*v);}
  for(let j=0;j<w.length;j++)w[j]-=0.5*(g[j]/set.length+(j?lambda*w[j]:0));}return w;};
const ll=(set,w)=>{let s=0,s0=0,diffs=[];for(const x of set){const p0=x.p;const p=w?sig(lg(p0)+w[0]+X(x).reduce((a,v,j)=>a+v*w[j+1],0)):p0;const l=-(x.won?Math.log(p):Math.log(1-p)),l0=-(x.won?Math.log(p0):Math.log(1-p0));s+=l;s0+=l0;diffs.push(l-l0);}
 const m=(s-s0)/set.length;const v=diffs.reduce((a,b)=>a+(b-m)**2,0)/set.length;return {model:s/set.length,odds:s0/set.length,diff:m,z:m/Math.sqrt(v/set.length)};};
for(const lambda of [0.001,0.01,0.1]){const w=fit(tr,lambda);const r=ll(ct,w);const rt=ll(tr,w);
 console.log(`lambda ${lambda}: träning ${rt.diff.toFixed(5)} (z ${rt.z.toFixed(1)}) | KONTROLL logloss modell ${r.model.toFixed(5)} odds ${r.odds.toFixed(5)} skillnad ${r.diff.toFixed(5)} (z ${r.z.toFixed(1)})`);
 if(lambda===0.01){console.log('  största vikter:',keys.map((k,j)=>[k,w[j+1]]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,8).map(([k,v])=>k+' '+v.toFixed(3)).join(', '));}}
// Kan modellen sortera favoriterna? kontroll: dela i femtedelar efter modellens justering
const w=fit(tr,0.01);const adj=ct.map(x=>({x,a:X(x).reduce((s,v,j)=>s+v*w[j+1],0)})).sort((a,b)=>a.a-b.a);
for(let q=0;q<5;q++){const part=adj.slice(Math.floor(q*adj.length/5),Math.floor((q+1)*adj.length/5));const won=part.reduce((a,b)=>a+b.x.won,0),exp=part.reduce((a,b)=>a+b.x.p,0),v=part.reduce((a,b)=>a+b.x.p*(1-b.x.p),0);
 console.log(`  kontroll femtedel ${q+1} (${q===0?'mest "kan falla"':q===4?'minst':''}): n ${part.length} vann ${(won/part.length*100).toFixed(1)}% väntat ${(exp/part.length*100).toFixed(1)}% z ${((won-exp)/Math.sqrt(v)).toFixed(1)}`);}
