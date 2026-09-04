import { BlocMarque } from '@/components/composites/brand-block';

import type { NavItem } from './nav-items';
import { MobileNav, SidebarNav } from './nav.client';
import { SidebarSignOut } from './sign-out.client';
import { SidebarUser } from './user';

interface DashboardChromeProps {
  items: NavItem[];
  home: string;
  user: { name: string; roleLabel: string };
}

/**
 * The fixed chrome of a space: the 240px sidebar on `md:`, the top bar and
 * the bottom tab bar below. Positioning matches the mockup's `AppShell`.
 */
export function DashboardChrome({ items, home, user }: DashboardChromeProps) {
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[240px] flex-col border-r border-[color:var(--border)] bg-[color:var(--card)] md:flex">
        <div className="border-b border-[color:var(--border)] px-5 py-5">
          <BlocMarque />
        </div>
        <SidebarNav items={items} home={home} />
        <div className="border-t border-[color:var(--border)] px-5 py-4">
          <SidebarUser name={user.name} roleLabel={user.roleLabel} />
          <SidebarSignOut variant="sidebar" />
        </div>
      </aside>

      <MobileNav items={items} home={home} />

      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--card)] py-3 pl-6 pr-4 md:hidden">
        <BlocMarque compact />
        <SidebarSignOut variant="header" />
      </header>
    </>
  );
}
