'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { SidebarMenuButton } from '@/components/ui/sidebar';
import { SITE_CONTENT } from '@/content/site';
import { authClient } from '@/lib/auth/client';

export function SignOutMenuButton({ icon }: { icon: ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <SidebarMenuButton onClick={signOut} disabled={pending}>
      {icon}
      <span>{pending ? 'Déconnexion…' : SITE_CONTENT.signOut}</span>
    </SidebarMenuButton>
  );
}
