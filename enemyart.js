// ---------- v14: menacing alien roster + premium rewards (all pre-rendered) ----------
const DK=['#7a68a8','#2a1a46','#08040f'],DK2=['#9a7ac8','#3a1a5a','#0c0418'],CRM=['#ff8a96','#9a0c2a','#1c0208'],STL=['#8aa8e8','#22306a','#050818'],BONE=['#fff4e2','#cbb79c','#3e2e26'];
function aEye(g,x,y,r,col,side){g.save();g.translate(x,y);g.rotate(side*-.42);
 g.fillStyle='#04010a';g.beginPath();g.ellipse(0,0,r*1.45,r*1.05,0,0,7);g.fill();
 g.save();g.shadowColor=col;g.shadowBlur=r*2.4;g.fillStyle=GR(g,0,r*.1,0,r*1.15,[[0,'#ffffff'],[.3,'#fff6c8'],[.55,col],[1,col]]);
 g.beginPath();g.moveTo(-r*1.15,0);g.quadraticCurveTo(0,-r*1.0,r*1.15,0);g.quadraticCurveTo(0,r*.9,-r*1.15,0);g.fill();g.restore();
 g.fillStyle='#0a0006';g.beginPath();g.ellipse(0,r*.05,r*.17,r*.62,0,0,7);g.fill();
 g.save();g.beginPath();g.ellipse(0,0,r*1.45,r*1.05,0,0,7);g.clip();g.fillStyle='#04010a';g.beginPath();g.moveTo(-r*1.6,-r*1.3);g.lineTo(r*1.6,-r*1.3);g.lineTo(r*1.6,-r*.3);g.quadraticCurveTo(0,-r*.55,-r*1.6,-r*.62);g.closePath();g.fill();g.restore();
 g.restore();}
function cEye(g,x,y,r,col){ // single cyclops eye with angry V-brow
 g.fillStyle='#04010a';g.beginPath();g.ellipse(x,y,r*1.45,r*1.2,0,0,7);g.fill();
 g.save();g.shadowColor=col;g.shadowBlur=r*2.2;g.fillStyle=GR(g,x,y,0,r*1.1,[[0,'#ffffff'],[.28,'#fff2c0'],[.55,col],[1,col]]);g.beginPath();g.ellipse(x,y,r*1.15,r*.92,0,0,7);g.fill();g.restore();
 g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=r*.18;g.beginPath();g.arc(x,y,r*.62,0,7);g.stroke();
 g.fillStyle='#0a0006';g.beginPath();g.ellipse(x,y,r*.17,r*.78,0,0,7);g.fill();
 g.save();g.beginPath();g.ellipse(x,y,r*1.45,r*1.2,0,0,7);g.clip();g.fillStyle='#04010a';g.beginPath();g.moveTo(x-r*1.7,y-r*1.5);g.lineTo(x+r*1.7,y-r*1.5);g.lineTo(x+r*1.7,y-r*.95);g.lineTo(x,y-r*.42);g.lineTo(x-r*1.7,y-r*.95);g.closePath();g.fill();g.restore();}
function fangs(g,x,y,w,n,len,col){g.fillStyle=GL(g,0,y,0,y+len,[[0,'#ffffff'],[1,col||'#d8c8b0']]);const st=w/n;for(let i=0;i<n;i++){const fx=x-w/2+st*i,l=len*(i===0||i===n-1?1.15:.75);g.beginPath();g.moveTo(fx,y);g.lineTo(fx+st,y);g.lineTo(fx+st/2,y+l);g.closePath();g.fill();}
 g.strokeStyle='rgba(20,0,10,.6)';g.lineWidth=.4;g.stroke();}
function vein(g,col,w,pts){g.save();g.shadowColor=col;g.shadowBlur=4;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=4)g.quadraticCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3]);g.stroke();g.restore();}
function spikeT(g,x0,y0,x1,y1,w,pal,tip){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a)*w,ny=Math.cos(a)*w;g.fillStyle=GL(g,x0,y0,x1,y1,[[0,pal[1]],[.7,pal[0]],[1,tip||'#ffffff']]);g.beginPath();g.moveTo(x0+nx,y0+ny);g.lineTo(x1,y1);g.lineTo(x0-nx,y0-ny);g.closePath();g.fill();g.strokeStyle='rgba(6,0,16,.85)';g.lineWidth=.5;g.stroke();}
Object.assign(AL,{
 zig(g){ // STINGER WASP: toxic wings, armored abdomen, mandibles
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GR(g,-11,-8,0,11,[[0,'rgba(210,255,170,.6)'],[1,'rgba(40,190,70,.14)']]);
   g.beginPath();g.ellipse(-10,-7,9.5,4,-.55,0,7);g.fill();g.strokeStyle='rgba(170,255,140,.75)';g.lineWidth=.6;g.stroke();
   g.beginPath();g.ellipse(-9.5,-.5,7,2.8,-.12,0,7);g.fill();g.stroke();
   g.strokeStyle='rgba(120,255,110,.5)';g.beginPath();g.moveTo(-3,-4);g.lineTo(-17,-11);g.moveTo(-6,-6);g.lineTo(-12,-3);g.moveTo(-3,-1);g.lineTo(-15,-1);g.stroke();g.restore();});
  spikeT(g,0,-11,0,-19,2,BONE,'#c8ff6a');
  const ab=()=>{g.beginPath();g.ellipse(0,-6.5,5.6,7.6,0,0,7);};hull6(g,ab,DK,5.6,{h:8,glow:'rgba(120,255,60,.7)',gb:6,rim:'rgba(170,255,120,.7)'});
  g.save();ab();g.clip();g.save();g.shadowColor='#8dff3a';g.shadowBlur=4;g.fillStyle='#8dff3a';[-11,-7.5,-4].forEach(y=>g.fillRect(-6,y,12,1.4));g.restore();g.restore();
  hull6(g,()=>{g.beginPath();g.ellipse(0,2.5,6.5,4.6,0,0,7);},CRM,6.5,{h:5});
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GL(g,-4,12,-2,19,[[0,'#3a2a20'],[.6,'#e8dcc0'],[1,'#ffffff']]);g.beginPath();g.moveTo(-4.8,11);g.quadraticCurveTo(-6.4,16.5,-1.6,18.6);g.quadraticCurveTo(-3.4,15.5,-2.2,12.4);g.closePath();g.fill();g.strokeStyle='#120008';g.lineWidth=.5;g.stroke();g.restore();});
  const hd=()=>poly(g,[0,15,-5.4,13,-7.6,8,-5.6,4.2,0,5],true);hull6(g,hd,DK2,7.6,{h:7,glow:'rgba(120,255,60,.6)',gb:4,rim:'rgba(170,255,140,.7)'});
  aEye(g,-3.4,9.2,2.5,'#9dff3a',-1);aEye(g,3.4,9.2,2.5,'#9dff3a',1);
  g.strokeStyle='#1a0a28';g.lineWidth=.9;g.beginPath();g.moveTo(-2,5.4);g.quadraticCurveTo(-5,1,-8,-1);g.moveTo(2,5.4);g.quadraticCurveTo(5,1,8,-1);g.stroke();},
 sine(g){ // VOID SQUID: one huge eye, hooked tentacles, glowing veins
  for(let i=-3;i<=3;i++){const x0=i*2.7,x1=i*3.7+(i%2?1.6:-1.6);const tp=()=>{g.beginPath();g.moveTo(x0-1.4,3);g.bezierCurveTo(x0+2,8,x1-3,12,x1,18.5);g.bezierCurveTo(x1-1.6,12,x0+3.2,8,x0+1.4,3);g.closePath();};
   g.save();g.shadowColor='#ff4fd8';g.shadowBlur=3;tp();g.fillStyle=GL(g,0,3,0,19,[[0,'#7a2ab8'],[.6,'#a03ad8'],[1,'#ff8ae8']]);g.fill();g.restore();tp();g.strokeStyle='rgba(20,0,40,.8)';g.lineWidth=.5;g.stroke();
   g.save();g.shadowColor='#ff4fd8';g.shadowBlur=3;g.fillStyle='#ffc0f4';[.35,.6].forEach(k=>{g.beginPath();g.arc(x0+(x1-x0)*k,3+15*k,.6,0,7);g.fill();});g.restore();}
  const m=()=>{g.beginPath();g.moveTo(-12,5);g.bezierCurveTo(-14,-6,-6,-15,0,-18);g.bezierCurveTo(6,-15,14,-6,12,5);g.quadraticCurveTo(0,8.5,-12,5);g.closePath();};
  hull6(g,m,['#a05ae0','#3e1268','#0c0218'],13,{h:16,glow:'rgba(255,70,220,.85)',gb:8,rim:'rgba(255,150,240,.6)'});
  g.save();m();g.clip();vein(g,'#ff4fd8',.9,[0,-17,-3,-11,-1,-7]);vein(g,'#ff4fd8',.8,[-8,-6,-6,-2,-5,1]);vein(g,'#ff4fd8',.8,[8,-6,6,-2,5,1]);vein(g,'#c86bff',.6,[-4,-14,-7,-10,-9,-8]);vein(g,'#c86bff',.6,[4,-14,7,-10,9,-8]);g.restore();
  [-1,1].forEach(s=>spikeT(g,s*9,-7,s*14.5,-12,1.4,DK2,'#ff9af0'));
  cEye(g,0,-3,4.2,'#ff3ad0');fangs(g,0,5.2,12,5,3.2,'#e8c8ff');},
 vwing(g){ // RAZOR BAT: spiked crimson wings, horned head, fangs
  const w=()=>poly(g,[0,-6,-6,-9.5,-12,-12.5,-20,-6,-17,-2.5,-20,2.5,-14.5,1,-14,7,-9,3,-5,9,0,6],true);
  hull6(g,w,CRM,20,{glow:'rgba(255,30,70,.9)',gb:8,h:12,rim:'rgba(255,150,170,.75)'});
  g.save();w();g.clip();g.strokeStyle='rgba(30,0,10,.75)';g.lineWidth=.7;[-1,1].forEach(s=>{g.beginPath();g.moveTo(s*4,-4);g.lineTo(s*17,-4);g.moveTo(s*4,-2);g.lineTo(s*14,4);g.moveTo(s*4,0);g.lineTo(s*8,6);g.stroke();});
   [-1,1].forEach(s=>{vein(g,'#ff4a6a',.5,[s*5,-5,s*10,-7,s*16,-5]);});g.restore();
  const h=()=>poly(g,[0,-7,4.6,-6,6.2,0,3.4,6.6,0,8.4],true);hull6(g,h,DK,6.2,{h:8});
  [-1,1].forEach(s=>spikeT(g,s*3.6,-6,s*6.6,-13,1.3,DK2,'#ff6a8a'));
  aEye(g,-2.5,0,1.9,'#ff2a3a',-1);aEye(g,2.5,0,1.9,'#ff2a3a',1);fangs(g,0,5.6,4.6,2,3);},
 diver(g){ // HORNET LANCER: armored dart, amber blade wings, bone lance
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GR(g,-12,-5,0,8,[[0,'rgba(255,230,160,.7)'],[1,'rgba(255,140,20,.18)']]);g.beginPath();g.ellipse(-11.5,-5,7.4,2.6,.5,0,7);g.fill();
   g.strokeStyle='rgba(255,200,110,.85)';g.lineWidth=.5;g.stroke();g.beginPath();g.moveTo(-6,-2.5);g.lineTo(-17,-8);g.stroke();g.restore();});
  const b=()=>poly(g,[0,13,-4.5,7,-10,-2,-9,-11,-3,-8.6,0,-12],true);hull6(g,b,DK,10,{glow:'rgba(255,170,30,.8)',gb:7,h:14,rim:'rgba(255,210,120,.7)'});
  g.save();b();g.clip();g.save();g.shadowColor='#ffb21a';g.shadowBlur=4;g.fillStyle='#ffb21a';[-6.5,-2.5].forEach(y=>{g.fillRect(-10,y,20,1.6);});g.restore();g.restore();
  spikeT(g,0,10,0,19.5,2.4,BONE,'#ffd08a');
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GL(g,-6,6,-2,14,[[0,'#2a1a10'],[.6,'#d8c8a8'],[1,'#fff']]);g.beginPath();g.moveTo(-5.5,5);g.quadraticCurveTo(-7.5,11,-2.6,14.5);g.quadraticCurveTo(-4.5,10.5,-3.2,6.5);g.closePath();g.fill();g.restore();});
  aEye(g,-3.3,2.6,2.2,'#ff4a1a',-1);aEye(g,3.3,2.6,2.2,'#ff4a1a',1);},
 kami(g){ // SKULL DART: bone skull face with glowing sockets, crimson fins, horns
  [-1,1].forEach(s=>{g.save();g.scale(s,1);hull6(g,()=>poly(g,[-6,-5,-15,-12.5,-13,-2,-7,3]),CRM,4.5,{h:8,cx:-10});g.restore();spikeT(g,s*5.4,-9,s*9,-15.5,1.5,DK2,'#ff6a4a');});
  const sk=()=>{g.beginPath();g.moveTo(0,-12.5);g.bezierCurveTo(-10.5,-12.5,-11.5,-1,-8,4);g.lineTo(-5.5,11);g.lineTo(5.5,11);g.lineTo(8,4);g.bezierCurveTo(11.5,-1,10.5,-12.5,0,-12.5);g.closePath();};
  hull6(g,sk,BONE,11,{h:12,glow:'rgba(255,50,30,.9)',gb:8});
  g.save();sk();g.clip();g.strokeStyle='rgba(60,20,10,.6)';g.lineWidth=.6;g.beginPath();g.moveTo(1,-12.5);g.lineTo(2.5,-8);g.lineTo(.5,-6);g.moveTo(-7,-8);g.lineTo(-5,-5.5);g.stroke();g.restore();
  [-1,1].forEach(s=>{g.save();g.translate(s*3.9,-1.2);g.rotate(s*.32);g.fillStyle='#120206';g.beginPath();g.ellipse(0,0,3.5,2.7,0,0,7);g.fill();g.restore();
   g.save();g.shadowColor='#ff3a1a';g.shadowBlur=6;g.fillStyle=GR(g,s*3.6,-.6,0,2,[[0,'#ffffff'],[.4,'#ffd04a'],[1,'#ff3a1a']]);g.beginPath();g.ellipse(s*3.6,-.6,1.9,1.3,s*.32,0,7);g.fill();g.restore();
   g.fillStyle='#0a0004';g.fillRect(s*3.6-.3,-1.6,.6,2);});
  g.fillStyle='#1a0408';poly(g,[0,2.6,1.4,5,-1.4,5]);g.fill();
  g.fillStyle='#1a0408';g.fillRect(-5,6.6,10,3.6);g.fillStyle=GL(g,0,6.6,0,10,[[0,'#ffffff'],[1,'#c8b49a']]);for(let i=0;i<5;i++)g.fillRect(-4.6+i*2,6.9,1.4,2.8);},
 saucer(g){ // GUNSHIP: gunmetal disc, rim blades, cyclops pilot, red slots, cannon
  for(let i=0;i<5;i++){const x=-16+i*8;spikeT(g,x,5,x*1.08,10.5+(i===2?2:0),1.4,DK,'#ff5a5a');}
  [-1,1].forEach(s=>spikeT(g,s*19,1,s*23,-2,1.6,DK2,'#ff3a4a'));
  g.save();g.beginPath();g.ellipse(0,-3,9.8,9.8,0,Math.PI,0);g.closePath();g.fillStyle=GR(g,-3,-9,0,11,[[0,'rgba(255,220,230,.55)'],[.5,'rgba(120,20,60,.75)'],[1,'rgba(30,0,20,.95)']]);g.fill();g.clip();
  cEye(g,0,-5.6,3.6,'#ff2a3a');shine(g,-4.8,-8.6,2.2,3.6,.55,-.5);g.restore();
  const d=()=>{g.beginPath();g.ellipse(0,1.5,20.5,6.4,0,0,7);};
  g.save();g.shadowColor='#ff2a4a';g.shadowBlur=8;d();g.fillStyle=GL(g,0,-4.9,0,7.9,[[0,'#c8c0e0'],[.3,'#5a4a7a'],[.6,'#1e1430'],[1,'#06030c']]);g.fill();g.restore();
  g.save();d();g.clip();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.7;g.beginPath();g.ellipse(0,1,19.5,5.4,0,Math.PI*1.06,Math.PI*1.94);g.stroke();
  g.save();g.shadowColor='#ff2a4a';g.shadowBlur=4;g.fillStyle='#ff3a4a';for(let k=-3;k<=3;k++)g.fillRect(k*5-1.5,2.2,3,1.2);g.restore();g.restore();
  d();g.strokeStyle='rgba(4,0,12,.95)';g.lineWidth=.8;g.stroke();
  g.fillStyle=GL(g,-5,0,5,0,[[0,'#120a20'],[.5,'#5a4a7a'],[1,'#120a20']]);poly(g,[-5,6.5,5,6.5,3,10.5,-3,10.5]);g.fill();
  g.save();g.shadowColor='#ff8a2a';g.shadowBlur=6;g.fillStyle='#ffd49a';g.beginPath();g.ellipse(0,10.6,2.6,1.1,0,0,7);g.fill();g.restore();},
 shield(g){ // SHIELD BEETLE: horned carapace, cyan veins, crushing pincers
  [-1,1].forEach(s=>{g.save();g.scale(s,1);g.fillStyle=GL(g,-7,9,-4,19,[[0,'#1e2a5a'],[.6,'#9ab8f0'],[1,'#e8ffff']]);g.beginPath();g.moveTo(-7.5,8);g.quadraticCurveTo(-11.5,15,-4.5,18.6);g.quadraticCurveTo(-7.2,14,-3.6,10.5);g.closePath();g.fill();g.strokeStyle='#050818';g.lineWidth=.6;g.stroke();g.restore();
   spikeT(g,s*14,-5,s*19.5,-11,1.8,STL,'#7af0ff');});
  const b=()=>poly(g,[0,-15,-10,-13,-16.5,-5,-15.5,5,-10,11,-4,9.5,0,11],true);hull6(g,b,STL,16.5,{glow:'rgba(80,200,255,.85)',gb:8,h:15,rim:'rgba(170,240,255,.75)'});
  g.save();b();g.clip();g.strokeStyle='rgba(3,6,20,.85)';g.lineWidth=.9;g.beginPath();g.moveTo(0,-15);g.lineTo(0,4);g.stroke();
  g.strokeStyle='rgba(160,210,255,.35)';g.lineWidth=.7;for(let k=0;k<3;k++){g.beginPath();g.arc(0,-3,6+k*4,.3,Math.PI-.3);g.stroke();}
  vein(g,'#5af0ff',.7,[-3,-12,-7,-8,-12,-6]);vein(g,'#5af0ff',.7,[3,-12,7,-8,12,-6]);vein(g,'#5af0ff',.6,[-4,-2,-9,0,-12,3]);vein(g,'#5af0ff',.6,[4,-2,9,0,12,3]);g.restore();
  spikeT(g,0,-12,0,-19,2,STL,'#bff8ff');
  const h=()=>poly(g,[0,3,-6,4,-6.4,8.5,-3,11.6,0,12],true);hull6(g,h,DK,6.4,{h:6});
  aEye(g,-2.9,7.6,1.8,'#5af0ff',-1);aEye(g,2.9,7.6,1.8,'#5af0ff',1);},
 split(g){ // MAGMA GEODE: faceted lava-crystal arrowhead, glowing cracks, three eyes, jagged maw
  [[-11,-9,-17,-16],[11,-9,17,-16],[-14,2,-18.5,-1],[14,2,18.5,-1],[0,-11,0,-18]].forEach(q=>spikeT(g,q[0],q[1],q[2],q[3],2.2,CRM,'#ffc06a'));
  const P=[0,17,-6,9,-15,5,-13,-5,-7,-13,0,-9,7,-13,13,-5,15,5,6,9];const b=()=>poly(g,P);
  g.save();g.shadowColor='#ff5a1a';g.shadowBlur=9;b();g.fillStyle=GL(g,-10,-12,8,16,[[0,'#ffb07a'],[.3,'#c8301a'],[.7,'#4a0810'],[1,'#140206']]);g.fill();g.restore();
  g.save();b();g.clip();for(let i=0;i<P.length;i+=2){const j=(i+2)%P.length;g.fillStyle=(i/2)%2?'rgba(255,190,120,.22)':'rgba(10,0,6,.32)';g.beginPath();g.moveTo(0,1);g.lineTo(P[i],P[i+1]);g.lineTo(P[j],P[j+1]);g.closePath();g.fill();}
  vein(g,'#ffb03a',.9,[-13,-5,-8,-2,-6,1]);vein(g,'#ff7a1a',.9,[13,-5,8,-2,6,1]);vein(g,'#ffd04a',.8,[0,17,1,12,-1,8]);vein(g,'#ff7a1a',.7,[-15,5,-9,6,-5,8]);vein(g,'#ff7a1a',.7,[15,5,9,6,5,8]);g.restore();
  b();g.strokeStyle='#0a0002';g.lineWidth=1.1;g.stroke();
  g.strokeStyle='rgba(255,220,170,.7)';g.lineWidth=.6;g.beginPath();g.moveTo(-13,-5);g.lineTo(-7,-13);g.lineTo(0,-9);g.lineTo(7,-13);g.lineTo(13,-5);g.stroke();
  aEye(g,-5.4,-3,2.5,'#ffe14a',-1);aEye(g,5.4,-3,2.5,'#ffe14a',1);cEye(g,0,-8.4,1.5,'#ffe14a');
  g.fillStyle='#120002';poly(g,[-6,3,6,3,0,11]);g.fill();fangs(g,0,3.2,11,5,2.8);g.save();g.translate(0,9.4);g.scale(1,-1);fangs(g,0,0,5,2,1.8);g.restore();},
 mini(g){ // MAGMA SHARD: arrowhead crystal fragment, one eye
  const P=[0,10.5,-4,4,-8.6,-4,-3.6,-6,-4.4,-10.2,0,-7,4.4,-10.2,3.6,-6,8.6,-4,4,4];const b=()=>poly(g,P);
  g.save();g.shadowColor='#ff7a1a';g.shadowBlur=6;b();g.fillStyle=GL(g,-6,-8,5,10,[[0,'#ffb07a'],[.4,'#c0281a'],[1,'#2a0408']]);g.fill();g.restore();
  g.save();b();g.clip();g.fillStyle='rgba(10,0,6,.35)';poly(g,[0,1,8.6,-4,4,4,0,10.5]);g.fill();g.fillStyle='rgba(255,200,130,.25)';poly(g,[0,1,-8.6,-4,-3.6,-6,0,-7]);g.fill();
  vein(g,'#ffd04a',.7,[0,10.5,.6,7,0,4]);g.restore();
  b();g.strokeStyle='#0a0002';g.lineWidth=.9;g.stroke();cEye(g,0,-1.4,2.5,'#ffe14a');},
 mine(g){ // CROSS MINE: four-pronged rhombus bomb-pod, glowing tips, slit core eye
  const A=[0,Math.PI/2,Math.PI,Math.PI*1.5];
  A.forEach(a=>{const c=Math.cos(a),s=Math.sin(a);spikeT(g,c*7,s*7,c*17.5,s*17.5,3,DK,'#ff4ad8');
   g.save();g.shadowColor='#ff4fd8';g.shadowBlur=5;g.fillStyle='#ffe0f8';g.beginPath();g.moveTo(c*17.8,s*17.8);g.lineTo(c*15.4-s*1.3,s*15.4+c*1.3);g.lineTo(c*15.4+s*1.3,s*15.4-c*1.3);g.closePath();g.fill();g.restore();});
  [Math.PI/4,Math.PI*.75,Math.PI*1.25,Math.PI*1.75].forEach(a=>spikeT(g,Math.cos(a)*7,Math.sin(a)*7,Math.cos(a)*12.5,Math.sin(a)*12.5,1.6,DK2,'#ff8ae8'));
  const P=[0,-11.5,4,-4,11.5,0,4,4,0,11.5,-4,4,-11.5,0,-4,-4];const b=()=>poly(g,P);
  hull6(g,b,DK2,11.5,{h:11,glow:'rgba(255,60,200,.9)',gb:8,rim:'rgba(255,160,230,.7)'});
  g.save();b();g.clip();for(let i=0;i<P.length;i+=4){g.fillStyle='rgba(255,120,220,.18)';g.beginPath();g.moveTo(0,0);g.lineTo(P[i],P[i+1]);g.lineTo(P[i+2],P[i+3]);g.closePath();g.fill();}
  [[0,-11.5],[11.5,0],[0,11.5],[-11.5,0]].forEach(q=>vein(g,'#ff4fd8',.8,[q[0]*.95,q[1]*.95,q[0]*.6,q[1]*.6,q[0]*.35,q[1]*.35]));g.restore();
  b();g.strokeStyle='#05000c';g.lineWidth=1;g.stroke();
  g.fillStyle='#04010a';poly(g,[-6.4,0,0,-4.6,6.4,0,0,4.6]);g.fill();cEye(g,0,.2,3.6,'#ff2a3a');}});
Object.assign(EANIM,{zig:{c:[0,9,'g',.9]},sine:{c:[0,-3,'p',1.4]},vwing:{c:[0,0,'r',.9],flap:1},diver:{f:[0,-12,'y'],c:[0,2.6,'r',.8]},kami:{f:[0,-11,'o'],c:[0,-1,'r',1]},
 saucer:{lights:1,c:[0,-5.6,'r',.9]},shield:{c:[0,7.6,'c',.8]},split:{c:[0,-1,'o',1.3]},mini:{c:[0,-1.4,'y',.6]},mine:{c:[0,.2,'r',1.3]}});
const ESZ={zig:[40,42],sine:[38,40],vwing:[44,34],diver:[38,42],kami:[36,36],saucer:[50,34],shield:[44,42],split:[38,38],mini:[22,22],mine:[38,38]};
const ETIER_K={mine:[null,null,'hue-rotate(65deg) saturate(1.35) contrast(1.12)'],split:[null,null,'hue-rotate(150deg) saturate(1.25) contrast(1.12)'],mini:[null,null,'hue-rotate(150deg) saturate(1.25) contrast(1.12)']};
const ETIER=[null,'hue-rotate(-38deg) saturate(1.25)','hue-rotate(150deg) saturate(1.15) brightness(.95)'];
function tierVar(s,f){const c=mkC(s.c.width,s.c.height),g=c.getContext('2d');if(!('filter' in g))return s;g.filter=f;g.drawImage(s.c,0,0);return{c,w:s.w,h:s.h};}
// v22: stage 7-10 tier = ultraviolet/indigo duotone (luminance ramp, dark outline, soft violet glow), pre-rendered once
const UV_RAMP=[[0,[8,2,22]],[.22,[40,12,104]],[.45,[98,46,214]],[.7,[176,140,255]],[.9,[236,222,255]],[1,[255,255,255]]];
function uvVar(s){const W=s.c.width,H=s.c.height,a=mkC(W,H),ga=a.getContext('2d');ga.drawImage(s.c,0,0);let id;try{id=ga.getImageData(0,0,W,H);}catch(e){return tierVar(s,ETIER[2]);}const d=id.data;
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;let L=(.3*d[i]+.59*d[i+1]+.11*d[i+2])/255;L=Math.min(1,Math.max(0,(L-.05)*1.3));let j=1;while(j<UV_RAMP.length-1&&UV_RAMP[j][0]<L)j++;const p=UV_RAMP[j-1],q=UV_RAMP[j],t=(L-p[0])/(q[0]-p[0]||1);for(let k=0;k<3;k++)d[i+k]=p[1][k]+(q[1][k]-p[1][k])*t;}
 ga.putImageData(id,0,0);const sil=tintOf({c:a},'#05000c'),c=mkC(W,H),g=c.getContext('2d'),o=Math.max(1,Math.round(W/s.w*.6));
 g.save();g.shadowColor='rgba(170,110,255,.95)';g.shadowBlur=o*5;g.drawImage(sil,0,0);g.restore();
 for(const[dx,dy]of[[o,0],[-o,0],[0,o],[0,-o],[o,o],[-o,-o],[o,-o],[-o,o]])g.drawImage(sil,dx,dy);g.drawImage(a,0,0);return{c,w:s.w,h:s.h};}
function eTier(){return G.endless?G.sector%3:G.stage<=3?0:G.stage<=6?1:2;}
// ---------- rewards ----------
function puIcon(g,k){
const ink='#0a1430',W='#fff';g.lineWidth=1.2;
 const S=(f)=>{g.strokeStyle=ink;g.fillStyle=W;f();};
 switch(k){
  case'S':S(()=>{[-.5,0,.5].forEach(a=>{g.save();g.rotate(a);poly(g,[0,-8,3,-3,1,-3,1,4,-1,4,-1,-3,-3,-3]);g.fill();g.stroke();g.restore();});});break;
  case'L':S(()=>{g.fillRect(-1.6,-9,3.2,16);g.strokeRect(-1.6,-9,3.2,16);g.beginPath();g.arc(0,8,2.6,0,7);g.fill();g.stroke();});break;
  case'H':S(()=>{g.lineWidth=2.2;g.strokeStyle=W;g.beginPath();g.arc(0,0,5.5,0,7);g.stroke();g.beginPath();g.moveTo(0,-9);g.lineTo(0,-3);g.moveTo(0,3);g.lineTo(0,9);g.moveTo(-9,0);g.lineTo(-3,0);g.moveTo(3,0);g.lineTo(9,0);g.stroke();g.fillStyle=W;g.beginPath();g.arc(0,0,1.6,0,7);g.fill();});break;
  case'W':S(()=>{poly(g,[0,-7,5,0,2,0,2,6,-2,6,-2,0,-5,0]);g.fill();g.stroke();});break;
  case'P':S(()=>{g.lineWidth=1.8;g.strokeStyle=W;g.beginPath();g.moveTo(0,-7);g.lineTo(6,-4.5);g.lineTo(5.5,2);g.quadraticCurveTo(3.5,6,0,8);g.quadraticCurveTo(-3.5,6,-5.5,2);g.lineTo(-6,-4.5);g.closePath();g.stroke();});break;
  case'B':S(()=>{g.beginPath();g.arc(0,1.5,5.5,0,7);g.fill();g.stroke();g.fillRect(-1.5,-6.5,3,3);g.strokeStyle='#ffe14a';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-6.5);g.quadraticCurveTo(3,-9,4,-7);g.stroke();});break;
  case'V':S(()=>{[-4,1].forEach(y=>{poly(g,[0,y-4,7,y+3,4,y+3,0,y-.5,-4,y+3,-7,y+3]);g.fill();g.stroke();});});break;
  case'U':S(()=>{poly(g,[-2.5,-8,2.5,-8,2.5,-2.5,8,-2.5,8,2.5,2.5,2.5,2.5,8,-2.5,8,-2.5,2.5,-8,2.5,-8,-2.5,-2.5,-2.5]);g.fill();g.stroke();});break;
  case'M':S(()=>{g.lineWidth=4.5;g.strokeStyle=ink;g.beginPath();g.arc(0,-1,5,Math.PI,0,true);g.lineTo(5,-1);g.stroke();g.lineWidth=3;g.strokeStyle=W;g.beginPath();g.moveTo(-5,-6);g.lineTo(-5,-1);g.arc(0,-1,5,Math.PI,0,true);g.lineTo(5,-6);g.stroke();g.fillStyle='#3ad8ff';g.fillRect(-6.5,-9,3,3);g.fillRect(3.5,-9,3,3);});break;
  case'X':g.font='bold 9px "PS2P",monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle=ink;g.strokeText('x2',0,1);g.fillStyle=W;g.fillText('x2',0,1);break;}
}
function puSpr14(k){const col=PU_COL[k];return mk(36,36,g=>{
 g.save();g.scale(1.2,1.2);g.save();g.shadowColor=col;g.shadowBlur=7;gemShape(g,k);g.fillStyle=GL(g,-12,-12,12,12,[[0,'#fff6c8'],[.3,'#ffc83a'],[.55,'#8a5a00'],[.75,'#ffe28a'],[1,'#5a3200']]);g.fill();g.restore();
 gemShape(g,k);g.strokeStyle='#2a1600';g.lineWidth=.9;g.stroke();g.restore();
 g.save();g.scale(.96,.96);gemShape(g,k);g.fillStyle=GR(g,-4,-5,1,15,[[0,'#ffffff'],[.25,col],[.8,col],[1,'#06122e']]);g.fill();g.clip();
 for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2;g.fillStyle=i%2?'rgba(0,10,40,.22)':'rgba(255,255,255,.2)';g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*20,Math.sin(a)*20);g.lineTo(Math.cos(a+TAU/8)*20,Math.sin(a+TAU/8)*20);g.closePath();g.fill();}
 g.fillStyle=GR(g,0,0,0,7,[[0,'rgba(0,8,30,.55)'],[1,'rgba(0,8,30,0)']]);g.beginPath();g.arc(0,0,8,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-4,-7,6,2.4,-.5,0,7);g.fill();g.restore();
 g.save();g.scale(.95,.95);puIcon(g,k);g.restore();
 g.fillStyle='#fff';poly(g,[7,-10,7.6,-8,9.6,-7.4,7.6,-6.8,7,-4.8,6.4,-6.8,4.4,-7.4,6.4,-8]);g.fill();},3);}
function coinSpr14(){return mk(22,22,g=>{
 g.save();g.shadowColor='#ffb000';g.shadowBlur=4;g.beginPath();g.arc(0,0,8.6,0,7);g.fillStyle=GL(g,-8,-8,8,8,[[0,'#fff6c0'],[.35,'#ffc21a'],[.7,'#b06a00'],[1,'#5a3200']]);g.fill();g.restore();
 g.beginPath();g.arc(0,0,8.6,0,7);g.strokeStyle='#4a2800';g.lineWidth=.8;g.stroke();
 g.beginPath();g.arc(0,0,6.6,0,7);g.fillStyle=GR(g,-2.5,-3,0,8,[[0,'#fffbe0'],[.4,'#ffd84a'],[1,'#c88a00']]);g.fill();g.strokeStyle='rgba(120,70,0,.8)';g.lineWidth=.7;g.stroke();
 g.strokeStyle='rgba(255,250,210,.9)';g.lineWidth=.6;g.beginPath();g.arc(0,0,7.6,3.4,5.4);g.stroke();
 const st=(dx,dy,c)=>{g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU,r=i%2?1.9:4.4;g.lineTo(dx+Math.cos(a)*r,dy+Math.sin(a)*r);}g.closePath();g.fill();};
 st(.5,.6,'#8a5000');st(-.3,-.3,'#fff6c0');st(0,0,'#ffc21a');
 g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-3.4,-4.2,2.2,1,-.7,0,7);g.fill();},3);}
function coinEdge14(){return mk(22,22,g=>{g.beginPath();g.arc(0,0,8.6,0,7);g.fillStyle=GL(g,-8,0,8,0,[[0,'#5a3200'],[.5,'#c88a10'],[1,'#5a3200']]);g.fill();},3);}
const _ba14=buildArt;buildArt=function(){_ba14();const S=ART.spr;
 for(const k in ESZ){S[k]=mk(ESZ[k][0],ESZ[k][1],AL[k]);for(let t=1;t<3;t++)S[k+'_'+t]=t===2?uvVar(S[k]):tierVar(S[k],(ETIER_K[k]&&ETIER_K[k][t])||ETIER[t]);}
 for(const k in PU_COL)S.pu[k]=puSpr14(k);S.coin=coinSpr14();S.coinE=coinEdge14();};
// fly-to-HUD burst for collected rewards
const FLY=[];const _fxp=FX.pickup;FX.pickup=function(k,x,y){_fxp(k,x,y);if(FLY.length<28)FLY.push({k,x,y,t:0,d:k==='C'?.42:.6});
 if(k!=='C'&&QUAL>0)for(let i=0;i<6;i++){const a=Math.random()*TAU,p=part(x+Math.cos(a)*8,y+Math.sin(a)*8,Math.cos(a)*40,Math.sin(a)*40-30,.6,1.1,ART.spr.glint,0);}};
let _flyT=0;const _dh14=drawHUD;drawHUD=function(){_dh14();const now=performance.now()/1000,dt=Math.min(.05,_flyT?now-_flyT:0);_flyT=now;if(!FLY.length)return;
 const tx=40,ty=SAFE_T+22;cx.globalCompositeOperation='lighter';
 for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.t+=dt;const k=f.t/f.d;if(k>=1||G.mode==='menu'){FLY.splice(i,1);if(k>=1&&QUAL>0){const r=part(tx,ty,0,0,.25,10,null,2);if(r)r.c=f.k==='C'?'255,215,80':hexRGB(PU_COL[f.k]);}continue;}
  const e=k*k*(3-2*k),mx=(f.x+tx)/2+40,my=Math.min(f.y,ty)+20,u=1-e,x=u*u*f.x+2*u*e*mx+e*e*tx,y=u*u*f.y+2*u*e*my+e*e*ty;
  cx.globalAlpha=1-k*.5;spr(f.k==='C'?ART.glow.y:ART.glow.c,x,y,.9-k*.4);spr(ART.spr.glint,x,y,.7,k*6);}
 cx.globalAlpha=1;cx.globalCompositeOperation='source-over';};
// ---------- v15: capsule / pill power-ups ----------
Object.assign(PU_COL,{W:'#ffa82a',B:'#ff4a3a',U:'#ff5aa0',M:'#a67aff'});
function capSpr(k){const col=PU_COL[k],gold=k==='X'||k==='W';return mk(50,42,g=>{g.rotate(-.32);const L=21,H=12.5;
 const pill=()=>{g.beginPath();g.moveTo(-L+H,-H);g.lineTo(L-H,-H);g.arc(L-H,0,H,-Math.PI/2,Math.PI/2);g.lineTo(-L+H,H);g.arc(-L+H,0,H,Math.PI/2,Math.PI*1.5);g.closePath();};
 g.save();g.shadowColor=col;g.shadowBlur=8;pill();g.fillStyle='#0a0618';g.fill();g.restore();
 // glass tube with glowing liquid
 g.save();pill();g.clip();g.fillStyle=GL(g,0,-H,0,H,[[0,'#ffffff'],[.18,col],[.55,col],[.56,'rgba(0,0,0,.0)'],[1,'#08061a']]);g.fillRect(-L,-H,L*2,H*2);
 g.fillStyle=GL(g,0,0,0,H,[[0,col],[1,'#120830']]);g.globalAlpha=.75;g.fillRect(-L,1,L*2,H);g.globalAlpha=1;
 g.globalCompositeOperation='lighter';g.fillStyle=GR(g,0,2,0,14,[[0,'rgba(255,255,255,.55)'],[.5,hexA(col).replace(/,1\)$/,',.45)')],[1,'rgba(0,0,0,0)']]);g.fillRect(-L,-H,L*2,H*2);
 g.fillStyle='rgba(255,255,255,.7)';[[-9,6,1.1],[-6.5,3,.7],[8,5.5,.9],[10.5,2.5,.6]].forEach(b=>{g.beginPath();g.arc(b[0],b[1],b[2],0,7);g.fill();});g.globalCompositeOperation='source-over';
 // metallic end caps
 const capG=gold?['#fff6c8','#ffc83a','#7a4a00','#ffe28a','#3a2000']:['#ffffff','#c8d0e8','#5a6488','#e8ecff','#1a1e38'];
 [-1,1].forEach(s=>{g.save();g.beginPath();if(s<0){g.rect(-L-1,-H-1,6.5,H*2+2);}else{g.rect(L-5.5,-H-1,6.5,H*2+2);}g.clip();pill();g.fillStyle=GL(g,0,-H,0,H,[[0,capG[0]],[.25,capG[1]],[.6,capG[2]],[.8,capG[3]],[1,capG[4]]]);g.fill();g.restore();
  const x=s*(L-5.5);g.strokeStyle='rgba(10,6,24,.9)';g.lineWidth=1;g.beginPath();g.moveTo(x,-H+.5);g.lineTo(x,H-.5);g.stroke();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.6;g.beginPath();g.moveTo(x-s*1,-H+1);g.lineTo(x-s*1,H-1);g.stroke();
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.6;for(let j=1;j<2;j++){g.beginPath();g.moveTo(x+s*j*2.6,-H+2);g.lineTo(x+s*j*2.6,H-2);g.stroke();}});
 g.restore();
 // outline + rim light
 pill();g.strokeStyle='#05030e';g.lineWidth=1.4;g.stroke();
 g.save();pill();g.clip();g.strokeStyle=col;g.lineWidth=1.4;g.beginPath();g.moveTo(-L+H,H-.6);g.lineTo(L-H,H-.6);g.stroke();g.restore();
 // centre oval window
 g.save();g.beginPath();g.ellipse(0,0,11.2,10.6,0,0,7);g.fillStyle=GL(g,0,-10,0,10,[[0,'#ffffff'],[.5,'#cfd6f0'],[1,'#5a6488']]);g.fill();
 g.beginPath();g.ellipse(0,0,9.8,9.2,0,0,7);g.fillStyle=GR(g,-2,-3,0,11,[[0,'#ffffff'],[.3,col],[1,'#0c0a2a']]);g.fill();g.restore();
 g.save();g.rotate(.32);g.scale(.9,.9);if(k==='S'){[-.85,0,.85].forEach(a=>{g.save();g.translate(0,6);g.rotate(a);const ar=()=>poly(g,[0,-12.5,3.3,-7.6,1,-7.6,1,-1,-1,-1,-1,-7.6,-3.3,-7.6]);ar();g.lineWidth=1.8;g.strokeStyle='#0a1430';g.stroke();g.restore();});[-.85,0,.85].forEach(a=>{g.save();g.translate(0,6);g.rotate(a);poly(g,[0,-12.5,3.3,-7.6,1,-7.6,1,-1,-1,-1,-1,-7.6,-3.3,-7.6]);g.fillStyle='#fff';g.fill();g.restore();});}else if(k==='U'){g.beginPath();g.moveTo(0,7);g.bezierCurveTo(-11,-1,-6,-10,0,-4);g.bezierCurveTo(6,-10,11,-1,0,7);g.closePath();g.lineWidth=2.4;g.strokeStyle='#0a1430';g.stroke();g.fillStyle='#fff';g.fill();}else{g.lineWidth=1.6;puIcon(g,k);}g.restore();
 // specular gloss along the top
 g.save();pill();g.clip();g.fillStyle=GL(g,0,-H,0,-H+6,[[0,'rgba(255,255,255,.85)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.ellipse(-2,-H+3,L-4,3.2,0,0,7);g.fill();g.restore();
 g.fillStyle='#fff';poly(g,[-12,-9,-11.4,-7,-9.4,-6.4,-11.4,-5.8,-12,-3.8,-12.6,-5.8,-14.6,-6.4,-12.6,-7]);g.fill();},3);}
const _ba15=buildArt;buildArt=function(){_ba15();const S=ART.spr;for(const k in PU_COL){if(k==='C')continue;S.pu[k]=capSpr(k);S.puGlow[k]=glowDot(hexA(PU_COL[k]),6);}};
