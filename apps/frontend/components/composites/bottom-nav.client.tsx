'use client';

import Link from 'next/link';

import type { SidebarGroupData } from '@/components/ui/sidebar';
import { SITE_CONTENT } from '@/content/site';

/** The navigation of a space as a phone tab bar, shown where the sidebar folds away. */
export function BottomNav({
  groups,
  isActive,
}: {
  groups: SidebarGroupData[];
  isActive: (href: string) => boolean;
}) {
  const items = groups.flatMap((group) => group.items);

  return (
    <nav
      aria-label={SITE_CONTENT.navigation}
      data-slot="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const current = isActive(item.href);
          const inSection =
            item.subItems?.some((subItem) => isActive(subItem.href)) ?? false;
          const ariaCurrent = current ? 'page' : inSection ? 'true' : undefined;

          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                aria-current={ariaCurrent}
                aria-disabled={item.disabled}
                data-active={current || inSection}
                className="relative flex h-16 flex-col items-center justify-center gap-1 px-1 text-center text-xs leading-tight text-muted-foreground outline-hidden before:absolute before:inset-x-6 before:top-0 before:h-0.5 before:rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[active=true]:font-medium data-[active=true]:text-foreground data-[active=true]:before:bg-primary [&_svg]:size-5 [&_svg]:shrink-0"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
