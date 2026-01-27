// Service Worker for Lord's Gym - Offline Support
// Increment version number when deploying to force cache invalidation
const CACHE_VERSION = 'lords-gym-v3';
const CACHE_NAME = CACHE_VERSION;
// Get base path from scope (e.g., '/LordsGym/' or '/')
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '') || '/';

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache:', CACHE_NAME);
  // Skip waiting so new service worker activates immediately
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating, clearing old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL old caches (not just ones that don't match current name)
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('lords-gym-'))
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
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
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, try to return index.html for navigation
            if (isNavigation) {
              return caches.match(`${BASE_PATH}index.html`).catch(() => null);
            }
            return new Response('Offline', { status: 503 });
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
        return caches.match(event.request);
      })
  );
});
