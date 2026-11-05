// v29: tutorial, Boss Rush, extra skins, ship missions, gentler early stages, opt-in rewarded start power-up
(function(){
// ---------- CSS ----------
const css=document.createElement('style');css.textContent=`
#warpSkip{position:absolute;right:4%;bottom:6%;pointer-events:auto;z-index:30}
#tut{position:absolute;inset:0;pointer-events:auto;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:rgba(6,4,24,.35)}
#tut .tc{margin-top:22%;text-align:center;background:rgba(14,10,46,.82);border:1px solid rgba(160,190,255,.45);border-radius:1em;padding:.8em 1.1em;max-width:84%;box-shadow:0 0 1.2em rgba(90,120,255,.45)}
#tut .tc b{display:block;font-size:1.25em;margin-bottom:.3em;color:#ffe14a}
#tut .tb{margin-top:.9em;display:flex;gap:.7em}
#tut .fg{position:absolute;width:3.6em;height:3.6em;margin:-.6em 0 0 -1.4em;pointer-events:none;filter:drop-shadow(0 0 .5em rgba(140,200,255,.9))}
#freePU{position:absolute;right:3%;top:15%;pointer-events:auto;z-index:25;font-size:.85em;animation:fpu 1.2s ease-in-out infinite alternate}
@keyframes fpu{from{transform:scale(1)}to{transform:scale(1.07)}}
.sk small.lk.ac{font-size:.72em;line-height:1.15}
`;document.head.appendChild(css);
const uiRoot=()=>document.getElementById('ui');
// ---------- gentler stages 1-3 ----------
const EZ=[0,{hp:.82,spd:.9,fire:.78},{hp:.88,spd:.94,fire:.86},{hp:.94,spd:.97,fire:.93}];
const _mkDM=mkDM;mkDM=function(){const d=_mkDM(),z=()=>(!G.endless&&!G.rushOn&&EZ[G.stage])||null;
 const hp=Object.getOwnPropertyDescriptor(d,'hp').get,sp=Object.getOwnPropertyDescriptor(d,'spd').get,fi=Object.getOwnPropertyDescriptor(d,'fire').get;
 Object.defineProperty(d,'hp',{get(){const k=z();return hp()*(k?k.hp:1);}});
 Object.defineProperty(d,'spd',{get(){const k=z();return sp()*(k?k.spd:1);}});
 Object.defineProperty(d,'fire',{get(){const k=z();return fi()*(k?k.fire:1);}});return d;};
// ---------- skins (code recolour, unlocked by stars or achievements) ----------
SKINS.push({id:'neon',n:'sk7',stars:6,f:h=>h+140,sat:1},{id:'crimson',n:'sk8',stars:15,f:h=>h*.12+350},{id:'void',n:'sk9',stars:30,f:h=>h*.2+262,dark:.62},
 {id:'stealth',n:'sk10',ach:'a5',mono:1},{id:'arctic',n:'sk11',ach:'a3s',f:h=>h*.15+188,pale:1},{id:'solar',n:'sk12',ach:'arush',f:h=>h*.18+28,sat:1});
const ACH={a5:()=>(SAVE.reached|0)>5||!!SAVE.cleared,a3s:()=>(SAVE.stars||[]).some(s=>s>=3),arush:()=>!!SAVE.rushDone};
window.skinAch=ACH;
const _rc=recolor;recolor=function(s,sk){if(!(sk.mono||sk.dark||sk.pale||sk.sat))return _rc(s,sk);
 const W=s.c.width,H=s.c.height,c=mkC(W,H),g=c.getContext('2d');g.drawImage(s.c,0,0);const im=g.getImageData(0,0,W,H),d=im.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;let[h,S,L]=rgb2hsl(d[i],d[i+1],d[i+2]);if(L<.06||L>.97)continue;
  if(sk.mono){if(S>.2&&h>170&&h<260){h=150;S=1;L=Math.min(.75,L*1.1);}else{S*=.08;L=L*.62;}}
  else{if(S<.2)continue;h=sk.f(h);if(sk.dark)L=L*sk.dark+.04;if(sk.pale){S*=.55;L=Math.min(.95,L*1.12+.06);}if(sk.sat)S=Math.min(1,S*1.25+.1);}
  h=((h%360)+360)%360/360;const q=L<.5?L*(1+S):L+S-L*S,p=2*L-q;d[i]=hue2(p,q,h+1/3)*255;d[i+1]=hue2(p,q,h)*255;d[i+2]=hue2(p,q,h-1/3)*255;}
 g.putImageData(im,0,0);return{c,w:s.w,h:s.h};};
skinUI=function(){const ts=totStars();const card=(it,kind)=>{const own=(kind==='skin'?SAVE.skins:SAVE.flames).includes(it.id),eq=SAVE[kind]===it.id,achOk=it.ach&&ACH[it.ach](),lockS=(it.stars&&ts<it.stars)||(it.ach&&!achOk&&!own);
  const img=kind==='skin'?skinPrev(it.id):flamePrev(it.id);
  const st=eq?`<span class="ok">${T('equipped')}</span>`:own||(it.stars&&!lockS)||achOk?`<button class="b sm" data-a="${kind}" data-k="${it.id}">${T('equip')}</button>`:it.ach?`<small class="lk ac">🔒 ${T('ach_'+it.ach)}</small>`:it.stars?`<small class="lk">🔒 ${T('needStars').replace('{n}',it.stars)}</small>`:`<button class="b sm gold${SAVE.cr<it.cost?' poor':''}" data-a="${kind}" data-k="${it.id}">◆ ${it.cost}</button>`;
  return`<div class="sk ${eq?'sel':''} ${lockS?'lock':''}"><img src="${img}" alt=""><b>${T(it.n)}</b>${st}</div>`;};
 return`<h3>${T('skins')} <span class="tst">★ ${ts}/30</span></h3><div class="skins">${SKINS.map(s=>card(s,'skin')).join('')}</div><h3>${T('flames')}</h3><div class="skins fl">${FLAMES.map(s=>card(s,'flame')).join('')}</div>`;};
// ---------- daily mission: clear stages with a specific ship ----------
DAILY.POOL.push({id:'ship',n:[1,2],r:[70,110]});
const _roll=DAILY.roll;DAILY.roll=function(){const D=_roll.call(this);let ch=false;(D.m||[]).forEach((m,i)=>{if(m.id==='ship'&&m.s===undefined){const own=SHIPS.map((_,k)=>k).filter(k=>(SAVE.ships||[1])[k]);m.s=own.length?own[(D.d+i)%own.length]:0;ch=true;}});if(ch)persist();return D;};
const _mis=UI.missions;UI.missions=function(){_mis.call(this);const D=SAVE.dly;this.el().querySelectorAll('.mi').forEach((el,i)=>{const m=D.m[i];if(!m||m.id!=='ship')return;const b=el.querySelector('.mt b');if(b)b.textContent=T('m_ship').replace('{n}',m.n).replace('{s}',SHIPS[m.s]?SHIPS[m.s].n:'');const im=el.querySelector('img.ui');if(im)im.src=this.ico('W');});};
// ---------- Boss Rush ----------
G.rushOn=false;
const RB=3.2;// break between bosses (s)
function rushBegin(){AU.init();UI.hideAll&&UI.hideAll();G.fresh=true;G._rushInt=true;startStage(1,false);G._rushInt=false;G.rushOn=true;G.rushI=0;G.rushT0=performance.now();
 G.ev=[];G.evI=0;G.mev=[];document.getElementById('freePU')?.remove();LATER.length=0;G.noIntro=true;P.lives=Math.max(P.lives,3+SHIPS[P.ship].hp+UPF.life());P.bombs=3;
 // startStage already AU.play(1); re-kick so music begins with the rush banner even if AC just resumed
 AU.songId=-2;AU.play(1);AU.sfx('power');
 rushNext(0);}
function rushNext(i){G.rushI=i;G.stage=i+1;G.dm=mkDM();G.boss=null;G.warnT=0;G.t=G.dur+2.5-RB;G.bg=i;setBG(i,true);prewarm(-1,i);
 G.banner={s:T('rush')+' '+(i+1)+' / 10',t:2.6};
 // Music with the inter-boss banner (stageClear / damageBoss may have silenced it)
 AU.play(i+1);}
window.rushBegin=rushBegin;
const _ss=startStage;startStage=function(n,e){if(G.rushOn&&!G._rushInt){G.rushOn=false;return rushBegin();}G.rushOn=false;_ss(n,e);G.freePU=0;freePU(n,e);};
const _sc=stageClear;stageClear=function(){if(!G.rushOn)return _sc();
 DAILY.track('boss');
 if(G.rushI<9){AU.play(-1);AU.sfx('clear');G.score+=5000*(G.rushI+1);text(GW/2,GH*.4,'+'+5000*(G.rushI+1),'#ffe14a');P.bombs=Math.min(5,P.bombs+1);rushNext(G.rushI+1);return;}
 G.mode='clear';AU.play(-1);AU.sfx('clear');rushEnd(true);};
function rushEnd(win){const first=win&&!SAVE.rushDone;if(win){SAVE.rushDone=1;if(!SAVE.skins.includes('solar'))SAVE.skins.push('solar');}
 SAVE.rushBest=Math.max(SAVE.rushBest|0,G.score);SAVE.cr+=G.credits;if(G.score>SAVE.hi)SAVE.hi=G.score;persist();
 setTimeout(()=>UI.rushResult(win,first),win?1600:900);}
UI.rushResult=function(win,first){G.mode='over';Ads.banner(false);this.hud(false);const n=win?10:G.rushI;
 this.show(`<h2>${win?'🏆 ':''}${T('rush')}</h2><div class="tag">${T('rushDone').replace('{n}',n)}</div>
 <div class="tally"><div>${T('score')} <b>${G.score}</b></div><div>${T('rushBest')} <b>${SAVE.rushBest|0}</b></div><div>◆ <b>${G.credits}</b></div></div>
 ${first?`<div class="ok">${T('sk12')} ✓</div>`:''}<div class="sp"></div>
 <button class="b big" data-a="rush">↻ ${T('retry')}</button><div class="row"><button class="b" data-a="menu">${T('toMenu')}</button></div>`,'result');};
const _go=gameOver;gameOver=function(){if(!G.rushOn)return _go();if(G.mode!=='play')return;G.mode='over';AU.play(-1);AU.sfx('over');G.rushOn=false;rushEnd(false);};
// ---------- rewarded "free power-up at stage start" (opt-in, max 1/stage) ----------
function freePU(n,e){const old=document.getElementById('freePU');if(old)old.remove();if((!SAVE.tut&&n===1&&!e)||G.special||G.rushOn||!Ads.canReward())return;
 const b=document.createElement('button');b.id='freePU';b.className='b sm gold';b.innerHTML='▶ '+T('freePU');
 b.addEventListener('pointerdown',ev=>ev.stopPropagation());
 b.addEventListener('click',ev=>{ev.stopPropagation();if(G.freePU||G.mode!=='play')return;G.freePU=1;b.disabled=true;const m=G.mode;G.mode='adpause';
  Ads.rewarded().then(ok=>{b.remove();if(G.mode==='adpause')G.mode=m;if(ok){drop(P.x,P.y-120,'W');P.shield=Math.min(4,P.shield+1);AU.sfx('power');toast('+ '+T('freePU2'));}else toast(T('noVideo'));});});
 uiRoot().appendChild(b);setTimeout(()=>{if(b.isConnected&&!b.disabled)b.remove();},7000);}
const _hud=UI.hud;UI.hud=function(on){_hud.call(this,on);if(!on){const b=document.getElementById('freePU');if(b&&!b.disabled)b.remove();}};
// ---------- menu button + actions ----------
const _menu=UI.menu;UI.menu=function(){G.rushOn=false;_menu.call(this);const s=this.el(),row=s.querySelector('[data-a="map"]');if(!row)return;
 const ok=!!SAVE.cleared,b=document.createElement('button');b.className='b pink';b.dataset.a='rush';b.disabled=!ok;
 b.innerHTML=(ok?'⚔ ':'🔒 ')+T('rush')+(ok&&SAVE.rushBest?` · ${SAVE.rushBest|0}`:'');if(!ok)b.title=T('rushLock');
 b.addEventListener('click',()=>{AU.init();AU.sfx('ui');UI.act('rush',b);});row.parentNode.appendChild(b);};
const _act=UI.act;UI.act=function(a,b){if(a==='rush'){if(!SAVE.cleared){toast(T('rushLock'));return;}AU.init();this.hideAll();Ads.banner(false);rushBegin();return;}
 if(a==='skin'){const it=SKINS.find(x=>x.id===b.dataset.k);if(it&&it.ach){if(ACH[it.ach]()||SAVE.skins.includes(it.id)){if(!SAVE.skins.includes(it.id))SAVE.skins.push(it.id);SAVE.skin=it.id;persist();warmSkin();const sc=this.el().scrollTop;this.hangar();this.el().scrollTop=sc;}else toast(T('ach_'+it.ach));return;}}
 if(a==='menu'||a==='map')G.rushOn=false;return _act.call(this,a,b);};
// ---------- first-run drag tutorial (ghost finger) ----------
const FG=`<svg class="fg" viewBox="0 0 64 64"><circle cx="24" cy="10" r="9" fill="none" stroke="#9fe0ff" stroke-width="2.5" opacity=".8"/><path d="M19 10c0-3 5-3 5 0v20l3-1c0-3 5-3 5 0l3 0c0-3 5-3 5 0l3 1c0-2 5-2 5 1v14c0 8-5 14-14 14h-3c-6 0-9-3-12-8l-7-11c-2-3 2-6 5-3l2 3z" fill="rgba(255,255,255,.85)" stroke="#2a3a90" stroke-width="2"/></svg>`;
const TUT={on:false,t:0,el:null,
 need(){return !SAVE.tut&&!G.endless&&!G.rushOn&&G.stage===1;},
 start(){if(this.on)return;this.on=true;this.t=0;this.m=G.mode;G.mode='tut';this.inv=P.inv;P.inv=0;
  const d=document.createElement('div');d.id='tut';d.innerHTML=`<div class="tc"><b>${T('tutT')}</b>${T('tut1')}<br><small>${T('tut2')}</small></div>${FG}<div class="tb"><button class="b sm" data-x="skip">${T('skip')}</button><button class="b gold" data-x="ok">${T('tutOk')}</button></div>`;
  d.addEventListener('pointerdown',e=>e.stopPropagation());d.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>this.end()));
  uiRoot().appendChild(d);this.el=d;this.fg=d.querySelector('.fg');this.x0=P.x;this.y0=P.y;this.last=performance.now();requestAnimationFrame(()=>this.loop());},
 loop(){if(!this.on)return;const now=performance.now();this.t+=Math.min(.05,(now-this.last)/1000);this.last=now;const t=this.t%4,k=t<1?t:t<2?1-(t-1)*2:t<3?-1+(t-2):0;
  const yk=t<3?0:Math.sin((t-3)*Math.PI);P.x=P.tx=GW/2+k*GW*.3;P.y=P.ty=GH-190-yk*80;
  const r=uiRoot().getBoundingClientRect(),sx=r.width/GW,sy=r.height/GH;this.fg.style.left=(P.x*sx)+'px';this.fg.style.top=((P.y+44)*sy)+'px';
  requestAnimationFrame(()=>this.loop());},
 end(){if(!this.on)return;this.on=false;SAVE.tut=1;persist();if(this.el)this.el.remove();this.el=null;P.x=P.tx=GW/2;P.y=P.ty=this.y0;P.inv=Math.max(this.inv,1.5);if(G.mode==='tut')G.mode=this.m==='tut'?'play':this.m;}};
window.TUT=TUT;
const _ss2=startStage;startStage=function(n,e){_ss2(n,e);const f=/[?&]tut=1/.test(location.search);if(f)SAVE.tut=0;if(TUT.need())setTimeout(()=>{if(G.mode==='play'&&G.stage===1)TUT.start();},400);};
// debug helpers
if(window.DBG){DBG.rush=(i)=>{SAVE.cleared=1;rushBegin();if(i)rushNext(i);};DBG.tut=()=>{SAVE.tut=0;TUT.start();};}
})();
// Android back: close tutorial / ignore while a rewarded ad is open
(function(){const _b=UI.back;UI.back=function(){if(window.TUT&&TUT.on){TUT.end();return true;}if(G.mode==='adpause')return true;return _b.apply(this,arguments);};})();
