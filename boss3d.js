// Starzoomer v29 — real-time 3D motherships. Each of the 10 stage bosses is built from procedural three.js geometry
// (no model files), lit and rendered into a small offscreen WebGL canvas that is drawn into the 2D game canvas where the
// 2D boss art used to be. Gameplay, hitboxes and bullets stay 2D. Falls back to the 2D art (bossart.js) when WebGL is
// missing / lost, when quality is Low (incl. the automatic quality drop), when ?b3d=0, or when 3D rendering is too slow.
'use strict';
const B3D={tried:false,ok:false,off:Q.get('b3d')==='0',r:null,cv:null,scene:null,cam:null,cache:{},order:[],cur:-1,glowTex:null,
 stat:{n:0,acc:0,slow:0,ms:0,frames:0},why:'',
 init(){if(this.tried)return this.ok;this.tried=true;
  try{if(!window.THREE)throw new Error('three.js missing');const cv=document.createElement('canvas');cv.width=cv.height=8;
   const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'default',preserveDrawingBuffer:false});
   r.setClearColor(0x000000,0);r.setPixelRatio(1);this.r=r;this.cv=cv;
   cv.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail('context lost');},false);
   const S=this.scene=new THREE.Scene();this.cam=new THREE.OrthographicCamera(-100,100,100,-100,-2000,2000);this.cam.position.set(0,0,600);this.cam.lookAt(0,0,0);
   S.add(new THREE.HemisphereLight(0xb8c8ff,0x281a3a,1.6));
   const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(-.45,.75,1);S.add(key);
   this.rim=new THREE.DirectionalLight(0xff8a2a,2.2);this.rim.position.set(.3,1,-.8);S.add(this.rim);
   this.fill=new THREE.DirectionalLight(0x6ab0ff,.9);this.fill.position.set(.8,-.6,.6);S.add(this.fill);
   this.pt=new THREE.PointLight(0xffffff,0,0,0);S.add(this.pt);
   const gc=document.createElement('canvas');gc.width=gc.height=64;const g=gc.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
   this.glowTex=new THREE.CanvasTexture(gc);this._q=new THREE.Quaternion();this._qi=new THREE.Quaternion();this._z=new THREE.Vector3(0,0,1);this.ok=true;LOG('boss3d: WebGL ready, three r'+THREE.REVISION);}
  catch(e){this.ok=false;this.why=String(e&&e.message||e);LOG('boss3d: fallback to 2D ('+this.why+')');}
  return this.ok;},
 fail(why){if(!this.ok&&this.tried)return;this.ok=false;this.tried=true;this.why=why;LOG('boss3d: disabled -> 2D art ('+why+')');ART.turSpr&&Object.keys(this.realTur).forEach(k=>ART.turSpr[k]=this.realTur[k]);},
 realTur:{},
 // 3D is used when WebGL works and quality is not Low (auto quality drop to 0 => 2D art)
 active(){return !this.off&&QUAL>0&&(this.tried?this.ok:this.init());},
 // ---------- material / mesh helpers ----------
 mat(c,o){return new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0x555566,shininess:50,flatShading:true},o||{}));},
 emi(c,o){return new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{}));},
 glow(c,s,x,y,z,a){const m=new THREE.SpriteMaterial({map:this.glowTex,color:c,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,transparent:true,opacity:a===undefined?.9:a,toneMapped:false});const sp=new THREE.Sprite(m);sp.scale.set(s,s,1);sp.position.set(x,y,z);sp.renderOrder=5;return sp;},
 mesh(geo,mat,p,r,s){const m=new THREE.Mesh(geo,mat);if(p)m.position.set(p[0],p[1],p[2]||0);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s)m.scale.set(s[0],s[1]===undefined?s[0]:s[1],s[2]===undefined?s[0]:s[2]);return m;},
 ext(pts,depth,bev){const sh=new THREE.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:1,curveSegments:6});g.translate(0,0,-depth/2);return g;},
 rnd(seed){let s=seed*7919+13;return()=>{s=(s*16807)%2147483647;return s/2147483647;};},
 hex(c){return new THREE.Color(c).getHex();},
 // ---------- boss model assembly ----------
 build(i){if(this.cache[i])return this.cache[i];if(!this.init())return null;const D=BOSS_DEF[i],hw=D[1]/2,hh=D[2]/2,a1=this.hex(D[3]),a2=this.hex(D[4]);
  const M={i,g:new THREE.Group(),body:new THREE.Group(),hull:[],ar1:[],ar2:[],emit:[],anim:[],front:34,hw,hh,a1,a2,tur:[]};M.g.add(M.body);
  const T=this,add=(o,arr)=>{M.body.add(o);if(arr)arr.push(o);return o;};
  const hullM=(c,o)=>{const m=T.mat(c,o);M.hull.push(m);return m;};
  const em=(c,x,y,z,s)=>{const sp=T.glow(c,s||26,x,y,z,.0);M.body.add(sp);M.emit.push(sp);return sp;};
  T.DES[i].call(T,M,hw,hh,a1,a2,add,hullM,em);
  // weak-point core (same place as the 2D core: hh*.25 below centre)
  const cy=-hh*.25,cz=M.front+6,cr=i===9?15:12;
  const coreM=new THREE.MeshPhongMaterial({color:0xffffff,emissive:a2,emissiveIntensity:.9,shininess:120,specular:0xffffff});
  M.core=T.mesh(new THREE.SphereGeometry(cr,20,14),coreM,[0,cy,cz]);M.coreM=coreM;M.g.add(M.core);
  M.ring=T.mesh(new THREE.TorusGeometry(cr+5,1.6,6,28,Math.PI*1.6),T.emi(0xffffff),[0,cy,cz+2]);M.g.add(M.ring);
  M.pupil=T.mesh(new THREE.SphereGeometry(cr*.4,12,8),new THREE.MeshBasicMaterial({color:0x14061e}),[0,cy,cz+cr*.75]);M.g.add(M.pupil);
  M.halo=T.glow(a2,cr*5,0,cy,cz+4,.75);M.g.add(M.halo);
  // turret meshes (positions/aim follow the 2D turret data so hit areas line up)
  const tb=new THREE.CylinderGeometry(9,11,8,10),tbar=new THREE.BoxGeometry(4,14,4);tbar.translate(0,9,0);
  for(let k=0;k<5;k++){const tg=new THREE.Group(),tm=T.mat(0x5a5f7a,{emissive:0x000000}),bm=T.mat(a1,{emissive:0x000000});
   const base=T.mesh(tb,tm,[0,0,0],[Math.PI/2,0,0]);const bar=T.mesh(tbar,bm);bar.position.z=4;const lt=T.glow(a1,14,0,0,8,.8);tg.add(base,bar,lt);tg.bar=bar;tg.tm=tm;tg.bm=bm;tg.visible=false;
   tg.renderOrder=4;base.renderOrder=4;bar.renderOrder=4;M.g.add(tg);M.tur.push(tg);}
  M.g.traverse(o=>{if(o.isMesh)o.matrixAutoUpdate=true;});
  this.cache[i]=M;this.order.push(i);this.trim(i);return M;},
 // keep at most 3 boss models alive; dispose the rest (geometries, materials)
 trim(keep){while(this.order.length>3){const k=this.order.find(x=>x!==keep&&x!==this.cur);if(k===undefined)break;this.dispose(k);}},
 dispose(i){const M=this.cache[i];if(!M)return;if(M.g.parent)M.g.parent.remove(M.g);const seen=new Set();
  M.g.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(!seen.has(m)){seen.add(m);m.dispose();}});}});
  delete this.cache[i];this.order=this.order.filter(x=>x!==i);},
 disposeAll(){Object.keys(this.cache).forEach(k=>this.dispose(+k));},
 // ---------- per-frame render ----------
 // returns false when the caller should draw the 2D art instead
 draw(g,i,o){if(!this.active())return false;const B=G.boss;let M;try{M=this.build(i);}catch(e){this.fail('build '+e.message);return false;}if(!M)return false;
  const t0=performance.now();
  try{if(this.cur!==i){if(this.cur>=0&&this.cache[this.cur])this.scene.remove(this.cache[this.cur].g);this.scene.add(M.g);this.cur=i;
    if(!this.realTur[i]){this.realTur[i]=ART.turSpr[i]||(ART.turSpr[i]=turretSpr(BOSS_DEF[i][3]));}
    ART.turSpr[i]=this.blank||(this.blank=mk(2,2,()=>{},1));}
   const pad=70,W=M.hw*2+pad*2,H=M.hh*2+pad*2,k=Math.min(DPR*SC,QUAL>=2?1.5:1.1,560/W),pw=Math.max(16,Math.round(W*k)),ph=Math.max(16,Math.round(H*k));
   if(this.cv.width!==pw||this.cv.height!==ph){this.r.setSize(pw,ph,false);}
   const c=this.cam;if(c.right!==W/2||c.top!==H/2){c.left=-W/2;c.right=W/2;c.top=H/2;c.bottom=-H/2;c.updateProjectionMatrix();}
   this.pose(M,B,o);this.r.render(this.scene,c);
   g.drawImage(this.cv,-W/2,-H/2,W,H);}
  catch(e){this.fail('render '+e.message);return false;}
  const ms=performance.now()-t0,S=this.stat;S.ms=S.ms*.95+ms*.05;S.frames++;S.acc+=ms;S.n++;
  if(S.n>=90){const av=S.acc/S.n;S.acc=0;S.n=0;if(av>9){S.slow++;if(S.slow>=3)this.fail('too slow ('+av.toFixed(1)+' ms/frame)');}else S.slow=0;}
  return true;},
 pose(M,B,o){const t=o.t,ph=o.ph||0,fl=o.fl>0,dead=o.dead||0,cur=B&&B.cur,beam=B&&B.beam;
  // slow rotation / tilt + banking with horizontal motion
  const vx=B?Math.cos((B.t-3)*.45)*.45*GW*.16:0;
  M.g.rotation.set(-.42+Math.sin(t*.7)*.07,Math.sin(t*.45)*.22+clamp(vx/90,-.25,.25),Math.sin(t*.9)*.035-clamp(vx/260,-.08,.08));
  if(dead){M.g.rotation.z+=dead*dead*.05;M.g.rotation.y+=dead*.4;M.g.position.set(rnd(-1,1)*dead*2,rnd(-1,1)*dead*2,0);}else M.g.position.set(0,0,0);
  // damage states: armour plates blown off in phase 1 / 2, hot hull glow in phase 2
  M.ar1.forEach(m=>m.visible=ph<1);M.ar2.forEach(m=>m.visible=ph<2);
  const hot=ph>=2?.18+.14*Math.sin(t*6):ph>=1?.06:0,wf=dead?Math.min(1,dead/2.8)*(.6+.4*Math.sin(dead*30)):0;
  for(const m of M.hull){if(fl||wf>.05){m.emissive.setRGB(1,1,1);m.emissiveIntensity=fl?.55:wf;}else if(hot){m.emissive.setRGB(1,.25,.12);m.emissiveIntensity=hot;}else m.emissiveIntensity=0;}
  // attack telegraph: emitters charge up before a new pattern, during beam charge, and while firing
  let tel=0;if(B&&!dead){if(B.pt<.8)tel=1-B.pt/.8;if(cur&&cur.t<.5)tel=Math.max(tel,1-cur.t/.5);if(beam&&beam.t<1.6)tel=Math.max(tel,.4+beam.t/1.6*.6);}
  const pulse=.5+.5*Math.sin(t*(10+tel*20));M.emit.forEach((e,k)=>{e.material.opacity=Math.min(1,.25+tel*.75*(.6+.4*pulse)+(ph?.1:0));const s=e.userData.s||(e.userData.s=e.scale.x);const z=s*(1+tel*.9);e.scale.set(z,z,1);});
  // core colour per phase, pupil looks at the player
  const cc=[M.a2,0xffa030,0xff3a4a][ph]||M.a2,pu=.85+.15*Math.sin(t*(4+ph*3));M.coreM.emissive.setHex(cc);M.coreM.emissiveIntensity=.8+tel*.6;M.core.scale.setScalar(pu);
  M.halo.material.color.setHex(cc);const hs=M.halo.userData.s||(M.halo.userData.s=M.halo.scale.x);M.halo.scale.set(hs*pu*(1+tel*.5),hs*pu*(1+tel*.5),1);
  M.ring.rotation.z=t*1.5;const la=o.la||Math.PI/2,cr=M.core.geometry.parameters.radius;M.pupil.position.x=Math.cos(la)*cr*.35;M.pupil.position.y=-M.hh*.25-Math.sin(la)*cr*.35;
  this.rim.color.setHex(M.a1);this.pt.color.setHex(cc);this.pt.intensity=(.6+tel*1.4)*1.6;this.pt.position.set(0,-M.hh*.25,M.front+60);
  for(const a of M.anim)a(t,ph,tel);
  // turrets: counter the hull tilt so they stay on their 2D hit positions
  const tur=B?B.tur:[];M.tur.forEach((tg,k)=>{const d=tur[k];if(!d||!d.alive||dead){tg.visible=false;return;}tg.visible=true;tg.position.set(d.ox,-d.oy,M.front+14);B3D._q.setFromAxisAngle(B3D._z,-(d.ang)-Math.PI/2);
   const f=d.fl>0;tg.tm.emissive.setRGB(f?1:0,f?1:0,f?1:0);tg.bm.emissive.setHex(f?0xffffff:0x000000);tg.bm.emissiveIntensity=f?.8:0;
  // keep turrets untilted (inverse of the body tilt, applied by parenting them to the root group would tilt them)
   const qi=B3D._qi.copy(M.g.quaternion).invert();tg.position.applyQuaternion(qi);tg.quaternion.copy(qi).multiply(B3D._q);});},
 info(){return{ok:this.ok,tried:this.tried,why:this.why,active:this.active(),ms:+this.stat.ms.toFixed(2),models:Object.keys(this.cache).map(Number),cur:this.cur,res:this.cv?[this.cv.width,this.cv.height]:null};}};

// ---------- the 10 designs (x right, y up, z towards the camera; the boss faces the player = -y) ----------
B3D.DES=[
 // 0 Gloomjaw Carrier — armoured flat-top carrier with a pair of jaw prongs and side engine pods
 function(M,hw,hh,a1,a2,add,H,em){const T=this,hull=H(0x3c4262),dark=H(0x262a40),acc=H(a1);
  add(T.mesh(T.ext([[-.95,.15],[-.72,.8],[.72,.8],[.95,.15],[.62,-.55],[.26,-.72],[-.26,-.72],[-.62,-.55]].map(p=>[p[0]*hw,p[1]*hh]),30,6),hull));
  add(T.mesh(new THREE.BoxGeometry(hw*1.15,hh*.55,6),dark,[0,hh*.18,20]));
  for(let k=-2;k<=2;k++)add(T.mesh(new THREE.BoxGeometry(4,hh*.5,2),T.emi(a2),[k*hw*.2,hh*.18,24]));
  add(T.mesh(new THREE.BoxGeometry(hw*.26,hh*.3,26),hull,[hw*.38,hh*.5,30]));add(T.mesh(new THREE.BoxGeometry(hw*.2,hh*.08,4),T.emi(a2),[hw*.38,hh*.5,44]));
  [-1,1].forEach(s=>{add(T.mesh(new THREE.ConeGeometry(16,hh*.75,4),acc,[s*hw*.36,-hh*.78,6],[0,0,Math.PI]),M.ar1);
   add(T.mesh(new THREE.CylinderGeometry(15,18,hh*1.15,10),dark,[s*hw*.9,hh*.12,0]),M.ar2);add(T.mesh(new THREE.TorusGeometry(17,3,6,16),acc,[s*hw*.9,hh*.5,0],[Math.PI/2,0,0]));
   add(T.glow(a2,40,s*hw*.9,hh*.72,10,.8));em(a1,s*hw*.36,-hh*1.1,16,30);
   add(T.mesh(new THREE.BoxGeometry(hw*.3,10,8),acc,[s*hw*.55,-hh*.42,18],[0,0,s*.35]),M.ar1);});
  M.front=34;},
 // 1 Rockmaw Hauler — a captured asteroid bound with metal clamps, a toothy maw in front
 function(M,hw,hh,a1,a2,add,H,em){const T=this,R=T.rnd(2),rock=H(0x6e5a4a,{shininess:8,specular:0x222222}),met=H(new THREE.Color(a2).lerp(new THREE.Color(0x56585e),.6).getHex(),{shininess:90}),dk=H(0x2a2028);
  const geo=new THREE.IcosahedronGeometry(hh*.95,2),p=geo.attributes.position;for(let k=0;k<p.count;k++){const v=new THREE.Vector3().fromBufferAttribute(p,k),n=.82+R()*.3;v.multiplyScalar(n);p.setXYZ(k,v.x,v.y,v.z*.7);}
  geo.computeVertexNormals();add(T.mesh(geo,rock,[0,hh*.05,0],null,[hw/hh*.85,1,1]));
  [-.45,.45].forEach(x=>add(T.mesh(new THREE.TorusGeometry(hh*.92,6,6,24),met,[x*hw,0,0],[0,Math.PI/2,0],[1,1,.75]),M.ar1));
  add(T.mesh(new THREE.CylinderGeometry(hh*.38,hh*.38,10,18),dk,[0,-hh*.42,30],[Math.PI/2,0,0]));
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;add(T.mesh(new THREE.ConeGeometry(5,15,4),H(0xf0e8d0),[Math.cos(a)*hh*.32,-hh*.42+Math.sin(a)*hh*.32,38],[0,0,a+Math.PI/2]));}
  [-1,1].forEach(s=>{add(T.mesh(new THREE.BoxGeometry(34,hh*.7,30),met,[s*hw*.86,hh*.1,0]),M.ar2);add(T.mesh(new THREE.CylinderGeometry(9,13,22,8),dk,[s*hw*.86,hh*.55,0]));add(T.glow(a1,38,s*hw*.86,hh*.75,6,.8));
   add(T.mesh(new THREE.SphereGeometry(7,10,8),T.emi(a1),[s*hw*.3,hh*.12,hh*.62]));em(a1,s*hw*.3,hh*.12,hh*.66,22);});
  em(a1,0,-hh*.42,40,56);M.front=40;},
 // 2 Frostback Warden — crystalline ice fortress: faceted core gem with radiating shards
 function(M,hw,hh,a1,a2,add,H,em){const T=this,ice=H(0x9adcff,{shininess:140,specular:0xffffff,transparent:true,opacity:.92}),deep=H(0x3a6aa8,{shininess:120}),white=H(0xeaf8ff,{shininess:160});
  add(T.mesh(new THREE.DodecahedronGeometry(hh*.55,0),deep,[0,hh*.05,0],[.3,.5,0],[1.3,1,.8]));
  const sh=[[-.95,.2,1.0,.6],[.95,.2,1.0,.6],[-.7,.75,.85,.5],[.7,.75,.85,.5],[0,.95,.7,.5],[-.45,-.6,.6,.45],[.45,-.6,.6,.45],[-1.0,-.3,.7,.42],[1.0,-.3,.7,.42]];
  sh.forEach((s,k)=>{const x=s[0]*hw*.72,y=s[1]*hh*.72,len=s[2]*hh*.9,a=Math.atan2(y,x)-Math.PI/2;const m=T.mesh(new THREE.OctahedronGeometry(1,0),k%2?ice:white,[x,y,k%3*6],[0,0,a],[s[3]*hh*.32,len*.6,14]);add(m,k<4?M.ar1:k>=7?M.ar2:null);});
  add(T.mesh(new THREE.TorusGeometry(hh*.62,3,4,6),T.emi(a1),[0,hh*.05,10],[0,0,Math.PI/6]));
  [-1,0,1].forEach(s=>em(a1,s*hw*.32,-hh*.62,24,30));add(T.glow(0x9af0ff,hh*1.6,0,hh*.05,-10,.35));M.front=32;},
 // 3 Twinflare Bastion — twin reactor spheres joined by an armoured bridge, flare nozzles below
 function(M,hw,hh,a1,a2,add,H,em){const T=this,met=H(0x5a4a5e),acc=H(a1,{shininess:80}),dk=H(0x2a2234);
  add(T.mesh(new THREE.BoxGeometry(hw*1.1,hh*.42,34),met,[0,hh*.02,0]));add(T.mesh(new THREE.BoxGeometry(hw*.5,hh*.6,40),dk,[0,-hh*.1,4]));
  [-1,1].forEach(s=>{const x=s*hw*.6;add(T.mesh(new THREE.SphereGeometry(hh*.56,18,12),met,[x,hh*.12,0]));
   add(T.mesh(new THREE.SphereGeometry(hh*.58,18,8,0,Math.PI*2,0,Math.PI*.42),acc,[x,hh*.12,0],[-.3,0,0]),M.ar1);
   add(T.mesh(new THREE.TorusGeometry(hh*.57,3,6,26),T.emi(a2),[x,hh*.12,0],[Math.PI/2.4,0,0]));
   add(T.mesh(new THREE.ConeGeometry(14,30,10,1,true),dk,[x,-hh*.55,10],[0,0,0]));add(T.glow(a1,46,x,-hh*.72,12,.9));em(a1,x,-hh*.75,14,40);
   add(T.mesh(new THREE.BoxGeometry(12,hh*.7,10),acc,[s*hw*.98,hh*.1,0]),M.ar2);});
  const spin=T.mesh(new THREE.TorusGeometry(hh*.3,2.5,4,20),T.emi(a2),[0,-hh*.25,26]);add(spin);M.anim.push(t=>{spin.rotation.x=t*1.4;spin.rotation.y=t*.9;});M.front=30;},
 // 4 Coral Leviathan — organic carapace with branching coral horns and swaying tentacles
 function(M,hw,hh,a1,a2,add,H,em){const T=this,skin=H(0xb0407a,{shininess:70}),pale=H(0xffb0d8,{shininess:90}),acc=H(a2);
  add(T.mesh(new THREE.SphereGeometry(hh*.62,22,14),skin,[0,hh*.12,0],null,[hw/hh*.8,1,.6]));
  add(T.mesh(new THREE.SphereGeometry(hh*.4,18,12),pale,[0,-hh*.15,12],null,[1.3,.9,.7]));
  [-1,1].forEach(s=>{for(let k=0;k<3;k++){const a=s*(.5+k*.32);add(T.mesh(new THREE.ConeGeometry(7-k,hh*.55,6),k?pale:acc,[s*hw*(.42+k*.15),hh*(.55-k*.12),0],[0,0,-a]),k===2?M.ar1:null);}
   add(T.mesh(new THREE.SphereGeometry(9,12,8),T.emi(a2),[s*hw*.22,hh*.02,hh*.36]));em(a2,s*hw*.22,hh*.02,hh*.4,24);});
  const tm=H(0xd05a98,{shininess:60});
  for(let k=0;k<6;k++){const x=(k-2.5)*hw*.22,grp=new THREE.Group();grp.position.set(x,-hh*.35,0);
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(x*.08,-hh*.25,6),new THREE.Vector3(-x*.05,-hh*.5,2),new THREE.Vector3(x*.1,-hh*.72,8)]);
   grp.add(T.mesh(new THREE.TubeGeometry(curve,10,4.5-Math.abs(k-2.5)*.6,6,false),tm));add(grp,k===0||k===5?M.ar2:null);const ph=k*1.1;M.anim.push(t=>{grp.rotation.z=Math.sin(t*1.6+ph)*.25;grp.rotation.x=Math.sin(t*1.1+ph)*.2;});}
  em(a1,0,-hh*.6,20,40);M.front=30;},
 // 5 Stormcrown Citadel — stacked citadel discs crowned with lightning spires and a spinning storm ring
 function(M,hw,hh,a1,a2,add,H,em){const T=this,st=H(0x3a4a7a,{shininess:70}),lt=H(0xc0d4ff,{shininess:110}),dk=H(0x1e2440);
  add(T.mesh(new THREE.CylinderGeometry(hw*.62,hw*.7,22,8),st,[0,0,0],[Math.PI/2,0,0],[1,1,hh/hw*1.25]));
  add(T.mesh(new THREE.CylinderGeometry(hw*.42,hw*.5,18,8),dk,[0,0,18],[Math.PI/2,0,0],[1,1,hh/hw*1.25]));
  add(T.mesh(new THREE.CylinderGeometry(hw*.22,hw*.3,16,8),lt,[0,hh*.05,32],[Math.PI/2,0,0],[1,1,hh/hw*1.25]));
  const ring=new THREE.Group();for(let k=0;k<12;k++){const a=k/12*Math.PI*2,r=hw*.78;const sp=T.mesh(new THREE.ConeGeometry(7,26,5),k%2?lt:H(a1),[Math.cos(a)*r,Math.sin(a)*r*hh/hw*1.25,0],[0,0,a-Math.PI/2]);ring.add(sp);if(k%2)M.ar1.push(sp);}
  add(ring);M.anim.push(t=>{ring.rotation.z=t*.25;});
  const orb=T.mesh(new THREE.TorusGeometry(hw*.84,2.2,4,40),T.emi(a2),[0,0,6],null,[1,hh/hw*1.25,1]);add(orb,M.ar2);
  [-1,1].forEach(s=>{add(T.mesh(new THREE.CylinderGeometry(2,4,hh*.9,6),lt,[s*hw*.3,hh*.55,22]));add(T.glow(a2,26,s*hw*.3,hh*1.0,24,.9));em(a2,s*hw*.3,hh*1.0,24,30);});
  em(a1,0,-hh*.55,30,40);M.front=40;},
 // 6 Prism Reaver — triangular prism spearhead with swept crystal blades and glowing edges
 function(M,hw,hh,a1,a2,add,H,em){const T=this,cr=H(0x2aa89a,{shininess:130,specular:0xffffff}),mg=H(a2,{shininess:120}),dk=H(0x183440);
  const pr=T.mesh(new THREE.CylinderGeometry(hh*.36,hh*.36,hh*1.6,3),cr,[0,0,0],[0,0,Math.PI],[1,1,.6]);add(pr);
  pr.add(new THREE.LineSegments(new THREE.EdgesGeometry(pr.geometry),new THREE.LineBasicMaterial({color:a1,toneMapped:false})));
  [-1,1].forEach(s=>{const bl=T.mesh(T.ext([[0,0],[s*hw*.95,hh*.55],[s*hw*.8,hh*.2],[s*hw*.3,-hh*.55]],8,2),mg,[0,0,-6]);add(bl);
   const tip=T.mesh(T.ext([[s*hw*.62,hh*.42],[s*hw*1.0,hh*.6],[s*hw*.9,hh*.28]],10,2),cr,[0,0,0]);add(tip,M.ar1);
   const b2=T.mesh(T.ext([[s*hw*.15,-hh*.2],[s*hw*.6,-hh*.4],[s*hw*.25,-hh*.75]],6,1),dk,[0,0,8]);add(b2,M.ar2);
   add(new THREE.LineSegments(new THREE.EdgesGeometry(bl.geometry),new THREE.LineBasicMaterial({color:a1,toneMapped:false})));em(a1,s*hw*.9,hh*.5,8,28);});
  const gem=T.mesh(new THREE.OctahedronGeometry(14,0),T.emi(a1),[0,hh*.35,26]);add(gem);M.anim.push(t=>{gem.rotation.y=t*2;});em(a2,0,-hh*.8,20,36);M.front=32;},
 // 7 Forgeheart Dreadnought — arrowhead battleship, stacked superstructure, cannon batteries and molten forge vents
 function(M,hw,hh,a1,a2,add,H,em){const T=this,st=H(0x4a3a3a,{shininess:40}),dk=H(0x241a1e),acc=H(a2,{shininess:90});
  add(T.mesh(T.ext([[-1,.55],[1,.55],[.92,.1],[.4,-.55],[0,-.85],[-.4,-.55],[-.92,.1]].map(p=>[p[0]*hw,p[1]*hh]),34,5),st));
  add(T.mesh(new THREE.BoxGeometry(hw*.8,hh*.35,14),dk,[0,hh*.2,22]));add(T.mesh(new THREE.BoxGeometry(hw*.42,hh*.25,14),st,[0,hh*.28,34]));add(T.mesh(new THREE.BoxGeometry(hw*.16,hh*.18,16),acc,[0,hh*.36,46]));
  for(let k=-3;k<=3;k++){if(!k)continue;add(T.mesh(new THREE.CylinderGeometry(3.2,4.2,26,8),dk,[k*hw*.22,-hh*.18-Math.abs(k)*-hh*.06,24],[0,0,0]),Math.abs(k)===3?M.ar1:null);em(a1,k*hw*.22,-hh*.18-Math.abs(k)*-hh*.06-14,26,18);}
  for(let k=0;k<4;k++)add(T.mesh(new THREE.BoxGeometry(hw*.12,3,4),T.emi(a1),[(k-1.5)*hw*.26,hh*.02,30]));
  [-1,1].forEach(s=>{add(T.mesh(new THREE.CylinderGeometry(7,9,26,8),dk,[s*hw*.6,hh*.55,10]));add(T.glow(0xff7a2a,34,s*hw*.6,hh*.72,12,.7));
   add(T.mesh(new THREE.BoxGeometry(hw*.34,hh*.2,10),acc,[s*hw*.62,hh*.05,18],[0,0,-s*.25]),M.ar2);});
  const fc=T.mesh(new THREE.IcosahedronGeometry(16,0),T.emi(0xff6a1a),[0,-hh*.5,24]);add(fc);M.anim.push(t=>{fc.rotation.x=t;fc.rotation.y=t*1.3;});M.front=36;},
 // 8 Hive Matriarch — insect queen: thorax, egg-laden abdomen, mandibles, flapping wings and legs
 function(M,hw,hh,a1,a2,add,H,em){const T=this,ch=H(0x3a6a2a,{shininess:110}),dk=H(0x1e2a18),vi=H(a2,{shininess:80});
  add(T.mesh(new THREE.SphereGeometry(hh*.4,18,12),ch,[0,0,0],null,[1.3,1,.8]));
  add(T.mesh(new THREE.SphereGeometry(hh*.5,18,12),vi,[0,hh*.55,-6],null,[1.15,1,.7]));
  for(let k=0;k<5;k++)add(T.mesh(new THREE.TorusGeometry(hh*.44-k*2,2,4,18),dk,[0,hh*(.38+k*.09),-4],[Math.PI/2,0,0],[1.15,1,1]));
  add(T.mesh(new THREE.SphereGeometry(hh*.24,14,10),ch,[0,-hh*.42,8]));
  [-1,1].forEach(s=>{add(T.mesh(new THREE.ConeGeometry(4,hh*.35,5),dk,[s*12,-hh*.66,10],[0,0,Math.PI+s*.35]));
   for(let k=0;k<3;k++){add(T.mesh(new THREE.SphereGeometry(8,10,8),T.emi(a1),[s*hw*(.18+k*.1),hh*(.5+k*.08),hh*.25]),k===2?M.ar1:M.ar2);}
   for(let k=0;k<3;k++)add(T.mesh(new THREE.CylinderGeometry(2.5,3.5,hh*.8,6),dk,[s*hw*.42,-hh*(.05+k*.18),0],[0,0,s*(1.1+k*.25)]));
   [0,1].forEach(j=>{const w=new THREE.Group();w.position.set(s*hw*.15,hh*.15,-10);const wm=T.mesh(new THREE.CircleGeometry(1,20),new THREE.MeshPhongMaterial({color:0xc8a8ff,transparent:true,opacity:.45,side:THREE.DoubleSide,shininess:150,depthWrite:false}),[s*hw*.42,hh*(.2-j*.32),0],null,[hw*.48,hh*(.32-j*.08),1]);w.add(wm);add(w,j?M.ar2:null);
    M.anim.push(t=>{w.rotation.y=s*Math.sin(t*14+j)*.35;});});
   em(a1,s*hw*.1,-hh*.45,hh*.3,22);});
  M.front=26;},
 // 9 Oblivion Ark — vast ring station around a dark singularity core, rotating arcs and spokes
 function(M,hw,hh,a1,a2,add,H,em){const T=this,st=H(0x3a2a4a,{shininess:70}),dk=H(0x140a1e,{shininess:150,specular:0xffffff}),acc=H(a1,{shininess:90});
  const sy=hh/hw*1.45;add(T.mesh(new THREE.TorusGeometry(hw*.62,14,10,48),st,[0,0,0],null,[1,sy,1]));
  add(T.mesh(new THREE.TorusGeometry(hw*.62,4,6,48),T.emi(a2),[0,0,13],null,[1,sy,1]));
  add(T.mesh(new THREE.SphereGeometry(hh*.42,24,16),dk,[0,0,0]));
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+Math.PI/6;add(T.mesh(new THREE.BoxGeometry(hw*.45,7,8),st,[Math.cos(a)*hw*.38,Math.sin(a)*hw*.38*sy,0],[0,0,a]),M.ar2);}
  const arcs=new THREE.Group();for(let k=0;k<3;k++){arcs.add(T.mesh(new THREE.TorusGeometry(hw*.86,5,6,24,Math.PI*.42),acc,[0,0,-4],[0,0,k*Math.PI*2/3],[1,1,1]));}arcs.scale.set(1,sy,1);add(arcs,M.ar1);
  M.anim.push(t=>{arcs.rotation.z=-t*.3;});
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;add(T.mesh(new THREE.SphereGeometry(3.5,8,6),T.emi(k%2?a1:a2),[Math.cos(a)*hw*.62,Math.sin(a)*hw*.62*sy,16]));}
  [-1,1].forEach(s=>em(a1,s*hw*.62,0,20,36));em(a2,0,-hw*.62*sy,20,40);add(T.glow(0xff3a8a,hh*1.4,0,0,-20,.45));M.front=40;}];

// ---------- hook into the existing renderer ----------
(function(){const orig=bossDraw;
 bossDraw=function(g,i,o){if(g===cx&&G.boss&&G.boss.i===i&&B3D.draw(g,i,o))return;return orig(g,i,o);};
 // pre-build the 3D model during the warp/intro (same queue the 2D art uses)
 const pw=prewarm;prewarm=function(bg,bi){pw(bg,bi);if(bi>=0&&BOSS_DEF[bi]&&!B3D.off)PW.q.push(()=>{if(B3D.active())B3D.build(bi);});};
 if(window.DBG)DBG.b3d=()=>B3D.info();window.B3D=B3D;})();
