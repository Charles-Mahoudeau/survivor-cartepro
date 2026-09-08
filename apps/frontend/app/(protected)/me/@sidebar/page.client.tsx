'use client';

import type { ReactNode } from 'react';

import { RiHistoryLine, RiStoreLine, RiWalletLine } from '@remixicon/react';

import {
  AppSidebar,
  type AppSidebarGroup,
} from '@/components/composites/app-sidebar';
import { ME_CONTENT } from '@/content/me';

export const ME_HOME = '/me';

const GROUPS: AppSidebarGroup[] = [
  {
    label: ME_CONTENT.roleLabel,
    items: [
      {
        id: 'wallet',
        label: ME_CONTENT.nav.wallet,
        href: ME_HOME,
        icon: RiWalletLine,
      },
      {
        id: 'history',
        label: ME_CONTENT.nav.history,
        href: '/me/history',
        icon: RiHistoryLine,
      },
      {
        id: 'partners',
        label: ME_CONTENT.nav.partners,
        href: '/me/partners',
        icon: RiStoreLine,
      },
    ],
  },
];

export default function EmployeeSidebarClient({
  account,
}: {
  account: ReactNode;
}) {
  return <AppSidebar home={ME_HOME} groups={GROUPS} account={account} />;
}
