'use client';

import { RiStoreLine } from '@remixicon/react';
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

const HOME = '/pro';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'etablissement',
    label: 'Établissement',
    items: [
      {
        id: 'overview',
        label: 'Tableau de bord',
        href: '/pro',
        icon: <RiStoreLine />,
      },
    ],
  },
];

export default function ProSidebarClient({ account }: { account: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarBrand description="Espace partenaire" />
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
