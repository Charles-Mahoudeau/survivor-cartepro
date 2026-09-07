import type { Metadata } from 'next';

import { AuthShell } from '@/components/composites/auth-shell';
import { AUTH_CONTENT } from '@/content/auth';
import { SITE_CONTENT } from '@/content/site';
import { SignUpForm } from './signup-form.client';

export const metadata: Metadata = {
  title: `Créer un compte — ${SITE_CONTENT.title}`,
};

export default function SignUpPage() {
  return (
    <AuthShell
      titre={AUTH_CONTENT.signUp.title}
      sousTitre={AUTH_CONTENT.signUp.subtitle}
    >
      <SignUpForm />
    </AuthShell>
  );
}
