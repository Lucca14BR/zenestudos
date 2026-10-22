// Zen Estudos: deixa o app abrir sem internet depois da primeira vez.
// A IA (Gemini) e o quadro/duelo ao vivo continuam precisando de internet.
// Fica na mesma pasta do app no site (o index.html, ou o teste-zen-estudos.html).
const CACHE = 'zen-teste-v2';
const BIBLIOTECAS = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './icon-192.png', './zen-estudos.webmanifest']).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  // só apaga caches antigos deste teste (o do app original fica como está)
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('zen-teste-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  // o app em si: tenta a versão nova primeiro e usa a guardada se estiver sem internet
  if(url.origin === location.origin){
    e.respondWith(fetch(req).then(r => {
      if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match('./'))));
    return;
  }
  // bibliotecas e fontes: usa a guardada na hora e atualiza por trás
  if(BIBLIOTECAS.includes(url.hostname)){
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(r => { if(r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })));
  }
});
