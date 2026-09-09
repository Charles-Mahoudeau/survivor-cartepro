'use client';

import { useEffect } from 'react';

import { SERVICE_WORKER_URL } from '@/constants/pwa';

/**
 * Registers the worker in production only: one running in development fights
 * with hot reloading. A failure is logged and otherwise ignored — the app works
 * without it.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: '/' })
      .catch((error) => {
        console.error('Service worker registration failed', error);
      });
  }, []);

  return null;
}
