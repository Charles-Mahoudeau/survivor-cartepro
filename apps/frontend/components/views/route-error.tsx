'use client';

import { useEffect } from 'react';

import { Card } from '@/components/composites/card';
import { ME_CONTENT } from '@/content/me';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <Card className="p-6">
        <h2 className="mb-2 font-display text-base font-semibold text-[color:var(--foreground)]">
          {ME_CONTENT.error.title}
        </h2>
        <p className="mb-4 font-serif text-sm text-[color:var(--muted-foreground)]">
          {ME_CONTENT.error.body}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded border-2 border-[color:var(--primary)] px-4 py-2 font-display text-sm font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--secondary)]"
        >
          {ME_CONTENT.error.retry}
        </button>
      </Card>
    </div>
  );
}
