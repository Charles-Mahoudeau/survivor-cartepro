'use client';

import { RiDashboardLine, RiInboxLine } from '@remixicon/react';
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
    ],
  },
];

export function AdminSidebar({ account }: { account: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarBrand description={ADMIN_CONTENT.roleLabel} />
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
