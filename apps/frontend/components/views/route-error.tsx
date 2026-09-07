'use client';

import { useEffect } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
      <Alert
        severity="error"
        title={ME_CONTENT.error.title}
        description={ME_CONTENT.error.body}
        className="mb-6"
      />
      <Button type="button" variant="outline" size="lg" onClick={reset}>
        {ME_CONTENT.error.retry}
      </Button>
    </div>
  );
}
