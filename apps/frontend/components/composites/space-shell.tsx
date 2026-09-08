import type { ReactNode } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SITE_CONTENT } from '@/content/site';

/**
 * The frame of a space, written once: the sidebar beside the inset, the bar of
 * the space at the top of it, the twelve-column grid a page places sections
 * on, and the disclaimer at the foot of that same inset — outside it, the
 * sidebar shell is a full viewport tall and the line is never reached.
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
          className="grid w-full max-w-6xl grid-cols-12 gap-x-6 gap-y-8 p-4 pt-0 lg:p-6 lg:pt-0"
        >
          <div className="col-span-12">
            <BandeauSimulation />
          </div>
          {children}
        </div>
        <footer className="mt-auto p-4 pt-8 lg:p-6 lg:pt-10">
          <p className="text-muted-foreground text-xs">
            {SITE_CONTENT.disclaimer}
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
