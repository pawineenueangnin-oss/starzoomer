// Starzoomer — stage-to-stage hyperspace warp between stages.
// Timeline (s): 0-1 align+engine flare, 1-2.6 stars stretch into streaks & ship blasts off as a light streak,
// 2.6-3 white flash + new background, 3-5.6 stage title card while streaks decelerate and the ship arrives, then play.
'use strict';
const WARP={on:null,st:[],D:5.9,
 start(n,endless,then){this.on={t:0,n,endless:!!endless,then,swapped:false,vy:0,sy:P.y,sx:P.x,shot:0};G.mode='warp';FX.fw=0;
  clearAll();P.alive=true;P.inv=0;P.evoT=0;UI.hideAll();UI.hud(false);Ads.banner(false);AU.play(-1);this.btn(false);
  const m=QUAL>1?150:QUAL?110:70;this.st.length=0;for(let i=0;i<m;i++)this.st.push(this.mk(true));AU.sfx('warp');},
 mk(any){return{a:Math.random()*TAU,d:any?Math.random()*GH*.8:rnd(4,40),z:rnd(.6,1.4),c:(Math.random()*3)|0};},
 // v23: a tap only skips after the jump (2.8 s); before, a stray touch from steering (stage 11+ starts the warp mid-play) wiped the whole warp.
 // v29: skipping only through the explicit SKIP button (or Android back); taps elsewhere (pause/settings, steering) never skip.
 skip(){const o=this.on;if(!o||o.t<2.8)return;this.finish();},
 btn(on){let b=$('warpSkip');if(!b){b=document.createElement('button');b.id='warpSkip';b.className='b sm';b.type='button';
   b.addEventListener('pointerdown',e=>{e.stopPropagation();});b.addEventListener('click',e=>{e.stopPropagation();AU.sfx('ui');WARP.skip();});$('ui').appendChild(b);}
  b.textContent=T('skip')+' \u25B6\u25B6';b.style.display=on?'block':'none';},
 finish(){const o=this.on;if(!o)return;this.on=null;this.btn(false);o.then();G.noIntro=true;G.flash=Math.max(G.flash,.25);},
 // speed profile: 0..1 = cruising stars, large = hyperspace
 spd(t){if(t<1)return .25+t*.5;if(t<2.75){const k=(t-1)/1.75;return .75+k*k*k*14;}if(t<5.2){const k=(t-2.75)/2.45;return .3+14.75*Math.pow(1-k,3);}return .3;},
 update(dt){const o=this.on;if(!o)return;o.t+=dt;const t=o.t,v=this.spd(t);G.scroll+=dt*(1+v*1.5);FX.t+=0;
  // ship choreography
  const cx0=GW/2,cy0=GH*.66;
  if(t<1){const k=1-Math.pow(1-t,3);P.x=o.sx+(cx0-o.sx)*k;P.y=o.sy+(cy0-o.sy)*k;}
  else if(t<2.15){P.x=cx0+rnd(-1,1)*(t-1)*1.4;P.y=cy0+Math.sin(t*30)*.6;}
  else if(t<2.75){o.vy+=dt*5200;P.y-=o.vy*dt;P.x=cx0;}
  else{if(!o.swapped){o.swapped=true;this.swap();}const k=Math.min(1,(t-3)/1.7),e=1-Math.pow(1-Math.max(0,k),4);P.x=cx0;P.y=t<3?GH+120:GH+120-(GH+120-(GH-110))*e;}
  if(t>=2.6&&!o.flashed){o.flashed=true;AU.sfx('warpflash');}
  if(t>=3.05&&!o.arr){o.arr=true;AU.sfx('warpin');}
  if(t>=2.8&&!o.bt){o.bt=true;this.btn(true);}
  if(t>=this.D)this.finish();},
 swap(){const o=this.on;const bg=o.endless?(G.sector%11===0?10:bIdx()):o.n-1;setBG(bg,true);for(const s of this.st)s.d=Math.random()*GH*.8;},
 draw(dt){const o=this.on;if(!o)return;const t=o.t,v=this.spd(t),VX=GW/2,VY=GH*.38;
  // flash envelope
  const fl=t<2.45?0:t<2.75?(t-2.45)/.3:t<3.25?1-(t-2.75)/.5:0;
  // hue phase: cyan -> violet -> white during the jump, gold-cyan on arrival
  const pal=t<2.75?(t<1.6?['120,220,255','90,160,255','255,255,255']:['190,130,255','120,220,255','255,240,255']):['255,220,140','120,230,255','255,255,255'];
  const stretch=Math.min(.95,.02+v*.065),R=Math.hypot(GW,GH)*.7;
  cx.globalCompositeOperation='lighter';
  if(v>2){cx.globalAlpha=Math.min(.5,(v-2)*.05);const g=ART.glow[t<2.75?'v':'c'];cx.drawImage(g.c,VX-GW*.9,VY-GW*.9,GW*1.8,GW*1.8);cx.globalAlpha=1;}
  for(let c=0;c<3;c++){cx.strokeStyle='rgba('+pal[c]+','+(c===2?.95:.75)+')';cx.lineWidth=c===2?1.1:c===1?1.8:2.6;cx.beginPath();
   for(const s of this.st){if(s.c!==c)continue;s.d+=(12+s.d*.9)*v*s.z*dt*(t<2.75?1:1);if(s.d>R){Object.assign(s,this.mk(false));}
    const ca=Math.cos(s.a),sa=Math.sin(s.a),d0=s.d*(1-stretch),d1=s.d;cx.moveTo(VX+ca*d0,VY+sa*d0);cx.lineTo(VX+ca*d1+.5,VY+sa*d1+.5);}
   cx.stroke();}
  // engine flare under the ship
  const fk=t<1?t:t<2.75?1+(t-1)*1.6:Math.max(.6,2.5-(t-3)*1.2);
  if(P.y>-200&&P.y<GH+100){cx.globalAlpha=Math.min(1,.4+fk*.3);const g=ART.glow;
   cx.drawImage(g.c.c,P.x-14*fk,P.y+6,28*fk,(30+fk*30));cx.drawImage(g.w.c,P.x-7*fk,P.y+10,14*fk,(14+fk*18));cx.globalAlpha=1;
   // light-streak trail when the ship blasts off / arrives
   const tl=t>=2.1&&t<2.75?Math.min(GH*1.4,o.vy*.45+40):t>=3&&t<4.8?Math.max(0,(GH-110-P.y+260)*(1-(t-3)/1.8)):0;
   if(tl>4){const below=t<2.75,y0=below?P.y:P.y,h=tl;cx.drawImage(g.c.c,P.x-16,y0,32,h);cx.drawImage(g.w.c,P.x-5,y0,10,h*.9);cx.fillStyle='rgba(255,255,255,.9)';cx.fillRect(P.x-1.2,y0+6,2.4,h*.8);}}
  cx.globalCompositeOperation='source-over';
  drawPlayer();
  if(fl>0){cx.fillStyle='rgba(255,252,240,'+Math.min(1,fl)+')';cx.fillRect(0,0,GW,GH);}
  // stage title card
  if(t>3.0){const a=Math.min(1,(t-3)/.35)*Math.min(1,Math.max(0,(this.D-.25-t)/.5)),pop=Math.min(1,(t-3)/.3),sc=.6+.4*(1-Math.pow(1-pop,3))+Math.max(0,(t-3.3))*.02;
   cx.save();cx.globalAlpha=a;cx.translate(GW/2,GH*.36);cx.textAlign='center';cx.textBaseline='middle';
   const sp=o.endless&&G.sector%11===0,big=sp?T('spStage'):T('stage')+' '+(o.endless?stNum():o.n),sub=sp?T('spName'):T('n'+(o.endless?bIdx()+1:o.n));
   // light bars
   cx.globalCompositeOperation='lighter';const bw=Math.min(GW*.86,40+(t-3)*700);cx.fillStyle='rgba(120,220,255,.55)';cx.fillRect(-bw/2,-44,bw,2);cx.fillRect(-bw/2,40,bw,2);cx.fillStyle='rgba(255,255,255,.9)';cx.fillRect(-bw/4,-44,bw/2,1);cx.fillRect(-bw/4,40,bw/2,1);
   cx.globalAlpha=a*.5;cx.drawImage(ART.glow.c.c,-GW*.45,-70,GW*.9,140);cx.globalAlpha=a;cx.globalCompositeOperation='source-over';
   cx.scale(sc,sc);cx.lineJoin='round';let fs=26;cx.font=fs+'px PS2P, system-ui, sans-serif';while(cx.measureText(big).width>GW*.82&&fs>12){fs-=2;cx.font=fs+'px PS2P, system-ui, sans-serif';}
   cx.lineWidth=6;cx.strokeStyle='#1a0640';cx.strokeText(big,0,-12);cx.fillStyle='#ffe25a';cx.fillText(big,0,-12);cx.fillStyle='rgba(255,255,255,.75)';cx.fillText(big,0,-14);cx.fillStyle='#ffd23a';cx.fillText(big,0,-12);
   cx.font='bold 17px system-ui, sans-serif';cx.lineWidth=4;cx.strokeText(sub,0,22);cx.fillStyle='#bff4ff';cx.fillText(sub,0,22);
   cx.restore();}}};
