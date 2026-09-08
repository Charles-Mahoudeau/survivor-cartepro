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

/** The trail to the current page: it names the page, so no page repeats it. */
export function LayoutBreadcrumb({ path }: { path: LayoutBreadcrumbPath[] }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 lg:px-6">
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
