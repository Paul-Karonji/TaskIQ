// Service Worker Registration Utility

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW Registration] Service workers are not supported');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW Registration] Service worker registered successfully:', registration.scope);

    // Check for updates periodically
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW Registration] New service worker found, installing...');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('[SW Registration] Service worker state changed:', newWorker.state);

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker installed, but old one is still controlling
            console.log('[SW Registration] New service worker installed, waiting to activate');
            // Optionally notify user about update
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[SW Registration] Service worker registration failed:', error);
    return null;
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW Registration] Service worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[SW Registration] Error unregistering service worker:', error);
    return false;
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error('[SW Registration] Error getting service worker registration:', error);
    return null;
  }
}
