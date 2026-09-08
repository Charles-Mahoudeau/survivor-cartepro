'use client';

import { RiStoreLine, RiWalletLine } from '@remixicon/react';
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

const HOME = '/me';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'compte',
    label: 'Compte',
    items: [
      {
        id: 'wallet',
        label: 'Mon compte',
        href: '/me',
        icon: <RiWalletLine />,
        subItems: [{ id: 'history', label: 'Historique', href: '/me/history' }],
      },
      {
        id: 'partners',
        label: 'Partenaires',
        href: '/me/partners',
        icon: <RiStoreLine />,
      },
    ],
  },
];

export default function EmployeeSidebarClient({
  account,
}: {
  account: ReactNode;
}) {
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
