# Service Worker Implementation

This document outlines how to use the service worker implementation for caching and offline support in the application.

## Features

- **Caching Strategy**: Cache-first with network fallback/update
- **Offline Support**: Fallback pages for HTML and API requests
- **Version-based Cache Management**: Automatic cache invalidation when service worker updates
- **Background Sync**: Support for syncing offline data when back online
- **Push Notifications**: Support for push notifications
- **Performance Monitoring**: Comprehensive tracking of service worker operations
- **Update Management**: Tools for managing service worker updates

## Setup and Usage

### 1. Include the Service Worker Registration Component

Add the `ServiceWorkerRegistration` component to your app's entry point:

```tsx
// src/pages/_app.tsx or src/App.tsx
import { ServiceWorkerRegistration, ServiceWorkerUpdateNotification } from '../components/ServiceWorkerRegistration';
import { useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [swUpdate, setSwUpdate] = useState<ServiceWorkerRegistration | null>(null);

  const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
    setSwUpdate(registration);
  };

  return (
    <>
      {/* Service Worker Registration */}
      <ServiceWorkerRegistration 
        onSuccess={() => console.log('Service worker registered!')}
        onUpdate={handleServiceWorkerUpdate}
        onError={(error) => console.error('Service worker registration failed:', error)}
      />
      
      {/* Update Notification */}
      {swUpdate && (
        <ServiceWorkerUpdateNotification 
          registration={swUpdate} 
          onReload={() => console.log('App updated!')}
        />
      )}
      
      {/* Main Application */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

### 2. Accessing the Service Worker Controller

You can use the `ServiceWorkerController` class to interact with the service worker:

```tsx
// src/components/YourComponent.tsx
import { useEffect, useState } from 'react';
import { ServiceWorkerController } from '../lib/serviceWorker';

export function YourComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const controller = new ServiceWorkerController();
        const response = await controller.fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### 3. Creating Offline Fallback Assets

The service worker looks for the following fallback assets:

- `/offline.html` - Fallback page for HTML requests when offline
- `/offline.json` - Fallback data for API requests when offline

Ensure these files exist in your `public` directory.

### 4. Enhanced Caching Options

The fetch method now supports additional caching options:

```tsx
// Force refresh from network (with cache fallback if network fails)
const response = await controller.fetch('/api/data', {}, { forceRefresh: true });
```

### 5. Managing Service Worker Updates

You can use the controller to manage service worker updates:

```tsx
// src/components/UpdateManager.tsx
import { useEffect, useState } from 'react';
import { ServiceWorkerController } from '../lib/serviceWorker';

export function UpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const controller = new ServiceWorkerController();

  useEffect(() => {
    async function checkForUpdates() {
      // Check for waiting worker
      const hasWaiting = await controller.hasWaitingWorker();
      setUpdateAvailable(hasWaiting);
      
      // Also trigger an update check
      await controller.update();
      
      // Check again after update check
      const hasWaitingAfterUpdate = await controller.hasWaitingWorker();
      setUpdateAvailable(hasWaitingAfterUpdate);
    }
    
    checkForUpdates();
    
    // Set up interval to check periodically
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000); // Check hourly
    
    return () => clearInterval(interval);
  }, []);
  
  const handleUpdate = async () => {
    await controller.activateUpdate();
    window.location.reload();
  };
  
  if (!updateAvailable) return null;
  
  return (
    <div className="update-notification">
      <p>A new version is available!</p>
      <button onClick={handleUpdate}>Update Now</button>
    </div>
  );
}
```

## Customization

### Customizing Cache Strategy

To customize the caching strategy, you can modify the `shouldCache` function in the `serviceWorker.ts` file.

### Customizing Critical Assets

Update the `CRITICAL_ASSETS` array in both the `serviceWorker.ts` and `service-worker.js` files to include any assets that should be cached during installation.

### Customizing Cache Versions

To force cache invalidation after an update, increment the `CACHE_VERSION` value in the `service-worker.js` file.

### Customizing Offline Experience

You can create custom offline experiences by modifying the fallback pages:

- `/public/offline.html` - HTML/visual offline experience
- `/public/offline.json` - API response format for offline data

## Checking Cache Status

You can now query cache statistics:

```tsx
import { getCacheSize } from '../lib/serviceWorker';

// Check cache size
const cacheSize = await getCacheSize('app-cache');
console.log(`Current cache size: ${(cacheSize / 1024 / 1024).toFixed(2)} MB`);
```

## Debugging

### Viewing Registered Service Workers

To view registered service workers in Chrome:
1. Navigate to `chrome://serviceworker-internals/` or `chrome://inspect/#service-workers`
2. Look for your application's service worker

### Debugging with Chrome DevTools

1. Open Chrome DevTools
2. Go to the "Application" tab
3. Look under "Service Workers" to see status and debug
4. Check the "Cache Storage" section to inspect cached resources

### Uninstalling Service Workers During Development

To uninstall service workers during development:
1. Open Chrome DevTools > Application > Service Workers
2. Click "Unregister" for your application's service worker

## Performance Metrics

The service worker implementation includes performance marks for monitoring:

### Registration Metrics
- `sw-registration-start` - Service worker registration started
- `sw-registered` - Service worker successfully registered
- `sw-registration-error` - Error during registration
- `sw-unsupported` - Service workers not supported

### Fetching Metrics
- `sw-fetch-start:[url]` - Fetch operation started for URL
- `sw-force-refresh` - Forced refresh from network
- `sw-force-refresh-fallback` - Forced refresh failed, using cache
- `sw-cache-hit` - Resource found in cache
- `sw-cache-miss` - Resource not found in cache
- `sw-network-fetch` - Fetching resource from network
- `sw-cache-updated` - Cache updated with fresh data
- `sw-fetch-error` - Error during fetch operation

### Offline Support Metrics
- `sw-offline-fallback` - Network fetch failed, falling back
- `sw-offline-cache-hit` - Using cached response during offline fallback
- `sw-offline-no-cache` - Network fetch failed, no cache available
- `sw-offline-api-fallback` - Using offline API fallback
- `sw-offline-html-fallback` - Using offline HTML fallback

### Background Updates
- `sw-background-update-start:[url]` - Background update started
- `sw-background-update-complete:[url]` - Background update completed
- `sw-background-update-fail:[url]` - Background update failed

### Cache Management
- `sw-preload-start` - Preloading critical assets started
- `sw-preload-complete` - Preloading critical assets completed
- `sw-preload-error` - Error during preloading
- `sw-cache-clear-start` - Cache clearing started
- `sw-cache-cleared` - Cache successfully cleared
- `sw-cache-clear-notfound` - Cache not found during clearing
- `sw-cache-clear-error` - Error during cache clearing

### Update Management
- `sw-update-check` - Update check started
- `sw-update-check-complete` - Update check completed
- `sw-update-check-error` - Error during update check
- `sw-activate-update` - Activation of waiting worker started
- `sw-activate-update-sent` - Message sent to activate waiting worker
- `sw-activate-update-error` - Error during waiting worker activation

## Browser Support

Service workers are supported in all modern browsers, including:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+
- Opera 27+

For a detailed browser support table, see [Can I Use: Service Workers](https://caniuse.com/#feat=serviceworkers).

## Resources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google Developers: Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Workbox: JavaScript Libraries for Service Workers](https://developers.google.com/web/tools/workbox) 