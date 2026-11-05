// Starzoomer — original game by P-Prece Studio (พีพีช Studio). All art is procedural canvas drawing; all music/SFX are WebAudio synthesis.
'use strict';
const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);
const DEBUG=Q.get('debug')==='1';
// ================= AD CONFIG (edit here before release) =================
// Exactly 3 AdMob ad units (this app's REAL IDs, reference only).
// Web/browser never loads AdMob (only ?test=1 mock); the Android app uses native IDs from admob.properties.
// The Android side reads them via AndroidAds.configure(json) if it implements it.
window.RSB_AD_UNITS=window.RSB_AD_UNITS||{
 banner:      'ca-app-pub-7699488633919663/2653909373', // rsb_banner_menu      (REAL)
 interstitial:'ca-app-pub-7699488633919663/4203416882', // rsb_inter_stage_end  (REAL)
 rewarded:    'ca-app-pub-7699488633919663/4011845197'  // rsb_reward_continue  (REAL)
};
// Ad preview mode: ?test=1 shows labelled mock ads at each placement (no real ads). Persists in localStorage
// (survives reloads / home-screen launch); ?test=0 turns it off. &fill=fail|nofill simulates failures; &fast=0 = realistic interstitial cap.
(function(){let ls={};try{ls=JSON.parse(localStorage.getItem('rsb_adtest')||'null')||{};}catch(e){}
 if(Q.get('test')==='0'){try{localStorage.removeItem('rsb_adtest');}catch(e){}return;}
 if(Q.get('test')==='1'){ls={on:1,fill:Q.get('fill')||'ok',fast:Q.get('fast')==='0'?0:1};try{localStorage.setItem('rsb_adtest',JSON.stringify(ls));}catch(e){}}
 if(!ls.on||window.AndroidAds)return;const fill=ls.fill||'ok';window.__adTest={fast:ls.fast!==0,fill};
 const box=(cls,txt)=>{const d=document.createElement('div');d.className='adMock '+cls;d.innerHTML=txt;document.body.appendChild(d);return d;};let bn=null;
 window.__adLog=[];const lg=k=>window.__adLog.push([k,Date.now()]);
 window.AndroidAds={configure(){},
  showBanner(){lg('banner');if(fill!=='ok')return;if(!bn)bn=box('adB','AD TEST · Banner &nbsp;<b>rsb_banner_menu</b>&nbsp; 320×50');bn.style.display='flex';},
  hideBanner(){if(bn)bn.style.display='none';},
  showInterstitial(){lg('inter');if(fill!=='ok'){setTimeout(()=>window.onInterstitialClosed&&window.onInterstitialClosed(),300);return;}if(document.querySelector('.adMock.adI'))return;const d=box('adI','<div><div class="adT">AD TEST · Interstitial</div><b>rsb_inter_stage_end</b><br><small>full screen · after the stage-clear panel, before the warp (from stage 3, 90 s+ apart)</small></div><button class="adX">✕</button>');d.querySelector('button').onclick=()=>{d.remove();window.onInterstitialClosed&&window.onInterstitialClosed();};},
  isRewardedReady(){return fill!=='nofill';},
  showRewarded(){lg('reward');if(fill==='fail'){setTimeout(()=>window.onRewardedFailed&&window.onRewardedFailed(),200);return true;}
   const d=box('adI','<div><div class="adT">AD TEST · Rewarded</div><b>rsb_reward_continue</b><br><small>x2 coins (stage clear) · continue with shield (game over) · max 2 per stage</small><br><br><span class="adW">▶ watching… 3</span><br><button class="adC" disabled>Claim reward</button><br><button class="adS">Skip (no reward)</button></div>');
   let n=3;const w=d.querySelector('.adW'),c=d.querySelector('.adC');const iv=setInterval(()=>{n--;if(n>0)w.textContent='▶ watching… '+n;else{clearInterval(iv);w.textContent='✓ finished';c.disabled=false;}},1000);
   c.onclick=()=>{d.remove();window.onRewardEarned&&window.onRewardEarned();window.onRewardedClosed&&window.onRewardedClosed();};
   d.querySelector('.adS').onclick=()=>{clearInterval(iv);d.remove();window.onRewardedClosed&&window.onRewardedClosed();};return true;}};
 const st=document.createElement('style');st.textContent='.adMock{position:fixed;z-index:2147483000;display:flex;align-items:center;justify-content:center;text-align:center;font:600 13px system-ui,sans-serif;color:#fff}.adB{left:0;right:0;bottom:env(safe-area-inset-bottom);height:56px;background:repeating-linear-gradient(45deg,#2a7a3a,#2a7a3a 10px,#2f8a42 10px,#2f8a42 20px);border-top:2px dashed #fff;pointer-events:none}.adI{inset:0;background:rgba(10,40,20,.97);font-size:18px;padding:20px}.adT{font-size:22px;font-weight:900;color:#ffe27a;margin-bottom:8px}.adI button{font:700 16px system-ui;border:0;border-radius:14px;padding:10px 18px;margin-top:8px}.adX{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;padding:0!important;border-radius:22px!important}.adC{background:#ffd23f}.adC:disabled{opacity:.4}.adS{background:#555;color:#fff}'
 +'#adChip{position:fixed;z-index:2147483001;top:calc(1px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:800 10px system-ui;color:#000;background:#ffd23f;border-radius:0 0 10px 10px;padding:2px 9px;opacity:.92;border:1px solid #000;box-shadow:0 2px 6px rgba(0,0,0,.5)}#adPan{position:fixed;z-index:2147483001;top:calc(22px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);background:rgba(0,0,0,.88);border:1px solid #ffd23f;border-radius:14px;padding:8px;display:none;flex-direction:column;gap:6px;width:200px}#adPan.on{display:flex}#adPan button{font:700 13px system-ui;border:0;border-radius:10px;padding:9px;background:#2f8a42;color:#fff}#adPan .off{background:#7a2a2a}';
 document.head.appendChild(st);
 const ui=()=>{const ch=document.createElement('button');ch.id='adChip';ch.textContent='AD TEST MODE ▾';const pn=document.createElement('div');pn.id='adPan';
  pn.innerHTML='<button data-k="b">Show / hide banner</button><button data-k="i">Show interstitial</button><button data-k="r">Show rewarded</button><button data-k="o" class="off">Turn test mode off</button>';
  ch.onclick=e=>{e.stopPropagation();pn.classList.toggle('on');};pn.onclick=e=>{const k=e.target.dataset&&e.target.dataset.k;if(!k)return;e.stopPropagation();pn.classList.remove('on');
   if(k==='b'){if(bn&&bn.style.display!=='none')AndroidAds.hideBanner();else AndroidAds.showBanner();}
   else if(k==='i')AndroidAds.showInterstitial();
   else if(k==='r'){window.onRewardEarned=()=>{try{toast('Reward granted (test)');}catch(e){}};window.onRewardedClosed=()=>{window.onRewardEarned=null;};AndroidAds.showRewarded();}
   else if(k==='o'){try{localStorage.removeItem('rsb_adtest');}catch(e){}location.href=location.pathname+'?test=0';}};
  ['pointerdown','touchstart'].forEach(ev=>{ch.addEventListener(ev,e=>e.stopPropagation());pn.addEventListener(ev,e=>e.stopPropagation());});
  document.body.appendChild(ch);document.body.appendChild(pn);};
 if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);})();
try{window.AndroidAds&&AndroidAds.configure&&AndroidAds.configure(JSON.stringify(window.RSB_AD_UNITS));}catch(e){}
const LOG=(...a)=>{try{console.log('[Starzoomer]',...a);}catch(e){}};
// ---------- Save ----------
// v29: storage wrapper — localStorage when it works, in-memory fallback (private mode / quota / disabled storage) so the game never crashes.
const STORE={mem:{},ok:(()=>{try{const k='__sz_t';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch(e){return false;}})(),
 get(k){if(this.ok){try{return localStorage.getItem(k);}catch(e){this.ok=false;}}return Object.prototype.hasOwnProperty.call(this.mem,k)?this.mem[k]:null;},
 set(k,v){this.mem[k]=String(v);if(this.ok){try{localStorage.setItem(k,v);}catch(e){this.ok=false;}}}};
const SAVE=(()=>{let s={};try{s=JSON.parse(STORE.get('rsb_save')||'{}');}catch(e){}
 if(!s||typeof s!=='object'||Array.isArray(s))s={};
 const d={v:2,reached:1,stars:[],best:[],hi:0,cr:0,ships:[1,0,0],ship:0,upg:{},snd:1,mus:1,vib:1,shake:1,q:'auto',diff:1,endBest:0,cleared:0,dly:null,far:-1};
 const mig=s.far===undefined;
 for(const k in d)if(s[k]===undefined)s[k]=d[k];
 // v17 save v2: 6 upgrades x up to 5 levels; older saves (v1, 4 upgrades x 4 levels) keep their levels and coins
 if(!s.upg||typeof s.upg!=='object')s.upg={};for(const k of['rate','dmg','shd','mag','life','pwr'])s.upg[k]=Math.max(0,Math.min(k==='life'?2:5,(s.upg[k]|0)));
 s.cr=Math.max(0,+s.cr||0);
 if(!s.dly||typeof s.dly!=='object')s.dly={d:0,hi:0,m:[],ld:0,ls:0};s.v=2;
 // v26 migration: old Endless best sector k -> unlocked numbered stage 10+k; cleared stage 10 -> Special + stage 11 path unlocked
 if(mig){let f=(s.cleared||s.reached>10)?0:-1;if((s.endBest|0)>0){const m=(s.endBest|0)-1;f=Math.max(f,1+m+Math.floor(m/10));}s.far=f;}if((s.far|0)>=0&&!s.cleared)s.cleared=1;s.far=s.far|0;return s;})();
// ---------- permanent upgrades (hangar shop). Small bonuses so auto-difficulty balance holds ----------
const UPG=[
 {k:'dmg',n:'damage',ic:'H',cost:[120,280,520,860,1300],fx:l=>'+'+l*6+'%'},
 {k:'rate',n:'fireRate',ic:'S',cost:[120,280,520,860,1300],fx:l=>'+'+l*6+'%'},
 {k:'shd',n:'shield',ic:'P',cost:[150,350,650,1000,1500],fx:l=>'+'+[0,1,1,2,2,3][l]},
 {k:'mag',n:'magnet',ic:'M',cost:[100,220,420,700,1050],fx:l=>'+'+l*20+'%'},
 {k:'pwr',n:'puTime',ic:'X',cost:[100,240,450,750,1100],fx:l=>'+'+l*8+'%'},
 {k:'life',n:'lives',ic:'U',cost:[600,1500],fx:l=>'+'+l}];
const UPF={dmg:()=>1+SAVE.upg.dmg*.06,rate:()=>1+SAVE.upg.rate*.06,shd:()=>[0,1,1,2,2,3][SAVE.upg.shd],mag:()=>1+SAVE.upg.mag*.2,pwr:()=>1+SAVE.upg.pwr*.08,life:()=>SAVE.upg.life};
// ---------- daily missions + login streak (device local date; never goes backwards) ----------
const DAILY={
 POOL:[{id:'kill',n:[40,80,120],r:[40,70,100]},{id:'coin',n:[60,120],r:[40,70]},{id:'pu',n:[4,8],r:[40,70]},{id:'stage',n:[1,2],r:[50,90]},{id:'boss',n:[1],r:[90]},{id:'nodmg',n:[1],r:[100]}],
 LOGIN:[20,30,40,50,60,80,120],
 today(){const n=new Date();return Math.floor(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5);},
 // v29: if the stored day is ahead of today (clock moved forward then back) reset to today instead of getting stuck
 eff(){const D=SAVE.dly,t=this.today();if((D.hi||0)>t){D.hi=t;if((D.ld||0)>t)D.ld=t;if((D.d||0)>t)D.d=0;}return Math.max(t,D.hi||0);},
 roll(){const D=SAVE.dly,e=this.eff();if(e>D.hi)D.hi=e;
  if(e!==D.d||!Array.isArray(D.m)||D.m.length!==3){let r=(e*2654435761)>>>0||7;const R=()=>{r=(r*1103515245+12345)>>>0;return((r>>>8)&0xffff)/65536;};
   const ids=this.POOL.slice();const m=[];while(m.length<3){const P=ids.splice(Math.floor(R()*ids.length),1)[0],j=Math.floor(R()*P.n.length);m.push({id:P.id,n:P.n[j],r:P.r[j],p:0,c:0});}
   D.d=e;D.m=m;persist();}return D;},
 track(id,a){const D=SAVE.dly;if(!D.m||D.d!==D.hi)return;for(const m of D.m)if(m.id===id&&!m.c&&m.p<m.n){m.p=Math.min(m.n,m.p+(a||1));if(m.p>=m.n&&id!=='kill'&&id!=='coin')persist();}},
 loginDay(){const D=SAVE.dly,e=this.eff();if(e<=D.ld)return 0;return e-D.ld===1?(D.ls%7)+1:1;},
 claimLogin(){const n=this.loginDay();if(!n)return 0;const v=this.LOGIN[n-1];const D=SAVE.dly;D.ld=this.eff();D.ls=n;SAVE.cr+=v;persist();return v;},
 claim(i){const m=SAVE.dly.m[i];if(!m||m.c||m.p<m.n)return 0;m.c=1;SAVE.cr+=m.r;persist();return m.r;},
 badge(){this.roll();return !!this.loginDay()||SAVE.dly.m.some(m=>!m.c&&m.p>=m.n);}};
function persist(){try{STORE.set('rsb_save',JSON.stringify(SAVE));}catch(e){}}
// v29: flush progress (incl. kill/coin mission counters that are not saved per kill) when the page is hidden or closed
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});addEventListener('pagehide',()=>persist());
// ---------- Ads (AndroidAds bridge, same conventions as earlier P-Prece games; web stub grants rewards) ----------
const Ads={lastInter:Date.now(),minGap:90000,cleared:0,stageRewards:0,
 // (a) banner: menus/map/hangar/settings/result only; hidden in gameplay & warp. Body class reserves a bottom strip so it never covers buttons.
 banner(show){try{if(window.AndroidAds){show?AndroidAds.showBanner&&AndroidAds.showBanner():AndroidAds.hideBanner&&AndroidAds.hideBanner();document.body.classList.toggle('banner',!!show);}}catch(e){}},
 // (b) interstitial: only between stages (after the score panel, before the warp), from stage 3, >=90 s apart and >=90 s after app start.
 interThen(stageNo,cb){let done=false;const go=()=>{if(done)return;done=true;window.onInterstitialClosed=null;document.removeEventListener('visibilitychange',vis);clearTimeout(tm);cb();};
  const vis=()=>{if(!document.hidden)setTimeout(go,300);};let tm=0;
  if(!this.maybeInterstitial(stageNo)||!window.AndroidAds){go();return;}
  window.onInterstitialClosed=go;document.addEventListener('visibilitychange',vis);tm=setTimeout(go,window.__adTest?600000:45000);},
 maybeInterstitial(stageNo){if(stageNo<3||G.mode==='warp')return false;const n=Date.now();
  if(window.__adTest&&__adTest.fast){if(n-this.lastInter<2500)return false;}else if(n-this.lastInter<this.minGap)return false;this.lastInter=n;
  try{if(window.AndroidAds&&AndroidAds.showInterstitial){AndroidAds.showInterstitial();}else LOG('AdsStub: interstitial (no ad on web)');}catch(e){}return true;},
 canReward(){return this.stageRewards<2;},
 rewarded(){this.stageRewards++;return new Promise(res=>{if(!(window.AndroidAds&&AndroidAds.showRewarded)){LOG('AdsStub: rewarded granted without ad');setTimeout(()=>res(true),300);return;}
   let done=false,earned=false,tm=0;const fin=ok=>{if(done)return;done=true;clearTimeout(tm);['onRewardedResult','onRewardEarned','onRewardedClosed','onRewardedFailed'].forEach(k=>window[k]=null);res(!!ok);};
   try{if(AndroidAds.isRewardedReady&&!AndroidAds.isRewardedReady()){fin(false);return;}}catch(e){}
   window.onRewardedResult=ok=>fin(ok);window.onRewardEarned=()=>{earned=true;};window.onRewardedClosed=()=>setTimeout(()=>fin(earned),50);window.onRewardedFailed=()=>fin(false);
   tm=setTimeout(()=>fin(earned),90000);try{const r=AndroidAds.showRewarded();if(r===false)fin(false);}catch(e){fin(false);}});}};
// ---------- Audio ----------
// Every voice: osc -> env gain -> music/sfx gain -> bus (headroom .55) -> compressor -> limiter -> tanh soft-clip -> out.
// Envelopes always ramp (attack >= 6 ms, release >= 25 ms), polyphony capped, finished nodes disconnected.
const AU={ac:null,on:false,voices:0,maxVoices:40,next:0,step:0,song:null,songId:-1,lastSfx:{},
 build(ac){this.ac=ac;const bus=ac.createGain();bus.gain.value=.55;
  const c=ac.createDynamicsCompressor();c.threshold.value=-16;c.knee.value=8;c.ratio.value=5;c.attack.value=.004;c.release.value=.18;
  const l=ac.createDynamicsCompressor();l.threshold.value=-4;l.knee.value=0;l.ratio.value=20;l.attack.value=.001;l.release.value=.08;
  const ws=ac.createWaveShaper();const n=1024,cu=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cu[i]=Math.tanh(x*1.1)/Math.tanh(1.1)*.97;}ws.curve=cu;
  bus.connect(c);c.connect(l);l.connect(ws);ws.connect(ac.destination);this.bus=bus;
  this.mg=ac.createGain();this.mg.gain.value=SAVE.mus?.42:0;this.mg.connect(bus);this.sg=ac.createGain();this.sg.gain.value=SAVE.snd?.8:0;this.sg.connect(bus);
  const nb=ac.createBuffer(1,ac.sampleRate*1,ac.sampleRate),d=nb.getChannelData(0);let r=12345;for(let i=0;i<d.length;i++){r=(r*1103515245+12345)&0x7fffffff;d[i]=r/0x3fffffff-1;}this.nb=nb;},
 init(){if(this.ac){if(this.ac.state==='suspended')this.ac.resume();return;}try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.build(new A({latencyHint:'interactive'}));this.on=true;if(this.ac.state==='suspended')this.ac.resume();if(this.songId>=0){const id=this.songId;this.songId=-2;this.play(id);}}catch(e){}},
 setVol(){if(!this.ac)return;const t=this.ac.currentTime;this.mg.gain.setTargetAtTime(SAVE.mus?.42:0,t,.05);this.sg.gain.setTargetAtTime(SAVE.snd?.8:0,t,.05);},
 env(g,t,a,h,r,v){a=Math.max(a,.006);r=Math.max(r,.025);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+h);g.gain.linearRampToValueAtTime(0,t+a+h+r);return t+a+h+r;},
 tone(dest,type,f,t,a,h,r,v,f2,filt){const ac=this.ac;if(this.voices>=this.maxVoices)return;this.voices++;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+h+r);let last=o;if(filt){const bq=ac.createBiquadFilter();bq.type='lowpass';bq.frequency.value=filt;bq.Q.value=2;o.connect(bq);last=bq;}
  last.connect(g);g.connect(dest);const end=this.env(g,t,a,h,r,v);o.start(t);o.stop(end+.02);o.onended=()=>{this.voices--;try{o.disconnect();g.disconnect();last!==o&&last.disconnect();}catch(e){}};},
 noise(dest,t,a,h,r,v,ftype,fq,fq2){const ac=this.ac;if(this.voices>=this.maxVoices)return;this.voices++;const s=ac.createBufferSource();s.buffer=this.nb;s.loop=true;const bq=ac.createBiquadFilter();bq.type=ftype||'lowpass';bq.frequency.setValueAtTime(fq||2000,t);
  if(fq2)bq.frequency.exponentialRampToValueAtTime(fq2,t+a+h+r);const g=ac.createGain();s.connect(bq);bq.connect(g);g.connect(dest);const end=this.env(g,t,a,h,r,v);s.start(t,Math.random()*.5);s.stop(end+.02);s.onended=()=>{this.voices--;try{s.disconnect();bq.disconnect();g.disconnect();}catch(e){}};},
 // layered explosion: sub-bass sine with pitch dive, filtered noise crack, low rumble tail. z=size 0..3, booms capped to 4 at once
 xp(D,t,z){const n=performance.now();this.bq=(this.bq||[]).filter(x=>x>n);if(this.bq.length>=4&&z<3)return;const L=[.45,.75,1.3,2.4][z];this.bq.push(n+L*600);const v=1+(Math.random()-.5)*.16,ac=this.ac;
  const S=[[.3,140,40,.08],[.42,120,32,.12],[.55,110,28,.2],[.62,100,24,.35]][z];
  if(this.voices<this.maxVoices){this.voices++;const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(S[1]*v,t);o.frequency.exponentialRampToValueAtTime(S[2]*v,t+S[3]);g.connect(D);o.connect(g);const e=this.env(g,t,.006,L*.12,L*.75,S[0]);o.start(t);o.stop(e+.02);o.onended=()=>{this.voices--;try{o.disconnect();g.disconnect();}catch(_){}};}
  this.noise(D,t,.004,.02,.09+z*.05,[.2,.26,.3,.32][z],'bandpass',3800*v,900);
  this.noise(D,t,.008,L*.15,L*.8,[.22,.3,.36,.4][z],'lowpass',(1600+z*500)*v,60);
  if(z>1){this.noise(D,t+.05,.12,L*.3,L,.2,'lowpass',300,40);this.tone(D,'sawtooth',55*v,t+.04,.03,L*.2,L*.6,.08,28,240);}
  if(z>2)[.18,.42,.7].forEach((d,i)=>this.noise(D,t+d,.01,.08,.5+i*.2,.22-i*.04,'lowpass',1400-i*300,70));},
 sfx(k){if(!this.ac||!SAVE.snd||this.ac.state!=='running')return;const t=this.ac.currentTime+.005,n=performance.now();const gap={shot:75,hit:45,pop:45,boom:80,bigboom:150,coin:50}[k]||30;if(this.lastSfx[k]&&n-this.lastSfx[k]<gap)return;this.lastSfx[k]=n;
  if(this.voices>this.maxVoices-6&&(k==='shot'||k==='hit'||k==='coin'))return;const D=this.sg;
  switch(k){
   case'shot':this.tone(D,'square',880,t,.006,.01,.04,.05,440,3000);break;
   case'laser':this.tone(D,'sawtooth',220,t,.01,.05,.06,.035,330,1400);break;
   case'missile':this.noise(D,t,.01,.03,.08,.08,'bandpass',1800,600);break;
   case'hit':this.tone(D,'triangle',300,t,.006,.01,.03,.08,150);break;
   case'pop':this.xp(D,t,0);break;
   case'boom':this.xp(D,t,1);break;
   case'bigboom':this.xp(D,t,2);break;case'bossboom':this.xp(D,t,3);break;
   case'tick':this.tone(D,'square',1400+Math.random()*200,t,.004,.004,.025,.035,0,4500);break;
   case'warp':this.noise(D,t+.5,.9,.4,.6,.22,'bandpass',220,5200);this.tone(D,'sawtooth',55,t+.4,1.2,.5,.5,.06,880,1600);this.tone(D,'sine',110,t+.6,1,.4,.6,.12,520);break;
   case'warpflash':this.noise(D,t,.006,.06,.7,.3,'lowpass',7000,180);this.tone(D,'sine',160,t,.006,.08,.6,.3,40);this.tone(D,'triangle',1760,t,.006,.05,.5,.05,880);break;
   case'warpin':this.noise(D,t,.02,.25,1.4,.2,'bandpass',4200,160);this.tone(D,'sine',700,t,.02,.3,1.3,.08,90);break;
   case'coin':this.tone(D,'square',1320,t,.006,.02,.05,.05);this.tone(D,'square',1760,t+.05,.006,.02,.08,.05);break;
   case'evolve':[392,523,659,784,1047,1319].forEach((f,i)=>this.tone(D,'square',f,t+i*.05,.006,.04,.08,.07,0,5000));this.tone(D,'sine',180,t,.02,.25,.4,.2,520);break;
   case'tierdown':[784,587,440].forEach((f,i)=>this.tone(D,'triangle',f,t+i*.07,.006,.04,.1,.12,0,3000));break;
   case'power':[523,659,784,1047].forEach((f,i)=>this.tone(D,'square',f,t+i*.055,.006,.03,.06,.07,0,4000));break;
   case'hurt':this.tone(D,'sawtooth',400,t,.006,.05,.3,.25,70,1800);this.noise(D,t,.006,.05,.3,.25,'lowpass',1500,200);break;
   case'shieldhit':this.tone(D,'triangle',900,t,.006,.03,.2,.18,400);break;
   case'deflect':this.tone(D,'square',1800,t,.006,.005,.03,.03,1200,5000);break;
   case'bomb':this.xp(D,t,3);this.tone(D,'sine',180,t,.02,.2,.9,.12,40);break;
   case'warn':for(let i=0;i<3;i++){this.tone(D,'square',660,t+i*.5,.01,.18,.06,.12,0,2000);this.tone(D,'square',440,t+i*.5+.25,.01,.15,.06,.12,0,2000);}break;
   case'charge':this.tone(D,'sawtooth',110,t,.2,.6,.1,.06,440,1200);break;
   case'beam':this.noise(D,t,.02,.6,.2,.15,'bandpass',900);this.tone(D,'sawtooth',80,t,.02,.6,.2,.12,70,700);break;
   case'ui':this.tone(D,'square',660,t,.006,.02,.05,.07,0,3000);this.tone(D,'square',990,t+.04,.006,.02,.06,.06,0,3000);break;
   case'clear':[392,523,659,784,1047,784,1047].forEach((f,i)=>this.tone(D,'square',f,t+i*.11,.01,.07,.08,.08,0,3500));break;
   case'over':[392,349,311,262].forEach((f,i)=>this.tone(D,'triangle',f,t+i*.22,.01,.15,.12,.15));break;
  }},
 // ---- music: seeded procedural synthwave/arcade songs per stage ----
 makeSong(id){let r=id*977+13;const R=()=>{r=(r*16807)%2147483647;return r/2147483647;};const boss=id>=100,menu=id===50;
  const roots=[45,43,41,47,44,42,46,40,48,43];const root=menu?45:boss?40+(id%3):roots[(id-1)%10];
  const minor=[0,2,3,5,7,8,10],phryg=[0,1,3,5,7,8,10];const sc=boss?phryg:minor;
  const progs=[[0,5,2,6],[0,6,5,4],[0,3,5,4],[0,5,3,4],[0,2,5,6]];const pr=boss?[0,1,0,6]:progs[Math.floor(R()*progs.length)];
  const bpm=menu?112:boss?168:136+((id*7)%5)*6;const lead=[];for(let b=0;b<4;b++){const bar=[];for(let s=0;s<16;s++){const on=s%4===0?R()<.85:s%2===0?R()<.55:R()<.25;bar.push(on?(pr[b]+[0,2,4,7][Math.floor(R()*4)]):null);}lead.push(bar);}
  return{root,sc,pr,bpm,lead,boss,menu,arp:R()<.5,dens:boss?1:menu?.4:.75};},
 play(id){if(this.songId===id)return;
  // Cut already-scheduled notes of the previous song (lookahead) so scene changes don't leave old music hanging.
  if(this.ac&&this.cg){const t0=this.ac.currentTime;try{this.cg.gain.cancelScheduledValues(t0);this.cg.gain.setValueAtTime(Math.max(0,this.cg.gain.value),t0);this.cg.gain.linearRampToValueAtTime(0,t0+.05);}catch(e){}const dead=this.cg;setTimeout(()=>{try{dead.disconnect();}catch(e){}},120);}
  this.songId=id;this.song=id<0?null:this.makeSong(id);this.step=0;
  if(this.ac){this.cg=this.ac.createGain();this.cg.gain.value=id<0?0:1;this.cg.connect(this.mg);this.next=this.ac.currentTime+.05;}else this.cg=null;},
 // v29: single scheduler (only the worker timer calls tick); re-entrancy guarded; never schedules a step twice
 tick(){const ac=this.ac;if(this._busy||!ac||!this.song||!this.cg||ac.state!=='running'||!SAVE.mus)return;
  // Don't schedule into pause/ad overlays (keeps music aligned with a frozen game).
  if(typeof G!=='undefined'&&(G.mode==='paused'||G.mode==='adpause'))return;
  this._busy=true;try{const S=this.song,spb=60/S.bpm/4,D=this.cg;if(this.next<ac.currentTime-.25)this.next=ac.currentTime+.05;
  let n=0;while(this.next<ac.currentTime+.18&&n<16){this.note(S,this.step,this.next,spb,D);this.next+=spb;this.step++;n++;}}finally{this._busy=false;}},
 nf(S,deg,oct){const d=((deg%7)+7)%7,o=Math.floor(deg/7);return 440*Math.pow(2,(S.root+S.sc[d]+12*(o+oct)-69)/12);},
 note(S,st,t,spb,D){const s=st%16,bar=Math.floor(st/16)%4,sec=Math.floor(st/64)%4,ch=S.pr[bar];
  // drums
  if(!S.menu||sec>0){if(s%4===0)this.tone(D,'sine',150,t,.006,.02,.16,.55,42);
   if(s===4||s===12)this.noise(D,t,.006,.02,.12,.22,'bandpass',1800);
   if(s%2===0||S.boss)this.noise(D,t,.006,.005,.03,s%4===2?.09:.05,'highpass',7000);}
  // bass: octave pumping 8ths
  if(s%2===0){const f=this.nf(S,ch,-2)*(s%4===2?2:1);this.tone(D,'sawtooth',f,t,.006,spb*1.2,.04,.16,0,S.boss?900:700);}
  // pad chord on bar start
  if(s===0&&!S.boss){[0,2,4].forEach(k=>this.tone(D,'triangle',this.nf(S,ch+k,0),t,.08,spb*12,.3,.035));}
  // arp
  if(S.arp&&sec%2===1){const k=[0,2,4,7][s%4];this.tone(D,'square',this.nf(S,ch+k,1),t,.006,spb*.4,.04,.03,0,2500);}
  // lead
  if(sec!==0||S.boss){const n=S.lead[bar][s];if(n!==null&&Math.random()<S.dens+.25){this.tone(D,'square',this.nf(S,n,1),t,.008,spb*1.1,.06,.06,0,3200);this.tone(D,'sawtooth',this.nf(S,n,1)*1.005,t,.008,spb*1.1,.06,.025,0,1800);}}},
};
function vib(ms){try{SAVE.vib&&navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

// v11: music scheduler driven by a Worker timer (keeps ticking when rAF is starved by scrolling/jank)
// v29: exactly one timer at a time; stopped while the app is hidden, restarted when visible again
const MUSCLK=(function(){let w=null,iv=0,useW=true;const t=()=>{try{AU.tick();}catch(e){}};
 const src='let i=0;onmessage=e=>{clearInterval(i);i=0;if(e.data===1)i=setInterval(()=>postMessage(0),40);};';
 try{w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));w.onmessage=t;w.onerror=()=>{useW=false;try{w.terminate();}catch(_){}w=null;start();};}catch(e){w=null;useW=false;}
 function stop(){if(w)w.postMessage(0);if(iv){clearInterval(iv);iv=0;}}
 function start(){stop();if(useW&&w)w.postMessage(1);else iv=setInterval(t,50);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});addEventListener('pagehide',stop);addEventListener('pageshow',()=>{if(!document.hidden)start();});
 if(!document.hidden)start();return{start,stop,running:()=>!!(iv||(useW&&w))};})();
