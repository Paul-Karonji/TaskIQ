'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/register-sw';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker()
      .then((reg) => {
        if (reg) {
          console.log('[App] Service worker registered successfully');
          setRegistration(reg);
        } else {
          console.log('[App] Service worker not supported or registration failed');
        }
      })
      .catch((err) => {
        console.error('[App] Service worker registration error:', err);
        setError(err.message);
      });
  }, []);

  // Provider doesn't render anything, just registers SW
  return <>{children}</>;
}
