import {
  SiteHeader,
  type SiteNavItem,
} from '@/components/composites/site-header.client';
import { ME_CONTENT } from '@/content/me';
import { getCurrentUser } from '@/lib/auth/session';

export const ME_HOME = '/me';

const ITEMS: SiteNavItem[] = [
  { href: ME_HOME, label: ME_CONTENT.nav.wallet },
  { href: '/me/history', label: ME_CONTENT.nav.history },
  { href: '/me/partners', label: ME_CONTENT.nav.partners },
];

/** Reads the session on its own and streams independently of the page. */
export default async function Header() {
  const user = await getCurrentUser();

  return (
    <SiteHeader
      navigation={ITEMS}
      home={ME_HOME}
      user={user ? { name: user.name } : undefined}
    />
  );
}
