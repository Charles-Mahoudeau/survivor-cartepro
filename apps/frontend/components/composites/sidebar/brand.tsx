import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SITE_CONTENT } from '@/content/site';

/** The head of the sidebar: mark, product name, and what the space is. */
export function SidebarBrand({ description }: { description: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl p-2">
      <Avatar className="size-8 rounded-xl">
        <AvatarFallback className="bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
          {SITE_CONTENT.brand.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 pl-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{SITE_CONTENT.brand}</span>
        <span className="text-muted-foreground truncate text-xs">
          {description}
        </span>
      </div>
    </div>
  );
}
