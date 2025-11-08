
const CACHE_NAME = 'classificador-cache-v2';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/Assets/css/style.css',
  '/Assets/js/script.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@latest/dist/mobilenet.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
