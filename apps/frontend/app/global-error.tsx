'use client';

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { useEffect } from 'react';

import './globals.css';
import { SITE_CONTENT } from '@/content/site';

/**
 * Replaces the root layout when the shell itself fails, so it carries the
 * wordmark and the disclaimer on its own rather than inheriting them.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <main
          id="contenu"
          className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10"
        >
          <p className="font-display text-lg font-bold tracking-tight text-primary">
            {SITE_CONTENT.brand}
          </p>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
            L’application n’a pas pu s’afficher.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Une erreur est survenue au chargement. Vous pouvez réessayer.
          </p>
          <div>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-10 items-center rounded-[var(--radius-md)] border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              Réessayer
            </button>
          </div>
        </main>
        <footer className="mt-auto border-t border-border bg-card">
          <div className="mx-auto w-full max-w-5xl px-4 py-6">
            <p className="text-xs font-medium">{SITE_CONTENT.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
