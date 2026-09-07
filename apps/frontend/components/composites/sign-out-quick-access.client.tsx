'use client';

import { RiLogoutBoxRLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuickAccessButton } from '@/components/composites/quick-access';
import { SITE_CONTENT } from '@/content/site';
import { authClient } from '@/lib/auth/client';

export function SignOutQuickAccess() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <QuickAccessButton
      icon={RiLogoutBoxRLine}
      onClick={signOut}
      disabled={pending}
    >
      {pending ? 'Déconnexion…' : SITE_CONTENT.signOut}
    </QuickAccessButton>
  );
}
