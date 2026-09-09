/// <reference lib="webworker" />

import { NetworkOnly, Serwist } from 'serwist';

import { PWA_OFFLINE_URL } from '@/constants/pwa';
import type {
  PrecacheEntry,
  RouteHandlerCallback,
  SerwistGlobalConfig,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Session and money. Never read from a cache, never written to one — a balance
 * the backend has not confirmed must never reach the screen.
 */
const NEVER_CACHED = ['/api/', '/auth/'];

/**
 * Documents always go to the network: their HTML carries amounts. On failure
 * the worker redirects instead of serving the offline document under the
 * requested URL — the App Router would otherwise hydrate, find the page it was
 * handed does not match the URL, fetch the route it actually wants, fail, and
 * swap in its own error document.
 */
const respondToNavigation: RouteHandlerCallback = async ({
  request,
  event,
}) => {
  try {
    const preloaded = (await (event as FetchEvent).preloadResponse) as
      Response | undefined;
    return preloaded ?? (await fetch(request));
  } catch {
    if (new URL(request.url).pathname !== PWA_OFFLINE_URL) {
      return Response.redirect(
        new URL(PWA_OFFLINE_URL, self.location.origin).href,
        302,
      );
    }
    return (await serwist.matchPrecache(PWA_OFFLINE_URL)) ?? Response.error();
  }
};

const serwist = new Serwist({
  /**
   * Built from the real build output, so the offline page and its own chunks
   * are cached before anyone has ever visited it. Caching them opportunistically
   * did not work: a route nobody opens while online has no assets, and the page
   * cannot hydrate.
   */
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        NEVER_CACHED.some((prefix) => url.pathname.startsWith(prefix)),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: respondToNavigation,
    },
  ],
});

serwist.addEventListeners();
