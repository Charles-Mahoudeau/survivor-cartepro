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

/** The top bar of a space: sidebar toggle, then the trail to the current page. */
export function LayoutBreadcrumb({ path }: { path: LayoutBreadcrumbPath[] }) {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
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
      </div>
    </header>
  );
}
