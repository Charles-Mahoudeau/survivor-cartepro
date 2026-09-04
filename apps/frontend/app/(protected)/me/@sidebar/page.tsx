import { IconHistory, IconMap, IconWallet } from '@/components/icons';
import { DashboardChrome } from '@/components/composites/sidebar/shell';
import type { NavItem } from '@/components/composites/sidebar/nav-items';
import { ME_CONTENT } from '@/content/me';
import { getCurrentUser } from '@/lib/auth/session';

export const ME_HOME = '/me';

const ITEMS: NavItem[] = [
  {
    href: ME_HOME,
    label: ME_CONTENT.nav.wallet,
    shortLabel: ME_CONTENT.mobileNav.wallet,
    icon: <IconWallet />,
  },
  {
    href: '/me/history',
    label: ME_CONTENT.nav.history,
    shortLabel: ME_CONTENT.mobileNav.history,
    icon: <IconHistory />,
  },
  {
    href: '/me/partners',
    label: ME_CONTENT.nav.partners,
    shortLabel: ME_CONTENT.mobileNav.partners,
    icon: <IconMap />,
  },
];

export default async function Sidebar() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <DashboardChrome
      items={ITEMS}
      home={ME_HOME}
      user={{ name: user.name, roleLabel: ME_CONTENT.roleLabel }}
    />
  );
}
