'use client';

import { RiCashLine, RiMapPin2Line, RiStoreLine } from '@remixicon/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

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
    ],
  },
];

export function ProSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarBrand description={PRO_CONTENT.roleLabel} />
      </SidebarHeader>
      <SidebarBuildContent
        sidebarGroups={GROUPS}
        isActive={(href) =>
          href === HOME ? pathname === HOME : pathname.startsWith(href)
        }
      />
      <SidebarFooter>{account}</SidebarFooter>
    </Sidebar>
  );
}
