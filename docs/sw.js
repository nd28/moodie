const CACHE_NAME = 'moodie-v2';
const SHELL_URLS = [
  '/moodie/',
  '/moodie/index.html',
  '/moodie/manifest.json',
  '/moodie/icons/icon-192.png',
  '/moodie/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname === 'api.github.com') {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        fetch(event.request).then(r => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, r));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return r;
      });
    }).catch(() => new Response('Offline', { status: 503 }))
  );
});
