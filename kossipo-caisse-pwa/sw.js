/* Service worker : la caisse démarre et fonctionne sans connexion. */
const CACHE = 'kossipo-v2';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FICHIERS.map((f) => c.add(f).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Réseau d'abord, cache en secours : une mise à jour en ligne est prise au rechargement.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie)).catch(() => {}); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))),
  );
});
