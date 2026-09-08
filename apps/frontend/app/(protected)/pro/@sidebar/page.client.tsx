'use client';

import type { ReactNode } from 'react';

import { RiStoreLine } from '@remixicon/react';

import {
  AppSidebar,
  type AppSidebarGroup,
} from '@/components/composites/app-sidebar';

const HOME = '/pro';

const GROUPS: AppSidebarGroup[] = [
  {
    label: 'Partenaire',
    items: [
      {
        id: 'overview',
        label: 'Tableau de bord',
        href: '/pro',
        icon: RiStoreLine,
      },
    ],
  },
];

export default function ProSidebarClient({ account }: { account: ReactNode }) {
  return <AppSidebar home={HOME} groups={GROUPS} account={account} />;
}
