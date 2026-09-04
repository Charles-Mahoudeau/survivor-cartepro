'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavItem } from './nav-items';

export function isActive(pathname: string, href: string, home: string) {
  return href === home ? pathname === home : pathname.startsWith(href);
}

export function SidebarNav({
  items,
  home,
}: {
  items: NavItem[];
  home: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
    >
      {items.map(({ href, label, icon }) => {
        const active = isActive(pathname, href, home);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left font-display text-sm font-medium transition-colors ${
              active
                ? 'bg-[color:var(--secondary)] text-[color:var(--primary)]'
                : 'text-[color:var(--foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--primary)]'
            }`}
          >
            <span
              className={
                active
                  ? 'text-[color:var(--primary)]'
                  : 'text-[color:var(--muted-foreground)]'
              }
            >
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ items, home }: { items: NavItem[]; home: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[color:var(--border)] bg-[color:var(--card)] px-2 py-2 md:hidden"
    >
      <div className="flex w-full justify-around">
        {items.map(({ href, shortLabel, icon }) => {
          const active = isActive(pathname, href, home);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-[56px] flex-col items-center gap-1 rounded px-3 py-1.5 transition-colors ${
                active
                  ? 'text-[color:var(--primary)]'
                  : 'text-[color:var(--muted-foreground)]'
              }`}
            >
              {icon}
              <span className="font-display text-[10px] font-medium">
                {shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
