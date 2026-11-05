// Starzoomer — DOM menus / screens.
'use strict';
const MHUE=[275,20,195,40,320,215,165,8,95,300];
const UI={cur:null,
 el(){return $('scr');},
 show(html,cls){const s=this.el();s.className='scr '+(cls||'');s.innerHTML=html;s.style.display='flex';this.cur=cls;s.scrollTop=0;
  s.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{AU.init();AU.sfx('ui');this.act(b.dataset.a,b);}));},
 hideAll(){this.el().style.display='none';this.el().innerHTML='';this.cur=null;$('pz').style.display='none';},
 hud(on){$('hudb').style.display=on?'flex':'none';if(on){this.el().style.display='none';Ads.banner(false);}},
 ttl(){return`<div class="logo"><div class="l1">STAR</div><div class="l2">ZOOMER</div></div>`;},
 menu(){G.mode='menu';this.hud(false);if(BGS.i!==4)setBG(4);P.ship=SAVE.ship;P.alive=true;P.inv=0;clearAll();AU.play(50);Ads.banner(true);persist();
  this.show(`${this.ttl()}<div class="tag">${T('tag')}</div><div class="sp"></div>
  <button class="b big" data-a="play"><span class="dirg">▶</span> ${T('play')}${SAVE.far>=0?` · ${UI.isSpFar()?'★':T('stage')+' '+UI.furthest()}`:''}</button>
  <div class="row"><button class="b" data-a="map">${T('select')}</button></div>
  <div class="row mrow"><button class="b gold mb" data-a="hangar"><img src="${this.ico('C')}" alt="">${T('hangar')}</button><button class="b mb" data-a="missions"><img src="${this.ico('X')}" alt="">${T('missions')}${DAILY.badge()?'<i class="dot"></i>':''}</button></div>
  <div class="row"><button class="b sm" data-a="settings">⚙ ${T('settings')}</button></div>
  <div class="hi">${T('best')} <b>${SAVE.hi}</b> · ★ ${totStars()} · ◆ ${SAVE.cr}</div>
  <div class="studio"><img src="studio-logo.png" alt=""><span>P-Prece Studio</span></div>`,'menu');},
 // v26 staircase map: page p shows stages 10p+1..10p+10 with the Special Stage that follows them at the top; pager by tens
 furthest(){return SAVE.far>=0?(SAVE.far%11===0?10*(SAVE.far/11+1):stNum(SAVE.far)):Math.min(10,SAVE.reached);},
 isSpFar(){return SAVE.far>=0&&SAVE.far%11===0;},
 farPage(){return SAVE.far<0?0:this.isSpFar()?SAVE.far/11:Math.floor((stNum(SAVE.far)-1)/10);},
 map(pg){G.mode='menu';this.hud(false);Ads.banner(true);const maxP=this.farPage();const p=this.mapPage=Math.max(0,Math.min(DEBUG?999:maxP,pg===undefined?maxP:pg));
  const pager=`<div class="pager"><button class="b sm" data-a="mpg" data-i="${p-1}" ${p>0?'':'disabled'}><span class="dirg">◀</span></button><b>${T('stage')} ${10*p+1}–${10*p+10}</b><button class="b sm" data-a="mpg" data-i="${p+1}" ${(SAVE.far>=11*p||DEBUG)?'':'disabled'}><span class="dirg">▶</span></button></div>`;
  let h=`<div class="mtop"><div class="hd"><button class="b sm" data-a="menu"><span class="dirg">◀</span></button><h2>${T('select')}</h2><span class="cr"><span class="tst">★ ${totStars()}/30</span> ◆ ${SAVE.cr}</span></div>${pager}</div><div class="path" id="spath"><svg class="pl" id="spl"></svg>`;
  const tier=mapTier(p),seen=SAVE.mapSeen||0,fresh=seen&&SAVE.reached>seen&&SAVE.reached<=10?SAVE.reached:0;const lit=[];let cur=1;
  const starsRow=(st)=>[0,1,2].map(k=>`<img class="sti" src="${mapStarURL(k<st)}" alt="">`).join('');
  for(let j=1;j<=10;j++){const N=10*p+j;let lock,done,st=0,hu,act,nm,ti;
   if(N<=10){lock=N>SAVE.reached&&!DEBUG;st=SAVE.stars[N-1]||0;done=N<SAVE.reached||(N===10&&SAVE.cleared);ti=N-1;hu=MHUE[ti];act=`data-a="stage" data-i="${N}"`;nm=T('n'+N);}
   else{const s=secOf(N);lock=s>SAVE.far&&!DEBUG;done=s<SAVE.far;ti=bIdx(s);hu=MHUE[ti];act=`data-a="sec" data-i="${s}"`;nm=T('n'+(ti+1));}
   if(!lock)cur=j;lit[j]=done;
   const src=mapNodeURL(ti,tier,N,lock),cls=`snode ${lock?'lock':done?'done':'cur'}${N===fresh?' fresh':''}`;
   h+=`<button class="${cls}" ${act} ${lock?'disabled':''} style="--hu:${hu}"><img class="sv" src="${src}" alt="${N}" draggable="false">${!lock&&!done?`<img class="rk" src="${mapRocketURL()}" alt="" draggable="false"><img class="glw" src="${mapGlowURL(ti)}" alt="" draggable="false">`:''}<span class="lbl"><span class="nm">${nm}</span><span class="st">${N<=10?starsRow(st):''}</span></span></button>`;}
  const ss=11*p,eo=ss<=SAVE.far||DEBUG;lit[10]=eo;
  h+=`<button class="snode end ${eo?'':'lock'}" data-a="sec" data-i="${ss}" ${eo?'':'disabled'} style="--hu:45"><img class="sv" src="${mapSpecialURL(!eo)}" alt="★" draggable="false">${eo?`<img class="glw" src="${mapGlowURL(1)}" alt="" draggable="false">`:''}<span class="lbl"><span class="nm">${T('spStage')}</span><span class="st2">${T('spName')}</span></span></button></div>`;
  this.show(h,'map');SAVE.mapSeen=SAVE.reached;persist();this.mapLit=lit;this.mapCur=SAVE.far===ss?11:cur;this.mapLayout(this.mapCur);},
 mapLayout(cur){const pth=$('spath');if(!pth)return;document.body.classList.toggle('lowq',QUAL===0);const W=pth.clientWidth,step=Math.max(112,Math.min(150,innerHeight*.17)),top=200,H=top+10*step+70;pth.style.height=H+'px';
  const X=[.3,.5,.7,.5],rtl=document.documentElement.dir==='rtl',pos=[];
  for(let i=1;i<=10;i++){let x=X[(i-1)%4];if(rtl)x=1-x;pos[i]={x:Math.round(W*.5+(x-.5)*Math.min(W,520)),y:top+(10-i)*step+step*.5};}
  pos[11]={x:Math.round(W/2),y:72};
  const ns=pth.querySelectorAll('.snode');ns.forEach((n,k)=>{const p=pos[k+1];n.style.left=p.x+'px';n.style.top=p.y+'px';});
  const L=this.mapLit||[];let s='';for(let i=1;i<=10;i++){const a=pos[i],b=pos[i+1],lit=!!L[i],my=(a.y+b.y)/2,d=`M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
   s+=`${lit?`<path d="${d}" class="pgw" style="--hu:${MHUE[i-1]}"/>`:''}<path d="${d}" class="pg ${lit?'lit':''}" style="--hu:${MHUE[i-1]}"/><path d="${d}" class="pd ${lit?'lit':''}"/>`;}
  const sv=$('spl');sv.setAttribute('width',W);sv.setAttribute('height',H);sv.innerHTML=s;
  const sc=this.el();requestAnimationFrame(()=>{const p=pos[cur]||pos[1];sc.scrollTop=Math.max(0,pth.offsetTop+p.y-sc.clientHeight*.55);});},
 hangar(){G.mode='menu';this.hud(false);Ads.banner(true);const costs=[0,800,2000],req=[0,3,6];
  let h=`<div class="hd"><button class="b sm" data-a="menu"><span class="dirg">◀</span></button><h2>${T('hangar')}</h2><span class="cr">◆ ${SAVE.cr}</span></div><h3>${T('ships')}</h3><div class="ships">`;
  SHIPS.forEach((s,i)=>{const own=SAVE.ships[i],can=SAVE.reached>=req[i]||DEBUG;h+=`<div class="ship ${SAVE.ship===i?'sel':''}"><img src="${skinSet(i,SAVE.skin).b.c.toDataURL()}" alt=""><b>${s.n}</b><small>${T('sh'+(i+1))}</small>
   ${own?(SAVE.ship===i?`<span class="ok">${T('equipped')}</span>`:`<button class="b sm" data-a="equip" data-i="${i}">${T('equip')}</button>`):can?`<button class="b sm gold${SAVE.cr<costs[i]?' poor':''}" data-a="buyship" data-i="${i}">◆ ${costs[i]}</button>`:`<small class="lk">🔒 ${T('unlockAt').replace('{n}',req[i]-1)}</small>`}</div>`;});
  h+=`</div>${skinUI()}<h3>${T('upgrades')}</h3><div class="upg">`;
  UPG.forEach(u=>{const lv=SAVE.upg[u.k],mx=u.cost.length,c=u.cost[lv],nb=this.bought===u.k;h+=`<div class="u${nb?' bought':''}"><img class="ui" src="${this.ico(u.ic)}" alt=""><span class="un"><b>${T(u.n)}</b><small>${u.fx(lv)}${lv<mx?' <span class="dirg">→</span> '+u.fx(lv+1):''}</small><span class="pips">${Array.from({length:mx},(_,j)=>`<i class="${j<lv?'on':''}${nb&&j===lv-1?' pop':''}"></i>`).join('')}</span></span>${lv>=mx?`<span class="ok">${T('max')}</span>`:`<button class="b sm gold" data-a="upg" data-k="${u.k}" ${SAVE.cr<c?'disabled':''}>◆ ${c}</button>`}${nb?`<span class="fly">-◆${this.boughtC}</span>`:''}</div>`;});
  this.show(h+'</div>','hangar');this.bought=null;this.SC=costs;},
 ico(k){const c=this._ic||(this._ic={});return c[k]||(c[k]=ART.spr.pu[k].c.toDataURL());},
 missions(){G.mode='menu';this.hud(false);Ads.banner(true);const D=DAILY.roll(),ln=DAILY.loginDay(),cd=ln||D.ls;
  let h=`<div class="hd"><button class="b sm" data-a="menu"><span class="dirg">◀</span></button><h2>${T('missions')}</h2><span class="cr">◆ ${SAVE.cr}</span></div>
  <h3>${T('daily')}</h3><div class="login"><div class="days">${DAILY.LOGIN.map((v,j)=>{const d=j+1,st=ln?(d<ln?'got':d===ln?'now':''):(d<=cd?'got':'');return`<div class="dy ${st}"><small>${T('day').replace('{n}',d)}</small><img src="${this.ico('C')}" alt=""><b>${v}</b></div>`;}).join('')}</div>
  ${ln?`<button class="b gold" data-a="login">${T('claim')} ◆ ${DAILY.LOGIN[ln-1]}</button>`:`<span class="ok">✓ ${T('claimed')}</span>`}</div>
  <h3>${T('missions')}</h3><div class="msn">`;
  const IC={kill:'H',coin:'C',pu:'L',stage:'W',boss:'B',nodmg:'P'};
  D.m.forEach((m,i)=>{const f=Math.min(1,m.p/m.n),rd=m.p>=m.n&&!m.c;h+=`<div class="mi ${m.c?'done':rd?'rdy':''}"><img class="ui" src="${this.ico(IC[m.id])}" alt=""><span class="mt"><b>${T('m_'+m.id).replace('{n}',m.n)}</b><span class="bar"><i style="width:${(f*100).toFixed(1)}%"></i><em>${m.p} / ${m.n}</em></span></span>${m.c?`<span class="ok">✓</span>`:`<button class="b sm gold" data-a="mclaim" data-i="${i}" ${rd?'':'disabled'}>◆ ${m.r}</button>`}</div>`;});
  this.show(h+`</div><div class="tmr">${T('newTomorrow')}</div>`,'missions');},
 reward(v){AU.sfx('coin');AU.sfx('power');vib(40);toast('+◆ '+v);},
 settings(from){this.from=from||'menu';const tg=(k,n)=>`<div class="set"><span>${T(n)}</span><button class="tg ${SAVE[k]?'on':''}" data-a="tog" data-k="${k}">${SAVE[k]?'ON':'OFF'}</button></div>`;
  const langs=Object.keys(LANG_NAMES).map(l=>`<option value="${l}" ${l===LANG&&(()=>{try{return localStorage.getItem('rsb_lang');}catch(e){return null;}})()?'selected':''}>${LANG_NAMES[l]}</option>`).join('');
  this.show(`<div class="hd"><button class="b sm" data-a="back"><span class="dirg">◀</span></button><h2>${T('settings')}</h2><span></span></div><div class="sets">
  <div class="set hlp"><span>🤖 ${T('helper')}<small class="sd">${T('helperD')}</small></span><button class="tg ${SAVE.helper?'on':''}" data-a="tog" data-k="helper">${SAVE.helper?'ON':'OFF'}</button></div>${tg('snd','sound')}${tg('mus','music')}${tg('vib','vibration')}${tg('shake','shake')}
  <div class="set"><span>${T('quality')}</span><select id="sQ">${['auto','low','high'].map(q=>`<option value="${q}" ${SAVE.q===q?'selected':''}>${T('q_'+q)}</option>`).join('')}</select></div>
  <div class="set"><span>${T('language')}</span><select id="sL"><option value="auto">${T('auto')}</option>${langs}</select></div></div>
  <div class="howto">${T('howto')}</div>
  <div class="studio big"><img src="studio-logo.png" alt=""><span>${T('madeBy')} <b>P-Prece Studio</b><br>พีพีช Studio</span></div><a class="priv" href="privacy.html" target="_blank">${T('privacy')}</a>`,'settings');
  $('sQ').onchange=e=>{SAVE.q=e.target.value;persist();setQuality();};
  $('sL').onchange=e=>{const v=e.target.value;try{if(v==='auto')localStorage.removeItem('rsb_lang');else localStorage.setItem('rsb_lang',v);}catch(_){}LANG=v==='auto'?detectLang():v;applyLang();this.settings(this.from);};},
 // v29: no banner on result screens (keeps ads far from Next/Retry; avoids accidental clicks)
 result(win,o){Ads.banner(false);this.hud(false);const s=G.stage;const canR=Ads.canReward();
  const sc=`<div class="res"><div class="rs">${T('score')} <b>${G.score}</b></div><div class="rs">${T('credits')} <b>◆ ${G.credits}</b></div><div class="rs">${T('best')} <b>${G.endless?SAVE.hi:SAVE.best[s-1]||0}</b></div></div>`;
  if(win){FX.fw=4;const L=G.tally||{base:G.score,kb:0,cr:G.credits,bk:'comboBonus',bv:0,tot:G.score};const inst=!!this.tallyDone;
   const row=(lab,v,pre,cls)=>`<div class="tr ${cls||''} ${inst?'in done':''}" data-v="${v}" data-p="${pre||''}"><span>${lab}</span><b>${inst?(pre||'')+v:''}</b></div>`;
   this.show(`<div class="burst"></div>${G.special?`<div class="spbadge">★ ${T('spStage')} ★</div>`:''}<h2 class="big gold">${G.special?'':`<small class="rsn">${T('stage')} ${G.endless?stNum(G.sector-1):s}</small><br>`}${T('clear')}</h2><div class="tally">${row(T('score'),L.base)}${row(T('killBonus'),L.kb,'+')}${row(T('credits'),L.cr,'◆ ','crr')}${row(T(L.bk),L.bv,'+')}<i class="tl"></i>${row(T('total'),L.tot,'','tot')}</div>
   <div class="stars ${inst?'':'hid'}"${G.endless?' style="display:none"':''}>${[1,2,3].map(k=>`<span class="${k<=o.stars?'on':''}">★</span>`).join('')}</div>${o.sb||G.starBonus?`<div class="sbn ${inst?'':'hid'}">${T(G.special?'spBonus':'starBonus')} <b>+◆ ${o.sb||G.starBonus}</b></div>`:''}<div class="nb ${o.nb&&inst?'':'hid'}">${T('newBest')}</div>
   <div class="tsk ${inst?'hid':''}">${T('tapSkip')}</div><div class="after ${inst?'':'hid'}">${canR&&G.credits>0?`<button class="b pink" data-a="dbl"><span class="dirg">▶</span> ${T('double')}</button>`:''}
   <button class="b big" data-a="next">${T('next')} <span class="dirg">▶</span></button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div></div>`,'result');
   if(!inst)this.countUp(o);}
  else this.show(`<h2 class="big red">${T('gameover')}</h2>${sc}${!G.contUsed&&canR?`<button class="b pink" data-a="cont"><span class="dirg">▶</span> ${T('revive')}</button>`:''}
   <button class="b big" data-a="retry">${T('retry')}</button><div class="row"><button class="b sm" data-a="hangar">${T('hangar')}</button><button class="b sm" data-a="map">${T('map')}</button></div>`,'result');
  },
 // score tally: each line pops in and counts up with ticks; tap skips to the end
 countUp(o){const rows=[...document.querySelectorAll('.tally .tr')],scr=this.el();let i=-1,t0=0,raf=0,dead=false;
  const fmt=(r,v)=>r.dataset.p+Math.round(v);
  const end=()=>{if(dead)return;dead=true;cancelAnimationFrame(raf);rows.forEach(r=>{r.classList.add('in','done');r.querySelector('b').textContent=fmt(r,+r.dataset.v);});
   this.tallyDone=true;scr.onpointerdown=null;const q=c=>scr.querySelector(c);q('.stars').classList.remove('hid');o.nb&&q('.nb').classList.remove('hid');const sb=q('.sbn');sb&&setTimeout(()=>sb.classList.remove('hid'),600);for(let k=0;k<(o.stars||0);k++)setTimeout(()=>AU.sfx('coin'),120+k*180);q('.tsk').classList.add('hid');
   setTimeout(()=>{const a=q('.after');a&&a.classList.remove('hid');},350);AU.sfx('power');};
  const step=now=>{if(dead||this.cur!=='result')return;if(i<0||now-t0>(rows[i].classList.contains('tot')?900:640)){if(i>=0){rows[i].classList.add('done');rows[i].querySelector('b').textContent=fmt(rows[i],+rows[i].dataset.v);AU.sfx('coin');}
    i++;if(i>=rows.length){end();return;}rows[i].classList.add('in');t0=now;}
   const r=rows[i],d=r.classList.contains('tot')?750:480,k=Math.min(1,(now-t0)/d),v=+r.dataset.v*(1-Math.pow(1-k,3));r.querySelector('b').textContent=fmt(r,v);if(k<1&&+r.dataset.v>0)AU.sfx('tick');raf=requestAnimationFrame(step);};
  setTimeout(()=>{raf=requestAnimationFrame(step);},350);
  setTimeout(()=>{scr.onpointerdown=e=>{if(!e.target.closest('button'))end();};},150);},
 victory(){G.mode='menu';this.hud(false);Ads.banner(true);FX.fw=5;AU.sfx('clear');AU.sfx('power');
  this.show(`<div class="burst"></div><div class="vbadge">★ ★ ★</div>
  <h2 class="big gold vtitle">${T('allClear')}</h2>
  <p class="vsub">${T('victorySub')}</p>
  <div class="vunlock">★ ${T('spStage')} <span class="dirg">→</span> ${T('stage')} 11</div>
  <button class="b big pink" data-a="toEndless"><span class="dirg">▶</span> ${T('toEndless')}</button>`,'victory');},
 warpTo(n){prewarm(n-1,n-1);WARP.start(n,false,()=>startStage(n));},
 endlessNext(){WARP.start(0,true,()=>startStage(0,true));},
 pause(){if(G.mode!=='play')return;G.mode='paused';$('pz').style.display='flex';$('pz').innerHTML=`<h2>${T('paused')}</h2><button class="b big" data-pa="resume"><span class="dirg">▶</span> ${T('resume')}</button><button class="b" data-pa="restart">${T('restart')}</button><button class="b" data-pa="quit">${T('quit')}</button>
  <div class="row"><button class="tg ${SAVE.snd?'on':''}" data-pa="snd">♪ ${T('sound')}</button><button class="tg ${SAVE.mus?'on':''}" data-pa="mus">♫ ${T('music')}</button></div>`;
  $('pz').querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{AU.sfx('ui');const k=b.dataset.pa;if(k==='resume'){$('pz').style.display='none';G.mode='play';last=performance.now();AU.init();}
   else if(k==='restart'){$('pz').style.display='none';G.fresh=true;startStage(G.endless?0:G.stage,G.endless);}else if(k==='quit'){$('pz').style.display='none';this.map();}
   else{SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();this.pause2();}});},
 pause2(){G.mode='play';this.pause();},
 pauseToggle(){if(G.mode==='play')this.pause();else if(G.mode==='paused'){$('pz').style.display='none';G.mode='play';AU.init();}},
 begin(n){this.hideAll();G.fresh=true;startStage(n);},
 beginSec(s){this.hideAll();G.fresh=true;G.sector=Math.max(0,s);startStage(0,true);},
 act(a,b){const i=+b.dataset.i;
  switch(a){
   case'play':if(SAVE.far>=0&&SAVE.cleared)this.beginSec(SAVE.far);else this.begin(Math.min(SAVE.reached,10));break;case'map':this.map();break;case'mpg':this.map(i);break;case'sec':this.beginSec(i);break;case'hangar':this.hangar();break;case'menu':this.menu();break;
   case'settings':this.settings(this.cur);break;case'back':this.from==='map'?this.map():this.menu();break;
   case'stage':this.begin(i);break;
   case'tog':{const k=b.dataset.k;SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();if(k==='mus'&&SAVE.mus){AU.songId=-2;AU.play(50);}this.settings(this.from);break;}
   case'equip':SAVE.ship=i;persist();P.ship=i;this.hangar();break;
   case'buyship':if(SAVE.cr>=this.SC[i]){SAVE.cr-=this.SC[i];SAVE.ships[i]=1;SAVE.ship=i;persist();AU.sfx('power');}else toast(T('needCr'));this.hangar();break;
   case'upg':{const k=b.dataset.k,u=UPG.find(x=>x.k===k),c=u&&u.cost[SAVE.upg[k]];if(c&&SAVE.cr>=c){SAVE.cr-=c;SAVE.upg[k]++;persist();AU.sfx('power');AU.sfx('coin');vib(40);this.bought=k;this.boughtC=c;}else toast(T('needCr'));this.hangar();break;}
   case'missions':this.missions();break;
   case'login':{const v=DAILY.claimLogin();if(v)this.reward(v);this.missions();break;}
   case'mclaim':{const v=DAILY.claim(i);if(v)this.reward(v);this.missions();break;}
      case'next':if(G.endless){b.disabled=true;Ads.interThen(stNum(G.sector-1),()=>this.endlessNext());}else if(G.stage>=10){this.victory();}else{const n=G.stage+1;b.disabled=true;Ads.interThen(G.stage,()=>this.warpTo(n));}break;
   case'toEndless':b.disabled=true;G.sector=0;G.fresh=true;Ads.interThen(Math.max(G.stage,10),()=>{this.hideAll();WARP.start(0,true,()=>startStage(0,true));});break;
   case'retry':G.fresh=true;startStage(G.endless?0:G.stage,G.endless);break;
   case'dbl':b.disabled=true;Ads.rewarded().then(ok=>{if(ok){SAVE.cr+=G.credits;G.credits*=2;persist();AU.sfx('coin');toast('◆ x2');}else toast(T('noVideo'));this.result(true,{stars:G.endless?0:SAVE.stars[G.stage-1]||1});});break;
   case'cont':b.disabled=true;Ads.rewarded().then(ok=>{if(ok)revive();else{toast(T('noVideo'));b.disabled=false;}});break;}}};
// Back button (Android bridge calls window.onAndroidBack(); browsers: history trap + Escape). Returns true when handled.
UI.back=function(){const m=G.mode,c=this.cur;if(document.querySelector('.adMock.adI'))return true;
 if(m==='warp'){WARP.skip();return true;}if(m==='play'){this.pause();return true;}if(m==='paused'){$('pz').style.display='none';G.mode='play';last=performance.now();AU.init();return true;}
 if(c==='settings'){this.from==='map'?this.map():this.menu();return true;}if(c==='map'||c==='hangar'||c==='missions'||c==='victory'){this.menu();return true;}if(c==='result'){this.map();return true;}return false;};
window.onAndroidBack=()=>UI.back();
addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='GoBack'){UI.back();e.preventDefault();}});
try{if(!window.AndroidAds||window.__adTest){history.pushState({rsb:1},'');addEventListener('popstate',()=>{if(UI.back())history.pushState({rsb:1},'');});}}catch(e){}
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1800);}
function applyLang(){document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';$('bombB').title=T('bomb');}
// ---------- boot ----------
function boot(){applyLang();buildArt();setQuality();setBG(4,1);$('pauseB').onclick=()=>{AU.init();UI.pauseToggle();};
 $('bombB').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();AU.init();useBomb();});
 document.fonts&&document.fonts.load('10px PS2P').then(()=>{});UI.menu();requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame);});
 if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
 document.addEventListener('pointerdown',()=>AU.init(),{once:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
addEventListener('resize',()=>{if(UI.cur==='map')UI.mapLayout(UI.mapCur||1);});
