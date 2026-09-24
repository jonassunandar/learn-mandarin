/* Offline shell is public; authenticated API requests are never cached. */
const CACHE='hanzi100-2d8bc95fa1f1c033d77a';
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(['/','/practice','/words','/progress','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png']);self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('hanzi100-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();const cache=await caches.open(CACHE);try{const assets=await (await fetch('/offline-assets.json')).json();for(let i=0;i<assets.length;i+=6)await Promise.allSettled(assets.slice(i,i+6).map(url=>cache.add(url)));}catch{}const pages=['/','/practice','/words','/progress'];for(const url of pages){const response=await cache.match(url);if(!response)continue;const html=await response.text();const resources=[...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g)].map(m=>m[1]).filter(u=>u.startsWith('/_next/'));await Promise.allSettled(resources.map(u=>cache.add(u)));}})());});
self.addEventListener('fetch',event=>{const req=event.request;const url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/sw.js')return;
// Next RSC payloads must never be confused with cached HTML documents.
if(req.headers.get('RSC')==='1'||url.searchParams.has('_rsc'))return;
event.respondWith((async()=>{const cache=await caches.open(CACHE);if(req.mode==='navigate'){try{const result=await fetch(req);if(result.ok)await cache.put(url.pathname,result.clone());return result;}catch{return await cache.match(url.pathname)||await cache.match('/')||Response.error();}}const saved=await cache.match(req);if(saved){
  // Safari and other mobile players request byte ranges, including when offline.
  const range=req.headers.get('range');
  if(range&&url.pathname.endsWith('.wav')){
    const bytes=await saved.arrayBuffer(); const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
    const start=match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]));
    const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
    if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
    return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/wav','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Accept-Ranges':'bytes'}});
  }
  return saved;
}const result=await fetch(req);if(result.ok&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/hanzi/')||url.pathname.startsWith('/icons/')||url.pathname.startsWith('/bopomofo/')))await cache.put(req,result.clone());return result;})());});
