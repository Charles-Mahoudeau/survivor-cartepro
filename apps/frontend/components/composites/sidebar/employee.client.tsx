'use client';

import { RiQrCodeLine, RiStoreLine, RiWalletLine } from '@remixicon/react';
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
import { ME_CONTENT } from '@/content/me';

const HOME = '/me';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'compte',
    label: ME_CONTENT.roleLabel,
    items: [
      {
        id: 'wallet',
        label: ME_CONTENT.nav.wallet,
        href: HOME,
        icon: <RiWalletLine />,
        subItems: [
          {
            id: 'history',
            label: ME_CONTENT.nav.history,
            href: '/me/history',
          },
        ],
      },
      {
        id: 'pay',
        label: ME_CONTENT.nav.pay,
        href: '/me/pay',
        icon: <RiQrCodeLine />,
      },
      {
        id: 'partners',
        label: ME_CONTENT.nav.partners,
        href: '/me/partners',
        icon: <RiStoreLine />,
      },
    ],
  },
];

export function EmployeeSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarBrand description="Espace salarié" />
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
