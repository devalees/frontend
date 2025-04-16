/**
 * Service Worker Module
 * 
 * Implements service worker functionality including:
 * - Service worker registration
 * - Caching strategy (cache-first with network fallback)
 * - Offline support
 * - Performance tracking
 */

// Use window.performance instead of importing from perf_hooks for easier testing
const perf = typeof window !== 'undefined' ? window.performance : global.performance;

// Constants
const CACHE_NAME = 'app-cache';
const CRITICAL_ASSETS = [
  '/index.html',
  '/offline.html',
  '/offline.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

/**
 * Register the service worker
 */
export const registerServiceWorker = async (swPath: string = '/service-worker.js'): Promise<ServiceWorkerRegistration> => {
  // Mark the start of service worker registration
  perf.mark('sw-registration-start');
  
  if (!('serviceWorker' in navigator)) {
    perf.mark('sw-unsupported');
    perf.measure('service-worker-unsupported', 'sw-registration-start', 'sw-unsupported');
    throw new Error('Service workers are not supported in this browser');
  }
  
  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service worker registered successfully:', registration.scope);
    
    // Mark performance metrics
    perf.mark('sw-registered');
    perf.measure('service-worker-registration', 'sw-registration-start', 'sw-registered');
    
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    perf.mark('sw-registration-error');
    perf.measure('service-worker-registration-error', 'sw-registration-start', 'sw-registration-error');
    throw error;
  }
};

/**
 * Check if the browser supports service workers
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Service Worker Controller
 * Handles service worker interactions from the main application
 */
export class ServiceWorkerController {
  /**
   * Fetch a resource using the service worker caching strategy
   */
  async fetch(url: string, options = {}, cacheOptions = { forceRefresh: false }): Promise<Response> {
    // Mark the start of fetch
    perf.mark(`sw-fetch-start:${url}`);
    
    try {
      // If forceRefresh is true, skip cache and go straight to network
      if (cacheOptions.forceRefresh) {
        perf.mark('sw-force-refresh');
        try {
          return await this.fetchFromNetwork(url, options);
        } catch (error) {
          // Even with force refresh, fallback to cache if network fails
          const cachedResponse = await caches.match(url);
          if (cachedResponse) {
            perf.mark('sw-force-refresh-fallback');
            return cachedResponse;
          }
          throw error;
        }
      }
      
      // Try to get the resource from cache first
      const cachedResponse = await caches.match(url);
      
      if (cachedResponse) {
        console.log(`[ServiceWorker] Found ${url} in cache`);
        perf.mark('sw-cache-hit');
        perf.measure(`sw-cache-hit:${url}`, `sw-fetch-start:${url}`, 'sw-cache-hit');
        
        // Optionally update the cache in the background
        this.updateCacheInBackground(url, options);
        
        return cachedResponse;
      }
      
      // Not in cache, mark cache miss
      console.log(`[ServiceWorker] ${url} not found in cache, fetching from network`);
      perf.mark('sw-cache-miss');
      
      return await this.fetchFromNetwork(url, options);
    } catch (error) {
      console.error(`[ServiceWorker] Error fetching ${url}:`, error);
      perf.mark('sw-fetch-error');
      perf.measure(`sw-fetch-error:${url}`, `sw-fetch-start:${url}`, 'sw-fetch-error');
      throw error;
    }
  }
  
  /**
   * Fetch from network and update cache
   */
  private async fetchFromNetwork(url: string, options = {}): Promise<Response> {
    try {
      // Fetch from network
      perf.mark('sw-network-fetch');
      const networkResponse = await fetch(url, options);
      console.log(`[ServiceWorker] Network fetch successful for ${url}`);
      
      // Clone the response since we need to use it twice: once for cache and once for return
      const responseToCache = networkResponse.clone();
      
      // Check if the response should be cached based on cache-control headers
      if (shouldCache(responseToCache)) {
        console.log(`[ServiceWorker] Caching the response for ${url}`);
        // Cache the fetch response
        const cache = await caches.open(CACHE_NAME);
        await cache.put(url, responseToCache);
        perf.mark('sw-cache-updated');
        perf.measure('sw-network-to-cache', 'sw-network-fetch', 'sw-cache-updated');
      } else {
        console.log(`[ServiceWorker] Not caching the response for ${url} due to cache control headers`);
      }
      
      return networkResponse;
    } catch (networkError) {
      console.log(`[ServiceWorker] Network fetch failed for ${url}, falling back to cache`);
      perf.mark('sw-offline-fallback');
      
      // If there's a cached version, return it even if it's stale
      const cachedResponse = await caches.match(url);
      if (cachedResponse) {
        perf.mark('sw-offline-cache-hit');
        return cachedResponse;
      }
      
      // If no cached version, try to return a fallback
      console.log(`[ServiceWorker] No cached version available for ${url}, returning offline fallback`);
      perf.mark('sw-offline-no-cache');
      
      // Try to get the offline fallback
      if (url.includes('/api/')) {
        // Handle API requests with offline data
        const fallbackResponse = await caches.match('/offline.json');
        if (fallbackResponse) {
          perf.mark('sw-offline-api-fallback');
          return fallbackResponse;
        }
      } else if (url.endsWith('.html') || url === '/' || !url.includes('.')) {
        // Handle HTML requests with offline page
        const fallbackResponse = await caches.match('/offline.html');
        if (fallbackResponse) {
          perf.mark('sw-offline-html-fallback');
          return fallbackResponse;
        }
      }
      
      // If all else fails, throw the original error
      throw networkError;
    }
  }
  
  /**
   * Update the cache in the background without blocking the response
   */
  private async updateCacheInBackground(url: string, options = {}): Promise<void> {
    // Only update if we're online
    if (navigator.onLine) {
      setTimeout(async () => {
        try {
          perf.mark(`sw-background-update-start:${url}`);
          const networkResponse = await fetch(url, options);
          
          if (shouldCache(networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(url, networkResponse);
            perf.mark(`sw-background-update-complete:${url}`);
            perf.measure(`sw-background-update:${url}`, 
                         `sw-background-update-start:${url}`, 
                         `sw-background-update-complete:${url}`);
          }
        } catch (error) {
          console.log(`[ServiceWorker] Background update failed for ${url}:`, error);
          perf.mark(`sw-background-update-fail:${url}`);
        }
      }, 1000);  // Delay by 1 second to avoid competing with current request
    }
  }
  
  /**
   * Preload critical assets into the cache
   */
  async preloadCriticalAssets(): Promise<void> {
    try {
      console.log('[ServiceWorker] Preloading critical assets');
      perf.mark('sw-preload-start');
      
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CRITICAL_ASSETS);
      
      console.log('[ServiceWorker] Preloading complete');
      perf.mark('sw-preload-complete');
      perf.measure('sw-preload-time', 'sw-preload-start', 'sw-preload-complete');
    } catch (error) {
      console.error('[ServiceWorker] Preloading failed:', error);
      perf.mark('sw-preload-error');
      perf.measure('sw-preload-error-time', 'sw-preload-start', 'sw-preload-error');
    }
  }
  
  /**
   * Clear the cache
   */
  async clearCache(): Promise<boolean> {
    try {
      console.log('[ServiceWorker] Clearing cache');
      perf.mark('sw-cache-clear-start');
      
      const cacheDeleted = await caches.delete(CACHE_NAME);
      
      if (cacheDeleted) {
        console.log('[ServiceWorker] Cache cleared successfully');
        perf.mark('sw-cache-cleared');
        perf.measure('sw-cache-clear-time', 'sw-cache-clear-start', 'sw-cache-cleared');
      } else {
        console.log('[ServiceWorker] Cache not found or could not be cleared');
        perf.mark('sw-cache-clear-notfound');
        perf.measure('sw-cache-clear-notfound-time', 'sw-cache-clear-start', 'sw-cache-clear-notfound');
      }
      
      return cacheDeleted;
    } catch (error) {
      console.error('[ServiceWorker] Error clearing cache:', error);
      perf.mark('sw-cache-clear-error');
      perf.measure('sw-cache-clear-error-time', 'sw-cache-clear-start', 'sw-cache-clear-error');
      return false;
    }
  }
  
  /**
   * Update service worker when a new version is available
   */
  async update(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('[ServiceWorker] Checking for updates');
        perf.mark('sw-update-check');
        
        await registration.update();
        
        console.log('[ServiceWorker] Update check complete');
        perf.mark('sw-update-check-complete');
        perf.measure('sw-update-check-time', 'sw-update-check', 'sw-update-check-complete');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[ServiceWorker] Update check failed:', error);
      perf.mark('sw-update-check-error');
      return false;
    }
  }
  
  /**
   * Check if a newer service worker is waiting to activate
   */
  async hasWaitingWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.waiting != null;
  }
  
  /**
   * Skip waiting and activate the new service worker
   */
  async activateUpdate(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }
      
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        console.log('[ServiceWorker] Activating waiting service worker');
        perf.mark('sw-activate-update');
        
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Return true to indicate successful message sending
        perf.mark('sw-activate-update-sent');
        perf.measure('sw-activate-update-time', 'sw-activate-update', 'sw-activate-update-sent');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[ServiceWorker] Error activating waiting service worker:', error);
      perf.mark('sw-activate-update-error');
      return false;
    }
  }
}

/**
 * Check if a response should be cached based on cache-control headers
 */
function shouldCache(response: Response): boolean {
  const cacheControl = response.headers.get('cache-control');
  
  if (!cacheControl) {
    return true; // Default to caching if no cache-control header
  }
  
  // Don't cache if no-store is set
  if (cacheControl.includes('no-store')) {
    return false;
  }
  
  // Don't cache if max-age=0 and no other directives that might allow caching
  if (cacheControl.includes('max-age=0') && !cacheControl.includes('stale-while-revalidate')) {
    return false;
  }
  
  return true;
}

/**
 * Utility functions related to caching
 */

// Check if a resource exists in cache
export const checkCacheForResource = async (cacheName: string, url: string): Promise<Response | undefined> => {
  if (!('caches' in window)) return undefined;
  
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(url);
    
    if (cachedResponse) {
      // Mark performance metrics for cache hits
      if ('performance' in window) {
        perf.mark('cache-hit');
        perf.measure('resource-from-cache', 'navigationStart', 'cache-hit');
      }
      return cachedResponse;
    }
    
    return undefined;
  } catch (error) {
    console.error('Cache check failed:', error);
    return undefined;
  }
};

// Add a resource to cache
export const addResourceToCache = async (cacheName: string, url: string): Promise<void> => {
  if (!('caches' in window)) return;
  
  try {
    perf.mark('cache-add-start');
    const cache = await caches.open(cacheName);
    const response = await fetch(url);
    await cache.put(url, response);
    
    // Mark performance metrics for cache updates
    perf.mark('cache-add-complete');
    perf.measure('cache-add-time', 'cache-add-start', 'cache-add-complete');
  } catch (error) {
    console.error('Failed to add resource to cache:', error);
    perf.mark('cache-add-error');
    perf.measure('cache-add-error-time', 'cache-add-start', 'cache-add-error');
  }
};

// Get cache size in bytes (approximate)
export const getCacheSize = async (cacheName: string): Promise<number> => {
  if (!('caches' in window)) return 0;
  
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    let totalSize = 0;
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
}; 