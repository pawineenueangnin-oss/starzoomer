// Starzoomer service worker. v29: one version constant; only the known asset list is cached; query strings ignored; old caches deleted.
const GAME_VERSION='29c';
const C='starzoomer-v'+GAME_VERSION;
const F=['./','index.html','style.css','i18n.js','core.js','art.js','bossart.js','game.js','gfx.js','mapart.js','enemyart.js','ui.js','extras.js','weapons.js','warp.js','special.js','three.min.js','boss3d.js','v29.js','privacy.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','studio-logo.png','apple-touch-icon.png','favicon-32.png','favicon-48.png','fonts/ps2p.ttf'];
const KNOWN=new Set(F.map(f=>new URL(f,self.registration.scope).href));
const key=req=>{const u=new URL(req.url);u.search='';u.hash='';return u.href;};
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('starzoomer')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
// network-first for known assets (new builds show up), cache fallback offline; unknown URLs are never cached
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const k=key(r);if(!KNOWN.has(k))return;
 e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(k,cp));}return res;}).catch(()=>caches.match(k).then(m=>m||caches.match(r,{ignoreSearch:true}))));});
