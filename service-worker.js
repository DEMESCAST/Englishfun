const CACHE_NAME = 'english-fun-v59';
const urlsToCache = [
    './',
    './index.html',
    './index-city.html',
    './auth.js',
    './player.js',
    './game.js?v=20260820-1',
    './conversation.js',
    './vocab.js?v=20260818-1',
    './manifest.json',
    './assets/landing/arthur-v2.png',
    './henrique.png',
    './bg-music.mp3',
    './foto-criadores.jpg',
    './city-map.png',
    './assets/tela-inicial.webp',
    './assets/landing/city-background-desktop-v2.png',
    './assets/landing/city-background-mobile-v2.png',
    './assets/landing/english-fun-logo.png',
    './assets/landing/henrique.png',
    './assets/game-menu/game-menu-background-desktop.png',
    './assets/game-menu/game-menu-background-mobile.png',
    './assets/game-menu/arthur-open-eyes.png',
    './assets/game-menu/henrique.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(
                names.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first para HTML e service worker
    if (event.request.method === 'GET' &&
        (url.pathname.endsWith('.html') ||
         url.pathname === './' ||
         url.pathname.endsWith('/') ||
         url.pathname.endsWith('service-worker.js'))) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first para outros recursos (imagens, CSS, JS do jogo)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
    );
});
