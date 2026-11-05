// Starzoomer — v24 endless SPECIAL STAGE "Treasure Comet": every 10th endless sector (10, 20, 30 ...).
// Easy bonus stage: golden-purple comet sky, crystal-rain gems (harmless, no fire, no contact damage), gentle waves with
// slow sparse bullets (fire x0.45, bullet speed x0.72, hp x0.75 via mkDM), treasure ships, coin rain, supply capsules, no boss.
// v26: special stage after stage 10, 20, 30 ... (staircase). Ends with a MEGA REWARD burst: bonus coins 100 + 10*preceding stage number, plus weapon MAX (or 1UP if already MAX, lives capped at 6).
'use strict';
const SP={dur:46,bonus:n=>100+10*n,lifeCap:6,puChance:.16,pity:12};
ED.gem=[2,10,80];
TH[10]={sky:['#0c0418','#22083a','#3a1240'],neb:[[0,[20,4,40]],[.45,[100,34,170]],[.7,[200,110,70]],[.88,[245,180,80]],[1,[255,220,140]]],lm:'comet',fx:'comets',star:[255,236,200],flare:'#ffd88a'};
// pre-rendered art: golden comet landmark + crystal gem enemy
function cometLM(){return mk(260,260,g=>{g.globalCompositeOperation='lighter';g.rotate(-.75);
 for(let k=0;k<3;k++){g.fillStyle=GL(g,0,0,0,-150,[[0,'rgba(255,220,120,'+(.55-k*.15)+')'],[.5,'rgba(220,120,255,'+(.25-k*.06)+')'],[1,'rgba(160,60,255,0)']]);g.beginPath();g.moveTo(-14-k*10,0);g.quadraticCurveTo(-26-k*14,-80,-8-k*20,-150);g.lineTo(8+k*20,-150);g.quadraticCurveTo(26+k*14,-80,14+k*10,0);g.fill();}
 g.fillStyle=GR(g,0,0,0,60,[[0,'rgba(255,240,180,.7)'],[.4,'rgba(255,180,80,.25)'],[1,'rgba(200,80,255,0)']]);g.beginPath();g.arc(0,0,60,0,7);g.fill();
 g.fillStyle=GR(g,0,0,0,20,[[0,'#ffffff'],[.5,'#ffe9a0'],[1,'rgba(255,190,60,0)']]);g.beginPath();g.arc(0,0,20,0,7);g.fill();
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<14;i++){const a=i*2.4,r=24+i*7;g.fillRect(Math.sin(a)*r*.35,-r,1.4,1.4);}},1.6);}
function gemSpr(){return mk(26,30,g=>{const sh=[0,-13,10,-4,6,12,0,14,-6,12,-10,-4];
 g.fillStyle=GR(g,0,0,2,15,[[0,'rgba(255,220,120,.5)'],[1,'rgba(255,220,120,0)']]);g.beginPath();g.arc(0,0,15,0,7);g.fill();
 poly(g,sh);g.fillStyle=GL(g,-10,-13,10,14,[[0,'#fff6d0'],[.3,'#ffcf4a'],[.6,'#c050ff'],[1,'#3a0a7a']]);g.fill();g.strokeStyle='#2a0850';g.lineWidth=1.2;g.stroke();
 g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.8;g.beginPath();g.moveTo(-10,-4);g.lineTo(10,-4);g.moveTo(0,-13);g.lineTo(-4,-4);g.lineTo(0,14);g.lineTo(4,-4);g.lineTo(0,-13);g.stroke();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(-4,-6,2,1,-.6,0,7);g.fill();
 g.fillStyle='#2a0850';g.beginPath();g.arc(-2.4,3,1,0,7);g.arc(2.4,3,1,0,7);g.fill();g.strokeStyle='#2a0850';g.lineWidth=.9;g.beginPath();g.arc(0,5,1.8,.2,Math.PI-.2);g.stroke();},3);}
const _lm24=landmark6;landmark6=function(k){return k==='comet'?cometLM():_lm24(k);};
const _ba24=buildArt;buildArt=function(){_ba24();ART.spr.gem=gemSpr();};
// timeline
function spBuild(){G.dur=SP.dur;G.ev=[[1.2,'zigline']];const pools=['zigline','sine','vform','sine'];
 for(let t=3.4;t<G.dur-3;t+=rnd(3.2,4.2))G.ev.push([t,pools[(Math.random()*pools.length)|0]]);
 [4,11,18,26,34,41].forEach(t=>G.ev.push([t,'sp_gems']));[9,21,32,40].forEach(t=>G.ev.push([t,'sp_gold']));
 G.ev.push([15,'sp_coins'],[28,'sp_coins'],[24,'sp_supply']);G.ev.sort((a,b)=>a[0]-b[0]);G.evI=0;}
const _bs24=buildStage;buildStage=function(){if(G.special)return spBuild();_bs24();};
const _wv24=wave;wave=function(k){if(!G.special)return _wv24(k);
 if(k==='sp_gems'){const n=7,x0=rnd(70,GW-70),ph=Math.random()*TAU;for(let i=0;i<n;i++)later(i*.22,()=>spawnE('gem',clamp(x0+Math.sin(ph+i*.9)*70,20,GW-20),-18,{vx:0,vy:62,vr:0,ph:ph+i}));}
 else if(k==='sp_gold'){runEvent('gold');}else if(k==='sp_coins'){runEvent('coins');}else if(k==='sp_supply'){runEvent('supply');}
 else _wv24(k);};
const _ss24=startStage;startStage=function(n,e){_ss24(n,e);G.spEnd=-1;G.spBonus=0;G.spGift='';if(G.special){G.mev=[];G.warnT=-1;P.shield=Math.min(4,P.shield+1);}};
const _ke24=killE;killE=function(e){_ke24(e);if(!G.special)return;
 if(e.type==='gem'){for(let i=0;i<2;i++)drop(e.x+rnd(-6,6),e.y,'C');if(QUAL>0)for(let i=0;i<6;i++){const a=i/6*TAU;part(e.x,e.y,Math.cos(a)*90,Math.sin(a)*90,.4,2,ART.glow[i%2?'y':'p'],0);}}
 else if(e.type==='gold'){drop(e.x-10,e.y,pickPU());drop(e.x+10,e.y,pickPU());}
 else{G.spPity=(G.spPity||0)+1;if(Math.random()<SP.puChance||G.spPity>SP.pity){G.spPity=0;drop(e.x,e.y,pickPU());}}};
// mega reward
function spMega(){G.spEnd=0;const n=stNum();G.spBonus=SP.bonus(n);AU.sfx('clear');AU.sfx('power');G.flash=.5;G.shake=6;FX.fw=3;P.magT=Math.max(P.magT,8);P.inv=Math.max(P.inv,6);
 EB.forEach(b=>b.a=false);ring(GW/2,GH*.4,60,'#ffd23a');ring(GW/2,GH*.4,110,'#c060ff');
 for(let i=0;i<36;i++)later(i*.05,()=>{const a=Math.random()*TAU,r=rnd(10,60);const p=take(PK);if(!p)return;p.x=GW/2+Math.cos(a)*r;p.y=GH*.4+Math.sin(a)*r;p.vx=Math.cos(a)*rnd(60,140);p.vy=Math.sin(a)*rnd(60,140)-40;p.k='C';p.t=0;p.v=1;});
 if(P.wl<MAXWL||(P.wt!=='B'&&(P.wlv||1)<3)){const t0=tierOf();P.wl=MAXWL;if(P.wt!=='B')P.wlv=3;setTier();if(tierOf()>t0)evolve();G.spGift='max';text(P.x,P.y-40,T('pPower')+' MAX','#ffe14a');}
 else if(P.lives<SP.lifeCap){P.lives++;G.spGift='life';text(P.x,P.y-40,T('pLife'),'#7affb0');}
 else{G.spBonus+=50;G.spGift='coins';}
 G.banner={s:T('spMega')+' +◆'+G.spBonus,t:2.6};}
const _up24=update;update=function(dt){_up24(dt);if(!G.special||G.mode!=='play')return;
 for(const e of EN)if(e.a&&e.type==='gem')e.x+=Math.sin(e.t*2+e.ph)*24*dt;
 if(G.spEnd<0&&G.t>=G.dur+1.5&&P.alive&&(G.t>=G.dur+6||!EN.some(e=>e.a&&e.y>0)))spMega();
 else if(G.spEnd>=0){G.spEnd+=dt;if(G.spEnd>=3.4&&P.alive)stageClear();}};
const _sc24=stageClear;stageClear=function(){_sc24();if(!G.special||!G.endless)return;const b=G.spBonus||SP.bonus(stNum(G.sector-1));SAVE.cr+=b;G.starBonus=b;persist();};
const _rv24=revive;revive=function(){_rv24();if(G.special&&!G.boss)AU.play(61);};
if(window.DBG){Object.assign(DBG,{
 // jump straight to endless sector n (1-based, as shown on screen); keeps a fresh ship if not already in endless
 endless(n){UI.hideAll();G.fresh=!G.endless||G.mode==='menu';G.sector=Math.max(0,(n|0)-1);startStage(0,true);return this.state();},
 // v26: jump to numbered stage N (1..), 'sp' after stage N via spAfter(N)
 stage(N){if(N<=10){UI.hideAll();G.fresh=true;startStage(N);return this.state();}return this.endless(secOf(N)+1);},
 spAfter(N){return this.endless(secOf(N+1));},
 // set the NEXT endless sector (used by the next stage start / warp) without starting it
 setSector(n){G.sector=Math.max(0,(n|0)-1);return G.sector;},
 toSpEnd(){G.t=G.dur;G.evI=G.ev.length;LATER.length=0;EN.forEach(e=>e.a=false);},
 sp(){return{special:!!G.special,sector:G.sector,stNum:stNum(),far:SAVE.far,num:G.sector+1,bIdx:bIdx(),bg:G.bg,dur:G.dur,t:+G.t.toFixed(1),spEnd:+(G.spEnd||0).toFixed(2),bonus:G.spBonus,gift:G.spGift,starBonus:G.starBonus,lives:P.lives,wl:P.wl,fire:+G.dm.fire.toFixed(3),spd:+G.dm.spd.toFixed(3),hp:+G.dm.hp.toFixed(3),gems:EN.filter(e=>e.a&&e.type==='gem').length,boss:!!G.boss,warnT:G.warnT};},
 bmap(k){const o=[];for(let s=0;s<k;s++)o.push(isSpecial(s)?'SP':bIdx(s));return o;}});}
