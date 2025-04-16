import { useEffect, useState } from 'react';
import { registerServiceWorker } from '../lib/serviceWorker';

interface ServiceWorkerRegistrationProps {
  onSuccess?: () => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Component that registers the service worker when mounted
 */
export function ServiceWorkerRegistration({
  onSuccess,
  onUpdate,
  onError
}: ServiceWorkerRegistrationProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function register() {
      try {
        const reg = await registerServiceWorker();
        setRegistration(reg || null);
        
        if (reg && onSuccess) {
          onSuccess();
        }
        
        // Check for service worker updates
        if (reg) {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, notify app
                    console.log('[ServiceWorker] New content is available; please refresh.');
                    setUpdateAvailable(true);
                    
                    if (onUpdate) {
                      onUpdate(reg);
                    }
                  } else {
                    // First time install
                    console.log('[ServiceWorker] Content is cached for offline use.');
                  }
                }
              };
            }
          };
        }
      } catch (err: any) {
        console.error('[ServiceWorker] Error during registration:', err);
        setError(err);
        
        if (onError) {
          onError(err);
        }
      }
    }
    
    register();
    
    // Add event listeners for online/offline status
    const handleOnline = () => {
      console.log('[ServiceWorker] App is online');
    };
    
    const handleOffline = () => {
      console.log('[ServiceWorker] App is offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onSuccess, onUpdate, onError]);

  return null; // This component doesn't render anything
}

/**
 * Component that shows a notification when a service worker update is available
 */
export function ServiceWorkerUpdateNotification({
  registration,
  onReload
}: {
  registration: ServiceWorkerRegistration;
  onReload?: () => void;
}) {
  const handleReload = () => {
    if (registration.waiting) {
      // Send message to waiting service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Reload the page to load updated assets
    window.location.reload();
    
    if (onReload) {
      onReload();
    }
  };
  
  return (
    <div className="sw-update-notification">
      <p>A new version of the application is available!</p>
      <button onClick={handleReload}>Reload</button>
    </div>
  );
} 