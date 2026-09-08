import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * The employee shell. Sidebar and breadcrumb are parallel routes, so they paint
 * with the layout while the page streams its own skeletons. The role gate reads
 * the session behind its own boundary, beside the page rather than around it,
 * and redirects a wrong role as soon as the session resolves. The API enforces
 * the role on every read regardless.
 */
export default function Layout({
  children,
  sidebar,
  breadcrumb,
}: LayoutProps<'/me'>) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        {breadcrumb}
        <BandeauSimulation />
        <main id="contenu" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Suspense fallback={null}>
            <RoleGate role={ROLES.EMPLOYEE} />
          </Suspense>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
