// Skrällar (folket <= 30 %) mot vår slutprocent och folket, Stryktipset 107 omg (2026-10-04). node scripts/lardomar-skrallar-folk.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
const D=fileURLToPath(new URL('../data/',import.meta.url));
const T=[];const seen=new Set();
for(const f of ['2324','2425','budget']){const d=JSON.parse(fs.readFileSync(D+`stryktips-backtest-${f}-motB.json`,'utf8'));
  for(const dr of d.draws){if(seen.has(dr.drawNumber))continue;seen.add(dr.drawNumber);
    const per=dr.date<'2025-07-01'?'P1':'P2';
    for(const m of dr.matches){if(!['Premier League','Championship','League One'].includes(m.league))continue;if(!m.final||!m.folk||!m.outcome)continue;
      const oi='1X2'.indexOf(m.outcome);
      for(let s=0;s<3;s++)T.push({per,date:dr.date,L:m.league,sign:s,p:m.final[s],mk:m.market?.[s],fo:m.folk[s],y:oi===s?1:0,diff:Math.abs(m.final[0]-m.final[2]),fX:m.folk[1],pX:m.final[1]});
    }}}
console.log('omgångar',seen.size,'tecken',T.length);
const st=a=>{let y=0,e=0,v=0,ef=0;for(const t of a){y+=t.y;e+=t.p;v+=t.p*(1-t.p);ef+=t.fo;}return {n:a.length,y,e:+e.toFixed(1),ef:+ef.toFixed(1),z:+((y-e)/Math.sqrt(v||1)).toFixed(2),r:+(y/ef).toFixed(2)};};
const rep=(name,f)=>{const A=T.filter(f);const a=st(A.filter(t=>t.per==='P1')),b=st(A.filter(t=>t.per==='P2')),c=st(A);
  console.log(name.padEnd(46),`ALLA n ${c.n} utf ${c.y} final ${c.e} folk ${c.ef} utf/folk ${c.r} z ${c.z} | 23/24-24/25 z ${a.z} (${a.y}/${a.e}) | 25/26- z ${b.z} (${b.y}/${b.e})`);};
const dog=t=>t.fo<=0.30&&t.sign!==1, sk=t=>t.fo<=0.30;
rep('Skräll (1/2/X) folk<=30%',sk);
rep('1/2-skräll folk<=30%',dog);
rep('X folk<=30%',t=>sk(t)&&t.sign===1);
for(const L of ['Premier League','Championship','League One'])rep(' 1/2-skräll '+L,t=>dog(t)&&t.L===L);
for(const L of ['Premier League','Championship','League One'])rep(' X '+L,t=>t.sign===1&&t.L===L);
rep('Hemmaskräll folk<=30%',t=>dog(t)&&t.sign===0);
rep('Bortaskräll folk<=30%',t=>dog(t)&&t.sign===2);
rep('Skräll understreckad folk/final<=0.75',t=>dog(t)&&t.fo/t.p<=0.75);
rep('Skräll folk/final 0.75-0.9',t=>dog(t)&&t.fo/t.p>0.75&&t.fo/t.p<=0.9);
rep('Skräll folk/final >0.9',t=>dog(t)&&t.fo/t.p>0.9);
rep('X understreckad folk/final<=0.75',t=>t.sign===1&&t.fo/t.p<=0.75);
rep('X folk<22% & jämna (|p1-p2|<0.15)',t=>t.sign===1&&t.fo<0.22&&t.diff<0.15);
rep('X folk<22% & final X>=27%',t=>t.sign===1&&t.fo<0.22&&t.p>=0.27);
rep('X folk<22%',t=>t.sign===1&&t.fo<0.22);
// final vs market: final högre än marknaden för skrällen (modellen tror mer)
rep('Skräll där final > market +2pe',t=>dog(t)&&t.mk!=null&&t.p-t.mk>=0.02);
rep('Skräll där final < market -2pe',t=>dog(t)&&t.mk!=null&&t.p-t.mk<=-0.02);
rep('Skrällspik-band: icke-fav final 35-47%, final-folk>=3pe',t=>t.p>=0.35&&t.p<=0.47&&t.p-t.fo>=0.03&&t.sign!==1);
rep('Icke-fav final 35-47%, final-folk<3pe',t=>t.p>=0.35&&t.p<=0.47&&t.p-t.fo<0.03&&t.sign!==1&&t.p<Math.max(t.p,0.5));
rep('1/2-skräll folk<=20%',t=>dog(t)&&t.fo<=0.20);
rep('1/2-skräll folk 20-30%',t=>dog(t)&&t.fo>0.20);
