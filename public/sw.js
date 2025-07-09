const CACHE_NAME = 'social-petwork-v1';
// Core files to cache.
// This list might need to be updated with static file names after a build process.
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/manifest.json',
  '/logo192.png'
];

// Install event: Create the cache and add files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Intercept requests and serve from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If it's in the cache, return from cache.
        if (response) {
          return response;
        }
        // If not in cache, request from the network.
        return fetch(event.request);
      }
    )
  );
});

// Push event: Listen for and display the push notification
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'logo192.png',
    badge: 'logo192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});