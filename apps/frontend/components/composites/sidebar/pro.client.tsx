'use client';

import {
  RiBuildingLine,
  RiCashLine,
  RiMapPin2Line,
  RiStoreLine,
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
import { PRO_CONTENT } from '@/content/pro';

const HOME = '/pro';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'pro',
    label: PRO_CONTENT.nav.group,
    items: [
      {
        id: 'overview',
        label: PRO_CONTENT.nav.overview,
        href: HOME,
        icon: <RiStoreLine />,
      },
      {
        id: 'collect',
        label: PRO_CONTENT.nav.collect,
        href: '/pro/collect',
        icon: <RiCashLine />,
      },
      {
        id: 'partners',
        label: PRO_CONTENT.nav.partners,
        href: '/pro/partners',
        icon: <RiMapPin2Line />,
      },
      {
        id: 'account',
        label: PRO_CONTENT.nav.account,
        href: '/pro/account',
        icon: <RiBuildingLine />,
      },
    ],
  },
];

export function ProSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === HOME ? pathname === HOME : pathname.startsWith(href);

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarBrand description={PRO_CONTENT.roleLabel} />
        </SidebarHeader>
        <SidebarBuildContent sidebarGroups={GROUPS} isActive={isActive} />
        <SidebarFooter>{account}</SidebarFooter>
      </Sidebar>
      <BottomNav groups={GROUPS} isActive={isActive} />
    </>
  );
}
