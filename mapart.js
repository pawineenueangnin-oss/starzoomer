// Starzoomer — stage-map 3D node art. Pre-rendered once into offscreen canvases (cached by key).
'use strict';
const MAPART={_n:{},_base:{},_sp:{},_star:null,_starOff:null,_rk:null,_glow:{},ready:0};

// tier frames per tens-page: 0 base chrome, 1 bronze (11-20), 2 silver (21-30), 3 gold (31+)
const MAP_TIER=[
 {rim:['#2a2048','#c8b8ff','#ffffff','#5a4a88'],glow:[180,140,255]},
 {rim:['#3a1a06','#c87828','#ffe2a8','#7a3a10'],glow:[255,170,80]},
 {rim:['#2a3040','#c0c8d8','#ffffff','#5a6880'],glow:[200,220,255]},
 {rim:['#4a3000','#ffc83a','#fff6c0','#8a5a08'],glow:[255,210,80]}
];
function mapTier(page){return page<=0?0:page===1?1:page===2?2:3;}

// Theme recipes matching stage landmarks (TH.lm) / names 1..10
const MAP_THEME=[
 {lm:'binary',hue:275,ramp:[[0,[40,16,80]],[.45,[140,70,220]],[.75,[230,160,255]],[1,[255,230,255]]],atm:[200,140,255],kind:'gas',spec:.35,extra:'binary'},
 {lm:'ringed',hue:20,ramp:[[0,[50,18,10]],[.4,[180,70,30]],[.7,[255,160,70]],[1,[255,230,180]]],atm:[255,140,70],kind:'gas',spec:.25,extra:'rings'},
 {lm:'ice',hue:195,ramp:[[0,[20,50,90]],[.4,[90,170,230]],[.75,[200,240,255]],[1,[255,255,255]]],atm:[140,210,255],kind:'ice',spec:.7,extra:null},
 {lm:'twin',hue:40,ramp:[[0,[50,25,10]],[.5,[220,130,40]],[1,[255,230,160]]],atm:[255,180,80],kind:'gas',spec:.4,extra:'twin'},
 {lm:'gas',hue:320,ramp:[[0,[50,10,40]],[.4,[200,50,150]],[.7,[255,140,200]],[1,[255,230,220]]],atm:[255,120,200],kind:'gas',spec:.3,extra:null},
 {lm:'storm',hue:215,ramp:[[0,[8,16,60]],[.4,[40,80,180]],[.7,[140,180,255]],[1,[230,245,255]]],atm:[100,150,255],kind:'storm',spec:.25,extra:null},
 {lm:'prism',hue:165,ramp:[[0,[10,40,50]],[.5,[40,220,200]],[1,[220,255,250]]],atm:[80,255,220],kind:'ice',spec:.6,extra:'prism'},
 {lm:'forge',hue:8,ramp:[[0,[30,8,6]],[.5,[120,30,20]],[.8,[255,100,30]],[1,[255,200,80]]],atm:[255,90,30],kind:'lava',spec:.2,extra:'embers'},
 {lm:'hive',hue:95,ramp:[[0,[10,25,10]],[.5,[60,130,40]],[1,[180,255,100]]],atm:[140,80,255],kind:'hive',spec:.2,extra:null},
 {lm:'hole',hue:300,ramp:[[0,[8,0,16]],[.5,[80,20,60]],[.8,[255,80,120]],[1,[255,220,255]]],atm:[255,80,160],kind:'gas',spec:.15,extra:'hole'}
];

function _mapSoftShadow(g,r){
 g.fillStyle=GR(g,0,r*.55,0,r*1.15,[[0,'rgba(0,0,0,.55)'],[1,'rgba(0,0,0,0)']]);
 g.beginPath();g.ellipse(0,r*.72,r*.85,r*.28,0,0,7);g.fill();
}
function _mapHalo(g,r,rgb,a){
 g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=GR(g,0,0,r*.55,r*1.35,[[0,rgba(rgb,(a||.45)*.55)],[.55,rgba(rgb,(a||.45)*.18)],[1,rgba(rgb,0)]]);
 g.beginPath();g.arc(0,0,r*1.35,0,7);g.fill();g.restore();
}
function _mapRim(g,r,tier){
 const C=MAP_TIER[tier].rim;
 // bevelled metallic ring
 g.beginPath();g.arc(0,0,r,0,7);g.strokeStyle=C[0];g.lineWidth=7.2;g.stroke();
 g.beginPath();g.arc(0,0,r,0,7);g.strokeStyle=GL(g,-r,-r,r,r,[[0,C[2]],[.35,C[1]],[.7,C[3]],[1,C[0]]]);g.lineWidth=5.2;g.stroke();
 g.beginPath();g.arc(0,0,r-2.6,0,7);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.2;g.stroke();
 g.beginPath();g.arc(0,0,r+3.2,Math.PI*.15,Math.PI*.85);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;g.stroke();
}
function _mapPlate(g,r,num,locked){
 // bevelled number plate disc
 const pr=r*.42;
 g.fillStyle=GR(g,-pr*.4,-pr*.5,0,pr,[[0,locked?'#4a4860':'#2a1a4a'],[.55,locked?'#1a1830':'#0c0820'],[1,'#050410']]);
 g.beginPath();g.arc(0,2,pr,0,7);g.fill();
 g.strokeStyle=locked?'#6a6880':'#ffe9a0';g.lineWidth=2.2;g.stroke();
 g.beginPath();g.arc(0,2,pr-1.6,0,7);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.stroke();
 // bevelled number
 const t=''+num;g.textAlign='center';g.textBaseline='middle';
 const fs=t.length>2?15:t.length>1?18:22;
 g.font='bold '+fs+'px PS2P,monospace';
 g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(t,0,3);
 g.fillStyle=GL(g,0,-8,0,10,[[0,'#ffffff'],[.55,locked?'#c8c8d8':'#fff6d0'],[1,locked?'#8a8aa0':'#ffd27a']]);
 g.fillText(t,0,3);
 g.fillStyle='rgba(255,255,255,.55)';g.font='bold '+fs+'px PS2P,monospace';
 g.fillText(t,0,1.5);
}
function _mapLock(g,r){
 g.save();g.translate(0,r*.02);
 // 3D padlock body
 g.fillStyle=GR(g,-6,-4,0,16,[[0,'#e8ecf8'],[.4,'#9aa4c0'],[1,'#3a4060']]);
 roundRect(g,-11,2,22,18,3);g.fill();
 g.strokeStyle='#1a1830';g.lineWidth=1.4;g.stroke();
 g.fillStyle=GL(g,-8,0,8,0,[[0,'#6a7088'],[.5,'#d8dce8'],[1,'#4a5068']]);
 g.fillRect(-3,7,6,8);g.strokeRect(-3,7,6,8);
 // shackle
 g.strokeStyle=GL(g,0,-10,0,4,[[0,'#ffffff'],[1,'#7a8098']]);g.lineWidth=3.4;g.lineCap='round';
 g.beginPath();g.arc(0,2,8,Math.PI,0);g.stroke();
 g.strokeStyle='#1a1830';g.lineWidth=1;g.beginPath();g.arc(0,2,8,Math.PI,0);g.stroke();
 g.restore();
}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

function _mapPlanetBody(g,r,ti,locked){
 const th=MAP_THEME[ti],seed=11+ti*17;
 const p=planetSpr(r*.78,th.kind,seed,{ramp:th.ramp,atm:th.atm,spec:th.spec,rim:.7,pad:r*.15,em:th.kind==='lava'?[255,120,30]:th.kind==='hive'?[190,255,90]:undefined});
 g.drawImage(p.c,-p.w/2,-p.h/2+1,p.w,p.h);
 if(locked){g.fillStyle='rgba(8,6,20,.62)';g.beginPath();g.arc(0,1,r*.82,0,7);g.fill();}
 // theme extras drawn on top (rings / dual suns / crystal facets / hole)
 if(th.extra==='rings'){_mapRings(g,r*.78,locked);}
 else if(th.extra==='binary'){_mapBinary(g,r,locked);}
 else if(th.extra==='twin'){_mapTwinSuns(g,r,locked);}
 else if(th.extra==='prism'){_mapPrismCap(g,r,locked);}
 else if(th.extra==='hole'){_mapHoleCap(g,r,locked);}
 else if(th.extra==='embers'&&!locked){_mapEmberSparks(g,r);}
}
function _mapRings(g,R,locked){
 g.save();g.rotate(-.35);g.scale(1,.28);
 const a=locked?.35:.7;
 g.strokeStyle=rgba([255,200,140],a*.55);g.lineWidth=R*.22;g.beginPath();g.arc(0,0,R*1.55,0,7);g.stroke();
 g.strokeStyle=rgba([255,230,180],a);g.lineWidth=R*.1;g.beginPath();g.arc(0,0,R*1.75,0,7);g.stroke();
 g.restore();
}
function _mapBinary(g,r,locked){
 g.save();g.globalCompositeOperation='lighter';
 [[-r*.35,-r*.2,r*.22,[255,200,160]],[r*.32,-r*.35,r*.15,[180,200,255]]].forEach(([x,y,rr,c])=>{
  g.fillStyle=GR(g,x,y,0,rr*2.4,[[0,rgba(c,locked?.25:.55)],[1,rgba(c,0)]]);g.beginPath();g.arc(x,y,rr*2.4,0,7);g.fill();
  g.fillStyle=GR(g,x,y,0,rr,[[0,'#fff'],[.6,rgba(c,1)],[1,rgba(c,0)]]);g.beginPath();g.arc(x,y,rr,0,7);g.fill();
 });g.restore();
}
function _mapTwinSuns(g,r,locked){
 g.save();g.globalCompositeOperation='lighter';
 [[-r*.28,-r*.25,r*.2,[255,180,70]],[r*.3,-r*.1,r*.14,[90,200,255]]].forEach(([x,y,rr,c])=>{
  g.fillStyle=GR(g,x,y,0,rr*2.2,[[0,rgba(c,locked?.2:.5)],[1,rgba(c,0)]]);g.beginPath();g.arc(x,y,rr*2.2,0,7);g.fill();
 });g.restore();
}
function _mapPrismCap(g,r,locked){
 g.save();g.globalCompositeOperation=locked?'source-over':'lighter';
 const a=locked?.4:.85;g.translate(0,-r*.05);
 g.fillStyle=GL(g,-10,-20,10,20,[[0,rgba([220,255,250],a)],[.4,rgba([80,240,220],a*.8)],[.8,rgba([255,120,230],a*.7)],[1,rgba([40,60,160],a)]]);
 poly(g,[0,-r*.55,r*.32,-r*.1,r*.18,r*.4,0,r*.55,-r*.18,r*.4,-r*.32,-r*.1]);g.fill();
 g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.stroke();
 g.restore();
}
function _mapHoleCap(g,r,locked){
 g.save();g.scale(1,.55);
 g.strokeStyle=rgba([255,200,120],locked?.3:.75);g.lineWidth=3;g.beginPath();g.arc(0,0,r*.95,0,7);g.stroke();
 g.restore();
 g.fillStyle=GR(g,0,0,r*.15,r*.45,[[0,'#000'],[.7,'#100018'],[1,'rgba(0,0,0,0)']]);
 g.beginPath();g.arc(0,0,r*.42,0,7);g.fill();
}
function _mapEmberSparks(g,r){
 g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<7;i++){const a=i/7*TAU+1.1,rr=r*(.55+((i*3)%5)*.06),x=Math.cos(a)*rr,y=Math.sin(a)*rr*.7;
  g.fillStyle=rgba([255,160,60],.55);g.beginPath();g.arc(x,y,1.6+(i%3),0,7);g.fill();}
 g.restore();
}

function mapBuildBase(ti,locked){
 const key=ti+'_'+(locked?1:0);if(MAPART._base[key])return MAPART._base[key];
 const SZ=112,c=mkC(SZ,SZ),g=c.getContext('2d');g.translate(SZ/2,SZ/2);
 const r=38,th=MAP_THEME[ti];
 _mapSoftShadow(g,r);
 if(!locked)_mapHalo(g,r,th.atm,.5);
 _mapPlanetBody(g,r,ti,locked);
 // soft specular already in planet; add glass highlight
 if(!locked){g.fillStyle=GR(g,-r*.35,-r*.45,0,r*.7,[[0,'rgba(255,255,255,.55)'],[.35,'rgba(255,255,255,.12)'],[1,'rgba(255,255,255,0)']]);
  g.beginPath();g.ellipse(-r*.18,-r*.28,r*.38,r*.22,-.5,0,7);g.fill();}
 return MAPART._base[key]={c,w:SZ,h:SZ,r};
}

function mapNodeURL(ti,tier,num,locked){
 const k=ti+':'+tier+':'+num+':'+(locked?1:0);
 if(MAPART._n[k])return MAPART._n[k];
 const base=mapBuildBase(ti,locked),SZ=base.w,c=mkC(SZ,SZ),g=c.getContext('2d');
 g.drawImage(base.c,0,0);g.translate(SZ/2,SZ/2);
 _mapRim(g,base.r+2,tier);
 if(locked){g.globalAlpha=.45;_mapPlate(g,base.r,num,true);g.globalAlpha=1;_mapLock(g,base.r);}
 else _mapPlate(g,base.r,num,false);
 return MAPART._n[k]=c.toDataURL('image/png');
}

function mapSpecialURL(locked){
 const k=locked?1:0;if(MAPART._sp[k])return MAPART._sp[k];
 const SZ=140,c=mkC(SZ,SZ),g=c.getContext('2d');g.translate(SZ/2,SZ/2);const r=48;
 _mapSoftShadow(g,r);
 if(!locked){_mapHalo(g,r,[255,200,80],.7);_mapHalo(g,r*.7,[255,120,220],.35);}
 // golden comet orb
 const p=planetSpr(r*.72,'gas',99,{ramp:[[0,[60,30,5]],[.35,[200,120,30]],[.65,[255,210,80]],[.85,[255,240,180]],[1,[255,255,255]]],atm:[255,200,80],spec:.55,rim:.8,pad:r*.2});
 g.drawImage(p.c,-p.w/2,-p.h/2,p.w,p.h);
 if(locked){g.fillStyle='rgba(8,6,20,.65)';g.beginPath();g.arc(0,0,r*.78,0,7);g.fill();}
 // comet tail
 if(!locked){g.save();g.globalCompositeOperation='lighter';g.rotate(-.7);
  g.fillStyle=GR(g,r*.2,0,0,r*1.6,[[0,'rgba(255,240,180,.85)'],[.4,'rgba(255,160,80,.35)'],[1,'rgba(255,80,200,0)']]);
  g.beginPath();g.moveTo(r*.1,-r*.18);g.quadraticCurveTo(r*.9,0,r*1.55,r*.05);g.quadraticCurveTo(r*.9,r*.12,r*.1,r*.18);g.closePath();g.fill();g.restore();}
 // sparkles
 if(!locked){g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<10;i++){const a=i/10*TAU+0.4,rr=r*(.7+(i%3)*.12),x=Math.cos(a)*rr,y=Math.sin(a)*rr;
   g.fillStyle='rgba(255,255,255,.85)';poly(g,[x,y-3.2,x+.9,y-.9,x+3.2,y,x+.9,y+.9,x,y+3.2,x-.9,y+.9,x-3.2,y,x-.9,y-.9]);g.fill();}
  g.restore();}
 // gold rim
 _mapRim(g,r+2,3);
 if(locked)_mapLock(g,r);else{
  // treasure star plate
  g.fillStyle=GR(g,-10,-10,0,22,[[0,'#fff6c0'],[.5,'#ffc83a'],[1,'#8a4a00']]);
  g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,rr=i%2?9:18;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+2);}g.closePath();g.fill();
  g.strokeStyle='#5a3000';g.lineWidth=1.6;g.stroke();
  g.fillStyle='#fff';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,rr=i%2?4:9;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+2);}g.closePath();g.fill();
 }
 return MAPART._sp[k]=c.toDataURL('image/png');
}

function mapStarURL(on){
 if(on&&MAPART._star)return MAPART._star;if(!on&&MAPART._starOff)return MAPART._starOff;
 const SZ=28,c=mkC(SZ,SZ),g=c.getContext('2d');g.translate(SZ/2,SZ/2);
 if(on){g.fillStyle=GR(g,-2,-3,0,12,[[0,'#ffffff'],[.4,'#ffe14a'],[1,'#c08000']]);
  g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,r=i%2?4.2:11;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
  g.strokeStyle='#5a3a00';g.lineWidth=1;g.stroke();
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-2,-3,2.2,1.2,-.6,0,7);g.fill();
  MAPART._star=c.toDataURL('image/png');return MAPART._star;}
 g.fillStyle='#2a2840';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,r=i%2?4:10;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
 g.strokeStyle='#0a0818';g.lineWidth=1;g.stroke();
 MAPART._starOff=c.toDataURL('image/png');return MAPART._starOff;
}

function mapRocketURL(){
 if(MAPART._rk)return MAPART._rk;
 const SZ=36,c=mkC(SZ,SZ),g=c.getContext('2d');g.translate(SZ/2,SZ/2+2);g.rotate(-.15);
 // tiny original rocket
 g.fillStyle=GL(g,-6,0,6,0,[[0,'#3a6aff'],[.5,'#c8e0ff'],[1,'#2a4ab0']]);
 poly(g,[0,-14,7,-2,5,10,-5,10,-7,-2]);g.fill();g.strokeStyle='#0a1430';g.lineWidth=1;g.stroke();
 g.fillStyle='#ff6a3a';poly(g,[-5,8,-8,14,-2,10]);g.fill();poly(g,[5,8,8,14,2,10]);g.fill();
 g.fillStyle=GR(g,0,10,0,10,[[0,'#fff'],[.4,'#ffd23a'],[1,'rgba(255,80,0,0)']]);
 g.beginPath();g.moveTo(-3,10);g.lineTo(0,22);g.lineTo(3,10);g.closePath();g.fill();
 g.fillStyle='#7ae8ff';g.beginPath();g.arc(0,-4,2.4,0,7);g.fill();
 MAPART._rk=c.toDataURL('image/png');return MAPART._rk;
}

function mapGlowURL(ti){
 if(MAPART._glow[ti])return MAPART._glow[ti];
 const SZ=128,c=mkC(SZ,SZ),g=c.getContext('2d');g.translate(SZ/2,SZ/2);
 const rgb=MAP_THEME[ti].atm;
 g.fillStyle=GR(g,0,0,28,60,[[0,rgba(rgb,.0)],[.3,rgba(rgb,.35)],[.7,rgba(rgb,.12)],[1,rgba(rgb,0)]]);
 g.beginPath();g.arc(0,0,60,0,7);g.fill();
 MAPART._glow[ti]=c.toDataURL('image/png');return MAPART._glow[ti];
}

function buildMapArt(){
 // warm the 10 theme bases (unlocked) so first map open is snappy; locked/tiers/numbers cache on demand
 for(let i=0;i<10;i++)mapBuildBase(i,false);
 mapSpecialURL(false);mapStarURL(true);mapStarURL(false);mapRocketURL();
 MAPART.ready=1;
}
const _baMap=buildArt;buildArt=function(){_baMap();buildMapArt();};
