// Service Worker - Ecarr PWA
var CACHE_NAME = 'ecarr-v1';
var STATIC_ASSETS = [
  '/',
  '/formulario',
  '/despiece'
];

// Install - cache static assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE_NAME;})
            .map(function(k){return caches.delete(k);})
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', function(e){
  // Skip non-GET and Supabase requests
  if(e.request.method!=='GET') return;
  if(e.request.url.indexOf('supabase.co')!==-1) return;
  if(e.request.url.indexOf('googleapis.com')!==-1) return;

  e.respondWith(
    fetch(e.request).then(function(response){
      // Cache successful responses for static assets
      if(response.ok){
        var clone=response.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function(){
      // Offline fallback
      return caches.match(e.request).then(function(cached){
        return cached || caches.match('/');
      });
    })
  );
});
