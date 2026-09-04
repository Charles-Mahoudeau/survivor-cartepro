'use client';

import { useEffect } from 'react';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
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
        className="fr-mb-3w"
      />
      <Button type="button" priority="secondary" onClick={reset}>
        {ME_CONTENT.error.retry}
      </Button>
    </div>
  );
}
