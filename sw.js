// 오프라인 지원: 앱 파일은 인터넷이 되면 최신으로 받고, 안 되면 저장해 둔 것을 사용
const CACHE='fridge-v1';
const APP=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
const req=e.request;if(req.method!=='GET')return;
const url=new URL(req.url);
// 글꼴(구글 폰트): 한 번 받으면 저장해 두고 재사용
if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{c.put(req,res.clone());return res}))));
return;
}
if(url.origin!==location.origin)return;
// 앱 파일: 네트워크 우선 → 실패하면 저장본
e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});
