// Starzoomer — game core: world, entities, stages, bosses, render loop.
'use strict';
const cv=$('c'),cx=cv.getContext('2d',{alpha:false});
const GW=360;let GH=640,SC=1,DPR=1,SAFE_T=0,SAFE_B=0,QUAL=2;
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
// ---------- pools (preallocated: no GC churn in combat) ----------
function pool(n,f){const a=[];for(let i=0;i<n;i++){const o=f();o.a=false;a.push(o);}a.h=0;return a;}
function take(p){for(let k=0;k<p.length;k++){const i=(p.h+k)%p.length;if(!p[i].a){p.h=i+1;p[i].a=true;return p[i];}}return null;}
const PB=pool(260,()=>({x:0,y:0,vx:0,vy:0,dmg:1,s:null,pierce:0,hom:0,w:4,h:12,t:0})),
 EB=pool(700,()=>({x:0,y:0,vx:0,vy:0,ax:0,ay:0,r:3,s:null,t:0})),
 EN=pool(90,()=>({})),PT=pool(700,()=>({x:0,y:0,vx:0,vy:0,l:0,m:1,sz:1,g:null,k:0,c:''})),
 PK=pool(80,()=>({x:0,y:0,vx:0,vy:0,k:'C',v:1,t:0})),HZ=pool(12,()=>({x:0,t:0,w:18,dur:.7,warn:1.3,sfx:0})),TX=pool(16,()=>({x:0,y:0,t:0,s:'',c:''}));
function clearAll(){[PB,EB,EN,PT,PK,HZ,TX].forEach(p=>p.forEach(o=>o.a=false));}
// ---------- world state ----------
// ===== AUTO DIFFICULTY (no player selector) =====
// One factor per stage: dFactor(stage) = BASE * (1 + STEP*(stage-1)). Stage 1 = 0.80 of old 'normal' baseline,
// each stage adds 5% of baseline -> stage 10 = 0.80*1.45 = 1.16. Endless keeps adding 5% per sector, capped at D_CAP.
// sf() returns the relative growth (1.00 .. 1.45 .. cap/0.80) and scales enemy hp, speed, fire, bullet speed,
// wave size/spawn spacing, boss + turret hp. DM_BASE holds the fixed easy baseline multipliers.
const D_BASE=.80,D_STEP=.05,D_CAP=1.40;
// v26 staircase: after stage 10 the run continues as numbered stages; internal sector index s: s%11==0 is a Special Stage
// (s=0 after stage 10, 11 after 20, ...), other s are stage stNum(s)=10+s-floor(s/11) (11..20, 21..30 ...). Special uses the preceding stage's number.
function stNum(s){s=s===undefined?G.sector:s;return 10+s-Math.floor(s/11);}
function secOf(N){if(N<=10)return -1;const m=N-11;return 1+m+Math.floor(m/10);}
function dFactor(stage,endless,sector){const n=endless?stNum(sector||0):stage;return Math.min(D_CAP,D_BASE*(1+D_STEP*(Math.max(1,n)-1)));}
const DM_BASE={hp:.55,spd:.62,fire:.30,gap:1.9,lives:4,cap:5};
const G={mode:'menu',stage:1,endless:false,sector:0,t:0,dur:80,boss:null,warnT:0,score:0,combo:0,comboT:0,deaths:0,credits:0,shake:0,flash:0,hs:0,bg:0,ev:[],evI:0,
 contUsed:false,clearT:0,pity:0,scroll:0,lvlSpeed:1,dm:DM_BASE,kills:0,stats:{t:0}};
const P={x:180,y:540,tx:180,ty:540,ship:0,lives:3,shield:0,inv:0,wt:'B',wl:1,bombs:1,spd:0,fcd:0,mcd:0,laser:false,alive:true,bank:0,hitR:3.5,bombT:0,evoT:0,magT:0,x2T:0,downT:0};
const tierOf=()=>clamp(P.wl-1,0,4);const MAXWL=5;
// early-game easing: stages 1-3 softer, stage 1 also warms up over its first 60 s; stage 4+ untouched
// v24: every 10th endless sector (10,20,30..) is a special stage; bIdx() = boss/background index for normal sectors,
// counting only normal sectors so the boss sequence continues after a special stage (no boss lost from the rotation)
function isSpecial(sec){sec=sec===undefined?G.sector:sec;return G.endless&&sec%11===0;}
function bIdx(sec){sec=sec===undefined?G.sector:sec;return ((sec-Math.floor(sec/11)-1)%10+10)%10;}
function early(){return !G.endless&&G.stage<=3;}
function warm(){return !G.endless&&G.stage===1&&!G.boss?.82+.18*Math.min(1,G.t/60):1;}
function mkDM(){const b=DM_BASE;return{name:'auto',lives:b.lives,get cap(){return Math.round(b.cap*sf());},get hp(){return b.hp*(G.special?.75:1);},gap:b.gap,get spd(){return b.spd*warm()*(G.special?.72:1);},get fire(){return b.fire*warm()*(G.special?.45:1);}};}
function sf(){return dFactor(G.stage,G.endless,G.sector)/D_BASE;} // relative stage growth 1.00 (stage 1) .. 1.45 (stage 10) .. 1.75 cap (endless)
// ---------- particles ----------
function part(x,y,vx,vy,life,sz,g,k){if(PT.lim<=0)return null;const p=take(PT);if(!p)return null;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.l=life;p.m=life;p.sz=sz;p.g=g;p.k=k||0;p.c=null;return p;}
const RINGS=[];function ring(x,y,r,c){RINGS.push({x,y,r,c,t:0});if(RINGS.length>8)RINGS.shift();}
// drawRings/boom live in gfx.js
function text(x,y,s,c){const o=take(TX);if(!o)return;o.x=x;o.y=y;o.t=1.1;o.s=s;o.c=c||'#fff';}
// ---------- enemies ----------
const ED={ // hp, r, score, sprite
 zig:[3,11,100],sine:[4,11,120],vwing:[3,11,110],diver:[6,12,160],kami:[4,11,150],saucer:[20,18,400],shield:[34,15,500],split:[12,12,250],mini:[3,7,60],mine:[8,11,200],
 rock0:[16,20,150],rock1:[7,12,80],rock2:[3,7,40]};
function spawnE(type,x,y,o){const e=take(EN);if(!e)return null;const d=ED[type];for(const k in e)if(k!=='a')delete e[k];
 e.type=type;e.x=x;e.y=y;e.vx=0;e.vy=0;e.t=0;e.fl=0;e.hp=Math.ceil(d[0]*sf()*G.dm.hp*(type.startsWith('rock')?.8:1));e.mhp=e.hp;e.r=d[1];e.sc=d[2];e.x0=x;e.fcd=rnd(.8,2.2)/(G.dm.fire);e.rot=0;
 if(type.startsWith('rock')){const si=+type[4];e.si=si;e.var=(Math.random()*3)|0;e.vr=rnd(-1.5,1.5);e.ice=G.bg===2;}
 if(o)Object.assign(e,o);return e;}
function eShoot(e,ang,spd,spr,r){const b=take(EB);if(!b)return null;spd*=G.dm.spd*(1+(sf()-1)*.35);b.x=e.x;b.y=e.y;b.vx=Math.cos(ang)*spd;b.vy=Math.sin(ang)*spd;b.ax=0;b.ay=0;b.r=r||3;b.s=spr||ART.spr.eb;b.t=0;return b;}
function aim(e){return Math.atan2(P.y-e.y,P.x-e.x);}
function updE(e,dt){e.t+=dt;if(e.fl>0)e.fl-=dt;const t=e.t,f=sf();
 switch(e.type){
  case'zig':e.y+=(70+f*12)*dt;e.x+=e.dir*(90+f*10)*dt;if(e.x<20||e.x>GW-20){e.dir*=-1;e.x=clamp(e.x,20,GW-20);}break;
  case'sine':e.y+=(60+f*10)*dt;e.x=e.x0+Math.sin(t*2.4+e.ph)*e.amp;break;
  case'mini':e.y+=95*dt;e.x+=e.vx*dt;if(e.x<12||e.x>GW-12)e.vx*=-1;break;
  case'vwing':if(t<1.6)e.y+=(e.ty-e.y)*dt*2.4;else if(t<5)e.x+=Math.sin(t*1.5)*40*dt;else e.y+=(t-5)*160*dt;break;
  case'diver':if(t<1.1)e.y+=(e.ty-e.y)*dt*3;else{if(!e.dv){e.dv=1;e.vx=(P.x-e.x)*.9;e.vy=60;}e.vy+=420*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;}break;
  case'kami':if(t<.8){e.y+=80*dt;e.ang=aim(e);}else{const s=Math.min(520,(t-.8)*700+60)*(.85+f*.1);e.x+=Math.cos(e.ang)*s*dt;e.y+=Math.sin(e.ang)*s*dt;}break;
  case'saucer':if(t<1.5)e.y+=(e.ty-e.y)*dt*2.5;else if(t<7)e.x=e.x0+Math.sin((t-1.5)*1.3)*60;else e.y+=120*dt;e.x0=clamp(e.x0,70,GW-70);break;
  case'shield':e.y+=26*dt;e.shOn=(t%3.2)<2.2;break;
  case'split':e.y+=45*dt;e.x=e.x0+Math.sin(t*1.6)*40;break;
  case'mine':e.y+=40*dt;e.x+=Math.sin(t*2)*15*dt;if(t>6.5){mineBurst(e,1);e.a=false;return;}break;
  default:e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=e.vr*dt;}
 // firing
 if(e.y>20&&e.y<GH*.7&&!e.type.startsWith('rock')&&e.type!=='kami'&&e.type!=='mine'&&e.type!=='gold'&&e.type!=='gem'){e.fcd-=dt;if(e.fcd<=0){const fr=G.dm.fire*(.6+f*.4);
  switch(e.type){
   case'saucer':{const a=aim(e);const n=G.stage>=5||G.endless?5:3;for(let i=0;i<n;i++)eShoot(e,a+(i-(n-1)/2)*.2,150,ART.spr.eb2);e.fcd=1.3/fr;break;}
   case'shield':{for(let i=-1;i<=1;i++)eShoot(e,Math.PI/2+i*.35,120,ART.spr.eb3,4);e.fcd=1.5/fr;break;}
   case'vwing':if(t>1.5&&t<5){eShoot(e,aim(e),140,ART.spr.ebN,2.8);e.fcd=rnd(1.6,2.8)/fr;}else e.fcd=.3;break;
   default:if(G.stage>=2||G.endless||Math.random()<.4)eShoot(e,aim(e),130);e.fcd=rnd(2,3.6)/fr;}}}
 if(e.y>GH+40||e.y<-140||e.x<-80||e.x>GW+80)e.a=false;}
function mineBurst(e,big){const n=big?12:8;for(let i=0;i<n;i++)eShoot(e,i/n*TAU+e.t,big?110:90,ART.spr.eb);boom(e.x,e.y,10,['p','v','w']);AU.sfx('pop');}
function killE(e){e.a=false;G.kills++;DAILY.track('kill');G.combo++;if(G.combo>(G.maxCombo||0))G.maxCombo=G.combo;G.comboT=1.7;const m=comboMul();const sc=e.sc*m*(P.x2T>0?2:1);G.score+=sc;AU.sfx(e.r>14?'boom':'pop');
 const cm={zig:['g','c','w'],sine:['v','p','w'],vwing:['p','y','w'],diver:['y','o','w'],kami:['r','o','y'],saucer:['c','b','w'],shield:['b','c','y'],split:['o','y','w'],mini:['o','y'],mine:['p','v']}[e.type]||['o','y','w'];
 boom(e.x,e.y,e.r,cm);if(e.r>14){shake(5);G.flash=Math.max(G.flash,.12+Math.min(.12,G.combo*.004));}
 if(e.type==='split')for(let s=-1;s<=1;s+=2)spawnE('mini',e.x+s*8,e.y,{vx:s*80});
 if(e.type==='mine')mineBurst(e,0);
 if(e.type.startsWith('rock')&&e.si<2)for(let s=-1;s<=1;s+=2)spawnE('rock'+(e.si+1),e.x,e.y,{vx:e.vx+s*rnd(30,70),vy:e.vy*.8+rnd(-10,20)});
 // drops
 const nc=(e.r>14?4:e.type.startsWith('rock')?(e.si===0?2:0):1)+(early()&&!e.type.startsWith('rock')?1:0);for(let i=0;i<nc;i++)drop(e.x+rnd(-8,8),e.y+rnd(-8,8),'C');
 const big=e.type==='saucer'||e.type==='shield';G.pity+=big?3:1;
 if(Math.random()<(big?(early()?.75:.55):(early()?.1:.06))||G.pity>(early()?18:34)){G.pity=0;drop(e.x,e.y,pickPU());}
 if(m>1&&e.r>10)text(e.x,e.y-10,'+'+sc,'#ffe14a');}
// v21: cycling capsule 'WA' = S->L->D (36% = 12% each), 'WB' = H->W->P (32.5% = 10.83% each); weapon total 68.5% as v20
function pickPU(){const r=Math.random()*100;return r<36?'WA':r<68.5?'WB':r<76?'B':r<81.5?'V':r<86?'U':r<93.5?'M':'X';}
const CYC={WA:['S','L','D'],WB:['H','W','P']},CAP={cyc:1.6,spMin:.8,spMax:1.6,kMin:2,kMax:3,spDecay:1.2,life:12,hcd:.45,lcd:.6,near:110};
function drop(x,y,k){const p=take(PK);if(!p)return;p.x=x;p.y=y;p.vx=rnd(-30,30);p.vy=k==='C'?rnd(-60,-20):-40;p.cy=CYC[k]||null;p.ci=p.cy?(Math.random()*p.cy.length)|0:0;p.k=p.cy?p.cy[p.ci]:k;p.ct=0;p.hcd=0;p.fl=0;p.hits=0;p.t=0;p.v=1;p.ang=Math.random()*TAU;p.av0=(Math.random()<.5?-1:1)*rnd(CAP.spMin,CAP.spMax);p.av=p.av0;}
// v21 free spin: capsule tumbles around its centre; hit kicks decay back to base speed (visual only, collision stays circular)
function capSpin(p,dt){if(p.av0===undefined)return;p.av+=(p.av0-p.av)*(1-Math.exp(-CAP.spDecay*dt));p.ang=(p.ang+p.av*dt)%TAU;}
function capPhys(p,dt){const old=p.t>CAP.life;p.vy=Math.min(p.vy+(old?220:110)*dt,old?140:65);p.vx*=Math.exp(-.7*dt);if(p.hcd>0)p.hcd-=dt;if(p.fl>0)p.fl-=dt;
 if(p.x<16){p.x=16;p.vx=Math.abs(p.vx);}else if(p.x>GW-16){p.x=GW-16;p.vx=-Math.abs(p.vx);}if(!old&&p.y<SAFE_T+40&&p.vy<0){p.vy=Math.abs(p.vy)*.6;p.y=Math.max(p.y,SAFE_T+16);}
 if(p.cy&&!old){p.ct+=dt;if(p.ct>=CAP.cyc){p.ct=0;capNext(p);}}}
function capNext(p){p.ci=(p.ci+1)%p.cy.length;p.k=p.cy[p.ci];p.fl=.16;}
function capBump(p,bx){if(p.t>CAP.life||p.hcd>0||(P.alive&&Math.hypot(p.x-P.x,p.y-P.y)<CAP.near))return false;p.hcd=CAP.hcd;p.hits++;p.vy=-rnd(130,160);p.vx=(p.x>=bx?1:-1)*rnd(45,85);p.fl=.16;if(p.av0!==undefined)p.av+=(p.x>=bx?1:-1)*rnd(CAP.kMin,CAP.kMax);if(p.cy){p.ct=0;capNext(p);}
 const r=part(p.x,p.y,0,0,.3,22,null,2);if(r)r.c=hexRGB(PU_COL[p.k]);AU.sfx('deflect');return true;}
function comboMul(){return Math.min(8,1+Math.floor(G.combo/8));}
// ---------- hazards ----------
function laserHaz(x){const h=take(HZ);if(!h)return;h.x=x;h.t=0;h.w=20;h.warn=1.35/Math.min(1.3,G.dm.spd);h.dur=.75;h.sfx=0;}
// ---------- stage scripting ----------
const STAGE_NAMES=['n1','n2','n3','n4','n5','n6','n7','n8','n9','n10'];
function wave(kind){const f=sf(),cx2=rnd(60,GW-60);
 switch(kind){
  case'zigline':{const n=4+Math.min(4,f|0);for(let i=0;i<n;i++)later(i*.28,()=>spawnE('zig',cx2,-20,{dir:i%2?1:-1}));break;}
  case'sine':{const n=5+Math.min(3,f|0),x=rnd(90,GW-90);for(let i=0;i<n;i++)later(i*.3,()=>spawnE('sine',x,-20,{amp:rnd(50,80),ph:0}));break;}
  case'vform':{const n=5+(f>1.5?2:0);for(let i=0;i<n;i++){const k=i-(n-1)/2;spawnE('vwing',GW/2+k*38,-30-Math.abs(k)*24,{ty:GH*.18+Math.abs(k)*-14+60});}break;}
  case'divers':{for(let i=0;i<3+(f>1.6?1:0);i++)later(i*.45,()=>spawnE('diver',rnd(40,GW-40),-20,{ty:rnd(70,170)}));break;}
  case'kami':{for(let i=0;i<3+Math.min(3,(f*1.2)|0);i++)later(i*.35,()=>spawnE('kami',rnd(30,GW-30),-20));break;}
  case'saucer':{const n=f>1.5?2:1;for(let i=0;i<n;i++)spawnE('saucer',n===1?cx2:(i?GW*.72:GW*.28),-24,{ty:rnd(110,190)});break;}
  case'shield':{spawnE('shield',cx2,-20);for(let i=0;i<3;i++)later(.5+i*.3,()=>spawnE('zig',cx2,-20,{dir:i%2?1:-1}));break;}
  case'split':{for(let i=0;i<2+(f>1.5?1:0);i++)later(i*.6,()=>spawnE('split',rnd(70,GW-70),-20));break;}
  case'mines':{for(let i=0;i<3;i++)later(i*.5,()=>spawnE('mine',rnd(40,GW-40),-20));break;}
  case'rocks':{const n=Math.round(3+Math.min(5,(f-1)*6));for(let i=0;i<n;i++)later(i*.35,()=>spawnE(Math.random()<.45?'rock0':'rock1',rnd(10,GW-10),-30,{vx:rnd(-35,35),vy:rnd(60,110)*(G.bg===6?1.6:1)}));break;}
  case'laser':{const n=f>1.7?2:1;for(let i=0;i<n;i++)later(i*.9,()=>laserHaz(clamp(P.x+rnd(-60,60),20,GW-20)));break;}
  case'swarm':{for(let i=0;i<10;i++)later(i*.18,()=>spawnE('mini',rnd(20,GW-20),-15,{vx:rnd(-60,60)}));break;}}}
const LATER=[];function later(d,fn){LATER.push([G.t+d,fn]);}
// one new enemy type per stage; rocks rare (1 entry in a pool of 6-16)
function stagePools(s){const p=['zigline','sine','vform','saucer'];if(s>=2)p.push('divers');if(s>=3)p.push('rocks','kami');if(s>=4)p.push('shield');if(s>=5)p.push('split');if(s>=6)p.push('laser');if(s>=7)p.push('mines');if(s>=8)p.push('swarm');
 const extra={4:['zigline','sine'],6:['kami'],8:['saucer'],9:['swarm','divers'],10:['laser','shield','split']}[s]||[];return p.concat(extra);}
function buildStage(){G.ev=[];const s=G.endless?1+bIdx():G.stage;const f=sf();G.dur=G.endless?62:(66+G.stage*4.5);
 const pools=stagePools(G.endless?10:s);let t=2.2;const gap=Math.max(1.5,3.3-f*.5)*G.dm.gap;
 G.ev.push([1.2,'zigline']);while(t<G.dur-3){const k=pools[(Math.random()*pools.length)|0];G.ev.push([t,k]);if(f>1.4&&Math.random()<(f-1.3)*.35)G.ev.push([t+.6,pools[(Math.random()*pools.length)|0]]);t+=gap*rnd(.8,1.25);}
 if(s===1)G.ev=G.ev.filter(e=>e[0]>26||e[1]!=='saucer');G.ev.sort((a,b)=>a[0]-b[0]);G.evI=0;}
// ---------- boss ----------
const BOSS_PAT=[['aimFan','turrets','ring'],['rain','aimFan','minionsD'],['ring','wall','turrets'],['spiral','aimFan','beam'],['flower','minionsK','rain'],['beam','wall','spiral'],['spiral','flower','aimFan'],['wall','turrets','beam','rain'],['minionsK','flower','spiral','ring'],['spiral','beam','flower','wall','aimFan','turrets']];
const BOSS_EXTRA=['spiral','wall','beam','spiral','aimFan','ring','beam','flower','beam','minionsD'];
function startBoss(){const i=G.endless?bIdx():G.stage-1;const D=BOSS_DEF[i];const f=sf();
 const nt=(!G.endless&&G.stage===1?1:2)+Math.min(2,Math.floor((G.endless?10:G.stage)/3));const tur=[];const hw=D[1]/2,hh=D[2]/2;
 for(let k=0;k<nt;k++){const fx=nt===1?0:(k/(nt-1)-.5)*1.5;tur.push({ox:fx*hw*.8,oy:hh*(.15+Math.abs(fx)*-.05)+(k%2?10:-6),hp:Math.round((30+f*18)*G.dm.hp),mhp:0,alive:true,ang:Math.PI/2,cd:rnd(.5,1.5),fl:0});}
 tur.forEach(t=>t.mhp=t.hp);
 const hp=Math.round(380*sf()*G.dm.hp);
 G.boss={i,D,x:GW/2,y:-hh-20,w:D[1],h:D[2],hp,mhp:hp,phase:0,t:0,pt:0,pi:0,pat:BOSS_PAT[i].slice(),cur:null,cur2:null,fl:0,spr:ART.bossSpr[i]||(ART.bossSpr[i]=bossSpr(i)),tur,dead:0,sa:0,beam:null,coreOy:hh*.25};
 if(G.endless&&stNum()>=21)G.boss.pat.push(BOSS_EXTRA[i]);
 AU.play(100+i);}
function bossFireCore(B,a,spd,spr,r){const b=eShoot({x:B.x,y:B.y+B.coreOy},a,spd,spr,r);return b;}
function bossUpd(B,dt){B.t+=dt;if(B.fl>0)B.fl-=dt;const hh=B.h/2;
 if(B.dead){B.dead+=dt;if(Math.random()<(QUAL?.5:.3))boom(B.x+rnd(-B.w/2,B.w/2)*.8,B.y+rnd(-hh,hh)*.8,rnd(10,22),['o','y','p','c']);if(Math.random()<.2)AU.sfx(Math.random()<.5?'boom':'pop');shake(6);
  if(!B.dk)B.dk=0;const st=[.05,.9,1.8,2.5];while(B.dk<st.length&&B.dead>st[B.dk]){const k=B.dk++;ring(B.x+(k%3?rnd(-B.w,B.w)*.3:0),B.y+rnd(-10,10),40+k*30,k===3?'#ffffff':B.D[3]);boom(B.x+rnd(-B.w,B.w)*.3,B.y+rnd(-hh,hh)*.5,26+k*6,['w','y','o']);AU.sfx('bigboom');G.flash=Math.max(G.flash,.35);G.shake=10;}
  if(B.dead>2.9){boom(B.x,B.y,60,['w','y','o','p']);boom(B.x,B.y,40,['c','w']);ring(B.x,B.y,260,'#ffffff');ring(B.x,B.y,170,B.D[3]);ring(B.x,B.y,110,B.D[4]);AU.sfx('bossboom');G.flash=1.2;shake(16);G.hs=.2;FX.glow(B.x,B.y,1.4,B.D[3]);for(let k=0;k<6;k++)later(.08+k*.09,()=>boom(B.x+rnd(-B.w,B.w)*.45,B.y+rnd(-hh,hh)*.6,rnd(22,36),['w','y','o']));vib(300);G.boss=null;DAILY.track('boss');stageClear();}return;}
 const ent=B.t<3;if(ent){B.y+=((GH*.2)-B.y)*dt*1.6;return;}
 B.x=GW/2+Math.sin((B.t-3)*.45)*GW*.16;B.y=GH*.2+Math.sin(B.t*1.3)*8;
 const fr=B.hp/B.mhp;const ph=fr<.34?2:fr<.67?1:0;if(ph>B.phase){B.phase=ph;if(ph===1)B.pat.push(BOSS_EXTRA[B.i]);text(B.x,B.y+hh,'!!','#ff4f6a');AU.sfx('warn');G.shake=8;
  for(let i=0;i<10;i++)bossFireCore(B,i/10*TAU+.15,90,ART.spr.eb3,3.6);B.pt=Math.max(B.pt,1.2);B.cur=null;B.cur2=null;B.beam=null;}
 const spdM=(1+B.phase*.1)*(G.dm.fire>1?1.15:G.dm.fire<1?.8:1);
 // pattern scheduler
 B.pt-=dt;if(B.pt<=0){B.pi++;B.cur={k:B.pat[B.pi%B.pat.length],t:0,c:0,a:Math.random()*TAU};B.pt=4.6;B.cur2=null;
  if(B.phase===2&&(G.stage>=7||G.endless))B.cur2={k:B.pat[(B.pi+1)%B.pat.length],t:0,c:0,a:0};if(B.cur2&&B.cur2.k===B.cur.k)B.cur2=null;
  if(B.cur2&&(B.cur2.k==='beam'||B.cur.k==='beam'))B.cur2=null;}
 [B.cur,B.cur2].forEach(c=>{if(c&&c.t<3.2)runPat(B,c,dt*spdM,c===B.cur2);});
 // turrets
 B.tur.forEach(t=>{if(!t.alive)return;if(t.fl>0)t.fl-=dt;const tx=B.x+t.ox,ty=B.y+t.oy;t.ang=Math.atan2(P.y-ty,P.x-tx);t.cd-=dt*spdM;
  if(t.cd<=0){t.cd=(B.cur&&B.cur.k==='turrets'?.62:2.3)/G.dm.fire;eShoot({x:tx,y:ty},t.ang,125,ART.spr.eb2);}});
 // beam
 if(B.beam){const bm=B.beam;bm.t+=dt;if(bm.t<1.15){bm.x+=(P.x-bm.x)*dt*1.5;}if(bm.t>2.9)B.beam=null;}}
function runPat(B,c,dt,sec){c.t+=dt;const f=sf(),hh=B.h/2;const every=(iv)=>{if(c.t>=c.c*iv){c.c++;return true;}return false;};
 switch(c.k){
  case'aimFan':if(every(.95)){const n=3+B.phase,a=Math.atan2(P.y-B.y-B.coreOy,P.x-B.x);for(let i=0;i<n;i++)bossFireCore(B,a+(i-(n-1)/2)*.22,125+f*6);}break;
  case'ring':if(every(1.2)){const n=10+Math.min(6,(f*3)|0);for(let i=0;i<n;i++)bossFireCore(B,c.a+i/n*TAU+(c.c%2)*Math.PI/n,88+f*6,ART.spr.eb4,2.8);}break;
  case'spiral':if(every(.14)){const arms=2+(B.phase>1&&B.i>=4?1:0);for(let k=0;k<arms;k++)bossFireCore(B,c.a+k*TAU/arms+c.t*1.6*(sec?-1:1),100+f*5,ART.spr.eb,3);}break;
  case'flower':if(every(1.0)){const n=8;for(let i=0;i<n;i++){bossFireCore(B,c.a+i/n*TAU+c.c*.2,78,ART.spr.eb3,3.6);bossFireCore(B,c.a+(i+.5)/n*TAU+c.c*.2,120,ART.spr.eb,3);}}break;
  case'turrets':break;
  case'wall':if(every(1.6)){const gx=clamp(P.x+rnd(-70,70),55,GW-55),gw=Math.max(84,104-f*4);for(let x=8;x<GW;x+=19){if(Math.abs(x-gx)<gw/2)continue;const b=take(EB);if(!b)break;b.x=x;b.y=B.y+hh*.5;b.vx=0;b.vy=(82+f*5)*G.dm.spd;b.ax=0;b.ay=0;b.r=3.2;b.s=ART.spr.eb3;b.t=0;}}break;
  case'rain':if(every(.17)){const b=take(EB);if(b){b.x=B.x+rnd(-B.w/2,B.w/2)*.9;b.y=B.y+hh*.4;b.vx=rnd(-20,20);b.vy=rnd(95,150)*G.dm.spd;b.ax=0;b.ay=0;b.r=3;b.s=ART.spr.eb2;b.t=0;}}break;
  case'minionsD':if(every(1.6)&&c.c<3){spawnE('diver',B.x+(c.c%2?-1:1)*B.w*.35,B.y,{ty:B.y+60});}break;
  case'minionsK':if(every(1.6)&&c.c<3){spawnE('kami',B.x+(c.c%2?-1:1)*B.w*.3,B.y+20);}break;
  case'beam':if(c.c===0){c.c=1;B.beam={x:P.x,t:0};AU.sfx('charge');setTimeout(()=>{if(G.boss===B)AU.sfx('beam');},1600);}
   if(B.i>=6&&c.t>1.7&&c.t<2.8&&every(.5)){const a=Math.atan2(P.y-B.y,P.x-B.x);bossFireCore(B,a+.5,130);bossFireCore(B,a-.5,130);}break;}}
function bossHit(B,x,y,dmg){if(B.t<3||B.dead)return false;const hh=B.h/2;
 for(const t of B.tur){if(!t.alive)continue;const dx=x-(B.x+t.ox),dy=y-(B.y+t.oy);if(dx*dx+dy*dy<13*13){t.hp-=dmg;t.fl=.06;if(t.hp<=0){t.alive=false;boom(B.x+t.ox,B.y+t.oy,22,['o','y','w']);AU.sfx('boom');G.shake=7;damageBoss(B,B.mhp*.06);G.score+=2000;}return true;}}
 const cdx=x-B.x,cdy=y-(B.y+B.coreOy);if(cdx*cdx+cdy*cdy<18*18){damageBoss(B,dmg*1.6);return true;}
 const ex=(x-B.x)/(B.w*.48),ey=(y-B.y)/(hh*.78);if(ex*ex+ey*ey<1){damageBoss(B,dmg*.75);return true;}return false;}
function damageBoss(B,d){G.score+=Math.round(Math.min(d,Math.max(0,B.hp))*5);B.hp-=d;B.fl=.05;if(B.hp<=0&&!B.dead){B.hp=0;B.dead=.01;B.beam=null;B.cur=null;B.cur2=null;EB.forEach(b=>{if(b.a){b.a=false;part(b.x,b.y,0,-20,.3,2,ART.glow.y);}});AU.play(-1);G.score+=20000*(G.endless?2:1)*(1+G.stage*.2|0);
  const n=30+G.stage*4;for(let i=0;i<n;i++)drop(B.x+rnd(-B.w/3,B.w/3),B.y+rnd(-30,30),'C');drop(B.x,B.y,'W');}}
// ---------- player ----------
const SHIPS=[{n:'Blaze Kite',fi:.11,hp:0},{n:'Zephyr Dart',fi:.085,hp:0},{n:'Ember Titan',fi:.16,hp:1}];
function pShot(x,y,a,spd,dmg,s,pierce,w,h){const b=take(PB);if(!b)return;b.x=x;b.y=y;b.vx=Math.sin(a)*spd;b.vy=-Math.cos(a)*spd;b.dmg=dmg;b.s=s;b.pierce=pierce||0;b.hom=0;b.w=w||5;b.h=h||14;b.t=0;}
function fire(dt){const sh=P.ship,L=P.wl,dm=UPF.dmg(),S=ART.spr;P.fcd-=dt;P.mcd-=dt;P.laser=P.wt==='L';
 const fi=SHIPS[sh].fi/UPF.rate();
 if(P.wt==='H'&&P.mcd<=0){P.mcd=.42-L*.04;for(let i=0;i<Math.min(5,L+(sh===1?1:0));i++){const b=take(PB);if(!b)break;const s=i%2?1:-1;b.x=P.x+s*12;b.y=P.y;b.vx=s*120;b.vy=-140;b.dmg=2.6*dm;b.s=S.mis;b.pierce=0;b.hom=1;b.w=5;b.h=10;b.t=0;}AU.sfx('missile');}
 if(P.fcd>0)return;P.fcd=fi*(P.wt==='S'?1.12:1);P.mf=.07;const y=P.y-20;
 if(P.wt==='L'){P.fcd=fi*1.6;pShot(P.x-9,y+8,0,700,.6*dm,S.pb);pShot(P.x+9,y+8,0,700,.6*dm,S.pb);return;}
 if(P.wt==='S'){const n=Math.min(9,1+L*2),sp=.1+L*.03;for(let i=0;i<n;i++)pShot(P.x,y,(i-(n-1)/2)*sp,620,.8*dm,S.pbS);AU.sfx('shot');return;}
 if(P.wt==='H'){pShot(P.x-5,y,0,700,.8*dm,S.pb);pShot(P.x+5,y,0,700,.8*dm,S.pb);AU.sfx('shot');return;}
 // base weapon per ship
 if(sh===0){pShot(P.x-6,y,0,720,dm,S.pb);pShot(P.x+6,y,0,720,dm,S.pb);if(L>=2){pShot(P.x-12,y+8,-.12,700,dm,S.pb);pShot(P.x+12,y+8,.12,700,dm,S.pb);}if(L>=3){pShot(P.x-2,y-4,0,720,dm,S.pb);pShot(P.x+2,y-4,0,720,dm,S.pb);}if(L>=4){pShot(P.x-16,y+10,-.25,680,dm,S.pb);pShot(P.x+16,y+10,.25,680,dm,S.pb);}if(L>=5){pShot(P.x-22,y+12,-.4,660,dm,S.pb);pShot(P.x+22,y+12,.4,660,dm,S.pb);}}
 else if(sh===1){const n=Math.min(9,1+L*2);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*3,y,(i-(n-1)/2)*.075,700,.85*dm,S.pbS);}
 else{const n=Math.min(3,L);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*12,y,0,640,2.8*dm,S.pbT,1,8,20);if(L>=4){pShot(P.x-14,y+8,-.2,620,1.6*dm,S.pbT,0,8,20);pShot(P.x+14,y+8,.2,620,1.6*dm,S.pbT,0,8,20);}if(L>=5){pShot(P.x-22,y+12,-.4,600,1.4*dm,S.pbT,0,8,20);pShot(P.x+22,y+12,.4,600,1.4*dm,S.pbT,0,8,20);}}
 AU.sfx('shot');}
function laserDmg(dt){const L=P.wl,w=7+L*4,dps=(30+L*11)*UPF.dmg()*(P.ship===2?1.25:1),d=dps*dt;let top=-20;
 // beam stops at first boss hull; pierces small enemies
 EN.forEach(e=>{if(!e.a||e.y>P.y)return;if(Math.abs(e.x-P.x)<w/2+e.r){hitE(e,d,true);}});
 const B=G.boss;if(B&&!B.dead&&B.t>=3&&Math.abs(B.x-P.x)<B.w*.45){let hitT=false;for(const t of B.tur){if(t.alive&&Math.abs(B.x+t.ox-P.x)<w/2+10){bossHit(B,B.x+t.ox,B.y+t.oy,d);hitT=true;top=B.y+t.oy;break;}}if(!hitT){const cy=Math.abs(B.x-P.x)<18?B.y+B.coreOy:B.y+B.h*.3;bossHit(B,P.x,cy,d);top=cy;}}
 P.ltop=top;if(Math.random()<.5)part(P.x+rnd(-w/2,w/2),top+4,rnd(-40,40),rnd(20,80),.25,2,ART.glow.c);AU.sfx('laser');}
function hitE(e,d,beam){if(e.type==='shield'&&e.shOn&&!beam){AU.sfx('deflect');e.fl=.04;return false;}if(e.type==='shield'&&e.shOn&&beam)d*=.25;
 e.hp-=d;e.fl=.06;if(e.hp<=0)killE(e);else if(!beam)AU.sfx('hit');return true;}
function hurt(){if(P.inv>0||!P.alive)return;if(window.DBG&&DBG.god){P.inv=.5;return;}
 if(P.shield>0){P.shield--;P.inv=1.3;AU.sfx('shieldhit');vib(40);clearNear(80);return;}
 if(P.wl>1){P.wl--;setTier();P.inv=1.6;P.downT=.6;G.combo=0;G.shake=9;G.flash=.35;boom(P.x,P.y,18,['o','c','w']);AU.sfx('tierdown');vib(90);clearNear(110);text(P.x,P.y-34,T('tierDown'),'#ffb35a');return;}
 P.lives--;G.deaths++;G.combo=0;P.wl=early()?Math.max(1,P.wl-1):1;setTier();P.inv=early()?3.2:2.4;P.spd=Math.max(0,P.spd-1);G.shake=12;G.flash=.6;boom(P.x,P.y,26,['o','c','w']);AU.sfx('hurt');vib(160);clearNear(140);P.bombs=Math.max(P.bombs,2);
 if(P.lives<0){P.alive=false;P.lives=0;setTimeout(()=>gameOver(),1200);}}
function clearNear(r){EB.forEach(b=>{if(b.a&&Math.hypot(b.x-P.x,b.y-P.y)<r){b.a=false;part(b.x,b.y,0,0,.25,2.5,ART.glow.c);}});}
function useBomb(){if(G.mode!=='play'||P.bombs<=0||!P.alive||P.bombT>0)return;P.bombs--;P.bombT=1.2;P.inv=Math.max(P.inv,1.6);AU.sfx('bomb');vib(120);G.shake=14;G.flash=.45;FX.bomb(P.x,P.y);
 EB.forEach(b=>{if(b.a){b.a=false;if(Math.random()<.4)part(b.x,b.y,0,-30,.4,3,ART.glow.y);}});HZ.forEach(h=>h.a=false);
 EN.forEach(e=>{if(e.a&&e.y>-10)hitE(e,40*sf(),true);});if(G.boss&&!G.boss.dead&&G.boss.t>=3)damageBoss(G.boss,G.boss.mhp*.04);}
function setTier(){P.hitR=3.5+tierOf()*.3;}
function evolve(){P.evoT=.9;setTier();AU.sfx('evolve');vib(60);G.flash=Math.max(G.flash,.25);const r=part(P.x,P.y,0,0,.6,70,null,2);if(r)r.c='255,255,255';const r2=part(P.x,P.y,0,0,.45,45,null,2);if(r2)r2.c=hexRGB(TIER_COL[tierOf()]);
 for(let i=0;i<14;i++){const a=i/14*TAU;part(P.x,P.y,Math.cos(a)*140,Math.sin(a)*140,.5,3,ART.glow[i%2?'c':'y'],0);}text(P.x,P.y-64,T('evolve'),TIER_COL[tierOf()]);}
function hexRGB(h){const n=parseInt(h.slice(1),16);return (n>>16)+','+((n>>8)&255)+','+(n&255);}
function pickup(k,x,y){AU.sfx(k==='C'?'coin':'power');
 if(k==='C'){G.credits+=1;DAILY.track('coin');G.score+=10*(P.x2T>0?2:1);if(QUAL>0)FX.pickup('C',x,y);return;}
 DAILY.track('pu');// pickup burst
 FX.pickup(k,x,y);
 const nm={S:'pSpread',L:'pLaser',H:'pHoming',W:'pPower',P:'pShield',B:'pBomb',V:'pSpeed',U:'pLife',M:'pMagnet',X:'pScore2'}[k];const t0=tierOf();
 if('SLHW'.includes(k)){if(k!=='W')P.wt=k;P.wl=Math.min(MAXWL,P.wl+1);text(x,y-16,T(nm)+(P.wl>=MAXWL?' MAX':' Lv'+P.wl),PU_COL[k]);if(tierOf()>t0)evolve();}
 else{if(k==='P')P.shield=Math.min(4,P.shield+1);if(k==='B')P.bombs=Math.min(5,P.bombs+1);if(k==='V')P.spd=Math.min(3,P.spd+1);if(k==='U')P.lives=Math.min(9,P.lives+1);if(k==='M')P.magT=12*UPF.pwr();if(k==='X')P.x2T=12*UPF.pwr();text(x,y-16,T(nm),PU_COL[k]);}
 G.score+=500;}
// ---------- stage flow ----------
// v28: pre-warm heavy procedural art (stage bg tiles, boss hull/damage layers, turret sprite) in small chunks during the
// warp/intro so the first boss frames don't hitch. Each job runs in its own timer tick.
const PW={q:[],t:0};function prewarm(bg,bi){const A=ART.bg,j=PW.q;
 if(bg>=0&&TH[bg]){const th=TH[bg];j.push(()=>{A['f'+bg]||(A['f'+bg]=nebTile6(bg,false));},()=>{A['w'+bg]||(A['w'+bg]=nebTile6(bg,true));},()=>{A['l'+bg]||(A['l'+bg]=landmark6(th.lm));});}
 if(bi>=0&&BOSS_DEF[bi]){j.push(()=>{ART.bossSpr[bi]||(ART.bossSpr[bi]=bossSpr(bi));},()=>{ART.turSpr[bi]||(ART.turSpr[bi]=turretSpr(BOSS_DEF[bi][3]));},
  ()=>{const c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d');g.scale(.02,.02);for(const ph of [0,1,2])bossDraw(g,bi,{t:0,ph,fl:1,dead:.5});});}
 const run=()=>{PW.t=0;const f=PW.q.shift();if(f){try{f();}catch(e){}PW.t=setTimeout(run,70);}};if(!PW.t)PW.t=setTimeout(run,120);}
function startStage(n,endless){G.endless=!!endless;G.stage=endless?10:n;G.sector=endless?(G.sector||0):0;G.special=isSpecial();G.dm=mkDM();
 clearAll();RINGS.length=0;LATER.length=0;G.t=0;G.boss=null;G.warnT=0;G.deaths=0;G.combo=0;G.contUsed=false;G.clearT=0;G.pity=0;G.kills=0;G.maxCombo=0;G.noIntro=false;G.credits=0;G.starBonus=0;G.newStars=0;G.bg=G.special?10:endless?bIdx():n-1;
 const fr=!endless||G.fresh;G.fresh=false;if(fr){G.score=0;P.ship=SAVE.ship;P.lives=G.dm.lives-1+SHIPS[P.ship].hp+(early()?1:0)+UPF.life();P.wt='B';P.wl=1;P.wlv=1;P.pw=0;P.dlv=0;P.bombs=early()&&G.stage<=2?3:2;P.spd=0;}setTier();P.evoT=0;P.magT=0;P.x2T=0;P.downT=0;
 P.shield=UPF.shd()+(P.ship===2?1:0);P.x=P.tx=GW/2;P.y=P.ty=GH-110;P.inv=early()?3:2;P.alive=true;P.bombT=0;
 Ads.stageRewards=0;buildStage();if(early()&&G.stage<=2){later(8,()=>drop(GW*.5,30,'W'));later(30,()=>drop(rnd(90,GW-90),30,'WA'));later(52,()=>drop(rnd(90,GW-90),30,'WB'));}setBG(G.bg);G.mode='play';AU.play(G.special?61:G.endless?1+bIdx():G.stage);UI.hud(true);if(!G.special)prewarm(-1,endless?bIdx():n-1);LOG('stage',G.stage,'endless',G.endless,G.sector);}
// stars: 3 = no life lost, 2 = one life lost, 1 = cleared; each newly earned star pays STAR_BONUS coins once
const STAR_BONUS=20;
function stageClear(){G.mode='clear';G.clearT=0;AU.play(-1);AU.sfx('clear');const s=G.stage;DAILY.track('stage');if(G.deaths===0)DAILY.track('nodmg');
 if(G.endless){G.sector++;SAVE.endBest=Math.max(SAVE.endBest,G.sector);SAVE.far=Math.max(SAVE.far,G.sector);SAVE.cr+=G.credits;if(G.score>SAVE.hi)SAVE.hi=G.score;persist();
  // v23: endless shows a short sector-clear panel (banner + double-coins rewarded), then Next -> interstitial (sector>=3, 90 s gap) -> warp
  {const base=G.score,kb=G.kills*25;G.score=base+kb;if(G.score>SAVE.hi)SAVE.hi=G.score;persist();G.tally={base,kb,cr:G.credits,bk:'comboBonus',bv:0,tot:G.score};UI.tallyDone=false;}
  setTimeout(()=>UI.result(true,{stars:0,nb:false,sb:0}),1800);return;}
 {const base=G.score,kb=G.kills*25,nd=G.deaths===0,bv=nd?3000+s*1000:Math.min(20000,(G.maxCombo||0)*60);G.score=base+kb+bv;G.tally={base,kb,cr:G.credits,bk:nd?'noDmg':'comboBonus',bv,tot:G.score};UI.tallyDone=false;}
 const stars=G.deaths===0?3:G.deaths===1?2:1,os=SAVE.stars[s-1]||0;G.newStars=Math.max(0,stars-os);G.starBonus=G.newStars*STAR_BONUS;SAVE.cr+=G.starBonus;SAVE.stars[s-1]=Math.max(os,stars);const nb=G.score>(SAVE.best[s-1]||0);if(nb)SAVE.best[s-1]=G.score;if(G.score>SAVE.hi)SAVE.hi=G.score;
 SAVE.reached=Math.max(SAVE.reached,Math.min(10,s+1));if(s===10){SAVE.cleared=1;SAVE.far=Math.max(SAVE.far,0);}SAVE.cr+=G.credits;persist();
 setTimeout(()=>UI.result(true,{stars,nb,sb:G.starBonus}),1800);}
function gameOver(){if(G.mode!=='play')return;G.mode='over';AU.play(-1);AU.sfx('over');SAVE.cr+=G.credits;if(G.score>SAVE.hi)SAVE.hi=G.score;if(G.endless)SAVE.endBest=Math.max(SAVE.endBest,G.sector);persist();UI.result(false,{});}
function revive(){G.mode='play';P.alive=true;P.lives=1;P.inv=3;P.shield=Math.max(P.shield,1);P.bombs=Math.max(P.bombs,2);P.x=P.tx=GW/2;P.y=P.ty=GH-110;EB.forEach(b=>b.a=false);G.contUsed=true;SAVE.cr-=G.credits;G.credits=0;AU.play(G.boss?100+G.boss.i:G.special?61:G.endless?1+bIdx():G.stage);UI.hud(true);}
// ---------- update ----------
function update(dt){if(G.mode!=='play'&&G.mode!=='clear'&&G.mode!=='over'&&G.mode!=='menu')return;G.scroll+=dt;if(P.mf>0)P.mf-=dt;
 if(G.mode==='menu'){menuUpd(dt);return;}
 G.t+=dt;G.stats.t+=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);if(G.flash>0)G.flash-=dt*2.2;
 // timeline
 if(G.mode==='play'){while(G.evI<G.ev.length&&G.ev[G.evI][0]<=G.t){if((G.special&&G.ev[G.evI][1].startsWith('sp_'))||EN.reduce((n,e)=>n+(e.a&&e.type!=='mini'?1:0),0)<(G.dm.cap||99))wave(G.ev[G.evI][1]);G.evI++;}
  for(let i=LATER.length-1;i>=0;i--)if(LATER[i][0]<=G.t){const f=LATER[i][1];LATER.splice(i,1);f();}
  if(!G.boss&&!G.special&&G.warnT===0&&G.t>=G.dur+2.5){G.warnT=3;AU.play(-1);AU.sfx('warn');}
  if(G.warnT>0){G.warnT-=dt;if(G.warnT<=0){G.warnT=-1;startBoss();}}}
 // player
 if(P.alive&&G.mode==='play'){const kx=(KEY.r-KEY.l),ky=(KEY.d-KEY.u);const ms=(300+P.spd*70);if(kx||ky){P.tx+=kx*ms*dt;P.ty+=ky*ms*dt;}
  P.tx=clamp(P.tx,14,GW-14);P.ty=clamp(P.ty,60+SAFE_T,GH-24-SAFE_B);const dx=P.tx-P.x,dy=P.ty-P.y,d=Math.hypot(dx,dy),mx=(560+P.spd*130)*dt;
  if(d>mx){P.x+=dx/d*mx;P.y+=dy/d*mx;}else{P.x=P.tx;P.y=P.ty;}P.bank+=((clamp(dx*.08,-1,1))-P.bank)*Math.min(1,dt*10);
  if(P.inv>0)P.inv-=dt;if(P.bombT>0)P.bombT-=dt;if(P.evoT>0)P.evoT-=dt;if(P.downT>0)P.downT-=dt;if(P.magT>0)P.magT-=dt;if(P.x2T>0)P.x2T-=dt;fire(dt);if(P.laser)laserDmg(dt);
  if(QUAL>0&&Math.random()<.8){const tr=tierOf(),gc=flameGlow(tr,0),ey=P.y+18+tr*1.5;part(P.x-5+rnd(-1,1),ey,rnd(-10,10),rnd(120,200),.22,3+tr*.3,gc);part(P.x+5+rnd(-1,1),ey,rnd(-10,10),rnd(120,200),.22,3+tr*.3,flameGlow(tr,1));}}
 // player bullets
 for(const b of PB){if(!b.a)continue;b.t+=dt;
  if(b.hom){let best=null,bd=1e9;EN.forEach(e=>{if(e.a&&e.y>0){const dd=(e.x-b.x)**2+(e.y-b.y)**2;if(dd<bd){bd=dd;best=e;}}});let tx,ty;if(best){tx=best.x;ty=best.y;}else if(G.boss&&G.boss.t>3){tx=G.boss.x;ty=G.boss.y+G.boss.coreOy;}
   if(tx!==undefined){const a=Math.atan2(ty-b.y,tx-b.x),sp=Math.min(520,Math.hypot(b.vx,b.vy)+500*dt);const ca=Math.atan2(b.vy,b.vx);let da=a-ca;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;const hm=6*(b.hom||1)*dt,na=ca+clamp(da,-hm,hm);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}else b.vy-=400*dt;
   if(Math.random()<.5)part(b.x,b.y,0,0,.25,2,ART.glow.g);}
  b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y<-20||b.x<-20||b.x>GW+20||b.y>GH+20||b.t>3){b.a=false;continue;}
  for(const e of EN){if(!e.a)continue;const dx=e.x-b.x,dy=e.y-b.y,r=e.r+3;if(dx*dx+dy*dy<r*r){const hit=hitE(e,b.dmg);if(!hit){b.vy=-b.vy*.5;b.vx=rnd(-150,150);b.dmg=0;b.hom=0;}spark(b.x,b.y,'c');if(b.pierce>0&&hit){b.pierce--;b.dmg*=.7;}else{b.a=false;}break;}}
  if(b.a&&b.dmg>0&&G.boss&&bossHit(G.boss,b.x,b.y,b.dmg)){b.a=false;part(b.x,b.y,rnd(-60,60),rnd(10,60),.2,2.5,ART.glow.y);}}
 // enemies
 for(const e of EN){if(!e.a)continue;updE(e,dt);if(e.a&&P.alive&&G.mode==='play'&&e.type!=='gold'&&e.type!=='gem'){const dx=e.x-P.x,dy=e.y-P.y,r=e.r*.8+P.hitR;if(dx*dx+dy*dy<r*r){hurt();if(!e.type.startsWith('rock')||e.si>0)hitE(e,8,true);}}}
 if(G.boss){bossUpd(G.boss,dt);const B=G.boss;if(B&&!B.dead&&P.alive){const ex=(P.x-B.x)/(B.w*.42),ey=(P.y-B.y)/(B.h*.38);if(ex*ex+ey*ey<1)hurt();
   if(B.beam&&B.beam.t>1.6&&B.beam.t<2.8&&Math.abs(P.x-B.beam.x)<10&&P.y>B.y)hurt();}}
 // enemy bullets
 const hr=P.hitR,ek=SAVE.helper?dt*.85:dt;for(const b of EB){if(!b.a)continue;b.t+=dt;b.vx+=b.ax*dt;b.vy+=b.ay*dt;b.x+=b.vx*ek;b.y+=b.vy*ek;
  if(b.y<-30||b.y>GH+30||b.x<-30||b.x>GW+30){b.a=false;continue;}
  if(P.alive&&G.mode==='play'){const dx=b.x-P.x,dy=b.y-P.y,r=b.r*.7+hr;if(dx*dx+dy*dy<r*r){b.a=false;hurt();}}}
 // hazards
 for(const h of HZ){if(!h.a)continue;h.t+=dt;if(!h.sfx&&h.t>0.02){h.sfx=1;AU.sfx('charge');}if(h.sfx===1&&h.t>h.warn){h.sfx=2;AU.sfx('beam');G.shake=Math.max(G.shake,4);}
  if(h.t>h.warn&&h.t<h.warn+h.dur&&P.alive&&Math.abs(P.x-h.x)<h.w/2+2)hurt();if(h.t>h.warn+h.dur+.2)h.a=false;}
 // pickups
 const mr=(P.magT>0?150:34*UPF.mag())+(P.magT>0?0:6);for(const p of PK){if(!p.a)continue;p.t+=dt;const dx=P.x-p.x,dy=P.y-p.y,d=Math.hypot(dx,dy)||1;
  if(p.k==='C'&&QUAL>0&&Math.random()<.06)part(p.x+rnd(-3,3),p.y+rnd(-3,3),0,20,.35,1.6,ART.glow.y,0);
  if(P.alive&&(d<(p.k==='C'?mr:Math.min(mr,60))||(p.k==='C'&&G.boss&&G.boss.dead)||(G.mode==='clear'))){const s=460,k2=Math.min(1,dt*9);p.vx+=(dx/d*s-p.vx)*k2;p.vy+=(dy/d*s-p.vy)*k2;}else if(p.k==='C'){p.vy=Math.min(p.vy+140*dt,110);p.vx*=.98;}else capPhys(p,dt);if(p.k!=='C')capSpin(p,dt);
  p.x+=p.vx*dt;p.y+=p.vy*dt;if(P.alive&&d<18+tierOf()*1.5){p.a=false;pickup(p.k,p.x,p.y);continue;}if(p.y>GH+20)p.a=false;}
 // particles
 for(const p of PT){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=false;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k===0){p.vx*=.96;p.vy*=.96;}}
 for(const o of TX){if(o.a){o.t-=dt;o.y-=30*dt;if(o.t<=0)o.a=false;}}
 if(G.mode==='clear'){G.clearT+=dt;P.ty-=dt*(G.clearT>1?400:0);P.y+=(P.ty-P.y)*dt*3;}}
// ---------- menu attract ----------
const MENU={t:0};function menuUpd(dt){MENU.t+=dt;P.x=GW/2+Math.sin(MENU.t*.7)*40;P.y=GH*.62+Math.sin(MENU.t*1.3)*10;P.bank=Math.cos(MENU.t*.7)*.5;
 if(QUAL>0){part(P.x-5,P.y+18,rnd(-10,10),rnd(120,200),.25,3,flameGlow(0,0));part(P.x+5,P.y+18,rnd(-10,10),rnd(120,200),.25,3,flameGlow(0,1));}
 for(const p of PT){if(!p.a)continue;p.l-=dt;if(p.l<=0){p.a=false;continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;}}
// background (BGS, setBG, drawBG) lives in gfx.js
function spr(s,x,y,sc,rot){const w=s.w*(sc||1),h=s.h*(sc||1);if(rot){cx.save();cx.translate(x,y);cx.rotate(rot);cx.drawImage(s.c,-w/2,-h/2,w,h);cx.restore();}else cx.drawImage(s.c,x-w/2,y-h/2,w,h);}
// render, drawBoss, drawHUD live in gfx.js
// ---------- input ----------
const KEY={l:0,r:0,u:0,d:0};const PTR={id:null,x:0,y:0};
function toGame(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/SC,(e.clientY-r.top)/SC];}
cv.addEventListener('pointerdown',e=>{AU.init();if(G.mode!=='play')return;PTR.id=e.pointerId;[PTR.x,PTR.y]=toGame(e);try{cv.setPointerCapture(e.pointerId);}catch(_){}});
cv.addEventListener('pointermove',e=>{if(PTR.id!==e.pointerId||G.mode!=='play')return;const[x,y]=toGame(e);P.tx+=(x-PTR.x)*1.2;P.ty+=(y-PTR.y)*1.2;PTR.x=x;PTR.y=y;});
['pointerup','pointercancel'].forEach(k=>cv.addEventListener(k,e=>{if(PTR.id===e.pointerId)PTR.id=null;}));
const KM={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d'};
addEventListener('keydown',e=>{AU.init();const k=KM[e.code];if(k){KEY[k]=1;e.preventDefault();}if(e.code==='Space'||e.code==='KeyX'||e.code==='KeyB'){useBomb();e.preventDefault();}if(e.code==='KeyP')UI.pauseToggle();});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)KEY[k]=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G.mode==='play')UI.pause();if(AU.ac)AU.ac.suspend();}else if(AU.ac&&G.mode!=='paused')AU.ac.resume();});
// ---------- layout ----------
function layout(){const vv=window.visualViewport;const vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;
 const pr=$('probe');const cs=getComputedStyle(pr);const st=parseFloat(cs.paddingTop)||0,sb=parseFloat(cs.paddingBottom)||0;
 GH=Math.round(clamp(GW*vh/vw,560,800));SC=Math.min(vw/GW,vh/GH);const cw=GW*SC,ch=GH*SC;
 const ratio=window.devicePixelRatio||1;DPR=Math.min(ratio,QUAL>=2?2:QUAL===1?1.5:1);cv.width=Math.round(cw*DPR);cv.height=Math.round(ch*DPR);
 cv.style.width=cw+'px';cv.style.height=ch+'px';const L=(vw-cw)/2,Tp=(vh-ch)/2;cv.style.left=L+'px';cv.style.top=Tp+'px';
 const ui=$('ui');ui.style.left=L+'px';ui.style.top=Tp+'px';ui.style.width=cw+'px';ui.style.height=ch+'px';ui.style.setProperty('--s',SC);
 SAFE_T=Math.max(0,st-Tp)/SC;SAFE_B=Math.max(0,sb-(vh-Tp-ch))/SC;ui.style.setProperty('--st',SAFE_T*SC+'px');ui.style.setProperty('--sb',SAFE_B*SC+'px');BGS.grad=null;if(BGS.i>=0&&BGS.stars)setBG(BGS.i,1);}
addEventListener('resize',layout);window.visualViewport&&visualViewport.addEventListener('resize',layout);
// ---------- quality ----------
function setQuality(){const q=SAVE.q;QUAL=q==='low'?0:q==='high'?2:(PERF.auto);PT.lim=QUAL>1?700:QUAL===1?420:220;layout();}
const PERF={auto:2,acc:0,n:0,slow:0,ft:[]};
function perf(ms){PERF.ft.push(ms);if(PERF.ft.length>240)PERF.ft.shift();if(SAVE.q!=='auto'||G.mode!=='play')return;PERF.acc+=ms;PERF.n++;
 if(PERF.n>=90){const avg=PERF.acc/PERF.n;PERF.acc=0;PERF.n=0;if(avg>21&&PERF.auto>0){PERF.slow++;if(PERF.slow>=2){PERF.auto--;PERF.slow=0;setQuality();LOG('quality ->',PERF.auto);}}else PERF.slow=0;}}
// ---------- loop ----------
let last=performance.now();
function frame(now){const raw=now-last;last=now;const dt=Math.min(.05,raw/1000);
 if(G.mode==='warp')WARP.update(dt);
 const opq=G.mode==='menu'&&(UI.cur==='map'||UI.cur==='hangar'||UI.cur==='missions'||UI.cur==='settings')&&UI.el().style.display!=='none';
 if(!(window.DBG&&DBG.fast)&&!opq){if(G.hs>0){G.hs-=dt;if(BGS.i>=0)render(0);}else{update(dt);if(BGS.i>=0)render(dt);}}perf(raw);requestAnimationFrame(frame);}
// ---------- debug hook (?debug=1) ----------
if(DEBUG){const DBG={god:false,fast:false,auto:false,
 sim(sec,step){step=step||1/60;const n=Math.round(sec/step);for(let i=0;i<n;i++){if(this.auto)this.pilot(step);update(step);if(G.mode!=='play'&&G.mode!=='clear')break;}return this.state();},
 pilot(dt){if(!P.alive)return;let tx=GW/2;const B=G.boss;if(B&&!B.dead){tx=B.x+(B.tur.find(t=>t.alive)||{ox:0}).ox;}else{let best=null,bd=1e9;EN.forEach(e=>{if(e.a&&e.y>0&&e.y<P.y){const d=Math.abs(e.x-P.x);if(d<bd){bd=d;best=e;}}});if(best)tx=best.x;}
  P.tx=clamp(tx,14,GW-14);P.ty=GH-110;},
 state(){return{dFactor:+dFactor(G.stage,G.endless,G.sector).toFixed(3),sf:+sf().toFixed(3),mode:G.mode,stage:G.stage,endless:G.endless,sector:G.sector,t:+G.t.toFixed(1),boss:G.boss?{hp:Math.round(G.boss.hp),mhp:G.boss.mhp,ph:G.boss.phase,name:G.boss.D[0]}:null,score:G.score,lives:P.lives,en:EN.filter(e=>e.a).length,eb:EB.filter(e=>e.a).length,pt:PT.filter(e=>e.a).length,cr:SAVE.cr,reached:SAVE.reached};},
 upgFx(){return{dmgMul:UPF.dmg(),rateMul:UPF.rate(),fireInterval:+(SHIPS[P.ship].fi/UPF.rate()).toFixed(4),startShield:UPF.shd(),magR:34*UPF.mag(),puSec:12*UPF.pwr(),extraLives:UPF.life(),lives:P.lives,shield:P.shield,magT:P.magT,x2T:P.x2T};},daily(){return JSON.parse(JSON.stringify(SAVE.dly));},
 start(n,e){UI.hideAll();G.fresh=true;startStage(n,e);},killBoss(){if(G.boss)damageBoss(G.boss,1e9);},toBoss(){G.t=G.dur+2.4;G.evI=G.ev.length;LATER.length=0;EN.forEach(e=>e.a=false);},
 shot(stage,sec){this.start(stage);this.sim(sec);}};
window.DBG=DBG;window.__G=G;window.__P=P;}
