// Starzoomer boss-v3 ALIEN PREVIEW — procedural three.js bio-organisms (preview only; live game untouched).
// Same B3D API / hitbox sizes / weak-point core as v29; richer silhouettes, bevelled plates, emissive trim.
'use strict';
const B3D={tried:false,ok:false,off:Q.get('b3d')==='0',r:null,cv:null,scene:null,cam:null,cache:{},order:[],cur:-1,glowTex:null,
 stat:{n:0,acc:0,slow:0,ms:0,frames:0},why:'',rs:1,offNext:'',lastB:null,_geo:{},
 init(){if(this.tried)return this.ok;this.tried=true;
  try{if(!window.THREE)throw new Error('three.js missing');const cv=document.createElement('canvas');cv.width=cv.height=8;
   const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'default',preserveDrawingBuffer:false});
   r.setClearColor(0x000000,0);r.setPixelRatio(1);this.r=r;this.cv=cv;
   cv.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail('context lost');},false);
   const S=this.scene=new THREE.Scene();this.cam=new THREE.OrthographicCamera(-100,100,100,-100,-2000,2000);this.cam.position.set(0,0,600);this.cam.lookAt(0,0,0);
   S.add(new THREE.HemisphereLight(0xc0c8ff,0x201030,1.05));
   const key=new THREE.DirectionalLight(0xfff4ea,1.5);key.position.set(-.55,.85,1.05);S.add(key);
   this.rim=new THREE.DirectionalLight(0xff8a2a,2.0);this.rim.position.set(.25,1.1,-.6);S.add(this.rim);
   this.fill=new THREE.DirectionalLight(0x7ab8ff,1.05);this.fill.position.set(.85,-.55,.55);S.add(this.fill);
   this.pt=new THREE.PointLight(0xffffff,0,0,0);S.add(this.pt);
   const gc=document.createElement('canvas');gc.width=gc.height=64;const g=gc.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
   this.glowTex=new THREE.CanvasTexture(gc);this._q=new THREE.Quaternion();this._qi=new THREE.Quaternion();this._z=new THREE.Vector3(0,0,1);this.ok=true;LOG('boss3d: WebGL ready, three r'+THREE.REVISION+' (boss-v3 alien preview)');}
  catch(e){this.ok=false;this.why=String(e&&e.message||e);LOG('boss3d: fallback to 2D ('+this.why+')');}
  return this.ok;},
 fail(why){if(!this.ok&&this.tried)return;this.ok=false;this.tried=true;this.why=why;try{const d=document.createElement('div');d.textContent='3D->2D: '+why;d.style.cssText='position:fixed;left:0;right:0;bottom:60px;z-index:99999;background:#c00;color:#fff;font:12px monospace;padding:4px;text-align:center;pointer-events:none';document.body.appendChild(d);setTimeout(()=>d.remove(),10000);}catch(e){}LOG('boss3d: disabled -> 2D art ('+why+')');ART.turSpr&&Object.keys(this.realTur).forEach(k=>ART.turSpr[k]=this.realTur[k]);},
 realTur:{},
 active(){const keep=G.boss&&this.lastB===G.boss&&this.cur>=0;return !this.off&&(QUAL>0||keep)&&(this.tried?this.ok:this.init());},
 // ---------- material / mesh helpers ----------
 mat(c,o){return new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0x8899aa,shininess:72,flatShading:false,emissive:0x000000,emissiveIntensity:0},o||{}));},
 flat(c,o){return this.mat(c,Object.assign({flatShading:true,shininess:36,specular:0x556677},o||{}));},
 emi(c,o){return new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));},
 trim(c,i){return new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:i===undefined?.55:i,specular:0xffffff,shininess:110,flatShading:false});},
 glow(c,s,x,y,z,a){const m=new THREE.SpriteMaterial({map:this.glowTex,color:c,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,transparent:true,opacity:a===undefined?.9:a,toneMapped:false});const sp=new THREE.Sprite(m);sp.scale.set(s,s,1);sp.position.set(x,y,z);sp.renderOrder=5;return sp;},
 mesh(geo,mat,p,r,s){const m=new THREE.Mesh(geo,mat);if(p)m.position.set(p[0],p[1],p[2]||0);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s)m.scale.set(s[0],s[1]===undefined?s[0]:s[1],s[2]===undefined?s[0]:s[2]);return m;},
 ext(pts,depth,bev){const sh=new THREE.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
  const b=bev||0,g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:b>0?2:0,curveSegments:8});g.translate(0,0,-depth/2);return g;},
 lathe(profile,seg){const pts=profile.map(p=>new THREE.Vector2(p[0],p[1]));return new THREE.LatheGeometry(pts,seg||16);},
 rnd(seed){let s=seed*7919+13;return()=>{s=(s*16807)%2147483647;return s/2147483647;};},
 hex(c){return new THREE.Color(c).getHex();},
 // soft panel stripe texture (generated once)
 panelTex(cols){const key='pt'+cols.join(',');if(this._geo[key])return this._geo[key];
  const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');
  g.fillStyle='#'+cols[0].toString(16).padStart(6,'0');g.fillRect(0,0,64,64);
  g.fillStyle='#'+(cols[1]||0x222233).toString(16).padStart(6,'0');
  for(let i=0;i<8;i++){g.globalAlpha=.18+((i%2)*.08);g.fillRect(0,i*8,64,3);}
  g.globalAlpha=.35;g.strokeStyle='#ffffff';g.lineWidth=1;g.strokeRect(2,2,60,60);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;return this._geo[key]=t;},
 // ---------- v3 organic helpers ----------
 G(k,f){return this._gc[k]||(this._gc[k]=f());},
 S(){return this.G('S',()=>new THREE.SphereGeometry(1,16,10));},
 Ss(){return this.G('Ss',()=>new THREE.SphereGeometry(1,10,7));},
 C(){return this.G('C',()=>{const g=new THREE.ConeGeometry(1,1,7);g.translate(0,.5,0);return g;});},
 V(x,y,z){return new THREE.Vector3(x,y,z||0);},
 // tapered tube along a CatmullRom curve (r0 at start -> r1 at end)
 tent(pts,r0,r1,seg,rad){seg=seg||14;rad=rad||7;const c=new THREE.CatmullRomCurve3(pts.map(p=>this.V(p[0],p[1],p[2])));const g=new THREE.TubeGeometry(c,seg,1,rad,false),P=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const cp=c.getPointAt(i/seg),r=r0+(r1-r0)*Math.pow(i/seg,.9);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.fromBufferAttribute(P,k).sub(cp).multiplyScalar(r).add(cp);P.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();return g;},
 skin(c,o){return new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0xffffff,shininess:95},o||{}));},
 memb(c,op,e){return new THREE.MeshPhongMaterial({color:c,transparent:true,opacity:op||.45,side:THREE.DoubleSide,depthWrite:false,shininess:120,specular:0xffffff,emissive:e||c,emissiveIntensity:.25});},
 // surface z of an ellipsoid centred (cx,cy,cz) with radii (a,b,c)
 ez(x,y,e){const u=(x-e[0])/e[3],w=(y-e[1])/e[4],q=1-u*u-w*w;return e[2]+e[5]*Math.sqrt(Math.max(0,q));},
 // glowing alien eye: lit iris + slit pupil + glint; returns iris material for pulsing
 eye(M,add,x,y,z,r,c,arr,slit){const T=this,im=T.G('eye'+c,()=>new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.55,shininess:160,specular:0xffffff}));
  add(T.mesh(T.Ss(),T.G('sock',()=>T.skin(0x120814,{shininess:40})),[x,y,z-r*.25],null,[r*1.25,r*1.15,r*.7]),arr);
  add(T.mesh(T.S(),im,[x,y,z],null,[r,r,r*.8]),arr);
  add(T.mesh(T.Ss(),T.G('pup',()=>new THREE.MeshBasicMaterial({color:0x080210})),[x,y,z+r*.62],null,slit===0?[r*.42,r*.42,r*.3]:[r*.2,r*.78,r*.3]),arr);
  add(T.mesh(T.Ss(),T.G('glint',()=>new THREE.MeshBasicMaterial({color:0xffffff})),[x-r*.32,y+r*.36,z+r*.78],null,[r*.17,r*.17,r*.1]),arr);
  if(!M._eyes){M._eyes=new Set();M.anim.push((t,ph,tel)=>{M._eyes.forEach(m=>m.emissiveIntensity=.45+.25*Math.sin(t*3+m.id)+tel*.35);});}M._eyes.add(im);return im;},
 // cone spike from p pointing to angle a (rad, 0 = +y) with tilt toward camera tz
 spike(add,mat,p,len,r,a,tz,arr){return add(this.mesh(this.C(),mat,p,[tz||0,0,a],[r,len,r]),arr);},
 // fang row: n cones between x0..x1 at y pointing dir (+1 up, -1 down)
 fangs(add,mat,x0,x1,y,z,n,len,r,dir,arr){for(let k=0;k<n;k++){const u=n>1?k/(n-1):.5,x=x0+(x1-x0)*u,l=len*(.65+.35*Math.sin(u*Math.PI));this.spike(add,mat,[x,y,z],l,r,dir>0?0:Math.PI,0,arr);}},
 // pulsing glow pustule
 pust(M,add,x,y,z,r,c,arr){const T=this,m=T.G('pu'+c,()=>new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.6,shininess:150,specular:0xffffff,transparent:true,opacity:.92}));
  const o=add(T.mesh(T.Ss(),m,[x,y,z],null,[r,r,r]),arr);const ph=x*.07+y*.05;M.anim.push(t=>{const s=r*(1+.13*Math.sin(t*3.2+ph));o.scale.set(s,s,s);});return o;},
 // sway a group around its origin
 sway(M,g,sp,ax,az,ph){M.anim.push(t=>{g.rotation.z=Math.sin(t*sp+ph)*az;g.rotation.x=Math.sin(t*sp*.8+ph+1)*ax;});},
 crackTex(seed){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),R=this.rnd(seed);g.fillStyle='#000';g.fillRect(0,0,128,128);g.strokeStyle='#fff';g.lineCap='round';
  for(let k=0;k<26;k++){let x=R()*128,y=R()*128;g.lineWidth=1+R()*2.5;g.globalAlpha=.5+R()*.5;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=(R()-.5)*34;y+=(R()-.5)*34;g.lineTo(x,y);}g.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;},
 // ---------- boss model assembly ----------
 build(i){if(this.cache[i])return this.cache[i];if(!this.init())return null;const D=BOSS_DEF[i],hw=D[1]/2,hh=D[2]/2,a1=this.hex(D[3]),a2=this.hex(D[4]);
  const M={i,g:new THREE.Group(),body:new THREE.Group(),hull:[],ar1:[],ar2:[],emit:[],anim:[],front:34,hw,hh,a1,a2,tur:[]};M.g.add(M.body);
  const T=this,add=(o,arr)=>{M.body.add(o);if(arr)arr.push(o);return o;};
  const hullM=(c,o)=>{const m=T.mat(c,o);m.specular.multiplyScalar(.6);M.hull.push(m);return m;};
  const em=(c,x,y,z,s)=>{const sp=T.glow(c,s||26,x,y,z,.0);M.body.add(sp);M.emit.push(sp);return sp;};
  T._gc={};T.DES[i].call(T,M,hw,hh,a1,a2,add,hullM,em);
  // weak-point core (same place as the 2D core: hh*.25 below centre)
  const cy=-hh*.25,cz=M.front+6,cr=i===9?15:12;
  const coreM=new THREE.MeshPhongMaterial({color:0xffffff,emissive:a2,emissiveIntensity:.95,shininess:140,specular:0xffffff});
  M.core=T.mesh(new THREE.SphereGeometry(cr,20,14),coreM,[0,cy,cz]);M.coreM=coreM;M.g.add(M.core);
  M.ring=T.mesh(new THREE.TorusGeometry(cr+5,1.6,6,28,Math.PI*1.6),T.emi(0xffffff),[0,cy,cz+2]);M.g.add(M.ring);
  M.pupil=T.mesh(new THREE.SphereGeometry(cr*.4,12,8),new THREE.MeshBasicMaterial({color:0x14061e}),[0,cy,cz+cr*.75]);M.g.add(M.pupil);
  M.halo=T.glow(a2,cr*5,0,cy,cz+4,.75);M.g.add(M.halo);
  // turret meshes
  const tb=new THREE.CylinderGeometry(9,11,8,10),tbar=new THREE.BoxGeometry(4,14,4);tbar.translate(0,9,0);
  for(let k=0;k<5;k++){const tg=new THREE.Group(),tm=T.mat(0x5a5f7a,{emissive:0x000000}),bm=T.mat(a1,{emissive:0x000000});
   const base=T.mesh(tb,tm,[0,0,0],[Math.PI/2,0,0]);const bar=T.mesh(tbar,bm);bar.position.z=4;const lt=T.glow(a1,14,0,0,8,.8);tg.add(base,bar,lt);tg.bar=bar;tg.tm=tm;tg.bm=bm;tg.visible=false;
   tg.renderOrder=4;base.renderOrder=4;bar.renderOrder=4;M.g.add(tg);M.tur.push(tg);}
  M.g.traverse(o=>{if(o.isMesh)o.matrixAutoUpdate=true;});
  this.cache[i]=M;this.order.push(i);this.trim(i);return M;},
 trim(keep){while(this.order.length>3){const k=this.order.find(x=>x!==keep&&x!==this.cur);if(k===undefined)break;this.dispose(k);}},
 dispose(i){const M=this.cache[i];if(!M)return;if(M.g.parent)M.g.parent.remove(M.g);const seen=new Set();
  M.g.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(!seen.has(m)){seen.add(m);m.dispose();}});}});
  delete this.cache[i];this.order=this.order.filter(x=>x!==i);},
 disposeAll(){Object.keys(this.cache).forEach(k=>this.dispose(+k));},
 draw(g,i,o){if(!this.active())return false;const B=G.boss;if(B!==this.lastB){this.lastB=B;if(this.offNext){this.fail(this.offNext);return false;}}let M;try{M=this.build(i);}catch(e){this.fail('build '+e.message);return false;}if(!M)return false;
  const t0=performance.now();
  try{if(this.cur!==i){if(this.cur>=0&&this.cache[this.cur])this.scene.remove(this.cache[this.cur].g);this.scene.add(M.g);this.cur=i;
    if(!this.realTur[i]){this.realTur[i]=ART.turSpr[i]||(ART.turSpr[i]=turretSpr(BOSS_DEF[i][3]));}
    ART.turSpr[i]=this.blank||(this.blank=mk(2,2,()=>{},1));}
   // Extra padding so swept wings / jaws / crowns aren't clipped at the canvas edge
   const pad=110,W=M.hw*2+pad*2,H=M.hh*2+pad*2,k=Math.min(DPR*SC,QUAL>=2?1.5:1.1,560/W)*this.rs,pw=Math.max(16,Math.round(W*k)),ph=Math.max(16,Math.round(H*k));
   if(this.cv.width!==pw||this.cv.height!==ph){this.r.setSize(pw,ph,false);}
   const c=this.cam;if(c.right!==W/2||c.top!==H/2){c.left=-W/2;c.right=W/2;c.top=H/2;c.bottom=-H/2;c.updateProjectionMatrix();}
   this.pose(M,B,o);this.r.render(this.scene,c);
   g.drawImage(this.cv,-W/2,-H/2,W,H);}
  catch(e){this.fail('render '+e.message);return false;}
  const ms=performance.now()-t0,S=this.stat;S.ms=S.ms*.95+ms*.05;S.frames++;S.acc+=ms;S.n++;
  if(S.n>=90){const av=S.acc/S.n;S.acc=0;S.n=0;if(av>9){S.slow++;if(S.slow>=2){if(this.rs>.55){this.rs=Math.max(.5,this.rs*.8);S.slow=0;this.cv.width=this.cv.height=8;}else if(S.slow>=4)this.offNext='too slow ('+av.toFixed(1)+' ms/frame)';}}else S.slow=0;}
  return true;},
 pose(M,B,o){const t=o.t,ph=o.ph||0,fl=o.fl>0,dead=o.dead||0,cur=B&&B.cur,beam=B&&B.beam;
  const vx=B?Math.cos((B.t-3)*.45)*.45*GW*.16:0;
  M.g.rotation.set(-.42+Math.sin(t*.7)*.07,Math.sin(t*.45)*.22+clamp(vx/90,-.25,.25),Math.sin(t*.9)*.035-clamp(vx/260,-.08,.08));
  if(dead){M.g.rotation.z+=dead*dead*.05;M.g.rotation.y+=dead*.4;M.g.position.set(rnd(-1,1)*dead*2,rnd(-1,1)*dead*2,0);}else M.g.position.set(0,0,0);
  M.ar1.forEach(m=>m.visible=ph<1);M.ar2.forEach(m=>m.visible=ph<2);
  const hot=ph>=2?.18+.14*Math.sin(t*6):ph>=1?.06:0,wf=dead?Math.min(1,dead/2.8)*(.6+.4*Math.sin(dead*30)):0;
  for(const m of M.hull){if(fl||wf>.05){if(fl)m.emissive.setHex(M.a1).lerp(B3D._w||(B3D._w=new THREE.Color(1,1,1)),.5);else m.emissive.setRGB(1,.9,.8);m.emissiveIntensity=fl?.16:wf*.7;}else if(hot){m.emissive.setRGB(1,.25,.12);m.emissiveIntensity=hot;}else m.emissiveIntensity=0;}
  let tel=0;if(B&&!dead){if(B.pt<.8)tel=1-B.pt/.8;if(cur&&cur.t<.5)tel=Math.max(tel,1-cur.t/.5);if(beam&&beam.t<1.6)tel=Math.max(tel,.4+beam.t/1.6*.6);}
  const pulse=.5+.5*Math.sin(t*(10+tel*20));M.emit.forEach((e,k)=>{e.material.opacity=Math.min(1,.25+tel*.75*(.6+.4*pulse)+(ph?.1:0));const s=e.userData.s||(e.userData.s=e.scale.x);const z=s*(1+tel*.9);e.scale.set(z,z,1);});
  const cc=[M.a2,0xffa030,0xff3a4a][ph]||M.a2,pu=.85+.15*Math.sin(t*(4+ph*3));M.coreM.emissive.setHex(cc);M.coreM.emissiveIntensity=.8+tel*.6;M.core.scale.setScalar(pu);
  M.halo.material.color.setHex(cc);const hs=M.halo.userData.s||(M.halo.userData.s=M.halo.scale.x);M.halo.scale.set(hs*pu*(1+tel*.5),hs*pu*(1+tel*.5),1);
  M.ring.rotation.z=t*1.5;const la=o.la||Math.PI/2,cr=M.core.geometry.parameters.radius;M.pupil.position.x=Math.cos(la)*cr*.35;M.pupil.position.y=-M.hh*.25-Math.sin(la)*cr*.35;
  this.rim.color.setHex(M.a1);this.pt.color.setHex(cc);this.pt.intensity=(.4+tel*1.2)*.8;this.pt.position.set(0,-M.hh*.25,M.front+60);
  for(const a of M.anim)a(t,ph,tel);
  const tur=B?B.tur:[];M.tur.forEach((tg,k)=>{const d=tur[k];if(!d||!d.alive||dead){tg.visible=false;return;}tg.visible=true;tg.position.set(d.ox,-d.oy,M.front+14);B3D._q.setFromAxisAngle(B3D._z,-(d.ang)-Math.PI/2);
   const f=d.fl>0;tg.tm.emissive.setRGB(f?1:0,f?1:0,f?1:0);tg.bm.emissive.setHex(f?0xffffff:0x000000);tg.bm.emissiveIntensity=f?.8:0;
   const qi=B3D._qi.copy(M.g.quaternion).invert();tg.position.applyQuaternion(qi);tg.quaternion.copy(qi).multiply(B3D._q);});},
 info(){return{ok:this.ok,tried:this.tried,why:this.why,active:this.active(),ms:+this.stat.ms.toFixed(2),models:Object.keys(this.cache).map(Number),cur:this.cur,res:this.cv?[this.cv.width,this.cv.height]:null};}};

// ---------- the 10 ALIEN bosses (x right, y up, z towards camera; faces player = -y) ----------
B3D.DES=[
 // 0 Gloomjaw — armoured anglerfish brood-carrier: ribbed carapace, crab-claw jaws, fang maw, glowing lure, cyan egg sacs
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),sh=H(0x2c4a5a,{shininess:110,specular:0xbfe8ff}),sh2=H(0x3f6a72,{shininess:120,specular:0xffffff}),fl=H(0x6a2a3a,{shininess:70}),dk=H(0x12060c,{shininess:30}),
  tooth=T.G('tooth',()=>T.skin(0xfff0d8,{shininess:140})),claw=H(0xc0581e,{shininess:120,specular:0xffd0a0}),egg=T.memb(a2,.55),egc=T.trim(a2,.7);
  const E=[0,hh*.12,0,hw*.62,hh*.62,30];add(T.mesh(S,sh,[E[0],E[1],E[2]],null,[E[3],E[4],E[5]]));
  for(let k=0;k<4;k++){const y=hh*(.62-k*.16);add(T.mesh(S,k%2?sh:sh2,[0,y,T.ez(0,y,E)-10],[-.3,0,0],[hw*(.36+k*.05),hh*.13,14]),k===0?M.ar1:null);}
  for(let k=0;k<7;k++){const a=(k-3)*.32;T.spike(add,sh2,[Math.sin(a)*hw*.5,hh*.12+Math.cos(a)*hh*.56,6],22-Math.abs(k-3)*3,4.5,-a,-.3,k%3===0?M.ar1:null);}
  add(T.mesh(S,fl,[0,-hh*.36,16],null,[hw*.4,hh*.32,20]));
  add(T.mesh(S,dk,[0,-hh*.28,28],null,[hw*.34,hh*.22,8]));
  T.fangs(add,tooth,-hw*.3,hw*.3,-hh*.1,36,9,18,3.6,-1);T.fangs(add,tooth,-hw*.26,hw*.26,-hh*.46,36,8,15,3.3,1);
  [-1,1].forEach(s=>{
   const cl=T.tent([[s*hw*.3,-hh*.18,12],[s*hw*.7,-hh*.25,14],[s*hw*.78,-hh*.7,18],[s*hw*.42,-hh*1.08,22]],11,2.5,16,8);add(T.mesh(cl,claw),M.ar1);
   const c2=T.tent([[s*hw*.32,-hh*.4,14],[s*hw*.5,-hh*.62,16],[s*hw*.3,-hh*.86,20]],6,1.6,10,6);add(T.mesh(c2,claw),M.ar1);
   for(let k=0;k<3;k++)T.spike(add,sh2,[s*hw*(.72+k*.02),-hh*(.3+k*.18),18],12,3,-s*(1.6+k*.3),0,M.ar1);
   for(let k=0;k<3;k++){const x=s*hw*(.58+k*.12),y=hh*(.34-k*.2);add(T.mesh(S,egg,[x,y,6],null,[16-k*2,15-k*2,14]),M.ar2);T.pust(M,add,x,y,8,7-k,a2,M.ar2);}
   for(let k=0;k<3;k++){const x=s*hw*(.13+k*.13),y=hh*(.14+k*.07);T.eye(M,add,x,y,T.ez(x,y,E)+1,6.5-k*1.4,a1);}
   em(a1,s*hw*.45,-hh*1.0,24,32);
  });
  const lure=new THREE.Group();lure.position.set(0,hh*.62,14);add(lure);
  lure.add(T.mesh(T.tent([[0,0,0],[0,hh*.45,8],[0,hh*.62,30],[0,hh*.42,48]],3.4,1.6,14,6),fl));
  const lo=T.mesh(T.S(),T.trim(a2,.75),[0,hh*.42,48],null,[8,8,8]);lure.add(lo);lure.add(T.glow(a2,34,0,hh*.42,50,.55));
  T.sway(M,lure,1.4,.12,.18,0);
  em(a2,0,-hh*.28,36,36);M.front=34;},

 // 1 Rockmaw — rock-shelled burrowing maw worm: concentric rock rings, double ring of fangs, lava gullet, feelers
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),R=T.rnd(21),rock=H(0x6a5444,{shininess:14,specular:0x332222,flatShading:true}),rock2=H(0x4a3a32,{shininess:10,flatShading:true}),
  fl=H(0x8a2a2a,{shininess:80}),dk=T.G('dk',()=>new THREE.MeshBasicMaterial({color:0x1a0404})),tooth=T.G('tooth',()=>T.skin(0xfff0d8,{shininess:140})),lava=T.trim(a1,.8),gold=T.trim(a2,.6);
  const cy=-hh*.12,sy=.92;
  add(T.mesh(S,fl,[0,cy+hh*.08,-6],null,[hw*.74,hh*.82,26]));
  const rg=T.G('rg',()=>{const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position,Rr=T.rnd(5);for(let k=0;k<p.count;k++){p.setXYZ(k,p.getX(k)*(.8+Rr()*.35),p.getY(k)*(.8+Rr()*.35),p.getZ(k)*(.8+Rr()*.3));}g.computeVertexNormals();return g;});
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2,r=hh*.72;add(T.mesh(rg,k%2?rock:rock2,[Math.cos(a)*r*1.45,cy+Math.sin(a)*r*sy,10],[R(),R(),a],[hh*.34,hh*.24,16]),k%3===1?M.ar1:null);}
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2+.4,r=hh*1.02;add(T.mesh(rg,rock2,[Math.cos(a)*r*1.38,cy+hh*.08+Math.sin(a)*r*.8,-4],[R(),R(),a],[hh*.26,hh*.2,14]),M.ar2);}
  add(T.mesh(new THREE.TorusGeometry(hh*.52,6,8,28),fl,[0,cy,22],null,[1.3,sy,1]));
  add(T.mesh(S,dk,[0,cy,16],null,[hh*.62,hh*.46,6]));
  add(T.mesh(new THREE.TorusGeometry(hh*.3,3.5,6,24),lava,[0,cy,20],null,[1.3,sy,1]));
  add(T.glow(a1,hh*.9,0,cy,18,.35));
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=hh*.5;T.spike(add,tooth,[Math.cos(a)*r*1.3,cy+Math.sin(a)*r*sy,28],15,3.6,a+Math.PI/2,.35);}
  for(let k=0;k<11;k++){const a=k/11*Math.PI*2+.2,r=hh*.36;T.spike(add,tooth,[Math.cos(a)*r*1.3,cy+Math.sin(a)*r*sy,24],10,2.6,a+Math.PI/2,.5);}
  [-1,1].forEach(s=>{
   for(let j=0;j<2;j++){const g=new THREE.Group();g.position.set(s*hw*.66,cy+hh*(j?-.3:.35),8);add(g,j?M.ar2:null);
    g.add(T.mesh(T.tent([[0,0,0],[s*hw*.18,hh*(j?-.18:.12),6],[s*hw*.3,hh*(j?-.5:.32),10]],5,1.2,12,6),fl));
    g.add(T.mesh(T.Ss(),gold,[s*hw*.3,hh*(j?-.5:.32),10],null,[3.5,3.5,3.5]));T.sway(M,g,1.8,.2,.25,j+s);}
   for(let k=0;k<2;k++)T.eye(M,add,s*hw*(.28+k*.16),cy+hh*(.62-k*.08),24,5-k,a2);
   em(a1,s*hw*.4,cy-hh*.2,30,26);
  });
  em(a1,0,cy,30,56);M.front=34;},

 // 2 Frostback — ice-crystal scorpion queen: segmented body, arched stinger tail, crystal pincers, spined back
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),ch=H(0x2a5a8a,{shininess:140,specular:0xffffff}),ch2=H(0x4a8ac0,{shininess:150,specular:0xffffff}),dk=H(0x10203a,{shininess:60}),
  ice=new THREE.MeshPhongMaterial({color:0xbff4ff,transparent:true,opacity:.78,shininess:200,specular:0xffffff,emissive:a1,emissiveIntensity:.22,flatShading:true}),tooth=T.G('tooth',()=>T.skin(0xf0fbff,{shininess:160}));
  const crys=T.G('oct',()=>new THREE.OctahedronGeometry(1,0));
  for(let k=0;k<4;k++)add(T.mesh(S,k%2?ch:ch2,[0,hh*(.36-k*.2),8+k*4],null,[hw*(.34-k*.035),hh*.17,22]));
  add(T.mesh(S,ch2,[0,-hh*.42,22],null,[hw*.26,hh*.2,16]));
  for(let k=0;k<5;k++)T.spike(add,ice,[(k-2)*hw*.12,hh*(.45-Math.abs(k-2)*.06),22],24-Math.abs(k-2)*5,5,-(k-2)*.2,-.5,k%2?M.ar1:null);
  const tail=new THREE.Group();tail.position.set(0,hh*.5,0);add(tail);
  const tp=[[0,0,0],[0,hh*.42,-6],[0,hh*.78,10],[0,hh*.72,38],[0,hh*.36,52]];
  tail.add(T.mesh(T.tent(tp,13,5,18,8),ch));
  for(let k=1;k<5;k++){const c=new THREE.CatmullRomCurve3(tp.map(p=>T.V(...p))).getPointAt(k/5);tail.add(T.mesh(S,ch2,[c.x,c.y,c.z],null,[12-k*1.4,8,11-k]));}
  tail.add(T.mesh(T.C(),ice,[0,hh*.36,52],[0,0,Math.PI],[6,22,6]));tail.add(T.glow(a1,26,0,hh*.2,56,.5));
  T.sway(M,tail,1.1,.08,.1,0);
  [-1,1].forEach(s=>{
   add(T.mesh(T.tent([[s*hw*.22,-hh*.3,18],[s*hw*.55,-hh*.25,16],[s*hw*.72,-hh*.6,20]],8,6,12,7),ch),M.ar2);
   const cg=new THREE.Group();cg.position.set(s*hw*.72,-hh*.62,20);add(cg,M.ar2);
   cg.add(T.mesh(S,ch2,[0,0,0],null,[17,14,12]));
   cg.add(T.mesh(crys,ice,[s*-6,-20,2],[0,0,s*.25],[6,20,6]));cg.add(T.mesh(crys,ice,[s*8,-18,2],[0,0,-s*.2],[5,17,5]));
   M.anim.push(t=>{cg.rotation.z=s*Math.sin(t*2.2)*.12;});
   for(let k=0;k<4;k++){const y=hh*(.25-k*.17);add(T.mesh(T.tent([[s*hw*.25,y,6],[s*hw*(.62+k*.05),y+hh*.18,2],[s*hw*(.86+k*.04),y-hh*.2,0]],3.6,1.3,10,5),dk));}
   for(let k=0;k<3;k++)add(T.mesh(crys,ice,[s*hw*(.4+k*.14),hh*(.32+k*.14),2],[.3,0,-s*(.8+k*.2)],[5,16+k*3,5]),k===2?M.ar1:null);
   T.eye(M,add,s*hw*.1,-hh*.32,36,5,a1);T.eye(M,add,s*hw*.2,-hh*.26,32,3.5,a1,null,0);
   em(a1,s*hw*.72,-hh*.9,24,30);
  });
  T.fangs(add,tooth,-hw*.1,hw*.1,-hh*.56,32,4,9,2.4,-1);
  em(a2,0,hh*.25,58,30);M.front=34;},

 // 3 Twinflare — twin-headed fire-eyed hydra symbiote: shared bulbous body, two serpent necks with fanged heads
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),sk=H(0x4a1a48,{shininess:90,specular:0xffc0e0}),sk2=H(0x7a2a3a,{shininess:100}),bel=H(0x9a5a34,{shininess:70}),dk=T.G('dk',()=>new THREE.MeshBasicMaterial({color:0x1a0404})),
  tooth=T.G('tooth',()=>T.skin(0xfff0d8,{shininess:140})),crest=T.trim(a1,.45),memb=T.memb(a2,.4);
  add(T.mesh(S,sk,[0,hh*.18,0],null,[hw*.42,hh*.52,28]));
  add(T.mesh(S,bel,[0,hh*.0,16],null,[hw*.22,hh*.36,16]));
  for(let k=0;k<4;k++)add(T.mesh(new THREE.TorusGeometry(hw*.2,2.2,5,18,Math.PI),sk2,[0,hh*(.3-k*.14),20],[0,0,Math.PI],[1,.5,1]));
  for(let k=0;k<6;k++){const a=(k-2.5)*.3;T.spike(add,crest,[Math.sin(a)*hw*.3,hh*.18+Math.cos(a)*hh*.48,4],18,4,-a,-.4,M.ar1);}
  for(let k=0;k<5;k++)T.pust(M,add,(k-2)*hw*.1,hh*(.48-Math.abs(k-2)*.05),18,4.2,a2);
  [-1,1].forEach(s=>{
   const neck=[[s*hw*.2,hh*.3,6],[s*hw*.55,hh*.45,6],[s*hw*.7,hh*.1,14],[s*hw*.6,-hh*.25,22]];
   add(T.mesh(T.tent(neck,14,10,16,8),sk));
   const hd=new THREE.Group();hd.position.set(s*hw*.6,-hh*.32,24);add(hd);
   hd.add(T.mesh(S,sk2,[0,4,0],null,[22,24,16]));
   hd.add(T.mesh(S,sk,[0,-10,2],null,[16,14,12]));
   hd.add(T.mesh(S,dk,[0,-16,10],null,[11,7,4]));
   for(let k=0;k<4;k++){hd.add(T.mesh(T.C(),tooth,[(k-1.5)*5,-11,13],[0,0,Math.PI],[1.8,8,1.8]));hd.add(T.mesh(T.C(),tooth,[(k-1.5)*4.4,-22,12],[0,0,0],[1.6,6,1.6]));}
   for(let k=0;k<3;k++)hd.add(T.mesh(T.C(),crest,[(k-1)*9,22,-2],[-.5,0,-(k-1)*.45],[3.5,16-Math.abs(k-1)*4,3.5]));
   const fin=T.mesh(T.Ss(),memb,[s*20,6,-2],[0,0,s*.4],[10,22,2]);hd.add(fin);M.ar2.push(fin);
   const add2=(o,a)=>{hd.add(o);if(a)a.push(o);return o;};
   [-1,1].forEach(q=>T.eye(M,(o)=>add2(o),q*9,6,14,5.5,a1));T.eye(M,o=>add2(o),0,16,12,3.4,a2,null,0);
   M.anim.push(t=>{hd.rotation.z=s*Math.sin(t*1.7+s)*.12;hd.position.y=-hh*.32+Math.sin(t*1.7+s)*2.5;});
   em(a1,s*hw*.6,-hh*.6,32,40);
  });
  em(a2,0,-hh*.25,30,30);M.front=32;},

 // 4 Coral Leviathan — kraken-jellyfish: translucent bell, glowing organ, ring of eyes, swaying tentacles and oral arms
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),bell=new THREE.MeshPhongMaterial({color:0xff6ac0,transparent:true,opacity:.62,shininess:150,specular:0xffffff,emissive:a1,emissiveIntensity:.18,side:THREE.DoubleSide,depthWrite:false}),
  sk=H(0xb03070,{shininess:100}),org=T.trim(a2,.55),tm=H(0xd04a90,{shininess:90}),pale=H(0xffb0d8,{shininess:110});
  const pr=[];for(let k=0;k<=14;k++){const u=k/14,a=u*Math.PI*.5;pr.push([Math.sin(a)*hw*.62+0.01,Math.cos(a)*hh*.62]);}
  const bg=T.lathe(pr,20);add(T.mesh(bg,bell,[0,hh*.05,0],[Math.PI/2*0,0,0],[1,1,.6]));
  add(T.mesh(S,sk,[0,hh*.2,-6],null,[hw*.42,hh*.42,18]));
  add(T.mesh(S,org,[0,hh*.3,6],null,[hw*.2,hh*.2,14]));add(T.glow(a2,hh*.9,0,hh*.3,10,.3));
  for(let k=0;k<5;k++){const a=(k-2)*.35;add(T.mesh(S,pale,[Math.sin(a)*hw*.3,hh*.3+Math.cos(a)*hh*.28,14],[0,0,-a],[6,16,5]));}
  for(let k=0;k<9;k++){const u=(k-4)/4.6,x=u*hw*.6,y=hh*.05-Math.abs(u)*hh*.02;T.eye(M,add,x,y,24-Math.abs(u)*10,k%2?3.6:5,k%2?a2:0x7affe8,null,k%2?0:1);}
  for(let k=0;k<12;k++){const a=k/11*Math.PI;add(T.mesh(S,pale,[Math.cos(a)*hw*.64,hh*.02-Math.sin(a)*4,4],null,[9,6,8]),k%3===0?M.ar1:null);}
  for(let k=0;k<8;k++){const x=(k-3.5)*hw*.16,g=new THREE.Group();g.position.set(x,-hh*.0,8);add(g,k===0||k===7?M.ar2:null);
   const L=hh*(1.08-Math.abs(k-3.5)*.07);g.add(T.mesh(T.tent([[0,0,0],[x*.1,-L*.35,10],[-x*.06,-L*.7,4],[x*.12,-L,12]],5.2-Math.abs(k-3.5)*.4,1.2,12,5),tm));
   for(let j=1;j<4;j++)g.add(T.mesh(T.Ss(),T.G('tp',()=>T.trim(a2,.6)),[x*.03*j,-L*j*.24,10],null,[2.4,2.4,2.4]));
   T.sway(M,g,1.5,.2,.22,k*1.1);}
  [-1,1].forEach(s=>{const g=new THREE.Group();g.position.set(s*hw*.12,-hh*.05,18);add(g);
   g.add(T.mesh(T.tent([[0,0,0],[s*8,-hh*.25,6],[s*2,-hh*.45,10]],7,2,12,7),T.memb(0xffd0ea,.7,a1)));T.sway(M,g,1.2,.1,.15,s);
   em(a2,s*hw*.4,-hh*.6,22,28);});
  em(a1,0,-hh*.3,30,40);M.front=32;},

 // 5 Stormcrown — crowned electric manta: broad wings with lightning veins, cephalic horns, crystal crest, whip tail
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),sk=H(0x1a2a58,{shininess:100,specular:0xc0d8ff}),bel=H(0x8ab0e0,{shininess:110}),crest=T.trim(a2,.5),volt=T.trim(a1,.9),memb=T.memb(0x5a8aff,.5,a1);
  add(T.mesh(S,sk,[0,hh*.05,4],null,[hw*.3,hh*.55,22]));
  [-1,1].forEach(s=>{const wg=new THREE.Group();wg.position.set(s*hw*.18,hh*.05,0);add(wg);
   const shp=[[0,hh*.3],[s*hw*.45,hh*.42],[s*hw*.82,hh*.2],[s*hw*.92,-hh*.05],[s*hw*.6,-hh*.12],[s*hw*.3,-hh*.38],[0,-hh*.3]];
   const wm=T.mesh(T.ext(shp,6,4),sk);wg.add(wm);
   const w2=T.mesh(T.ext(shp.map(p=>[p[0]*.8,p[1]*.7]),2,1),memb,[0,0,6]);wg.add(w2);M.ar2.push(w2);
   for(let k=0;k<4;k++){const ex=s*hw*(.4+k*.15),ey=hh*(.3-k*.12);wg.add(T.mesh(T.tent([[s*4,0,7],[(ex)*.5,ey*.4+5,8],[ex,ey,7]],1.6,.6,10,4),volt));}
   M.anim.push(t=>{wg.rotation.y=s*Math.sin(t*1.6)*.28;wg.rotation.z=s*Math.sin(t*1.6)*.05;});
   const hn=new THREE.Group();hn.position.set(s*hw*.14,-hh*.38,20);add(hn,M.ar1);
   hn.add(T.mesh(T.tent([[0,0,0],[s*8,-hh*.2,4],[s*2,-hh*.42,8]],7,2,10,6),sk));T.sway(M,hn,2.2,.05,.1,s);
   T.eye(M,add,s*hw*.13,-hh*.22,26,6,a2);
   for(let k=0;k<3;k++)T.pust(M,add,s*hw*(.4+k*.16),hh*(.12-k*.06),12,3.2,a1);
   em(a1,s*hw*.8,hh*.0,12,30);
  });
  for(let k=0;k<5;k++){const a=(k-2)*.38;T.spike(add,crest,[Math.sin(a)*hw*.12,hh*.45+Math.cos(a)*hh*.1,16],34-Math.abs(k-2)*7,5,-a,-.2,k%2?M.ar1:null);}
  add(T.mesh(T.Ss(),volt,[0,hh*.62,18],null,[6,6,6]));add(T.glow(a1,40,0,hh*.62,20,.45));
  for(let k=0;k<4;k++)add(T.mesh(S,bel,[0,hh*(.3-k*.15),22],null,[hw*.12,hh*.05,6]));
  const tl=new THREE.Group();tl.position.set(0,hh*.55,-4);add(tl);tl.add(T.mesh(T.tent([[0,0,0],[6,hh*.4,-4],[-8,hh*.75,0],[4,hh*1.05,4]],5,.8,14,5),sk));T.sway(M,tl,1.3,.05,.2,0);
  em(a2,0,-hh*.45,30,36);M.front=32;},

 // 6 Prism Reaver — crystal mantis: triangular head with huge compound eyes, scythe arms, crystal wings, antennae
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),ch=H(0x1a7a6a,{shininess:150,specular:0xffffff}),ch2=H(0x2aa890,{shininess:160,specular:0xffffff}),dk=H(0x0c2a28),
  cry=new THREE.MeshPhongMaterial({color:0x9affea,transparent:true,opacity:.72,shininess:220,specular:0xffffff,emissive:a1,emissiveIntensity:.25,flatShading:true,side:THREE.DoubleSide}),pink=T.trim(a2,.45),wing=T.memb(a2,.32);
  for(let k=0;k<4;k++)add(T.mesh(S,k%2?ch:ch2,[0,hh*(.55-k*.14),-4+k*3],null,[hw*(.16+k*.02),hh*.12,14]));
  add(T.mesh(S,ch,[0,hh*.02,10],null,[hw*.13,hh*.26,14]));
  add(T.mesh(T.G('hd',()=>new THREE.ConeGeometry(1,1,3)),ch2,[0,-hh*.38,20],[0,0,Math.PI],[hw*.26,hh*.42,14]));
  [-1,1].forEach(s=>{
   const wg=new THREE.Group();wg.position.set(s*hw*.06,hh*.3,-8);add(wg,M.ar2);
   wg.add(T.mesh(T.Ss(),wing,[s*hw*.36,hh*.22,0],[0,0,-s*.7],[hw*.34,hh*.16,1]));
   M.anim.push(t=>{wg.rotation.y=s*Math.sin(t*9)*.25;});
   T.eye(M,add,s*hw*.14,-hh*.26,30,10,a2,null,0);
   const ar=new THREE.Group();ar.position.set(s*hw*.14,-hh*.02,16);add(ar);
   ar.add(T.mesh(T.tent([[0,0,0],[s*hw*.34,hh*.34,6],[s*hw*.56,hh*.2,8]],7,5,12,7),ch));
   const fa=new THREE.Group();fa.position.set(s*hw*.56,hh*.2,8);ar.add(fa);
   fa.add(T.mesh(T.tent([[0,0,0],[s*hw*.16,-hh*.3,4],[s*hw*.12,-hh*.65,6]],5,3,10,6),ch2));
   const bl=T.mesh(T.ext([[0,0],[s*hw*.22,-hh*.32],[s*hw*.2,-hh*.78],[s*hw*.05,-hh*1.0],[s*hw*.12,-hh*.62],[s*hw*.06,-hh*.3]],4,1.5),cry,[s*4,-4,4]);fa.add(bl);M.ar1.push(bl);
   for(let k=0;k<4;k++)fa.add(T.mesh(T.C(),pink,[s*hw*(.14-k*.01),-hh*(.2+k*.12),6],[0,0,s*1.9],[1.6,7,1.6]));
   M.anim.push(t=>{fa.rotation.z=s*(.1+Math.sin(t*1.3)*.08);ar.rotation.z=s*Math.sin(t*1.3)*.05;});
   add(T.mesh(T.tent([[s*hw*.08,-hh*.1,26],[s*hw*.2,hh*.2,40],[s*hw*.32,hh*.36,30]],1.6,.6,10,4),pink));
   for(let k=0;k<3;k++)add(T.mesh(T.G('oct',()=>new THREE.OctahedronGeometry(1,0)),cry,[s*hw*.18,hh*(.5-k*.14),8],[0,0,-s*.6],[4,14,4]));
   em(a1,s*hw*.7,-hh*.85,16,30);
  });
  add(T.mesh(T.Ss(),dk,[0,-hh*.7,24],null,[6,5,4]));
  em(a2,0,-hh*.7,30,30);M.front=34;},

 // 7 Forgeheart — molten-lava behemoth beetle: cracked obsidian elytra with glowing veins, great horns, vent cones, legs
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),tex=T.crackTex(7);tex.repeat.set(2,2);const lavaSk=new THREE.MeshPhongMaterial({color:0x2a1414,shininess:90,specular:0x886655,emissive:a1,emissiveMap:tex,emissiveIntensity:.95}),
  ob=H(0x3a2222,{shininess:110,specular:0xaa8866}),dk=H(0x180a0a),horn=H(0x5a3a2a,{shininess:120,specular:0xffd0a0}),molt=T.trim(a1,.85),gold=T.trim(a2,.55);
  M.anim.push(t=>{lavaSk.emissiveIntensity=.75+.25*Math.sin(t*2.4);tex.offset.y=t*.02;});
  [-1,1].forEach(s=>add(T.mesh(S,lavaSk,[s*hw*.24,hh*.18,0],[0,0,-s*.08],[hw*.3,hh*.62,26])));
  add(T.mesh(new THREE.BoxGeometry(3,hh*1.1,3),molt,[0,hh*.18,24]));
  add(T.mesh(S,ob,[0,-hh*.3,14],null,[hw*.34,hh*.24,20]));
  add(T.mesh(S,ob,[0,-hh*.52,20],null,[hw*.2,hh*.18,16]));
  const hg=new THREE.Group();hg.position.set(0,-hh*.62,26);add(hg);
  hg.add(T.mesh(T.tent([[0,0,0],[0,-hh*.28,8],[0,-hh*.5,20],[0,-hh*.44,34]],12,2,12,8),horn));
  M.anim.push(t=>{hg.rotation.x=Math.sin(t*1.2)*.08;});
  [-1,1].forEach(s=>{
   add(T.mesh(T.tent([[s*hw*.28,-hh*.32,20],[s*hw*.5,-hh*.55,22],[s*hw*.42,-hh*.85,26]],7,1.5,10,6),horn),M.ar1);
   for(let k=0;k<3;k++){const y=hh*(.3-k*.25);add(T.mesh(T.tent([[s*hw*.45,y,0],[s*hw*.78,y+hh*.12,-4],[s*hw*.95,y-hh*.22,0]],5,1.8,10,5),dk));T.spike(add,horn,[s*hw*.78,y+hh*.12,-2],10,2.5,-s*1.2,0);}
   for(let k=0;k<3;k++){const x=s*hw*(.14+k*.12),y=hh*(.55-k*.2);add(T.mesh(T.C(),ob,[x,y,T.ez(x,y,[s*hw*.24,hh*.18,0,hw*.3,hh*.62,26])-4],[-.3,0,-s*.3],[6,12,6]),M.ar2);
    T.pust(M,add,x,y+2,T.ez(x,y,[s*hw*.24,hh*.18,0,hw*.3,hh*.62,26])+8,3.6,a2,M.ar2);}
   T.eye(M,add,s*hw*.12,-hh*.4,32,5,a2);T.eye(M,add,s*hw*.22,-hh*.3,30,3.4,a1,null,0);
   em(a1,s*hw*.42,-hh*.85,28,30);
  });
  add(T.glow(a1,hh*1.2,0,hh*.15,-10,.22));
  em(a2,0,-hh*.98,40,38);M.front=34;},

 // 8 Hive Matriarch — insect queen: many-eyed head, mandibles, translucent buzzing wings, egg-laden abdomen
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),ch=H(0x2e6a22,{shininess:130,specular:0xd0ffb0}),ch2=H(0x4a9a30,{shininess:140}),dk=H(0x10200c),vi=H(0x5a2a7a,{shininess:110}),
  egg=T.memb(a2,.6),mand=H(0x9aa040,{shininess:130,specular:0xffffff}),wing=T.memb(0xd0b0ff,.3,0x8040ff);
  add(T.mesh(S,vi,[0,hh*.5,-6],null,[hw*.32,hh*.48,24]));
  for(let k=0;k<5;k++)add(T.mesh(new THREE.TorusGeometry(1,.06,5,22),ch,[0,hh*(.2+k*.15),2-k*2],[Math.PI/2.4,0,0],[hw*(.3-Math.abs(k-1.5)*.03),hh*.4,hh*.5]));
  const eg=[[0,.62],[-.15,.5],[.15,.5],[-.1,.78],[.1,.78],[0,.36]];eg.forEach((p,k)=>{const x=p[0]*hw,y=p[1]*hh;add(T.mesh(S,egg,[x,y,18],null,[12,11,10]),k<3?M.ar2:M.ar1);T.pust(M,add,x,y,20,5,a2,k<3?M.ar2:M.ar1);});
  add(T.mesh(S,ch,[0,0,6],null,[hw*.2,hh*.22,18]));
  add(T.mesh(S,ch2,[0,-hh*.32,16],null,[hw*.24,hh*.2,18]));
  [-1,1].forEach(s=>{
   [0,1].forEach(j=>{const w=new THREE.Group();w.position.set(s*hw*.1,hh*.08,-10);add(w,j?M.ar2:null);
    w.add(T.mesh(S,wing,[s*hw*.42,hh*(.18-j*.34),0],[0,0,s*(j?.35:-.25)],[hw*.42,hh*(.2-j*.04),1]));M.anim.push(t=>{w.rotation.y=s*Math.sin(t*14+j*2)*.35;});});
   for(let k=0;k<3;k++){const y=-hh*(.0+k*.14);add(T.mesh(T.tent([[s*hw*.15,y,8],[s*hw*.42,y+hh*.12,4],[s*hw*(.6+k*.05),y-hh*.3,6]],3.5,1.2,10,5),dk));}
   const md=new THREE.Group();md.position.set(s*hw*.1,-hh*.45,22);add(md);
   md.add(T.mesh(T.tent([[0,0,0],[s*hw*.14,-hh*.2,4],[s*hw*.02,-hh*.42,8]],6,1.2,12,6),mand));
   M.anim.push(t=>{md.rotation.z=s*(Math.sin(t*3.2)*.15+.05);});
   T.eye(M,add,s*hw*.1,-hh*.26,30,7,a1);T.eye(M,add,s*hw*.19,-hh*.36,28,4.5,a1);T.eye(M,add,s*hw*.06,-hh*.14,30,3.4,a2,null,0);
   add(T.mesh(T.tent([[s*hw*.05,-hh*.18,30],[s*hw*.2,hh*.05,40],[s*hw*.34,hh*.04,30]],1.6,.6,8,4),mand));
   em(a1,s*hw*.1,-hh*.78,30,26);
  });
  em(a2,0,hh*.5,30,40);M.front=32;},

 // 9 Oblivion — eldritch void maw: flesh ring of eyes and fangs around a singularity, radiating tentacles, spiked halo
 function(M,hw,hh,a1,a2,add,H,em){const T=this,S=T.S(),fl=H(0x2e0c2c,{shininess:100,specular:0xffb0e0}),fl2=H(0x4a1840,{shininess:100}),dk=H(0x0a0412,{shininess:40}),tooth=T.G('tooth',()=>T.skin(0xfff0e8,{shininess:150})),
  void_=new THREE.MeshBasicMaterial({color:0x05010a}),crest=T.trim(a1,.5),tm=H(0x7a2a6a,{shininess:100});
  const R=hh*.62,sy=1.0;
  add(T.mesh(new THREE.TorusGeometry(R,hh*.2,14,40),fl,[0,0,0],null,[1.3,sy,.9]));
  add(T.mesh(S,dk,[0,0,-6],null,[R*1.3,R,10]));
  add(T.mesh(S,void_,[0,0,4],null,[R*.85,R*.62,6]));
  const ac=T.mesh(new THREE.TorusGeometry(R*.62,2.2,6,40),T.trim(a2,.7),[0,0,10],null,[1.3,1,1]);add(ac);M.anim.push(t=>{ac.rotation.z=t*.6;});
  add(T.glow(a1,R*1.2,0,0,-8,.12));
  for(let k=0;k<20;k++){const a=k/20*Math.PI*2;T.spike(add,tooth,[Math.cos(a)*R*.95*1.3,Math.sin(a)*R*.95,14],12+(k%2)*5,3,a+Math.PI/2,.3);}
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2+Math.PI/10;T.eye(M,add,Math.cos(a)*R*1.3,Math.sin(a)*R,22,k%2?4.5:6.5,k%2?a2:a1,null,k%3?1:0);}
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;T.spike(add,crest,[Math.cos(a)*R*1.62,Math.sin(a)*R*1.3,-6],22,5,a-Math.PI/2,0,k%2?M.ar1:null);}
  const halo=new THREE.Group();add(halo);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8,g=new THREE.Group();g.position.set(Math.cos(a)*R*1.45,Math.sin(a)*R*1.15,-8);g.rotation.z=a;halo.add(g);if(k%2)M.ar2.push(g);
   g.add(T.mesh(T.tent([[0,0,0],[R*.3,R*.12,2],[R*.6,-R*.08,6],[R*.85,R*.05,2]],6,1,14,6),tm));
   g.add(T.mesh(T.Ss(),T.G('tp',()=>T.trim(a2,.6)),[R*.85,R*.05,2],null,[3,3,3]));
   const ph=k*.9;M.anim.push(t=>{g.rotation.z=a+Math.sin(t*1.3+ph)*.18;});}
  M.anim.push(t=>{halo.rotation.z=Math.sin(t*.3)*.08;});
  [-1,1].forEach(s=>em(a1,s*R*1.3,0,24,36));
  em(a2,0,-R,24,40);M.front=34;}];

// ---------- hook into the existing renderer ----------
(function(){const orig=bossDraw;
 bossDraw=function(g,i,o){if(g===cx&&G.boss&&G.boss.i===i&&B3D.draw(g,i,o))return;return orig(g,i,o);};
 const pw=prewarm;prewarm=function(bg,bi){pw(bg,bi);if(bi>=0&&BOSS_DEF[bi]&&!B3D.off)PW.q.push(()=>{if(B3D.active())B3D.build(bi);});};
 if(window.DBG)DBG.b3d=()=>B3D.info();window.B3D=B3D;})();
