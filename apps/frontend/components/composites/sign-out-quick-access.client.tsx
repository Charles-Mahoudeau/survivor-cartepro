'use client';

import { HeaderQuickAccessItem } from '@codegouvfr/react-dsfr/Header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    <HeaderQuickAccessItem
      quickAccessItem={{
        iconId: 'fr-icon-logout-box-r-line',
        text: pending ? 'Déconnexion…' : SITE_CONTENT.signOut,
        buttonProps: { onClick: signOut, disabled: pending },
      }}
    />
  );
}
