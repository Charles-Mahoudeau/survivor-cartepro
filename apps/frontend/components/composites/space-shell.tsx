import type { ReactNode } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * The frame of a space, written once: the sidebar beside the inset, the bar of
 * the space at the top of it, and the twelve-column grid a page places
 * sections on. Both slots come from the space, so each one fills them from its
 * own segment.
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
      {sidebar}
      <SidebarInset className="md:peer-data-[variant=inset]:shadow-none">
        {breadcrumb}
        <div
          id="contenu"
          className="grid w-full max-w-6xl grid-cols-12 gap-x-6 gap-y-8 px-4 pb-10 lg:px-6"
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
