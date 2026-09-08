import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

/**
 * Sidebar and breadcrumb are parallel routes, so the shell paints while the
 * page streams. The role gate reads the session behind its own boundary,
 * beside the page rather than around it; the API enforces the role anyway.
 */
export default function Layout({
  children,
  sidebar,
  breadcrumb,
}: LayoutProps<'/pro'>) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="md:peer-data-[variant=inset]:shadow-none">
        {breadcrumb}
        <div
          id="contenu"
          className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-x-6 gap-y-8 px-4 pb-10 lg:px-6"
        >
          <div className="col-span-12">
            <BandeauSimulation />
          </div>
          <Suspense fallback={null}>
            <RoleGate role={ROLES.PARTNER} />
          </Suspense>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
