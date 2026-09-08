import type { ReactNode } from 'react';

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
 * The bar of the space: the sidebar toggle and the trail to the current page.
 * It sits on the left edge of the inset, independent of the content grid.
 */
export function LayoutBreadcrumb({ path }: { path: LayoutBreadcrumbPath[] }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {path.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              <BreadcrumbItem>
                {index === path.length - 1 ? (
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
              {path[index + 1] ? <BreadcrumbSeparator /> : null}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
