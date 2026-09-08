'use client';

import { RiLogoutBoxRLine } from '@remixicon/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ComponentType, type ReactNode } from 'react';

import { Wordmark } from '@/components/composites/wordmark';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SITE_CONTENT } from '@/content/site';
import { authClient } from '@/lib/auth/client';

export interface AppSidebarItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface AppSidebarGroup {
  label: string;
  items: AppSidebarItem[];
}

export function AppSidebar({
  home,
  groups,
  account,
}: {
  home: string;
  groups: AppSidebarGroup[];
  /** The session-dependent footer entry, streamed by the caller. */
  account?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <Link
          href={home}
          title={SITE_CONTENT.homeTitle}
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2 rounded-xl p-2 transition-colors"
        >
          <Wordmark />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === home
                      ? pathname === home
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {account}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} disabled={pending}>
              <RiLogoutBoxRLine className="size-4" />
              <span>{pending ? 'Déconnexion…' : SITE_CONTENT.signOut}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
