import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthShell } from '@/components/composites/auth-shell';
import { StartDsfrOnHydration } from '@/lib/dsfr';
import { LoginForm } from './login-form.client';

export const metadata: Metadata = {
  title: 'Connexion — Ticket Tout (simulation)',
};

export default function LoginPage() {
  return (
    <AuthShell
      titre="Connexion à Ticket Tout"
      sousTitre="Accédez à votre espace personnel selon votre profil."
    >
      <StartDsfrOnHydration />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
