import { Fragment, type ReactNode } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export interface LayoutBreadcrumbPath {
  title: string;
  href: string;
  badge?: ReactNode;
}

/**
 * The bar of a space, taken from the shadcn sidebar block: toggle, rule, trail.
 * It sits on the left edge of the inset and shrinks with the sidebar.
 */
export function LayoutBreadcrumb({ path }: { path: LayoutBreadcrumbPath[] }) {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {path.map((item, index) => {
              const last = index === path.length - 1;

              return (
                <Fragment key={item.href}>
                  <BreadcrumbItem
                    className={last ? undefined : 'hidden md:block'}
                  >
                    {last ? (
                      <BreadcrumbPage>
                        {item.title}
                        {item.badge}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>
                        {item.title}
                        {item.badge}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {last ? null : (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
