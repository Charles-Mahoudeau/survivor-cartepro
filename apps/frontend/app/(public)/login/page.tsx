import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthShell } from '@/components/composites/auth-shell';
import { AUTH_CONTENT } from '@/content/auth';
import { SITE_CONTENT } from '@/content/site';
import { LoginForm } from './login-form.client';

export const metadata: Metadata = {
  title: `Connexion — ${SITE_CONTENT.title}`,
};

export default function LoginPage() {
  return (
    <AuthShell
      titre={AUTH_CONTENT.signIn.title}
      sousTitre={AUTH_CONTENT.signIn.subtitle}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
