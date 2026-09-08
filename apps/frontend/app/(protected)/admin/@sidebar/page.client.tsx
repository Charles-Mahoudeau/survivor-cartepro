'use client';

import type { ReactNode } from 'react';

import { RiDashboardLine } from '@remixicon/react';

import {
  AppSidebar,
  type AppSidebarGroup,
} from '@/components/composites/app-sidebar';

const HOME = '/admin';

const GROUPS: AppSidebarGroup[] = [
  {
    label: 'Administration',
    items: [
      {
        id: 'overview',
        label: 'Tableau de bord',
        href: '/admin',
        icon: RiDashboardLine,
      },
    ],
  },
];

export default function AdminSidebarClient({
  account,
}: {
  account: ReactNode;
}) {
  return <AppSidebar home={HOME} groups={GROUPS} account={account} />;
}
