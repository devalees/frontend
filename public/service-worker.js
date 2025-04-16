/**
 * Service Worker Implementation
 * 
 * This file implements the service worker functionality used by the application.
 * It handles installation, activation, and fetch events.
 */

// Cache name and version for cache invalidation
const CACHE_NAME = 'app-cache';
const CACHE_VERSION = 'v1';
const FULL_CACHE_NAME = `${CACHE_NAME}-${CACHE_VERSION}`;

// Assets to cache during installation
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/offline.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Installation event - cache critical assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install event');
  
  // Perform install steps - cache critical assets
  const preCache = async () => {
    try {
      const cache = await caches.open(FULL_CACHE_NAME);
      console.log('[ServiceWorker] Opened cache:', FULL_CACHE_NAME);
      
      // Cache all critical assets
      await cache.addAll(CRITICAL_ASSETS);
      console.log('[ServiceWorker] All critical assets cached');
      
      // Activate immediately without waiting for reload
      await self.skipWaiting();
      console.log('[ServiceWorker] Skip waiting - activating immediately');
    } catch (error) {
      console.error('[ServiceWorker] Pre-cache error:', error);
    }
  };
  
  event.waitUntil(preCache());
});

// Activation event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate event');
  
  // Delete old caches with different version
  const cleanCache = async () => {
    // Get all cache names
    const cacheNames = await caches.keys();
    console.log('[ServiceWorker] Existing caches:', cacheNames);
    
    // Delete old caches for this app
    const oldCaches = cacheNames.filter(name => {
      return name.startsWith(CACHE_NAME) && name !== FULL_CACHE_NAME;
    });
    
    console.log('[ServiceWorker] Deleting old caches:', oldCaches);
    await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
    
    // Claim clients to control all open pages
    await self.clients.claim();
    console.log('[ServiceWorker] Claimed all clients');
  };
  
  event.waitUntil(cleanCache());
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch event for', event.request.url);
  
  // If the request is for a different origin, don't handle it
  if (!event.request.url.startsWith(self.location.origin)) {
    console.log('[ServiceWorker] Ignoring cross-origin request:', event.request.url);
    return;
  }
  
  // Skip cache for non-GET requests
  if (event.request.method !== 'GET') {
    console.log('[ServiceWorker] Ignoring non-GET request:', event.request.method);
    return;
  }
  
  // Implement cache-first strategy with network fallback
  const handleFetch = async () => {
    try {
      // Try to get the resource from cache first
      const cachedResponse = await caches.match(event.request);
      
      if (cachedResponse) {
        console.log('[ServiceWorker] Cache hit for', event.request.url);
        
        // Return cached response but also update cache in background
        updateCacheInBackground(event.request);
        
        return cachedResponse;
      }
      
      // Not in cache, try network
      console.log('[ServiceWorker] Cache miss for', event.request.url);
      
      try {
        // Fetch from network
        const networkResponse = await fetch(event.request);
        console.log('[ServiceWorker] Network fetch successful for', event.request.url);
        
        // Cache the response if valid
        if (shouldCacheResponse(networkResponse)) {
          cacheResponse(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (networkError) {
        console.log('[ServiceWorker] Network fetch failed for', event.request.url);
        
        // If it's an HTML request, return the offline page
        if (event.request.headers.get('accept')?.includes('text/html')) {
          console.log('[ServiceWorker] Returning offline page for HTML request');
          return caches.match('/offline.html');
        }
        
        // For API requests, return offline JSON
        if (event.request.url.includes('/api/')) {
          console.log('[ServiceWorker] Returning offline data for API request');
          return caches.match('/offline.json');
        }
        
        // For other requests, throw the error
        throw networkError;
      }
    } catch (error) {
      console.error('[ServiceWorker] Fetch handler error:', error);
      
      // Return offline page as a last resort
      try {
        return await caches.match('/offline.html');
      } catch (offlineError) {
        console.error('[ServiceWorker] Failed to return offline page:', offlineError);
        throw error;
      }
    }
  };
  
  event.respondWith(handleFetch());
});

// Background sync event - sync data when back online
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push event:', event.data?.text());
  
  const options = {
    body: event.data?.text() || 'No payload',
    icon: '/icon.png',
    badge: '/badge.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click event:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper functions

/**
 * Cache a response
 */
async function cacheResponse(request, response) {
  if (!response || response.status !== 200) {
    console.log('[ServiceWorker] Not caching bad response', response?.status);
    return;
  }
  
  try {
    const cache = await caches.open(FULL_CACHE_NAME);
    console.log('[ServiceWorker] Caching', request.url);
    await cache.put(request, response);
  } catch (error) {
    console.error('[ServiceWorker] Cache error:', error);
  }
}

/**
 * Update cache in background without blocking response
 */
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (shouldCacheResponse(networkResponse)) {
      cacheResponse(request, networkResponse);
    }
  } catch (error) {
    console.error('[ServiceWorker] Background cache update failed:', error);
  }
}

/**
 * Check if response should be cached based on status and headers
 */
function shouldCacheResponse(response) {
  // Only cache successful responses
  if (!response || response.status !== 200) {
    return false;
  }
  
  // Check cache-control headers
  const cacheControl = response.headers.get('cache-control');
  
  if (cacheControl) {
    // Don't cache if no-store is set
    if (cacheControl.includes('no-store')) {
      return false;
    }
    
    // Don't cache if max-age=0 and no other directives that might allow caching
    if (cacheControl.includes('max-age=0') && !cacheControl.includes('stale-while-revalidate')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Sync data when back online
 */
async function syncData() {
  try {
    console.log('[ServiceWorker] Syncing data...');
    // Implement actual sync logic here
    
    return true;
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    return false;
  }
} 