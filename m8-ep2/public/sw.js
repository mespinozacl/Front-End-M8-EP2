const CACHE_NAME = "pwa-cache-v3"; // Incrementa la versión de la caché
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/src/index.css", // Ruta a tu archivo CSS principal
  "/src/main.tsx",   // Ruta a tu archivo JS principal
  "/icons/icon-192x192.png",   // Ruta a tus iconos
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting(); // Fuerza la activación inmediata del nuevo Service Worker
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
  
    if (event.request.mode === "navigate") {
      // Estrategia StaleWhileRevalidate para páginas HTML
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    } else if (/\.(css|js|png|jpg|jpeg|svg)$/.test(url.pathname)) {
      // Estrategia CacheFirst para archivos estáticos
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          });
        })
      );
    } else if (url.pathname.startsWith("/api/")) {
      // Estrategia NetworkFirst para datos dinámicos (API)
      event.respondWith(
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => {
          return caches.match(event.request);
        })
      );
    } else {
      // Para otras solicitudes, utiliza la estrategia CacheFirst por defecto
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
    self.clients.claim(); // Toma el control de todas las pestañas abiertas
  });