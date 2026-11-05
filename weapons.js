// v20: cycling weapon capsules, bouncing capsules, per-weapon levels
const WLV={S:3,L:3,H:3,W:4,P:4,D:3};
function pwMul(){return 1+.1*(P.pw||0);}
fire=function(dt){const sh=P.ship,L=P.wl,lv=P.wlv||1,dm=UPF.dmg()*pwMul(),S=ART.spr;P.fcd-=dt;P.mcd-=dt;P.laser=P.wt==='L';
 const fi=SHIPS[sh].fi/UPF.rate();
 if(P.wt==='H'&&P.mcd<=0){P.mcd=.42-lv*.04;const n=Math.min(5,lv+1+(sh===1?1:0));for(let i=0;i<n;i++){const b=take(PB);if(!b)break;const s=i%2?1:-1;b.x=P.x+s*12;b.y=P.y;b.vx=s*120;b.vy=-140;b.dmg=2.6*dm;b.s=S.mis;b.pierce=0;b.hom=1+(lv-1)*.25;b.w=5;b.h=10;b.t=0;}AU.sfx('missile');}
 if(P.fcd>0)return;P.fcd=fi*(P.wt==='S'?1.12:1);P.mf=.07;const y=P.y-20;
 if(P.wt==='L'){P.fcd=fi*1.6;pShot(P.x-9,y+8,0,700,.6*dm,S.pb);pShot(P.x+9,y+8,0,700,.6*dm,S.pb);return;}
 if(P.wt==='S'){const n=1+lv*2,sp=.13+lv*.02;for(let i=0;i<n;i++)pShot(P.x,y,(i-(n-1)/2)*sp,620,.8*dm,S.pbS);AU.sfx('shot');return;}
 if(P.wt==='H'){pShot(P.x-5,y,0,700,.8*dm,S.pb);pShot(P.x+5,y,0,700,.8*dm,S.pb);AU.sfx('shot');return;}
 if(sh===0){pShot(P.x-6,y,0,720,dm,S.pb);pShot(P.x+6,y,0,720,dm,S.pb);if(L>=2){pShot(P.x-12,y+8,-.12,700,dm,S.pb);pShot(P.x+12,y+8,.12,700,dm,S.pb);}if(L>=3){pShot(P.x-2,y-4,0,720,dm,S.pb);pShot(P.x+2,y-4,0,720,dm,S.pb);}if(L>=4){pShot(P.x-16,y+10,-.25,680,dm,S.pb);pShot(P.x+16,y+10,.25,680,dm,S.pb);}if(L>=5){pShot(P.x-22,y+12,-.4,660,dm,S.pb);pShot(P.x+22,y+12,.4,660,dm,S.pb);}}
 else if(sh===1){const n=Math.min(9,1+L*2);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*3,y,(i-(n-1)/2)*.075,700,.85*dm,S.pbS);}
 else{const n=Math.min(3,L);for(let i=0;i<n;i++)pShot(P.x+(i-(n-1)/2)*12,y,0,640,2.8*dm,S.pbT,1,8,20);if(L>=4){pShot(P.x-14,y+8,-.2,620,1.6*dm,S.pbT,0,8,20);pShot(P.x+14,y+8,.2,620,1.6*dm,S.pbT,0,8,20);}if(L>=5){pShot(P.x-22,y+12,-.4,600,1.4*dm,S.pbT,0,8,20);pShot(P.x+22,y+12,.4,600,1.4*dm,S.pbT,0,8,20);}}
 AU.sfx('shot');};
// v22: laser toned down: base dps 41/62/82 by level, power (W) adds only +5%/lvl to the beam (max x1.2) -> max ~98 (+16% vs pre-v20 max 85)
const LZ_DPS=[41,62,82];function lzMul(){return 1+.05*(P.pw||0);}
function laserLv(){const lv=Math.min(3,Math.max(1,P.wlv||1)),e=2*lv-1;return{w:7+e*4,dps:LZ_DPS[lv-1]*UPF.dmg()*lzMul()*(P.ship===2?1.25:1)};}
laserDmg=function(dt){const q=laserLv(),w=q.w,d=q.dps*dt;P.lw=w;let top=-20;
 EN.forEach(e=>{if(!e.a||e.y>P.y)return;if(Math.abs(e.x-P.x)<w/2+e.r){hitE(e,d,true);}});
 const B=G.boss;if(B&&!B.dead&&B.t>=3&&Math.abs(B.x-P.x)<B.w*.45){let hitT=false;for(const t of B.tur){if(t.alive&&Math.abs(B.x+t.ox-P.x)<w/2+10){bossHit(B,B.x+t.ox,B.y+t.oy,d);hitT=true;top=B.y+t.oy;break;}}if(!hitT){const cy=Math.abs(B.x-P.x)<18?B.y+B.coreOy:B.y+B.h*.3;bossHit(B,P.x,cy,d);top=cy;}}
 P.ltop=top;if(Math.random()<.5)part(P.x+rnd(-w/2,w/2),top+4,rnd(-40,40),rnd(20,80),.25,2,ART.glow.c);AU.sfx('laser');};
// drones: 1..3, longer at higher level
DR.push({x:0,y:0,cd:.1});
droneMax=function(){return DRONE.dur*(1+.2*Math.max(0,(P.dlv||1)-1))*UPF.pwr();};
function drAct(){return DR.slice(0,Math.max(1,P.dlv||1));}
droneUpd=function(dt){if(!(P.droneT>0))return;P.droneT-=dt;const S=ART.spr,A=drAct(),n=A.length;
 A.forEach((d,i)=>{const a=G.t*2.4+i*TAU/n,tx=P.x+Math.cos(a)*26,ty=P.y+8+Math.sin(a)*9,k=Math.min(1,dt*10);d.x+=(tx-d.x)*k;d.y+=(ty-d.y)*k;
  d.cd-=dt;if(d.cd<=0){d.cd=DRONE.iv;pShot(d.x,d.y-8,0,600,DRONE.dmg*UPF.dmg()*pwMul(),S.pbD,0,4,10);}});
 if(P.droneT<=0){P.droneT=0;P.dlv=0;A.forEach(d=>{boom(d.x,d.y,6,['p','w']);});AU.sfx('pop');}};
drawDrones=function(){if(!(P.droneT>0)||!P.alive||(G.mode!=='play'&&G.mode!=='clear'))return;const s=ART.spr.drone;if(P.droneT<2&&((P.droneT*10)|0)%2)return;
 drAct().forEach((d,i)=>{cx.globalCompositeOperation='lighter';cx.globalAlpha=.45+.35*Math.sin(G.t*9+i*2);spr(ART.glow.p,d.x,d.y-8,.55);cx.globalAlpha=.35;spr(ART.glow.c,d.x,d.y+1,.7);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  spr(s,d.x,d.y,1,Math.sin(G.t*5+i)*.12);});};
// pickups with levels
G.lvLog=[];
const _pk20=pickup;pickup=function(k,x,y){if(!'SLHWPD'.includes(k))return _pk20(k,x,y);
 AU.sfx('power');DAILY.track('pu');FX.pickup(k,x,y);const t0=tierOf(),mx=WLV[k];let lv,up=false;
 if('SLHW'.includes(k))P.wl=Math.min(MAXWL,P.wl+1);
 if('SLH'.includes(k)){if(P.wt===k){up=P.wlv<mx;P.wlv=Math.min(mx,P.wlv+1);}else{P.wt=k;P.wlv=1;}lv=P.wlv;}
 else if(k==='W'){up=P.pw>0&&P.pw<mx;P.pw=Math.min(mx,(P.pw||0)+1);lv=P.pw;}
 else if(k==='P'){up=P.shield>0&&P.shield<mx;P.shield=Math.min(mx,P.shield+1);lv=P.shield;}
 else{if(P.droneT>0){up=P.dlv<mx;P.dlv=Math.min(mx,P.dlv+1);}else{P.dlv=1;}drAct().forEach((d,i)=>{if(!(P.droneT>0)||i===P.dlv-1){d.x=P.x+(i?16:-16);d.y=P.y+8;d.cd=i*.1;}});P.droneT=droneMax();G.score+=500;lv=P.dlv;}
 const nm={S:'pSpread',L:'pLaser',H:'pHoming',W:'pPower',P:'pShield',D:'pDrone'}[k],ms=lv>=mx?' MAX':' Lv'+lv;
 text(x,y-16,T(nm)+ms,PU_COL[k]);if(up){G.banner={s:T('levelUp')+ms,t:2.6};vib(30);}
 G.lvLog.push({k,lv,up,wt:P.wt,wlv:P.wlv,pw:P.pw,sh:P.shield,dlv:P.dlv});if(G.lvLog.length>60)G.lvLog.shift();
 if(tierOf()>t0)evolve();};
const _h20=hurt;hurt=function(){const l=P.lives;_h20();if(P.lives<l||!P.alive)P.wlv=Math.max(1,(P.wlv||1)-1);};
// bullets / laser bounce capsules (never destroy them)
const _up20=update;update=function(dt){_up20(dt);if(G.mode!=='play')return;
 for(const p of PK){if(!p.a||p.k==='C'||p.hcd>0||p.t>CAP.life)continue;
  for(const b of PB){if(!b.a||!(b.dmg>0))continue;const dx=b.x-p.x,dy=b.y-p.y;if(dx*dx+dy*dy<15*15){if(capBump(p,b.x))b.a=false;break;}}
  if(p.hcd<=0&&P.laser&&P.alive&&p.y<P.y-20&&p.y>(P.ltop||-20)&&Math.abs(p.x-P.x)<(P.lw||11)/2+12){capBump(p,P.x+rnd(-1,1));p.hcd=CAP.lcd;}}};
// pre-rendered cue ring for cycling capsules: thin rainbow ring + 2 swap arrows
function cycRingSpr(){return mk(52,52,g=>{const cs=['#ff5a7a','#ffd23a','#3dff8a','#3ad8ff','#a67aff'];g.lineWidth=1.6;
 for(let i=0;i<10;i++){g.strokeStyle=cs[i%5];g.beginPath();g.arc(0,0,22,i/10*TAU+.08,(i+1)/10*TAU-.08);g.stroke();}
 g.fillStyle='#fff';g.strokeStyle='#0a1430';g.lineWidth=1;[[0,1],[Math.PI,-1]].forEach(([a])=>{g.save();g.rotate(a);g.translate(22,0);g.beginPath();g.moveTo(-3.5,-1);g.lineTo(3.5,-1);g.lineTo(0,5);g.closePath();g.fill();g.stroke();g.restore();});},3);}
const _ba20=buildArt;buildArt=function(){_ba20();ART.spr.cycRing=cycRingSpr();};
if(window.DBG){Object.assign(DBG,{cap(k,x,y){drop(x==null?GW/2:x,y==null?80:y,k);return PK.filter(p=>p.a&&p.k!=='C').length;},
 caps(){return PK.filter(p=>p.a&&p.k!=='C').map(p=>({k:p.k,cy:p.cy?p.cy.join(''):null,ci:p.ci,t:+p.t.toFixed(2),x:+p.x.toFixed(1),y:+p.y.toFixed(1),vx:+p.vx.toFixed(1),vy:+p.vy.toFixed(1),hits:p.hits}));},
 bump(i){const p=PK.filter(p=>p.a&&p.k!=='C')[i||0];return p?capBump(p,p.x-5):false;},
 wpn(){const sh=SHIPS[P.ship],fi=sh.fi/UPF.rate(),dm=UPF.dmg()*pwMul(),lv=P.wlv;let dps=0,nb=0;
  if(P.wt==='S'){nb=1+lv*2;dps=nb*.8*dm/(fi*1.12);}else if(P.wt==='L'){nb=2;dps=laserLv().dps+1.2*dm/(fi*1.6);}else if(P.wt==='H'){nb=Math.min(5,lv+1+(P.ship===1?1:0));dps=nb*2.6*dm/(.42-lv*.04)+1.6*dm/fi;}
  return{wt:P.wt,wlv:lv,tier:P.wl,pw:P.pw,pwMul:+pwMul().toFixed(2),shield:P.shield,dlv:P.dlv,droneT:+(P.droneT||0).toFixed(1),droneMax:+droneMax().toFixed(1),bullets:nb,dps:+dps.toFixed(1),log:G.lvLog.slice(-20)};},CAP,CYC,pickup});}
