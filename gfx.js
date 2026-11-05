// Starzoomer — v6 art direction: polished vector sprites, layered parallax space, cinematic FX, neon glass HUD.
// Everything is still procedural canvas drawing, pre-rendered to offscreen canvases once (per stage for backgrounds).
'use strict';
const FX={snap:null,snapT:0,bomb:null,fw:0,fwC:0,shoot:[],t:0,comboPop:0,lastCombo:0,lastBombs:-1,hpLag:1,mf:0};
function rgba(c,a){if(Array.isArray(c))return'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+a+')';const n=parseInt(c.slice(1),16);return'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
function GL(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const s of st)gr.addColorStop(s[0],s[1]);return gr;}
function GR(g,x,y,r0,r1,st){const gr=g.createRadialGradient(x,y,r0,x,y,r1);for(const s of st)gr.addColorStop(s[0],s[1]);return gr;}
// ---------- value noise (seeded) ----------
function vnoise(seed){const P=new Uint8Array(512),V=new Float32Array(256);let s=(seed*9973+7)%2147483647||1;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 for(let i=0;i<256;i++){P[i]=i;V[i]=R();}for(let i=255;i>0;i--){const j=(R()*(i+1))|0;const t=P[i];P[i]=P[j];P[j]=t;}for(let i=0;i<256;i++)P[i+256]=P[i];
 return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,X=xi&255,Y=yi&255;const a=V[P[P[X]+Y]],b=V[P[P[X+1]+Y]],c=V[P[P[X]+Y+1]],d=V[P[P[X+1]+Y+1]];
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
function fbm(n,x,y,o){let s=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){s+=a*n(x*f,y*f);t+=a;f*=2.03;a*=.5;}return s/t;}
const smooth=(a,b,x)=>{x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x);};
function rampAt(r,v){if(v<=r[0][0])return r[0][1];for(let i=1;i<r.length;i++)if(v<=r[i][0]){const a=r[i-1],b=r[i],k=(v-a[0])/(b[0]-a[0]);return[a[1][0]+(b[1][0]-a[1][0])*k,a[1][1]+(b[1][1]-a[1][1])*k,a[1][2]+(b[1][2]-a[1][2])*k];}return r[r.length-1][1];}
// ---------- shading helpers ----------
// metallic body: cylindrical sweep, top light / bottom shade, inner bevel (dark low-right, bright rim up-left), crisp thin outline
function hull6(g,path,pal,hw,o){o=o||{};const c0=o.cx||0,H=o.h||20;g.save();if(o.glow){g.shadowColor=o.glow;g.shadowBlur=o.gb||6;}path();
 g.fillStyle=GL(g,c0-hw,0,c0+hw,0,[[0,pal[2]],[.3,pal[1]],[.48,pal[0]],[.64,pal[1]],[1,pal[2]]]);g.fill();g.restore();
 g.save();path();g.clip();g.fillStyle=GL(g,0,-H,0,H,[[0,'rgba(255,255,255,.32)'],[.42,'rgba(255,255,255,0)'],[.7,'rgba(0,0,20,0)'],[1,'rgba(0,0,30,.5)']]);g.fillRect(-80,-80,160,160);
 g.save();g.translate(-.8,-1);path();g.strokeStyle='rgba(8,0,28,.55)';g.lineWidth=1.5;g.stroke();g.restore();
 g.save();g.translate(.7,.9);path();g.strokeStyle=o.rim||'rgba(255,255,255,.75)';g.lineWidth=1;g.stroke();g.restore();g.restore();
 path();g.strokeStyle='rgba(6,2,22,.92)';g.lineWidth=.75;g.stroke();}
function canopy(g,x,y,rx,ry,c){g.save();g.beginPath();g.ellipse(x,y,rx+1,ry+1.1,0,0,7);g.fillStyle='rgba(12,8,34,.95)';g.fill();
 g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fillStyle=GR(g,x-rx*.3,y-ry*.4,0,ry*1.3,[[0,c[0]],[.45,c[1]],[1,c[2]]]);g.fill();g.clip();
 g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(x-rx*.38,y-ry*.3,rx*.26,ry*.42,-.15,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(x+rx*.4,y+ry*.55,rx*.55,ry*.22,0,0,7);g.fill();g.restore();}
function nozzle(g,x,y,w,h,hot){g.beginPath();g.moveTo(x-w*.7,y-h);g.lineTo(x+w*.7,y-h);g.lineTo(x+w,y);g.lineTo(x-w,y);g.closePath();
 g.fillStyle=GL(g,x-w,0,x+w,0,[[0,'#16162a'],[.45,'#8a8aa8'],[1,'#16162a']]);g.fill();g.strokeStyle='rgba(5,2,20,.9)';g.lineWidth=.6;g.stroke();
 g.save();g.shadowColor=hot;g.shadowBlur=4;g.fillStyle=hot;g.beginPath();g.ellipse(x,y,w*.78,1.1,0,0,7);g.fill();g.restore();}
function eye(g,x,y,r,iris,look){look=look||0;g.fillStyle='#0c0618';g.beginPath();g.ellipse(x,y,r*1.14,r*1.24,0,0,7);g.fill();
 g.fillStyle=GR(g,x,y-r*.35,0,r*1.1,[[0,'#ffffff'],[1,'#cfd6ee']]);g.beginPath();g.ellipse(x,y,r,r*1.1,0,0,7);g.fill();
 g.fillStyle=GR(g,x+look,y+r*.2,0,r*.62,[[0,'#ffffff'],[.3,iris],[1,'#12041e']]);g.beginPath();g.arc(x+look,y+r*.2,r*.6,0,7);g.fill();
 g.fillStyle='#05010c';g.beginPath();g.arc(x+look,y+r*.22,r*.27,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+look-r*.24,y-r*.04,r*.2,0,7);g.fill();}
function shine(g,x,y,rx,ry,a,rot){g.fillStyle='rgba(255,255,255,'+a+')';g.beginPath();g.ellipse(x,y,rx,ry,rot===undefined?-.55:rot,0,7);g.fill();}
function tintOf(s,col){const c=mkC(s.c.width,s.c.height),g=c.getContext('2d');g.drawImage(s.c,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;}
// ---------- player ships ----------
function shipKite(g){const ORA=['#ffe6b8','#ff8a2a','#7a2204'],STEEL=['#ffffff','#bcc6de','#3a4262'],BLU=['#c8ecff','#2b7bff','#0a1f66'];
 const wing=()=>poly(g,[0,-6,-22,10,-21,16,-7,13,0,13],true);hull6(g,wing,ORA,22,{glow:'rgba(255,120,40,.85)',gb:8,h:16});
 [-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[-5,-2,-20,9,-21.2,11.2,-6,1.4]),BLU,22,{h:12});
  g.strokeStyle='rgba(70,14,0,.6)';g.lineWidth=.55;g.beginPath();g.moveTo(-8,5.5);g.lineTo(-17,12.6);g.moveTo(-11.5,13.4);g.lineTo(-14.2,10.6);g.stroke();
  g.strokeStyle='rgba(255,236,200,.5)';g.beginPath();g.moveTo(-8,6.3);g.lineTo(-16.6,13.2);g.stroke();
  g.save();g.shadowColor='#7fe8ff';g.shadowBlur=5;g.fillStyle='#d8fbff';g.fillRect(-21.6,12.4,3,1.8);g.restore();g.restore();});
 const fus=()=>poly(g,[0,-26,4,-15,6.5,-2,7,8,6,17,-6,17,-7,8,-6.5,-2,-4,-15]);hull6(g,fus,STEEL,7,{h:26});
 g.save();fus();g.clip();g.fillStyle=GL(g,0,-26,0,17,[[0,'#ffd88a'],[1,'#ff5a12']]);g.fillRect(-1.2,-24,2.4,41);
 g.fillStyle='rgba(16,8,36,.9)';g.fillRect(-6.6,2,2.1,7);g.fillRect(4.5,2,2.1,7);
 g.strokeStyle='rgba(30,30,70,.45)';g.lineWidth=.5;g.beginPath();g.moveTo(-6.5,11);g.lineTo(6.5,11);g.moveTo(-5.5,-1);g.lineTo(5.5,-1);g.stroke();g.restore();
 canopy(g,0,-10,3.1,6.2,['#eaffff','#3ac8ff','#0a2a7a']);nozzle(g,-3.6,19.5,2.6,3,'#ffe0b0');nozzle(g,3.6,19.5,2.6,3,'#ffe0b0');}
function shipDart(g){const PINK=['#ffd8f2','#ff3fa6','#6a0a40'],PEARL=['#ffffff','#e4dcff','#544686'],GOLD=['#fff8c8','#ffd23a','#8a5a00'];
 hull6(g,()=>poly(g,[0,-3,-12,1,-24,4,-23,8,-9,12,0,12],true),PINK,24,{glow:'rgba(255,80,190,.85)',gb:8,h:14});
 [-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[-9,3,-23,5,-22.6,7.4,-10,8.2]),GOLD,8,{h:6,cx:-16});
  hull6(g,()=>poly(g,[-4,8,-12,18,-10,19.2,-4,14]),['#d4ecff','#3a9bff','#0a2866'],5,{h:10,cx:-8});
  hull6(g,()=>poly(g,[-3,-14,-9,-9,-8.4,-7,-3,-10]),PINK,4,{h:6,cx:-6});
  g.save();g.shadowColor='#ff8ad8';g.shadowBlur=5;g.fillStyle='#fff';g.beginPath();g.arc(-23,6,1.2,0,7);g.fill();g.restore();g.restore();});
 const fus=()=>poly(g,[0,-27,3,-16,4.6,-2,4.6,10,3.4,18,-3.4,18,-4.6,10,-4.6,-2,-3,-16]);hull6(g,fus,PEARL,5,{h:26});
 g.save();fus();g.clip();g.fillStyle=GL(g,0,2,0,18,[[0,'#ffe14a'],[1,'#ff6a2a']]);g.fillRect(-.8,2,1.6,16);
 g.strokeStyle='rgba(60,40,110,.5)';g.lineWidth=.5;g.beginPath();g.moveTo(-4.6,4);g.lineTo(4.6,4);g.moveTo(-4.6,11);g.lineTo(4.6,11);g.stroke();g.restore();
 canopy(g,0,-10,2.5,6.5,['#ffffff','#9ef0ff','#1c4fc0']);nozzle(g,0,20.5,3,3,'#ffe6f6');}
function shipTitan(g){const VIO=['#e6d2ff','#7a3ae0','#220850'],GUN=['#dcd8f0','#6a6488','#1c182e'],ORA=['#ffe6a8','#ff7a1a','#6a2000'];
 hull6(g,()=>poly(g,[0,-12,-13,-9,-24,5,-23,15,-11,19,0,16],true),VIO,24,{glow:'rgba(160,90,255,.85)',gb:8,h:18});
 [-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[-13,-7,-23,6,-15,9]),ORA,6,{h:10,cx:-18});
  hull6(g,()=>poly(g,[-10.5,1,-5,1,-4.6,19,-11,19]),GUN,4,{h:12,cx:-7.8});
  g.save();g.shadowColor='#ffcf5a';g.shadowBlur=4;g.fillStyle='#ffe08a';g.fillRect(-21,9.4,4.4,2.2);g.restore();
  g.strokeStyle='rgba(255,214,130,.65)';g.lineWidth=.6;g.beginPath();g.moveTo(-13.4,-5.6);g.lineTo(-21.4,6.4);g.stroke();g.restore();});
 const fus=()=>poly(g,[0,-27,5.5,-17,8,-4,8,10,6.5,19,-6.5,19,-8,10,-8,-4,-5.5,-17]);hull6(g,fus,['#f6ecff','#a07ae0','#361868'],8,{h:26});
 g.save();fus();g.clip();g.fillStyle='rgba(18,6,40,.8)';poly(g,[0,1,6,11,-6,11]);g.fill();
 g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,7,0,5,[[0,'#ffffff'],[.35,'#5af0ff'],[1,'rgba(40,180,255,0)']]);g.beginPath();g.arc(0,7,5,0,7);g.fill();g.globalCompositeOperation='source-over';
 g.strokeStyle='rgba(40,20,80,.55)';g.lineWidth=.6;g.beginPath();g.moveTo(-8,-2);g.lineTo(8,-2);g.moveTo(-7,14);g.lineTo(7,14);g.stroke();g.restore();
 canopy(g,0,-12,3.4,6,['#fffae6','#ffc04a','#a03a08']);nozzle(g,-7.8,21.5,3.2,3.2,'#ffd49a');nozzle(g,7.8,21.5,3.2,3.2,'#ffd49a');}
const SHIP_PAL=[['#ffe6b8','#ff8a2a','#6a1e04'],['#ffd8f2','#ff3fa6','#5a0838'],['#e6d2ff','#7a3ae0','#1e0848']];
function shipTier(i,t){const base=[shipKite,shipDart,shipTitan][i],sc=1+t*.09,W=50+t*14,H=58+t*8;const [a1,a2,a3]=SHIP_ACC[i],tc=TIER_COL[t],pal=SHIP_PAL[i];
 return mk(W,H,g=>{
  if(t>=2){const k=t>=4?1.25:t>=3?1.1:1;[-1,1].forEach(s=>{g.save();g.scale(s,1);
   const w=i===0?()=>poly(g,[8,2,34*k,14,30*k,20,10,16]):i===1?()=>poly(g,[6,-2,36*k,-12,32*k,-6,10,12]):()=>poly(g,[10,-6,30*k,-2,32*k,14,22*k,20,10,18]);
   hull6(g,w,pal,14*k,{glow:tc,gb:7,h:16,cx:21*k});
   g.save();w();g.clip();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(tc,.7);g.lineWidth=1.6;
   g.beginPath();if(i===1){g.moveTo(8,-2.6);g.lineTo(36*k,-12.6);}else if(i===0){g.moveTo(8,1.4);g.lineTo(34*k,13.4);}else{g.moveTo(10,-6.6);g.lineTo(30*k,-2.6);}g.stroke();g.restore();
   g.save();g.shadowColor=tc;g.shadowBlur=6;g.fillStyle='#fff';if(i===1)g.fillRect(28*k,-11,4,2.2);else g.fillRect(26*k,14.6,5,2.2);g.restore();g.restore();});}
  if(t>=4)[-1,1].forEach(s=>{hull6(g,()=>poly(g,[s*5,-14,s*12,-34,s*10,-14]),['#ffffff',tc,a2],4,{glow:tc,gb:6,h:20,cx:s*9});});
  g.save();g.scale(sc,sc);base(g);g.restore();
  const pod=(x,y,len)=>{hull6(g,()=>poly(g,[x-2.6,y-len,x+2.6,y-len,x+2.9,y+6,x-2.9,y+6]),['#eef0ff','#7a7aa0','#20203a'],3,{h:len,cx:x});
   g.save();g.shadowColor=tc;g.shadowBlur=6;g.fillStyle=tc;g.fillRect(x-1.6,y-len-2,3.2,2.4);g.restore();
   g.fillStyle=GR(g,x-1,y+3,0,3.6,[[0,'#ffffff'],[.4,a2],[1,a3]]);g.beginPath();g.arc(x,y+4,3.2,0,7);g.fill();g.strokeStyle='rgba(6,2,22,.9)';g.lineWidth=.7;g.stroke();};
  if(t>=1){const px=13*sc;[-1,1].forEach(s=>pod(s*px,0,11+t));}
  if(t>=3){const px=21*sc;[-1,1].forEach(s=>pod(s*px,8,8+t));}
  if(t>=2){g.save();g.shadowColor=tc;g.shadowBlur=8;g.fillStyle=GR(g,0,4,0,4.5,[[0,'#ffffff'],[1,tc]]);poly(g,[0,0,3,4,0,8,-3,4]);g.fill();g.restore();}
 },2.5);}
// nozzle layout per ship [x,y] in base-ship units, plus pod nozzles per tier (in sprite units)
const NOZ=[[[-3.6,19.5],[3.6,19.5]],[[0,20.5]],[[-7.8,21.5],[7.8,21.5]]];
// ---------- alien craft (characterful, shaded; live parts are animated in render) ----------
const AL={
 zig(g){[-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[7,-5,17,-12,15.5,-5,16.6,5,8,4]),['#fff8c0','#ffcf2a','#7a4800'],5,{h:10,cx:12,glow:'rgba(255,200,60,.6)',gb:4});g.restore();});
  g.save();g.shadowColor='#3dffb0';g.shadowBlur=8;g.beginPath();g.arc(0,0,11,0,7);g.fillStyle=GR(g,-4,-5,.5,13,[[0,'#eafff6'],[.35,'#4ef0b0'],[.8,'#0c8a5e'],[1,'#043a2a']]);g.fill();g.restore();
  g.save();g.beginPath();g.arc(0,0,11,0,7);g.clip();g.fillStyle=GL(g,0,5,0,11,[[0,'#3a4a7a'],[1,'#0a1230']]);g.fillRect(-12,5.5,24,7);
  g.fillStyle='#8af6ff';for(let k=-2;k<=2;k++)g.fillRect(k*4-.7,7.4,1.4,1.4);g.strokeStyle='rgba(170,255,225,.9)';g.lineWidth=1.2;g.beginPath();g.arc(.6,.8,10.3,.5,2.5);g.stroke();g.restore();
  eye(g,0,-1.5,5.4,'#9a3aff',0);shine(g,-5.6,-6.6,2.6,1.3,.55);
  g.strokeStyle='rgba(2,30,20,.9)';g.lineWidth=.8;g.beginPath();g.arc(0,0,11,0,7);g.stroke();
  g.strokeStyle='#c8ffe8';g.lineWidth=1;g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(2,-14,1,-15.6);g.stroke();g.save();g.shadowColor='#ff6ad8';g.shadowBlur=4;g.fillStyle='#ffd0f4';g.beginPath();g.arc(1,-15.6,1.3,0,7);g.fill();g.restore();},
 sine(g){for(let i=-2;i<=2;i++){g.strokeStyle=GL(g,0,3,0,16,[[0,'#eab0ff'],[1,'rgba(200,90,255,0)']]);g.lineWidth=2.3-Math.abs(i)*.35;g.beginPath();g.moveTo(i*3.6,3);g.bezierCurveTo(i*3.6+3,7,i*3.6-3,11,i*3.6+1,16);g.stroke();}
  const dome=()=>{g.beginPath();g.moveTo(-12.5,3);g.bezierCurveTo(-13,-13,13,-13,12.5,3);g.quadraticCurveTo(6,6,0,4);g.quadraticCurveTo(-6,6,-12.5,3);g.closePath();};
  g.save();g.shadowColor='#c86bff';g.shadowBlur=9;dome();g.fillStyle=GR(g,-3,-7,1,15,[[0,'#fcefff'],[.4,'#c070ff'],[.85,'#5a1aa8'],[1,'#2a0860']]);g.fill();g.restore();
  g.save();dome();g.clip();g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,0,0,6.5,[[0,'rgba(255,150,240,.75)'],[1,'rgba(255,120,240,0)']]);g.beginPath();g.arc(0,0,6.5,0,7);g.fill();
  g.globalCompositeOperation='source-over';g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=.6;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*4.4,3.5);g.quadraticCurveTo(k*3,-6,k*1.4,-9.5);g.stroke();}g.restore();
  dome();g.strokeStyle='rgba(30,0,60,.85)';g.lineWidth=.8;g.stroke();
  eye(g,-4.3,-3.6,2.7,'#ff4fb8',.4);eye(g,4.3,-3.6,2.7,'#ff4fb8',-.4);shine(g,-6.2,-8.4,3,1.3,.6);
  g.fillStyle='rgba(255,120,210,.7)';g.beginPath();g.arc(-8.6,0,1.5,0,7);g.fill();g.beginPath();g.arc(8.6,0,1.5,0,7);g.fill();},
 vwing(g){hull6(g,()=>poly(g,[0,-6,-8,-10,-18,-3,-16,8,-9,3,-4,10,0,6],true),['#ffd8ee','#ff3f8a','#62062e'],18,{glow:'rgba(255,70,150,.85)',gb:7,h:12});
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.strokeStyle='rgba(90,0,40,.6)';g.lineWidth=.6;g.beginPath();g.moveTo(-6,-6.5);g.lineTo(-15,-1.5);g.moveTo(-8,2);g.lineTo(-14,6);g.stroke();
   hull6(g,()=>poly(g,[-15,-1,-12,5,-9,1]),['#fff8c8','#ffd34a','#8a5a00'],3,{h:4,cx:-12});
   g.save();g.shadowColor='#ffd34a';g.shadowBlur=4;g.fillStyle='#fff';g.beginPath();g.arc(-17,-2.6,1,0,7);g.fill();g.restore();g.restore();});
  g.save();g.shadowColor='#41c8ff';g.shadowBlur=6;g.beginPath();g.arc(0,-1,5.6,0,7);g.fillStyle=GR(g,-1.5,-3,.5,6,[[0,'#eafcff'],[.5,'#41c8ff'],[1,'#0a3a7a']]);g.fill();g.restore();
  g.beginPath();g.arc(0,-1,5.6,0,7);g.strokeStyle='rgba(10,0,30,.9)';g.lineWidth=.8;g.stroke();
  eye(g,-2.2,-.8,1.8,'#ff2a6a',0);eye(g,2.2,-.8,1.8,'#ff2a6a',0);shine(g,-2.6,-4.6,1.9,.8,.7,-.4);},
 diver(g){[-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GR(g,-12,-5,0,7,[[0,'rgba(225,250,255,.8)'],[1,'rgba(120,200,255,.25)']]);g.beginPath();g.ellipse(-12,-5,6.4,3.2,.5,0,7);g.fill();
   g.strokeStyle='rgba(205,240,255,.85)';g.lineWidth=.5;g.stroke();g.beginPath();g.moveTo(-7,-3);g.lineTo(-16.5,-7.2);g.stroke();g.restore();});
  const b=()=>poly(g,[0,15,-6,4,-11,-6,-9,-12,-3,-9,0,-12],true);hull6(g,b,['#fff8c8','#ffc21a','#6a3a00'],11,{glow:'rgba(255,200,40,.8)',gb:7,h:14});
  g.save();b();g.clip();g.fillStyle='rgba(40,16,70,.85)';for(let y=-2;y<=10;y+=4.5)g.fillRect(-10,y,20,1.8);g.restore();
  g.fillStyle=GL(g,0,10,0,17,[[0,'#ffeaa8'],[1,'#ff5a1a']]);poly(g,[0,17.5,-1.7,12,1.7,12]);g.fill();
  eye(g,-3.2,-6.5,2.3,'#3a9bff',0);eye(g,3.2,-6.5,2.3,'#3a9bff',0);shine(g,-5.4,-1,1.3,3,.5,.2);},
 kami(g){[-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[-5,-6,-13.4,-12.4,-12,-3,-6,2]),['#ffd4b8','#d02a1a','#420406'],4,{h:8,cx:-9});g.restore();});
  const b=()=>poly(g,[0,16,-8,-2,-7,-11,0,-8],true);hull6(g,b,['#ffc6a8','#ff3a2a','#600408'],8,{glow:'rgba(255,60,40,.9)',gb:8,h:14});
  g.save();b();g.clip();g.fillStyle=GL(g,0,3,0,15,[[0,'#ffe14a'],[1,'#ff7a1a']]);poly(g,[0,14,-3.5,4,3.5,4]);g.fill();g.fillStyle='rgba(30,0,10,.5)';g.fillRect(-8,1,16,1.2);g.restore();
  eye(g,-3.4,-4,2.4,'#ffe14a',0);eye(g,3.4,-4,2.4,'#ffe14a',0);
  g.strokeStyle='#1a0008';g.lineWidth=1.6;g.beginPath();g.moveTo(-7.2,-8.6);g.lineTo(-1.5,-6.6);g.moveTo(7.2,-8.6);g.lineTo(1.5,-6.6);g.stroke();},
 saucer(g){g.save();g.beginPath();g.ellipse(0,-3,9.6,9.6,0,Math.PI,0);g.closePath();g.fillStyle=GR(g,-3,-9,0,11,[[0,'rgba(240,255,255,.95)'],[.5,'rgba(120,220,255,.55)'],[1,'rgba(40,120,200,.65)']]);g.fill();g.clip();
  g.fillStyle=GR(g,-1,-6.5,0,6,[[0,'#d8ffb0'],[.6,'#5ae84a'],[1,'#1a7a2a']]);g.beginPath();g.ellipse(0,-5,5,5.6,0,0,7);g.fill();
  eye(g,-2.1,-6,1.5,'#ff3a6a',0);eye(g,2.1,-6,1.5,'#ff3a6a',0);shine(g,-4.6,-8,2,3.6,.75,-.5);g.restore();
  const d=()=>{g.beginPath();g.ellipse(0,1.5,20,6.2,0,0,7);};
  g.save();g.shadowColor='#36d6ff';g.shadowBlur=8;d();g.fillStyle=GL(g,0,-4.7,0,7.7,[[0,'#f6f8ff'],[.35,'#aab6e2'],[.6,'#4a5288'],[1,'#181838']]);g.fill();g.restore();
  g.save();d();g.clip();g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.8;g.beginPath();g.ellipse(0,1,19,5.3,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  g.strokeStyle='rgba(20,20,50,.6)';g.lineWidth=.6;g.beginPath();g.ellipse(0,2.6,14,3.4,0,0,Math.PI);g.stroke();g.restore();d();g.strokeStyle='rgba(8,6,30,.9)';g.lineWidth=.8;g.stroke();
  g.fillStyle=GL(g,0,5,0,11,[[0,'#3a3a6a'],[1,'#141430']]);g.beginPath();g.ellipse(0,7,6,3,0,0,Math.PI);g.fill();
  g.save();g.shadowColor='#ff8a2a';g.shadowBlur=6;g.fillStyle='#ffd49a';g.beginPath();g.ellipse(0,8.6,3,1.2,0,0,7);g.fill();g.restore();},
 shield(g){const b=()=>poly(g,[0,-14,-12,-12,-17,-2,-14,10,-6,14,0,12],true);hull6(g,b,['#dae8ff','#3a6aff','#0a1866'],17,{glow:'rgba(80,140,255,.85)',gb:8,h:15});
  g.save();b();g.clip();g.strokeStyle='rgba(5,10,40,.7)';g.lineWidth=.8;g.beginPath();g.moveTo(0,-14);g.lineTo(0,14);g.stroke();
  g.strokeStyle='rgba(170,210,255,.3)';for(let k=0;k<3;k++){g.beginPath();g.arc(0,-2,6+k*4,.25,Math.PI-.25);g.stroke();}
  g.fillStyle=GL(g,0,-3.2,0,1.2,[[0,'#fff4a8'],[.5,'#ffc21a'],[1,'#7a4a00']]);g.fillRect(-17,-3.2,34,4.4);g.fillStyle='#ff6a2a';[-9,-4.5,4.5,9].forEach(x=>g.fillRect(x-.8,-1.8,1.6,1.6));g.restore();
  g.beginPath();g.arc(0,-8,5,0,7);g.fillStyle=GR(g,-1.5,-9.5,0,5.5,[[0,'#40408a'],[1,'#0a0a24']]);g.fill();g.strokeStyle='rgba(150,200,255,.6)';g.lineWidth=.6;g.stroke();
  eye(g,-2,-8,1.6,'#7ae8ff',0);eye(g,2,-8,1.6,'#7ae8ff',0);
  [-10,10].forEach(x=>{g.save();g.shadowColor='#7ae8ff';g.shadowBlur=5;g.fillStyle=GR(g,x,6,0,2.3,[[0,'#ffffff'],[1,'#3ad8ff']]);g.beginPath();g.arc(x,6,2,0,7);g.fill();g.restore();});},
 split(g){const b=()=>{g.beginPath();for(let i=0;i<=28;i++){const a=i/28*TAU,r=12+Math.sin(a*6)*1.5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();};
  g.save();g.shadowColor='#ff8a2a';g.shadowBlur=8;b();g.fillStyle=GR(g,-4,-5,1,14,[[0,'#fff2cc'],[.4,'#ff9a3a'],[.85,'#a83600'],[1,'#401200']]);g.fill();g.restore();
  g.save();b();g.clip();g.strokeStyle='rgba(255,240,180,.8)';g.lineWidth=1;g.setLineDash([2,2]);g.beginPath();g.moveTo(0,-13);g.lineTo(0,13);g.stroke();g.setLineDash([]);
  g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,2,0,7,[[0,'rgba(255,220,120,.55)'],[1,'rgba(255,140,40,0)']]);g.beginPath();g.arc(0,2,7,0,7);g.fill();g.restore();
  b();g.strokeStyle='rgba(40,8,0,.85)';g.lineWidth=.8;g.stroke();eye(g,-4.5,-2,2.8,'#3a9bff',.3);eye(g,4.5,-2,2.8,'#3a9bff',-.3);
  g.strokeStyle='#5a1400';g.lineWidth=1.2;g.beginPath();g.arc(0,4.5,3.4,.25,2.9);g.stroke();shine(g,-6,-8,3,1.5,.55,-.6);},
 mini(g){g.save();g.shadowColor='#ffb02a';g.shadowBlur=6;g.beginPath();g.arc(0,0,7,0,7);g.fillStyle=GR(g,-2.5,-3,.5,8,[[0,'#fff8d8'],[.45,'#ffb03a'],[1,'#7a3200']]);g.fill();g.restore();
  g.beginPath();g.arc(0,0,7,0,7);g.strokeStyle='rgba(40,10,0,.85)';g.lineWidth=.7;g.stroke();eye(g,-2.4,-1,1.7,'#3a9bff',0);eye(g,2.4,-1,1.7,'#3a9bff',0);shine(g,-3.6,-4.4,1.8,.9,.6,-.6);},
 mine(g){for(let i=0;i<8;i++){g.save();g.rotate(i/8*TAU);hull6(g,()=>poly(g,[7,-2.2,15,0,7,2.2]),['#ffe4f8','#e03ac0','#40043a'],2.2,{h:2.2,cx:0});
   g.save();g.shadowColor='#ff4fd8';g.shadowBlur=4;g.fillStyle='#fff';g.beginPath();g.arc(15,0,1,0,7);g.fill();g.restore();g.restore();}
  g.save();g.shadowColor='#ff4fd8';g.shadowBlur=8;g.beginPath();g.arc(0,0,9,0,7);g.fillStyle=GR(g,-3,-3.5,.5,10,[[0,'#ffeafc'],[.4,'#d838b8'],[1,'#360430']]);g.fill();g.restore();
  g.beginPath();g.arc(0,0,9,0,7);g.strokeStyle='rgba(30,0,30,.9)';g.lineWidth=.8;g.stroke();g.strokeStyle='rgba(255,180,240,.5)';g.lineWidth=.7;g.beginPath();g.arc(0,0,6.6,0,7);g.stroke();
  eye(g,0,-.5,3,'#ff3a3a',0);shine(g,-4,-5,2,1,.55,-.6);}};
// live animated parts per alien: c=[x,y,glowKey,size] pulsing core light, f=[x,y,glowKey] engine flame (points to -y in sprite space)
const EANIM={zig:{c:[0,-1.5,'g',1]},sine:{c:[0,0,'v',1.3]},vwing:{c:[0,-1,'c',.9],flap:1},diver:{f:[0,-12,'y']},kami:{f:[0,-9,'o']},saucer:{lights:1,c:[0,8.6,'o',.9]},
 shield:{c:[0,-8,'c',.8]},split:{c:[0,1,'o',1.2]},mini:{c:[0,0,'y',.6]},mine:{c:[0,0,'p',1.4]}};
function rockSpr(r,seed,tint){let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};return mk(r*2+6,r*2+6,g=>{const pts=[];const n=13;for(let i=0;i<n;i++){const a=i/n*TAU,rr=r*(.8+R()*.24);pts.push(Math.cos(a)*rr,Math.sin(a)*rr);}
 g.save();poly(g,pts);g.fillStyle=GR(g,-r*.45,-r*.5,r*.05,r*1.3,[[0,tint[0]],[.45,tint[1]],[1,tint[2]]]);g.fill();g.clip();
 for(let i=0;i<5;i++){const x=(R()-.5)*r*1.2,y=(R()-.5)*r*1.2,cr=r*(.1+R()*.2);g.fillStyle='rgba(0,0,0,.34)';g.beginPath();g.arc(x,y,cr,0,7);g.fill();
  g.strokeStyle='rgba(255,240,220,.22)';g.lineWidth=Math.max(.6,cr*.3);g.beginPath();g.arc(x,y,cr*.8,-.3,1.9);g.stroke();}
 g.fillStyle=GR(g,r*.55,r*.6,r*.15,r*1.45,[[0,'rgba(0,0,12,.6)'],[1,'rgba(0,0,12,0)']]);g.fillRect(-r*1.3,-r*1.3,r*2.6,r*2.6);
 g.save();g.translate(-.9,-1.1);poly(g,pts);g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=2;g.stroke();g.restore();
 g.save();g.translate(.9,1.1);poly(g,pts);g.strokeStyle='rgba(255,226,180,.6)';g.lineWidth=1.3;g.stroke();g.restore();
 g.strokeStyle='rgba(110,170,255,.35)';g.lineWidth=1.6;g.beginPath();g.arc(0,0,r*.95,.15,1.45);g.stroke();g.restore();
 poly(g,pts);g.strokeStyle='rgba(10,4,20,.85)';g.lineWidth=.8;g.stroke();});}
// ---------- player shots / misc sprites ----------
function bolt6(c,w,h){return mk(w*3.2,h+w*2.6,g=>{const hh=h/2;g.globalCompositeOperation='lighter';
 g.save();g.scale(1,(hh+w*1.1)/(w*1.5));g.fillStyle=GR(g,0,0,0,w*1.5,[[0,rgba(c,.8)],[.45,rgba(c,.32)],[1,rgba(c,0)]]);g.beginPath();g.arc(0,0,w*1.5,0,7);g.fill();g.restore();
 g.fillStyle=GL(g,0,-hh,0,hh,[[0,'#ffffff'],[.55,rgba(c,1)],[1,rgba(c,.15)]]);g.beginPath();g.ellipse(0,0,w*.44,hh,0,0,7);g.fill();
 g.fillStyle='#fff';g.beginPath();g.ellipse(0,-hh*.25,w*.2,hh*.55,0,0,7);g.fill();},3);}
function missile6(){return mk(12,18,g=>{g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,3,0,7,[[0,'rgba(80,255,130,.6)'],[1,'rgba(80,255,130,0)']]);g.beginPath();g.arc(0,3,7,0,7);g.fill();g.globalCompositeOperation='source-over';
 hull6(g,()=>poly(g,[0,-7.5,2,-3,2,4,-2,4,-2,-3]),['#ffffff','#a8ffbe','#167a36'],2,{h:6});g.fillStyle='#3aff6a';poly(g,[-2,1.6,-3.8,5,-2,4.6]);g.fill();poly(g,[2,1.6,3.8,5,2,4.6]);g.fill();},3);}
function plumeSpr(c){return mk(16,48,g=>{g.globalCompositeOperation='lighter';
 g.save();g.shadowColor=rgba(c,1);g.shadowBlur=6;g.fillStyle=GL(g,0,-24,0,24,[[0,rgba(c,.95)],[.35,rgba(c,.5)],[1,rgba(c,0)]]);g.beginPath();g.moveTo(-5.5,-24);g.quadraticCurveTo(-7,0,0,24);g.quadraticCurveTo(7,0,5.5,-24);g.closePath();g.fill();g.restore();
 g.fillStyle=GL(g,0,-24,0,6,[[0,'rgba(255,255,255,1)'],[.5,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.moveTo(-2.4,-24);g.quadraticCurveTo(-3,-6,0,6);g.quadraticCurveTo(3,-6,2.4,-24);g.closePath();g.fill();},2);}
function bubbleSpr(){return mk(80,80,g=>{g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,0,0,40,[[0,'rgba(80,160,255,0)'],[.72,'rgba(80,160,255,.05)'],[.9,'rgba(110,200,255,.32)'],[.96,'rgba(220,245,255,.7)'],[1,'rgba(120,200,255,0)']]);g.beginPath();g.arc(0,0,40,0,7);g.fill();
 g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.beginPath();g.arc(0,0,34,3.6,4.6);g.stroke();
 g.strokeStyle='rgba(140,210,255,.18)';g.lineWidth=.8;for(let k=0;k<6;k++){const a=k/6*TAU;g.beginPath();g.moveTo(Math.cos(a)*14,Math.sin(a)*14);g.lineTo(Math.cos(a)*37,Math.sin(a)*37);g.stroke();}},2);}
function shardSpr(col){return mk(10,10,g=>{const p=()=>poly(g,[0,-4.5,3.5,2.5,-3,3.5]);hull6(g,p,['#d8d4f0','#5a5478','#1a1630'],3.5,{h:4,glow:col,gb:4});g.globalCompositeOperation='lighter';g.strokeStyle=col;g.lineWidth=.9;g.beginPath();g.moveTo(0,-4.5);g.lineTo(3.5,2.5);g.stroke();},3);}
function starSpr(){return mk(28,28,g=>{g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,0,0,6,[[0,'rgba(255,255,255,1)'],[.3,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.arc(0,0,6,0,7);g.fill();
 for(const [a,l] of [[0,14],[Math.PI/2,14],[Math.PI/4,6],[-Math.PI/4,6]]){g.save();g.rotate(a);g.scale(l,.9);g.fillStyle=GR(g,0,0,0,1,[[0,'rgba(255,255,255,.95)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore();}},2);}
function ghostSpr(){return mk(40,40,g=>{g.fillStyle=GR(g,0,0,0,20,[[0,'rgba(255,255,255,.05)'],[.75,'rgba(255,255,255,.14)'],[.92,'rgba(255,255,255,.3)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.arc(0,0,20,0,7);g.fill();},1.5);}
function streakSpr(){return mk(120,10,g=>{g.globalCompositeOperation='lighter';g.save();g.scale(60,5);g.fillStyle=GR(g,0,0,0,1,[[0,'rgba(255,255,255,.9)'],[.3,'rgba(255,255,255,.25)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore();},1.5);}
function buildArt6(){const S=ART.spr;
 S.pb=bolt6('#3a9bff',5,15);S.pbS=bolt6('#2af0a0',4.4,12);S.pbT=bolt6('#2ad0ff',7.5,20);S.mis=missile6();
 S.plume=TIER_COL.map(c=>plumeSpr(c));S.plumeW=['#ff9a3a','#ff6ad0','#c08aff'].map(c=>plumeSpr(c));S.bubble=bubbleSpr();S.star=starSpr();S.ghost=ghostSpr();S.streak=streakSpr();
 ART.shard={};const sc={w:'#ffffff',o:'#ff9a3a',p:'#ff5ac8',b:'#4aa8ff',c:'#5af0ff',y:'#ffe14a',g:'#6aff8a',v:'#b07aff',r:'#ff5a4a'};for(const k in sc)ART.shard[k]=shardSpr(sc[k]);
 ART.bossGlow=[];}
const _buildArt=buildArt;buildArt=function(){_buildArt();buildArt6();};
// ---------- stage themes ----------
// sky:[top,mid,bottom]; neb: color ramp for nebula; dust: dark lane tint; lm: landmark kind; fx: live deco
const TH=[
 {sky:['#05021a','#10063a','#1c0a3e'],neb:[[0,[20,6,50]],[.5,[100,36,190]],[.78,[230,80,180]],[1,[255,160,130]]],lm:'binary',fx:'spores',star:[232,220,255],flare:'#d8b8ff'},
 {sky:['#0e0406','#26100c','#3a1a10'],neb:[[0,[30,8,6]],[.45,[150,60,24]],[.75,[255,140,60]],[1,[255,230,170]]],lm:'ringed',fx:'rocks',star:[255,226,200],flare:'#ffc890'},
 {sky:['#010616','#04183a','#0a2e52'],neb:[[0,[4,14,40]],[.45,[30,110,200]],[.75,[120,220,255]],[1,[235,250,255]]],lm:'ice',fx:'flakes',star:[216,244,255],flare:'#bfeaff'},
 {sky:['#0a0410','#1a0a22','#2a1020'],neb:[[0,[30,10,40]],[.3,[130,50,160]],[.6,[255,140,70]],[.8,[90,200,255]],[1,[230,240,255]]],lm:'twin',fx:'rocks',star:[255,240,216],flare:'#ffd090'},
 {sky:['#14021a','#2a0834','#3a0c3a'],neb:[[0,[30,4,40]],[.45,[160,40,170]],[.75,[255,100,180]],[1,[255,220,140]]],lm:'gas',fx:'spores',star:[255,216,240],flare:'#ffb0e0'},
 {sky:['#01041a','#061038','#0c1c56'],neb:[[0,[4,8,30]],[.45,[40,80,200]],[.7,[130,110,255]],[1,[210,240,255]]],lm:'storm',fx:'bolts',star:[216,232,255],flare:'#b0c8ff'},
 {sky:['#011212','#04262a','#0a2a3a'],neb:[[0,[2,24,26]],[.45,[20,150,150]],[.7,[220,80,220]],[1,[220,255,245]]],lm:'prism',fx:'comets',star:[216,255,244],flare:'#a0fff0'},
 {sky:['#120302','#2a0804','#401006'],neb:[[0,[30,4,4]],[.45,[170,30,20]],[.75,[255,130,30]],[1,[255,230,150]]],lm:'forge',fx:'embers',star:[255,216,192],flare:'#ffa060'},
 {sky:['#040e06','#0e0a1e','#1a0a26'],neb:[[0,[6,16,10]],[.4,[60,150,50]],[.7,[170,70,255]],[1,[255,200,250]]],lm:'hive',fx:'spores',star:[232,255,216],flare:'#c8ff90'},
 {sky:['#030008','#0e0018','#1a0022'],neb:[[0,[8,0,16]],[.4,[150,30,120]],[.65,[255,90,60]],[.85,[90,200,255]],[1,[255,255,255]]],lm:'hole',fx:'none',star:[255,255,255],flare:'#ffffff'}];
// seamless (vertically tiling) nebula: domain-warped fbm mapped to the stage colour ramp, with dark dust lanes; alpha carries density
function nebTile6(i,near){const W=120,H=320,c=mkC(W,H),g=c.getContext('2d'),im=g.createImageData(W,H),d=im.data,n=vnoise(i*31+(near?7:1)),th=TH[i];
 const fx=W/120*3.2,fy=H/320*8;for(let y=0;y<H;y++){for(let x=0;x<W;x++){
  // periodic in y: sample a cylinder so the tile wraps
  const ay=y/H*TAU,cy=Math.cos(ay)*1.3,sy=Math.sin(ay)*1.3,u=x/W*fx;
  const wx=fbm(n,u+cy*.7,sy+3.1,3),wy=fbm(n,u*.8+5.2,cy+sy*.5,3);
  let v=fbm(n,u+wx*1.8+cy,sy+wy*1.8+i,near?4:5);const dust=fbm(n,u*2.2+9,cy*2+sy*1.4,3);
  v=smooth(near?.5:.36,near?.85:.8,v);let dl=near?0:smooth(.52,.7,dust)*.75;
  const col=rampAt(th.neb,Math.min(1,v*1.05));const a=near?v*v*.55:Math.min(1,v*.95+.05);const o=(y*W+x)*4;
  d[o]=col[0]*(1-dl*.8);d[o+1]=col[1]*(1-dl*.8);d[o+2]=col[2]*(1-dl*.7);d[o+3]=255*a*(1-dl*.6);}}
 g.putImageData(im,0,0);return c;}
// lit sphere, per-pixel. kind decides the surface; returns {c,w,h} sprite (r in game px)
function planetSpr(r,kind,seed,o){o=o||{};const res=1.6,pad=o.pad||r*.5,S=Math.ceil((r+pad)*2*res),c=mkC(S,S),g=c.getContext('2d'),im=g.createImageData(S,S),d=im.data,n=vnoise(seed),C=S/2,R=r*res;
 const L=o.light||[-.6,-.55,.58],ll=Math.hypot(L[0],L[1],L[2]);const lx=L[0]/ll,ly=L[1]/ll,lz=L[2]/ll;const ramp=o.ramp;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const nx=(x-C)/R,ny=(y-C)/R,q=nx*nx+ny*ny;if(q>1)continue;const nz=Math.sqrt(1-q);
  // rotate a little so features wrap around the limb
  const u=Math.atan2(nx,nz)*1.1,v=Math.asin(ny);let val,em=0;
  if(kind==='gas'){val=fbm(n,u*.6,v*6+fbm(n,u*1.5,v*3,3)*2.2,4);}
  else if(kind==='storm'){const dx=u-.25,dy=v+.15,rr=Math.hypot(dx,dy*1.4),sw=Math.atan2(dy,dx)+rr*9;val=fbm(n,u*.7,v*5+fbm(n,u*2,v*2,3)*1.6,4);const eye=Math.max(0,1-rr/0.42);val=val*(1-eye)+eye*(.5+.5*Math.sin(sw*2+fbm(n,dx*4,dy*4,2)*3))*0.9;}
  else if(kind==='ice'){val=fbm(n,u*2.4,v*2.4,5);const cr=Math.abs(fbm(n,u*4+7,v*4,3)-.5);if(cr<.025)val=1.08;}
  else if(kind==='lava'){val=fbm(n,u*2.2,v*2.2,5);const cr=Math.abs(fbm(n,u*3.5+3,v*3.5,4)-.5);em=Math.max(0,1-cr/.05);}
  else if(kind==='hive'){const hx=u*7,hy=v*7/0.866,ry=Math.round(hy),rx=Math.round(hx-(ry&1)*.5)+(ry&1)*.5,dd=Math.hypot(hx-rx,(hy-ry)*.866);val=.35+fbm(n,rx*.3,ry*.3,2)*.5;if(dd>.42)val=.08;em=dd>.42?0:Math.max(0,fbm(n,rx*.7,ry*.7+3,2)-.55)*2.2;}
  else{val=fbm(n,u*2,v*2,5);}
  const col=rampAt(ramp,Math.min(1,Math.max(0,val)));const dif=Math.max(0,nx*lx+ny*ly+nz*lz),lit=Math.min(1.2,.04+dif*1.12+Math.pow(Math.max(0,dif),18)*(o.spec||0));
  const rim=Math.pow(1-nz,3)*(o.rim||.6);const ec=o.em||[255,120,30];const ek=em*(1-dif*.55);const k=(y*S+x)*4,ed=Math.min(1,(1-q)*30);
  d[k]=Math.min(255,col[0]*lit+ec[0]*ek+(o.atm?o.atm[0]*rim*dif:0));d[k+1]=Math.min(255,col[1]*lit+ec[1]*ek+(o.atm?o.atm[1]*rim*dif:0));d[k+2]=Math.min(255,col[2]*lit+ec[2]*ek+(o.atm?o.atm[2]*rim*dif:0));d[k+3]=255*ed;}
 g.putImageData(im,0,0);
 if(o.atm){g.save();g.translate(C,C);g.globalCompositeOperation='destination-over';g.fillStyle=GR(g,-R*.25,-R*.25,R*.96,R*1.22,[[0,rgba(o.atm,.55)],[.35,rgba(o.atm,.18)],[1,rgba(o.atm,0)]]);g.beginPath();g.arc(0,0,R*1.3,0,7);g.fill();g.restore();}
 return{c,w:S/res,h:S/res};}
function ringLayer(g,R,tilt,cols,front){g.save();g.scale(1,tilt);g.beginPath();if(front)g.rect(-R*3,0,R*6,R*3/tilt);else g.rect(-R*3,-R*3/tilt,R*6,R*3/tilt);g.clip();
 for(let k=0;k<cols.length;k++){const [r0,r1,c]=cols[k];g.strokeStyle=c;g.lineWidth=(r1-r0)*R;g.beginPath();g.arc(0,0,(r0+r1)/2*R,0,7);g.stroke();}g.restore();}
function landmark6(kind){const RES=1.6;
 const wrap=(w,h,fn)=>mk(w,h,fn,RES);
 if(kind==='ringed'||kind==='gas'){const r=kind==='gas'?84:60;const p=planetSpr(r,'gas',kind==='gas'?77:41,{ramp:kind==='gas'?[[0,[90,20,90]],[.4,[220,90,170]],[.6,[255,170,200]],[.8,[255,210,150]],[1,[255,240,220]]]:[[0,[90,40,20]],[.45,[200,120,60]],[.65,[240,190,120]],[1,[255,235,200]]],atm:kind==='gas'?[255,140,220]:[255,190,120],spec:.15});
  const tilt=.26,rc=kind==='gas'?[[1.3,1.45,'rgba(255,200,230,.35)'],[1.48,1.75,'rgba(255,170,210,.55)'],[1.8,1.86,'rgba(255,230,240,.4)'],[1.9,2.1,'rgba(200,120,200,.3)']]:[[1.3,1.5,'rgba(230,180,130,.45)'],[1.55,1.9,'rgba(255,215,160,.6)'],[1.95,2.05,'rgba(200,150,100,.35)']];
  return wrap(r*4.6,r*2.6,g=>{g.rotate(-.32);ringLayer(g,r,tilt,rc,false);g.rotate(.32);g.drawImage(p.c,-p.w/2,-p.h/2,p.w,p.h);
   g.save();g.beginPath();g.arc(0,0,r,0,7);g.clip();g.rotate(-.32);g.fillStyle='rgba(0,0,10,.35)';g.fillRect(-r*3,r*.08,r*6,r*.16);g.restore();g.rotate(-.32);ringLayer(g,r,tilt,rc,true);});}
 if(kind==='ice')return planetSpr(70,'ice',23,{ramp:[[0,[40,90,150]],[.45,[140,200,240]],[.75,[220,245,255]],[1,[255,255,255]]],atm:[140,220,255],spec:.6,rim:.9});
 if(kind==='storm'){const p=planetSpr(78,'storm',57,{ramp:[[0,[10,20,70]],[.4,[50,90,190]],[.7,[150,190,255]],[1,[240,250,255]]],atm:[110,160,255],spec:.2});return p;}
 if(kind==='forge'){const p=planetSpr(66,'lava',91,{ramp:[[0,[20,8,8]],[.5,[60,30,28]],[1,[120,80,70]]],atm:[255,90,30],em:[255,120,30],rim:.8});return p;}
 if(kind==='hive')return planetSpr(80,'hive',13,{ramp:[[0,[10,20,10]],[.5,[60,110,40]],[1,[170,230,120]]],atm:[160,90,255],em:[190,255,90]});
 if(kind==='binary')return wrap(240,200,g=>{g.globalCompositeOperation='lighter';
  [[-34,10,30,'#ffd2a0',[255,170,90]],[44,-24,18,'#b8d8ff',[120,170,255]]].forEach(([x,y,r,c,a])=>{g.fillStyle=GR(g,x,y,0,r*3.2,[[0,rgba(a,.55)],[.3,rgba(a,.18)],[1,rgba(a,0)]]);g.beginPath();g.arc(x,y,r*3.2,0,7);g.fill();
   g.fillStyle=GR(g,x,y,0,r,[[0,'#ffffff'],[.55,c],[1,rgba(a,0)]]);g.beginPath();g.arc(x,y,r,0,7);g.fill();});
  g.strokeStyle='rgba(255,200,160,.35)';g.lineWidth=3;g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(10,-20,32,-20);g.stroke();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;g.beginPath();g.ellipse(4,-6,92,26,-.32,0,7);g.stroke();});
 if(kind==='twin')return wrap(260,220,g=>{g.globalCompositeOperation='lighter';[[-50,-20,26,[255,170,70]],[30,10,20,[90,200,255]]].forEach(([x,y,r,a])=>{g.fillStyle=GR(g,x,y,0,r*3,[[0,rgba(a,.6)],[.25,rgba(a,.2)],[1,rgba(a,0)]]);g.beginPath();g.arc(x,y,r*3,0,7);g.fill();g.fillStyle=GR(g,x,y,0,r,[[0,'#fff'],[.6,rgba(a,1)],[1,rgba(a,0)]]);g.beginPath();g.arc(x,y,r,0,7);g.fill();});
  g.globalCompositeOperation='source-over';g.save();g.translate(64,66);g.rotate(.4);g.lineWidth=5;g.strokeStyle=GL(g,-26,0,26,0,[[0,'#2a2a44'],[.4,'#b8bcd8'],[1,'#2a2a44']]);g.beginPath();g.ellipse(0,0,26,9,0,0,7);g.stroke();
  g.fillStyle=GL(g,-3,0,3,0,[[0,'#3a3a5a'],[.5,'#d8dcf0'],[1,'#3a3a5a']]);g.fillRect(-3,-22,6,44);g.fillStyle='#ffd27a';for(let k=-2;k<=2;k++)g.fillRect(-1,k*8-1,2,2);
  g.fillStyle=GL(g,0,-6,0,6,[[0,'#2a4aa0'],[1,'#0a1440']]);g.fillRect(-46,-4,16,8);g.fillRect(30,-4,16,8);g.restore();});
 if(kind==='prism')return wrap(200,240,g=>{const sh=[[0,-90,34,-30,22,70,0,96,-26,60,-30,-36],[-38,-20,-62,10,-50,62,-28,50],[40,-6,64,24,46,70,26,56]];
  g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,0,10,110,[[0,'rgba(80,255,220,.35)'],[1,'rgba(80,255,220,0)']]);g.beginPath();g.arc(0,0,110,0,7);g.fill();g.globalCompositeOperation='source-over';
  sh.forEach((p,k)=>{poly(g,p);g.fillStyle=GL(g,-40,-80,40,80,[[0,'rgba(220,255,250,.9)'],[.35,k?'rgba(255,120,230,.75)':'rgba(80,240,220,.8)'],[.7,'rgba(60,90,200,.75)'],[1,'rgba(20,20,60,.9)']]);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.stroke();});
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(0,-90);g.lineTo(0,96);g.moveTo(34,-30);g.lineTo(0,10);g.lineTo(-30,-36);g.stroke();});
 if(kind==='hole')return wrap(300,220,g=>{g.globalCompositeOperation='lighter';
  g.save();g.scale(1,.3);for(let k=0;k<3;k++){g.fillStyle=GR(g,0,0,30,140-k*20,[[0,'rgba(255,255,255,.9)'],[.25,'rgba(255,200,120,.75)'],[.55,'rgba(255,80,120,.4)'],[1,'rgba(120,40,255,0)']]);g.beginPath();g.arc(0,0,140-k*20,0,7);g.fill();}g.restore();
  g.save();g.scale(1,.85);g.strokeStyle='rgba(255,210,150,.85)';g.lineWidth=5;g.beginPath();g.arc(0,0,34,Math.PI*1.05,Math.PI*1.95);g.stroke();g.lineWidth=2;g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(0,0,31,Math.PI,TAU);g.stroke();g.restore();
  g.globalCompositeOperation='source-over';g.fillStyle=GR(g,0,0,18,32,[[0,'#000'],[.8,'#000'],[1,'rgba(0,0,0,0)']]);g.beginPath();g.arc(0,0,32,0,7);g.fill();
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,170,90,.9)';g.lineWidth=2.5;g.beginPath();g.ellipse(0,0,120,30,0,-.02,Math.PI+.02);g.stroke();
  g.strokeStyle='rgba(255,240,220,.9)';g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,88,22,0,0,Math.PI);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.arc(0,0,22,0,7);g.globalCompositeOperation='destination-out';g.fill();});
 return planetSpr(60,'rock',3,{ramp:[[0,[40,30,60]],[1,[200,180,220]]]});}
function auroraSpr(c1,c2){return mk(360,160,g=>{g.globalCompositeOperation='lighter';for(let k=0;k<3;k++){g.beginPath();for(let x=-180;x<=180;x+=6){const y=Math.sin(x*.02+k*1.7)*22+Math.sin(x*.047+k)*10-20+k*18;x===-180?g.moveTo(x,y):g.lineTo(x,y);}
 g.lineWidth=26-k*6;g.strokeStyle=GL(g,-180,0,180,0,[[0,rgba(c1,0)],[.3,rgba(c1,.22)],[.6,rgba(c2,.18)],[1,rgba(c2,0)]]);g.stroke();}},1);}
function vignetteC(){const w=GW,h=GH,c=mkC(w,h),g=c.getContext('2d');g.fillStyle=GR(g,w/2,h*.48,Math.min(w,h)*.4,Math.max(w,h)*.75,[[0,'rgba(0,0,8,0)'],[1,'rgba(0,0,10,.62)']]);g.fillRect(0,0,w,h);return c;}
// ---------- background state ----------
const BGS={i:-1,th:null,neb:null,nebN:null,lm:null,sky:null,vig:null,stars:null,flares:[],deco:[],au:null,snap:null,snapT:0,lmY:0};
function setBG(i,noFx){const old=BGS.i;
 if(!noFx&&old>=0&&old!==i&&BGS.th){BGS.old={th:BGS.th,neb:BGS.neb,lm:BGS.lm,lmY:BGS.lmY};BGS.snapT=1;}else if(old!==i)BGS.snapT=0;
 BGS.i=i;const th=BGS.th=TH[i];const A=ART.bg;
 BGS.neb=A['f'+i]||(A['f'+i]=nebTile6(i,false));BGS.nebN=A['w'+i]||(A['w'+i]=nebTile6(i,true));BGS.lm=A['l'+i]||(A['l'+i]=landmark6(th.lm));
 BGS.au=(th.lm==='ice'||th.lm==='hive'||th.lm==='binary')?(A['a'+i]||(A['a'+i]=auroraSpr(th.neb[2][1],th.neb[th.neb.length-2][1]))):null;
 BGS.sky=null;BGS.vig=vignetteC();if(old!==i)BGS.lmY=0;
 BGS.stars=[];const n=QUAL>1?170:QUAL?110:70;for(let l=0;l<3;l++){const a=new Float32Array(Math.round(n/(l+1))*3);for(let k=0;k<a.length;k+=3){a[k]=Math.random()*GW;a[k+1]=Math.random()*GH;a[k+2]=Math.random();}BGS.stars.push(a);}
 BGS.flares=[];for(let k=0;k<(QUAL?7:3);k++)BGS.flares.push({x:Math.random()*GW,y:Math.random()*GH,s:rnd(.35,.9),p:Math.random()*TAU,sp:rnd(.6,1)});
 BGS.deco=[];const fx=th.fx,cnt={rocks:8,flakes:34,comets:3,bolts:2,embers:30,spores:22,none:0}[fx];for(let k=0;k<cnt*(QUAL?1:.5);k++)BGS.deco.push({x:Math.random()*GW,y:Math.random()*GH,s:rnd(.3,1),v:Math.random()*3|0,r:Math.random()*TAU,t:Math.random()*5});}
function drawBG(dt){const th=BGS.th,t=G.scroll,S=ART.spr;FX.t+=dt;
 if(!BGS.sky||BGS.skyH!==GH){BGS.skyH=GH;BGS.sky=GL(cx,0,0,0,GH,[[0,th.sky[0]],[.55,th.sky[1]],[1,th.sky[2]]]);}
 cx.fillStyle=BGS.sky;cx.fillRect(0,0,GW,GH);
 // far nebula (very slow)
 const nh=GW*2.67,oy=(t*7)%nh;cx.globalAlpha=.7;cx.drawImage(BGS.neb,0,oy-nh,GW,nh);cx.drawImage(BGS.neb,0,oy,GW,nh);cx.globalAlpha=1;
 // far stars with twinkle
 const st=BGS.stars,sc=th.star;for(let l=0;l<2;l++){const a=st[l],sp=l?16:6,sz=l?1.3:.9;for(let k=0;k<a.length;k+=3){const y=(a[k+1]+t*sp)%GH,tw=l?.55+.45*Math.sin(FX.t*(1.5+a[k+2]*3)+a[k+2]*40):.35+a[k+2]*.4;cx.fillStyle='rgba('+sc[0]+','+sc[1]+','+sc[2]+','+tw+')';cx.fillRect(a[k],y,sz,sz);}}
 // aurora ribbon
 if(BGS.au&&QUAL>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=.55+.25*Math.sin(FX.t*.6);const ay=((t*4)%(GH+260))-130;spr(BGS.au,GW/2+Math.sin(FX.t*.2)*20,ay,1);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 // landmark: drifts down slowly, loops
 const L=BGS.lm;BGS.lmY+=dt*(G.mode==='play'?4:2.2);const span=GH+L.h;const ly=-L.h*.1+GH*.12+(BGS.lmY%span);const lyy=ly>GH+L.h/2?ly-span:ly;const lx=th.lm==='prism'?GW*.3:th.lm==='hole'?GW*.5:GW*.66;
 if(th.lm==='hole'){cx.save();cx.translate(lx,lyy);cx.rotate(-.12);cx.drawImage(L.c,-L.w/2,-L.h/2,L.w,L.h);cx.restore();}else cx.drawImage(L.c,lx-L.w/2,lyy-L.h/2,L.w,L.h);
 drawBGFade(dt);
 // near nebula wisps (additive, faster)
 if(QUAL>0){const n2=GW*2.67,o2=(t*20)%n2;cx.globalCompositeOperation='lighter';cx.globalAlpha=.42;cx.save();cx.scale(-1,1);cx.drawImage(BGS.nebN,-GW,o2-n2,GW,n2);cx.drawImage(BGS.nebN,-GW,o2,GW,n2);cx.restore();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 // bright flare stars
 cx.globalCompositeOperation='lighter';for(const f of BGS.flares){f.y+=dt*22*f.sp;if(f.y>GH+20){f.y=-20;f.x=Math.random()*GW;}const k=.6+.4*Math.sin(FX.t*2+f.p);cx.globalAlpha=k;spr(S.star,f.x,f.y,f.s*(.8+k*.3));}cx.globalAlpha=1;
 // shooting stars
 if(QUAL>0&&Math.random()<dt*.18)FX.shoot.push({x:rnd(40,GW),y:rnd(0,GH*.5),t:0});
 for(let k=FX.shoot.length-1;k>=0;k--){const s=FX.shoot[k];s.t+=dt;if(s.t>.9){FX.shoot.splice(k,1);continue;}const a=Math.sin(s.t/.9*Math.PI);cx.save();cx.translate(s.x-s.t*260,s.y+s.t*130);cx.rotate(Math.atan2(130,-260));cx.globalAlpha=a*.8;cx.drawImage(S.streak.c,-60,-3,120,6);cx.restore();}cx.globalAlpha=1;
 cx.globalCompositeOperation='source-over';
 // per-theme live deco
 const fx=th.fx;for(const d of BGS.deco){d.t+=dt;
  if(fx==='rocks'){d.y+=dt*26*d.s;if(d.y>GH+40){d.y=-40;d.x=Math.random()*GW;}const s=S.rocks[1][d.v];d.r+=dt*.3*d.s;cx.save();cx.globalAlpha=.25+.4*d.s;cx.translate(d.x,d.y);cx.rotate(d.r);const sz=s.w*d.s*.8;cx.drawImage(s.c,-sz/2,-sz/2,sz,sz);cx.restore();cx.globalAlpha=1;}
  else if(fx==='flakes'){d.y+=dt*44*d.s;if(d.y>GH+10){d.y=-10;d.x=Math.random()*GW;}cx.fillStyle='rgba(225,248,255,'+(.25+d.s*.55)+')';const sz=1.2*d.s+.5;cx.fillRect(d.x+Math.sin(d.t*1.3+d.r)*7,d.y,sz,sz);}
  else if(fx==='embers'){d.y-=dt*30*d.s;d.x+=Math.sin(d.t*2+d.r)*dt*14;if(d.y<-10){d.y=GH+10;d.x=Math.random()*GW;}cx.globalCompositeOperation='lighter';cx.globalAlpha=(.35+.4*d.s)*(.6+.4*Math.sin(d.t*6+d.r));spr(ART.glow.o,d.x,d.y,.25+d.s*.25);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
  else if(fx==='spores'){d.y+=dt*12*d.s;d.x+=Math.sin(d.t*.8+d.r)*dt*8;if(d.y>GH+10){d.y=-10;d.x=Math.random()*GW;}cx.globalCompositeOperation='lighter';cx.globalAlpha=.25+.3*d.s;spr(ART.glow[d.v===0?'g':d.v===1?'v':'p'],d.x,d.y,.2+d.s*.25);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
  else if(fx==='comets'){d.y+=dt*150*d.s;d.x+=dt*50*d.s;if(d.y>GH+80){d.y=-80;d.x=rnd(-60,GW);}cx.globalCompositeOperation='lighter';cx.save();cx.translate(d.x,d.y);cx.rotate(Math.atan2(150,50)+Math.PI);cx.globalAlpha=.5*d.s+.2;cx.drawImage(S.streak.c,0,-4*d.s,120*d.s,8*d.s);cx.restore();cx.globalAlpha=1;spr(ART.glow.c,d.x,d.y,.5+d.s*.4);cx.globalCompositeOperation='source-over';}
  else if(fx==='bolts'&&QUAL>0){if(!d.b&&Math.random()<dt*.25){d.b=.22;d.pts=[];let x=rnd(20,GW-20),y=0;d.pts.push(x,y);while(y<GH*.55){x+=rnd(-20,20);y+=rnd(14,30);d.pts.push(x,y);}}
   if(d.b>0){d.b-=dt;cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(190,220,255,'+(d.b*3)+')';cx.lineWidth=1.6;cx.beginPath();for(let k=0;k<d.pts.length;k+=2)k?cx.lineTo(d.pts[k],d.pts[k+1]):cx.moveTo(d.pts[k],d.pts[k+1]);cx.stroke();cx.fillStyle='rgba(150,180,255,'+d.b*.25+')';cx.fillRect(0,0,GW,GH);cx.globalCompositeOperation='source-over';}else d.b=0;}}
 // near speed lines
 const a=st[2];cx.globalCompositeOperation='lighter';const sp=(G.mode==='play'?280:140)*(G.mode==='clear'&&G.clearT>1?4:1);cx.fillStyle='rgba('+sc[0]+','+sc[1]+','+sc[2]+',.28)';for(let k=0;k<a.length;k+=6){const y=(a[k+1]+t*sp*(1+(k%5)*.15))%GH;cx.fillRect(a[k],y,1,Math.max(2,sp*.03));}cx.globalCompositeOperation='source-over';
 cx.drawImage(BGS.vig,0,0,GW,GH);}
function drawBGFade(dt){const o=BGS.old;if(BGS.snapT<=0||!o)return;BGS.snapT-=dt*.8;const k=Math.max(0,BGS.snapT),e=k*k*(3-2*k);if(k<=0){BGS.old=null;return;}
 cx.save();cx.globalAlpha=e;cx.fillStyle=GL(cx,0,0,0,GH,[[0,o.th.sky[0]],[.55,o.th.sky[1]],[1,o.th.sky[2]]]);cx.fillRect(0,0,GW,GH);
 const z=1+(1-e)*.25;cx.translate(GW/2,GH/2);cx.scale(z,z);cx.translate(-GW/2,-GH/2);const nh=GW*2.67,oy=(G.scroll*7)%nh;cx.globalAlpha=e*.7;cx.drawImage(o.neb,0,oy-nh,GW,nh);cx.drawImage(o.neb,0,oy,GW,nh);
 const L=o.lm;cx.globalAlpha=e;cx.drawImage(L.c,GW*.66-L.w/2,GH*.12-L.h*.1+(o.lmY%(GH+L.h))-L.h/2,L.w,L.h);cx.restore();cx.globalAlpha=1;}
// ---------- effects ----------
const RGBK={w:'255,255,255',o:'255,150,60',p:'255,90,190',b:'80,170,255',c:'100,240,255',y:'255,225,90',g:'110,255,140',v:'180,110,255',r:'255,80,60'};
function drawRings(dt){cx.globalCompositeOperation='lighter';for(let k=RINGS.length-1;k>=0;k--){const o=RINGS[k];o.t+=dt;const p=o.t/.7;if(p>=1){RINGS.splice(k,1);continue;}cx.globalAlpha=1-p;cx.strokeStyle=o.c;cx.lineWidth=6*(1-p)+1;cx.beginPath();cx.arc(o.x,o.y,o.r*(.2+p*.8),0,TAU);cx.stroke();}cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
function shake(v){if(SAVE.shake===0)return;G.shake=Math.max(G.shake,v);}
// layered explosion: white core flash, coloured fireballs, streak sparks, metal shards, smoke-free shockwave
function boom(x,y,size,cols){const q=QUAL>1?1:QUAL?.6:.4,G2=ART.glow;cols=cols||['o','y','p'];
 const cm=1+Math.min(.6,(G.combo||0)*.02);size*=cm; // combos pump the blast
 part(x,y,0,0,.12,size*2.1,G2.w,0);part(x,y,0,0,.2,size*1.4,G2.y,0);
 if(size>13){const r2=part(x,y,0,0,.55,size*2.6,null,2);if(r2)r2.c='255,255,255';if(QUAL)for(let k=0;k<3;k++){const a=Math.random()*TAU,d=size*.6;later(.04+k*.05,()=>{part(x+Math.cos(a)*d,y+Math.sin(a)*d,0,0,.22,size*.9,G2[cols[k%cols.length]],0);part(x+Math.cos(a)*d,y+Math.sin(a)*d,0,0,.1,size*.6,G2.w,0);});}}const f=part(x,y,0,0,.3,size*1.1,G2[cols[0]],0);
 const nf=Math.round((6+size*.5)*q);for(let i=0;i<nf;i++){const a=Math.random()*TAU,s=rnd(10,60)*(.5+size/24);part(x+Math.cos(a)*size*.2,y+Math.sin(a)*size*.2,Math.cos(a)*s,Math.sin(a)*s,rnd(.35,.75),rnd(2.5,5.5)*(.6+size/28),G2[cols[i%cols.length]],0);}
 const ns=Math.round((8+size*.8)*q);for(let i=0;i<ns;i++){const a=Math.random()*TAU,s=rnd(120,300)*(.6+size/40);const p=part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.18,.42),1,G2[i%3?cols[(i+1)%cols.length]:'w'],1);if(p)p.c=RGBK[i%3?cols[(i+1)%cols.length]:'w'];}
 if(size>9){const nd=Math.round((2+size*.18)*q);for(let i=0;i<nd;i++){const a=Math.random()*TAU,s=rnd(50,140);const p=part(x,y,Math.cos(a)*s,Math.sin(a)*s-20,rnd(.5,.9),rnd(.7,1.2),ART.shard[cols[i%cols.length]]||ART.shard.w,3);if(p){p.r=Math.random()*TAU;p.vr=rnd(-12,12);}}}
 const r=part(x,y,0,0,.38,size*1.7,null,2);if(r)r.c=RGBK[cols[0]]||cols[0];}
function spark(x,y,c){const G2=ART.glow;part(x,y,0,0,.09,3.2,G2.w,0);for(let i=0;i<(QUAL>1?3:QUAL?2:1);i++){const a=-Math.PI/2+rnd(-1.4,1.4),s=rnd(120,240);const p=part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.1,.2),1,G2[c||'c'],1);if(p)p.c=RGBK[c||'c'];}}
FX.pickup=function(k,x,y){const col=k==='C'?'255,215,80':hexRGB(PU_COL[k]);if(k==='C'){const p=part(x,y,0,0,.25,10,null,2);if(p)p.c=col;return;}
 const r=part(x,y,0,0,.45,34,null,2);if(r)r.c=col;const r2=part(x,y,0,0,.3,18,null,2);if(r2)r2.c='255,255,255';part(x,y,0,0,.25,12,ART.glow.w,0);
 const n=QUAL>1?14:QUAL?9:5;for(let i=0;i<n;i++){const a=i/n*TAU,s=rnd(110,170);const p=part(x,y,Math.cos(a)*s,Math.sin(a)*s,.4,1,ART.glow.w,1);if(p)p.c=col;}};
FX.bomb=function(x,y){FX.bomb.on={x,y,t:0};FX.glow(x,y,1,'#ffd27a');G.flash=Math.max(G.flash,.8);shake(12);for(let k=0;k<(QUAL?8:4);k++)later(.05+k*.07,()=>boom(rnd(40,GW-40),rnd(60,GH*.7),rnd(16,28),[['o','y','w'],['p','v','w'],['c','b','w']][k%3]));for(const [d,c] of [[0,'255,230,140'],[.12,'255,140,220'],[.24,'140,230,255']])later(d,()=>{const r=part(x,y,0,0,1,240,null,2);if(r)r.c=c;});
 const n=QUAL>1?36:QUAL?22:12;for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rnd(200,420);const p=part(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(.4,.8),1,ART.glow.y,1);if(p)p.c=i%2?'255,230,120':'255,255,255';}};
// full-screen glow via cached glow sprite (no per-frame gradients)
FX.glow=function(x,y,d,col){FX.glow.on={x,y,t:0,d,s:ART.glow[{'#ffd27a':'y'}[col]||'w']};};
function drawGlowFx(dt){const g=FX.glow.on;if(!g)return;g.t+=dt;if(g.t>g.d){FX.glow.on=null;return;}const k=g.t/g.d,R=GH*(.6+k*.9);cx.globalCompositeOperation='lighter';cx.globalAlpha=(1-k)*(1-k)*.9;cx.drawImage(g.s.c,g.x-R,g.y-R,R*2,R*2);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
function drawBombFx(dt){const b=FX.bomb.on;if(!b)return;b.t+=dt;if(b.t>1.1){FX.bomb.on=null;return;}const k=b.t/1.1;cx.globalCompositeOperation='lighter';
 const R=40+k*GH*.9;cx.globalAlpha=(1-k)*.55;cx.fillStyle=GR(cx,b.x,b.y,R*.2,R,[[0,'rgba(255,250,220,.9)'],[.5,'rgba(255,170,90,.35)'],[1,'rgba(255,90,160,0)']]);cx.fillRect(0,0,GW,GH);
 cx.globalAlpha=(1-k)*.8;cx.save();cx.translate(b.x,b.y);cx.rotate(k*.8);for(let i=0;i<12;i++){cx.rotate(TAU/12);cx.fillStyle=GL(cx,0,0,R*1.2,0,[[0,'rgba(255,255,230,.9)'],[1,'rgba(255,200,120,0)']]);cx.beginPath();cx.moveTo(0,0);cx.lineTo(R*1.2,-6-k*14);cx.lineTo(R*1.2,6+k*14);cx.closePath();cx.fill();}cx.restore();
 cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
// ---------- render ----------
function render(dt){cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.shadowBlur=0;cx.setTransform(SC*DPR,0,0,SC*DPR,0,0);let sx=0,sy=0;
 if(G.shake>0&&QUAL>0&&SAVE.shake!==0){const m=Math.min(G.shake,10)*.5;sx=rnd(-1,1)*m;sy=rnd(-1,1)*m;}cx.translate(sx,sy);
 drawBG(dt);const S=ART.spr,T6=FX.t;
 // hazards (enemy lasers stay warm)
 for(const h of HZ){if(!h.a)continue;if(h.t<h.warn){const a=.35+.35*Math.sin(h.t*30);cx.fillStyle=GL(cx,h.x-h.w/2,0,h.x+h.w/2,0,[[0,'rgba(255,60,90,0)'],[.5,'rgba(255,60,90,'+a*.4+')'],[1,'rgba(255,60,90,0)']]);cx.fillRect(h.x-h.w/2,0,h.w,GH);
   cx.fillStyle='rgba(255,110,130,'+a+')';cx.fillRect(h.x-.75,0,1.5,GH);for(let y=(T6*120)%24;y<GH;y+=24){cx.fillRect(h.x-h.w/2,y,2,10);cx.fillRect(h.x+h.w/2-2,y,2,10);}
   cx.font='10px PS2P';cx.textAlign='center';cx.fillStyle='#ff6a8a';cx.fillText('!',h.x,70+SAFE_T);}
  else if(h.t<h.warn+h.dur){const k=1-Math.abs((h.t-h.warn)/h.dur-.5)*2,w=h.w*(1+k*.6);cx.globalCompositeOperation='lighter';
   cx.fillStyle=GL(cx,h.x-w,0,h.x+w,0,[[0,'rgba(255,40,80,0)'],[.3,'rgba(255,50,90,.5)'],[.45,'rgba(255,170,70,.8)'],[.5,'rgba(255,255,240,1)'],[.55,'rgba(255,170,70,.8)'],[.7,'rgba(255,50,90,.5)'],[1,'rgba(255,40,80,0)']]);cx.fillRect(h.x-w,0,w*2,GH);cx.globalCompositeOperation='source-over';}}
 // pickups
 for(const p of PK){if(!p.a)continue;if(p.k==='C'){const ph=p.t*5+p.x*.1,sxx=Math.max(.15,Math.abs(Math.cos(ph))),c=S.coin;cx.globalCompositeOperation='lighter';cx.globalAlpha=.35;spr(ART.glow.y,p.x,p.y,.9);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
   cx.save();cx.translate(p.x,p.y);cx.scale(sxx,1);if(sxx<.97){const ce=S.coinE;cx.drawImage(ce.c,-ce.w/2+(Math.cos(ph)>0?1.7:-1.7)/sxx,-ce.h/2,ce.w,ce.h);}cx.drawImage(c.c,-c.w/2,-c.h/2,c.w,c.h);cx.restore();if(sxx>.93){cx.globalCompositeOperation='lighter';spr(S.glint,p.x+2,p.y-2,.6+Math.sin(ph*3)*.2);cx.globalCompositeOperation='source-over';}}
  else{const s=S.pu[p.k],by=p.y+Math.sin(p.t*4)*2.5;cx.globalCompositeOperation='lighter';cx.globalAlpha=.8;spr(S.puGlow[p.k],p.x,by,1+Math.sin(p.t*7)*.14);cx.globalAlpha=1;
   cx.strokeStyle=rgba(PU_COL[p.k],.55);cx.lineWidth=1.2;cx.beginPath();cx.arc(p.x,by,15+Math.sin(p.t*5),p.t*3,p.t*3+4.2);cx.stroke();
   const oa=p.t*3;spr(S.glint,p.x+Math.cos(oa)*15,by+Math.sin(oa)*15*.5,.5);cx.globalCompositeOperation='source-over';if(p.cy)spr(S.cycRing,p.x,by,1);spr(s,p.x,by,.95,p.ang||1e-6);if(p.fl>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,p.fl*7);spr(ART.glow.w,p.x,by,1.3);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
   if(Math.sin(p.t*2.2)>.96){cx.globalCompositeOperation='lighter';spr(S.glint,p.x-4,by-6,1);cx.globalCompositeOperation='source-over';}}}
 // boss
 const B=G.boss;if(B){drawBoss(B);}drawRings(dt);
 // enemies
 for(const e of EN){if(!e.a)continue;const rock=e.type.startsWith('rock');let s;if(rock)s=e.ice?S.ice[e.si]:S.rocks[e.si][e.var];else{const tr=eTier();s=(tr&&S[e.type+'_'+tr])||S[e.type];}
  const rot=rock?e.rot:e.type==='kami'&&e.t>.8?e.ang-Math.PI/2:e.type==='diver'&&e.dv?Math.atan2(e.vy,e.vx)-Math.PI/2:e.type==='mine'?Math.sin(e.t*1.6)*.35:e.type==='gem'?Math.sin(e.t*2+(e.ph||0))*.35:(e.type==='zig'||e.type==='mini')?Math.sin(e.t*9)*.07:0;
  const an=EANIM[e.type];let sq=e.type==='sine'?1+Math.sin(e.t*8)*.06:1;
  cx.save();cx.translate(e.x,e.y);if(rot)cx.rotate(rot);
  if(an&&an.f){const fl=.8+Math.random()*.4,boost=e.type==='kami'&&e.t>.8||e.dv?1.6:1;cx.globalCompositeOperation='lighter';const pl=S.plumeW[0];cx.save();cx.translate(an.f[0],an.f[1]);cx.rotate(Math.PI);cx.drawImage(pl.c,-pl.w*.35,-2,pl.w*.7,pl.h*.42*fl*boost);cx.restore();cx.globalCompositeOperation='source-over';}
  if(an&&an.flap)cx.scale(1+Math.sin(e.t*10)*.06,1);
  const sp=e.t<.3?e.t/.3:1;if(sp<1){cx.globalAlpha=.3+.7*sp;sq*=.6+.4*sp;}
  cx.drawImage(s.c,-s.w*sq/2,-s.h*sq/2,s.w*sq,s.h*sq);if(sp<1){cx.globalCompositeOperation='lighter';cx.globalAlpha=1-sp;const wg=ART.glow.v,wz=wg.w*(1.4+sp*2);cx.drawImage(wg.c,-wz/2,-wz/2,wz,wz);cx.globalCompositeOperation='source-over';cx.globalAlpha=1;}
  if(an&&QUAL>0){cx.globalCompositeOperation='lighter';if(an.c){const k=.55+.45*Math.sin(e.t*6+e.x*.05);cx.globalAlpha=k*.8;const g=ART.glow[an.c[2]];const z=g.w*.32*an.c[3]*(1+k*.3);cx.drawImage(g.c,an.c[0]-z/2,an.c[1]-z/2,z,z);cx.globalAlpha=1;}
   if(an.lights){for(let i=0;i<5;i++){const a=e.t*3+i/5*TAU,lx=Math.cos(a)*17,ly=1.5+Math.sin(a)*5;if(Math.sin(a)<-.2)continue;cx.drawImage(ART.glow[i%2?'r':'o'].c,lx-3,ly-3,6,6);}}cx.globalCompositeOperation='source-over';}
  if(e.fl>0){const tc=s.wt||(s.wt=tintOf(s,'#ffffff'));cx.globalAlpha=Math.min(1,e.fl*22);cx.drawImage(tc,-s.w*sq/2,-s.h*sq/2,s.w*sq,s.h*sq);cx.globalAlpha=1;}
  cx.restore();
  if(e.type==='shield'&&e.shOn){cx.globalCompositeOperation='lighter';const a=.55+Math.sin(e.t*12)*.2;cx.strokeStyle='rgba(120,220,255,'+a+')';cx.lineWidth=3;cx.beginPath();cx.arc(e.x,e.y,22,.15*Math.PI,.85*Math.PI);cx.stroke();cx.lineWidth=1;cx.strokeStyle='rgba(220,250,255,'+a+')';cx.beginPath();cx.arc(e.x,e.y,25.5,.2*Math.PI,.8*Math.PI);cx.stroke();cx.globalCompositeOperation='source-over';}
  if(e.type==='kami'&&e.t>.5&&e.t<.8){cx.strokeStyle='rgba(255,60,60,.5)';cx.lineWidth=1;cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(e.x,e.y);cx.lineTo(P.x,P.y);cx.stroke();cx.setLineDash([]);}}
 // player bullets (glow + soft trail) & laser
 cx.globalCompositeOperation='lighter';for(const b of PB){if(!b.a)continue;const r=b.hom||b.vx?Math.atan2(b.vx,-b.vy):0;if(QUAL>1&&b.s!==S.mis){cx.globalAlpha=.35;spr(b.s,b.x-b.vx*.012,b.y-b.vy*.012,.85,r);cx.globalAlpha=1;}spr(b.s,b.x,b.y,1,r);}
 if(P.laser&&P.alive&&G.mode==='play'){const w=P.lw||11,top=P.ltop||0,fl=1+Math.sin(G.t*50)*.15,ww=w*fl;
  cx.fillStyle=GL(cx,P.x-ww*1.6,0,P.x+ww*1.6,0,[[0,'rgba(40,120,255,0)'],[.25,'rgba(50,150,255,.35)'],[.42,'rgba(80,220,255,.8)'],[.5,'rgba(255,255,255,1)'],[.58,'rgba(80,220,255,.8)'],[.75,'rgba(50,150,255,.35)'],[1,'rgba(40,120,255,0)']]);cx.fillRect(P.x-ww*1.6,top,ww*3.2,P.y-22-top);
  cx.fillStyle='rgba(255,255,255,.55)';for(let y=P.y-22-((G.t*900)%40);y>top;y-=40)cx.fillRect(P.x-ww*.3,y,ww*.6,10);
  spr(ART.glow.c,P.x,P.y-22,2.6*fl);spr(ART.glow.w,P.x,P.y-22,1.2);spr(ART.glow.w,P.x,top+4,2.2*fl);spr(ART.glow.c,P.x,top+4,3*fl);}
 cx.globalCompositeOperation='source-over';
 if(G.mode!=='warp')drawPlayer();
 // enemy bullets (warm, unchanged sprites)
 const ROT1=S.eb4,ROT2=S.ebN,SPN=S.eb2,PLS=S.eb3;for(const b of EB){if(!b.a)continue;const s=b.s;if(s===ROT1||s===ROT2){spr(s,b.x,b.y,1,Math.atan2(b.vy,b.vx));}else if(s===SPN){spr(s,b.x,b.y,1,b.t*7);}else if(s===PLS){spr(s,b.x,b.y,1+Math.sin(b.t*14)*.08,b.t*3);}else{const sz=s.w*(1+Math.sin(b.t*18)*.06);cx.drawImage(s.c,b.x-sz/2,b.y-sz/2,sz,sz);}}
 // particles: 0 glow, 1 streak spark, 2 ring, 3 tumbling shard
 cx.globalCompositeOperation='lighter';for(const p of PT){if(!p.a)continue;const k=p.l/p.m;
  if(p.k===2){const c=p.c&&p.c.length>2?p.c:RGBK[p.c]||'255,160,80';const rr=p.sz*(1-k*k)+4;cx.strokeStyle='rgba('+c+','+k*.9+')';cx.lineWidth=4*k+1;cx.beginPath();cx.arc(p.x,p.y,rr,0,TAU);cx.stroke();if(QUAL>1){cx.strokeStyle='rgba(255,255,255,'+k*.5+')';cx.lineWidth=1;cx.beginPath();cx.arc(p.x,p.y,rr*.92,0,TAU);cx.stroke();}}
  else if(p.k===1){const c=p.c||'255,255,255';cx.strokeStyle='rgba('+c+','+k+')';cx.lineWidth=p.sz*1.4*k+.4;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);cx.stroke();p.vx*=.96;p.vy*=.96;}
  else if(p.k===3){p.r+=p.vr*dt;p.vy+=60*dt;cx.save();cx.globalCompositeOperation='source-over';cx.globalAlpha=Math.min(1,k*2);cx.translate(p.x,p.y);cx.rotate(p.r);const s=p.g,z=p.sz;cx.drawImage(s.c,-s.w*z/2,-s.h*z/2,s.w*z,s.h*z);cx.restore();}
  else{const s=p.sz*(.4+k*.8)*2;cx.globalAlpha=Math.min(1,k*1.5);cx.drawImage(p.g.c,p.x-s,p.y-s,s*2,s*2);cx.globalAlpha=1;}}
 cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
 drawBombFx(dt);drawGlowFx(dt);
 // score pops: scale-in, outlined
 cx.textAlign='center';cx.textBaseline='middle';for(const o of TX){if(!o.a)continue;const age=1.1-o.t,sc=age<.12?.6+age/.12*.6:1.2-Math.min(.2,(age-.12)*.8);cx.globalAlpha=Math.min(1,o.t*2);cx.save();cx.translate(o.x,o.y-age*8);cx.scale(sc,sc);cx.font='9px PS2P, system-ui';cx.lineJoin='round';cx.lineWidth=3;cx.strokeStyle='rgba(16,0,32,.9)';cx.strokeText(o.s,0,0);cx.fillStyle=o.c;cx.fillText(o.s,0,0);cx.restore();cx.globalAlpha=1;}
 cx.textBaseline='alphabetic';
 cx.setTransform(SC*DPR,0,0,SC*DPR,0,0);
 if(G.flash>0){cx.fillStyle='rgba(255,244,230,'+Math.min(.55,G.flash*.7)+')';cx.fillRect(0,0,GW,GH);}
 if(G.mode==='clear'||FX.fw>0)drawFireworks(dt);
 if(G.mode==='warp')WARP.draw(dt);
 else if(G.mode!=='menu')drawHUD();}
function drawPlayer(){const S=ART.spr;if(!(P.alive&&(G.mode!=='over')&&(P.inv<=0||P.evoT>0||((G.t*14)|0)%2===0||G.mode==='menu')))return;
 const tr=G.mode==='menu'?0:tierOf(),s=skinT(P.ship,tr),tc=TIER_COL[tr];const menu=G.mode==='menu',hs=menu?1.45:1;const bank=clamp(P.bank||0,-1,1);
 let pop=1;if(P.evoT>0){const k=P.evoT/.9;pop=1+Math.sin(k*Math.PI)*.25;}if(P.downT>0)pop*=1-P.downT*.15;
 cx.save();cx.translate(P.x,P.y);cx.scale(hs,hs);
 // soft drop shadow far below (depth)
 cx.globalAlpha=.22;const sh=s.sh||(s.sh=tintOf(s,'#000010'));cx.drawImage(sh,-s.w*.4+10,-s.h*.4+22,s.w*.8,s.h*.8);cx.globalAlpha=1;
 // engine plumes
 cx.globalCompositeOperation='lighter';const sc=1+tr*.09,fl=.85+Math.random()*.25+(P.vy<-40?.25:0);const pl=S.plume[tr],pw=S.plumeW[P.ship];
 const nz=NOZ[P.ship].map(n=>[n[0]*sc,n[1]*sc]);if(tr>=1)nz.push([-13*sc,6],[13*sc,6]);if(tr>=3)nz.push([-21*sc,14],[21*sc,14]);
 cx.save();cx.rotate(bank*.18);let ni=0;for(const [x,y] of nz){const big=Math.abs(x)<10*sc;const L=(big?30:18)*fl*(1+tr*.06),W=big?11:7;const [pl,pw]=flameSpr(tr,P.ship,ni++);cx.drawImage(pw.c,x-W/2,y-2,W,L);cx.drawImage(pl.c,x-W*.35,y-1,W*.7,L*.75);}
 if(tr>=3){const pr=.3+Math.sin(G.scroll*5)*.1;cx.globalAlpha=pr;cx.drawImage(S.puGlow[tr>=4?'M':'X'].c,-40,-40,80,80);cx.globalAlpha=1;}
 // muzzle flash
 if(P.mf>0&&G.mode==='play'){cx.globalAlpha=Math.min(1,P.mf*14);const z=14+Math.random()*6;cx.drawImage(ART.glow.c.c,-z/2,-24-z/2,z,z);cx.drawImage(ART.glow.w.c,-z/4,-24-z/4,z/2,z/2);cx.globalAlpha=1;}
 cx.restore();cx.globalCompositeOperation='source-over';
 cx.rotate(bank*.18);cx.scale((1-Math.abs(bank)*.16)*pop,pop);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);
 // bank highlight: the wing turning toward the light catches a sheen
 if(Math.abs(bank)>.15){cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(.35,Math.abs(bank)*.35);const wl=s.wl||(s.wl=tintOf(s,'#9fd8ff'));cx.save();cx.beginPath();bank<0?cx.rect(-s.w/2,-s.h/2,s.w/2,s.h):cx.rect(0,-s.h/2,s.w/2,s.h);cx.clip();cx.drawImage(wl,-s.w/2,-s.h/2,s.w,s.h);cx.restore();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 if(P.evoT>0){cx.globalCompositeOperation='lighter';cx.globalAlpha=Math.min(1,P.evoT*1.6);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 cx.restore();
 if(P.evoT>0){const k=1-P.evoT/.9;cx.strokeStyle=tc;cx.globalAlpha=1-k;cx.lineWidth=3;cx.beginPath();cx.arc(P.x,P.y,20+k*50,0,TAU);cx.stroke();cx.globalAlpha=1;}
 if(P.shield>0){cx.globalCompositeOperation='lighter';const z=(60+tr*6)*(1+Math.sin(G.scroll*6)*.03);cx.globalAlpha=.75;cx.save();cx.translate(P.x,P.y);cx.rotate(G.scroll*.6);cx.drawImage(S.bubble.c,-z/2,-z/2,z,z);cx.restore();cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
 if(G.mode==='play'){cx.globalCompositeOperation='lighter';cx.globalAlpha=.7;spr(ART.glow.p,P.x,P.y+2,.55);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.fillStyle='#fff';cx.beginPath();cx.arc(P.x,P.y+2,P.hitR,0,TAU);cx.fill();cx.strokeStyle='#ff4fb8';cx.lineWidth=1.2;cx.stroke();}}
function drawBoss(B){const hh=B.h/2;cx.save();let jx=0,jy=0;if(B.dead){jx=rnd(-1,1)*B.dead*2;jy=rnd(-1,1)*B.dead*2;}cx.translate(B.x+jx,B.y+jy);
 // accent backlight so each boss sits in the scene's lighting
 const D=B.D;cx.globalCompositeOperation='lighter';const gl=ART.bossGlow[B.i]||(ART.bossGlow[B.i]=mk(220,160,g=>{g.save();g.scale(1,.72);g.fillStyle=GR(g,0,0,10,110,[[0,rgba(D[3],.45)],[.5,rgba(D[4],.14)],[1,rgba(D[4],0)]]);g.beginPath();g.arc(0,0,110,0,7);g.fill();g.restore();},1));
 cx.globalAlpha=.7+.2*Math.sin(G.t*2);cx.drawImage(gl.c,-B.w*.62,-hh*1.15,B.w*1.24,hh*2.3);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
 bossDraw(cx,B.i,{t:G.t,ph:B.phase,la:Math.atan2(P.y-B.y-B.coreOy,P.x-B.x),fl:B.fl,dead:B.dead});
 if(B.phase>0&&!B.dead&&Math.random()<.05*B.phase)part(B.x+rnd(-B.w,B.w)*.32,B.y+rnd(-hh,hh)*.5,rnd(-40,40),rnd(-60,-10),.45,2.2,ART.glow.o);
 const ts=ART.turSpr[B.i]||(ART.turSpr[B.i]=turretSpr(B.D[3]));for(const t of B.tur){if(t.alive){cx.save();cx.translate(t.ox,t.oy);cx.rotate(t.ang-Math.PI/2);cx.drawImage(ts.c,-ts.w/2,-ts.h/2,ts.w,ts.h);if(t.fl>0){cx.globalCompositeOperation='lighter';cx.drawImage(ts.c,-ts.w/2,-ts.h/2,ts.w,ts.h);}cx.restore();}
  else{cx.fillStyle='rgba(20,10,30,.9)';cx.beginPath();cx.arc(t.ox,t.oy,8,0,TAU);cx.fill();cx.globalCompositeOperation='lighter';cx.globalAlpha=.4+Math.random()*.3;spr(ART.glow.o,t.ox,t.oy,.5);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';if(Math.random()<.3)part(B.x+t.ox,B.y+t.oy,rnd(-10,10),rnd(-40,-10),.5,3,ART.glow.o);}}
 cx.restore();
 if(B.beam){const bm=B.beam;if(bm.t<1.6){cx.fillStyle='rgba(255,80,160,'+(.2+Math.sin(bm.t*40)*.12)+')';cx.fillRect(bm.x-15,B.y,30,GH);cx.fillStyle='rgba(255,120,200,.85)';cx.fillRect(bm.x-.75,B.y,1.5,GH);for(let y=B.y+((G.t*160)%24);y<GH;y+=24){cx.fillRect(bm.x-15,y,2,10);cx.fillRect(bm.x+13,y,2,10);}}
  else if(bm.t<2.8){cx.globalCompositeOperation='lighter';const w=15+Math.sin(bm.t*60)*3;cx.fillStyle=GL(cx,bm.x-w*1.6,0,bm.x+w*1.6,0,[[0,'rgba(255,40,140,0)'],[.25,'rgba(255,50,150,.55)'],[.45,'rgba(255,170,220,.9)'],[.5,'#fff'],[.55,'rgba(255,170,220,.9)'],[.75,'rgba(255,50,150,.55)'],[1,'rgba(255,40,140,0)']]);cx.fillRect(bm.x-w*1.6,B.y+hh*.3,w*3.2,GH);spr(ART.glow.p,bm.x,B.y+hh*.4,5);spr(ART.glow.w,bm.x,B.y+hh*.4,2);cx.globalCompositeOperation='source-over';}}}
// ---------- fireworks on stage clear ----------
const FW=[];function drawFireworks(dt){if(G.mode==='clear')FX.fw=Math.max(FX.fw,.5);FX.fw-=dt*.2;FX.fwC-=dt;
 if(FX.fwC<=0&&FX.fw>0&&FW.length<6){FX.fwC=rnd(.25,.6);const c=['255,90,190','255,225,90','100,240,255','180,110,255','110,255,140'][Math.random()*5|0];FW.push({x:rnd(50,GW-50),y:rnd(GH*.12,GH*.4),t:0,c,n:QUAL>1?28:16,s:Math.random()*TAU});}
 cx.globalCompositeOperation='lighter';for(let k=FW.length-1;k>=0;k--){const f=FW[k];f.t+=dt;if(f.t>1.4){FW.splice(k,1);continue;}const e=1-Math.pow(1-Math.min(1,f.t/1.1),3),a=Math.max(0,1-f.t/1.4);
  if(f.t<.12){cx.globalAlpha=1;spr(ART.glow.w,f.x,f.y,1.3);}
  cx.strokeStyle='rgba('+f.c+','+a+')';cx.lineWidth=1.6;cx.beginPath();for(let i=0;i<f.n;i++){const an=f.s+i/f.n*TAU,r=e*60,dr=f.t*f.t*20;const x=f.x+Math.cos(an)*r,y=f.y+Math.sin(an)*r+dr;cx.moveTo(x,y);cx.lineTo(f.x+Math.cos(an)*r*.82,f.y+Math.sin(an)*r*.82+dr);}cx.stroke();
  cx.fillStyle='rgba(255,255,255,'+a+')';for(let i=0;i<f.n;i+=2){const an=f.s+i/f.n*TAU,r=e*60;cx.fillRect(f.x+Math.cos(an)*r-.8,f.y+Math.sin(an)*r+f.t*f.t*20-.8,1.6,1.6);}}
 cx.globalAlpha=1;cx.globalCompositeOperation='source-over';}
// ---------- neon glass HUD ----------
function rrect(x,y,w,h,r){cx.beginPath();if(cx.roundRect)cx.roundRect(x,y,w,h,r);else{cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}}
function glass(x,y,w,h,r,edge){rrect(x,y,w,h,r);cx.fillStyle=GL(cx,0,y,0,y+h,[[0,'rgba(40,26,90,.62)'],[1,'rgba(10,6,34,.72)']]);cx.fill();
 cx.strokeStyle=GL(cx,x,0,x+w,0,[[0,rgba(edge||'#7ae8ff',.75)],[.5,'rgba(255,255,255,.22)'],[1,rgba(edge||'#ff6ad0',.6)]]);cx.lineWidth=1;cx.stroke();
 cx.fillStyle='rgba(255,255,255,.07)';rrect(x+1.5,y+1.5,w-3,h*.42,Math.max(1,r-1.5));cx.fill();}
function hs(s,x,y,c,glow){cx.lineJoin='round';cx.lineWidth=2.4;cx.strokeStyle='rgba(10,0,24,.85)';cx.strokeText(s,x,y);if(glow&&QUAL>0){cx.shadowColor=glow;cx.shadowBlur=6;}cx.fillStyle=c;cx.fillText(s,x,y);cx.shadowBlur=0;}
function gauge(x,y,r,f,col,k){cx.fillStyle='rgba(10,6,34,.7)';cx.beginPath();cx.arc(x,y,r+3,0,TAU);cx.fill();cx.strokeStyle='rgba(255,255,255,.15)';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,r,0,TAU);cx.stroke();
 cx.strokeStyle=col;cx.lineWidth=2.4;cx.lineCap='round';cx.beginPath();cx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*f);cx.stroke();cx.lineCap='butt';spr(ART.spr.pu[k],x,y,.42);}
function drawHUD(){const top=SAFE_T+6,S=ART.spr;cx.textBaseline='middle';
 // score panel
 glass(6,top,112,32,9,'#7ae8ff');cx.textAlign='left';cx.font='10px PS2P';hs(String(G.score).padStart(7,'0'),13,top+11,'#ffffff','#7ae8ff');cx.font='6px PS2P';hs('HI '+String(Math.max(SAVE.hi,G.score)).padStart(7,'0'),13,top+24,'#ff9ad8');
 // stage pill + progress
 const lbl=G.special?'★ '+T('spStage'):(T('stage')+' '+(G.endless?stNum():G.stage));cx.font='7px PS2P, system-ui';const lw=Math.max(70,cx.measureText(lbl).width+20);const px=GW/2-lw/2+20;
 glass(px,top,lw,G.boss?18:26,9,'#ffb04a');cx.textAlign='center';hs(lbl,px+lw/2,top+9.5,'#7ae8ff');
 if(!G.boss&&G.mode==='play'){const pr=Math.min(1,G.t/G.dur),bx=px+8,bw=lw-16;cx.fillStyle='rgba(255,255,255,.13)';rrect(bx,top+18,bw,3.5,2);cx.fill();cx.fillStyle=GL(cx,bx,0,bx+bw,0,[[0,'#ff4fb8'],[.5,'#ff8a2a'],[1,'#ffe14a']]);rrect(bx,top+18,Math.max(3.5,bw*pr),3.5,2);cx.fill();
  cx.globalCompositeOperation='lighter';spr(ART.glow.y,bx+bw*pr,top+19.7,.45);cx.globalCompositeOperation='source-over';}
 // combo pill (pops when it grows)
 if(G.combo!==FX.lastCombo){if(G.combo>FX.lastCombo&&G.combo%8===0)FX.comboPop=1;FX.lastCombo=G.combo;}FX.comboPop=Math.max(0,FX.comboPop-1/40);
 if(G.combo>=8){const m=comboMul(),col=['#fff','#ffe14a','#ffb04a','#ff7a4a','#ff4fb8','#c86bff','#7ae8ff','#7dff6a'][m-1];const x=GW-58,y=top+44,s=1+FX.comboPop*.35;cx.save();cx.translate(x,y);cx.scale(s,s);glass(-48,-11,96,22,11,col);cx.font='10px PS2P';cx.textAlign='center';hs('x'+m,-22,1,col,col);cx.font='6px PS2P';hs(G.combo+' COMBO',16,1,'#ffffff');
  const cf=clamp(G.comboT/1.7,0,1);cx.fillStyle=rgba(col,.8);cx.fillRect(-40,7,80*cf,1.5);cx.restore();}
 // boss bar
 const B=G.boss;if(B&&B.t>1){const y=top+40,bx=20,bw=GW-40,fr=B.hp/B.mhp;FX.hpLag=Math.max(fr,FX.hpLag-(1/60)*.25);if(FX.hpLag<fr)FX.hpLag=fr;
  glass(bx-6,y-6,bw+12,28,8,B.D[3]);cx.fillStyle='rgba(0,0,0,.5)';rrect(bx,y,bw,8,4);cx.fill();cx.fillStyle='rgba(255,255,255,.55)';rrect(bx,y,bw*FX.hpLag,8,4);cx.fill();
  cx.fillStyle=GL(cx,bx,0,bx+bw,0,[[0,'#ff2a6a'],[.5,'#ff8a2a'],[1,'#ffe14a']]);rrect(bx,y,Math.max(8,bw*fr),8,4);cx.fill();cx.fillStyle='rgba(255,255,255,.35)';cx.fillRect(bx+3,y+1.2,Math.max(0,bw*fr-6),1.5);
  cx.fillStyle='rgba(10,0,20,.7)';[.34,.67].forEach(m=>cx.fillRect(bx+bw*m,y,1.5,8));cx.font='6px PS2P';cx.textAlign='center';hs(B.D[0].toUpperCase(),GW/2,y+15.5,'#ffd0e8');}
 else FX.hpLag=1;
 // bottom-left status panel
 const by=GH-SAFE_B-58;glass(6,by,134,52,10,'#7ae8ff');
 const nl=Math.min(P.lives,5);for(let i=0;i<nl;i++)spr(skinB(P.ship),20+i*15,by+12,.27);cx.font='7px PS2P';cx.textAlign='left';if(P.lives>5)hs('x'+P.lives,92,by+12,'#fff');
 for(let i=0;i<P.shield;i++){cx.strokeStyle='#7ab8ff';cx.lineWidth=1.4;cx.beginPath();cx.arc(112+i*7-(P.shield-1)*3.5,by+12,3,0,TAU);cx.stroke();}
 const wc=P.wt==='B'?'#ffb35a':PU_COL[P.wt];spr(S.pu[P.wt==='B'?'W':P.wt],19,by+29,.4);const wn={B:'BLT',S:'SPR',L:'LSR',H:'MSL'}[P.wt];cx.font='9px PS2P';const wv=P.wt==='B'?P.wl:(P.wlv||1),wm=P.wt==='B'?MAXWL:3;hs(wn+' '+(wv>=wm?'MAX':'Lv'+wv),31,by+30,wc);if(P.wt!=='B')for(let i=0;i<3;i++){cx.fillStyle=i<wv?wc:'rgba(255,255,255,.2)';rrect(12+i*11,by+41,9,5,2);cx.fill();}
 if(P.pw>0){cx.font='9px PS2P';hs('W'+(P.pw>=4?'MAX':P.pw),45,by+45,PU_COL.W);cx.font='6px PS2P';}
 for(let i=0;i<5;i++){const on=i<=tierOf();cx.fillStyle=on?TIER_COL[i]:'rgba(255,255,255,.14)';rrect(86+i*10,by+41,8,6,2);cx.fill();if(on&&i===tierOf()&&QUAL>0){cx.globalCompositeOperation='lighter';spr(ART.glow[['b','c','g','y','w'][i]],90+i*10,by+44,.35);cx.globalCompositeOperation='source-over';}}
 // timed power-up gauges
 let ix=GW-22;for(const [k,v] of [['M',P.magT],['X',P.x2T],['D',P.droneT]]){if(v>0){gauge(ix,by-62,11,Math.min(1,v/(k==='D'?droneMax():12*UPF.pwr())),PU_COL[k],k);if(k==='D'&&P.dlv>1){cx.font='8px PS2P';cx.textAlign='center';hs('x'+P.dlv,ix,by-42,PU_COL.D);cx.textAlign='left';}ix-=30;}}
 const bb=$('bombB');if(bb&&FX.lastBombs!==P.bombs){FX.lastBombs=P.bombs;bb.dataset.n=P.bombs;bb.classList.toggle('empty',P.bombs<=0);}
 // boss warning: hazard-striped banner
 if(G.warnT>0){const a=Math.abs(Math.sin(G.warnT*5)),y=GH*.38;cx.fillStyle='rgba(60,0,20,'+(.55*a+.2)+')';cx.fillRect(0,y,GW,72);
  cx.save();cx.beginPath();cx.rect(0,y,GW,8);cx.rect(0,y+64,GW,8);cx.clip();cx.fillStyle='rgba(255,200,40,'+(.5+a*.5)+')';const o=(G.t*40)%20;for(let x=-20+o;x<GW+20;x+=20){cx.beginPath();cx.moveTo(x,y+72);cx.lineTo(x+10,y);cx.lineTo(x+18,y);cx.lineTo(x+8,y+72);cx.fill();}cx.restore();
  cx.textAlign='center';cx.font='20px PS2P, system-ui';hs(T('warning'),GW/2,y+30,'#fff','#ff3a6a');cx.font='8px PS2P, system-ui';hs(T('bossApproach'),GW/2,y+51,'#ffd0e0');}
 if(G.mode==='clear'&&G.clearT>.3){const k=Math.min(1,(G.clearT-.3)*3),y=GH*.4;cx.save();cx.translate(GW/2,y);cx.globalCompositeOperation='lighter';cx.globalAlpha=.35*k;cx.rotate(G.clearT*.3);for(let i=0;i<10;i++){cx.rotate(TAU/10);cx.fillStyle=GL(cx,0,0,170,0,[[0,'rgba(255,230,120,.9)'],[1,'rgba(255,230,120,0)']]);cx.beginPath();cx.moveTo(0,0);cx.lineTo(170,-14);cx.lineTo(170,14);cx.fill();}cx.restore();cx.globalAlpha=1;
  cx.save();cx.translate(GW/2,y);const s=.6+.4*k+Math.sin(G.clearT*4)*.02;cx.scale(s,s);cx.textAlign='center';cx.font='16px PS2P, system-ui';hs(T('clear'),0,0,'#ffe14a','#ff8a2a');cx.restore();}
 // stage intro card
 if(G.t<2.6&&G.mode==='play'&&!G.noIntro){const a=Math.min(1,(2.6-G.t)*1.5,G.t*4),y=GH*.36;cx.globalAlpha=a;const w=Math.min(GW-40,260);cx.save();cx.translate(GW/2,y+12);cx.scale(1,Math.min(1,G.t*5));glass(-w/2,-26,w,52,12,G.special?'#ffd23a':'#7ae8ff');cx.restore();
  cx.textAlign='center';cx.font=G.special&&!/^[\x00-\x7f★ ]*$/.test(T('spStage'))?'bold 11px system-ui, sans-serif':'8px PS2P, system-ui';hs((G.special?'★ '+T('spStage')+' ★':T('stage')+' '+(G.endless?stNum():G.stage)),GW/2,y,G.special?'#ffe14a':'#7ae8ff');{let z=13;cx.font=z+'px PS2P, system-ui';const nm=T(G.special?'spName':STAGE_NAMES[G.bg]);while(cx.measureText(nm).width>w-18&&z>8){z--;cx.font=z+'px PS2P, system-ui';}}hs(T(G.special?'spName':STAGE_NAMES[G.bg]),GW/2,y+20,'#fff',G.special?'#b04aff':'#ff6ad0');cx.globalAlpha=1;}
 cx.textBaseline='alphabetic';}
