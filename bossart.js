// Starzoomer — v4 alien motherships. 100% original procedural art.
// Each boss = pre-rendered layers (cached offscreen canvases) + a few cheap animated parts drawn live.
'use strict';
const BA={c:[],gl:{}};
const T2=Math.PI*2;
function bE(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r||0,0,T2);}
function glS(col){return BA.gl[col]||(BA.gl[col]=mk(32,32,g=>{g.fillStyle=rg(g,0,0,0,16,['#ffffff',col+'cc',col+'44',col+'00']);g.fillRect(-16,-16,32,32);},2));}
function gl(g,col,x,y,r,a){const o=glS(col);if(a!=null)g.globalAlpha=Math.max(0,Math.min(1,a));g.drawImage(o.c,x-r,y-r,r*2,r*2);g.globalAlpha=1;}
function sw(g,col,w,fn,blur){g.save();if(blur){g.shadowColor=col;g.shadowBlur=blur;}g.strokeStyle=col;g.lineWidth=w;fn();g.stroke();g.restore();}
function sym(g,fn){fn(1);g.save();g.scale(-1,1);fn(-1);g.restore();}
function dimg(g,o,x,y,px,py){g.drawImage(o.c,x-(px==null?o.w/2:px),y-(py==null?o.h/2:py),o.w,o.h);}
function rnG(seed){let s=seed*7919+13;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
const HULL=['#40305e','#1e1634','#0c0818'];
// ---------------------------------------------------------------- designs
const BD=[];
// 0 Gloomjaw Carrier — insectoid carapace gunship with mandible cannons & iridescent wings
BD[0]={build(A,hw,hh,a1,a2){
 const W=hw*1.05,H=hh*.6;
 A.wing=mk(W,H,g=>{g.translate(-W/2,0);bE(g,W*.5,0,W*.49,H*.4);g.fillStyle=lg(g,0,0,W,0,[a2+'88',a2+'38','#c86bff30']);g.fill();g.strokeStyle=a2+'dd';g.lineWidth=1.3;g.stroke();
  g.strokeStyle=a2+'66';g.lineWidth=.8;for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(3,0);g.quadraticCurveTo(W*.5,k*H*.13,W*.95,k*H*.06);g.stroke();}
  g.fillStyle='#ffffff26';bE(g,W*.4,-H*.14,W*.16,H*.07,-.1);g.fill();},2);
 A.mand=mk(34,48,g=>{g.beginPath();g.moveTo(-7,-20);g.lineTo(7,-20);g.bezierCurveTo(12,0,8,14,-6,24);g.bezierCurveTo(0,10,-2,-4,-7,-20);g.closePath();
  fillGlow(g,a1,8,()=>{g.fillStyle=lg(g,-7,-20,6,24,['#7a4a3a','#3a1a24','#150812']);g.fill();});g.strokeStyle=a1;g.lineWidth=1.4;g.stroke();
  g.fillStyle='#ffe0b0';for(let k=0;k<4;k++){g.beginPath();g.moveTo(-1+k*.8,-6+k*7);g.lineTo(-6+k*.5,-3+k*7);g.lineTo(-1+k*.8,-1+k*7);g.fill();}
  fillGlow(g,a1,6,()=>{g.fillStyle=a1;bE(g,2,-12,2.5,4);g.fill();});},2);
},base(g,hw,hh,a1,a2){
 // legs
 sym(g,s=>{for(let k=0;k<3;k++){const y0=hh*(-.05+k*.2);g.beginPath();g.moveTo(hw*.25,y0);g.lineTo(hw*.62,y0-hh*.18+k*4);g.lineTo(hw*(.78+k*.05),y0+hh*.3);
  g.strokeStyle='#120a1c';g.lineWidth=6;g.stroke();g.strokeStyle=a1+'aa';g.lineWidth=1.4;g.stroke();g.fillStyle=a1;bE(g,hw*.62,y0-hh*.18+k*4,2.4,2.4);g.fill();}});
 // abdomen segments (rear, top)
 for(let k=4;k>=0;k--){const y=-hh*.18-k*hh*.15,rx=hw*.3*(1-k*.14),ry=hh*.17*(1-k*.08);
  fillGlow(g,a1,6,()=>{g.fillStyle=rg(g,0,y-ry*.5,1,rx,['#6a4a6a','#2e1a34','#120a18']);bE(g,0,y,rx,ry);g.fill();});
  g.strokeStyle=a1+'99';g.lineWidth=1.2;bE(g,0,y,rx,ry);g.stroke();
  g.fillStyle=a1;sym(g,()=>{bE(g,rx*.6,y+ry*.2,2,1.5);g.fill();});}
 // thorax carapace
 fillGlow(g,a1,16,()=>{g.fillStyle=rg(g,-hw*.1,-hh*.1,4,hw*.42,['#7a5878','#3a2240','#160c1e']);bE(g,0,hh*.12,hw*.36,hh*.4);g.fill();});
 g.strokeStyle=a1;g.lineWidth=1.6;bE(g,0,hh*.12,hw*.36,hh*.4);g.stroke();
 g.strokeStyle='#0a0510';g.lineWidth=2;g.beginPath();g.moveTo(0,-hh*.28);g.lineTo(0,hh*.05);g.stroke();
 sym(g,()=>{g.strokeStyle='#ffffff22';g.lineWidth=2;g.beginPath();g.ellipse(-hw*.02,hh*.12,hw*.3,hh*.32,0,3.6,4.6);g.stroke();
  sw(g,a1,1.4,()=>{g.beginPath();g.moveTo(hw*.04,-hh*.2);g.bezierCurveTo(hw*.2,-hh*.1,hw*.12,hh*.1,hw*.3,hh*.2);g.moveTo(hw*.15,-hh*.05);g.lineTo(hw*.28,-hh*.1);},6);});
 // head
 fillGlow(g,a1,8,()=>{g.fillStyle=rg(g,0,hh*.55,2,hw*.22,['#5a3a5a','#24122a']);bE(g,0,hh*.62,hw*.2,hh*.2);g.fill();});g.strokeStyle=a1+'cc';g.lineWidth=1.2;bE(g,0,hh*.62,hw*.2,hh*.2);g.stroke();
 sym(g,()=>{fillGlow(g,a2,10,()=>{g.fillStyle=rg(g,hw*.11,hh*.58,1,10,['#e8ffff',a2,'#0a3a6a']);bE(g,hw*.12,hh*.6,hw*.07,hh*.1,.4);g.fill();});
  g.fillStyle='#00000055';for(let a=0;a<3;a++)for(let b=0;b<3;b++){bE(g,hw*.09+a*3.5,hh*.53+b*4,1,1);g.fill();}
  sw(g,a1+'cc',1.2,()=>{g.beginPath();g.moveTo(hw*.04,hh*.78);g.quadraticCurveTo(hw*.18,hh*1.1,hw*.34,hh*1.0);},4);});
 // core socket
 g.fillStyle='#0a0510';bE(g,0,hh*.25,17,17);g.fill();g.strokeStyle=a1;g.lineWidth=2;g.stroke();
},back(g,A,t,ph,hw,hh){const fq=10+ph*4;g.globalCompositeOperation='lighter';
 sym(g,()=>{for(let k=0;k<2;k++){g.save();g.translate(hw*.12,-hh*.15+k*hh*.22);g.rotate(-.32+k*.5+Math.sin(t*fq+k*1.7)*.12);g.globalAlpha=.85;dimg(g,A.wing,0,0,0);g.restore();}});g.globalAlpha=1;g.globalCompositeOperation='source-over';
},front(g,A,t,ph,la,hw,hh,a1,a2){
 const op=.18+.22*(.5+.5*Math.sin(t*3.2));sym(g,()=>{g.save();g.translate(hw*.1,hh*.7);g.rotate(-op);dimg(g,A.mand,0,0,17,6);g.restore();});
 g.globalCompositeOperation='lighter';for(let k=0;k<5;k++)gl(g,a1,0,-hh*.18-k*hh*.15,6,.35+.35*Math.sin(t*4-k));
 gl(g,a2,0,-hh*.92,14+Math.sin(t*30)*2,.9);sym(g,()=>gl(g,a2,hw*.12,hh*.6,9,.5+.4*Math.sin(t*2.3)));g.globalCompositeOperation='source-over';}};

// 1 Rockmaw Hauler — ancient glyph obelisk ship with orbiting rune stones
const GLYPH=(g,x,y,s,k)=>{g.beginPath();switch(k%6){case 0:g.moveTo(x-s,y-s);g.lineTo(x,y+s);g.lineTo(x+s,y-s);break;case 1:g.arc(x,y,s*.8,0,T2);g.moveTo(x,y-s);g.lineTo(x,y+s);break;case 2:g.moveTo(x-s,y);g.lineTo(x+s,y);g.moveTo(x-s*.5,y-s);g.lineTo(x-s*.5,y+s);g.moveTo(x+s*.5,y-s);g.lineTo(x+s*.5,y+s);break;
 case 3:g.moveTo(x-s,y+s);g.lineTo(x,y-s);g.lineTo(x+s,y+s);g.closePath();break;case 4:g.moveTo(x-s,y-s);g.lineTo(x+s,y-s);g.lineTo(x-s,y+s);g.lineTo(x+s,y+s);break;default:g.rect(x-s*.7,y-s*.7,s*1.4,s*1.4);g.moveTo(x,y-s);g.lineTo(x,y+s);}g.stroke();};
BD[1]={build(A,hw,hh,a1,a2){
 A.side=mk(hw*.36,hh*1.3,g=>{const w=hw*.13,h=hh*.6;poly(g,[0,-h,w,-h*.6,w*.8,h*.6,0,h],true);g.fillStyle=lg(g,-w,0,w,0,['#4a3a44','#2a1e2a','#120c14']);g.fill();g.strokeStyle=a1+'aa';g.lineWidth=1.2;g.stroke();
  g.fillStyle='#ffffff14';poly(g,[0,-h,-w,-h*.6,-w*.8,h*.6,0,h]);g.fill();
  sw(g,a2,1.3,()=>{for(let k=0;k<5;k++)GLYPH(g,0,-h*.6+k*h*.3,3.2,k+2);},6);},2);
 A.rune=mk(18,18,g=>{poly(g,[0,-8,7,-2,5,7,-5,7,-7,-2]);g.fillStyle=lg(g,0,-8,0,8,['#5a4650','#1e1418']);g.fill();g.strokeStyle=a1;g.lineWidth=1;g.stroke();sw(g,a2,1,()=>GLYPH(g,0,0,3,1),5);},2);
 A.glow=mk(hw*.6,hh*2.1,g=>{g.globalCompositeOperation='lighter';sw(g,a2,1.6,()=>{for(let r=0;r<7;r++)for(let c=-1;c<=1;c++)if(!(r===4&&c===0)&&Math.abs(c)*hw*.07<hw*.17-(Math.abs(r-3))*2)GLYPH(g,c*hw*.075,-hh*.72+r*hh*.2,3.4,r*3+c+5);},8);},2);
},base(g,hw,hh,a1,a2){
 // great halo arc (stone)
 g.strokeStyle='#241a22';g.lineWidth=9;g.beginPath();g.ellipse(0,-hh*.15,hw*.72,hh*.62,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
 g.strokeStyle=a1+'88';g.lineWidth=1.2;g.stroke();sw(g,a2+'aa',1,()=>{g.beginPath();g.ellipse(0,-hh*.15,hw*.72,hh*.62,0,Math.PI*1.1,Math.PI*1.9);},5);
 // crossbar
 poly(g,[hw*.18,-hh*.05,hw*.5,-hh*.12,hw*.52,hh*.0,hw*.18,hh*.12],true);g.fillStyle=lg(g,0,-hh*.1,0,hh*.12,['#4a3a44','#1a1218']);g.fill();g.strokeStyle=a1+'99';g.lineWidth=1;g.stroke();
 // obelisk
 const w=hw*.19;fillGlow(g,a1,18,()=>{poly(g,[0,-hh*.98,w*.55,-hh*.78,w,hh*.45,0,hh*.98],true);g.fillStyle=lg(g,-w,0,w,0,['#6a5660','#3a2c34','#1a1218','#0c080c']);g.fill();});
 g.strokeStyle=a1;g.lineWidth=1.4;g.stroke();g.fillStyle='#ffffff12';poly(g,[0,-hh*.98,-w*.55,-hh*.78,-w,hh*.45,0,hh*.98]);g.fill();
 g.strokeStyle='#00000066';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.moveTo(-w,-hh*.6+k*hh*.22);g.lineTo(w,-hh*.62+k*hh*.22);g.stroke();}
 sw(g,a2+'55',1.2,()=>{for(let r=0;r<7;r++)for(let c=-1;c<=1;c++)if(!(r===4&&c===0)&&Math.abs(c)*hw*.07<hw*.17-(Math.abs(r-3))*2)GLYPH(g,c*hw*.075,-hh*.72+r*hh*.2,3.4,r*3+c+5);});
 g.fillStyle='#0a0608';bE(g,0,hh*.25,16,16);g.fill();g.strokeStyle=a2;g.lineWidth=2;g.stroke();
 sw(g,a1,1.2,()=>{g.beginPath();g.arc(0,hh*.25,21,0,T2);},6);
},back(g,A,t,ph,hw,hh){for(let k=0;k<12;k++){const a=t*.6+k/12*T2;if(Math.sin(a)>0)continue;g.globalAlpha=.6;dimg(g,A.rune,Math.cos(a)*hw*.95,hh*.1+Math.sin(a)*hh*.28);}g.globalAlpha=1;},
front(g,A,t,ph,la,hw,hh,a1,a2){sym(g,()=>{g.save();g.translate(hw*.66,Math.sin(t*1.4)*5);g.rotate(.12+Math.sin(t*.9)*.05);dimg(g,A.side,0,0);g.restore();});
 g.globalCompositeOperation='lighter';g.globalAlpha=.45+.45*Math.sin(t*(2+ph));dimg(g,A.glow,0,0);g.globalAlpha=1;sym(g,()=>gl(g,a1,hw*.66,hh*.7+Math.sin(t*1.4)*5,12+Math.sin(t*25)*2,.9));gl(g,a2,0,-hh,12,.6+.3*Math.sin(t*3));g.globalCompositeOperation='source-over';
 for(let k=0;k<12;k++){const a=t*.6+k/12*T2;if(Math.sin(a)<=0)continue;dimg(g,A.rune,Math.cos(a)*hw*.95,hh*.1+Math.sin(a)*hh*.28);}}};

// 2 Frostback Warden — crystalline shard cruiser with prismatic facets
function shard(g,x,y,len,wid,ang,c1,c2){g.save();g.translate(x,y);g.rotate(ang);
 g.beginPath();g.moveTo(0,-len*.18);g.lineTo(wid,0);g.lineTo(0,len);g.closePath();g.fillStyle=lg(g,0,0,wid,len*.5,[c1,'#2a5aa8']);g.fill();
 g.beginPath();g.moveTo(0,-len*.18);g.lineTo(-wid,0);g.lineTo(0,len);g.closePath();g.fillStyle=lg(g,-wid,0,0,len,['#ffffff',c2,'#5a3aa8']);g.fill();
 g.strokeStyle='#e8ffff';g.lineWidth=1;g.beginPath();g.moveTo(0,-len*.18);g.lineTo(wid,0);g.lineTo(0,len);g.lineTo(-wid,0);g.closePath();g.stroke();
 g.strokeStyle='#ffffff99';g.beginPath();g.moveTo(0,-len*.18);g.lineTo(0,len);g.stroke();g.restore();}
BD[2]={build(A,hw,hh,a1,a2){A.sat=mk(20,30,g=>{fillGlow(g,a1,8,()=>shard(g,0,-8,22,6,0,'#9ef0ff','#c8f8ff'));},2);
 A.prism=mk(hw*2+40,hh*2+40,g=>{g.globalCompositeOperation='lighter';const C=['#ff4fd8','#ffe14a','#3dffd0','#4f8bff'];[[-.55,-.2],[.55,-.2],[-.3,.35],[.3,.35],[0,-.6],[-.8,.1],[.8,.1]].forEach((p,k)=>{sw(g,C[k%4]+'aa',1.4,()=>{g.beginPath();g.moveTo(p[0]*hw-8,p[1]*hh-6);g.lineTo(p[0]*hw+6,p[1]*hh+10);},6);});},2);
},base(g,hw,hh,a1,a2){
 const P=[[-.86,-.05,hh*.7,10,-1.15],[.86,-.05,hh*.7,10,1.15],[-.62,-.35,hh*.8,12,-.7],[.62,-.35,hh*.8,12,.7],[-.5,.2,hh*.6,11,-.45],[.5,.2,hh*.6,11,.45],[-.25,-.55,hh*.6,10,-.25],[.25,-.55,hh*.6,10,.25]];
 // back fan of shards (point outward/down)
 fillGlow(g,'#7a5aff',10,()=>{P.forEach((p,k)=>shard(g,p[0]*hw*.35,p[1]*hh*.3,p[2],p[3],p[4],k%2?'#5a7aff':'#3ab0e8',k%3?'#c8b0ff':'#a8f0ff'));});
 // wing blades
 sym(g,()=>{shard(g,hw*.2,-hh*.05,hw*.85,hh*.1,-1.62,'#3a78d8','#b8e0ff');});
 // central keel crystal pointing down
 fillGlow(g,a1,8,()=>{shard(g,0,-hh*.55,hh*1.5,hw*.17,0,'#4aa8f0','#bfefff');});
 shard(g,0,-hh*.95,hh*.55,hw*.08,Math.PI,'#8ae8ff','#e8ffff');
 // frost rim
 g.fillStyle='#0a1a34';bE(g,0,hh*.25,15,15);g.fill();g.strokeStyle='#e8ffff';g.lineWidth=2;g.stroke();
 g.strokeStyle='#ffffff55';g.lineWidth=1;for(let k=0;k<6;k++){const a=k/6*T2;g.beginPath();g.moveTo(Math.cos(a)*17,hh*.25+Math.sin(a)*17);g.lineTo(Math.cos(a)*25,hh*.25+Math.sin(a)*25);g.stroke();}
},back(g,A,t,ph,hw,hh){},
front(g,A,t,ph,la,hw,hh,a1,a2){g.globalCompositeOperation='lighter';g.globalAlpha=.5+.5*Math.sin(t*2.4);dimg(g,A.prism,0,0);g.globalAlpha=1;
 for(let k=0;k<6;k++){const a=(k/6)*T2+t*1.6;gl(g,['#ff4fd8','#ffe14a','#3dffd0'][k%3],Math.cos(a+t)*hw*.5,Math.sin(a*1.3)*hh*.4,5,.5+.5*Math.sin(t*5+k));}
 sym(g,()=>gl(g,a1,hw*.25,-hh*.85,10+Math.sin(t*28)*2,.9));g.globalCompositeOperation='source-over';
 for(let k=0;k<4;k++){const a=t*1.1+k/4*T2;g.save();g.translate(Math.cos(a)*34,hh*.25+Math.sin(a)*14);g.rotate(a+Math.PI/2);dimg(g,A.sat,0,0);g.restore();}}};

// 3 Twinflare Bastion — ringed saucer-fortress with rotating rings and pulsing core
BD[3]={build(A,hw,hh,a1,a2){},base(g,hw,hh,a1,a2){
 // pylons
 sym(g,()=>{poly(g,[hw*.3,hh*.1,hw*.38,hh*.1,hw*.36,hh*.62,hw*.33,hh*.66]);g.fillStyle='#2a2440';g.fill();g.strokeStyle=a1+'aa';g.lineWidth=1;g.stroke();});
 // underside bulb
 fillGlow(g,a1,10,()=>{g.fillStyle=rg(g,0,hh*.2,2,hw*.3,['#5a4a7a','#241c3a','#0c0818']);bE(g,0,hh*.18,hw*.3,hh*.42);g.fill();});g.strokeStyle=a2+'99';g.lineWidth=1.2;bE(g,0,hh*.18,hw*.3,hh*.42);g.stroke();
 sym(g,()=>{g.strokeStyle='#ffffff18';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.ellipse(0,hh*.18,hw*.3*k/4,hh*.42,0,-1.2,1.2);g.stroke();}});
 // disc
 fillGlow(g,a1,18,()=>{g.fillStyle=lg(g,0,-hh*.3,0,hh*.2,['#c8c0e8','#6a5a98','#2a2048','#140c24']);bE(g,0,-hh*.05,hw*.8,hh*.26);g.fill();});
 g.strokeStyle='#e8e0ff';g.lineWidth=1.4;bE(g,0,-hh*.05,hw*.8,hh*.26);g.stroke();
 g.fillStyle='#1a1230';bE(g,0,hh*.02,hw*.78,hh*.12);g.fill();
 g.strokeStyle='#ffffff30';g.lineWidth=1;bE(g,0,-hh*.08,hw*.6,hh*.17);g.stroke();
 for(let k=-8;k<=8;k++){const x=k/9*hw*.7;g.fillStyle=k%2?a2:a1;bE(g,x,hh*.03,2.2,1.6);g.fill();}
 // dome
 g.save();g.beginPath();g.ellipse(0,-hh*.2,hw*.32,hh*.55,0,Math.PI,0);g.closePath();g.clip();
 g.fillStyle=lg(g,0,-hh*.75,0,-hh*.2,['#d8f8ff','#5ac8ff','#1a3a8a']);g.fillRect(-hw*.33,-hh*.8,hw*.66,hh*.62);
 g.fillStyle='#0a1440';for(let k=-3;k<=3;k++){const h=hh*(.12+((k*k*7)%5)*.05);g.fillRect(k*hw*.08-4,-hh*.2-h,8,h);g.fillStyle=k%2?'#0a1440':'#122060';}
 g.fillStyle='#ffe14a';for(let k=-3;k<=3;k++)g.fillRect(k*hw*.08-1,-hh*.3,2,2);
 g.fillStyle='#ffffff55';bE(g,-hw*.12,-hh*.55,hw*.08,hh*.12,-.5);g.fill();g.restore();
 g.strokeStyle=a2;g.lineWidth=1.4;g.beginPath();g.ellipse(0,-hh*.2,hw*.32,hh*.55,0,Math.PI,0);g.stroke();
 g.fillStyle='#0a0614';bE(g,0,hh*.25,16,16);g.fill();g.strokeStyle=a1;g.lineWidth=2;g.stroke();
},ring(g,t,hw,hh,a1,a2,front,ph){const rx=hw*.98,ry=hh*.2,tl=-.08,y=hh*.0;const a0=front?0:Math.PI,a1e=front?Math.PI:T2;
 g.save();g.strokeStyle='#3a2e58';g.lineWidth=6;g.beginPath();g.ellipse(0,y,rx,ry,tl,a0,a1e);g.stroke();g.strokeStyle=a1+'cc';g.lineWidth=1.2;g.stroke();
 g.globalCompositeOperation='lighter';g.setLineDash([4,10]);g.lineDashOffset=-t*(40+ph*20);g.strokeStyle=a2;g.lineWidth=3;g.beginPath();g.ellipse(0,y,rx,ry,tl,a0,a1e);g.stroke();g.setLineDash([]);
 const rx2=hw*.5,ry2=hh*.12;g.strokeStyle=a1+(front?'ff':'77');g.lineWidth=2;g.setLineDash([10,6]);g.lineDashOffset=t*60;g.beginPath();g.ellipse(0,hh*.25,rx2,ry2,.2,a0,a1e);g.stroke();g.setLineDash([]);g.restore();},
back(g,A,t,ph,hw,hh){this.ring(g,t,hw,hh,A.a1,A.a2,false,ph);},
front(g,A,t,ph,la,hw,hh,a1,a2){this.ring(g,t,hw,hh,a1,a2,true,ph);g.globalCompositeOperation='lighter';
 for(let k=-8;k<=8;k++){const x=k/9*hw*.7,a=.5+.5*Math.sin(t*6-k*.7);gl(g,k%2?a2:a1,x,hh*.03,5,a);}
 sym(g,()=>gl(g,a1,hw*.345,hh*.7,8+Math.sin(t*20)*2,.8));gl(g,a2,0,-hh*.7,18,.25+.15*Math.sin(t*2));g.globalCompositeOperation='source-over';}};

// 4 Coral Leviathan — serpentine sea-beast ship with glowing coral reef on its back
BD[4]={build(A,hw,hh,a1,a2){
 A.fin=mk(hw*.6,hh*.6,g=>{g.translate(-hw*.3,-hh*.2);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(hw*.25,-hh*.05,hw*.5,hh*.1,hw*.56,hh*.38);g.bezierCurveTo(hw*.35,hh*.3,hw*.15,hh*.32,0,hh*.15);g.closePath();
  g.fillStyle=lg(g,0,0,hw*.5,hh*.3,[a1+'dd',a1+'66','#ffd23a55']);g.fill();g.strokeStyle='#ffd0f0';g.lineWidth=1;g.stroke();
  g.strokeStyle='#ffffff55';for(let k=1;k<5;k++){g.beginPath();g.moveTo(2,hh*.05);g.lineTo(hw*.12*k,hh*(.05+k*.07));g.stroke();}},2);
 A.tail=mk(hw*.5,hh*.5,g=>{g.beginPath();g.moveTo(0,hh*.18);g.bezierCurveTo(-hw*.1,0,-hw*.22,-hh*.12,-hw*.24,-hh*.22);g.quadraticCurveTo(-hw*.05,-hh*.08,0,-hh*.02);g.quadraticCurveTo(hw*.05,-hh*.08,hw*.24,-hh*.22);g.bezierCurveTo(hw*.22,-hh*.12,hw*.1,0,0,hh*.18);
  g.fillStyle=lg(g,0,hh*.2,0,-hh*.2,['#6a2a6a',a1+'cc','#ffd23a88']);g.fill();g.strokeStyle='#ffd0f0';g.lineWidth=1;g.stroke();},2);
 A.tips=mk(hw*2+40,hh*2+40,g=>{g.globalCompositeOperation='lighter';(A.tipPts||[]).forEach(p=>{g.fillStyle=rg(g,p[0],p[1],0,5,['#ffffff',p[2]+'cc',p[2]+'00']);g.fillRect(p[0]-5,p[1]-5,10,10);});},2);
},base(g,hw,hh,a1,a2,A){const R=rnG(5);A.tipPts=[];
 // body arc (behind head) — coiled serpent
 const bodyPath=()=>{g.beginPath();g.moveTo(-hw*.22,hh*.4);g.bezierCurveTo(-hw*.95,hh*.1,-hw*.7,-hh*.9,0,-hh*.7);g.bezierCurveTo(hw*.6,-hh*.55,hw*.8,-hh*.05,hw*.5,hh*.0);};
 bodyPath();g.strokeStyle='#1a0a24';g.lineWidth=hh*.42;g.stroke();
 bodyPath();fillGlow(g,a1,14,()=>{g.strokeStyle=lg(g,-hw,0,hw,0,['#5a2050','#a03a80','#6a2a6a']);g.lineWidth=hh*.36;g.stroke();});
 bodyPath();g.strokeStyle='#ffb0e0';g.lineWidth=hh*.06;g.globalAlpha=.25;g.stroke();g.globalAlpha=1;
 bodyPath();g.setLineDash([3,9]);g.strokeStyle='#2a0a24';g.lineWidth=hh*.3;g.stroke();g.setLineDash([]);
 // coral reef growing from the back
 const coral=(x,y,a,l,d)=>{if(d>4||l<4)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.strokeStyle=d<2?'#ff6ac8':'#ffb0e0';g.lineWidth=Math.max(1,4-d);g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
  if(d>=3)A.tipPts.push([x2,y2,R()<.5?a1:a2]);coral(x2,y2,a-.45-R()*.3,l*.72,d+1);coral(x2,y2,a+.45+R()*.3,l*.72,d+1);};
 [[-hw*.55,-hh*.55,-2.3],[-hw*.2,-hh*.78,-1.8],[hw*.15,-hh*.75,-1.4],[hw*.45,-hh*.5,-.9],[-hw*.65,-hh*.2,-2.7]].forEach(c=>coral(c[0],c[1],c[2],hh*.28,0));
 // bioluminescent spots along body
 for(let k=0;k<14;k++){const u=k/13;const x=-hw*.6+u*hw*1.05,y=-hh*.55+Math.sin(u*3.2)*hh*.2;g.fillStyle=k%2?a2:'#7ae8ff';bE(g,x,y+hh*.1,1.6,1.6);g.fill();}
 // head
 fillGlow(g,a1,16,()=>{g.fillStyle=rg(g,0,hh*.1,3,hw*.38,['#d05aa8','#7a2a6a','#2a0a28']);g.beginPath();g.moveTo(-hw*.32,hh*.0);g.bezierCurveTo(-hw*.36,hh*.6,-hw*.12,hh*.92,0,hh*.95);g.bezierCurveTo(hw*.12,hh*.92,hw*.36,hh*.6,hw*.32,hh*.0);g.bezierCurveTo(hw*.2,-hh*.25,-hw*.2,-hh*.25,-hw*.32,0);g.fill();});
 g.strokeStyle='#ffb0e0';g.lineWidth=1.3;g.stroke();
 g.strokeStyle='#2a0a24';g.lineWidth=1.5;for(let k=0;k<4;k++){g.beginPath();g.ellipse(0,hh*.65,hw*(.08+k*.05),hh*.06,0,0,Math.PI);g.stroke();}
 sym(g,()=>{g.fillStyle='#ffd23a';for(let k=0;k<4;k++){bE(g,hw*(.22-k*.03),hh*(.15+k*.14),1.8,1.8);g.fill();}});
 g.fillStyle='#14040f';bE(g,0,hh*.25,16,16);g.fill();g.strokeStyle=a2;g.lineWidth=2;g.stroke();
},back(g,A,t,ph,hw,hh){sym(g,()=>{g.save();g.translate(hw*.3,hh*.3);g.rotate(Math.sin(t*2.6)*.25-.1);dimg(g,A.fin,0,0,0,hh*.1);g.restore();});
 g.save();g.translate(hw*.52,hh*.02);g.rotate(1.2+Math.sin(t*1.7)*.3);dimg(g,A.tail,0,0,A.tail.w/2,A.tail.h*.85);g.restore();},
front(g,A,t,ph,la,hw,hh,a1,a2){g.globalCompositeOperation='lighter';g.globalAlpha=.55+.45*Math.sin(t*1.8);dimg(g,A.tips,0,0);g.globalAlpha=1;
 sym(g,()=>gl(g,a2,hw*.2,hh*.45,9,.6));g.globalCompositeOperation='source-over';
 const bl=(t%4.1)<.16?.1:1;sym(g,()=>{g.fillStyle='#fff6c0';bE(g,hw*.2,hh*.42,6,5*bl,.4);g.fill();g.fillStyle='#200818';bE(g,hw*.2+Math.cos(la)*2,hh*.42+Math.sin(la)*1.5*bl,2.6,3*bl);g.fill();});}};

// 5 Stormcrown Citadel — medusa jellyfish mothership with luminous tendrils and a lightning crown
BD[5]={build(A,hw,hh,a1,a2){A.n=9;},
base(g,hw,hh,a1,a2){
 // crown spires
 sym(g,()=>{for(let k=0;k<3;k++){const x=hw*(.1+k*.17),y=-hh*(.78-k*.12);poly(g,[x-4,y+8,x,y-hh*.28+k*6,x+4,y+8]);g.fillStyle=lg(g,0,y-hh*.3,0,y+8,['#e0f0ff','#4f8bff','#1a2a6a']);g.fill();g.strokeStyle='#e0f0ff';g.lineWidth=.8;g.stroke();}});
 // bell
 const bell=()=>{g.beginPath();g.moveTo(-hw*.62,hh*.08);g.bezierCurveTo(-hw*.7,-hh*.75,hw*.7,-hh*.75,hw*.62,hh*.08);for(let k=8;k>=0;k--){const x=-hw*.62+k/8*hw*1.24;g.quadraticCurveTo(x+hw*.078,hh*.24,x,hh*.08);}g.closePath();};
 bell();fillGlow(g,a1,22,()=>{g.fillStyle=rg(g,0,-hh*.35,4,hw*.7,['#c8e8ffee','#4f8bffbb','#1a2a8a99','#0a1040cc']);g.fill();});
 bell();g.strokeStyle='#e0f0ff';g.lineWidth=1.4;g.stroke();
 g.save();bell();g.clip();g.strokeStyle='#ffffff33';g.lineWidth=1;for(let k=-5;k<=5;k++){g.beginPath();g.moveTo(k*hw*.02,-hh*.6);g.quadraticCurveTo(k*hw*.09,-hh*.2,k*hw*.12,hh*.15);g.stroke();}
 // inner organs
 g.globalCompositeOperation='lighter';[[-.22,-.25],[.22,-.25],[-.1,-.05],[.1,-.05]].forEach((p,k)=>{g.fillStyle=rg(g,p[0]*hw,p[1]*hh,1,hw*.13,['#ffb0f0','#c86bff88','#c86bff00']);bE(g,p[0]*hw,p[1]*hh,hw*.13,hh*.14,k);g.fill();});
 g.fillStyle='#ffffff40';bE(g,-hw*.22,-hh*.5,hw*.12,hh*.06,-.4);g.fill();g.restore();
 g.fillStyle='#0a1030';bE(g,0,hh*.25,15,15);g.fill();g.strokeStyle='#e0f0ff';g.lineWidth=2;g.stroke();
},back(g,A,t,ph,hw,hh,a1){const n=A.n;g.save();g.globalCompositeOperation='lighter';
 for(let k=0;k<n;k++){const x0=-hw*.55+k/(n-1)*hw*1.1,sp=Math.sin(t*1.6+k*.9),len=hh*(.7+(k%3)*.12);
  g.strokeStyle=k%2?'#7ab8ffaa':'#c86bffaa';g.lineWidth=2.4;g.beginPath();g.moveTo(x0,hh*.1);g.bezierCurveTo(x0+sp*14,hh*.1+len*.35,x0-sp*16,hh*.1+len*.7,x0+sp*10,hh*.1+len);g.stroke();
  g.strokeStyle='#ffffff55';g.lineWidth=.8;g.stroke();gl(g,'#7ae8ff',x0+sp*10,hh*.1+len,4,.6+.4*Math.sin(t*4+k));}
 // oral arms
 for(const s of[-1,1]){const sp=Math.sin(t*1.2+s);g.strokeStyle='#ff9ad8aa';g.lineWidth=5;g.beginPath();g.moveTo(s*hw*.12,hh*.15);g.bezierCurveTo(s*hw*.25+sp*8,hh*.5,s*hw*.05-sp*8,hh*.7,s*hw*.18,hh*.95);g.stroke();}
 g.restore();},
front(g,A,t,ph,la,hw,hh,a1,a2){g.globalCompositeOperation='lighter';
 for(let k=0;k<9;k++)gl(g,'#7ae8ff',-hw*.62+(k+.5)/9*hw*1.24,hh*.16,4,.5+.5*Math.sin(t*3-k*.6));
 // crown lightning
 if(((t*7)|0)%3!==0){const R=rnG((t*7)|0);g.strokeStyle='#e8f4ff';g.lineWidth=1.2;g.beginPath();for(let a=0;a<2+ph;a++){let x=(R()-.5)*hw*.8,y=-hh*.95;g.moveTo(x,y);for(let s=0;s<4;s++){x+=(R()-.5)*18;y+=R()*9;g.lineTo(x,y);}}g.stroke();}
 sym(g,()=>gl(g,a1,hw*.27,-hh*.95,8,.8));gl(g,a2,0,-hh*.5,30,.2+.12*Math.sin(t*1.6));g.globalCompositeOperation='source-over';},
xf(g,t){const p=Math.sin(t*1.6)*.03;g.scale(1+p,1-p);}};

// 6 Prism Reaver — manta-ray stealth ship with neon edge-lights
BD[6]={build(A,hw,hh,a1,a2){},base(g,hw,hh,a1,a2,A){
 const body=()=>{g.beginPath();g.moveTo(0,-hh*.55);g.bezierCurveTo(hw*.25,-hh*.55,hw*.6,-hh*.45,hw*.98,-hh*.05);g.bezierCurveTo(hw*.8,hh*.05,hw*.55,hh*.15,hw*.3,hh*.5);g.lineTo(hw*.2,hh*.82);g.lineTo(hw*.12,hh*.5);g.lineTo(0,hh*.55);
  g.lineTo(-hw*.12,hh*.5);g.lineTo(-hw*.2,hh*.82);g.lineTo(-hw*.3,hh*.5);g.bezierCurveTo(-hw*.55,hh*.15,-hw*.8,hh*.05,-hw*.98,-hh*.05);g.bezierCurveTo(-hw*.6,-hh*.45,-hw*.25,-hh*.55,0,-hh*.55);g.closePath();};
 // tail spine
 g.strokeStyle='#0a1a1e';g.lineWidth=4;g.beginPath();g.moveTo(0,-hh*.5);g.quadraticCurveTo(6,-hh*.8,0,-hh*1.05);g.stroke();g.strokeStyle=a1;g.lineWidth=1;g.stroke();
 body();fillGlow(g,a1,16,()=>{g.fillStyle=rg(g,0,-hh*.1,4,hw,['#2a5a64','#123038','#081418','#04080c']);g.fill();});
 g.save();body();g.clip();
 g.strokeStyle='#ffffff10';g.lineWidth=1;for(let k=-10;k<=10;k++){g.beginPath();g.moveTo(k*hw*.1,-hh);g.lineTo(k*hw*.06,hh);g.stroke();}
 g.fillStyle=lg(g,0,-hh*.5,0,hh*.2,['#5adcd060','#00000000']);g.fillRect(-hw,-hh,hw*2,hh*1.2);
 sym(g,()=>{sw(g,a2,1.2,()=>{g.beginPath();g.moveTo(hw*.1,-hh*.2);g.lineTo(hw*.35,-hh*.22);g.lineTo(hw*.45,-hh*.05);g.lineTo(hw*.7,-hh*.08);g.moveTo(hw*.15,hh*.1);g.lineTo(hw*.3,hh*.05);g.lineTo(hw*.4,hh*.2);},6);
  for(let k=0;k<4;k++){g.fillStyle=a1+'aa';g.fillRect(hw*(.16+k*.04),hh*.28,2,8);}});
 g.restore();
 body();g.strokeStyle=lg(g,-hw,0,hw,0,[a2,a1,a2]);g.lineWidth=1.8;g.stroke();
 // dorsal canopy
 fillGlow(g,a1,8,()=>{g.fillStyle=lg(g,0,-hh*.4,0,0,['#e0fff8','#3dffd0','#0a4a48']);bE(g,0,-hh*.22,hw*.08,hh*.2);g.fill();});
 g.fillStyle='#04080c';bE(g,0,hh*.25,16,16);g.fill();g.strokeStyle=a2;g.lineWidth=2;g.stroke();
 A.edge=[];for(let k=0;k<=12;k++){const u=k/12;A.edge.push([hw*(.04+u*.92),-hh*(.55-u*.5)+Math.sin(u*3)*-hh*.08]);}
},back(g,A,t,ph,hw,hh){},
front(g,A,t,ph,la,hw,hh,a1,a2){g.globalCompositeOperation='lighter';
 A.edge.forEach((p,k)=>{const a=Math.max(0,Math.sin(t*4-k*.6));sym(g,()=>gl(g,k%2?a1:a2,p[0],p[1],6,a));});
 g.globalAlpha=.12+.1*Math.sin(t*1.3);g.drawImage(A.base.c,-A.base.w/2,-A.base.h/2,A.base.w,A.base.h);g.globalAlpha=1;
 gl(g,a1,0,-hh*1.05,8,.9);sym(g,()=>gl(g,a2,hw*.25,-hh*.5,12+Math.sin(t*30)*2,.8));g.globalCompositeOperation='source-over';},
xf(g,t){g.scale(1+Math.sin(t*1.9)*.02,1-Math.sin(t*1.9)*.06);}};

// 7 Forgeheart Dreadnought — crescent-moon blade ship with a molten forge hub
BD[7]={build(A,hw,hh,a1,a2){A.blade=mk(20,hh*.9,g=>{const L=hh*.42;poly(g,[0,-L,5,-L*.3,3,L*.1,0,0],true);fillGlow(g,a2,8,()=>{g.fillStyle=lg(g,0,-L,0,0,['#fff0a0',a1,'#4a0a08']);g.fill();});},2);},
base(g,hw,hh,a1,a2){
 const cres=()=>{g.beginPath();g.ellipse(0,-hh*.35,hw*.92,hh*1.2,0,0,Math.PI);g.lineTo(-hw*.96,-hh*.85);g.ellipse(0,-hh*.7,hw*.8,hh*1.0,0,Math.PI,0,true);g.lineTo(hw*.96,-hh*.85);g.closePath();};
 cres();fillGlow(g,a1,20,()=>{g.fillStyle=lg(g,0,-hh*.6,0,hh*.85,['#3a1a1e','#6a2a20','#2a0c0c','#120404']);g.fill();});
 g.save();cres();g.clip();g.strokeStyle='#00000066';g.lineWidth=1.2;for(let k=-12;k<=12;k++){g.beginPath();g.moveTo(k*hw*.08,-hh);g.lineTo(k*hw*.1,hh);g.stroke();}
 g.strokeStyle='#ffcc3355';g.lineWidth=2;g.beginPath();g.ellipse(0,-hh*.45,hw*.9,hh*1.12,0,.15,Math.PI-.15);g.stroke();g.restore();
 cres();g.strokeStyle='#ffcc33';g.lineWidth=1.5;g.stroke();
 sw(g,a1,2.4,()=>{g.beginPath();g.ellipse(0,-hh*.7,hw*.8,hh*1.0,0,.1,Math.PI-.1);},10);
 // struts
 sym(g,()=>{poly(g,[hw*.08,hh*.1,hw*.45,hh*.35,hw*.42,hh*.48,hw*.06,hh*.3]);g.fillStyle='#3a1a18';g.fill();g.strokeStyle='#ffcc3399';g.lineWidth=1;g.stroke();});
 // dorsal blade fins
 sym(g,()=>{poly(g,[hw*.05,-hh*.2,hw*.28,-hh*.9,hw*.18,-hh*.15]);g.fillStyle=lg(g,0,-hh*.9,0,0,['#ffcc33','#7a2a14','#2a0a08']);g.fill();g.strokeStyle='#ffcc33';g.lineWidth=1;g.stroke();});
 // forge hub
 fillGlow(g,a1,16,()=>{g.fillStyle=rg(g,0,hh*.1,4,hh*.5,['#7a3a28','#3a1410','#140404']);g.beginPath();for(let k=0;k<8;k++){const a=k/8*T2+Math.PI/8;g.lineTo(Math.cos(a)*hh*.46,hh*.15+Math.sin(a)*hh*.46);}g.closePath();g.fill();});
 g.strokeStyle='#ffcc33';g.lineWidth=1.4;g.stroke();
 g.fillStyle='#0a0202';bE(g,0,hh*.25,17,17);g.fill();g.strokeStyle=a1;g.lineWidth=2.5;g.stroke();
},back(g,A,t,ph,hw,hh){},
front(g,A,t,ph,la,hw,hh,a1,a2){g.save();g.globalCompositeOperation='lighter';g.setLineDash([14,20]);g.lineDashOffset=-t*50;g.strokeStyle='#ffcc33cc';g.lineWidth=2.4;g.beginPath();g.ellipse(0,-hh*.7,hw*.8,hh*1.0,0,.12,Math.PI-.12);g.stroke();g.setLineDash([]);
 sym(g,()=>gl(g,a1,hw*.95,-hh*.84,10+Math.sin(t*9)*3,.9));sym(g,()=>gl(g,a2,hw*.27,-hh*.92,10+Math.sin(t*30)*2,.9));g.restore();
 for(let k=0;k<3;k++){g.save();g.translate(0,hh*.25);g.rotate(t*(1.5+ph*.8)+k/3*T2);g.globalAlpha=.9;dimg(g,A.blade,0,-26,A.blade.w/2,A.blade.h*.95);g.restore();}g.globalAlpha=1;}};

// 8 Hive Matriarch — bio-mechanical hive-ship with glowing egg pods and swaying tendrils
BD[8]={build(A,hw,hh,a1,a2){A.pods=[];const R=rnG(9);for(let k=0;k<9;k++){const s=k%2?1:-1;A.pods.push([s*hw*(.35+R()*.4),hh*(-.45+R()*.7),5+R()*4,R()*6]);}
 A.pod=mk(24,28,g=>{g.fillStyle=rg(g,-2,-3,1,10,['#f0d8ff','#c86bffcc','#4a1a6a']);bE(g,0,0,8,10);g.fill();g.strokeStyle='#e0b0ff';g.lineWidth=1;g.stroke();g.fillStyle='#2a0a3a88';bE(g,1,2,3,4,.3);g.fill();g.fillStyle='#ffffff66';bE(g,-3,-4,2,3,-.4);g.fill();},2);},
base(g,hw,hh,a1,a2,A){
 const blobs=[[0,0,hw*.48,hh*.62],[-hw*.5,-hh*.1,hw*.34,hh*.38],[hw*.5,-hh*.1,hw*.34,hh*.38],[0,-hh*.55,hw*.3,hh*.35],[-hw*.25,hh*.42,hw*.2,hh*.3],[hw*.25,hh*.42,hw*.2,hh*.3]];
 fillGlow(g,a1,14,()=>{blobs.forEach(b=>{g.fillStyle=rg(g,b[0]-b[2]*.3,b[1]-b[3]*.3,2,Math.max(b[2],b[3]),['#4a6a3a','#2a3a24','#14201a']);bE(g,b[0],b[1],b[2],b[3]);g.fill();});});
 g.strokeStyle='#9bff4a66';g.lineWidth=1.2;blobs.forEach(b=>{bE(g,b[0],b[1],b[2],b[3]);g.stroke();});
 blobs.forEach(b=>{g.fillStyle=rg(g,b[0],b[1],2,Math.max(b[2],b[3]),['#3a4a2e','#1e2a1a']);bE(g,b[0],b[1],b[2]*.94,b[3]*.92);g.fill();});
 // ribs
 g.strokeStyle='#0c140a';g.lineWidth=2.5;for(let k=-3;k<=3;k++){g.beginPath();g.ellipse(0,k*hh*.13,hw*.46,hh*.1,0,.2,Math.PI-.2);g.stroke();}
 g.strokeStyle='#6a8a4a55';g.lineWidth=1;for(let k=-3;k<=3;k++){g.beginPath();g.ellipse(0,k*hh*.13-1.5,hw*.44,hh*.1,0,.3,Math.PI-.3);g.stroke();}
 // veins
 const R=rnG(3);const vein=(x,y,a,l,d)=>{if(d>3)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+x2)/2+(R()-.5)*10,(y+y2)/2+(R()-.5)*10,x2,y2);g.stroke();vein(x2,y2,a+(R()-.5)*1.4,l*.7,d+1);if(R()<.6)vein(x2,y2,a+(R()-.5)*2,l*.6,d+1);};
 g.save();g.shadowColor=a1;g.shadowBlur=6;g.strokeStyle='#b8ff6a';g.lineWidth=1.2;for(let k=0;k<6;k++){const a=k/6*T2+.3;vein(0,hh*.25,a,hh*.3,0);}g.restore();
 // spore vents
 for(let k=-2;k<=2;k++){g.fillStyle='#0a1008';bE(g,k*hw*.1,-hh*.72,4,2.5);g.fill();g.strokeStyle='#c86bff';g.lineWidth=1;g.stroke();}
 A.pods.forEach(p=>{g.fillStyle='#1a0a24';bE(g,p[0],p[1],p[2]+2,p[2]*1.25+2);g.fill();});
 g.fillStyle='#0a1008';bE(g,0,hh*.25,17,17);g.fill();g.strokeStyle=a1;g.lineWidth=2.2;g.stroke();
},back(g,A,t,ph,hw,hh,a1){g.save();for(let k=0;k<6;k++){const s=k<3?-1:1,j=k%3,x0=s*hw*(.15+j*.2),y0=hh*(.45-j*.12);let x=x0,y=y0;const ang0=Math.PI/2+s*(.2+j*.35);
  for(let q=0;q<9;q++){const a=ang0+Math.sin(t*1.8+q*.5+k)*.35*(q/9),nx=x+Math.cos(a)*7,ny=y+Math.sin(a)*7;g.strokeStyle=q%2?'#3a4a2e':'#2a3a24';g.lineWidth=7-q*.65;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();x=nx;y=ny;}
  g.globalCompositeOperation='lighter';gl(g,'#c86bff',x,y,5,.5+.5*Math.sin(t*3+k));g.globalCompositeOperation='source-over';}g.restore();},
front(g,A,t,ph,la,hw,hh,a1,a2){A.pods.forEach((p,k)=>{const pu=1+Math.sin(t*2+p[3])*.08;g.drawImage(A.pod.c,p[0]-p[2]*pu,p[1]-p[2]*1.25*pu,p[2]*2*pu,p[2]*2.5*pu);});
 g.globalCompositeOperation='lighter';A.pods.forEach(p=>gl(g,'#c86bff',p[0],p[1],p[2]*1.8,.35+.35*Math.sin(t*2.5+p[3])));
 for(let k=-2;k<=2;k++)gl(g,a1,k*hw*.1,-hh*.75-((t*20+k*7)%14),4,.6);g.globalCompositeOperation='source-over';},
xf(g,t){const p=Math.sin(t*1.3)*.02;g.scale(1+p,1-p);}};

// 9 Oblivion Ark — multi-eyed overlord mothership with a rotating halo
BD[9]={build(A,hw,hh,a1,a2){A.eyes=[[-.62,-.1,7],[.62,-.1,7],[-.38,-.38,6],[.38,-.38,6],[-.4,.18,8],[.4,.18,8],[0,-.52,7],[-.18,-.18,5],[.18,-.18,5]];},
base(g,hw,hh,a1,a2,A){
 // side wings
 sym(g,()=>{poly(g,[hw*.4,-hh*.3,hw*1.0,-hh*.05,hw*.92,hh*.25,hw*.72,hh*.2,hw*.78,hh*.55,hw*.5,hh*.35]);fillGlow(g,a1,12,()=>{g.fillStyle=lg(g,hw*.4,-hh*.3,hw,hh*.5,['#4a2a5a','#1e1030','#0c0818']);g.fill();});g.strokeStyle=a1;g.lineWidth=1.3;g.stroke();
  sw(g,a2,1.2,()=>{g.beginPath();g.moveTo(hw*.5,-hh*.1);g.lineTo(hw*.88,hh*.05);g.moveTo(hw*.55,hh*.15);g.lineTo(hw*.75,hh*.4);},6);});
 // spires
 [[-.32,.65],[-.16,.85],[0,1.05],[.16,.85],[.32,.65]].forEach(p=>{const x=p[0]*hw;poly(g,[x-hw*.05,-hh*.4,x,-hh*.4-hh*p[1]*.55,x+hw*.05,-hh*.4]);g.fillStyle=lg(g,0,-hh,0,-hh*.4,['#ff9ad8','#5a2050','#1a0820']);g.fill();g.strokeStyle=a1;g.lineWidth=1;g.stroke();});
 // main hull
 const hull=()=>{g.beginPath();g.moveTo(0,-hh*.62);g.bezierCurveTo(hw*.45,-hh*.62,hw*.62,-hh*.3,hw*.6,hh*.1);g.bezierCurveTo(hw*.55,hh*.55,hw*.2,hh*.7,hw*.12,hh*.95);g.lineTo(0,hh*.75);g.lineTo(-hw*.12,hh*.95);g.bezierCurveTo(-hw*.2,hh*.7,-hw*.55,hh*.55,-hw*.6,hh*.1);g.bezierCurveTo(-hw*.62,-hh*.3,-hw*.45,-hh*.62,0,-hh*.62);g.closePath();};
 hull();fillGlow(g,a1,22,()=>{g.fillStyle=rg(g,0,-hh*.2,6,hw*.7,['#5a3070','#2a1440','#120820','#06030c']);g.fill();});
 g.save();hull();g.clip();g.strokeStyle='#ffffff12';g.lineWidth=1;for(let k=1;k<7;k++){g.beginPath();g.ellipse(0,hh*.25,hw*.1*k,hh*.11*k,0,0,T2);g.stroke();}
 g.strokeStyle='#00000080';g.lineWidth=2;sym(g,()=>{g.beginPath();g.moveTo(hw*.05,hh*.5);g.quadraticCurveTo(hw*.35,hh*.35,hw*.58,hh*.45);g.stroke();});g.restore();
 hull();g.strokeStyle=lg(g,-hw*.6,0,hw*.6,0,[a2,a1,a2]);g.lineWidth=1.8;g.stroke();
 sw(g,a1+'aa',1.2,()=>{g.beginPath();g.moveTo(0,-hh*.6);g.lineTo(0,-hh*.05);g.moveTo(0,hh*.5);g.lineTo(0,hh*.78);},8);
 A.eyes.forEach(e=>{g.fillStyle='#06020a';bE(g,e[0]*hw,e[1]*hh,e[2]+3,e[2]*.8+3);g.fill();g.strokeStyle=a1+'cc';g.lineWidth=1.2;g.stroke();});
 g.fillStyle='#06020a';bE(g,0,hh*.25,21,18);g.fill();g.strokeStyle=a1;g.lineWidth=2.5;g.stroke();
},back(g,A,t,ph,hw,hh,a1,a2){g.save();g.globalCompositeOperation='lighter';g.translate(0,-hh*.15);g.rotate(t*.3);g.strokeStyle=A.a2+'88';g.lineWidth=2;g.setLineDash([2,8,14,8]);g.beginPath();g.arc(0,0,hh*.95,0,T2);g.stroke();g.setLineDash([]);
 for(let k=0;k<8;k++){const a=k/8*T2;gl(g,k%2?A.a1:A.a2,Math.cos(a)*hh*.95,Math.sin(a)*hh*.95,6,.8);}g.restore();},
front(g,A,t,ph,la,hw,hh,a1,a2){A.eyes.forEach((e,k)=>{const x=e[0]*hw,y=e[1]*hh,r=e[2],cyc=(t*.7+k*.37)%3,bl=cyc<.12?.12:1;
  g.fillStyle=ph===2?'#ffd0d0':'#ffe8f8';bE(g,x,y,r,r*.8*bl);g.fill();if(bl>.5){g.fillStyle=ph===2?'#ff3a4a':ph===1?'#ffa030':a2;bE(g,x+Math.cos(la)*r*.35,y+Math.sin(la)*r*.3,r*.5,r*.5);g.fill();g.fillStyle='#000';bE(g,x+Math.cos(la)*r*.42,y+Math.sin(la)*r*.36,r*.22,r*.3);g.fill();}});
 g.globalCompositeOperation='lighter';A.eyes.forEach((e,k)=>gl(g,a1,e[0]*hw,e[1]*hh,e[2]*1.6,.25+.2*Math.sin(t*3+k)));[-.32,-.16,0,.16,.32].forEach((x,k)=>gl(g,a2,x*hw,-hh*.95+Math.abs(x)*hh*.9,6,.5+.5*Math.sin(t*4+k)));
 sym(g,()=>gl(g,a1,hw*.85,hh*.45,10+Math.sin(t*25)*2,.8));g.globalCompositeOperation='source-over';}};

// ---------------------------------------------------------------- assembly
function bossArt(i){if(BA.c[i])return BA.c[i];const [nm,w,h,a1,a2]=BOSS_DEF[i];const hw=w/2,hh=h/2,D=BD[i],A={a1,a2,hw,hh};D.build(A,hw,hh,a1,a2);
 const W=w+70,H=h+70;A.base=mk(W,H,g=>D.base(g,hw,hh,a1,a2,A),2);if(A.tips&&A.tipPts){A.tips=mk(W,H,g=>{g.globalCompositeOperation='lighter';A.tipPts.forEach(p=>{g.fillStyle=rg(g,p[0],p[1],0,6,['#ffffff',p[2]+'cc',p[2]+'00']);g.fillRect(p[0]-6,p[1]-6,12,12);});},2);}
 // damage layers: cracks masked to hull, and a hot tint for the last phase
 const R=rnG(i+40);const crack=(n)=>mk(W,H,g=>{for(let k=0;k<n;k++){let x=(R()-.5)*w*.7,y=(R()-.5)*h*.7;g.beginPath();g.moveTo(x,y);for(let s=0;s<5;s++){x+=(R()-.5)*22;y+=(R()-.5)*22;g.lineTo(x,y);}
   g.strokeStyle='#05020a';g.lineWidth=2.6;g.stroke();g.save();g.shadowColor='#ff6a2a';g.shadowBlur=6;g.strokeStyle='#ffb04a';g.lineWidth=.9;g.stroke();g.restore();}
  g.globalCompositeOperation='destination-in';g.drawImage(A.base.c,-W/2,-H/2,W,H);},2);
 A.cr1=crack(6);A.cr2=crack(10);
 A.hot=mk(W,H,g=>{g.drawImage(A.base.c,-W/2,-H/2,W,H);g.globalCompositeOperation='source-atop';g.fillStyle='#ff3a2a';g.fillRect(-W/2,-H/2,W,H);},2);
 A.wht=mk(W,H,g=>{g.drawImage(A.base.c,-W/2,-H/2,W,H);g.globalCompositeOperation='source-atop';g.fillStyle='#ffffff';g.fillRect(-W/2,-H/2,W,H);},2);
 return BA.c[i]=A;}
// override the old generic hull generator (game reuses this)
function bossSpr(i){return bossArt(i).base;}
const CORE_C=[null,'#ffa030','#ff3a4a'];
// draw boss i centred at current origin of context g. o={t,ph,la,fl,dead,coreOy}
function bossDraw(g,i,o){const A=bossArt(i),D=BD[i],t=o.t,ph=o.ph||0,hw=A.hw,hh=A.hh,a1=A.a1,a2=A.a2,b=A.base;g.save();
 if(D.xf)D.xf(g,t);
 D.back(g,A,t,ph,hw,hh,a1,a2);
 g.drawImage(b.c,-b.w/2,-b.h/2,b.w,b.h);
 if(ph>=1)g.drawImage(A.cr1.c,-b.w/2,-b.h/2,b.w,b.h);if(ph>=2)g.drawImage(A.cr2.c,-b.w/2,-b.h/2,b.w,b.h);
 if(ph>=2){g.globalAlpha=.12+.12*Math.sin(t*6);g.drawImage(A.hot.c,-b.w/2,-b.h/2,b.w,b.h);g.globalAlpha=1;}
 D.front(g,A,t,ph,o.la||Math.PI/2,hw,hh,a1,a2);
 // weak-point core
 const cy=hh*.25,cc=CORE_C[ph]||a2,pu=.85+.15*Math.sin(t*(4+ph*3)),cr=i===9?15:12;
 g.globalCompositeOperation='lighter';gl(g,cc,0,cy,cr*2.6*pu,.9);g.globalCompositeOperation='source-over';
 g.fillStyle=rg(g,-3,cy-3,1,cr,['#ffffff',cc,'#200818']);bE(g,0,cy,cr*pu,cr*pu);g.fill();
 g.save();g.translate(0,cy);g.rotate(t*1.5);g.strokeStyle='#ffffffcc';g.lineWidth=1.4;for(let k=0;k<4;k++){g.beginPath();g.arc(0,0,cr+5,k*Math.PI/2+.2,k*Math.PI/2+1.1);g.stroke();}g.restore();
 const la=o.la||Math.PI/2;g.fillStyle='#14061e';bE(g,Math.cos(la)*cr*.35,cy+Math.sin(la)*cr*.35,cr*.38,cr*.38);g.fill();g.fillStyle='#fff';bE(g,-cr*.3,cy-cr*.35,cr*.16,cr*.16);g.fill();
 if(o.fl>0){g.globalCompositeOperation='lighter';g.globalAlpha=.3;g.drawImage(A.wht.c,-b.w/2,-b.h/2,b.w,b.h);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
 if(o.dead){const d=Math.min(1,o.dead/2.8);g.globalCompositeOperation='lighter';g.globalAlpha=d*.85*(.6+.4*Math.sin(o.dead*30));g.drawImage(A.wht.c,-b.w/2,-b.h/2,b.w,b.h);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
 g.restore();}
