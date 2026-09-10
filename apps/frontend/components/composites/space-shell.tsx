import { Suspense, type ReactNode } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * The frame of a space, written once: the sidebar beside the inset, the bar of
 * the space at the top of it, the twelve-column grid a page places sections
 * on.
 */
export function SpaceShell({
  sidebar,
  breadcrumb,
  children,
}: {
  sidebar: ReactNode;
  breadcrumb: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Both slots mark the active entry from the path, which a dynamic
          route only knows at request time. */}
      <Suspense fallback={null}>{sidebar}</Suspense>
      <SidebarInset className="md:peer-data-[variant=inset]:shadow-none">
        <Suspense fallback={null}>{breadcrumb}</Suspense>
        <div
          id="contenu"
          className="grid w-full max-w-6xl grid-cols-12 gap-x-6 gap-y-8 p-4 pt-0 pb-20 md:pb-4 lg:p-6 lg:pt-0"
        >
          <div className="col-span-12">
            <BandeauSimulation />
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
