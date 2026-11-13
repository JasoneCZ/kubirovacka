/* Kubírovačka – offline režim. Při každém otevření se v pozadí stáhne nová verze, použije se při dalším spuštění. */
const CACHE="kubirovacka-v1";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==self.location.origin)return;
  const net=fetch(r).then(async res=>{
    if(res&&res.ok&&res.type==="basic"){const copy=res.clone();const c=await caches.open(CACHE);await c.put(r,copy);}
    return res;
  }).catch(()=>null);
  e.waitUntil(net.then(()=>{}));
  e.respondWith(
    caches.match(r,{ignoreSearch:true})
      .then(hit=>hit||net.then(res=>res||(r.mode==="navigate"?caches.match("./index.html"):null)))
      .then(res=>res||new Response("Offline",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}}))
  );
});
