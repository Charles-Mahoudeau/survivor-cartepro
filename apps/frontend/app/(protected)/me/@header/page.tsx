import { Suspense } from 'react';

import {
  SiteHeader,
  type SiteNavItem,
} from '@/components/composites/site-header.client';
import { UserQuickAccess } from '@/components/composites/user-quick-access';
import { ME_CONTENT } from '@/content/me';

export const ME_HOME = '/me';

const ITEMS: SiteNavItem[] = [
  { href: ME_HOME, label: ME_CONTENT.nav.wallet },
  { href: '/me/history', label: ME_CONTENT.nav.history },
  { href: '/me/partners', label: ME_CONTENT.nav.partners },
];

/**
 * The header chrome is static and part of the shell; only the account entry
 * reads the session, behind its own boundary, so the header never disappears
 * while the session loads.
 */
export default function Header() {
  return (
    <SiteHeader
      navigation={ITEMS}
      home={ME_HOME}
      account={
        <Suspense fallback={null}>
          <UserQuickAccess home={ME_HOME} />
        </Suspense>
      }
    />
  );
}
