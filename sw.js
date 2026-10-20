// Zen Estudos: deixa o app abrir sem internet quando ele está publicado num site (https).
// Fica junto do index.html. A IA (Gemini) e o estudo ao vivo continuam precisando de internet.
const CACHE = 'zen-estudos-v1';

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(['./', './index.html']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  // o app em si: tenta a versão nova primeiro, e usa a guardada se estiver sem internet
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ const copy = r.clone(); caches.open(CACHE).then(c=> c.put(req, copy)); return r; }).catch(()=> caches.match(req).then(r=> r || caches.match('./index.html'))));
    return;
  }
  // bibliotecas (diagramas, fórmulas, gráficos…): guardadas depois da primeira vez
  if(url.hostname==='cdn.jsdelivr.net'){
    e.respondWith(caches.match(req).then(hit=> hit || fetch(req).then(r=>{ const copy = r.clone(); caches.open(CACHE).then(c=> c.put(req, copy)); return r; })));
  }
});
