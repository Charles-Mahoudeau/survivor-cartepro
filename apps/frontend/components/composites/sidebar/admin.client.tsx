'use client';

import {
  RiDashboardLine,
  RiExchangeLine,
  RiHandCoinLine,
  RiInboxLine,
  RiUserSettingsLine,
} from '@remixicon/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { BottomNav } from '@/components/composites/bottom-nav.client';
import { SidebarBrand } from '@/components/composites/sidebar/brand';
import {
  Sidebar,
  SidebarBuildContent,
  SidebarFooter,
  SidebarHeader,
  type SidebarGroupData,
} from '@/components/ui/sidebar';
import { ADMIN_CONTENT } from '@/content/admin';

const HOME = '/admin';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'admin',
    label: ADMIN_CONTENT.nav.group,
    items: [
      {
        id: 'overview',
        label: ADMIN_CONTENT.nav.overview,
        href: HOME,
        icon: <RiDashboardLine />,
      },
      {
        id: 'applications',
        label: ADMIN_CONTENT.nav.applications,
        href: '/admin/partners',
        icon: <RiInboxLine />,
      },
      {
        id: 'allocations',
        label: ADMIN_CONTENT.nav.allocations,
        href: '/admin/allocations',
        icon: <RiHandCoinLine />,
      },
      {
        id: 'accounts',
        label: ADMIN_CONTENT.nav.accounts,
        href: '/admin/accounts',
        icon: <RiUserSettingsLine />,
      },
      {
        id: 'payments',
        label: ADMIN_CONTENT.nav.payments,
        href: '/admin/payments',
        icon: <RiExchangeLine />,
      },
    ],
  },
];

export function AdminSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === HOME ? pathname === HOME : pathname.startsWith(href);

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarBrand description={ADMIN_CONTENT.roleLabel} />
        </SidebarHeader>
        <SidebarBuildContent sidebarGroups={GROUPS} isActive={isActive} />
        <SidebarFooter>{account}</SidebarFooter>
      </Sidebar>
      <BottomNav groups={GROUPS} isActive={isActive} />
    </>
  );
}
