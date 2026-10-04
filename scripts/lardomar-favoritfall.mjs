// Varför faller favoriten? Bygger favoritmatcher med signaler före matchen ur data/matcher/<liga>.csv (2026-10-03).
//   node scripts/lardomar-favoritfall.mjs PL,CH,EL1 data/reports/favoritfall.json [--open]   (--open = mot öppningsodds)
import fs from 'fs';
import { fileURLToPath } from "url";
const root=fileURLToPath(new URL("../data/matcher/",import.meta.url));
const leagues=(process.argv[2]||'PL,CH,EL1').split(',');
const rows=[];
for(const L of leagues){
  const [head,...lines]=fs.readFileSync(root+L+'.csv','utf8').trim().split(/\r?\n/);
  const H=head.split(',');
  for(const ln of lines){const v=ln.split(',');const o={};H.forEach((h,i)=>o[h]=v[i]);if(o.status!=='spelad'||!o.res)continue;rows.push(o);}
}
const num=x=>x===''||x==null?null:Number(x);
rows.sort((a,b)=>a.date.localeCompare(b.date));
// team state per league+season
const st={}; const key=(r,t)=>r.league+'|'+r.season+'|'+t;
const get=(r,t)=>st[key(r,t)]||(st[key(r,t)]={res:[],gf:[],ga:[],pts:0,gp:0,gd:0,dates:[],homeRes:[],awayRes:[],xgf:[],xga:[],vsOdds:[]});
const seasonTeams={};
const out=[];
for(const r of rows){
  const OPEN=process.argv.includes('--open');
  const ph=OPEN?num(r.open_h):num(r.close_h)??num(r.open_h), pd=OPEN?num(r.open_d):num(r.close_d)??num(r.open_d), pa=OPEN?num(r.open_a):num(r.close_a)??num(r.open_a);
  const oh=num(r.open_h), oa=num(r.open_a), od=num(r.open_d);
  const h=get(r,r.home), a=get(r,r.away);
  const sk=r.league+'|'+r.season; (seasonTeams[sk]=seasonTeams[sk]||new Set()).add(r.home).add(r.away);
  if(ph!=null&&pa!=null&&Math.max(ph,pa)>pd){
    const favHome=ph>=pa; const F=favHome?h:a, O=favHome?a:h; const p=favHome?ph:pa;
    const won=(favHome&&r.res==='H')||(!favHome&&r.res==='A')?1:0, lost=(favHome&&r.res==='A')||(!favHome&&r.res==='H')?1:0;
    // table
    const tbl=[...seasonTeams[sk]].map(t=>{const s=st[r.league+'|'+r.season+'|'+t];return {t,pts:s?.pts||0,gd:s?.gd||0,gp:s?.gp||0};}).sort((x,y)=>y.pts-x.pts||y.gd-x.gd);
    const pos=t=>tbl.findIndex(x=>x.t===t)+1, nT=tbl.length;
    const fT=favHome?r.home:r.away, oT=favHome?r.away:r.home;
    const last=(arr,n)=>arr.slice(-n);
    const ppg=s=>s.gp?s.pts/s.gp:null;
    const form=(s,n)=>{const x=last(s.res,n);return x.length===n?x.reduce((a,b)=>a+b,0):null;};
    const streak=(s,val)=>{let c=0;for(let i=s.res.length-1;i>=0&&s.res[i]===val;i--)c++;return c;};
    const unbeaten=s=>{let c=0;for(let i=s.res.length-1;i>=0&&s.res[i]>0;i--)c++;return c;};
    const drawRate=(s,n)=>{const x=last(s.res,n);return x.length>=n?x.filter(v=>v===1).length/x.length:null;};
    const lowScore=(s,n)=>{const g=last(s.gf,n),c=last(s.ga,n);return g.length>=n?g.map((v,i)=>v+c[i]).filter(t=>t<=2).length/n:null;};
    const restDays=s=>s.dates.length?(Date.parse(r.date)-Date.parse(s.dates.at(-1)))/864e5:null;
    const lastMargin=s=>s.gf.length?s.gf.at(-1)-s.ga.at(-1):null;
    const vsOdds=(s,n)=>{const x=last(s.vsOdds,n);return x.length===n?x.reduce((a,b)=>a+b,0):null;};
    const month=+r.date.slice(5,7);
    out.push({league:r.league,season:r.season,date:r.date,ctrl:r.season>='2023/24',p,pd,won,lost,draw:r.res==='D'?1:0,
      f:{
        favHome,favAway:!favHome,
        pBand:p>=0.7?'70+':p>=0.6?'60-70':p>=0.5?'50-60':p>=0.45?'45-50':'<45',
        drawHi:pd>=0.27,
        drift:oh!=null&&oa!=null?(p-(favHome?oh:oa)):null,
        gp:F.gp,early:F.gp<5,
        favPos:F.gp>=5?pos(fT):null, oppPos:F.gp>=5?pos(oT):null, nT,
        ppgGap:F.gp>=5&&O.gp>=5?ppg(F)-ppg(O):null,
        favForm5:form(F,5), oppForm5:form(O,5),
        favWinStreak:streak(F,3), oppUnbeaten:unbeaten(O), oppLossStreak:streak(O,0), favLossLast:F.res.at(-1)===0, favDrawLast:F.res.at(-1)===1,
        favBigWinLast:lastMargin(F)!=null&&lastMargin(F)>=3, oppBigLossLast:lastMargin(O)!=null&&lastMargin(O)<=-3,
        oppDrawRate10:drawRate(O,10), favDrawRate10:drawRate(F,10), oppLow10:lowScore(O,10), favLow10:lowScore(F,10),
        oppGA5:O.ga.length>=5?last(O.ga,5).reduce((a,b)=>a+b,0)/5:null, favGF5:F.gf.length>=5?last(F.gf,5).reduce((a,b)=>a+b,0)/5:null,
        favRest:restDays(F), oppRest:restDays(O),
        favVsOdds8:vsOdds(F,8), oppVsOdds8:vsOdds(O,8),
        month, xmas:(month===12&&+r.date.slice(8)>=20)||(month===1&&+r.date.slice(8)<=4), lateSeason:month>=4&&month<=5,
        oppBottom:F.gp>=5?pos(oT)>nT-4:null, favTop:F.gp>=5?pos(fT)<=3:null,
        oppRelFightLate:month>=3&&month<=5&&F.gp>=5?pos(oT)>nT-6:null,
        favLateNothing:month>=4&&month<=5&&F.gp>=30?(pos(fT)>=6&&pos(fT)<=nT-6):null,
        over25:num(r.over25_close)??num(r.over25_open),
        promoOpp:r.promo, referee:r.referee||null,
        favXgLuck:F.xgf.length>=6?(last(F.gf,6).reduce((a,b)=>a+b,0)-last(F.xgf,6).reduce((a,b)=>a+b,0))/6:null,
        oppXgLuck:O.xgf.length>=6?(last(O.gf,6).reduce((a,b)=>a+b,0)-last(O.xgf,6).reduce((a,b)=>a+b,0))/6:null,
      }});
  }
  // update after match
  const hg=+r.hg, ag=+r.ag; const hp=hg>ag?3:hg===ag?1:0, ap=ag>hg?3:hg===ag?1:0;
  const hres=hp===3?3:hp===1?1:0, ares=ap===3?3:ap===1?1:0;
  const eH=ph!=null?3*ph+pd:null, eA=pa!=null?3*pa+pd:null;
  for(const [s,gf,ga,res,pts,e,xg,xga] of [[h,hg,ag,hres,hp,eH,num(r.xg_h),num(r.xg_a)],[a,ag,hg,ares,ap,eA,num(r.xg_a),num(r.xg_h)]]){
    s.res.push(res);s.gf.push(gf);s.ga.push(ga);s.pts+=pts;s.gp++;s.gd+=gf-ga;s.dates.push(r.date);if(e!=null)s.vsOdds.push(pts-e);if(xg!=null){s.xgf.push(xg);s.xga.push(xga);}
  }
}
fs.writeFileSync(process.argv[3]||'fav.json',JSON.stringify(out));
console.log('favoritmatcher',out.length,'träning',out.filter(x=>!x.ctrl).length,'kontroll',out.filter(x=>x.ctrl).length);
