// Testar varje signal i favoritfall-filen: vinner favoriten mer sällan än oddsen? Träning före 2023/24, kontroll därefter.
//   node scripts/lardomar-favoritfall-test.mjs data/reports/favoritfall.json
import fs from 'fs';
const d=JSON.parse(fs.readFileSync(process.argv[2]));
const tr=d.filter(x=>!x.ctrl), ct=d.filter(x=>x.ctrl);
const q=(k,p)=>{const v=tr.map(x=>x.f[k]).filter(x=>x!=null&&typeof x==='number').sort((a,b)=>a-b);return v[Math.floor(p*(v.length-1))];};
const conds={};
for(const k of ['favHome','favAway','drawHi','early','favLossLast','favDrawLast','favBigWinLast','oppBigLossLast','xmas','lateSeason','oppBottom','favTop','oppRelFightLate','favLateNothing'])conds[k]=x=>x.f[k]===true;
for(const b of ['70+','60-70','50-60','45-50','<45'])conds['p '+b]=x=>x.f.pBand===b;
conds['promo-motståndare']=x=>x.f.promoOpp==='1'||x.f.promoOpp===1;
for(const k of ['drift','ppgGap','favForm5','oppForm5','oppDrawRate10','favDrawRate10','oppLow10','favLow10','oppGA5','favGF5','favRest','oppRest','favVsOdds8','oppVsOdds8','over25','favXgLuck','oppXgLuck','favPos','oppPos']){
  const lo=q(k,0.2),hi=q(k,0.8);
  conds[k+' låg (≤'+(+lo).toFixed(2)+')']=x=>x.f[k]!=null&&x.f[k]<=lo;
  conds[k+' hög (≥'+(+hi).toFixed(2)+')']=x=>x.f[k]!=null&&x.f[k]>=hi;
}
conds['favWinStreak≥4']=x=>x.f.favWinStreak>=4; conds['favWinStreak≥6']=x=>x.f.favWinStreak>=6;
conds['oppUnbeaten≥5']=x=>x.f.oppUnbeaten>=5; conds['oppLossStreak≥3']=x=>x.f.oppLossStreak>=3;
conds['favRest≤3']=x=>x.f.favRest!=null&&x.f.favRest<=3; conds['oppRest-favRest≥3']=x=>x.f.favRest!=null&&x.f.oppRest!=null&&x.f.oppRest-x.f.favRest>=3;
conds['tabell säger jämnt (ppgGap≤0) men odds fav']=x=>x.f.ppgGap!=null&&x.f.ppgGap<=0;
const stat=(set)=>{let n=0,r=0,v=0,w=0,e=0;for(const x of set){n++;r+=x.won-x.p;v+=x.p*(1-x.p);w+=x.won;e+=x.p;}return {n,z:v?r/Math.sqrt(v):0,diff:n?(w-e)/n*100:0,win:n?w/n*100:0,exp:n?e/n*100:0};};
const res=[];
for(const [name,fn] of Object.entries(conds)){const a=stat(tr.filter(fn)),b=stat(ct.filter(fn));res.push({name,a,b});}
res.sort((x,y)=>(x.a.z+x.b.z)-(y.a.z+y.b.z));
const f=s=>`n ${String(s.n).padStart(5)} vann ${s.win.toFixed(1)}% väntat ${s.exp.toFixed(1)}% (${s.diff>=0?'+':''}${s.diff.toFixed(1)} pe, z ${s.z.toFixed(1)})`;
console.log('ALLA träning',f(stat(tr)),'\nALLA kontroll',f(stat(ct)),'\n');
for(const x of res){const flag=(x.a.z<=-2.5&&x.b.z<=-2)?' <== FALLER (bekräftad)':(x.a.z>=2.5&&x.b.z>=2)?' <== HÅLLER (bekräftad)':'';console.log(x.name.padEnd(40),'| träning',f(x.a),'| kontroll',f(x.b),flag);}
