import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ROLES } from '@/lib/auth/constants';
import { RoleGate } from '@/lib/auth/role-gate';

export default function Layout({
  children,
  sidebar,
  breadcrumb,
}: LayoutProps<'/admin'>) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        {breadcrumb}
        <BandeauSimulation />
        <main id="contenu" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Suspense fallback={null}>
            <RoleGate role={ROLES.ADMIN} />
          </Suspense>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
