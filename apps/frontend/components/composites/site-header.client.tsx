'use client';

import { Header } from '@codegouvfr/react-dsfr/Header';
import type { MainNavigationProps } from '@codegouvfr/react-dsfr/MainNavigation';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import { SITE_CONTENT } from '@/content/site';

export interface SiteNavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  /** Present on the spaces, absent on the public pages. */
  navigation?: SiteNavItem[];
  /** The home of the space, so its entry is active on the exact path only. */
  home?: string;
  /** Session-dependent quick access items, streamed by the caller. */
  account?: ReactElement;
}

function isActive(pathname: string, href: string, home?: string) {
  return href === home ? pathname === home : pathname.startsWith(href);
}

export function SiteHeader({ navigation, home, account }: SiteHeaderProps) {
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
        account
          ? [account]
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
