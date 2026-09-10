import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { AuthShell } from '@/components/composites/auth-shell';
import { AUTH_CONTENT } from '@/content/auth';
import { SITE_CONTENT } from '@/content/site';
import { listPartnerCategoriesHook } from '@/hooks/api';
import { ROLES } from '@/lib/auth/constants';
import { roleHome } from '@/lib/auth/guard';
import { getCurrentUser } from '@/lib/auth/session';

import { PartnerSignUpForm } from './partner-signup-form.client';

export const metadata: Metadata = {
  title: `${AUTH_CONTENT.partnerSignUp.title} — ${SITE_CONTENT.title}`,
};

export default function PartnerSignUpPage() {
  return (
    <AuthShell
      titre={AUTH_CONTENT.partnerSignUp.title}
      sousTitre={AUTH_CONTENT.partnerSignUp.subtitle}
    >
      <Suspense fallback={null}>
        <Registration />
      </Suspense>
    </AuthShell>
  );
}

async function Registration() {
  // Keeps this boundary out of the static shell: otherwise the build tries
  // to prerender it and eagerly runs the cached categories fetch offline.
  await connection();

  const [user, categories] = await Promise.all([
    getCurrentUser(),
    listPartnerCategoriesHook(),
  ]);

  if (user && user.role !== ROLES.EMPLOYEE) {
    redirect(roleHome(user.role));
  }

  return (
    <PartnerSignUpForm
      categories={categories}
      signedInEmail={user?.email ?? null}
    />
  );
}
