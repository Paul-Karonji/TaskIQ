'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check if running as PWA on iOS
      const isIOSPWA = (window.navigator as any).standalone === true;

      setIsInstalled(isStandalone || isIOSPWA);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent the default prompt
      event.preventDefault();
      // Store the event for later use
      setDeferredPrompt(event);

      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedDate = dismissed ? new Date(dismissed) : null;
      const daysSinceDismissed = dismissedDate
        ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      // Show prompt if not dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        // Show after 30 seconds to not be annoying
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-green-200 dark:border-green-900 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Install DueSync
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Install DueSync on your device for quick access, offline support, and a native app experience.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              Works offline with cached data
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              Faster load times and performance
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              Native app-like experience
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
