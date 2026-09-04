import type { Metadata } from 'next';

import { AuthShell } from '@/components/composites/auth-shell';
import { AUTH_CONTENT } from '@/content/auth';
import { StartDsfrOnHydration } from '@/lib/dsfr';
import { SignUpForm } from './signup-form.client';

export const metadata: Metadata = {
  title: 'Créer un compte — Ticket Tout (simulation)',
};

export default function SignUpPage() {
  return (
    <AuthShell
      titre={AUTH_CONTENT.signUp.title}
      sousTitre={AUTH_CONTENT.signUp.subtitle}
    >
      <StartDsfrOnHydration />
      <SignUpForm />
    </AuthShell>
  );
}
