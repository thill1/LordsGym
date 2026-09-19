// Service Worker for Lord's Gym - Offline Support
// Increment version number when deploying to force cache invalidation
const CACHE_VERSION = 'lords-gym-v6';
const CACHE_NAME = CACHE_VERSION;
// Get base path from scope (e.g., '/LordsGym/' or '/')
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '') || '/';

// Install event - skip waiting to activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('lords-gym-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Network First strategy for fresh content
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  // Runtime config and auth responses must never be served from an offline cache.
  if (url.pathname.startsWith('/api/')) return;
  const isNavigation = event.request.mode === 'navigate';
  const isHTML = event.request.headers.get('accept')?.includes('text/html');
  const isAsset = url.pathname.includes('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  // For HTML/navigation requests: Network First (always get fresh content)
  if (isNavigation || isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network succeeds, cache and return
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request).then(async (cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Direct routes may not have been cached, but the root page may be.
            if (isNavigation) {
              const fallback = await caches.match(BASE_PATH) || await caches.match(`${BASE_PATH}index.html`);
              if (fallback) return fallback;
            }
            return new Response('Lord’s Gym is temporarily offline. Please reconnect and try again.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          });
        })
    );
    return;
  }

  // For static assets (JS/CSS with hashes): Cache First (they're already versioned)
  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, fetch from network and cache
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For other requests: Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) =>
          cachedResponse || new Response('Offline', { status: 503 })
        );
      })
  );
});
