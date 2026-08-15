const CACHE_NAME = 'moodie-v3';
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
    (async () => {
      if (event.request.mode === 'navigate') {
        try {
          const fresh = await fetch(event.request);
          if (fresh.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, fresh.clone());
            return fresh;
          }
          return (await caches.match(event.request)) || fresh;
        } catch (err) {
          return (await caches.match(event.request)) || new Response('Offline', { status: 503 });
        }
      }
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const res = await fetch(event.request);
      if (res.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, res.clone());
      }
      return res;
    })()
  );
});
