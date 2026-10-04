// Skrällar mot stängningsodds, PL/CH/L1 2017/18– (2026-10-04). node scripts/lardomar-skrallar-hist.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
const root=fileURLToPath(new URL('../data/matcher/',import.meta.url));
const num=x=>x===''||x==null?null:Number(x);
const T=[]; // tecken-rader: {L,season,period,sign,p,po,y,home, ...}
for(const L of ['PL','CH','EL1']){
  const [head,...lines]=fs.readFileSync(root+L+'.csv','utf8').trim().split(/\r?\n/);const H=head.split(',');
  // tabell per säsong för sen säsong
  const rows=lines.map(l=>{const v=l.split(',');const o={};H.forEach((h,i)=>o[h]=v[i]);return o;}).filter(o=>o.status==='spelad'&&o.res).sort((a,b)=>a.date.localeCompare(b.date));
  const st={};const g=(s,t)=>st[s+'|'+t]||(st[s+'|'+t]={pts:0,gp:0,gd:0});
  const teams={};
  for(const r of rows){
    const c=[num(r.close_h),num(r.close_d),num(r.close_a)], o=[num(r.open_h),num(r.open_d),num(r.open_a)];
    (teams[r.season]=teams[r.season]||new Set()).add(r.home).add(r.away);
    if(c.every(x=>x!=null)){
      const tbl=[...teams[r.season]].map(t=>({t,...g(r.season,t)})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd);
      const pos=t=>tbl.findIndex(x=>x.t===t)+1,n=tbl.length;const H_=g(r.season,r.home),A_=g(r.season,r.away);
      const month=+r.date.slice(5,7);
      const res=r.res==='H'?0:r.res==='D'?1:2;
      const period=r.season<'2021/22'?'tr':r.season<'2023/24'?'val':'kon';
      for(let s=0;s<3;s++){
        T.push({L,season:r.season,period,sign:s,p:c[s],po:o[s],y:res===s?1:0,diff:Math.abs(c[0]-c[2]),
          promo:num(r.promo),month,late:month>=4&&month<=5&&H_.gp>=30,
          posSelf:s===0?pos(r.home):s===2?pos(r.away):null,n,gp:H_.gp});
      }
    }
    const hg=+r.hg,ag=+r.ag;const h=g(r.season,r.home),a=g(r.season,r.away);
    h.gp++;a.gp++;h.gd+=hg-ag;a.gd+=ag-hg;h.pts+=hg>ag?3:hg==ag?1:0;a.pts+=ag>hg?3:hg==ag?1:0;
  }
}
const z=(arr,key='p')=>{let n=arr.length,y=0,e=0,v=0;for(const t of arr){y+=t.y;e+=t[key];v+=t[key]*(1-t[key]);}return {n,y,e:+e.toFixed(1),z:+((y-e)/Math.sqrt(v||1)).toFixed(2)};};
const rep=(name,f,key='p')=>{const A=T.filter(f);const tr=A.filter(t=>t.period!=='kon'),va=A.filter(t=>t.period==='val'),ko=A.filter(t=>t.period==='kon');
  const a=z(tr,key),b=z(ko,key),c=z(va,key);
  console.log(name.padEnd(48),`träning(-22/23) n ${a.n} utf ${a.y} vänt ${a.e} z ${a.z} | val n ${c.n} z ${c.z} | kontroll n ${b.n} utf ${b.y} vänt ${b.e} z ${b.z}`);
  return A;};
const dog=t=>t.sign!==1&&t.p<=0.30;
console.log('--- mot stängning ---');
rep('Alla skrällar 1/2 p<=30%',dog);
for(const L of ['PL','CH','EL1'])rep(' skräll '+L,t=>dog(t)&&t.L===L);
rep('Hemmaskräll p<=30%',t=>dog(t)&&t.sign===0);
rep('Bortaskräll p<=30%',t=>dog(t)&&t.sign===2);
rep('Bortaskräll 15-30% EL1',t=>dog(t)&&t.sign===2&&t.L==='EL1'&&t.p>=0.15);
rep('Hemmaskräll EL1',t=>dog(t)&&t.sign===0&&t.L==='EL1');
for(const [lo,hi] of [[0,0.15],[0.15,0.22],[0.22,0.30]])rep(` skräll ${lo}-${hi}`,t=>dog(t)&&t.p>lo&&t.p<=hi);
// oddsrörelse
rep('Skräll, stängning upp >=3pe mot öppning',t=>dog(t)&&t.po!=null&&t.p-t.po>=0.03);
rep('Skräll, stängning upp 1.5-3pe',t=>dog(t)&&t.po!=null&&t.p-t.po>=0.015&&t.p-t.po<0.03);
rep('Skräll, stängning ner >=3pe',t=>dog(t)&&t.po!=null&&t.p-t.po<=-0.03);
rep('Skräll upp >=3pe (mot ÖPPNING)',t=>dog(t)&&t.po!=null&&t.p-t.po>=0.03,'po');
// kryss jämna lag
rep('X, jämna lag |p1-p2|<0.08',t=>t.sign===1&&t.diff<0.08);
rep('X, jämna lag |p1-p2|<0.08, X<=27%',t=>t.sign===1&&t.diff<0.08&&t.p<=0.27);
rep('X, |p1-p2|<0.15',t=>t.sign===1&&t.diff<0.15);
rep('X, EL1 jämna <0.15',t=>t.sign===1&&t.diff<0.15&&t.L==='EL1');
rep('X, stängning upp >=2pe',t=>t.sign===1&&t.po!=null&&t.p-t.po>=0.02);
// sen säsong
rep('Skräll sen säsong (apr-maj, 30+ omg)',t=>dog(t)&&t.late);
rep('Skräll sen säsong, skrällen i botten 6',t=>dog(t)&&t.late&&t.posSelf>t.n-6);
rep('X sen säsong',t=>t.sign===1&&t.late);
// uppflyttade
rep('Skräll = uppflyttat lag',t=>dog(t)&&((t.sign===0&&t.promo===1)||(t.sign===2&&t.promo===-1)));
rep('Skräll = uppflyttat lag, aug-okt',t=>dog(t)&&((t.sign===0&&t.promo===1)||(t.sign===2&&t.promo===-1))&&(t.month>=8&&t.month<=10));
// per säsong för de viktigaste
const per=(name,f)=>{const s={};for(const t of T.filter(f))(s[t.season]=s[t.season]||[]).push(t);console.log(name,Object.entries(s).sort().map(([k,v])=>{const r=z(v);return k.slice(2,4)+':'+(r.y-r.e).toFixed(0)+'('+r.z+')'}).join(' '));};
per('per säsong skräll EL1',t=>dog(t)&&t.L==='EL1');
per('per säsong hemmaskräll',t=>dog(t)&&t.sign===0);
per('per säsong bortaskräll',t=>dog(t)&&t.sign===2);
per('per säsong X jämna <0.08',t=>t.sign===1&&t.diff<0.08);
per('per säsong skräll upp>=3pe',t=>dog(t)&&t.po!=null&&t.p-t.po>=0.03);
