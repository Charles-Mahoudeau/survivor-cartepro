'use client';

import { RiAccountCircleLine, RiCloseLine, RiMenuLine } from '@remixicon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactElement } from 'react';

import { QuickAccessLink } from '@/components/composites/quick-access';
import { SITE_CONTENT } from '@/content/site';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);

  const links = navigation?.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(pathname, href, home) ? 'page' : undefined}
      className={cn(
        'rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors',
        isActive(pathname, href, home)
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          href={home ?? '/'}
          title={SITE_CONTENT.homeTitle}
          className="mr-auto flex flex-col rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <span className="font-display text-lg leading-none font-bold tracking-tight text-primary">
            {SITE_CONTENT.brand}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {SITE_CONTENT.serviceTagline}
          </span>
        </Link>

        {links ? (
          <nav aria-label={SITE_CONTENT.menu} className="hidden gap-1 md:flex">
            {links}
          </nav>
        ) : null}

        <div className="hidden items-center gap-1 md:flex">
          {account ?? (
            <QuickAccessLink href="/login" icon={RiAccountCircleLine}>
              {SITE_CONTENT.signIn}
            </QuickAccessLink>
          )}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? SITE_CONTENT.close : SITE_CONTENT.menu}
          onClick={() => setOpen((shown) => !shown)}
          className="rounded-[var(--radius-md)] p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:hidden"
        >
          {open ? (
            <RiCloseLine aria-hidden className="size-5" />
          ) : (
            <RiMenuLine aria-hidden className="size-5" />
          )}
        </button>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className="border-t border-border px-4 py-3 md:hidden"
      >
        {links ? (
          <nav aria-label={SITE_CONTENT.menu} className="flex flex-col gap-1">
            {links}
          </nav>
        ) : null}
        <div className="mt-2 flex flex-col items-start gap-1">
          {account ?? (
            <QuickAccessLink href="/login" icon={RiAccountCircleLine}>
              {SITE_CONTENT.signIn}
            </QuickAccessLink>
          )}
        </div>
      </div>
    </header>
  );
}
