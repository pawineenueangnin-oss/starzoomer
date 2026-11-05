// Starzoomer v18 — ship paints + engine flames, star bonus, gentle mid-stage events, helper drones, beginner helper.
'use strict';
// ---------- save defaults (old saves keep loading) ----------
(function(){const d={skin:'classic',flame:'fire',skins:['classic'],flames:['fire'],helper:0};for(const k in d)if(SAVE[k]===undefined)SAVE[k]=Array.isArray(d[k])?d[k].slice():d[k];
 if(!Array.isArray(SAVE.skins))SAVE.skins=['classic'];if(!Array.isArray(SAVE.flames))SAVE.flames=['fire'];SAVE.helper=SAVE.helper?1:0;})();
function totStars(){let n=0;for(let i=0;i<10;i++)n+=Math.min(3,SAVE.stars[i]|0);return n;}
// ---------- paint schemes: pre-rendered pixel recolour (once per ship+paint, cached) ----------
const SKINS=[{id:'classic',n:'sk1',cost:0},{id:'ocean',n:'sk2',cost:200,f:h=>h+190},{id:'candy',n:'sk3',cost:300,f:h=>h+300},{id:'jungle',n:'sk4',cost:400,f:h=>h+100},
 {id:'gold',n:'sk5',cost:800,gold:1},{id:'holo',n:'sk6',stars:20,holo:1}];
const FLAMES=[{id:'fire',n:'fl1',cost:0},{id:'ice',n:'fl2',cost:200,o:'#3ac8ff',i:'#e0fbff',gk:['c','w']},{id:'galaxy',n:'fl3',cost:300,o:'#a64aff',i:'#f4d8ff',gk:['v','p']},
 {id:'lime',n:'fl4',cost:400,o:'#4aff5a',i:'#eaffc8',gk:['g','y']},{id:'rainbow',n:'fl5',stars:12,rb:1}];
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;if(mx===mn)return[0,0,l];const d=mx-mn,s=l>.5?d/(2-mx-mn):d/(mx+mn);
 let h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;return[h*60,s,l];}
function hue2(p,q,t){if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;}
function recolor(s,sk){const W=s.c.width,H=s.c.height,c=mkC(W,H),g=c.getContext('2d');g.drawImage(s.c,0,0);const im=g.getImageData(0,0,W,H),d=im.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]<8)continue;let[h,S,L]=rgb2hsl(d[i],d[i+1],d[i+2]);if(S<.2||L<.06||L>.97)continue;
  if(sk.gold){if(h>175&&h<265)continue;h=44+(h%40)*.15;S=Math.min(1,S*1.05);}else if(sk.holo){h=(y/H*320+x/W*80+170)%360;S=Math.max(S,.8);}else h=sk.f(h);
  h=((h%360)+360)%360/360;const q=L<.5?L*(1+S):L+S-L*S,p=2*L-q;d[i]=hue2(p,q,h+1/3)*255;d[i+1]=hue2(p,q,h)*255;d[i+2]=hue2(p,q,h-1/3)*255;}
 g.putImageData(im,0,0);return{c,w:s.w,h:s.h};}
const SKC={};function skinSet(ship,id){const k=ship+'_'+id;if(SKC[k])return SKC[k];const sk=SKINS.find(x=>x.id===id)||SKINS[0],S=ART.spr;
 const o={b:sk.id==='classic'?S.ship[ship]:recolor(S.ship[ship],sk),t:[]};o.T=tr=>o.t[tr]||(o.t[tr]=sk.id==='classic'?S.shipT[ship][tr]:recolor(S.shipT[ship][tr],sk));return SKC[k]=o;}
function skinT(ship,tr){return skinSet(ship,SAVE.skin).T(tr);}
function skinB(ship){return skinSet(ship,SAVE.skin).b;}
function warmSkin(){const o=skinSet(SAVE.ship,SAVE.skin);for(let t=0;t<5;t++)o.T(t);flameSet(SAVE.flame);}
// ---------- engine flames ----------
const FLC={};const RBH=['#ff4a4a','#ffa82a','#ffe14a','#4aff6a','#3ac8ff','#a64aff'],RBK=['r','o','y','g','c','v'];
function flameSet(id){if(FLC[id])return FLC[id];const f=FLAMES.find(x=>x.id===id)||FLAMES[0];let o=null;
 if(f.rb)o={rb:RBH.map(c=>plumeSpr(c)),in:plumeSpr('#ffffff')};else if(f.o)o={out:plumeSpr(f.o),in:plumeSpr(f.i),gk:f.gk};return FLC[id]=o;}
// returns [inner, outer] plume sprites for the equipped flame
function flameSpr(tr,ship,ni){const S=ART.spr,o=flameSet(SAVE.flame);if(!o)return[S.plume[tr],S.plumeW[ship]];if(o.rb)return[o.in,o.rb[(((G.scroll*8)|0)+(ni||0))%6]];return[o.in,o.out];}
function flameGlow(tr,side){const o=flameSet(SAVE.flame),g=ART.glow;if(!o)return side?g.c:g[['b','c','g','y','w'][tr]];if(o.rb)return g[RBK[(((G.scroll*8)|0)+(side?3:0))%6]];return g[o.gk[side?1:0]];}
// ---------- hangar: paint + flame cards ----------
const _pv={};function skinPrev(id){const k=SAVE.ship+'_'+id;return _pv[k]||(_pv[k]=skinSet(SAVE.ship,id).b.c.toDataURL());}
function flamePrev(id){const k=SAVE.ship+'_f_'+id+'_'+SAVE.skin;if(_pv[k])return _pv[k];const s=skinB(SAVE.ship),R=2,c=mkC(54*R,78*R),g=c.getContext('2d');g.scale(R,R);
 const f=FLAMES.find(x=>x.id===id),S=ART.spr;let fs;if(!f.o&&!f.rb)fs=[[S.plume[0],S.plumeW[SAVE.ship]]];else{const o=flameSet(id);fs=o.rb?[[o.in,o.rb[0]],[o.in,o.rb[3]]]:[[o.in,o.out]];}
 g.globalCompositeOperation='lighter';const nz=NOZ[SAVE.ship];nz.forEach((n,j)=>{const [pi,po]=fs[j%fs.length];g.drawImage(po.c,27+n[0]-6,29+n[1]-2,12,40);g.drawImage(pi.c,27+n[0]-4,29+n[1]-1,8,30);});
 g.globalCompositeOperation='source-over';g.drawImage(s.c,0,0,54,58);return _pv[k]=c.toDataURL();}
function skinUI(){const ts=totStars();const card=(it,kind)=>{const own=(kind==='skin'?SAVE.skins:SAVE.flames).includes(it.id),eq=SAVE[kind]===it.id,lockS=it.stars&&ts<it.stars;
  const img=kind==='skin'?skinPrev(it.id):flamePrev(it.id);
  const st=eq?`<span class="ok">${T('equipped')}</span>`:own||(it.stars&&!lockS)?`<button class="b sm" data-a="${kind}" data-k="${it.id}">${T('equip')}</button>`:it.stars?`<small class="lk">🔒 ${T('needStars').replace('{n}',it.stars)}</small>`:`<button class="b sm gold${SAVE.cr<it.cost?' poor':''}" data-a="${kind}" data-k="${it.id}">◆ ${it.cost}</button>`;
  return`<div class="sk ${eq?'sel':''} ${lockS?'lock':''}"><img src="${img}" alt=""><b>${T(it.n)}</b>${st}</div>`;};
 return`<h3>${T('skins')} <span class="tst">★ ${ts}/30</span></h3><div class="skins">${SKINS.map(s=>card(s,'skin')).join('')}</div><h3>${T('flames')}</h3><div class="skins fl">${FLAMES.map(s=>card(s,'flame')).join('')}</div>`;}
const _act18=UI.act;UI.act=function(a,b){if(a!=='skin'&&a!=='flame')return _act18.call(this,a,b);const L=a==='skin'?SKINS:FLAMES,own=a==='skin'?SAVE.skins:SAVE.flames,it=L.find(x=>x.id===b.dataset.k);if(!it)return;
 const sc=UI.el().scrollTop;
 if(own.includes(it.id)||(it.stars&&totStars()>=it.stars)){if(!own.includes(it.id))own.push(it.id);SAVE[a]=it.id;persist();}
 else if(it.cost&&SAVE.cr>=it.cost){SAVE.cr-=it.cost;own.push(it.id);SAVE[a]=it.id;persist();AU.sfx('power');AU.sfx('coin');vib(40);}
 else toast(T('needCr'));warmSkin();this.hangar();UI.el().scrollTop=sc;};
// ---------- mid-stage events (stage 2+, 1-2 per stage, never in boss fights) ----------
ED.gold=[30,14,1500];
const EVK=['coins','gold','supply'];
function planEvents(){G.mev=[];G.evLog=G.evLog||[];if(!G.endless&&G.stage<2)return;const n=Math.random()<.5?1:2,ks=EVK.slice().sort(()=>Math.random()-.5);
 G.mev.push({t:G.dur*rnd(.25,.42),k:ks[0]});if(n===2)G.mev.push({t:G.dur*rnd(.58,.75),k:ks[1]});}
function runEvent(k){G.evLog.push({k,t:+G.t.toFixed(1),stage:G.stage,sector:G.sector,boss:!!G.boss,warn:G.warnT});G.evN=(G.evN||0)+1;
 G.banner={s:T(k==='coins'?'evCoins':k==='gold'?'evGold':'evSupply'),t:2.6};AU.sfx('power');
 if(k==='coins'){for(let i=0;i<28;i++)later(i*.13,()=>{const p=take(PK);if(!p)return;p.x=rnd(24,GW-24);p.y=-12;p.vx=rnd(-12,12);p.vy=rnd(50,100);p.k='C';p.t=0;p.v=1;});}
 else if(k==='gold'){const l=Math.random()<.5;spawnE('gold',l?-24:GW+24,rnd(120,175),{vx:(l?1:-1)*72,vy:0,vr:0,y0:0});const e=EN.find(e=>e.a&&e.type==='gold');if(e)e.y0=e.y;}
 else{const xs=[GW*.25,GW*.5,GW*.75].sort(()=>Math.random()-.5);for(let i=0;i<3;i++)later(i*.9,()=>drop(xs[i],-10,pickPU()));}}
const _ss18=startStage;startStage=function(n,e){_ss18(n,e);P.droneT=0;P.mercyT=0;G.banner=null;G.evN=0;warmSkin();planEvents();if(SAVE.helper)P.shield=Math.min(4,P.shield+1);DR.forEach(d=>{d.x=P.x;d.y=P.y;d.cd=0;});};
const _ke18=killE;killE=function(e){_ke18(e);if(e.type==='gold'){for(let i=0;i<18;i++)drop(e.x+rnd(-14,14),e.y+rnd(-10,10),'C');G.score+=1500*(P.x2T>0?2:1);text(e.x,e.y-18,'+◆','#ffe14a');FX.glow&&FX.glow(e.x,e.y,.5,'#ffd23a');AU.sfx('power');}};
// ---------- helper drones ----------
PU_COL.D='#ff7ad8';const DR=[{x:0,y:0,cd:0},{x:0,y:0,cd:.15}];const DRONE={dur:15,dmg:.5,iv:.3};
function droneMax(){return DRONE.dur*UPF.pwr();}
const _pk18=pickup;pickup=function(k,x,y){if(k!=='D')return _pk18(k,x,y);AU.sfx('power');DAILY.track('pu');FX.pickup(k,x,y);if(!(P.droneT>0))DR.forEach((d,i)=>{d.x=P.x+(i?16:-16);d.y=P.y+8;d.cd=i*.15;});
 P.droneT=droneMax();text(x,y-16,T('pDrone'),PU_COL.D);G.score+=500;};
function droneSpr(){return mk(22,22,g=>{g.save();g.shadowColor='#ff7ad8';g.shadowBlur=5;g.fillStyle=GL(g,0,-2,0,6,[[0,'#ff9ae0'],[1,'#8a1a6a']]);
 poly(g,[-6,1,-10.5,4,-10,6.5,-5,4.5]);g.fill();poly(g,[6,1,10.5,4,10,6.5,5,4.5]);g.fill();g.restore();
 g.fillStyle=GR(g,-2.2,-2.8,.5,8.5,[[0,'#ffffff'],[.35,'#d6e4ff'],[.8,'#6a78b8'],[1,'#262a58']]);g.beginPath();g.arc(0,0,7,0,7);g.fill();g.strokeStyle='#120a2a';g.lineWidth=1;g.stroke();
 g.fillStyle='#14102e';g.beginPath();g.ellipse(0,.6,5,2.7,0,0,7);g.fill();g.fillStyle=GR(g,0,.6,0,3,[[0,'#ffffff'],[.4,'#7af0ff'],[1,'rgba(40,160,255,.2)']]);g.beginPath();g.ellipse(-1.6,.6,1.6,1.7,0,0,7);g.ellipse(1.8,.6,1.6,1.7,0,0,7);g.fill();
 g.strokeStyle='#c8d0f0';g.lineWidth=1;g.beginPath();g.moveTo(0,-7);g.lineTo(0,-9.5);g.stroke();g.fillStyle='#ff7ad8';g.beginPath();g.arc(0,-10,1.5,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-2.6,-3.6,2,1.1,-.6,0,7);g.fill();},3);}
function droneUpd(dt){if(!(P.droneT>0))return;P.droneT-=dt;const S=ART.spr;
 DR.forEach((d,i)=>{const a=G.t*2.4+i*Math.PI,tx=P.x+Math.cos(a)*26,ty=P.y+8+Math.sin(a)*9,k=Math.min(1,dt*10);d.x+=(tx-d.x)*k;d.y+=(ty-d.y)*k;
  d.cd-=dt;if(d.cd<=0){d.cd=DRONE.iv;pShot(d.x,d.y-8,0,600,DRONE.dmg*UPF.dmg(),S.pbD,0,4,10);}});
 if(P.droneT<=0){P.droneT=0;DR.forEach(d=>{boom(d.x,d.y,6,['p','w']);});AU.sfx('pop');}}
function drawDrones(){if(!(P.droneT>0)||!P.alive||(G.mode!=='play'&&G.mode!=='clear'))return;const s=ART.spr.drone;if(P.droneT<2&&((P.droneT*10)|0)%2)return;
 DR.forEach((d,i)=>{cx.globalCompositeOperation='lighter';cx.globalAlpha=.45+.35*Math.sin(G.t*9+i*2);spr(ART.glow.p,d.x,d.y-10*.8,.55);cx.globalAlpha=.35;spr(ART.glow.c,d.x,d.y+1,.7);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  spr(s,d.x,d.y,1,Math.sin(G.t*5+i)*.12);});}
// ---------- first-death mercy ----------
const _h18=hurt;hurt=function(){const d=G.deaths;_h18();if(G.deaths>d&&G.deaths===1&&P.alive){P.inv+=1;P.mercyT=P.inv;G.mercyN=(G.mercyN||0)+1;}};
// ---------- frame hooks ----------
const _up18=update;update=function(dt){_up18(dt);if(G.mode!=='play')return;
 if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null;}if(P.mercyT>0)P.mercyT-=dt;
 if(G.mev&&G.mev.length&&!G.boss&&G.warnT===0&&G.t>=G.mev[0].t){const e=G.mev.shift();if(G.t<G.dur-4)runEvent(e.k);}
 for(const e of EN)if(e.a&&e.type==='gold'){e.y=e.y0+Math.sin(e.t*3)*14;if(QUAL>0&&Math.random()<.3)part(e.x+rnd(-16,16),e.y+rnd(-8,8),0,30,.4,1.2,ART.spr.glint,0);}
 if(P.alive)droneUpd(dt);};
const _dp18=drawPlayer;drawPlayer=function(){_dp18();if(G.mode==='warp'||G.mode==='menu')return;drawDrones();
 if(P.mercyT>0&&P.alive){cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,P.mercyT)*(.55+.25*Math.sin(G.t*10));cx.strokeStyle='#ffe14a';cx.lineWidth=2.5;cx.beginPath();cx.arc(P.x,P.y,30+Math.sin(G.t*6)*2,0,TAU);cx.stroke();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}};
const _dh18=drawHUD;drawHUD=function(){_dh18();const b=G.banner;if(!b||G.mode!=='play')return;const k=Math.min(1,(2.6-b.t)*5,b.t*3),y=GH*.27;cx.save();cx.globalAlpha=k;
 const asc=/^[\x00-\x7f]*$/.test(b.s),fn=z=>asc?z+'px PS2P, system-ui':'800 '+(z+5)+'px system-ui, sans-serif';let fz=13;cx.font=fn(fz);while(cx.measureText(b.s).width>GW-60&&fz>8){fz--;cx.font=fn(fz);}cx.direction=document.documentElement.dir==='rtl'?'rtl':'ltr';const w=Math.min(GW-24,cx.measureText(b.s).width+40);
 cx.translate(GW/2,y);cx.scale(1,Math.min(1,(2.6-b.t)*6));glass(-w/2,-17,w,34,14,'#ffd23a');cx.textAlign='center';cx.textBaseline='middle';hs(b.s,0,1,'#ffe14a','#ff8a2a');cx.restore();cx.textBaseline='alphabetic';};
const _ba18=buildArt;buildArt=function(){_ba18();const S=ART.spr;S.drone=droneSpr();S.pbD=bolt6('#ff7ad8',3,9);S.gold=recolor(S.saucer,{gold:1});};
if(window.DBG){Object.assign(DBG,{ev(){return{log:G.evLog||[],plan:(G.mev||[]).map(e=>({k:e.k,t:+e.t.toFixed(1)})),n:G.evN||0,dur:G.dur};},
 drone(){return{t:+(P.droneT||0).toFixed(2),d:DR.map(d=>({x:+d.x.toFixed(1),y:+d.y.toFixed(1)})),px:P.x,py:P.y,pb:PB.filter(b=>b.a&&b.s===ART.spr.pbD).length};},
 skin(){return{skin:SAVE.skin,flame:SAVE.flame,skins:SAVE.skins,flames:SAVE.flames,drawn:skinT(P.ship,0)!==ART.spr.shipT[P.ship][0]};},runEvent,totStars});}
// 'D' capsule icon: tiny robot head (same ink/white style as the other capsule icons)
const _pi18=puIcon;puIcon=function(g,k){if(k!=='D')return _pi18(g,k);const ink='#0a1430';
 const head=()=>{g.beginPath();if(g.roundRect)g.roundRect(-6.5,-4.5,13,10,3.5);else g.rect(-6.5,-4.5,13,10);};
 g.lineWidth=2.6;g.strokeStyle=ink;head();g.stroke();g.beginPath();g.moveTo(0,-4.5);g.lineTo(0,-8.5);g.stroke();g.beginPath();g.moveTo(-6.5,0);g.lineTo(-9,0);g.moveTo(6.5,0);g.lineTo(9,0);g.stroke();
 g.fillStyle='#fff';head();g.fill();g.strokeStyle='#fff';g.lineWidth=1.3;g.beginPath();g.moveTo(0,-4.5);g.lineTo(0,-8.5);g.moveTo(-6.5,0);g.lineTo(-9,0);g.moveTo(6.5,0);g.lineTo(9,0);g.stroke();
 g.beginPath();g.arc(0,-9.2,1.8,0,7);g.fill();g.fillStyle=ink;g.beginPath();g.arc(-2.6,.4,1.5,0,7);g.arc(2.6,.4,1.5,0,7);g.fill();};
