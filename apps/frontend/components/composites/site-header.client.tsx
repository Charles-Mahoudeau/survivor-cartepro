'use client';

import { Header, HeaderQuickAccessItem } from '@codegouvfr/react-dsfr/Header';
import type { MainNavigationProps } from '@codegouvfr/react-dsfr/MainNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { SITE_CONTENT } from '@/content/site';
import { authClient } from '@/lib/auth/client';

export interface SiteNavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  /** Present on the spaces, absent on the public pages. */
  navigation?: SiteNavItem[];
  /** The home of the space, so its entry is active on the exact path only. */
  home?: string;
  user?: { name: string };
}

function isActive(pathname: string, href: string, home?: string) {
  return href === home ? pathname === home : pathname.startsWith(href);
}

function SignOutItem() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <HeaderQuickAccessItem
      quickAccessItem={{
        iconId: 'fr-icon-logout-box-r-line',
        text: pending ? 'Déconnexion…' : SITE_CONTENT.signOut,
        buttonProps: { onClick: signOut, disabled: pending },
      }}
    />
  );
}

export function SiteHeader({ navigation, home, user }: SiteHeaderProps) {
  const pathname = usePathname();

  const items: MainNavigationProps.Item[] | undefined = navigation?.map(
    ({ href, label }) => ({
      text: label,
      linkProps: { href },
      isActive: isActive(pathname, href, home),
    }),
  );

  return (
    <Header
      brandTop={SITE_CONTENT.brandTop}
      homeLinkProps={{ href: home ?? '/', title: SITE_CONTENT.homeTitle }}
      serviceTitle={SITE_CONTENT.serviceTitle}
      serviceTagline={SITE_CONTENT.serviceTagline}
      navigation={items}
      quickAccessItems={
        user
          ? [
              {
                iconId: 'fr-icon-account-circle-line',
                text: user.name,
                linkProps: { href: home ?? '/me' },
              },
              <SignOutItem key="sign-out" />,
            ]
          : [
              {
                iconId: 'fr-icon-account-circle-line',
                text: SITE_CONTENT.signIn,
                linkProps: { href: '/login' },
              },
            ]
      }
    />
  );
}
