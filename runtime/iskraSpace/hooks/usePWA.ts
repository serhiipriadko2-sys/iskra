import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAState {
  canInstall: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  updateReady: boolean;
  install: () => Promise<boolean>;
  activateUpdate: () => void;
}

function isStandaloneDisplay(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export function usePWA(): PWAState {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsStandalone(isStandaloneDisplay());
    setIsOnline(window.navigator.onLine);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting) {
          setUpdateReady(true);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) {
            return;
          }

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        setUpdateReady(false);
      });
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) {
      return false;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    return choice.outcome === 'accepted';
  }, [installPrompt]);

  const activateUpdate = useCallback(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        registration.waiting?.postMessage('skipWaiting');
        window.location.reload();
      })
      .catch(() => undefined);
  }, []);

  return {
    canInstall: Boolean(installPrompt) && !isStandalone,
    isStandalone,
    isOnline,
    updateReady,
    install,
    activateUpdate,
  };
}
