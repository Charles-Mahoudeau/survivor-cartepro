'use client';

import { RiDashboardLine } from '@remixicon/react';
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

const HOME = '/admin';

const GROUPS: SidebarGroupData[] = [
  {
    id: 'admin',
    label: 'Pilotage',
    items: [
      {
        id: 'overview',
        label: 'Tableau de bord',
        href: HOME,
        icon: <RiDashboardLine />,
      },
    ],
  },
];

export function AdminSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarBrand description="Administration" />
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
