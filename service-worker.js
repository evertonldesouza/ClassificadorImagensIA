const CACHE_VERSION = 'v4';
const CACHE_STATIC  = `classificador-static-${CACHE_VERSION}`;
const CACHE_MODELS  = `classificador-models-${CACHE_VERSION}`;

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Assets/css/style.css',
  '/Assets/js/script.js',
];

const CDN_FILES = [
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then((cache) =>
        cache.addAll(STATIC_FILES).catch((err) =>
          console.warn('[SW] Falha ao cachear estáticos:', err)
        )
      ),
      caches.open(CACHE_MODELS).then((cache) =>
        cache.addAll(CDN_FILES).catch((err) =>
          console.warn('[SW] Falha ao cachear CDNs:', err)
        )
      ),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const CACHES_VALIDOS = [CACHE_STATIC, CACHE_MODELS];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !CACHES_VALIDOS.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => {
      self.clients.claim();
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (event.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension://')) return;

  if (isModelWeight(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_MODELS));
    return;
  }

  if (isCDN(url)) {
    event.respondWith(modelWeightFirst(event.request, CACHE_MODELS));
    return;
  }

  event.respondWith(networkFirst(event.request, CACHE_STATIC));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso indisponível offline.', { status: 503 });
  }
}

async function modelWeightFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return fetch(request);
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Você está offline e este recurso não está em cache.', { status: 503 });
  }
}

function isCDN(url) {
  return url.includes('cdn.jsdelivr.net') ||
         url.includes('unpkg.com') ||
         url.includes('cdnjs.cloudflare.com');
}

function isModelWeight(url) {
  return url.includes('storage.googleapis.com') ||
         url.includes('tfhub.dev') ||
         /\.(bin|pb)(\?|$)/.test(url) ||
         url.includes('model.json') ||
         url.includes('group1-shard');
}
