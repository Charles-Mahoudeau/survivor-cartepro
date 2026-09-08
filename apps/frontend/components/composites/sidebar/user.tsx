import { RiLogoutBoxRLine } from '@remixicon/react';

import { SignOutMenuButton } from '@/components/composites/sidebar/sign-out.client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/auth/session';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** The only part of the sidebar that reads the session, so it streams alone. */
export async function SidebarUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SignOutMenuButton icon={<RiLogoutBoxRLine />} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
