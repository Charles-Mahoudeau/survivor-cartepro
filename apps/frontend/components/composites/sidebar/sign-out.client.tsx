'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { IconLogout } from '@/components/icons';
import { ME_CONTENT } from '@/content/me';
import { authClient } from '@/lib/auth/client';

export function SidebarSignOut({ variant }: { variant: 'sidebar' | 'header' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        aria-label={ME_CONTENT.signOut}
        className="flex items-center gap-1.5 rounded px-2 py-1 font-display text-xs text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--muted)] hover:text-[color:var(--accent)] disabled:opacity-50"
      >
        <IconLogout className="h-4 w-4" />
        <span className="hidden xs:inline">{ME_CONTENT.signOutShort}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="flex w-full items-center gap-2 py-1 text-left font-display text-xs text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--accent)] disabled:opacity-50"
    >
      <IconLogout />
      {pending ? 'Déconnexion…' : ME_CONTENT.signOut}
    </button>
  );
}
